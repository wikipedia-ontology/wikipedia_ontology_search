package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class HelpEnPage extends HelpCommonPage {
    public HelpEnPage() {
        add(new Label("title", "Help").setRenderBodyOnly(true));
        add(new Label("version", CommonPage.VERSION));
    }
}

