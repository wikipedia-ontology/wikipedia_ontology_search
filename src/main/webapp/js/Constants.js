/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */


WIKIPEDIA_ONTOLOGY_SEARCH.constants = {
    HOME_URL:"http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/",
    CURRENT_WIKIPEDIA_ONTOLOGY_VERSION : "2010_11_14",
    // BASE_SERVER_URL: "http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/",
    BASE_SERVER_URL : "http://localhost:8080/wikipedia_ontology_search/",
    // BASE_SERVER_URL : "http://avalon.comp.ae.keio.ac.jp:8081/wikipedia_ontology_search/",
    BASE_URI : "http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/",
    BASE_ICON_URL : "my_resources/icons/",
    // ALL_CLASSES : BASE_SERVER_CLASS_TREE_DATA_URL + "ALLClasses.json",
    CLASS_PATH : "class/",
    PROPERTY_PATH : "property/",
    INSTANCE_PATH : "instance/",
    DATA_PATH : "data/",
    JSON_EXTENSION : ".json",
    JSONP_EXTENSION : ".jsonp",
    ESCAPED_JSON_EXTENSION : "\.json",
    ESCAPED_JSONP_EXTENSION : "\.jsonp",
    RESOURCE_LIST_SIZE_LIMIT : 50,
    HISTORY_PAGE_SIZE : 25,
    BOOKMARK_PAGE_SIZE : 25,
    BOOKMARK_RECORD_LENGTH : 8
};

WIKIPEDIA_ONTOLOGY_SEARCH.resourceURI = {
    BASE_CLASS_URI : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_URI + WIKIPEDIA_ONTOLOGY_SEARCH.constants.CLASS_PATH,
    BASE_PROPERTY_URI : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_URI + WIKIPEDIA_ONTOLOGY_SEARCH.constants.PROPERTY_PATH,
    BASE_INSTANCE_URI : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_URI + WIKIPEDIA_ONTOLOGY_SEARCH.constants.INSTANCE_PATH
};

WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL = {
    BASE_SERVER_CLASS_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.CLASS_PATH,
    BASE_SERVER_PROPERTY_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.PROPERTY_PATH,
    BASE_SERVER_INSTANCE_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.INSTANCE_PATH
};

WIKIPEDIA_ONTOLOGY_SEARCH.dataUrl = {
    ALL_CLASSES : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + "ALLClasses.json",
    BASE_SERVER_CLASS_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL.BASE_SERVER_CLASS_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH,
    BASE_SERVER_PROPERTY_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL.BASE_SERVER_PROPERTY_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH,
    BASE_SERVER_INSTANCE_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL.BASE_SERVER_INSTANCE_URL + WIKIPEDIA_ONTOLOGY_SEARCH.constants.DATA_PATH,
    CLASS_LIST_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + "class_list",
    PROPERTY_LIST_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + "property_list",
    INSTANCE_LIST_DATA_URL : WIKIPEDIA_ONTOLOGY_SEARCH.constants.BASE_SERVER_URL + "instance_list",
    NULL_DATA : WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL.BASE_SERVER_CLASS_DATA_URL + "NULL",
    NULL_TREE_DATA : WIKIPEDIA_ONTOLOGY_SEARCH.resourceURL.BASE_SERVER_CLASS_DATA_URL + "NULL?extjs_json_format:tree"
};

WIKIPEDIA_ONTOLOGY_SEARCH.searchOptions = {
    exact_match: "exact_match",
    any_match: "any_match",
    starts_with: "starts_with",
    ends_with: "ends_with",
    sibling_classes: "sibling_classes",
    sub_classes: "sub_classes",
    properties_of_domain_class: "properties_of_domain_class",
    properties_of_range_class: "properties_of_range_class",
    domain_classes_of_property: "domain_classes_of_property",
    range_classes_of_property: "range_classes_of_property",
    instances_of_class: "instances_of_class",
    types_of_instance: "types_of_instance",
    inverse_statements: "inverse_statements",
    path_to_root_class: "path_to_root_class"
};

WIKIPEDIA_ONTOLOGY_SEARCH.parameterKeys = {
    date: "date" ,
    resource_type: "resource_type",
    search_target: "search_target",
    resource_name: "resource_name",
    search_option: "search_option",
    version: "version",
    uri: "uri",
    inference_type: "inference_type"
};

WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptions = {
    rdfs: "rdfs",
    none: "none"
};

WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptions = {
    uri: "uri" ,
    label: "label"
}

WIKIPEDIA_ONTOLOGY_SEARCH.queryTypes = {
    class: "class",
    property: "property",
    instance: "instance"
}

WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptions = {
    name_asc: "name_asc",
    name_desc: "name_desc",
    instance_count_asc: "instance_count_asc",
    instance_count_desc: "instance_count_desc"
}

