/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var statementTabPanel;
var tabIndex = 0;
var activatePanel;
function getStatementTabPanel() {
    statementTabPanel = new Ext.TabPanel({
        activeTab : 0,
        frame : true,
        defaults: {autoScroll:true},
        enableTabScroll: true,
        items :[
            {
                title:  "　",
                iconCls: 'icon-newtab',
                listeners: {
                    'activate': function(tabPanel, tab) {
                        addTab();
                    }
                }
            }
        ],
        plugins:  new Ext.ux.TabCloseMenu()
    });

    var westSidePanel = new Ext.Panel({
        layout : 'vbox',
        items : [
            {
                title : BOOKMARK,
                iconCls: 'icon-book',
                layout : 'fit',
                flex: 1,
                items : getSideBookmarkPanel()
            },
            {
                title : SEARCH_HISTORY,
                iconCls: 'icon-time',
                layout : 'fit',
                flex: 1,
                items : getSideHistoryPanel()
            }
        ]
    });

    var centerPanel = new Ext.Panel({
        layout : 'border',
        hideBorders : true,
        items : [
            {
                region : 'north',
                layout : 'fit',
                title: SEARCH,
                iconCls: 'icon-search',
                height: 180,
                animate: true,
                collapsible : true,
                split: true,
                items: getStatementSearchPanel()
            },
            {
                region : 'center',
                layout : 'fit',
                collapsible : false,
                items : statementTabPanel
            }
        ]
    });

    return new Ext.Panel({
        layout : 'border',
        hideBorders : true,
        //        title : STATEMENT,
        iconCls: 'icon-table',
        items : [
            {
                region: 'north',
                height: 40,
                items: getURIPanel('StatementURIField')
            },
            {
                region : 'center',
                layout : 'fit',
                collapsible : false,
                items : centerPanel
            },
            {
                title : BOOKMARK_AND_SEARCH_HISTORY,
                region : 'west',
                layout : 'fit',
                width : 300,
                minWidth : 300,
                split : true,
                animate : true,
                collapsible : true,
                items : westSidePanel
            }
        ]
    });
}

function addTab() {
    statementTabPanel.add(getStatementTablePanel(NEW_TAB, tabIndex++)).show();
}