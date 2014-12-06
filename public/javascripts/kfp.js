
function img_for_name(name) {
    return name.toLowerCase().replace(" ", "_") + ".jpg";
}


var DONE_EVENT = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';


var record = DB[0];

function make_scroll_name_img_f(idx, dir) {
    if (dir === undefined) {
        dir = "Left";
    }
    var r = function(cb) {
        return function () {
            $(".candidate-name-" + idx).html(record.peeps[idx].name).addClass('animated bounceIn' + dir);
            $(".js-candidate-img-" + idx).html('<img width="256" height="256" src="/img/' + img_for_name(record.peeps[idx].name) + '">').addClass('animated bounceIn' + dir).one(DONE_EVENT, cb);
        }
    }
    return r;
}

function fade_in_title_f(idx) {
    var r = function(cb) {
        return function () {
            $(".candidate-description-" + idx).html(record.peeps[idx].title).addClass('animated fadeIn').one(DONE_EVENT, cb);
        }
    }
    return r;
}

function run_animations(animations) {
    var idx;
    var f = function() { /*alert("foo");*/ }
    for (idx=animations.length-1; idx>=0; idx--) {
        f = animations[idx](f);
    }
    f();
}

function r0() {
    $("#e0").html(record.e_0).addClass('animated bounceInBottom').one(DONE_EVENT, r1);
}

function r1() {
    $("#e1").html(record.e_1).addClass('animated bounceInBottom').one(DONE_EVENT, r2);
}

function r2() {
    $("#e2").html(record.e_2).addClass('animated bounceInBottom');
}


$(function () {
    var ANIMATIONS = [
        make_scroll_name_img_f(0),
        fade_in_title_f(0),
        make_scroll_name_img_f(1, "Up"),
        fade_in_title_f(1),
        make_scroll_name_img_f(2, "Right"),
        fade_in_title_f(2),
    ];
    run_animations(ANIMATIONS);
});
