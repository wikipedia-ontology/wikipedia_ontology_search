/*
 * @(#)  2009/11/23
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;
import java.util.*;

import org.apache.wicket.*;

import com.google.common.collect.*;

/**
 * @author Takeshi Morita
 */
public class SearchParameters {

    private int start;
    private int limit;
    private String resourceName;
    private ResourceType resourceType;
    private DataType dataType;
    private Set<String> typeSet;
    private SearchOptionType searchOption;
    private InferenceType inferenceType;

    public SearchParameters(PageParameters params, Response resp) {
        resourceType = getResourceType(params.getString("resource_type"));
        dataType = getDataType(params.getString("data_type"));
        resourceName = getResourceName(params.getString("resource_name"), resp);
        typeSet = getTypeSet(params.getStringArray("type"));
        searchOption = getSearchOptionType(params.getString("search_option", "exact_match"));
        inferenceType = getInferenceType(params.getString("inference_type", "none"));
        start = params.getInt("start", 0);
        limit = params.getInt("limit", 0);
    }

    private String addParamSimbol(String rdfKey) {
        if (rdfKey.contains("?")) {
            rdfKey += "&";
        } else {
            rdfKey += "?";
        }
        return rdfKey;
    }

    public String getRDFKey() {
        String rdfKey = "query/" + resourceType.toString().toLowerCase() + "/data/" + resourceName + ".rdf";
        if (searchOption != null) {
            rdfKey = addParamSimbol(rdfKey);
            rdfKey += "search_option=" + searchOption.toString().toLowerCase();
        }
        if (inferenceType != InferenceType.NONE) {
            rdfKey = addParamSimbol(rdfKey);
            rdfKey += "?inference_type=" + inferenceType.toString().toLowerCase();
        }
        if (0 < typeSet.size()) {
            rdfKey = addParamSimbol(rdfKey);
            for (String type : typeSet) {
                rdfKey += "type=" + type + "&";
            }
        }
        return rdfKey;
    }

    public boolean isValidRequest() {
        return resourceType != null && dataType != null && 0 < resourceName.length();
    }

    public boolean isEnglishResourceName() {
        return resourceName.matches("[-|:|'|\\w|\\s|\\(|\\)|\\?|\\.]+");
    }

    private ResourceType getResourceType(String resType) {
        if (resType.equals("class")) {
            return ResourceType.CLASS;
        } else if (resType.equals("property")) {
            return ResourceType.PROPERTY;
        } else if (resType.equals("instance")) { return ResourceType.INSTANCE; }
        return null;
    }

    private DataType getDataType(String dt) {
        if (dt.equals("page")) {
            return DataType.PAGE;
        } else if (dt.equals("data")) {
            return DataType.RDF_XML;
        } else if (dt.equals("json_table")) {
            return DataType.JSON_TABLE;
        } else if (dt.equals("json_tree")) { return DataType.JSON_TREE; }
        return null;
    }

    private String getResourceName(String resName, Response resp) {
        switch (dataType) {
        case PAGE:
            resp.setContentType("text/html; charset=UTF-8");
            return resName.replaceAll("\\.html", "");
        case RDF_XML:
            resp.setContentType("application/rdf+xml; charset=UTF-8");
            return resName.replaceAll("\\.rdf", "");
        case JSON_TABLE:
        case JSON_TREE:
            resp.setContentType("application/json; charset=UTF-8");
            return resName.replaceAll("\\.json", "");
        default:
            return resName;
        }
    }

    private Set<String> getTypeSet(String[] types) {
        Set<String> typeSet = Sets.newHashSet();
        if (types != null) {
            try {
                for (String type : types) {
                    type = new String(type.getBytes("ISO8859_1"), "UTF-8");
                    typeSet.add(type);
                }
            } catch (UnsupportedEncodingException uuex) {
                uuex.printStackTrace();
            }
        }
        return typeSet;
    }

    private SearchOptionType getSearchOptionType(String so) {
        if (so.equals("exact_match")) {
            return SearchOptionType.EXACT_MATCH;
        } else if (so.equals("starts_with")) {
            return SearchOptionType.STARTS_WITH;
        } else if (so.equals("ends_with")) {
            return SearchOptionType.ENDS_WITH;
        } else if (so.equals("any_match")) {
            return SearchOptionType.ANY_MATCH;
        } else if (so.equals("siblings")) {
            return SearchOptionType.SIBLINGS;
        } else if (so.equals("sub_classes")) { return SearchOptionType.SUB_CLASSES; }
        return SearchOptionType.EXACT_MATCH;
    }

    private InferenceType getInferenceType(String infType) {
        if (infType.equals("rdfs")) { return InferenceType.RDFS; }
        return InferenceType.NONE;
    }

    public int getStart() {
        return start;
    }

    public int getLimit() {
        return limit;
    }

    public SearchOptionType getSearchOption() {
        return searchOption;
    }

    public String getResourceName() {
        return resourceName;
    }

    public Set<String> getTypeSet() {
        return typeSet;
    }

    public DataType getDataType() {
        return dataType;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resType) {
        resourceType = resType;
    }

    public boolean isUseInfModel() {
        switch (inferenceType) {
        case RDFS:
            return true;
        default:
            return false;
        }
    }

    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Resource Type:");
        builder.append(resourceType);
        builder.append("\n");
        builder.append("DataType:");
        builder.append(dataType);
        builder.append("\n");
        builder.append("Resource Name:");
        builder.append(resourceName);
        builder.append("\n");

        builder.append("Type Set:");
        for (String type : typeSet) {
            builder.append(type);
            builder.append(", ");
        }
        builder.append("\n");

        builder.append("Search Option:");
        builder.append(searchOption);
        builder.append("\n");

        builder.append("Inference Type:");
        builder.append(inferenceType);
        builder.append("\n");

        builder.append("start:");
        builder.append(start);
        builder.append("\n");
        builder.append("limit:");
        builder.append(limit);
        builder.append("\n");

        return builder.toString();
    }
}
