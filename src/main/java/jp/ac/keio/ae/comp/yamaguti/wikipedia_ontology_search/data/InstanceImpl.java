/*
 * @(#)  2010/02/03
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;

/**
 * @author takeshi morita
 */
public class InstanceImpl implements Serializable {

    private String uri;
    private String instanceName;

    public InstanceImpl(InstanceStatistics i) {
        uri = i.getURI();
        instanceName = i.getName();
    }

    public InstanceImpl(String uri, String insName) {
        this.uri = uri;
        this.instanceName = insName;
    }

    public String getURI() {
        return uri;
    }

    public String getInstanceName() {
        return instanceName;
    }

    @Override
    public boolean equals(Object obj) {
        return ((InstanceImpl) obj).getURI().equals(getURI());
    }

    @Override
    public int hashCode() {
        return getURI().hashCode();
    }
}
