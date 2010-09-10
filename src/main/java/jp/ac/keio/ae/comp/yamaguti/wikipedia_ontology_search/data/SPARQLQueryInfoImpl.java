package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/10
 * Time: 15:47:12
 */
public class SPARQLQueryInfoImpl implements Serializable {
    private int id;
    private String description;
    private String query;
    private String userId;
    private String inferenceType;
    private Date createDate;
    private Date updateDate;

    public SPARQLQueryInfoImpl(int id, String description, String query, String userId, String inferenceType, Date createDate, Date updateDate) {
        this.id = id;
        this.description = description;
        this.query = query;
        this.userId = userId;
        this.inferenceType = inferenceType;
        this.createDate = createDate;
        this.updateDate = updateDate;
    }

   public int getId()  {
       return id;
   }

   public void setId(int id) {
      this.id = id;
   }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getInferenceType() {
        return inferenceType;
    }

    public void setInferenceType(String inferenceType) {
        this.inferenceType = inferenceType;
    }

   public Date getCreateDate()  {
       return createDate;
   }

    public void setCreateDate(Date d) {
        this.createDate = d;
    }

    public Date getUpdateDate()  {
        return updateDate;
    }

    public void setUpdateDate(Date d) {
        this.updateDate = d;
    }

}
