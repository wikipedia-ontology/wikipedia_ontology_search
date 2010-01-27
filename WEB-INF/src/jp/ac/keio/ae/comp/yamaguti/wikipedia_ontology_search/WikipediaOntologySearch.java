package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.util.*;

import org.json.*;

import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/09/10
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologySearch {

    private Model dbModel;
    private SearchParameters searchParameters;
    private Set<Resource> resourceSet;
    private Set<Resource> typeSet;
    private WikipediaOntologyStorage wikiOntStrage;

    private static final String WikipediaOntologyDBName = "wikipedia_ontology_2009_11_20";
    private static final String WikipediaOntologyModelName = "wikipedia_ontology";
    private static final String WikipediaOntologyAndInstanceDBName = "wikipedia_ontology_and_instance_2010_01_26";
    private static final String WikipediaOntologyAndInstanceModelName = "wikipedia_ontology_and_instance";
    private static final String WikipediaOntologyAndInstanceInferenceDBName = "wikipedia_ontology_and_instance_inference_2009_11_20";
    private static final String WikipediaOntologyAndInstanceInferenceModelName = "wikipedia_ontology_and_instance_inference";
    private static final String EnglishWikipediaInstanceDBName = "english_wikipedia_instance_2009_10_27";
    private static final String EnglishWikipediaInstanceModelName = "english_wikipedia_instance";

    public WikipediaOntologySearch(SearchParameters params) {
        searchParameters = params;
        resourceSet = new HashSet<Resource>();
        typeSet = new HashSet<Resource>();
    }

    public SearchParameters getSearchParameters() {
        return searchParameters;
    }

    public void setQueryType(Type type) {
        searchParameters.setQueryType(type);
    }

    public Model getDBModel() {
        return dbModel;
    }

    private Model getEnglishWikipediaInstanceModel() {
        wikiOntStrage = new WikipediaOntologyStorage(EnglishWikipediaInstanceDBName, true);
        return wikiOntStrage.getDBModel(EnglishWikipediaInstanceModelName);
    }

    private Model getWikipediaOntologyModel() {
        wikiOntStrage = new WikipediaOntologyStorage(WikipediaOntologyDBName, true);
        return wikiOntStrage.getDBModel(WikipediaOntologyModelName);
    }

    private Model getWikipediaOntologyAndInstanceModel() {
        wikiOntStrage = new WikipediaOntologyStorage(WikipediaOntologyAndInstanceDBName, true);
        return wikiOntStrage.getDBModel(WikipediaOntologyAndInstanceModelName);
    }

    private Model getInferenceWikipediaOntologyAndInstanceModel() {
        wikiOntStrage = new WikipediaOntologyStorage(WikipediaOntologyAndInstanceInferenceDBName, true);
        return wikiOntStrage.getDBModel(WikipediaOntologyAndInstanceInferenceModelName);
    }

    public String getQueryString(Set<String> typeSet, String sparqlTemplate) {
        StringBuilder queryTypeSetString = new StringBuilder();
        int i = 0;
        for (String type : typeSet) {
            if (WikipediaOntologyUtilities.isEnglishTerm(type)) {
                type = type.replaceAll("_", " ");
            }
            queryTypeSetString.append("?resource rdf:type ?type" + i + ". ?type" + i + " rdfs:label \"" + type + "\".");
            i++;
        }
        return sparqlTemplate.replace("<QueryTypeSet>", queryTypeSetString);
    }

    public String getClassQueryString(String keyWord, String sparqlTemplate) {
        String searchOption = searchParameters.getSearchOption();
        String typeFilter = "";
        if (searchOption.equals("siblings")) {
            typeFilter = "?resource rdfs:subClassOf ?supTargetCls . ?targetCls rdfs:subClassOf ?supTargetCls . ?targetCls  rdfs:label  \""
                    + keyWord + "\" .";
        } else if (searchOption.equals("subClasses")) {
            typeFilter = "?resource rdfs:subClassOf ?targetCls . ?targetCls  rdfs:label \""
                    + keyWord + "\" .";
        }
        String queryString = sparqlTemplate.replace("<QueryTypeSet>", typeFilter);
        return queryString;
    }

    public String getQueryString(String keyWord, String sparqlTemplate) {
        Type queryType = searchParameters.getQueryType();

        String typeFilter = "";
        if (queryType == Type.CLASS) {
            typeFilter = "?resource rdf:type ?type . FILTER (?type = owl:Class) ";
        } else if (queryType == Type.PROPERTY) {
            typeFilter = "?resource rdf:type ?type . FILTER (?type = owl:ObjectProperty) ";
        } else if (queryType == Type.INSTANCE) {
            // 検索時間がかかる
            // typeFilter =
            // "OPTIONAL { ?resource rdf:type ?type  FILTER (?type != owl:ObjectClass || ?type != owl:ObjectProperty)} ";
        }

        String regexString = "";
        keyWord = keyWord.replaceAll("\\(|\\)|\\$|\\[|\\]|\\+|\\*|\\\\|\\?", "\\.");
        if (WikipediaOntologyUtilities.isEnglishTerm(keyWord)) {
            keyWord = keyWord.replaceAll("_", " ");
        }

        String searchOption = searchParameters.getSearchOption();
        if (searchOption.equals("starts_with")) {
            regexString = "^" + keyWord;
        } else if (searchOption.equals("ends_with")) {
            regexString = keyWord + "$";
        } else if (searchOption.equals("any_match")) {
            regexString = keyWord;
        } else if (searchOption.equals("exact_match")) {
            regexString = "^" + keyWord + "$";
        }

        String queryString = sparqlTemplate.replace("<TypeFilter>", typeFilter);
        queryString = queryString.replace("<RegexString>", regexString);
        return queryString;
    }

    public void setQueryResults2(String queryString, Set<String> keyWordSet) {
        if (searchParameters.isUseInfModel()) {
            dbModel = getInferenceWikipediaOntologyAndInstanceModel();
        } else {
            if (WikipediaOntologyUtilities.isEnglishTerm(keyWordSet.toArray()[0].toString())) {
                dbModel = getEnglishWikipediaInstanceModel();
            } else {
                dbModel = getWikipediaOntologyAndInstanceModel();
            }
        }
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
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

        Set<String> typeStringSet = new HashSet<String>();
        for (String keyWord : keyWordSet) {
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
    public void setQueryResults(String queryString) {
        if (searchParameters.isUseInfModel()) {
            dbModel = getInferenceWikipediaOntologyAndInstanceModel();
        } else {
            if (WikipediaOntologyUtilities.isEnglishTerm(searchParameters.getKeyWord())) {
                dbModel = getEnglishWikipediaInstanceModel();
            } else {
                dbModel = getWikipediaOntologyAndInstanceModel();
            }
        }

        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
        ResultSet results = qexec.execSelect();

        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("resource");
                Resource type = (Resource) qs.get("type");

                resourceSet.add(resource);
                if (searchParameters.getQueryType() == Type.INSTANCE
                        && !searchParameters.getSearchOption().equals("exact_match")) {
                    continue;
                }
                if (type != null) {
                    if (type.equals(OWL.Class)) {
                        typeSet.add(resource);
                    } else if (type.equals(OWL.ObjectProperty)) {
                        // タイプには追加しない
                    } else {
                        typeSet.add(type);
                    }
                }
            }
        } finally {
            qexec.close();
        }
        if (searchParameters.getQueryType() == Type.INSTANCE
                && searchParameters.getSearchOption().equals("exact_match")) {
            for (Resource res : resourceSet) {
                for (NodeIterator i = dbModel.listObjectsOfProperty(res, RDF.type); i.hasNext();) {
                    Resource type = (Resource) i.nextNode();
                    typeSet.add(type);
                }
            }
        }
    }

    public void setAllClassesModel() {
        dbModel = getWikipediaOntologyModel();
        typeSet = wikiOntStrage.getAllClasses(dbModel);
    }

    private Set<Resource> supClassSet = null;

    public Model getOutputModel() {
        String searchOption = searchParameters.getSearchOption();
        Model outputModel = ModelFactory.createDefaultModel();
        for (Resource res : resourceSet) {
            if (searchOption.equals("exact_match")) {
                addStatements(res, outputModel);
            } else {
                addLabelStatements(res, outputModel);
            }
        }
        if (searchParameters.getQueryType() == Type.CLASS && searchOption.equals("exact_match")) {
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
        return outputModel;
    }

    public void closeDB() {
        wikiOntStrage.closeDB();
    }

    public static void main(String[] args) {
        Type queryType = Type.CLASS;
        // Type queryType = Type.INSTANCE;
        SearchParameters searchParameters = new SearchParameters();
        searchParameters.setQueryType(queryType);
        searchParameters.setUseInfModel(false);
        searchParameters.setSearchOption("exact_match");
        WikipediaOntologySearch wikiOntSearch = new WikipediaOntologySearch(searchParameters);

        // String keyWord = "アップルコンピュータ";
        String keyWord = "慶應義塾大学の人物";
        // String keyWord = "山口高平";
        // String keyWord = "アナウンサー";
        // String keyWord = "日本のアナウンサー";
        // String keyWord = "ALLClasses";

        // Set<String> keyWordSet = new HashSet();
        // keyWordSet.add("慶應義塾大学の人物");
        // keyWordSet.add("東京都出身の人物");
        // keyWordSet.add("日本のアナウンサー");
        // keyWordSet.add("アナウンサー");

        // String queryString = wikiOntSearch.getQueryString(keyWordSet);
        // System.out.println(queryString);
        // wikiOntSearch.setQueryResults2(queryString, keyWordSet);
        // wikiOntSearch.showResourceSet();

        // 単一タイプ検索
        File templateFile = new File("sparql_templates/query_resource.tmpl");
        String sparqlTemplate = WikipediaOntologyUtilities.readFile(templateFile);
        String queryString = wikiOntSearch.getQueryString(keyWord, sparqlTemplate);
        wikiOntSearch.setQueryResults(queryString);
        Model outputModel = wikiOntSearch.getOutputModel();
        // System.out.println(outputModel.size());
        // wikiOntSearch.setAllClassesModel();
        // Model outputModel = wikiOntSearch.getDBModel();
        System.out.println(outputModel.size());
        // String outputString =
        // WikipediaOntologyUtilities.getRDFString(outputModel,
        // "RDF/XML-ABBREV");
        // System.out.println(outputString);
        // String outputString = wikiOntSearch.getTreeJSONString(outputModel);
        // System.out.println(outputString);
        String outputString = wikiOntSearch.getTableJSONString(outputModel, outputModel.size());
        System.out.println(outputString);
        wikiOntSearch.closeDB();
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
        Map<Resource, Set<Resource>> classSubClassMap = new HashMap<Resource, Set<Resource>>();
        for (StmtIterator stmtIter = outputModel.listStatements(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            Resource subject = stmt.getSubject();
            Property property = stmt.getPredicate();
            Object object = stmt.getObject();
            if (property.equals(RDF.type) && object.equals(OWL.Class) && classSubClassMap.get(subject) == null) {
                Set<Resource> subClassSet = new HashSet<Resource>();
                classSubClassMap.put(subject, subClassSet);
            }
            if (property.equals(RDFS.subClassOf)) {
                Resource objectRes = (Resource) stmt.getObject();
                if (classSubClassMap.get(objectRes) != null) {
                    Set<Resource> subClassSet = classSubClassMap.get(objectRes);
                    subClassSet.add(subject);
                } else {
                    Set<Resource> subClassSet = new HashSet<Resource>();
                    subClassSet.add(subject);
                    classSubClassMap.put(objectRes, subClassSet);
                }
            }
        }
        return classSubClassMap;
    }

    private Set<Resource> getRootClassSet(Map<Resource, Set<Resource>> classSubClassMap) {
        Set<Resource> rootClassSet = new HashSet<Resource>();
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

    public String getTreeJSONString(Model outputModel) {
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
                jsonContainer.put(jsonRootObj);
            }
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
        return jsonContainer.toString();
    }

    private String getQname(Resource res) {
        String prefix = dbModel.getNsURIPrefix(res.getNameSpace());
        if (prefix == null) { return WikipediaOntologyUtilities.getQname(res); }
        String localName = res.getLocalName();
        return prefix + ":" + localName;
    }

    private String getLocalName(Resource res) {
        String prefix = dbModel.getNsURIPrefix(res.getNameSpace());
        if (prefix == null) { return WikipediaOntologyUtilities.getLocalName(res); }
        return res.getLocalName();
    }

    public void addJSONAttributes(JSONObject jsonObj, Resource res, boolean isLeaf) {
        String qname = getQname(res);
        String localName = getLocalName(res);
        try {
            jsonObj.put("text", localName);
            jsonObj.put("id", qname);
            jsonObj.put("leaf", isLeaf);
            if (qname.indexOf("class") != -1) {
                jsonObj.put("iconCls", "icon-class");
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
                    setInstanceCnt(jsonChildObj);
                    childArray.put(jsonChildObj);
                } catch (JSONException jsonExp) {
                    jsonExp.printStackTrace();
                }
            }
        } else {
            Type queryType = searchParameters.getQueryType();
            if (typeSet.contains(res)) {
                if (queryType == Type.CLASS) {
                    for (ResIterator resIter = outputModel.listSubjectsWithProperty(RDF.type, res); resIter.hasNext();) {
                        Resource instance = resIter.nextResource();
                        JSONObject jsonChildObj = new JSONObject();
                        addJSONAttributes(jsonChildObj, instance, true);
                        childArray.put(jsonChildObj);
                    }
                } else if (queryType == Type.INSTANCE) {
                    for (Resource keyInstance : resourceSet) {
                        JSONObject jsonChildObj = new JSONObject();
                        addJSONAttributes(jsonChildObj, keyInstance, true);
                        childArray.put(jsonChildObj);
                    }
                }
            }
        }
        return childArray;
    }

    private void setInstanceCnt(JSONObject jsonChildObj) {
        try {
            int instanceCnt = 0;
            if (wikiOntStrage.getDBName().equals(WikipediaOntologyDBName)) {
                instanceCnt = getInstanceCnt((String) jsonChildObj.get("text"));
                jsonChildObj.put("text", jsonChildObj.get("text") + "（" + instanceCnt + "）");
            } else {
                if (!jsonChildObj.getBoolean("leaf")) {
                    instanceCnt = getInstanceCnt((JSONArray) jsonChildObj.get("children"));
                    if (0 < instanceCnt) {
                        jsonChildObj.put("text", jsonChildObj.get("text") + "（" + instanceCnt + "）");
                    }
                }
            }
        } catch (JSONException jsonExp) {
            jsonExp.printStackTrace();
        }
    }

    public int getInstanceCnt(String localName) {
        int instanceCnt = 0;
        Resource cls = ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + localName);
        for (NodeIterator nodeIter = dbModel.listObjectsOfProperty(cls, WikipediaOntologyStorage.instanceCount); nodeIter
                .hasNext();) {
            RDFNode object = nodeIter.nextNode();
            if (object.isLiteral()) {
                instanceCnt = ((Literal) object).getInt();
                break;
            }
        }
        // System.out.println(cls + ": " + instanceCnt);
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
