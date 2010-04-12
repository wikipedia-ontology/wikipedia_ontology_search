function getMainView() {
	var searchPanel = getSearchPanel();
	var historyPanel = getHistoryPanel();
	var sideHistoryPanel = getSideHistoryPanel();
	var bookmarkPanel = getBookmarkPanel();
	var bookmarkImportAndExportDialog = getBookmarkImportAndExportDialog();
	var sideBookmarkPanel = getSideBookmarkPanel();
	var statementTablePanel = getStatementTablePanel();
	var sourcePanel = getSourcePanel();

	var wikiOntContentsTab = new Ext.TabPanel({
				activeTab : 0,
				frame : true,
				title : 'Statements',
				items : [statementTablePanel, bookmarkPanel, historyPanel,
						sourcePanel]
			});

	var classAndInstanceTreePanel = getTreePanel(CLASS_HIERARCHY_AND_INSTANCES,
			"classAndInstanceTree");
	var wholeClassTreePanel = getTreePanel(WHOLE_CLASS_HIEARCHY,
			"wholeClassTree");

	var westSideNorthPanel = new Ext.Panel({
				frame : true,
				autoScroll : true,
				collapsible : false,
				layout : "accordion",
				items : [classAndInstanceTreePanel, wholeClassTreePanel]
			});

	var westSideSouthPanel = new Ext.Panel({
				frame : true,
				autoScroll : true,
				collapsible : false,
				layout : "accordion",
				items : [sideBookmarkPanel, sideHistoryPanel]
			});

	var westSidePanel = new Ext.Panel({
				layout : 'border',
				items : [{
							region : 'center',
							collapsible : false,
							layout : 'fit',
							split : true,
							items : westSideNorthPanel
						}, {
							title : BOOKMARK_AND_SEARCH_HISTORY,
							region : 'south',
							collapsible : true,
							layout : 'fit',
							minHeight : 300,
							height : 300,
							split : true,
							items : westSideSouthPanel
						}]
			});

	var statusBarPanel = new Ext.Panel({
				bbar : new Ext.ux.StatusBar({
							id : 'statusBar',
							text : ''
						})
			});

	var mainPanel = new Ext.Panel({
				layout : 'border',
				hideBorders : true,
				items : [{
							title : SEARCH,
							region : 'north',
							layout : 'fit',
							height : 150,
							minHeight : 150,
							split : true,
							animate : true,
							collapsible : true,
							items : searchPanel
						}, {
							region : 'center',
							layout : 'fit',
							width : "80%",
							collapsible : false,
							items : wikiOntContentsTab
						}]
			});

	var optionDialog = getOptionDialog();
	var versionInfoDialog = getVersionInfoDialog();

	return new Ext.Viewport({
		id : 'mainView',
		layout : 'border',
		hideBorders : true,
		items : [{
			region : 'north',
			height : 60,
			cls : 'docs-header',
			items : [{
						xtype : 'box',
						el : 'header',
						border : false,
						anchor : 'none -25'
					}, {
						xtype : 'toolbar',
						items : [{
							xtype : 'tbbutton',
							text : LANGUAGE,
							menu : [{
								text : ENGLISH,
								handler : function() {
									window.open(HOME_URL + SEARCH_EN_HTML,
											"_self");
								}
							}, {
								text : JAPANESE,
								handler : function() {
									window.open(HOME_URL + SEARCH_JA_HTML,
											"_self");
								}
							}]
						}, {
							xtype : 'tbbutton',
							text : TOOL,
							menu : [{
										text : SHOW_WHOLE_CLASS_HIEARCHY,
										handler : showWholeIsaTree
									}, {
										text : OPTION,
										handler : showOptionDialog
									}]
						}, {
							xtype : 'tbbutton',
							text : HELP,
							menu : [{
										text : MANUAL,
										handler : function() {
											window.open(HOME_URL + MANUAL_HTML);
										}
									}, {
										text : VERSION_INFORMATION,
										handler : showVersionInfoDialog
									}]
						}]
					}]
		}, {
			region : 'center',
			layout : 'fit',
			width : "80%",
			collapsible : false,
			items : mainPanel
		}, {
			title : HIEARCHY,
			region : 'west',
			layout : 'fit',
			width : 300,
			minWidth : 300,
			split : true,
			animate : true,
			collapsible : true,
			items : westSidePanel
		}, {
			region : 'south',
			height : 25,
			items : statusBarPanel
		}]
	});
}