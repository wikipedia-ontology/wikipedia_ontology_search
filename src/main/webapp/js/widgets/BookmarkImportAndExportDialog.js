/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getBookmarkImportAndExportDialog() {
    return new Ext.Window({
        id : 'BookmarkImportAndExportDialog',
        title : WIKIPEDIA_ONTOLOGY_SEARCH.resources.importOrExportBookmarks,
        width : 600,
        height : 400,
        autoScroll : true,
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
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.import,
                handler : importBookmarks
            },
            {
                xtype : 'button',
                iconCls: 'icon-export',
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.export,
                handler : exportBookmarks
            },
            {
                xtype : 'button',
                text : WIKIPEDIA_ONTOLOGY_SEARCH.resources.close,
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
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.date),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_name),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.resource_type),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_target),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.search_option),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.inference_type),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.uri),
            record.get(WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys.version)
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
        if (record.length != WIKIPEDIA_ONTOLOGY_SEARCH.constants.BOOKMARK_RECORD_LENGTH) {
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