(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // node_modules/tao_name/dist/sexagenaryCycle/celestialStems.js
  var require_celestialStems = __commonJS({
    "node_modules/tao_name/dist/sexagenaryCycle/celestialStems.js"(exports, module) {
      var obj = {
        /**
         * 天干
         */
        CELESTIAL_STEMS_ARR: ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"],
        CELESTIAL_STEMS: {
          /** 英文写法 */
          METH: "\u7532",
          ETH: "\u4E59",
          PROP: "\u4E19",
          BUT: "\u4E01",
          PENT: "\u620A",
          HEX: "\u5DF1",
          HEPT: "\u5E9A",
          OCT: "\u8F9B",
          NON: "\u58EC",
          DEC: "\u7678",
          /** 拼音写法 */
          JIA: "\u7532",
          YI: "\u4E59",
          BING: "\u4E19",
          DING: "\u4E01",
          WU: "\u620A",
          JI: "\u5DF1",
          GENG: "\u5E9A",
          XIN: "\u8F9B",
          REN: "\u58EC",
          GUI: "\u7678"
        }
      };
      obj.CS_ARR = obj.CELESTIAL_STEMS_ARR;
      obj.CS = obj.CELESTIAL_STEMS;
      module.exports = obj;
    }
  });

  // node_modules/tao_name/dist/sexagenaryCycle/terrestrialBranches.js
  var require_terrestrialBranches = __commonJS({
    "node_modules/tao_name/dist/sexagenaryCycle/terrestrialBranches.js"(exports, module) {
      var obj = {
        /**
         * 地支
         */
        TERRESTRIAL_BRANCHES_ARR: ["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"],
        TERRESTRIAL_BRANCHES: {
          /** 英文写法 */
          Jan: "\u5B50",
          Feb: "\u4E11",
          Mar: "\u5BC5",
          Apr: "\u536F",
          May: "\u8FB0",
          Jun: "\u5DF3",
          Jul: "\u5348",
          Aug: "\u672A",
          Sep: "\u7533",
          Oct: "\u9149",
          Nov: "\u620C",
          Dec: "\u4EA5",
          /** 拼音写法 */
          zi: "\u5B50",
          chou: "\u4E11",
          yin: "\u5BC5",
          mao: "\u536F",
          chen: "\u8FB0",
          si: "\u5DF3",
          wu: "\u5348",
          wei: "\u672A",
          shen: "\u7533",
          you: "\u9149",
          xu: "\u620C",
          hai: "\u4EA5"
        }
      };
      obj.TB = obj.TERRESTRIAL_BRANCHES;
      obj.TB_ARR = obj.TERRESTRIAL_BRANCHES_ARR;
      module.exports = obj;
    }
  });

  // node_modules/tao_name/dist/sexagenaryCycle/sexagenaryCycle.js
  var require_sexagenaryCycle = __commonJS({
    "node_modules/tao_name/dist/sexagenaryCycle/sexagenaryCycle.js"(exports, module) {
      var obj = {
        /**
         * 六十天干地支
         */
        SEXAGENARY_CYCLE_ARR: ["\u7532\u5B50", "\u4E59\u4E11", "\u4E19\u5BC5", "\u4E01\u536F", "\u620A\u8FB0", "\u5DF1\u5DF3", "\u5E9A\u5348", "\u8F9B\u672A", "\u58EC\u7533", "\u7678\u9149", "\u7532\u620C", "\u4E59\u4EA5", "\u4E19\u5B50", "\u4E01\u4E11", "\u620A\u5BC5", "\u5DF1\u536F", "\u5E9A\u8FB0", "\u8F9B\u5DF3", "\u58EC\u5348", "\u7678\u672A", "\u7532\u7533", "\u4E59\u9149", "\u4E19\u620C", "\u4E01\u4EA5", "\u620A\u5B50", "\u5DF1\u4E11", "\u5E9A\u5BC5", "\u8F9B\u536F", "\u58EC\u8FB0", "\u7678\u5DF3", "\u7532\u5348", "\u4E59\u672A", "\u4E19\u7533", "\u4E01\u9149", "\u620A\u620C", "\u5DF1\u4EA5", "\u5E9A\u5B50", "\u8F9B\u4E11", "\u58EC\u5BC5", "\u7678\u536F", "\u7532\u8FB0", "\u4E59\u5DF3", "\u4E19\u5348", "\u4E01\u672A", "\u620A\u7533", "\u5DF1\u9149", "\u5E9A\u620C", "\u8F9B\u4EA5", "\u58EC\u5B50", "\u7678\u4E11", "\u7532\u5BC5", "\u4E59\u536F", "\u4E19\u8FB0", "\u4E01\u5DF3", "\u620A\u5348", "\u5DF1\u672A", "\u5E9A\u7533", "\u8F9B\u9149", "\u58EC\u620C", "\u7678\u4EA5"],
        SEXAGENARY_CYCLE: {
          /** 英文写法 */
          MATH_Jan: "\u7532\u5B50",
          ETH_Feb: "\u4E59\u4E11",
          PROP_Mar: "\u4E19\u5BC5",
          BUT_Apr: "\u4E01\u536F",
          PENT_May: "\u620A\u8FB0",
          HEX_Jun: "\u5DF1\u5DF3",
          HEPT_Jul: "\u5E9A\u5348",
          OCT_Aug: "\u8F9B\u672A",
          NON_Sep: "\u58EC\u7533",
          DEC_Oct: "\u7678\u9149",
          MATH_Nov: "\u7532\u620C",
          ETH_Dec: "\u4E59\u4EA5",
          PROP_Jan: "\u4E19\u5B50",
          BUT_Feb: "\u4E01\u4E11",
          PENT_Mar: "\u620A\u5BC5",
          HEX_Apr: "\u5DF1\u536F",
          HEPT_May: "\u5E9A\u8FB0",
          OCT_Jun: "\u8F9B\u5DF3",
          NON_Jul: "\u58EC\u5348",
          DEC_Aug: "\u7678\u672A",
          METH_Sep: "\u7532\u7533",
          ETH_Oct: "\u4E59\u9149",
          PROP_Nov: "\u4E19\u620C",
          BUT_Dec: "\u4E01\u4EA5",
          PENT_Jan: "\u620A\u5B50",
          HEX_Feb: "\u5DF1\u4E11",
          HEPT_Mar: "\u5E9A\u5BC5",
          OCT_Apr: "\u8F9B\u536F",
          NON_May: "\u58EC\u8FB0",
          DEC_Jun: "\u7678\u5DF3",
          METH_Jul: "\u7532\u5348",
          ETH_Aug: "\u4E59\u672A",
          PROP_Sep: "\u4E19\u7533",
          BUT_Oct: "\u4E01\u9149",
          PENT_Nov: "\u620A\u620C",
          HEX_Dec: "\u5DF1\u4EA5",
          HEPT_Jan: "\u5E9A\u5B50",
          OCT_Feb: "\u8F9B\u4E11",
          NON_Mar: "\u58EC\u5BC5",
          DEC_Apr: "\u7678\u536F",
          METH_May: "\u7532\u8FB0",
          ETH_Jun: "\u4E59\u5DF3",
          PROP_Jul: "\u4E19\u5348",
          BUT_Aug: "\u4E01\u672A",
          PENT_Sep: "\u620A\u7533",
          HEX_Oct: "\u5DF1\u9149",
          HEPT_Nov: "\u5E9A\u620C",
          OCT_Dec: "\u8F9B\u4EA5",
          NON_Jan: "\u58EC\u5B50",
          DEC_Feb: "\u7678\u4E11",
          METH_Mar: "\u7532\u5BC5",
          ETH_Apr: "\u4E59\u536F",
          PROP_May: "\u4E19\u8FB0",
          BUT_Jun: "\u4E01\u5DF3",
          PENT_Jul: "\u620A\u5348",
          HEX_Aug: "\u5DF1\u672A",
          HEPT_Sep: "\u5E9A\u7533",
          OCT_Oct: "\u8F9B\u9149",
          NON_Nov: "\u58EC\u620C",
          DEC_Dec: "\u7678\u4EA5",
          /** 拼音写法 */
          JIA_zi: "\u7532\u5B50",
          YI_chou: "\u4E59\u4E11",
          BING_yin: "\u4E19\u5BC5",
          DING_mao: "\u4E01\u536F",
          WU_chen: "\u620A\u8FB0",
          JI_si: "\u5DF1\u5DF3",
          GENG_wx: "\u5E9A\u5348",
          XIN_wei: "\u8F9B\u672A",
          REN_shen: "\u58EC\u7533",
          GUI_you: "\u7678\u9149",
          JIA_xu: "\u7532\u620C",
          YI_hai: "\u4E59\u4EA5",
          BING_zi: "\u4E19\u5B50",
          DING_chou: "\u4E01\u4E11",
          WU_yin: "\u620A\u5BC5",
          JI_mao: "\u5DF1\u536F",
          GENG_chen: "\u5E9A\u8FB0",
          XIN_si: "\u8F9B\u5DF3",
          REN_wu: "\u58EC\u5348",
          GUI_wei: "\u7678\u672A",
          JIA_shen: "\u7532\u7533",
          YI_you: "\u4E59\u9149",
          BING_xu: "\u4E19\u620C",
          DING_hai: "\u4E01\u4EA5",
          WU_zi: "\u620A\u5B50",
          JI_chou: "\u5DF1\u4E11",
          GENG_yin: "\u5E9A\u5BC5",
          XIN_mao: "\u8F9B\u536F",
          REN_chen: "\u58EC\u8FB0",
          GUI_si: "\u7678\u5DF3",
          JIA_wu: "\u7532\u5348",
          YI_wei: "\u4E59\u672A",
          BING_shen: "\u4E19\u7533",
          DING_you: "\u4E01\u9149",
          WU_xu: "\u620A\u620C",
          JI_hai: "\u5DF1\u4EA5",
          GENG_zi: "\u5E9A\u5B50",
          XIN_chou: "\u8F9B\u4E11",
          REN_yin: "\u58EC\u5BC5",
          GUI_mao: "\u7678\u536F",
          JIA_chen: "\u7532\u8FB0",
          YI_si: "\u4E59\u5DF3",
          BING_wu: "\u4E19\u5348",
          DING_wei: "\u4E01\u672A",
          WU_shen: "\u620A\u7533",
          JI_you: "\u5DF1\u9149",
          GENG_xu: "\u5E9A\u620C",
          XIN_hai: "\u8F9B\u4EA5",
          REN_zi: "\u58EC\u5B50",
          GUI_chou: "\u7678\u4E11",
          JIA_yin: "\u7532\u5BC5",
          YI_mao: "\u4E59\u536F",
          BING_chen: "\u4E19\u8FB0",
          DING_si: "\u4E01\u5DF3",
          WU_wu: "\u620A\u5348",
          JI_wei: "\u5DF1\u672A",
          GENG_shen: "\u5E9A\u7533",
          XIN_you: "\u8F9B\u9149",
          REN_xu: "\u58EC\u620C",
          GUI_hai: "\u7678\u4EA5"
        }
      };
      obj.SC_ARR = obj.SEXAGENARY_CYCLE_ARR;
      obj.SC = obj.SEXAGENARY_CYCLE;
      module.exports = obj;
    }
  });

  // node_modules/tao_name/dist/sexagenaryCycle/index.js
  var require_sexagenaryCycle2 = __commonJS({
    "node_modules/tao_name/dist/sexagenaryCycle/index.js"(exports, module) {
      var celestialStems = require_celestialStems();
      var terrestrialBranches = require_terrestrialBranches();
      var sexagenaryCycle = require_sexagenaryCycle();
      module.exports = Object.assign({}, celestialStems, terrestrialBranches, sexagenaryCycle);
    }
  });

  // node_modules/tao_name/dist/trigrams/acquired.js
  var require_acquired = __commonJS({
    "node_modules/tao_name/dist/trigrams/acquired.js"(exports, module) {
      module.exports = {
        /**
         * 后天八卦：
         */
        ACQUIRED_ARR: ["\u574E", "\u5764", "\u9707", "\u5DFD", "\u4E2D", "\u4E7E", "\u5151", "\u826E", "\u79BB"],
        ACQUIRED: {
          /** 英文 */
          KAN: "\u574E",
          EARTH: "\u5764",
          SHAKE: "\u9707",
          XUN: "\u5DFD",
          MID: "\u4E2D",
          HEAVEN: "\u4E7E",
          DUI: "\u5151",
          GEN: "\u826E",
          LEAVE: "\u79BB",
          /** 中文补充 */
          KUN: "\u5764",
          ZHEN: "\u9707",
          ZHONG: "\u4E2D",
          QIAN: "\u4E7E",
          LI: "\u79BB"
        }
      };
    }
  });

  // node_modules/tao_name/dist/trigrams/apriori.js
  var require_apriori = __commonJS({
    "node_modules/tao_name/dist/trigrams/apriori.js"(exports, module) {
      module.exports = {
        /**
         * 先天八卦
         */
        APRIORI_ARR: ["\u4E7E", "\u5151", "\u79BB", "\u9707", "\u5DFD", "\u574E", "\u826E", "\u5764"],
        APRIORI: {
          HEAVEN: "\u4E7E",
          DUI: "\u5151",
          LEAVE: "\u79BB",
          SHAKE: "\u9707",
          XUN: "\u5DFD",
          KAN: "\u574E",
          GEN: "\u826E",
          EARTH: "\u5764",
          /** 中文补充 */
          kUN: "\u5764",
          ZHEN: "\u9707",
          ZHONG: "\u4E2D",
          QIAN: "\u4E7E",
          LI: "\u79BB"
        }
      };
    }
  });

  // node_modules/tao_name/dist/trigrams/index.js
  var require_trigrams = __commonJS({
    "node_modules/tao_name/dist/trigrams/index.js"(exports, module) {
      var acquired = require_acquired();
      var apriori = require_apriori();
      module.exports = Object.assign({
        /**
         * 数字
         */
        num: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"]
      }, acquired, apriori);
    }
  });

  // node_modules/tao_name/dist/logos/index.js
  var require_logos = __commonJS({
    "node_modules/tao_name/dist/logos/index.js"(exports, module) {
      module.exports = {
        LOGOS_ARR: ["\u9634", "\u9633"],
        LOGOS: {
          YIN: "\u9634",
          YANG: "\u9633"
        }
      };
    }
  });

  // node_modules/tao_name/dist/phases/relation.js
  var require_relation = __commonJS({
    "node_modules/tao_name/dist/phases/relation.js"(exports, module) {
      module.exports = {
        // 旺相休囚死
        VIGOROUS: 0,
        SECOND: 1,
        REST: 2,
        IMPRISON: 3,
        DEATH: 4,
        // 旺相休囚死
        WANG: 0,
        XIANG: 1,
        XIU: 2,
        QIU: 3,
        SI: 4,
        // 生被生被克克
        SHENG: 1,
        XIE: 2,
        HAO: 3,
        KE: 4,
        // 生被生被克克
        S: 1,
        X: 2,
        H: 3,
        K: 4,
        // 生被生被克克
        PROMOTION: 1,
        PROMOTED: 2,
        RESTRAINED: 3,
        RESTRAINT: 4
      };
    }
  });

  // node_modules/tao_name/dist/phases/cycle.js
  var require_cycle = __commonJS({
    "node_modules/tao_name/dist/phases/cycle.js"(exports, module) {
      module.exports = {
        CYCLE: ["\u957F\u751F", "\u6C90\u6D74", "\u51A0\u5E26", "\u4E34\u5B98", "\u5E1D\u65FA", "\u8870", "\u75C5", "\u6B7B", "\u5893", "\u7EDD", "\u80CE", "\u517B"]
        // TODO
      };
    }
  });

  // node_modules/tao_name/dist/phases/index.js
  var require_phases = __commonJS({
    "node_modules/tao_name/dist/phases/index.js"(exports, module) {
      var RELATION = require_relation();
      var CYCLE = require_cycle();
      module.exports = Object.assign({
        PHASES_ARR: ["\u6C34", "\u706B", "\u6728", "\u91D1", "\u571F"],
        PHASES: {
          /** 英文 */
          WATER: "\u6C34",
          FIRE: "\u706B",
          WOOD: "\u6728",
          METAL: "\u91D1",
          EARTH: "\u571F",
          /** 拼音 */
          SHUI: "\u6C34",
          HUO: "\u706B",
          MU: "\u6728",
          JIN: "\u91D1",
          TU: "\u571F"
        },
        RELATION,
        CYCLE
      });
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/ceremony.js
  var require_ceremony = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/ceremony.js"(exports, module) {
      module.exports = {
        /**
         * 六仪：
         * 为十天干中的戌、己、庚、辛、壬、癸。
         * 对应为六只仪仗队，六甲将分别隐喻六仪之中
         */
        CEREMONY_ARR: ["\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"],
        CEREMONY: {
          PENT: "\u620A",
          HEX: "\u5DF1",
          HEPT: "\u5E9A",
          OCT: "\u8F9B",
          NON: "\u58EC",
          DEC: "\u7678",
          /** 中文 */
          WU: "\u620A",
          JI: "\u5DF1",
          GENG: "\u5E9A",
          XIN: "\u8F9B",
          REN: "\u58EC",
          GUI: "\u7678"
        }
      };
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/star.js
  var require_star = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/star.js"(exports, module) {
      module.exports = {
        /**
         * 九星：九星源于古代天文中北斗七星，加上左辅星与右弼星一共九个星宿。
         * 北斗九星，七现二隐
         * 天枢/贪狼/天蓬（北斗一：Dubhe）
         * 天璇/巨门/天芮（北斗二：Merak）
         * 天玑/禄存/天冲（北斗三：Phecda）
         * 天权/文曲/天辅（北斗四：Megrez）
         * 玉衡/廉贞/天禽（北斗五：Alioth）
         * 开阳/武曲/天心（北斗六：Mizar）
         * 摇光/破军/天柱（北斗七：Alkaid）
         * 洞明/左辅/天任 (辅增一：MUA83,IQ)
         * 隐元/右弼/天英 (相星：5 CVn)
         */
        STAR_ARR: ["\u5929\u84EC\u661F", "\u5929\u82AE\u661F", "\u5929\u51B2\u661F", "\u5929\u8F85\u661F", "\u5929\u79BD\u661F", "\u5929\u5FC3\u661F", "\u5929\u67F1\u661F", "\u5929\u4EFB\u661F", "\u5929\u82F1\u661F"],
        STAR: {
          /** 英文 */
          DUBHE: "\u5929\u84EC\u661F",
          MERAK: "\u5929\u82AE\u661F",
          PHECDA: "\u5929\u51B2\u661F",
          MEGREZ: "\u5929\u8F85\u661F",
          ALIOTH: "\u5929\u79BD\u661F",
          MIZAR: "\u5929\u5FC3\u661F",
          ALKAID: "\u5929\u67F1\u661F",
          IQ: "\u5929\u4EFB\u661F",
          CVn5: "\u5929\u82F1\u661F",
          /** 中文-奇门 */
          TIAN_PENG: "\u5929\u84EC\u661F",
          TIAN_RUI: "\u5929\u82AE\u661F",
          TIAN_CHONG: "\u5929\u51B2\u661F",
          TIAN_FU: "\u5929\u8F85\u661F",
          TIAN_QIN: "\u5929\u79BD\u661F",
          TIAN_XIN: "\u5929\u5FC3\u661F",
          TIAN_ZHU: "\u5929\u67F1\u661F",
          TIAN_REN: "\u5929\u4EFB\u661F",
          TIAN_YING: "\u5929\u82F1\u661F",
          /** 中文-北斗 */
          TIAN_SHU: "\u5929\u84EC\u661F",
          TIAN_XUAN: "\u5929\u82AE\u661F",
          TIAN_JI: "\u5929\u51B2\u661F",
          TIAN_QUAN: "\u5929\u8F85\u661F",
          TIAN_HENG: "\u5929\u79BD\u661F",
          KAI_YANG: "\u5929\u5FC3\u661F",
          YAO_GUANG: "\u5929\u67F1\u661F",
          DONG_MING: "\u5929\u4EFB\u661F",
          YIN_YUAN: "\u5929\u82F1\u661F",
          /** 中文 */
          TAN_LANG: "\u5929\u84EC\u661F",
          JU_MENG: "\u5929\u82AE\u661F",
          LU_CUN: "\u5929\u51B2\u661F",
          WEN_QU: "\u5929\u8F85\u661F",
          LIAN_ZHEN: "\u5929\u79BD\u661F",
          WU_QU: "\u5929\u5FC3\u661F",
          PO_JUN: "\u5929\u67F1\u661F",
          ZUO_FU: "\u5929\u4EFB\u661F",
          YOU_BI: "\u5929\u82F1\u661F",
          /** 简写-奇门 */
          TP: "\u5929\u84EC\u661F",
          TR: "\u5929\u82AE\u661F",
          TC: "\u5929\u51B2\u661F",
          TF: "\u5929\u8F85\u661F",
          TQIN: "\u5929\u79BD\u661F",
          TXIN: "\u5929\u5FC3\u661F",
          TZ: "\u5929\u67F1\u661F",
          TREN: "\u5929\u4EFB\u661F",
          TY: "\u5929\u82F1\u661F",
          /** 简写-北斗 */
          TS: "\u5929\u84EC\u661F",
          TX: "\u5929\u82AE\u661F",
          TJ: "\u5929\u51B2\u661F",
          TQ: "\u5929\u8F85\u661F",
          YH: "\u5929\u79BD\u661F",
          KY: "\u5929\u5FC3\u661F",
          YG: "\u5929\u67F1\u661F",
          DM: "\u5929\u4EFB\u661F",
          YY: "\u5929\u82F1\u661F",
          /** 简写 */
          TL: "\u5929\u84EC\u661F",
          JM: "\u5929\u82AE\u661F",
          LC: "\u5929\u51B2\u661F",
          WEQ: "\u5929\u8F85\u661F",
          LZ: "\u5929\u79BD\u661F",
          WUQ: "\u5929\u5FC3\u661F",
          PJ: "\u5929\u67F1\u661F",
          ZF: "\u5929\u4EFB\u661F",
          YB: "\u5929\u82F1\u661F"
        }
      };
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/door.js
  var require_door = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/door.js"(exports, module) {
      module.exports = {
        /**
         * 八门：
         */
        DOOR_ARR: ["\u4F11\u95E8", "\u6B7B\u95E8", "\u4F24\u95E8", "\u675C\u95E8", "", "\u5F00\u95E8", "\u60CA\u95E8", "\u751F\u95E8", "\u666F\u95E8"],
        DOOR: {
          /** 英文 */
          REST: "\u4F11\u95E8",
          DEATH: "\u6B7B\u95E8",
          DAMAGE: "\u4F24\u95E8",
          HINDER: "\u675C\u95E8",
          OPEN: "\u5F00\u95E8",
          SURPRISE: "\u60CA\u95E8",
          LIVE: "\u751F\u95E8",
          FLAME: "\u666F\u95E8",
          /** 中文 */
          XIU: "\u4F11\u95E8",
          SI: "\u6B7B\u95E8",
          SHANG: "\u4F24\u95E8",
          DU: "\u675C\u95E8",
          KAI: "\u5F00\u95E8",
          JING: "\u60CA\u95E8",
          SHENG: "\u751F\u95E8",
          JING_: "\u666F\u95E8"
        }
      };
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/divinity.js
  var require_divinity = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/divinity.js"(exports, module) {
      module.exports = {
        /**
         * 八神
         */
        DIVINITY_ARR: ["\u503C\u7B26", "\u87A3\u86C7", "\u592A\u9634", "\u516D\u5408", "\u767D\u864E", "\u7384\u6B66", "\u4E5D\u5730", "\u4E5D\u5929"],
        DIVINITY: {
          /** 英文 */
          SYMBOL: "\u503C\u7B26",
          AGKISTRODON: "\u817E\u86C7",
          LUNAR: "\u592A\u9634",
          SIX: "\u516D\u5408",
          WHITE_TIGER: "\u767D\u864E",
          BLACK_TORTOISE: "\u7384\u6B66",
          EARTH: "\u4E5D\u5730",
          SKY: "\u4E5D\u5929",
          /** 中文 */
          ZHI_FU: "\u503C\u7B26",
          TENG_SHE: "\u817E\u86C7",
          TAI_YIN: "\u592A\u9634",
          LIU_HE: "\u516D\u5408",
          BAI_HU: "\u767D\u864E",
          XUAN_WU: "\u7384\u6B66",
          JIU_DI: "\u4E5D\u5730",
          JIU_TIAN: "\u4E5D\u5929",
          /** 简写 */
          ZF: "\u503C\u7B26",
          TS: "\u817E\u86C7",
          TY: "\u592A\u9634",
          LH: "\u516D\u5408",
          BH: "\u767D\u864E",
          XW: "\u7384\u6B66",
          JD: "\u4E5D\u5730",
          JT: "\u4E5D\u5929"
        }
      };
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/surprise.js
  var require_surprise = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/surprise.js"(exports, module) {
      module.exports = {
        /**
         * 三奇：
         * 为十天干中的乙、丙、丁。
         * 对应三奇，分别为日奇，掌文、月奇，善武，星奇，粮草。
         */
        SURPRISE_ARR: ["\u4E01", "\u4E19", "\u4E59"],
        SURPRISE: {
          BUT: "\u4E01",
          PROP: "\u4E19",
          ETH: "\u4E59",
          /** 中文 */
          DING: "\u4E01",
          BING: "\u4E19",
          YI: "\u4E59"
        }
      };
    }
  });

  // node_modules/tao_name/dist/theArtOfBecomingInvisible/index.js
  var require_theArtOfBecomingInvisible = __commonJS({
    "node_modules/tao_name/dist/theArtOfBecomingInvisible/index.js"(exports, module) {
      var ceremony = require_ceremony();
      var star = require_star();
      var door = require_door();
      var divinity = require_divinity();
      var surprise = require_surprise();
      module.exports = Object.assign({}, ceremony, star, door, divinity, surprise);
    }
  });

  // node_modules/tao_name/dist/index.js
  var require_dist = __commonJS({
    "node_modules/tao_name/dist/index.js"(exports, module) {
      var sexagenaryCycle = require_sexagenaryCycle2();
      var eightTrigrams = require_trigrams();
      var logos = require_logos();
      var phases = require_phases();
      var theArtOfBecomingInvisible = require_theArtOfBecomingInvisible();
      module.exports = Object.assign({}, sexagenaryCycle, eightTrigrams, logos, phases, theArtOfBecomingInvisible);
    }
  });

  // node_modules/tao_taichi.js/dist/TaiChi.js
  var require_TaiChi = __commonJS({
    "node_modules/tao_taichi.js/dist/TaiChi.js"(exports, module) {
      var {
        LOGOS_ARR,
        LOGOS
      } = require_dist();
      var TaiChi = class {
        constructor(arg) {
          this.logos = ~~(arg + 1) === 0 ? LOGOS_ARR.indexOf(arg) : ~~arg % 2;
        }
        getLogos(is = false) {
          return is ? LOGOS_ARR[this.logos] : this.logos;
        }
      };
      TaiChi.LOGOS = LOGOS;
      module.exports = TaiChi;
    }
  });

  // node_modules/tao_taichi.js/dist/Phases.js
  var require_Phases = __commonJS({
    "node_modules/tao_taichi.js/dist/Phases.js"(exports, module) {
      var TaiChi = require_TaiChi();
      var {
        PHASES_ARR,
        PHASES,
        RELATION
      } = require_dist();
      var SEQUENCE = ["\u91D1", "\u6C34", "\u6728", "\u706B", "\u571F"];
      var Phases5 = class _Phases extends TaiChi {
        constructor(phases, logos) {
          if (typeof phases === "object" && phases instanceof _Phases) return phases;
          super(logos);
          this.phases = ~~(phases + 1) === 0 ? PHASES_ARR.indexOf(phases) : ~~phases % 5;
          if (this.phases < 0) throw new Error(`\u8BE5\u53C2\u6570\u4E0D\u53EF\u7528/this arg can\`t be use =>${phases}`);
          this.round = SEQUENCE.indexOf(PHASES_ARR[this.phases]);
        }
        /**
         * 获取五行
         * @param {boolean} is 是否文字
         * @returns
         */
        getPhases(is = false) {
          return is ? PHASES_ARR[this.phases] : this.phases;
        }
        /**
         * @description 与另一五行的生克关系
         * @param {Phases} another
         * @returns
         */
        with(another) {
          const ano = new _Phases(another);
          const phases = ano.phases;
          if (this.phases === phases) return 0;
          if (this.promotion() === phases) return 1;
          if (this.promoted() === phases) return 2;
          if (this.restrained() === phases) return 3;
          if (this.restraint() === phases) return 4;
          throw new Error(`arg can\`t be use =>${another}`);
        }
        // 我生者/相生
        promotion(is = false) {
          const index = (this.round + 1) % 5;
          return is ? SEQUENCE[index] : PHASES_ARR.indexOf(SEQUENCE[index]);
        }
        // 相生
        sheng(is) {
          return this.promotion(is);
        }
        // 生我者/相泄
        promoted(is = false) {
          const index = (this.round - 1 + 5) % 5;
          return is ? SEQUENCE[index] : PHASES_ARR.indexOf(SEQUENCE[index]);
        }
        // 相泄
        xie(is) {
          return this.promoted(is);
        }
        // 我克者/相克
        restraint(is = false) {
          const index = (this.round + 2) % 5;
          return is ? SEQUENCE[index] : PHASES_ARR.indexOf(SEQUENCE[index]);
        }
        // 相克
        ke(is) {
          return this.restraint(is);
        }
        // 克我者/相耗
        restrained(is = false) {
          const index = (this.round - 2 + 5) % 5;
          return is ? SEQUENCE[index] : PHASES_ARR.indexOf(SEQUENCE[index]);
        }
        // 相耗
        hao(is) {
          return this.restrained(is);
        }
        // 同我者旺
        vigorous(is) {
          return this.getPhases(is);
        }
        // 旺
        wang(is) {
          return this.vigorous(is);
        }
        // 我生者相
        second(is) {
          return this.promotion(is);
        }
        // 相
        xiang(is) {
          return this.second(is);
        }
        // 生我者休
        rest(is) {
          return this.promoted(is);
        }
        // 休
        xiu(is) {
          return this.rest(is);
        }
        // 克我者囚
        imprison(is) {
          return this.restrained(is);
        }
        // 囚
        qiu(is) {
          return this.imprison(is);
        }
        // 我克者死
        death(is) {
          return this.restraint(is);
        }
        // 死
        si(is) {
          return this.death(is);
        }
        get(tag, is = false) {
          switch (tag) {
            case "\u65FA":
              return this.wang(is);
            case "\u76F8":
              return this.xiang(is);
            case "\u4F11":
              return this.xiu(is);
            case "\u56DA":
              return this.qiu(is);
            case "\u6B7B":
              return this.si(is);
            case "\u751F":
              return this.sheng(is);
            case "\u6CC4":
              return this.xie(is);
            case "\u8017":
              return this.hao(is);
            case "\u514B":
              return this.ke(is);
            default:
              throw new Error("this tag must be in [\u65FA\u76F8\u4F11\u56DA\u6B7B\u751F\u6CC4\u8017\u514B]");
          }
        }
      };
      Phases5.RELATION = RELATION;
      Phases5.PHASES = PHASES;
      module.exports = Phases5;
    }
  });

  // node_modules/tao_taichi.js/dist/index.js
  var require_dist2 = __commonJS({
    "node_modules/tao_taichi.js/dist/index.js"(exports, module) {
      var Phases5 = require_Phases();
      var TaiChi = require_TaiChi();
      module.exports = {
        Phases: Phases5,
        TaiChi
      };
    }
  });

  // node_modules/tao_calendar/lib/pojo/alias.js
  var require_alias = __commonJS({
    "node_modules/tao_calendar/lib/pojo/alias.js"(exports, module) {
      module.exports = {
        COMBINATION: 0,
        CONFLICT: 1,
        PUNISHMENT: 2,
        HARM: 3,
        HE: 0,
        CHONG: 1,
        XING: 2,
        HAI: 3
      };
    }
  });

  // node_modules/tao_calendar/node_modules/tao_taichi.js/dist/TaiChi.js
  var require_TaiChi2 = __commonJS({
    "node_modules/tao_calendar/node_modules/tao_taichi.js/dist/TaiChi.js"(exports, module) {
      var LOGOS = ["\u9634", "\u9633"];
      var TaiChi = class {
        constructor(logos) {
          this.logos = ~~(logos + 1) === 0 ? LOGOS.indexOf(logos) : ~~logos % 2;
        }
        // setLogos(logos) {
        // 	this.logos = logos;
        // }
        getLogos(is = false) {
          return is ? LOGOS[this.logos] : this.logos;
        }
      };
      module.exports = TaiChi;
    }
  });

  // node_modules/tao_calendar/node_modules/tao_taichi.js/dist/alias.js
  var require_alias2 = __commonJS({
    "node_modules/tao_calendar/node_modules/tao_taichi.js/dist/alias.js"(exports, module) {
      module.exports = {
        // 旺相休囚死
        VIGOROUS: 0,
        SECOND: 1,
        REST: 2,
        IMPRISON: 3,
        DEATH: 4,
        // 旺相休囚死
        WANG: 0,
        XIANG: 1,
        XIU: 2,
        QIU: 3,
        SI: 4,
        // 生被生被克克
        SHENG: 1,
        XIE: 2,
        HAO: 3,
        KE: 4,
        // 生被生被克克
        S: 1,
        X: 2,
        H: 3,
        K: 4,
        // 生被生被克克
        PROMOTION: 1,
        PROMOTED: 2,
        RESTRAINED: 3,
        RESTRAINT: 4
      };
    }
  });

  // node_modules/tao_calendar/node_modules/tao_taichi.js/dist/Phases.js
  var require_Phases2 = __commonJS({
    "node_modules/tao_calendar/node_modules/tao_taichi.js/dist/Phases.js"(exports, module) {
      var TaiChi = require_TaiChi2();
      var PHASES = ["\u6C34", "\u706B", "\u6728", "\u91D1", "\u571F"];
      var SEQUENCE = ["\u91D1", "\u6C34", "\u6728", "\u706B", "\u571F"];
      var RELATION = require_alias2();
      var Phases5 = class _Phases extends TaiChi {
        constructor(phases, logos) {
          if (typeof phases === "object" && phases instanceof _Phases) return phases;
          super(logos);
          this.phases = ~~(phases + 1) === 0 ? PHASES.indexOf(phases) : ~~phases % 5;
          if (this.phases === -1) throw new Error(`\u8BE5\u53C2\u6570\u4E0D\u53EF\u7528/this arg can\`t be use =>${phases}`);
          this.round = SEQUENCE.indexOf(PHASES[this.phases]);
        }
        // 无需使用
        // setPhases(phases) {
        // 	this.phases = phases;
        // }
        /**
         * 获取五行
         * @param {boolean} is 是否文字
         * @returns
         */
        getPhases(is = false) {
          return is ? PHASES[this.phases] : this.phases;
        }
        /**
         * @description 与另一五行的生克关系
         * @param {Phases} another
         * @returns
         */
        with(another) {
          const ano = new _Phases(another);
          const phases = ano.phases;
          if (this.phases === phases) return 0;
          if (this.promotion() === phases) return 1;
          if (this.promoted() === phases) return 2;
          if (this.restrained() === phases) return 3;
          if (this.restraint() === phases) return 4;
          throw new Error(`arg can\`t be use =>${another}`);
        }
        // 我生者/相生
        promotion(is = false) {
          const index = (this.round + 1) % 5;
          return is ? SEQUENCE[index] : PHASES.indexOf(SEQUENCE[index]);
        }
        // 相生
        sheng(is) {
          return this.promotion(is);
        }
        // 生我者/相泄
        promoted(is = false) {
          const index = (this.round - 1 + 5) % 5;
          return is ? SEQUENCE[index] : PHASES.indexOf(SEQUENCE[index]);
        }
        // 相泄
        xie(is) {
          return this.promoted(is);
        }
        // 我克者/相克
        restraint(is = false) {
          const index = (this.round + 2) % 5;
          return is ? SEQUENCE[index] : PHASES.indexOf(SEQUENCE[index]);
        }
        // 相克
        ke(is) {
          return this.restraint(is);
        }
        // 克我者/相耗
        restrained(is = false) {
          const index = (this.round - 2 + 5) % 5;
          return is ? SEQUENCE[index] : PHASES.indexOf(SEQUENCE[index]);
        }
        // 相耗
        hao(is) {
          return this.restrained(is);
        }
        // 相乘
        // TODO
        // 相侮
        // TODO
        // 同我者旺
        vigorous(is) {
          return this.getPhases(is);
        }
        // 旺
        wang(is) {
          return this.vigorous(is);
        }
        // 我生者相
        second(is) {
          return this.promotion(is);
        }
        // 相
        xiang(is) {
          return this.second(is);
        }
        // 生我者休
        rest(is) {
          return this.promoted(is);
        }
        // 休
        xiu(is) {
          return this.rest(is);
        }
        // 克我者囚
        imprison(is) {
          return this.restrained(is);
        }
        // 囚
        qiu(is) {
          return this.imprison(is);
        }
        // 我克者死
        death(is) {
          return this.restraint(is);
        }
        // 死
        si(is) {
          return this.death(is);
        }
        get(tag, is = false) {
          switch (tag) {
            case "\u65FA":
              return this.wang(is);
            case "\u76F8":
              return this.xiang(is);
            case "\u4F11":
              return this.xiu(is);
            case "\u56DA":
              return this.qiu(is);
            case "\u6B7B":
              return this.si(is);
            case "\u751F":
              return this.sheng(is);
            case "\u6CC4":
              return this.xie(is);
            case "\u8017":
              return this.hao(is);
            case "\u514B":
              return this.ke(is);
            default:
              throw new Error("this tag must be in [\u65FA\u76F8\u4F11\u56DA\u6B7B\u751F\u6CC4\u8017\u514B]");
          }
        }
      };
      Phases5.RELATION = RELATION;
      module.exports = Phases5;
    }
  });

  // node_modules/tao_calendar/node_modules/tao_taichi.js/dist/index.js
  var require_dist3 = __commonJS({
    "node_modules/tao_calendar/node_modules/tao_taichi.js/dist/index.js"(exports, module) {
      var Phases5 = require_Phases2();
      var TaiChi = require_TaiChi2();
      module.exports = {
        Phases: Phases5,
        TaiChi
      };
    }
  });

  // node_modules/tao_calendar/lib/pojo/CelestialStems.js
  var require_CelestialStems = __commonJS({
    "node_modules/tao_calendar/lib/pojo/CelestialStems.js"(exports, module) {
      var CONNECTION = require_alias();
      var {
        CELESTIAL_STEMS_ARR: CELESTIAL_STEMS_ARR3,
        CELESTIAL_STEMS,
        CS,
        CS_ARR
      } = require_dist();
      var {
        Phases: Phases5
      } = require_dist3();
      var inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
      var CelestialStems3 = class _CelestialStems extends Phases5 {
        constructor(index) {
          if (index instanceof _CelestialStems) return index;
          const i = ~~(index + 1) === 0 ? CELESTIAL_STEMS_ARR3.indexOf(index) : ~~index % 10;
          if (i < 0) throw new Error("arg can`t be use");
          super((~~(i / 2) + 2 * ((~~(i / 2) + 1) % 2)) % 6, (i + 1) % 2);
          this.index = i;
        }
        getValue(is = false) {
          return is ? CELESTIAL_STEMS_ARR3[this.index] : this.index;
        }
        // 合
        // 05/16/27/38/49
        combination() {
          const cs = new _CelestialStems((this.index + 5) % 10);
          return cs;
        }
        he() {
          return this.combination();
        }
        // 冲
        // 06/17/38/49
        // 48/04/15
        conflict() {
          if (this.index !== 4 && this.index !== 5) return new _CelestialStems((this.index + 6) % 12);
          return -1;
        }
        chong() {
          return this.conflict();
        }
        // 破
        break() {
        }
        get(tag, is) {
          switch (tag) {
            case "\u51B2":
              return this.chong();
            case "\u5408":
              return this.he();
            default:
              return Phases5.prototype.get.call(this, tag, is);
          }
        }
        /**
         * @description 与天干克应
         * @param {CelestialStems} phases
         * @returns
         */
        to(phases) {
          const cs = new _CelestialStems(phases);
          if (this.he().index === cs.index) return 0;
          if (this.chong().index === cs.index) return 1;
          return -1;
        }
        [inspect]() {
          return this.getValue();
        }
      };
      CelestialStems3.RELATION = Phases5.RELATION;
      CelestialStems3.CONNECTION = CONNECTION;
      CelestialStems3.CELESTIAL_STEMS_ARR = CELESTIAL_STEMS_ARR3;
      CelestialStems3.CELESTIAL_STEMS = CELESTIAL_STEMS;
      CelestialStems3.CS_ARR = CS_ARR;
      CelestialStems3.CS = CS;
      module.exports = CelestialStems3;
    }
  });

  // node_modules/tao_calendar/lib/pojo/TerrestrialBranches.js
  var require_TerrestrialBranches = __commonJS({
    "node_modules/tao_calendar/lib/pojo/TerrestrialBranches.js"(exports, module) {
      var CONNECTION = require_alias();
      var {
        TERRESTRIAL_BRANCHES_ARR: TERRESTRIAL_BRANCHES_ARR2,
        TERRESTRIAL_BRANCHES,
        TB,
        TB_ARR
      } = require_dist();
      var {
        Phases: Phases5
      } = require_dist3();
      var inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
      var TerrestrialBranches3 = class _TerrestrialBranches extends Phases5 {
        constructor(index) {
          if (index instanceof _TerrestrialBranches) return index;
          const i = ~~(index + 1) === 0 ? TERRESTRIAL_BRANCHES_ARR2.indexOf(index) : ~~index % 12;
          if (i < 0) throw new Error("arg can`t be use");
          const _i = ~~((i + 1) / 3) % 4;
          super(i % 3 === 1 ? 4 : _i === 0 ? 0 : 3 - _i % 3, (i + 1) % 2);
          this.index = i;
        }
        getValue(is = false) {
          return is ? TERRESTRIAL_BRANCHES_ARR2[this.index] : this.index;
        }
        // 合
        // 01/211/310/49/58/67/
        // 804/2610/1137/591/
        combination() {
          const six = new _TerrestrialBranches((13 - this.index) % 12);
          const three = [new _TerrestrialBranches((this.index - 4 + 12) % 12), new _TerrestrialBranches((this.index + 4 + 12) % 12)];
          return [six, three];
        }
        he() {
          return this.combination();
        }
        // 冲
        // 06/17/28/39/410/511
        conflict() {
          return new _TerrestrialBranches((this.index + 6) % 12);
        }
        chong() {
          return this.conflict();
        }
        // 刑
        // 03/30/
        // 110/107/71/
        // 25/58/82/
        // 44/66/99/1111/
        punishment() {
          let i = 0;
          i = [4, 6, 9, 11].indexOf(this.index);
          if (i !== -1) return [new _TerrestrialBranches(this.index)];
          const _arr1 = [1, 10, 7];
          i = _arr1.indexOf(this.index);
          if (i !== -1) return [new _TerrestrialBranches(_arr1[(i - 1 + 3) % 3]), new _TerrestrialBranches(_arr1[(i + 1 + 3) % 3])];
          const _arr2 = [2, 5, 8];
          i = _arr2.indexOf(this.index);
          if (i !== -1) return [new _TerrestrialBranches(_arr2[(i - 1 + 3) % 3]), new _TerrestrialBranches(_arr2[(i + 1 + 3) % 3])];
          i = [0, 3].indexOf(this.index);
          return [new _TerrestrialBranches(this.index === 0 ? 3 : 0)];
        }
        xing() {
          return this.punishment();
        }
        // 害
        // 07/16/25/34/811/910
        harm() {
          return new _TerrestrialBranches((7 - this.index + 12) % 12);
        }
        hai() {
          return this.harm();
        }
        get(tag, is) {
          switch (tag) {
            case "\u5408":
              return this.he();
            case "\u51B2":
              return this.chong();
            case "\u5211":
              return this.xing();
            case "\u5BB3":
              return this.hai();
            default:
              return Phases5.prototype.get.call(this, tag, is);
          }
        }
        /**
         * @description 地支克应
         * @param {TerrestrialBranches} phases
         * @returns
         */
        to(phases) {
          const tb = new _TerrestrialBranches(phases);
          const result = [];
          if (this.he()[0].index === tb.index) result.push(0);
          if (this.chong().index === tb.index) result.push(1);
          if (this.xing()[0].index === tb.index || this.xing()[1] && this.xing()[1].index === tb.index) result.push(2);
          if (this.hai().index === tb.index) result.push(3);
          return result;
        }
        [inspect]() {
          return this.getValue();
        }
      };
      TerrestrialBranches3.RELATION = Phases5.RELATION;
      TerrestrialBranches3.CONNECTION = CONNECTION;
      TerrestrialBranches3.TERRESTRIAL_BRANCHES = TERRESTRIAL_BRANCHES;
      TerrestrialBranches3.TERRESTRIAL_BRANCHES_ARR = TERRESTRIAL_BRANCHES_ARR2;
      TerrestrialBranches3.TB = TB;
      TerrestrialBranches3.TB_ARR = TB_ARR;
      module.exports = TerrestrialBranches3;
    }
  });

  // node_modules/tao_calendar/lib/pojo/SexagenaryCycle.js
  var require_SexagenaryCycle = __commonJS({
    "node_modules/tao_calendar/lib/pojo/SexagenaryCycle.js"(exports, module) {
      var CelestialStems3 = require_CelestialStems();
      var TerrestrialBranches3 = require_TerrestrialBranches();
      var {
        SEXAGENARY_CYCLE_ARR: SEXAGENARY_CYCLE_ARR2,
        SEXAGENARY_CYCLE,
        SC,
        SC_ARR
      } = require_dist();
      var inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
      var _SexagenaryCycle_instances, getIndex_fn, getByIndex_fn, generateByOne_fn, generateByTwo_fn, generateByCSAndTB_fn;
      var _SexagenaryCycle = class _SexagenaryCycle {
        constructor(...num) {
          __privateAdd(this, _SexagenaryCycle_instances);
          this.x;
          this.y;
          this.index;
          if (num.length === 1) __privateMethod(this, _SexagenaryCycle_instances, generateByOne_fn).call(this, num[0]);
          if (num.length >= 2) __privateMethod(this, _SexagenaryCycle_instances, generateByTwo_fn).call(this, num[0], num[1]);
        }
        /**
         * 天干序列 Celestial Stems->0-9
         * @param {boolean} is
         * @returns 名称/序号
         */
        cs(is = false) {
          return is ? this.x.getValue(true) : this.x;
        }
        /**
         * 地支序列 Terrestrial Branches->0-11
         * @param {boolean} is
         * @returns 名称/序号
         */
        tb(is = false) {
          return is ? this.y.getValue(true) : this.y;
        }
        /**
         * 天干地支序列 0-59
         * @param {boolean} is
         * @returns 名称/序号
         */
        cstb(is = false) {
          return is ? this.cs(is) + this.tb(is) : this.index;
        }
        /**
         * 获得旬首
         * @returns {SexagenaryCycle} sexagenaryCycle
         */
        getLead() {
          const index = ~~(this.index / 10) * 10;
          return new _SexagenaryCycle(index);
        }
        [inspect]() {
          return this.cstb();
        }
      };
      _SexagenaryCycle_instances = new WeakSet();
      // 天干地支对应的序列
      /*
      	x:0		x:1		x:2		x:3 	x:4 	x:5 	x:6 	x:7 	x:8 	x:9
      	0 00/00		01/00	02/00	03/00	04/00	05/00	06/00	07/00	08/00	09/00	
      	1 10/10		11/10	00/-2	01/-2	02/-2	03/-2	04/-2	05/-2	06/-2	07/-2
      	2 08/08		09/08	10/08	11/08	00/-4	01/-4	02/-4	03/-4	04/-4	05/-4
      	3 06/06		07/06	08/06	09/06	10/06	11/06	00/-6	01/-6	02/-6	03/-6
      	4 04/04		05/04	06/04	07/04	08/04	09/04	10/04	11/04	00/-8	01/-8
      	5 02/02		03/02	04/02	05/02	06/02	07/02	08/02	09/02	10/02	11/02
      */
      /**
       * 获取对应的干支序号
       * @param {*} x 天干
       * @param {*} y 地支
       * @returns {Number} 干支序号
       */
      getIndex_fn = function(x = this.x, y = this.y) {
        if (x === -1 || y === -1 || x % 2 === 0 !== (y % 2 === 0)) throw new Error(`can\`t use this arg by x:${x} y:${y}`);
        const difference = y.getValue() - x.getValue();
        const index = (difference + 12) % 12 / 2;
        const tensPlace = (6 - index) % 6;
        return tensPlace * 10 + x.getValue();
      };
      /**
       * 根据一个序列获取干支
       * @param {*} arg 参数
       */
      getByIndex_fn = function(_arg) {
        const arg = Math.abs(_arg % 60);
        const x = arg % 10;
        const y = arg % 12;
        __privateMethod(this, _SexagenaryCycle_instances, generateByCSAndTB_fn).call(this, x, y);
        this.index = arg;
      };
      generateByOne_fn = function(_arg) {
        let arg = _arg;
        if (arg instanceof _SexagenaryCycle) return arg;
        if (typeof arg === "string") {
          if (~~(arg + 1)) {
            arg = ~~arg;
          } else if (arg.length === 2) {
            arg = Array.from(arg);
          } else {
            throw new Error(`array length must be equals two`);
          }
        }
        if (typeof arg === "number") {
          __privateMethod(this, _SexagenaryCycle_instances, getByIndex_fn).call(this, arg);
          return;
        }
        if (arg instanceof Array) {
          __privateMethod(this, _SexagenaryCycle_instances, generateByTwo_fn).call(this, arg[0], arg[1]);
          return;
        }
        if (typeof arg === "object") {
          const {
            x,
            y
          } = Object.fromEntries(Object.entries(arg));
          __privateMethod(this, _SexagenaryCycle_instances, generateByTwo_fn).call(this, x, y);
          return;
        }
        throw new Error("this arg can't to use");
      };
      generateByTwo_fn = function(x, y) {
        __privateMethod(this, _SexagenaryCycle_instances, generateByCSAndTB_fn).call(this, x, y);
        this.index = __privateMethod(this, _SexagenaryCycle_instances, getIndex_fn).call(this);
      };
      /** 根据天干地支对象生成 */
      generateByCSAndTB_fn = function(x, y) {
        this.x = new CelestialStems3(x);
        this.y = new TerrestrialBranches3(y);
      };
      var SexagenaryCycle3 = _SexagenaryCycle;
      SexagenaryCycle3.SEXAGENARY_CYCLE_ARR = SEXAGENARY_CYCLE_ARR2;
      SexagenaryCycle3.SEXAGENARY_CYCLE = SEXAGENARY_CYCLE;
      SexagenaryCycle3.SC = SC;
      SexagenaryCycle3.SC_ARR = SC_ARR;
      module.exports = SexagenaryCycle3;
    }
  });

  // node_modules/solar_terms.js/dist/data/json/vsop87d.ear.json
  var require_vsop87d_ear = __commonJS({
    "node_modules/solar_terms.js/dist/data/json/vsop87d.ear.json"(exports, module) {
      module.exports = { l: [[["1.75347045673", "0.00000000000", "0.00000000000"], ["0.03341656456", "4.66925680417", "6283.07584999140"], ["0.00034894275", "4.62610241759", "12566.15169998280"], ["0.00003417571", "2.82886579606", "3.52311834900"], ["0.00003497056", "2.74411800971", "5753.38488489680"], ["0.00003135896", "3.62767041758", "77713.77146812050"], ["0.00002676218", "4.41808351397", "7860.41939243920"], ["0.00002342687", "6.13516237631", "3930.20969621960"], ["0.00001273166", "2.03709655772", "529.69096509460"], ["0.00001324292", "0.74246356352", "11506.76976979360"], ["0.00000901855", "2.04505443513", "26.29831979980"], ["0.00001199167", "1.10962944315", "1577.34354244780"], ["0.00000857223", "3.50849156957", "398.14900340820"], ["0.00000779786", "1.17882652114", "5223.69391980220"], ["0.00000990250", "5.23268129594", "5884.92684658320"], ["0.00000753141", "2.53339053818", "5507.55323866740"], ["0.00000505264", "4.58292563052", "18849.22754997420"], ["0.00000492379", "4.20506639861", "775.52261132400"], ["0.00000356655", "2.91954116867", "0.06731030280"], ["0.00000284125", "1.89869034186", "796.29800681640"], ["0.00000242810", "0.34481140906", "5486.77784317500"], ["0.00000317087", "5.84901952218", "11790.62908865880"], ["0.00000271039", "0.31488607649", "10977.07880469900"], ["0.00000206160", "4.80646606059", "2544.31441988340"], ["0.00000205385", "1.86947813692", "5573.14280143310"], ["0.00000202261", "2.45767795458", "6069.77675455340"], ["0.00000126184", "1.08302630210", "20.77539549240"], ["0.00000155516", "0.83306073807", "213.29909543800"], ["0.00000115132", "0.64544911683", "0.98032106820"], ["0.00000102851", "0.63599846727", "4694.00295470760"], ["0.00000101724", "4.26679821365", "7.11354700080"], ["0.00000099206", "6.20992940258", "2146.16541647520"], ["0.00000132212", "3.41118275555", "2942.46342329160"], ["0.00000097607", "0.68101272270", "155.42039943420"], ["0.00000085128", "1.29870743025", "6275.96230299060"], ["0.00000074651", "1.75508916159", "5088.62883976680"], ["0.00000101895", "0.97569221824", "15720.83878487840"], ["0.00000084711", "3.67080093025", "71430.69561812909"], ["0.00000073547", "4.67926565481", "801.82093112380"], ["0.00000073874", "3.50319443167", "3154.68708489560"], ["0.00000078756", "3.03698313141", "12036.46073488820"], ["0.00000079637", "1.80791330700", "17260.15465469040"], ["0.00000085803", "5.98322631256", "161000.68573767410"], ["0.00000056963", "2.78430398043", "6286.59896834040"], ["0.00000061148", "1.81839811024", "7084.89678111520"], ["0.00000069627", "0.83297596966", "9437.76293488700"], ["0.00000056116", "4.38694880779", "14143.49524243060"], ["0.00000062449", "3.97763880587", "8827.39026987480"], ["0.00000051145", "0.28306864501", "5856.47765911540"], ["0.00000055577", "3.47006009062", "6279.55273164240"], ["0.00000041036", "5.36817351402", "8429.24126646660"], ["0.00000051605", "1.33282746983", "1748.01641306700"], ["0.00000051992", "0.18914945834", "12139.55350910680"], ["0.00000049000", "0.48735065033", "1194.44701022460"], ["0.00000039200", "6.16832995016", "10447.38783960440"], ["0.00000035566", "1.77597314691", "6812.76681508600"], ["0.00000036770", "6.04133859347", "10213.28554621100"], ["0.00000036596", "2.56955238628", "1059.38193018920"], ["0.00000033291", "0.59309499459", "17789.84561978500"], ["0.00000035954", "1.70876111898", "2352.86615377180"], ["0.00000040938", "2.39850881707", "19651.04848109800"], ["0.00000030047", "2.73975123935", "1349.86740965880"], ["0.00000030412", "0.44294464135", "83996.84731811189"], ["0.00000023663", "0.48473567763", "8031.09226305840"], ["0.00000023574", "2.06527720049", "3340.61242669980"], ["0.00000021089", "4.14825464101", "951.71840625060"], ["0.00000024738", "0.21484762138", "3.59042865180"], ["0.00000025352", "3.16470953405", "4690.47983635860"], ["0.00000022820", "5.22197888032", "4705.73230754360"], ["0.00000021419", "1.42563735525", "16730.46368959580"], ["0.00000021891", "5.55594302562", "553.56940284240"], ["0.00000017481", "4.56052900359", "135.06508003540"], ["0.00000019925", "5.22208471269", "12168.00269657460"], ["0.00000019860", "5.77470167653", "6309.37416979120"], ["0.00000020300", "0.37133792946", "283.85931886520"], ["0.00000014421", "4.19315332546", "242.72860397400"], ["0.00000016225", "5.98837722564", "11769.85369316640"], ["0.00000015077", "4.19567181073", "6256.77753019160"], ["0.00000019124", "3.82219996949", "23581.25817731760"], ["0.00000018888", "5.38626880969", "149854.40013480789"], ["0.00000014346", "3.72355084422", "38.02767263580"], ["0.00000017898", "2.21490735647", "13367.97263110660"], ["0.00000012054", "2.62229588349", "955.59974160860"], ["0.00000011287", "0.17739328092", "4164.31198961300"], ["0.00000013971", "4.40138139996", "6681.22485339960"], ["0.00000013621", "1.88934471407", "7632.94325965020"], ["0.00000012503", "1.13052412208", "5.52292430740"], ["0.00000010498", "5.35909518669", "1592.59601363280"], ["0.00000009803", "0.99947478995", "11371.70468975820"], ["0.00000009220", "4.57138609781", "4292.33083295040"], ["0.00000010327", "6.19982566125", "6438.49624942560"], ["0.00000012003", "1.00351456700", "632.78373931320"], ["0.00000010827", "0.32734520222", "103.09277421860"], ["0.00000008356", "4.53902685948", "25132.30339996560"], ["0.00000010005", "6.02914963280", "5746.27133789600"], ["0.00000008409", "3.29946744189", "7234.79425624200"], ["0.00000008006", "5.82145271907", "28.44918746780"], ["0.00000010523", "0.93871805506", "11926.25441366880"], ["0.00000007686", "3.12142363172", "7238.67559160000"], ["0.00000009378", "2.62414241032", "5760.49843189760"], ["0.00000008127", "6.11228001785", "4732.03062734340"], ["0.00000009232", "0.48343968736", "522.57741809380"], ["0.00000009802", "5.24413991147", "27511.46787353720"], ["0.00000007871", "0.99590177926", "5643.17856367740"], ["0.00000008123", "6.27053013650", "426.59819087600"], ["0.00000009048", "5.33686335897", "6386.16862421000"], ["0.00000008620", "4.16538210888", "7058.59846131540"], ["0.00000006297", "4.71724819317", "6836.64525283380"], ["0.00000007575", "3.97382858911", "11499.65622279280"], ["0.00000007756", "2.95729056763", "23013.53953958720"], ["0.00000007314", "0.60652505806", "11513.88331679440"], ["0.00000005955", "2.87641047971", "6283.14316029419"], ["0.00000006534", "5.79072926033", "18073.70493865020"], ["0.00000007188", "3.99831508699", "74.78159856730"], ["0.00000007346", "4.38582365437", "316.39186965660"], ["0.00000005413", "5.39199024641", "419.48464387520"], ["0.00000005127", "2.36062848786", "10973.55568635000"], ["0.00000007056", "0.32258441903", "263.08392337280"], ["0.00000006625", "3.66475158672", "17298.18232732620"], ["0.00000006762", "5.91132535899", "90955.55169449610"], ["0.00000004938", "5.73672165674", "9917.69687450980"], ["0.00000005547", "2.45152597661", "12352.85260454480"], ["0.00000005958", "3.32051344676", "6283.00853968860"], ["0.00000004471", "2.06385999536", "7079.37385680780"], ["0.00000006153", "1.45823331144", "233141.31440436149"], ["0.00000004348", "4.42342175480", "5216.58037280140"], ["0.00000006123", "1.07494905258", "19804.82729158280"], ["0.00000004488", "3.65285037150", "206.18554843720"], ["0.00000004020", "0.83995823171", "20.35531939880"], ["0.00000005188", "4.06503864016", "6208.29425142410"], ["0.00000005307", "0.38217636096", "31441.67756975680"], ["0.00000003785", "2.34369213733", "3.88133535800"], ["0.00000004497", "3.27230796845", "11015.10647733480"], ["0.00000004132", "0.92128915753", "3738.76143010800"], ["0.00000003521", "5.97844807108", "3894.18182954220"], ["0.00000004215", "1.90601120623", "245.83164622940"], ["0.00000003701", "5.03069397926", "536.80451209540"], ["0.00000003865", "1.82634360607", "11856.21865142450"], ["0.00000003652", "1.01838584934", "16200.77272450120"], ["0.00000003390", "0.97785123922", "8635.94200376320"], ["0.00000003737", "2.95380107829", "3128.38876509580"], ["0.00000003507", "3.71291946325", "6290.18939699220"], ["0.00000003086", "3.64646921512", "10.63666534980"], ["0.00000003397", "1.10590684017", "14712.31711645800"], ["0.00000003334", "0.83684924911", "6496.37494542940"], ["0.00000002805", "2.58504514144", "14314.16811304980"], ["0.00000003650", "1.08344142571", "88860.05707098669"], ["0.00000003388", "3.20185096055", "5120.60114558360"], ["0.00000003252", "3.47859752062", "6133.51265285680"], ["0.00000002553", "3.94869034189", "1990.74501704100"], ["0.00000003520", "2.05559692878", "244287.60000722769"], ["0.00000002565", "1.56071784900", "23543.23050468179"], ["0.00000002621", "3.85639359951", "266.60704172180"], ["0.00000002955", "3.39692949667", "9225.53927328300"], ["0.00000002876", "6.02635617464", "154717.60988768269"], ["0.00000002395", "1.16131956403", "10984.19235169980"], ["0.00000003161", "1.32798718453", "10873.98603048040"], ["0.00000003163", "5.08946464629", "21228.39202354580"], ["0.00000002361", "4.27212906992", "6040.34724601740"], ["0.00000003030", "1.80209931347", "35371.88726597640"], ["0.00000002343", "3.57689860500", "10969.96525769820"], ["0.00000002618", "2.57870156528", "22483.84857449259"], ["0.00000002113", "3.71393780256", "65147.61976813770"], ["0.00000002019", "0.81393923319", "170.67287061920"], ["0.00000002003", "0.38091017375", "6172.86952877200"], ["0.00000002506", "3.74379142438", "10575.40668294180"], ["0.00000002381", "0.10581361289", "7.04623669800"], ["0.00000001949", "4.86892513469", "36.02786667740"], ["0.00000002074", "4.22794774570", "5650.29211067820"], ["0.00000001924", "5.59460549860", "6282.09552892320"], ["0.00000001949", "1.07002512703", "5230.80746680300"], ["0.00000001988", "5.19736046771", "6262.30045449900"], ["0.00000001887", "3.74365662683", "23.87843774780"], ["0.00000001787", "1.25929682929", "12559.03815298200"], ["0.00000001883", "1.90364058477", "15.25247118500"], ["0.00000001816", "3.68083868442", "15110.46611986620"], ["0.00000001701", "4.41105895380", "110.20632121940"], ["0.00000001990", "3.93295788548", "6206.80977871580"], ["0.00000002103", "0.75354917468", "13521.75144159140"], ["0.00000001774", "0.48747535361", "1551.04522264800"], ["0.00000001882", "0.86684493432", "22003.91463486980"], ["0.00000001924", "1.22898324132", "709.93304855830"], ["0.00000002009", "4.62850921980", "6037.24420376200"], ["0.00000001924", "0.60231842508", "6284.05617105960"], ["0.00000001596", "3.98332956992", "13916.01910964160"], ["0.00000001664", "4.41939715469", "8662.24032356300"], ["0.00000001971", "1.04560500503", "18209.33026366019"], ["0.00000001942", "4.31335979989", "6244.94281435360"], ["0.00000001476", "0.93271367331", "2379.16447357160"], ["0.00000001810", "0.49112137707", "1.48447270830"], ["0.00000001346", "1.51574702235", "4136.91043351620"], ["0.00000001528", "5.61835711404", "6127.65545055720"], ["0.00000001791", "3.22187270126", "39302.09696219600"], ["0.00000001747", "3.05638656738", "18319.53658487960"], ["0.00000001431", "4.51153808594", "20426.57109242200"], ["0.00000001695", "0.22047718414", "25158.60171976540"], ["0.00000001242", "4.46665769933", "17256.63153634140"], ["0.00000001463", "4.69242679213", "14945.31617355440"], ["0.00000001205", "1.86912144659", "4590.91018048900"], ["0.00000001192", "2.74227166898", "12569.67481833180"], ["0.00000001222", "5.18120087482", "5333.90024102160"], ["0.00000001390", "5.42894648983", "143571.32428481648"], ["0.00000001473", "1.70479245805", "11712.95531823080"], ["0.00000001362", "2.61069503292", "6062.66320755260"], ["0.00000001148", "6.03001800540", "3634.62102451840"], ["0.00000001198", "5.15294130422", "10177.25767953360"], ["0.00000001266", "0.11421493643", "18422.62935909819"], ["0.00000001411", "1.09908857534", "3496.03282613400"], ["0.00000001349", "2.99805109633", "17654.78053974960"], ["0.00000001253", "2.79850152848", "167283.76158766549"], ["0.00000001311", "1.60942984879", "5481.25491886760"], ["0.00000001079", "6.20304501787", "3.28635741780"], ["0.00000001181", "1.20653776978", "131.54196168640"], ["0.00000001254", "5.45103277798", "6076.89030155420"], ["0.00000001035", "2.32142722747", "7342.45778018060"], ["0.00000001117", "0.38838354256", "949.17560896980"], ["0.00000000966", "3.18341890851", "11087.28512591840"], ["0.00000001171", "3.39635049962", "12562.62858163380"], ["0.00000001121", "0.72627490378", "220.41264243880"], ["0.00000001024", "2.19378315386", "11403.67699557500"], ["0.00000000888", "3.91173199285", "4686.88940770680"], ["0.00000000910", "1.98802695087", "735.87651353180"], ["0.00000000830", "0.48984915507", "24072.92146977640"], ["0.00000001096", "6.17377835617", "5436.99301524020"], ["0.00000000908", "0.44959639433", "7477.52286021600"], ["0.00000000974", "1.52996238356", "9623.68827669120"], ["0.00000000840", "1.79543266333", "5429.87946823940"], ["0.00000000778", "6.17699177946", "38.13303563780"], ["0.00000000776", "4.09855402433", "14.22709400160"], ["0.00000001068", "4.64200173735", "43232.30665841560"], ["0.00000000954", "1.49988435748", "1162.47470440780"], ["0.00000000907", "0.86986870809", "10344.29506538580"], ["0.00000000931", "4.06044689031", "28766.92442448400"], ["0.00000000739", "5.04368197372", "639.89728631400"], ["0.00000000937", "3.46884698960", "1589.07289528380"], ["0.00000000763", "5.86304932998", "16858.48253293320"], ["0.00000000953", "4.20801492835", "11190.37790013700"], ["0.00000000708", "1.72899988940", "13095.84266507740"], ["0.00000000969", "1.64439522215", "29088.81141598500"], ["0.00000000717", "0.16688678895", "11.72935283600"], ["0.00000000962", "3.53092337542", "12416.58850284820"], ["0.00000000747", "5.77866940346", "12592.45001978260"], ["0.00000000672", "1.91095796194", "3.93215326310"], ["0.00000000671", "5.46240843677", "18052.92954315780"], ["0.00000000675", "6.28311558823", "4535.05943692440"], ["0.00000000684", "0.39975012080", "5849.36411211460"], ["0.00000000799", "0.29851185294", "12132.43996210600"], ["0.00000000758", "0.96370823331", "1052.26838318840"], ["0.00000000782", "5.33878339919", "13517.87010623340"], ["0.00000000730", "1.70106160291", "17267.26820169119"], ["0.00000000749", "2.59599901875", "11609.86254401220"], ["0.00000000734", "2.78417782952", "640.87760738220"], ["0.00000000688", "5.15048287468", "16496.36139620240"], ["0.00000000770", "1.62469589333", "4701.11650170840"], ["0.00000000633", "2.20587893893", "25934.12433108940"], ["0.00000000760", "4.21317219403", "377.37360791580"], ["0.00000000584", "2.13420121623", "10557.59416082380"], ["0.00000000574", "0.24250054587", "9779.10867612540"], ["0.00000000573", "3.16435264609", "533.21408344360"], ["0.00000000685", "3.19344289472", "12146.66705610760"], ["0.00000000675", "0.96179233959", "10454.50138660520"], ["0.00000000648", "1.46327342555", "6268.84875598980"], ["0.00000000589", "2.50543543638", "3097.88382272579"], ["0.00000000551", "5.28099026956", "9388.00590941520"], ["0.00000000696", "3.65342150016", "4804.20927592700"], ["0.00000000669", "2.51030077026", "2388.89402044920"], ["0.00000000550", "0.06883864342", "20199.09495963300"], ["0.00000000629", "4.13350995675", "45892.73043315699"], ["0.00000000678", "6.09190163533", "135.62532501000"], ["0.00000000593", "1.50136257618", "226858.23855437008"], ["0.00000000542", "3.58573645173", "6148.01076995600"], ["0.00000000682", "5.02203067788", "17253.04110768959"], ["0.00000000565", "4.29309238610", "11933.36796066960"], ["0.00000000486", "0.77746204893", "27.40155609680"], ["0.00000000503", "0.58963565969", "15671.08175940660"], ["0.00000000616", "4.06539884128", "227.47613278900"], ["0.00000000583", "6.12695541996", "18875.52586977400"], ["0.00000000537", "2.15056440980", "21954.15760939799"], ["0.00000000669", "6.06986269566", "47162.51635463520"], ["0.00000000475", "0.40343842110", "6915.85958930460"], ["0.00000000540", "2.83444222174", "5326.78669402080"], ["0.00000000530", "5.26359885263", "10988.80815753500"], ["0.00000000582", "3.24533095664", "153.77881048480"], ["0.00000000641", "3.24711791371", "2107.03450754240"], ["0.00000000621", "3.09698523779", "33019.02111220460"], ["0.00000000466", "3.14982372198", "10440.27429260360"], ["0.00000000466", "0.90708835657", "5966.68398033480"], ["0.00000000528", "0.81926454470", "813.55028395980"], ["0.00000000603", "3.81378921927", "316428.22867391503"], ["0.00000000559", "1.81894804124", "17996.03116822220"], ["0.00000000437", "2.28625594435", "6303.85124548380"], ["0.00000000518", "4.86069178322", "20597.24396304120"], ["0.00000000424", "6.23520018693", "6489.26139842860"], ["0.00000000518", "6.17617826756", "0.24381748350"], ["0.00000000404", "5.72804304258", "5642.19824260920"], ["0.00000000458", "1.34117773915", "6287.00800325450"], ["0.00000000548", "5.68454458320", "155427.54293624099"], ["0.00000000547", "1.03391472061", "3646.35037735440"], ["0.00000000428", "4.69800981138", "846.08283475120"], ["0.00000000413", "6.02520699406", "6279.48542133960"], ["0.00000000534", "3.03030638223", "66567.48586525429"], ["0.00000000383", "1.49056949125", "19800.94595622480"], ["0.00000000410", "5.28319622279", "18451.07854656599"], ["0.00000000352", "4.68891600359", "4907.30205014560"], ["0.00000000480", "5.36572651091", "348.92442044800"], ["0.00000000344", "5.89157452896", "6546.15977336420"], ["0.00000000340", "0.37557426440", "13119.72110282519"], ["0.00000000434", "4.98417785901", "6702.56049386660"], ["0.00000000332", "2.68902519126", "29296.61538957860"], ["0.00000000448", "2.16478480251", "5905.70224207560"], ["0.00000000344", "2.06546633735", "49.75702547180"], ["0.00000000315", "1.24023811803", "4061.21921539440"], ["0.00000000324", "2.30897526929", "5017.50837136500"], ["0.00000000413", "0.17171692962", "6286.66627864320"], ["0.00000000431", "3.86601101393", "12489.88562870720"], ["0.00000000349", "4.55372342974", "4933.20844033260"], ["0.00000000323", "0.41971136084", "10770.89325626180"], ["0.00000000341", "2.68612860807", "11.04570026390"], ["0.00000000316", "3.52936906658", "17782.73207278420"], ["0.00000000315", "5.63357264999", "568.82187402740"], ["0.00000000340", "3.83571212349", "10660.68693504240"], ["0.00000000297", "0.62691416712", "20995.39296644940"], ["0.00000000405", "1.00085779471", "16460.33352952499"], ["0.00000000414", "1.21998752076", "51092.72605085480"], ["0.00000000336", "4.71465945226", "6179.98307577280"], ["0.00000000361", "3.71227508354", "28237.23345938940"], ["0.00000000385", "6.21925225757", "24356.78078864160"], ["0.00000000327", "1.05606504715", "11919.14086666800"], ["0.00000000327", "6.14222420989", "6254.62666252360"], ["0.00000000268", "2.47224339737", "664.75604513000"], ["0.00000000269", "1.86207884109", "23141.55838292460"], ["0.00000000345", "0.93461290184", "6058.73105428950"], ["0.00000000296", "4.51687557180", "6418.14093002680"], ["0.00000000353", "4.50033653082", "36949.23080842420"], ["0.00000000260", "4.04963546305", "6525.80445396540"], ["0.00000000298", "2.20046722622", "156137.47598479928"], ["0.00000000253", "3.49900838384", "29864.33402730900"], ["0.00000000254", "2.44901693835", "5331.35744374080"], ["0.00000000296", "0.84347588787", "5729.50644714900"], ["0.00000000298", "1.29194706125", "22805.73556599360"], ["0.00000000241", "2.00721280805", "16737.57723659660"], ["0.00000000311", "1.23668016334", "6281.59137728310"], ["0.00000000240", "2.51650377121", "6245.04817735560"], ["0.00000000332", "3.55576945724", "7668.63742494250"], ["0.00000000264", "4.44052061202", "12964.30070339100"], ["0.00000000257", "1.79654471948", "11080.17157891760"], ["0.00000000260", "3.33077598420", "5888.44996493220"], ["0.00000000285", "0.30886361430", "11823.16163945020"], ["0.00000000290", "5.70141882483", "77.67377042800"], ["0.00000000255", "4.00939664440", "5881.40372823420"], ["0.00000000253", "4.73318493678", "16723.35014259500"], ["0.00000000228", "0.95333661324", "5540.08578945880"], ["0.00000000319", "1.38633229189", "163096.18036118349"], ["0.00000000224", "1.65156322696", "10027.90319572920"], ["0.00000000226", "0.34106460604", "17796.95916678580"], ["0.00000000236", "4.19817431922", "19.66976089979"], ["0.00000000280", "4.14080268970", "12539.85338018300"], ["0.00000000275", "5.50306930248", "32.53255079140"], ["0.00000000223", "5.23334210294", "56.89837493560"], ["0.00000000217", "6.08587881787", "6805.65326808520"], ["0.00000000280", "4.52472044653", "6016.46880826960"], ["0.00000000227", "5.06509843737", "6277.55292568400"], ["0.00000000226", "5.17755154305", "11720.06886523160"], ["0.00000000245", "3.96486270306", "22.77520145080"], ["0.00000000220", "4.72078081970", "6.62855890001"], ["0.00000000207", "5.71701403951", "41.55079098480"], ["0.00000000204", "3.91227411250", "2699.73481931760"], ["0.00000000209", "0.86881969011", "6321.10352262720"], ["0.00000000200", "2.11984445273", "4274.51831083240"], ["0.00000000200", "5.39839888163", "6019.99192661860"], ["0.00000000209", "5.67606291663", "11293.47067435560"], ["0.00000000252", "1.64965729351", "9380.95967271720"], ["0.00000000275", "5.04826903506", "73.29712585900"], ["0.00000000208", "1.88207277133", "11300.58422135640"], ["0.00000000272", "0.74640926842", "1975.49254585600"], ["0.00000000199", "3.30836672397", "22743.40937951640"], ["0.00000000269", "4.48560812155", "64471.99124174489"], ["0.00000000192", "2.17464236325", "5863.59120611620"], ["0.00000000228", "5.85373115869", "128.01884333740"], ["0.00000000261", "2.64321183295", "55022.93574707440"], ["0.00000000220", "5.75012110079", "29.42950853600"], ["0.00000000187", "4.03230554718", "467.96499035440"], ["0.00000000200", "5.60556112058", "1066.49547719000"], ["0.00000000231", "1.09802712785", "12341.80690428090"], ["0.00000000199", "0.29500625200", "149.56319713460"], ["0.00000000249", "5.10473210814", "7875.67186362420"], ["0.00000000208", "0.93013835019", "14919.01785375460"], ["0.00000000179", "0.87104393079", "12721.57209941700"], ["0.00000000203", "1.56920753653", "28286.99048486120"], ["0.00000000179", "2.47036386443", "16062.18452611680"], ["0.00000000198", "3.54061588502", "30.91412563500"], ["0.00000000171", "3.45356518113", "5327.47610838280"], ["0.00000000183", "0.72325421604", "6272.03014972750"], ["0.00000000216", "2.97174580686", "19402.79695281660"], ["0.00000000168", "2.51550550242", "23937.85638974100"], ["0.00000000195", "0.09045393425", "156.40072050240"], ["0.00000000179", "4.49471798090", "31415.37924995700"], ["0.00000000216", "0.42177594328", "23539.70738633280"], ["0.00000000189", "0.37542530191", "9814.60410029120"], ["0.00000000218", "2.36835880025", "16627.37091537720"], ["0.00000000166", "4.23182968446", "16840.67001081519"], ["0.00000000200", "2.02153258098", "16097.67995028260"], ["0.00000000169", "0.91318727000", "95.97922721780"], ["0.00000000211", "5.73370637657", "151.89728108520"], ["0.00000000204", "0.42643085174", "515.46387109300"], ["0.00000000212", "3.00233538977", "12043.57428188900"], ["0.00000000192", "5.46153589821", "6379.05507720920"], ["0.00000000165", "1.38698167064", "4171.42553661380"], ["0.00000000160", "6.23798383332", "202.25339517410"], ["0.00000000215", "0.20889073407", "5621.84292321040"], ["0.00000000181", "4.12439203622", "13341.67431130680"], ["0.00000000153", "1.24460848836", "29826.30635467320"], ["0.00000000150", "3.12999753018", "799.82112516540"], ["0.00000000175", "4.55671604437", "239424.39025435288"], ["0.00000000192", "1.33928820063", "394.62588505920"], ["0.00000000149", "2.65697593276", "21.33564046700"], ["0.00000000146", "5.58021191726", "412.37109687440"], ["0.00000000156", "3.75650175503", "12323.42309600880"], ["0.00000000143", "3.75708566606", "58864.54391814630"], ["0.00000000143", "3.28248547724", "29.82143814880"], ["0.00000000144", "1.07862546598", "1265.56747862640"], ["0.00000000148", "0.23389236655", "10021.83728009940"], ["0.00000000193", "5.92751083086", "40879.44050464380"], ["0.00000000140", "4.97612440269", "158.94351778320"], ["0.00000000148", "2.61640453469", "17157.06188047180"], ["0.00000000141", "3.66871308723", "26084.02180621620"], ["0.00000000147", "5.09968173403", "661.23292678100"], ["0.00000000146", "4.96885605695", "57375.80190084620"], ["0.00000000142", "0.78678347839", "12779.45079542080"], ["0.00000000134", "4.79432636012", "111.18664228760"], ["0.00000000140", "1.27748013377", "107.66352393860"], ["0.00000000169", "2.74893543762", "26735.94526221320"], ["0.00000000165", "3.95288000638", "6357.85744855870"], ["0.00000000183", "5.43418358741", "369.69981594040"], ["0.00000000134", "3.09132862833", "17.81252211800"], ["0.00000000132", "3.05633896779", "22490.96212149340"], ["0.00000000134", "4.09472795832", "6599.46771964800"], ["0.00000000181", "4.22950689891", "966.97087743560"], ["0.00000000152", "5.28885894415", "12669.24447420140"], ["0.00000000150", "5.86819430908", "97238.62754448749"], ["0.00000000142", "5.87266532526", "22476.73502749179"], ["0.00000000145", "5.07330784304", "87.30820453981"], ["0.00000000133", "5.65471067133", "31.97230581680"], ["0.00000000124", "2.83326217072", "12566.21901028560"], ["0.00000000135", "3.12861731644", "32217.20018108080"], ["0.00000000137", "0.86487461904", "9924.81042151060"], ["0.00000000172", "1.98369595114", "174242.46596404970"], ["0.00000000170", "4.41115280254", "327574.51427678125"], ["0.00000000151", "0.46542099527", "39609.65458316560"], ["0.00000000148", "2.13439571118", "491.66329245880"], ["0.00000000153", "3.78801830344", "17363.24742890899"], ["0.00000000165", "5.31654110459", "16943.76278503380"], ["0.00000000165", "4.06747587817", "58953.14544329400"], ["0.00000000118", "0.63846333239", "6.06591562980"], ["0.00000000159", "0.86086959274", "221995.02880149524"], ["0.00000000119", "5.96432932413", "1385.89527633620"], ["0.00000000114", "5.16516114595", "25685.87280280800"], ["0.00000000112", "3.39403722178", "21393.54196985760"], ["0.00000000112", "4.92889233335", "56.80326216980"], ["0.00000000119", "2.40637635942", "18635.92845453620"], ["0.00000000115", "0.23374479051", "418.92439890060"], ["0.00000000122", "0.93575234049", "24492.40611365159"], ["0.00000000115", "4.58880032176", "26709.64694241340"], ["0.00000000130", "4.85539251000", "22345.26037610820"], ["0.00000000140", "1.09413073202", "44809.65020086340"], ["0.00000000112", "6.05401806281", "433.71173787680"], ["0.00000000104", "1.54931540602", "127.95153303460"], ["0.00000000105", "4.82620858888", "33794.54372352860"], ["0.00000000102", "4.12448497391", "15664.03552270859"], ["0.00000000107", "4.67919356465", "77690.75950573849"], ["0.00000000118", "4.52320170120", "19004.64794940840"], ["0.00000000107", "5.71774478555", "77736.78343050249"], ["0.00000000143", "1.81201813018", "4214.06901508480"], ["0.00000000125", "1.14419195615", "625.67019231240"], ["0.00000000124", "3.27736514057", "12566.08438968000"], ["0.00000000110", "1.08682570828", "2787.04302385740"], ["0.00000000105", "1.78318141871", "18139.29450141590"], ["0.00000000102", "4.75119578149", "12242.64628332540"], ["0.00000000137", "1.43510636754", "86464.61331683119"], ["0.00000000101", "4.91289409429", "401.67212175720"], ["0.00000000129", "1.23567904485", "12029.34718788740"], ["0.00000000138", "2.45654707999", "7576.56007357400"], ["0.00000000103", "0.40004073416", "90279.92316810328"], ["0.00000000108", "0.98989774940", "5636.06501667660"], ["0.00000000117", "5.17362872063", "34520.30930938080"], ["0.00000000100", "3.95534628189", "5547.19933645960"], ["0.00000000098", "1.28118280598", "21548.96236929180"], ["0.00000000097", "3.34717130592", "16310.97904572060"], ["0.00000000098", "4.37041908717", "34513.26307268280"], ["0.00000000125", "2.72164432960", "24065.80792277559"], ["0.00000000102", "0.66938025772", "10239.58386601080"], ["0.00000000119", "1.21689479331", "1478.86657406440"], ["0.00000000094", "1.99595224256", "13362.44970679920"], ["0.00000000094", "4.30965982872", "26880.31981303260"], ["0.00000000095", "2.89807657534", "34911.41207609100"], ["0.00000000106", "1.00156653590", "16522.65971600220"], ["0.00000000097", "0.89642320201", "71980.63357473118"], ["0.00000000116", "4.19967201116", "206.70073729660"], ["0.00000000099", "1.37437847718", "1039.02661079040"], ["0.00000000126", "3.21642544972", "305281.94307104882"], ["0.00000000094", "0.68997876060", "7834.12107263940"], ["0.00000000094", "5.58132218606", "3104.93005942380"], ["0.00000000095", "3.03823741110", "8982.81066930900"], ["0.00000000108", "0.52696637156", "276.74577186440"], ["0.00000000124", "3.43899862683", "172146.97134054029"], ["0.00000000102", "1.04031728553", "95143.13292097810"], ["0.00000000104", "3.39218586218", "290.97286586600"], ["0.00000000110", "3.68205877433", "22380.75580027400"], ["0.00000000117", "0.78475956902", "83286.91426955358"], ["0.00000000083", "0.18241793425", "15141.39079431200"], ["0.00000000089", "4.45371820659", "792.77488846740"], ["0.00000000082", "4.80703651241", "6819.88036208680"], ["0.00000000087", "3.43122851097", "27707.54249429480"], ["0.00000000101", "5.32081603011", "2301.58581590939"], ["0.00000000082", "0.87060089842", "10241.20229116720"], ["0.00000000086", "4.61919461931", "36147.40987730040"], ["0.00000000095", "2.87032884659", "23020.65308658799"], ["0.00000000088", "3.21133165690", "33326.57873317420"], ["0.00000000080", "1.84900424847", "21424.46664430340"], ["0.00000000101", "4.18796434479", "30666.15495843280"], ["0.00000000107", "5.77864921649", "34115.11406927460"], ["0.00000000104", "1.08739495962", "6288.59877429880"], ["0.00000000110", "3.32898859416", "72140.62866668739"], ["0.00000000087", "4.40657711727", "142.17862703620"], ["0.00000000109", "1.94546030825", "24279.10701821359"], ["0.00000000087", "4.32472045435", "742.99006053260"], ["0.00000000107", "4.91580912547", "277.03499374140"], ["0.00000000088", "2.10180220766", "26482.17080962440"], ["0.00000000086", "4.01887374432", "12491.37010141550"], ["0.00000000106", "5.49092372854", "62883.35513951360"], ["0.00000000080", "6.19781316983", "6709.67404086740"], ["0.00000000088", "2.09872810657", "238004.52415723629"], ["0.00000000083", "4.90662164029", "51.28033786241"], ["0.00000000095", "4.13387406591", "18216.44381066100"], ["0.00000000078", "6.06949391680", "148434.53403769129"], ["0.00000000079", "3.03048221644", "838.96928775040"], ["0.00000000074", "5.49813051211", "29026.48522950779"], ["0.00000000073", "3.05008665738", "567.71863773040"], ["0.00000000084", "0.46604373274", "45.14121963660"], ["0.00000000093", "2.52267536308", "48739.85989708300"], ["0.00000000076", "1.76418124905", "41654.96311596780"], ["0.00000000067", "5.77851227793", "6311.52503745920"], ["0.00000000062", "3.32967880172", "15508.61512327440"], ["0.00000000079", "5.59773841328", "71960.38658322369"], ["0.00000000057", "3.90629505268", "5999.21653112620"], ["0.00000000061", "0.05695043232", "7856.89627409019"], ["0.00000000061", "5.63297958433", "7863.94251078820"], ["0.00000000065", "3.72178394016", "12573.26524698360"], ["0.00000000057", "4.18217219541", "26087.90314157420"], ["0.00000000066", "3.92262333487", "69853.35207568129"], ["0.00000000053", "5.51119362045", "77710.24834977149"], ["0.00000000053", "4.88573986961", "77717.29458646949"], ["0.00000000062", "2.88876342225", "9411.46461508720"], ["0.00000000051", "1.12657183874", "82576.98122099529"], ["0.00000000045", "2.95671076719", "24602.61243487099"], ["0.00000000040", "5.55145719241", "12565.17137891460"], ["0.00000000039", "1.20838190039", "18842.11400297339"], ["0.00000000045", "3.18590558749", "45585.17281218740"], ["0.00000000049", "2.44790934886", "13613.80427733600"]], [["6283.31966747491", "0.00000000000", "0.00000000000"], ["0.00206058863", "2.67823455584", "6283.07584999140"], ["0.00004303430", "2.63512650414", "12566.15169998280"], ["0.00000425264", "1.59046980729", "3.52311834900"], ["0.00000108977", "2.96618001993", "1577.34354244780"], ["0.00000093478", "2.59212835365", "18849.22754997420"], ["0.00000119261", "5.79557487799", "26.29831979980"], ["0.00000072122", "1.13846158196", "529.69096509460"], ["0.00000067768", "1.87472304791", "398.14900340820"], ["0.00000067327", "4.40918235168", "5507.55323866740"], ["0.00000059027", "2.88797038460", "5223.69391980220"], ["0.00000055976", "2.17471680261", "155.42039943420"], ["0.00000045407", "0.39803079805", "796.29800681640"], ["0.00000036369", "0.46624739835", "775.52261132400"], ["0.00000028958", "2.64707383882", "7.11354700080"], ["0.00000019097", "1.84628332577", "5486.77784317500"], ["0.00000020844", "5.34138275149", "0.98032106820"], ["0.00000018508", "4.96855124577", "213.29909543800"], ["0.00000016233", "0.03216483047", "2544.31441988340"], ["0.00000017293", "2.99116864949", "6275.96230299060"], ["0.00000015832", "1.43049285325", "2146.16541647520"], ["0.00000014615", "1.20532366323", "10977.07880469900"], ["0.00000011877", "3.25804815607", "5088.62883976680"], ["0.00000011514", "2.07502418155", "4694.00295470760"], ["0.00000009721", "4.23925472239", "1349.86740965880"], ["0.00000009969", "1.30262991097", "6286.59896834040"], ["0.00000009452", "2.69957062864", "242.72860397400"], ["0.00000012461", "2.83432285512", "1748.01641306700"], ["0.00000011808", "5.27379790480", "1194.44701022460"], ["0.00000008577", "5.64475868067", "951.71840625060"], ["0.00000010641", "0.76614199202", "553.56940284240"], ["0.00000007576", "5.30062664886", "2352.86615377180"], ["0.00000005834", "1.76649917904", "1059.38193018920"], ["0.00000006385", "2.65033984967", "9437.76293488700"], ["0.00000005223", "5.66135767624", "71430.69561812909"], ["0.00000005305", "0.90857521574", "3154.68708489560"], ["0.00000006101", "4.66632584188", "4690.47983635860"], ["0.00000004330", "0.24102555403", "6812.76681508600"], ["0.00000005041", "1.42490103709", "6438.49624942560"], ["0.00000004259", "0.77355900599", "10447.38783960440"], ["0.00000005198", "1.85353197345", "801.82093112380"], ["0.00000003744", "2.00119516488", "8031.09226305840"], ["0.00000003558", "2.42901552681", "14143.49524243060"], ["0.00000003372", "3.86210700128", "1592.59601363280"], ["0.00000003374", "0.88776219727", "12036.46073488820"], ["0.00000003175", "3.18785710594", "4705.73230754360"], ["0.00000003221", "0.61599835472", "8429.24126646660"], ["0.00000004132", "5.23992859705", "7084.89678111520"], ["0.00000002970", "6.07026318493", "4292.33083295040"], ["0.00000002900", "2.32464208411", "20.35531939880"], ["0.00000003504", "4.79975694359", "6279.55273164240"], ["0.00000002950", "1.43108874817", "5746.27133789600"], ["0.00000002697", "4.80368225199", "7234.79425624200"], ["0.00000002531", "6.22290682655", "6836.64525283380"], ["0.00000002745", "0.93466065396", "5760.49843189760"], ["0.00000003250", "3.39954640038", "7632.94325965020"], ["0.00000002277", "5.00277837672", "17789.84561978500"], ["0.00000002075", "3.95534978634", "10213.28554621100"], ["0.00000002061", "2.22411683077", "5856.47765911540"], ["0.00000002252", "5.67166499885", "11499.65622279280"], ["0.00000002148", "5.20184578235", "11513.88331679440"], ["0.00000001886", "0.53198320577", "3340.61242669980"], ["0.00000001875", "4.73511970207", "83996.84731811189"], ["0.00000002060", "2.54987293999", "25132.30339996560"], ["0.00000001794", "1.47435409831", "4164.31198961300"], ["0.00000001778", "3.02473091781", "5.52292430740"], ["0.00000002029", "0.90960209983", "6256.77753019160"], ["0.00000002075", "2.26767270157", "522.57741809380"], ["0.00000001772", "3.02622802353", "5753.38488489680"], ["0.00000001569", "6.12410242782", "5216.58037280140"], ["0.00000001590", "4.63713748247", "3.28635741780"], ["0.00000001542", "4.20004448567", "13367.97263110660"], ["0.00000001427", "1.19088061711", "3894.18182954220"], ["0.00000001375", "3.09301252193", "135.06508003540"], ["0.00000001359", "4.24532506641", "426.59819087600"], ["0.00000001340", "5.76511818622", "6040.34724601740"], ["0.00000001284", "3.08524663344", "5643.17856367740"], ["0.00000001250", "3.07748157144", "11926.25441366880"], ["0.00000001551", "3.07665451458", "6681.22485339960"], ["0.00000001268", "2.09196018331", "6290.18939699220"], ["0.00000001144", "3.24444699514", "12168.00269657460"], ["0.00000001248", "3.44504937285", "536.80451209540"], ["0.00000001118", "2.31829670425", "16730.46368959580"], ["0.00000001105", "5.31966001019", "23.87843774780"], ["0.00000001051", "3.75015946014", "7860.41939243920"], ["0.00000001025", "2.44688534235", "1990.74501704100"], ["0.00000000962", "0.81771017882", "3.88133535800"], ["0.00000000910", "0.41727865299", "7079.37385680780"], ["0.00000000883", "5.16833917651", "11790.62908865880"], ["0.00000000957", "4.07673573735", "6127.65545055720"], ["0.00000001110", "3.90096793825", "11506.76976979360"], ["0.00000000802", "3.88778875582", "10973.55568635000"], ["0.00000000780", "2.39934293755", "1589.07289528380"], ["0.00000000758", "1.30034364248", "103.09277421860"], ["0.00000000749", "4.96275803300", "6496.37494542940"], ["0.00000000765", "3.36312388424", "36.02786667740"], ["0.00000000915", "5.41543742089", "206.18554843720"], ["0.00000000776", "2.57589093871", "11371.70468975820"], ["0.00000000772", "3.98369209464", "955.59974160860"], ["0.00000000749", "5.17890001805", "10969.96525769820"], ["0.00000000806", "0.34218864254", "9917.69687450980"], ["0.00000000728", "5.20962563787", "38.02767263580"], ["0.00000000685", "2.77592961854", "20.77539549240"], ["0.00000000636", "4.28242193632", "28.44918746780"], ["0.00000000608", "5.63278508906", "10984.19235169980"], ["0.00000000704", "5.60738823665", "3738.76143010800"], ["0.00000000685", "0.38876148682", "15.25247118500"], ["0.00000000601", "0.73489602442", "419.48464387520"], ["0.00000000716", "2.65279791438", "6309.37416979120"], ["0.00000000584", "5.54502568227", "17298.18232732620"], ["0.00000000650", "1.13379656406", "7058.59846131540"], ["0.00000000688", "2.59683891779", "3496.03282613400"], ["0.00000000485", "0.44467180946", "12352.85260454480"], ["0.00000000528", "2.74936967681", "3930.20969621960"], ["0.00000000597", "5.27668281777", "10575.40668294180"], ["0.00000000583", "3.18929067810", "4732.03062734340"], ["0.00000000526", "5.01697321546", "5884.92684658320"], ["0.00000000540", "1.29175137075", "640.87760738220"], ["0.00000000473", "5.49953306970", "5230.80746680300"], ["0.00000000406", "5.21248452189", "220.41264243880"], ["0.00000000395", "1.87474483222", "16200.77272450120"], ["0.00000000370", "3.84921354713", "18073.70493865020"], ["0.00000000367", "0.88533542778", "6283.14316029419"], ["0.00000000379", "0.37983009325", "10177.25767953360"], ["0.00000000356", "3.84145204913", "11712.95531823080"], ["0.00000000374", "5.01577520608", "7.04623669800"], ["0.00000000381", "4.30250406634", "6062.66320755260"], ["0.00000000471", "0.86381834647", "6069.77675455340"], ["0.00000000367", "1.32943839763", "6283.00853968860"], ["0.00000000460", "5.19667219575", "6284.05617105960"], ["0.00000000333", "5.54256205741", "4686.88940770680"], ["0.00000000341", "4.36522989934", "7238.67559160000"], ["0.00000000336", "4.00205876835", "3097.88382272579"], ["0.00000000359", "6.22679790284", "245.83164622940"], ["0.00000000307", "2.35299010924", "170.67287061920"], ["0.00000000343", "3.77164927143", "6076.89030155420"], ["0.00000000296", "5.44152227481", "17260.15465469040"], ["0.00000000328", "0.13837875384", "11015.10647733480"], ["0.00000000268", "1.13904550630", "12569.67481833180"], ["0.00000000263", "0.00538633678", "4136.91043351620"], ["0.00000000282", "5.04399837480", "7477.52286021600"], ["0.00000000288", "3.13401177517", "12559.03815298200"], ["0.00000000259", "0.93882269387", "5642.19824260920"], ["0.00000000292", "1.98420020514", "12132.43996210600"], ["0.00000000247", "3.84244798532", "5429.87946823940"], ["0.00000000245", "5.70467521726", "65147.61976813770"], ["0.00000000241", "0.99480969552", "3634.62102451840"], ["0.00000000246", "3.06168069935", "110.20632121940"], ["0.00000000239", "6.11855909114", "11856.21865142450"], ["0.00000000263", "0.66348415419", "21228.39202354580"], ["0.00000000262", "1.51070507866", "12146.66705610760"], ["0.00000000230", "1.75927314884", "9779.10867612540"], ["0.00000000223", "2.00967043606", "6172.86952877200"], ["0.00000000246", "1.10411690865", "6282.09552892320"], ["0.00000000221", "3.03945240854", "8635.94200376320"], ["0.00000000214", "4.03840869663", "14314.16811304980"], ["0.00000000236", "5.46915070580", "13916.01910964160"], ["0.00000000224", "4.68408089456", "24072.92146977640"], ["0.00000000212", "2.13695625494", "5849.36411211460"], ["0.00000000207", "3.07724246401", "11.72935283600"], ["0.00000000207", "6.10306282747", "23543.23050468179"], ["0.00000000266", "1.00709566823", "2388.89402044920"], ["0.00000000217", "6.27837036335", "17267.26820169119"], ["0.00000000204", "2.34615348695", "266.60704172180"], ["0.00000000195", "5.55015549753", "6133.51265285680"], ["0.00000000188", "2.52667166175", "6525.80445396540"], ["0.00000000185", "0.90960768344", "18319.53658487960"], ["0.00000000177", "1.73429218289", "154717.60988768269"], ["0.00000000187", "4.76483647432", "4535.05943692440"], ["0.00000000186", "4.63080493407", "10440.27429260360"], ["0.00000000215", "2.81255454560", "7342.45778018060"], ["0.00000000172", "1.45551888559", "9225.53927328300"], ["0.00000000162", "3.30661909388", "639.89728631400"], ["0.00000000168", "2.17671416605", "27.40155609680"], ["0.00000000160", "1.68164180475", "15110.46611986620"], ["0.00000000158", "0.13519771874", "13095.84266507740"], ["0.00000000183", "0.56281322071", "13517.87010623340"], ["0.00000000179", "3.58450811616", "87.30820453981"], ["0.00000000152", "2.84070476818", "5650.29211067820"], ["0.00000000182", "0.44065530624", "17253.04110768959"], ["0.00000000160", "5.95767264171", "4701.11650170840"], ["0.00000000142", "1.46290137520", "11087.28512591840"], ["0.00000000142", "2.04464036087", "20426.57109242200"], ["0.00000000131", "5.40912137746", "2699.73481931760"], ["0.00000000144", "2.07312090485", "25158.60171976540"], ["0.00000000147", "6.15106982168", "9623.68827669120"], ["0.00000000141", "5.55739979498", "10454.50138660520"], ["0.00000000135", "0.06098110407", "16723.35014259500"], ["0.00000000124", "5.81218025669", "17256.63153634140"], ["0.00000000124", "2.36293551623", "4933.20844033260"], ["0.00000000126", "3.47435905118", "22483.84857449259"], ["0.00000000159", "5.63954754618", "5729.50644714900"], ["0.00000000123", "3.92815963256", "17996.03116822220"], ["0.00000000148", "3.02509280598", "1551.04522264800"], ["0.00000000120", "5.91904349732", "6206.80977871580"], ["0.00000000134", "3.11122937825", "21954.15760939799"], ["0.00000000119", "5.52141123450", "709.93304855830"], ["0.00000000122", "3.00813429479", "19800.94595622480"], ["0.00000000127", "1.37618620001", "14945.31617355440"], ["0.00000000141", "2.56889468729", "1052.26838318840"], ["0.00000000123", "2.83671175442", "11919.14086666800"], ["0.00000000118", "0.81934438215", "5331.35744374080"], ["0.00000000151", "2.68731829165", "11769.85369316640"], ["0.00000000119", "5.08835797638", "5481.25491886760"], ["0.00000000153", "2.46021790779", "11933.36796066960"], ["0.00000000108", "1.04936452145", "11403.67699557500"], ["0.00000000128", "0.99794735107", "8827.39026987480"], ["0.00000000144", "2.54869747042", "227.47613278900"], ["0.00000000150", "4.50631437136", "2379.16447357160"], ["0.00000000107", "1.79272017026", "13119.72110282519"], ["0.00000000107", "4.43556814486", "18422.62935909819"], ["0.00000000109", "0.29269062317", "16737.57723659660"], ["0.00000000141", "3.18979826258", "6262.30045449900"], ["0.00000000122", "4.23040027813", "29.42950853600"], ["0.00000000111", "5.16954029551", "17782.73207278420"], ["0.00000000100", "3.52213872761", "18052.92954315780"], ["0.00000000108", "1.08514212991", "16858.48253293320"], ["0.00000000106", "1.96085248410", "74.78159856730"], ["0.00000000110", "2.30582372873", "16460.33352952499"], ["0.00000000097", "3.50918940210", "5333.90024102160"], ["0.00000000099", "3.56417337974", "735.87651353180"], ["0.00000000094", "5.01857894228", "3128.38876509580"], ["0.00000000097", "1.65579893894", "533.21408344360"], ["0.00000000092", "0.89217162285", "29296.61538957860"], ["0.00000000123", "3.16062050433", "9380.95967271720"], ["0.00000000102", "1.20493500565", "23020.65308658799"], ["0.00000000088", "2.21296088224", "12721.57209941700"], ["0.00000000089", "1.54264720310", "20199.09495963300"], ["0.00000000113", "4.83320707870", "16496.36139620240"], ["0.00000000121", "6.19860353182", "9388.00590941520"], ["0.00000000089", "4.08082274765", "22805.73556599360"], ["0.00000000098", "1.09181832830", "12043.57428188900"], ["0.00000000086", "1.13655027605", "143571.32428481648"], ["0.00000000088", "5.96980472191", "107.66352393860"], ["0.00000000082", "5.01340404594", "22003.91463486980"], ["0.00000000094", "1.69615700473", "23006.42599258639"], ["0.00000000081", "3.00657814365", "2118.76386037840"], ["0.00000000098", "1.39215287161", "8662.24032356300"], ["0.00000000077", "3.33555190840", "15720.83878487840"], ["0.00000000082", "5.86880116464", "2787.04302385740"], ["0.00000000076", "5.67183650604", "14.22709400160"], ["0.00000000081", "6.16619455699", "1039.02661079040"], ["0.00000000076", "3.21449884756", "111.18664228760"], ["0.00000000078", "1.37531518377", "21947.11137270000"], ["0.00000000074", "3.58814195051", "11609.86254401220"], ["0.00000000077", "4.84846488388", "22743.40937951640"], ["0.00000000090", "1.48869013606", "15671.08175940660"], ["0.00000000082", "3.48618399109", "29088.81141598500"], ["0.00000000069", "3.55746476593", "4590.91018048900"], ["0.00000000069", "1.93625656075", "135.62532501000"], ["0.00000000070", "2.66548322237", "18875.52586977400"], ["0.00000000069", "5.41478093731", "26735.94526221320"], ["0.00000000079", "5.15154513662", "12323.42309600880"], ["0.00000000094", "3.62899392448", "77713.77146812050"], ["0.00000000078", "4.17011182047", "1066.49547719000"], ["0.00000000071", "3.89435637865", "22779.43724619380"], ["0.00000000063", "4.53968787714", "8982.81066930900"], ["0.00000000069", "0.96028230548", "14919.01785375460"], ["0.00000000076", "3.29092216589", "2942.46342329160"], ["0.00000000063", "4.09167842893", "16062.18452611680"], ["0.00000000065", "3.34580407184", "51.28033786241"], ["0.00000000065", "5.75757544877", "52670.06959330260"], ["0.00000000068", "5.75884067555", "21424.46664430340"], ["0.00000000057", "5.45122399850", "12592.45001978260"], ["0.00000000057", "5.25043362558", "20995.39296644940"], ["0.00000000073", "0.53299090807", "2301.58581590939"], ["0.00000000070", "4.31243357502", "19402.79695281660"], ["0.00000000067", "2.53852336668", "377.37360791580"], ["0.00000000056", "3.20816844695", "24889.57479599160"], ["0.00000000053", "3.17816599142", "18451.07854656599"], ["0.00000000053", "3.61529270216", "77.67377042800"], ["0.00000000053", "0.45467549335", "30666.15495843280"], ["0.00000000061", "0.14807288453", "23013.53953958720"], ["0.00000000051", "3.32803972907", "56.89837493560"], ["0.00000000052", "3.41177624177", "23141.55838292460"], ["0.00000000058", "3.13638677202", "309.27832265580"], ["0.00000000070", "2.50592323465", "31415.37924995700"], ["0.00000000052", "5.10673376738", "17796.95916678580"], ["0.00000000067", "6.27917920454", "22345.26037610820"], ["0.00000000050", "0.42577644151", "25685.87280280800"], ["0.00000000048", "0.70204553333", "1162.47470440780"], ["0.00000000066", "3.64350022359", "15265.88651930040"], ["0.00000000050", "5.74382917440", "19.66976089979"], ["0.00000000050", "4.69825387775", "28237.23345938940"], ["0.00000000047", "5.74015846442", "12139.55350910680"], ["0.00000000054", "1.97301333704", "23581.25817731760"], ["0.00000000049", "4.98223579027", "10021.83728009940"], ["0.00000000046", "5.41431705539", "33019.02111220460"], ["0.00000000051", "1.23882053879", "12539.85338018300"], ["0.00000000046", "2.41369976086", "98068.53671630539"], ["0.00000000044", "0.80750593746", "167283.76158766549"], ["0.00000000045", "4.39613584445", "433.71173787680"], ["0.00000000044", "2.57358208785", "12964.30070339100"], ["0.00000000046", "0.26142733448", "11.04570026390"], ["0.00000000045", "2.46230645202", "51868.24866217880"], ["0.00000000048", "0.89551707131", "56600.27928952220"], ["0.00000000057", "1.86416707010", "25287.72379939980"], ["0.00000000042", "5.26377513431", "26084.02180621620"], ["0.00000000049", "3.17757670611", "6303.85124548380"], ["0.00000000052", "3.65266055509", "7872.14874527520"], ["0.00000000040", "1.81891629936", "34596.36465465240"], ["0.00000000043", "1.94164978061", "1903.43681250120"], ["0.00000000041", "0.74461854136", "23937.85638974100"], ["0.00000000048", "6.26034008181", "28286.99048486120"], ["0.00000000045", "5.45575017530", "60530.48898574180"], ["0.00000000040", "2.92105728682", "21548.96236929180"], ["0.00000000040", "0.04502010161", "38526.57435087200"], ["0.00000000053", "3.64791042082", "11925.27409260060"], ["0.00000000041", "5.04048954693", "27832.03821928320"], ["0.00000000042", "5.19292937193", "19004.64794940840"], ["0.00000000040", "2.57120233428", "24356.78078864160"], ["0.00000000038", "3.49190341464", "226858.23855437008"], ["0.00000000039", "4.61184303844", "95.97922721780"], ["0.00000000043", "2.20648228147", "13521.75144159140"], ["0.00000000040", "5.83461945819", "16193.65917750039"], ["0.00000000045", "3.73714372195", "7875.67186362420"], ["0.00000000043", "1.14078465002", "49.75702547180"], ["0.00000000037", "1.29390383811", "310.84079886840"], ["0.00000000038", "0.95970925950", "664.75604513000"], ["0.00000000037", "4.27532649462", "6709.67404086740"], ["0.00000000038", "2.20108541046", "28628.33622609960"], ["0.00000000039", "0.85957361635", "16522.65971600220"], ["0.00000000040", "4.35214003837", "48739.85989708300"], ["0.00000000036", "1.68167662194", "10344.29506538580"], ["0.00000000040", "5.13217319067", "15664.03552270859"], ["0.00000000036", "3.72187132496", "30774.50164257480"], ["0.00000000036", "3.32158458257", "16207.88627150200"], ["0.00000000045", "3.94202418608", "10988.80815753500"], ["0.00000000039", "1.51948786199", "12029.34718788740"], ["0.00000000026", "3.87685883180", "6262.72053059260"], ["0.00000000024", "4.91804163466", "19651.04848109800"], ["0.00000000023", "0.29300197709", "13362.44970679920"], ["0.00000000021", "3.18605672363", "6277.55292568400"], ["0.00000000021", "6.07546891132", "18139.29450141590"], ["0.00000000022", "2.31199937177", "6303.43116939020"], ["0.00000000021", "3.58418394393", "18209.33026366019"], ["0.00000000026", "2.06801296900", "12573.26524698360"], ["0.00000000021", "1.56857722317", "13341.67431130680"], ["0.00000000024", "5.72605158675", "29864.33402730900"], ["0.00000000024", "1.40237993205", "14712.31711645800"], ["0.00000000025", "5.71466092822", "25934.12433108940"]], [["0.00052918870", "0.00000000000", "0.00000000000"], ["0.00008719837", "1.07209665242", "6283.07584999140"], ["0.00000309125", "0.86728818832", "12566.15169998280"], ["0.00000027339", "0.05297871691", "3.52311834900"], ["0.00000016334", "5.18826691036", "26.29831979980"], ["0.00000015752", "3.68457889430", "155.42039943420"], ["0.00000009541", "0.75742297675", "18849.22754997420"], ["0.00000008937", "2.05705419118", "77713.77146812050"], ["0.00000006952", "0.82673305410", "775.52261132400"], ["0.00000005064", "4.66284525271", "1577.34354244780"], ["0.00000004061", "1.03057162962", "7.11354700080"], ["0.00000003463", "5.14074632811", "796.29800681640"], ["0.00000003169", "6.05291851171", "5507.55323866740"], ["0.00000003020", "1.19246506441", "242.72860397400"], ["0.00000002886", "6.11652627155", "529.69096509460"], ["0.00000003810", "3.44050803490", "5573.14280143310"], ["0.00000002714", "0.30637881025", "398.14900340820"], ["0.00000002371", "4.38118838167", "5223.69391980220"], ["0.00000002538", "2.27992810679", "553.56940284240"], ["0.00000002079", "3.75435330484", "0.98032106820"], ["0.00000001675", "0.90216407959", "951.71840625060"], ["0.00000001534", "5.75900462759", "1349.86740965880"], ["0.00000001224", "2.97328088405", "2146.16541647520"], ["0.00000001449", "4.36415913970", "1748.01641306700"], ["0.00000001341", "3.72061130861", "1194.44701022460"], ["0.00000001254", "2.94846826628", "6438.49624942560"], ["0.00000000999", "5.98640014468", "6286.59896834040"], ["0.00000000917", "4.79788687522", "5088.62883976680"], ["0.00000000828", "3.31321076572", "213.29909543800"], ["0.00000001103", "1.27104454479", "161000.68573767410"], ["0.00000000762", "3.41582762988", "5486.77784317500"], ["0.00000001044", "0.60409577691", "3154.68708489560"], ["0.00000000887", "5.23465144638", "7084.89678111520"], ["0.00000000645", "1.60096192515", "2544.31441988340"], ["0.00000000681", "3.43155669169", "4694.00295470760"], ["0.00000000605", "2.47806340546", "10977.07880469900"], ["0.00000000706", "6.19393222575", "4690.47983635860"], ["0.00000000643", "1.98042503148", "801.82093112380"], ["0.00000000502", "1.44394375363", "6836.64525283380"], ["0.00000000490", "2.34129524194", "1592.59601363280"], ["0.00000000458", "1.30876448575", "4292.33083295040"], ["0.00000000431", "0.03526421494", "7234.79425624200"], ["0.00000000379", "3.17030522615", "6309.37416979120"], ["0.00000000348", "0.99049550009", "6040.34724601740"], ["0.00000000386", "1.57019797263", "71430.69561812909"], ["0.00000000347", "0.67013291338", "1059.38193018920"], ["0.00000000458", "3.81499443681", "149854.40013480789"], ["0.00000000302", "1.91760044838", "10447.38783960440"], ["0.00000000307", "3.55343347416", "8031.09226305840"], ["0.00000000395", "4.93701776616", "7632.94325965020"], ["0.00000000314", "3.18093696547", "2352.86615377180"], ["0.00000000282", "4.41936437052", "9437.76293488700"], ["0.00000000276", "2.71314254553", "3894.18182954220"], ["0.00000000298", "2.52037474210", "6127.65545055720"], ["0.00000000230", "1.37790215549", "4705.73230754360"], ["0.00000000252", "0.55330133471", "6279.55273164240"], ["0.00000000255", "5.26570187369", "6812.76681508600"], ["0.00000000275", "0.67264264272", "25132.30339996560"], ["0.00000000178", "0.92820785174", "1990.74501704100"], ["0.00000000221", "0.63897368842", "6256.77753019160"], ["0.00000000155", "0.77319790838", "14143.49524243060"], ["0.00000000150", "2.40470465561", "426.59819087600"], ["0.00000000196", "6.06877865012", "640.87760738220"], ["0.00000000137", "2.21679460145", "8429.24126646660"], ["0.00000000127", "3.26094223174", "17789.84561978500"], ["0.00000000128", "5.47237279946", "12036.46073488820"], ["0.00000000122", "2.16291082757", "10213.28554621100"], ["0.00000000118", "0.45789822268", "7058.59846131540"], ["0.00000000141", "2.34932647403", "11506.76976979360"], ["0.00000000100", "0.85621569847", "6290.18939699220"], ["0.00000000092", "5.10587476002", "7079.37385680780"], ["0.00000000126", "2.65428307012", "88860.05707098669"], ["0.00000000106", "5.85646710022", "7860.41939243920"], ["0.00000000084", "3.57457554262", "16730.46368959580"], ["0.00000000089", "4.21433259618", "83996.84731811189"], ["0.00000000097", "5.57938280855", "13367.97263110660"], ["0.00000000102", "2.05853060226", "87.30820453981"], ["0.00000000080", "4.73792651816", "11926.25441366880"], ["0.00000000080", "5.41418965044", "10973.55568635000"], ["0.00000000106", "4.10978997399", "3496.03282613400"], ["0.00000000102", "3.62650006043", "244287.60000722769"], ["0.00000000075", "4.89483161769", "5643.17856367740"], ["0.00000000087", "0.42863750683", "11015.10647733480"], ["0.00000000069", "1.88908760720", "10177.25767953360"], ["0.00000000089", "1.35567273119", "6681.22485339960"], ["0.00000000066", "0.99455837265", "6525.80445396540"], ["0.00000000067", "5.51240997070", "3097.88382272579"], ["0.00000000076", "2.72016814799", "4164.31198961300"], ["0.00000000063", "1.44349902540", "9917.69687450980"], ["0.00000000078", "3.51469733747", "11856.21865142450"], ["0.00000000085", "0.50956043858", "10575.40668294180"], ["0.00000000067", "3.62043033405", "16496.36139620240"], ["0.00000000055", "5.24637517308", "3340.61242669980"], ["0.00000000048", "5.43966777314", "20426.57109242200"], ["0.00000000064", "5.79535817813", "2388.89402044920"], ["0.00000000046", "5.43499966519", "6275.96230299060"], ["0.00000000050", "3.86263598617", "5729.50644714900"], ["0.00000000044", "1.52269529228", "12168.00269657460"], ["0.00000000057", "4.96352373486", "14945.31617355440"], ["0.00000000045", "1.00861230160", "8635.94200376320"], ["0.00000000043", "3.30685683359", "9779.10867612540"], ["0.00000000042", "0.63481258930", "2699.73481931760"], ["0.00000000041", "5.67996766641", "11712.95531823080"], ["0.00000000056", "4.34024451468", "90955.55169449610"], ["0.00000000041", "5.81722212845", "709.93304855830"], ["0.00000000053", "6.17052087143", "233141.31440436149"], ["0.00000000037", "3.12495025087", "16200.77272450120"], ["0.00000000035", "5.76973458495", "12569.67481833180"], ["0.00000000037", "0.31656444326", "24356.78078864160"], ["0.00000000035", "0.96229051027", "17298.18232732620"], ["0.00000000033", "5.23130355867", "5331.35744374080"], ["0.00000000035", "0.62517020593", "25158.60171976540"], ["0.00000000035", "0.80004512129", "13916.01910964160"], ["0.00000000037", "2.89336088688", "12721.57209941700"], ["0.00000000030", "4.50198402401", "23543.23050468179"], ["0.00000000030", "5.31355708693", "18319.53658487960"], ["0.00000000029", "3.47275229977", "13119.72110282519"], ["0.00000000029", "3.11002782516", "4136.91043351620"], ["0.00000000032", "5.52273255667", "5753.38488489680"], ["0.00000000035", "3.79699996680", "143571.32428481648"], ["0.00000000026", "1.50634201907", "154717.60988768269"], ["0.00000000030", "3.53519084118", "6284.05617105960"], ["0.00000000023", "4.41808025967", "5884.92684658320"], ["0.00000000025", "1.38477355808", "65147.61976813770"], ["0.00000000023", "3.49782549797", "7477.52286021600"], ["0.00000000019", "3.14329413716", "6496.37494542940"], ["0.00000000019", "2.20135125199", "18073.70493865020"], ["0.00000000019", "4.95020255309", "3930.20969621960"], ["0.00000000019", "0.57998702747", "31415.37924995700"], ["0.00000000021", "1.75474323399", "12139.55350910680"], ["0.00000000019", "3.92233070499", "19651.04848109800"], ["0.00000000014", "0.98131213224", "12559.03815298200"], ["0.00000000019", "4.93309333729", "2942.46342329160"], ["0.00000000016", "5.55997534558", "8827.39026987480"], ["0.00000000013", "1.68808165516", "4535.05943692440"], ["0.00000000013", "0.33982116161", "4933.20844033260"], ["0.00000000012", "1.85426309994", "5856.47765911540"], ["0.00000000010", "4.82763996845", "13095.84266507740"], ["0.00000000011", "5.38005490571", "11790.62908865880"], ["0.00000000010", "1.40815507226", "10988.80815753500"], ["0.00000000011", "3.05005267431", "17260.15465469040"], ["0.00000000010", "4.93364992366", "12352.85260454480"]], [["0.00000289226", "5.84384198723", "6283.07584999140"], ["0.00000034955", "0.00000000000", "0.00000000000"], ["0.00000016819", "5.48766912348", "12566.15169998280"], ["0.00000002962", "5.19577265202", "155.42039943420"], ["0.00000001288", "4.72200252235", "3.52311834900"], ["0.00000000635", "5.96925937141", "242.72860397400"], ["0.00000000714", "5.30045809128", "18849.22754997420"], ["0.00000000402", "3.78682982419", "553.56940284240"], ["0.00000000072", "4.29768126180", "6286.59896834040"], ["0.00000000067", "0.90721687647", "6127.65545055720"], ["0.00000000036", "5.24029648014", "6438.49624942560"], ["0.00000000024", "5.16003960716", "25132.30339996560"], ["0.00000000023", "3.01921570335", "6309.37416979120"], ["0.00000000017", "5.82863573502", "6525.80445396540"], ["0.00000000017", "3.67772863930", "71430.69561812909"], ["0.00000000009", "4.58467294499", "1577.34354244780"], ["0.00000000008", "1.40626662824", "11856.21865142450"], ["0.00000000008", "5.07561257196", "6256.77753019160"], ["0.00000000007", "2.82473374405", "83996.84731811189"], ["0.00000000005", "2.71488713339", "10977.07880469900"], ["0.00000000005", "3.76879847273", "12036.46073488820"], ["0.00000000005", "4.28412873331", "6275.96230299060"]], [["0.00000114084", "3.14159265359", "0.00000000000"], ["0.00000007717", "4.13446589358", "6283.07584999140"], ["0.00000000765", "3.83803776214", "12566.15169998280"], ["0.00000000420", "0.41925861858", "155.42039943420"], ["0.00000000040", "3.59847585840", "18849.22754997420"], ["0.00000000041", "3.14398414077", "3.52311834900"], ["0.00000000035", "5.00298940826", "5573.14280143310"], ["0.00000000013", "0.48794833701", "77713.77146812050"], ["0.00000000010", "5.64801766350", "6127.65545055720"], ["0.00000000008", "2.84160570605", "161000.68573767410"], ["0.00000000002", "0.54912904658", "6438.49624942560"]], [["0.00000000878", "3.14159265359", "0.00000000000"], ["0.00000000172", "2.76579069510", "6283.07584999140"], ["0.00000000050", "2.01353298182", "155.42039943420"], ["0.00000000028", "2.21496423926", "12566.15169998280"], ["0.00000000005", "1.75600058765", "18849.22754997420"]]], b: [[["0.00000279620", "3.19870156017", "84334.66158130829"], ["0.00000101643", "5.42248619256", "5507.55323866740"], ["0.00000080445", "3.88013204458", "5223.69391980220"], ["0.00000043806", "3.70444689758", "2352.86615377180"], ["0.00000031933", "4.00026369781", "1577.34354244780"], ["0.00000022724", "3.98473831560", "1047.74731175470"], ["0.00000016392", "3.56456119782", "5856.47765911540"], ["0.00000018141", "4.98367470263", "6283.07584999140"], ["0.00000014443", "3.70275614914", "9437.76293488700"], ["0.00000014304", "3.41117857525", "10213.28554621100"], ["0.00000011246", "4.82820690530", "14143.49524243060"], ["0.00000010900", "2.08574562327", "6812.76681508600"], ["0.00000009714", "3.47303947752", "4694.00295470760"], ["0.00000010367", "4.05663927946", "71092.88135493269"], ["0.00000008775", "4.44016515669", "5753.38488489680"], ["0.00000008366", "4.99251512180", "7084.89678111520"], ["0.00000006921", "4.32559054073", "6275.96230299060"], ["0.00000009145", "1.14182646613", "6620.89011318780"], ["0.00000007194", "3.60193205752", "529.69096509460"], ["0.00000007698", "5.55425745881", "167621.57585086189"], ["0.00000005285", "2.48446991566", "4705.73230754360"], ["0.00000005208", "6.24992674537", "18073.70493865020"], ["0.00000004529", "2.33827747356", "6309.37416979120"], ["0.00000005579", "4.41023653738", "7860.41939243920"], ["0.00000004743", "0.70995680136", "5884.92684658320"], ["0.00000004301", "1.10255777773", "6681.22485339960"], ["0.00000003849", "1.82229412531", "5486.77784317500"], ["0.00000004093", "5.11700141207", "13367.97263110660"], ["0.00000003681", "0.43793170356", "3154.68708489560"], ["0.00000003420", "5.42034800952", "6069.77675455340"], ["0.00000003617", "6.04641937526", "3930.20969621960"], ["0.00000003670", "4.58210192227", "12194.03291462090"], ["0.00000002918", "1.95463881126", "10977.07880469900"], ["0.00000002797", "5.61259275048", "11790.62908865880"], ["0.00000002502", "0.60499729367", "6496.37494542940"], ["0.00000002319", "5.01648216014", "1059.38193018920"], ["0.00000002684", "1.39470396488", "22003.91463486980"], ["0.00000002428", "3.24183056052", "78051.58573131690"], ["0.00000002120", "4.30691000285", "5643.17856367740"], ["0.00000002257", "3.15557225618", "90617.73743129970"], ["0.00000001813", "3.75574218285", "3340.61242669980"], ["0.00000002226", "2.79699346659", "12036.46073488820"], ["0.00000001888", "0.86991545823", "8635.94200376320"], ["0.00000001517", "1.95852055701", "398.14900340820"], ["0.00000001581", "3.19976230948", "5088.62883976680"], ["0.00000001421", "6.25530883827", "2544.31441988340"], ["0.00000001595", "0.25619915135", "17298.18232732620"], ["0.00000001391", "4.69964175561", "7058.59846131540"], ["0.00000001478", "2.81808207569", "25934.12433108940"], ["0.00000001481", "3.65823554806", "11506.76976979360"], ["0.00000001693", "4.95689385293", "156475.29024799570"], ["0.00000001183", "1.29343061246", "775.52261132400"], ["0.00000001114", "2.37889311846", "3738.76143010800"], ["0.00000000994", "4.30088900425", "9225.53927328300"], ["0.00000000924", "3.06451026812", "4164.31198961300"], ["0.00000000867", "0.55606931068", "8429.24126646660"], ["0.00000000988", "5.97286104208", "7079.37385680780"], ["0.00000000824", "1.50984806173", "10447.38783960440"], ["0.00000000915", "0.12635654592", "11015.10647733480"], ["0.00000000742", "1.99159139281", "26087.90314157420"], ["0.00000001039", "3.14159265359", "0.00000000000"], ["0.00000000850", "4.24120016095", "29864.33402730900"], ["0.00000000755", "2.89631873320", "4732.03062734340"], ["0.00000000714", "1.37548118603", "2146.16541647520"], ["0.00000000708", "1.91406542362", "8031.09226305840"], ["0.00000000746", "0.57893808616", "796.29800681640"], ["0.00000000802", "5.12339137230", "2942.46342329160"], ["0.00000000751", "1.67479850166", "21228.39202354580"], ["0.00000000602", "4.09976538826", "64809.80550494129"], ["0.00000000594", "3.49580704962", "16496.36139620240"], ["0.00000000592", "4.59481504319", "4690.47983635860"], ["0.00000000530", "5.73979295200", "8827.39026987480"], ["0.00000000503", "5.66433137112", "33794.54372352860"], ["0.00000000483", "1.57106522411", "801.82093112380"], ["0.00000000438", "0.06707733767", "3128.38876509580"], ["0.00000000423", "2.86944595927", "12566.15169998280"], ["0.00000000504", "3.26207669160", "7632.94325965020"], ["0.00000000552", "1.02926440457", "239762.20451754928"], ["0.00000000427", "3.67434378210", "213.29909543800"], ["0.00000000404", "1.46193297142", "15720.83878487840"], ["0.00000000503", "4.85802444134", "6290.18939699220"], ["0.00000000417", "0.81920713533", "5216.58037280140"], ["0.00000000365", "0.01002966162", "12168.00269657460"], ["0.00000000363", "1.28376436579", "6206.80977871580"], ["0.00000000353", "4.70059133110", "7234.79425624200"], ["0.00000000415", "0.96862624175", "4136.91043351620"], ["0.00000000387", "3.09145061418", "25158.60171976540"], ["0.00000000373", "2.65119262792", "7342.45778018060"], ["0.00000000361", "2.97762937739", "9623.68827669120"], ["0.00000000418", "3.75759994446", "5230.80746680300"], ["0.00000000396", "1.22507712354", "6438.49624942560"], ["0.00000000322", "1.21162178805", "8662.24032356300"], ["0.00000000284", "5.64170320068", "1589.07289528380"], ["0.00000000379", "1.72248432748", "14945.31617355440"], ["0.00000000320", "3.94161159962", "7330.82316174610"], ["0.00000000313", "5.47602376446", "1194.44701022460"], ["0.00000000292", "1.38971327603", "11769.85369316640"], ["0.00000000305", "0.80429352049", "37724.75341974820"], ["0.00000000257", "5.81382809757", "426.59819087600"], ["0.00000000265", "6.10358507671", "6836.64525283380"], ["0.00000000250", "4.56452895547", "7477.52286021600"], ["0.00000000266", "2.62926282354", "7238.67559160000"], ["0.00000000263", "6.22089501237", "6133.51265285680"], ["0.00000000306", "2.79682380531", "1748.01641306700"], ["0.00000000236", "2.46093023714", "11371.70468975820"], ["0.00000000316", "1.62662805006", "250908.49012041549"], ["0.00000000216", "3.68721275185", "5849.36411211460"], ["0.00000000230", "0.36165162947", "5863.59120611620"], ["0.00000000233", "5.03509933858", "20426.57109242200"], ["0.00000000200", "5.86073159059", "4535.05943692440"], ["0.00000000277", "4.65400292395", "82239.16695779889"], ["0.00000000209", "3.72323200804", "10973.55568635000"], ["0.00000000199", "5.05186622555", "5429.87946823940"], ["0.00000000256", "2.40923279770", "19651.04848109800"], ["0.00000000210", "4.50691909144", "29088.81141598500"], ["0.00000000181", "6.00294783127", "4292.33083295040"], ["0.00000000249", "0.12900984422", "154379.79562448629"], ["0.00000000209", "3.87759458598", "17789.84561978500"], ["0.00000000225", "3.18339652605", "18875.52586977400"], ["0.00000000191", "4.53897489299", "18477.10876461230"], ["0.00000000172", "2.09694183014", "13095.84266507740"], ["0.00000000182", "3.16107943500", "16730.46368959580"], ["0.00000000188", "2.22746128596", "41654.96311596780"], ["0.00000000164", "5.18686275017", "5481.25491886760"], ["0.00000000160", "2.49298855159", "12592.45001978260"], ["0.00000000155", "1.59595438230", "10021.83728009940"], ["0.00000000135", "0.21349051064", "10988.80815753500"], ["0.00000000178", "3.80375177970", "23581.25817731760"], ["0.00000000123", "1.66800739151", "15110.46611986620"], ["0.00000000122", "2.72678272244", "18849.22754997420"], ["0.00000000126", "1.17675512910", "14919.01785375460"], ["0.00000000142", "3.95053441332", "337.81426319640"], ["0.00000000116", "6.06340906229", "6709.67404086740"], ["0.00000000137", "3.52143246757", "12139.55350910680"], ["0.00000000136", "2.92179113542", "32217.20018108080"], ["0.00000000110", "3.51203379263", "18052.92954315780"], ["0.00000000147", "4.63371971408", "22805.73556599360"], ["0.00000000108", "5.45280814878", "7.11354700080"], ["0.00000000148", "0.65447253687", "95480.94718417450"], ["0.00000000119", "5.92110458985", "33019.02111220460"], ["0.00000000110", "5.34824206306", "639.89728631400"], ["0.00000000106", "3.71081682629", "14314.16811304980"], ["0.00000000139", "6.17607198418", "24356.78078864160"], ["0.00000000118", "5.59738712670", "161338.50000087050"], ["0.00000000117", "3.65065271640", "45585.17281218740"], ["0.00000000127", "4.74596574209", "49515.38250840700"], ["0.00000000120", "1.04211499785", "6915.85958930460"], ["0.00000000120", "5.60638811846", "5650.29211067820"], ["0.00000000115", "3.10668213289", "14712.31711645800"], ["0.00000000099", "0.69018940049", "12779.45079542080"], ["0.00000000097", "1.07908724794", "9917.69687450980"], ["0.00000000093", "2.62295197319", "17260.15465469040"], ["0.00000000099", "4.45774681732", "4933.20844033260"], ["0.00000000123", "1.37488922089", "28286.99048486120"], ["0.00000000121", "5.19767249813", "27511.46787353720"], ["0.00000000105", "0.87192267806", "77375.95720492408"], ["0.00000000087", "3.93637812950", "17654.78053974960"], ["0.00000000122", "2.23956068680", "83997.09113559539"], ["0.00000000087", "4.18201600952", "22779.43724619380"], ["0.00000000104", "4.59580877295", "1349.86740965880"], ["0.00000000102", "2.83545248411", "12352.85260454480"], ["0.00000000102", "3.97386522171", "10818.13528691580"], ["0.00000000101", "4.32892825857", "36147.40987730040"], ["0.00000000094", "5.00001709261", "150192.21439800429"], ["0.00000000077", "3.97199369296", "1592.59601363280"], ["0.00000000100", "6.07733097102", "26735.94526221320"], ["0.00000000086", "5.26029638250", "28313.28880466100"], ["0.00000000093", "4.31900620254", "44809.65020086340"], ["0.00000000076", "6.22743405935", "13521.75144159140"], ["0.00000000072", "1.55820597747", "6256.77753019160"], ["0.00000000082", "4.95202664555", "10575.40668294180"], ["0.00000000082", "1.69647647075", "1990.74501704100"], ["0.00000000075", "2.29836095644", "3634.62102451840"], ["0.00000000075", "2.66367876557", "16200.77272450120"], ["0.00000000087", "0.26630214764", "31441.67756975680"], ["0.00000000077", "2.25530954137", "5235.32853823670"], ["0.00000000076", "1.09869730846", "12903.96596317920"], ["0.00000000058", "4.28246138307", "12559.03815298200"], ["0.00000000064", "5.51112830114", "173904.65170085328"], ["0.00000000056", "2.60133794851", "73188.37597844210"], ["0.00000000055", "5.81483150022", "143233.51002162008"], ["0.00000000054", "3.38482031504", "323049.11878710288"], ["0.00000000039", "3.28500401343", "71768.50988132549"], ["0.00000000039", "3.11239910690", "96900.81328129109"]], [["0.00000009030", "3.89729061890", "5507.55323866740"], ["0.00000006177", "1.73038850355", "5223.69391980220"], ["0.00000003800", "5.24404145734", "2352.86615377180"], ["0.00000002834", "2.47345037450", "1577.34354244780"], ["0.00000001817", "0.41874743765", "6283.07584999140"], ["0.00000001499", "1.83320979291", "5856.47765911540"], ["0.00000001466", "5.69401926017", "5753.38488489680"], ["0.00000001301", "2.18890066314", "9437.76293488700"], ["0.00000001233", "4.95222451476", "10213.28554621100"], ["0.00000001021", "0.12866660208", "7860.41939243920"], ["0.00000000982", "0.09005453285", "14143.49524243060"], ["0.00000000865", "1.73949953555", "3930.20969621960"], ["0.00000000581", "2.26949174067", "5884.92684658320"], ["0.00000000524", "5.65662503159", "529.69096509460"], ["0.00000000473", "6.22750969242", "6309.37416979120"], ["0.00000000451", "1.53288619213", "18073.70493865020"], ["0.00000000364", "3.61614477374", "13367.97263110660"], ["0.00000000372", "3.22470721320", "6275.96230299060"], ["0.00000000268", "2.34341267879", "11790.62908865880"], ["0.00000000322", "0.94084045832", "6069.77675455340"], ["0.00000000232", "0.26781182579", "7058.59846131540"], ["0.00000000216", "6.05952221329", "10977.07880469900"], ["0.00000000232", "2.93325646109", "22003.91463486980"], ["0.00000000204", "3.86264841382", "6496.37494542940"], ["0.00000000202", "2.81892511133", "15720.83878487840"], ["0.00000000185", "4.93512381859", "12036.46073488820"], ["0.00000000220", "3.99305643742", "6812.76681508600"], ["0.00000000166", "1.74970002999", "11506.76976979360"], ["0.00000000212", "1.57166285369", "4694.00295470760"], ["0.00000000157", "1.08259734788", "5643.17856367740"], ["0.00000000154", "5.99434678412", "5486.77784317500"], ["0.00000000144", "5.23285656085", "78051.58573131690"], ["0.00000000144", "1.16454655948", "90617.73743129970"], ["0.00000000137", "2.67760436027", "6290.18939699220"], ["0.00000000180", "2.06509026215", "7084.89678111520"], ["0.00000000121", "5.90212574947", "9225.53927328300"], ["0.00000000150", "2.00175038718", "5230.80746680300"], ["0.00000000149", "5.06157254516", "17298.18232732620"], ["0.00000000118", "5.39979058038", "3340.61242669980"], ["0.00000000161", "3.32421999691", "6283.31966747490"], ["0.00000000121", "4.36722193162", "19651.04848109800"], ["0.00000000116", "5.83462858507", "4705.73230754360"], ["0.00000000128", "4.35489873365", "25934.12433108940"], ["0.00000000143", "0.00000000000", "0.00000000000"], ["0.00000000109", "2.52157834166", "6438.49624942560"], ["0.00000000099", "2.70727488041", "5216.58037280140"], ["0.00000000103", "0.93782340879", "8827.39026987480"], ["0.00000000082", "4.29214680390", "8635.94200376320"], ["0.00000000079", "2.24085737326", "1059.38193018920"], ["0.00000000097", "5.50959692365", "29864.33402730900"], ["0.00000000072", "0.21891639822", "21228.39202354580"], ["0.00000000071", "2.86755026812", "6681.22485339960"], ["0.00000000074", "2.20184828895", "37724.75341974820"], ["0.00000000063", "4.45586625948", "7079.37385680780"], ["0.00000000061", "0.63918772258", "33794.54372352860"], ["0.00000000047", "2.09070235724", "3128.38876509580"], ["0.00000000047", "3.32543843300", "26087.90314157420"], ["0.00000000049", "1.60680905005", "6702.56049386660"], ["0.00000000057", "0.11215813438", "29088.81141598500"], ["0.00000000056", "5.47982934911", "775.52261132400"], ["0.00000000050", "1.89396788463", "12139.55350910680"], ["0.00000000047", "2.97214907240", "20426.57109242200"], ["0.00000000041", "5.55329394890", "11015.10647733480"], ["0.00000000041", "5.91861144924", "23581.25817731760"], ["0.00000000045", "4.95273290181", "5863.59120611620"], ["0.00000000050", "3.62740835096", "41654.96311596780"], ["0.00000000037", "6.09033460601", "64809.80550494129"], ["0.00000000037", "5.86153655431", "12566.15169998280"], ["0.00000000046", "1.65798680284", "25158.60171976540"], ["0.00000000038", "2.00673650251", "426.59819087600"], ["0.00000000036", "6.24373396652", "6283.14316029419"], ["0.00000000036", "0.40465162918", "6283.00853968860"], ["0.00000000032", "6.03707103538", "2942.46342329160"], ["0.00000000041", "4.86809570283", "1592.59601363280"], ["0.00000000028", "4.38359423735", "7632.94325965020"], ["0.00000000028", "6.03334294232", "17789.84561978500"], ["0.00000000026", "3.88971333608", "5331.35744374080"], ["0.00000000026", "5.94932724051", "16496.36139620240"], ["0.00000000031", "1.44666331503", "16730.46368959580"], ["0.00000000026", "6.26376705837", "23543.23050468179"], ["0.00000000033", "0.93797239147", "213.29909543800"], ["0.00000000026", "3.71858432944", "13095.84266507740"], ["0.00000000027", "0.60565274405", "10988.80815753500"], ["0.00000000023", "4.44388985550", "18849.22754997420"], ["0.00000000028", "1.53862289477", "6279.48542133960"], ["0.00000000028", "1.96831814872", "6286.66627864320"], ["0.00000000028", "5.78094918529", "15110.46611986620"], ["0.00000000026", "2.48165809843", "5729.50644714900"], ["0.00000000020", "3.85655029499", "9623.68827669120"], ["0.00000000021", "5.83006047147", "7234.79425624200"], ["0.00000000021", "0.69628570421", "398.14900340820"], ["0.00000000022", "5.02222806555", "6127.65545055720"], ["0.00000000020", "3.47611265290", "6148.01076995600"], ["0.00000000020", "0.90769829044", "5481.25491886760"], ["0.00000000020", "0.03081589303", "6418.14093002680"], ["0.00000000020", "3.74220084927", "1589.07289528380"], ["0.00000000021", "4.00149269576", "3154.68708489560"], ["0.00000000018", "1.58348238359", "2118.76386037840"], ["0.00000000019", "0.85407021371", "14712.31711645800"]], [["0.00000001662", "1.62703209173", "84334.66158130829"], ["0.00000000492", "2.41382223971", "1047.74731175470"], ["0.00000000344", "2.24353004539", "5507.55323866740"], ["0.00000000258", "6.00906896311", "5223.69391980220"], ["0.00000000131", "0.95447345240", "6283.07584999140"], ["0.00000000086", "1.67530247303", "7860.41939243920"], ["0.00000000090", "0.97606804452", "1577.34354244780"], ["0.00000000090", "0.37899871725", "2352.86615377180"], ["0.00000000089", "6.25807507963", "10213.28554621100"], ["0.00000000075", "0.84213523741", "167621.57585086189"], ["0.00000000052", "1.70501566089", "14143.49524243060"], ["0.00000000057", "6.15295833679", "12194.03291462090"], ["0.00000000051", "1.27616016740", "5753.38488489680"], ["0.00000000051", "5.37229738682", "6812.76681508600"], ["0.00000000034", "1.73672994279", "7058.59846131540"], ["0.00000000038", "2.77761031485", "10988.80815753500"], ["0.00000000046", "3.38617099014", "156475.29024799570"], ["0.00000000021", "1.95248349228", "8827.39026987480"], ["0.00000000018", "3.33419222028", "8429.24126646660"], ["0.00000000019", "4.32945160287", "17789.84561978500"], ["0.00000000017", "0.66191210656", "6283.00853968860"], ["0.00000000018", "3.74885333072", "11769.85369316640"], ["0.00000000017", "4.23058370776", "10977.07880469900"], ["0.00000000017", "1.78116162721", "5486.77784317500"], ["0.00000000021", "1.36972913918", "12036.46073488820"], ["0.00000000017", "2.79601092529", "796.29800681640"], ["0.00000000015", "0.43087848850", "11790.62908865880"], ["0.00000000017", "1.35132152761", "78051.58573131690"], ["0.00000000015", "1.17032155085", "213.29909543800"], ["0.00000000018", "2.85221514199", "5088.62883976680"], ["0.00000000017", "0.21780913672", "6283.14316029419"], ["0.00000000013", "1.21201504386", "25132.30339996560"], ["0.00000000012", "1.12953712197", "90617.73743129970"], ["0.00000000012", "5.13714452592", "7079.37385680780"], ["0.00000000013", "3.79842135217", "4933.20844033260"], ["0.00000000012", "4.89407978213", "3738.76143010800"], ["0.00000000015", "6.05682328852", "398.14900340820"], ["0.00000000014", "4.81029291856", "4694.00295470760"], ["0.00000000011", "0.61684523405", "3128.38876509580"], ["0.00000000011", "5.32876538500", "6040.34724601740"], ["0.00000000014", "5.27227350286", "4535.05943692440"], ["0.00000000011", "2.39292099451", "5331.35744374080"], ["0.00000000010", "4.45296532710", "6525.80445396540"], ["0.00000000014", "4.66400985037", "8031.09226305840"], ["0.00000000010", "3.22472385926", "9437.76293488700"], ["0.00000000011", "3.80913404437", "801.82093112380"], ["0.00000000010", "5.15032130575", "11371.70468975820"], ["0.00000000013", "0.98720797401", "5729.50644714900"], ["0.00000000009", "5.94191743597", "7632.94325965020"]], [["0.00000000011", "0.23877262399", "7860.41939243920"], ["0.00000000009", "1.16069982609", "5507.55323866740"], ["0.00000000008", "1.65357552925", "5884.92684658320"], ["0.00000000008", "2.86720038197", "7058.59846131540"], ["0.00000000007", "3.04818741666", "5486.77784317500"], ["0.00000000007", "2.59437103785", "529.69096509460"], ["0.00000000008", "4.02863090524", "6256.77753019160"], ["0.00000000008", "2.42003508927", "5753.38488489680"], ["0.00000000006", "0.84181087594", "6275.96230299060"], ["0.00000000006", "5.40160929468", "1577.34354244780"], ["0.00000000007", "2.73399865247", "6309.37416979120"]], [["0.00000000004", "0.79662198849", "6438.49624942560"], ["0.00000000005", "0.84308705203", "1047.74731175470"], ["0.00000000005", "0.05711572303", "84334.66158130829"], ["0.00000000003", "3.46779895686", "6279.55273164240"], ["0.00000000003", "2.89822201212", "6127.65545055720"]]], r: [[["1.00013988799", "0.00000000000", "0.00000000000"], ["0.01670699626", "3.09846350771", "6283.07584999140"], ["0.00013956023", "3.05524609620", "12566.15169998280"], ["0.00003083720", "5.19846674381", "77713.77146812050"], ["0.00001628461", "1.17387749012", "5753.38488489680"], ["0.00001575568", "2.84685245825", "7860.41939243920"], ["0.00000924799", "5.45292234084", "11506.76976979360"], ["0.00000542444", "4.56409149777", "3930.20969621960"], ["0.00000472110", "3.66100022149", "5884.92684658320"], ["0.00000328780", "5.89983646482", "5223.69391980220"], ["0.00000345983", "0.96368617687", "5507.55323866740"], ["0.00000306784", "0.29867139512", "5573.14280143310"], ["0.00000174844", "3.01193636534", "18849.22754997420"], ["0.00000243189", "4.27349536153", "11790.62908865880"], ["0.00000211829", "5.84714540314", "1577.34354244780"], ["0.00000185752", "5.02194447178", "10977.07880469900"], ["0.00000109835", "5.05510636285", "5486.77784317500"], ["0.00000098316", "0.88681311277", "6069.77675455340"], ["0.00000086499", "5.68959778254", "15720.83878487840"], ["0.00000085825", "1.27083733351", "161000.68573767410"], ["0.00000062916", "0.92177108832", "529.69096509460"], ["0.00000057056", "2.01374292014", "83996.84731811189"], ["0.00000064903", "0.27250613787", "17260.15465469040"], ["0.00000049384", "3.24501240359", "2544.31441988340"], ["0.00000055736", "5.24159798933", "71430.69561812909"], ["0.00000042515", "6.01110242003", "6275.96230299060"], ["0.00000046963", "2.57805070386", "775.52261132400"], ["0.00000038968", "5.36071738169", "4694.00295470760"], ["0.00000044661", "5.53715807302", "9437.76293488700"], ["0.00000035660", "1.67468058995", "12036.46073488820"], ["0.00000031921", "0.18368229781", "5088.62883976680"], ["0.00000031846", "1.77775642085", "398.14900340820"], ["0.00000033193", "0.24370300098", "7084.89678111520"], ["0.00000038245", "2.39255343974", "8827.39026987480"], ["0.00000028464", "1.21344868176", "6286.59896834040"], ["0.00000037490", "0.82952922332", "19651.04848109800"], ["0.00000036957", "4.90107591914", "12139.55350910680"], ["0.00000034537", "1.84270693282", "2942.46342329160"], ["0.00000026275", "4.58896850401", "10447.38783960440"], ["0.00000024596", "3.78660875483", "8429.24126646660"], ["0.00000023587", "0.26866117066", "796.29800681640"], ["0.00000027793", "1.89934330904", "6279.55273164240"], ["0.00000023927", "4.99598548138", "5856.47765911540"], ["0.00000020349", "4.65267995431", "2146.16541647520"], ["0.00000023287", "2.80783650928", "14143.49524243060"], ["0.00000022103", "1.95004702988", "3154.68708489560"], ["0.00000019506", "5.38227371393", "2352.86615377180"], ["0.00000017958", "0.19871379385", "6812.76681508600"], ["0.00000017174", "4.43315560735", "10213.28554621100"], ["0.00000016190", "5.23160507859", "17789.84561978500"], ["0.00000017314", "6.15200787916", "16730.46368959580"], ["0.00000013814", "5.18962074032", "8031.09226305840"], ["0.00000018833", "0.67306674027", "149854.40013480789"], ["0.00000018331", "2.25348733734", "23581.25817731760"], ["0.00000013641", "3.68516118804", "4705.73230754360"], ["0.00000013139", "0.65289581324", "13367.97263110660"], ["0.00000010414", "4.33285688538", "11769.85369316640"], ["0.00000009978", "4.20126336355", "6309.37416979120"], ["0.00000010169", "1.59390681369", "4690.47983635860"], ["0.00000007564", "2.62560597390", "6256.77753019160"], ["0.00000009661", "3.67586791220", "27511.46787353720"], ["0.00000006743", "0.56270332741", "3340.61242669980"], ["0.00000008743", "6.06359123461", "1748.01641306700"], ["0.00000007786", "3.67371235637", "12168.00269657460"], ["0.00000006633", "5.66149277792", "11371.70468975820"], ["0.00000007712", "0.31242577789", "7632.94325965020"], ["0.00000006592", "3.13576266188", "801.82093112380"], ["0.00000007460", "5.64757188143", "11926.25441366880"], ["0.00000006933", "2.92384586400", "6681.22485339960"], ["0.00000006802", "1.42329806420", "23013.53953958720"], ["0.00000006115", "5.13393615454", "1194.44701022460"], ["0.00000006477", "2.64986648492", "19804.82729158280"], ["0.00000005233", "4.62434053374", "6438.49624942560"], ["0.00000006147", "3.02863936662", "233141.31440436149"], ["0.00000004608", "1.72194702724", "7234.79425624200"], ["0.00000004221", "1.55697533729", "7238.67559160000"], ["0.00000005314", "2.40716580847", "11499.65622279280"], ["0.00000005128", "5.32398965690", "11513.88331679440"], ["0.00000004770", "0.25554312006", "11856.21865142450"], ["0.00000005519", "2.09089154502", "17298.18232732620"], ["0.00000005625", "4.34052903053", "90955.55169449610"], ["0.00000004578", "4.46569641570", "5746.27133789600"], ["0.00000003788", "4.90729383510", "4164.31198961300"], ["0.00000005337", "5.09957905104", "31441.67756975680"], ["0.00000003967", "1.20054555174", "1349.86740965880"], ["0.00000004008", "3.03007204392", "1059.38193018920"], ["0.00000003476", "0.76080277030", "10973.55568635000"], ["0.00000004232", "1.05485713117", "5760.49843189760"], ["0.00000004582", "3.76570026763", "6386.16862421000"], ["0.00000003335", "3.13829943354", "6836.64525283380"], ["0.00000003418", "3.00072390334", "4292.33083295040"], ["0.00000003598", "5.70718084323", "5643.17856367740"], ["0.00000003237", "4.16448773994", "9917.69687450980"], ["0.00000004154", "2.59941292162", "7058.59846131540"], ["0.00000003362", "4.54577697964", "4732.03062734340"], ["0.00000002978", "1.30561268820", "6283.14316029419"], ["0.00000002765", "0.51311975679", "26.29831979980"], ["0.00000002802", "5.66263240521", "8635.94200376320"], ["0.00000002927", "5.73787481548", "16200.77272450120"], ["0.00000003164", "1.69140262657", "11015.10647733480"], ["0.00000002598", "2.96244118586", "25132.30339996560"], ["0.00000003519", "3.62639325753", "244287.60000722769"], ["0.00000002676", "4.20725700850", "18073.70493865020"], ["0.00000002978", "1.74971565805", "6283.00853968860"], ["0.00000002287", "1.06975704977", "14314.16811304980"], ["0.00000002863", "5.92838131397", "14712.31711645800"], ["0.00000003071", "0.23793217002", "35371.88726597640"], ["0.00000002656", "0.89959301780", "12352.85260454480"], ["0.00000002415", "2.79975176257", "709.93304855830"], ["0.00000002814", "3.51488206882", "21228.39202354580"], ["0.00000001977", "2.61358297550", "951.71840625060"], ["0.00000002548", "2.47684686575", "6208.29425142410"], ["0.00000001999", "0.56090388160", "7079.37385680780"], ["0.00000002305", "1.05376461628", "22483.84857449259"], ["0.00000001855", "2.86090681163", "5216.58037280140"], ["0.00000002157", "1.31396741861", "154717.60988768269"], ["0.00000001970", "4.36929875289", "167283.76158766549"], ["0.00000001635", "5.85571606764", "10984.19235169980"], ["0.00000001754", "2.14452408833", "6290.18939699220"], ["0.00000002154", "6.03828341543", "10873.98603048040"], ["0.00000001714", "3.70157691113", "1592.59601363280"], ["0.00000001541", "6.21598380732", "23543.23050468179"], ["0.00000001611", "1.99824499377", "10969.96525769820"], ["0.00000001712", "1.34295663542", "3128.38876509580"], ["0.00000001642", "5.55026665339", "6496.37494542940"], ["0.00000001502", "5.43948825854", "155.42039943420"], ["0.00000001827", "5.91227480261", "3738.76143010800"], ["0.00000001726", "2.16764983583", "10575.40668294180"], ["0.00000001532", "5.35683107070", "13521.75144159140"], ["0.00000001829", "1.66006148731", "39302.09696219600"], ["0.00000001605", "1.90928637633", "6133.51265285680"], ["0.00000001282", "2.46014880418", "13916.01910964160"], ["0.00000001211", "4.41360631550", "3894.18182954220"], ["0.00000001394", "1.77801929354", "9225.53927328300"], ["0.00000001571", "4.95512957592", "25158.60171976540"], ["0.00000001205", "1.19212540615", "3.52311834900"], ["0.00000001132", "2.69830084955", "6040.34724601740"], ["0.00000001504", "5.77002730341", "18209.33026366019"], ["0.00000001393", "1.62621805428", "5120.60114558360"], ["0.00000001077", "2.93931554233", "17256.63153634140"], ["0.00000001232", "0.71655165307", "143571.32428481648"], ["0.00000001087", "0.99769687939", "955.59974160860"], ["0.00000001068", "5.28472576231", "65147.61976813770"], ["0.00000000980", "5.10949204607", "6172.86952877200"], ["0.00000001169", "3.11664290862", "14945.31617355440"], ["0.00000001202", "4.02992510402", "553.56940284240"], ["0.00000000979", "2.00000879212", "15110.46611986620"], ["0.00000000962", "4.02380771400", "6282.09552892320"], ["0.00000000999", "3.62643002790", "6262.30045449900"], ["0.00000001030", "5.84989900289", "213.29909543800"], ["0.00000001014", "2.84221578218", "8662.24032356300"], ["0.00000001185", "1.51330541132", "17654.78053974960"], ["0.00000000967", "2.67081017562", "5650.29211067820"], ["0.00000001222", "2.65423784904", "88860.05707098669"], ["0.00000000981", "2.36370360283", "6206.80977871580"], ["0.00000001033", "0.13874927606", "11712.95531823080"], ["0.00000001103", "3.08477302937", "43232.30665841560"], ["0.00000000781", "2.53372735932", "16496.36139620240"], ["0.00000001019", "3.04569392376", "6037.24420376200"], ["0.00000000795", "5.80662989111", "5230.80746680300"], ["0.00000000813", "3.57710279439", "10177.25767953360"], ["0.00000000962", "5.31470594766", "6284.05617105960"], ["0.00000000721", "5.96264301567", "12559.03815298200"], ["0.00000000966", "2.74714939953", "6244.94281435360"], ["0.00000000921", "0.10155275926", "29088.81141598500"], ["0.00000000692", "3.89764447548", "1589.07289528380"], ["0.00000000719", "5.91791450402", "4136.91043351620"], ["0.00000000772", "4.05505682353", "6127.65545055720"], ["0.00000000712", "5.49291532439", "22003.91463486980"], ["0.00000000672", "1.60700490811", "11087.28512591840"], ["0.00000000690", "4.50539825563", "426.59819087600"], ["0.00000000854", "3.26104981596", "20426.57109242200"], ["0.00000000656", "4.32410182940", "16858.48253293320"], ["0.00000000840", "2.59572585222", "28766.92442448400"], ["0.00000000692", "0.61650089011", "11403.67699557500"], ["0.00000000700", "3.40901167143", "7.11354700080"], ["0.00000000726", "0.04243053594", "5481.25491886760"], ["0.00000000557", "4.78317696534", "20199.09495963300"], ["0.00000000649", "1.04027912958", "6062.66320755260"], ["0.00000000633", "5.70229959167", "45892.73043315699"], ["0.00000000592", "6.11836729658", "9623.68827669120"], ["0.00000000523", "3.62840021266", "5333.90024102160"], ["0.00000000604", "5.57734696185", "10344.29506538580"], ["0.00000000496", "2.21023499449", "1990.74501704100"], ["0.00000000691", "1.96071732602", "12416.58850284820"], ["0.00000000640", "1.59074172032", "18319.53658487960"], ["0.00000000625", "3.82362791378", "13517.87010623340"], ["0.00000000663", "5.08444996779", "283.85931886520"], ["0.00000000475", "1.17025894287", "12569.67481833180"], ["0.00000000664", "4.50029469969", "47162.51635463520"], ["0.00000000569", "0.16310365162", "17267.26820169119"], ["0.00000000568", "3.86100969474", "6076.89030155420"], ["0.00000000539", "4.83282276086", "18422.62935909819"], ["0.00000000466", "0.75872342878", "7342.45778018060"], ["0.00000000541", "3.07212190507", "226858.23855437008"], ["0.00000000458", "0.26774483096", "4590.91018048900"], ["0.00000000610", "1.53597051291", "33019.02111220460"], ["0.00000000617", "2.62356328726", "11190.37790013700"], ["0.00000000548", "4.55798855791", "18875.52586977400"], ["0.00000000633", "4.60110281228", "66567.48586525429"], ["0.00000000596", "5.78202396722", "632.78373931320"], ["0.00000000533", "5.01786882904", "12132.43996210600"], ["0.00000000603", "5.38458554802", "316428.22867391503"], ["0.00000000469", "0.59168241917", "21954.15760939799"], ["0.00000000548", "3.50613163558", "17253.04110768959"], ["0.00000000502", "0.98804327589", "11609.86254401220"], ["0.00000000568", "1.98497313089", "7668.63742494250"], ["0.00000000482", "1.62141803864", "12146.66705610760"], ["0.00000000391", "3.68718382989", "18052.92954315780"], ["0.00000000457", "3.77205737340", "156137.47598479928"], ["0.00000000401", "5.28260651958", "15671.08175940660"], ["0.00000000469", "1.80963184268", "12562.62858163380"], ["0.00000000508", "3.36399024699", "20597.24396304120"], ["0.00000000450", "5.66054299250", "10454.50138660520"], ["0.00000000375", "4.98534633105", "9779.10867612540"], ["0.00000000523", "0.97215560834", "155427.54293624099"], ["0.00000000403", "5.13939866506", "1551.04522264800"], ["0.00000000372", "3.69883738807", "9388.00590941520"], ["0.00000000367", "4.43875659716", "4535.05943692440"], ["0.00000000406", "4.20863156600", "12592.45001978260"], ["0.00000000360", "2.53924644657", "242.72860397400"], ["0.00000000471", "4.61907324819", "5436.99301524020"], ["0.00000000441", "5.83872966262", "3496.03282613400"], ["0.00000000385", "4.94496680973", "24356.78078864160"], ["0.00000000349", "6.15018231784", "19800.94595622480"], ["0.00000000355", "0.21895678106", "5429.87946823940"], ["0.00000000344", "5.62993724928", "2379.16447357160"], ["0.00000000380", "2.72105213143", "11933.36796066960"], ["0.00000000432", "0.24221790536", "17996.03116822220"], ["0.00000000378", "5.22517556974", "7477.52286021600"], ["0.00000000337", "5.10888041439", "5849.36411211460"], ["0.00000000315", "0.57827745123", "10557.59416082380"], ["0.00000000318", "4.49953141399", "3634.62102451840"], ["0.00000000323", "1.54274281393", "10440.27429260360"], ["0.00000000309", "5.76839284397", "20.77539549240"], ["0.00000000301", "2.34727604008", "4686.88940770680"], ["0.00000000414", "5.93237602310", "51092.72605085480"], ["0.00000000361", "2.16398609550", "28237.23345938940"], ["0.00000000288", "0.18376252189", "13095.84266507740"], ["0.00000000277", "5.12952205045", "13119.72110282519"], ["0.00000000327", "6.19222146204", "6268.84875598980"], ["0.00000000273", "0.30522428863", "23141.55838292460"], ["0.00000000267", "5.76152585786", "5966.68398033480"], ["0.00000000308", "5.99280509979", "22805.73556599360"], ["0.00000000345", "2.92489919444", "36949.23080842420"], ["0.00000000253", "5.20995219509", "24072.92146977640"], ["0.00000000342", "5.72702586209", "16460.33352952499"], ["0.00000000261", "2.00304796059", "6148.01076995600"], ["0.00000000238", "5.08264392839", "6915.85958930460"], ["0.00000000249", "2.94762789744", "135.06508003540"], ["0.00000000306", "3.89764686987", "10988.80815753500"], ["0.00000000305", "0.05827812117", "4701.11650170840"], ["0.00000000319", "2.95712862064", "163096.18036118349"], ["0.00000000209", "4.43768461442", "6546.15977336420"], ["0.00000000270", "2.06643178717", "4804.20927592700"], ["0.00000000217", "0.73691592312", "6303.85124548380"], ["0.00000000206", "0.32075959415", "25934.12433108940"], ["0.00000000218", "0.18428135264", "28286.99048486120"], ["0.00000000205", "5.21312087405", "20995.39296644940"], ["0.00000000199", "0.44384292491", "16737.57723659660"], ["0.00000000230", "6.06567392849", "6287.00800325450"], ["0.00000000219", "1.29194216300", "5326.78669402080"], ["0.00000000201", "1.74700937253", "22743.40937951640"], ["0.00000000207", "4.45440927276", "6279.48542133960"], ["0.00000000269", "6.05640445030", "64471.99124174489"], ["0.00000000190", "0.99256176518", "29296.61538957860"], ["0.00000000238", "5.42471431221", "39609.65458316560"], ["0.00000000262", "5.26961924198", "522.57741809380"], ["0.00000000210", "4.68618183158", "6254.62666252360"], ["0.00000000197", "2.80624554080", "4933.20844033260"], ["0.00000000252", "4.36220154608", "40879.44050464380"], ["0.00000000261", "1.07241516738", "55022.93574707440"], ["0.00000000189", "3.82966734476", "419.48464387520"], ["0.00000000185", "4.14324541379", "5642.19824260920"], ["0.00000000247", "3.44855612987", "6702.56049386660"], ["0.00000000205", "4.04424043223", "536.80451209540"], ["0.00000000191", "3.14082686083", "16723.35014259500"], ["0.00000000222", "5.16263907319", "23539.70738633280"], ["0.00000000180", "4.56214752149", "6489.26139842860"], ["0.00000000219", "0.80382553358", "16627.37091537720"], ["0.00000000227", "0.60156339452", "5905.70224207560"], ["0.00000000168", "0.88753528161", "16062.18452611680"], ["0.00000000158", "0.92127725775", "23937.85638974100"], ["0.00000000157", "4.69607868164", "6805.65326808520"], ["0.00000000207", "4.88410451334", "6286.66627864320"], ["0.00000000160", "4.95943826846", "10021.83728009940"], ["0.00000000166", "0.97126433565", "3097.88382272579"], ["0.00000000209", "5.75663411805", "3646.35037735440"], ["0.00000000175", "6.12762824412", "239424.39025435288"], ["0.00000000173", "3.13887234973", "6179.98307577280"], ["0.00000000157", "3.62822058179", "18451.07854656599"], ["0.00000000157", "4.67695912235", "6709.67404086740"], ["0.00000000146", "3.09506069735", "4907.30205014560"], ["0.00000000165", "2.27139128760", "10660.68693504240"], ["0.00000000201", "1.67701267433", "2107.03450754240"], ["0.00000000144", "3.96947747592", "6019.99192661860"], ["0.00000000171", "5.91302216729", "6058.73105428950"], ["0.00000000144", "2.13155655120", "26084.02180621620"], ["0.00000000151", "0.67417383554", "2388.89402044920"], ["0.00000000189", "5.07122281033", "263.08392337280"], ["0.00000000146", "5.10373877968", "10770.89325626180"], ["0.00000000187", "1.23915444627", "19402.79695281660"], ["0.00000000174", "0.08407293391", "9380.95967271720"], ["0.00000000137", "1.26247412309", "12566.21901028560"], ["0.00000000137", "3.52826010842", "639.89728631400"], ["0.00000000148", "1.76124372592", "5888.44996493220"], ["0.00000000164", "2.39195095081", "6357.85744855870"], ["0.00000000146", "2.43675816553", "5881.40372823420"], ["0.00000000161", "1.15721259372", "26735.94526221320"], ["0.00000000131", "2.51859277344", "6599.46771964800"], ["0.00000000153", "5.85203687779", "6281.59137728310"], ["0.00000000151", "3.72338532649", "12669.24447420140"], ["0.00000000132", "2.38417741883", "6525.80445396540"], ["0.00000000129", "0.75556744143", "5017.50837136500"], ["0.00000000127", "0.00254936441", "10027.90319572920"], ["0.00000000148", "2.85102145528", "6418.14093002680"], ["0.00000000143", "5.74460279367", "26087.90314157420"], ["0.00000000172", "0.41289962240", "174242.46596404970"], ["0.00000000136", "4.15497742275", "6311.52503745920"], ["0.00000000170", "5.98194913129", "327574.51427678125"], ["0.00000000124", "1.65497607604", "32217.20018108080"], ["0.00000000136", "2.48430783417", "13341.67431130680"], ["0.00000000165", "2.49667924600", "58953.14544329400"], ["0.00000000123", "3.45660563754", "6277.55292568400"], ["0.00000000117", "0.86065134175", "6245.04817735560"], ["0.00000000149", "5.61358280963", "5729.50644714900"], ["0.00000000153", "0.26860029950", "245.83164622940"], ["0.00000000128", "0.71204006588", "103.09277421860"], ["0.00000000159", "2.43166592149", "221995.02880149524"], ["0.00000000130", "2.80707316718", "6016.46880826960"], ["0.00000000137", "1.70657709294", "12566.08438968000"], ["0.00000000111", "1.56305648432", "17782.73207278420"], ["0.00000000113", "3.58302904101", "25685.87280280800"], ["0.00000000109", "3.26403795962", "6819.88036208680"], ["0.00000000122", "0.34120688217", "1162.47470440780"], ["0.00000000119", "5.84644718278", "12721.57209941700"], ["0.00000000144", "2.28899679126", "12489.88562870720"], ["0.00000000137", "5.82029768354", "44809.65020086340"], ["0.00000000107", "2.42818544140", "5547.19933645960"], ["0.00000000134", "1.26539982939", "5331.35744374080"], ["0.00000000103", "5.96518130595", "6321.10352262720"], ["0.00000000109", "0.33808549034", "11300.58422135640"], ["0.00000000129", "5.89187277327", "12029.34718788740"], ["0.00000000122", "5.77325634636", "11919.14086666800"], ["0.00000000107", "6.24998989350", "77690.75950573849"], ["0.00000000107", "1.00535580713", "77736.78343050249"], ["0.00000000143", "0.24122178432", "4214.06901508480"], ["0.00000000143", "0.88529649733", "7576.56007357400"], ["0.00000000107", "2.92124030496", "31415.37924995700"], ["0.00000000099", "5.70862227072", "5540.08578945880"], ["0.00000000110", "0.37528037383", "5863.59120611620"], ["0.00000000104", "4.44107178366", "2118.76386037840"], ["0.00000000098", "5.95877916706", "4061.21921539440"], ["0.00000000113", "1.24206857385", "84672.47584450469"], ["0.00000000124", "2.55619029867", "12539.85338018300"], ["0.00000000110", "3.66952094329", "238004.52415723629"], ["0.00000000112", "4.32512422943", "97238.62754448749"], ["0.00000000097", "3.70151541181", "11720.06886523160"], ["0.00000000120", "1.26895630252", "12043.57428188900"], ["0.00000000094", "2.56461130309", "19004.64794940840"], ["0.00000000117", "3.65425622684", "34520.30930938080"], ["0.00000000098", "0.13589994287", "11080.17157891760"], ["0.00000000097", "5.38330115253", "7834.12107263940"], ["0.00000000097", "2.46722096722", "71980.63357473118"], ["0.00000000095", "5.36958330451", "6288.59877429880"], ["0.00000000111", "5.01961920313", "11823.16163945020"], ["0.00000000090", "2.72299804525", "26880.31981303260"], ["0.00000000099", "0.90164266377", "18635.92845453620"], ["0.00000000126", "4.78722177847", "305281.94307104882"], ["0.00000000093", "0.21240380046", "18139.29450141590"], ["0.00000000124", "5.00979495566", "172146.97134054029"], ["0.00000000099", "5.67090026475", "16522.65971600220"], ["0.00000000092", "2.28180963676", "12491.37010141550"], ["0.00000000090", "4.50544881196", "40077.61957352000"], ["0.00000000100", "2.00639461612", "12323.42309600880"], ["0.00000000095", "5.68801979087", "14919.01785375460"], ["0.00000000087", "1.86043406047", "27707.54249429480"], ["0.00000000105", "3.02903468417", "22345.26037610820"], ["0.00000000087", "5.43970168638", "6272.03014972750"], ["0.00000000089", "1.63389387182", "33326.57873317420"], ["0.00000000082", "5.58298993353", "10241.20229116720"], ["0.00000000094", "5.47749711149", "9924.81042151060"], ["0.00000000082", "4.71988314145", "15141.39079431200"], ["0.00000000097", "5.61458778738", "2787.04302385740"], ["0.00000000096", "3.89073946348", "6379.05507720920"], ["0.00000000081", "3.13038482444", "36147.40987730040"], ["0.00000000110", "4.89978492291", "72140.62866668739"], ["0.00000000097", "5.20764563059", "6303.43116939020"], ["0.00000000082", "5.26342716139", "9814.60410029120"], ["0.00000000109", "2.35555589770", "83286.91426955358"], ["0.00000000097", "2.58492958057", "30666.15495843280"], ["0.00000000093", "1.32651591333", "23020.65308658799"], ["0.00000000078", "3.99588630754", "11293.47067435560"], ["0.00000000090", "0.57771932738", "26482.17080962440"], ["0.00000000106", "3.92012705073", "62883.35513951360"], ["0.00000000098", "2.94397773524", "316.39186965660"], ["0.00000000076", "3.96310417608", "29026.48522950779"], ["0.00000000078", "1.97068529306", "90279.92316810328"], ["0.00000000076", "0.23027966596", "21424.46664430340"], ["0.00000000080", "2.23099742212", "266.60704172180"], ["0.00000000079", "1.46227790922", "8982.81066930900"], ["0.00000000102", "4.92129953565", "5621.84292321040"], ["0.00000000100", "0.39243148321", "24279.10701821359"], ["0.00000000071", "1.52014858474", "33794.54372352860"], ["0.00000000076", "0.22880641443", "57375.80190084620"], ["0.00000000091", "0.96515913904", "48739.85989708300"], ["0.00000000075", "2.77638585157", "12964.30070339100"], ["0.00000000077", "5.18846946344", "11520.99686379520"], ["0.00000000068", "0.50006599129", "4274.51831083240"], ["0.00000000075", "2.07323762803", "15664.03552270859"], ["0.00000000074", "1.01884134928", "6393.28217121080"], ["0.00000000077", "0.46665178780", "16207.88627150200"], ["0.00000000081", "4.10452219483", "161710.61878623239"], ["0.00000000067", "3.83840630887", "6262.72053059260"], ["0.00000000071", "3.91415523291", "7875.67186362420"], ["0.00000000081", "0.91938383237", "74.78159856730"], ["0.00000000083", "4.69916218791", "23006.42599258639"], ["0.00000000063", "2.32556465878", "6279.19451463340"], ["0.00000000065", "5.41938745446", "28628.33622609960"], ["0.00000000065", "3.02336771694", "5959.57043333400"], ["0.00000000064", "3.31033198370", "2636.72547263700"], ["0.00000000064", "0.18375587519", "1066.49547719000"], ["0.00000000080", "5.81239171612", "12341.80690428090"], ["0.00000000066", "2.15105504851", "38.02767263580"], ["0.00000000062", "2.43313614978", "10138.10951694860"], ["0.00000000060", "3.16153906470", "5490.30096152400"], ["0.00000000069", "0.30764736334", "7018.95236352320"], ["0.00000000068", "2.24442548639", "24383.07910844140"], ["0.00000000078", "1.39649386463", "9411.46461508720"], ["0.00000000063", "0.72976362625", "6286.95718534940"], ["0.00000000073", "4.95125917731", "6453.74872061060"], ["0.00000000078", "0.32736023459", "6528.90749622080"], ["0.00000000059", "4.95362151577", "35707.71008290740"], ["0.00000000070", "2.37962727525", "15508.61512327440"], ["0.00000000073", "1.35229143111", "5327.47610838280"], ["0.00000000072", "5.91833527334", "10881.09957748120"], ["0.00000000059", "5.36231868425", "10239.58386601080"], ["0.00000000059", "1.63156134967", "61306.01159706580"], ["0.00000000054", "4.29491690425", "21947.11137270000"], ["0.00000000057", "5.89190132575", "34513.26307268280"], ["0.00000000074", "1.38235845304", "9967.45389998160"], ["0.00000000053", "3.86543309344", "32370.97899156560"], ["0.00000000055", "4.51794544854", "34911.41207609100"], ["0.00000000063", "5.41479412056", "11502.83761653050"], ["0.00000000063", "2.34416220742", "11510.70192305670"], ["0.00000000068", "0.77493931112", "29864.33402730900"], ["0.00000000060", "5.57024703495", "5756.90800324580"], ["0.00000000072", "2.80863088166", "10866.87248347960"], ["0.00000000061", "2.69736991384", "82576.98122099529"], ["0.00000000063", "5.32068807257", "3116.65941225980"], ["0.00000000052", "1.02278758099", "6272.43918464160"], ["0.00000000069", "5.00698550308", "25287.72379939980"], ["0.00000000066", "6.12047940728", "12074.48840752400"], ["0.00000000051", "2.59519527563", "11396.56344857420"], ["0.00000000056", "2.57995973521", "17892.93839400359"], ["0.00000000059", "0.44167237620", "250570.67585721909"], ["0.00000000059", "3.84070143543", "5483.25472482600"], ["0.00000000049", "0.54704693048", "22594.05489571199"], ["0.00000000065", "2.38423614501", "52670.06959330260"], ["0.00000000069", "5.34363738671", "66813.56483573320"], ["0.00000000057", "5.42770501007", "310145.15282392364"], ["0.00000000053", "1.17760296075", "149.56319713460"], ["0.00000000061", "4.02090887211", "34596.36465465240"], ["0.00000000049", "4.18361320516", "18606.49894600020"], ["0.00000000055", "0.83886167974", "20452.86941222180"], ["0.00000000050", "1.46327331958", "37455.72649597440"], ["0.00000000048", "4.53854727167", "29822.78323632420"], ["0.00000000058", "3.34847975377", "33990.61834428620"], ["0.00000000065", "1.45522693982", "76251.32777062019"], ["0.00000000056", "2.35650663692", "37724.75341974820"], ["0.00000000052", "2.61551081496", "5999.21653112620"], ["0.00000000053", "0.17334326094", "77717.29458646949"], ["0.00000000053", "0.79879700631", "77710.24834977149"], ["0.00000000047", "0.43240779709", "735.87651353180"], ["0.00000000053", "4.58763261686", "11616.97609101300"], ["0.00000000048", "6.20230111054", "4171.42553661380"], ["0.00000000052", "1.09723616404", "640.87760738220"], ["0.00000000057", "3.42008310383", "50317.20343953080"], ["0.00000000053", "1.01528448581", "149144.46708624958"], ["0.00000000047", "3.00924906195", "52175.80628314840"], ["0.00000000052", "2.03254070404", "6293.71251534120"], ["0.00000000048", "0.12356889734", "13362.44970679920"], ["0.00000000045", "3.37963782356", "10763.77970926100"], ["0.00000000047", "5.50981287869", "12779.45079542080"], ["0.00000000062", "5.45209070099", "949.17560896980"], ["0.00000000061", "2.93237974631", "5791.41255753260"], ["0.00000000044", "2.87440620802", "8584.66166590080"], ["0.00000000046", "4.03141796560", "10667.80048204320"], ["0.00000000047", "3.89902931422", "3903.91137641980"], ["0.00000000046", "2.75700467329", "6993.00889854970"], ["0.00000000045", "1.93386293300", "206.18554843720"], ["0.00000000047", "2.57670800912", "11492.54267579200"], ["0.00000000044", "3.62570223167", "63658.87775083760"], ["0.00000000051", "0.84536826273", "12345.73905754400"], ["0.00000000043", "0.01524970172", "37853.87549938260"], ["0.00000000041", "3.27146326065", "8858.31494432060"], ["0.00000000045", "3.03765521215", "65236.22129328540"], ["0.00000000047", "1.44447548944", "21393.54196985760"], ["0.00000000058", "5.45843180927", "1975.49254585600"], ["0.00000000050", "2.13285524146", "12573.26524698360"], ["0.00000000041", "1.32190847146", "2547.83753823240"], ["0.00000000047", "3.67579608544", "28313.28880466100"], ["0.00000000041", "2.24013475126", "8273.82086703240"], ["0.00000000047", "6.21438985953", "10991.30589870060"], ["0.00000000042", "3.01631817350", "853.19638175200"], ["0.00000000056", "1.09773690181", "77376.20102240759"], ["0.00000000040", "2.35698541041", "2699.73481931760"], ["0.00000000043", "5.28030898459", "17796.95916678580"], ["0.00000000054", "2.59175932091", "22910.44676536859"], ["0.00000000054", "0.88027764102", "71960.38658322369"], ["0.00000000055", "0.07988899477", "83467.15635301729"], ["0.00000000039", "1.12867321442", "9910.58332750900"], ["0.00000000040", "1.35670430524", "27177.85152920020"], ["0.00000000039", "4.39624220245", "5618.31980486140"], ["0.00000000042", "4.78798367468", "7856.89627409019"], ["0.00000000047", "2.75482175292", "18202.21671665939"], ["0.00000000039", "1.97008298629", "24491.42579258340"], ["0.00000000042", "4.04346599946", "7863.94251078820"], ["0.00000000038", "0.49178679251", "38650.17350619900"], ["0.00000000036", "4.86047906533", "4157.19844261220"], ["0.00000000043", "5.64354880978", "1062.90504853820"], ["0.00000000036", "3.98066313627", "12565.17137891460"], ["0.00000000042", "2.30753932657", "6549.68289171320"], ["0.00000000040", "5.39694918320", "9498.21223063460"], ["0.00000000040", "3.30603243754", "23536.11695768099"], ["0.00000000050", "6.15760345261", "78051.34191383338"]], [["0.00103018608", "1.10748969588", "6283.07584999140"], ["0.00001721238", "1.06442301418", "12566.15169998280"], ["0.00000702215", "3.14159265359", "0.00000000000"], ["0.00000032346", "1.02169059149", "18849.22754997420"], ["0.00000030799", "2.84353804832", "5507.55323866740"], ["0.00000024971", "1.31906709482", "5223.69391980220"], ["0.00000018485", "1.42429748614", "1577.34354244780"], ["0.00000010078", "5.91378194648", "10977.07880469900"], ["0.00000008634", "0.27146150602", "5486.77784317500"], ["0.00000008654", "1.42046854427", "6275.96230299060"], ["0.00000005069", "1.68613426734", "5088.62883976680"], ["0.00000004985", "6.01401770704", "6286.59896834040"], ["0.00000004669", "5.98724494073", "529.69096509460"], ["0.00000004395", "0.51800238019", "4694.00295470760"], ["0.00000003872", "4.74969833437", "2544.31441988340"], ["0.00000003750", "5.07097685568", "796.29800681640"], ["0.00000004100", "1.08424786092", "9437.76293488700"], ["0.00000003518", "0.02290216272", "83996.84731811189"], ["0.00000003436", "0.94937019624", "71430.69561812909"], ["0.00000003221", "6.15628775313", "2146.16541647520"], ["0.00000003414", "5.41218322538", "775.52261132400"], ["0.00000002863", "5.48432847146", "10447.38783960440"], ["0.00000002520", "0.24276941146", "398.14900340820"], ["0.00000002201", "4.95216196651", "6812.76681508600"], ["0.00000002186", "0.41991743105", "8031.09226305840"], ["0.00000002838", "3.42034351366", "2352.86615377180"], ["0.00000002554", "6.13241878525", "6438.49624942560"], ["0.00000001932", "5.31374608366", "8429.24126646660"], ["0.00000002429", "3.09164528262", "4690.47983635860"], ["0.00000001730", "1.53686208550", "4705.73230754360"], ["0.00000002250", "3.68863633842", "7084.89678111520"], ["0.00000002093", "1.28191783032", "1748.01641306700"], ["0.00000001441", "0.81656250862", "14143.49524243060"], ["0.00000001483", "3.22225357771", "7234.79425624200"], ["0.00000001754", "3.22883705112", "6279.55273164240"], ["0.00000001583", "4.09702349428", "11499.65622279280"], ["0.00000001575", "5.53890170575", "3154.68708489560"], ["0.00000001847", "1.82040335363", "7632.94325965020"], ["0.00000001504", "3.63293385726", "11513.88331679440"], ["0.00000001337", "4.64440864339", "6836.64525283380"], ["0.00000001275", "2.69341415363", "1349.86740965880"], ["0.00000001352", "6.15101580257", "5746.27133789600"], ["0.00000001125", "3.35673439497", "17789.84561978500"], ["0.00000001470", "3.65282991755", "1194.44701022460"], ["0.00000001177", "2.57676109092", "13367.97263110660"], ["0.00000001101", "4.49748696552", "4292.33083295040"], ["0.00000001234", "5.65036509521", "5760.49843189760"], ["0.00000000984", "0.65517395136", "5856.47765911540"], ["0.00000000928", "2.32420318751", "10213.28554621100"], ["0.00000001077", "5.82812169132", "12036.46073488820"], ["0.00000000916", "0.76613009583", "16730.46368959580"], ["0.00000000877", "1.50137505051", "11926.25441366880"], ["0.00000001023", "5.62076589825", "6256.77753019160"], ["0.00000000851", "0.65709335533", "155.42039943420"], ["0.00000000802", "4.10519132088", "951.71840625060"], ["0.00000000857", "1.41661697538", "5753.38488489680"], ["0.00000000994", "1.14418521187", "1059.38193018920"], ["0.00000000813", "1.63948433322", "6681.22485339960"], ["0.00000000662", "4.55200452260", "5216.58037280140"], ["0.00000000644", "4.19478168733", "6040.34724601740"], ["0.00000000626", "1.50767713598", "5643.17856367740"], ["0.00000000590", "6.18277145205", "4164.31198961300"], ["0.00000000635", "0.52413263542", "6290.18939699220"], ["0.00000000650", "0.97935690350", "25132.30339996560"], ["0.00000000568", "2.30125315873", "10973.55568635000"], ["0.00000000547", "5.27256412213", "3340.61242669980"], ["0.00000000547", "2.20144422886", "1592.59601363280"], ["0.00000000526", "0.92464258226", "11371.70468975820"], ["0.00000000490", "5.90951388655", "3894.18182954220"], ["0.00000000478", "1.66857963179", "12168.00269657460"], ["0.00000000516", "3.59803483887", "10969.96525769820"], ["0.00000000518", "3.97914412373", "17298.18232732620"], ["0.00000000534", "5.03740926442", "9917.69687450980"], ["0.00000000487", "2.50545369269", "6127.65545055720"], ["0.00000000416", "4.04828175503", "10984.19235169980"], ["0.00000000538", "5.54081539805", "553.56940284240"], ["0.00000000402", "2.16544019233", "7860.41939243920"], ["0.00000000553", "2.32177369366", "11506.76976979360"], ["0.00000000367", "3.39152532250", "6496.37494542940"], ["0.00000000360", "5.34379853282", "7079.37385680780"], ["0.00000000337", "3.61563704045", "11790.62908865880"], ["0.00000000456", "0.30754294809", "801.82093112380"], ["0.00000000417", "3.70009308674", "10575.40668294180"], ["0.00000000381", "5.82033971802", "7058.59846131540"], ["0.00000000321", "0.31988767355", "16200.77272450120"], ["0.00000000364", "1.08414306177", "6309.37416979120"], ["0.00000000294", "4.54798604957", "11856.21865142450"], ["0.00000000290", "1.26473978562", "8635.94200376320"], ["0.00000000399", "4.16998866302", "26.29831979980"], ["0.00000000262", "5.08316906342", "10177.25767953360"], ["0.00000000243", "2.25746091190", "11712.95531823080"], ["0.00000000237", "1.05070575346", "242.72860397400"], ["0.00000000275", "3.45319481756", "5884.92684658320"], ["0.00000000255", "5.38496831087", "21228.39202354580"], ["0.00000000307", "4.24313526604", "3738.76143010800"], ["0.00000000216", "3.46037894728", "213.29909543800"], ["0.00000000196", "0.69029243914", "1990.74501704100"], ["0.00000000198", "5.16301829964", "12352.85260454480"], ["0.00000000214", "3.91876200279", "13916.01910964160"], ["0.00000000212", "4.00861198517", "5230.80746680300"], ["0.00000000184", "5.59805976614", "6283.14316029419"], ["0.00000000184", "2.85275392124", "7238.67559160000"], ["0.00000000179", "2.54259058334", "14314.16811304980"], ["0.00000000225", "1.64458698399", "4732.03062734340"], ["0.00000000236", "5.58826125715", "6069.77675455340"], ["0.00000000187", "2.72805985443", "6062.66320755260"], ["0.00000000184", "6.04216273598", "6283.00853968860"], ["0.00000000230", "3.62591335086", "6284.05617105960"], ["0.00000000163", "2.19117396803", "18073.70493865020"], ["0.00000000172", "0.97612950740", "3930.20969621960"], ["0.00000000215", "1.04672844028", "3496.03282613400"], ["0.00000000169", "4.75084479006", "17267.26820169119"], ["0.00000000152", "0.19390712179", "9779.10867612540"], ["0.00000000182", "5.16288118255", "17253.04110768959"], ["0.00000000149", "0.80944184260", "709.93304855830"], ["0.00000000163", "2.19209570390", "6076.89030155420"], ["0.00000000186", "5.01159497089", "11015.10647733480"], ["0.00000000134", "0.97765485759", "65147.61976813770"], ["0.00000000141", "4.38421981312", "4136.91043351620"], ["0.00000000158", "4.60974280627", "9623.68827669120"], ["0.00000000133", "3.30508592837", "154717.60988768269"], ["0.00000000163", "6.11782626245", "3.52311834900"], ["0.00000000174", "1.58078542187", "7.11354700080"], ["0.00000000141", "0.49976927274", "25158.60171976540"], ["0.00000000124", "6.03440460031", "9225.53927328300"], ["0.00000000150", "5.30166336812", "13517.87010623340"], ["0.00000000127", "1.92389511438", "22483.84857449259"], ["0.00000000121", "2.37813129011", "167283.76158766549"], ["0.00000000120", "3.98423684853", "4686.88940770680"], ["0.00000000117", "5.81072642211", "12569.67481833180"], ["0.00000000122", "5.60973054224", "5642.19824260920"], ["0.00000000157", "3.40236426002", "16496.36139620240"], ["0.00000000129", "2.10705116371", "1589.07289528380"], ["0.00000000116", "0.55839966736", "5849.36411211460"], ["0.00000000123", "1.52961392771", "12559.03815298200"], ["0.00000000111", "0.44848279675", "6172.86952877200"], ["0.00000000123", "5.81645568991", "6282.09552892320"], ["0.00000000150", "4.26278409223", "3128.38876509580"], ["0.00000000106", "2.27437761356", "5429.87946823940"], ["0.00000000104", "4.42743707728", "23543.23050468179"], ["0.00000000121", "0.39459045915", "12132.43996210600"], ["0.00000000104", "2.41842602527", "426.59819087600"], ["0.00000000110", "5.80381480447", "16858.48253293320"], ["0.00000000100", "2.93805577485", "4535.05943692440"], ["0.00000000097", "3.97935904984", "6133.51265285680"], ["0.00000000110", "6.22339014386", "12146.66705610760"], ["0.00000000098", "0.87576563709", "6525.80445396540"], ["0.00000000098", "3.15248421301", "10440.27429260360"], ["0.00000000095", "2.46168411100", "3097.88382272579"], ["0.00000000088", "0.23371480284", "13119.72110282519"], ["0.00000000098", "5.77016493489", "7342.45778018060"], ["0.00000000092", "6.03915555063", "20426.57109242200"], ["0.00000000096", "5.56909292561", "2388.89402044920"], ["0.00000000081", "1.32131147691", "5650.29211067820"], ["0.00000000086", "3.94529200528", "10454.50138660520"], ["0.00000000076", "2.70729716925", "143571.32428481648"], ["0.00000000091", "5.64100034152", "8827.39026987480"], ["0.00000000076", "1.80783856698", "28286.99048486120"], ["0.00000000081", "1.90858992196", "29088.81141598500"], ["0.00000000075", "3.40955892978", "5481.25491886760"], ["0.00000000069", "4.49936170873", "17256.63153634140"], ["0.00000000088", "1.10098454357", "11769.85369316640"], ["0.00000000066", "2.78285801977", "536.80451209540"], ["0.00000000068", "3.88179770758", "17260.15465469040"], ["0.00000000084", "1.59303306354", "9380.95967271720"], ["0.00000000088", "3.88076636762", "7477.52286021600"], ["0.00000000061", "6.17558202197", "11087.28512591840"], ["0.00000000060", "4.34824715818", "6206.80977871580"], ["0.00000000082", "4.59843208943", "9388.00590941520"], ["0.00000000079", "1.63131230601", "4933.20844033260"], ["0.00000000078", "4.20905757484", "5729.50644714900"], ["0.00000000057", "5.48157926651", "18319.53658487960"], ["0.00000000060", "1.01261781084", "12721.57209941700"], ["0.00000000056", "1.63031935692", "15720.83878487840"], ["0.00000000055", "0.24926735018", "15110.46611986620"], ["0.00000000061", "5.93059279661", "12539.85338018300"], ["0.00000000055", "4.84298966314", "13095.84266507740"], ["0.00000000067", "6.11690589247", "8662.24032356300"], ["0.00000000054", "5.73750638571", "3634.62102451840"], ["0.00000000074", "1.05466745829", "16460.33352952499"], ["0.00000000053", "2.29084335688", "16062.18452611680"], ["0.00000000064", "2.13513767927", "7875.67186362420"], ["0.00000000067", "0.07096807518", "14945.31617355440"], ["0.00000000051", "2.31511194429", "6262.72053059260"], ["0.00000000057", "5.77055471237", "12043.57428188900"], ["0.00000000056", "4.41980790431", "4701.11650170840"], ["0.00000000059", "5.87963500073", "5331.35744374080"], ["0.00000000058", "2.30546168628", "955.59974160860"], ["0.00000000049", "1.93839278478", "5333.90024102160"], ["0.00000000048", "2.69973662261", "6709.67404086740"], ["0.00000000064", "1.64379897981", "6262.30045449900"], ["0.00000000046", "3.98449608961", "98068.53671630539"], ["0.00000000050", "3.68875893005", "12323.42309600880"], ["0.00000000045", "3.30068569697", "22003.91463486980"], ["0.00000000047", "1.26317154881", "11919.14086666800"], ["0.00000000045", "0.89150445122", "51868.24866217880"], ["0.00000000043", "1.61526242998", "6277.55292568400"], ["0.00000000043", "5.74295325645", "11403.67699557500"], ["0.00000000044", "3.43070646822", "10021.83728009940"], ["0.00000000056", "0.02481833774", "15671.08175940660"], ["0.00000000055", "3.14274403422", "33019.02111220460"], ["0.00000000045", "3.00877289177", "8982.81066930900"], ["0.00000000046", "0.73303568429", "6303.43116939020"], ["0.00000000049", "1.60455690285", "6303.85124548380"], ["0.00000000045", "0.40210030323", "6805.65326808520"], ["0.00000000053", "0.94869680175", "10988.80815753500"], ["0.00000000041", "1.61122384329", "6819.88036208680"], ["0.00000000055", "0.89439119424", "11933.36796066960"], ["0.00000000045", "3.88495384656", "60530.48898574180"], ["0.00000000040", "4.75740908001", "38526.57435087200"], ["0.00000000040", "1.49921251887", "18451.07854656599"], ["0.00000000040", "3.77498297228", "26087.90314157420"], ["0.00000000051", "1.70258603562", "1551.04522264800"], ["0.00000000039", "2.97100699926", "2118.76386037840"], ["0.00000000053", "5.19854123078", "77713.77146812050"], ["0.00000000047", "4.26356628717", "21424.46664430340"], ["0.00000000037", "0.62902722802", "24356.78078864160"], ["0.00000000036", "0.11087914947", "10344.29506538580"], ["0.00000000036", "0.77037556319", "12029.34718788740"], ["0.00000000035", "3.30933994515", "24072.92146977640"], ["0.00000000035", "5.93650887012", "31570.79964939120"], ["0.00000000036", "2.15108874765", "30774.50164257480"], ["0.00000000036", "1.75078825382", "16207.88627150200"], ["0.00000000033", "5.06264177921", "226858.23855437008"], ["0.00000000034", "6.16891378800", "24491.42579258340"], ["0.00000000035", "3.19120695549", "32217.20018108080"], ["0.00000000034", "2.31528650443", "55798.45835839840"], ["0.00000000032", "4.21446357042", "15664.03552270859"], ["0.00000000039", "1.24979117796", "6418.14093002680"], ["0.00000000037", "4.11943655770", "2787.04302385740"], ["0.00000000032", "1.62887710890", "639.89728631400"], ["0.00000000038", "5.89832942685", "640.87760738220"], ["0.00000000032", "1.72442327688", "27433.88921587499"], ["0.00000000031", "2.78828943753", "12139.55350910680"], ["0.00000000035", "4.44608896525", "18202.21671665939"], ["0.00000000034", "3.96287980676", "18216.44381066100"], ["0.00000000033", "4.73611335874", "16723.35014259500"], ["0.00000000034", "1.43910280005", "49515.38250840700"], ["0.00000000031", "0.23302920161", "23581.25817731760"], ["0.00000000029", "2.02633840220", "11609.86254401220"], ["0.00000000030", "2.54923230240", "9924.81042151060"], ["0.00000000032", "4.91793198558", "11300.58422135640"], ["0.00000000028", "0.26187189577", "13521.75144159140"], ["0.00000000028", "3.84568936822", "2699.73481931760"], ["0.00000000029", "1.83149729794", "29822.78323632420"], ["0.00000000033", "4.60320094415", "19004.64794940840"], ["0.00000000027", "4.46183450287", "6702.56049386660"], ["0.00000000030", "4.46494072240", "36147.40987730040"], ["0.00000000027", "0.03211931363", "6279.78949257360"], ["0.00000000026", "5.46497324333", "6245.04817735560"], ["0.00000000035", "4.52695674113", "36949.23080842420"], ["0.00000000027", "3.52528177609", "10770.89325626180"], ["0.00000000026", "1.48499438453", "11080.17157891760"], ["0.00000000035", "2.82154380962", "19402.79695281660"], ["0.00000000025", "2.46339998836", "6279.48542133960"], ["0.00000000026", "4.97688894643", "16737.57723659660"], ["0.00000000026", "2.36136541526", "17996.03116822220"], ["0.00000000029", "4.15148654061", "45892.73043315699"], ["0.00000000026", "4.50714272714", "17796.95916678580"], ["0.00000000027", "4.72625223674", "1066.49547719000"], ["0.00000000025", "2.89309528854", "6286.66627864320"], ["0.00000000027", "0.37462444357", "12964.30070339100"], ["0.00000000029", "4.94860010533", "5863.59120611620"], ["0.00000000031", "3.93096113577", "29864.33402730900"], ["0.00000000024", "6.14987193584", "18606.49894600020"], ["0.00000000024", "3.74225964547", "29026.48522950779"], ["0.00000000025", "5.70460621565", "27707.54249429480"], ["0.00000000025", "5.33928840652", "15141.39079431200"], ["0.00000000027", "3.02320897140", "6286.36220740920"], ["0.00000000023", "0.28364955406", "5327.47610838280"], ["0.00000000026", "1.34240461687", "18875.52586977400"], ["0.00000000024", "1.33998410121", "19800.94595622480"], ["0.00000000025", "6.00172494004", "6489.26139842860"], ["0.00000000022", "1.81777974484", "6288.59877429880"], ["0.00000000022", "3.58603606640", "6915.85958930460"], ["0.00000000029", "2.09564449439", "15265.88651930040"], ["0.00000000022", "1.02173599251", "11925.27409260060"], ["0.00000000022", "4.74660932338", "28230.18722269139"], ["0.00000000021", "2.30688751432", "5999.21653112620"], ["0.00000000021", "3.22654944430", "25934.12433108940"], ["0.00000000021", "3.04956726238", "6566.93516885660"], ["0.00000000027", "5.35653084499", "33794.54372352860"], ["0.00000000028", "3.91168324815", "18208.34994259200"], ["0.00000000020", "1.52296293311", "135.06508003540"], ["0.00000000022", "4.66462839521", "13362.44970679920"], ["0.00000000019", "1.78121167862", "156137.47598479928"], ["0.00000000019", "2.99969102221", "19651.04848109800"], ["0.00000000019", "2.86664273362", "18422.62935909819"], ["0.00000000025", "0.94995632141", "31415.37924995700"], ["0.00000000019", "4.71432851499", "77690.75950573849"], ["0.00000000019", "2.54227398241", "77736.78343050249"], ["0.00000000020", "5.91915117116", "48739.85989708300"]], [["0.00004359385", "5.78455133738", "6283.07584999140"], ["0.00000123633", "5.57934722157", "12566.15169998280"], ["0.00000012341", "3.14159265359", "0.00000000000"], ["0.00000008792", "3.62777733395", "77713.77146812050"], ["0.00000005689", "1.86958905084", "5573.14280143310"], ["0.00000003301", "5.47027913302", "18849.22754997420"], ["0.00000001471", "4.48028885617", "5507.55323866740"], ["0.00000001013", "2.81456417694", "5223.69391980220"], ["0.00000000854", "3.10878241236", "1577.34354244780"], ["0.00000001102", "2.84173992403", "161000.68573767410"], ["0.00000000648", "5.47349498544", "775.52261132400"], ["0.00000000609", "1.37969434104", "6438.49624942560"], ["0.00000000499", "4.41649242250", "6286.59896834040"], ["0.00000000417", "0.90242451175", "10977.07880469900"], ["0.00000000402", "3.20376585290", "5088.62883976680"], ["0.00000000351", "1.81079227770", "5486.77784317500"], ["0.00000000467", "3.65753702738", "7084.89678111520"], ["0.00000000458", "5.38585314743", "149854.40013480789"], ["0.00000000304", "3.51701098693", "796.29800681640"], ["0.00000000266", "6.17413982699", "6836.64525283380"], ["0.00000000279", "1.84120501086", "4694.00295470760"], ["0.00000000260", "1.41629543251", "2146.16541647520"], ["0.00000000266", "3.13832905677", "71430.69561812909"], ["0.00000000321", "5.35313367048", "3154.68708489560"], ["0.00000000238", "2.17720020018", "155.42039943420"], ["0.00000000293", "4.61501268144", "4690.47983635860"], ["0.00000000229", "4.75969588070", "7234.79425624200"], ["0.00000000211", "0.21868065485", "4705.73230754360"], ["0.00000000201", "4.21905743357", "1349.86740965880"], ["0.00000000195", "4.57808285364", "529.69096509460"], ["0.00000000253", "2.81496293039", "1748.01641306700"], ["0.00000000182", "5.70454011389", "6040.34724601740"], ["0.00000000179", "6.02897097053", "4292.33083295040"], ["0.00000000186", "1.58690991244", "6309.37416979120"], ["0.00000000170", "2.90220009715", "9437.76293488700"], ["0.00000000166", "1.99984925026", "8031.09226305840"], ["0.00000000158", "0.04783713552", "2544.31441988340"], ["0.00000000197", "2.01083639502", "1194.44701022460"], ["0.00000000165", "5.78372596778", "83996.84731811189"], ["0.00000000214", "3.38285934319", "7632.94325965020"], ["0.00000000140", "0.36401486094", "10447.38783960440"], ["0.00000000151", "0.95153163031", "6127.65545055720"], ["0.00000000136", "1.48426306582", "2352.86615377180"], ["0.00000000127", "5.48475435134", "951.71840625060"], ["0.00000000126", "5.26866506592", "6279.55273164240"], ["0.00000000125", "3.75754889288", "6812.76681508600"], ["0.00000000101", "4.95015746147", "398.14900340820"], ["0.00000000102", "0.68468295277", "1592.59601363280"], ["0.00000000100", "1.14568935785", "3894.18182954220"], ["0.00000000129", "0.76540016965", "553.56940284240"], ["0.00000000109", "5.41063597567", "6256.77753019160"], ["0.00000000075", "5.84804322893", "242.72860397400"], ["0.00000000095", "1.94452244083", "11856.21865142450"], ["0.00000000077", "0.69373708195", "8429.24126646660"], ["0.00000000100", "5.19725292131", "244287.60000722769"], ["0.00000000080", "6.18440483705", "1059.38193018920"], ["0.00000000069", "5.25699888595", "14143.49524243060"], ["0.00000000085", "5.39484725499", "25132.30339996560"], ["0.00000000066", "0.51779993906", "801.82093112380"], ["0.00000000055", "5.16878202461", "7058.59846131540"], ["0.00000000051", "3.88759155247", "12036.46073488820"], ["0.00000000050", "5.57636570536", "6290.18939699220"], ["0.00000000061", "2.24359003264", "8635.94200376320"], ["0.00000000050", "5.54441900966", "1990.74501704100"], ["0.00000000056", "4.00301078040", "13367.97263110660"], ["0.00000000052", "4.13138898038", "7860.41939243920"], ["0.00000000052", "3.90943054011", "26.29831979980"], ["0.00000000041", "3.57128482780", "7079.37385680780"], ["0.00000000056", "2.76959005761", "90955.55169449610"], ["0.00000000042", "1.91461189199", "7477.52286021600"], ["0.00000000042", "0.42728171713", "10213.28554621100"], ["0.00000000042", "1.09413724455", "709.93304855830"], ["0.00000000039", "3.93298068961", "10973.55568635000"], ["0.00000000038", "6.17935925345", "9917.69687450980"], ["0.00000000049", "0.83021145241", "11506.76976979360"], ["0.00000000053", "1.45828359397", "233141.31440436149"], ["0.00000000047", "6.21568666789", "6681.22485339960"], ["0.00000000037", "0.36359309980", "10177.25767953360"], ["0.00000000035", "3.33024911524", "5643.17856367740"], ["0.00000000034", "5.63446915337", "6525.80445396540"], ["0.00000000035", "5.36033855038", "25158.60171976540"], ["0.00000000034", "5.36319798321", "4933.20844033260"], ["0.00000000033", "4.24722336872", "12569.67481833180"], ["0.00000000043", "5.26370903404", "10575.40668294180"], ["0.00000000042", "5.08837645072", "11015.10647733480"], ["0.00000000040", "1.98334703186", "6284.05617105960"], ["0.00000000042", "4.22496037505", "88860.05707098669"], ["0.00000000029", "3.19088628170", "11926.25441366880"], ["0.00000000029", "0.15217616684", "12168.00269657460"], ["0.00000000030", "1.61904744136", "9779.10867612540"], ["0.00000000027", "0.76388991416", "1589.07289528380"], ["0.00000000036", "2.74712003443", "3738.76143010800"], ["0.00000000033", "3.08807829566", "3930.20969621960"], ["0.00000000031", "5.34906619513", "143571.32428481648"], ["0.00000000025", "0.10240267494", "22483.84857449259"], ["0.00000000030", "3.47110495524", "14945.31617355440"], ["0.00000000024", "1.10425016019", "4535.05943692440"], ["0.00000000024", "1.58037259780", "6496.37494542940"], ["0.00000000023", "3.87710321433", "6275.96230299060"], ["0.00000000025", "3.94529778970", "3128.38876509580"], ["0.00000000023", "3.44685609601", "4136.91043351620"], ["0.00000000023", "3.83156029849", "5753.38488489680"], ["0.00000000022", "1.86956128067", "16730.46368959580"], ["0.00000000025", "2.42188933855", "5729.50644714900"], ["0.00000000020", "1.78208352927", "17789.84561978500"], ["0.00000000021", "4.30363087400", "16858.48253293320"], ["0.00000000021", "0.49258939822", "29088.81141598500"], ["0.00000000025", "1.33030250444", "6282.09552892320"], ["0.00000000027", "2.54785812264", "3496.03282613400"], ["0.00000000022", "1.11232521950", "12721.57209941700"], ["0.00000000021", "5.97759081637", "7.11354700080"], ["0.00000000019", "0.80292033311", "16062.18452611680"], ["0.00000000023", "4.12454848769", "2388.89402044920"], ["0.00000000022", "4.92663152168", "18875.52586977400"], ["0.00000000023", "5.68902059771", "16460.33352952499"], ["0.00000000023", "4.97346265647", "17260.15465469040"], ["0.00000000023", "3.03021283729", "66567.48586525429"], ["0.00000000016", "3.89740925257", "5331.35744374080"], ["0.00000000017", "3.08268671348", "154717.60988768269"], ["0.00000000016", "3.95085099736", "3097.88382272579"], ["0.00000000016", "3.99041783945", "6283.14316029419"], ["0.00000000020", "6.10644140189", "167283.76158766549"], ["0.00000000015", "4.09775914607", "11712.95531823080"], ["0.00000000016", "5.71769940700", "17298.18232732620"], ["0.00000000016", "3.28894009404", "5884.92684658320"], ["0.00000000015", "5.64785377164", "12559.03815298200"], ["0.00000000016", "4.43452080930", "6283.00853968860"], ["0.00000000014", "2.31721603062", "5481.25491886760"], ["0.00000000014", "4.43479032305", "13517.87010623340"], ["0.00000000014", "4.73209312936", "7342.45778018060"], ["0.00000000012", "0.64705975463", "18073.70493865020"], ["0.00000000011", "1.51443332200", "16200.77272450120"], ["0.00000000011", "0.88708889185", "21228.39202354580"], ["0.00000000014", "4.50116508534", "640.87760738220"], ["0.00000000011", "4.64339996198", "11790.62908865880"], ["0.00000000011", "1.31064298246", "4164.31198961300"], ["0.00000000009", "3.02238989305", "23543.23050468179"], ["0.00000000009", "2.04999402381", "22003.91463486980"], ["0.00000000009", "4.91488110218", "213.29909543800"]], [["0.00000144595", "4.27319435148", "6283.07584999140"], ["0.00000006729", "3.91697608662", "12566.15169998280"], ["0.00000000774", "0.00000000000", "0.00000000000"], ["0.00000000247", "3.73019298781", "18849.22754997420"], ["0.00000000036", "2.80081409050", "6286.59896834040"], ["0.00000000033", "5.62216602775", "6127.65545055720"], ["0.00000000019", "3.71292621802", "6438.49624942560"], ["0.00000000016", "4.26011484232", "6525.80445396540"], ["0.00000000016", "3.50416887054", "6256.77753019160"], ["0.00000000014", "3.62127621114", "25132.30339996560"], ["0.00000000011", "4.39200958819", "4705.73230754360"], ["0.00000000011", "5.22327127059", "6040.34724601740"], ["0.00000000010", "4.28045254647", "83996.84731811189"], ["0.00000000009", "1.56864096494", "5507.55323866740"], ["0.00000000011", "1.37795688024", "6309.37416979120"], ["0.00000000010", "5.19937959068", "71430.69561812909"], ["0.00000000009", "0.47275199930", "6279.55273164240"], ["0.00000000009", "0.74642756529", "5729.50644714900"], ["0.00000000007", "2.97374891560", "775.52261132400"], ["0.00000000007", "3.28615691021", "7058.59846131540"], ["0.00000000007", "2.19184402142", "6812.76681508600"], ["0.00000000005", "3.15419034438", "529.69096509460"], ["0.00000000006", "4.54725567047", "1059.38193018920"], ["0.00000000005", "1.51104406936", "7079.37385680780"], ["0.00000000007", "2.98052059053", "6681.22485339960"], ["0.00000000005", "2.30961231391", "12036.46073488820"], ["0.00000000005", "3.71102966917", "6290.18939699220"]], [["0.00000003858", "2.56384387339", "6283.07584999140"], ["0.00000000306", "2.26769501230", "12566.15169998280"], ["0.00000000053", "3.44031471924", "5573.14280143310"], ["0.00000000015", "2.04794573436", "18849.22754997420"], ["0.00000000013", "2.05688873673", "77713.77146812050"], ["0.00000000007", "4.41218854480", "161000.68573767410"], ["0.00000000005", "5.26154653107", "6438.49624942560"], ["0.00000000005", "4.07695126049", "6127.65545055720"], ["0.00000000006", "3.81514213664", "149854.40013480789"], ["0.00000000003", "1.28175749811", "6286.59896834040"]], [["0.00000000086", "1.21579741687", "6283.07584999140"], ["0.00000000012", "0.65617264033", "12566.15169998280"], ["0.00000000001", "0.38068797142", "18849.22754997420"]]] };
    }
  });

  // node_modules/solar_terms.js/dist/data/json/vsop87d-simple.ear.js
  var require_vsop87d_simple_ear = __commonJS({
    "node_modules/solar_terms.js/dist/data/json/vsop87d-simple.ear.js"(exports, module) {
      var Earth_L0 = [[175347046, 0, 0], [3341656, 4.6692568, 6283.07585], [34894, 4.6261, 12566.1517], [3497, 2.7441, 5753.3849], [3418, 2.8289, 3.5231], [3136, 3.6277, 77713.7715], [2676, 4.4181, 7860.4194], [2343, 6.1352, 3930.2097], [1324, 0.7425, 11506.7698], [1273, 2.0371, 529.691], [1199, 1.1096, 1577.3435], [990, 5.233, 5884.927], [902, 2.045, 26.298], [857, 3.508, 398.149], [780, 1.179, 5223.694], [753, 2.533, 5507.553], [505, 4.583, 18849.228], [492, 4.205, 775.523], [357, 2.92, 0.067], [317, 5.849, 11790.629], [284, 1.899, 796.298], [271, 0.315, 10977.079], [243, 0.345, 5486.778], [206, 4.806, 2544.314], [205, 1.869, 5573.143], [202, 2.458, 6069.777], [156, 0.833, 213.299], [132, 3.411, 2942.463], [126, 1.083, 20.775], [115, 0.645, 0.98], [103, 0.636, 4694.003], [102, 0.976, 15720.839], [102, 4.267, 7.114], [99, 6.21, 2146.17], [98, 0.68, 155.42], [86, 5.98, 161000.69], [85, 1.3, 6275.96], [85, 3.67, 71430.7], [80, 1.81, 17260.15], [79, 3.04, 12036.46], [75, 1.76, 5088.63], [74, 3.5, 3154.69], [74, 4.68, 801.82], [70, 0.83, 9437.76], [62, 3.98, 8827.39], [61, 1.82, 7084.9], [57, 2.78, 6286.6], [56, 4.39, 14143.5], [56, 3.47, 6279.55], [52, 0.19, 12139.55], [52, 1.33, 1748.02], [51, 0.28, 5856.48], [49, 0.49, 1194.45], [41, 5.37, 8429.24], [41, 2.4, 19651.05], [39, 6.17, 10447.39], [37, 6.04, 10213.29], [37, 2.57, 1059.38], [36, 1.71, 2352.87], [36, 1.78, 6812.77], [33, 0.59, 17789.85], [30, 0.44, 83996.85], [30, 2.74, 1349.87], [25, 3.16, 4690.48]];
      var Earth_L1 = [[628331966747, 0, 0], [206059, 2.678235, 6283.07585], [4303, 2.6351, 12566.1517], [425, 1.59, 3.523], [119, 5.796, 26.298], [109, 2.966, 1577.344], [93, 2.59, 18849.23], [72, 1.14, 529.69], [68, 1.87, 398.15], [67, 4.41, 5507.55], [59, 2.89, 5223.69], [56, 2.17, 155.42], [45, 0.4, 796.3], [36, 0.47, 775.52], [29, 2.65, 7.11], [21, 5.34, 0.98], [19, 1.85, 5486.78], [19, 4.97, 213.3], [17, 2.99, 6275.96], [16, 0.03, 2544.31], [16, 1.43, 2146.17], [15, 1.21, 10977.08], [12, 2.83, 1748.02], [12, 3.26, 5088.63], [12, 5.27, 1194.45], [12, 2.08, 4694], [11, 0.77, 553.57], [10, 1.3, 6286.6], [10, 4.24, 1349.87], [9, 2.7, 242.73], [9, 5.64, 951.72], [8, 5.3, 2352.87], [6, 2.65, 9437.76], [6, 4.67, 4690.48]];
      var Earth_L2 = [[52919, 0, 0], [8720, 1.0721, 6283.0758], [309, 0.867, 12566.152], [27, 0.05, 3.52], [16, 5.19, 26.3], [16, 3.68, 155.42], [10, 0.76, 18849.23], [9, 2.06, 77713.77], [7, 0.83, 775.52], [5, 4.66, 1577.34], [4, 1.03, 7.11], [4, 3.44, 5573.14], [3, 5.14, 796.3], [3, 6.05, 5507.55], [3, 1.19, 242.73], [3, 6.12, 529.69], [3, 0.31, 398.15], [3, 2.28, 553.57], [2, 4.38, 5223.69], [2, 3.75, 0.98]];
      var Earth_L3 = [[289, 5.844, 6283.076], [35, 0, 0], [17, 5.49, 12566.15], [3, 5.2, 155.42], [1, 4.72, 3.52], [1, 5.3, 18849.23], [1, 5.97, 242.73]];
      var Earth_L4 = [[114, 3.142, 0], [8, 4.13, 6283.08], [1, 3.84, 12566.15]];
      var Earth_L5 = [[1, 3.14, 0]];
      var Earth_B0 = [[280, 3.199, 84334.662], [102, 5.422, 5507.553], [80, 3.88, 5223.69], [44, 3.7, 2352.87], [32, 4, 1577.34]];
      var Earth_B1 = [[9, 3.9, 5507.55], [6, 1.73, 5223.69]];
      var Earth_B2 = [[22378, 3.38509, 10213.28555], [282, 0, 0], [173, 5.256, 20426.571], [27, 3.87, 30639.86]];
      var Earth_B3 = [[647, 4.992, 10213.286], [20, 3.14, 0], [6, 0.77, 20426.57], [3, 5.44, 30639.86]];
      var Earth_B4 = [[14, 0.32, 10213.29]];
      var Earth_R0 = [[100013989, 0, 0], [1670700, 3.0984635, 6283.07585], [13956, 3.05525, 12566.1517], [3084, 5.1985, 77713.7715], [1628, 1.1739, 5753.3849], [1576, 2.8469, 7860.4194], [925, 5.453, 11506.77], [542, 4.564, 3930.21], [472, 3.661, 5884.927], [346, 0.964, 5507.553], [329, 5.9, 5223.694], [307, 0.299, 5573.143], [243, 4.273, 11790.629], [212, 5.847, 1577.344], [186, 5.022, 10977.079], [175, 3.012, 18849.228], [110, 5.055, 5486.778], [98, 0.89, 6069.78], [86, 5.69, 15720.84], [86, 1.27, 161000.69], [65, 0.27, 17260.15], [63, 0.92, 529.69], [57, 2.01, 83996.85], [56, 5.24, 71430.7], [49, 3.25, 2544.31], [47, 2.58, 775.52], [45, 5.54, 9437.76], [43, 6.01, 6275.96], [39, 5.36, 4694], [38, 2.39, 8827.39], [37, 0.83, 19651.05], [37, 4.9, 12139.55], [36, 1.67, 12036.46], [35, 1.84, 2942.46], [33, 0.24, 7084.9], [32, 0.18, 5088.63], [32, 1.78, 398.15], [28, 1.21, 6286.6], [28, 1.9, 6279.55], [26, 4.59, 10447.39]];
      var Earth_R1 = [[103019, 1.10749, 6283.07585], [1721, 1.0644, 12566.1517], [702, 3.142, 0], [32, 1.02, 18849.23], [31, 2.84, 5507.55], [25, 1.32, 5223.69], [18, 1.42, 1577.34], [10, 5.91, 10977.08], [9, 1.42, 6275.96], [9, 0.27, 5486.78]];
      var Earth_R2 = [[4359, 5.7846, 6283.0758], [124, 5.579, 12566.152], [12, 3.14, 0], [9, 3.63, 77713.77], [6, 1.87, 5573.14], [3, 5.47, 18849.23]];
      var Earth_R3 = [[145, 4.273, 6283.076], [7, 3.92, 12566.15]];
      var Earth_R4 = [[4, 2.56, 6283.08]];
      var origin = {
        l: [Earth_L0, Earth_L1, Earth_L2, Earth_L3, Earth_L4, Earth_L5],
        b: [Earth_B0, Earth_B1, Earth_B2, Earth_B3, Earth_B4],
        r: [Earth_R0, Earth_R1, Earth_R2, Earth_R3, Earth_R4]
      };
      Object.keys(origin).map((key) => {
        origin[key].map((arr) => {
          arr.map((row) => {
            row[0] /= 1e8;
          });
        });
      });
      module.exports = origin;
    }
  });

  // node_modules/solar_terms.js/dist/tools/time.js
  var require_time = __commonJS({
    "node_modules/solar_terms.js/dist/tools/time.js"(exports, module) {
      var JD = {
        JD2000: 2451545
      };
      function getDT(jd) {
        return (jd - JD.JD2000) / 365250;
      }
      module.exports = {
        getDT,
        JD
      };
    }
  });

  // node_modules/nutation.js/lib/main.js
  var require_main = __commonJS({
    "node_modules/nutation.js/lib/main.js"(exports, module) {
      !(function(t, e) {
        "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.Nutation = e() : t.Nutation = e();
      })(exports, (() => {
        return t = { 511: (t2) => {
          t2.exports = { l: (t3) => (485866.733 + (715922.633 + (31.31 + 0.064 * t3) * t3) * t3 + 17172e5 * t3) / 3600, l_: (t3) => (1287099804e-3 + (1292581224e-3 + (-0.577 - 0.012 * t3) * t3) * t3 + 128304e3 * t3) / 3600, F: (t3) => (335778.877 + (295263.137 + (0.011 * t3 - 13.257) * t3) * t3 + 1739232e3 * t3) / 3600, D: (t3) => (1072261307e-3 + (1105601328e-3 + (0.019 * t3 - 6.891) * t3) * t3 + 1601856e3 * t3) / 3600, O: (t3) => (450160.28 + ((7.455 + 8e-3 * t3) * t3 - 482890.539) * t3 - 648e4 * t3) / 3600, calcLongitude(t3, e2, i) {
            let [s, o, n, r, l, c, h] = i;
            return (c + h * t3) * Math.sin(e2);
          }, calcObliquity(t3, e2, i) {
            let [s, o, n, r, l, c, h, a, u] = i;
            return (a + u * t3) * Math.cos(e2);
          }, longitudeOffset: () => 0, obliquityOffset: () => 0 };
        }, 536: (t2) => {
          t2.exports = { l: (t3) => 485868.249036 + t3 * (17179159232178e-4 + t3 * (31.8792 + t3 * (0.051635 + -2447e-7 * t3))) / 3600, l_: (t3) => 128710479305e-5 + t3 * (1295965810481e-4 + t3 * (t3 * (136e-6 + -1149e-8 * t3) - 0.5532)) / 3600, F: (t3) => 335779.526232 + t3 * (17395272628478e-4 + t3 * (t3 * (417e-8 * t3 - 1037e-6) - 12.7512)) / 3600, D: (t3) => 107226070369e-5 + t3 * (1602961601209e-3 + t3 * (t3 * (6593e-6 + -3169e-8 * t3) - 6.3706)) / 3600, O: (t3) => 450160.398036 + t3 * (t3 * (7.4722 + t3 * (7702e-6 + -5939e-8 * t3)) - 69628905431e-4) / 3600, calcLongitude(t3, e2, i) {
            let [s, o, n, r, l, c, h, a] = i;
            return (c + h * t3) * Math.sin(e2) + a * Math.cos(e2);
          }, calcObliquity(t3, e2, i) {
            let [s, o, n, r, l, c, h, a, u, g, f] = i;
            return (u + g * t3) * Math.cos(e2) + f * Math.sin(e2);
          } };
        }, 473: (t2) => {
          t2.exports = { l: (t3) => (485868.249036 + 17179159232178e-4 * t3) / 3600, l_: (t3) => (128710479305e-5 + 1295965810481e-4 * t3) / 3600, F: (t3) => (335779.526232 + 17395272628478e-4 * t3) / 3600, D: (t3) => (107226070369e-5 + 1602961601209e-3 * t3) / 3600, O: (t3) => (450160.398036 - 69628905431e-4 * t3) / 3600, calcLongitude(t3, e2, i) {
            let [s, o, n, r, l, c, h, a] = i;
            return (c + h * t3) * Math.sin(e2) + a * Math.cos(e2);
          }, calcObliquity(t3, e2, i) {
            let [s, o, n, r, l, c, h, a, u, g, f] = i;
            return (u + g * t3) * Math.cos(e2) + f * Math.sin(e2);
          }, longitudeOffset: () => -135e-6, obliquityOffset: () => 388e-6 };
        }, 506: (t2) => {
          t2.exports = { coefficient: 1e-4, data: [[0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9], [0, 0, 2, -2, 2, -13187, -1.6, 5736, -3.1], [0, 0, 2, 0, 2, -2274, -0.2, 977, -0.5], [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5], [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1], [1, 0, 0, 0, 0, 712, 0.1, -7, 0], [0, 1, 2, -2, 2, -517, 1.2, 224, -0.6], [0, 0, 2, 0, 1, -386, -0.4, 200, 0], [1, 0, 2, 0, 2, -301, 0, 129, -0.1], [0, -1, 2, -2, 2, 217, -0.5, -95, 0.3], [1, 0, 0, -2, 0, -158, 0, 0, 0], [0, 0, 2, -2, 1, 129, 0.1, -70, 0], [-1, 0, 2, 0, 2, 123, 0, -53, 0], [0, 0, 0, 2, 0, 63, 0, 0, 0], [1, 0, 0, 0, 1, 63, 0.1, -33, 0], [-1, 0, 2, 2, 2, -59, 0, 26, 0], [-1, 0, 0, 0, 1, -58, -0.1, 32, 0], [1, 0, 2, 0, 1, -51, 0, 27, 0], [2, 0, 0, -2, 0, 48, 0, 0, 0], [-2, 0, 2, 0, 1, 46, 0, -24, 0], [0, 0, 2, 2, 2, -38, 0, 16, 0], [2, 0, 2, 0, 2, -31, 0, 13, 0], [2, 0, 0, 0, 0, 29, 0, 0, 0], [1, 0, 2, -2, 2, 29, 0, -12, 0], [0, 0, 2, 0, 0, 26, 0, 0, 0], [0, 0, 2, -2, 0, -22, 0, 0, 0], [-1, 0, 2, 0, 1, 21, 0, -10, 0], [0, 2, 0, 0, 0, 17, -0.1, 0, 0], [-1, 0, 0, 2, 1, 16, 0, -8, 0], [0, 2, 2, -2, 2, -16, 0.1, 7, 0], [0, 1, 0, 0, 1, -15, 0, 9, 0], [1, 0, 0, -2, 1, -13, 0, 7, 0], [0, -1, 0, 0, 1, -12, 0, 6, 0], [2, 0, -2, 0, 0, 11, 0, 0, 0], [-1, 0, 2, 2, 1, -10, 0, 5, 0], [1, 0, 2, 2, 2, -8, 0, 3, 0], [0, 1, 2, 0, 2, 7, 0, -3, 0], [1, 1, 0, -2, 0, -7, 0, 0, 0], [0, -1, 2, 0, 2, -7, 0, 3, 0], [0, 0, 2, 2, 1, -7, 0, 3, 0], [1, 0, 0, 2, 0, 6, 0, 0, 0], [2, 0, 2, -2, 2, 6, 0, -3, 0], [1, 0, 2, -2, 1, 6, 0, -3, 0], [-2, 0, 0, 2, 1, -6, 0, 3, 0], [0, 0, 0, 2, 1, -6, 0, 3, 0], [1, -1, 0, 0, 0, 5, 0, 0, 0], [0, -1, 2, -2, 1, -5, 0, 3, 0], [0, 0, 0, -2, 1, -5, 0, 3, 0], [2, 0, 2, 0, 1, -5, 0, 3, 0], [2, 0, 0, -2, 1, 4, 0, 0, 0], [0, 1, 2, -2, 1, 4, 0, 0, 0], [1, 0, -2, 0, 0, 4, 0, 0, 0], [1, 0, 0, -1, 0, -4, 0, 0, 0], [0, 1, 0, -2, 0, -4, 0, 0, 0], [0, 0, 0, 1, 0, -4, 0, 0, 0], [1, 0, 2, 0, 0, 3, 0, 0, 0], [-2, 0, 2, 0, 2, -3, 0, 0, 0], [1, -1, 0, -1, 0, -3, 0, 0, 0], [1, 1, 0, 0, 0, -3, 0, 0, 0], [1, -1, 2, 0, 2, -3, 0, 0, 0], [-1, -1, 2, 2, 2, -3, 0, 0, 0], [3, 0, 2, 0, 2, -3, 0, 0, 0], [0, -1, 2, 2, 2, -3, 0, 0, 0]] };
        }, 227: (t2) => {
          t2.exports = { coefficient: 1e-4, data: [[0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9], [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5], [-2, 0, 2, 0, 1, 46, 0, -24, 0], [2, 0, -2, 0, 0, 11, 0, 0, 0], [-2, 0, 2, 0, 2, -3, 0, 1, 0], [1, -1, 0, -1, 0, -3, 0, 0, 0], [0, -2, 2, -2, 1, -2, 0, 1, 0], [2, 0, -2, 0, 1, 1, 0, 0, 0], [0, 0, 2, -2, 2, -13187, -1.6, 5736, -3.1], [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1], [0, 1, 2, -2, 2, -517, 1.2, 224, -0.6], [0, -1, 2, -2, 2, 217, -0.5, -95, 0.3], [0, 0, 2, -2, 1, 129, 0.1, -70, 0], [2, 0, 0, -2, 0, 48, 0, 1, 0], [0, 0, 2, -2, 0, -22, 0, 0, 0], [0, 2, 0, 0, 0, 17, -0.1, 0, 0], [0, 1, 0, 0, 1, -15, 0, 9, 0], [0, 2, 2, -2, 2, -16, 0.1, 7, 0], [0, -1, 0, 0, 1, -12, 0, 6, 0], [-2, 0, 0, 2, 1, -6, 0, 3, 0], [0, -1, 2, -2, 1, -5, 0, 3, 0], [2, 0, 0, -2, 1, 4, 0, -2, 0], [0, 1, 2, -2, 1, 4, 0, -2, 0], [1, 0, 0, -1, 0, -4, 0, 0, 0], [2, 1, 0, -2, 0, 1, 0, 0, 0], [0, 0, -2, 2, 1, 1, 0, 0, 0], [0, 1, -2, 2, 0, -1, 0, 0, 0], [0, 1, 0, 0, 2, 1, 0, 0, 0], [-1, 0, 0, 1, 1, 1, 0, 0, 0], [0, 1, 2, -2, 0, -1, 0, 0, 0], [0, 0, 2, 0, 2, -2274, -0.2, 977, -0.5], [1, 0, 0, 0, 0, 712, 0.1, -7, 0], [0, 0, 2, 0, 1, -386, -0.4, 200, 0], [1, 0, 2, 0, 2, -301, 0, 129, -0.1], [1, 0, 0, -2, 0, -158, 0, -1, 0], [-1, 0, 2, 0, 2, 123, 0, -53, 0], [0, 0, 0, 2, 0, 63, 0, -2, 0], [1, 0, 0, 0, 1, 63, 0.1, -33, 0], [-1, 0, 0, 0, 1, -58, -0.1, 32, 0], [-1, 0, 2, 2, 2, -59, 0, 26, 0], [1, 0, 2, 0, 1, -51, 0, 27, 0], [0, 0, 2, 2, 2, -38, 0, 16, 0], [2, 0, 0, 0, 0, 29, 0, -1, 0], [1, 0, 2, -2, 2, 29, 0, -12, 0], [2, 0, 2, 0, 2, -31, 0, 13, 0], [0, 0, 2, 0, 0, 26, 0, -1, 0], [-1, 0, 2, 0, 1, 21, 0, -10, 0], [-1, 0, 0, 2, 1, 16, 0, -8, 0], [1, 0, 0, -2, 1, -13, 0, 7, 0], [-1, 0, 2, 2, 1, -10, 0, 5, 0], [1, 1, 0, -2, 0, -7, 0, 0, 0], [0, 1, 2, 0, 2, 7, 0, -3, 0], [0, -1, 2, 0, 2, -7, 0, 3, 0], [1, 0, 2, 2, 2, -8, 0, 3, 0], [1, 0, 0, 2, 0, 6, 0, 0, 0], [2, 0, 2, -2, 2, 6, 0, -3, 0], [0, 0, 0, 2, 1, -6, 0, 3, 0], [0, 0, 2, 2, 1, -7, 0, 3, 0], [1, 0, 2, -2, 1, 6, 0, -3, 0], [0, 0, 0, -2, 1, -5, 0, 3, 0], [1, -1, 0, 0, 0, 5, 0, 0, 0], [2, 0, 2, 0, 1, -5, 0, 3, 0], [0, 1, 0, -2, 0, -4, 0, 0, 0], [1, 0, -2, 0, 0, 4, 0, 0, 0], [0, 0, 0, 1, 0, -4, 0, 0, 0], [1, 1, 0, 0, 0, -3, 0, 0, 0], [1, 0, 2, 0, 0, 3, 0, 0, 0], [1, -1, 2, 0, 2, -3, 0, 1, 0], [-1, -1, 2, 2, 2, -3, 0, 1, 0], [-2, 0, 0, 0, 1, -2, 0, 1, 0], [3, 0, 2, 0, 2, -3, 0, 1, 0], [0, -1, 2, 2, 2, -3, 0, 1, 0], [1, 1, 2, 0, 2, 2, 0, -1, 0], [-1, 0, 2, -2, 1, -2, 0, 1, 0], [2, 0, 0, 0, 1, 2, 0, -1, 0], [1, 0, 0, 0, 2, -2, 0, 1, 0], [3, 0, 0, 0, 0, 2, 0, 0, 0], [0, 0, 2, 1, 2, 2, 0, -1, 0], [-1, 0, 0, 0, 2, 1, 0, -1, 0], [1, 0, 0, -4, 0, -1, 0, 0, 0], [-2, 0, 2, 2, 2, 1, 0, -1, 0], [-1, 0, 2, 4, 2, -2, 0, 1, 0], [2, 0, 0, -4, 0, -1, 0, 0, 0], [1, 1, 2, -2, 2, 1, 0, -1, 0], [1, 0, 2, 2, 1, -1, 0, 1, 0], [-2, 0, 2, 4, 2, -1, 0, 1, 0], [-1, 0, 4, 0, 2, 1, 0, 0, 0], [1, -1, 0, -2, 0, 1, 0, 0, 0], [2, 0, 2, -2, 1, 1, 0, -1, 0], [2, 0, 2, 2, 2, -1, 0, 0, 0], [1, 0, 0, 2, 1, -1, 0, 0, 0], [0, 0, 4, -2, 2, 1, 0, 0, 0], [3, 0, 2, -2, 2, 1, 0, 0, 0], [1, 0, 2, -2, 0, -1, 0, 0, 0], [0, 1, 2, 0, 1, 1, 0, 0, 0], [-1, -1, 0, 2, 1, 1, 0, 0, 0], [0, 0, -2, 0, 1, -1, 0, 0, 0], [0, 0, 2, -1, 2, -1, 0, 0, 0], [0, 1, 0, 2, 0, -1, 0, 0, 0], [1, 0, -2, -2, 0, -1, 0, 0, 0], [0, -1, 2, 0, 1, -1, 0, 0, 0], [1, 1, 0, -2, 1, -1, 0, 0, 0], [1, 0, -2, 2, 0, -1, 0, 0, 0], [2, 0, 0, 2, 0, 1, 0, 0, 0], [0, 0, 2, 4, 2, -1, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 0, 0]] };
        }, 271: (t2) => {
          t2.exports = { coefficient: 1e-7, data: [[0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331, 9086, 15377], [0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587], [0, 0, 2, 0, 2, -2276413, -234, 2796, 978459, -485, 1374], [0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291], [0, 1, 0, 0, 0, 1475877, -3633, 11817, 73871, -184, -1924], [0, 1, 2, -2, 2, -516821, 1226, -524, 224386, -677, -174], [1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358], [0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318], [1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367], [0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132], [0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39], [-1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4], [-1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82], [1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9], [-1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75], [-1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66], [1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78], [-2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20], [0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29], [0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68], [0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0], [-2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25], [2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59], [1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3], [-1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3], [2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13], [0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11], [0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45], [-1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1], [0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5], [0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13], [1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14], [0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26], [-1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15], [0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10], [1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19], [-2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2], [0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5], [0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14], [0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4], [0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4], [1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1], [2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4], [-2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5], [2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12], [0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3], [0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9], [-1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4], [2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1], [1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2], [0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1], [1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3], [-2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1], [3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7], [0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2], [1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4], [0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2], [-1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3], [-1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2], [0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5], [-2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4], [1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3], [2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2], [-1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0], [1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2], [1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1], [-1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2], [1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0], [-1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139], [0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2], [-1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4], [-1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0], [0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0], [1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4], [-2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2], [-1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2], [1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0], [-2, 0, 2, 4, 2, -1214, 0, 5, 518, 0, 2], [-1, 0, 4, 0, 2, 1146, 0, -3, -490, 0, -1], [2, 0, 2, -2, 1, 1019, 0, -1, -527, 0, -1], [2, 0, 2, 2, 2, -1100, 0, 9, 465, 0, 4], [1, 0, 0, 2, 1, -970, 0, 2, 496, 0, 1], [3, 0, 0, 0, 0, 1575, 0, -6, -50, 0, 0], [3, 0, 2, -2, 2, 934, 0, -3, -399, 0, -1], [0, 0, 4, -2, 2, 922, 0, -1, -395, 0, -1], [0, 1, 2, 0, 1, 815, 0, -1, -422, 0, -1], [0, 0, -2, 2, 1, 834, 0, 2, -440, 0, 1], [0, 0, 2, -2, 3, 1248, 0, 0, -170, 0, 1], [-1, 0, 0, 4, 0, 1338, 0, -5, -39, 0, 0], [2, 0, -2, 0, 1, 716, 0, -2, -389, 0, -1], [-2, 0, 0, 4, 0, 1282, 0, -3, -23, 0, 1], [-1, -1, 0, 2, 1, 742, 0, 1, -391, 0, 0], [-1, 0, 0, 1, 1, 1020, 0, -25, -495, 0, -10], [0, 1, 0, 0, 2, 715, 0, -4, -326, 0, 2], [0, 0, -2, 0, 1, -666, 0, -3, 369, 0, -1], [0, -1, 2, 0, 1, -667, 0, 1, 346, 0, 1], [0, 0, 2, -1, 2, -704, 0, 0, 304, 0, 0], [0, 0, 2, 4, 2, -694, 0, 5, 294, 0, 2], [-2, -1, 0, 2, 0, -1014, 0, -1, 4, 0, -1], [1, 1, 0, -2, 1, -585, 0, -2, 316, 0, -1], [-1, 1, 0, 2, 0, -949, 0, 1, 8, 0, -1], [-1, 1, 0, 1, 2, -595, 0, 0, 258, 0, 0], [1, -1, 0, 0, 1, 528, 0, 0, -279, 0, 0], [1, -1, 2, 2, 2, -590, 0, 4, 252, 0, 2], [-1, 1, 2, 2, 2, 570, 0, -2, -244, 0, -1], [3, 0, 2, 0, 1, -502, 0, 3, 250, 0, 2], [0, 1, -2, 2, 0, -875, 0, 1, 29, 0, 0], [-1, 0, 0, -2, 1, -492, 0, -3, 275, 0, -1], [0, 1, 2, 2, 2, 535, 0, -2, -228, 0, -1], [-1, -1, 2, 2, 1, -467, 0, 1, 240, 0, 1], [0, -1, 0, 0, 2, 591, 0, 0, -253, 0, 0], [1, 0, 2, -4, 1, -453, 0, -1, 244, 0, -1], [-1, 0, -2, 2, 0, 766, 0, 1, 9, 0, 0], [0, -1, 2, 2, 1, -446, 0, 2, 225, 0, 1], [2, -1, 2, 0, 2, -488, 0, 2, 207, 0, 1], [0, 0, 0, 2, 2, -468, 0, 0, 201, 0, 0], [1, -1, 2, 0, 1, -421, 0, 1, 216, 0, 1], [-1, 1, 2, 0, 2, 463, 0, 0, -200, 0, 0], [0, 1, 0, 2, 0, -673, 0, 2, 14, 0, 0], [0, -1, -2, 2, 0, 658, 0, 0, -2, 0, 0], [0, 3, 2, -2, 2, -438, 0, 0, 188, 0, 0], [0, 0, 0, 1, 1, -390, 0, 0, 205, 0, 0], [-1, 0, 2, 2, 0, 639, -11, -2, -19, 0, 0], [2, 1, 2, 0, 2, 412, 0, -2, -176, 0, -1], [1, 1, 0, 0, 1, -361, 0, 0, 189, 0, 0], [1, 1, 2, 0, 1, 360, 0, -1, -185, 0, -1], [2, 0, 0, 2, 0, 588, 0, -3, -24, 0, 0], [1, 0, -2, 2, 0, -578, 0, 1, 5, 0, 0], [-1, 0, 0, 2, 2, -396, 0, 0, 171, 0, 0], [0, 1, 0, 1, 0, 565, 0, -1, -6, 0, 0], [0, 1, 0, -2, 1, -335, 0, -1, 184, 0, -1], [-1, 0, 2, -2, 2, 357, 0, 1, -154, 0, 0], [0, 0, 0, -1, 1, 321, 0, 1, -174, 0, 0], [-1, 1, 0, 0, 1, -301, 0, -1, 162, 0, 0], [1, 0, 2, -1, 2, -334, 0, 0, 144, 0, 0], [1, -1, 0, 2, 0, 493, 0, -2, -15, 0, 0], [0, 0, 0, 4, 0, 494, 0, -2, -19, 0, 0], [1, 0, 2, 1, 2, 337, 0, -1, -143, 0, -1], [0, 0, 2, 1, 1, 280, 0, -1, -144, 0, 0], [1, 0, 0, -2, 2, 309, 0, 1, -134, 0, 0], [-1, 0, 2, 4, 1, -263, 0, 2, 131, 0, 1], [1, 0, -2, 0, 1, 253, 0, 1, -138, 0, 0], [1, 1, 2, -2, 1, 245, 0, 0, -128, 0, 0], [0, 0, 2, 2, 0, 416, 0, -2, -17, 0, 0], [-1, 0, 2, -1, 1, -229, 0, 0, 128, 0, 0], [-2, 0, 2, 2, 1, 231, 0, 0, -120, 0, 0], [4, 0, 2, 0, 2, -259, 0, 2, 109, 0, 1], [2, -1, 0, 0, 0, 375, 0, -1, -8, 0, 0], [2, 1, 2, -2, 2, 252, 0, 0, -108, 0, 0], [0, 1, 2, 1, 2, -245, 0, 1, 104, 0, 0], [1, 0, 4, -2, 2, 243, 0, -1, -104, 0, 0], [-1, -1, 0, 0, 1, 208, 0, 1, -112, 0, 0], [0, 1, 0, 2, 1, 199, 0, 0, -102, 0, 0], [-2, 0, 2, 4, 1, -208, 0, 1, 105, 0, 0], [2, 0, 2, 0, 0, 335, 0, -2, -14, 0, 0], [1, 0, 0, 1, 0, -325, 0, 1, 7, 0, 0], [-1, 0, 0, 4, 1, -187, 0, 0, 96, 0, 0], [-1, 0, 4, 0, 1, 197, 0, -1, -100, 0, 0], [2, 0, 2, 2, 1, -192, 0, 2, 94, 0, 1], [0, 0, 2, -3, 2, -188, 0, 0, 83, 0, 0], [-1, -2, 0, 2, 0, 276, 0, 0, -2, 0, 0], [2, 1, 0, 0, 0, -286, 0, 1, 6, 0, 0], [0, 0, 4, 0, 2, 186, 0, -1, -79, 0, 0], [0, 0, 0, 0, 3, -219, 0, 0, 43, 0, 0], [0, 3, 0, 0, 0, 276, 0, 0, 2, 0, 0], [0, 0, 2, -4, 1, -153, 0, -1, 84, 0, 0], [0, -1, 0, 2, 1, -156, 0, 0, 81, 0, 0], [0, 0, 0, 4, 1, -154, 0, 1, 78, 0, 0], [-1, -1, 2, 4, 2, -174, 0, 1, 75, 0, 0], [1, 0, 2, 4, 2, -163, 0, 2, 69, 0, 1], [-2, 2, 0, 2, 0, -228, 0, 0, 1, 0, 0], [-2, -1, 2, 0, 1, 91, 0, -4, -54, 0, -2], [-2, 0, 0, 2, 2, 175, 0, 0, -75, 0, 0], [-1, -1, 2, 0, 2, -159, 0, 0, 69, 0, 0], [0, 0, 4, -2, 1, 141, 0, 0, -72, 0, 0], [3, 0, 2, -2, 1, 147, 0, 0, -75, 0, 0], [-2, -1, 0, 2, 1, -132, 0, 0, 69, 0, 0], [1, 0, 0, -1, 1, 159, 0, -28, -54, 0, 11], [0, -2, 0, 2, 0, 213, 0, 0, -4, 0, 0], [-2, 0, 0, 4, 1, 123, 0, 0, -64, 0, 0], [-3, 0, 0, 0, 1, -118, 0, -1, 66, 0, 0], [1, 1, 2, 2, 2, 144, 0, -1, -61, 0, 0], [0, 0, 2, 4, 1, -121, 0, 1, 60, 0, 0], [3, 0, 2, 2, 2, -134, 0, 1, 56, 0, 1], [-1, 1, 2, -2, 1, -105, 0, 0, 57, 0, 0], [2, 0, 0, -4, 1, -102, 0, 0, 56, 0, 0], [0, 0, 0, -2, 2, 120, 0, 0, -52, 0, 0], [2, 0, 2, -4, 1, 101, 0, 0, -54, 0, 0], [-1, 1, 0, 2, 1, -113, 0, 0, 59, 0, 0], [0, 0, 2, -1, 1, -106, 0, 0, 61, 0, 0], [0, -2, 2, 2, 2, -129, 0, 1, 55, 0, 0], [2, 0, 0, 2, 1, -114, 0, 0, 57, 0, 0], [4, 0, 2, -2, 2, 113, 0, -1, -49, 0, 0], [2, 0, 0, -2, 2, -102, 0, 0, 44, 0, 0], [0, 2, 0, 0, 1, -94, 0, 0, 51, 0, 0], [1, 0, 0, -4, 1, -100, 0, -1, 56, 0, 0], [0, 2, 2, -2, 1, 87, 0, 0, -47, 0, 0], [-3, 0, 0, 4, 0, 161, 0, 0, -1, 0, 0], [-1, 1, 2, 0, 1, 96, 0, 0, -50, 0, 0], [-1, -1, 0, 4, 0, 151, 0, -1, -5, 0, 0], [-1, -2, 2, 2, 2, -104, 0, 0, 44, 0, 0], [-2, -1, 2, 4, 2, -110, 0, 0, 48, 0, 0], [1, -1, 2, 2, 1, -100, 0, 1, 50, 0, 0], [-2, 1, 0, 2, 0, 92, 0, -5, 12, 0, -2], [-2, 1, 2, 0, 1, 82, 0, 0, -45, 0, 0], [2, 1, 0, -2, 1, 82, 0, 0, -45, 0, 0], [-3, 0, 2, 0, 1, -78, 0, 0, 41, 0, 0], [-2, 0, 2, -2, 1, -77, 0, 0, 43, 0, 0], [-1, 1, 0, 2, 2, 2, 0, 0, 54, 0, 0], [0, -1, 2, -1, 2, 94, 0, 0, -40, 0, 0], [-1, 0, 4, -2, 2, -93, 0, 0, 40, 0, 0], [0, -2, 2, 0, 2, -83, 0, 10, 40, 0, -2], [-1, 0, 2, 1, 2, 83, 0, 0, -36, 0, 0], [2, 0, 0, 0, 2, -91, 0, 0, 39, 0, 0], [0, 0, 2, 0, 3, 128, 0, 0, -1, 0, 0], [-2, 0, 4, 0, 2, -79, 0, 0, 34, 0, 0], [-1, 0, -2, 0, 1, -83, 0, 0, 47, 0, 0], [-1, 1, 2, 2, 1, 84, 0, 0, -44, 0, 0], [3, 0, 0, 0, 1, 83, 0, 0, -43, 0, 0], [-1, 0, 2, 3, 2, 91, 0, 0, -39, 0, 0], [2, -1, 2, 0, 1, -77, 0, 0, 39, 0, 0], [0, 1, 2, 2, 1, 84, 0, 0, -43, 0, 0], [0, -1, 2, 4, 2, -92, 0, 1, 39, 0, 0], [2, -1, 2, 2, 2, -92, 0, 1, 39, 0, 0], [0, 2, -2, 2, 0, -94, 0, 0, 0, 0, 0], [-1, -1, 2, -1, 1, 68, 0, 0, -36, 0, 0], [0, -2, 0, 0, 1, -61, 0, 0, 32, 0, 0], [1, 0, 2, -4, 2, 71, 0, 0, -31, 0, 0], [1, -1, 0, -2, 1, 62, 0, 0, -34, 0, 0], [-1, -1, 2, 0, 1, -63, 0, 0, 33, 0, 0], [1, -1, 2, -2, 2, -73, 0, 0, 32, 0, 0], [-2, -1, 0, 4, 0, 115, 0, 0, -2, 0, 0], [-1, 0, 0, 3, 0, -103, 0, 0, 2, 0, 0], [-2, -1, 2, 2, 2, 63, 0, 0, -28, 0, 0], [0, 2, 2, 0, 2, 74, 0, 0, -32, 0, 0], [1, 1, 0, 2, 0, -103, 0, -3, 3, 0, -1], [2, 0, 2, -1, 2, -69, 0, 0, 30, 0, 0], [1, 0, 2, 1, 1, 57, 0, 0, -29, 0, 0], [4, 0, 0, 0, 0, 94, 0, 0, -4, 0, 0], [2, 1, 2, 0, 1, 64, 0, 0, -33, 0, 0], [3, -1, 2, 0, 2, -63, 0, 0, 26, 0, 0], [-2, 2, 0, 2, 1, -38, 0, 0, 20, 0, 0], [1, 0, 2, -3, 1, -43, 0, 0, 24, 0, 0], [1, 1, 2, -4, 1, -45, 0, 0, 23, 0, 0], [-1, -1, 2, -2, 1, 47, 0, 0, -24, 0, 0], [0, -1, 0, -1, 1, -48, 0, 0, 25, 0, 0], [0, -1, 0, -2, 1, 45, 0, 0, -26, 0, 0], [-2, 0, 0, 0, 2, 56, 0, 0, -25, 0, 0], [-2, 0, -2, 2, 0, 88, 0, 0, 2, 0, 0], [-1, 0, -2, 4, 0, -75, 0, 0, 0, 0, 0], [1, -2, 0, 0, 0, 85, 0, 0, 0, 0, 0], [0, 1, 0, 1, 1, 49, 0, 0, -26, 0, 0], [-1, 2, 0, 2, 0, -74, 0, -3, -1, 0, -1], [1, -1, 2, -2, 1, -39, 0, 0, 21, 0, 0], [1, 2, 2, -2, 2, 45, 0, 0, -20, 0, 0], [2, -1, 2, -2, 2, 51, 0, 0, -22, 0, 0], [1, 0, 2, -1, 1, -40, 0, 0, 21, 0, 0], [2, 1, 2, -2, 1, 41, 0, 0, -21, 0, 0], [-2, 0, 0, -2, 1, -42, 0, 0, 24, 0, 0], [1, -2, 2, 0, 2, -51, 0, 0, 22, 0, 0], [0, 1, 2, 1, 1, -42, 0, 0, 22, 0, 0], [1, 0, 4, -2, 1, 39, 0, 0, -21, 0, 0], [-2, 0, 4, 2, 2, 46, 0, 0, -18, 0, 0], [1, 1, 2, 1, 2, -53, 0, 0, 22, 0, 0], [1, 0, 0, 4, 0, 82, 0, 0, -4, 0, 0], [1, 0, 2, 2, 0, 81, 0, -1, -4, 0, 0], [2, 0, 2, 1, 2, 47, 0, 0, -19, 0, 0], [3, 1, 2, 0, 2, 53, 0, 0, -23, 0, 0], [4, 0, 2, 0, 1, -45, 0, 0, 22, 0, 0], [-2, -1, 2, 0, 0, -44, 0, 0, -2, 0, 0], [0, 1, -2, 2, 1, -33, 0, 0, 16, 0, 0], [1, 0, -2, 1, 0, -61, 0, 0, 1, 0, 0], [0, -1, -2, 2, 1, 28, 0, 0, -15, 0, 0], [2, -1, 0, -2, 1, -38, 0, 0, 19, 0, 0], [-1, 0, 2, -1, 2, -33, 0, 0, 21, 0, 0], [1, 0, 2, -3, 2, -60, 0, 0, 0, 0, 0], [0, 1, 2, -2, 3, 48, 0, 0, -10, 0, 0], [0, 0, 2, -3, 1, 27, 0, 0, -14, 0, 0], [-1, 0, -2, 2, 1, 38, 0, 0, -20, 0, 0], [0, 0, 2, -4, 2, 31, 0, 0, -13, 0, 0], [-2, 1, 0, 0, 1, -29, 0, 0, 15, 0, 0], [-1, 0, 0, -1, 1, 28, 0, 0, -15, 0, 0], [2, 0, 2, -4, 2, -32, 0, 0, 15, 0, 0], [0, 0, 4, -4, 4, 45, 0, 0, -8, 0, 0], [0, 0, 4, -4, 2, -44, 0, 0, 19, 0, 0], [-1, -2, 0, 2, 1, 28, 0, 0, -15, 0, 0], [-2, 0, 0, 3, 0, -51, 0, 0, 0, 0, 0], [1, 0, -2, 2, 1, -36, 0, 0, 20, 0, 0], [-3, 0, 2, 2, 2, 44, 0, 0, -19, 0, 0], [-3, 0, 2, 2, 1, 26, 0, 0, -14, 0, 0], [-2, 0, 2, 2, 0, -60, 0, 0, 2, 0, 0], [2, -1, 0, 0, 1, 35, 0, 0, -18, 0, 0], [-2, 1, 2, 2, 2, -27, 0, 0, 11, 0, 0], [1, 1, 0, 1, 0, 47, 0, 0, -1, 0, 0], [0, 1, 4, -2, 2, 36, 0, 0, -15, 0, 0], [-1, 1, 0, -2, 1, -36, 0, 0, 20, 0, 0], [0, 0, 0, -4, 1, -35, 0, 0, 19, 0, 0], [1, -1, 0, 2, 1, -37, 0, 0, 19, 0, 0], [1, 1, 0, 2, 1, 32, 0, 0, -16, 0, 0], [-1, 2, 2, 2, 2, 35, 0, 0, -14, 0, 0], [3, 1, 2, -2, 2, 32, 0, 0, -13, 0, 0], [0, -1, 0, 4, 0, 65, 0, 0, -2, 0, 0], [2, -1, 0, 2, 0, 47, 0, 0, -1, 0, 0], [0, 0, 4, 0, 1, 32, 0, 0, -16, 0, 0], [2, 0, 4, -2, 2, 37, 0, 0, -16, 0, 0], [-1, -1, 2, 4, 1, -30, 0, 0, 15, 0, 0], [1, 0, 0, 4, 1, -32, 0, 0, 16, 0, 0], [1, -2, 2, 2, 2, -31, 0, 0, 13, 0, 0], [0, 0, 2, 3, 2, 37, 0, 0, -16, 0, 0], [-1, 1, 2, 4, 2, 31, 0, 0, -13, 0, 0], [3, 0, 0, 2, 0, 49, 0, 0, -2, 0, 0], [-1, 0, 4, 2, 2, 32, 0, 0, -13, 0, 0], [1, 1, 2, 2, 1, 23, 0, 0, -12, 0, 0], [-2, 0, 2, 6, 2, -43, 0, 0, 18, 0, 0], [2, 1, 2, 2, 2, 26, 0, 0, -11, 0, 0], [-1, 0, 2, 6, 2, -32, 0, 0, 14, 0, 0], [1, 0, 2, 4, 1, -29, 0, 0, 14, 0, 0], [2, 0, 2, 4, 2, -27, 0, 0, 12, 0, 0], [1, 1, -2, 1, 0, 30, 0, 0, 0, 0, 0], [-3, 1, 2, 1, 2, -11, 0, 0, 5, 0, 0], [2, 0, -2, 0, 2, -21, 0, 0, 10, 0, 0], [-1, 0, 0, 1, 2, -34, 0, 0, 15, 0, 0], [-4, 0, 2, 2, 1, -10, 0, 0, 6, 0, 0], [-1, -1, 0, 1, 0, -36, 0, 0, 0, 0, 0], [0, 0, -2, 2, 2, -9, 0, 0, 4, 0, 0], [1, 0, 0, -1, 2, -12, 0, 0, 5, 0, 0], [0, -1, 2, -2, 3, -21, 0, 0, 5, 0, 0], [-2, 1, 2, 0, 0, -29, 0, 0, -1, 0, 0], [0, 0, 2, -2, 4, -15, 0, 0, 3, 0, 0], [-2, -2, 0, 2, 0, -20, 0, 0, 0, 0, 0], [-2, 0, -2, 4, 0, 28, 0, 0, 0, 0, -2], [0, -2, -2, 2, 0, 17, 0, 0, 0, 0, 0], [1, 2, 0, -2, 1, -22, 0, 0, 12, 0, 0], [3, 0, 0, -4, 1, -14, 0, 0, 7, 0, 0], [-1, 1, 2, -2, 2, 24, 0, 0, -11, 0, 0], [1, -1, 2, -4, 1, 11, 0, 0, -6, 0, 0], [1, 1, 0, -2, 2, 14, 0, 0, -6, 0, 0], [-3, 0, 2, 0, 0, 24, 0, 0, 0, 0, 0], [-3, 0, 2, 0, 2, 18, 0, 0, -8, 0, 0], [-2, 0, 0, 1, 0, -38, 0, 0, 0, 0, 0], [0, 0, -2, 1, 0, -31, 0, 0, 0, 0, 0], [-3, 0, 0, 2, 1, -16, 0, 0, 8, 0, 0], [-1, -1, -2, 2, 0, 29, 0, 0, 0, 0, 0], [0, 1, 2, -4, 1, -18, 0, 0, 10, 0, 0], [2, 1, 0, -4, 1, -10, 0, 0, 5, 0, 0], [0, 2, 0, -2, 1, -17, 0, 0, 10, 0, 0], [1, 0, 0, -3, 1, 9, 0, 0, -4, 0, 0], [-2, 0, 2, -2, 2, 16, 0, 0, -6, 0, 0], [-2, -1, 0, 0, 1, 22, 0, 0, -12, 0, 0], [-4, 0, 0, 2, 0, 20, 0, 0, 0, 0, 0], [1, 1, 0, -4, 1, -13, 0, 0, 6, 0, 0], [-1, 0, 2, -4, 1, -17, 0, 0, 9, 0, 0], [0, 0, 4, -4, 1, -14, 0, 0, 8, 0, 0], [0, 3, 2, -2, 2, 0, 0, 0, -7, 0, 0], [-3, -1, 0, 4, 0, 14, 0, 0, 0, 0, 0], [-3, 0, 0, 4, 1, 19, 0, 0, -10, 0, 0], [1, -1, -2, 2, 0, -34, 0, 0, 0, 0, 0], [-1, -1, 0, 2, 2, -20, 0, 0, 8, 0, 0], [1, -2, 0, 0, 1, 9, 0, 0, -5, 0, 0], [1, -1, 0, 0, 2, -18, 0, 0, 7, 0, 0], [0, 0, 0, 1, 2, 13, 0, 0, -6, 0, 0], [-1, -1, 2, 0, 0, 17, 0, 0, 0, 0, 0], [1, -2, 2, -2, 2, -12, 0, 0, 5, 0, 0], [0, -1, 2, -1, 1, 15, 0, 0, -8, 0, 0], [-1, 0, 2, 0, 3, -11, 0, 0, 3, 0, 0], [1, 1, 0, 0, 2, 13, 0, 0, -5, 0, 0], [-1, 1, 2, 0, 0, -18, 0, 0, 0, 0, 0], [1, 2, 0, 0, 0, -35, 0, 0, 0, 0, 0], [-1, 2, 2, 0, 2, 9, 0, 0, -4, 0, 0], [-1, 0, 4, -2, 1, -19, 0, 0, 10, 0, 0], [3, 0, 2, -4, 2, -26, 0, 0, 11, 0, 0], [1, 2, 2, -2, 1, 8, 0, 0, -4, 0, 0], [1, 0, 4, -4, 2, -10, 0, 0, 4, 0, 0], [-2, -1, 0, 4, 1, 10, 0, 0, -6, 0, 0], [0, -1, 0, 2, 2, -21, 0, 0, 9, 0, 0], [-2, 1, 0, 4, 0, -15, 0, 0, 0, 0, 0], [-2, -1, 2, 2, 1, 9, 0, 0, -5, 0, 0], [2, 0, -2, 2, 0, -29, 0, 0, 0, 0, 0], [1, 0, 0, 1, 1, -19, 0, 0, 10, 0, 0], [0, 1, 0, 2, 2, 12, 0, 0, -5, 0, 0], [1, -1, 2, -1, 2, 22, 0, 0, -9, 0, 0], [-2, 0, 4, 0, 1, -10, 0, 0, 5, 0, 0], [2, 1, 0, 0, 1, -20, 0, 0, 11, 0, 0], [0, 1, 2, 0, 0, -20, 0, 0, 0, 0, 0], [0, -1, 4, -2, 2, -17, 0, 0, 7, 0, 0], [0, 0, 4, -2, 4, 15, 0, 0, -3, 0, 0], [0, 2, 2, 0, 1, 8, 0, 0, -4, 0, 0], [-3, 0, 0, 6, 0, 14, 0, 0, 0, 0, 0], [-1, -1, 0, 4, 1, -12, 0, 0, 6, 0, 0], [1, -2, 0, 2, 0, 25, 0, 0, 0, 0, 0], [-1, 0, 0, 4, 2, -13, 0, 0, 6, 0, 0], [-1, -2, 2, 2, 1, -14, 0, 0, 8, 0, 0], [-1, 0, 0, -2, 2, 13, 0, 0, -5, 0, 0], [1, 0, -2, -2, 1, -17, 0, 0, 9, 0, 0], [0, 0, -2, -2, 1, -12, 0, 0, 6, 0, 0], [-2, 0, -2, 0, 1, -10, 0, 0, 5, 0, 0], [0, 0, 0, 3, 1, 10, 0, 0, -6, 0, 0], [0, 0, 0, 3, 0, -15, 0, 0, 0, 0, 0], [-1, 1, 0, 4, 0, -22, 0, 0, 0, 0, 0], [-1, -1, 2, 2, 0, 28, 0, 0, -1, 0, 0], [-2, 0, 2, 3, 2, 15, 0, 0, -7, 0, 0], [1, 0, 0, 2, 2, 23, 0, 0, -10, 0, 0], [0, -1, 2, 1, 2, 12, 0, 0, -5, 0, 0], [3, -1, 0, 0, 0, 29, 0, 0, -1, 0, 0], [2, 0, 0, 1, 0, -25, 0, 0, 1, 0, 0], [1, -1, 2, 0, 0, 22, 0, 0, 0, 0, 0], [0, 0, 2, 1, 0, -18, 0, 0, 0, 0, 0], [1, 0, 2, 0, 3, 15, 0, 0, 3, 0, 0], [3, 1, 0, 0, 0, -23, 0, 0, 0, 0, 0], [3, -1, 2, -2, 2, 12, 0, 0, -5, 0, 0], [2, 0, 2, -1, 1, -8, 0, 0, 4, 0, 0], [1, 1, 2, 0, 0, -19, 0, 0, 0, 0, 0], [0, 0, 4, -1, 2, -10, 0, 0, 4, 0, 0], [1, 2, 2, 0, 2, 21, 0, 0, -9, 0, 0], [-2, 0, 0, 6, 0, 23, 0, 0, -1, 0, 0], [0, -1, 0, 4, 1, -16, 0, 0, 8, 0, 0], [-2, -1, 2, 4, 1, -19, 0, 0, 9, 0, 0], [0, -2, 2, 2, 1, -22, 0, 0, 10, 0, 0], [0, -1, 2, 2, 0, 27, 0, 0, -1, 0, 0], [-1, 0, 2, 3, 1, 16, 0, 0, -8, 0, 0], [-2, 1, 2, 4, 2, 19, 0, 0, -8, 0, 0], [2, 0, 0, 2, 2, 9, 0, 0, -4, 0, 0], [2, -2, 2, 0, 2, -9, 0, 0, 4, 0, 0], [-1, 1, 2, 3, 2, -9, 0, 0, 4, 0, 0], [3, 0, 2, -1, 2, -8, 0, 0, 4, 0, 0], [4, 0, 2, -2, 1, 18, 0, 0, -9, 0, 0], [-1, 0, 0, 6, 0, 16, 0, 0, -1, 0, 0], [-1, -2, 2, 4, 2, -10, 0, 0, 4, 0, 0], [-3, 0, 2, 6, 2, -23, 0, 0, 9, 0, 0], [-1, 0, 2, 4, 0, 16, 0, 0, -1, 0, 0], [3, 0, 0, 2, 1, -12, 0, 0, 6, 0, 0], [3, -1, 2, 0, 1, -8, 0, 0, 4, 0, 0], [3, 0, 2, 0, 0, 30, 0, 0, -2, 0, 0], [1, 0, 4, 0, 2, 24, 0, 0, -10, 0, 0], [5, 0, 2, -2, 2, 10, 0, 0, -4, 0, 0], [0, -1, 2, 4, 1, -16, 0, 0, 7, 0, 0], [2, -1, 2, 2, 1, -16, 0, 0, 7, 0, 0], [0, 1, 2, 4, 2, 17, 0, 0, -7, 0, 0], [1, -1, 2, 4, 2, -24, 0, 0, 10, 0, 0], [3, -1, 2, 2, 2, -12, 0, 0, 5, 0, 0], [3, 0, 2, 2, 1, -24, 0, 0, 11, 0, 0], [5, 0, 2, 0, 2, -23, 0, 0, 9, 0, 0], [0, 0, 2, 6, 2, -13, 0, 0, 5, 0, 0], [4, 0, 2, 2, 2, -15, 0, 0, 7, 0, 0], [0, -1, 1, -1, 1, 0, 0, -1988, 0, 0, -1679], [-1, 0, 1, 0, 3, 0, 0, -63, 0, 0, -27], [0, -2, 2, -2, 3, -4, 0, 0, 0, 0, 0], [1, 0, -1, 0, 1, 0, 0, 5, 0, 0, 4], [2, -2, 0, -2, 1, 5, 0, 0, -3, 0, 0], [-1, 0, 1, 0, 2, 0, 0, 364, 0, 0, 176], [-1, 0, 1, 0, 1, 0, 0, -1044, 0, 0, -891], [-1, -1, 2, -1, 2, -3, 0, 0, 1, 0, 0], [-2, 2, 0, 2, 2, 4, 0, 0, -2, 0, 0], [-1, 0, 1, 0, 0, 0, 0, 330, 0, 0, 0], [-4, 1, 2, 2, 2, 5, 0, 0, -2, 0, 0], [-3, 0, 2, 1, 1, 3, 0, 0, -2, 0, 0], [-2, -1, 2, 0, 2, -3, 0, 0, 1, 0, 0], [1, 0, -2, 1, 1, -5, 0, 0, 2, 0, 0], [2, -1, -2, 0, 1, 3, 0, 0, -1, 0, 0], [-4, 0, 2, 2, 0, 3, 0, 0, 0, 0, 0], [-3, 1, 0, 3, 0, 3, 0, 0, 0, 0, 0], [-1, 0, -1, 2, 0, 0, 0, 5, 0, 0, 0], [0, -2, 0, 0, 2, 0, 0, 0, 1, 0, 0], [0, -2, 0, 0, 2, 4, 0, 0, -2, 0, 0], [-3, 0, 0, 3, 0, 6, 0, 0, 0, 0, 0], [-2, -1, 0, 2, 2, 5, 0, 0, -2, 0, 0], [-1, 0, -2, 3, 0, -7, 0, 0, 0, 0, 0], [-4, 0, 0, 4, 0, -12, 0, 0, 0, 0, 0], [2, 1, -2, 0, 1, 5, 0, 0, -3, 0, 0], [2, -1, 0, -2, 2, 3, 0, 0, -1, 0, 0], [0, 0, 1, -1, 0, -5, 0, 0, 0, 0, 0], [-1, 2, 0, 1, 0, 3, 0, 0, 0, 0, 0], [-2, 1, 2, 0, 2, -7, 0, 0, 3, 0, 0], [1, 1, 0, -1, 1, 7, 0, 0, -4, 0, 0], [1, 0, 1, -2, 1, 0, 0, -12, 0, 0, -10], [0, 2, 0, 0, 2, 4, 0, 0, -2, 0, 0], [1, -1, 2, -3, 1, 3, 0, 0, -2, 0, 0], [-1, 1, 2, -1, 1, -3, 0, 0, 2, 0, 0], [-2, 0, 4, -2, 2, -7, 0, 0, 3, 0, 0], [-2, 0, 4, -2, 1, -4, 0, 0, 2, 0, 0], [-2, -2, 0, 2, 1, -3, 0, 0, 1, 0, 0], [-2, 0, -2, 4, 0, 0, 0, 0, 0, 0, 0], [1, 2, 2, -4, 1, -3, 0, 0, 1, 0, 0], [1, 1, 2, -4, 2, 7, 0, 0, -3, 0, 0], [-1, 2, 2, -2, 1, -4, 0, 0, 2, 0, 0], [2, 0, 0, -3, 1, 4, 0, 0, -2, 0, 0], [-1, 2, 0, 0, 1, -5, 0, 0, 3, 0, 0], [0, 0, 0, -2, 0, 5, 0, 0, 0, 0, 0], [-1, -1, 2, -2, 2, -5, 0, 0, 2, 0, 0], [-1, 1, 0, 0, 2, 5, 0, 0, -2, 0, 0], [0, 0, 0, -1, 2, -8, 0, 0, 3, 0, 0], [-2, 1, 0, 1, 0, 9, 0, 0, 0, 0, 0], [1, -2, 0, -2, 1, 6, 0, 0, -3, 0, 0], [1, 0, -2, 0, 2, -5, 0, 0, 2, 0, 0], [-3, 1, 0, 2, 0, 3, 0, 0, 0, 0, 0], [-1, 1, -2, 2, 0, -7, 0, 0, 0, 0, 0], [-1, -1, 0, 0, 2, -3, 0, 0, 1, 0, 0], [-3, 0, 0, 2, 0, 5, 0, 0, 0, 0, 0], [-3, -1, 0, 2, 0, 3, 0, 0, 0, 0, 0], [2, 0, 2, -6, 1, -3, 0, 0, 2, 0, 0], [0, 1, 2, -4, 2, 4, 0, 0, -2, 0, 0], [2, 0, 0, -4, 2, 3, 0, 0, -1, 0, 0], [-2, 1, 2, -2, 1, -5, 0, 0, 2, 0, 0], [0, -1, 2, -4, 1, 4, 0, 0, -2, 0, 0], [0, 1, 0, -2, 2, 9, 0, 0, -3, 0, 0], [-1, 0, 0, -2, 0, 4, 0, 0, 0, 0, 0], [2, 0, -2, -2, 1, 4, 0, 0, -2, 0, 0], [-4, 0, 2, 0, 1, -3, 0, 0, 2, 0, 0], [-1, -1, 0, -1, 1, -4, 0, 0, 2, 0, 0], [0, 0, -2, 0, 2, 9, 0, 0, -3, 0, 0], [-3, 0, 0, 1, 0, -4, 0, 0, 0, 0, 0], [-1, 0, -2, 1, 0, -4, 0, 0, 0, 0, 0], [-2, 0, -2, 2, 1, 3, 0, 0, -2, 0, 0], [0, 0, -4, 2, 0, 8, 0, 0, 0, 0, 0], [-2, -1, -2, 2, 0, 3, 0, 0, 0, 0, 0], [1, 0, 2, -6, 1, -3, 0, 0, 2, 0, 0], [-1, 0, 2, -4, 2, 3, 0, 0, -1, 0, 0], [1, 0, 0, -4, 2, 3, 0, 0, -1, 0, 0], [2, 1, 2, -4, 2, -3, 0, 0, 1, 0, 0], [2, 1, 2, -4, 1, 6, 0, 0, -3, 0, 0], [0, 1, 4, -4, 4, 3, 0, 0, 0, 0, 0], [0, 1, 4, -4, 2, -3, 0, 0, 1, 0, 0], [-1, -1, -2, 4, 0, -7, 0, 0, 0, 0, 0], [-1, -3, 0, 2, 0, 9, 0, 0, 0, 0, 0], [-1, 0, -2, 4, 1, -3, 0, 0, 2, 0, 0], [-2, -1, 0, 3, 0, -3, 0, 0, 0, 0, 0], [0, 0, -2, 3, 0, -4, 0, 0, 0, 0, 0], [-2, 0, 0, 3, 1, -5, 0, 0, 3, 0, 0], [0, -1, 0, 1, 0, -13, 0, 0, 0, 0, 0], [-3, 0, 2, 2, 0, -7, 0, 0, 0, 0, 0], [1, 1, -2, 2, 0, 10, 0, 0, 0, 0, 0], [-1, 1, 0, 2, 2, 3, 0, 0, -1, 0, 0], [1, -2, 2, -2, 1, 10, 0, 13, 6, 0, -5], [0, 0, 1, 0, 2, 0, 0, 30, 0, 0, 14], [0, 0, 1, 0, 1, 0, 0, -162, 0, 0, -138], [0, 0, 1, 0, 0, 0, 0, 75, 0, 0, 0], [-1, 2, 0, 2, 1, -7, 0, 0, 4, 0, 0], [0, 0, 2, 0, 2, -4, 0, 0, 2, 0, 0], [-2, 0, 2, 0, 2, 4, 0, 0, -2, 0, 0], [2, 0, 0, -1, 1, 5, 0, 0, -2, 0, 0], [3, 0, 0, -2, 1, 5, 0, 0, -3, 0, 0], [1, 0, 2, -2, 3, -3, 0, 0, 0, 0, 0], [1, 2, 0, 0, 1, -3, 0, 0, 2, 0, 0], [2, 0, 2, -3, 2, -4, 0, 0, 2, 0, 0], [-1, 1, 4, -2, 2, -5, 0, 0, 2, 0, 0], [-2, -2, 0, 4, 0, 6, 0, 0, 0, 0, 0], [0, -3, 0, 2, 0, 9, 0, 0, 0, 0, 0], [0, 0, -2, 4, 0, 5, 0, 0, 0, 0, 0], [-1, -1, 0, 3, 0, -7, 0, 0, 0, 0, 0], [-2, 0, 0, 4, 2, -3, 0, 0, 1, 0, 0], [-1, 0, 0, 3, 1, -4, 0, 0, 2, 0, 0], [2, -2, 0, 0, 0, 7, 0, 0, 0, 0, 0], [1, -1, 0, 1, 0, -4, 0, 0, 0, 0, 0], [-1, 0, 0, 2, 0, 4, 0, 0, 0, 0, 0], [0, -2, 2, 0, 1, -6, 0, -3, 3, 0, 1], [-1, 0, 1, 2, 1, 0, 0, -3, 0, 0, -2], [-1, 1, 0, 3, 0, 11, 0, 0, 0, 0, 0], [-1, -1, 2, 1, 2, 3, 0, 0, -1, 0, 0], [0, -1, 2, 0, 0, 11, 0, 0, 0, 0, 0], [-2, 1, 2, 2, 1, -3, 0, 0, 2, 0, 0], [2, -2, 2, -2, 2, -1, 0, 3, 3, 0, -1], [1, 1, 0, 1, 1, 4, 0, 0, -2, 0, 0], [1, 0, 1, 0, 1, 0, 0, -13, 0, 0, -11], [1, 0, 1, 0, 0, 3, 0, 6, 0, 0, 0], [0, 2, 0, 2, 0, -7, 0, 0, 0, 0, 0], [2, -1, 2, -2, 1, 5, 0, 0, -3, 0, 0], [0, -1, 4, -2, 1, -3, 0, 0, 1, 0, 0], [0, 0, 4, -2, 3, 3, 0, 0, 0, 0, 0], [0, 1, 4, -2, 1, 5, 0, 0, -3, 0, 0], [4, 0, 2, -4, 2, -7, 0, 0, 3, 0, 0], [2, 2, 2, -2, 2, 8, 0, 0, -3, 0, 0], [2, 0, 4, -4, 2, -4, 0, 0, 2, 0, 0], [-1, -2, 0, 4, 0, 11, 0, 0, 0, 0, 0], [-1, -3, 2, 2, 2, -3, 0, 0, 1, 0, 0], [-3, 0, 2, 4, 2, 3, 0, 0, -1, 0, 0], [-3, 0, 2, -2, 1, -4, 0, 0, 2, 0, 0], [-1, -1, 0, -2, 1, 8, 0, 0, -4, 0, 0], [-3, 0, 0, 0, 2, 3, 0, 0, -1, 0, 0], [-3, 0, -2, 2, 0, 11, 0, 0, 0, 0, 0], [0, 1, 0, -4, 1, -6, 0, 0, 3, 0, 0], [-2, 1, 0, -2, 1, -4, 0, 0, 2, 0, 0], [-4, 0, 0, 0, 1, -8, 0, 0, 4, 0, 0], [-1, 0, 0, -4, 1, -7, 0, 0, 3, 0, 0], [-3, 0, 0, -2, 1, -4, 0, 0, 2, 0, 0], [0, 0, 0, 3, 2, 3, 0, 0, -1, 0, 0], [-1, 1, 0, 4, 1, 6, 0, 0, -3, 0, 0], [1, -2, 2, 0, 1, -6, 0, 0, 3, 0, 0], [0, 1, 0, 3, 0, 6, 0, 0, 0, 0, 0], [-1, 0, 2, 2, 3, 6, 0, 0, -1, 0, 0], [0, 0, 2, 2, 2, 5, 0, 0, -2, 0, 0], [-2, 0, 2, 2, 2, -5, 0, 0, 2, 0, 0], [-1, 1, 2, 2, 0, -4, 0, 0, 0, 0, 0], [3, 0, 0, 0, 2, -4, 0, 0, 2, 0, 0], [2, 1, 0, 1, 0, 4, 0, 0, 0, 0, 0], [2, -1, 2, -1, 2, 6, 0, 0, -3, 0, 0], [0, 0, 2, 0, 1, -4, 0, 0, 2, 0, 0], [0, 0, 3, 0, 3, 0, 0, -26, 0, 0, -11], [0, 0, 3, 0, 2, 0, 0, -10, 0, 0, -5], [-1, 2, 2, 2, 1, 5, 0, 0, -3, 0, 0], [-1, 0, 4, 0, 0, -13, 0, 0, 0, 0, 0], [1, 2, 2, 0, 1, 3, 0, 0, -2, 0, 0], [3, 1, 2, -2, 1, 4, 0, 0, -2, 0, 0], [1, 1, 4, -2, 2, 7, 0, 0, -3, 0, 0], [-2, -1, 0, 6, 0, 4, 0, 0, 0, 0, 0], [0, -2, 0, 4, 0, 5, 0, 0, 0, 0, 0], [-2, 0, 0, 6, 1, -3, 0, 0, 2, 0, 0], [-2, -2, 2, 4, 2, -6, 0, 0, 2, 0, 0], [0, -3, 2, 2, 2, -5, 0, 0, 2, 0, 0], [0, 0, 0, 4, 2, -7, 0, 0, 3, 0, 0], [-1, -1, 2, 3, 2, 5, 0, 0, -2, 0, 0], [-2, 0, 2, 4, 0, 13, 0, 0, 0, 0, 0], [2, -1, 0, 2, 1, -4, 0, 0, 2, 0, 0], [1, 0, 0, 3, 0, -3, 0, 0, 0, 0, 0], [0, 1, 0, 4, 1, 5, 0, 0, -2, 0, 0], [0, 1, 0, 4, 0, -11, 0, 0, 0, 0, 0], [1, -1, 2, 1, 2, 5, 0, 0, -2, 0, 0], [0, 0, 2, 2, 3, 4, 0, 0, 0, 0, 0], [1, 0, 2, 2, 2, 4, 0, 0, -2, 0, 0], [-1, 0, 2, 2, 2, -4, 0, 0, 2, 0, 0], [-2, 0, 4, 2, 1, 6, 0, 0, -3, 0, 0], [2, 1, 0, 2, 1, 3, 0, 0, -2, 0, 0], [2, 1, 0, 2, 0, -12, 0, 0, 0, 0, 0], [2, -1, 2, 0, 0, 4, 0, 0, 0, 0, 0], [1, 0, 2, 1, 0, -3, 0, 0, 0, 0, 0], [0, 1, 2, 2, 0, -4, 0, 0, 0, 0, 0], [2, 0, 2, 0, 3, 3, 0, 0, 0, 0, 0], [3, 0, 2, 0, 2, 3, 0, 0, -1, 0, 0], [1, 0, 2, 0, 2, -3, 0, 0, 1, 0, 0], [1, 0, 3, 0, 3, 0, 0, -5, 0, 0, -2], [1, 1, 2, 1, 1, -7, 0, 0, 4, 0, 0], [0, 2, 2, 2, 2, 6, 0, 0, -3, 0, 0], [2, 1, 2, 0, 0, -3, 0, 0, 0, 0, 0], [2, 0, 4, -2, 1, 5, 0, 0, -3, 0, 0], [4, 1, 2, -2, 2, 3, 0, 0, -1, 0, 0], [-1, -1, 0, 6, 0, 3, 0, 0, 0, 0, 0], [-3, -1, 2, 6, 2, -3, 0, 0, 1, 0, 0], [-1, 0, 0, 6, 1, -5, 0, 0, 3, 0, 0], [-3, 0, 2, 6, 1, -3, 0, 0, 2, 0, 0], [1, -1, 0, 4, 1, -3, 0, 0, 2, 0, 0], [1, -1, 0, 4, 0, 12, 0, 0, 0, 0, 0], [-2, 0, 2, 5, 2, 3, 0, 0, -1, 0, 0], [1, -2, 2, 2, 1, -4, 0, 0, 2, 0, 0], [3, -1, 0, 2, 0, 4, 0, 0, 0, 0, 0], [1, -1, 2, 2, 0, 6, 0, 0, 0, 0, 0], [0, 0, 2, 3, 1, 5, 0, 0, -3, 0, 0], [-1, 1, 2, 4, 1, 4, 0, 0, -2, 0, 0], [0, 1, 2, 3, 2, -6, 0, 0, 3, 0, 0], [-1, 0, 4, 2, 1, 4, 0, 0, -2, 0, 0], [2, 0, 2, 1, 1, 6, 0, 0, -3, 0, 0], [5, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0], [2, 1, 2, 1, 2, -6, 0, 0, 3, 0, 0], [1, 0, 4, 0, 1, 3, 0, 0, -2, 0, 0], [3, 1, 2, 0, 1, 7, 0, 0, -4, 0, 0], [3, 0, 4, -2, 2, 4, 0, 0, -2, 0, 0], [-2, -1, 2, 6, 2, -5, 0, 0, 2, 0, 0], [0, 0, 0, 6, 0, 5, 0, 0, 0, 0, 0], [0, -2, 2, 4, 2, -6, 0, 0, 3, 0, 0], [-2, 0, 2, 6, 1, -6, 0, 0, 3, 0, 0], [2, 0, 0, 4, 1, -4, 0, 0, 2, 0, 0], [2, 0, 0, 4, 0, 10, 0, 0, 0, 0, 0], [2, -2, 2, 2, 2, -4, 0, 0, 2, 0, 0], [0, 0, 2, 4, 0, 7, 0, 0, 0, 0, 0], [1, 0, 2, 3, 2, 7, 0, 0, -3, 0, 0], [4, 0, 0, 2, 0, 4, 0, 0, 0, 0, 0], [2, 0, 2, 2, 0, 11, 0, 0, 0, 0, 0], [0, 0, 4, 2, 2, 5, 0, 0, -2, 0, 0], [4, -1, 2, 0, 2, -6, 0, 0, 2, 0, 0], [3, 0, 2, 1, 2, 4, 0, 0, -2, 0, 0], [2, 1, 2, 2, 1, 3, 0, 0, -2, 0, 0], [4, 1, 2, 0, 2, 5, 0, 0, -2, 0, 0], [-1, -1, 2, 6, 2, -4, 0, 0, 2, 0, 0], [-1, 0, 2, 6, 1, -4, 0, 0, 2, 0, 0], [1, -1, 2, 4, 1, -3, 0, 0, 2, 0, 0], [1, 1, 2, 4, 2, 4, 0, 0, -2, 0, 0], [3, 1, 2, 2, 2, 3, 0, 0, -1, 0, 0], [5, 0, 2, 0, 1, -3, 0, 0, 1, 0, 0], [2, -1, 2, 4, 2, -3, 0, 0, 1, 0, 0], [2, 0, 2, 4, 1, -3, 0, 0, 2, 0, 0]] };
        }, 134: (t2) => {
          t2.exports = { coefficient: 1e-7, data: [[0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331, 9086, 15377], [0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587], [0, 0, 2, 0, 2, -2276413, -234, 2796, 978459, -485, 1374], [0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291], [0, 1, 0, 0, 0, 1475877, -3633, 11817, 73871, -184, -1924], [0, 1, 2, -2, 2, -516821, 1226, -524, 224386, -677, -174], [1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358], [0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318], [1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367], [0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132], [0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39], [-1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4], [-1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82], [1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9], [-1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75], [-1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66], [1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78], [-2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20], [0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29], [0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68], [0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0], [-2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25], [2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59], [1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3], [-1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3], [2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13], [0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11], [0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45], [-1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1], [0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5], [0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13], [1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14], [0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26], [-1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15], [0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10], [1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19], [-2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2], [0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5], [0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14], [0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4], [0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4], [1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1], [2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4], [-2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5], [2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12], [0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3], [0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9], [-1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4], [2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1], [1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2], [0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1], [1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3], [-2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1], [3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7], [0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2], [1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4], [0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2], [-1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3], [-1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2], [0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5], [-2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4], [1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3], [2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2], [-1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0], [1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2], [1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1], [-1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2], [1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0], [-1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139], [0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2], [-1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4], [-1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0], [0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0], [1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4], [-2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2], [-1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2], [1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0]] };
        }, 961: (t2) => {
          t2.exports = { coefficient: 1e-7, data: [[0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331, 9086, 15377], [0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587], [0, 0, 2, 0, 2, -2276413, -234, 2796, 978459, -485, 1374], [0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291], [0, 1, 0, 0, 0, 1475877, -3633, 11817, 73871, -184, -1924], [0, 1, 2, -2, 2, -516821, 1226, -524, 224386, -677, -174], [1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358], [0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318], [1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367], [0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132], [0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39], [-1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4], [-1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82], [1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9], [-1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75], [-1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66], [1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78], [-2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20], [0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29], [0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68], [0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0], [-2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25], [2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59], [1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3], [-1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3], [2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13], [0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11], [0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45], [-1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1], [0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5], [0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13], [1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14], [0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26], [-1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15], [0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10], [1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19], [-2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2], [0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5], [0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14], [0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4], [0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4], [1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1], [2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4], [-2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5], [2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12], [0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3], [0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9], [-1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4], [2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1], [1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2], [0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1], [1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3], [-2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1], [3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7], [0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2], [1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4], [0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2], [-1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3], [-1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2], [0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5], [-2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4], [1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3], [2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2], [-1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0], [1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2], [1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1], [-1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2], [1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0], [-1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139], [0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2], [-1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4], [-1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0], [0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0], [1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4], [-2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2], [-1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2], [1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0]] };
        }, 352: (t2, e2, i) => {
          const s = i(18);
          t2.exports = s;
        }, 18: (t2, e2, i) => {
          const s = i(506), o = i(227), n = { IAU1980: s, IAU2000A: i(271), IAU2000B: i(134), IAU1980_FULL: o, IAU2000B_FULL: i(961) }, r = i(716), l = { IAU1980: i(511), IAU2000A: i(536), IAU2000B: i(473) };
          t2.exports = class {
            constructor(t3) {
              let e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "2000B", i2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
              const s2 = this.getIAU(e3);
              this.algo = l[`IAU${s2}`], this.T = r.getJulianCentury(t3), this.D = this.getD(), this.l = this.getL(), this.l_ = this.getL_(), this.F = this.getF(), this.O = this.getO();
              const { data: o2, coefficient: c } = n[`IAU${s2}${i2 ? "_FULL" : ""}`];
              this.nutation = o2, this.coefficient = c, this.RADIAN_ANGLE = Math.PI / 180;
            }
            longitude() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              const e3 = this.algo.longitudeOffset();
              return (this.nutation.reduce(((e4, i2) => {
                const s2 = this.calcArgument(i2);
                return e4 + this.algo.calcLongitude(t3, s2, i2);
              }), 0) * this.coefficient + e3) / 3600;
            }
            obliquity() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              const e3 = this.algo.obliquityOffset();
              return (this.nutation.reduce(((e4, i2) => {
                const s2 = this.calcArgument(i2);
                return e4 + this.algo.calcObliquity(t3, s2, i2);
              }), 0) * this.coefficient + e3) / 3600;
            }
            calcArgument(t3) {
              let [e3, i2, s2, o2, n2] = t3, r2 = this.l * e3 + this.l_ * i2 + this.F * s2 + this.D * o2 + this.O * n2;
              return r2 *= this.RADIAN_ANGLE, r2;
            }
            getL() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              return this.algo.l(t3);
            }
            getL_() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              return this.algo.l_(t3);
            }
            getF() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              return this.algo.F(t3);
            }
            getD() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              return this.algo.D(t3);
            }
            getO() {
              let t3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.T;
              return this.algo.O(t3);
            }
            getIAU(t3) {
              switch (String(t3).toLowerCase()) {
                case "1980":
                  return "1980";
                case "2000b":
                default:
                  return "2000B";
                case "2000a":
                  return "2000A";
              }
            }
          };
        }, 716: (t2) => {
          t2.exports = { getJulianCentury: function(t3) {
            return (t3 - 2451545) / 36525;
          } };
        } }, e = {}, (function i(s) {
          var o = e[s];
          if (void 0 !== o) return o.exports;
          var n = e[s] = { exports: {} };
          return t[s](n, n.exports, i), n.exports;
        })(352);
        var t, e;
      }));
    }
  });

  // node_modules/solar_terms.js/dist/ecliptic.js
  var require_ecliptic = __commonJS({
    "node_modules/solar_terms.js/dist/ecliptic.js"(exports, module) {
      var VSOP87D = require_vsop87d_ear();
      var VSOP87D_SIMPLE = require_vsop87d_simple_ear();
      var TIME = require_time();
      var Nutation = require_main();
      var Ecliptic3 = class {
        constructor(jd, p = {}) {
          this.jd = jd;
          this.dt = TIME.getDT(jd);
          this.integrity = !!p.integrity;
          this.DB = p.db === void 0 ? this.integrity ? VSOP87D : VSOP87D_SIMPLE : p.db;
          this.nutOptions = this.getNutationOptions(p.nutation);
          const {
            iau,
            full
          } = this.nutOptions;
          this.nutation = new Nutation(this.jd, iau, full);
        }
        getNutationOptions(options = {}) {
          return Object.assign({}, {}, options);
        }
        circle(c) {
          let result = c % 360;
          if (c < 0) result += 360;
          return result;
        }
        /**
         * 计算周期项
         * @param {Array} collection
         * @param {dt} dt
         * @returns {Number} num
         */
        calcPeriodicTerm(collection, dt = this.dt) {
          const val = collection.reduce((acc, [A, B, C]) => {
            acc += parseFloat(A) * Math.cos(parseFloat(B) + parseFloat(C) * dt);
            return acc;
          }, 0);
          return val;
        }
        /**
         * 根据X计算周期
         * @param {*} arr
         * @returns
         */
        calcEclipticBy(arr, dt = this.dt) {
          const X = arr.reduceRight((acc, next) => {
            return acc * dt + this.calcPeriodicTerm(next, dt);
          }, 0);
          return X;
        }
        /**
         * 计算日心黄经
         * @param {*} dt
         * @returns {rad} l
         */
        calcSunEclipticLongitude(dt = this.dt) {
          const l = this.calcEclipticBy(this.DB.l, dt);
          return l;
        }
        /**
         * 计算日心黄纬
         * @param {*} dt
         * @returns {rad} b
         */
        calcSunEclipticLatitude(dt = this.dt) {
          const b = this.calcEclipticBy(this.DB.b, dt);
          return b;
        }
        /**
         * 太阳到行星的距离
         * @param {*} dt
         * @returns {} r
         */
        sunPlanetRadius(dt = this.dt) {
          const r = this.calcEclipticBy(this.DB.r, dt);
          return r;
        }
        /**
         * 计算地心黄经
         * @param {sunLongitude} 日心黄经
         * @returns {ang} l
         */
        calcEarEclipticLongitude(sun = this.calcSunEclipticLongitude()) {
          return this.circle(sun * this.RADIAN_ANGLE + 180);
        }
        /**
         * 计算地心黄纬
         * @param {sunLatitude} 日心黄纬
         * @returns {ang} b
         */
        calcEarEclipticLatitude(sun = this.calcSunEclipticLatitude()) {
          return this.circle(-(sun * this.RADIAN_ANGLE));
        }
        /**
         *VSOP87->TF5坐标系 日心黄经
         * @param {*} dt
         * @returns {ang} offset
         */
        FK5EclipticLongitudeOffset() {
          return -0.09033 / 3600;
        }
        /**
         * VSOP87->TF5坐标系 日心黄纬
         * @param {*} dt
         * @returns {ang} offset
         */
        FK5EclipticLatitudeOffset(l = this.calcEarEclipticLongitude()) {
          const T = this.dt * 10;
          let dash = l - T * 1.397 - 31e-5 * T * T;
          dash /= this.RADIAN_ANGLE;
          return 0.03916 * (Math.cos(dash) - Math.sin(dash)) / 3600;
        }
        /**
         * 章动修正 longitude
         * @returns
         */
        longitudeNutationOffset() {
          return this.nutation.longitude();
        }
        /**
         * 章动修正 latitude
         * @returns
         */
        latitudeNutationOffset() {
          return this.nutation.obliquity();
        }
        longitudeLightOffset() {
          return -20.4898 / this.sunPlanetRadius() / 3600;
        }
        /**
         * 获取太阳地心视黄经
         * @returns
         */
        getSunEclipticLongitude(integrity = this.integrity) {
          let l = this.calcEarEclipticLongitude();
          if (integrity) l += this.FK5EclipticLongitudeOffset();
          l += this.longitudeNutationOffset();
          l += this.longitudeLightOffset();
          return l;
        }
      };
      Ecliptic3.prototype.RADIAN_ANGLE = 180 / Math.PI;
      module.exports = Ecliptic3;
    }
  });

  // node_modules/julian.js/lib/algorithm/nasa.js
  var require_nasa = __commonJS({
    "node_modules/julian.js/lib/algorithm/nasa.js"(exports, module) {
      module.exports = function NASA(date) {
        const year = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        let y = year + (m - 0.5) / 12;
        let t;
        let u;
        if (year < -500) {
          u = (y - 1820) / 100;
          t = -20 + 32 * u * u;
        }
        if (year >= -500 && year < 500) {
          u = y / 100;
          t = 10583.6 - 1014.41 * u + 33.78311 * u * u - 5.952053 * u * u * u - 0.1798452 * u * u * u * u + 0.022174192 * u * u * u * u * u + 0.0090316521 * u * u * u * u * u * u;
        }
        if (year >= 500 && year < 1600) {
          u = (y - 1e3) / 100;
          t = 1574.2 - 556.01 * u + 71.23472 * u * u + 0.319781 * u * u * u - 0.8503463 * u * u * u * u - 5050998e-9 * u * u * u * u * u + 0.0083572073 * u * u * u * u * u * u;
        }
        if (year >= 1600 && year < 1700) {
          u = y - 1600;
          t = 120 - 0.9808 * u - 0.01532 * u * u + u * u * u / 7129;
        }
        if (year >= 1700 && year < 1800) {
          u = y - 1700;
          t = 8.83 + 0.1603 * u - 59285e-7 * u * u + 13336e-8 * u * u * u - u * u * u * u / 1174e3;
        }
        if (year >= 1800 && year < 1860) {
          u = y - 1800;
          t = 13.72 - 0.332447 * u + 68612e-7 * u * u + 41116e-7 * u * u * u - 37436e-8 * u * u * u * u + 121272e-10 * u * u * u * u * u - 1699e-10 * u * u * u * u * u * u + 875e-12 * u * u * u * u * u * u * u;
        }
        if (year >= 1860 && year < 1900) {
          u = y - 1860;
          t = 7.62 + 0.5737 * u - 0.251754 * u * u + 0.01680668 * u * u * u - 4473624e-10 * u * u * u * u + u * u * u * u * u / 233174;
        }
        if (year >= 1900 && year < 1920) {
          u = y - 1900;
          t = -2.79 + 1.494119 * u - 0.0598939 * u * u + 61966e-7 * u * u * u - 197e-6 * u * u * u * u;
        }
        if (year >= 1920 && year < 1941) {
          u = y - 1920;
          t = 21.2 + 0.84493 * u - 0.0761 * u * u + 20936e-7 * u * u * u;
        }
        if (year >= 1941 && year < 1961) {
          u = y - 1950;
          t = 29.07 + 0.407 * u - u * u / 233 + u * u * u / 2547;
        }
        if (year >= 1961 && year < 1986) {
          u = y - 1975;
          t = 45.45 + 1.067 * u - u * u / 260 - u * u * u / 718;
        }
        if (year >= 1986 && year < 2005) {
          u = y - 2e3;
          t = 63.86 + 0.3345 * u - 0.060374 * u * u + 17275e-7 * u * u * u + 651814e-9 * u * u * u * u + 2373599e-11 * u * u * u * u * u;
        }
        if (year >= 2005 && year < 2050) {
          u = y - 2e3;
          t = 62.92 + 0.32217 * u + 5589e-6 * u * u;
        }
        if (year >= 2050 && year < 2150) {
          u = (y - 1820) / 100;
          t = -20 + 32 * u * u - 0.5628 * (2150 - y);
        }
        if (year >= 2150) {
          u = (y - 1820) / 100;
          t = -20 + 32 * u * u;
        }
        return t;
      };
    }
  });

  // node_modules/julian.js/lib/algorithm/MorrisonAndStephenson.js
  var require_MorrisonAndStephenson = __commonJS({
    "node_modules/julian.js/lib/algorithm/MorrisonAndStephenson.js"(exports, module) {
      module.exports = function(date) {
        const year = date.getUTCFullYear();
        return -15 + 325e-5 * (year - 1810) * (year - 1810);
      };
    }
  });

  // node_modules/julian.js/lib/jd.js
  var require_jd = __commonJS({
    "node_modules/julian.js/lib/jd.js"(exports, module) {
      var CALENDAR = {
        a: 365.25,
        JC_BASE: 2299161
      };
      var DeltaT = require_nasa();
      function isGregorianDays(year, month, day) {
        if (year < 1582) {
          return false;
        }
        if (year === 1582) {
          if (month < 10 || month === 10 && day < 15) return false;
        }
        return true;
      }
      function UTC$TD(date, algo = DeltaT) {
        const T = new Date(date);
        const offset = algo(T);
        T.setUTCSeconds(T.getUTCSeconds() + offset);
        return T;
      }
      function TD$UTC(date, algo = DeltaT) {
        const T = new Date(date);
        const offset = algo(T);
        T.setUTCSeconds(T.getUTCSeconds() - offset);
        return T;
      }
      function TD$JD(_year, _month, date, hour, minute, second) {
        let month = _month;
        let year = _year;
        if (month <= 2) {
          month += 12;
          year -= 1;
        }
        let B = 0;
        if (isGregorianDays(year, month, date)) {
          let A = ~~(year / 100);
          B = 2 - A + ~~(A / 4);
        }
        const result = ~~(CALENDAR.a * (year + 4716)) + ~~(30.6001 * (month + 1)) + B + date + -1524.5 + ((second / 60 + minute) / 60 + hour) / 24;
        return result;
      }
      function $TD$JD(_date) {
        if (!(_date instanceof Date)) throw new Error("this arg is not Date");
        const year = _date.getUTCFullYear();
        const month = _date.getUTCMonth() + 1;
        const date = _date.getUTCDate();
        const hour = _date.getUTCHours();
        const minute = _date.getUTCMinutes();
        const second = _date.getUTCSeconds();
        return TD$JD(year, month, date, hour, minute, second);
      }
      function JD$TD(_JD) {
        let JDF = _JD + 0.5;
        let Z = ~~JDF;
        let F = JDF - Z;
        let A;
        let a;
        if (Z < CALENDAR.JC_BASE) {
          A = Z;
        } else {
          a = ~~((Z - 186721625e-2) / 36524.25);
          A = Z + 1 + a - ~~(a / 4);
        }
        let B = A + 1524;
        let C = ~~((B - 122.1) / 365.25);
        let D = ~~(365.25 * C);
        let E = ~~((B - D) / 30.6001);
        let d = ~~(B - D - ~~(30.6001 * E) + F);
        let M;
        let y;
        if (E < 14) {
          M = E - 1;
        } else if (E === 14 || E === 15) {
          M = E - 13;
        }
        if (M > 2) {
          y = C - 4716;
        } else if (M === 1 || M === 2) {
          y = C - 4715;
        }
        let h_ = F * 24.0001;
        let h = ~~h_;
        let m_ = (h_ - h) * 60.0001;
        let m = ~~m_;
        let s = ~~((m_ - m) * 60.0001);
        return {
          y,
          M,
          d,
          h,
          m,
          s
        };
      }
      function $JD$TD(jd) {
        const {
          y,
          M,
          d,
          h,
          m,
          s
        } = JD$TD(jd);
        const y_ = String(Math.abs(y));
        let yPrefix = y < 0 ? "-000000" : "+000000";
        const yyyy = yPrefix.substring(0, 7 - y_.length) + y_;
        const MM = String(M).length === 1 ? "0" + M : M;
        const dd = String(d).length === 1 ? "0" + d : d;
        const hh = String(h).length === 1 ? "0" + h : h;
        const mm = String(m).length === 1 ? "0" + m : m;
        const ss = String(s).length === 1 ? "0" + s : s;
        return /* @__PURE__ */ new Date(`${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.000Z`);
      }
      function UTC$JD(date, algo) {
        return $TD$JD(UTC$TD(date, algo));
      }
      function JD$UTC(JD, algo) {
        return TD$UTC($JD$TD(JD), algo);
      }
      module.exports = {
        isGregorianDays,
        TD$UTC,
        UTC$TD,
        $TD$JD,
        TD$JD,
        $JD$TD,
        JD$TD,
        UTC$JD,
        JD$UTC
      };
    }
  });

  // node_modules/julian.js/lib/index.js
  var require_lib = __commonJS({
    "node_modules/julian.js/lib/index.js"(exports, module) {
      var NASA = require_nasa();
      var DEFAULT = require_MorrisonAndStephenson();
      var {
        isGregorianDays,
        TD$UTC,
        UTC$TD,
        $TD$JD,
        TD$JD,
        $JD$TD,
        JD$TD,
        UTC$JD,
        JD$UTC
      } = require_jd();
      var _algorithm, _td, _jd;
      var _AstronomicalDate = class _AstronomicalDate extends Date {
        constructor(date = /* @__PURE__ */ new Date(), ignore = true, algo) {
          super(date);
          /**
           * @description ΔT calculate algorithm/算法
           * @default NASA
           */
          __privateAdd(this, _algorithm);
          /**
           * @description Dynamic Time/力学时
           */
          __privateAdd(this, _td);
          /**
           * @description Julian Day（TD）/儒略日（力学时）
           */
          __privateAdd(this, _jd);
          __privateSet(this, _algorithm, algo || _AstronomicalDate.algorithm.DIY || DEFAULT);
          __privateSet(this, _td, ignore ? new Date(this) : UTC$TD(new Date(this), __privateGet(this, _algorithm)));
          __privateSet(this, _jd, $TD$JD(__privateGet(this, _td)));
        }
        getJulianDay() {
          return __privateGet(this, _jd);
        }
        getJD() {
          return this.getJulianDay();
        }
        getModifiedJulianDay() {
          return this.getJulianDay() - 24000005e-1;
        }
        getMJD() {
          return this.getModifiedJulianDay();
        }
        getDynamicTime() {
          return __privateGet(this, _td);
        }
        getDT() {
          return this.getDynamicTime();
        }
        getDynamicDate() {
          return __privateGet(this, _td).getUTCDate();
        }
        getDynamicDay() {
          return __privateGet(this, _td).getUTCDay();
        }
        getDynamicFullYear() {
          return __privateGet(this, _td).getUTCFullYear();
        }
        getDynamicHours() {
          return __privateGet(this, _td).getUTCHours();
        }
        getDynamicMilliseconds() {
          return __privateGet(this, _td).getUTCMilliseconds();
        }
        getDynamicMinutes() {
          return __privateGet(this, _td).getUTCMinutes();
        }
        getDynamicMonth() {
          return __privateGet(this, _td).getUTCMonth();
        }
        getDynamicSeconds() {
          return __privateGet(this, _td).getUTCSeconds();
        }
        static setDeltaTAlgorithm(algo) {
          this.algorithm.DIY = algo;
        }
      };
      _algorithm = new WeakMap();
      _td = new WeakMap();
      _jd = new WeakMap();
      var AstronomicalDate = _AstronomicalDate;
      AstronomicalDate.algorithm = {};
      AstronomicalDate.algorithm.DIY = void 0;
      AstronomicalDate.algorithm.NASA = NASA;
      AstronomicalDate.algorithm.DEFAULT = DEFAULT;
      AstronomicalDate.isGregorianDays = isGregorianDays;
      AstronomicalDate.TD$UTC = TD$UTC;
      AstronomicalDate.UTC$TD = UTC$TD;
      AstronomicalDate.$TD$JD = $TD$JD;
      AstronomicalDate.TD$JD = TD$JD;
      AstronomicalDate.$JD$TD = $JD$TD;
      AstronomicalDate.JD$TD = JD$TD;
      AstronomicalDate.UTC$JD = UTC$JD;
      AstronomicalDate.JD$UTC = JD$UTC;
      module.exports = AstronomicalDate;
    }
  });

  // node_modules/solar_terms.js/dist/solarTerms.js
  var require_solarTerms = __commonJS({
    "node_modules/solar_terms.js/dist/solarTerms.js"(exports, module) {
      var Julian = require_lib();
      var Ecliptic3 = require_ecliptic();
      var SolarTerms2 = class {
        constructor(p = {}) {
          this.eOp = p.eclipticOptions || {};
          this.year = p.year || (/* @__PURE__ */ new Date()).getFullYear();
          this.deltaT = p.deltaT === void 0 ? false : !!p.deltaT;
        }
        getBaseSection(year = this.year, angle = 0) {
          let m = ~~Math.ceil((angle + 90) / 30);
          m = m > 12 ? m - 12 : m;
          if (angle % 15 === 0 && angle % 30 !== 0) {
            return Julian.TD$JD(year, m, 6, 12, 0, 0);
          }
          return Julian.TD$JD(year, m, 20, 12, 0, 0);
        }
        getSolarTerms(year = this.year, angle = 0) {
          let JD0 = 0;
          let stDegree = 0;
          let stDegreep = 0;
          let JD1 = this.getBaseSection(year, angle);
          do {
            JD0 = JD1;
            stDegree = new Ecliptic3(JD0, this.eOp).getSunEclipticLongitude();
            stDegree = angle === 0 && stDegree > 345 ? stDegree - 360 : stDegree;
            stDegreep = (new Ecliptic3(JD0 + 5e-6, this.eOp).getSunEclipticLongitude() - new Ecliptic3(JD0 - 5e-6, this.eOp).getSunEclipticLongitude()) / 1e-5;
            JD1 = JD0 - (stDegree - angle) / stDegreep;
          } while (Math.abs(JD1 - JD0) > 1e-7);
          return JD1;
        }
        getSolarTermsAll(year = this.year) {
          return [285, 300, 315, 330, 345, 0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270].map((angle) => {
            const jd = this.getSolarTerms(year, angle);
            const UTC = Julian.JD$UTC(jd, this.deltaT ? Julian.algorithm.DEFAULT : () => {
              return 0;
            });
            return UTC;
          });
        }
      };
      module.exports = SolarTerms2;
    }
  });

  // node_modules/solar_terms.js/dist/index.js
  var require_dist4 = __commonJS({
    "node_modules/solar_terms.js/dist/index.js"(exports, module) {
      var Ecliptic3 = require_ecliptic();
      var SolarTerms2 = require_solarTerms();
      module.exports = {
        Ecliptic: Ecliptic3,
        SolarTerms: SolarTerms2
      };
    }
  });

  // node_modules/tao_calendar/lib/algorithm/reduceTimeOffset.js
  var require_reduceTimeOffset = __commonJS({
    "node_modules/tao_calendar/lib/algorithm/reduceTimeOffset.js"(exports, module) {
      function reduceTimeOffset(t) {
        let offset = t.getTime() < 0 ? t.getTimezoneOffset() + 5 : t.getTimezoneOffset();
        return offset * 6e4;
      }
      module.exports = reduceTimeOffset;
    }
  });

  // node_modules/tao_calendar/lib/algorithm/calcMonth.js
  var require_calcMonth = __commonJS({
    "node_modules/tao_calendar/lib/algorithm/calcMonth.js"(exports, module) {
      var reduceTimeOffset = require_reduceTimeOffset();
      module.exports = function calcMonth2(date, during, accuracy) {
        let dateTime = date.getTime() - reduceTimeOffset(date);
        dateTime = accuracy ? dateTime : ~~(dateTime / 864e5);
        const index = during.reduce((acc, next, i) => {
          if (typeof acc === "number") return acc;
          let accTime = acc.getTime() - reduceTimeOffset(acc);
          let nextTime = next.getTime() - reduceTimeOffset(next);
          accTime = accuracy ? accTime : ~~(accTime / 864e5);
          nextTime = accuracy ? nextTime : ~~(nextTime / 864e5);
          if (i === 1 && dateTime < accTime) return 0;
          if (i === 23 && dateTime >= nextTime) return 24;
          let isBetween = dateTime >= accTime && dateTime < nextTime;
          return isBetween ? i : next;
        });
        return ~~(index / 2 + 0.5) % 12;
      };
    }
  });

  // node_modules/tao_calendar/lib/algorithm/SolarCalendar.js
  var require_SolarCalendar = __commonJS({
    "node_modules/tao_calendar/lib/algorithm/SolarCalendar.js"(exports, module) {
      var {
        SolarTerms: SolarTerms2,
        Ecliptic: Ecliptic3
      } = require_dist4();
      var {
        CELESTIAL_STEMS_ARR: CELESTIAL_STEMS_ARR3,
        SEXAGENARY_CYCLE_ARR: SEXAGENARY_CYCLE_ARR2
      } = require_dist();
      var calcMonth2 = require_calcMonth();
      var Julian = require_lib();
      var reduceTimeOffset = require_reduceTimeOffset();
      function algorithm(_date, _o = /* @__PURE__ */ new Date("-002696-10-14T00:00:00.000+08:00"), p = {}) {
        const date = new Date(_date);
        const o = new Date(_o);
        const accuracy = p.accuracy === void 0 ? false : p.accuracy;
        const year = date.getFullYear();
        let origin = o.getFullYear();
        let _year = year;
        let _origin = origin;
        if (_year < 0) _year = _year % 60 + 60;
        if (_origin < 0) _origin = _origin % 60 + 60;
        const options = Object.assign({}, p.solarTermsOptions, {
          year
        });
        const during = new SolarTerms2(options).getSolarTermsAll();
        const start = during[2];
        let checkDate = date.getTime() - reduceTimeOffset(date);
        let checkStart = start.getTime() - reduceTimeOffset(start);
        checkDate = accuracy ? checkDate : ~~(checkDate / 864e5);
        checkStart = accuracy ? checkStart : ~~(checkStart / 864e5);
        if (checkDate < checkStart) _year -= 1;
        let diff = Math.abs(_year - _origin);
        const yIndex = diff % 60;
        const mIndex = SEXAGENARY_CYCLE_ARR2.indexOf(CELESTIAL_STEMS_ARR3[(yIndex % 10 * 2 % 10 + 2) % 10] + "\u5BC5") + (calcMonth2(date, during, accuracy) - 2);
        let dDate = new Date(date.getTime() - reduceTimeOffset(date));
        let oDate = new Date(o.getTime() - reduceTimeOffset(o));
        dDate = Julian.$TD$JD(dDate);
        oDate = Julian.$TD$JD(oDate);
        const dF = dDate - ~~dDate;
        const oF = oDate - ~~oDate;
        dDate = dF < 0.5 ? ~~dDate - 0.5 : ~~dDate + 0.5;
        oDate = oF < 0.5 ? ~~oDate - 0.5 : ~~oDate + 0.5;
        let dIndex = (dDate - oDate) % 60;
        if (dIndex < 0) dIndex += 60;
        const hIndex = SEXAGENARY_CYCLE_ARR2.indexOf(CELESTIAL_STEMS_ARR3[dIndex % 10 * 2 % 10] + "\u5B50") + ~~((date.getHours() + 1) / 2) % 12;
        const jd = new Julian(date).getJD();
        let l = new Ecliptic3(jd).getSunEclipticLongitude();
        return [[yIndex, mIndex, dIndex, hIndex], during, l];
      }
      module.exports = algorithm;
    }
  });

  // node_modules/tao_calendar/lib/pojo/Calendar.js
  var require_Calendar = __commonJS({
    "node_modules/tao_calendar/lib/pojo/Calendar.js"(exports, module) {
      var SexagenaryCycle3 = require_SexagenaryCycle();
      var Algorithm = require_SolarCalendar();
      var Calendar2 = class _Calendar {
        /**
         * constructor
         * @param {*} _obj 日期 可以是公历时间也可以是干支历
         * @param {*} origin 干支历的起始时间点
         * @param {*} type 类型 阳历/阴历/阴阳历
         * @param {*} algo 算法
         * @param {*} options 配置
         */
        constructor(_obj = /* @__PURE__ */ new Date(), origin, type = 0, algo, options) {
          let obj = _obj;
          if (algo) this.algorithm = algo;
          this.type = type;
          this.year;
          this.month;
          this.date;
          this.hour;
          this.time;
          this.l;
          this.during;
          if (typeof obj === "string") {
            obj = Array.from(obj.trim());
          }
          if (obj instanceof Date) {
            const [time, during, l] = this.algorithm(obj, origin, options);
            obj = time;
            this.time = time;
            this.during = during;
            this.l = l;
          }
          if (obj instanceof Array) {
            if (obj.length >= 8) {
              const [y, y_, m, m_, d, d_, h, h_] = obj;
              this.year = new SexagenaryCycle3(y, y_);
              this.month = new SexagenaryCycle3(m, m_);
              this.date = new SexagenaryCycle3(d, d_);
              this.hour = new SexagenaryCycle3(h, h_);
            } else if (obj.length === 4) {
              const [y, m, d, h] = obj;
              this.year = new SexagenaryCycle3(y);
              this.month = new SexagenaryCycle3(m);
              this.date = new SexagenaryCycle3(d);
              this.hour = new SexagenaryCycle3(h);
            } else {
              throw new Error(" array length error ");
            }
          }
        }
        /**
         * @description 获取干支历四柱
         * @param {boolean} is 是否显示汉字
         * @param {number} level 获取四柱级别 0-3 年->月->日->时
         * @param {boolean} focus 是否只显示指定的级别
         */
        sc(is = false, level = 3, focus = false) {
          return [this.year, this.month, this.date, this.hour].filter((cstb, i) => {
            if (focus) {
              if (i === level) return true;
            } else if (i <= level) return true;
            return false;
          }).map((cstb) => {
            return cstb.cstb(is);
          });
        }
        static setAlgorithm(algo) {
          _Calendar.prototype.algorithm = algo;
        }
      };
      Calendar2.prototype.algorithm = Algorithm;
      module.exports = Calendar2;
    }
  });

  // node_modules/tao_calendar/lib/index.js
  var require_lib2 = __commonJS({
    "node_modules/tao_calendar/lib/index.js"(exports, module) {
      var Calendar2 = require_Calendar();
      var CelestialStems3 = require_CelestialStems();
      var TerrestrialBranches3 = require_TerrestrialBranches();
      var SexagenaryCycle3 = require_SexagenaryCycle();
      module.exports = {
        Calendar: Calendar2,
        CelestialStems: CelestialStems3,
        TerrestrialBranches: TerrestrialBranches3,
        SexagenaryCycle: SexagenaryCycle3
      };
    }
  });

  // src/lib/taobi/Constants.js
  var ACQUIRED_ARR = ["\u574E", "\u5764", "\u9707", "\u5DFD", "\u4E2D", "\u4E7E", "\u5151", "\u826E", "\u79BB"];
  var APRIORI_ARR = ["\u4E7E", "\u5151", "\u79BB", "\u9707", "\u5DFD", "\u574E", "\u826E", "\u5764"];
  var STAR_ARR = ["\u5929\u84EC\u661F", "\u5929\u82AE\u661F", "\u5929\u51B2\u661F", "\u5929\u8F85\u661F", "\u5929\u79BD\u661F", "\u5929\u5FC3\u661F", "\u5929\u67F1\u661F", "\u5929\u4EFB\u661F", "\u5929\u82F1\u661F"];
  var DOOR_ARR = ["\u4F11\u95E8", "\u6B7B\u95E8", "\u4F24\u95E8", "\u675C\u95E8", "", "\u5F00\u95E8", "\u60CA\u95E8", "\u751F\u95E8", "\u666F\u95E8"];
  var DIVINITY_ARR = ["\u503C\u7B26", "\u87A3\u86C7", "\u592A\u9634", "\u516D\u5408", "\u767D\u864E", "\u7384\u6B66", "\u4E5D\u5730", "\u4E5D\u5929"];
  var CEREMONY_ARR = ["\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"];
  var SURPRISE_ARR = ["\u4E01", "\u4E19", "\u4E59"];
  var CELESTIAL_STEMS_ARR = ["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"];
  var TERRESTRIAL_BRANCHES_ARR = ["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"];
  var STAR = {
    TIAN_PENG: "\u5929\u84EC\u661F",
    TIAN_RUI: "\u5929\u82AE\u661F",
    TIAN_CHONG: "\u5929\u51B2\u661F",
    TIAN_FU: "\u5929\u8F85\u661F",
    TIAN_QIN: "\u5929\u79BD\u661F",
    TIAN_XIN: "\u5929\u5FC3\u661F",
    TIAN_ZHU: "\u5929\u67F1\u661F",
    TIAN_REN: "\u5929\u4EFB\u661F",
    TIAN_YING: "\u5929\u82F1\u661F"
  };
  var DOOR = {
    REST: "\u4F11\u95E8",
    DEATH: "\u6B7B\u95E8",
    DAMAGE: "\u4F24\u95E8",
    HINDER: "\u675C\u95E8",
    OPEN: "\u5F00\u95E8",
    SURPRISE: "\u60CA\u95E8",
    LIVE: "\u751F\u95E8",
    FLAME: "\u666F\u95E8"
  };
  var DIVINITY = {
    SYMBOL: "\u503C\u7B26",
    SNAKE: "\u87A3\u86C7",
    LUNAR: "\u592A\u9634",
    SIX: "\u516D\u5408",
    tiger: "\u767D\u864E",
    TORTOISE: "\u7384\u6B66",
    EARTH: "\u4E5D\u5730",
    SKY: "\u4E5D\u5929"
  };
  var ACQUIRED = { KAN: "\u574E", KUN: "\u5764", ZHEN: "\u9707", XUN: "\u5DFD", MID: "\u4E2D", QIAN: "\u4E7E", DUI: "\u5151", GEN: "\u826E", LI: "\u79BB" };
  var APRIORI = { QIAN: "\u4E7E", DUI: "\u5151", LI: "\u79BB", ZHEN: "\u9707", XUN: "\u5DFD", KAN: "\u574E", GEN: "\u826E", KUN: "\u5764" };

  // src/lib/taobi/pojo/taobi/Palace.js
  var import_tao_taichi4 = __toESM(require_dist2(), 1);
  var import_tao_calendar = __toESM(require_lib2(), 1);

  // src/lib/taobi/pojo/taobi/Door.js
  var import_tao_taichi = __toESM(require_dist2(), 1);
  var { Phases } = import_tao_taichi.default;
  var DOOR_PHASES = ["\u6C34", "\u571F", "\u6728", "\u6728", "", "\u91D1", "\u91D1", "\u571F", "\u706B"];
  var Door = class _Door extends Phases {
    constructor(index) {
      if (index instanceof _Door) return index;
      const i = ~~(index + 1) === 0 ? DOOR_ARR.indexOf(index) : ~~index % 9;
      if (i < 0) throw new Error("arg can`t be use");
      if (i === 4) throw new Error("\u4E2D\u5BAB\u65E0\u95E8");
      super(DOOR_PHASES[i], null);
      this.index = i;
    }
    getIndex(is = false) {
      return is ? DOOR_ARR[this.index] : this.index;
    }
    // TODO 门+门
  };
  Door.DOOR = DOOR;
  Door.DOOR_ARR = DOOR_ARR;
  var Door_default = Door;

  // src/lib/taobi/pojo/taobi/Star.js
  var import_tao_taichi2 = __toESM(require_dist2(), 1);
  var { Phases: Phases2 } = import_tao_taichi2.default;
  var Star = class _Star extends Phases2 {
    constructor(index) {
      if (index instanceof _Star) return index;
      const i = ~~(index + 1) === 0 ? STAR_ARR.indexOf(index) : ~~index % 9;
      if (i < 0) throw new Error("arg can`t be use");
      const phases = i === 0 ? 0 : i % 8 === 0 ? 1 : i % 3 === 1 ? 4 : ~~(i / 2) === 1 ? 2 : 3;
      super(phases, null);
      this.index = i;
    }
    getIndex(is = false) {
      return is ? STAR_ARR[this.index] : this.index;
    }
    // TODO
  };
  Star.STAR = STAR;
  Star.STAR_ARR = STAR_ARR;
  var Star_default = Star;

  // src/lib/taobi/pojo/taobi/Divinity.js
  var import_tao_taichi3 = __toESM(require_dist2(), 1);
  var { Phases: Phases3 } = import_tao_taichi3.default;
  var DIVINITY_PHASES = ["\u571F", "\u706B", "\u91D1", "\u6728", "\u91D1", "\u6C34", "\u571F", "\u91D1"];
  var Divinity = class _Divinity extends Phases3 {
    constructor(index) {
      if (index instanceof _Divinity) return index;
      const i = ~~(index + 1) === 0 ? DIVINITY_ARR.indexOf(index) : ~~index % 8;
      if (i < 0) throw new Error("arg can`t be use");
      super(DIVINITY_PHASES[i], null);
      this.index = i;
    }
    getIndex(is = false) {
      return is ? DIVINITY_ARR[this.index] : this.index;
    }
    // TODO
  };
  Divinity.DIVINITY_ARR = DIVINITY_ARR;
  Divinity.DIVINITY = DIVINITY;
  var Divinity_default = Divinity;

  // src/lib/taobi/pojo/taobi/Palace.js
  var INDEX = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"];
  var ACQUIRED_PHASES = ["\u6C34", "\u571F", "\u6728", "\u6728", "\u571F", "\u91D1", "\u91D1", "\u571F", "\u706B"];
  var { Phases: Phases4 } = import_tao_taichi4.default;
  var Palace = class _Palace2 extends Phases4 {
    constructor(index) {
      if (index instanceof _Palace2) return index;
      const i = ~~(index + 1) === 0 ? ACQUIRED_ARR.indexOf(index) : ~~index % 9;
      if (i < 0) throw new Error(`arg can\`t be use => ${index}`);
      super(ACQUIRED_PHASES[i], null);
      this.index = i;
      this._index = APRIORI_ARR.indexOf(ACQUIRED_ARR[this.index]);
      this.rIndex = null;
      this.hcs = [];
      this.hs = false;
      this.de = false;
      this.hj = false;
      this.zs = false;
      this.palaceNo = "";
      this._cs = [];
      this._tb = [];
      this.star;
      this._star;
      this.door;
      this._door;
      this.divinity;
      this._divinity;
      this.divinityName = "";
      this.earthDivinityName = "";
      this.init();
    }
    init() {
      this._star = new Star_default(this.index);
      if (!(this.index === 4)) this._door = new Door_default(this.index);
    }
    // ######### earths celestial stems #########
    /**
     * @description 设置地盘天干
     * @param {CelestialStems} obj
     * @param {boolean} isUpdate
     */
    setEarthsCelestialStems(obj, isUpdate = false) {
      if (isUpdate) this.ecs.push(new import_tao_calendar.CelestialStems(obj));
      if (!isUpdate) this.ecs = obj.map((o) => new import_tao_calendar.CelestialStems(o));
    }
    setECS(obj, isUpdate) {
      this.setEarthsCelestialStems(obj, isUpdate);
    }
    /**
     * @description 获取地盘天干
     * @param {boolean} is
     * @returns {CelestialStems} cs
     */
    getEarthsCelestialStems(is = false) {
      return is ? this.ecs.map((o) => o.getValue(true)) : this.ecs;
    }
    getECS(is) {
      return this.getEarthsCelestialStems(is);
    }
    // ######### heavens celestial stems #########
    /**
     * @description 设置天盘天干
     * @param {CelestialStems} obj
     * @param {boolean} isUpdate
     */
    setHeavensCelestialStems(obj, isUpdate = false) {
      if (isUpdate) this.hcs.push(new import_tao_calendar.CelestialStems(obj));
      if (!isUpdate) this.hcs = obj.map((o) => new import_tao_calendar.CelestialStems(o));
    }
    setHCS(obj, isUpdate) {
      this.setHeavensCelestialStems(obj, isUpdate);
    }
    /**
     * @description 获取天盘天干
     * @param {boolean} is
     * @returns {CelestialStems} cs
     */
    getHeavensCelestialStems(is = false) {
      return is ? this.hcs.map((o) => o.getValue(true)) : this.hcs;
    }
    getHCS(is) {
      return this.getHeavensCelestialStems(is);
    }
    // ######### celestial stems #########
    /**
     * @description 设置原始天干
     * @param {CelestialStems} obj
     * @param {boolean} isUpdate
     */
    setOriginCelestialStems(obj, isUpdate = false) {
      if (isUpdate) this._cs.push(new import_tao_calendar.CelestialStems(obj));
      if (!isUpdate) this._cs = obj.map((o) => new import_tao_calendar.CelestialStems(o));
    }
    setOCS(obj, isUpdate) {
      this.setOriginCelestialStems(obj, isUpdate);
    }
    /**
     * @description 获取原始天干
     * @param {boolean} is
     * @returns {CelestialStems} cs
     */
    getOCelestialStems(is = false) {
      return is ? this._cs.map((o) => o.getValue(true)) : this._cs;
    }
    getOCS(is) {
      return this.getOCelestialStems(is);
    }
    // ######### terrestrial branches #########
    /**
     * @description 设置原始地支
     * @param {TerrestrialBranches} obj
     * @param {boolean} isUpdate
     */
    setOriginTerrestrialBranches(obj, isUpdate = false) {
      if (isUpdate) this._tb.push(new import_tao_calendar.TerrestrialBranches(obj));
      if (!isUpdate) this._tb = obj.map((o) => new import_tao_calendar.TerrestrialBranches(o));
    }
    setOTB(index, isUpdate) {
      this.setOriginTerrestrialBranches(index, isUpdate);
    }
    /**
     * @description 获取原始地支
     * @param {boolean} is
     * @returns {TerrestrialBranches} tb
     */
    getOriginTerrestrialBranches(is = false) {
      return is ? this._tb.map((o) => o.getValue(true)) : this._tb;
    }
    getOTB(is) {
      return this.getOriginTerrestrialBranches(is);
    }
    // ######### Horse Star & Death Emptiness #########
    setHS(val) {
      this.hs = val;
    }
    getHS() {
      return this.hs ? "\u9A6C" : "";
    }
    setDE(val) {
      this.de = val;
    }
    getDE() {
      return this.de ? "\u7A7A" : "";
    }
    setHJ(val) {
      this.hj = val;
    }
    getHJ() {
      return this.hj ? "Jia" : "";
    }
    setZS(val) {
      this.zs = val;
    }
    getZS() {
      return this.zs ? "S\u1EED" : "";
    }
    setPalaceNo(val) {
      this.palaceNo = val;
    }
    getPalaceNo() {
      return this.palaceNo;
    }
    // ######### star #########
    setStar(obj, isUpdate = false) {
      if (isUpdate) this.star.push(new Star_default(obj));
      if (!isUpdate) this.star = obj.map((o) => new Star_default(o));
    }
    getStar(is = false) {
      if (this.star === void 0) return "";
      return is ? this.star.map((o) => o.getIndex(true)) : this.star;
    }
    getOriginStar(is = false) {
      if (this._star === void 0) return "";
      return is ? this._star.getIndex(true) : this._star;
    }
    getOStar(is) {
      return this.getOriginStar(is);
    }
    // ######### door #########
    setDoor(obj) {
      this.door = new Door_default(obj);
    }
    getDoor(is = false) {
      if (this.door === void 0) return "";
      return is ? this.door.getIndex(true) : this.door;
    }
    getOriginDoor(is = false) {
      if (this._door === void 0) return "";
      return is ? this._door.getIndex(true) : this._door;
    }
    getODoor(is) {
      return this.getOriginDoor(is);
    }
    // ######### divinity #########
    setDivinity(obj, name = "") {
      this.divinity = new Divinity_default(obj);
      if (name) this.divinityName = name;
    }
    getDivinity(is = false) {
      if (this.divinity === void 0) return "";
      if (is && this.divinityName) return this.divinityName;
      return is ? this.divinity.getIndex(true) : this.divinity;
    }
    setEarthDivinity(obj, name = "") {
      this._divinity = new Divinity_default(obj);
      if (name) this.earthDivinityName = name;
    }
    getEarthDivinity(is = false) {
      if (this._divinity === void 0) return "";
      if (is && this.earthDivinityName) return this.earthDivinityName;
      return is ? this._divinity.getIndex(true) : this._divinity;
    }
    // ######### palace #########
    getPalace(is = false, type = false) {
      let i = type ? this._index : this.index;
      return is ? type ? APRIORI_ARR[i] : ACQUIRED_ARR[i] : i;
    }
    setPalace(index, type = false) {
      if (type) this._index = index;
      if (!type) this.index = index;
    }
    toCanvas() {
      return [
        [this.getDivinity(true), this.getDE(), this.getPalaceNo()],
        [this.getDoor(true), this.getZS(), this.getHCS(true)],
        [
          this.getStar(true),
          `${this.getPalace(true)}${INDEX[this.index]}${this.getHS()}`,
          this.getECS(true)
        ]
      ];
    }
    toString() {
      return this.toCanvas();
    }
  };
  Palace.INDEX = INDEX;
  Palace.ACQUIRED = ACQUIRED;
  Palace.APRIORI = APRIORI;
  var Palace_default = Palace;

  // src/lib/taobi/pojo/taobi/solarTerms.js
  var solarTerms_default = [
    "\u5C0F\u5BD2",
    "\u5927\u5BD2",
    "\u7ACB\u6625",
    "\u96E8\u6C34",
    "\u60CA\u86F0",
    "\u6625\u5206",
    "\u6E05\u660E",
    "\u8C37\u96E8",
    "\u7ACB\u590F",
    "\u5C0F\u6EE1",
    "\u8292\u79CD",
    "\u590F\u81F3",
    "\u5C0F\u6691",
    "\u5927\u6691",
    "\u7ACB\u79CB",
    "\u5904\u6691",
    "\u767D\u9732",
    "\u79CB\u5206",
    "\u5BD2\u9732",
    "\u971C\u964D",
    "\u7ACB\u51AC",
    "\u5C0F\u96EA",
    "\u5927\u96EA",
    "\u51AC\u81F3"
  ];

  // src/lib/taobi/pojo/taobi/TheArtOfBecomingInvisible.js
  var import_tao_calendar4 = __toESM(require_lib2(), 1);

  // src/lib/taobi/pojo/taobi/TaoConvert.js
  var import_tao_calendar3 = __toESM(require_lib2(), 1);

  // src/lib/taobi/pojo/cstb/SexagenaryCycle.js
  var import_tao_calendar2 = __toESM(require_lib2(), 1);
  import_tao_calendar2.SexagenaryCycle.prototype.getConceal = function getConceal(is) {
    const row = ~~(this.getLead().index / 10);
    if (row < 0 || row >= CEREMONY_ARR.length) return "";
    return is ? CEREMONY_ARR[row] : row;
  };
  import_tao_calendar2.SexagenaryCycle.prototype.getCsOrigin = function getCsOrigin(is) {
    if (!this.cs) {
      return "";
    }
    let cs = this.cs(is);
    const METH = "\u7532";
    if (cs === METH || cs === 0) cs = this.getConceal(is);
    return cs;
  };

  // src/lib/taobi/pojo/taobi/TaoConvert.js
  var _Palace, _TaoConvert_instances, generatePalace_fn, generateAcquiredPalace_fn, generatePrioriPalace_fn, generateNinePalace_fn, generateCirclePalace_fn, generateCSPalace_fn, generateTBPalace_fn, generateFlag_fn;
  var TaoConvert = class {
    constructor(options = {}) {
      __privateAdd(this, _TaoConvert_instances);
      /**
       * 配置
       * @type {Object}
       */
      __publicField(this, "OPTIONS");
      /**
       * 宫对象
       * @type {Palace}
       */
      __privateAdd(this, _Palace);
      /**
       * 干支历时
       * @type {Calendar}
       */
      __publicField(this, "calendar");
      /**
       * 年天干
       * @type {SexagenaryCycle}
       */
      __publicField(this, "year");
      /**
       * 月天干
       * @type {SexagenaryCycle}
       */
      __publicField(this, "month");
      /**
       * 日天干
       * @type {SexagenaryCycle}
       */
      __publicField(this, "date");
      /**
       * 时天干
       * @type {SexagenaryCycle}
       */
      __publicField(this, "hour");
      /**
       * 时间
       * @type {Date}
       */
      __publicField(this, "time");
      /**
       * 二十四节气
       * @type {Array[Date]}
       */
      __publicField(this, "during");
      /**
       * 当前节气
       * @type {Number}
       */
      __publicField(this, "solarTerms");
      /**
       * 一宫
       * @type {Palace}
       */
      __publicField(this, "one");
      /**
       * 二宫
       * @type {Palace}
       */
      __publicField(this, "two");
      /**
       * 三宫
       * @type {Palace}
       */
      __publicField(this, "three");
      /**
       * 四宫
       * @type {Palace}
       */
      __publicField(this, "four");
      /**
       * 五宫
       * @type {Palace}
       */
      __publicField(this, "five");
      /**
       * 六宫
       * @type {Palace}
       */
      __publicField(this, "six");
      /**
       * 七宫
       * @type {Palace}
       */
      __publicField(this, "seven");
      /**
       * 八宫
       * @type {Palace}
       */
      __publicField(this, "eight");
      /**
       * 九宫
       * @type {Palace}
       */
      __publicField(this, "nine");
      /**
       * 先天八卦
       * 乾一、兑二、离三、震四、巽五、坎六、艮七、坤八
       * @type {Array<Palace>}
       */
      __publicField(this, "priori");
      /**
       * 后天八卦
       * 坎一、坤二、震三、巽四、中五、乾六、兑七、艮八、离九
       * @type {Array<Palace>}
       */
      __publicField(this, "acquired");
      /**
       * 九宫格
       * [
       * 	[4,9,2]
       * 	[3,5,7]
       * 	[8,1,6]
       * ]
       * @type {Array<Palace>}
       */
      __publicField(this, "box");
      /**
       * 环宫
       * [4,9,2,7,6,1,8,3]
       * @type {Array<Palace>}
       */
      __publicField(this, "circle");
      /**
       * -9~9对应阴遁九局、阳遁九局
       * @type {Number}
       */
      __publicField(this, "round");
      /**
       * 三元定法列表 顺序：均分、拆补、茅山、置润
       * @type {Array<Number>}
       */
      __publicField(this, "ELEMENTS");
      /**
       * 中宫随法
       * * 中宫寄二宫
       * * 中宫二八宫
       * * 中宫寄四维宫
       * * 中宫寄八节
       * @type {Number}
       */
      __publicField(this, "follow");
      /**
       * 地盘
       * @type {Map<String,Palace>}
       */
      __publicField(this, "earths");
      /**
       * 天盘
       * @type {Map<String,Palace>}
       */
      __publicField(this, "heavens");
      /**
       * 星盘
       * @type {Map<String,Palace>}
       */
      __publicField(this, "stars");
      /**
       * 人盘
       * @type {Map<String,Palace>}
       */
      __publicField(this, "peoples");
      /**
       * 神盘
       * @type {Map<String,Palace>}
       */
      __publicField(this, "divinity");
      /**
       * 十天干
       * @type {Map<String,Palace>}
       */
      __publicField(this, "cs");
      /**
       * 十二地支
       * @type {Map<String,Palace>}
       */
      __publicField(this, "tb");
      /**
       * 用神集
       * @type {Map<name,Palace>}
       */
      __publicField(this, "_");
      this.OPTIONS = this.generateOptions(options);
      __privateSet(this, _Palace, this.OPTIONS.Palace.prototype instanceof Palace_default ? this.OPTIONS.Palace : Palace_default);
      this._ = /* @__PURE__ */ new Map();
      __privateMethod(this, _TaoConvert_instances, generatePalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generatePrioriPalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateAcquiredPalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateNinePalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateCirclePalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateCSPalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateTBPalace_fn).call(this);
      __privateMethod(this, _TaoConvert_instances, generateFlag_fn).call(this);
    }
    generateOptions(options) {
      const DEFAULT_OPTIONS = { Palace: Palace_default, element: null, elements: null };
      return Object.assign({}, DEFAULT_OPTIONS, options);
    }
    select(deities) {
      return this._.get(deities);
    }
    getCanvas() {
      return this.box.map((row) => {
        return row.map((palace) => {
          return palace.toCanvas();
        });
      });
    }
    getArray() {
      return this.box.map((row) => {
        return row.reduce(
          (acc, next) => {
            const canvas = next.toCanvas();
            return acc.map((each, i) => {
              return each.concat(canvas[i]);
            });
          },
          [[], [], []]
        );
      }).reduce((acc, next) => {
        return acc.concat(next);
      }, []);
    }
  };
  _Palace = new WeakMap();
  _TaoConvert_instances = new WeakSet();
  /**
   * 生成九宫
   */
  generatePalace_fn = function() {
    this.one = new (__privateGet(this, _Palace))(0);
    this.two = new (__privateGet(this, _Palace))(1);
    this.three = new (__privateGet(this, _Palace))(2);
    this.four = new (__privateGet(this, _Palace))(3);
    this.five = new (__privateGet(this, _Palace))(4);
    this.six = new (__privateGet(this, _Palace))(5);
    this.seven = new (__privateGet(this, _Palace))(6);
    this.eight = new (__privateGet(this, _Palace))(7);
    this.nine = new (__privateGet(this, _Palace))(8);
  };
  /**
   * 后天八卦
   */
  generateAcquiredPalace_fn = function() {
    this.acquired = [
      this.one,
      this.two,
      this.three,
      this.four,
      this.five,
      this.six,
      this.seven,
      this.eight,
      this.nine
    ];
  };
  /**
   * 先天八卦
   */
  generatePrioriPalace_fn = function() {
    this.priori = [
      this.six,
      this.seven,
      this.nine,
      this.three,
      this.four,
      this.one,
      this.eight,
      this.two
    ];
  };
  /**
   * 生成九宫格
   */
  generateNinePalace_fn = function() {
    this.box = [
      [this.four, this.nine, this.two],
      [this.three, this.five, this.seven],
      [this.eight, this.one, this.six]
    ];
  };
  /**
   * 生成环宫
   */
  generateCirclePalace_fn = function() {
    this.circle = [
      this.four,
      this.nine,
      this.two,
      this.seven,
      this.six,
      this.one,
      this.eight,
      this.three
    ];
    this.circle.map((palace, index) => {
      palace.rIndex = index;
    });
  };
  generateCSPalace_fn = function() {
    this.cs = [
      this.three,
      this.three,
      this.nine,
      this.nine,
      this.five,
      this.five,
      this.seven,
      this.seven,
      this.one,
      this.one
    ];
  };
  generateTBPalace_fn = function() {
    this.tb = [
      this.one,
      this.eight,
      this.eight,
      this.three,
      this.four,
      this.four,
      this.nine,
      this.two,
      this.two,
      this.seven,
      this.six,
      this.six
    ];
  };
  generateFlag_fn = function() {
    this.acquired.map((palace, index) => {
      this._.set(__privateGet(this, _Palace).ACQUIRED[index], palace);
      this._.set(__privateGet(this, _Palace).INDEX[index], palace);
    });
    this.cs.map((palace, index) => {
      const title = CELESTIAL_STEMS_ARR[index];
      this._.set(title, palace);
      palace.setOCS(index, true);
    });
    this.tb.map((palace, index) => {
      const title = TERRESTRIAL_BRANCHES_ARR[index];
      this._.set(title, palace);
      palace.setOTB(index, true);
    });
  };
  var TaoConvert_default = TaoConvert;

  // src/lib/taobi/tools/index.js
  var handler = {
    // 获取倒数X位数
    rightFigure(num, index = 1) {
      const _num = num + "";
      return ~~_num.slice(_num.length - index);
    },
    /**
     * 数组截取
     * @param {Array} list 原数组
     * @param {Number} index 截断点
     * @returns {Array} lists 截取的数组集合
     */
    arraySplit(list, index) {
      return [list.slice(0, index), list.slice(index)];
    },
    /**
     * 数组交换,正数左右，负数右左交换
     * @param {Array} list 原数组
     * @param {Number} index 截断点
     * @returns {Array} arr 交换后的数组
     */
    arraySwap(list, index) {
      if (index < 0) index = list.length + index;
      const result = this.arraySplit(list, index);
      return result[1].concat(result[0]);
    },
    /**
     * 数组左右交换
     * @param {Array} list 原数组
     * @param {Number} index 截断点
     * @returns {Array} arr 交换后的数组
     */
    arrayUp(list, index) {
      return this.arraySwap(list, index);
    },
    /**
     * 数组右左交换
     * @param {Array} list 原数组
     * @param {Number} index 截断点
     * @returns {Array} arr 交换后的数组
     */
    arrayDown(list, index) {
      return this.arraySwap(list, -index);
    }
  };
  var tools_default = handler;

  // src/lib/solarOrbit.js
  var import_solar_terms = __toESM(require_dist4(), 1);
  var import_julian = __toESM(require_lib(), 1);
  function getSolarLongitude(date) {
    try {
      const e = new import_solar_terms.Ecliptic();
      const jd = new import_julian.default(date);
      const l = e.getSunEclipticLongitude(jd);
      if (!isNaN(l)) return (l + 360) % 360;
    } catch (e) {
    }
    const JD = date.getTime() / 864e5 + 24405875e-1;
    const D = JD - 2451545;
    let L = 280.46 + 0.9856474 * D;
    let g = 357.528 + 0.9856003 * D;
    const rad = Math.PI / 180;
    let lambda = L % 360 + 1.915 * Math.sin(g * rad) + 0.02 * Math.sin(2 * g * rad);
    return (lambda + 360) % 360;
  }

  // src/lib/taobi/FixedSolarCalendar.js
  var import_solar_terms2 = __toESM(require_dist4(), 1);
  var import_tao_name = __toESM(require_dist(), 1);
  var { CELESTIAL_STEMS_ARR: CELESTIAL_STEMS_ARR2, SEXAGENARY_CYCLE_ARR } = import_tao_name.default;
  function calcMonth(date, during) {
    const t = date.getTime();
    const d = during.map((d2) => d2.getTime());
    let index = d.reduce((acc, next, i) => {
      if (t >= next - 500) return i;
      return acc;
    }, 0);
    return index;
  }
  function fixedAlgorithm(_date, _o, p = {}) {
    const date = new Date(_date);
    const targetOffset = p.offset !== void 0 ? p.offset : 7;
    const jdUTC = date.getTime() / 864e5 + 24405875e-1;
    const jdLocal = jdUTC + targetOffset / 24;
    const daysSinceRef = Math.floor(jdLocal + 1 / 24 - 24610795e-1);
    let dIndex = (daysSinceRef + 49 + 6e4) % 60;
    const localDate = new Date(date.getTime() + targetOffset * 36e5);
    const year4Terms = localDate.getUTCFullYear();
    const st = new import_solar_terms2.SolarTerms({ year: year4Terms });
    const during = st.getSolarTermsAll();
    const lapXuan = during[2];
    let year = year4Terms;
    if (date.getTime() < lapXuan.getTime() - 1e3) year -= 1;
    let yIndex = (year - 2026 + 42 + 6e4) % 60;
    let stIdx = calcMonth(date, during);
    let monthRank = Math.floor((stIdx + 22) % 24 / 2);
    const startMonthCS = (yIndex % 10 * 2 + 2) % 10;
    const startMonthSexaIndex = SEXAGENARY_CYCLE_ARR.indexOf(CELESTIAL_STEMS_ARR2[startMonthCS] + "\u5BC5");
    const mIndex = (startMonthSexaIndex + monthRank) % 60;
    const localHours = (date.getUTCHours() + targetOffset + 24) % 24;
    const hIndex = (SEXAGENARY_CYCLE_ARR.indexOf(CELESTIAL_STEMS_ARR2[dIndex % 10 * 2 % 10] + "\u5B50") + ~~((localHours + 1) / 2)) % 60;
    const jd = jdUTC;
    let l = new import_solar_terms2.Ecliptic(jd).getSunEclipticLongitude();
    return [[yIndex, mIndex, dIndex, hIndex], during, l];
  }

  // src/lib/lunar.js
  var PI = Math.PI;
  function INT(d) {
    return Math.floor(d);
  }
  function jdFromDate(dd, mm, yy) {
    let a, y, m, jd;
    a = INT((14 - mm) / 12);
    y = yy + 4800 - a;
    m = mm + 12 * a - 3;
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }
  function NewMoon(k) {
    let T, T2, T3, dr, Jd1, M, Mpr, F, C1, deltat, JdNew;
    T = k / 1236.85;
    T2 = T * T;
    T3 = T2 * T;
    dr = PI / 180;
    Jd1 = 241502075933e-5 + 29.53058868 * k + 1178e-7 * T2 - 155e-9 * T3;
    Jd1 = Jd1 + 33e-5 * Math.sin((166.56 + 132.87 * T - 9173e-6 * T2) * dr);
    M = 359.2242 + 29.10535608 * k - 333e-7 * T2 - 347e-8 * T3;
    Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 1236e-8 * T3;
    F = 21.2964 + 390.67050646 * k - 16528e-7 * T2 - 239e-8 * T3;
    C1 = (0.1734 - 393e-6 * T) * Math.sin(M * dr) + 21e-4 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 4e-4 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 51e-4 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 74e-4 * Math.sin(dr * (M - Mpr)) + 4e-4 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 4e-4 * Math.sin(dr * (2 * F - M)) - 6e-4 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 1e-3 * Math.sin(dr * (2 * F - Mpr)) + 5e-4 * Math.sin(dr * (2 * Mpr + M));
    if (T < -11) {
      deltat = 1e-3 + 839e-6 * T + 2261e-7 * T2 - 845e-8 * T3 - 81e-9 * T * T3;
    } else {
      deltat = -278e-6 + 265e-6 * T + 262e-6 * T2;
    }
    JdNew = Jd1 + C1 - deltat;
    return JdNew;
  }
  function SunLongitude(jdn) {
    let T, T2, dr, M, L0, DL, L;
    T = (jdn - 2451545) / 36525;
    T2 = T * T;
    dr = PI / 180;
    M = 357.5291 + 35999.0503 * T - 1559e-7 * T2 - 48e-8 * T * T2;
    L0 = 280.46645 + 36000.76983 * T + 3032e-7 * T2;
    DL = (1.9146 - 4817e-6 * T - 14e-6 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 101e-6 * T) * Math.sin(dr * 2 * M) + 29e-5 * Math.sin(dr * 3 * M);
    L = L0 + DL;
    L = L * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return L;
  }
  function getSunLongitude(dayNumber, timeZone) {
    return INT(SunLongitude(dayNumber - 0.5 - timeZone / 24) / PI * 6);
  }
  function getNewMoonDay(k, timeZone) {
    return INT(NewMoon(k) + 0.5 + timeZone / 24);
  }
  function getLunarMonth11(yy, timeZone) {
    let k, off, nm, sunLong;
    off = jdFromDate(31, 12, yy) - 2415021;
    k = INT(off / 29.530588853);
    nm = getNewMoonDay(k, timeZone);
    sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= 9) {
      nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }
  function getLeapMonthOffset(a11, timeZone) {
    let k, last, arc, i;
    k = INT((a11 - 2415021076998695e-9) / 29.530588853 + 0.5);
    last = 0;
    i = 1;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc;
      i++;
      arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc != last && i < 14);
    return i - 1;
  }
  function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
    let k, dayNumber, monthStart, a11, b11, lunarDay, lunarMonth;
    let lunarYear, lunarLeap, diff, leapMonthDiff;
    dayNumber = jdFromDate(dd, mm, yy);
    k = INT((dayNumber - 2415021076998695e-9) / 29.530588853);
    monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    a11 = getLunarMonth11(yy, timeZone);
    b11 = a11;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    lunarDay = dayNumber - monthStart + 1;
    diff = INT((monthStart - a11) / 29);
    lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff == leapMonthDiff) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      isLeap: lunarLeap === 1
    };
  }

  // src/lib/taobi/pojo/taobi/TheArtOfBecomingInvisible.js
  var surpriseCeremony = CEREMONY_ARR.concat(SURPRISE_ARR);
  var _hourConceal, _longitude, _TheArtOfBecomingInvisible_instances, generateCalendar_fn, generateRound_fn, generateElement_fn, generateHourConcealFlag_fn, midPlace_fn, rotary_fn, overEarths_fn, overHeavens_fn, overPeoples_fn, overDivinity_fn, overEarthDivinity_fn, getMandateAndSymbol_fn, generateBy_fn, generateEarths_fn, generateHeavens_fn, generateStars_fn, generatePeoples_fn, generateDivinity_fn, cycle_fn, overHS_fn, overDE_fn, overHiddenJia_fn;
  var TheArtOfBecomingInvisible = class extends TaoConvert_default {
    /**
     * @description 奇门起局
     * @param {Calendar} questionTime 求测时辰
     * @param {Number} r 用局
     * @param {*} arranged 排盘方法，转盘/飞盘
     * @param {*} follow 中五宫随法，寄坤二宫/宫二八宫/...
     * @param {Object} options 配置项
     * @version 1.0.0
     * @author lax
     */
    constructor(questionTime, r, arranged, follow = 0, options) {
      super(options);
      __privateAdd(this, _TheArtOfBecomingInvisible_instances);
      /**
       * 时旬首隐旗
       */
      __privateAdd(this, _hourConceal);
      /**
       * 地心黄经
       * @type {Number}
       */
      __privateAdd(this, _longitude);
      this.follow = this.OPTIONS.follow === void 0 ? follow : this.OPTIONS.follow;
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateCalendar_fn).call(this, questionTime);
      this.round = __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateRound_fn).call(this, r);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateHourConcealFlag_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overEarths_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, getMandateAndSymbol_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overHeavens_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overPeoples_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overDivinity_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overEarthDivinity_fn).call(this);
      const R = Math.abs(this.round);
      const path = [4, 5, 6, 7, 8, 0, 1, 2, 3];
      path.forEach((pIdx, fIdx) => {
        const val = (fIdx + R - 1) % 9 + 1;
        this.acquired[pIdx].setPalaceNo(`${val}`);
      });
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overHS_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overDE_fn).call(this);
      __privateMethod(this, _TheArtOfBecomingInvisible_instances, overHiddenJia_fn).call(this);
    }
    // TODO
    getSymbol(is = false) {
      return is ? Star_default.STAR_ARR[this.symbol] : this.symbol;
    }
    getMandate(is = false) {
      return is ? Door_default.STAR_ARR[this.mandate] : this.mandate;
    }
    getSolarTerms(is = false) {
      return is ? solarTerms_default[this.solarTerms] : this.solarTerms;
    }
    getLunarDate() {
      if (this.time) {
        const d = this.time;
        const tz = this.OPTIONS && this.OPTIONS.offset !== void 0 ? this.OPTIONS.offset : 7;
        return convertSolar2Lunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), tz);
      }
      return null;
    }
    getKienTinh() {
      if (this.month && this.date) {
        const mIndex = this.month.tb().getValue();
        const dIndex = this.date.tb().getValue();
        const stars = [
          { name: "Ki\u1EBFn", type: "cat", label: "Th\u1EE9 C\xE1t", shortDesc: "T\u1ED1t cho kh\u1EDFi \u0111\u1EA7u, ki\u1EBFn t\u1EA1o", fullDesc: "T\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 kh\u1EDFi \u0111\u1EA7u v\xE0 ph\xE1t tri\u1EC3n. R\u1EA5t t\u1ED1t: xu\u1EA5t h\xE0nh, k\xFD h\u1EE3p \u0111\u1ED3ng, k\u1EBFt h\xF4n, kh\u1EDFi c\xF4ng. K\u1EF5: mua xe m\u1EDBi, h\u1EA1 th\u1EE7y thuy\u1EC1n, \u0111\xE0o gi\u1EBFng." },
          { name: "Tr\u1EEB", type: "cat", label: "Th\u1EE9 C\xE1t", shortDesc: "T\u1EA9y u\u1EBF, \u0111\xF3n m\u1EDBi", fullDesc: "Mang \xFD ngh\u0129a t\u1EA9y tr\u1EEB xui x\u1EBBo, \u0111\xF3n nh\u1EADn nh\u1EEFng \u0111i\u1EC1u m\u1EDBi m\u1EBB. T\u1ED1t: \u0111\u1ED9ng th\u1ED5, giao d\u1ECBch, c\u1EA7u ph\xFAc. K\u1EF5: k\xFD k\u1EBFt h\u1EE3p \u0111\u1ED3ng, k\u1EBFt h\xF4n, \u0111i xa." },
          { name: "M\xE3n", type: "cat", label: "Th\u1EE9 C\xE1t", shortDesc: "\u0110\u1EA7y \u0111\u1EE7, m\u1EF9 m\xE3n", fullDesc: "Mang \xFD ngh\u0129a \u0111\u1EA7y \u0111\u1EE7 v\xE0 m\u1EF9 m\xE3n. T\u1ED1t: c\u1EA7u t\xE0i, khai tr\u01B0\u01A1ng, t\u1EBF t\u1EF1. K\u1EF5: c\u1EA7u y, nh\u1EADm ch\u1EE9c, ki\u1EC7n t\u1EE5ng." },
          { name: "B\xECnh", type: "binh", label: "B\xECnh", shortDesc: "B\xECnh \u1ED5n, c\xE2n b\u1EB1ng", fullDesc: "L\xE0 ng\xE0y b\xECnh \u1ED5n. T\u1ED1t: c\u1EA7u t\u1EF1, \u0111\u1ED9ng th\u1ED5, tu t\u1EA1o. K\u1EF5: an t\xE1ng, khai tr\u01B0\u01A1ng, nh\u1EADm ch\u1EE9c." },
          { name: "\u0110\u1ECBnh", type: "cat", label: "Th\u1EE9 C\xE1t", shortDesc: "\u1ED4n \u0111\u1ECBnh, ch\u1EAFc ch\u1EAFn", fullDesc: "T\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 \u1ED5n \u0111\u1ECBnh. T\u1ED1t: nh\u1EADp h\u1ECDc, m\u1EDF b\u1EBFp m\u1EDBi, s\u1EEDa \u0111\u01B0\u1EDDng. K\u1EF5: xu\u1EA5t h\xE0nh xa, ki\u1EC7n t\u1EE5ng, giao thi\u1EC7p." },
          { name: "Ch\u1EA5p", type: "hung", label: "Hung", shortDesc: "Tr\xE1nh vi\u1EC7c l\u1EDBn", fullDesc: "L\xE0 ng\xE0y x\u1EA5u, kh\xF4ng n\xEAn th\u1EF1c hi\u1EC7n c\xE1c c\xF4ng vi\u1EC7c quan tr\u1ECDng, \u0111\u1EB7c bi\u1EC7t l\xE0 h\u1EF7 s\u1EF1. N\xEAn tr\xE1nh: d\u1EDDi nh\xE0, c\u1EA7u t\xE0i, xu\u1EA5t h\xE0nh. C\xF3 th\u1EC3: t\u1EBF t\u1EF1, tu t\u1EA1o." },
          { name: "Ph\xE1", type: "hung", label: "Hung", shortDesc: "Ph\xE1 h\u1EE7y, ph\xE1 d\u1EE1", fullDesc: "Mang \xFD ngh\u0129a ph\xE1 b\u1ECF. Kh\xF4ng th\xEDch h\u1EE3p: m\u1EDF h\xE0ng, c\u01B0\u1EDBi h\u1ECFi, d\u1EDDi nh\xE0. C\xF3 th\u1EC3: ph\xE1 th\u1ED5, c\u1EA7u y." },
          { name: "Nguy", type: "hung", label: "Hung", shortDesc: "Nguy hi\u1EC3m", fullDesc: "Mang \xFD ngh\u0129a nguy hi\u1EC3m. N\xEAn tr\xE1nh: xu\u1EA5t h\xE0nh, leo n\xFAi, d\u1EDDi nh\xE0. C\xF3 th\u1EC3: ph\xE1 th\u1ED5, c\u1EA7u ph\xFAc." },
          { name: "Th\xE0nh", type: "thuong-cat", label: "Th\u01B0\u1EE3ng C\xE1t", shortDesc: "Th\xE0nh c\xF4ng", fullDesc: "T\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 th\xE0nh c\xF4ng. R\u1EA5t t\u1ED1t: \u0111\u1ED9ng th\u1ED5, khai tr\u01B0\u01A1ng, k\u1EBFt h\xF4n, d\u1EDDi nh\xE0. K\u1EF5: ki\u1EC7n t\u1EE5ng." },
          { name: "Thu", type: "thuong-cat", label: "Th\u01B0\u1EE3ng C\xE1t", shortDesc: "Thu ho\u1EA1ch, giao d\u1ECBch", fullDesc: "T\u1ED1t cho c\xE1c c\xF4ng vi\u1EC7c nh\u01B0 c\u1EA7u t\u1EF1, \u0111\u1ED9ng th\u1ED5, mua b\xE1n. K\u1EF5: an s\xE0ng, ph\xE1 th\u1ED5, h\u1EA1 th\u1EE7y t\xE0u thuy\u1EC1n." },
          { name: "Khai", type: "thuong-cat", label: "Th\u01B0\u1EE3ng C\xE1t", shortDesc: "Kh\u1EDFi \u0111\u1EA7u, khai m\u1EDF", fullDesc: "Mang \xFD ngh\u0129a kh\u1EDFi \u0111\u1EA7u. Th\xEDch h\u1EE3p: d\u1EF1ng c\u1ED9t, khai tr\u01B0\u01A1ng, \u0111\u1ED9ng th\u1ED5, xu\u1EA5t h\xE0nh. K\u1EF5: cho vay, t\u1ED1 t\u1EE5ng." },
          { name: "B\u1EBF", type: "hung", label: "Hung", shortDesc: "B\u1EBF t\u1EAFc", fullDesc: "L\xE0 ng\xE0y cu\u1ED1i c\xF9ng, mang \xFD ngh\u0129a b\u1EBF t\u1EAFc. N\xEAn tr\xE1nh: c\u1EA7u y, xu\u1EA5t h\xE0nh, khai tr\u01B0\u01A1ng. C\xF3 th\u1EC3: l\u1EA5p v\xE1, \u0111\xE0o huy\u1EC7t." }
        ];
        const idx = (dIndex - mIndex + 12) % 12;
        return {
          name: `${stars[idx].name} nh\u1EADt`,
          type: stars[idx].type,
          label: stars[idx].label,
          shortDesc: stars[idx].shortDesc,
          fullDesc: stars[idx].fullDesc
        };
      }
      return null;
    }
  };
  _hourConceal = new WeakMap();
  _longitude = new WeakMap();
  _TheArtOfBecomingInvisible_instances = new WeakSet();
  /**
   * @description 生成干支历
   * @check FALSE
   * @param {Date/String} questionTime
   * @version 1.0.0
   * @author lax
   */
  generateCalendar_fn = function(questionTime) {
    const offset = this.OPTIONS && this.OPTIONS.offset !== void 0 ? this.OPTIONS.offset : 7;
    const dateObj = new Date(questionTime);
    this.calendar = new import_tao_calendar4.Calendar(dateObj, void 0, 0, fixedAlgorithm, { offset });
    const { year, month, date, hour, during, l } = this.calendar;
    this.year = year;
    this.month = month;
    this.date = date;
    this.hour = hour;
    this.during = during;
    this.time = dateObj;
    let longitude = l;
    if (longitude === void 0 || longitude === null) {
      longitude = getSolarLongitude(this.time);
    }
    if (!isNaN(longitude)) {
      __privateSet(this, _longitude, (longitude % 360 + 360) % 360);
      this.solarTerms = (~~(__privateGet(this, _longitude) / 15) + 5) % 24;
    }
  };
  /**
   * @description 落宫节气之首用局为宫数，余气按阴阳递进加减
   * 三元则六甲一旬
   * @check TRUE
   * @param {Number} r 用局数
   * @param {Number} element 上中下元
   * @returns {Number} round 用局数
   * @version 1.0.0
   * @author lax
   */
  generateRound_fn = function(r, element = __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateElement_fn).call(this)) {
    if ((__privateGet(this, _longitude) === void 0 || isNaN(__privateGet(this, _longitude))) && !r)
      throw new Error("Kh\xF4ng th\u1EC3 l\u1EADp c\u1EE5c: Thi\u1EBFu d\u1EEF li\u1EC7u ho\xE0ng kinh m\u1EB7t tr\u1EDDi v\xE0 kh\xF4ng c\xF3 c\u1EE5c s\u1ED1 \u0111\u1EA7u v\xE0o.");
    if (typeof r === "number") return r % 10 === 0 ? 1 : r % 10;
    const ACQUIRED_INDEX = [1, 8, 3, 4, 9, 2, 7, 6];
    const rotate = ~~(__privateGet(this, _longitude) / 15);
    const index = ~~((rotate / 3 + 2) % 8);
    const pl = rotate % 3;
    const yy = index < 4 ? 1 : -1;
    let round = ACQUIRED_INDEX[index] + yy * pl;
    round = (round + yy * 6 * element + 17) % 9;
    round += 1;
    round *= yy;
    return round;
  };
  /**
   * @description 生成上中下元
   * @check FALSE
   * @version 1.0.0
   * @author lax
   */
  generateElement_fn = function(e) {
    if (!__privateGet(this, _longitude)) return 0;
    const AVERAGE = ~~(__privateGet(this, _longitude) / 5) % 3;
    const SPLIT = ~~(this.date.index / 5) % 3;
    let MAO = 0;
    if (this.during && this.during[this.solarTerms]) {
      MAO = ~~((this.time.getTime() - this.during[this.solarTerms].getTime()) / (24 * 60 * 60 * 1e3) / 5);
    }
    MAO = MAO > 2 ? 2 : MAO;
    const LEAP = 0;
    this.ELEMENTS = [AVERAGE, SPLIT, MAO, LEAP];
    if (this.OPTIONS.element !== null && this.OPTIONS.element !== void 0) return this.OPTIONS.element % 3;
    let use = e !== void 0 && e !== null ? e : this.OPTIONS.elements !== null && this.OPTIONS.elements !== void 0 ? this.OPTIONS.elements : 1;
    return this.ELEMENTS[use % 4];
  };
  /**
   * @description 时干支旬首所隐旗
   * @check TRUE
   * @version 1.0.0
   * @author lax
   */
  generateHourConcealFlag_fn = function() {
    __privateSet(this, _hourConceal, this.hour.getLead().getConceal(true));
  };
  /**
   * @description 中宫所寄宫
   * 二宫/二八宫/四维宫/八节
   * @param {Number} follow
   * @returns index
   * @check FALSE
   * @version 1.0.0
   * @author lax
   */
  midPlace_fn = function(follow = this.follow) {
    switch (follow) {
      // 寄坤二宫
      case 0:
        return 1;
      // 阳遁八宫，阴遁二宫
      case 1:
        return this.round > 0 ? 7 : 1;
      // TODO寄四维宫
      case 2:
        return 1;
      // TODO寄八节法
      case 3:
        return 1;
      default:
        return 1;
    }
  };
  // TODO转盘
  rotary_fn = function(palaces, arr) {
  };
  /**
   * @description 布地盘三奇六仪，用局数对应宫为戊，阳顺阴逆
   * @check TRUE
   * @version 1.0.0
   * @author lax
   */
  overEarths_fn = function() {
    let index = this.round - 1;
    let _acquired = this.acquired;
    if (this.round < 0) {
      index += 1;
      _acquired = Array.from(this.acquired).reverse();
    }
    _acquired = tools_default.arrayUp(_acquired, index);
    _acquired.forEach((palace, i) => {
      palace.setECS([surpriseCeremony[i]]);
    });
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateEarths_fn).call(this);
  };
  /**
   * @description 布天盘九星，值符随时干，坤五随宫
   * @check TRUE
   * @version 1.0.0
   * @author lax
   */
  overHeavens_fn = function() {
    let hourCS = this.hour.getCsOrigin(true);
    let hIndex = this.earths.get(hourCS).rIndex;
    let eIndex = this.earths.get(__privateGet(this, _hourConceal)).rIndex;
    let offset = eIndex - hIndex;
    offset = __privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 8, offset);
    const stars = this.circle.map(({ index, ecs }) => {
      return { star: [index], ecs };
    });
    tools_default.arrayUp(stars, offset).map((data, index) => {
      let palace = this.circle[index];
      palace.setStar(data.star);
      palace.setHCS(data.ecs);
    });
    const r = this.acquired[__privateMethod(this, _TheArtOfBecomingInvisible_instances, midPlace_fn).call(this)].rIndex;
    const p = this.circle[__privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 8, r - offset)];
    p.setStar("\u5929\u79BD\u661F", true);
    p.setHCS(this.five.ecs[0], true);
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateHeavens_fn).call(this);
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateStars_fn).call(this);
  };
  /**
   * @description 布人盘,值使随时宫
   * @check TRUE
   * @version 1.0.0
   * @author lax
   */
  overPeoples_fn = function() {
    const hourTb = this.hour.tb();
    const headTb = this.hour.getLead().tb();
    const timeOffset = __privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 12, hourTb.getValue() - headTb.getValue());
    let index = this.earths.get(__privateGet(this, _hourConceal)).index;
    index += timeOffset * (this.round > 0 ? 1 : -1);
    index = __privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 9, index);
    const mandatePalace = this.acquired[index].rIndex;
    const peoples = this.circle.map((palace) => {
      return palace.index;
    });
    const offset = peoples.indexOf(this.mandate) - mandatePalace;
    tools_default.arrayUp(peoples, offset).map((data, i) => {
      let palace = this.circle[i];
      palace.setDoor(data);
    });
    this.acquired[index === 4 ? __privateMethod(this, _TheArtOfBecomingInvisible_instances, midPlace_fn).call(this) : index].setZS(true);
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generatePeoples_fn).call(this);
  };
  /**
   * @description 布神盘
   * @check FALSE
   * @version 1.0.0
   * @author lax
   */
  overDivinity_fn = function() {
    const symbol = this.stars.get(this.getSymbol(true)).rIndex;
    let _divinity = [...Divinity_default.DIVINITY_ARR];
    if (this.round > 0) {
      _divinity[4] = "\u52FE\u9648";
      _divinity[5] = "\u6731\u96C0";
    }
    const order = [..._divinity];
    if (this.round < 0) {
      _divinity = _divinity.reverse();
    }
    let offset = symbol - _divinity.indexOf(order[0]);
    offset = __privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 8, offset);
    tools_default.arrayUp(_divinity, -offset).map((data, i) => {
      let palace = this.circle[i];
      const standardIndex = order.indexOf(data);
      palace.setDivinity(standardIndex === -1 ? Divinity_default.DIVINITY_ARR.indexOf(data) : standardIndex, data);
    });
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateDivinity_fn).call(this);
  };
  overEarthDivinity_fn = function() {
    let symbolIndex = this.symbol;
    if (symbolIndex === 4) symbolIndex = __privateMethod(this, _TheArtOfBecomingInvisible_instances, midPlace_fn).call(this);
    const startPalace = this.acquired[symbolIndex];
    const rIndex = startPalace.rIndex;
    let _divinity = [...Divinity_default.DIVINITY_ARR];
    const order = [..._divinity];
    let offset = rIndex - _divinity.indexOf(order[0]);
    offset = __privateMethod(this, _TheArtOfBecomingInvisible_instances, cycle_fn).call(this, 8, offset);
    tools_default.arrayUp(_divinity, -offset).map((data, i) => {
      let palace = this.circle[i];
      const standardIndex = order.indexOf(data);
      palace.setEarthDivinity(standardIndex === -1 ? Divinity_default.DIVINITY_ARR.indexOf(data) : standardIndex, data);
    });
  };
  /**
   * @description 获取值使和值符
   * @check TRUE
   * @version 1.0.0
   * @author lax
   */
  getMandateAndSymbol_fn = function() {
    let index = this.earths.get(__privateGet(this, _hourConceal)).index;
    this.symbol = index;
    if (index === 4) index = __privateMethod(this, _TheArtOfBecomingInvisible_instances, midPlace_fn).call(this);
    this.mandate = index;
    this.five.rIndex = this.acquired[__privateMethod(this, _TheArtOfBecomingInvisible_instances, midPlace_fn).call(this)].rIndex;
  };
  generateBy_fn = function(area, pro) {
    this[area] = new Map(
      this.acquired.reduce((acc, next) => {
        let tag = next[`get${pro}`](true);
        tag = [].concat(tag);
        tag = tag.map((t) => [t, next]);
        return acc.concat(tag);
      }, [])
    );
  };
  generateEarths_fn = function() {
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateBy_fn).call(this, "earths", "ECS");
  };
  generateHeavens_fn = function() {
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateBy_fn).call(this, "heavens", "HCS");
  };
  generateStars_fn = function() {
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateBy_fn).call(this, "stars", "Star");
  };
  generatePeoples_fn = function() {
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateBy_fn).call(this, "peoples", "Door");
  };
  generateDivinity_fn = function() {
    __privateMethod(this, _TheArtOfBecomingInvisible_instances, generateBy_fn).call(this, "divinity", "Divinity");
  };
  cycle_fn = function(r, v) {
    return (r + v) % r;
  };
  /**
   * @description Tính Mã Tinh (HS)
   */
  overHS_fn = function() {
    const hourTbIndex = this.hour.tb().getValue();
    let hsTb = -1;
    if ([8, 0, 4].includes(hourTbIndex)) hsTb = 2;
    else if ([2, 6, 10].includes(hourTbIndex)) hsTb = 8;
    else if ([5, 9, 1].includes(hourTbIndex)) hsTb = 11;
    else if ([11, 3, 7].includes(hourTbIndex)) hsTb = 5;
    if (hsTb !== -1) {
      const palace = this.tb[hsTb];
      if (palace) palace.setHS(true);
    }
  };
  /**
   * @description Tính Không Vong (DE)
   */
  overDE_fn = function() {
    const type = this.OPTIONS.deType || "hour";
    const pillar = type === "day" ? this.date : this.hour;
    const xunShou = pillar.getLead();
    const startIdx = xunShou.tb().getValue();
    const de1 = (startIdx + 10) % 12;
    const de2 = (startIdx + 11) % 12;
    if (this.tb[de1]) {
      this.tb[de1].setDE(true);
    }
    if (this.tb[de2]) {
      this.tb[de2].setDE(true);
    }
  };
  /**
   * @description Tính Ẩn Giáp (Hidden Jia)
   */
  /**
   * @description Tính Ẩn Giáp (Hidden Jia)
   */
  overHiddenJia_fn = function() {
    this.acquired.forEach((p) => p.setHJ(false));
    const pillar = this.hour;
    if (!pillar) return;
    const hiddenStem = pillar.getLead().getConceal(true);
    if (!hiddenStem) return;
    this.acquired.forEach((p) => {
      if (p.getHCS(true).includes(hiddenStem)) {
        p.setHJ(true);
      }
    });
  };
  var TheArtOfBecomingInvisible_default = TheArtOfBecomingInvisible;

  // src/lib/qmdj_patterns.js
  var PATTERNS = [
    {
      id: "tlpt",
      name: "Thanh Long Ph\u1EA3n Th\u1EE7",
      check: (p) => {
        const hcs = p.getHCS(true);
        const ecs = p.getECS(true);
        return hcs.includes("\u620A") && ecs.includes("\u4E19");
      },
      desc: "\u620A/\u4E19 (M\u1EADu/B\xEDnh) - Thanh Long Ph\u1EA3n Th\u1EE7: \u0110\u1EA1i c\xE1t, ti\u1EC1n b\u1EA1c d\u1ED3i d\xE0o, th\u0103ng quan, h\xF4n nh\xE2n thu\u1EADn l\u1EE3i.",
      type: "cat"
    },
    {
      id: "pddh",
      name: "Phi \u0110i\u1EC3u \u0110i\u1EC7t Huy\u1EC7t",
      check: (p) => {
        const hcs = p.getHCS(true);
        const ecs = p.getECS(true);
        return hcs.includes("\u4E19") && ecs.includes("\u620A");
      },
      desc: "\u4E19/\u620A (B\xEDnh/M\u1EADu) - Phi \u0110i\u1EC3u \u0110i\u1EC7t Huy\u1EC7t: M\u1ECDi s\u1EF1 hanh th\xF4ng, c\u1EA7u t\xE0i \u0111\u1EAFc l\u1EE3i, x\xE2y d\u1EF1ng t\u1ED1t.",
      type: "cat"
    },
    {
      id: "thien_don",
      name: "Thi\xEAn \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const divinity = p.getDivinity(true);
        const ecs = p.getECS(true);
        return hcs.includes("\u4E19") && door === "\u751F\u95E8" && (divinity === "\u503C\u7B26" || ecs.includes("\u4E01"));
      },
      desc: "\u4E19/\u4E01 (B\xEDnh/\u0110inh) + Sinh M\xF4n - Thi\xEAn \u0110\u1ED9n: Thi\xEAn b\xE0n B\xEDnh K\u1EF3, c\u1EEDa Sinh g\u1EB7p \u0110\u1ECBa b\xE0n \u0110inh K\u1EF3 ho\u1EB7c th\u1EA7n Tr\u1EF1c Ph\xF9. C\xE1ch c\u1EE5c \u0111\u1EA1i c\xE1t, th\u01B0\u1EE3ng c\u1EA5p \u0111\u1EC1 b\u1EA1t, th\u0103ng quan ti\u1EBFn ch\u1EE9c, c\u1EA7u t\xE0i, h\xF4n nh\xE2n \u0111\u1EC1u v\xF4 c\xF9ng thu\u1EADn l\u1EE3i.",
      type: "cat"
    },
    {
      id: "dia_don",
      name: "\u0110\u1ECBa \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const divinity = p.getDivinity(true);
        const ecs = p.getECS(true);
        return hcs.includes("\u4E59") && door === "\u751F\u95E8" && (divinity === "\u4E5D\u5730" || ecs.includes("\u5DF1"));
      },
      desc: "\u4E59/\u5DF1 (\u1EA4t/K\u1EF7) + Sinh M\xF4n - \u0110\u1ECBa \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa Sinh g\u1EB7p \u0110\u1ECBa b\xE0n K\u1EF7 ho\u1EB7c th\u1EA7n C\u1EEDu \u0110\u1ECBa. C\xE1ch c\u1EE5c c\xE1t t\u01B0\u1EDBng, l\u1EE3i cho vi\u1EC7c mai ph\u1EE5c qu\xE2n binh, x\xE2y d\u1EF1ng, m\u01B0u \u0111\u1ED3 \u0111\u1EA1i s\u1EF1 b\xED m\u1EADt, c\u1EA7u t\xE0i \u0111\u1EAFc l\u1EE3i.",
      type: "cat"
    },
    {
      id: "nhan_don",
      name: "Nh\xE2n \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const divinity = p.getDivinity(true);
        return hcs.includes("\u4E01") && door === "\u4F11\u95E8" && divinity === "\u592A\u9634";
      },
      desc: "\u4E01 + H\u01B0u M\xF4n + Th\xE1i \xC2m - Nh\xE2n \u0110\u1ED9n: Thi\xEAn b\xE0n \u0110inh K\u1EF3, c\u1EEDa H\u01B0u g\u1EB7p th\u1EA7n Th\xE1i \xC2m. L\u1EE3i cho vi\u1EC7c chi\xEAu hi\u1EC1n \u0111\xE3i s\u0129, h\u1ED9i h\u1ECDp b\xE0n b\u1EA1c, c\u1EA7u h\xF4n, t\xECm ng\u01B0\u1EDDi gi\xFAp \u0111\u1EE1.",
      type: "cat"
    },
    {
      id: "than_don",
      name: "Th\u1EA7n \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const divinity = p.getDivinity(true);
        return hcs.includes("\u4E19") && door === "\u751F\u95E8" && divinity === "\u4E5D\u5929";
      },
      desc: "\u4E19 + Sinh M\xF4n + C\u1EEDu Thi\xEAn - Th\u1EA7n \u0110\u1ED9n: Thi\xEAn b\xE0n B\xEDnh K\u1EF3 quy\u1EC7n c\xF9ng c\u1EEDa Sinh v\xE0 th\u1EA7n C\u1EEDu Thi\xEAn. Uy danh vang d\u1ED9i, l\u1EE3i cho vi\u1EC7c t\u1EBF t\u1EF1 c\u1EA7u ph\xFAc, xu\u1EA5t binh \u0111\xE1nh gi\u1EB7c, m\u01B0u s\u1EF1 hi\u1EC3n \u0111\u1EA1t.",
      type: "cat"
    },
    {
      id: "quy_don",
      name: "Qu\u1EF7 \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const divinity = p.getDivinity(true);
        return hcs.includes("\u4E59") && door === "\u675C\u95E8" && divinity === "\u4E5D\u5730";
      },
      desc: "\u4E59 + \u0110\u1ED7 M\xF4n + C\u1EEDu \u0110\u1ECBa - Qu\u1EF7 \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa \u0110\u1ED7 g\u1EB7p th\u1EA7n C\u1EEDu \u0110\u1ECBa. T\u1ED1t cho vi\u1EC7c mai t\xE1ng, c\u1EA7u si\xEAu, \u1EA9n n\u1EA5p, t\u1EADp k\xEDch b\u1EA5t ng\u1EDD khi\u1EBFn \u0111\u1ED1i ph\u01B0\u01A1ng kh\xF4ng k\u1ECBp tr\u1EDF tay.",
      type: "cat"
    },
    {
      id: "long_don",
      name: "Long \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const name = p.getPalace(true);
        return hcs.includes("\u4E59") && door === "\u751F\u95E8" && (name === "\u574E" || name === "\u5DFD");
      },
      desc: "\u4E59/Kh\u1EA3m-T\u1ED1n + Sinh M\xF4n - Long \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa Sinh \u0111\xE1o Kh\u1EA3m (Th\u1EE7y) ho\u1EB7c T\u1ED1n (ph\u01B0\u01A1ng Long). T\u1ED1t cho vi\u1EC7c th\u1EE7y chi\u1EBFn, c\u1EA7u m\u01B0a, bu\xF4n b\xE1n \u0111\u01B0\u1EDDng th\u1EE7y, tu t\u1EA1o c\u1EA7u \u0111\u01B0\u1EDDng.",
      type: "cat"
    },
    {
      id: "ho_don",
      name: "H\u1ED5 \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const name = p.getPalace(true);
        return hcs.includes("\u4E59") && door === "\u751F\u95E8" && name === "\u826E";
      },
      desc: "\u4E59/C\u1EA5n + Sinh M\xF4n - H\u1ED5 \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa Sinh \u0111\xE1o cung C\u1EA5n (ph\u01B0\u01A1ng D\u1EA7n - H\u1ED5). Trong tr\u01B0\u1EDDng h\u1EE3p Ph\u1EE5c Ng\xE2m (\u1EA4t/\u1EA4t), s\u1EE9c m\u1EA1nh c\xE0ng t\u0103ng. T\u1ED1t cho vi\u1EC7c x\xE2y d\u1EF1ng, vi\u1EC5n h\xE0nh \u0111\u01B0\u1EDDng b\u1ED9, khu\u1EA5t ph\u1EE5c \u0111\u1ED1i ph\u01B0\u01A1ng.",
      type: "cat"
    },
    {
      id: "phong_don",
      name: "Phong \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const name = p.getPalace(true);
        return hcs.includes("\u4E59") && door === "\u5F00\u95E8" && name === "\u5DFD";
      },
      desc: "\u4E59/T\u1ED1n + Khai M\xF4n - Phong \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa Khai \u0111\xE1o cung T\u1ED1n (Phong). T\u1ED1t cho vi\u1EC7c h\xE0nh qu\xE2n theo chi\u1EC1u gi\xF3, d\xF9ng h\u1ECFa c\xF4ng, ph\xE1t l\u1EC7nh truy\u1EC1n tin \u0111i xa.",
      type: "cat"
    },
    {
      id: "van_don",
      name: "V\xE2n \u0110\u1ED9n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const door = p.getDoor(true);
        const name = p.getPalace(true);
        return hcs.includes("\u4E59") && door === "\u5F00\u95E8" && name === "\u5764";
      },
      desc: "\u4E59/Kh\xF4n + Khai M\xF4n - V\xE2n \u0110\u1ED9n: Thi\xEAn b\xE0n \u1EA4t K\u1EF3, c\u1EEDa Khai \u0111\xE1o cung Kh\xF4n (\u0110\u1ECBa/V\xE2n). T\u1ED1t cho vi\u1EC7c c\u1EA7u m\u01B0a, t\u1EADp k\xEDch b\xED m\u1EADt, m\u01B0u s\u1EF1 k\xEDn \u0111\xE1o nh\u01B0 m\xE2y che m\u1EAFt \u0111\u1ED1i th\u1EE7.",
      type: "cat"
    },
    {
      id: "ngu_bat_ngo",
      name: "Ng\u0169 B\u1EA5t Ng\u1ED9 Th\u1EDDi",
      check: (p, chart) => {
        return false;
      },
      desc: "C\u1EF1c hung, tr\u0103m vi\u1EC7c kh\xF4ng n\xEAn l\xE0m.",
      type: "hung"
    },
    {
      id: "kich_hinh",
      name: "L\u1EE5c Nghi K\xEDch H\xECnh",
      check: (p) => {
        const hcs = p.getHCS(true);
        const idx = p.index;
        if (hcs.includes("\u620A") && idx === 2) return true;
        if (hcs.includes("\u5DF1") && idx === 1) return true;
        if (hcs.includes("\u5E9A") && idx === 7) return true;
        if (hcs.includes("\u8F9B") && idx === 8) return true;
        if (hcs.includes("\u58EC") && idx === 3) return true;
        if (hcs.includes("\u7678") && idx === 3) return true;
        return false;
      },
      desc: "L\u1EE5c Nghi K\xEDch H\xECnh: C\xE1c can M\u1EADu, K\u1EF7, Canh, T\xE2n, Nh\xE2m, Qu\xFD r\u01A1i v\xE0o c\xE1c cung h\xECnh (T\xFD-M\xE3o, Tu\u1EA5t-M\xF9i, Th\xE2n-D\u1EA7n, Ng\u1ECD-Ng\u1ECD, Th\xECn-Th\xECn, D\u1EA7n-T\u1EF5). C\u1EF1c hung, g\xE2y t\u1ED5n h\u1EA1i, ki\u1EC7n t\u1EE5ng, th\u1EA5t b\u1EA1i.",
      type: "hung"
    },
    {
      id: "tam_ky_dac_su",
      name: "Tam K\u1EF3 \u0110\u1EAFc S\u1EE9",
      check: (p) => {
        const hcs = p.getHCS(true);
        const ecs = p.getECS(true);
        return hcs.includes("\u4E59") && ecs.includes("\u5DF1") || hcs.includes("\u4E19") && ecs.includes("\u5E9A") || hcs.includes("\u4E01") && ecs.includes("\u8F9B");
      },
      desc: "Tam K\u1EF3 \u0110\u1EAFc S\u1EE9: \u1EA4t/K\u1EF7, B\xEDnh/Canh ho\u1EB7c \u0110inh/T\xE2n. Tam K\u1EF3 g\u1EB7p L\u1EE5c Nghi t\u01B0\u01A1ng \u1EE9ng, l\u1EE3i cho vi\u1EC7c c\u1EA7u t\xE0i, giao ti\u1EBFp, th\u0103ng quan ti\u1EBFn ch\u1EE9c.",
      type: "cat"
    },
    {
      id: "ngoc_nu_thu_mon",
      name: "Ng\u1ECDc N\u1EEF Th\u1EE7 M\xF4n",
      check: (p) => {
        const hcs = p.getHCS(true);
        const divinity = p.getDivinity(true);
        return hcs.includes("\u4E01") && (divinity === "\u503C\u7B26" || divinity === "\u76F4\u7B26");
      },
      desc: "\u0110inh + Tr\u1EF1c Ph\xF9 - Ng\u1ECDc N\u1EEF Th\u1EE7 M\xF4n: Ng\u1ECDc n\u1EEF canh c\u1EEDa, c\xE1ch c\u1EE5c \u0111\u1EA1i c\xE1t cho vi\u1EC7c h\xF4n nh\xE2n, t\u1EBF t\u1EF1, c\u1EA7u ph\xFAc, m\u01B0u c\u1EA7u qu\xFD nh\xE2n h\u1ED7 tr\u1EE3.",
      type: "cat"
    },
    {
      id: "nhap_mo",
      name: "Tam K\u1EF3 Nh\u1EADp M\u1ED9",
      check: (p) => {
        const hcs = p.getHCS(true);
        const idx = p.index;
        if (hcs.includes("\u4E59") && idx === 1) return true;
        if (hcs.includes("\u4E19") && idx === 5) return true;
        if (hcs.includes("\u4E01") && idx === 7) return true;
        return false;
      },
      desc: "Tam K\u1EF3 Nh\u1EADp M\u1ED9: C\xE1c can \u1EA4t, B\xEDnh, \u0110inh r\u01A1i v\xE0o cung M\u1ED9 (M\xF9i, Tu\u1EA5t, S\u1EEDu). C\xE1ch c\u1EE5c n\xE0y khi\u1EBFn ng\u01B0\u1EDDi c\xF3 t\xE0i kh\xF4ng \u0111\u01B0\u1EE3c d\u1EE5ng, m\u01B0u s\u1EF1 b\u1EBF t\u1EAFc, n\u0103ng l\u01B0\u1EE3ng b\u1ECB tri\u1EC7t ti\xEAu.",
      type: "hung"
    }
  ];
  var STEM_NAMES = {
    "\u7532": "Gi\xE1p",
    "\u4E59": "\u1EA4t",
    "\u4E19": "B\xEDnh",
    "\u4E01": "\u0110inh",
    "\u620A": "M\u1EADu",
    "\u5DF1": "K\u1EF7",
    "\u5E9A": "Canh",
    "\u8F9B": "T\xE2n",
    "\u58EC": "Nh\xE2m",
    "\u7678": "Qu\xFD"
  };
  var STEM_INTERACTIONS = {
    "\u7532+\u7532": {
      "name": "SONG M\u1ED8C TH\xC0NH L\xC2M",
      "desc": "\u7532/\u7532 (Gi\xE1p/Gi\xE1p) - SONG M\u1ED8C TH\xC0NH L\xC2M: Nh\u1EEFng c\xE1 nh\xE2n ch\u1EE7 \u0111\u1ED9ng s\u1EBD v\u01B0\u1EE3t qua nhi\u1EC1u th\u1EED th\xE1ch kh\xE1c nhau. N\xF3 t\u1ED1t cho ch\u1EE7 v\xE0 kh\xE1ch \u0111\u1EC3 t\u1EA1o ra m\u1ED9t c\xE1ch ti\u1EBFp c\u1EADn thu\u1EADn l\u1EE3i. \u0110\xF4i tay s\u1EBD l\xE0m nh\u1EEFng g\xEC tr\xE1i tim m\xE1ch b\u1EA3o. Ti\u1EC1m n\u0103ng l\xE3nh \u0111\u1EA1o c\u1EE7a m\u1ED9t ng\u01B0\u1EDDi s\u1EBD \u1EDF m\u1EE9c cao nh\u1EA5t. Kh\u1EA3 n\u0103ng l\xE3nh \u0111\u1EA1o \u0111\u01B0\u1EE3c n\xE2ng cao s\u1EBD d\u1EABn \u0111\u1EBFn th\xE0nh c\xF4ng to l\u1EDBn v\xE0 s\u1EBD d\u1EABn \u0111\u1EBFn th\xE0nh c\xF4ng r\u1EF1c r\u1EE1.",
      "type": "cat"
    },
    "\u7532+\u4E59": {
      "name": "THANH LONG H\u1EE2P LINH",
      "desc": "\u7532/\u4E59 (Gi\xE1p/\u1EA4t) - THANH LONG H\u1EE2P LINH: \u0110\xE2y l\xE0 c\xE1ch c\u1EE5c \u0111\u1ED9c \u0111\xE1o v\xEC n\xF3 t\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 t\u1EC9 m\u1EC9 v\xE0 th\xE1o v\xE1t trong vi\u1EC7c s\u1EED d\u1EE5ng c\xE1c ngu\u1ED3n l\u1EF1c s\u1EB5n c\xF3 v\xE0 nh\u1EEFng ng\u01B0\u1EDDi m\xE0 m\xECnh tin t\u01B0\u1EDFng. N\xF3 cho th\u1EA5y r\u1EA5t nhi\u1EC1u n\u0103ng l\u01B0\u1EE3ng t\xEDch c\u1EF1c v\xE0 r\u1EA5t nhi\u1EC1u s\u1EE9c m\u1EA1nh. Ng\u01B0\u1EDDi ta s\u1EBD c\xF3 \u0111\u01B0\u1EE3c s\u1EE9c m\u1EA1nh d\u1ED3i d\xE0o trong th\u1EDDi gian n\xE0y v\xE0 s\u1EBD ti\u1EBFp t\u1EE5c duy tr\xEC n\xF3. M\u1EB7c d\xF9 v\u1EADy, hung M\xF4n c\xF3 kh\u1EA3 n\u0103ng l\xE0m cho m\u1ECDi chuy\u1EC7n tr\u1EDF n\xEAn xui x\u1EBBo g\u1EA5p b\u1ED9i.",
      "type": "binh"
    },
    "\u7532+\u4E19": {
      "name": "THANH LONG PH\u1EA2N TH\u1EE6",
      "desc": "\u7532/\u4E19 (Gi\xE1p/B\xEDnh) - THANH LONG PH\u1EA2N TH\u1EE6: \u0110\xE2y l\xE0 m\u1ED9t trong nh\u1EEFng c\xE1ch c\u1EE5c t\u1ED1t l\xE0nh nh\u1EA5t, tuy\u1EC7t v\u1EDDi cho c\xE1c k\u1EBF ho\u1EA1ch v\xE0 h\xE0nh \u0111\u1ED9ng. M\u1ECDi vi\u1EC7c \u0111\u1EC1u hanh th\xF4ng, qu\xFD nh\xE2n ph\xF9 tr\u1EE3, th\u0103ng quan ti\u1EBFn ch\u1EE9c, t\xE0i l\u1ED9c d\u1ED3i d\xE0o.",
      "type": "cat"
    },
    "\u7532+\u4E01": {
      "name": "M\u1ED8C H\u1ECEA TH\xD4NG MINH",
      "desc": "\u7532/\u4E01 (Gi\xE1p/\u0110inh) - M\u1ED8C H\u1ECEA TH\xD4NG MINH: C\xF3 th\u1EC3 \u0111\u01B0\u1EE3c hi\u1EC3u l\xE0 s\u1EBD g\u1EB7p v\xE0 nh\u1EADn \u0111\u01B0\u1EE3c s\u1EF1 gi\xFAp \u0111\u1EE1 t\u1EEB nh\u1EEFng qu\xFD nh\xE2n r\u1EA5t m\u1EA1nh. \u0110\xE2y l\xE0 th\u1EDDi \u0111i\u1EC3m th\xEDch h\u1EE3p nh\u1EA5t \u0111\u1EC3 y\xEAu c\u1EA7u s\u1EF1 gi\xFAp \u0111\u1EE1 m\xE0 m\u1ED9t ng\u01B0\u1EDDi lu\xF4n mong mu\u1ED1n. S\u1EF1 k\u1EBFt h\u1EE3p n\xE0y c\u0169ng b\xE1o tr\u01B0\u1EDBc nh\u1EEFng k\u1EBFt qu\u1EA3 t\u1ED1t \u0111\u1EB9p trong s\u1EF1 nghi\u1EC7p v\xE0 h\u1ECDc t\u1EADp c\u1EE7a m\u1ED9t ng\u01B0\u1EDDi. Th\xE0nh c\xF4ng trong h\u1ECDc t\u1EADp v\xE0 s\u1EF1 nghi\u1EC7p s\u1EBD \u0111\u01B0\u1EE3c theo sau b\u1EDFi s\u1EF1 n\u1ED5i ti\u1EBFng.",
      "type": "cat"
    },
    "\u7532+\u620A": {
      "name": "THANH LONG MINH DI\u1EC6U",
      "desc": "\u7532/\u620A (Gi\xE1p/M\u1EADu) - THANH LONG MINH DI\u1EC6U: Trong c\xE1ch c\u1EE5c n\xE0y, t\xE0i n\u0103ng v\xE0 ki\u1EBFn th\u1EE9c chuy\xEAn m\xF4n s\u1EBD \u0111\u01B0\u1EE3c t\u1EB7ng th\u01B0\u1EDFng. S\u1EF1 k\u1EBFt h\u1EE3p n\xE0y c\u0169ng l\xE0 d\u1EA5u hi\u1EC7u cho th\u1EA5y m\u1ED9t ng\u01B0\u1EDDi \u0111ang h\u01B0\u1EDBng t\u1EDBi vai tr\xF2 l\xE3nh \u0111\u1EA1o v\u0129 \u0111\u1EA1i. H\u1ECD s\u1EBD c\xF3 nhi\u1EC1u s\u1EE9c thu h\xFAt, t\u1EA7m \u1EA3nh h\u01B0\u1EDFng l\u1EDBn v\xE0 thu h\xFAt ng\u01B0\u1EDDi kh\xE1c t\xECm \u0111\u1EBFn xin l\u1EDDi khuy\xEAn.",
      "type": "binh"
    },
    "\u7532+\u5DF1": {
      "name": "QU\xDD NH\xC2N NH\u1EACP NG\u1EE4C",
      "desc": "\u7532/\u5DF1 (Gi\xE1p/K\u1EF7) - QU\xDD NH\xC2N NH\u1EACP NG\u1EE4C: Th\u1EC3 hi\u1EC7n r\u1EB1ng ta s\u1EBD thi\u1EBFu s\u1EF1 tr\u1EE3 gi\xFAp t\u1EEB c\xE1c c\u1EA5p. Kh\xF4ng ph\u1EA3i ng\xE0y n\xE0o ng\u01B0\u1EDDi ta c\u0169ng c\xF3 th\u1EC3 g\u1EB7p \u0111\u01B0\u1EE3c nhi\u1EC1u c\u01A1 h\u1ED9i m\u1EDBi th\xFA v\u1ECB nh\u01B0 v\u1EADy nh\u01B0ng \u0111\xE1ng ti\u1EBFc l\xE0 b\u1EA1n l\u1EA1i kh\xF4ng \u0111\u1EE7 may m\u1EAFn \u0111\u1EC3 n\u1EAFm b\u1EAFt \u0111\u01B0\u1EE3c nh\u1EEFng c\u01A1 h\u1ED9i \u0111\xF3. B\u1EA1n c\xF3 t\xE0i n\u0103ng nh\u01B0ng thi\u1EBFu c\u01A1 h\u1ED9i \u0111\u1EC3 thi tri\u1EC3n.",
      "type": "cat"
    },
    "\u7532+\u5E9A": {
      "name": "TR\u1EF0C PH\xD9 PHI CUNG",
      "desc": "\u7532/\u5E9A (Gi\xE1p/Canh) - TR\u1EF0C PH\xD9 PHI CUNG: B\u1ECB bao tr\xF9m b\u1EDFi nh\u1EEFng nghi ng\u1EDD v\xE0 do d\u1EF1. T\u1EA5t c\u1EA3 c\xE1c \u0111\u1ED1i th\u1EE7 c\u1EE7a b\u1EA1n d\u01B0\u1EDDng nh\u01B0 \u0111\u1EC1u d\u1ED3n \xE9p b\u1EA1n v\xE0 nh\u1EEFng k\u1EBB th\xE1ch th\u1EE9c xu\u1EA5t hi\u1EC7n \u1EDF kh\u1EAFp m\u1ECDi n\u01A1i c\u1ED1 g\u1EAFng c\u01B0\u1EDBp \u0111i nh\u1EEFng g\xEC thu\u1ED9c v\u1EC1 b\u1EA1n. \u0110\u1EEBng qu\xE1 c\u1EA3nh gi\xE1c. D\xF9 h\u1ECD l\xE0 nh\u1EEFng \u0111\u1ED1i th\u1EE7 \u0111\xE1ng g\u1EDDm nh\u01B0ng b\u1EA1n c\u0169ng kh\xF4ng n\xEAn m\u1EA5t b\xECnh t\u0129nh.",
      "type": "hung"
    },
    "\u7532+\u8F9B": {
      "name": "THANH LONG CHI\u1EBET T\xDAC",
      "desc": "\u7532/\u8F9B (Gi\xE1p/T\xE2n) - THANH LONG CHI\u1EBET T\xDAC: C\xF3 m\u1ED9t m\u1ED1i nguy hi\u1EC3m c\xF3 th\u1EC3 c\u1EA3m nh\u1EADn r\xF5 \u1EDF c\xE1ch c\u1EE5c n\xE0y. B\u1EA1n kh\xF4ng n\xEAn qu\xE1 t\u1EF1 tin v\u1EC1 v\u1EADn may c\u1EE7a m\xECnh. C\xF3 kh\u1EA3 n\u0103ng l\xE0 b\u1EA1n \u0111\xE1nh gi\xE1 qu\xE1 cao kh\u1EA3 n\u0103ng n\u1EAFm b\u1EAFt c\xE1c ngu\u1ED3n l\u1EF1c v\xE0 cu\u1ED1i c\xF9ng d\u1EABn \u0111\u1EBFn vi\u1EC7c l\u1EA1m d\u1EE5ng ho\u1EB7c chi ti\xEAu qu\xE1 m\u1EE9c. \u0110i\u1EC1u n\xE0y s\u1EBD khi\u1EBFn b\u1EA1n b\u1ECB mang ti\u1EBFng x\u1EA5u l\xE0 ng\u01B0\u1EDDi hay l\u1EE3i d\u1EE5ng.",
      "type": "hung"
    },
    "\u7532+\u58EC": {
      "name": "THANH LONG NH\u1EACP THI\xCAN LAO",
      "desc": "\u7532/\u58EC (Gi\xE1p/Nh\xE2m) - THANH LONG NH\u1EACP THI\xCAN LAO: C\xE1ch c\u1EE5c n\xE0y cho th\u1EA5y m\u1ED9t ng\u01B0\u1EDDi c\xE0ng ng\xE0y c\xE0ng b\u1ECB s\u1EF1 hi\u1EC3u l\u1EA7m v\xE0 b\u1ECB \u0111\xE1nh gi\xE1 sai. C\u1EA5u h\xECnh \u0111\u1EB7c bi\u1EC7t kh\xF4ng t\u1ED1t cho chuy\u1EC7n t\xECnh c\u1EA3m. \xDD \u0111\u1ECBnh t\u1ED1t c\u1EE7a m\u1ED9t ng\u01B0\u1EDDi s\u1EBD b\u1ECB hi\u1EC3u sai. Giao ti\u1EBFp v\xE0 c\xE1c m\u1ED1i quan h\u1EC7 s\u1EBD b\u1ECB \u1EA3nh h\u01B0\u1EDFng n\u1EB7ng n\u1EC1 trong khi nh\u1EEFng tr\u1EDF ng\u1EA1i v\xE0 c\u1EA3n tr\u01B0\u1EDBc l\u1EA1i xu\u1EA5t hi\u1EC7n t\u1EEB kh\u1EAFp m\u1ECDi n\u01A1i.",
      "type": "hung"
    },
    "\u7532+\u7678": {
      "name": "THANH LONG HOA C\xC1I",
      "desc": "\u7532/\u7678 (Gi\xE1p/Qu\xFD) - THANH LONG HOA C\xC1I: C\xE1ch c\u1EE5c n\xE0y l\xE0 r\u1EA5t t\u1ED1t khi mang l\u1EA1i th\xE0nh t\xEDch trong h\u1ECDc t\u1EADp. N\xF3 bi\u1EC3u th\u1ECB kh\u1EA3 n\u0103ng c\u1EE7a b\u1EA3n th\xE2n ng\xE0y c\xE0ng t\u0103ng \u0111\u1EC3 v\u01B0\u1EE3t qua \u0111\u1ED1i th\u1EE7 c\u1EA1nh tranh. K\u1EF9 n\u0103ng v\xE0 t\xE0i n\u0103ng l\xE3nh \u0111\u1EA1o c\u1EE7a m\u1ED9t ng\u01B0\u1EDDi s\u1EBD tr\u1EDF n\xEAn nh\u1EA1y b\xE9n lu\xF4n \u0111\u1EA3m b\u1EA3o r\u1EB1ng b\u1EA1n ho\xE0n th\xE0nh t\u1ED1t nhi\u1EC7m v\u1EE5 c\u1EE7a m\xECnh.",
      "type": "binh"
    },
    "\u4E59+\u7532": {
      "name": "L\u1EE2I \xC2M H\u1EA0I D\u01AF\u01A0NG",
      "desc": "\u4E59/\u7532 (\u1EA4t/Gi\xE1p) - L\u1EE2I \xC2M H\u1EA0I D\u01AF\u01A0NG: Bi\u1EC3u th\u1ECB m\u1ECDi vi\u1EC7c \u0111ang b\u1ECB con ng\u01B0\u1EDDi l\u1EA1m d\u1EE5ng. Ho\u1EB7c b\u1EA1n b\u1ECB \u0111\u1ED1i ph\u01B0\u01A1ng l\u1EE3i d\u1EE5ng th\u1EBF m\u1EA1nh c\u1EE7a b\u1EA1n v\xE0 d\u1EC5 b\u1ECB ph\u1EA3n b\u1ED9i. B\u1EA1n c\xF3 th\u1EC3 b\u1ECB m\u1EA5t vi\u1EC7c b\u1EDFi nh\u1EEFng ng\u01B0\u1EDDi kh\xE1c ghen t\u1ECB v\u1EDBi t\xE0i n\u0103ng th\u1EBF m\u1EA1nh c\u1EE7a b\u1EA1n. H\u1ECD c\xF3 th\u1EC3 d\xF9ng b\u1EA5t k\u1EF3 th\u1EE7 \u0111o\u1EA1n \u0111\u1EC3 lo\u1EA1i b\u1ECF b\u1EA1n.",
      "type": "binh"
    },
    "\u4E59+\u4E59": {
      "name": "NH\u1EACT K\xCC PH\u1EE4C NG\xC2M",
      "desc": "\u4E59/\u4E59 (\u1EA4t/\u1EA4t) - NH\u1EACT K\xCC PH\u1EE4C NG\xC2M: Ph\u1EE5c Ng\xE2m c\xF3 ngh\u0129a l\xE0 m\u1ECDi s\u1EF1 vi\u1EC7c mong mu\u1ED1n \u0111i\u1EC1u kh\xF4ng th\xE0nh hi\u1EC7n th\u1EF1c. Trong kinh doanh th\xEC m\u1ECDi k\u1EBF ho\u1EA1ch v\xE0 d\u1EF1 \xE1n \u0111ang b\u1ECB tr\xEC tr\u1EC7. T\u1ED1t nh\u1EA5t \u1EDF tr\u1EA1ng th\xE1i ch\u1EDD \u0111\u1EE3i, t\u1EF1 h\u1ECFi b\u1EA1n n\xEAn l\xE0m g\xEC ti\u1EBFp theo. L\u1EDDi k\xEAu c\u1EE9u c\u1EE7a b\u1EA1n c\xF3 v\u1EBB b\u1ECB ng\u01B0\u1EDDi kh\xE1c ph\u1EDBt l\u1EDD.",
      "type": "hung"
    },
    "\u4E59+\u4E19": {
      "name": "K\xCC NGHI THU\u1EACN TO\u1EA0I",
      "desc": "\u4E59/\u4E19 (\u1EA4t/B\xEDnh) - K\xCC NGHI THU\u1EACN TO\u1EA0I: T\u01B0\u1EE3ng tr\u01B0ng cho nh\u1EEFng ph\u1EA7n th\u01B0\u1EDFng cho nh\u1EEFng n\u1ED7 l\u1EF1c v\xE0 nh\u1EEFng d\u1ECBp k\u1EF7 ni\u1EC7m. \u0110\xE2y l\xE0 c\xE1ch c\u1EE5c r\u1EA5t c\xE1t l\xE0nh v\xE0 c\xF3 l\u1EE3i, bi\u1EC3u th\u1ECB s\u1EF1 th\xE0nh c\xF4ng m\xE0 ng\u01B0\u1EDDi ta \u0111\xE3 h\u01B0\u1EDBng \u0111\u1EBFn. M\u1ECDi \u0111i\u1EC1u \u0111\xE3 mong ch\u1EDD trong th\u1EDDi gian d\xE0i s\u1EBD th\xE0nh hi\u1EC7n th\u1EF1c. Nh\u1EEFng v\u1EA5n \u0111\u1EC1 v\xE0 th\xE1ch th\u1EE9c s\u1EBD \u0111\u01B0\u1EE3c gi\u1EA3i quy\u1EBFt.",
      "type": "cat"
    },
    "\u4E59+\u4E01": {
      "name": "K\xCC TR\u1EE2 NG\u1ECCC N\u1EEE",
      "desc": "\u4E59/\u4E01 (\u1EA4t/\u0110inh) - K\xCC TR\u1EE2 NG\u1ECCC N\u1EEE: \u0110\u1EB7c bi\u1EC7t thu\u1EADn l\u1EE3i cho c\xE1c k\u1EBF ho\u1EA1ch v\xE0 chi\u1EBFn l\u01B0\u1EE3c. M\u1ED9t ng\u01B0\u1EDDi s\u1EBD c\xF3 kh\u1EA3 n\u0103ng n\u1EA3y ra nh\u1EEFng \xFD t\u01B0\u1EDFng tuy\u1EC7t v\u1EDDi v\xE0 s\u1EBD r\u1EA5t s\xE1ng t\u1EA1o. Nh\u1EEFng ng\u01B0\u1EDDi c\u1ED1 g\u1EAFng ti\u1EBFn b\u1ED9 trong s\u1EF1 nghi\u1EC7p v\xE0 kinh doanh s\u1EBD \u0111\u1EA1t \u0111\u01B0\u1EE3c k\u1EBFt qu\u1EA3 t\xEDch c\u1EF1c. R\u1EA5t tuy\u1EC7t v\u1EDDi cho vi\u1EC7c k\xFD k\u1EBFt c\xE1c th\u1ECFa thu\u1EADn.",
      "type": "cat"
    },
    "\u4E59+\u620A": {
      "name": "K\xCC NH\u1EACP THI\xCAN M\xD4N",
      "desc": "\u4E59/\u620A (\u1EA4t/M\u1EADu) - K\xCC NH\u1EACP THI\xCAN M\xD4N: L\xE0 m\u1ED9t c\xE1ch c\u1EE5c xu\u1EA5t s\u1EAFc cho nh\u1EEFng ng\u01B0\u1EDDi mu\u1ED1n l\u1EADp k\u1EBF ho\u1EA1ch t\u1EC9 m\u1EC9 v\xE0 \xE2m th\u1EA7m. R\u1EA5t nhi\u1EC1u ng\u01B0\u1EDDi s\u1EB5n l\xF2ng cung c\u1EA5p s\u1EF1 gi\xFAp \u0111\u1EE1 t\xE0i ch\xEDnh m\u1ED9t c\xE1ch b\xED m\u1EADt. C\xE1ch c\u1EE5c n\xE0y c\u0169ng r\u1EA5t t\u1ED1t cho nh\u1EEFng ng\u01B0\u1EDDi t\xECm ki\u1EBFm s\u1EF1 gi\xE1c ng\u1ED9 v\xE0 c\xE1c th\xE0nh t\u1EF1u tinh th\u1EA7n kh\xE1c.",
      "type": "cat"
    },
    "\u4E59+\u5DF1": {
      "name": "NH\u1EACT K\xCC NH\u1EACP V\u1EE4",
      "desc": "\u4E59/\u5DF1 (\u1EA4t/K\u1EF7) - NH\u1EACT K\xCC NH\u1EACP V\u1EE4: Bi\u1EC3u th\u1ECB s\u1EF1 kh\xF4ng ch\u1EAFc ch\u1EAFn. Kh\xF4ng c\xF3 con \u0111\u01B0\u1EDDng r\xF5 r\xE0ng v\xE0 m\u1ED9t b\xF3ng t\u1ED1i s\xE2u k\xEDn \u0111ang \u0111e d\u1ECDa t\xE2m tr\xED c\u1EE7a m\u1ECDi ng\u01B0\u1EDDi. M\u1ECDi th\u1EE9 d\u01B0\u1EDDng nh\u01B0 \u0111\u1EC1u tr\xEC tr\u1EC7 v\xE0 ta c\xF3 th\u1EC3 thi\u1EBFu ni\u1EC1m tin v\xE0 t\u1EF1 tin v\xE0o k\u1EBF ho\u1EA1ch c\u1EE7a m\xECnh. S\u1EBD m\u1EA5t \u0111i s\u1EF1 h\u1ED7 tr\u1EE3 t\u1EEB ng\u01B0\u1EDDi kh\xE1c.",
      "type": "hung"
    },
    "\u4E59+\u5E9A": {
      "name": "NH\u1EACT K\xCC B\u1ECA H\xCCNH",
      "desc": "\u4E59/\u5E9A (\u1EA4t/Canh) - NH\u1EACT K\xCC B\u1ECA H\xCCNH: B\xE1o hi\u1EC7u nhi\u1EC1u ti\xEAu c\u1EF1c, \u0111\u1EB7c bi\u1EC7t l\xE0 trong c\xE1c m\u1ED1i quan h\u1EC7 m\xE0 b\u1EA1n tr\xE2n tr\u1ECDng. Nh\u1EEFng t\xECnh b\u1EA1n t\u1ED1t \u0111\u1EB9p c\xF3 th\u1EC3 bi\u1EBFn th\xE0nh th\xF9 h\u1EADn. B\u1EA1n c\u1EA7n s\u1EF1 ki\xEAn nh\u1EABn phi th\u01B0\u1EDDng \u0111\u1EC3 v\u01B0\u1EE3t qua giai \u0111o\u1EA1n n\xE0y. K\u1EBFt qu\u1EA3 s\u1EBD kh\xF4ng ngay l\u1EADp t\u1EE9c tr\u1EDF n\xEAn r\xF5 r\xE0ng.",
      "type": "hung"
    },
    "\u4E59+\u8F9B": {
      "name": "THANH LONG \u0110\xC0O T\u1EA8U",
      "desc": "\u4E59/\u8F9B (\u1EA4t/T\xE2n) - THANH LONG \u0110\xC0O T\u1EA8U: Kh\xF4ng ph\xF9 h\u1EE3p \u0111\u1EC3 ti\u1EBFn h\xE0nh thay \u0111\u1ED5i. Bi\u1EC3u th\u1ECB t\u1ED5n th\u1EA5t t\xE0i ch\xEDnh v\xE0 s\u1EF1 b\u1EA5t h\u1EA1nh. Kh\xF4ng ph\xF9 h\u1EE3p cho c\xE1c ho\u1EA1t \u0111\u1ED9ng quan tr\u1ECDng. Ngay c\u1EA3 nh\u1EEFng k\u1EBF ho\u1EA1ch \u0111\u01B0\u1EE3c c\xE2n nh\u1EAFc t\u1ED1t nh\u1EA5t c\u0169ng s\u1EBD tr\u1EDF n\xEAn r\u1EAFc r\u1ED1i trong c\xE1ch c\u1EE5c n\xE0y.",
      "type": "hung"
    },
    "\u4E59+\u58EC": {
      "name": "NH\u1EACT K\xCC NH\u1EACP \u0110\u1ECAA V\xD5NG",
      "desc": "\u4E59/\u58EC (\u1EA4t/Nh\xE2m) - NH\u1EACT K\xCC NH\u1EACP \u0110\u1ECAA V\xD5NG: T\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 ch\u1ED1ng \u0111\u1ED1i. Ng\u01B0\u1EDDi tr\u1EBB s\u1EBD \u0111i ch\u1ED1ng l\u1EA1i ng\u01B0\u1EDDi gi\xE0 v\xE0 nh\xE2n vi\xEAn s\u1EBD ch\u1ED1ng l\u1EA1i nh\xE0 tuy\u1EC3n d\u1EE5ng c\u1EE7a h\u1ECD. N\xF3 c\xF3 th\u1EC3 b\xE1o tr\u01B0\u1EDBc nh\u1EEFng \u0111i\u1EC1u kh\xF4ng t\xEDch c\u1EF1c v\xEC s\u1EF1 n\u1ED5i lo\u1EA1n v\xE0 thi\u1EBFu t\xF4n tr\u1ECDng quy t\u1EAFc.",
      "type": "hung"
    },
    "\u4E59+\u7678": {
      "name": "HOA C\xC1I PH\xD9NG TINH",
      "desc": "\u4E59/\u7678 (\u1EA4t/Qu\xFD) - HOA C\xC1I PH\xD9NG TINH: \u0110\u01B0a ra l\u1EDDi khuy\xEAn n\xEAn r\xFAt lui v\xE0o trong t\u0129nh l\u1EB7ng \u0111\u1EC3 nu\xF4i d\u01B0\u1EE1ng s\u1EF1 suy ng\u1EABm v\xE0 ph\xE1t tri\u1EC3n t\xE2m linh. N\xF3 khuy\u1EBFn kh\xEDch ph\xE1t tri\u1EC3n ni\u1EC1m tin c\xE1 nh\xE2n. Nh\u1EEFng sai l\u1EA7m b\u1EA1n m\u1EAFc ph\u1EA3i kh\xF4ng ph\u1EA3i l\xE0 th\u1EA5t b\u1EA1i m\xE0 ch\u1EC9 l\xE0 nh\u1EEFng b\xE0i h\u1ECDc.",
      "type": "hung"
    },
    "\u4E19+\u7532": {
      "name": "PHI \u0110I\u1EC2U \u0110I\u1EC6T HUY\u1EC6T",
      "desc": "\u4E19/\u7532 (B\xEDnh/Gi\xE1p) - PHI \u0110I\u1EC2U \u0110I\u1EC6T HUY\u1EC6T: T\u01B0\u01A1ng t\u1EF1 nh\u01B0 c\xE1ch c\u1EE5c Phi \u0111i\u1EC3u \u0111i\u1EC7t huy\u1EC7t (B\xEDnh/M\u1EADu), \u0111\xE2y l\xE0 d\u1EA5u hi\u1EC7u \u0111\u1EA1i c\xE1t, m\u01B0u s\u1EF1 c\u1EF1c k\u1EF3 thu\u1EADn l\u1EE3i, c\u1EA7u t\xE0i \u0111\u1EAFc l\u1EE3i, m\u1ECDi vi\u1EC7c t\u1EF1 nhi\xEAn th\xE0nh c\xF4ng ngo\xE0i mong \u0111\u1EE3i.",
      "type": "cat"
    },
    "\u4E19+\u4E59": {
      "name": "NH\u1EACT NGUY\u1EC6T T\u1ECANH MINH",
      "desc": "\u4E19/\u4E59 (B\xEDnh/\u1EA4t) - NH\u1EACT NGUY\u1EC6T T\u1ECANH MINH: L\xE0 m\u1ED9t d\u1EA5u hi\u1EC7u r\u1EA5t thu\u1EADn l\u1EE3i. N\xF3 b\xE1o hi\u1EC7u s\u1EF1 ti\u1EBFn b\u1ED9 trong s\u1EF1 nghi\u1EC7p. Ta s\u1EBD t\xECm th\u1EA5y s\u1EF1 th\u1ECFa m\xE3n v\xE0 h\xE0i l\xF2ng khi theo \u0111u\u1ED5i \u01B0\u1EDBc m\u01A1 v\xE0 t\u1EA7m nh\xECn c\u1EE7a m\xECnh. H\u1EA1nh ph\xFAc v\xE0 th\u1ECBnh v\u01B0\u1EE3ng \u0111\u1EBFn t\u1EF1 nhi\xEAn v\u1EDBi c\xE1 nh\xE2n \u0111\xF3.",
      "type": "cat"
    },
    "\u4E19+\u4E19": {
      "name": "NGUY\u1EC6T K\xCC B\u1ED8I S\u01AF",
      "desc": "\u4E19/\u4E19 (B\xEDnh/B\xEDnh) - NGUY\u1EC6T K\xCC B\u1ED8I S\u01AF: Mang \u0111\u1EBFn c\xE1c v\u1EE5 ki\u1EC7n li\xEAn quan \u0111\u1EBFn h\u1EE3p \u0111\u1ED3ng. B\u1EA1n c\u1EA7n gi\u1EEF c\xE1c t\xE0i li\u1EC7u ph\xE1p l\xFD quan tr\u1ECDng c\u1EA9n th\u1EADn. L\xFAc \u0111\u1EA7u m\u1ECDi th\u1EE9 di\u1EC5n ra r\u1EA5t su\xF4n s\u1EBB nh\u01B0ng th\u1EDDi k\u1EF3 t\u1ED1t \u0111\u1EB9p kh\xF4ng k\xE9o d\xE0i l\xE2u. C\u1EA7n \u0111\u1EC1 ph\xF2ng s\u1EF1 ph\u1EA3n b\u1ED9i.",
      "type": "binh"
    },
    "\u4E19+\u4E01": {
      "name": "NGUY\u1EC6T K\xCC CHU T\u01AF\u1EDAC",
      "desc": "\u4E19/\u4E01 (B\xEDnh/\u0110inh) - NGUY\u1EC6T K\xCC CHU T\u01AF\u1EDAC: B\u1EA1n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c s\u1EF1 h\u1ED7 tr\u1EE3 v\xE0 ch\u1EA5p thu\u1EADn t\u1EEB m\u1ED9t qu\xFD nh\xE2n. S\u1EF1 h\u1ED7 tr\u1EE3 n\xE0y s\u1EBD d\u1EABn \u0111\u1EBFn danh v\u1ECDng, t\xE0i l\u1ED9c, th\xE0nh c\xF4ng v\xE0 h\u1EA1nh ph\xFAc. Con \u0111\u01B0\u1EDDng th\u0103ng ti\u1EBFn c\u1EE7a b\u1EA1n s\u1EBD tr\u1EDF n\xEAn d\u1EC5 d\xE0ng v\xE0 c\xF3 nhi\u1EC1u \u0111\u1ED9t ph\xE1.",
      "type": "cat"
    },
    "\u4E19+\u620A": {
      "name": "PHI \u0110I\u1EC2U \u0110I\u1EC6T HUY\u1EC6T",
      "desc": "\u4E19/\u620A (B\xEDnh/M\u1EADu) - PHI \u0110I\u1EC2U \u0110I\u1EC6T HUY\u1EC6T: M\u1ED9t c\xE1ch c\u1EE5c v\xF4 c\xF9ng may m\u1EAFn, bi\u1EC3u th\u1ECB k\u1EBFt qu\u1EA3 thu\u1EADn l\u1EE3i trong t\u1EA5t c\u1EA3 c\xE1c ho\u1EA1t \u0111\u1ED9ng l\u1EDBn v\xE0 kinh doanh. Mang l\u1EA1i s\u1EF1 h\u1ED7 tr\u1EE3 t\u1EEB nh\u1EEFng ng\u01B0\u1EDDi c\xF3 \u0111\u1ECBa v\u1ECB cao, th\xE0nh c\xF4ng trong vi\u1EC7c ki\u1EBFm ti\u1EC1n t\xE0i v\xE0 l\u1EE3i nhu\u1EADn.",
      "type": "cat"
    },
    "\u4E19+\u5DF1": {
      "name": "HO\u1EA2 B\u1ED8I NH\u1EACP H\xCCNH",
      "desc": "\u4E19/\u5DF1 (B\xEDnh/K\u1EF7) - HO\u1EA2 B\u1ED8I NH\u1EACP H\xCCNH: B\xE1o tr\u01B0\u1EDBc tin x\u1EA5u, b\u1EA5t \u0111\u1ED3ng, b\u1EA5t h\xF2a v\xE0 nh\u1EEFng cu\u1ED9c tranh c\xE3i kh\xF4ng h\u1ED3i k\u1EBFt. B\u1EA1n s\u1EBD ph\u1EA3i \u0111\u1ED1i m\u1EB7t v\u1EDBi c\xE1c v\u1EE5 ki\u1EC7n t\u1EE5ng. S\u1EF1 chia r\u1EBD gia \u0111\xECnh v\xE0 s\u1EF1 xa c\xE1ch n\u1EA3y sinh t\u1EEB m\u1ECDi ph\xEDa.",
      "type": "hung"
    },
    "\u4E19+\u5E9A": {
      "name": "HU\u1EF2NH NH\u1EACP TH\xC1I B\u1EA0CH",
      "desc": "\u4E19/\u5E9A (B\xEDnh/Canh) - HU\u1EF2NH NH\u1EACP TH\xC1I B\u1EA0CH: R\u1EA5t nhi\u1EC1u tr\u1EDF ng\u1EA1i v\xE0 v\u1EA5n \u0111\u1EC1 nghi\xEAm tr\u1ECDng ph\xE1t sinh. N\xF3 th\xEDch h\u1EE3p cho vi\u1EC7c r\xFAt lui h\u01A1n l\xE0 t\u1EA5n c\xF4ng. \u0110\xE2y l\xE0 c\xE1ch c\u1EE5c ti\xEAu c\u1EF1c, b\xE1o tr\u01B0\u1EDBc m\u1ED1i quan h\u1EC7 gia \u0111\xECnh tan v\u1EE1, m\u1EA5t m\xE1t c\u1EE7a c\u1EA3i c\xE1 nh\xE2n.",
      "type": "hung"
    },
    "\u4E19+\u8F9B": {
      "name": "NH\u1EACT NGUY\u1EC6T T\u01AF\u01A0NG H\u1ED8I",
      "desc": "\u4E19/\u8F9B (B\xEDnh/T\xE2n) - NH\u1EACT NGUY\u1EC6T T\u01AF\u01A0NG H\u1ED8I: Bi\u1EC3u th\u1ECB nh\u1EEFng k\u1EBFt qu\u1EA3 thu\u1EADn l\u1EE3i xu\u1EA5t ph\xE1t t\u1EEB vi\u1EC7c c\xF3 m\u1ED9t k\u1EBF ho\u1EA1ch v\u1EEFng ch\u1EAFc. Danh ti\u1EBFng c\u1EE7a b\u1EA1n \u0111\u01B0\u1EE3c \u0111\xE1nh gi\xE1 cao sau khi th\u1EF1c hi\u1EC7n th\xE0nh c\xF4ng c\xE1c d\u1EF1 \xE1n. Nh\u1EEFng g\xEC b\u1EA1n t\xECm ki\u1EBFm s\u1EBD d\u1EC5 d\xE0ng \u0111\u1EA1t \u0111\u01B0\u1EE3c.",
      "type": "cat"
    },
    "\u4E19+\u58EC": {
      "name": "H\u1ECEA NH\u1EACP THI\xCAN LA",
      "desc": "\u4E19/\u58EC (B\xEDnh/Nh\xE2m) - H\u1ECEA NH\u1EACP THI\xCAN LA: Hai y\u1EBFu t\u1ED1 Th\u1EE7y v\xE0 H\u1ECFa \u0111\u1ED1i ch\u1ECDi nhau. D\u1EABn \u0111\u1EBFn nh\u1EEFng cu\u1ED9c c\xE3i v\xE3 v\xE0 tranh ch\u1EA5p r\u1EAFc r\u1ED1i. Nh\u1EEFng hi\u1EC3u l\u1EA7m l\xE0 kh\xF4ng th\u1EC3 tr\xE1nh kh\u1ECFi v\xE0 h\u1EA7u h\u1EBFt ch\xFAng c\xF3 th\u1EC3 leo thang n\u1EBFu kh\xF4ng \u0111\u01B0\u1EE3c ki\u1EC3m so\xE1t.",
      "type": "hung"
    },
    "\u4E19+\u7678": {
      "name": "NGUY\u1EC6T K\xCC \u0110\u1ECAA V\xD5NG",
      "desc": "\u4E19/\u7678 (B\xEDnh/Qu\xFD) - NGUY\u1EC6T K\xCC \u0110\u1ECAA V\xD5NG: S\u1EF1 hi\u1EC3u l\u1EA7m s\u1EBD \u0111\u1EA9y \u0111\u1EBFn m\u1EE9c cao nh\u1EA5t. M\u1ED9t ng\u01B0\u1EDDi s\u1EBD b\u1ECB bu\u1ED9c t\u1ED9i oan u\u1ED5ng v\xE0 c\u1EA1m b\u1EABy \u0111\u01B0\u1EE3c \u0111\u1EB7t ra \u0111\u1EC3 l\xE0m h\u1EA1i ai \u0111\xF3. C\u1EA7n ph\u1EA3i c\u1EA9n th\u1EADn \u0111\u1EC3 kh\xF4ng r\u01A1i v\xE0o b\u1EABy c\u1EE7a \u0111\u1ED1i th\u1EE7. C\xE1c xung \u0111\u1ED9t c\xF3 th\u1EC3 l\xE0m m\u1EA5t n\u0103ng l\u01B0\u1EE3ng.",
      "type": "hung"
    },
    "\u4E01+\u7532": {
      "name": "THANH LONG TH\u1ED4 CH\xC2U",
      "desc": "\u4E01/\u7532 (\u0110inh/Gi\xE1p) - THANH LONG TH\u1ED4 CH\xC2U: R\u1ED3ng Xanh nh\u1EA3 vi\xEAn ng\u1ECDc qu\xFD. \u0110\xE2y l\xE0 m\u1ED9t c\xE1ch c\u1EE5c c\xF3 l\u1EE3i, d\u1EF1 b\xE1o m\u1ED9t t\u01B0\u01A1ng lai nhi\u1EC1u hy v\u1ECDng v\xE0 nh\u1EEFng \u0111i\u1EC1u t\u1ED1t l\xE0nh s\u1EAFp \u0111\u1EBFn. Th\xE0nh c\xF4ng v\xE0 quy\u1EC1n l\u1EF1c ch\u1EC9 c\xE1ch m\u1ED9t b\u01B0\u1EDBc ch\xE2n.",
      "type": "cat"
    },
    "\u4E01+\u4E59": {
      "name": "THI\xCAN V\u1EACN X\u01AF\u01A0NG KH\xCD C\xC1CH",
      "desc": "\u4E01/\u4E59 (\u0110inh/\u1EA4t) - THI\xCAN V\u1EACN X\u01AF\u01A0NG KH\xCD C\xC1CH: Cho th\u1EA5y s\u1EF1 gi\xFAp \u0111\u1EE1 v\xE0 h\u1ED7 tr\u1EE3 s\u1EBD lu\xF4n s\u1EB5n s\xE0ng. Nh\u1EEFng ng\u01B0\u1EDDi kh\xE1c s\u1EBD mang \u0111\u1EBFn nhi\u1EC1u s\u1EF1 quan t\xE2m v\xE0 gi\xFAp \u0111\u1EE1. \u0110i\u1EC1u n\xE0y d\u1EABn \u0111\u1EBFn h\u1EA1nh ph\xFAc th\u1EF1c s\u1EF1. R\u1EA5t c\xF3 \u1EA3nh h\u01B0\u1EDFng t\xEDch c\u1EF1c trong c\xE1c m\u1ED1i quan h\u1EC7.",
      "type": "cat"
    },
    "\u4E01+\u4E19": {
      "name": "TINH T\xD9Y NGUY\u1EC6T CHUY\u1EC2N",
      "desc": "\u4E01/\u4E19 (\u0110inh/B\xEDnh) - TINH T\xD9Y NGUY\u1EC6T CHUY\u1EC2N: N\xF3i l\xEAn s\u1EF1 l\u1EA1c quan. D\xF9 s\xF3ng gi\xF3 th\u1EBF n\xE0o b\u1EA1n c\u0169ng t\xECm th\u1EA5y c\xE1ch v\u01B0\u1EE3t qua. B\u1EA1n s\u1EBD th\xE0nh c\xF4ng trong b\u1EA5t k\u1EF3 s\u1EF1 nghi\u1EC7p n\xE0o b\u1EA1n theo \u0111u\u1ED5i. Ho\xE0n h\u1EA3o cho s\u1EF1 th\u0103ng ch\u1EE9c v\xE0 \u0111\u1EA1t \u0111\u01B0\u1EE3c th\xE0nh t\u1EF1u.",
      "type": "cat"
    },
    "\u4E01+\u4E01": {
      "name": "K\xCC NH\u1EACP TH\xC1I \xC2M",
      "desc": "\u4E01/\u4E01 (\u0110inh/\u0110inh) - K\xCC NH\u1EACP TH\xC1I \xC2M: Th\xE0nh c\xF4ng c\xF3 v\u1EBB \u0111ang m\u1EDF r\u1ED9ng nh\u01B0ng m\u1ECDi th\u1EE9 c\xF3 th\u1EC3 kh\xE1c v\u1EDBi nh\u1EEFng g\xEC b\u1EA1n th\u1EA5y. C\u1EA7n th\u1EADn tr\u1ECDng v\u1EDBi nh\u1EEFng g\xEC hi\u1EC7n t\u1EA1i c\xF3 v\u1EBB t\u1ED1t. Nh\u1EEFng k\u1EBF ho\u1EA1ch b\u1EA1n c\xF3 s\u1EBD mang l\u1EA1i k\u1EBFt qu\u1EA3 n\u1EBFu n\u1ED7 l\u1EF1c.",
      "type": "cat"
    },
    "\u4E01+\u620A": {
      "name": "THANH LONG CHUY\u1EC2N QUANG",
      "desc": "\u4E01/\u620A (\u0110inh/M\u1EADu) - THANH LONG CHUY\u1EC2N QUANG: C\xE1ch c\u1EE5c r\u1EA5t c\xE1t l\xE0nh, ph\xE1t t\xEDn hi\u1EC7u v\u1EC1 s\u1EF1 gi\xFAp \u0111\u1EE1 l\u1EDBn t\u1EEB Qu\xFD nh\xE2n. S\u1EF1 gi\xFAp \u0111\u1EE1 n\xE0y l\xE0m cho vi\u1EC7c \u0111i\u1EC1u h\xE0nh c\xF4ng vi\u1EC7c m\u01B0\u1EE3t m\xE0 v\xE0 d\u1EC5 d\xE0ng. B\u1EA1n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c ph\u1EA7n th\u01B0\u1EDFng x\u1EE9ng \u0111\xE1ng.",
      "type": "cat"
    },
    "\u4E01+\u5DF1": {
      "name": "H\u1ECEA NH\u1EACP C\xC2U TR\u1EA6N",
      "desc": "\u4E01/\u5DF1 (\u0110inh/K\u1EF7) - H\u1ECEA NH\u1EACP C\xC2U TR\u1EA6N: L\xE0 c\xE1ch c\u1EE5c kh\xE1 hung. Ho\xE0n c\u1EA3nh xung quanh b\u1EA1n kh\xF4ng \u1ED5n \u0111\u1ECBnh v\xE0 \u0111\u1EA7y bi\u1EBFn \u0111\u1ED9ng. S\u1EF1 l\u1EEBa d\u1ED1i v\xE0 v\u1EADn \u0111en trong c\xE1c m\u1ED1i quan h\u1EC7 t\xECnh c\u1EA3m. C\u1EA7n c\u1EA9n tr\u1ECDng v\u1EDBi s\u1EF1 ph\u1EA3n b\u1ED9i t\u1EEB ti\u1EC3u nh\xE2n.",
      "type": "hung"
    },
    "\u4E01+\u5E9A": {
      "name": "TINH K\xCC TH\u1EE4 TR\u1EDE",
      "desc": "\u4E01/\u5E9A (\u0110inh/Canh) - TINH K\xCC TH\u1EE4 TR\u1EDE: Canh l\xE0 th\u1EA7n ph\xE1 ho\u1EA1i \u0111ang c\u1EA3n tr\u1EDF con \u0111\u01B0\u1EDDng. Vi\u1EC7c giao ti\u1EBFp v\xE0 \u0111i l\u1EA1i s\u1EBD b\u1ECB c\u1EA3n tr\u1EDF. H\xE0nh tr\xECnh c\u1EE7a b\u1EA1n s\u1EBD b\u1ECB ch\u1EB7n v\xE0 t\xE0i li\u1EC7u b\u1EA1n g\u1EEDi s\u1EBD g\u1EB7p s\u1EF1 ch\u1EADm tr\u1EC5 ho\u1EB7c kh\xF4ng th\u1ED1ng nh\u1EA5t.",
      "type": "hung"
    },
    "\u4E01+\u8F9B": {
      "name": "CHU T\u01AF\u1EDAC NH\u1EACP NG\u1EE4C",
      "desc": "\u4E01/\u8F9B (\u0110inh/T\xE2n) - CHU T\u01AF\u1EDAC NH\u1EACP NG\u1EE4C: Ti\u1EBFn tr\xECnh b\u1ECB \u0111\xECnh tr\u1EC7 v\xE0 kh\xF4ng c\xF3 g\xEC di\u1EC5n ra theo mong \u0111\u1EE3i. M\u1ECDi th\u1EE9 c\xF3 th\u1EC3 tr\xF4ng h\u1EE9a h\u1EB9n nh\u01B0ng l\u1EA1i tr\u1EDF n\xEAn x\u1EA5u v\xE0 \u0111\u1ED5 v\u1EE1 sau m\u1ED9t th\u1EDDi gian. B\xE1o hi\u1EC7u s\u1EF1 b\u1EA5t h\u1EA1nh v\xE0 d\u1EABn \u0111\u1EBFn k\u1EBFt c\u1EE5c x\u1EA5u.",
      "type": "hung"
    },
    "\u4E01+\u58EC": {
      "name": "NG\u0168 TH\u1EA6N H\u1ED6 H\u1EE2P",
      "desc": "\u4E01/\u58EC (\u0110inh/Nh\xE2m) - NG\u0168 TH\u1EA6N H\u1ED6 H\u1EE2P: M\u1ECDi k\u1EBF ho\u1EA1ch \u0111\u1EC1 ra s\u1EBD \u0111\u01B0\u1EE3c th\u1EF1c hi\u1EC7n th\xE0nh c\xF4ng. Kh\u1ED1i l\u01B0\u1EE3ng c\xF4ng vi\u1EC7c s\u1EBD tr\u1EDF n\xEAn r\xF5 r\xE0ng v\xE0 c\xF3 th\xE0nh c\xF4ng tuy\u1EC7t v\u1EDDi ch\u1EDD ph\xEDa tr\u01B0\u1EDBc. S\u1EF1 nghi\u1EC7p \u0111\u01B0\u1EE3c c\u1EE7ng c\u1ED1 v\xE0 danh ti\u1EBFng t\u0103ng ti\u1EBFn.",
      "type": "cat"
    },
    "\u4E01+\u7678": {
      "name": "CHU T\u01AF\u1EDAC \u0110\u1EA6U GIANG",
      "desc": "\u4E01/\u7678 (\u0110inh/Qu\xFD) - CHU T\u01AF\u1EDAC \u0110\u1EA6U GIANG: Bi\u1EC3u th\u1ECB nh\u1EEFng tranh lu\u1EADn v\xE0 b\u1EA5t \u0111\u1ED3ng. R\u1EA5t nhi\u1EC1u t\xEDnh kh\xED x\u1EA5u. Bi\u1EC3u th\u1ECB c\xE1c tranh ch\u1EA5p v\xE0 ki\u1EC7n t\u1EE5ng. M\u1ECDi th\u1EE9 s\u1EBD kh\xF4ng t\u1ED1t \u0111\u1EB9p n\u1EBFu kh\xF4ng c\xF3 s\u1EF1 can thi\u1EC7p c\u1EE7a c\xE1c c\xE1t tinh.",
      "type": "hung"
    },
    "\u620A+\u7532": {
      "name": "C\u1EF0 TH\u1EA0CH \xC1P M\u1ED8C",
      "desc": "\u620A/\u7532 (M\u1EADu/Gi\xE1p) - C\u1EF0 TH\u1EA0CH \xC1P M\u1ED8C: C\xF3 \u0111i\u1EC1u g\xEC \u0111\xF3 \u0111ang c\u1EA3n tr\u1EDF s\u1EF1 ti\u1EBFn tri\u1EC3n. B\u1EA1n n\xEAn gi\u1EEF b\xECnh t\u0129nh v\xE0 kh\xF4ng l\u1EADp k\u1EBF ho\u1EA1ch quan tr\u1ECDng n\xE0o. Vi\u1EC7c m\u1EDF \u0111\u01B0\u1EDDng ti\u1EBFn ph\xEDa tr\u01B0\u1EDBc l\xE0 c\xF4ng vi\u1EC7c v\u1EA5t v\u1EA3 v\xE0 g\u1EA7n nh\u01B0 kh\xF4ng th\u1EC3.",
      "type": "hung"
    },
    "\u620A+\u4E59": {
      "name": "THANH LONG H\u1EE2P LINH",
      "desc": "\u620A/\u4E59 (M\u1EADu/\u1EA4t) - THANH LONG H\u1EE2P LINH: T\u01B0\u1EE3ng tr\u01B0ng cho s\u1EF1 t\u1EC9 m\u1EC9 v\xE0 th\xE1o v\xE1t. Ng\u01B0\u1EDDi ta s\u1EBD c\xF3 s\u1EE9c m\u1EA1nh d\u1ED3i d\xE0o v\xE0 duy tr\xEC \u0111\u01B0\u1EE3c n\xF3. Tuy nhi\xEAn, n\u1EBFu g\u1EB7p hung m\xF4n th\xEC m\u1ECDi chuy\u1EC7n c\xF3 th\u1EC3 tr\u1EDF n\xEAn t\u1ED3i t\u1EC7 b\u1EA5t ng\u1EDD.",
      "type": "hung"
    },
    "\u620A+\u4E19": {
      "name": "THANH LONG PH\u1EA2N TH\u1EE6",
      "desc": "\u620A/\u4E19 (M\u1EADu/B\xEDnh) - THANH LONG PH\u1EA2N TH\u1EE6: M\u1ED9t trong nh\u1EEFng c\xE1ch c\u1EE5c t\u1ED1t l\xE0nh nh\u1EA5t, bi\u1EC3u th\u1ECB k\u1EBFt qu\u1EA3 thu\u1EADn l\u1EE3i cho h\xE0nh \u0111\u1ED9ng. Nh\u1EADn \u0111\u01B0\u1EE3c s\u1EF1 gi\xFAp \u0111\u1EE1 t\u1EEB ng\u01B0\u1EDDi c\xF3 t\u1EA7m c\u1EE1, mang l\u1EA1i k\u1EBFt qu\u1EA3 t\xEDch c\u1EF1c cho h\xF4n nh\xE2n v\xE0 t\xE0i l\u1ED9c.",
      "type": "cat"
    },
    "\u620A+\u4E01": {
      "name": "THANH LONG DI\u1EC6U MINH",
      "desc": "\u620A/\u4E01 (M\u1EADu/\u0110inh) - THANH LONG DI\u1EC6U MINH: Ch\u1EC9 ra b\u1EA1n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c s\u1EF1 \u1EE7ng h\u1ED9 t\u1EEB c\u1EA5p tr\xEAn. B\u1EA1n s\u1EBD thi\u1EBFt l\u1EADp \u0111\u01B0\u1EE3c m\u1EA1ng l\u01B0\u1EDBi quan h\u1EC7 m\u1EA1nh m\u1EBD v\u1EDBi nh\u1EEFng ng\u01B0\u1EDDi c\xF3 \u0111\u1ECBa v\u1ECB cao. \u0110\xE2y l\xE0 l\xFAc th\xEDch h\u1EE3p \u0111\u1EC3 \u0111\u1EA1t danh ti\u1EBFng v\xE0 uy t\xEDn.",
      "type": "cat"
    },
    "\u620A+\u620A": {
      "name": "PH\u1EE4C NG\xC2M",
      "desc": "\u620A/\u620A (M\u1EADu/M\u1EADu) - PH\u1EE4C NG\xC2M: M\u1ECDi th\u1EE9 \u0111ang t\u1EDBi ng\u01B0\u1EE1ng d\u1EEBng l\u1EA1i. Ti\u1EBFn tri\u1EC3n s\u1EBD r\u1EA5t ch\u1EADm v\xE0 h\u1EA7u nh\u01B0 kh\xF4ng \u0111\xE1ng ch\xFA \xFD. B\u1EA1n n\xEAn s\u1EED d\u1EE5ng th\u1EDDi gian n\xE0y \u0111\u1EC3 ph\u1EE5c h\u1ED3i tinh th\u1EA7n thay v\xEC c\u1ED1 g\u1EAFng th\xFAc \u0111\u1EA9y m\u1ECDi th\u1EE9 ti\u1EBFn l\xEAn.",
      "type": "hung"
    },
    "\u620A+\u5DF1": {
      "name": "QU\xDD NH\xC2N NH\u1EACP NG\u1EE4C",
      "desc": "\u620A/\u5DF1 (M\u1EADu/K\u1EF7) - QU\xDD NH\xC2N NH\u1EACP NG\u1EE4C: M\u1ECDi th\u1EE9 s\u1EBD tr\u1EDF n\xEAn l\u1ED9n x\u1ED9n. Ng\u01B0\u1EDDi t\u1EEBng gi\xFAp \u0111\u1EE1 b\u1EA1n s\u1EBD kh\xF4ng c\xF2n s\u1EB5n s\xE0ng n\u1EEFa. B\u1EA1n s\u1EBD b\u1ECB b\u1ECF l\u1EA1i m\xE0 kh\xF4ng c\xF3 s\u1EF1 h\u1ED7 tr\u1EE3. T\xECnh h\xECnh n\xE0y r\u1EA5t nguy hi\u1EC3m cho c\xE1c k\u1EBF ho\u1EA1ch hi\u1EC7n t\u1EA1i.",
      "type": "hung"
    },
    "\u620A+\u5E9A": {
      "name": "TR\u1EF0C PH\xD9 PHI CUNG",
      "desc": "\u620A/\u5E9A (M\u1EADu/Canh) - TR\u1EF0C PH\xD9 PHI CUNG: Ch\u1EC9 ra r\u1EB1ng nh\u1EEFng k\u1EBF ho\u1EA1ch s\u1EBD tr\u1EE5c tr\u1EB7c v\xE0 t\xECnh hu\u1ED1ng tr\u1EDF n\xEAn t\u1ED3i t\u1EC7 h\u01A1n. C\xE1c t\xECnh hu\u1ED1ng x\u1EA3y ra \u0111\u1ED9t ng\u1ED9t v\xE0 kh\xF4ng th\u1EC3 l\u01B0\u1EDDng tr\u01B0\u1EDBc. \u0110\u1ED1i th\u1EE7 s\u1EBD s\u1EED d\u1EE5ng m\xE1nh kh\xF3e \u0111\u1EC3 g\xE2y kh\xF3 d\u1EC5 cho b\u1EA1n.",
      "type": "hung"
    },
    "\u620A+\u8F9B": {
      "name": "THANH LONG CHI\u1EBET T\xDAC",
      "desc": "\u620A/\u8F9B (M\u1EADu/T\xE2n) - THANH LONG CHI\u1EBET T\xDAC: B\xE1o tr\u01B0\u1EDBc s\u1EF1 s\u1EE5p \u0111\u1ED5 c\u1EE7a c\xE1c c\xE1ch c\u1EE5c kh\xE1c d\xF9 \u0111\xE3 \u0111\u01B0\u1EE3c thi\u1EBFt l\u1EADp. H\u01B0\u1EDBng t\u1EDBi s\u1EF1 tan r\xE3 c\u1EE7a m\u1ED9t nh\xF3m v\xE0 thi\u1EBFu giao ti\u1EBFp. L\u1EDDi h\u1EE9a v\xE0 h\u1EE3p \u0111\u1ED3ng d\u1EC5 b\u1ECB ph\xE1 v\u1EE1.",
      "type": "hung"
    },
    "\u620A+\u58EC": {
      "name": "LONG NH\u1EACP THI\xCAN LAO",
      "desc": "\u620A/\u58EC (M\u1EADu/Nh\xE2m) - LONG NH\u1EACP THI\xCAN LAO: T\xE0i nguy\xEAn c\u1EE7a b\u1EA1n c\xF3 th\u1EC3 b\u1ECB \u0111\u1ED1i th\u1EE7 \u0111\xE1nh c\u1EAFp. C\xF3 nh\u1EEFng c\u1EA1m b\u1EABy v\xE0 h\xECnh th\u1EE9c l\u1EEBa l\u1ECDc \u0111ang di\u1EC5n ra. S\u1EBD c\xF3 s\u1EF1 \u0111\u1EA5u tranh trong ni\u1EC1m tin v\xE0 c\xF3 th\u1EC3 b\u1EA1n s\u1EBD m\u1EA5t hy v\u1ECDng.",
      "type": "hung"
    },
    "\u620A+\u7678": {
      "name": "THANH LONG HOA C\xC1I",
      "desc": "\u620A/\u7678 (M\u1EADu/Qu\xFD) - THANH LONG HOA C\xC1I: L\xE0 c\xE1ch c\u1EE5c trung l\u1EADp, th\xEDch g\u1EB7p C\xE1t M\xF4n. N\xF3 t\u0103ng c\u01B0\u1EDDng s\u1EF1 t\xEDch c\u1EF1c trong h\u1ECDc t\u1EADp v\xE0 ngh\u1EC7 thu\u1EADt. Tuy nhi\xEAn n\u1EBFu kh\xF4ng \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng \u0111\xFAng c\xE1ch d\u1EC5 d\u1EABn \u0111\u1EBFn s\u1EF1 u\u1EC3 o\u1EA3i, thi\u1EBFu \u0111\u1ED9ng l\u1EF1c.",
      "type": "binh"
    },
    "\u5DF1+\u7532": {
      "name": "KHUY\u1EC2N NG\u1ED8 THANH LONG",
      "desc": "\u5DF1/\u7532 (K\u1EF7/Gi\xE1p) - KHUY\u1EC2N NG\u1ED8 THANH LONG: Nh\xECn chung kh\xF4ng may m\u1EAFn. Ch\u1EC9 ra m\u1ECDi vi\u1EC7c kh\xF4ng ti\u1EBFn tri\u1EC3n su\xF4n s\u1EBB nh\u01B0 mong mu\u1ED1n. B\u1EA1n g\u1EB7p nhi\u1EC1u ch\u01B0\u1EDBng ng\u1EA1i v\xE0 b\u1EF1c b\u1ED9i v\xEC thi\u1EBFu ti\u1EBFn tri\u1EC3n ho\u1EB7c b\u01B0\u1EDBc \u0111i kh\xF4ng hi\u1EC7u qu\u1EA3.",
      "type": "hung"
    },
    "\u5DF1+\u4E59": {
      "name": "M\u1ED8 TH\u1EA6N B\u1EA4T MINH",
      "desc": "\u5DF1/\u4E59 (K\u1EF7/\u1EA4t) - M\u1ED8 TH\u1EA6N B\u1EA4T MINH: Bi\u1EC3u th\u1ECB t\u1ED1t nh\u1EA5t l\xE0 kh\xF4ng n\xEAn v\u1ECDng \u0111\u1ED9ng. N\u1EBFu kh\xF4ng b\u1EA1n s\u1EBD tr\u1EA3i qua c\u1EA3m gi\xE1c tuy\u1EC7t v\u1ECDng, s\u1EE3 h\xE3i v\xE0 nghi ng\u1EDD. Vi\u1EC7c t\u1EADp trung \u0111\u1EA1t \u0111\u01B0\u1EE3c m\u1EE5c ti\xEAu danh l\u1EE3i s\u1EBD r\u1EA5t kh\xF3 kh\u0103n.",
      "type": "hung"
    },
    "\u5DF1+\u4E19": {
      "name": "H\u1ECEA B\u1ED8I \u0110\u1ECAA H\u1ED8",
      "desc": "\u5DF1/\u4E19 (K\u1EF7/B\xEDnh) - H\u1ECEA B\u1ED8I \u0110\u1ECAA H\u1ED8: Cho th\u1EA5y vi\u1EC7c \u0111\u1ED1i ph\xF3 b\u1EB1ng c\xE1ch 'l\u1EA5y \u0111\u1ED9c tr\u1ECB \u0111\u1ED9c' c\xF3 th\u1EC3 mang l\u1EA1i l\u1EE3i \xEDch. M\u1ECDi th\u1EE9 s\u1EBD t\u1ED1t h\u01A1n n\u1EBFu b\u1EA1n quy\u1EBFt \u0111\u1ECBnh h\xE0nh \u0111\u1ED9ng thay v\xEC ng\u1ED3i y\xEAn. C\u1EA7n chi\u1EBFn \u0111\u1EA5u tr\xEAn nhi\u1EC1u m\u1EB7t tr\u1EADn.",
      "type": "binh"
    },
    "\u5DF1+\u4E01": {
      "name": "CHU T\u01AF\u1EDAC NH\u1EACP M\u1ED8",
      "desc": "\u5DF1/\u4E01 (K\u1EF7/\u0110inh) - CHU T\u01AF\u1EDAC NH\u1EACP M\u1ED8: Cho th\u1EA5y kh\u1EA3 n\u0103ng ki\u1EC7n t\u1EE5ng, tranh c\xE3i v\xE0 khi\u1EBFu n\u1EA1i. S\u1EF1 th\u1EADt c\xF3 th\u1EC3 b\u1ECB b\xF3p m\xE9o ho\u1EB7c th\xF4ng tin b\u1ECB sai l\u1EC7ch. B\u1EA1n d\u1EC5 c\xF3 xu h\u01B0\u1EDBng n\xF3i m\xE0 kh\xF4ng suy ngh\u0129, g\xE2y r\u1EAFc r\u1ED1i trong gia \u0111\xECnh.",
      "type": "hung"
    },
    "\u5DF1+\u620A": {
      "name": "KHUY\u1EC2N NG\u1ED8 THANH LONG",
      "desc": "\u5DF1/\u620A (K\u1EF7/M\u1EADu) - KHUY\u1EC2N NG\u1ED8 THANH LONG: Ch\u1EC9 ra r\u1EB1ng kh\xF4ng c\xF3 g\xEC c\xF3 th\u1EC3 ng\u0103n c\u1EA3n gi\u1EA5c m\u01A1 c\u1EE7a b\u1EA1n th\xE0nh hi\u1EC7n th\u1EF1c. Tham v\u1ECDng c\xF3 th\u1EC3 \u0111\u01B0\u1EE3c hi\u1EC7n th\u1EF1c h\xF3a n\u1EBFu b\u1EA1n n\u1ED7 l\u1EF1c. M\u1ED9t qu\xFD nh\xE2n s\u1EBD xu\u1EA5t hi\u1EC7n gi\xFAp \u0111\u1EE1 b\u1EA1n.",
      "type": "cat"
    },
    "\u5DF1+\u5DF1": {
      "name": "\u0110\u1ECAA H\u1ED8 PH\xD9NG QU\u1EF6",
      "desc": "\u5DF1/\u5DF1 (K\u1EF7/K\u1EF7) - \u0110\u1ECAA H\u1ED8 PH\xD9NG QU\u1EF6: \u0110\xE2y l\xE0 c\xE1ch c\u1EE5c ph\u1EE5c ng\xE2m, ch\u1EC9 ra s\u1EF1 tr\xEC tr\u1EC7 tr\xEAn con \u0111\u01B0\u1EDDng \u0111\u1EBFn m\u1EE5c ti\xEAu. C\xF3 kh\u1EA3 n\u0103ng x\u1EA3y ra c\xE1c c\u1EA3n tr\u1EDF v\xE0 v\u1EA5n \u0111\u1EC1 kh\xF3 kh\u0103n. C\u1EA7n ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe c\xE1 nh\xE2n v\xE0 c\u1EA3m x\xFAc.",
      "type": "hung"
    },
    "\u5DF1+\u5E9A": {
      "name": "MINH \u0110\u01AF\u1EDCNG PH\u1EE4C S\xC1T",
      "desc": "\u5DF1/\u5E9A (K\u1EF7/Canh) - MINH \u0110\u01AF\u1EDCNG PH\u1EE4C S\xC1T: C\u1EA7n t\xECm s\u1EF1 tr\u1EE3 gi\xFAp c\u1EE7a ng\u01B0\u1EDDi kh\xE1c khi \u0111\u1ED1i m\u1EB7t v\u1EDBi tranh c\xE3i. N\u1EBFu kh\xF4ng b\u1EA1n s\u1EBD m\u1EAFc k\u1EB9t, l\xE3ng ph\xED th\u1EDDi gian v\xE0 ph\xE1 ho\u1EA1i danh ti\u1EBFng. S\u1EF1 ki\xEAu h\xE3nh c\xF3 th\u1EC3 l\xE0 nguy\xEAn nh\xE2n l\xE0m b\u1EA1n s\u1EE5p \u0111\u1ED5.",
      "type": "hung"
    },
    "\u5DF1+\u8F9B": {
      "name": "DU H\u1ED2N NH\u1EACP M\u1ED8",
      "desc": "\u5DF1/\u8F9B (K\u1EF7/T\xE2n) - DU H\u1ED2N NH\u1EACP M\u1ED8: M\u1ECDi th\u1EE9 tr\xF4ng c\xF3 v\u1EBB \u1ED5n b\xEAn ngo\xE0i nh\u01B0ng th\u1EF1c ch\u1EA5t \u0111ang tr\xEC tr\u1EC7. S\u1EF1 tham lam c\xE1i l\u1EE3i nh\u1ECF c\xF3 th\u1EC3 khi\u1EBFn b\u1EA1n m\u1EA5t \u0111i t\u1EA7m nh\xECn r\u1ED9ng l\u1EDBn. V\u1EADn may b\u1EAFt \u0111\u1EA7u suy gi\u1EA3m khi c\xE1c v\u1EA5n \u0111\u1EC1 n\u1EA3y sinh.",
      "type": "hung"
    },
    "\u5DF1+\u58EC": {
      "name": "\u0110\u1ECAA C\u01AF\u01A0NG CAO TR\u01AF\u01A0NG",
      "desc": "\u5DF1/\u58EC (K\u1EF7/Nh\xE2m) - \u0110\u1ECAA C\u01AF\u01A0NG CAO TR\u01AF\u01A0NG: C\xE1ch c\u1EE5c r\u1EA5t kh\xF4ng may m\u1EAFn, ch\u1EC9 ra \xE2m m\u01B0u, ph\u1EA3n b\u1ED9i v\xE0 s\u1EF1 l\u1EEBa d\u1ED1i. T\xE2m tr\u1EA1ng c\u1EE7a b\u1EA1n s\u1EBD h\u1ED7n lo\u1EA1n, kh\xF3 duy tr\xEC s\u1EF1 minh m\u1EABn. B\u1EA1n s\u1EBD c\u1EA3m th\u1EA5y b\u1ECB k\u1EB9t trong t\xECnh c\u1EA3m.",
      "type": "hung"
    },
    "\u5DF1+\u7678": {
      "name": "\u0110\u1ECAA H\xCCNH HUY\u1EC0N V\u0168",
      "desc": "\u5DF1/\u7678 (K\u1EF7/Qu\xFD) - \u0110\u1ECAA H\xCCNH HUY\u1EC0N V\u0168: Ch\u1EC9 ra s\u1EF1 th\u1EA5t b\u1EA1i trong k\u1EBF ho\u1EA1ch. B\u1EA1n t\xECm s\u1EF1 gi\xFAp \u0111\u1EE1 nh\u01B0ng s\u1EBD kh\xF4ng nh\u1EADn \u0111\u01B0\u1EE3c l\u1EDDi \u0111\xE1p. B\u1EA1n c\xF3 th\u1EC3 c\u1EA3m th\u1EA5y l\u1EA1c l\xF5ng v\xE0 c\xF4 \u0111\u01A1n tr\u01B0\u1EDBc nh\u1EEFng v\u1EA5n \u0111\u1EC1 kh\xF3 kh\u0103n nh\u01B0 n\xFAi.",
      "type": "hung"
    },
    "\u5E9A+\u7532": {
      "name": "TR\u1EF0C PH\xD9 PH\u1EE4C CUNG",
      "desc": "\u5E9A/\u7532 (Canh/Gi\xE1p) - TR\u1EF0C PH\xD9 PH\u1EE4C CUNG: Tri\u1EC3n v\u1ECDng r\u1EA5t kh\xF4ng thu\u1EADn l\u1EE3i. T\xECnh hu\u1ED1ng \u0111ang t\u1ED1t \u0111\u1EB9p c\xF3 th\u1EC3 \u0111\u1ED9t ng\u1ED9t bi\u1EBFn th\xE0nh ti\xEAu c\u1EF1c. C\u1EA7n \u0111\u1EC1 ph\xF2ng hao t\u1ED5n ti\u1EC1n c\u1EE7a ho\u1EB7c tranh ch\u1EA5p t\xE0i ch\xEDnh nghi\xEAm tr\u1ECDng.",
      "type": "hung"
    },
    "\u5E9A+\u4E59": {
      "name": "TH\xC1I B\u1EA0CH PH\xD9NG TINH",
      "desc": "\u5E9A/\u4E59 (Canh/\u1EA4t) - TH\xC1I B\u1EA0CH PH\xD9NG TINH: T\u1ED1t h\u01A1n h\u1EBFt b\u1EA1n n\xEAn ch\u1EE7 \u0111\u1ED9ng v\xE0 t\xEDch c\u1EF1c. N\u1EBFu th\u1EE5 \u0111\u1ED9ng ch\u1EDD \u0111\u1EE3i c\u01A1 h\u1ED9i th\xEC m\u1ECDi vi\u1EC7c s\u1EBD kh\xF4ng t\u1ED1t. C\u1EA7n che gi\u1EA5u th\xE0nh t\xEDch \u0111\u1EC3 tr\xE1nh s\u1EF1 ghen t\u1ECB t\u1EEB ng\u01B0\u1EDDi kh\xE1c.",
      "type": "binh"
    },
    "\u5E9A+\u4E19": {
      "name": "TH\xC1I B\u1EA0CH NH\u1EACP HU\u1EF2NH HO\u1EB6C",
      "desc": "\u5E9A/\u4E19 (Canh/B\xEDnh) - TH\xC1I B\u1EA0CH NH\u1EACP HU\u1EF2NH HO\u1EB6C: C\xF3 th\u1EC3 b\u1ECB \u0111\xF3ng khung ho\u1EB7c b\u1ECB t\u1ED5n h\u1EA1i oan u\u1ED5ng. M\u1EC7nh l\u1EC7nh \u0111\u01B0a ra kh\xF4ng \u0111\u01B0\u1EE3c th\u1EF1c hi\u1EC7n hi\u1EC7u qu\u1EA3 \u1EDF n\u01A1i l\xE0m vi\u1EC7c. C\u1EA7n \u0111\u1EC1 ph\xF2ng tr\u1ED9m c\u01B0\u1EDBp v\xE0 hao t\u1ED1n t\xE0i s\u1EA3n.",
      "type": "hung"
    },
    "\u5E9A+\u4E01": {
      "name": "\u0110\xCCNH \u0110\xCCNH CHI C\xC1CH",
      "desc": "\u5E9A/\u4E01 (Canh/\u0110inh) - \u0110\xCCNH \u0110\xCCNH CHI C\xC1CH: C\xF3 nh\u1EEFng thay \u0111\u1ED5i l\u1EDBn \u0111ang di\u1EC5n ra. B\u1EA1n c\xF3 th\u1EC3 \u0111\u1ED9t ng\u1ED9t g\u1EB7p ho\xE0n c\u1EA3nh m\u1EDBi kh\xF4ng h\u1EB3n \u0111\xE3 t\xEDch c\u1EF1c. D\u1EC5 n\u1EA3y sinh m\xE2u thu\u1EABn, tranh c\xE3i v\xE0 c\xE1c th\xE1ch th\u1EE9c ph\xE1p l\xFD.",
      "type": "hung"
    },
    "\u5E9A+\u620A": {
      "name": "THI\xCAN \u1EA4T PH\u1EE4C CUNG C\xC1CH",
      "desc": "\u5E9A/\u620A (Canh/M\u1EADu) - THI\xCAN \u1EA4T PH\u1EE4C CUNG C\xC1CH: Bi\u1EC3u th\u1ECB s\u1EF1 m\u1EA5t m\xE1t v\u1ECB th\u1EBF v\xE0 c\u1EA7n ph\u1EA3i ph\xF2ng th\u1EE7 ki\xEAn c\u01B0\u1EDDng. B\u1EA1n thi\u1EBFu \u0111\u1ECBnh h\u01B0\u1EDBng r\xF5 r\xE0ng v\xE0 g\u1EB7p kh\xF3 kh\u0103n. C\u1EA7n c\xF3 k\u1EBF ho\u1EA1ch d\u1EF1 ph\xF2ng cho nh\u1EEFng t\xECnh hu\u1ED1ng x\u1EA5u nh\u1EA5t.",
      "type": "hung"
    },
    "\u5E9A+\u5DF1": {
      "name": "H\xCCNH C\xC1CH",
      "desc": "\u5E9A/\u5DF1 (Canh/K\u1EF7) - H\xCCNH C\xC1CH: Cho th\u1EA5y s\u1EF1 b\u1EA5t h\xF2a \u0111ang gia t\u0103ng. B\u1EA1n th\u01B0\u1EDDng xuy\xEAn g\u1EB7p ph\u1EA3i c\xE1c v\u1EE5 ki\u1EC7n v\xE0 tranh c\xE3i. C\u1EA7n c\u1EA9n tr\u1ECDng v\u1EDBi c\xE1c th\xF3i h\u01B0 t\u1EADt x\u1EA5u v\xE0 vi\u1EC7c l\u1EA1m d\u1EE5ng qu\xE1 m\u1EE9c c\xE1c th\xFA vui.",
      "type": "hung"
    },
    "\u5E9A+\u5E9A": {
      "name": "TH\xC1I B\u1EA0CH \u0110\u1ED2NG CUNG",
      "desc": "\u5E9A/\u5E9A (Canh/Canh) - TH\xC1I B\u1EA0CH \u0110\u1ED2NG CUNG: \u0110\u01B0\u1EE3c bi\u1EBFt \u0111\u1EBFn l\xE0 Chi\u1EBFn C\xE1ch, ch\u1EC9 ra s\u1EF1 gia t\u0103ng c\u1EE7a nh\u1EEFng th\u1EA3m h\u1ECDa b\u1EA5t ng\u1EDD. Xung \u0111\u1ED9t gi\u1EEFa \u0111\u1ED3ng nghi\u1EC7p v\xE0 b\u1EA1n b\xE8 s\u1EBD leo thang. Nguy hi\u1EC3m ti\u1EC1m \u1EA9n g\xE2y tai h\u1ECDa l\u1EDBn.",
      "type": "hung"
    },
    "\u5E9A+\u8F9B": {
      "name": "B\u1EA0CH H\u1ED4 CAN C\xC1CH",
      "desc": "\u5E9A/\u8F9B (Canh/T\xE2n) - B\u1EA0CH H\u1ED4 CAN C\xC1CH: C\xF3 nguy hi\u1EC3m b\u1EA5t ng\u1EDD \u0111ang \u0111\u1EBFn g\u1EA7n. Kh\u1EA3 n\u0103ng x\u1EA3y ra tai n\u1EA1n giao th\xF4ng ho\u1EB7c va ch\u1EA1m m\u1EA1nh l\xE0 r\u1EA5t cao. Anh em trong nh\xE0 d\u1EC5 ch\u1EC9 tr\xEDch v\xE0 ganh \u0111ua kh\xF4ng l\xE0nh m\u1EA1nh.",
      "type": "hung"
    },
    "\u5E9A+\u58EC": {
      "name": "TI\u1EC2U C\xC1CH",
      "desc": "\u5E9A/\u58EC (Canh/Nh\xE2m) - TI\u1EC2U C\xC1CH: Ch\u1EC9 ra d\xF2ng ch\u1EA3y b\u1ECB t\u1EAFc ngh\u1EBDn \u0111\u1ED9t ng\u1ED9t. S\u1EA3n xu\u1EA5t c\xF3 th\u1EC3 b\u1ECB d\u1EEBng l\u1EA1i v\xE0 ni\u1EC1m vui k\u1EBFt th\xFAc b\u1EA5t ng\u1EDD. C\xE1c d\u1EF1 \xE1n s\u1EBD th\u1EA5t b\u1EA1i n\u1EBFu kh\xF4ng \u0111\u01B0\u1EE3c chu\u1EA9n b\u1ECB k\u1EF9 l\u01B0\u1EE1ng v\u1EC1 tr\xECnh \u0111\u1ED9.",
      "type": "hung"
    },
    "\u5E9A+\u7678": {
      "name": "\u0110\u1EA0I C\xC1CH",
      "desc": "\u5E9A/\u7678 (Canh/Qu\xFD) - \u0110\u1EA0I C\xC1CH: Nh\xECn chung l\xE0 c\xE1ch c\u1EE5c kh\xF4ng thu\u1EADn l\u1EE3i. C\xF3 nguy c\u01A1 th\u01B0\u01A1ng t\xEDch v\xE0 tai n\u1EA1n giao th\xF4ng t\u0103ng cao. Nh\u1EEFng r\u1EAFc r\u1ED1i c\u0169 c\xF3 th\u1EC3 quay l\u1EA1i \xE1m \u1EA3nh v\xE0 g\xE2y kh\xF3 kh\u0103n cho b\u1EA1n.",
      "type": "hung"
    },
    "\u8F9B+\u7532": {
      "name": "LONG TRANH H\u1ED4 \u0110\u1EA4U",
      "desc": "\u8F9B/\u7532 (T\xE2n/Gi\xE1p) - LONG TRANH H\u1ED4 \u0110\u1EA4U: Vi\u1EC7c \u0111\u1EA1t \u0111\u01B0\u1EE3c m\u1EE5c ti\xEAu c\xF3 v\u1EBB d\u1EC5 d\xE0ng nh\u1EDD s\u1EF1 gi\xFAp \u0111\u1EE1 xung quanh. Tuy nhi\xEAn th\xE1ch th\xE1ch th\u1EF1c s\u1EF1 l\xE0 duy tr\xEC nh\u1EEFng th\xE0nh qu\u1EA3 \u0111\xF3. C\u1EA7n l\xE0m vi\u1EC7c ch\u0103m ch\u1EC9 \u0111\u1EC3 gi\u1EEF v\u1EEFng v\u1ECB th\u1EBF.",
      "type": "cat"
    },
    "\u8F9B+\u4E59": {
      "name": "B\u1EA0CH H\u1ED4 X\u01AF\u01A0NG CU\u1ED2NG",
      "desc": "\u8F9B/\u4E59 (T\xE2n/\u1EA4t) - B\u1EA0CH H\u1ED4 X\u01AF\u01A0NG CU\u1ED2NG: T\xECnh h\xECnh bi\u1EBFn \u0111\u1ED9ng theo h\u01B0\u1EDBng t\u1ED3i t\u1EC7. Kh\xF4ng th\xEDch h\u1EE3p cho c\xE1c vi\u1EC7c tr\u1ECDng \u0111\u1EA1i nh\u01B0 k\u1EBFt h\xF4n, x\xE2y nh\xE0 hay kinh doanh. C\u1EA3m gi\xE1c s\u1EE3 h\xE3i v\xE0 r\u1EE7i ro lu\xF4n th\u01B0\u1EDDng tr\u1EF1c.",
      "type": "hung"
    },
    "\u8F9B+\u4E19": {
      "name": "CAN H\u1EE2P NGUY\u1EC6T K\xCC",
      "desc": "\u8F9B/\u4E19 (T\xE2n/B\xEDnh) - CAN H\u1EE2P NGUY\u1EC6T K\xCC: D\xF9 t\xECnh hu\u1ED1ng t\u1ED3i t\u1EC7 b\u1EA1n v\u1EABn c\xF3 kh\u1EA3 n\u0103ng ki\u1EC3m so\xE1t v\u1EA5n \u0111\u1EC1. Tuy nhi\xEAn tin t\u1ED1t s\u1EBD kh\xF4ng t\u1EF1 nhi\xEAn \u0111\u1EBFn m\xE0 c\u1EA7n s\u1EF1 n\u1ED7 l\u1EF1c r\u1EA5t l\u1EDBn v\xE0 \u0111\xE1nh gi\xE1 \u0111\xFAng t\xECnh h\xECnh th\u1EF1c t\u1EBF.",
      "type": "hung"
    },
    "\u8F9B+\u4E01": {
      "name": "B\u1EA0CH H\u1ED4 TH\u1EE4 CH\u1EBE",
      "desc": "\u8F9B/\u4E01 (T\xE2n/\u0110inh) - B\u1EA0CH H\u1ED4 TH\u1EE4 CH\u1EBE: Lu\xF4n c\xF3 gi\u1EA3i ph\xE1p cho m\u1ECDi v\u1EA5n \u0111\u1EC1 nh\u01B0ng c\xE1i gi\xE1 ph\u1EA3i tr\u1EA3 c\xF3 th\u1EC3 l\xE0 c\xE1c m\u1ED1i quan h\u1EC7. \u0110\xE2y l\xE0 l\xFAc b\u1EA1n c\xF3 c\u01A1 h\u1ED9i tr\xECnh di\u1EC5n t\xE0i n\u0103ng sau th\u1EDDi gian d\xE0i ch\u1EDD \u0111\u1EE3i.",
      "type": "binh"
    },
    "\u8F9B+\u620A": {
      "name": "KH\u1ED0N LONG TH\u1EE4 CH\u1EBE",
      "desc": "\u8F9B/\u620A (T\xE2n/M\u1EADu) - KH\u1ED0N LONG TH\u1EE4 CH\u1EBE: Cho th\u1EA5y thay \u0111\u1ED5i tr\u1EF1c ti\u1EBFp li\xEAn quan t\u1EDBi ch\u1EE9c v\u1EE5 ho\u1EB7c quy\u1EC1n l\u1EF1c. \u0110\u1ED3ng nghi\u1EC7p c\xF3 th\u1EC3 kh\xF4ng tu\xE2n th\u1EE7 m\u1EC7nh l\u1EC7nh. M\u1ED9t li\xEAn minh m\u1EDBi c\xF3 th\u1EC3 \u0111ang h\xECnh th\xE0nh ch\u1ED1ng l\u1EA1i b\u1EA1n.",
      "type": "binh"
    },
    "\u8F9B+\u5DF1": {
      "name": "NH\u1EACP NG\u1EE4C T\u1EF0 H\xCCNH",
      "desc": "\u8F9B/\u5DF1 (T\xE2n/K\u1EF7) - NH\u1EACP NG\u1EE4C T\u1EF0 H\xCCNH: \xC1m ch\u1EC9 m\u1ED9t c\u1EA5p d\u01B0\u1EDBi t\u1EADn t\xE2m nh\u01B0ng c\xF3 th\u1EC3 b\xE1n \u0111\u1EE9ng ch\u1EE7 nh\xE2n. C\u1EA7n nh\u1EDB 'nh\xE2n n\xE0o qu\u1EA3 n\u1EA5y', h\xE3y \u0111\u1ED1i x\u1EED t\u1ED1t v\u1EDBi ng\u01B0\u1EDDi kh\xE1c \u0111\u1EC3 nh\u1EADn l\u1EA1i \u0111i\u1EC1u t\u1ED1t \u0111\u1EB9p m\u1ED9t c\xE1ch d\u1EC5 d\xE0ng.",
      "type": "hung"
    },
    "\u8F9B+\u5E9A": {
      "name": "B\u1EA0CH H\u1ED4 XU\u1EA4T \u0110AO",
      "desc": "\u8F9B/\u5E9A (T\xE2n/Canh) - B\u1EA0CH H\u1ED4 XU\u1EA4T \u0110AO: Ch\u1EC9 ra s\u1EF1 giao tranh v\xE0 xung \u0111\u1ED9t \xE1c li\u1EC7t. C\xF3 kh\u1EA3 n\u0103ng g\xE2y t\u1ED5n th\u01B0\u01A1ng c\u01A1 th\u1EC3. C\u1EA3m x\xFAc d\u1EC5 b\xF9ng n\u1ED5 nh\u01B0 n\xFAi l\u1EEDa d\u1EABn \u0111\u1EBFn bi k\u1ECBch trong c\xE1c m\u1ED1i quan h\u1EC7.",
      "type": "hung"
    },
    "\u8F9B+\u8F9B": {
      "name": "PH\u1EE4C NG\xC2M THI\xCAN \u0110\xCCNH",
      "desc": "\u8F9B/\u8F9B (T\xE2n/T\xE2n) - PH\u1EE4C NG\xC2M THI\xCAN \u0110\xCCNH: Vi\u1EC7c t\u1EF1 ph\xE1 ho\u1EA1i l\xE0 \u0111i\u1EC1u t\u1ED3i t\u1EC7 nh\u1EA5t. B\u1EA1n d\u1EC5 n\xF3i qu\xE1 nhi\u1EC1u v\xE0 ti\u1EBFt l\u1ED9 b\xED m\u1EADt. C\u1EA7n h\u1ECDc h\u1ECFi t\u1EEB nh\u1EEFng r\u1EAFc r\u1ED1i \u0111\u1EC3 tr\xE2n tr\u1ECDng nh\u1EEFng b\xE0i h\u1ECDc kinh nghi\u1EC7m qu\xFD b\xE1u.",
      "type": "hung"
    },
    "\u8F9B+\u58EC": {
      "name": "HUNG X\xC0 NH\u1EACP NG\u1EE4C",
      "desc": "\u8F9B/\u58EC (T\xE2n/Nh\xE2m) - HUNG X\xC0 NH\u1EACP NG\u1EE4C: R\u1EA5t b\u1EA5t l\u1EE3i, c\xF3 k\u1EBB th\xF9 x\xE2m nh\u1EADp v\xE0o n\u1ED9i b\u1ED9. S\u1EF1 h\u1ED7n lo\u1EA1n v\xE0 b\u1EA5t an lan t\u1ECFa. S\u1EF1 c\u1EA9u th\u1EA3 s\u1EBD d\u1EABn \u0111\u1EBFn th\u1EA5t b\u1EA1i trong s\u1EF1 nghi\u1EC7p v\xE0 kinh doanh.",
      "type": "hung"
    },
    "\u8F9B+\u7678": {
      "name": "THI\xCAN LAO HOA C\xC1I",
      "desc": "\u8F9B/\u7678 (T\xE2n/Qu\xFD) - THI\xCAN LAO HOA C\xC1I: Bi\u1EC3u th\u1ECB m\u1EB7t tr\u1EDDi v\xE0 m\u1EB7t tr\u0103ng b\u1ECB m\u1EDD m\u1ECBt b\u1EDFi m\xE2y \u0111en. T\xE2m tr\xED ng\u01B0\u1EDDi \u0111\xF3 c\xF3 th\u1EC3 tr\u1EDF n\xEAn t\u1ED1i t\u0103m, thi\u1EBFu s\xE1ng su\u1ED1t. M\u1ED1i nguy hi\u1EC3m ti\u1EC1m \u1EA9n t\u1EEB s\u1EF1 thi\u1EBFu r\xF5 r\xE0ng.",
      "type": "hung"
    },
    "\u58EC+\u7532": {
      "name": "THANH LONG NH\u1EACP NG\u1EE4C",
      "desc": "\u58EC/\u7532 (Nh\xE2m/Gi\xE1p) - THANH LONG NH\u1EACP NG\u1EE4C: Nguy hi\u1EC3m v\xE0 th\xE1ch th\u1EE9c xu\u1EA5t hi\u1EC7n t\u1EEB m\u1ECDi ph\xEDa. K\u1EBB th\xF9 c\xF3 th\u1EC3 t\u1EA5n c\xF4ng c\xF9ng l\xFAc. C\u1EA7n tr\xE1nh c\xE1c chuy\u1EC7n b\xE0n t\xE1n v\xE0 tin \u0111\u1ED3n \xE1c \xFD nh\u1EAFm v\xE0o b\u1EA1n.",
      "type": "hung"
    },
    "\u58EC+\u4E59": {
      "name": "TI\u1EC2U X\xC0 NH\u1EACT K\xCC",
      "desc": "\u58EC/\u4E59 (Nh\xE2m/\u1EA4t) - TI\u1EC2U X\xC0 NH\u1EACT K\xCC: Bi\u1EC3u th\u1ECB nh\u1EEFng tr\u1EDF ng\u1EA1i ti\u1EC1m \u1EA9n tr\xEAn h\xE0nh tr\xECnh. Th\u1EA3m h\u1ECDa c\xF3 th\u1EC3 x\u1EA3y ra ngay c\u1EA3 khi m\u1ECDi vi\u1EC7c \u0111ang su\xF4n s\u1EBB. C\xF3 c\u1EA3m gi\xE1c v\u1EC1 s\u1EF1 kh\xF4ng tin c\u1EADy v\xE0 ph\u1EA3n b\u1ED9i.",
      "type": "binh"
    },
    "\u58EC+\u4E19": {
      "name": "TH\u1EE6Y X\xC0 NH\u1EACP H\u1ECEA",
      "desc": "\u58EC/\u4E19 (Nh\xE2m/B\xEDnh) - TH\u1EE6Y X\xC0 NH\u1EACP H\u1ECEA: Bi\u1EC3u th\u1ECB s\u1EF1 \u0111\u1ED9c \xE1c v\xE0 l\u1EEBa d\u1ED1i. B\u1EA1n c\xF3 quy\u1EC1n l\u1EF1c nh\u01B0ng b\u1ECB c\u1EA3n tr\u1EDF b\u1EDFi nh\u1EEFng m\u01B0u m\xF4 x\u1EA5u xa. C\u1EA7n \u0111\u1EC1 ph\xF2ng s\u1EF1 b\xF4i nh\u1ECD danh ti\u1EBFng t\u1EEB \u0111\u1ED1i th\u1EE7.",
      "type": "hung"
    },
    "\u58EC+\u4E01": {
      "name": "KI\u1EC0N H\u1EE2P X\xC0 H\xCCNH",
      "desc": "\u58EC/\u4E01 (Nh\xE2m/\u0110inh) - KI\u1EC0N H\u1EE2P X\xC0 H\xCCNH: Cho th\u1EA5y s\u1EF1 nh\u1EA7m l\u1EABn v\xE0 m\u01A1 h\u1ED3 d\u1EABn \u0111\u1EBFn nh\u1EEFng c\u1EA3m x\xFAc l\u1EABn l\u1ED9n. M\u1ED9t ng\u01B0\u1EDDi b\u1EA1n tin t\u01B0\u1EDFng c\xF3 th\u1EC3 kh\xF4ng t\u1ED1t nh\u01B0 b\u1EA1n ngh\u0129. C\u1EA7n n\u1ED7 l\u1EF1c nhi\u1EC1u \u0111\u1EC3 duy tr\xEC s\u1EF1 th\u1EADt.",
      "type": "binh"
    },
    "\u58EC+\u620A": {
      "name": "TI\u1EC2U X\xC0 H\xD3A LONG",
      "desc": "\u58EC/\u620A (Nh\xE2m/M\u1EADu) - TI\u1EC2U X\xC0 H\xD3A LONG: R\u1EA5t t\u1ED1t l\xE0nh, ch\u1EC9 ra s\u1EF1 bi\u1EBFn \u0111\u1ED5i ho\u1EB7c thay \u0111\u1ED5i t\xEDch c\u1EF1c. M\u1ED9t t\xECnh hu\u1ED1ng ti\xEAu c\u1EF1c c\xF3 th\u1EC3 chuy\u1EC3n th\xE0nh k\u1EBFt qu\u1EA3 t\u1ED1t \u0111\u1EB9p. Qu\xFD nh\xE2n \xE2m th\u1EA7m h\u1ED7 tr\u1EE3.",
      "type": "cat"
    },
    "\u58EC+\u5DF1": {
      "name": "HUNG X\xC0 NH\u1EACP NG\u1EE4C",
      "desc": "\u58EC/\u5DF1 (Nh\xE2m/K\u1EF7) - HUNG X\xC0 NH\u1EACP NG\u1EE4C: Kh\xE1 ti\xEAu c\u1EF1c, c\xF3 nhi\u1EC1u tr\u1EDF ng\u1EA1i ti\u1EC1m \u1EA9n. B\u1EA1n d\u1EC5 b\u1ECB vu oan ho\u1EB7c b\u1ECB \xE9p gi\u1EA3i quy\u1EBFt r\u1EAFc r\u1ED1i c\u1EE7a ng\u01B0\u1EDDi kh\xE1c. Nh\u1EEFng v\u1EA5n \u0111\u1EC1 nh\u1ECF c\xF3 th\u1EC3 leo thang th\xE0nh th\u1EA3m h\u1ECDa.",
      "type": "hung"
    },
    "\u58EC+\u5E9A": {
      "name": "TH\xC1I B\u1EA0CH C\u1EA6M X\xC0",
      "desc": "\u58EC/\u5E9A (Nh\xE2m/Canh) - TH\xC1I B\u1EA0CH C\u1EA6M X\xC0: \u0110\u1ED1i m\u1EB7t v\u1EDBi r\u1EAFc r\u1ED1i l\u1EDBn v\xE0 tranh c\xE3i. Tuy nhi\xEAn c\xE1c ph\xE1n quy\u1EBFt ph\xE1p l\xFD s\u1EBD c\xF4ng b\u1EB1ng n\u1EBFu b\u1EA1n minh b\u1EA1ch. \u0110\u1EEBng h\xE0nh \u0111\u1ED9ng v\u1ED9i v\xE0ng m\xE0 c\u1EA7n t\u01B0 duy ki\xEAn nh\u1EABn.",
      "type": "hung"
    },
    "\u58EC+\u8F9B": {
      "name": "\u0110\u1EB0NG X\xC0 T\u01AF\u01A0NG TRI\u1EC0N",
      "desc": "\u58EC/\u8F9B (Nh\xE2m/T\xE2n) - \u0110\u1EB0NG X\xC0 T\u01AF\u01A0NG TRI\u1EC0N: M\u1ECDi th\u1EE9 tr\xF4ng \u1ED5n b\xEAn ngo\xE0i nh\u01B0ng th\u1EF1c ch\u1EA5t \u0111ang \u0111\xECnh tr\u1EC7. L\xF2ng tham c\xF3 th\u1EC3 l\xE0m b\u1EA1n m\u1EA5t t\u1EA7m nh\xECn r\u1ED9ng h\u01A1n. V\u1EADn may gi\u1EA3m s\xFAt khi c\xE1c v\u1EA5n \u0111\u1EC1 xu\u1EA5t hi\u1EC7n h\xE0ng lo\u1EA1t.",
      "type": "hung"
    },
    "\u58EC+\u58EC": {
      "name": "X\xC0 NH\u1EACP \u0110\u1ECAA LA",
      "desc": "\u58EC/\u58EC (Nh\xE2m/Nh\xE2m) - X\xC0 NH\u1EACP \u0110\u1ECAA LA: Kh\xE1 hung hi\u1EC3m, bi\u1EC3u th\u1ECB m\u01B0u m\xF4, ph\u1EA3n b\u1ED9i v\xE0 scandal. T\xECnh tr\u1EA1ng t\xE2m l\xFD d\u1EC5 r\u01A1i v\xE0o h\u1ED7n lo\u1EA1n. B\u1EA1n c\u1EA3m th\u1EA5y b\u1ECB m\u1EAFc k\u1EB9t v\u1EC1 c\u1EA3m x\xFAc v\xE0 li\xEAn t\u1EE5c c\u0103ng th\u1EB3ng.",
      "type": "hung"
    },
    "\u58EC+\u7678": {
      "name": "\u1EA4U N\u1EEE GIAN D\xC2M",
      "desc": "\u58EC/\u7678 (Nh\xE2m/Qu\xFD) - \u1EA4U N\u1EEE GIAN D\xC2M: Khi m\u1ECDi th\u1EE9 qu\xE1 t\u1ED1t \u0111\u1EBFn m\u1EE9c kh\xF3 tin th\xEC c\u1EA7n c\u1EA3nh gi\xE1c. S\u1EF1 tham lam v\xE0 c\xE1c ham mu\u1ED1n th\xE1i qu\xE1 l\xE0 ngu\u1ED3n g\u1ED1c c\u1EE7a r\u1EAFc r\u1ED1i. C\u1EA7n h\u1EA1n ch\u1EBF l\xF2ng tham \u0111\u1EC3 gi\u1EA3m b\u1EDBt kh\xF3 kh\u0103n.",
      "type": "hung"
    },
    "\u7678+\u7532": {
      "name": "THANH LONG NH\u1EACP \u0110\u1ECAA",
      "desc": "\u7678/\u7532 (Qu\xFD/Gi\xE1p) - THANH LONG NH\u1EACP \u0110\u1ECAA: Bi\u1EBFn m\u1ECDi th\u1EE9 t\u1EEB x\u1EA5u th\xE0nh t\u1ED1t. M\u1ED9t s\u1EF1 thay \u0111\u1ED5i t\xEDch c\u1EF1c l\xE0 v\u1EABn c\xF3 th\u1EC3 x\u1EA3y ra nh\u1EDD qu\xFD nh\xE2n. C\u1EA7n nh\xECn nh\u1EADn b\u1EA3n th\xE2n v\xE0 t\xECm con \u0111\u01B0\u1EDDng \u0111\xFAng \u0111\u1EAFn \xEDt r\u1EE7i ro.",
      "type": "cat"
    },
    "\u7678+\u4E59": {
      "name": "HOA C\xC1I PH\xD9NG TINH",
      "desc": "\u7678/\u4E59 (Qu\xFD/\u1EA4t) - HOA C\xC1I PH\xD9NG TINH: Mong mu\u1ED1n v\xE0 m\u1EE5c ti\xEAu d\u1EC5 \u0111\u1EA1t \u0111\u01B0\u1EE3c. Chi\u1EBFn l\u01B0\u1EE3c c\u1EE7a b\u1EA1n c\xF3 th\u1EC3 tri\u1EC3n khai hi\u1EC7u qu\u1EA3. C\xF3 may m\u1EAFn v\u1EC1 t\xE0i l\u1ED9c. C\u1EA7n l\u1EF1a ch\u1ECDn t\u1EEB ng\u1EEF c\u1EA9n th\u1EADn khi giao ti\u1EBFp.",
      "type": "cat"
    },
    "\u7678+\u4E19": {
      "name": "HOA C\xC1I B\u1ED8I S\u01AF",
      "desc": "\u7678/\u4E19 (Qu\xFD/B\xEDnh) - HOA C\xC1I B\u1ED8I S\u01AF: Th\xE0nh c\xF4ng l\u1EDBn r\u1EA5t kh\xF3 \u0111\u1EA1t \u0111\u01B0\u1EE3c. N\xEAn t\u1EADp trung v\xE0o c\xE1c m\u1EE5c ti\xEAu hi\u1EC7n t\u1EA1i thay v\xEC theo \u0111u\u1ED5i nh\u1EEFng th\u1EE9 xa v\u1EDDi. Ti\u1EBFn tri\u1EC3n c\xF4ng vi\u1EC7c s\u1EBD r\u1EA5t ch\u1EADm ch\u1EADp.",
      "type": "hung"
    },
    "\u7678+\u4E01": {
      "name": "\u0110\u1EB0NG X\xC0 Y\xCAU KI\u1EC0U",
      "desc": "\u7678/\u4E01 (Qu\xFD/\u0110inh) - \u0110\u1EB0NG X\xC0 Y\xCAU KI\u1EC0U: D\u1EC5 x\u1EA3y ra tranh c\xE3i v\xE0 b\u1EA5t \u0111\u1ED3ng l\u1EDBn. T\xECnh h\xECnh c\xF3 th\u1EC3 tr\u1EDF n\xEAn r\u1EA5t nguy hi\u1EC3m v\xE0 kh\xF4ng tho\u1EA3i m\xE1i. Nguy c\u01A1 v\u1EC1 s\u1EE9c kh\u1ECFe v\xE0 th\u1EA3m h\u1ECDa c\xF3 th\u1EC3 n\u1EA3y sinh.",
      "type": "hung"
    },
    "\u7678+\u620A": {
      "name": "THI\xCAN \u1EA4T H\u1ED8I H\u1EE2P",
      "desc": "\u7678/\u620A (Qu\xFD/M\u1EADu) - THI\xCAN \u1EA4T H\u1ED8I H\u1EE2P: Tri\u1EC3n v\u1ECDng t\u1ED1t v\u1EC1 t\xE0i s\u1EA3n v\xE0 t\xECnh c\u1EA3m. C\xE1c v\u1EA5n \u0111\u1EC1 t\xE0i v\u1EADn s\u1EBD h\xF2a h\u1EE3p v\xE0 th\xE0nh c\xF4ng. S\u1EF1 gi\xFAp \u0111\u1EE1 c\u1EE7a qu\xFD nh\xE2n l\xE0m m\u1ECDi vi\u1EC7c tr\u1EDF n\xEAn d\u1EC5 d\xE0ng h\u01A1n.",
      "type": "cat"
    },
    "\u7678+\u5DF1": {
      "name": "HOA C\xC1I \u0110\u1ECAA H\u1ED8",
      "desc": "\u7678/\u5DF1 (Qu\xFD/K\u1EF7) - HOA C\xC1I \u0110\u1ECAA H\u1ED8: D\u1EC5 g\u1EB7p v\u1EA5n \u0111\u1EC1 trong giao ti\u1EBFp, quan h\u1EC7 t\xECnh c\u1EA3m kh\xF4ng su\xF4n s\u1EBB. C\xF3 nh\u1EEFng \xE2m m\u01B0u \u1EA9n gi\u1EA5u. B\u1EA1n thi\u1EBFu s\u1EF1 ri\xEAng t\u01B0 v\xE0 d\u1EC5 b\u1ECB ng\u01B0\u1EDDi kh\xE1c t\xE1c \u0111\u1ED9ng ti\xEAu c\u1EF1c.",
      "type": "hung"
    },
    "\u7678+\u5E9A": {
      "name": "TH\xC1I B\u1EA0CH NH\u1EACP V\xD5NG",
      "desc": "\u7678/\u5E9A (Qu\xFD/Canh) - TH\xC1I B\u1EA0CH NH\u1EACP V\xD5NG: Chi\u1EBFn l\u01B0\u1EE3c c\xE1 nh\xE2n c\xF3 sai l\u1EA7m d\u1EC5 b\u1ECB t\u1EF1 \xE1i. T\xEDnh c\xE1ch n\u1ED5i lo\u1EA1n l\xE0m b\u1EA1n d\u1EC5 b\u1ECB \u0111\u1ED1i th\u1EE7 \u0111\xE1nh b\u1EA1i. C\xF3 kh\u1EA3 n\u0103ng x\u1EA3y ra tranh c\xE3i ho\u1EB7c xung \u0111\u1ED9t m\u1EA1nh.",
      "type": "hung"
    },
    "\u7678+\u8F9B": {
      "name": "HOA C\xC1I TH\u1EE4 \xC2N",
      "desc": "\u7678/\u8F9B (Qu\xFD/T\xE2n) - HOA C\xC1I TH\u1EE4 \xC2N: C\xF3 th\u1EC3 g\u1EB7p m\u1EA5t m\xE1t tr\u01B0\u1EDBc khi nh\u1EADn \u0111\u01B0\u1EE3c ph\u1EA7n th\u01B0\u1EDFng. K\u1EBB th\xF9 c\xF3 th\u1EC3 \u0111ang ph\u1ED1i h\u1EE3p ch\u1ED1ng l\u1EA1i b\u1EA1n. C\u1EA7n ki\xEAn nh\u1EABn ch\u1EDD \u0111\u1EE3i v\xE0 ch\xFA \xFD \u0111\u1EBFn s\u1EE9c kh\u1ECFe.",
      "type": "hung"
    },
    "\u7678+\u58EC": {
      "name": "THI\xCAN V\xD5NG CHUNG NG\u1EE4C",
      "desc": "\u7678/\u58EC (Qu\xFD/Nh\xE2m) - THI\xCAN V\xD5NG CHUNG NG\u1EE4C: V\xF4 c\xF9ng hung hi\u1EC3m, kh\xF4ng c\xF3 \u0111i\u1EC1u g\xEC c\xF3 l\u1EE3i. Quan h\u1EC7 l\xE2u d\xE0i d\u1EC5 \u0111\u1ED9t ng\u1ED9t tr\u1EDF n\xEAn x\u1EA5u \u0111i. B\u1EA1n c\u1EA3m th\u1EA5y b\u1EBF t\u1EAFc trong v\xF2ng lu\u1EA9n qu\u1EA9n c\u1EE7a r\u1EAFc r\u1ED1i.",
      "type": "hung"
    },
    "\u7678+\u7678": {
      "name": "THI\xCAN V\xD5NG T\u1EE8 TR\u01AF\u01A0NG",
      "desc": "\u7678/\u7678 (Qu\xFD/Qu\xFD) - THI\xCAN V\xD5NG T\u1EE8 TR\u01AF\u01A0NG: C\xF3 b\u1EABy ph\xEDa tr\u01B0\u1EDBc, kh\xF4ng n\xEAn h\xE0nh \u0111\u1ED9ng. M\u1ECDi vi\u1EC7c kh\xF4ng th\xE0nh c\xF4ng nh\u01B0 d\u1EF1 ki\u1EBFn. C\u1EA7n \u0111\u1EB7c bi\u1EC7t c\u1EA3nh gi\xE1c v\u1EDBi m\u1ECDi thay \u0111\u1ED5i quanh m\xECnh.",
      "type": "hung"
    }
  };
  function getChartPatterns(chart) {
    if (!chart) return [];
    const results = [];
    const seenMap = /* @__PURE__ */ new Map();
    const midIdx = chart.follow === 0 ? 1 : chart.round > 0 ? 7 : 1;
    const centerPalace = chart.box.flat().find((p) => p.index === 4);
    const centerEcs = centerPalace ? centerPalace.getECS(true) : [];
    chart.box.flat().forEach((palace) => {
      const pIdx = palace.index;
      if (pIdx === 4) return;
      if (!seenMap.has(pIdx)) seenMap.set(pIdx, /* @__PURE__ */ new Set());
      const palaceSeen = seenMap.get(pIdx);
      const hcs = palace.getHCS(true);
      let ecs = palace.getECS(true);
      if (pIdx === midIdx && centerEcs.length > 0) {
        ecs = [.../* @__PURE__ */ new Set([...ecs, ...centerEcs])];
      }
      if (hcs.length > 0 && ecs.length > 0) {
        hcs.forEach((h) => {
          ecs.forEach((e) => {
            const key = `${h}+${e}`;
            if (STEM_INTERACTIONS[key]) {
              const pat = STEM_INTERACTIONS[key];
              const normName = pat.name.toUpperCase().trim();
              if (!palaceSeen.has(normName)) {
                results.push({
                  id: "stem_inter_" + key,
                  name: pat.name,
                  desc: pat.desc,
                  type: pat.type,
                  palaceIndex: pIdx,
                  palaceName: ACQUIRED_ARR[pIdx],
                  isInteraction: true
                });
                palaceSeen.add(normName);
              }
            }
          });
        });
      }
      PATTERNS.forEach((pattern) => {
        if (pattern.id === "ngu_bat_ngo") return;
        if (pattern.check(palace)) {
          const normName = pattern.name.toUpperCase().trim();
          if (!palaceSeen.has(normName)) {
            results.push({
              ...pattern,
              palaceIndex: pIdx,
              palaceName: ACQUIRED_ARR[pIdx]
            });
            palaceSeen.add(normName);
          }
        }
      });
      if (palaceSeen.size === 0 && hcs.length > 0 && ecs.length > 0) {
        const h = hcs[0];
        const e = ecs[0];
        const key = `${h}+${e}`;
        const hVN = STEM_NAMES[h] || h;
        const eVN = STEM_NAMES[e] || e;
        const pairName = `T\u01B0\u01A1ng t\xE1c ${h}/${e}`;
        results.push({
          id: "stem_fallback_" + key,
          name: pairName,
          desc: `${h}/${e} (${hVN}/${eVN}) - Lu\u1EADn gi\u1EA3i t\u01B0\u01A1ng t\xE1c Thi\xEAn b\xE0n/\u0110\u1ECBa b\xE0n cho cung ${ACQUIRED_ARR[pIdx]}.`,
          type: "binh",
          palaceIndex: pIdx,
          palaceName: ACQUIRED_ARR[pIdx],
          isInteraction: true
        });
        palaceSeen.add(pairName.toUpperCase().trim());
      }
    });
    const dayStem = chart.date.cstb(true)[0];
    const hourStem = chart.hour.cstb(true)[0];
    if (isNguBatNgo(dayStem, hourStem)) {
      results.push({
        id: "ngu_bat_ngo",
        name: "Ng\u0169 B\u1EA5t Ng\u1ED9 Th\u1EDDi",
        desc: `${hourStem}/${dayStem} (${STEM_NAMES[hourStem] || hourStem}/${STEM_NAMES[dayStem] || dayStem}) - Can gi\u1EDD kh\u1EAFc Can ng\xE0y. C\u1EF1c hung, tr\u0103m vi\u1EC7c kh\xF4ng n\xEAn.`,
        palaceIndex: -1,
        // Global
        type: "hung"
      });
    }
    const ngamRes = checkPhucPhanNgam(chart);
    if (ngamRes.isPhuc) {
      let msg = [];
      if (ngamRes.details.isTinhPhuc) msg.push("Tinh Ph\u1EE5c Ng\xE2m");
      if (ngamRes.details.isMonPhuc) msg.push("M\xF4n Ph\u1EE5c Ng\xE2m");
      const specificName = msg.join(" / ");
      results.push({
        id: "phuc_ngam",
        name: "Ph\u1EE5c Ng\xE2m (" + specificName + ")",
        desc: specificName + ": Bi\u1EC3u th\u1ECB tr\u1EA1ng th\xE1i tr\xEC tr\u1EC7, b\u1EBF t\u1EAFc, \u0111\u1EE9ng y\xEAn. Tuy nhi\xEAn, trong c\xE1c vi\u1EC7c c\u1EA7n s\u1EF1 b\u1EC1n v\u1EEFng, l\xE2u d\xE0i th\xEC Ph\u1EE5c Ng\xE2m l\u1EA1i mang \xFD ngh\u0129a l\xE0 s\u1EF1 ch\u1EAFc ch\u1EAFn, t\u0129nh t\u1EA1i.",
        details: ngamRes.details,
        palaceIndex: -1,
        // Global
        type: "hung"
      });
    }
    if (ngamRes.isPhan) {
      let msg = [];
      if (ngamRes.details.isTinhPhan) msg.push("Tinh Ph\u1EA3n Ng\xE2m");
      if (ngamRes.details.isMonPhan) msg.push("M\xF4n Ph\u1EA3n Ng\xE2m");
      const specificName = msg.join(" / ");
      results.push({
        id: "phan_ngam",
        name: "Ph\u1EA3n Ng\xE2m (" + specificName + ")",
        desc: specificName + ": Bi\u1EC3u th\u1ECB s\u1EF1 bi\u1EBFn \u0111\u1ED9ng b\u1EA1o ph\xE1t, l\u1EB7p \u0111i l\u1EB7p l\u1EA1i ho\u1EB7c ph\u1EA3n tr\u1EAFc, d\u1EC5 quay l\u1EA1i tr\u1EA1ng th\xE1i \u0111\u1EA7u.",
        details: ngamRes.details,
        palaceIndex: -1,
        // Global
        type: "hung"
      });
    }
    return results;
  }
  function isNguBatNgo(day, hour) {
    const map = {
      "\u7532": "\u5E9A",
      // Mộc bị Kim khắc
      "\u4E59": "\u8F9B",
      "\u4E19": "\u58EC",
      // Hỏa bị Thủy khắc
      "\u4E01": "\u7678",
      "\u620A": "\u7532",
      // Thổ bị Mộc khắc
      "\u5DF1": "\u4E59",
      "\u5E9A": "\u4E19",
      // Kim bị Hỏa khắc
      "\u8F9B": "\u4E01",
      "\u58EC": "\u620A",
      // Thủy bị Thổ khắc
      "\u7678": "\u5DF1"
    };
    return map[day] === hour;
  }
  var ORIGINAL_DOORS = {
    "\u4F11\u95E8": 0,
    "\u6B7B\u95E8": 1,
    "\u4F24\u95E8": 2,
    "\u675C\u95E8": 3,
    "\u5F00\u95E8": 5,
    "\u60CA\u95E8": 6,
    "\u751F\u95E8": 7,
    "\u666F\u95E8": 8
  };
  var ORIGINAL_STARS = {
    "\u5929\u84EC\u661F": 0,
    "\u5929\u82AE\u661F": 1,
    "\u5929\u51B2\u661F": 2,
    "\u5929\u8F85\u661F": 3,
    "\u5929\u5FC3\u661F": 5,
    "\u5929\u67F1\u661F": 6,
    "\u5929\u4EFB\u661F": 7,
    "\u5929\u82F1\u661F": 8
  };
  var OPPOSITE_PALACES = {
    0: 8,
    1: 7,
    2: 6,
    3: 5,
    5: 3,
    6: 2,
    7: 1,
    8: 0
  };
  function checkPhucPhanNgam(chart) {
    let starPhuc = 0, doorPhuc = 0, starPhan = 0, doorPhan = 0;
    chart.box.flat().forEach((palace) => {
      if (palace.index === 4) return;
      const pIdx = palace.index;
      const door = palace.getDoor(true);
      let stars = palace.getStar(true);
      if (door) {
        const origIdx = ORIGINAL_DOORS[door];
        if (origIdx !== void 0) {
          if (origIdx === pIdx) doorPhuc++;
          if (OPPOSITE_PALACES[origIdx] === pIdx) doorPhan++;
        }
      }
      if (stars) {
        if (typeof stars === "string") stars = [stars];
        stars.forEach((star) => {
          if (star === "\u5929\u79BD\u661F") return;
          const origIdx = ORIGINAL_STARS[star];
          if (origIdx !== void 0) {
            if (origIdx === pIdx) starPhuc++;
            if (OPPOSITE_PALACES[origIdx] === pIdx) starPhan++;
          }
        });
      }
    });
    return {
      isPhuc: starPhuc >= 5 || doorPhuc >= 5,
      isPhan: starPhan >= 5 || doorPhan >= 5,
      details: {
        isTinhPhuc: starPhuc >= 5,
        isMonPhuc: doorPhuc >= 5,
        isTinhPhan: starPhan >= 5,
        isMonPhan: doorPhan >= 5
      }
    };
  }

  // <stdin>
  if (typeof window !== "undefined") {
    window.QMDJCore = {
      TheArtOfBecomingInvisible: TheArtOfBecomingInvisible_default,
      getChartPatterns
    };
  }
})();
