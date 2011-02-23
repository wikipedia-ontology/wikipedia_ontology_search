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
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class:
            panelName = "ClassInstanceListTablePanel";
            dataURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.CLASS_LIST_DATA_URL;
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.property:
            panelName = "PropertyInstanceListTablePanel";
            dataURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.PROPERTY_LIST_DATA_URL;
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.instance:
            panelName = "InstanceListTablePanel";
            dataURL = WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.INSTANCE_LIST_DATA_URL;
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
    var cellRenderer = openInstanceByLink;
    var cellClickListener = openInstanceByCellClick;
    switch (type) {
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class:
            panelIdLabel = "ClassInstance";
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.property:
            panelIdLabel = "PropertyInstance";
            break;
        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.instance:
            panelIdLabel = "Instance";
            cellRenderer = openInstanceTypeByLink;
            cellClickListener = openInstanceTypeByCellClick;
            break;
    }
    var instanceListTableDataStore = getInstanceListTableDataStore(type);

    var pagingToolBar = new Ext.PagingToolbar({
        pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.RESOURCE_LIST_SIZE_LIMIT,
        store : instanceListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + WIKIPEDIA_ONTOLOGY_SEARCH.resources.instance + " {0} - {1} を表示",
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
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.instance,
                dataIndex : "instance",
                id : panelIdLabel + "list_table_instance_column",
                renderer : cellRenderer,
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
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.instance;
    makeInstanceContextMenu(keyword).showAt(e.getXY());
}

function openInstanceTypeByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var instanceName = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    openInstanceType(instanceName);
}

function openInstanceByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    openWikiOntRDFData("wikiont_instance:" + keyword);
}

function openInstanceType(instanceName) {
    var instanceTypeListPanel = Ext.getCmp("InstanceTypeListTablePanel");
    instanceTypeListPanel.store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.INSTANCE_LIST_DATA_URL + "?instance=" + instanceName);
    loadStore(instanceTypeListPanel.store);
}

function openInstanceTypeByLink(instanceName) {
    return "<img alt='" + instanceName + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "instance_icon_s.png'/> " +
            '<a href="' + instanceName + '" onclick="openInstanceType(\'' + instanceName + '\'); return false;">' + instanceName + "</a>";
}

function openInstanceByLink(instanceName) {
    return "<img alt='" + instanceName + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "instance_icon_s.png'/> " +
            '<a href="' + instanceName + '" onclick="openWikiOntRDFData(\'wikiont_instance:' + instanceName + '\'); return false;">' + instanceName + "</a>";
}

