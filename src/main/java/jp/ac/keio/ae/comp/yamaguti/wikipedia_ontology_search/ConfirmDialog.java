package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.markup.html.AjaxLink;
import org.apache.wicket.extensions.ajax.markup.html.modal.ModalWindow;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.basic.Label;

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/11
 * Time: 13:49:56
 */
public class ConfirmDialog extends WebPage {

     public ConfirmDialog(final SPARQLQueryPage sparqlQueryPage, final ModalWindow window) {

        add(new Label("message", window.getTitle()));

        add(new AjaxLink("ok")
        {
            @Override
            public void onClick(AjaxRequestTarget target)
            {
                if (sparqlQueryPage != null) {
                   sparqlQueryPage.setConfirmType(window.getTitle().getObject());
                }
                window.close(target);
            }
        });

        add(new AjaxLink("cancel")
        {
            @Override
            public void onClick(AjaxRequestTarget target)
            {
                if (sparqlQueryPage != null) {
                    sparqlQueryPage.setConfirmType("cancel");
                }
                window.close(target);
            }
        });
    }
}
