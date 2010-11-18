package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;

import org.apache.wicket.markup.html.basic.*;

/**
 * @author t_morita
 */
public class SearchJaPage extends SearchPage {
    public SearchJaPage() {
        add(new Label("app_title", "日本語Wikipediaオントロジー検索インタフェース").setRenderBodyOnly(true));
        add(new Label("loading_message", "日本語Wikipediaオントロジー検索インタフェース 読み込み中..."));
        add(WikipediaOntologyUtils.getJsPackageResource("js/resources/ja_resource.js"));
    }
}
