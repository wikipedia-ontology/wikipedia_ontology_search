/**
 * 日本語Wikipediaオントロジー検索 インターフェース
 *
 * ver.2009-09-30: 複数のタイプを指定して，検索結果を絞り込むことができるようにした．
 *
 * ver.2009-10-02: テーブルデータの表示数を最大100までにして，ページを切り替えることができるようにした．
 *
 * ver.2009-10-05:
 * テーブルデータの表示数をコンボボックスから選択・変更できるようにした．Isa階層でインスタンス数を表示するようにした．推論モデルを利用して検索できるようにした．
 *
 * ver.2009-10-07: 全階層を表示できるようにした．
 *
 * ver.2009-10-08:
 * ステートメントを表示するテーブルで，クラス，インスタンス，Wikipedia記事，ラベルについてそれぞれアイコンを表示するようにした．
 * ヘルプの利用しているライブラリ等に，MySQL Connector/JとEscape Codec Library: ecl.jsを追加．
 * オプションダイアログで，クラス階層，RDF/XML，ステートメントテーブルの表示状態に関してパラメータを設定できるようにした．
 * ツールバーのメニューを整理した． Ext.state.Managerを利用して，ステートメントテーブルとオプションの状態を保存できるようにした．
 *
 * ver.2009-10-09: 検索履歴とブックマークの機能を実装
 *
 * ver. 2009-10-11:
 * クラス階層とインスタンスを検索できるようにした．検索履歴とブックマークはクッキーにデータを保存しないようにした（4kbまでしか保存できないため）
 * ブックマークと検索履歴もサイドバーからアクセスできるようにした．その他，ツリーの更新をTreeLoaderから行えるように実装を変更．
 *
 * ver.2009-10-12:
 * 階層，ステートメントテーブル，検索履歴，ブックマークのそれぞれについて，クラスとインスタンスノード（セル）にコンテキストメニューを設定した．
 * ステートメントテーブルについて，読み込み中を表示するようにした(loadMask:true)． ブックマークのインポートとエクスポート機能を実装した．
 * レイアウトが低い解像度のディスプレイで見た場合に崩れていたのを修正．
 *
 * ver.2009-10-17
 *
 * resources/en_resources.jsと ja_resources.jsで表示用のラベルを用意して，表示言語を切り替えられるようにした．
 * parameters.jsでサーバーとベースURI等を設定できるようにした． 言語メニューから英語と日本語表示を切り替えられるようにした．
 * クラス階層を読み込み中の時に，パネルをmaskするようにした．
 *
 * サーバー側で，生成したRDF，JSONデータをファイルとして保存して，二度目以降はファイルを返すようにした． （全クラス階層についても同様）
 *
 * var.2009-10-18
 *
 * 全階層の検索速度が少し向上した．ステートメントテーブルのローディング中の表示が画面全体になっていたのを修正．英語版のバージョン情報ページを作成．
 *
 * ver.2009-11-11
 * 推論モデルを利用する場合のURIを変更．?useInfModelオプションを廃止して，URIのパス中のrdfs_inferenceの有無で推論モデルを利用するかどうかを決定するように変更．
 *
 * ver.2009-11-18 クラスとインスタンスの検索を行う際に，完全一致，前方一致，後方一致，部分一致を選択して検索できるようにした．
 *
 * ver.2009-11-19 ブックマークと履歴で，検索オプションも保存するように修正．
 * 階層検索についても，完全一致，前方一致，後方一致，部分一致を選択して検索できるようにした．
 *
 * ver.2010-04-12 ブックマークと履歴をWeb Storageに保存するようにした
 *                 ExtJsのバージョンを3.2にアップ．
 * contact: t_morita@ae.keio.ac.jp
 *
 * Copyright © 2009-2010 慶應義塾大学 理工学部 管理工学科 山口研究室．
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
			Ext.getDom("title").innerHTML = APP_TITLE + " ver. 2010-04-12";
			var cookieProvider = new Ext.state.CookieProvider({
						expires : new Date(new Date().getTime()
								+ (1000 * 60 * 60 * 24 * 365 * 5))
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
