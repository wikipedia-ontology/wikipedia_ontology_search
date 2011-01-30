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
var NUMBER_OF_STATEMENTS = "全ステートメント数: 7,588,865";
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

// parameter keys
var DATE_PARAMETER_KEY = "date";
var RESOURCE_TYPE_PARAMETER_KEY = "resource_type";
var SEARCH_TARGET_PARAMETER_KEY = "search_target";
var RESOURCE_NAME_PARAMETER_KEY = "resource_name";
var SEARCH_OPTION_PARAMETER_KEY = "search_option";
var VERSION_PARAMETER_KEY = "version";
var URI_PARAMETER_KEY = "uri";
var INFERENCE_TYPE_PARAMETER_KEY = "inference_type";

//inference type
var NONE_INFERENCE = "なし";
var NONE_INFERENCE_OPTION = "none";
var RDFS_INFERENCE = "RDFS";
var RDFS_INFERENCE_OPTION = "rdfs";

// queryType
var QTYPE_CLASS = 'class';
var QTYPE_PROPERTY = 'property';
var QTYPE_INSTANCE = 'instance';

// 検索対象オプション関連の定数
var URI = "URI";
var URI_SEARCH_TARGET_OPTION = "uri";
var LABEL = "ラベル";
var LABEL_SEARCH_TARGET_OPTION = "label";

// 検索オプション関連の定数
var SEARCH_OPTION = "検索オプション";
var EXACT_MATCH = "完全一致";
var EXACT_MATCH_SEARCH_OPTION = "exact_match";
var ANY_MATCH = "部分一致";
var ANY_MATCH_SEARCH_OPTION = "any_match";
var STARTS_WITH = "前方一致";
var STARTS_WITH_SEARCH_OPTION = "starts_with";
var ENDS_WITH = "後方一致";
var ENDS_WITH_SEARCH_OPTION = "ends_with";
var SIBLING_CLASSES = "兄弟クラス";
var SIBLING_CLASSES_SEARCH_OPTION = "sibling_classes";
var SUB_CLASSES = "下位クラス";
var SUB_CLASSES_SEARCH_OPTION = "sub_classes";
var PROPERTIES_OF_DOMAIN_CLASS = "定義域クラスのプロパティ";
var PROPERTIES_OF_DOMAIN_CLASS_SEARCH_OPTION = "properties_of_domain_class";
var PROPERTIES_OF_RANGE_CLASS = "値域クラスのプロパティ";
var PROPERTIES_OF_RANGE_CLASS_SEARCH_OPTION = "properties_of_range_class";
var DOMAIN_CLASSES_OF_PROPERTY = "プロパティの定義域";
var DOMAIN_CLASSES_OF_PROPERTY_SEARCH_OPTION = "domain_classes_of_property";
var RANGE_CLASSES_OF_PROPERTY = "プロパティの値域";
var RANGE_CLASSES_OF_PROPERTY_SEARCH_OPTION = "range_classes_of_property";
var INSTANCES_OF_CLASS = "クラスのインスタンス";
var INSTANCES_OF_CLASS_SEARCH_OPTION = "instances_of_class";
var TYPES_OF_INSTANCE = "インスタンスのタイプ";
var TYPES_OF_INSTANCE_SEARCH_OPTION = "types_of_instance";
var INVERSE_STATEMENTS = "逆関係のステートメント";
var INVERSE_STATEMENTS_SEARCH_OPTION = "inverse";
var PATH_TO_ROOT_CLASS = "ルートクラスまでのパス";
var PATH_TO_ROOT_CLASS_SEARCH_OPTION = "path_to_root_class";

// order by 関連の定数
var NAME_ASC = "名前（昇順）";
var NAME_ASC_OPTION = "name_asc";
var NAME_DESC = "名前（降順）";
var NAME_DESC_OPTION = "name_desc";
var INSTANCE_COUNT_ASC = "インスタンス数（昇順）";
var INSTANCE_COUNT_ASC_OPTION = "instance_count_asc";
var INSTANCE_COUNT_DESC = "インスタンス数（降順）";
var INSTANCE_COUNT_DESC_OPTION = "instance_count_desc";

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