function getStatementTableDataStore() {
	var reader = new Ext.data.JsonReader({
				root : "statement",
				totalProperty : 'numberOfStatements',
				fields : [{
							name : "subject",
							type : "string"
						}, {
							name : "predicate",
							type : "string"
						}, {
							name : "object",
							type : "string"
						}]
			});

	return new Ext.data.GroupingStore({
				id : 'StatementTableDataStore',
				reader : reader,
				proxy : getProxy(JSON_TABLE_NULL_DATA),
				sortInfo : {
					field : 'subject',
					direction : "ASC"
				},
				groupField : 'subject',
				listeners : {
					beforeload : function() {
						Ext.getCmp("StatementTablePanel").body.mask(LOADING,
								"loading-indicator");
					},
					load : function() {
						Ext.getCmp("StatementTablePanel").body.unmask();
					}
				}
			});
}

function getProxy(json_url) {
	return new Ext.data.HttpProxy({
				url : json_url,
                timeout: 1000 * 60 * 5,			
				method : "GET"
			});
}

function getStatementTablePanel() {

	var groupingStatementTableView = new Ext.grid.GroupingView({
		enableGrouping : false,
		forceFit : true,
		startCollapsed : start_collapsed_group,
		// groupTextTpl : '{text} ({[values.rs.length]} {[values.rs.length > 1 ?
		// '
		// + STATEMENT + ' : ' + STATEMENT + ']})'
		groupTextTpl : '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "ステートメント" : "ステートメント"]})'
	});
	var statementTableDataStore = getStatementTableDataStore();

	var pagingToolBar = new Ext.PagingToolbar({
				id : 'PagingToolBar',
				pageSize : 100,
				store : statementTableDataStore,
				displayInfo : true,
				displayMsg : "{2} ステートメント中 {0} - {1} を表示",
				plugins : [new Ext.ux.SlidingPager(),
						new Ext.ux.ProgressBarPager()],
				listeners : {
					beforechange : function() {
						isRenderTree = false;
					}
				}
			});

	return new Ext.grid.GridPanel({
				id : 'StatementTablePanel',
				stateId : 'statement_table_panel',
				stateful : true,
				stateEvents : ['columnresize', 'columnmove', 'columnvisible',
						'columnsort'],
				store : statementTableDataStore,
				columns : [{
							header : SUBJECT,
							dataIndex : "subject",
							id : "subject_id",
							renderer : renderLink,
							sortable : true
						}, {
							header : PREDICATE,
							id : "predicate_id",
							sortable : true,
							dataIndex : "predicate",
							renderer : renderLink,
							sortable : true
						}, {
							header : OBJECT,
							sortable : true,
							dataIndex : "object",
							id : "object",
							renderer : renderLink,
							sortable : true
						}],
				bbar : pagingToolBar,
				view : groupingStatementTableView,
				title : STATEMENT,
				autoExpandColumn : 'object',
				stripeRows : true,
				listeners : {
					cellclick : openWikiOntJSONData,
					cellcontextmenu : showStatementTablePanelContextMenu
				}
			});
}

function showStatementTablePanelContextMenu(grid, rowIndex, cellIndex, e) {
	e.stopEvent();
	var url = e.getTarget().getAttribute("alt");
	if (url == null) {
		url = e.getTarget().children.item(1).toString();
	}
	if (url.indexOf("wikiont_class") != -1) {
		var queryURL = url.replace("wikiont_class:", "query/class/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'class';
		makeClassContextMenu(keyword).showAt(e.getXY());
	} else if (url.indexOf("wikiont_property") != -1) {
		var queryURL = url.replace("wikiont_property:",
				"query/property/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'property';
		makePropertyContextMenu(keyword).showAt(e.getXY());
	} else if (url.indexOf("wikiont_instance") != -1) {
		var queryURL = url.replace("wikiont_instance:",
				"query/instance/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'instance';
		var menu = makeInstanceContextMenu(keyword);
		menu.showAt(e.getXY());
	}
}

function reloadStatementTable(queryJSONTableURL) {
	var statementTableDataStore = Ext.getCmp('StatementTablePanel').store;
	var numberOfStatementsSelection = Ext.getCmp('numberOfStatementsSelection');
	var pagingToolBar = Ext.getCmp('PagingToolBar');
	statementTableDataStore.proxy = getProxy(queryJSONTableURL);
	var limitSize = 100;
	if (!isNaN(numberOfStatementsSelection.getValue())) {
		limitSize = parseInt(numberOfStatementsSelection.getValue());
	} else {
		numberOfStatementsSelection.setValue("100");
	}
	pagingToolBar.pageSize = limitSize;
	statementTableDataStore.load({
				params : {
					start : 0,
					limit : limitSize
				}
			});
}

function reloadWikiOntJSONData(queryJSONTableURL) {
	isRenderTree = true;
	queryURL = queryJSONTableURL;
	reloadStatementTable(queryJSONTableURL);
	reloadTree(queryURL);
	reloadRDFSource(queryURL);
}

function renderLink(value) {
	var newValue = "";
	if (value.indexOf("wikiont_class") != -1) {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "class_icon_s.png'/> ";
	} else if (value.indexOf("wikiont_property") != -1) {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "property_icon_s.png'/> ";
	} else if (value.indexOf("wikiont_instance") != -1) {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "instance_icon_s.png'/> ";
	} else if (value.indexOf("wikipedia.org") != -1) {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "wikipedia_icon_s.png'/> ";
	} else if (value.indexOf("dbpedia.org") != -1) {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "dbpedia_icon_s.png'/> ";
	}
	if (value.indexOf(":") != -1) {
		newValue += '<a href="' + value + '" onclick="openWikiOntRDFData(\''
				+ value + '\'); return false;">' + value + "</a>";
		return newValue;
	} else {
		newValue += "<img alt='" + value + "' src='" + BASE_ICON_URL
				+ "label_icon_s.png'/> " + value;
		return newValue;
	}
}

function openWikiOntRDFData(value) {
	if (value.indexOf("http://") != -1) {
		window.open(value);
		return;
	}
	var values = value.split(":");
	if (values.length == 2) {
		var prefix = values[0];
		var id = values[1];
		if (prefix == "wikiont_class") {
			var queryURL = BASE_SERVER_CLASS_DATA_URL + id + ".rdf";
			window.open(queryURL);
		} else if (prefix == "wikiont_property") {
			var queryURL = BASE_SERVER_PROPERTY_DATA_URL + id + ".rdf";
			window.open(queryURL);
		} else if (prefix == "wikiont_instance") {
			var queryURL = BASE_SERVER_INSTANCE_DATA_URL + id + ".rdf";
			window.open(queryURL);
		}
	} else {
		window.open(value);
	}
}

function openWikiOntJSONData(grid, rowIndex, columnIndex, e) {
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
	searchOptionSelection.setValue('exact_match');
	var url = e.getTarget().getAttribute("alt");
	if (url == null) {
		url = e.getTarget().children.item(1).toString();
	}
	if (url.indexOf("wikiont_class") != -1) {
		var queryURL = url.replace("wikiont_class:", "query/class/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'class';
		reloadWikiOntJSONData2(queryURL, keyword);
	} else if (url.indexOf("wikiont_property") != -1) {
		var queryURL = url.replace("wikiont_property:",
				"query/property/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'property';
		reloadWikiOntJSONData2(queryURL, keyword);
	} else if (url.indexOf("wikiont_instance") != -1) {
		var queryURL = url.replace("wikiont_instance:",
				"query/instance/json_table/");
		var keyword = queryURL.split("json_table/")[1];
		keyword = decodeURI(keyword);
		queryType = 'instance';
		reloadWikiOntJSONData2(queryURL, keyword);
	}
}