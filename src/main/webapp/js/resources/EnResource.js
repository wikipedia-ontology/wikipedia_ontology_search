/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var APP_TITLE = "Japanese Wikipedia Ontology Search Interface";
var KEYWORD = "Keyword";
var SEARCH = "Search";
var CLASS = "Class";
var DOMAIN = "Domain";
var RANGE = "Range";
var CLASS_LIST = "Class List";
var PROPERTY = "Property";
var PROPERTY_LIST = "Property List";
var INSTANCE = "Instance";
var INSTANCE_LIST = "Instance List";
var RESOURCE_TYPE = "Type of Resource";
var SEARCH_TARGET = "Search Target";
var USE_INFERENCE_MODEL = "Use Inference Model";
var NUMBER_OF_STATEMENTS = "Number of Statements";
var COMMUNICATION_ERROR = "Communication Error";
var STATUS = "Status";
var STATEMENT = "Statement";
var NEW_TAB = "New Tab";
var ADD_TAB = "Add Tab";
var OPEN_NEW_TAB = "Open New Tab";
var OPEN_RDF_FILE = "Open RDF File";
var SUBJECT = "Subject";
var PREDICATE = "Predicate";
var OBJECT = "Object";
var SORTING_ORDER = "Sorting order";
var NUMBER_OF_INSTANCES = "Number of Instances";
var DATE_AND_HOUR = "Date and Hour";
var URL = "URL";
var URI = "URI";
var SEARCH_HISTORY = "Search History";
var OPEN_SELECTED_HISTORY = "Open Selected History";
var ADD_SELECTED_HISTORIES_TO_BOOKMARK = "Add Selected Histories to Bookmark";
var REMOVE_SELECTED_HISTORIES = "Remove Selected Histories";
var REMOVE_ALL_HISTORY = "Remove All History";
var BOOKMARK = "Bookmark";
var OPEN_SELECTED_BOOKMARK = "Open Selected Bookmark";
var REMOVE_SELECTED_BOOKMARKS = "Remove Selected Bookmarks";
var IMPORT = "Import";
var EXPORT = "Export";
var IMPORT_OR_EXPORT_BOOKMARKS = 'Import/Export Bookmarks';
var CLOSE = "Close";
var CLASS_HIERARCHY = "Class Hiearchy";
var WHOLE_CLASS_HIERARCHY = "Whole Class Hiearchy";
var FIND_CLASSES_OR_INSTANCES = "Find Classes or Instances";
var FIND_CLASSES = "Find Classes";
var EXPAND_ALL = "Expand All";
var COLLAPSE_ALL = "Collapse All";
var ROOT_CLASS = "Root Class";
var BOOKMARK_AND_SEARCH_HISTORY = "Bookmark and Search History";
var ABOUT_CLASS_HIERARCHY = "About Class Hiearchy";
var SHOW_CLASS_HIERARCHY = "Show Class Hiearchy";
var EXPAND_ALL_CLASS_HIERARCHY = "Expand All Class Hiearchy";
var ABOUT_RDF_XML = "About RDF/XML";
var ABOUT_STATEMENT_TABLE = "About Statement Table";
var CLOSE_GROUPING_STATEMENTS = "Close Grouping Statements";
var OPTION = "Option";
var VERSION_INFORMATION = "Version Information";
var TOOL = "Tool";
var HELP = "Help";
var VERSION = "Version";
var SHOW_WHOLE_CLASS_HIERARCHY = "Show Whole Class Hiearchy";
var HIERARCHY = "Hiearchy";

var STATISTICS_INFORMATION = "Statistics Information";
var NUMBER_OF_RESOURCES = "# Resources";
var NUMBER_OF_CLASSES = "# Classes";
var NUMBER_OF_PROPERTIES = "# Properties";
var NUMBER_OF_INSTANCES = "# Instances";
var TOTAL_NUMBER_OF_STATEMENTS = "# Statements: 7,588,865";
var NUMBER_OF_ISA_RELATIONSHIPS = "# Isa relationships";
var NUMBER_OF_TYPES_OF_INSTANCES = "# Types of instances";

var MENU = "Menu";
var SOURCE_CODE = "Source Code";
var BOOKMARK_RECORD_LENGTH = 8;

var LANGUAGE = "Language";
var ENGLISH = "English";
var JAPANESE = "日本語";
var LOADING = "Loading...";
var SEARCHING = "Searching・・・";
var HELP_HTML = "en_help.html";
var MANUAL = "manual";
var MANUAL_HTML = "en_manual.html";
var SEARCH_EN_HTML = "en_search.html";
var SEARCH_JA_HTML = "search.html";

var WIKIPEDIA_ONTOLOGY_SEARCH = {};

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

function getSearchKeywordLabel(keyword) {
    return "Search " + keyword;
}

function getNarrowDownKeywordLabel(keyword) {
    return "Narrow Down " + keyword;
}

function getAddKeywordToBookmarkLabel(keyword) {
    return "Add " + keyword + " to Bookmark";
}

function getRemoveKeywordFromBookmarkLabel(keyword) {
    return "Remove " + keyword + " from Bookmark";
}

function getRemoveKeywordFromHistoryLabel(keyword) {
    return "Remove " + keyword + " from Search History";
}