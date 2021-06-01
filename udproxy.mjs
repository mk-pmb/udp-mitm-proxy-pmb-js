// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';

// import nodeFs from 'fs';
// const pktLog = nodeFs.createWriteStream('traffic.log');

import makeProxy from './src/proxySock.mjs';

const cfg = {
  destMtHost: 'your-land.de',
  destMtPort: 30_001,
  // destMtSock: dgram.createSocket('udp4');
};

const prx = makeProxy(cfg);
prx.listen();








/* scroll */
