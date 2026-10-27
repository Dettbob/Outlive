'use strict';
/* =====================================================================
   OUTLIVE — digital prototype: game engine (rules + AI)
   Fan-made implementation of the published rules. No official art/text.
   Numbers the rulebook leaves to the components (room stats, event costs,
   leaders, equipment costs, map links) are original values chosen here.
   ===================================================================== */

/* ---------- data ---------- */
const MATS=['wood','metal','chip'],SUPS=['meat','water','canned'],RES_ALL=[...MATS,...SUPS,'mun'];
const RN={wood:'Wood',metal:'Metal',chip:'Microchips',meat:'Meat',water:'Water',canned:'Canned goods',mun:'Munitions'};
const RI={wood:'🪵',metal:'🔩',chip:'💾',meat:'🍖',water:'💧',canned:'🥫',mun:'💥'};
const COLORS=[{id:'purple',name:'Purple',hex:'#9b6bff'},{id:'orange',name:'Orange',hex:'#ff8f3a'},{id:'beige',name:'Sand',hex:'#e2d2a6'},{id:'blue',name:'Blue',hex:'#3fa2ff'}];
const LOCS={
  forest:{n:'Forest',x:15,y:14,k:'wild'},
  dam:{n:'The Dam',x:50,y:15,k:'dam'},
  mb:{n:'Military Base',x:85,y:13,k:'base'},
  bc:{n:'Blackwood City',x:15,y:44,k:'city'},
  sp:{n:'Silent Peak',x:85,y:44,k:'city'},
  fair:{n:'Fairgrounds',x:15,y:80,k:'wild'},
  cargo:{n:'Cargo Ship',x:50,y:73,k:'cargo'},
  mine:{n:'The Mine',x:85,y:80,k:'wild'}
};
// The map's green arrows form one ring: Forest–Dam–Military Base–Silent Peak–Mine–Cargo Ship–Fairgrounds–Blackwood–Forest
const RING=['forest','dam','mb','sp','mine','cargo','fair','bc'];
const EDGES=RING.map((a,i)=>[a,RING[(i+1)%RING.length]]);
const ADJ={};for(const k in LOCS)ADJ[k]=[];EDGES.forEach(([a,b])=>{ADJ[a].push(b);ADJ[b].push(a)});
const LOC_RES={forest:'wood',mine:'metal',fair:'chip',dam:'water',mb:'mun'};
const LOC_CAP={forest:{2:6,3:8,4:10},mine:{2:6,3:8,4:10},fair:{2:6,3:8,4:10},dam:{2:7,3:9,4:11},mb:{2:6,3:8,4:10}};
const STACK_N={2:6,3:8,4:10};
const CITIES=['bc','sp'];
const CARGO_SPOTS=[{s:3,canned:1},{s:4,canned:2},{s:5,canned:3},{s:6,canned:4}];
const RAD_DAY=[1,2,2,2,3,3];
const ROOM_SCORE=[0,0,1,2,4,7,11,17];
const AIR_ROW=4,AIR_ROWS=3,AIR_MAX=AIR_ROW*AIR_ROWS;
const SEARCH_TILES=['water','canned','wood','metal','chip','mun','mun','algae','empty','empty'];

const ROOMS={
  command:{n:'Command Post',cap:3,up:1,std:1,pri:6,w:'Night · Events',t:'Once a turn: Overcome an Event for 2 fewer Materials/Munitions, or 1 fewer Supply.'},
  workshop:{n:'Workshop',cap:3,up:0,std:1,pri:5,w:'Night · Repair',t:'Once a turn: repair a piece of Equipment for 1 fewer Material.'},
  armory:{n:'Armory',cap:3,up:1,std:1,pri:4,w:'Night · Shelter',t:'Once a turn: take 4 Munitions.'},
  foundry:{n:'Foundry',cap:3,up:1,pri:7,w:'Night · Build',t:'Once a turn: build a Room for 2 fewer Materials.'},
  lodge:{n:'Hunting Lodge',cap:3,up:1,pri:6,w:'Day · Hunt',t:'Once a turn: +2 Meat after a successful Hunt.'},
  depot:{n:'Freight Depot',cap:2,up:1,pri:7,w:'Day · Cargo',t:'Once a turn: +1 Canned Goods when you visit the Cargo Ship.'},
  dock:{n:'Loading Dock',cap:3,up:1,pri:7,w:'Day · Cargo',t:'Once a turn: +2 Canned Goods at the Cargo Ship; its spaces are always available to you.'},
  cistern:{n:'Cistern',cap:2,up:1,pri:8,w:'Permanent',t:'Your Shelter produces 1 Water each turn (not stored).'},
  bunker:{n:'Blast Bunker',cap:4,up:2,pri:6,w:'Permanent',t:'Immune to Events that affect your Tribe (not Cave-in, Wildfire, Nomads, Lean Times, Thieves).'},
  scrapper:{n:'Scrap Yard',cap:2,up:0,pri:2,w:'Night · Shelter',t:'Once a turn: destroy 1 of your Equipment and take its Materials.'},
  scrubber:{n:'Scrubber',cap:3,up:1,pri:6,w:'Night · Radiation',t:'Once a turn: lower your Radioactivity by 1.'},
  sealdoor:{n:'Seal Door',cap:2,up:0,pri:6,w:'Night · Radiation',t:'Your Airlock absorbs 1 extra Radiation point, even if empty.'},
  barracks:{n:'Barracks',cap:4,up:1,pri:9,w:'Night · Shelter',t:'Once a turn: add 1 Survivor from the reserve to this Room (up to 8 in it).'},
  scouts:{n:'Scout Post',cap:3,up:1,pri:5,w:'Day · City',t:'Once per City: after a Search, draw 2 more Search tiles for free.'},
  lab:{n:'Salvage Lab',cap:3,up:1,pri:5,w:'Night · Shelter',t:'Once a turn: draw 2 Equipment tiles (broken).'},
  cache:{n:'Supply Cache',cap:2,up:0,pri:4,w:'Night · Shelter',t:'Once a turn: draw 1 Equipment tile (broken).'},
  intel:{n:'Intel Office',cap:2,up:0,pri:2,w:'Day · City',t:'Once a turn: look through one City Search pile.'},
  guard:{n:'Guard Post',cap:2,up:0,pri:4,w:'Day · Pressure',t:'Once a turn: one of your Strength-3 Heroes ignores one Pressure.'},
  mechanic:{n:'Mechanic Bay',cap:3,up:1,pri:5,w:'Night · Repair',t:'Once a turn: repair 1 Equipment for free.'},
  snares:{n:'Snare Line',cap:2,up:0,pri:4,w:'Day · Hunt',t:'Once a turn: +1 Meat after a successful Hunt.'},
  enforcer:{n:'Enforcer Hall',cap:2,up:0,pri:4,w:'Day · Pressure',t:'When you Pressure a Hero, you choose the tribute (not Munitions).'},
  forager:{n:'Forager Den',cap:2,up:0,pri:4,w:'Day · City',t:'Once per City: an Empty Cupboard gives +1 Wood and +1 Metal.'},
  rebuild:{n:'Rebuild Shop',cap:3,up:1,pri:6,w:'Night · Repair',t:'Once a turn: repair Equipment for 2 fewer Materials.'}
};
const STD_ROOMS=['command','workshop','armory'];
const ADV_ROOMS=Object.keys(ROOMS).filter(k=>!ROOMS[k].std);

// sym: matching-pair symbol id, side L/R.
const EQ={
  axe:{n:'Axe',cost:{wood:2,metal:1},sym:0,side:'L',t:'Forest: +2 Wood when you scavenge Wood.'},
  chainsaw:{n:'Chainsaw',cost:{wood:1,metal:2},sym:0,side:'R',t:'City: take 2 Wood when you visit.'},
  bow:{n:'Bow',cost:{wood:2,chip:1},sym:1,side:'L',t:'Forest: take 1 Meat when you visit.'},
  shotgun:{n:'Shotgun',cost:{metal:2,wood:1},sym:1,side:'R',t:'Hunting: +1 Strength.'},
  jerrycan:{n:'Jerrycan',cost:{metal:2,chip:1},sym:2,side:'L',t:'Dam: +1 Water when you scavenge Water.'},
  purifier:{n:'Purifier',cost:{chip:2,metal:1},sym:2,side:'R',t:'Mine: take 1 Water when you visit.'},
  card:{n:'Access Card',cost:{chip:2,wood:1},sym:3,side:'L',t:'Dam: open the filtration for free.'},
  crowbar:{n:'Crowbar',cost:{metal:2,wood:1},sym:3,side:'R',t:'Military Base: take 2 Microchips when you visit.'},
  ammobox:{n:'Ammo Box',cost:{metal:1,wood:1,chip:1},sym:4,side:'L',t:'Military Base: +2 Munitions when you scavenge Munitions.'},
  gear:{n:'Battle Gear',cost:{metal:2,chip:1},sym:4,side:'R',t:'Pressure suffered: -2.'},
  pickaxe:{n:'Pickaxe',cost:{wood:2,metal:1},sym:5,side:'L',t:'Mine: +2 Metal when you scavenge Metal.'},
  hacksaw:{n:'Hacksaw',cost:{metal:2,chip:1},sym:5,side:'R',t:'Cargo Ship: take 2 Metal when you visit.'},
  flashlight:{n:'Flashlight',cost:{chip:2,wood:1},sym:6,side:'L',t:'City: take 1 Survivor when you visit.'},
  thermal:{n:'Thermal Sensor',cost:{chip:2,metal:1},sym:6,side:'R',t:'Hunting: look through the Wild Game and choose your prey.'},
  backpack:{n:'Backpack',cost:{wood:1,chip:2},sym:7,side:'L',t:'Fairgrounds: +2 Microchips when you scavenge Microchips.'},
  detector:{n:'Metal Detector',cost:{metal:1,chip:1,wood:1},sym:7,side:'R',t:'Fairgrounds: take 1 Canned Goods when you visit.'},
  hook:{n:'Grappling Hook',cost:{metal:2,wood:1},sym:8,side:'L',t:'Cargo Ship: +1 Strength to reach a higher spot (only way onto spot 6).'},
  exo:{n:'Exoskeleton',cost:{metal:1,chip:2},sym:8,side:'R',t:'Move one Hero as far as you wish.'},
  trap:{n:'Bear Trap',cost:{wood:1,metal:2},sym:9,side:'L',t:'Hunting: +1 Strength.'},
  bat:{n:'Baseball Bat',cost:{wood:2,metal:1},sym:9,side:'R',t:'Pressure applied: +1.'}
};
const SYMS=['◆','●','▲','■','★','✚','⬟','⬢','♦','♥'];
const SYM_COL=['#e8c34a','#e0674a','#4ac7e8','#8fe86a','#e84ad0','#ffffff','#e89a4a','#6a8fe8','#4ae8b0','#c9a0ff'];

const EVENTS={
  wildfire:{n:'Wildfire',sp:3,cost:{water:3},t:'Each day: remove Wood from the Forest.'},
  cavein:{n:'Cave-in',sp:3,cost:{wood:2,metal:1},t:'Each day: remove Metal from the Mine.'},
  thieves:{n:'Thieves',sp:3,cost:{mun:3},t:'Each day: remove Microchips from the Fairgrounds.'},
  sandstorm:{n:'Sandstorm',sp:4,cost:{water:2,mun:2},t:'All Heroes act with Strength 3 (Pressure unchanged).'},
  lean:{n:'Lean Times',sp:4,cost:{meat:2,canned:2},t:'Each day: remove Wood, Metal and Microchips from the wilds.'},
  cloud:{n:'Radioactive Cloud',sp:4,cost:{water:2,metal:2},t:'Each day: every Shelter takes 2 more Radiation.'},
  rats:{n:'Rat Infestation',sp:3,cost:{mun:3},t:'Each day: every Shelter loses 1 Supply (or 1 Survivor).'},
  clan:{n:'Enemy Clan',sp:5,cost:{mun:4,wood:1},t:'Each day: every Shelter loses 2 Materials/Munitions (or 1 Survivor).'},
  cold:{n:'Cold Snap',sp:3,cost:{wood:3},t:'Each day: every Shelter loses 1 Survivor.'},
  nomads:{n:'Nomads',sp:3,cost:{canned:2,mun:1},t:'Each day: Search tiles are removed from each City.'},
  epi:{n:'Epizootic Disease',sp:3,cost:{meat:2,water:1},t:'Wild Game yields 1 less Meat.'},
  mutation:{n:'Animal Mutation',sp:4,cost:{meat:2,mun:2},t:'Wild Game has +1 Endurance.'}
};
const TRIBE_EVENTS=['sandstorm','cloud','rats','clan','cold','epi','mutation'];

const LEADERS=[
  {id:'crane',n:'Odessa Crane',age:64,locs:['forest','dam','mb','bc'],res:{canned:2,mun:1},eq:'jerrycan'},
  {id:'wren',n:'Tobias Wren',age:59,locs:['mine','cargo','fair','sp'],res:{wood:1,metal:1,chip:1},eq:'pickaxe'},
  {id:'okafor',n:'Imani Okafor',age:57,locs:['bc','sp','mb','forest'],res:{water:2,mun:1},eq:'flashlight'},
  {id:'sokolov',n:'Dmitri Sokolov',age:55,locs:['mine','forest','dam','cargo'],res:{metal:2,mun:1},eq:'bat'},
  {id:'marin',n:'Lucía Marín',age:52,locs:['fair','mb','bc','cargo'],res:{chip:2,canned:1},eq:'card'},
  {id:'tanabe',n:'Hiro Tanabe',age:49,locs:['sp','dam','mine','bc'],res:{wood:2,water:1},eq:'axe'},
  {id:'lindqvist',n:'Greta Lindqvist',age:46,locs:['cargo','mb','forest','sp'],res:{meat:2,mun:1},eq:'bow'},
  {id:'mensah',n:'Kofi Mensah',age:44,locs:['fair','mine','dam','mb'],res:{mun:3},eq:'ammobox'},
  {id:'raman',n:'Priya Raman',age:41,locs:['bc','forest','fair','cargo'],res:{chip:1,wood:1,canned:1},eq:'backpack'},
  {id:'hart',n:'Silas Hart',age:38,locs:['sp','mb','mine','dam'],res:{metal:1,water:1,canned:1},eq:'hacksaw'}
];

/* ---------- rng / helpers ---------- */
let _s=(Date.now()&0xffffffff)>>>0;
function seedRng(s){_s=s>>>0}
function rand(){_s=(_s+0x6D2B79F5)>>>0;let t=_s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const pickOne=a=>a[Math.floor(rand()*a.length)];
const sumObj=o=>Object.values(o).reduce((a,b)=>a+b,0);
const tot=(p,l)=>l.reduce((a,r)=>a+p.res[r],0);
const nSup=p=>tot(p,SUPS),nMat=p=>tot(p,MATS);
const survivors=p=>p.air+p.rooms.reduce((a,r)=>a+r.pop,0);
const isFull=r=>r.built&&r.pop>=ROOMS[r.k].cap;
const activeRooms=(p,k)=>p.rooms.filter(r=>r.k===k&&isFull(r));
const hasRoom=(p,k)=>activeRooms(p,k).length>0;
const canUse=(p,k)=>activeRooms(p,k).some(r=>!r.used);
function useRoom(p,k){const r=activeRooms(p,k).find(r=>!r.used);if(r){r.used=true;return true}return false}
const eqReady=(p,id)=>p.equip.find(e=>e.id===id&&e.fixed&&!e.used);
function useEq(p,id){const e=eqReady(p,id);if(e){e.used=true;return true}return false}
const costStr=c=>Object.entries(c).filter(([,v])=>v>0).map(([r,v])=>v+RI[r]).join(' ')||'free';
const canPay=(p,c)=>Object.entries(c).every(([r,v])=>p.res[r]>=v);
const short=(p,c)=>Object.entries(c).reduce((a,[r,v])=>a+Math.max(0,v-p.res[r]),0);

let G=null;
function log(msg,cls){if(!G)return;G.log.push({msg,cls,day:G.day});if(typeof UI!=='undefined'&&UI.log)UI.log(msg,cls)}
const order=()=>Array.from({length:G.n},(_,i)=>G.players[(G.first+i)%G.n]);
const pname=p=>p.name;
const U=()=>(typeof UI!=='undefined'?UI:null);
async function sleep(ms){const u=U();if(u&&u.sleep)await u.sleep(ms)}
function render(){const u=U();if(u&&u.render)u.render()}
async function fx(name,...a){const u=U();if(u&&u[name])return u[name](...a)}
function pop(target,text,kind){const u=U();if(u&&u.pop)u.pop(target,text,kind)}
const P_=p=>({p:p.id});const L_=l=>({loc:l});

/* ---------- game creation ---------- */
function makeGame(cfg){
  const n=cfg.players.length;
  G={n,day:0,phase:'setup',players:[],first:0,nextFirst:0,events:[],active:[],loc:{},algae:true,
     equipDeck:[],equipDisc:[],log:[],fx:{},cargoClaimed:false,over:false,humans:cfg.players.filter(x=>x.human).length,lastActor:-1,result:null};
  cfg.players.forEach((c,i)=>G.players.push({
    id:i,name:c.name||('Player '+(i+1)),human:!!c.human,color:COLORS[i],
    res:{wood:0,metal:0,chip:0,meat:0,water:0,canned:0,mun:0},
    heroes:[5,4,3,3].map(s=>({str:s,loc:null,state:'idle',spot:null,ap:0,hunted:false,unlocked:false})),
    rooms:[],air:0,rad:0,equip:[],events:[],caught:{},leader:null,cityBonus:{},report:[]}));
  G.events=shuffle(Object.keys(EVENTS)).slice(0,6);
  let deck=[];Object.keys(EQ).forEach(k=>{deck.push(k,k)});G.equipDeck=shuffle(deck);
  for(const k of Object.keys(LOC_RES))G.loc[k]={amt:0,game:[]};
  const game=[];for(let e=3;e<=7;e++)for(let i=0;i<6;i++)game.push({end:e});
  const gs=shuffle(game);let ix=0;
  for(const k of ['forest','mine','fair']){G.loc[k].game=gs.slice(ix,ix+STACK_N[n]);ix+=STACK_N[n]}
  for(const c of CITIES)G.loc[c]={search:[],disc:[],equip:[]};
  G.loc.cargo={};
  return G;
}

function drawEquipTile(){
  if(!G.equipDeck.length){G.equipDeck=shuffle(G.equipDisc);G.equipDisc=[]}
  return G.equipDeck.length?G.equipDeck.pop():null;
}
function drawEquipFor(p){
  for(let i=0;i<60;i++){
    const t=drawEquipTile();if(!t)return null;
    if(p.equip.some(e=>e.id===t)){G.equipDisc.push(t);continue}
    p.equip.push({id:t,fixed:false,used:false});log(`${pname(p)} draws ${EQ[t].n} (broken).`);return t;
  }
  return null;
}

/* ---------- setup ---------- */
async function handoff(p){
  if(G.humans>1&&p.human&&G.lastActor!==p.id){G.lastActor=p.id;const u=U();if(u&&u.handoff)await u.handoff(p)}
}
async function setupGame(){
  const u=U();
  const leaders=shuffle(LEADERS);
  let roomDeck=[];ADV_ROOMS.forEach(k=>{roomDeck.push(k,k)});roomDeck=shuffle(roomDeck);
  for(const p of G.players){
    const L2=[leaders.pop(),leaders.pop()];
    const six=[];while(six.length<6)six.push(roomDeck.pop());
    let leader,four;
    if(p.human){
      await handoff(p);
      const id=await u.chooseOne(`${p.name}: choose your Leader`,L2.map(l=>({id:l.id,label:`${l.n} (age ${l.age})`,sub:`Start: ${l.locs.map(x=>LOCS[x].n).join(', ')} · ${costStr(l.res)} · ${EQ[l.eq].n} (broken)`})),'Your Leader sets your starting locations, resources and equipment. The oldest Leader goes first.');
      leader=L2.find(l=>l.id===id);
      const sel=await u.chooseMany(`${p.name}: keep 4 of these 6 Advanced Rooms`,six.map((k,i)=>({id:String(i),label:ROOMS[k].n,sub:`${ROOMS[k].w} · ${ROOMS[k].cap} spaces · upkeep ${ROOMS[k].up} · ${ROOMS[k].t}`})),4);
      four=sel.map(i=>six[+i]);
    }else{
      leader=pickOne(L2);
      four=six.slice().sort((a,b)=>ROOMS[b].pri-ROOMS[a].pri||rand()-.5).slice(0,4);
    }
    p.leader=leader;
    p.rooms=[...STD_ROOMS,...four].map(k=>({k,built:false,pop:0,used:false}));
    // free room
    let ri;
    if(p.human){
      const id=await u.chooseOne(`${p.name}: build one Room for free`,p.rooms.map((r,i)=>({id:String(i),label:ROOMS[r.k].n,sub:`${ROOMS[r.k].w} · ${ROOMS[r.k].cap} spaces · upkeep ${ROOMS[r.k].up} · ${ROOMS[r.k].t}`})),'You start with 4 Survivors. A Room only works when every space is filled.');
      ri=+id;
    }else{
      ri=p.rooms.map((r,i)=>({i,s:ROOMS[r.k].pri-(ROOMS[r.k].cap>3?3:0)+rand()})).sort((a,b)=>b.s-a.s)[0].i;
    }
    p.rooms[ri].built=true;
    const cap=ROOMS[p.rooms[ri].k].cap;
    let inRoom=Math.min(cap,4);
    if(p.human&&inRoom>0){
      inRoom=await u.amount({title:'Starting Survivors',text:`You have 4 Survivors. How many go in ${ROOMS[p.rooms[ri].k].n} (${cap} spaces)? The rest wait in the Airlock.`,min:0,max:Math.min(cap,4),def:Math.min(cap,4)});
    }
    p.rooms[ri].pop=inRoom;p.air=4-inRoom;
    for(const r in leader.res)p.res[r]+=leader.res[r];
    p.equip.push({id:leader.eq,fixed:false,used:false});
  }
  // first player: oldest leader
  G.first=G.players.slice().sort((a,b)=>b.leader.age-a.leader.age)[0].id;G.nextFirst=G.first;
  log(`${G.players[G.first].name} has the oldest Leader and starts as First Player.`);
  // hero placement in turn order
  for(const p of order()){
    const free=p.leader.locs.slice();
    for(const h of p.heroes){
      let loc;
      if(p.human){
        await handoff(p);
        loc=await u.pickLocation(p,free,`${p.name}: place your Strength ${h.str} Hero on one of the highlighted Locations`);
      }else{
        const pref=free.slice().sort((a,b)=>(b==='cargo'&&h.str>=4?3:0)-(a==='cargo'&&h.str>=4?3:0)+(rand()-.5));
        loc=pref[0];
      }
      h.loc=loc;free.splice(free.indexOf(loc),1);render();
    }
  }
}

/* ---------- dawn ---------- */
function dawn(){
  G.phase='dawn';G.cargoClaimed=false;G.fx={sandstorm:false,epi:false,mut:false};G.algae=true;
  for(const k of Object.keys(LOC_RES))G.loc[k].amt=LOC_CAP[k][G.n];
  for(const c of CITIES){
    const s=G.loc[c];
    const t=shuffle(SEARCH_TILES),keep=STACK_N[G.n];
    s.search=t.slice(0,keep);s.disc=t.slice(keep);
    G.equipDisc.push(...s.equip);s.equip=[];
    for(let i=0;i<3;i++){const e=drawEquipTile();if(e)s.equip.push(e)}
  }
  for(const p of G.players){p.cityBonus={};p.equip.forEach(e=>e.used=false);p.rooms.forEach(r=>r.used=false);p.report=[];
    p.heroes.forEach(h=>{h.state='idle';h.spot=null;h.ap=0})}
  log(`— Day ${G.day} · Dawn: the wastelands are replenished.`,'phase');
}

/* ---------- survivors / radiation ---------- */
function removeFrom(p,where){if(where==='air')p.air--;else p.rooms[where].pop--}
async function chooseRemoval(p){
  const opts=[];
  if(p.air>0)opts.push({id:'air',label:`Airlock (${p.air})`});
  p.rooms.forEach((r,i)=>{if(r.pop>0)opts.push({id:String(i),label:`${ROOMS[r.k].n} (${r.pop}/${ROOMS[r.k].cap})`+(isFull(r)?' — ability active':'')})});
  if(!opts.length)return null;
  if(opts.length===1)return opts[0].id;
  if(p.human)return await U().chooseOne(`${p.name}: lose a Survivor — from where?`,opts);
  if(p.air>0)return 'air';
  const rs=p.rooms.map((r,i)=>({r,i})).filter(x=>x.r.pop>0).sort((a,b)=>(isFull(a.r)-isFull(b.r))||(ROOMS[a.r.k].pri-ROOMS[b.r.k].pri));
  return String(rs[0].i);
}
async function loseSurvivors(p,n,why){
  let lost=0;
  for(let i=0;i<n;i++){
    const w=await chooseRemoval(p);if(w===null)break;
    removeFrom(p,w==='air'?'air':+w);lost++;
  }
  if(lost){pop(P_(p),`-${lost}👤`,'surv-');log(`${pname(p)} loses ${lost} Survivor${lost>1?'s':''}${why?' ('+why+')':''}.`,'bad');p.report.push(`Lost ${lost} Survivor${lost>1?'s':''}${why?' — '+why:''}.`)}
  return lost;
}
async function addRad(p,n,why){
  if(n<=0)return;
  const t=p.rad-n;
  if(t<-11){const extra=-11-t;p.rad=-11;await loseSurvivors(p,extra,'radiation overflow')}else p.rad=t;
}
function lowerRad(p,n){p.rad=Math.min(3,p.rad+n)}
async function addSurvivor(p,why){
  const opts=[];
  if(p.air<AIR_MAX)opts.push({id:'air',label:'Airlock'});
  p.rooms.forEach((r,i)=>{if(r.built&&r.pop<ROOMS[r.k].cap)opts.push({id:String(i),label:`${ROOMS[r.k].n} (${r.pop}/${ROOMS[r.k].cap})`})});
  if(!opts.length){log(`${pname(p)} has no room for a new Survivor.`);return false}
  let w;
  if(opts.length===1)w=opts[0].id;
  else if(p.human)w=await U().chooseOne(`${p.name}: place the new Survivor`,opts);
  else{
    const near=p.rooms.map((r,i)=>({r,i})).filter(x=>x.r.built&&x.r.pop===ROOMS[x.r.k].cap-1);
    w=near.length?String(near[0].i):(p.air<AIR_MAX?'air':opts[0].id);
  }
  if(w==='air')p.air++;else p.rooms[+w].pop++;
  log(`${pname(p)} gains a Survivor.`);pop(P_(p),'+1👤','surv');
  return true;
}

/* ---------- movement ---------- */
function effStr(p,h){return(G.fx.sandstorm&&!hasRoom(p,'bunker'))?Math.min(3,h.str):h.str}
function cargoOptions(p,h){
  const s=effStr(p,h),hook=!!eqReady(p,'hook'),dock=canUse(p,'dock'),out=[];
  CARGO_SPOTS.forEach((sp,i)=>{
    const needHook=sp.s===s+1;
    if(!(sp.s===s||(hook&&needHook)))return;
    const occ=G.players.some(q=>q.heroes.some(x=>x.loc==='cargo'&&x.state==='act'&&x.spot===i));
    if(occ&&!(dock&&sp.s===s))return;
    out.push({i,hook:needHook,occ});
  });
  return out;
}
function destinations(p,h){
  const exo=!!eqReady(p,'exo'),maxD=exo?9:2;
  const dist={[h.loc]:0},q=[h.loc];
  while(q.length){const u=q.shift();if(dist[u]>=maxD)continue;for(const v of ADJ[u])if(!(v in dist)){dist[v]=dist[u]+1;q.push(v)}}
  const out=[];
  for(const loc in dist){
    if(loc===h.loc)continue;
    if(p.heroes.some(o=>o!==h&&o.loc===loc))continue;
    if(loc==='cargo'&&cargoOptions(p,h).length===0)continue;
    out.push({loc,dist:dist[loc],exo:dist[loc]>2});
  }
  return out;
}

/* ---------- day ---------- */
async function dayPhase(){
  G.phase='day';
  const evId=G.events[G.day-1];G.active.push(evId);
  log(`Convoy Event revealed: ${EVENTS[evId].n}.`,'event');
  const u=U();if(G.humans>0&&u&&u.showEvent)await u.showEvent(evId);
  await applyEvents();
  render();
  for(let round=0;round<4;round++)for(const p of order())await heroTurn(p);
  for(const p of G.players)for(const h of p.heroes){h.state='idle';h.spot=null;h.ap=0}
  G.first=G.nextFirst;
  render();
}
function removeLoc(k,n){const l=G.loc[k];const r=Math.min(n,l.amt);l.amt-=r;if(r)log(`${LOCS[k].n} loses ${r} ${RN[LOC_RES[k]]}.`,'event')}
async function chooseSupplyToLose(p,pool,title){
  if(pool.length===1)return pool[0];
  if(p.human)return await U().chooseOne(title,pool.map(r=>({id:r,label:`${RI[r]} ${RN[r]} (${p.res[r]})`})));
  return pool.slice().sort((a,b)=>resValue(p,a)-resValue(p,b))[0];
}
async function applyEvents(){
  for(const id of G.active.slice()){
    switch(id){
      case'wildfire':removeLoc('forest',G.n);break;
      case'cavein':removeLoc('mine',G.n);break;
      case'thieves':removeLoc('fair',G.n);break;
      case'lean':['forest','mine','fair'].forEach(k=>removeLoc(k,G.n-1));break;
      case'nomads':for(const c of CITIES){const s=G.loc[c];const k=Math.min(G.n,s.search.length);for(let i=0;i<k;i++)s.disc.push(s.search.pop())}log('Nomads strip the Cities of Search tiles.','event');break;
      case'sandstorm':G.fx.sandstorm=true;break;
      case'epi':G.fx.epi=true;break;
      case'mutation':G.fx.mut=true;break;
      case'cloud':for(const p of order()){if(hasRoom(p,'bunker')){log(`${pname(p)}'s bunker shrugs off the cloud.`);continue}await addRad(p,2,'cloud');pop(P_(p),'☢ +2','rad')}log('The Radioactive Cloud passes over every Shelter.','event');break;
      case'rats':for(const p of order()){
        if(hasRoom(p,'bunker'))continue;
        const pool=SUPS.filter(r=>p.res[r]>0);
        if(pool.length){const r=await chooseSupplyToLose(p,pool,`${p.name}: rats! Lose 1 Supply`);p.res[r]--;log(`Rats eat ${pname(p)}'s ${RN[r]}.`,'event');pop(P_(p),`-1${RI[r]}`,'loss');p.report.push(`Rats ate 1 ${RN[r]}.`)}
        else await loseSurvivors(p,1,'rats');
      }break;
      case'clan':for(const p of order()){
        if(hasRoom(p,'bunker'))continue;
        const pool=()=>[...MATS,'mun'].filter(r=>p.res[r]>0);
        if(tot(p,[...MATS,'mun'])>=2){for(let i=0;i<2;i++){const r=await chooseSupplyToLose(p,pool(),`${p.name}: Enemy Clan raid! Lose a Material/Munition (${i+1}/2)`);p.res[r]--}log(`The Enemy Clan raids ${pname(p)} (-2 tokens).`,'event');pop(P_(p),'-2 raided','loss');p.report.push('Enemy Clan raided 2 tokens.')}
        else await loseSurvivors(p,1,'Enemy Clan');
      }break;
      case'cold':for(const p of order()){if(hasRoom(p,'bunker'))continue;await loseSurvivors(p,1,'Cold Snap')}break;
    }
  }
}
async function heroTurn(p){
  const idle=p.heroes.map((h,hi)=>({hi,h,dests:h.state==='idle'?destinations(p,h):[]})).filter(o=>o.h.state==='idle');
  if(!idle.length)return;
  await fx('turn',p,'day');
  const mv=idle.filter(o=>o.dests.length);
  if(!mv.length){idle[0].h.state='act';log(`${pname(p)}'s Hero is stuck and stays put.`);return}
  let ch;
  if(p.human){await handoff(p);ch=await U().pickMove(p,mv.map(o=>({hi:o.hi,str:o.h.str,from:o.h.loc,dests:o.dests})))}
  else ch=aiChooseMove(p);
  const h=p.heroes[ch.hi];
  const d=destinations(p,h).find(x=>x.loc===ch.loc);
  if(d&&d.exo)useEq(p,'exo');
  await arrive(p,h,ch.loc);
  if(!p.human)await sleep(260);
  await fx('turnEnd',p,'day');
}
async function arrive(p,h,loc){
  const from=h.loc;
  log(`${pname(p)} moves a Strength ${h.str} Hero: ${LOCS[from].n} → ${LOCS[loc].n}.`);
  await fx('move',p,h,from,loc);
  h.loc=loc;h.state='act';h.spot=null;h.hunted=false;h.unlocked=false;
  if(loc==='cargo'){
    const opts=cargoOptions(p,h);let o=opts[0];
    if(opts.length>1){
      if(p.human){const id=await U().chooseOne(`${p.name}: pick a Cargo Ship spot`,opts.map(x=>({id:String(x.i),label:`Spot ${CARGO_SPOTS[x.i].s}: ${CARGO_SPOTS[x.i].canned}🥫 + 1 Survivor`+(x.hook?' (Grappling Hook)':'')+(x.occ?' (occupied — Loading Dock)':'')})));o=opts.find(x=>String(x.i)===id)}
      else o=opts.slice().sort((a,b)=>CARGO_SPOTS[b.i].s-CARGO_SPOTS[a.i].s)[0];
    }
    h.spot=o.i;
    if(o.hook)useEq(p,'hook');
    if(!G.cargoClaimed){G.cargoClaimed=true;G.nextFirst=p.id;log(`${pname(p)} takes the First Player token for the coming night.`,'good');pop(L_('cargo'),'1st player','good')}
  }
  render();
  await sleep(380);
  await applyPressure(p,h);
  await visitEffects(p,h);
  await actionPhase(p,h);
  render();
}
async function applyPressure(p,h){
  const targets=[];
  for(const q of order())if(q!==p)for(const d of q.heroes)if(d.loc===h.loc&&d.state==='act'&&d.str<h.str)targets.push({q,d});
  for(const{q,d}of targets){
    let pts=h.str-d.str;
    await fx('pressure',p,q,h.loc,pts);
    if(eqReady(p,'bat')){useEq(p,'bat');pts++}
    if(pts>0&&eqReady(q,'gear')){useEq(q,'gear');pts=Math.max(0,pts-2);log(`${pname(q)}'s Battle Gear absorbs 2 Pressure.`)}
    if(pts>0&&d.str===3&&canUse(q,'guard')){useRoom(q,'guard');pts=0;log(`${pname(q)}'s Guard Post turns the Pressure aside.`)}
    if(pts>0&&q.res.mun>0){
      let m=0;
      if(q.human)m=await U().amount({title:`${q.name}: Pressure!`,text:`${p.name}'s Strength ${h.str} Hero presses your Strength ${d.str} Hero for ${pts} tribute. Spend Munitions to reduce it by 1 each?`,min:0,max:Math.min(pts,q.res.mun),def:Math.min(pts,q.res.mun)});
      else m=Math.min(pts,q.res.mun);
      if(m){q.res.mun-=m;pts-=m;log(`${pname(q)} spends ${m}${RI.mun} to resist Pressure.`);pop(L_(h.loc),`-${m}${RI.mun}`,'loss')}
    }
    const taken=[];
    for(let i=0;i<pts;i++){
      const pool=RES_ALL.filter(r=>r!=='mun'&&q.res[r]>0);
      if(!pool.length)break;
      let r;
      if(hasRoom(p,'enforcer')){
        if(p.human)r=await U().chooseOne(`${p.name}: choose your tribute from ${q.name}`,pool.map(x=>({id:x,label:`${RI[x]} ${RN[x]} (${q.res[x]})`})));
        else r=pool.slice().sort((a,b)=>resValue(p,b)-resValue(p,a))[0];
      }else{
        if(q.human)r=await U().chooseOne(`${q.name}: pay tribute to ${p.name}`,pool.map(x=>({id:x,label:`${RI[x]} ${RN[x]} (${q.res[x]})`})),'Give 1 Supply or 1 Material.');
        else r=pool.slice().sort((a,b)=>resValue(q,a)-resValue(q,b))[0];
      }
      q.res[r]--;p.res[r]++;taken.push(r);
    }
    if(taken.length){log(`${pname(p)} pressures ${pname(q)} and takes ${taken.map(r=>RI[r]).join('')}.`,'bad');pop(L_(h.loc),`${pname(q)} → ${pname(p)}: ${taken.map(r=>RI[r]).join('')}`,'hit')}
    else log(`${pname(p)} pressures ${pname(q)} — nothing gained.`);
    render();
    await sleep(450);
  }
}
async function visitEffects(p,h){
  const L=h.loc;
  const table={forest:['bow','meat',1],mine:['purifier','water',1],fair:['detector','canned',1],mb:['crowbar','chip',2],cargo:['hacksaw','metal',2]};
  const t=table[L];
  if(t&&useEq(p,t[0])){p.res[t[1]]+=t[2];log(`${pname(p)}'s ${EQ[t[0]].n} yields ${t[2]}${RI[t[1]]}.`);pop(L_(L),`${EQ[t[0]].n} +${t[2]}${RI[t[1]]}`,'gain')}
  if(CITIES.includes(L)){
    if(useEq(p,'chainsaw')){p.res.wood+=2;log(`${pname(p)}'s Chainsaw yields 2${RI.wood}.`)}
    if(useEq(p,'flashlight')){await addSurvivor(p,'flashlight')}
  }
  if(L==='cargo'){
    const sp=CARGO_SPOTS[h.spot];
    p.res.canned+=sp.canned;log(`${pname(p)} loads ${sp.canned}${RI.canned} at the Cargo Ship.`);pop(L_('cargo'),`+${sp.canned}${RI.canned} +1👤`,'gain');
    if(canUse(p,'depot')){useRoom(p,'depot');p.res.canned++;log('Freight Depot: +1🥫.')}
    if(canUse(p,'dock')){useRoom(p,'dock');p.res.canned+=2;log('Loading Dock: +2🥫.')}
    await addSurvivor(p,'cargo');
  }
}

/* ---------- day actions ---------- */
function resValue(p,r){
  const s=p.res[r];
  // supplies are worth more while the Tribe cannot yet cover tonight's upkeep and recruiting
  const need=(()=>{const n=supplyNeeds(p);return n.rows+n.rooms+3})();
  const sup=nSup(p),boost=sup<need?1+(need-sup)/need:1;
  switch(r){
    case'canned':return 1.5*boost*(s>10?.5:1);
    case'meat':return 1.2*boost*(s>8?.5:1);
    case'water':return 1.1*boost*(s>6?.5:1);
    case'mun':return s>=5?.25:s>=3?.5:.85;
    case'chip':return s===0?2.2:(s>=8?.5:s>=5?.8:1.1);
    default:return s>=8?.5:s>=5?.8:1.1;
  }
}
function huntInfo(p,h){
  const loc=G.loc[h.loc];
  if(!loc.game||!loc.game.length||h.hunted)return null;
  const mut=G.fx.mut&&!hasRoom(p,'bunker')?1:0,epi=G.fx.epi&&!hasRoom(p,'bunker')?1:0;
  const gear=['shotgun','trap'].filter(id=>eqReady(p,id)).length;
  const tiles=eqReady(p,'thermal')?loc.game.map((t,i)=>i):[0];
  let best=null;
  for(const i of tiles){
    const t=loc.game[i];const end=t.end+mut;
    const yld=Math.max(0,(t.end-2)+(p.caught[t.end]||0)-epi);
    const m=Math.min(p.res.mun,end);
    const need=Math.max(0,end-m-gear);
    const ok=need<=h.ap;
    const bonus=(canUse(p,'lodge')?2:0)+(canUse(p,'snares')?1:0);
    const info={i,end,yld,bonus,minNeed:need,ok,gear};
    if(ok&&(!best||(info.yld+info.bonus)>(best.yld+best.bonus)))best=info;
    if(!best&&i===tiles[0])best=info;
  }
  return best;
}
async function doHunt(p,h,idx,m){
  const loc=G.loc[h.loc];const t=loc.game[idx];
  const mut=G.fx.mut&&!hasRoom(p,'bunker')?1:0,epi=G.fx.epi&&!hasRoom(p,'bunker')?1:0;
  const end=t.end+mut;m=Math.min(m,p.res.mun,end);
  let need=end-m;
  let gearUsed=0;
  for(const id of['shotgun','trap'])if(need>h.ap&&eqReady(p,id)||(need>0&&eqReady(p,id)&&need>0)){if(need>0&&useEq(p,id)){need--;gearUsed++}}
  need=Math.max(0,need);
  if(need>h.ap)return false;
  if(idx>0&&!useEq(p,'thermal'))return false;
  if(idx===0&&eqReady(p,'thermal')&&loc.game.length>1&&false){}
  h.ap-=need;p.res.mun-=m;
  loc.game.splice(idx,1);
  const yld=Math.max(0,(t.end-2)+(p.caught[t.end]||0)-epi);
  p.caught[t.end]=(p.caught[t.end]||0)+1;
  let gain=yld;
  if(useRoom(p,'lodge'))gain+=2;
  if(useRoom(p,'snares'))gain+=1;
  p.res.meat+=gain;h.hunted=true;
  log(`${pname(p)} hunts an Endurance-${t.end} beast (${need} AP${m?`, ${m}${RI.mun}`:''}) and gets ${gain}${RI.meat}.`,'good');
  pop(L_(h.loc),`+${gain}${RI.meat}`,'hunt');
  return true;
}
async function doScav(p,h,n){
  const res=LOC_RES[h.loc],loc=G.loc[h.loc];
  n=Math.min(n,h.ap,loc.amt);if(n<=0)return;
  h.ap-=n;loc.amt-=n;p.res[res]+=n;
  const bon={forest:['axe',2],mine:['pickaxe',2],fair:['backpack',2],dam:['jerrycan',1],mb:['ammobox',2]}[h.loc];
  let extra=0;
  if(bon&&eqReady(p,bon[0])){const x=Math.min(bon[1],loc.amt);if(x>0){useEq(p,bon[0]);loc.amt-=x;p.res[res]+=x;extra=x}}
  log(`${pname(p)} gathers ${n+extra}${RI[res]} at ${LOCS[h.loc].n}${extra?` (${EQ[bon[0]].n} +${extra})`:''}.`);
  pop(L_(h.loc),`+${n+extra}${RI[res]}`,'gain');
}
async function doSearchOnce(p,h,free){
  const c=G.loc[h.loc];if(!c.search.length)return false;
  if(!free)h.ap--;
  const t=c.search.shift();c.disc.push(t);
  if(t==='empty'){
    log(`${pname(p)} finds an empty cupboard.`);pop(L_(h.loc),'empty','loss');
    if(hasRoom(p,'forager')&&!p.cityBonus['f'+h.loc]){p.cityBonus['f'+h.loc]=1;p.res.wood++;p.res.metal++;log('Forager Den: +1🪵 +1🔩.')}
  }else if(t==='algae'){lowerRad(p,1);log(`${pname(p)} finds Algae Capsules (radiation −1).`,'good');pop(L_(h.loc),'🌿 ☢−1','good')}
  else{p.res[t]++;log(`${pname(p)} finds ${RI[t]} ${RN[t]}.`);pop(L_(h.loc),`+1${RI[t]}`,'gain')}
  return true;
}
async function doSearch(p,h){
  if(!await doSearchOnce(p,h,false))return;
  if(hasRoom(p,'scouts')&&!p.cityBonus['s'+h.loc]){p.cityBonus['s'+h.loc]=1;log('Scout Post: 2 free Search tiles.');await doSearchOnce(p,h,true);await doSearchOnce(p,h,true)}
}
function doSalvage(p,h,idx){
  const c=G.loc[h.loc];const t=c.equip.splice(idx,1)[0];h.ap--;
  p.equip.push({id:t,fixed:false,used:false});log(`${pname(p)} salvages a broken ${EQ[t].n}.`);pop(L_(h.loc),`+${EQ[t].n}`,'gain');
}
function listActions(p,h){
  const A=[];if(h.ap<=0)return A;
  const L=h.loc,ap=h.ap,k=LOCS[L].k;
  const res=LOC_RES[L],loc=G.loc[L];
  const add=a=>A.push(a);
  const needChip=L==='dam'&&!h.unlocked;
  if(k==='dam'&&!h.unlocked&&loc.amt>0&&(eqReady(p,'card')||p.res.chip>0))
    add({id:'unlock',kind:'unlock',ap:0,v:9,label:'Open the filtration',sub:eqReady(p,'card')?'Access Card — free':'Spend 1💾 (free action)',run:async()=>{if(useEq(p,'card')){}else p.res.chip--;h.unlocked=true;log(`${pname(p)} opens the Dam filtration.`)}});
  if(res&&loc.amt>0&&!(k==='dam'&&!h.unlocked)){
    const vv=resValue(p,res);
    const n=Math.min(ap,loc.amt);
    add({id:'s1',kind:'scav',ap:1,v:vv,label:`Gather 1 ${RI[res]} ${RN[res]}`,sub:'1 AP',run:()=>doScav(p,h,1)});
    if(n>1)add({id:'sN',kind:'scav',ap:n,v:vv*n,label:`Gather ${n} ${RI[res]} ${RN[res]}`,sub:`${n} AP`,run:()=>doScav(p,h,n)});
  }
  if(k==='base'&&G.algae){
    add({id:'algae',kind:'algae',ap:1,v:p.rad<3?(G.day>=3?1.7:1.2):0,label:'Harvest Anti-Radiation Algae',sub:'1 AP · radiation −1',run:async()=>{h.ap--;G.algae=false;lowerRad(p,1);log(`${pname(p)} harvests the Algae (radiation −1).`);pop(L_(h.loc),'🌿 ☢−1','good')}});
  }
  if(k==='wild'){
    const hi=huntInfo(p,h);
    if(hi&&hi.ok){
      const gearCount=hi.gear;
      add({id:'hunt',kind:'hunt',ap:Math.max(1,hi.minNeed),hi,v:((hi.yld+hi.bonus)*resValue(p,'meat')-Math.min(p.res.mun,hi.end)*resValue(p,'mun')*.6)/Math.max(1,hi.minNeed)||0,
        label:`Hunt (Endurance ${hi.end}${G.fx.mut?' ▲':''})`,sub:`Yield ≈ ${hi.yld+hi.bonus}${RI.meat} · costs ${hi.end} AP, minus 1 per ${RI.mun} spent`+(gearCount?` · Strength gear −${gearCount}`:''),
        run:async()=>{
          let idx=0;
          if(eqReady(p,'thermal')&&loc.game.length>1){
            if(p.human){const id=await U().chooseOne(`${p.name}: Thermal Sensor — choose your prey`,loc.game.map((t,i)=>({id:String(i),label:`Endurance ${t.end+(G.fx.mut?1:0)} → ${Math.max(0,t.end-2+(p.caught[t.end]||0)-(G.fx.epi?1:0))}${RI.meat}`+(i===0?' (top)':'')})));idx=+id}
            else{let b=-1,bi=0;loc.game.forEach((t,i)=>{const y=Math.max(0,t.end-2+(p.caught[t.end]||0))/Math.max(1,t.end+(G.fx.mut?1:0)-Math.min(p.res.mun,3));if(y>b&&(t.end+(G.fx.mut?1:0)-Math.min(p.res.mun,t.end))<=h.ap){b=y;bi=i}});idx=bi}
          }
          const t=loc.game[idx];const mutv=G.fx.mut&&!hasRoom(p,'bunker')?1:0;const end=t.end+mutv;
          const gear=['shotgun','trap'].filter(id=>eqReady(p,id)).length;
          const minM=Math.max(0,end-gear-h.ap);
          let m;
          if(p.human){
            const maxM=Math.min(p.res.mun,end);
            if(maxM<minM){log('Not enough Action Points or Munitions for that beast.');return}
            m=maxM>minM?await U().amount({title:'Hunt: spend Munitions?',text:`Endurance ${end}. Each ${RI.mun} spent reduces it by 1; remaining cost is paid in Action Points (you have ${h.ap}).`,min:minM,max:maxM,def:minM}):minM;
          }else{
            m=minM;
            if(p.res.mun>=5)m=Math.min(p.res.mun,end,Math.max(minM,Math.min(2,end-1)));
          }
          if(idx>0){ /* thermal pick: handled in doHunt via useEq */ }
          await doHunt(p,h,idx,m);
        }});
    }
  }
  if(k==='city'){
    if(loc.search.length)add({id:'search',kind:'search',ap:1,v:.85,label:'Draw a Search tile',sub:`1 AP · ${loc.search.length} left in the pile`,run:()=>doSearch(p,h)});
    loc.equip.forEach((t,i)=>{
      if(p.equip.some(e=>e.id===t))return;
      add({id:'salv'+i,kind:'salv',ap:1,v:p.equip.filter(e=>!e.fixed).length>=3?.3:(G.day>=5?.4:.95),label:`Salvage ${EQ[t].n}`,sub:`1 AP · arrives broken · repair ${costStr(EQ[t].cost)}`,run:async()=>doSalvage(p,h,G.loc[L].equip.indexOf(t))});
    });
  }
  if(canUse(p,'intel')&&p.human)add({id:'peek',kind:'peek',ap:0,v:0,label:'Look through a Search pile',sub:'Intel Office · free',run:async()=>{
    const c=await U().chooseOne('Which City pile?',CITIES.map(x=>({id:x,label:LOCS[x].n})));
    useRoom(p,'intel');await U().showPile(c,G.loc[c].search)}});
  return A;
}
async function actionPhase(p,h){
  h.ap=effStr(p,h);
  if(h.loc==='cargo'){h.ap=0;return}
  let guard=0;
  while(guard++<40){
    const acts=listActions(p,h);
    render();
    if(!acts.length)break;
    let a;
    if(p.human)a=await U().pickAction(p,h,acts);else a=aiPickAction(p,h,acts);
    if(!a||a.id==='done')break;
    await a.run();
    if(!p.human)await sleep(180);
  }
  h.ap=0;
}

/* ---------- AI: day ---------- */
function aiPickAction(p,h,acts){
  const cand=acts.filter(a=>a.v>0.3||a.kind==='unlock');
  if(!cand.length)return null;
  cand.sort((a,b)=>(b.v/Math.max(1,b.kind==='scav'&&b.id==='sN'?b.ap:1))-(a.v/Math.max(1,a.kind==='scav'&&a.id==='sN'?a.ap:1)));
  // prefer bulk scavenging when it is the best per-AP option
  const best=cand[0];
  if(best.kind==='scav'){const bulk=cand.find(a=>a.kind==='scav'&&a.id==='sN');if(bulk)return bulk}
  return best;
}
function locValue(p,h,L,str,here){
  const k=LOCS[L].k,res=LOC_RES[L],loc=G.loc[L];let v=0;
  if(k==='cargo'){
    const o=cargoOptions(p,h);if(!o.length)return -5;
    const best=o.map(x=>CARGO_SPOTS[x.i].canned*resValue(p,'canned')+2.2).sort((a,b)=>b-a)[0];
    v=best+(G.cargoClaimed?0:.7)+(canUse(p,'depot')?1.4:0)+(canUse(p,'dock')?2.8:0)+(eqReady(p,'hacksaw')?2:0);
    return v;
  }
  if(k==='base'){
    const n=Math.min(str,loc.amt);
    v=n*resValue(p,'mun')+(G.algae&&p.rad<3?1.3:0)+(eqReady(p,'crowbar')?2.2:0);
    if(eqReady(p,'ammobox')&&n>0)v+=Math.min(2,loc.amt-n)*resValue(p,'mun');
    return v;
  }
  if(k==='dam'){
    if(!eqReady(p,'card')&&p.res.chip<1)return 0;
    const n=Math.min(str,loc.amt);
    return n*resValue(p,'water')-(eqReady(p,'card')?0:resValue(p,'chip'))+(eqReady(p,'jerrycan')&&n>0?Math.min(1,loc.amt-n):0);
  }
  if(k==='wild'){
    const n=Math.min(str,loc.amt);let sc=n*resValue(p,res);
    const bon={forest:'axe',mine:'pickaxe',fair:'backpack'}[L];
    if(bon&&eqReady(p,bon)&&n>0)sc+=Math.min(2,loc.amt-n)*resValue(p,res);
    let hv=0;
    if(loc.game.length){
      const t=loc.game[0],end=t.end+(G.fx.mut?1:0),y=Math.max(0,t.end-2+(p.caught[t.end]||0)-(G.fx.epi?1:0))+(canUse(p,'lodge')?2:0)+(canUse(p,'snares')?1:0);
      const m=Math.min(p.res.mun,Math.min(end,2)),need=Math.max(1,end-m);
      if(need<=str){hv=y*resValue(p,'meat')-m*.5+(str-need)*resValue(p,res)*.8}
    }
    v=Math.max(sc,hv);
    const vis={forest:['bow','meat',1],mine:['purifier','water',1],fair:['detector','canned',1]}[L];
    if(vis&&eqReady(p,vis[0]))v+=resValue(p,vis[1]);
    return v;
  }
  if(k==='city'){
    const n=Math.min(str,loc.search.length+loc.equip.length);
    v=n*.8+(eqReady(p,'chainsaw')?2:0)+(eqReady(p,'flashlight')?2.2:0)+(hasRoom(p,'scouts')&&!p.cityBonus['s'+L]?1.5:0);
    return v;
  }
  return 0;
}
function aiChooseMove(p){
  let best=null;
  for(let hi=0;hi<p.heroes.length;hi++){
    const h=p.heroes[hi];if(h.state!=='idle')continue;
    for(const d of destinations(p,h)){
      const str=effStr(p,h);let v=locValue(p,h,d.loc,str,[]);
      for(const q of G.players){
        if(q===p)continue;
        for(const x of q.heroes)if(x.loc===d.loc&&x.state==='act'&&x.str<h.str){
          const pts=h.str-x.str,avail=RES_ALL.filter(r=>r!=='mun').reduce((a,r)=>a+q.res[r],0);
          v+=Math.min(pts,avail)*(q.res.mun>=pts?.35:.9);
        }
      }
      if(d.exo)v-=.4;
      v+=rand()*.35;
      if(!best||v>best.v)best={hi,loc:d.loc,v};
    }
  }
  return best;
}

/* ---------- night ---------- */
function applyEventDiscount(p,cost){
  const opts=[];
  const sup=SUPS.filter(r=>cost[r]>0);
  if(sup.length){const c={...cost};const r=sup.sort((a,b)=>(c[b]-p.res[b])-(c[a]-p.res[a]))[0];c[r]--;opts.push(c)}
  const mm=[...MATS,'mun'];
  if(mm.some(r=>cost[r]>0)){const c={...cost};for(let k=0;k<2;k++){const rs=mm.filter(r=>c[r]>0).sort((a,b)=>(c[b]-p.res[b])-(c[a]-p.res[a]));if(!rs.length)break;c[rs[0]]--}opts.push(c)}
  if(!opts.length)return null;
  opts.sort((a,b)=>(short(p,a)-short(p,b))||(sumObj(a)-sumObj(b)));
  return opts[0];
}
function eventCost(p,id){
  const base=EVENTS[id].cost;
  if(canUse(p,'command')){const d=applyEventDiscount(p,base);if(d)return{cost:d,disc:true}}
  return{cost:{...base},disc:false};
}
function supplyNeeds(p,extraRooms){
  const rows=Math.ceil(p.air/AIR_ROW);
  const rooms=p.rooms.filter(r=>r.built&&r.pop>0).reduce((a,r)=>a+ROOMS[r.k].up,0);
  return{rows,rooms};
}
async function nightPhase(){
  G.phase='night';
  for(const p of G.players)for(const h of p.heroes){h.state='idle';h.spot=null}
  log(`— Day ${G.day} · Night falls.`,'phase');render();
  await fx('banner',`Night ${G.day}`,'Overcome events · feed · radiation · recruit · build · repair','night');
  // 1 events
  let passes=0,i=0,guard=0;
  const ord=order();
  while(G.active.length&&passes<G.n&&guard++<80){
    const p=ord[i%G.n];i++;
    const ch=await decideEvent(p);
    if(ch){
      const{cost,disc}=eventCost(p,ch);
      if(disc)useRoom(p,'command');
      for(const r in cost)p.res[r]-=cost[r];
      p.events.push(ch);G.active.splice(G.active.indexOf(ch),1);pop(P_(p),`+${EVENTS[ch].sp} SP`,'good');await fx('turn',p,'night');await sleep(700);
      log(`${pname(p)} Overcomes ${EVENTS[ch].n} (+${EVENTS[ch].sp} SP) for ${costStr(cost)}.`,'good');
      passes=0;render();
    }else passes++;
  }
  // 2 feed, 3 radiation
  for(const p of ord){await fx('focus',p);await feedStep(p);await sleep(500)}
  for(const p of ord){await fx('focus',p);await radStep(p);await sleep(500)}
  render();
  // 4-6
  for(const p of ord){
    if(p.human){await handoff(p);await U().nightReport(p);await U().shelter(p)}
    else await aiNight(p);
    await fx('turnEnd',p,'night');
  }
  // 7 upkeep
  for(const p of ord){p.res.meat=0;p.res.water=Math.min(p.res.water,2)}
  render();
}
async function decideEvent(p){
  const aff=G.active.filter(id=>canPay(p,eventCost(p,id).cost));
  if(!aff.length)return null;
  if(p.human){
    const opts=aff.map(id=>{const c=eventCost(p,id);return{id,label:`${EVENTS[id].n}  (+${EVENTS[id].sp} SP)`,sub:`Cost ${costStr(c.cost)}${c.disc?' (Command Post discount)':''} — ${EVENTS[id].t}`}});
    opts.push({id:'pass',label:'Pass',sub:'Let the next Tribe decide.'});
    await handoff(p);
    const r=await U().chooseOne(`${p.name}: Overcome an Event?`,opts,'Overcome Events to stop their effects and score their Survival Points.');
    return r==='pass'?null:r;
  }
  let best=null;
  for(const id of aff){
    const c=eventCost(p,id).cost;
    const after={...p.res};for(const r in c)after[r]-=c[r];
    const need=supplyNeeds(p);
    const supAfter=SUPS.reduce((a,r)=>a+after[r],0);
    if(supAfter<need.rows+need.rooms||after.water<need.rows)continue;
    const toks=sumObj(c);
    const harm=['cloud','clan','cold','rats','sandstorm','wildfire','cavein','thieves','lean'].includes(id)?1.2:.5;
    const ratio=(EVENTS[id].sp+harm*Math.max(0,6-G.day))/Math.max(1,toks);
    if(ratio>=.95&&(!best||ratio>best.r))best={id,r:ratio};
  }
  return best?best.id:null;
}
async function feedStep(p){
  const rows=Math.ceil(p.air/AIR_ROW);
  let needRows=rows,perm=hasRoom(p,'cistern')?activeRooms(p,'cistern').length:0;
  const fp=Math.min(perm,needRows);needRows-=fp;perm-=fp;
  const wu=Math.min(needRows,p.res.water);p.res.water-=wu;needRows-=wu;
  let need=p.rooms.filter(r=>r.built&&r.pop>0).reduce((a,r)=>a+ROOMS[r.k].up,0);
  const pu=Math.min(perm,need);need-=pu;
  while(need>0){
    if(p.res.meat>0)p.res.meat--;
    else if(p.res.water>2)p.res.water--;
    else if(p.res.canned>0)p.res.canned--;
    else if(p.res.water>0)p.res.water--;
    else break;
    need--;
  }
  const shortN=needRows+need;
  p.report.push(`Fed ${survivors(p)} Survivors (Airlock rows: ${rows}💧, Rooms upkeep).`);
  pop(P_(p),`fed ${survivors(p)}👤`,'feed');
  if(shortN>0){log(`${pname(p)} is short ${shortN} Supply — Survivors starve.`,'bad');await loseSurvivors(p,shortN,'starvation')}
}
async function radStep(p){
  const L=RAD_DAY[G.day-1];
  if(canUse(p,'scrubber')){useRoom(p,'scrubber');lowerRad(p,1);log(`${pname(p)}'s Scrubber lowers radiation by 1.`);pop(P_(p),'☢ −1','good')}
  const absorb=p.air+(hasRoom(p,'sealdoor')?1:0);
  const leak=Math.max(0,L-absorb);
  p.report.push(`Radiation ${L}: absorbed ${Math.min(L,absorb)}, leaked ${leak}. Gauge now ${p.rad-leak}.`);
  if(leak){log(`${pname(p)} takes ${leak} radiation.`,'bad');pop(P_(p),`☢ +${leak}`,'rad');await addRad(p,leak,'night')}
}

/* ----- night shelter operations (used by humans through the UI and by AI) ----- */
function recruitMax(p){return Math.max(0,Math.min(nSup(p),AIR_MAX-p.air))}
function paySupplies(p,n){
  for(let i=0;i<n;i++){
    if(p.res.meat>0)p.res.meat--;else if(p.res.water>2)p.res.water--;else if(p.res.canned>0)p.res.canned--;else p.res.water--;
  }
}
function recruit(p,n){n=Math.min(n,recruitMax(p));if(n<=0)return 0;paySupplies(p,n);p.air+=n;log(`${pname(p)} recruits ${n} Survivor${n>1?'s':''}.`);pop(P_(p),`+${n}👤`,'surv');return n}
function moveToRoom(p,ri,n){
  const r=p.rooms[ri];if(!r.built)return 0;
  n=Math.min(n,p.air,ROOMS[r.k].cap-r.pop);if(n<=0)return 0;
  p.air-=n;r.pop+=n;return n;
}
function autoPay(p,allowed,n){
  const pay={};let left=n;
  while(left>0){
    const r=allowed.slice().sort((a,b)=>(p.res[b]-(pay[b]||0))-(p.res[a]-(pay[a]||0)))[0];
    if(p.res[r]-(pay[r]||0)<=0)break;
    pay[r]=(pay[r]||0)+1;left--;
  }
  return pay;
}
async function payMaterials(p,n,allowed){
  allowed=allowed||MATS;
  if(n<=0)return{};
  const have=tot(p,allowed);if(have<n)return null;
  const types=allowed.filter(r=>p.res[r]>0);
  let pay;
  if(p.human&&types.length>1&&have>n)pay=await U().payDialog({title:'Choose what to pay',allowed:types,n,p});
  else pay=autoPay(p,allowed,n);
  for(const r in pay)p.res[r]-=pay[r];
  return pay;
}
function buildCost(p){return canUse(p,'foundry')?1:3}
async function buildRoom(p,ri){
  const r=p.rooms[ri];if(r.built)return false;
  const c=buildCost(p);if(nMat(p)<c)return false;
  const pay=await payMaterials(p,c);if(!pay)return false;
  if(c===1)useRoom(p,'foundry');
  r.built=true;log(`${pname(p)} builds ${ROOMS[r.k].n}.`,'good');pop(P_(p),`built ${ROOMS[r.k].n}`,'build');return true;
}
function repairQuote(p,eq){
  const cost={...EQ[eq.id].cost};const used=[];
  const reduce=k=>{
    for(let i=0;i<k;i++){
      const rs=Object.keys(cost).filter(r=>cost[r]>0).sort((a,b)=>(cost[b]-p.res[b])-(cost[a]-p.res[a]));
      if(!rs.length)return;cost[rs[0]]--;
    }
  };
  let left=sumObj(cost);
  const rooms=[['mechanic',99],['rebuild',2],['workshop',1]];
  const taken={};
  for(const[k,amt]of rooms){
    if(sumObj(cost)<=0)break;
    const n=activeRooms(p,k).filter(r=>!r.used).length-(taken[k]||0);
    if(n>0){taken[k]=(taken[k]||0)+1;used.push(k);if(amt===99)Object.keys(cost).forEach(r=>cost[r]=0);else reduce(amt)}
  }
  return{cost,used};
}
function repairEq(p,ei){
  const eq=p.equip[ei];if(!eq||eq.fixed)return false;
  const q=repairQuote(p,eq);
  if(!canPay(p,q.cost))return false;
  q.used.forEach(k=>useRoom(p,k));
  for(const r in q.cost)p.res[r]-=q.cost[r];
  eq.fixed=true;log(`${pname(p)} repairs ${EQ[eq.id].n}.`,'good');pop(P_(p),`repaired ${EQ[eq.id].n}`,'build');return true;
}
const NIGHT_ABILITY=['armory','cache','lab','scrapper','barracks'];
async function useAbility(p,ri){
  const r=p.rooms[ri];if(!r||!isFull(r)||r.used||!NIGHT_ABILITY.includes(r.k))return false;
  switch(r.k){
    case'armory':p.res.mun+=4;log(`${pname(p)} takes 4${RI.mun} from the Armory.`);break;
    case'cache':drawEquipFor(p);break;
    case'lab':drawEquipFor(p);drawEquipFor(p);break;
    case'barracks':if(r.pop>=8)return false;r.pop++;log(`${pname(p)}'s Barracks takes in a Survivor.`);break;
    case'scrapper':{
      if(!p.equip.length)return false;
      let id;
      if(p.human)id=await U().chooseOne('Destroy which Equipment?',p.equip.map((e,i)=>({id:String(i),label:`${EQ[e.id].n} (${e.fixed?'repaired':'broken'})`,sub:`Returns ${costStr(EQ[e.id].cost)}`})));
      else return false;
      const e=p.equip.splice(+id,1)[0];for(const m in EQ[e.id].cost)p.res[m]+=EQ[e.id].cost[m];log(`${pname(p)} scraps ${EQ[e.id].n}.`);break}
  }
  r.used=true;return true;
}

/* ---------- AI: night ---------- */
function nextRad(){return RAD_DAY[Math.min(5,G.day)]}
async function aiNight(p){
  const last=G.day>=6;
  await fx('turn',p,'night');await sleep(500);
  // abilities that give stuff
  for(let i=0;i<p.rooms.length;i++){
    const k=p.rooms[i].k;
    if(!isFull(p.rooms[i])||p.rooms[i].used)continue;
    if(k==='armory'||k==='barracks')await useAbility(p,i);
    if((k==='cache'||k==='lab')&&p.equip.filter(e=>!e.fixed).length<3&&G.day<=5)await useAbility(p,i);
  }
  // recruit
  const need=supplyNeeds(p);
  let budget=nSup(p);
  if(!last){
    const keep=Math.ceil(.25*(need.rows+need.rooms+2));
    budget=Math.max(0,Math.min(recruitMax(p),(p.res.meat+Math.max(0,p.res.water-2))+Math.max(0,p.res.canned-keep)));
  }else budget=recruitMax(p);
  recruit(p,budget);await sleep(650);
  const doPop=()=>aiPopulate(p,last);
  const pv=survivors(p);doPop();render();await sleep(450);
  // build / repair loop
  for(let g=0;g<6;g++){
    let did=false;
    const unbuilt=p.rooms.map((r,i)=>({r,i})).filter(x=>!x.r.built).sort((a,b)=>ROOMS[b.r.k].pri-ROOMS[a.r.k].pri);
    const builtCount=p.rooms.filter(r=>r.built).length;
    const bc=buildCost(p);
    if(unbuilt.length&&nMat(p)>=bc){
      const x=unbuilt[0];
      const cap=ROOMS[x.r.k].cap;
      const canFill=p.air>=cap-(last?0:1)||(!last&&G.day<=3);
      const sensible=builtCount<=Math.ceil(survivors(p)/3)+1;
      if(canFill&&sensible&&(!last||p.air>=cap)){if(await buildRoom(p,x.i)){did=true;doPop();render();await sleep(650)}}
    }
    if(!did){
      const broken=p.equip.map((e,i)=>({e,i})).filter(x=>!x.e.fixed).filter(x=>canPay(p,repairQuote(p,x.e).cost));
      if(broken.length){if(repairEq(p,broken[0].i)){did=true;render();await sleep(650)}}
    }
    if(!did)break;
  }
  // leftover: more recruits if possible on last night
  if(last){recruit(p,recruitMax(p));aiPopulate(p,true)}
}
function aiPopulate(p,last){
  const L=last?0:nextRad();
  const sealed=hasRoom(p,'sealdoor')?1:0;
  const nightsLeft=Math.max(0,6-G.day);
  let guard=0;
  while(p.air>0&&guard++<40){
    const cand=p.rooms.map((r,i)=>({r,i,rem:ROOMS[r.k].cap-r.pop})).filter(x=>x.r.built&&x.rem>0).sort((a,b)=>a.rem-b.rem||ROOMS[b.r.k].pri-ROOMS[a.r.k].pri);
    if(!cand.length)break;
    const x=cand[0];
    const keep=last?0:Math.max(0,L-sealed);
    const free=Math.max(0,p.air-keep);
    if(x.rem<=p.air){
      const leakNow=Math.max(0,L-sealed-p.air),leakAfter=Math.max(0,L-sealed-(p.air-x.rem));
      const cost=(leakAfter-leakNow)*nightsLeft;
      const fullCount=p.rooms.filter(isFull).length;
      const gain=ROOM_SCORE[Math.min(7,fullCount+1)]-ROOM_SCORE[fullCount]+1.2;
      if(gain>=cost){moveToRoom(p,x.i,x.rem);continue}
    }
    if(free>0){moveToRoom(p,x.i,Math.min(free,x.rem));continue}
    break;
  }
}

/* ---------- scoring ---------- */
function scoreOf(p){
  const ev=p.events.reduce((a,e)=>a+EVENTS[e].sp,0);
  const full=p.rooms.filter(isFull).length;
  const fixed=p.equip.filter(e=>e.fixed);
  const sides={};fixed.forEach(e=>{const s=EQ[e.id];(sides[s.sym]=sides[s.sym]||new Set()).add(s.side)});
  const pairs=Object.values(sides).filter(s=>s.size===2).length;
  const out={events:ev,rooms:ROOM_SCORE[full],fullRooms:full,rad:p.rad,survivors:survivors(p),equip:fixed.length,pairs};
  out.total=out.events+out.rooms+out.rad+out.survivors+out.equip+out.pairs;
  return out;
}
function finalResult(){
  const rows=G.players.map(p=>({p,s:scoreOf(p),sup:nSup(p),oth:nMat(p)+p.res.mun}));
  rows.sort((a,b)=>b.s.total-a.s.total||b.sup-a.sup||b.oth-a.oth);
  G.result=rows;return rows;
}

/* ---------- main loop ---------- */
async function runGame(cfg){
  makeGame(cfg);
  await setupGame();
  for(G.day=1;G.day<=6;G.day++){
    dawn();render();
    await fx('banner',`Day ${G.day}`,'Dawn — the wastelands are replenished','dawn');
    await dayPhase();
    await nightPhase();
  }
  G.day=6;G.phase='over';G.over=true;
  const r=finalResult();
  render();
  const u=U();if(u&&u.final)await u.final(r);
  return r;
}
if(typeof module!=='undefined')module.exports={runGame,seedRng,scoreOf,get G(){return G},EVENTS,ROOMS,EQ};
