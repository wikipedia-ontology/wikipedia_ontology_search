/*
 * @(#)  2010/02/04
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author takeshi morita
 */
public interface TypeStatistics extends Entity {

    public String getName();
    public void setName(String name);

    public String getURI();
    public void setURI(String uri);

}
