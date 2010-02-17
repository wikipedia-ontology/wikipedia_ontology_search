package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search

import org.apache.wicket.markup.html.basic.Label


/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/02/17
 * Time: 23:18:26
 *
 */
class IndexPage extends CommonPage {
    add(new Label("title", "ホーム: " + TITLE).setRenderBodyOnly(true));
    add(new Label("version", VERSION));
}

