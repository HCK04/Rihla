const W = (path: string, file: string) =>
  `https://upload.wikimedia.org/wikipedia/${path}/thumb/${file}/500px-${file.split('/').pop()}`

const WD = (url: string) => url

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=85`

export const SPOT_IMAGES: Record<string, string> = {

  // ── Marrakech ─────────────────────────────────────────────────────────────
  'mkc-jardin-majorelle':
    W('commons', 'c/c2/Le_jardin_des_majorelle_40.JPG'),
  'mkc-djemaa-el-fna':
    WD('https://upload.wikimedia.org/wikipedia/commons/b/be/Jemaa_El_Fna%2C_Marrakech_-_panoramio.jpg'),
  'mkc-le-jardin-secret':
    WD('https://upload.wikimedia.org/wikipedia/commons/3/33/Secret_Garden_Marrakesh_2022.jpg'),
  'mkc-mellah':
    WD('https://upload.wikimedia.org/wikipedia/commons/7/78/In_the_narrow_streets_of_Mellah_of_Marrakech.jpg'),
  'mkc-el-badi-palace':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/%CE%9A%CE%B5%CE%BD%CF%84%CF%81%CE%B9%CE%BA%CE%AE_%CE%B1%CF%85%CE%BB%CE%AE_%CE%95%CE%BB_%CE%9C%CF%80%CE%B1%CE%BD%CF%84%CE%AF_1127.jpg/500px-%CE%9A%CE%B5%CE%BD%CF%84%CF%81%CE%B9%CE%BA%CE%AE_%CE%B1%CF%85%CE%BB%CE%AE_%CE%95%CE%BB_%CE%9C%CF%80%CE%B1%CE%BD%CF%84%CE%AF_1127.jpg',
  'mkc-medersa-ben-youssef':
    W('commons', '3/3a/Coranic_School_%28106589859%29.jpeg'),
  'mkc-bahia-palace':
    W('commons', 'f/fc/Bahia_Palace_large_court.jpg'),
  'mkc-koutoubia-gardens':
    W('commons', '4/49/Marokko0112_%28retouched%29.jpg'),

  // ── Fez ───────────────────────────────────────────────────────────────────
  'fez-bab-bou-jeloud':
    W('commons', 'e/e8/Bab_Bou_Jeloud_%28Fes%2C_Marocco%29.jpg'),
  'fez-bou-inania':
    W('commons', 'a/a1/Bou_Inania_Madrasa_2011.jpg'),
  'fez-chouara-tanneries':
    WD('https://upload.wikimedia.org/wikipedia/commons/d/d9/Leather_tanning%2C_Fes.jpg'),
  'fez-al-qarawiyyin':
    W('commons', '7/74/University_of_Al_Qaraouiyine.jpg'),
  'fez-merenid-tombs':
    W('commons', '9/92/Marinid_Tombs_in_April_2016_1.jpg'),
  'fez-jardin-jnan-sbil':
    W('commons', '5/5a/Oued_Fes_between_Old_Mechouar_and_Jnan_Sbil_DSCF5001.jpg'),
  'fez-attarine-madrasa':
    W('commons', 'a/a7/Al-Attarine_Madrasa_DSCF3633_%28R_Prazeres%29.jpg'),

  // ── Casablanca ────────────────────────────────────────────────────────────
  'cas-hassan-ii':
    W('en', 'c/ce/Hassan_II_mosque%2C_Casablanca_2.jpg'),
  'cas-habous':
    W('commons', 'c/cb/One_of_the_most_instragmable_views_of_the_old_medina_the_habous_in_Casablanca.jpg'),
  'cas-bain-des-roches':
    W('commons', '5/54/Sidi_Abderrahman.jpg'),
  'cas-ancienne-medina':
    W('commons', '1/12/Ancienne_Medina_%28Medina_lakdima%29_casablanca_Morocco.jpg'),

  // ── Rabat ─────────────────────────────────────────────────────────────────
  'rbt-hassan-tower':
    W('commons', 'd/d9/Hassan_Tower%2C_Rabat%2C_Marocco_%28%D8%B5%D9%88%D9%85%D8%B9%D8%A9_%D8%AD%D8%B3%D8%A7%D9%86_%29.jpg'),
  'rbt-kasbah-oudayas':
    W('commons', '9/97/Kasbah_Oudayas_exterior.jpg'),
  'rbt-cafe-maure':
    W('commons', '1/18/Morocco_-_Rabat_%2831387775324%29.jpg'),
  'rbt-chellah':
    W('commons', '3/33/Roman_Ruins_Zawiya_Chellah_Rabat_Nov25_A7CR_08989.jpg'),
  'rbt-oudayas-walls':
    W('commons', '9/97/Kasbah_Oudayas_exterior.jpg'),
  'rbt-bouknadel-garden':
    W('commons', '6/6e/Exotic_gardens_of_Rabat_Sale.jpg'),
  'rbt-museum-mohammed-vi':
    W('commons', '1/1a/Rabat_Mohammed_VI_Museum.jpg'),

  // ── Tangier ───────────────────────────────────────────────────────────────
  'tng-kasbah-museum':
    W('commons', 'a/a4/Tanger_cor.jpg'),
  'tng-petit-socco':
    W('commons', 'c/cf/Morocco_Tangier_Petit_Socco.jpg'),
  'tng-cap-spartel':
    W('commons', '9/95/Faro_del_cabo_Espartel%2C_Marruecos%2C_2015-12-11%2C_DD_02.JPG'),
  'tng-caves-hercules':
    W('commons', '1/1d/Cuevas_de_H%C3%A9rcules%2C_Cabo_Espartel%2C_Marruecos%2C_2015-12-11%2C_DD_07-09_HDR.JPG'),
  'tng-medina-tangier':
    W('commons', '9/95/Street_Scene_-_Medina_Old_City_-_Tangier_-_Morocco.jpg'),
  'tng-grand-socco':
    W('commons', '8/85/Grand_Socco_Tangier.jpg'),
  'tng-villa-harris':
    W('commons', '3/3d/Villa_Harris_%28Tangier%29_in_2024.jpg'),
  'tng-american-legation':
    W('commons', 'f/fb/Museo_del_Antiguo_Legado_Estadounidense%2C_T%C3%A1nger%2C_Marruecos%2C_2015-12-11%2C_DD_44-46_HDR.JPG'),
  'tng-plage-merkala':
    W('commons', '9/93/Sunset_in_Merkala_beach.jpg'),

  // ── Agadir ────────────────────────────────────────────────────────────────
  'aga-souss-massa':
    W('commons', 'e/eb/Museum_Souss_Massa_Park_Sidi_Binzarn_Oct25_A7CR_08117.jpg'),
  'aga-kasbah':
    W('commons', 'a/aa/AGADIR_OFELLA.jpg'),
  'aga-tiznit-souk':
    WD('https://upload.wikimedia.org/wikipedia/commons/8/82/Tiznit_Gate.jpg'),
  'aga-old-souk':
    W('commons', 'd/df/Agadir_Souk_Al_Had.jpg'),
  'aga-aghroud-beach':
    W('commons', '9/90/Agadir_beach_1989.jpg'),
  'aga-argan-cooperative':
    W('commons', '7/7d/Argan_Oil_Cooperative_01.jpg'),
  'aga-taroudant':
    W('commons', '2/20/Al_Kassbah%2C_Taroudant%2C_Morocco_-_panoramio.jpg'),
  'aga-imouzzer-valley':
    W('commons', '7/79/Crossing_the_High_Atlas_mountains_in_Morocco_-_45020232664.jpg'),
  'aga-beach-taghazout':
    W('commons', '8/87/Blue_fishing_boats_in_Taghazout%2C_Morocco_%288628196631%29.jpg'),
}

// Category fallbacks — used when a spot image fails to load
export const CATEGORY_IMAGES: Record<string, string> = {
  culture:   U('1526392060635-9d6019884377'),
  food:      U('1547592166-23ac48db6478'),
  nature:    U('1509023464722-18d996393ca8'),
  medina:    U('1531835551805-16d864c8d311'),
  market:    U('1574280603398-c7d0e0b5ee19'),
  hammam:    U('1620756236614-a3d8b528c6ba'),
  cafe:      U('1547592166-23ac48db6478'),
  museum:    U('1583508915901-11f8ddd7ca92'),
  mosque:    U('1548707309-dcebeab9ea9b'),
  viewpoint: U('1503014214-22af661f6-e0c9'),
}

export function getCategoryFallback(category: string): string {
  return CATEGORY_IMAGES[category] ?? U('1526392060635-9d6019884377')
}

export function getSpotImage(spotId: string, category: string): string {
  return SPOT_IMAGES[spotId] ?? CATEGORY_IMAGES[category] ?? U('1526392060635-9d6019884377')
}
