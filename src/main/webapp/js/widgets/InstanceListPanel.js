/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getInstanceListTableDataStore(type) {
    var reader = new Ext.data.JsonReader({
        root : "instance_list",
        totalProperty : 'numberOfInstances',
        fields : [
            {
                name : "instance",
                type : "string"
            }
        ]
    });
    var panelName = "";
    var dataURL = "";
    switch (type) {
        case CLASS:
            panelName = "ClassInstanceListTablePanel";
            dataURL = CLASS_LIST_DATA_URL;
            break;
        case PROPERTY:
            panelName = "PropertyInstanceListTablePanel";
            dataURL = PROPERTY_LIST_DATA_URL;
            break;
        case INSTANCE:
            panelName = "InstanceListTablePanel";
            dataURL = INSTANCE_LIST_DATA_URL;
            break;
    }
    return new Ext.data.Store({
        reader : reader,
        proxy : getProxy(dataURL),
        listeners : {
            beforeload : function() {
                if (Ext.getCmp(panelName).body != undefined) {
                    Ext.getCmp(panelName).body.mask(LOADING, "loading-indicator");
                }
            },
            load : function() {
                if (Ext.getCmp(panelName).body != undefined) {
                    Ext.getCmp(panelName).body.unmask();
                }
            }
        }
    });
}

function getInstanceListPanel(type) {
    var panelIdLabel = "";
    var cellClickListener = openInstanceByCellClick;
    switch (type) {
        case CLASS:
            panelIdLabel = "ClassInstance";
            break;
        case PROPERTY:
            panelIdLabel = "PropertyInstance";
            break;
        case INSTANCE:
            panelIdLabel = "Instance";
            cellClickListener = loadInstanceTypeByCellClick
            break;
    }
    var instanceListTableDataStore = getInstanceListTableDataStore(type);

    var pagingToolBar = new Ext.PagingToolbar({
        pageSize : RESOURCE_LIST_SIZE_LIMIT,
        store : instanceListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + INSTANCE + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : panelIdLabel + 'ListTablePanel',
        stateId : panelIdLabel + '_list_table_panel_state_id',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : instanceListTableDataStore,
        columns : [
            {
                header : INSTANCE,
                dataIndex : "instance",
                id : panelIdLabel + "list_table_instance_column",
                renderer : openInstance,
                sortable : true
            }
        ],
        autoExpandColumn : panelIdLabel + "list_table_instance_column",
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : cellClickListener,
            cellcontextmenu : showInstanceContextMenu
        }
    });
}

function showInstanceContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    queryType = QTYPE_INSTANCE;
    makeInstanceContextMenu(keyword).showAt(e.getXY());
}

function loadInstanceTypeByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var instanceName = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    var instanceTypeListPanel = Ext.getCmp("InstanceTypeListTablePanel");
    instanceTypeListPanel.store.proxy = getProxy(INSTANCE_LIST_DATA_URL + "?instance=" + instanceName);
    loadStore(instanceTypeListPanel.store);
}

function openInstanceByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    openWikiOntRDFData("wikiont_instance:" + keyword);
}

function openInstance(instanceName) {
    return "<img alt='" + instanceName + "' src='" + BASE_ICON_URL + "instance_icon_s.png'/> " +
            '<a href="' + instanceName + '" onclick="openWikiOntRDFData(\'wikiont_instance:' + instanceName + '\'); return false;">' + instanceName + "</a>";
}

