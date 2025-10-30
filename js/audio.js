(function (g) {
  let ac, musicGain, sfxGain, bgGain, musicInterval;
  let bgBuffer = null, bgSource = null;

  // Crea el AudioContext y la cadena básica de nodos de volumen (gains)
  function init() {
    if (ac) return;
    ac = new (window.AudioContext || window.webkitAudioContext)();

    musicGain = ac.createGain();
    sfxGain   = ac.createGain();
    bgGain    = ac.createGain();

    // Volúmenes iniciales
    musicGain.gain.value = 0.01;
    sfxGain.gain.value   = 0.15;
    bgGain.gain.value    = 0.09;

    // Conexión de cada canal al destino (altavoces)
    musicGain.connect(ac.destination);
    sfxGain.connect(ac.destination);
    bgGain.connect(ac.destination);
  }

  // Beep genérico para SFX con oscilador + envolvente rápida
  function beep(freq = 440, dur = 0.08) {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();

    o.frequency.value = freq;
    o.type = 'square';
    o.connect(g);
    g.connect(sfxGain);

    const t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    o.start();
    o.stop(t + dur);
  }

  // Atajos de SFX
  function hit()    { beep(180, 0.12); }
  function pickup() { beep(720, 0.08); }

  // Música "procedural" muy simple: lanza una nota cada 900 ms
  function startMusic() {
    if (!ac) return;
    stopMusic();

    musicInterval = setInterval(() => {
      const o = ac.createOscillator();
      const g = ac.createGain();

      // Escala mayor aproximada (A3-B3-C4-D4-E4-F4-G4)
      const baseNotes = [220, 247, 262, 294, 330, 349, 392];
      const base = baseNotes[Math.floor(Math.random() * baseNotes.length)];

      // A veces sube una quinta (x1.5)
      o.frequency.value = base * (Math.random() < 0.3 ? 1.5 : 1);
      o.type = 'sine';

      o.connect(g);
      g.connect(musicGain);

      const t = ac.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

      o.start();
      o.stop(t + 0.85);
    }, 900);
  }

  function stopMusic() {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = null;
  }

  // Carga (fetch) y decodifica un audio para usarlo como fondo (loop)
  async function loadBackground(url) {
    init();
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    bgBuffer = await ac.decodeAudioData(buf);
  }

  function startBackground() {
    if (!ac || !bgBuffer) return;
    stopBackground();

    bgSource = ac.createBufferSource();
    bgSource.buffer = bgBuffer;
    bgSource.loop = true;
    bgSource.connect(bgGain);
    bgSource.start(0);
  }

  function stopBackground() {
    if (bgSource) {
      try { bgSource.stop(); } catch {}
      bgSource.disconnect();
      bgSource = null;
    }
  }

  // Controles de volumen por “canal”
  function setBgVolume(v)    { if (bgGain)    bgGain.gain.value = v; }
  function setMusicVolume(v) { if (musicGain) musicGain.gain.value = v; }
  function setSfxVolume(v)   { if (sfxGain)   sfxGain.gain.value = v; }

  // Exponer API en window
  g.AudioSys = {
    init,
    beep,
    hit,
    pickup,
    startMusic,
    stopMusic,
    loadBackground,
    startBackground,
    stopBackground,
    setBgVolume,
    setMusicVolume,
    setSfxVolume,
  };
})(window);
