/*
 * @(#)  2010/01/29
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author takeshi morita
 */
public class IndexPage extends CommonPage {

    public IndexPage() {
        add(new Label("title", "ホーム: " + TITLE).setRenderBodyOnly(true));
        add(new Label("version", VERSION));
    }

}
