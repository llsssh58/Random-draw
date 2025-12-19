const canvas = document.getElementById('ladder');
const ctx = canvas.getContext('2d');
let W = 0, H = 0;
let players = [];
let results = [];
let xs = [];
let rungs = [];
let anim = null;

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    W = canvas.width; H = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', () => { resize(); draw(); });
resize();

const emojis = ['🐸', '🐱', '🐶', '🐯', '🐵', '🦊', '🐼', '🐨', '🦁', '🐰'];

function addName(v = '') {
    const row = document.createElement('div'); row.className = 'row';
    const e = document.createElement('input'); e.placeholder = '😀'; e.value = emojis[Math.floor(Math.random() * emojis.length)]; e.style.maxWidth = '60px';
    const n = document.createElement('input'); n.placeholder = '이름'; n.value = v;
    const d = document.createElement('button'); d.textContent = '✕'; d.onclick = () => row.remove();
    row.append(e, n, d);
    document.getElementById('names').appendChild(row);
}

function addResult(v = '') {
    const row = document.createElement('div'); row.className = 'row';
    const r = document.createElement('input'); r.placeholder = '벌칙/결과'; r.value = v;
    const d = document.createElement('button'); d.textContent = '✕'; d.onclick = () => row.remove();
    row.append(r, d);
    document.getElementById('results').appendChild(row);
}

function collect() {
    players = [...document.querySelectorAll('#names .row')].map(r => ({ emoji: r.children[0].value || '😀', name: r.children[1].value || '이름' }));
    results = [...document.querySelectorAll('#results .row')].map(r => r.children[0].value || '결과');
}

function makeRungs() {
    rungs = [];
    const n = players.length;
    const top = 80, bottom = H / (window.devicePixelRatio || 1) - 60;
    const count = n * 6;
    for (let i = 0; i < count; i++) {
        const col = Math.floor(Math.random() * (n - 1));
        const y = top + Math.random() * (bottom - top);
        rungs.push({ col, y });
    }
    rungs.sort((a, b) => a.y - b.y);
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    if (players.length < 2) return;
    const n = players.length;
    const top = 80, bottom = H / (window.devicePixelRatio || 1) - 60;
    xs = [];
    const gap = (canvas.getBoundingClientRect().width - 100) / (n - 1);

    ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.fillStyle = '#111'; ctx.textAlign = 'center';

    for (let i = 0; i < n; i++) {
        const x = 50 + i * gap;
        xs.push(x);
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
        ctx.font = '18px system-ui'; ctx.fillText(players[i].emoji, x, top - 36);
        ctx.font = '14px system-ui'; ctx.fillText(players[i].name, x, top - 16);
        ctx.fillText(results[i] || '', x, bottom + 24);
    }

    ctx.strokeStyle = '#555';
    rungs.forEach(r => { ctx.beginPath(); ctx.moveTo(xs[r.col], r.y); ctx.lineTo(xs[r.col + 1], r.y); ctx.stroke(); });
}

function reset() { if (anim) cancelAnimationFrame(anim); anim = null; draw(); }

function generate() {
    collect();
    if (players.length < 2 || players.length !== results.length) { alert('이름과 결과 개수를 같게 2개 이상 입력하세요.'); return; }
    resize();
    makeRungs();
    draw();
}

canvas.addEventListener('pointerdown', e => {
    if (players.length < 2) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let idx = 0, min = 1e9;
    xs.forEach((v, i) => { const d = Math.abs(v - x); if (d < min) { min = d; idx = i; } });
    trace(idx);
});

function trace(start) {
    reset();
    const top = 80, bottom = H / (window.devicePixelRatio || 1) - 60;
    let col = start;
    const path = [{ x: xs[col], y: top }];
    rungs.forEach(r => {
        const last = path[path.length - 1];
        if (r.y > last.y) {
            if (r.col === col) { path.push({ x: xs[col], y: r.y }); col++; path.push({ x: xs[col], y: r.y }); }
            else if (r.col === col - 1) { path.push({ x: xs[col], y: r.y }); col--; path.push({ x: xs[col], y: r.y }); }
        }
    });
    path.push({ x: xs[col], y: bottom });

    let i = 1, t = 0;
    function step() {
        draw();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
        for (let k = 1; k < i; k++) ctx.lineTo(path[k].x, path[k].y);
        if (i < path.length) { const a = path[i - 1], b = path[i]; ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t); }
        ctx.stroke();
        t += 0.08;
        if (t >= 1) { t = 0; i++; }
        if (i < path.length) anim = requestAnimationFrame(step);
        else setTimeout(() => alert(players[start].name + ' → ' + results[col]), 100);
    }
    step();
}

// 버튼 이벤트 연결
addNameBtn.onclick = () => addName();
addResultBtn.onclick = () => addResult();
genBtn.onclick = () => generate();
resetBtn.onclick = () => reset();

// 기본 4개
for (let i = 0; i < 4; i++) { addName(); addResult(); }