/* =====================================================================
   OUTLIVE — original vector artwork: resource icons, survivor faces,
   equipment glyphs, pair symbols and procedural Leader portraits.
   (All drawn for this project; nothing is taken from the board game.)
   ===================================================================== */
const OL='#17110b';                              // outline colour
const SO=`stroke="${OL}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
const SO1=`stroke="${OL}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- 32×32 resource icons ---------- */
const ICONS={
  wood:`<rect x="3" y="10" width="22" height="14" rx="4" fill="#8a5a2b" ${SO}/><path d="M8 13.5h14M7 17h15M8 20.5h14" stroke="#5e3a18" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="25" cy="17" rx="4.6" ry="7" fill="#e0aa63" ${SO}/><ellipse cx="25" cy="17" rx="2.3" ry="3.8" fill="none" stroke="#a06c32" stroke-width="1.2"/><circle cx="25" cy="17" r=".9" fill="#a06c32"/>`,
  metal:`<path d="M9 11h15l5 6.5V25H4v-7.5z" fill="#aab1b8" ${SO}/><path d="M9 11h15l5 6.5H4z" fill="#eef2f5" ${SO}/><path d="M4 17.5h25" stroke="${OL}" stroke-width="1.4"/><path d="M8 21.5h8" stroke="#fff9" stroke-width="2" stroke-linecap="round"/>`,
  chip:`<path d="M10 3.5v3.5M16 3.5v3.5M22 3.5v3.5M10 25v3.5M16 25v3.5M22 25v3.5M3.5 10h3.5M3.5 16h3.5M3.5 22h3.5M25 10h3.5M25 16h3.5M25 22h3.5" stroke="#d6b24a" stroke-width="2.2" stroke-linecap="round"/><rect x="6.5" y="6.5" width="19" height="19" rx="3" fill="#2f9a55" ${SO}/><rect x="11" y="11" width="10" height="10" rx="1.5" fill="#12301d" stroke="#9be6b2" stroke-width="1.2"/><path d="M13.5 16h5M16 13.5v5" stroke="#9be6b2" stroke-width="1.2" stroke-linecap="round"/>`,
  water:`<path d="M16 2.5C16 2.5 6 13.5 6 20a10 10 0 0 0 20 0C26 13.5 16 2.5 16 2.5z" fill="#3aa8f0" ${SO}/><path d="M10.5 20.5a5.6 5.6 0 0 0 4.4 5" stroke="#c6eaff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  canned:`<path d="M6.5 9v16.5a9.5 3.5 0 0 0 19 0V9z" fill="#caa44c" ${SO}/><path d="M6.5 14v8a9.5 3.5 0 0 0 19 0v-8a9.5 3.5 0 0 1-19 0z" fill="#c24a3a"/><path d="M6.5 9v16.5a9.5 3.5 0 0 0 19 0V9" fill="none" ${SO}/><ellipse cx="16" cy="9" rx="9.5" ry="3.5" fill="#ecd691" ${SO}/><ellipse cx="16" cy="9" rx="5.6" ry="1.8" fill="none" stroke="#a98a37" stroke-width="1.2"/>`,
  mun:`<g transform="rotate(38 16 16)"><path d="M16 2.5c4.4 3 5.6 7 5.6 11.5v1.5H10.4V14c0-4.5 1.2-8.5 5.6-11.5z" fill="#d98a3c" ${SO}/><rect x="10.4" y="15" width="11.2" height="13.5" rx="1.6" fill="#dcc04c" ${SO}/><rect x="10.4" y="24.8" width="11.2" height="3.7" fill="#a98d2a" stroke="${OL}" stroke-width="1.4"/><path d="M13.4 17.5v6" stroke="#fff8" stroke-width="1.6" stroke-linecap="round"/></g>`,
  meat:`<path d="M5 16c0-6.5 5.5-10.5 12-9.5 5.5 1 8.5 5.5 7.5 10.5-1 5.5-6.5 7.5-12 6.5-4.5-1-7.5-3.5-7.5-7.5z" fill="#c7443a" ${SO}/><ellipse cx="15" cy="14.5" rx="4.2" ry="3" fill="#f2bdae"/><path d="M22.5 21.5l4 4" stroke="${OL}" stroke-width="5.6" stroke-linecap="round"/><path d="M22.5 21.5l4 4" stroke="#f3ead6" stroke-width="3" stroke-linecap="round"/><circle cx="27.5" cy="25" r="2.4" fill="#f3ead6" ${SO1}/><circle cx="25" cy="27.6" r="2.4" fill="#f3ead6" ${SO1}/>`,
  surv:`<path d="M5 30c0-6.5 5-10 11-10s11 3.5 11 10z" fill="var(--c,#7a8a9a)" ${SO}/><rect x="13.4" y="16" width="5.2" height="5" fill="#d9a67a" ${SO1}/><circle cx="16" cy="11.5" r="6.6" fill="#e6b88c" ${SO}/><path d="M9.3 11c-.4-5.2 3.6-8 7-7.5 4 .5 6.8 3.2 6.2 8-1.6-2.7-3.8-3.6-6.4-3.6-2.6 0-4.8 1-6.8 3.1z" fill="#4b3322" ${SO1}/><circle cx="13.4" cy="12.6" r=".95" fill="${OL}"/><circle cx="18.6" cy="12.6" r=".95" fill="${OL}"/>`,
  survf:`<path d="M7.5 12.5C6.5 6 10.5 2.6 16 2.6s9.5 3.4 8.5 9.9c.6 5.4 1.8 9 2.6 11.6H4.9c.8-2.6 2.1-6.2 2.6-11.6z" fill="#8a3b2b" ${SO}/><path d="M5 30c0-6.5 5-9.2 11-9.2s11 2.7 11 9.2z" fill="var(--c,#7a8a9a)" ${SO}/><rect x="13.4" y="16" width="5.2" height="5" fill="#d9a67a" ${SO1}/><circle cx="16" cy="11.8" r="6.3" fill="#e6b88c" ${SO}/><path d="M9.8 10.4c3.6-.6 6.4-2.7 7.4-5.3 1.2 2.6 3.2 4.3 5.1 5.3-.6-4.4-3-6.6-6.3-6.6s-5.6 2.3-6.2 6.6z" fill="#8a3b2b" ${SO1}/><circle cx="13.5" cy="12.7" r=".95" fill="${OL}"/><circle cx="18.5" cy="12.7" r=".95" fill="${OL}"/>`,
  algae:`<path d="M5 27C4.5 14 13 5.5 27.5 4.5 28 18 21 26.5 5 27z" fill="#4dc05a" ${SO}/><path d="M7.5 25C13.5 18.5 19 13 24.5 8.5M13 20.5l.5-5.5M17.5 16.5l5 .5M11 23.5l-.5-4.5" stroke="#c3f2b4" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  rad:`<circle cx="16" cy="16" r="13.5" fill="#f2c332" ${SO}/><g fill="${OL}"><path d="M16 16L16 5.5A10.5 10.5 0 0 1 25.1 10.75Z"/><path d="M16 16L25.1 21.25A10.5 10.5 0 0 1 6.9 21.25Z" /><path d="M16 16L6.9 10.75A10.5 10.5 0 0 1 16 5.5Z"/></g><circle cx="16" cy="16" r="2.7" fill="#f2c332" stroke="${OL}" stroke-width="1.6"/>`,
  gear:`<circle cx="16" cy="16" r="12" fill="none" stroke="#aeb5bb" stroke-width="4.6" stroke-dasharray="4.7 4.7"/><circle cx="16" cy="16" r="9" fill="#aeb5bb" ${SO}/><circle cx="16" cy="16" r="3.6" fill="${OL}"/>`,
  deer:`<path d="M9 4v8M9 8l-4-2M9 6l3-2M23 4v8M23 8l4-2M23 6l-3-2" stroke="#d8c7a0" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M9 11c0 3 2 4 2 7l2 9h6l2-9c0-3 2-4 2-7-2-1.5-4-2-7-2s-5 .5-7 2z" fill="#b87a42" ${SO}/><circle cx="13.2" cy="15.5" r="1" fill="${OL}"/><circle cx="18.8" cy="15.5" r="1" fill="${OL}"/><ellipse cx="16" cy="23.5" rx="2.2" ry="1.7" fill="${OL}"/>`,
  search:`<circle cx="13" cy="13" r="8" fill="#9ed4f0" fill-opacity=".45" stroke="${OL}" stroke-width="2.4"/><path d="M19 19l9 9" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><path d="M19 19l9 9" stroke="#c9a46a" stroke-width="3" stroke-linecap="round"/><path d="M9 10a5 5 0 0 1 4-2.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  event:`<path d="M16 3l13 23H3z" fill="#e0642c" ${SO}/><path d="M16 11v8" stroke="#17110b" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="22.4" r="1.7" fill="#17110b"/>`,
  repair:`<path d="M21.5 4.5a6.5 6.5 0 0 0-6.6 8.4L5 22.8a2.6 2.6 0 0 0 3.7 3.7l9.9-9.9A6.5 6.5 0 0 0 27 10.4l-4 3.6-3.6-.7-.7-3.6z" fill="#b6bdc3" ${SO}/>`,
  food:`<path d="M9 4v9a3 3 0 0 0 6 0V4M12 4v24M22 4c-3 3-4 8-4 12h4v12" fill="none" stroke="#e8e0cc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
};
const EMO={'🪵':'wood','🔩':'metal','💾':'chip','🍖':'meat','💧':'water','🥫':'canned','💥':'mun','👤':'surv','🌿':'algae','☢':'rad','⚙':'gear','🦌':'deer','🔎':'search'};
const EMO_RE=/(🪵|🔩|💾|🍖|💧|🥫|💥|👤|🌿|☢|⚙|🦌|🔎)️?/g;
const icon=(n,cls)=>`<svg class="ic ${cls||''}" viewBox="0 0 32 32" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const ic=h=>String(h).replace(EMO_RE,(m,e)=>icon(EMO[e]));
const svIcon=(i,cls)=>icon(i%2?'survf':'surv',cls);

/* ---------- 20×20 pair symbols (the half-icon printed on the card edge) ---------- */
const PSYM=[
  '<path d="M10 1.5L18.5 10 10 18.5 1.5 10z"/>',
  '<circle cx="10" cy="10" r="8"/>',
  '<path d="M10 2l8.5 15h-17z"/>',
  '<rect x="2.5" y="2.5" width="15" height="15" rx="1.5"/>',
  '<path d="M10 1.5l2.5 5.8 6.2.6-4.7 4.2 1.4 6.2L10 15l-5.4 3.3L6 12.1 1.3 7.9l6.2-.6z"/>',
  '<path d="M7.5 2h5v5.5H18v5h-5.5V18h-5v-5.5H2v-5h5.5z"/>',
  '<path d="M10 1.5l7.3 4.2v8.6L10 18.5 2.7 14.3V5.7z"/>',
  '<path d="M3 4h14l-2 6 2 6H3l2-6z"/>',
  '<path d="M10 1.5c3 3.5 7.5 6 7.5 10a7.5 7.5 0 0 1-15 0c0-4 4.5-6.5 7.5-10z"/>',
  '<path d="M10 17.5C3.5 12.5 1.5 9 1.5 6.2A4.4 4.4 0 0 1 10 4.6a4.4 4.4 0 0 1 8.5 1.6c0 2.8-2 6.3-8.5 11.3z"/>'
];
const PCOL=['#e8c34a','#e0674a','#4ac7e8','#8fe86a','#e84ad0','#f2f2f2','#e89a4a','#7a9ff0','#4ae8b0','#c9a0ff'];
const symFull=(i,cls)=>`<svg class="ps ${cls||''}" viewBox="0 0 20 20" fill="${PCOL[i]}" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round">${PSYM[i]}</svg>`;
// left half (x 0..10) or right half (x 10..20) of the symbol; placed on the card edge so two matching cards form one symbol
const symHalf=(i,side)=>`<svg class="ph ${side}" viewBox="${side==='L'?'0':'10'} 0 10 20" fill="${PCOL[i]}" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round">${PSYM[i]}</svg>`;

/* ---------- 48×48 equipment glyphs ---------- */
const GL={
  axe:`<path d="M12 41L34 13" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M12 41L34 13" stroke="#9a6a35" stroke-width="3.6" stroke-linecap="round"/><path d="M28 9c9-3 15 1 16 9-6 3-12 2-17-1z" fill="#c4cbd2" ${SO}/>`,
  chainsaw:`<rect x="4" y="22" width="25" height="15" rx="3" fill="#e07a24" ${SO}/><path d="M9 22v-6h13v6" fill="none" ${SO}/><rect x="29" y="25" width="16" height="7" rx="3" fill="#c4cbd2" ${SO}/><path d="M31 25v-2M35 25v-2M39 25v-2M43 25v-2M31 32v2M35 32v2M39 32v2M43 32v2" stroke="${OL}" stroke-width="1.6"/><circle cx="12" cy="30" r="3" fill="${OL}"/>`,
  bow:`<path d="M15 5C42 20 42 28 15 43" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><path d="M15 5C42 20 42 28 15 43" fill="none" stroke="#9a6a35" stroke-width="3" stroke-linecap="round"/><path d="M15 5V43" stroke="#e8e0cc" stroke-width="1.4"/><path d="M8 24h33" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><path d="M41 24l-6-4v8z" fill="#c4cbd2" ${SO1}/>`,
  shotgun:`<path d="M3 20h30v5H3z" fill="#9aa1a8" ${SO}/><path d="M3 26h24v3H3z" fill="#6f777e" ${SO}/><path d="M30 19h8l8 13-9 3-4-7h-3z" fill="#8a5a2b" ${SO}/>`,
  jerrycan:`<rect x="9" y="12" width="28" height="31" rx="4" fill="#c2832a" ${SO}/><path d="M13 12V8h9v4" fill="none" ${SO}/><rect x="27" y="6" width="7" height="6" fill="#6f777e" ${SO}/><path d="M15 20l16 16M31 20L15 36" stroke="#8a5a14" stroke-width="2.4"/>`,
  purifier:`<rect x="14" y="8" width="20" height="32" rx="5" fill="#6f8aa0" ${SO}/><rect x="14" y="8" width="20" height="8" rx="3" fill="#aab1b8" ${SO}/><path d="M24 20c0 0-5 5.5-5 8.5a5 5 0 0 0 10 0c0-3-5-8.5-5-8.5z" fill="#3aa8f0" ${SO1}/><path d="M34 14h6v8" fill="none" ${SO}/>`,
  card:`<rect x="5" y="10" width="38" height="26" rx="3.5" fill="#e8e0cc" ${SO}/><rect x="5" y="16" width="38" height="5" fill="${OL}"/><rect x="10" y="26" width="9" height="7" rx="1.5" fill="#d6b24a" ${SO1}/><path d="M24 28h14M24 32h9" stroke="#8a8470" stroke-width="2" stroke-linecap="round"/>`,
  crowbar:`<path d="M10 41L30 15q4-5 10-2" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M10 41L30 15q4-5 10-2" fill="none" stroke="#c0463a" stroke-width="3.6" stroke-linecap="round"/><path d="M40 13l3 4" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>`,
  ammobox:`<rect x="5" y="21" width="38" height="20" rx="3" fill="#6f7a45" ${SO}/><rect x="5" y="21" width="38" height="6" fill="#59622f" ${SO}/><rect x="19" y="28" width="10" height="6" rx="1" fill="#d6b24a" ${SO1}/><g ${SO1}><rect x="10" y="9" width="5" height="12" rx="2" fill="#dcc04c"/><rect x="18" y="7" width="5" height="14" rx="2" fill="#dcc04c"/><rect x="26" y="9" width="5" height="12" rx="2" fill="#dcc04c"/><rect x="34" y="11" width="5" height="10" rx="2" fill="#dcc04c"/></g>`,
  gear:`<path d="M13 8l5 3h12l5-3 7 7-4 6v18H10V21l-4-6z" fill="#7c858c" ${SO}/><path d="M18 11l6 8 6-8" fill="none" ${SO}/><path d="M16 30h16M16 36h16" stroke="${OL}" stroke-width="2"/><path d="M14 26h20" stroke="#c4cbd2" stroke-width="3"/>`,
  pickaxe:`<path d="M10 42L32 14" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M10 42L32 14" stroke="#9a6a35" stroke-width="3.6" stroke-linecap="round"/><path d="M14 12Q30 4 44 20L40 22Q30 12 18 16z" fill="#c4cbd2" ${SO}/>`,
  hacksaw:`<path d="M6 12h36v26" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 12h36v26" fill="none" stroke="#c0463a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 36h36" stroke="${OL}" stroke-width="4"/><path d="M8 36l2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3 2 3 2-3" fill="none" stroke="#c4cbd2" stroke-width="1.6"/>`,
  flashlight:`<rect x="6" y="19" width="22" height="11" rx="3" fill="#4a5058" ${SO}/><path d="M28 16h8l-2 17h-6z" fill="#8a929a" ${SO}/><path d="M38 17l9-6v26l-9-6z" fill="#ffe27a" fill-opacity=".6"/><rect x="11" y="22" width="5" height="5" rx="1.5" fill="#e0642c"/>`,
  thermal:`<rect x="9" y="6" width="30" height="36" rx="5" fill="#3a4047" ${SO}/><rect x="13" y="11" width="22" height="19" rx="2" fill="#241033" stroke="${OL}"/><circle cx="24" cy="21" r="6" fill="#ff7a2a"/><circle cx="24" cy="21" r="3" fill="#ffd54a"/><circle cx="19" cy="36" r="2.4" fill="#e0642c"/><circle cx="28" cy="36" r="2.4" fill="#5fd18a"/>`,
  backpack:`<path d="M13 12c0-5 4-7 11-7s11 2 11 7v28a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill="#7a6a3a" ${SO}/><rect x="16" y="26" width="16" height="12" rx="2.5" fill="#5e5128" ${SO1}/><path d="M17 14h14" stroke="${OL}" stroke-width="2"/><path d="M13 20c-5 2-6 10-4 17M35 20c5 2 6 10 4 17" fill="none" stroke="${OL}" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="32" r="1.6" fill="#d6b24a"/>`,
  detector:`<path d="M34 5L18 36" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><path d="M34 5L18 36" stroke="#9aa1a8" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="17" cy="40" rx="11" ry="5" fill="#4a5058" ${SO}/><ellipse cx="17" cy="40" rx="5" ry="2" fill="#17110b"/><path d="M34 5q6 0 8 6" fill="none" ${SO}/>`,
  hook:`<path d="M24 4v20" stroke="${OL}" stroke-width="5"/><path d="M24 4v20" stroke="#d6c38a" stroke-width="2.4" stroke-dasharray="3 2"/><path d="M24 24c-8 0-12 6-8 13 3 5 11 5 14 0M30 37l-2-5M30 37l5-2" fill="none" stroke="${OL}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 24c-8 0-12 6-8 13 3 5 11 5 14 0M30 37l-2-5M30 37l5-2" fill="none" stroke="#c4cbd2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  exo:`<path d="M20 5l-4 17-4 20M28 5l4 17 4 20" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5l-4 17-4 20M28 5l4 17 4 20" fill="none" stroke="#7ea0b8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="22" r="4" fill="#e0642c" ${SO1}/><circle cx="32" cy="22" r="4" fill="#e0642c" ${SO1}/><path d="M8 43h9M31 43h9" stroke="${OL}" stroke-width="5" stroke-linecap="round"/>`,
  trap:`<ellipse cx="24" cy="30" rx="19" ry="9" fill="#6f777e" ${SO}/><path d="M7 28Q24 -2 41 28" fill="none" stroke="${OL}" stroke-width="5"/><path d="M7 28Q24 -2 41 28" fill="none" stroke="#aab1b8" stroke-width="2.4"/><path d="M10 27l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5" fill="#c4cbd2" ${SO1}/><circle cx="24" cy="30" r="3" fill="#c0463a" ${SO1}/>`,
  bat:`<path d="M10 42L37 9q4-4 7 0 3 4-1 7L16 44q-6 2-6-2z" fill="#c79a5a" ${SO}/><path d="M36 11l4 4M14 40l-2 2" stroke="${OL}" stroke-width="2"/><path d="M14 38l3 3" stroke="#e8e0cc" stroke-width="3" stroke-linecap="round"/>`
};
const glyph=(id,cls)=>`<svg class="gl ${cls||''}" viewBox="0 0 48 48" aria-hidden="true">${GL[id]||''}</svg>`;

/* ---------- procedural Leader portraits (invented characters) ---------- */
const FACES={
  crane:   {skin:'#8a5a3a',coat:'#5a6a52',hair:'#cfcfd2',style:'bun',   acc:'glasses',scarf:'#b5483a',w:1},
  wren:    {skin:'#e0b48e',coat:'#6a5a46',hair:'#e8e8e8',style:'cap',   acc:'beard',  beard:'#e8e8e8',capc:'#3e4a38'},
  okafor:  {skin:'#5a3826',coat:'#7a4a2a',hair:'#201410',style:'wrap',  acc:'earring',wrapc:'#e0861c',w:1},
  sokolov: {skin:'#e8c3a0',coat:'#4a4f58',hair:'#6a5a4a',style:'ushanka',acc:'stubble'},
  marin:   {skin:'#c68a60',coat:'#3a5a6a',hair:'#1a1210',style:'wavy',  acc:'goggles',w:1},
  tanabe:  {skin:'#e0b88e',coat:'#4a3a3a',hair:'#14100e',style:'bandana',acc:'scar',  wrapc:'#8a2a2a'},
  lindqvist:{skin:'#f0cfb0',coat:'#5a6a7a',hair:'#d8b85a',style:'braid', acc:'hood',  w:1},
  mensah:  {skin:'#4a2e20',coat:'#5a4a2a',hair:'#14100e',style:'short', acc:'beard',  beard:'#1a120e',strap:1},
  raman:   {skin:'#b57a52',coat:'#6a3a52',hair:'#120c0a',style:'long',  acc:'headband',wrapc:'#d6b24a',w:1},
  hart:    {skin:'#d8a47c',coat:'#4a5a42',hair:'#4a3020',style:'short', acc:'respirator'}
};
function faceSvg(id){
  const f=FACES[id]||FACES.hart,O=SO1;
  let s=`<defs><linearGradient id="fb${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a5a46"/><stop offset="1" stop-color="#2a1d14"/></linearGradient></defs><rect width="100" height="120" fill="url(#fb${id})"/><circle cx="78" cy="22" r="14" fill="#e0a45a" opacity=".35"/><path d="M0 92h100v28H0z" fill="#17110b" opacity=".35"/>`;
  // hair behind head
  if(f.style==='long'||f.style==='wavy')s+=`<path d="M22 56c-6-30 10-44 28-44s34 14 28 44c1 14 4 24 7 34H15c3-10 6-20 7-34z" fill="${f.hair}" ${O}/>`;
  if(f.style==='braid')s+=`<path d="M66 60c10 8 14 20 8 34" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M66 60c10 8 14 20 8 34" fill="none" stroke="${f.hair}" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 3"/>`;
  if(f.style==='bun')s+=`<circle cx="50" cy="13" r="9" fill="${f.hair}" ${O}/>`;
  // body + collar
  s+=`<path d="M8 120c0-26 18-38 42-38s42 12 42 38z" fill="${f.coat}" ${SO}/><path d="M36 84l14 16 14-16" fill="none" ${O}/>`;
  if(f.strap)s+=`<path d="M22 86l52 34" stroke="${OL}" stroke-width="9"/><path d="M22 86l52 34" stroke="#8a6a3a" stroke-width="5"/><g fill="#d6b24a" ${O}><rect x="40" y="97" width="5" height="9" transform="rotate(-33 42 101)"/><rect x="48" y="102" width="5" height="9" transform="rotate(-33 50 106)"/><rect x="56" y="107" width="5" height="9" transform="rotate(-33 58 111)"/></g>`;
  if(f.scarf)s+=`<path d="M30 80c8 8 32 8 40 0l4 12c-12 10-36 10-48 0z" fill="${f.scarf}" ${SO}/>`;
  if(f.acc==='respirator')s+=`<path d="M34 82c4 12 28 12 32 0l4 8c-8 12-32 12-40 0z" fill="#3a3f46" ${SO}/><circle cx="42" cy="92" r="4" fill="#8a929a" ${O}/><circle cx="58" cy="92" r="4" fill="#8a929a" ${O}/>`;
  // neck + head
  s+=`<rect x="42" y="68" width="16" height="18" rx="4" fill="${f.skin}" ${O}/><ellipse cx="50" cy="48" rx="21" ry="25" fill="${f.skin}" ${SO}/>`;
  if(f.style==='short'||f.style==='wavy')s+=`<path d="M29 46c-3-22 12-31 22-31 12 0 23 9 20 31-3-9-8-14-14-15-7 4-18 5-28 0-3 3-5 8-0 15z" fill="${f.hair}" ${O}/>`;
  if(f.style==='long'||f.style==='braid')s+=`<path d="M28 46c-2-22 12-32 23-32 12 0 23 10 21 32-5-9-12-15-22-17-8 6-16 11-22 17z" fill="${f.hair}" ${O}/>`;
  if(f.style==='bun')s+=`<path d="M29 44c0-16 10-25 21-25s21 9 21 25c-5-8-10-12-21-14-11 2-16 6-21 14z" fill="${f.hair}" ${O}/>`;
  if(f.style==='cap')s+=`<path d="M28 40c0-14 10-22 22-22s22 8 22 22z" fill="${f.capc}" ${SO}/><path d="M28 40h54l4 5H26z" fill="${f.capc}" ${SO}/>`;
  if(f.style==='ushanka')s+=`<path d="M26 44c-2-22 10-30 24-30s26 8 24 30l-5 8-3-12H34l-3 12z" fill="#6a5a4a" ${SO}/><path d="M32 36h36" stroke="#8a7a66" stroke-width="3"/>`;
  if(f.style==='bandana'||f.style==='wrap'||f.acc==='headband'){s+=`<path d="M28 38c4-14 14-18 22-18s18 4 22 18c-8-4-14-6-22-6s-14 2-22 6z" fill="${f.wrapc}" ${SO}/>`;if(f.style==='wrap')s+=`<path d="M28 38c-5-3-6-10-3-14 4 2 7 8 8 12zM72 38c5-3 6-10 3-14-4 2-7 8-8 12z" fill="${f.wrapc}" ${O}/><path d="M28 38c4-14 14-24 22-24s18 10 22 24" fill="${f.wrapc}" ${SO}/>`}
  if(f.style==='hood'||f.acc==='hood')s+=`<path d="M24 50c-4-30 8-40 26-40s30 10 26 40c-3-12-8-22-26-22S27 38 24 50z" fill="${f.coat}" ${SO}/>`;
  // face details
  const ey=f.acc==='goggles'?'':`<circle cx="42" cy="50" r="2.1" fill="${OL}"/><circle cx="58" cy="50" r="2.1" fill="${OL}"/>`;
  s+=ey+`<path d="M47 57q3 4 6 0" stroke="${OL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  s+=`<path d="M38 44q4-3 8-1M54 43q4-2 8 1" stroke="${OL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  s+=f.w?`<path d="M44 66q6 3 12 0" stroke="#a04a3a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`:`<path d="M44 67q6 2 12 0" stroke="#7a3a2a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  if(f.acc==='glasses')s+=`<g fill="#9ed4f044" stroke="${OL}" stroke-width="2"><circle cx="41" cy="50" r="7"/><circle cx="59" cy="50" r="7"/><path d="M48 50h4"/></g>`;
  if(f.acc==='goggles')s+=`<g ${SO}><rect x="29" y="38" width="42" height="14" rx="7" fill="#2a3a42"/><circle cx="41" cy="45" r="5" fill="#8ad0e8"/><circle cx="59" cy="45" r="5" fill="#8ad0e8"/></g>`;
  if(f.acc==='beard')s+=`<path d="M30 56c0 16 8 24 20 24s20-8 20-24c-5 8-10 10-20 10S35 64 30 56z" fill="${f.beard}" ${O}/>`;
  if(f.acc==='stubble')s+=`<path d="M31 58c2 14 10 20 19 20s17-6 19-20c-4 6-10 8-19 8s-15-2-19-8z" fill="#5a4a3a" opacity=".55"/>`;
  if(f.acc==='scar')s+=`<path d="M60 40l-6 18" stroke="#a04a3a" stroke-width="2.4" stroke-linecap="round"/><path d="M57 46l5-1M56 51l5-1" stroke="#e8c3a0" stroke-width="1.2"/>`;
  if(f.acc==='earring')s+=`<circle cx="29" cy="58" r="3" fill="#d6b24a" ${O}/>`;
  return `<svg class="face" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${s}</svg>`;
}

/* ---------- SVG sprite (installed once) ---------- */
function installSprite(){
  if(document.getElementById('sprite'))return;
  const d=document.createElement('div');d.id='sprite';d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>'+Object.entries(ICONS).map(([k,v])=>`<symbol id="i-${k}" viewBox="0 0 32 32">${v}</symbol>`).join('')+'</defs></svg>';
  document.body.insertBefore(d,document.body.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installSprite);else installSprite();
