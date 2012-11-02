/**
 * vcrop Script
 * 图片区域裁剪选择
 * http://www.vohyo.com
 * Copyright 2011, YongWang
 * Released under the MIT, BSD, and GPL Licenses.
 * v@vohyo.com
 * author: vohyo
 * version: 2011-09-27 v1.0
 *
 * Example:
 * <script type="text/javascript">
 *      v.$(img).crop(options);
 * </script>
 */

v.extend('crop', function(opts) {
    return this.vCrop || (this.vCrop = new vCrop(this, opts));
});

function vCrop(img, opts) {
    this.opts = v.extend(opts || {}, vCrop.defaults); // 配置参数
    this.img = v.$(img); // 要裁剪的图像
    this.ratio = false; // 宽高比率
    this.fields = null; // 信息保存域
    this.drag = {node: null, left: 0, top: 0, x: 0, y:0}; // 被移动的元素
    this.eBox = null; // 图片框
    this.eArea = null; // 区域框
    this.eHander  = null; // 改变大小句柄
    this.ePreview = null; // 预览框
    this.ePreimg = null; // 预览图
    
    if (this.img.offsetWidth > 0) this._init();
    else this.img.ready(this._init, this);
}

vCrop.defaults = {
    'ratio': null, // 区域比例
    'preview': null, // 预览区
    'fields': null // 裁剪信息保存区
}

vCrop.prototype = {
    // 初始化
    _init: function() {
        var _this = this, opts = _this.opts;
        this.img.style.zIndex = 1;
        
        // 图片框，与图片大小位置一致。
        var imgp = this.img.parentNode;
        imgp.style.position == 'absolute' || (imgp.style.position = 'relative');
        this.eBox = v.$('<div>')
            .css({'position':'absolute', 'background':'black', 'zIndex':2, 'opacity':0.01})
            .css(this.img.offset())
            .addEvent('mousedown', this._startSelect, this)
            .insertTo(imgp);     
        this.clip(opts.preview, opts.fields, opts.ratio);
    },
    // 建立选择区域
    _createArea: function(clip) {
        // 去掉原选择区域
        if (this.eArea) {
            this.eArea.remove();this.eHander.remove();
        }
        this.eBox.css({'opacity': '0.5'});
        
        // 建立新选择区
        this.eArea = v.$('<div>')
            .css({'position':'absolute', 'width':clip.width - 2, 'height':clip.height - 2, 'top':clip.top, 'left':clip.left, 
            'opacity':0.8, 'border':'dashed 1px black', 'background':'white', 'cursor':'move'})
            .addEvent('mousedown', this._startDrag, this)
            .insertTo(this.eBox);
        
        // 建立拖动句柄
        this.eHander = v.$('<div>')
            .css({'position':'absolute', 'width':6, 'height':6, 'bottom':0, 'right':0, 'opacity':0.99,'background':'black', 'cursor':'nw-resize'})
            .addEvent('mousedown', this._startDrag, this)
            .insertTo(this.eArea);  
    },
    // 开始选择区域
    _startSelect: function(event) {
        // 建立选择区域
        var top = Math.min(event.offsetY, this.eBox.offsetHeight - 18);
        var left = Math.min(event.offsetX, this.eBox.offsetWidth - 18);
        this._createArea({'left': left, 'top': top, 'width': 18, 'height': 18});
        // 保存位置
        this.drag = {'node': true, 'x': event.clientX, 'y': event.clientY, 'top': top, 'left': left};
        // 区域选择事件
        document.addEvent('mousemove', this._selecting, this).addEvent('mouseup', this._endSelect, this);
    },
    // 结束区域选择
    _endSelect: function(event) {
        !event || event.stop();this._clip();this.drag.node = null;
        document.removeEvent('mousemove', this._selecting).removeEvent('mouseup', this._endSelect);
    },
    // 区域选择
    _selecting: function(event) {
        var width, height, dif;event.stop();
        if (this.drag.node === true) {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            width = Math.max(Math.min(event.clientX - this.drag.x, this.eBox.offsetWidth - this.drag.left), 1);
            if (this.ratio) {
                height = width / this.ratio, dif = this.eBox.offsetHeight - this.eArea.offsetTop - height - 2;
                if (dif < 0){
                    height += dif;
                    width += dif;
                }
            } else height = Math.max(Math.min(event.clientY - this.drag.y, this.eBox.offsetHeight - this.eArea.offsetTop - 2), 1);
            this.eArea.css({'width': width, 'height': height});
            this._preview();
        }
    },
    // 开始拖动
    _startDrag: function(event) {
        var tar = event.target;event.stop();
        this.drag = {'node': tar, 'x': event.clientX, 'y': event.clientY, 'top': tar.offsetTop, 'left': tar.offsetLeft};
        document.addEvent('mousemove', this._draging, this).addEvent('mouseup', this._endDrag, this);
    },
    // 结束拖动
    _endDrag: function(event) {
        !event || event.stop();this._clip();this.drag.node = null;
        document.removeEvent('mousemove', this._draging).removeEvent('mouseup', this._endDrag);
    },
    // 拖动过程
    _draging: function(event) {
        var tar = this.drag.node, width, height, dif, top, left;event.stop();
        if (tar) {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            left = Math.min(Math.max(this.drag.left + event.clientX - this.drag.x, 0), this.eBox.offsetWidth - tar.offsetWidth);
            top = Math.min(Math.max(this.drag.top + event.clientY - this.drag.y, 0), this.eBox.offsetHeight - tar.offsetHeight);
            tar.css({'left': left, 'top': top});
            if (tar === this.eArea) {  // ie8下不跟随移动解决，变化其高度
                tar.css({'width': tar.offsetWidth, 'height': tar.offsetHeight});
                tar.css({'width': tar.offsetWidth - 4, 'height': tar.offsetHeight - 4});
            } else if (tar === this.eHander) {  // 拖动句柄时改变选择框大小
                width = Math.min(tar.offsetLeft + tar.offsetWidth, this.eBox.offsetWidth - this.eArea.offsetLeft - 2);
                if (this.ratio) {
                    height = width / this.ratio, dif = this.eBox.offsetHeight - this.eArea.offsetTop - height - 2;
                    if (dif < 0){
                        height += dif;
                        width += dif;
                    }
                } else height = Math.min(tar.offsetTop + tar.offsetHeight, this.eBox.offsetHeight - this.eArea.offsetTop - 2);
                this.eArea.css({'width': width, 'height': height});
                tar.css({'top': '', 'left': '', 'right': '0', 'bottom': '0'});
            }
            this._preview();
        }
    },
    // 预览
    _preview: function() {
        if (this.ePreview) {
            var clip = this.get(), rx = this.ePreview.clientWidth / clip.width, ry = this.ePreview.clientHeight / clip.height;
            this.ePreimg.css({'width': this.img.width * rx, 'height': this.img.height * ry,
                'top': 0 - clip.top * ry, 'left': 0 - clip.left * rx});
        }
    },
    // 设置裁剪信息
    _clip: function() {
        if (this.fields) {
            var fs = this.fields, clip = this.get();
            fs.width.value = clip.width;
            fs.height.value = clip.height;
            fs.left.value = clip.left;
            fs.top.value = clip.top;
        }
		if (ukagaka){
			var clip = this.get();
			var x=clip.left,y=clip.top,xw=x+clip.width,yh=y+clip.height;
			v.$(this.opts.ukagaka).value=x+','+y+','+xw+','+yh;
		}
    },
    // 设置预览对象与裁剪信息域
    clip: function(preview, fields, ratio) {
        if (preview && preview.w && preview.h) {var temp = preview;preview = fields;fields = temp;}
        if (typeof(fields) == 'string') {var temp = fields;fields = ratio;ratio = temp;}
        
        // 宽高比率计算
        if (ratio) {
            var ratios = ratio.split(':');
            this.ratio = ratios[0] / ratios[1]; // 宽高比例
        } else this.ratio = false;
        
        // 设置预览对象
        if (preview) {
            this.ePreview = v.$(preview).css({'overflow': 'hidden'}).empty();
            this.ePreview.style.position == 'absolute' || (this.ePreview.style.position = 'relative');
            this.ePreimg = this.img.cloneNode(true);
            this.ePreimg.css({'position':'absolute'}).insertTo(this.ePreview);
        }
        
        // 设置裁剪对象
        if (fields) {
            this.fields = fields = {'width': v.$(fields.width), 'height': v.$(fields.height), 'left': v.$(fields.left), 'top': v.$(fields.top)};
            if (fields.width.value) {
                this._createArea({left: parseInt(fields.left.value), top: parseInt(fields.top.value), width: parseInt(fields.width.value), height: parseInt(fields.height.value)});
            } else {  // 默认为预览框大小并居中区域
                var width = preview ? this.ePreview.clientWidth : 18, height = preview ? this.ePreview.clientHeight : 18;
                var imgp = this.img.parentNode, top = (imgp.clientHeight - height) / 2, left = (imgp.clientWidth - width) / 2;
                this._createArea({'left': left, 'top': top, 'width': width, 'height': height});
            }
        }
        
        // 滚动到图片呈现区域
        if (this.eArea) {
            var imgp = this.img.parentNode, ixy = imgp.client(), exy = this.eArea.offset(), wh;
            if ((wh = ixy.widths - ixy.width) > 0) imgp.scrollLeft = Math.min(wh, exy.left - (ixy.width - exy.width) / 2);
            if ((wh = ixy.heights - ixy.height) > 0) imgp.scrollTop = Math.min(wh, exy.top - (ixy.height - exy.height) / 2);
            if (this.ePreview) this._preview();
        }
    },
    // 获得坐标与大小
    get: function() {
        return this.eArea.offset();
    },
    // 移出剪切
    remove: function() {
        this.eBox.remove();
        this._endDrag();
        this._endSelect();
    }
};