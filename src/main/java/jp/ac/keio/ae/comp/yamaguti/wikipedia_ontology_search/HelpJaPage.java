package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class HelpJaPage extends CommonPage {
    public HelpJaPage() {
        add(new Label("title", "ヘルプ: " + TITLE).setRenderBodyOnly(true));
        add(new Label("version", VERSION));
    }
}
