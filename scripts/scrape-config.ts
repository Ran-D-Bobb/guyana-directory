// Google Places API (New) → Waypoint category mapping
// Maps Google place types to our category slugs

export const GOOGLE_TYPE_TO_CATEGORY: Record<string, string> = {
  // Restaurants & Dining
  restaurant: 'restaurants-dining',
  meal_delivery: 'restaurants-dining',
  meal_takeaway: 'restaurants-dining',
  cafe: 'restaurants-dining',
  bakery: 'restaurants-dining',
  bar: 'restaurants-dining',
  food: 'restaurants-dining',

  // Grocery & Supermarkets
  supermarket: 'grocery-supermarkets',
  grocery_or_supermarket: 'grocery-supermarkets', // legacy — may appear in responses
  grocery_store: 'grocery-supermarkets',           // New API equivalent
  convenience_store: 'grocery-supermarkets',
  liquor_store: 'grocery-supermarkets',

  // Beauty & Personal Care
  beauty_salon: 'beauty-personal-care',
  hair_care: 'beauty-personal-care',    // legacy — may appear in responses
  hair_salon: 'beauty-personal-care',   // New API equivalent
  spa: 'beauty-personal-care',

  // Health & Medical
  hospital: 'health-medical',
  doctor: 'health-medical',
  dentist: 'health-medical',
  pharmacy: 'health-medical',
  physiotherapist: 'health-medical',
  health: 'health-medical',

  // Automotive
  car_repair: 'automotive-services',
  car_dealer: 'automotive-services',
  car_wash: 'automotive-services',
  gas_station: 'automotive-services',
  car_rental: 'automotive-services',

  // Home, Garden & Trades
  hardware_store: 'home-garden',
  home_goods_store: 'home-garden',
  furniture_store: 'home-garden',
  painter: 'home-garden',
  plumber: 'home-garden',
  electrician: 'home-garden',
  general_contractor: 'home-garden',
  roofing_contractor: 'home-garden',
  locksmith: 'home-garden',
  moving_company: 'home-garden',
  florist: 'home-garden',

  // Technology & Electronics
  electronics_store: 'technology-electronics',

  // Fashion & Clothing
  clothing_store: 'fashion-clothing',
  shoe_store: 'fashion-clothing',
  jewelry_store: 'fashion-clothing',
  // NOTE: shopping_mall and department_store EXCLUDED — they pull in random
  // non-fashion businesses and pollute this category

  // Education & Training (private/training only — public schools excluded)
  university: 'education-training',
  book_store: 'education-training',

  // Professional Services
  lawyer: 'professional-services',
  accountant: 'professional-services',   // legacy — may appear in responses
  accounting: 'professional-services',   // New API equivalent
  insurance_agency: 'professional-services',
  travel_agency: 'professional-services',
  real_estate_agency: 'real-estate',

  // Entertainment & Events
  movie_theater: 'entertainment-events',
  night_club: 'entertainment-events',
  amusement_park: 'entertainment-events',
  bowling_alley: 'entertainment-events',
  casino: 'entertainment-events',

  // Fitness & Sports
  gym: 'fitness-sports',
  fitness_center: 'fitness-sports', // New API equivalent

  // Pet Services
  veterinary_care: 'pet-services',
  pet_store: 'pet-services',

  // Financial Services
  bank: 'financial-services',
  atm: 'financial-services',
  finance: 'financial-services',

  // Hospitality & Lodging
  lodging: 'hospitality-lodging',
  hotel: 'hospitality-lodging',
  campground: 'hospitality-lodging',
  rv_park: 'hospitality-lodging',

  // Transportation & Logistics
  bus_station: 'transportation-logistics',
  taxi_stand: 'transportation-logistics',
  airport: 'transportation-logistics',

  // General Services (laundry, storage, etc.)
  laundry: 'other-services',
  storage: 'other-services',

  // Government & Public Services
  // NOTE: local_government_office is in EXCLUDED_PLACE_TYPES, so this entry
  // is unreachable — kept only as documentation of the decision.
  post_office: 'government-public-services',
}

// Google place types we actually want to search for (one API call per type per region)
// NOTE: "school" removed — brings in public schools, not businesses
// NOTE: "shopping_mall" removed — brings in random non-fashion businesses
// NOTE: uses New API type names where they differ from legacy
export const SEARCH_TYPES = [
  'restaurant',
  'supermarket',
  'beauty_salon',
  'hospital',
  'pharmacy',
  'car_repair',
  'gas_station',
  'hardware_store',
  'electronics_store',
  'clothing_store',
  'lawyer',
  'bank',
  'lodging',
  'fitness_center', // New API (was: gym)
  'veterinary_care',
  'cafe',
  'bar',
  'dentist',
  'doctor',
  'car_dealer',
  'furniture_store',
  'book_store',
  'movie_theater',
  'convenience_store',
  'bakery',
  'hair_salon',     // New API (was: hair_care)
  'spa',
  'travel_agency',
  'real_estate_agency',
  'insurance_agency',
  'accounting',     // New API (was: accountant)
  'night_club',
  'pet_store',
  'laundry',
  // Additional types mapped in GOOGLE_TYPE_TO_CATEGORY
  'car_wash',
  'car_rental',
  'home_goods_store',
  'plumber',
  'electrician',
  // NOTE: general_contractor is not a valid Table A type in Places API (New) — removed
  // 'general_contractor',
  'locksmith',
  'moving_company',
  'bowling_alley',
  'casino',
  'amusement_park',
  'shoe_store',
  'jewelry_store',
  'liquor_store',
  'florist',
]

// Text search queries to supplement nearby search.
// These help surface businesses that nearby search misses due to the 20-result
// cap per type per region. Queries are keyword + location combinations.
export const TEXT_SEARCH_QUERIES: Array<{ query: string; location: string }> = [
  // Georgetown — commercial hub, most density
  { query: 'shops Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'restaurants Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'services Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'supermarket Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'pharmacy Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'hardware store Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'electronics store Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'clothing store Georgetown Guyana', location: 'Georgetown, Guyana' },
  // Interior cities
  { query: 'shops Linden Guyana', location: 'Linden, Guyana' },
  { query: 'services Linden Guyana', location: 'Linden, Guyana' },
  { query: 'shops New Amsterdam Guyana', location: 'New Amsterdam, Guyana' },
  { query: 'services New Amsterdam Guyana', location: 'New Amsterdam, Guyana' },
  { query: 'shops Bartica Guyana', location: 'Bartica, Guyana' },
  { query: 'restaurants Bartica Guyana', location: 'Bartica, Guyana' },
  { query: 'shops Anna Regina Guyana', location: 'Anna Regina, Guyana' },
  { query: 'shops Rose Hall Guyana', location: 'Rose Hall, Guyana' },
  { query: 'shops Skeldon Guyana', location: 'Skeldon, Guyana' },
  { query: 'shops Corriverton Guyana', location: 'Corriverton, Guyana' },
  // Niche categories unlikely to surface in nearby search
  { query: 'car rental Guyana', location: 'Georgetown, Guyana' },
  { query: 'wedding venue Guyana', location: 'Georgetown, Guyana' },
  { query: 'gym fitness Guyana', location: 'Georgetown, Guyana' },
  { query: 'hotel resort Guyana', location: 'Guyana' },
  { query: 'tour operator Guyana', location: 'Georgetown, Guyana' },
  { query: 'accounting firm Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'law firm Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'real estate Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'lumber yard hardware Guyana', location: 'Guyana' },
  { query: 'auto parts Georgetown Guyana', location: 'Georgetown, Guyana' },
  { query: 'printing services Georgetown Guyana', location: 'Georgetown, Guyana' },
]

// Search radius in meters per region type
export const SEARCH_RADIUS: Record<string, number> = {
  city: 8000,    // 8km for cities
  town: 5000,    // 5km for towns
  region: 15000, // 15km for administrative regions
  village: 3000, // 3km for villages
}

// Rate limiting & concurrency
export const RATE_LIMIT_MS = 200             // ms between API calls
export const BATCH_INSERT_SIZE = 50          // businesses per insert batch
export const MAX_CONCURRENT_DETAILS = 5      // concurrent Place Details fetches
export const RETRY_ATTEMPTS = 3              // total attempts per request
export const RETRY_BASE_DELAY_MS = 1000      // initial retry delay (doubles each attempt)

// Photo configuration
export const MAX_PHOTOS_PER_BUSINESS = 3     // download up to 3 photos per business
export const PHOTO_MAX_WIDTH = 1200          // max width requested from Google (New API supports up to 4800px)
export const MIN_PHOTO_WIDTH = 400           // skip photos narrower than this

// Field masks for the Places API (New)
// Nearby Search and Text Search share the same field mask (note: uses `places.` prefix)
export const SEARCH_FIELD_MASK = 'places.id,places.displayName,places.types,places.location,places.primaryType'
// Place Details does NOT use the `places.` prefix
export const DETAIL_FIELD_MASK = 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,location,types,primaryType,photos,rating,userRatingCount,businessStatus,editorialSummary,googleMapsUri'

// ---------------------------------------------------------------------------
// BUSINESS FILTERING — reject non-business results from Google
// ---------------------------------------------------------------------------

// Guyana bounding box (generous to include border towns but exclude deep Brazil)
// Lat: ~1.2 to ~8.6, Lng: ~-61.4 to ~-56.5
export const GUYANA_BOUNDS = {
  minLat: 1.1,
  maxLat: 8.7,
  minLng: -61.5,
  maxLng: -56.4,
}

// Google place types that indicate this is NOT a business we want
export const EXCLUDED_PLACE_TYPES = new Set([
  // Religious
  'church', 'mosque', 'hindu_temple', 'synagogue',
  // Death/burial
  'funeral_home', 'cemetery',
  // Government/civic (not useful as business listings)
  'city_hall', 'courthouse', 'fire_station', 'police',
  'local_government_office',
  // Infrastructure
  'transit_station', 'train_station', 'subway_station',
  // Parking (not a business listing)
  'parking',
  // Public spaces (not businesses)
  // NOTE: natural_feature and point_of_interest are NOT valid Table A types
  // in Places API (New) — they cannot be used in excludedTypes server-side.
  // They're handled client-side via GENERIC_ONLY_TYPES instead.
  'park',
  // Schools (public schools aren't businesses)
  'school', 'primary_school', 'secondary_school',
  // Other non-commercial
  'embassy', 'museum', 'art_gallery',
])

// If ALL of a place's types are in this set, it's likely not a business
// (point_of_interest alone is too generic — many real businesses have it)
export const GENERIC_ONLY_TYPES = new Set([
  'point_of_interest', 'establishment', 'premise', 'route',
  'street_address', 'neighborhood', 'sublocality', 'locality',
  'political', 'geocode',
])

// Name patterns that indicate this is NOT a real business
// Tested against lowercased name
export const REJECTED_NAME_PATTERNS: RegExp[] = [
  // Pure address names (number + street — no business name component)
  /^\d+\s+(america|regent|main|church|camp|water|robb|charlotte)\s+st/i,
  /^\d+\s+\w+\s+street$/i,
  /^\d+\s+\w+\s+avenue$/i,
  /^\d+\s+\w+\s+boulevard$/i,

  // Dutch/Surinamese street suffixes (straat = street in Dutch)
  /\bstraat$/i,

  // Place names and landmarks
  /\b(creek|dam|river|lake|beach|field|park|monument|memorial|estate|compound)\s*$/i,
  /\b(village|settlement|community ground|ball field|race track)\s*$/i,
  /\b(forest station|drainage pump|chimney)\b/i,

  // Government/institutional
  /\b(ministry|probation office|magistrate|district council)\b/i,
  /\b(sugar factory|sugar estate|rice lands|rice mill)\b/i,

  // NGOs / religious / political
  /\b(mission|ywam|youth with a mission|red cross|chamber of commerce)\b/i,
  /\b(political|ppp|pnc|freedom house)\b/i,

  // Gibberish / too short / emoji-only
  /^.{1,2}$/,                                  // 1-2 char names
  /^[^a-zA-Z]*$/,                              // no letters at all
  /yehhehehdh/i,                               // known gibberish from last scrape
]

// Name patterns for Brazilian businesses (Portuguese language indicators)
export const BRAZILIAN_NAME_PATTERNS: RegExp[] = [
  /\b(borracharia|churrascaria|padaria|lanchonete|açougue)\b/i,
  /\b(mercantil|mercearia|panificadora|conveniência|distribuidora)\b/i,
  /\b(pousada|loja|comercial|supermercado)\b/i,
  /\b(barbearia|ateliê|depilação|depilacion)\b/i,
  /\b(material de construção|elétrica|sapataria)\b/i,
  /\b(pastelaria|açaiteria|peixaria)\b/i,
  /\bltda\b/i,  // Brazilian business suffix
]

// Addresses containing Brazilian or Surinamese locations — definite reject
export const BRAZILIAN_ADDRESS_PATTERNS: RegExp[] = [
  // Brazilian states/cities
  /\bRoraima\b/i,
  /\bBonfim\s*,?\s*(RR|Roraima)\b/i,
  /\bPacaraima\b/i,
  /\bBrasil\b/i,
  /\bBrazil\b/i,
  /\b(Boa Vista|Manaus)\b/i,
  /\bRR\s*,\s*\d{5}/,  // Brazilian zip code pattern after RR state
  // Surinamese cities/indicators
  /\bParamaribo\b/i,
  /\bSuriname\b/i,
  /\bNieuw Nickerie\b/i,
  /\bstraat\b/i,       // Dutch for "street" — Surinamese address indicator
]
