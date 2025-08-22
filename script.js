// ---------- BASIC DECK NAV ----------
const deck = document.getElementById('deck');
const slides = Array.from(deck.querySelectorAll('.slide'));
const btnPrev = document.querySelector('[data-action="prev"]');
const btnNext = document.querySelector('[data-action="next"]');
const progressFill = document.getElementById('progress-fill');
const thumbs = document.getElementById('thumbs');

let i = 0;
function go(n){
  i = Math.max(0, Math.min(slides.length-1, n));
  slides.forEach((s,idx)=>{
    s.style.display = (idx===i)?'flex':'none';
  });
  deck.dataset.index = i;
  const pct = ((i+1)/slides.length)*100;
  progressFill.style.width = pct+'%';
  updateThumbs();
  location.hash = '#s'+(i+1);
  triggerTypingIfAny();
}
function next(){ go(i+1) }
function prev(){ go(i-1) }

btnPrev.addEventListener('click', prev);
btnNext.addEventListener('click', next);

document.addEventListener('keydown', (e)=>{
  if (e.key==='ArrowRight' || e.key==='PageDown' || e.key===' ') next();
  if (e.key==='ArrowLeft' || e.key==='PageUp') prev();
});

// hash nav
if (location.hash && /^#s\d+/.test(location.hash)){
  const idx = parseInt(location.hash.replace('#s',''),10)-1;
  go(idx);
}else{
  go(0);
}

// thumbnails
function buildThumbs(){
  slides.forEach((s,idx)=>{
    const b = document.createElement('button');
    b.title = s.dataset.title || ('Slide '+(idx+1));
    b.addEventListener('click', ()=>go(idx));
    thumbs.appendChild(b);
  });
}
function updateThumbs(){
  thumbs.querySelectorAll('button').forEach((b,idx)=>{
    b.setAttribute('aria-current', idx===i ? 'true' : 'false');
  });
}
buildThumbs(); updateThumbs();

// ---------- DEMO PROMPTS (typewriter) ----------
const demoPrompts = [
`AICO — ATA de Design Review (template TC-DR-001)
Projeto: Linha de Montagem Final
Inclua: participantes, decisões, ações (responsável/prazo), riscos e próximos passos.
Use linguagem formal e numeração de seções.`,
`Gemini — Consolidar "Open Issues" a partir de e-mails/ata
Entregue tabela: ID • Descrição • Responsável • Prioridade • Prazo • Status
Destaque 3 itens críticos e sugira plano de ação resumido.`,
`Gmail com Gemini — E-mail técnico de cobrança
Assunto: Atualização do Item #102 (Alta prioridade)
Mensagem: resumo do bloqueio, responsável, prazo e próximos passos. Tom profissional.`,
`Sheets com Gemini — Dashboard de projeto
Crie: tabela de tarefas, % concluído, fórmulas condicionais, gráfico de burndown, sem macros.`
];
let demoIndex = 0;
const demoEl = document.getElementById('demoPrompt');
const btnType = document.getElementById('btnType');
const btnSwap = document.getElementById('btnSwap');

function typeText(el, text, speed=18){
  el.textContent = '';
  let j = 0;
  function step(){
    if (j < text.length){
      el.textContent += text[j++];
      setTimeout(step, speed);
    }
  }
  step();
}
function triggerTypingIfAny(){
  // called when slide changes
  const s = slides[i];
  if (s && s.querySelector('#demoPrompt')){
    demoEl.textContent = '';
  }
}
btnType?.addEventListener('click', ()=> typeText(demoEl, demoPrompts[demoIndex]));
btnSwap?.addEventListener('click', ()=>{
  demoIndex = (demoIndex+1) % demoPrompts.length;
  demoEl.textContent = '…';
});

// expand "Ver prompt"
document.querySelectorAll('.btn.demo').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const target = document.querySelector(btn.dataset.demo);
    if (target){
      target.classList.toggle('hidden');
    }
  });
});

// Ensure only active slide is visible initially (CSS fallback)
slides.forEach((s,idx)=>{ s.style.display = (idx===0)?'flex':'none'; });
