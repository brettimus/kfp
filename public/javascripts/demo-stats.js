var makeHistogram = function(svg, data) {
    // data structure is {kill: [], fuck: [], prez: []}
    var liveData,
        margin = { top: 10, right: 40, bottom: 50, left: 55 },
        width,
        height,
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
                fill: function(d) { return barColorScale(d[field]); },
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
        width = svg.attr("width");
        height = svg.attr("height");
    };

    var _updateBarDims = function() {
        barWidth = Math.ceil(width / data.length);
        barMargin = Math.floor(barWidth / 10);
        attrs.bar.width = barWidth - barMargin;
    };
    var _updateScales = function() {
        // categorical scale
        xScale = d3.time.scale().ordinal();
        yScale = d3.scale.linear().range([height, 0]);

        // need labels
        var labels = liveData.map(function(d) { return d.name; });
        xScale.domain(labels);

        yMax = d3.max(data, function(d) { return d.count; });
        yScale.domain([0, yMax]);
        barColorScale.domain(d3.extent(data, function(d) { return d.count; }));
    };

    var _updateAxes = function() {
        _update_xAxis();
        _update_yAxis();
    };
        var _update_yAxis = function() {
            make_y_axis = function () {
                return d3.svg.axis().scale(yScale)
                        .orient("left")
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
                return d3.svg.axis().scale(xScale)
                        .orient("bottom")
                        .tickValues(labels);
            };
            xAxis = make_x_axis();
        };


    var update_sensitive_values = function(category) {
        // SEQUENCING IS VERY IMPORTANT HERE!

        _updateDims();

        liveData = data[category];

        _updateBarDims();
        _updateScales();
        _updateAxes();
    };

    // define an attributes object
    attrs = {
        bar: {
            x: function(d, i) { return xScale(d.name) + barMargin; },
            y: function(d) { return yScale(d.count); },
            width: barWidth - barMargin,
            height: function(d) { return height - yScale(d.count); },
            fill: function(d) { return barColorScale(d.count); },
            "class": "bar"
        },
        xAxisText: {},
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
        .attr("transform", "translate(" + [barWidth/2 , chart.height] + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
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
        .duration(function(d, i) { return i * 500 / data.length; })
        .attr(attrs.bar);
    svg.
        on("mouseout", mouseOutHandler);

    // category is kill, fuck, or prez
    var update = function(category) {

        update_sensitive_values(timespan, offset);
        var bars = svg
                    .selectAll(".bar")
                    .data(data);
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
            .delay(function(d,i) { return (i * 400 / data.length) ; })
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
            .delay(function(d,i) { return (i * 400 / data.length) + 150; })
            .duration(600)
            .attr(attrs.bar);  // add new


        svg.call(tip);

        bars.on("mouseover", mouseOverHandler);
        bars.on("mouseout", mouseOutHandler);
        bars.on("click", clickHandler);

        svg
            .select(".x.axis")
            .attr("transform", "translate(" + [barWidth/2 , chart.height] + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr(attrs.xAxisText);
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