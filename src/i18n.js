/* =====================================================================
   OUTLIVE — language layer (English / Čeština)
   The game is written in English. Czech is applied at the screen: every piece
   of text that appears in the page is translated through exact phrases,
   sentence patterns and a glossary of game terms (taken from the official
   Czech rulebook "Pustina"). Switching language is instant and live.
   ===================================================================== */
const I18N=(function(){
  let lang='en';
  try{const v=localStorage.getItem('outlive.lang');if(v==='cs'||v==='en')lang=v;else if((navigator.language||'').toLowerCase().startsWith('cs'))lang='cs'}catch(e){}

  /* ---- glossary: whole words/phrases, applied inside any text ---- */
  const GLOSS={
    // locations
    'Military Base':'Vojenská základna','Blackwood City':'Blackwood','The Dam':'Přehrada','Dam':'Přehrada','The Mine':'Důl','Mine':'Důl',
    'Fairgrounds':'Lunapark','Cargo Ship':'Nákladní loď','Forest':'Les','Cities':'Města','City':'Město',
    // resources
    'Canned goods':'konzervy','Canned Goods':'konzervy','Canned':'konzervy','Microchips':'mikročipy','Microchip':'mikročip','Chip':'mikročip',
    'Munitions':'střelivo','Munition':'střelivo','Meat':'maso','Water':'voda','Wood':'dřevo','Metal':'kov','Algae':'řasy','Empty':'prázdné',
    'Supplies':'potraviny','Supply':'potravina','Materials':'materiály','Material':'materiál',
    // game terms
    'Survivors':'přeživší','Survivor':'přeživší','Airlock':'Přechodová komora','Shelters':'úkryty','Shelter':'Úkryt','Tribe':'kmen','Heroes':'hrdinové','Hero':'hrdina',
    'Convoy':'Konvoj','Leader':'Vůdce','Wild Game':'Kořist','Search tiles':'žetony prohledávání','Search tile':'žeton prohledávání','Search':'Prohledávání',
    'Pressure':'nátlak','Equipment':'Vybavení','Event':'událost','Events':'události','Rooms':'Místnosti','Room':'Místnost',
    'Strength':'Síla','Endurance':'vytrvalost','Radioactivity':'Radioaktivita','Radiation':'Radiace','radiation':'radiace',
    // equipment
    'Axe':'Sekera','Chainsaw':'Motorová pila','Bow':'Luk','Shotgun':'Brokovnice','Jerrycan':'Kanystr','Purifier':'Filtr na vodu','Access Card':'Přístupová karta',
    'Crowbar':'Páčidlo','Ammo Box':'Krabice střeliva','Battle Gear':'Brnění','Pickaxe':'Krumpáč','Hacksaw':'Ruční pila','Flashlight':'Baterka',
    'Thermal Sensor':'Infračervený senzor','Backpack':'Batoh','Metal Detector':'Detektor kovu','Grappling Hook':'Vystřelovací hák','Exoskeleton':'Exoskelet',
    'Bear Trap':'Past na medvědy','Baseball Bat':'Baseballová pálka',
    // events
    'Wildfire':'Lesní požár','Cave-in':'Zával','Thieves':'Lupiči','Sandstorm':'Písečná bouře','Lean Times':'Totální nedostatek','Radioactive Cloud':'Radioaktivní mrak',
    'Rat Infestation':'Zamoření krysami','Enemy Clan':'Nepřátelský kmen','Cold Snap':'Tuhé mrazy','Nomads':'Kočovníci','Epizootic Disease':'Nakažené zvířectvo','Animal Mutation':'Zmutovaná zvířata',
    // rooms
    'Command Post':'Velitelství','Workshop':'Dílna','Armory':'Zbrojnice','Foundry':'Slévárna','Hunting Lodge':'Lovecká chata','Freight Depot':'Nákladní sklad','Loading Dock':'Nakládací rampa',
    'Cistern':'Cisterna','Blast Bunker':'Bunkr','Scrap Yard':'Šrotiště','Scrubber':'Dekontaminátor','Seal Door':'Těsnicí dveře','Barracks':'Kasárna','Scout Post':'Stanoviště průzkumníků',
    'Salvage Lab':'Recyklační laboratoř','Supply Cache':'Skrýš zásob','Intel Office':'Zpravodajská kancelář','Guard Post':'Strážní stanoviště','Mechanic Bay':'Mechanická dílna',
    'Snare Line':'Řada pastí','Enforcer Hall':'Síň vymahačů','Forager Den':'Doupě sběračů','Rebuild Shop':'Opravna',
    // colours
    'escapes with':'uniká s','activated':'aktivní','idle':'ležící','rats':'krysy','starvation':'hlad','Purple':'Fialová','Orange':'Oranžová','Sand':'Béžová','Blue':'Modrá'
  };
  const GKEYS=Object.keys(GLOSS).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  const GRE=new RegExp('(?<![\\p{L}\\p{N}])('+GKEYS.join('|')+')(?![\\p{L}\\p{N}])','gu');

  /* ---- exact phrases (trimmed text of one piece of the screen) ---- */
  const EXACT={
    // ---- shell / top bar
    'Setup':'Příprava','Game over':'Konec hry','Dawn':'Úsvit','Day':'Den','Night':'Noc','Day phase':'Fáze dne','Night phase':'Fáze noci','DAY':'DEN',
    'digital prototype':'digitální prototyp','OUTLIVE':'PUSTINA','Active events':'Aktivní události','No active events':'Žádné aktivní události',
    'Game log':'Záznam hry','Welcome to the wasteland.':'Vítejte v pustině.','AI':'AI','(AI)':'(AI)',
    'First Player token':'Žeton prvního hráče','Radiation added to every Shelter tonight':'Radiace, která dnes v noci přibude každému úkrytu',
    // ---- turn bar
    '▶ YOUR TURN':'▶ VÁŠ TAH','Make your choice.':'Proveďte svůj výběr.',
    'Tap one of your glowing Heroes, then a highlighted Location.':'Klepněte na svítícího hrdinu a poté na zvýrazněnou lokaci.',
    'Now tap a highlighted Location to move there.':'Nyní klepněte na zvýrazněnou lokaci, kam se přesunout.',
    'Manage your Shelter: recruit, fill Rooms, build, repair — then press End turn.':'Spravujte úkryt: nábor, obsazení místností, stavba, opravy — pak stiskněte Ukončit tah.',
    "End Hero's turn":'Ukončit tah hrdiny','End turn':'Ukončit tah','Move a Hero first':'Nejdřív pohněte hrdinou',
    // ---- board
    'needs 1💾':'vyžaduje 1💾','🌿 Algae':'🌿 Řasy','🌿 Algae taken':'🌿 Řasy odebrány','ready':'připraveno',
    'Wild Game stack: only the top tile can be hunted':'Hromádka kořisti: lovit lze jen vrchní žeton','Needs Grappling Hook':'Vyžaduje vystřelovací hák',
    'Supplies per night while occupied':'Potraviny za noc, je-li obsazeno','Survivors':'Přeživší',
    // ---- shelter
    'Projected Survival Points':'Předpokládané body přežití (BP)','Recruit':'Nábor','Max':'Max','Fill':'Naplnit','+1 from Airlock':'+1 z komory','Use ability':'Použít efekt',
    'Repair':'Opravit','None yet.':'Zatím žádné.','Overcame':'Zažehnáno','broken ·':'rozbité ·',
    // ---- action panel
    "— tap one of your glowing Heroes":'— klepněte na svítícího hrdinu','— tap a highlighted Location to move there':'— klepněte na zvýrazněnou lokaci, kam se přesunout',
    "(1–2 steps along the arrows; you can't stop on your own Heroes)":'(1–2 kroky po šipkách; nesmíte skončit u vlastního hrdiny)',
    "End this Hero's turn":'Ukončit tah tohoto hrdiny','Unused Action Points are lost':'Nevyužité akční body propadají',
    '— manage your Shelter: recruit, move Survivors into Rooms, build, repair. Press':'— spravujte úkryt: nábor, přesun přeživších do místností, stavba, opravy. Stiskněte',
    'when done.':'až budete hotovi.','left':'zbývá',
    // ---- banners / modals
    'Overcome events · feed · radiation · recruit · build · repair':'Události · krmení · radiace · nábor · stavba · opravy','Dawn — the wastelands are replenished':'Úsvit — pustina je doplněna',
    'Continue':'Pokračovat','Close':'Zavřít','Confirm':'Potvrdit','Back':'Zpět','Cancel':'Zrušit','Yes':'Ano',"I'm ready":'Jsem připraven(a)',
    'Pass the device to':'Předejte zařízení hráči','Everyone else look away — only the next player needs the screen.':'Ostatní, odvraťte zrak — obrazovku potřebuje jen další hráč.',
    'Overcome during the Night for':'Zažehnat v noci za','. Until then its effect repeats every day.':'. Do té doby se jeho efekt opakuje každý den.','Overcome:':'Zažehnání:',
    'Repair cost:':'Cena opravy:','Pair symbol':'Symbol sady','(left half): repaired matching halves score +1 SP.':'(levá polovina): opravené odpovídající poloviny dávají +1 BP.',
    '(right half): repaired matching halves score +1 SP.':'(pravá polovina): opravené odpovídající poloviny dávají +1 BP.',
    'Top of the pile first. Keep it secret!':'Vrchní žeton je první. Držte to v tajnosti!',
    '💧 Water':'💧 Voda','🥫 Canned':'🥫 Konzervy','🪵 Wood':'🪵 Dřevo','🔩 Metal':'🔩 Kov','💾 Chip':'💾 Mikročip','💥 Munitions':'💥 Střelivo','🌿 Algae':'🌿 Řasy','∅ Empty':'∅ Prázdné',
    'Final scores after 6 days.':'Konečné skóre po 6 dnech.','Events':'Události','Rooms':'Místnosti','Equip':'Vyb.','Pairs':'Sady','Total':'Celkem',
    'Ties: most Supplies, then most Materials + Munitions.':'Při remíze: nejvíce potravin, poté nejvíce materiálů + střeliva.',
    'Look at the board':'Prohlédnout desku','Main menu':'Hlavní menu','Play again':'Hrát znovu',
    'Starting Survivors':'Počáteční přeživší','Choose what to pay':'Vyberte, čím zaplatíte','Pass':'Vzdát se tahu','Let the next Tribe decide.':'Nechte rozhodnout dalšího hráče.',
    '(Command Post discount)':'(sleva Velitelství)','Overcome Events to stop their effects and score their Survival Points.':'Zažehněte události, aby přestaly působit, a získejte jejich body přežití.',
    // ---- engine prompts
    'Your Leader sets your starting locations, resources and equipment. The oldest Leader goes first.':'Vůdce určuje vaše počáteční lokace, suroviny a vybavení. Hru začíná hráč s nejstarším vůdcem.',
    'You start with 4 Survivors. A Room only works when every space is filled.':'Začínáte se 4 přeživšími. Efekt místnosti funguje, jen když je obsazena každé pole.',
    'Give 1 Supply or 1 Material.':'Odevzdejte 1 potravinu nebo 1 materiál.','Which City pile?':'Která hromádka města?','Destroy which Equipment?':'Které vybavení zničit?',
    'Hunt: spend Munitions?':'Lov: utratit střelivo?','Not enough Action Points or Munitions for that beast.':'Nemáte dost akčních bodů nebo střeliva pro tuto kořist.',
    '— ability active':'— efekt aktivní','radiation overflow':'přetečení radiace','(top)':'(vrchní)','(Grappling Hook)':'(Vystřelovací hák)','(occupied — Loading Dock)':'(obsazeno — Nakládací rampa)',
    '(repaired)':'(opravené)','(broken)':'(rozbité)','repaired':'opravené','broken':'rozbité','free':'zdarma',
    'Nomads strip the Cities of Search tiles.':'Kočovníci vyplenili města — ubývá žetonů prohledávání.','The Radioactive Cloud passes over every Shelter.':'Radioaktivní mrak přechází přes každý úkryt.',
    'Enemy Clan raided 2 tokens.':'Nepřátelský kmen ukradl 2 žetony.','-2 raided':'−2 přepadeno','1st player':'1. hráč','empty':'prázdné','✓ turn ended':'✓ tah ukončen',
    'Open the filtration':'Spustit dekontaminátor','Access Card — free':'Přístupová karta — zdarma','Spend 1💾 (free action)':'Utratit 1💾 (volná akce)',
    'Harvest Anti-Radiation Algae':'Sebrat antiradiační řasy','1 AP · radiation −1':'1 AP · radiace −1','Draw a Search tile':'Vzít žeton prohledávání',
    'Look through a Search pile':'Prohlédnout hromádku prohledávání','Intel Office · free':'Zpravodajská kancelář · zdarma',
    // ---- room timing labels
    'Night · Events':'Noc · Události','Night · Repair':'Noc · Opravy','Night · Shelter':'Noc · Úkryt','Night · Build':'Noc · Stavba','Day · Hunt':'Den · Lov',
    'Day · Cargo':'Den · Nákladní loď','Permanent':'Trvalé','Night · Radiation':'Noc · Radiace','Day · City':'Den · Města','Day · Pressure':'Den · Nátlak',
    // ---- room texts
    'Once a turn: Overcome an Event for 2 fewer Materials/Munitions, or 1 fewer Supply.':'Jednou za kolo: zažehnejte událost o 2 materiály/střeliva levněji, nebo o 1 potravinu levněji.',
    'Once a turn: repair a piece of Equipment for 1 fewer Material.':'Jednou za kolo: opravte vybavení o 1 materiál levněji.',
    'Once a turn: take 4 Munitions.':'Jednou za kolo: vezměte si 4 střeliva.',
    'Once a turn: build a Room for 2 fewer Materials.':'Jednou za kolo: postavte místnost o 2 materiály levněji.',
    'Once a turn: +2 Meat after a successful Hunt.':'Jednou za kolo: +2 masa po úspěšném lovu.',
    'Once a turn: +1 Canned Goods when you visit the Cargo Ship.':'Jednou za kolo: +1 konzerva při návštěvě Nákladní lodi.',
    'Once a turn: +2 Canned Goods at the Cargo Ship; its spaces are always available to you.':'Jednou za kolo: +2 konzervy na Nákladní lodi; její pole jsou vám vždy dostupná.',
    'Your Shelter produces 1 Water each turn (not stored).':'Váš úkryt vyrobí každé kolo 1 vodu (neukládá se).',
    'Immune to Events that affect your Tribe (not Cave-in, Wildfire, Nomads, Lean Times, Thieves).':'Imunita vůči událostem postihujícím váš kmen (ne Zával, Lesní požár, Kočovníci, Totální nedostatek, Lupiči).',
    'Once a turn: destroy 1 of your Equipment and take its Materials.':'Jednou za kolo: zničte 1 své vybavení a získejte jeho materiály.',
    'Once a turn: lower your Radioactivity by 1.':'Jednou za kolo: snižte svou radioaktivitu o 1.',
    'Your Airlock absorbs 1 extra Radiation point, even if empty.':'Vaše přechodová komora pohltí 1 bod radiace navíc, i když je prázdná.',
    'Once a turn: add 1 Survivor from the reserve to this Room (up to 8 in it).':'Jednou za kolo: přidejte do této místnosti 1 přeživšího ze zásoby (max. 8).',
    'Once per City: after a Search, draw 2 more Search tiles for free.':'Jednou za město: po prohledávání zdarma vezměte 2 další žetony prohledávání.',
    'Once a turn: draw 2 Equipment tiles (broken).':'Jednou za kolo: vezměte 2 žetony vybavení (rozbité).',
    'Once a turn: draw 1 Equipment tile (broken).':'Jednou za kolo: vezměte 1 žeton vybavení (rozbité).',
    'Once a turn: look through one City Search pile.':'Jednou za kolo: prohlédněte si jednu hromádku prohledávání.',
    'Once a turn: one of your Strength-3 Heroes ignores one Pressure.':'Jednou za kolo: jeden váš hrdina H3 ignoruje jeden nátlak.',
    'Once a turn: repair 1 Equipment for free.':'Jednou za kolo: zdarma opravte 1 vybavení.',
    'Once a turn: +1 Meat after a successful Hunt.':'Jednou za kolo: +1 maso po úspěšném lovu.',
    'When you Pressure a Hero, you choose the tribute (not Munitions).':'Když vyvíjíte nátlak, tribut (kromě střeliva) si vybíráte vy.',
    'Once per City: an Empty Cupboard gives +1 Wood and +1 Metal.':'Jednou za město: prázdná skříňka dává +1 dřevo a +1 kov.',
    'Once a turn: repair Equipment for 2 fewer Materials.':'Jednou za kolo: opravte vybavení o 2 materiály levněji.',
    // ---- equipment texts
    'Forest: +2 Wood when you scavenge Wood.':'Les: +2 dřeva při sběru dřeva.','City: take 2 Wood when you visit.':'Město: 2 dřeva při návštěvě.',
    'Forest: take 1 Meat when you visit.':'Les: 1 maso při návštěvě.','Hunting: +1 Strength.':'Lov: +1 k síle.','Dam: +1 Water when you scavenge Water.':'Přehrada: +1 voda při sběru vody.',
    'Mine: take 1 Water when you visit.':'Důl: 1 voda při návštěvě.','Dam: open the filtration for free.':'Přehrada: dekontaminátor zdarma (bez mikročipu).',
    'Military Base: take 2 Microchips when you visit.':'Vojenská základna: 2 mikročipy při návštěvě.','Military Base: +2 Munitions when you scavenge Munitions.':'Vojenská základna: +2 střeliva při sběru střeliva.',
    'Pressure suffered: -2.':'Utrpěný nátlak: −2.','Mine: +2 Metal when you scavenge Metal.':'Důl: +2 kovy při sběru kovů.','Cargo Ship: take 2 Metal when you visit.':'Nákladní loď: 2 kovy při návštěvě.',
    'City: take 1 Survivor when you visit.':'Město: 1 přeživší při návštěvě.','Hunting: look through the Wild Game and choose your prey.':'Lov: prohlédněte kořist a vyberte si ji.',
    'Fairgrounds: +2 Microchips when you scavenge Microchips.':'Lunapark: +2 mikročipy při sběru mikročipů.','Fairgrounds: take 1 Canned Goods when you visit.':'Lunapark: 1 konzerva při návštěvě.',
    'Cargo Ship: +1 Strength to reach a higher spot (only way onto spot 6).':'Nákladní loď: +1 k síle pro vyšší pozici (jediná cesta na pole 6).',
    'Move one Hero as far as you wish.':'Pohněte jedním hrdinou, kam chcete.','Pressure applied: +1.':'Vyvíjený nátlak: +1.',
    // ---- event texts
    'Each day: remove Wood from the Forest.':'Každý den: odeberte dřevo z Lesa.','Each day: remove Metal from the Mine.':'Každý den: odeberte kovy z Dolu.',
    'Each day: remove Microchips from the Fairgrounds.':'Každý den: odeberte mikročipy z Lunaparku.','All Heroes act with Strength 3 (Pressure unchanged).':'Všichni hrdinové jednají se silou 3 (nátlak beze změny).',
    'Each day: remove Wood, Metal and Microchips from the wilds.':'Každý den: odeberte dřevo, kovy a mikročipy z divočiny.','Each day: every Shelter takes 2 more Radiation.':'Každý den: každý úkryt dostane o 2 radiace víc.',
    'Each day: every Shelter loses 1 Supply (or 1 Survivor).':'Každý den: každý úkryt ztrácí 1 potravinu (nebo 1 přeživšího).',
    'Each day: every Shelter loses 2 Materials/Munitions (or 1 Survivor).':'Každý den: každý úkryt ztrácí 2 materiály/střelivo (nebo 1 přeživšího).',
    'Each day: every Shelter loses 1 Survivor.':'Každý den: každý úkryt ztrácí 1 přeživšího.','Each day: Search tiles are removed from each City.':'Každý den: z každého města ubývají žetony prohledávání.',
    'Wild Game yields 1 less Meat.':'Kořist poskytuje o 1 maso méně.','Wild Game has +1 Endurance.':'Kořist má o 1 vyšší vytrvalost.',
    // ---- menu / pause / settings
    'New game':'Nová hra','Tutorial':'Tutoriál','How to play':'Jak hrát','Settings':'Nastavení','About':'O hře','Custom artwork':'Vlastní obrázky','Custom artwork…':'Vlastní obrázky…',
    'Six days · One Convoy · No mercy':'Šest dní · Jeden Konvoj · Žádné slitování','Tap anywhere to start the music':'Klepnutím kamkoli spustíte hudbu',
    'Gather, feed, build and outlast the other Tribes.':'Sbírejte, krmte, stavějte a přečkejte ostatní kmeny.','Players':'Hráči','Human':'Člověk','Start game':'Začít hru',
    'Mix humans and AI freely — all-human games work as hot-seat (the device is passed around). Switch every seat to AI to just watch.':'Lidi a AI můžete libovolně míchat — hra jen s lidmi funguje na jednom zařízení (předává se dál). Přepnutím všech míst na AI můžete jen sledovat.',
    '🎵 Music':'🎵 Hudba','Music volume':'Hlasitost hudby','🔊 Sound effects':'🔊 Zvukové efekty','Effects volume':'Hlasitost efektů','Opponent speed':'Rychlost soupeřů',
    'Slow':'Pomalu','Normal':'Normálně','Fast':'Rychle','Turbo':'Turbo','Animations':'Animace','Follow opponents (show their Shelter)':'Sledovat soupeře (ukázat jejich úkryt)',
    'Your own map & Leader pictures':'Vaše vlastní mapa a obrázky vůdců','Language':'Jazyk','Water per night while occupied':'Voda za noc, je-li obsazeno','Start positions':'Startovní pozice','Starting resources':'Počáteční suroviny','Starting equipment':'Počáteční vybavení','Age':'Věk','Convoy Board':'Deska Konvoje','Active':'Aktivní','✓ Overcome ·':'✓ Zažehnáno ·','needs 1':'vyžaduje 1','next:':'další:','· empty':'· prázdné','tiles':'žetonů','taken':'odebrány','Night phase':'Fáze noci','Wild Game caught':'Ulovená kořist','Matching halves':'Odpovídající poloviny','tonight':'dnes v noci','Food':'Jídlo','Overcome Events':'Zažehnání událostí','Leader name':'Jméno vůdce','Eight Locations connected in a ring of arrows':'Osm lokací propojených v okruhu šipek','Music on/off':'Hudba zap./vyp.','Sound effects on/off':'Zvukové efekty zap./vyp.','Pause menu (Esc)':'Menu pauzy (Esc)',
    'Paused':'Pozastaveno','Tutorial game':'Tutoriálová hra','The wasteland waits for you.':'Pustina na vás čeká.','Resume':'Pokračovat ve hře','Tutorial primer':'Tutoriál (přehled)',
    'Restart game':'Restartovat hru','Restart this game?':'Restartovat tuto hru?','Start the tutorial?':'Spustit tutoriál?','Return to the main menu?':'Vrátit se do hlavního menu?',
    'Your current game will be abandoned.':'Rozehraná hra bude opuštěna.','How a game works':'Jak hra probíhá',
    'Use your own pictures from the board game (e.g. photos or scans of your copy). They are stored only on this device, in this browser, and are never uploaded anywhere.':'Použijte vlastní obrázky z deskové hry (např. fotky nebo skeny vaší krabice). Ukládají se jen v tomto zařízení a prohlížeči a nikam se nenahrávají.',
    'Replace':'Nahradit','Choose image':'Vybrat obrázek','Loading…':'Načítání…','Remove':'Odebrat','Board map (the whole map picture)':'Herní plán (celý obrázek mapy)','Leaders':'Vůdci',
    'Give each Leader the name and portrait from your card. Names are saved too.':'Dejte každému vůdci jméno a portrét z vaší karty. Jména se také ukládají.','Portrait':'Portrét',
    // ---- coach titles
    'Choose a Leader':'Výběr vůdce','Advanced Rooms':'Pokročilé místnosti','Place your Heroes':'Umístěte své hrdiny','A new day':'Nový den','Convoy Events':'Události Konvoje',
    'Move a Hero':'Pohyb hrdiny','Choose a destination':'Vyberte cíl','Actions':'Akce','Night falls':'Padá noc','Your Shelter':'Váš úkryt','Opponents':'Soupeři','Got it':'Rozumím',
    // ---- tutorial slides (button labels)
    'Next':'Další','Skip':'Přeskočit','Not now':'Teď ne','Play tutorial game':'Spustit tutoriál','Welcome to the wasteland':'Vítejte v pustině'
  };

  /* ---- sentence patterns. {n} = translate group n again; $n = copy group n ---- */
  const RULES=[
    [/^DAY (\d)$/,'DEN $1'],[/^Night (\d)$/,'Noc $1'],[/^Day (\d)$/,'Den $1'],[/^Player (\d)$/,'Hráč $1'],[/^(.+) first$/,'$1 začíná'],
    [/^tonight \+(\d)$/,'dnes v noci +$1'],[/^Pair: (.+) \+ (.*) — when both are repaired the two halves of the symbol join: \+1 SP\.$/,'Sada: {1} + {2} — po opravě obou se obě poloviny symbolu spojí: +1 BP.'],[/^Outlive · (.+)$/,'Pustina · $1'],[/^Tutorial · (.+)$/,'Tutoriál · {1}'],
    [/^☢ tonight \+(\d)$/,'☢ dnes v noci +$1'],[/^🦌 (\d+) · next:$/,'🦌 $1 · další:'],[/^🦌 (\d+) · empty$/,'🦌 $1 · prázdné'],[/^🔎 (\d+) tiles$/,'🔎 $1 žetonů'],
    [/^Strength (\d)$/,'Síla $1'],[/^Radioactivity: (-?\d+) \(scores (.+) SP\)$/,'Radioaktivita: $1 (BP: $2)'],[/^absorbs (\d+) ☢ per night$/,'pohltí $1 ☢ za noc'],
    [/^Build · (\d+) Materials?$/,'Postavit · $1 mat.'],[/^(.+) · used$/,'{1} · použito'],[/^Recruit (\d+)$/,'Naverbovat $1'],
    [/^Supplies (\d+) · Airlock free (\d+)$/,'Potraviny $1 · volno v komoře $2'],
    [/^Wild Game caught: (.+)$/,'Ulovená kořist: $1'],
    [/^Score now: events (\d+) · rooms (\d+) \((\d+) full\) · radiation (-?\d+) · survivors (\d+) · equipment (\d+)\+(\d+) pairs$/,'Skóre nyní: události $1 · místnosti $2 ($3 plných) · radiace $4 · přeživší $5 · vybavení $6+$7 sad'],
    [/^Hero \(Strength (\d)\) at (.+) · (\d+) AP left — choose an action\.$/,'Hrdina H$1 v lokaci {2} · zbývá $3 AP — vyberte akci.'],
    [/^· Strength (\d) Hero at$/,'· hrdina H$1 v lokaci'],
    [/^▶ (.+)'S TURN$/,'▶ TAH HRÁČE $1'],[/^(.+) \(AI\) is playing…$/,'$1 (AI) hraje…'],
    [/^Hunt \(Endurance (\d+)( ▲)?\)$/,'Lov (vytrvalost $1$2)'],[/^Gather (\d+) (.+)$/,'Sebrat $1× {2}'],
    [/^Yield ≈ (\d+)🍖 · costs (\d+) AP, minus 1 per 💥 spent(.*)$/,'Výnos ≈ $1🍖 · stojí $2 AP, −1 za každé 💥{3}'],[/^· Strength gear −(\d+)$/,'· bonus síly −$1'],
    [/^1 AP · (\d+) left in the pile$/,'1 AP · v hromádce zbývá $1'],[/^Salvage (.+)$/,'Sebrat vybavení: {1}'],[/^1 AP · arrives broken · repair (.+)$/,'1 AP · rozbité · oprava $1'],
    [/^Endurance (\d+)\. Each 💥 spent reduces it by 1; remaining cost is paid in Action Points \(you have (\d+)\)\.$/,'Vytrvalost $1. Každé utracené 💥 ji sníží o 1; zbytek se platí akčními body (máte $2).'],
    [/^Endurance (\d+) → (\d+)🍖(.*)$/,'Vytrvalost $1 → $2🍖{3}'],
    [/^(.+): Thermal Sensor — choose your prey$/,'$1: Infračervený senzor — vyberte kořist'],
    [/^Event: (.+)$/,'Událost: {1}'],[/^(.+) — the night so far$/,'$1 — noc doposud'],[/^(.+) — Search pile$/,'{1} — hromádka prohledávání'],
    [/^(.+) escapes with Convoy!$/,'$1 uniká s Konvojem!'],
    [/^Pick exactly (\d+)\.$/,'Vyberte přesně $1.'],[/^Confirm \((\d+)\/(\d+)\)$/,'Potvrdit ($1/$2)'],[/^Choose (\d+) tokens? to pay\.$/,'Vyberte $1 žetonů k zaplacení.'],[/^\(have (\d+)\)$/,'(máte $1)'],
    [/^Cost (.+?)( \(Command Post discount\))? — (.+)$/,'Cena $1{2} — {3}'],[/^(.+): Overcome an Event\?$/,'$1: zažehnat událost?'],
    [/^Returns (.+)$/,'Vrátí $1'],[/^(.+) \((repaired|broken)\)$/,'$1 ({2})'],
    /* ---- engine messages ---- */
    [/^(.+) draws (.+) \(broken\)\.$/,'$1 si bere vybavení: {2} (rozbité).'],
    [/^(.+): choose your Leader$/,'$1: vyberte si vůdce'],[/^(.+) \(age (\d+)\)$/,'$1 (věk $2)'],
    [/^Start: (.+) · (.+) · (.+) \(broken\)$/,'Start: {1} · $2 · {3} (rozbité)'],
    [/^(.+): keep 4 of these 6 Advanced Rooms$/,'$1: ponechte si 4 ze 6 pokročilých místností'],
    [/^(.+) · (\d+) spaces · upkeep (\d+) · (.+)$/,'{1} · $2 míst · údržba $3 · {4}'],
    [/^(.+): build one Room for free$/,'$1: zdarma postavte jednu místnost'],
    [/^You have 4 Survivors\. How many go in (.+) \((\d+) spaces\)\? The rest wait in the Airlock\.$/,'Máte 4 přeživší. Kolik jich půjde do místnosti {1} ($2 míst)? Zbytek čeká v přechodové komoře.'],
    [/^(.+) has the oldest Leader and starts as First Player\.$/,'$1 má nejstaršího vůdce a začíná jako první hráč.'],
    [/^(.+): place your Strength (\d) Hero on one of the highlighted Locations$/,'$1: umístěte hrdinu H$2 na jednu ze zvýrazněných lokací'],
    [/^— Day (\d) · Dawn: the wastelands are replenished\.$/,'— Den $1 · Úsvit: pustina je doplněna.'],[/^— Day (\d) · Night falls\.$/,'— Den $1 · Padá noc.'],
    [/^Airlock \((\d+)\)$/,'Přechodová komora ($1)'],
    [/^(.+): lose a Survivor — from where\?$/,'$1: ztrácíte přeživšího — odkud?'],
    [/^(.+) loses (\d+) Survivors? \((.+)\)\.$/,'$1 ztrácí přeživší: $2 ({3}).'],[/^(.+) loses (\d+) Survivors?\.$/,'$1 ztrácí přeživší: $2.'],
    [/^Lost (\d+) Survivors? — (.+)\.$/,'Ztraceno přeživších: $1 — {2}.'],[/^Lost (\d+) Survivors?\.$/,'Ztraceno přeživších: $1.'],
    [/^(.+) has no room for a new Survivor\.$/,'$1 nemá místo pro nového přeživšího.'],[/^(.+): place the new Survivor$/,'$1: umístěte nového přeživšího'],
    [/^(.+) gains a Survivor\.$/,'$1 získává přeživšího.'],
    [/^Convoy Event revealed: (.+)\.$/,'Odhalena událost Konvoje: {1}.'],
    [/^(.+)'s bunker shrugs off the cloud\.$/,'Bunkr hráče $1 mraku odolal.'],
    [/^(.+): rats! Lose 1 Supply$/,'$1: krysy! Ztrácíte 1 potravinu'],[/^Rats eat (.+)'s (.+)\.$/,'Krysy: hráč $1 přichází o {2}.'],[/^Rats ate 1 (.+)\.$/,'Krysy sežraly 1 {1}.'],
    [/^(.+): Enemy Clan raid! Lose a Material\/Munition \((\d)\/2\)$/,'$1: nájezd nepřátelského kmene! Ztrácíte materiál/střelivo ($2/2)'],
    [/^The Enemy Clan raids (.+) \(-2 tokens\)\.$/,'Nepřátelský kmen přepadá hráče $1 (−2 žetony).'],
    [/^(.+)'s Hero is stuck and stays put\.$/,'Hrdina hráče $1 se nemůže pohnout a zůstává.'],
    [/^(.+) moves a Strength (\d) Hero: (.+) → (.+)\.$/,'$1 přesouvá hrdinu H$2: {3} → {4}.'],
    [/^(.+): pick a Cargo Ship spot$/,'$1: vyberte pole Nákladní lodi'],[/^Spot (\d): (.+)$/,'Pole $1: {2}'],[/^(\d)🥫 \+ 1 Survivor(.*)$/,'$1🥫 + 1 přeživší{2}'],
    [/^(.+) takes the First Player token for the coming night\.$/,'$1 získává žeton prvního hráče pro nadcházející noc.'],
    [/^(.+)'s Battle Gear absorbs 2 Pressure\.$/,'Brnění hráče $1 pohlcuje 2 body nátlaku.'],[/^(.+)'s Guard Post turns the Pressure aside\.$/,'Strážní stanoviště hráče $1 odvrací nátlak.'],
    [/^(.+): Pressure!$/,'$1: nátlak!'],
    [/^(.+)'s Strength (\d) Hero presses your Strength (\d) Hero for (\d+) tribute\. Spend Munitions to reduce it by 1 each\?$/,'Hrdina H$2 hráče $1 vyvíjí nátlak na vašeho hrdinu H$3: tribut $4. Utratit střelivo (−1 za kus)?'],
    [/^(.+) spends (\d+)💥 to resist Pressure\.$/,'$1 utrácí $2💥 na odvrácení nátlaku.'],
    [/^(.+): choose your tribute from (.+)$/,'$1: vyberte tribut od hráče $2'],[/^(.+): pay tribute to (.+)$/,'$1: zaplaťte tribut hráči $2'],
    [/^(.+) pressures (.+) and takes (.+)\.$/,'$1 vyvíjí nátlak na $2 a bere $3.'],[/^(.+) pressures (.+) — nothing gained\.$/,'$1 vyvíjí nátlak na $2 — nic nezískává.'],
    [/^⚔ (.+) presses (.+)$/,'⚔ $1 → nátlak na $2'],
    [/^(.+)'s (.+) yields (.+)\.$/,'$1: {2} dává $3.'],[/^(.+) loads (\d)🥫 at the Cargo Ship\.$/,'$1 nakládá $2🥫 na Nákladní lodi.'],
    [/^(.+): (\d) free Search tiles\.$/,'{1}: $2 žetony prohledávání zdarma.'],
    [/^(.+) hunts an Endurance-(\d) beast \((\d+) AP(.*)\) and gets (.+)\.$/,'$1 loví kořist s vytrvalostí $2 ($3 AP$4) a získává $5.'],
    [/^(.+) gathers (\S+) at (.+?) \((.+) \+(\d+)\)\.$/,'$1 sbírá $2 — {3} ({4} +$5).'],[/^(.+) gathers (\S+) at (.+)\.$/,'$1 sbírá $2 — {3}.'],
    [/^(.+) finds an empty cupboard\.$/,'$1 nachází prázdnou skříňku.'],[/^(.+) finds Algae Capsules \(radiation −1\)\.$/,'$1 nachází antiradiační prášky (radiace −1).'],
    [/^(.+) salvages a broken (.+)\.$/,'$1 sbírá rozbité vybavení: {2}.'],[/^(.+) finds (\S+) (.+)\.$/,'$1 nachází: $2 {3}.'],
    [/^(.+) opens the Dam filtration\.$/,'$1 spouští dekontaminátor na Přehradě.'],[/^(.+) harvests the Algae \(radiation −1\)\.$/,'$1 sbírá antiradiační řasy (radiace −1).'],
    [/^(.+) Overcomes (.+) \(\+(\d+) SP\) for (.+)\.$/,'$1 zažehnává: {2} (+$3 BP) za $4.'],
    [/^Fed (\d+) Survivors \(Airlock rows: (\d+)💧, Rooms upkeep\)\.$/,'Nakrmeno přeživších: $1 (řady komory: $2💧, údržba místností).'],[/^fed (\d+)👤$/,'nakrmeno $1👤'],
    [/^(.+) is short (\d+) Supply — Survivors starve\.$/,'$1 postrádá $2 potravin — přeživší hladoví.'],
    [/^(.+)'s Scrubber lowers radiation by 1\.$/,'Dekontaminátor hráče $1 snižuje radiaci o 1.'],
    [/^Radiation (\d): absorbed (\d+), leaked (\d+)\. Gauge now (-?\d+)\.$/,'Radiace $1: pohlceno $2, proniklo $3. Stupnice nyní $4.'],
    [/^(.+) takes (\d+) radiation\.$/,'$1: radiace +$2.'],
    [/^(.+) recruits (\d+) Survivors?\.$/,'$1 verbuje přeživší: $2.'],
    [/^(.+) builds (.+)\.$/,'$1 staví: {2}.'],[/^built (.+)$/,'postaveno: {1}'],[/^(.+) repairs (.+)\.$/,'$1 opravuje: {2}.'],[/^repaired (.+)$/,'opraveno: {1}'],
    [/^(.+) takes 4💥 from the Armory\.$/,'$1 bere 4💥 ze zbrojnice.'],[/^(.+)'s Barracks takes in a Survivor\.$/,'Kasárna hráče $1 přijímají přeživšího.'],
    [/^(.+) scraps (.+)\.$/,'$1 rozebírá: {2}.'],
    [/^(.+) loses (\d+) (.+)\.$/,'{1}: −$2 {3}.']
  ];

  /* ---- larger pieces of text, translated as a whole ---- */
  const COACH={
    leader:'Vůdce určuje vaše <b>počáteční lokace</b> (kde začnou vaši 4 hrdinové), počáteční suroviny a jedno rozbité vybavení. Hráč s nejstarším vůdcem hraje první.',
    rooms:'Místnosti pojmou přeživší na noc. Efekt místnosti funguje, jen když je <b>každé</b> pole obsazeno, a každá obsazená místnost stojí potraviny. Více plně obsazených místností dává mnohem víc bodů (1/2/4/7/11/17).',
    place:'Hra začíná umístěním vašich 4 hrdinů (síla 5, 4, 3, 3), jednoho po druhém, na <b>zvýrazněné lokace</b> — startovní pozice vašeho vůdce. Vyberte, kde chcete sbírat jako první.',
    dawn:'Každý úsvit se do lokací vrátí suroviny a odhalí se událost dne. Poté každý hráč postupně pohybuje svými 4 hrdiny.',
    night:'V noci se řeší události, všichni <b>krmí své přeživší</b> a čelí <b>radiaci</b>; poté spravujete úkryt: nábor, obsazení místností, stavba a opravy.',
    ai:'Když horní lišta říká <b>(AI) hraje</b>, táhne soupeř. Sledujte desku: jeho hrdina doletí na novou lokaci, plovoucí štítky ukážou, co získal, a lišta popisuje každý krok. Rychlost změníte v menu pauzy.',
    event:'Každý den se odhalí nová událost. Její škodlivý efekt se opakuje každý den, dokud ji někdo v noci <b>nezažehne</b> zaplacením ceny — což navíc dává body přežití.',
    move1:'Jste na tahu! Klepněte na jednoho ze svých <b>svítících hrdinů</b> (číslo je jeho síla = akční body). Ležící (neaktivní) hrdinové se tento den ještě nehýbali. Tip: vytáhněte dolní lištu a uvidíte svůj <b>bunkr</b>; tlačítko <b>Události</b> nahoře otevře desku Konvoje.',
    move2:'<b>Zvýrazněné lokace</b> jsou místa, kam může tento hrdina jít: 1 nebo 2 kroky po zářících šipkách. Nesmíte skončit v lokaci, kde už stojí jiný váš hrdina.',
    act:'Váš hrdina má akční body (AP) rovné své síle. Můžete <b>sbírat</b> suroviny, <b>lovit</b> kořist, <b>prohledávat</b> města nebo <b>sbírat vybavení</b>. Nevyužité AP propadají — utraťte je, nebo stiskněte <b>Ukončit tah hrdiny</b>.',
    press:'Příchod k <i>slabším aktivním</i> hrdinům vám umožní vyvinout <b>nátlak</b>: odevzdají 1 potravinu/materiál za každý bod rozdílu síly — pokud neutratí 💥 střelivo na odpor.',
    shelter:'<b>Naverbujte</b> přeživší za potraviny (čekají v přechodové komoře) a pak je <b>přesuňte do místností</b>. Plné místnosti dávají body a efekty, ale přeživší v místnostech už nikdy neodejdou. Můžete také <b>stavět</b> místnosti za materiály a <b>opravovat</b> vybavení. Až skončíte, stiskněte <b>Ukončit tah</b>.'
  };
  const ABOUT='<p><b>Pustina (Outlive)</b> — digitální prototyp {V}.</p><p>Neoficiální fanouškovská adaptace deskové hry Outlive / Pustina pro hru jednoho hráče i na jednom zařízení. Není spojena s vydavatelem ani jím podporována. Veškerá grafika, hudba a zvuky této verze jsou původní a vytvářejí se přímo ve vašem prohlížeči.</p>';
  const RULES_CS=`<p><b>Cíl.</b> Přežijte 6 dní a získejte nejvíce <b>bodů přežití (BP)</b>.</p>
<p><b>Každý den:</b> <b>Úsvit</b> (lokace se doplní, odhalí se událost Konvoje) → <b>Den</b> (hráči postupně pohybují hrdiny a ti provádějí akce) → <b>Noc</b> (události, krmení, radiace, nábor, stavba, opravy).</p>
<p><b>Mapa.</b> 8 lokací tvoří jeden okruh spojený obousměrnými zelenými šipkami. Hrdina se pohne o <b>1–2 pole</b> po šipkách a nesmí skončit v lokaci, kde už je jiný hrdina jeho barvy.</p>
<p><b>Hrdinové</b> mají sílu 5/4/3/3 = akční body (AP). Příchod k slabším <i>aktivním</i> hrdinům umožní vyvinout <b>nátlak</b>: odevzdají 1 potravinu/materiál za každý bod rozdílu síly — nebo utratí 💥 střelivo na obranu.</p>
<p><b>Noc:</b> zaplaťte potraviny (🍖💧🥫) za každou obsazenou místnost a 💧 za každou použitou řadu přechodové komory (řada 1 pojme 2 přeživší, řada 2 pojme 5), jinak přeživší zahynou. Přeživší v komoře pohlcují radiaci. Efekt místnosti funguje, jen když je <i>každé</i> pole obsazeno; přeživší v místnostech už nikdy neodejdou.</p>
<p><b>Body:</b> zažehnané události + plně obsazené místnosti (1→0, 2→1, 3→2, 4→4, 5→7, 6→11, 7→17) + stupeň radioaktivity + přeživší + opravené vybavení (+1 za každou dvojici stejných symbolů).</p>
<p class="muted">Remíza: nejvíce potravin, poté nejvíce materiálů + střeliva.</p>`;
  const SLIDES_CS=[
    {t:'Vítejte v pustině',h:'Svět skončil. Za <b>6 dní</b> dorazí Konvoj a zachrání úkryty, které ještě stojí. Vedete kmen přeživších — vyhraje ten, kdo bude mít při jeho příjezdu nejvíc <b>bodů přežití</b>.'},
    {t:'Den, noc, den…',h:'<b>Úsvit:</b> lokace se doplní a objeví se událost Konvoje.<br><b>Den:</b> hráči se střídají v pohybu hrdinů a sběru surovin.<br><b>Noc:</b> nakrmte přeživší, vydržte radiaci, naverbujte, stavějte a opravujte.'},
    {t:'Mapa je okruh',h:'8 lokací je propojeno jedním okruhem obousměrných zelených šipek. Každý hrdina se pohybuje o <b>1 nebo 2 pole</b> po šipkách. Máte 4 hrdiny se silou <b>5, 4, 3, 3</b>. Klepněte na svítícího hrdinu a poté na zvýrazněnou lokaci.'},
    {t:'Akce a nátlak',h:'Po pohybu má hrdina <b>akční body = síla</b>. Utratíte je za sběr, lov, prohledávání měst nebo sbírání vybavení. Pokud dorazíte k <i>slabším aktivním</i> hrdinům, můžete na ně vyvinout <b>nátlak</b>: musí vám dát suroviny (nebo utratit 💥 střelivo).'},
    {t:'Přežít noc',h:'Každou noc stojí každá místnost s přeživšími <b>potraviny</b>. Radiace roste každým dnem; přeživší čekající v <b>přechodové komoře</b> ji pohlcují. Zažehnáním událostí (zaplacením ceny) zrušíte jejich kletbu a získáte body.'},
    {t:'Váš úkryt',h:'<b>Naverbujte</b> přeživší do přechodové komory a pak je <b>přesuňte do místností</b>. Místnost funguje, jen když je každé pole plné — a přeživší v místnostech už nikdy neodejdou. <b>Stavějte</b> místnosti za materiály, <b>opravujte</b> rozbité vybavení pro bonusy.'},
    {t:'Bodování',h:'Body získáte za zažehnané události, <b>plně obsazené místnosti</b> (1→0, 2→1, 3→2, 4→4, 5→7, 6→11, 7→17), stupeň radioaktivity, přeživší a opravené vybavení (+1 za každou odpovídající dvojici).'},
    {t:'Připraveni? Zahrajte si vedenou hru',h:'Tutoriálová hra je krátká skutečná partie proti jednomu soupeři. Nápovědy se objevují dole na obrazovce podle toho, co se děje — zavřete je tlačítkem „Rozumím“.'}
  ];

  /* ---- engine ---- */
  const sub=(tpl,mm)=>tpl.replace(/\{(\d)\}/g,(_,i)=>tr(mm[i]||'')).replace(/\$(\d)/g,(_,i)=>mm[i]||'');
  function gloss(c){
    const out=c.replace(GRE,(m,_g,off)=>{
      let v=GLOSS[m];
      const pre=c.slice(0,off);
      if(/^[A-Z]/.test(m)&&/^[a-zěščřžýáíéúůďťňó]/.test(v)&&(pre===''||/(^|[·.:!?—-])\s*(\p{Extended_Pictographic}\uFE0F?\s*)?$/u.test(pre)))v=v[0].toUpperCase()+v.slice(1);
      return v;
    });
    return out;
  }
  function post(r,c){return c.length<=3?r:r.replace(/\bSP\b/g,'BP').replace(/\bEnd (\d)/g,'Vytr. $1')}
  function core(c){
    let bullet='';if(c.startsWith('• ')){bullet='• ';c=c.slice(2)}
    let r=EXACT[c];
    if(r===undefined){for(const [re,t] of RULES){const mm=re.exec(c);if(mm){r=sub(t,mm);break}}}
    if(r===undefined)r=gloss(c);
    return bullet+post(r,c);
  }
  function tr(s){
    if(lang!=='cs'||!s)return s;
    const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(!m[2])return s;
    const o=core(m[2]);return o===m[2]?s:m[1]+o+m[3];
  }

  /* ---- live page translation ---- */
  const tm=new WeakMap(),am=new WeakMap(),ATTR=['title','aria-label','placeholder'];
  function doText(n){
    const cur=n.data,m=tm.get(n);
    if(lang!=='cs'){if(m&&cur===m.cs)n.data=m.en;return}
    if(m&&cur===m.cs)return;
    if(!/[A-Za-z]/.test(cur))return;
    const cs=tr(cur);tm.set(n,{en:cur,cs});if(cs!==cur)n.data=cs;
  }
  function doAttr(el,a){
    const cur=el.getAttribute(a);if(cur==null)return;
    let rec=am.get(el);if(!rec){rec={};am.set(el,rec)}
    const m=rec[a];
    if(lang!=='cs'){if(m&&cur===m.cs)el.setAttribute(a,m.en);return}
    if(m&&cur===m.cs)return;
    const cs=tr(cur);rec[a]={en:cur,cs};if(cs!==cur)el.setAttribute(a,cs);
  }
  const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1};
  function walk(root){
    if(root.nodeType===3){doText(root);return}
    if(root.nodeType!==1||SKIP[root.tagName])return;
    if(root.id==='fxlayer'&&false)return;
    for(const a of ATTR)if(root.hasAttribute&&root.hasAttribute(a))doAttr(root,a);
    const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode:n=>n.nodeType===1&&SKIP[n.tagName]?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    let n;while((n=tw.nextNode())){if(n.nodeType===3)doText(n);else for(const a of ATTR)if(n.hasAttribute(a))doAttr(n,a)}
  }
  let mo=null;
  function start(){
    if(mo||typeof MutationObserver==='undefined'||!document.body)return;
    mo=new MutationObserver(ms=>{
      if(lang!=='cs')return;
      for(const m of ms){
        if(m.type==='childList')m.addedNodes.forEach(walk);
        else if(m.type==='characterData')doText(m.target);
        else if(m.type==='attributes')doAttr(m.target,m.attributeName);
      }
    });
    mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTR});
    walk(document.body);
  }
  const api={
    get lang(){return lang},
    tr,
    set(l){
      if(l!=='cs'&&l!=='en')return;lang=l;
      try{localStorage.setItem('outlive.lang',l)}catch(e){}
      document.documentElement.lang=l;
      if(document.body)walk(document.body);
      document.title=l==='cs'?'Pustina (Outlive)':'Outlive';
    },
    coach(key,en){return lang==='cs'&&COACH[key]?COACH[key]:en},
    rules(en){return lang==='cs'?RULES_CS:en},
    slide(i,en){return lang==='cs'&&SLIDES_CS[i]?SLIDES_CS[i]:en},
    about(en,v){return lang==='cs'?ABOUT.replace('{V}',v):en},
    start
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{document.documentElement.lang=lang;start()});
  else{document.documentElement.lang=lang;start()}
  return api;
})();
