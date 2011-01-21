/**
 * 日本語Wikipediaオントロジー検索 インターフェース
 *
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 *
 */

var useInfModel = false;
var queryType = 'class';
var currentURI = "";
var queryURL = "";
var show_isa_tree_and_instance = true;
var expand_all_class_and_instance = false;
var show_rdf_xml = true;
var start_collapsed_group = true;

Ext.onReady(function() {
    Ext.QuickTips.init();
    Ext.getDom("title").innerHTML = APP_TITLE + " ver. 2011-01-23";
    var cookieProvider = new Ext.state.CookieProvider({
        expires : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 5))
    });
    Ext.state.Manager.setProvider(cookieProvider);
    var mainView = getMainView();
    applyOptionState();
    mainView.doLayout();
    setTimeout(function() {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({
            remove : true
        });
    }, 1000);

});
