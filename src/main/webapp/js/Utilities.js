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

function getSearchOptionList(resType, searchTargetType) {
    if (searchTargetType == URI) {
        if (resType == CLASS) {
            return [
                [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                [SIBLING_CLASSES, SIBLING_CLASSES_SEARCH_OPTION],
                [SUB_CLASSES, SUB_CLASSES_SEARCH_OPTION],
                [PROPERTIES_OF_DOMAIN_CLASS, PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION],
                [PROPERTIES_OF_RANGE_CLASS, PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION],
                [INSTANCES_OF_CLASS, INSTANCES_OF_CLASS_SEARCH_OPTION]
            ];
        } else if (resType == PROPERTY) {
            return [
                [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                [DOMAIN_CLASSES_OF_PROPERTY, DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION],
                [RANGE_CLASSES_OF_PROPERTY, RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION]
            ];
        } else if (resType == INSTANCE) {
            return [
                [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                [TYPES_OF_INSTANCE, TYPES_OF_INSTANCE_SEARCH_OPTION]
            ];
        }
    } else if (searchTargetType == LABEL) {
        return [
            [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
            [ANY_MATCH, ANY_MATCH_SEARCH_OPTION],
            [STARTS_WITH, STARTS_WITH_SEARCH_OPTION],
            [ENDS_WITH, ENDS_WITH_SEARCH_OPTION],
        ];
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
            [INSTANCES_OF_CLASS, INSTANCES_OF_CLASS_SEARCH_OPTION]
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
                var selectedValue = combo.getValue();
                if (selectedValue == SIBLING_CLASSES_SEARCH_OPTION || selectedValue == SUB_CLASSES_SEARCH_OPTION ||
                        selectedValue == PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION || selectedValue == PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION ||
                        selectedValue == INSTANCES_OF_CLASS_SEARCH_OPTION) {
                    Ext.getDom('class_button').checked = true;
                } else if (selectedValue == DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION || selectedValue == RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION) {
                    Ext.getDom('property_button').checked = true;
                } else if (selectedValue == TYPES_OF_INSTANCE_SEARCH_OPTION) {
                    Ext.getDom('instance_button').checked = true;
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
    if (record.get("queryType") == 'class') {
        return "<img src='" + BASE_ICON_URL + "class_icon_s.png'/> " + value;
    } else if (record.get("queryType") == 'property') {
        return "<img src='" + BASE_ICON_URL + "property_icon_s.png'/> " + value;
    } else if (record.get("queryType") == 'instance') {
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
                    setQueryType();
                    var searchPanel = Ext.getCmp("SearchPanel");
                    searchPanel.getForm().findField('keyword').setValue(keyword);
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue('exact_match');
                    searchWikipediaOntology()
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchKeyWord(keyword);
                }
            },
            {
                text : getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    setQueryType();
                    var searchPanel = Ext.getCmp("SearchPanel");
                    var currentKeyword = searchPanel.getForm().findField('keyword').getValue();
                    searchPanel.getForm().findField('keyword').setValue(currentKeyword + " " + keyword);
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue('exact_match');
                    searchWikipediaOntology()
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
                    setQueryType();
                    var searchPanel = Ext.getCmp("SearchPanel");
                    searchPanel.getForm().findField('keyword').setValue(keyword);
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue('exact_match');
                    searchWikipediaOntology();
                    addBookmark();
                }
            }
        ]
    });
}

function searchKeyWord(keyword) {
    setQueryType();
    var searchPanel = Ext.getCmp("SearchPanel");
    searchPanel.getForm().findField('keyword').setValue(keyword);
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
    searchOptionSelection.setValue('exact_match');
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
                    searchKeyWord(keyword);
                }
            },
            {
                text: OPEN_NEW_TAB,
                iconCls: 'icon-newtab',
                handler: function() {
                    addTab();
                    searchKeyWord(keyword);
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
                    searchKeyWord(keyword);
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

function renderSearchOption(value, metadata, record) {
    var searchOption = record.get('searchOption');
    if (searchOption == EXACT_MATCH_SEARCH_OPTION) {
        return EXACT_MATCH;
    } else if (searchOption == ANY_MATCH_SEARCH_OPTION) {
        return ANY_MATCH;
    } else if (searchOption == STARTS_WITH_SEARCH_OPTION) {
        return STARTS_WITH;
    } else if (searchOption == ENDS_WITH_SEARCH_OPTION) {
        return ENDS_WITH;
    } else if (searchOption == SIBLING_CLASSES_SEARCH_OPTION) {
        return SIBLING_CLASSES;
    } else if (searchOption == SUB_CLASSES_SEARCH_OPTION) {
        return SUB_CLASSES;
    } else if (searchOption == PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION) {
        return PROPERTIES_OF_DOMAIN_CLASS;
    } else if (searchOption == PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION) {
        return PROPERTIES_OF_RANGE_CLASS;
    } else if (searchOption == DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION) {
        return DOMAIN_CLASSES_OF_PROPERTY;
    } else if (searchOption == RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION) {
        return RANGE_CLASSES_OF_PROPERTY;
    }
    return EXACT_MATCH;
}

function openHistoryAndBookmarkData(record) {
    var keyword = record.get('keyword');
    queryType = record.get('queryType');
    setQueryType();
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
}

function setQueryType() {
    if (queryType == 'class') {
        Ext.getDom('class_button').checked = true;
    } else if (queryType == 'property') {
        Ext.getDom('property_button').checked = true;
    } else if (queryType == 'instance') {
        Ext.getDom('instance_button').checked = true;
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

