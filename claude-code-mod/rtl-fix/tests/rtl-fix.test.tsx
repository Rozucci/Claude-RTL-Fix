import { expect, test } from 'claude-code/testing'

import { fixBidi, isRtl, LRI, PDI, RLI, RLM } from '../hooks/bidi'

const wrapped = (content: string) => `${RLM}${RLI}${content}${PDI}`
const iso = (latin: string) => `${LRI}${latin}${PDI}`

test('a Persian line with English words is isolated', () => {
  expect(fixBidi('این پروژه با Claude Code ساخته شد.')).toBe(
    wrapped(`این پروژه با ${iso('Claude Code')} ساخته شد.`),
  )
})

test('a line that starts with an English word still reads right to left', () => {
  expect(fixBidi('Astro یک فریم‌ورک است.')).toBe(wrapped(`${iso('Astro')} یک فریم‌ورک است.`))
})

test('sentence punctuation stays outside the English run', () => {
  expect(fixBidi('نسخهٔ جدید WebGL 2.')).toBe(wrapped(`نسخهٔ جدید ${iso('WebGL 2')}.`))
})

test('list markers and heading hashes stay in front', () => {
  expect(fixBidi('- مورد اول با npm')).toBe(`- ${wrapped(`مورد اول با ${iso('npm')}`)}`)
  expect(fixBidi('## تیتر فارسی')).toBe(`## ${wrapped('تیتر فارسی')}`)
  expect(fixBidi('1. قدم اول')).toBe(`1. ${wrapped('قدم اول')}`)
})

test('inline code is isolated, link targets are left alone', () => {
  expect(fixBidi('دستور `npm run dev` رو بزن')).toBe(wrapped(`دستور ${iso('`npm run dev`')} رو بزن`))
  expect(fixBidi('[سایت](https://rozucci.ir) رو ببین')).toBe(wrapped('[سایت](https://rozucci.ir) رو ببین'))
})

test('fenced code and English lines are untouched', () => {
  const code = '```bash\necho سلام\n```'
  expect(fixBidi(code)).toBe(code)
  expect(fixBidi('This is English with one word: سلام')).toBe('This is English with one word: سلام')
  expect(fixBidi('Plain English only.')).toBe('Plain English only.')
})

// --- Harder cases -----------------------------------------------------------

test('table: each Persian cell is fixed, English cells and the delimiter stay', () => {
  const table = ['| نام | مقدار |', '| :--- | ---: |', '| سرعت CPU | 3.2 GHz |'].join('\n')
  expect(fixBidi(table)).toBe(
    [
      `| ${wrapped('نام')} | ${wrapped('مقدار')} |`,
      '| :--- | ---: |',
      `| ${wrapped(`سرعت ${iso('CPU')}`)} | 3.2 GHz |`,
    ].join('\n'),
  )
})

test('table: inline code in a cell and escaped pipes stay whole', () => {
  expect(fixBidi('| `npm i` | نصب با npm |')).toBe(`| \`npm i\` | ${wrapped(`نصب با ${iso('npm')}`)} |`)
  expect(fixBidi('| یا a \\| b |')).toBe(`| ${wrapped(`یا ${iso('a')} \\| ${iso('b')}`)} |`)
})

test('nested lists keep their indentation and markers', () => {
  expect(fixBidi('- مورد\n  - زیرمورد با React\n    1. قدم با npm install')).toBe(
    [
      `- ${wrapped('مورد')}`,
      `  - ${wrapped(`زیرمورد با ${iso('React')}`)}`,
      `    1. ${wrapped(`قدم با ${iso('npm install')}`)}`,
    ].join('\n'),
  )
})

test('block quotes, nested ones and quoted lists keep their markers', () => {
  expect(fixBidi('> نقل با Claude.')).toBe(`> ${wrapped(`نقل با ${iso('Claude')}.`)}`)
  expect(fixBidi('> > تودرتو با API')).toBe(`> > ${wrapped(`تودرتو با ${iso('API')}`)}`)
  expect(fixBidi('> - مورد با Git')).toBe(`> - ${wrapped(`مورد با ${iso('Git')}`)}`)
})

test('bold, italic and strike markers stay outside the English run', () => {
  expect(fixBidi('این **Claude Code** و *TypeScript* هم.')).toBe(
    wrapped(`این **${iso('Claude Code')}** و *${iso('TypeScript')}* هم.`),
  )
  expect(fixBidi('**Claude** یک دستیار است.')).toBe(wrapped(`**${iso('Claude')}** یک دستیار است.`))
  expect(fixBidi('**نکته:** از Node.js استفاده کن.')).toBe(wrapped(`**نکته:** از ${iso('Node.js')} استفاده کن.`))
  expect(fixBidi('این ~~old API~~ است.')).toBe(wrapped(`این ~~${iso('old API')}~~ است.`))
})

test('underscore emphasis is not pulled into the run', () => {
  expect(fixBidi('متغیر _Claude_ و snake_case')).toBe(wrapped(`متغیر _${iso('Claude')}_ و ${iso('snake_case')}`))
})

test('a number joins the Latin unit after it', () => {
  expect(fixBidi('قیمت 12.5 USD در سال 2026.')).toBe(wrapped(`قیمت ${iso('12.5 USD')} در سال 2026.`))
  expect(fixBidi('سرعت 100 km/h و دمای 25°C و 50% تخفیف')).toBe(
    wrapped(`سرعت ${iso('100 km/h')} و دمای ${iso('25°C')} و 50% تخفیف`),
  )
  expect(fixBidi('حجم ۲۵۰ MB است.')).toBe(wrapped(`حجم ${iso('۲۵۰ MB')} است.`))
})

test('numbers on their own are left to the renderer', () => {
  expect(fixBidi('قیمت ۲۵۰ هزار تومان در سال 2026 است.')).toBe(wrapped('قیمت ۲۵۰ هزار تومان در سال 2026 است.'))
})

test('a bracket opened outside the run is closed outside it', () => {
  expect(fixBidi('نسخهٔ v0.1.0 منتشر شد (با Node 26).')).toBe(
    wrapped(`نسخهٔ ${iso('v0.1.0')} منتشر شد (با ${iso('Node 26')}).`),
  )
  expect(fixBidi('تابع f(x) رو ببین')).toBe(wrapped(`تابع ${iso('f(x)')} رو ببین`))
})

test('links: Persian link text is fixed, the target stays exact', () => {
  expect(fixBidi('[مستندات Claude Code](https://docs.claude.com) رو بخون.')).toBe(
    wrapped(`[مستندات ${iso('Claude Code')}](https://docs.claude.com) رو بخون.`),
  )
  expect(fixBidi('برو به [Anthropic](https://anthropic.com) و ثبت‌نام کن.')).toBe(
    wrapped(`برو به [${iso('Anthropic')}](https://anthropic.com) و ثبت‌نام کن.`),
  )
})

test('bare URLs, www. addresses and emails stay as written so they still link', () => {
  for (const line of ['آدرس https://rozucci.ir/blog رو ببین.', 'سایت www.rozucci.ir رو ببین.', 'ایمیل a.b@example.com رو ببین.']) {
    expect(fixBidi(line)).toBe(wrapped(line))
  }
  expect(fixBidi('آدرس <https://rozucci.ir> رو ببین.')).toBe(wrapped(`آدرس ${iso('<https://rozucci.ir>')} رو ببین.`))
})

test('headings, task boxes and hard line breaks keep their syntax', () => {
  expect(fixBidi('### مرحلهٔ ۲: نصب Plugin')).toBe(`### ${wrapped(`مرحلهٔ ۲: نصب ${iso('Plugin')}`)}`)
  expect(fixBidi('- [x] تست‌ها با Vitest')).toBe(`- [x] ${wrapped(`تست‌ها با ${iso('Vitest')}`)}`)
  expect(fixBidi('سطر اول با Git\\\nسطر دوم')).toBe(`${wrapped(`سطر اول با ${iso('Git')}`)}\\\n${wrapped('سطر دوم')}`)
  expect(fixBidi('سطر اول  \nدوم')).toBe(`${wrapped('سطر اول')}  \n${wrapped('دوم')}`)
})

test('a whole mixed reply fixed twice changes nothing more', () => {
  const reply = [
    '## خلاصه',
    '',
    '| فایل | کار |',
    '|---|---|',
    '| `bidi.ts` | موتور bidi |',
    '',
    '> نکته با **React**',
    '',
    '```ts',
    'const x = "سلام"',
    '```',
  ].join('\n')
  const once = fixBidi(reply)
  expect(once.split('\n')[8]).toBe('```ts')
  expect(once.split('\n')[9]).toBe('const x = "سلام"')
  expect(fixBidi(once)).toBe(once)
})

test('fixing twice changes nothing more', () => {
  const once = fixBidi('متن با React و Vue')
  expect(fixBidi(once)).toBe(once)
})

test('direction is decided by the letters, not by code or links', () => {
  expect(isRtl('سلام `some long English code here`')).toBe(true)
  expect(isRtl('Hello world, سلام')).toBe(false)
})

const REPLY = (surface: 'terminal' | 'desktop', text: string) =>
  ({
    plugin: 'rtl-fix',
    surface,
    component: 'AssistantMessage',
    requestId: 'm1',
    props: { text, isFirstOfReply: true },
  }) as const

const SOURCE = 'این با Claude ساخته شد'

for (const surface of ['terminal', 'desktop'] as const) {
  test(`the reply is drawn fixed on ${surface}`, async ($, on) => {
    // Stands for the engine: draws the text it is handed.
    on('ui.render', ($, e) => {
      const { Text } = $.ui.resolve(e)

      return <Text>{(e.props as { text: string }).text}</Text>
    })

    const ui = await $.ui.mount(REPLY(surface, SOURCE))
    expect((await ui.find({ type: 'Text' }))?.text).toBe(fixBidi(SOURCE))
    await ui.unmount()
  })

  test(`with /rtl off the reply is drawn as written on ${surface}`, async ($, on) => {
    on('state.get', () => ({ value: { value: true, version: 1 } }))
    on('ui.render', ($, e) => {
      const { Text } = $.ui.resolve(e)

      return <Text>{(e.props as { text: string }).text}</Text>
    })

    const ui = await $.ui.mount(REPLY(surface, SOURCE))
    expect((await ui.find({ type: 'Text' }))?.text).toBe(SOURCE)
    await ui.unmount()
  })
}
