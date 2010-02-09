function getSearchPanel() {

	var searchOptionSelection = getSearchOptionComboBox('Resource_Search_Option');
	var numberOfStatementsSelection = getNumberOfStatementsSelectionPanel();
	numberOfStatementsSelection.setValue("100");

	var searchField = {
		border : false,
		autoHeight : true,
		fieldLabel : KEYWORD,
		layout : 'column',
		items : [searchOptionSelection, {
					xtype : 'textfield',
					name : 'keyword',
					width : 250
				}, {
					xtype : 'button',
					text : SEARCH,
					name : 'search-button',
					// searchWikipediaOntology function is defined in
					// SearchAction.js
					handler : searchWikipediaOntology
				}]
	};

	var queryTypeRadioButtons = {
		border : false,
		xtype : 'radiogroup',
		autoHeight : true,
		layout : 'column',
		items : [{
					checked : true,
					boxLabel : CLASS,
					name : 'query-type',
					id : 'class_button'
				}, {
					boxLabel : PROPERTY,
					name : 'query-type',
					id : 'property_button'
				}, {
					boxLabel : INSTANCE,
					name : 'query-type',
					id : 'instance_button'
				}, {
					xtype : 'checkbox',
					boxLabel : USE_INFERENCE_MODEL,
					id : 'use_inf_model',
					handler : setUseInfModel
				}]
	};

	function setUseInfModel() {
		useInfModel = Ext.getDom('use_inf_model').checked;
	}

	return new Ext.FormPanel({
				id : "SearchPanel",
				frame : true,
				labelWidth : 150,
				bodyStyle : 'padding: 10px;',
				layout : 'form',
				items : [searchField, {
							bodyStyle : 'padding-top: 10px;',
							fieldLabel : SEARCH_TARGET,
							border : false,
							width : 500,
							items : queryTypeRadioButtons
						}, {
							fieldLabel : NUMBER_OF_STATEMENTS,
							items : numberOfStatementsSelection
						}]
			});
}