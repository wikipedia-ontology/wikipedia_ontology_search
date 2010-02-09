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
    public static String ONTOLOGY_NS = "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/";
    public static String CLASS_NS = ONTOLOGY_NS + "class/";
    public static String PROPERTY_NS = ONTOLOGY_NS + "property/";
    public static String INSTANCE_NS = ONTOLOGY_NS + "instance/";
    public static Property instanceCount = ResourceFactory.createProperty(ONTOLOGY_NS + "instanceCount");

    private static final String BASE_ONTOLOGY_DIR = "C:/wikipedia_ontology/";
    private static final String BASE_ONTOLOGY_NAME = "_wikipedia_ontology_2010_02_09";

    private static final String WIKIPEDIA_ONTOLOGY_INFOBOX_FILE_PATH = BASE_ONTOLOGY_DIR
            + "wikipedia_ontology_infobox_20100126.owl";
    private static final String WIKIPEDIA_INSTANCE_FILE_PATH = BASE_ONTOLOGY_DIR + "wikipedia_instance_20091120.owl";
    private static final String ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH = BASE_ONTOLOGY_DIR
            + "refined_wikipedia_ontology_english_instance_2009_10_27.owl";
    private static final String WIKIPEDIA_ONTOLOGY_FILE_PATH = BASE_ONTOLOGY_DIR + "wikipedia_ontology_20091120.owl";

    public WikipediaOntologyStorage() {
    }

    public static EntityManager getEntityManager() {
        if (em == null) {
            try {
                em = new EntityManager(
                        new H2DatabaseProvider("jdbc:h2:tcp://localhost/~/h2db/wikipedia_ontology_statistics",
                                "wikipedia_ontology", "wikiont"));
                em.migrate(ClassStatistics.class, PropertyStatistics.class, TripleStatistics.class);
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
            tdbModel = TDBFactory.createModel(BASE_ONTOLOGY_DIR + lang + BASE_ONTOLOGY_NAME + infLabel);
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

    public static Model getWikipediaOntologyAndInstanceMemModel(boolean isInfModel, String lang) {
        Model instanceModel = ModelFactory.createDefaultModel();
        Model ontModel = ModelFactory.createDefaultModel();
        if (lang.equals("ja")) {
            instanceModel = FileManager.get().loadModel(WIKIPEDIA_INSTANCE_FILE_PATH);
            instanceModel.add(FileManager.get().loadModel(WIKIPEDIA_ONTOLOGY_INFOBOX_FILE_PATH));
            ontModel = FileManager.get().loadModel(WIKIPEDIA_ONTOLOGY_FILE_PATH);
        } else if (lang.equals("en")) {
            instanceModel.add(FileManager.get().loadModel(ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH));
        }

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
        WikipediaOntologyUtils.saveRDFFile(refinedInstanceModel,
                "ontology/refined_wikipedia_ontology_english_instance.owl");
        System.out.println("wikipedia instance triple size: " + refinedInstanceModel.listStatements().toSet().size());

        return refinedInstanceModel;
    }

    public static Model getWikipediaOntologyMemModel(String lang) {
        return FileManager.get().loadModel("C:/wikipedia_ontology/classes_" + lang + ".owl");
    }

    public static Model getInstanceMemModel(String lang) {
        if (lang.equals("en")) {
            return FileManager.get().loadModel(ENGLISH_WIKIPEDIA_INSTANCE_FILE_PATH);
        } else if (lang.equals("ja")) {
            Model ontModel = FileManager.get().loadModel(WIKIPEDIA_INSTANCE_FILE_PATH);
            ontModel.add(FileManager.get().loadModel(WIKIPEDIA_ONTOLOGY_INFOBOX_FILE_PATH));
            return ontModel;
        }
        return null;
    }

    /**
     * Wikipediaオントロジーをデータベースに格納する
     *
     * @param modelName
     * @param isInfModel
     */
    public void storeWikipediaOntologyToDB(String modelName, String lang) {
        try {
            Model dbModel = getDBModel(modelName);
            dbModel.add(getWikipediaOntologyMemModel(lang));
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
    public void storeWikipediaOntologyAndInstanceToDB(String modelName, String lang, boolean isInfModel) {
        try {
            Model dbModel = getDBModel(modelName);
            dbModel.add(getWikipediaOntologyAndInstanceMemModel(isInfModel, lang));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void storeWikipediaOntologyAndInstanceToTDB(String lang, boolean isInfModel) {
        try {
            String infLabel = "";
            if (isInfModel) {
                infLabel = "_with_rdfs_inference";
            }
            Model tdbModel = TDBFactory.createModel(BASE_ONTOLOGY_DIR + lang + BASE_ONTOLOGY_NAME + infLabel);
            tdbModel.add(getWikipediaOntologyAndInstanceMemModel(isInfModel, lang));
            tdbModel.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void saveFixWikipediaOntologyToFile(Model model, String lang) {
        Set<Resource> clsSet = getAllClasses(model);
        Model outputModel = addInstanceCnt(getAllClassesModel(clsSet), model);
        System.out.println("output: " + outputModel.size());
        WikipediaOntologyUtils.saveRDFFile(outputModel, "C:/wikipedia_ontology/classes_" + lang + ".owl");
        WikipediaOntologyUtils.getRDFString(outputModel, "RDF/XML-ABBREV");
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

    public Model getAllClassesModel(Set<Resource> clsSet) {
        Model outputModel = ModelFactory.createDefaultModel();
        Model loopModel = ModelFactory.createDefaultModel();
        for (Resource cls : clsSet) {
            List<Resource> supClassList = Lists.newArrayList();
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

    private static void storeWikipediaOntologyToFile(String lang) {
        WikipediaOntologyStorage wikiOntStorage = new WikipediaOntologyStorage();
        Model model = wikiOntStorage.getWikipediaOntologyAndInstanceMemModel(false, lang);
        wikiOntStorage.saveFixWikipediaOntologyToFile(model, lang);
    }

    public static void main(String[] args) {
        boolean isInfModel = false;
        String lang = "en";
        storeWikipediaOntologyAndInstanceToTDB("ja", true);
        // storeWikipediaOntologyAndInstanceToTDB("en", false);
        // storeWikipediaOntologyAndInstanceToDB(isInfModel, lang);
        // storeWikipediaOntologyToFile(lang);
        // storeWikipediaOntologyToDB();
        // storeEnglishWikipediaInstanceToDB();
    }
}
