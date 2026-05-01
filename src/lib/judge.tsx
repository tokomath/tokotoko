import nerdamer from 'nerdamer';

// 判定結果の定義[cite: 3]
enum JudgeResult {
  Unknown,      // 0: 判定不能または不一致
  MabyCorrect,  // 1: 数学的に等価
  Correct,      // 2: 文字列またはフォーマット後の一致
}

/**
 * 正解と入力された解答を比較判定するメイン関数[cite: 3, 8]
 */
export default function judge(correct_answer_tex: string, your_answer_tex: string) {
  // 文字列の前後空白を削除[cite: 3]
  correct_answer_tex = trimSpace(correct_answer_tex);
  your_answer_tex = trimSpace(your_answer_tex);

  // 1. フォーマット処理（表記揺れの吸収）を適用[cite: 8]
  let c_f = format(correct_answer_tex);
  let y_f = format(your_answer_tex);

  // 2. 文字列レベルでの一致判定（完全一致またはフォーマット後一致）[cite: 8]
  if (correct_answer_tex === your_answer_tex) {
    console.log("完全一致");
    return JudgeResult.Correct;
  } else if (c_f === y_f) {
    console.log("フォーマットすると一致");
    return JudgeResult.Correct;
  }

  // 3. すべての空白を削除して一致判定（日本語と数式の境界のスペース等を無視）
  const c_f_no_space = c_f.replace(/\s/g, '');
  const y_f_no_space = y_f.replace(/\s/g, '');
  if (c_f_no_space !== "" && c_f_no_space === y_f_no_space) {
    console.log("空白をすべて削除すると一致");
    return JudgeResult.Correct;
  }

  // 4. 数学的な等価判定 (Nerdamerを使用)[cite: 3, 8]
  try {
    // $マークを削除して純粋な数式としてパース
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

  // 5. フォーマット済みの文字列で数学的な等価判定[cite: 8]
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

/**
 * 前後の空白削除[cite: 3]
 */
function trimSpace(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}

/**
 * 全角英数字・記号を半角に変換し、句読点を正規化[cite: 8]
 */
function zenkakuToHankaku(str: string): string {
  return str
    // 全角英数字を半角へ[cite: 8]
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 全角スペースを半角へ（数式の分断を防ぐ重要処理）[cite: 8]
    .replace(/　/g, ' ')
    // 記号・括弧の置換[cite: 8]
    .replace(/[，、]/g, ',')
    .replace(/[．。]/g, '.')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/｛/g, '{')
    .replace(/｝/g, '}');
}

/**
 * Unicode記号や特定のTeXコマンドを標準形式に置換[cite: 8]
 */
function normalizeTeXCommand(input: string): string {
  return input
    // LaTeXコマンドの標準化[cite: 8]
    .replace(/\\dfrac/g, '\\frac')
    .replace(/\\tfrac/g, '\\frac')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\geqq/g, '\\ge')
    .replace(/\\leqq/g, '\\le')
    
    // Unicode数学記号をTeX/標準記号へ置換[cite: 8]
    .replace(/[＝=]/g, '=')
    .replace(/[≠]/g, '\\ne')
    .replace(/[＞>]/g, '>')
    .replace(/[＜<]/g, '<')
    .replace(/[≧≥]/g, '\\ge')
    .replace(/[≦≤]/g, '\\le')
    .replace(/[±]/g, '\\pm')
    .replace(/[∓]/g, '\\mp')
    .replace(/[×]/g, '\\times')
    .replace(/[÷／]/g, '\\div')
    .replace(/[∞]/g, '\\infty')
    .replace(/[∴]/g, '\\therefore')
    .replace(/[∵]/g, '\\because')
    .replace(/[∽]/g, '\\backsim')
    .replace(/[∝]/g, '\\propto')
    .replace(/[√]/g, '\\sqrt')
    .replace(/[π]/g, '\\pi')
    .replace(/[≡]/g, '\\equiv')
    .replace(/[≒]/g, '\\approx')
    .replace(/[＋+]/g, '+')
    // マイナス記号のバリエーションを統一[cite: 8]
    .replace(/[－—–ー一⁻−]/g, '-') 
    
    // 図形・集合記号等[cite: 8]
    .replace(/[∠]/g, '\\angle')
    .replace(/[⊥]/g, '\\perp')
    .replace(/[△]/g, '\\triangle')
    .replace(/[平行]/g, '\\parallel')
    .replace(/[°]/g, '^{\\circ}')
    .replace(/[∂]/g, '\\partial')
    .replace(/[∫]/g, '\\int')
    .replace(/[∑]/g, '\\sum')
    
    // 不要なレイアウト用コマンドの削除[cite: 8]
    .replace(/\\[,;:!]/g, '')
    .replace(/\\quad/g, '')
    .replace(/\\qquad/g, '');
}

/**
 * 日本語混じりのテキストから数式部分を抽出して$で囲む[cite: 8]
 */
export function formatMixedTeX(input: string): string {
  if (!input) return "";
  const noDollar = input.replace(/\$/g, "");
  return noDollar.replace(/[\x20-\x7E]+/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed || /^[,]+$/.test(trimmed)) {
      return match;
    }
    return match.replace(trimmed, () => `$${trimmed}$`);
  });
}

/**
 * 表記揺れを吸収する総合フォーマット関数[cite: 8]
 */
export function format(input: string): string {
  // 1. 全角を半角へ、記号を標準化[cite: 8]
  let str = zenkakuToHankaku(input);
  str = normalizeTeXCommand(str);
  
  // 2. 記号周りの空白を詰め、数式を一塊のブロックにする処理[cite: 8]
  str = str.replace(/\s+/g, ' ');
  str = str.replace(/\s?([=+\-*/^(),<>])\s?/g, '$1');

  // 3. テキスト中の数式部分を$で囲む[cite: 8]
  str = formatMixedTeX(str);

  // 4. 最終的な読みやすさ・比較用の微調整[cite: 3, 8]
  return trimSpace(
    str
      .replace(/\n/g, ' ')
      .replace(/\s*(?<!\\)(?=\\)/g, ' ')
      .replace(/([a-z])([0-9])/g, '$1 $2')
      .replace(/([&|[\]{}])/g, ' $1 ')
      .replace(/(\\\\)/g, ' $1 ')
      .replace(/\s\s+/g, ' ')
  );
}