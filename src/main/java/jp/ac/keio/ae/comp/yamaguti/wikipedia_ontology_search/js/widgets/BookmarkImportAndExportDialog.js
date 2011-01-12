function getBookmarkImportAndExportDialog() {
    return new Ext.Window({
        id : 'BookmarkImportAndExportDialog',
        title : IMPORT_OR_EXPORT_BOOKMARKS,
        width : 600,
        height : 400,
        autoScroll : true,
        modal : true,
        layout : 'border',
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
                text : IMPORT,
                handler : importBookmarks
            },
            {
                xtype : 'button',
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
    var bookmarkStore = Ext.getCmp('BookmarkPanel').store;
    var exportText = "";
    for (var i = 0; i < bookmarkStore.getCount(); i++) {
        var record = bookmarkStore.getAt(i);
        var str = [record.get("date"), record.get("keyword"),
            record.get("searchOption"), record.get("queryType"),
            record.get("useInfModel"), record.get("URL")].join(",");
        exportText += str + "\n";
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
        if (record.length != 6) {
            continue;
        }
        importedBookmarkData.push(record);
    }
    bookmarkStore.loadData(importedBookmarkData, true);
    bookmarkStore.sort('date', 'DESC');
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