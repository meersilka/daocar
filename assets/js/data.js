/* ============================================================
   DAOCAR — каталог автомобилей из Китая
   Цены price_cny — ориентир внутреннего рынка КНР (юани).
   engine_cc — рабочий объём (0 = электромобиль), нужен калькулятору.
   year — год выпуска, влияет на таможенную ставку.
   Каталог покрывает каждую пару Кузов×Двигатель ≥3 моделями.
   ============================================================ */

const CARS = [
  /* ===================== СЕДАН ===================== */
  { id:'hongqi-h5',    brand:'Hongqi',  model:'H5',            year:2024, price_cny:139000, engine_cc:1500, power:169, fuel:'Бензин',  drive:'Передний', body:'Седан', range_km:null, accent:'#3d2430', tags:['Комфорт-класс'] },
  { id:'changan-univ', brand:'Changan', model:'UNI-V',         year:2024, price_cny:125000, engine_cc:1500, power:188, fuel:'Бензин',  drive:'Передний', body:'Седан', range_km:null, accent:'#2b2f45', tags:['Спорт-седан'] },
  { id:'geely-preface',brand:'Geely',   model:'Preface',       year:2024, price_cny:152000, engine_cc:2000, power:218, fuel:'Бензин',  drive:'Передний', body:'Седан', range_km:null, accent:'#333a45', tags:['Бизнес'] },
  { id:'byd-qin-dm',   brand:'BYD',     model:'Qin L DM-i',    year:2025, price_cny:109000, engine_cc:1500, power:110, fuel:'Гибрид',  drive:'Передний', body:'Седан', range_km:2100, accent:'#2b3d3a', tags:['Экономичный'] },
  { id:'byd-han-dm',   brand:'BYD',     model:'Han DM-i',      year:2024, price_cny:179000, engine_cc:1500, power:200, fuel:'Гибрид',  drive:'Передний', body:'Седан', range_km:1300, accent:'#243b3a', tags:['Бизнес-класс'] },
  { id:'geely-galaxy', brand:'Geely',   model:'Galaxy L6',     year:2024, price_cny:115000, engine_cc:1500, power:218, fuel:'Гибрид',  drive:'Передний', body:'Седан', range_km:1300, accent:'#2b3245', tags:['Выгодный'] },
  { id:'byd-han',      brand:'BYD',     model:'Han EV',        year:2025, price_cny:209000, engine_cc:0,    power:517, fuel:'Электро', drive:'Полный',   body:'Седан', range_km:605,  accent:'#3a2b45', tags:['ТОП продаж'] },
  { id:'zeekr-007',    brand:'Zeekr',   model:'007',           year:2025, price_cny:229000, engine_cc:0,    power:646, fuel:'Электро', drive:'Полный',   body:'Седан', range_km:870,  accent:'#243447', tags:['800V','Спорт'] },
  { id:'xiaomi-su7',   brand:'Xiaomi',  model:'SU7 Max',       year:2025, price_cny:299000, engine_cc:0,    power:673, fuel:'Электро', drive:'Полный',   body:'Седан', range_km:800,  accent:'#243b3a', tags:['Новинка'] },
  { id:'nio-et5',      brand:'Nio',     model:'ET5',           year:2024, price_cny:298000, engine_cc:0,    power:489, fuel:'Электро', drive:'Полный',   body:'Седан', range_km:560,  accent:'#2e2e38', tags:['Премиум'] },

  /* ===================== КРОССОВЕР ===================== */
  { id:'exeed-rx',     brand:'Exeed',   model:'RX Flagship',   year:2024, price_cny:159000, engine_cc:2000, power:261, fuel:'Бензин',  drive:'Полный',   body:'Кроссовер', range_km:null, accent:'#452b2b', tags:['Выгодная цена'] },
  { id:'geely-monjaro',brand:'Geely',   model:'Monjaro',       year:2024, price_cny:175000, engine_cc:2000, power:238, fuel:'Бензин',  drive:'Полный',   body:'Кроссовер', range_km:null, accent:'#333a45', tags:['Хит РФ'] },
  { id:'hongqi-hs5',   brand:'Hongqi',  model:'HS5',           year:2024, price_cny:189000, engine_cc:2000, power:252, fuel:'Бензин',  drive:'Полный',   body:'Кроссовер', range_km:null, accent:'#402430', tags:['Статусный'] },
  { id:'chery-tiggo9', brand:'Chery',   model:'Tiggo 9',       year:2024, price_cny:165000, engine_cc:2000, power:261, fuel:'Бензин',  drive:'Полный',   body:'Кроссовер', range_km:null, accent:'#3a3524', tags:['Семейный'] },
  { id:'li-l7',        brand:'Li Auto', model:'L7 Max',        year:2025, price_cny:319000, engine_cc:1500, power:449, fuel:'Гибрид',  drive:'Полный',   body:'Кроссовер', range_km:1315, accent:'#1e3a5f', tags:['ТОП продаж','EREV'] },
  { id:'aito-m7',      brand:'Aito',    model:'M7 (Wenjie)',   year:2025, price_cny:309000, engine_cc:1500, power:496, fuel:'Гибрид',  drive:'Полный',   body:'Кроссовер', range_km:1300, accent:'#2b3245', tags:['Huawei ADS'] },
  { id:'byd-song',     brand:'BYD',     model:'Song Plus DM-i',year:2025, price_cny:139000, engine_cc:1500, power:235, fuel:'Гибрид',  drive:'Передний', body:'Кроссовер', range_km:1100, accent:'#2b3d3a', tags:['Экономичный'] },
  { id:'voyah-free',   brand:'Voyah',   model:'Free',          year:2024, price_cny:319000, engine_cc:1500, power:694, fuel:'Гибрид',  drive:'Полный',   body:'Кроссовер', range_km:1080, accent:'#1f3540', tags:['Премиум'] },
  { id:'avatr-11',     brand:'Avatr',   model:'11',            year:2025, price_cny:349000, engine_cc:0,    power:578, fuel:'Электро', drive:'Полный',   body:'Кроссовер', range_km:680,  accent:'#2e2e38', tags:['Флагман','CATL'] },
  { id:'zeekr-x',      brand:'Zeekr',   model:'X',             year:2024, price_cny:189000, engine_cc:0,    power:428, fuel:'Электро', drive:'Полный',   body:'Кроссовер', range_km:560,  accent:'#2b2f45', tags:['Компакт'] },
  { id:'byd-sealion',  brand:'BYD',     model:'Sea Lion 07',   year:2025, price_cny:189000, engine_cc:0,    power:483, fuel:'Электро', drive:'Полный',   body:'Кроссовер', range_km:610,  accent:'#243b47', tags:['Новинка'] },
  { id:'nio-ec6',      brand:'Nio',     model:'EC6',           year:2024, price_cny:358000, engine_cc:0,    power:490, fuel:'Электро', drive:'Полный',   body:'Кроссовер', range_km:625,  accent:'#2e2e38', tags:['Купе-кросс'] },

  /* ===================== ВНЕДОРОЖНИК ===================== */
  { id:'tank-300',     brand:'Tank',    model:'300',           year:2024, price_cny:199000, engine_cc:2000, power:220, fuel:'Бензин',  drive:'Полный',   body:'Внедорожник', range_km:null, accent:'#3d3524', tags:['Рамный 4x4'] },
  { id:'baic-bj40',    brand:'BAIC',    model:'BJ40',          year:2024, price_cny:179000, engine_cc:2000, power:218, fuel:'Бензин',  drive:'Полный',   body:'Внедорожник', range_km:null, accent:'#3a3226', tags:['Рамный 4x4'] },
  { id:'jetour-t2',    brand:'Jetour',  model:'T2',            year:2024, price_cny:169000, engine_cc:2000, power:254, fuel:'Бензин',  drive:'Полный',   body:'Внедорожник', range_km:null, accent:'#40352b', tags:['Экспедиция'] },
  { id:'tank-500',     brand:'Tank',    model:'500 Hi4-T',     year:2024, price_cny:336000, engine_cc:2000, power:408, fuel:'Гибрид',  drive:'Полный',   body:'Внедорожник', range_km:110,  accent:'#3a3226', tags:['Рамный 4x4','PHEV'] },
  { id:'tank-700',     brand:'Tank',    model:'700 Hi4-T',     year:2024, price_cny:428000, engine_cc:2000, power:517, fuel:'Гибрид',  drive:'Полный',   body:'Внедорожник', range_km:100,  accent:'#2f2a20', tags:['Флагман'] },
  { id:'bao-5',        brand:'Bao',     model:'Bao 5',         year:2024, price_cny:289000, engine_cc:1500, power:687, fuel:'Гибрид',  drive:'Полный',   body:'Внедорожник', range_km:125,  accent:'#2b3d3a', tags:['BYD','Off-road'] },
  { id:'li-l9',        brand:'Li Auto', model:'L9',            year:2025, price_cny:409000, engine_cc:1500, power:449, fuel:'Гибрид',  drive:'Полный',   body:'Внедорожник', range_km:1130, accent:'#1e3a5f', tags:['6 мест','EREV'] },
  { id:'mhero-917',    brand:'M-Hero',  model:'917',           year:2024, price_cny:459000, engine_cc:0,    power:816, fuel:'Электро', drive:'Полный',   body:'Внедорожник', range_km:505,  accent:'#2e2e38', tags:['Флагман'] },
  { id:'icar-v23',     brand:'iCar',    model:'V23',           year:2025, price_cny:129000, engine_cc:0,    power:200, fuel:'Электро', drive:'Полный',   body:'Внедорожник', range_km:501,  accent:'#243447', tags:['Ретро','Новинка'] },
  { id:'baic-bj30ev',  brand:'BAIC',    model:'BJ30 EV',       year:2024, price_cny:159000, engine_cc:0,    power:249, fuel:'Электро', drive:'Полный',   body:'Внедорожник', range_km:500,  accent:'#2b2f3a', tags:['Городской'] },

  /* ===================== МИНИВЭН ===================== */
  { id:'gac-m8',       brand:'GAC',     model:'M8',            year:2024, price_cny:259000, engine_cc:2000, power:252, fuel:'Бензин',  drive:'Передний', body:'Минивэн', range_km:null, accent:'#333a45', tags:['Представительский'] },
  { id:'hongqi-hq9',   brand:'Hongqi',  model:'HQ9',           year:2024, price_cny:309000, engine_cc:2000, power:252, fuel:'Бензин',  drive:'Передний', body:'Минивэн', range_km:null, accent:'#402430', tags:['Статусный'] },
  { id:'buick-gl8',    brand:'Buick',   model:'GL8',           year:2024, price_cny:269000, engine_cc:2000, power:237, fuel:'Бензин',  drive:'Передний', body:'Минивэн', range_km:null, accent:'#2b2f45', tags:['Бизнес'] },
  { id:'denza-d9-dm',  brand:'Denza',   model:'D9 DM-i',       year:2024, price_cny:359000, engine_cc:1500, power:374, fuel:'Гибрид',  drive:'Передний', body:'Минивэн', range_km:1100, accent:'#243b3a', tags:['BYD','Люкс'] },
  { id:'voyah-dream',  brand:'Voyah',   model:'Dreamer',       year:2024, price_cny:369000, engine_cc:1500, power:435, fuel:'Гибрид',  drive:'Полный',   body:'Минивэн', range_km:1000, accent:'#1f3540', tags:['Премиум'] },
  { id:'gac-m8-phev',  brand:'GAC',     model:'M8 PHEV',       year:2024, price_cny:329000, engine_cc:2000, power:288, fuel:'Гибрид',  drive:'Передний', body:'Минивэн', range_km:1000, accent:'#333a45', tags:['Экономичный'] },
  { id:'zeekr-009',    brand:'Zeekr',   model:'009',           year:2025, price_cny:499000, engine_cc:0,    power:544, fuel:'Электро', drive:'Полный',   body:'Минивэн', range_km:702,  accent:'#2b2f45', tags:['Флагман','800V'] },
  { id:'xpeng-x9',     brand:'Xpeng',   model:'X9',            year:2025, price_cny:359000, engine_cc:0,    power:476, fuel:'Электро', drive:'Полный',   body:'Минивэн', range_km:702,  accent:'#243447', tags:['Технологичный'] },
  { id:'denza-d9-ev',  brand:'Denza',   model:'D9 EV',         year:2024, price_cny:389000, engine_cc:0,    power:374, fuel:'Электро', drive:'Задний',   body:'Минивэн', range_km:600,  accent:'#243b3a', tags:['BYD','Люкс'] }
];

// Справочники для фильтров (собираются из каталога)
const BRANDS = [...new Set(CARS.map(c => c.brand))].sort();
const BODIES = ['Седан', 'Кроссовер', 'Внедорожник', 'Минивэн'];
const FUELS  = ['Бензин', 'Гибрид', 'Электро'];
