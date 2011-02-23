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
    console.log("class list data URL");
    console.log(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.CLASS_LIST_DATA_URL);
    return new Ext.data.Store({
        id : 'ClassListTableDataStore',
        reader : reader,
        proxy : getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.CLASS_LIST_DATA_URL),
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
        pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.RESOURCE_LIST_SIZE_LIMIT,
        store : classListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class + " {0} - {1} を表示",
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
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class,
                dataIndex : "class",
                renderer : renderClassLink,
                sortable : true
            },
            {
                header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfInstances,
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
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
    makeClassContextMenu(keyword).showAt(e.getXY());
}

function renderClassLink(clsName) {
    return  "<img alt='" + clsName + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "class_icon_s.png'/> " +
            '<a href="' + clsName + '" onclick="loadClassInstanceData(\'' + clsName + '\'); return false;">' + clsName + "</a>";
}

function loadClassInstanceDataByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL)[1]);
    loadClassInstanceData(keyword);
}

function loadClassInstanceData(clsName) {
    var instanceListPanel = Ext.getCmp("ClassInstanceListTablePanel");
    instanceListPanel.store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.CLASS_LIST_DATA_URL + "?class=" + clsName);
    loadStore(instanceListPanel.store);

    var propertiesOfDomainClassListTablePanel = Ext.getCmp("PropertiesOfDomainClassListTablePanel");
    propertiesOfDomainClassListTablePanel.store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.BASE_SERVER_CLASS_DATA_URL +
            clsName + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION + "?search_option="
            + WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_domain_class);
    loadStore(propertiesOfDomainClassListTablePanel.store);

    var propertiesOfRangeClassListTablePanel = Ext.getCmp("PropertiesOfRangeClassListTablePanel");
    propertiesOfRangeClassListTablePanel.store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.BASE_SERVER_CLASS_DATA_URL +
            clsName + WIKIPEDIA_ONTOLOGY_SEARCH.constants.JSON_EXTENSION + "?search_option="
            + WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.properties_of_range_class);
    loadStore(propertiesOfRangeClassListTablePanel.store);
}
