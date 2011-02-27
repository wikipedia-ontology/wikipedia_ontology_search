/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var WIKIPEDIA_ONTOLOGY_SEARCH = {};

WIKIPEDIA_ONTOLOGY_SEARCH.resources = {
    appTitle: "Japanese Wikipedia Ontology Search Interface",
    keyword:  "Keyword",
    search:  "Search",
    domain : "Domain",
    range : "Range",
    classList : "Class List",
    propertyList : "Property List",
    instanceList : "Instance List",
    resourceType : "Type of Resource",
    searchTarget : "Search Target",
    useInferenceModel : "Use Inference Model",
    numberOfStatements : "Number of Statements",
    communicationError : "Communication Error",
    status : "Status",
    statement : "Statement",
    newTab : "New Tab",
    addTab : "Add Tab",
    openNewTab : "Open New Tab",
    openRDFFile : "Open RDF File",
    subject : "Subject",
    predicate : "Predicate",
    object : "Object",
    sortingOrder : "Sorting order",
    numberOfInstances : "Number of Instances",
    dateAndHour : "Date and Hour",
    registeredDateAndHour : "Registered Date and Hour",
    updateDateAndHour : "Update Date and Hour",
    sparqlQuery: "SPARQL Query",
    sparqlQueryDescription: "SPARQL Query Description",
    url : "URL",
    uri : "URI",
    searchHistory : "Search History",
    openSelectedHistory : "Open Selected History",
    addSelectedHistoriesToBookmark : "Add Selected Histories to Bookmark",
    removeSelectedHistories : "Remove Selected Histories",
    removeAllHistory : "Remove All History",
    bookmark : "Bookmark",
    openSelectedBookmark : "Open Selected Bookmark",
    removeSelectedBookmarks : "Remove Selected Bookmarks",
    import : "Import",
    export : "Export",
    importOrExportBookmarks : 'Import/Export Bookmarks',
    close : "Close",
    classHierarchy : "Class Hiearchy",
    wholeClassHierarchy : "Whole Class Hiearchy",
    findClassesOrInstances : "Find Classes or Instances",
    findClasses : "Find Classes",
    expandAll : "Expand All",
    collapseAll : "Collapse All",
    rootClass : "Root Class",
    bookmarkAndSearchHistory : "Bookmark and Search History",
    aboutClassHierarchy : "About Class Hiearchy",
    showClassHierarchy : "Show Class Hiearchy",
    expandAllClassHierarchy : "Expand All Class Hiearchy",
    aboutRDFXML : "About RDF/XML",
    aboutStatementTable : "About Statement Table",
    closeGroupingStatements : "Close Grouping Statements",
    option : "Option",
    versionInformation : "Version Information",
    tool : "Tool",
    help : "Help",
    version : "Version",
    showWholeClassHierarchy : "Show Whole Class Hiearchy",
    hierarchy : "Hiearchy",
    statisticsInformation : "Statistics Information",
    numberOfResources : "# Resources",
    numberOfClasses : "# Classes",
    numberOfProperties : "# Properties",
    numberOfInstances : "# Instances",
    totalNumberOfStatements : "# Statements: 7,588,865",
    numberOfIsaRelationships : "# Isa relationships",
    numberOfTypesOfInstances : "# Types of instances",
    menu : "Menu",
    sourceCode : "Source Code",
    language : "Language",
    english : "English",
    japanese : "日本語",
    loading : "Loading...",
    searching : "Searching・・・",
    helpHTML : "en_help.html",
    manual : "manual",
    manualHTML : "en_manual.html",
    searchEnHTML : "en_search.html",
    searchJaHTML : "search.html",

    getSearchKeywordLabel: function(keyword) {
        return "Search " + keyword;
    },
    getNarrowDownKeywordLabel: function(keyword) {
        return "Narrow Down " + keyword;
    },
    getAddKeywordToBookmarkLabel: function(keyword) {
        return "Add " + keyword + " to Bookmark";
    },
    getRemoveKeywordFromBookmarkLabel: function(keyword) {
        return "Remove " + keyword + " from Bookmark";
    },
    getRemoveKeywordFromHistoryLabel:function(keyword) {
        return "Remove " + keyword + " from Search History";
    }
}

var LOADING = "Loading...";

WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels = {
    class: "Class",
    property: "Property",
    instance: "Instance"
}

WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptionLabels = {
    uri: "URI" ,
    label: "Label"
}

// 検索オプション関連の定数
WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels = {
    search_option: "Search Option",
    exact_match: "Exact match",
    any_match: "Any match",
    starts_with: "Starts with",
    ends_with: "Ends with",
    sibling_classes: "Sibling classes",
    sub_classes: "Sub classes",
    properties_of_domain_class: "Properties of a domain class",
    properties_of_range_class: "Properties of a range class",
    domain_classes_of_property: "Domain classes of a property",
    range_classes_of_property: "Range classes of a property",
    instances_of_class: "Instances of a class",
    types_of_instance: "Types of an instance",
    inverse_statements: "Inverse statements",
    path_to_root_class: "Path to a root class"
};

WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels = {
    name_asc: "Name (ASC)",
    name_desc: "Name (DESC)",
    instance_count_asc: "Number of instances (ASC)",
    instance_count_desc: "Number of instances (DESC)"
}


