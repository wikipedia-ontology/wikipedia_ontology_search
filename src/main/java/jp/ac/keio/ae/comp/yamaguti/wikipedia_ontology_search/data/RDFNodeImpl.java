/*
 * @(#)  2010/02/03
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;

/**
 * @author takeshi morita
 */
public class RDFNodeImpl implements Serializable {
    private String name;
    private String url;
    private boolean isResource;

    public RDFNodeImpl(String name, String url, boolean isResource) {
        this.name = name;
        this.url = url;
        this.isResource = isResource;
    }

    public String getName() {
        return name;
    }

    public String getURL() {
        return url;
    }

    public boolean isResource() {
        return isResource;
    }

    public boolean isLiteral() {
        return !isResource();
    }

    @Override
    public boolean equals(Object obj) {
        return ((RDFNodeImpl) obj).getName().equals(this.getName());
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}
