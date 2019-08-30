(function($){
    $.fn.snow = function(options){
    var $flake = $('<div id="snowbox" />').css({'position': 'absolute','z-index':'9999', 'top': '-50px'}).html('&#10052;'),
    documentHeight     = $(document).height(),
    documentWidth    = $(document).width(),
    defaults = {
        minSize        : 10,
        maxSize        : 20,
        newOn        : 1000,
        flakeColor    : "#66FFFF" /* 此处可以定义雪花颜色，若要白色可以改为#FFFFFF */
    },
    options    = $.extend({}, defaults, options);
    var interval= setInterval( function(){
    var startPositionLeft = Math.random() * documentWidth,
    startOpacity = 0.5 + Math.random(),
    sizeFlake = options.minSize + Math.random() * options.maxSize,
    endPositionTop = documentHeight - 200,
    endPositionLeft = startPositionLeft - 500 + Math.random() * 500,
    durationFall = documentHeight * 10 + Math.random() * 5000;
    $flake.clone().appendTo('body').css({
        left: startPositionLeft,
        opacity: startOpacity,
        'font-size': sizeFlake,
        color: options.flakeColor
    }).animate({
        top: endPositionTop,
        left: endPositionLeft,
        opacity: 0.2
    },durationFall,'linear',function(){
        $(this).remove()
    });
    }, options.newOn);
    };
})(jQuery);
$(function(){
    $.fn.snow({ 
        minSize: 5, /* 定义雪花最小尺寸 */
        maxSize: 50,/* 定义雪花最大尺寸 */
        newOn: 300,  /* 定义密集程度，数字越小越密集 */
        flakeColor: randomColor()
    });
});
///*随机产生十六进制的颜色值*/
function randomColor(){
    var i = 0;
    var str = "#";
    var random = 0;
    var aryNum = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

    for(i = 0; i < 6; i++)
    {
    	random = parseInt(Math.random() * 16);

    	str += aryNum[random];
    }
    return str
};