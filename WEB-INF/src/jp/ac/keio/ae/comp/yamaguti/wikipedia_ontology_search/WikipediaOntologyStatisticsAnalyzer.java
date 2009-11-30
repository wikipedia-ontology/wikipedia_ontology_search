package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.net.*;
import java.util.*;
import java.util.Map.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/26
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyStatisticsAnalyzer {

    private static Comparator<Resource> resComparator = new Comparator<Resource>() {
        public int compare(Resource cls1, Resource cls2) {
            return cls1.getURI().compareTo(cls2.getURI());
        }
    };

    private static Comparator<Integer> descendingComparator = new Comparator<Integer>() {
        public int compare(Integer n1, Integer n2) {
            return n2.compareTo(n1);
        }
    };

    public static void rankClassesByNumberOfInstances() {
        StringBuilder builder = new StringBuilder();
        Model ontModel = FileManager.get().loadModel("ontology/ALLClasses.owl");
        Map<Integer, Set<Resource>> numClsMap = new TreeMap<Integer, Set<Resource>>(descendingComparator);

        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            int numberOfInstances = cls.getProperty(WikipediaOntologyStorage.instanceCount).getLiteral().getInt();
            if (numClsMap.get(numberOfInstances) != null) {
                Set<Resource> clsSet = numClsMap.get(numberOfInstances);
                clsSet.add(cls);
            } else {
                Set<Resource> clsSet = new TreeSet<Resource>(resComparator);
                clsSet.add(cls);
                numClsMap.put(numberOfInstances, clsSet);
            }
        }

        builder.append("<ol>\n");
        for (Entry<Integer, Set<Resource>> entry : numClsMap.entrySet()) {
            int numberOfInstance = entry.getKey();
            Set<Resource> clsSet = entry.getValue();
            for (Resource cls : clsSet) {
                Literal label = cls.getProperty(RDFS.label).getLiteral();
                try {
                    String url = WikipediaOntologyStorage.CLASS_NS + URLEncoder.encode(label.getString(), "UTF-8");
                    String rdfUrl = WikipediaOntologyStorage.CLASS_NS + "data/"
                            + URLEncoder.encode(label.getString() + ".rdf", "UTF-8");
                    builder.append("<li><a href=\"");
                    builder.append(url);
                    builder.append("\">");
                    builder.append(label.getString());
                    builder.append("</a>（");
                    builder.append(numberOfInstance);
                    builder.append("） (<a href=\"");
                    builder.append(rdfUrl);
                    builder.append("\">RDF/XML</a>)</li>\n");
                } catch (UnsupportedEncodingException exp) {
                    exp.printStackTrace();
                }
            }
        }
        builder.append("</ol>\n");
        writeFile(builder);
    }

    public static void rankInfoboxPropertiesByNumberOfInstances() {
        StringBuilder builder = new StringBuilder();
        Model ontModel = FileManager.get().loadModel("ontology/wikipedia_ontology_infobox_20091120.owl");
        Model instanceModel = FileManager.get().loadModel("ontology/wikipedia_instance_20091120.owl");
        ontModel.add(instanceModel);

        Map<Integer, Set<Property>> numPropertySetMap = new TreeMap<Integer, Set<Property>>(descendingComparator);
        Map<Property, Set<Resource>> propertyInstanceMap = new HashMap<Property, Set<Resource>>();
        System.out.println("ObjectProperty数: "
                + ontModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty).toSet().size());
        for (ResIterator propIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty); propIter.hasNext();) {
            Property property = ResourceFactory.createProperty(propIter.nextResource().getURI());
            Set<Resource> resSet = new TreeSet<Resource>(resComparator);
            propertyInstanceMap.put(property, resSet);
            for (ResIterator i = ontModel.listSubjectsWithProperty(property); i.hasNext();) {
                Resource res = i.nextResource();
                propertyInstanceMap.get(property).add(res);
            }
        }
        for (Map.Entry<Property, Set<Resource>> entry : propertyInstanceMap.entrySet()) {
            Property property = entry.getKey();
            Set<Resource> resSet = entry.getValue();
            int cnt = resSet.size();
            if (numPropertySetMap.get(cnt) != null) {
                Set<Property> propertySet = numPropertySetMap.get(cnt);
                propertySet.add(property);
            } else {
                Set<Property> propertySet = new TreeSet<Property>(resComparator);
                propertySet.add(property);
                numPropertySetMap.put(cnt, propertySet);
            }
        }

        builder.append("<ol>\n");
        for (Set<Property> propertySet : numPropertySetMap.values()) {
            for (Property property : propertySet) {
                Literal propertyLiteral = (Literal) ontModel.listObjectsOfProperty(property, RDFS.label).toList()
                        .get(0);
                String propertyLabel = propertyLiteral.getString();
                // String propertyLabel =
                // property.getProperty(RDFS.label).getLiteral().getString();
                Set<Resource> resSet = propertyInstanceMap.get(property);
                builder.append("<li><a href=\"");
                builder.append(property);
                builder.append("\">wikiont_property:");
                builder.append(propertyLabel + "</a>");
                builder.append(" (" + resSet.size() + ")");
                builder.append("<ul>");
                int cnt = 0;
                for (Resource res : resSet) {
                    if (cnt == 50) {
                        break;
                    }
                    if (res.hasProperty(RDFS.label)) {
                        try {
                            builder.append("<li>");
                            String label = res.getProperty(RDFS.label).getLiteral().getString();
                            String typeURL = "";
                            String typeLabel = "";
                            if (res.hasProperty(RDF.type)) {
                                Resource type = (Resource) res.getProperty(RDF.type).getObject();
                                typeLabel = type.getProperty(RDFS.label).getLiteral().getString();
                                typeURL = WikipediaOntologyStorage.CLASS_NS + URLEncoder.encode(typeLabel, "UTF-8");
                            }
                            String url = WikipediaOntologyStorage.INSTANCE_NS + URLEncoder.encode(label, "UTF-8");
                            builder.append("<a href=\"");
                            builder.append(url);
                            builder.append("\">wikiont_instance:");
                            builder.append(label);
                            builder.append("</a>");
                            if (0 < typeLabel.length()) {
                                builder.append(" rdf:type <a href=\"");
                                builder.append(typeURL);
                                builder.append("\">wikiont_class:");
                                builder.append(typeLabel);
                                builder.append("</a>");
                            }
                            builder.append("</li>\n");
                            cnt++;
                        } catch (UnsupportedEncodingException exp) {
                            exp.printStackTrace();
                        }
                    }
                }
                builder.append("</ul>");
                builder.append("</li>\n");
            }
        }
        builder.append("</ol>\n");
        writeFile(builder);
    }

    private static void writeFile(StringBuilder builder) {
        try {
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(new File(
                    "temp/number_of_instances.html")), "UTF-8"));
            writer.write(builder.toString());
            writer.close();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }

    public static void getRDFTest() {
        String url = "http://localhost:8080/wikipedia_ontology/class/アップルコンピュータ";
        try {
            URL urlObj = new URL(url);
            HttpURLConnection urlCon = (HttpURLConnection) urlObj.openConnection();
            urlCon.setRequestMethod("GET");
            HttpURLConnection.setFollowRedirects(true);
            urlCon.setRequestProperty("Accept", "application/rdf+xml");
            BufferedReader urlIn = new BufferedReader(new InputStreamReader(urlCon.getInputStream()));

            while (urlIn.ready()) {
                System.out.println(urlIn.readLine());
            }
            urlIn.close();
            urlCon.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void countAllSortsOfTriples() {
        Model infoboxModel = FileManager.get().loadModel("../ontology/wikipedia_ontology_infobox_20091120.owl");
        Model instanceModel = FileManager.get().loadModel("../ontology/wikipedia_instance_20091120.owl");
        Model ontModel = FileManager.get().loadModel("../ontology/wikipedia_ontology_20091120.owl");
        Model wikiontAndInstanceModel = ModelFactory.createDefaultModel();
        wikiontAndInstanceModel.add(infoboxModel);
        wikiontAndInstanceModel.add(instanceModel);
        wikiontAndInstanceModel.add(ontModel);

        int classCount = wikiontAndInstanceModel.listSubjectsWithProperty(RDF.type, OWL.Class).toSet().size();
        int objectPropretyCount = wikiontAndInstanceModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty)
                .toSet().size();
        int datatypePropretyCount = wikiontAndInstanceModel.listSubjectsWithProperty(RDF.type, OWL.DatatypeProperty)
                .toSet().size();
        System.out.println(objectPropretyCount);
        System.out.println(wikiontAndInstanceModel.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty).toSet());
        System.out.println(datatypePropretyCount);
        System.out.println(wikiontAndInstanceModel.listSubjectsWithProperty(RDF.type, OWL.DatatypeProperty).toSet());
        int propertyCount = objectPropretyCount + datatypePropretyCount;

        Set<Resource> instanceSet = new HashSet<Resource>();
        Set<Resource> propertySet = new HashSet<Resource>();
        int typeCount = 0;
        int isaCount = 0;
        for (StmtIterator i = wikiontAndInstanceModel.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            Resource subject = stmt.getSubject();
            Resource predicate = stmt.getPredicate();
            RDFNode object = stmt.getObject();

            if (predicate.equals(RDFS.subClassOf)) {
                // System.out.println("subClassOf:" + stmt);
                isaCount++;
            }

            if (predicate.equals(RDF.type)
                    && !(object.equals(OWL.Class) || object.equals(OWL.ObjectProperty) || object
                            .equals(OWL.DatatypeProperty))) {
                // System.out.println("type: " + stmt);
                typeCount++;
            }

            if (subject.getURI().contains("wikipedia_ontology/instance/")) {
                instanceSet.add(subject);
                // System.out.println("instance(s): " + subject);
            }

            if (predicate.getURI().contains("wikipedia_ontology/property/")) {
                propertySet.add(predicate);
            }

            if (object.isResource()) {
                Resource res = (Resource) object;
                if (res.getURI().contains("wikipedia_ontology/instance/")) {
                    instanceSet.add(res);
                    // System.out.println("instance(o): " + res);
                }
            }
        }
        int instanceCount = instanceSet.size();
        propertyCount = propertySet.size();
        int statementCount = wikiontAndInstanceModel.listStatements().toSet().size();
        int resourceCount = classCount + propertyCount + instanceCount;

        System.out.println("<tr><th>リソース数</th><td>" + resourceCount + "</td></tr>");
        System.out.println("<tr><th>クラス数</th><td>" + classCount + "</td></tr>");
        System.out.println("<tr><th>プロパティ数</th><td>" + propertyCount + "</td></tr>");
        System.out.println("<tr><th>オブジェクトプロパティ数</th><td>" + objectPropretyCount + "</td></tr>");
        System.out.println("<tr><th>データタイププロパティ数</th><td>" + datatypePropretyCount + "</td></tr>");
        System.out.println("<tr><th>インスタンス数</th><td>" + instanceCount + "</td></tr>");
        System.out.println("<tr><th>ステートメント数</th><td>" + statementCount + "</td></tr>");
        System.out.println("<tr><th>is-a関係の数</th><td>" + isaCount + "</td></tr>");
        System.out.println("<tr><th>タイプの数</th><td>" + typeCount + "</td></tr>");
    }

    public static void main(String[] args) {
        // rankClassesByNumberOfInstances();
        rankInfoboxPropertiesByNumberOfInstances();
        // countAllSortsOfTriples();
        // getRDFTest();
    }

}
