const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const container = document.getElementById('wheelContainer');
const resultEl = document.getElementById('result');
let names = [];
let currentRotation = 0;

function colors(i) {
  const palette = ['#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#06b6d4','#7c3aed','#ec4899'];
  return palette[i % palette.length];
}

function drawWheel(list){
  const cx = canvas.width/2, cy = canvas.height/2, r = Math.min(cx,cy)-6;
  const n = list.length;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(cx,cy);
  const arc = 2*Math.PI/n;
  for(let i=0;i<n;i++){
    const start = i*arc - Math.PI/2;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,r,start,start+arc);
    ctx.closePath();
    ctx.fillStyle = colors(i);
    ctx.fill();
    // label
    ctx.save();
    ctx.rotate(start + arc/2);
    ctx.fillStyle = '#021226';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(list[i], r-10, 6);
    ctx.restore();
  }
  ctx.restore();
}

function parseParticipants(text){
  return text.split('\n').map(s=>s.trim()).filter(Boolean);
}

document.getElementById('drawBtn').addEventListener('click', ()=>{
  const t = document.getElementById('participants').value;
  names = parseParticipants(t);
  if(!names.length){ alert('Agrega al menos un participante'); return }
  drawWheel(names);
  resultEl.textContent = '';
});

document.getElementById('spinBtn').addEventListener('click', async ()=>{
  if(!names.length){ alert('Dibuja la rueda primero'); return }
  try{
    const res = await fetch('/spin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({participants:names})});
    const data = await res.json();
    if(res.status!==200){ alert(data.error||'Error'); return }
    const idx = data.index;
    // compute rotation so that chosen segment ends at pointer (top)
    const n = names.length;
    const segmentDeg = 360/n;
    const targetSegmentCenter = idx*segmentDeg + segmentDeg/2;
    // We want the segment center to be at 0deg (top). Current rotation in deg:
    const spins = 5; // full spins for effect
    const target = spins*360 + (360 - targetSegmentCenter);
    container.style.transition = 'transform 5s cubic-bezier(.17,.67,.34,1)';
    container.style.transform = `rotate(${target}deg)`;
    container.classList.add('spinning');
    container.addEventListener('transitionend', function done(){
      container.classList.remove('spinning');
      container.style.transition = '';
      currentRotation = (target)%360;
      showWinner(data.winner);
      container.removeEventListener('transitionend', done);
    });
  }catch(e){alert('Error al girar: '+e.message)}
});

function showWinner(name){
  resultEl.innerHTML = `<div class="winner">Ganador: ${escapeHtml(name)}</div>`;
  // small confetti: emojis
  for(let i=0;i<12;i++){
    const el = document.createElement('div');
    el.textContent = ['🎉','✨','🥳','🎊'][Math.floor(Math.random()*4)];
    el.style.position='fixed';el.style.left=(40+Math.random()*40)+'%';el.style.top='30%';el.style.fontSize=(12+Math.random()*28)+'px';
    el.style.opacity='0';el.style.transition='transform 1s ease, opacity 1s ease';
    document.body.appendChild(el);
    requestAnimationFrame(()=>{ el.style.transform=`translateY(${200+Math.random()*200}px) rotate(${Math.random()*360}deg)`; el.style.opacity='1'; });
    setTimeout(()=>el.remove(),1400);
  }
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// initial demo
document.addEventListener('DOMContentLoaded', ()=>{
  const demo = 'Carlos\nMaría\nLuis\nAna\nJorge';
  document.getElementById('participants').value = demo;
  names = parseParticipants(demo);
  drawWheel(names);
});
