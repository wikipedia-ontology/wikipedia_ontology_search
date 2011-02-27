/*
 * @(#)  2010/02/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.FileManager;
import com.hp.hpl.jena.vocabulary.RDFS;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.ClassStatistics;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;
import net.java.ao.EntityManager;
import net.java.ao.Query;
import org.apache.wicket.IRequestTarget;
import org.apache.wicket.PageParameters;
import org.apache.wicket.RequestCycle;
import org.apache.wicket.ResourceReference;
import org.apache.wicket.ajax.markup.html.navigation.paging.AjaxPagingNavigator;
import org.apache.wicket.behavior.SimpleAttributeModifier;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.image.Image;
import org.apache.wicket.markup.html.link.ExternalLink;
import org.apache.wicket.markup.html.list.ListItem;
import org.apache.wicket.markup.html.list.ListView;
import org.apache.wicket.markup.repeater.Item;
import org.apache.wicket.markup.repeater.data.DataView;
import org.apache.wicket.markup.repeater.data.IDataProvider;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.PropertyModel;

import java.io.*;
import java.sql.SQLException;
import java.util.*;

/**
 * @author takeshi morita
 */
public class ResourcePage extends CommonPage implements Serializable {

    public static void main(String[] args) throws Exception {
        WikipediaOntologySearch wikiOntSearch = new WikipediaOntologySearch();
        Model ontModel = FileManager.get().loadModel("C:/Users/t_morita/wikipedia_ontology/ALLClasses.owl");
        String str = wikiOntSearch.getTreeJSONString(ontModel);
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File("C:/Users/t_morita/wikipedia_ontology/ALLClasses.json")), "UTF-8"));
        writer.write(str);
        writer.close();
    }

    public ResourcePage(PageParameters params) {
        String resourceType = getRequestCycle().getRequest().getPath().split("/")[0];
        params.put("resource_type", resourceType);
        SearchParameters searchParams = new SearchParameters(params);
//        System.out.println(searchParams);
        if (!searchParams.isValidRequest()) {
            params.put("search_parameters", searchParams);
            setResponsePage(ErrorPage.class, params);
        }
        String outputString = WikipediaOntologyUtils.getStringFromMemcached(searchParams.getKey());
        if (outputString != null) {
            System.out.println("Memcached: " + searchParams.getKey() + ": " + outputString.length());
            outputResource(searchParams.getMIMEHeader(), outputString);
            return;
        } else {
            System.out.println("memcached: cash does not exist.");
        }
        WikipediaOntologySearch wikiOntSearch = new WikipediaOntologySearch(searchParams);
        Model outputModel = getOutputModel(wikiOntSearch, searchParams);
        long numberOfStatements = outputModel.size();
        if (searchParams.getSearchOption() == SearchOptionType.INSTANCES_OF_CLASS) {
            try {
                String clsName = searchParams.getResourceName();
                EntityManager em = WikipediaOntologyStorage.getEntityManager();
                for (ClassStatistics c : em.find(ClassStatistics.class, Query.select().where("classname = ?", clsName))) {
                    numberOfStatements = c.getInstanceCount();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        } else {
            outputModel = getSubOutputModel(outputModel, wikiOntSearch.getSearchParameters());
        }

        wikiOntSearch.closeDB();
        output(outputModel, wikiOntSearch, numberOfStatements);
    }

    private static final String ALL_CLASSES = "E:/Users/t_morita/wikipedia_ontology/ALLClasses.owl";

    public Model getOutputModel(WikipediaOntologySearch wikiOntSearch, SearchParameters searchParams) {
        String lang = wikiOntSearch.setTDBModel();

        String rdfString = WikipediaOntologyUtils.getStringFromMemcached(searchParams.getRDFKey());
        if (rdfString != null) {
            return WikipediaOntologyUtils.readRDFString(rdfString);
        }
        Set<String> typeSet = searchParams.getTypeSet();
        SearchOptionType searchOptionType = searchParams.getSearchOption();
        if (searchParams.getResourceName().equals("ALLClasses")) {
            System.out.println("ALLClasses");
            return FileManager.get().loadModel(ALL_CLASSES);
        }


        if (0 < typeSet.size()) {
            String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_types.tmpl");
            String queryString = SPARQLQueryMaker.getTypeSetQueryString(searchParams, sparqlTemplateString);
            return wikiOntSearch.getTypesResults(queryString);
        }

        String queryString = "";
        if (searchParams.getResourceType() == ResourceType.CLASS
                && (searchOptionType == SearchOptionType.SIBLINGS || searchOptionType == SearchOptionType.SUB_CLASSES)) {
            String sparqlTemplateString = "";
            switch (searchOptionType) {
                case SUB_CLASSES:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_sub_classes.tmpl");
                    break;
                case SIBLINGS:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_sibling_classes.tmpl");
                    break;
            }
            queryString = SPARQLQueryMaker.getSiblingAndSubClassesQueryString(searchParams, sparqlTemplateString);
            wikiOntSearch.setQueryResultsForClasses(queryString);
        } else if (searchParams.getResourceType() == ResourceType.CLASS && searchOptionType == SearchOptionType.INSTANCES_OF_CLASS) {
            int limit = searchParams.getLimit();
            int start = searchParams.getStart();
            String uri = WikipediaOntologyStorage.CLASS_NS + searchParams.getResourceName();
            queryString = SPARQLQueryMaker.getIntancesOfClassQueryString(uri, limit, start);
            List<InstanceImpl> instanceList = WikipediaOntologyUtils.getInstanceImplList(queryString, "ja");
            return wikiOntSearch.getInstancesOfClassQueryResults(uri, instanceList);
        } else if (searchParams.getResourceType() == ResourceType.CLASS
                && (searchOptionType == SearchOptionType.PROPERTIES_OF_DOMAIN_CLASS || searchOptionType == SearchOptionType.PROPERTIES_OF_RANGE_CLASS)) {
            String sparqlTemplateString = "";
            switch (searchOptionType) {
                case PROPERTIES_OF_DOMAIN_CLASS:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_properties_of_domain_class.tmpl");
                    break;
                case PROPERTIES_OF_RANGE_CLASS:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_properties_of_range_class.tmpl");
                    break;
            }
            queryString = SPARQLQueryMaker.getPropertiesOfRegionClassQueryString(searchParams, sparqlTemplateString);
            wikiOntSearch.setQueryResultsForProperties(queryString);
        } else if (searchParams.getResourceType() == ResourceType.CLASS && searchOptionType == SearchOptionType.PATH_TO_ROOT_CLASS) {
            return wikiOntSearch.getPathToRootClassQueryResults();
        } else if (searchParams.getResourceType() == ResourceType.PROPERTY
                && (searchOptionType == SearchOptionType.DOMAIN_CLASSES_OF_PROPERTY || searchOptionType == SearchOptionType.RANGE_CLASSES_OF_PROPERTY)) {
            String sparqlTemplateString = "";
            switch (searchOptionType) {
                case DOMAIN_CLASSES_OF_PROPERTY:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_domain_classes_of_property.tmpl");
                    break;
                case RANGE_CLASSES_OF_PROPERTY:
                    sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_range_classes_of_property.tmpl");
                    break;
            }
            queryString = SPARQLQueryMaker.getRegionClassesOfPropertyQueryString(searchParams, sparqlTemplateString);
            wikiOntSearch.setQueryResultsForClasses(queryString);
        } else if (searchParams.getResourceType() == ResourceType.INSTANCE && searchOptionType == SearchOptionType.TYPES_OF_INSTANCE) {
            String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_types_of_instance.tmpl");
            String uri = WikipediaOntologyStorage.INSTANCE_NS + searchParams.getResourceName();
            queryString = SPARQLQueryMaker.getTypesOfInstanceQueryString(uri);
            List<ClassImpl> typeList = WikipediaOntologyUtils.getClassImplList(queryString, "ja");
            return wikiOntSearch.getTypesOfInstanceQueryResults(uri, typeList);
        } else if (searchOptionType == SearchOptionType.INVERSE_STATEMENTS) {
            String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_inverse_statements.tmpl");
            queryString = SPARQLQueryMaker.getInverseStatementsQueryString(searchParams, sparqlTemplateString);
            return wikiOntSearch.getInverseStatementsQueryResults(queryString);
        } else {
            if (searchParams.getSearchTarget() == SearchTargetType.LABEL) {
                String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_resource_by_label.tmpl");
                queryString = SPARQLQueryMaker.getResourceByLabelQueryString(searchParams, sparqlTemplateString);
                return wikiOntSearch.getResourceByLabelQueryResults(lang, queryString);
            } else {
                String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class, "sparql_templates/query_resource_by_uri.tmpl");
                queryString = SPARQLQueryMaker.getResourceByURIQueryString(searchParams, sparqlTemplateString);
                return wikiOntSearch.getResourceByURIQueryResults(queryString);
            }
        }

        return wikiOntSearch.getOutputModel();
    }

    class StatementSorter implements Comparator<Statement>, Serializable {
        public int compare(Statement stmt1, Statement stmt2) {
            String stmtStr1 = stmt1.getSubject().toString();
            String stmtStr2 = stmt2.getSubject().toString();
            return stmtStr1.compareTo(stmtStr2);
        }
    }

    private Model getSubOutputModel(Model outputModel, SearchParameters searchParameters) {
        int start = searchParameters.getStart();
        int limit = searchParameters.getLimit();
        Model subOutputModel = ModelFactory.createDefaultModel();
        if (limit != 0) {
            long end = start + limit;
            if (outputModel.size() < start + limit) {
                end = outputModel.size();
            }
            List<Statement> orgList = outputModel.listStatements().toList();
            Collections.sort(orgList, new StatementSorter());
            List<Statement> stmtList = orgList.subList(start, (int) end);
            subOutputModel.add(stmtList);
        } else {
            subOutputModel = outputModel;
        }

        return subOutputModel;
    }

    private Resource getPageResource(String resName, ResourceType resType) {
        String ns = "";
        switch (resType) {
            case CLASS:
                ns = WikipediaOntologyStorage.CLASS_NS;
                addIconImageWithAlt("class_icon_m", "クラス");
                break;
            case PROPERTY:
                ns = WikipediaOntologyStorage.PROPERTY_NS;
                addIconImageWithAlt("property_icon_m", "プロパティ");
                break;
            case INSTANCE:
                ns = WikipediaOntologyStorage.INSTANCE_NS;
                addIconImageWithAlt("instance_icon_m", "インスタンス");
                break;
        }
        return ResourceFactory.createResource(ns + resName);
    }

    private Image getImage(String id, String path) {
        return new Image(id, new ResourceReference(ResourcePage.class, path));
    }

    private void addIconImageWithAlt(String icon, String altLabel) {
        Image resIcon = getImage("resource_icon", "my_resources/icons/" + icon + ".png");
        resIcon.add(new SimpleAttributeModifier("alt", altLabel));
        add(resIcon);
    }

    private ExternalLink getExternalLink(String id, String url) {
        return new ExternalLink(id, url);
    }

    private void setLinks(String resName, Resource uri, SearchParameters searchParams) {
        boolean isUseInfModel = searchParams.isUseInfModel();
        String resourceType = searchParams.getResourceType().toString().toLowerCase();
        add(new ExternalLink("page_uri", uri.getURI(), uri.getURI()));
        String baseURL = WikipediaOntologyStorage.ONTOLOGY_NS + resourceType + "/";
        String htmlURL = baseURL + "page/" + resName + ".html";
        String inferenceType = "";
        String inferenceURL = htmlURL;
        String inferenceTypeLabel = "Reasoner: None -> RDFS";
        if (isUseInfModel) {
            inferenceType = "?inference_type=rdfs";
            inferenceTypeLabel = "Reasoner: RDFS -> None";
        } else {
            inferenceURL += "?inference_type=rdfs";
        }
        ExternalLink inferenceTypeLink = new ExternalLink("inference_type", inferenceURL, inferenceTypeLabel);
        add(inferenceTypeLink);
        ExternalLink htmlLink = getExternalLink("html_url", htmlURL + inferenceType);
        htmlLink.add(getImage("html_icon", "my_resources/icons/html.png"));
        add(htmlLink);
        String dataURL = baseURL + "data/" + resName + ".rdf";
        ExternalLink rdfLink = getExternalLink("xml_url", dataURL + inferenceType);
        rdfLink.add(getImage("rdf_icon", "my_resources/icons/rdf_w3c_icon.16.png"));
        add(rdfLink);

        dataURL = baseURL + "data/" + resName + ".n3";
        rdfLink = getExternalLink("n3_url", dataURL + inferenceType);
        rdfLink.add(getImage("rdf_icon", "my_resources/icons/rdf_w3c_icon.16.png"));
        add(rdfLink);

        dataURL = baseURL + "data/" + resName + ".nt";
        rdfLink = getExternalLink("nt_url", dataURL + inferenceType);
        rdfLink.add(getImage("rdf_icon", "my_resources/icons/rdf_w3c_icon.16.png"));
        add(rdfLink);

        String jsonTableURL = baseURL + "data/" + resName + ".json";
        ExternalLink jsonTableLink = getExternalLink("json_grid_url", jsonTableURL + inferenceType);
        jsonTableLink.add(getImage("grid_icon", "my_resources/icons/table.png"));
        add(jsonTableLink);
        String jsonTreeURL = baseURL + "data/" + resName + ".json";
        ExternalLink jsonTreeLink = getExternalLink("json_tree_url", jsonTreeURL + inferenceType);
        jsonTreeLink.add(getImage("tree_icon", "my_resources/icons/expand-all.gif"));
        add(jsonTreeLink);
    }

    private IDataProvider<RDFNodeImpl> getIDataProvider(final List<RDFNodeImpl> instanceList,
                                                        final PagingData pagingData) {
        return new IDataProvider<RDFNodeImpl>() {

            public void detach() {
            }

            public int size() {
                return instanceList.size();
            }

            public IModel<RDFNodeImpl> model(RDFNodeImpl object) {
                return new org.apache.wicket.model.Model<RDFNodeImpl>(object);
            }

            public Iterator<? extends RDFNodeImpl> iterator(int first, int count) {
                pagingData.setStart(first + 1);
                pagingData.setEnd(first + count);
                return instanceList.subList(first, first + count).iterator();
            }
        };
    }

    private void setInstanceList(Map<PropertyImpl, List<RDFNodeImpl>> propertyRDFNodeMap,
                                 PropertyImpl instancePropertyImpl) {
        WebMarkupContainer instanceListContainer = new WebMarkupContainer("instance_list_block");
        add(instanceListContainer);
        if (propertyRDFNodeMap.get(instancePropertyImpl) != null) {
            instanceListContainer.setVisible(true);
            List<RDFNodeImpl> instanceList = propertyRDFNodeMap.get(instancePropertyImpl);
            int instanceCount = instanceList.size();
            PagingData pagingData = new PagingData(0, 0, instanceCount);
            instanceListContainer.add(new Label("start", new PropertyModel<Integer>(pagingData, "start")));
            instanceListContainer.add(new Label("end", new PropertyModel<Integer>(pagingData, "end")));
            instanceListContainer.add(new Label("instance_count", new PropertyModel<Integer>(pagingData, "size")));

            Collections.sort(instanceList, new RDFNodeSorter());
            DataView<RDFNodeImpl> instanceListView = new DataView<RDFNodeImpl>("instance_list", getIDataProvider(
                    instanceList, pagingData), 20) {
                private static final long serialVersionUID = 1L;

                @Override
                protected void populateItem(Item<RDFNodeImpl> item) {
                    RDFNodeImpl instance = item.getModelObject();
                    item.add(new ExternalLink("instance_uri", instance.getURL(), WikipediaOntologyUtils
                            .getLocalName(ResourceFactory.createResource(instance.getURL()))));
                }
            };
            instanceListContainer.add(instanceListView);
            instanceListContainer.setOutputMarkupId(true);
            Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
            instanceListContainer.add(indicator);
            AjaxPagingNavigator navigator = new IndicatingAjaxPagingNavigator("paging", instanceListView, indicator);
            instanceListContainer.add(navigator);
        } else {
            instanceListContainer.setVisible(false);
        }
    }

    class RDFNodeSorter implements Comparator<RDFNodeImpl> {
        public int compare(RDFNodeImpl rn1, RDFNodeImpl rn2) {
            return rn1.getName().compareTo(rn2.getName());
        }
    }

    class PropertySorter implements Comparator<PropertyImpl> {
        public int compare(PropertyImpl p1, PropertyImpl p2) {
            return p1.getURI().compareTo(p2.getURI());
        }
    }

    private void setPropertyAndValueList(final Map<PropertyImpl, List<RDFNodeImpl>> propertyRDFNodeMap,
                                         final PropertyImpl instancePropertyImpl) {
        List<PropertyImpl> propertyList = Lists.newArrayList(propertyRDFNodeMap.keySet());
        Collections.sort(propertyList, new PropertySorter());

        add(new ListView<PropertyImpl>("property_list", propertyList) {
            private static final long serialVersionUID = 1L;

            protected void populateItem(ListItem<PropertyImpl> item) {
                PropertyImpl property = item.getModelObject();
                final List<RDFNodeImpl> rdfNodeList = propertyRDFNodeMap.get(property);
                Collections.sort(rdfNodeList, new RDFNodeSorter());

                WebMarkupContainer propertyListContainer = new WebMarkupContainer("property_and_value_list_block");
                item.add(propertyListContainer);
                propertyListContainer.setVisible(property != instancePropertyImpl);
                propertyListContainer.add(new ExternalLink("property_uri", property.getURI(), property.getName()))
                        .setRenderBodyOnly(true);
                propertyListContainer.add(new ListView<RDFNodeImpl>("property_and_value_list", rdfNodeList) {
                    private static final long serialVersionUID = 1L;

                    protected void populateItem(ListItem<RDFNodeImpl> item) {
                        WebMarkupContainer resourceObjectContainer = new WebMarkupContainer("resource_object_block");
                        WebMarkupContainer literalObjectContainer = new WebMarkupContainer("literal_object_block");
                        item.add(resourceObjectContainer);
                        item.add(literalObjectContainer);
                        RDFNodeImpl node = item.getModelObject();
                        resourceObjectContainer.setVisible(node.isResource());
                        literalObjectContainer.setVisible(node.isLiteral());
                        if (node.isLiteral()) {
                            literalObjectContainer.add(new Label("literal_object_name", node.getName())).setRenderBodyOnly(true);
                        } else if (node.isResource()) {
                            resourceObjectContainer.add(
                                    new ExternalLink("resource_object_uri", node.getURL(), node.getName())).setRenderBodyOnly(true);
                        }
                    }
                }).setRenderBodyOnly(true);
            }
        }).setRenderBodyOnly(true);
    }

    private void outputResource(final String contentType, final String outputString) {
        getRequestCycle().setRequestTarget(new IRequestTarget() {
            public void respond(RequestCycle requestCycle) {
                requestCycle.getResponse().setContentType(contentType + "; charset=utf-8");
                requestCycle.getResponse().write(outputString);
            }

            public void detach(RequestCycle requestCycle) {
            }
        });
    }

    private Map<PropertyImpl, List<RDFNodeImpl>> getPropertyRDFNodeMap(Model outputModel, Resource uri,
                                                                       PropertyImpl instancePropertyImpl) {

        Map<PropertyImpl, List<RDFNodeImpl>> propertyRDFNodeMap = Maps.newHashMap();
        for (StmtIterator i = outputModel.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            Resource subject = stmt.getSubject();
            RDFNodeImpl subjectImpl = getRDFNodeImpl(subject);
            RDFNode object = stmt.getObject();
            RDFNodeImpl objectImpl = getRDFNodeImpl(object);

            if (subject.equals(uri)) {
                Property predicate = stmt.getPredicate();
                PropertyImpl predicateImpl = new PropertyImpl(predicate.getURI(), WikipediaOntologyUtils.getQname(predicate));
                if (propertyRDFNodeMap.get(predicateImpl) != null) {
                    List<RDFNodeImpl> rdfNodeSet = propertyRDFNodeMap.get(predicateImpl);
                    rdfNodeSet.add(objectImpl);
                } else {
                    List<RDFNodeImpl> rdfNodeSet = Lists.newArrayList();
                    rdfNodeSet.add(objectImpl);
                    propertyRDFNodeMap.put(predicateImpl, rdfNodeSet);
                }
            } else if (object.equals(uri)) {
                if (propertyRDFNodeMap.get(instancePropertyImpl) != null) {
                    List<RDFNodeImpl> rdfNodeSet = propertyRDFNodeMap.get(instancePropertyImpl);
                    rdfNodeSet.add(subjectImpl);
                } else {
                    List<RDFNodeImpl> rdfNodeSet = Lists.newArrayList();
                    rdfNodeSet.add(subjectImpl);
                    propertyRDFNodeMap.put(instancePropertyImpl, rdfNodeSet);
                }
            }
        }
        return propertyRDFNodeMap;
    }

    private static RDFNodeImpl getRDFNodeImpl(RDFNode node) {
        if (node.isResource()) {
            Resource r = (Resource) node;
            return new RDFNodeImpl(WikipediaOntologyUtils.getQname(r), r.getURI(), r.isResource());
        }
        Literal l = (Literal) node;
        return new RDFNodeImpl(l.toString(), "", l.isResource());
    }

    private void output(Model outputModel, WikipediaOntologySearch wikiOntSearch, long numberOfStatements) {
        PropertyImpl instancePropertyImpl = new PropertyImpl(WikipediaOntologyStorage.INSTANCE_NS, "instanceProperty");
        SearchParameters searchParams = wikiOntSearch.getSearchParameters();
        switch (searchParams.getDataType()) {
            case PAGE:
                String resName = wikiOntSearch.getSearchParameters().getResourceName();
                add(new Label("title", resName).setRenderBodyOnly(true));
                Resource uri = getPageResource(resName, wikiOntSearch.getSearchParameters().getResourceType());
                setLinks(resName, uri, searchParams);
                Map<PropertyImpl, List<RDFNodeImpl>> propertyRDFNodeMap = getPropertyRDFNodeMap(outputModel, uri,
                        instancePropertyImpl);
                setInstanceList(propertyRDFNodeMap, instancePropertyImpl);
                setPropertyAndValueList(propertyRDFNodeMap, instancePropertyImpl);
                break;
            case XML:
                String rdf = WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV");
                outputResource("application/rdf+xml", rdf);
                WikipediaOntologyUtils.addStringToMemcached(searchParams.getKey(), rdf);
                break;
            case N3:
                String n3String = WikipediaOntologyUtils.getRDFString(outputModel, "N3");
                outputResource("application/n3", n3String);
                WikipediaOntologyUtils.addStringToMemcached(searchParams.getKey(), n3String);
                break;
            case NTRIPLE:
                String nt = WikipediaOntologyUtils.getRDFString(outputModel, "N-TRIPLE");
                outputResource("application/n-triples", nt);
                WikipediaOntologyUtils.addStringToMemcached(searchParams.getKey(), nt);
                break;
            case JSON:
            case JSONP:
                switch (searchParams.getExtJsJSonFormatType()) {
                    case GRID:
                        String jsonGrid = wikiOntSearch.getTableJSONString(outputModel, numberOfStatements);
                        outputResource("application/json", jsonGrid);
                        WikipediaOntologyUtils.addStringToMemcached(searchParams.getKey(), jsonGrid);
                        break;
                    case TREE:
                        String jsonTree = wikiOntSearch.getTreeJSONString(outputModel);
                        outputResource("application/json", jsonTree);
                        WikipediaOntologyUtils.addStringToMemcached(searchParams.getKey(), jsonTree);
                        break;
                }
                break;
        }
    }
}
