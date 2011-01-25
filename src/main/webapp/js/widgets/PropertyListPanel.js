/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getPropertyListTableDataStore() {
    var reader = new Ext.data.JsonReader({
        root : "property_list",
        totalProperty : 'numberOfProperties',
        fields : [
            {
                name : "property",
                type : "string"
            },
            {
                name : "count",
                type : "int"
            }
        ]
    });
    return new Ext.data.Store({
        id : 'PropertyListTableDataStore',
        reader : reader,
        proxy : getProxy(PROPERTY_LIST_DATA_URL),
        listeners : {
            beforeload : function() {
                if (Ext.getCmp("PropertyListTablePanel").body != undefined) {
                    Ext.getCmp("PropertyListTablePanel").body.mask(LOADING, "loading-indicator");
                }
            },
            load : function() {
                if (Ext.getCmp("PropertyListTablePanel").body != undefined) {
                    Ext.getCmp("PropertyListTablePanel").body.unmask();
                }
            }
        }
    });
}

function getPropertyListPanel() {
    var propertyListTableDataStore = getPropertyListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        id : 'PropertyListPagingToolBar',
        pageSize : RESOURCE_LIST_SIZE_LIMIT,
        store : propertyListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + PROPERTY + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : 'PropertyListTablePanel',
        stateId : 'property_list_table_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : propertyListTableDataStore,
        columns : [
            {
                id: "property_list_table_property_column",
                header : PROPERTY,
                dataIndex : "property",
                renderer : renderPropertyLink,
                sortable : true
            },
            {
                header : NUMBER_OF_INSTANCES,
                dataIndex : "count",
                sortable : true
            }
        ],
        autoExpandColumn : 'property_list_table_property_column',
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : loadPropertyInstanceDataByCellClick,
            cellcontextmenu : showPropertyContextMenu
        }
    });
}

function showPropertyContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    queryType = QTYPE_PROPERTY;
    makePropertyContextMenu(keyword).showAt(e.getXY());
}

function renderPropertyLink(propertyName) {
    return "<img alt='" + propertyName + "' src='" + BASE_ICON_URL + "property_icon_s.png'/> " +
            '<a href="' + propertyName + '" onclick="loadPropertyInstanceData(\'' + propertyName + '\'); return false;">' + propertyName + "</a>";
}

function loadPropertyInstanceDataByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    loadPropertyInstanceData(keyword);
}

function loadPropertyInstanceData(propertyName) {
    var extension = ".json";
    var instanceListPanel = Ext.getCmp("PropertyInstanceListTablePanel");
    instanceListPanel.store.proxy = getProxy(PROPERTY_LIST_DATA_URL + "?property=" + propertyName);
    loadStore(instanceListPanel.store);

    var domainClassesOfPropertyListTablePanel = Ext.getCmp("DomainClassesOfPropertyListTablePanel");
    domainClassesOfPropertyListTablePanel.store.proxy = getProxy(BASE_SERVER_PROPERTY_DATA_URL + propertyName + extension + "?search_option="
            + DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION);
    loadStore(domainClassesOfPropertyListTablePanel.store);

    var rangeClassesOfPropertyListTablePanel = Ext.getCmp("RangeClassesOfPropertyListTablePanel");
    rangeClassesOfPropertyListTablePanel.store.proxy = getProxy(BASE_SERVER_PROPERTY_DATA_URL + propertyName + extension + "?search_option="
            + RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION);
    loadStore(rangeClassesOfPropertyListTablePanel.store);

}

