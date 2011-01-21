/*
 * @(#)  2009/11/23
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import com.google.common.collect.Sets;
import org.apache.wicket.PageParameters;

import java.io.UnsupportedEncodingException;
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
    private SearchOptionType searchOption;
    private InferenceType inferenceType;

    public SearchParameters(PageParameters params) {
        resourceType = getResourceType(params.getString("resource_type"));
        dataType = getDataType(params.getString("data_type"));
        version = getVersion(params.getString("version"));
        resourceName = getResourceName(params.getString("resource_name"));
        typeSet = getTypeSet(params.getStringArray("type"));
        searchOption = getSearchOptionType(params.getString("search_option", "exact_match"));
        inferenceType = getInferenceType(params.getString("inference_type", "none"));
        start = params.getInt("start", 0);
        limit = params.getInt("limit", 0);
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

    private DataType getDataType(String dt) {
        if (dt.equals("page")) {
            return DataType.PAGE;
        } else if (dt.equals("data")) {
            return DataType.RDF_XML;
        } else if (dt.equals("table_data")) {
            return DataType.JSON_TABLE;
        } else if (dt.equals("tree_data")) {
            return DataType.JSON_TREE;
        }
        return null;
    }

    private String getResourceName(String resName) {
        switch (dataType) {
            case PAGE:
                return resName.replaceAll("\\.html", "");
            case RDF_XML:
                return resName.replaceAll("\\.rdf", "");
            case JSON_TABLE:
            case JSON_TREE:
                return resName.replaceAll("\\.json", "");
            default:
                return resName;
        }
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
        return getKey(DataType.RDF_XML);
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
        hashCode += searchOption.toString().hashCode();
        hashCode += inferenceType.toString().hashCode();

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

        builder.append("start:");
        builder.append(start);
        builder.append("\n");
        builder.append("limit:");
        builder.append(limit);
        builder.append("\n");

        return builder.toString();
    }
}
