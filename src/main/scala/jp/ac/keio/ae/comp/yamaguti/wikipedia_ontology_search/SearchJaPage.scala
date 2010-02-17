package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search

import libs.WikipediaOntologyUtils
import org.apache.wicket.markup.html.basic.Label

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/02/17
 * Time: 23:41:40
 *
 */
class SearchJaPage extends SearchPage {
    add(new Label("app_title", "日本語Wikipediaオントロジー検索インタフェース").setRenderBodyOnly(true));
    add(new Label("loading_message", "日本語Wikipediaオントロジー検索インタフェース 読み込み中..."));
    add(WikipediaOntologyUtils.getJsPackageResource("js/resources/ja_resource.js"));
}