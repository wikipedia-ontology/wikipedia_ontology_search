/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */
function resetSearchOptionList() {
    var resType = CLASS;
    if (Ext.getCmp("class_button").checked) {
        resType = CLASS;
    } else if (Ext.getCmp("property_button").checked) {
        resType = PROPERTY;
    } else if (Ext.getCmp("instance_button").checked) {
        resType = INSTANCE;
    }
    var searchTargetType = URI;
    if (Ext.getCmp("uri_radio_button").checked) {
        searchTargetType = URI;
    } else if (Ext.getCmp("label_radio_button").checked) {
        searchTargetType = LABEL;
    }
    alert(Ext.getCmp("class_button").checked);
    alert(Ext.getCmp("property_button").checked);
    alert(Ext.getCmp("instance_button").checked);
    alert(resType);
    alert(searchTargetType);
    var searchOptionList = getSearchOptionList(resType, searchTargetType);
    Ext.getCmp("Resource_Search_Option").store.loadData(searchOptionList);
    Ext.getCmp("Resource_Search_Option").setValue(EXACT_MATCH);
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
                width : 250
            },
            {
                xtype : 'button',
                iconCls: 'icon-search',
                text : SEARCH,
                name : 'search-button',
                // searchWikipediaOntology function is defined in SearchAction.js
                handler : searchWikipediaOntology
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
            change: resetSearchOptionList
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
                handler : setUseInfModel
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
            change: resetSearchOptionList
        }
    });

    function setUseInfModel() {
        useInfModel = Ext.getDom('use_inf_model').checked;
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