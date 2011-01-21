/*
 * @(#)  2010/02/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.ResourcePage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.InstanceImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.SearchParameters;

import java.util.Set;

/**
 * @author takeshi morita
 */
public class SPARQLQueryMaker {

    private static String escape(String str) {
        str = str.replaceAll("<", "\\<");
        str = str.replaceAll(">", "\\>");
        str = str.replaceAll("\\s+", "_");
        return str;
    }

    public static String getPropertiesOfInstanceQueryString(InstanceImpl i) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_properties_of_instance.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$INSTANCE", "<" + escape(i.getURI()) + ">");
        return queryString;
    }

    public static String getIntancesOfClassQueryString(String uri, int limit, int offset) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_instances_of_class.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$CLASS", "<" + escape(uri) + ">");
        queryString = queryString.replaceAll("\\$LIMIT", Integer.toString(limit));
        queryString = queryString.replaceAll("\\$OFFSET", Integer.toString(offset));
        return queryString;
    }

    public static String getIntancesOfPropertyQueryString(String uri, int limit, int offset) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_instances_of_property.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$PROPERTY", "<" + escape(uri) + ">");
        queryString = queryString.replaceAll("\\$LIMIT", Integer.toString(limit));
        queryString = queryString.replaceAll("\\$OFFSET", Integer.toString(offset));
        return queryString;
    }

    public static String getTypesOfInstanceQueryString(String uri) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_types_of_instance.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$INSTANCE", "<" + escape(uri) + ">");
        return queryString;
    }

    public static String getTypeSetQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        Set<String> typeSet = searchParameters.getTypeSet();
        StringBuilder queryTypeSetString = new StringBuilder();
        int i = 0;
        for (String type : typeSet) {
            if (WikipediaOntologyUtils.isEnglishTerm(type)) {
                type = type.replaceAll("_", " ");
            }
            queryTypeSetString.append("?resource rdf:type ?type" + i + ". ?type" + i + " rdfs:label \"" + type + "\".");
            i++;
        }
        return sparqlTemplate.replace("<QueryTypeSet>", queryTypeSetString);
    }


    public static String getSiblingAndSubClassesQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resourceName = searchParameters.getResourceName();
        return sparqlTemplate.replace("$CLASS_NAME", resourceName);
    }

    public static String getPropertiesOfRegionClassQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resourceName = searchParameters.getResourceName();
        return sparqlTemplate.replace("$CLASS_NAME", resourceName);
    }

    public static String getRegionClassesOfPropertyQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resourceName = searchParameters.getResourceName();
        return sparqlTemplate.replace("$PROPERTY_NAME", resourceName);
    }

    public static String getResourceByURIQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resource = searchParameters.getResourceName();
        switch (searchParameters.getResourceType()) {
            case CLASS:
                resource = "wikiont_class:" + resource;
                break;
            case PROPERTY:
                resource = "wikiont_property:" + resource;
                break;
            case INSTANCE:
                resource = "wikiont_instance:" + resource;
                break;
        }
        return sparqlTemplate.replace("$RESOURCE", resource);
    }

    public static String getResourceQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resourceName = searchParameters.getResourceName();
        String typeFilter = "";
        switch (searchParameters.getResourceType()) {
            case CLASS:
                typeFilter = "?resource rdf:type ?type . FILTER (?type = owl:Class) ";
                break;
            case PROPERTY:
                typeFilter = "?resource rdf:type ?type . FILTER (?type = owl:ObjectProperty || ?type = owl:DatatypeProperty) ";
                break;
            case INSTANCE:
                // 検索時間がかかる
                // typeFilter =
                // "OPTIONAL { ?resource rdf:type ?type  FILTER (?type != owl:ObjectClass && ?type != owl:ObjectProperty && ?type != owl:DatatypeProperty)} ";
                break;
        }

        String regexString = "";
        resourceName = resourceName.replaceAll("\\(|\\)|\\$|\\[|\\]|\\+|\\*|\\\\|\\?|-", "\\.");
        if (WikipediaOntologyUtils.isEnglishTerm(resourceName)) {
            resourceName = resourceName.replaceAll("_", " ");
        }

        switch (searchParameters.getSearchOption()) {
            case STARTS_WITH:
                regexString = "^" + resourceName;
                break;
            case ENDS_WITH:
                regexString = resourceName + "$";
                break;
            case ANY_MATCH:
                regexString = resourceName;
                break;
            case EXACT_MATCH:
                regexString = "^" + resourceName + "$";
                break;
        }

        String queryString = sparqlTemplate.replace("<TypeFilter>", typeFilter);
        queryString = queryString.replace("<RegexString>", regexString);
        return queryString;
    }
}
