package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.OrderByType;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.SearchOptionType;

/**
 * Created by IntelliJ IDEA.
 *
 * @author Takeshi Morita
 *         Date: 11/01/25 15:34
 */
public class ResourceSearchUtils {
    public static OrderByType getOrderByType(String type) {
        if (type.equals("name_asc")) {
            return OrderByType.NAME_ASC;
        } else if (type.equals("name_desc")) {
            return OrderByType.NAME_DESC;
        } else if (type.equals("instance_count_asc")) {
            return OrderByType.INSTANCE_COUNT_ASC;
        } else if (type.equals("instance_count_desc")) {
            return OrderByType.INSTANCE_COUNT_DESC;
        }
        return OrderByType.INSTANCE_COUNT_DESC;
    }

    public static SearchOptionType getSearchOptionType(String type) {
        if (type.equals("exact_match")) {
            return SearchOptionType.EXACT_MATCH;
        } else if (type.equals("any_match")) {
            return SearchOptionType.ANY_MATCH;
        } else if (type.equals("starts_with")) {
            return SearchOptionType.STARTS_WITH;
        } else if (type.equals("ends_with")) {
            return SearchOptionType.ENDS_WITH;
        }
        return SearchOptionType.EXACT_MATCH;
    }

    public static String getHashCode(int start, int limit, String type, String name, String orderBy, String searchOption) {
        int hashCode = 0;
        hashCode += ("start=" + start).hashCode();
        hashCode += ("limit=" + limit).hashCode();
        hashCode += (type + "=" + name).hashCode();
        hashCode += orderBy.hashCode();
        hashCode += searchOption.hashCode();
        return Integer.toString(hashCode);
    }

}
