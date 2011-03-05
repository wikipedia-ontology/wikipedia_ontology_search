/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getProxy(json_url) {
    //    alert(json_url);
    //    if (json_url.indexOf(JSONP_EXTENSION) != -1) {
    //        return new Ext.data.ScriptTagProxy({
    //            url : json_url,
    //            timeout: 1000 * 60 * 5,
    //            method : "GET"
    //        });
    //    } else {
    return new Ext.data.HttpProxy({
        url : json_url,
        timeout: 1000 * 60 * 5,
        method : "GET"
    });
    //    }
}

function setURIField(id, uri) {
    uri = uri.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
    Ext.getCmp(id).setValue(uri);
}

function setSearchParams(params) {
    for (var key in params) {
        //        alert("key: " + key + "->" + "value: " + params[key]);
        var value = params[key];
        switch (key) {
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type:
                queryType = value;
                selectResourceTypeRadioButton();
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name:
                var searchPanel = Ext.getCmp("SearchPanel");
                searchPanel.getForm().findField('keyword').setValue(value);
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target:
                searchTargetType = value;
                selectSearchTargetRadioButton();
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option:
                Ext.getCmp("Resource_Search_Option").setValue(value);
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version:
                var versionOptionSelection = Ext.getCmp('Version_Option');
                versionOptionSelection.setValue(value);
                break;
            case WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type:
                switch (value) {
                    case WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.rdfs:
                        inferenceType = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.rdfs;
                        Ext.getDom('use_inf_model').checked = true;
                        break;
                }
                break;
        }
    }
}

function extractParametersFromURI(uri) {
    var params = {};
    var baseURI = uri;
    var paramString = "&";
    if (uri.indexOf("?") != -1) {
        var uriElements = uri.split("?");
        baseURI = uriElements[0];
        paramString = uriElements[1];
    }
    var baseURIElems = baseURI.split("/");
    if (7 <= baseURIElems.length) {
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type] = baseURIElems[4]
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name] = baseURIElems[6].replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
    }

    // default parameter
    params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target] = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
    params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version] = WIKIPEDIA_ONTOLOGY_SEARCH.constants.CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    if (paramString != '&') {
        var paramSet = paramString.split("&");
        for (var i = 0; i < paramSet.length; i++) {
            var param = paramSet[i].split("=");
            var key = param[0];
            var value = param[1];
            if (key == 'type') {
                if (params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name] == 'q') {
                    params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name] = value + " ";
                } else {
                    params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name] += value + " ";
                }
            } else {
                params[key] = value;
            }
        }
    } else {
        // default parameters
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option] = WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match;
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type] = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.none;
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version] = WIKIPEDIA_ONTOLOGY_SEARCH.constants.CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    }
    params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri] = uri;

//    for (var key in params) {
    //        console.log("key: " + key + "->" + "value: " + params[key]);
    //    }
    return params;
}

function getCurrentStatementTabURI() {
    var tabId = statementTabPanel.getActiveTab().id.split("StatementPanel")[1];
    var statementURIField = Ext.getCmp("StatementTabURIField" + tabId);
    return statementURIField.getValue();
}

function getURIPanel(id) {
    var buttonPanel = {
        xtype: 'compositefield',
        items: [
            {
                xtype: 'button',
                iconCls: 'icon-book_add',
                listeners: {
                    "click": function() {
                        var uri = getCurrentStatementTabURI();
                        if (id == "TreeURIField") {
                            uri = Ext.getCmp("TreeURIField").getValue();
                        }
                        var searchParams = extractParametersFromURI(uri);
                        addBookmark(searchParams);
                    }
                }
            },
            {
                xtype: 'button',
                iconCls: 'icon-rdf',
                listeners: {
                    "click": function() {
                        var uri = getCurrentStatementTabURI();
                        if (id == "TreeURIField") {
                            uri = Ext.getCmp("TreeURIField").getValue();
                        }
                        WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel.reloadRDFSource(uri)
                    }
                }
            }
        ]
    };

    return new Ext.Panel({
        frame : true,
        height: 30,
        bodyStyle : 'padding: 10px;',
        layout: 'border',
        items : [
            {
                region: 'west',
                xtype: 'label',
                text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.uri,
                width: 30
            },
            {
                id: id,
                region: 'center',
                xtype: 'textfield',
                editable: false
            },
            {
                region: 'east' ,
                width: 50,
                items: buttonPanel
            }
        ]
    });
}

function loadStore(store) {
    store.load({
        params : {
            start : 0,
            limit : WIKIPEDIA_ONTOLOGY_SEARCH.constants.RESOURCE_LIST_SIZE_LIMIT
        }
    });
}

function getStatementJsonReader() {
    return new Ext.data.JsonReader({
        root : "statement",
        totalProperty : 'numberOfStatements',
        fields : [
            {
                name : "subject",
                type : "string"
            },
            {
                name : "predicate",
                type : "string"
            },
            {
                name : "object",
                type : "string"
            }
        ]
    });
}

function getSearchOptionList() {
    switch (searchTargetType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri:
            switch (queryType) {
                case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Class:
                    return [
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.sibling_classes, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sibling_classes],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.sub_classes, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sub_classes],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_domain_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_domain_class],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_range_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_range_class],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.instances_of_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.instances_of_class],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.path_to_root_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.path_to_root_class],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.inverse_statements, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.inverse_statements]
                    ];
                case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Property:
                    return [
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.domain_classes_of_property, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.domain_classes_of_property],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.range_classes_of_property, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.range_classes_of_property],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.inverse_statements, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.inverse_statements]
                    ];
                case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Instance:
                    return [
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.types_of_instance, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.types_of_instance],
                        [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.inverse_statements, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.inverse_statements]
                    ];
            }
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.label:
            return [
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.any_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.any_match],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.starts_with, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.starts_with],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.ends_with, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.ends_with]
            ];
            break;
    }
}


function getTreeSearchOptionComboBox(id) {
    var searchOptionList = new Ext.data.ArrayStore({
        fields : ["Search_Option", "Search_Option_Value"],
        data : [
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.any_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.any_match],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.starts_with, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.starts_with],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.ends_with, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.ends_with]
        ]
    });

    var comboBox = new Ext.form.ComboBox({
        id : id,
        displayField : 'Search_Option',
        valueField : 'Search_Option_Value',
        triggerAction : "all",
        width : 180,
        editable : false,
        mode : "local",
        store : searchOptionList
    });
    comboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    return comboBox;
}

function getSearchOptionComboBox(id) {
    var searchOptionList = new Ext.data.ArrayStore({
        fields : ["Search_Option", "Search_Option_Value"],
        data : [
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.sibling_classes, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sibling_classes],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.sub_classes, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sub_classes],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_domain_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_domain_class],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_range_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_range_class],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.instances_of_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.instances_of_class],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.path_to_root_class, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.path_to_root_class],
            [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.inverse_statements, WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.inverse_statements]
        ]
    });

    var comboBox = new Ext.form.ComboBox({
        id : id,
        displayField : 'Search_Option',
        valueField : 'Search_Option_Value',
        triggerAction : "all",
        width : 180,
        editable : false,
        mode : "local",
        store : searchOptionList,
        listeners:
        {
            select: function(combo, value) {
                switch (combo.getValue()) {
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sibling_classes:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.sub_classes:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_domain_class:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_range_class:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.instances_of_class:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.path_to_root_class:
                        Ext.getDom('class_button').checked = true;
                        break;
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.domain_classes_of_property:
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.range_classes_of_property:
                        Ext.getDom('property_button').checked = true;
                        break
                    case WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.types_of_instance:
                        Ext.getDom('instance_button').checked = true;
                        break;
                }
                setURIField("StatementURIField", getQueryURI(""));
            }
        }
    });
    comboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    return comboBox;
}

function getVersionOptionComboBox(name) {
    var versionOptionList = new Ext.data.ArrayStore({
        fields : ["Version_Option", "Version_Option_Value"],
        data : [
            ["2010_11_14", "2010_11_14"],
            ["2010_02_09", "2010_02_09"]
        ]
    });

    var comboBox = new Ext.form.ComboBox({
        id : name,
        displayField : 'Version_Option',
        valueField : 'Version_Option_Value',
        triggerAction : "all",
        width : 100,
        editable : false,
        mode : "local",
        store : versionOptionList,
        listeners: {
            select: function() {
                setURIField("StatementURIField", getQueryURI(""));
            }
        }
    });
    comboBox.setValue('2010_11_14');
    return comboBox;
}

function renderKeyword(value, metadata, record) {
    switch (record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type)) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Class:
            return "<img src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "class_icon_s.png'/> " + value;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Property:
            return "<img src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "property_icon_s.png'/> " + value;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Instance:
            return "<img src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "instance_icon_s.png'/> " + value;
    }
    return value;
}

function makeClassContextMenu(keyword) {
    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getSearchKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.openNewTab,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.openRDFFile,
                iconCls: 'icon-rdf',
                handler: function() {
                    var queryURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.BASE_SERVER_CLASS_DATA_URL + encodeURI(keyword) + ".rdf";
                    WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel.reloadRDFSource(queryURL);
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    var queryURI = getQueryURI(keyword);
                    var searchParams = extractParametersFromURI(queryURI);
                    addBookmark(searchParams);
                }
            }
        ]
    });
}

function searchKeyWord(keyword) {
    selectResourceTypeRadioButton();
    var searchPanel = Ext.getCmp("SearchPanel");
    searchPanel.getForm().findField('keyword').setValue(keyword);
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    searchStatements(keyword);
}

function makeInstanceAndPropertyContextMenu(keyword, type) {
    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getSearchKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.openNewTab,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.openRDFFile,
                iconCls: 'icon-rdf',
                handler: function() {
                    var baseDataURL = "";
                    if (type == WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance) {
                        baseDataURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.BASE_SERVER_INSTANCE_DATA_URL;
                    } else {
                        baseDataURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.BASE_SERVER_PROPERTY_DATA_URL;
                    }
                    var queryURL = baseDataURL + encodeURI(keyword) + ".rdf";
                    WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel.reloadRDFSource(queryURL);
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    var queryURI = getQueryURI(keyword);
                    var searchParams = extractParametersFromURI(queryURI);
                    addBookmark(searchParams);
                }
            }
        ]
    });
}

function makePropertyContextMenu(keyword) {
    return makeInstanceAndPropertyContextMenu(keyword, WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Property);
}

function makeInstanceContextMenu(keyword) {
    return makeInstanceAndPropertyContextMenu(keyword, WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance);
}

function renderVersionOption(value, metadata, record) {
    var versionOption = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version);
    if (versionOption == '') {
        return WIKIPEDIA_ONTOLOGY_SEARCH.constants.CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    } else {
        return versionOption;
    }
}

function renderSearchTargetType(value, metadata, record) {
    var searchTarget = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target);
    return WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptionLabels[searchTarget];
}

function renderResourceType(value, metadata, record) {
    var resourceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
//    console.log(resourceType.charAt(0).toUpperCase() + resourceType.substring(1, resourceType.length));
    resourceType = resourceType.charAt(0).toUpperCase() + resourceType.substring(1, resourceType.length);
    return WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels[resourceType];
}

function renderInferenceType(value, metadata, record) {
    var inferenceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type);
    var inferenceOptionLabel = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptionLabels[inferenceType];
    if (inferenceOptionLabel == null) {
        return WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptionLabels.none;
    } else {
        return inferenceOptionLabel;
    }
}

function renderSearchOption(value, metadata, record) {
    var selectedOption = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option);
    var selectedOptionLabel = WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels[selectedOption];
    if (selectedOptionLabel != null) {
        return selectedOptionLabel;
    } else {
        return WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match;
    }
}

function getQueryURIFromHistoryAndBookmarkRecord(keyword, record) {
    queryType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
    selectResourceTypeRadioButton();
    searchTargetType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target);
    selectSearchTargetRadioButton();
    inferenceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type);

    Ext.getDom('use_inf_model').checked = (inferenceType == WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptionLabels.rdfs);

    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    var searchOption = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option);
    resetSearchOptionList(searchOption);

    var version = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version);
    if (version == "") {
        version = WIKIPEDIA_ONTOLOGY_SEARCH.constants.CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    }
    var versionOptionSelection = Ext.getCmp('Version_Option');
    versionOptionSelection.setValue(version);
    return getQueryURI(keyword);
}

function openHistoryAndBookmarkData(record) {
    var keyword = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name);
    var queryURI = getQueryURIFromHistoryAndBookmarkRecord(keyword, record);
    searchStatements(keyword);
}

function selectResourceTypeRadioButton() {
    switch (queryType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Class:
            Ext.getDom('class_button').checked = true;
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Property:
            Ext.getDom('property_button').checked = true;
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Instance:
            Ext.getDom('instance_button').checked = true;
            break;
    }
}

function selectSearchTargetRadioButton() {
    switch (searchTargetType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri:
            Ext.getCmp("uri_radio_button").setValue(true);
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.label:
            Ext.getCmp("label_radio_button").setValue(true);
            break;
    }
}

/**
 * Web Storageからデータを復元
 */
function getDataFromWebStorage(storage) {
    return JSON.parse(storage);
}

/**
 * Web Storageにブックマークを保存
 */
function saveBookmarksToWebStorage() {
    localStorage.bookmark = JSON.stringify(bookmarkArray);
    bookmarkStore.proxy = new Ext.ux.data.PagingMemoryProxy(bookmarkArray);
    bookmarkStore.reload();
}

/**
 * Web Storageに履歴データを保存
 */
function saveHistoryDataToWebStorage() {
    localStorage.history = JSON.stringify(historyDataArray);
    historyDataStore.proxy = new Ext.ux.data.PagingMemoryProxy(historyDataArray);
    historyDataStore.reload();
}

