const $=s=>document.querySelector(s), K='doces-agenda-v1';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const pd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=v=>v?Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'';
const dlong=s=>pd(s).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
const dshort=s=>pd(s).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
const maskTel=v=>{v=v.replace(/\D/g,'').slice(0,11);
  if(v.length>10)return v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
  if(v.length>6)return v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  if(v.length>2)return v.replace(/(\d{2})(\d{0,5})/,'($1) $2');
  return v.length?'('+v:v};
const maskData=v=>{v=v.replace(/\D/g,'').slice(0,8);
  return v.length>4?v.slice(0,2)+'/'+v.slice(2,4)+'/'+v.slice(4):v.length>2?v.slice(0,2)+'/'+v.slice(2):v};
const maskHora=v=>{v=v.replace(/\D/g,'').slice(0,4); return v.length>2?v.slice(0,2)+':'+v.slice(2):v};
const maskValor=v=>{v=v.replace(/[^\d,]/g,''); const i=v.indexOf(',');
  let int=i<0?v:v.slice(0,i),dec=i<0?null:v.slice(i+1).replace(/,/g,'').slice(0,2);
  int=int.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,'');
  return dec===null?int:int+','+dec};
const brIso=s=>{const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);if(!m)return'';
  const d=new Date(+m[3],+m[2]-1,+m[1]);
  return d.getFullYear()==m[3]&&d.getMonth()==m[2]-1&&d.getDate()==m[1]?m[3]+'-'+m[2]+'-'+m[1]:''};
const isoBr=s=>s?s.split('-').reverse().join('/'):'';
const horaOk=s=>s===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const valorNum=s=>s?parseFloat(s.replace(/\./g,'').replace(',','.'))||0:0;
const numValor=n=>n?Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'';
const pagto=o=>{
  const v=+o.valor||0,s=+o.sinal||0;
  if(!v)return null;
  const saldo=Math.max(v-s,0);
  return {saldo,venc:vencSaldo(o.data),txt:s>=v?'Quitado':s>0?'Sinal pago · falta '+brl(saldo):'Sem sinal'};
};
const EMO_SMILE='\u{1F60A}' //😊
const EMO_CUPCAKE='\u{1F9C1}' //🧁

function atualizarSaldo() {
  const v=valorNum($('#f-valor').value),s=valorNum($('#f-sinal').value),d=brIso($('#f-data').value);
  $('#saldo').textContent=v?(s>=v?'Pago por completo':'Saldo a receber: '+brl(v-s)+(d?' · até '+dshort(vencSaldo(d)):'')):'';
}

/* sinal: valor e porcentagem sincronizados */
let sinalModo='val'; // 'val' = o usuário digitou o valor; 'pct' = digitou a porcentagem
const pctNum=s=>parseFloat((s||'').replace(',','.'))||0;
const fmtPct=n=>n?String(Math.round(n*100)/100).replace('.',','):'';
const maskPct=v=>{
  v=v.replace(/[^\d,]/g,'');const i=v.indexOf(',');
  let int=i<0?v:v.slice(0,i),dec=i<0?null:v.slice(i+1).replace(/,/g,'').slice(0,2);
  int=int.replace(/^0+(?=\d)/,'').slice(0,3);
  const r=dec===null?int:int+','+dec;
  return pctNum(r)>100?'100':r;
};
function sincSinal() {
  const v=valorNum($('#f-valor').value);
  if(sinalModo==='pct'){
    const p=pctNum($('#f-pct').value);
    $('#f-sinal').value=p&&v?numValor(Math.round(v*p)/100):'';
  } else{
    const s=valorNum($('#f-sinal').value);
    $('#f-pct').value=s&&v?fmtPct(s/v*100):'';
  }
  atualizarSaldo();
};

/* ==== Modelo do orçamento: edite os textos aqui ==== */
const NEGOCIO='Leandra Doces Finos';
const PAGAMENTO='Pagamento via Pix. Chave CNPJ: 15.135.383/0001-82';
const VALIDADE_DIAS='7';
const PCT_SINAL='30' // usado quando o campo "Sinal" estiver vazio
const DIAS_SALDO='15' // o saldo vence X dias antes do evento

const vencSaldo=data=>{const d=pd(data);d.setDate(d.getDate()-DIAS_SALDO);return iso(d)};
const dataExtenso=s=>pd(s).toLocaleString('pt-BR',{weekday:'long',day:'numeric',month:'long',day:'numeric'});

function montarMensagem() {
  const nome=$('#f-nome').value.trim().split(' ')[0];
  const data=brIso($('#f-data').value),hora=$('#f-hora').value;
  const itens=lerItens(),valor=valorNum($('#f-valor').value);
  const sinal=Math.min(valorNum($('#f-sinal').value)||Math.round(valor*PCT_SINAL)/100,valor);
  const saldo=Math.max(valor-sinal,0),venc=vencSaldo(data);
  const conv=$('#f-conv').value,local=$('#f-local').value.trim(),ent=$('#f-entrega').value,det=$('#f-desc').value.trim();
  const L=['Olá'+(nome?', '+nome:'')+'! Tudo bem? '+EMO_SMILE,'','Segue o orçamento da *'+NEGOCIO+'*:','',
    '*Evento:* '+$('#f-tipo').value,'*Data:* '+dataExtenso(data)+(hora?' às '+hora:'')];
  if(conv)L.push('*Convidados:* '+conv);
  if(local||ent)L.push('*Entrega:* '+[local,ent?'a partir das '+ent:''].filter(Boolean).join(' · '));
  if(itens.length) {
    L.push('','*Itens:*');
    itens.forEach(i=>L.push('• '+(i.q?i.q+' × ':'')+i.d+(i.u&&i.q?' - '+brl(i.q*i.u):'')));
    if(det)L.push('','*Observações:* '+det);
  } else if(det){
      L.push('','*Itens:*',...det.split('\n').filter(Boolean).map(l=>'• '+1));
  }
  if(valor){
    L.push('','*Valor total:* '+brl(valor),'','*Condições de pagamento:*','• Sinal de '+brl(sinal)+' para reservar a data');
    if(saldo>0)L.push(venc>=iso(new Date())
      ?'• Saldo de '+brl(saldo)+' até '+isoBr(venc)+' ('+DIAS_SALDO+' dias antes do envento)'
      :'• Saldo de '+brl(saldo)+' a combinar');
  }
  L.push('',PAGAMENTO,'Orçamento válido por '+VALIDADE_DIAS+' dias.','Qualquer dúvida, é só chamar! '+EMO_CUPCAKE);
  return L.join('\n');
}

function numeroWpp() {
  let d=$('#f-tel').value.replace(/\D/g,'');
  if(d.length>=10&&d.lenth<=11)d='55'+d; // acrescenta o código do Brasil
  return d;
}

/* itens do pedido */
function addItem(it) {
  const dados=(it&&typeof it==='object'&&!(it instanceof Event))?it:{};
  const linha=document.createElement('div');
  linha.className='irow';
  linha.innerHTML='<input class="i-q" inputmode="numeric" placeholder="Qtd" aria-label="Quantidade"><input class="i-d" placeholder="Doce" aria-label="Descrição" autocomplete="off"><input class="i-u" inputmode="decimal" placeholder="Unit." aria-label="Valor unitário"><button type="button" class="x" aria-label="Remover item">×</button>';
  linha.querySelector('.i-q').value=dados.q||'';
  linha.querySelector('.i-d').value=dados.d||'';
  linha.querySelector('.i-u').value=dados.u?numValor(dados.u):'';
  $('#itens').appendChild(linha);
}
const lerItens=()=>[...document.querySelectorAll('#itens .irow')].map(r=>({
  q:parseInt(r.querySelector('.i-q').value)||0,
  d:r.querySelector('.i-d').value.trim(),
  u:valorNum(r.querySelector('.i-u').value)
})).filter(i=>i.d||i.q);
function recalc(){
  const total=Math.round(lerItens().reduce((t,i)=>t+i.q*i.u,0)*100)/100,v=$('#f-valor');
  v.readOnly=total>0;
  if(total>0)v.value=numValor(total);
  sincSinal();
}
const hAg=o=>o.entrega||o.hora; // horário que vale para a agenda

let items=(()=>{try{const r=localStorage.getItem(K);if(r)return JSON.parse(r)}catch(e){}
return []})();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(items))}catch(e){}};

/* ===== Supabase ===== */
const SUPABASE_URL='https://otakntkggjeunpzxwoly.supabase.co';
const SUPABASE_KEY='sb_publishable_fDlT-_ymboO_TsmEzbtoiw_nF7gEC74';
let sb=null;
try{sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY)}catch(e){console.warn('Supabase indisponível',e)}

const toRow=o=>({kind:o.kind,nome:o.nome,tel:o.tel||null,tipo:o.tipo||null,data:o.data,hora:o.hora||'',entrega:o.entrega||'',conv:parseInt(o.conv)||null,valor:+o.valor||0,sinal:+o.sinal||0,sinal_pct:o.sinalPct||null,status:o.kind==='comp'?null:(o.status||null),local_entrega:o.local||'',descr:o.desc||'',itens:o.itens||[]});
const fromRow=r=>({id:r.id,kind:r.kind,nome:r.nome,tel:r.tel||'',tipo:r.tipo||'',data:r.data,hora:r.hora||'',entrega:r.entrega||'',conv:r.conv||'',valor:+r.valor||0,sinal:+r.sinal||0,sinalPct:r.sinal_pct==null?null:+r.sinal_pct,status:r.status||'',local:r.local_entrega||'',desc:r.descr||'',itens:r.itens||[]});

async function salvarNuvem(o) {
  const row=toRow(o);
  const q=o.id?sb.from('registros').update(row).eq('id',o.id):sb.from('registros').insert(row);
  const {data,error}=await q.select().single();
  if(error)throw error;
  return fromRow(data);
}

async function carregar() {
  const {data,error}=await sb.from('registros').select('*').order('data');
  if(error)throw error;
  items=data.map(fromRow);
  save();
  render();
}

function mostrarLogin(msg) {
  $('#login').classList.add('open');
  const a=$('#l-erro');
  if(msg){
    a.textContent=msg;a.classList.remove('hide')
  } else a.classList.add('hide');
}

async function iniciar() {
  if(!sb) {mostrarLogin('Sem conexão com o serviço. Abra o app com internet.');return}
  const {data:{session}}=await sb.auth.getSession();
  if(!session){mostrarLogin();return}
  $('#login').classList.remove('open');
  try{await carregar()}catch(e){console.warn('Sem conexão; mostrando os últimos dados salvos.',e)}
}

const now=new Date();
let tab='agenda',filter='Todos',sel=iso(now),vy=now.getFullYear(),vm=now.getMonth(),editing=null,kind='orc';

const busy=o=>o.kind==='comp'||o.status==='Confirmado';
const MARGEM_MIN=180; // distância mínima entre eventos, em minutos
const toMin=h=>/^\d{2}:\d{2}$/.test(h||'')?+h.slice(0,2)*60+ +h.slice(3):null;
const sobrepoe=(a,b)=>{
  const x=toMin(hAg(a)),y=toMin(hAg(b));
  if(x===null||y===null)return true; //sem horário: considera o dia inteiro
  return Math.abs(x-y)<MARGEM_MIN;
};
const clashes=o=>o.status==='Recusado'?[]:items.filter(x=>x.id!==o.id&&x.data===o.data&&busy(x)&&sobrepoe(o,x));
const byDay=d=>items.filter(x=>x.data===d).sort((a,b)=>(a.hora||'').localeCompare(b.hora||''));

function card(o){
  const p=o.kind==='orc'&&o.status!=='Recusado'?pagto(o):null;
  const c=clashes(o).length,st=o.kind==='comp'?'Compromisso':o.status;
  return `<button class="item" data-id="${o.id}"><div class="top"><div><b>${esc(o.nome)}</b>
  <div class="meta">${o.kind==='orc'?esc(o.tipo)+' · ':''}${dshort(o.data)}${o.hora?' às '+o.hora:''}${o.valor?' · '+brl(o.valor):''}</div></div>
  <span class="badge s-${st}">${st}</span></div>
  ${p?'<div class="meta">'+p.txt+(o.status==='Confirmado'&&p.saldo>0?' · saldo até '+dshort(p.venc):'')+'</div>':''}
  ${o.status==='Confirmado'&&p&&p.saldo>0&&p.venc<iso(now)?'<div class="warn">Saldo a cobrar: o prazo já chegou</div>':''}
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
    const k=iso(new Date(vy,vm,d)),L=byDay(k),b=L.some(o=>clashes(o).length>0);
    const dots=L.slice(0,3).map(o=>`<span class="dot ${o.kind==='comp'?'d-comp':o.status==='Confirmado'?'d-conf':'d-pend'}"></span>`).join('');
    g+=`<button class="day${k===today?' today':''}${k===sel?' sel':''}${b?' clash':''}" data-d="${k}" aria-label="${dlong(k)}">${d}<span class="dots">${dots}</span></button>`;
  }
  const L=byDay(sel);
  const lim=plus(7);
  const cobrar=items.filter(o=>o.kind==='orc'&&o.status==='Confirmado'&&o.data>=today&&pagto(o)&&pagto(o).saldo>0&&pagto(o).venc<=lim).sort((a,b)=>a.data.localeCompare(b.data));
  const cob=cobrar.length?`<div class="item" style="cursor:default"><b>Saldos para cobrar</b>${cobrar.map(o=>`<div class="meta">${esc(o.nome)} · ${brl(pagto(o).saldo)} · até ${dshort(pagto(o).venc)}</div>`).join('')}</div>`:'';
  return `<h1>Agenda de Doces</h1><p class="sub">Seus pedidos e compromissos num só lugar</p>${nxt}${cob}
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
  const areceber=items.filter(o=>o.kind==='orc'&&o.status==='Confirmado').reduce((t,o)=>t+(pagto(o)?pagto(o).saldo:0),0);
  return `<h1>Pedidos</h1><p class="sub">${open?open+' aguardando resposta':'Nenhum orçamento em aberto'}${areceber?' · A receber: '+brl(areceber):''}</p>
  <div class="chips">${F.map(f=>`<button class="chip${f===filter?' on':''}" data-f="${f}">${f}</button>`).join('')}</div>
  ${L.length?L.map(card).join(''):'<div class="empty">Nenhum pedido nesta situação.</div>'}
  <h2>Backup</h2>
  <p class="sub">Salve uma cópia dos seus dados ou restaure de um arquivo.</p>
  <div class="acts"><button class="btn" id="b-exp">Exportar</button><button class="btn" id="b-imp">Importar</button><button class="btn" id="b-sair">Sair da conta</button></div>`;
}

/* ==== Relatório ==== */
let ry=now.getFullYear(),rm=now.getMonth();
const R=v=>brl(v)||'R$ 0,00'
const soma=(L,f)=>L.reduce((t,o)=>t+f(o),0);

function viewRelatorio(){
  const mk=ry+'-'+String(rm+1).padStart(2,'0');
  const mname=new Date(ry,rm,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const orc=items.filter(o=>o.kind==='orc');
  const doMes=orc.filter(o=>o.data.slice(0,7)===mk);
  const conf=doMes.filter(o=>o.status==='Confirmado');
  const fat=soma(conf,o=>+o.valor||0);
  const rec=soma(conf,o=>Math.min(+o.sinal||0,+o.valor||0));
  const aberto=doMes.filter(o=>o.status==='Novo'||o.status==='Orçado');
  const porTipo={};
  conf.forEach(o=>{const t=o.tipo||'Outro';porTipo[t]=porTipo[t]||{n:0,v:0};porTipo[t].n++;porTipo[t].v+=+o.valor||0});
  const tipos=Object.entries(porTipo).sort((a,b)=>b[1].v-a[1].v);
  const receber=orc.filter(o=>o.status==='Confirmado'&&pagto(o)&&pagto(o).saldo>0).sort((a,b)=>a.data.localeCompare(b.data));
  const hoje=iso(now);

  const linhaReceber=o=>{
    const pg=pagto(o),atras=pg.venc<hoje;
    return `<div class="rline"><div><b>${esc(o.nome)}</b>
      <div class="meta">Evento ${dshort(o.data)} · saldo até ${dshort(pg.venc)}${atras?' · <span style="color:var(--red);font-weight:700">prazo chegou</span>':''}</div></div>
      <div style="text-align:right"><b>${R(pg.saldo)}</b><br><button class="btn small" style="margin-top:4px" data-rec="${o.id}">Recebido</button></div></div>`;
  };

  return `<h1>Relatório</h1>
<p class="sub">Por data do evento, só pedidos confirmados</p>
<div class="cal-h" style="margin-bottom: 10px;">
  <button class="nav" data-rm="-1" aria-label="Mês anterior">‹</button>
  <strong style="font: 600 18px Fraunces, Georgia, serif;text-transform: capitalize;">${mname}</strong>
  <button class="nav" data-rm="1" aria-label="Próximo mês">›</button>
</div>
<div class="kpis">
  <div class="kpi"><span>Faturamento</span><b>${R(fat)}</b></div>
  <div class="kpi"><span>Eventos confirmados</span><b>${conf.length}</b></div>
  <div class="kpi"><span>Já recebido</span><b>${R(rec)}</b></div>
  <div class="kpi"><span>Falta receber</span><b>${R(fat-rec)}</b></div>
  <div class="kpi"><span>Ticket médio</span><b>${R(conf.length?fat/conf.length:0)}</b></div>
  <div class="kpi"><span>Orçamentos em aberto ${aberto.length}</span><b>${R(soma(aberto,o=>+o.valor||0))}</b></div>
</div>
${tipos.length?`<h2>Por tipo de evento</h2><div class="item" style="cursor: default;">${tipos.map(([t,d])=>`<div class="rline"><span>${esc(t)} <span class="meta">· ${d.n}</span></span><b>${R(d.v)}</b></div>`).join('')}</div>`:''}`
}

function exportar(){
  const dados={app:'agenda-de-doces',versao:1,exportadoEm:new Date().toISOString(),itens:items};
  const blob=new Blob([JSON.stringify(dados,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='doces-backup-'+iso(new Date())+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function importar(file){
  const r=new FileReader();
  r.onload=async()=>{
    try{
      const d=JSON.parse(r.result);
      if(d.app!=='agenda-de-doces'||!Array.isArray(d.itens))throw new Error('formato');
      const chave=o=>[o.kind,o.nome,o.data,o.hora||'',+o.valor||0].join('|');
      const existentes=new Set(items.map(chave));
      const novos=d.itens.filter(o=>o&&o.nome&&/^\d{4}-\d{2}-\d{2}$/.test(o.data)&&!existentes.has(chave(o)));
      if(novos.length){
        const {error}=await sb.from('registros').insert(novos.map(toRow));
        if(error)throw error;
        await carregar();
      }
      alert(novos.length+' registros importados'+(d.itens.length>novos.length?' ('+(d.itens.length-novos.length)+' já existiam ou eram inválidos).':'.'));
    }catch(e){alert('Não foi possível importar: '+(e.message==='formato'?'arquivo inválido.':e.message))}
  };
  r.readAsText(file);
}

/* formulário */
function setKind(k){kind=k;document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  document.querySelectorAll('.orc').forEach(e=>e.classList.toggle('hide',k==='comp'));
  $('#l-nome').textContent=k==='orc'?'Cliente':'Compromisso';check()}

function draft(){return {id:editing?editing.id:-1,kind,data:brIso($('#f-data').value),hora:$('#f-hora').value,entrega:kind==='orc'?$('#f-entrega').value:'',status:kind==='orc'?$('#f-status').value:'Compromisso'}
}

function check(){const d=draft(),a=$('#alert');
  const c=d.data?clashes(d):[];
  if(c.length){a.innerHTML='<b>Data já ocupada:</b> '+c.map(x=>esc(x.nome)+(x.hora?' ('+x.hora+')':'')).join(', ')+'. Você ainda pode salvar.';a.classList.remove('hide')}else a.classList.add('hide')
}

function openSheet(o){
  editing=o||null;$('#sh-t').textContent=o?'Editar':'Novo registro';
  setKind(o?o.kind:'orc');
  $('#f-nome').value=o?o.nome:'';$('#f-tel').value=maskTel(o?o.tel||'':'');$('#f-tipo').value=o&&o.tipo?o.tipo:'Casamento';
  $('#f-data').value=isoBr(o?o.data:sel);$('#f-hora').value=o?o.hora||'':'';$('#f-conv').value=o&&o.conv||'';
  $('#f-valor').value=o&&o.valor?numValor(o.valor):'';$('#f-status').value=o&&o.status||'Novo';$('#f-desc').value=o?o.desc||'':'';
  $('#b-del').classList.toggle('hide',!o);$('#itens').innerHTML='';(o&&o.itens||[]).forEach(addItem);recalc();
  $('#f-local').value=o?o.local||'':'';$('#f-entrega').value=o?o.entrega||'':'';sinalModo=o&&o.sinalPct?'pct':'val';
  $('#f-sinal').value=o&&o.sinal?numValor(o.sinal):'';
  $('#f-pct').value=o&&o.sinalPct?fmtPct(o.sinalPct):'';
  sincSinal();check();$('#ov').classList.add('open');setTimeout(()=>$('#f-nome').focus(),50);
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
$('#b-save').onclick=async()=>{
  const al=$('#alert'),btn=$('#b-save');
  al.classList.add('hide');
  try{
    const nome=$('#f-nome').value.trim(),data=brIso($('#f-data').value),hora=$('#f-hora').value,ent=$('#f-entrega').value;
    const faltam=[];
    if(!nome)faltam.push('o nome');
    if(!data)faltam.push('a data (dd/mm/aaaa)');
    if(!horaOk(hora))faltam.push('o horário do evento (hh:mm)');
    if(kind==='orc'&&!horaOk(ent))faltam.push('o horário de entrega (hh:mm)');
    if(faltam.length){al.textContent='Confira '+faltam.join(', ')+'.';al.classList.remove('hide');return}
    const o={id:editing?editing.id:null,kind,nome,data,hora,desc:$('#f-desc').value.trim()};
    if(kind==='orc')Object.assign(o,{tel:$('#f-tel').value.trim(),tipo:$('#f-tipo').value,conv:$('#f-conv').value,
      valor:valorNum($('#f-valor').value),sinal:valorNum($('#f-sinal').value),
      sinalPct:sinalModo==='pct'?pctNum($('#f-pct').value):null,status:$('#f-status').value,
      itens:lerItens(),local:$('#f-local').value.trim(),entrega:ent});
    btn.disabled=true;
    const salvo=await salvarNuvem(o);
    items=editing?items.map(x=>x.id===salvo.id?salvo:x):[...items,salvo];
    save();sel=data;const d=pd(data);vy=d.getFullYear();vm=d.getMonth();closeSheet();render();
  }catch(e){
    console.error(e);
    al.textContent='Erro ao salvar: '+(e.message||e);al.classList.remove('hide');
  }finally{btn.disabled=false}
};
$('#b-del').onclick=async()=>{
  if(!confirm('Excluir este registro?'))return;
  const {error}=await sb.from('registros').delete().eq('id',editing.id);
  if(error){alert('Não foi possível excluir: '+error.message);return}
  items=items.filter(x=>x.id!==editing.id);save();closeSheet();render();
};
$('#app').onclick=e=>{
  const t=e.target.closest('[data-id],[data-d],[data-m],[data-f]');if(!t)return;
  if(t.dataset.id)openSheet(items.find(x=>x.id==t.dataset.id));
  else if(t.dataset.d){sel=t.dataset.d;render()}
  else if(t.dataset.m){vm+=+t.dataset.m;if(vm<0){vm=11;vy--}if(vm>11){vm=0;vy++}render()}
  else if(t.dataset.f){filter=t.dataset.f;render()}
};

document.addEventListener('click',e=>{
  if(e.target.closest('#b-exp'))exportar();
  if(e.target.closest('#b-imp'))$('#f-imp').click();
});
$('#f-imp').addEventListener('change',e=>{
  if(e.target.files[0])importar(e.target.files[0]);
  e.target.value='';
});

$('#f-tel').addEventListener('input',e=>{e.target.value=maskTel(e.target.value)});
$('#f-data').addEventListener('input',e=>{e.target.value=maskData(e.target.value);check()});
$('#f-hora').addEventListener('input',e=>{e.target.value=maskHora(e.target.value);check()});
$('#f-valor').addEventListener('input',e=>{e.target.value=maskValor(e.target.value);sincSinal()});
$('#f-sinal').addEventListener('input',e=>{e.target.value=maskValor(e.target.value);sinalModo='val';sincSinal()});
$('#f-pct').addEventListener('input',e=>{e.target.value=maskPct(e.target.value);sinalModo='pct';sincSinal()});
$('#b-quit').onclick=()=>{const v=valorNum($('#f-valor').value); if(v){$('#f-sinal').value=numValor(v);sinalModo='val';sincSinal()}};
/*$('#f-valor').addEventListener('input',e=>{e.target.value=maskValor(e.target.value);atualizarSaldo()});
$('#f-sinal').addEventListener('input',e=>{e.target.value=maskValor(e.target.value);atualizarSaldo()});
$('#b-50').onclick=()=>{const v=valorNum($('#f-valor').value); if(v){$('#f-sinal').value=numValor(v/2);atualizarSaldo()}};
$('#b-quit').onclick=()=>{const v=valorNum($('#f-valor').value); if(v){$('#f-sinal').value=numValor(v);atualizarSaldo()}};*/
$('#b-additem').onclick=()=>{addItem();const q=document.querySelectorAll('#itens .i-q');q[q.length-1].focus()};
$('#itens').addEventListener('input',e=>{
  if(e.target.classList.contains('i-q'))e.target.value=e.target.value.replace(/\D/g,'').slice(0,5);
  if(e.target.classList.contains('i-u'))e.target.value=maskValor(e.target.value);
  recalc();
});
$('#itens').addEventListener('click',e=>{if(e.target.closest('.x')){e.target.closest('.irow').remove();recalc()}});
$('#f-entrega').addEventListener('input',e=>{e.target.value=maskHora(e.target.value);check()});
$('#b-wpp').onclick=()=>{
  if(!$('#f-nome').value.trim()||!brIso($('#f-data').value)){alert('Preencha ao menos o nome e a data');return}
  if($('#f-status').value==='Novo')$('#f-status').value='Orçado';
  window.open('https://wa.me/'+numeroWpp()+'?text='+encodeURIComponent(montarMensagem()),'_blank');
};
$('#l-entrar').onclick=async()=>{
  if(!sb)return;
  const {error}=await sb.auth.signInWithPassword({email:$('#l-email').value.trim(),password:$('#l-senha').value});
  if(error){mostrarLogin('e-Mail ou senha incorretos.');return}
  $('#l-senha').value='';$('#login').classList.remove('open');
  try{await carregar()}catch(e){alert('Não foi possível carregar os dados: '+(e.message||e))}
};
$('#l-senha').addEventListener('keydown',e=>{if(e.key==='Enter')$('#l-entrar').click()});
document.addEventListener('click',async e=>{
  if(!e.target.closest('#b-sair'))return;
  if(sb)await sb.auth.signOut();
  items=[];try{localStorage.removeItem(K)}catch(_){}
  render();mostrarLogin();
});
render();iniciar();

/* PWA: registra o service worker (funciona offline) */
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW falhou',e))})}
