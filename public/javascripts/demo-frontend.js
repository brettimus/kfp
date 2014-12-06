$(document).ready(function() {
    // animations when 
    var action_map = {
                  "kill": { animation: "hinge"},
                  "fuck": { animation: "pulse", delayed_animation: { delay: 3000, animation: "rollOut" }},
                  "prez": { animation: "flipOutY"},
                };

    $(".js-candidate-action").click(kfp_selection_handler);
    $(".js-reload").click(reload_handler);

    function reload_handler() {
        $(".animated").removeClass("animated pulse rollOut bounceOut flipOutY hinge");
        $(".u-disabled").removeClass("u-disabled");
        $(".selected").removeClass("selected");
    }

    function kfp_selection_handler(e) {
        var $target = $(this);
        if ($target.hasClass("selected")) return false;
        
        var action  = $target.data("action");
        // remove similar actions' 'selected' class
        ensure_global_uniqueness(action);
        $target.siblings().removeClass("selected");
        $target.addClass("selected");
        animate_img(action);
    }


    function animate_img(action) {
        if (!action_map[action]) { console.log("nonexistent action passed to animate_img"); return; }

        var animation = action_map[action].animation;
        var action_selector = "[class*=\"selected\"][data-action=\"%\"]".replace("%", action);
        var $img = $(action_selector)
                    .parents(".js-candidate-container")
                    .find(".js-candidate-img img");

        $img.addClass("animated " + animation);

        function hideActionSiblings() {
            $(action_selector).siblings().addClass("animated bounceOut");
            $("[data-action=\"%\"]".replace("%", action)).addClass("u-disabled");
            $(".selected[data-action=\"%\"]".replace("%", action)).removeClass("u-disabled");
        }

        var delayed_animation = action_map[action].delayed_animation;
        if (delayed_animation) {
            setTimeout(function() {
                $img.addClass(delayed_animation.animation);
                // EXECUTES ON THE END OF AN ANIMATION!
                $img.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', hideActionSiblings);

            }, delayed_animation.delay);
        } else {
            // EXECUTES ON THE END OF AN ANIMATION!
            $img.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', hideActionSiblings);
        }
    }
    
    function ensure_global_uniqueness(action) {
        var action_selector = "[data-action=\"%\"]".replace("%", action);

        function remove_other_selecteds(i, d) {
                var $conflicting_selection = $(d);
                $conflicting_selection.removeClass("selected");
        }

        $(action_selector).each(remove_other_selecteds);
    }
});