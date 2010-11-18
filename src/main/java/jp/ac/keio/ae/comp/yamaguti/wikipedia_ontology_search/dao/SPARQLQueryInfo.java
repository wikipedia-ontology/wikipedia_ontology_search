package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao;

import net.java.ao.Entity;
import net.java.ao.schema.SQLType;

import java.sql.Types;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/10
 * Time: 13:38:33
 */
public interface SPARQLQueryInfo extends Entity {

    @SQLType(Types.CLOB)
    public String getDescription();
    @SQLType(Types.CLOB)
    public void setDescription(String description);

    @SQLType(Types.CLOB)
    public String getQuery();
    @SQLType(Types.CLOB)
    public void setQuery(String query);

    public String getUserId();
    public void setUserId(String uid);

    public String getInferenceType();
    public void setInferenceType(String type);

    public Date getCreateDate();
    public void setCreateDate(Date d);

    public Date getUpdateDate() ;
    public void setUpdateDate(Date d);
}
