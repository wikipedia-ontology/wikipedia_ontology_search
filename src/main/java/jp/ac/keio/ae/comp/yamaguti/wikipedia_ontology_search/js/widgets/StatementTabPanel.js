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
        title : STATEMENT,
        iconCls: 'icon-table',
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
    return statementTabPanel;
}

function addTab() {
    statementTabPanel.add(getStatementTablePanel(NEW_TAB, tabIndex++)).show();
}