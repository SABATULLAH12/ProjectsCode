/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />

angular.module("mainApp").controller("tableController", ["$scope", '$q', "$http", function ($scope, $q) {
    $scope.buildMenu = function () {
        $.ajax({
            url: appRouteUrl + "Table/GetMenu", async: false, success: function (response) {
                $scope.filters = response;
            }, error: ajaxError
        });
    }

    $scope.prepareContentArea = function () {
        if (prepareFilter() == false)
            return false;

        $("#flexi-table").html("");
        $("#flexi-table").attr("data-val", "");
        var filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        $.ajax({
            url: appRouteUrl + "Table/GetTable",
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                prepareTable(response.Table);
                $("#flexi-table").attr("data-val", JSON.stringify(response));
            },
            error: ajaxError
        });
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

function prepareTable(xdata) {
    if (xdata == null && xdata == undefined)
        return "";

    var table = '';

    table += "<thead><tr>";
    var cell = '';
    if (xdata.Columns != null && xdata.Columns != undefined) {
        $(xdata.Columns).each(function (j, yd) {
            cell += "<th class='" + (j == 0 ? "headcol" : "long") + "'>" + yd + "</th>";
        });
    }
    table += cell + "</tr></thead>";

    var datarows = "";
    $(xdata.Rows).each(function (i, xd) {
        datarows += "<tr>";
        var cell = '';
        $(xdata.Columns).each(function (k, kd) {
            var isexist = false, td = '';
            $(xd.Cells).each(function (j, yd) {
                if (kd == yd.ColumnName) {
                    isexist = true;
                    td = yd.Text;
                }
            });
            if (isexist)
                cell += "<td class='" + (k == 0 ? "headcol" : "long") + "'>" + td + "</td>";
            else
                cell += "<td></td>";
        });

        datarows += cell + "</tr>";
    });
    datarows = "<tbody>" + datarows + "</tbody>";
    table += datarows;
    $("#flexi-table").html(table);

    $("#flexi-table").tableHeadFixer({ "left": 1, "head": true });
}

$(document).ready(function () {
    $("#exp_data").click(function () {
        var tbl = $("#flexi-table").attr("data-val");
        if (tbl != null && tbl != undefined) {
            var filterPanelInfo = { filter: JSON.parse(tbl) };
            
            $.ajax({
                url: "/Table/PrepareExcel",
                data: JSON.stringify(filterPanelInfo),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    window.location.href = "/Handlers/DownloadFile.ashx?file=" + response + "&module=table";
                }
            });
        }
        else
            alert('No data available to export');
    });

});

var replotContentArea = function () {
    $("#flexi-table").tableHeadFixer({ "left": 1, "head": true });
}