export const msg = {
    // 汎用
    "DAY": "日",
    "HOUR": "時間",
    "MINUTE": "分",
    "SECOND": "秒",
    "BEFORE": "前",
    "AFTER": "後",
    "REST_OF": "残り",
    "START": "開始",
    "END": "終了",
    "CANCEL": "キャンセル",
    "SUBMIT": "提出",
    "BACK": "戻る",
    "YES": "はい",
    "NO": "いいえ",
    "OK": "OK",
    "MANAGE": "管理",
    "LOADING": "読み込み中...",

    // クラス参加ページ
    // /join/JoinClient.tsx
    "JOINED": "に参加しました。",
    "JOIN_ERROR": "クラスへの参加に失敗しました。",
    "EXIST": " が存在します。",
    "NOT_EXIST": "このクラスコードは存在しません。",
    "JOIN_CLASS": "クラスに参加",
    "ENTER_CODE": "参加するクラスのコードを入力してください。",
    "CLASSCODE": "クラスコード",
    "JOIN": "参加",

    // マイページ 一部上より流用有
    // /mypage/student/page.tsx
    // /mypage/teacher/page.tsx
    "NO_TEST": "テストはありません",
    "CLASS": "クラス",
    "TEST": "テスト",
    "CLASS_NAME": "クラス名",
    "CREATE_CLASS": "新規クラスを作成",
    "CREATE_TEST": "新規テストを作成",
    "TESTS_IN_CLASS": "テスト一覧",
    "CLASS_CREATED": "クラスを作成しました",
    "ERROR_NO_CLASS_NAME": "クラス名を入力してください。",
    "ERROR_NO_TEACHER": "最低一人の教師を追加してください。",
    "SEARCH_STUDENT": "学生検索",
    "SEARCH_TEACHER": "教師検索",
    "DELETE_USER": "削除",

    // マイページ用テストカード
    // /compornents/StudentTestCard.tsx
    "SUBMITTED": "提出済",
    "NOT_SUBMITTED": "未提出",

    // /compornents/TestCards.tsx
    "SOLVE": "解答",
    "GRADING": "採点",
    "EDIT": "編集",

    // テスト作成ページ
    // /teacher/create/page.tsx
    "CREATE_NEW_TEST": "新規テスト作成",
    "EDIT_TEST": "テストの編集",
    "PUBLISH_TEST": "テストを公開",
    "PUBLISHED": "公開中",
    "UNPUBLISHED": "非公開",
    "SAVE": "保存",
    "SUCCESS_CREATE_TEST": "テストの作成が完了しました",
    "SUCCESS_SAVE_TEST": "テストを保存しました",
    "OPEN_JSON": "テストを開く",
    "SAVE_JSON": "テストを保存",
    "ERROR_TEST_NOT_FOUND": "指定されたテストが見つからないか、アクセス権限がありません。",
    "ERROR_FILE_LOAD": "ファイルの読み込みに失敗しました。形式を確認してください。",

    // バリデーション・エラー
    "ERROR_START_AFTER_END": "開始日が締め切りより後です",
    "ERROR_NO_CLASS": "クラスが選択されていません",
    "ERROR_CONTENT_MISSING": "コンテンツが挿入されていません",
    "WARNING_START_DATE_PAST": "開始日が現在日より前です",

    // メタデータタブ
    "METADATA": "基本設定",
    "BASIC_INFO": "基本情報",
    "TEST_TITLE": "テストタイトル",
    "TEST_SUMMARY": "説明 / 概要",
    "SCHEDULE": "スケジュール",
    "START_DATE": "開始日",
    "END_DATE": "終了日",
    "ASSIGNMENT": "割り当て",
    "TARGET_CLASS": "対象クラス",

    // セクションタブ
    "SECTION_NUMBER": "大問",
    "ADD_SECTION": "セクション追加",
    "SECTION_SETTINGS": "設定",
    "DELETE_SECTION": "セクションを削除",
    "SECTION_SUMMARY_LABEL": "セクション概要",
    "PREVIEW": "プレビュー",
    "QUESTIONS_LIST": "問題一覧",
    "ADD_QUESTION": "問題を追加",
    "ADD_ANOTHER_QUESTION": "次の問題を追加",
    "NO_QUESTIONS_ALERT": "問題がまだ追加されていません。「問題を追加」をクリックして開始してください。",

    // 問題カード
    "QUESTION_NUMBER_PREFIX": "問",
    "QUESTION_TEXT_LABEL": "問題文 ",
    "QUESTION_PREVIEW": "問題プレビュー",
    "MEDIA_ATTACHMENT": "メディア添付",
    "ATTACHMENT_TYPE": "添付タイプ",
    "NO_ATTACHMENT": "添付なし",
    "UPLOAD_FILE": "アップロード",
    "FILE_UPLOADED": "ファイルアップロード済",
    "ATTACHMENT_PREVIEW": "添付プレビュー",
    "ANSWER_KEY": "解答設定",
    "ANSWER_FORMULA_LABEL": "正答 (LaTeX)",
    "ANSWER_PLACEHOLDER": "例: x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",

    // 結果ページ
    // /test/[id]/result/page.tsx (等)
    "CANT_OPEN_PAGE": "ページを開けません",
    "FORM_ID": "フォームID:",
    "NOT_GRADED": "未採点",
    "POINT_DISPLAY": "点数: {n} 点",
    "TRUE_ANS": "正答",
    "PREV_PART": "前のパート",
    "NEXT_PART": "次のパート",
    "SCORE": "点数",
    "POINTS": "点",

    // 解答ページ
    // /test/[id]/page.tsx
    "NO_TEST_FOUND": "テストが見つかりません",
    "SUBMISSION_COMPLETED": "提出完了",
    "CHECK_RESULTS": "結果を確認する ＞",
    "ERROR": "エラー",
    "SENT": "提出しました！",
    "SEND_FAILED": "提出に失敗しました",
    "SEND": "提出",
    "SENDING": "送信中...",

    //  /teacher/grading/[testid]/page.tsx
    "PART": "Part",
    "NO_TEST_DATA": "テストデータが見つかりません。",
    "TOTAL_POINT": "合計点",
    "UNGRADED_COUNT": "未採点",
    "SUCCESS_SAVE_GRADING": "採点データを保存しました。",
    "ERROR_OCCURRED": "エラーが発生しました。",
    "EXPORT_CSV": "CSVエクスポート",
    "CLASS_ID": "クラスID",
    "TEST_ID": "テストID",
    "CSV_PART_QNUMBER": "Part-QNumber",
    "CSV_QUESTION": "Question",
    "CSV_ANSWER": "Answer",

    // class
    "EDIT_CLASS": "クラスを編集",
    "UPDATE_CLASS": "クラスを更新する",
    "SUCCESS_UPDATE": "クラスを更新しました",
    "ADDED_STUDENTS": "追加済みの学生",
    "ADDED_TEACHERS": "追加済みの教師",
    "CLASS_INFO": "クラス基本情報",
    "STUDENT_SECTION": "学生の管理",
    "TEACHER_SECTION": "教師の管理",
    "SEARCH_PLACEHOLDER_STUDENT": "名前やメールアドレスで学生を検索",
    "SEARCH_PLACEHOLDER_TEACHER": "名前やメールアドレスで教師を検索",
    "CURRENT_MEMBERS": "現在のメンバー",
    "NO_MEMBERS": "メンバーが追加されていません",
}
