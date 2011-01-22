/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getRegionClassesOfPropertyListTableDataStore(type) {
    var reader = new Ext.data.JsonReader({
        root : "statement",
        totalProperty : 'numberOfStatements',
        fields : [
            {
                name : "object",
                type : "string"
            }
        ]
    });
    var panelName = "";
    if (type == DOMAIN) {
        panelName = "DomainClassesOfPropertyListTablePanel";
    } else if (type == RANGE) {
        panelName = "RangeClassesOfPropertyListTablePanel";
    }
    return new Ext.data.Store({
        reader : reader,
        proxy : getProxy(BASE_SERVER_PROPERTY_TABLE_DATA_URL),
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

function getRegionClassesOfPropertyListPanel(type) {
    var panelIdLabel = "";
    var headerLabel = "";
    if (type == DOMAIN) {
        panelIdLabel = "DomainClassesOfProperty";
        headerLabel = DOMAIN_CLASSES_OF_PROPERTY;
    } else if (type == RANGE) {
        panelIdLabel = "RangeClassesOfProperty";
        headerLabel = RANGE_CLASSES_OF_PROPERTY;
    }
    var regionClassesOfPropertyListTableDataStore = getRegionClassesOfPropertyListTableDataStore(type);

    var pagingToolBar = new Ext.PagingToolbar({
        pageSize : RESOURCE_LIST_SIZE_LIMIT,
        store : regionClassesOfPropertyListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + PROPERTY + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : panelIdLabel + 'ListTablePanel',
        stateId : panelIdLabel + '_list_table_panel_state_id',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : regionClassesOfPropertyListTableDataStore,
        columns : [
            {
                header : headerLabel,
                dataIndex : "object",
                id : panelIdLabel + "list_table_property_column",
                renderer : renderClass,
                sortable : true
            }
        ],
        autoExpandColumn : panelIdLabel + "list_table_property_column",
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : openClassByCellClick,
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

function openClassByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    openWikiOntRDFData("wikiont_class:" + keyword);
}

function renderClass(qname) {
    var propertyName = qname.split("wikiont_class:")[1];
    return "<img alt='" + clsName + "' src='" + BASE_ICON_URL + "class_icon_s.png'/> " +
            '<a href="' + clsName + '" onclick="openWikiOntRDFData(\'' + qname + '\'); return false;">' + clsName + "</a>";
}