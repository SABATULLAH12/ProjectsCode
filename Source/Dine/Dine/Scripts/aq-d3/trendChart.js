// JavaScript source code
/// <reference path="~/jquery-1.10.2.min.js" />
/// <reference path="~/jquery-ui.min.js" />
/// <reference path="~/d3.js" />


var data = [
    [
        { x: 'Jul 14', y: -.5, value: 5728 }, { x: 'Aug 14', y: .8, value: 3153 },
        { x: 'Sep 14', y: -.1, value: 2728 }, { x: 'Oct 14', y: .8, value: 3153 },
        { x: 'Nov 14', y: -.5, value: 5728 }, { x: 'Dec 14', y: -.5, value: 3153 }
    ],
    [
        { x: 'Jul 14', y: -.3, value: 5728 }, { x: 'Aug 14', y: .8, value: 3153 },
        { x: 'Sep 14', y: 3.8, value:1728 }, { x: 'Oct 14', y: .8, value: 3153 },
        { x: 'Nov 14', y: -.7, value: 5728 }, { x: 'Dec 14', y: .8, value: 3153 }
    ]
];



var chart;
function updateData() {
    chart.update(data1);
}

//$(document).ready(function () {
//    chart = new TrendChart();
//    chart({
//        chart: {
//            type: 'line',
//            renderTo: "visualisation",
//            animationDuration: 1000,
//            width: 872,
//            height: 155
//        },
//        data: data,
//        Series: [{
//            style: {
//                DashType: "5,5",
//                fill: "#F08383"
//            },
//            data: data[0]
//        },
//        {
//            style: {
//                DashType: "",
//                fill: "gray"
//            },
//            data: data[1]
//        }]
//    });
   
//});


Tooltip = function () {

    var toolTipDiv;
    var option = {
        ArrowSize: 15,
        IsHTML: true
    };
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
            padding: "5px"
        })

        if (option.IsHTML == true)
            toolTipDiv = d3.select("body").append("div").style({ "position": "absolute", "font-size": "24px", "fill": "white", "color": "white", "padding": "10px" });
        else
            toolTipDiv = node.append("text").attr({ "font-size": "24px", "fill": "white", "stroke": "white" });

        //document.body.appendChild(node.node());

        //.classed("tooltipDiv", true);

        //toolTipDiv.attr("Style", "position:absolute");
        return node.node();
    };
    function Tooltip(svg) {
        svg.node().appendChild(html);
        option.Xlimit = svg.attr("width") .node().getBBox().width;
        option.Ylimit = svg.attr("height").node().getBBox().height;
    }

    Tooltip.show = function () {
        tip = d3.select(html);
        d = d3.select(this).data()[0];
        tipShap = tip.select("path");
        var tipSize;
        toolTipDiv.text("$" + d.value);
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

        if (option.IsHTML == true) {
            toolTipDiv.style({
                "position": "absolute",
                "left": (d3.event.clientX - LapsWidth) + "px",
                "top": (d3.event.clientY + 15) + "px"
            });
        } else {
            toolTipDiv.attr("y", tipSize.height + 15)
            .attr("x", -LapsWidth + 5);
        }


        d3.select(html).style({ opacity: 1 })
        .transition()
        .duration(100)
        .attr("transform", "translate(" + d3.event.offsetX + "," + d3.event.offsetY + ")");
    };

    Tooltip.hide = function () {
        d3.select(html).transition()
            .duration(50).style({ opacity: 0 })
    }

    function ToolTipShape(xd, yd, width, height) {
        var x = 0, y = 0;
        var w = width || 0;
        var h = height || 0;
        var ah = 15;
        var aw = 8;

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

var tick = new Tooltip();

var Legend = function () {
    var legendBox;
    init = function () {

    }

    function Legend(svg) {
        legendBox = svg.append("g").classed("legendGroup", true);
    }

    Legend.render = function (data, options) {

        var Xpos = 10, YPos = 10, rSize = 10;
        for (index in data.items) {

            item = data.items[index];
            if (item.show == false)
                continue;
            legendGroup = legendBox.append("g");

            legendGroup.append("line")
            .attr("x1", 0)
            .attr("x2", 30)
            .attr("y1", 0)
            .attr("y2", 0)
            .attr("stroke-width", 2)
            .attr("stroke", item.color);

            if (item.symbol == "circle")
                legendGroup.node().appendChild(symbol.prototype.circle(15, 0, rSize));
            else
                legendGroup.node().appendChild(symbol.prototype.diamond(15, -7, { width: 10, height: 10 }));


            text = legendGroup.append("text")
            .text(item.name)
            .attr("x", 35)
            .attr("dy", 5);

            legendGroup.attr("transform", "translate(" + Xpos + ",10)");
            Xpos += 40 + text.node().getBBox().width;
        }

    }

    Legend.GetHeight = function () {
        return 100; //legendBox.node().getBBox().height;
    }
    return Legend;
}

TrendChart = function () {
    var defaults = {
        chart: {
            renderTo: "",
            width: 900,
            height: 400,
            margins: {
                top: 25,
                right: 5,
                bottom: 5,
                left: 5
            },
            animate: true,
            animationDuration: 1000
        },
        XAxis: {
            format: function () {
                return data.x + data.value;
            }
        },
        plotOptions: {
            Series: {}
        },
        custom: false,
        data: [],
        colors: ["#E1BF5D", "#BB4F3D"]
    };


    symbol = function () {

    }
    symbol.prototype.circle = function (x, y, size) {
        circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        d3.select(circle)
                       .attr("cx", x)
                       .attr("cy", y)
                       .attr("r", size / 2)
                       .attr("fill", "#8C2C2C")
                       .on('mouseover', tick.show)
                      //.on("click", tick.show)
        .on('mouseout', tick.hide);
        return circle;
    }
    symbol.prototype.diamond = function (x, y, size) {
        rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
        d3.select(rect)
            .attr("x", x)
        .attr("y", y)
             .attr("width", size.width)
             .attr("height", size.height)
            .attr("fill", "white")
            .attr("stroke", "gray")
             .attr('transform', 'rotate(50 ' + x + ' ' + y + ')');
        return rect;
    }


    var lineFunction = d3.svg.line()
           .x(function (d) {
               return xRange(d.x);
           }).y(function (d) {
               return yScale(d.y);
           })
    .interpolate("cardinal");


    var yScale = d3.scale.linear();
    var xRange = d3.scale.ordinal();
    var vis;
    var options;
    var Seriesdata;
    var chart;
    var drawArea = {
        top: 0,
        bottom: 0
    };
    var markerBox;
    function TrendChart(settings) {
        options = $.extend(true, {}, defaults, settings);
        init();
        render();
    }

    function GetExtentDataPoint(DataArray) {
        var minValue = DataArray[0][0].y;
        var maxValue = DataArray[0][0].y;
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
        return { min: minValue, max: maxValue };
    }

    function DrawGridLines(svg, series) {

        grid = svg.select(".aq-charts-grids");
        if (grid.empty()) {
            grid = svg.append('svg:g')
                .classed("aq-charts-grids", true)
            .attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');
        }
        else {
            grid = svg.select(".aq-charts-grids");
            grid.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');
        }

        //grid = vis.append('svg:g').classed("aq-charts-grids", true)


        gridLines = grid.selectAll(".gridline")
             .data(series);

        gridLines.enter().append("line");

        gridLines.exit().remove();
        gridLines.classed("gridline", true)
            .transition().duration(1000)
            .attr("x1", function (d) { return xRange(d.x); })
            .attr("x2", function (d) { return xRange(d.x); })
            .attr("y1", drawArea.top)
            .attr("y2", drawArea.bottom)
            .attr("stroke-width", ".5px")
            .attr("stroke", "gray");

        //for (var i = 0 ; i < series.length; i++) {
        //    var data1 = series[i];



        //    grid.append("line")
        //          .attr("x1", xRange(data1.x) - 5)
        //          .attr("x2", xRange(data1.x) + 5)
        //          .attr("y1", drawArea.bottom)
        //          .attr("y2", drawArea.bottom)
        //          .attr("stroke-width", ".5px")
        //          .attr("stroke", "gray");
        //}
    }

    function DrawXAxis(svg, Series, resize) {


        XAxisGroup = svg.select(".X-Axis");
        if (XAxisGroup.empty())
            XAxisGroup = svg.append('svg:g')
                .classed("X-Axis", true);
        else
            XAxisGroup = svg.select(".X-Axis");

        AxisGroup = XAxisGroup.selectAll(".aq-chart-axis-label")
            .data(Series);
        AxisGroup.enter()
            .append('svg:g')
        AxisGroup.exit().remove();

        AxisGroup.classed("aq-chart-axis-label", true).selectAll(".lblAxis").remove();
        AxisGroup.append("text")
                        .classed("lblAxis", true)
                       .attr("text-anchor", "middle")
                       .text(function (d) { return d.x })
                       .attr("font-size", "12px")
                       .attr("fill", 'gray')
                       .attr("dy", "1em")
        ;

        if (resize != true) {
            drawArea.bottom -= XAxisGroup.node().getBBox().height;
            UpdateYScale();
        }
        AxisGroup
            .transition().duration(1000)
        .attr('transform', function (d) {
            return 'translate(' + xRange(d.x) + ',0)';
        });

        XAxisGroup.attr("transform", "translate(0," + (drawArea.bottom) + ")");

        XAxisGroup.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',' + (drawArea.bottom) + ')');
    }

    function DrawDataLine(svg, Series) {

        BarGroup = svg.select(".aq-charts-datapoint");
        if (BarGroup.empty())
            BarGroup = svg.append('svg:g')
                .classed("aq-charts-datapoint", true);
        else
            BarGroup = svg.select(".aq-charts-datapoint");

        Curve = BarGroup.selectAll(".path")
            .data(Series);

        Curve.enter()
            .append("path").classed("path", true);

        Curve.exit().remove();


        Curve
            .attr("d", function (d) { return lineFunction(d); })
            .attr("stroke", function (d, i) { return GetSeriesStyle(i).fill; })
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .attr("stroke-dasharray", function (d, i) { return GetSeriesStyle(i).DashType; })
            .attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)')
            .transition().duration(1000)
        ;

    }


    datapointSelector = function () {
        dataPoint = d3.select(this);
        dataPoint.attr("fill", "green");
    }

    function GetSeries(Series) {
        var Seriesdata = [];
        if (options.custom == true) {
            for (index in Series) {
                list = Series[index].data;
                data = [];
                for (index in list) {
                    data.push({
                        x: list[index].MetricName,
                        y: parseFloat(list[index].Change),
                        value: list[index].Value
                    });
                }
                Seriesdata.push(data);
            }
        } else {
            for (index in Series) {
                Seriesdata.push(Series[index].data);
            }
        }
        return Seriesdata;
    }

    function GetSeriesStyle(index) {
        return options.Series[index].style;
    }

    function init() {
        Seriesdata = [];// options.data;

        chart = options.chart;
        drawArea = {
            top: 0 + chart.margins.top,
            bottom: chart.height - chart.margins.bottom
        };

        Seriesdata = GetSeries(options.Series);
        if (options.custom != false)
            Seriesdata = CustomData(Seriesdata, options.custom);
        vis = vis = d3.select("#" + chart.renderTo).append("svg")
        .attr("width", chart.width)
        .attr("height", chart.height);

        extentPoint = GetExtentDataPoint(Seriesdata);
        var minValue = extentPoint.min;
        var maxValue = extentPoint.max;

        yScale.range([drawArea.top, drawArea.bottom]).
               domain([minValue, maxValue]);

        xRange.rangeRoundBands(
                [chart.margins.left, chart.width - chart.margins.right], .1)
                .domain(Seriesdata[0].map(function (d) {
                    return d.x;
                }));


    }

    function DrawDataPoint(Series, style) {

        var data = Series;//Seriesdata[dataList];
        var VScale = xRange.rangeBand();
        var HPoint = VScale / 2;




        DataPointGroup = vis.append('svg:g');

        for (index in data) {
            if (style.pointType == "diamond") {
                DataPointGroup.append("rect")
               .attr("x", xRange(data[index].x) - 4)
               .attr("y", yScale(data[index].y) - 4)
                    .classed("datapoint", true)
                    .attr("width", "8")
                    .attr("height", "8")
                    .attr("stroke", "gray")
                    .attr("fill", "white").attr('transform', 'rotate(50 ' + xRange(data[index].x) + ' ' + yScale(data[index].y) + ')');


            } else {
                co = symbol.prototype.circle(xRange(data[index].x), yScale(data[index].y), 10);
                d3.select(co).data([data[index]]).classed("datapoint", true);
                DataPointGroup.node().appendChild(co);
            }
        }
        DataPointGroup.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');

    }

    function render() {

        var legends = new Legend();

        legends(vis);
        legends.render(
               {
                   items: [
                       { name: "Previous Year", itemStyle: "line", color: "gray", symbol: "diamond" }
                   ]
               },
           {});

        drawArea.top += legends.GetHeight();

        yScale.range([drawArea.top, drawArea.bottom]);

        DrawXAxis(vis, Seriesdata[0]);

        DrawGridLines(vis, Seriesdata[0]);

        DrawDataLine(vis, Seriesdata);

        DrawDataPoint(Seriesdata[0], { pointType: "circle" });
        DrawDataPoint(Seriesdata[1], { pointType: "diamond" });

        bisectDate = d3.bisector(function (d) { return d; }).left,
        // d3.select(".aq-charts-grids").attr("transform", "translate(0," + drawArea.top + ")");
        vis.on("mousemove", mousemove)
            .on("mouseover", showSelection)
            .on("mouseout", hideSelection);


        markerBox = vis.insert("rect", ".X-Axis")
            .classed("marker", true)
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", xRange.rangeBand())
                .attr("height", drawArea.bottom - drawArea.top)
                .attr("fill", "#DED8CE")
                .attr("opacity", 0);

        function showSelection() {
            markerBox.attr("opacity", .3);
        }
        function hideSelection() {
            markerBox.attr("opacity", 0);
        }
        function mousemove() {
            tempdata = xRange.range();
            w = xRange.rangeBand();
            wh = 0;//w / 2;
            var x0 = d3.event.offsetX + wh,
                i = bisectDate(tempdata, x0),
                d0 = tempdata[i - 1],
                d1 = tempdata[i],

                d = x0 - d0 > d1 - x0 ? d1 : d0;


            markerBox.attr("transform", "translate(" + (tempdata[i - 1]) + "," + drawArea.top + ")");


        }
        tick(vis);
    }

    TrendChart.update = function (Series) {
        var vis = d3.select("#" + chart.renderTo);
        if (options.custom != false)
            Series = CustomData(Series, options.custom);
        var extent = GetExtentDataPoint(Series);
        yScale.domain([extent.min, extent.max]);
        xRange.domain(Series[0].map(function (d) {
            return d.x;
        }));
        DrawXAxis(vis, Series[0], true);
        DrawDataLine(vis, Series);
        DrawGridLines(vis, Series[0]);
        d3.selectAll(".datapoint").remove();
        DrawDataPoint(Series[0], { pointType: "diamond" });
        DrawDataPoint(Series[0], { pointType: "circle" });

        markerBox.attr("width", xRange.rangeBand())
                .attr("height", drawArea.bottom - drawArea.top)
    }

    function CustomData(dataSets, CustomObject) {
        var data = [];
        var Series = [];
        for (i in dataSets) {
            dataSet = dataSets[i];
            data = [];
            for (index in dataSet) {
                data.push({
                    x: dataSet[index][CustomObject.x],
                    y: +dataSet[index][CustomObject.y].toFixed(1),
                    value: dataSet[index].Value
                });
            }
            Series.push(data);
        }
        return Series;
    }

    function UpdateYScale() {
        yScale.range([drawArea.top, drawArea.bottom]);
    }

    function GetXAxis(Data) {

    }

    return TrendChart;
}