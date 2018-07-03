$(function() {
    $m.setLink();
    FastClick.attach(document.body);
    $.toast.prototype.defaults.duration = 1000;

    $('.page-back').click(function(){
        history.go(-1);
    });

    $('form[ajax-submit]').each(function(){
        $m.submit($(this), function(res){
            if (res.status == 'error') return $m.error(res.msg);
            if (res.status == 'success') {
                $m.success(res.msg, function(){
                    $m.redirect(res.url);
                });
            }
        });
    });
});