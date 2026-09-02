import { asset } from "./asset";

/**
 * The live register — projects currently in delivery, carried by their internal
 * project numbers because that is how the company tracks and talks about them.
 *
 * Kept out of content.ts deliberately: this list turns over on its own cadence
 * as jobs are won and handed over, and it is the one block on the site whose
 * copy comes verbatim from the company's own project register rather than from
 * marketing.
 *
 * Every entry carries an image. Eight are real photographs or renders — the
 * Muscat Pavilion one lifted off a single-page award notice, so it is set as a
 * band rather than cropped — and the other eight have had no shoot yet, and pairing polished copy with a
 * photograph of a different building would be worse than showing none — those
 * point at typographic plates of the project number, baked by
 * scripts/prep-register.mjs. Replace a plate path with a real photograph here
 * when one arrives.
 */
export type RegisterProject = {
  code: string;
  name: string;
  place?: string;
  sector: string;
  desc: string;
  img: string;
  /** shown in the project modal, below the description */
  specs?: string[];
  /**
   * True when `img` is a wide band or panorama rather than a 4:3 photograph.
   * The portfolio grid makes every seventh card a tall 3/4.5 crop, which keeps
   * only the middle half of such art — enough to cut both wings off a building.
   * Wide cards keep their 4:3 slot.
   */
  wide?: boolean;
};

export const currentPortfolio: RegisterProject[] = [
  {
    code: "P.387 RRK",
    name: "Ring Road & Associated Infrastructure Works",
    place: "Knowledge Oasis Muscat",
    sector: "Infrastructure",
    img: asset("/images/register/rrk.jpg"),
    desc: "A major infrastructure development within Knowledge Oasis Muscat, designed to enhance connectivity, accessibility and the overall urban environment of the technology park. The project incorporates 2.8 km of dual carriageway and 3 km of single carriageway, supported by traffic signals, roundabouts, culverts, pedestrian pathways and dedicated cycle tracks. Extensive landscaping, architectural monuments, interlock paving and utility infrastructure further enhance the development. The project reflects a high standard of infrastructure delivery aligned with MOTC and Municipality requirements.",
  },
  {
    code: "P.388 MPM",
    name: "Muscat Pavilion",
    place: "Muscat Hills",
    sector: "Commercial",
    img: asset("/images/register/mpm.jpg"),
    wide: true,
    desc: "Muscat Pavilion is a contemporary multifunctional development located within the prestigious Muscat Hills community. The project is designed to provide a versatile and modern environment that supports a range of social, leisure, community and event-based activities. Its location within one of Muscat’s established mixed-use destinations gives the development a distinctive urban and lifestyle character. The project contributes to enhancing the community experience within the wider Muscat Hills development.",
  },
  {
    code: "P.391 PPM",
    name: "Public Prosecution Authority Building",
    place: "Madinat Al Irfan, Bausher",
    sector: "Government",
    img: asset("/images/register/ppm.jpg"),
    // carried over from the flagship gallery card this entry replaced
    specs: [
      "Office complex for the Public Prosecution Directorates",
      "L+G+5, approximately 38,829 m² built-up area",
      "Monumental pointed-arch portal with reflecting pool",
      "Soaring stacked-ring central atrium",
      "Stone-clad façade with pergola & mashrabiya detailing",
    ],
    desc: "A landmark government development at Madinat Al Irfan, Bausher, developed as the head office of the Public Prosecution Authority. The L+G+5 facility provides approximately 38,829 m² of built-up area and combines complete civil, architectural and MEP systems within a modern institutional setting. A prominent stone-clad façade and stepped architectural form give the building a strong and distinguished identity. The development reflects a balance of functionality, efficiency and contemporary governmental architecture.",
  },
  {
    code: "P.392 CLA",
    name: "Community Facility & Labour Accommodation",
    place: "Khazaen Economic City",
    sector: "Residential",
    img: asset("/images/register/cla.jpg"),
    desc: "An integrated community and accommodation development within Khazaen Economic City, one of Oman’s major economic and logistics zones. The project spans approximately 18,654 m² of built-up area and includes labour accommodation, commercial facilities, a mosque, an Imam’s residence and substantial landscaped areas. Complete civil and associated MEP works form part of the development. The project has been designed to support the social, operational and welfare requirements of the wider economic city.",
  },
  {
    code: "P.396 TIS",
    name: "Al Tamkeen International School",
    place: "Al Khoud, Muscat",
    sector: "Education",
    img: asset("/images/register/tis.jpg"),
    desc: "A premium international educational development located at Al Khoud in Muscat Governorate. The school comprises approximately 32,490 m² of built-up area with a 2B+G+2+P configuration, integrating complete civil and MEP systems within a purpose-built educational environment. The development is designed to support modern learning, administration and student activities in a high-quality campus setting. The project represents a significant addition to Oman’s growing portfolio of international-standard educational facilities.",
  },
  {
    code: "P.399 DBK",
    name: "Bandar Al Khairan Resort & Spa",
    place: "Bandar Al Khairan",
    sector: "Hospitality",
    img: asset("/images/register/dbk.jpg"),
    desc: "A luxury coastal hospitality destination set within the dramatic landscape of Bandar Al Khairan. The 121-key resort extends across approximately 23,803 m² and comprises 51 guest rooms, 46 chalets and 24 villas overlooking the Gulf of Oman. Designed to harmonize with the surrounding mountains and coastline, the development combines premium accommodation with a distinctive resort setting. The property is planned to be operated by Anantara, reinforcing its positioning as a high-end tourism and lifestyle destination.",
  },
  {
    code: "P.400 CSD",
    name: "Awan Services Development",
    place: "Azaiba, Muscat",
    sector: "Commercial",
    img: asset("/images/register/plate-csd.jpg"),
    desc: "A contemporary commercial and services development strategically located in Azaiba, one of Muscat’s well-established urban districts. The project is characterized by modern architecture, extensive glazed façades, landscaped external areas and contemporary internal spaces. Designed to provide a high-quality business and service environment, the development combines functionality with a strong architectural identity. Its location and design position it as a modern addition to Muscat’s commercial landscape.",
  },
  {
    code: "P.402 IGA",
    name: "Logistics Gate — Phase II",
    place: "Muscat International Airport",
    sector: "Infrastructure",
    img: asset("/images/register/plate-iga.jpg"),
    desc: "A strategic infrastructure development supporting the logistics ecosystem of Muscat International Airport. The project forms part of the ongoing development of the airport’s logistics zone and is intended to improve connectivity, operational efficiency and infrastructure capacity. The development contributes to strengthening the surrounding logistics network and supports the continued expansion of aviation-related and commercial activities in the area. It represents an important component of Oman’s broader transport and logistics growth strategy.",
  },
  {
    code: "P.403 ZRB",
    name: "Zen Residence",
    place: "Muscat Bay",
    sector: "Residential",
    img: asset("/images/register/zrb.jpg"),
    desc: "A premium residential development located within the scenic Muscat Bay area. Zen Residence comprises a collection of contemporary residential buildings surrounded by landscaped communal areas, pedestrian spaces and leisure amenities. The development is designed to create a refined and comfortable living environment integrated with its natural surroundings. Its architectural character, landscaped setting and proximity to Muscat’s coastal destinations give the project a distinctive lifestyle appeal.",
  },
  {
    code: "P.404 YRS",
    name: "Yenaier Residences",
    place: "Sultan Haitham City",
    sector: "Residential",
    img: asset("/images/register/yrs.jpg"),
    wide: true,
    desc: "A major residential development forming part of Phase I of Sultan Haitham City, Oman’s flagship future urban destination. Yenaier Residences is envisioned as an integrated residential community characterized by contemporary architecture, landscaped public spaces and a well-connected urban environment. The masterplan presents a series of distinctive multi-storey residential buildings integrated with roads, green areas and community spaces. The development contributes to the vision of creating modern, sustainable and people-focused neighbourhoods within Sultan Haitham City.",
  },
  {
    code: "P.407 CRV",
    name: "Residential Development, Plot No. 673",
    place: "Bausher, Muscat",
    sector: "Residential",
    img: asset("/images/register/plate-crv.jpg"),
    desc: "A contemporary private residential development located in the established district of Bausher, Muscat. The project is designed to provide a modern and comfortable residential environment with emphasis on functionality, quality and architectural appeal. Its location within one of Muscat’s key residential areas provides convenient access to surrounding commercial, educational and community facilities. The development reflects a modern approach to urban residential living.",
  },
  {
    code: "P.408 KVF",
    name: "Khazaen Fruit & Vegetable Central Market — Phase 2",
    place: "Khazaen Economic City",
    sector: "Commercial",
    img: asset("/images/register/plate-kvf.jpg"),
    desc: "A key commercial and logistics development within Khazaen Economic City, supporting Oman’s food trading and distribution sector. The project forms part of the expansion of the Fruit & Vegetable Central Market and contributes to the modernization of wholesale trading, storage and distribution activities. Strategically located within Khazaen, the development benefits from direct connectivity to Oman’s growing logistics network. The project supports greater efficiency, centralization and long-term capacity within the country’s food supply chain.",
  },
  {
    code: "P.409 AMD",
    name: "AIDA Residential Apartments",
    place: "AIDA, Muscat",
    sector: "Residential",
    img: asset("/images/register/plate-amd.jpg"),
    desc: "A premium residential apartment development located within AIDA, one of Muscat’s most prominent integrated tourism and lifestyle destinations. The project comprises one G+7 and three G+9 residential buildings, designed with contemporary architecture, generous glazing, balconies and panoramic views. The residences form part of AIDA’s wider vision of creating a luxury coastal community combining residential, hospitality, leisure and lifestyle components. The development is positioned to deliver an elevated standard of urban and resort-style living.",
  },
  {
    code: "P.411 VTA",
    name: "AIDA Villas & Townhouses",
    place: "AIDA, Muscat",
    sector: "Residential",
    img: asset("/images/register/plate-vta.jpg"),
    desc: "A major luxury residential development within Phase 1 of the AIDA Master Development, comprising 91 villas and 60 townhouses. The project forms part of the AIDA Oceana community and includes premium villa concepts associated with the Trump and Fendi residential offerings. Contemporary architecture, landscaped surroundings, private outdoor spaces and refined interiors define the character of the development. The project is a key component of AIDA’s vision to establish a high-end coastal residential and lifestyle destination in Muscat.",
  },
  {
    code: "P.413 EWN",
    name: "Enabling Works — Neighborhoods & East Boulevard Extension",
    sector: "Infrastructure",
    img: asset("/images/register/plate-ewn.jpg"),
    desc: "A strategic enabling and infrastructure package supporting the development of new neighbourhoods and the extension of the East Boulevard corridor. The project provides the groundwork and essential infrastructure platform required for subsequent residential and community developments. It plays an important role in preparing the wider master development for future construction and urban expansion. The package contributes to improving connectivity, accessibility and development readiness across the project area.",
  },
  {
    code: "P.414 WRO",
    name: "Wiam Residences",
    place: "Neighborhoods 06C & 06D, Sultan Haitham City",
    sector: "Residential",
    img: asset("/images/register/plate-wro.jpg"),
    desc: "A residential development located within Neighborhoods 06C and 06D of Sultan Haitham City, Al Seeb. The project forms part of Oman’s flagship new-city development and contributes to the creation of integrated, modern and community-focused residential neighbourhoods. Wiam Residences is positioned within a wider urban environment that emphasizes connectivity, landscaped public spaces and quality of life. The development supports Sultan Haitham City’s vision of establishing a sustainable and contemporary model for future urban living.",
  },
];
