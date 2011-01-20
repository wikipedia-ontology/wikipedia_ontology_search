package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.util.*;

import com.hp.hpl.jena.util.FileManager;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;

import com.google.common.collect.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.sparql.lib.org.json.*;
import com.hp.hpl.jena.vocabulary.*;

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

    public void setQueryResults2(String queryString) {
        Set<String> typeNameSet = searchParameters.getTypeSet();
        QueryExecution qexec = getQueryExecution(queryString);
        ResultSet results = qexec.execSelect();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("resource");
                resourceSet.add(resource);
            }
        } finally {
            qexec.close();
        }

        Set<String> typeStringSet = Sets.newHashSet();
        for (String keyWord : typeNameSet) {
            typeStringSet.add(WikipediaOntologyStorage.CLASS_NS + keyWord);
        }

        for (Resource res : resourceSet) {
            for (NodeIterator nodeIter = dbModel.listObjectsOfProperty(res, RDF.type); nodeIter.hasNext();) {
                Resource type = (Resource) nodeIter.nextNode();
                if (typeStringSet.contains(type.getURI())) {
                    typeSet.add(type);
                }
            }
        }
    }

    public String setTDBModel() {
        WikipediaOntologyStorage.VERSION = searchParameters.getVersion();
        if (searchParameters.isUseInfModel()) {
            dbModel = getWikipediaOntologyAndInstanceModel("ja", "rdfs");
            return "ja";
        }
        if (!searchParameters.getResourceName().equals("queryString") && searchParameters.isEnglishResourceName()) {
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

    public void setQueryResultsForPropertiesOfRegionClass(String queryString) {
        QueryExecution qexec = getQueryExecution(queryString);
        ResultSet results = qexec.execSelect();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource property = (Resource) qs.get("p");
                resourceSet.add(property);
                typeSet.add(property);
                System.out.println(property);
            }
        } finally {
            qexec.close();
        }
    }

    public void setQueryResults(String lang, String queryString) {
//        System.out.println(queryString);
        QueryExecution qexec = getQueryExecution(queryString);
        ResultSet results = qexec.execSelect();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("resource");
                Resource type = (Resource) qs.get("type");

                resourceSet.add(resource);
                if (searchParameters.getResourceType() == ResourceType.INSTANCE
                        && searchParameters.getSearchOption() != SearchOptionType.EXACT_MATCH) {
                    // インスタンス検索時に完全照合以外のオプションが指定されている場合には，typeSetに全インスタンス検索結果を保存
                    typeSet.add(resource);
                    continue;
                }
                if (type != null) {
                    if (type.equals(OWL.Class) || type.equals(OWL.ObjectProperty) || type.equals(OWL.DatatypeProperty)) {
                        typeSet.add(resource);
                    } else {
                        typeSet.add(type);
                    }
                }
            }
        } finally {
            qexec.close();
        }
        // 英語名らしきラベルがついているが，日本語Wikipediaオントロジーで定義されている場合の処理
        if (lang.equals("en") && resourceSet.size() == 0) {
            dbModel = getWikipediaOntologyAndInstanceModel("ja", "");
            setQueryResults("ja", queryString);
        }
        if (searchParameters.getResourceType() == ResourceType.INSTANCE
                && searchParameters.getSearchOption() == SearchOptionType.EXACT_MATCH) {
            for (Resource res : resourceSet) {
                for (NodeIterator i = dbModel.listObjectsOfProperty(res, RDF.type); i.hasNext();) {
                    Resource type = (Resource) i.nextNode();
                    typeSet.add(type);
                }
            }
        }
        // 階層表示パネルにサブクラスまたは兄弟クラスリストを表示するため
        if (searchParameters.getSearchOption() == SearchOptionType.SIBLINGS ||
                searchParameters.getSearchOption() == SearchOptionType.SUB_CLASSES) {
            typeSet.addAll(resourceSet);
        }
    }

    private Set<Resource> supClassSet = null;
    private static final String ALL_CLASSES = "E:/Users/t_morita/wikipedia_ontology/ALLClasses.owl";

    public Model getOutputModel() {
        if (searchParameters.getResourceName().equals("ALLClasses")) {
            System.out.println("ALLClasses");
            return FileManager.get().loadModel(ALL_CLASSES);
        }
        SearchOptionType searchOption = searchParameters.getSearchOption();
        Model outputModel = ModelFactory.createDefaultModel();
        String resName = searchParameters.getResourceName();
        for (Resource res : resourceSet) {
            switch (searchOption) {
                case EXACT_MATCH:
                    addStatements(res, outputModel);
                    break;
                case PROPERTIES_OF_DOMAIN_CLASS:
                    addStatement(res, RDFS.domain, resName, outputModel);
                    break;
                case PROPERTIES_OF_RANGE_CLASS:
                    addStatement(res, RDFS.range, resName, outputModel);
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
                Set<Resource> subClassSet = Sets.newHashSet();
                classSubClassMap.put(subject, subClassSet);
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
        System.out.println(cls + ": " + instanceCnt);
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
//        return "stcCallback1001(" + rootObj.toString() + ")";
        return rootObj.toString();
    }

    private void addStatements(Resource res, Model outputModel) {
        for (StmtIterator stmtIter = res.listProperties(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            outputModel.add(stmt);
        }
    }

    private void addStatement(Resource res, Property p, String resName, Model outputModel) {
        outputModel.add(res, p, ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + resName));
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
