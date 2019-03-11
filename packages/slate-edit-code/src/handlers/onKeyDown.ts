import { Change } from '@gitbook/slate'
import { isKeyHotkey } from 'is-hotkey'

import Options from '../options'
import { getCurrentCode } from '../utils'

import onBackspace from './onBackspace'
import onEnter from './onEnter'
import onModEnter from './onModEnter'
import onSelectAll from './onSelectAll'
import onShiftTab from './onShiftTab'
import onTab from './onTab'

const isModA = isKeyHotkey('mod+a')
const isShiftTab = isKeyHotkey('shift+tab')
const isTab = isKeyHotkey('tab')
const isModEnter = isKeyHotkey('mod+enter')
const isEnter = isKeyHotkey('enter')
const isBackspace = isKeyHotkey('backspace')

/*
 * User is pressing a key in the editor
 */

function onKeyDown(
  opts: Options,
  event: any,
  change: Change,
  editor: any
): void | Change {
  const { value } = change
  const currentCode = getCurrentCode(opts, value)

  // Inside code ?
  if (!currentCode) {
    return undefined
  }

  // Add opts in the argument list
  const args = [opts, event, change, editor]

  // Select all the code in the block (Mod+a)
  if (opts.selectAll && isModA(event)) {
    return onSelectAll(...args)
  } else if (isShiftTab(event)) {
    // User is pressing Shift+Tab
    return onShiftTab(...args)
  } else if (isTab(event)) {
    // User is pressing Tab
    return onTab(...args)
  } else if (opts.exitBlockType && isModEnter(event)) {
    // User is pressing Mod+Enter
    return onModEnter(...args)
  } else if (isEnter(event)) {
    // User is pressing Enter
    return onEnter(...args)
  } else if (isBackspace(event)) {
    // User is pressing Backspace
    return onBackspace(...args)
  }
  return undefined
}

export default onKeyDown
