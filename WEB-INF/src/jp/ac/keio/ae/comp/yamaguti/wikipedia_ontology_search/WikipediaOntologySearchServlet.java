package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.util.*;

import javax.servlet.*;
import javax.servlet.http.*;

import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;

/*
 * @(#)  2009/09/11
 */

/**
 * @author takeshi morita
 */
public class WikipediaOntologySearchServlet extends HttpServlet {

    private void setParameters(HttpServletRequest req, SearchParameters searchParameters) {
        if (req.getParameter("start") != null) {
            int start = Integer.parseInt(req.getParameter("start"));
            searchParameters.setStart(start);
        }
        if (req.getParameter("limit") != null) {
            int limit = Integer.parseInt(req.getParameter("limit"));
            searchParameters.setLimit(limit);
        }
        if (req.getParameter("search_option") != null) {
            String searchOption = req.getParameter("search_option");
            if (!(searchOption.equals("exact_match") || searchOption.equals("starts_with")
                    || searchOption.equals("ends_with") || searchOption.equals("any_match"))) {
                searchOption = "exact_match";
            }
            searchParameters.setSearchOption(searchOption);
        }
    }

    private boolean setInference(String inf, SearchParameters searchParameters) {
        if (inf.equals("rdfs_inference")) {
            searchParameters.setUseInfModel(true);
            return true;
        }
        return false;
    }

    private boolean setQueryType(String qt, SearchParameters searchParameters) {
        Type queryType = getQueryType(qt);
        searchParameters.setQueryType(queryType);
        if (queryType != null) { return true; }
        return false;
    }

    private boolean setDataType(String dt, SearchParameters searchParameters) {
        if (dt.equals("page") || dt.equals("data") || dt.equals("json_table") || dt.equals("json_tree")) {
            searchParameters.setDataType(dt);
            return true;
        }
        return false;
    }

    private boolean checkURL(String[] elements, HttpServletResponse resp, SearchParameters searchParameters) {
        if (elements.length == 5) {
            if (!setQueryType(elements[2], searchParameters)) { return false; }
            if (!setDataType(elements[3], searchParameters)) { return false; }
            if (!setKeyword(resp, elements[4], searchParameters)) { return false; }
            return true;
        } else if (elements.length == 6) {
            if (!setQueryType(elements[2], searchParameters)) { return false; }
            if (!setInference(elements[3], searchParameters)) { return false; }
            if (!setDataType(elements[4], searchParameters)) { return false; }
            if (!setKeyword(resp, elements[5], searchParameters)) { return false; }
        }
        return true;
    }

    private void action(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html; charset=UTF-8");
        SearchParameters searchParameters = new SearchParameters();
        setParameters(req, searchParameters);
        Set<String> typeSet = getTypeSet(req);
        String reqURI = req.getRequestURI();
        PrintWriter out = resp.getWriter();

        String[] elements = reqURI.split("/");
        if (!checkURL(elements, resp, searchParameters)) {
            out.println("Error: " + reqURI);
            return;
        }
        out = resp.getWriter();
        WikipediaOntologySearch wikiOntSearch = new WikipediaOntologySearch(searchParameters);
        String keyWord = searchParameters.getKeyWord();
        Type queryType = searchParameters.getQueryType();
        if (typeSet.size() == 0) {
            if (keyWord.equals("ALLClasses") && queryType == Type.CLASS) {
                wikiOntSearch.setAllClassesModel();
            } else {
                File templateFile = new File(getServletContext().getRealPath("sparql_templates/query_resource.tmpl"));
                String sparqlTemplate = WikipediaOntologyUtilities.readFile(templateFile);
                String queryString = wikiOntSearch.getQueryString(keyWord, sparqlTemplate);
                wikiOntSearch.setQueryResults(queryString);
            }
            out.println(getOutputString(wikiOntSearch, req, resp));
        } else {
            queryType = Type.INSTANCE;
            wikiOntSearch.setQueryType(queryType);
            File templateFile = new File(getServletContext().getRealPath("sparql_templates/query_types.tmpl"));
            String sparqlTemplate = WikipediaOntologyUtilities.readFile(templateFile);
            String queryString = wikiOntSearch.getQueryString(typeSet, sparqlTemplate);
            wikiOntSearch.setQueryResults2(queryString, typeSet);
            out.println(getOutputString(wikiOntSearch, req, resp));
        }
        out.close();
    }

    private boolean setKeyword(HttpServletResponse resp, String kw, SearchParameters searchParameters) {
        String dataType = searchParameters.getDataType();
        if (dataType.equals("page")) {
            resp.setContentType("text/html; charset=UTF-8");
            searchParameters.setKeyWord(kw.replaceAll("\\.html", ""));
        } else if (dataType.equals("data")) {
            resp.setContentType("application/rdf+xml; charset=UTF-8");
            searchParameters.setKeyWord(kw.replaceAll("\\.rdf", ""));
        } else if (dataType.equals("json_table") || dataType.equals("json_tree")) {
            resp.setContentType("application/json; charset=UTF-8");
            searchParameters.setKeyWord(kw.replaceAll("\\.json", ""));
        } else {
            return false;
        }
        return true;
    }

    private Set<String> getTypeSet(HttpServletRequest req) throws UnsupportedEncodingException {
        Set<String> typeSet = new HashSet<String>();
        String[] types = req.getParameterValues("type");
        if (types != null) {
            for (String type : types) {
                type = new String(type.getBytes("ISO8859_1"), "SJIS");
                typeSet.add(type);
            }
        }
        return typeSet;
    }

    private Type getQueryType(String type) {
        Type queryType = null;
        if (type.equals("instance")) {
            queryType = Type.INSTANCE;
        } else if (type.equals("class")) {
            queryType = Type.CLASS;
        } else if (type.equals("property")) {
            queryType = Type.PROPERTY;
        }
        return queryType;
    }

    class StatementSorter implements Comparator<Statement> {
        public int compare(Statement stmt1, Statement stmt2) {
            String stmtStr1 = stmt1.getSubject().toString();
            String stmtStr2 = stmt2.getSubject().toString();
            return stmtStr1.compareTo(stmtStr2);
        }
    }

    private String getOutputString(WikipediaOntologySearch wikiOntSearch, HttpServletRequest req,
            HttpServletResponse resp) {
        File outputFile = getOutputFile(wikiOntSearch.getSearchParameters());
        req.setAttribute("outputFile", outputFile);
        if (outputFile.exists()) {
            wikiOntSearch.closeDB();
            return WikipediaOntologyUtilities.readFile(outputFile);
        }
        Model outputModel = getOutputModel(wikiOntSearch);
        return getOutputString(outputModel, wikiOntSearch, req, resp);
    }

    private String getOutputString(Model outputModel, WikipediaOntologySearch wikiOntSearch, HttpServletRequest req,
            HttpServletResponse resp) {
        long numberOfStatements = outputModel.size();
        outputModel = getSubOutputModel(outputModel, wikiOntSearch.getSearchParameters());
        String dataType = wikiOntSearch.getSearchParameters().getDataType();
        String outputString = "";
        if (dataType.equals("page")) {
            req.setAttribute("keyword", wikiOntSearch.getSearchParameters().getKeyWord());
            req.setAttribute("queryType", wikiOntSearch.getSearchParameters().getQueryType());
            req.setAttribute("outputModel", outputModel);
            try {
                getServletContext().getRequestDispatcher("/jsp/resource_page.jsp").include(req, resp);
            } catch (ServletException se) {
                se.printStackTrace();
            } catch (IOException ioe) {
                ioe.printStackTrace();
            }
        } else if (dataType.equals("data")) {
            outputString = WikipediaOntologyUtilities.getRDFString(outputModel, "RDF/XML-ABBREV");
        } else if (dataType.equals("json_table")) {
            outputString = wikiOntSearch.getTableJSONString(outputModel, numberOfStatements);
        } else if (dataType.equals("json_tree")) {
            outputString = wikiOntSearch.getTreeJSONString(outputModel);
        }
        wikiOntSearch.closeDB();
        return outputString;
    }

    private Model getOutputModel(WikipediaOntologySearch wikiOntSearch) {
        String searchOption = wikiOntSearch.getSearchParameters().getSearchOption();
        String keyWord = wikiOntSearch.getSearchParameters().getKeyWord();
        Type queryType = wikiOntSearch.getSearchParameters().getQueryType();
        StringBuilder dataPath = new StringBuilder("");
        if (queryType == Type.CLASS) {
            dataPath.append("class/");
        } else if (queryType == Type.PROPERTY) {
            dataPath.append("property/");
        } else if (queryType == Type.INSTANCE) {
            dataPath.append("instance/");
        }
        if (wikiOntSearch.getSearchParameters().isUseInfModel()) {
            dataPath.append("rdfs_inference/");
        }
        dataPath.append("data/");
        dataPath.append(keyWord);
        if (!searchOption.equals("exact_match")) {
            dataPath.append("_");
            dataPath.append(searchOption);
        }
        dataPath.append(".rdf");
        File outputFile = new File(getServletContext().getRealPath(dataPath.toString()));
        if (outputFile.exists()) { return FileManager.get().loadModel(outputFile.getAbsolutePath()); }

        Model outputModel = null;
        if (keyWord.equals("ALLClasses") && queryType == Type.CLASS) {
            outputModel = wikiOntSearch.getDBModel();
        } else {
            outputModel = wikiOntSearch.getOutputModel();
            removeIsaLoop(outputModel);
        }
        WikipediaOntologyUtilities.writeFile(outputFile, WikipediaOntologyUtilities.getRDFString(outputModel,
                "RDF/XML-ABBREV"));
        return outputModel;
    }

    private File getOutputFile(SearchParameters searchParameters) {
        Type queryType = searchParameters.getQueryType();
        String dataType = searchParameters.getDataType();
        String searchOption = searchParameters.getSearchOption();
        int start = searchParameters.getStart();
        int limit = searchParameters.getLimit();

        StringBuilder dataPath = new StringBuilder("");
        if (queryType == Type.CLASS) {
            dataPath.append("class/");
        } else if (queryType == Type.INSTANCE) {
            dataPath.append("instance/");
        } else if (queryType == Type.PROPERTY) {
            dataPath.append("property/");
        }

        if (searchParameters.isUseInfModel()) {
            dataPath.append("rdfs_inference/");
        }
        dataPath.append(dataType);
        dataPath.append("/");
        dataPath.append(searchParameters.getKeyWord());
        if (start != 0 || limit != 0) {
            dataPath.append("_");
            dataPath.append(start);
            dataPath.append("_");
            dataPath.append(limit);
        }
        if (!searchOption.equals("exact_match")) {
            dataPath.append("_");
            dataPath.append(searchOption);
        }
        if (dataType.equals("page")) {
            dataPath.append(".html");
        } else if (dataType.equals("data")) {
            dataPath.append(".rdf");
        } else if (dataType.equals("json_table")) {
            dataPath.append(".json");
        } else if (dataType.equals("json_tree")) {
            dataPath.append(".json");
        }
        return new File(getServletContext().getRealPath(dataPath.toString()));
    }

    private Model getSubOutputModel(Model outputModel, SearchParameters searchParameters) {
        int start = searchParameters.getStart();
        int limit = searchParameters.getLimit();
        Model subOutputModel = ModelFactory.createDefaultModel();
        if (limit != 0) {
            long end = start + limit;
            if (outputModel.size() < start + limit) {
                end = outputModel.size();
            }
            List<Statement> orgList = outputModel.listStatements().toList();
            Collections.sort(orgList, new StatementSorter());
            List<Statement> stmtList = orgList.subList(start, (int) end);
            subOutputModel.add(stmtList);
        } else {
            subOutputModel = outputModel;
        }

        return subOutputModel;
    }

    private void removeIsaLoop(Model model) {
        Model removeModel = ModelFactory.createDefaultModel();
        for (StmtIterator stmtIter = model.listStatements(); stmtIter.hasNext();) {
            Statement stmt = stmtIter.nextStatement();
            if (stmt.getSubject().equals(stmt.getObject())) {
                removeModel.add(stmt);
            }
        }
        model.remove(removeModel);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        action(req, resp);
    }

}
