/**
 * 日本語Wikipediaオントロジー検索 インターフェース
 *
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 *
 */

var queryType = WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes.class;
var inferenceType = WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions.none;
var searchTargetType = WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions.uri;

var show_isa_tree = true;
var expand_all_class = true;
var start_collapsed_group = true;

WikipediaOntologySearch = new Ext.app.App({
    init :function() {
        Ext.QuickTips.init();
        var cookieProvider = new Ext.state.CookieProvider({
            expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 5))
        });
        Ext.state.Manager.setProvider(cookieProvider);
        applyOptions();
    },

    getModules : function() {
        return [
            new WikipediaOntologySearch.StatementWindow(),
            new WikipediaOntologySearch.ClassListWindow(),
            new WikipediaOntologySearch.TreeWindow(),
            new WikipediaOntologySearch.PropertyListWindow(),
            new WikipediaOntologySearch.InstanceListWindow(),
            new WikipediaOntologySearch.BookmarkWindow(),
            new WikipediaOntologySearch.HistoryWindow(),
            new WikipediaOntologySearch.SourceWindow(),
            new WikipediaOntologySearch.OptionWindow(),
            new WikipediaOntologySearch.StatisticsInformationWindow(),
            new WikipediaOntologySearch.HelpWindow()
        ];
    },

    // config for the start menu
    getStartConfig : function() {
        return {
            title: WIKIPEDIA_ONTOLOGY_SEARCH.resources.menu,
            iconCls: 'icon-table',
            toolItems: [
                {
                    text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.wholeClassHierarchy,
                    iconCls: 'icon-expand-all',
                    handler : function() {
                        loadWholeIsaTree();
                    }
                },
                "-",
                {
                    text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.manual,
                    iconCls: 'icon-help',
                    handler : function() {
                        window.open(WIKIPEDIA_ONTOLOGY_SEARCH.constants.HOME_URL + WIKIPEDIA_ONTOLOGY_SEARCH.resources.manualHTML);
                    }
                },
                {
                    text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.english,
                    handler : function() {
                        window.open(WIKIPEDIA_ONTOLOGY_SEARCH.constants.HOME_URL + WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchEnHTML, "_self");
                    }
                },
                {
                    text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.japanese,
                    handler : function() {
                        window.open(WIKIPEDIA_ONTOLOGY_SEARCH.constants.HOME_URL + WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchJaHTML, "_self");
                    }
                }
            ]
        };
    }
});

WikipediaOntologySearch.OptionWindow = Ext.extend(Ext.app.Module, {
    id:'option-win',
    init : function() {
        this.launcher = {
            text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.option,
            iconCls:'icon-option',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('option-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'option-win',
                title : WIKIPEDIA_ONTOLOGY_SEARCH.resources.option,
                width:600,
                height:200,
                iconCls: 'icon-option',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getOptionPanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.HelpWindow = Ext.extend(Ext.app.Module, {
    id:'help-win',
    init : function() {
        this.launcher = {
            text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.help,
            iconCls:'icon-help',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('help-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'help-win',
                title : WIKIPEDIA_ONTOLOGY_SEARCH.resources.help,
                width:600,
                height:400,
                iconCls: 'icon-help',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getHelpPanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.BookmarkWindow = Ext.extend(Ext.app.Module, {
    id:'bookmark-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.bookmark,
            iconCls:'icon-bookmark',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('bookmark-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'bookmark-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.bookmark,
                width:800,
                height:600,
                iconCls: 'icon-bookmark',
                shim:false,
                //                closable: false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:  getBookmarkPanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.HistoryWindow = Ext.extend(Ext.app.Module, {
    id:'history-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchHistory,
            iconCls:'icon-history',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('history-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'history-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.searchHistory,
                width:800,
                height:600,
                iconCls: 'icon-history',
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items: getHistoryPanel()
            });
        }
        win.show();
    }
});
WikipediaOntologySearch.StatementWindow = Ext.extend(Ext.app.Module, {
    id:'statement-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.statement,
            iconCls:'icon-statement',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('statement-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'statement-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.statement,
                width:1024,
                height:768,
                iconCls: 'icon-statement',
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getStatementTabPanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.ClassListWindow = Ext.extend(Ext.app.Module, {
    id:'class-list-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.classList,
            iconCls:'icon-class',
            handler : this.createWindow,
            scope: this
        }

    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('class-list-win');

        var resourceSearchPanel = getResourceSearchPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class);
        var classListPanel = getClassListPanel();
        loadStore(classListPanel.store);
        var propertiesOfDomainClassListPanel = getPropertiesOfRegionClassListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.domain);
        var propertiesOfRangeClassListPanel = getPropertiesOfRegionClassListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.range);
        var classInstanceListPanel = getInstanceListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.class);

        var regionListOfClassPanel = new Ext.Panel({
            layout : 'hbox',
            frame: true,
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items:[
                {
                    flex:1,
                    layout: 'fit',
                    items: propertiesOfDomainClassListPanel
                },
                {
                    flex:1,
                    layout: 'fit',
                    items: propertiesOfRangeClassListPanel
                }
            ]
        });

        var eastSideClassListPanel = new Ext.Panel({
            layout : 'vbox',
            frame: true,
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items:[
                {
                    flex:1,
                    layout: 'fit',
                    items: regionListOfClassPanel
                },
                {
                    flex:1,
                    layout: 'fit',
                    items: classInstanceListPanel
                }
            ]
        });

        var classListWindowPanel = new Ext.Panel({
            layout : 'border',
            frame: true,
            iconCls: 'icon-class',
            items: [
                {
                    region: 'north',
                    layout: 'fit',
                    height: 100,
                    items: resourceSearchPanel
                },
                {
                    region: 'west',
                    layout: 'fit',
                    width: 400,
                    split: true,
                    items: classListPanel
                },
                {
                    region: 'center',
                    layout: 'fit',
                    split: true,
                    items: eastSideClassListPanel
                }
            ]
        });

        if (!win) {
            win = desktop.createWindow({
                id: 'class-list-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.classList,
                width:1024,
                height:768,
                iconCls: 'icon-class',
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:classListWindowPanel
            });
        }
        win.show();
    }
});


WikipediaOntologySearch.TreeWindow = Ext.extend(Ext.app.Module, {
    id:'tree-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.classHierarchy,
            iconCls:'icon-class-tree',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('tree-win');

        var uriPanel = getURIPanel("TreeURIField");
        var treePanel = getTreePanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.classHierarchy, "classTree");
        var wholeTreePanel = getTreePanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.wholeClassHierarchy, "wholeClassTree");

        var mainPanel = new Ext.Panel({
            layout : 'border',
            items : [
                {
                    region: 'west',
                    layout: 'fit',
                    items: treePanel,
                    split: true,
                    width: 400
                },
                {
                    region: 'center',
                    layout : 'fit',
                    split: true,
                    items : wholeTreePanel
                }
            ]
        });

        var treeWindowPanel = new Ext.Panel({
            layout : 'border',
            hideBorders : true,
            iconCls: 'icon-table',
            items : [
                {
                    region: 'north',
                    height: 40,
                    items: uriPanel
                },
                {
                    region : 'center',
                    layout : 'fit',
                    collapsible : false,
                    items : mainPanel
                }
            ]
        });

        if (!win) {
            win = desktop.createWindow({
                id: 'tree-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.classHierarchy,
                width:800,
                height:600,
                iconCls: 'icon-class-tree',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:treeWindowPanel
            });
        }
        win.show();
    }
});


WikipediaOntologySearch.SourceWindow = Ext.extend(Ext.app.Module, {
    id:'source-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.sourceCode,
            iconCls:'icon-rdf',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('source-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'source-win',
                title: WIKIPEDIA_ONTOLOGY_SEARCH.resources.sourceCode,
                width:800,
                height:600,
                iconCls: 'icon-rdf',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel.getSourcePanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.PropertyListWindow = Ext.extend(Ext.app.Module, {
    id:'property-list-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.propertyList,
            iconCls:'icon-property',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('property-list-win');

        var resourceSearchPanel = getResourceSearchPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.property);
        var propertyListPanel = getPropertyListPanel();
        loadStore(propertyListPanel.store);
        var domainClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.domain);
        var rangeClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resources.range);
        var propertyInstanceListPanel = getInstanceListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.property);

        var regionListOfPropertyPanel = new Ext.Panel({
            layout : 'hbox',
            frame: true,
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items:[
                {
                    flex:1,
                    layout: 'fit',
                    items: domainClassesOfPropertyListPanel
                },
                {
                    flex:1,
                    layout: 'fit',
                    items: rangeClassesOfPropertyListPanel
                }
            ]
        });

        var eastSidePropertyListPanel = new Ext.Panel({
            layout : 'vbox',
            frame: true,
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items:[
                {
                    flex:1,
                    layout: 'fit',
                    items: regionListOfPropertyPanel
                },
                {
                    flex:1,
                    layout: 'fit',
                    items: propertyInstanceListPanel
                }
            ]
        });

        var propertyListWindowPanel = new Ext.Panel({
            layout : 'border',
            frame: true,
            iconCls: 'icon-property',
            items: [
                {
                    region: 'north',
                    layout: 'fit',
                    height: 100,
                    items: resourceSearchPanel
                },
                {
                    region: 'west',
                    layout: 'fit',
                    width: 400,
                    split: true,
                    items: propertyListPanel
                },
                {
                    region: 'center',
                    layout: 'fit',
                    split: true,
                    items: eastSidePropertyListPanel
                }
            ]
        });

        if (!win) {
            win = desktop.createWindow({
                id: 'property-list-win',
                title : WIKIPEDIA_ONTOLOGY_SEARCH.resources.propertyList,
                width:1024,
                height:768,
                iconCls: 'icon-property',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:propertyListWindowPanel
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.InstanceListWindow = Ext.extend(Ext.app.Module, {
    id:'instance-list-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.instanceList,
            iconCls:'icon-instance',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('instance-list-win');

        var resourceSearchPanel = getResourceSearchPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.instance);
        var instanceListPanel = getInstanceListPanel(WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels.instance);
        loadStore(instanceListPanel.store);
        var instanceTypeListPanel = getInstanceTypeListPanel();
        var instanceListWindowPanel = new Ext.Panel({
            layout: 'border',
            frame: true,
            iconCls: 'icon-instance',
            items: [
                {
                    region: 'north',
                    layout: 'fit',
                    height: 100,
                    items: resourceSearchPanel
                },
                {
                    region: 'west',
                    layout: 'fit',
                    width: 400,
                    split: true,
                    items: instanceListPanel
                },
                {
                    region: 'center',
                    layout: 'fit',
                    items: instanceTypeListPanel
                }
            ]
        });
        if (!win) {
            win = desktop.createWindow({
                id: 'instance-list-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.instanceList,
                width:1024,
                height:768,
                iconCls: 'icon-instance',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:instanceListWindowPanel
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.StatisticsInformationWindow = Ext.extend(Ext.app.Module, {
    id:'statistics-information-win',
    init : function() {
        this.launcher = {
            text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.statisticsInformation,
            iconCls:'icon-chart',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('statistics-information-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'statistics-information-win',
                title:WIKIPEDIA_ONTOLOGY_SEARCH.resources.statisticsInformation,
                width:750,
                height:500,
                iconCls: 'icon-chart',
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items: getStatisticsInformationPanel()
            });
        }
        win.show();
    }
});


