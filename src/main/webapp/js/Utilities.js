/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getProxy(json_url) {
    //    return new Ext.data.ScriptTagProxy({
    //        url : json_url,
    //        timeout: 1000 * 60 * 5,
    //        method : "GET"
    //    });
    return new Ext.data.HttpProxy({
        url : json_url,
        timeout: 1000 * 60 * 5,
        method : "GET"
    });
}

function setSearchParams(params) {
    for (var key in params) {
        //        alert("key: " + key + "->" + "value: " + params[key]);
        var value = params[key];
        switch (key) {
            case RESOURCE_TYPE_PARAMETER_KEY:
                queryType = value;
                selectResourceTypeRadioButton();
                break;
            case RESOURCE_NAME_PARAMETER_KEY:
                var searchPanel = Ext.getCmp("SearchPanel");
                searchPanel.getForm().findField('keyword').setValue(value);
                break;
            case SEARCH_TARGET_PARAMETER_KEY:
                searchTargetType = value;
                switch (value) {
                    case URI_SEARCH_TARGET_OPTION:
                        Ext.getCmp("uri_radio_button").checked = true;
                        break;
                    case LABEL_SEARCH_TARGET_OPTION:
                        Ext.getCmp("label_radio_button").checked = true;
                        break;
                }
                break;
            case SEARCH_OPTION_PARAMETER_KEY:
                Ext.getCmp("Resource_Search_Option").setValue(value);
                break;
            case VERSION_PARAMETER_KEY:
                var versionOptionSelection = Ext.getCmp('Version_Option');
                versionOptionSelection.setValue(value);
                break;
            case INFERENCE_TYPE_PARAMETER_KEY:
                switch (value) {
                    case RDFS_INFERENCE_OPTION:
                        inferenceType = RDFS_INFERENCE_OPTION;
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
    params[RESOURCE_TYPE_PARAMETER_KEY] = baseURIElems[4];
    params[RESOURCE_NAME_PARAMETER_KEY] = baseURIElems[6];
    if (paramString != '&') {
        var paramSet = paramString.split("&");
        for (var i = 0; i < paramSet.length; i++) {
            var param = paramSet[i].split("=");
            params[param[0]] = param[1];
        }
    } else {
        // default parameters
        params[SEARCH_TARGET_PARAMETER_KEY] = URI_SEARCH_TARGET_OPTION;
        params[SEARCH_OPTION_PARAMETER_KEY] = EXACT_MATCH_SEARCH_OPTION;
        params[INFERENCE_TYPE_PARAMETER_KEY] = NONE_INFERENCE_OPTION;
        params[VERSION_PARAMETER_KEY] = CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    }
    params[URI_PARAMETER_KEY] = uri;

    //    for (var key in params) {
    //        alert("key: " + key + "->" + "value: " + params[key]);
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
                        uri = uri.replace("table_data", "data");
                        reloadRDFSource(uri);
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
                text: URI,
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
            limit : RESOURCE_LIST_SIZE_LIMIT
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
        case URI_SEARCH_TARGET_OPTION:
            switch (queryType) {
                case QTYPE_CLASS:
                    return [
                        [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                        [SIBLING_CLASSES, SIBLING_CLASSES_SEARCH_OPTION],
                        [SUB_CLASSES, SUB_CLASSES_SEARCH_OPTION],
                        [PROPERTIES_OF_DOMAIN_CLASS, PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION],
                        [PROPERTIES_OF_RANGE_CLASS, PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION],
                        [INSTANCES_OF_CLASS, INSTANCES_OF_CLASS_SEARCH_OPTION],
                        [PATH_TO_ROOT_CLASS, PATH_TO_ROOT_CLASS_SEARCH_OPTION],
                        [INVERSE_STATEMENTS, INVERSE_STATEMENTS_SEARCH_OPTION]
                    ];
                case QTYPE_PROPERTY:
                    return [
                        [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                        [DOMAIN_CLASSES_OF_PROPERTY, DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION],
                        [RANGE_CLASSES_OF_PROPERTY, RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION],
                        [INVERSE_STATEMENTS, INVERSE_STATEMENTS_SEARCH_OPTION]
                    ];
                case QTYPE_INSTANCE:
                    return [
                        [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                        [TYPES_OF_INSTANCE, TYPES_OF_INSTANCE_SEARCH_OPTION],
                        [INVERSE_STATEMENTS, INVERSE_STATEMENTS_SEARCH_OPTION]
                    ];
            }
            break;
        case LABEL_SEARCH_TARGET_OPTION:
            return [
                [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                [ANY_MATCH, ANY_MATCH_SEARCH_OPTION],
                [STARTS_WITH, STARTS_WITH_SEARCH_OPTION],
                [ENDS_WITH, ENDS_WITH_SEARCH_OPTION],
            ];
            break;
    }
}


function getTreeSearchOptionComboBox(id) {
    var searchOptionList = new Ext.data.ArrayStore({
        fields : ["Search_Option", "Search_Option_Value"],
        data : [
            [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
            [ANY_MATCH, ANY_MATCH_SEARCH_OPTION],
            [STARTS_WITH, STARTS_WITH_SEARCH_OPTION],
            [ENDS_WITH, ENDS_WITH_SEARCH_OPTION],
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
    comboBox.setValue(EXACT_MATCH_SEARCH_OPTION);
    return comboBox;
}

function getSearchOptionComboBox(id) {
    var searchOptionList = new Ext.data.ArrayStore({
        fields : ["Search_Option", "Search_Option_Value"],
        data : [
            [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
            [SIBLING_CLASSES, SIBLING_CLASSES_SEARCH_OPTION],
            [SUB_CLASSES, SUB_CLASSES_SEARCH_OPTION],
            [PROPERTIES_OF_DOMAIN_CLASS, PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION],
            [PROPERTIES_OF_RANGE_CLASS, PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION],
            [INSTANCES_OF_CLASS, INSTANCES_OF_CLASS_SEARCH_OPTION],
            [PATH_TO_ROOT_CLASS, PATH_TO_ROOT_CLASS_SEARCH_OPTION],
            [INVERSE_STATEMENTS, INVERSE_STATEMENTS_SEARCH_OPTION]
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
                    case SIBLING_CLASSES_SEARCH_OPTION:
                    case SUB_CLASSES_SEARCH_OPTION:
                    case PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION:
                    case PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION:
                    case INSTANCES_OF_CLASS_SEARCH_OPTION:
                    case PATH_TO_ROOT_CLASS_SEARCH_OPTION:
                        Ext.getDom('class_button').checked = true;
                        break;
                    case DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION:
                    case RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION:
                        Ext.getDom('property_button').checked = true;
                        break
                    case TYPES_OF_INSTANCE_SEARCH_OPTION:
                        Ext.getDom('instance_button').checked = true;
                        break;
                }
                Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
            }
        }
    });
    comboBox.setValue(EXACT_MATCH_SEARCH_OPTION);
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
                Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
            }
        }
    });
    comboBox.setValue('2010_11_14');
    return comboBox;
}

function renderKeyword(value, metadata, record) {
    switch (record.get(RESOURCE_TYPE_PARAMETER_KEY)) {
        case QTYPE_CLASS:
            return "<img src='" + BASE_ICON_URL + "class_icon_s.png'/> " + value;
        case QTYPE_PROPERTY:
            return "<img src='" + BASE_ICON_URL + "property_icon_s.png'/> " + value;
        case QTYPE_INSTANCE:
            return "<img src='" + BASE_ICON_URL + "instance_icon_s.png'/> " + value;
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
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text : getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchStatementsByContextMenu(currentKeyword + " " + keyword);
                }
            },
            {
                text: OPEN_RDF_FILE,
                iconCls: 'icon-rdf',
                handler: function() {
                    var queryURL = BASE_SERVER_CLASS_DATA_URL + encodeURI(keyword) + ".rdf";
                    reloadRDFSource(queryURL);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    var searchPanel = Ext.getCmp("SearchPanel");
                    searchPanel.getForm().findField('keyword').setValue(keyword);
                    searchStatementsByContextMenu();
                    addBookmark();
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
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchStatementsByContextMenu(keyword);
                }
            },
            {
                text: OPEN_RDF_FILE,
                iconCls: 'icon-rdf',
                handler: function() {
                    var baseDataURL = "";
                    if (type == INSTANCE) {
                        baseDataURL = BASE_SERVER_INSTANCE_DATA_URL;
                    } else {
                        baseDataURL = BASE_SERVER_PROPERTY_DATA_URL;
                    }
                    var queryURL = baseDataURL + encodeURI(keyword) + ".rdf";
                    reloadRDFSource(queryURL);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    searchStatementsByContextMenu(keyword);
                    addBookmark();
                }
            }
        ]
    });
}

function makePropertyContextMenu(keyword) {
    return makeInstanceAndPropertyContextMenu(keyword, PROPERTY);
}

function makeInstanceContextMenu(keyword) {
    return makeInstanceAndPropertyContextMenu(keyword, INSTANCE);
}

function renderVersionOption(value, metadata, record) {
    var versionOption = record.get(VERSION_PARAMETER_KEY);
    if (versionOption == '') {
        return CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    } else {
        return versionOption;
    }
}

function renderSearchTargetType(value, metadata, record) {
    switch (record.get(SEARCH_TARGET_PARAMETER_KEY)) {
        case URI_SEARCH_TARGET_OPTION:
            return URI;
        case LABEL_SEARCH_TARGET_OPTION:
            return LABEL;
    }
}

function renderResourceType(value, metadata, record) {
    switch (record.get(RESOURCE_TYPE_PARAMETER_KEY)) {
        case QTYPE_CLASS:
            return CLASS;
        case QTYPE_PROPERTY:
            return PROPERTY;
        case QTYPE_INSTANCE:
            return INSTANCE;
    }
}

function renderInferenceType(value, metadata, record) {
    switch (record.get(INFERENCE_TYPE_PARAMETER_KEY)) {
        case RDFS_INFERENCE_OPTION:
            return RDFS_INFERENCE;
        default:
            return NONE_INFERENCE;
    }
}

function renderSearchOption(value, metadata, record) {
    switch (record.get(SEARCH_OPTION_PARAMETER_KEY)) {
        case EXACT_MATCH_SEARCH_OPTION:
            return EXACT_MATCH;
        case  ANY_MATCH_SEARCH_OPTION:
            return ANY_MATCH;
        case STARTS_WITH_SEARCH_OPTION:
            return STARTS_WITH;
        case ENDS_WITH_SEARCH_OPTION:
            return ENDS_WITH;
        case SIBLING_CLASSES_SEARCH_OPTION:
            return SIBLING_CLASSES;
        case SUB_CLASSES_SEARCH_OPTION:
            return SUB_CLASSES;
        case PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION:
            return PROPERTIES_OF_DOMAIN_CLASS;
        case PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION:
            return PROPERTIES_OF_RANGE_CLASS;
        case DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION:
            return DOMAIN_CLASSES_OF_PROPERTY;
        case RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION:
            return RANGE_CLASSES_OF_PROPERTY;
        case INSTANCES_OF_CLASS_SEARCH_OPTION:
            return INSTANCES_OF_CLASS;
        case TYPES_OF_INSTANCE_SEARCH_OPTION:
            return TYPES_OF_INSTANCE;
        case INVERSE_STATEMENTS_SEARCH_OPTION:
            return INVERSE_STATEMENTS;
        case PATH_TO_ROOT_CLASS_SEARCH_OPTION:
            return PATH_TO_ROOT_CLASS;
    }
    return EXACT_MATCH;
}

function openHistoryAndBookmarkData(record) {
    var keyword = record.get(RESOURCE_NAME_PARAMETER_KEY);
    queryType = record.get(RESOURCE_TYPE_PARAMETER_KEY);
    selectResourceTypeRadioButton();
    searchTargetType = record.get(SEARCH_TARGET_PARAMETER_KEY);
    inferenceType = record.get(INFERENCE_TYPE_PARAMETER_KEY);
    if (inferenceType == RDFS_INFERENCE) {
        Ext.getDom('use_inf_model').checked = true;
    } else {
        Ext.getDom('use_inf_model').checked = false;
    }
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    searchOptionSelection.setValue(record.get(SEARCH_OPTION_PARAMETER_KEY));
    var version = record.get(VERSION_PARAMETER_KEY);
    if (version == "") {
        version = CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    }
    var versionOptionSelection = Ext.getCmp('Version_Option');
    versionOptionSelection.setValue(version);
    searchStatements(keyword);
    resetSearchOptionList();
}

function selectResourceTypeRadioButton() {
    switch (queryType) {
        case QTYPE_CLASS:
            Ext.getDom('class_button').checked = true;
            break;
        case QTYPE_PROPERTY:
            Ext.getDom('property_button').checked = true;
            break;
        case QTYPE_INSTANCE:
            Ext.getDom('instance_button').checked = true;
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
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    bookmarkStore.proxy = new Ext.ux.data.PagingMemoryProxy(bookmarkArray);
    bookmarkStore.reload();
}

/**
 * Web Storageに履歴データを保存
 */
function saveHistoryDataToWebStorage() {
    localStorage.history = JSON.stringify(historyDataArray);
    var historyDataStore = Ext.getCmp('HistoryPanel').store;
    historyDataStore.proxy = new Ext.ux.data.PagingMemoryProxy(historyDataArray);
    historyDataStore.reload();
}

