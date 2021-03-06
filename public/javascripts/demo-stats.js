var makeHistogram = function(svg, dims, data) {
    // data structure is {kill: [], fuck: [], prez: []}
    var liveData,
        margin = dims.margin,
        width = dims.width,
        height = dims.height,
        barWidth,
        barMargin,
        attrs,
        xScale,
        xAxis,
        noDecimalFormat = d3.format(".0f"),
        make_x_axis,
        yMax,
        yScale,
        yAxis,
        make_y_axis,
        yGrid,
        barColorScale = d3.scale.linear().range(["#c6c6c5","#5f5f5f"]),
        mouseOverHandler,
        mouseOutHandler,
        clickHandler,
        clickedClassName = "clicked-bar",
        hoverClassName = "hover-bar",
        tip,
        tipFunction;

    // *** Declare event handlers *** //
    tipFunction = function(d) {
        var result = "<h5>%day</h5><p>%value %pretty</p>";
        result = result.replace("%day", d.name)
                        .replace("%value", d.count)
                        .replace("%pretty", "");
        return result;
    };
    tip = d3.tip().attr('class', 'd3-tip').html(tipFunction);

    mouseOverHandler = function (d) {
        var this_bar = d3.select(this);
        this_bar.classed(hoverClassName, true);
        svg.selectAll("rect:not(." + hoverClassName + ")")
            .transition()
            .duration(400)
            .style("opacity", 0.3);
        tip.show(d);
    };
    mouseOutHandler = function (d) {
        d3.select(this)
            .select("." + hoverClassName)
            .classed(hoverClassName, false);
        svg.selectAll("rect:not(." + hoverClassName + ")")
            .transition()
            .delay(50)
            .duration(450)
            .style("opacity", 1);
        tip.hide(d);
    };

    clickHandler = function(d) {
        var d3_this = d3.select(this);
        var clickedWasClicked = d3_this.classed(clickedClassName);
        svg.select("." + clickedClassName)
            .classed(clickedClassName, false)
            .attr({
                fill: function(d) { return barColorScale(d.count); },
                "stroke-width": 0
            });

        if (clickedWasClicked) return;

        d3_this
            .classed(clickedClassName, true)
            .attr({
                fill: "#5aa5be",
                "stroke-width": 0
            });
    };


    var _updateDims = function() {
        width = dims.width;
        height = dims.height;
        console.log(width, height);
    };

    var _updateBarDims = function() {
        barWidth = Math.ceil(width / liveData.length);
        barMargin = Math.floor(barWidth / 10);
        attrs.bar.width = barWidth - barMargin;
    };
    var _updateScales = function() {
        // categorical scale
        var names = liveData.map(function(d) { return d.name; });
        console.log(names);
        xScale = d3.scale.ordinal().domain(names).rangeRoundBands([0, width]);
        yScale = d3.scale.linear().range([height, 0]);

        // need labels

        yMax = d3.max(liveData, function(d) { return d.count; });
        yScale.domain([0, 1.05*yMax]);
        barColorScale.domain(d3.extent(liveData, function(d) { return d.count; }));
    };

    var _updateAxes = function() {
        _update_xAxis();
        _update_yAxis();
    };
        var _update_yAxis = function() {
            make_y_axis = function () {
                return d3.svg.axis().scale(yScale)
                        .orient("left")
                        .ticks(5)
                        .tickFormat(noDecimalFormat);
            };
            yAxis = make_y_axis();

            // for gridlines
            yGrid = make_y_axis()
                    .tickSize(-width, 0, 0)
                    .tickFormat("");
        };

        var _update_xAxis = function() {
            make_x_axis = function () {
                var labels = liveData.map(function(d) { return d.name; });
                console.log();
                return d3.svg.axis().scale(xScale)
                        .orient("bottom");
            };
            xAxis = make_x_axis();
        };


    var update_sensitive_values = function(category) {

        liveData = data[category];
        // .sort(function(a, b) { return a.count - b.count; });
        _updateDims();
        _updateBarDims();
        _updateScales();
        _updateAxes();
    };

    // define an attributes object
    attrs = {
        bar: {
            x: function(d, i) { return i * xScale.rangeBand(); },
            y: function(d) { return yScale(d.count); },
            width: barWidth - barMargin,
            height: function(d) { return height - yScale(d.count); },
            fill: function(d) { return barColorScale(d.count); },
            "class": "bar"
        },
        xAxisText: {
            dx: "-.8em",
            dy: ".15em",
            transform: function(d) { return "rotate(-55)"; },
        },
        yAxisText: {
            y: 6,
            dy: ".71em",
            transform: "rotate(-90)"
        }
    };

    // let us begin
    update_sensitive_values("kill");

    svg
        .call(tip);
    svg
        .append("g")
        .attr("class", "x axis hist")
        .attr("transform", "translate(" + [0, height] + ")")
        .call(xAxis)
        .append("text")
        .attr(attrs.xAxisText);
    svg
        .append("g")
        .attr("class", "y axis hist")
        .call(yAxis)
        .append("text")
        .attr(attrs.yAxisText)
        .style("text-anchor", "end");
    svg
        .append("g")
        .attr("class", "grid")
        .call(yGrid);
    svg
        .selectAll("rect")
        .data(liveData)
        .enter()
        .append("rect")
        .attr({
            x: attrs.bar.x,
            y: attrs.bar.y,
            height: 0,
            width: attrs.bar.width
        })
        .on("mouseover", mouseOverHandler)
        .on("click", clickHandler)
        .transition()
        .duration(function(d, i) { return i * 500 / liveData.length; })
        .attr(attrs.bar);
    svg.
        on("mouseout", mouseOutHandler);

    // category is kill, fuck, or prez
    var update = function(category) {

        update_sensitive_values(category);

        var bars = svg
                    .selectAll(".bar")
                    .data(liveData);
        bars
            .exit()
            .transition()
            .delay(100)
            .duration(300)
            .attr({
                height: 0,
            })
            .remove();
        bars
            .transition()
            .delay(function(d,i) { return (i * 400 / liveData.length) ; })
            .duration(600)
            .attr(attrs.bar);
        bars
            .enter()
            .append("rect")
            .attr({
                x: attrs.bar.x,
                y: attrs.bar.y,
                height: 0,
                width: attrs.bar.width,
                fill: attrs.bar.fill
            })
            .transition()
            .delay(function(d,i) { return (i * 400 / liveData.length) + 150; })
            .duration(600)
            .attr(attrs.bar);  // add new


        svg.call(tip);

        bars.on("mouseover", mouseOverHandler);
        bars.on("mouseout", mouseOutHandler);
        bars.on("click", clickHandler);

        svg
            .select(".x.axis")
            .attr("transform", "translate(" + [0, height] + ")")
            .call(xAxis);

        svg
            .select(".y.axis")
            .transition()
            .delay(420)
            .duration(300)
            .call(yAxis);
        svg
            .select(".grid")
            .transition()
            .delay(210)
            .duration(350)
            .call(yGrid);
    };
    return { update: update };
};