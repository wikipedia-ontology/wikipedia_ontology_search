/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */
function getStatementTableDataStore() {

    return new Ext.data.GroupingStore({
        id : 'StatementTableDataStore' + tabIndex,
        reader : getStatementJsonReader(),
        proxy : getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.constants.NULL_DATA),
        sortInfo : {
            field : 'subject',
            direction : "ASC"
        },
        groupField : 'subject',
        listeners : {
            beforeload : function() {
                statementTabPanel.getActiveTab().body.mask(LOADING, "loading-indicator");
            },
            load : function() {
                statementTabPanel.getActiveTab().body.unmask();
            }
        }
    });
}

function getStatementTablePanel(title, tabIndex) {
    var groupingStatementTableView = new Ext.grid.GroupingView({
        enableGrouping : false,
        forceFit : true,
        startCollapsed : start_collapsed_group,
        groupTextTpl : '{text} ({[values.rs.length]} {[values.rs.length > 1 ?  STATEMENT  :  STATEMENT ]})'
    });
    var statementTableDataStore = getStatementTableDataStore();

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

            statementTableDataStore.clearFilter();
            doSort();
        }
    }

    /**
     * Tells the store to sort itself according to our sort data
     */
    function doSort() {
        statementTableDataStore.sort(getSorters(), "ASC");
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
                    colModel = statementTablePanel.colModel,
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
        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.subject,
        sortData: {
            field: 'subject',
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.predicate,
        sortData: {
            field: 'predicate',
            direction: 'ASC'
        }
    }));

    tbar.add(createSorterButton({
        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.object,
        sortData: {
            field: 'object',
            direction: 'ASC'
        }
    }));

    var pagingToolBar = new Ext.PagingToolbar({
        id : 'PagingToolBar' + tabIndex,
        pageSize : 100,
        store : statementTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + WIKIPEDIA_ONTOLOGY_SEARCH.resources.statement + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()],
        listeners : {
            beforechange : function() {
                isRenderTree = false;
            }
        }
    });

    var statementTablePanel = new Ext.grid.GridPanel({
        id : 'StatementTablePanel' + tabIndex,
        stateId : 'statement_table_panel' + tabIndex,
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : statementTableDataStore,
        columns : [
            {
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.subject,
                dataIndex : "subject",
                id : "subject_id",
                renderer : renderLink,
                sortable : true
            },
            {
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.predicate,
                id : "predicate_id",
                sortable : true,
                dataIndex : "predicate",
                renderer : renderLink,
                sortable : true
            },
            {
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.object,
                sortable : true,
                dataIndex : "object",
                id : "object",
                renderer : renderLink,
                sortable : true
            }
        ],
        tbar: tbar,
        bbar : pagingToolBar,
        view : groupingStatementTableView,
        autoExpandColumn : 'object',
        stripeRows : true,
        listeners : {
            scope: this,
            cellclick : openWikiOntJSONData,
            cellcontextmenu : showStatementTablePanelContextMenu,
            render: function() {
                //here we tell the toolbar's droppable plugin that it can accept items from the columns' dragdrop group
                var dragProxy = statementTablePanel.getView().columnDrag,
                        ddGroup = dragProxy.ddGroup;
                droppable.addDDGroup(ddGroup);
            }
        }
    });

    return new Ext.Panel({
        id : 'StatementPanel' + tabIndex,
        title : title,
        iconCls: 'icon-tab',
        layout: 'border',
        closable: true,
        items: [
            {
                region: 'north',
                height: 40,
                items: getURIPanel('StatementTabURIField' + tabIndex)
            },
            {
                region: 'center',
                layout: 'fit',
                items: statementTablePanel
            }
        ],
        listeners: {
            'activate' : function(tabPanel, tab) {
                var uri = getCurrentStatementTabURI();
                var searchParams = extractParametersFromURI(uri);
                setSearchParams(searchParams);
            }
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
        var queryURL = url.replace("wikiont_class:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.CLASS_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURL.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = decodeURI(keyword);
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
        makeClassContextMenu(keyword).showAt(e.getXY());
    } else if (url.indexOf("wikiont_property") != -1) {
        var queryURL = url.replace("wikiont_property:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.PROPERTY_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURL.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = decodeURI(keyword);
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
        makePropertyContextMenu(keyword).showAt(e.getXY());
    } else if (url.indexOf("wikiont_instance") != -1) {
        var queryURL = url.replace("wikiont_instance:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.INSTANCE_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURL.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = decodeURI(keyword);
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
        makeInstanceContextMenu(keyword).showAt(e.getXY());
    }
}

function reloadStatementTable(queryURI) {
    var tabId = statementTabPanel.getActiveTab().id.split("StatementPanel")[1];
    var statementTablePanel = Ext.getCmp("StatementTablePanel" + tabId);
    var statementURIField = Ext.getCmp("StatementTabURIField" + tabId);
    statementURIField.setValue(queryURI.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, ""));
    setURIField("StatementURIField", queryURI);
    var statementTableDataStore = statementTablePanel.store;
    var numberOfStatementsSelection = Ext.getCmp('numberOfStatementsSelection');
    var pagingToolBar = statementTablePanel.bbar;
    console.log(queryURI);
    statementTableDataStore.proxy = getProxy(queryURI);
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

function renderLink(value) {
    var newValue = "";
    if (value.indexOf("wikiont_class") != -1) {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "class_icon_s.png'/> ";
    } else if (value.indexOf("wikiont_property") != -1) {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "property_icon_s.png'/> ";
    } else if (value.indexOf("wikiont_instance") != -1) {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "instance_icon_s.png'/> ";
    } else if (value.indexOf("wikipedia.org") != -1) {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "wikipedia_icon_s.png'/> ";
    } else if (value.indexOf("dbpedia.org") != -1) {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "dbpedia_icon_s.png'/> ";
    }
    if (value.indexOf(":") != -1) {
        newValue += '<a href="' + value + '" onclick="openWikiOntRDFData(\'' + value + '\'); return false;">' + value + "</a>";
        return newValue;
    } else {
        newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "label_icon_s.png'/> " + value;
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
        var localName = values[1];
        searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
        switch (prefix) {
            case "wikiont_class":
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
                var queryURI = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_CLASS_DATA_URL +
                        localName + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION;
                reloadStatements(queryURI, localName);
                break;
            case "wikiont_property":
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
                var queryURI = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_PROPERTY_DATA_URL +
                        localName + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION;
                reloadStatements(queryURI, localName);
                break;
            case "wikiont_instance":
                queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
                var queryURI = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_INSTANCE_DATA_URL +
                        localName + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION;
                reloadStatements(queryURI, localName);
                break;
        }
        resetSearchOptionList(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    } else {
        window.open(value);
    }
}

function openWikiOntJSONData(grid, rowIndex, columnIndex, e) {
    searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
    var url = e.getTarget().getAttribute("alt");
    if (url == null) {
        url = e.getTarget().children.item(1).toString();
    }
    url = decodeURI(url) + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION;
    Ext.getDom('uri_radio_button').checked = true;
    if (url.indexOf("wikiont_class") != -1) {
        var queryURI = url.replace("wikiont_class:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.CLASS_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURI.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = keyword.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
        reloadStatements(queryURI, keyword);
    } else if (url.indexOf("wikiont_property") != -1) {
        var queryURI = url.replace("wikiont_property:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.PROPERTY_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURI.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = keyword.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
        reloadStatements(queryURI, keyword);
    } else if (url.indexOf("wikiont_instance") != -1) {
        var queryURI = url.replace("wikiont_instance:", WIKIPEDIA_ONTOLOGY_SEARCH.constants.INSTANCE_PATH + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH);
        var keyword = queryURI.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH)[1];
        keyword = keyword.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
        reloadStatements(queryURI, keyword);
    }
    resetSearchOptionList(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
}