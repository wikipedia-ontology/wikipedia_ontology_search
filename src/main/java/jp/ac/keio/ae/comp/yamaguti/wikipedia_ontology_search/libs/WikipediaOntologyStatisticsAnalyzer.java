package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.sql.*;
import java.util.*;
import java.util.Map.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;
import net.java.ao.*;

import com.google.common.collect.*;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/26
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyStatisticsAnalyzer {

    private static void storeClassStatisticsToDB(String lang) {
        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        Model ontModel = WikipediaOntologyStorage.getWikipediaClassMemModel(lang);
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            String clsName = WikipediaOntologyUtils.getLocalName(cls);
            int numberOfInstances = cls.getProperty(WikipediaOntologyStorage.INSTANCE_COUNT_PROPERTY).getLiteral().getInt();
            if (clsName != null && !clsName.equals("null") && 0 < clsName.length()) {
                try {
                    ClassStatistics clsStatistics = em.create(ClassStatistics.class);
                    clsStatistics.setClassName(clsName);
                    clsStatistics.setLanguage(lang);
                    clsStatistics.setInstanceCount(numberOfInstances);
                    clsStatistics.save();
                    System.out.println(lang + ": " + clsName + ": " + numberOfInstances);
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
            }
        }
    }

    private static void addInstanceToDB(EntityManager em, String instance) {
        try {
            InstanceStatistics insStatistics = em.create(InstanceStatistics.class);
            String uri = WikipediaOntologyStorage.INSTANCE_NS + instance;
            if (uri.length() < 250) {
                insStatistics.setName(instance);
                insStatistics.setURI(uri);
                insStatistics.save();
            } else {
                System.out.println("over 250 chars " + instance);
            }
            System.out.println(instance);
        } catch (SQLException sqle) {
            sqle.printStackTrace();
        }
    }

    private static void storeInstancesToDB(String lang) {
        Model ontModel = WikipediaOntologyStorage.getInstanceMemModel(lang);
        Set<String> instanceSet = Sets.newHashSet();
        for (StmtIterator stmtIter = ontModel.listStatements(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            Resource subject = stmt.getSubject();
            String localName = WikipediaOntologyUtils.getLocalName(subject);
            if (localName != null && !localName.equals("null") && 0 < localName.length()) {
                instanceSet.add(localName);
            }
            RDFNode object = stmt.getObject();
            if (object.isResource()) {
                Resource objectRes = (Resource) object;
                localName = WikipediaOntologyUtils.getLocalName(objectRes);
                if (localName != null && !localName.equals("null") && 0 < localName.length()) {
                    instanceSet.add(localName);
                }
            }
        }
        System.out.println("instance size: " + instanceSet.size());
        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        for (String instance : instanceSet) {
            addInstanceToDB(em, instance);
        }
    }

    /**
     * 現在，利用していない
     *
     * @param lang
     */
    private static void storeInstanceStatisticsToDB(String lang) {
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        setInstanceToType(wikiOntStrage.getTDBModel());
    }

    private static void storePropertyStatisticsToDB(String lang) {
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        Model ontologyAndInstanceModel = wikiOntStrage.getTDBModel();

        Map<Property, Set<Resource>> propertyInstanceMap = Maps.newHashMap();
        setPropertyInstanceMap(ontologyAndInstanceModel, propertyInstanceMap, OWL.ObjectProperty);
        setPropertyInstanceMap(ontologyAndInstanceModel, propertyInstanceMap, OWL.DatatypeProperty);

        storePropertyToDB(propertyInstanceMap);
    }

    private static void storePropertyToDB(Map<Property, Set<Resource>> propertyInstanceMap) {
        for (Entry<Property, Set<Resource>> entry : propertyInstanceMap.entrySet()) {
            Property property = entry.getKey();
            Set<Resource> resSet = entry.getValue();
            storePropertyToDB(property, resSet.size());
        }
    }

    private static void setInstanceToType(Model ontModel) {
        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        int cnt = 0;
        try {
            Map<Resource, TypeStatistics> resourceTypeMap = Maps.newHashMap();
            for (InstanceStatistics i : em.find(InstanceStatistics.class)) {
                Resource res = ontModel.getResource(i.getURI());
                if (cnt % 1000 == 0) {
                    System.out.println(cnt + ": " + res);
                }
                cnt++;
                for (StmtIterator stmtIter = res.listProperties(RDF.type); stmtIter.hasNext();) {
                    Statement stmt = stmtIter.nextStatement();
                    Resource type = (Resource) stmt.getObject();
                    TypeStatistics t = null;
                    if (resourceTypeMap.get(type) == null) {
                        t = setType(type);
                        resourceTypeMap.put(type, t);
                    } else {
                        t = resourceTypeMap.get(type);
                    }
                    if (t == null) {
                        continue;
                    }
                    try {
                        InstanceToType i2t = em.create(InstanceToType.class);
                        i2t.setInstanceStatistics(i);
                        i2t.setTypeStatistics(t);
                        i2t.save();
                    } catch (SQLException e) {
                        e.printStackTrace();
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void setPropertyInstanceMap(Model instanceModel, Map<Property, Set<Resource>> propertyInstanceMap, Resource cls) {
        for (ResIterator propIter = instanceModel.listSubjectsWithProperty(RDF.type, cls); propIter.hasNext();) {
            Property property = ResourceFactory.createProperty(propIter.nextResource().getURI());
            Set<Resource> resSet = Sets.newHashSet();
            propertyInstanceMap.put(property, resSet);
            for (ResIterator i = instanceModel.listSubjectsWithProperty(property); i.hasNext();) {
                Resource res = i.nextResource();
                propertyInstanceMap.get(property).add(res);
            }
        }
    }

    private static PropertyStatistics storePropertyToDB(Property property, int instanceCount) {
        String localName = WikipediaOntologyUtils.getLocalName(property);
        if (localName != null && !localName.equals("null") && 0 < localName.length()) {
            try {
                PropertyStatistics p = WikipediaOntologyStorage.getEntityManager().create(PropertyStatistics.class);
                p.setName(localName);
                if (property.getURI().length() < 250) {
                    p.setURI(property.getURI());
                } else {
                    System.out.println("over 250 char property:" + property.getURI());
                    p.setURI(WikipediaOntologyStorage.PROPERTY_NS);
                }
                p.setNumberOfInstances(instanceCount);
                p.save();
                System.out.println("Property: " + localName);
                return p;
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    private static InstanceStatistics setInstance(Resource res) {
        try {
            String label = res.getProperty(RDFS.label).getLiteral().getString();
            InstanceStatistics i = WikipediaOntologyStorage.getEntityManager().create(InstanceStatistics.class);
            i.setName(label);
            if (res.getURI().length() < 250) {
                i.setURI(res.getURI());
            } else {
                System.out.println("over 250 char instance:" + res.getURI());
                i.setURI(WikipediaOntologyStorage.INSTANCE_NS);
            }
            i.save();
            return i;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static TypeStatistics setType(Resource type) {
        try {
            String typeLabel = type.getProperty(RDFS.label).getLiteral().getString();
            TypeStatistics t = WikipediaOntologyStorage.getEntityManager().create(TypeStatistics.class);
            t.setName(typeLabel);
            if (type.getURI().length() < 250) {
                t.setURI(type.getURI());
            } else {
                System.out.println("over 250 char type: " + type.getURI());
                t.setURI(WikipediaOntologyStorage.CLASS_NS);
            }
            t.save();
            return t;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static void countAllSortsOfTriplesAndStoreDB(String lang, String inferenceType) {
        WikipediaOntologyStorage storage = new WikipediaOntologyStorage(lang, inferenceType);
        Model ontModel = storage.getTDBModel();

        int classCount = 0;
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            classCount++;
            resIter.nextResource();
        }
        int objectPropertyCount = 0;
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty); resIter.hasNext();) {
            objectPropertyCount++;
            resIter.nextResource();
        }
        int datatypePropertyCount = 0;
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.DatatypeProperty); resIter.hasNext();) {
            datatypePropertyCount++;
            resIter.nextResource();
        }

        Set<String> instanceLocalNameSet = Sets.newHashSet();
        Set<Resource> instanceSet = Sets.newHashSet();
        Set<Resource> propertySet = Sets.newHashSet();
        int typeCount = 0;
        int isaCount = 0;
        for (StmtIterator i = ontModel.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            Resource subject = stmt.getSubject();
            Resource predicate = stmt.getPredicate();
            RDFNode object = stmt.getObject();

            if (predicate.equals(RDFS.subClassOf)) {
                isaCount++;
            }

            if (predicate.equals(RDF.type)
                    && !(object.equals(OWL.Class) || object.equals(OWL.ObjectProperty) || object.equals(OWL.DatatypeProperty))) {
                typeCount++;
            }

            if (subject.getURI().contains("wikipedia_ontology/instance/")) {
                instanceSet.add(subject);
                String localName = WikipediaOntologyUtils.getLocalName(subject);
                if (localName != null && !localName.equals("null")) {
                    instanceLocalNameSet.add(localName);
                } else {
                    System.out.println(subject);
                }
            }

            if (predicate.getURI().contains("wikipedia_ontology/property/")) {
                propertySet.add(predicate);
            }

            if (object.isResource()) {
                Resource res = (Resource) object;
                if (res.getURI().contains("wikipedia_ontology/instance/")) {
                    instanceSet.add(res);
                    String localName = WikipediaOntologyUtils.getLocalName(subject);
                    if (localName != null && !localName.equals("null")) {
                        instanceLocalNameSet.add(localName);
                    } else {
                        System.out.println(res);
                    }
                }
            }
        }
        int instanceCount = instanceSet.size();
        System.out.println("instance_count: " + instanceLocalNameSet.size());
        int propertyCount = propertySet.size();
        int statementCount = 0;
        for (StmtIterator stmtIter = ontModel.listStatements(); stmtIter.hasNext();) {
            statementCount++;
            stmtIter.nextStatement();
        }
        int resourceCount = classCount + propertyCount + instanceCount;

        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        try {
            TripleStatistics ts1 = em.create(TripleStatistics.class);
            ts1.setLang(lang);
            ts1.setInferenceType(inferenceType);

            ts1.setClassCount(classCount);
            ts1.setDatatypePropertyCount(datatypePropertyCount);
            ts1.setInstanceCount(instanceCount);
            ts1.setIsaCount(isaCount);
            ts1.setObjectPropertyCount(objectPropertyCount);
            ts1.setPropertyCount(propertyCount);
            ts1.setResourceCount(resourceCount);
            ts1.setStatementCount(statementCount);
            ts1.setTypeCount(typeCount);
            ts1.save();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        WikipediaOntologyStorage.H2_DB_PATH = "C:/Users/t_morita/h2db/";
        WikipediaOntologyStorage.H2_DB_PROTOCOL = "tcp://localhost/";

//        storeClassStatisticsToDB("ja");
//        storePropertyStatisticsToDB("ja");
        storeInstancesToDB("ja");
//        storeClassStatisticsToDB("en");
//        storePropertyStatisticsToDB("en");

        countAllSortsOfTriplesAndStoreDB("ja", "none");
//        countAllSortsOfTriplesAndStoreDB("en", "none");
//        countAllSortsOfTriplesAndStoreDB("ja", "rdfs");
//        countAllSortsOfTriplesAndStoreDB("en", "rdfs");

    }

}
