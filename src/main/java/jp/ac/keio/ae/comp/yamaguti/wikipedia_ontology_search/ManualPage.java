/*
 * @(#)  2010/01/29
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.*;
import org.apache.wicket.markup.html.basic.*;
import org.apache.wicket.markup.html.image.*;

/**
 * @author takeshi morita
 */
public class ManualPage extends CommonPage {
    public ManualPage() {
        add(new Label("title", "マニュアル: " + TITLE).setRenderBodyOnly(true));
        addImage("system_overview");
        addImage("server_setting");
        addImage("search_interface_overview");
        addImage("search_panel");
        addImage("class_tree_and_instances_panel");
        addImage("class_and_instance_node_context_menu");
        addImage("whole_class_tree_panel");
        addImage("statement_tab");
        addImage("statement_tab_option");
        addImage("bookmark_tab");
        addImage("import_export_dialog");
        addImage("search_history_tab");
        addImage("rdf_xml_tab");
        addImage("bookmark_and_search_history_panel");
        addImage("option_dialog");
        add(new Label("version", VERSION));
    }

    private void addImage(String id) {
        add(new Image(id, new ResourceReference(ManualPage.class, "./myresources/figures/" + id + ".png")));
    }
}
