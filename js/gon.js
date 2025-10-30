(function (g) {
  const GON = {
    skin: '#ffd7a6',
    skinShade: '#f2bf86',
    blush: '#e89a7f',
    hair: '#0a0a0a',
    hairEdge: '#1b4d1a',
    eyeWhite: '#ffffff',
    iris: '#f0a800',
    irisDark: '#c47c00',
    pupil: '#1a1a1a',
    shine: '#ffffff',
    outline: '#ffffff',
    line: '#1b1b1b',
  };

  function gonOutlineFill(ctx, drawPath, fill, px) {
    ctx.save();
    drawPath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = GON.outline;
    ctx.lineWidth = Math.max(1.5, px * 0.06);
    ctx.stroke();
    ctx.strokeStyle = GON.line;
    ctx.lineWidth = Math.max(0.35, px * 0.012);
    ctx.stroke();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  g.drawGonHead = function drawGonHead(ctx, x, y, radius) {
    const R = radius * 3;
    const px = R / 10;

    const ELL = (cx, cy, rx, ry) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    };

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(R / 300, R / 300);

    // Pelo
    gonOutlineFill(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-210, -60);
      ctx.lineTo(-250, -170);
      ctx.lineTo(-140, -150);
      ctx.lineTo(-60, -230);
      ctx.lineTo(0, -270);
      ctx.lineTo(60, -230);
      ctx.lineTo(140, -150);
      ctx.lineTo(250, -170);
      ctx.lineTo(210, -60);
      ctx.quadraticCurveTo(120, -40, 100, -20);
      ctx.quadraticCurveTo(0, -40, -100, -20);
      ctx.quadraticCurveTo(-120, -40, -210, -60);
      ctx.closePath();
    }, GON.hair, px);

    // Bordes del pelo
    ctx.save();
    ctx.strokeStyle = GON.hairEdge;
    ctx.lineWidth = Math.max(1, px * 0.8);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-220, -70);
    ctx.lineTo(-165, -120);
    ctx.lineTo(-90, -190);
    ctx.lineTo(0, -245);
    ctx.lineTo(90, -190);
    ctx.lineTo(165, -120);
    ctx.lineTo(220, -70);
    ctx.stroke();
    ctx.restore();

    // Cara y orejas
    gonOutlineFill(ctx, () => { ELL(0, 40, 170, 170); }, GON.skin, px);
    gonOutlineFill(ctx, () => { ELL(-155, 35, 28, 35); }, GON.skin, px);
    gonOutlineFill(ctx, () => { ELL(155, 35, 28, 35); }, GON.skin, px);

    // Rubor
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = GON.blush;
    ELL(-70, 70, 50, 28); ctx.fill();
    ELL(70, 70, 50, 28); ctx.fill();
    ctx.restore();

    // Ojos
    const eyeY = 20;
    gonOutlineFill(ctx, () => { ELL(-70, eyeY, 48, 62); }, GON.eyeWhite, px);
    gonOutlineFill(ctx, () => { ELL(70, eyeY, 48, 62); }, GON.eyeWhite, px);
    gonOutlineFill(ctx, () => { ELL(-70, eyeY + 6, 30, 40); }, GON.iris, px);
    gonOutlineFill(ctx, () => { ELL(70, eyeY + 6, 30, 40); }, GON.iris, px);

    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = GON.irisDark;
    ELL(-70, eyeY + 20, 30, 24); ctx.fill();
    ELL(70, eyeY + 20, 30, 24); ctx.fill();
    ctx.restore();

    gonOutlineFill(ctx, () => { ELL(-70, eyeY + 12, 16, 22); }, GON.pupil, px);
    gonOutlineFill(ctx, () => { ELL(70, eyeY + 12, 16, 22); }, GON.pupil, px);

    // Brillos
    ctx.save();
    ctx.fillStyle = GON.shine;
    ELL(-88, eyeY - 10, 10, 10); ctx.fill();
    ELL(52, eyeY - 10, 10, 10); ctx.fill();
    ctx.restore();

    // Cejas
    gonOutlineFill(ctx, () => { ctx.rect(-110, eyeY - 58, 80, 16); }, GON.hair, px);
    gonOutlineFill(ctx, () => { ctx.rect(30, eyeY - 58, 80, 16); }, GON.hair, px);

    // Boca
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = GON.outline;
    ctx.lineWidth = Math.max(1.5, px * 0.06);
    ctx.beginPath();
    ctx.moveTo(-40, 108);
    ctx.quadraticCurveTo(0, 128, 40, 108);
    ctx.stroke();

    ctx.strokeStyle = GON.line;
    ctx.lineWidth = Math.max(0.35, px * 0.012);
    ctx.beginPath();
    ctx.moveTo(-40, 108);
    ctx.quadraticCurveTo(0, 128, 40, 108);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };
})(window);
