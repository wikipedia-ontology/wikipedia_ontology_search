/**
 * 日本語Wikipediaオントロジー検索 インターフェース
 *
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 *
 */

var queryType = QTYPE_CLASS;
var inferenceType = NONE_INFERENCE_OPTION;
var searchTargetType = URI_SEARCH_TARGET_OPTION;

var show_isa_tree = true;
var expand_all_class = true;
var start_collapsed_group = true;

var bookmarkPanel;
var historyPanel;
WikipediaOntologySearch = new Ext.app.App({
    init :function() {
        Ext.QuickTips.init();
        var cookieProvider = new Ext.state.CookieProvider({
            expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 5))
        });
        Ext.state.Manager.setProvider(cookieProvider);
        bookmarkPanel = getBookmarkPanel();
        historyPanel = getHistoryPanel();
        getBookmarkImportAndExportDialog(); // new BookmarkImportAndExportDialog
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
            new WikipediaOntologySearch.HelpWindow()
        ];
    },

    // config for the start menu
    getStartConfig : function() {
        return {
            title: MENU,
            iconCls: 'icon-table',
            toolItems: [
                {
                    text : WHOLE_CLASS_HIERARCHY,
                    iconCls: 'icon-expand-all',
                    handler : function() {
                        loadWholeIsaTree();
                    }
                },
                "-",
                {
                    text : MANUAL,
                    iconCls: 'icon-help',
                    handler : function() {
                        window.open(HOME_URL + MANUAL_HTML);
                    }
                },
                {
                    text : ENGLISH,
                    handler : function() {
                        window.open(HOME_URL + SEARCH_EN_HTML, "_self");
                    }
                },
                {
                    text : JAPANESE,
                    handler : function() {
                        window.open(HOME_URL + SEARCH_JA_HTML, "_self");
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
            text : OPTION,
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
                title : OPTION,
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
            text : HELP,
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
                title : HELP,
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
            text: BOOKMARK,
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
                title:BOOKMARK,
                width:800,
                height:600,
                iconCls: 'icon-bookmark',
                shim:false,
                closable: false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:  bookmarkPanel
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.HistoryWindow = Ext.extend(Ext.app.Module, {
    id:'history-win',
    init : function() {
        this.launcher = {
            text: SEARCH_HISTORY,
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
                title:SEARCH_HISTORY,
                width:800,
                height:600,
                iconCls: 'icon-history',
                closable: false,
                shim:false,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items: historyPanel
            });
        }
        win.show();
    }
});
WikipediaOntologySearch.StatementWindow = Ext.extend(Ext.app.Module, {
    id:'statement-win',
    init : function() {
        this.launcher = {
            text: STATEMENT,
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
                title:STATEMENT,
                width:1024,
                height:768,
                iconCls: 'icon-statement',
                shim:false,
                closable: false,
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
            text: CLASS_LIST,
            iconCls:'icon-class',
            handler : this.createWindow,
            scope: this
        }

    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('class-list-win');

        var resourceSearchPanel = getResourceSearchPanel(CLASS);
        var classListPanel = getClassListPanel();
        loadStore(classListPanel.store);
        var propertiesOfDomainClassListPanel = getPropertiesOfRegionClassListPanel(DOMAIN);
        var propertiesOfRangeClassListPanel = getPropertiesOfRegionClassListPanel(RANGE);
        var classInstanceListPanel = getInstanceListPanel(CLASS);

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
                title:CLASS_LIST,
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
            text: CLASS_HIERARCHY,
            iconCls:'icon-class-tree',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('tree-win');

        var uriPanel = getURIPanel("TreeURIField");
        var treePanel = getTreePanel(CLASS_HIERARCHY, "classTree");
        var wholeTreePanel = getTreePanel(WHOLE_CLASS_HIERARCHY, "wholeClassTree");

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
                title:CLASS_HIERARCHY,
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
            text: SOURCE_CODE,
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
                title: SOURCE_CODE,
                width:800,
                height:600,
                iconCls: 'icon-rdf',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getSourcePanel()
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.PropertyListWindow = Ext.extend(Ext.app.Module, {
    id:'property-list-win',
    init : function() {
        this.launcher = {
            text: PROPERTY_LIST,
            iconCls:'icon-property',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('property-list-win');

        var resourceSearchPanel = getResourceSearchPanel(PROPERTY);
        var propertyListPanel = getPropertyListPanel();
        loadStore(propertyListPanel.store);
        var domainClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(DOMAIN);
        var rangeClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(RANGE);
        var propertyInstanceListPanel = getInstanceListPanel(PROPERTY);

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
                title : PROPERTY_LIST,
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
            text: INSTANCE_LIST,
            iconCls:'icon-instance',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('instance-list-win');

        var resourceSearchPanel = getResourceSearchPanel(INSTANCE);
        var instanceListPanel = getInstanceListPanel(INSTANCE);
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
        })
        if (!win) {
            win = desktop.createWindow({
                id: 'instance-list-win',
                title:INSTANCE_LIST,
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

