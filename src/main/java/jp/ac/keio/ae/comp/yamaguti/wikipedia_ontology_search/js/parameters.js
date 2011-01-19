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
var BASE_URI = "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/";
var BASE_ICON_URL = "resources/jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.SearchPage/myresources/icons/";

var CLASS_PATH = "class/";
var PROPERTY_PATH = "property/";
var INSTANCE_PATH = "instance/";
var DATA_PATH = "data/";
var TABLE_DATA_PATH = "table_data/";
var TREE_DATA_PATH = "tree_data/";

var BASE_CLASS_URI = BASE_URI + CLASS_PATH;
var BASE_PROPERTY_URI = BASE_URI + PROPERTY_PATH;
var BASE_INSTANCE_URI = BASE_URI + INSTANCE_PATH;

var BASE_SERVER_CLASS_URL = BASE_SERVER_URL + CLASS_PATH;
var BASE_SERVER_CLASS_DATA_URL = BASE_SERVER_CLASS_URL + DATA_PATH;
var BASE_SERVER_CLASS_TABLE_DATA_URL = BASE_SERVER_CLASS_URL + TABLE_DATA_PATH;
var BASE_SERVER_CLASS_TREE_DATA_URL = BASE_SERVER_CLASS_URL + TREE_DATA_PATH;

var BASE_SERVER_PROPERTY_URL = BASE_SERVER_URL + PROPERTY_PATH;
var BASE_SERVER_PROPERTY_DATA_URL = BASE_SERVER_PROPERTY_URL + DATA_PATH;
var BASE_SERVER_PROPERTY_TABLE_DATA_URL = BASE_SERVER_PROPERTY_URL + TABLE_DATA_PATH;
var BASE_SERVER_PROPERTY_TREE_DATA_URL = BASE_SERVER_PROPERTY_URL + TREE_DATA_PATH;

var BASE_SERVER_INSTANCE_URL = BASE_SERVER_URL + INSTANCE_PATH;
var BASE_SERVER_INSTANCE_DATA_URL = BASE_SERVER_INSTANCE_URL + DATA_PATH;
var BASE_SERVER_INSTANCE_TABLE_DATA_URL = BASE_SERVER_INSTANCE_URL + TABLE_DATA_PATH;
var BASE_SERVER_INSTANCE_TREE_DATA_URL = BASE_SERVER_INSTANCE_URL + TREE_DATA_PATH;

var NULL_TABLE_DATA = BASE_SERVER_CLASS_TABLE_DATA_URL + "NULL";
var NULL_TREE_DATA = BASE_SERVER_CLASS_TREE_DATA_URL + "NULL";
//var ALL_CLASSES = BASE_SERVER_CLASS_TREE_DATA_URL + "ALLClasses.json";
var ALL_CLASSES = BASE_SERVER_URL + "ALLClasses.json";

var HISTORY_PAGE_SIZE = 25;
var BOOKMARK_PAGE_SIZE = 25;
