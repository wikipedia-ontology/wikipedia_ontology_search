package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.util.*;

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

    public static void countAllSortsOfTriples() {
        Model infoboxModel = FileManager.get().loadModel("./ontology/wikipedia_ontology_infobox_20091120.owl");
        Model instanceModel = FileManager.get().loadModel("./ontology/wikipedia_instance_20091120.owl");
//        Model instanceModel = FileManager.get().loadModel("./ontology/wikipedia_ontology_english_instance.owl");
        Model ontModel = FileManager.get().loadModel("./ontology/wikipedia_ontology_20091120.owl");
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
        countAllSortsOfTriples();
    }

}
