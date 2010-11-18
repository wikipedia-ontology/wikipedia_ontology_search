function getNumberOfStatementsSelectionPanel() {
	var itemList = new Ext.data.ArrayStore({
				fields : ['string', 'number'],
				data : [["50", 50], ["100", 100], ["150", 150], ["200", 200],
						["250", 250], ["300", 300]]
			});

	return new Ext.form.ComboBox({
				id : 'numberOfStatementsSelection',
				store : itemList,
				displayField : 'string',
				typeAhead : true,
				mode : 'local',
				triggerAction : 'all',
				selectOnFocus : true
			});
}