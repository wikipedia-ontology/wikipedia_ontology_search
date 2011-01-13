/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */
function getVersionInfoDialog() {
    var helpPanel = getHelpPanel();
    return new Ext.Window({
        id : 'VersionInfoDialog',
        title : VERSION_INFORMATION,
        width : 600,
        height : 330,
        autoScroll : true,
        modal : true,
        items : helpPanel,
        iconCls: 'icon-information',
        buttons : [new Ext.Button({
            text : CLOSE,
            handler : function() {
                Ext.getCmp("VersionInfoDialog").setVisible(false);
            }
        })]
    });
}

function showVersionInfoDialog() {
    Ext.getCmp("VersionInfoDialog").show();
}