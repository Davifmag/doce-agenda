const $=s=>document.querySelector(s), K='doces-agenda-v1';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=v=>v?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'';
const dlong=s=>pd(s).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
const dshort=s=>pd(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});

let items=(()=>{try{const r=localStorage.getItem(K);if(r)return JSON.parse(r)}catch(e){}
return [
{id:1,kind:'orc',nome:'Camila e Rafael',tel:'',tipo:'Casamento',data:plus(6),hora:'18:00',conv:150,valor:3200,status:'Confirmado',desc:'300 doces finos, bolo de 3 andares'},
{id:2,kind:'orc',nome:'Helena (15 anos)',tel:'',tipo:'15 anos',data:plus(6),hora:'20:00',conv:80,valor:1800,status:'Novo',desc:'Mesa de doces rosa e dourado'},
{id:3,kind:'comp',nome:'Comprar insumos',tel:'',tipo:'',data:plus(3),hora:'09:00',desc:'Chocolate, leite condensado, embalagens'},
{id:4,kind:'orc',nome:'Marcos',tel:'',tipo:'Aniversário',data:plus(20),hora:'15:00',conv:40,valor:650,status:'Orçado',desc:'Cento de brigadeiros e cupcakes'}]})();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(items))}catch(e){}};

const now=new Date();
let tab='agenda',filter='Todos',sel=iso(now),vy=now.getFullYear(),vm=now.getMonth(),editing=null,kind='orc';

const busy=o=>o.kind==='comp'||o.status==='Confirmado';
const clashes=o=>o.status==='Recusado'?[]:items.filter(x=>x.id!==o.id&&x.data===o.data&&busy(x));
const byDay=d=>items.filter(x=>x.data===d).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));

function card(o){
  const c=clashes(o).length,st=o.kind==='comp'?'Compromisso':o.status;
  return `<button class="item" data-id="${o.id}"><div class="top"><div><b>${esc(o.nome)}</b>
  <div class="meta">${o.kind==='orc'?esc(o.tipo)+' · ':''}${dshort(o.data)}${o.hora?' às '+o.hora:''}${o.valor?' · '+brl(o.valor):''}</div></div>
  <span class="badge s-${st}">${st}</span></div>
  ${c?'<div class="warn">Atenção: há outro compromisso nesta data</div>':''}</button>`;
}

function render(){
  $('#t-agenda').classList.toggle('on',tab==='agenda');$('#t-pedidos').classList.toggle('on',tab==='pedidos');
  $('#app').innerHTML=tab==='agenda'?viewAgenda():viewPedidos();
}

function viewAgenda(){
  const today=iso(now);
  const nx=items.filter(o=>o.kind==='orc'&&o.status==='Confirmado'&&o.data>=today).sort((a,b)=>a.data.localeCompare(b.data))[0];
  let nxt='<div class="next"><b>Nenhum evento confirmado</b><span>Quando confirmar um pedido, ele aparece aqui.</span></div>';
  if(nx){const n=Math.round((pd(nx.data)-pd(today))/864e5);nxt=`<div class="next"><b>${esc(nx.nome)}</b><span>${esc(nx.tipo)} · ${n===0?'hoje':n===1?'amanhã':'em '+n+' dias'}</span></div>`}
  const first=new Date(vy,vm,1),last=new Date(vy,vm+1,0).getDate();
  const mname=first.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  let g=['D','S','T','Q','Q','S','S'].map(w=>`<div class="wd">${w}</div>`).join('');
  for(let i=0;i<first.getDay();i++)g+='<div></div>';
  for(let d=1;d<=last;d++){
    const k=iso(new Date(vy,vm,d)),L=byDay(k),b=L.filter(busy).length>1||(L.some(busy)&&L.some(x=>!busy(x)&&x.status!=='Recusado'));
    const dots=L.slice(0,3).map(o=>`<span class="dot ${o.kind==='comp'?'d-comp':o.status==='Confirmado'?'d-conf':'d-pend'}"></span>`).join('');
    g+=`<button class="day${k===today?' today':''}${k===sel?' sel':''}${b?' clash':''}" data-d="${k}" aria-label="${dlong(k)}">${d}<span class="dots">${dots}</span></button>`;
  }
  const L=byDay(sel);
  return `<h1>Agenda de Doces</h1><p class="sub">Seus pedidos e compromissos num só lugar</p>${nxt}
  <div class="cal"><div class="cal-h"><button class="nav" data-m="-1" aria-label="Mês anterior">‹</button><strong>${mname}</strong><button class="nav" data-m="1" aria-label="Próximo mês">›</button></div>
  <div class="grid">${g}</div>
  <div class="legend"><span><i style="background:var(--pist)"></i>Confirmado</span><span><i style="background:var(--car)"></i>Em aberto</span><span><i style="background:var(--plum)"></i>Compromisso</span><span><i style="box-shadow:0 0 0 2px var(--red)"></i>Conflito</span></div></div>
  <h2>${dlong(sel)}</h2>
  ${L.length?L.map(card).join(''):'<div class="empty">Dia livre. Toque em + para adicionar um pedido ou compromisso.</div>'}`;
}

function viewPedidos(){
  const F=['Todos','Novo','Orçado','Confirmado','Recusado'];
  const L=items.filter(o=>o.kind==='orc'&&(filter==='Todos'||o.status===filter)).sort((a,b)=>a.data.localeCompare(b.data));
  const open=items.filter(o=>o.kind==='orc'&&(o.status==='Novo'||o.status==='Orçado')).length;
  return `<h1>Pedidos</h1><p class="sub">${open?open+' aguardando resposta':'Nenhum orçamento em aberto'}</p>
  <div class="chips">${F.map(f=>`<button class="chip${f===filter?' on':''}" data-f="${f}">${f}</button>`).join('')}</div>
  ${L.length?L.map(card).join(''):'<div class="empty">Nenhum pedido nesta situação.</div>'}`;
}

/* formulário */
function setKind(k){kind=k;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  document.querySelectorAll('.orc').forEach(e=>e.classList.toggle('hide',k==='comp'));
  $('#l-nome').textContent=k==='orc'?'Cliente':'Compromisso';check()}
function draft(){return {id:editing?editing.id:-1,kind,data:$('#f-data').value,status:kind==='orc'?$('#f-status').value:'Compromisso'}}
function check(){const d=draft(),a=$('#alert');
  const c=d.data?clashes(d):[];
  if(c.length){a.innerHTML='<b>Data já ocupada:</b> '+c.map(x=>esc(x.nome)+(x.hora?' ('+x.hora+')':'')).join(', ')+'. Você ainda pode salvar.';a.classList.remove('hide')}else a.classList.add('hide')}
function openSheet(o){
  editing=o||null;$('#sh-t').textContent=o?'Editar':'Novo registro';
  setKind(o?o.kind:'orc');
  $('#f-nome').value=o?o.nome:'';$('#f-tel').value=o?o.tel||'':'';$('#f-tipo').value=o&&o.tipo?o.tipo:'Casamento';
  $('#f-data').value=o?o.data:sel;$('#f-hora').value=o?o.hora||'':'';$('#f-conv').value=o&&o.conv||'';
  $('#f-valor').value=o&&o.valor||'';$('#f-status').value=o&&o.status||'Novo';$('#f-desc').value=o?o.desc||'':'';
  $('#b-del').classList.toggle('hide',!o);check();$('#ov').classList.add('open');setTimeout(()=>$('#f-nome').focus(),50);
}
const closeSheet=()=>$('#ov').classList.remove('open');

$('#fab').onclick=()=>openSheet();
$('#b-cancel').onclick=closeSheet;
$('#ov').onclick=e=>{if(e.target.id==='ov')closeSheet()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
$('#seg').onclick=e=>{if(e.target.dataset.k)setKind(e.target.dataset.k)};
['f-data','f-status'].forEach(i=>$('#'+i).addEventListener('change',check));
$('#t-agenda').onclick=()=>{tab='agenda';render()};
$('#t-pedidos').onclick=()=>{tab='pedidos';render()};
$('#b-save').onclick=()=>{
  const nome=$('#f-nome').value.trim(),data=$('#f-data').value;
  if(!nome||!data){$('#alert').innerHTML='Preencha o nome e a data para salvar.';$('#alert').classList.remove('hide');return}
  const o={id:editing?editing.id:Date.now(),kind,nome,data,hora:$('#f-hora').value,desc:$('#f-desc').value.trim()};
  if(kind==='orc')Object.assign(o,{tel:$('#f-tel').value.trim(),tipo:$('#f-tipo').value,conv:$('#f-conv').value,valor:$('#f-valor').value,status:$('#f-status').value});
  items=editing?items.map(x=>x.id===o.id?o:x):[...items,o];
  save();sel=data;const d=pd(data);vy=d.getFullYear();vm=d.getMonth();closeSheet();render();
};
$('#b-del').onclick=()=>{if(confirm('Excluir este registro?')){items=items.filter(x=>x.id!==editing.id);save();closeSheet();render()}};
$('#app').onclick=e=>{
  const t=e.target.closest('[data-id],[data-d],[data-m],[data-f]');if(!t)return;
  if(t.dataset.id)openSheet(items.find(x=>x.id==t.dataset.id));
  else if(t.dataset.d){sel=t.dataset.d;render()}
  else if(t.dataset.m){vm+=+t.dataset.m;if(vm<0){vm=11;vy--}if(vm>11){vm=0;vy++}render()}
  else if(t.dataset.f){filter=t.dataset.f;render()}
};
render();

/* PWA: registra o service worker (funciona offline) */
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW falhou',e))})}
