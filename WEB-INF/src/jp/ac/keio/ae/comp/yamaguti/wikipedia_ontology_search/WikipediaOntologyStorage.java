package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.sql.*;
import java.util.*;

import javax.naming.*;

import com.hp.hpl.jena.datatypes.xsd.*;
import com.hp.hpl.jena.db.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.reasoner.*;
import com.hp.hpl.jena.sparql.vocabulary.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/05
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyStorage {

    private String dbName;
    private Model dbModel;
    private DBConnection conn;
    private ModelMaker modelMaker;
    public static String ONTOLOGY_NS = "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/";
    public static String CLASS_NS = ONTOLOGY_NS + "class/";
    public static String PROPERTY_NS = ONTOLOGY_NS + "property/";
    public static String INSTANCE_NS = ONTOLOGY_NS + "instance/";
    public static Property instanceCount = ResourceFactory.createProperty(ONTOLOGY_NS + "instanceCount");

    public WikipediaOntologyStorage() {
    }

    public WikipediaOntologyStorage(String dbName, boolean isServerSideApp) {
        try {
            Connection connection = null;
            if (isServerSideApp) {
                InitialContext initialContext = new InitialContext();
                javax.sql.DataSource dataSource = (javax.sql.DataSource) initialContext.lookup("java:comp/env/"
                        + dbName);
                connection = dataSource.getConnection();
            } else {
                Class.forName("org.gjt.mm.mysql.Driver");
                String host = "localhost";
                String url = "jdbc:mysql://" + host + "/" + dbName + "?useUnicode=true&characterEncoding=UTF-8";
                String userName = "wikiont";
                String passWord = "wikiont";
                connection = DriverManager.getConnection(url, userName, passWord);
            }
            this.dbName = dbName;
            conn = new DBConnection(connection, "MySQL");
            modelMaker = ModelFactory.createModelRDBMaker(conn);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getDBName() {
        return dbName;
    }

    public Model getDBModel(String modelName) {
        try {
            Model model = modelMaker.createModel(modelName);
            model.setNsPrefix("wikiont_ontology", ONTOLOGY_NS);
            model.setNsPrefix("wikiont_class", CLASS_NS);
            model.setNsPrefix("wikiont_instance", INSTANCE_NS);
            model.setNsPrefix("rdf", RDF.getURI());
            model.setNsPrefix("rdfs", RDFS.getURI());
            model.setNsPrefix("owl", OWL.getURI());
            model.setNsPrefix("foaf", FOAF.getURI());

            return model;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public void closeDB() {
        try {
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static final String WIKIPEDIA_ONTOLOGY_INFOBOX_FILE_PATH = "ontology/wikipedia_ontology_infobox_20091120.owl";
    private static final String WIKIPEDIA_INSTANCE_FILE_PATH = "ontology/wikipedia_instance_20091120.owl";
    private static final String WIKIPEDIA_ONTOLOGY_FILE_PATH = "ontology/wikipedia_ontology_20091120.owl";

    public Model getWikipediaOntologyAndInstanceMemModel(boolean isInfModel) {
        Model instanceModel = FileManager.get().loadModel(WIKIPEDIA_INSTANCE_FILE_PATH);
        instanceModel.add(FileManager.get().loadModel(WIKIPEDIA_ONTOLOGY_INFOBOX_FILE_PATH));
        Model ontModel = FileManager.get().loadModel(WIKIPEDIA_ONTOLOGY_FILE_PATH);
        Model model = null;
        if (isInfModel) {
            Reasoner rdfsReasoner = ReasonerRegistry.getRDFSSimpleReasoner();
            Reasoner reasoner = rdfsReasoner.bindSchema(ontModel);
            model = ModelFactory.createInfModel(reasoner, instanceModel);
            System.out.println("wikipedia ontology and instance (inference) triple size: "
                    + model.listStatements().toSet().size());
        } else {
            model = ModelFactory.createDefaultModel();
            model.add(instanceModel);
            model.add(ontModel);
            System.out.println("wikipedia ontology and instance triple size: " + model.listStatements().toSet().size());
        }
        return model;
    }

    public Model getEnglishWikipediaInstanceMemModel() {
        Model instanceModel = FileManager.get().loadModel("ontology/wikipedia_ontology_english_instance.owl");
        Model refinedInstanceModel = ModelFactory.createDefaultModel();

        for (StmtIterator i = instanceModel.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            Resource subject = stmt.getSubject();
            Property predicate = stmt.getPredicate();
            RDFNode object = stmt.getObject();

            Resource refinedSubject = subject;
            if (subject.getURI().contains(" ")) {
                refinedSubject = ResourceFactory.createResource(subject.getURI().replaceAll("\\s", "_"));
                // System.out.println(subject + "=>" + refinedSubject);
            }
            RDFNode refinedObject = object;
            if (object.isResource()) {
                Resource objectResource = (Resource) object;
                if (objectResource.getURI().contains(" ")) {
                    refinedObject = ResourceFactory.createResource(objectResource.getURI().replaceAll("\\s", "_"));
                    // System.out.println(object + "=>" + refinedObject);
                }
            }
            refinedInstanceModel.add(ResourceFactory.createStatement(refinedSubject, predicate, refinedObject));
        }
        WikipediaOntologyUtilities.saveRDFFile(refinedInstanceModel,
                "ontology/refined_wikipedia_ontology_english_instance.owl");
        System.out.println("wikipedia instance triple size: " + refinedInstanceModel.listStatements().toSet().size());

        return refinedInstanceModel;
    }

    private static final String WIKIPEDIA_ALLCLASSES_FILE_PATH = "ontology/ALLClasses.owl";

    public Model getWikipediaOntologyMemModel() {
        return FileManager.get().loadModel(WIKIPEDIA_ALLCLASSES_FILE_PATH);
    }

    /**
     * Wikipediaオントロジーをデータベースに格納する
     *
     * @param modelName
     * @param isInfModel
     */
    public void storeWikipediaOntologyToDB(String modelName) {
        try {
            Model dbModel = getDBModel(modelName);
            dbModel.add(getWikipediaOntologyMemModel());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Wikipediaオントロジーとインスタンスをデータベースに格納する
     *
     * @param modelName
     * @param isInfModel
     */
    public void storeWikipediaOntologyAndInstanceToDB(String modelName, boolean isInfModel) {
        try {
            Model dbModel = getDBModel(modelName);
            dbModel.add(getWikipediaOntologyAndInstanceMemModel(isInfModel));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void saveFixWikipediaOntologyToFile(Model model) {
        Set<Resource> clsSet = getAllClasses(model);
        Model outputModel = addInstanceCnt(getAllClassesModel(clsSet), model);
        System.out.println("output: " + outputModel.size());
        WikipediaOntologyUtilities.saveRDFFile(outputModel, "ontology/ALLClasses.owl");
        WikipediaOntologyUtilities.getRDFString(outputModel, "RDF/XML-ABBREV");
    }

    public Set<Resource> getAllClasses(Model dbModel) {
        this.dbModel = dbModel;
        Set<Resource> clsSet = new HashSet<Resource>();
        String queryString = "PREFIX  rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
                + "PREFIX  rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                + "PREFIX  owl: <http://www.w3.org/2002/07/owl#> SELECT ?class WHERE { ?class rdf:type owl:Class}";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
        ResultSet results = qexec.execSelect();

        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource cls = (Resource) qs.get("class");
                clsSet.add(cls);
            }
        } finally {
            qexec.close();
        }
        // System.out.println(clsSet.size());
        return clsSet;
    }

    public Model getAllClassesModel(Set<Resource> clsSet) {
        Model outputModel = ModelFactory.createDefaultModel();
        Model loopModel = ModelFactory.createDefaultModel();
        for (Resource cls : clsSet) {
            List<Resource> supClassList = new ArrayList<Resource>();
            supClassList.add(cls);
            checkSuperClasses(cls, supClassList, loopModel);
            for (StmtIterator stmtIter = cls.listProperties(); stmtIter.hasNext();) {
                Statement stmt = stmtIter.nextStatement();
                if (!stmt.getSubject().equals(stmt.getObject())) {
                    outputModel.add(stmt);
                }
            }
        }
        System.out.println(loopModel.size());
        outputModel.remove(loopModel);
        return outputModel;
    }

    private Model addInstanceCnt(Model outputModel, Model orgModel) {
        Model instanceCntModel = ModelFactory.createDefaultModel();
        for (ResIterator resIter = outputModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            int instanceCnt = 0;
            for (ResIterator instanceIter = orgModel.listSubjectsWithProperty(RDF.type, cls); instanceIter.hasNext();) {
                instanceIter.nextResource();
                instanceCnt++;
            }
            System.out.println(cls + ": " + instanceCnt);
            Literal instanceCntLiteral = ResourceFactory.createTypedLiteral(String.valueOf(instanceCnt),
                    XSDDatatype.XSDint);
            instanceCntModel.add(ResourceFactory.createStatement(cls, instanceCount, instanceCntLiteral));
        }
        outputModel.add(instanceCntModel);
        return outputModel;
    }

    private void checkSuperClasses(Resource res, List<Resource> supClassList, Model loopModel) {
        for (StmtIterator stmtIter = res.listProperties(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            if (!stmt.getSubject().equals(stmt.getObject()) && stmt.getPredicate().equals(RDFS.subClassOf)) {
                Resource object = (Resource) stmt.getObject();
                if (!supClassList.contains(object)) {
                    supClassList.add(object);
                    checkSuperClasses(object, supClassList, loopModel);
                } else {
                    loopModel.add(stmt);
                }
            }
        }
    }

    private static void storeWikipediaOntologyAndInstanceToDB(boolean isInfModel) {
        String dbName = "wikipedia_ontology_and_instance_2009_11_20";
        String modelName = "wikipedia_ontology_and_instance";
        if (isInfModel) {
            dbName = "wikipedia_ontology_and_instance_inference_2009_11_20";
            modelName = "wikipedia_ontology_and_instance_inference";
        }
        System.out.println("DB Name: " + dbName);
        System.out.println("Model Name: " + modelName);
        boolean isServerSideApp = false;
        WikipediaOntologyStorage wikiOntStorage = new WikipediaOntologyStorage(dbName, isServerSideApp);
        wikiOntStorage.storeWikipediaOntologyAndInstanceToDB(modelName, isInfModel);
        wikiOntStorage.closeDB();
    }

    private static void storeWikipediaOntologyToDB() {
        String dbName = "wikipedia_ontology_2009_11_20";
        String modelName = "wikipedia_ontology";
        boolean isServerSideApp = false;
        WikipediaOntologyStorage wikiOntStorage = new WikipediaOntologyStorage(dbName, isServerSideApp);
        wikiOntStorage.storeWikipediaOntologyToDB(modelName);
        wikiOntStorage.closeDB();
    }

    private static void storeWikipediaOntologyToFile() {
        WikipediaOntologyStorage wikiOntStorage = new WikipediaOntologyStorage();
        Model model = wikiOntStorage.getWikipediaOntologyAndInstanceMemModel(false);
        wikiOntStorage.saveFixWikipediaOntologyToFile(model);
    }

    private static void storeEnglishWikipediaInstanceToDB() {
        String dbName = "english_wikipedia_instance_2009_10_27";
        String modelName = "english_wikipedia_instance";
        boolean isServerSideApp = false;
        WikipediaOntologyStorage wikiOntStorage = new WikipediaOntologyStorage(dbName, isServerSideApp);
        try {
            Model dbModel = wikiOntStorage.getDBModel(modelName);
            dbModel.add(wikiOntStorage.getEnglishWikipediaInstanceMemModel());
        } catch (Exception e) {
            e.printStackTrace();
        }
        wikiOntStorage.closeDB();
    }

    public static void main(String[] args) {
        // boolean isInfModel = true;
        // storeWikipediaOntologyAndInstanceToDB(isInfModel);
        // storeWikipediaOntologyToFile();
        // storeWikipediaOntologyToDB();
        storeEnglishWikipediaInstanceToDB();
    }
}
