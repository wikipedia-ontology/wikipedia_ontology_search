package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.sql.*;
import java.util.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;
import net.java.ao.*;

import com.google.common.collect.*;
import com.hp.hpl.jena.datatypes.xsd.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.reasoner.*;
import com.hp.hpl.jena.sparql.vocabulary.*;
import com.hp.hpl.jena.tdb.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/05
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyStorage {

    private Model tdbModel;
    private ModelMaker modelMaker;
    private static EntityManager em;

    public static String H2_DB_PATH;
    public static String H2_DB_PROTOCOL;

    public static String ONTOLOGY_NS = "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/";
    public static String CLASS_NS = ONTOLOGY_NS + "class/";
    public static String PROPERTY_NS = ONTOLOGY_NS + "property/";
    public static String INSTANCE_NS = ONTOLOGY_NS + "instance/";
    public static Property INSTANCE_COUNT_PROPERTY = ResourceFactory.createProperty(ONTOLOGY_NS + "instanceCount");

    //    public static String WIKIPEDIA_ONTOLOGY_PATH = "/wikipedia_ontology";
    public static String WIKIPEDIA_ONTOLOGY_PATH = "E:/Users/t_morita/wikipedia_ontology/";
    public static String VERSION = "2010_11_14";
    private static final String BASE_WIKIPEDIA_ONTOLOGY_NAME = "_wikipedia_ontology_";

    private static final String ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH = WIKIPEDIA_ONTOLOGY_PATH
            + "refined_wikipedia_ontology_english_instance_2009_10_27.owl";
    private static final String JA_WIKIPEDIA_ONTOLOGY_FILE_PATH = WIKIPEDIA_ONTOLOGY_PATH
            + "refined_wikipedia_ontology_20101114ja.owl";
    private static final String JA_WIKIPEDIA_INSTANCE_FILE_PATH = WIKIPEDIA_ONTOLOGY_PATH
            + "wikipediaontology_instance_20101114ja.rdf";

    public WikipediaOntologyStorage() {
    }

    public static EntityManager getEntityManager() {
        if (em == null) {
            try {
                em = new EntityManager(new H2DatabaseProvider("jdbc:h2:" + H2_DB_PROTOCOL + H2_DB_PATH
                        + "/wikipedia_ontology_statistics_" + VERSION, "wikipedia_ontology", "wikiont"));
                em.migrate(ClassStatistics.class, PropertyStatistics.class, InstanceStatistics.class, TripleStatistics.class);
            } catch (SQLException sqle) {
                sqle.printStackTrace();
            }
        }
        return em;
    }

    public WikipediaOntologyStorage(String lang, String inferenceType) {
        try {
            String infLabel = "";
            if (inferenceType.equals("rdfs")) {
                infLabel = "_with_rdfs_inference";
            }
            tdbModel = TDBFactory.createModel(WIKIPEDIA_ONTOLOGY_PATH + lang +
                    BASE_WIKIPEDIA_ONTOLOGY_NAME + VERSION + infLabel);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Model getTDBModel() {
        return tdbModel;
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

    public void closeTDB() {
        tdbModel.close();
    }

    public static void storeWikipediaOntologyAndInstanceMemModel(boolean isInfModel, String lang, Model tdbModel) {
        Model ontModel = null;
        Model instanceModel = null;
        if (lang.equals("ja")) {
            ontModel = FileManager.get().loadModel(JA_WIKIPEDIA_ONTOLOGY_FILE_PATH);
            instanceModel = FileManager.get().loadModel(JA_WIKIPEDIA_INSTANCE_FILE_PATH);
        } else if (lang.equals("en")) {
            instanceModel = FileManager.get().loadModel(ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH);
        }

        Model model = null;
        if (isInfModel) {
            Model subInstanceModel = ModelFactory.createDefaultModel();
            int stmtCnt = 0;
            for (StmtIterator stmtIter = instanceModel.listStatements(); stmtIter.hasNext();) {
                stmtCnt++;
                subInstanceModel.add(stmtIter.nextStatement());
                if (stmtCnt % 100000 == 0) {
                    addInferenceModelToTDB(ontModel, subInstanceModel, tdbModel);
                    System.out.println("wikipedia ontology and instance (inference) triple size: " + stmtCnt);
                    subInstanceModel = ModelFactory.createDefaultModel();
                }
            }
            addInferenceModelToTDB(ontModel, subInstanceModel, tdbModel);
            System.out.println("wikipedia ontology and instance (inference) triple size: " + stmtCnt);
        } else {
            model = ModelFactory.createDefaultModel();
            model.add(ontModel);
            model.add(instanceModel);
            int stmtCnt = 0;
            for (StmtIterator stmtIter = model.listStatements(); stmtIter.hasNext();) {
                stmtCnt++;
                stmtIter.nextStatement();
            }
            System.out.println("wikipedia ontology and instance triple size: " + stmtCnt);
            tdbModel.add(model);
        }
    }

    private static void addInferenceModelToTDB(Model ontModel, Model subInstanceModel, Model tdbModel) {
        Reasoner rdfsReasoner = ReasonerRegistry.getRDFSSimpleReasoner();
        Reasoner reasoner = rdfsReasoner.bindSchema(ontModel);
        System.out.println("Constructing Inference Model");
        Model model = ModelFactory.createInfModel(reasoner, subInstanceModel);
        System.out.println("Inference Model Constructed");
        tdbModel.add(model);
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
        WikipediaOntologyUtils.saveRDFFile(refinedInstanceModel, "ontology/refined_wikipedia_ontology_english_instance.owl");
        int stmtCnt = 0;
        for (StmtIterator stmtIter = refinedInstanceModel.listStatements(); stmtIter.hasNext();) {
            stmtCnt++;
            stmtIter.nextStatement();
        }
        System.out.println("wikipedia instance triple size: " + stmtCnt);

        return refinedInstanceModel;
    }

    public static Model getWikipediaClassMemModel(String lang) {
        Model classModel = ModelFactory.createDefaultModel();
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        Model ontologyAndInstanceModel = wikiOntStrage.getTDBModel();
        for (StmtIterator stmtIter = ontologyAndInstanceModel.listStatements(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            String subjectURI = stmt.getSubject().getURI();
            if (subjectURI.contains(CLASS_NS)) {
                classModel.add(stmt);
            }
        }
        return addInstanceCnt(classModel, ontologyAndInstanceModel);
    }

    public static Model getInstanceMemModel(String lang) {
        if (lang.equals("en")) {
            return FileManager.get().loadModel(ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH);
        } else if (lang.equals("ja")) {
            Model instanceModel = ModelFactory.createDefaultModel();
            WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
            Model ontologyAndInstanceModel = wikiOntStrage.getTDBModel();
            for (StmtIterator stmtIter = ontologyAndInstanceModel.listStatements(); stmtIter.hasNext();) {
                Statement stmt = stmtIter.nextStatement();
                String subjectURI = stmt.getSubject().getURI();
                if (subjectURI.contains(INSTANCE_NS)) {
                    instanceModel.add(stmt);
                }
            }
            return instanceModel;
        }
        return null;
    }

    private static void storeWikipediaOntologyAndInstanceToTDB(String lang, boolean isInfModel) {
        try {
            String infLabel = "";
            if (isInfModel) {
                infLabel = "_with_rdfs_inference";
            }
            Model tdbModel = TDBFactory.createModel(WIKIPEDIA_ONTOLOGY_PATH + lang +
                    BASE_WIKIPEDIA_ONTOLOGY_NAME + VERSION + infLabel);
            storeWikipediaOntologyAndInstanceMemModel(isInfModel, lang, tdbModel);
            tdbModel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public Set<Resource> getAllClasses(Model dbModel) {
        this.tdbModel = dbModel;
        Set<Resource> clsSet = Sets.newHashSet();
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

    private static Model addInstanceCnt(Model classModel, Model ontologyAndInstanceModel) {
        Model instanceCntModel = ModelFactory.createDefaultModel();
        for (ResIterator resIter = classModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            int instanceCnt = 0;
            for (ResIterator instanceIter = ontologyAndInstanceModel.listSubjectsWithProperty(RDF.type, cls); instanceIter.hasNext();) {
                instanceIter.nextResource();
                instanceCnt++;
            }
            System.out.println(cls + ": " + instanceCnt);
            Literal instanceCntLiteral = ResourceFactory.createTypedLiteral(String.valueOf(instanceCnt),
                    XSDDatatype.XSDint);
            instanceCntModel.add(ResourceFactory.createStatement(cls, INSTANCE_COUNT_PROPERTY, instanceCntLiteral));
        }
        classModel.add(instanceCntModel);
        return classModel;
    }

    public static void storeAllClassesToFile(String lang) {
        Model classModel = getWikipediaClassMemModel(lang);
        WikipediaOntologyUtils.saveRDFFile(classModel, "C:/Users/t_morita/wikipedia_ontology/ALLClasses.owl");
    }

    public static void main(String[] args) {
//        storeWikipediaOntologyAndInstanceToTDB("ja", false);
//        storeWikipediaOntologyAndInstanceToTDB("ja", true);
        // storeWikipediaOntologyAndInstanceToTDB("en", false);
        // storeWikipediaOntologyAndInstanceToDB(isInfModel, lang);
        // storeEnglishWikipediaInstanceToDB();
//        storeAllClassesToFile("ja");
    }
}
