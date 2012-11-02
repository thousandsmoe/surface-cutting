/**
 * v-js框架是一个微型JavaScript框架.
 * http://www.vohyo.com
 * Copyright 2011, YongWang
 * Released under the MIT, BSD, and GPL Licenses.
 * v@vohyo.com
 * author: vohyo
 * version: 2011-09-27 v1.3
 */

(function(win) {
    
win.v || new v;
function v() {
    var _this = this, doc = win.document;
    var div = doc.createElement('div'), cano = typeof(div.style.opacity) == 'string';
    var rQuery = /(?:^([#\.]?)([\w-]*?))(?:\[([\w-]+)(?:=[\'\"]([^\'\"]+)[\'\"])?\])?(?:\.([\w-]+))?$/;
    var rAlpha = /alpha\s*\(\s*opacity\s*=\s*(\d+)\s*\)/i;
    var v = function(q) {return _this.$(q);}
    
    // element对象
    this.elexts = {};
    this.elements = {
        addEvent: function(type, fn, ctx) {
            var types = typeof(type) == 'string' ? type.split(',') : type, i = 0, fe, fs, nfn, _ctx = this; ctx = ctx || this;
            while (type = types[i++]) {
                type = type.trim(); fe = 'e' + type; fs = this[fe] || (this[fe] = [[],[]]);
                if (fs[0].indexOf(fn) < 0) {
                    if (type == 'enter') this.addEvent('keyup', (nfn = function(event) {event.keyCode != 13 || fn.call(ctx, event, _ctx);}));
                    else {
                        nfn = function(event) {
                            event = event || win.event;
                            event.stop || _this.extend(event, _this.events);
                            fn.call(ctx, event.fix(), _ctx);
                        }
                        if (this.addEventListener) this.addEventListener(type, nfn, false);
                        else this.attachEvent('on' + type, nfn);
                    }
                    fs[0].push(fn); fs[1].push(nfn);
                }
            }
            return this;
        },
        removeEvent: function(type, fn) {
            var types = typeof(type) == 'string' ? type.split(',') : type, i = 0, j, fe, fs;
            while (type = types[i++]) {
                type = type.trim(); fe = 'e' + type; fs = this[fe];
                if (fs && (j = fs[0].indexOf(fn)) >= 0) {
                    if (type == 'enter') this.removeEvent('keyup', fs[1][j]);
                    else {
                        if (this.removeEventListener) this.removeEventListener(type, fs[1][j], false);
                        else this.detachEvent('on' + type, fs[1][j]);
                    }
                    fs[0][j] = fs[1][j] = undefined;
                }
            }
            return this;
        },
        hasClass: function(cls) {
            return (' ' + this.className + ' ').indexOf(' ' + cls + ' ') > -1;
        },
        addClass: function(cls) {
            this.hasClass(cls) || (this.className += ' ' + cls);
            return this;
        },
        removeClass: function(cls) {
            this.className = (' ' + this.className + ' ').replace(' ' + cls + ' ', ' ').trim();
            return this;
        },
        css: function(css, value) {
            if (typeof(css) == 'string') {
                if (value === undefined) {
                    if (!(value = this.style[css]) && css == 'opacity' && !cano && (value = rAlpha.exec(this.style.filter)))
                        value = value[1] / 100;
                    return value;
                } else css = _this.extend(css, value);
            }
            if (css.opacity !== undefined && !cano) {
                var filter = this.style.filter; value = 'alpha(opacity=' + Math.floor(css.opacity * 100) + ')';
                this.style.filter = rAlpha.test(filter) ? filter.replace(rAlpha, value) : (filter + ' ' + value).trim();
            }
            for (var k in css)
                this.style[k] = (typeof(css[k]) == "number" && !/zIndex|fontWeight|opacity|zoom/i.test(k) ? css[k] + 'px' : css[k]);
            return this;
        },
        attr: function(attr, value) {
            if (typeof(attr) == 'string') {
                if (value === undefined) return this.getAttribute(attr, 2);
                else attr = _this.extend(attr, value);
            }
            for (var k in attr) this.setAttribute(k, attr[k]);
            attr.text === undefined || (this.text = attr.text);
            attr.v === undefined || (this.v = attr.v);
            return this;
        },
        html: function(value) {
            if (value !== undefined) {
                this.empty();
                if (typeof(value) == 'string') this.innerHTML = value;
                else this.appendChild(value);
                return this;
            } else return this.innerHTML;
        },
        remove: function() {
            return this.parentNode.removeChild(this);
        },
        empty: function() {
            while (this.firstChild)
                this.removeChild(this.firstChild);
            return this;
        },
        insertChild: function(child, ref) {
            this.insertBefore(child, ref || null);
            return this;
        },
        insertTo: function(parent, ref) {
            _this.$(parent).insertBefore(this, ref || null);
            return this;
        },
        // 是否包含某个子元素
        contains: function(child) {
            if (this.compareDocumentPosition) return this == child || !!(this.compareDocumentPosition(child) & 16);
            else return !!v.$(child).$p(this);
        },
        // 向上（父）获取满足条件的元素, tag .class #id
        $p: function(s, ctx) {
            var node = this, q = typeof(s) == 'string' ? rQuery.exec(s) : s; ctx = _this.$(ctx || 'body');
            while (node && node.nodeName && node != ctx) {
                if (q.nodeName) {if (q == node) return node;}
                else if (q[1] == '#') {if (q[2] == node.id) return node;}
                else if (q[1] == '.') {if (node.hasClass(q[2])) return node;}
                else if (!q[1] && q[2] && (node.nodeName == q[2].toUpperCase())) return node;
                node = _this.$(node.parentNode);
            }
            return null;
        },
        // 向下继承筛选多个
        $s: function(q) {
            return _this.$s(q, this);
        },
        // 向下继承筛选单个
        $: function(q) {
            return _this.$(q, this);
        },
        // 把元素内数据转换成json
        json: function() {
            var els = _this.$s('*', this), i = 0, el, data = {}, name;
            var types = ['text', 'hidden', 'select-one', 'textarea', 'password', 'button', 'submit'];
            while (el = els[i++]) {
                if (name = el.name) {
                    if (types.indexOf(el.type) >= 0) data[name] = el.value;
                    else if (el.type == 'checkbox') {
                        if (el.checked) data[name] = el.value;
                        else data[name] = '';
                    }
                }
            }
            return data;
        },
        // 获得元素在框内的坐标位置
        offset: function(box) {
            var left = 0, top = 0, el = this; box = _this.$(box || el.offsetParent);
            while (el && el != box) {
                left += el.offsetLeft; top += el.offsetTop;
                el = el.offsetParent;
            }
            return {'left': left, 'top': top, 'width': this.offsetWidth, 'height': this.offsetHeight};
        },
        // 获得元素client高度与scroll位移
        client: function() {
            var xy = {};
            if (this.nodeName == 'BODY') {
                var b = doc.body, e = doc.documentElement;
                xy.left = Math.max(b.scrollLeft, e.scrollLeft); xy.top = Math.max(b.scrollTop, e.scrollTop);
                xy.width = e.clientWidth||b.clientWidth; xy.height = e.clientHeight||b.clientHeight;
                xy.widths = Math.max(b.scrollWidth, e.scrollWidth, xy.width); xy.heights = Math.max(b.scrollHeight, e.scrollHeight, xy.height);
            } else {
                xy.left = this.scrollLeft; xy.top = this.scrollTop;
                xy.width = this.clientWidth; xy.height = this.clientHeight;
                xy.widths = this.scrollWidth; xy.heights = this.scrollHeight;
            }
            return xy;
        },
        // 是否载入完毕
        ready: function(fn, ctx) {
            ctx = ctx || this;
            if (_this.isIE) this.onreadystatechange = function() {
                if (this.readyState == 'loaded' || this.readyState == 'complete') {
                    this.onreadystatechange = null;
                    fn.call(ctx, this);
                }
            }; else this.onload = function() {
                this.onload = null; 
                fn.call(ctx, this);
            }
            return this;
        },
        // 渐显1-100
        show: function(speed, aspect) {
            if (this.clearTimer) this.clearTimer();
            var op = this.css('opacity') || 1, _this = this.css({'opacity': 0, 'display':'block'}), step, h;
            if (aspect) { // 按方向
                var wh = aspect == 'top' || aspect == 'bottom' ? 'height' : 'width';
                var offset = this.offset(), px = offset[wh];step = px * speed / 100;h = step;
                if (aspect == 'bottom') this.css({'top':this.offsetTop + px});
                else if (aspect == 'right') this.css({'left':this.offsetLeft + px});
                this.css(wh, 0).css({'opacity': op});
                this.showTimer = setInterval(function() {
                    _this.style[wh] = h + 'px';
                    if (aspect == 'bottom') _this.css({'top':_this.offsetTop - step});
                    else if (aspect == 'right') _this.css({'left':_this.offsetLeft - step});
                    if ((h += step) >= px) _this.clearTimer();
                }, 25);
                this.clearTimer = function() {clearInterval(_this.showTimer);_this.css(offset);}
            } else if (speed){ // 按透明度
                step = op * speed / 100;h = step;
                this.showTimer = setInterval(function() {
                    _this.css({'opacity':h});
                    if ((h = parseFloat((h + step).toFixed(2))) >= op) _this.clearTimer();
                }, 25);
                this.clearTimer = function() {clearInterval(_this.showTimer);_this.css({'opacity':op});}
            } else this.css({'opacity': op});
            return this;
        },
        // 渐隐1-100
        hide: function(speed, aspect) {
            if (this.clearTimer) this.clearTimer();
            var _this = this, step, h;
            if (aspect) { // 按方向
                var wh = aspect == 'top' || aspect == 'bottom' ? 'height' : 'width';
                var offset = this.offset(), px = offset[wh];step = px * speed / 100;h = px - step;
                this.showTimer = setInterval(function(){
                    _this.style[wh] = h + 'px';
                    if (aspect == 'bottom') _this.css({'top':_this.offsetTop + step});
                    else if (aspect == 'right') _this.css({'left':_this.offsetLeft + step});
                    if ((h -= step) <= 0) _this.clearTimer();
                }, 25);
                this.clearTimer = function() {clearInterval(_this.showTimer);_this.css(offset).style.display = 'none';}
            } else if (speed) {  // 按透明度
                var op = this.css('opacity') || 1;step = op * speed / 100;h = op - step;
                this.showTimer = setInterval(function(){
                    _this.css({'opacity':h});
                    if ((h = parseFloat((h - step).toFixed(2))) <= 0) _this.clearTimer();
                }, 25);
                this.clearTimer = function() {clearInterval(_this.showTimer);_this.css({'display':'none', 'opacity':op});}
            } else this.style.display = 'none';
            return this;
        }
    };
    // 事件
    this.events = {
        stop: function() {
            if (this.preventDefault) {
                this.preventDefault(); this.stopPropagation();
            } else {
                this.returnValue = false; this.cancelBubble = true;
            }
            return this;
        },
        fix: function() {
            this.target !== undefined || (this.target = _this.$(this.srcElement));
            this.relatedTarget !== undefined || (this.relatedTarget = this.fromElement || this.toElement);
            this.offsetX !== undefined || (this.offsetX = this.layerX, this.offsetY = this.layerY);
            return this;
        }
    };
    // 数组
    this.arrays = {
        indexOf: function(item, from) {
            for (var len = this.length, i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++)
                if (this[i] === item) return i;
            return -1;
        },
        forEach: function(fn, bind) {
            for (var i = 0, len = this.length; i < len; i++)
                fn.call(bind, this[i], i, this);
            return this;
        },
        addEvent: function(type, fn, ctx) {
            this.forEach(function(el) {el.addEvent(type, fn, ctx);});
            return this;
        },
        removeEvent: function(type, fn) {
            this.forEach(function(el) {el.removeEvent(type, fn);});
            return this;
        }
    };
    // 字符串
    this.strings = {
        trim: function() {
            return this.replace(/^\s+|\s+$/g, '');
        },
        exec: function(fn, ctx) {
            var script = '', text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code) {
                script = script + code + '\n'; 
                return '';
            });
            if (fn) {
                fn.call(ctx, text);
                if (script) _this.$('<script>').attr({'type':'text/javascript', 'text':script}).insertTo('body');
            }
            return {'text': text, 'script': script};
        }
    };
    // 选择class
    this.$cls = function(s, ctx) {
        if (ctx.nodeName && ctx.getElementsByClassName) return ctx.getElementsByClassName(s);
        else {
            var i = 0, node, ret = [], nodes = ctx.nodeName ? ctx.getElementsByTagName('*') : ctx;
            while (node = nodes[i++])
                if ((' '+node.className+' ').indexOf(' '+s+' ') > -1) ret.push(node);
            return ret;
        }
    };
    // 正则匹配选择
    this.$regx = function(s, ctx) {
        var q = rQuery.exec(s), els = [];
        if (q[1] == '#') els = [doc.getElementById(q[2])];  // id
        else if(q[1] == '.') els = _this.$cls(q[2], ctx);  // class
        else if(q[2]) els = ctx.getElementsByTagName(q[2]);  // tag
        if (q[3]) {  // attribute
            if (!q[2] && q[3] == 'name' && ctx == doc) els = ctx.getElementsByName(q[4]);
            else { // 属性辅助
                var i = 0, node, attr, ret = []; q[2] || (els = ctx.getElementsByTagName('*'));
                while (node = els[i++]) {
                    attr = node.getAttribute(q[3], 2);
                    if (attr != null && (!q[4] || attr == q[4])) ret.push(node);
                }
                els = ret;
            }
        }
        if (q[5]) els = _this.$cls(q[5], els);
        // 转换成数组
        var nodes = els, len = nodes.length;els = [];
        for (var i = 0; i < len; i++) els[i] = nodes[i];
        return els;
    };
    // 选择元素
    this.$query = function(s, ctx) {
        var els, ret; ctx = ctx || doc;
        if (s == null) return [];
        else if (typeof(s) != 'string') {
            if (s.nodeName == undefined) return s; // 数组类型
            else if (s.$) return [s]; else els = [s];
        } else if (s == 'body') els = [doc.body];
        else if (s == '*') els = ctx.getElementsByTagName('*');
        else if (s.charAt(0) == '<') { // html类型
            if (ret = /^<(\w+)\s*\/?>(?:<\/\1>)?$/.exec(s)) els = [doc.createElement(ret[1])];
            else {div.innerHTML = s; els = div.childNodes;}
        } else if (ctx.querySelectorAll) els = ctx.querySelectorAll(s);
        else {  // 解析选择器进行选择
            var ss = s.split(' '), ctxs = [ctx], j;
            for (var i = 0, len = ss.length; i < len; i++) {
                if (ss[i]) {
                    j = 0; els = [];
                    while (ctx = ctxs[j++]) els = els.concat(_this.$regx(ss[i], ctx));
                    ctxs = els;
                }
            }
        }
        return els;
    };
    // 单选择器
    this.$ = v.$ = function(s, ctx) {
        var el = _this.$query(s, ctx)[0];
        if (el) {
            el.$ || _this.extend(el, _this.elements);
            _this.extend(el, _this.elexts);
        }
        return el;
    };
    // 多选择器
    this.$s = v.$s = function(s, ctx) {
        var els = _this.$query(s, ctx), ret = [], len = els.length;
        for (var i = 0; i < len; i++) {
            if (els[i].nodeType == 1 || els[i].nodeType == 9) {
                els[i].$ || _this.extend(els[i], _this.elements);
                ret.push(_this.extend(els[i], _this.elexts));
            }
        }
        return ret;
    };
    // 对象合并
    this.extend = v.extend = function(dst, src) {
        if (typeof(dst) == 'string') {
            if (typeof(src) == 'function') {
                _this.elexts[dst] = src;
                if (win.Element) Element.prototype[dst] = src;
            } else {var json = new Object(); json[dst] = src; return json;}
        } else {
            for (var key in src)
                if (dst[key] === undefined && src.hasOwnProperty(key)) dst[key] = src[key];
        }
        return dst;
    };
    // 编码数据进url
    this.url = v.url = function(url, data) {
        if (data && typeof(data) == 'string') url = url + '&' + data;
        else {
            typeof(url) == 'string' || (data = url, url = '');
            if (data) for (var k in data)
                url = url.replace(new RegExp('&' + k + '=[^&]*', 'g'), '') + '&' + k + '=' + data[k];
        }
        return url;
    };
    // 是否数组
    this.isArray = v.isArray = function(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    };
    // ajax调用, fn为空时同步调用
    this.xhr = v.xhr = function(url, data, mth, fn, ctx) {
        var req, cmp = false; mth = mth.toUpperCase();
        try {req = win.XMLHttpRequest ? new win.XMLHttpRequest() : new win.ActiveXObject('MSXML2.XMLHTTP.6.0');} catch(e) {return false;}
        try {
            if (mth == 'GET') {
                req.open(mth, _this.url(url, data), !!fn);data = '';
            } else {
                req.open(mth, url, !!fn);
                req.setRequestHeader('method', 'POST ' + url + ' HTTP/1.1');
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            req.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
            if (fn) req.onreadystatechange = function() {
                if (req.readyState == 4 && !cmp) {
                    cmp = true;
                    req.responseText.exec(fn, ctx);
                }
            }
            req.send(_this.url(data));
        } catch(e) {return false;}
        return (fn ? _this : req.responseText);
    };
    // get调用ajax
    this.get = v.get = function(url, data, fn, ctx){
        typeof(data) == 'object' || (ctx = fn, fn = data, data = '');
        return _this.xhr(url, data, 'GET', fn, ctx);
    };
    // post调用ajax
    this.post = v.post = function(url, data, fn, ctx){
        return _this.xhr(url, data, 'POST', fn, ctx);
    };
    // 设置与获取cookie, expire为0时当前进程，未传递时为永久,value为0|false时删除cookie
    this.cookie = v.cookie = function(name, value, expire, domain) {
        if (value !== undefined) {
            if (typeof(expire) == 'string') {var temp = expire;expire = domain;domain = temp;}
            if (value == false) expire = -1;
            doc.cookie = name + '=' + encodeURIComponent(value) + ';path=/' + (domain ? ';domain=' + domain : '')
                       + (expire != 0 ? ';expires=' + (new Date((new Date()).getTime() + (expire == undefined ? 86400000000 : expire * 1000))).toGMTString() : '');
        } else {
            var cks = doc.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
            return cks ? decodeURIComponent(cks[2]) : null;
        }
    };
    // jsonp跨域get,需服务器端支持，并返回一变量，变量的值则为数据
    this.jsonp = v.jsonp = function(url, fn, ctx) {
        var vn = _this.uniqid('jsonp_');
        _this.$('<script>').ready(function() {
            if (win[vn] !== undefined) {
                win[vn].exec(fn, ctx);
                win[vn] = undefined;
            } else if (fn) fn.call(ctx);
            this.remove();
        }).attr({'type':'text/javascript', 'src':_this.url(url, {'jsonp': vn})}).insertTo('head');
        return _this;
    };
    // 载入javascript或css
    this.load = v.load = function(url, fn, ctx) {
        if (url.substr(0, 3) == '../') {  // 相对(v.js)路径解析
            if (!_this.baseUrl) for (var scrs = _this.$s('script'), len = scrs.length, qs, i = 0; i < len; i++) {
                if (qs = scrs[i].src.match(/.*\/(v(\.[-\.\d\w]*)?\.js)$/i)) {
                    _this.baseUrl = scrs[i].attr('src').replace(qs[1], ''); break;
                }
            }
            url = _this.baseUrl + url.substr(3);
        }
        if (url.substr(url.length - 4) == '.css') {  // 样式文件
            if (_this.$s('link[href="'+url+'"]').length <= 0)
                _this.$('<link>').attr({'type':'text/css', 'rel':'stylesheet', 'media':fn||'all', 'href':url}).insertTo('head');
        } else {  // js文件
            if (_this.$s('script[src="'+url+'"]').length <= 0) {
                var el = _this.$('<script>'); if (fn) el.ready(fn, ctx);
                el.attr({'type':'text/javascript', 'src':url}).insertTo('head');
            } else if (fn) fn.call(ctx);
        }
        return _this;
    };
    // 页面准备好
    this.ready = v.ready = function(fn, ctx) {
        win.addEvent('load', fn, ctx);
        return _this;
    };
    // 生成唯一标识，16位
    this.uniqid = v.uniqid = function(prefix) {
        var uid = new Date().getTime().toString(16);
        uid += Math.floor((1 + Math.random()) * Math.pow(16, (16 - uid.length))).toString(16).substr(1);
        return (prefix || '') + uid;
    };

    // 静态属性
    this.isIE = v.isIE = !!(win.attachEvent && win.navigator.userAgent.indexOf('Opera') === -1);
    //************************************** 语言扩展 **********************************//
    this.extend(Array.prototype, this.arrays); // 数组
    this.extend(String.prototype, this.strings); // 字符串
    win.addEvent = doc.addEvent = this.elements.addEvent; // window添加事件
    win.removeEvent = doc.removeEvent = this.elements.removeEvent;  // window移除事件
    if (win.Event) this.extend(Event.prototype, this.events); // event事件对象
    if (win.Element) this.extend(Element.prototype, this.elements); // element
    win.v = v;
}

})(window);