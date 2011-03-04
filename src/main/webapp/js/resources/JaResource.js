/*
 * Author: Takeshi Morita
 * Contact: t_morita@ae.keio.ac.jp
 * Copyright © 2009-2011 慶應義塾大学 理工学部 管理工学科 山口研究室．
 */

var WIKIPEDIA_ONTOLOGY_SEARCH = WIKIPEDIA_ONTOLOGY_SEARCH || {};

WIKIPEDIA_ONTOLOGY_SEARCH.resources = {
    appTitle : "日本語Wikipediaオントロジー検索インタフェース",
    keyword : "キーワード",
    search : "検索",
    register : "登録",
    clear : "クリア",
    domain : "定義域",
    range : "値域",
    classList : "クラス一覧",
    propertyList : "プロパティ一覧",
    instanceList : "インスタンス一覧",
    resourceType : "リソースのタイプ",
    searchTarget : "検索対象",
    useInferenceModel : "推論モデルの利用",
    numberOfStatements : "表示ステートメント数",
    communicationError : "通信エラー",
    status : "ステータス",
    statement : "ステートメント",
    newTab : "新しいタブ",
    addTab : "タブを追加",
    openNewTab : "新しいタブで開く",
    openRDFFile : "RDFファイルを開く",
    subject : "主語",
    predicate : "述語",
    object : "目的語",
    sortingOrder : "ソート順",
    numberOfInstances : "インスタンス数",
    dateAndHour : "日時",
    registeredDateAndHour : "登録日時",
    updateDateAndHour : "更新日時",
    update: "更新",
    remove: "削除",
    query : "クエリ",
    description: "説明",
    queryResults: "クエリ結果",
    registeredQuery: "登録クエリ",
    sparqlQuery: "SPARQLクエリ",
    sparqlQueryDescription: "SPARQLクエリの説明",
    url : "URL",
    uri : "URI",
    searchHistory : "検索履歴",
    openSelectedHistory : "選択した履歴を開く",
    addSelectedHistoriesToBookmark : "選択した履歴をブックマークに追加",
    removeSelectedHistories : "選択した履歴を削除",
    removeAllHistory : "すべての履歴を削除",
    bookmark : "ブックマーク",
    openSelectedBookmark : "選択したブックマークを開く",
    removeSelectedBookmarks : "選択したブックマークを削除",
    import_bookmarks : "インポート",
    export_bookmarks : "エクスポート",
    importOrExportBookmarks : 'ブックマークのインポート/エクスポート',
    close : "閉じる",
    classHierarchy : "クラス階層",
    wholeClassHierarchy : "全クラス階層",
    findClassesOrInstances : "クラスまたはインスタンスを検索",
    findClasses : "クラスを検索",
    expandAll : "階層をすべて開く",
    collapseAll : "階層をすべて閉じる",
    rootClass : "ルートクラス",
    bookmarkAndSearchHistory : "ブックマークと検索履歴",
    aboutClassHierarchy : "クラス階層関連",
    showClassHierarchy : "クラス階層を表示",
    expandAllClassHierarchy : "クラス階層をすべて展開して表示する",
    aboutRDFXML : "RDF/XML関連",
    aboutStatementTable : "ステートメントテーブル関連",
    closeGroupingStatements : "グルーピングをすべて閉じた状態で表示",
    option : "オプション",
    versionInformation : "バージョン情報",
    tool : "ツール",
    help : "ヘルプ",
    version : "バージョン",
    showWholeClassHierarchy : "全クラス階層を表示",
    hierarchy : "階層表示",
    statisticsInformation : "統計情報",
    numberOfResources : "リソース数",
    numberOfClasses : "クラス数",
    numberOfProperties : "プロパティ数",
    numberOfInstances : "インスタンス数",
    totalNumberOfStatements : "全ステートメント数: 7,588,865",
    numberOfIsaRelationships : "Is-a関係数",
    numberOfTypesOfInstances : "インスタンスのタイプ数",
    menu : "メニュー",
    sourceCode : "ソースコード",
    language : "言語",
    english : "English",
    japanese : "日本語",
    loading : "読み込み中・・・",
    searching : "検索中・・・",
    helpHTML : "help.html",
    manual : "マニュアル",
    manualHTML : "manual.html",
    searchEnHTML : "en_search.html",
    searchJaHTML : "search.html",
    getSearchKeywordLabel:function(keyword) {
        return keyword + "を検索";
    },
    getNarrowDownKeywordLabel: function(keyword) {
        return keyword + "で絞り込む";
    },
    getAddKeywordToBookmarkLabel:function(keyword) {
        return keyword + "をブックマークに追加";
    },
    getRemoveKeywordFromBookmarkLabel:function(keyword) {
        return keyword + "をブックマークから削除";
    },
    getRemoveKeywordFromHistoryLabel:function(keyword) {
        return keyword + "を検索履歴から削除";
    }
};

var LOADING = "読み込み中・・・";

WIKIPEDIA_ONTOLOGY_SEARCH.inferenceOptionLabels = {
    rdfs: "RDFS",
    none: "なし"
};

WIKIPEDIA_ONTOLOGY_SEARCH.resourceTypeLabels = {
    Class: "クラス",
    Property: "プロパティ",
    Instance: "インスタンス"
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


