package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.request.target.basic.RedirectRequestTarget;

/**
 * Created by IntelliJ IDEA.
 *
 * @author Takeshi Morita
 *         Date: 11/01/21 15:25
 */
public class HomePage extends WebPage {

    public HomePage() {
        getRequestCycle().setRequestTarget(new RedirectRequestTarget("index.html"));
    }
}
