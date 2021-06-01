// -*- coding: utf-8, tab-width: 2 -*-

import sockAddrStr from 'sockaddrstr';
import maxUniqId from 'maxuniqid';



const EX = function makeConnPool(customCfg) {
  const cfg = { ...EX.defaultCfg, ...customCfg };

  const pool = {
    ...EX.defaultApi,
    previousCleanupFinishedAt: Date.now(),
    peers: new Map(),
    nextConnSerialNo: maxUniqId(),
    idleTimeoutMSec: (+cfg.idleTimeoutSec || 60) * 1e3,
  };

  return pool;
};


EX.defaultApi = {

  stringifySockAddr: sockAddrStr,

  findActivePeerByAddr(addr) {
    const pool = this;
    const peerId = pool.stringifySockAddr(addr);
    const conn = pool.peers.get(peerId);
    if (!conn) { return false; }
    const { expiresAt } = conn;
    if (expiresAt && (Date.now() >= expiresAt)) {
      pool.dropPeer(conn);
      return false;
    }
    return conn;
  },

  findOrAddPeerByAddr(addr) {
    const pool = this;
    return (pool.findActivePeerByAddr(addr)
      || pool.forceInitPeerByAddr(addr));
  },

  forceInitPeerByAddr(addr) {
    const pool = this;
    const peerId = pool.stringifySockAddr(addr);
    const conn = {
      serialNo: pool.nextConnSerialNo(),
      peerId,
      getPool() { return pool; },
      connectedSince: Date.now(),
      touchAlive(conn) { this.expiresAt = Date.now() + pool.idleTimeoutMSec; },
    };
    conn.name = '#' + conn.serialNo;
    conn.touchAlive();
    pool.peers.set(peerId, conn);
    return conn;
  },

  dropPeer(dropMe) {
    if (!dropMe) { return; }
    const { peerId } = dropMe;
    if (!peerId) { return; }
    const pool = this;
    const ours = pool.peers.get(peerId);
    if (ours !== dropMe) { return; }
    pool.peers.delete(peerId);
    if (ours.onDrop) { ours.onDrop(); }
  },

};




export default EX;
