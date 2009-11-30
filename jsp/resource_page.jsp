
<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.util.*"%>
<%@ page import="com.hp.hpl.jena.rdf.model.*"%>
<%@ page import="com.hp.hpl.jena.util.*"%>
<%@ page import="com.hp.hpl.jena.vocabulary.*"%>
<%@ page
	import="jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.*"%>


<%
    int displayInstanceCnt = 8;
    String keyword = (String) request.getAttribute("keyword");
    String ns = "";
    Type queryType = (Type) request.getAttribute("queryType");
    if (queryType == Type.CLASS) {
        ns = WikipediaOntologyStorage.CLASS_NS;
    } else if (queryType == Type.PROPERTY) {
        ns = WikipediaOntologyStorage.PROPERTY_NS;
    } else if (queryType == Type.INSTANCE) {
        ns = WikipediaOntologyStorage.INSTANCE_NS;
    }
    Resource uri = ResourceFactory.createResource(ns + keyword);
    Model outputModel = (Model) request.getAttribute("outputModel");
    Map<Property, Set<RDFNode>> propertyRDFNodeMap = WikipediaOntologyUtilities.getPropertyRDFNodeMap(
            outputModel, uri);
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ja" xml:lang="ja">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />

<link rel="stylesheet"
	href="http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/myresources/mystyle.css"
	type="text/css" media="all" />
<title><%=keyword%></title>
</head>
<body style="background-color: #eee;">
<div class="page-title"><a style="color: lightgray;"
	href="http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/">日本語Wikipediaオントロジー検索システム</a></div>
<div class="container">

<h1>
<%
    if (ns == WikipediaOntologyStorage.CLASS_NS) {
%> <img width="25" height="25"
	src="http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/myresources/icons/class_icon_m.png"
	alt="クラス" /> <%
     } else if (ns == WikipediaOntologyStorage.PROPERTY_NS) {
 %> <img width="25" height="25"
	src="http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/myresources/icons/property_icon_m.png"
	alt="プロパティ" /> <%
     } else if (ns == WikipediaOntologyStorage.INSTANCE_NS) {
 %> <img width="25" height="25"
	src="http://hpcs01.comp.ae.keio.ac.jp/wikipedia_ontology/myresources/icons/instance_icon_m.png"
	alt="インスタンス" /> <%
     }
 %> <%=keyword%></h1>

<h2>URI</h2>
<ul>
	<li><a href="<%=uri%>"><%=uri%></a></li>
</ul>

<h2>各種データ</h2>
<ul>
	<li><a href="<%=ns + "page/" + keyword + ".html"%>">HTMLデータ</a> (<a
		href="<%=ns + "rdfs_inference/page/" + keyword + ".html"%>">推論モデルの利用</a>)</li>
	<li><a href="<%=ns + "data/" + keyword + ".rdf"%>">RDF/XMLデータ</a>
	(<a href="<%=ns + "rdfs_inference/data/" + keyword + ".rdf"%>">推論モデルの利用</a>)</li>
	<li><a href="<%=ns + "json_table/" + keyword + ".json"%>">JSONデータ（テーブル用）</a>
	(<a href="<%=ns + "rdfs_inference/json_table/" + keyword + ".json"%>">推論モデルの利用</a>)</li>
	<li><a href="<%=ns + "json_tree/" + keyword + ".json"%>">JSONデータ（ツリー用）</a>
	(<a href="<%=ns + "rdfs_inference/json_tree/" + keyword + ".json"%>">推論モデルの利用</a>)</li>
</ul>

<%
    if (propertyRDFNodeMap.get(WikipediaOntologyUtilities.instanceProperty) != null) {
%>
<h2>インスタンス一覧</h2>
<%
    int cnt = 0;
%>
<ul>
	<li>
	<%
	    for (RDFNode instance : propertyRDFNodeMap.get(WikipediaOntologyUtilities.instanceProperty)) {
	            cnt++;
	%> <a href="<%=instance.toString()%>"><%=instance.toString().split("/instance/")[1]%></a>
	<%
	    if (cnt == displayInstanceCnt) {
	%>
	</li>
	<li>
	<%
	    cnt = 0;
	            } else {
	%> <%="， "%> <%
     }
         }
 %>
	</li>
</ul>
<%
    }
%> <%
     for (java.util.Map.Entry<Property, Set<RDFNode>> entry : propertyRDFNodeMap.entrySet()) {
         Property property = entry.getKey();
         Set<RDFNode> rdfNodeSet = entry.getValue();

         if (property == WikipediaOntologyUtilities.instanceProperty) {
             continue;
         }
 %>

<h3><a href="<%=property.getURI()%>"><%= WikipediaOntologyUtilities.getQname(property)%></a></h3>
<ul>
	<%
	    for (RDFNode node : rdfNodeSet) {
	%>
	<li>
	<%
	    if (node.isLiteral()) {
	%> <%=node.toString()%> <%
     } else if (node.isResource()) {
         String resourceLabel = WikipediaOntologyUtilities.getQname((Resource)node);
 %> <a href="<%=node.toString()%>"><%= resourceLabel%></a> <%
     }
 %>
	</li>
	<%
	    }
	%>
</ul>
<%
    }
%>
</div>
<div class="footer">
<div class="copyright">Copyright &copy; 2009 慶應義塾大学 理工学部 管理工学科
山口研究室．All Rights Reserved. (Server: <%=WikipediaOntologyUtilities.getHostName()%>)
</div>
</div>

<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-11577244-1");
pageTracker._trackPageview();
} catch(err) {}</script>

</body>
</html>