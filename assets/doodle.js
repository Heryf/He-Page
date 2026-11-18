/* ============================================================
 * 纸面涂鸦漂浮特效（手绘线条小图形缓慢漂移）
 * 想更浓/更淡：改 COUNT（数量）、OPACITY（浓淡范围）
 * IE8 及以下不支持 SVG，自动不加载
 * ============================================================ */
(function () {
    // IE8/IE7 不支持 SVG，直接退出
    var supportsSVG = !!(document.createElementNS &&
        document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
    if (!supportsSVG) return;

    var SHAPES = [
        '<path d="M12 4v16M4 12h16"/>',                                                     // 加号
        '<path d="M12 2.6 14.6 8.4 20.9 9.1 16.1 13.5 17.4 19.8 12 16.7 6.6 19.8 7.9 13.5 3.1 9.1 9.4 8.4Z"/>', // 五角星
        '<circle cx="12" cy="12" r="7.5"/>',                                                // 圆圈
        '<path d="M2 14c3-6 6 6 9 0s7 6 10 0"/>',                                           // 波浪
        '<path d="M3 16l4-8 4 8 4-8 3 6"/>',                                                // 折线
        '<path d="M12 3l7.5 9L12 21 4.5 12Z"/>',                                            // 菱形
        '<path d="M5 19C5 11 11 5 19 5"/><path d="M15 5h4v4"/>',                            // 弧线箭头
        '<path d="M4 20 20 4"/>',                                                           // 斜线
        '<circle cx="12" cy="12" r="8" stroke-dasharray="3 4"/>',                            // 虚线圆
        '<path d="M12 4v3M12 17v3M4 12h3M17 12h3"/><circle cx="12" cy="12" r="3"/>',         // 小太阳
        '<path d="M5 12h14M8 7l4 5-4 5"/>',                                                 // 单向箭头
        '<path d="M6 18c0-6 5-10 12-10M6 18c6 0 10-5 10-12"/>'                               // 手绘曲线
    ];

    var w = window.innerWidth || document.documentElement.clientWidth;
    var COUNT = w >= 1024 ? 26 : (w >= 601 ? 18 : 11);
    var OPACITY = [0.18, 0.34];

    var layer = document.createElement('div');
    layer.className = 'doodle-layer';
    layer.setAttribute('aria-hidden', 'true');

    var motion = ['', ' alt', ' spin'];

    for (var i = 0; i < COUNT; i++) {
        var shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        var isLime = Math.random() < 0.3;
        var m = motion[Math.floor(Math.random() * motion.length)];

        var el = document.createElement('span');
        el.className = 'doodle' + (isLime ? ' lime' : '') + m;

        var size = 14 + Math.random() * 34;
        var opacity = isLime
            ? (0.34 + Math.random() * 0.24)
            : (OPACITY[0] + Math.random() * (OPACITY[1] - OPACITY[0]));

        el.style.left = (Math.random() * 96) + '%';
        el.style.top = (Math.random() * 96) + '%';
        el.style.width = size.toFixed(0) + 'px';
        el.style.height = size.toFixed(0) + 'px';
        el.style.opacity = opacity.toFixed(2);
        el.style.animationDuration = (16 + Math.random() * 22).toFixed(1) + 's';
        el.style.animationDelay = '-' + (Math.random() * 24).toFixed(1) + 's';

        el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + shape + '</svg>';

        layer.appendChild(el);
    }

    function mount() {
        if (document.body) document.body.appendChild(layer);
    }
    if (document.body) mount();
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', mount);
    else if (document.attachEvent) document.attachEvent('onreadystatechange', mount);
})();
