/*
 * @(#)  2010/01/29
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;

import org.apache.wicket.markup.html.*;
import org.apache.wicket.markup.html.basic.*;
import org.apache.wicket.markup.html.link.*;

/**
 * @author takeshi morita
 */
public abstract class CommonPage extends WebPage {

    public static final String VERSION = "2011-01-23";
    public final String TITLE = "日本語Wikipediaオントロジー検索インタフェース";

    public CommonPage() {
        add(new Label("server_name", WikipediaOntologyUtils.getHostName()));
        add(new BookmarkablePageLink<Void>("statistics", StatisticsPage.class));
        add(new BookmarkablePageLink<Void>("classes_ranked_by_number_of_instances", ClassListPage.class));
        add(new BookmarkablePageLink<Void>("properties_ranked_by_number_of_statements", PropertyListPage.class));
        add(new BookmarkablePageLink<Void>("sparql", SPARQLQueryPage.class));
        add(WikipediaOntologyUtils.getJsPackageResource("js/lib/external.js"));
        add(WikipediaOntologyUtils.getJsPackageResource("js/lib/smoothscroll.js"));
        add(WikipediaOntologyUtils.getJsPackageResource("js/lib/prettify.js"));
    }
}
