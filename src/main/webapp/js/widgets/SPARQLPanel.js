/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */


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
                    renderer : Ext.util.Format.dateRenderer('Y/m/d H:i:s'),
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
                remoteSort: true
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
                    type: 'date'
                },
                {
                    name : WIKIPEDIA_ONTOLOGY_SEARCH.resources.updateDateAndHour
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
                    text: '更新',
                    handler: function() {
                        updateSelectedSparqlQuery();
                    }
                },
                {
                    xtype: 'button',
                    text: '削除',
                    handler: function() {
                        removeSelectedSparqlQueries();
                    }
                },
                {
                    xtype: 'textfield',
                    width: 150
                },
                {
                    xtype: 'checkbox',
                    boxLabel: '説明',
                    width: 50
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'クエリ'
                },
                {
                    xtype: 'button',
                    text: '検索',
                    width: 50
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
            console.log(queryURL);
            return queryURL;
        }

        var renderResource = function(value) {
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
            } else {
                newValue += "<img alt='" + value + "' src='" + WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_ICON_URL + "label_icon_s.png'/> " + value;
                return newValue;
            }
        }

        var saveRegisteredSPARQLQueryArray = function() {
            localStorage.registeredSparqlQueryArray = JSON.stringify(registeredSparqlQueryArray);
            registeredSparqlQueryStore.proxy = new Ext.ux.data.PagingMemoryProxy(registeredSparqlQueryArray);
            registeredSparqlQueryStore.reload();
        }

        var registerSPARQLQuery = function() {
            var sparqlQuery = Ext.getCmp("SPARQLQueryArea").getValue();
            var sparqlQueryDescription = Ext.getCmp("SPARQLQueryDescriptionArea").getValue();
            var registerDate = new Date().toLocaleString();
            registeredSparqlQueryArray.push([registerDate,,sparqlQueryDescription, sparqlQuery]);
            saveRegisteredSPARQLQueryArray();
        };

        var clearSPARQLQueryArea = function() {
            Ext.getCmp("SPARQLQueryArea").setValue("");
            Ext.getCmp("SPARQLQueryDescriptionArea").setValue("");
        };

        var updateSelectedSparqlQuery = function() {
            var selectedRecords = registeredSparqlQueryCheckboxSelectionModel.getSelections();
            var newRegisteredSparqlQueryArray = [];
            for (var q = 0; q < registeredSparqlQueryArray.length; q++) {
                for (var i = 0; i < selectedRecords.length; i++) {
                    if (registeredSparqlQueryArray[q][0] == selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour)) {
                        registeredSparqlQueryArray[q][1] = new Date().toLocaleString();
                        registeredSparqlQueryArray[q][2] = Ext.getCmp("SPARQLQueryDescriptionArea").getValue();
                        registeredSparqlQueryArray[q][3] = Ext.getCmp("SPARQLQueryArea").getValue();
                    }
                }
            }
            saveRegisteredSPARQLQueryArray();
        };

        var removeSelectedSparqlQueries = function() {
            var selectedRecords = registeredSparqlQueryCheckboxSelectionModel.getSelections();
            var newRegisteredSparqlQueryArray = [];
            for (var q = 0; q < registeredSparqlQueryArray.length; q++) {
                var isDelete = false;
                for (var i = 0; i < selectedRecords.length; i++) {
//                    console.log(registeredSparqlQueryArray[q][0]);
//                    console.log(selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour));
                    if (registeredSparqlQueryArray[q][0] == selectedRecords[i].get(WIKIPEDIA_ONTOLOGY_SEARCH.resources.registeredDateAndHour)) {
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
            var queryURL = getSPARQLQueryURL();
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
                sparqlResultsStore.reader = new Ext.data.ArrayReader({}, recordTypes);
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
                var store = getSPARQLResultsStore(recordTypes);
                sparqlResultsPanel.reconfigure(store, getSPARQLColumnModel(columns));
                store.reload();
                sparqlResultsPanelBbar.bind(store);
                sparqlResultsPanelBbar.doRefresh();
            });
        }


        this.items = [
            {
                xtype: 'panel',
                width: 800,
                height: 260,
                layout: 'border',
                region: 'north',
                items: [
                    {
                        xtype: 'fieldset',
                        region: 'center',
                        width: 800,
                        height: 260,
                        items: [
                            {
                                xtype: 'textarea',
                                id: "SPARQLQueryDescriptionArea",
                                width: 650,
                                height: 50,
                                fieldLabel: '説明'
                            },
                            {
                                xtype: 'textarea',
                                id: 'SPARQLQueryArea',
                                width: 650,
                                height: 150,
                                fieldLabel: 'クエリ'
                            },
                            {
                                xtype: 'panel',
                                layout: 'hbox',
                                width: 200,
                                items: [
                                    {
                                        xtype: 'button',
                                        text: '検索',
                                        flex: 1,
                                        handler: querySPARQL
                                    },
                                    {
                                        xtype: 'button',
                                        text: '登録',
                                        flex: 1,
                                        handler: registerSPARQLQuery
                                    },
                                    {
                                        xtype: 'button',
                                        text: 'クリア',
                                        flex: 1,
                                        handler: clearSPARQLQueryArea
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'tabpanel',
                activeTab: 0,
                region: 'center',
                title: '',
                items: [
                    {
                        xtype: 'panel',
                        title: 'クエリ結果',
                        layout: 'border',
                        items: [
                            sparqlResultsPanel
                        ]
                    },
                    {
                        xtype: 'panel',
                        title: '登録クエリ',
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
