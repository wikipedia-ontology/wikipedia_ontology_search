/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

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

