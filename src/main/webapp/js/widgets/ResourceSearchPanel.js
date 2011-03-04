/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getResourceSearchPanel(type) {

    function getResourceSearchOrderOptionComboBox(id) {
        function getClassAndInstanceSearchOptionList() {
            return new Ext.data.ArrayStore({
                fields : ["Search_Option", "Search_Option_Value"],
                data : [
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.name_asc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.name_asc],
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.name_desc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.name_desc],
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.instance_count_asc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.instance_count_asc],
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.instance_count_desc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.instance_count_desc]
                ]
            });
        }

        function getInstanceSearchOptionList() {
            return new Ext.data.ArrayStore({
                fields : ["Search_Option", "Search_Option_Value"],
                data : [
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.name_asc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.name_asc],
                    [WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels.name_desc, WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.name_desc]
                ]
            });
        }

        var searchOptionList = getClassAndInstanceSearchOptionList();
        if (type === WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance) {
            searchOptionList = getInstanceSearchOptionList();
        }

        var comboBox = new Ext.form.ComboBox({
            id : id,
            displayField : 'Search_Option',
            valueField : 'Search_Option_Value',
            triggerAction : "all",
            width : 180,
            editable : false,
            mode : "local",
            store : searchOptionList
        });
        if (type === WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance) {
            comboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.name_asc);
        } else {
            comboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions.instance_count_desc);
        }
        return comboBox;
    }

    function getResourceSearchOptionComboBox(type) {
        var searchOptionList = new Ext.data.ArrayStore({
            fields : ["Search_Option", "Search_Option_Value"],
            data : [
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.exact_match,
                    WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.any_match,
                    WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.any_match],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.starts_with,
                    WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.starts_with],
                [WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.ends_with,
                    WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.ends_with]
            ]
        });

        var comboBox = new Ext.form.ComboBox({
            id : type + '_Search_Option',
            displayField : 'Search_Option',
            valueField : 'Search_Option_Value',
            triggerAction : "all",
            width : 180,
            editable : false,
            mode : "local",
            store : searchOptionList
        });
        comboBox.setValue(WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions.exact_match);
        return comboBox;
    }

    var searchOptionSelection = getResourceSearchOptionComboBox(type);
    var searchOrderOptionSelection = getResourceSearchOrderOptionComboBox(type);

    var searchField = {
        border : false,
        fieldLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.keyword,
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
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.search,
                name : 'search-button',
                handler : function() {
                    var keyword = Ext.getCmp(type + "SearchPanel").getForm().findField('keyword').getValue();
                    var searchOption = searchOptionSelection.getValue();
                    var orderOption = searchOrderOptionSelection.getValue();
                    var paramsString = "?keyword=" + keyword;
                    paramsString += "&search_option=" + searchOption;
                    paramsString += "&order_by=" + orderOption;
                    var store = null;
                    switch (type) {
                        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Class:
                            store = Ext.getCmp("ClassListTablePanel").store;
                            store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.CLASS_LIST_DATA_URL + paramsString);
                            break;
                        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Property:
                            store = Ext.getCmp("PropertyListTablePanel").store;
                            store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.PROPERTY_LIST_DATA_URL + paramsString);
                            break;
                        case WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.Instance:
                            store = Ext.getCmp("InstanceListTablePanel").store;
                            store.proxy = getProxy(WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl.INSTANCE_LIST_DATA_URL + paramsString);
                            break;
                    }
                    store.load({
                        params : {
                            start : 0,
                            limit : WIKIPEDIA_ONTOLOGY_SEARCH.constants.RESOURCE_LIST_SIZE_LIMIT,
                            search_option: searchOption,
                            order_by: orderOption,
                            keyword: keyword
                        }
                    });
                }
            }
        ]
    };

    var searchOptionField = {
        border: false,
        fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels.search_option,
        xtype: 'compositefield',
        items: searchOptionSelection
    }

    return new Ext.FormPanel({
        id : type + "SearchPanel",
        frame : true,
        labelWidth : 130,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [searchField,  searchOptionField, searchOrderOptionSelection]
    });
}

