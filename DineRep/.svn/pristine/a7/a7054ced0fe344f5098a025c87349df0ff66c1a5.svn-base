/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.js" />
/// <reference path="master-theme.js" />
/// <reference path="draw-chart.js" />

angular.module("mainApp").controller("chartController", ['$scope', '$q', '$http', function ($scope, $q) {
    buildMenu();
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

    function buildMenu() {
        $.ajax({
            url: appRouteUrl + "Chart/GetMenu", async: false, success: function (response) {
                $scope.filters = response;
            }, error: ajaxError
        });
    }

    $scope.prepareContentArea = function () {
        if (prepareFilter() == false)
            return false;
        $("#chart-visualisation").html('');
        var filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        $.ajax({
            url: appRouteUrl + "Chart/GetChart",
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                data = response.Series;
                if (response.Series == null || response.Series.length == 0)
                    $("#chart-visualisation").html('No data available for the selection you made.');
                else
                    drawD3Chart("chart-visualisation", data, null, $(".chart-type-active").attr('data-chart'));//for drawing chart
            },
            error: ajaxError
        });
    }

    $scope.chartTypes = [{ type: 'bar', css: 'chart-bar', isdefault: false }
                        , { type: 'column', css: 'chart-column', isdefault: true }
                        , { type: 'trend', css: 'chart-trend', isdefault: true }
    ];

    $scope.showHideFilterPanel = function () {
        showHideFilterPanel();
    }
}]);

var changeChart = function (key) {
    $(".chart-type-active").each(function (i, e) {
        $(e).removeClass('chart-type-active');
    });
    $(key).addClass('chart-type-active');
    replotContentArea();
    //var data = $("#chart-visualisation").attr('data-d');
    //if (data != null && data != undefined) {
    //    drawD3Chart("chart-visualisation", JSON.parse(data), null, $(key).attr('data-chart'));//for drawing chart
    //}
}

$(document).ready(function () {
    $("#exp_data").click(function () {
        if ($("#master-btn").attr('data-val') != null && JSON.parse($("#master-btn").attr('data-val')) != undefined) {
            var exportDetails = { details: { ChartType: $(".chart-type-active").attr('data-chart'), Filter: JSON.parse($("#master-btn").attr('data-val')) } };
            $.ajax({
                url: "/Chart/PreparePowerPoint",
                data: JSON.stringify(exportDetails),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    window.location.href = "/Handlers/DownloadFile.ashx?file=" + response + "&module=chart";
                }
            });
        }
    });

});

var replotContentArea = function () {
    var key = $(".chart-type-active").first();
    var data = $("#chart-visualisation").attr('data-d');
    if (data != null && data != undefined) {
        drawD3Chart("chart-visualisation", JSON.parse(data), null, $(key).attr('data-chart'));//for drawing chart
    }
}