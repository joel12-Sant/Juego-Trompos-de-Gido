(function(g){
  let ac, musicGain, sfxGain, bgGain, musicInterval, bgBuffer=null, bgSource=null;
  function init(){ if(ac) return; ac=new (window.AudioContext||window.webkitAudioContext)(); musicGain=ac.createGain(); sfxGain=ac.createGain(); bgGain=ac.createGain(); musicGain.gain.value=0.01; sfxGain.gain.value=0.15; bgGain.gain.value=0.09; musicGain.connect(ac.destination); sfxGain.connect(ac.destination); bgGain.connect(ac.destination); }
  function beep(freq=440,dur=.08){ if(!ac) return; const o=ac.createOscillator(), g=ac.createGain(); o.frequency.value=freq; o.type='square'; o.connect(g); g.connect(sfxGain); const t=ac.currentTime; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.4,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.start(); o.stop(t+dur); }
  function hit(){ beep(180,.12); }
  function pickup(){ beep(720,.08); }
  function startMusic(){ if(!ac) return; stopMusic(); musicInterval=setInterval(()=>{ const o=ac.createOscillator(), g=ac.createGain(); const base=[220,247,262,294,330,349,392][Math.floor(Math.random()*7)]; o.frequency.value=base*(Math.random()<.3?1.5:1); o.type='sine'; o.connect(g); g.connect(musicGain); const t=ac.currentTime; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.12,t+.2); g.gain.exponentialRampToValueAtTime(.0001,t+.8); o.start(); o.stop(t+.85); },900); }
  function stopMusic(){ if(musicInterval) clearInterval(musicInterval); musicInterval=null; }
  async function loadBackground(url){ init(); const res=await fetch(url); const buf=await res.arrayBuffer(); bgBuffer=await ac.decodeAudioData(buf); }
  function startBackground(){ if(!ac||!bgBuffer) return; stopBackground(); bgSource=ac.createBufferSource(); bgSource.buffer=bgBuffer; bgSource.loop=true; bgSource.connect(bgGain); bgSource.start(0); }
  function stopBackground(){ if(bgSource){ try{ bgSource.stop(); }catch{} bgSource.disconnect(); bgSource=null; } }
  function setBgVolume(v){ if(bgGain) bgGain.gain.value=v; }
  function setMusicVolume(v){ if(musicGain) musicGain.gain.value=v; }
  function setSfxVolume(v){ if(sfxGain) sfxGain.gain.value=v; }
  g.AudioSys={ init, beep, hit, pickup, startMusic, stopMusic, loadBackground, startBackground, stopBackground, setBgVolume, setMusicVolume, setSfxVolume };
})(window);
