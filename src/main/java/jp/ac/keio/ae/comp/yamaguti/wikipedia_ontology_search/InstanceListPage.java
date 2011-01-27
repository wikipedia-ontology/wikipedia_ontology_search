package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.InstanceStatistics;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.ClassImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.InstanceImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.OrderByType;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.SearchOptionType;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.ResourceSearchUtils;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.SPARQLQueryMaker;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import net.java.ao.EntityManager;
import net.java.ao.Query;
import org.apache.wicket.IRequestTarget;
import org.apache.wicket.PageParameters;
import org.apache.wicket.RequestCycle;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.sql.SQLException;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @author Takeshi Morita
 *         Date: 11/01/22 22:36
 */
public class InstanceListPage extends CommonPage {

    private void outputResource(final String outputString) {
        getRequestCycle().setRequestTarget(new IRequestTarget() {
            public void respond(RequestCycle requestCycle) {
                requestCycle.getResponse().setContentType("application/json; charset=utf-8");
                requestCycle.getResponse().write(outputString);
            }

            public void detach(RequestCycle requestCycle) {
            }
        });
    }

    private String getTypeListJSonString(String instanceName) {
        String uri = WikipediaOntologyStorage.INSTANCE_NS + instanceName;
        String queryString = SPARQLQueryMaker.getTypesOfInstanceQueryString(uri);
        List<ClassImpl> clsList = WikipediaOntologyUtils.getClassImplList(queryString, "ja");
        try {
            JSONObject rootObj = new JSONObject();
            JSONArray jsonArray = new JSONArray();
            for (ClassImpl c : clsList) {
                try {
                    JSONObject jsonObj = new JSONObject();
                    jsonObj.put("type", c.getClassName());
                    jsonArray.put(jsonObj);
                } catch (JSONException jsonExp) {
                    jsonExp.printStackTrace();
                }
            }
            rootObj.put("instance_type_list", jsonArray);
            int numberOfInstances = clsList.size();
            rootObj.put("numberOfTypes", numberOfInstances);
            return rootObj.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (Exception e) {
            return "[]";
        }
        return "[]";
    }

    private String getInstanceListJSonString(String keyword, int start, int limit,
                                             OrderByType orderByType, SearchOptionType searchOptionType) {
        try {
            EntityManager em = WikipediaOntologyStorage.getEntityManager();

            Query query = Query.select().limit(limit).offset(start);
            int numberOfInstances = 0;

            String orderBy = "name asc";
            switch (orderByType) {
                case NAME_ASC:
                    orderBy = "name asc";
                    break;
                case NAME_DESC:
                    orderBy = "name desc";
                    break;
            }
            query = query.order(orderBy);

            String clause = "name like ?";
            String value = "";
            switch (searchOptionType) {
                case EXACT_MATCH:
                    value = keyword;
                    clause = "name = ?";
                    break;
                case ANY_MATCH:
                    value = "%" + keyword + "%";
                    break;
                case STARTS_WITH:
                    value = keyword + "%";
                    break;
                case ENDS_WITH:
                    value = "%" + keyword;
                    break;
                default:
                    clause = "";
                    break;
            }

            if (clause.isEmpty() || keyword.isEmpty()) {
                numberOfInstances = em.count(InstanceStatistics.class, Query.select());
            } else {
                query = query.where(clause, value);
                numberOfInstances = em.count(InstanceStatistics.class, Query.select().where(clause, value));
            }

            JSONObject rootObj = new JSONObject();
            JSONArray jsonArray = new JSONArray();
            for (InstanceStatistics i : em.find(InstanceStatistics.class, query)) {
                InstanceImpl instance = new InstanceImpl(i);
                try {
                    JSONObject jsonObj = new JSONObject();
                    jsonObj.put("instance", instance.getInstanceName());
                    jsonArray.put(jsonObj);
                } catch (JSONException jsonExp) {
                    jsonExp.printStackTrace();
                }
            }
            rootObj.put("instance_list", jsonArray);
            rootObj.put("numberOfInstances", numberOfInstances);
            return rootObj.toString();
        } catch (SQLException sqle) {
            sqle.printStackTrace();
        } catch (JSONException jsonexp) {
            jsonexp.printStackTrace();
        }
        return "[]";
    }


    public InstanceListPage(PageParameters params) {
        String outputString = null;
        if (params.containsKey("instance")) {
            String instanceName = params.getString("instance");
            String hashCode = ResourceSearchUtils.getHashCode(0, 0, "keyword", instanceName, "", "");
            outputString = WikipediaOntologyUtils.getStringFromMemcached(hashCode);
            if (outputString == null) {
                outputString = getTypeListJSonString(instanceName);
                WikipediaOntologyUtils.addStringToMemcached(hashCode, outputString);
            }
        } else if (params.containsKey("limit") & params.containsKey("start")) {
            int start = params.getInt("start");
            int limit = params.getInt("limit");

            String orderBy = params.getString("order_by", "instance_count_desc");
            if (params.containsKey("keyword")) {
                String keyword = params.getString("keyword");
                String searchOption = params.getString("search_option", "exact_match");

                String hashCode = ResourceSearchUtils.getHashCode(start, limit, "keyword", keyword, orderBy, searchOption);
                outputString = WikipediaOntologyUtils.getStringFromMemcached(hashCode);
                if (outputString == null) {
                    outputString = getInstanceListJSonString(keyword, start, limit,
                            ResourceSearchUtils.getOrderByType(orderBy), ResourceSearchUtils.getSearchOptionType(searchOption));
                    WikipediaOntologyUtils.addStringToMemcached(hashCode, outputString);
                }
            } else {
                String hashCode = ResourceSearchUtils.getHashCode(start, limit, "instance_list", "instance_list", orderBy, "");
                outputString = WikipediaOntologyUtils.getStringFromMemcached(hashCode);
                if (outputString == null) {
                    outputString = getInstanceListJSonString("", start, limit,
                            ResourceSearchUtils.getOrderByType(orderBy), SearchOptionType.NONE);
                    WikipediaOntologyUtils.addStringToMemcached(hashCode, outputString);
                }
            }
        } else {
            outputString = "[]";
        }
        outputResource(outputString);
    }
}
