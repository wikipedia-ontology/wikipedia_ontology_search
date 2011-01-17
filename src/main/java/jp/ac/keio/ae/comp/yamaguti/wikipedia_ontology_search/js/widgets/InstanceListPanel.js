/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getInstanceListTableDataStore() {
    return new Ext.data.JsonReader({
        root : "instance_list",
        totalProperty : 'numberOfInstances',
        fields : [
            {
                name : "instance",
                type : "string"
            }
        ]
    });
}

function getInstanceListPanel(type) {

    var instanceListTableDataStore = getInstanceListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        id : type + 'InstanceListPagingToolBar',
        pageSize : 100,
        store : instanceListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + INSTANCE + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
        //        listeners : {
        //            beforechange : function() {
        //                isRenderTree = false;
        //            }
        //        }
    });

    return new Ext.grid.GridPanel({
        id : type + 'InstanceListTablePanel',
        stateId : 'instance_list_table_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : instanceListTableDataStore,
        columns : [
            {
                header : INSTANCE,
                dataIndex : "instance",
                id : "instance_id",
                //                renderer : renderLink,
                sortable : true
            }
        ],
        autoExpandColumn : 'instance_id',
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            //            cellclick : openWikiOntJSONData,
            //            cellcontextmenu : showStatementTablePanelContextMenu
        }
    });
}

