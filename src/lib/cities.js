/**
 * Chinese cities longitude database for 真太阳时 (True Solar Time) correction.
 * Standard meridian for China (UTC+8) is 120°E.
 * Offset formula: (120 - longitude) * 4 minutes
 */

// Major Chinese cities grouped by province/region
// Each entry: { name, province, lng (longitude in degrees East) }
export const CHINA_CITIES = [
  // 直辖市
  { name: '北京', province: '北京', lng: 116.40 },
  { name: '天津', province: '天津', lng: 117.20 },
  { name: '上海', province: '上海', lng: 121.47 },
  { name: '重庆', province: '重庆', lng: 106.55 },

  // 河北
  { name: '石家庄', province: '河北', lng: 114.51 },
  { name: '唐山', province: '河北', lng: 118.18 },
  { name: '秦皇岛', province: '河北', lng: 119.60 },
  { name: '邯郸', province: '河北', lng: 114.49 },
  { name: '保定', province: '河北', lng: 115.46 },
  { name: '张家口', province: '河北', lng: 114.88 },
  { name: '承德', province: '河北', lng: 117.93 },
  { name: '沧州', province: '河北', lng: 116.86 },
  { name: '廊坊', province: '河北', lng: 116.68 },
  { name: '衡水', province: '河北', lng: 115.67 },
  { name: '邢台', province: '河北', lng: 114.50 },

  // 山西
  { name: '太原', province: '山西', lng: 112.55 },
  { name: '大同', province: '山西', lng: 113.30 },
  { name: '阳泉', province: '山西', lng: 113.58 },
  { name: '长治', province: '山西', lng: 113.12 },
  { name: '晋城', province: '山西', lng: 112.85 },
  { name: '朔州', province: '山西', lng: 112.43 },
  { name: '运城', province: '山西', lng: 111.01 },
  { name: '临汾', province: '山西', lng: 111.52 },
  { name: '吕梁', province: '山西', lng: 111.14 },
  { name: '忻州', province: '山西', lng: 112.73 },
  { name: '晋中', province: '山西', lng: 112.75 },

  // 内蒙古
  { name: '呼和浩特', province: '内蒙古', lng: 111.75 },
  { name: '包头', province: '内蒙古', lng: 109.84 },
  { name: '赤峰', province: '内蒙古', lng: 118.89 },
  { name: '鄂尔多斯', province: '内蒙古', lng: 109.99 },
  { name: '呼伦贝尔', province: '内蒙古', lng: 119.77 },
  { name: '通辽', province: '内蒙古', lng: 122.24 },

  // 辽宁
  { name: '沈阳', province: '辽宁', lng: 123.43 },
  { name: '大连', province: '辽宁', lng: 121.61 },
  { name: '鞍山', province: '辽宁', lng: 122.99 },
  { name: '抚顺', province: '辽宁', lng: 123.96 },
  { name: '本溪', province: '辽宁', lng: 123.77 },
  { name: '丹东', province: '辽宁', lng: 124.38 },
  { name: '锦州', province: '辽宁', lng: 121.13 },
  { name: '营口', province: '辽宁', lng: 122.24 },
  { name: '阜新', province: '辽宁', lng: 121.67 },
  { name: '辽阳', province: '辽宁', lng: 123.17 },
  { name: '盘锦', province: '辽宁', lng: 122.07 },
  { name: '铁岭', province: '辽宁', lng: 123.84 },
  { name: '朝阳', province: '辽宁', lng: 120.45 },
  { name: '葫芦岛', province: '辽宁', lng: 120.84 },

  // 吉林
  { name: '长春', province: '吉林', lng: 125.32 },
  { name: '吉林', province: '吉林', lng: 126.55 },
  { name: '四平', province: '吉林', lng: 124.35 },
  { name: '通化', province: '吉林', lng: 125.94 },
  { name: '延吉', province: '吉林', lng: 129.51 },

  // 黑龙江
  { name: '哈尔滨', province: '黑龙江', lng: 126.65 },
  { name: '齐齐哈尔', province: '黑龙江', lng: 123.97 },
  { name: '牡丹江', province: '黑龙江', lng: 129.63 },
  { name: '佳木斯', province: '黑龙江', lng: 130.36 },
  { name: '大庆', province: '黑龙江', lng: 125.10 },
  { name: '绥化', province: '黑龙江', lng: 126.97 },

  // 江苏
  { name: '南京', province: '江苏', lng: 118.80 },
  { name: '苏州', province: '江苏', lng: 120.62 },
  { name: '无锡', province: '江苏', lng: 120.31 },
  { name: '常州', province: '江苏', lng: 119.97 },
  { name: '南通', province: '江苏', lng: 120.86 },
  { name: '徐州', province: '江苏', lng: 117.28 },
  { name: '扬州', province: '江苏', lng: 119.42 },
  { name: '镇江', province: '江苏', lng: 119.45 },
  { name: '盐城', province: '江苏', lng: 120.16 },
  { name: '淮安', province: '江苏', lng: 119.02 },
  { name: '泰州', province: '江苏', lng: 119.92 },
  { name: '连云港', province: '江苏', lng: 119.22 },
  { name: '宿迁', province: '江苏', lng: 118.28 },

  // 浙江
  { name: '杭州', province: '浙江', lng: 120.15 },
  { name: '宁波', province: '浙江', lng: 121.55 },
  { name: '温州', province: '浙江', lng: 120.70 },
  { name: '嘉兴', province: '浙江', lng: 120.76 },
  { name: '湖州', province: '浙江', lng: 120.09 },
  { name: '绍兴', province: '浙江', lng: 120.58 },
  { name: '金华', province: '浙江', lng: 119.65 },
  { name: '台州', province: '浙江', lng: 121.42 },
  { name: '丽水', province: '浙江', lng: 119.92 },
  { name: '衢州', province: '浙江', lng: 118.87 },
  { name: '舟山', province: '浙江', lng: 122.11 },

  // 安徽
  { name: '合肥', province: '安徽', lng: 117.28 },
  { name: '芜湖', province: '安徽', lng: 118.38 },
  { name: '蚌埠', province: '安徽', lng: 117.39 },
  { name: '马鞍山', province: '安徽', lng: 118.51 },
  { name: '安庆', province: '安徽', lng: 117.05 },
  { name: '阜阳', province: '安徽', lng: 115.81 },
  { name: '六安', province: '安徽', lng: 116.51 },
  { name: '黄山', province: '安徽', lng: 118.34 },

  // 福建
  { name: '福州', province: '福建', lng: 119.30 },
  { name: '厦门', province: '福建', lng: 118.09 },
  { name: '泉州', province: '福建', lng: 118.59 },
  { name: '漳州', province: '福建', lng: 117.65 },
  { name: '莆田', province: '福建', lng: 119.01 },
  { name: '龙岩', province: '福建', lng: 117.02 },
  { name: '三明', province: '福建', lng: 117.64 },
  { name: '南平', province: '福建', lng: 118.18 },
  { name: '宁德', province: '福建', lng: 119.53 },

  // 江西
  { name: '南昌', province: '江西', lng: 115.86 },
  { name: '景德镇', province: '江西', lng: 117.18 },
  { name: '九江', province: '江西', lng: 116.00 },
  { name: '赣州', province: '江西', lng: 114.93 },
  { name: '吉安', province: '江西', lng: 114.99 },
  { name: '宜春', province: '江西', lng: 114.39 },
  { name: '上饶', province: '江西', lng: 117.94 },
  { name: '抚州', province: '江西', lng: 116.36 },

  // 山东
  { name: '济南', province: '山东', lng: 117.00 },
  { name: '青岛', province: '山东', lng: 120.38 },
  { name: '烟台', province: '山东', lng: 121.45 },
  { name: '潍坊', province: '山东', lng: 119.16 },
  { name: '淄博', province: '山东', lng: 118.05 },
  { name: '临沂', province: '山东', lng: 118.36 },
  { name: '济宁', province: '山东', lng: 116.59 },
  { name: '泰安', province: '山东', lng: 117.09 },
  { name: '威海', province: '山东', lng: 122.12 },
  { name: '日照', province: '山东', lng: 119.53 },
  { name: '德州', province: '山东', lng: 116.36 },
  { name: '聊城', province: '山东', lng: 115.99 },
  { name: '菏泽', province: '山东', lng: 115.48 },
  { name: '滨州', province: '山东', lng: 117.97 },
  { name: '枣庄', province: '山东', lng: 117.32 },
  { name: '东营', province: '山东', lng: 118.67 },

  // 河南
  { name: '郑州', province: '河南', lng: 113.65 },
  { name: '洛阳', province: '河南', lng: 112.45 },
  { name: '开封', province: '河南', lng: 114.31 },
  { name: '南阳', province: '河南', lng: 112.53 },
  { name: '许昌', province: '河南', lng: 113.85 },
  { name: '新乡', province: '河南', lng: 113.88 },
  { name: '安阳', province: '河南', lng: 114.39 },
  { name: '焦作', province: '河南', lng: 113.24 },
  { name: '商丘', province: '河南', lng: 115.66 },
  { name: '信阳', province: '河南', lng: 114.07 },
  { name: '周口', province: '河南', lng: 114.65 },
  { name: '驻马店', province: '河南', lng: 114.02 },
  { name: '平顶山', province: '河南', lng: 113.19 },
  { name: '漯河', province: '河南', lng: 114.02 },
  { name: '濮阳', province: '河南', lng: 115.03 },
  { name: '三门峡', province: '河南', lng: 111.20 },
  { name: '鹤壁', province: '河南', lng: 114.30 },

  // 湖北
  { name: '武汉', province: '湖北', lng: 114.30 },
  { name: '宜昌', province: '湖北', lng: 111.29 },
  { name: '襄阳', province: '湖北', lng: 112.14 },
  { name: '荆州', province: '湖北', lng: 112.24 },
  { name: '黄石', province: '湖北', lng: 115.04 },
  { name: '十堰', province: '湖北', lng: 110.80 },
  { name: '孝感', province: '湖北', lng: 113.92 },
  { name: '荆门', province: '湖北', lng: 112.20 },
  { name: '咸宁', province: '湖北', lng: 114.32 },
  { name: '黄冈', province: '湖北', lng: 114.87 },
  { name: '恩施', province: '湖北', lng: 109.49 },

  // 湖南
  { name: '长沙', province: '湖南', lng: 112.97 },
  { name: '株洲', province: '湖南', lng: 113.13 },
  { name: '湘潭', province: '湖南', lng: 112.94 },
  { name: '衡阳', province: '湖南', lng: 112.57 },
  { name: '岳阳', province: '湖南', lng: 113.13 },
  { name: '常德', province: '湖南', lng: 111.69 },
  { name: '益阳', province: '湖南', lng: 112.36 },
  { name: '郴州', province: '湖南', lng: 113.01 },
  { name: '邵阳', province: '湖南', lng: 111.47 },
  { name: '永州', province: '湖南', lng: 111.61 },
  { name: '怀化', province: '湖南', lng: 109.97 },
  { name: '张家界', province: '湖南', lng: 110.48 },
  { name: '娄底', province: '湖南', lng: 111.99 },
  { name: '湘西', province: '湖南', lng: 109.74 },

  // 广东
  { name: '广州', province: '广东', lng: 113.26 },
  { name: '深圳', province: '广东', lng: 114.06 },
  { name: '东莞', province: '广东', lng: 113.75 },
  { name: '佛山', province: '广东', lng: 113.12 },
  { name: '珠海', province: '广东', lng: 113.58 },
  { name: '中山', province: '广东', lng: 113.38 },
  { name: '惠州', province: '广东', lng: 114.42 },
  { name: '汕头', province: '广东', lng: 116.68 },
  { name: '江门', province: '广东', lng: 113.08 },
  { name: '湛江', province: '广东', lng: 110.36 },
  { name: '茂名', province: '广东', lng: 110.92 },
  { name: '肇庆', province: '广东', lng: 112.47 },
  { name: '梅州', province: '广东', lng: 116.12 },
  { name: '潮州', province: '广东', lng: 116.62 },
  { name: '揭阳', province: '广东', lng: 116.37 },
  { name: '韶关', province: '广东', lng: 113.60 },
  { name: '清远', province: '广东', lng: 113.06 },
  { name: '阳江', province: '广东', lng: 111.98 },
  { name: '汕尾', province: '广东', lng: 115.37 },
  { name: '河源', province: '广东', lng: 114.70 },

  // 广西
  { name: '南宁', province: '广西', lng: 108.37 },
  { name: '柳州', province: '广西', lng: 109.43 },
  { name: '桂林', province: '广西', lng: 110.29 },
  { name: '梧州', province: '广西', lng: 111.28 },
  { name: '北海', province: '广西', lng: 109.12 },
  { name: '玉林', province: '广西', lng: 110.15 },
  { name: '百色', province: '广西', lng: 106.62 },
  { name: '贵港', province: '广西', lng: 109.60 },
  { name: '钦州', province: '广西', lng: 108.62 },
  { name: '河池', province: '广西', lng: 108.06 },

  // 海南
  { name: '海口', province: '海南', lng: 110.35 },
  { name: '三亚', province: '海南', lng: 109.51 },

  // 四川
  { name: '成都', province: '四川', lng: 104.07 },
  { name: '绵阳', province: '四川', lng: 104.73 },
  { name: '德阳', province: '四川', lng: 104.40 },
  { name: '宜宾', province: '四川', lng: 104.64 },
  { name: '南充', province: '四川', lng: 106.11 },
  { name: '泸州', province: '四川', lng: 105.44 },
  { name: '乐山', province: '四川', lng: 103.77 },
  { name: '自贡', province: '四川', lng: 104.77 },
  { name: '达州', province: '四川', lng: 107.47 },
  { name: '内江', province: '四川', lng: 105.06 },
  { name: '遂宁', province: '四川', lng: 105.59 },
  { name: '攀枝花', province: '四川', lng: 101.72 },
  { name: '眉山', province: '四川', lng: 103.85 },
  { name: '广安', province: '四川', lng: 106.63 },
  { name: '资阳', province: '四川', lng: 104.63 },
  { name: '雅安', province: '四川', lng: 103.00 },
  { name: '广元', province: '四川', lng: 105.84 },
  { name: '巴中', province: '四川', lng: 106.76 },

  // 贵州
  { name: '贵阳', province: '贵州', lng: 106.71 },
  { name: '遵义', province: '贵州', lng: 106.93 },
  { name: '六盘水', province: '贵州', lng: 104.83 },
  { name: '毕节', province: '贵州', lng: 105.29 },
  { name: '安顺', province: '贵州', lng: 105.95 },
  { name: '铜仁', province: '贵州', lng: 109.19 },
  { name: '凯里', province: '贵州', lng: 107.98 },
  { name: '都匀', province: '贵州', lng: 107.52 },
  { name: '兴义', province: '贵州', lng: 104.90 },

  // 云南
  { name: '昆明', province: '云南', lng: 102.83 },
  { name: '曲靖', province: '云南', lng: 103.80 },
  { name: '玉溪', province: '云南', lng: 102.55 },
  { name: '大理', province: '云南', lng: 100.23 },
  { name: '红河', province: '云南', lng: 103.38 },
  { name: '昭通', province: '云南', lng: 103.72 },
  { name: '丽江', province: '云南', lng: 100.23 },
  { name: '楚雄', province: '云南', lng: 101.55 },
  { name: '景洪', province: '云南', lng: 100.80 },
  { name: '普洱', province: '云南', lng: 100.97 },
  { name: '保山', province: '云南', lng: 99.17 },
  { name: '临沧', province: '云南', lng: 100.09 },

  // 西藏
  { name: '拉萨', province: '西藏', lng: 91.11 },
  { name: '日喀则', province: '西藏', lng: 88.88 },
  { name: '林芝', province: '西藏', lng: 94.36 },

  // 陕西
  { name: '西安', province: '陕西', lng: 108.94 },
  { name: '咸阳', province: '陕西', lng: 108.71 },
  { name: '宝鸡', province: '陕西', lng: 107.14 },
  { name: '渭南', province: '陕西', lng: 109.50 },
  { name: '汉中', province: '陕西', lng: 107.02 },
  { name: '延安', province: '陕西', lng: 109.49 },
  { name: '榆林', province: '陕西', lng: 109.73 },
  { name: '安康', province: '陕西', lng: 109.03 },
  { name: '商洛', province: '陕西', lng: 109.94 },
  { name: '铜川', province: '陕西', lng: 108.95 },

  // 甘肃
  { name: '兰州', province: '甘肃', lng: 103.83 },
  { name: '天水', province: '甘肃', lng: 105.72 },
  { name: '白银', province: '甘肃', lng: 104.17 },
  { name: '庆阳', province: '甘肃', lng: 107.64 },
  { name: '平凉', province: '甘肃', lng: 106.67 },
  { name: '酒泉', province: '甘肃', lng: 98.51 },
  { name: '张掖', province: '甘肃', lng: 100.45 },
  { name: '武威', province: '甘肃', lng: 102.64 },
  { name: '嘉峪关', province: '甘肃', lng: 98.29 },

  // 青海
  { name: '西宁', province: '青海', lng: 101.77 },
  { name: '海东', province: '青海', lng: 102.10 },
  { name: '格尔木', province: '青海', lng: 94.90 },

  // 宁夏
  { name: '银川', province: '宁夏', lng: 106.23 },
  { name: '石嘴山', province: '宁夏', lng: 106.38 },
  { name: '吴忠', province: '宁夏', lng: 106.20 },
  { name: '固原', province: '宁夏', lng: 106.24 },
  { name: '中卫', province: '宁夏', lng: 105.19 },

  // 新疆
  { name: '乌鲁木齐', province: '新疆', lng: 87.62 },
  { name: '克拉玛依', province: '新疆', lng: 84.87 },
  { name: '喀什', province: '新疆', lng: 75.99 },
  { name: '伊宁', province: '新疆', lng: 81.33 },
  { name: '库尔勒', province: '新疆', lng: 86.15 },
  { name: '阿克苏', province: '新疆', lng: 80.26 },
  { name: '哈密', province: '新疆', lng: 93.51 },
  { name: '吐鲁番', province: '新疆', lng: 89.19 },
  { name: '和田', province: '新疆', lng: 79.91 },
  { name: '塔城', province: '新疆', lng: 82.99 },
  { name: '阿勒泰', province: '新疆', lng: 88.14 },

  // 港澳台
  { name: '香港', province: '香港', lng: 114.17 },
  { name: '澳门', province: '澳门', lng: 113.54 },
  { name: '台北', province: '台湾', lng: 121.56 },
  { name: '高雄', province: '台湾', lng: 120.31 },
  { name: '台中', province: '台湾', lng: 120.68 },
  { name: '台南', province: '台湾', lng: 120.21 },

  // ===== 海外城市 =====
  // stdMeridian = timezone standard meridian in degrees (e.g. UTC-8 PST → -120)
  // en = English name for search

  // 日本 (UTC+9, stdMeridian=135)
  { name: '东京', province: '日本', lng: 139.69, stdMeridian: 135, en: 'Tokyo' },
  { name: '大阪', province: '日本', lng: 135.50, stdMeridian: 135, en: 'Osaka' },
  { name: '京都', province: '日本', lng: 135.77, stdMeridian: 135, en: 'Kyoto' },
  { name: '名古屋', province: '日本', lng: 136.91, stdMeridian: 135, en: 'Nagoya' },
  { name: '福冈', province: '日本', lng: 130.42, stdMeridian: 135, en: 'Fukuoka' },
  { name: '札幌', province: '日本', lng: 141.35, stdMeridian: 135, en: 'Sapporo' },
  { name: '横滨', province: '日本', lng: 139.64, stdMeridian: 135, en: 'Yokohama' },

  // 韩国 (UTC+9, stdMeridian=135)
  { name: '首尔', province: '韩国', lng: 126.98, stdMeridian: 135, en: 'Seoul' },
  { name: '釜山', province: '韩国', lng: 129.04, stdMeridian: 135, en: 'Busan' },
  { name: '仁川', province: '韩国', lng: 126.71, stdMeridian: 135, en: 'Incheon' },

  // 东南亚
  { name: '新加坡', province: '新加坡', lng: 103.82, stdMeridian: 120, en: 'Singapore' },
  { name: '吉隆坡', province: '马来西亚', lng: 101.69, stdMeridian: 120, en: 'Kuala Lumpur' },
  { name: '槟城', province: '马来西亚', lng: 100.33, stdMeridian: 120, en: 'Penang' },
  { name: '曼谷', province: '泰国', lng: 100.50, stdMeridian: 105, en: 'Bangkok' },
  { name: '清迈', province: '泰国', lng: 98.98, stdMeridian: 105, en: 'Chiang Mai' },
  { name: '河内', province: '越南', lng: 105.85, stdMeridian: 105, en: 'Hanoi' },
  { name: '胡志明市', province: '越南', lng: 106.63, stdMeridian: 105, en: 'Ho Chi Minh City' },
  { name: '马尼拉', province: '菲律宾', lng: 120.98, stdMeridian: 120, en: 'Manila' },
  { name: '雅加达', province: '印尼', lng: 106.85, stdMeridian: 105, en: 'Jakarta' },

  // 南亚
  { name: '新德里', province: '印度', lng: 77.21, stdMeridian: 82.5, en: 'New Delhi' },
  { name: '孟买', province: '印度', lng: 72.88, stdMeridian: 82.5, en: 'Mumbai' },

  // 澳大利亚
  { name: '悉尼', province: '澳大利亚', lng: 151.21, stdMeridian: 150, en: 'Sydney' },
  { name: '墨尔本', province: '澳大利亚', lng: 144.96, stdMeridian: 150, en: 'Melbourne' },
  { name: '布里斯班', province: '澳大利亚', lng: 153.03, stdMeridian: 150, en: 'Brisbane' },
  { name: '珀斯', province: '澳大利亚', lng: 115.86, stdMeridian: 120, en: 'Perth' },

  // 新西兰 (UTC+12, stdMeridian=180)
  { name: '奥克兰', province: '新西兰', lng: 174.76, stdMeridian: 180, en: 'Auckland' },
  { name: '惠灵顿', province: '新西兰', lng: 174.78, stdMeridian: 180, en: 'Wellington' },

  // 美国东部 (UTC-5 EST, stdMeridian=-75)
  { name: '纽约', province: '美国东部', lng: -74.01, stdMeridian: -75, en: 'New York' },
  { name: '华盛顿', province: '美国东部', lng: -77.04, stdMeridian: -75, en: 'Washington DC' },
  { name: '波士顿', province: '美国东部', lng: -71.06, stdMeridian: -75, en: 'Boston' },
  { name: '费城', province: '美国东部', lng: -75.17, stdMeridian: -75, en: 'Philadelphia' },
  { name: '迈阿密', province: '美国东部', lng: -80.19, stdMeridian: -75, en: 'Miami' },
  { name: '亚特兰大', province: '美国东部', lng: -84.39, stdMeridian: -75, en: 'Atlanta' },
  { name: '夏洛特', province: '美国东部', lng: -80.84, stdMeridian: -75, en: 'Charlotte' },
  { name: '底特律', province: '美国东部', lng: -83.05, stdMeridian: -75, en: 'Detroit' },
  { name: '匹兹堡', province: '美国东部', lng: -79.99, stdMeridian: -75, en: 'Pittsburgh' },
  { name: '奥兰多', province: '美国东部', lng: -81.38, stdMeridian: -75, en: 'Orlando' },

  // 美国中部 (UTC-6 CST, stdMeridian=-90)
  { name: '芝加哥', province: '美国中部', lng: -87.63, stdMeridian: -90, en: 'Chicago' },
  { name: '休斯顿', province: '美国中部', lng: -95.37, stdMeridian: -90, en: 'Houston' },
  { name: '达拉斯', province: '美国中部', lng: -96.80, stdMeridian: -90, en: 'Dallas' },
  { name: '奥斯汀', province: '美国中部', lng: -97.74, stdMeridian: -90, en: 'Austin' },
  { name: '圣安东尼奥', province: '美国中部', lng: -98.49, stdMeridian: -90, en: 'San Antonio' },
  { name: '明尼阿波利斯', province: '美国中部', lng: -93.27, stdMeridian: -90, en: 'Minneapolis' },
  { name: '堪萨斯城', province: '美国中部', lng: -94.58, stdMeridian: -90, en: 'Kansas City' },
  { name: '新奥尔良', province: '美国中部', lng: -90.07, stdMeridian: -90, en: 'New Orleans' },
  { name: '纳什维尔', province: '美国中部', lng: -86.78, stdMeridian: -90, en: 'Nashville' },

  // 美国山地 (UTC-7 MST, stdMeridian=-105)
  { name: '丹佛', province: '美国山地', lng: -104.99, stdMeridian: -105, en: 'Denver' },
  { name: '菲尼克斯', province: '美国山地', lng: -112.07, stdMeridian: -105, en: 'Phoenix' },
  { name: '盐湖城', province: '美国山地', lng: -111.89, stdMeridian: -105, en: 'Salt Lake City' },
  { name: '阿尔伯克基', province: '美国山地', lng: -106.65, stdMeridian: -105, en: 'Albuquerque' },
  { name: '拉斯维加斯', province: '美国山地', lng: -115.14, stdMeridian: -105, en: 'Las Vegas' },

  // 美国西部 (UTC-8 PST, stdMeridian=-120)
  { name: '洛杉矶', province: '美国西部', lng: -118.24, stdMeridian: -120, en: 'Los Angeles' },
  { name: '旧金山', province: '美国西部', lng: -122.42, stdMeridian: -120, en: 'San Francisco' },
  { name: '西雅图', province: '美国西部', lng: -122.33, stdMeridian: -120, en: 'Seattle' },
  { name: '圣地亚哥', province: '美国西部', lng: -117.16, stdMeridian: -120, en: 'San Diego' },
  { name: '波特兰', province: '美国西部', lng: -122.68, stdMeridian: -120, en: 'Portland' },
  { name: '圣何塞', province: '美国西部', lng: -121.89, stdMeridian: -120, en: 'San Jose' },
  { name: '萨克拉门托', province: '美国西部', lng: -121.49, stdMeridian: -120, en: 'Sacramento' },

  // 美国其他
  { name: '檀香山', province: '美国夏威夷', lng: -157.86, stdMeridian: -150, en: 'Honolulu' },
  { name: '安克雷奇', province: '美国阿拉斯加', lng: -149.90, stdMeridian: -135, en: 'Anchorage' },

  // 加拿大
  { name: '多伦多', province: '加拿大', lng: -79.38, stdMeridian: -75, en: 'Toronto' },
  { name: '温哥华', province: '加拿大', lng: -123.12, stdMeridian: -120, en: 'Vancouver' },
  { name: '蒙特利尔', province: '加拿大', lng: -73.57, stdMeridian: -75, en: 'Montreal' },
  { name: '卡尔加里', province: '加拿大', lng: -114.07, stdMeridian: -105, en: 'Calgary' },
  { name: '渥太华', province: '加拿大', lng: -75.70, stdMeridian: -75, en: 'Ottawa' },
  { name: '埃德蒙顿', province: '加拿大', lng: -113.49, stdMeridian: -105, en: 'Edmonton' },

  // 英国 (UTC+0, stdMeridian=0)
  { name: '伦敦', province: '英国', lng: -0.13, stdMeridian: 0, en: 'London' },
  { name: '曼彻斯特', province: '英国', lng: -2.24, stdMeridian: 0, en: 'Manchester' },
  { name: '伯明翰', province: '英国', lng: -1.90, stdMeridian: 0, en: 'Birmingham' },
  { name: '爱丁堡', province: '英国', lng: -3.19, stdMeridian: 0, en: 'Edinburgh' },

  // 欧洲 (UTC+1 CET, stdMeridian=15)
  { name: '巴黎', province: '法国', lng: 2.35, stdMeridian: 15, en: 'Paris' },
  { name: '柏林', province: '德国', lng: 13.41, stdMeridian: 15, en: 'Berlin' },
  { name: '慕尼黑', province: '德国', lng: 11.58, stdMeridian: 15, en: 'Munich' },
  { name: '法兰克福', province: '德国', lng: 8.68, stdMeridian: 15, en: 'Frankfurt' },
  { name: '阿姆斯特丹', province: '荷兰', lng: 4.90, stdMeridian: 15, en: 'Amsterdam' },
  { name: '罗马', province: '意大利', lng: 12.50, stdMeridian: 15, en: 'Rome' },
  { name: '米兰', province: '意大利', lng: 9.19, stdMeridian: 15, en: 'Milan' },
  { name: '马德里', province: '西班牙', lng: -3.70, stdMeridian: 15, en: 'Madrid' },
  { name: '巴塞罗那', province: '西班牙', lng: 2.17, stdMeridian: 15, en: 'Barcelona' },
  { name: '维也纳', province: '奥地利', lng: 16.37, stdMeridian: 15, en: 'Vienna' },
  { name: '布拉格', province: '捷克', lng: 14.42, stdMeridian: 15, en: 'Prague' },
  { name: '苏黎世', province: '瑞士', lng: 8.54, stdMeridian: 15, en: 'Zurich' },

  // 东欧 (UTC+2 EET, stdMeridian=30)
  { name: '莫斯科', province: '俄罗斯', lng: 37.62, stdMeridian: 45, en: 'Moscow' },
  { name: '圣彼得堡', province: '俄罗斯', lng: 30.32, stdMeridian: 45, en: 'Saint Petersburg' },
  { name: '伊斯坦布尔', province: '土耳其', lng: 28.98, stdMeridian: 45, en: 'Istanbul' },
  { name: '迪拜', province: '阿联酋', lng: 55.27, stdMeridian: 60, en: 'Dubai' },

  // 中东
  { name: '耶路撒冷', province: '以色列', lng: 35.21, stdMeridian: 30, en: 'Jerusalem' },

  // 南美
  { name: '圣保罗', province: '巴西', lng: -46.63, stdMeridian: -45, en: 'São Paulo' },
  { name: '布宜诺斯艾利斯', province: '阿根廷', lng: -58.38, stdMeridian: -45, en: 'Buenos Aires' },
  { name: '利马', province: '秘鲁', lng: -77.04, stdMeridian: -75, en: 'Lima' },

  // 非洲
  { name: '开罗', province: '埃及', lng: 31.24, stdMeridian: 30, en: 'Cairo' },
  { name: '约翰内斯堡', province: '南非', lng: 28.05, stdMeridian: 30, en: 'Johannesburg' },
].sort((a, b) => a.province.localeCompare(b.province, 'zh') || a.name.localeCompare(b.name, 'zh'));

/**
 * Search cities by name or province. Returns top 10 matches.
 */
export function searchCities(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const results = CHINA_CITIES.filter(c =>
    c.name.includes(q) || c.province.includes(q) || (c.en && c.en.toLowerCase().includes(q))
  );
  // Prioritize exact name match, then name starts-with, then province match
  results.sort((a, b) => {
    const aExact = (a.name === q || (a.en && a.en.toLowerCase() === q)) ? 0 : 1;
    const bExact = (b.name === q || (b.en && b.en.toLowerCase() === q)) ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aStart = (a.name.startsWith(q) || (a.en && a.en.toLowerCase().startsWith(q))) ? 0 : 1;
    const bStart = (b.name.startsWith(q) || (b.en && b.en.toLowerCase().startsWith(q))) ? 0 : 1;
    return aStart - bStart;
  });
  return results.slice(0, 10);
}

/**
 * Calculate true solar time offset in minutes.
 * Positive = local solar time is AHEAD of standard time (east of 120E)
 * Negative = local solar time is BEHIND standard time (west of 120E)
 *
 * For China (UTC+8, standard meridian 120°E):
 *   Chengdu (104°E): (120 - 104) * 4 = 64 minutes → subtract 64 min
 *   Harbin (126.65°E): (120 - 126.65) * 4 = -26.6 min → add ~27 min
 *
 * @param {number} longitude - City longitude in degrees
 * @param {number} [standardMeridian=120] - Standard meridian for timezone
 * @returns {number} Offset in minutes to SUBTRACT from clock time
 */
export function calcTrueSolarTimeOffset(longitude, standardMeridian = 120) {
  return Math.round((standardMeridian - longitude) * 4);
}

/**
 * Adjust birth time by applying true solar time offset.
 * Handles day/month/year boundary crossing.
 *
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} day (1-31)
 * @param {number} hour (0-23)
 * @param {number} minute (0-59)
 * @param {number} offsetMinutes - Minutes to SUBTRACT (positive = west of 120E)
 * @returns {{ year, month, day, hour, minute }}
 */
export function adjustBirthTime(year, month, day, hour, minute, offsetMinutes) {
  // Create a Date in UTC to do the math (avoids local timezone issues)
  const d = new Date(Date.UTC(year, month - 1, day, hour, minute));
  // Subtract the offset (west of 120E = positive offset = solar time is earlier)
  d.setUTCMinutes(d.getUTCMinutes() - offsetMinutes);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

/**
 * Format offset for display. E.g. "-64分" or "+27分"
 */
export function formatOffset(offsetMinutes) {
  if (offsetMinutes === 0) return '±0分';
  const sign = offsetMinutes > 0 ? '-' : '+';
  return `${sign}${Math.abs(offsetMinutes)}分`;
}

/**
 * Format adjusted time for display. E.g. "真太阳时 10:56 (校正 -64分)"
 */
export function formatTrueSolarTime(adjusted, offsetMinutes) {
  const hh = String(adjusted.hour).padStart(2, '0');
  const mm = String(adjusted.minute).padStart(2, '0');
  return `真太阳时 ${hh}:${mm} (校正 ${formatOffset(offsetMinutes)})`;
}

// Branch to midpoint hour mapping (for Ziwei which uses branch strings)
const BRANCH_HOURS = {
  '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
  '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22,
};
const HOUR_TO_BRANCH = ['子','子','丑','丑','寅','寅','卯','卯','辰','辰','巳','巳',
  '午','午','未','未','申','申','酉','酉','戌','戌','亥','亥'];

/**
 * Adjust a branch-based hour for true solar time.
 * Converts branch → midpoint hour → adjust → convert back to branch.
 * Also returns the full adjusted date in case of day boundary crossing.
 *
 * @param {number} year, month, day
 * @param {string} branch - e.g. '辰'
 * @param {number} offsetMinutes
 * @returns {{ branch: string, year: number, month: number, day: number }}
 */
export function adjustHourBranch(year, month, day, branch, offsetMinutes) {
  const hour = BRANCH_HOURS[branch] ?? 8;
  const adjusted = adjustBirthTime(year, month, day, hour, 0, offsetMinutes);
  // Handle 子时 wrapping: hour 23 maps to 子
  const adjBranch = adjusted.hour === 23 ? '子' : HOUR_TO_BRANCH[adjusted.hour];
  return {
    branch: adjBranch,
    year: adjusted.year,
    month: adjusted.month,
    day: adjusted.day,
  };
}
