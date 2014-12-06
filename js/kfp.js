
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

    function p0() {
        $("#img0").html('<img width="256" height="256" src="img/' + i0 + '">').addClass('animated bounceInLeft').one(DONE_EVENT, p1);
    }

    function p1() {
        console.log("p1");
        $("#img1").html('<img width="256" height="256" src="img/' + i1 + '">').addClass('animated bounceInLeft').one(DONE_EVENT, p2);
    }

    function p2() {
        $("#img2").html('<img width="256" height="256" src="img/' + i2 + '">').addClass('animated bounceInLeft').one(DONE_EVENT, r0);
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

    p0();
}


$(function () {
    bring_in(DB[0]);
});
