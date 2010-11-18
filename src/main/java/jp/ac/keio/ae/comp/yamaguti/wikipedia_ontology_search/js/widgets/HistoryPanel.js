
var historyDataArray = [];
if (localStorage.history != undefined) {
    historyDataArray = getDataFromWebStorage(localStorage.history);
}

function addHistoryData() {
	var searchPanel = Ext.getCmp('SearchPanel');
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
	var historyDataStore = Ext.getCmp('HistoryPanel').store;
	var keyword = searchPanel.getForm().findField('keyword').getValue();
	var searchOption = searchOptionSelection.getValue();
	var record = [new Date(), keyword, searchOption, queryType, useInfModel,
			currentURI];
	historyDataStore.loadData([record], true);
	historyDataStore.sort('date', 'DESC');
	saveHistoryDataToWebStorage(historyDataStore);
}

function removeAllHistoryData() {
	var historyDataStore = Ext.getCmp('HistoryPanel').store;
	historyDataStore.loadData([], false);
	saveHistoryDataToWebStorage(historyDataStore);
}

function removeSelectedHistories() {
	var historyDataStore = Ext.getCmp('HistoryPanel').store;
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	var selectedRecords = historyDataCheckboxSelectionModel.getSelections();
	for (var i = 0; i < selectedRecords.length; i++) {
		historyDataStore.remove(selectedRecords[i]);
	}
	saveHistoryDataToWebStorage(historyDataStore);
}

function addSelectedHistoriesToBookmark() {
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
	var records = historyDataCheckboxSelectionModel.getSelections();
	var addedBookmarks = [];
	var date = new Date();
	for (var i = 0; i < records.length; i++) {
		addedBookmarks.push([date, records[i].get("keyword"),
				records[i].get("searchOption"), records[i].get("queryType"),
				records[i].get("useInfModel"), records[i].get("URL")]);
	}
	bookmarkStore.loadData(addedBookmarks, true);
	bookmarkStore.sort('date', 'DESC');
	saveBookmarksToWebStorage(bookmarkStore);
}

function getHistoryDataColumnModel(isSidePanel,
		historyDataCheckboxSelectionModel) {
	return new Ext.grid.ColumnModel({
				columns : [historyDataCheckboxSelectionModel, {
							id : 'date_id',
							dataIndex : "date",
							header : DATE_AND_HOUR,
							hidden : isSidePanel,
							width : 150
						}, {
							id : 'keyword_id',
							dataIndex : "keyword",
							header : KEYWORD,
							width : 200,
							renderer : renderKeyword
						}, {
							id : 'search_option_id',
							dataIndex : "searchOption",
							header : SEARCH_OPTION,
							width : 100,
							hidden : isSidePanel,
							renderer : renderSearchOption
						}, {
							id : 'query_type_id',
							dataIndex : "queryType",
							header : SEARCH_TARGET,
							hidden : true,
							width : 100
						}, {
							id : 'useInfModel_id',
							dataIndex : "useInfModel",
							header : USE_INFERENCE_MODEL,
							hidden : isSidePanel,
							width : 100
						}, {
							id : 'url_id',
							dataIndex : "URL",
							header : URL,
							hidden : isSidePanel
						}],
				defaults : {
					sortable : true
				}
			});
}

function getHistoryPanel() {
	var historyDataStore = new Ext.data.ArrayStore({
				id : 'HistoryDataStore',
				fields : [{
							name : 'date'
						}, {
							name : 'keyword'
						}, {
							name : 'searchOption'
						}, {
							name : 'queryType'
						}, {
							name : 'useInfModel'
						}, {
							name : 'URL'
						}],
				sortInfo : {
					field : 'date',
					direction : "DESC"
				},
				data : historyDataArray
			});
	var historyDataCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel(
			{});
	var historyDataColumnModel = getHistoryDataColumnModel(false,
			historyDataCheckboxSelectionModel);
	return new Ext.grid.GridPanel({
		id : 'HistoryPanel',
		stateId : 'history_panel',
		stateful : true,
		stateEvents : ['columnresize', 'columnmove', 'columnvisible',
				'columnsort'],
		store : historyDataStore,
		colModel : historyDataColumnModel,
		title : SEARCH_HISTORY,
		stripeRows : true,
		frame : true,
		autoExpandColumn : 'url_id',
		sm : historyDataCheckboxSelectionModel,
		listeners : {
			celldblclick : function() {
				openHistoryAndBookmarkData(historyDataCheckboxSelectionModel
						.getSelected());
			},
			cellcontextmenu : showHistoryContextMenu
		},
		items : [{
			region : "north",
			xtype : 'toolbar',
			items : [{
				xtype : 'tbbutton',
				text : OPEN_SELECTED_HISTORY,
				handler : function() {
					openHistoryAndBookmarkData(historyDataCheckboxSelectionModel
							.getSelected());
				}
			}, '-', {
				xtype : 'tbbutton',
				text : ADD_SELECTED_HISTORIES_TO_BOOKMARK,
				handler : addSelectedHistoriesToBookmark
			}, '-', {
				xtype : 'tbbutton',
				text : REMOVE_SELECTED_HISTORIES,
				handler : removeSelectedHistories
			}, '-', {
				xtype : 'tbbutton',
				text : REMOVE_ALL_HISTORY,
				handler : removeAllHistoryData
			}]
		}]
	});
}

function getSideHistoryPanel() {
	var historyDataStore = Ext.getCmp('HistoryPanel').store;
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	var sideHistoryDataColumnModel = getHistoryDataColumnModel(true,
			historyDataCheckboxSelectionModel);
	return new Ext.grid.GridPanel({
				id : 'SideHistoryPanel',
				stateful : true,
				stateEvents : ['columnresize', 'columnmove', 'columnvisible',
						'columnsort'],
				store : historyDataStore,
				colModel : sideHistoryDataColumnModel,
				title : SEARCH_HISTORY,
				stripeRows : true,
				frame : true,
				autoExpandColumn : 'keyword_id',
				sm : historyDataCheckboxSelectionModel,
				listeners : {
					cellclick : function() {
						openHistoryAndBookmarkData(historyDataCheckboxSelectionModel
								.getSelected());
					},
					cellcontextmenu : showHistoryContextMenu
				}
			});
}

function showHistoryContextMenu(grid, rowIndex, cellIndex, e) {
	e.stopEvent();
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	historyDataCheckboxSelectionModel.selectRow(rowIndex);
	var record = historyDataCheckboxSelectionModel.getSelected();
	var queryType = record.get("queryType");
	if (queryType == 'class') {
		makeHistoryClassContextMenu(record).showAt(e.getXY());
	} else if (queryType == 'property') {
		makeHistoryPropertyContextMenu(record).showAt(e.getXY());
	} else if (queryType == 'instance') {
		makeHistoryInstanceContextMenu(record).showAt(e.getXY());
	}
}

function makeHistoryClassContextMenu(record) {
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	var record = historyDataCheckboxSelectionModel.getSelected();
	var keyword = record.get('keyword');
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');

	return new Ext.menu.Menu({
				style : {
					overflow : 'visible'
				},
				items : [{
							text : getSearchKeywordLabel(keyword),
							handler : function() {
								openHistoryAndBookmarkData(record);
							}
						}, {
							text : getNarrowDownKeywordLabel(keyword),
							handler : function() {
								var searchPanel = Ext.getCmp('SearchPanel');
								var currentKeyword = searchPanel.getForm()
										.findField('keyword').getValue();
								searchPanel.getForm().findField('keyword')
										.setValue(currentKeyword + " "
												+ keyword);
								queryType = record.get('queryType');
								setQueryType();
								useInfModel = record.get('useInfModel');
								Ext.getDom('use_inf_model').checked = useInfModel;
								searchOptionSelection.setValue(record
										.get('searchOption'));
								searchWikipediaOntology();
							}
						}, {
							text : getAddKeywordToBookmarkLabel(keyword),
							handler : function() {
								openHistoryAndBookmarkData(record);
								addBookmark();
							}
						}, {
							text : getRemoveKeywordFromHistoryLabel(keyword),
							handler : removeSelectedHistories
						}]
			});
}

function makeHistoryPropertyContextMenu(record) {
	return makeHistoryInstanceAndPropertyContextMenu(record);
}

function makeHistoryInstanceContextMenu(record) {
	return makeHistoryInstanceAndPropertyContextMenu(record);
}

function makeHistoryInstanceAndPropertyContextMenu(record) {
	var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel')
			.getSelectionModel();
	var record = historyDataCheckboxSelectionModel.getSelected();
	var keyword = record.get('keyword');

	return new Ext.menu.Menu({
				style : {
					overflow : 'visible'
				},
				items : [{
							text : getSearchKeywordLabel(keyword),
							handler : function() {
								openHistoryAndBookmarkData(record);
							}
						}, {
							text : getAddKeywordToBookmarkLabel(keyword),
							handler : function() {
								openHistoryAndBookmarkData(record);
								addBookmark();
							}
						}, {
							text : getRemoveKeywordFromHistoryLabel(keyword),
							handler : removeSelectedHistories
						}]
			});
}