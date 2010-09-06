package jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search;

import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.rdf.model.Model;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyStorage;
import jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.libs.WikipediaOntologyUtils;
import org.apache.wicket.IRequestTarget;
import org.apache.wicket.PageParameters;
import org.apache.wicket.RequestCycle;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.markup.html.AjaxLink;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.*;
import org.apache.wicket.model.PropertyModel;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Takeshi Morita
 * Date: 2010/09/06
 * Time: 14:00:35
 */
public class SPARQLQueryPage extends CommonPage{
    private String sparqlQuery;
    private String outputFormat;
    
    private Model getWikipediaOntologyAndInstanceModel(String lang, String inferenceType) {
        WikipediaOntologyStorage wikiOntStrage = new WikipediaOntologyStorage(lang, inferenceType);
        return wikiOntStrage.getTDBModel();
    }

   private String getQueryResults(String queryString, String outputFormat)  {
       String output = "";
       QueryExecution queryExec =  null;
       try {
           Query query = QueryFactory.create(queryString);
           Model dbModel = getWikipediaOntologyAndInstanceModel("ja", "");
           queryExec =  QueryExecutionFactory.create(query, dbModel);
           ResultSet results = queryExec.execSelect();
           if (outputFormat.equals("xml")) {
               output = ResultSetFormatter.asXMLString(results);
           } else if (outputFormat.equals("text")) {
               output = ResultSetFormatter.asText(results);
           }
       } catch(Exception e) {
           return "error";
       } finally {
           if (queryExec != null) {
               queryExec.close();
           }
       }
       return output;
   }

   private String getContentType(String outputFormat)  {
       String contentType = "";
       if (outputFormat.equals("xml")) {
           contentType = "application/xml";
       } else  if (outputFormat.equals("text")) {
           contentType = "text/plain";
       }
       return contentType;
   }

    public SPARQLQueryPage(PageParameters params) {
        String query = params.getString("query");
        String outputFormat = params.getString("output");
        if (query != null) {
            try {
                if (outputFormat == null) {
                    outputFormat = "xml";
                }
                final String contentType = getContentType(outputFormat);
                final String outputString = getQueryResults(URLDecoder.decode(query, "UTF-8"), outputFormat);
                if (outputString.equals("error")) {
                    params = new PageParameters();
                    params.put("error_message", "SPARQLクエリエラー");
                    setResponsePage(ErrorPage.class, params);
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
            } catch(UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }

        Form<Void> form = new Form<Void>("textForm");
        PropertyModel sparqlQueryModel = new PropertyModel<String>(this, "sparqlQuery");
        final TextArea<String> queryArea = new TextArea<String>("textArea",sparqlQueryModel);
        queryArea.setOutputMarkupId(true);
        form.add(queryArea);
        add(form);

        List<ChoiceElement>  choices = Arrays.asList(new ChoiceElement("xml", "XML"),  new ChoiceElement("text", "テキスト"));
        final DropDownChoice<ChoiceElement> select = new DropDownChoice("format", new org.apache.wicket.model.Model<ChoiceElement>(), choices,
                new IChoiceRenderer<ChoiceElement>() {
                    public String getDisplayValue(ChoiceElement object) {
                        return object.getName();
                    }

                    public String getIdValue(ChoiceElement object, int index) {
                        return object.getId();
                    }
                });
        form.add(select);

        Button submitButton = new Button("query") {
            @Override
            public void onSubmit() {
                try {
                    String encodedSPARQLQuery = URLEncoder.encode(sparqlQuery, "UTF-8");
                    PageParameters params = new PageParameters();
                    params.put("query", encodedSPARQLQuery);
                    ChoiceElement elem = select.getModelObject();
                    String outputFormat = "xml";
                    if (elem != null) {
                        outputFormat = elem.getId();
                    }
                    params.put("output", outputFormat);
                    setResponsePage(SPARQLQueryPage.class, params);
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
        };
        form.add(submitButton);
        add(new Label("title", "SPARQLクエリ: " + TITLE).setRenderBodyOnly(true));
        add(new AjaxLink("ex1"){
            @Override
            public void onClick(AjaxRequestTarget target) {
                setSparqlQueryExampleString("sparql_query_examples/ex1.sparql");
                target.addComponent(queryArea);
            }
        });
        add(new AjaxLink("ex2"){
            @Override
            public void onClick(AjaxRequestTarget target) {
                setSparqlQueryExampleString("sparql_query_examples/ex2.sparql");
                target.addComponent(queryArea);
            }
        });
        add(new AjaxLink("ex3"){
            @Override
            public void onClick(AjaxRequestTarget target) {
                setSparqlQueryExampleString("sparql_query_examples/ex3.sparql");
                target.addComponent(queryArea);
            }
        });
    }

   private void setSparqlQueryExampleString(String path)  {
       sparqlQuery = WikipediaOntologyUtils.getResourceString(SPARQLQueryPage.class, path);
       try {
           sparqlQuery = URLDecoder.decode(sparqlQuery, "UTF-8");
       } catch(UnsupportedEncodingException e) {
           e.printStackTrace();
       }
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
