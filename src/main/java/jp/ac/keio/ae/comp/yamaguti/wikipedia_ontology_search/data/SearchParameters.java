/*
 * @(#)  2009/11/23
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import com.google.common.collect.Sets;
import org.apache.wicket.PageParameters;

import java.util.Set;

/**
 * @author Takeshi Morita
 */
public class SearchParameters {

    private int start;
    private int limit;
    private String version;
    private String resourceName;
    private ResourceType resourceType;
    private DataType dataType;
    private Set<String> typeSet;
    private SearchTargetType searchTarget;
    private SearchOptionType searchOption;
    private InferenceType inferenceType;
    private ExtJsJSonFormatType extjsJSONFormatType;

    public SearchParameters(PageParameters params) {
        resourceType = getResourceType(params.getString("resource_type"));
        resourceName = params.getString("resource_name", "");
        dataType = getDataTypeAndRemoveExtensionFromResourceName(params.getString("data_type", ""));
        version = getVersion(params.getString("wikipedia_ontology_version"));
        typeSet = getTypeSet(params.getStringArray("type"));
        searchTarget = getSearchTargetType(params.getString("search_target", "uri"));
        searchOption = getSearchOptionType(params.getString("search_option", "exact_match"));
        inferenceType = getInferenceType(params.getString("inference_type", "none"));
        extjsJSONFormatType = getExtJsJSONFormatType(params.getString("extjs_json_format", "grid"));
        start = params.getInt("start", 0);
        limit = params.getInt("limit", 0);
    }

    private ExtJsJSonFormatType getExtJsJSONFormatType(String type) {
        if (type.equals("grid")) {
            return ExtJsJSonFormatType.GRID;
        } else if (type.equals("tree")) {
            return ExtJsJSonFormatType.TREE;
        }
        return ExtJsJSonFormatType.GRID;
    }

    public ExtJsJSonFormatType getExtJsJSonFormatType() {
        return extjsJSONFormatType;
    }

    public boolean isValidRequest() {
        return resourceType != null && dataType != null && 0 < resourceName.length();
    }

    public boolean isEnglishResourceName() {
        return resourceName.matches("[-|:|'|\\w|\\s|\\(|\\)|\\?|\\.]+");
    }

    private String getVersion(String version) {
        if (version != null && version.equals("2010_02_09")) {
            return version;
        }
        return "2010_11_14";
    }

    private ResourceType getResourceType(String resType) {
        if (resType.equals("class")) {
            return ResourceType.CLASS;
        } else if (resType.equals("property")) {
            return ResourceType.PROPERTY;
        } else if (resType.equals("instance")) {
            return ResourceType.INSTANCE;
        }
        return null;
    }

    private DataType getDataTypeAndRemoveExtensionFromResourceName(String dt) {
        if (dt.equals("page")) {
            resourceName = resourceName.replaceAll("\\.html", "");
            return DataType.PAGE;
        } else if (dt.equals("data")) {
            if (resourceName.matches(".*\\.rdf$")) {
                resourceName = resourceName.replaceAll("\\.rdf", "");
                return DataType.XML;
            } else if (resourceName.matches(".*\\.n3$")) {
                resourceName = resourceName.replaceAll("\\.n3", "");
                return DataType.N3;
            } else if (resourceName.matches(".*\\.nt$")) {
                resourceName = resourceName.replaceAll("\\.nt", "");
                return DataType.NTRIPLE;
            } else if (resourceName.matches(".*\\.json$")) {
                resourceName = resourceName.replaceAll("\\.json", "");
                return DataType.JSON;
            } else if (resourceName.matches(".*\\.jsonp$")) {
                resourceName = resourceName.replaceAll("\\.jsonp", "");
                return DataType.JSONP;
            } else {
                return DataType.XML;
            }
        }
        return DataType.NONE;
    }

    private Set<String> getTypeSet(String[] types) {
        Set<String> typeSet = Sets.newHashSet();
        if (types != null) {
            for (String type : types) {
                typeSet.add(type);
            }
        }
        return typeSet;
    }

    private SearchTargetType getSearchTargetType(String st) {
        if (st.equals("uri")) {
            return SearchTargetType.URI;
        } else if (st.equals("label")) {
            return SearchTargetType.LABEL;
        }
        return SearchTargetType.URI;
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
        } else if (so.equals("sibling_classes")) {
            return SearchOptionType.SIBLINGS;
        } else if (so.equals("sub_classes")) {
            return SearchOptionType.SUB_CLASSES;
        } else if (so.equals("properties_of_domain_class")) {
            return SearchOptionType.PROPERTIES_OF_DOMAIN_CLASS;
        } else if (so.equals("properties_of_range_class")) {
            return SearchOptionType.PROPERTIES_OF_RANGE_CLASS;
        } else if (so.equals("domain_classes_of_property")) {
            return SearchOptionType.DOMAIN_CLASSES_OF_PROPERTY;
        } else if (so.equals("range_classes_of_property")) {
            return SearchOptionType.RANGE_CLASSES_OF_PROPERTY;
        } else if (so.equals("instances_of_class")) {
            return SearchOptionType.INSTANCES_OF_CLASS;
        } else if (so.equals("types_of_instance")) {
            return SearchOptionType.TYPES_OF_INSTANCE;
        } else if (so.equals("inverse")) {
            return SearchOptionType.INVERSE;
        } else if (so.equals("path_to_root_class")) {
            return SearchOptionType.PATH_TO_ROOT_CLASS;
        }
        return SearchOptionType.EXACT_MATCH;
    }

    private InferenceType getInferenceType(String infType) {
        if (infType.equals("rdfs")) {
            return InferenceType.RDFS;
        }
        return InferenceType.NONE;
    }

    public int getStart() {
        return start;
    }

    public int getLimit() {
        return limit;
    }

    public SearchTargetType getSearchTarget() {
        return searchTarget;
    }

    public SearchOptionType getSearchOption() {
        return searchOption;
    }

    public String getVersion() {
        return version;
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

    public String getMIMEHeader() {
        switch (dataType) {
            case PAGE:
                return "application/html";
            case XML:
                return "application/rdf+xml";
            case N3:
                return "application/n3";
            case NTRIPLE:
                return "application/n-triples";
            case JSON:
            case JSONP:
                return "application/json";
        }
        return "application/html";
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

    public String getKey() {
        return getKey(this.dataType);
    }

    public String getRDFKey() {
        return getKey(DataType.XML);
    }

    private String getKey(DataType dt) {
        int hashCode = 0;
        hashCode += resourceType.toString().hashCode();
        hashCode += version.hashCode();
        hashCode += dt.toString().hashCode();
        hashCode += resourceName.hashCode();
        for (String type : typeSet) {
            hashCode += type.hashCode();
        }

        hashCode += searchTarget.toString().hashCode();
        hashCode += searchOption.toString().hashCode();
        hashCode += inferenceType.toString().hashCode();

        hashCode += extjsJSONFormatType.toString().hashCode();

        if (!(start == 0 && limit == 0)) {
            hashCode += ("start" + start).hashCode();
            hashCode += ("limit" + limit).hashCode();
        }
        return Integer.toString(hashCode);
    }

    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Version:");
        builder.append(version);
        builder.append("\n");
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

        builder.append("ExtJs JSON Format Type:");
        builder.append(extjsJSONFormatType);
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
