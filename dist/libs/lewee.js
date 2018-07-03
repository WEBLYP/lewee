window.$m = {
    /**
     * 成功消息提示
     * @param msg
     * @param fn
     */
    "success": function(msg, fn){
        $.toast(msg, function() {
            fn && fn();
        });
    },

    /**
     * 普通消息提示框
     */
    "alert": function(msg, title){
        $.alert(msg, title ? title : '提示');
    },

    /**
     * 失败消息提示
     * @param msg
     */
    "error": function(msg){
        $.toptip(msg, 'error');
    },

    /**
     * 确认提示框
     * @param msg
     * @param confirmFn
     * @param cancelFn
     */
    "confirm": function(msg, confirmFn, cancelFn){
        $.confirm(msg, "消息提示", function(){
            confirmFn && confirmFn();

        }, function() {
            cancelFn && cancelFn();
        });
    },

    /**
     * 页面跳转
     * @param url
     */
    "redirect": function(url){
        location.href = url;
    },

    /**
     * 显示加载层
     */
    "loading": function(loadingTip){
        loadingTip = loadingTip ? loadingTip : '加载中';
        setTimeout(function(){
            $.showLoading(loadingTip);
        }, 50)
    },

    /**
     * 关闭加载层
     */
    "unload": function(fn, t){
        setTimeout(function(){
            $.hideLoading();
            setTimeout(function() {
                fn && fn();
            }, 100)
        }, t ? t : 300)
    },

    /**
     * Ajax请求
     * @param string url
     * @param object json
     * @param function sucFn
     * @param function errFn
     */
    "ajax" : function(url, json, sucFn, errFn, loadingTip){
        this.loading(loadingTip);
        $.ajax({
            type: 'post',
            url: url ,
            dataType: 'json',
            data: json,
            timeout : 60000,
            success: function(res){
                $m.unload(function(){
                    sucFn(res);
                })
            },
            error: function(xml, status, err){
                $m.unload(function(){
                    $m.error('请求失败: ' + err);
                    errFn && errFn();
                })
            }
        });
    },

    /**
     * Ajax提交表单
     * @param o
     * @param sucFn
     * @param errFn
     */
    "submit": function(o, sucFn, errFn, loadingTip){
        o.submit(function(){
            if (!$m.checkForm(o)) return false;
            var callback = $(this).attr('callback');

            if (callback) {
                try {
                    if (!eval(callback + '()')) return false;
                } catch (e){
                    console.log(e);
                }
            }

            var url = o.attr('action');
            var json = o.serialize();
            $m.ajax(url, json, sucFn, errFn, loadingTip);
            return false;
        });
    },

    /**
     * 表单检测
     * @param object o
     * @return boolean result
     */
    "checkForm": function (o) {
        var result = true;
        var obj = o ? o.find('.required') : $('.required');
        obj.each(function(){
            var v = $(this).val();
            var formMsg = $(this).attr('form-msg');
            var formMsg = formMsg ? formMsg : '请输入' + $(this).attr('placeholder');

            var checked_box_no_checked = $(this).attr('type') == 'checkbox' && !$(this).is(':checked');

            if (checked_box_no_checked || $.trim(v) == '')
            {
                $.toptip(formMsg);
                result = false;
                return false;
            }
        });

        return result;
    },

    /**
     * 格式化时间戳
     * @param int timestamp
     * @param string type
     * @param string sign
     * @return boolean result
     */
    "timeFormat": function(timestamp, type, sign){
        var type = type ? type : 'hms';
        var sign = sign ? sign : '.';

        timestamp = parseInt(timestamp + '000');
        var date = new Date(timestamp);
        var Y = date.getFullYear() + sign;
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + sign;
        var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';

        var h = date.getHours();
        var m = date.getMinutes();
        var s = date.getSeconds();

        var result = '';

        if (type == 'hms') {
            if (h < 10) { h = '0' + h;}
            if (m < 10) { m = '0' + m;}
            if (s < 10) { s = '0' + s;}

            h += ':';
            m += ':'
            result = Y+M+D+h+m+s;
        } else {
            result = Y+M+D;
        }

        return result;
    },

    /**
     * 链接跳转
     */
    "setLink": function(){
        $('div').delegate('*[data-link]', 'click', function(e){
            var link = $(this).attr('data-link');
            if (link != '' && typeof(link) != 'undefined') {
                window.location.href = link;
            };
            return false;
        })
    },

    /**
     * 验证码倒计时
     * @param object o 按钮对象
     * @param int t 秒数
     * @param object 输入框
     */
    "countDown": function(oBtn, t, oInput){
        var txt = oBtn.html();
        var btn = oBtn.get(0);
        var oInput = oInput ? oInput : $('input[name=phone]');

        if ($.trim(oInput.val()) == '') {
            $.toptip('请输入手机号码');
            return;
        }

        btn.init = function(){
            btn.lock = 0;
            oBtn.removeClass('weui_btn_disabled').html(btn.txt);
            clearInterval(btn.timer);
        }

        if (t == 0) btn.init();
        if (!btn.txt) btn.txt = txt;
        if (btn.lock || t == 0) return;

        btn.lock = 1;
        t = t ? t : 60;
        oBtn.addClass('weui_btn_disabled').html(t + 's');

        btn.timer = setInterval(function(){
            t--;
            oBtn.html(t + 's');
            if (t == 0) btn.init();
        }, 1000);

        return oInput.val();
    },

    /**
     * 上拉加载更多
     * @param params json
     */
    "scrollFresh": function(params){
        var curPage = 1;
        var lock = false;
        var pageEnd = false;
        var container = params.container ? params.container : $('#list-box');
        var listBox = params.listBox ? params.listBox : $('#list-box');
        var listContainer = params.listContainer ? params.listContainer : listBox.find('ul');
        var emptyBox = params.emptyBox ? params.emptyBox : $('#empty-box');
        var tpl = params.tpl ? params.tpl.html() : $('#list-tpl').html();

        var offsetTop = container.css('padding-top');
        var offsetBottom = container.css('padding-bottom');
        var offsetHeight = parseFloat(offsetTop) + parseFloat(offsetBottom);

        container.scroll(function () {
            if (pageEnd) return;
            if ($(this).scrollTop() + $(this).height() + parseFloat(offsetHeight) >= $(this).get(0).scrollHeight) {
                getList();
            }
        });

        var json = params.data ? params.data : {};

        getList();

        function getList() {
            if (lock) return;
            lock = true;
            json.cur_page = curPage;

            $m.ajax(params.url, json, function(res){
                if (res.status == 'end') {
                    lock = false;
                    if (curPage == 1) {
                        listBox.addClass('hide');
                        emptyBox.removeClass('hide');
                    } else {
                        pageEnd = true;
                        $m.success('加载完毕');
                    }
                } else if (res.status == 'success') {
                    var html = juicer(tpl, res);
                    emptyBox.addClass('hide');
                    listContainer.append(html);
                    listBox.removeClass('hide');
                    curPage++;
                    lock = false;
                } else if (res.status == 'error') {
                    $m.error(res.msg);
                }
            }, function(){
                lock = false;
            })
        }

        function initList(data) {
            json = data ? data : json;
            listContainer.find('*').remove();
            pageEnd = false;
            curPage = 1;
            getList();
        }

        return initList;
    }
}

if (window.juicer) {
    // 注册函数
    juicer.register('timeFormat', $m.timeFormat);
}