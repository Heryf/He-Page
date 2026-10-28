/* ============================================================
 * 运维导航页渲染逻辑（一般不用改）
 * ============================================================ */
(function () {
    var cfg = window.OPS_CONFIG;
    if (!cfg) return;

    var content = document.getElementById('content');
    var searchInput = document.getElementById('search');
    var toast = document.getElementById('toast');
    var toastTimer = null;

    /* ---------- 线性图标 ---------- */
    var ICONS = {
        tool: '<path d="M14.7 6.3a3.5 3.5 0 0 1 4.6 4.6L9.9 20.3l-4.6-4.6z"/><path d="M6.5 15.5l2 2"/>',
        disk: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18"/><circle cx="7" cy="15" r="1.2"/>',
        drive: '<path d="M3 7a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
        doc: '<path d="M6 3h7l4 4v14H6z"/><path d="M13 3v4h4"/>',
        phone: '<path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M11 18h2"/>',
        net: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>',
        monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        code: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 10l2 2-2 2M13 14h3"/>'
    };

    function icon(name) {
        var path = ICONS[name] || ICONS.tool;
        return '<svg viewBox="0 0 24 24">' + path + '</svg>';
    }

    /* ---------- 提示 ---------- */
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }

    /* ---------- 复制 ---------- */
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () {
                showToast('已复制：' + text);
            }, fallback);
        } else {
            fallback();
        }
        function fallback() {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); showToast('已复制：' + text); }
            catch (e) { showToast('复制失败，请手动复制：' + text); }
            document.body.removeChild(ta);
        }
    }

    /* ---------- 生成卡片 ---------- */
    function makeCard(item) {
        var node, tag = item.copy ? 'button' : 'a';
        node = document.createElement(tag);
        node.className = 'card';
        if (item.copy) {
            node.type = 'button';
        } else {
            node.href = item.url || 'javascript:void(0);';
            node.target = '_blank';
            node.rel = 'noopener';
        }

        var status = item.status || 'ok';
        var statusText = status === 'fix' ? '维护中' : status === 'intranet' ? '仅内网' : '正常';

        node.innerHTML =
            '<span class="ico">' + icon(item.icon) + '</span>' +
            '<span class="meta"><b></b><small></small></span>' +
            '<span class="dot ' + status + '" title="' + statusText + '"></span>' +
            (item.copy ? '<span class="copy-tip">点击复制</span>' : '');

        node.querySelector('b').textContent = item.name || '';
        var desc = node.querySelector('small');
        if (item.desc) desc.textContent = item.desc;
        else desc.remove();

        node.dataset.search = [
            item.name || '', item.desc || '', item.tags || ''
        ].join(' ').toLowerCase();

        if (item.copy) {
            node.addEventListener('click', function () { copyText(item.copy); });
        }
        return node;
    }

    /* ---------- 渲染标签页 ---------- */
    function render() {
        content.innerHTML = '';

        Object.keys(cfg.groups || {}).forEach(function (key) {
            var panel = document.createElement('section');
            panel.className = 'panel' + (key === Object.keys(cfg.groups)[0] ? ' active' : '');
            panel.dataset.key = key;

            (cfg.groups[key] || []).forEach(function (group) {
                var box = document.createElement('div');
                box.className = 'group';

                var title = document.createElement('h2');
                title.className = 'group-title';
                title.textContent = group.title || '';
                box.appendChild(title);

                var grid = document.createElement('div');
                grid.className = 'grid';

                (group.items || []).forEach(function (item) {
                    grid.appendChild(makeCard(item));
                });

                box.appendChild(grid);
                panel.appendChild(box);
            });

            content.appendChild(panel);
        });

        // 标签按钮
        var tabs = document.querySelectorAll('.tab');
        Array.prototype.forEach.call(tabs, function (btn) {
            btn.addEventListener('click', function () {
                Array.prototype.forEach.call(tabs, function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                Array.prototype.forEach.call(document.querySelectorAll('.panel'), function (p) {
                    p.classList.toggle('active', p.dataset.key === btn.dataset.target);
                });
                applyFilter();
            });
        });
    }

    /* ---------- 搜索过滤 ---------- */
    function applyFilter() {
        var q = (searchInput.value || '').trim().toLowerCase();
        var panel = document.querySelector('.panel.active');
        if (!panel) return;

        var total = 0;
        Array.prototype.forEach.call(panel.querySelectorAll('.group'), function (group) {
            var shown = 0;
            Array.prototype.forEach.call(group.querySelectorAll('.card'), function (card) {
                var hit = !q || card.dataset.search.indexOf(q) > -1;
                card.style.display = hit ? '' : 'none';
                if (hit) shown++;
            });
            group.style.display = shown ? '' : 'none';
            total += shown;
        });

        var empty = panel.querySelector('.empty');
        if (!total) {
            if (!empty) {
                empty = document.createElement('p');
                empty.className = 'empty';
                empty.textContent = '没有找到相关工具，换个关键词试试';
                panel.appendChild(empty);
            }
        } else if (empty) {
            empty.remove();
        }
    }

    /* ---------- 初始化 ---------- */
    render();
    searchInput.addEventListener('input', applyFilter);

    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            searchInput.value = '';
            applyFilter();
            searchInput.blur();
        }
    });

    // 页脚文字
    var footLeft = document.getElementById('foot-left');
    var footVer = document.getElementById('foot-ver');
    if (footLeft && cfg.footer) footLeft.textContent = cfg.footer;
    if (footVer && cfg.version) footVer.textContent = cfg.version;

    // 标题
    if (cfg.siteTitle) {
        document.title = cfg.siteTitle;
        document.getElementById('site-title').textContent = cfg.siteTitle;
    }
    if (cfg.siteDesc) document.getElementById('site-desc').textContent = cfg.siteDesc;

    // 标签文字
    if (cfg.tabs) {
        Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (btn) {
            var name = cfg.tabs[btn.dataset.target];
            if (name) btn.textContent = name;
        });
    }
})();
