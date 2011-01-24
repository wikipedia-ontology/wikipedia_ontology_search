/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function setQueryType() {
    if (Ext.getCmp("class_button").checked) {
        queryType = QTYPE_CLASS;
    } else if (Ext.getCmp("property_button").checked) {
        queryType = QTYPE_PROPERTY;
    } else if (Ext.getCmp("instance_button").checked) {
        queryType = QTYPE_INSTANCE;
    }
    resetSearchOptionList();
    Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
}

function setSearchTargetType() {
    if (Ext.getCmp("uri_radio_button").checked) {
        searchTargetType = URI_SEARCH_TARGET_OPTION;
    } else if (Ext.getCmp("label_radio_button").checked) {
        searchTargetType = LABEL_SEARCH_TARGET_OPTION;
    }
    resetSearchOptionList();
    Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
}

function resetSearchOptionList() {
    var searchOptionList = getSearchOptionList();
    Ext.getCmp("Resource_Search_Option").store.loadData(searchOptionList);
    Ext.getCmp("Resource_Search_Option").setValue(EXACT_MATCH_SEARCH_OPTION);
}

function getSearchPanel() {
    var searchOptionSelection = getSearchOptionComboBox('Resource_Search_Option');
    var numberOfStatementsSelection = getNumberOfStatementsSelectionPanel();
    numberOfStatementsSelection.setValue("100");
    var versionOptionSelection = getVersionOptionComboBox('Version_Option');
    var searchField = {
        border : false,
        fieldLabel : KEYWORD,
        xtype: 'compositefield',
        items : [
            {
                xtype : 'textfield',
                name : 'keyword',
                width : 250,
                listeners: {
                    change: function() {
                        Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
                    }
                }
            },
            {
                xtype : 'button',
                iconCls: 'icon-search',
                text : SEARCH,
                name : 'search-button',
                // searchStatements function is defined in SearchAction.js
                handler : function() {
                    searchStatements("")
                }
            }
        ]
    };
    var searchOptionRadioGroup = new Ext.form.RadioGroup({
        width: 160,
        items:[
            {
                xtype: 'radio',
                checked : true,
                boxLabel : URI,
                name : 'search_target',
                id : 'uri_radio_button',
                width: 80
            },
            {
                xtype: 'radio',
                boxLabel : LABEL,
                name : 'search_target',
                id : 'label_radio_button',
                width: 80
            }
        ],
        listeners :{
            change: setSearchTargetType
        }
    });


    var searchOptionField = {
        border: false,
        fieldLabel: SEARCH_OPTION,
        xtype: 'compositefield',
        items: [
            searchOptionRadioGroup,
            searchOptionSelection,
            {
                width: 10
            },
            {
                xtype : 'checkbox',
                boxLabel : USE_INFERENCE_MODEL,
                id : 'use_inf_model',
                handler : setInferenceType
            }
        ]
    }

    var queryTypeRadioGroup = new Ext.form.RadioGroup({
        border : false,
        fieldLabel : SEARCH_TARGET,
        width: 240,
        items : [
            {
                xtype: 'radio',
                checked : true,
                boxLabel : CLASS,
                name : 'query-type',
                id : 'class_button'
            },
            {
                xtype: 'radio',
                boxLabel : PROPERTY,
                name : 'query-type',
                id : 'property_button'
            },
            {
                xtype: 'radio',
                boxLabel : INSTANCE,
                name : 'query-type',
                id : 'instance_button'
            }
        ],
        listeners:
        {
            change: setQueryType
        }
    });

    function setInferenceType() {
        if (Ext.getDom('use_inf_model').checked) {
            inferenceType = RDFS_INFERENCE_OPTION;
        } else {
            inferenceType = NONE_INFERENCE_OPTION;
        }
        Ext.getCmp("StatementURIField").setValue(getQueryURI(""));
    }

    return new Ext.FormPanel({
        id : "SearchPanel",
        frame : true,
        labelWidth : 130,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [searchField,  queryTypeRadioGroup,searchOptionField,
            {
                fieldLabel : NUMBER_OF_STATEMENTS,
                items : numberOfStatementsSelection
            }, {
                fieldLabel: VERSION,
                items: versionOptionSelection
            }]
    });
}