/*
 * @(#)  2010/12/10
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.io.*;
import java.util.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/**
 * @author takeshi morita
 */
public class MergeWikipediaOntology {
    public static void main(String[] args) throws Exception {
        String wiki_ont = "/home/t_morita/wikipedia_ontology/wikipedia_ontology_20100126.owl";
//         String ontology =
//         "/home/t_morita/wikipedia_ontology/wikipedia_ontology_20091120.owl";
//         String instance =
//         "/home/t_morita/wikipedia_ontology/wikipedia_instance_20091120.owl";
//         String infobox =
//         "/home/t_morita/wikipedia_ontology/wikipedia_ontology_infobox_20100126.owl";

        String format = "RDF/XML";
        Model model = ModelFactory.createDefaultModel();
        model.add(FileManager.get().loadModel(wiki_ont, format));
//         model.add(FileManager.get().loadModel(ontology, format));
//         model.add(FileManager.get().loadModel(instance, format));
//         model.add(FileManager.get().loadModel(infobox, format));

//        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(
//                "/home/t_morita/wikipedia_ontology/wikipedia_ontology_20100126.owl"), "UTF-8"));
        // model.write(writer, "TURTLE");
        //model.write(writer, "N-TRIPLE");
//        model.write(writer, "RDF/XML");
//        writer.close();
        
        int classCount = model.listSubjectsWithProperty(RDF.type, OWL.Class).toSet().size();
        Set<Resource> objectPropertySet = model.listSubjectsWithProperty(RDF.type, OWL.ObjectProperty).toSet();
        int objectPropretyCount = objectPropertySet.size();
        Set<Resource> datatypePropertySet = model.listSubjectsWithProperty(RDF.type, OWL.DatatypeProperty).toSet();
        int datatypePropretyCount = datatypePropertySet.size();

        Set<Resource> instanceSet = new HashSet<Resource>();
        Set<Resource> propertySet = new HashSet<Resource>();
        int typeCount = 0;
        int isaCount = 0;
        for (StmtIterator i = model.listStatements(); i.hasNext();) {
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
        int statementCount = model.listStatements().toSet().size();
        int resourceCount = classCount + propertyCount + instanceCount;
        System.out.println(instanceCount);
        System.out.println(propertyCount);
        System.out.println(statementCount);
        System.out.println(resourceCount);
        System.out.println(isaCount);
        System.out.println(typeCount);
        
    }
}
