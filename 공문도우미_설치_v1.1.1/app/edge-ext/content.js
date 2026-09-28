/* =============================================================================
 * 공문 도우미 — 데이터취합 제출기관(수신자) 자동추가
 *
 *  기관 이름을 목록으로 넣으면 검색 → 선택 → 추가까지 자동으로 처리한다.
 *
 *  ※ 이 화면은 eXBuilder6 로 만들어져 있고 스크립트가 만든 마우스 이벤트를
 *    무시한다. 그래서 백그라운드가 디버거 프로토콜로 '진짜' 입력을 보낸다.
 *    작업하는 동안 브라우저 위쪽에 디버깅 안내 띠가 뜨는데, 끝나면 사라진다.
 *
 *  제작 · 평택교육지원청 장학사 강주원  ·  https://joo.is/ai리치쌤
 * ========================================================================== */
(function () {
  'use strict';

  if (window.__GMD_LOADED__) return;
  window.__GMD_LOADED__ = true;

  var VERSION = '1.0.0';
  var AUTHOR = '평택교육지원청 장학사 강주원';
  var AUTHOR_URL = 'https://joo.is/ai리치쌤';
  var MODAL_TEXT = '제출기관(수신자) 지정';

  var S = { names: [], results: [], running: false, cancel: false };
  var el = {};

  /* ─────────────────────────────────────────── 기본 도구 */

  function vis(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    var cs = getComputedStyle(e);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  function txt(e) { return ((e && (e.innerText || e.textContent)) || '').replace(/\s+/g, ' ').trim(); }
  function clean(s) {
    return String(s).replace(/해제|선택|트리항목 체크상자|\d+단계/g, '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function send(msg) {
    return new Promise(function (resolve) {
      try {
        chrome.runtime.sendMessage(msg, function (res) {
          if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
          else resolve(res || { ok: false, error: '응답 없음' });
        });
      } catch (e) { resolve({ ok: false, error: String(e.message || e) }); }
    });
  }

  /** 누를 수 있는 자리로 올리고 가운데 좌표를 구한다. */
  async function spotOf(e) {
    var r = e.getBoundingClientRect();
    var out = r.top < 0 || r.left < 0 ||
              r.bottom > (window.innerHeight || 0) || r.right > (window.innerWidth || 0);
    if (out) {
      try { e.scrollIntoView({ block: 'center', inline: 'center' }); } catch (x) {
        try { e.scrollIntoView(); } catch (x2) {}
      }
      await sleep(120);
      r = e.getBoundingClientRect();
    }
    if (r.width <= 0 || r.height <= 0) return null;
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > (window.innerWidth || 0) || y > (window.innerHeight || 0)) return null;
    return { x: x, y: y };
  }

  /** 요소 한가운데를 진짜로 클릭한다. */
  async function clickEl(e) {
    var s = await spotOf(e);
    if (!s) return { ok: false, error: '화면에서 보이지 않는 자리입니다.' };
    return send({ cmd: 'click', x: s.x, y: s.y });
  }
  async function typeInto(e, text) {
    var s = await spotOf(e);
    if (!s) return { ok: false, error: '입력칸이 화면에 보이지 않습니다.' };
    return send({ cmd: 'type', x: s.x, y: s.y, text: text });
  }

  /* ─────────────────────────────────────────── 화면 요소 */

  function findModal() {
    var d = document.querySelector('.cl-dialog-wrapper');
    if (d && vis(d) && txt(d).indexOf(MODAL_TEXT) >= 0) return d;
    var all = document.querySelectorAll('[class*="cl-dialog"],[role=dialog]');
    for (var i = 0; i < all.length; i++) {
      if (vis(all[i]) && txt(all[i]).indexOf(MODAL_TEXT) >= 0) return all[i];
    }
    return null;
  }

  function searchInput(m) {
    var els = m.querySelectorAll('input[type=text],input:not([type])');
    for (var i = 0; i < els.length; i++) if (vis(els[i])) return els[i];
    return null;
  }

  function button(m, texts, exact) {
    var els = m.querySelectorAll('[class*="cl-button"],button,a,[role=button]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (!vis(e)) continue;
      var t = txt(e);
      for (var k = 0; k < texts.length; k++) {
        if (exact ? (t === texts[k]) : (t.indexOf(texts[k]) >= 0)) return e;
      }
    }
    return null;
  }

  /* ─────────────────────────────────────────── 소속 거르기 */

  /** 고른 소속 이름들. 비어 있으면 가리지 않는다. */
  function pickedRegions() {
    var out = [];
    try {
      var saved = JSON.parse(localStorage.getItem('GMD_REGIONS_SEL') || '[]');
      if (Object.prototype.toString.call(saved) === '[object Array]') out = saved;
    } catch (e) {}
    return out;
  }
  function saveRegions(list) {
    try { localStorage.setItem('GMD_REGIONS_SEL', JSON.stringify(list)); } catch (e) {}
  }
  function toggleRegion(name) {
    var cur = pickedRegions(), i = cur.indexOf(name);
    if (i >= 0) cur.splice(i, 1); else cur.push(name);
    saveRegions(cur);
  }

  /** 글자를 비교하기 좋게 다듬는다. */
  function norm(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }

  /** 이름만 떼어낸다 (소속을 떼고 마지막 덩어리). */
  function lastWord(t) {
    var a = norm(t).split(' ');
    return a[a.length - 1];
  }

  /** 여러 건이 나왔을 때 하나를 고른다.
   *  @returns {object} { one: 항목|null, left: 남은 후보들, why: 설명 }
   */
  function chooseOne(hit, name) {
    var picked = pickedRegions(), i, j;

    // 1) 고른 소속이 있으면 그쪽만 남긴다.
    //    하나도 안 맞으면 거르지 않는다 — 애꽸 찾은 것을 버리면 손해다.
    if (picked.length) {
      var keep = [];
      for (i = 0; i < hit.length; i++) {
        for (j = 0; j < picked.length; j++) {
          if (hit[i].text.indexOf(picked[j]) >= 0) { keep.push(hit[i]); break; }
        }
      }
      if (keep.length) hit = keep;
    }

    if (hit.length === 1) return { one: hit[0], left: hit, why: '' };

    // 2) 글자가 모두 같으면 같은 기관이다. 맨 위에 있는 것을 고른다.
    var seen = [], first = norm(hit[0].text);
    var allSame = true;
    for (i = 0; i < hit.length; i++) {
      var t = norm(hit[i].text);
      if (t !== first) allSame = false;
      if (seen.indexOf(t) < 0) seen.push(t);
    }
    if (allSame) {
      /* 목록이 가끔 같은 줄을 여러 번 그린다. 같은 기관이니 하나만 넣으면 된다.
         다만 체크상자가 달린 줄이 진짜 항목이므로 그쪽을 먼저 고른다. */
      var withBox = null;
      for (i = 0; i < hit.length; i++) { if (hit[i].cb) { withBox = hit[i]; break; } }
      return { one: withBox || hit[0], left: hit,
               why: '같은 기관이 ' + hit.length + '번 나와 첫 것을 넣음' };
    }

    // 3) 서로 다른 것들 중 이름이 정확히 같은 것이 하나뿐이면 그것.
    var exact = [];
    for (i = 0; i < hit.length; i++) if (lastWord(hit[i].text) === name) exact.push(hit[i]);
    var exactTexts = [];
    for (i = 0; i < exact.length; i++) {
      var et = norm(exact[i].text);
      if (exactTexts.indexOf(et) < 0) exactTexts.push(et);
    }
    if (exact.length && exactTexts.length === 1) {
      return { one: exact[0], left: exact, why: '이름이 꼭 맞는 것을 넣음' };
    }

    return { one: null, left: hit, texts: seen, why: '' };
  }

  /** 왼쪽 트리 항목들.
      화면 부품 이름이 판마다 조금씩 달라서 차례로 찾는다. */
  var TREE_SELECTORS = [
    '.cl-tree-list .cl-tree-item, .cl-tree .cl-tree-item',
    '[class*="cl-tree"] [class*="tree-item"]',
    '[class*="cl-tree"] [role="treeitem"]',
    '[role="treeitem"]'
  ];

  function treeItems(m) {
    for (var s = 0; s < TREE_SELECTORS.length; s++) {
      var out = [];
      var list = m.querySelectorAll(TREE_SELECTORS[s]);
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        if (!vis(n)) continue;
        var t = clean(txt(n));
        if (!t) continue;
        out.push({
          el: n, text: t,
          cb: n.querySelector('[class*="checkbox"],input[type=checkbox]')
        });
      }
      if (out.length) return out;
    }
    return [];
  }

  /** 오른쪽 '선택 수신자 목록' 행 수 (머리글 제외) */
  function recvCount(m) {
    var rows = m.querySelectorAll('[class*="cl-grid-row"]');
    var n = 0;
    for (var i = 0; i < rows.length; i++) if (vis(rows[i])) n++;
    return Math.max(0, n - 1);
  }

  /* ─────────────────────────────────────────── 한 건 처리 */

  async function processOne(m, name) {
    var inp = searchInput(m);
    var btnSearch = button(m, ['조회', '검색']);
    var btnAdd = button(m, ['추가']);
    if (!inp) return { name: name, status: 'error', detail: '검색창을 찾지 못했습니다.' };
    if (!btnSearch) return { name: name, status: 'error', detail: '조회 버튼을 찾지 못했습니다.' };
    if (!btnAdd) return { name: name, status: 'error', detail: '추가 버튼을 찾지 못했습니다.' };

    var before = treeItems(m).map(function (t) { return t.text; }).join('|');

    var r1 = await typeInto(inp, name);
    if (!r1.ok) return { name: name, status: 'error', detail: '입력 실패: ' + r1.error };
    await sleep(80);

    var r2 = await clickEl(btnSearch);
    if (!r2.ok) return { name: name, status: 'error', detail: '조회 실패: ' + r2.error };

    // 결과가 바뀔 때까지 기다린다
    var t0 = Date.now(), items = [];
    while (Date.now() - t0 < 9000) {
      await sleep(180);
      items = treeItems(m);
      var now = items.map(function (t) { return t.text; }).join('|');
      if (now !== before && items.length) break;
      if (items.some(function (t) { return t.text.indexOf(name) >= 0; })) break;
    }

    var hit = items.filter(function (t) { return t.text.indexOf(name) >= 0; });
    if (hit.length === 0) return { name: name, status: 'none', detail: '검색 결과에서 찾지 못했습니다.' };

    var ch = chooseOne(hit, name);
    if (!ch.one) {
      return {
        name: name, status: 'many',
        detail: ch.texts.length + '곳이 서로 다릅니다. 소속을 골라 주세요.',
        candidates: ch.texts.slice(0, 5)
      };
    }

    var target = ch.one;
    var pickNote = ch.why;
    var cnt0 = recvCount(m);

    var r3 = await clickEl(target.cb || target.el);
    if (!r3.ok) return { name: name, status: 'error', detail: '선택 실패: ' + r3.error };
    await sleep(140);

    var r4 = await clickEl(btnAdd);
    if (!r4.ok) return { name: name, status: 'error', detail: '추가 실패: ' + r4.error };

    var t1 = Date.now();
    while (Date.now() - t1 < 5000) {
      await sleep(160);
      if (recvCount(m) > cnt0) {
        return { name: name, status: 'added',
                 detail: norm(target.text).slice(0, 60) + (pickNote ? '  · ' + pickNote : '') };
      }
    }
    return { name: name, status: 'dup', detail: '이미 있거나 추가되지 않았습니다 — ' + target.text.slice(0, 40) };
  }

  /* ─────────────────────────────────────────── 실행 */

  async function run() {
    if (S.running) return;
    var m = findModal();
    if (!m) { alert('제출기관(수신자) 지정 창을 먼저 열어 주세요.'); return; }

    var raw = (document.getElementById('gmd-names') || {}).value || '';
    var seen = {}, names = [];
    raw.split(/[\r\n,;\t]+/).forEach(function (v) {
      v = v.replace(/\s+/g, ' ').trim();
      if (!v || seen[v]) return;
      seen[v] = true;
      names.push(v);
    });
    if (!names.length) { alert('기관명을 입력해 주세요.'); return; }

    if (!confirm(names.length + '개 기관을 자동으로 추가합니다.\n\n' +
                 '진행하는 동안 브라우저 위쪽에 디버깅 안내 띠가 뜹니다.\n' +
                 '(끝나면 사라집니다)\n\n' +
                 '자동 입력 중에는 이 창을 건드리지 마세요. 계속할까요?')) return;

    S.running = true; S.cancel = false; S.names = names; S.results = [];
    el.run.disabled = true;
    el.cancel.style.display = 'inline-block';
    el.bar.style.display = 'block';

    var at = await send({ cmd: 'attach' });
    if (!at.ok) {
      alert('자동 입력을 준비하지 못했습니다.\n' + at.error +
            '\n\n다른 개발자 도구(F12)가 열려 있으면 닫고 다시 시도해 주세요.');
      S.running = false; el.run.disabled = false; el.cancel.style.display = 'none';
      return;
    }

    for (var i = 0; i < names.length; i++) {
      if (S.cancel) break;
      setStat('처리 중 ' + (i + 1) + ' / ' + names.length + ' — ' + names[i]);
      el.barIn.style.width = Math.round((i / names.length) * 100) + '%';
      var r;
      try { r = await processOne(findModal() || m, names[i]); }
      catch (e) { r = { name: names[i], status: 'error', detail: String(e.message || e) }; }
      S.results.push(r);
      render(true);
      await sleep(120);
    }

    await send({ cmd: 'detach' });

    S.running = false;
    el.run.disabled = false;
    el.cancel.style.display = 'none';
    el.barIn.style.width = '100%';
    var ok = S.results.filter(function (r) { return r.status === 'added'; }).length;
    setStat((S.cancel ? '중단' : '완료') + ' — 추가 ' + ok + ' / ' + S.results.length);
    render();
  }

  /* ─────────────────────────────────────────── UI */

  function build() {
    if (document.getElementById('gmd-panel')) return;

    var tab = document.createElement('div');
    tab.id = 'gmd-tab';
    tab.innerHTML = '자<br>동<br>추<br>가';
    tab.title = '제출기관 자동추가';
    document.body.appendChild(tab);

    var p = document.createElement('div');
    p.id = 'gmd-panel';
    p.innerHTML =
      '<div class="gmd-head" id="gmd-head">' +
        '<h3>⚡ 제출기관 자동추가 <em>v' + VERSION + '</em></h3>' +
        '<span class="gmd-x" id="gmd-close">✕</span>' +
      '</div>' +
      '<div class="gmd-body" id="gmd-body"></div>' +
      '<div class="gmd-foot">' +
        '<div><div class="gmd-stat" id="gmd-stat">준비됨</div>' +
        '<div class="gmd-bar" id="gmd-bar"><i id="gmd-barin"></i></div></div>' +
        '<div><button class="gmd-btn" id="gmd-cancel" style="display:none">중단</button>' +
        '<button class="gmd-btn pri" id="gmd-run">자동 추가 실행</button></div>' +
      '</div>' +
      '<div class="gmd-credit" id="gmd-credit">제작 · <a href="' + AUTHOR_URL +
        '" target="_blank" rel="noopener">' + AUTHOR + '</a></div>';
    document.body.appendChild(p);

    el.tab = tab; el.panel = p;
    el.body = document.getElementById('gmd-body');
    el.stat = document.getElementById('gmd-stat');
    el.bar = document.getElementById('gmd-bar');
    el.barIn = document.getElementById('gmd-barin');
    el.run = document.getElementById('gmd-run');
    el.cancel = document.getElementById('gmd-cancel');

    tab.addEventListener('click', function () { open(true); });
    document.getElementById('gmd-close').addEventListener('click', function () { open(false); });
    el.run.addEventListener('click', run);
    el.cancel.addEventListener('click', function () { S.cancel = true; setStat('중단하는 중...'); });
    drag(document.getElementById('gmd-head'), p);

    var pos = null;
    try { pos = JSON.parse(localStorage.getItem('GMD_POS') || 'null'); } catch (e) {}
    p.style.left = (pos && pos.x != null ? pos.x : Math.max(8, innerWidth - 400 - 48)) + 'px';
    p.style.top = (pos && pos.y != null ? pos.y : 70) + 'px';

    render();
  }

  function drag(handle, target) {
    var on = false, sx = 0, sy = 0, ox = 0, oy = 0;
    handle.addEventListener('mousedown', function (e) {
      if (e.target.id === 'gmd-close') return;
      on = true; sx = e.clientX; sy = e.clientY;
      ox = parseInt(target.style.left, 10) || 0; oy = parseInt(target.style.top, 10) || 0;
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!on) return;
      target.style.left = (ox + e.clientX - sx) + 'px';
      target.style.top = (oy + e.clientY - sy) + 'px';
    });
    document.addEventListener('mouseup', function () {
      if (!on) return;
      on = false;
      try {
        localStorage.setItem('GMD_POS', JSON.stringify({
          x: parseInt(target.style.left, 10), y: parseInt(target.style.top, 10)
        }));
      } catch (e) {}
    });
  }

  function open(v) {
    el.panel.style.display = v ? 'block' : 'none';
    el.tab.style.display = v ? 'none' : 'block';
    if (v) render();
  }
  function setStat(s) { if (el.stat) el.stat.textContent = s; }

  function render(keepInput) {
    var m = findModal();
    var h = [];

    if (!m) {
      h.push('<div class="gmd-note"><b>제출기관(수신자) 지정 창을 먼저 열어 주세요.</b><br>' +
             '창이 열리면 자동으로 인식합니다.</div>');
    } else {
      var inp = searchInput(m), bs = button(m, ['조회', '검색']), ba = button(m, ['추가']);
      if (inp && bs && ba) {
        h.push('<div class="gmd-good">✔ 창을 인식했습니다. 선택 수신자 ' + recvCount(m) + '건</div>');
      } else {
        h.push('<div class="gmd-note">일부 요소를 못 찾았습니다 — ' +
               (inp ? '' : '검색창 ') + (bs ? '' : '조회버튼 ') + (ba ? '' : '추가버튼 ') +
               '<br>왼쪽 탭(조직도 등)을 한 번 눌러 보세요.</div>');
      }
    }

    var prev = keepInput ? ((document.getElementById('gmd-names') || {}).value || '') : null;

    /* ① 소속 — 같은 이름의 학교가 여러 지역에 있을 때 가리는 데 쓴다 */
    var sel = pickedRegions();
    h.push('<div class="gmd-sec"><h4><span class="gmd-num">1</span>소속</h4>');
    h.push('<span class="gmd-hint">같은 이름이 여러 곳에서 나올 때 여기서 고른 곳을 먼저 찾습니다.<br>' +
           '여러 곳을 같이 고를 수 있고, 아무것도 고르지 않으면 가리지 않습니다.</span>');
    h.push('<div class="gmd-box">');
    h.push('<div class="gmd-minis"><span class="gmd-mini" id="gmd-rg-all">전체 선택</span>' +
           '<span class="gmd-mini" id="gmd-rg-none">전체 해제</span></div>');
    h.push('<div class="gmd-chips" id="gmd-rg">');
    for (var g = 0; g < GMD_REGIONS.length; g++) {
      var R = GMD_REGIONS[g];
      h.push('<span class="gmd-chip' + (sel.indexOf(R.name) >= 0 ? ' on' : '') +
             '" data-rg="' + esc(R.name) + '" title="' + esc(R.name) + '">' + esc(R.short) + '</span>');
    }
    h.push('</div></div></div>');

    h.push('<div class="gmd-sec"><h4><span class="gmd-num">2</span>기관명</h4>' +
           '<span class="gmd-hint">한 줄에 하나씩 넣습니다.<br>엑셀에서 그대로 복사해 붙여 넣어도 됩니다.</span>' +
           '<textarea class="gmd-ta" id="gmd-names" placeholder="예)&#10;평택지산초등학교&#10;합정초등학교&#10;청담중학교"></textarea></div>');

    if (S.results.length) {
      var L = { added: '추가됨', dup: '이미있음', many: '여러건', none: '못찾음', error: '오류' };
      var fail = [];
      h.push('<div class="gmd-sec"><h4>결과</h4>');
      S.results.forEach(function (r) {
        if (r.status !== 'added') fail.push(r.name);
        h.push('<div class="gmd-row"><span class="gmd-tag gmd-' + r.status + '">' + L[r.status] + '</span>' +
               '<span class="nm">' + esc(r.name) + '</span>' +
               (r.detail ? '<div class="dt">' + esc(r.detail) + '</div>' : ''));
        (r.candidates || []).forEach(function (c) {
          h.push('<div class="dt" style="padding-left:8px;border-left:2px solid #e2e8f0">' + esc(c) + '</div>');
        });
        h.push('</div>');
      });
      if (fail.length) {
        h.push('<div class="gmd-note">확인 필요 ' + fail.length + '건<br><code>' + esc(fail.join(', ')) + '</code></div>');
      }
      h.push('</div>');
    } else {
      h.push('<div class="gmd-note">기관명을 넣고 [자동 추가 실행] 을 누르면 ' +
             '<b>검색 → 선택 → 추가</b> 까지 자동으로 처리합니다.<br>' +
             '<span class="gmd-hint">진행 중에는 브라우저 위쪽에 디버깅 안내 띠가 뜹니다. ' +
             '이 사이트가 일반 스크립트 입력을 막아 두어 어쩔 수 없습니다. 끝나면 사라집니다.</span></div>');
    }

    el.body.innerHTML = h.join('');
    if (prev !== null) {
      var ta = document.getElementById('gmd-names');
      if (ta) ta.value = prev;
    }
    wireRegions();
  }

  /** 소속 칩을 누를 수 있게 한다. */
  function wireRegions() {
    var wrap = document.getElementById('gmd-rg');
    if (!wrap) return;

    function redraw() {
      var on = pickedRegions();
      var cs = wrap.getElementsByTagName('span');
      for (var i = 0; i < cs.length; i++) {
        var nm = cs[i].getAttribute('data-rg');
        cs[i].className = 'gmd-chip' + (on.indexOf(nm) >= 0 ? ' on' : '');
      }
    }

    var chips = wrap.getElementsByTagName('span');
    for (var i = 0; i < chips.length; i++) {
      (function (c) {
        c.addEventListener('click', function () {
          toggleRegion(c.getAttribute('data-rg'));
          redraw();
        });
      })(chips[i]);
    }

    var all = document.getElementById('gmd-rg-all');
    if (all) all.addEventListener('click', function () {
      var list = [];
      for (var g = 0; g < GMD_REGIONS.length; g++) list.push(GMD_REGIONS[g].name);
      saveRegions(list); redraw();
    });

    var none = document.getElementById('gmd-rg-none');
    if (none) none.addEventListener('click', function () { saveRegions([]); redraw(); });


  }

  function creditOk() {
    var c = document.getElementById('gmd-credit');
    return !!c && c.innerHTML.indexOf('강주원') >= 0 && c.innerHTML.indexOf('joo.is') >= 0;
  }

  function boot() {
    if (!document.body) { setTimeout(boot, 400); return; }
    build();
    if (!creditOk()) {
      ['gmd-panel', 'gmd-tab'].forEach(function (i) {
        var e = document.getElementById(i);
        if (e && e.parentNode) e.parentNode.removeChild(e);
      });
      return;
    }
    open(false);

    var last = null;
    setInterval(function () {
      var m = !!findModal();
      if (m !== last) {
        last = m;
        if (el.tab) {
          el.tab.style.background = m ? '#0d9488' : '#94a3b8';
          el.tab.title = m ? '제출기관 자동추가 (창 인식됨)' : '제출기관 지정 창을 열어 주세요';
        }
        if (el.panel && el.panel.style.display === 'block' && !S.running) render(true);
      }
    }, 1200);
  }

  boot();
})();
