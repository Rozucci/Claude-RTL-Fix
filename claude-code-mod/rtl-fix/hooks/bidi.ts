/**
 * The bidi engine: makes a Markdown text that mixes a right-to-left language
 * (Persian, Arabic, Urdu, Hebrew, or any language written in the Arabic,
 * Hebrew, Syriac, Thaana or N'Ko script) with English read in the right order.
 *
 * It works on the text itself, so any renderer benefits, with Unicode's own
 * direction marks (all invisible):
 *
 * - A line that is mostly right-to-left gets RLM + RLI ... PDI around it.
 *   RLM is a strong right-to-left letter, so a renderer that picks a
 *   paragraph's direction from its first strong letter (dir="auto") picks RTL.
 *   RLI ... PDI lays the content out right to left even where the renderer
 *   forces left-to-right, so punctuation and word order come out right.
 * - Inside such a line, every Latin run ("Claude Code", "WebGL 2", "f(x)") and
 *   every inline code span is wrapped in LRI ... PDI, so it keeps its own order
 *   and does not pull neighbouring punctuation across.
 *
 * - In a table row, each mostly right-to-left cell is fixed the same way; the pipes
 *   and the delimiter row stay as written.
 *
 * Left untouched: fenced code blocks, HTML lines, link targets, bare URLs and
 * email addresses (so they still turn into links), and lines that are mostly
 * English.
 */

export const LRI = '⁦'
export const RLI = '⁧'
export const PDI = '⁩'
export const RLM = '‏'

// Letters of the right-to-left scripts: Hebrew (Hebrew, Yiddish), Arabic
// (Arabic, Persian, Urdu, Pashto, Kurdish, Sindhi, Uyghur ...), Syriac, Thaana
// (Dhivehi), N'Ko, Samaritan, Mandaic, Hanifi Rohingya and Adlam (Fula).
const RTL_LETTER =
  '\\u05D0-\\u05EA\\u05EF-\\u05F2' + // Hebrew
  '\\u0620-\\u064A\\u066E-\\u06D3\\u06D5\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF' + // Arabic
  '\\u0710-\\u072F\\u074D-\\u074F' + // Syriac
  '\\u0750-\\u077F' + // Arabic Supplement
  '\\u0780-\\u07A5\\u07B1' + // Thaana
  '\\u07CA-\\u07EA' + // N'Ko
  '\\u0800-\\u0815' + // Samaritan
  '\\u0840-\\u0858' + // Mandaic
  '\\u08A0-\\u08FF' + // Arabic Extended-A
  '\\uFB1D-\\uFB4F' + // Hebrew presentation forms
  '\\uFB50-\\uFDFF\\uFE70-\\uFEFC' + // Arabic presentation forms
  '\\u{10D00}-\\u{10D23}' + // Hanifi Rohingya
  '\\u{1E900}-\\u{1E943}' // Adlam
const LATIN_LETTER = 'A-Za-z\\u00C0-\\u024F'

// Words, not letters, decide a line's language: Hebrew and Arabic leave most
// vowels unwritten, so their words are short next to English ones. A word
// keeps its combining marks (vowel signs) and, in Persian, the ZWNJ inside it.
const RTL_WORDS = new RegExp(`[${RTL_LETTER}][${RTL_LETTER}\\p{M}\\u200C]*`, 'gu')
const LATIN_WORDS = new RegExp(`[${LATIN_LETTER}][${LATIN_LETTER}\\p{M}'’]*`, 'gu')
const FIRST_STRONG = new RegExp(`[${RTL_LETTER}${LATIN_LETTER}]`, 'u')
const IS_RTL = new RegExp(`[${RTL_LETTER}]`, 'u')

// A Latin run: words that start with a Latin letter, joined by single spaces,
// with inner punctuation kept ("node.js", "C++", "f(x)"). A number written
// right before a Latin unit joins the run ("12.5 USD", "25°C"). Sentence
// punctuation, emphasis underscores and an unmatched ")" at its end are left
// outside the run.
const DIGIT = '0-9\\u0660-\\u0669\\u06F0-\\u06F9' // Western, Arabic-Indic, Persian
const QUANTITY = `(?:[${DIGIT}][${DIGIT}.,٫٬]*(?:[ \\u00A0]|°)?(?=[${LATIN_LETTER}]))?`
const LATIN_WORD = `${QUANTITY}[${LATIN_LETTER}][${LATIN_LETTER}0-9'’+#/@&_.:()\\-–]*`
const LATIN_NEXT = `[${LATIN_LETTER}0-9][${LATIN_LETTER}0-9'’+#/@&_.:()\\-–]*`
const LATIN_RUN = new RegExp(`${LATIN_WORD}(?:[ \\u00A0]${LATIN_NEXT})*`, 'g')
const LATIN_TRAILING = /[.:_\-–]+$/

// Pieces of a line that must not get marks inside them.
//  1. inline code: `x` or ``x``
//  2. a link or image target: ](...)
//  3. an autolink: <https://...>
//  4. a bare URL, or a www. address
//  5. an email address
// Marks next to a bare URL or email would end up inside the link GFM makes of
// it, or stop it becoming a link, so these stay exactly as written.
const PROTECTED =
  /(`+)[\s\S]*?\1|\]\([^)]*\)|<https?:\/\/[^>]*>|(?:https?:\/\/|www\.)[^\s<>]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g

// The structural prefix of a Markdown line: indentation, block quotes, a
// heading's hashes, a list marker and an optional task box.
// The trailing part keeps a hard line break (two spaces, or a backslash) at
// the very end, where Markdown looks for it.
const PREFIX =
  /^(\s*(?:>\s?)*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d{1,9}[.)]\s+)?)([\s\S]*?)(\\?\s*)$/

const TABLE_ROW = /^\s*\|/
const TABLE_DELIMITER = /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*(?::?-+:?\s*)?$/
const CELL = /^(\s*)([\s\S]*?)(\s*)$/

const FENCE = /^\s{0,3}(`{3,}|~{3,})/

const BIDI_MARK = /[⁦-⁩‎‏‪-‮]/

/** Strips the pieces whose letters should not decide a line's direction. */
function withoutProtected(text: string): string {
  return text.replace(PROTECTED, ' ')
}

/** True when a line of text should read right to left. */
export function isRtl(text: string): boolean {
  const plain = withoutProtected(text)
  const rtl = plain.match(RTL_WORDS)?.length ?? 0
  if (rtl === 0) return false

  const latin = plain.match(LATIN_WORDS)?.length ?? 0
  const first = FIRST_STRONG.exec(plain)?.[0] ?? ''

  return rtl >= latin || IS_RTL.test(first)
}

/** Splits a run into what to isolate and what to leave after it. */
function splitTrailing(run: string): [string, string] {
  let core = run
  let trailing = ''

  for (;;) {
    const punctuation = LATIN_TRAILING.exec(core)?.[0] ?? ''
    if (punctuation) {
      core = core.slice(0, -punctuation.length)
      trailing = punctuation + trailing
      continue
    }
    // "(با Node 26)": the ")" closes a bracket opened outside the run.
    const opened = core.split('(').length - 1
    const closed = core.split(')').length - 1
    if (core.endsWith(')') && closed > opened) {
      core = core.slice(0, -1)
      trailing = `)${trailing}`
      continue
    }

    return [core, trailing]
  }
}

/** Wraps the Latin runs of a plain (unprotected) stretch of text. */
function isolateLatin(text: string): string {
  return text.replace(LATIN_RUN, run => {
    const [core, trailing] = splitTrailing(run)
    if (!core) return run

    return `${LRI}${core}${PDI}${trailing}`
  })
}

/** The content of one RTL line, with its Latin runs and code isolated. */
function isolateContent(content: string): string {
  let out = ''
  let last = 0

  for (const match of content.matchAll(PROTECTED)) {
    const start = match.index ?? 0
    out += isolateLatin(content.slice(last, start))

    const piece = match[0]
    // Inline code and <autolinks> are isolated as a whole; link targets, bare
    // URLs and emails stay exactly as written, so the parser still reads them.
    const isWhole = piece.startsWith('`') || piece.startsWith('<')
    out += isWhole ? `${LRI}${piece}${PDI}` : piece
    last = start + piece.length
  }

  return out + isolateLatin(content.slice(last))
}

/** Wraps one stretch of text that should read right to left. */
function wrapRtl(content: string): string {
  return `${RLM}${RLI}${isolateContent(content)}${PDI}`
}

/** Fixes each mostly right-to-left cell of a table row; pipes stay as written. */
function fixTableRow(line: string): string {
  if (TABLE_DELIMITER.test(line)) return line

  // Split on unescaped pipes; the pieces between them are the cells.
  return line
    .split(/(?<!\\)\|/)
    .map(cell => {
      const [, lead = '', content = '', trail = ''] = CELL.exec(cell) ?? []
      if (!content || !isRtl(content)) return cell

      return `${lead}${wrapRtl(content)}${trail}`
    })
    .join('|')
}

/** Fixes one Markdown line (outside a code fence). */
export function fixLine(line: string): string {
  if (BIDI_MARK.test(line)) return line // already fixed, or marked by hand
  if (/^\s*</.test(line)) return line // HTML
  if (TABLE_ROW.test(line)) return fixTableRow(line)

  const parts = PREFIX.exec(line)
  if (!parts) return line

  const [, prefix = '', content = '', trailing = ''] = parts
  if (!content || !isRtl(content)) return line

  return `${prefix}${wrapRtl(content)}${trailing}`
}

/** Fixes a whole Markdown text, line by line, skipping fenced code. */
export function fixBidi(markdown: string): string {
  if (!IS_RTL.test(markdown)) return markdown

  let fence: string | null = null

  return markdown
    .split('\n')
    .map(line => {
      const opener = FENCE.exec(line)?.[1]
      if (fence !== null) {
        if (opener && opener[0] === fence[0] && opener.length >= fence.length) fence = null
        return line
      }
      if (opener) {
        fence = opener
        return line
      }

      return fixLine(line)
    })
    .join('\n')
}
