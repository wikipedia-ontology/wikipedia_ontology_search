/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getBookmarkImportAndExportDialog() {
    return new Ext.Window({
        id : 'BookmarkImportAndExportDialog',
        title : IMPORT_OR_EXPORT_BOOKMARKS,
        width : 600,
        height : 400,
        autoScroll : true,
        modal : true,
        layout : 'border',
        iconCls: 'icon-book',
        items : {
            id : 'bookmark_source_text_area',
            xtype : 'textarea',
            region : 'center',
            layout : 'fit',
            autoScroll : true
        },
        buttons : [
            {
                xtype : 'button',
                iconCls: 'icon-import',
                text : IMPORT,
                handler : importBookmarks
            },
            {
                xtype : 'button',
                iconCls: 'icon-export',
                text : EXPORT,
                handler : exportBookmarks
            },
            {
                xtype : 'button',
                text : CLOSE,
                handler : function() {
                    Ext.getCmp('BookmarkImportAndExportDialog').setVisible(false);
                }
            }
        ]
    });
}

function exportBookmarks() {
    var exportText = "";
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    for (var i = 0; i < bookmarkStore.getCount(); i++) {
        var record = bookmarkStore.getAt(i);
        exportText += [
            record.get(DATE_PARAMETER_KEY),
            record.get(RESOURCE_NAME_PARAMETER_KEY),
            record.get(RESOURCE_TYPE_PARAMETER_KEY),
            record.get(SEARCH_TARGET_PARAMETER_KEY),
            record.get(SEARCH_OPTION_PARAMETER_KEY),
            record.get(INFERENCE_TYPE_PARAMETER_KEY),
            record.get(URI_PARAMETER_KEY),
            record.get(VERSION_PARAMETER_KEY)
        ].join(",") + "\n";
    }
    Ext.getCmp('bookmark_source_text_area').setValue(exportText);
}

function importBookmarks() {
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    var importText = Ext.getCmp('bookmark_source_text_area').getValue();
    var recordTexts = importText.split("\n");
    var importedBookmarkData = [];
    for (var i = 0; i < recordTexts.length; i++) {
        if (recordTexts[i].length == 0) {
            continue;
        }
        var record = recordTexts[i].split(",");
        if (record.length != BOOKMARK_RECORD_LENGTH) {
            continue;
        }
        importedBookmarkData.push(record);
    }
    bookmarkStore.loadData(importedBookmarkData, true);
}

function showBookmarkImportDialog() {
    var bookmarkImportAndExportDialog = Ext.getCmp('BookmarkImportAndExportDialog');
    bookmarkImportAndExportDialog.show();
    Ext.getCmp('bookmark_source_text_area').setValue('');
}

function showBookmarkExportDialog() {
    var bookmarkImportAndExportDialog = Ext.getCmp('BookmarkImportAndExportDialog');
    bookmarkImportAndExportDialog.show();
    exportBookmarks();
}