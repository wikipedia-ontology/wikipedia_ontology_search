package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import java.sql.*;
import java.util.*;

import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.*;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.*;
import net.java.ao.*;

import org.apache.wicket.*;
import org.apache.wicket.ajax.*;
import org.apache.wicket.markup.html.*;
import org.apache.wicket.markup.html.basic.*;
import org.apache.wicket.markup.html.image.*;
import org.apache.wicket.markup.html.link.*;
import org.apache.wicket.markup.html.list.*;
import org.apache.wicket.markup.repeater.*;
import org.apache.wicket.markup.repeater.data.*;
import org.apache.wicket.model.*;
import org.apache.wicket.model.Model;

import com.google.common.collect.*;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.rdf.model.Resource;

/**
 * @author Takeshi Morita
 */
public class ClassListPage extends CommonPage {

    private static final String TITLE = "クラス一覧";

    private IDataProvider<ClassImpl> getClassDataProvider(final String lang, final PagingData classPagingData) {
        return new IDataProvider<ClassImpl>() {
            transient EntityManager em;

            public void resolveDao() {
                if (em == null) {
                    em = WikipediaOntologyStorage.getEntityManager();
                }
            }

            public void detach() {
            }

            public int size() {
                resolveDao();
                try {
                    Query query = Query.select();
                    if (!lang.equals("ja+en")) {
                        query = query.where("language = ?", lang);
                    }
                    int size = em.find(ClassStatistics.class, query).length;
                    classPagingData.setSize(size);
                    return size;
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return 0;
            }

            public IModel<ClassImpl> model(ClassImpl object) {
                return new Model<ClassImpl>(object);
            }

            public Iterator< ? extends ClassImpl> iterator(int first, int count) {
                classPagingData.setStart(first + 1);
                classPagingData.setEnd(first + count);
                resolveDao();
                Query query = Query.select().order("instanceCount desc").limit(count).offset(first);
                try {
                    if (!lang.equals("ja+en")) {
                        query = query.where("language = ?", lang);
                    }
                    List<ClassImpl> clsList = Lists.newArrayList();
                    for (ClassStatistics c : em.find(ClassStatistics.class, query)) {
                        clsList.add(new ClassImpl(c));
                    }
                    return clsList.iterator();
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return null;
            }
        };
    }

    private IDataProvider<InstanceImpl> getInstanceDataProvider(final PagingData pagingData, final ClassImpl cls,
            final String lang) {
        return new IDataProvider<InstanceImpl>() {
            transient EntityManager em;

            public void resolveDao() {
                if (em == null) {
                    em = WikipediaOntologyStorage.getEntityManager();
                }
            }

            public void detach() {
            }

            public int size() {
                resolveDao();
                try {
                    int size = 0;
                    for (ClassStatistics c : em.find(ClassStatistics.class, Query.select().where("classname = ?",
                            cls.getClassName()))) {
                        size = c.getInstanceCount();
                    }
                    pagingData.setSize(size);
                    return size;
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return 0;
            }

            public IModel<InstanceImpl> model(InstanceImpl object) {
                return new Model<InstanceImpl>(object);
            }

            public Iterator< ? extends InstanceImpl> iterator(int first, int count) {
                pagingData.setStart(first + 1);
                pagingData.setEnd(first + count);
                resolveDao();
                String queryString = SPARQLQueryMaker.getIntancesOfClassQueryString(cls, count, first);
                List<InstanceImpl> instanceList = null;
                if (lang.equals("ja+en")) {
                    instanceList = WikipediaOntologyUtils.getInstanceImplList(queryString, "ja");
                    if (instanceList.size() == 0) {
                        instanceList = WikipediaOntologyUtils.getInstanceImplList(queryString, "en");
                    }
                } else {
                    instanceList = WikipediaOntologyUtils.getInstanceImplList(queryString, lang);
                }
                return instanceList.iterator();
            }
        };
    }

    private List<PropertyImpl> getPropertyList(String lang, InstanceImpl instance) {
        String queryString = SPARQLQueryMaker.getPropertiesOfInstanceQueryString(instance);
        List<PropertyImpl> propertyList = WikipediaOntologyUtils.getPropertyImplList(queryString, lang);
        return propertyList;
    }

    private void populatePropertyAndValue(String lang, InstanceImpl i, WebMarkupContainer typeListContainer) {
        List<PropertyImpl> typeList = getPropertyList(lang, i);
        ListView<PropertyImpl> typeStatisticsView = new ListView<PropertyImpl>("property_list", typeList) {
            @Override
            protected void populateItem(ListItem<PropertyImpl> item) {
                PropertyImpl p = item.getModelObject();
                String uri = p.getURI();
                String value = p.getValue();
                item.add(WikipediaOntologyUtils.getPropertyIconS("property_icon_s"));
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "property"));
                item.add(new ExternalLink("property", uri, p.getName()));
                if (value.contains(WikipediaOntologyStorage.INSTANCE_NS)) {
                    Resource resValue = ResourceFactory.createResource(value);
                    String qName = WikipediaOntologyUtils.getQname(resValue);
                    item.add(new ExternalLink("object_property_value", value, qName));
                    item.add(new Label("datatype_property_value", "").setVisible(false));
                } else {
                    item.add(new Label("datatype_property_value", value));
                    item.add(new ExternalLink("object_property_value", "", "").setVisible(false));
                }
            }
        };
        typeListContainer.add(typeStatisticsView);
    }

    private void populateInstance(final String lang, ClassImpl c, WebMarkupContainer instanceListContainer) {
        PagingData instancePagingData = new PagingData(0, 0, 0);
        DataView<InstanceImpl> instanceStatisticsView = new DataView<InstanceImpl>("instance_list",
                getInstanceDataProvider(instancePagingData, c, lang), 20) {
            @Override
            protected void populateItem(Item<InstanceImpl> item) {
                final InstanceImpl i = item.getModelObject();
                String name = i.getInstanceName();
                String uri = i.getURI();
                item.add(new ExternalLink("instance", uri, name));
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "instance"));
                final WebMarkupContainer propertyListContainer = new WebMarkupContainer(
                        "property_and_value_list_container");
                propertyListContainer.setOutputMarkupId(true);
                propertyListContainer.setOutputMarkupPlaceholderTag(true);
                propertyListContainer.setVisible(false);
                item.add(propertyListContainer);
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "property"));
                final Image plusOrMinusImage = new Image("plus_or_minus_icon", WikipediaOntologyUtils
                        .getPlusIconReference());
                plusOrMinusImage.setOutputMarkupId(true);
                final Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
                item.add(indicator);
                class ShowPropertyAndValueEvent extends AjaxEventBehavior implements IAjaxIndicatorAware {

                    public ShowPropertyAndValueEvent() {
                        super("onmousedown");
                    }

                    @Override
                    protected void onEvent(AjaxRequestTarget target) {
                        if (!propertyListContainer.isVisible()) {
                            if (propertyListContainer.size() == 0) {
                                populatePropertyAndValue(lang, i, propertyListContainer);
                            }
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getMinusIconReference());
                        } else {
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getPlusIconReference());
                        }
                        propertyListContainer.setVisible(!propertyListContainer.isVisible());
                        target.addComponent(plusOrMinusImage);
                        target.addComponent(propertyListContainer);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return indicator.getMarkupId();
                    }
                }
                plusOrMinusImage.add(new ShowPropertyAndValueEvent());
                item.add(plusOrMinusImage);
            }
        };
        instanceListContainer.add(instanceStatisticsView);
        instanceListContainer.add(new Label("instance_start",
                new PropertyModel<PagingData>(instancePagingData, "start")));
        instanceListContainer.add(new Label("instance_end", new PropertyModel<PagingData>(instancePagingData, "end")));
        instanceListContainer
                .add(new Label("instance_count", new PropertyModel<PagingData>(instancePagingData, "size")));
        Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
        instanceListContainer.add(indicator);
        instanceListContainer.add(new IndicatingAjaxPagingNavigator("instance_paging", instanceStatisticsView,
                indicator));
    }

    private void renderPage(String title, final String lang) {
        add(new Label("title", title).setRenderBodyOnly(true));
        add(new Label("h1-title", title));

        final WebMarkupContainer classListContainer = new WebMarkupContainer("class_list_container");
        classListContainer.setOutputMarkupId(true);
        PagingData classPagingData = new PagingData(0, 0, 0);

        DataView<ClassImpl> classStatisticsView = new DataView<ClassImpl>("class_list", getClassDataProvider(lang,
                classPagingData), 50) {
            @Override
            protected void populateItem(final Item<ClassImpl> item) {
                final ClassImpl c = item.getModelObject();
                String name = c.getClassName();
                String uri = c.getURI();
                item.add(new Label("instance_count", Integer.toString(c.getInstanceCount())));
                item.add(new ExternalLink("class", uri, name));
                final WebMarkupContainer instanceListContainer = new WebMarkupContainer("instance_list_container");
                instanceListContainer.setOutputMarkupId(true);
                instanceListContainer.setOutputMarkupPlaceholderTag(true);
                instanceListContainer.setVisible(false);
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "class"));
                final Image plusOrMinusImage = new Image("plus_or_minus_icon", WikipediaOntologyUtils
                        .getPlusIconReference());
                plusOrMinusImage.setOutputMarkupId(true);
                final Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
                item.add(indicator);
                class ShowInstancesEvent extends AjaxEventBehavior implements IAjaxIndicatorAware {

                    public ShowInstancesEvent() {
                        super("onmousedown");
                    }

                    @Override
                    protected void onEvent(AjaxRequestTarget target) {
                        if (!instanceListContainer.isVisible()) {
                            if (instanceListContainer.size() == 0) {
                                populateInstance(lang, c, instanceListContainer);
                            }
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getMinusIconReference());
                        } else {
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getPlusIconReference());
                        }
                        instanceListContainer.setVisible(!instanceListContainer.isVisible());
                        target.addComponent(plusOrMinusImage);
                        target.addComponent(instanceListContainer);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return indicator.getMarkupId();
                    }
                }
                plusOrMinusImage.add(new ShowInstancesEvent());
                item.add(plusOrMinusImage);
                item.add(instanceListContainer);
            }
        };
        classListContainer.add(classStatisticsView);
        classListContainer.add(new Label("class_start", new PropertyModel<PagingData>(classPagingData, "start")));
        classListContainer.add(new Label("class_end", new PropertyModel<PagingData>(classPagingData, "end")));
        classListContainer.add(new Label("class_count", new PropertyModel<PagingData>(classPagingData, "size")));
        Image topIndicator = WikipediaOntologyUtils.getIndicator("top_indicator");
        classListContainer.add(topIndicator);
        Image bottomIndicator = WikipediaOntologyUtils.getIndicator("bottom_indicator");
        classListContainer.add(bottomIndicator);
        classListContainer
                .add(new IndicatingAjaxPagingNavigator("top_class_paging", classStatisticsView, topIndicator));
        classListContainer.add(new IndicatingAjaxPagingNavigator("bottom_class_paging", classStatisticsView,
                bottomIndicator));
        add(classListContainer);

        add(new BookmarkablePageLink<Void>("ja_classes_ranked_by_number_of_instances",
                ClassListPage.class, new PageParameters("lang=ja")));
        add(new BookmarkablePageLink<Void>("en_classes_ranked_by_number_of_instances",
                ClassListPage.class, new PageParameters("lang=en")));
        add(new Image("plus_icon", WikipediaOntologyUtils.getPlusIconReference()));
        add(new Image("minus_icon", WikipediaOntologyUtils.getMinusIconReference()));
        add(new Image("rdf_icon", WikipediaOntologyUtils.getRDFIconReference()));
    }

    public ClassListPage() {
        String title = TITLE + "（日本語+英語）";
        renderPage(title, "ja+en");
    }

    public ClassListPage(PageParameters params) {
        String title = TITLE;
        String lang = params.getString("lang");
        if (lang.equals("ja")) {
            title += "（日本語）";
        } else if (lang.equals("en")) {
            title += "（英語）";
        }
        renderPage(title, lang);
    }
}
