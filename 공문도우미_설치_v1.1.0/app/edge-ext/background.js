/* =============================================================================
 * 공문 도우미 — 데이터취합 자동추가 (백그라운드)
 *
 *  이 사이트(eXBuilder6)는 스크립트가 만든 마우스 이벤트를 무시한다.
 *  그래서 디버거 프로토콜로 '진짜' 입력 이벤트를 보낸다.
 *  작업하는 동안만 붙었다가 끝나면 바로 뗀다.
 *
 *  제작 · 평택교육지원청 장학사 강주원
 * ========================================================================== */
'use strict';

const attached = new Set();

function dbg(target, method, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(target, method, params || {}, (res) => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(res);
    });
  });
}

function attach(tabId) {
  return new Promise((resolve, reject) => {
    if (attached.has(tabId)) return resolve(true);
    chrome.debugger.attach({ tabId }, '1.3', () => {
      if (chrome.runtime.lastError) {
        const m = chrome.runtime.lastError.message || '';
        // 이미 붙어 있는 경우는 성공으로 본다
        if (m.indexOf('Already attached') >= 0) { attached.add(tabId); return resolve(true); }
        return reject(new Error(m));
      }
      attached.add(tabId);
      resolve(true);
    });
  });
}

function detach(tabId) {
  return new Promise((resolve) => {
    if (!attached.has(tabId)) return resolve(true);
    chrome.debugger.detach({ tabId }, () => {
      attached.delete(tabId);
      resolve(true);
    });
  });
}

chrome.debugger.onDetach.addListener((src) => { if (src.tabId) attached.delete(src.tabId); });
chrome.tabs.onRemoved.addListener((tabId) => { attached.delete(tabId); });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function mouseClick(target, x, y) {
  const base = { x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1, buttons: 1 };
  await dbg(target, 'Input.dispatchMouseEvent', Object.assign({ type: 'mouseMoved', buttons: 0 }, base, { buttons: 0 }));
  await sleep(15);
  await dbg(target, 'Input.dispatchMouseEvent', Object.assign({ type: 'mousePressed' }, base));
  await sleep(25);
  await dbg(target, 'Input.dispatchMouseEvent', Object.assign({ type: 'mouseReleased', buttons: 0 }, base));
}

async function key(target, opts) {
  await dbg(target, 'Input.dispatchKeyEvent', Object.assign({ type: 'keyDown' }, opts));
  await dbg(target, 'Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, opts));
}

/** 입력칸을 눌러 기존 내용을 지우고 새 글자를 넣는다. */
async function typeInto(target, x, y, text) {
  await mouseClick(target, x, y);
  await sleep(60);
  // Ctrl+A → Delete
  await key(target, { modifiers: 2, windowsVirtualKeyCode: 65, code: 'KeyA', key: 'a' });
  await sleep(20);
  await key(target, { windowsVirtualKeyCode: 46, code: 'Delete', key: 'Delete' });
  await sleep(20);
  await dbg(target, 'Input.insertText', { text: String(text) });
  await sleep(40);
}

async function handle(msg, tabId) {
  const target = { tabId };
  switch (msg.cmd) {
    case 'attach':  await attach(tabId);  return { ok: true };
    case 'detach':  await detach(tabId);  return { ok: true };
    case 'click':   await attach(tabId); await mouseClick(target, msg.x, msg.y); return { ok: true };
    case 'type':    await attach(tabId); await typeInto(target, msg.x, msg.y, msg.text); return { ok: true };
    case 'enter':
      await attach(tabId);
      await key(target, { windowsVirtualKeyCode: 13, code: 'Enter', key: 'Enter', text: '\r' });
      return { ok: true };
    default:
      return { ok: false, error: '알 수 없는 명령: ' + msg.cmd };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  if (!tabId) { sendResponse({ ok: false, error: '탭을 알 수 없습니다.' }); return true; }
  handle(msg, tabId)
    .then(sendResponse)
    .catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
  return true;   // 비동기 응답
});
