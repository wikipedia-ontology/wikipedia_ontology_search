/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

WIKIPEDIA_ONTOLOGY_SEARCH.SourcePanel = {
    getSourcePanel: function() {
        var uriPanel = new Ext.Panel({
            frame : true,
            height: 30,
            bodyStyle : 'padding: 10px;',
            layout: 'border',
            items : [
                {
                    region: 'west',
                    xtype: 'label',
                    text: WIKIPEDIA_ONTOLOGY_SEARCH.resources.uri,
                    width: 30
                },
                {
                    id: "SourceURIField",
                    region: 'center',
                    xtype: 'textfield',
                    editable: false
                }
            ]
        });

        return new Ext.Panel({
            iconCls: 'icon-rdf',
            hideBorders : true,
            bodyStyle : 'font-size: 80%; padding: 10px;',
            layout: 'border',
            items : [
                {
                    region: 'north',
                    height: 40,
                    items: uriPanel
                },
                {
                    region:'center',
                    layout: 'fit',
                    autoScroll : true,
                    xtype: 'textarea',
                    id : "xml_source",
                    html : ""
                }
            ]
        });
    },
    reloadRDFSource: function(queryDataURL) {
        queryDataURL = queryDataURL.replace(WIKIPEDIA_ONTOLOGY_SEARCH.constants.ESCAPED_JSON_EXTENSION, "");
        Ext.getCmp("SourceURIField").setValue(queryDataURL);
        Ext.Ajax.request({
            url : queryDataURL,
            success : function(res, opt) {
                var xml_source = Ext.getDom("xml_source");
                if (xml_source != null) {
                    xml_source.innerHTML = res.responseText.toString();
                }
            },
            failure : function(res, opt) {
                Ext.Msg.alert(WIKIPEDIA_ONTOLOGY_SEARCH.resources.communicationError, WIKIPEDIA_ONTOLOGY_SEARCH.resources.status + res.status);
            }
        });
    }
};

