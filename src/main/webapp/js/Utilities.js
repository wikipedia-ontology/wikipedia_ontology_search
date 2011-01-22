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
        store : versionOptionList
    });
    comboBox.setValue('2010_11_14');
    return comboBox;
}

function renderKeyword(value, metadata, record) {
    switch (record.get("queryType")) {
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
                    searchWikipediaOntologyByContextMenu(keyword);
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchWikipediaOntologyByContextMenu(keyword);
                }
            },
            {
                text : getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    searchWikipediaOntologyByContextMenu(currentKeyword + " " + keyword);
                }
            },
            {
                text: OPEN_RDF_FILE,
                iconCls: 'icon-rdf',
                handler: function() {
                    var queryURL = BASE_SERVER_CLASS_DATA_URL + encodeURI(keyword) + ".rdf";
                    window.open(queryURL);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    var searchPanel = Ext.getCmp("SearchPanel");
                    searchPanel.getForm().findField('keyword').setValue(keyword);
                    searchWikipediaOntologyByContextMenu();
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
    //    searchOptionSelection.setValue(EXACT_MATCH_SEARCH_OPTION);
    searchWikipediaOntology();
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
                    searchWikipediaOntologyByContextMenu(keyword);
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchWikipediaOntologyByContextMenu(keyword);
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
                    window.open(queryURL);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    searchWikipediaOntologyByContextMenu(keyword);
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
    var versionOption = record.get('version');
    if (versionOption == '') {
        return CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    } else {
        return versionOption;
    }
}

function renderSearchTargetType(value, metadata, record) {
    switch (record.get('searchTargetType')) {
        case URI_SEARCH_TARGET_OPTION:
            return URI;
        case LABEL_SEARCH_TARGET_OPTION:
            return LABEL;
    }
}

function renderResourceType(value, metadata, record) {
    switch (record.get('queryType')) {
        case QTYPE_CLASS:
            return CLASS;
        case QTYPE_PROPERTY:
            return PROPERTY;
        case QTYPE_INSTANCE:
            return INSTANCE;
    }
}

function renderSearchOption(value, metadata, record) {
    switch (record.get('searchOption')) {
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
    var keyword = record.get('keyword');
    queryType = record.get('queryType');
    selectResourceTypeRadioButton();
    searchTargetType = record.get('searchTargetType');
    useInfModel = record.get('useInfModel');
    Ext.getDom('use_inf_model').checked = useInfModel;
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    searchOptionSelection.setValue(record.get('searchOption'));
    var version = record.get('version');
    if (version == '') {
        version = CURRENT_WIKIPEDIA_ONTOLOGY_VERSION;
    }
    var versionOptionSelection = Ext.getCmp('Version_Option');
    versionOptionSelection.setValue(version);
    searchWikipediaOntology2(keyword);
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
function saveBookmarksToWebStorage(bookmarkData) {
    localStorage.bookmark = JSON.stringify(bookmarkArray);
    bookmarkData.proxy = new Ext.ux.data.PagingMemoryProxy(bookmarkArray);
    bookmarkData.reload();
}

/**
 * Web Storageに履歴データを保存
 */
function saveHistoryDataToWebStorage(historyData) {
    localStorage.history = JSON.stringify(historyDataArray);
    historyData.proxy = new Ext.ux.data.PagingMemoryProxy(historyDataArray);
    historyData.reload();
}

