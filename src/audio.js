/* =====================================================================
   OUTLIVE — procedural audio (Web Audio). No samples: music and effects
   are synthesised at runtime, so there is nothing to download.
   ===================================================================== */
const Sound=(function(){
  const S={music:true,sfx:true,mv:.55,sv:.8};
  try{const v=JSON.parse(localStorage.getItem('outlive.audio')||'null');if(v)Object.assign(S,v)}catch(e){}
  const save=()=>{try{localStorage.setItem('outlive.audio',JSON.stringify(S))}catch(e){}};
  let ctx=null,master,musicBus,sfxBus,reverb,wet,noiseBuf,droneO=[],droneF,windF,windG,delay,mood='menu',timer=null,started=false;
  let nextPad=0,nextNote=0,nextClang=0,nextBeat=0,rootNow=55;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const hz=(f0,st)=>f0*Math.pow(2,st/12);

  function impulse(sec,decay){
    const rate=ctx.sampleRate,len=rate*sec,b=ctx.createBuffer(2,len,rate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay)}
    return b;
  }
  function init(){
    if(ctx)return true;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    try{ctx=new AC()}catch(e){return false}
    master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination);
    musicBus=ctx.createGain();musicBus.gain.value=S.music?S.mv:0;
    sfxBus=ctx.createGain();sfxBus.gain.value=S.sfx?S.sv:0;
    reverb=ctx.createConvolver();reverb.buffer=impulse(3.4,2.6);
    wet=ctx.createGain();wet.gain.value=.55;
    musicBus.connect(master);musicBus.connect(reverb);reverb.connect(wet);wet.connect(master);
    sfxBus.connect(master);
    const nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=nb.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseBuf=nb;
    // echo for lonely notes
    delay=ctx.createDelay(1.5);delay.delayTime.value=.46;
    const fb=ctx.createGain();fb.gain.value=.42;const dl=ctx.createBiquadFilter();dl.type='lowpass';dl.frequency.value=1700;
    delay.connect(dl);dl.connect(fb);fb.connect(delay);dl.connect(musicBus);
    buildDrone();
    return true;
  }
  function buildDrone(){
    const g=ctx.createGain();g.gain.value=.22;
    droneF=ctx.createBiquadFilter();droneF.type='lowpass';droneF.frequency.value=190;droneF.Q.value=2;
    [['sawtooth',1,-7],['sawtooth',1,6],['sine',.5,0],['triangle',2,0]].forEach(([t,m,det])=>{
      const o=ctx.createOscillator();o.type=t;o.frequency.value=55*m;o.detune.value=det;
      const og=ctx.createGain();og.gain.value=t==='sine'?.9:.35;o.connect(og);og.connect(droneF);o.start();droneO.push({o,m});
    });
    droneF.connect(g);g.connect(musicBus);
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.045;lg.gain.value=70;lfo.connect(lg);lg.connect(droneF.frequency);lfo.start();
    // wind
    const ns=ctx.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;
    windF=ctx.createBiquadFilter();windF.type='bandpass';windF.frequency.value=620;windF.Q.value=.9;
    windG=ctx.createGain();windG.gain.value=.05;
    const l2=ctx.createOscillator(),l2g=ctx.createGain();l2.frequency.value=.07;l2g.gain.value=260;l2.connect(l2g);l2g.connect(windF.frequency);l2.start();
    const l3=ctx.createOscillator(),l3g=ctx.createGain();l3.frequency.value=.11;l3g.gain.value=.03;l3.connect(l3g);l3g.connect(windG.gain);l3.start();
    ns.connect(windF);windF.connect(windG);windG.connect(musicBus);ns.start();
  }
  const MOODS={
    menu:{root:55,pads:[[0,7,12,15],[-4,3,8,12],[-7,0,5,10]],scale:[0,3,5,7,10,12,15,17],noteGap:[3,6],wind:.05,beat:false,cut:190},
    day:{root:55,pads:[[0,7,12,15],[-4,3,8,12],[-2,5,10,14],[-7,0,5,9]],scale:[0,3,5,7,10,12,15],noteGap:[2.6,5.5],wind:.06,beat:false,cut:230},
    night:{root:49,pads:[[0,7,13,15],[-4,3,8,13],[0,5,10,13]],scale:[0,1,5,7,8,12,13],noteGap:[4,8],wind:.035,beat:true,cut:150},
    tense:{root:51.9,pads:[[0,6,12,13],[1,7,12,18]],scale:[0,1,6,7,13],noteGap:[3,6],wind:.07,beat:true,cut:260}
  };
  function pad(t){
    const M=MOODS[mood],ch=pick(M.pads),f0=hz(110,0)*(M.root/55);
    ch.forEach((st,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
      o.type=i%2?'triangle':'sawtooth';o.frequency.value=hz(f0,st);o.detune.value=rnd(-9,9);
      f.type='lowpass';f.frequency.value=M.cut*3.2;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+3.2);g.gain.linearRampToValueAtTime(.035,t+6);g.gain.exponentialRampToValueAtTime(.0001,t+10.5);
      o.connect(f);f.connect(g);g.connect(musicBus);o.start(t);o.stop(t+11);
    });
  }
  function note(t){
    const M=MOODS[mood],st=pick(M.scale)+(Math.random()<.25?12:0),f=hz(220*(M.root/55),st);
    const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.003;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+3);
    o.connect(g);o2.connect(g);g.connect(musicBus);g.connect(delay);o.start(t);o2.start(t);o.stop(t+3.1);o2.stop(t+3.1);
  }
  function clang(t){
    const base=rnd(170,320);
    [1,2.76,5.4,8.93].forEach((r,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=base*r;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05/(i+1),t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+2.2/(1+i*.4));
      o.connect(g);g.connect(musicBus);g.connect(delay);o.start(t);o.stop(t+2.4);
    });
  }
  function beat(t){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(62,t);o.frequency.exponentialRampToValueAtTime(34,t+.3);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.4);
    o.connect(g);g.connect(musicBus);o.start(t);o.stop(t+.45);
  }
  function tick(){
    if(!ctx||!S.music)return;
    const t=ctx.currentTime,M=MOODS[mood];
    if(t>=nextPad){pad(t+.05);nextPad=t+rnd(7,10)}
    if(t>=nextNote){note(t+.05);nextNote=t+rnd(M.noteGap[0],M.noteGap[1])}
    if(t>=nextClang){clang(t+.05);nextClang=t+rnd(16,32)}
    if(M.beat&&t>=nextBeat){beat(t+.05);setTimeout(()=>{if(ctx&&S.music)beat(ctx.currentTime+.02)},330);nextBeat=t+rnd(2.2,3.2)}
  }
  function applyMood(){
    if(!ctx)return;
    const M=MOODS[mood],t=ctx.currentTime;
    droneO.forEach(d=>d.o.frequency.setTargetAtTime(M.root*d.m,t,2.5));
    droneF.frequency.setTargetAtTime(M.cut,t,2);
    windG.gain.setTargetAtTime(M.wind,t,2);
  }
  function startTimer(){if(timer)return;timer=setInterval(tick,600);tick()}
  function stopTimer(){if(timer){clearInterval(timer);timer=null}}

  /* ---- effects ---- */
  function env(g,t,a,d,peak){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
  function tone(type,f,t,a,d,peak,f2){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+a+d);
    env(g,t,a,d,peak);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+a+d+.05);
  }
  function nz(t,d,peak,type,f,q,f2){
    const s=ctx.createBufferSource();s.buffer=noiseBuf;
    const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q||1;
    const g=ctx.createGain();env(g,t,.004,d,peak);s.connect(fl);fl.connect(g);g.connect(sfxBus);s.start(t,Math.random()*1.5);s.stop(t+d+.05);
  }
  const FX={
    click(t){tone('square',920,t,.001,.045,.07)},
    select(t){tone('triangle',540,t,.002,.08,.1);tone('triangle',810,t+.05,.002,.08,.08)},
    move(t){nz(t,.4,.16,'bandpass',260,1.2,1300);[0,.13,.26].forEach(d=>nz(t+d,.07,.12,'lowpass',520))},
    gain(t){[0,.07,.14].forEach((d,i)=>tone('sine',1250+i*230,t+d,.002,.2,.11))},
    hunt(t){tone('sine',140,t,.002,.28,.4,38);nz(t,.22,.25,'lowpass',900);tone('sawtooth',90,t+.12,.01,.3,.05,60)},
    hit(t){nz(t,.16,.4,'lowpass',1500);tone('sine',115,t,.002,.26,.45,44);tone('sawtooth',200,t+.02,.002,.2,.08,110)},
    loss(t){tone('sawtooth',340,t,.005,.4,.11,140)},
    good(t){[523,659,784].forEach((f,i)=>tone('triangle',f,t+i*.09,.005,.4,.13))},
    surv(t){tone('sine',660,t,.01,.45,.12);tone('sine',990,t+.1,.01,.55,.1)},
    survLoss(t){tone('sine',330,t,.01,.6,.14,150);tone('triangle',247,t+.12,.01,.6,.08,110)},
    build(t){[0,.2].forEach(d=>{nz(t+d,.09,.35,'bandpass',1800,3);tone('square',210,t+d,.002,.1,.08,130)});tone('triangle',784,t+.5,.005,.5,.09)},
    rad(t){for(let i=0;i<7;i++)nz(t+Math.random()*.6,.02,.22,'highpass',3200)},
    alarm(t){[0,.34,.68].forEach((d,i)=>tone('sawtooth',i%2?330:470,t+d,.01,.3,.09))},
    dawn(t){tone('sine',196,t,.7,1.5,.13,392);tone('triangle',294,t+.1,.7,1.4,.08,588)},
    night(t){tone('sine',370,t,.5,1.6,.13,185);tone('triangle',277,t,.6,1.5,.07,138)},
    turn(t){tone('triangle',700,t,.005,.14,.1);tone('triangle',1050,t+.11,.005,.2,.1)},
    feed(t){tone('sine',440,t,.01,.25,.08);tone('sine',554,t+.08,.01,.3,.07)},
    win(t){[392,494,587,784,988].forEach((f,i)=>tone('triangle',f,t+i*.14,.01,.9,.14))},
    lose(t){[330,262,196].forEach((f,i)=>tone('sawtooth',f,t+i*.25,.01,.7,.08))},
    open(t){tone('triangle',420,t,.003,.1,.07);tone('triangle',630,t+.04,.003,.12,.07)},
    close(t){tone('triangle',630,t,.003,.1,.06);tone('triangle',420,t+.04,.003,.12,.06)}
  };

  const api={
    state:S,
    unlock(){
      if(!init())return;
      if(ctx.state==='suspended')ctx.resume();
      if(!started){started=true;applyMood();if(S.music){const t=ctx.currentTime;nextPad=t;nextNote=t+1.5;nextClang=t+8;startTimer()}}
    },
    sfx(name){
      if(!S.sfx||!ctx||!FX[name])return;
      if(ctx.state==='suspended')ctx.resume();
      try{FX[name](ctx.currentTime+.01)}catch(e){}
    },
    setMood(m){if(!MOODS[m]||m===mood)return;mood=m;applyMood()},
    setMusic(on){
      S.music=!!on;save();if(!ctx)return;
      musicBus.gain.setTargetAtTime(S.music?S.mv:0,ctx.currentTime,.4);
      if(S.music){const t=ctx.currentTime;nextPad=t;nextNote=t+1;startTimer()}else stopTimer();
    },
    setSfx(on){S.sfx=!!on;save();if(ctx)sfxBus.gain.setTargetAtTime(S.sfx?S.sv:0,ctx.currentTime,.05)},
    setMusicVol(v){S.mv=v;save();if(ctx&&S.music)musicBus.gain.setTargetAtTime(v,ctx.currentTime,.1)},
    setSfxVol(v){S.sv=v;save();if(ctx&&S.sfx)sfxBus.gain.setTargetAtTime(v,ctx.currentTime,.05)},
    suspend(){if(ctx&&ctx.state==='running')ctx.suspend()},
    resume(){if(ctx&&ctx.state==='suspended')ctx.resume()}
  };
  document.addEventListener('visibilitychange',()=>{document.hidden?api.suspend():api.resume()});
  return api;
})();
