/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getSourcePanel() {

    var uriPanel = new Ext.Panel({
        frame : true,
        height: 30,
        bodyStyle : 'padding: 10px;',
        layout: 'border',
        items : [
            {
                region: 'west',
                xtype: 'label',
                text: URI,
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
        //        title : "RDF/XML",
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
}

function reloadRDFSource(queryDataURL) {
    queryDataURL = queryDataURL.replace(ESCAPED_EXTENSION, "");
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
            Ext.Msg.alert(COMMUNICATION_ERROR, STATUS + res.status);
        }
    });
}

function htmlEscape(s) {
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/ /g, '&nbsp;');
    s = s.replace(/\t/g, '&nbsp;&nbsp;');
    s = s.replace(/\n/g, '<BR>');
    return s;
}