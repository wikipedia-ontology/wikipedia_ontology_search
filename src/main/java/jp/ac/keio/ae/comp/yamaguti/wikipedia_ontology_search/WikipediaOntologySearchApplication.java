package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;

import org.apache.wicket.*;
import org.apache.wicket.protocol.http.*;
import org.apache.wicket.request.target.coding.*;

/**
 * Application object for your web application. If you want to run this
 * application without deploying, run the Start class.
 *
 * @see jp.ac.keio.ae.comp.yamaguti.Start#main(String[])
 */
public class WikipediaOntologySearchApplication extends WebApplication {
    /**
     * Constructor
     */
    public WikipediaOntologySearchApplication() {
    }

    @Override
    public Class< ? extends Page> getHomePage() {
        return IndexPage.class;
    }

    @Override
    protected void init() {
        getDebugSettings().setComponentUseCheck(false);
        getMarkupSettings().setDefaultMarkupEncoding("UTF-8");
        getRequestCycleSettings().setResponseRequestEncoding("UTF-8");
        mountBookmarkablePage("/index.html", IndexPage.class);
        mountBookmarkablePage("/manual.html", ManualPage.class);
        mountBookmarkablePage("/changelog.html", ChangeLogPage.class);
        mountBookmarkablePage("/statistics.html", StatisticsPage.class);
        mountBookmarkablePage("/help.html", HelpJaPage.class);
        mountBookmarkablePage("/en_help.html", HelpEnPage.class);
        mountBookmarkablePage("/search.html", SearchJaPage.class);
        mountBookmarkablePage("/en_search.html", SearchEnPage.class);
        mountBookmarkablePage("/error.html", ErrorPage.class);
        mount(new MixedParamUrlCodingStrategy("/class_list", ClassListPage.class, new String[] { "lang"}));
        mount(new MixedParamUrlCodingStrategy("/property_list", PropertyListPage.class, new String[] { "lang"}));
        mount(new MixedParamUrlCodingStrategy("/query", ResourcePage.class, new String[] { "resource_type",
                "data_type", "resource_name"}));

        WikipediaOntologyStorage.H2_DB_PATH = getServletContext().getInitParameter("h2_db_path");
        WikipediaOntologyStorage.H2_DB_PROTOCOL = getServletContext().getInitParameter("h2_db_protocol");
        WikipediaOntologyStorage.WIKIPEDIA_ONTOLOGY_PATH = getServletContext().getInitParameter(
                "wikipedia_ontology_path");
    }

}
