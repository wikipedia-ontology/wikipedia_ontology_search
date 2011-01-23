package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import com.hp.hpl.jena.sparql.lib.org.json.JSONArray;
import com.hp.hpl.jena.sparql.lib.org.json.JSONException;
import com.hp.hpl.jena.sparql.lib.org.json.JSONObject;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.InstanceStatistics;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.ClassImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.InstanceImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.SPARQLQueryMaker;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import net.java.ao.EntityManager;
import net.java.ao.Query;
import org.apache.wicket.IRequestTarget;
import org.apache.wicket.PageParameters;
import org.apache.wicket.RequestCycle;

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

    private String getInstanceListJSonString(int start, int limit) {
        try {
            EntityManager em = WikipediaOntologyStorage.getEntityManager();
//            Query query = Query.select().order("name desc").limit(limit).offset(start);
            Query query = Query.select().limit(limit).offset(start);
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
            int numberOfInstances = em.find(InstanceStatistics.class, Query.select()).length;
            rootObj.put("numberOfInstances", numberOfInstances);
            return rootObj.toString();
        } catch (SQLException sqle) {
            sqle.printStackTrace();
        } catch (JSONException jsonexp) {
            jsonexp.printStackTrace();
        }
        return "[]";
    }

    private String getHashCode(int start, int limit, String instanceName) {
        int hashCode = 0;
        hashCode += ("start=" + start).hashCode();
        hashCode += ("limit=" + limit).hashCode();
        hashCode += ("instance=" + instanceName).hashCode();
        return Integer.toString(hashCode);
    }

    public InstanceListPage(PageParameters params) {
        String outputString = null;
        if (params.containsKey("instance")) {
            String instanceName = params.getString("instance");
            String hashCode = getHashCode(0, 0, instanceName);
            outputString = WikipediaOntologyUtils.getStringFromMemcached(hashCode);
            if (outputString == null) {
                outputString = getTypeListJSonString(instanceName);
                WikipediaOntologyUtils.addStringToMemcached(hashCode, outputString);
            }
        } else if (params.containsKey("limit") & params.containsKey("start")) {
            int start = params.getInt("start");
            int limit = params.getInt("limit");
            String hashCode = getHashCode(start, limit, "instance_list");
            outputString = WikipediaOntologyUtils.getStringFromMemcached(hashCode);
            if (outputString == null) {
                outputString = getInstanceListJSonString(start, limit);
                WikipediaOntologyUtils.addStringToMemcached(hashCode, outputString);
            }
        } else {
            outputString = "[]";
        }
        outputResource(outputString);
    }
}
