import { useRef, useEffect, useCallback } from 'react';

/**
 * Interactive Canvas Background — Enhanced Dark Version
 * - Warping dot grid that bends near cursor
 * - Large dark gradient orbs that repel from mouse
 * - Glowing cursor trail with sparkle particles
 * - Click ripple waves with shockwave
 * - Floating connected nodes network
 */
export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: -999, y: -999 },
    prevMouse: { x: -999, y: -999 },
    orbs: [],
    ripples: [],
    trail: [],
    sparkles: [],
    nodes: [],
    gridPoints: [],
    width: 0,
    height: 0,
    animId: null,
  });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    s.width = window.innerWidth;
    s.height = window.innerHeight;
    canvas.width = s.width;
    canvas.height = s.height;

    // Floating orbs — larger, darker
    s.orbs = [];
    for (let i = 0; i < 14; i++) {
      s.orbs.push({
        x: Math.random() * s.width,
        y: Math.random() * s.height,
        baseX: Math.random() * s.width,
        baseY: Math.random() * s.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 90 + 50,
        color: ['#034a37', '#022c22', '#1a3a2a', '#0a3020', '#14532d', '#052e16'][Math.floor(Math.random() * 6)],
        opacity: Math.random() * 0.15 + 0.08,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Floating nodes network
    s.nodes = [];
    for (let i = 0; i < 50; i++) {
      s.nodes.push({
        x: Math.random() * s.width,
        y: Math.random() * s.height,
        baseX: Math.random() * s.width,
        baseY: Math.random() * s.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 3 + 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Grid for warp effect
    s.gridPoints = [];
    const spacing = 40;
    for (let x = 0; x <= s.width + spacing; x += spacing) {
      for (let y = 0; y <= s.height + spacing; y += spacing) {
        s.gridPoints.push({ x, y, baseX: x, baseY: y });
      }
    }
  }, []);

  useEffect(() => {
    init();

    const handleResize = () => init();
    const handleMouseMove = (e) => {
      const s = stateRef.current;
      s.prevMouse.x = s.mouse.x;
      s.prevMouse.y = s.mouse.y;
      s.mouse.x = e.clientX;
      s.mouse.y = e.clientY;

      // Trail
      s.trail.push({ x: e.clientX, y: e.clientY, life: 1, size: 6 });
      if (s.trail.length > 50) s.trail.shift();

      // Sparkles on fast movement
      const speed = Math.sqrt(
        (s.mouse.x - s.prevMouse.x) ** 2 + (s.mouse.y - s.prevMouse.y) ** 2
      );
      if (speed > 8) {
        for (let k = 0; k < 2; k++) {
          s.sparkles.push({
            x: e.clientX + (Math.random() - 0.5) * 20,
            y: e.clientY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 1,
            life: 1,
            size: Math.random() * 3 + 1,
          });
        }
      }
    };
    const handleClick = (e) => {
      const s = stateRef.current;
      // Multiple ripple rings
      for (let r = 0; r < 3; r++) {
        s.ripples.push({
          x: e.clientX, y: e.clientY,
          radius: r * 10,
          maxRadius: 300 - r * 50,
          opacity: 0.4 - r * 0.1,
          lineWidth: 3 - r * 0.8,
        });
      }
      // Burst sparkles
      for (let k = 0; k < 15; k++) {
        const angle = (Math.PI * 2 * k) / 15;
        s.sparkles.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * (3 + Math.random() * 3),
          vy: Math.sin(angle) * (3 + Math.random() * 3),
          life: 1,
          size: Math.random() * 3.5 + 1.5,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, s.width, s.height);
      const time = Date.now() * 0.001;

      // ── 1. WARP DOT GRID ──
      const rows = Math.ceil(s.height / 40) + 1;
      for (let i = 0; i < s.gridPoints.length; i++) {
        const p = s.gridPoints[i];
        const dx = s.mouse.x - p.baseX;
        const dy = s.mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 160;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 22;
          p.x = p.baseX + (dx / dist) * force;
          p.y = p.baseY + (dy / dist) * force;
        } else {
          p.x = p.baseX;
          p.y = p.baseY;
        }

        // Draw dot
        const dotDist = dist < maxDist ? (1 - dist / maxDist) : 0;
        const dotSize = 1 + dotDist * 2.5;
        const dotAlpha = 0.08 + dotDist * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 80, 55, ${dotAlpha})`;
        ctx.fill();
      }

      // ── 2. FLOATING ORBS ──
      for (const orb of s.orbs) {
        orb.baseX += orb.vx;
        orb.baseY += orb.vy;
        if (orb.baseX < -80 || orb.baseX > s.width + 80) orb.vx *= -1;
        if (orb.baseY < -80 || orb.baseY > s.height + 80) orb.vy *= -1;

        const breathe = Math.sin(time * 0.6 + orb.phase) * 12;
        let drawX = orb.baseX;
        let drawY = orb.baseY + breathe;

        // Repel from cursor
        const dx = drawX - s.mouse.x;
        const dy = drawY - s.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250 && dist > 0) {
          const repel = (1 - dist / 250) * 100;
          drawX += (dx / dist) * repel;
          drawY += (dy / dist) * repel;
        }

        const r = orb.radius + breathe * 2;
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, r);
        grad.addColorStop(0, orb.color + 'cc');
        grad.addColorStop(0.5, orb.color + '55');
        grad.addColorStop(1, orb.color + '00');
        ctx.globalAlpha = orb.opacity;
        ctx.beginPath();
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── 3. NODE NETWORK ──
      for (const node of s.nodes) {
        node.baseX += node.vx;
        node.baseY += node.vy;
        if (node.baseX < 0 || node.baseX > s.width) node.vx *= -1;
        if (node.baseY < 0 || node.baseY > s.height) node.vy *= -1;

        const bob = Math.sin(time * 0.8 + node.phase) * 4;
        let nx = node.baseX;
        let ny = node.baseY + bob;

        // Attract slightly toward cursor
        const dx = s.mouse.x - nx;
        const dy = s.mouse.y - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          nx += (dx / dist) * (1 - dist / 200) * 15;
          ny += (dy / dist) * (1 - dist / 200) * 15;
        }

        node.x = nx;
        node.y = ny;

        // Draw node
        ctx.beginPath();
        ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = dist < 200 ? '#047857' : '#065F46';
        ctx.globalAlpha = dist < 200 ? 0.7 : 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw connections between nearby nodes
      ctx.lineWidth = 0.8;
      for (let i = 0; i < s.nodes.length; i++) {
        for (let j = i + 1; j < s.nodes.length; j++) {
          const a = s.nodes[i], b = s.nodes[j];
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(4, 120, 87, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // ── 4. MOUSE TRAIL ──
      for (let i = s.trail.length - 1; i >= 0; i--) {
        const t = s.trail[i];
        t.life -= 0.03;
        t.size *= 0.965;
        if (t.life <= 0) { s.trail.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(4, 74, 55, ${t.life * 0.5})`;
        ctx.fill();
      }

      // ── 5. SPARKLES ──
      for (let i = s.sparkles.length - 1; i >= 0; i--) {
        const sp = s.sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.05; // gravity
        sp.life -= 0.02;
        if (sp.life <= 0) { s.sparkles.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(4, 120, 87, ${sp.life * 0.8})`;
        ctx.fill();

        // Tiny glow
        const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.size * 3 * sp.life);
        sg.addColorStop(0, `rgba(16, 185, 129, ${sp.life * 0.3})`);
        sg.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 3 * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }

      // ── 6. CLICK RIPPLES ──
      for (let i = s.ripples.length - 1; i >= 0; i--) {
        const r = s.ripples[i];
        r.radius += 3.5;
        r.opacity -= 0.005;
        r.lineWidth *= 0.985;
        if (r.opacity <= 0 || r.radius > r.maxRadius) { s.ripples.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(2, 44, 34, ${r.opacity})`;
        ctx.lineWidth = r.lineWidth;
        ctx.stroke();
      }

      // ── 7. CURSOR GLOW ──
      if (s.mouse.x > 0) {
        const cg = ctx.createRadialGradient(s.mouse.x, s.mouse.y, 0, s.mouse.x, s.mouse.y, 100);
        cg.addColorStop(0, 'rgba(4, 120, 87, 0.12)');
        cg.addColorStop(0.5, 'rgba(4, 120, 87, 0.04)');
        cg.addColorStop(1, 'rgba(4, 120, 87, 0)');
        ctx.beginPath();
        ctx.arc(s.mouse.x, s.mouse.y, 100, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
      }

      s.animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
