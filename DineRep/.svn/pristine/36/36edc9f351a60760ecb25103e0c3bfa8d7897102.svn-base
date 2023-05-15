// JavaScript source code
/// <reference path="~/jquery-1.10.2.min.js" />
/// <reference path="~/jquery-ui.min.js" />
/// <reference path="~/d3.js" />


var aqChart = function () {
    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    function splat(obj) {
        return isArray(obj) ? obj : [obj];
    }
    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }
    function intersectRect(p1, p2) {
        var r1 = p1.getBoundingClientRect();    //BOUNDING BOX OF THE FIRST OBJECT
        var r2 = p2.getBoundingClientRect();    //BOUNDING BOX OF THE SECOND OBJECT

        //CHECK IF THE TWO BOUNDING BOXES OVERLAP
        if (!(r2.left > r1.right ||
                 r2.right < r1.left ||
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top)) {
            d3.select(p2).attr("visibility", "hidden");

            return true;
        } else
            return false;
    }
    function ColorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }

        return rgb;
    }

    renderer = {
        classPrefix: "aq-chart-",
        group: function (parent, className) {
            return parent.append('svg:g').classed(className, true);
        },
        symbol: function (symbol, x, y, w, h) {
            x -= w / 2; y -= h / 2;

            symbol = symbol || "circle";
            obj = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            d3.select(obj).attr("d", this.symbols[symbol].call(this, x, y, w, h).join(' ')).attr("fill", "black");
            return obj;
        },
        symbols: {
            keys: ['circle', 'square', 'triangle', 'triangle-down', 'diamond'],
            'circle': function (x, y, w, h) {
                var cpw = 0.166 * w;
                return [
                    'M', x + w / 2, y,
                    'C', x + w + cpw, y, x + w + cpw, y + h, x + w / 2, y + h,
                    'C', x - cpw, y + h, x - cpw, y, x + w / 2, y,
                    'Z'
                ];
            },
            'square': function (x, y, w, h) {
                return [
                    'M', x, y,
                    'L', x + w, y,
                    x + w, y + h,
                    x, y + h,
                    'Z'
                ];
            },
            'triangle': function (x, y, w, h) {
                return [
                    'M', x + w / 2, y,
                    'L', x + w, y + h,
                    x, y + h,
                    'Z'
                ];
            },
            'triangle-down': function (x, y, w, h) {
                return [
                    'M', x, y,
                    'L', x + w, y,
                    x + w / 2, y + h,
                    'Z'
                ];
            },
            'diamond': function (x, y, w, h) {
                return [
                   ' M', x + w / 2, y,
                    'L', x + w, y + h / 2,
                    x + w / 2, y + h,
                    x, y + h / 2,
                    'Z'
                ];
            }
        },
        image: function (parent, url, x, y, w, h) {
            parent.append("image")
              .attr("x", x)
              .attr("y", y)
                .attr("width", w)
                .attr("height", h)
              .attr("xlink:href", url);
        }
    }

    baseSeries = {
        bindEvents: function (elements) {
            if (options.tooltip.enabled == true) {
                elements.attr("cursor", "pointer");
                elements.on("mousemove", function (d) { tick.show.call(this, d); })
                .on("mouseout", tick.hide);
            }

            if (options.chart.selectable == true) {
                elements.on("click", function (d) {
                    if (vis.select(".selected-point").empty()) {
                        vis.selectAll(".datapoint").attr("opacity", .3);
                        d3.select(this).select(".datapoint").attr("opacity", 1).classed("selected-point", true);
                        options.event.onSelect.call(this, d);
                    }
                    else {
                        vis.select(".selected-point").classed("selected-point", false);
                        vis.selectAll(".datapoint").attr("opacity", null);
                        options.event.onSelect.call(this, null);
                    }
                });
            }

        },
    }
    var Legend = function () {

        defaultStyle = {
            fill: "black",
            StrokeWidth: 1,
            symbol: "rect",
            lineType: "line",
            margin: { bottom: 5, top: 5 },
            fontSize: "15px"

        };
        var legendBox;

        init = function () {

        }

        function Legend(svg) {
            legendBox = svg.append("g").classed("legendGroup", true)
            .attr("transform", "translate(" + drawArea.left + "," + drawArea.bottom + ")");
        }

        Legend.render = function (data, options) {
            lineStyle = { line: "5 0", dashed: "5 5" };
            var Xpos = 0, YPos = 0, rSize = 10;

            for (var index in data.items) {
                item = data.items[index];
                style = $.extend({}, defaultStyle, item.itemStyle);
                style = $.extend(true, style, options.style);
                if (item.show == false)
                    continue;
                legendGroup = legendBox.append("g").datum(item);



                legendGroup.append("path")
                .attr("d", d3.svg.symbol().type(options.symbol).size(100))
                .attr("width", "15px")
                .attr("height", "15px")
                .attr("fill", style.fill);

                text = legendGroup.append("text")
                .text(item.name)
                .attr("x", 10)
                .attr("dy", ".3em")
                .attr("font-size", style.fontSize)
                .attr("fill", style.color);;

                if (options.layout == "horizontal") {
                    if (Xpos + 10 + legendGroup.node().getBBox().width > drawArea.width()) {
                        YPos += 5 + text.node().getBBox().height;
                        Xpos = 0;
                    }
                    legendGroup.attr("transform", "translate(" + Xpos + "," + YPos + ")");
                    Xpos += 10 + legendGroup.node().getBBox().width;
                } else {
                    legendGroup.attr("transform", "translate(" + Xpos + "," + YPos + ")");
                    YPos += 5 + text.node().getBBox().height;
                }
            }
            legendBox.selectAll("g").attr({ "cursor": "pointer" }).on("click", function (d, i) {
                if (ActPoints[i] == null) {
                    $(this).attr("opacity", 1);
                    ActPoints[i] = points[i];
                    seriesFn.hideSeries(i, ActPoints, false);
                } else {
                    $(this).attr("opacity", .5);
                    ActPoints[i] = null;
                    seriesFn.hideSeries(i, ActPoints, true);
                }
            })
            legendsBbox = legendBox.node().getBBox();
            legendAreaXPos = 0;
            legendAreaYPos = 0;

            if (options.verticalAlign == "bottom") {
                //drawArea.bottom -= defaultStyle.margin.bottom;//defaultStyle.margin.bottom + defaultStyle.margin.top;
                // + defaultStyle.margin.top - legendsBbox.height;
                drawArea.bottom -= legendsBbox.height;
                legendAreaYPos = drawArea.bottom;
                drawArea.bottom -= defaultStyle.margin.top + defaultStyle.margin.bottom;
            } else if (options.verticalAlign == "middle") {

            }
            else if (options.verticalAlign == "top") {
                legendAreaYPos = drawArea.top;
                drawArea.top += legendsBbox.height + defaultStyle.margin.bottom + defaultStyle.margin.top;
            }

            if (options.x) {
                legendAreaXPos = options.x;
            }
            else {
                if (options.align == "left") {
                    legendAreaXPos = drawArea.left;
                } else if (options.align == "center") {
                    legendAreaXPos = ((drawArea.right - drawArea.left) / 2) - (legendsBbox.width / 2);
                }
                else if (options.align == "right") {
                    legendAreaXPos = drawArea.right - legendsBbox.width;
                    legendAreaYPos=  legendAreaYPos + 80                
                }
            }

            legendBox.attr("transform", "translate(" + legendAreaXPos + "," + legendAreaYPos + ")");

            updateYScale();
        }

        Legend.GetHeight = function () {
            return legendBox.node().getBBox().height;
        }

        return Legend;
    }
    Tooltip = function () {

        var toolTipDiv;
        var option = {
            ArrowSize: 15,
            IsHTML: true
        };

        var format = function (d) {
            return d.y;
        }
        var isGrouped = false;

        var html = initNode();

        function initNode() {
            var node = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));
            node.append("path").attr("d", ToolTipShape());
            node.style({
                opacity: 0,
                pointerEvents: 'none',
                boxSizing: 'border-box',
                stroke: "gray",
                fill: "#A9483F",
                padding: "5px",
                top: -1000
            })

            if (option.IsHTML == true)
                toolTipDiv = d3.select("body").append("div").classed("tooltip", true).style({ "position": "absolute", "font-size": "12px", "fill": "white", "padding": "5px", "top": "-1000px" });
            else
                toolTipDiv = node.append("text").attr({ "font-size": "24px", "fill": "white", "stroke": "white" });

            return node.node();
        };

        function Tooltip(svg, setting) {
            svg.node().appendChild(html);
            option.Xlimit = svg.attr("width");// .node().getBBox().width;
            option.Ylimit = svg.attr("height");//.node().getBBox().height;
            format = setting.format;
            isGrouped = setting.isGrouped;
        }

        Tooltip.show = function () {
            tip = d3.select(html);
            d = d3.select(this).data()[0];
            tipShap = tip.select("path");
            var tipSize;
            // metrix = html.node().getScreenCTM();

            if (isGrouped) {
                pointIndex = d3.select(this).data()[0].x;
                for (var i in points[0])
                    valueArray = points.map(function (d, i) {
                        return d.filter(function (d) { return pointIndex == d.x; });
                    });
                toolTipText = "";
                for (var index in valueArray) {
                    obj = valueArray[index];
                    toolTipText += "<div>" + format(obj[0]) + "</div>";
                }
                toolTipDiv.html(toolTipText);
            } else {
                toolTipDiv.html(format(d));
            }


            if (option.IsHTML == true) {
                tipSize = toolTipDiv.node().getBoundingClientRect();
            }
            else {
                tipSize = toolTipDiv.node().getBBox();
            }
            var matrix = this.getScreenCTM()
                .translate(+this.getAttribute("cx"),
                         +this.getAttribute("cy"));

            RequireWidth = (d3.event.offsetX + tipSize.width);
            var LapsWidth = 0;
            if (option.Xlimit < RequireWidth) {
                LapsWidth = RequireWidth - option.Xlimit;
            }

            tip.select("path").attr("d", ToolTipShape(LapsWidth, 0, tipSize.width, tipSize.height));

            CenterPosition = xRange(d.x);
            if (option.IsHTML == true) {
                toolTipDiv.style({
                    "position": "absolute",
                    "left": (d3.event.clientX - tipSize.width / 2) + "px",
                    "top": (d3.event.clientY + 20) + "px"
                });
            } else {
                toolTipDiv.attr("y", tipSize.height + 15)
                .attr("x", -LapsWidth + 5);
            }

            toolTipDiv.style({ opacity: 1 });
            d3.select(html).style({ opacity: 0 })
            .transition()
            .duration(100)
            .attr("transform", "translate(" + d3.event.offsetX + "," + d3.event.offsetY + ")");
        };

        Tooltip.hide = function () {
            d3.select(html).transition()
                .duration(50).style({ opacity: 0 });
            toolTipDiv.style({ opacity: 0, top: -1000 + "px" });
        }

        function ToolTipShape(xd, yd, width, height) {
            var x = 0, y = 0;
            var w = width || 0;
            var h = height || 0;
            var ah = 0;
            var aw = 0;

            var xDiff = xd == undefined ? 0 : xd, yDiff = yd == undefined ? 0 : yd;

            Path = [
                'M', x, y,
                'L', aw, ah,
                'L', (w - xDiff), ah,
                'L', (w - xDiff), (ah + h),
                'L', (x - xDiff), (ah + h),
                'L', (x - xDiff), (ah),
                'L', x, ah,
                'L', x, ah,
                'Z'
            ];
            return Path.join(" ");
        }

        return Tooltip;
    }

    var theme = {
        //colors: ["#A6CC54", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]
        colors: []
    }

    var defaults = {
        chart: {
            renderTo: "",
            width: 400,
            height: 150,
            margins: {
                top: 15,
                right: 5,
                bottom: 5,
                left: 5
            },
            animate: true,
            animationDuration: 1000,
            selectable: true
        },
        xAxis: {
            enabled: true,
            gridlines: true,
            rotate: true,
            style: {}
        },
        yAxis: {
            enabled: true,
            gridlines: true
        },
        custom: false,
        event: {
            onSelect: function () {
                // alert("selected");
            },
            onResetSelection: function () { }
        },
        plotOptions: {
            hideOverlapLabel: false,
            pie: {
                position: "left",
                outerRadius: undefined,
                innerRadius: 0
            },
            animation: true,
            xAxis: {
                format: function (d) { return d },
                position: "bottom",
                baseline: true
            },
            label: [{
                enabled: true,
                position: "outside",
                border: ""
            }]
        },
        legend: {
            enabled: true,
            layout: "horizontal",
            align: "center",          
            verticalAlign: "bottom",
            symbol: "square"
        },
        tooltip: {
            enabled: true,
            format: function (d) { return d.key + "<div>" + d.y + "</div>"; }
        },
        Selections: {
            SelectedPoint: null
        },
        theme: {
            colors: ["#E1477A", "#4F4E81", "#74CABD", "#8D8378", "#D8CD49", "#d0743c", "#ff8c00"]
        }
    };

    var  //Variable for individule settings and options
    options = {},
    points,
    ActPoints,
    chart,
    chartGroup,
    plotOptions,
    seriesPlotOption,
    series,
    drawArea = {
        left: 0, right: 0, top: 0, bottom: 0,
        width: function () {
            return this.right - this.left;
        },
        height: function () {
            return this.bottom - this.top;
        }
    },
    seriesArea,
    seriesPoints = [],
    categories = [],
    markers = [],
    vis;

    var //Scaling Variable/Function
    xAxisScale = d3.scale.ordinal(),
    xRange = d3.scale.ordinal(),
    xGroupScale = d3.scale.ordinal(),
    yScale = d3.scale.linear(),
    tick;
    seriesIsGrouped = true;

    var labels = [];
    var pointWidth;
    var pointPadding = 3;
    var outerPadding = 5;

    function processData() {
        if (options.chart.type == "stackedColumn" || options.chart.type == "stackedBar") {
            newArr = points.map(
                function (d) { var y0 = 0; return d.map(function (d) { return d.y }) });
            length = d3.max(newArr.map(function (d) { return d.length }));
            for (var i = 0; i < length; i++) {
                y0 = 0;
                total = d3.sum(points.map(function (d) {
                    return d[i]
                }), function (d) { return d.y })
                for (var j = 0; j < points.length; j++) {

                    obj = points[j][i];
                    percentValue = total == 0 ? 0 : (obj.y / total) * 100;
                    if (obj == undefined)
                        continue;
                    obj["y0"] = y0;
                    y0 += percentValue;
                    obj["y1"] = y0;
                    obj["percentage"] = percentValue;
                }
            }
        }
    }

    function Chart(settings) {
        options = $.extend(true, {}, defaults, settings);
        points = [];//options.data;
        chart = options.chart;
        theme.colors = options.theme.colors;

        if (["pie", "aster-pie"].indexOf(chart.type) > -1)
            chartGroup = "pie";
        else
            chartGroup = chart.type;

        points = getSeries(options.series);
        ActPoints = points.slice();

        seriesPlotOption = options.plotOptions[chartGroup];

        if (options.plotOptions.colors)
            theme.colors = options.plotOptions.colors;

        drawArea.top = 0 + chart.margins.top,
        drawArea.bottom = chart.height - chart.margins.bottom,
        drawArea.left = chart.margins.left,
        drawArea.right = chart.width - chart.margins.right

        seriesArea = $.extend(true, {}, drawArea);

        if (chart.type == "bar" || chart.type == "stackedBar") {
            seriesArea = {
                left: function () { return drawArea.top },
                right: function () { return drawArea.bottom },
                top: function () { return drawArea.left },
                bottom: function () { return drawArea.right },
                width: function () { return drawArea.height(); },
                height: function () { return drawArea.width(); }
            }
        } else {
            seriesArea = {
                left: function () { return drawArea.left },
                right: function () { return drawArea.right },
                top: function () { return drawArea.top },
                bottom: function () { return drawArea.bottom },
                width: function () { return drawArea.width(); },
                height: function () { return drawArea.height(); }
            }
        }

        d3.select("#" + chart.renderTo).selectAll("svg").remove();
        vis = d3.select("#" + chart.renderTo).append("svg").attr("id", "chart-" + chart.renderTo)
        .attr("width", chart.width)
        .attr("height", chart.height)
        .attr("font-family", "'oswald', 'calibri'");

        if (!isArray(options.plotOptions.label))
            options.plotOptions.label = [options.plotOptions.label];

        if (options.tooltip.enabled == true) {
            tick = new Tooltip()
            tick(vis, options.tooltip);
        }

        processData();
        init();
        render();
    }

    function init() {
        xRange
            .domain(getXDomain(points))
        .rangeBands([seriesArea.left(), seriesArea.width()]);

        xAxisScale
            .domain(getXDomain(points))
        .rangePoints([seriesArea.left(), seriesArea.width()], 1);

        extentPoint = getExtentDataPoint(points);

        yScale
            .domain(
            getYDomain([extentPoint.min, extentPoint.max])
            )
            .range([seriesArea.bottom(), seriesArea.top()], .5)
            .nice(5).clamp(true);

        xGroupScale.domain("Value");
        categories = getXDomain(points);
    }

    function render() {
        var self = this;
        seriesFn = seriesFn.call(this, chartGroup);

        if (options.legend.enabled == true)
            drawLegends();

        if (chartGroup != "pie") {
            xAxisLayout = 'hor';
            yAxisLayout = 'ver';
            if (chartGroup == "bar" || chartGroup == "stackedBar") {
                xAxisLayout = 'ver';
                yAxisLayout = 'hor';
            }


            yAxis = new Axis(yScale.ticks(6).reverse(), options.yAxis, false, yAxisLayout);
            yAxis.render();
            xAxis = new Axis(categories, options.xAxis, true, xAxisLayout);
            xAxis.render();
            if (options.yAxis.enabled == true)
                yAxis.corrPosition();
            xAxis.corrPosition();

        }
        if (options.custom.images)
            drawCustomImages(options.custom.images);

        seriesFn.render(points);

        if (options.plotOptions.label) {
            options.plotOptions.label.forEach(function (d, i) {
                if (d.enabled == true) {
                    labelFn = seriesFn.drawLabel || drawLabel;
                    positionFn = seriesFn.corrLabelPosition || corrLabelPosition;
                    labels = labelFn(points, d, positionFn);
                    //positionFn(labels, d);
                }
                // corrLabelPosition(d);
            });
        }

        if (options.custom.labels)
            drawCustomLabels(options.custom.labels);
        if (options.plotOptions.table)
            drawCustomTabel(options.plotOptions.table);


        if (options.plotOptions.hideOverlapLabel == true)
            checkCollision();
    }

    Chart.update = function (newData) {

        vis.select(".NoData").remove();
        if (newData.length == 0) {
            NoDataAvilable()
            return;
        }
        if (!isArray(newData[0]))
            newData = [newData];

        if (typeof options.custom === "object") {
            for (index in points) {
                points[index] = customData(newData[index], points[index][0].key, options.custom);
            }
        } else {
            points = newData;
        }
        processData();
        init();
        //updateXScale();
        updateYScale();
        seriesFn.redraw(points);

        vis.selectAll(".aq-chart-data-labels").remove();

        if (options.plotOptions.label)
            options.plotOptions.label.forEach(function (d, i) {
                if (d.enabled == true) {
                    labelFn = seriesFn.drawLabel || drawLabel;
                    positionFn = seriesFn.corrLabelPosition || corrLabelPosition;
                    labels = labelFn(points, d, positionFn);
                }
                // corrLabelPosition(d);
            });

        if (options.plotOptions.table)
            drawCustomTabel(options.plotOptions.table);


    }

    function checkCollision() {
        lbl = vis.selectAll(".aq-chart-label")[0];
        var counter = 0;
        for (var i = 0; i < lbl.length - 1; i++) {
            for (j = i + 1; j < lbl.length - 1; j++)
                if (intersectRect(lbl[i], lbl[j]));
            j++;
            counter++;
        }

    }

    function NoDataAvilable() {
        vis.append("text")
           .classed("NoData", true)
           .attr("x", chart.width / 2)
           .attr("y", chart.height / 2)
           .text("No data available.")
           .attr("text-anchor", "middle");
    }

    var Axis = function (axisPoints, userOptions, isX) {
        this.init.apply(this, arguments);
    };

    Axis.prototype = {
        ticks: [],
        defaultStyle: {
            fontSize: "12px",
            color: "#333",
            padding: 0
        },
        options: {
            enabled: true, format: function (d) {
                return d;
            }
        },
        data: {},
        axisPoints: [],
        wrapper: {},
        gridlines: {},
        style: {},
        isX: true,
        layout: "hor",
        scaleFn: function () { return 0; },
        init: function (categories, userOptions, isX, layout) {
            this.options = $.extend(true, this.options, userOptions);
            this.style = $.extend(this.defaultStyle, userOptions.style);
            this.pointWidth = xRange.rangeBand() / 2;
            this.data = categories;
            this.isX = isX;
            this.scaleFn = isX == true ? xAxisScale : yScale;
            this.layout = layout;
            axisName = "";
            if (this.isX) {
                axisName = "x-axis";
            } else {
                axisName = "y-axis";
            }
            if (this.isX == false && this.layout == "hor") {
                // this.scaleFn = d3.scale.linear().range(yScale.range()).domain(yScale.domain().reverse());
                this.scaleFn = yScale.domain(yScale.domain().reverse());
            }
            this.gridlines = vis.append("g").classed("gridlines", true);
            this.wrapper = renderer.group(vis, axisName);
        },
        render: function () {
            var options = this.options;
            if (this.options.enabled == false)
                return;
            var style = this.style,
                scaleFn = this.scaleFn,
                axisName;

            if (this.isX) {
                axisName = "x-axis";
            } else {
                axisName = "y-axis";
            }


            XAxisGroup = this.wrapper;

            AxisGroup = updateElements(XAxisGroup, "aq-chart-axis-label", this.data);
            this.axisPoints = AxisGroup;
            AxisGroup
                .append("text")
                .classed("lblAxis", true)
                .attr("text-anchor", this.layout == "hor" ? "middle" : "start")
                .text(function (d) { return options.format.call(this, d); })
                .attr("font-size", style.fontSize)
                .attr("fill", style.color)
                .attr("dy", ".5em");

            XAxisGroup.selectAll(".aq-chart-axis-label");

            //if (options.baseline) {
            //    this.wrapper.append("line")
            //    .attr({ x1: drawArea.left, x2: drawArea.right, y1: 0, y2: 0 })
            //    .attr({ "stroke-width": "1px", "stroke": "#ccc" });
            //}

            isOverlap = false;
            rotatePoint = "";

            if (this.layout == "hor") {
                var w = scaleFn.rangeBand ? xRange.rangeBand() : pointWidth;
                wrap(AxisGroup.selectAll(".lblAxis"), w);
            }
            if (this.layout == "hor" && options.rotate != false) {

                XAxisGroup.selectAll(".aq-chart-axis-label")[0].forEach(function (d, i) {
                    if (d.getBBox().width > xRange.rangeBand()) {
                        isOverlap = true;
                        rotatePoint = "rotate(-45)";
                        return;
                    }
                });
                XAxisGroup.selectAll(".aq-chart-axis-label").selectAll("text").attr("transform", rotatePoint);
            }



            this.corrPosition(isOverlap);
            //rotatePoint = isOverlap == true ? "rotate(-45)" : "";


            if (this.layout == "hor") {
                drawArea.bottom -= XAxisGroup.node().getBBox().height / 2;
                XAxisGroup.attr("transform", "translate(" + 0 + "," + (drawArea.bottom) + ")");
                drawArea.bottom -= XAxisGroup.node().getBBox().height / 2 - style.padding;
            }
            else {
                XAxisGroup.attr('transform', 'translate(' + (drawArea.left) + ',0)');
                drawArea.left += XAxisGroup.node().getBBox().width + style.padding;
            }
            updateYScale();
            updateXScale();


            // updateYScale();
        },
        corrPosition: function (isOverlap) {
            if (this.options.enabled == false)
                return;

            xFn = this.layout == "hor" ? this.scaleFn : function () { return 0; };
            yFn = this.layout == "hor" ? function () { return 0; } : this.scaleFn;

            this.axisPoints.attr('transform', function (d, i) {
                return 'translate(' +
                    xFn.call(this, d) + ',' + yFn.call(this, d) + ')';
            });



            if (this.isX == true) {
                if (options.xAxis.gridlines == true) {
                    this.drawGrid();
                }
            } else {
                if (options.yAxis.gridlines == true) {
                    this.drawGrid();
                }
            }
        },
        redraw: function () {

            yAxisGroup = vis.select(".Y-Axis");

            axisGroup = updateElements(yAxisGroup, "aq-chart-yaxis-label", yScale.ticks().reverse());

            axisGroup.classed("aq-chart-yaxis-label", true).selectAll(".lblAxis").remove();

            axisGroup.append("text")
                            .classed("lblAxis", true)
                           .attr("text-anchor", "middle")
                           .text(function (d) { return d })
                           .attr("font-size", "12px")
                           .attr("fill", 'gray')
                           .attr("dy", ".4em");

            axisGroup
            .attr('transform', function (d) {
                return 'translate(10,' + yScale(d) + ')';
            });

            this.drawGrid();
        },
        drawGrid: function () {
            var x1, x2, y1, y2;

            xFn = this.layout == "hor" ? this.scaleFn : function () { return 0; };
            yFn = this.layout == "hor" ? function () { return 0; } : this.scaleFn;

            if (this.layout == "hor") {
                x1 = 0;
                x2 = 0;
                if (chart.type == "bar") {
                    y1 = seriesArea.left();
                    y2 = seriesArea.right();
                } else {
                    y1 = seriesArea.top();
                    y2 = seriesArea.bottom();
                }

            } else {
                y1 = 0;
                y2 = 0;
                if (chart.type == "bar") {
                    x1 = seriesArea.top();
                    x2 = seriesArea.bottom();
                } else {
                    x1 = seriesArea.left();
                    x2 = seriesArea.right();
                }

            }

            gridLines = this.gridlines.selectAll("line")
            .data(this.data);
            gridLines.enter().append("line");
            gridLines.exit().remove();

            gridLines.attr({ "x1": x1, "x2": x2, "y1": y1, "y2": y2, "stroke-width": "1px", "stroke": "#D8D8D8" });
            gridLines.attr("transform", function (d) {
                return "translate(" + xFn(d) + "," + yFn(d) + ")";
            });

        }
    }
    function updateElements(wrapper, selector, data, elementType) {
        elementType = elementType || "g";
        elements = wrapper.selectAll("." + selector)
             .data(data);
        elements.enter()
            .append('svg:' + elementType).classed(selector, true)
        elements.exit().remove();

        return elements;
    }

    function corrLabelPosition(labels, position, index) {

        y = labels.style.y || 0;
        labelStartPosition = seriesIsGrouped == true ? ((pointWidth + pointPadding) * index) + outerPadding : 0 + outerPadding;

        wrapper = labels.svgNode;
        var style = labels.style;
        wrapper.attr('transform', "translate(" + labelStartPosition + ",10)");
        if (options.chart.type == "line") {
            wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                return 'translate(' + (xRange(d.x) + xRange.rangeBand() / 2) + ',' + (yScale(d.y) - 20) + ')';
            });
        }
        else {
            if (position == "inside") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (outerPadding + pointWidth) / 2) + ',' + (yScale(0) - d3.select(this).node().getBBox().height / 2 - ((yScale(0) - yScale(d.y)) / 2)) + ')';
                });
            } else if (position == "top") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (pointWidth + pointPadding) / 2) + ',' + (0 + style.margin.bottom + y) + ')';
                });
            } else if (position == "bottom") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (pointWidth + pointPadding) / 2) + ',' + (drawArea.bottom + style.margin.bottom + y) + ')';
                });
            } else {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    if (yScale(0) < yScale(d.y))
                        return 'translate(' + (xRange(d.x) + (pointWidth + pointPadding) / 2) + ',' + (yScale(0) - ((yScale(0) - yScale(d.y)))) + ')';
                    else
                        return 'translate(' + (xRange(d.x) + (pointWidth + pointPadding) / 2) + ',' + (yScale(0) - d3.select(this).node().getBBox().height - ((yScale(0) - yScale(d.y)))) + ')';
                });
            }
        }
    }

    function drawLabel(series, setting, positionFn) {
        var defaultStyle = {
            position: "top",
            format: function (d) {
                return d.y;
            },
            style: {
                fontSize: "12px",
                color: "black"

            }, margin: { bottom: 0 }

        };
        var labelGroup = [], labels;

        setting = $.extend(true, defaultStyle, setting);
        style = setting.style;


        color = isFunction(style.color) ? style.color : function (d, i) { return style.color; };

        series.forEach(function (d, i) {

            wrapper = vis.append('svg:g')
                    .classed("aq-chart-data-labels", true);

            labelGroup.push({ style: setting, svgNode: wrapper });

            labels = updateElements(wrapper, "aq-chart-label", d);

            if (setting.border == "circle")
                labels.append("circle")
                .attr("r", 20)
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "#DDDDDD");

            labels
            .append("text")
            .text(function (d) { return setting.format.call(this, d); })
            .attr("text-anchor", "middle")
            .attr("font-size", style.fontSize)
            .attr("fill", color)
            ;

            PosY = 0;

            if (setting.position == "baseline") {
                PosY = yScale(0);
            }

            //labels.attr('transform', function (d) {
            //    return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(d.y) - 12) + ')';
            //});

            labelStartPosition = seriesIsGrouped == true ? ((pointWidth + pointPadding) * i) + outerPadding : 0 + outerPadding;

            wrapper.attr('transform', "translate(" + labelStartPosition + ",10)");
            positionFn(labelGroup[i], setting.position, i);
        });
        return labelGroup;
    }

    function drawLegends() {
        defaultStyle = {
            fill: "",
            StrokeWidth: 1,
            symbol: "square",
            lineType: "line",
            margin: { bottom: 10, top: 10 }
        }
        var legends = new Legend();

        legends(vis);
        legendList = [];

        if (chartGroup == "pie") {
            for (var index in categories) {
                var _style = $.extend({}, defaultStyle, { fill: theme.colors[index] });
                legendList.push({ name: categories[index], itemStyle: _style });
            }
        }
        else {
            for (var index in options.series) {
                series = options.series[index];
                defaultStyle.fill = theme.colors[index];
                var _style = $.extend({}, defaultStyle, series.style);

                _name = series.name ? series.name : "Series " + index;

                legendList.push({ name: _name, itemStyle: _style });
            }
        }
        legends.render.call(this,
               {
                   items: legendList
               },
           options.legend);
    }

    function drawCustomImages(images) {
        images.forEach(function (d) {
            renderer.image(vis, d.url, d.x, d.y, d.width, d.height);
        });
    }

    function drawCustomLabels(customLabels) {
        defaultStyle = { fontSize: "12px", fontWeight: "normal", position: "start" };
        for (var index in customLabels) {
            style = $.extend(true, defaultStyle, customLabels[index].style);
            label = customLabels[index];
            vis.append("text")
            .style({ "font-size": style.fontSize, "fill": style.color, "text-anchor": style.position, "font-weight": style.fontWeight })
            .text(label.text)
            .attr("transform", "translate(" + label.x + "," + label.y + ")");
        }
    }

    function drawCustomTabel(options) {
        var defaultStyle = { fontSize: "12px", color: "black" };

        options["x"] = options["x"] || 0;
        options["y"] = options["y"] || 0;
        vis.select(".table").remove();
        table = vis.append("g").classed("table", true);

        for (var index in points[0]) {
            point = points[0][index];
            row = table.append("g").classed("row", true)
                .attr("transform", "translate(0," + (options.row.height * index) + ")");
            var xPos = 0;

            for (var prop in options.column) {
                var col = options.column[prop];

                colStyle = $.extend(defaultStyle, col.style);
                var color = isFunction(colStyle.color) ? colStyle.color : function (d) { return colStyle.color; }
                if (col.type == "text") {
                    element = row.append("text")
                                    .text(col.format(point[col.prop]))
                                    .attr("dy", ".3em")
                                    .style({ "font-size": colStyle.fontSize, "fill": color(point[col.prop]) })
                                    .classed("col" + prop, true);
                } else if (col.type == "symbol") {
                    element = row.append("path")
                                    .attr("d", d3.svg.symbol().type("circle").size(100))
                                    .attr("fill", theme.colors[index])
                                    .classed("col" + prop, true);
                }
            }
        }

        xPos = 10;
        for (var index in options.column) {
            colId = ".col" + index;
            var colStyle = $.extend({}, options.column[index].style);
            var colWidth = 0;

            vis.selectAll(colId).attr("transform", "translate(" + xPos + ",0)");

            if (colStyle.width)
                colWidth = colStyle.width;
            else
                colWidth = d3.max(table.selectAll(colId)[0].map(function (d, i) { return d.getBBox().width }));
            xPos += colWidth + 5;
        }

        row.append("line").attr({ x1: 0, x2: 200, y1: 25, y2: 25 }).attr({ "stroke-width": 1 });

        tableBBox = table.node().getBBox();

        table.attr("transform", "translate(" + options.x + "," + (drawArea.top + options.y) + ")");
    }

    var GetColor = function (value) {
        var colorPositive = ["#699F54"];
        var colorNegative = ["#BF4041"];
        if (value < 0)
            return colorNegative;
        else
            return colorPositive;
    }

    function getSeries(series) {
        var seriesData = [];
        if (options.custom != false) {
            //tempSeries = d3.map(
            //    series.map(function (d, i) { return { data: d.data, name: d.name == undefined ? "Series " + 1 : d.name } }),
            //function (d, i) { return d.name });
            for (var index in series) {
                if (!series[index].name) {
                    series[index].name = "Series " + (+index + 1);
                }
                list = series[index].data;
                var data = customData(list, series[index].name, options.custom);
                seriesData.push(data);
                //Seriesdata[series[index].name] = data;
            }
        } else {
            for (var index in series) {
                seriesData.push(series[index].data);
            }
        }
        return seriesData;
    }

    function getYDomain(ExtentValues) {
        Domain = [];
        var MinY;
        var MaxY;
        if (chart.type == "bar")
            if (Math.abs(ExtentValues[0]) > ExtentValues[1])
                ExtentValues[1] = Math.abs(ExtentValues[0]);
            else
                ExtentValues[0] = -ExtentValues[1];
        if (ExtentValues[0] < 0) {
            if (Math.abs(ExtentValues[0]) > Math.abs(ExtentValues[1])) {
                Domain.push(0 - Math.abs(ExtentValues[0]));
                Domain.push(Math.abs(ExtentValues[0]));
            } else {
                Domain.push(0 - Math.abs(ExtentValues[1]));
                Domain.push(Math.abs(ExtentValues[1]));
            }
        }
        else {
            // var threshold =0.5;
            if (options.yAxis.threshold) {
                var difference = (ExtentValues[1] - ExtentValues[0]) * options.yAxis.threshold;
                //  Domain.push(ExtentValues[0] - difference);
                Domain.push(ExtentValues[0]);
                Domain.push(ExtentValues[1] + difference);
            } else {
                Domain.push(ExtentValues[0]);
                Domain.push(ExtentValues[1]);
            }
        }
        return Domain;
    }

    function getXDomain(data) {
        var DomainList = [];

        for (var i = 0; i < data.length; i++) {
            DomainList.push(
                data[i].map(function (d) {
                    return d.x;
                })
            );
        }

        return d3.set(d3.merge(DomainList)).values();
    }

    function getExtentDataPoint(DataArray) {


        var minValue = 0;
        var maxValue = 0;
        if (chart.type == "stackedColumn" || chart.type == "stackedBar") {
            length = d3.max(points.map(function (d) { return d.length }));
            minValue = 0;
            maxValue = 100;
            //minValue = d3.min(points, function (d) {
            //    return d[0].y1;
            //});
            //maxValue = d3.max(points, function (d) {
            //    return d[length - 1].y1;
            //});
        }
        else {
            for (dataList in DataArray) {
                var tempValue = d3.min(DataArray[dataList], function (d) {
                    return d.y;
                });
                minValue = tempValue < minValue ? tempValue : minValue;
                tempValue = d3.max(DataArray[dataList], function (d) {
                    return d.y;
                });
                maxValue = tempValue > maxValue ? tempValue : maxValue;
            }
        }
        return { min: minValue, max: maxValue };
    }

    function seriesFn(chartType) {

        //return this[chartType + "Series"];

        switch (chartType) {
            case "column":
                return columnSeries;
            case "stackedColumn":
                return stackedColumnSeries;
            case "customLever":
                return customLeverSeries;
            case "columnSquare":
                return columnSquareSeries;
            case "columnPie":
                return columnPieSeries;
            case "line":
                return lineSeries;
            case "pie":
                return pieSeries;
            case "bar":
                return barSeries;
            case "stackedBar":
                return stackedBarSeries;
            case "area":
                return areaSeries;
            default:
        }
    }

    function customData(dataSet, seriesKey, CustomObject) {
        var data = [];
        for (var index in dataSet) {
            obj = {
                key: seriesKey,
                x: dataSet[index][CustomObject.x],
                y: dataSet[index][CustomObject.y] == null ? null : +dataSet[index][CustomObject.y]
            }
            data.push($.extend(true, dataSet[index], obj));
        }
        return data;
    }

    Chart.ClearSelection = function () {
        vis.selectAll(".bar").attr("opacity", null);
        options.Selections.SelectedPoint = null;
        options.event.onResetSelection();
    }

    function updateYScale() {
        xRange
           .rangeBands([seriesArea.left(), seriesArea.right()]);

        xAxisScale.rangePoints([seriesArea.left(), seriesArea.right()], 1);

        yScale.range([seriesArea.bottom(), seriesArea.top()], .5).nice();
    }

    function updateXScale() {
        xRange
            .rangeBands([seriesArea.left(), seriesArea.right()]);

        xAxisScale.rangePoints([seriesArea.left(), seriesArea.right()], 1);

        yScale.range([seriesArea.bottom(), seriesArea.top()], .5).nice();
    }

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width && line.length > 1) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(word);
                }
            }

        });
    }

    var columnSeries = {
        defaultOptions: { pointPadding: 5 },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index],
                fill: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            var self = this;
            var _style;
            var _options = this.options;
            outerPadding = this.options.outerPadding ? this.options.outerPadding : xRange.rangeBand() * .1,
            pointPadding = this.options.pointPadding;
            colWidth = this.options.width;
            color = isFunction(_options.color) ? _options.color : function (i) { return _style.fill; }



            transitionAmount = 0;

            pointWidth = ((xRange.rangeBand()) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;

            if (colWidth != undefined) {
                outerPadding += ((pointWidth - colWidth) * series.length) / 2;
                pointWidth = colWidth;
            }
            var BaseLine = 0;

            if (options.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g");
                _style = self.getStyle(i);
                if (_options.maskImage) {
                    var url = _options.maskImage.url, w = _options.maskImage.width, h = _options.maskImage.height;

                    maskImages = BarGroup.selectAll("image")
                    .data(data).enter().append("image")
                    .attr("xlink:href", url)
                    .attr({ "width": w, "height": h })
                    .attr("x", function (d, i) {
                        return xRange(d.x) + (xRange.rangeBand() / 2) - (w / 2) - outerPadding;
                    })
                        .attr("y", function (d) { return drawArea.top });
                }
                bars = BarGroup.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("rect")
                          .classed('bar', true)
                          .attr("x", function (d) { return xRange(d.x) + pointPadding / 2 })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke", "none")
                          .attr("fill", color);

                if (_style.border) {
                    bars.attr({ "stroke-width": _style.border, "stroke": _style.borderColor });
                }

                if (options.chart.selectable != false)
                    bars.on("click", function (d) {
                        SelectedPoint = null;

                        if (options.Selections.SelectedPoint == d.x) {
                            vis.selectAll(".bar").attr("opacity", null);
                            options.Selections.SelectedPoint = null;
                        }
                        else {
                            vis.selectAll(".bar").attr("opacity", .3);
                            d3.select(this).attr("opacity", 1);
                            options.Selections.SelectedPoint = d.x;
                            SelectedPoint = d;
                        }

                        options.event.onSelect.call(this, SelectedPoint);
                    });
                if (options.tooltip.enabled == true) {
                    bars.attr("cursor", "pointer");
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                bars
                    .transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(d.y) - yScale(BaseLine))
                    })
                    .attr("y", function (d) {
                        if (d.y < 0)
                            return yScale(BaseLine);
                        else
                            return yScale(d.y);
                    });

                BarGroup.attr("transform", "translate(" + (((pointWidth + pointPadding) * i) + outerPadding) + ",0)");

                seriesPoints.push(BarGroup);

            });

            if (options.xAxis.baseline == true) {
                baseLine = vis.append("g").classed("Axis-line", true);

                baseLine.append("line")
                .attr("x1", drawArea.left)
                .attr("x2", chart.width)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke-width", "1px")
                .attr("stroke", "gray");

                baseLine.attr("transform", "translate(0," + (yScale(BaseLine)) + ")");
            }
        },
        redraw: function (series) {
            transitionAmount = 0;
            var _options = this.options;
            color = isFunction(_options.color) ? _options.color : function (i) { return _style.fill; }
            pointWidth = ((drawArea.width() / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            var BaseLine = 0;
            if (options.plotOptions.animation == true)
                transitionAmount = 1000;
            series.forEach(function (d, i) {

                var data = d;
                var BarGroup = seriesPoints[i];
                var seriesName = d[0].key;

                bars = updateElements(seriesPoints[i], "bar", d);

                bars.classed('bar', true)
                          .attr("x", function (d) { return xRange(d.x) + pointPadding / 2 })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke", "none")
                          .attr("fill", color)
                          .on("click", function (d) {
                              SelectedPoint = null;
                              if (options.Selections.SelectedPoint == d.x) {
                                  vis.selectAll(".bar").attr("opacity", null);
                                  options.Selections.SelectedPoint = null;
                              }
                              else {
                                  vis.selectAll(".bar").attr("opacity", .3);
                                  d3.select(this).attr("opacity", 1);
                                  options.Selections.SelectedPoint = d.x;
                                  SelectedPoint = d;
                              }

                              options.event.onSelect.call(this, SelectedPoint);
                          });

                if (options.tooltip.enabled == true) {
                    bars.attr("cursor", "pointer");
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }


                bars.transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(d.y) - yScale(BaseLine))
                    })
                    .attr("y", function (d) {
                        if (d.y < 0)
                            return yScale(BaseLine);
                        else
                            return yScale(d.y);
                    });

                BarGroup.attr("transform", "translate(" + (((pointWidth + pointPadding) * i) + outerPadding) + ",0)");


                seriesPoints[seriesName] = BarGroup;
                //seriesPoints.push(BarGroup);
                //return BarGroup;
            });
        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";

            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            newPoints = points.filter(function (e) { return e });
            seriesCount = newPoints.length;
            pointCount = newPoints[0].length;

            pointWidth = ((drawArea.width() / pointCount) - (outerPadding * 2) - (pointPadding * seriesCount)) / seriesCount;
            counter = 0;
            for (var i in points) {
                if (points[i] != null) {
                    ((pointWidth + pointPadding) * i)
                    bars = seriesPoints[i];
                    seriesPoints[i].attr("transform", "translate(" + (((pointWidth + pointPadding) * counter) + outerPadding) + ",0)");
                    bars.selectAll(".bar").transition().attr("width", pointWidth);
                    corrLabelPosition(labels[i], labels[i].style.position, counter);
                    counter++;
                }
            }
        }
    }

    var stackedColumnSeries = {
        defaultOptions: { pointPadding: 5 },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index],
                fill: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            var self = this;
            var _options = this.options;
            var BaseLine = 0;

            outerPadding = this.options.outerPadding ? this.options.outerPadding : xRange.rangeBand() * .1,
            pointPadding = this.options.pointPadding;
            colWidth = this.options.width;

            transitionAmount = options.animation == true ? 1000 : 0;

            pointWidth = xRange.rangeBand() - (outerPadding * 2) - (pointPadding * 2);

            if (colWidth != undefined) {
                outerPadding += (pointWidth - colWidth) / 2;
                pointWidth = colWidth;
            }

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g");
                var _style = self.getStyle(i);

                var bars = BarGroup.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("rect")
                          .classed('bar', true)
                          .attr("x", function (d) { return xRange(d.x) + pointPadding })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke-width", "1px")
                          .attr("stroke", "white")
                          .attr("fill", _style.fill);

                if (options.chart.selectable != false)
                    bars.on("click", function (d) {
                        SelectedPoint = null;

                        if (options.Selections.SelectedPoint == d.x) {
                            vis.selectAll(".bar").attr("opacity", null);
                            options.Selections.SelectedPoint = null;
                        }
                        else {
                            vis.selectAll(".bar").attr("opacity", .3);
                            d3.select(this).attr("opacity", 1);
                            options.Selections.SelectedPoint = d.x;
                            SelectedPoint = d;
                        }

                        options.event.onSelect.call(this, SelectedPoint);
                    });
                if (options.tooltip.enabled == true) {
                    bars.attr("cursor", "pointer");
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                bars
                    .transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(d.y1) - yScale(d.y0))
                    })
                    .attr("y", function (d) {
                        if (d.y < 0)
                            return yScale(BaseLine);
                        else
                            return yScale(d.y1);
                    });

                BarGroup.attr("transform", "translate(" + (outerPadding) + ",0)");

                seriesPoints.push(BarGroup);

            });

            if (options.xAxis.baseline == true) {
                baseLine = vis.append("g").classed("Axis-line", true);

                baseLine.append("line")
                .attr("x1", drawArea.left)
                .attr("x2", chart.width)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke-width", "1px")
                .attr("stroke", "gray");

                baseLine.attr("transform", "translate(0," + (yScale(BaseLine)) + ")");
            }
        },
        redraw: function (series) {
            var self = this;
            var _options = this.options;
            var BaseLine = 0;


            outerPadding = this.options.outerPadding ? this.options.outerPadding : xRange.rangeBand() * .1,
            pointPadding = this.options.pointPadding;
            colWidth = this.options.width;

            transitionAmount = options.animation == true ? 1000 : 0;

            pointWidth = xRange.rangeBand() - (outerPadding * 2) - (pointPadding * 2);

            if (colWidth != undefined) {
                outerPadding += (pointWidth - colWidth) / 2;
                pointWidth = colWidth;
            }

            series.forEach(function (d, i) {

                var data = d;
                var BarGroup = seriesPoints[i];
                var _style = self.getStyle(i);

                bars = updateElements(seriesPoints[i], "bar", d, "rect");

                bars
                    .attr("x", function (d) { return xRange(d.x) + pointPadding })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke-width", "1px")
                          .attr("stroke", "white")
                          .attr("fill", _style.fill);



                bars.transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(d.y1) - yScale(d.y0))
                    })
                    .attr("y", function (d) {
                        if (d.y < 0)
                            return yScale(BaseLine);
                        else
                            return yScale(d.y1);
                    });
            });
        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";

            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            newPoints = points.filter(function (e) { return e });
            seriesCount = newPoints.length;
            pointCount = newPoints[0].length;

            pointWidth = ((drawArea.width() / pointCount) - (outerPadding * 2) - (pointPadding * seriesCount)) / seriesCount;
            counter = 0;
            for (var i in points) {
                if (points[i] != null) {
                    ((pointWidth + pointPadding) * i)
                    bars = seriesPoints[i];
                    seriesPoints[i].attr("transform", "translate(" + (((pointWidth + pointPadding) * counter) + outerPadding) + ",0)");
                    bars.selectAll(".bar").transition().attr("width", pointWidth);
                    corrLabelPosition(labels[i], labels[i].style.position, counter);
                    counter++;
                }
            }
        },
        corrLabelPosition: function (labels, position, index) {
            wrapper = labels.svgNode;
            var style = labels.style;
            wrapper.attr('transform', "translate(" + (0 + outerPadding) + ",10)");

            if (position == "inside") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (outerPadding + pointWidth) / 2) + ',' + (yScale(0) - d3.select(this).node().getBBox().height / 2 - ((yScale(0) - yScale(d.y)) / 2)) + ')';
                });
            } else if (position == "top") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (outerPadding + pointWidth) / 2) + ',' + (0 + style.margin.bottom) + ')';
                });
            } else if (position == "bottom") {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (outerPadding + pointWidth) / 2) + ',' + (drawArea.bottom + style.margin.bottom) + ')';
                });
            } else {
                wrapper.selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + (pointWidth + pointPadding + outerPadding) / 2) + ',' + ((Math.abs(yScale(d.y1) - yScale(d.y0)) / 2) + yScale(d.y1) - 12) + ')';
                });
            }
            wrapper.selectAll(".aq-chart-label").selectAll("text").attr("dy", ".5em");
        },
        bindEvents: function (elements) {
            elements.on("click", function (d) {
                SelectedPoint = null;
                if (options.Selections.SelectedPoint == d.x) {
                    vis.selectAll(".bar").attr("opacity", null);
                    options.Selections.SelectedPoint = null;
                }
                else {
                    vis.selectAll(".bar").attr("opacity", .3);
                    d3.select(this).attr("opacity", 1);
                    options.Selections.SelectedPoint = d.x;
                    SelectedPoint = d;
                }

                options.event.onSelect.call(this, SelectedPoint);
            });

            if (options.tooltip.enabled == true) {
                elements.attr("cursor", "pointer");
                elements.on("mousemove", tick.show)
                .on("mouseout", tick.hide);
            }
        }
    }

    var customLeverSeries = {
        defaultOptions: { pointPadding: 5 },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index],
                fill: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            var self = this;
            outerPadding = this.options.outerPadding ? this.options.outerPadding : xRange.rangeBand() * .1,
            pointPadding = this.options.pointPadding;
            colWidth = this.options.width;

            var _options = this.options;

            transitionAmount = 0;

            pointWidth = xRange.rangeBand() - (outerPadding * 2) - (pointPadding * 2);

            if (colWidth != undefined) {
                outerPadding += (pointWidth - colWidth) / 2;
                pointWidth = colWidth;
            }
            var BaseLine = 0;

            if (options.animation == true)
                transitionAmount = 0;

            vis.append("line")
            .attr({ x1: drawArea.left, x2: drawArea.right })
            .attr({ y1: drawArea.bottom + 10, y2: drawArea.bottom + 10 })
            .attr({ "stroke-width": "1px", stroke: "#888" });


            vis.selectAll(".custom-lines").data(xRange.range().slice(1, xRange.range().length))
            .enter().append("line")
            .attr({ x1: function (d) { return d; }, x2: function (d) { return d; } })
            .attr({ y1: 0, y2: chart.height })
            .attr({ "stroke-width": ".5px", stroke: "#888", "stroke-dasharray": "4,2" });

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g");
                var _style = self.getStyle(i);

                pointGroup = BarGroup.selectAll(".series-point")
                      .data(data)
                      .enter()
                    .append("g")
                 .attr("transform", function (d) {
                     return "translate(" + (xRange(d.x) + (pointWidth / 2) + pointPadding) + "," + 0 + ")";
                 });

                pointGroup.classed("series-point", true);
                pointGroup.append("line")
                .attr({ x1: 0, x2: 0, y1: drawArea.bottom - drawArea.height(), y2: drawArea.bottom })
                .attr({ "stroke": function (d, i) { return theme.colors[i]; } });

                bars = pointGroup.append("rect")
                     .classed('bar', true)
                     .attr("x", -pointPadding)
                     .attr("y", yScale(BaseLine))
                     .attr("width", pointWidth)
                     .attr({ rx: pointWidth / 2, ry: pointWidth / 2 })
                     .attr("height", "0")
                     .attr("stroke", "none")
                     .attr("fill", function (d, i) { return theme.colors[i]; });



                pointGroup.append("path")
                    .attr("d", d3.svg.symbol().type('circle').size(200))
                    .attr("fill", function (d, i) { return theme.colors[i]; })
                    .attr({ "stroke-width": 1, "stroke": "white" })
                .attr("transform", function (d) {
                    return "translate(" + 0 + "," + yScale(d.y) + ")";
                });

                if (options.chart.selectable != false)
                    bars.on("click", function (d) {
                        SelectedPoint = null;

                        if (options.Selections.SelectedPoint == d.x) {
                            vis.selectAll(".bar").attr("opacity", null);
                            options.Selections.SelectedPoint = null;
                        }
                        else {
                            vis.selectAll(".bar").attr("opacity", .3);
                            d3.select(this).attr("opacity", 1);
                            options.Selections.SelectedPoint = d.x;
                            SelectedPoint = d;
                        }

                        options.event.onSelect.call(this, SelectedPoint);
                    });
                if (options.tooltip.enabled == true) {
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                bars
                    .transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(0) - yScale(d.y))
                    })
                    .attr("y", function (d) {
                        return yScale(d.y);
                    });

                BarGroup.attr("transform", "translate(" + (outerPadding) + ",0)");

                seriesPoints.push(BarGroup);

            });

        },
        redraw: function (series) {
            transitionAmount = 0;
            pointWidth = ((drawArea.width() / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            colWidth = this.options.width;

            var BaseLine = 0;

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;
            if (colWidth != undefined) {
                outerPadding += (pointWidth - colWidth) / 2;
                pointWidth = colWidth;
            }
            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = seriesPoints[i];

                bars = updateElements(seriesPoints[i], "series-point", d);

                bars.selectAll("line")
                 .attr({ x1: 0, x2: 0, y1: drawArea.bottom - drawArea.height(), y2: drawArea.bottom });

                bars.selectAll("rect").data(function (d) { return [d]; })
                .classed('bar', true)

                 .attr("width", pointWidth)
                ;

                bars.selectAll("path").data(function (d) { return [d]; })
                    .transition().duration(transitionAmount)
                    .attr("transform", function (d) {
                        return "translate(" + 0 + "," + yScale(d.y) + ")";
                    });



                bars.selectAll("rect").transition().duration(transitionAmount)
                    .attr("height", function (d) {
                        return Math.abs(yScale(d.y) - yScale(BaseLine))
                    })
                    .attr("y", function (d) {
                        if (d.y < 0)
                            return yScale(BaseLine);
                        else
                            return yScale(d.y);
                    });


                if (options.tooltip.enabled == true) {
                    bars.selectAll("rect").on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }
            });
        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";

            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            newPoints = points.filter(function (e) { return e });
            seriesCount = newPoints.length;
            pointCount = newPoints[0].length;

            pointWidth = ((drawArea.width() / pointCount) - (outerPadding * 2) - (pointPadding * seriesCount)) / seriesCount;
            counter = 0;
            for (var i in points) {
                if (points[i] != null) {
                    ((pointWidth + pointPadding) * i)
                    bars = seriesPoints[i];
                    seriesPoints[i].attr("transform", "translate(" + (((pointWidth + pointPadding) * counter) + outerPadding) + ",0)");
                    bars.selectAll(".bar").transition().attr("width", pointWidth);
                    corrLabelPosition(labels[i], labels[i].style.position, counter);
                    counter++;
                }
            }
        },
        createPoints: function (wrapper) {
            wrapper.append("line").data(function (d) { return [d]; });


            wrapper.append("rect")
                .attr("stroke", "none")
                .attr("x", -pointPadding)
                .attr("y", yScale(BaseLine))
                .attr({ rx: pointWidth / 2, ry: pointWidth / 2 })
                .attr("height", "0")
                .attr("fill", function (d, i) { return theme.colors[i]; });

            wrapper.append("path").data(function (d) { return [d]; })
                .attr("d", d3.svg.symbol().type('circle').size(200))
                .attr("fill", function (d, i) { return theme.colors[i]; })
                .attr({ "stroke-width": 1, "stroke": "white" });
        }
    }

    var columnSquareSeries = {
        defaultOptions: { outerPadding: 10, pointPadding: 0 },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            outerPadding = this.options.outerPadding,
            pointPadding = this.options.pointPadding;
            var _options = this.options,
            color = function (d, i) { return theme.colors[i]; }

            transitionAmount = 1000;

            pointWidth = xRange.rangeBand() - (outerPadding * 2);
            minWidth = 40;
            widthDiff = pointWidth - minWidth;

            halfPointWidth = pointWidth / 2;
            var BaseLine = 0;

            if (options.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                maxValue = d3.max(d, function (d) { return d.y; });

                var data = d;
                var wrapper = vis.append("svg:g");

                BarGroup = wrapper.selectAll(".bar")
                      .data(data)
                      .enter().append("g").classed('bar', true);

                BarGroup.append("line")
               .attr({ x1: halfPointWidth, x2: halfPointWidth, y1: halfPointWidth, y2: drawArea.bottom - 10 })
               .attr({ "stroke": color, "stroke-width": "1px", "stroke-dasharray": "3,3" });

                bars = BarGroup.append("rect")
                    .attr({ "width": 0, "height": 0, "x": pointWidth / 2, "y": pointWidth / 2 })
                          .attr("stroke-width", 5)
                          .attr("stroke", function (d, i) { return ColorLuminance(theme.colors[i], .5) })
                          .attr("fill", color)
                        .classed("series-point", true);


                BarGroup.append("path").classed("series-small-circle", true)
               .attr("d", d3.svg.symbol().size(20))
               .attr({ "fill": function (d, i) { return ColorLuminance(theme.colors[i], .5) }, "stroke": color, "stroke-width": 1 }).attr("transform", "translate(" + halfPointWidth + "," + (drawArea.bottom - 10) + ")");

                if (options.chart.selectable != false)
                    bars.on("click", function (d) {
                        SelectedPoint = null;

                        if (options.Selections.SelectedPoint == d.x) {
                            vis.selectAll(".series-point").attr("opacity", null);
                            options.Selections.SelectedPoint = null;
                        }
                        else {
                            vis.selectAll(".series-point").attr("opacity", .3);
                            d3.select(this).attr("opacity", 1);
                            options.Selections.SelectedPoint = d.x;
                            SelectedPoint = d;
                        }

                        options.event.onSelect.call(this, SelectedPoint);
                    });

                if (options.tooltip.enabled == true) {
                    bars.attr("cursor", "pointer");
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                bars.transition().duration(transitionAmount)
                .attr("height", function (d) { return minWidth + (widthDiff * (d.y / maxValue)); })
                .attr("width", function (d) { return minWidth + (widthDiff * (d.y / maxValue)) })
                .attr("y", function (d) { h = minWidth + (widthDiff * (d.y / maxValue)); return (halfPointWidth) - (h / 2); })
                .attr("x", function (d) { w = minWidth + (widthDiff * (d.y / maxValue)); return (pointWidth - w) / 2; })
                ;

                BarGroup.attr("transform", function (d) {
                    x = xRange(d.x) + outerPadding / 2;
                    y = drawArea.top;
                    return "translate(" + x + "," + y + ")";
                });
                wrapper.attr("transform", "translate(" + (((pointWidth) * i) + outerPadding / 2) + ",0)");

                seriesPoints.push(wrapper);

            });

        },
        redraw: function (series) {
            var _options = this.options;


            transitionAmount = 0;
            pointWidth = ((drawArea.width() / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            minWidth = 40;
            widthDiff = pointWidth - minWidth;

            var BaseLine = 0;
            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                maxValue = d3.max(d, function (d) { return d.y; });
                var data = d;

                var BarGroup = seriesPoints[i],
                barsGroup = updateElements(seriesPoints[i], "bar", d);

                bars = barsGroup.selectAll("rect").data(function (d) { return [d]; });

                bars.transition().duration(transitionAmount)
                .attr("height", function (d) {
                    angle = d.y == maxValue ? 1 : d.y / maxValue;
                    return minWidth + (widthDiff * angle);
                })
                .attr("width", function (d) {
                    angle = d.y == maxValue ? 1 : d.y / maxValue;
                    return minWidth + (widthDiff * angle);
                })
                .attr("y", function (d) {
                    angle = d.y == maxValue ? 1 : d.y / maxValue;
                    h = minWidth + (widthDiff * angle); return (halfPointWidth) - (h / 2);
                })
                .attr("x", function (d) {
                    angle = d.y == maxValue ? 1 : d.y / maxValue;
                    w = minWidth + (widthDiff * (angle)); return (pointWidth - w) / 2;
                })
                ;



            });
        },
        hideSeries: function (series) {
            seriesPoints[series].attr("visibility", "hidden");
        }
    }

    var columnPieSeries = {
        defaultOptions: { outerPadding: 0, pointPadding: 5 },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        arcFn: d3.svg.arc(),
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
            this.arcFn
                .startAngle(function (d, i) { return 0 * (Math.PI / 180); })
                .endAngle(function (d, i) {
                    angle = d.y == maxValue ? 1 : d.y / maxValue;
                    return (angle * 360) * (Math.PI / 180);
                });
        },
        render: function (series) {
            this.init();
            var self = this;
            outerPadding = this.options.outerPadding,
            pointPadding = this.options.pointPadding;
            var _options = this.options,
                _arcFn = this.arcFn;

            transitionAmount = 0;

            pointWidth = ((drawArea.width() / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            halfPointWidth = pointWidth / 2;

            _arcFn.innerRadius(14).outerRadius((pointWidth / 2) - 2);

            if (options.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                maxValue = 100;//d3.max(d, function (d) { return d.y; });

                var data = d;
                var wrapper = vis.append("svg:g");

                BarGroup = wrapper.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("g")
                      .classed('bar', true);


                BarGroup.attr("transform", function (d) {
                    x = xRange(d.x) + outerPadding / 2;
                    y = drawArea.top;
                    return "translate(" + x + "," + y + ")";
                });


                var elements = self.createPoints(BarGroup);

                outerPie = elements[1];
                bars = elements[2];

                BarGroup.selectAll(".series-small-circle")
                .attr("transform", "translate(" + halfPointWidth + "," + (drawArea.bottom - 10) + ")");

                BarGroup.selectAll("line")
                    .attr({ x1: halfPointWidth, x2: halfPointWidth, y1: pointWidth, y2: drawArea.bottom - 10 });

                outerPie
                   .attr("transform", function (d) {
                       h = w = pointWidth;
                       return "translate(" + (halfPointWidth) + "," + (halfPointWidth) + ")";
                   });


                bars.attr({ "x": 0, "y": 0 })
                    .attr("d", _arcFn)
                    .attr("stroke-width", 2)
                    .attr("stroke", function (d, i) { return d3.rgb(theme.colors[i]).darker() })
                    .attr("fill", function (d, i) { return theme.colors[i] })
                ;


                bars.attr("transform", function (d) {
                    h = w = pointWidth;
                    return "translate(" + (halfPointWidth) + "," + (halfPointWidth) + ")";
                })

                wrapper.attr("transform", "translate(" + ((pointPadding + outerPadding) / 2) + ",0)");
                self.bindEvents(bars);
                seriesPoints.push(wrapper);
            });

        },
        redraw: function (series) {
            var self = this;
            var _options = this.options,
                _arcFn = this.arcFn;

            transitionAmount = 0;

            pointWidth = ((drawArea.width() / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            halfPointWidth = pointWidth / 2;
            _arcFn.innerRadius(15).outerRadius(pointWidth / 2);

            series.forEach(function (d, i) {
                maxValue = d3.max(d, function (d) { return Math.abs(d.y); });

                var data = d;
                var BarGroup = seriesPoints[i];

                //child element do not inherit data automaticlly once it updated.hence manual binding need to done
                var barsGroup = updateElements(seriesPoints[i], "bar", d);

                self.createPoints(barsGroup.selectAll(".bar"));


                bars = barsGroup.selectAll(".series-point").data(function (d) { return [d]; });

                bars.attr("d", _arcFn)
                    .attr("transform", function (d) {
                        h = w = pointWidth;
                        return "translate(" + (halfPointWidth) + "," + (halfPointWidth) + ")";
                    });


                //return BarGroup;
            });
        },
        createPoints: function (wrapper, dataPoints) {
            var arcFull = d3.svg.arc()
                           .innerRadius(14)
                           .outerRadius((pointWidth / 2) - 2)
                           .startAngle(0)
                           .endAngle(360 * (Math.PI / 180));

            var elements = [];
            elements.push(wrapper.append("line").classed("series-line", true).attr({ "stroke": "#CCCDCE", "stroke-width": "1px", "stroke-dasharray": "3,3" }));;

            elements.push(wrapper.append("path").classed("series-outer-circle", true).attr({ "x": 0, "y": 0 })
                .attr("d", arcFull)
                .attr({ "stroke": "#ccc", "stroke-width": "2px", "fill": "#ECEFF0" }));

            elements.push(wrapper.append("path").classed("series-point", true));

            elements.push(wrapper.append("path").classed("series-small-circle", true).attr({ "x": 0, "y": 0 })
                .attr("d", d3.svg.symbol().size(25))
                .attr({ "fill": "gray" }));

            return elements;
        },
        bindEvents: function (elements) {
            if (options.chart.selectable != false) {
                elements.attr("cursor", "pointer");
                elements.on("click", function (d) {
                    SelectedPoint = null;

                    if (options.Selections.SelectedPoint == d.x) {
                        vis.selectAll(".series-point").attr("opacity", null);
                        options.Selections.SelectedPoint = null;
                    }
                    else {
                        vis.selectAll(".series-point").attr("opacity", .3);
                        d3.select(this).attr("opacity", 1);
                        options.Selections.SelectedPoint = d.x;
                        SelectedPoint = d;
                    }
                    options.event.onSelect.call(this, SelectedPoint);
                });
            }
            if (options.tooltip.enabled == true) {

                elements.on("mousemove", tick.show)
                .on("mouseout", tick.hide);
            }
        },
        hideSeries: function (series) {
            seriesPoints[series].attr("visibility", "hidden");
        }
    }

    var barSeries = {
        defaultOptions: {
            innerPadding: 100
        },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        yScale: null,
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index],
                fill: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            var _options = this.options;
            var _style, self = this;
            color = isFunction(_options.color) ? _options.color : function (i) { return _style.fill; }
            barHeight = _options.height;

            var selectorFn = this.selectPoint;
            transitionAmount = 0;
            outerPadding = 2;
            pointPadding = 1;
            //yScale.domain(yScale.domain().reverse());
            outerPadding = xRange.rangeBand() * .1;
            pointWidth = (((xRange.rangeBand()) - (outerPadding * 2)) - (pointPadding)) / series.length;

            // pointWidth -= outerPadding;
            var BaseLine = 0;
            if (barHeight != undefined) {
                outerPadding += ((pointWidth - barHeight) * series.length) / 2;
                //pointPadding += (pointWidth - barHeight);
                pointWidth = barHeight;
            }

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g").classed("aq-chart-series", true);
                _style = self.getStyle(i);

                barGroup = BarGroup.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("g").attr("cursor", "pointer")
                 .classed('series-point', true);

                self.bindEvents(barGroup);

                bars = barGroup.append("rect");
                bars
                  .attr("x", yScale(BaseLine))
                  .attr("y", function (d) { return xRange(d.x) + pointPadding / 2; })// yScale(BaseLine))
                  .attr("width", 0)
                  .attr("height", pointWidth)
                  .attr("stroke", "none")
                  .attr("fill", function (d) { return color.call(this, d) }); // function (d) { return d.y >= 0 ? "#A6CC54" : "#E34747"; });


                if (options.tooltip.enabled == true) {
                    barGroup.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                if (_options.maskImage) {
                    var url = _options.maskImage.url, w = _options.maskImage.width, h = _options.maskImage.height;

                    barGroup.append("svg:image")
                    .attr("xlink:href", url)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("x", function (d) {
                        if (d.y >= 0) {
                            return yScale(BaseLine);
                        } else {
                            return yScale(BaseLine) - 120;
                        }

                    }).attr("y", function (d) { return xRange(d.x); })
                    .attr("visibility", function () { return d.y == 0 ? "hidden" : "visibile" })
                    ;
                }

                bars
                .transition().duration(transitionAmount)
                .attr("width", function (d) {
                    w = Math.abs(yScale(d.y) - yScale(BaseLine));
                    return w;//d3.min([w, 120]);
                })
                .attr("x", function (d) {
                    if (d.y > 0) { return yScale(BaseLine); }
                    else {
                        w = Math.abs(yScale(d.y) - yScale(BaseLine));//d3.min([Math.abs(yScale(d.y) - yScale(BaseLine)), 120]);
                        return yScale(BaseLine) - w;
                    }
                });

                BarGroup.attr("transform", "translate(" + 0 + "," + (((pointWidth * i) + outerPadding)) + ")");
                vis.append("line")
                .attr("x1", yScale(BaseLine))
                .attr("x2", yScale(BaseLine))
                .attr("y1", seriesArea.left() - 3)
                .attr("y2", seriesArea.right())
                .attr("stroke-width", "2px").attr("stroke", "#ccc");

                seriesPoints.push(BarGroup);

            });
        },
        redraw: function (series) {
            var self = this;
            var _options = this.options;
            var _style, self = this;

            var color = isFunction(_options.color) ? _options.color : function (i) { return _style.fill; }
            transitionAmount = 0;

            outerPadding = xRange.rangeBand() * .1;
            pointPadding = 1;

            pointWidth = (((seriesArea.width() / series[0].length) - (outerPadding * 2)) - (pointPadding)) / series.length;

            if (barHeight != undefined) {
                outerPadding += ((pointWidth - barHeight) * series.length) / 2;
                //pointPadding += (pointWidth - barHeight);
                pointWidth = barHeight;
            }

            var BaseLine = 0;
            //updateYScale();

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {

                var data = d;
                var BarGroup = seriesPoints[i];
                barGroup = updateElements(seriesPoints[i], "series-point", d);

                self.createPoints(barGroup.enter());

                bars = barGroup.selectAll("rect").data(function (d) { return [d]; })
                  .attr("x", yScale(BaseLine))
                  .attr("y", function (d) { return xRange(d.x) + pointPadding / 2; })// yScale(BaseLine))
                  .attr("width", 0)
                  .attr("height", pointWidth)
                  .attr("stroke", "none")
                  .attr("fill", function (d) {
                      return color.call(this, d)
                  });

                if (options.tooltip.enabled == true) {
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                barGroup.selectAll("image").data(function (d) { return [d]; })
                .attr("x", function (d) {
                    if (d.y >= 0) {
                        return yScale(BaseLine);
                    } else {
                        return yScale(BaseLine) - 120;
                    }
                })
                    .attr("visibility", function (d) {
                        return d == 0 ? "hidden" : "visible";
                    });
                bars
                    .transition().duration(transitionAmount)
                    .attr("width", function (d) {
                        w = Math.abs(yScale(d.y) - yScale(BaseLine));
                        return d3.min([w, 120]);
                    })
                    .attr("x", function (d) {
                        if (d.y > 0) { return yScale(BaseLine); }
                        else {
                            w = d3.min([Math.abs(yScale(d.y) - yScale(BaseLine)), 120]);
                            return yScale(BaseLine) - w;
                        }
                    });

                //BarGroup.attr("transform", "translate(" + (((pointWidth + pointPadding) * i) + outerPadding) + ",0)");

            });
        },
        createPoints: function (wrapper) {
            barGroup.append("rect");
            barGroup.append("svg:image");
        },
        corrLabelPosition: function (series, position, index) {
            d = series;
            var wrapper = d.svgNode;
            var style = d.style;

            basePos = yScale(0);
            pointHalfWidth = (outerPadding + pointWidth) / 2;
            wrapperXposFn = 0;
            var labels = wrapper.selectAll(".aq-chart-label");
            posFn = {};
            if (style.x) {
                posFn = function (d) {
                    if (d.y >= 0)
                        return 'translate(' + (yScale(0) + style.x) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                    else
                        return 'translate(' + (yScale(0) - style.x - this.getBBox().width - 5) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                }
            }
            else {
                switch (style.position) {
                    case "inside":
                        posFn = function (d) {
                            return 'translate(' + (basePos + ((yScale(d.y) - basePos) / 2)) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                        }
                        break;
                    case "top":
                        posFn = function (d) {
                            return 'translate(' + (seriesArea.bottom() - 25) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                        }
                        break;
                    case "bottom":
                        posFn = function (d) {
                            return 'translate(' + (xRange(d.x) + pointHalfWidth) + ',' + (drawArea.bottom + style.margin.bottom) + ')';
                        }
                        break
                    default:
                        posFn = function (d) {
                            if (yScale(0) <= yScale(d.y))
                                return 'translate(' + (yScale(d.y)) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                            else
                                return 'translate(' + (yScale(d.y) - this.getBBox().width - 5) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                        }
                        break;
                }
            }
            labels.attr('transform', posFn);
            wrapper.selectAll("text").attr({ "dy": ".5em", "text-anchor": "start" });
            wrapper.attr("transform", "translate(" + wrapperXposFn + "," + (index * pointWidth + outerPadding / 2) + ")");

        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";

            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            newPoints = points.filter(function (e) { return e });
            seriesCount = newPoints.length;
            pointCount = newPoints[0].length;

            pointWidth = ((seriesArea.width() / pointCount) - (outerPadding * 2) - (pointPadding * seriesCount)) / seriesCount;
            counter = 0;
            for (var i in points) {
                if (points[i] != null) {
                    bars = seriesPoints[i];
                    //seriesPoints[i].attr("transform", "translate(" + yScale(0) + "," + ((pointWidth + pointPadding) * counter) + outerPadding + ")");
                    bars.selectAll(".bar").selectAll("rect").transition().attr("height", pointWidth);
                    //this.corrLabelPosition(labels[i], counter);
                    counter++;
                }

            }
        },
        bindEvents: function (elements) {
            if (options.chart.selectable != false)
                elements.on("click", function (d) {
                    SelectedPoint = null;

                    if (options.Selections.SelectedPoint == d.x) {
                        vis.selectAll(".series-point").attr("opacity", null);
                        options.Selections.SelectedPoint = null;
                    }
                    else {
                        vis.selectAll(".series-point").attr("opacity", .3);
                        d3.select(this).attr("opacity", 1);
                        options.Selections.SelectedPoint = d.x;
                        SelectedPoint = d;
                    }
                    options.event.onSelect.call(this, SelectedPoint);
                });

            if (options.tooltip.enabled == true) {
                elements.attr("cursor", "pointer");
                elements.on("mousemove", tick.show)
                .on("mouseout", tick.hide);
            }
        },
        selectPoint: function (d) {
            if (options.Selections.SelectedPoint == d.x) {
                vis.selectAll(".bar").attr("opacity", null);
                options.Selections.SelectedPoint = null;
                SelectedPoint = null;
            }
            else {
                vis.selectAll(".bar").attr("opacity", .3);
                d3.select(this).attr("opacity", 1);
                options.Selections.SelectedPoint = d.x;
                SelectedPoint = d;
            }
            options.event.onSelect.call(this, SelectedPoint);
        }
    }

    var stackedBarSeries = {
        defaultOptions: {
            innerPadding: 100
        },
        options: {},
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        yScale: null,
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index],
                fill: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            this.options = $.extend(true, this.defaultOptions, seriesPlotOption);
        },
        render: function (series) {
            this.init();
            var _options = this.options;
            var _style, self = this;
            color = isFunction(_options.color) ? _options.color : function (i) { return _style.fill; }
            barHeight = _options.height;

            var selectorFn = this.selectPoint;
            transitionAmount = 0;
            outerPadding = 2;
            pointPadding = 1;
            //yScale.domain(yScale.domain().reverse());
            outerPadding = xRange.rangeBand() * .1;
            pointWidth = (((xRange.rangeBand()) - (outerPadding * 2)) - (pointPadding));

            // pointWidth -= outerPadding;
            var BaseLine = 0;
            if (barHeight != undefined) {
                outerPadding += ((pointWidth - barHeight) * series.length) / 2;
                pointWidth = barHeight;
            }

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g").classed("aq-chart-series", true);
                _style = self.getStyle(i);

                barGroup = BarGroup.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("g").attr("cursor", "pointer")
                 .classed('series-point', true);

                self.bindEvents(barGroup);

                bars = barGroup.append("rect");
                bars
                  .attr("x", yScale(BaseLine))
                  .attr("y", function (d) { return xRange(d.x) + outerPadding; })// yScale(BaseLine))
                  .attr("width", 0)
                  .attr("height", pointWidth)
                  .attr("stroke", "none")
                  .attr("fill", function (d) { return color.call(this, d) }); // function (d) { return d.y >= 0 ? "#A6CC54" : "#E34747"; });


                if (options.tooltip.enabled == true) {
                    barGroup.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                if (_options.maskImage) {
                    var url = _options.maskImage.url, w = _options.maskImage.width, h = _options.maskImage.height;

                    barGroup.append("svg:image")
                    .attr("xlink:href", url)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("x", function (d) {
                        if (d.y >= 0) {
                            return yScale(BaseLine);
                        } else {
                            return yScale(BaseLine) - 120;
                        }

                    }).attr("y", function (d) { return xRange(d.x) + pointPadding + outerPadding; })
                    .attr("visibility", function () { return d.y == 0 ? "hidden" : "visibile" })
                    ;
                }

                bars
                .transition().duration(transitionAmount)
                .attr("width", function (d) {
                    return Math.abs(yScale(d.y1) - yScale(d.y0));
                })
                .attr("x", function (d) {
                    return yScale(d.y0);
                });

                //BarGroup.attr("transform", "translate(" + 0 + "," + (((pointWidth * i) + outerPadding)) + ")");
                vis.append("line")
                .attr("x1", yScale(BaseLine))
                .attr("x2", yScale(BaseLine))
                .attr("y1", seriesArea.left() - 3)
                .attr("y2", seriesArea.right())
                .attr("stroke-width", "2px").attr("stroke", "#ccc");

                seriesPoints.push(BarGroup);

            });
        },
        redraw: function (series) {
            var self = this;
            transitionAmount = 0;

            outerPadding = xRange.rangeBand() * .1;
            pointPadding = 1;

            pointWidth = (((seriesArea.width() / series[0].length) - (outerPadding * 2)) - (pointPadding)) / series.length;

            if (barHeight != undefined) {
                outerPadding += ((pointWidth - barHeight) * series.length) / 2;
                //pointPadding += (pointWidth - barHeight);
                pointWidth = barHeight;
            }

            var BaseLine = 0;
            //updateYScale();

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {

                var data = d;
                var BarGroup = seriesPoints[i];
                barGroup = updateElements(seriesPoints[i], "series-point", d);

                self.createPoints(barGroup.enter());

                bars = barGroup.selectAll("rect").data(function (d) { return [d]; })
                  .attr("x", yScale(BaseLine))
                  .attr("y", function (d) { return xRange(d.x) + pointPadding / 2; })// yScale(BaseLine))
                  .attr("width", 0)
                  .attr("height", pointWidth)
                  .attr("stroke", "none")
                  .attr("fill", function (d) { return d.y >= 0 ? "#A6CC54" : "#E34747"; });

                if (options.tooltip.enabled == true) {
                    bars.on("mousemove", tick.show)
                    .on("mouseout", tick.hide);
                }

                barGroup.selectAll("image").data(function (d) { return [d]; })
                .attr("x", function (d) {
                    if (d.y > 0) {
                        return yScale(BaseLine);
                    } else {
                        return yScale(BaseLine) - 120;
                    }
                })
                    .attr("visibility", function (d) {
                        return d == 0 ? "hidden" : "visible";
                    });
                bars
                    .transition().duration(transitionAmount)
                    .attr("width", function (d) {
                        w = Math.abs(yScale(d.y) - yScale(BaseLine));
                        return d3.min([w, 120]);
                    })
                    .attr("x", function (d) {
                        if (d.y > 0) { return yScale(BaseLine); }
                        else { return yScale(BaseLine) - Math.abs(yScale(d.y) - yScale(BaseLine)); }
                    });

                //BarGroup.attr("transform", "translate(" + (((pointWidth + pointPadding) * i) + outerPadding) + ",0)");

            });
        },
        createPoints: function (wrapper) {
            barGroup.append("rect");
            barGroup.append("svg:image");
        },
        corrLabelPosition: function (series, position, index) {
            d = series;
            var wrapper = d.svgNode;
            var style = d.style;

            basePos = yScale(0);
            pointHalfWidth = (outerPadding + pointWidth) / 2;
            wrapperXposFn = 0;
            var labels = wrapper.selectAll(".aq-chart-label");
            posFn = {};
            if (style.x) {
                posFn = function (d) {
                    if (d.y >= 0)
                        return 'translate(' + (yScale(0) + style.x) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                    else
                        return 'translate(' + (yScale(0) - style.x - this.getBBox().width - 5) + ',' + (xRange(d.x) + pointHalfWidth) + ')';
                }
            }
            else {
                posFn = function (d) {
                    return 'translate(' + (yScale(d.y0) + ((yScale(d.y1) - yScale(d.y0)) / 2)) + ',' + (xRange(d.x)) + ')';
                }
            }
            labels.attr('transform', posFn);
            wrapper.selectAll("text").attr({ "dy": ".5em", "text-anchor": "start" });
            wrapper.attr("transform", "translate(" + wrapperXposFn + "," + ((pointWidth + outerPadding) / 2) + ")");

        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";

            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            newPoints = points.filter(function (e) { return e });
            seriesCount = newPoints.length;
            pointCount = newPoints[0].length;

            pointWidth = ((seriesArea.width() / pointCount) - (outerPadding * 2) - (pointPadding * seriesCount)) / seriesCount;
            counter = 0;
            for (var i in points) {
                if (points[i] != null) {
                    bars = seriesPoints[i];
                    //seriesPoints[i].attr("transform", "translate(" + yScale(0) + "," + ((pointWidth + pointPadding) * counter) + outerPadding + ")");
                    bars.selectAll(".bar").selectAll("rect").transition().attr("height", pointWidth);
                    //this.corrLabelPosition(labels[i], counter);
                    counter++;
                }

            }
        },
        bindEvents: function (elements) {
            if (options.chart.selectable != false)
                elements.on("click", function (d) {
                    SelectedPoint = null;

                    if (options.Selections.SelectedPoint == d.x) {
                        vis.selectAll(".series-point").attr("opacity", null);
                        options.Selections.SelectedPoint = null;
                    }
                    else {
                        vis.selectAll(".series-point").attr("opacity", .3);
                        d3.select(this).attr("opacity", 1);
                        options.Selections.SelectedPoint = d.x;
                        SelectedPoint = d;
                    }
                    options.event.onSelect.call(this, SelectedPoint);
                });

            if (options.tooltip.enabled == true) {
                elements.attr("cursor", "pointer");
                elements.on("mousemove", tick.show)
                .on("mouseout", tick.hide);
            }
        },
        selectPoint: function (d) {
            if (options.Selections.SelectedPoint == d.x) {
                vis.selectAll(".bar").attr("opacity", null);
                options.Selections.SelectedPoint = null;
                SelectedPoint = null;
            }
            else {
                vis.selectAll(".bar").attr("opacity", .3);
                d3.select(this).attr("opacity", 1);
                options.Selections.SelectedPoint = d.x;
                SelectedPoint = d;
            }
            options.event.onSelect.call(this, SelectedPoint);
        }
    }

    var lineSeries = {
        style: {
            DashType: "5,0"
        },
        lineFunction: d3.svg.line().defined(function (d) { return d.y;})
         .x(function (d) {
             return xRange(d.x);
         }).y(function (d) {
             return yScale(d.y);
         }).interpolate("cordinal"),
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index]
            }, options.series[index].style);
        },
        render: function (series) {
            var self = this;
            seriesIsGrouped = false;

            pointWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length));

            // BarGroup = updateElements(vis, "aq-charts-series", series);

            series.forEach(function (d, i) {
                style = self.getStyle(i);
                wrapper = vis.append("g").classed("aq-charts-series", true).datum(d);
                seriesPoints.push(wrapper);


                Curve = wrapper.append("path");

                Curve.attr("stroke", style.stroke)
                    .attr("stroke-width", "1")
                    .attr("fill", "none")
                    .attr("stroke-dasharray", style.dashType)
                    .attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');

                Curve.transition().duration(500)
                    .attr("d", function (d) {
                        return lineSeries.lineFunction(d);
                    });

                self.marker(d, i);
            });

        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";
            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            markers[series].attr("visibility", visiblity);

        },
        marker: function (series, symbol) {
            var data = series;//Seriesdata[dataList];
            var VScale = xRange.rangeBand();
            var HPoint = VScale / 2;
            var d = series;

            markerGroup = vis.append('svg:g');

            for (var index in d) {
                if (d[index].y == null)
                    continue;
                co = renderer.symbol(renderer.symbols.keys[0], xRange(d[index].x), yScale(d[index].y), 8, 8);
                d3.select(co).data([d[index]]).classed("aq-chart-marker", true)
                .attr({ "fill": theme.colors[symbol] });
                markerGroup.node().appendChild(co);

                if (options.tooltip.enabled == true) {
                    d3.select(co).on("mousemove", tick.show)
                    .on("mouseout", tick.hide)
                    .attr("cursor", "pointer");
                }
            }

            markerGroup.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');
            markers.push(markerGroup);
        }
    }
    var areaSeries = {
        style: {
            DashType: "5,0"
        },
        areaFn: d3.svg.area(),
        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theme.colors[index]
            }, options.series[index].style);
        },
        init: function () {
            height = drawArea.bottom;
            this.areaFn.x(function (d) {
                return xRange(d.x);
            }).y0(drawArea.bottom)
            .y1(function (d) {
                return yScale(d.y);
            }).interpolate("cordinal");
        },
        render: function (series) {
            this.init();
            var self = this;
            seriesIsGrouped = false;
            height = 400;
            pointWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length));

            // BarGroup = updateElements(vis, "aq-charts-series", series);

            series.forEach(function (d, i) {
                wrapper = vis.append("g").classed("aq-charts-series", true).datum(d);
                seriesPoints.push(wrapper);

                var _style = self.getStyle(i);
                Curve = wrapper.append("path");

                Curve.attr("stroke", function (d, i) { return theme.colors[i]; })
                    .attr("stroke-width", "2")
                    .attr("fill", _style.fill)
                    .attr("opacity", .7)
                    .attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');

                Curve.transition().duration(500)
                    .attr("d", self.areaFn);

                self.marker(d, i);
            });

        },
        hideSeries: function (series, points, isHide) {
            var visiblity = isHide == true ? "hidden" : "visible";
            seriesPoints[series].attr("visibility", visiblity);
            labels[series].svgNode.attr("visibility", visiblity);
            markers[series].attr("visibility", visiblity);

        },
        marker: function (series, symbol) {
            var data = series;//Seriesdata[dataList];
            var VScale = xRange.rangeBand();
            var HPoint = VScale / 2;
            var d = series;

            markerGroup = vis.append('svg:g');

            for (var index in d) {
                co = renderer.symbol(renderer.symbols.keys[symbol], xRange(d[index].x), yScale(d[index].y), 10, 10);
                d3.select(co).data([d[index]]).classed("aq-chart-marker", true)
                .attr({ "fill": theme.colors[symbol] });
                markerGroup.node().appendChild(co);
            }

            markerGroup.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');
            markers.push(markerGroup);
        }
    }
    var pieSeries = $.extend(baseSeries, {
        radius: 0,
        arc: d3.svg.arc(),
        asterArc: d3.svg.arc(),
        pie: d3.layout.pie().sort(null).value(function (d) { return Math.abs(d.y); }),
        pieCordinates: [],
        pieCordinates: {},
        init: function () {
            var TempTotal = d3.max(points[0], function (d) {
                return Math.abs(d.y);
            });

            this.radius = seriesPlotOption.outerRadius || (Math.min(drawArea.width(), drawArea.height()) - 10) / 2;
            this.arc = d3.svg.arc().outerRadius(this.radius).innerRadius(seriesPlotOption.innerRadius);
            this.asterArc = d3.svg.arc().outerRadius(function (d) {
                return ((this.radius - seriesPlotOption.innerRadius) * (d.data.y / TempTotal)) + seriesPlotOption.innerRadius;// * (Math.abs(d.data.y) / 100.0);
            }).innerRadius(seriesPlotOption.innerRadius);

            if (chart.type == "aster-pie")
                this.arc = this.asterArc;
            if (seriesPlotOption.position == "left")
                piePosition = { x: (drawArea.left + this.radius) + drawArea.left+50, y: (drawArea.height() + drawArea.top) / 2 };
            if (seriesPlotOption.position == "center")
                piePosition = { x: (drawArea.width() / 2) + drawArea.left, y: (drawArea.height() + drawArea.top) / 2 };
            if (seriesPlotOption.position == "right")
                piePosition = { x: drawArea.right / 2, y: drawArea.height() / 2 };
            if (seriesPlotOption.y)
                piePosition.y = seriesPlotOption.y;

            if (seriesPlotOption.isEqualPie && seriesPlotOption.isEqualPie == true)
                this.pie.value(function (d) { return 1; });
        },
        render: function (series) {
            this.init();
            var selectorFn = this.selectPoint;
            pieCordinates = this.pie(series[0]);

            graph = vis.append("g")
            .attr("transform", "translate(" + piePosition.x + "," + piePosition.y + ")");

            seriesPoints.push(graph);

            var g = graph.selectAll(".arc")
             .data(series[0])
             .enter().append("g")
             .attr("class", "arc");

            if (seriesPlotOption.outline != false)
                graph.append("circle")
                .attr("r", (this.radius) + 3)
                .attr("fill", "none")
                .attr("stroke", "gray");

            paths = g.append("path")
                 .attr("d", function (d, i) { return pieSeries.arc(pieCordinates[i]) }).classed("datapoint", true)
                 .style("fill", function (d, i) { return theme.colors[i]; })
                 .style("stroke", seriesPlotOption.sliceBorderColor)
                .style("stroke-width", seriesPlotOption.sliceBorder)
                .attr("cursor", "pointer");

            this.bindEvents(g);

            svg = this;
        },
        redraw: function (series) {
            selectorFn = this.selectPoint;
            TempTotal = d3.max(points[0], function (d) {
                return Math.abs(d.y);
            });

            this.asterArc.outerRadius(function (d) {
                return ((this.radius - seriesPlotOption.innerRadius) * (d.data.y / TempTotal)) + seriesPlotOption.innerRadius;// * (Math.abs(d.data.y) / 100.0);
            });


            pieCordinates = this.pie(series[0]);

            graph = seriesPoints[0];

            //seriesPoints.push(graph);

            var g = updateElements(seriesPoints[0], "arc", series[0]);



            g.select("path").remove();

            g.append("path")
            .attr("d", function (d, i) { return pieSeries.arc(pieCordinates[i]) }).classed("datapoint", true)
            .style("fill", function (d, i) { return theme.colors[i]; })
            .style("stroke", seriesPlotOption.sliceBorderColor)
        .style("stroke-width", seriesPlotOption.sliceBorder);

            this.bindEvents(g);

            svg = this;
        },
        corrLabelPosition: function (series, position) {
            // suggestion for getting border position came from 
            //http://stackoverflow.com/questions/8053424/label-outside-arc-pie-chart-d3-js

            var wrapper = series.svgNode;
            var labels = wrapper.selectAll(".aq-chart-label");
            var xDistance = series.style.x || 10;
            pieCordinates = seriesFn.pie(points[0]);

            wrapper.attr("transform", "translate(" + piePosition.x + "," + piePosition.y + ")");
            if (position == "outside") {
                for (var i = 0; i < pieCordinates.length; i++) {
                    var c = svg.arc.centroid(pieCordinates[i]),
                    x = c[0],
                    y = c[1],
                    // pythagorean theorem for hypotenuse
                    h = Math.sqrt(x * x + y * y);
                    x = (x / h * seriesFn.radius);
                    y = (y / h * seriesFn.radius);
                    pieCordinates[i]["outerPosition"] = { x: x, y: y };
                }

                labels.attr("transform", function (d, i) {
                    var x = pieCordinates[i].outerPosition.x;
                    var y = pieCordinates[i].outerPosition.y;
                    if (x > 0)
                        x += xDistance;
                    else
                        x -= xDistance;
                    return "translate(" + x + ',' + y + ")";

                });

                labels.select("text")
                .attr("text-anchor", function (d, i) {
                    if (pieCordinates[i].outerPosition.x > 0)
                        return "start";
                    else
                        return "end";
                });

                labels.append("line")
                .attr("x1", 0)
                .attr("x2", function (d, i) {
                    var x = pieCordinates[i].outerPosition.x;
                    if (x > 0)
                        x = 5 - xDistance;
                    else
                        x = -5 + xDistance;
                    return x;
                })
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke", function (d, i) { return theme.colors[i] });
            } else {
                labels.attr("transform", function (d, i) {
                    var centroid = svg.arc.centroid(pieCordinates[i]);
                    return "translate(" + centroid[0] + "," + centroid[1] + ")";

                });
            }
        },
        selectPoint: function (d) {

        }
    });

    return Chart;
}

