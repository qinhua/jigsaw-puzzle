/**
 * Created by 金橘柠檬 on 2016/3/14.
 */
var prmtCfg = {
    // 当前环境：无需手动修改
    envir: window.location.href.indexOf('http://192.168') !== -1 ? 'develop' : 'online',
    // api请求前缀：无需手动修改
    apiBegin: {develop: 'http://192.168.0.91:8090', online: 'http://partner-data.kakamobi.cn'},
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
};
var me = {
    isPosting: false, //重复提交标识
    postInit: function () {
        setTimeout(function () {
            me.isPosting = false;
        }, 1000)
    },
    config: {
        type: 309,
        testHost: "http://192.168.0.91:8080",
        mcHost: "http://shop.kakamobi.cn",
        partnerHost: "http://partner.data.kakamobi.cn/api/open/drive/submit-data/create.htm",
        registUrl: "http://m.jiakaobaodian.com/member/reg.html?name=tfmc&to=", //注册页面url
        loginUrl: "http://m.jiakaobaodian.com/member/login.html?name=tfmc&to=", //登录页面url
        logOutUrl: "http://m.jiakaobaodian.com/member/logout.html?name=tfmc&to=", //注销页面url
        mainUrl: "http://share.m.kakamobi.com/activity.kakamobi.com/special-sale/main.html", //主页url
        defaultUrl: "",
        carContent: [{
            "brandId": 7,
            "brandName": "保时捷",
            "serialId": 74,
            "serialName": "保时捷Cayenne",
            "carId": 29144,
            "carName": "2016款Cayenne 3.0T"
        }, {
            "brandId": 6,
            "brandName": "宝马(进口)",
            "serialId": 60,
            "serialName": "宝马X5",
            "carId": 30568,
            "carName": "2017款xDrive28i"
        }, {
            "brandId": 86,
            "brandName": "路虎(进口)",
            "serialId": 715,
            "serialName": "揽胜",
            "carId": 23132,
            "carName": "2016款3.0 TDV6 Hybrid Vogue SE 创世加长版"
        }]
    },
    //
    //me.checkStatus(function() {
    //    $(".loginbtn").text("注销"); //登陆状态下显示注销
    //    GetAll();
    //}, 0, false);
    /**
     * 获取木仓用户信息
     * me.checkStatus(function() {
     * 登陆状态下执行 >>
     * GetAll();
     * }, 0, false);
     */
    mcUser: {
        token: "",
        // 00.注册
        goRegist: function () {
            if (me.isInApp) {
                window.webview.user.register();
            } else {
                location.href = me.config.registUrl + encodeURIComponent(me.config.defaultUrl);
            }
        },
        // 01.登录
        goLogin: function (thePath, delay) {
            if (!delay) {
                if (me.isInApp) {
                    window.webview.user.login(thePath, function (data) {
                        window.location.reload()
                    });
                } else {
                    location.href = me.config.loginUrl + encodeURIComponent(thePath);
                }
            } else {
                setTimeout(function () {
                    if (me.isInApp) {
                        window.webview.user.login(thePath, function (data) {
                            window.location.reload()
                        });
                    } else {
                        location.href = me.config.loginUrl + encodeURIComponent(thePath);
                    }
                }, delay)
            }
        },
        // 02.注销
        goLogOut: function (callback, url) {
            if (me.isInApp) {
                window.webview.user.logout(url, function (data) {
                    window.location.reload()
                });
            } else {
                if (callback) {
                    callback();
                }
                location.href = me.config.logOutUrl + encodeURIComponent(url);
            }
        },
        // 03.获取用户信息（此处不跳转至登录页面）
        getToken: function () {
            return $.Deferred(function (def) {
                if (me.isInApp) {
                    var info = JSON.parse(window.webview.user.get());
                    //alert(typeof(info.success));
                    if (info.success === "true" || info.success === true) {
                        token = info.data.authToken;
                        me.curToken = token;
                    } else {
                        me.curToken = false;
                    }
                    def.resolve(token);
                } else {
                    $.ajax({
                        type: 'GET',
                        url: 'http://m.jiakaobaodian.com/api/auth/mucang/profile.htm',
                        data: 'uuid=' + Math.random(),
                        dataType: 'JSONP',
                        success: function (res) {
                            //若已登录，会返回用户信息，否则空
                            if (res.data != null) {
                                var userInfo = JSON.parse(res.data);
                                token = userInfo.authToken;
                                me.curToken = token;
                            }
                            //else {
                            //lg("web未登录");
                            //}
                            def.resolve(token);
                        }
                    });
                }
            });
        },
        // 登录/注销按钮
        switchStatus: function (ele, callback01, callback02) {
            $(ele).on("click", function () {
                if ($(this).text() === "注销") {
                    me.goLogOut(0, location.href);
                } else {
                    return me.checkStatus(function (token) {
                        if (callback02) {
                            callback02();
                        }
                    }, 1, false);
                }
            });
        },
        // 检测用户是否登录，如果没登录则跳至登录，
        checkStatus: function (isRedirect, callback01, callback02, delay, isTip) {
            me.getToken().then(function (token) {
                //alert(JSON.stringify(token));
                if (token) {
                    me.curToken = token;
                    isTip ? me.lightPop("您已登录！") : null;
                    if (callback01) {
                        callback01(token);
                    }
                } else {
                    if (isRedirect) {
                        if (delay) {
                            isTip ? me.lightPop("请先登录！") : null;
                        }
                        if (callback02) {
                            callback02(token);
                        }
                        me.goLogin(location.href, delay)
                    }
                }
            });
            return false;
        },
    },
    /**
     * 木仓app捆绑安装
     * @param btnEle
     * @param appConfig
     * @param isText
     */
    appConfigs: [{
        //买车宝典config
        appid: 5,
        ruleid: -302,
        packages: 'com.baojiazhijia.qichebaojia',
        appVersion: "2.4.4",
        appurl: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.baojiazhijia.qichebaojia'
    }, {
        // 汽车头条config
        appid: 1,
        ruleid: -10,
        packages: 'cn.mucang.android.qichetoutiao',
        appVersion: "3.0.1",
        appurl: 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.mucang.android.qichetoutiao'
    }],
    mcBundle: function (btnEle, appConfig, isText) {
        var $btnOperate = $(btnEle);
        //01必须在外部判断，设置flag标示
        if (me.isInApp) {
            //获取客户端数据
            var text = ['立即打开', '立即下载', '免下载，1秒安装'];
            var eventName = ['打开', '下载', '安装'];
            if (window.navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $btnOperate.attr("type", "立即体验");
            }
            var flag = false;
            try {
                window.webview.app.check([{
                    appId: appConfig.appid,
                    pkg: appConfig.packages,
                    version: appConfig.appVersion
                }], function (packlist) {
                    data = packlist.data[0];
                    $btnOperate.attr("type", text[data]);
                    isText ? $btnOperate.text(text[data]) : false;
                    flag = true;
                });
            } catch (e) {
            }
        }
        ;
        //02点击按钮进行判断
        $btnOperate.click(function () {
            //判断在app内部才调用mucang接口，不然会报错
            if (isInApp()) {
                //alert("app environment");
                //调用协议
                window.webview.moon.stat(appConfig.appid, appConfig.ruleid, 'show', false, function () {
                });
                if (flag) {
                    //alert("app installed");
                    if (data === 1) {
                        window.mcShare.Statistic.event('下载');
                    }
                    window.mcShare.Statistic.event(eventName[data]);
                    window.webview.app.install(appConfig.appid, appConfig.packages, appConfig.appurl, appConfig.appVersion, appConfig.ruleid, function (packlist) {
                    })
                } else {
                    //alert("ready to download");
                    window.mcShare.Statistic.event('下载');
                    if ($btnOperate.attr("type") === '立即下载') {
                        window.mcShare.Statistic.event('iOS下载');
                    } else {
                        window.mcShare.Statistic.event('其他下载');
                    }
                    location.href = appConfig.appurl;
                }
            } else {
                //alert("web environment");
                location.href = appConfig.appurl;
            }
        });
    },
    /**
     * 摇一摇
     * @param thresholds
     * @param direction
     * @param callback
     */
    shake: function (thresholds, direction, callback) {
        var threshold = thresholds;
        var last_update = 0,
            lastArr = [];
        var x = 0,
            y = 0,
            z = 0,
            last_x = 0,
            last_y = 0,
            last_z = 0;

        var deviceMotionHandler = function (eventData) {
            //eventData.cancelBubble();
            var acceleration = eventData.accelerationIncludingGravity;
            var curTime = new Date().getTime();
            if ((curTime - last_update) > 100) {
                var diffTime = curTime - last_update;
                last_update = curTime;
                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;

                if (speed > threshold) {
                    //alert("摇动了");
                    if (callback) {
                        delay ? setTimeout(function () {
                            callback();
                        }, delay) : callback();
                    }
                }
                // last_x = x;
                // last_y = y;
                // last_z = z;
                lastArr[x, y, z];
            }
        };
        //绑定摇动事件
        this.loadEvent = function () {
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', deviceMotionHandler, false);
            }
        };
        //移除摇动事件
        this.detachEvent = function () {
            window.removeEventListener('devicemotion');
        };
        this.getLastData = function () {
            return lastArr;
        };
    },

    attachClick: function () {
        $(function () {
            FastClick.attach(document.body);
        });
    },
    //表单验证
    chineseName: /^[\u4e00-\u9fa5]{2,4}$/,
    mobilePhone: /^(13|15|18|17)\d{9}$/,
    isHan: /^[\u4E00-\u9FA5]$/,
    isEnglish: /^[a-zA-Z]$/,
    hasHan: /[\u4E00-\u9FA5]/g,
    hasEnglish: /[a-zA-Z]/g,
    idNumber: /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,
    checkStr: function (str) {
        if (escape(str).indexOf("%u") != -1)
            alert("不能含有汉字");
        else if (str.match(/\D/) != null) {
            alert('不能含有字母');
        }
    },
    checkPhone: function (str) {
        str = str.trim();
        var isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
        var isMob = /^((\+?86)|(\(\+86\)))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
        return (isPhone.test(str) || isMob.test(str)) ? true : false;
    },
    /**
     * 混淆字符串
     * @param str 字符串
     * @param mixStr 混淆字符
     * @param start 起点
     * @param end 终点
     */

    mixStr: function (str, mixStr, start, end) {
        mixStr = mixStr || "***";
        return phone.replace(phone.slice(start, end), mixStr)
    },
    /**
     * 事件统计
     * @param adsName
     * @param pageName
     * @param eventName
     */
    statistic: function (adsName, pageName, eventName) {
        setTimeout(function () {
            window.mcShare.Statistic.event(adsName + "（" + pageName + "）-" + eventName);
            //_hmt.push([adsName, adsName + '-' + pageName + '-' + eventName]);
        }, 50)
    },
    /**
     * 分享配置
     * @param pyqTxt
     * @param titleTxt
     * @param descTxt
     * @param icon
     * @param link
     */
    shareConfig: function (pyqTxt, titleTxt, descTxt, icon, link) {
        setTimeout(function () {
            try {
                window.mcShare.shareWord(pyqTxt, {
                        title: titleTxt,
                        description: descTxt,
                        iconUrl: icon,
                        url: link
                    },
                    function (status) {
                    }
                );
            } catch (e) {
            }
        }, 20)
    },
    // location相关
    url: {
        prefix: location.protocol + "//",
        host: location.host,
        baseUrl: location.protocol + "//" + location.host + location.pathname,
        paramStr: location.search,
        hash: location.hash
    },

    /**
     * 将url参数转为对象
     * @returns {{}}
     */
    getURLParams: function () {
        var params = {};

        window.location.href.replace(/[#|?&]+([^=#|&]+)=([^#|&]*)/gi, function (m, key, value) {
            params[key] = decodeURIComponent(value);
        });
        return params;
    },
    /**
     * url编码
     * @param param
     * @param key
     * @param encode
     * @returns {string}
     */
    urlEncode: function (param, key, encode) {
        if (param == null) return '';
        var paramStr = '';
        var t = typeof(param);
        if (t == 'string' || t == 'number' || t == 'boolean') {
            paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
        } else {
            for (var i in param) {
                var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                paramStr += me.urlEncode(param[i], k, encode);
            }
        }
        return paramStr;
    },
    /**
     * url解码
     * @param url
     * @returns {string}
     */
    urlDecode: function (url) {
        return decodeURIComponent(url);
    },

    // 获取浏览历史
    getHistory: function (callback) {
        // window.addEventListener('popstate', function(e) {
        callback ? callback() : null;
        return history.state;
        // }, false)
    },
    // 不刷新改变url地址
    setUrl: function (params, title, page) {
        var currentState = history.state;
        window.history.pushState(params, title, page);
    },
    // 重置url地址
    resetUrl: function (title, page) {
        var currentState = history.state;
        window.history.replaceState(null, title, page);
    },

    /**
     * url跳转
     * @param url
     */
    jumpTo: function (url, time, params) {
        var param = params || window.search || "";
        if (time) {
            setTimeout(function () {
                location.href = url + param;
            }, time);
        } else {
            location.href = url + param;
        }
    },
    // 返回某一页
    pageBack: function (pageNum, isRefresh) {
        if (history.length > 1) {
            isRefresh ? self.location = document.referrer : null;
            pageNum ? history.go(pageNum) : history.go(-1);
        }
    },
    openWin: function (url, title, h, w, t, l, tool, menu, scro, resize, loc, sta) {
        window.open(url, title, "height=" + h + ", width=" + w + ", top=" + h + "t, left=" + l + "+,toolbar=" + tool + ", menubar=" + menu + ", scrollbars=scro" + ", resizable=resize" + ", location=loc" + ", status=" + sta);
    },
    mesAray: ['提交中，请稍等', '提交成功', '提交失败, 请稍后再试', '请勿重复提交', '获取失败！'],
    lightPop: function (msg, autoHide) {
        var lightTimeOut = null; //弹出提示层
        var $fixedTip = $('#j-fixedTip');
        $fixedTip.length > 0 ? $fixedTip.html(msg) : $('body').append('<div id="j-fixedTip" class="fixedTip">' + msg + '</div>');
        $fixedTip.show();
        clearTimeout(lightTimeOut);
        if (autoHide === -1) return;
        lightTimeOut = setTimeout(function () {
            $("#j-fixedTip").hide();
        }, 2000);
    },
    //lightPop: function (msg) {
    //    var fixedTip = document.querySelector('#j-fixedTip');
    //    var poper = document.createElement("div");
    //    poper.id = "j-fixedTip";
    //    poper.className = "fixedTip";
    //    poper.innerHTML = msg;
    //    fixedTip ? fixedTip.innerHTML = msg : document.body.appendChild(poper);
    //    document.querySelector('#j-fixedTip').style.display = "block";
    //    clearTimeout(lightTimeOut);
    //    lightTimeOut = setTimeout(function () {
    //        document.querySelector('#j-fixedTip').style.display = "none";
    //    }, 1800);
    //},
    // 获取定位
    pos: {
        // 页面加载获取定位
        getPos: function (cb) {
            var storageName = 'prmtLocation';
            var localData = me.locals.get(storageName);
            if (localData) {
                me.pos.userIp = localData.ip;
                me.pos.userProvCode = localData.provinceCode;
                me.pos.userProv = localData.provinceName;
                me.pos.userCityCode = localData.cityCode;
                me.pos.userCity = localData.cityName;
                cb ? cb(localData) : null;
            } else {
                $.ajax({
                    type: 'GET',
                    url: 'http://util.kakamobi.cn/h5/city-locate.htm',
                    data: 'uuid=' + Math.random(),
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            cb && cb(res.data);
                            me.locals.set(storageName, res.data);
                            me.pos.userIp = res.data.ip;
                            me.pos.userCity = res.data.cityName;
                            me.pos.userCityCode = res.data.cityCode;
                            me.pos.userProv = res.data.provinceName;
                            me.pos.userProvCode = res.data.provinceCode;
                        } else {
                            cb && cb(null);
                        }
                    },
                    error: function () {
                        cb && cb(null);
                    }
                });
            }
        },
        userIp: null,
        userCity: null,
        userProv: null,
        userCityCode: null,
        userProvCode: null,
        curProv: null,
        curCity: null,
        curProvCode: null,
        curCityCode: null
    },

    //获取用户设备信息/默认参数
    getInfo: {
        navi: function () {
            var navis = {
                appCodeName: navigator.appCodeName,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                browserLanguage: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                platform: navigator.platform,
                systemLanguage: navigator.systemLanguage,
                userAgent: navigator.userAgent,
                online: navigator.onLine,
                product: navigator.product,
                vendor: navigator.vendor
            };
            return navis;
        },
        scr: function () {
            var scrs = {
                width: screen.width,
                height: screen.height
            };
            return scrs;
        },
        storeBp: function () {
            var token = "bps" + me.config.type;
            if (!localStorage.getItem(token) || localStorage.getItem(token) === "{}") {
                localStorage.setItem(token, JSON.stringify(me.getURLParams()));
            }
        },
        baseParas: function (obj) {
            var bp = {};
            var token = "bps" + me.config.type;
            var urlParams = JSON.parse(localStorage.getItem(token));
            for (var p in urlParams) {
                if (urlParams.hasOwnProperty(p)) {
                    bp[p] = decodeURIComponent(urlParams[p]);
                }
            }
            return bp;
        }
    },
    //ajax请求
    ajaxs: function (type, url, data, callback01, callback02, callback03, callback04) {
        $.ajax({
            type: type, //请求方式
            url: url, //请求的url地址
            dataType: "json", //返回格式为json
            async: true, //请求是否异步，默认为异步
            data: data, //参数值
            beforeSend: function () {
                //请求前的处理
                callback01();
            },
            success: function (req) {
                //请求成功时处理
                callback02();
            },
            complete: function () {
                //请求完成的处理
                callback03();
            },
            error: function () {
                //请求出错处理
                callback04();
            }
        });
    },
    //判断手机横竖屏状态：   
    checkOrientation: function (callback01, callback02) {
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
            if (window.orientation === 180 || window.orientation === 0) {
                //alert('竖屏状态！');
                callback01();
            }
            if (window.orientation === 90 || window.orientation === -90) {
                //alert('横屏状态！');
                callback02();
            }
        }, false);
    },
    //强制禁用屏幕旋转
    lockOrientation: function () {
        $(document).ready(function () {
            function reorient(e) {
                var portrait = (window.orientation % 180 == 0);
                $("body > div").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");
            }

            window.onorientationchange = reorient;
            window.setTimeout(reorient, 0);
        })
    },
    /**
     * 验证码按钮
     * @param time
     * @param ele
     */
    verCodeBtn: function (time, ele) {
        var timer = null;
        var secs = parseInt(time) || 60;
        var btn = typeof ele !== "string" ? ele : $(ele);
        btn.addClass("disabled").prop("disabled", true);
        me.lightPop("已发送，注意查收短信！");
        !function beginCount() {
            if (secs >= 0) {
                btn.text(secs + 'S后再次获取');
                secs--;
            }
            timer = setTimeout(function () {
                beginCount();
                if (secs < 0) {
                    btn.removeClass("disabled").text('获取验证码').prop("disabled", false);
                    clearTimeout(timer);
                    return;
                }
            }, 1000);
        }();
        //静态版
        //btn.addClass("disabled").text('1分钟后再次获取').prop("disabled", true);
        //me.lightPop("已发送，注意查收短信！");
        //setTimeout(function () {
        //    btn.removeClass("disabled").text('获取验证码').prop("disabled", false);
        //}, secs * 1000);
    },
    /**
     * 显示/关闭弹窗
     */
    showPop: function (msg, cls, popHeight, closeCb) {
        var popStr = '<div id="pop" class="pop ' + (cls || '') + '">' +
            '<div class="pop-out"><div class="pop-in fadeInUp"><div' + (popHeight ? 'style="max-height: ' + popHeight + 'px;' : '') + 'class="content ' + (popHeight ? 'overflow' : '') + '">' + msg + '</div><span class="js-closepop iconClose"><i>×</i></span></div></div></div>';
        $('body').append(popStr);
        var $pop = $('#pop');
        $pop.addClass('on');

        $(document).on('click', '#pop .js-closepop', function (e) {
            $pop.remove();
            closeCb && closeCb();
            e.stopPropagation();
        });
    },
    closePop: function () {
        $('#pop').remove();
    },
    /**
     * 显示/关闭模态框
     * @param pop
     * @param mask
     * @constructor
     */
    AlertPop: function (pop, mask) {
        this.closeAlert = function () {
            pop.removeClass("alert-show");
            mask.fadeOut(100);
        };
        this.showAlert = function () {
            pop.addClass("alert-show");
            mask.fadeIn(100);
        };
    },
    //滑动到某处
    scroll: function (num, time) {
        var speed = (!time) ? 0 : time;
        $("body").animate({
            scrollTop: num
        }, speed);
    },
    /**
     * 返回顶部
     * @param trigger,触发元素
     */
    back2Top: function (trigger) {
        var clientH = document.documentElement.clientHeight;
        trigger = trigger || $("#top");
        document.addEventListener('scroll', function (e) {
            setTimeout(function () {
                e.preventDefault();
                var scrollTop = document.body.scrollTop;
                if (scrollTop + clientH > clientH + 300) {
                    //trigger.show();
                    trigger.addClass("roll-in");
                } else {
                    //trigger.hide();
                    trigger.removeClass("roll-in");
                }
            }, 100)
        }, false);
        trigger.click(function () {
            $("body").animate({
                scrollTop: 0
            }, 300);
        });
    },
    Arrs: {
        /**
         * 简单数组排序
         * @param a
         * @param b
         * @returns {number}
         */
        //01.简单数组正序排列
        sortNumAray: function (a, b) {
            if (a < b) {
                return -1; // a排在b的前面
            } else if (a > b) {
                return 1; // a排在b的后面
            } else {
                return 0; // a和b的位置保持不变
            }
        },
        //02.数组随机排序
        rndArr: function (arr) {
            return arr.sort(function () {
                return Math.random() > 0.5 ? -1 : 1;
            });
        },
        shuffle: function (arr) {
            for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        },
        //03.随机从数组中取出一项
        getRnm: function (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        },
        //04.数组去重
        uniqueArr: function (arr) {
            //排序数组，形成队列
            arr.sort(this.sortNumAray);
            //排序后，队尾向前对比，如果相同，删除队尾，依次类推
            function loop(Index) {
                if (Index >= 1) {
                    if (arr[Index] === arr[Index - 1]) {
                        arr.splice(Index, 1);
                    }
                    loop(Index - 1);
                }
            }

            loop(arr.length - 1);
            return arr;
        },
        // 05.拷贝数组
        copyArr: function (arr, start, end) {
            if (start) {
                return arr.slice(start || 0, end);
            } else {
                return arr.concat();
            }
        }
    },
    // 拷贝对象
    copyObj: function (obj, filter) {
        var b = {};
        for (var i in a) {
            if (filter) {
                if (obj.hasOwnProperty(filter)) {
                    b[i] = a[i];
                    delete b.filter;
                }
            }

            b[i] = a[i];
        }
        return b;
    },

    // 格式化json
    formateJson: function (json) {
        var i = 0,
            il = 0,
            tab = "    ",
            newJson = "",
            indentLevel = 0,
            inString = false,
            currentChar = null;

        for (i = 0, il = json.length; i < il; i += 1) {
            currentChar = json.charAt(i);

            switch (currentChar) {
                case '{':
                case '[':
                    if (!inString) {
                        newJson += currentChar + "\n" + repeat(tab, indentLevel + 1);
                        indentLevel += 1;
                    } else {
                        newJson += currentChar;
                    }
                    break;
                case '}':
                case ']':
                    if (!inString) {
                        indentLevel -= 1;
                        newJson += "\n" + repeat(tab, indentLevel) + currentChar;
                    } else {
                        newJson += currentChar;
                    }
                    break;
                case ',':
                    if (!inString) {
                        newJson += ",\n" + repeat(tab, indentLevel);
                    } else {
                        newJson += currentChar;
                    }
                    break;
                case ':':
                    if (!inString) {
                        newJson += ": ";
                    } else {
                        newJson += currentChar;
                    }
                    break;
                case ' ':
                case "\n":
                case "\t":
                    if (inString) {
                        newJson += currentChar;
                    }
                    break;
                case '"':
                    if (i > 0 && json.charAt(i - 1) !== '\\') {
                        inString = !inString;
                    }
                    newJson += currentChar;
                    break;
                default:
                    newJson += currentChar;
                    break;
            }
        }
        return newJson;
    },

    /**
     * 生成随机数
     * @param start
     * @param end
     * @returns {number}
     */
    Randoms: {
        //01.生成从1到任意值的数字
        rdm01: function (end) {
            return parseInt(Math.random() * end + 1)
        },
        //02.生成从任意值到任意值的数字
        rdm02: function (start, end) {
            return Math.floor(Math.random() * (end - start) + start);
        },

        //03.生成从任意值开始的指定个数字
        rdm03: function (start, lens) {
            var arr = [];
            //给原始数组rdnArr赋值
            for (var i = 0; i < lens; i++) {
                arr[i] = i + start;
            }
            arr.sort(function () {
                return 0.5 - Math.random();
            });
            return arr;
        },
        /**
         * 生成随机颜色
         * @returns {string}
         */
        rdmColor: function () {
            return "#" +
                (function (color) {
                    return (color += "0123456789abcdef" [Math.floor(Math.random() * 16)]) && (color.length == 6) ? color : arguments.callee(color);
                })("");
        }
    },

    // 生成guid
    guid: function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    },
    isNumber: function (nums) {
        return !isNaN(Number(nums));
    },
    /**
     *是否在app内部
     * @param clue
     * @returns {Array|{index: number, input: string}}
     */
    isOnline: navigator.onLine,
    isInApp: navigator.userAgent.toLowerCase().match(/mucang/i) ? true : false,
    isWeixin: !!window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i),
    isWeibo: !!window.navigator.userAgent.toLowerCase().match(/WeiBo/i),
    isQq: !!window.navigator.userAgent.toLowerCase().match(/QQ/i),
    isIos: (window.navigator.userAgent.toLowerCase().match(/iphone|ipad|ipod/i)) ? true : false,
    isAndroid: (window.navigator.userAgent.toLowerCase().match(/android/i)) ? true : false,
    isIosOrAndroid: (window.navigator.userAgent.toLowerCase().match(/iphone|ipad|ipod/i)) ? "ios" : (window.navigator.userAgent.toLowerCase().match(/android/i) ? "android" : "others"),
    //来自移动端还是PC端
    isFrom: function () {
        var userAgentInfo = navigator.userAgent;
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        var flag = false;
        var v = 0;
        var source = '';
        for (v; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = true;
                break;
            }
        }
        if (flag) {
            source = "mobile";
        } else {
            source = "web";
        }
        return source;
    },
    /**
     * 本地存储LocalStorage
     */
    locals: {
        set: function (name, data) {
            //if (typeof data === "object") {
            localStorage.setItem(name, JSON.stringify(data));
            //} else {
            //    localStorage.setItem(name, data);
            //}
        },
        //get: function (name, isObj) {
        //    var ld = localStorage.getItem(name);
        //    return isObj ? ((ld && ld !== "{}") ? JSON.parse(ld) : '') : ((ld && ld !== "{}") ? ld : "");
        //},
        get: function (name, isObj) {
            var ld = localStorage.getItem(name);
            return name ? JSON.parse(ld) : '';
        },
        remove: function (name) {
            localStorage.removeItem(name);
        },
        clear: function () {
            localStorage.clear();
        },
        //检查是否有指定字段
        check: function (name, callback01, callback02) {
            var vals = localStorage.getItem(name);
            if (!vals) {
                // 有记录              
                callback01 ? callback01() : null;
            } else {
                // 无记录
                callback02 ? callback02() : null;
            }
        }
    },
    /**
     * 本地存储SessionStorage
     */
    sessions: {
        set: function (name, data) {
            if (typeof data === "object") {
                sessionStorage.setItem(name, JSON.stringify(data));
            } else {
                sessionStorage.setItem(name, data);
            }
        },
        get: function (name, isObj) {
            var ld = sessionStorage.getItem(name);
            return isObj ? ((ld && ld !== "{}") ? JSON.parse(ld) : '') : ((ld && ld !== "{}") ? ld : "");
        },
        remove: function (name) {
            sessionStorage.removeItem(name);
        },
        clear: function () {
            sessionStorage.clear();
        },
        //检查是否有指定字段
        check: function (name, callback01, callback02) {
            var vals = sessionStorage.getItem(name);
            if (!vals) {
                // 有记录              
                callback01 ? callback01() : null;
            } else {
                // 无记录
                callback02 ? callback02() : null;
            }
        }
    },
    /**
     * 本地存储Cookies
     */
    cookies: {
        set: function (name, value, expireHours) {
            var cookieString;
            if (typeof value === "object") {
                cookieString = name + "=" + JSON.stringify(value);
            } else {
                cookieString = name + "=" + escape(value);
            }
            //判断是否设置过期时间
            if (expireHours > 0) {
                var date = new Date();
                date.setTime(date.getTime + expireHours * 3600 * 1000);
                cookieString = cookieString + "; expire=" + date.toGMTString();
            }
            document.cookie = cookieString;
        },
        get: function (name, isObj) {
            if (document.cookie.length > 0) {
                var c_start, c_end, lc = document.cookie;
                if (name && lc.indexOf("v2xss") === -1) {
                    c_start = lc.indexOf(name + "=");
                    if (c_start != -1) {
                        c_start = c_start + name.length + 1;
                        c_end = lc.indexOf(";", c_start);
                        if (c_end == -1) c_end = lc.length;
                        var llc = lc.substring(c_start, c_end);
                        return isObj ? ((llc && llc !== "{}") ? JSON.parse(llc) : '') : ((llc && llc !== "{}") || "");
                    }
                } else {
                    return unescape(lc);
                }
            }
            return ""
        },
        del: function (name) {
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = name + "=v2xss; expire=" + date.toGMTString();
        },
        //检查是否有指定cookie
        check: function (name, callback01, callback02) {
            var strs = me.cookies.get(name);
            if (strs != null && strs != "") {
                // 有记录
                console.log("存在记录为：" + name + "的cookie");
                callback01 ? callback01() : null;
            } else {
                // 无记录
                console.log("不存在记录为：" + name + "的cookie");
                callback02 ? callback02() : null;
            }
        }
    },

    /**
     * 微信授权
     * name值最好每个新项目都改个不同的名字
     */
    weixinAuth: function (success) {
        var USERINFO = {};
        var Storage = {
            name: "_html5.xxx.authData",
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
            window.mcShare.weixinAuthBase(function (obj) {
                USERINFO = obj;
                if (USERINFO && USERINFO.openid) {
                    Storage.set(obj);
                }
                success();
            });
        }
    },
    getWxOpenId: function () {
        window.mcShare.weixinAuth(function (info) {
            return (info && info.openid) ? info.openid : "";
        })
    },
    //时间戳转时间
    getLocalTime: function (nS) {
        return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    },
    //1476012477000 to 2016 19:27:57
    formatDate: function (now, isHans) {
        var data = new Date(now);
        var year = data.getFullYear();
        var month = data.getMonth() + 1;
        var date = data.getDate();
        var hour = data.getHours();
        var minute = data.getMinutes();
        var second = data.getSeconds();
        return isHans ? year + "年" + month + "月" + date + "日" + " " + hour + ":" + minute : year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    },
    //获取年-月-日
    getDates: function (timeDate) {
        var timeArr = [];
        var y = timeDate.getFullYear();
        var m = timeDate.getMonth() + 1;
        var d = timeDate.getDate();
        timeArr = [y, m, d];
        return timeArr;
    },

    /**
     * 比较当前时间和指定时间
     * @param d1
     * @returns {boolean}
     */
    compareCurrentDate: function (d1) {
        var timeNow = new Date().getTime();
        return timeNow > new Date(d1).getTime();
    },
    /**
     * 比较两个/多个日期大小,当前时间是否在某个范围内
     * @param d1
     * @param d2
     * @returns {boolean}
     */
    compareDate: function (d1, d2) {
        var timeA = new Date(d1.replace(/-/g, "\/"));
        var timeB = new Date(d2.replace(/-/g, "\/"));
        var timeNow = new Date();
        if (timeNow > timeA && timeNow < timeB) {
            //me.isProper = true;
            return true;
        }
        return false;
    },
    /**
     * 倒计时（距开始，距结束）
     * @param target 截止时间
     * @param box 时间容器
     * @param msd 毫秒数
     * @param obj 时分秒父级元素
     */
    //单个倒计时
    getRCount: function (target, box) {
        //console.log(arguments);//最好直接传入数字类型
        var t, d, h, m, s;
        //var $days = $(".days");
        //var $hours = $(".hours");
        //var $mins = $(".mins");
        //var $secs = $(".secs");
        //var $counter = $(".counter");
        var timer = null;
        var EndTime;
        var NowTime = new Date(); //标准时间格式'
        //判断传过来的是否是数字
        if (typeof target != "number") {
            if (target.indexOf("-") > -1) {
                target = target.replace(/-/g, '/'); //替换为斜杠以便兼容
                EndTime = new Date(target);
            } else {
                EndTime = new Date(parseInt(target));
            }
        } else {
            EndTime = new Date(target);
        }
        //console.log(EndTime, NowTime);

        var timeCon = document.getElementById(box);
        t = EndTime.getTime() - NowTime.getTime();
        d = Math.floor(t / 1000 / 60 / 60 / 24);
        h = Math.floor(t / 1000 / 60 / 60 % 24);
        m = Math.floor(t / 1000 / 60 % 60);
        s = Math.floor(t / 1000 % 60);
        h = h >= 10 ? h : '0' + h;
        m = m >= 10 ? m : '0' + m;
        s = s >= 10 ? s : '0' + s;
        if (t > 0) {
            timeCon.innerHTML = d + "天" + h + "小时" + m + "分" + s + "秒";
        } else if (t === 0) {
            timeCon.innerHTML = "正点";
        } else {
            //timeCon.innerHTML = "已过去" + Math.abs(d) + "天" + Math.abs(h) + "小时" + Math.abs(m) + "分" + Math.abs(s) + "秒";
            timeCon.innerHTML = "已结束";
            clearTimeout(timer);
            return; //此处记得使用return停止函数体
        }
        timer = setTimeout(function () {
            me.getRCount(target, box)
        }, 1000);
    },
    //传入毫秒数时
    getMsCount: function (msd) {
        //console.log(arguments);//最好直接传入数字类型
        var t, d, h, m, s;
        var $days = $(".days");
        var $hours = $(".hours");
        var $mins = $(".mins");
        var $secs = $(".secs");
        //var $counter = $(".counter");
        var timer;
        t = msd;
        d = Math.floor(t / 1000 / 60 / 60 / 24);
        h = Math.floor(t / 1000 / 60 / 60 % 24);
        m = Math.floor(t / 1000 / 60 % 60);
        s = Math.floor(t / 1000 % 60);
        h = h >= 10 ? h : '0' + h;
        m = m >= 10 ? m : '0' + m;
        s = s >= 10 ? s : '0' + s;
        if (t > 0) {
            //timeCon.innerHTML = d + "天" + h + "小时" + m + "分" + s + "秒";
            $days.text(d + "天");
            $hours.text(h);
            $mins.text(m);
            $secs.text(s);
        } else if (t === 0) {
            //timeCon.innerHTML = "正点";
        } else {
            //timeCon.innerHTML = "已过去" + Math.abs(d) + "天" + Math.abs(h) + "小时" + Math.abs(m) + "分" + Math.abs(s) + "秒";
            $(".right").hide();
            //过期一天后变为-预约下一期
            if (d < 0 && Math.abs(d) > 1) {
                $(".btn-operate").attr("data-text", "预约下期").text("预约下期");
            }
            //过期后变为-提交线索
            $(".btn-operate").attr("data-text", "提交线索");
            clearTimeout(timer);
            return; //一定要return才能停止
        }
        msd -= 1000;
        timer = setTimeout(function () {
            me.getMsCount(msd)
        }, 1000);
    },
    //一个页面多个倒计时
    getMRCount: function (target, obj) {
        //console.log(arguments);
        var t, d, h, m, s;
        var $days = obj.find(".days");
        var $hours = obj.find(".hours");
        var $mins = obj.find(".mins");
        var $secs = obj.find(".secs");
        //var $counter = $(".counter");
        var timer;
        var BeginTime, EndTime;
        var NowTime = new Date(); //标准时间格式'
        //BeginTime = new Date(start);
        //判断传过来的是否是数字
        if (typeof target != "number") {
            if (target.indexOf("-") > -1) {
                target = target.replace(/-/g, '/'); //替换为斜杠以便兼容
                EndTime = new Date(target);
            } else {
                EndTime = new Date(parseInt(target));
            }
        } else {
            EndTime = target;
        }
        t = EndTime - NowTime.getTime();
        d = Math.floor(t / 1000 / 60 / 60 / 24);
        h = Math.floor(t / 1000 / 60 / 60 % 24);
        m = Math.floor(t / 1000 / 60 % 60);
        s = Math.floor(t / 1000 % 60);
        h = h >= 10 ? h : '0' + h;
        m = m >= 10 ? m : '0' + m;
        s = s >= 10 ? s : '0' + s;
        if (t > 0) {
            //timeCon.innerHTML = d + "天" + h + "小时" + m + "分" + s + "秒";
            $days.text(d + "天");
            $hours.text(h);
            $mins.text(m);
            $secs.text(s);
        } else if (t === 0) {
            //timeCon.innerHTML = "正点";
        } else {
            //timeCon.innerHTML = "已过去" + Math.abs(d) + "天" + Math.abs(h) + "小时" + Math.abs(m) + "分" + Math.abs(s) + "秒";
            obj.html("已结束");
            clearTimeout(timer);
            return; //一定要return才能停止
        }
        timer = setTimeout(function () {
            me.get2Count(target, obj)
        }, 1000);
    },

    /**
     * 还剩多长时间+倒计时函数
     * @param 目标时间
     * @returns {*}
     */
    timePast: function (o) {
        var rules = /^[\d]{4}-[\d]{1,2}-[\d]{1,2}( [\d]{1,2}:[\d]{1,2}(:[\d]{1,2})?)?$/ig,
            str = '', //结果字符串
            conn, s;
        var result; //"-"分割结果
        var hans = ["天前", "小时前", "分钟前", "秒前"];
        var gaps = ""; //时间差
        if (!o.match(rules)) {
            alert('参数格式为"2012-01-01 01:01:01",\r其中[]内的内容可省略');
            return false;
        }
        var sec = (new Date(o.replace(/-/ig, '/')).getTime() - new Date().getTime()) / 1000;
        if (sec > 0) {
            conn = '还有';
        } else {
            conn = '已过去';
            sec *= -1;
        }
        s = {
            '天': sec / 24 / 3600,
            '小时': sec / 3600 % 24,
            '分': sec / 60 % 60,
            '秒': sec % 60
        };
        for (i in s) {
            //if (Math.floor(s[i]) > 0) str += Math.floor(s[i]) + i;
            if (Math.floor(s[i]) >= 0) str += Math.floor(s[i]) + "-";
        }
        if (Math.floor(sec) == 0) {
            str = '0秒';
        }
        //document.getElementById('show').innerHTML = '距离<u>' + o + '</u>' + conn + '<u>' + str + '</u>';

        //如需倒计时需开启倒计时
        //setTimeout(function () {
        //count_down(o)
        //}, 1000);
        //几天前/几小时前/几分钟前/几秒前
        result = str.slice(0, -1).split("-");
        for (var j = 0, len = result.length; j < len; j++) {
            if (result[j] != "0") {
                gaps = result[j] + hans[j];
                return gaps;
            }
        }
        //return result;
    },
    /**
     *
     * @param timeStamp
     * @returns {*}
     */
    niceTime: function (timeStamp) {
        var date = new Date(timeStamp);
        var now = new Date();

        var deltaTime = (now.getTime() - date.getTime()) / 1000;
        if (deltaTime < 60) {
            return '刚刚';
        } else if (deltaTime < 3600) {
            return parseInt(deltaTime / 60) + '分钟前';
        } else if (deltaTime < 3600 * 24) {
            return parseInt(deltaTime / 3600) + '小时前';
        }
        /*else if ( this.date(date) == this.date(now) ) {
         return this.date(date, 'HH:mm');
         } */
        else if (date.getFullYear() == now.getFullYear()) {
            return H5Utils.tools.date(timeStamp, 'MM-dd HH:mm');
        } else {
            return H5Utils.tools.date(timeStamp);
        }
    },

    /**
     * 简单验证码倒计时
     * @param obj
     * @param time
     */
    counter: function (obj, time) {
        var initTime = time;

        function timer() {
            if (initTime < 0) {
                obj.prop("disabled", false);
                obj.html("获取验证码");
                initTime = time;
            } else {
                obj.prop("disabled", true);
                obj.html("重新发送(" + initTime + ")");
                initTime--;
                setTimeout(timer, 1000);
            }
        }

        timer();
    },
    // 禁止滑动
    cancleScroll: function (obj) {
        //document.addEventListener('touchmove', function (e) {
        //    e.preventDefault();
        //    return false;
        //}, false);
        obj.on("touchmove", function (e) {
            e.preventDefault();
            return false;
        });
    },
    /**
     * 可编辑div聚焦并移到最后
     * @param that
     */
    selLast: function (that) {
        var range = document.createRange();
        var len = that.childNodes.length;
        range.setStart(that, len);
        range.setEnd(that, len);
        getSelection().addRange(range);
        that.focus();
    },
    //获取鼠标当前坐标
    mouseCoords: function (ev) {
        if (ev.pageX || ev.pageY) {
            return {
                x: ev.pageX,
                y: ev.pageY
            };
        }
        return {
            x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: ev.clientY + document.body.scrollTop - document.body.clientTop
        };
    },
    /**
     *
     * @param obj
     * @param styleName
     * @returns {*}
     */
    //获取样式值
    getStyle: function (obj, styleName) {
        return window.getComputedStyle(obj, null).styleName || obj.currentStyle.styleName
    },
    /**
     * 获取js对象长度
     * @param o
     * @returns {*}
     */
    getObjLen: function (o) {
        var t = typeof o;
        if (t == 'string') {
            return o.length;
        } else if (t == 'object') {
            var n = 0;
            for (var i in o) {
                n++;
            }
            return n;
        }
        return false;
    },
    /**
     * Changes XML to JSON
     * @param xml
     * @returns {{}}
     */
    xmlToJson: function (xml) {
        // Create the return object
        var obj = {};
        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].length) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(me.xmlToJson(item));
                }
            }
        }
        return obj;
    },
    /**
     * 延迟执行
     * @param func
     * @param time
     */
    timeOut: function (func, time) {
        setTimeout(func, time)
    },

    //------ 字符串操作
    //去除字符串空格
    trimStr: function (str, is_global) {
        var result;
        result = str.replace(/(^\s+)|(\s+$)/g, "");
        if (is_global) {
            result = result.replace(/\s/g, "");
        }
        return result;
    },
    //字符串中指定位置插入字符
    insertStr: function (str, flg, sn) {
        var newstr = "";
        for (var i = 0; i < str.length; i += sn) {
            var tmp = str.substring(i, i + sn);
            newstr += tmp + flg;
        }
        return newstr;
    },
    //删除指定位置的字符 x-删除的位置 num--删除字符的个数
    delStr: function (str, x, num) {
        return str.substring(0, x) + str.substring(x + num, str.length);
    },
    /**
     * 超过指定字数显示 “点点点”
     * @param str 字符
     * @param len 显示的字符个数
     * @returns {string|*}
     */
    ellipsis: function (str, len) {
        str = (typeof(str)) != "String" ? str + '' : str;
        if (str.length > len) {
            str = (str.substr(0, len) + "…")
        }
        return str;
    },

    //------ 数字操作
    //保留n位小数,(默认保留2位)
    toFixed: function (val, n) {
        var num = n || 2;
        val = typeof val != "Number" ? parseInt(val) : val;
        return (val / 10000).toFixed(num);
    },

    /**数字前面自动补充数字或字符
     * num--传入的数字，--需要补充的内容，n--需要的字符长度
     */
    prefixNum: function (num, pre, n) {
        return parseInt((Array(n).join(pre) + num).slice(-n));
    },
    /**
     * 数字格式转换成千分位分隔（1234567.00转换为1,234,567.00）
     *@param num
     */
    numToThousand: function (num, fixNum) {
        if ((num + "").trim() == "") {
            return "";
        }
        if (isNaN(num)) {
            return "";
        }
        if (fixNum) {
            num = num.toFixed(fixNum);
        }
        num = num + "";
        if (/^.*\..*$/.test(num)) {
            var pointIndex = num.lastIndexOf(".");
            var intPart = num.substring(0, pointIndex);
            var pointPart = num.substring(pointIndex + 1, num.length);
            intPart = intPart + "";
            var re = /(-?\d+)(\d{3})/
            while (re.test(intPart)) {
                intPart = intPart.replace(re, "$1,$2")
            }
            num = intPart + "." + pointPart;
        } else {
            num = num + "";
            var re = /(-?\d+)(\d{3})/
            while (re.test(num)) {
                num = num.replace(re, "$1,$2")
            }
        }
        return num;
    },
    /**
     * 千分位字符转换成数字格式（1,234,567.00转换为1234567.00）
     *@param val
     */
    thousandToNum: function (str) {
        var num = $.trim(str);
        var ss = num.toString();
        if (ss.length == 0) {
            return "0";
        }
        return ss.replace(/,/g, "");
    },
    /**
     *数字格式转换成大写中文
     * @param num
     * @returns {string}
     */
    numToChinese: function (num) {
        var AA = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖");
        var BB = new Array("", "拾", "百", "千", "万", "亿", "", "");
        var CC = new Array("角", "分", "");

        var a = ("" + num).replace(/(^0*)/g, "").split("."),
            k = 0,
            re = "";

        for (var i = a[0].length - 1; i >= 0; i--) {
            switch (k) {
                case 0:
                    re = BB[7] + re;
                    break;
                case 4:
                    if (!new RegExp("0{4}//d{" + (a[0].length - i - 1) + "}$").test(a[0]))
                        re = BB[4] + re;
                    break;
                case 8:
                    re = BB[5] + re;
                    BB[7] = BB[5];
                    k = 0;
                    break;
            }
            if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
            if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
            k++;
        }
        if (re.trim().length > 0) {
            re += "元";
        }
        if (a.length > 1) { //加上小数部分(如果有小数部分)
            re += BB[6];
            for (var i = 0; i < 2; i++) {
                re += AA[a[1].charAt(i)] + CC[i];
            }
            ;
        }

        return re;
    },

    /**
     * 移动端模拟hover
     * @param obj 对象
     * @param classFocus 高亮类名
     */
    mHover: function (obj, classFocus) {
        var curClass = obj.attr("class") || "";
        obj.on("touchstart", function (e) {
            e.preventDefault();
            obj.attr("class", curClass + "classFocus");
        })
        obj.on("touchend", function (e) {
            e.preventDefault();
            obj.attr("class", curClass);
        })
    },
    isOnlineEvt: function () {
        window.addEventListener('load', function () {
            var status = document.getElementById("status");

            function updateOnlineStatus(event) {
                var condition = navigator.onLine ? "online" : "offline";

                status.className = condition;
                status.innerHTML = condition.toUpperCase();

                log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; Status: " + condition);
            }

            window.addEventListener('online', updateOnlineStatus);
            window.addEventListener('offline', updateOnlineStatus);
        });
    },
    isArray: function (object) {
        return object instanceof Array;
    },
    isWindow: function (obj) {
        return obj != null && obj === obj.window;
    },
    isObject: function (obj) {
        return typeof obj === "object";
    },
    isEmptyObject: function (o) {
        for (var p in o) {
            if (p !== undefined) {
                return false;
            }
        }
        return true;
    },
    /**
     * 播放音频
     * @param audioSrc 音频地址
     * @param toggleEle 音乐开关元素（默认空,会持续检查音乐状态，若有开关，记得加上开关元素）
     * @param autoPlay 是否自动播放，默认自动
     * @param isCheckStatus 是否检查播放状态，默认检查
     */
    playAudio: function (audioSrc, toggleEle, autoPlay, isCheckStatus) {
        var mediaA = document.createElement('audio');
        mediaA.src = audioSrc;
        mediaA.id = "bgm";
        mediaA.setAttribute("loop", "true");
        document.body.appendChild(mediaA);
        autoPlay !== undefined && !autoPlay ? null : mediaA.setAttribute("autoplay", "true");
        isCheckStatus !== undefined && !isCheckStatus ? mediaA.play() : me.toggleSound("#" + mediaA.id, toggleEle);
    },

    /**
     * 音频关闭/开启
     * @param ele 音乐开关元素
     * @param audioEle 音乐元素
     */
    switchAudio: function (ele, audioEle) {
        var music = $(audioEle)[0]; //获取ID;
        $(ele).on('click', function () {
            var $this = $(this);
            if ($this.hasClass('off')) {
                $this.removeClass('off');
                music.play();
            } else {
                $this.addClass('off');
                music.pause();
            }
        });
    },
    /**
     * fix自动播放音频
     * @param audio 音乐元素
     * @param toggleEle 音乐开关元素
     */
    toggleSound: function (audio, toggleEle) {
        var music = $(audio)[0]; //获取ID
        if (music.paused) { //判读是否播放
            music.play();
            $(document).on("touchstart", function () {
                toggleEle ? ($(toggleEle).hasClass("off") ? null : music.play()) : music.play(); //若有开关就判断，没有就播放
            })
        }
    },
    //iScroll无法点击问题修复
    iScrollClick: function () {
        if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
        if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
        if (/Silk/i.test(navigator.userAgent)) return false;
        if (/Android/i.test(navigator.userAgent)) {
            var s = navigator.userAgent.substr(navigator.userAgent.indexOf('Android') + 8, 3);
            return parseFloat(s[0] + s[3]) < 44 ? false : true
        }
    },
    storeUser: function (key, obj) {
        me.locals.set(key, obj);
    },
    readUser: function (key, ele1, ele2) {
        var data = me.locals.get(key); //获取本地用户信息
        if (data !== null) {
            data = JSON.parse(data);
            $(ele1).val(data.n);
            $(ele2).val(data.p);
        }
    },
    //判断是否支持touch事件
    hasTouch: function () {
        var touchObj = {};
        touchObj.isSupportTouch = "ontouchend" in document ? true : false;
        touchObj.isEvent = touchObj.isSupportTouch ? "touchstart" : "click";
        return touchObj.isEvent;
    },
    //强制禁用整屏滚动
    switchScroll: function (status) {
        (status === -1) ? $("html,body").removeClass("disable-scroll") : $("html,body").addClass("disable-scroll");
    },
    //requestAnimationFrame动画
    theRaf: {
        activeRaf: function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                            callback(currTime + timeToCall);
                        },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id);
                    return;
                };
        }
    },

    //记录用户表单数据
    storeUser: function (key, obj) {
        me.locals.set(key, obj);
    },
    readUser: function (key, ele1, ele2) {
        var data = me.locals.get(key); //获取本地用户信息
        if (data !== null) {
            data = JSON.parse(data);
            $(ele1).val(data.n);
            $(ele2).val(data.p);
        }
    },
    // 图片加载出错时
    imgError: function (picEle, defaultSrc, callback) {
        $(picEle).on("error", function () {
            var $this = $(this);
            $this.onerror = null;
            defaultSrc ? $this.attr("src", defaultSrc) : $this.attr("src", 'http://avatar.csdn.net/1/E/E/1_qq_27080247.jpg');
            console.log('图片出错的时候调用默认的图片');
            callback ? callback() : null;
        })
    }
}
me.getInfo.storeBp();
me.pos.getPos(); //获取当前位置信息

// 时间格式化
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
// 判断闰年  
Date.prototype.isLeapYear = function () {
    return (0 == this.getYear() % 4 && ((this.getYear() % 100 != 0) || (this.getYear() % 400 == 0)));
}
// 扩展jquery（内滚动不影响外滚动）eq:$(ele).scrollUnique();
$.fn.scrollUnique = function () {
    return $(this).each(function () {
        var eventType = 'mousewheel';
        if (document.mozHidden !== undefined) {
            eventType = 'DOMMouseScroll';
        }
        $(this).on(eventType, function (event) {
            // 一些数据
            var scrollTop = this.scrollTop,
                scrollHeight = this.scrollHeight,
                height = this.clientHeight;

            var delta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : -(event.originalEvent.detail || 0);

            if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                // IE浏览器下滚动会跨越边界直接影响父级滚动，因此，临界时候手动边界滚动定位
                this.scrollTop = delta > 0 ? 0 : scrollHeight;
                // 向上滚 || 向下滚
                event.preventDefault();
            }
        });
    });
};
window.qin = me;


// //AMD定义
// "function" == typeof define ? define(['jquery'], function ($) {
//     window.me = me;
//     //me.getInfo.storeBp();
//     me.pos.getPos(); //获取当前位置信息
//     return me;
// }) : "undefined" != typeof exports ? module.exports = me : this.me = me, me.pos.getPos();
