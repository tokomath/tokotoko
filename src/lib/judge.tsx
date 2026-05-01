import nerdamer from 'nerdamer';

enum JudgeResult {
  Unknown,
  MabyCorrect,
  Correct,
}

export default function judge(correct_answer_tex: string, your_answer_tex: string) {
  correct_answer_tex = trimSpace(correct_answer_tex);
  your_answer_tex = trimSpace(your_answer_tex);

  let c_f = format(correct_answer_tex);
  let y_f = format(your_answer_tex);

  if (correct_answer_tex === your_answer_tex) {
    return JudgeResult.Correct;
  } else if (c_f === y_f) {
    return JudgeResult.Correct;
  }

  const c_f_no_space = c_f.replace(/\s/g, '');
  const y_f_no_space = y_f.replace(/\s/g, '');
  if (c_f_no_space !== "" && c_f_no_space === y_f_no_space) {
    return JudgeResult.Correct;
  }

  const c_struct = getNormalizedStructure(c_f);
  const y_struct = getNormalizedStructure(y_f);

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

  if (operators.some(op => op === '>' || op === '\\ge')) {
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
    .replace(/\\(leqslant|leqq|leq)/g, '\\le')
    .replace(/\\(geqslant|geqq|geq)/g, '\\ge')
    .replace(/\\neq/g, '\\ne')
    .replace(/\\(le|ge|ne|pm|mp|times|div|sqrt|sin|cos|tan|log|ln|pi)([a-zA-Z0-9])/g, '\\$1 $2')
    .replace(/[＝=]/g, '=')
    .replace(/[≠]/g, '\\ne')
    .replace(/[＞>]/g, '>')
    .replace(/[＜<]/g, '<')
    .replace(/[≧≥]/g, '\\ge')
    .replace(/[≦≤]/g, '\\le')
    .replace(/[±]/g, '\\pm')
    .replace(/[×]/g, '\\times')
    .replace(/[÷／]/g, '\\div')
    .replace(/[－—–ー⁻−]/g, '-') 
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