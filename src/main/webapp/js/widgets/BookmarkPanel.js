/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var bookmarkArray = [];
if (localStorage.bookmark != undefined) {
    bookmarkArray = getDataFromWebStorage(localStorage.bookmark);
}

function getBookmarkColumnModel(isSidePanel, bookmarkCheckboxSelectionModel) {
    return new Ext.grid.ColumnModel({
        columns : [bookmarkCheckboxSelectionModel,
            {
                id : 'date_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
                header : DATE_AND_HOUR,
                hidden : true,
                renderer: Ext.util.Format.dateRenderer('Y/m/d H:i:s'),
                width : 150
            },
            {
                id : 'resource_name_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name,
                header : KEYWORD,
                renderer : renderKeyword,
                width : 200
            },
            {
                id : 'resource_type_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type,
                header : RESOURCE_TYPE,
                hidden : true,
                renderer: renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target,
                header : SEARCH_TARGET,
                hidden : isSidePanel,
                renderer: renderSearchTargetType,
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
                header : USE_INFERENCE_MODEL,
                hidden : isSidePanel,
                renderer : renderInferenceType,
                width : 100
            },
            {
                id : 'uri_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri,
                header : URI,
                hidden : isSidePanel
            },
            {
                id : 'version_id',
                dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version,
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

var bookmarkStore = new Ext.data.Store({
    id: 'BookmarkStore',
    proxy: new Ext.ux.data.PagingMemoryProxy(bookmarkArray),
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
        field : WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name,
        direction : "ASC"
    }
});
bookmarkStore.load({params:{start:0, limit:BOOKMARK_PAGE_SIZE}});

var bookmarkCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});

function getBookmarkPanel() {
    getBookmarkImportAndExportDialog(); // new BookmarkImportAndExportDialog
    var bookmarkColumnModel = getBookmarkColumnModel(false, bookmarkCheckboxSelectionModel);

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

            bookmarkStore.clearFilter();
            doSort();
        }
    }

    /**
     * Tells the store to sort itself according to our sort data
     */
    function doSort() {
        bookmarkStore.sort(getSorters(), "ASC");
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
                    colModel = bookmarkPanel.colModel,
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
        text: KEYWORD,
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

    tbar.add(createSorterButton({
        text: DATE_AND_HOUR,
        sortData: {
            field: WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date,
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: VERSION,
        sortData: {
            field: WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version,
            direction: 'ASC'
        }
    }));

    var bbar = new Ext.PagingToolbar({
        store: bookmarkStore,
        pageSize : BOOKMARK_PAGE_SIZE,
        displayInfo : true,
        displayMsg : "{2} " + "件中" + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    var bookmarkPanel = new Ext.grid.GridPanel({
        id : 'BookmarkPanel',
        stateId : 'bookmark_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : bookmarkStore,
        colModel : bookmarkColumnModel,
        //        title : BOOKMARK,
        stripeRows : true,
        frame : true,
        autoExpandColumn : 'uri_id',
        sm : bookmarkCheckboxSelectionModel,
        iconCls: 'icon-book',
        listeners : {
            celldblclick : function() {
                openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel.getSelected());
            },
            cellcontextmenu : showBookmarkContextMenu,
            scope: this,
            render: function() {
                //here we tell the toolbar's droppable plugin that it can accept items from the columns' dragdrop group
                var dragProxy = bookmarkPanel.getView().columnDrag,
                        ddGroup = dragProxy.ddGroup;
                droppable.addDDGroup(ddGroup);
            }
        },
        tbar: tbar,
        bbar: bbar,
        items : [
            {
                region : "north",
                xtype : 'toolbar',
                items : [
                    {
                        xtype : 'button',
                        iconCls: 'icon-book_open',
                        text : OPEN_SELECTED_BOOKMARK,
                        handler : function() {
                            openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel.getSelected());
                        }
                    },
                    '-',
                    {
                        xtype : 'button',
                        iconCls: 'icon-book_delete',
                        text : REMOVE_SELECTED_BOOKMARKS,
                        handler : removeSelectedBookmarks
                    },
                    '-',
                    {
                        xtype : 'button',
                        iconCls: 'icon-import',
                        text : IMPORT,
                        handler : showBookmarkImportDialog
                    },
                    '-',
                    {
                        xtype : 'button',
                        iconCls: 'icon-export',
                        text : EXPORT,
                        handler : showBookmarkExportDialog
                    }
                ]
            }
        ]
    });
    return bookmarkPanel;
}

function getSideBookmarkPanel() {
    var sideBookmarkColumnModel = getBookmarkColumnModel(true, bookmarkCheckboxSelectionModel);
    var bbar = new Ext.PagingToolbar({
        store: bookmarkStore,
        pageSize : BOOKMARK_PAGE_SIZE,
        plugins : [new Ext.ux.SlidingPager()]
    });

    return new Ext.grid.GridPanel({
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : bookmarkStore,
        colModel : sideBookmarkColumnModel,
        sm : bookmarkCheckboxSelectionModel,
        stripeRows : true,
        autoExpandColumn : 'resource_name_id',
        bbar: bbar,
        listeners : {
            cellclick : function() {
                openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel.getSelected());
            },
            cellcontextmenu : showBookmarkContextMenu
        }
    });
}

function addBookmark(params) {
    var record = [
        new Date().toLocaleString(),
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri],
        params[WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version]];
    bookmarkArray.push(record);
    saveBookmarksToWebStorage();
}

function removeSelectedBookmarks() {
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    var selectedRecords = bookmarkCheckboxSelectionModel.getSelections();
    var newBookmarkDataArray = [];
    for (var h = 0; h < bookmarkArray.length; h++) {
        var isDelete = false;
        for (var i = 0; i < selectedRecords.length; i++) {
            if (bookmarkArray[h][0] == selectedRecords[i].get('date')) {
                isDelete = true;
            }
        }
        if (!isDelete) {
            newBookmarkDataArray.push(bookmarkArray[h]);
        }
    }
    bookmarkArray = newBookmarkDataArray;
    saveBookmarksToWebStorage();
}

function showBookmarkContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    bookmarkCheckboxSelectionModel.selectRow(rowIndex);
    var record = bookmarkCheckboxSelectionModel.getSelected();
    var resourceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
    switch (resourceType) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class:
            makeBookmarkClassContextMenu(record).showAt(e.getXY());
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property:
            makeBookmarkPropertyContextMenu(record).showAt(e.getXY());
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance:
            makeBookmarkInstanceContextMenu(record).showAt(e.getXY());
            break;
    }
}

function makeBookmarkClassContextMenu(record) {
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    var record = bookmarkCheckboxSelectionModel.getSelected();
    var keyword = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name);

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-book_open',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : getNarrowDownKeywordLabel(keyword),
                iconCls: 'icon-search',
                handler : function() {
                    queryType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type);
                    selectResourceTypeRadioButton();
                    inferenceType = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type);
                    Ext.getDom('use_inf_model').setValue(useInfModel);
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue(record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option));
                    searchStatementsByContextMenu(currentkeyword + " " + keyword);
                }
            },
            {
                text : getRemoveKeywordFromBookmarkLabel(keyword),
                iconCls: 'icon-book_delete',
                handler : function() {
                    removeSelectedBookmarks();
                }
            }
        ]
    });
}

function makeBookmarkPropertyContextMenu() {
    return makeBookmarkInstanceAndPropertyContextMenu();
}

function makeBookmarkInstanceContextMenu() {
    return makeBookmarkInstanceAndPropertyContextMenu();
}

function makeBookmarkInstanceAndPropertyContextMenu() {
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    var record = bookmarkCheckboxSelectionModel.getSelected();
    var keyword = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name);

    return new Ext.menu.Menu({
        style : {
            overflow : 'visible'
        },
        items : [
            {
                text : getSearchKeywordLabel(keyword),
                iconCls: 'icon-book_open',
                handler : function() {
                    openHistoryAndBookmarkData(record);
                }
            },
            {
                text : getRemoveKeywordFromBookmarkLabel(keyword),
                iconCls: 'icon-book_delete',
                handler : removeSelectedBookmarks
            }
        ]
    });
}
