/*
 * @(#)  2009/11/23
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.io.*;
import java.net.*;

/**
 * @author takeshi morita
 */
public class SearchParameters {
    private int start;
    private int limit;
    private String searchOption;
    private String keyWord;
    private String dataType;
    private Type queryType;
    private boolean useInfModel;

    public SearchParameters() {
        start = 0;
        limit = 0;
        useInfModel = false;
        searchOption = "exact_match";
    }

    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("start:");
        builder.append(start);
        builder.append("\n");
        builder.append("limit:");
        builder.append(limit);
        builder.append("\n");
        builder.append("Search Option:");
        builder.append(searchOption);
        builder.append("\n");
        builder.append("KeyWord:");
        builder.append(keyWord);
        builder.append("\n");
        builder.append("DataType:");
        builder.append(dataType);
        builder.append("\n");
        builder.append("QueryType:");
        builder.append(queryType);
        builder.append("\n");
        builder.append("useInfModel:");
        builder.append(useInfModel);
        builder.append("\n");
        return builder.toString();
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public String getSearchOption() {
        return searchOption;
    }

    public void setSearchOption(String searchOption) {
        this.searchOption = searchOption;
    }

    public String getKeyWord() {
        return keyWord;
    }

    public void setKeyWord(String keyWord) {
        try {
            keyWord = URLDecoder.decode(keyWord, "UTF-8");
        } catch (UnsupportedEncodingException uee) {
            uee.printStackTrace();
        }
        this.keyWord = keyWord;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public Type getQueryType() {
        return queryType;
    }

    public void setQueryType(Type queryType) {
        this.queryType = queryType;
    }

    public boolean isUseInfModel() {
        return useInfModel;
    }

    public void setUseInfModel(boolean useInfModel) {
        this.useInfModel = useInfModel;
    }

}
