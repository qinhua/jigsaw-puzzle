/* eslint-disable no-undef, no-underscore-dangle, no-unused-vars, consistent-return, no-prototype-builtins */
(function (G, D) {
    /**
     * 验证
     * @param obj 待验证对象集合
     * @returns {boolean}
     */
    prmt.validate = function (obj) {
        var status = true;

        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var tempVal = $(obj[p].id).val().replace(/\s+/g, '');
                var isValid = tempVal.match(obj[p].regex);

                if (!isValid) {
                    prmt.lightPop(obj[p].error);
                    status = false;
                }
            }
        }

        return status;
    };

    /**
     * 弹出提示层
     */
    prmt.lightTimeOut = null;
    prmt.lightPop = function (msg, timer) {
        var $fixedTip = $('#j-fixedTip');

        if ($fixedTip.is(':visible')) {
            return;
        }

        if ($fixedTip.length > 0) {
            $fixedTip.find('.con').html(msg);
        } else {
            $('body').append('<div id="j-fixedTip" class="fixedTip"><div class="con">' + msg + '</div></div>');
            $fixedTip = $('#j-fixedTip');
        }

        $fixedTip.show();

        if (!timer || timer !== -1) {
            clearTimeout(prmt.lightTimeOut);
            prmt.lightTimeOut = setTimeout(function () {
                $fixedTip.hide();
            }, 2000);
        }
    };
    prmt.closeLightPop = function () {
        $('#j-fixedTip').hide();
    };

    /**
     * 显示和关闭弹窗
     */
    prmt.showPop = function (msg, cls, popHeight, closeCb) {
        var popStr = '<div id="pop" class="pop ' + (cls || '') + '">' +
            '<div class="pop-out">' +
            '<div class="pop-in fadeInUp">' +
            '<div style="max-height: ' + popHeight + 'px;" class="content ' + (popHeight ? 'overflow' : '') + '">' + msg + '</div>' +
            '<span class="js-closepop iconClose"><i>×</i></span>' +
            '</div>' +
            '</div>' +
            '</div>';

        $('body').append(popStr);
        var $pop = $('#pop');
        $pop.addClass('on');

        $(document).on('click', '#pop .js-closepop', function (e) {
            $pop.remove();
            closeCb && closeCb();
            e.stopPropagation();
        });
    };
    prmt.closePop = function () {
        $('#pop').remove();
    };

    /**
     * 将url参数转为对象
     * @returns {{}}
     */
    prmt.getURLParams = function () {
        var params = {};

        window.location.href.replace(/[#|?&]+([^=#|&]+)=([^#|&]*)/gi, function (m, key, value) {
            params[key] = decodeURIComponent(value);
        });

        return params;
    };

    /**
     * 简单数组排序
     * ([1,2,3,4,5,6,7,8,9]).sort(prmt.sortNumAray);
     * @param a
     * @param b
     * @returns {number}
     */
    prmt.sortNumAray = function (a, b) {
        return a - b;
    };

    /**
     * 简单数组随机排序
     * ([1,2,3,4,5,6,7,8,9]).sort(prmt.sortRandomAray);
     * @param a
     * @param b
     * @returns {number}
     */
    prmt.sortRandomAray = function (a, b) {
        return Math.random() > 0.5 ? -1 : 1;
    };

    /**
     * 生成随机数
     * @param start
     * @param end
     * @returns {number}
     */
    prmt.rdmNum = function (start, end) {
        return Math.floor(Math.random() * (end - start) + start);
    };

// localStorage处理
    prmt.store = {
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

// 生成guid
    prmt.guid = function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    };

    prmt.isInApp = function () {
        return !!window.navigator.userAgent.toLowerCase().match(/mucang/g);
    };
// 是否在微信里
    prmt.isWeixin = function () {
        return !!window.navigator.userAgent.toLowerCase().match(/micromessenger/g);
    };
    prmt.isWeibo = function () {
        return !!window.navigator.userAgent.toLowerCase().match(/weibo/g);
    };
    prmt.isQq = function () {
        return !!window.navigator.userAgent.toLowerCase().match(/qq/g);
    };

    prmt.screen = function () {
        return {
            width: screen.width,
            height: screen.height
        };
    };
    prmt.navigator = function () {
        return {
            appCodeName: navigator.appCodeName,
            appName: navigator.appName,
            appVersion: navigator.appVersion,
            browserLanguage: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            platform: navigator.platform,
            systemLanguage: navigator.systemLanguage,
            userAgent: navigator.userAgent,
            online: navigator.online,
            product: navigator.product,
            vendor: navigator.vendor
        };
    };
    // prmt.baseParas = function () {
    //     var paramsLocal = 'prmt-base-params';
    //     var bp = prmt.store.get(paramsLocal) || {};
    //     var urlParams = prmt.getURLParams();
    //
    //     if (urlParams._version) {
    //         for (var p in urlParams) {
    //             if (urlParams.hasOwnProperty(p)) {
    //                 bp[p] = decodeURIComponent(urlParams[p]);
    //             }
    //         }
    //
    //         prmt.store.set(paramsLocal, bp);
    //     }
    //
    //     return bp;
    // };
    //
    // prmt.baseParas();

    /**
     * 事件统计
     * @param title
     * @param event
     */
    prmt.logEvt = function (title, event) {
        var evt = (title || '') + (event ? '-' : '') + (event || '');

        _hmt && _hmt.push(['_trackEvent', evt, title || event]);
        window.mcShare.Statistic && window.mcShare.Statistic.event(evt);
    };

    /**
     * 微信授权
     * name值最好每个新项目都改个不同的名字
     */
    prmt.weixinAuth = function (success) {
        var USERINFO = {};
        var Storage = {
            name: "prmt." + (prmt.type || '') + ".authData",
            get: function () {
                var stora = window.localStorage.getItem(Storage.name);
                if (!stora) return undefined;
                stora = JSON.parse(stora);
                return stora;
            },
            set: function (val) {
                window.localStorage.setItem(Storage.name, JSON.stringify(val));
            }
        };

        var authData = Storage.get();
        if (authData && authData.openid.length > 6) {
            USERINFO = authData;
            success();
        } else {
            window.shareSdk.weixinAuth(function (obj) {
                USERINFO = obj;
                if (USERINFO && USERINFO.openid) {
                    Storage.set(obj);
                }
                success();
            });
        }
    };

    /**
     * 数据加载
     * @param url 接口地址
     * @param params 参数
     * @param cb callback
     */
    prmt.loadData = function (url, params, cb) {
        var mcUser = prmt.cookie('prmtonermb') || {};
        var authToken = mcUser.authToken || '';

        $.ajax({
            url: url,
            data: $.extend(params || '', {_r: sign(1), authToken: authToken}),
            dataType: 'jsonp',
            // dataType: 'json',
            success: function (data) {
                cb && cb(data)
            },
            error: function (err) {
                cb && cb()
            }
        });
    };

    /**
     * 倒计时
     */
    prmt.timer = function (target, end) {
        var init = function () {
            var $target = target;
            var now = new Date().getTime();

            if (end < now) {
                return;
            }

            var left = end - now;
            // 计算天数
            var day = Math.floor(left / 3600 / 24 / 1000);
            // 除去天数后所剩时间（毫秒）
            var hourMinSec = left - (day * 24 * 3600 * 1000);
            // 计算小时数
            var hour = Math.floor(hourMinSec / 3600 / 1000);
            // 除去天数、小时后所剩时间
            var minSec = hourMinSec - (hour * 3600 * 1000);
            // 计算分钟数
            var min = Math.floor(minSec / 60 / 1000);
            // 除去天数、小时、分钟后所剩时间
            var ms = minSec - (min * 60 * 1000);
            // 计算秒数
            var sec = Math.floor(ms / 1000);
            var dayHtml = $target.find('.day');
            var hourHtml = $target.find('.hour');
            var minHtml = $target.find('.min');
            var secHtml = $target.find('.sec');

            // 如果小时数小于10,在左侧补充一个 '0'，保证两位数，下同
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (min < 10) {
                min = '0' + min;
            }
            if (sec < 10) {
                sec = '0' + sec;
            }

            day === 0 ? dayHtml.text('0') : dayHtml.text(day);
            hourHtml.text(hour);
            minHtml.text(min);
            secHtml.text(sec);

            setTimeout(function () {
                init(end);
            }, 1000);
        };
        init(target);
    };

    /**
     * 生成随机报名数
     * @param timeInterval 时间间隔：如20，30等
     * @param storageName localStorage名称
     * @returns {number}
     */
    prmt.genSignUpNum = function (timeInterval, storageName) {
        var localTime = JSON.parse(localStorage.getItem(storageName));
        var tempTimeAray = new Date().getTime();

        var min = parseInt((new Date().getTime() - prmt.pubTime) / 6000);
        // 间隔timeRange分钟数更新一次数据
        var timeRange = timeInterval;
        // 生成一个随机数
        var ranNum = prmt.rdmNum(timeRange - 2, timeRange + 6);
        // 最终的数字
        var increase = 0;

        // 如果用户第二次进入页面：对比上次记录的时间和当前时间的差，如果大于随机数，则更新页面人数
        if (localTime) {
            var oldMin = parseInt((parseInt(localTime) - prmt.pubTime) / 6000);
            var newMin = parseInt((new Date().getTime() - parseInt(localTime)) / 6000);

            // 如果localStorage记录的时间早于pubTime，则重新修改loc
            if (oldMin < 0 || newMin < 0) {
                localStorage.setItem(storageName, JSON.stringify(tempTimeAray));
            }

            if (newMin > ranNum) {
                increase = parseInt(min / timeRange);
                localStorage.setItem(storageName, JSON.stringify(tempTimeAray));
            } else {
                increase = parseInt(oldMin / timeRange);
            }
        } else {
            increase = parseInt(min / timeRange);
            localStorage.setItem(storageName, JSON.stringify(tempTimeAray));
        }

        // 报名人数
        return increase;
    };

    /**
     * 定位
     * @param cb
     */
    prmt.initLocation = function (cb) {
        var storageName = 'prmtLocation';
        var localData = prmt.store.get(storageName);

        if (localData) {
            return cb && cb(localData);
        } else {
            $.ajax({
                type: 'GET',
                url: 'http://util.kakamobi.cn/h5/city-locate.htm',
                data: 'uuid=' + Math.random(),
                dataType: 'json',
                success: function (res) {
                    if (res.success) {
                        cb && cb(res.data);
                        prmt.store.set(storageName, res.data);
                    } else {
                        cb && cb(null);
                    }
                },
                error: function () {
                    cb && cb(null);
                }
            });
        }
    };

    /**
     * 渲染省份
     * @param provs 省份列表
     * @param cb
     */
    prmt.renderProvs = function (provs, cb) {
        var provsStr = '<option value="">省份</option>';

        if (provs && provs.length > 0) {
            // 拼接城市列表
            for (var j = 0, jLen = provs.length; j < jLen; j++) {
                var chckedStr = '';

                if (prmt.curProvince.code == provs[j].code) {
                    chckedStr = 'selected';
                }

                provsStr += '<option ' + chckedStr + ' value="' + provs[j].code + '">' + provs[j].name + '</option>';
            }
        }

        cb && cb(provsStr);
    };

    /**
     * 渲染城市
     * @param citys 城市列表
     * @param cb
     */
    prmt.renderCitys = function (citys, cb) {
        var citysStr = '<option value="">城市</option>';

        if (citys && citys.length > 0) {
            // 拼接城市列表
            for (var j = 0, jLen = citys.length; j < jLen; j++) {
                var chckedStr = '';

                if (prmt.curCity.code == citys[j].code) {
                    chckedStr = 'selected';
                }

                citysStr += '<option ' + chckedStr + ' value="' + citys[j].code + '">' + citys[j].name + '</option>';
            }
        }

        cb && cb(citysStr);
    };

    /**
     * 渲染经销商
     * @param dealers 经销商列表
     * @param cb
     */
    prmt.renderDealers = function (dealers, cb) {
        var dealersStr = '<option value="">经销商</option>';

        if (dealers && dealers.length > 0) {
            // 拼接城市列表
            for (var j = 0, jLen = dealers.length; j < jLen; j++) {
                dealersStr += '<option value="' + dealers[j].dealerId + '">' + dealers[j].dealerName + '</option>';
            }
        }

        cb && cb(dealersStr);
    };

    /**
     * 播放音频
     * @param audioSrc 音频地址
     */
    prmt.playAudio = function (audioSrc) {
        prmt.audio = document.createElement('audio');
        prmt.audio.src = audioSrc;
        prmt.audio.play();
    };

    /**
     * 音频关闭开启
     * @param ele 点击元素
     */
    prmt.clickAudio = function (ele) {
        $(ele).on('click', function () {
            var $this = $(this);

            if ($this.hasClass('off')) {
                $this.removeClass('off');
                prmt.audio.play();
            } else {
                $this.addClass('off');
                prmt.audio.pause();
            }
        });
    };

    /**
     * 抽奖 (依赖jquery rotate插件)
     * @param award 几等奖
     * @param degree 奖项所在的角度（从右往左算角度）
     * @param ele 奖项所在的转盘
     * @param cb callback
     */
    prmt.lotteryRunning = false;
    prmt.lottery = function (award, degree, ele, cb) {
        var $this = $(ele);

        prmt.lotteryRunning = true;
        $this.stopRotate();
        $this.rotate({
            angle: 0,
            animateTo: degree + 1440,
            duration: 6000,
            callback: function () {
                prmt.lotteryRunning = false;
                cb && cb(award);
            }
        });
    };

    /**
     * 获取url里的hash参数
     * @returns {{}}
     */
    prmt.getHash = function () {
        var hash = {};
        var HrefHasgParams = window.location.hash && window.location.hash.replace(/^\#/, '').split('&');

        for (var i = 0, len = HrefHasgParams.length; i < len; i++) {
            var sps = HrefHasgParams[i].split('=');
            hash[decodeURIComponent(sps[0])] = sps[1] ? decodeURIComponent(sps[1]) : '';
        }

        return hash;
    };

    /**
     * 获取authToken
     */
    prmt.getAuthToken = function () {
        var hash = prmt.getHash();
        var appinfo = JSON.parse((hash && hash._appinfo) || '{}');
        var urlParams = prmt.getURLParams();

        return urlParams.authToken || appinfo.authToken || (H5Utils && H5Utils.User && H5Utils.User.authToken) || '';
    };

    /**
     * 打开页面
     * @param url 地址
     * @param params 参数
     */
    prmt.open = function (url, params) {
        var urlParams = prmt.getURLParams();
        params = params ? $.extend(urlParams, params) : urlParams;
        var paramStr = $.param(params) || '';
        window.location = url + (paramStr ? '?' : '') + paramStr;
    };

    /**
     * 模拟console.log
     */
    prmt.log = function () {
        if (prmt.envir !== 'online') {
            console.log(arguments);
        }
    };

    // 显示qq群信息
    prmt.showQQGroupInfo = function () {
        var html = '<a href="https://jq.qq.com/?_wv=1027&k=41lG7OH"><img src="http://share.m.kakamobi.com/activity.kakamobi.com/common-resources/pop-qq-group.jpg"/></a>';

        prmt.showPop(html, 'pop-qqGroup');
    };

    // 分享
    prmt.setShare = function () {
        // 分享
        try {
            window.mcShare.shareWord(prmt.share.title, prmt.share, function (status) {
            });

            if (prmt.isWeixin()) {
                prmt.logEvt('微信打开');
            }

            if (prmt.isQq()) {
                prmt.logEvt('QQ打开');
            }
        } catch (e) {
            console.log(e);
        }
    };
})(window, document);