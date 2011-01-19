/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getSearchPanel() {
    var searchOptionSelection = getSearchOptionComboBox('Resource_Search_Option');
    var numberOfStatementsSelection = getNumberOfStatementsSelectionPanel();
    numberOfStatementsSelection.setValue("100");
    var versionOptionSelection = getVersionOptionComboBox('Version_Option');

    var searchField = {
        border : false,
        fieldLabel : KEYWORD,
        xtype: 'compositefield',
        items : [searchOptionSelection, {
            xtype : 'textfield',
            name : 'keyword',
            width : 250
        }, {
            xtype : 'button',
            iconCls: 'icon-search',
            text : SEARCH,
            name : 'search-button',
            // searchWikipediaOntology function is defined in SearchAction.js
            handler : searchWikipediaOntology
        }]
    };

    var queryTypeRadioButtons = {
        border : false,
        xtype: 'compositefield',
        fieldLabel : SEARCH_TARGET,
        items : [
            {
                xtype: 'radio',
                checked : true,
                boxLabel : CLASS,
                name : 'query-type',
                id : 'class_button',
                width: 80
            },
            {
                xtype: 'radio',
                boxLabel : PROPERTY,
                name : 'query-type',
                id : 'property_button',
                width: 80
            },
            {
                xtype: 'radio',
                boxLabel : INSTANCE,
                name : 'query-type',
                id : 'instance_button',
                width: 80
            },
            {
                width: 30
            },
            {
                xtype : 'checkbox',
                boxLabel : USE_INFERENCE_MODEL,
                id : 'use_inf_model',
                handler : setUseInfModel
            }
        ]
    };

    function setUseInfModel() {
        useInfModel = Ext.getDom('use_inf_model').checked;
    }

    return new Ext.FormPanel({
        id : "SearchPanel",
        frame : true,
        labelWidth : 120,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [searchField, queryTypeRadioButtons,
            {
                fieldLabel : NUMBER_OF_STATEMENTS,
                items : numberOfStatementsSelection
            }, {
                fieldLabel: VERSION,
                items: versionOptionSelection
            }]
    });
}