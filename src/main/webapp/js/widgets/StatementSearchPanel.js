/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function setQueryType() {
    if (Ext.getCmp("class_button").checked) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Class;
    } else if (Ext.getCmp("property_button").checked) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Property;
    } else if (Ext.getCmp("instance_button").checked) {
        queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.Instance;
    }
    resetSearchOptionList(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    setURIField("StatementURIField", getQueryURI(""));
}

function setSearchTargetType() {
    if (Ext.getCmp("uri_radio_button").checked) {
        searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;
    } else if (Ext.getCmp("label_radio_button").checked) {
        searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.label;
    }
    resetSearchOptionList(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
    setURIField("StatementURIField", getQueryURI(""));
}

function resetSearchOptionList(searchOption) {
    var searchOptionList = getSearchOptionList();
    Ext.getCmp("Resource_Search_Option").store.loadData(searchOptionList);
    Ext.getCmp("Resource_Search_Option").setValue(searchOption);
}

function getStatementSearchPanel() {
    var searchOptionSelection = getSearchOptionComboBox('Resource_Search_Option');
    var numberOfStatementsSelection = getNumberOfStatementsSelectionPanel();
    numberOfStatementsSelection.setValue("100");
    var versionOptionSelection = getVersionOptionComboBox('Version_Option');
    var searchField = {
        border : false,
        fieldLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.keyword,
        xtype: 'compositefield',
        items : [
            {
                xtype : 'trigger',
                name : 'keyword',
                width : 250,
                triggerClass: 'x-form-search-trigger',
                onTriggerClick: function() {
                    searchStatements("")
                },
                listeners: {
                    change: function() {
                        setURIField("StatementURIField", getQueryURI(""));
                    }
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
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.uri,
                name : 'search_target',
                id : 'uri_radio_button',
                width: 80
            },
            {
                xtype: 'radio',
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptionLabels.label,
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
        fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.search_option,
        xtype: 'compositefield',
        items: [
            searchOptionRadioGroup,
            searchOptionSelection,
            {
                width: 10
            },
            {
                xtype : 'checkbox',
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.useInferenceModel,
                id : 'use_inf_model',
                handler : setInferenceType
            }
        ]
    };

    var queryTypeRadioGroup = new Ext.form.RadioGroup({
        border : false,
        fieldLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchTarget,
        width: 300,
        items : [
            {
                xtype: 'radio',
                checked : true,
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Class,
                name : 'query-type',
                id : 'class_button'
            },
            {
                xtype: 'radio',
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Property,
                name : 'query-type',
                id : 'property_button'
            },
            {
                xtype: 'radio',
                boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance,
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
            inferenceType = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.rdfs;
        } else {
            inferenceType = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.none;
        }
        setURIField("StatementURIField", getQueryURI(""));
    }

    return new Ext.FormPanel({
        id : "SearchPanel",
        frame : true,
        labelWidth : 130,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [searchField,  queryTypeRadioGroup,searchOptionField,
            {
                fieldLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.numberOfStatements,
                items : numberOfStatementsSelection
            }, {
                fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.resources.version,
                items: versionOptionSelection
            }]
    });
}