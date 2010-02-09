/*
 * @(#)  2010/02/03
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;

/**
 * @author takeshi morita
 */
public class PropertyImpl implements Serializable {

    private String uri;
    private String name;
    private String value;
    private int numberOfInstances;

    public PropertyImpl(PropertyStatistics p) {
        uri = p.getURI();
        name = p.getName();
        numberOfInstances = p.getNumberOfInstances();
    }

    public PropertyImpl(String uri, String name) {
        this.uri = uri;
        this.name = name;
    }

    public PropertyImpl(String uri, String name, String value) {
        this(uri, name);
        this.value = value;
    }

    public int getNumberOfInstances() {
        return numberOfInstances;
    }

    public String getURI() {
        return uri;
    }
    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object p1) {
        return ((PropertyImpl) p1).getURI().equals(this.getURI());
    }

    @Override
    public int hashCode() {
        return getURI().hashCode();
    }
}
