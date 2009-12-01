<%@ page contentType="text/html; charset=UTF-8"%>
<%@ page import="java.util.*"%>
<%@ page import="java.io.*"%>
<%@ page import="java.net.*"%>
<%@ page import="java.util.Map.*"%>

<%@ page import="com.hp.hpl.jena.rdf.model.*"%>
<%@ page import="com.hp.hpl.jena.util.*"%>
<%@ page import="com.hp.hpl.jena.vocabulary.*"%>
<%@ page
	import="jp.ac.keio.ae.comp.yamaguti.wikipedia_ontology_search.*"%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ja" xml:lang="ja">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="./myresources/mystyle.css" type="text/css"
	media="all" />
<title>統計データ（インスタンス数でソートしたクラスのリスト）: 日本語Wikipediaオントロジー検索システム</title>
<script type="text/javascript" src="js/lib/external.js"></script>
<script type="text/javascript" src="js/lib/smoothscroll.js"></script>
</head>

<body style="background-color: #eee;">
<div class="page-title">日本語Wikipediaオントロジー検索システム</div>
<div class="menu">
<ul>
	<li><a href="index.html"> ホーム </a></li>
	<li><a href="manual.html">マニュアル</a></li>
	<li><a href="changelog.html">更新履歴</a></li>
	<li><a href="statistics.html">統計データ</a></li>
</ul>
</div>
<div class="container">
<h1>統計データ（インスタンス数でソートしたクラスのリスト）</h1>
<div style="text-align: right; font-size: 80%;">最終更新日: <%= Calendar.getInstance().getTime() %></div>

<%
 Map<Integer, Set<Resource>> numClsMap = (Map<Integer, Set<Resource>>) request.getAttribute("numClsMap");
 %>

<ol>
	<%
     for (Entry<Integer, Set<Resource>> entry : numClsMap.entrySet()) {
            int numberOfInstance = entry.getKey();
            Set<Resource> clsSet = entry.getValue();
            for (Resource cls : clsSet) {
                Literal label = cls.getProperty(RDFS.label).getLiteral();
                try {
                    String url = WikipediaOntologyStorage.CLASS_NS + URLEncoder.encode(label.getString(), "UTF-8");
                    String rdfUrl = WikipediaOntologyStorage.CLASS_NS + "data/"
                            + URLEncoder.encode(label.getString() + ".rdf", "UTF-8");
                    %>
	<li><a href="<%=url %>"><%=label.getString() %></a>(<%=numberOfInstance %>)
	(<a href="<%=rdfUrl %>">RDF/XML</a>)</li>
	<%
                } catch (UnsupportedEncodingException exp) {
                    exp.printStackTrace();
                }
            }
        }
     %>
</ol>

</div>
<div class="footer">
<div class="copyright">Copyright &copy; 2009 慶應義塾大学 理工学部 管理工学科
山口研究室．All Rights Reserved.</div>
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
