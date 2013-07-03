/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getInstanceTypeListTableDataStore() {
    var reader = new Ext.data.JsonReader({
        root : "instance_type_list",
        totalProperty : 'numberOfTypes',
        fields : [
            {
                name : "type",
                type : "string"
            }
        ]
    });
    var panelName = "InstanceTypeListTablePanel";
    return new Ext.data.Store({
        reader : reader,
        proxy : getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.INSTANCE_LIST_DATA_URL),
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

function getInstanceTypeListPanel() {
    var instanceTypeListTableDataStore = getInstanceTypeListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.RESOURCE_LIST_SIZE_LIMIT,
        store : instanceTypeListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : 'InstanceTypeListTablePanel',
        stateId : 'instance_type_list_table_panel_state_id',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : instanceTypeListTableDataStore,
        columns : [
            {
                header : WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.types_of_instance,
                dataIndex : "type",
                id : "instance_type_list_table_type_column",
                renderer : openType,
                sortable : true
            }
        ],
        autoExpandColumn : "instance_type_list_table_type_column",
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : openTypeByCellClick,
            cellcontextmenu : showTypeContextMenu
        }
    });
}

function showTypeContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Class;
    makeClassContextMenu(keyword).showAt(e.getXY());
}

function openTypeByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    openWikiOntRDFData("wikiont_class:" + keyword);
}

function openType(typeName) {
    return "<img alt='" + typeName + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "class_icon_s.png'/> " +
            '<a href="' + typeName + '" onclick="openWikiOntRDFData(\'wikiont_class:' + typeName + '\'); return false;">' + typeName + "</a>";
}
