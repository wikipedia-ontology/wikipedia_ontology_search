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
                dataIndex : "date",
                header : DATE_AND_HOUR,
                hidden : true,
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
                hidden : true,
                renderer: renderResourceType,
                width : 100
            },
            {
                id : 'search_target_type_id',
                dataIndex : "searchTargetType",
                header : SEARCH_TARGET,
                hidden : isSidePanel,
                renderer: renderSearchTargetType,
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

function getBookmarkPanel() {
    var bookmarkStore = new Ext.data.Store({
        id: 'BookmarkStore',
        proxy: new Ext.ux.data.PagingMemoryProxy(bookmarkArray),
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
            field : 'keyword',
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

    tbar.add(createSorterButton({
        text: DATE_AND_HOUR,
        sortData: {
            field: 'date',
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: VERSION,
        sortData: {
            field: 'version',
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
        title : BOOKMARK,
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
                        iconCls: 'icon-book_add',
                        text : ADD_CURRENT_KEYWORD_TO_BOOKMARK,
                        handler : addBookmark
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
        title : BOOKMARK,
        stripeRows : true,
        frame : true,
        autoExpandColumn : 'keyword_id',
        iconCls: 'icon-book',
        bbar: bbar,
        listeners : {
            cellclick : function() {
                openHistoryAndBookmarkData(bookmarkCheckboxSelectionModel.getSelected());
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
    var versionOptionSelection = Ext.getCmp('Version_Option');
    var versionOption = versionOptionSelection.getValue();
    var record = [new Date().toLocaleString(), keyword, queryType, searchTargetType, searchOption, useInfModel, currentURI, versionOption];
    bookmarkArray.push(record);
    saveBookmarksToWebStorage(bookmarkStore);
}

function removeSelectedBookmarks() {
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
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
    saveBookmarksToWebStorage(bookmarkStore);
}

function showBookmarkContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var bookmarkCheckboxSelectionModel = Ext.getCmp('BookmarkPanel').getSelectionModel();
    bookmarkCheckboxSelectionModel.selectRow(rowIndex);
    var record = bookmarkCheckboxSelectionModel.getSelected();
    var queryType = record.get("queryType");
    switch (queryType) {
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
    var keyword = record.get('keyword');

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
                    queryType = record.get('queryType');
                    selectResourceTypeRadioButton();
                    useInfModel = record.get('useInfModel');
                    Ext.getDom('use_inf_model').checked = useInfModel;
                    var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
                    searchOptionSelection.setValue(record.get('searchOption'));
                    searchWikipediaOntologyByContextMenu(currentkeyword + " " + keyword);
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
    var keyword = record.get('keyword');

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