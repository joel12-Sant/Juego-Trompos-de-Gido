(function (g) {
  const GIDO = {
    rimA: '#c7ccd4',
    rimB: '#8f99a6',
    studColor: '#e9eef6',
    studShadow: 'rgba(0,0,0,.35)',
    accent: '#d21f3c',
    spiralA: '#111111',
    spiralB: '#ffcc00',
    coreOuter: '#1a1a1a',
    coreInner: '#30343a',
    tipA: '#d7dbe0',
    tipB: '#737b87',
  };

  function ringSegment(ctx, cx, cy, r0, r1, a0, a1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r1, a0, a1);
    ctx.arc(cx, cy, r0, a1, a0, true);
    ctx.closePath();
  }

  g.drawTop = function drawTop(ctx, b) {
    const base = b.r;
    const R = base * 2.2;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle || 0);
    ctx.shadowColor = 'rgba(0,0,0,.25)';
    ctx.shadowBlur = 8;

    // Aro exterior
    const rimGrad = ctx.createLinearGradient(-R, -R, R, R);
    rimGrad.addColorStop(0, GIDO.rimB);
    rimGrad.addColorStop(0.5, GIDO.rimA);
    rimGrad.addColorStop(1, GIDO.rimB);
    ctx.fillStyle = rimGrad;
    ringSegment(ctx, 0, 0, R * 0.78, R * 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Remaches
    const studs = 12;
    for (let i = 0; i < studs; i++) {
      const a = i * (Math.PI * 2 / studs);
      const rr = R * 0.93;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;

      ctx.fillStyle = GIDO.studShadow;
      ctx.beginPath();
      ctx.arc(x + R * 0.008, y + R * 0.008, R * 0.028, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createRadialGradient(x - R * 0.01, y - R * 0.01, R * 0.004, x, y, R * 0.03);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.3, GIDO.studColor);
      g.addColorStop(1, '#b7c0cc');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R * 0.026, 0, Math.PI * 2);
      ctx.fill();
    }

    // Acento + círculo
    ctx.strokeStyle = GIDO.accent;
    ctx.lineWidth = Math.max(1, R * 0.016);
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.78, 0, Math.PI * 2);
    ctx.stroke();

    // Espiral interior
    const innerR = R * 0.76;
    const turns = 6;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const a0 = (i / steps) * Math.PI * 2 * turns;
      const a1 = ((i + 1) / steps) * Math.PI * 2 * turns;
      const r0 = innerR * (i / steps);
      const r1 = innerR * ((i + 1) / steps);
      ctx.fillStyle = (i % 2 === 0) ? GIDO.spiralA : GIDO.spiralB;
      ringSegment(ctx, 0, 0, r0, r1, a0, a1);
      ctx.fill();
    }

    // Núcleo
    const capR = R * 0.22;
    const capG = ctx.createRadialGradient(-capR * 0.3, -capR * 0.3, capR * 0.1, 0, 0, capR);
    capG.addColorStop(0, '#fafafa');
    capG.addColorStop(0.35, GIDO.coreOuter);
    capG.addColorStop(1, '#0b0c0e');
    ctx.fillStyle = capG;
    ctx.beginPath();
    ctx.arc(0, 0, capR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = GIDO.coreInner;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // Contorno exterior
    ctx.lineWidth = Math.max(1, R * 0.018);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.0, 0, Math.PI * 2);
    ctx.stroke();

    // Punta
    ctx.save();
    ctx.rotate(Math.PI / 2);
    ctx.translate(0, R * 1.02);
    const tipGrad = ctx.createLinearGradient(0, 0, 0, R * 0.24);
    tipGrad.addColorStop(0, GIDO.tipA);
    tipGrad.addColorStop(1, GIDO.tipB);
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-R * 0.06, R * 0.24);
    ctx.lineTo(R * 0.06, R * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };
})(window);
