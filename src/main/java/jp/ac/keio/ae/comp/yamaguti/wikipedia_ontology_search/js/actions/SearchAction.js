function getQueryType() {
	if (Ext.getDom('class_button').checked) {
		return 'class';
	} else if (Ext.getDom('property_button').checked) {
		return 'property';
	} else if (Ext.getDom('instance_button').checked) {
		return 'instance';
	}
}

function searchWikipediaOntology() {
	queryType = getQueryType();
	var keyword = Ext.getCmp('SearchPanel').getForm().findField('keyword')
			.getValue();
	if (0 < keyword.length) {
		searchWikipediaOntology2(keyword);
	}
}

function searchWikipediaOntology2(keyword) {
	var keywords = keyword.split(/\s+/);
	var queryURL = BASE_SERVER_URL;
	var unescapeQueryURL = BASE_URI;
	var searchOptionSelection = Ext.getCmp('Resource_Search_Option');
	var searchOption = "search_option=" + searchOptionSelection.getValue();

	if (1 < keywords.length) {
		queryURL += 'class/json_table/' + "queryString?";
		unescapeQueryURL += 'class/data/' + "queryString?";
		for (var i = 0; i < keywords.length; i++) {
			queryURL += "type=" + EscapeSJIS(keywords[i]);
			unescapeQueryURL += "type=" + keywords[i];
			if (i != keywords.length - 1) {
				queryURL += "&";
				unescapeQueryURL += "&";
			}
		}
		reloadWikiOntJSONData1(queryURL, unescapeQueryURL, keywords);
	} else {
		queryURL += queryType + '/json_table/' + keyword;
		if (searchOptionSelection.getValue() != "exact_match") {
			queryURL += '?' + searchOption;
		}
		reloadWikiOntJSONData2(queryURL, keyword);
	}
}

function setUseInfModelOption(queryURL) {
	if (useInfModel) {
		if (queryURL.indexOf("class") != -1) {
			return queryURL.replace("class/", "class/rdfs_inference/");
		} else if (queryURL.indexOf("property") != -1) {
			return queryURL.replace("property/", "property/rdfs_inference/");
		} else if (queryURL.indexOf("instance") != -1) {
			return queryURL.replace("instance/", "instance/rdfs_inference/");
		}
	}
	return queryURL;
}

function reloadWikiOntJSONData1(queryURL, unescapeQueryURL, keywords) {
	var searchPanel = Ext.getCmp('SearchPanel');
	queryURL = setUseInfModelOption(queryURL);
	searchPanel.getForm().findField('keyword').setValue(keywords.join(" "));
	Ext.getDom('class_button').checked = true;
	currentURI = unescapeQueryURL;
	currentURI = setUseInfModelOption(currentURI);
	writeStatusBar();
	addHistoryData();
	reloadWikiOntJSONData(queryURL);
}

function reloadWikiOntJSONData2(queryURL, keyword) {
	var searchPanel = Ext.getCmp('SearchPanel');
	queryURL = setUseInfModelOption(queryURL);
	if (queryType == 'class') {
		searchPanel.getForm().findField('keyword').setValue(keyword);
		Ext.getDom('class_button').checked = true;
		currentURI = BASE_CLASS_URI + keyword;
		currentURI = setUseInfModelOption(currentURI);
		writeStatusBar();
	} else if (queryType == 'property') {
		searchPanel.getForm().findField('keyword').setValue(keyword);
		Ext.getDom('property_button').checked = true;
		currentURI = BASE_PROPERTY_URI + keyword;
		currentURI = setUseInfModelOption(currentURI);
		writeStatusBar();
	} else if (queryType == 'instance') {
		searchPanel.getForm().findField('keyword').setValue(keyword);
		Ext.getDom('instance_button').checked = true;
		currentURI = BASE_INSTANCE_URI + keyword;
		currentURI = setUseInfModelOption(currentURI);
		writeStatusBar();
	}
	addHistoryData();
	reloadWikiOntJSONData(queryURL);
}

function writeStatusBar() {
	Ext.getCmp('statusBar').setStatus({
		text : '<span style="color: white; font-weight: bold;">URI: '
				+ currentURI + '</span>'
	});
}