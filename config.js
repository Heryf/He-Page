/* ============================================================
 * 站点配置（以后只改这个文件即可，不用动 index.php / style.css）
 * 修改保存后刷新页面生效；若没变化请按 Ctrl + F5 强制刷新
 * ============================================================ */
var SITE_CONFIG = {

    /* ---------- 基本信息 ---------- */
    title: '小宝基地 · 小宝の导航',            // 浏览器标签页标题
    homeTitle: '◈ 小宝基地 ◈',                // 头像下方的站点名
    desc: '✦ 欢迎回来，旅人 ✦',   // 一句话简介（接口请求失败时的兜底文字）
    // 一言接口：填接口地址后，简介每次打开都会从接口随机取一句 ACG 台词；
    // 不想要随机句就把下面这行改成空字符串 ''
    descApi: 'https://acg.suyanw.cn/api/yiyan.php',

    /* ---------- 图片 ---------- */
    // 头像：填 QQ 号会自动取 QQ 头像；也可以直接填图片路径，如 'photos/avatar.jpg'
    avatar: 'https://api.suyanw.cn/api/qq.php/?qq=1401953811',
    // Banner 显示模式：'photo' = 贴纸相框（普通图/横图都用这个）；'standee' = 透明立绘直接站在纸面上
    bannerMode: 'photo',
    // Banner 图：星穹铁道随机图（接口返回 WebP，不支持时自动用下方兜底图）
    banner: 'https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%98%9F%E7%A9%B9%E9%93%81%E9%81%93',
    // 兜底图：给不支持 WebP 的浏览器用（IE 全系、老 Safari），留空则不做兜底
    bannerFallback: 'https://api.suyanw.cn/api/comic3.php',

    /* ---------- 三个标签的名字 ---------- */
    tabs: {
        a1: '小宝导航',
        a2: '联系我',
        a3: '小站动态'
    },

    /* ---------- 进站弹窗 ---------- */
    notice: {
        enabled: true,                         // false 则不弹窗
        title: '欢迎来到小宝基地',
        text: '这里是我的小宝发布站点<br>Ctrl+D 收藏不迷路，随时回来逛逛 ✦',
        button: '知道啦'
    },

    /* ---------- 卡片列表 ----------
     * 每张卡片：name 标题、icon 图标路径、url 跳转链接
     * 需要弹二维码的，把 url 换成 modal: '二维码图片路径'
     * ------------------------------------------------------ */
    lists: {
        // 第一个标签：次元导航
        a1: [
            { name: '软件下载-小宝导航',     icon: 'photos/xz.png',    url: 'https://szzbbs.cc.cd/' },
            { name: '软件工具教程', icon: 'photos/gj.png',    url: 'https://' },
            /*{ name: '游戏修改器',   icon: 'photos/flyy.png',  url: 'https://' },#
            { name: 'IPA软件/视距', icon: 'photos/ipa.png',   url: 'https://www.gov.vn' },
            { name: 'Adobe全家桶',  icon: 'photos/adobe.png', url: 'https://' },
            { name: '网站源码搭建', icon: 'photos/ym.png',    url: 'https://' },
            { name: '影视剧',       icon: 'photos/tv.png',    url: 'https://' },
            { name: '壁纸图片',     icon: 'photos/bz.png',    url: 'https://' }*/
        ],
        // 第二个标签：联系我
        a2: [
            { name: '我的微信', icon: 'photos/微信.png',    modal: 'photos/vx.jpg' },
            { name: '我的QQ',   icon: 'photos/QQ图标.png', modal: 'photos/QQ.jpg' }
        ],
        // 第三个标签：小站动态
        a3: [
            { name: '主页(备用)', icon: 'photos/orange.png', url: 'https://' }
        ]
    }
};

/* ============================================================
 * 以下为渲染逻辑，一般不用修改
 * ============================================================ */
(function () {
    var cfg = window.SITE_CONFIG;
    if (!cfg) return;

    /* ---------- 老浏览器兼容垫片（Win7 + IE8/9/10/11） ---------- */
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, ctx) {
            for (var i = 0; i < this.length; i++) fn.call(ctx, this[i], i, this);
        };
    }
    if (!Object.keys) {
        Object.keys = function (obj) {
            var arr = [], k;
            for (k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) arr.push(k);
            return arr;
        };
    }
    if (!String.prototype.trim) {
        String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
    }

    // IE 不支持 Element.closest，这里做最小补丁（IE8 没有 Element 构造器，需先判断）
    if (window.Element && Element.prototype && !Element.prototype.closest) {
        Element.prototype.closest = function (selector) {
            var el = this;
            while (el && el.nodeType === 1) {
                if (el.matches || el.msMatchesSelector || el.webkitMatchesSelector) {
                    var match = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
                    if (match.call(el, selector)) return el;
                }
                el = el.parentNode;
            }
            return null;
        };
    }

    // 老浏览器（Win7 IE）兼容标记，样式里用 html.ie-legacy 做降级
    var ua = navigator.userAgent;
    var isIE = /MSIE|Trident/.test(ua);
    if (isIE) document.documentElement.className += ' ie-legacy';

    /* ---------- 通用小工具 ---------- */
    // 事件绑定：IE8 只有 attachEvent
    function on(el, type, fn) {
        if (!el) return;
        if (el.addEventListener) el.addEventListener(type, fn, false);
        else if (el.attachEvent) el.attachEvent('on' + type, fn);
    }

    // 文本写入：IE8 没有 textContent
    function setText(node, text) {
        if (!node) return;
        if ('textContent' in node) node.textContent = text;
        else node.innerText = text;
    }

    function setTextOf(selector, value) {
        if (!value) return;
        setText(document.querySelector(selector), value);
    }

    // 类名操作：不依赖 classList（IE9 及以下都没有）
    function addClass(el, cls) {
        if (!el) return;
        if ((' ' + el.className + ' ').indexOf(' ' + cls + ' ') < 0) {
            el.className = el.className ? el.className + ' ' + cls : cls;
        }
    }
    function removeClass(el, cls) {
        if (!el) return;
        el.className = (' ' + el.className + ' ').replace(' ' + cls + ' ', ' ').replace(/^\s+|\s+$/g, '');
    }
    function hasClass(el, cls) {
        return !!el && (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
    window.__siteAddClass = addClass;
    window.__siteRemoveClass = removeClass;
    window.__siteHasClass = hasClass;
    window.__siteOn = on;

    var supportsSVG = !!(document.createElementNS &&
        document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);

    // 浏览器标题
    if (cfg.title) document.title = cfg.title;

    // 站点名 / 简介
    setTextOf('.author-name', cfg.homeTitle);
    setTextOf('.desc', cfg.desc);

    // 简介接一言 API：成功则覆盖上面的兜底文字，失败不影响页面
    // 用 XMLHttpRequest 而不是 fetch —— Win7 的 IE 不支持 fetch，会直接报错中断整个脚本
    if (cfg.descApi) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', cfg.descApi, true);
            try { xhr.timeout = 6000; } catch (e0) { /* IE9 以下不支持 timeout */ }
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    var text = (xhr.responseText || '').replace(/^\s+|\s+$/g, '');
                    if (text) {
                        setTextOf('.desc', '✦ ' + text + ' ✦');
                    }
                }
            };
            xhr.send();
        } catch (e) { /* 接口异常时保持 cfg.desc 兜底文字 */ }
    }

    // Banner 图：写进贴纸相框里的 <img>
    // 若浏览器不支持 WebP（IE 全系），自动改用 bannerFallback，避免相框空白
    var canWebp = false;
    try {
        var probe = document.createElement('canvas');
        canWebp = !!(probe.toDataURL && probe.toDataURL('image/webp').indexOf('image/webp') > -1);
    } catch (e) { canWebp = false; }

    // 立绘本身就是 PNG，IE 也能显示，只有相框模式才需要 WebP 回退
    var bannerSrc = cfg.banner;
    if (cfg.bannerMode !== 'standee' && cfg.bannerFallback && !canWebp) {
        bannerSrc = cfg.bannerFallback;
    }

    var bannerImg = document.getElementById('bannerImg');
    var bannerBox = document.querySelector('.banner');
    if (bannerBox && cfg.bannerMode === 'standee') {
        bannerBox.className += ' is-standee';
    }
    if (bannerImg && bannerSrc) {
        // 加载失败（接口挂掉/超时）时自动换兜底图
        bannerImg.onerror = function () {
            if (cfg.bannerFallback && this.src !== cfg.bannerFallback) {
                this.src = cfg.bannerFallback;
            }
        };
        bannerImg.src = bannerSrc;
    }

    // 头像
    var logoImg = document.querySelector('.logo img');
    if (logoImg && cfg.avatar) logoImg.src = cfg.avatar;

    // 标签名称
    if (cfg.tabs) {
        Object.keys(cfg.tabs).forEach(function (key) {
            var el = document.querySelector('.tab-item[data-target="' + key + '"] .text');
            setText(el, cfg.tabs[key]);
        });
    }

    // 进站弹窗文案
    var notice = cfg.notice;
    if (notice) {
        var noticeBox = document.querySelector('.web_notice');
        if (notice.enabled === false) {
            // IE 不支持 .remove()，用 removeChild
            if (noticeBox && noticeBox.parentNode) noticeBox.parentNode.removeChild(noticeBox);
        } else if (noticeBox) {
            setTextOf('.web_notice h3', notice.title);
            var p = noticeBox.querySelector('p');
            if (p && notice.text) p.innerHTML = notice.text;
            var btn = noticeBox.querySelector('a');
            setText(btn, notice.button);
        }
    }

    // 卡片列表
    if (cfg.lists) {
        Object.keys(cfg.lists).forEach(function (key) {
            var list = document.querySelector('.app-list.' + key);
            if (!list) return;

            while (list.firstChild) list.removeChild(list.firstChild);

            (cfg.lists[key] || []).forEach(function (item) {
                var a = document.createElement('a');
                a.className = 'item';
                a.style.opacity = '1';
                if (item.modal) {
                    a.href = 'javascript:void(0);';
                    a.setAttribute('data-modal', item.modal);
                } else {
                    a.href = item.url || 'javascript:void(0);';
                    a.target = '_blank';
                }

                var wrap = document.createElement('div');
                wrap.className = 'content-wrap';

                var imgWrap = document.createElement('div');
                imgWrap.className = 'img-wrap';

                var img = document.createElement('img');
                img.src = item.icon || '';
                img.alt = '';
                imgWrap.appendChild(img);

                var name = document.createElement('p');
                name.className = 'app-name';
                setText(name, item.name || '');

                wrap.appendChild(imgWrap);
                wrap.appendChild(name);
                a.appendChild(wrap);
                list.appendChild(a);
            });
        });
    }

    // 点击二维码卡片时打开预览（鼠标 / 触屏 / IE8 都支持）
    function closestAttr(el, attr) {
        while (el && el.nodeType === 1) {
            if (el.getAttribute && el.getAttribute(attr)) return el;
            el = el.parentNode;
        }
        return null;
    }

    var lastTap = 0;
    function handleCardTap(e) {
        e = e || window.event;
        var target = closestAttr(e.target || e.srcElement, 'data-modal');
        if (!target) return;
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;

        var now = new Date().getTime();
        if (now - lastTap < 400) return;  // 触屏上 touchend 与 click 会重复触发，去重
        lastTap = now;

        if (window.showModal) window.showModal(target.getAttribute('data-modal'));
    }

    on(document, 'click', handleCardTap);
    on(document, 'touchend', handleCardTap);
})();
