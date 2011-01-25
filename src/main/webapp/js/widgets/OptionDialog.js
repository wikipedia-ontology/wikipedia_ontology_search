/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getOptionPanel() {
    return new Ext.FormPanel({
        frame : true,
        labelWidth : 200,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [
            {
                fieldLabel : ABOUT_CLASS_HIERARCHY,
                items : [
                    {
                        id : 'show_isa_tree',
                        stateId : 'show_isa_tree_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : SHOW_CLASS_HIERARCHY,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            show_isa_tree = state.checked;
                            this.setValue(state.checked);
                        },
                        handler : applyNewOptionState
                    },
                    {
                        id : 'expand_all_class',
                        stateId : 'expand_all_class_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : EXPAND_ALL_CLASS_HIERARCHY,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            expand_all_class = state.checked;
                            this.setValue(state.checked);
                        },
                        handler : applyNewOptionState
                    }
                ]
            },
            {
                fieldLabel : ABOUT_STATEMENT_TABLE,
                items : [
                    {
                        id : 'start_collapsed_group',
                        stateId : 'start_collapsed_group_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : CLOSE_GROUPING_STATEMENTS,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            start_collapsed_group = state.checked;
                            this.setValue(state.checked);
                        },
                        handler : applyNewOptionState
                    }
                ]
            }
        ]
    });
}

function applyOptionState() {
    var tabId = statementTabPanel.getActiveTab().id.split("StatementPanel")[1];
    var statementTablePanel = Ext.getCmp("StatementTablePanel" + tabId);
    var groupingStatementTableView = statementTablePanel.view;

    if (!show_isa_tree) {
        var classTreePanel = Ext.getCmp('classTreePanel');
        classTreePanel.loader.dataUrl = NULL_TREE_DATA;
        classTreePanel.loader.load(classTreePanel.getRootNode());
    }
    
    groupingStatementTableView.startCollapsed = start_collapsed_group;
    if (start_collapsed_group) {
        groupingStatementTableView.collapseAllGroups();
    } else {
        groupingStatementTableView.expandAllGroups();
    }
}

function setOptionChecks() {
    if (Ext.getDom('show_isa_tree') != null) {
        Ext.getDom('show_isa_tree').checked = show_isa_tree;
        Ext.getDom('expand_all_class').checked = expand_all_class;
        Ext.getDom('start_collapsed_group').checked = start_collapsed_group;
    }
}

function applyNewOptionState() {
    if (Ext.getDom('show_isa_tree') != null) {
        show_isa_tree = Ext.getDom('show_isa_tree').checked;
        expand_all_class = Ext.getDom('expand_all_class').checked;
        start_collapsed_group = Ext.getDom('start_collapsed_group').checked;
        applyOptionState();
    }
}