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
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version]
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
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri),
            records[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version)]);
    }
    saveBookmarksToWebStorage();
}

function getHistoryDataColumnModel(isSidePanel, historyDataCheckboxSelectionModel) {
    return new Ext.grid.ColumnModel({
        columns : [historyDataCheckboxSelectionModel,
            {
                id : 'date_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.dateAndHour,
                hidden : isSidePanel,
                renderer: Ext.util.Format.dateRenderer('Y/m/d H:i:s'),
                width : 150
            },
            {
                id : 'resource_name_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.keyword,
                renderer : renderKeyword,
                width : 200
            },
            {
                id : 'resource_type_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.resourceType,
                hidden : isSidePanel,
                renderer : renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchTarget,
                hidden : isSidePanel,
                renderer : renderSearchTargetType,
                width : 100
            },
            {
                id : 'search_option_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.search_option,
                hidden : isSidePanel,
                renderer : renderSearchOption,
                width : 100
            },
            {
                id : 'inference_type_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.useInferenceModel,
                hidden : isSidePanel,
                renderer : renderInferenceType,
                width : 100
            },
            {
                id : 'uri_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.uri,
                hidden : isSidePanel
            },
            {
                id : 'version_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version,
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.version,
                hidden : isSidePanel,
                renderer : renderVersionOption
            }
        ],
        defaults : {
            sortable : true
        }
    });
}


var historyDataStore = new Ext.data.Store({
    id: 'HistoryDataStore',
    proxy: new Ext.ux.data.PagingMemoryProxy(historyDataArray),
    reader: new Ext.data.ArrayReader({}, [
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
            type: 'date'
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri
        },
        {
            name : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version
        }
    ]),
    remoteSort: true,
    sortInfo : {
        field : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
        direction : "DESC"
    }
});
historyDataStore.load({params:{start:0, limit:WIKIPEDIA_ONTOLOGY_SEARCH.constants.HISTORY_PAGE_SIZE}});
var historyDataCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});

function getHistoryPanel() {
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
        items  : [WIKIPEDIA_ONTOLOGY_SEARCH.resources.sortingOrder + ':', '-'],
        plugins: [reorderer, droppable],
        listeners: {
            scope    : this,
            reordered: function(button) {
                changeSortDirection(button, false);
            }
        }
    });

    tbar.add(createSorterButton({
        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.dateAndHour,
        sortData: {
            field: WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
            direction: 'DESC'
        }
    }));

    tbar.add(createSorterButton({
        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.keyword,
        sortData: {
            field: WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name,
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.search_option,
        sortData: {
            field: WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option,
            direction: 'ASC'
        }
    }));


    var bbar = new Ext.PagingToolbar({
        store: historyDataStore,
        pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.HISTORY_PAGE_SIZE,
        displayInfo : true,
        displayMsg : "{2} " + "件中" + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

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
                        text :WIKIPEDIA_ONTOLOGY_SEARCH.resources.openSelectedHistory,
                        handler : function() {
                            openHistoryAndBookmarkData(historyDataCheckboxSelectionModel.getSelected());
                        }
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-book_add',
                        text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.addSelectedHistoriesToBookmark,
                        handler : addSelectedHistoriesToBookmark
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-time_delete',
                        text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.removeSelectedHistories,
                        handler : removeSelectedHistories
                    },
                    '-',
                    {
                        xtype : 'tbbutton',
                        iconCls: 'icon-time_delete',
                        text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.removeAllHistory,
                        handler : removeAllHistoryData
                    }
                ]
            }
        ]
    });
    return historyPanel;
}

function getSideHistoryPanel() {
    var sideHistoryDataColumnModel = getHistoryDataColumnModel(true, historyDataCheckboxSelectionModel);
    var bbar = new Ext.PagingToolbar({
        store: historyDataStore,
        pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.HISTORY_PAGE_SIZE,
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
    var resourceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
    switch (resourceType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class:
            makeHistoryClassContextMenu(record).showAt(e.getXY());
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property:
            makeHistoryPropertyContextMenu(record).showAt(e.getXY());
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance:
            makeHistoryInstanceContextMenu(record).showAt(e.getXY());
            break;
    }
}

function makeHistoryClassContextMenu(record) {
    var historyDataCheckboxSelectionModel = Ext.getCmp('HistoryPanel').getSelectionModel();
    var record = historyDataCheckboxSelectionModel.getSelected();
    var keyword = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name);
    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getSearchKeywordLabel(keyword),
                iconCls: 'icon-time_go',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    queryType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
                    selectResourceTypeRadioButton();
                    inferenceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type);
                    Ext.getDom('use_inf_model').setValue(useInfModel);
                    searchOptionSelection.setValue(record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option));
                    searchStatementsByContextMenu(currentkeyword + " " + keyword);
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                    addBookmark();
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getRemoveKeywordFromHistoryLabel(keyword),
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
    var keyword = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name);

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getSearchKeywordLabel(keyword),
                iconCls: 'icon-time_go',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getAddKeywordToBookmarkLabel(keyword),
                iconCls: 'icon-book_add',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                    addBookmark();
                }
            },
            {
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.getRemoveKeywordFromHistoryLabel(keyword),
                iconCls: 'icon-time_delete',
                handler : removeSelectedHistories
            }
        ]
    });
}