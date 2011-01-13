/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

function getHelpPanel() {
    return new Ext.FormPanel({
        frame : true,
        labelWidth : 80,
        bodyStyle : 'padding: 10px;',
        layout : 'form',
        items : [
            {
                autoLoad : HELP_HTML
            }
        ]
    });
}
