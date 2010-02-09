/*
 * @(#)  2010/01/29
 */

package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.sql.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;
import net.java.ao.*;

import org.apache.wicket.*;
import org.apache.wicket.markup.html.basic.*;
import org.apache.wicket.markup.html.link.*;

/**
 * @author takeshi morita
 */
public class StatisticsPage extends CommonPage {

    int resourceCount;
    int classCount;
    int propertyCount;
    int instanceCount;
    int statementCount;
    int infStatementCount;
    int isaCount;
    int typeCount;

    private void addCount(String id, int value) {
        add(new Label(id, Integer.toString(value)));
    }

    private void addStatistics(String lang, boolean isInfModel) {
        if (lang.equals("all")) {
            addCount("resource_count_" + lang, resourceCount);
            addCount("class_count_" + lang, classCount);
            addCount("property_count_" + lang, propertyCount);
            addCount("instance_count_" + lang, instanceCount);
            addCount("statement_count_" + lang, statementCount);
            addCount("isa_count_" + lang, isaCount);
            addCount("type_count_" + lang, typeCount);
            addCount("inf_statement_count_" + lang, infStatementCount);
            return;
        }
        EntityManager em = WikipediaOntologyStorage.getEntityManager();
        try {
            if (isInfModel) {
                for (TripleStatistics ts : em.find(TripleStatistics.class, Query.select().where(
                        "lang = ? and inferenceType = ?", lang, "rdfs"))) {
                    infStatementCount += ts.getStatementCount();
                    addCount("inf_statement_count_" + lang, ts.getStatementCount());
                }
            } else {
                for (TripleStatistics ts : em.find(TripleStatistics.class, Query.select().where(
                        "lang = ? and inferenceType = ?", lang, "none"))) {
                    resourceCount += ts.getResourceCount();
                    addCount("resource_count_" + lang, ts.getResourceCount());
                    classCount += ts.getClassCount();
                    addCount("class_count_" + lang, ts.getClassCount());
                    propertyCount += ts.getPropertyCount();
                    addCount("property_count_" + lang, ts.getPropertyCount());
                    instanceCount += ts.getInstanceCount();
                    addCount("instance_count_" + lang, ts.getInstanceCount());
                    statementCount += ts.getStatementCount();
                    addCount("statement_count_" + lang, ts.getStatementCount());
                    isaCount += ts.getIsaCount();
                    addCount("isa_count_" + lang, ts.getIsaCount());
                    typeCount += ts.getTypeCount();
                    addCount("type_count_" + lang, ts.getTypeCount());
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public StatisticsPage() {
        add(new Label("title", "統計データ: " + TITLE).setRenderBodyOnly(true));

        addStatistics("en", false);
        addStatistics("en", true);
        addStatistics("ja", false);
        addStatistics("ja", true);
        addStatistics("all", false);

        add(new BookmarkablePageLink<Void>("ja_classes_ranked_by_number_of_instances",
                ClassesRankedByNumberOfInstancesPage.class, new PageParameters("lang=ja")));
        add(new BookmarkablePageLink<Void>("en_classes_ranked_by_number_of_instances",
                ClassesRankedByNumberOfInstancesPage.class, new PageParameters("lang=en")));

    }
}
