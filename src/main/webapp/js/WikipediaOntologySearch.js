/**
 * 日本語Wikipediaオントロジー検索 インターフェース
 *
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 *
 */

var useInfModel = false;
var queryType = QTYPE_CLASS;
var searchTargetType = URI_SEARCH_TARGET_OPTION;
var currentURI = "";
var queryURL = "";
var show_isa_tree_and_instance = true;
var expand_all_class_and_instance = false;
var start_collapsed_group = true;

var bookmarkPanel;
var historyPanel;
WikipediaOntologySearch = new Ext.app.App({
    init :function() {
        Ext.QuickTips.init();
        //        Ext.getDom("title").innerHTML = APP_TITLE + " ver. 2011-01-23";
        var cookieProvider = new Ext.state.CookieProvider({
            expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 5))
        });
        Ext.state.Manager.setProvider(cookieProvider);
        bookmarkPanel = getBookmarkPanel();
        historyPanel = getHistoryPanel();
        //        applyOptionState();
        //        setTimeout(function() {
        //            Ext.get('loading').remove();
        //            Ext.get('loading-mask').fadeOut({
        //                remove : true
        //            });
        //        }, 1000);
    },

    getModules : function() {
        return [
            new WikipediaOntologySearch.StatementWindow(),
            new WikipediaOntologySearch.ClassListWindow(),
            new WikipediaOntologySearch.PropertyListWindow(),
            new WikipediaOntologySearch.InstanceListWindow(),
            new WikipediaOntologySearch.TreeWindow(),
            new WikipediaOntologySearch.WholeTreeWindow(),
            new WikipediaOntologySearch.BookmarkWindow(),
            new WikipediaOntologySearch.HistoryWindow(),
            new WikipediaOntologySearch.SourceWindow(),
        ];
    },

    // config for the start menu
    getStartConfig : function() {
        return {
            title: 'Menu',
            iconCls: 'user',
            toolItems: [
            ]
        };
    }
});

WikipediaOntologySearch.BookmarkWindow = Ext.extend(Ext.app.Module, {
    id:'bookmark-win',
    init : function() {
        this.launcher = {
            text: BOOKMARK,
            iconCls:'icon-book',
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
                iconCls: 'icon-book',
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
            iconCls:'icon-time',
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
                iconCls: 'icon-time',
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
            iconCls:'icon-table',
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
                iconCls: 'icon-table',
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
            layout : 'hbox',
            frame: true,
            iconCls: 'icon-class',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items: [
                {
                    flex: 1,
                    layout: 'fit',
                    items: classListPanel
                },
                {
                    flex:2,
                    layout: 'fit',
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
            text: CLASS_HIERARCHY_AND_INSTANCES,
            iconCls:'icon-expand-all',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('tree-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'tree-win',
                title:CLASS_HIERARCHY_AND_INSTANCES,
                width:500,
                height:600,
                iconCls: 'icon-expand-all',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getTreePanel(CLASS_HIERARCHY_AND_INSTANCES, "classAndInstanceTree")
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.WholeTreeWindow = Ext.extend(Ext.app.Module, {
    id:'whole-tree-win',
    init : function() {
        this.launcher = {
            text: WHOLE_CLASS_HIEARCHY,
            iconCls:'icon-expand-all',
            handler : this.createWindow,
            scope: this
        }
    },

    createWindow : function() {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('whole-tree-win');
        if (!win) {
            win = desktop.createWindow({
                id: 'whole-tree-win',
                title:WHOLE_CLASS_HIEARCHY,
                width:500,
                height:600,
                iconCls: 'icon-expand-all',
                shim:false,
                closable: true,
                animCollapse:false,
                constrainHeader:true,
                layout: 'fit',
                items:getTreePanel(WHOLE_CLASS_HIEARCHY, "wholeClassTree")
            });
        }
        win.show();
    }
});

WikipediaOntologySearch.SourceWindow = Ext.extend(Ext.app.Module, {
    id:'source-win',
    init : function() {
        this.launcher = {
            text: "RDF/XML",
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
                title:"RDF/XML",
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

        var propertyListPanel = getPropertyListPanel();
        //        loadStore(propertyListPanel.store);
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
            layout : 'hbox',
            frame: true,
            iconCls: 'icon-property',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items: [
                {
                    flex: 1,
                    layout: 'fit',
                    items: propertyListPanel
                },
                {
                    flex:2,
                    layout: 'fit',
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

        var instanceListPanel = getInstanceListPanel(INSTANCE);
        //        loadStore(instanceListPanel.store);
        var instanceTypeListPanel = getInstanceTypeListPanel();
        var instanceListWindowPanel = new Ext.Panel({
            layout: 'hbox',
            frame: true,
            iconCls: 'icon-instance',
            layoutConfig: {
                align : 'stretch',
                pack  : 'start'
            },
            items: [
                {
                    flex: 1,
                    layout: 'fit',
                    items: instanceListPanel
                },
                {
                    flex:2,
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
                iconCls: 'icon-table',
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

//Ext.onReady(function() {
//    Ext.QuickTips.init();
//    Ext.getDom("title").innerHTML = APP_TITLE + " ver. 2011-01-23";
//    var cookieProvider = new Ext.state.CookieProvider({
//        expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 5))
//    });
//    Ext.state.Manager.setProvider(cookieProvider);
//    var mainView = getMainView();
//    applyOptionState();
//    mainView.doLayout();
//    setTimeout(function() {
//        Ext.get('loading').remove();
//        Ext.get('loading-mask').fadeOut({
//            remove : true
//        });
//    }, 1000);
//
//});
