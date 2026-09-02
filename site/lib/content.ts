// Al Adrak — site content, sourced from the 35th-anniversary brochure + aladrak.com
//
// Anything that counts the company's age comes from lib/anniversary.ts — never
// write the number in by hand, or it drifts (this file previously claimed "three
// and a half decades" while the rest of the site said 40).
import { years } from "./anniversary";
import { asset } from "./asset";
export const site = {
  name: "Al Adrak",
  legalName: "Al Adrak Trading & Contracting Co LLC",
  tagline: "Legacy of Landmarks",
  heroSub:
    "Oman's most established engineering & construction contractor — building the nation's landmarks since 1986.",
  phone: "+968 2200 1300",
  email: "info@aladrak.com",
};

export const stats = [
  { value: years(), suffix: "", label: "Years of Excellence" },
  { value: 450, suffix: "+", label: "Landmark Projects" },
  { value: 6000, suffix: "+", label: "Strong Workforce" },
  { value: 1, prefix: "$", suffix: "B+", label: "Order Book" },
];

export const vision =
  "A leading national and regional market position, delivering world-class engineering construction with top-tier quality standards as the cornerstone of growth.";

export const mission =
  "Building long-term relationships based on integrity, performance, value, and client satisfaction.";

export const introStatement = `For over ${years()} years, Al Adrak has shaped the skyline of the Sultanate — a wholly Omani, integrated construction house delivering turnkey landmarks with one hundred percent in-house capability.`;

export const sectors = [
  { name: "IT & Data Centres", desc: "Tier IV data centres and national technology hubs.", img: asset("/images/projects/central-bank.jpg") },
  { name: "Commercial Buildings", desc: "Headquarters and iconic offices for banks and insurers.", img: asset("/images/projects/cba.jpg") },
  { name: "Government Institutions", desc: "Ministries, authorities and civic landmarks.", img: asset("/images/projects/public-prosecution.jpg") },
  { name: "Educational Institutions", desc: "Universities, colleges and international schools.", img: asset("/images/projects/cheltenham.jpg") },
  { name: "Defense & Police", desc: "Secure campuses and specialist facilities.", img: asset("/images/projects/forensic-lab.jpg") },
  { name: "Sports Facilities", desc: "Stadiums, Olympic pools and multi-purpose halls.", img: asset("/images/projects/al-maskaan.jpg") },
  { name: "Residential Complexes", desc: "Villages, towers and 1,000-unit communities.", img: asset("/images/projects/hai-al-naseem.jpg") },
  { name: "Tourism & Hospitality", desc: "Hotels, restaurants and leisure destinations.", img: asset("/images/projects/aloft.jpg") },
  { name: "Infrastructure", desc: "Pipelines, roads, tunnels and utilities.", img: asset("/images/projects/earthworks.jpg") },
  { name: "Hospitals", desc: "Multispecialty hospitals and clinical facilities.", img: asset("/images/projects/adlife.jpg") },
  { name: "Industrial Facilities", desc: "Factories, warehouses and processing plants.", img: asset("/images/projects/mazoon-dairy.jpg") },
];

export const lifeAtAdrak = {
  statement:
    "A happy, skilled workforce builds better landmarks. From modern accommodation camps with sports and recreation facilities to training programmes and air-conditioned mess halls — Adrak invests in its people first.",
  photos: [
    { src: asset("/images/life/life-briefing.jpg"), label: "Morning briefing on site" },
    { src: asset("/images/life/life-3.jpg"), label: "Life at the office" },
  ],
};

export const expertise = [
  {
    no: "01",
    key: "civil",
    title: "Civil Engineering",
    lead: "Foundations & high-rise structures",
    img: asset("/images/projects/cba.jpg"),
    imgPos: "center 30%",
    points: [
      "Capacity to build 500,000 sqm annually",
      "Largest single concrete pour on record — 8,500 m³",
      "One of the tallest structures in the country at 51 m",
      "Formwork & scaffolding inventory over 250,000 sqm",
      "Post-tension system design and execution",
    ],
  },
  {
    no: "02",
    key: "electrical",
    title: "Electrical Engineering",
    lead: "Generation, transmission & intelligent systems",
    img: asset("/images/division-electrical.jpg"),
    imgPos: "center",
    points: [
      "Over 150 MVA generation capacity commissioned",
      "Over 350 MVA transformer capacity commissioned",
      "300+ km of 11KV transmission lines delivered",
      "Tier IV data centre to Uptime Institute standards",
      "Building automation, security & ELV systems",
    ],
  },
  {
    no: "03",
    key: "mechanical",
    title: "Mechanical Engineering",
    lead: "HVAC, fire systems & public health utilities",
    img: asset("/images/division-mechanical.jpg"),
    imgPos: "center",
    points: [
      "District cooling — 12,000 TR capacity delivered",
      "Chillers — 20,000 TR capacity, peak unit 450 Ton",
      "Automated firefighting with FM-200 gaseous systems",
      "Fuel storage to 200,000 litres with automated fire release",
      "Complete public health services & utilities",
    ],
  },
  {
    no: "04",
    key: "infrastructure",
    title: "Infrastructure Engineering",
    lead: "Pipelines, roads, bridges & tunnels",
    img: asset("/images/division-infra.jpg"),
    imgPos: "center",
    points: [
      // 25 km, not 24: the name wall calls the same line "2.2 m × 25 km", and
      // the company claims only one largest-pipeline-in-the-country.
      "Largest pipeline in the country — 2.2 m dia over 25 km",
      "Asphalt roads — 2 million sqm annual capacity",
      "HV & LV power cabling up to 450 km annually",
      "300 km of HDPE fire & water networks annually",
      "Underground tunnels to 4 × 3.5 m over 500 m runs",
    ],
  },
];

export type Project = {
  sector: string;
  name: string;
  place: string;
  img: string;
  desc: string;
  specs?: string[];
};

export const projects: Project[] = [
  { sector: "Commercial", name: "Ahli Bank Corporate HQ", place: "Wattayah, Muscat", img: asset("/images/projects/ahli-bank.jpg"), desc: "Structural glazing, designed aluminium mashrabiya and a glass atrium — delivered live around an operating headquarters.", specs: ["Built around the live operating HQ with specialist shoring", "Structural glazing, spider glazing & designed glass atrium", "Radiant floor cooling over 800 m² with DOAS trench ducting", "2 × 350 TR air-cooled screw chillers", "Specialized epoxy floor system for the MLCP car park"] },
  { sector: "IT & Data Centres", name: "Central Bank of Oman", place: "Muscat", img: asset("/images/projects/central-bank.jpg"), desc: "One-metre-thick vault walls, 15 MW dual-redundant power and 2,000-ton cooling for the nation's most secure facility.", specs: ["1 m thick concrete currency-vault walls, 400-tonne dead load", "5.5 m floor-to-floor with 1 m HD raised flooring", "15 MW dual-redundant power supply", "4 × 1,100 KVA UPS — 15-minute full-facility backup", "AWACS early detection + FM-200 fire suppression"] },
  { sector: "Residential", name: "SUROUH — Hai Al Naseem", place: "Barka", img: asset("/images/projects/hai-al-naseem.jpg"), desc: "Oman's pilot PPP housing development — 1,051 residences balancing nature, tradition and modern living.", specs: ["1,051 apartments, villas, twin villas & townhouses", "460,000 sqm Rapid Wall + 160,000 sqm hollow-core slab", "27 substations, solar-powered street lighting", "100,000 sqm pavements & 80,000 sqm landscaping", "OMR 100 million — Ministry of Housing PPP pilot"] },
  { sector: "Education", name: "Cheltenham International School", place: "Russail, Muscat", img: asset("/images/projects/cheltenham.jpg"), desc: "International-standard campus for 1,400 students — Islamic arches, mashrabiya and a 25 m pool.", specs: ["1,400 students, 200 staff, 62 classrooms", "Amphitheatre, 25 m pool & multipurpose courts", "Omani marble, timber flooring & GRC cladding", "Islamic arches with aluminium mashrabiya", "Full building management system"] },
  { sector: "Government", name: "Ministry of Higher Education", place: "Muscat", img: asset("/images/projects/mohe.jpg"), desc: "Among the most luxurious government buildings — 4 MW power, 960-ton cooling, a stunning façade.", specs: ["Among Oman's most luxurious government buildings", "4 MW power capacity", "960-tonne cooling", "Signature façade & interiors"] },
  { sector: "Government", name: "Public Authority for Craft Industries", place: "Muscat", img: asset("/images/projects/paci.jpg"), desc: "A 16,000 sqm sculptured headquarters — a showcase of Omani culture and heritage.", specs: ["16,000 sqm sculptured HQ building", "A showcase of Omani culture & heritage", "400-tonne cooling, 3 MW power"] },
  { sector: "Industrial", name: "Mazoon Dairy", place: "Al Sunaynah", img: asset("/images/projects/mazoon-dairy.jpg"), desc: "MEED Industrial Project of the Year — a 4 km × 4 km integrated dairy city for 7,500+ cows.", specs: ["MEED Industrial Project of the Year", "4 km × 4 km integrated dairy farm for 7,500+ cows", "7,000 MT structural steel, 70,000 sqm asphalt", "23 × 11 KV substations", "Cold storage to −25 °C with walk-on ceilings"] },
  { sector: "Hospitality", name: "Aloft Hotel by Marriott", place: "Ghala, Muscat", img: asset("/images/projects/aloft.jpg"), desc: "Al Adrak's maiden hospitality investment — an international-brand hotel for the capital.", specs: ["Al Adrak's maiden hospitality investment", "Operated under an international Marriott brand", "Part of a 200-key hotel expansion programme"] },
  { sector: "Education", name: "Buraimi University", place: "Al Buraimi", img: asset("/images/projects/buraimi-university.jpg"), desc: "A premier 20,000 sqm campus — administration, teaching and hostel blocks with a unique steel-web façade.", specs: ["Administration, teaching & hostel blocks — 20,000 sqm", "3 MW power, 800-tonne cooling", "Unique steel-web façade design", "Post-tension slabs for durability"] },
  { sector: "IT & Data Centres", name: "Knowledge Oasis Oman 4", place: "Muscat", img: asset("/images/projects/kom4.jpg"), desc: "The technology hub of Oman — 40,000 sqm, a 5 MW power plant and 2,800-ton district cooling.", specs: ["Technology hub of Oman — 40,000 sqm", "Raft & post-tension design for cantilever structure", "2,800-tonne district cooling, 5 MW power plant", "100% raised-floor plug-and-play IT space"] },
  { sector: "Defense & Police", name: "Forensic Laboratory — ROP", place: "As Sib, Muscat", img: asset("/images/projects/forensic-lab.jpg"), desc: "A state-of-the-art laboratory facility delivered for the Royal Oman Police.", specs: ["State-of-the-art forensic science laboratory", "Delivered for the Royal Oman Police", "Specialist lab services & security systems"] },
];

// Extended portfolio — real photos from the archive
export const moreProjects = [
  { sector: "Commercial", name: "Muscat Insurance Headquarters", place: "Al Khuwair", img: asset("/images/projects/cba.jpg"), desc: "An iconic 30,564 sqm headquarters in the heart of Muscat — 12 m deep secant-pile excavation, automated tower parking for 126 cars and ambient façade lighting." },
  { sector: "Government", name: "Bait Al Reem", place: "Al Khuwair", img: asset("/images/projects/bait-al-reem.jpg"), desc: "An architectural showpiece in the ministries district — 14,000 sqm with a 1,250-ton cooling system and 4 MW of power." },
  { sector: "Commercial", name: "Facility Building, KOM", place: "Muscat", img: asset("/images/projects/fb-kom.jpg"), desc: "One of the tallest building structures in Oman with a unique elliptical profile — hotel rooms, conference facilities, offices and restaurants." },
  { sector: "Government", name: "Haya Water Headquarters", place: "Al Ansab", img: asset("/images/projects/haya.jpg"), desc: "Modern, cutting-edge government office space — a futuristic open-office concept with 400-ton cooling and a 2 MW power plant." },
  { sector: "Commercial", name: "OETC Head Office", place: "Al Mawalih", img: asset("/images/projects/oetc.jpg"), desc: "Head office of Oman Electricity Transmission Company — 6,000 sqm with curved glass structures and state-of-the-art IT and security." },
  { sector: "Residential", name: "Al Maskaan Village", place: "Oman", img: asset("/images/projects/al-maskaan.jpg"), desc: "A complete residential village community — homes, amenities and infrastructure delivered as one integrated development." },
  { sector: "Education", name: "Waljat College", place: "Muscat", img: asset("/images/projects/waljat.jpg"), desc: "Two teaching blocks of 8,000 sqm with smart-board lecture rooms — recognised by the client for delivery in just five months." },
  { sector: "Education", name: "Mazoon College", place: "Muscat", img: asset("/images/projects/mazoon-college.jpg"), desc: "A private university college with accommodation — 20,000 sqm, an 850-ton chiller plant and full building management systems." },
  { sector: "Industrial", name: "Barzaman Bottling Factory", place: "Al Khawd", img: asset("/images/projects/barzaman.jpg"), desc: "A complete water bottling factory delivered turnkey for the Barzaman Group at Al Khawd." },
  { sector: "Industrial", name: "ABAAD Warehouse", place: "Muscat", img: asset("/images/projects/abaad.jpg"), desc: "18,575 sqm of Twintec flooring, structural steel with sandwich-panel roofing and a 450 TR VRF cooling system." },
  { sector: "Hospitality", name: "La Mer", place: "Muscat", img: asset("/images/projects/lamer.jpg"), desc: "A luxurious restaurant seating 200, with a five-star kitchen built to serve 500 guests." },
  { sector: "Government", name: "Wet Laboratory", place: "Muscat", img: asset("/images/projects/wet-lab.jpg"), desc: "A specialised laboratory facility delivered for the Government of Oman to international standards." },
  { sector: "Defense & Police", name: "Royal Oman Police Facility", place: "Muscat", img: asset("/images/projects/rop.jpg"), desc: "A secure operational campus delivered for the Royal Oman Police." },
  { sector: "Residential", name: "Private Villa", place: "Al Khoudh, Seeb", img: asset("/images/projects/villa-seeb.jpg"), desc: "A three-storey VVIP residence — high-end finishes throughout, with sauna, home theatre and pool." },
  { sector: "Industrial", name: "Central Processing Plant — Mazoon Dairy", place: "Al Sunaynah", img: asset("/images/projects/mdp-cpp.jpg"), desc: "Process utilities, storage and 1,000 KVA substations serving Oman's national dairy city." },
  { sector: "Commercial", name: "Office, Warehouse & Accommodation", place: "Halban, Muscat", img: asset("/images/head-office.jpg"), desc: "Al Adrak's own integrated campus — head office, central warehouse, factories and staff accommodation." },
  { sector: "International", name: "Ellington House 3 & 4", place: "Dubai, UAE", img: asset("/images/projects/dubai-ellington.jpg"), desc: "Luxury residences under development in Dubai — Al Adrak's flagship UAE venture with Ellington Properties." },
];

// Delivered landmarks without a photo card — shown as a name wall
export const projectNames = [
  "Sohar University", "Special Task Force Campus", "Seeb Stadium", "AdLife Hospital",
  "Mirbat Hospital", "Court Complex, Ibri", "Knowledge Oasis Oman 3",
  "Iraq Embassy", "Renaissance Complex, Duqm", "CCWS Sohar Port Pipeline — 2.2 m × 25 km",
  "Olympic Indoor Pool, Nizwa", "Ministry of Sports Facilities", "Buraimi Border Roundabout",
  "Military Technological College", "Police Station Complex, Duqm",
  "ROP Regional Headquarters, Sur", "Environment & Climate Affairs Building",
  "Villas at Al Qurm", "Aqua Culture Centre",
];

export const facilities = [
  { name: "Central Logistics", img: asset("/images/facilities/logistics.jpg"), desc: "A heavily stocked central warehouse at Halban serving every live site across the Sultanate." },
  { name: "Joinery & Carpentry", img: asset("/images/facilities/joinery.jpg"), desc: "CNC-driven woodcraft — from arabesque doors to complete interior fit-out." },
  { name: "Aluminium & Glazing", img: asset("/images/facilities/aluminium.jpg"), desc: "A dedicated 2,000 sqm facility for doors, windows and structural glazing systems." },
  { name: "Marble & Granite", img: asset("/images/facilities/marble.jpg"), desc: "High-end Italian bridge saws, waterjet cutters and automatic edge polishers." },
  { name: "Rebar Cut & Bend", img: asset("/images/facilities/rebar.jpg"), desc: "3,800 sqm with shear lines, robot benders and automatic stirrup machines." },
  { name: "Duct Fabrication", img: asset("/images/facilities/duct.jpg"), desc: "Autoline and plasma cutting for AC ducting and pre-insulated systems." },
  { name: "Metal Fabrication", img: asset("/images/facilities/metal.jpg"), desc: "A skilled workforce and modern machinery for superior structural steelwork." },
  { name: "Formwork & Scaffolding", img: asset("/images/facilities/formwork.jpg"), desc: "A 13,500 sqm yard of PERI, Doka and cuplock systems — 350+ components." },
  { name: "Plant & Machinery", img: asset("/images/facilities/plant.jpg"), desc: "One of the largest equipment fleets in the country — 1,000+ units, centrally managed." },
  { name: "Crusher & Quarries", img: asset("/images/facilities/crusher.jpg"), desc: "Gabbro aggregate quarries at Duqm and Nakhal with mobile crushing units." },
];

export type ShopFloorMedia = {
  type: "video" | "img";
  src: string;
  label: string;
  /** matches a facilities[].name — omitted where the shot spans the whole campus */
  facility?: string;
};

/** The "step inside our factories" reel. `facility` is only set where the shot
 *  is unambiguously that facility, so the detail view never claims more than we
 *  actually know about a given clip. */
export const shopFloor: ShopFloorMedia[] = [
  { type: "video", src: asset("/videos/facilities/joinery.mp4"), label: "CNC router carving an arabesque panel", facility: "Joinery & Carpentry" },
  { type: "img", src: asset("/images/facilities/gallery-cws.jpg"), label: "Joinery & carpentry workshop", facility: "Joinery & Carpentry" },
  { type: "video", src: asset("/videos/facilities/duct.mp4"), label: "Plasma cutting on the autoline", facility: "Duct Fabrication" },
  { type: "img", src: asset("/images/facilities/gallery-drone.jpg"), label: "The production campus from above" },
  { type: "video", src: asset("/videos/facilities/aluminium.mp4"), label: "Aluminium fabrication & structural glazing", facility: "Aluminium & Glazing" },
  { type: "img", src: asset("/images/facilities/gallery-plant.jpg"), label: "Central materials inventory" },
  { type: "video", src: asset("/videos/facilities/logistics.mp4"), label: "Central logistics yard at Halban", facility: "Central Logistics" },
  { type: "img", src: asset("/images/facilities/gallery-crusher.jpg"), label: "Nakhal crusher & quarry", facility: "Crusher & Quarries" },
];

/**
 * Extra photographs per facility, shown ONLY inside the facility viewer.
 *
 * Deliberately separate from `shopFloor`: that array is also the strip on the
 * page, and folding every gallery photograph into it would make the strip
 * unmanageably long. Clicking a tile or a facility card opens the modal, and
 * the modal's playlist is the facility's strip media plus everything listed
 * here. Keys match facilities[].name exactly.
 */
export const facilityGallery: Record<string, ShopFloorMedia[]> = {
  "Central Logistics": [
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-1.jpg"), label: "Racked cable store inside the warehouse", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-2.jpg"), label: "Store team checking cable coils on racking", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-3.jpg"), label: "Telehandler loading a flatbed for dispatch", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-4.jpg"), label: "Aerial view of the Halban logistics yard", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-5.jpg"), label: "Cable drums and pipe in the laydown yard", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-6.jpg"), label: "Stock check along racked cable and coil aisles", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-7.jpg"), label: "Storekeepers checking stock in the racking aisles", facility: "Central Logistics" },
    { type: "img", src: asset("/images/facilities/gallery/central-logistics-8.jpg"), label: "Telehandler loading palletised stock onto trailers", facility: "Central Logistics" },
  ],
  "Joinery & Carpentry": [
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-1.jpg"), label: "Craftsmen hand-carving a large timber panel", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-2.jpg"), label: "CNC router machining a timber panel", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-3.jpg"), label: "CNC router machining a timber panel", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-4.jpg"), label: "Surface planer running on the joinery shop floor", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-5.jpg"), label: "Feeding timber through the surface planer", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-6.jpg"), label: "Wide view of the joinery hall in full production", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-7.jpg"), label: "Loading timber panels into the wide-belt sander", facility: "Joinery & Carpentry" },
    { type: "img", src: asset("/images/facilities/gallery/joinery-and-carpentry-8.jpg"), label: "Sliding table saw in operation", facility: "Joinery & Carpentry" },
  ],
  "Aluminium & Glazing": [
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-1.jpg"), label: "Wide view of the aluminium fabrication hall working", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-2.jpg"), label: "Wide view of the aluminium assembly floor", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-3.jpg"), label: "Assembling aluminium window frames beside stacked glass", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-4.jpg"), label: "Aerial view of the AFW facility building and material yard", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-5.jpg"), label: "Workshop interior with aluminium profiles, cutting line and assembly benches", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-6.jpg"), label: "Aluminium profiles laid out across the fabrication hall", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-7.jpg"), label: "Window frames taking shape on the production line", facility: "Aluminium & Glazing" },
    { type: "img", src: asset("/images/facilities/gallery/aluminium-and-glazing-8.jpg"), label: "Handling a large aluminium frame across the shop", facility: "Aluminium & Glazing" },
  ],
  "Marble & Granite": [
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-1.jpg"), label: "Guiding a slab through the stone saw", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-2.jpg"), label: "Granite slab hoisted on overhead crane clamp beside slab storage racks", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-3.jpg"), label: "Stone workshop floor with edge-polishing line and slabs staged on A-frames", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-4.jpg"), label: "Craning a granite slab across the stone workshop", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-5.jpg"), label: "Bridge saw cutting a stone slab", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-6.jpg"), label: "Setting cuts at the bridge saw console", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-7.jpg"), label: "Operator running the CNC bridge saw", facility: "Marble & Granite" },
    { type: "img", src: asset("/images/facilities/gallery/marble-and-granite-8.jpg"), label: "Crane lifting a granite slab across the workshop", facility: "Marble & Granite" },
  ],
  "Rebar Cut & Bend": [
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-1.jpg"), label: "Operator feeding rebar on the bending bench", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-2.jpg"), label: "Rebar cutting line", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-3.jpg"), label: "Steel wire coils feeding the mesh welder", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-4.jpg"), label: "Shear line machinery close-up", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-5.jpg"), label: "Wide view of the bending shop at work", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-6.jpg"), label: "Rebar hall overview with shear line and stock", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-7.jpg"), label: "Bundled rebar and the cutting line", facility: "Rebar Cut & Bend" },
    { type: "img", src: asset("/images/facilities/gallery/rebar-cut-and-bend-8.jpg"), label: "Overhead view of the rebar cutting and bending lines", facility: "Rebar Cut & Bend" },
  ],
  "Duct Fabrication": [
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-1.jpg"), label: "CNC cutting of duct sheet", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-2.jpg"), label: "Galvanized duct forming", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-3.jpg"), label: "CNC plasma cutting galvanised sheet from coil", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-4.jpg"), label: "Rows of finished duct sections awaiting dispatch", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-5.jpg"), label: "Wide view of the duct fabrication shop floor", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-6.jpg"), label: "Duct coil line in production", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-7.jpg"), label: "Operator at the CNC sheet cutting machine", facility: "Duct Fabrication" },
    { type: "img", src: asset("/images/facilities/gallery/duct-fabrication-8.jpg"), label: "Two workers folding sheet metal on the brake", facility: "Duct Fabrication" },
  ],
  "Metal Fabrication": [
    { type: "img", src: asset("/images/facilities/gallery/metal-fabrication-1.jpg"), label: "Checking fabricated steel frames against drawings", facility: "Metal Fabrication" },
  ],
  "Formwork & Scaffolding": [
    { type: "img", src: asset("/images/facilities/gallery/formwork-and-scaffolding-1.jpg"), label: "Formwork panels and crane sections stacked in yard", facility: "Formwork & Scaffolding" },
  ],
  "Plant & Machinery": [
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-1.jpg"), label: "Excavators, telehandlers and trucks lined up", facility: "Plant & Machinery" },
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-2.jpg"), label: "Aerial of the equipment fleet and workshops", facility: "Plant & Machinery" },
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-3.jpg"), label: "Excavators and trucks parked across the fleet yard", facility: "Plant & Machinery" },
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-4.jpg"), label: "Scania off-road tipper from the company fleet", facility: "Plant & Machinery" },
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-5.jpg"), label: "Tower crane sections and tipper fleet in the yard", facility: "Plant & Machinery" },
    { type: "img", src: asset("/images/facilities/gallery/plant-and-machinery-6.jpg"), label: "Fleet tipper on a mountain haul track", facility: "Plant & Machinery" },
  ],
  "Crusher & Quarries": [
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-1.jpg"), label: "Wide view of the whole crushing plant", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-2.jpg"), label: "Wheel loader working aggregate stockpiles below crushing plant", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-3.jpg"), label: "Wide view of the crushing plant working", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-4.jpg"), label: "Conveyor lines running across the crushing plant", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-5.jpg"), label: "Panorama of the crushing plant and stockpiles", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-6.jpg"), label: "Crushing plant set among the quarry hills", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-7.jpg"), label: "Wheel loader among graded aggregate stockpiles", facility: "Crusher & Quarries" },
    { type: "img", src: asset("/images/facilities/gallery/crusher-and-quarries-8.jpg"), label: "Panorama of conveyor network across the plant", facility: "Crusher & Quarries" },
  ],
};

export type Person = {
  name: string;
  role: string;
  /** null until a portrait is supplied — the grid shows a monogram instead */
  img: string | null;
};

/**
 * Team Adrak, as supplied by the company on 2026-08-25.
 *
 * This IS the org list: anyone not here has left the list, and the order is
 * theirs, not ours. Four have no portrait yet and carry null — the grid draws a
 * monogram for those rather than leaving a hole, so a photograph can be dropped
 * in later by changing null to a path and nothing else.
 */
export const leadership = {
  founder: {
    name: "Dr. Thomas Alexander",
    role: "Chairman & Chief Executive Director",
    img: asset("/images/team/founder.jpg"),
    quote:
      "Our dream is to be the best company in the Sultanate — not in terms of profits or volumes, but in terms of ethics and values.",
    bio: "B.Tech Civil Engineering · Ph.D in Business Administration. Founded Al Adrak in 1986 and built it into Oman's No. 1 construction company.",
    honors: [
      "Forbes Top 100 Businessmen — Middle East",
      "No. 1 Construction Company in Oman",
      "Middle East Super 100 Award",
    ],
  },
  directors: [
    { name: "Dr. Aadil Thomas Alexander", role: "Executive Director", img: asset("/images/team/roster/aadil.jpg") },
    { name: "Annie Thomas Alexander", role: "Executive Director", img: asset("/images/team/roster/annie.jpg") },
    { name: "Ayyappadas Chandrasekhar", role: "Chief Operating Officer", img: null },
  ] as Person[],
  roster: [
    { name: "Biju K. Mammen", role: "Advisor — Plant & Machinery", img: asset("/images/team/roster/biju.jpg") },
    { name: "Riyas Mohamed", role: "Chief Executive Officer", img: asset("/images/team/roster/riyas.jpg") },
    { name: "Earnest V J Shabu", role: "Group Chief Strategy & Transformation Director", img: null },
    { name: "Mahmood Al Ghafri", role: "Vice President — HR & Administration", img: asset("/images/team/roster/mahmood.jpg") },
    { name: "Richard Sequeira", role: "Vice President — Group Facilities, Agriculture & Carbon", img: asset("/images/team/roster/richard.jpg") },
    { name: "Tibi John", role: "Vice President — Group Funding & Financial Advisory", img: asset("/images/team/roster/tibi.jpg") },
    { name: "Hariprasad Shetty", role: "General Manager — Tendering & QS", img: asset("/images/team/roster/hariprasad.jpg") },
    { name: "Rajan Prabhakaran", role: "General Manager — Projects & Development", img: asset("/images/team/roster/rajan.jpg") },
    { name: "Anoop Das", role: "General Manager — Design & Build", img: asset("/images/team/roster/anoop.jpg") },
    { name: "Visakh U B", role: "General Manager — Project Management & Controls", img: asset("/images/team/roster/visakh.jpg") },
    { name: "Gnanasekaran T", role: "General Manager — Production & Sales", img: asset("/images/team/roster/gnanasekaran.jpg") },
    { name: "Kausthubh Rai", role: "General Manager — QA/QC & Training", img: asset("/images/team/roster/kausthubh.jpg") },
    { name: "Iman Al Shaafari", role: "General Manager — Finance & Accounts", img: asset("/images/team/roster/iman.jpg") },
    { name: "Adv. Farah Mukhtar", role: "Deputy General Manager — Contracts & Claims", img: null },
    { name: "Hauriya Al Balushi", role: "Deputy General Manager — Operations & Follow-up", img: asset("/images/team/roster/huriya.jpg") },
    { name: "Nauf Al Bulushi", role: "Deputy General Manager — Projects", img: asset("/images/team/roster/nauf.jpg") },
    { name: "Vinod PV Pillai", role: "Assistant General Manager — IT", img: null },
    { name: "Sayed Iftequar Ali", role: "Senior Manager — HSE", img: asset("/images/team/roster/iftikhar.jpg") },
    { name: "Nawaf Al Zadjali", role: "Manager — HR", img: asset("/images/team/roster/nawaf.jpg") },
  ] as Person[],
};

export const headOffice = {
  title: "One team. One vision.",
  location: "Halban, just off the Muscat Expressway",
  body: "Project management, planning and progress monitoring, design development, CAD, training, IT, finance, integrated facility management, procurement and logistics — all centrally controlled from the Head Office in coordination with every remote site. With multiple projects under execution across Oman and the region, Al Adrak's centralized management systems ensure the same values are delivered everywhere.",
  img: asset("/images/head-office.jpg"),
  img2: asset("/images/head-office-3.jpg"),
};

export const excellence = [
  { title: "Health, Safety & Environment", desc: "A dedicated HSE team runs inspections and on-site reviews — the safety of people is priority number one." },
  { title: "Rooted in the Community", desc: "A wholly Omani-owned company — recruiting and training local talent, patronising Omani SMEs and donating to local causes." },
  { title: "Human Resource Development", desc: "Training programmes that attract young Omanis to rewarding careers across the group." },
  { title: "Men at Work", desc: "Worker accommodation, air-conditioned mess halls and industrial kitchens — comparable with the best in the industry." },
  { title: "Facilities Management", desc: "Integrated multi-site FM services backed by strong technical capability and market-leading compliance." },
  { title: "Information Technology", desc: "A head-office data centre, central surveillance and app-based productivity monitoring underpin every project." },
];

export const certifications = ["ISO 9001", "ISO 14001", "ISO 45001", "Excellent Grade Contractor"];

// Certificates — click to view the full TÜV NORD scan
export const certificates = [
  { name: "ISO 9001 : 2015", scope: "Quality Management", img: asset("/images/awards/cert-iso-9001.jpg") },
  { name: "ISO 14001 : 2015", scope: "Environmental Management", img: asset("/images/awards/cert-iso-14001.jpg") },
  { name: "ISO 45001 : 2018", scope: "Health & Safety Management", img: asset("/images/awards/cert-iso-45001.jpg") },
];

export const awards = [
  { name: "Forbes Middle East", detail: "Top 100 Businessmen in the Middle East", img: asset("/images/awards/award-forbes.jpg") },
  { name: "Achievement Forum — Top 100", detail: "Top 100 Register, London", img: asset("/images/awards/award-top100.jpg") },
  { name: "Europe Business Assembly", detail: "International business excellence", img: asset("/images/awards/award-eba.jpg") },
  { name: "ESQR", detail: "European Society for Quality Research", img: asset("/images/awards/award-esqr.jpg") },
  { name: "Gray Matter", detail: "Brand excellence recognition", img: asset("/images/awards/award-graymatter.jpg") },
  { name: "Golden Achievement Award", detail: "Dubai — 2020", img: asset("/images/awards/award-golden.jpg") },
];

export const awardMentions = [
  "MEED Project Award 2023 — Aloft Hotel Muscat",
  "Dossier Construction Awards 2023",
  "Business Leader of the Year 2023 — Dr. Aadil Thomas Alexander",
  "Oman Best Brand Awards 2019",
  "Middle East Super 100 Award",
  "MEED Industrial Project of the Year — Mazoon Dairy",
];

export const sustainability = [
  "STP & RO plants at all facilities",
  "Solar energy harvesting",
  "Hybrid / EV fleet transition",
  "Energy-efficient lighting & HVAC",
  "Paperless office programme",
];

// Group companies — logos from the archive; URLs from the company's own "Website Links" file
/** One bookable property behind the Adrak Hotels tile. */
export type HotelProperty = {
  name: string;
  kind: string;
  place: string;
  url: string;
  img: string;
};

/**
 * Adrak Hotels runs two resorts in Kerala under separate domains, so its tile
 * cannot simply link somewhere — it has to ask which one first.
 *
 * Photographs are each property's own, from its site. Their logos are not used
 * here: Mountain Mist ships only a leaf mark with no wordmark and Summer Sand's
 * is white-on-transparent, so the pair would neither match each other nor
 * survive a light background. The leaf mark carries the tile instead, and the
 * cards are typeset over the photographs.
 */
export const adrakHotelProperties: HotelProperty[] = [
  {
    name: "Adrak Mountain Mist",
    kind: "Forest Resort",
    place: "Wayanad, Kerala",
    url: "https://mountainmist.in/",
    img: asset("/images/hotels/mountain-mist.jpg"),
  },
  {
    name: "Adrak Summer Sand",
    kind: "Hill Resort",
    place: "Vagamon, Kerala",
    url: "https://summersand.in/",
    img: asset("/images/hotels/summer-sand.jpg"),
  },
];

export type GroupCompany = {
  name: string;
  img?: string;
  url?: string;
  /** when present the tile opens a chooser rather than navigating anywhere */
  choose?: HotelProperty[];
};

export const groupCompanies: GroupCompany[] = [
  { name: "AdLife Hospital", img: asset("/images/group/adlife.jpg"), url: "https://www.adlifeoman.com" },
  { name: "Adrak Hotels & Resorts", img: asset("/images/group/hotels.jpg"), url: "https://adrakhotelsandresorts.com" },
  { name: "Adrak Hotels", img: asset("/images/group/hotels-india.jpg"), choose: adrakHotelProperties },
  { name: "Hai Al Naseem", img: asset("/images/group/hai-al-naseem.jpg"), url: "https://www.haialnaseem.com" },
  { name: "Al Maskaan Village", img: asset("/images/group/maskaan.jpg"), url: "https://almaskaanvillage.com" },
  { name: "Adante Realty", img: asset("/images/group/adante.jpg"), url: "https://www.adanterealty.com" },
  { name: "Insight Solutions", img: asset("/images/group/insight.jpg"), url: "https://insightoman.org" },
  { name: "Adrak Developers", img: asset("/images/group/developers.jpg"), url: "https://www.haialnaseem.com" },
  { name: "Adrak Builders", img: asset("/images/group/builders.jpg") },
  { name: "Adrak Facilities", img: asset("/images/group/facilities.jpg") },
  { name: "Adrak India", img: asset("/images/group/india.jpg") },
  { name: "Adrak Ventures", img: asset("/images/group/ventures.jpg") },
  { name: "Al Khaith Industries", img: asset("/images/group/khaith.jpg") },
  /* aimsoman.com has no working HTTPS — its certificate belongs to an
     unrelated domain — so this has to stay an http:// link until the host is
     fixed. Browsers will mark the destination "not secure". */
  { name: "AIMS Pharmacy", img: asset("/images/group/aims.jpg"), url: "http://aimsoman.com/" },
  { name: "Trufud Farm", img: asset("/images/group/trufud.jpg"), url: "https://trufudoman.com" },
  { name: "Trinity College of Engineering", img: asset("/images/group/trinity.jpg"), url: "https://thetrinitycollege.in" },
];

export const clients = [
  "Central Bank of Oman", "Royal Oman Police", "Ministry of Defense", "Ministry of Health",
  "Ministry of Higher Education", "Ahli Bank", "Haya Water", "Sultan Qaboos University",
  "Mazoon Dairy", "Renaissance", "Oman Refinery Co.", "Saud Bahwan Group",
  "Suhail Bahwan Group", "Zubair Corporation", "Madayn", "Ministry of Housing & Urban Planning",
  "Public Prosecution", "Sohar University", "Muscat Insurance", "Al Maha Petroleum",
];

// Full clientele — every client from aladrak.com/clientele.php, categorized
export const clientele = [
  {
    group: "Government & Public Sector",
    names: [
      "Government of Oman", "Ministry of Defense", "Ministry of Health", "Ministry of Higher Education",
      "Ministry of Education", "Ministry of Justice", "Ministry of Foreign Affairs", "Ministry of Manpower",
      "Ministry of Housing & Urban Planning", "Ministry of Agriculture & Fisheries",
      "Ministry of Environment & Climate Affairs", "Ministry of Social Development",
      "Ministry of Sports Affairs", "Ministry of Regional Municipalities & Water Resources",
      "Royal Oman Police", "Public Prosecution", "Public Authority for Craft Industries",
      "Public Establishment for Industrial Estates", "Madayn", "Haya Water",
      "Oman Electricity Transmission Company",
    ],
  },
  {
    group: "Banking, Finance & Corporate",
    names: [
      "Central Bank of Oman", "Ahli Bank", "Muscat Insurance Company SAOG", "Al Maha Petroleum",
      "Oman Gas Co.", "Oman Refinery Co.", "Saud Bahwan Group", "Suhail Bahwan Group",
      "Zubair Corporation", "Shumookh Investment & Services", "Sohar International Development & Investment",
      "Majis Industrial Services", "Renaissance", "Mazoon Dairy", "Barzaman Group",
      "ASAAS", "Muscat Hills Joint Development",
    ],
  },
  {
    group: "Education, Health & Research",
    names: [
      "Sultan Qaboos University", "Sultan Qaboos University Hospital", "Sohar University",
      "Waljat Colleges of Applied Sciences", "Mazoon College", "Al Buraimi College",
      "The Research Council", "Al Tamkeen International School",
    ],
  },
  {
    group: "Diplomatic Missions",
    names: ["Iraq Embassy", "Qatar Embassy"],
  },
];

export type Office = {
  name: string;
  address: string[];
  phone?: string;
  fax?: string;
  email: string;
};

/**
 * Office contact details, transcribed from Al Adrak's own Contact Us page.
 *
 * Kept as discrete fields rather than a flat list of lines so the block can
 * render each one with its proper icon, mark up tel:/mailto: links, and omit
 * what a given office does not have (KSA has no published phone; only Oman
 * publishes a fax).
 */
export const offices: Office[] = [
  {
    name: "Sultanate of Oman Office",
    address: ["Express Highway Exit, Halban, Sultanate of Oman"],
    phone: "+968 2200 1300",
    fax: "+968 2200 1301",
    email: "info@aladrak.com",
  },
  {
    name: "UAE Office",
    address: ["Office No.05,", "Schon Business Park, DIP-1, Dubai, UAE"],
    phone: "+971 4 8049666",
    email: "info.dxb@aladrak.com",
  },
  {
    name: "KSA Office",
    address: [
      "P O Box: 45383, 11512 Riyadh, Office No-21,",
      "East in Al-Khair 2 Commercial Building, Khurais Road,",
      "Al Naseem, Al Gharbi, Riyadh",
    ],
    email: "info.ksa@aladrak.com",
  },
  {
    name: "India Office",
    address: [
      "1st Floor, Trinity College of Engineering, Poovada,",
      "Trinity Hills, Near Pravachambalam, Naruvamoodu P.O,",
      "Trivandrum, Kerala, India - 695528",
    ],
    phone: "0471 – 391134",
    email: "info@adrakindia.com",
  },
];

/**
 * Health, Safety & Environment.
 *
 * The training copy is the company's own, from the corporate profile; the rest
 * describes what the training-centre photographs actually show — induction
 * halls, the PPE wall, the multilingual notice board, the scaffold rig. No
 * figures are claimed here. A safety page that quotes man-hours or incident
 * rates without a source is worse than one that does not, because those are the
 * numbers a client will check.
 */
export const hse = {
  kicker: "Health, Safety & Environment",
  title: "Everyone goes home the way they arrived",
  lead: "Safety is an absolute core value at Al Adrak — integrated into every phase of the construction lifecycle, from mobilization to handover. We safeguard our workforce, trade contractors, project partners and surrounding communities on one uncompromising principle: all site incidents are preventable.",
  /** verbatim from the corporate profile's Training & Development section */
  trainingQuote:
    "Al Adrak recognizes that in a rapidly changing world, being in tune with the latest technology and skills is the only way to success. We have ensured that our employees have access to the best training facilities to equip them to deliver their best. In-house training facilities cater to the staff with the best teachers and learning environment.",
  centre: {
    title: "An in-house training centre",
    body: "Rather than send people out for certification, Al Adrak built the classroom on its own campus. Inductions, toolbox talks, supervisor sessions and practical assessments all run here, in the languages the workforce actually speaks — so training happens before the shift, not after an incident.",
    img: asset("/images/hse/hse-induction.jpg"),
  },
  pillars: [
    { no: "01", title: "Induction before the first shift", desc: "Every worker and every subcontractor is inducted before they set foot on a site — the hazards of that specific project, the rules that apply, and who to stop work with." },
    { no: "02", title: "Weekly toolbox talks", desc: "A briefing at the workface every week, on the work actually in hand — the hazards of the current stage, what changed since the last talk, and what to watch for in the days ahead." },
    { no: "03", title: "Working at height", desc: "A purpose-built scaffold rig on the campus, so erecting, inspecting and working from a scaffold is practised on the ground before it is done at height." },
    { no: "04", title: "Personal protective equipment", desc: "PPE is issued, fitted and checked — the training centre's equipment wall shows exactly what is required for each trade, and what good condition looks like." },
    { no: "05", title: "Emergency response", desc: "Fire drills, extinguisher handling and first-aid training, so the response to an incident is practised rather than improvised." },
    { no: "06", title: "Environmental care", desc: "Waste segregation, dust and noise control, and protection of the ground and water around every site — the commitments behind the ISO 14001 certification." },
  ],
  gallery: [
    { src: asset("/images/hse/hse-ppe-wall.jpg"), label: "The PPE wall — what each trade is issued, and what good condition looks like" },
    { src: asset("/images/hse/hse-toolbox.jpg"), label: "A weekly toolbox talk at the workface" },
    { src: asset("/images/hse/hse-classroom.jpg"), label: "A supervisor session in the training hall" },
    { src: asset("/images/hse/hse-noticeboard.jpg"), label: "Safety notices in the languages the workforce speaks" },
    { src: asset("/images/hse/hse-scaffold.jpg"), label: "The scaffold rig used for working-at-height training" },
    { src: asset("/images/hse/hse-ppe-brief.jpg"), label: "Protective equipment briefing" },
  ],
  /* The certificate scans and registration details are from the IAS/FAHSS
     originals in the corporate HSE folder — recertified 25-07-2025, all three
     valid to 16-06-2028 and verifiable at iafcertsearch.org. */
  certs: [
    { code: "ISO 45001:2018", desc: "Occupational health & safety management", reg: "IAS 03 2200341", img: asset("/images/hse/cert-ias-45001.jpg"), pdf: asset("/docs/hse/certificate-iso-45001.pdf") },
    { code: "ISO 14001:2015", desc: "Environmental management", reg: "IAS 02 2200341", img: asset("/images/hse/cert-ias-14001.jpg"), pdf: asset("/docs/hse/certificate-iso-14001.pdf") },
    { code: "ISO 9001:2015", desc: "Quality management", reg: "IAS 01 2200341", img: asset("/images/hse/cert-ias-9001.jpg"), pdf: asset("/docs/hse/certificate-iso-9001.pdf") },
  ],
  certsNote: "Certified since 2018 · FAHSS, an IAS-accredited certification body · current certificates valid to 16 June 2028",

  culture: {
    intro: "Our safety framework engages every tier of the organization — senior project leadership, site incharges and trade supervisors, and the frontline workforce — under an Incident and Injury-Free (IIF) commitment that leadership drives in person.",
    items: [
      { title: "Executive engagement", desc: "Senior management participate directly in site safety walks, high-risk work reviews and safety leadership workshops — the IIF commitment is led from the top, not delegated." },
      { title: "Corporate HSE Executive Committee", desc: "Chaired by top management: monthly reviews of company-wide leading and lagging KPIs, high-potential incidents and systemic lessons learned, alongside monthly executive site inspections." },
      { title: "Project HSE steering committees", desc: "Project managers lead monthly site committees of discipline engineers, subcontractor leads and trade foremen — reviewing hazard trends, pre-task planning quality and joint safety walks." },
      { title: "Safety champion network", desc: "Dedicated HSE professionals and trained worker safety champions embedded in active work zones across all shifts, coaching, monitoring and recognising safe work in real time." },
    ],
  },

  operations: {
    intro: "Safety controls are embedded directly into site execution strategy, method statements (RAMS) and daily workflows — hazard identification tools, a strengthened high-risk Permit to Work system, and specialized programs for the work that can hurt people.",
    highRisk: ["Work at height", "Heavy & critical lifting", "Deep excavation & trenching", "Confined space entry", "Electrical safety", "Hot works", "Temporary works stability"],
    items: [
      { title: "Permit to Work (PTW)", desc: "Strict physical permit verification for all hot work, electrical isolation (LOTO), deep digging and overhead crane lifts — before work commences, not after." },
      { title: "IIF at the work face", desc: "Pre-task toolbox talks and Daily Activity Hazard Assessments (DAHA), conducted by foremen at the immediate work face before any task begins." },
    ],
  },

  lifeSavingRules: {
    intro: "Non-negotiable boundaries for everyone on site — Al Adrak staff and trade contractors alike. These nine rules address the activities carrying the highest potential for severe harm in building and infrastructure construction, and 2026's target is 100% compliance across every operational site.",
    poster: asset("/docs/hse/9-life-saving-rules.pdf"),
    rules: [
      "Do not walk under a suspended load",
      "No alcohol or drugs while working or driving",
      "While driving, do not use your phone and do not exceed speed limits",
      "Do not smoke outside designated smoking areas",
      "Work with a valid work permit",
      "Protect yourself against a fall when working at height",
      "Obtain authorization before overriding or disabling safety-critical equipment",
      "Wear your seat belt",
      "Conduct gas tests when required",
    ],
  },

  trainingExtras: [
    { title: "Multilingual delivery", desc: "Inductions and critical-risk modules run in the languages the workforce actually speaks — Hindi, Urdu, Bengali, Malayalam and English." },
    { title: "Learning & HSE tracking portal", desc: "Supervisors and project managers track mandatory certifications, refreshers and site clearance status on a centralized portal." },
    { title: "Practical field modules", desc: "Working safely at heights, scaffolding inspection and usage, rigging and slinging, defensive driving for heavy plant operators, mock drills and emergency response." },
  ],

  subcontractors: {
    intro: "Specialized trade partners perform significant volumes of site execution, so every subcontractor is integrated completely into the Al Adrak HSE management system — same rules, same training, same boundaries.",
    items: [
      { title: "Pre-qualification & onboarding", desc: "Strict pre-qualification on historical HSE performance, safety management capability and equipment maintenance records." },
      { title: "Heat stress management", desc: "Thermal Work Limit monitoring and structured summer protocols — work-rest regimes, shaded break areas and hydration stations — enforced across all trades." },
      { title: "Mandatory verification", desc: "No subcontractor craftsman sets foot on site without the Al Adrak HSE induction and a Life Saving Rules evaluation." },
    ],
  },

  health: {
    intro: "Strict medical governance ensures everyone is physically fit for their designated trade — aligned with national labour law and OSHA/ILO occupational health standards.",
    items: [
      { title: "Fitness-for-duty screening", desc: "Pre-employment and periodic trade-specific medicals — vision tests for crane operators, vertigo and cardiac checks for work at height, audiometric testing." },
      { title: "On-site medical hubs", desc: "Site clinics and first-aid stations staffed by licensed medical personnel — emergency triage, minor treatment and routine wellness checks." },
      { title: "Proactive health campaigns", desc: "Continuous monitoring of fatigue, chronic health risks, hydration and ergonomic wellbeing across camps and project sites." },
    ],
  },

  wellness: {
    kicker: "Wellness Tracking",
    title: "Seven minutes that start every shift",
    body: "We maintain our cranes and excavators on strict schedules; the human body deserves no less. Proposed by the HSE department and backed by the CED, Wellness Tracking dedicates the first seven minutes of every morning — inside the daily PEP talk — to stretching and physical preparation. Warm muscles resist strains, moving together builds one crew out of many trades, and a held stretch is a quiet daily check-in that catches a tight back before it becomes a career-altering injury.",
    photos: [
      { src: asset("/images/hse/wellness-mountain.jpg"), label: "The morning warm-up, before the first task of the day" },
      { src: asset("/images/hse/wellness-dawn.jpg"), label: "A dawn muster — every trade, every shift" },
      { src: asset("/images/hse/wellness-palms.jpg"), label: "The same seven minutes on every site" },
      { src: asset("/images/hse/wellness-interior.jpg"), label: "Fit-out crews warm up too" },
    ],
  },

  objectives: {
    year: "2026",
    intro: "Set by top management, signed by the Chief Executive Director, and reviewed quarterly — the 2026 objectives commit every site to measurable targets.",
    kpis: [
      { value: "0", label: "Work fatalities — the only acceptable number" },
      { value: "0", label: "Lost-time injuries" },
      { value: "<1", label: "Lost-time injury frequency, year to date" },
      { value: "<0.5", label: "Total recordable case frequency" },
      { value: "100%", label: "Compliance with the HSE training matrix" },
      { value: "12+", label: "Leadership safety walks each year" },
    ],
    pdf: asset("/docs/hse/hse-objectives-targets-kpi-2026.pdf"),
  },

  policies: [
    { name: "HSE Policy", file: asset("/docs/hse/al-adrak-hse-policy.pdf") },
    { name: "Drug & Alcohol Policy", file: asset("/docs/hse/drug-and-alcohol-policy.pdf") },
    { name: "Road Safety Policy", file: asset("/docs/hse/road-safety-policy.pdf") },
    { name: "Smoke-Free Policy", file: asset("/docs/hse/smoke-free-policy.pdf") },
    { name: "9 Life-Saving Rules poster", file: asset("/docs/hse/9-life-saving-rules.pdf") },
    { name: "2026 Objectives, Targets & KPI", file: asset("/docs/hse/hse-objectives-targets-kpi-2026.pdf") },
  ],
};

export const careers = [
  {
    role: "Master Planner",
    exp: "8+ years",
    qual: "Graduation / Post-Graduation in Urban Design with an architectural background",
    desc: "Work on large-scale urban design and master-planning projects of varying complexity, from idea to detailed design — residential, mixed-use and urban regeneration.",
  },
  {
    role: "Rebar Detailer",
    exp: "3–5 years",
    qual: "Diploma / Degree in Civil Engineering",
    desc: "Create reinforcement shop drawings using CADS RC or similar CAD programs, describing rebar and steel specifications for live projects.",
  },
  {
    role: "Interior Designer",
    exp: "10 years",
    qual: "Bachelor's or Master's in Architecture",
    desc: "Decorate interior spaces end-to-end — layout, colour, lighting, materials, custom furniture. AutoCAD, SketchUp, 3ds Max or Illustrator required.",
  },
  {
    role: "Oracle Database Administrator",
    exp: "5+ years",
    qual: "B.Tech / BE / MCA or similar",
    desc: "Administer Oracle databases with thorough knowledge of Oracle SQL — DDL, DML and DCL.",
  },
  {
    role: "HSE Advisor",
    exp: "10 years",
    qual: "Any recognised degree; BE / B.Tech an advantage",
    desc: "Champion site safety with strong knowledge of OSHA procedures and NEBOSH standards.",
  },
];

export const future =
  "Inspired by Oman Vision 2040, Al Adrak is expanding across the Middle East and the Indian subcontinent — a 200-key international hotel in Bousher, the OMR 100 million Hai Al Naseem development, Ellington House residences in Dubai, IPDS power-distribution schemes in Madhya Pradesh, and hospitality projects in Kerala.";
