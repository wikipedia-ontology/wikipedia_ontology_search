/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */


var WIKIPEDIA_ONTOLOGY_SEARCH = WIKIPEDIA_ONTOLOGY_SEARCH || {};

WIKIPEDIA_ONTOLOGY_SEARCH.SPARQLPanel = Ext.extend(Ext.Panel, {
    width: 800,
    height: 600,
    layout: 'border',
    initComponent: function() {

        var sparqlResultsArray = [];
        var registeredSparqlQueryArray = [];
        if (localStorage.registeredSparqlQueryArray != undefined) {
            registeredSparqlQueryArray = getDataFromWebStorage(localStorage.registeredSparqlQueryArray);
        }


        var versionOptionList = new Ext.data.ArrayStore({
            fields : ["Version_Option", "Version_Option_Value"],
            data : [
                ["2010_11_14", "2010_11_14"],
                ["2010_02_09", "2010_02_09"]
            ]
        });

        var versionComboBox = new Ext.form.ComboBox({
            id : "sparql_version_combobox_id",
            displayField : 'Version_Option',
            valueField : 'Version_Option_Value',
            triggerAction : "all",
            width : 100,
            editable : false,
            mode : "local",
            store : versionOptionList
        });
        versionComboBox.setValue('2010_11_14');

        var getSPARQLColumnModel = function(columns) {
            return new Ext.grid.ColumnModel({
                columns : columns,
                defaults : {
                    sortable : true
                }
            });
        };

        var registeredSparqlQueryCheckboxSelectionModel = new Ext.grid.CheckboxSelectionModel({});

        var registeredSparqlQueryColumnModel = new Ext.grid.ColumnModel({
            columns : [
                registeredSparqlQueryCheckboxSelectionModel,
                {
                    id : 'registered_date_id',
                    dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour,
                    header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour,
                    renderer: Ext.util.Format.dateRenderer('Y/m/d H:i:s'),
                    width : 150
                },
                {
                    id : 'update_date_id',
                    dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.resources.updateDateAndHour,
                    header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.updateDateAndHour,
                    renderer: Ext.util.Format.dateRenderer('Y/m/d H:i:s'),
                    width : 150
                },
                {
                    id : 'sparql_query_description_id',
                    dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQueryDescription,
                    header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQueryDescription,
                    width : 300
                },
                {
                    id : 'sparql_query_id',
                    dataIndex : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQuery,
                    header : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQuery,
                    hidden: true,
                    width : 300
                }
            ]
            ,
            defaults
                    :
            {
                sortable : true
            }
        });

        var getSPARQLResultsStore = function(recordTypes) {
            return new Ext.data.Store({
                id: 'sparqlResultsStore',
                proxy: new Ext.ux.data.PagingMemoryProxy(sparqlResultsArray),
                reader: new Ext.data.ArrayReader({}, recordTypes),
                remoteSort: true,
                listeners : {
                    beforeload : function() {
                        // maskは検索時に行う
                    },
                    load : function() {
                        if (sparqlResultsPanel !== undefined && sparqlResultsPanel.body !== undefined) {
                            sparqlResultsPanel.body.unmask();
                            registeredSparqlQueryPanel.body.unmask();
                        }
                    }
                }
            });
        };

        var sparqlResultsStore = getSPARQLResultsStore([
            {}
        ]);


        var registeredSparqlQueryStore = new Ext.data.Store({
            id: 'registeredSparqlQueryStore',
            proxy: new Ext.ux.data.PagingMemoryProxy(registeredSparqlQueryArray),
            reader:new Ext.data.ArrayReader({}, [
                {
                    name : WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour,
                    type: "date"
                },
                {
                    name : WIKIPEDIA_ONTOLOGY_SEARCH.resources.updateDateAndHour,
                    type: "date"
                },
                {
                    name : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQueryDescription
                },
                {
                    name : WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQuery
                }
            ]),
            remoteSort: true
        });


        registeredSparqlQueryStore.load();

        var registeredSparqlQueryPanelTbar = {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    iconCls: 'icon-db_edit',
                    text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.update,
                    handler: function() {
                        updateSelectedSparqlQuery();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'icon-db_delete',
                    text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.remove,
                    handler: function() {
                        removeSelectedSparqlQueries();
                    }
                },
                {
                    xtype: 'button',
                    iconCls: 'icon-db_delete',
                    text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.removeAll,
                    handler: function() {
                        removeAllSparqlQuery();
                    }
                },
                {
                    width: 10
                },
                {
                    xtype: 'checkbox',
                    id: 'registered_sparql_query_checkbox',
                    boxLabel: "<span class='white_color'>" + WIKIPEDIA_ONTOLOGY_SEARCH.resources.query + "</span>",
                    width: 60
                },
                {
                    xtype: 'checkbox',
                    id: 'registered_sparql_query_description_checkbox',
                    boxLabel: "<span class='white_color'>" + WIKIPEDIA_ONTOLOGY_SEARCH.resources.description + "</span>",
                    width: 80
                },
                {
                    xtype: 'checkbox',
                    id: 'registered_sparql_query_checkbox',
                    boxLabel: "<span class='white_color'>" + WIKIPEDIA_ONTOLOGY_SEARCH.resources.query + "</span>",
                    width: 60
                },
                {
                    xtype: 'trigger',
                    id: 'registered_sparql_query_search_field',
                    width: 150,
                    triggerClass: 'x-form-search-trigger',
                    onTriggerClick: function() {
                        var searchField = Ext.getCmp("registered_sparql_query_search_field");
                        var queryCheckBox = Ext.getCmp("registered_sparql_query_checkbox");
                        var descriptionCheckBox = Ext.getCmp("registered_sparql_query_description_checkbox");
//                        console.log(searchField.getValue());
//                        console.log(descriptionCheckBox.checked);
//                        console.log(queryCheckBox.checked);
                        (function($) {
                            var filteredRegisteredSparqlQueryArray = $.grep(registeredSparqlQueryArray, function(value, index) {
                                var query = value[3];
                                var description = value[2];
//                                console.log(query);
//                                console.log(description);
                                if (queryCheckBox.checked && query.indexOf(searchField.getValue()) != -1) {
                                    return true;
                                }
                                if (descriptionCheckBox.checked && description.indexOf(searchField.getValue()) != -1) {
                                    return true;
                                }
                                return false;
                            });
                            if (searchField.getValue() === "") {
                                filteredRegisteredSparqlQueryArray = registeredSparqlQueryArray;
                            }
//                            console.log(filterdRegisteredSparqlQueryArray);
                            registeredSparqlQueryStore.proxy = new Ext.ux.data.PagingMemoryProxy(filteredRegisteredSparqlQueryArray);
                            registeredSparqlQueryStore.reload();
                        })(jQuery);
                    }
                }
            ]
        };

        var getSPARQLPagingToolBar = function(store) {
            return new Ext.PagingToolbar({
                store: store,
                pageSize : WIKIPEDIA_ONTOLOGY_SEARCH.constants.SPARQL_PAGE_SIZE,
                displayInfo : true,
                displayMsg : "{2} " + "件中" + " {0} - {1} を表示",
                plugins : [new Ext.ux.SlidingPager(), new Ext.ux.ProgressBarPager()]
            });
        };


        var sparqlResultsPanelBbar = getSPARQLPagingToolBar(sparqlResultsStore);
        var registeredSparqlQueryPanelBbar = getSPARQLPagingToolBar(registeredSparqlQueryStore);


        var sparqlResultsPanel = new Ext.grid.GridPanel({
            id : 'SPARQLResultsPanel',
            stateId : 'sparql_results_panel',
            stateful : true,
            stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
            store : sparqlResultsStore,
            colModel : getSPARQLColumnModel([
                {}
            ]),
            stripeRows : true,
            frame : true,
            iconCls: 'icon-sparql',
            bbar: sparqlResultsPanelBbar,
            region: 'center',
            listeners : {
                cellclick : openWikiOntJSONData,
                cellcontextmenu : showStatementTablePanelContextMenu
            }
        });


        var registeredSparqlQueryPanel = new Ext.grid.GridPanel({
            id : 'RegisteredSPARQLQueryPanel',
            stateId : 'registered_sparql_query_panel',
            stateful : true,
            stateEvents : ['columnresize', 'columnmove', 'columnvisible', 'columnsort'],
            store : registeredSparqlQueryStore,
            colModel : registeredSparqlQueryColumnModel,
            stripeRows : true,
            frame : true,
            iconCls: 'icon-sparql',
            bbar: registeredSparqlQueryPanelBbar,
            autoExpandColumn : 'sparql_query_description_id',
            region: 'center',
            sm : registeredSparqlQueryCheckboxSelectionModel,
            listeners : {
                cellclick : function(grid, rowIndex, columnIndex, e) {
                    var record = grid.getStore().getAt(rowIndex);
                    var sparqlQuery = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQuery);
                    var sparqlQueryDescription = record.get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.sparqlQueryDescription);
                    Ext.getCmp("SPARQLQueryArea").setValue(sparqlQuery);
                    Ext.getCmp("SPARQLQueryDescriptionArea").setValue(sparqlQueryDescription);
                }
            }
        });


        var getSPARQLQueryURL = function() {
            var sparqlQuery = Ext.getCmp("SPARQLQueryArea").getValue();
            var queryURL = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL;
            queryURL += "sparql?output_format=json&q=";
            queryURL += encodeURIComponent(sparqlQuery);
            var isUseInfModel = Ext.getCmp("sparql_use_inf_model").checked;
            if (isUseInfModel) {
                queryURL += "&inference_type=rdfs";
            } else {
                queryURL += "&inference_type=none";
            }
            queryURL += "&version=" + versionComboBox.getValue();
//            console.log(queryURL);
            return queryURL;
        }

        var renderResource = function(value) {
            if (value === null) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "label_icon_s.png'/> " + value;
                return newValue;
            }
            var baseURI = WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_URI;
            var newValue = "";
            if (value.indexOf(baseURI + "class") != -1) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "class_icon_s.png'/> ";
            } else if (value.indexOf(baseURI + "property") != -1) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "property_icon_s.png'/> ";
            } else if (value.indexOf(baseURI + "instance") != -1) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "instance_icon_s.png'/> ";
            } else if (value.indexOf("wikipedia.org") != -1) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "wikipedia_icon_s.png'/> ";
            } else if (value.indexOf("dbpedia.org") != -1) {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "dbpedia_icon_s.png'/> ";
            }
            if (value.indexOf(baseURI) != -1) {
                value = value.replace(baseURI, "wikiont_")
                value = value.replace("/", ":");
                newValue += '<a href="' + value + '" onclick="openWikiOntRDFData(\'' + value + '\'); return false;">' + value + "</a>";
                return newValue;
            } else if (value.indexOf("http://") !== -1) {
                newValue += '<a href="' + value + '" onclick="openWikiOntRDFData(\'' + value + '\'); return false;">' + getQname(value) + "</a>";
                return newValue;
            } else {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "label_icon_s.png'/> " + value;
                return newValue;
            }
        };

        var getQname = function(uri) {
            uri = uri.replace("http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:");
            uri = uri.replace("http://www.w3.org/2000/01/rdf-schema#", "rdfs:");
            uri = uri.replace("http://www.w3.org/2002/07/owl#", "owl:");
            uri = uri.replace("http://xmlns.com/foaf/0.1/", "foaf:");
            return uri;
        };

        var saveRegisteredSPARQLQueryArray = function() {
            localStorage.registeredSparqlQueryArray = JSON.stringify(registeredSparqlQueryArray);
            registeredSparqlQueryStore.proxy = new Ext.ux.data.PagingMemoryProxy(registeredSparqlQueryArray);
            registeredSparqlQueryStore.reload();
        };

        var registerSPARQLQuery = function() {
            var sparqlQuery = Ext.getCmp("SPARQLQueryArea").getValue();
            var sparqlQueryDescription = Ext.getCmp("SPARQLQueryDescriptionArea").getValue();
            var registerDate = new Date();
            var updateDate = new Date();
            registeredSparqlQueryArray.push([registerDate,updateDate,sparqlQueryDescription, sparqlQuery]);
            saveRegisteredSPARQLQueryArray();
        };

        var clearSPARQLQueryArea = function() {
            Ext.getCmp("SPARQLQueryArea").setValue("");
            Ext.getCmp("SPARQLQueryDescriptionArea").setValue("");
        };

        var updateSelectedSparqlQuery = function() {
            var selectedRecords = registeredSparqlQueryCheckboxSelectionModel.getSelections();
            for (var q = 0; q < registeredSparqlQueryArray.length; q++) {
                for (var i = 0; i < selectedRecords.length; i++) {
//                    console.log(registeredSparqlQueryArray[q][0] + "===" + selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour));
                    if (registeredSparqlQueryArray[q][0] === selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour)) {
                        registeredSparqlQueryArray[q][1] = new Date();
                        registeredSparqlQueryArray[q][2] = Ext.getCmp("SPARQLQueryDescriptionArea").getValue();
                        registeredSparqlQueryArray[q][3] = Ext.getCmp("SPARQLQueryArea").getValue();
                    }
                }
            }
            saveRegisteredSPARQLQueryArray();
        };

        var removeAllSparqlQuery = function() {
            registeredSparqlQueryArray = [];
            saveRegisteredSPARQLQueryArray();
        }

        var removeSelectedSparqlQueries = function() {
            var selectedRecords = registeredSparqlQueryCheckboxSelectionModel.getSelections();
            var newRegisteredSparqlQueryArray = [];
            for (var q = 0; q < registeredSparqlQueryArray.length; q++) {
                var isDelete = false;
                for (var i = 0; i < selectedRecords.length; i++) {
//                    console.log(registeredSparqlQueryArray[q][0]);
//                    console.log(selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour));
                    if (registeredSparqlQueryArray[q][0] === selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour)) {
                        isDelete = true;
                    }
                }
                if (!isDelete) {
                    newRegisteredSparqlQueryArray.push(registeredSparqlQueryArray[q]);
                }
            }
            registeredSparqlQueryArray = newRegisteredSparqlQueryArray;
            saveRegisteredSPARQLQueryArray();
        };

        var querySPARQL = function() {
            sparqlResultsPanel.body.mask(LOADING, "loading-indicator");
            if (registeredSparqlQueryPanel !== undefined && registeredSparqlQueryPanel.body !== undefined) {
                registeredSparqlQueryPanel.body.mask(LOADING, "loading-indicator");
            }
            var queryURL = getSPARQLQueryURL();
//            alert(queryURL);
            jQuery.getJSON(queryURL, function(results) {
//                console.log(results);
                var headers = results.head.vars;
                var columns = [];
                var recordTypes = [];
                jQuery.each(headers, function(index, value) {
//                    console.log(value);
                    var column = {
                        id : value + '_id',
                        dataIndex : value,
                        header : value,
                        width : 200,
                        renderer : renderResource
                    };
                    var recordType = {
                        name: value
                    };
                    columns.push(column);
                    recordTypes.push(recordType);
                });
                var bindings = results.results.bindings;
                sparqlResultsArray = [];
                jQuery.each(bindings, function(index, result) {
                    var record = [];
                    jQuery.each(headers, function(index, header) {
                        record.push(result[header].value);
                    });
                    sparqlResultsArray.push(record);
                });
//                console.log(sparqlResultsArray);
                var sparqlResultsStore = getSPARQLResultsStore(recordTypes);
                sparqlResultsPanel.reconfigure(sparqlResultsStore, getSPARQLColumnModel(columns));
                sparqlResultsStore.reload();
                sparqlResultsPanelBbar.bind(sparqlResultsStore);
                sparqlResultsPanelBbar.doRefresh();
            });
        }


        this.items = [
            {
                xtype: 'panel',
                width: 800,
                height: 290,
                layout: 'border',
                region: 'north',
                items: [
                    {
                        xtype: 'fieldset',
                        region: 'center',
                        width: 800,
                        height: 290,
                        items: [
                            {
                                xtype: 'textarea',
                                id: "SPARQLQueryDescriptionArea",
                                width: 650,
                                height: 50,
                                fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.resources.description
                            },
                            {
                                xtype: 'textarea',
                                id: 'SPARQLQueryArea',
                                width: 650,
                                height: 150,
                                fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.resources.query
                            },
                            {
                                xtype: 'compositefield',
                                fieldLabel: WIKIPEDIA_ONTOLOGY_SEARCH.resources.version,
                                items: [
                                    {
                                        items: [versionComboBox]
                                    },
                                    {
                                        xtype : 'checkbox',
                                        boxLabel : WIKIPEDIA_ONTOLOGY_SEARCH.resources.useInferenceModel,
                                        id : 'sparql_use_inf_model'
                                    }
                                ]
                            },
                            {
                                xtype: 'panel',
                                layout: 'hbox',
                                width: 350,
                                items: [
                                    {
                                        xtype: 'button',
                                        iconCls: 'icon-search',
                                        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.search,
                                        flex: 1,
                                        handler: querySPARQL
                                    },
                                    {
                                        xtype: 'button',
                                        iconCls: 'icon-db_add',
                                        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.register,
                                        flex: 1,
                                        handler: registerSPARQLQuery
                                    },
                                    {
                                        xtype: 'button',
                                        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.clear,
                                        flex: 1,
                                        handler: clearSPARQLQueryArea
                                    },
                                    {
                                        xtype: 'button',
//                                        iconCls: 'icon-rdf',
                                        text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.sourceCode,
                                        flex: 1,
                                        handler: function() {
                                            var queryURL = getSPARQLQueryURL();
                                            queryURL = queryURL.replace("output_format=json", "output_format=xml");
                                            WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel.reloadRDFSource(queryURL);
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'sparql_query_results_and_registered_queries',
                xtype: 'tabpanel',
                activeTab: 0,
                region: 'center',
                title: '',
                items: [
                    {
                        xtype: 'panel',
                        title: WIKIPEDIA_ONTOLOGY_SEARCH.resources.queryResults,
                        layout: 'border',
                        items: [
                            sparqlResultsPanel
                        ]
                    },
                    {
                        xtype: 'panel',
                        title: WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredQuery,
                        layout: 'border',
                        items: [
                            registeredSparqlQueryPanel
                        ],
                        tbar: registeredSparqlQueryPanelTbar
                    }
                ]
            }
        ];
        WIKIPEDIA_ONTOLOGY_SEARCH.SPARQLPanel.superclass.initComponent.call(this);
    }
});
