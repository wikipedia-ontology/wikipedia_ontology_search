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
				buttons : [new Ext.Button({
							text : CLOSE,
							handler : function() {
								Ext.getCmp("VersionInfoDialog")
										.setVisible(false);
							}
						})]
			});
}

function showVersionInfoDialog() {
	Ext.getCmp("VersionInfoDialog").show();
}