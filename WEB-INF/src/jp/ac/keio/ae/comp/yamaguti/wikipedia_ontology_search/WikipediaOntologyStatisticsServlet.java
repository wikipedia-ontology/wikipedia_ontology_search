/*
 * @(#)  2009/12/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.util.*;

import javax.servlet.*;
import javax.servlet.http.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.vocabulary.*;

/**
 * @author takeshi morita
 */
public class WikipediaOntologyStatisticsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/html; charset=UTF-8");
        PrintWriter out = resp.getWriter();
        String statisticsType = req.getRequestURI().split("wikipedia_ontology/")[1];
        File htmlFile = new File(getServletContext().getRealPath(statisticsType + ".html"));
        if (htmlFile.exists()) {
            out.println(WikipediaOntologyUtilities.readFile(htmlFile));
        } else {
            if (statisticsType.equals("classes_ranked_by_number_of_instances")) {
                setClassesRankedByNumberOfInstances(req);
            } else if (statisticsType.equals("properties_ranked_by_number_of_statements")) {
                setInfoboxPropertiesInfo(req);
            }
            outputHTML(statisticsType, req, resp);
        }
    }

    private void outputHTML(String statisticsType, HttpServletRequest req, HttpServletResponse resp) {
        try {
            File htmlFile = new File(getServletContext().getRealPath(statisticsType + ".html"));
            req.setAttribute("outputFile", htmlFile);
            getServletContext().getRequestDispatcher("/jsp/" + statisticsType + ".jsp").include(req, resp);
        } catch (ServletException se) {
            se.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }

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

    private void setClassesRankedByNumberOfInstances(HttpServletRequest req) {
        Model ontModel = FileManager.get().loadModel(getServletContext().getRealPath("ontology/ALLClasses.owl"));
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
        req.setAttribute("numClsMap", numClsMap);
    }

    private void setInfoboxPropertiesInfo(HttpServletRequest req) {
        Model ontModel = FileManager.get().loadModel(
                getServletContext().getRealPath("ontology/wikipedia_ontology_infobox_20091120.owl"));
        Model instanceModel = FileManager.get().loadModel(
                getServletContext().getRealPath("ontology/wikipedia_instance_20091120.owl"));
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
        req.setAttribute("ontModel", ontModel);
        req.setAttribute("numPropertySetMap", numPropertySetMap);
        req.setAttribute("propertyInstanceMap", propertyInstanceMap);
    }

}
