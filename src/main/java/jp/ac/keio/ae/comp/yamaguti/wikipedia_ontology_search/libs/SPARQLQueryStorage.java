package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.SPARQLQueryInfo;
import net.java.ao.EntityManager;

import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/10
 * Time: 13:41:50
 */
public class SPARQLQueryStorage {

    private static EntityManager em;

    public static EntityManager getEntityManager() {
        if (em == null) {
            try {
                em = new EntityManager(new H2DatabaseProvider("jdbc:h2:" + WikipediaOntologyStorage.H2_DB_PROTOCOL +
                        WikipediaOntologyStorage.H2_DB_PATH
                        + "/wikipedia_ontology_sparql_query", "wikipedia_ontology", "wikiont"));
                em.migrate(SPARQLQueryInfo.class);
            } catch (SQLException sqle) {
                sqle.printStackTrace();
            }
        }
        return em;
    }

   public static void deleteSPARQLQueryInfo(int id)  {
       try {
           SPARQLQueryInfo deleteInfo = getEntityManager().get(SPARQLQueryInfo.class, id);
           getEntityManager().delete(deleteInfo);
       } catch (SQLException sqle) {
           sqle.printStackTrace();
       }
   }

   private static String getUserId(String userId)  {
       if (userId == null ||userId.length() == 0) {
           userId = "unknown";
       }
       return userId;
   }

    public static void updateSPARQLQueryInfo(int id, String userId, String description, String query, String inferenceType, Date createDate)  {
        SPARQLQueryInfo info = getEntityManager().get(SPARQLQueryInfo.class, id);
        info.setUpdateDate(Calendar.getInstance().getTime());
        saveSPARQLQueryInfo(info, userId, description, query, inferenceType, createDate);
    }
    
   public static void saveSPARQLQueryInfo(SPARQLQueryInfo info, String userId, String description, String query, String inferenceType, Date createDate)  {
       info.setUserId(getUserId(userId));
       info.setDescription(description);
       info.setQuery(query);
       info.setInferenceType(inferenceType);
       info.setCreateDate(createDate);
       info.save();
   }
}
