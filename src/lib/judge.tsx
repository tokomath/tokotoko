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

  // 1. 文字列としての完全一致判定[cite: 8]
  if (correct_answer_tex === your_answer_tex) {
    console.log("完全一致");
    return JudgeResult.Correct;
  } else if (c_f === y_f) {
    console.log("フォーマットすると一致");
    return JudgeResult.Correct;
  }

  // 2. 数学的な等価判定 (Nerdamerを使用)[cite: 3, 8]
  try {
    // $を取り除き、純粋な数式として評価
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

  // 3. フォーマット後の数式一致判定[cite: 3, 8]
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

// 先頭と末尾の空白を削除[cite: 3, 8]
function trimSpace(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}

// 全角文字を半角に、句読点をカンマ・ピリオドに変換
function zenkakuToHankaku(str: string): string {
  return str
    // 英数字の変換[cite: 8]
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 記号・括弧の変換
    .replace(/[，、]/g, ',') // 全角カンマと読点
    .replace(/[．。]/g, '.') // 全角ピリオドと句点
    .replace(/（/g, '(')   // 丸括弧
    .replace(/）/g, ')')
    .replace(/［/g, '[')   // 角括弧
    .replace(/］/g, ']')
    .replace(/｛/g, '{')   // 中括弧
    .replace(/｝/g, '}');
}

// 記号やコマンドの標準化
function normalizeTeXCommand(input: string): string {
  return input
    // コマンドの標準化[cite: 8]
    .replace(/\\dfrac/g, '\\frac')
    .replace(/\\tfrac/g, '\\frac')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\geqq/g, '\\ge')
    .replace(/\\leqq/g, '\\le')
    
    // Unicode記号をTeXに置換[cite: 8]
    .replace(/＝/g, '=')
    .replace(/≠/g, '\\ne')
    .replace(/[≧≥]/g, '\\ge')
    .replace(/[≦≤]/g, '\\le')
    .replace(/±/g, '\\pm')
    .replace(/×/g, '\\times')
    .replace(/[÷／]/g, '\\div')
    // マイナス記号のバリエーションを網羅 (長音、漢字の一、各種ダッシュ)
    .replace(/[－—–ー一⁻−]/g, '-') 
    .replace(/√/g, '\\sqrt')
    .replace(/π/g, '\\pi')
    .replace(/≡/g, '\\equiv')
    .replace(/≒/g, '\\approx')
    .replace(/＋/g, '+')
    
    // 不要な空白用コマンドの削除[cite: 8]
    .replace(/\\[,;:!]/g, '')
    .replace(/\\quad/g, '')
    .replace(/\\qquad/g, '');
}

// 日本語が混在した入力の$位置を標準化[cite: 8]
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

// 最終的なフォーマット処理
function format(input: string): string {
  let str = zenkakuToHankaku(input);
  str = normalizeTeXCommand(str);
  str = formatMixedTeX(str);

  return trimSpace(
    str
      // 1. 改行や全角スペースを半角スペースへ[cite: 3, 8]
      .replace(/\n/g, ' ')
      .replace(/　/g, ' ')
      // 2. 連続する空白を1つに集約
      .replace(/\s+/g, ' ')
      // 3. 演算子やカンマ周りの空白を詰める (表記揺れ吸収のため)
      .replace(/\s?([,()=+-])\s?/g, '$1')
      // 4. バックスラッシュの手前を半角空白1つにする[cite: 3, 8]
      .replace(/\s*(?<!\\)(?=\\)/g, ' ')
      // 5. 英字と数字の間にスペースを追加[cite: 3, 8]
      .replace(/([a-z])([0-9])/g, '$1 $2')
      // 6. 特定記号の前後にはスペースを入れる[cite: 3, 8]
      .replace(/([&|[\]{}])/g, ' $1 ')
      // 7. 連続バックスラッシュ（\\）にスペースを追加[cite: 3, 8]
      .replace(/(\\\\)/g, ' $1 ')
      // 8. 最後に再度空白の連続を1つに集約
      .replace(/\s\s+/g, ' ')
  );
}