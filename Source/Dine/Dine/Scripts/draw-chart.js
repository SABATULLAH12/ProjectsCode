/// <reference path="d3/d3.js" />
/// <reference path="aq-d3/column.js" />
/// <reference path="aq-d3/trendChart.js" />
/// <reference path="aq-d3/columntrendchart.js" />

function drawD3Chart(renderTo, data, themecolor, chartType) {
    if (data == null || data.length == 0) {
        $("#" + renderTo).html('No data available for the selection you made.');
        return;
    }

    themecolor = ["#773734", "#C0504D", "#8C7D70", "#C4BD97", "#C4A9A2", "#B3A2C7", "#465560", "#31859C", "#A53B24", "#D99694", "#E46C0A", "#F79646", "#4A452A", "#4F81BD", "#403152", "#BFBFBF", "#B7DEE8", "#C3D69B", "#FDEADA", "#EEECE1"];
    var width = $("#" + renderTo).width(), height = $("#" + renderTo).height();
    $("#" + renderTo).empty();
    $("#" + renderTo).attr('data-d', JSON.stringify(data));
    var vChart = new aqChart();
    var chartOptions = null;

    switch (chartType) {
        case "column":
            chartOptions = chartPrepare.columnChart(renderTo, width, height, themecolor, data);
            break;
        case "bar":
            chartOptions = chartPrepare.barChart(renderTo, width, height, themecolor, data);
            break;
        case "trend":
            chartOptions = chartPrepare.lineChart(renderTo, width, height, themecolor, data);
            break;
        case "pie":
            chartOptions = chartPrepare.barChart(renderTo, width, height, themecolor, data);
            break;
        default:
            chartOptions = chartPrepare.columnChart(renderTo, width, height, themecolor, data);
            break;
    }
    vChart(chartOptions);
}

var chartPrepare = {
    columnChart: function (renderTo, width, height, seriescolor, data) {
        var options = {
            chart: {
                type: 'column',
                renderTo: renderTo,
                animationDuration: 1000,
                width: width - width * .01,
                height: height - height*.01,
                margins: {
                    top: 25,
                    right: 20
                }
            },
            theme: {
                colors: seriescolor
            },
            custom: {
                x: "x",
                y: "y"
            },
            plotOptions: {
                hideOverlapLabel: false,
                label: [{
                    format: function (d) { return d.y != null ? CommaSeparator(d.y) : ""; },
                    style: {
                        color: function (d, i) {
                            if (d.z != null) {
                                if (d.z >= 120)
                                    return "green";
                                else if (d.z <= 80)
                                    return "red";
                                else
                                    return "black";
                            }
                            else
                                return "black";
                        }
                    }
                }],
                column: {
                    width: 20
                }
            }, xAxis: {
                baseline: true,
                style: {
                    padding: -15
                }
            },
            legend: {
                enabled: true,
                //style:{
                //    fontSize:"20px"
                //}
            },
            series: data
        };
        return options;
    },

    barChart: function (renderTo, width, height, seriescolor, data) {
        var options = {
            chart: {
                type: 'bar',
                renderTo: renderTo,
                animationDuration: 1000,
                width: width - width * .01,
                height: height - height * .01,
                animate: false,
                margins: {
                    top: 25,
                    right: 20,
                    bottom: 20
                }
            },
            theme: {
                colors: seriescolor
            },
            custom: {
                x: "x",
                y: "y"
            },
            plotOptions: {
                label: [{
                    format: function (d) { return d.y != null ? CommaSeparator(d.y) : ""; },
                    style: {
                        color: function (d, i) {
                            if (d.z != null) {
                                if (d.z >= 120)
                                    return "green";
                                else if (d.z <= 80)
                                    return "red";
                                else
                                    return "black";
                            }
                            else
                                return "black";
                        }
                    }
                }],
                bar: {
                    height: 15
                }
            },
            legend: {
                enabled: true,
                verticalAlign: "bottom"
            },
            series: data
        };
        return options;
    },

    lineChart: function (renderTo, width, height, seriescolor, data) {
        var options = {
            chart: {
                type: 'line',
                renderTo: renderTo,
                animationDuration: 1000,
                width: width - width * .01,
                height: height - height * .01,
                animate: false,
                margins: {
                    top: 25,
                    right: 20,
                    bottom: 20
                }
            },
            theme: {
                colors: seriescolor
            },
            custom: {
                x: "x",
                y: "y"
            },
            plotOptions: {
                label: [{
                    format: function (d) { return d.y != null ? CommaSeparator(d.y) : ""; },
                    style: {
                        color: function (d, i) {
                            if (d.z != null) {
                                if (d.z >= 120)
                                    return "green";
                                else if (d.z <= 80)
                                    return "red";
                                else
                                    return "black";
                            }
                            else
                                return "black";
                        }
                    }
                }],
                bar: {
                    height: 15
                }
            },
            legend: {
                enabled: true,
                verticalAlign: "bottom"
            },
            series: data
        };
        return options;
    }
}

function CommaSeparator(nStr) {
    //return  d.format({ format: "#,###.00", locale: "us" }); 
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}