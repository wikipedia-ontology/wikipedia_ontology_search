function getTreePanel(title, treeType) {
	var treePanelId = treeType + "Panel";
	var treePanelSearchFieldlId = treeType + "Field";
	var textFieldEmptyText = "";
	if (treeType == "classAndInstanceTree") {
		textFieldEmptyText = FIND_CLASSES_OR_INSTANCES;
	} else if (treeType == "wholeClassTree") {
		textFieldEmptyText = FIND_CLASSES;
	}

	var searchTreeFieldPanel = new Ext.Panel({
				width : 160,
				minHeight : 50,
				maxHeight : 50,
				height : 50,
				items : []
			});
	var searchOptionComboBox = getSearchOptionComboBox(treeType
			+ '_Search_Option');
	searchOptionComboBox.setValue("any_match");
	var treePanel = new Ext.tree.TreePanel({
				id : treePanelId,
				title : title,
				layout : 'fit',
				border : false,
				animate : false,
				enableDD : false,
				collapsible : true,
				autoScroll : true,
				tbar : [' ', new Ext.form.TextField({
									id : treePanelSearchFieldlId,
									width : 160,
									minHeight : 50,
									maxHeight : 50,
									height : 50,
									emptyText : textFieldEmptyText
								}), {
							text : SEARCH,
							name : 'search-button',
							handler : function() {
								filterTreeNode(treeType);
							}
						}, ' ', '-', {
							iconCls : 'icon-expand-all',
							tooltip : EXPAND_ALL,
							handler : function() {
								expandAllTree(treePanelId);
							}
						}, '-', {
							iconCls : 'icon-collapse-all',
							tooltip : COLLAPSE_ALL,
							handler : function() {
								collapseAllTree(treePanelId);
							}
						}, '- ', searchOptionComboBox],
				loader : new Ext.tree.TreeLoader({
							dataUrl : JSON_TABLE_NULL_DATA,
							requestMethod : 'GET',
							listeners : {
								beforeload : function() {
									var tp = Ext.getCmp(treePanelId).body;
									if (tp != undefined) {
										tp.mask(LOADING, "loading-indicator");
									}
								},
								load : function() {
									var classAndInstanceTreePanel = Ext
											.getCmp('classAndInstanceTreePanel');
									classAndInstanceTreePanel
											.getRootNode()
											.expand(expand_all_class_and_instance);
									var tp = Ext.getCmp(treePanelId).body;
									if (tp != undefined) {
										tp.unmask();
									}
								}
							}
						}),
				root : {
					nodeType : 'async',
					text : ROOT_CLASS,
					draggable : false,
					id : 'wikiont_class_root',
					iconCls : 'icon-class'
				},
				listeners : {
					click : function(n) {
						var qname = n.attributes.id;
						var queryURL = "";
						var keyword = qname.split(":")[1];
						if (qname.indexOf("wikiont_class") != -1) {
							queryURL = qname.replace("wikiont_class:",
									BASE_SERVER_CLASS_JSON_TABLE_URL);
							queryType = 'class';
						} else if (qname.indexOf("wikiont_property") != -1) {
							queryURL = qname.replace("wikiont_property:",
									BASE_SERVER_PROPERTY_JSON_TABLE_URL);
							queryType = 'property';
						} else if (qname.indexOf("wikiont_instance") != -1) {
							queryURL = qname.replace("wikiont_instance:",
									BASE_SERVER_INSTANCE_JSON_TABLE_URL);
							queryType = 'instance';
						}
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						reloadWikiOntJSONData2(queryURL, keyword);
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
	if (searchOption == 'any_match') {
		re = new RegExp('.*' + Ext.escapeRe(text) + '.*', 'i');
	} else if (searchOption == 'starts_with') {
		re = new RegExp('^' + Ext.escapeRe(text) + '.*', 'i');
	} else if (searchOption == 'ends_with') {
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
	var queryURL = "";
	var keyword = qname.split(":")[1];
	if (qname.indexOf("wikiont_class") != -1) {
		queryType = 'class';
		var classContextMenu = makeClassContextMenu(keyword);
		classContextMenu.contextNode = node;
		classContextMenu.showAt(e.getXY());
	} else if (qname.indexOf("wikiont_property") != -1) {
		queryType = 'property';
		var classContextMenu = makePropertyContextMenu(keyword);
		classContextMenu.contextNode = node;
		classContextMenu.showAt(e.getXY());
	} else if (qname.indexOf("wikiont_instance") != -1) {
		queryType = 'instance';
		var instanceContextMenu = makeInstanceContextMenu(keyword);
		instanceContextMenu.contextNode = node;
		instanceContextMenu.showAt(e.getXY());
	}
}

var isRenderTree = true;
function reloadTree(queryJSONTableURL) {
	var queryJSONTreeURL = queryJSONTableURL.replace("json_table", "json_tree");
	queryURL = queryJSONTreeURL;
	// alert("tree:" + queryJSONTreeURL);
	if (show_isa_tree_and_instance) {
		if (!isRenderTree) {
			return;
		}
		var classAndInstanceTreePanel = Ext.getCmp('classAndInstanceTreePanel');
		classAndInstanceTreePanel.loader.dataUrl = queryJSONTreeURL;
		classAndInstanceTreePanel.loader.load(classAndInstanceTreePanel
				.getRootNode());
	}
}

function showWholeIsaTree() {
	var wholeClassTreePanel = Ext.getCmp('wholeClassTreePanel');
	wholeClassTreePanel.loader.dataUrl = JSON_TREE_ALL_CLASSES;
	wholeClassTreePanel.loader.load(wholeClassTreePanel.getRootNode());
	wholeClassTreePanel.getRootNode().expand();
}

function expandAllTree(id) {
	Ext.getCmp(id).expandAll();
}

function collapseAllTree(id) {
	Ext.getCmp(id).collapseAll();
}