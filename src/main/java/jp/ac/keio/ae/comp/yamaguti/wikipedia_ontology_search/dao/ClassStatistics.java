/*
 * @(#)  2010/02/03
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author takeshi morita
 */
public interface ClassStatistics extends Entity {

    public String getLanguage();
    public void setLanguage(String lang);

    public String getClassName();
    public void setClassName(String clsName);

    public int getInstanceCount();
    public void setInstanceCount(int cnt);

}
