package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search

import libs.WikipediaOntologyUtils
import org.apache.wicket.ResourceReference
import org.apache.wicket.markup.html.image.Image
import org.apache.wicket.markup.html.WebPage

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/02/17
 * Time: 23:31:35
 *
 */
class SearchPage extends WebPage {
    // extjs libs
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/ecl.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/ext-base.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/ext-all.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/StatusBar.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/ext-lang-ja.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/SliderTip.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/SlidingPager.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/lib/ProgressBarPager.js"));
    // my libs
    add(WikipediaOntologyUtils.getJsPackageResource("js/parameters.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/utilities.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/actions/SearchAction.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/BookmarkImportAndExportDialog.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/BookmarkPanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/HelpPanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/HistoryPanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/MainView.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/NumberOfStatementsSelectionPanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/OptionDialog.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/SearchPanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/SourcePanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/StatementTablePanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/TreePanel.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/widgets/VersionInfoDialog.js"));
    add(WikipediaOntologyUtils.getJsPackageResource("js/wikipedia-ontology-search.js"));

    add(new Image("loading_icon", new ResourceReference(classOf[SearchPage], "./myresources/icons/extanim32.gif")));
}
