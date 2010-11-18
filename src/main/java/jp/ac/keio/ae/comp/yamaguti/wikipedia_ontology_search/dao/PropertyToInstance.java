/*
 * @(#)  2010/02/05
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author takeshi morita
 */
public interface PropertyToInstance extends Entity {

    public void setPropertyStatistics(PropertyStatistics ps);
    public PropertyStatistics getPropertyStatistics();

    public void setInstanceStatistics(InstanceStatistics is);
    public InstanceStatistics getInstanceStatistics();

}
