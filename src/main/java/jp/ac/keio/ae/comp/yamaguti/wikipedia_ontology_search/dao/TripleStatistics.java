/*
 * @(#)  2010/02/04
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author takeshi morita
 */
public interface TripleStatistics extends Entity {

    public void setInferenceType(String type);
    public boolean getInferenceType();

    public void setLang(String lang);
    public String getLang();

    public void setClassCount(int cnt);
    public int getClassCount();

    public void setObjectPropertyCount(int cnt);
    public int getObjectPropertyCount();

    public void setDatatypePropertyCount(int cnt);
    public int getDatatypePropertyCount(int cnt);

    public void setTypeCount(int cnt);
    public int getTypeCount();

    public void setIsaCount(int cnt);
    public int getIsaCount();

    public void setInstanceCount(int cnt);
    public int getInstanceCount();

    public void setPropertyCount(int cnt);
    public int getPropertyCount();

    public void setStatementCount(int cnt);
    public int getStatementCount();

    public void setResourceCount(int cnt);
    public int getResourceCount();

}
