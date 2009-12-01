package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;
import java.util.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/29
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyUtils {

    /**
     * ループしているステートメントを除去するメソッド
     *
     * @param ontModel
     * @return
     */
    public static Model removeLoopModel(Model ontModel) {
        Model loopModel = ModelFactory.createDefaultModel();
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            List<Resource> supClassList = new ArrayList<Resource>();
            supClassList.add(cls);
            checkLoop(cls, supClassList, loopModel);
        }
        ontModel.remove(loopModel);
        return ontModel;
    }

    private static void checkLoop(Resource res, List<Resource> supClassList, Model loopModel) {
        for (StmtIterator stmtIter = res.listProperties(RDFS.subClassOf); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            Resource object = (Resource) stmt.getObject();
            if (!supClassList.contains(object)) {
                supClassList.add(object);
                checkLoop(object, supClassList, loopModel);
            } else {
                loopModel.add(stmt);
            }
        }
    }

    /**
     * クラスとサブクラスのセットのマップを返すメソッド． ルートノードのセットとリーフノードのセットを求める際に必要．
     *
     * @param ontModel
     * @return
     */
    public static Map<Resource, Set<Resource>> getClassSubClassMap(Model ontModel) {
        Map<Resource, Set<Resource>> classSubClassMap = new HashMap<Resource, Set<Resource>>();
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            if (classSubClassMap.get(cls) == null) {
                Set<Resource> subClassSet = new HashSet<Resource>();
                classSubClassMap.put(cls, subClassSet);
            }
            for (StmtIterator stmtIter = cls.listProperties(RDFS.subClassOf); stmtIter.hasNext();) {
                Statement stmt = stmtIter.nextStatement();
                Resource supCls = (Resource) stmt.getObject();
                if (classSubClassMap.get(supCls) != null) {
                    Set<Resource> subClassSet = classSubClassMap.get(supCls);
                    subClassSet.add(cls);
                } else {
                    Set<Resource> subClassSet = new HashSet<Resource>();
                    subClassSet.add(cls);
                    classSubClassMap.put(supCls, subClassSet);
                }
            }
        }
        return classSubClassMap;
    }

    /**
     * ルートノードのクラスを返すメソッド
     *
     */
    private static Set<Resource> getRootClassSet(Map<Resource, Set<Resource>> classSubClassMap) {
        Set<Resource> rootClassSet = new HashSet<Resource>();
        for (Resource cls : classSubClassMap.keySet()) {
            boolean isRoot = true;
            for (Set<Resource> subClassSet : classSubClassMap.values()) {
                if (subClassSet.contains(cls)) {
                    isRoot = false;
                    break;
                }
            }
            if (isRoot) {
                rootClassSet.add(cls);
            }
        }
        return rootClassSet;
    }

    /**
     * リーフノード（リソース）のセットを返すメソッド
     *
     * @param classSubClassMap
     * @return
     */
    public static Set<Resource> getLeafClassSet(Map<Resource, Set<Resource>> classSubClassMap) {
        Set<Resource> leafClassSet = new HashSet<Resource>();
        for (Resource cls : classSubClassMap.keySet()) {
            if (classSubClassMap.get(cls).size() == 0) {
                if (cls.listProperties(RDFS.subClassOf).toSet().size() != 0) {
                    leafClassSet.add(cls);
                }
            }
        }
        return leafClassSet;
    }

    public static void main(String[] args) {
        Model ontModel = FileManager.get().loadModel("ontology/new_wikipedia_ontology_class.owl");
        System.out.println(ontModel.size());
        ontModel = WikipediaOntologyUtils.removeLoopModel(ontModel);
        System.out.println(ontModel.size());
        Map<Resource, Set<Resource>> classSubClassMap = getClassSubClassMap(ontModel);
        System.out.println("total class num:" + classSubClassMap.keySet().size());
        Set<Resource> rootClsSet = WikipediaOntologyUtils.getRootClassSet(classSubClassMap);
        System.out.println("root class num: " + rootClsSet.size());
        // for (Resource cls : rootClsSet) {
        // System.out.println("root: " + cls);
        // }
        Set<Resource> leafClsSet = WikipediaOntologyUtils.getLeafClassSet(classSubClassMap);
        System.out.println("leaf class num: " + leafClsSet.size());
        // for (Resource cls : leafClsSet) {
        // System.out.println("leaf: " + cls);
        // }
        System.out.println("internal class num: "
                + (classSubClassMap.keySet().size() - rootClsSet.size() - leafClsSet.size()));
    }
}
