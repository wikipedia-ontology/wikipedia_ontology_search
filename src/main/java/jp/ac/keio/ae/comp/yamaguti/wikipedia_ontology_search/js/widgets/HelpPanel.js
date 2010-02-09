function getHelpPanel() {
	return new Ext.FormPanel({
				frame : true,
				labelWidth : 80,
				bodyStyle : 'padding: 10px;',
				layout : 'form',
				items : [{
							autoLoad : HELP_HTML
						}]
			});
}
