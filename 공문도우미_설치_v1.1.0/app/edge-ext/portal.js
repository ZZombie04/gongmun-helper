/* =============================================================================
 * 공문 도우미 — 업무포털 자동 로그인 (브라우저 쪽)
 *
 *  트레이 프로그램의 [설정]에서 자동 로그인을 켜면 업무포털 주소를
 *  #gmh-autologin=1 을 붙여 한 번 연다. 여기서 그 표식을 읽어 저장해 두고,
 *  그 뒤로는 로그인 화면에 들어올 때마다 [교육행정 전자서명 인증서 로그인]
 *  단추를 대신 누른다. 인증서 암호 창에 비밀번호를 넣는 일은 트레이가 한다.
 *
 *  제작 · 평택교육지원청 장학사 강주원 · https://joo.is/ai리치쌤
 * ========================================================================== */
(function () {
  'use strict';
  var KEY = 'GMH_PORTAL_AUTOLOGIN';

  // 1) 트레이가 보낸 표식 처리
  var m = location.hash.match(/gmh-autologin=([01])/);
  if (m) {
    try { localStorage.setItem(KEY, m[1]); } catch (e) {}
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e2) {}
  }

  var on = false;
  try { on = localStorage.getItem(KEY) === '1'; } catch (e3) {}

  // 2) 상태 표시(작은 띠) — 켜져 있을 때만
  function badge(text) {
    var b = document.createElement('div');
    b.id = 'gmh-portal-badge';
    b.textContent = text;
    b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483000;background:#0f172a;color:#fff;' +
      'font:12px/1.4 "맑은 고딕","Malgun Gothic",sans-serif;padding:8px 12px;border-radius:8px;' +
      'box-shadow:0 8px 24px rgba(15,23,42,.3);opacity:.94;';
    document.body.appendChild(b);
    return b;
  }

  if (!on) return;

  // 3) 로그인 단추 누르기 (화면이 다 그려진 뒤 한 번만)
  var tried = false;
  function tryClick() {
    if (tried) return;
    var btn = document.getElementById('btnLgn');
    if (!btn) return;
    tried = true;
    var b = badge('공문 도우미 · 인증서 로그인을 여는 중… (설정에서 끌 수 있습니다)');
    setTimeout(function () {
      try { btn.click(); } catch (e) {}
      setTimeout(function () { try { b.parentNode.removeChild(b); } catch (e) {} }, 6000);
    }, 700);
  }
  if (document.readyState === 'complete') tryClick();
  else window.addEventListener('load', tryClick);
  // 화면이 늦게 그려지는 경우 대비
  var n = 0, iv = setInterval(function () { tryClick(); if (tried || ++n > 20) clearInterval(iv); }, 500);
})();
