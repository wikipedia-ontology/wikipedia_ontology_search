/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */
function getTreePanel(title, treeType) {
    var treePanelId = treeType + "Panel";
    var treePanelSearchFieldlId = treeType + "Field";
    var textFieldEmptyText = WIKIPEDIA_ONTOLOGY_SEARCH.resources.findClasses;

    var searchTreeFieldPanel = new Ext.Panel({
        width : 160,
        minHeight : 50,
        maxHeight : 50,
        height : 50,
        items : []
    });
    var searchOptionComboBox = getTreeSearchOptionComboBox(treeType + '_Search_Option');
    searchOptionComboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    var treePanel = new Ext.tree.TreePanel({
        id : treePanelId,
        title : title,
        layout : 'fit',
        border : false,
        animate : false,
        enableDD : false,
        autoScroll : true,
        iconCls: 'icon-expand-all',
        tbar : [' ', new Ext.form.TextField({
            id : treePanelSearchFieldlId,
            width : 160,
            minHeight : 50,
            maxHeight : 50,
            height : 50,
            emptyText : textFieldEmptyText
        }), {
            text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.search,
            name : 'search-button',
            iconCls: 'icon-search',
            handler : function() {
                filterTreeNode(treeType);
            }
        }, ' ', '-', {
            iconCls : 'icon-expand-all',
            tooltip : WIKIPEDIA_ONTOLOGY_SEARCH.resources.expandAll,
            handler : function() {
                expandAllTree(treePanelId);
            }
        }, '-', {
            iconCls : 'icon-collapse-all',
            tooltip : WIKIPEDIA_ONTOLOGY_SEARCH.resources.collapseAll,
            handler : function() {
                collapseAllTree(treePanelId);
            }
        }, '- ', searchOptionComboBox],
        loader : new Ext.tree.TreeLoader({
            dataUrl : WIKIPEDIA_ONTOLOGY_SEARCH.constants.NULL_TREE_DATA,
            //            proxy: getProxy(NULL_TABLE_DATA),
            requestMethod : 'GET',
            listeners : {
                beforeload : function() {
                    var tp = Ext.getCmp(treePanelId).body;
                    if (tp != undefined) {
                        tp.mask(WIKIPEDIA_ONTOLOGY_SEARCH.resources.loading, "loading-indicator");
                    }
                },
                load : function() {
                    var classTreePanel = Ext.getCmp('classTreePanel');
                    classTreePanel.getRootNode().expand(expand_all_class);
                    var tp = Ext.getCmp(treePanelId).body;
                    if (tp != undefined) {
                        tp.unmask();
                    }
                }
            }
        }),
        root : {
            nodeType : 'async',
            text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.rootClass,
            draggable : false,
            id : 'wikiont_class_root',
            iconCls : 'icon-class'
        },
        listeners : {
            click : function(n) {
                var queryURI = "";
                var qname = n.attributes.qname;
                var keyword = qname.split(":")[1];
                if (qname.indexOf("wikiont_class") != -1) {
                    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
                    queryURI = qname.replace("wikiont_class:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_CLASS_DATA_URL);
                } else if (qname.indexOf("wikiont_property") != -1) {
                    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
                    queryURI = qname.replace("wikiont_property:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_PROPERTY_DATA_URL);
                } else if (qname.indexOf("wikiont_instance") != -1) {
                    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
                    queryURI = qname.replace("wikiont_instance:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_INSTANCE_DATA_URL);
                }
                queryURI += WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION;
                var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                searchOptionSelection.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
                reloadStatements(queryURI, keyword);
            },
            contextmenu : showTreePanelContextMenu
        }
    });
    new Ext.tree.TreeSorter(treePanel, {
        folderSort : true,
        dir : "asc"
    });
    treePanel.getRootNode().expand();

    return treePanel;
}

var showNodes = [];
var hiddenNodes = [];
function filterTreeNode(view) {
    var text = Ext.getCmp(view + "Field").getValue();
    var treePanel = Ext.getCmp(view + "Panel");
    var searchOption = Ext.getCmp(view + "_Search_Option").getValue();

    treePanel.hide();

    Ext.each(hiddenNodes, function(n) {
        n.ui.show();
    });

    var classFilter = new Ext.tree.TreeFilter(treePanel, {
        clearBlank : true,
        autoClear : true
    });

    if (!text) {
        classFilter.clear();
        treePanel.show();
        return;
    }

    hiddenNodes = [];
    treePanel.expandAll();
    var re = new RegExp('^' + Ext.escapeRe(text) + '$', 'i');
    if (searchOption == ANY_MATCH_SEARCH_OPTION) {
        re = new RegExp('.*' + Ext.escapeRe(text) + '.*', 'i');
    } else if (searchOption == STARTS_WITH_SEARCH_OPTION) {
        re = new RegExp('^' + Ext.escapeRe(text) + '.*', 'i');
    } else if (searchOption == ENDS_WITH_SEARCH_OPTION) {
        re = new RegExp(Ext.escapeRe(text) + '$', 'i');
    }
    setShowNodes(treePanel, re, view);
    classFilter.filterBy(function(n) {
        return showNodes.indexOf(n) != -1;
    });
    setHiddenNodes(treePanel);
    treePanel.show();
}

function setHiddenNodes(treePanel) {
    treePanel.getRootNode().cascade(function(n) {
        if (showNodes.indexOf(n) == -1) {
            hiddenNodes.push(n);
            n.ui.hide();
        }
    });
}

function setShowNodes(treePanel, re, view) {
    showNodes = getMatchedTreeNodes(treePanel, re, view);
    for (var i = 0; i < showNodes.length; i++) {
        addShowNodes(showNodes[i].parentNode);
    }
}

function getMatchedTreeNodes(treePanel, re, view) {
    var matchedNodes = []
    treePanel.getRootNode().cascade(function(n) {
        var text = n.text;
        if (view == "wholeClassTree") {
            text = text.split(/（\d+）/)[0];
        }
        if (re.test(text)) {
            matchedNodes.push(n);
        }
    });
    return matchedNodes;
}

function addShowNodes(node) {
    if (node != null) {
        if (showNodes.indexOf(node) == -1) {
            showNodes.push(node);
        }
        addShowNodes(node.parentNode);
    }
}

function showTreePanelContextMenu(node, e) {
    e.stopEvent();
    var qname = node.attributes.id;
    var keyword = qname.split(":")[1];
    if (qname.indexOf("wikiont_class") != -1) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
        var classContextMenu = makeClassContextMenu(keyword);
        classContextMenu.contextNode = node;
        classContextMenu.showAt(e.getXY());
    } else if (qname.indexOf("wikiont_property") != -1) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
        var classContextMenu = makePropertyContextMenu(keyword);
        classContextMenu.contextNode = node;
        classContextMenu.showAt(e.getXY());
    } else if (qname.indexOf("wikiont_instance") != -1) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
        var instanceContextMenu = makeInstanceContextMenu(keyword);
        instanceContextMenu.contextNode = node;
        instanceContextMenu.showAt(e.getXY());
    }
}

var isRenderTree = true;
function reloadTree(queryURI) {
    if (show_isa_tree) {
        if (!isRenderTree) {
            return;
        }
        var classTreePanel = Ext.getCmp('classTreePanel');
        if (classTreePanel != null) {
            classTreePanel.loader.dataUrl = encodeURI(queryURI);
            classTreePanel.loader.load(classTreePanel.getRootNode());
            setURIField("TreeURIField", queryURI);
        }
    }
}

function loadWholeIsaTree() {
    var wholeClassTreePanel = Ext.getCmp('wholeClassTreePanel');
    //    alert(ALL_CLASSES);
    wholeClassTreePanel.loader.dataUrl = WIKIPEDIA_ONTOLOGY_SEARCH.constants.ALL_CLASSES;
    wholeClassTreePanel.loader.load(wholeClassTreePanel.getRootNode());
    wholeClassTreePanel.getRootNode().expand();
}

function expandAllTree(id) {
    Ext.getCmp(id).expandAll();
}

function collapseAllTree(id) {
    Ext.getCmp(id).collapseAll();
}