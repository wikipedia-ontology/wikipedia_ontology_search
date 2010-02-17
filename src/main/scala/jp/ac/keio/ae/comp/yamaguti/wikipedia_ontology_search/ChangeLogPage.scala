package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search

import org.apache.wicket.markup.html.basic.Label

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/02/17
 * Time: 23:28:29
 *
 */
class ChangeLogPage extends CommonPage {
    add(new Label("title", "更新履歴: " + TITLE).setRenderBodyOnly(true));
}