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
var RESOURCE_TYPE_PARAMETER_KEY = "resource_type";
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
var ABOUT_STATEMENT_TABLE = "About Statement Table";
var CLOSE_GROUPING_STATEMENTS = "Close Grouping Statements";
var OPTION = "Option";
var VERSION_INFORMATION = "Version Information";
var TOOL = "Tool";
var HELP = "Help";
var VERSION = "Version";
var SHOW_WHOLE_CLASS_HIEARCHY = "Show Whole Class Hiearchy";
var HIEARCHY = "Hiearchy";

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

// parameter keys
var RESOURCE_TYPE_PARAMETER_KEY = "resource_type";
var SEARCH_TARGET_PARAMETER_KEY = "search_target";
var RESOURCE_NAME_PARAMETER_KEY = "resource_name";
var SEARCH_OPTION_PARAMETER_KEY = "search_option";
var VERSION_PARAMETER_KEY = "version";
var URI_PARAMETER_KEY = "uri";
var INFERNCE_TYPE_PARAMETER_KEY = "inference_type";

//inference type
var NONE_INFERENCE = "None";
var NONE_INFERENCE_OPTION = "none";
var RDFS_INFERENCE = "RDFS";
var RDFS_INFERENCE_OPTION = "rdfs";

// queryType
var QTYPE_CLASS = 'class';
var QTYPE_PROPERTY = 'property';
var QTYPE_INSTANCE = 'instance';

//searchTarget
var URI = "URI";
var URI_SEARCH_TARGET_OPTION = "uri";
var LABEL = "Label";
var LABEL_SEARCH_TARGET_OPTION = "label";

var SEARCH_OPTION = "Search Option";
var EXACT_MATCH = "Exact match";
var EXACT_MATCH_SEARCH_OPTION = "exact_match";
var ANY_MATCH = "Any match";
var ANY_MATCH_SEARCH_OPTION = "any_match";
var STARTS_WITH = "Starts with";
var STARTS_WITH_SEARCH_OPTION = "starts_with";
var ENDS_WITH = "Ends with";
var ENDS_WITH_SEARCH_OPTION = "ends_with";
var SIBLING_CLASSES = "Sibling Classes";
var SIBLING_CLASSES_SEARCH_OPTION = "sibling_classes";
var SUB_CLASSES = "Sub Classes";
var SUB_CLASSES_SEARCH_OPTION = "sub_classes";
var PROPERTIES_OF_DOMAIN_CLASS = "Properties of a domain class";
var PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION = "properties_of_domain_class";
var PROPERTIES_OF_RANGE_CLASS = "Properties of a range class";
var PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION = "properties_of_range_class";
var DOMAIN_CLASSES_OF_PROPERTY = "Domain classes of a property";
var DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION = "domain_classes_of_property";
var RANGE_CLASSES_OF_PROPERTY = "Range classes of a property";
var RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION = "range_classes_of_property";
var INSTANCES_OF_CLASS = "Instances of a class";
var INSTANCES_OF_CLASS_SEARCH_OPTION = "instances_of_class";
var TYPES_OF_INSTANCE = "Types of a instance";
var TYPES_OF_INSTANCE_SEARCH_OPTION = "types_of_instance";
var INVERSE_STATEMENTS = "Inverse statements";
var INVERSE_STATEMENTS_SEARCH_OPTION = "inverse";
var PATH_TO_ROOT_CLASS = "Path to root class";
var PATH_TO_ROOT_CLASS_SEARCH_OPTION = "path_to_root_class";

// order by 関連の定数
var NAME_ASC = "Name (ASC)";
var NAME_ASC_OPTION = "name_asc";
var NAME_DESC = "Name (DESC)";
var NAME_DESC_OPTION = "name_desc";
var INSTANCE_COUNT_ASC = "Number of instances (ASC)";
var INSTANCE_COUNT_ASC_OPTION = "instance_count_asc";
var INSTANCE_COUNT_DESC = "Number of instances (DESC)";
var INSTANCE_COUNT_DESC_OPTION = "instance_count_desc";

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