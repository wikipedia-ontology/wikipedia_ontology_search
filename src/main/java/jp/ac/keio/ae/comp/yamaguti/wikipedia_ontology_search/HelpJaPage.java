package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class HelpJaPage extends HelpCommonPage {
    public HelpJaPage() {
        add(new Label("title", "ヘルプ").setRenderBodyOnly(true));
        add(new Label("version", CommonPage.VERSION));
    }
}
