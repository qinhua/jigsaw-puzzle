!function (e) {
    e.webview = e.webview || {}, e.webview.debug = !1, e.webview.callbacks = {}, e.webview.core = {
        async: function (e, a, c) {
            return n(e, a, c, !0)
        }, execute: function (e, a, c) {
            return n(e, a, c, !1)
        }
    };
    var n = function (n, t, w, f) {
        var s = u(n, t, w), v = o(w), d = r(w), g = i(w);
        switch (c()) {
            case"iphone":
                return b(s, v, d, f, g);
            case"android":
                return l(s, v, d, f, g);
            default:
                e.webview.debug || a(n, t, v, s)
        }
        e.webview.debug && a(n, t, v, s)
    }, a = function (e, n, a, c) {
        console.log("[" + e + "." + n + "]\n\n" + c + "\n\n" + (a && c + "?" + a) + "\n\n" + decodeURIComponent(a) + "\n\n")
    }, c = function () {
        for (var n = e.navigator.userAgent.toLocaleLowerCase(), a = ["iphone", "android", "windows", "mac"], c = 0; c < a.length; c++)if (n.indexOf(a[c]) > -1)return a[c];
        return "other"
    }, i = function (e) {
        if (e)for (var n in e)if ("callbackName" === n)return e[n];
        return null
    }, r = function (e) {
        if (e)for (var n in e)if ("callback" === n)return e[n];
        return null
    }, t = function (e) {
        var n = [];
        for (var a in e) {
            var c = typeof e[a];
            n.push("string" === c || "number" === c ? a + "=" + encodeURIComponent(e[a]) : a + "=" + encodeURIComponent(JSON.stringify(e[a])))
        }
        return n
    }, o = function (e) {
        var n = [];
        if (e) {
            for (var a in e)switch (a) {
                case"config":
                    n = n.concat(t(e[a]));
                    break;
                case"callback":
                case"callbackName":
                    break;
                default:
                    n.push("object" == typeof e[a] ? a + "=" + encodeURIComponent(JSON.stringify(e[a])) : a + "=" + encodeURIComponent(e[a]))
            }
            return n.join("&")
        }
        return ""
    }, u = function (e, n) {
        return "mc-web://" + e + "/" + n
    }, b = function (n, a, c, i, r) {
        if (i)return e.getMucangIOSWebViewData(n + "?" + a, w(c, r));
        var t = e.getMucangIOSWebViewData(n + "?" + a);
        return t
    }, l = function (n, a, c, i, r) {
        return i ? e.mcAndroidWebview1.getMucangWebViewData(n + "?" + a, w(c, r)) : e.mcAndroidWebview1.getMucangWebViewData(n + "?" + a)
    }, w = function (n, a) {
        return a ? e.webview.callbacks[a] = function () {
            n && n.apply(n, arguments)
        } : (a = "webviewCallback_" + Math.random().toString(32).substring(2), e.webview.callbacks[a] = function () {
            n && n.apply(n, arguments), delete e.webview.callbacks[a]
        }), a
    };
    !function () {
        switch (c()) {
            case"android":
                var n = function () {
                    var n = JSON.parse(e.mcAndroidWebview2.getMucangWebViewCallbackData());
                    e.webview.callbacks[n.callback] && e.webview.callbacks[n.callback](JSON.parse(n.data))
                };
                e.addEventListener("online", n, !1), e.addEventListener("offline", n, !1);
                break;
            case"iphone":
                e.mucangIOSWebViewCallback = function (n, a) {
                    e.webview.callbacks[n] && e.webview.callbacks[n](JSON.parse(a))
                }
        }
    }()
}(window, void 0);
!function (e, n) {
    e.webview = e.webview || {}, e.webview.web = {
        open: function (n, t) {
            return e.webview.core.execute("web", "open", {url: n, config: t})
        }, setting: function (n) {
            return e.webview.core.execute("web", "setting", {config: n})
        }, back: function () {
            return e.webview.core.execute("web", "back")
        }, close: function () {
            return e.webview.core.execute("web", "close")
        }, menu: function () {
            return e.webview.core.execute("web", "menu")
        }
    }, e.webview.share = {
        open: function (n) {
            return e.webview.core.execute("share", "open", {channel: n})
        }, setting: function (n) {
            return e.webview.core.execute("share", "setting", {config: n})
        }
    }, e.webview.app = {
        install: function (n, t, c, r, o) {
            return e.webview.core.async("app", "install", {
                appId: n, pkg: t, url: c, version: r, callback: function (e) {
                    o && o(e)
                }
            })
        }, check: function (n, t) {
            return e.webview.core.async("app", "check", {
                pkg: JSON.stringify(n), callback: function (e) {
                    t && t(e)
                }
            })
        }, open: function (n, t) {
            return "undefined" == typeof t && (t = !0), e.webview.core.async("app", "open", {appId: n, async: t})
        }
    }, e.webview.system = {
        version: function () {
            return e.webview.core.execute("system", "version")
        }, info: function () {
            return JSON.parse(e.webview.core.execute("system", "info"))
        }, call: function (n, t, c, r, o) {
            var i = {source: n, group: t, label: c, phone: JSON.stringify(r)};
            return o && (i.title = o), e.webview.core.async("system", "call", i)
        }, log: function (n, t) {
            return e.webview.core.execute("system", "log", {tag: n, message: t})
        }, toast: function (n) {
            return e.webview.core.execute("system", "toast", {message: n})
        }, alert: function (t, c) {
            return e.webview.core.execute("system", "alert", {message: t, title: c || n})
        }, confirm: function (n, t, c) {
            return c || (c = {}), c.message = n, c.callback = function (e) {
                t(e.data)
            }, e.webview.core.async("system", "confirm", c)
        }, copy: function (n) {
            return e.webview.core.execute("system", "copy", {text: n || ""})
        }
    }, e.webview.http = {
        get: function (n, t) {
            var c = t.callback;
            return t || (t = {}), t.url = n, t.callback = function () {
                c(arguments[0])
            }, e.webview.core.async("http", "get", t)
        }, post: function (n, t) {
            var c = t.callback;
            return t || (t = {}), t.url = n, t.callback = function () {
                c(arguments[0])
            }, e.webview.core.async("http", "post", t)
        }, abort: function (n) {
            return e.webview.core.execute("http", "abort", {httpId: n})
        }
    }, e.webview.user = {
        get: function () {
            return JSON.parse(e.webview.core.execute("user", "get"))
        }, login: function (n, t) {
            return e.webview.core.async("user", "login", {from: n, callback: t})
        }, logout: function () {
            return e.webview.core.execute("user", "logout")
        }, register: function (n, t) {
            return e.webview.core.async("user", "register", {from: n, callback: t})
        }
    }
}(self, void 0);