/*
 * @(#)  2010/02/07
 *
 * http://www.manskes.de/index.php/2008/10/30/the-simplest-activeobjects-database-provider-for-the-h2-database/
 *
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;


import net.java.ao.db.HSQLDatabaseProvider;
import org.h2.Driver;

/**
 * @author takeshi morita
 */
public class H2DatabaseProvider extends HSQLDatabaseProvider {
    public H2DatabaseProvider(String uri, String username, String password) {
        super(uri, username, password);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Class< ? extends Driver> getDriverClass() throws ClassNotFoundException {
        return (Class< ? extends Driver>) Class.forName("org.h2.Driver");
    }
}
