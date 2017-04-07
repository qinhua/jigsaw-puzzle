/**
 * Created by 金橘柠檬 on 2017/3/7.
 */
$(function () {
    var $dom = $(document);
    var urlPara = me.getURLParams();
    var $btnStart = $(".btn-start");
    var $btnChallenge = $(".btn-challenge");
    //var hasTouch = me.hasTouch();
    //me.attachClick();
    //me.shareConfig();
    var $sec = $(".sec");
    var $dot = $(".dot");
    var $tickets = $(".tickets");
    var $btnRetry = $(".btn-retry");
    var $btnSubmit = $(".btn-submit");
    var initTime = 20;
    //游戏状态相关数据
    var curData = {
        init: false,
        isPuzzleOver: false,
        isWin: false
    };
    //动画入口
    //var pagesFn = {
    //    container: {
    //        In: function () {
    //        },
    //
    //        Out: function () {
    //        }
    //    }
    //};

    //全局swiper
    //var mySwiper = new Swiper('.swiper-container', {
    //    // Optional parameters
    //    //autoHeight: true,
    //    //scrollbar: '.wrap-scroll',
    //    initialSlide: 0,
    //    iOSEdgeSwipeDetection: true,
    //    //mousewheelControl: true,
    //    //touchAngle: 45,
    //    touchRatio: 1,
    //    onlyExternal: true, //此模式下不能手动滑动，只能用函数操作
    //    preventClicks: false,
    //    direction: 'horizontal',
    //    autoResize: true,
    //    grabCursor: true,
    //    onInit: function (swiper) {
    //        var $page = $(swiper.slides[0]).find('.container');
    //        $page.addClass('page-animate');
    //        // 进场
    //        setTimeout(function () {
    //            pagesFn.page1 && pagesFn.page1.In && pagesFn.page1.In($page, 0, swiper);
    //        }, 1);
    //    },
    //    onSlideChangeEnd: function (swiper) {
    //        var index = swiper.activeIndex;
    //        var prevIndex = swiper.previousIndex;
    //        var $page = $(swiper.slides[index]).find('.container');
    //        var $pages = $('.container');
    //        $pages.removeClass('page-animate');
    //        $page.addClass('page-animate');
    //        var currentPageFn = pagesFn['page' + (index + 1)] || {};
    //        var prevPageFn = pagesFn['page' + (prevIndex + 1)] || {};
    //        // 进场
    //        currentPageFn.In && currentPageFn.In($page, index, swiper);
    //
    //        // 出场
    //        prevPageFn.Out && prevPageFn.Out($page, index, swiper);
    //    }
    //});

    var mySwiper01 = new Swiper('.swiper-container.gallery', {
        // Optional parameters
        initialSlide: 0,
        iOSEdgeSwipeDetection: true,
        touchRatio: 1,
        direction: 'horizontal',
        autoResize: true,
        grabCursor: true,
        preloadImages: true,
        updateOnImagesReady: true,
        observer: true,
        observeParents: true,
        //autoplay : 2500,
        //slidesPerView: 3,
        //centeredSlides: true,
        //slidesOffsetBefore : 50,
        //slidesOffsetAfter : 50,
        spaceBetween: 20,
        nextButton: '.gallery .swiper-button-next',
        prevButton: '.gallery .swiper-button-prev',
        pagination: '.gallery .swiper-pagination',
        uniqueNavElements: true,
        //paginationClickable: true,
        //onInit: function (swiper) {
        //},
        //onSlideChangeEnd: function (swiper) {
        //    var index = swiper.activeIndex;
        //    var prevIndex = swiper.previousIndex;
        //}
    });

    //判断是否答完答答对
    var jumpTo = function () {
        if (curData.init) {
            if (curData.isWin) {
                //me.lightPop("可喜可贺！");
                $tickets.removeClass("none");
                $btnRetry.addClass("none");
                $btnSubmit.text("领取门票");
                $(".page04 .title").attr("class", "title suc");
            } else {
                //me.lightPop("游戏结束！");
                $tickets.addClass("none");
                $btnRetry.removeClass("none");
                $btnSubmit.text("提交信息");
                $(".page04 .title").attr("class", "title fail");
            }
            setTimeout(function () {
                $(".page03").removeClass("on");
                $(".page04").addClass("on");
            }, 300)
        } else {
            me.lightPop("至少玩一下呀！")
        }
    }

    //随机生成拼图并开始计时
    var generatePuzzle = function (curImgIndex) {
        curData.index = curImgIndex;
        //倒计时
        //var timer = function (obj) {
        //    if (initTime < 0) {
        //        initTime = 20;
        //        $dot.removeClass("time-dot");
        //        //gameOver2();
        //        //me.showPop('<div class="center">已超时！请重新开始</div>');
        //    } else {
        //        if (initTime >= 0 && initTime < 10) {
        //            initTime = '0' + initTime;
        //        }
        //        obj.html(initTime);
        //        initTime--;
        //        setTimeout(function () {
        //            timer ? timer(obj) : null
        //        }, 1000);
        //    }
        //    //if ($(".page03").hasClass("on") && parseInt($sec.html()) === 5) {
        //    //    me.lightPop("快快快^_^");
        //    //}
        //};
        var doc = document;
        var canvas = doc.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var $gameBox = $('#sudoku');
        var $lis = $gameBox.find('li');
        var image = new Image();
        var oriArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var imgArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        var App = {
            timeHandle: null,
            isComplete: false,
            level: 0,
            levels: [
                {time: initTime, image: "img/c" + curImgIndex + ".jpg"},
                //{time: "40.00", image: "img/tuzi.jpg"},
                //{time: "30.00", image: "together.jpg"}
            ],
            bind: function () {
                $('body').on('touchmove', function (e) {
                    e.preventDefault();
                });
                $lis.on('swipeLeft', function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var index = $this.index();
                    var html = $this.html();
                    var $prev = $this.prev();
                    if ($.inArray(index, [3, 6]) > -1 || $prev.size() <= 0) {
                        return false;
                    }
                    $this.html($prev.html());
                    $prev.html(html);
                    App.check();
                });
                $lis.on('swipeRight', function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var index = $this.index();
                    var html = $this.html();
                    var $next = $this.next();
                    if ($.inArray(index, [2, 5]) > -1 || $next.size() <= 0) {
                        return false;
                    }
                    $this.html($next.html());
                    $next.html(html);
                    App.check();
                });
                $lis.on('swipeUp', function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var html = $this.html();
                    var index = $this.index() - 3;
                    var $up = $lis.eq(index);
                    if (index >= 0 && $up.size() > 0) {
                        $this.html($up.html());
                        $up.html(html);
                        App.check();
                    }
                });
                $lis.on('swipeDown', function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var html = $this.html();
                    var index = $this.index() + 3;
                    var $down = $lis.eq(index);
                    if (index < 9 && $down.size() > 0) {
                        $this.html($down.html());
                        $down.html(html);
                        App.check();
                    }
                });
                $('#start').on('tap', function () {
                    //$('#reset').prop('disabled', false);
                    curData.init = true;
                    $('#reset').addClass("show");
                    $dot.addClass("time-dot");
                    //再来一次的时候 顺序不变哦
                    if ($(this).html() !== '再来一次') {
                        App.randomImage(true);
                    } else {
                        App.randomImage();
                    }
                    App.resetData();
                    App.countdown();
                    $('#layer').hide();
                });
                $('#reset').on('tap', function () {
                    App.resetData();
                    App.countdown();
                    App.randomImage(true);
                });
                //最后的再玩一次按钮
                $btnRetry.on('click', function () {
                    //$('#reset').removeClass("show");
                    //$('#layer').show();
                    //clearInterval(this.timeHandle);
                    //generatePuzzle(curData.index);
                    //curData.init = false;
                    //curData.isPuzzleOver = false;
                    //curData.isWin = false;
                    $(".page04").removeClass("on");
                    $(".page03").addClass("on");
                    App.resetData();
                    App.countdown();
                    App.randomImage(true);
                });
            },
            countdown: function () {
                clearInterval(this.timeHandle);
                this.timeHandle = setInterval(function () {
                    var $time = $('#timing');
                    var time = parseFloat($time.text());
                    var currTime = (time - 0.01).toFixed(2);
                    //var time = $time.text();
                    //var currTime = time - 1;

                    if (currTime < 1) {
                        clearInterval(App.timeHandle);
                        $time.text(parseInt(currTime).toFixed(2));
                        $sec.text(parseInt(currTime));
                        App.update();
                    } else {
                        $time.text(currTime);
                        currTime < 10 ? $sec.text('0' + parseInt(currTime)) : $sec.text(parseInt(currTime));
                    }
                }, 10);
            },
            resetData: function () {
                var time = this.levels[this.level].time;
                $('#timing').text(time);
                $('#time').text(time);
                $sec.text(time);
                $('#level').text(this.level + 1);
                $('#levels').text(this.levels.length);
                curData.init = false;
                curData.isPuzzleOver = false;
                curData.isWin = false;
            },
            init: function () {
                $('#reset').prop('disabled', true);
                this.resetData();
                $sec.text(initTime < 10 ? '0' + initTime : initTime);
                imgArr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                this.render();
            },
            render: function () {
                image.onload = function () {
                    App.randomImage();
                }
                image.src = this.levels[this.level].image;
            },
            randomImage: function (flag) {
                flag = flag || false;
                if (flag) {
                    imgArr.sort(function (a, b) {
                        return Math.random() - Math.random();
                    });
                }
                var index = 1;
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        ctx.drawImage(image, 100 * j, 100 * i, 100, 100, 0, 0, 300, 300);
                        $lis.eq(imgArr[index - 1] - 1).find('img').attr({
                            'data-seq': index,
                            'src': canvas.toDataURL('image/jpeg')
                        });
                        index++;
                    }
                }
            },
            check: function () {
                var resArr = [];
                curData.init = true;
                $('#sudoku img').each(function (k, v) {
                    resArr.push(v.getAttribute("data-seq"));
                });
                //console.log(resArr,oriArr)
                if (resArr.join("") === oriArr.join("")) {
                    setTimeout(function () {
                        //App.isComplete = true;
                        window.clearInterval(App.timeHandle);
                        if (App.level >= App.levels.length - 1) {
                            curData.isPuzzleOver = true;
                            curData.isWin = true;
                            jumpTo();
                            //alert("哇塞,你居然通关了,好棒!");
                            //App.destory();
                        } else {
                            curData.isPuzzleOver = true;
                            curData.isWin = true;
                            jumpTo();
                            //if (confirm("恭喜过关,是否继续挑战?")) {
                            //App.level++;
                            //$('#layer').show();
                            //App.init();
                            //}
                        }
                    }, 300);
                }
            },
            update: function () {
                if (this.isComplete === false) {
                    //alert("时间到,游戏结束!");
                    //$('#layer').show();
                    //$('#start').html("再来一次");
                    //$('#reset').prop('disabled', true);
                    curData.isPuzzleOver = true;
                    curData.isWin = false;
                    jumpTo();
                }
            },
            destory: function () {
                $('#reset').prop('disabled', true);
                $lis.off("swipeLeft");
                $lis.off("swipeRight");
                $lis.off("swipeUp");
                $lis.off("swipeDown");
                $lis.css('border', 0);
                $gameBox.css('border', 0);
            },
            start: function () {
                this.init();
                this.render();
                this.bind();
            },
        };
        App.start();
    }

    $btnStart.click(function () {
        //mySwiper.slideNext();
        $(".page01").removeClass("on");
        $(".page02").addClass("on");
        me.statistic("竞速拼车-赢门票", "首页", "开始挑战");
    });

    $(".gallery .swiper-slide").click(function () {
        var $this = $(this);
        var curIndex = $this.index();
        console.log(curIndex)
        switch (curIndex) {
            case 0:
                me.lightPop("您选中的是：保时捷Cayenne");
                break;
            case 1:
                me.lightPop("您选中的是：宝马X5");
                break;
            case 2:
                me.lightPop("您选中的是：路虎揽胜");
                break;
        }
        curData.index = curIndex;
        curData.carData = me.config.carContent[curIndex];
        console.log(curData);
        $this.addClass("sel").siblings(".swiper-slide").removeClass("sel");
    })

    $btnChallenge.click(function () {
        //mySwiper.slideNext();
        if (curData && curData.index !== undefined) {
            $(".page02").removeClass("on");
            $(".page03").addClass("on");
            generatePuzzle(curData.index + 1);
        } else {
            me.lightPop("请先选择车型^_^");
        }
        me.statistic("竞速拼车-赢门票", "选车页", "我要挑战");
    });

    //我拼好了按钮
    $dom.on("click", ".btn-ok", function () {
        me.statistic("竞速拼车-赢门票", "拼图页", "我拼好了");
        jumpTo();
    });

    /**
     * 验证
     */
    $("#get-code").click(function () {
        var phone = $("#userPhone").val();
        if (me.mobilePhone.test(phone)) {
            $.ajax({
                type: 'POST',
                url: 'http://partner.data.kakamobi.cn/api/open/drive/proxy/send-check-code.htm',
                data: {
                    _r: sign(1),
                    refererId: "7aef293bd229405380f0e085e9a01f09",
                    phone: phone
                },
                success: function (res) {
                    //if (res.success) {
                    $(".get-code").addClass("disabled").text('1分钟后重新发送').prop("disabled", true);
                    me.lightPop("已发送，注意查收短信！");
                    me.sid = res.data;
                    setTimeout(function () {
                        $(".get-code").removeClass("disabled").text('获取验证码').prop("disabled", false);
                    }, 60000);
                    //} else {
                    //}
                },
                error: function () {
                    me.lightPop("获取失败，稍后再试");
                }
            });
        } else {
            me.lightPop("请输入正确的手机号！");
        }
    });

    function Validation(n, p) {
        if (!me.chineseName.test(n)) {
            me.lightPop("姓名请输入2到6个字！");
            return false;
        }
        //var sexval = $('input:radio[name="gender"]:checked').val();
        //if (sexval == null) {
        //    me.lightPop("请选择性别!");
        //    return false;
        //}

        if (p == '') {
            me.lightPop("请输入您的手机号！");
            return false;
        }
        if (!me.mobilePhone.test(p)) {
            me.lightPop("您输入的手机号有误！");
            return false;
        }
        //if ($("#ver-code").val() == '') {
        //    me.lightPop('请输入验证码');
        //    return false;
        //}
        if (!$("#agree").prop("checked")) {
            me.lightPop("请勾选同意！");
            return false;
        }
        return true;
    }

    //------------------ 提交 ---------------
    $dom.on("click", ".btn-submit", function (e) {
        var name = $("#userName").val(), phone = $("#userPhone").val();
        if (Validation(name, phone)) {
            me.statistic("竞速拼车-赢门票", "集客页", "提交数据");
            //检测重复提交
            if (me.isPosting) {
                me.lightPop(me.mesAray[3]);
                return;
            }
            //selfData为提交到自己服务器的数据，clientData为提交到客户的数据
            var selfData = {
                _r: sign(1),
                type: me.config.type,
                cityCode: urlPara._gpsCity || urlPara._userCity || urlPara._cityCode || urlPara._ipCity || (me.pos.userCityCode ? me.pos.userCityCode : '110000'),
                userName: name,
                userPhone: phone,
                provinceName: me.pos.userProv || 420000,
                cityName: me.pos.userCity || 420100
            }
            var others = {
                screen: me.getInfo.scr(),
                navigator: me.getInfo.navi(),
                baseparam: me.getInfo.baseParas(),
                carId: curData.carData.carId,
                carName: curData.carData.serialName + curData.carData.carName
            };
            selfData.content = JSON.stringify(others);
            selfData.carContent = JSON.stringify([curData.carData]);

            /**提交到自己服务器*/
            $.ajax({
                type: 'POST',
                //url: prmtCfg.apiBegin[prmtCfg.envir] + prmtCfg.apiEnd.create,
                url: prmtCfg.apiBegin['online'] + prmtCfg.apiEnd.create,
                data: selfData,
                beforeSend: function () {
                    me.isPosting = true;
                    me.lightPop(me.mesAray[0], -1);
                },
                success: function (res) {
                    if (res.success) {
                        me.lightPop(curData.isWin ? "恭喜您！领取成功！" : "提交成功"); //最终提交成功
                        //提交成功后清空用户名和手机号
                        //if (me.envir === 'online') {
                        $("input").val("");
                        //}
                    } else {
                        me.lightPop(me.mesAray[2]);
                    }
                    me.isPosting = false;
                },
                error: function () {
                    me.isPosting = false;
                    me.lightPop(me.mesAray[2]);
                }
            });
        }
    });
});