package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.MemCachedStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import org.apache.wicket.Page;
import org.apache.wicket.markup.html.link.BookmarkablePageLink;
import org.apache.wicket.protocol.http.WebApplication;
import org.apache.wicket.request.target.coding.MixedParamUrlCodingStrategy;
import org.apache.wicket.request.target.coding.QueryStringUrlCodingStrategy;

public class WikipediaOntologySearchApplication extends WebApplication {

    public WikipediaOntologySearchApplication() {
    }

    @Override
    public Class<? extends Page> getHomePage() {
        return HomePage.class;
    }

    @Override
    protected void init() {
        getDebugSettings().setComponentUseCheck(false);
        getMarkupSettings().setDefaultMarkupEncoding("UTF-8");
        getRequestCycleSettings().setResponseRequestEncoding("UTF-8");
        mountBookmarkablePage("/statistics.html", StatisticsPage.class);
        mountBookmarkablePage("/error.html", ErrorPage.class);
        mount(new QueryStringUrlCodingStrategy("/sparql", SPARQLQueryPage.class));
        mount(new MixedParamUrlCodingStrategy("/class_list", ClassListPage.class, new String[]{"lang"}));
        mount(new MixedParamUrlCodingStrategy("/property_list", PropertyListPage.class, new String[]{"lang"}));
        mount(new MixedParamUrlCodingStrategy("/instance_list", InstanceListPage.class, new String[]{"lang"}));
        mount(new MixedParamUrlCodingStrategy("/class", ResourcePage.class, new String[]{"data_type", "resource_name"}));
        mount(new MixedParamUrlCodingStrategy("/property", ResourcePage.class, new String[]{"data_type", "resource_name"}));
        mount(new MixedParamUrlCodingStrategy("/instance", ResourcePage.class, new String[]{"data_type", "resource_name"}));
        String hostName = WikipediaOntologyUtils.getHostName();
        WikipediaOntologyStorage.H2_DB_PATH = getServletContext().getInitParameter("h2_db_path");
        if (hostName.equals("zest") || hostName.equals("avalon")) {
            WikipediaOntologyStorage.H2_DB_PATH = "C:/Users/t_morita/h2db/";
        } else if (hostName.equals("t-morita-macbook-air.local")) {
            WikipediaOntologyStorage.H2_DB_PATH = "/Users/t_morita/h2db/";
        }
        WikipediaOntologyStorage.H2_DB_PROTOCOL = getServletContext().getInitParameter("h2_db_protocol");
        WikipediaOntologyStorage.WIKIPEDIA_ONTOLOGY_PATH = getServletContext().getInitParameter("wikipedia_ontology_path");
//        System.out.println(hostName);
        if (hostName.equals("zest")) {
            WikipediaOntologyStorage.WIKIPEDIA_ONTOLOGY_PATH = "E:/Users/t_morita/wikipedia_ontology/";
        } else if (hostName.equals("avalon")) {
            WikipediaOntologyStorage.WIKIPEDIA_ONTOLOGY_PATH = "C:/Users/t_morita/wikipedia_ontology/";
        } else if (hostName.equals("t-morita-macbook-air.local")) {
            WikipediaOntologyStorage.WIKIPEDIA_ONTOLOGY_PATH = "/Users/t_morita/wikipedia_ontology/";
        }

        MemCachedStorage.HOST = getServletContext().getInitParameter("memcached_host");
        MemCachedStorage.PORT = getServletContext().getInitParameter("memcached_port");
        WikipediaOntologyStorage.getEntityManager(); // EntityManagerの初期化
    }

}
