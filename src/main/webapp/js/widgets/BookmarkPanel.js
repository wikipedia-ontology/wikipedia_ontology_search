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
                dataIndex : DATE_PARAMETER_KEY,
                header : DATE_AND_HOUR,
                hidden : true,
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
                hidden : true,
                renderer: renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : SEARCH_TARGET_PARAMETER_KEY,
                header : SEARCH_TARGET,
                hidden : isSidePanel,
                renderer: renderSearchTargetType,
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

function getBookmarkPanel() {
    var bookmarkStore = new Ext.data.Store({
        id: 'BookmarkStore',
        proxy: new Ext.ux.data.PagingMemoryProxy(bookmarkArray),
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
            field : RESOURCE_NAME_PARAMETER_KEY,
            direction : "ASC"
        }
    });

    var bookmarkCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});
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

    tbar.add(createSorterButton({
        text: DATE_AND_HOUR,
        sortData: {
            field: DATE_PARAMETER_KEY,
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: VERSION,
        sortData: {
            field: VERSION_PARAMETER_KEY,
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

    bookmarkStore.load({params:{start:0, limit:BOOKMARK_PAGE_SIZE}});
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
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
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
        params[RESOURCE_NAME_PARAMETER_KEY],
        params[RESOURCE_TYPE_PARAMETER_KEY],
        params[SEARCH_TARGET_PARAMETER_KEY],
        params[SEARCH_OPTION_PARAMETER_KEY],
        params[INFERNCE_TYPE_PARAMETER_KEY],
        params[URI_PARAMETER_KEY],
        params[VERSION_PARAMETER_KEY]];
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
    var resourceType = record.get(RESOURCE_TYPE_PARAMETER_KEY);
    switch (resourceType) {
        case QTYPE_CLASS:
            makeBookmarkClassContextMenu(record).showAt(e.getXY());
            break;
        case QTYPE_PROPERTY:
            makeBookmarkPropertyContextMenu(record).showAt(e.getXY());
            break;
        case QTYPE_INSTANCE:
            makeBookmarkInstanceContextMenu(record).showAt(e.getXY());
            break;
    }
}

function makeBookmarkClassContextMenu(record) {
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    var record = bookmarkCheckboxSelectionModel.getSelected();
    var keyword = record.get(RESOURCE_NAME_PARAMETER_KEY);

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
                    queryType = record.get(RESOURCE_TYPE_PARAMETER_KEY);
                    selectResourceTypeRadioButton();
                    inferenceType = record.get(INFERNCE_TYPE_PARAMETER_KEY);
                    Ext.getDom('use_inf_model').checked = useInfModel;
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue(record.get(SEARCH_OPTION_PARAMETER_KEY));
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
    var keyword = record.get(RESOURCE_NAME_PARAMETER_KEY);

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
