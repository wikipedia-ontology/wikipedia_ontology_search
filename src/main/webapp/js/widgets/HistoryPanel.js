/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var historyDataArray = [];
if (localStorage.history != undefined) {
    historyDataArray = getDataFromWebStorage(localStorage.history);
}

function addHistoryData(queryURI) {
    var params = extractParametersFromURI(queryURI);
    var record = [
        new Date().toLocaleString(),
        params[RESOURCE_NAME_PARAMETER_KEY],
        params[RESOURCE_TYPE_PARAMETER_KEY],
        params[SEARCH_TARGET_PARAMETER_KEY],
        params[SEARCH_OPTION_PARAMETER_KEY],
        params[INFERNCE_TYPE_PARAMETER_KEY],
        params[URI_PARAMETER_KEY],
        params[VERSION_PARAMETER_KEY]
    ];
    historyDataArray.push(record);
    saveHistoryDataToWebStorage();
}

function removeAllHistoryData() {
    historyDataArray = [];
    saveHistoryDataToWebStorage();
}

function removeSelectedHistories() {
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
    saveHistoryDataToWebStorage();
}

function addSelectedHistoriesToBookmark() {
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var records = historyDataCheckboxSelectionModel.getSelections();
    for (var i = 0; i < records.length; i++) {
        bookmarkArray.push([
            new Date().toLocaleString(),
            records[i].get(RESOURCE_NAME_PARAMETER_KEY),
            records[i].get(RESOURCE_TYPE_PARAMETER_KEY),
            records[i].get(SEARCH_TARGET_PARAMETER_KEY),
            records[i].get(SEARCH_OPTION_PARAMETER_KEY),
            records[i].get(INFERNCE_TYPE_PARAMETER_KEY),
            records[i].get(URI_PARAMETER_KEY),
            records[i].get(VERSION_PARAMETER_KEY)]);
    }
    saveBookmarksToWebStorage();
}

function getHistoryDataColumnModel(isSidePanel, historyDataCheckboxSelectionModel) {
    return new Ext.grid.ColumnModel({
        columns : [historyDataCheckboxSelectionModel,
            {
                id : 'date_id',
                dataIndex : DATE_PARAMETER_KEY,
                header : DATE_AND_HOUR,
                hidden : isSidePanel,
                width : 150
            },
            {
                id : 'resource_name_id',
                dataIndex : RESOURCE_NAME_PARAMETER_KEY,
                header : KEYWORD,
                renderer : renderKeyword,
                width : 200
            },
            {
                id : 'resource_type_id',
                dataIndex : RESOURCE_TYPE_PARAMETER_KEY,
                header : RESOURCE_TYPE,
                hidden : isSidePanel,
                renderer : renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : SEARCH_TARGET_PARAMETER_KEY,
                header : SEARCH_TARGET,
                hidden : isSidePanel,
                renderer : renderSearchTargetType,
                width : 100
            },
            {
                id : 'search_option_id',
                dataIndex : SEARCH_OPTION_PARAMETER_KEY,
                header : SEARCH_OPTION,
                hidden : isSidePanel,
                renderer : renderSearchOption,
                width : 100
            },
            {
                id : 'inference_type_id',
                dataIndex : INFERNCE_TYPE_PARAMETER_KEY,
                header : USE_INFERENCE_MODEL,
                hidden : isSidePanel,
                renderer : renderInferenceType,
                width : 100
            },
            {
                id : 'uri_id',
                dataIndex : URI_PARAMETER_KEY,
                header : URI,
                hidden : isSidePanel
            },
            {
                id : 'version_id',
                dataIndex : VERSION_PARAMETER_KEY,
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
                name : DATE_PARAMETER_KEY
            },
            {
                name : RESOURCE_NAME_PARAMETER_KEY
            },
            {
                name : RESOURCE_TYPE_PARAMETER_KEY
            },
            {
                name : SEARCH_TARGET_PARAMETER_KEY
            },
            {
                name : SEARCH_OPTION_PARAMETER_KEY
            },
            {
                name : INFERNCE_TYPE_PARAMETER_KEY
            },
            {
                name : URI_PARAMETER_KEY
            },
            {
                name : VERSION_PARAMETER_KEY
            }
        ]),
        remoteSort: true,
        sortInfo : {
            field : DATE_PARAMETER_KEY,
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
            field: DATE_PARAMETER_KEY,
            direction: 'DESC'
        }
    }));

    tbar.add(createSorterButton({
        text: KEYWORD,
        sortData: {
            field: RESOURCE_NAME_PARAMETER_KEY,
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: SEARCH_OPTION,
        sortData: {
            field: SEARCH_OPTION_PARAMETER_KEY,
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
        //        title : SEARCH_HISTORY,
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
        stripeRows : true,
        autoExpandColumn : 'resource_name_id',
        sm : historyDataCheckboxSelectionModel,
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
    var resourceType = record.get(RESOURCE_TYPE_PARAMETER_KEY);
    switch (resourceType) {
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
    var keyword = record.get(RESOURCE_NAME_PARAMETER_KEY);
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
                    queryType = record.get(RESOURCE_TYPE_PARAMETER_KEY);
                    selectResourceTypeRadioButton();
                    inferenceType = record.get(INFERNCE_TYPE_PARAMETER_KEY);
                    Ext.getDom('use_inf_model').checked = useInfModel;
                    searchOptionSelection.setValue(record.get(SEARCH_OPTION_PARAMETER_KEY));
                    searchStatementsByContextMenu(currentkeyword + " " + keyword);
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
    var keyword = record.get(RESOURCE_NAME_PARAMETER_KEY);

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