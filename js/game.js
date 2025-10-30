// game.js (sin ES Modules). Requiere drawGonHead y drawTop en global (window).

const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const ui = {
  time: document.getElementById('ui-time'),
  score: document.getElementById('ui-score'),
  best: document.getElementById('ui-best'),
  btn: document.getElementById('btn-toggle'),
  overlay: document.getElementById('overlay'),
  help: document.getElementById('help'),
};

const BG = new Image();
let bgReady = false;
BG.onload = () => { bgReady = true; };
BG.src = 'sources/arena_coliseo.png';

// AudioSys debe estar en window (tu módulo de audio en IIFE)
AudioSys.loadBackground('audio/hunterxhunter.mp3').catch(console.error);
AudioSys.setBgVolume(0.05);

const rnd = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const S = {
  running: false,
  paused: true,
  t0: 0,
  time: 0,
  dt: 0,
  last: 0,
  score: 0,
  best: Number(localStorage.getItem('zetsu_best') || 0),
  player: { x: 480, y: 270, r: 12, vx: 0, vy: 0, speed: 300, hp: 100, maxhp: 100, iFrames: 0 },
  bullets: [],
  pickups: [],
  spawnTimer: 0,
  spawnEvery: 0.8,
  level: 1,
  keys: {},
};
ui.best.textContent = S.best;

addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  S.keys[e.key.toLowerCase()] = true;
  if (e.key === ' ') togglePause();
  if (e.key.toLowerCase() === 'r') reset();
});

addEventListener('keyup', (e) => {
  S.keys[e.key.toLowerCase()] = false;
});

ui.btn.addEventListener('click', () => {
  if (S.paused && !S.running) start();
  else togglePause();
});

cvs.addEventListener('pointerdown', () => {
  AudioSys.init();
}, { once: true });

function start() {
  S.running = true;
  S.paused = false;
  S.t0 = performance.now();
  S.last = S.t0;
  ui.overlay.style.display = 'none';
  ui.btn.textContent = 'Pausa';
  AudioSys.init();
  AudioSys.startMusic();
  AudioSys.startBackground();
}

function togglePause() {
  if (!S.running) { start(); return; }
  S.paused = !S.paused;
  ui.btn.textContent = S.paused ? 'Reanudar' : 'Pausa';
  if (S.paused) {
    AudioSys.stopMusic();
    AudioSys.stopBackground();
    ui.overlay.style.display = 'grid';
  } else {
    AudioSys.startMusic();
    AudioSys.startBackground();
    ui.overlay.style.display = 'none';
    S.last = performance.now();
  }
}

function gameOver() {
  S.paused = true;
  S.running = false;
  ui.btn.textContent = 'Reiniciar';
  AudioSys.stopMusic();
  ui.overlay.style.display = 'grid';
  ui.help.innerHTML =
    `<h2>¡Derrotado!</h2><p>Puntaje: <b>${S.score}</b> • Tiempo: <b>${S.time.toFixed(1)}</b>s</p>` +
    `<p><button class="btn" onclick="location.reload()">Jugar de nuevo</button></p>`;
  if (S.score > S.best) {
    S.best = S.score;
    localStorage.setItem('zetsu_best', String(S.score));
    ui.best.textContent = S.best;
  }
}

function reset() {
  const best = S.best;
  Object.assign(S, {
    running: false,
    paused: true,
    time: 0,
    score: 0,
    bullets: [],
    pickups: [],
    spawnTimer: 0,
    spawnEvery: 0.8,
    level: 1,
    last: performance.now(),
    player: { x: 480, y: 270, r: 12, vx: 0, vy: 0, speed: 300, hp: 100, maxhp: 100, iFrames: 0 },
  });
  S.best = best;
  ui.time.textContent = '0.0';
  ui.score.textContent = '0';
  ui.btn.textContent = 'Iniciar';
  ui.overlay.style.display = 'grid';
  ui.help.innerHTML = `
    <h2>✨ Entrena tu <em>Zetsu</em>: evita las balas de aura</h2>
    <p>Mueve al orbe (tu aura) y sobrevive lo más que puedas. El juego acelera con el tiempo.</p>
    <p><span class="kbd">WASD</span> / flechas • <span class="kbd">Espacio</span> Pausa • <span class="kbd">R</span> Reiniciar</p>
    <p>Bonus: recoge <span style="color:var(--good)">💚 auras</span> para subir puntaje y sanar.</p>
  `;
}

function spawnBullet() {
  const side = Math.floor(rnd(0, 4));
  let x, y, vx, vy;

  if (side === 0) { x = -10; y = rnd(0, cvs.height); }
  if (side === 1) { x = cvs.width + 10; y = rnd(0, cvs.height); }
  if (side === 2) { x = rnd(0, cvs.width); y = -10; }
  if (side === 3) { x = rnd(0, cvs.width); y = cvs.height + 10; }

  const dx = S.player.x - x;
  const dy = S.player.y - y;
  const len = Math.hypot(dx, dy) || 1;
  const speed = rnd(120, 180) + S.level * 6;

  vx = (dx / len) * speed + rnd(-20, 20);
  vy = (dy / len) * speed + rnd(-20, 20);

  const r = rnd(6, 10);
  S.bullets.push({
    x, y, r, vx, vy,
    life: 10,
    angle: rnd(0, Math.PI * 2),
    spin: rnd(4, 8),
    wobble: rnd(0.6, 1.2),
  });
}

function spawnPickup() {
  S.pickups.push({
    x: rnd(30, cvs.width - 30),
    y: rnd(30, cvs.height - 30),
    r: 7,
    life: 8,
  });
}

function update(dt) {
  S.time += dt;
  ui.time.textContent = S.time.toFixed(1);

  S.level = 1 + Math.floor(S.time / 10);
  S.spawnEvery = clamp(0.8 - S.time * 0.01, 0.18, 0.8);

  S.spawnTimer += dt;
  if (S.spawnTimer >= S.spawnEvery) {
    S.spawnTimer = 0;
    spawnBullet();
    if (Math.random() < 0.35) spawnPickup();
  }

  const p = S.player;
  let ax = 0, ay = 0;
  const k = S.keys;

  if (k['arrowup'] || k['w']) ay -= 1;
  if (k['arrowdown'] || k['s']) ay += 1;
  if (k['arrowleft'] || k['a']) ax -= 1;
  if (k['arrowright'] || k['d']) ax += 1;

  const inv = 1 / (Math.hypot(ax, ay) || 1);
  ax *= inv; ay *= inv;

  p.vx = ax * p.speed;
  p.vy = ay * p.speed;

  p.x = clamp(p.x + p.vx * dt, p.r, cvs.width - p.r);
  p.y = clamp(p.y + p.vy * dt, p.r, cvs.height - p.r);

  if (p.iFrames > 0) p.iFrames -= dt;

  // Balas ↔ jugador
  for (let i = S.bullets.length - 1; i >= 0; i--) {
    const b = S.bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.angle += (b.spin || 0) * dt;
    b.life -= dt;

    if (b.life <= 0 ||
        b.x < -20 || b.x > cvs.width + 20 ||
        b.y < -20 || b.y > cvs.height + 20) {
      S.bullets.splice(i, 1);
      continue;
    }

    const dx = b.x - p.x;
    const dy = b.y - p.y;
    const d2 = dx * dx + dy * dy;
    const rr = (b.r + p.r) * (b.r + p.r);

    if (d2 <= rr && p.iFrames <= 0) {
      S.score = Math.max(0, S.score - 5);
      ui.score.textContent = S.score;
      p.hp -= 20;
      p.iFrames = 0.6;
      AudioSys.hit();
      if (p.hp <= 0) gameOver();
    }
  }

  // Colisiones bala-bala
  for (let i = 0; i < S.bullets.length; i++) {
    for (let j = i + 1; j < S.bullets.length; j++) {
      const a = S.bullets[i], b = S.bullets[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist2 = dx * dx + dy * dy;
      const minDist = a.r + b.r;

      if (dist2 <= minDist * minDist) {
        const dist = Math.sqrt(dist2) || 1;
        const nx = dx / dist, ny = dy / dist;
        const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
        const rel = rvx * nx + rvy * ny;

        if (rel < 0) {
          const jimp = -(1 + 1.0) * rel / 2;
          const ix = jimp * nx, iy = jimp * ny;
          a.vx -= ix; a.vy -= iy;
          b.vx += ix; b.vy += iy;
        }

        const pen = minDist - dist;
        if (pen > 0) {
          const corr = Math.max(pen - 0.01, 0) / 2 * 0.8;
          const cx = corr * nx, cy = corr * ny;
          a.x -= cx; a.y -= cy;
          b.x += cx; b.y += cy;
        }
      }
    }
  }

  // Pickups ↔ jugador
  for (let i = S.pickups.length - 1; i >= 0; i--) {
    const c = S.pickups[i];
    c.life -= dt;
    if (c.life <= 0) {
      S.pickups.splice(i, 1);
      continue;
    }

    const dx = c.x - p.x;
    const dy = c.y - p.y;
    const d2 = dx * dx + dy * dy;
    const rr = (c.r + p.r) * (c.r + p.r);

    if (d2 <= rr) {
      S.pickups.splice(i, 1);
      S.score += 10;
      ui.score.textContent = S.score;
      p.hp = clamp(p.hp + 10, 0, p.maxhp);
      AudioSys.pickup();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  if (bgReady) {
    const iw = BG.naturalWidth || BG.width;
    const ih = BG.naturalHeight || BG.height;
    const scale = Math.max(cvs.width / iw, cvs.height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cvs.width - dw) / 2;
    const dy = (cvs.height - dh) / 2;
    ctx.drawImage(BG, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#0b0f13';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
  }

  const p = S.player;
  // drawGonHead y drawTop deben existir en window (definidos por gon.js y top.js)
  drawGonHead(ctx, p.x, p.y, p.r);

  // (opcional) re-resolver colisiones bala-bala al dibujar
  for (let i = 0; i < S.bullets.length; i++) {
    for (let j = i + 1; j < S.bullets.length; j++) {
      const a = S.bullets[i], b = S.bullets[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist2 = dx * dx + dy * dy;
      const minDist = a.r + b.r;
      if (dist2 <= minDist * minDist) {
        const dist = Math.sqrt(dist2) || 1;
        const nx = dx / dist, ny = dy / dist;
        const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
        const rel = rvx * nx + rvy * ny;
        if (rel < 0) {
          const jimp = -(1 + 1.0) * rel / 2;
          const ix = jimp * nx, iy = jimp * ny;
          a.vx -= ix; a.vy -= iy;
          b.vx += ix; b.vy += iy;
        }
        const pen = minDist - dist;
        if (pen > 0) {
          const corr = Math.max(pen - 0.01, 0) / 2 * 0.8;
          const cx = corr * nx, cy = corr * ny;
          a.x -= cx; a.y -= cy;
          b.x += cx; b.y += cy;
        }
      }
    }
  }

  for (const b of S.bullets) drawTop(ctx, b);

  for (const c of S.pickups) {
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = 'rgba(34,197,94,.35)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Barra de vida
  const hpw = 200, hph = 10, x = 20, y = 20;
  ctx.save();
  ctx.fillStyle = 'rgba(15,23,42,.7)';
  ctx.fillRect(x - 2, y - 2, hpw + 4, hph + 4);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x, y, hpw, hph);
  ctx.fillStyle = '#22c55e';
  const w = hpw * (S.player.hp / S.player.maxhp);
  ctx.fillRect(x, y, w, hph);
  ctx.strokeStyle = '#0ea5e9';
  ctx.globalAlpha = 0.25;
  ctx.strokeRect(x - 2, y - 2, hpw + 4, hph + 4);
  ctx.restore();

  ctx.fillStyle = 'rgba(229,231,235,.8)';
  ctx.font = '12px system-ui, Segoe UI, Roboto';
  ctx.fillText(`Nivel ${S.level}`, 20, 48);
}

function loop(now) {
  const dt = Math.min(0.033, (now - S.last) / 1000);
  S.last = now;
  if (!S.paused) {
    update(dt);
    draw();
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => {
  S.last = t;
  loop(t);
});
