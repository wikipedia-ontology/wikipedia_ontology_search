package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.io.*;
import java.net.*;
import java.util.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;

import org.apache.tools.ant.filters.*;
import org.apache.wicket.*;
import org.apache.wicket.ajax.*;
import org.apache.wicket.behavior.*;
import org.apache.wicket.markup.html.*;
import org.apache.wicket.markup.html.image.*;
import org.apache.wicket.markup.html.link.*;
import org.apache.wicket.markup.html.resources.*;
import org.apache.wicket.util.resource.*;

import com.google.common.collect.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.sparql.vocabulary.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/*
 * @(#)  2009/10/29
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologyUtils {

    public static ResourceReference getClassIconSReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/class_icon_s.png");
    }

    public static Image getClassIconS(String id) {
        return new Image(id, getClassIconSReference());
    }

    public static ResourceReference getPropertyIconSReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/property_icon_s.png");
    }

    public static Image getPropertyIconS(String id) {
        return new Image(id, getPropertyIconSReference());
    }

    public static ResourceReference getInstanceIconSReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/instance_icon_s.png");
    }

    public static Image getInstanceIconS(String id) {
        return new Image(id, getInstanceIconSReference());
    }

    public static ResourceReference getMinusIconReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/elbow-minus-nl.gif");
    }

    public static Image getMinusIcon(String id) {
        return new Image(id, getMinusIconReference());
    }

    public static ResourceReference getPlusIconReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/elbow-end-plus-nl.gif");
    }

    public static Image getPlusIcon(String id) {
        return new Image(id, getPlusIconReference());
    }

    public static ResourceReference getRDFIconReference() {
        return new ResourceReference(IndexPage.class, "myresources/icons/rdf_w3c_icon.16.png");
    }

    public static Image getRDFIcon(String id) {
        return new Image(id, getRDFIconReference());
    }

    public static ExternalLink getRDFLink(String uri, String type) {
        ExternalLink rdfLink = new ExternalLink(type + "_rdf_url", uri.replaceAll(type + "/", type + "/data/") + ".rdf");
        rdfLink.add(getRDFIcon("rdf_icon"));
        return rdfLink;
    }

    public static List<InstanceImpl> getInstanceImplList(String queryString, String lang) {
        Query query = QueryFactory.create(queryString);
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        Model dbModel = wikiOntStrage.getTDBModel();
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
        com.hp.hpl.jena.query.ResultSet results = qexec.execSelect();

        List<InstanceImpl> instanceList = Lists.newArrayList();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("instance");
                Literal label = (Literal) qs.get("label");
                InstanceImpl instance = new InstanceImpl(resource.getURI(), label.toString());
                if (!instanceList.contains(instance)) {
                    instanceList.add(instance);
                }
            }
        } finally {
            qexec.close();
        }
        return instanceList;
    }

    public static List<PropertyImpl> getPropertyImplList(String queryString, String lang) {
        Query query = QueryFactory.create(queryString);
        if (lang.equals("ja+en")) {
            lang = "ja";
        }
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        Model dbModel = wikiOntStrage.getTDBModel();
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
        com.hp.hpl.jena.query.ResultSet results = qexec.execSelect();

        List<PropertyImpl> propertyList = Lists.newArrayList();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("property");
                Literal label = (Literal) qs.get("label");
                RDFNode value = qs.get("value");
                PropertyImpl p = new PropertyImpl(resource.getURI(), label.toString(), value.toString());
                if (!propertyList.contains(p)) {
                    propertyList.add(p);
                }
            }
        } finally {
            qexec.close();
        }
        return propertyList;
    }
    public static List<ClassImpl> getClassImplList(String queryString, String lang) {
        Query query = QueryFactory.create(queryString);
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, "none");
        Model dbModel = wikiOntStrage.getTDBModel();
        QueryExecution qexec = QueryExecutionFactory.create(query, dbModel);
        com.hp.hpl.jena.query.ResultSet results = qexec.execSelect();

        List<ClassImpl> instanceList = Lists.newArrayList();
        try {
            while (results.hasNext()) {
                QuerySolution qs = results.nextSolution();
                Resource resource = (Resource) qs.get("type");
                Literal label = (Literal) qs.get("label");
                ClassImpl cls = new ClassImpl(lang, resource.getURI(), label.toString());
                if (!instanceList.contains(cls)) {
                    instanceList.add(cls);
                }
            }
        } finally {
            qexec.close();
        }
        return instanceList;
    }

    public static HeaderContributor getJsPackageResource(String path) {
        return JavascriptPackageResource.getHeaderContribution(new CompressedResourceReference(IndexPage.class, path));
    }

    public static Image getIndicator(String id) {
        Image indicator = new Image(id, AbstractDefaultAjaxBehavior.INDICATOR);
        indicator.setOutputMarkupId(true);
        return indicator;
    }

    public static String getResourceString(Class< ? > cls, String path) {
        PackageResource templateFileRes = PackageResource.get(cls, path);
        IStringResourceStream strStream = (IStringResourceStream) templateFileRes.getResourceStream();
        return strStream.asString();
    }

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
            List<Resource> supClassList = Lists.newArrayList();
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
        Map<Resource, Set<Resource>> classSubClassMap = Maps.newHashMap();
        for (ResIterator resIter = ontModel.listSubjectsWithProperty(RDF.type, OWL.Class); resIter.hasNext();) {
            Resource cls = resIter.nextResource();
            if (classSubClassMap.get(cls) == null) {
                Set<Resource> subClassSet = Sets.newHashSet();
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
        Set<Resource> rootClassSet = Sets.newHashSet();
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
        Set<Resource> leafClassSet = Sets.newHashSet();
        for (Resource cls : classSubClassMap.keySet()) {
            if (classSubClassMap.get(cls).size() == 0) {
                if (cls.listProperties(RDFS.subClassOf).toSet().size() != 0) {
                    leafClassSet.add(cls);
                }
            }
        }
        return leafClassSet;
    }

    public static Model readRDFString(String rdfString) {
        Model model = ModelFactory.createDefaultModel();
        RDFReader reader = model.getReader();
        reader.read(model, new StringInputStream(rdfString, "UTF-8"), "");
        return model;
    }

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

    public static String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "UnknownHost";
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

    public static String readFile(File outputFile) {
        StringBuilder builder = new StringBuilder();
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(outputFile), "UTF-8"));
            while (reader.ready()) {
                builder.append(reader.readLine());
                builder.append("\n");
            }
            reader.close();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
        return builder.toString();
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
            if (res.getURI().split("class/").length == 2) {
                localName = res.getURI().split("class/")[1];
            }
        } else if (res.getURI().contains(WikipediaOntologyStorage.PROPERTY_NS)) {
            localName = res.getURI().split("property/")[1];
        } else if (res.getURI().contains(WikipediaOntologyStorage.INSTANCE_NS)) {
            localName = res.getURI().split("instance/")[1];
        } else {
            return null;
        }
        return localName;
    }

    public static boolean isEnglishTerm(String term) {
        return term.matches("[-|:|'|\\w|\\s|\\(|\\)|\\?|\\.]+");
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
