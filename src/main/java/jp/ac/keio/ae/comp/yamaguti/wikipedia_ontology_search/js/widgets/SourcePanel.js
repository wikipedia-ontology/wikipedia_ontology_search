function getSourcePanel() {
    return new Ext.Panel({
        title : "RDF/XML",
        hideBorders : true,
        autoScroll : true,
        bodyStyle : 'font-size: 80%; padding: 10px;',
        items : [
            {
                id : "xml_source",
                html : "<h1>" + RDF_XML_MESSAGE + "</h1>"
            }
        ]
    });
}

function reloadRDFSource(queryJSONTreeURL) {
    if (!show_rdf_xml) {
        return;
    }
    var queryDataURL = queryJSONTreeURL.replace("json_tree", "data");
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