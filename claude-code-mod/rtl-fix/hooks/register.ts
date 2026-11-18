import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { fixBidi } from './bidi'

// Off is the exception, so the stored default (false) means "on".
const isOff = atom({ plugin: 'rtl-fix', key: 'isOff' } as const, false)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'rtl',
      description: 'Turn the right-to-left (Persian, Arabic, Hebrew) text fix on or off',
    })

    return next(e)
  })

  on('command.run', { command: 'rtl' }, async $ => {
    const off = !(await read($, isOff))
    await update($, isOff, () => off)

    return { text: off ? 'RTL fix is off.' : 'RTL fix is on.' }
  })

  // Only the drawing changes: the stored message, and what the model and
  // copy see, stay exactly as written.
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (await read($, isOff)) return next(e)

    const text = fixBidi(e.props.text)
    if (text === e.props.text) return next(e)

    return next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (await read($, isOff)) return next(e)

    const text = fixBidi(e.props.text)
    if (text === e.props.text) return next(e)

    return next({ ...e, props: { ...e.props, text } })
  })
}
