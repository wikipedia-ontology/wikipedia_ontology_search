/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var APP_TITLE = "日本語Wikipediaオントロジー検索インタフェース";
var KEYWORD = "キーワード";
var SEARCH = "検索";
var CLASS = "クラス";
var DOMAIN = "定義域";
var RANGE = "値域";
var CLASS_LIST = "クラス一覧";
var PROPERTY = "プロパティ";
var PROPERTY_LIST = "プロパティ一覧";
var INSTANCE = "インスタンス";
var INSTANCE_LIST = "インスタンス一覧";
var RESOURCE_TYPE = "リソースのタイプ";
var SEARCH_TARGET = "検索対象";
var USE_INFERENCE_MODEL = "推論モデルの利用";
var NUMBER_OF_STATEMENTS = "表示ステートメント数";
var COMMUNICATION_ERROR = "通信エラー";
var STATUS = "ステータス";
var STATEMENT = "ステートメント";
var NEW_TAB = "新しいタブ";
var ADD_TAB = "タブを追加";
var OPEN_NEW_TAB = "新しいタブで開く";
var OPEN_RDF_FILE = "RDFファイルを開く";
var SUBJECT = "主語";
var PREDICATE = "述語";
var OBJECT = "目的語";
var SORTING_ORDER = "ソート順";
var NUMBER_OF_INSTANCES = "インスタンス数";
var DATE_AND_HOUR = "日時";
var URL = "URL";
var URI = "URI";
var SEARCH_HISTORY = "検索履歴";
var OPEN_SELECTED_HISTORY = "選択した履歴を開く";
var ADD_SELECTED_HISTORIES_TO_BOOKMARK = "選択した履歴をブックマークに追加";
var REMOVE_SELECTED_HISTORIES = "選択した履歴を削除";
var REMOVE_ALL_HISTORY = "すべての履歴を削除";
var BOOKMARK = "ブックマーク";
var OPEN_SELECTED_BOOKMARK = "選択したブックマークを開く";
var REMOVE_SELECTED_BOOKMARKS = "選択したブックマークを削除";
var IMPORT = "インポート";
var EXPORT = "エクスポート";
var IMPORT_OR_EXPORT_BOOKMARKS = 'ブックマークのインポート/エクスポート';
var CLOSE = "閉じる";
var CLASS_HIERARCHY = "クラス階層";
var WHOLE_CLASS_HIERARCHY = "全クラス階層";
var FIND_CLASSES_OR_INSTANCES = "クラスまたはインスタンスを検索";
var FIND_CLASSES = "クラスを検索";
var EXPAND_ALL = "階層をすべて開く";
var COLLAPSE_ALL = "階層をすべて閉じる";
var ROOT_CLASS = "ルートクラス";
var BOOKMARK_AND_SEARCH_HISTORY = "ブックマークと検索履歴";
var ABOUT_CLASS_HIERARCHY = "クラス階層関連";
var SHOW_CLASS_HIERARCHY = "クラス階層を表示";
var EXPAND_ALL_CLASS_HIERARCHY = "クラス階層をすべて展開して表示する";
var ABOUT_RDF_XML = "RDF/XML関連";
var ABOUT_STATEMENT_TABLE = "ステートメントテーブル関連";
var CLOSE_GROUPING_STATEMENTS = "グルーピングをすべて閉じた状態で表示";
var OPTION = "オプション";
var VERSION_INFORMATION = "バージョン情報";
var TOOL = "ツール";
var HELP = "ヘルプ";
var VERSION = "バージョン";
var SHOW_WHOLE_CLASS_HIERARCHY = "全クラス階層を表示";
var HIERARCHY = "階層表示";

var STATISTICS_INFORMATION = "統計情報";
var NUMBER_OF_RESOURCES = "リソース数";
var NUMBER_OF_CLASSES = "クラス数";
var NUMBER_OF_PROPERTIES = "プロパティ数";
var NUMBER_OF_INSTANCES = "インスタンス数";
var TOTAL_NUMBER_OF_STATEMENTS = "全ステートメント数: 7,588,865";
var NUMBER_OF_ISA_RELATIONSHIPS = "Is-a関係数";
var NUMBER_OF_TYPES_OF_INSTANCES = "インスタンスのタイプ数";

var MENU = "メニュー";
var SOURCE_CODE = "ソースコード";
var BOOKMARK_RECORD_LENGTH = 8;

var LANGUAGE = "言語";
var ENGLISH = "English";
var JAPANESE = "日本語";
var LOADING = "読み込み中・・・";
var SEARCHING = "検索中・・・";
var HELP_HTML = "help.html";
var MANUAL = "マニュアル";
var MANUAL_HTML = "manual.html";
var SEARCH_EN_HTML = "en_search.html";
var SEARCH_JA_HTML = "search.html";


var WIKIPEDIA_ONTOLOGY_SEARCH = {};

WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptionLabels = {
    rdfs: "RDFS",
    none: "なし"
};

WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels = {
    class: "クラス",
    property: "プロパティ",
    instance: "インスタンス"
}

WIKIPEDIA_ONTOLOGY_SEARCH.searchTargetOptionLabels = {
    uri: "URI" ,
    label: "ラベル"
}

// 検索オプション関連の定数
WIKIPEDIA_ONTOLOGY_SEARCH.searchOptionLabels = {
    search_option: "検索オプション",
    exact_match: "完全一致",
    any_match: "部分一致",
    starts_with: "前方一致",
    ends_with: "後方一致",
    sibling_classes: "兄弟クラス",
    sub_classes: "下位クラス",
    properties_of_domain_class: "定義域クラスのプロパティ",
    properties_of_range_class: "値域クラスのプロパティ",
    domain_classes_of_property: "プロパティの定義域",
    range_classes_of_property: "プロパティの値域",
    instances_of_class: "クラスのインスタンス",
    types_of_instance: "インスタンスのタイプ",
    inverse_statements: "逆関係のステートメント",
    path_to_root_class: "ルートクラスまでのパス"
};

WIKIPEDIA_ONTOLOGY_SEARCH.orderByOptionLabels = {
    name_asc: "名前（昇順）",
    name_desc: "名前（降順）",
    instance_count_asc: "インスタンス数（昇順）",
    instance_count_desc: "インスタンス数（降順）"
}

function getSearchKeywordLabel(keyword) {
    return keyword + "を検索";
}

function getNarrowDownKeywordLabel(keyword) {
    return keyword + "で絞り込む";
}

function getAddKeywordToBookmarkLabel(keyword) {
    return keyword + "をブックマークに追加";
}

function getRemoveKeywordFromBookmarkLabel(keyword) {
    return keyword + "をブックマークから削除";
}

function getRemoveKeywordFromHistoryLabel(keyword) {
    return keyword + "を検索履歴から削除";
}