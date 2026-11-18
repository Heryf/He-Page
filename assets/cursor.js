/* ============================================================
 * 自定义鼠标光标（参考 imsyy.top 的双层光标）
 * 内层小点即时跟随，外层圆环缓动追赶，悬停可点元素时放大变绿
 * 触屏设备 / IE8 及以下自动跳过，不影响原有交互
 * ============================================================ */
(function () {
    var ua = navigator.userAgent;
    // IE8 及以下不支持，直接跳过
    if (/MSIE [5-8]\./.test(ua)) return;
    // 纯触屏设备不需要光标
    var hasTouch = 'ontouchstart' in window;
    var finePointer = true;
    try {
        if (window.matchMedia) finePointer = window.matchMedia('(pointer: fine)').matches;
    } catch (e) { /* 老浏览器忽略 */ }
    if (hasTouch && !finePointer) return;

    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');

    function mount() {
        document.body.appendChild(dot);
        document.body.appendChild(ring);
        if (document.body.className.indexOf('cursor-ready') < 0) {
            document.body.className += ' cursor-ready';
        }
        start();
    }

    var mx = -100, my = -100;   // 鼠标真实位置
    var rx = -100, ry = -100;   // 圆环当前位置
    var visible = false;

    function move(e) {
        e = e || window.event;
        mx = e.clientX;
        my = e.clientY;
        if (!visible) {
            visible = true;
            rx = mx; ry = my;
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        }
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    }

    function leave() {
        visible = false;
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    }

    var HOVER_SEL = 'a, .tab-item, .item, .close, .web_notice a, .web_notice_content a';
    function over(e) {
        e = e || window.event;
        var el = e.target || e.srcElement;
        var hot = false;
        while (el && el.nodeType === 1) {
            if (el.className && typeof el.className === 'string') {
                if ((' ' + el.className + ' ').indexOf(' tab-item ') > -1 ||
                    (' ' + el.className + ' ').indexOf(' item ') > -1 ||
                    (' ' + el.className + ' ').indexOf(' close ') > -1) { hot = true; break; }
            }
            if (el.tagName === 'A' || el.tagName === 'BUTTON') { hot = true; break; }
            el = el.parentNode;
        }
        if (hot) {
            addCls(ring, 'is-hover');
            addCls(dot, 'is-hover');
        } else {
            delCls(ring, 'is-hover');
            delCls(dot, 'is-hover');
        }
    }

    function addCls(el, cls) {
        if ((' ' + el.className + ' ').indexOf(' ' + cls + ' ') < 0) el.className += ' ' + cls;
    }
    function delCls(el, cls) {
        el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').replace(/^\s+|\s+$/g, '');
    }

    var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    var timer = null;

    function tick() {
        // 缓动追赶：0.18 越大追得越紧
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        if (raf) raf(tick);
    }

    function start() {
        if (raf) raf(tick);
        else timer = setInterval(tick, 16);
    }

    function bind(el, type, fn) {
        if (el.addEventListener) el.addEventListener(type, fn, false);
        else if (el.attachEvent) el.attachEvent('on' + type, fn);
    }

    bind(document, 'mousemove', move);
    bind(document, 'mouseover', over);
    bind(document, 'mouseleave', leave);
    bind(window, 'blur', leave);

    if (document.body) mount();
    else bind(document, 'DOMContentLoaded', mount);
})();
