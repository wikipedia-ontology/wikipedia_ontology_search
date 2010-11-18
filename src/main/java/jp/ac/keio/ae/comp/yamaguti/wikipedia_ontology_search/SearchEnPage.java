package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class SearchEnPage extends SearchPage {
    public SearchEnPage() {
        add(new Label("app_title", "Japanese Wikipedia Ontology Search Interface").setRenderBodyOnly(true));
        add(new Label("loading_message", "Japanese Wikipedia Ontology Search Interface Loading..."));
        add(WikipediaOntologyUtils.getJsPackageResource("js/resources/en_resource.js"));
    }
}
