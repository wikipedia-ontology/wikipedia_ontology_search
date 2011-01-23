/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getMainView() {
    var historyPanel = getHistoryPanel();
    var bookmarkPanel = getBookmarkPanel();
    var bookmarkImportAndExportDialog = getBookmarkImportAndExportDialog(); // new BookmarkImportAndExportDialog
    var sourcePanel = getSourcePanel();
    var statementTabPanel = getStatementTabPanel();

    var classListPanel = getClassListPanel();
    loadStore(classListPanel.store);
    var propertiesOfDomainClassListPanel = getPropertiesOfRegionClassListPanel(DOMAIN);
    var propertiesOfRangeClassListPanel = getPropertiesOfRegionClassListPanel(RANGE);
    var classInstanceListPanel = getInstanceListPanel(CLASS);

    var propertyListPanel = getPropertyListPanel();
    loadStore(propertyListPanel.store);
    var domainClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(DOMAIN);
    var rangeClassesOfPropertyListPanel = getRegionClassesOfPropertyListPanel(RANGE);
    var propertyInstanceListPanel = getInstanceListPanel(PROPERTY);

    var instanceListPanel = getInstanceListPanel(INSTANCE);
    loadStore(instanceListPanel.store);
    var instanceTypeListPanel = getInstanceTypeListPanel();

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
    var classListTabPanel = new Ext.Panel({
        layout : 'hbox',
        frame: true,
        title : CLASS_LIST,
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

    var propertyListTabPanel = new Ext.Panel({
        layout : 'hbox',
        frame: true,
        title : PROPERTY_LIST,
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


    var instanceListTabPanel = new Ext.Panel({
        layout: 'hbox',
        frame: true,
        title: INSTANCE_LIST,
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

    var classAndInstanceTreePanel = getTreePanel(CLASS_HIERARCHY_AND_INSTANCES, "classAndInstanceTree");
    var wholeClassTreePanel = getTreePanel(WHOLE_CLASS_HIEARCHY, "wholeClassTree");

    var wikiOntContentsTab = new Ext.TabPanel({
        activeTab : 0,
        frame : true,
        defaults: {autoScroll:true},
        enableTabScroll: true,
        title : 'Contents',
        items : [statementTabPanel, classAndInstanceTreePanel, wholeClassTreePanel, classListTabPanel, propertyListTabPanel, instanceListTabPanel, bookmarkPanel, historyPanel, sourcePanel]
    });


    var statusBarPanel = new Ext.Panel({
        bbar : new Ext.ux.StatusBar({
            id : 'statusBar',
            text : ''
        })
    });


    var optionDialog = getOptionDialog(); // new OptionDialog
    var versionInfoDialog = getVersionInfoDialog(); // new VersionInfoDialog

    return new Ext.Viewport({
        id : 'mainView',
        layout : 'border',
        hideBorders : true,
        items : [
            {
                region : 'north',
                height : 60,
                cls : 'docs-header',
                items : [
                    {
                        xtype : 'box',
                        el : 'header',
                        border : false,
                        anchor : 'none -25'
                    },
                    {
                        xtype : 'toolbar',
                        items : [
                            {
                                xtype : 'tbbutton',
                                text : LANGUAGE,
                                menu : [
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
                            },
                            {
                                xtype : 'tbbutton',
                                text : TOOL,
                                menu : [
                                    {
                                        text : ADD_TAB,
                                        iconCls: 'icon-newtab',
                                        handler : addTab
                                    },
                                    {
                                        text : SHOW_WHOLE_CLASS_HIEARCHY,
                                        iconCls: 'icon-expand-all',
                                        handler : showWholeIsaTree
                                    },
                                    {
                                        text : OPTION,
                                        iconCls: 'icon-option',
                                        handler : showOptionDialog
                                    }
                                ]
                            },
                            {
                                xtype : 'tbbutton',
                                text : HELP,
                                menu : [
                                    {
                                        text : MANUAL,
                                        iconCls: 'icon-help',
                                        handler : function() {
                                            window.open(HOME_URL + MANUAL_HTML);
                                        }
                                    },
                                    {
                                        text : VERSION_INFORMATION,
                                        iconCls: 'icon-information',
                                        handler : showVersionInfoDialog
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                region : 'center',
                layout : 'fit',
                width : "80%",
                collapsible : false,
                items : wikiOntContentsTab
            },
            {
                region : 'south',
                height : 25,
                items : statusBarPanel
            }
        ]
    });
}