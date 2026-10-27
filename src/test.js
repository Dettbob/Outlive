// Headless AI-only test harness. Usage: node test.js [games] [players]
const fs=require('fs'),vm=require('vm'),path=require('path');
const games=+process.argv[2]||50,np=+process.argv[3]||4;
const code=fs.readFileSync(path.join(__dirname,'engine.js'),'utf8').replace(/^if\(typeof module[^\n]*$/m,'');
const stub={
  log(){},render(){},sleep:async()=>{},
  modal:async()=>'ok',chooseOne:async(t,o)=>o[0].id,chooseMany:async(t,o,n)=>o.slice(0,n).map(x=>x.id),
  amount:async o=>o.def??o.min,payDialog:async o=>({}),pickMove:async()=>{throw new Error('human move')},
  pickLocation:async(p,l)=>l[0],pickAction:async()=>null,shelter:async()=>{},nightReport:async()=>{},handoff:async()=>{},
  showEvent:async()=>{},showPile:async()=>{},final:async()=>{}
};
global.UI=stub;
const run=new vm.Script(code+`
;(async()=>{
  const stats={n:0,scores:[],win:[],errs:0,neg:0};
  for(let g=0;g<${games};g++){
    seedRng(1000+g);
    const cfg={players:Array.from({length:${np}},(_,i)=>({name:'AI'+(i+1),human:false}))};
    try{
      const r=await runGame(cfg);
      stats.n++;
      r.forEach((x,i)=>{stats.scores.push(x.s.total);if(i===0)stats.win.push(x.s.total)});
      for(const p of G.players){for(const k in p.res)if(p.res[k]<0){stats.neg++;console.log('NEG',g,p.name,k,p.res[k])}
        if(p.air<0||p.rooms.some(r=>r.pop<0))console.log('NEGPOP',g)}
      if(g<2){console.log('--- game',g);r.forEach(x=>console.log(x.p.name,JSON.stringify(x.s),'rooms',x.p.rooms.filter(r=>r.built).length,'eq',x.p.equip.length,'ev',x.p.events.join(',')))}
    }catch(e){stats.errs++;console.log('ERR game',g,e.stack.split('\\n').slice(0,5).join('\\n'))}
  }
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  console.log('games',stats.n,'errors',stats.errs,'neg',stats.neg,'avg',avg(stats.scores).toFixed(1),'winavg',avg(stats.win).toFixed(1),'min',Math.min(...stats.scores),'max',Math.max(...stats.scores));
})();
`,{filename:'engine+test'});
run.runInThisContext();
