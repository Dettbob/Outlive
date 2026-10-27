/* =====================================================================
   OUTLIVE — digital prototype: user interface (v0.2)
   ===================================================================== */
(function(){
const VERSION='v0.3.0';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V={view:0,pm:null,pa:null,pl:null,night:null,recN:0,busy:false,logs:[],modalOpen:false,
  speed:2.2,anim:true,follow:true,gen:0,paused:false,resume:[],turn:null,cap:'',curHero:null,
  flash:{},shake:{},live:false,cfg:null,tut:false,coached:{},prev:{},pops:{},pctx:'pause'};
try{const s=JSON.parse(localStorage.getItem('outlive.settings')||'null');if(s){if(typeof s.speed==='number')V.speed=s.speed;if(typeof s.anim==='boolean')V.anim=s.anim;if(typeof s.follow==='boolean')V.follow=s.follow}}catch(e){}
const saveSet=()=>{try{localStorage.setItem('outlive.settings',JSON.stringify({speed:V.speed,anim:V.anim,follow:V.follow}))}catch(e){}};
const sfx=n=>{try{Sound.sfx(n)}catch(e){}};
const NEVER=new Promise(()=>{});

/* ---------- custom artwork: stays on this device (IndexedDB), never uploaded ---------- */
const ART={map:null,mapRatio:null,leaders:{},names:{}};
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('outlive-art',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function kvGet(k){try{const d=await idb();return await new Promise(r=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}catch(e){return null}}
async function kvSet(k,v){try{const d=await idb();await new Promise(r=>{const t=d.transaction('kv','readwrite');v==null?t.objectStore('kv').delete(k):t.objectStore('kv').put(v,k);t.oncomplete=()=>r();t.onerror=()=>r()})}catch(e){}}
function pickFile(){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>res(i.files&&i.files[0]||null);i.oncancel=()=>res(null);i.click()})}
async function shrink(file,max){
  const bm=await createImageBitmap(file);const k=Math.min(1,max/Math.max(bm.width,bm.height));
  const c=document.createElement('canvas');c.width=Math.round(bm.width*k);c.height=Math.round(bm.height*k);
  c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
  return {blob:await new Promise(r=>c.toBlob(r,'image/jpeg',.88)),w:c.width,h:c.height};
}
async function loadArt(){
  const m=await kvGet('map');
  if(m&&m.blob){ART.map=URL.createObjectURL(m.blob);ART.mapRatio=m.w/m.h}
  for(const l of LEADERS){
    const b=await kvGet('leader:'+l.id);if(b)ART.leaders[l.id]=URL.createObjectURL(b);
    const n=await kvGet('name:'+l.id);if(n){ART.names[l.id]=n;l.n=n}
  }
}
async function setMap(file){
  const r=await shrink(file,1800);await kvSet('map',{blob:r.blob,w:r.w,h:r.h});
  if(ART.map)URL.revokeObjectURL(ART.map);ART.map=URL.createObjectURL(r.blob);ART.mapRatio=r.w/r.h;
}
async function clearMap(){await kvSet('map',null);if(ART.map)URL.revokeObjectURL(ART.map);ART.map=null;ART.mapRatio=null}
async function setLeaderImg(id,file){
  const r=await shrink(file,360);await kvSet('leader:'+id,r.blob);
  if(ART.leaders[id])URL.revokeObjectURL(ART.leaders[id]);ART.leaders[id]=URL.createObjectURL(r.blob);
}
async function clearLeaderImg(id){await kvSet('leader:'+id,null);if(ART.leaders[id])URL.revokeObjectURL(ART.leaders[id]);delete ART.leaders[id]}
const portrait=(id,cls)=>ART.leaders[id]?`<img class="${cls||'por'}" src="${ART.leaders[id]}" alt="">`:'';

/* ---------- timing (pause + abort aware) ---------- */
function wait(ms){
  const g=V.gen;
  return new Promise(res=>{
    setTimeout(async()=>{
      while(V.paused&&g===V.gen)await new Promise(r=>V.resume.push(r));
      if(g!==V.gen)return;           // game was abandoned: the old game never continues
      res();
    },Math.max(0,ms));
  });
}
const scale=()=>V.speed/2.2;

/* ---------- icons ---------- */
const ICON={
  pause:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  music:'<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><line class="x" x1="3" y1="3" x2="21" y2="21"/></svg>',
  sfx:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><line class="x" x1="3" y1="3" x2="21" y2="21"/></svg>'
};
function renderCluster(){
  const st=Sound.state;
  $('#cluster').innerHTML=`<button class="ibtn ${st.music?'':'off'}" data-a="tmusic" title="Music on/off" aria-label="Music">${ICON.music}</button><button class="ibtn ${st.sfx?'':'off'}" data-a="tsfx" title="Sound effects on/off" aria-label="Sound effects">${ICON.sfx}</button>${V.live?`<button class="ibtn" data-a="pause" title="Pause menu (Esc)" aria-label="Pause menu">${ICON.pause}</button>`:''}`;
  $('#cluster').classList.add('on');
}

/* ---------- modal system ---------- */
function openModal(build,opts){
  opts=opts||{};
  return new Promise(resolve=>{
    const root=$('#modal');
    root.innerHTML='';
    const box=document.createElement('div');box.className='mbox'+(opts.wide?' wide':'');
    root.appendChild(box);root.classList.add('on');V.modalOpen=true;sfx('open');
    const done=v=>{root.classList.remove('on');root.innerHTML='';V.modalOpen=false;renderTurn();resolve(v)};
    V._closeModal=()=>{root.classList.remove('on');root.innerHTML='';V.modalOpen=false};
    build(box,done);
    box.scrollTop=0;renderTurn();
  });
}
function btn(label,cls,fn,sub){
  const b=document.createElement('button');b.className='btn '+(cls||'');
  b.innerHTML=`<span class="bl">${label}</span>`+(sub?`<span class="bs">${sub}</span>`:'');
  b.onclick=fn;return b;
}
function head(box,title,text){
  const h=document.createElement('h2');h.innerHTML=title;box.appendChild(h);
  if(text){const p=document.createElement('p');p.className='mtext';p.innerHTML=text;box.appendChild(p)}
}
function infoModal(title,html){return openModal((box,done)=>{head(box,title);const d=document.createElement('div');d.className='mtext';d.innerHTML=html;box.appendChild(d);box.appendChild(btn('Close','pri',()=>done()))})}

/* ---------- coach (tutorial hints) ---------- */
function coach(key,title,html){
  if(!V.tut||V.coached[key])return;
  V.coached[key]=1;
  const el=$('#coach');
  el.innerHTML=`<div class="ct">Tutorial · ${esc(title)}</div><div class="cb">${html}</div><div class="cr"><button data-a="coachx">Got it</button></div>`;
  el.classList.add('on');sfx('select');
}
const hideCoach=()=>$('#coach').classList.remove('on');

/* ---------- small html helpers ---------- */
const resChip=(r,n,chg)=>`<span class="rc ${chg?'chg':''}" title="${RN[r]}">${RI[r]}<b>${n}</b></span>`;
const costHtml=c=>Object.entries(c).filter(([,v])=>v>0).map(([r,v])=>`<span class="cc">${v}${RI[r]}</span>`).join(' ')||'<span class="cc">free</span>';
function eqChip(id,state){
  const e=EQ[id];
  return `<button class="eq ${state||''}" data-a="infoeq" data-id="${id}" title="${esc(e.t)}"><span class="sym" style="color:${SYM_COL[e.sym]}">${SYMS[e.sym]}</span>${esc(e.n)}</button>`;
}
function heroTok(p,hi){
  const h=p.heroes[hi];
  const cls=['hero',h.state==='act'?'act':'idle'];
  if(V.pm&&V.pm.p===p&&h.state==='idle'&&V.pm.opts.some(o=>o.hi===hi))cls.push('pick');
  if(V.pm&&V.pm.p===p&&V.pm.sel===hi)cls.push('sel');
  if(h.state==='act'&&V.pa&&V.pa.h===h)cls.push('turn');
  if(V.curHero===h)cls.push('turn');
  return `<button class="${cls.join(' ')}" style="--c:${p.color.hex}" data-a="hero" data-p="${p.id}" data-hi="${hi}" title="${esc(p.name)} · Strength ${h.str} · ${h.state==='act'?'activated':'idle'}">${h.str}</button>`;
}

/* ---------- original board art (simple silhouettes, not the official illustration) ---------- */
function art(k){
  const tr=(x,y,s)=>`<path d="M${x} ${y-14*s}l${6*s} ${14*s}h${-12*s}z M${x} ${y-8*s}l${8*s} ${10*s}h${-16*s}z"/>`;
  const bld=(x,w,h)=>`<rect x="${x}" y="${60-h}" width="${w}" height="${h}"/>`;
  let g='';
  switch(k){
    case'forest':g=[8,22,36,50,64,80,92].map((x,i)=>tr(x,58,1+(i%3)*.25)).join('');break;
    case'dam':g='<path d="M0 22h100v8H0z"/><path d="M4 30h92v26H4z" opacity=".7"/><path d="M40 8h20v14H40z"/><path d="M0 50q25-6 50 0t50 0v10H0z" opacity=".5"/>';break;
    case'mb':g='<path d="M4 58a12 14 0 0 1 24 0zM34 58a12 14 0 0 1 24 0zM64 58a12 14 0 0 1 24 0z"/><rect x="90" y="18" width="4" height="40"/><path d="M86 18h12l-6-8z"/>';break;
    case'city':g=bld(6,12,34)+bld(20,10,48)+bld(32,14,28)+bld(48,10,52)+bld(60,14,36)+bld(76,10,44)+bld(88,9,26);break;
    case'fair':g='<circle cx="68" cy="34" r="22" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="68" cy="34" r="3"/><path d="M68 12v44M46 34h44M52 18l32 32M84 18L52 50" stroke="currentColor" stroke-width="1" fill="none"/><path d="M4 56q10-34 24-8t24 8" fill="none" stroke="currentColor" stroke-width="2"/>';break;
    case'cargo':g='<path d="M4 44h92l-10 14H16z"/><rect x="20" y="30" width="12" height="14"/><rect x="34" y="26" width="12" height="18"/><rect x="48" y="32" width="12" height="12"/><rect x="62" y="28" width="12" height="16"/><rect x="76" y="34" width="10" height="10"/>';break;
    case'mine':g='<ellipse cx="55" cy="56" rx="48" ry="9"/><ellipse cx="55" cy="46" rx="36" ry="8" opacity=".8"/><ellipse cx="55" cy="37" rx="24" ry="6" opacity=".6"/><ellipse cx="55" cy="29" rx="12" ry="4" opacity=".5"/>';break;
  }
  return `<svg class="art" viewBox="0 0 100 60" preserveAspectRatio="xMidYMax slice" fill="currentColor" aria-hidden="true">${g}</svg>`;
}
const ART_OF={forest:'forest',dam:'dam',mb:'mb',bc:'city',sp:'city',fair:'fair',cargo:'cargo',mine:'mine'};

/* ---------- rendering ---------- */
function renderTop(){
  if(!G)return;
  const pips=[];
  for(let d=1;d<=6;d++){
    const rev=d<=G.day&&G.events[d-1]&&(d<G.day||G.phase!=='dawn');
    const ev=rev?EVENTS[G.events[d-1]].n:'?';
    const cls=d===G.day?'cur':(d<G.day?'past':'');
    const taken=rev&&!G.active.includes(G.events[d-1]);
    pips.push(`<div class="pip ${cls} ${taken?'solved':''}"><span class="pd">DAY ${d}</span><span class="pe">${esc(ev)}</span><span class="pr">☢${RAD_DAY[d-1]}</span></div>`);
  }
  const first=G.players[G.first];
  const phase=G.phase==='setup'?'Setup':G.phase==='over'?'Game over':({dawn:'Dawn',day:'Day',night:'Night'}[G.phase]||'');
  $('#top').innerHTML=`<div class="brand">OUTLIVE<small>digital prototype</small></div>
    <div class="convoy">${pips.join('')}</div>
    <div class="tinfo"><div><span class="pill ${G.phase}">${phase}</span></div>
    <div class="first" title="First Player token"><span class="dot" style="background:${first.color.hex}"></span>${esc(first.name)} first</div></div>`;
  const act=G.active.map(id=>`<button class="evc" data-a="infoev" data-id="${id}" title="${esc(EVENTS[id].t)}"><b>${esc(EVENTS[id].n)}</b><span>${costHtml(EVENTS[id].cost)} · +${EVENTS[id].sp} SP</span></button>`).join('');
  $('#events').innerHTML=act?`<span class="elabel">Active events</span>${act}`:`<span class="elabel dim">No active events</span>`;
}
function renderTurn(){
  const el=$('#turnbar');if(!el)return;
  if(!G||!G.players.length){el.innerHTML='';return}
  let cur=null,mode='idle',sub='';
  if(V.pm){cur=V.pm.p;mode='you';sub=V.pm.sel==null?'Tap one of your glowing Heroes, then a highlighted Location.':'Now tap a highlighted Location to move there.'}
  else if(V.pa){cur=V.pa.p;mode='you';sub=`Hero (Strength ${V.pa.h.str}) at ${LOCS[V.pa.h.loc].n} · ${V.pa.h.ap} AP left — choose an action.`}
  else if(V.pl){cur=V.pl.p;mode='you';sub=V.pl.prompt}
  else if(V.night){cur=V.night.p;mode='you';sub='Manage your Shelter: recruit, fill Rooms, build, repair — then press End turn.'}
  else if(V.turn){cur=V.turn.p;mode=cur.human?(V.modalOpen?'you':'wait'):'ai';if(mode==='you')sub='Make your choice.'}
  const phase=G.phase==='over'?'Game over':({dawn:'Dawn',day:'Day phase',night:'Night phase'}[G.phase]||'Setup');
  const chips=G.players.map(p=>{
    const idle=p.heroes.filter(h=>h.state==='idle').length;
    return `<span class="pc ${p===cur?'cur':''}" style="--c:${p.color.hex}"><i class="dot" style="background:${p.color.hex}"></i>${esc(p.name)}${p.human?'':' <em>AI</em>'}${G.phase==='day'?` <small>${idle}/4</small>`:''}</span>`;
  }).join('');
  let who,end='';
  if(mode==='you'){
    who=`<div class="who"><b class="y">▶ ${G.humans===1?'YOUR TURN':esc(cur.name).toUpperCase()+"'S TURN"}</b><span class="cap">${esc(sub)}</span></div>`;
    if(V.pa)end=`<button class="endturn" data-a="endturn">End Hero's turn</button>`;
    else if(V.night)end=`<button class="endturn" data-a="endturn">End turn</button>`;
    else if(V.pm)end=`<button class="endturn" disabled>Move a Hero first</button>`;
  }else if(mode==='ai'){
    who=`<div class="who"><b><span class="spin"></span>${esc(cur.name)} (AI) is playing…</b><span class="cap">${esc(V.cap||'')}</span></div>`;
  }else{
    who=`<div class="who"><b>${phase}</b><span class="cap">${esc(V.cap||'')}</span></div>`;
  }
  el.className=mode==='you'?'you':mode==='ai'?'ai':'';
  el.style.setProperty('--c',cur?cur.color.hex:'#555');
  el.innerHTML=`${who}<div class="order">${chips}</div>${end}`;
  $('#app').classList.toggle('aiplay',mode==='ai');
}
function hubHtml(){
  if(ART.map)return '';
  const ph=G.phase==='night'?'🌙':G.phase==='dawn'?'🌅':'☀️';
  const d=Math.max(1,Math.min(6,G.day||1));
  return `<div class="hub"><div class="hd">DAY</div><div class="hn">${d}<small style="font-size:.35em;opacity:.6">/6</small></div><div class="hp">${ph}</div><div class="hr" title="Radiation added to every Shelter tonight">☢ tonight +${RAD_DAY[d-1]}</div></div>`;
}
function nodeHtml(k){
  const L=LOCS[k],loc=G.loc[k],res=LOC_RES[k];
  const cls=['node',L.k];
  let dest=null;
  if(V.pm&&V.pm.sel!=null){dest=V.pm.opts.find(o=>o.hi===V.pm.sel).dests.find(d=>d.loc===k);if(dest)cls.push('dest');else cls.push('dim')}
  if(V.pl){if(V.pl.locs.includes(k))cls.push('dest');else cls.push('dim')}
  if(V.pa&&V.pa.h.loc===k)cls.push('here');
  if(V.curHero&&V.curHero.loc===k)cls.push('here');
  const now=Date.now();
  if(V.flash[k]>now)cls.push('flash');
  if(V.shake[k]>now&&V.anim)cls.push('shake');
  let body='';
  if(res)body+=`<div class="pool">${RI[res]}<b>${loc.amt}</b><small>${L.k==='dam'?'needs 1💾':''}</small></div>`;
  if(loc.game){
    const t=loc.game[0];
    body+=`<div class="game" title="Wild Game stack: only the top tile can be hunted">🦌 ${loc.game.length}${t?` · next: <b>End ${t.end+(G.fx.mut?1:0)}</b>`:' · empty'}</div>`;
  }
  if(L.k==='city'){
    body+=`<div class="game">🔎 ${loc.search.length} tiles</div><div class="eqs">${loc.equip.map(t=>eqChip(t)).join('')}</div>`;
  }
  if(L.k==='cargo'){
    body+=`<div class="spots">`+CARGO_SPOTS.map((s,i)=>{
      const occ=G.players.flatMap(q=>q.heroes.filter(h=>h.loc==='cargo'&&h.state==='act'&&h.spot===i).map(()=>q.color.hex));
      return `<div class="spot ${i===3?'hook':''}" title="${i===3?'Needs Grappling Hook':'Strength '+s.s}"><b>${s.s}</b>→${s.canned}🥫👤${occ.map(c=>`<i style="background:${c}"></i>`).join('')}</div>`;
    }).join('')+`</div>`;
  }
  if(L.k==='base')body+=`<div class="game">🌿 Algae ${G.algae?'<b>ready</b>':'taken'}</div>`;
  const heroes=G.players.flatMap(p=>p.heroes.map((h,hi)=>h.loc===k?heroTok(p,hi):'')).join('');
  return `<div class="${cls.join(' ')}" data-a="loc" data-loc="${k}" style="left:${L.x}%;top:${L.y}%">${ART.map?'':art(ART_OF[k])}<div class="nh">${esc(L.n)}</div>${body}<div class="hrow">${heroes}</div>${dest&&dest.exo?'<div class="exo">Exoskeleton</div>':''}</div>`;
}
function drawBg(){
  const b=$('#board'),svg=$('#bsvg');if(!b||!svg)return;
  const W=b.clientWidth,H=b.clientHeight;if(!W||!H)return;
  const X=p=>(p*W/100).toFixed(1),Y=p=>(p*H/100).toFixed(1);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const onMap=!!ART.map;
  let s=onMap?'':`<defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26301b"/><stop offset=".5" stop-color="#2a2a1a"/><stop offset="1" stop-color="#1b2216"/></linearGradient>
  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27546a"/><stop offset="1" stop-color="#17323f"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#gl)"/>`;
  // wasteland texture
  if(!onMap)for(let i=0;i<34;i++){const x=(i*37%100),y=(i*53%100);s+=`<ellipse cx="${X(x)}" cy="${Y(y)}" rx="${(W*.03+(i%5)*5).toFixed(0)}" ry="${(H*.02+(i%4)*4).toFixed(0)}" fill="${i%3?'#2f3a22':'#3a3320'}" opacity=".35"/>`}
  // river: from the north, widening into a bay with the Cargo Ship, to the south
  if(!onMap)s+=`<path d="M${X(45)} 0 C${X(40)} ${Y(22)},${X(33)} ${Y(33)},${X(34)} ${Y(50)} C${X(35)} ${Y(64)},${X(43)} ${Y(66)},${X(45)} ${Y(100)} L${X(56)} ${Y(100)} C${X(57)} ${Y(68)},${X(66)} ${Y(62)},${X(66)} ${Y(48)} C${X(66)} ${Y(32)},${X(60)} ${Y(20)},${X(57)} 0 Z" fill="url(#gr)" opacity=".92"/>`;
  if(!onMap)s+=`<path d="M${X(47)} ${Y(8)}q${X(-3)} ${Y(14)} ${X(-2)} ${Y(30)}M${X(54)} ${Y(10)}q${X(4)} ${Y(14)} ${X(3)} ${Y(30)}M${X(48)} ${Y(66)}q${X(1)} ${Y(14)} ${X(1)} ${Y(26)}" stroke="#9fd0e6" stroke-width="1.5" fill="none" opacity=".25"/>`;
  // arrows between the 8 locations (single ring)
  const br=b.getBoundingClientRect();
  const R={};b.querySelectorAll('.node').forEach(n=>{const r=n.getBoundingClientRect();R[n.dataset.loc]={cx:r.left-br.left+r.width/2,cy:r.top-br.top+r.height/2,hw:r.width/2,hh:r.height/2}});
  EDGES.forEach(([a,c])=>{
    const A=R[a],B=R[c];if(!A||!B)return;
    const dx=B.cx-A.cx,dy=B.cy-A.cy,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    const ex=(r)=>Math.min(Math.abs(ux)>1e-6?r.hw/Math.abs(ux):1e9,Math.abs(uy)>1e-6?r.hh/Math.abs(uy):1e9);
    const pad=5,t1=ex(A)+pad,t2=ex(B)+pad;
    const x1=A.cx+ux*t1,y1=A.cy+uy*t1,x2=B.cx-ux*t2,y2=B.cy-uy*t2;
    const L2=Math.hypot(x2-x1,y2-y1);if(L2<9)return;
    const hl=Math.min(11,L2*.32),nx=-uy*5.5,ny=ux*5.5;
    const head=(px,py,dx,dy)=>{const bx=px-dx*hl,by=py-dy*hl;return `<path class="arrowhead" d="M${px.toFixed(1)} ${py.toFixed(1)}L${(bx+nx).toFixed(1)} ${(by+ny).toFixed(1)}L${(bx-nx).toFixed(1)} ${(by-ny).toFixed(1)}z"/>`};
    s+=`<path class="arrow" d="M${(x1+ux*hl*.8).toFixed(1)} ${(y1+uy*hl*.8).toFixed(1)}L${(x2-ux*hl*.8).toFixed(1)} ${(y2-uy*hl*.8).toFixed(1)}"/>`+head(x2,y2,ux,uy)+head(x1,y1,-ux,-uy);
  });
  svg.innerHTML=s;
}
function renderBoard(){
  if(!G||!G.loc.forest)return;
  const bd=$('#board');
  bd.classList.toggle('map',!!ART.map);
  bd.style.backgroundImage=ART.map?`url(${ART.map})`:'';
  bd.style.aspectRatio=ART.map&&innerWidth>900?String(ART.mapRatio):'';
  $('#board').innerHTML=`<svg id="bsvg"></svg>`+hubHtml()+Object.keys(LOCS).map(nodeHtml).join('');
  drawBg();
}
if(window.ResizeObserver)new ResizeObserver(()=>{if(G&&G.loc&&G.loc.forest)drawBg()}).observe(document.getElementById('board'));
function gauge(p){
  let h='';
  for(let v=3;v>=-11;v--){h+=`<i class="g ${v>0?'pos':v===0?'zero':'neg'} ${p.rad===v?'on':''}">${p.rad===v?'☢':v}</i>`}
  return `<div class="gauge" title="Radioactivity: ${p.rad} (scores ${p.rad>=0?'+':''}${p.rad} SP)">${h}</div>`;
}
function airlock(p){
  let h='';
  for(let r=0;r<AIR_ROWS;r++){
    let row='';
    for(let c=0;c<AIR_ROW;c++){const i=r*AIR_ROW+c;row+=`<i class="sv ${i<p.air?'f':''}" style="--c:${p.color.hex}"></i>`}
    h+=`<div class="arow">${row}<small>${p.air>r*AIR_ROW?'💧1':''}</small></div>`;
  }
  const absorb=p.air+(hasRoom(p,'sealdoor')?1:0);
  return `<div class="airlock"><div class="al">Airlock <small>absorbs ${absorb} ☢ per night</small></div>${h}</div>`;
}
function roomCard(p,i,night){
  const r=p.rooms[i],d=ROOMS[r.k];
  const full=isFull(r);
  const slots=Array.from({length:Math.max(d.cap,r.pop)},(_,j)=>`<i class="sv ${j<r.pop?'f':''}" style="--c:${p.color.hex}"></i>`).join('');
  let ctl='';
  if(night){
    if(!r.built){ctl=`<button class="mini" data-a="build" data-i="${i}" ${nMat(p)>=buildCost(p)?'':'disabled'}>Build · ${buildCost(p)} Material${buildCost(p)>1?'s':''}</button>`}
    else{
      if(p.air>0&&r.pop<d.cap)ctl+=`<button class="mini" data-a="move" data-i="${i}" data-n="1">+1 from Airlock</button><button class="mini" data-a="move" data-i="${i}" data-n="9">Fill</button>`;
      if(full&&!r.used&&NIGHT_ABILITY.includes(r.k)&&!(r.k==='barracks'&&r.pop>=8))ctl+=`<button class="mini go" data-a="ability" data-i="${i}">Use ability</button>`;
    }
  }
  const state=!r.built?'unbuilt':full?'active':'built';
  return `<div class="room ${state} ${r.used?'used':''}"><div class="rh"><b>${esc(d.n)}</b><span class="up" title="Supplies per night while occupied">🍽${d.up}</span></div>
    <div class="rw">${esc(d.w)}${r.used?' · used':''}</div><div class="slots">${slots}</div>
    <div class="rt">${esc(d.t)}</div>${ctl?`<div class="ctl">${ctl}</div>`:''}</div>`;
}
function shelterHtml(p,chg){
  const night=V.night&&V.night.p===p;
  const sc=scoreOf(p);
  let h=`<div class="shead" style="--c:${p.color.hex}">${p.leader&&ART.leaders[p.leader.id]?portrait(p.leader.id,'por sm'):`<span class="dot big" style="background:${p.color.hex}"></span>`}<div><b>${esc(p.name)}</b>${p.human?'':' <small>(AI)</small>'}<div class="sub">${esc(p.leader?p.leader.n:'')}</div></div><div class="sp" title="Projected Survival Points">${sc.total}<small>SP</small></div></div>`;
  h+=`<div class="res">${RES_ALL.map(r=>resChip(r,p.res[r],chg.has(r))).join('')}<span class="rc ${chg.has('sv')?'chg':''}" title="Survivors"><span>👤</span><b>${survivors(p)}</b></span></div>`;
  h+=gauge(p);
  if(night){
    const mx=recruitMax(p);if(V.recN>mx)V.recN=mx;
    h+=`<div class="recruit"><b>Recruit</b> <span class="muted">Supplies ${nSup(p)} · Airlock free ${AIR_MAX-p.air}</span><div class="stepper"><button data-a="recdn">−</button><span>${V.recN}</span><button data-a="recup">+</button><button class="mini go" data-a="recruit" ${V.recN?'':'disabled'}>Recruit ${V.recN||''}</button><button class="mini" data-a="recmax">Max</button></div></div>`;
  }
  h+=airlock(p);
  h+=`<div class="rooms">${p.rooms.map((r,i)=>roomCard(p,i,night)).join('')}</div>`;
  const broken=p.equip.map((e,i)=>({e,i})).filter(x=>!x.e.fixed),fixed=p.equip.filter(e=>e.fixed);
  h+=`<div class="eqwrap"><div class="al">Equipment</div>`;
  h+=broken.length?`<div class="eqline">${broken.map(x=>{
    const q=repairQuote(p,x.e);
    return `<div class="eqb">${eqChip(x.e.id,'broken')}${night?`<button class="mini" data-a="repair" data-i="${x.i}" ${canPay(p,q.cost)?'':'disabled'}>Repair ${costHtml(q.cost)}</button>`:`<span class="cc dim">broken · ${costHtml(q.cost)}</span>`}</div>`}).join('')}</div>`:'';
  h+=fixed.length?`<div class="eqline">${fixed.map(e=>eqChip(e.id,e.used?'used':'ready')).join('')}</div>`:(broken.length?'':'<div class="muted">None yet.</div>');
  h+=`</div>`;
  if(p.events.length)h+=`<div class="eqwrap"><div class="al">Overcame</div><div class="eqline">${p.events.map(id=>`<button class="evc small" data-a="infoev" data-id="${id}"><b>${esc(EVENTS[id].n)}</b><span>+${EVENTS[id].sp} SP</span></button>`).join('')}</div></div>`;
  const caught=Object.entries(p.caught).filter(([,n])=>n>0);
  if(caught.length)h+=`<div class="muted small">Wild Game caught: ${caught.map(([e,n])=>`End ${e}×${n}`).join(', ')}</div>`;
  h+=`<div class="muted small">Score now: events ${sc.events} · rooms ${sc.rooms} (${sc.fullRooms} full) · radiation ${sc.rad} · survivors ${sc.survivors} · equipment ${sc.equip}+${sc.pairs} pairs</div>`;
  return h;
}
function renderSide(){
  if(!G||!G.players.length)return;
  if(V.view>=G.players.length)V.view=0;
  const tabs=G.players.map((p,i)=>`<button class="tab ${i===V.view?'on':''}" style="--c:${p.color.hex}" data-a="view" data-i="${i}"><span class="dot" style="background:${p.color.hex}"></span>${esc(p.name)}<small>${scoreOf(p).total}</small></button>`).join('');
  $('#tabs').innerHTML=tabs;
  const vp=G.players[V.view];
  const chg=new Set(),pv=V.prev[vp.id];
  const snap=p=>{const o={};RES_ALL.forEach(r=>o[r]=p.res[r]);o.sv=survivors(p);return o};
  if(pv)for(const k in pv)if(pv[k]!==snap(vp)[k])chg.add(k);
  G.players.forEach(p=>V.prev[p.id]=snap(p));
  $('#shelter').innerHTML=shelterHtml(vp,chg);
}
function renderAction(){
  const el=$('#action');
  if(V.pm){
    const sel=V.pm.sel;
    el.innerHTML=`<div class="ahead"><b style="color:${V.pm.p.color.hex}">${esc(V.pm.p.name)}</b> — ${sel==null?'tap one of your glowing Heroes':'tap a highlighted Location to move there'} <span class="muted">(1–2 steps along the arrows; you can't stop on your own Heroes)</span></div>`;
    return;
  }
  if(V.pl){el.innerHTML=`<div class="ahead">${esc(V.pl.prompt)}</div>`;return}
  if(V.pa){
    const{p,h,acts}=V.pa;
    el.innerHTML=`<div class="ahead"><b style="color:${p.color.hex}">${esc(p.name)}</b> · Strength ${h.str} Hero at <b>${esc(LOCS[h.loc].n)}</b> · <span class="ap">${h.ap} AP</span> left</div>
      <div class="acts">${acts.map((a,i)=>`<button class="act" data-a="act" data-i="${i}"><b>${a.label}</b><small>${a.sub||''}</small></button>`).join('')}<button class="act end" data-a="act" data-i="done"><b>End this Hero's turn</b><small>Unused Action Points are lost</small></button></div>`;
    return;
  }
  if(V.night){el.innerHTML=`<div class="ahead"><b style="color:${V.night.p.color.hex}">${esc(V.night.p.name)}</b> — manage your Shelter: recruit, move Survivors into Rooms, build, repair. Press <b>End turn</b> when done.</div>`;return}
  const last=V.logs.slice(-4).map(l=>`<div class="tick ${l.cls||''}">${esc(l.msg)}</div>`).join('');
  el.innerHTML=`<div class="ticker">${last||'<div class="tick">Welcome to the wasteland.</div>'}</div>`;
}
function renderLog(){
  const el=$('#log');if(!el)return;
  el.innerHTML=V.logs.slice(-120).map(l=>`<div class="ll ${l.cls||''}">${esc(l.msg)}</div>`).join('');
  el.scrollTop=el.scrollHeight;
}
function renderAll(){
  if(!G)return;
  renderTop();renderBoard();renderSide();renderAction();renderTurn();
  const night=G.phase==='night';
  $('#app').classList.toggle('night',night);$('#sky').classList.toggle('on',night&&V.live);
}

/* ---------- effects ---------- */
function anchor(target){
  let el=null;
  if(target&&target.loc)el=document.querySelector(`.node[data-loc="${target.loc}"]`);
  else if(target&&target.p!=null)el=document.querySelector(`.tab[data-i="${target.p}"]`);
  const r=el?el.getBoundingClientRect():$('#board').getBoundingClientRect();
  return{x:r.left+r.width/2,y:r.top+(el?Math.min(r.height*.4,34):40),key:(target&&(target.loc||'p'+target.p))||'x'};
}
function popFx(target,text,kind){
  if(!V.live)return;
  const a=anchor(target);
  const now=Date.now();
  const arr=(V.pops[a.key]=(V.pops[a.key]||[]).filter(t=>now-t<1700));
  const off=arr.length*28;arr.push(now);
  const el=document.createElement('div');
  el.className='pop '+(kind||'');
  el.textContent=text;
  el.style.left=Math.max(60,Math.min(innerWidth-60,a.x))+'px';
  el.style.top=Math.max(8,a.y-off)+'px';
  $('#fxlayer').appendChild(el);
  setTimeout(()=>el.remove(),1950);
  if(target&&target.loc&&V.anim){V.flash[target.loc]=now+800}
  sfx({gain:'gain',hunt:'hunt',hit:'hit',loss:'loss',good:'good',surv:'surv','surv-':'survLoss',rad:'rad',feed:'feed',build:'build'}[kind]||'select');
}
async function ghostMove(p,h,from,to){
  const hi=p.heroes.indexOf(h);
  const src=document.querySelector(`.hero[data-p="${p.id}"][data-hi="${hi}"]`);
  const dstNode=document.querySelector(`.node[data-loc="${to}"]`);
  sfx('move');
  if(!V.anim||!src||!dstNode){await wait(250*scale());return}
  const a=src.getBoundingClientRect();
  const center=k=>{const n=document.querySelector(`.node[data-loc="${k}"] .hrow`)||document.querySelector(`.node[data-loc="${k}"]`);const r=n.getBoundingClientRect();return{x:r.left+Math.min(r.width,60)/2+8,y:r.top+r.height/2}};
  const path=[];
  if(!ADJ[from].includes(to)){const mid=ADJ[from].find(m=>ADJ[m].includes(to));if(mid)path.push(center(mid))}
  path.push(center(to));
  const g=src.cloneNode(true);g.classList.add('ghost');g.removeAttribute('data-a');g.style.left=a.left+'px';g.style.top=a.top+'px';
  g.style.width=a.width+'px';g.style.height=a.height+'px';
  document.body.appendChild(g);src.style.visibility='hidden';
  const frames=[{transform:'translate(0,0) scale(1.2)'}];
  path.forEach(c=>frames.push({transform:`translate(${c.x-a.left-a.width/2}px,${c.y-a.top-a.height/2}px) scale(${frames.length===path.length?1.2:1.35})`}));
  const dur=Math.max(180,620*scale())*path.length;
  try{const an=g.animate(frames,{duration:dur,easing:'ease-in-out',fill:'forwards'});await an.finished}catch(e){await wait(dur)}
  g.remove();
}

/* ---------- UI hooks used by the engine ---------- */
window.UI={
  log(msg,cls){
    V.logs.push({msg,cls});if(V.logs.length>400)V.logs.shift();V.cap=msg;renderLog();
    if(!V.pm&&!V.pa&&!V.pl&&!V.night)renderAction();
    renderTurn();
  },
  render(){renderAll()},
  sleep(ms){return wait(ms*V.speed)},
  pop(t,x,k){popFx(t,x,k)},
  async banner(title,sub,kind){
    Sound.setMood(kind==='night'?'night':'day');
    if(kind==='night')coach('night','Night falls','At night events are resolved, everyone <b>feeds their Survivors</b> and takes <b>radiation</b>, then you manage your Shelter: recruit, fill Rooms, build and repair.');
    if(kind==='dawn')coach('dawn','A new day','Every Dawn the Locations refill with Resources and the day\'s Convoy Event is revealed. Then each player moves their 4 Heroes in turn.');
    sfx(kind==='night'?'night':'dawn');
    const el=$('#banner');
    if(!V.anim){await wait(450*scale());return}
    el.className=kind||'';el.innerHTML=`<div class="bb"><h1>${esc(title)}</h1><p>${esc(sub||'')}</p></div>`;
    void el.offsetWidth;el.classList.add('on');
    await wait(2400*Math.max(.35,scale()*.8));
    el.className='';
  },
  async turn(p,phase){
    V.turn={p,phase};V.curHero=null;
    if(!p.human&&V.follow)V.view=p.id;
    if(!p.human)coach('ai','Opponents','When the top bar says <b>(AI) is playing</b>, an opponent is taking their turn. Watch the board: their Hero flies to the new Location, floating labels show what they gain, and the bar below describes each step. You can change the speed in the pause menu.');
    renderAll();sfx('turn');
    await wait((p.human?150:550)*scale());
  },
  async turnEnd(p,phase){
    V.curHero=null;
    if(!p.human){popFx(P_ui(p),'✓ turn ended','good');renderAll();await wait(300*scale())}
  },
  async move(p,h,from,to){
    V.view=V.follow||p.human?p.id:V.view;
    V.curHero=h;
    await ghostMove(p,h,from,to);
  },
  async pressure(p,q,loc,pts){
    V.shake[loc]=Date.now()+900;
    coach('press','Pressure','Arriving where <i>weaker activated</i> Heroes stand lets you <b>press</b> them: they hand over 1 Supply/Material per point of Strength difference — unless they spend 💥 Munitions to resist.');
    popFx(L_ui(loc),`⚔ ${p.name} presses ${q.name}`,'hit');
    renderAll();
    await wait(1000*scale());
  },
  async focus(p){
    V.turn={p,phase:'night'};if(V.follow||p.human)V.view=p.id;renderAll();await wait(250*scale());
  },
  async chooseOne(title,options,text){
    if(/Leader/.test(title))coach('leader','Choose a Leader','Your Leader decides your <b>starting Locations</b> (where your 4 Heroes begin), your starting Resources and one broken piece of Equipment. The oldest Leader plays first.');
    return openModal((box,done)=>{head(box,esc(title),text?esc(text):'');
      const list=document.createElement('div');list.className='olist';
      options.forEach(o=>{const b=btn((ART.leaders[o.id]?portrait(o.id,'por'):'')+esc(o.label),'opt',()=>{sfx('select');done(o.id)},o.sub?esc(o.sub):'');if(ART.leaders[o.id])b.classList.add('haspor');list.appendChild(b)});
      box.appendChild(list)});
  },
  async chooseMany(title,options,count,text){
    if(/Room/.test(title))coach('rooms','Advanced Rooms','Rooms hold Survivors at night. A Room only works when <b>every</b> space is filled, and each occupied Room costs upkeep in Supplies. Bigger sets of full Rooms score many more points (1/2/4/7/11/17).');
    return openModal((box,done)=>{head(box,esc(title),text?esc(text):`Pick exactly ${count}.`);
      const sel=new Set(),list=document.createElement('div');list.className='olist';
      const ok=btn('Confirm','pri',()=>done([...sel]));ok.disabled=true;
      options.forEach(o=>{const b=btn(esc(o.label),'opt',()=>{
        if(sel.has(o.id)){sel.delete(o.id);b.classList.remove('on')}else if(sel.size<count){sel.add(o.id);b.classList.add('on')}
        sfx('select');ok.disabled=sel.size!==count;ok.querySelector('.bl').textContent=`Confirm (${sel.size}/${count})`},o.sub?esc(o.sub):'');list.appendChild(b)});
      box.appendChild(list);box.appendChild(ok);ok.querySelector('.bl').textContent=`Confirm (0/${count})`});
  },
  async amount(o){
    return openModal((box,done)=>{head(box,esc(o.title),esc(o.text||''));
      let n=o.def!=null?o.def:o.min;
      const row=document.createElement('div');row.className='stepper big';
      const out=document.createElement('span');out.textContent=n;
      const dn=document.createElement('button');dn.textContent='−';dn.onclick=()=>{n=Math.max(o.min,n-1);out.textContent=n};
      const up=document.createElement('button');up.textContent='+';up.onclick=()=>{n=Math.min(o.max,n+1);out.textContent=n};
      row.append(dn,out,up);box.appendChild(row);
      box.appendChild(btn('Confirm','pri',()=>done(n)))});
  },
  async payDialog(o){
    return openModal((box,done)=>{head(box,esc(o.title),`Choose ${o.n} token${o.n>1?'s':''} to pay.`);
      const pay={};o.allowed.forEach(r=>pay[r]=0);
      const rows=document.createElement('div');rows.className='payrows';
      const ok=btn('Confirm','pri',()=>done(pay));
      const upd=()=>{const s=Object.values(pay).reduce((a,b)=>a+b,0);ok.disabled=s!==o.n;ok.querySelector('.bl').textContent=`Confirm (${s}/${o.n})`;o.allowed.forEach(r=>{rows.querySelector(`[data-r="${r}"] span`).textContent=pay[r]})};
      o.allowed.forEach(r=>{
        const row=document.createElement('div');row.className='stepper';row.dataset.r=r;
        row.innerHTML=`<em>${RI[r]} ${RN[r]} <small>(have ${o.p.res[r]})</small></em>`;
        const dn=document.createElement('button');dn.textContent='−';dn.onclick=()=>{pay[r]=Math.max(0,pay[r]-1);upd()};
        const sp=document.createElement('span');sp.textContent='0';
        const up=document.createElement('button');up.textContent='+';up.onclick=()=>{const s=Object.values(pay).reduce((a,b)=>a+b,0);if(pay[r]<o.p.res[r]&&s<o.n){pay[r]++;upd()}};
        row.append(dn,sp,up);rows.appendChild(row)});
      box.appendChild(rows);box.appendChild(ok);upd()});
  },
  pickMove(p,opts){
    V.view=p.id;V.turn={p,phase:'day'};V.curHero=null;
    coach('move1','Move a Hero','It is your turn! Tap one of your <b>glowing Heroes</b> (the number is its Strength = Action Points). Hollow tokens have not moved yet this day.');
    sfx('turn');
    return new Promise(res=>{V.pm={p,opts,sel:null,res};renderAll()});
  },
  pickLocation(p,locs,prompt){
    V.view=p.id;
    coach('place','Place your Heroes','The game starts by placing your 4 Heroes (Strength 5, 4, 3, 3), one at a time, on the <b>highlighted Locations</b> — your Leader\'s starting spots. Pick where you want to gather first.');
    return new Promise(res=>{V.pl={p,locs,prompt,res};renderAll()});
  },
  pickAction(p,h,acts){
    V.view=p.id;
    coach('act','Actions','Your Hero has Action Points (AP) equal to its Strength. <b>Scavenge</b> the Location\'s resources, <b>Hunt</b> wild game, <b>Search</b> city piles or <b>Salvage</b> Equipment. Unused AP are lost, so spend them — or press <b>End Hero\'s turn</b>.');
    return new Promise(res=>{V.pa={p,h,acts,res};renderAll()});
  },
  async shelter(p){
    V.view=p.id;V.night={p};V.recN=0;V.turn={p,phase:'night'};
    coach('shelter','Your Shelter','<b>Recruit</b> Survivors with Supplies (they wait in the Airlock), then <b>move them into Rooms</b>. Full Rooms score and unlock abilities, but Survivors in Rooms can never leave. You can also <b>Build</b> Rooms with Materials and <b>Repair</b> Equipment. Press <b>End turn</b> when finished.');
    await new Promise(res=>{V.night.res=res;renderAll()});
    V.night=null;renderAll();
  },
  async handoff(p){
    return openModal((box,done)=>{head(box,`Pass the device to <span style="color:${p.color.hex}">${esc(p.name)}</span>`,'Everyone else look away — only the next player needs the screen.');box.appendChild(btn("I'm ready",'pri',()=>done()))});
  },
  async showEvent(id){
    const e=EVENTS[id];
    coach('event','Convoy Events','Each day a new Event is revealed. Its harmful effect repeats every day until someone <b>Overcomes</b> it at night by paying its cost — which also scores Survival Points.');
    return openModal((box,done)=>{head(box,`Event: ${esc(e.n)}`,esc(e.t));
      const d=document.createElement('div');d.className='mtext';d.innerHTML=`Overcome during the Night for ${costHtml(e.cost)} → <b>+${e.sp} SP</b>. Until then its effect repeats every day.`;box.appendChild(d);
      box.appendChild(btn('Continue','pri',()=>done()))});
  },
  async nightReport(p){
    if(!p.report.length)return;
    return openModal((box,done)=>{head(box,`${esc(p.name)} — the night so far`);
      const d=document.createElement('div');d.className='mtext';d.innerHTML=p.report.map(x=>`<div>• ${esc(x)}</div>`).join('');box.appendChild(d);
      box.appendChild(btn('Continue','pri',()=>done()))});
  },
  async showPile(city,tiles){
    const nm={water:'💧 Water',canned:'🥫 Canned',wood:'🪵 Wood',metal:'🔩 Metal',chip:'💾 Chip',mun:'💥 Munitions',algae:'🌿 Algae',empty:'∅ Empty'};
    return openModal((box,done)=>{head(box,`${esc(LOCS[city].n)} — Search pile`,'Top of the pile first. Keep it secret!');
      const d=document.createElement('div');d.className='pile';d.innerHTML=tiles.map(t=>`<span>${nm[t]}</span>`).join('');box.appendChild(d);
      box.appendChild(btn('Close','pri',()=>done()))});
  },
  async final(rows){
    hideCoach();Sound.setMood('menu');
    const w=rows[0];
    sfx(!G.humans||w.p.human?'win':'lose');
    return openModal((box,done)=>{
      head(box,`<span style="color:${w.p.color.hex}">${esc(w.p.name)}</span> escapes with Convoy!`,`Final scores after 6 days.`);
      const t=document.createElement('table');t.className='score';
      t.innerHTML=`<tr><th></th><th>Events</th><th>Rooms</th><th>☢</th><th>👤</th><th>Equip</th><th>Pairs</th><th>Total</th></tr>`+rows.map((r,i)=>`<tr class="${i===0?'win':''}"><td><span class="dot" style="background:${r.p.color.hex}"></span>${esc(r.p.name)}</td><td>${r.s.events}</td><td>${r.s.rooms}<small>(${r.s.fullRooms})</small></td><td>${r.s.rad}</td><td>${r.s.survivors}</td><td>${r.s.equip}</td><td>${r.s.pairs}</td><td><b>${r.s.total}</b></td></tr>`).join('');
      box.appendChild(t);
      const n=document.createElement('p');n.className='mtext muted';n.textContent='Ties: most Supplies, then most Materials + Munitions.';box.appendChild(n);
      const row=document.createElement('div');row.className='mrow';
      row.appendChild(btn('Look at the board','',()=>done()));
      row.appendChild(btn('Main menu','',()=>{done();showMenu()}));
      row.appendChild(btn('Play again','pri',()=>{done();newGameFlow()}));
      box.appendChild(row)},{wide:true});
  }
};
const P_ui=p=>({p:p.id}),L_ui=l=>({loc:l});

/* ---------- click handling ---------- */
const handlers={
  view(t){V.view=+t.dataset.i;const p=G.players[V.view];V.prev[p.id]=null;renderSide()},
  hero(t){
    const p=G.players[+t.dataset.p],hi=+t.dataset.hi;
    if(V.pm&&V.pm.p===p&&p.heroes[hi].state==='idle'&&V.pm.opts.some(o=>o.hi===hi)){
      V.pm.sel=V.pm.sel===hi?null:hi;sfx('select');renderAll();
      if(V.pm.sel!=null)coach('move2','Choose a destination','The <b>highlighted Locations</b> are where this Hero can go: 1 or 2 steps along the glowing arrows. You may not stop on a Location holding another Hero of your colour.');
      return false}
    return handlers.loc({dataset:{loc:p.heroes[hi].loc}});
  },
  loc(t){
    const k=t.dataset.loc;
    if(V.pm&&V.pm.sel!=null){
      const o=V.pm.opts.find(o=>o.hi===V.pm.sel);
      if(o&&o.dests.some(d=>d.loc===k)){const r=V.pm.res;const ch={hi:V.pm.sel,loc:k};V.pm=null;hideCoach();r(ch);return}
    }
    if(V.pl&&V.pl.locs.includes(k)){const r=V.pl.res;V.pl=null;hideCoach();r(k)}
  },
  act(t){
    if(!V.pa)return;
    const r=V.pa.res,acts=V.pa.acts;
    const a=t.dataset.i==='done'?{id:'done'}:acts[+t.dataset.i];
    V.pa=null;r(a);
  },
  endturn(){
    if(V.pa){const r=V.pa.res;V.pa=null;r({id:'done'})}
    else if(V.night){const r=V.night.res;if(r)r()}
  },
  infoeq(t){const e=EQ[t.dataset.id];infoModal(esc(e.n),`<p>${esc(e.t)}</p><p>Repair cost: ${costHtml(e.cost)}</p><p>Pair symbol <span style="color:${SYM_COL[e.sym]}">${SYMS[e.sym]}</span> (${e.side==='L'?'left':'right'} half): repaired matching halves score +1 SP.</p>`)},
  infoev(t){const e=EVENTS[t.dataset.id];infoModal(esc(e.n),`<p>${esc(e.t)}</p><p>Overcome: ${costHtml(e.cost)} → +${e.sp} SP</p>`)},
  recdn(){V.recN=Math.max(0,V.recN-1);renderAll()},
  recup(){V.recN=Math.min(recruitMax(V.night.p),V.recN+1);renderAll()},
  recmax(){V.recN=recruitMax(V.night.p);renderAll()},
  recruit(){recruit(V.night.p,V.recN);V.recN=0;renderAll()},
  move(t){moveToRoom(V.night.p,+t.dataset.i,+t.dataset.n);sfx('select');renderAll()},
  async build(t){if(V.busy)return;V.busy=true;try{await buildRoom(V.night.p,+t.dataset.i)}finally{V.busy=false}renderAll()},
  repair(t){repairEq(V.night.p,+t.dataset.i);renderAll()},
  async ability(t){if(V.busy)return;V.busy=true;try{await useAbility(V.night.p,+t.dataset.i)}finally{V.busy=false}renderAll()},
  tmusic(){Sound.unlock();Sound.setMusic(!Sound.state.music);renderCluster()},
  tsfx(){Sound.unlock();Sound.setSfx(!Sound.state.sfx);renderCluster();sfx('select')},
  pause(){if(V.live)setPaused(true)},
  coachx(){hideCoach()}
};
const ALWAYS=['tmusic','tsfx','pause','coachx'];
document.addEventListener('click',e=>{
  const bt=e.target.closest('button');if(bt&&!bt.disabled&&!bt.closest('#menu'))sfx('click');
  const t=e.target.closest('[data-a]');if(!t)return;
  if(V.paused)return;
  if(V.modalOpen&&!t.closest('#modal')&&!ALWAYS.includes(t.dataset.a))return;
  const f=handlers[t.dataset.a];if(!f)return;
  const r=f(t);
  if(r===false)e.stopPropagation();
});
document.addEventListener('pointerdown',function once(){Sound.unlock();$('#menuhint')&&($('#menuhint').textContent='');},{passive:true});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if($('#pausem').classList.contains('on')){closePanel();return}
    if(V.live&&!V.modalOpen)setPaused(true);
  }
});

/* ---------- rules text ---------- */
const RULES_HTML=`<p><b>Goal.</b> Survive 6 days and finish with the most <b>Survival Points (SP)</b>.</p>
<p><b>Each day:</b> <b>Dawn</b> (Locations refill, a Convoy Event is revealed) → <b>Day</b> (each player in turn moves a Hero, then it acts) → <b>Night</b> (events, feeding, radiation, recruiting, building, repairs).</p>
<p><b>Map.</b> The 8 Locations form one ring linked by two-way green arrows. A Hero moves <b>1–2 steps</b> along the arrows and cannot stop on a Location holding another Hero of its colour.</p>
<p><b>Heroes</b> have Strength 5/4/3/3 = Action Points (AP). Arriving where weaker <i>activated</i> Heroes stand lets you apply <b>Pressure</b>: they hand over 1 Supply/Material per point of Strength difference — or spend 💥 Munitions to block it.</p>
<p><b>Night:</b> pay Supplies (🍖💧🥫) for every occupied Room and 💧 for each used Airlock row, or Survivors starve. Airlock Survivors absorb radiation. Rooms only work when <i>every</i> space is filled; Survivors in Rooms can never leave.</p>
<p><b>Score:</b> Overcome Events + fully populated Rooms (1→0, 2→1, 3→2, 4→4, 5→7, 6→11, 7→17) + radiation level + Survivors + repaired Equipment (+1 per matching symbol pair).</p>
<p class="muted">Ties: most Supplies, then most Materials + Munitions.</p>`;
function showRules(){
  return openModal((box,done)=>{head(box,'How a game works');
    const d=document.createElement('div');d.className='mtext';d.innerHTML=RULES_HTML;
    box.appendChild(d);box.appendChild(btn('Close','pri',()=>done()))},{wide:true});
}

/* ---------- settings widgets ---------- */
function settingsInto(box){
  const row=(label,ctl)=>{const d=document.createElement('div');d.className='setrow';d.innerHTML=`<span>${label}</span>`;d.appendChild(ctl);box.appendChild(d)};
  const sw=(on,fn)=>{const b=document.createElement('button');b.className='sw'+(on?' on':'');b.setAttribute('role','switch');b.onclick=()=>{on=!on;b.classList.toggle('on',on);fn(on);renderCluster();sfx('select')};return b};
  const rg=(v,fn)=>{const i=document.createElement('input');i.type='range';i.min=0;i.max=100;i.value=Math.round(v*100);i.oninput=()=>fn(i.value/100);i.onchange=()=>sfx('select');return i};
  const seg=(opts,cur,fn)=>{const d=document.createElement('div');d.className='segb';opts.forEach(([l,v])=>{const b=document.createElement('button');b.textContent=l;if(v===cur)b.className='on';b.onclick=()=>{fn(v);d.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');sfx('select')};d.appendChild(b)});return d};
  const st=Sound.state;
  row('🎵 Music',sw(st.music,v=>{Sound.unlock();Sound.setMusic(v)}));
  row('Music volume',rg(st.mv,v=>Sound.setMusicVol(v)));
  row('🔊 Sound effects',sw(st.sfx,v=>{Sound.unlock();Sound.setSfx(v)}));
  row('Effects volume',rg(st.sv,v=>Sound.setSfxVol(v)));
  row('Opponent speed',seg([['Slow',4],['Normal',2.2],['Fast',1.1],['Turbo',.3]],V.speed,v=>{V.speed=v;saveSet()}));
  row('Animations',sw(V.anim,v=>{V.anim=v;saveSet()}));
  row('Follow opponents (show their Shelter)',sw(V.follow,v=>{V.follow=v;saveSet()}));
  const ab=document.createElement('button');ab.className='mini go';ab.textContent='Custom artwork…';ab.onclick=()=>panel('art');row('Your own map &amp; Leader pictures',ab);
}

/* ---------- pause / panels ---------- */
function setPaused(on){
  if(!V.live)return;
  if(on){V.paused=true;V.pctx='pause';panel('pause')}
  else{V.paused=false;$('#pausem').classList.remove('on');const r=V.resume;V.resume=[];r.forEach(f=>f())}
}
function closePanel(){
  if(V.pctx==='pause')setPaused(false);else $('#pausem').classList.remove('on');
  sfx('close');
}
function panel(view,arg){
  if(view!=='confirm'&&arg)V.pctx=arg;
  const root=$('#pausem'),box=document.createElement('div');box.className='mbox';
  root.innerHTML='';root.appendChild(box);root.classList.add('on');
  const back=()=>V.pctx==='pause'?panel('pause'):closePanel();
  if(view==='pause'){
    head(box,'Paused',V.tut?'Tutorial game':'The wasteland waits for you.');
    box.appendChild(btn('Resume','pri',()=>closePanel()));
    box.appendChild(btn('Settings','',()=>panel('settings')));
    box.appendChild(btn('How to play','',()=>panel('rules')));
    box.appendChild(btn('Tutorial primer','',()=>panel('slides')));
    box.appendChild(btn('Restart game','',()=>panel('confirm','restart')));
    box.appendChild(btn('Main menu','',()=>panel('confirm','menu')));
  }else if(view==='settings'){
    head(box,'Settings');settingsInto(box);box.appendChild(btn('Back','pri',back));
  }else if(view==='rules'){
    head(box,'How a game works');const d=document.createElement('div');d.className='mtext';d.innerHTML=RULES_HTML;box.appendChild(d);box.appendChild(btn('Back','pri',back));
  }else if(view==='slides'){
    slidesInto(box,false,go=>{if(go)panel('confirm','tutorial');else back()});
  }else if(view==='art'){
    artPanel(box,back);
  }else if(view==='about'){
    head(box,'About');const d=document.createElement('div');d.className='mtext';
    d.innerHTML=`<p><b>Outlive</b> — digital prototype ${VERSION}.</p><p>An unofficial fan-made adaptation of the Outlive board game for solo and hot-seat play. Not affiliated with or endorsed by the publisher. All artwork, music and sounds in this version are original and generated in your browser.</p>`;
    box.appendChild(d);box.appendChild(btn('Back','pri',back));
  }else if(view==='confirm'){
    const what=arg;
    head(box,what==='restart'?'Restart this game?':what==='tutorial'?'Start the tutorial?':'Return to the main menu?','Your current game will be abandoned.');
    box.appendChild(btn('Yes','pri',()=>{
      $('#pausem').classList.remove('on');
      if(what==='restart'){V.paused=false;launch(V.cfg,{tut:V.tut,seed:V.tut?TUT_SEED:undefined})}
      else if(what==='tutorial'){V.paused=false;launch({players:[{name:'You',human:true},{name:'Rook',human:false}]},{tut:true,seed:TUT_SEED})}
      else{V.paused=false;showMenu()}
    }));
    box.appendChild(btn('Cancel','',()=>panel('pause')));
  }
}

function artPanel(box,back){
  box.classList.add('wide');
  const draw=()=>{
    box.innerHTML='';head(box,'Custom artwork','Use your own pictures from the board game (e.g. photos or scans of your copy). They are stored only on this device, in this browser, and are never uploaded anywhere.');
    const row=(label,has,onPick,onClear,extra)=>{const d=document.createElement('div');d.className='artrow';
      d.innerHTML=`<div class="al2">${extra||''}<span>${label}</span></div>`;
      const b=document.createElement('button');b.className='mini go';b.textContent=has?'Replace':'Choose image';
      b.onclick=async()=>{const f=await pickFile();if(!f)return;b.textContent='Loading…';try{await onPick(f)}catch(e){}draw()};d.appendChild(b);
      if(has){const c=document.createElement('button');c.className='mini';c.textContent='Remove';c.onclick=async()=>{await onClear();draw()};d.appendChild(c)}
      box.appendChild(d)};
    row('Board map (the whole map picture)',!!ART.map,setMap,clearMap,ART.map?`<img class="por map" src="${ART.map}" alt="">`:'');
    const h=document.createElement('h3');h.textContent='Leaders';h.style.margin='14px 0 4px';box.appendChild(h);
    const hp=document.createElement('p');hp.className='mtext muted';hp.textContent='Give each Leader the name and portrait from your card. Names are saved too.';box.appendChild(hp);
    LEADERS.forEach(l=>{
      const d=document.createElement('div');d.className='artrow';
      d.innerHTML=`<div class="al2">${portrait(l.id,'por sm')||'<span class="por sm ph">?</span>'}<input value="${esc(l.n)}" maxlength="24" aria-label="Leader name"></div>`;
      d.querySelector('input').onchange=async e=>{const v=e.target.value.trim()||l.n;l.n=v;ART.names[l.id]=v;await kvSet('name:'+l.id,v)};
      const b=document.createElement('button');b.className='mini go';b.textContent=ART.leaders[l.id]?'Replace':'Portrait';
      b.onclick=async()=>{const f=await pickFile();if(!f)return;try{await setLeaderImg(l.id,f)}catch(e){}draw()};d.appendChild(b);
      if(ART.leaders[l.id]){const c=document.createElement('button');c.className='mini';c.textContent='Remove';c.onclick=async()=>{await clearLeaderImg(l.id);draw()};d.appendChild(c)}
      box.appendChild(d)});
    box.appendChild(btn('Back','pri',()=>{box.classList.remove('wide');back()}));
  };
  draw();
}

/* ---------- tutorial primer ---------- */
function ringSvg(){
  const pts={forest:[20,18],dam:[90,12],mb:[160,18],bc:[20,60],sp:[160,60],fair:[20,102],cargo:[90,108],mine:[160,102]};
  const ring=['forest','dam','mb','sp','mine','cargo','fair','bc'];
  let s=`<svg viewBox="0 0 180 120" width="260" aria-label="Eight Locations connected in a ring of arrows">`;
  ring.forEach((a,i)=>{const b=ring[(i+1)%8],A=pts[a],B=pts[b];const dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l;
    const x1=A[0]+ux*13,y1=A[1]+uy*13,x2=B[0]-ux*15,y2=B[1]-uy*15;
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c9e86a" stroke-width="1.6"/><path d="M${x2} ${y2}l${-ux*5-uy*3} ${-uy*5+ux*3}l${uy*6} ${-ux*6}z" fill="#c9e86a"/><path d="M${x1} ${y1}l${ux*5-uy*3} ${uy*5+ux*3}l${uy*6} ${-ux*6}z" fill="#c9e86a"/>`});
  ring.forEach(k=>{const p=pts[k];s+=`<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="#1a1f17" stroke="#6f8f4a"/><text x="${p[0]}" y="${p[1]+3}" font-size="7" fill="#e8e4d9" text-anchor="middle">${LOCS[k].n.split(' ').map(w=>w[0]).join('')}</text>`});
  s+=`<circle cx="90" cy="60" r="16" fill="#27546a" opacity=".6"/></svg>`;
  return s;
}
const SLIDES=[
  {t:'Welcome to the wasteland',viz:'☢️🏚️🚢',h:'The world ended. In <b>6 days</b> the Convoy arrives to rescue the Shelters that are still standing. You lead a Tribe of survivors — whoever has the most <b>Survival Points</b> when it arrives wins.'},
  {t:'Day, night, day…',viz:'🌅 → ☀️ → 🌙',h:'<b>Dawn:</b> Locations refill and a Convoy Event appears.<br><b>Day:</b> players take turns moving Heroes and gathering.<br><b>Night:</b> feed survivors, endure radiation, recruit, build and repair.'},
  {t:'The map is a ring',viz:ringSvg(),h:'The 8 Locations are linked in one ring by two-way green arrows. Each Hero moves <b>1 or 2 steps</b> along the arrows. You have 4 Heroes with Strength <b>5, 4, 3, 3</b>. Tap a glowing Hero, then a highlighted Location.'},
  {t:'Acting & Pressure',viz:'🪵 💧 🔩 🦌 🔎',h:'After moving, a Hero has <b>Action Points = Strength</b>. Spend them to scavenge, hunt, search cities or salvage equipment. If you arrive next to <i>weaker activated</i> Heroes you may <b>press</b> them: they must give you resources (or spend 💥 Munitions).'},
  {t:'Surviving the night',viz:'🍖💧🥫 → 👤',h:'Every night each Room that holds Survivors costs <b>Supplies</b>. Radiation grows each day; Survivors waiting in your <b>Airlock</b> absorb it. Overcome Events by paying their cost to remove their curse and earn points.'},
  {t:'Your Shelter',viz:'🏠 🚪 🛠️',h:'<b>Recruit</b> Survivors into the Airlock, then <b>move them into Rooms</b>. A Room works only when every space is full — and Survivors in Rooms can never leave. <b>Build</b> Rooms with Materials, <b>repair</b> broken Equipment for bonuses.'},
  {t:'Scoring',viz:'⭐ Events · Rooms · ☢ · 👤 · 🔧',h:'Points come from Overcome Events, <b>fully populated Rooms</b> (1→0, 2→1, 3→2, 4→4, 5→7, 6→11, 7→17), radiation level, Survivors and repaired Equipment (+1 per matching pair).'},
  {t:'Ready? Play a guided game',viz:'🎮',h:'The tutorial game is a short real match against one opponent. Hints appear at the bottom of the screen as things happen — dismiss them with “Got it”.',last:true}
];
function slidesInto(box,fromMenu,onClose){
  let i=0;
  const draw=()=>{
    const s=SLIDES[i];box.innerHTML='';
    const d=document.createElement('div');d.className='slide';
    d.innerHTML=`<h2>${esc(s.t)}</h2><div class="viz">${s.viz}</div><p class="mtext">${s.h}</p><div class="dots">${SLIDES.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div>`;
    box.appendChild(d);
    const row=document.createElement('div');row.className='mrow';
    if(i>0)row.appendChild(btn('Back','',()=>{i--;draw()}));
    if(!s.last)row.appendChild(btn('Next','pri',()=>{i++;draw()}));
    else row.appendChild(btn('Play tutorial game','pri',()=>{onClose(true)}));
    box.appendChild(row);
    box.appendChild(btn(s.last?'Not now':'Skip','',()=>onClose(false)));
  };
  draw();
}
const TUT_SEED=20261;
async function tutorialFlow(){
  const go=await openModal((box,done)=>slidesInto(box,true,done),{wide:true});
  if(go)launch({players:[{name:'You',human:true},{name:'Rook',human:false}]},{tut:true,seed:TUT_SEED});
}

/* ---------- menu + game flow ---------- */
function menuScene(){
  let s=`<svg class="scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb06a"/><stop offset=".35" stop-color="#e0642c" stop-opacity=".8"/><stop offset="1" stop-color="#e0642c" stop-opacity="0"/></radialGradient>
  <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0e18"/><stop offset=".6" stop-color="#3b2118"/><stop offset="1" stop-color="#7a3a1c"/></linearGradient></defs>
  <rect width="1200" height="700" fill="url(#sky2)"/><circle cx="840" cy="470" r="260" fill="url(#sun)"/><circle cx="840" cy="470" r="70" fill="#ffc07a" opacity=".85"/>`;
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<60;i++)s+=`<circle cx="${(rnd()*1200).toFixed(0)}" cy="${(rnd()*300).toFixed(0)}" r="${(rnd()*1.3+.3).toFixed(1)}" fill="#fff" opacity="${(rnd()*.6+.2).toFixed(2)}"/>`;
  const layer=(base,fill,op,minh,maxh,minw,maxw)=>{let x=-20,g=`<g fill="${fill}" opacity="${op}">`;while(x<1240){const w=minw+rnd()*(maxw-minw),h=minh+rnd()*(maxh-minh);const cut=rnd()<.5;g+=cut?`<path d="M${x.toFixed(0)} ${base}V${(base-h).toFixed(0)}l${(w*.4).toFixed(0)} ${(rnd()*18).toFixed(0)}l${(w*.3).toFixed(0)} ${-(rnd()*10).toFixed(0)}l${(w*.3).toFixed(0)} ${(rnd()*30).toFixed(0)}V${base}z"/>`:`<rect x="${x.toFixed(0)}" y="${(base-h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/>`;x+=w+rnd()*8}return g+'</g>'};
  s+=layer(560,'#4a2a1e',.55,60,220,30,70)+layer(620,'#2a1812',.9,80,300,36,90)+layer(700,'#0d0907',1,30,150,50,120);
  s+=`<g stroke="#0d0907" stroke-width="3" fill="none"><circle cx="200" cy="560" r="80"/><path d="M200 480v160M120 560h160M143 503l114 114M257 503L143 617"/></g>`;
  for(let i=0;i<26;i++){const x=rnd()*1300,y=rnd()*700;s+=`<circle class="dust" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rnd()*2+1).toFixed(1)}" fill="#e8c9a0" opacity="${(rnd()*.35+.1).toFixed(2)}" style="animation-duration:${(8+rnd()*14).toFixed(1)}s;animation-delay:-${(rnd()*20).toFixed(1)}s"/>`}
  return s+'</svg>';
}
function buildMenu(){
  $('#menu').innerHTML=menuScene()+`<div class="mc"><h1>OUTLIVE</h1><div class="tag">Six days · One Convoy · No mercy</div>
  <div class="mbtns"><button class="pri" data-m="play">New game</button><button data-m="tut">Tutorial</button><button data-m="rules">How to play</button><button data-m="art">Custom artwork</button><button data-m="set">Settings</button><button data-m="about">About</button></div>
  <div class="hint" id="menuhint">${Sound.state.music?'Tap anywhere to start the music':''}</div></div>`;
  $('#menu').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{
    const m=b.dataset.m;sfx('click');
    if(m==='play')newGameFlow();else if(m==='tut')tutorialFlow();else if(m==='rules')showRules();
    else if(m==='set')panel('settings','menu');else if(m==='art')panel('art','menu');else if(m==='about')panel('about','menu');
  });
}
function abortGame(){
  V.gen++;V.paused=false;
  const r=V.resume;V.resume=[];r.forEach(f=>f());
  V.pm=V.pa=V.pl=V.night=null;V.turn=null;V.curHero=null;V.busy=false;
  if(V._closeModal)V._closeModal();
  $('#pausem').classList.remove('on');$('#fxlayer').innerHTML='';$('#banner').className='';hideCoach();
  $('#sky').classList.remove('on');$('#app').classList.remove('night','aiplay');
}
function showMenu(){
  abortGame();V.live=false;
  $('#app').classList.remove('live');
  if(!$('#menu').firstChild)buildMenu();
  $('#menu').classList.add('on');
  Sound.setMood('menu');renderCluster();
}
const AI_NAMES=['Rook','Vesper','Ash','Juno'];
async function newGameFlow(){
  const cfg=await openModal((box,done)=>{
    head(box,'New game','Gather, feed, build and outlast the other Tribes.');
    let n=3;const seats=[{h:true,name:'You'},{h:false},{h:false},{h:false}];
    const cnt=document.createElement('div');cnt.className='seg';
    const list=document.createElement('div');list.className='seats';
    const draw=()=>{
      cnt.innerHTML='<span>Players</span>'+[2,3,4].map(k=>`<button class="${k===n?'on':''}" data-k="${k}">${k}</button>`).join('');
      cnt.querySelectorAll('button').forEach(b=>b.onclick=()=>{n=+b.dataset.k;draw()});
      list.innerHTML='';
      for(let i=0;i<n;i++){
        const s=seats[i];const row=document.createElement('div');row.className='seat';row.style.setProperty('--c',COLORS[i].hex);
        row.innerHTML=`<span class="dot" style="background:${COLORS[i].hex}"></span><input value="${esc(s.name||AI_NAMES[i-1]||('Player '+(i+1)))}" maxlength="14"><button class="tg ${s.h?'on':''}">${s.h?'Human':'AI'}</button>`;
        row.querySelector('input').oninput=e=>{s.name=e.target.value};
        row.querySelector('.tg').onclick=()=>{s.h=!s.h;draw()};
        list.appendChild(row);
      }
    };
    draw();box.appendChild(cnt);box.appendChild(list);
    const hint=document.createElement('p');hint.className='mtext muted';hint.textContent='Mix humans and AI freely — all-human games work as hot-seat (the device is passed around). Switch every seat to AI to just watch.';box.appendChild(hint);
    const row=document.createElement('div');row.className='mrow';
    row.appendChild(btn('Back','',()=>done(null)));
    row.appendChild(btn('Start game','pri',()=>done({players:seats.slice(0,n).map((s,i)=>({name:(s.name||'').trim()||('Player '+(i+1)),human:s.h}))})));
    box.appendChild(row);
  });
  if(cfg)launch(cfg,{});
}
async function launch(cfg,opts){
  opts=opts||{};
  abortGame();
  V.cfg=cfg;V.tut=!!opts.tut;V.coached={};V.logs=[];V.view=0;V.live=true;V.prev={};V.cap='';V.flash={};V.shake={};
  $('#menu').classList.remove('on');$('#app').classList.add('live');
  seedRng(opts.seed||(Date.now()&0x7fffffff));
  Sound.unlock();Sound.setMood('day');renderCluster();
  const g=V.gen;
  try{await runGame(cfg)}
  catch(err){
    if(g!==V.gen)return;
    console.error(err);
    openModal((box,done)=>{head(box,'Something broke',esc(err&&err.message||String(err)));box.appendChild(btn('Back to menu','pri',()=>{done();showMenu()}))});
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  $('#ver').textContent='Outlive · '+VERSION;
  window.__outlive={launch,showMenu,V,ART};
  showMenu();
  loadArt().then(()=>{if(G&&G.loc&&G.loc.forest)renderAll()}).catch(()=>{});
});
})();
