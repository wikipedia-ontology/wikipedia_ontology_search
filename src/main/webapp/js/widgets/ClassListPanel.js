/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getClassListTableDataStore() {
    var reader = new Ext.data.JsonReader({
        root : "class_list",
        totalProperty : 'numberOfClasses',
        fields : [
            {
                name : "class",
                type : "string"
            },
            {
                name : "count",
                type : "int"
            }
        ]
    });
    return new Ext.data.Store({
        id : 'ClassListTableDataStore',
        reader : reader,
        proxy : getProxy(CLASS_LIST_DATA_URL),
        listeners : {
            beforeload : function() {
                if (Ext.getCmp("ClassListTablePanel").body != undefined) {
                    Ext.getCmp("ClassListTablePanel").body.mask(LOADING, "loading-indicator");
                }
            },
            load : function() {
                if (Ext.getCmp("ClassListTablePanel").body != undefined) {
                    Ext.getCmp("ClassListTablePanel").body.unmask();
                }
            }
        }
    });
}

function getClassListPanel() {
    var classListTableDataStore = getClassListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        id : 'ClassListPagingToolBar',
        pageSize : RESOURCE_LIST_SIZE_LIMIT,
        store : classListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + CLASS + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : 'ClassListTablePanel',
        stateId : 'class_list_table_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : classListTableDataStore,
        columns : [
            {
                id: "class_list_table_class_column",
                header : CLASS,
                dataIndex : "class",
                renderer : renderClassLink,
                sortable : true
            },
            {
                header : NUMBER_OF_INSTANCES,
                id : "number_of_instances_id",
                dataIndex : "count",
                sortable : true
            }
        ],
        autoExpandColumn : 'class_list_table_class_column',
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : loadClassInstanceDataByCellClick,
            cellcontextmenu : showClassContextMenu
        }
    });

}

function showClassContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    queryType = QTYPE_CLASS;
    makeClassContextMenu(keyword).showAt(e.getXY());
}

function renderClassLink(clsName) {
    return  "<img alt='" + clsName + "' src='" + BASE_ICON_URL + "class_icon_s.png'/> " +
            '<a href="' + clsName + '" onclick="loadClassInstanceData(\'' + clsName + '\'); return false;">' + clsName + "</a>";
}

function loadClassInstanceDataByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    loadClassInstanceData(keyword);
}

function loadClassInstanceData(clsName) {
    var instanceListPanel = Ext.getCmp("ClassInstanceListTablePanel");
    instanceListPanel.store.proxy = getProxy(CLASS_LIST_DATA_URL + "?class=" + clsName);
    loadStore(instanceListPanel.store);

    var propertiesOfDomainClassListTablePanel = Ext.getCmp("PropertiesOfDomainClassListTablePanel");
    propertiesOfDomainClassListTablePanel.store.proxy = getProxy(BASE_SERVER_CLASS_TABLE_DATA_URL + clsName + "?search_option="
            + PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION);
    loadStore(propertiesOfDomainClassListTablePanel.store);

    var propertiesOfRangeClassListTablePanel = Ext.getCmp("PropertiesOfRangeClassListTablePanel");
    propertiesOfRangeClassListTablePanel.store.proxy = getProxy(BASE_SERVER_CLASS_TABLE_DATA_URL + clsName + "?search_option="
            + PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION);
    loadStore(propertiesOfRangeClassListTablePanel.store);
}
