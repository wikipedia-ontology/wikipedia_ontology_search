var bookmarkArray = [];
if (localStorage.bookmark != undefined) {
    bookmarkArray = getDataFromWebStorage(localStorage.bookmark);
}

function getBookmarkColumnModel(isSidePanel, bookmarkCheckboxSelectionModel) {
	return new Ext.grid.ColumnModel({
				columns : [bookmarkCheckboxSelectionModel, {
							id : 'date_id',
							dataIndex : "date",
							header : DATE_AND_HOUR,
							hidden : true,
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

function getBookmarkPanel() {
	var bookmarkStore = new Ext.data.ArrayStore({
				id : 'BookmarkStore',
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
				data : bookmarkArray
			});
	var bookmarkCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});
	var bookmarkColumnModel = getBookmarkColumnModel(false,
			bookmarkCheckboxSelectionModel);
	return new Ext.grid.GridPanel({
				id : 'BookmarkPanel',
				stateId : 'bookmark_panel',
				stateful : true,
				stateEvents : ['columnresize', 'columnmove', 'columnvisible',
						'columnsort'],
				store : bookmarkStore,
				colModel : bookmarkColumnModel,
				title : BOOKMARK,
				stripeRows : true,
				frame : true,
				autoExpandColumn : 'url_id',
				sm : bookmarkCheckboxSelectionModel,
				listeners : {
					celldblclick : function() {
						openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel
								.getSelected());
					},
					cellcontextmenu : showBookmarkContextMenu
				},
				items : [{
					region : "north",
					xtype : 'toolbar',
					items : [{
						xtype : 'button',
						text : OPEN_SELECTED_BOOKMARK,
						handler : function() {
							openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel
									.getSelected());
						}
					}, '-', {
						xtype : 'button',
						text : ADD_CURRENT_KEYWORD_TO_BOOKMARK,
						handler : addBookmark
					}, '-', {
						xtype : 'button',
						text : REMOVE_SELECTED_BOOKMARKS,
						handler : removeSelectedBookmarks
					}, '-', {
						xtype : 'button',
						text : IMPORT,
						handler : showBookmarkImportDialog
					}, '-', {
						xtype : 'button',
						text : EXPORT,
						handler : showBookmarkExportDialog
					}]
				}]
			});
}

function getSideBookmarkPanel() {
	var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
	var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel')
			.getSelectionModel();
	var sideBookmarkColumnModel = getBookmarkColumnModel(true,
			bookmarkCheckboxSelectionModel);
	return new Ext.grid.GridPanel({
				stateful : true,
				stateEvents : ['columnresize', 'columnmove', 'columnvisible',
						'columnsort'],
				store : bookmarkStore,
				colModel : sideBookmarkColumnModel,
				sm : bookmarkCheckboxSelectionModel,
				title : BOOKMARK,
				stripeRows : true,
				frame : true,
				autoExpandColumn : 'keyword_id',
				listeners : {
					cellclick : function() {
						openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel
								.getSelected());
					},
					cellcontextmenu : showBookmarkContextMenu
				}
			});
}

function addBookmark() {
	var searchPanel = Ext.getCmp('SearchPanel');
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
	var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
	var keyword = searchPanel.getForm().findField('keyword').getValue();
	var searchOption = searchOptionSelection.getValue();
	var record = [new Date(), keyword, searchOption, queryType, useInfModel,
			currentURI];
	bookmarkStore.loadData([record], true);
	bookmarkStore.sort('date', 'DESC');
	saveBookmarksToWebStorage(bookmarkStore);
}

function removeSelectedBookmarks() {
	var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel')
			.getSelectionModel();
	var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
	var selectedRecords = bookmarkCheckboxSelectionModel.getSelections();
	for (var i = 0; i < selectedRecords.length; i++) {
		bookmarkStore.remove(selectedRecords[i]);
	}
	saveBookmarksToWebStorage(bookmarkStore);
}

function showBookmarkContextMenu(grid, rowIndex, cellIndex, e) {
	e.stopEvent();
	var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel')
			.getSelectionModel();
	bookmarkCheckboxSelectionModel.selectRow(rowIndex);
	var record = bookmarkCheckboxSelectionModel.getSelected();
	var queryType = record.get("queryType");
	if (queryType == 'class') {
		makeBookmarkClassContextMenu(record).showAt(e.getXY());
	} else if (queryType == 'property') {
		makeBookmarkPropertyContextMenu(record).showAt(e.getXY());
	} else if (queryType == 'instance') {
		makeBookmarkInstanceContextMenu(record).showAt(e.getXY());
	}
}

function makeBookmarkClassContextMenu(record) {
	var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel')
			.getSelectionModel();
	var record = bookmarkCheckboxSelectionModel.getSelected();
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
							text : getRemoveKeywordFromBookmarkLabel(keyword),
							handler : function() {
								removeSelectedBookmarks();
							}
						}]
			});
}

function makeBookmarkPropertyContextMenu() {
	return makeBookmarkInstanceAndPropertyContextMenu();
}

function makeBookmarkInstanceContextMenu() {
	return makeBookmarkInstanceAndPropertyContextMenu();
}

function makeBookmarkInstanceAndPropertyContextMenu() {
	var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel')
			.getSelectionModel();
	var record = bookmarkCheckboxSelectionModel.getSelected();
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
							text : getRemoveKeywordFromBookmarkLabel(keyword),
							handler : removeSelectedBookmarks
						}]
			});
}
