/**
 * Wall-E
 *
 * Copyright (c) 2011 Philipp Boes <pb@mostgreedy.com>
 * 
 */

(function($, undefined){
    
    $.wall = function() {
        
        var args = arguments,
            settings = {
                url: null,
                data: null,
                type: 'post',
                delay: 5000,
                duration: 2500,
                effect: 'morph',
                frame: false
            },
            $ul = $('<ul>').addClass('wall-e').prependTo($('body')),
            preload = new Image(),
            current = 0,
            images = [],
            adjust = function() {
                
                var winw = $(window).width(),
                    winh = $(window).height(),
                    imgw = preload.width,
                    imgh = preload.height,
                    wr = winw/winh,
                    ir = imgw/imgh,
                    nw, nh;
                    
                if (wr > ir) {
                    nw = winw;
                    nh = nw * imgh / imgw;
                } else if (wr == ir) {
                    nw = winw;
                    nh = winh;
                } else {
                    nh = winh;
                    nw = nh * imgw / imgh;
                }
                
                $ul.width(winw).height(winh);
                $($ul.children()[current]).width(nw).height(nh);
            },
            change = function() {
                if (++current == images.length) {
                    current = 0;
                    onload();
                } else {
                    preload.src = images[current];
                }
            },
            timer = function() {
                setTimeout(change, settings.delay);
            },
            calltransistion = function( effect, fx, callback ) {
                if ($.isPlainObject($.wall.effects[ effect ])) {
                    $.wall.effects[ effect ][fx].apply(this, [ settings, callback ]);
                }
            },
            onload = function() {
                
                adjust();
                
                var $cur = $($ul.children()[current]);
                calltransistion.apply($cur, [settings.effect, 'show']); 
                
                if ($cur.prev().length > 0) {
                    calltransistion.apply($cur.prev(), [settings.effect, 'hide', timer]); 
                } else {
                    calltransistion.apply($ul.children().last(), [settings.effect, 'hide', timer]); 
                }
            },
            build = function( data ) {
                $($.extend(images, data)).each(function(i){
                    $('<li>').addClass('wall-e-item').css({
                        'background-image': 'url(' + images[i] + ')'
                    }).hide().appendTo($ul);
                });
            };
        
        $(window).resize(adjust);
        $(preload).bind('load', onload);
        
        if (args[0] && typeof args[1] == "undefined") {
            $.extend(settings, args[0] || {});
            $.ajax({
                url: settings.url,
                data: settings.data,
                type: settings.type,
                success: function( data ) {
                    build(data);
                    current = Math.ceil(Math.random() * images.length) - 1;
                    preload.src = images[ current ];
                }
            });
        } else if (args[0] && $.isArray(args[0])) {
            $.extend(settings, args[1] || {});
            build( args[0] );
            preload.src = images[ Math.round(Math.random() * images.length) ];
        } else if (args[0] && $(args[0]).is(args[0])) {
            $ul.remove();
            $ul = $(args[0]).addClass('wall-e').children().each(function(){
                images.push( ($(this).css('background-image')).replace(/url\(("|')*([^$1\)]+)$1*\)/, "$2") );
                $(this).addClass('wall-e-item').hide();
            }).prependTo($('body'));
            preload.src = images[ Math.round(Math.random() * images.length) ];
        } else {
            if (console && $.isFunction(console.log)) {
                console.log('$.wall requires at least one argument. This can either be an single array containing image urls,' +
                            'a hash map of settings, or a DOM-Element (e.g. a list) containing the images. In the last case the' +
                            'second argument can carry individual extra settings (optional).');
            }
            return;
        }
    };
    
    $.wall.effects = {
        'morph': {
            show: function( opts ) { $(this).fadeIn(opts.duration); },
            hide: function( opts, callback ) { $(this).fadeOut(opts.duration, callback); }
        },
        'slide': {
            show: function( opts ) { $(this).css('left', '100%').show().animate({ left: 0 }, opts.duration); },
            hide: function( opts, callback ) { $(this).animate({ left: -($(this).width()) }, opts.duration, function() {
                $(this).hide();
                callback();
            }); }
        },
        'scale': {
            show: function( opts ) {},
            hide: function( opts, callback ) {}
        }
    };
    
})(jQuery);