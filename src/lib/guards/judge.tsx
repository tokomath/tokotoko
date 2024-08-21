//https://nerdamer.com/functions/nerdamer.convertFromLaTeX.html

import nerdamer from 'nerdamer';

enum JudgeResult {
  Unknown,      //0
  MabyCorrect,  //1
  Correct,      //2
}

export default function judge(correct_answer_tex: string, your_answer_tex: string) {
  // 文字列の先頭と最後のスペースを削除する
  correct_answer_tex = trimSpace(correct_answer_tex)
  your_answer_tex = trimSpace(your_answer_tex)

  // フォーマット
  let c_f = format(correct_answer_tex)
  let y_f = format(your_answer_tex)

  if (correct_answer_tex === your_answer_tex) {
    console.log("完全一致")
    return JudgeResult.Correct
  } else if (c_f === y_f) {
    console.log("フォーマットすると一致")
    return JudgeResult.Correct
  }

  // 数式の比較
  try {
    let c_n = nerdamer.convertFromLaTeX(correct_answer_tex)
    let y_n = nerdamer.convertFromLaTeX(your_answer_tex)

    if (nerdamer(c_n).eq(y_n)) {
      console.log("数式が一致")
      return JudgeResult.MabyCorrect
    } else if (c_n.toString() === y_n.toString()) {
      console.log("数式の文字列が一致")
      return JudgeResult.MabyCorrect
    }
  } catch (e) { }

  // フォーマットして数式の比較
  try {
    let c_f_n = nerdamer.convertFromLaTeX(c_f)
    let y_f_n = nerdamer.convertFromLaTeX(y_f)

    if (nerdamer(c_f_n).eq(y_f_n)) {
      console.log("フォーマットすると数式が一致")
      return JudgeResult.MabyCorrect
    }
  } catch (e) { }

  return JudgeResult.Unknown
}

// 文字列の先頭と最後のスペースを削除する
function trimSpace(input: string): string {
  // ^ 先頭の \s スペース + 1文字以上 
  // | または
  // \s スペース + 1文字以上  $ 最後
  // を削除する
  return input.replace(/^\s+|\s+$/g, '');
}

function format(input: string): string {
  return trimSpace( // 最初のスペースを削除
    input
      // もし \ の前が \ でなければ、\ の前にスペースを追加する
      .replace(/(?<!\\)\\/g, ' \\')
      // もし数字の前がアルファベットであれば、数字とアルファベットの間にスペースを追加する
      .replace(/([a-z])([0-9])/g, '$1 $2')
      // 改行をスペースに置き換える
      .replace(/\n/g, ' ')
      // 全角スペースを半角スペースに置き換える
      .replace(/　/g, ' ')
      // これらの記号の前後にスペースを追加する
      .replace(/([&|(|)|[|\]|{|}])/g, ' $1 ')
      .replace(/(\\\\)/g, ' $1 ')
      // スペースが2つ以上連続していたら1つにする
      .replace(/\s\s+/g, ' ')
  )
}

