/*
 * @(#)  2010/02/02
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import java.util.*;

import com.danga.MemCached.*;

/**
 * @author Takeshi Morita
 */
public class MemCachedStorage {

    private static MemCachedStorage mcStorage;
    private Date date;
    private MemCachedClient mcc;
    private static final String HOST = "hpcs01.comp.ae.keio.ac.jp";
    private static final String PORT = "11211";

    private MemCachedStorage() {
        SockIOPool pool = SockIOPool.getInstance();
        pool.setServers(new String[] { HOST + ":" + PORT});
        pool.initialize();
        mcc = new MemCachedClient();

        long time = Calendar.getInstance().getTimeInMillis();
        time = time + 1000 * 60 * 60 * 24 * 60; // 60 days
        date = new Date(time);
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
