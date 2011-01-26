/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getDefaultKeyword(keyword) {
    if (Ext.getCmp('SearchPanel') != undefined && keyword == "") {
        keyword = Ext.getCmp('SearchPanel').getForm().findField('keyword').getValue();
    }
    return keyword;
}

function getQueryURI(keyword) {
    keyword = getDefaultKeyword(keyword);
    var keywords = keyword.split(/\s+/);
    var queryURI = BASE_SERVER_URL;
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    var searchOption = "search_option=" + searchOptionSelection.getValue();
    var versionOptionSelection = Ext.getCmp('Version_Option');
    var versionOption = "version=" + versionOptionSelection.getValue();

    if (1 < keywords.length) {
        queryURI += CLASS_PATH + DATA_PATH + "q" + EXTENSION + "?";
        for (var i = 0; i < keywords.length; i++) {
            queryURI += "type=" + keywords[i];
            if (i != keywords.length - 1) {
                queryURI += "&";
            }
        }
        //以下を入れると動かなくなるため
        //        queryURI += '&' + versionOption;
    } else {
        var searchOptionValue = searchOptionSelection.getValue();
        switch (searchOptionValue) {
            case SIBLING_CLASSES_SEARCH_OPTION :
            case SUB_CLASSES_SEARCH_OPTION:
            case PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION:
            case PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION:
            case INSTANCES_OF_CLASS_SEARCH_OPTION:
                queryType = QTYPE_CLASS;
                Ext.getDom('class_button').checked = true;
                break;
            case DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION:
            case RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION:
                queryType = QTYPE_PROPERTY;
                Ext.getDom('property_button').checked = true;
                break;
            case TYPES_OF_INSTANCE_SEARCH_OPTION:
                queryType = QTYPE_INSTANCE;
                Ext.getDom('instance_button').checked = true;
                break;
        }
        if (queryType == undefined) {
            queryType = QTYPE_CLASS;
        }
        queryURI += queryType + '/' + DATA_PATH + keyword + EXTENSION;
        queryURI += getSearchTargetOption();
        queryURI += '&' + searchOption;
        queryURI += '&' + versionOption;
    }
    queryURI = setInferenceTypeOption(queryURI);
    return queryURI;
}

function getSearchTargetOption() {
    if (Ext.getCmp("uri_radio_button").checked) {
        return '?search_target=uri';
    } else if (Ext.getCmp("label_radio_button").checked) {
        return '?search_target=label';
    }
}

function searchStatementsByContextMenu(keyword) {
    var searchPanel = Ext.getCmp("SearchPanel");
    searchPanel.getForm().findField('keyword').setValue(keyword);
    searchTargetType = URI_SEARCH_TARGET_OPTION;
    Ext.getCmp("uri_radio_button").checked = true;
    selectResourceTypeRadioButton();
    searchStatements(keyword);
    resetSearchOptionList();
}

function searchStatements(keyword) {
    keyword = getDefaultKeyword(keyword);
    if (keyword.length == 0) {
        return;
    }
    var queryURI = getQueryURI(keyword);
    var keywords = keyword.split(/\s+/);
    if (1 < keywords.length) {
        reloadStatementsByTypesOfInstances(queryURI, keywords);
    } else {
        reloadStatements(queryURI, keyword);
    }
}

function setInferenceTypeOption(queryURI) {
    if (inferenceType == RDFS_INFERENCE_OPTION) {
        if (queryURI.indexOf("?") == -1) {
            queryURI += "?";
        } else {
            queryURI += "&";
        }
        queryURI += "inference_type=rdfs";
    }
    return queryURI;
}

function reloadStatementsByTypesOfInstances(queryURI, keywords) {
    var searchPanel = Ext.getCmp('SearchPanel');
    searchPanel.getForm().findField('keyword').setValue(keywords.join(" "));
    Ext.getDom('class_button').checked = true;
    addHistoryData(queryURI);
    statementTabPanel.getActiveTab().setTitle(keywords.join("＆"));
    statementTabPanel.getActiveTab().setIconClass('icon-class');
    searchTargetType = URI_SEARCH_TARGET_OPTION;
    reloadStatementTable(queryURI);
}

function reloadStatements(queryURI, keyword) {
    var searchPanel = Ext.getCmp('SearchPanel');
    searchPanel.getForm().findField('keyword').setValue(keyword);
    statementTabPanel.getActiveTab().setTitle(keyword);
    var searchParams = extractParametersFromURI(queryURI);
    switch (searchParams[RESOURCE_TYPE_PARAMETER_KEY]) {
        case QTYPE_CLASS:
            Ext.getDom('class_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-class');
            break;
        case QTYPE_PROPERTY:
            Ext.getDom('property_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-property');
            break;
        case QTYPE_INSTANCE:
            Ext.getDom('instance_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-instance');
            break;
    }
    addHistoryData(queryURI);
    isRenderTree = true;
    reloadStatementTable(queryURI);
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    if (queryType == QTYPE_CLASS &&
            searchTargetType == URI_SEARCH_TARGET_OPTION &&
            searchOptionSelection.getValue() == EXACT_MATCH_SEARCH_OPTION) {
        var queryTreeDataURI = queryURI += "&extjs_json_format=tree";
        reloadTree(queryTreeDataURI);
    }
}

