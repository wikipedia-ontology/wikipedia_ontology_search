/*
 * @(#)  2010/02/02
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import com.danga.MemCached.MemCachedClient;
import com.danga.MemCached.SockIOPool;

import java.util.Calendar;
import java.util.Date;

/**
 * @author Takeshi Morita
 */
public class MemCachedStorage {

    private static MemCachedStorage mcStorage;
    private Date date;
    private MemCachedClient mcc;
    public static String HOST = "localhost";
    public static String PORT = "11211";

    private MemCachedStorage() {
        try {
            SockIOPool pool = SockIOPool.getInstance();
            pool.setServers(new String[]{HOST + ":" + PORT});
            pool.initialize();
            mcc = new MemCachedClient();

            long time = Calendar.getInstance().getTimeInMillis();
            time = time + 1000 * 60 * 60 * 24 * 60; // 60 days
            date = new Date(time);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static MemCachedStorage getInstance() {
        if (mcStorage == null) {
            mcStorage = new MemCachedStorage();
        }
        return mcStorage;
    }

    public void add(String key, Object value) {
        mcc.add(key, value, date);
    }

    public Object get(String key) {
        return mcc.get(key);
    }

}
