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
                    [NAME_ASC, NAME_ASC_OPTION],
                    [NAME_DESC, NAME_DESC_OPTION],
                    [INSTANCE_COUNT_ASC, INSTANCE_COUNT_ASC_OPTION],
                    [INSTANCE_COUNT_DESC, INSTANCE_COUNT_DESC_OPTION]
                ]
            });
        }

        function getInstanceSearchOptionList() {
            return new Ext.data.ArrayStore({
                fields : ["Search_Option", "Search_Option_Value"],
                data : [
                    [NAME_ASC, NAME_ASC_OPTION],
                    [NAME_DESC, NAME_DESC_OPTION],
                ]
            });
        }

        var searchOptionList = getClassAndInstanceSearchOptionList();
        if (type == INSTANCE) {
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
        if (type == INSTANCE) {
            comboBox.setValue(NAME_ASC);
        } else {
            comboBox.setValue(INSTANCE_COUNT_DESC_OPTION);
        }
        return comboBox;
    }

    function getResourceSearchOptionComboBox(type) {
        var searchOptionList = new Ext.data.ArrayStore({
            fields : ["Search_Option", "Search_Option_Value"],
            data : [
                [EXACT_MATCH, EXACT_MATCH_SEARCH_OPTION],
                [ANY_MATCH, ANY_MATCH_SEARCH_OPTION],
                [STARTS_WITH, STARTS_WITH_SEARCH_OPTION],
                [ENDS_WITH, ENDS_WITH_SEARCH_OPTION]
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
        comboBox.setValue(EXACT_MATCH_SEARCH_OPTION);
        return comboBox;
    }

    var searchOptionSelection = getResourceSearchOptionComboBox(type);
    var searchOrderOptionSelection = getResourceSearchOrderOptionComboBox(type);

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
                handler : function() {
                    var keyword = Ext.getCmp(type + "SearchPanel").getForm().findField('keyword').getValue();
                    var searchOption = searchOptionSelection.getValue();
                    var orderOption = searchOrderOptionSelection.getValue();
                    var paramsString = "?keyword=" + keyword;
                    paramsString += "&search_option=" + searchOption;
                    paramsString += "&order_by=" + orderOption;
                    var store = null;
                    switch (type) {
                        case CLASS:
                            store = Ext.getCmp("ClassListTablePanel").store;
                            store.proxy = getProxy(CLASS_LIST_DATA_URL + paramsString);
                            break;
                        case PROPERTY:
                            store = Ext.getCmp("PropertyListTablePanel").store;
                            store.proxy = getProxy(PROPERTY_LIST_DATA_URL + paramsString);
                            break;
                        case INSTANCE:
                            store = Ext.getCmp("InstanceListTablePanel").store;
                            store.proxy = getProxy(INSTANCE_LIST_DATA_URL + paramsString);
                            break;
                    }
                    store.load({
                        params : {
                            start : 0,
                            limit : RESOURCE_LIST_SIZE_LIMIT,
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
        fieldLabel: SEARCH_OPTION,
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

