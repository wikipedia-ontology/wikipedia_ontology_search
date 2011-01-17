/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getPropertyListTableDataStore() {
    return  new Ext.data.JsonReader({
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
}

function getPropertyListPanel() {

    var propertyListTableDataStore = getPropertyListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        id : 'PropertyListPagingToolBar',
        pageSize : 100,
        store : propertyListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + PROPERTY + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
        //        listeners : {
        //            beforechange : function() {
        //                isRenderTree = false;
        //            }
        //        }
    });

    return new Ext.grid.GridPanel({
        id : 'PropertyListTablePanel',
        stateId : 'property_list_table_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : propertyListTableDataStore,
        columns : [
            {
                header : PROPERTY,
                dataIndex : "property",
                id : "property_id",
                //                renderer : renderLink,
                sortable : true
            },
            {
                header : NUMBER_OF_INSTANCES,
                id : "number_of_instances_id",
                dataIndex : "count",
                //                renderer : renderLink,
                sortable : true
            }
        ],
        autoExpandColumn : 'property_id',
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            //            cellclick : openWikiOntJSONData,
            //            cellcontextmenu : showStatementTablePanelContextMenu
        }
    });
}

