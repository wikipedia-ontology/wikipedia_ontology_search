package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search

import libs.WikipediaOntologyUtils
import org.apache.wicket.markup.html.basic.Label

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/02/17
 * Time: 23:38:19
 *
 */
class SearchEnPage extends SearchPage {
    add(new Label("app_title", "Japanese Wikipedia Ontology Search Interface").setRenderBodyOnly(true));
    add(new Label("loading_message", "Japanese Wikipedia Ontology Search Interface Loading..."));
    add(WikipediaOntologyUtils.getJsPackageResource("js/resources/en_resource.js"));
}

