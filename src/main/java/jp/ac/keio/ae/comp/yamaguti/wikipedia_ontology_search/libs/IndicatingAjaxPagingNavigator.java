/*
 * @(#)  2010/02/06
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs;

import org.apache.wicket.ajax.*;
import org.apache.wicket.ajax.markup.html.navigation.paging.*;
import org.apache.wicket.markup.html.image.*;
import org.apache.wicket.markup.repeater.data.*;

/**
 * @author Takeshi Morita
 */
public class IndicatingAjaxPagingNavigator extends AjaxPagingNavigator implements IAjaxIndicatorAware {

    final private Image indicator;

    public IndicatingAjaxPagingNavigator(String id, DataView< ? > dataView, Image indicator) {
        super(id, dataView);
        this.indicator = indicator;
    }

    public String getAjaxIndicatorMarkupId() {
        return indicator.getMarkupId();
    }
}
