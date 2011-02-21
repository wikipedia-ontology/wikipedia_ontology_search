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
        queryURI += CLASS_PATH + DATA_PATH + "q" + JSON_EXTENSION + "?";
        for (var i = 0; i < keywords.length; i++) {
            queryURI += "type=" + keywords[i];
            if (i != keywords.length - 1) {
                queryURI += "&";
            }
        }
        queryURI += '&' + versionOption;
    } else {
        var searchOptionValue = searchOptionSelection.getValue();
        switch (searchOptionValue) {
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sibling_classes :
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sub_classes:
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_domain_class:
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_range_class:
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.instances_of_class:
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
                Ext.getDom('class_button').checked = true;
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.domain_classes_of_property:
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.range_classes_of_property:
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
                Ext.getDom('property_button').checked = true;
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.types_of_instance:
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
                Ext.getDom('instance_button').checked = true;
                break;
        }
        if (queryType == undefined) {
            queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
        }
        queryURI += queryType + '/' + DATA_PATH + keyword + JSON_EXTENSION;
        queryURI += getSearchTargetOption();
        queryURI += '&' + searchOption;
        queryURI += '&' + versionOption;
    }
    queryURI = setInferenceTypeOption(queryURI);
    return queryURI;
}

function getSearchTargetOption() {
    switch (searchTargetType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri:
            return '?search_target=uri';
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.label:
            return '?search_target=label';
            break;
    }
}

function searchStatementsByContextMenu(keyword) {
    var searchPanel = Ext.getCmp("SearchPanel");
    searchPanel.getForm().findField('keyword').setValue(keyword);
    searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
    selectSearchTargetRadioButton();
    searchStatements(keyword);
    resetSearchOptionList(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
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
    if (inferenceType == WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.rdfs) {
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
    searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
    reloadStatementTable(queryURI);
}

function reloadStatements(queryURI, keyword) {
    var searchPanel = Ext.getCmp('SearchPanel');
    searchPanel.getForm().findField('keyword').setValue(keyword);
    statementTabPanel.getActiveTab().setTitle(keyword);
    var searchParams = extractParametersFromURI(queryURI);
    switch (searchParams[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type]) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class:
            Ext.getDom('class_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-class');
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property:
            Ext.getDom('property_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-property');
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance:
            Ext.getDom('instance_button').checked = true;
            statementTabPanel.getActiveTab().setIconClass('icon-instance');
            break;
    }
    addHistoryData(queryURI);
    isRenderTree = true;
    reloadStatementTable(queryURI);
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    var searchOptionValue = searchOptionSelection.getValue();
    if (queryType == WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class &&
            searchTargetType == WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri &&
            ( searchOptionValue == WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match ||
                    searchOptionValue == WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.path_to_root_class)) {
        queryURI = queryURI.replace(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.path_to_root_class);
        var queryTreeDataURI = queryURI + "?extjs_json_format=tree";
        if (queryURI.indexOf("?") != -1) {
            queryTreeDataURI = queryURI + "&extjs_json_format=tree";
        }
        reloadTree(queryTreeDataURI);
    }
}

