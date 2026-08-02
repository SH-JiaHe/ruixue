// Curated cinematic photo gallery.
// Photos are real photojournalism from Wikimedia Commons (CC licensed).
// See /home/z/my-project/scripts/photos-*.json for the raw source data.

export interface GalleryPhoto {
  url: string
  caption: string
  alt: string
  credit: string
  /** Which act of the cinematic sequence this photo belongs to. */
  act: 'ukraine' | 'gaza' | 'peace'
  /** Optional sub-category (for peace photos: dove/candlelight/children). */
  category?: 'dove' | 'candlelight' | 'children'
}

export const GALLERY: GalleryPhoto[] = [
  // === UKRAINE ACT ===
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kharkiv_after_Russian_shelling%2C_2022-09-06_%2844%29.jpg/1920px-Kharkiv_after_Russian_shelling%2C_2022-09-06_%2844%29.jpg',
    caption:
      '乌克兰哈尔科夫 · 2022年9月6日 — 一栋居民楼在S-300火箭弹袭击中化为废墟。',
    alt: '被俄军S-300火箭弹摧毁的哈尔科夫居民楼废墟',
    credit: 'DSNS Ukraine / CC BY 4.0',
    act: 'ukraine',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Two_child_refugees_Przemy%C5%9Bl_G%C5%82%C3%B3wny.jpg/1920px-Two_child_refugees_Przemy%C5%9Bl_G%C5%82%C3%B3wny.jpg',
    caption:
      '波兰普热梅希尔火车站 · 2022年3月8日 — 两名乌克兰儿童在战火中逃离家园。',
    alt: '火车站里两名无助的乌克兰儿童难民',
    credit: '梁柏堅 Pakkin Leung / CC BY 4.0',
    act: 'ukraine',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Kharkiv_after_Russian_shelling%2C_2022-07-11_%2811%29.jpg/1920px-Kharkiv_after_Russian_shelling%2C_2022-07-11_%2811%29.jpg',
    caption:
      '乌克兰哈尔科夫 · 2022年7月11日 — 救援人员从废墟中救出一名86岁的老妇人。',
    alt: '哈尔科夫被炸毁居民楼坍塌的入口与救援现场',
    credit: 'DSNS Ukraine / CC BY 4.0',
    act: 'ukraine',
  },

  // === GAZA ACT ===
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Damage_in_Gaza_Strip_during_the_October_2023_-_29.jpg/1920px-Damage_in_Gaza_Strip_during_the_October_2023_-_29.jpg',
    caption:
      '加沙城里马尔区 · 2023年10月9日 — 以色列空袭过后，整片居民楼化为废墟。',
    alt: '被以色列空袭摧毁的加沙城里马尔区居民楼废墟',
    credit: 'WAFA / APAimages / CC BY-SA 3.0',
    act: 'gaza',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Damage_in_Gaza_Strip_during_the_October_2023_-_45.jpg/1920px-Damage_in_Gaza_Strip_during_the_October_2023_-_45.jpg',
    caption:
      '加沙城阿勒希法医院 · 2023年10月11日 — 一名受伤的巴勒斯坦婴儿正在接受救治。',
    alt: '加沙阿勒希法医院急诊病房里接受救治的受伤巴勒斯坦婴儿',
    credit: 'WAFA / APAimages / CC BY-SA 3.0',
    act: 'gaza',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Forced_Displacement_of_Gaza_Strip_Residents_During_the_Gaza-Israel_War_23-25.jpg/1920px-Forced_Displacement_of_Gaza_Strip_Residents_During_the_Gaza-Israel_War_23-25.jpg',
    caption:
      '加沙地带 · 2025年1月29日 — 战火摧残下被迫逃离家园的巴勒斯坦平民。',
    alt: '被迫逃离家园、沿路迁徙的加沙巴勒斯坦平民',
    credit: 'Jaber Jehad Badwan / CC BY-SA 4.0',
    act: 'gaza',
  },

  // === PEACE ACT ===
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Candlelight_vigil_for_Ukraine%2C_UNU_Plaza%2C_Tokyo.jpg/1920px-Candlelight_vigil_for_Ukraine%2C_UNU_Plaza%2C_Tokyo.jpg',
    caption:
      '日本东京·联合国大学广场 · 2022年4月8日 — 东京市民点燃烛光，为乌克兰守夜。',
    alt: '东京联合国大学广场烛光守夜活动',
    credit: 'Syced / CC0',
    act: 'peace',
    category: 'candlelight',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Still_smiling_despite_the_hardship_they_face_%2811174085546%29.jpg/1920px-Still_smiling_despite_the_hardship_they_face_%2811174085546%29.jpg',
    caption:
      '黎巴嫩贝卡谷地 · 2013年11月5日 — 两个叙利亚难民男孩依然笑得像孩子该有的样子。',
    alt: '黎巴嫩贝卡谷地两个叙利亚难民男孩面对镜头微笑',
    credit: 'DFID / CC BY 2.0',
    act: 'peace',
    category: 'children',
  },
]
