// -*- coding: utf-8, tab-width: 2 -*-

import netUdp from 'dgram';
// file:///usr/share/doc/nodejs/api/dgram.html

import makeSubjLogger from 'subjlog1707-pmb';
import sockAddrStr from 'sockaddrstr';

import delegateEvents from './delegateEvents.mjs';
import dumpPkt from './dumpPkt.mjs';
import makeConnPool from './connPool.mjs';

const EX = function makeProxySock(customCfg) {
  const cfg = { ...EX.defaultCfg, ...customCfg };
  const sock = netUdp.createSocket({ type: 'udp4', reuseAddr: false });

  const prx = {
    ...EX.defaultApi,
    name: 'MT Proxy socket',
    cfg,
    addr: false,
    sock,

  };

  const logOpts = {
    verbose: !cfg.quiet,
  };
  prx.logger = makeSubjLogger(prx.name, logOpts);

  const poolOpts = {
    idleTimeoutSec: cfg.idleTimeoutSec,
  };
  prx.connPool = makeConnPool(poolOpts);

  delegateEvents(null, 'on', sock, prx);

  return prx;
};


EX.defaultCfg = {
  lsnHost: 'localhost',
  lsnPort: 8300,
};


EX.defaultApi = {

  toString() { return '[' + this.name + ']'; },

  listen(cfgOvr) {
    const prx = this;
    const effCfg = { ...prx.cfg, ...cfgOvr };
    prx.sock.bind({
      address: effCfg.lsnHost,
      port: effCfg.lsnPort,
    });
  },

  onListening() {
    const prx = this;
    const addr = prx.sock.address();
    prx.addr = addr;
    prx.logger('listening on ' + sockAddrStr(addr));
  },

  onMessage(origMsgBuf, meta) {
    const now = Date.now();
    const prx = this;
    const dumped = dumpPkt(origMsgBuf);
    /*
    const msg = JSON.stringify([
      now,
      'C',
      meta,
      dumped,
      origMsgBuf.slice(0, 128),
    ]);
    */
    const peer = prx.connPool.findOrAddPeerByAddr(meta);
    prx.logger(now + ' C:' + peer.name + '> '
      + JSON.stringify(meta) + ' ' + dumped);
  },

  onError(err) {
    const prx = this;
    prx.logger(err);
  },

};



export default EX;
