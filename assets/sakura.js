/* 樱花飘落特效（本地版，速度可调）
 * 可调参数在 CONFIG 里：
 *   count     花瓣数量（默认按屏幕宽度自动，桌面 46 / 手机 26）
 *   speedMin / speedMax   下落速度，单位 px/秒（数值越大越快）
 *   sway      左右摇摆幅度（px）
 *   sizeMin / sizeMax     花瓣大小（px）
 *   opacity   花瓣最大不透明度（0~1）
 */
(function () {
    var CONFIG = {
        count: 0,          // 0 = 自动
        speedMin: 6,       // 最慢 6px/秒
        speedMax: 20,      // 最快 20px/秒
        sway: 34,          // 左右飘动幅度
        sizeMin: 5,
        sizeMax: 11,
        opacity: 0.6
    };

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'sakura-canvas';
    canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:5';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var W = 0, H = 0, petals = [];

    function rand(a, b) { return a + Math.random() * (b - a); }

    function makePetal(y) {
        return {
            x: rand(-40, W + 40),
            y: y !== undefined ? y : rand(-H, 0),
            size: rand(CONFIG.sizeMin, CONFIG.sizeMax),
            speed: rand(CONFIG.speedMin, CONFIG.speedMax),
            swayAmp: rand(CONFIG.sway * 0.4, CONFIG.sway),
            swayFreq: rand(0.25, 0.6),          // 摇摆周期（次/秒），越小越慢
            phase: rand(0, Math.PI * 2),
            spin: rand(-0.6, 0.6),               // 自转速度（弧度/秒）
            angle: rand(0, Math.PI * 2),
            alpha: rand(0.35, CONFIG.opacity)
        };
    }

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var target = CONFIG.count || (W < 600 ? 26 : W < 1024 ? 36 : 46);
        petals = [];
        for (var i = 0; i < target; i++) petals.push(makePetal());
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        var s = p.size;
        var g = ctx.createLinearGradient(0, -s, 0, s);
        g.addColorStop(0, '#ffe4f0');
        g.addColorStop(1, '#ffa6c9');
        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.75, s * 0.55, 0, s);
        ctx.bezierCurveTo(-s * 0.75, s * 0.55, -s * 0.9, -s * 0.5, 0, -s);
        ctx.fill();

        ctx.restore();
    }

    var last = 0;
    function loop(now) {
        if (!last) last = now;
        var dt = Math.min((now - last) / 1000, 0.05); // 秒，避免切换标签页后跳帧
        last = now;

        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < petals.length; i++) {
            var p = petals[i];
            p.y += p.speed * dt;
            p.phase += p.swayFreq * Math.PI * 2 * dt;
            p.angle += p.spin * dt;
            p.x += Math.cos(p.phase) * p.swayAmp * 0.5 * dt;   // 缓慢左右飘

            if (p.y > H + 30) {
                petals[i] = makePetal(rand(-60, -10));
            }
            drawPetal(p);
        }

        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(loop);
})();
