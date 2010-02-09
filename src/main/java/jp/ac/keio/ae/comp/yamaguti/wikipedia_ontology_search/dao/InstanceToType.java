/*
 * @(#)  2010/02/05
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author takeshi morita
 */
public interface InstanceToType extends Entity {

    public void setInstanceStatistics(InstanceStatistics is);
    public InstanceStatistics getInstanceStatistics();

    public void setTypeStatistics(TypeStatistics ps);
    public TypeStatistics getTypeStatistics();

}
