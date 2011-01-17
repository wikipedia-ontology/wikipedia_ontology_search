/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getClassListTableDataStore() {
    return  new Ext.data.JsonReader({
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
}

function getClassListPanel() {

    var classListTableDataStore = getClassListTableDataStore();

    var pagingToolBar = new Ext.PagingToolbar({
        id : 'ClassListPagingToolBar',
        pageSize : 100,
        store : classListTableDataStore,
        displayInfo : true,
        displayMsg : "{2} " + CLASS + " {0} - {1} を表示",
        plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
//        listeners : {
//            beforechange : function() {
//                isRenderTree = false;
//            }
//        }
    });

    return new Ext.grid.GridPanel({
        id : 'ClassListTablePanel',
        stateId : 'class_list_table_panel',
        stateful : true,
        stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
        store : classListTableDataStore,
        columns : [
            {
                header : CLASS,
                dataIndex : "class",
                id : "class_id",
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
        autoExpandColumn : 'class_id',
        bbar : pagingToolBar,
        stripeRows : true,
        listeners : {
            //            cellclick : openWikiOntJSONData,
            //            cellcontextmenu : showStatementTablePanelContextMenu
        }
    });
}

