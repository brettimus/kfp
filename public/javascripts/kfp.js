
function img_for_name(name) {
    return name.toLowerCase().replace(" ", "_") + ".jpg";
}


var DONE_EVENT = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';


function bring_in(record) {
    var peeps = record.peeps;
    var i0 = img_for_name(peeps[0]);
    var i1 = img_for_name(peeps[1]);
    var i2 = img_for_name(peeps[2]);

    console.log(i0);

    function scroll_img(idx) {
        var peep = img_for_name(peeps[idx]);
        var when_done = {
            0: function() {
                scroll_img(1);
            },
            1: function() {
                scroll_img(2);
            },
            2: function() {
            }
        };
        $(".js-candidate-img-" + idx).html('<img width="256" height="256" src="/img/' + peep + '">').addClass('animated bounceInLeft').one(DONE_EVENT, when_done[idx]);
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

    scroll_img(0);
}


$(function () {
    bring_in(DB[0]);
});
