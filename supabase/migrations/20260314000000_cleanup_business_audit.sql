-- ============================================================================
-- Business Cleanup Audit Migration
-- Date: 2026-03-14
-- Purpose: Deactivate non-businesses and recategorize misplaced listings
-- ============================================================================

-- Category ID reference:
-- Automotive Services:       ad00ce86-675f-43bc-8e86-d61780fc4180
-- Beauty & Personal Care:    e5ad9a71-3b9b-4b04-9f64-087622f22eaf
-- Construction & Trades:     4eab3711-c1c4-45a3-b251-8ff92a07a2f0
-- Education & Training:      19038336-b763-4899-87a9-4ae79ee6897d
-- Entertainment & Events:    4aea15d3-9530-4087-8d4f-3e312df0c10d
-- Fashion & Clothing:        a87e7277-b072-4257-8df1-dfa434c0e1f5
-- Financial Services:        21559e5d-41e2-4746-b881-11c3650ad0e9
-- Fitness & Sports:          392526a0-126f-4815-b68a-e5376fefe3b0
-- General Services:          26d70254-724d-4f5a-9ae2-5a4e732ce322
-- Government & Public Svc:   6500f81b-6266-4ab1-bfdb-220a3e31c6c1
-- Grocery & Supermarkets:    e4a26c7c-6ddb-44e0-9aab-701eb498c4a2
-- Health & Medical:          9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae
-- Home, Garden & Trades:     f6873193-3d81-43e4-9100-2fc6859492c4
-- Hospitality & Lodging:     74a833d0-eb04-4e1d-93f9-13aa05ad5707
-- Pet Services:              5ca62ef2-76bd-4823-9115-78dcff255473
-- Photography & Media:       bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d
-- Professional Services:     7c28c883-200f-4249-8239-cc3e9534babf
-- Real Estate:               93c1c183-baa5-4231-a5e4-adc0106c8d04
-- Restaurants & Dining:      ee98d3c1-0815-4fd5-b4e7-c9a5e689371e
-- Technology & Electronics:  b9751903-1d87-4a77-a2f4-80f06b1fc73f
-- Transportation & Logistics:fafccc2b-536b-4512-815f-9e8cada03bb6


-- ============================================================================
-- PART 1: DEACTIVATE NON-BUSINESSES
-- (place names, person names, gibberish, Brazilian businesses, etc.)
-- ============================================================================

UPDATE businesses SET is_active = false WHERE name IN (
  -- === Education & Training: not businesses ===
  'Andy vill',
  'Blairmont SEND class',
  'Escola Estadual Aldébaro José de Alcantara',
  'Escola Municipal Maciel Ribeiro',
  'JOHNSON Street',
  'Makayla younge',
  'moon',
  'NRSS Mathematics Department',
  'St Lawrence',
  'TheAshseronVerse',
  'Violent daycare',

  -- === Entertainment & Events: not businesses ===
  'Lawrence Duncan',

  -- === Fashion & Clothing: not businesses ===
  'Amazon',
  '13 America Street',
  'SAO PAULO',
  'RELOJ DE DONDE SALEN LAS BUSETAS',
  'GARAGEM OUTLET BONFIM',
  'Laura Confecções',
  'Loja Pacifico',
  'Loja Vermelha',
  'Loja divina beleza',
  'Loja do Mohan 2',
  'Lídia Amorim Perfumaria e Cosméticos',
  'ROCK SAPATARIA',
  'SHOPPING 25',
  'Gold Standard Complex',

  -- === Financial Services: Brazilian ===
  'Caixa Econômica Federal',

  -- === Fitness & Sports: not businesses ===
  'tejmohall',
  'ACADEMIA CARD Fit',
  'Body Fitness Gym Trenamentos Funcionais',
  'Gimnasio de boxeo',

  -- === General Services: not businesses ===
  'John''s Living Water Assembly',
  'Guyana Rice Producers Association Bond',

  -- === Health & Medical: not businesses ===
  'Albouystown',
  'BSH APPOINMENT',
  'David Street',
  'ENDOCRINOLOGIST DIABETOLOGIST DOCTOR',
  'Leonora(West Coast Demerara)',
  'Bartica Hospital Conference room',
  'high speed internet service',
  'WAYOFTHESAMAURAI',
  'Hospital Municipal Pedro Álvares Rodrigues',
  'LOCAL CONSTRUÇÃO CRAS',
  'Municipality of Bonfim',
  'Oculistas Associados de Roraima - Unidade Bonfim',
  'P.R.R.C',

  -- === Hospitality & Lodging: not businesses ===
  '3 bedroom',
  'Air b and b',
  'Andray sukwa',
  'Baby Doll',
  'Fathers grave',
  'GOAT',
  'Renta canyi',
  'Renta new',
  'Rollingads',
  'Selector Akash',
  'Shanghai',
  'Pousada Gilvan',
  'Pousada bonfim',
  'Restaurante e Pousada Fronteira',
  'Roraima na Estrada',
  'Sul da Fronteira',
  'Pacaraima Golden Suites',
  'Casa de renta',
  'Hostal Abu la Cubana',

  -- === Professional Services: not businesses ===
  'word',
  'rodobia letem',
  'Navin rosignal',
  'Unity, parika',

  -- === Real Estate: not businesses ===
  'Modern/Contemporary',
  'AB Imobi Frontreira',

  -- === Restaurants & Dining: not businesses ===
  'Antonio homes',
  'brian dowden',
  'luis',
  'Melisha elis',
  'Omarie Charles',
  'Pavita st.',
  'Rose Mary lane Tigerbay',
  'middle pocket arena',
  'Four groups George',
  'Police Sports Club Ground',
  'marina one',

  -- === Restaurants & Dining: Brazilian ===
  'ASSADÃO DOURADO',
  'Bolos e pães caseiros',
  'Casa do Bolo Bonfim RR',
  'Casa do churrasquinho',
  'Conveniência e açaí do paiva',
  'Conveniência sport bull',
  'COQUEIRO BAR',
  'Eduardo comifa',
  'Frangostoso Bar e Restaurante',
  'Garagem Açaiteria',
  'Lanche do Peter',
  'Lanche e restaurante padrão',
  'Laurinha''s flavors',
  'Lil nero churrascaria',
  'Mikachu Açai',
  'Panelada',
  'Panificadora Cidade Nova',
  'Panificadora EU ACREDITO',
  'PATROA''S PASTELARIA',
  'PEREGRINO',
  'Rocha Pizza',
  'ZORYA Lanches (antigo TRAKYNAS )',
  'É DE CASA',
  'Café Sales & Orella',
  'Choperia manas',
  'Pescaderia',

  -- === Automotive Services: not businesses ===
  'Cabinets yehhehehdh',
  'Back road',
  'Ali''s Residents',
  'Home the paradise',
  'JONNY',
  'Randy King',
  'Rameshwar Rootharan',
  'Rose Ramdehol',
  'shandia\',
  'Workshop',

  -- === Automotive Services: Brazilian ===
  '3 BROTHERS SERVICES (Borracharia Tyre Shop)',
  'Borracharia Elton',
  'CONTINENTAL PNEUS',
  'Diamond tyre work shop borracharia diamante',
  'GP Auto Elétrica',
  'Só Picapes',
  'Casa de Yabo',

  -- === Beauty & Personal Care: not businesses ===
  'American style massage and Escorts service',
  'Gangaram settlement',
  'Gam gan',
  'Penitence Boulevard',
  'Hair tech building',

  -- === Beauty & Personal Care: Brazilian ===
  'Barbearia',
  'Barbearia Elichôa',
  'Ateliê dos Cílios por Julia Scherer',
  'Depilacion laser',
  'Glamour Hairstyles by Carlos Henrique',
  'Lorrayne De Oliveira Beauty',
  'Studio Glória Zanes',
  'Queen Anjo',

  -- === Grocery & Supermarkets: not businesses ===
  'Apetamin Syrup/Pills Wholesale Price Guyana',
  'One fiat square',
  'South girls',
  'cheri strike',

  -- === Grocery & Supermarkets: Brazilian ===
  'COMERCIAL 4 IRMÃOS',
  'COMERCIAL 4 IRMÃOS 2',
  'Açougue e Mercearia Sao José',
  'Conveniência anna bella',
  'Distribuidora Zanza''S',
  'JW. CREDIFAST',
  'LOJA DO PETER',
  'M Y M Vieira',
  'Mercado Forte',
  'Mercantil Zanza''S',
  'Mercantil e AÇOUGUE HB',
  'Panificadora São Francisco',
  'Peixaria da Aline',
  'SUPER MARKET AYAN',
  'WAYKA SUPERMERCADO',

  -- === Technology & Electronics: not businesses ===
  'show plaza',

  -- === Home, Garden & Trades: not businesses ===
  'Ashley',
  'One Mile Exntension',
  'Gauchinho material de construção',

  -- === Health & Medical: deactivate generic "Hospital" entries ===
  'Hospital',
  'hospital'
);

-- Handle "Hospital" which may match multiple rows — deactivate where category is Health
-- (already handled above, but this ensures both lowercase and uppercase are caught)


-- ============================================================================
-- PART 2: DEACTIVATE UNCATEGORIZED NON-BUSINESSES
-- ============================================================================

UPDATE businesses SET is_active = false WHERE name IN (
  '3Third Avenue Bartica',
  'Academic Block, ARMS',
  'Anna Regina Drainage Pump',
  'Aquagend Williams',
  'Aroiama',
  'Aurora Chimney',
  'Barama Company Limited Production Site (Buckhall)',
  'Bartica Islamic Association',
  'Bartica Municipal Market',
  'Bauxite Company of Guyana',
  'Berbice Hall of Legends',
  'Berbice Indian Culture community',
  'Bethany Mission',
  'Black water creek',
  'Blairmont Estate',
  'Blairmont sugar estate',
  'Bosai Minerals Group Powerplant',
  'Braithwaite Residence, Potaro River View',
  'Bush Lot Rice Lands',
  'Camp Stephenson',
  'Canje Forest Station',
  'Caricom Rice Mill Ltd',
  'Casa de sucel',
  'Cave field',
  'Central Corentyne Chamber of Commerce',
  'Cer Companhia Energética de Roraima',
  'Chandradatt''s',
  'Colin Shop',
  'Conservancy Dam',
  'CROWN MINING RANCH',
  'D. Persaud & Sons',
  'David 🐝',
  'DIETS & DC',
  'Dr. Cheddi Jagan Memorial Site',
  'East Indian Settlement Monument',
  'ELÉTRO-BRÁS BONFIM',
  'EMTEC',
  'Everpure',
  'Farmer''s land Farm',
  'Farouk Khan-Justice of Peace',
  'First Avenue',
  'Freedom House - PPP/C Office',
  'Guyana Forestry',
  'Guyana Livestock Development Authority',
  'Guyana Red Cross Society',
  'Hibernia Ball Field',
  'Hot And Cold Lake ( Look Satellite Mode )',
  'HOUSING AND WATER',
  'Jagans Memorial Park. Babu John Port Mourant',
  'Joel king',
  'KISSKADI',
  'Malinda doodnauth',
  'Maritime office',
  'Mashabo Mission',
  'Mashabo Village',
  'MC Mining Trading',
  'Ministério da Justiça',
  'Mr.Tillakram',
  'National Communication Network, Region 2 Site',
  'National Drainage and Irrigation Authority (NDIA) - Region #2 Office',
  'New Amsterdam District Council',
  'New Life Christian Center',
  'Old Skeldon Sugar Factory',
  'Orbaine MMg',
  'Paradise',
  'Phoray Cattle Rance',
  'Plastic Bag Stall RHTM',
  'Port Mourant',
  'Port Mourant Horse Race Track',
  'PROBATION OFFICE',
  'Ramal Resources',
  'Ramnaresh''s Farm',
  'Ravi Tambarin',
  'ReRe ladiosa',
  'Regional health officer region 4',
  'Rice Mill Factory',
  'Rose Hall Market',
  'Rose Hall Town',
  'Rose Hall Town Outpost',
  'Rose Hall Town Youth and Sports Club, M.S. (RHTYSC,M.S)',
  'RoseHall Beach',
  'Rosehall Tower Global',
  'Rosignol',
  'Rupununi Chamber (RCCI)',
  'SF MINERAL',
  'SHAMEER RAMOTAR',
  'Selestine Bristol La Rose',
  'Sela Foundation Children''s Fund',
  'Skeldon Estate Compound',
  'Skeldon Sugar Factory',
  'Skeldon community ground',
  'Small Miners Association Guyana Inc',
  'St. Francis Community Developers (SFCD)',
  'Supenaam Creek',
  'Supenaam Forest Station',
  'Supenaam Promenade',
  'Tabatinga Sports Complex',
  'Tuschen Ground',
  'Vice-Consulado do Brasil',
  'Vishnu ram astrology center',
  'VSO Guyana',
  'WARD PARK LINDEN',
  'Walter Rodney Archives',
  'Yash Petal''s',
  'Yashin''s Farm',
  'Youth With A Mission (YWAM) Guyana'
) AND (category_id IS NULL);


-- ============================================================================
-- PART 3: RECATEGORIZE MISPLACED BUSINESSES (from named categories)
-- ============================================================================

-- --- Education & Training → other categories ---
UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name = 'Energy Guyana Magazine'
  AND category_id = '19038336-b763-4899-87a9-4ae79ee6897d';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Marcia''s Variety & Document Centre'
  AND category_id = '19038336-b763-4899-87a9-4ae79ee6897d';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Office Express'
  AND category_id = '19038336-b763-4899-87a9-4ae79ee6897d';

-- --- Entertainment & Events → other categories ---
UPDATE businesses SET category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf'
WHERE name = 'Exotic & anity salon spa'
  AND category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d';

UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name = 'Food Court'
  AND category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d';

UPDATE businesses SET category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707'
WHERE name = 'Coolsquare Hotel And Bar'
  AND category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d';

-- --- Fashion & Clothing → other categories ---
-- To Home, Garden & Trades
UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name IN (
  'Ali''Furniture Store',
  'Kissoon''s Furniture Factory',
  'Curtains And Drapery Designs'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Technology & Electronics
UPDATE businesses SET category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f'
WHERE name IN (
  'Evil Eyes Audio, Video And Electronic',
  '3A''s Cyber Shop',
  'QuikCalls'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Transportation & Logistics
UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name IN (
  'Freightlink Logistics Inc',
  'Og Shipping',
  'PASpak Guyana'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Grocery & Supermarkets
UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name IN (
  'Haresh Halal Meet Center',
  'Mattai & Company Food Warehouse',
  'Mike & Tessa Grocery Store',
  'S And A Grocery And Parlour',
  'Saarah''s Groceries',
  'Weggy Supermarket',
  'Islander And Kids Grocery',
  'Brassonic Super Centre'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Health & Medical
UPDATE businesses SET category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae'
WHERE name IN (
  'MedXpress Plus (Green Shop) Pharmacy & Variety',
  'Roy''s Pharmacy',
  'Stuart Dental - Amazonia Mall'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Beauty & Personal Care
UPDATE businesses SET category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf'
WHERE name IN (
  'Urban Hair Dressing and Beauty Salon',
  'Onika And Sandra Beauty Salon',
  'Monica beauty salon an sister''s fashion &accessories',
  'Rose Blush Artistry',
  'Wayka''s Beauty'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Education & Training
UPDATE businesses SET category_id = '19038336-b763-4899-87a9-4ae79ee6897d'
WHERE name IN (
  'Christian Book Service',
  'New Era Book & Gift Shop'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Automotive Services
UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name = 'Mac''s Auto Parts'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Home, Garden & Trades (Gafoors is hardware)
UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Gafoors Canje Branch'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Real Estate
UPDATE businesses SET category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04'
WHERE name = 'RASC Comercial Property'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Professional Services (graphics/printing)
UPDATE businesses SET category_id = '7c28c883-200f-4249-8239-cc3e9534babf'
WHERE name = 'Xstream Graphics'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Restaurants & Dining
UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name IN (
  'CR² Shake Bar',
  'Broda''s Mini-Mart & Beer Garden'
) AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- To Photography & Media
UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name = 'Blissful Moments Production'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- Courts stores → Home, Garden & Trades
UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Courts'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Courts New Amsterdam'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Courts Parika Branch'
  AND category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5';

-- --- Financial Services → other categories ---
UPDATE businesses SET category_id = '19038336-b763-4899-87a9-4ae79ee6897d'
WHERE name = 'Accountancy Training Centre (ATC)'
  AND category_id = '21559e5d-41e2-4746-b881-11c3650ad0e9';

UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name = 'Ambrose Shipping & Logistics'
  AND category_id = '21559e5d-41e2-4746-b881-11c3650ad0e9';

-- --- Fitness & Sports → other categories ---
UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Agricola Community Centre'
  AND category_id = '392526a0-126f-4815-b68a-e5376fefe3b0';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'Club Toxique'
  AND category_id = '392526a0-126f-4815-b68a-e5376fefe3b0';

-- --- General Services → other categories ---
UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name = 'Yoland''s Restaurant'
  AND category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322';

UPDATE businesses SET category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707'
WHERE name = 'Serra Lodge'
  AND category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322';

UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name = 'Dina Radica - Films'
  AND category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322';

-- --- Health & Medical → other categories ---
UPDATE businesses SET category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f'
WHERE name = 'Audio Motives installation and electronics'
  AND category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae';

UPDATE businesses SET category_id = '5ca62ef2-76bd-4823-9115-78dcff255473'
WHERE name = 'Byloon''s Farm World and Pet Planet'
  AND category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae';

UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Terry''s Agro Chemical Center'
  AND category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'R Print Zone / Plus Care'
  AND category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae';

UPDATE businesses SET category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f'
WHERE name = 'ROSSRADIOSERVICE'
  AND category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae';

-- --- Hospitality & Lodging → other categories ---
UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name = 'UGI OIL COMPANY'
  AND category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'J.J&K Gaming'
  AND category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'De Impeccable Banquet Hall'
  AND category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Gangaram Community Centre'
  AND category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707';

-- --- Professional Services → other categories ---
UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE name = 'YANIS " OCEAN BLUE " BOUTIQUE - AND VARIETY STORE.'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name = 'Dream Works Photo Studio'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

UPDATE businesses SET category_id = '21559e5d-41e2-4746-b881-11c3650ad0e9'
WHERE name = 'New Building Society - Linden'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

UPDATE businesses SET category_id = '21559e5d-41e2-4746-b881-11c3650ad0e9'
WHERE name = '换汇机构'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name = 'BD Enterprise (Bangladesh 94 Busservice)'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

UPDATE businesses SET category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04'
WHERE name = 'GY Property Rentals'
  AND category_id = '7c28c883-200f-4249-8239-cc3e9534babf';

-- --- Real Estate → other categories ---
UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name = 'Acme General Store'
  AND category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04';

UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name = 'Knight Rider Transportation'
  AND category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04';

UPDATE businesses SET category_id = '7c28c883-200f-4249-8239-cc3e9534babf'
WHERE name = 'Amice Legal Consultants Inc.'
  AND category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04';

UPDATE businesses SET category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae'
WHERE name = 'Perfect Pain & Body Solutions'
  AND category_id = '93c1c183-baa5-4231-a5e4-adc0106c8d04';

-- --- Restaurants & Dining → other categories ---
UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = '3J Poultry Farm'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = '5ca62ef2-76bd-4823-9115-78dcff255473'
WHERE name = 'Pet Boy'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'Guyana Lottery Company Blast Gaming Centre'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name = 'Champion''s Choice supermarket'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name = 'Banks DIH New Amsterdam'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Rent Right Party Service'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Print Plus'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'NC Agro-Ventures'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

-- Superbet entries → Entertainment
UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'Superbet'
  AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

-- Internet cafes → Technology
UPDATE businesses SET category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f'
WHERE name IN (
  'XciteNet',
  'Netzone Internet Cafe & Copy Shop',
  'Cybernet Internet cafe',
  'Future Zone Internet Cafe'
) AND category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e';

-- --- Automotive Services → other categories ---
UPDATE businesses SET category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707'
WHERE name = 'Steve Air B&B/ Apartment'
  AND category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180';

UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name = 'Value go supermarket'
  AND category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Debbie mmg bill payment'
  AND category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180';

UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE name = 'Panda Mall warehouse'
  AND category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Exotic Printz 592'
  AND category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180';

-- --- Beauty & Personal Care → other categories ---
UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name = 'Foundation taxi service'
  AND category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf';

UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name = 'Nicky''s Natural Fruit Juice and Ice Cream'
  AND category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'Superbet'
  AND category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf';

UPDATE businesses SET category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae'
WHERE name = 'W & G Pharmacy'
  AND category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf';

-- --- Grocery & Supermarkets → other categories ---
UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name = 'Cheesecake Fantasy'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae'
WHERE name = 'Comfort Care Pharmacy'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name = 'Roraima Logistics Inc.'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = '4eab3711-c1c4-45a3-b251-8ff92a07a2f0'
WHERE name = 'King Panel/ Royal Panel/ Y2K Construction/ Y2K Auto Sales'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE name = 'Awareness Merch'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name = 'Sparkles of Creativity'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name = 'Espaço Cultural GuyBraz'
  AND category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2';

-- --- Technology & Electronics → other categories ---
UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name = 'Ajay''s Auto Electrical Works And Repairs'
  AND category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f';

UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name = 'Kent photo studio'
  AND category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f';

UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name = 'Modern Look Home Furnishing Est'
  AND category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f';

UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE name = 'Roma''s Boutique'
  AND category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f';

-- --- Home, Garden & Trades → other categories ---
UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name = 'PINNACLE BAR & Grill'
  AND category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4';

UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name = 'Trans pacific spares motor'
  AND category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4';

UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name = 'HUSSAIN AUTOMOTIVE & GENERAL STORE'
  AND category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4';


-- ============================================================================
-- PART 4: CATEGORIZE UNCATEGORIZED BUSINESSES
-- ============================================================================

-- → Beauty & Personal Care
UPDATE businesses SET category_id = 'e5ad9a71-3b9b-4b04-9f64-087622f22eaf'
WHERE name IN (
  'Beautiful You Make-up Studio',
  'Bodycaresensation',
  'FACEBEAT & BODYCON',
  'K''s Royaltouch beauty bar & gift centre.',
  'MJBeautyGy',
  'Makeila beauty solon',
  'The Imperial Beauty Bar',
  'alrick''s cosmetic, costume and hair center',
  'A&R Cosmetics',
  'newsum.Cuties Collection'
) AND category_id IS NULL;

-- → Restaurants & Dining
UPDATE businesses SET category_id = 'ee98d3c1-0815-4fd5-b4e7-c9a5e689371e'
WHERE name IN (
  'Blazing Fire Bar',
  'I&I bear Garden',
  'Sunset Boulevard Restaurant & Bar'
) AND category_id IS NULL;

-- → Hospitality & Lodging
UPDATE businesses SET category_id = '74a833d0-eb04-4e1d-93f9-13aa05ad5707'
WHERE name IN (
  'White Cliff Resort',
  'Parika countryside Villa',
  'hotal'
) AND category_id IS NULL;

-- → Technology & Electronics
UPDATE businesses SET category_id = 'b9751903-1d87-4a77-a2f4-80f06b1fc73f'
WHERE name IN (
  'Bartica Zara Computer Centre',
  'Global Technology Inc.',
  'Gtt New Amsterdam Exchange',
  'Guyana Telephone & Telegraph, Anna Regina Branch',
  'Joey Cellular & Computers',
  'Kevin''s Cellworks',
  'Kevon''s Digital Enterprise',
  'M. Sinclair Tech. Establishment',
  'S.M.G Phone & Computers Repairs',
  'Tech Solutions Guyana Inc',
  'Umbrella Technology',
  'Visual Net',
  'v-tech',
  'Xi Rack Internet Cafe',
  'I.T. Consultant',
  'SPORT TECH',
  'Green Power Solutions Inc.'
) AND category_id IS NULL;

-- → Photography & Media
UPDATE businesses SET category_id = 'bd11a2bd-a646-44d1-9d80-b2bd2c53ad0d'
WHERE name IN (
  'CR (Guyana) Media Incorporated Linden',
  'Dave''s Television Station Ch-8',
  'Dreamscape Magic Memories Studio',
  'Instaworks & A.C.V.S Studio',
  'Michael Bonds Photography',
  'Radio Essequibo 95.5',
  'Rose Productions',
  'IMMORTAL GENERATION MUSIC GROUP'
) AND category_id IS NULL;

-- → Transportation & Logistics
UPDATE businesses SET category_id = 'fafccc2b-536b-4512-815f-9e8cada03bb6'
WHERE name IN (
  'Delroy Mc Intosh Taxi & Transportation Service',
  'FrontLine Express',
  'Laparkan Shipping',
  'Pro Logistics gy',
  'Finally Boat Service',
  'Oldendorff Carriers (Guyana) Inc',
  'Supernaaam Speed Boats Terminal',
  'Nato''s dockyard'
) AND category_id IS NULL;

-- → Education & Training
UPDATE businesses SET category_id = '19038336-b763-4899-87a9-4ae79ee6897d'
WHERE name IN (
  'Cyril Potter College of Education, Region 2',
  'Essequibo Technical Institute',
  'Guyana School of Agriculture, Essequibo',
  'Linden Technical Institute',
  'Upper Corentyne Industrial Training Centre',
  'IDCE, Cotton Field'
) AND category_id IS NULL;

-- → Government & Public Services
UPDATE businesses SET category_id = '6500f81b-6266-4ab1-bfdb-220a3e31c6c1'
WHERE name IN (
  'Guyana Power & Light',
  'Guyana Power & Light Business Office',
  'Guyana Power & Light Generating Facility',
  'Guyana Water Inc',
  'Guyana Water Incorporated, Division 1'
) AND category_id IS NULL;

-- → Financial Services
UPDATE businesses SET category_id = '21559e5d-41e2-4746-b881-11c3650ad0e9'
WHERE name IN (
  'Demerara Mutual Life Group Of Companies',
  'National Insurance Scheme -Linden'
) AND category_id IS NULL;

-- → Health & Medical
UPDATE businesses SET category_id = '9ba0fa17-40cd-46e2-b33a-b8bf9e5e53ae'
WHERE name IN (
  'Dr. Steven Fraser',
  'Eureka Medical Laboratories Inc',
  'Phoenix Laboratory',
  'The healing centre'
) AND category_id IS NULL;

-- → Automotive Services
UPDATE businesses SET category_id = 'ad00ce86-675f-43bc-8e86-d61780fc4180'
WHERE name IN (
  'Chris Motobike Garage',
  'Gas Service Station',
  'Guy Oil Service Station',
  'Kenrick''s Auto Tech&Auto Electrical',
  'Nazir''s Motorcycle & Spares'
) AND category_id IS NULL;

-- → Home, Garden & Trades
UPDATE businesses SET category_id = 'f6873193-3d81-43e4-9100-2fc6859492c4'
WHERE name IN (
  'Cutting Edge Yard Services',
  'Farm Supplies Ltd.',
  'Home Designs | Engineering Associates',
  'JR Building Supplies',
  'Keith And Sons Flower Garden',
  'R M And Sons Granite And Marble Gallery',
  'Ramnaresh Plant Nursery',
  'The Hardware and Tools Depot',
  'Torginol Paints Inc'
) AND category_id IS NULL;

-- → Construction & Trades
UPDATE businesses SET category_id = '4eab3711-c1c4-45a3-b251-8ff92a07a2f0'
WHERE name IN (
  'Elysium Engineering',
  'Paramount surveying & Construction Services'
) AND category_id IS NULL;

-- → General Services
UPDATE businesses SET category_id = '26d70254-724d-4f5a-9ae2-5a4e732ce322'
WHERE name IN (
  'ANSA McAL Distribution',
  'Awesome Signs',
  'Bonsai Minerals, Machine shop',
  'CONTAINER STORE LETHEM Guyana',
  'Clear Print Document Center & Stationey Supplies',
  'Crawford''s Enterprise',
  'Hallmark Guyana',
  'J. Printery, Rubber Stamps & Signs',
  'KEVIN''S TRADING',
  'Lil Indian Printery',
  'MARK the Craftastic',
  'Old Mac Guyana Inc.',
  'Pristine Cleaning Solutions',
  'Smartt Enterprise',
  'Supenaam Marketing Centre',
  'Toucan Distributors',
  'Universal Solutions',
  'Veronica Business Centre',
  'ink & Paper'
) AND category_id IS NULL;

-- → Fashion & Clothing
UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE name IN (
  'America Dream.store',
  'Bro-Sis designs',
  'Descia''s Online shopping',
  'Diane''s Online Shopping',
  'Miz Creations',
  'Nailah''s Gift Spot',
  'Original Designz',
  'Sadeo''s Variety Store',
  'TT Online Shopping',
  'Govindsammy & Sons MiniMall'
) AND category_id IS NULL;

-- → Grocery & Supermarkets
UPDATE businesses SET category_id = 'e4a26c7c-6ddb-44e0-9aab-701eb498c4a2'
WHERE name IN (
  'AWEE MARKETPLACE',
  'Nadeer''s Establishment and Mini Mart.',
  'Native Organics',
  'ɮɛst ċɦօɨċɛ ɦaʟʟ ʍɛat ċɛռtɛʀ'
) AND category_id IS NULL;

-- → Entertainment & Events
UPDATE businesses SET category_id = '4aea15d3-9530-4087-8d4f-3e312df0c10d'
WHERE name IN (
  'Serenity Event Consultants'
) AND category_id IS NULL;

-- → Professional Services
UPDATE businesses SET category_id = '7c28c883-200f-4249-8239-cc3e9534babf'
WHERE name IN (
  'Amazon Security and Investigation Services',
  'Demerara Distillers Ltd.',
  'Untamed Adventures',
  'Ali Khan Rice Mill'
) AND category_id IS NULL;

-- → Pet Services (none identified)

-- → Real Estate (none identified)


-- ============================================================================
-- PART 5: SUMMARY QUERY (run after migration to verify)
-- ============================================================================
-- Run this manually to check results:
-- SELECT
--   CASE WHEN is_active THEN 'Active' ELSE 'Deactivated' END as status,
--   c.name as category,
--   COUNT(*) as count
-- FROM businesses b
-- LEFT JOIN categories c ON b.category_id = c.id
-- GROUP BY is_active, c.name
-- ORDER BY is_active DESC, c.name;


-- ============================================================================
-- PART 6: FIX REMAINING UNCATEGORIZED WITH CORRUPTED APOSTROPHES
-- ============================================================================

-- Deactivate: Yash Petal's and Chandradatt's (corrupted UTF-8 apostrophes)
UPDATE businesses SET is_active = false
WHERE category_id IS NULL
  AND (name LIKE 'Yash Petal%' OR name LIKE 'Chandradatt%');

-- Recategorize: Diane's Online Shopping → Fashion & Clothing
UPDATE businesses SET category_id = 'a87e7277-b072-4257-8df1-dfa434c0e1f5'
WHERE category_id IS NULL
  AND name LIKE 'Diane%Online Shopping';
