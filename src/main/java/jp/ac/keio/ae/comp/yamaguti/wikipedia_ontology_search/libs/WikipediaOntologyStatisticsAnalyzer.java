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
        Model ontModel = WikipediaOntologyStorage.getWikipediaOntologyMemModel(lang);
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            String clsName = WikipediaOntologyUtils.getLocalName(cls);
            int numberOfInstances = cls.getProperty(WikipediaOntologyStorage.INSTANCE_COUNT_PROPERTY).getLiteral().getInt();
            if (0 < clsName.length()) {
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

    private static void storeInstanceStatisticsToDB(String lang) {
        Model ontModel = WikipediaOntologyStorage.getWikipediaOntologyAndInstanceMemModel(false, lang);
        setInstanceToType(ontModel);
    }

    private static void storePropertyStatisticsToDB(String lang) {
        Model ontModel = WikipediaOntologyStorage.getInstanceMemModel(lang);

        Map<Property, Set<Resource>> propertyInstanceMap = Maps.newHashMap();
        setPropertyInstanceMap(ontModel, propertyInstanceMap, OWL.ObjectProperty);
        setPropertyInstanceMap(ontModel, propertyInstanceMap, OWL.DatatypeProperty);

        setProperty(propertyInstanceMap, ontModel);
    }

    private static void setProperty(Map<Property, Set<Resource>> propertyInstanceMap, Model ontModel) {
        for (Entry<Property, Set<Resource>> entry : propertyInstanceMap.entrySet()) {
            Property property = entry.getKey();
            Set<Resource> resSet = entry.getValue();
            setProperty(ontModel, property, resSet.size());
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

    private static void setPropertyInstanceMap(Model instanceModel, Map<Property, Set<Resource>> propertyInstanceMap,
            Resource cls) {
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

    private static PropertyStatistics setProperty(Model ontModel, Property property, int instanceCount) {
        Literal propertyLiteral = (Literal) ontModel.listObjectsOfProperty(property, RDFS.label).toList().get(0);
        String propertyLabel = propertyLiteral.getString();
        try {
            PropertyStatistics p = WikipediaOntologyStorage.getEntityManager().create(PropertyStatistics.class);
            p.setName(propertyLabel);
            if (property.getURI().length() < 250) {
                p.setURI(property.getURI());
            } else {
                System.out.println("over 250 char property:" + property.getURI());
                p.setURI(WikipediaOntologyStorage.PROPERTY_NS);
            }
            p.setNumberOfInstances(instanceCount);
            p.save();
            System.out.println("Property: " + propertyLabel);
            return p;
        } catch (SQLException e) {
            e.printStackTrace();
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

        int classCount = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class).toSet().size();
        Set<Resource> objectPropertySet = ontModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty).toSet();
        int objectPropretyCount = objectPropertySet.size();
        Set<Resource> datatypePropertySet = ontModel.listSubjectsWithProperty(RDF.type, OWL.DatatypeProperty).toSet();
        int datatypePropretyCount = datatypePropertySet.size();

        Set<Resource> instanceSet = new HashSet<Resource>();
        Set<Resource> propertySet = new HashSet<Resource>();
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
                    && !(object.equals(OWL.Class) || object.equals(OWL.ObjectProperty) || object
                            .equals(OWL.DatatypeProperty))) {
                typeCount++;
            }

            if (subject.getURI().contains("wikipedia_ontology/instance/")) {
                instanceSet.add(subject);
            }

            if (predicate.getURI().contains("wikipedia_ontology/property/")) {
                propertySet.add(predicate);
            }

            if (object.isResource()) {
                Resource res = (Resource) object;
                if (res.getURI().contains("wikipedia_ontology/instance/")) {
                    instanceSet.add(res);
                }
            }
        }
        int instanceCount = instanceSet.size();
        int propertyCount = propertySet.size();
        int statementCount = ontModel.listStatements().toSet().size();
        int resourceCount = classCount + propertyCount + instanceCount;

        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        try {
            TripleStatistics ts1 = em.create(TripleStatistics.class);
            ts1.setLang(lang);
            ts1.setInferenceType(inferenceType);

            ts1.setClassCount(classCount);
            ts1.setDatatypePropertyCount(datatypePropretyCount);
            ts1.setInstanceCount(instanceCount);
            ts1.setIsaCount(isaCount);
            ts1.setObjectPropertyCount(objectPropretyCount);
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
        // countAllSortsOfTriplesAndStoreDB("ja", "none");
        // countAllSortsOfTriplesAndStoreDB("en", "none");
        // countAllSortsOfTriplesAndStoreDB("ja", "rdfs");
        // countAllSortsOfTriplesAndStoreDB("en", "");

        // String lang = "ja";
        // storeClassStatisticsToDB(lang);
        // storePropertyStatisticsToDB("ja");
        // storeInstanceStatisticsToDB("ja");
    }

}
