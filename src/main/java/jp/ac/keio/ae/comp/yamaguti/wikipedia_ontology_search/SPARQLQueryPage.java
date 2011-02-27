package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import com.google.common.collect.Lists;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.sparql.resultset.JSONOutputResultSet;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.dao.SPARQLQueryInfo;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.PagingData;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.data.SPARQLQueryInfoImpl;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.IndicatingAjaxPagingNavigator;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.SPARQLQueryStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import net.java.ao.EntityManager;
import org.apache.wicket.*;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.form.AjaxFormComponentUpdatingBehavior;
import org.apache.wicket.ajax.markup.html.AjaxLink;
import org.apache.wicket.extensions.ajax.markup.html.IndicatingAjaxButton;
import org.apache.wicket.extensions.ajax.markup.html.IndicatingAjaxLink;
import org.apache.wicket.extensions.ajax.markup.html.modal.ModalWindow;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.*;
import org.apache.wicket.markup.html.image.Image;
import org.apache.wicket.markup.html.link.ExternalLink;
import org.apache.wicket.markup.html.link.Link;
import org.apache.wicket.markup.repeater.Item;
import org.apache.wicket.markup.repeater.data.DataView;
import org.apache.wicket.markup.repeater.data.IDataProvider;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.PropertyModel;

import java.io.*;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.*;


/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/06
 * Time: 14:00:35
 */
public class SPARQLQueryPage extends CommonPage {
    private String sparqlQuery;
    private String description;
    private String userId;
    private boolean isUsingInferenceModel;
    private String outputFormat;
    private String descriptionErrorMessage;
    private String queryErrorMessage;
    private IndicatingAjaxLink currentAjaxLink;
    private String confirmType;

    private String keyword;
    private boolean isSearchAuthorCheck;
    private boolean isSearchDescriptionCheck;
    private boolean isSearchQueryCheck;

    public void setConfirmType(String type) {
        confirmType = type;
    }

    private Model getWikipediaOntologyAndInstanceModel(String lang, String inferenceType) {
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, inferenceType);
        return wikiOntStrage.getTDBModel();
    }

    private boolean isValidSPARQLQuerySyntax(String queryString) {
        QueryExecution queryExec = null;
        try {
            Query query = QueryFactory.create(queryString);
            queryExec = QueryExecutionFactory.create(query, ModelFactory.createDefaultModel());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            if (queryExec != null) {
                queryExec.close();
            }
        }
        return true;
    }

    private String getQueryResults(String queryString, String outputFormat, String inferenceType, String version) {
//        System.out.println(queryString);
        String output = "";
        QueryExecution queryExec = null;
        try {
            Query query = QueryFactory.create(queryString);
            if (inferenceType == null) {
                inferenceType = "none";
            }
//            System.out.println("inference_type: " + inferenceType);
            WikipediaOntologyStorage.VERSION = version;
            Model dbModel = getWikipediaOntologyAndInstanceModel("ja", inferenceType);
            queryExec = QueryExecutionFactory.create(query, dbModel);
            ResultSet results = queryExec.execSelect();
            if (outputFormat.equals("xml")) {
                output = ResultSetFormatter.asXMLString(results);
            } else if (outputFormat.equals("text")) {
                output = ResultSetFormatter.asText(results);
            } else if (outputFormat.equals("json")) {
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                ResultSetFormatter.outputAsJSON(outputStream, results);
                output = outputStream.toString("UTF-8");
            }
        } catch (Exception e) {
            e.printStackTrace();
            output = "error";
        } finally {
            if (queryExec != null) {
                queryExec.close();
            }
        }
        return output;
    }

    private String getContentType(String outputFormat) {
        String contentType = "";
        if (outputFormat.equals("xml")) {
            contentType = "application/xml";
        } else if (outputFormat.equals("text")) {
            contentType = "text/plain";
        } else if (outputFormat.equals("json")) {
            contentType = "application/json";
        }
        return contentType;
    }

    private void showErrorPage(String errorMessage) {
        PageParameters params = new PageParameters();
        params.put("error_message", errorMessage);
        setResponsePage(ErrorPage.class, params);
    }

    private AjaxFormComponentUpdatingBehavior getAjaxOnblurBehavior() {
        return new AjaxFormComponentUpdatingBehavior("onblur") {
            @Override
            protected void onUpdate(AjaxRequestTarget target) {
                target.addComponent(getFormComponent());
            }
        };
    }

    public SPARQLQueryPage(PageParameters params) {
        String query = params.getString("q");
        String outputFormat = params.getString("output_format");
        String inferenceType = params.getString("inference_type");
        String version = params.getString("version", WikipediaOntologyStorage.CURRENT_ONTOLOGY_VERSION);
        if (query != null) {
            try {
                if (outputFormat == null) {
                    outputFormat = "xml";
                }
                final String contentType = getContentType(outputFormat);
                final String outputString = getQueryResults(query, outputFormat, inferenceType, version);
                if (outputString.equals("error")) {
                    showErrorPage("SPARQLクエリエラー");
                } else {
                    getRequestCycle().setRequestTarget(new IRequestTarget() {
                        public void respond(RequestCycle requestCycle) {
                            requestCycle.getResponse().setContentType(contentType + "; charset=utf-8");
                            requestCycle.getResponse().write(outputString);
                        }

                        public void detach(RequestCycle requestCycle) {
                        }
                    });
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        final ModalWindow confirmDialog = new ModalWindow("confirmDialog");
        confirmDialog.setOutputMarkupId(true);
        confirmDialog.setPageCreator(new ModalWindow.PageCreator() {
            public Page createPage() {
                return new ConfirmDialog(SPARQLQueryPage.this, confirmDialog);
            }
        });
        confirmDialog.setInitialHeight(120);
        confirmDialog.setInitialWidth(300);
        confirmDialog.setResizable(false);

        confirmDialog.setWindowClosedCallback(new ModalWindow.WindowClosedCallback() {
            public void onClose(AjaxRequestTarget target) {
                if (!confirmType.equals("cancel")) {
                    currentAjaxLink.onClick(target);
                }
            }
        });
        add(confirmDialog);

        Form<Void> form = new Form<Void>("sparql_query_form");
        PropertyModel<String> sparqlQueryModel = new PropertyModel<String>(this, "sparqlQuery");
        final TextArea<String> queryArea = new TextArea<String>("queryArea", sparqlQueryModel);
        queryArea.setOutputMarkupId(true);
        queryArea.add(getAjaxOnblurBehavior());

        PropertyModel<String> descriptionModel = new PropertyModel<String>(this, "description");
        final TextArea<String> descriptionArea = new TextArea<String>("descriptionArea", descriptionModel);
        descriptionArea.setOutputMarkupId(true);
        descriptionArea.add(getAjaxOnblurBehavior());

        PropertyModel<String> userIdModel = new PropertyModel<String>(this, "userId");
        final TextField<String> userIdField = new TextField<String>("userId", userIdModel);
        userIdField.setOutputMarkupId(true);
        userIdField.add(getAjaxOnblurBehavior());

        PropertyModel<Boolean> inferenceCheckModel = new PropertyModel<Boolean>(this, "isUsingInferenceModel");
        final CheckBox inferenceModelCheckBox = new CheckBox("inference_model_check", inferenceCheckModel);
        inferenceModelCheckBox.setOutputMarkupId(true);
        inferenceModelCheckBox.add(getAjaxOnblurBehavior());

        form.add(queryArea);
        form.add(descriptionArea);
        form.add(userIdField);
        form.add(inferenceModelCheckBox);

        final Label descriptionErrorMessageLabel = new Label("description_error_message", new PropertyModel<String>(this, "descriptionErrorMessage"));
        descriptionErrorMessageLabel.setOutputMarkupId(true);
        final Label queryErrorMessageLabel = new Label("query_error_message", new PropertyModel<String>(this, "queryErrorMessage"));
        queryErrorMessageLabel.setOutputMarkupId(true);
        form.add(descriptionErrorMessageLabel);
        form.add(queryErrorMessageLabel);

        add(form);

        List<ChoiceElement> choices = Arrays.asList(new ChoiceElement("xml", "XML"), new ChoiceElement("json", "JSON"), new ChoiceElement("text", "テキスト"));
        final DropDownChoice<ChoiceElement> select = new DropDownChoice<ChoiceElement>("format", new org.apache.wicket.model.Model<ChoiceElement>(), choices,
                new IChoiceRenderer<ChoiceElement>() {
                    public String getDisplayValue(ChoiceElement object) {
                        return object.getName();
                    }

                    public String getIdValue(ChoiceElement object, int index) {
                        return object.getId();
                    }
                });
        form.add(select);

        final Image buttonIndicator = WikipediaOntologyUtils.getIndicator("button_indicator");
        form.add(buttonIndicator);

        IndicatingAjaxButton submitButton = new IndicatingAjaxButton("query") {
            @Override
            public void onSubmit(AjaxRequestTarget target, Form<?> form) {
                queryErrorMessage = "";
                descriptionErrorMessage = "";

                if (isQueryEmpty()) {
                    queryErrorMessage = "クエリを入力してください．";
                } else {
                    PageParameters params = new PageParameters();
                    params.put("q", sparqlQuery);
                    ChoiceElement elem = select.getModelObject();
                    String outputFormat = "xml";
                    if (elem != null) {
                        outputFormat = elem.getId();
                    }
                    params.put("output_format", outputFormat);
                    String inferenceType = "none";
                    if (isUsingInferenceModel) {
                        inferenceType = "rdfs";
                        params.put("inference_type", "rdfs");
                    }
                    if (!isValidSPARQLQuerySyntax(sparqlQuery)) {
                        queryErrorMessage = "クエリにエラーがあります．";
                    } else {
                        setResponsePage(SPARQLQueryPage.class, params);
                    }
                }
                target.addComponent(queryErrorMessageLabel);
                target.addComponent(descriptionErrorMessageLabel);
            }

            public String getAjaxIndicatorMarkupId() {
                return buttonIndicator.getMarkupId();
            }

        };
        form.add(submitButton);

        final WebMarkupContainer sparqlQueryInfoContainer = new WebMarkupContainer("sparql_query_info_container");
        sparqlQueryInfoContainer.setOutputMarkupId(true);

        IndicatingAjaxButton saveButton = new IndicatingAjaxButton("save") {
            @Override
            public void onSubmit(AjaxRequestTarget target, Form<?> form) {
                queryErrorMessage = "";
                descriptionErrorMessage = "";
                String inferenceType = "none";
                if (isUsingInferenceModel) {
                    inferenceType = "rdfs";
                }

                if (isDescriptionEmpty()) {
                    descriptionErrorMessage = "クエリの説明を入力してください．";
                }
                if (isQueryEmpty()) {
                    queryErrorMessage = "クエリを入力してください．";
                }
                if (!(isDescriptionEmpty() || isQueryEmpty())) {
                    if (!isValidSPARQLQuerySyntax(sparqlQuery)) {
                        queryErrorMessage = "クエリにエラーがあります．";
                    } else {
                        try {
                            SPARQLQueryInfo info = SPARQLQueryStorage.getEntityManager().create(SPARQLQueryInfo.class);
                            SPARQLQueryStorage.saveSPARQLQueryInfo(info, userId, description, sparqlQuery, inferenceType,
                                    Calendar.getInstance().getTime());
                        } catch (SQLException sqle) {
                            sqle.printStackTrace();
                        }
                    }
                }
                target.addComponent(queryErrorMessageLabel);
                target.addComponent(descriptionErrorMessageLabel);
                target.addComponent(sparqlQueryInfoContainer);
            }

            public String getAjaxIndicatorMarkupId() {
                return buttonIndicator.getMarkupId();
            }
        };
        form.add(saveButton);

        IndicatingAjaxButton clearButton = new IndicatingAjaxButton("clear") {
            @Override
            public void onSubmit(AjaxRequestTarget target, Form<?> form) {
                userId = "";
                description = "";
                sparqlQuery = "";
                isUsingInferenceModel = false;
                queryErrorMessage = "";
                descriptionErrorMessage = "";
                target.addComponent(userIdField);
                target.addComponent(descriptionArea);
                target.addComponent(queryArea);
                target.addComponent(inferenceModelCheckBox);
                target.addComponent(queryErrorMessageLabel);
                target.addComponent(descriptionErrorMessageLabel);
            }

            public String getAjaxIndicatorMarkupId() {
                return buttonIndicator.getMarkupId();
            }
        };
        form.add(clearButton);

        PagingData sparqlQueryInfoPagingData = new PagingData(0, 0, 0);

        DataView<SPARQLQueryInfoImpl> sparqlQueryInfoView = new DataView<SPARQLQueryInfoImpl>("sparql_query_info_list",
                getSPARQLQueryInfoDataProvider(sparqlQueryInfoPagingData), 10) {
            @Override
            protected void populateItem(final Item<SPARQLQueryInfoImpl> item) {
                final SPARQLQueryInfoImpl info = item.getModelObject();
                final int id = info.getId();
                final String desc = info.getDescription();
                final String query = info.getQuery();
                final String uid = info.getUserId();
                final String inferenceType = info.getInferenceType();
                AjaxLink<String> queryLink = new AjaxLink<String>("query_link") {
                    @Override
                    public void onClick(AjaxRequestTarget target) {
                        userId = uid;
                        description = desc;
                        sparqlQuery = query;
                        isUsingInferenceModel = inferenceType.equals("rdfs");
                        target.addComponent(userIdField);
                        target.addComponent(descriptionArea);
                        target.addComponent(queryArea);
                        target.addComponent(inferenceModelCheckBox);
                    }
                };
                Label descriptionLabel = new Label("description", desc);
                queryLink.add(descriptionLabel);
                item.add(queryLink);

                ExternalLink htmlLink = new ExternalLink("html_url", getSPARQLQueryURL(query, inferenceType, "text"));
                htmlLink.add(new Image("html_icon", new ResourceReference(SPARQLQueryPage.class, "my_resources/icons/html.png")));
                item.add(htmlLink);

                ExternalLink rdfLink = new ExternalLink("rdf_url", getSPARQLQueryURL(query, inferenceType, "xml"));
                rdfLink.add(new Image("rdf_icon", new ResourceReference(SPARQLQueryPage.class, "my_resources/icons/rdf_w3c_icon.16.png")));
                item.add(rdfLink);

                item.add(new Label("create_userId", uid));
                final Date createDate = info.getCreateDate();
                final Date updateDate = info.getUpdateDate();
                SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");
                item.add(new Label("create_date", dateFormatter.format(createDate)));
                if (updateDate == null) {
                    item.add(new Label("update_date", ""));
                } else {
                    item.add(new Label("update_date", dateFormatter.format(updateDate)));
                }

                final Image updateItemIndicator = WikipediaOntologyUtils.getIndicator("update_item_indicator");
                item.add(updateItemIndicator);

                final IndicatingAjaxLink<String> updateLink = new IndicatingAjaxLink<String>("update") {

                    @Override
                    public void onClick(AjaxRequestTarget target) {
                        queryErrorMessage = "";
                        descriptionErrorMessage = "";
                        String infType = "none";
                        if (isUsingInferenceModel) {
                            infType = "rdfs";
                        }

                        if (isDescriptionEmpty()) {
                            descriptionErrorMessage = "クエリの説明を入力してください．";
                        }
                        if (isQueryEmpty()) {
                            queryErrorMessage = "クエリを入力してください．";
                        }
                        if (!(isDescriptionEmpty() || isQueryEmpty())) {
                            if (!isValidSPARQLQuerySyntax(sparqlQuery)) {
                                queryErrorMessage = "クエリにエラーがあります．";
                            } else {
                                SPARQLQueryStorage.updateSPARQLQueryInfo(id, userId, description, sparqlQuery, infType, createDate);
                            }
                        }
                        target.addComponent(queryErrorMessageLabel);
                        target.addComponent(descriptionErrorMessageLabel);
                        target.addComponent(sparqlQueryInfoContainer);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return updateItemIndicator.getMarkupId();
                    }
                };

                IndicatingAjaxLink<String> updateButtonLink = new IndicatingAjaxLink<String>("update_button") {
                    @Override
                    public void onClick(AjaxRequestTarget target) {
                        currentAjaxLink = updateLink;
                        confirmDialog.setTitle("更新");
                        confirmDialog.show(target);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return updateItemIndicator.getMarkupId();
                    }
                };
                item.add(updateButtonLink);

                final Image deleteItemIndicator = WikipediaOntologyUtils.getIndicator("delete_item_indicator");
                item.add(deleteItemIndicator);
                final IndicatingAjaxLink<String> deleteLink = new IndicatingAjaxLink<String>("delete") {
                    @Override
                    public void onClick(AjaxRequestTarget target) {
                        SPARQLQueryStorage.deleteSPARQLQueryInfo(id);
                        target.addComponent(sparqlQueryInfoContainer);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return deleteItemIndicator.getMarkupId();
                    }
                };

                IndicatingAjaxLink<String> deleteButtonLink = new IndicatingAjaxLink<String>("delete_button") {
                    @Override
                    public void onClick(AjaxRequestTarget target) {
                        currentAjaxLink = deleteLink;
                        confirmDialog.setTitle("削除");
                        confirmDialog.show(target);
                    }

                    public String getAjaxIndicatorMarkupId() {
                        return deleteItemIndicator.getMarkupId();
                    }
                };
                item.add(deleteButtonLink);

                item.add(updateLink);
                item.add(deleteLink);
            }
        };

        sparqlQueryInfoContainer.add(sparqlQueryInfoView);

        sparqlQueryInfoContainer.add(new Label("start", new PropertyModel<PagingData>(sparqlQueryInfoPagingData, "start")));
        sparqlQueryInfoContainer.add(new Label("end", new PropertyModel<PagingData>(sparqlQueryInfoPagingData, "end")));
        sparqlQueryInfoContainer.add(new Label("count", new PropertyModel<PagingData>(sparqlQueryInfoPagingData, "size")));
        final org.apache.wicket.markup.html.image.Image indicator = WikipediaOntologyUtils.getIndicator("indicator");
        sparqlQueryInfoContainer.add(indicator);
        sparqlQueryInfoContainer.add(new IndicatingAjaxPagingNavigator("sparql_query_info_paging", sparqlQueryInfoView, indicator));
        add(sparqlQueryInfoContainer);

        Form<Void> sparqlQueryInfoForm = new Form<Void>("search_sparql_query_info_form");
        final TextField keywordField = new TextField("keyword", new PropertyModel(this, "keyword"));
        keywordField.setOutputMarkupId(true);
        sparqlQueryInfoForm.add(keywordField);

        final CheckBox searchAuthorCheckButton = new CheckBox("search_author_check", new PropertyModel(this, "isSearchAuthorCheck"));
        searchAuthorCheckButton.setOutputMarkupId(true);
        sparqlQueryInfoForm.add(searchAuthorCheckButton);
        final CheckBox searchDescriptionCheckButton = new CheckBox("search_description_check", new PropertyModel(this, "isSearchDescriptionCheck"));
        searchDescriptionCheckButton.setOutputMarkupId(true);
        sparqlQueryInfoForm.add(searchDescriptionCheckButton);
        final CheckBox searchQueryCheckButton = new CheckBox("search_query_check", new PropertyModel(this, "isSearchQueryCheck"));
        searchQueryCheckButton.setOutputMarkupId(true);
        sparqlQueryInfoForm.add(searchQueryCheckButton);

        IndicatingAjaxButton searchSPARQLQueryInfoButton = new IndicatingAjaxButton("search_sparql_query_info") {
            @Override
            public void onSubmit(AjaxRequestTarget target, Form<?> form) {
                target.addComponent(sparqlQueryInfoContainer);
            }

            public String getAjaxIndicatorMarkupId() {
                return indicator.getMarkupId();
            }
        };

        sparqlQueryInfoForm.add(searchSPARQLQueryInfoButton);

        IndicatingAjaxButton clearSearchSPARQLQueryInfoButton = new IndicatingAjaxButton("clear_search_sparql_query_info") {

            @Override
            public void onSubmit(AjaxRequestTarget target, Form<?> form) {
                keyword = "";
                isSearchDescriptionCheck = false;
                isSearchQueryCheck = false;
                isSearchAuthorCheck = false;
                target.addComponent(keywordField);
                target.addComponent(searchAuthorCheckButton);
                target.addComponent(searchDescriptionCheckButton);
                target.addComponent(searchQueryCheckButton);
                target.addComponent(sparqlQueryInfoContainer);
            }

            public String getAjaxIndicatorMarkupId() {
                return buttonIndicator.getMarkupId();
            }
        };
        sparqlQueryInfoForm.add(clearSearchSPARQLQueryInfoButton);
        add(sparqlQueryInfoForm);

        Link downloadALLSPARQLQueryInfoLink = new Link("all_sparql_query_info_data") {
            @Override
            public void onClick() {
                getRequestCycle().setRequestTarget(new IRequestTarget() {
                    public void respond(RequestCycle requestCycle) {
                        requestCycle.getResponse().setContentType("text/csv; charset=utf-8");
                        requestCycle.getResponse().write(SPARQLQueryStorage.getAllSPARQLQueryInfoData());
                    }

                    public void detach(RequestCycle requestCycle) {
                    }
                });
            }
        };
        add(downloadALLSPARQLQueryInfoLink);
        add(new Label("title", "SPARQLクエリ: " + TITLE).setRenderBodyOnly(true));
    }

    private boolean isDescriptionEmpty() {
        return description == null || description.length() == 0;
    }

    private boolean isQueryEmpty() {
        return sparqlQuery == null || sparqlQuery.length() == 0;
    }

    private String encodeUTF8String(String str) {
        try {
            return URLEncoder.encode(str, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return "";
    }

    private String getSPARQLQueryURL(String query, String inferenceType, String outputFormmat) {
        StringBuilder builder = new StringBuilder();
        builder.append("?query=");
        builder.append(encodeUTF8String(query));
        builder.append("&");
        builder.append("output=");
        builder.append(outputFormmat);
        builder.append("&");
        builder.append("inference_type=");
        builder.append(inferenceType);
        return builder.toString();
    }

    private IDataProvider<SPARQLQueryInfoImpl> getSPARQLQueryInfoDataProvider(final PagingData pagingData) {
        return new IDataProvider<SPARQLQueryInfoImpl>() {
            transient EntityManager em;

            public void resolveDao() {
                if (em == null) {
                    em = SPARQLQueryStorage.getEntityManager();
                }
            }

            public void detach() {
            }

            public int size() {
                resolveDao();
                try {
                    net.java.ao.Query query = net.java.ao.Query.select();
                    query = filterQuery(query);
                    int size = em.count(SPARQLQueryInfo.class, query);
                    pagingData.setSize(size);
                    return size;
                } catch (SQLException sqle) {
                    sqle.printStackTrace();
                }
                return 0;
            }

            public IModel<SPARQLQueryInfoImpl> model(SPARQLQueryInfoImpl object) {
                return new org.apache.wicket.model.Model<SPARQLQueryInfoImpl>(object);
            }

            private String makeFilterQuery(String[] keywords, String fieldName) {
                StringBuilder builder = new StringBuilder();
                for (String keyword : keywords) {
                    builder.append(fieldName);
                    builder.append(" like ");
                    builder.append("'%");
                    builder.append(keyword);
                    builder.append("%'");
                    builder.append(" OR ");
                }
                builder.append("false ");
                return builder.toString();
            }

            private net.java.ao.Query filterQuery(net.java.ao.Query query) {
                if (keyword == null) {
                    keyword = "";
                }
                String[] keywords = keyword.split("\\s+");
                String filterQuery = "";
                if (isSearchDescriptionCheck) {
                    filterQuery += makeFilterQuery(keywords, "description");
                }
                if (isSearchQueryCheck) {
                    if (!filterQuery.isEmpty()) {
                        filterQuery += " OR ";
                    }
                    filterQuery += makeFilterQuery(keywords, "query");
                }
                if (isSearchAuthorCheck) {
                    if (!filterQuery.isEmpty()) {
                        filterQuery += " OR ";
                    }
                    filterQuery += makeFilterQuery(keywords, "userid");
                }
                if (!filterQuery.isEmpty()) {
                    query = query.where(filterQuery);
                }
                return query;
            }

            public Iterator<? extends SPARQLQueryInfoImpl> iterator(int first, int count) {
                pagingData.setStart(first + 1);
                pagingData.setEnd(first + count);
                List<SPARQLQueryInfoImpl> sparqlQueryInfoList = Lists.newArrayList();
                net.java.ao.Query query = net.java.ao.Query.select().order("createdate desc, updatedate desc, description desc").limit(count).offset(first);
                query = filterQuery(query);
                try {
                    for (SPARQLQueryInfo info : em.find(SPARQLQueryInfo.class, query)) {
                        String inferenceType = info.getInferenceType();
                        SPARQLQueryInfoImpl infoImpl = new SPARQLQueryInfoImpl(info.getID(),
                                info.getDescription(), info.getQuery(), info.getUserId(), inferenceType,
                                info.getCreateDate(), info.getUpdateDate());
                        sparqlQueryInfoList.add(infoImpl);
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                }
                return sparqlQueryInfoList.iterator();
            }
        };
    }
}

class ChoiceElement implements Serializable {
    private String id;
    private String name;

    public ChoiceElement(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
