/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getSourcePanel() {
    return new Ext.Panel({
        //        title : "RDF/XML",
        iconCls: 'icon-rdf',
        hideBorders : true,
        autoScroll : true,
        bodyStyle : 'font-size: 80%; padding: 10px;',
        items : [
            {
                id : "xml_source",
                html : ""
            }
        ]
    });
}

function reloadRDFSource(queryJSONTreeURL) {
    if (!show_rdf_xml) {
        return;
    }
    var queryDataURL = queryJSONTreeURL.replace("tree_data", "data");
    Ext.Ajax.request({
        url : queryDataURL,
        success : function(res, opt) {
            var xml_source = Ext.getDom("xml_source");
            if (xml_source != null) {
                xml_source.innerHTML = htmlEscape(res.responseText.toString());
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