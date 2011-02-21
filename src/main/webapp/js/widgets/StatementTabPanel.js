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
        layout : 'border',
        items : [
            {
                region: 'north',
                title : BOOKMARK,
                iconCls: 'icon-book',
                layout : 'fit',
                split: true,
                height: 300,
                items : getSideBookmarkPanel()
            },
            {
                region: 'center',
                title : SEARCH_HISTORY,
                iconCls: 'icon-time',
                layout : 'fit',
                split: true,
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

    var uriPanel = new Ext.Panel({
        frame : true,
        height: 30,
        bodyStyle : 'padding: 10px;',
        layout: 'border',
        items : [
            {
                region: 'west',
                xtype: 'label',
                text: URI,
                width: 30
            },
            {
                id: 'StatementURIField',
                region: 'center',
                xtype: 'textfield',
                editable: false
            }
        ]
    });

    return new Ext.Panel({
        layout : 'border',
        hideBorders : true,
        iconCls: 'icon-table',
        items : [
            {
                region: 'north',
                height: 40,
                items: uriPanel
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
                width : 250,
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