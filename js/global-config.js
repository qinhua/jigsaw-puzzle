/**
 * Created by FWX on 2015/3/12.
 * 专题页面配置
 */
/* eslint-disable no-undef, no-underscore-dangle, no-unused-vars, consistent-return, no-prototype-builtins */
(function (G, D) {
    var prmtCfg = {
        // 当前环境：无需手动修改
        tmpEnvir: function(state){return state?'online':'develop'},
        envir: window.location.href.indexOf('http://192.168') !== -1 ? 'develop' : 'online',
        // api请求前缀：无需手动修改
        apiBegin: {develop: 'http://192.168.1.2:8082', online: 'partner-data.kakamobi.cn'},
        // post接口：无需手动修改
        apiEnd: {
            create: '/api/open/drive/submit-data/create.htm',
            /**
             * 获取验证码
             * typeId: 数字或referId
             * phone: 手机号
             */
            getSms: '/api/open/drive/submit-data/send-check-code.htm'
        }
        //prmtCfg.apiBegin[prmtCfg.envir]+prmtCfg.apiEnd.create
        //prmtCfg.apiBegin[prmtCfg.tmpEnvir(1)]+prmtCfg.apiEnd.create
    };

    /**
     * localStorage处理
     * @type {{get: get, set: set, del: del}}
     */
    prmtCfg.store = {
        get: function (name) {
            var val = localStorage.getItem(name);

            return val ? JSON.parse(val) : null;
        },
        set: function (name, obj) {
            localStorage.setItem(name, JSON.stringify(obj));
        },
        del: function (name) {
            localStorage.removeItem(name);
        }
    };

    /**
     * 获取url参数
     * @returns {{}}
     */
    prmtCfg.getURLParams = function () {
        var params = {};

        window.location.href.replace(/[#|?&]+([^=#|&]+)=([^#|&]*)/gi, function (m, key, value) {
            params[key] = decodeURIComponent(value);
        });

        return params;
    };

    // 记录和读取基础参数
    prmtCfg.baseParas = function () {
        var paramsLocal = 'prmt-base-params';
        var bp = prmtCfg.store.get(paramsLocal) || {};
        var urlParams = prmtCfg.getURLParams();
        var p;

        if (urlParams._version) {
            for (p in urlParams) {
                if (urlParams.hasOwnProperty(p)) {
                    bp[p] = decodeURIComponent(urlParams[p]);
                }
            }

            prmtCfg.store.set(paramsLocal, bp);
        }

        return bp;
    };

    // 根据不同环境选择不同api请求接口
    prmtCfg.api = {};

    for (var p in prmtCfg.apiEnd) {
        if (prmtCfg.apiEnd.hasOwnProperty(p)) {
            prmtCfg.api[p] = (prmtCfg.apiEnd[p].indexOf('http') === -1 ? prmtCfg.apiBegin[prmtCfg.envir] : '') + prmtCfg.apiEnd[p];
        }
    }

    prmtCfg.baseParas();
    G.prmtCfg = prmtCfg;
})(window, document);