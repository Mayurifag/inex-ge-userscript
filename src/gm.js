import {
  GM_getValue as imp_getValue,
  GM_setValue as imp_setValue,
  GM_registerMenuCommand as imp_registerMenuCommand,
  GM_unregisterMenuCommand as imp_unregisterMenuCommand,
} from '$';

function scanSandbox() {
  for (const k in document) {
    if (!k.startsWith('__monkeyWindow-')) continue;
    const v = document[k];
    if (v && typeof v.GM_getValue === 'function') return v;
  }
  return null;
}

const sb = typeof imp_getValue === 'function' ? null : scanSandbox();

export const GM_getValue = sb ? sb.GM_getValue : imp_getValue;
export const GM_setValue = sb ? sb.GM_setValue : imp_setValue;
export const GM_registerMenuCommand = sb ? sb.GM_registerMenuCommand : imp_registerMenuCommand;
export const GM_unregisterMenuCommand = sb
  ? sb.GM_unregisterMenuCommand
  : imp_unregisterMenuCommand;
