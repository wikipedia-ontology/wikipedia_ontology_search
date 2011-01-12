/*
 * @(#)  2010/12/15
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;

/**
 * @author takeshi morita
 */
public class ParseTest {
    public static void main(String[] args) {
        String format = "N-TRIPLE";
        Model model = ModelFactory.createDefaultModel();
        model.add(FileManager.get().loadModel("/home/t_morita/tmp/wikiont_sample.nt", format));
        for (StmtIterator i = model.listStatements(); i.hasNext();) {
            Statement stmt = i.nextStatement();
            System.out.println(stmt.getSubject());
            System.out.println(stmt.getPredicate());
            System.out.println(stmt.getObject());
        }
    }
}
