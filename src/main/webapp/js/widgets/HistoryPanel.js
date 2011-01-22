/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

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
    var versionOptionSelection = Ext.getCmp('Version_Option');
    var versionOption = versionOptionSelection.getValue();
    var record = [new Date().toLocaleString(), keyword,  queryType, searchTargetType, searchOption, useInfModel, currentURI, versionOption];
    historyDataArray.push(record);
    saveHistoryDataToWebStorage(historyDataStore);
}

function removeAllHistoryData() {
    var historyDataStore = Ext.getCmp('HistoryPanel').store;
    historyDataArray = [];
    saveHistoryDataToWebStorage(historyDataStore);
}

function removeSelectedHistories() {
    var historyDataStore = Ext.getCmp('HistoryPanel').store;
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var selectedRecords = historyDataCheckboxSelectionModel.getSelections();
    var newHistoryDataArray = [];
    for (var h = 0; h < historyDataArray.length; h++) {
        var isDelete = false;
        for (var i = 0; i < selectedRecords.length; i++) {
            if (historyDataArray[h][0] == selectedRecords[i].get('date')) {
                isDelete = true;
            }
        }
        if (!isDelete) {
            newHistoryDataArray.push(historyDataArray[h]);
        }
    }
    historyDataArray = newHistoryDataArray;
    saveHistoryDataToWebStorage(historyDataStore);
}

function addSelectedHistoriesToBookmark() {
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    var records = historyDataCheckboxSelectionModel.getSelections();
    var date = new Date().toLocaleString();
    for (var i = 0; i < records.length; i++) {
        bookmarkArray.push([date, records[i].get("keyword"), records[i].get("queryType"), records[i].get("searchTargetType"),
            records[i].get("searchOption"), records[i].get("useInfModel"), records[i].get("URI"), records[i].get("version")]);
    }
    saveBookmarksToWebStorage(bookmarkStore);
}

function getHistoryDataColumnModel(isSidePanel, historyDataCheckboxSelectionModel) {
    return new Ext.grid.ColumnModel({
        columns : [historyDataCheckboxSelectionModel,
            {
                id : 'date_id',
                dataIndex : "date",
                header : DATE_AND_HOUR,
                hidden : isSidePanel,
                width : 150
            },
            {
                id : 'keyword_id',
                dataIndex : "keyword",
                header : KEYWORD,
                renderer : renderKeyword,
                width : 200
            },
            {
                id : 'query_type_id',
                dataIndex : "queryType",
                header : RESOURCE_TYPE,
                hidden : isSidePanel,
                renderer : renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : "searchTargetType",
                header : SEARCH_TARGET,
                hidden : isSidePanel,
                renderer : renderSearchTargetType,
                width : 100
            },
            {
                id : 'search_option_id',
                dataIndex : "searchOption",
                header : SEARCH_OPTION,
                hidden : isSidePanel,
                renderer : renderSearchOption,
                width : 100
            },
            {
                id : 'useInfModel_id',
                dataIndex : "useInfModel",
                header : USE_INFERENCE_MODEL,
                hidden : isSidePanel,
                width : 100
            },
            {
                id : 'uri_id',
                dataIndex : "URI",
                header : URI,
                hidden : isSidePanel
            },
            {
                id : 'version_id',
                dataIndex : "version",
                header : VERSION,
                hidden : isSidePanel,
                renderer : renderVersionOption
            }
        ],
        defaults : {
            sortable : true
        }
    });
}

function getHistoryPanel() {
    var historyDataStore = new Ext.data.Store({
        id: 'HistoryDataStore',
        proxy: new Ext.ux.data.PagingMemoryProxy(historyDataArray),
        reader: new Ext.data.ArrayReader({}, [
            {
                name : 'date'
            },
            {
                name : 'keyword'
            },
            {
                name : 'queryType'
            },
            {
                name : 'searchTargetType'
            },
            {
                name : 'searchOption'
            },
            {
                name : 'useInfModel'
            },
            {
                name : 'URI'
            },
            {
                name : 'version'
            }
        ]),
        remoteSort: true,
        sortInfo : {
            field : 'date',
            direction : "DESC"
        }
    });
    var historyDataCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});
    var historyDataColumnModel = getHistoryDataColumnModel(false, historyDataCheckboxSelectionModel);

    /**
     * Convenience function for creating Toolbar Buttons that are tied to sorters
     * @param {Object} config Optional config object
     * @return {Ext.Button} The new Button object
     */
    function createSorterButton(config) {
        config = config || {};

        Ext.applyIf(config, {
            listeners: {
                click: function(button, e) {
                    changeSortDirection(button, true);
                }
            },
            iconCls: 'sort-' + config.sortData.direction.toLowerCase(),
            reorderable: true
        });

        return new Ext.Button(config);
    }

    /**
     * Callback handler used when a sorter button is clicked or reordered
     * @param {Ext.Button} button The button that was clicked
     * @param {Boolean} changeDirection True to change direction (default). Set to false for reorder
     * operations as we wish to preserve ordering there
     */
    function changeSortDirection(button, changeDirection) {
        var sortData = button.sortData,
                iconCls = button.iconCls;

        if (sortData != undefined) {
            if (changeDirection !== false) {
                button.sortData.direction = button.sortData.direction.toggle("ASC", "DESC");
                button.setIconClass(iconCls.toggle("sort-asc", "sort-desc"));
            }

            historyDataStore.clearFilter();
            doSort();
        }
    }

    /**
     * Tells the store to sort itself according to our sort data
     */
    function doSort() {
        historyDataStore.sort(getSorters(), "ASC");
    }

    /**
     * Returns an array of sortData from the sorter buttons
     * @return {Array} Ordered sort data from each of the sorter buttons
     */
    function getSorters() {
        var sorters = [];

        Ext.each(tbar.findByType('button'), function(button) {
            sorters.push(button.sortData);
        }, this);

        return sorters;
    }

    var droppable = new Ext.ux.ToolbarDroppable({
        /**
         * Creates the new toolbar item from the drop event
         */
        createItem: function(data) {
            var column = this.getColumnFromDragDrop(data);

            return createSorterButton({
                text    : column.header,
                sortData: {
                    field: column.dataIndex,
                    direction: "ASC"
                }
            });
        },

        /**
         * Custom canDrop implementation which returns true if a column can be added to the toolbar
         * @param {Object} data Arbitrary data from the drag source
         * @return {Boolean} True if the drop is allowed
         */
        canDrop: function(dragSource, event, data) {
            var sorters = getSorters(),
                    column = this.getColumnFromDragDrop(data);

            for (var i = 0; i < sorters.length; i++) {
                if (sorters[i].field == column.dataIndex) return false;
            }

            return true;
        },

        afterLayout: doSort,

        /**
         * Helper function used to find the column that was dragged
         * @param {Object} data Arbitrary data from
         */
        getColumnFromDragDrop: function(data) {
            var index = data.header.cellIndex,
                    colModel = historyPanel.colModel,
                    column = colModel.getColumnById(colModel.getColumnId(index));

            return column;
        }
    });

    var reorderer = new Ext.ux.ToolbarReorderer();
    var tbar = new Ext.Toolbar({
        items  : [SORTING_ORDER + ':', '-'],
        plugins: [reorderer, droppable],
        listeners: {
            scope    : this,
            reordered: function(button) {
                changeSortDirection(button, false);
            }
        }
    });

    tbar.add(createSorterButton({
        text: DATE_AND_HOUR,
        sortData: {
            field: 'date',
            direction: 'DESC'
        }
    }));

    tbar.add(createSorterButton({
        text: KEYWORD,
        sortData: {
            field: 'keyword',
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: SEARCH_OPTION,
        sortData: {
            field: 'searchOption',
            direction: 'ASC'
        }
    }));


    var bbar = new Ext.PagingToolbar({
        store: historyDataStore,
        pageSize : HISTORY_PAGE_SIZE,
        displayInfo : true,
        displayMsg : "{2} " + "件中" + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    historyDataStore.load({params:{start:0, limit:HISTORY_PAGE_SIZE}});
    var historyPanel = new Ext.grid.GridPanel({
        id : 'HistoryPanel',
        stateId : 'history_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : historyDataStore,
        colModel : historyDataColumnModel,
        title : SEARCH_HISTORY,
        stripeRows : true,
        frame : true,
        autoExpandColumn : 'uri_id',
        sm : historyDataCheckboxSelectionModel,
        iconCls: 'icon-time',
        tbar: tbar,
        bbar: bbar,
        listeners : {
            celldblclick : function() {
                openHistoryAndBookmarkData(historyDataCheckboxSelectionModel.getSelected());
            },
            cellcontextmenu : showHistoryContextMenu,
            scope: this,
            render: function() {
                //here we tell the toolbar's droppable plugin that it can accept items from the columns' dragdrop group
                var dragProxy = historyPanel.getView().columnDrag,
                        ddGroup = dragProxy.ddGroup;
                droppable.addDDGroup(ddGroup);
            }
        },
        items : [
            {
                region : "north",
                xtype : 'toolbar',
                items : [
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-time_go',
                        text : OPEN_SELECTED_HISTORY,
                        handler : function() {
                            openHistoryAndBookmarkData(historyDataCheckboxSelectionModel.getSelected());
                        }
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-book_add',
                        text : ADD_SELECTED_HISTORIES_TO_BOOKMARK,
                        handler : addSelectedHistoriesToBookmark
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-time_delete',
                        text : REMOVE_SELECTED_HISTORIES,
                        handler : removeSelectedHistories
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-time_delete',
                        text : REMOVE_ALL_HISTORY,
                        handler : removeAllHistoryData
                    }
                ]
            }
        ]
    });
    return historyPanel;
}

function getSideHistoryPanel() {
    var historyDataStore = Ext.getCmp('HistoryPanel').store;
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var sideHistoryDataColumnModel = getHistoryDataColumnModel(true, historyDataCheckboxSelectionModel);
    var bbar = new Ext.PagingToolbar({
        store: historyDataStore,
        pageSize : HISTORY_PAGE_SIZE,
        plugins : [new Ext.ux.SlidingPager()]
    });
    return new Ext.grid.GridPanel({
        id : 'SideHistoryPanel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : historyDataStore,
        colModel : sideHistoryDataColumnModel,
        title : SEARCH_HISTORY,
        stripeRows : true,
        frame : true,
        autoExpandColumn : 'keyword_id',
        sm : historyDataCheckboxSelectionModel,
        iconCls: 'icon-time',
        bbar: bbar,
        listeners : {
            cellclick : function() {
                openHistoryAndBookmarkData(historyDataCheckboxSelectionModel.getSelected());
            },
            cellcontextmenu : showHistoryContextMenu
        }
    });
}

function showHistoryContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    historyDataCheckboxSelectionModel.selectRow(rowIndex);
    var record = historyDataCheckboxSelectionModel.getSelected();
    var queryType = record.get("queryType");
    switch (queryType) {
        case QTYPE_CLASS:
            makeHistoryClassContextMenu(record).showAt(e.getXY());
            break;
        case QTYPE_PROPERTY:
            makeHistoryPropertyContextMenu(record).showAt(e.getXY());
            break;
        case QTYPE_INSTANCE:
            makeHistoryInstanceContextMenu(record).showAt(e.getXY());
            break;
    }
}

function makeHistoryClassContextMenu(record) {
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var record = historyDataCheckboxSelectionModel.getSelected();
    var keyword = record.get('keyword');
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-time_go',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    queryType = record.get('queryType');
                    selectResourceTypeRadioButton();
                    useInfModel = record.get('useInfModel');
                    Ext.getDom('use_inf_model').checked = useInfModel;
                    searchOptionSelection.setValue(record.get('searchOption'));
                    searchWikipediaOntologyByContextMenu(currentkeyword + " " + keyword);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                    addBookmark();
                }
            },
            {
                text : getRemoveKeywordFromHistoryLabel(keyword),
                iconCls: 'icon-time_delete',
                handler : removeSelectedHistories
            }
        ]
    });
}

function makeHistoryPropertyContextMenu(record) {
    return makeHistoryInstanceAndPropertyContextMenu(record);
}

function makeHistoryInstanceContextMenu(record) {
    return makeHistoryInstanceAndPropertyContextMenu(record);
}

function makeHistoryInstanceAndPropertyContextMenu(record) {
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var record = historyDataCheckboxSelectionModel.getSelected();
    var keyword = record.get('keyword');

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-time_go',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                    addBookmark();
                }
            },
            {
                text : getRemoveKeywordFromHistoryLabel(keyword),
                iconCls: 'icon-time_delete',
                handler : removeSelectedHistories
            }
        ]
    });
}