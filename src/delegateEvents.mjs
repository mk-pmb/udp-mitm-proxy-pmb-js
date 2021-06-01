// -*- coding: utf-8, tab-width: 2 -*-

import isFunc from 'is-fn';
import mustBe from 'typechecks-pmb/must-be.js';


const EX = function delegateEvents(keyCandidates, keyPrefix, onable, impl) {
  mustBe('fun', 'onable.on')(onable && onable.on);
  if (!impl) { return EX(keyCandidates, keyPrefix, onable, onable); }
  const candi = (keyCandidates || Object.keys(impl));
  mustBe('ary', 'key name candidates array')(candi);
  const pfxLen = keyPrefix.length;
  let nDelegated = 0;
  candi.forEach(function maybeEvent(key) {
    if (key.length <= pfxLen) { return; }
    if (!key.startsWith(keyPrefix)) { return; }
    const evt = key.slice(pfxLen).toLowerCase();
    onable.on(evt, function delegated(...args) {
      const hnd = impl[key];
      if (!isFunc(hnd)) { return; }
      return hnd.apply(impl, args);
    });
    nDelegated += 1;
  });
  return nDelegated;
};


export default EX;
