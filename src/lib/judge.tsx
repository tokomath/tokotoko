import nerdamer from 'nerdamer';

// 判定結果の定義[cite: 3]
enum JudgeResult {
  Unknown,
  MabyCorrect,
  Correct,
}

export default function judge(correct_answer_tex: string, your_answer_tex: string) {
  // 文字列の前後空白を削除[cite: 3]
  correct_answer_tex = trimSpace(correct_answer_tex);
  your_answer_tex = trimSpace(your_answer_tex);

  // フォーマット処理の適用
  let c_f = format(correct_answer_tex);
  let y_f = format(your_answer_tex);

  if (correct_answer_tex === your_answer_tex) {
    console.log("完全一致");
    return JudgeResult.Correct;
  } else if (c_f === y_f) {
    console.log("フォーマットすると一致");
    return JudgeResult.Correct;
  }

  // 数学的な等価判定[cite: 3]
  try {
    let c_n = nerdamer.convertFromLaTeX(correct_answer_tex.replace(/\$/g, ''));
    let y_n = nerdamer.convertFromLaTeX(your_answer_tex.replace(/\$/g, ''));

    if (nerdamer(c_n).eq(y_n)) {
      console.log("数式が一致");
      return JudgeResult.MabyCorrect;
    } else if (c_n.toString() === y_n.toString()) {
      console.log("数式の文字列が一致");
      return JudgeResult.MabyCorrect;
    }
  } catch (e) { }

  try {
    let c_f_n = nerdamer.convertFromLaTeX(c_f.replace(/\$/g, ''));
    let y_f_n = nerdamer.convertFromLaTeX(y_f.replace(/\$/g, ''));

    if (nerdamer(c_f_n).eq(y_f_n)) {
      console.log("フォーマットすると数式が一致");
      return JudgeResult.MabyCorrect;
    }
  } catch (e) { }

  return JudgeResult.Unknown;
}

function trimSpace(input: string): string {
  // 先頭と末尾の空白を削除[cite: 3]
  return input.replace(/^\s+|\s+$/g, '');
}

function zenkakuToHankaku(str: string): string {
  // 全角英数字を半角に変換、全角カンマを置換
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/，/g, ',');
}

// 記号や特定のコマンドを標準的な形式に置換する関数
function normalizeTeXCommand(input: string): string {
  return input
    // コマンドの標準化
    .replace(/\\dfrac/g, '\\frac')
    .replace(/\\tfrac/g, '\\frac')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\geqq/g, '\\ge') // 日本語環境の不等号を標準へ
    .replace(/\\leqq/g, '\\le')
    
    // Unicode記号をTeXコマンドへ置換
    .replace(/＝/g, '=')
    .replace(/≠/g, '\\ne')
    .replace(/[≧≥]/g, '\\ge')
    .replace(/[≦≤]/g, '\\le')
    .replace(/±/g, '\\pm')
    .replace(/∓/g, '\\mp')
    .replace(/×/g, '\\times')
    .replace(/[÷／]/g, '\\div')
    .replace(/∞/g, '\\infty')
    .replace(/∴/g, '\\therefore')
    .replace(/∵/g, '\\because')
    .replace(/∽/g, '\\backsim')
    .replace(/∝/g, '\\propto')
    .replace(/√/g, '\\sqrt')
    .replace(/π/g, '\\pi')
    .replace(/≡/g, '\\equiv')
    .replace(/≒/g, '\\approx')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/＋/g, '+')
    .replace(/[－—–]/g, '-') // 各種ダッシュ・マイナス記号を統一
    
    // 不要なレイアウト用コマンドの削除
    .replace(/\\[,;:!]/g, '')
    .replace(/\\quad/g, '')
    .replace(/\\qquad/g, '');
}

function formatMixedTeX(input: string): string {
  if (!input) return "";
  const noDollar = input.replace(/\$/g, "");
  // 半角文字ブロックを抽出して$で囲む
  return noDollar.replace(/[\x20-\x7E]+/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed || /^[,]+$/.test(trimmed)) {
      return match;
    }
    return match.replace(trimmed, () => `$${trimmed}$`);
  });
}

function format(input: string): string {
  // 1. 全角を半角へ 2. 記号をTeXへ 3. $の位置を正規化
  let str = zenkakuToHankaku(input);
  str = normalizeTeXCommand(str);
  str = formatMixedTeX(str);

  return trimSpace(
    str
      // バックスラッシュの手前を半角空白1つにする[cite: 3]
      .replace(/\s*(?<!\\)(?=\\)/g, ' ')
      // 英字と数字の間にスペースを追加[cite: 3]
      .replace(/([a-z])([0-9])/g, '$1 $2')
      // 改行をスペースへ[cite: 3]
      .replace(/\n/g, ' ')
      // 全角スペースを半角スペースへ[cite: 3]
      .replace(/　/g, ' ')
      // 特定記号の前後にスペースを追加[cite: 3]
      .replace(/([&|()[\]{}])/g, ' $1 ')
      // 連続バックスラッシュにスペースを追加[cite: 3]
      .replace(/(\\\\)/g, ' $1 ')
      // 2つ以上の空白を1つに集約[cite: 3]
      .replace(/\s\s+/g, ' ')
  );
}