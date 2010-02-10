function getSearchOptionComboBox(name) {
	var searchOptionList = new Ext.data.ArrayStore({
				fields : ["Search_Option", "Search_Option_Value"],
				data : [[SEARCH_OPTION_EXACT_MATCH, "exact_match"],
						[SEARCH_OPTION_ANY_MATCH, "any_match"],
						[SEARCH_OPTION_STARTS_WITH, "starts_with"],
						[SEARCH_OPTION_ENDS_WITH, "ends_with"]]
			});

	var comboBox = new Ext.form.ComboBox({
				id : name,
				displayField : 'Search_Option',
				valueField : 'Search_Option_Value',
				triggerAction : "all",
				width : 100,
				editable : false,
				mode : "local",
				store : searchOptionList
			});
	comboBox.setValue('exact_match');
	return comboBox;
}

function renderKeyword(value, metadata, record) {
	if (record.get("queryType") == 'class') {
		return "<img src='" + BASE_ICON_URL + "class_icon_s.png'/> " + value;
		a
	} else if (record.get("queryType") == 'property') {
		return "<img src='" + BASE_ICON_URL + "property_icon_s.png'/> " + value;
	} else if (record.get("queryType") == 'instance') {
		return "<img src='" + BASE_ICON_URL + "instance_icon_s.png'/> "
				+ value;
	}
	return value;
}

function makeClassContextMenu(keyword) {
	return new Ext.menu.Menu({
				style : {
					overflow : 'visible'
				},
				items : [{
					text : getSearchKeywordLabel(keyword),
					handler : function() {
						setQueryType();
						var searchPanel = Ext.getCmp("SearchPanel");
						searchPanel.getForm().findField('keyword')
								.setValue(keyword);
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						searchWikipediaOntology()
					}
				}, {
					text : getNarrowDownKeywordLabel(keyword),
					handler : function() {
						setQueryType();
						var searchPanel = Ext.getCmp("SearchPanel");
						var currentKeyword = searchPanel.getForm()
								.findField('keyword').getValue();
						searchPanel.getForm().findField('keyword')
								.setValue(currentKeyword + " " + keyword);
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						searchWikipediaOntology()
					}
				}, {
					text : getAddKeywordToBookmarkLabel(keyword),
					handler : function() {
						setQueryType();
						var searchPanel = Ext.getCmp("SearchPanel");
						searchPanel.getForm().findField('keyword')
								.setValue(keyword);
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						searchWikipediaOntology();
						addBookmark();
					}
				}]
			});
}

function makeInstanceAndPropertyContextMenu(keyword) {
	return new Ext.menu.Menu({
				style : {
					overflow : 'visible'
				},
				items : [{
					text : getSearchKeywordLabel(keyword),
					handler : function() {
						setQueryType();
						var searchPanel = Ext.getCmp("SearchPanel");
						searchPanel.getForm().findField('keyword')
								.setValue(keyword);
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						searchWikipediaOntology()
					}
				}, {
					text : getAddKeywordToBookmarkLabel(keyword),
					handler : function() {
						setQueryType();
						var searchPanel = Ext.getCmp("SearchPanel");
						searchPanel.getForm().findField('keyword')
								.setValue(keyword);
						var searchOptionSelection = Ext
								.getCmp('Resource_Search_Option');
						searchOptionSelection.setValue('exact_match');
						searchWikipediaOntology();
						addBookmark();
					}
				}]
			});
}

function makePropertyContextMenu(keyword) {
	return makeInstanceAndPropertyContextMenu(keyword);
}

function makeInstanceContextMenu(keyword) {
	return makeInstanceAndPropertyContextMenu(keyword);
}

function renderSearchOption(value, metadata, record) {
	var searchOption = record.get('searchOption');
	if (searchOption == 'exact_match') {
		return SEARCH_OPTION_EXACT_MATCH;
	} else if (searchOption == 'any_match') {
		return SEARCH_OPTION_ANY_MATCH;
	} else if (searchOption == 'starts_with') {
		return SEARCH_OPTION_STARTS_WITH;
	} else if (searchOption == 'ends_with') {
		return SEARCH_OPTION_ENDS_WITH;
	}
	return SEARCH_OPTION_EXACT_MATCH;
}

function openHistoryAndBookmarkData(record) {
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
	var keyword = record.get('keyword');
	queryType = record.get('queryType');
	setQueryType();
	useInfModel = record.get('useInfModel');
	Ext.getDom('use_inf_model').checked = useInfModel;
	searchOptionSelection.setValue(record.get('searchOption'));
	searchWikipediaOntology2(keyword);
}

function setQueryType() {
	if (queryType == 'class') {
		Ext.getDom('class_button').checked = true;
	} else if (queryType == 'property') {
		Ext.getDom('property_button').checked = true;
	} else if (queryType == 'instance') {
		Ext.getDom('instance_button').checked = true;
	}
}

/**
 * 現状では利用していない
 */
function getDataFromCookie(dataType) {
	var cookieNum = 0;
	var data = [];
	if (cookieProvider.get(dataType + "0") != null
			&& cookieProvider.get(dataType + "0")[0] != undefined) {
		for (var i = 0; cookieProvider.get(dataType + i) != null; i++) {
			data = data.concat(cookieProvider.get(dataType + i));
			cookieNum++;
		}
	}
	return [data, cookieNum];
}

/**
 * クッキーには4kbしか保存できず，限界を超えるとアプリが起動できなくなるので，クッキーには保存しない 現在利用していない．
 */
var maxCookieNum = 3;
function saveDataToCookie(store, dataType, prevCookieNum) {
	var data = [];
	var cookieNum = 0;
	store.each(function(record) {
				data.push([record.get('date'), record.get('keyword'),
						record.get('searchOption'), record.get('queryType'),
						record.get('useInfModel'), record.get('URL')]);
				if (data.length == 5) {
					if (cookieNum < maxCookieNum) {
						cookieProvider.set(dataType + cookieNum, data);
					}
					cookieNum++;
					data = [];
				}
			});

	if (0 < data.length && cookieNum < maxCookieNum) {
		cookieProvider.set(dataType + cookieNum, data);
	}
	if (maxCookieNum < cookieNum) {
		cookieNum = maxCookieNum
	}
	for (var i = cookieNum; i < prevCookieNum; i++) {
		cookieProvider.set(dataType + i, []);
	}
	return cookieNum;
}