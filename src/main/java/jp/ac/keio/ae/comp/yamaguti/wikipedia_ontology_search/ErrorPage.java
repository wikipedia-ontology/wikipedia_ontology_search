/*
 * @(#)  2010/02/01
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;

import org.apache.wicket.*;
import org.apache.wicket.markup.html.basic.*;
import org.apache.wicket.model.*;

/**
 * @author takeshi morita
 */
public class ErrorPage extends CommonPage {
    public ErrorPage(PageParameters params) {
        SearchParameters searchParams = (SearchParameters) params.get("search_parameters");
        add(new Label("error_message", new Model<String>(searchParams.toString())));
        add(new Label("title", "エラー: " + TITLE).setRenderBodyOnly(true));
    }
}
