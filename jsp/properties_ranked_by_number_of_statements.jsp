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
<title>統計データ（Infoboxプロパティの利用ランキング）: 日本語Wikipediaオントロジー検索システム</title>
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
<h1>統計データ（Infoboxプロパティの利用ランキング）</h1>
<div style="text-align: right; font-size: 80%;">最終更新日: <%= Calendar.getInstance().getTime() %></div>

<%
Map<Integer, Set<Property>> numPropertySetMap = (Map<Integer, Set<Property>>) request.getAttribute("numPropertySetMap");
Map<Property, Set<Resource>> propertyInstanceMap = (Map<Property, Set<Resource>>) request.getAttribute("propertyInstanceMap");
Model ontModel = (Model)request.getAttribute("ontModel");
 %>

<ol>
	<%
        for (Set<Property> propertySet : numPropertySetMap.values()) {
            for (Property property : propertySet) {
                Literal propertyLiteral = (Literal) ontModel.listObjectsOfProperty(property, RDFS.label).toList()
                        .get(0);
                String propertyLabel = propertyLiteral.getString();
                Set<Resource> resSet = propertyInstanceMap.get(property);
                %>
	<li><a href="<%= property %>">wikion_property: <%=propertyLabel %></a>
	(<%=resSet.size() %>)
	<ul>
		<%
                int cnt = 0;
                for (Resource res : resSet) {
                    if (cnt == 50) {
                        break;
                    }
                    if (res.hasProperty(RDFS.label)) {
                        try {
                            %>
		<li>
		<%
                            String label = res.getProperty(RDFS.label).getLiteral().getString();
                            String typeURL = "";
                            String typeLabel = "";
                            if (res.hasProperty(RDF.type)) {
                                Resource type = (Resource) res.getProperty(RDF.type).getObject();
                                typeLabel = type.getProperty(RDFS.label).getLiteral().getString();
                                typeURL = WikipediaOntologyStorage.CLASS_NS + URLEncoder.encode(typeLabel, "UTF-8");
                            }
                            String url = WikipediaOntologyStorage.INSTANCE_NS + URLEncoder.encode(label, "UTF-8");
                            %> <a href="<%=url %>">wikiont_instance:
		<%=label %></a> <%
		if (0 < typeLabel.length()) { %> rdf:type <a href="<%=typeURL %>">wikiont_class:
		<%= typeLabel %></a> <%                             } %>
		</li>
		<%
                            cnt++;
                        } catch (UnsupportedEncodingException exp) {
                            exp.printStackTrace();
                        }
                    }
                }
                %>
	</ul>
	</li>
	<%
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