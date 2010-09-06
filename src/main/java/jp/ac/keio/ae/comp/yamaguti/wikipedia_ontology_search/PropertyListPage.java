package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import com.google.common.collect.Lists;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.PropertyStatistics;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.ClassImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.InstanceImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.PagingData;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.PropertyImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.IndicatingAjaxPagingNavigator;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.SPARQLQueryMaker;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import net.java.ao.EntityManager;
import net.java.ao.Query;
import org.apache.wicket.ajax.AjaxEventBehavior;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.IAjaxIndicatorAware;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.image.Image;
import org.apache.wicket.markup.html.link.ExternalLink;
import org.apache.wicket.markup.html.list.ListItem;
import org.apache.wicket.markup.html.list.ListView;
import org.apache.wicket.markup.repeater.Item;
import org.apache.wicket.markup.repeater.data.DataView;
import org.apache.wicket.markup.repeater.data.IDataProvider;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.Model;
import org.apache.wicket.model.PropertyModel;

import java.sql.SQLException;
import java.util.Iterator;
import java.util.List;

/**
 * @author t_morita
 */
public class PropertyListPage extends CommonPage {

    private static final String TITLE = "プロパティ一覧";

    private IDataProvider<PropertyImpl> getPropertyDataProvider(final PagingData pagingData) {
        return new IDataProvider<PropertyImpl>() {
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
                    int size = em.find(PropertyStatistics.class, query).length;
                    pagingData.setSize(size);
                    return size;
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return 0;
            }

            public IModel<PropertyImpl> model(PropertyImpl object) {
                return new Model<PropertyImpl>(object);
            }

            public Iterator< ? extends PropertyImpl> iterator(int first, int count) {
                pagingData.setStart(first + 1);
                pagingData.setEnd(first + count);
                resolveDao();

                Query query = Query.select().order("numberOfInstances desc, name").limit(count).offset(first);
                try {
                    List<PropertyImpl> propertyList = Lists.newArrayList();
                    for (PropertyStatistics p : em.find(PropertyStatistics.class, query)) {
                        propertyList.add(new PropertyImpl(p));
                    }
                    return propertyList.iterator();
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return null;
            }
        };
    }

    private IDataProvider<InstanceImpl> getInstanceDataProvider(final PagingData pagingData, final PropertyImpl property) {
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
                    for (PropertyStatistics p : em.find(PropertyStatistics.class, Query.select().where("URI = ?",
                            property.getURI()))) {
                        size = p.getNumberOfInstances();
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
                String queryString = SPARQLQueryMaker.getIntancesOfPropertyQueryString(property, count, first);
                List<InstanceImpl> instanceList = WikipediaOntologyUtils.getInstanceImplList(queryString, "ja");
                return instanceList.iterator();
            }
        };
    }

    private List<ClassImpl> getTypeList(InstanceImpl instance) {
        String queryString = SPARQLQueryMaker.getTypesOfInstanceQueryString(instance);
        List<ClassImpl> typeList = WikipediaOntologyUtils.getClassImplList(queryString, "ja");
        return typeList;
    }

    private void populateType(InstanceImpl i, WebMarkupContainer typeListContainer) {
        List<ClassImpl> typeList = getTypeList(i);
        ListView<ClassImpl> typeStatisticsView = new ListView<ClassImpl>("type_list", typeList) {
            @Override
            protected void populateItem(ListItem<ClassImpl> item) {
                ClassImpl c = item.getModelObject();
                String name = c.getClassName();
                String uri = c.getURI();
//                uri = uri.replace("http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/class/", "http://localhost:8080/wikipedia_ontology_search/query/class/page/") +  ".html";
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "type"));
                item.add(new ExternalLink("type", uri, name));
            }
        };
        typeListContainer.add(typeStatisticsView);
    }

    private void populateInstance(PropertyImpl p, WebMarkupContainer instanceListContainer) {
        PagingData instancePagingData = new PagingData(0, 0, 0);
        DataView<InstanceImpl> instanceStatisticsView = new DataView<InstanceImpl>("instance_list",
                getInstanceDataProvider(instancePagingData, p), 20) {
            @Override
            protected void populateItem(Item<InstanceImpl> item) {
                final InstanceImpl i = item.getModelObject();
                String name = i.getInstanceName();
                String uri = i.getURI();
//                uri = uri.replace("http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/instance/", "http://localhost:8080/wikipedia_ontology_search/query/instance/page/") +  ".html";
                item.add(new ExternalLink("instance", uri, name));
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "instance"));
                final WebMarkupContainer typeListContainer = new WebMarkupContainer("type_list_container");
                typeListContainer.setOutputMarkupId(true);
                typeListContainer.setOutputMarkupPlaceholderTag(true);
                typeListContainer.setVisible(false);
                item.add(typeListContainer);
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "type"));
                final Image plusOrMinusImage = new Image("plus_or_minus_icon", WikipediaOntologyUtils
                        .getPlusIconReference());
                plusOrMinusImage.setOutputMarkupId(true);
                final Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
                item.add(indicator);
                class ShowTypesEvent extends AjaxEventBehavior implements IAjaxIndicatorAware {

                    public ShowTypesEvent() {
                        super("onmousedown");
                    }

                    @Override
                    protected void onEvent(AjaxRequestTarget target) {
                        if (!typeListContainer.isVisible()) {
                            if (typeListContainer.size() == 0) {
                                populateType(i, typeListContainer);
                            }
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getMinusIconReference());
                        } else {
                            plusOrMinusImage.setImageResourceReference(WikipediaOntologyUtils.getPlusIconReference());
                        }
                        typeListContainer.setVisible(!typeListContainer.isVisible());
                        target.addComponent(plusOrMinusImage);
                        target.addComponent(typeListContainer);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return indicator.getMarkupId();
                    }
                }
                plusOrMinusImage.add(new ShowTypesEvent());
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

    public PropertyListPage() {
        add(new Label("title", TITLE).setRenderBodyOnly(true));
        add(new Label("h1-title", TITLE));

        final WebMarkupContainer propertyListContainer = new WebMarkupContainer("property_list_container");
        propertyListContainer.setOutputMarkupId(true);
        PagingData propertyPagingData = new PagingData(0, 0, 0);

        DataView<PropertyImpl> propertyStatisticsView = new DataView<PropertyImpl>("property_list",
                getPropertyDataProvider(propertyPagingData), 50) {
            @Override
            protected void populateItem(final Item<PropertyImpl> item) {
                final PropertyImpl p = item.getModelObject();
                String name = p.getName();
                String uri = p.getURI();
//                uri = uri.replace("http://www.yamaguti.comp.ae.keio.ac.jp/wikipedia_ontology/property/", "http://localhost:8080/wikipedia_ontology_search/query/property/page/") +  ".html";
                item.add(new Label("number_of_instances", Integer.toString(p.getNumberOfInstances())));
                item.add(new ExternalLink("property", uri, name));
                final WebMarkupContainer instanceListContainer = new WebMarkupContainer("instance_list_container");
                instanceListContainer.setOutputMarkupId(true);
                instanceListContainer.setOutputMarkupPlaceholderTag(true);
                instanceListContainer.setVisible(false);
                item.add(WikipediaOntologyUtils.getRDFLink(uri, "property"));
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
                                populateInstance(p, instanceListContainer);
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
        propertyListContainer.add(propertyStatisticsView);
        propertyListContainer.add(new Label("property_start",
                new PropertyModel<PagingData>(propertyPagingData, "start")));
        propertyListContainer.add(new Label("property_end", new PropertyModel<PagingData>(propertyPagingData, "end")));
        propertyListContainer
                .add(new Label("property_count", new PropertyModel<PagingData>(propertyPagingData, "size")));
        Image topIndicator = WikipediaOntologyUtils.getIndicator("top_indicator");
        propertyListContainer.add(topIndicator);
        Image bottomIndicator = WikipediaOntologyUtils.getIndicator("bottom_indicator");
        propertyListContainer.add(bottomIndicator);
        propertyListContainer.add(new IndicatingAjaxPagingNavigator("top_property_paging", propertyStatisticsView,
                topIndicator));
        propertyListContainer.add(new IndicatingAjaxPagingNavigator("bottom_property_paging", propertyStatisticsView,
                bottomIndicator));
        add(propertyListContainer);
        add(new Image("plus_icon", WikipediaOntologyUtils.getPlusIconReference()));
        add(new Image("minus_icon", WikipediaOntologyUtils.getMinusIconReference()));
        add(new Image("rdf_icon", WikipediaOntologyUtils.getRDFIconReference()));
    }
}
