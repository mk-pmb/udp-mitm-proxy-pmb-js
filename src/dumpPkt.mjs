// -*- coding: utf-8, tab-width: 2 -*-

function dumpPkt(buf) {
  function word(hex) {
    let tx = Buffer.from(hex, 'hex').toString('latin1');
    if (tx.match(/[ -~]/)) {
      tx = '‹' + tx.replace(/[\x00-\x1F\x7F-\uFFFF]/g, '·') + '› ';
    } else {
      tx = '';
    }
    return (hex + ' ' + tx);
  }
  return buf.toString('hex').replace(/(\w{1,4})/g, word);
}


export default dumpPkt;
