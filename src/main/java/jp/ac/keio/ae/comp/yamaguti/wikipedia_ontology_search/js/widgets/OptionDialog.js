/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getOptionDialog() {
    var optionPanel = getOptionPanel();
    return new Ext.Window({
        id : 'OptionDialog',
        title : OPTION,
        iconCls: 'icon-option',
        width : 600,
        height : 220,
        autoScroll : true,
        modal : true,
        items : optionPanel,
        buttons : [
            {
                xtype : 'button',
                text : CLOSE,
                handler : function() {
                    Ext.getCmp("OptionDialog").setVisible(false);
                }
            }
        ],
        listeners : {
            show : function() {
                setOptionChecks();
            }
        }
    });
}

function showOptionDialog() {
    Ext.getCmp('OptionDialog').show();
}

function getOptionPanel() {
    return new Ext.FormPanel({
        frame : true,
        labelWidth : 200,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [
            {
                fieldLabel : ABOUT_CLASS_HIEARCHY_AND_INSTANCE,
                items : [
                    {
                        id : 'show_isa_tree_and_instance',
                        stateId : 'show_isa_tree_and_instance_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : SHOW_CLASS_HIERARCHY_AND_INSTANCES,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            show_isa_tree_and_instance = state.checked;
                            this.setValue(state.checked);
                        },
                        handler : applyNewOptionState
                    },
                    {
                        id : 'expand_all_class_and_instance',
                        stateId : 'expand_all_class_and_instance_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : EXPAND_ALL_CLASS_HIEARCHY_AND_INSTANCES,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            expand_all_class_and_instance = state.checked;
                            this.setValue(state.checked);
                        },
                        handler : applyNewOptionState
                    }
                ]
            },
            {
                fieldLabel : ABOUT_RDF_XML,
                items : [
                    {
                        id : 'show_rdf_xml',
                        stateId : 'show_rdf_xml_state',
                        statefule : true,
                        stateEvents : ['check'],
                        xtype : 'checkbox',
                        boxLabel : SHOW_RDF_XML,
                        getState : function() {
                            return {
                                checked : this.getValue()
                            }
                        },
                        applyState : function(state) {
                            show_rdf_xml = state.checked;
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
    var classAndInstanceTreePanel = Ext.getCmp('classAndInstanceTreePanel');
    //    var groupingStatementTableView = Ext.getCmp('StatementTablePanel').view;
    var groupingStatementTableView = statementTabPanel.getActiveTab().view;

    if (!show_isa_tree_and_instance) {
        classAndInstanceTreePanel.loader.dataUrl = NULL_TREE_DATA;
        classAndInstanceTreePanel.loader.load(classAndInstanceTreePanel.getRootNode());
    }
    if (!show_rdf_xml) {
        var xml_source = Ext.getDom("xml_source");
        if (xml_source != null) {
            xml_source.innerHTML = "";
        }
    }
    groupingStatementTableView.startCollapsed = start_collapsed_group;
    if (start_collapsed_group) {
        groupingStatementTableView.collapseAllGroups();
    } else {
        groupingStatementTableView.expandAllGroups();
    }
}

function setOptionChecks() {
    if (Ext.getDom('show_isa_tree_and_instance') != null) {
        Ext.getDom('show_isa_tree_and_instance').checked = show_isa_tree_and_instance;
        Ext.getDom('expand_all_class_and_instance').checked = expand_all_class_and_instance;
        Ext.getDom('show_rdf_xml').checked = show_rdf_xml;
        Ext.getDom('start_collapsed_group').checked = start_collapsed_group;
    }
}

function applyNewOptionState() {
    if (Ext.getDom('show_isa_tree_and_instance') != null) {
        show_isa_tree_and_instance = Ext.getDom('show_isa_tree_and_instance').checked;
        expand_all_class_and_instance = Ext.getDom('expand_all_class_and_instance').checked;
        show_rdf_xml = Ext.getDom('show_rdf_xml').checked;
        start_collapsed_group = Ext.getDom('start_collapsed_group').checked;
        applyOptionState();
    }
}