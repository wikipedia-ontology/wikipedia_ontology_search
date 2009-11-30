package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.net.*;
import java.util.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.sparql.vocabulary.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/06
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyUtilities {

    public static void saveRDFFile(Model model, String fileName) {
        RDFWriter writer = model.getWriter("RDF/XML-ABBREV");
        try {
            writer.write(model, new OutputStreamWriter(new FileOutputStream(fileName), "UTF-8"), "");
        } catch (UnsupportedEncodingException ex) {
            ex.printStackTrace();
        } catch (FileNotFoundException ex) {
            ex.printStackTrace();
        }
    }

    private static Comparator<Resource> propComparator = new Comparator<Resource>() {
        public int compare(Resource p1, Resource p2) {
            return p1.getURI().compareTo(p2.getURI());
        }
    };

    private static Comparator<RDFNode> rdfNodeComparator = new Comparator<RDFNode>() {
        public int compare(RDFNode rn1, RDFNode rn2) {
            return rn1.toString().compareTo(rn2.toString());
        }
    };

    public static Property instanceProperty = ResourceFactory
            .createProperty("http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/instance");

    public static String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "UnknownHost";
    }

    public static Map<Property, Set<RDFNode>> getPropertyRDFNodeMap(Model outputModel, Resource uri) {
        Map<Property, Set<RDFNode>> propertyRDFNodeMap = new TreeMap<Property, Set<RDFNode>>(propComparator);
        for (StmtIterator i = outputModel.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            Resource subject = stmt.getSubject();
            RDFNode object = stmt.getObject();
            if (subject.equals(uri)) {
                Property predicate = stmt.getPredicate();
                if (propertyRDFNodeMap.get(predicate) != null) {
                    Set<RDFNode> rdfNodeSet = propertyRDFNodeMap.get(predicate);
                    rdfNodeSet.add(object);
                } else {
                    Set<RDFNode> rdfNodeSet = new TreeSet<RDFNode>(rdfNodeComparator);
                    rdfNodeSet.add(object);
                    propertyRDFNodeMap.put(predicate, rdfNodeSet);
                }
            } else if (object.equals(uri)) {
                if (propertyRDFNodeMap.get(instanceProperty) != null) {
                    Set<RDFNode> rdfNodeSet = propertyRDFNodeMap.get(instanceProperty);
                    rdfNodeSet.add(subject);
                } else {
                    Set<RDFNode> rdfNodeSet = new TreeSet<RDFNode>(rdfNodeComparator);
                    rdfNodeSet.add(subject);
                    propertyRDFNodeMap.put(instanceProperty, rdfNodeSet);
                }
            }
        }
        return propertyRDFNodeMap;
    }

    public static String getRDFString(Model outputModel, String type) {
        RDFWriter writer = outputModel.getWriter(type);
        StringWriter strWriter = new StringWriter();
        writer.write(outputModel, strWriter, "");
        return strWriter.toString();
    }

    public static void writeFile(File outputFile, String outputString) {
        if (outputFile != null && !outputFile.exists() && outputFile.getName().indexOf("queryString") == -1
                && 0 < outputString.length()) {
            try {
                BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(outputFile),
                        "UTF-8"));
                writer.write(outputString);
                writer.close();
            } catch (IOException ioe) {
                ioe.printStackTrace();
            }
        }
    }

    public static String getQname(Resource res) {
        String prefix = "";
        String localName = "";
        if (res.getURI().contains(WikipediaOntologyStorage.CLASS_NS)) {
            prefix = "wikiont_class";
            localName = res.getURI().split(WikipediaOntologyStorage.CLASS_NS)[1];
        } else if (res.getURI().contains(WikipediaOntologyStorage.PROPERTY_NS)) {
            prefix = "wikiont_property";
            localName = res.getURI().split(WikipediaOntologyStorage.PROPERTY_NS)[1];
        } else if (res.getURI().contains(WikipediaOntologyStorage.INSTANCE_NS)) {
            prefix = "wikiont_instance";
            localName = res.getURI().split(WikipediaOntologyStorage.INSTANCE_NS)[1];
        } else if (res.getURI().contains(OWL.getURI())) {
            prefix = "owl";
            localName = res.getURI().split(OWL.getURI())[1];
        } else if (res.getURI().contains(RDFS.getURI())) {
            prefix = "rdfs";
            localName = res.getURI().split(RDFS.getURI())[1];
        } else if (res.getURI().contains(RDF.getURI())) {
            prefix = "rdf";
            localName = res.getURI().split(RDF.getURI())[1];
        } else if (res.getURI().contains(FOAF.getURI())) {
            prefix = "foaf";
            localName = res.getURI().split(FOAF.getURI())[1];
        } else {
            return res.getURI();
        }
        return prefix + ":" + localName;
    }

    public static String getLocalName(Resource res) {
        String localName = "";
        if (res.getURI().contains(WikipediaOntologyStorage.CLASS_NS)) {
            localName = res.getURI().split("class/")[1];
        } else if (res.getURI().contains(WikipediaOntologyStorage.PROPERTY_NS)) {
            localName = res.getURI().split("property/")[1];
        } else if (res.getURI().contains(WikipediaOntologyStorage.INSTANCE_NS)) {
            localName = res.getURI().split("instance/")[1];
        } else {
            return null;
        }
        return localName;
    }

}
