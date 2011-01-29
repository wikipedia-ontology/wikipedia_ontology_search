/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */
var HOME_URL = "http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/";

var CURRENT_WIKIPEDIA_ONTOLOGY_VERSION = "2010_11_14";
//var BASE_SERVER_URL = "http://zest.comp.ae.keio.ac.jp:8080/wikipedia_ontology_search/";
//var BASE_SERVER_URL = "http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/";
var BASE_SERVER_URL = "http://localhost:8080/wikipedia_ontology_search/";
//var BASE_SERVER_URL = "http://avalon.comp.ae.keio.ac.jp:8080/wikipedia_ontology_search/";

var BASE_URI = "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/";
var BASE_ICON_URL = "my_resources/icons/";
//var ALL_CLASSES = BASE_SERVER_CLASS_TREE_DATA_URL + "ALLClasses.json";
var ALL_CLASSES = BASE_SERVER_URL + "ALLClasses.json";

var CLASS_PATH = "class/";
var PROPERTY_PATH = "property/";
var INSTANCE_PATH = "instance/";
var DATA_PATH = "data/";
var JSON_EXTENSION = ".json";
var JSONP_EXTENSION = ".jsonp";
var ESCAPED_JSON_EXTENSION = "\.json";
var ESCAPED_JSONP_EXTENSION = "\.jsonp";

var BASE_CLASS_URI = BASE_URI + CLASS_PATH;
var BASE_PROPERTY_URI = BASE_URI + PROPERTY_PATH;
var BASE_INSTANCE_URI = BASE_URI + INSTANCE_PATH;

var BASE_SERVER_CLASS_URL = BASE_SERVER_URL + CLASS_PATH;
var BASE_SERVER_CLASS_DATA_URL = BASE_SERVER_CLASS_URL + DATA_PATH;

var BASE_SERVER_PROPERTY_URL = BASE_SERVER_URL + PROPERTY_PATH;
var BASE_SERVER_PROPERTY_DATA_URL = BASE_SERVER_PROPERTY_URL + DATA_PATH;

var BASE_SERVER_INSTANCE_URL = BASE_SERVER_URL + INSTANCE_PATH;
var BASE_SERVER_INSTANCE_DATA_URL = BASE_SERVER_INSTANCE_URL + DATA_PATH;

var NULL_DATA = BASE_SERVER_CLASS_DATA_URL + "NULL";
var NULL_TREE_DATA = BASE_SERVER_CLASS_DATA_URL + "NULL?extjs_json_format=tree";

var CLASS_LIST_DATA_URL = BASE_SERVER_URL + "class_list";
var PROPERTY_LIST_DATA_URL = BASE_SERVER_URL + "property_list";
var INSTANCE_LIST_DATA_URL = BASE_SERVER_URL + "instance_list";

var RESOURCE_LIST_SIZE_LIMIT = 50;
var HISTORY_PAGE_SIZE = 25;
var BOOKMARK_PAGE_SIZE = 25;
