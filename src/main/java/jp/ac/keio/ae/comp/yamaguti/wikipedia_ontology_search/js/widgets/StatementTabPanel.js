var statementTabPanel;
var tabIndex = 0;
function getStatementTabPanel() {
    statementTabPanel = new Ext.TabPanel({
        activeTab : 0,
        frame : true,
        defaults: {autoScroll:true},
        enableTabScroll: true,
        title : STATEMENT,
        items :[
            {
                title:  ADD_TAB,
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