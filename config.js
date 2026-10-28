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
    // Banner 横幅图：可换成自己的图片，如 'photos/banner.jpg'
    banner: 'https://api.suyanw.cn/api/comic3.php',

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
        text: '这里是我的小宝发布站点<br>收藏不迷路，随时回来逛逛 ✦',
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

    function setText(selector, value) {
        if (!value) return;
        var el = document.querySelector(selector);
        if (el) el.textContent = value;
    }

    // 浏览器标题
    if (cfg.title) document.title = cfg.title;

    // 站点名 / 简介
    setText('.author-name', cfg.homeTitle);
    setText('.desc', cfg.desc);

    // 简介接一言 API：成功则覆盖上面的兜底文字，失败不影响页面
    if (cfg.descApi) {
        fetch(cfg.descApi, { cache: 'no-store' })
            .then(function (res) { return res.text(); })
            .then(function (text) {
                text = (text || '').trim();
                if (text) {
                    var el = document.querySelector('.desc');
                    if (el) el.textContent = '✦ ' + text + ' ✦';
                }
            })
            .catch(function () { /* 接口挂了就用 cfg.desc */ });
    }

    // Banner 图（通过 CSS 变量替换，不破坏原有布局）
    if (cfg.banner) {
        document.documentElement.style.setProperty('--banner-img', 'url("' + cfg.banner + '")');
    }

    // 头像
    var logoImg = document.querySelector('.logo img');
    if (logoImg && cfg.avatar) logoImg.src = cfg.avatar;

    // 标签名称
    if (cfg.tabs) {
        Object.keys(cfg.tabs).forEach(function (key) {
            var el = document.querySelector('.tab-item[data-target="' + key + '"] .text');
            if (el) el.textContent = cfg.tabs[key];
        });
    }

    // 进站弹窗文案
    var notice = cfg.notice;
    if (notice) {
        var noticeBox = document.querySelector('.web_notice');
        if (notice.enabled === false) {
            if (noticeBox) noticeBox.remove();
        } else if (noticeBox) {
            setText('.web_notice h3', notice.title);
            var p = noticeBox.querySelector('p');
            if (p && notice.text) p.innerHTML = notice.text;
            var btn = noticeBox.querySelector('a');
            if (btn && notice.button) btn.textContent = notice.button;
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
                name.textContent = item.name || '';

                wrap.appendChild(imgWrap);
                wrap.appendChild(name);
                a.appendChild(wrap);
                list.appendChild(a);
            });
        });
    }

    // 点击二维码卡片时打开预览
    document.addEventListener('click', function (e) {
        var target = e.target.closest ? e.target.closest('[data-modal]') : null;
        if (!target) return;
        e.preventDefault();
        if (window.showModal) window.showModal(target.getAttribute('data-modal'));
    });
})();
