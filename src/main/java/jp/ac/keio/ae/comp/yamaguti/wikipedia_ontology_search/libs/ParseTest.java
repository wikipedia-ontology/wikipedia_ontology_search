/*
 * @(#)  2010/12/15
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.RDF;
import com.hp.hpl.jena.vocabulary.RDFS;

/**
 * @author takeshi morita
 */
public class ParseTest {
    public static void main(String[] args) {
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage("ja", "rdfs");
        Model model = wikiOntStrage.getTDBModel();
        Resource resource = ResourceFactory.createResource(WikipediaOntologyStorage.CLASS_NS + "ナトリウムの化合物");
        for (NodeIterator i = model.listObjectsOfProperty(resource, RDFS.subClassOf); i.hasNext();) {
            RDFNode node = i.nextNode();
            System.out.println(node);
        }
//        String format = "N-TRIPLE";
//        Model model = ModelFactory.createDefaultModel();
//        model.add(FileManager.get().loadModel("C:/Users/t_morita/Desktop/test.n3", format));
//        for (StmtIterator i = model.listStatements(); i.hasNext();) {
//            Statement stmt = i.nextStatement();
//            if (stmt.getPredicate().equals(RDF.type)) {
//                System.out.println(stmt.getSubject());
//            }
//            System.out.println(stmt.getPredicate());
//            System.out.println(stmt.getObject());
//        }
    }
}
