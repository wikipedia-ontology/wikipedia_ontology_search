/*
 * @(#)  2010/02/04
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.*;

/**
 * @author Takeshi Morita
 */
public interface PropertyStatistics extends Entity {

    public int getNumberOfInstances();
    public void setNumberOfInstances(int num);

    public String getName();
    public void setName(String name);

    public String getURI();
    public void setURI(String uri);

    @ManyToMany(PropertyToInstance.class)
    public InstanceStatistics[] getInstances();

}
