/*
 * @(#)  2010/02/03
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;

/**
 * @author takeshi morita
 */
public class ClassImpl implements Serializable {

    private String uri;
    private String lang;
    private String clsName;
    private int instanceCount;

    public ClassImpl(TypeStatistics t) {
        clsName = t.getName();
        uri = t.getURI();
    }

    public ClassImpl(String lang, String uri, String label) {
        this.lang = lang;
        this.uri = uri;
        this.clsName = label;
    }

    public ClassImpl(ClassStatistics cs) {
        lang = cs.getLanguage();
        clsName = cs.getClassName();
        uri = WikipediaOntologyStorage.CLASS_NS + clsName;
        instanceCount = cs.getInstanceCount();
    }

    public String getURI() {
        return uri;
    }

    public String getClassName() {
        return clsName;
    }

    public int getInstanceCount() {
        return instanceCount;
    }

    public String getLanguage() {
        return lang;
    }

    @Override
    public boolean equals(Object obj) {
        return ((ClassImpl) obj).getURI().equals(getURI());
    }

    @Override
    public int hashCode() {
        return getURI().hashCode();
    }

}
