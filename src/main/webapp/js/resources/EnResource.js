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
var SEARCH_HISTORY = "Search History";
var OPEN_SELECTED_HISTORY = "Open Selected History";
var ADD_SELECTED_HISTORIES_TO_BOOKMARK = "Add Selected Histories to Bookmark";
var REMOVE_SELECTED_HISTORIES = "Remove Selected Histories";
var REMOVE_ALL_HISTORY = "Remove All History";
var BOOKMARK = "Bookmark";
var OPEN_SELECTED_BOOKMARK = "Open Selected Bookmark";
var ADD_CURRENT_KEYWORD_TO_BOOKMARK = "Add Current Keyword to Bookmark";
var REMOVE_SELECTED_BOOKMARKS = "Remove Selected Bookmarks";
var IMPORT = "Import";
var EXPORT = "Export";
var IMPORT_OR_EXPORT_BOOKMARKS = 'Import/Export Bookmarks';
var CLOSE = "Close";
var CLASS_HIERARCHY_AND_INSTANCES = "Class Hiearchy and Instances";
var WHOLE_CLASS_HIEARCHY = "Whole Class Hiearchy";
var FIND_CLASSES_OR_INSTANCES = "Find Classes or Instances";
var FIND_CLASSES = "Find Classes";
var EXPAND_ALL = "Expand All";
var COLLAPSE_ALL = "Collapse All";
var ROOT_CLASS = "Root Class";
var BOOKMARK_AND_SEARCH_HISTORY = "Bookmark and Search History";
var ABOUT_CLASS_HIEARCHY_AND_INSTANCE = "About Class Hiearchy and Instance";
var SHOW_CLASS_HIERARCHY_AND_INSTANCES = "Show Class Hiearchy and Instances";
var EXPAND_ALL_CLASS_HIEARCHY_AND_INSTANCES = "Expand All Class Hiearchy and Instances";
var ABOUT_RDF_XML = "About RDF/XML";
var SHOW_RDF_XML = "Show RDF/XML";
var ABOUT_STATEMENT_TABLE = "About Statement Table";
var CLOSE_GROUPING_STATEMENTS = "Close Grouping Statements";
var OPTION = "Option";
var VERSION_INFORMATION = "Version Information";
var TOOL = "Tool";
var HELP = "Help";
var VERSION = "Version";
var SHOW_WHOLE_CLASS_HIEARCHY = "Show Whole Class Hiearchy";
var HIEARCHY = "Hiearchy";
var RDF_XML_MESSAGE = "RDF/XMLタブを選択後，検索を行うとソースコードが表示されます．";
var LANGUAGE = "Language";
var ENGLISH = "English";
var JAPANESE = "Japanese";
var LOADING = "Loading...";
var SEARCHING = "Searching・・・";
var HELP_HTML = "en_help.html";
var MANUAL = "manual";
var MANUAL_HTML = "en_manual.html";
var SEARCH_EN_HTML = "en_search.html";
var SEARCH_JA_HTML = "search.html";

var SEARCH_OPTION = "Search Option";
var SEARCH_OPTION_EXACT_MATCH = "Exact match";
var SEARCH_OPTION_ANY_MATCH = "Any match";
var SEARCH_OPTION_STARTS_WITH = "Starts with";
var SEARCH_OPTION_ENDS_WITH = "Ends with";
var SEARCH_OPTION_SIBLING_CLASSES = "Sibling Classes";
var SEARCH_OPTION_SUB_CLASSES = "Sub Classes";
var SEARCH_OPTION_PROPERTIES_OF_DMAIN_CLASS = "Properties of Domain Class";
var PROPERTIES_OF_DOMAIN_CLASS = SEARCH_OPTION_PROPERTIES_OF_DMAIN_CLASS;
var SEARCH_OPTION_PROPERTIES_OF_RANGE_CLASS = "Properties of Range Class";
var PROPERTIES_OF_RANGE_CLASS = SEARCH_OPTION_PROPERTIES_OF_RANGE_CLASS;

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