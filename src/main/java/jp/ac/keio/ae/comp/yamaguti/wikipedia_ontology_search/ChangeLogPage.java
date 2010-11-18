/*
 * @(#)  2010/01/29
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author takeshi morita
 */
public class ChangeLogPage extends CommonPage {
    public ChangeLogPage() {
        add(new Label("title", "更新履歴: " + TITLE).setRenderBodyOnly(true));
    }
}
