import nerdamer from 'nerdamer';

// 判定結果の定義[cite: 3]
enum JudgeResult {
  Unknown,      // 0: 不一致
  MabyCorrect,  // 1: 数学的に等価
  Correct,      // 2: 文字列レベルで一致
}

/**
 * メイン判定関数[cite: 3, 8]
 */
export default function judge(correct_answer_tex: string, your_answer_tex: string) {
  correct_answer_tex = trimSpace(correct_answer_tex);
  your_answer_tex = trimSpace(your_answer_tex);

  // フォーマット処理（表記揺れの吸収）を適用
  let c_f = format(correct_answer_tex);
  let y_f = format(your_answer_tex);

  // 1. 文字列レベルでの一致判定
  if (correct_answer_tex === your_answer_tex) {
    return JudgeResult.Correct;
  } else if (c_f === y_f) {
    return JudgeResult.Correct;
  }

  // 2. 空白除去後の一致判定
  const c_f_no_space = c_f.replace(/\s/g, '');
  const y_f_no_space = y_f.replace(/\s/g, '');
  if (c_f_no_space !== "" && c_f_no_space === y_f_no_space) {
    return JudgeResult.Correct;
  }

  // 3. 構造比較（向きを正規化して比較）
  const c_struct = getNormalizedStructure(c_f);
  const y_struct = getNormalizedStructure(y_f);

  // 不等号の種類（< か \le か）が一致しているか確認
  if (JSON.stringify(c_struct.operators) === JSON.stringify(y_struct.operators)) {
    let allPartsMatch = true;
    for (let i = 0; i < c_struct.parts.length; i++) {
      if (!isMathematicallyEqual(c_struct.parts[i], y_struct.parts[i])) {
        allPartsMatch = false;
        break;
      }
    }
    if (allPartsMatch) {
      console.log("構造（正規化済）と各パーツが一致");
      return JudgeResult.MabyCorrect;
    }
  }

  return JudgeResult.Unknown;
}

/**
 * 式をパーツと演算子に分解し、向きを「<, \le」側に統一する[cite: 8]
 */
function getNormalizedStructure(tex: string) {
  const clean = tex.replace(/\$/g, '').trim();
  const tokens = clean.split(/(=|<|>|\\le|\\ge|,)/);
  
  let parts: string[] = [];
  let operators: string[] = [];

  tokens.forEach((token, i) => {
    if (i % 2 === 0) {
      parts.push(token.trim());
    } else {
      operators.push(token.trim());
    }
  });

  // 不等号の向きを「<」や「\le」の方向に統一する（例: 0 >= y >= -5 -> -5 <= y <= 0）[cite: 8]
  if (operators.some(op => op === '>' || op === '\\ge')) {
    // すべての演算子が「>」系、または「=」や「,」であれば反転可能と判断
    const canFlip = operators.every(op => op === '>' || op === '\\ge' || op === '=' || op === ',');
    
    if (canFlip) {
      parts = parts.reverse();
      operators = operators.reverse().map(op => {
        if (op === '>') return '<';
        if (op === '\\ge') return '\\le';
        return op;
      });
    }
  }

  return { parts, operators };
}

/**
 * 数学的等価判定（Nerdamer）[cite: 3, 8]
 */
function isMathematicallyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  try {
    const a_n = nerdamer.convertFromLaTeX(a);
    const b_n = nerdamer.convertFromLaTeX(b);
    return nerdamer(a_n).eq(b_n) || a_n.toString() === b_n.toString();
  } catch (e) {
    return false;
  }
}

function trimSpace(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}

function zenkakuToHankaku(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/　/g, ' ')
    .replace(/[，、]/g, ',')
    .replace(/[．。]/g, '.')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/｛/g, '{')
    .replace(/｝/g, '}');
}

function normalizeTeXCommand(input: string): string {
  return input
    .replace(/\\dfrac/g, '\\frac')
    .replace(/\\tfrac/g, '\\frac')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\(geqq|leq|leq)/g, '\\le')
    .replace(/\\(≧|geqq|geq|geq)/g, '\\ge')
    .replace(/\\(le|ge|pm|mp|times|div|sqrt|sin|cos|tan|log|ln|pi)([a-zA-Z0-9])/g, '\\$1 $2')
    .replace(/[＝=]/g, '=')
    .replace(/[≠]/g, '\\ne')
    .replace(/[＞>]/g, '>')
    .replace(/[＜<]/g, '<')
    .replace(/[≧≥]/g, '\\ge')
    .replace(/[≦≤]/g, '\\le')
    .replace(/[±]/g, '\\pm')
    .replace(/[×]/g, '\\times')
    .replace(/[÷／]/g, '\\div')
    .replace(/[－—–ー一⁻−]/g, '-') 
    .replace(/[√]/g, '\\sqrt')
    .replace(/[π]/g, '\\pi')
    .replace(/[＋+]/g, '+')
    .replace(/\\[,;:!]/g, '')
    .replace(/\\quad/g, '')
    .replace(/\\qquad/g, '');
}

function removeRedundantBraces(str: string): string {
  return str.replace(/(?<!\\[a-zA-Z]+)\{([a-zA-Z0-9]+)\}/g, '$1');
}

export function formatMixedTeX(input: string): string {
  if (!input) return "";
  const noDollar = input.replace(/\$/g, "");
  return noDollar.replace(/[\x20-\x7E]+/g, (match) => {
    const trimmed = match.trim();
    if (!trimmed || /^[,]+$/.test(trimmed)) return match;
    return match.replace(trimmed, () => `$${trimmed}$`);
  });
}

export function format(input: string): string {
  let str = zenkakuToHankaku(input);
  str = normalizeTeXCommand(str);
  str = removeRedundantBraces(str);
  str = str.replace(/\s+/g, ' ');
  str = str.replace(/\s?([=+\-*/^(),<>])\s?/g, '$1');
  str = formatMixedTeX(str);
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