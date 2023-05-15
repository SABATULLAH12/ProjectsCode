/// <reference path="draw-chart.js" />
/// <reference path="angular.js" />
/// <reference path="master-theme.js" />
/// <reference path="jquery-2.2.3.js" />

angular.module("mainApp").controller("snapshotController", ["$scope", '$q', "$http", function ($scope, $q) {
    $scope.buildMenu = function () {
        $.ajax({
            url: appRouteUrl + "Snapshot/GetMenu", async: false, success: function (response) {
                $scope.filters = response;
            }, error: ajaxError
        });
    }

    $scope.prepareContentArea = function () {
        if (prepareFilter() == false)
            return false;

        var loadWidgetByWidget = true;//case true for build widgets one by one, false for build all widgets together
        $(".snapshot-widgets").html('');

        if (loadWidgetByWidget) {
            widget.getWidgets();
        }
        else {
        }
    }

    widget = {

        getWidgets: function () {

            var toolWidgets = [{ WidgetName: "DEALING % OCC | DEALING PT CHG – BY SEGMENT/CAT/CHAIN", WidgetType: widgetTypes.Table, WidgetId: "1" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY WOWE", WidgetType: widgetTypes.BarChart, WidgetId: "2" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY BEVERAGE", WidgetType: widgetTypes.Table, WidgetId: "4" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY GEOGRAPHY", WidgetType: widgetTypes.Table, WidgetId: "5" },
                { WidgetName: "SALES DIST. | SALES % CHG – BY SEGMENT/CAT/CHAIN", WidgetType: widgetTypes.Table, WidgetId: "7" },
                { WidgetName: "INCIDENCE | TRAFFIC DIST. – BY GEOGRAPHY", WidgetType: widgetTypes.ColumnChart, WidgetId: "8" }
            ];

            for (var d = 0; d < toolWidgets.length; d++) {
                widget.buildWidget(toolWidgets[d]);
            }
        },

        //build single widget
        buildWidget: function (widget) {
            var filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')), widget: widget };

            $.ajax({
                url: appRouteUrl + "Snapshot/GetWidgetInfo",
                data: JSON.stringify(filterPanelInfo),
                contentType: "application/json",
                method: "POST",
                async: true,
                success: function (response) {
                    var htmlWidgetStr = prepareWidget(response, widget);
                    if (htmlWidgetStr.length > 0) {
                        $(".snapshot-widgets").append("<div class='snapshot-widget'  id='widget" + widget.WidgetId + "' data-id='widget" + widget.WidgetId + "' data-name='" + widget.WidgetName + "'>" + htmlWidgetStr + "</div>");
                    }
                }
            });
        },

        //build all widgets together
        buildAllWidgets: function () {
            $.ajax({
                url: appRouteUrl + "Snapshot/GetWidgetsInfo",
                data: [],
                type: "POST",
                success: function (response) {
                }
            });
        }
    }

    $scope.buildMenu();
    syncFilterPanel();

    function syncFilterPanel() {
        var leftPanel = {
            ctrl: [
                {
                    ctrlText: "",
                    data: [{ Text: "" }]
                }
            ]
        };
        return $q(function (resolve, reject) {
            setTimeout(function () {
                if (fillFilterPanel(leftPanel)) {
                    resolve('Successful');
                } else {
                    reject('Error');
                }
            }, 1000);
        });
    }
}]);

$(document).ready(function () {
    $("#exp_data").click(function () {
        var filterPanelInfo = { filter: null };
        html2canvas($('.snapshot-bottomlayer'), {

            onrendered: function (data, output) {
                base64 = data.toDataURL();
                base64 = base64.replace('data:image/png;base64,', '');
                var exportDetails = { details: { Base64: base64 } };
                $.ajax({
                    url: "/Snapshot/PreparePowerPoint",
                    data: JSON.stringify(exportDetails),
                    method: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        window.location.href = "/Handlers/DownloadFile.ashx?file=" + response + "&module=snapshot";
                    }
                });
            }
        });
    });
});

var prepareWidget = function (response, widget) {
    var htmlWidgetStr = '';
    if (response == null || response == "" || response.length == 0)
        return htmlWidgetStr;
    switch (widget.WidgetType) {

        case widgetTypes.LineChart:
        case widgetTypes.BarChart:
        case widgetTypes.ColumnChart:

            var charttype = '';
            switch (widget.WidgetType) {
                case widgetTypes.LineChart:
                    charttype = 'line';
                    break;
                case widgetTypes.BarChart:
                    charttype = 'bar';
                    break;
                case widgetTypes.ColumnChart:
                    charttype = 'column';
                    break;
                default:
                    charttype = 'bar';
                    break;
            }
            $(".snapshot-widgets").append("<div class='snapshot-widget' data-id='" + widget.WidgetId + "' id='widget" + widget.WidgetId + "' data-name='" + widget.WidgetName + "'>" + htmlWidgetStr + "</div>");
            drawD3Chart("widget" + widget.WidgetId, response.Data.Series, null, charttype);//for drawing chart
            break;

        case widgetTypes.Table:
        default:
            $(response.Data.Table.Rows).each(function (i, id) {
                var row = '<tr>', cells = '';
                $(id.Cells).each(function (y, yd) {
                    cells += '<td>' + yd.Text + '</td>';
                });
                row += cells + '</tr>';
                htmlWidgetStr += row;
            });
            htmlWidgetStr = "<table class='widget-tbl'>" + htmlWidgetStr + "</table>";
            break;
    }

    return htmlWidgetStr;
}

var replotContentArea = function () {

}

var widgetTypes = { Table: 0, LineChart: 1, BarChart: 2, ColumnChart: 3 };