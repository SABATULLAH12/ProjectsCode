var chart = function () {
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
        }
    }

    var Legend = function () {

        defaultStyle = {
            fill: "black",
            StrokeWidth: 1,
            symbol: "rect",
            lineType: "line",
            margin: { bottom: 20, top: 20 }
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
                style = $.extend(true, defaultStyle, item.itemStyle);
                if (item.show == false)
                    continue;
                legendGroup = legendBox.append("g").data(index);

                legendGroup.on("click", function (d) {
                    seriesFn.hideSeries(d);
                    var selectedPoints = points.slice(0, points.length - 1);
                    selectedPoints.splice(d, 1)
                    seriesFn.redraw(selectedPoints);
                    //alert("legend " + d + " clicked")
                });

                legendGroup.append("rect")
                .attr("width", "15px")
                .attr("height", "15px")
                .attr("fill", theame.colors[index]);

                text = legendGroup.append("text")
                .text(item.name)
                .attr("x", 25)
                .attr("dy", ".8em");

                if (options.layout == "horizontal") {
                    legendGroup.attr("transform", "translate(" + Xpos + "," + YPos + ")");
                    Xpos += 40 + text.node().getBBox().width;
                } else {
                    legendGroup.attr("transform", "translate(" + Xpos + "," + YPos + ")");
                    YPos += 5 + text.node().getBBox().height;
                }
            }

            legendsBbox = legendBox.node().getBBox();
            legendAreaXPos = 0;
            legendAreaYPos = 0;

            if (options.verticalAlign == "bottom") {
                drawArea.bottom -= legendsBbox.height + defaultStyle.margin.bottom + defaultStyle.margin.top;
                legendAreaYPos = drawArea.bottom + defaultStyle.margin.top;
            } else if (options.verticalAlign == "middle") {

            }
            else if (options.verticalAlign == "top") {
                legendAreaYPos = drawArea.top;
                drawArea.top += legendsBbox.height + defaultStyle.margin.bottom + defaultStyle.margin.top;
            }

            if (options.align == "left") {
                legendAreaXPos = drawArea.left;
            } else if (options.align == "center") {
                legendAreaXPos = ((drawArea.right - drawArea.left) / 2) - (legendsBbox.width / 2);
            }
            else if (options.align == "right") {
                legendAreaXPos = drawArea.right - legendsBbox.width;
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
                toolTipDiv = d3.select("body").append("div").classed("tooltip", true).style({ "position": "absolute", "font-size": "12px", "fill": "white", "padding": "5px", "top": -1000 });
            else
                toolTipDiv = node.append("text").attr({ "font-size": "24px", "fill": "white", "stroke": "white" });

            //document.body.appendChild(node.node());

            //.classed("tooltipDiv", true);

            //toolTipDiv.attr("Style", "position:absolute");
            return node.node();
        };

        function Tooltip(svg, setting) {
            vis.node().appendChild(html);
            option.Xlimit = svg.attr("width");// .node().getBBox().width;
            option.Ylimit = svg.attr("height");//.node().getBBox().height;
            format = setting.format;
        }

        Tooltip.show = function () {
            tip = d3.select(html);
            d = d3.select(this).data()[0];
            mapPoly = d3.select(this).data()[0];
            tipShap = tip.select("path");
            var tipSize;
            // metrix = html.node().getScreenCTM();

            arrowClass = "arrow-up";
            bckGrndClass = "posUp";
            if (d.y < 0) {
                arrowClass = "arrow-down";
                bckGrndClass = "posDwn";
            }
            toolTipDiv.html(format(d));


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

            CenterPosition = xRange(d.x); //path.centroid(mapPoly);
            if (option.IsHTML == true) {
                toolTipDiv.style({
                    "position": "absolute",
                    "left": (d3.event.clientX - tipSize.width / 2) + "px",
                    "top": (d3.event.clientY + 5) + "px"
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

    theame = {
        colors: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]
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
            animationDuration: 1000
        },
        XAxis: {
            format: function () {
                return data;
            },
            style: {
                fontSize: "14px",
                color: "#000"
            }
        },
        custom: false,
        event: {
            onSelect: function () {
                // alert("selected");
            },
            onResetSelection: function () { }
        },
        plotOptions: {
            animation: true,
            XAxis: {
                format: function (d) { return d },
                position: "bottom",
                baseline: true
            },
            label: {
                enabled: true,
                position: "top",
                border: ""
            }
        },
        legend: {
            enabled: true,
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom"
        },
        tooltip: {
            enabled: true,
            format: function (d) { return d.key + "<div>" + d.y + "</div>"; }
        },
        data: [],
        colors: ["#569640", "#BF4041"],
        Selections: {
            SelectedPoint: null
        }
    };

    var  //Variable for individule settings and options
    options = {},
    points,
    chart,
    drawArea = {},
    categories = [],
    vis;

    var //Scaling Variable/Function
    xAxisScale = d3.scale.ordinal(),
    xRange = d3.scale.ordinal(),
    xGroupScale = d3.scale.ordinal(),
    yScale = d3.scale.linear(),
    tick;
    seriesIsGrouped = true;
    function Chart(settings) {
        options = $.extend(true, {}, defaults, settings);
        points = [];//options.data;
        chart = options.chart;

        points = getSeries(options.series);

        drawArea = {
            top: 0 + chart.margins.top,
            bottom: chart.height - chart.margins.bottom,
            left: chart.margins.left,
            right: chart.width - chart.margins.right
        };

        vis = d3.select("#" + chart.renderTo).append("svg")
        .attr("width", chart.width)
        .attr("height", chart.height)
        .attr("font-family", "calibri");
        init();
        render();
    }

    var labels = {};
    var pointWidth;
    var pointPadding = 0;
    var outerPadding = 15;

    function updateElements(wrapper, selector, data) {

        elements = wrapper.selectAll("." + selector)
             .data(data);
        elements.enter()
            .append('svg:g').classed(selector, true)
        elements.exit().remove();

        return elements;

    }

    function corrLabelPosition() {
        for (label in labels) {

            if (options.chart.type == "column") {
                if (options.plotOptions.label.position == "inside") {
                    labels[label].selectAll(".aq-chart-label").attr('transform', function (d) {
                        return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(0) - d3.select(this).node().getBBox().height / 2 - ((yScale(0) - yScale(d.y)) / 2)) + ')';
                    });
                } else {
                    labels[label].selectAll(".aq-chart-label").attr('transform', function (d) {
                        if (yScale(0) < yScale(d.y))
                            return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(0) - ((yScale(0) - yScale(d.y)))) + ')';
                        else
                            return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(0) - d3.select(this).node().getBBox().height - ((yScale(0) - yScale(d.y)))) + ')';
                    });
                }
            } else if (options.chart.type == "line") {
                labels[label].selectAll(".aq-chart-label").attr('transform', function (d) {
                    return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(d.y) - 20) + ')';
                });
            }
        }
    }

    function drawLabel(svg, series, setting) {
        series.forEach(function (d, i) {
            if (!labels["label" + i]) {
                LabelsGroup = svg.append('svg:g')
                    .classed("aq-chart-data-labels", true);
                labels["label" + i] = LabelsGroup;
            }

            LabelGroup = updateElements(LabelsGroup, "aq-chart-label", d);

            if (options.plotOptions.label.border == "circle")
                LabelGroup.append("circle")
                .attr("r", 20)
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("fill", "#DDDDDD");

            LabelGroup
            .append("text")
            .text(function (d) { return d.y })
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .style("font-weight", "bold")
            .attr("fill", "black")
            ;

            PosY = 0;

            if (setting.position == "baseline") {
                PosY = yScale(0);
            }

            LabelGroup.attr('transform', function (d) {
                return 'translate(' + (xRange(d.x) + pointWidth / 2) + ',' + (yScale(d.y) - 12) + ')';
            });

            labelStartPosition = seriesIsGrouped == true ? ((pointWidth + pointPadding) * i) + outerPadding : 0 + outerPadding;
            LabelsGroup.attr('transform', "translate(" + labelStartPosition + ",10)");
        });
    }

    xAxis = {
        render: function (categories) {
            style = options.XAxis.style;
            pointWidth = xRange.rangeBand() / 2;

            XAxisGroup = vis.select(".X-Axis");
            if (XAxisGroup.empty())
                XAxisGroup = renderer.group(vis, "X-Axis");

            AxisGroup = updateElements(XAxisGroup, "aq-chart-axis-label", categories);

            AxisGroup
                .append("text")
                .classed("lblAxis", true)
                .attr("text-anchor", "middle")
                .text(function (d) { return options.plotOptions.XAxis.format.call(this, d); })
                .attr("font-size", style.fontSize)
                .attr("fill", style.color).attr("dy", 1);

            XAxisGroup.selectAll(".aq-chart-axis-label")
            .attr('transform', function (d) { return 'translate(' + xAxisScale(d) + ',0)'; });

            wrap(vis.selectAll(".lblAxis"), pointWidth);

            drawArea.bottom -= XAxisGroup.node().getBBox().height;
            XAxisGroup.attr("transform", "translate(" + 0 + "," + (drawArea.bottom) + ")");
            updateYScale();
        }
    };

    yAxis = {
        render: function () {
            yAxisGroup = vis.select(".YAxis");
            if (yAxisGroup.empty())
                yAxisGroup = renderer.group(vis, "Y-Axis");;

            AxisGroup = updateElements(yAxisGroup, "aq-chart-yaxis-label", yScale.ticks().reverse());

            AxisGroup.classed("aq-chart-yaxis-label", true).selectAll(".lblAxis").remove();

            AxisGroup.append("text")
                            .classed("lblAxis", true)
                           .attr("text-anchor", "middle")
                           .text(function (d) { return d })
                           .attr("font-size", "12px")
                           .attr("fill", 'gray')
                           .attr("dy", ".4em");

            AxisGroup
            .attr('transform', function (d) {
                return 'translate(10,' + yScale(d) + ')';
            });

            drawArea.left += 25;
            updateXScale();

            yAxisGroup.attr('transform', 'translate(' + chart.margins.left + ',0)');
            drawYGridLines();
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

            drawYGridLines();
        }
    };

    function drawYGridLines() {

        grid = vis.select(".aq-charts-ygrids");
        if (grid.empty()) {
            grid = vis.append('svg:g')
                .classed("aq-charts-ygrids", true);
        }
        else {
            grid = vis.select(".aq-charts-ygrids");
        }

        //grid = vis.append('svg:g').classed("aq-charts-grids", true)

        gridLines = grid.selectAll(".gridline")
             .data(yScale.ticks().reverse());

        gridLines.enter().append("line");

        gridLines.exit().remove();

        gridLines.classed("gridline", true)
            .attr("x1", drawArea.left)
            .attr("x2", chart.width)
            .attr("y1", function (d) { return yScale(d) })
            .attr("y2", function (d) { return yScale(d) })
            .attr("stroke-width", ".5px")
            .attr("stroke", "gray");

    }

    function drawSeries(vis, series) {

    }

    function drawLegends() {
        var legends = new Legend();

        legends(vis);
        legendList = [];
        for (var index in options.series) {
            series = options.series[index];
            if (series.name) {
                legendList.push({ name: series.name, itemStyle: series.style });
            } else {
                legendList.push({ name: "Series " + index, itemStyle: series.style });
            }
        }
        legends.render.call(this,
               {
                   items: legendList
               },
           options.legend);
    }

    var GetColor = function (value) {
        var colorPositive = ["#699F54"];
        var colorNegative = ["#BF4041"];
        if (value < 0)
            return colorNegative;
        else
            return colorPositive;
    }

    function insertArrow(selector) {
        if (selector.empty)
            return;
        var arrowName = [];
        arrowName.push("arrow-up.png");
        arrowName.push("arrow-down.png");


        BBox = selector.node().getBBox();
        positionY = (BBox.height / 2) - 3;
        positionX = (BBox.width);

        return selector.append("image")
                          .attr("xlink:href", function (d) {
                              arrow = d.y < 0 ? arrowName[1] : arrowName[0];

                              return "Content/themes/basic/images/" + arrow;
                          })
                          .attr("width", 13)
                          .attr("height", 13)
           .attr("y", positionY)
        .attr("x", 0);
    }

    function getSeries(series) {
        var seriesData = [];
        if (options.custom != false) {
            tempSeries = d3.map(
                series.map(function (d, i) { return { data: d.data, name: d.name == undefined ? "Series " + 1 : d.name } }),
                function (d, i) { return d.name });
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
            Domain.push(0);
            Domain.push(ExtentValues[1]);
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

    function init() {

        xRange
            .rangeBands([chart.margins.left, chart.width - chart.margins.right])
            .domain(getXDomain(points));

        xAxisScale.rangePoints([chart.margins.left, chart.width - chart.margins.right], 1)
            .domain(getXDomain(points));
        // max = d3.max(Seriesdata.map(function (d) { return d3.max(Seriesdata[0].map(function (d) { return d.y })) }));

        extentPoint = getExtentDataPoint(points);
        yScale
            .range([chart.height - chart.margins.top, chart.margins.bottom], .5)
            .domain(
            getYDomain([extentPoint.min, extentPoint.max])
            ).nice().clamp(true);

        xGroupScale.domain("Value");

        //vis = d3.select("#" + chart.renderTo);

        if (options.tooltip.enabled == true) {
            tick = new Tooltip()
            tick(vis, options.tooltip);
        }
    }

    function render() {

        var VScale = xRange.rangeBand();

        var HPoint = VScale / 2;

        categories = getXDomain(points);

        drawLegends();
        yAxis.render();
        xAxis.render(categories);
        yAxis.redraw();

        seriesFn = seriesFn(options.chart.type)
        seriesFn.render(points);

        if (options.plotOptions.label.enabled == true) {
            Labels = drawLabel(vis, points, options.plotOptions.label);
            corrLabelPosition();
        }
    }

    function updateDrawArea(element, elementSetting) {
        var BBox = element.node().getBBox();
        if (elementSetting.position == "bottom") {
            drawArea.bottom -= BBox.height;
            element.attr("transform", "translate(0," + drawArea.bottom + ")");
        }
        else if (elementSetting.position == "top") {
            drawArea.top += BBox.height;
        }
    }

    var seriesPoints = [];
    function seriesFn(chartType) {
        switch (chartType) {
            case "column":
                return columnSeries;
            case "line":
                return lineSeries;
            default:
        }
    }

    var columnSeries = {
        color: ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"],
        render: function (series) {


            transitionAmount = 0;

            pointWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            var BaseLine = 0;

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {
                var data = d;
                var BarGroup = vis.append("svg:g");
                bars = BarGroup.selectAll(".bar")
                      .data(data)
                      .enter()
                      .append("rect")
                          .classed('bar', true)
                          .attr("x", function (d) { return xRange(d.x) })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke", "none")
                          .attr("fill", function (d) { return theame.colors[i] })
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
                    bars.on("mouseover", tick.show)
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
                //return BarGroup;
            });

            if (options.plotOptions.XAxis.baseline == true) {
                baseLine = vis.append("g").classed("Axis-line", true);

                baseLine.append("line")
                .attr("x1", drawArea.left)
                .attr("x2", chart.width)
                .attr("y1", 0)
                .attr("y2", 0)
                .attr("stroke-width", "2px")
                .attr("stroke", "gray");

                baseLine.append("line")
                    .attr("x1", drawArea.left)
                .attr("x2", drawArea.left)
                .attr("y1", -6)
                .attr("y2", +6)
                .attr("stroke-width", "3px")
                .attr("stroke", "gray");

                baseLine.append("line")
                .attr("x1", chart.width)
                .attr("x2", chart.width)
                .attr("y1", -6)
                .attr("y2", +6)
                .attr("stroke-width", "1px")
                .attr("stroke", "gray");

                baseLine.attr("transform", "translate(0," + (yScale(BaseLine)) + ")");
            }
            //this.hideSeries(2);
            //this.redraw(series.slice(0, 2));
        },
        redraw: function (series) {
            transitionAmount = 0;

            pointWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
            var BaseLine = 0;

            if (options.plotOptions.animation == true)
                transitionAmount = 1000;

            series.forEach(function (d, i) {

                var data = d;
                var BarGroup = seriesPoints[i];
                bars = updateElements(seriesPoints[i], "bar", d);

                bars.classed('bar', true)
                          .attr("x", function (d) { return xRange(d.x) })
                          .attr("y", yScale(BaseLine))
                          .attr("width", pointWidth)
                          .attr("height", "0")
                          .attr("stroke", "none")
                          .attr("fill", function (d) { return theame.colors[i] })
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
                    bars.on("mouseover", tick.show)
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

                seriesPoints.push(BarGroup);
                //return BarGroup;
            });
        },
        hideSeries: function (series) {
            seriesPoints[series].attr("visibility", "hidden");
        }
    }

    var lineSeries = {
        style: {
            DashType: "5,0"
        },

        lineFunction: d3.svg.line()
         .x(function (d) {
             return xRange(d.x);
         }).y(function (d) {
             return yScale(d.y);
         }).interpolate("cordinal"),

        getStyle: function (index) {
            return $.extend({
                dashType: "5,0",
                stroke: theame.colors[index]
            }, options.Series[index].style);
        },

        render: function (series) {
            seriesIsGrouped = false;
            pointWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length));
            BarGroup = vis.select(".aq-charts-datapoint");
            if (BarGroup.empty())
                BarGroup = vis.append('svg:g')
                    .classed("aq-charts-datapoint", true);
            else
                BarGroup = vis.select(".aq-charts-datapoint");

            Curve = BarGroup.selectAll(".path")
                .data(series);

            Curve.enter()
                .append("path").classed("path", true);

            Curve.exit().remove();

            Curve.transition().duration(500)
                .attr("d", function (d) {
                    return lineSeries.lineFunction(d);
                })
                .attr("stroke", function (d, i) { return theame.colors[i]; })
                .attr("stroke-width", "2")
                .attr("fill", "none")
                .attr("stroke-dasharray", "5 5")
                .attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)')
                .transition().duration(1000)
            ;
            this.marker(series);
        },

        marker: function (series) {
            var data = series;//Seriesdata[dataList];
            var VScale = xRange.rangeBand();
            var HPoint = VScale / 2;

            series.forEach(function (d, i) {
                DataPointGroup = vis.append('svg:g');

                for (var index in d) {
                    co = renderer.symbol(renderer.symbols.keys[i], xRange(d[index].x), yScale(d[index].y), 10, 10);
                    d3.select(co).data([d[index]]).classed("datapoint", true)
                    .attr({ "fill": theame.colors[i] });

                    DataPointGroup.node().appendChild(co);
                }

                DataPointGroup.attr('transform', 'translate(' + xRange.rangeBand() / 2 + ',0)');
            });
        }
    }

    function updateXScale() {
        xRange
            .rangeBands([drawArea.left, chart.width - chart.margins.right]);

        xAxisScale.rangePoints([drawArea.left, chart.width - chart.margins.right], 1);
    }

    function customData(dataSet, seriesKey, CustomObject) {
        var data = [];
        for (var index in dataSet) {
            data.push({
                key: seriesKey,
                x: dataSet[index][CustomObject.x],
                y: +dataSet[index][CustomObject.y].toFixed(1),
                value: dataSet[index].Value,
                formatedText: dataSet[index].FormatedValue
            });
        }
        return data;
    }

    Chart.update = function (newData) {

        data = [];//
        drawArea.top = chart.margins.top;
        drawArea.bottom = chart.height - chart.margins.bottom;

        if (typeof options.custom === "object") {
            data = customData(newData, options.custom);
        } else {
            data = newData;
        }

        var vis = d3.select("#" + chart.renderTo);
        min = d3.min(data, function (d) { return d.y; });
        max = d3.max(data, function (d) { return d.y; });
        //Setting Up New scales
        xRange.domain(data.map(function (d) {
            return d.x;
        }));

        yScale.domain(getYDomain(d3.extent(data.map(function (d) { return d.y; })))).nice();


        vis.select(".X-Axis").remove();
        vis.select(".aq-chart-data-labels").remove();

        XAxis = drawXAxis(vis, data);
        wrap(vis.selectAll(".lblAxis"), 70);
        updateDrawArea(XAxis, options.plotOptions.XAxis);

        yScale.range([drawArea.bottom, drawArea.top]);
        drawLabel(vis, data, false);
        yScale.range([drawArea.bottom, drawArea.top]);
        //Updating Bar

        max = yScale.domain()[1];
        var BaseLine = 0;
        //if (max < 0)
        //    BaseLine = (parseFloat(max));





        bars = vis.selectAll('.bar')
        .data(data)

        bars.enter()
        .append("rect");

        bars.exit().remove();

        bars
        .attr("opacity", null)
        .attr("fill", function (d) { return GetColor(d.y) })
        .transition().duration(500)
        .attr("height", 0)
        .attr("y", yScale(0))
        .transition().duration(1000)
        .attr("height", function (d) {
            return Math.abs(yScale(d.y) - yScale(BaseLine))
        })
        .attr("y", function (d) {
            if (d.y < 0) return yScale(BaseLine);
            else return yScale(d.y);
        });

        SelectedValue = options.Selections.SelectedPoint;
        SelectedPoint = bars.filter(function (d, i) {
            return d.x == SelectedValue;
        });


        if (!SelectedPoint.empty()) {
            bars.attr("opacity", .3);
            SelectedPoint.attr("opacity", 1);
        }
        //updateXAxisLine();

        vis.selectAll(".NoData").remove();
        if (data.length == 0)
            vis.append("text")
                .classed("NoData", true)
        .attr("x", chart.width / 2)
        .attr("y", chart.height / 2)
        .text("No data available.")
        .attr("text-anchor", "middle");
    }

    Chart.ClearSelection = function () {
        vis.selectAll(".bar").attr("opacity", null);
        options.Selections.SelectedPoint = null;
        options.event.onResetSelection();
    }

    function selectPointByData(DataPoints, SelectedValue) {
        DataPoints.filter(function (d, i) { });
    }

    function updateXAxisLine() {
        baseLine = d3.select(".Axis-line");
        baseLine.transition().duration(1000).attr("transform", "translate(0," + (yScale(0)) + ")");
    }

    function updateXAxis() {

    }

    function updateYScale() {
        yScale.range([drawArea.bottom, drawArea.top], .5).nice();
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

    return Chart;
}

