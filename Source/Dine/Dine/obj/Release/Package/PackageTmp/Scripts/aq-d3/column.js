var ColumnChart = function () {
    var Legend = function () {

        defaultStyle = {
            fill: "black",
            StrokeWidth: 1,
            symbol: "rect",
            lineType: "line"
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
            var Xpos = 10, YPos = 10, rSize = 10;

            for (index in data.items) {

                item = data.items[index];
                style = $.extend(true, defaultStyle, item.itemStyle);
                if (item.show == false)
                    continue;
                legendGroup = legendBox.append("g");

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
                drawArea.bottom -= legendsBbox.height + 15;
                legendAreaYPos = drawArea.bottom;
            } else if (options.verticalAlign == "middle") {

            }
            else if (options.verticalAlign == "top") {
                legendAreaYPos = drawArea.top;
                drawArea.top += legendsBbox.height;
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
            UpdateYScale();
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
                padding: "2px"
            })

            if (option.IsHTML == true)
                toolTipDiv = d3.select("body").append("div").classed("tooltip", true).style({ "position": "absolute", "font-size": "12px", "fill": "white", "padding": "2px", "top": -1000 });
            else
                toolTipDiv = node.append("text").attr({ "font-size": "24px", "fill": "white", "stroke": "white" });

            //document.body.appendChild(node.node());

            //.classed("tooltipDiv", true);

            //toolTipDiv.attr("Style", "position:absolute");
            return node.node();
        };

        function Tooltip(svg, setting) {
            svg.node().appendChild(html);
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

    var options = {};
    var data;
    var chart;
    var drawArea = {};
    var vis;
    //Function Scaling Variable/Function
    var xAxisScale = d3.scale.ordinal();
    var xRange = d3.scale.ordinal();
    var xGroupScale = d3.scale.ordinal();
    var yScale = d3.scale.linear();
    var tick;
    var categories = [];

    function ColumnChart(settings) {
        options = $.extend(true, {}, defaults, settings);
        data = [];//options.data;
        chart = options.chart;

        data = GetSeries(options.series);

        drawArea = {
            top: 0 + chart.margins.top,
            bottom: chart.height - chart.margins.bottom,
            left: chart.margins.left,
            right: chart.width - chart.margins.right
        };

        vis = d3.select("#" + chart.renderTo).append("svg")
        .attr("width", chart.width)
        .attr("height", chart.height);
        init();
        render();
    }

    function DrawLabel(svg, Series, setting) {

        LabelsGroup = svg.select(".aq-chart-data-labels");
        if (LabelsGroup.empty())
            LabelsGroup = svg.append('svg:g')
            .classed("aq-chart-data-labels", true);
        else
            LabelsGroup = svg.select(".aq-chart-data-labels");

        LabelGroup = LabelsGroup.selectAll(".aq-chart-label")
            .data(Series);
        LabelGroup.enter()
            .append('svg:g');
        LabelGroup.exit().remove();

        if (options.plotOptions.label.border == "circle")
            LabelGroup.append("circle")
            .attr("r", 20)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("fill", "#DDDDDD");

        LabelGroup.classed("aq-chart-label", true)
        .append("text")
        .text(function (d) { return d.y + "%" })
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .style("font-weight", "bold")
        .attr("fill", function (d) { return GetColor(d.y); })
        .attr("y", function () {
            if (setting.position == "top")
                return "1em";
            else if (setting.position == "baseline")
                return ".5em";
        });



        InsertArrow(LabelGroup);

        PosY = 0;

        if (setting.position == "baseline") {
            PosY = yScale(0);
        }

        LabelsGroup.selectAll(".aq-chart-label")
        .attr('transform', function (d) { return 'translate(' + (xRange(d.x) + 5) + ',' + PosY + ')'; });

        //drawArea.top = LabelsGroup.node().getBBox().height;
        return LabelsGroup;
    }

    function drawXAxis(svg, Series, resize) {
        style = options.XAxis.style;

        XAxisGroup = svg.select(".X-Axis");
        if (XAxisGroup.empty())
            XAxisGroup = svg.append('svg:g')
                .classed("X-Axis", true);
        else
            XAxisGroup = svg.select(".X-Axis");

        AxisGroup = XAxisGroup.selectAll(".aq-chart-axis-label")
            .data(Series);
        AxisGroup.enter()
            .append('svg:g').classed("aq-chart-axis-label", true)
        AxisGroup.exit().remove();

        AxisGroup
            .append("text")
            .classed("lblAxis", true)
            .attr("text-anchor", "middle")
            .text(function (d) { return options.plotOptions.XAxis.format.call(this, d); })
            .attr("font-size", style.fontSize)
            .attr("fill", style.color)
            .attr("dy", 1);
        //AxisGroup.exit().remove();
        var barWidth = (xRange.range()[1] - xRange.range()[0]) / 2;
        XAxisGroup.selectAll(".aq-chart-axis-label")
        .attr('transform', function (d) { return 'translate(' + xAxisScale(d) + ',0)'; });
        XAxisGroup.attr("transform", "translate(0," + (drawArea.bottom) + ")");
        return XAxisGroup;
    }

    function drawYAxis(svg, resize) {
        YAxisGroup = svg.select(".Y-Axis");
        if (YAxisGroup.empty())
            YAxisGroup = svg.append('svg:g')
                .classed("Y-Axis", true);
        else
            YAxisGroup = svg.select(".Y-Axis");

        AxisGroup = YAxisGroup.selectAll(".aq-chart-yaxis-label")
            .data(yScale.ticks(5).reverse().slice(0, 5));

        AxisGroup.enter()
            .append('svg:g')
        AxisGroup.exit().remove();

        AxisGroup.classed("aq-chart-yaxis-label", true).selectAll(".lblAxis").remove();

        AxisGroup.append("text")
                        .classed("lblAxis", true)
                       .attr("text-anchor", "middle")
                       .text(function (d) { return d })
                       .attr("font-size", "12px")
                       .attr("fill", 'gray')
                       .attr("dy", "0em");

        AxisGroup
        .attr('transform', function (d) {
            return 'translate(10,' + yScale(d) + ')';
        });


        drawArea.left += 25;
        UpdateXScale();

        YAxisGroup.attr('transform', 'translate(' + chart.margins.left + ',0)');
    }

    function drawSeries(vis, series) {
        color = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

        transitionAmount = 0;

        barWidth = barWidth - 10;
        pointPadding = 4;
        outerPadding = 15;

        var barWidth = ((chart.width / series[0].length) - (outerPadding * 2) - (pointPadding * series.length)) / series.length;
        var BaseLine = 0;

        if (options.plotOptions.animation == true)
            transitionAmount = 1000;

        series.forEach(function (d, i) {
            data = d;
            var BarGroup = vis.append("svg:g");
            bars = BarGroup.selectAll(".bar")
                  .data(data)
                  .enter()
                  .append("rect")
                      .classed('bar', true)
                      .attr("x", function (d) { return xRange(d.x) })
                      .attr("y", yScale(BaseLine))
                      .attr("width", barWidth)
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

            BarGroup.attr("transform", "translate(" + (((barWidth + pointPadding) * i) + outerPadding) + ",0)");
            //return BarGroup;
        });
    }

    function drawLegends() {
        var legends = new Legend();

        legends(vis);
        legendList = [];
        for (index in options.series) {
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

    function InsertArrow(selector) {
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

    function GetSeries(Series) {
        var Seriesdata = [];
        if (options.custom != false) {
            tempSeries = d3.map(
                Series.map(function (d, i) { return { data: d.data, name: d.name == undefined ? "Series " + 1 : d.name } }),
                function (d, i) { return d.name });
            for (index in Series) {
                if (!Series[index].name) {
                    Series[index].name = "Series " + (+index + 1);
                }
                list = Series[index].data;
                data = CustomData(list, Series[index].name, options.custom);
                Seriesdata.push(data);
            }
        } else {
            for (index in Series) {
                Seriesdata.push(Series[index].data);
            }
        }
        return Seriesdata;
    }

    function GetYDomain(ExtentValues) {
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

    function init() {

        xRange
            .rangeBands([chart.margins.left, chart.width - chart.margins.right])
            .domain(getXDomain(data));

        xAxisScale.rangePoints([chart.margins.left, chart.width - chart.margins.right], 1)
            .domain(getXDomain(data));
        // max = d3.max(Seriesdata.map(function (d) { return d3.max(Seriesdata[0].map(function (d) { return d.y })) }));

        extentPoint = GetExtentDataPoint(data);
        yScale
            .range([chart.height - chart.margins.top, chart.margins.bottom], .5)
            .domain(
            GetYDomain([extentPoint.min, extentPoint.max])
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


        if (options.plotOptions.label.enabled == true) {
            Labels = DrawLabel(vis, data, options.plotOptions.label);
            UpdateDrawArea(Labels, options.plotOptions.label);
        }

        categories = getXDomain(data);

        drawLegends();

        XAxis = drawXAxis(vis, categories);



        wrap(vis.selectAll(".lblAxis"), 70);

        UpdateDrawArea(XAxis, options.plotOptions.XAxis);
        UpdateYScale();
        drawYAxis(vis, true);
        //yScale.range([drawArea.bottom, drawArea.top]);
        max = yScale.domain()[1];
        var BaseLine = 0;

        drawSeries(vis, data);

        //bars = drawBars(vis, data[1]);
        //bars.attr("transform", "translate(30,0)");

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

    }

    function UpdateDrawArea(element, elementSetting) {
        var BBox = element.node().getBBox();
        if (elementSetting.position == "bottom") {
            drawArea.bottom -= BBox.height;
            element.attr("transform", "translate(0," + drawArea.bottom + ")");
        }
        else if (elementSetting.position == "top") {
            drawArea.top += BBox.height;
        }
    }

    function UpdateXScale() {
        xRange
            .rangeBands([drawArea.left, chart.width - chart.margins.right]);

        xAxisScale.rangePoints([drawArea.left, chart.width - chart.margins.right], 1);
    }

    function CustomData(dataSet, seriesKey, CustomObject) {
        var data = [];
        for (index in dataSet) {
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

    ColumnChart.update = function (newData) {

        data = [];//
        drawArea.top = chart.margins.top;
        drawArea.bottom = chart.height - chart.margins.bottom;

        if (typeof options.custom === "object") {
            data = CustomData(newData, options.custom);
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

        yScale.domain(GetYDomain(d3.extent(data.map(function (d) { return d.y; })))).nice();


        vis.select(".X-Axis").remove();
        vis.select(".aq-chart-data-labels").remove();

        XAxis = drawXAxis(vis, data);
        wrap(vis.selectAll(".lblAxis"), 70);
        UpdateDrawArea(XAxis, options.plotOptions.XAxis);

        yScale.range([drawArea.bottom, drawArea.top]);
        DrawLabel(vis, data, false);
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
        //UpdateXAxisLine();

        vis.selectAll(".NoData").remove();
        if (data.length == 0)
            vis.append("text")
                .classed("NoData", true)
        .attr("x", chart.width / 2)
        .attr("y", chart.height / 2)
        .text("No data available.")
        .attr("text-anchor", "middle");
    }

    ColumnChart.ClearSelection = function () {
        vis.selectAll(".bar").attr("opacity", null);
        options.Selections.SelectedPoint = null;
        options.event.onResetSelection();
    }

    function SelectPointByData(DataPoints, SelectedValue) {
        DataPoints.filter(function (d, i) { });
    }

    function UpdateXAxisLine() {
        baseLine = d3.select(".Axis-line");
        baseLine.transition().duration(1000).attr("transform", "translate(0," + (yScale(0)) + ")");
    }

    function UpdateXAxis() {

    }
    function UpdateYScale() {
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

    return ColumnChart;
}