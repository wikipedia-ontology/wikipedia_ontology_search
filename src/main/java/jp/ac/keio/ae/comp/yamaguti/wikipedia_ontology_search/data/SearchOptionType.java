/*
 * @(#)  2010/02/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

/**
 * @author takeshi morita
 */
public enum SearchOptionType {
    EXACT_MATCH, STARTS_WITH, ENDS_WITH, ANY_MATCH,
    SIBLINGS, SUB_CLASSES, PROPERTIES_OF_DOMAIN_CLASS, PROPERTIES_OF_RANGE_CLASS,
    DOMAIN_CLASSES_OF_PROPERTY, RANGE_CLASSES_OF_PROPERTY,
    INSTANCES_OF_CLASS, TYPES_OF_INSTANCE,
    INVERSE, PATH_TO_ROOT_CLASS, NONE
}
