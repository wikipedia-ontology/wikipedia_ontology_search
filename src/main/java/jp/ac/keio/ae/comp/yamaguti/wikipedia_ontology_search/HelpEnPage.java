package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class HelpEnPage extends CommonPage {
    public HelpEnPage() {
        add(new Label("title", "Japanese Wikipedia Ontology Search Interface & Web APIs").setRenderBodyOnly(true));
        add(new Label("version", VERSION));
    }

}

