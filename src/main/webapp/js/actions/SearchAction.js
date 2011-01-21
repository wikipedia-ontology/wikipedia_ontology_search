/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getQueryType() {
    if (Ext.getDom('class_button').checked) {
        return 'class';
    } else if (Ext.getDom('property_button').checked) {
        return 'property';
    } else if (Ext.getDom('instance_button').checked) {
        return 'instance';
    }
}

function searchWikipediaOntology() {
    queryType = getQueryType();
    var keyword = Ext.getCmp('SearchPanel').getForm().findField('keyword').getValue();
    if (0 < keyword.length) {
        searchWikipediaOntology2(keyword);
    }
}

function searchWikipediaOntology2(keyword) {
    var keywords = keyword.split(/\s+/);
    var queryURL = BASE_SERVER_URL;
    var unescapeQueryURL = BASE_URI;
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    var searchOption = "search_option=" + searchOptionSelection.getValue();
    var versionOptionSelection = Ext.getCmp('Version_Option');
    var versionOption = "version=" + versionOptionSelection.getValue();

    if (1 < keywords.length) {
        queryURL += CLASS_PATH + TABLE_DATA_PATH + "queryString?";
        unescapeQueryURL += CLASS_PATH + DATA_PATH + "queryString?";
        for (var i = 0; i < keywords.length; i++) {
            queryURL += "type=" + keywords[i];
            unescapeQueryURL += "type=" + keywords[i];
            if (i != keywords.length - 1) {
                queryURL += "&";
                unescapeQueryURL += "&";
            }
        }
        queryURL += "&" + versionOption;
        unescapeQueryURL += "&" + versionOption;
        reloadWikiOntJSONData1(queryURL, unescapeQueryURL, keywords);
    } else {
        var searchOptionValue = searchOptionSelection.getValue();
        if (searchOptionValue == SIBLING_CLASSES_SEARCH_OPTION || searchOptionValue == SUB_CLASSES_SEARCH_OPTION ||
                searchOptionValue == PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION || searchOptionValue == PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION) {
            queryType = "class";
            Ext.getDom('class_button').checked = true;
        } else if (searchOptionValue == DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION ||
                searchOptionValue == RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION) {
            queryType = "property";
            Ext.getDom('property_button').checked = true;
        }
        queryURL += queryType + '/' + TABLE_DATA_PATH + keyword;
        if (searchOptionValue != EXACT_MATCH_SEARCH_OPTION) {
            queryURL += '?' + searchOption;
            queryURL += '&' + versionOption;
        } else {
            queryURL += '?' + versionOption;
        }
        reloadWikiOntJSONData2(queryURL, keyword);
    }
}

function setUseInfModelOption(queryURL) {
    if (useInfModel) {
        if (queryURL.indexOf("?") == -1) {
            queryURL += "?";
        } else {
            queryURL += "&";
        }
        queryURL += "inference_type=rdfs";
    }
    return queryURL;
}

function reloadWikiOntJSONData1(queryURL, unescapeQueryURL, keywords) {
    var searchPanel = Ext.getCmp('SearchPanel');
    queryURL = setUseInfModelOption(queryURL);
    searchPanel.getForm().findField('keyword').setValue(keywords.join(" "));
    Ext.getDom('class_button').checked = true;
    currentURI = unescapeQueryURL;
    currentURI = setUseInfModelOption(currentURI);
    writeStatusBar();
    addHistoryData();
    statementTabPanel.getActiveTab().setTitle(keywords.join("＆"));
    statementTabPanel.getActiveTab().setIconClass('icon-class');
    reloadWikiOntJSONData(queryURL);
}

function reloadWikiOntJSONData2(queryURL, keyword) {
    var searchPanel = Ext.getCmp('SearchPanel');
    queryURL = setUseInfModelOption(queryURL);
    statementTabPanel.getActiveTab().setTitle(keyword);
    if (queryType == 'class') {
        searchPanel.getForm().findField('keyword').setValue(keyword);
        Ext.getDom('class_button').checked = true;
        currentURI = BASE_CLASS_URI + keyword;
        currentURI = setUseInfModelOption(currentURI);
        statementTabPanel.getActiveTab().setIconClass('icon-class');
        writeStatusBar();
    } else if (queryType == 'property') {
        searchPanel.getForm().findField('keyword').setValue(keyword);
        Ext.getDom('property_button').checked = true;
        currentURI = BASE_PROPERTY_URI + keyword;
        currentURI = setUseInfModelOption(currentURI);
        statementTabPanel.getActiveTab().setIconClass('icon-property');
        writeStatusBar();
    } else if (queryType == 'instance') {
        searchPanel.getForm().findField('keyword').setValue(keyword);
        Ext.getDom('instance_button').checked = true;
        currentURI = BASE_INSTANCE_URI + keyword;
        currentURI = setUseInfModelOption(currentURI);
        statementTabPanel.getActiveTab().setIconClass('icon-instance');
        writeStatusBar();
    }
    addHistoryData();
    reloadWikiOntJSONData(queryURL);
}

function writeStatusBar() {
    Ext.getCmp('statusBar').setStatus({
        text : '<span style="color: white; font-weight: bold;">URI: ' + currentURI + '</span>'
    });
}