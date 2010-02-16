/*
 * @(#)  2010/02/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.util.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;

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

    public static String getIntancesOfClassQueryString(ClassImpl cls, int limit, int offset) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_instances_of_class.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$CLASS", "<" + escape(cls.getUri()) + ">");
        queryString = queryString.replaceAll("\\$LIMIT", Integer.toString(limit));
        queryString = queryString.replaceAll("\\$OFFSET", Integer.toString(offset));
        return queryString;
    }

    public static String getIntancesOfPropertyQueryString(PropertyImpl property, int limit, int offset) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_instances_of_property.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$PROPERTY", "<" + escape(property.getURI()) + ">");
        queryString = queryString.replaceAll("\\$LIMIT", Integer.toString(limit));
        queryString = queryString.replaceAll("\\$OFFSET", Integer.toString(offset));
        return queryString;
    }

    public static String getTypesOfInstanceQueryString(InstanceImpl instance) {
        String sparqlTemplateString = WikipediaOntologyUtils.getResourceString(ResourcePage.class,
                "sparql_templates/query_types_of_instance.tmpl");
        String queryString = sparqlTemplateString.replaceAll("\\$INSTANCE", "<" + escape(instance.getURI()) + ">");
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

    public static String getClassQueryString(SearchParameters searchParameters, String sparqlTemplate) {
        String resourceName = searchParameters.getResourceName();
        String typeFilter = "";
        switch (searchParameters.getSearchOption()) {
        case SIBLINGS:
            typeFilter = "?resource rdfs:subClassOf ?supTargetCls . ?targetCls rdfs:subClassOf ?supTargetCls . ?targetCls  rdfs:label  \""
                    + resourceName + "\" .";
            break;
        case SUB_CLASSES:
            typeFilter = "?resource rdfs:subClassOf ?targetCls . ?targetCls  rdfs:label \"" + resourceName + "\" .";
            break;
        }
        String queryString = sparqlTemplate.replace("<QueryTypeSet>", typeFilter);
        return queryString;
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
