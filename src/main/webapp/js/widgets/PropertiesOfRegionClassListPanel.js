/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getPropertiesOfRegionClassListTableDataStore(type) {
    var panelName = "";
    if (type == DOMAIN) {
        panelName = "PropertiesOfDomainClassListTablePanel";
    } else if (type == RANGE) {
        panelName = "PropertiesOfRangeClassListTablePanel";
    }
    return new Ext.data.Store({
        reader : getStatementJsonReader(),
        proxy : getProxy(BASE_SERVER_CLASS_DATA_URL),
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

function getPropertiesOfRegionClassListPanel(type) {
    var panelIdLabel = "";
    var headerLabel = "";
    if (type == DOMAIN) {
        panelIdLabel = "PropertiesOfDomainClass";
        headerLabel = WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_domain_class;
    } else if (type == RANGE) {
        panelIdLabel = "PropertiesOfRangeClass";
        headerLabel = WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.properties_of_range_class;
    }
    var propertiesOfRegionClassListTableDataStore = getPropertiesOfRegionClassListTableDataStore(type);

    var pagingToolBar = new Ext.PagingToolbar({
        pageSize : RESOURCE_LIST_SIZE_LIMIT,
        store : propertiesOfRegionClassListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + PROPERTY + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
    });

    return new Ext.grid.GridPanel({
        id : panelIdLabel + 'ListTablePanel',
        stateId : panelIdLabel + '_list_table_panel_state_id',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : propertiesOfRegionClassListTableDataStore,
        columns : [
            {
                header : headerLabel,
                dataIndex : "subject",
                id : panelIdLabel + "list_table_property_column",
                renderer : renderProperty,
                sortable : true
            }
        ],
        autoExpandColumn : panelIdLabel + "list_table_property_column",
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            cellclick : openPropertyByCellClick,
            cellcontextmenu : showPropertyContextMenu
        }
    });
}

function showPropertyContextMenu(grid, rowIndex, cellIndex, e) {
    e.stopEvent();
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.property;
    makePropertyContextMenu(keyword).showAt(e.getXY());
}

function openPropertyByCellClick(grid, rowIndex, columnIndex, e) {
    var uri = e.getTarget().children.item(1).toString();
    var keyword = decodeURI(uri.split(BASE_SERVER_URL)[1]);
    openWikiOntRDFData("wikiont_property:" + keyword);
}

function renderProperty(qname) {
    var propertyName = qname.split("wikiont_property:")[1];
    return "<img alt='" + propertyName + "' src='" + BASE_ICON_URL + "property_icon_s.png'/> " +
            '<a href="' + propertyName + '" onclick="openWikiOntRDFData(\'' + qname + '\'); return false;">' + propertyName + "</a>";
}

