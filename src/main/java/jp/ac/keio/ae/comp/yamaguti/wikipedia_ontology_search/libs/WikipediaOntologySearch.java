package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.util.*;

import com.hp.hpl.jena.util.FileManager;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;

import com.google.common.collect.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.vocabulary.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/*
 * @(#)  2009/09/10
 */

/**
 * @author Takeshi Morita
 */
public class WikipediaOntologySearch {

    private Model dbModel;
    private SearchParameters searchParameters;
    private Set<Resource> resourceSet;
    private Set<Resource> typeSet;
    private WikipediaOntologyStorage wikiOntStrage;

    public WikipediaOntologySearch() {
        dbModel = getWikipediaOntologyAndInstanceModel("ja", "none");
    }

    public WikipediaOntologySearch(SearchParameters params) {
        searchParameters = params;
        resourceSet = new HashSet<Resource>();
        typeSet = new HashSet<Resource>();
    }

    public SearchParameters getSearchParameters() {
        return searchParameters;
    }

    public void setResourceType(ResourceType resType) {
        searchParameters.setResourceType(resType);
    }

    public Model getDBModel() {
        return dbModel;
    }

    private Model getWikipediaOntologyAndInstanceModel(String lang, String inferenceType) {
        wikiOntStrage = new WikipediaOntologyStorage(lang, inferenceType);
        return wikiOntStrage.getTDBModel();
    }

    public Model getTypesResults(String queryString) {
        Model outputModel = ModelFactory.createDefaultModel();
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = qs.getResource("resource");
                RDFNode label = qs.get("label");
                outputModel.add(resource, RDFS.label, label);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec == null) {
                qexec.close();
            }
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    public String setTDBModel() {
        WikipediaOntologyStorage.VERSION = searchParameters.getVersion();
        if (searchParameters.isUseInfModel()) {
            dbModel = getWikipediaOntologyAndInstanceModel("ja", "rdfs");
            return "ja";
        }
        if (!searchParameters.getResourceName().equals("q.json") &&
                !searchParameters.getResourceName().equals("q.jsonp") &&
                !searchParameters.getResourceName().equals("q.rdf") &&
                !searchParameters.getResourceName().equals("q.n3") &&
                !searchParameters.getResourceName().equals("q.nt") &&
                !searchParameters.getResourceName().equals("q") &&
                searchParameters.isEnglishResourceName()) {
            dbModel = getWikipediaOntologyAndInstanceModel("en", "");
            return "en";
        }
        dbModel = getWikipediaOntologyAndInstanceModel("ja", "");
        return "ja";
    }

    private QueryExecution getQueryExecution(String queryString) {
        Query query = QueryFactory.create(queryString);
        return QueryExecutionFactory.create(query, dbModel);
    }

    public void setQueryResultsForClasses(String queryString) {
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource cls = (Resource) qs.get("c");
                resourceSet.add(cls);
                typeSet.add(cls);
//                System.out.println(cls);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec != null) {
                qexec.close();
            }
        }
    }

    public Model getPathToRootClassQueryResults() {
        Model outputModel = ModelFactory.createDefaultModel();
        String clsName = searchParameters.getResourceName();
        Resource clsResource = ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + clsName);
        Model ontModel = wikiOntStrage.getTDBModel();
        addSuperClasses(ontModel, clsResource, outputModel);
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    private void addSuperClasses(Model ontModel, Resource clsResource, Model outputModel) {
        for (NodeIterator nodeIter = ontModel.listObjectsOfProperty(clsResource, RDFS.subClassOf); nodeIter.hasNext();) {
            RDFNode supClass = nodeIter.nextNode();
            outputModel.add(clsResource, RDFS.subClassOf, supClass);
            if (supClass.isResource()) {
                addSuperClasses(ontModel, (Resource) supClass, outputModel);
            }
        }
    }

    public void setQueryResultsForProperties(String queryString) {
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource property = (Resource) qs.get("p");
                resourceSet.add(property);
                typeSet.add(property);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec != null) {
                qexec.close();
            }
        }
    }

    public Model getTypesOfInstanceQueryResults(String instanceURI, List<ClassImpl> typeList) {
        Model outputModel = ModelFactory.createDefaultModel();
        Resource instance = ResourceFactory.createResource(instanceURI);
        for (ClassImpl c : typeList) {
            Resource type = ResourceFactory.createResource(c.getURI());
            outputModel.add(instance, RDF.type, type);
            typeSet.add(type);
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    public Model getInstancesOfClassQueryResults(String typeURI, List<InstanceImpl> instanceList) {
        Model outputModel = ModelFactory.createDefaultModel();
        Resource type = ResourceFactory.createResource(typeURI);
        typeSet.add(type);
        for (InstanceImpl i : instanceList) {
            Resource subject = ResourceFactory.createResource(i.getURI());
            outputModel.add(subject, RDF.type, type);
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    public Model getInverseStatementsQueryResults(String queryString) {
        Model outputModel = ModelFactory.createDefaultModel();
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResourceType resourceType = searchParameters.getResourceType();
            Resource resource = getResourceByType(resourceType);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource s = qs.getResource("s");
                Resource p = qs.getResource("p");
                outputModel.add(s, ResourceFactory.createProperty(p.getURI()), resource);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec != null) {
                qexec.close();
            }
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    private Resource getResourceByType(ResourceType resourceType) {
        String resName = searchParameters.getResourceName();
        Resource resource = null;
        switch (resourceType) {
            case CLASS:
                resource = ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + resName);
                break;
            case PROPERTY:
                resource = ResourceFactory.createResource(WikipediaOntologyStorage.PROPERTY_NS + resName);
                break;
            case INSTANCE:
                resource = ResourceFactory.createResource(WikipediaOntologyStorage.INSTANCE_NS + resName);
                break;
        }
        return resource;
    }

    public Model getResourceByURIQueryResults(String queryString) {
//        System.out.println(queryString);
        Model outputModel = ModelFactory.createDefaultModel();
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResourceType resourceType = searchParameters.getResourceType();
            Resource resource = getResourceByType(resourceType);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource p = qs.getResource("p");
                RDFNode o = qs.get("o");
                outputModel.add(resource, ResourceFactory.createProperty(p.getURI()), o);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec != null) {
                qexec.close();
            }
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    public Model getResourceByLabelQueryResults(String lang, String queryString) {
//        System.out.println(queryString);
        Model outputModel = ModelFactory.createDefaultModel();
        QueryExecution qexec = null;
        try {
            qexec = getQueryExecution(queryString);
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = qs.getResource("resource");
                RDFNode label = qs.get("label");
                if (searchParameters.getSearchOption() == SearchOptionType.EXACT_MATCH) {
                    for (StmtIterator stmtIter = resource.listProperties(); stmtIter.hasNext();) {
                        Statement stmt = stmtIter.nextStatement();
//                        System.out.println(stmt);
                        outputModel.add(stmt);
                    }
                } else {
                    outputModel.add(resource, RDFS.label, label);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (qexec != null) {
                qexec.close();
            }
        }

        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    private Set<Resource> supClassSet = null;

    public Model getOutputModel() {
        SearchOptionType searchOption = searchParameters.getSearchOption();
        Model outputModel = ModelFactory.createDefaultModel();
        String resName = searchParameters.getResourceName();
        for (Resource res : resourceSet) {
            switch (searchOption) {
                case EXACT_MATCH:
                    addStatements(res, outputModel);
                    break;
                case SUB_CLASSES:
                    outputModel.add(res, RDFS.subClassOf, ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + resName));
                    break;
                case PROPERTIES_OF_DOMAIN_CLASS:
                    outputModel.add(res, RDFS.domain, ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + resName));
                    break;
                case PROPERTIES_OF_RANGE_CLASS:
                    outputModel.add(res, RDFS.range, ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + resName));
                    break;
                case DOMAIN_CLASSES_OF_PROPERTY:
                    outputModel.add(ResourceFactory.createResource(WikipediaOntologyStorage.PROPERTY_NS + resName), RDFS.domain, res);
                    break;
                case RANGE_CLASSES_OF_PROPERTY:
                    outputModel.add(ResourceFactory.createResource(WikipediaOntologyStorage.PROPERTY_NS + resName), RDFS.range, res);
                    break;
                default:
                    addLabelStatements(res, outputModel);
                    break;
            }
        }
        if (searchParameters.getTypeSet().size() == 0 && searchParameters.getResourceType() == ResourceType.CLASS
                && searchOption == SearchOptionType.EXACT_MATCH) {
            for (Resource type : typeSet) {
                for (StmtIterator stmtIter = type.listProperties(); stmtIter.hasNext();) {
                    Statement stmt = stmtIter.nextStatement();
                    if (stmt.getPredicate().equals(RDFS.subClassOf)) {
                        supClassSet = new HashSet<Resource>();
                        addSuperClasses((Resource) stmt.getObject(), outputModel, supClassSet);
                        addStatements((Resource) stmt.getObject(), outputModel);
                    }
                    outputModel.add(stmt);
                }
                addInstances(type, outputModel);
            }
        }
        WikipediaOntologyUtils.addStringToMemcached(searchParameters.getRDFKey(), WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV"));
        return outputModel;
    }

    public void closeDB() {
        if (wikiOntStrage != null) {
            wikiOntStrage.closeTDB();
        }
    }

    public void showResourceSet() {
        System.out.println(typeSet.size());
        System.out.println(typeSet);
        System.out.println(resourceSet.size());
        for (Resource res : resourceSet) {
            System.out.println(res);
        }
    }

    private Map<Resource, Set<Resource>> getClassSubClassMap(Model outputModel) {
        Map<Resource, Set<Resource>> classSubClassMap = Maps.newHashMap();
        for (StmtIterator stmtIter = outputModel.listStatements(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            Resource subject = stmt.getSubject();
            Property property = stmt.getPredicate();
            Object object = stmt.getObject();
            if (property.equals(RDF.type) && object.equals(OWL.Class) && classSubClassMap.get(subject) == null) {
                classSubClassMap.put(subject, Sets.<Resource>newHashSet());
            }
            if (property.equals(RDFS.subClassOf)) {
                Resource objectRes = (Resource) stmt.getObject();
                if (classSubClassMap.get(objectRes) != null) {
                    Set<Resource> subClassSet = classSubClassMap.get(objectRes);
                    subClassSet.add(subject);
                } else {
                    Set<Resource> subClassSet = Sets.newHashSet();
                    subClassSet.add(subject);
                    classSubClassMap.put(objectRes, subClassSet);
                }
            }
        }
        return classSubClassMap;
    }

    private Set<Resource> getRootClassSet(Map<Resource, Set<Resource>> classSubClassMap) {
        Set<Resource> rootClassSet = Sets.newHashSet();
        for (Resource cls : classSubClassMap.keySet()) {
            boolean isRoot = true;
            for (Set<Resource> subClassSet : classSubClassMap.values()) {
                if (subClassSet.contains(cls)) {
                    isRoot = false;
                }
            }
            if (isRoot) {
                rootClassSet.add(cls);
            }
        }
        if (rootClassSet.size() == 0) {
            for (Resource type : typeSet) {
                rootClassSet.add(type);
            }
        }
        return rootClassSet;
    }

    int treeJSONDataIdCount = 1;

    public String getTreeJSONString(Model outputModel) {
        treeJSONDataIdCount = 1;
        Map<Resource, Set<Resource>> classSubClassMap = getClassSubClassMap(outputModel);
        Set<Resource> rootClassSet = getRootClassSet(classSubClassMap);
        JSONArray jsonContainer = new JSONArray();
        try {
            for (Resource root : rootClassSet) {
                JSONObject jsonRootObj = new JSONObject();
                addJSONAttributes(jsonRootObj, root, false);
                JSONArray childArray = getChildArray(root, classSubClassMap, outputModel);
                if (0 < childArray.length()) {
                    jsonRootObj.put("children", childArray);
                } else {
                    jsonRootObj.put("leaf", true);
                }
                setInstanceCnt(jsonRootObj);
                if (searchParameters.getResourceName().equals("ALLClasses")) {
                    String localName = (String) jsonRootObj.get("text");
                    int instanceCnt = getInstanceCnt(localName, outputModel);
                    jsonRootObj.put("text", localName + "（" + instanceCnt + "）");
                }
                jsonContainer.put(jsonRootObj);
            }
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
//        return "stcCallback1001(" + jsonContainer.toString() + ")";
        return jsonContainer.toString();
    }

    private String getQname(Resource res) {
        String prefix = dbModel.getNsURIPrefix(res.getNameSpace());
        if (prefix == null) {
            return WikipediaOntologyUtils.getQname(res);
        }
        String localName = res.getLocalName();
        return prefix + ":" + localName;
    }

    private String getLocalName(Resource res) {
        String prefix = dbModel.getNsURIPrefix(res.getNameSpace());
        if (prefix == null) {
            return WikipediaOntologyUtils.getLocalName(res);
        }
        return res.getLocalName();
    }

    public void addJSONAttributes(JSONObject jsonObj, Resource res, boolean isLeaf) {
        String qname = getQname(res);
        String localName = getLocalName(res);
        try {
            jsonObj.put("id", treeJSONDataIdCount++);
            jsonObj.put("text", localName);
            jsonObj.put("qname", qname);
            jsonObj.put("leaf", isLeaf);
            if (qname.indexOf("class") != -1) {
                jsonObj.put("iconCls", "icon-class");
            } else if (qname.indexOf("property") != -1) {
                jsonObj.put("iconCls", "icon-property");
            } else if (qname.indexOf("instance") != -1) {
                jsonObj.put("iconCls", "icon-instance");
            }
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
    }

    public JSONArray getChildArray(Resource res, Map<Resource, Set<Resource>> classSubClassMap, Model outputModel) {
        JSONArray childArray = new JSONArray();
        Set<Resource> subClassSet = classSubClassMap.get(res);
        if (subClassSet != null && 0 < subClassSet.size()) {
            for (Resource subClass : subClassSet) {
                JSONObject jsonChildObj = new JSONObject();
                addJSONAttributes(jsonChildObj, subClass, false);
                try {
                    JSONArray grandChildArray = getChildArray(subClass, classSubClassMap, outputModel);
                    if (0 < grandChildArray.length()) {
                        jsonChildObj.put("children", grandChildArray);
                    } else {
                        jsonChildObj.put("leaf", true);
                    }
                    if (searchParameters.getResourceName().equals("ALLClasses")) {
                        String localName = (String) jsonChildObj.get("text");
                        int instanceCnt = getInstanceCnt(localName, outputModel);
                        jsonChildObj.put("text", localName + "（" + instanceCnt + "）");
                    }
                    setInstanceCnt(jsonChildObj);
                    childArray.put(jsonChildObj);
                } catch (JSONException jsonExp) {
                    jsonExp.printStackTrace();
                }
            }
        } else {
            ResourceType queryType = searchParameters.getResourceType();
            if (typeSet.contains(res)) {
                switch (queryType) {
                    case CLASS:
                        for (ResIterator resIter = outputModel.listSubjectsWithProperty(RDF.type, res); resIter.hasNext();) {
                            Resource instance = resIter.nextResource();
                            JSONObject jsonChildObj = new JSONObject();
                            addJSONAttributes(jsonChildObj, instance, true);
                            childArray.put(jsonChildObj);
                        }
                        break;
                    case INSTANCE:
                        if (searchParameters.getSearchOption() == SearchOptionType.EXACT_MATCH) {
                            for (Resource keyInstance : resourceSet) {
                                JSONObject jsonChildObj = new JSONObject();
                                addJSONAttributes(jsonChildObj, keyInstance, true);
                                childArray.put(jsonChildObj);
                            }
                        }
                        break;
                }
            }
        }
        return childArray;
    }

    private void setInstanceCnt(JSONObject jsonChildObj) {
        try {
            int instanceCnt = 0;
            if (!jsonChildObj.getBoolean("leaf")) {
                instanceCnt = getInstanceCnt((JSONArray) jsonChildObj.get("children"));
                if (0 < instanceCnt) {
                    jsonChildObj.put("text", jsonChildObj.get("text") + "（" + instanceCnt + "）");
                }
            }
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
    }

    private int getInstanceCnt(String localName, Model outputModel) {
        int instanceCnt = 0;
        Resource cls = ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + localName);
        for (NodeIterator nodeIter = outputModel.listObjectsOfProperty(cls,
                WikipediaOntologyStorage.INSTANCE_COUNT_PROPERTY); nodeIter.hasNext();) {
            RDFNode object = nodeIter.nextNode();
            if (object.isLiteral()) {
                instanceCnt = ((Literal) object).getInt();
                break;
            }
        }
//        System.out.println(cls + ": " + instanceCnt);
        return instanceCnt;
    }

    public int getInstanceCnt(JSONArray children) throws JSONException {
        int instanceCnt = 0;
        for (int i = 0; i < children.length(); i++) {
            Object obj = children.get(i);
            if (obj instanceof JSONObject) {
                JSONObject jsonObj = (JSONObject) obj;
                String type = jsonObj.getString("iconCls");
                if (type.equals("icon-instance")) {
                    instanceCnt++;
                }
            }
        }
        return instanceCnt;
    }

    public String getTableJSONString(Model outputModel, long numberOfStatements) {
        JSONObject rootObj = new JSONObject();
        try {
            JSONArray jsonArray = new JSONArray();
            for (StmtIterator stmtIter = outputModel.listStatements(); stmtIter.hasNext();) {
                Statement stmt = stmtIter.nextStatement();
                JSONObject jsonObj = new JSONObject();
                String subjectQname = getQname(stmt.getSubject());
                if (subjectQname == null) {
                    jsonObj.put("subject", stmt.getSubject().getURI());
                } else {
                    jsonObj.put("subject", subjectQname);
                }
                String predicateQname = getQname(stmt.getPredicate());
                if (predicateQname == null) {
                    jsonObj.put("predicate", stmt.getPredicate().getURI());
                } else {
                    jsonObj.put("predicate", predicateQname);
                }
                if (stmt.getObject().isResource()) {
                    Resource object = (Resource) stmt.getObject();
                    String objectQname = getQname(object);
                    if (objectQname == null) {
                        jsonObj.put("object", object.getURI());
                    } else {
                        jsonObj.put("object", objectQname);
                    }
                } else {
                    jsonObj.put("object", stmt.getObject().toString());
                }
                jsonArray.put(jsonObj);
            }
            rootObj.put("statement", jsonArray);
            rootObj.put("numberOfStatements", numberOfStatements);
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
        if (searchParameters.getDataType() == DataType.JSONP) {
            return "stcCallback1001(" + rootObj.toString() + ")";
        }
        return rootObj.toString();
    }

    private void addStatements(Resource res, Model outputModel) {
        for (StmtIterator stmtIter = res.listProperties(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            outputModel.add(stmt);
        }
    }

    private void addLabelStatements(Resource res, Model outputModel) {
        for (StmtIterator stmtIter = res.listProperties(RDFS.label); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            outputModel.add(stmt);
        }
    }

    private void addInstances(Resource type, Model outputModel) {
        for (ResIterator resIter = dbModel.listSubjectsWithProperty(RDF.type, type); resIter.hasNext();) {
            Resource instance = resIter.nextResource();
            for (StmtIterator stmtIter = instance.listProperties(); stmtIter.hasNext();) {
                Statement stmt = stmtIter.nextStatement();
                Property property = stmt.getPredicate();
                if (property.equals(RDF.type) || property.equals(RDFS.label)) {
                    outputModel.add(stmt);
                }
            }
        }
    }

    private void addSuperClasses(Resource res, Model outputModel, Set<Resource> supClassSet) {
        supClassSet.add(res);
        for (StmtIterator stmtIter = res.listProperties(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            if (!stmt.getSubject().equals(stmt.getObject()) && stmt.getPredicate().equals(RDFS.subClassOf)) {
                outputModel.add(stmt);
                Resource object = (Resource) stmt.getObject();
                if (!supClassSet.contains(res)) {
                    addSuperClasses(object, outputModel, supClassSet);
                }
                addStatements(object, outputModel);
            }
        }
    }

}
