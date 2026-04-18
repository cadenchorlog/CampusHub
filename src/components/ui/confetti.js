const COLORS = ["#FF6A3D", "#FFC48A", "#FF8FB3", "#3FA34D", "#5FB8E6", "#FFE66D"];

export function burstConfetti(x, y, count = 14) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const root = document.body;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'yc-confetti-piece';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = COLORS[i % COLORS.length];
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    const dx = (Math.random() - 0.5) * 180;
    const dy = -(60 + Math.random() * 100);
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .4 },
        { transform: `translate(${dx * 1.3}px, 150px) rotate(${Math.random() * 1080}deg)`, opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.2,.8,.3,1)' }
    );
    root.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

export function burstFromEvent(ev) {
  if (!ev || !ev.currentTarget) return;
  const r = ev.currentTarget.getBoundingClientRect();
  burstConfetti(r.left + r.width / 2, r.top + r.height / 2);
}
