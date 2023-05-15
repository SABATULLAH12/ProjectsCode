/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.js" />
/// <reference path="master-theme.js" />
/// <reference path="draw-chart.js" />
/// <reference path="chart.css" />
var legend_filter_list = [];
var current_data_for_chart = [];
var current_function_for_chart = "", legendDisabledColor = "#ffffff", commentValue = "";
var gettabledatage = [];
var currentOutputChartType = "column", currentMeasures = [];
var active_chart_type = ""; var active_chart_flag = 0, isFirstTymOutput = 1, firstTimeOut = 0;
//#region Gradient_Color_Column
//var colorColumnStop = ["#e66350", "#8862a8", "#f9ae56", "#6a99ad", "#999898", "#d9dee2", "#fbca5a", "#ca5c46", "#363434", "#68bc73", "#5e88c4", "#ffffff", "#e55330", "#875288", "#f89e16", "#69898d", "#988878", "#d8cec2", "#faba3a", "#c94c26", "#352414", "#67ac53", "#5f78a4"];
//var colorColumnStart = ["#b53c34", "#654180", "#bf7e34", "#417482", "#706f6f", "#a4a7ab", "#c19637", "#9e372e", "#181919", "#379150", "#386594", "#cccccc", "#b42c14", "#643160", "#be6e14", "#406462", "#605f4f", "#a3978b", "#c08617", "#9d270e", "#170909", "#368130", "#378574"];
var colorColumnStop = ["#AE192C", "#2E6878", "#936C0D", "#037C37", "#4D1F77", "#515151", "#820A0B", "#0A517C", "#C5790F", "#818284", "#000000", "#ffffff", "#e55330", "#875288", "#f89e16", "#69898d", "#988878", "#d8cec2", "#faba3a", "#c94c26", "#352414", "#67ac53", "#5f78a4"];
var colorColumnStart = ["#E41E2B", "#31859C", "#FFC000", "#00B050", "#7030A0", "#7F7F7F", "#C00000", "#0070C0", "#FF9900", "#D2D9DF", "#000000", "#838C87", "#83E5BB", "#cccccc", "#b42c14", "#643160", "#be6e14", "#406462", "#605f4f", "#a3978b", "#c08617", "#9d270e", "#170909", "#368130", "#378574"];
//#endregion Gradient_Color_Column
//Visit Measures
visitList.push("Visit Measures");
guestList.push("Guest Measures");
var isEditMode = false;
var activeTabName = "";
var isToggleClcked = false;

$(window).resize(function () {
    setWidthforChartTableColumns(analysisTableType);
    if ($(".chrt-typ.active").length != 0 && $("#chart-visualisation svg").length != 0) {
        $(".chrt-typ.active").click();
    }
    if ($(".adv-fltr-selection").is(":visible"))
        $(".chart-bottomlayer").css("height", "calc(93% - 190px)");
    else
        $(".chart-bottomlayer").css("height", "calc(93% - 104px)");
    SetTableResolution();
});
angular.module("mainApp").controller("chartController", ['$scope', '$q', '$http', function ($scope, $q) {
    buildMenu();
    buildAdvancedMenu();
    syncFilterPanel();
    navigationSelection();
    //$scope.subfilters = [];
    $scope.chartData = [];
    $scope.reportSelected = {};
    $scope.MetricType = '';
    $scope.commentText = '';
    $scope.activeSlideID = '';
    $scope.activeOption = '';
    $scope.activeChartType = '';
    $scope.IsNameExist = 0;
    $scope.subfilterEstablishment = [];
    $scope.isFocus = false;

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

    function buildAdvancedMenu() {
        var bitData = 0;
        if (controllername == "chartestablishmentcompare")
            bitData = 0;
        else if (controllername == "chartestablishmentdeepdive")
            bitData = 1;
        else if (controllername == "chartbeveragecompare")
            bitData = 2;
        else if (controllername == "chartbeveragedeepdive")
            bitData = 3;
        var menuData = clientDataStorage.get(controllername + "_advance" + bitData);
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Chart/GetAdvancedFilters?id=chartadvancedfilter&bitData=" + bitData, async: false,
                success: function (response) {
                    $scope.advanceFilter = response;
                    $scope.subfilters = $scope.advanceFilter[2].Filters;
                    clientDataStorage.store(controllername + "_advance" + bitData, JSON.stringify(response));
                },
                error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
            $scope.advanceFilter = response;
            $scope.subfilters = $scope.advanceFilter[2].Filters;
        }
    }

    function buildMenu() {
        var menuData = clientDataStorage.get(controllername)
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Chart/GetFilter/" + controllername, async: false, success: function (response) {
                    $scope.filters = response.Data;
                    left_Menu_Data = response.Data;
                    clientDataStorage.store(controllername, JSON.stringify(response.Data));
                    $(".filter-left-panel").html(response);
                }, error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
            $scope.filters = response;
            left_Menu_Data = response;
        }
        //added by Nagaraju for individual filters
        //Date: 07-08-2017          
        $scope.limit = 1;
        if (window.location.search != "" && window.location.search != null) { $scope.limit = 10; }
    }

    //$scope.tree = treeXTable([{ "name": "Back Yard Burgers", "data": [{ "x": "Female", "y": 52.904738936012933, "z": null, "SampleSize": null }, { "x": "Male", "y": 0.47095261063987054, "z": null, "SampleSize": null }], "SampleSize": null }, { "name": "Carl\u0027s Jr.", "data": [{ "x": "Female", "y": 46.959189588323341, "z": null, "SampleSize": null }, { "x": "Male", "y": 0.53040810411676731, "z": null, "SampleSize": null }], "SampleSize": null }]);
    $scope.tree = [];
    $scope.reports = [];
    $scope.reportList = [];

    $scope.reportName = '';

    $scope.reportListChange = function () {

    }

    $scope.prepareReportParameters = function (reportName) {
        var isVisits = 1;
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
            isVisits = 0;
        else
            isVisits = 1;
        var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterPanelInfo = { filter: removeNullDataFromFilterPanelInfo(filterPanelInfoData.filter) };
        var fromTimePeriod, timePeriodType, toTimeperiod;
        timePeriodType = filterPanelInfoData.filter[1].SelectedID;
        var xAxis = "Establishment", yAxis = "Measures";
        if ($(".pit").hasClass("active")) {
            var periodType = "pit";
            fromTimePeriod = filterPanelInfoData.filter[1].Data[0].Text;
        }
        else {
            var periodType = "trend";
            fromTimePeriod = filterPanelInfoData.filter[1].Data[0].Text;
            toTimeperiod = filterPanelInfoData.filter[1].Data[(filterPanelInfoData.filter[1].Data.length - 1)].Text;
            yAxis = "";
        }
        var pthName = window.location.pathname.toLocaleLowerCase();
        if (pthName.includes("beveragecompare") || pthName.includes("beveragedeepdive")) {
            xAxis = "Beverage";
        }
        if (pthName.includes("beveragedeepdive") || pthName.includes("establishmentdeepdive")) {
            yAxis = "Metric Comparisons";
            if (!$(".pit").hasClass("active")) {
                //if multiple measures then change the yAxis to measures
                if ($(".Measures_topdiv_element .sel_text").length > 1) { yAxis = "Measures"; }
            }
        }

        var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
        for (l = 0; l < cmt.length; l++) {
            if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
                //if (pthName.includes("beveragedeepdive") || pthName.includes("establishmentdeepdive")) {
                //    if ($(cmt[l]).attr("data-val") == "Establishment") {
                //        fil = fil.concat(" Establishment : ") + $(".master-lft-ctrl[data-val='Establishment']").find(".lft-popup-ele_active:eq(0) .lft-popup-ele-label").text() + " | ";
                //    }
                //}
            } else {
                var labels = $(cmt[l]).find(".sel_text");
                if (yAxis == "" && $(cmt[l]).attr("data-val") == "Measures") {
                    var prntText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
                    fil = fil.concat(" " + prntText + " : ");
                } else {
                    fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                }
                //var labels = $(cmt[l]).find(".sel_text");
                //fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                /*Update the frequency thing*/
                if ($(cmt[l]).attr("data-val").toUpperCase() == "FREQUENCY") {
                    if (labels.length > 0) {
                        if (isVisits == 1 && $(labels[0]).text().trim().toUpperCase() != "TOTAL VISITS") {
                            fil = fil.concat("Total Visits ( " + $(labels[0]).text() + " )");
                        } else {
                            fil = fil.concat($(labels[0]).text());
                        }
                    } else {
                        fil = fil.concat("Total Visits");
                        //Add frequency params
                        var data_frequency = [];
                        data_frequency.push({ ID: "6", Text: "Total Visits" });
                        filterPanelInfo.filter.push({ Name: "FREQUENCY", Data: data_frequency, SelectedID: "6", MetricType: null });
                    }
                } else {
                    for (var j = 0; j < labels.length; j++) {
                        if (j == 0) {
                            fil = fil.concat($(labels[j]).text());
                        } else {
                            fil = fil.concat(", " + $(labels[j]).text());
                        }
                    }
                }
                /*Update the frequency thing*/
                if (l != cmt.length - 1) {
                    fil = fil.concat(" | ");
                }
            }
        }
        if (fil.slice(-3) == " | ") { fil = fil.slice(0, fil.length - 3); }
        if (reportName == undefined || reportName == null || reportName == "") {
            var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, ReportName: $scope.reportSelected.Name, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: fromTimePeriod, ToTimePeriod: toTimeperiod, Comment: commentsForCharts, infoPanel: fil };
        }
        else {
            if (reportName == "editedReport") {
                var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, SlideID: $scope.activeSlideID, ReportID: $scope.activeReportID, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: fromTimePeriod, ToTimePeriod: toTimeperiod, Comment: $scope.commentText, infoPanel: fil };
            }
            else {
                var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, ReportName: $scope.reportName, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: fromTimePeriod, ToTimePeriod: toTimeperiod, Comment: commentsForCharts, infoPanel: fil };
            }
        }
        var Esttext = controllername == "Establishment";
        switch (controllername) {
            case "chartestablishmentcompare": Esttext = "Establishment"; break;
            case "chartbeveragecompare": Esttext = "Beverage"; break;
            case "chartestablishmentdeepdive":
            case "chartbeveragedeepdive":
                if ($(".Metric_Comparisons_topdiv_element .sel_text").length > 1) {
                    Esttext = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
                } else { Esttext = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text"); }
                break;
        }
        filterdata.Filter[1].DemoAndTopFilters = Esttext;
        filterdata.Filter[0]["isTrendTable"] = $(".pit").hasClass("active") == true ? "false" : "true";
        filterdata.Filter[0]["trendGap"] = $(".pit").hasClass("active") == true ? 0 : ($("#slider-range").slider("values")[1] - $("#slider-range").slider("values")[0])
        filterdata.Filter[0].DemoAndTopFilters = fil;
        filterdata.Filter[0].customBase = $('.stat-cust-estabmt.stat-cust-active').text().trim();
        filterdata.Filter[0].active_chart_type = active_chart_type;
        filterdata.Filter[0].statOption = $(".table-stat.activestat").text().trim().toLocaleLowerCase();//($(".table-stat.activestat").text().trim().toLocaleLowerCase() == "custom base") ? $('.stat-cust-estabmt.stat-cust-active').text() : $(".table-stat.activestat").text().trim();
        filterdata.Filter.push({ Name: "StatTest", Data: null, SelectedText: filterdata.Filter[0].statOption });
        filterdata.Filter[0]["IsVisit"] = isVisits;
        return filterdata;
    }
    $scope.showSaveAsPopup = function () {
        $(".save-reportPopup").hide();
        $(".saveAsPopup").show();
    }

    $scope.hideSaveAsPopup = function () {
        $(".saveAsPopup,.transparentBG").hide();
    }
    $scope.prepareContentArea = function (isSubmitOrApplyFilter) {        
        //reset_img_pos();
        legend_filter_list = [];
        $(".chart-measure-text").hide();
        //$(".table-statlayer").hide();
        $(".chart-toplayer").hide();
        $("#legend_div").remove();
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").hide();
        //$(".master-view-content").css("background-image", "none");
        var filterPanelInfo = {};
        if (isSubmitOrApplyFilter == "custombase" || $("#table-custombse").hasClass("activestat")) {
                isCustomBaseSelect = true;
                customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
                customCurrentSelections = customBaseSelctdText;
        }
        else {
            isCustomBaseSelect = false; customBaseSelctdText = "";
            $('.stat-cust-estabmt').removeClass("stat-cust-active");
        }
        leftpanelchanged = firstTimeOut == 0 ? false : leftpanelchanged;
        if (leftpanelchanged) {
            var curID = "table-ttldine";
            if (controllername == "chartbeveragedeepdive" || controllername == "chartbeveragecompare") {
                curID = "table-prevsperiod";
            }
            $('.stat-cust-estabmt').removeClass('stat-cust-active');
            $('.tbl-dta-rows').removeClass('customBaseColor');
            //to make default Previous period Stat test
            $(".table-stat").removeClass("activestat");
            $("#"+curID).addClass("activestat");
            previsSelectedStatTest = curID;
            $('.stat-cust-estabmt.stat-cust-active').removeClass("stat-cust-active");
            //            
        }
        leftpanelchanged = false;
        if (prepareFilter() == false) {
            //Reset previsSelectedStatTest
            $(".table-stat").removeClass("activestat");
            $("#" + previsSelectedStatTest).addClass("activestat");
            return false;
        }
        reset_img_pos();
        $(".advance-filters").show();
        //to store active chart type if any
        if (active_chart_type == "") {
            if ($(".chrt-typ.active").length != 0 && active_chart_flag == 1) {
                active_chart_type = $(".chrt-typ.active").attr("chart-type");
            }
        }

        //if ($($(".master-lft-ctrl[data-val=FREQUENCY]").find(".lft-ctrl3")[0]).find(".lft-popup-ele_active").length == 0) {
        //    alert("Frequency is required"); reset_img_pos();
        //    return false;
        //}
        if ($(".loader").is(":visible") == false) {
            $(".loader,.transparentBG").show();
        }
        $(".loader").show();
        $(".transparentBG").show();
        $("#chart-visualisation").html('');
        filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        ////Update the latest 1st level selection
        $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col").attr("first-level-selection", getFirstLevelSelection("Measures"));
        var selectedMeasureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        var firstEleText = getCurrentMeasureText();
        //Change filterPanelInfo.filter for Measures, The MetricType

        var timePeriodType = $(".pit").hasClass("active") == true ? "pit" : "trend";
        var filterdata = { filter: filterPanelInfo.filter, module: controllername, measureType: selectedMeasureType, timePeriodType: timePeriodType, customBaseText: customBaseSelctdText };
        $(".advance-filters").css("display", "block");
        $(".measure-text").text('');
        $.ajax({
            url: appRouteUrl + "Chart/GetChart",
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loader").hide();
                $(".transparentBG").hide();
                $("#legend_div").empty();
                data = response.Series;
                if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
                    $scope.showMoreLess();
                }
                if ($(".adv-fltr-selection").is(":visible"))
                    $(".chart-bottomlayer").css("height", "calc(93% - 190px)");
                else
                    $(".chart-bottomlayer").css("height", "calc(93% - 104px)");
                if (response.Series == null || response.Series.length == 0) {
                    $("#chart-visualisation").html('<div style="margin-top:' + 10 + "px" + '">No data available for the selection you made.</div>'); $("#chart-visualisation").show();
                    $(".chrt-typ.active").removeClass("active");
                }
                else {
                    checkNavigation();
                    $(".table-statlayer").css("display", "block");
                    $(".chart-toplayer").show();
                    $(".chart-measure-text").show();
                    $("#flexi-table").hide();
                    $("#guestFrqncy").hide();
                    $("#scrollableTable").hide();
                    $("#chart-visualisation").show();
                    $(".master-view-content").css("background-image", "none");
                    if (firstTimeOut == 0 && $(".comment-section").is(":visible") == true) {
                        $(".comment-input .comment-text").focus();
                    }
                    if (firstTimeOut != 0 && $(".comment-section").is(":visible") == true) {
                        //hide comment-section and show comment button
                        $(".comment-section").hide(); $(".comment-btn").show();
                    } firstTimeOut = 1;
                    addMeaureText();
                    $scope.chartData = data;
                    //Added by Bramhanath for Chart Type depending on measures selections  Modifications(01-08-2017)
                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                    $(".col-chart").hide();
                    $(".column-chart").hide();
                    $(".bar-chart").hide();
                    $(".barwithchange-chart").hide();
                    $(".pyramid-chart").hide();
                    $(".pyramidwithchange-chart").hide();
                    $(".trend-chart").hide();
                    $(".stackedbar-chart").hide();
                    $(".stackedcolumn-chart").hide();
                    $(".y").hide();

                    /*to get charttype from backend and show icons*/
                    var chartTypeList = "";
                    var defaultcharttype = "";
                    $.each(data, function (i, v) {
                        if (i == 0) {
                            chartTypeList = v.data[i].ChartType;
                            var chartTypeSplit = chartTypeList.split("|");
                            for (j = 0; j < chartTypeSplit.length; j++) {
                                if (j == 0) {
                                    defaultcharttype = chartTypeSplit[j].replace(/\s/g, '').toLowerCase();
                                    if (active_chart_type == "") { active_chart_type = defaultcharttype; } else {
                                        var flg = 0;
                                        chartTypeSplit.forEach(function (d) {
                                            if (d.replace(/\s/g, '').toLowerCase() == active_chart_type || (d.replace(/\s/g, '').toLowerCase() == "barwithchange" && active_chart_type == "barchange")) {
                                                flg = 1; return false;
                                            }
                                        });
                                        if (flg != 1) {
                                            //if (defaultcharttype == "barchange" || defaultcharttype == "pyramid" || defaultcharttype == "pyramidwithchange") {
                                            //    active_chart_type = chartTypeSplit[2];
                                            //} else {
                                            active_chart_type = defaultcharttype;
                                            //}                                            
                                        }
                                    }
                                }
                                $('.' + chartTypeSplit[j].replace(/\s/g, '').toLowerCase() + '-chart').show();
                            }
                            $(".col-chart").hide();
                            return;
                        }
                    });
                    /*to get charttype from backend*/

                    //

                    if ($(".pit").hasClass("active")) {
                        $(".trend-chart").hide();
                        $(".y").hide();
                        $(".col-chart").show();
                        $(".bar-chart").show();
                    }
                    else {
                        $(".trend-chart").show();
                        $(".col-chart").hide();
                        $(".bar-chart").hide();
                        if (active_chart_type == "line") { active_chart_type = "trend"; }
                    }
                    currentMeasures = [];
                    $(".Measures_topdiv_element .sel_text").each(function (i, d) {
                        currentMeasures.push($(d).text());
                    });
                    isFirstTymOutput = 1;

                    var chartType = getChartType($scope.activeChartType);

                    if (active_chart_type == "column") {
                        $scope.column($scope.chartData);
                        $(".chart-types").css("width", "138px");
                    }
                    else if (active_chart_type == "stackedbar") {
                        $scope.StackedBar($scope.chartData);
                        $(".chart-types").css("width", "159px");
                    }
                    //if (chartType == "col" || chartType == "bar") {
                    //    //$scope.changingChartBasedOnMeasures($scope.chartData, chartType);

                    //}
                    if (chartType == "trend") {
                        $scope.plotTrendChart($scope.chartData);
                    }
                    else if (chartType == "table") {
                        $(".col-chart").click();
                        $scope.plotTableChart($scope.chartData);
                    }
                    //Make chart type active
                    if (active_chart_type != "") {
                        if ($(".chrt-typ[chart-type='" + active_chart_type + "']").length != 0) {
                            $(".chrt-typ[chart-type='" + active_chart_type + "']").click();
                        }
                    }
                    //    checkNavigation();
                }
            },
            error: ajaxError
        });
    }

    $scope.removeBlankSpace = function (object) {
        object = object.trim();
        var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '');
        return text.toLowerCase();
    }

    $scope.closeSavePopup = function (event) {
        $(".save-reportPopup,.transparentBG").hide();
    }

    $scope.createReport = function () {
        if ($scope.reportName == "") {
            alert("Please name the report");
        }
        else {
            if ($scope.reportList.length > 0) {
                $scope.IsNameExist = 0;
                for (i = 0; i < $scope.reportList.length; i++) {
                    var rpt = $scope.reportList[i];
                    if (rpt.Name.toLowerCase() == $scope.reportName.toLowerCase()) {
                        $scope.IsNameExist = 1;
                        alert("Report with the same name already exist");
                    }
                }
                if ($scope.IsNameExist == 0) {
                    var xAxis = "Establishment", yAxis = "Measures";
                    var pthName = window.location.pathname.toLocaleLowerCase();
                    if (pthName.includes("beveragecompare")) {
                        xAxis = "Beverage";
                    }
                    if (pthName.includes("beveragecompare") || pthName.includes("establishmentdeepdive")) {
                        xAxis = "Metric Comparisons";
                    }
                    var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
                    for (l = 0; l < cmt.length; l++) {
                        if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
                        } else {
                            var labels = $(cmt[l]).find(".sel_text");
                            fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                            for (var j = 0; j < labels.length; j++) {
                                if (j == 0) {
                                    fil = fil.concat($(labels[j]).text());
                                } else {
                                    fil = fil.concat(", " + $(labels[j]).text());
                                }
                            }
                            if (l != cmt.length - 1) {
                                fil = fil.concat(" | ");
                            }
                        }
                    }
                    if (fil.slice(-3) == " | ") { fil = fil.slice(0, fil.length - 3); }
                    var data = { filter: $scope.prepareReportParameters("reportName") };
                    //data.filter.Filter[0].DemoAndTopFilters = fil;
                    capture("CreateReport", data);
                }
            }
            else {
                //var data = { filter: $scope.prepareReportParameters("reportName") };
                var xAxis = "Establishment", yAxis = "Measures";
                var pthName = window.location.pathname.toLocaleLowerCase();
                if (pthName.includes("beveragecompare")) {
                    xAxis = "Beverage";
                }
                if (pthName.includes("beveragecompare") || pthName.includes("establishmentdeepdive")) {
                    xAxis = "Metric Comparisons";
                }
                var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
                for (l = 0; l < cmt.length; l++) {
                    if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
                    } else {
                        var labels = $(cmt[l]).find(".sel_text");
                        fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                        for (var j = 0; j < labels.length; j++) {
                            if (j == 0) {
                                fil = fil.concat($(labels[j]).text());
                            } else {
                                fil = fil.concat(", " + $(labels[j]).text());
                            }
                        }
                        if (l != cmt.length - 1) {
                            fil = fil.concat(" | ");
                        }
                    }
                }
                if (fil.slice(-3) == " | ") { fil = fil.slice(0, fil.length - 3); }
                var data = { filter: $scope.prepareReportParameters("reportName") };
                //data.filter.Filter[0].DemoAndTopFilters = fil;
                capture("CreateReport", data);
            }
        }
        $(".report-text").val('');
    }

    $scope.showSaveReportPopup = function () {
        $(".loader,.transparentBG").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetReports",
            method: "GET",
            contentType: "application/json",
            success: function (response) {
                $scope.reportList = response;
                $scope.reportSelected = $scope.reportList[0];
                $scope.$digest();
                $(".save-reportPopup").show();
                $(".loader").hide();
            }
        });
    }
    $scope.addSlideToReport = function (Id) {
        if (Id == undefined) {
            alert("Please select/create report");
            return false;
        }
        //var filter = $scope.prepareReportParameters();
        var xAxis = "Establishment", yAxis = "Measures";
        var pthName = window.location.pathname.toLocaleLowerCase();
        if (pthName.includes("beveragecompare")) {
            xAxis = "Beverage";
        }
        if (pthName.includes("beveragecompare") || pthName.includes("establishmentdeepdive")) {
            xAxis = "Metric Comparisons";
        }
        var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
        for (l = 0; l < cmt.length; l++) {
            if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
            } else {
                var labels = $(cmt[l]).find(".sel_text");
                fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                for (var j = 0; j < labels.length; j++) {
                    if (j == 0) {
                        fil = fil.concat($(labels[j]).text());
                    } else {
                        fil = fil.concat(", " + $(labels[j]).text());
                    }
                }
                if (l != cmt.length - 1) {
                    fil = fil.concat(" | ");
                }
            }
        }
        if (fil.slice(-3) == " | ") { fil = fil.slice(0, fil.length - 3); }
        var data = { filter: $scope.prepareReportParameters("reportName"), Id: Id };
        //data.filter.Filter[0].DemoAndTopFilters = fil;
        //var data = { Id: Id, filter: filter };
        capture("AddSlideToReport", data);
    }

    $scope.showHideFilterPanel = function () {
        showHideFilterPanel();
    }
    //
    $scope.toggleclick = function () {
        clearAdvanceFilters();//To clear Advance Filters
        //To show frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
        $(".adv-fltr-sub-frequency").show();
        $("#addtnal-firstseptor").show();
        $("#addtnal-secndseptor").show();
        if ($(".advance-filters").is(":visible") == true) {
            $(".loader,.transparentBG").show();
        }
        //End
        if ($('#guest-visit-toggle').hasClass('activeToggle')) {
            $('#guest-visit-toggle').removeClass('activeToggle');
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.subfilters = $scope.advanceFilter[1].Filters;
                    $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                });
            },5);
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
            isVisitsSelected_Charts = 1;
            $(".centerAlign").css("left", "44%");

        } else {
            $('#guest-visit-toggle').addClass('activeToggle');
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.subfilters = $scope.advanceFilter[2].Filters;
                    $scope.subfilterEstablishment = $scope.advanceFilter[2].Filters;
                });
            },5);
            $(".adv-fltr-guest").css("color", "#f00");
            $(".adv-fltr-visit").css("color", "#000");
            isVisitsSelected_Charts = 0;
            $(".centerAlign").css("left", "41%");
        }


        isToggleClcked = true;
        if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
            defaultFreqncyForBeverageSelctn();
            if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
                $('.adv-fltr-sub-establmt').hide();
            else {
                $('.adv-fltr-sub-establmt').show();
                //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                $(".adv-fltr-sub-frequency").hide();
                $("#addtnal-firstseptor").hide();
                $("#addtnal-secndseptor").hide();
                //End

            }

        }
        else {
            defaultFreqncySelctn();
            $('.adv-fltr-sub-establmt').hide();
        }
    };

    $scope.greaterThan = function (prop, val) {
        return function (item) {
            return item[prop] > val;
        }
    }

    $scope.showSubOptions = function (optionText, event) {
       
        $(".adv-fltr-label").removeClass("adv-fltr-label-DemoGraphicProfiling Visits-box Guests-box DemoGraphicProfiling-box Visits-right-skew Guests-right-skew DemoGraphicProfiling-right-skew adv-fltr-label-Guests");
        var ele = event.currentTarget;
        var pele = event.currentTarget.parentElement.parentElement;
        var data_val = $(pele).attr("data-val");
        $(ele).addClass(data_val + "-box");
        $(ele).addClass(data_val + "-right-skew");
        $(".adv-fltr-label").css("color", "#646464");
        $(ele).css("color", "#fff");
        //path of  the page
        var pathname = window.location.pathname;
        var fileNameIndex = pathname.lastIndexOf("/") + 1;
        var filename = pathname.substr(fileNameIndex);
        //
        isToggleClcked = false;
        selectedFirstLevelinMetricCompsns = $($(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active")[0]).attr("parent-of-parent");

        //To show frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
        $(".adv-fltr-sub-frequency").show();
        $("#addtnal-firstseptor").show();
        $("#addtnal-secndseptor").show();
        //End
        $(".centerAlign").css("left", "38%");
        switch (optionText) {
            case "DemoGraphicProfiling":
                if (selectedFirstLevelinMetricCompsns == "Demographics" && optionText == "DemoGraphicProfiling") {
                    $(".adv-fltr-toggle-container").show();
                }
                else {
                    $(".adv-fltr-toggle-container").hide();
                }
                $(".centerAlign").css("left", "38%");
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[0].Filters;
                        $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                    });
                }, 5);
                isVisitsSelected_Charts = 0;
                if ($("#guest-visit-toggle").hasClass("activeToggle")) {
                    $("#guest-visit-toggle").prop("checked", false);
                }
                else {
                    if ($('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)") {
                        if ($("#guest-visit-toggle").hasClass("activeToggle")) {
                            $("#guest-visit-toggle").prop("checked", true);
                        }
                        else {
                            $("#guest-visit-toggle").addClass("activeToggle");
                            $("#guest-visit-toggle").prop("checked", false);
                        }
                    }
                    else {
                        $("#guest-visit-toggle").addClass("activeToggle");
                        $("#guest-visit-toggle").prop("checked", true);
                    }
                }
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                    $(".adv-fltr-sub-frequency").hide();
                    $("#addtnal-firstseptor").hide();
                    $("#addtnal-secndseptor").hide();
                    //End
                }
                break;
            case "Visits":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "43%");
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[1].Filters;
                        $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                    });
                }, 5);
                isVisitsSelected_Charts = 1;
                $('#guest-visit-toggle').removeClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    defaultFreqncyForBeverageSelctn();
                    //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                    $(".adv-fltr-sub-frequency").hide();
                    $("#addtnal-firstseptor").hide();
                    $("#addtnal-secndseptor").hide();
                    //End
                }
                else {
                    defaultFreqncySelctn();
                }
                break;
            case "Guests":
            case "Beverage Guest":
            case "EstablishmentFrequency":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "47%");
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[2].Filters;
                        $scope.subfilterEstablishment = [];
                    });
                }, 5);
                isVisitsSelected_Charts = 0;
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    defaultFreqncyForBeverageSelctn();
                }
                else {
                    defaultFreqncySelctn();
                }
                $("#guest-visit-toggle").prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                break;
        }
    }

    $scope.plotTrendChart = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        reset_img_pos_chart('table');
        $(".trend-chart").css("background-position", "-291px -408px");
        $(".chrt-typ").removeClass("active");
        $(".trend-chart").addClass("active");
        $scope.activeChartType = 'trend';
        currentOutputChartType = 'trend';
        active_chart_type = "trend";
        $(".chart-measure-text").show();
        data = $scope.chartData;
        $(".chart-bottomlayer").css("position", 'relative');
        plottrendChart(data);
        //SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);      
    }

    $scope.showMoreLess = function () {
        if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
            //Rebind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").addClass("classMouseHover");
            $(".adv-fltr-showhide-txt").text("SHOW MORE");
            $(".adv-fltr-showhide-img").css("background-position", "-193px -211px");
            $(".adv-fltr-selection").hide();
            $(".adv-fltr-showhide-sectn").css("margin-top", "7px");
            $(".advance-filters").css("height", "30px");
            $(".adv-fltr-details").css("height", "30px");
            $(".adv-fltr-headers").css("height", "30px");
            $(".chart-bottomlayer").css("height", "calc(93% - 104px)");
            $(".adv-fltr-showhide").css({ "margin-top": "-31px" });
            $(".adv-fltr-applyfiltr").css("visibility", "hidden");
            $(".adv-fltr-showhide").css({ "top": "-5%" });
            $(".chart-toplayer").css("z-index", "7");
        }
        else {
            //Unbind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").removeClass("classMouseHover"); $("#MouseHoverSmallDiv").hide();
            $(".adv-fltr-showhide-txt").text("SHOW LESS");
            $(".adv-fltr-showhide-img").css("background-position", "-233px -211px");
            $(".adv-fltr-showhide-sectn").css("height", "23px");
            $(".adv-fltr-showhide-sectn").css("margin-top", "-89px");
            $(".advance-filters").css("height", "100px");
            $(".adv-fltr-details").css("height", "100px");
            $(".adv-fltr-headers").css("height", "30px");
            $(".adv-fltr-applyfiltr").css("visibility", "hidden");
            $(".chart-bottomlayer").css("height", "calc(93% - 190px)");
            $(".adv-fltr-selection").show();
            $(".adv-fltr-applyfiltr").css("visibility", "visible");
            $(".adv-fltr-showhide").css({ "margin-top": "1px" });
            $(".adv-fltr-showhide").css({ "top": "-5%" });
            $(".chart-toplayer").css("z-index", "4");
        }

        var active_ele = $(".chrt-typ.active").attr("chart-type");
        switch (active_ele) {
            case "column": $scope.column($scope.chartData); break;
            case "pyramidwithchange": $scope.pyramidwithchange($scope.chartData); break;
            case "pyramid": $scope.pyramid($scope.chartData); break;
            case "barchange": $scope.barwithchange($scope.chartData); break;
            case "bar": $scope.barChart($scope.chartData); break;
            case "stackedcolumn": $scope.StackedColumn($scope.chartData); break;
            case "stackedbar": $scope.StackedBar($scope.chartData); break;
            case "trend": $scope.plotTrendChart($scope.chartData); break;
            case "table": $scope.plotTableChart($scope.chartData); break;
        }
        //active_ele = active_ele == undefined ? "" : active_ele;
        //if (active_ele.includes("col-chart")) {
        //    $scope.changingChartBasedOnMeasures($scope.chartData, 'col');
        //}
        //if (active_ele.includes("bar-chart")) {
        //    $scope.changingChartBasedOnMeasures($scope.chartData, 'bar');
        //}
        //if (active_ele.includes("table-chart")) {
        //    $scope.plotTableChart($scope.chartData);
        //}
        //if (active_ele.includes("trend-chart")) {
        //    $scope.changingChartBasedOnMeasures($scope.chartData, 'trend');
        //}
        //replotChart($scope.chartData); //trend-chart

        //hide aditional filter images by chandu
        $(".adv-fltr-selection").find(".master-lft-ctrl[data-val!='Establishment']").find('.lft-popup-ele-label-img').hide();
    }

    $scope.plotTableChart = function (data) {
        $scope.activeChartType = 'table';
        active_chart_type = "table";
        //$("#flexi-table").show();
        $(".chrt-typ").removeClass("active");
        $(".table-chart").addClass("active");
        currentOutputChartType = 'table';
        reset_img_pos_chart('table');
        $(".table-chart").css("background-position", "-192px -408px");
        $("#chart-visualisation").hide();
        $("#scrollableTable").show();
        $(".chart-bottomlayer").css("position", 'relative');
        //$(".measure-text").text('');
        $("#guestFrqncy").show();
        var Esttext = controllername == "Establishment";
        var IstrendTableNewStructure = false;
        switch (controllername) {
            case "chartestablishmentcompare": IstrendTableNewStructure = $(".Establishment_topdiv_element .sel_text").length > 1 ? true : false; Esttext = "Establishment"; break;
            case "chartbeveragecompare": IstrendTableNewStructure = ($(".Beverage_topdiv_element .sel_text").length > 1); Esttext = "Beverage"; break;
            case "chartestablishmentdeepdive":
            case "chartbeveragedeepdive":
                if ($(".Metric_Comparisons_topdiv_element .sel_text").length > 1) {
                    Esttext = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
                } else { Esttext = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text"); }
                IstrendTableNewStructure = ($(".Metric_Comparisons_topdiv_element .sel_text").length > 1 || $(".Measures_topdiv_element .sel_text").length > 1);
                break;
        }
        if ($(".trend").hasClass("active") && IstrendTableNewStructure)
            $scope.tree = treeXTableForCompareTrend(data, Esttext);
        else
            $scope.tree = treeXTable(data);
        IstrendTableNewStructure = $(".trend").hasClass("active") && IstrendTableNewStructure;
        var tree = $scope.tree;
        $(".chart-bottomlayer").html('');

        var chartFrequncydiv = "";
        //'<div id="guestFrqncy" class="tbl-dta-rows">';
        //chartFrequncydiv += '<div class="tbl-dta-freq">';
        //chartFrequncydiv += '<div class="tbl-data-freqbdr"></div>';
        var measureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        //if (measureType != undefined) {
        //    if (measureType.toLocaleLowerCase() == "guest measures") { chartFrequncydiv += '<div class="tbl-data-freqtxt">' + "GUESTS" + ' FREQUENCY</div>'; }
        //    else { chartFrequncydiv += '<div class="tbl-data-freqtxt">' + "VISITS" + ' FREQUENCY</div>'; }
        //}
        //else {
        //    if ($(".FREQUENCY_topdiv_element .sel_text").text() != undefined && $(".FREQUENCY_topdiv_element .sel_text").text().trim().toLocaleLowerCase() == "total visits") { chartFrequncydiv += '<div class="tbl-data-freqtxt">' + "VISITS" + ' FREQUENCY</div>'; }
        //    else { chartFrequncydiv += '<div class="tbl-data-freqtxt">' + "GUESTS" + ' FREQUENCY</div>'; }
        //}

        //chartFrequncydiv += '</div>';
        //chartFrequncydiv += '</div>';
        chartFrequncydiv += '<div class="tbl-emptyrow"></div>';

        var tBody = "";
        var thead = chartFrequncydiv + '<div id="chart-visualisation" style="display:none;"></div><table id="flexi-table" class="data" cellpadding="0" cellspacing="0"><thead>';
        var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
        var metrcEmptyHding = '';
        for (i = 0; i < 1; i++) {
            thead += '<tr class="tbl-dta-rows">';
            for (j = 0; j < tree[i].length; j++) {
                thead += '<th class="tbl-dta-metricsHding">';
                if (j == 0) {
                    thead += metrcHding;
                    thead += '<div class="tbl-algn tbl-text-upper tbl-algn-left"><div class="text_middle">' + tree[i][j].x + '</div></div>' + '</th>';
                }
                else
                    thead += '<div class="tbl-algn tbl-text-upper"><div class="text_middle">' + tree[i][j].x + '</div></div>' + '</th>';

                if ((j + 1) != tree[i].length) { thead += ' <th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>'; }
            }
            thead += '</tr>';
        }

        thead += '</thead>';
        tBody += thead;

        tBody += '<tbody>';
        for (i = 1; i < tree.length; i++) {
            if (i == 1) {
                tBody += '<tr class="tbl-dta-rows">';
            }
            else if (i == 2) {
                tBody += '<tr class="tbl-dta-rows expanse_collapse">';
            }
            else {
                tBody += '<tr class="tbl-dta-rows dataShow">';
            }

            for (j = 0; j < tree[i].length; j++) {
                if (i == 2 && j == 0) {
                    tBody += '<td class="' + tree[i][j].css + ' ' + tree[i][j].dataCss + ' ' + tree[i][j].useDirectionallyFortdCSS + ' ' + (i == 1 ? "" : removeBlankSpace(tree[0][j].x)) + '">' +
                               '<div class="tbl-data-expan-collapse"><div class="tbl-data-expan-collapse_show"></div></div><div class="tbl-algn"><div class="text_middle">' + tree[i][j].x + '</div></div>';


                }
                else if (j == 0) {
                    if (IstrendTableNewStructure != true && tree[i][j].x == "Sample Size")
                        tBody += '<td class="' + tree[i][j].css + ' ' + tree[i][j].dataCss + ' ' + tree[i][j].useDirectionallyFortdCSS + ' ' + (i == 1 ? "" : removeBlankSpace(tree[0][j].x)) + '">' +
                               '<div class="tbl-algn "><div class="text_middle">' + tree[i][j].x + '</div></div>';
                    else
                        tBody += '<td class="' + tree[i][j].css + ' ' + tree[i][j].dataCss + ' ' + tree[i][j].useDirectionallyFortdCSS + ' ' + (i == 1 ? "" : removeBlankSpace(tree[0][j].x)) + '">' +
                           '<div class="tbl-algn tbl-algn-left"><div class="text_middle">' + tree[i][j].x + '</div></div>';
                }
                else {
                    tBody += '<td class="' + tree[i][j].css + ' ' + tree[i][j].dataCss + ' ' + tree[i][j].useDirectionallyFortdCSS + ' ' + (i == 1 ? "" : removeBlankSpace(tree[0][j].x)) + '">' +
                     '<div class="tbl-algn "><div class="text_middle">' + tree[i][j].x + '</div></div>';
                }

                if (i == 1 || i == 2) {
                    if (j == 0) {
                        if (i == 1)
                            tBody += '<div class="tbl-data-brderbtm1"></div>';
                        else
                            tBody += '<div class="tbl-data-brderbtm"></div>';
                    }
                }
                else {
                    tBody += '<div class="tbl-data-btmbrd ' + tree[i][j].dataCss + '  ' + tree[i][j].useDirectionallyCss + '"></div>' +
                     '<div class="tbl-btm-circle ' + tree[i][j].useDirectionallyForCirleCSS + '"></div>';
                }
                tBody += '</td>';
                if ((j + 1) != tree[i].length) {
                    tBody += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';

                }
            }
            tBody += '</tr>';
        }
        tBody += '</tbody></table><div id="scrollableTable"></div>';
        $('.chart-bottomlayer').html(tBody);
        var options = {
            width: $(".chart-bottomlayer").width(),
            height: $(".chart-bottomlayer").height() - 50,
            pinnedRows: 1,
            pinnedCols: 2,
            container: "#scrollableTable",
            removeOriginal: true
        };

        $("#flexi-table").tablescroller(options);
        analysisTableType = "chart";
        setWidthforChartTableColumns(analysisTableType);//set Dynamic width based on selections
        setMaxHeightForHedrTble();
        $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 10);
        $('.scrollable-data-frame').width($('.scrollable-data-frame').width() - 5);
        $('.scrollable-rows-frame').height($('.scrollable-data-frame').height());
        SetTableResolution();
        SetScroll($("#scrollableTable").find(".scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);      
        //custom base applying color
        if (!isCustomBaseSelect) {
            $('.tbl-dta-rows').removeClass('customBaseColor');
        }
        else {
            $('.tbl-dta-rows').removeClass('customBaseColor');
            var actcusname = $('.stat-cust-estabmt.stat-cust-active').text();
            var cusindx = 0;
            if (actcusname != "" && actcusname != null) {
                $(".scrollable-columns-table tr th").each(function (i) {
                    if ($(this).text() == actcusname) {
                        cusindx = i;
                        return false;
                    }
                });
                if (IstrendTableNewStructure) {
                    //$('.tbl-dta-rows:even').find('.' + removeBlankSpace($('.stat-cust-estabmt.stat-cust-active').text())).addClass('customBaseColor');
                    $(".scrollable-data-frame table tr td:odd:nth-child(" + (cusindx + 1) + ")").addClass("customBaseColor");
                } else {
                    //$('.tbl-dta-rows').find('.' + removeBlankSpace($('.stat-cust-estabmt.stat-cust-active').text())).addClass('customBaseColor');
                    $(".scrollable-data-frame table tr td:nth-child(" + (cusindx + 1) + ")").addClass("customBaseColor");

                }
            }
        }
        //To remove custom base from low sample size
        $(".transparent.customBaseColor").removeClass("customBaseColor");
        $(".chart-measure-text").css("display", "none");

        $(".expanse_collapse").unbind().click(function () {

            if ($(".expanse_collapse").siblings().hasClass('dataShow')) {
                $(".dataShow").removeClass('dataShow').addClass('dataHide');
                $(".tbl-data-expan-collapse_show").css('background-position', '-1510px -217px');
            }
            else if ($(".expanse_collapse").siblings().hasClass('dataHide')) {
                $(".dataHide").removeClass('dataHide').addClass('dataShow');
                $(".tbl-data-expan-collapse_show").css('background-position', '-1554px -217px');
            }

        });
    }

    $scope.greaterThan = function (index, value) {
        return function (item) {
            return index > value;
        }
    }

    $scope.changingChartBasedOnMeasures = function (data, chart) {
        $(".chart-measure-text").css("display", "block");
        active_chart_type = chart;
        reset_img_pos_chart(currentOutputChartType);
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $("#chart-visualisation").html('');
        $(".master-view-content").css("background-image", "none");

        if ($(".adv-fltr-selection").is(":visible"))
            $(".chart-bottomlayer").css("height", "calc(93% - 190px)");
        else
            $(".chart-bottomlayer").css("height", "calc(93% - 104px)");
        addMeaureText();
        var measureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        if (measureType == undefined || measureType == null || measureType == "") {
            //measureType = $scope.MetricType;
            measureType = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").attr("first-level-selection");
        }

        var selectedMeasure = "";
        var parentText = "";
        if (isFirstTymOutput == 0) {
            //if ($(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").attr("first-level-selection") == "Guest Measures") {//change
            var measureSelected = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").attr("first-level-selection");
            if (guestList.indexOf(measureSelected) > -1) {
                selectedMeasure = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").first().attr("parent-text");
                parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + selectedMeasure + "']").first().attr("parent-text");
            } else {
                selectedMeasure = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").last().attr("parent-text");
                parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + selectedMeasure + "']").last().attr("parent-text");
            }
        } else {
            isFirstTymOutput = 0;
            selectedMeasure = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
            parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + selectedMeasure + "']").attr("parent-text");
        }

        if ($(".pit").hasClass("active"))
            var periodType = "pit";
        else
            var periodType = "trend";


        //switch(measureType) {
        //case "Guest Measures":
        switch (periodType) {
            case "pit":
                switch (parentText) {
                    case "Demographics":
                    case "Brand Health Metrics":
                    case "Top 2 Box Attitudinal Statements":
                    case "Beverage Guest":
                    default:
                        $scope.activeChartType = AssigningChartBasedOnNumberOfGuestMeasuresSelected(data, chart, selectedMeasure, parentText);
                        break;
                }
                break;
            case "trend":
                switch (parentText) {
                    case "Demographics":
                    case "Brand Health Metrics":
                    case "Top 2 Box Attitudinal Statements":
                    case "Beverage Guest":
                    default:
                        $(".trend-chart").css("background-position", "-291px -408px");
                        $(".chrt-typ").removeClass("active");
                        $(".trend-chart").addClass("active");
                        plottrendChart(data);
                        $scope.activeChartType = 'trend';
                        currentOutputChartType = "trend";
                        break;
                }
                break;
        }
        //break;
        //case "Visit Measures":
        //    switch (periodType) {
        //        case "pit":
        //            switch (parentText) {
        //                case "Demographics":
        //                case "Pre-Visit":
        //                case "In-Establishment":
        //                case "In-Establishment Beverage Consumption":
        //                case "Post-Visit":
        //                case "DigitalBehaviour":
        //                default:
        //                    $scope.activeChartType =  AssigningChartBasedOnNumberOfVisitMeasuresSelected(data, chart, selectedMeasure, parentText);
        //                    break;
        //        }
        //            break;
        //        case "trend":
        //            switch (parentText) {
        //                case "Demographics":
        //                case "Pre-Visit":
        //                case "In-Establishment":
        //                case "In-Establishment Beverage Consumption":
        //                case "Post-Visit":
        //                case "DigitalBehaviour":
        //                default:
        //                    $(".trend-chart").css("background-position", "-291px -408px");
        //                    $(".chrt-typ").removeClass("active");
        //                    $(".trend-chart").addClass("active");
        //                    plottrendChart(data);
        //                    $scope.activeChartType = 'trend';
        //                    break;
        //        }
        //            break;
        //}
        //    break;

        //}
    }

    $scope.custombaseSubmit = function () {
        $(".transparentBG").hide();
        $(".stat-popup").hide();
        //
        if ($(".stat-cust-active").length == 0) {
            $("#table-custombse").removeClass('activestat');
            $("#" + previsSelectedStatTest).addClass('activestat');
            isCustomBaseSelect = false;
        } else {
            leftpanelchanged = false;
            $scope.prepareContentArea("custombase");
            isCustomBaseSelect = true;
        }
    }

    $scope.custombaseCancel = function () {
        $(".transparentBG").hide();
        $(".stat-popup").hide();
        $("#table-custombse").removeClass('activestat');
        $("#" + previsSelectedStatTest).addClass('activestat');
    }

    $scope.showCommentBox = function () {
        $(".comment-section").show();
        $(".comment-btn").css({ "display": "none" });
        $(".comment-text").focus();
    }
    $scope.commentCancelFunction = function () {
        $(".comment-section").hide();
        $(".comment-btn").css({ "display": "block" });
    }

    $scope.saveComment = function () {
        if ($scope.commentText == "") {
            alert("Please add Comment to the slide");
        }
        else {
            $(".loader").show();
            commentsForCharts = $(".comment-input .comment-text").val();
            if ($scope.activeOption == "viewslideID") {
                var data = { ReportID: $scope.activeReportID };
                $.ajax({
                    url: appRouteUrl + "StoryBoard/Story/LockReport",
                    data: JSON.stringify(data),
                    method: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        $(".loader").hide();
                        if (response == "Successful")
                            $scope.saveEditedSlide();
                        else
                            alert(response);
                    },
                    error: ajaxError
                });
            }
            else {
                $scope.saveEditedSlide();
            }
        }
    }

    $scope.navigateToStoryBoard = function () {
        data = { ReportID: $scope.activeReportID };
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/ReleaseLock",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                if ($scope.activeOption == "viewslideID") {
                    window.location.href = appRouteUrl + "StoryBoard/Story?viewslideID=" + $scope.activeSlideID + "_" + $scope.activeReportID + "&isEdited=" + isEditMode + "&activeTab=" + activeTabName;
                }
                else
                    window.location.href = appRouteUrl + "StoryBoard/Story?editslideID=" + $scope.activeSlideID + "_" + $scope.activeReportID + "&isEdited=" + isEditMode + "&activeTab=" + activeTabName;
            },
            error: ajaxError
        });
    }

    function removeNullDataFromFilterPanelInfo(filterPanelInfo) {
        var selfilter = [], flagForFrequency = 0;
        for (i = 0; i < filterPanelInfo.length; i++) {
            var data = filterPanelInfo[i];
            //data.Name != "Time Period" &&
            if (data.Name != null && data.Data != null && data.Data != undefined && data.SelectedID != undefined) {
                if (i > 0 && data.Name != filterPanelInfo[i - 1].Name && data.SelectedID != filterPanelInfo[i - 1].SelectedID) {
                    if (filterPanelInfo[i].Name == "Measures") {
                        //Update the MetricType of Measures (guest/visit/demographics)
                        filterPanelInfo[i].MetricType = getCurrentMeasureText();
                        //if (filterPanelInfo[i].MetricType == undefined || filterPanelInfo[i].MetricType == null || filterPanelInfo[i].MetricType == "")
                        //    filterPanelInfo[i].MetricType = $scope.MetricType;
                    }
                    if (filterPanelInfo[i].Name == "FREQUENCY") {
                        if (flagForFrequency == 1) {
                        } else {
                            selfilter.push(angular.copy(filterPanelInfo[i]));
                        }
                        flagForFrequency = 1;
                    } else {
                        selfilter.push(angular.copy(filterPanelInfo[i]));
                    }

                }
            }
        }
        return selfilter;
    }

    function navigationSelection() {
        var dataInfo = window.location.search;
        if (dataInfo != "" && dataInfo != null) {
            var viewSliderId = "", modeOfEditable = "", activeTab = "";
            dataInfo = dataInfo.replace("?", "");
            var dataInfo_Count = dataInfo.split("&");
            viewSliderId = dataInfo_Count[0];
            dataInfo = viewSliderId.split("=");
            var dataIDS = dataInfo[1].split("_");
            $scope.activeSlideID = dataIDS[0];
            $scope.activeOption = dataInfo[0];
            $scope.activeReportID = dataIDS[1];
            var passingParam = dataInfo[0];
            if (dataInfo_Count.length > 1) {
                modeOfEditable = dataInfo_Count[1];
                dataInfo = modeOfEditable.split("=");
                if (dataInfo[0] == 'isEdited') {
                    if (dataInfo[1] == 'false')
                        isEditMode = false;
                    else
                        isEditMode = true;
                }
                else
                    isEditMode = false;
                activeTab = dataInfo_Count[2];
                dataInfo = activeTab.split("=");
                if (dataInfo[0] == 'activeTab') {
                    activeTabName = dataInfo[1];
                }
                else
                    activeTabName = "";
            }
            $(".back-to-report").show();
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/GetSlideDetails?SlideID=" + $scope.activeSlideID,
                method: "GET",
                contentType: "application/json",
                success: function (response) {
                    selectLeftPanel(response, passingParam);
                },
                error: ajaxError
            });
        }
    }

    function selectLeftPanel(slideData, source) {
        //Update the Comment_Value
        if (slideData.Comment != null && slideData.Comment != undefined) { commentValue = slideData.Comment; }
        data = JSON.parse(slideData.Filter);
        $scope.activeChartType = JSON.parse(slideData.OutputData).ChartType;
        //click the trend toggle if chart type is TREND
        if ((data[0].isTrendTable == "true") || ($scope.activeChartType == "trend" || $scope.activeChartType == "LineWithMarkers") && $(".pit").hasClass("active")) {
            $(".pit-trend-slider").click();
        }
        //else {
        //    //if (slideData.TimePeriodType == "TOTAL")
        //    //$($(".lft-popup-tp")[1]).click(); //click for total time period
        //}
        for (i = 0; i < data.length; i++) {
            var ele = $(".master-lft-ctrl[data-val='" + data[i].Name + "']");
            if (data[i].Name.toLowerCase() != "frequency") {
                if (data[i].Name == "Measures") {
                    var measureText = data[i].MetricType;                    
                    if (guestList.indexOf(measureText) > -1 || measureText == "guest") {
                        $(".adv-fltr-toggle-container").hide();
                        if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                            clearAdvanceFilters();
                        //if (isAdditionalFilterLoaded)
                        angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');
                        $scope.MetricType = "Guest Measures";
                    }
                    else {
                        if (visitList.indexOf(measureText) > -1 || measureText == "visit") {
                            $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1.lft-popup-col").attr("first-level-selection", "Visit Measures");
                            angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');
                            $scope.MetricType = "Visit Measures";
                        } else {
                            //demographics
                            if (data[0].IsVisit == 1) {
                                if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                                    clearAdvanceFilters();
                                //if (isAdditionalFilterLoaded)
                                angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');
                                $(".adv-fltr-toggle-container").show();
                                $(".centerAlign").css("left", "42%");
                                $(".adv-fltr-visit").css("color", "#f00");
                                $('#guest-visit-toggle').removeClass('activeToggle');
                                $(".adv-fltr-guest").css("color", "#000");
                                $("#guest-visit-toggle").prop("checked", false);
                            } else {
                                if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                                    clearAdvanceFilters();
                                //if (isAdditionalFilterLoaded)
                                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');
                                $(".adv-fltr-toggle-container").show();
                                $(".centerAlign").css("left", "42%");
                                $(".adv-fltr-guest").css("color", "#f00");
                                $('#guest-visit-toggle').addClass('activeToggle');
                                $(".adv-fltr-visit").css("color", "#000");
                                $("#guest-visit-toggle").prop("checked", true);
                            }
                        }
                    }
                }
            }
        }        
        setTimeout(function () {
            for (i = 0; i < data.length; i++) {
                var ele = $(".master-lft-ctrl[data-val='" + data[i].Name + "']");
                if (data[i].Name.toLowerCase() != "frequency") {
                    if (data[i].Name == "Measures") {
                        $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);
                    }
                    if (data[i].Name.toLocaleLowerCase() != "time period") {
                        var selIds = data[i].SelectedID == undefined ? [] : data[i].SelectedID.split("|");
                        for (j = 0; j < selIds.length; j++) {
                            $(ele).find(".lft-popup-ele-label[data-id=" + selIds[j] + "]").first().click();

                        }
                    } else {
                        //Click the timeperiod Selected
                        if (data[i].SelectedID.toLocaleLowerCase() != "total") {
                            var allTP = $(".lft-popup-tp");
                            for (var tpInd = 0; tpInd < allTP.length; tpInd++) {
                                if ($(allTP[tpInd]).text().trim() == data[i].SelectedID) {
                                    $(allTP[tpInd]).click();
                                    if (data[i].isTrendTable == "true") {
                                        var firstPos = 0, lastPos = 0;
                                        $(".ui-slider-label").each(function (ind, d) {
                                            if ($(d).text().trim().toLocaleLowerCase() == data[i].Data[0].Text.toLocaleLowerCase()) { firstPos = ind; }
                                            if ($(d).text().trim().toLocaleLowerCase() == data[i].Data[data[i].Data.length - 1].Text.toLocaleLowerCase()) { lastPos = ind; }
                                        });
                                        $("#slider-range").slider('values', 0, firstPos);
                                        $("#slider-range").slider('values', 1, lastPos);
                                        $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text(data[i].Data[0].Text + " to " + data[i].Data[data[i].Data.length - 1].Text);
                                        trendTpList = data[i].Data;
                                    } else {
                                        var slider_pos = 0;
                                        $(".ui-slider-label").each(function (ind, d) {
                                            if ($(d).text().trim().toLocaleLowerCase() == data[i].Data[0].Text.toLocaleLowerCase()) { slider_pos = ind; }
                                        });
                                        $("#slider-range").slider('value', slider_pos);
                                        $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text(data[i].Data[0].Text);
                                        trendTpList = data[i].Data;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
                //frequncy added by chandru
                if (data[i].Name.toLowerCase() == "frequency") {
                    var selectedText = "";
                    if ($($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-ctrl3")[0]).find(".lft-popup-ele_active").length > 0)
                        selectedText = $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-ctrl3")[0]).find(".lft-popup-ele_active").text().trim();
                    if (selectedText == "")
                        $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-ctrl3")[0]).find("span.lft-popup-ele-label[data-id='" + data[i].SelectedID + "']").click();
                    else {
                        if (selectedText.toUpperCase() != data[i].Data[0].Text.toUpperCase())
                            $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-ctrl3")[0]).find("span.lft-popup-ele-label[data-id='" + data[i].SelectedID + "']").click();
                    }
                }
            }
            var successOrNot = false;
            active_chart_type = data[0].active_chart_type == undefined ? "" : data[0].active_chart_type;
            active_chart_flag = 1;
            //Set first level selection for measures and metric comparison
            //$(".master-lft-ctrl[data-val='Measures'] .lft-popup-col").attr("first-level-selection", measureText);
            //Apply custom base
            if (data[0].statOption != undefined && data[0].statOption != null && data[0].statOption != "") {
                if (data[0].statOption.toLocaleLowerCase() == "custom base") {
                    if (data[0].customBase != undefined && data[0].customBase != null && data[0].customBase != "") {
                        $("#table-custombse").click();
                        $scope.isCustomBaseSelect = true;
                        $scope.customBaseText = "";
                        var allCustombaseList = $(".stat-cust-estabmt");
                        for (var i = 0; i < allCustombaseList.length; i++) {
                            if ($(".stat-cust-estabmt:eq(" + i + ")").text().trim().toLocaleLowerCase() == data[0].customBase.toLocaleLowerCase()) {
                                $(".stat-cust-estabmt:eq(" + i + ")").click();
                                successOrNot = true;
                                break;
                            }
                        }
                        if (successOrNot == true) { $(".custombaseSubmit").click(); } else {
                            $scope.prepareContentArea();
                        }
                    } else {
                        $scope.prepareContentArea();
                    }
                } else {
                    successOrNot = false;
                    var allStatOptions = $(".table-stat");
                    for (var i = 0; i < allStatOptions.length; i++) {
                        if ($(".table-stat:eq(" + i + ")").text().trim().toLocaleLowerCase() == data[0].statOption.toLocaleLowerCase()) {
                            successOrNot = true;
                            $(".table-stat:eq(" + i + ")").click();
                        }
                    }
                    if (successOrNot == false) { $scope.prepareContentArea(); }
                }
            }
            else {
                $scope.isCustomBaseSelect = false;
                $scope.prepareContentArea();
            }
            //$(".comment-btn").css({ "visibility": "visible" });
            //Update the latest 1st level selection
            $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col").attr("first-level-selection", getFirstLevelSelection("Measures"));
            $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col").attr("first-level-selection", getFirstLevelSelection("Metric Comparisons"));
            if (source == "editslideID") {
                $(".comment-btn").show();
                $(".save-edit-btn").show();
            }
        }, 100);
    }
    $scope.saveEditedSlide = function () {
        var xAxis = "Establishment", yAxis = "Measures";
        var pthName = window.location.pathname.toLocaleLowerCase();
        if (pthName.includes("beveragecompare")) {
            xAxis = "Beverage";
        }
        if (pthName.includes("beveragecompare") || pthName.includes("establishmentdeepdive")) {
            xAxis = "Metric Comparisons";
        }
        var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
        for (l = 0; l < cmt.length; l++) {
            if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
            } else {
                var labels = $(cmt[l]).find(".sel_text");
                fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                for (var j = 0; j < labels.length; j++) {
                    if (j == 0) {
                        fil = fil.concat($(labels[j]).text());
                    } else {
                        fil = fil.concat(", " + $(labels[j]).text());
                    }
                }
                if (l != cmt.length - 1) {
                    fil = fil.concat(" | ");
                }
            }
        }
        if (fil.slice(-3) == " | ") { fil = fil.slice(0, fil.length - 3); }
        var data = { filter: $scope.prepareReportParameters("editedReport") };
        //data.filter.Filter[0].DemoAndTopFilters = fil;
        capture("EditReport", data);
    }

    function checkNavigation() {
        var dataInfo = window.location.search;
        if (dataInfo != "" && dataInfo != null) {
            //dataInfo = dataInfo.replace("?", "");
            //dataInfo = dataInfo.split("=");
            //var dataIDS = dataInfo[1].split("_");
            //$scope.activeSlideID = dataIDS[0];
            //$scope.activeOption = dataInfo[0];
            //$scope.activeReportID = dataIDS[1];
            var viewSliderId = "", modeOfEditable = "";
            dataInfo = dataInfo.replace("?", "");
            var dataInfo_Count = dataInfo.split("&");
            viewSliderId = dataInfo_Count[0];
            dataInfo = viewSliderId.split("=");
            var dataIDS = dataInfo[1].split("_");
            $scope.activeSlideID = dataIDS[0];
            $scope.activeOption = dataInfo[0];
            $scope.activeReportID = dataIDS[1];

            if (dataInfo_Count.length > 1) {
                modeOfEditable = dataInfo_Count[1];
                dataInfo = modeOfEditable.split("=");
                if (dataInfo[0] == 'isEdited') {
                    if (dataInfo[1] == 'false')
                        isEditMode = false;
                    else
                        isEditMode = true;
                }
                else
                    isEditMode = false;

                activeTab = dataInfo_Count[2];
                dataInfo = activeTab.split("=");
                if (dataInfo[0] == 'activeTab') {
                    activeTabName = dataInfo[1];
                }
                else
                    activeTabName = "";
            }

            if ($scope.activeOption == "editslideID") {
                $(".save-edit-btn").show();
                //$(".comment-section").hide();
                //$(".comment-btn").css({ "display": "block" });

            }
            else if ($scope.activeOption == "editComments") {
                $(".comment-section").show();
                $(".comment-btn").css({ "display": "none" });
                //Update the Comment text in Textbox
                if (commentValue != "") {
                    $(".comment-input .comment-text").val(commentValue);
                }
            }
        }
    }

    $scope.statTest = function (event) {
        leftpanelchanged = false;
        previsSelectedStatTest = $('.table-statlayer').find('.activestat').attr("id");
        curSelectedStatTest = event.target.id;
        $(".table-stat").removeClass("activestat");
        $(event.currentTarget).addClass("activestat");
        $scope.prepareContentArea("statTest");        
    }

    $(document).on("click", '.ppt-logo', function () {
        if (prepareFilter() == false) { return; }
        if ($('.chart-toplayer').css("display") == "none" && $("#chart-visualisation").text() != "No data available for the selection you made.") {
            alert("Please click Submit Button");
            return false;
        }
        if ($(".chrt-typ.active").hasClass("trend-chart") || $(".chrt-typ.active").hasClass("stackedbar-chart") || $(".chrt-typ.active").hasClass("stackedcolumn-chart") || $(".chrt-typ.active").hasClass("bar-chart") || $(".chrt-typ.active").hasClass("barwithchange-chart") || $(".chrt-typ.active").hasClass("column-chart") || $(".chrt-typ.active").hasClass("pyramid-chart") || $(".chrt-typ.active").hasClass("pyramidwithchange-chart")) {
            $(".loader").show(); $(".transparentBG").show();
            var xAxis = "Establishment", yAxis = "Measures";
            if ($(".trend").hasClass('active')) {
                yAxis = "";
            }
            var pthName = window.location.pathname.toLocaleLowerCase();
            if (pthName.includes("beveragecompare")) {
                xAxis = "Beverage";
            }
            if (pthName.includes("beveragecompare") || pthName.includes("establishmentdeepdive")) {
                xAxis = "Metric Comparisons";
            }
            var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
            for (l = 0; l < cmt.length; l++) {
                if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis) {
                } else {
                    var labels = $(cmt[l]).find(".sel_text");
                    if (yAxis == "" && $(cmt[l]).attr("data-val") == "Measures") {
                        var prntText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
                        fil = fil.concat(" " + prntText + " : ");
                    } else {
                        fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                    }
                    for (var j = 0; j < labels.length; j++) {
                        if (j == 0) {
                            fil = fil.concat($(labels[j]).text());
                        } else {
                            fil = fil.concat(", " + $(labels[j]).text());
                        }
                    }
                    if (l != cmt.length - 1) {
                        fil = fil.concat(", ");
                    }
                }
            }
            if (fil.slice(-2) == ", ") { fil = fil.slice(0, fil.length - 2); }
            var data = { filter: $scope.prepareReportParameters("reportName") };
            //data.filter.Filter[0].DemoAndTopFilters = fil;

            var fileName = "";
            switch (controllername) {
                case "chartestablishmentcompare":
                    fileName = "Compare Establishment";
                    break;
                case "chartestablishmentdeepdive":
                    fileName = "Establishment Deep Dive";
                    break;
                case "chartbeveragecompare":
                    fileName = "Compare Beverage";
                    break;
                case "chartbeveragedeepdive":
                    fileName = "Beverage Deep Dive";
                    break;
            }
            var procName = "ExportToPPTCharts";
            $.ajax({
                async: true,
                url: appRouteUrl + "Chart/" + procName,
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    $(".loader").hide(); $(".transparentBG").hide();
                    //window.location.href = appRouteUrl + "Chart/DownloadExportToPPTCharts?fileName=" +response;
                    window.location.href = appRouteUrl + "Chart/DownloadFilePPT?fileName=" + fileName;
                },
                error: ajaxError
            });
        } else {
            alert("Please select chart only");
        }
    });
    $(document).on("click", '.exl-logo', function () {
        if (prepareFilter() == false) { return; }
        if ($('.chart-toplayer').css("display") == "none" && $("#chart-visualisation").text() != "No data available for the selection you made.") {
            alert("Please click Submit Button");
            return false;
        }
        if ($(".chrt-typ.active").hasClass("table-chart")) {
            $(".loader").show(); $(".transparentBG").show();
            var xAxis = "Establishment", yAxis = "Measures";
            if ($(".trend").hasClass('active')) {
                yAxis = "";
            }
            var tbTitle = "Establishment(s)";
            var pthName = window.location.pathname.toLocaleLowerCase();
            if (pthName.includes("beveragecompare")) {
                xAxis = "Beverage";
                tbTitle = "Beverage(s)";
            }
            if (pthName.includes("beveragedeepdive") || pthName.includes("establishmentdeepdive")) {
                xAxis = "Metric Comparisons";
                tbTitle = "Metric Comparison(s)";
            }
            var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
            for (l = 0; l < cmt.length; l++) {
                if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis || $(cmt[l]).attr("data-val") == "FREQUENCY") {
                } else {
                    var labels = $(cmt[l]).find(".sel_text");
                    if (yAxis == "" && $(cmt[l]).attr("data-val") == "Measures") {
                        var prntText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
                        fil = fil.concat(" " + prntText + " : ");
                    } else {
                        fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                    }
                    for (var j = 0; j < labels.length; j++) {
                        if (j == 0) {
                            fil = fil.concat($(labels[j]).text());
                        } else {
                            fil = fil.concat(", " + $(labels[j]).text());
                        }
                    }
                    if (l != cmt.length - 1) {
                        fil = fil.concat(", ");
                    }
                }
            }
            if (fil.slice(-2) == ", ") { fil = fil.slice(0, fil.length - 2); }
            var mstyp = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
            var freq = $(".FREQUENCY_topdiv_element").find(".sel_text").text();
            //var customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
            var selectedStatTest = $('.table-statlayer').find('.activestat').text().trim();//selected stat test
            if (selectedStatTest.toLocaleLowerCase() == "custom base")
                customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
            else
                customBaseSelctdText = "";

            // Selected Demo Filters
            var selectedDemofilters = "", selectedDemofiltersList = [];
            var selectedDemofilters = $(".Demographic_Filters_topdiv_element[data-val='Demographic Filters'] div").find(".sel_text");
            $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
                selectedDemofiltersList += $(seltDemFiltrV).text().toLocaleUpperCase().trim() + ",";
            });

            if (selectedDemofiltersList != "")
                selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
            //
            var advanceFiltersList = ["DEVICE USED", "DAYPART", "DAY PART", "DAY OF WEEK", "BEVERAGE ITEMS", "FOOD ITEMS", "Establishment", "Planning Type", "Service Mode", "Meal Type", "Visit Type", "Outlet Segments", "Beverage Consumed"];
            var selectedAdvanceFitlersList = [];
            $.each(advanceFiltersList, function (filtrI, filtrV) {
                var selectedAdnceFilters = [];
                if ((controllername == "chartestablishmentcompare" || controllername == "chartestablishmentdeepdive") && filtrV == "Establishment")
                    selectedAdnceFilters = [];
                else
                    selectedAdnceFilters = $(".topdiv_element[data-val='" + filtrV + "'] div").find(".sel_text");
                $.each(selectedAdnceFilters, function (seltFiltrI, seltFiltrV) {
                    //if (seltFiltrI == 0)
                    //    selectedAdvanceFitlersList += filtrV + ": ";
                    selectedAdvanceFitlersList += $(seltFiltrV).text().toLocaleUpperCase().trim() + ",";
                });
            });
            if (selectedAdvanceFitlersList != "")
                selectedAdvanceFitlersList = selectedAdvanceFitlersList.substr(0, selectedAdvanceFitlersList.length - 1);
            // Selected Demo Filters

            var measureParentName = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
            var data = { filter: $scope.prepareReportParameters("reportName"), measureType: mstyp, frequency: freq, tableTitle: tbTitle, customBaseText: customBaseSelctdText, selectedDemofiltersList: selectedDemofiltersList, selectedAdvanceFitlersList: selectedAdvanceFitlersList, measureParentName: measureParentName };
            //data.filter.Comment = fil;
            var fileName = "";
            switch (controllername) {
                case "chartestablishmentcompare":
                    fileName = "Compare Establishment";
                    break;
                case "chartestablishmentdeepdive":
                    fileName = "Establishment Deep Dive";
                    break;
                case "chartbeveragecompare":
                    fileName = "Compare Beverage";
                    break;
                case "chartbeveragedeepdive":
                    fileName = "Beverage Deep Dive";
                    break;
            }
            var procName = "ExportToExcelChartTable";
            $.ajax({
                async: true,
                url: appRouteUrl + "Chart/" + procName,
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    $(".loader").hide(); $(".transparentBG").hide();
                    //window.location.href = appRouteUrl + "Chart/DownloadExportToExcelChartTable?fileName=" + response;
                    window.location.href = appRouteUrl + "Chart/DownloadFile?fileName=" + fileName;
                },
                error: ajaxError
            });
        } else {
            alert("Please select table only");
        }
    });

    /*Chart ng click functions added by bramhanath (01-08-2017) Start*/
    $scope.column = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".column-chart").addClass("active");
        $scope.activeChartType = 'column';
        active_chart_type = 'column';
        currentOutputChartType = 'column';
        reset_img_pos_chart('column');
        $(".chart-bottomlayer").css("position", 'relative');
        $(".column-chart").css("background-position", "0px -408px");
        var mLength = currentMeasures.length;
        if (mLength > 1) {
            groupedColumnChart(data);
        }
        else {
            columnChart(data);
        }
    }
    $scope.barChart = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".bar-chart").addClass("active");
        $scope.activeChartType = 'bar';
        active_chart_type = 'bar';
        currentOutputChartType = 'bar';
        reset_img_pos_chart('bar');
        $(".chart-bottomlayer").css("position", 'relative');
        $(".bar-chart").css("background-position", "-97px -408px");
        var mLength = currentMeasures.length;
        if (mLength > 1) {
            groupedBarChart(data);
        }
        else {
            barChart(data);
        }
    }
    $scope.StackedBar = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".stackedbar-chart").addClass("active");
        $scope.activeChartType = 'stackedbar';
        active_chart_type = 'stackedbar';
        currentOutputChartType = 'stackedbar';
        reset_img_pos_chart('stackedbar');
        $(".chart-bottomlayer").css("position", 'relative');
        $(".stackedbar-chart").css("background-position", "-974px -408px");
        barChartStacked(data);
    }
    $scope.StackedColumn = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".stackedcolumn-chart").addClass("active");
        $scope.activeChartType = 'stackedcolumn';
        active_chart_type = 'stackedcolumn';
        currentOutputChartType = 'stackedcolumn';
        reset_img_pos_chart('stackedcolumn');
        $(".chart-bottomlayer").css("position", 'relative');
        $(".stackedcolumn-chart").css("background-position", "-886px -408px");
        columnChartStacked(data);
    }
    $scope.barwithchange = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".barwithchange-chart").addClass("active");
        $scope.activeChartType = 'barchange';
        active_chart_type = 'barchange';
        currentOutputChartType = 'barchange';
        reset_img_pos_chart('barchange');
        $(".chart-bottomlayer").css("position", 'relative');
        $(".barwithchange-chart").css("background-position", "-1062px -408px");
        var mLength = currentMeasures.length;
        if (mLength > 1) {
            groupedBarChartWithChange(data);
        }
        else {
            barChartWithChange(data);
        }
    }
    $scope.pyramid = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".pyramid-chart").addClass("active");
        $scope.activeChartType = 'pyramid';
        active_chart_type = 'pyramid';
        currentOutputChartType = 'pyramid';
        reset_img_pos_chart('pyramid');
        $(".chart-bottomlayer").css("position", 'initial');
        $(".pyramid-chart").css("background-position", "-386px -408px");
        Pyramid_Chart(data, false);
    }
    $scope.pyramidwithchange = function (data) {
        $("#flexi-table").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTable").hide();
        $("#chart-visualisation").show();
        $(".chart-measure-text").show();
        $(".master-view-content").css("background-image", "none");
        $("#chart-visualisation").html('');
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
        $(".chrt-typ").removeClass("active");
        $(".pyramidwithchange-chart").addClass("active");
        $scope.activeChartType = 'pyramidwithchange';
        active_chart_type = 'pyramidwithchange';
        currentOutputChartType = 'pyramidwithchange';
        reset_img_pos_chart('pyramidwithchange');
        $(".chart-bottomlayer").css("position",'initial');
        $(".pyramidwithchange-chart").css("background-position", "-1258px -406px");
        Pyramid_Chart(data, true);
    }
    function defaultFreqncySelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                if (isVisitsSelected_Charts == 0) {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                        $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                        if (isToggleClcked)
                            $scope.prepareContentArea();
                    }
                }
                else {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                        if (isToggleClcked)
                            $scope.prepareContentArea("");
                        //}
                        //isInitialLoad = false;
                        reject('Error');
                    }
                }
                $(".master-lft-ctrl[data-val='DAY OF WEEK']").parent().show();
            }, 50);
        });
    }
    function defaultFreqncyForBeverageSelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                if (isVisitsSelected_Charts == 0) {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                        $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                        if (isToggleClcked)
                            $scope.prepareContentArea();
                    }
                }
                else {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                        if (isToggleClcked)
                            $scope.prepareContentArea();
                        reject('Error');
                    }
                }
                $(".master-lft-ctrl[data-val='DAY OF WEEK']").parent().show();
            }, 50);
        });
    }
    /*Chart ng click functions added by bramhanath (01-08-2017) End*/

}]);

$(document).ready(function () {
    //
    $(".lft-ctrl-toggle").show();
    $(".master_link").removeClass("active");
    $(".master_link.charts").addClass("active");
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(3)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((19 * $(".master_link_a:eq(3)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
            $(".submodules-band").css("margin-left", "60.9%");
            $(".submodules-band").css("margin-top", "-0.55%");
    }

    //angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');
    //
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
    $(".table-stat").click(function () {
        $(".table-stat").removeClass("activestat");
        $(this).addClass("activestat");
    });

    $(".comment-text").focus();

    //to disable in-establishment details
    //if (controllername == "chartbeveragedeepdive") {
    //    //Tooltip for the enabled and disabled measures
    //    $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col1 .lft-popup-ele").hover(function () {
    //        // Hover over code      
    //        var title = $(this).attr('title');
    //        var GroupNamelist = [];
    //        var ShopperGrps = [];
    //        $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col1").find(".lft-popup-ele-label").each(function () {
    //            GroupNamelist.push($(this).html());
    //        });
    //        var measurename = $(this).find(".lft-popup-ele-label").text();
    //        switch (measurename) {
    //            case "In-Establishment Bev Details":
    //                title = "This module is under construction";
    //                break;
    //        }

    //        if (title != undefined && title != "" && title != null) {
    //            $(this).data('tipText', title).removeAttr('title');
    //            $('<p class="GeoToolTip"></p>')
    //            .text(title)
    //            .appendTo('body')
    //            .fadeIn('slow');

    //            var pos = $(this).position();
    //            // .outerWidth() takes into account border and padding.
    //            var width = $(this).outerWidth();
    //            //show the menu directly over the placeholder
    //            $(".GeoToolTip").css({
    //                position: "absolute",
    //                top: pos.top + "px",
    //                left: (pos.left + width) + "px",
    //            }).show();
    //        }

    //    }, function () {
    //        // Hover out code
    //        $(this).attr('title', $(this).data('tipText'));
    //        $('.GeoToolTip').remove();
    //    }).mousemove(function (e) {
    //        var mousex = e.pageX + 10; //Get X coordinates
    //        var mousey = e.pageY + 10; //Get Y coordinates
    //        $('.GeoToolTip')
    //            .css({ top: mousey, left: mousex })
    //    });

    //    //
    //}
    //

    if (controllername == "chartbeveragedeepdive" || controllername == "chartestablishmentdeepdive") {
        //Tooltip for the enabled and disabled measures
        $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1 .lft-popup-ele").hover(function () {
            // Hover over code      
            var title = $(this).attr('title');
            var GroupNamelist = [];
            var ShopperGrps = [];
            $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").find(".lft-popup-ele-label").each(function () {
                GroupNamelist.push($(this).html());
            });
            var measurename = $(this).find(".lft-popup-ele-label").text();
            switch (measurename) {
                case "Beverage Guest":
                case "Brand Health Metrics":
                    title = "This measure is valid for only Demographics, Brand Health Metrics, Beverage Guest Groups";
                    break;
                case "Demographics":
                    if (controllername == "chartbeveragedeepdive")
                        title = "This measure is valid for only Demographics, Pre-Visit, In-Establishment, In-Establishment Bev Details, Post-Visit, Establishment Frequency Groups";
                    else
                        title = "This measure is valid for only Demographics, Pre-Visit, In-Establishment, In-Establishment Bev Details, Post-Visit, Brand Health Metrics, Beverage Guest Groups";
                    break;
                case "Pre-Visit":
                case "In-Establishment":
                case "In-Establishment Bev Details":
                case "Post-Visit":
                    title = "This measure is valid for only Demographics, Pre-Visit, In-Establishment, In-Establishment Bev Details, Post-Visit Groups";
                    break;
                case "Establishment Frequency":
                    title = "This measure is valid for only Demographics, Establishment Frequency Groups";
                    break;
            }

            if (title != undefined && title != "" && title != null) {
                $(this).data('tipText', title).removeAttr('title');
                $('<p class="GeoToolTip"></p>')
                .text(title)
                .appendTo('body')
                .fadeIn('slow');

                var pos = $(this).position();
                // .outerWidth() takes into account border and padding.
                var width = $(this).outerWidth();
                //show the menu directly over the placeholder
                $(".GeoToolTip").css({
                    position: "absolute",
                    top: pos.top + "px",
                    left: (pos.left + width) + "px",
                }).show();
            }

        }, function () {
            // Hover out code
            $(this).attr('title', $(this).data('tipText'));
            $('.GeoToolTip').remove();
        }).mousemove(function (e) {
            var mousex = e.pageX + 10; //Get X coordinates
            var mousey = e.pageY + 10; //Get Y coordinates
            $('.GeoToolTip')
                .css({ top: mousey, left: mousex })
        });

        //
    }
});
var plottrendChart1 = function (data) {
    
    var series = prepareTrendChartData(data);
        var options = {
            "chart": {
                "type": "line",
                "renderTo": "chart-visualisation",
                "animationDuration": 1000,
                "width": $("#chart-visualisation").width()-100,
                "height": $("#chart-visualisation").height()-50,
                "margins": {
                    "top": 20,
                    "right": 20
                }
            },
            "plotOptions": {
                "interpolate": "liner",
                "label": [
                  {
                      "enabled": false
                  }
                ],
                "hideOverlapLabel": true
            },
            "tooltip": {
                "isGrouped": false,
                "enabled": true,
                "format": function (d) {
                    var tp = '<div class="trend-label">' + d.y.toFixed(1) + '</div>';
                    return tp;
                }

            },
            "custom": {
                "x": "x",
                "y": "y"
            },
            "legend": {
                "enabled": true,
                "verticalAlign": "bottom",
                "align": "center"
            },
            "yAxis": {
                "title": "",
                "threshold": 1.1,
                "gridlines": true,
                "baseline": false,
                "enabled": true,
                "format": function (d) { return d; },
                "tick": false,
                "style": {
                    "color": "#999",
                    "strokeColor": "gray",
                    "dashArray": "3,0"
                }
            },
            "xAxis": {
                "baseline": true,
                "gridlines": false,
                "style": {
                    "dashArray": "3,2",
                    "padding": -5
                },
                "margin": {
                    "top": 10
                }
            },
            "series": series,

            "drawArea": {
                "left": -100,
                "right": 0
            },
            "theme": {
                "colors": ["#005cc0", "#17375e", "#912d3e", "#d0740d", "#21754f", "#76787a"]
            }
        }
        Chart = new aqChart();
        Chart(options);
}

function replotChart(data) {
}

var plottrendChart = function (data) {
    current_data_for_chart = data;
    current_function_for_chart = "plottrendChart";
    var xData = [];
    var index = getMaxCount(data);
    for (var i = 0; i < data[index].data.length; i++) {
        xData.push(data[index].data[i].x);
    }
    //If trend new table structure then change the data
    data = preparetrendData(data);
    var temp, i, j, k, max = 0;
    //for (i = 0; i < Object.keys(data[0]).length; i++) {
    //    temp = Object.keys(data[0])[i];
    //    if (temp != "month" && !temp.includes("labelClass") && temp != "sampleSize" && !temp.includes("nullIdentifier") && !temp.includes("lss") && (temp != "lowSampleSize")) {
    //        xData.push(temp);
    //    }
    //}

    //If establishment compare and Multiple establishment then Sample size is NA
    var sample_flag = 0;
    if (window.location.pathname.toLocaleLowerCase().includes("compare") && ($(".Establishment_topdiv_element .sel_text").length > 1 || $(".Beverage_topdiv_element .sel_text").length > 1)) {
        sample_flag = 1;
    }
    if (window.location.pathname.toLocaleLowerCase().includes("deepdive") && ($(".Measures_topdiv_element .sel_text").length > 1 || $(".Metric_Comparisons_topdiv_element .sel_text").length > 1)) {
        sample_flag = 1;
    }
    var dataIntermediate = xData.map(function (c, i) {
        return data.map(function (d) {
            return { x: d.month + "\n(" + (sample_flag == 1 ? "NA" : d.sampleSize) + ")", y: +d[c], original_val: +d[c], index: +i, statColor: d[c + "labelClass"], nullIdentifier: d[c + "nullIdentifier"], year: c, lowSampleSize: d[c + "lss"] };
        });
    });
    ////////////////////// + "\n(" + d.sampleSize + ")"
    //var list = { "BrandList": ["CONVENIENCE", "DRUG", "DOLLAR"], "MetricList": ["Male", "Female"], "SampleSize": [2403, 1193, 959], "ValueData": [[59.7, 51.6, 48.3], [40.3, 48.4, 51.7]], "SignificanceData": [[-1.159378291433508, 0.7137019842043735, -0.4936469608526472], [1.1593782914335609, -0.713701984204379, 0.49364696085266874]], "ChangeVsPy": [[], []], "StatPositive": null, "StatNegative": null }
    //d3.select(id).select("svg").remove();
    $("#chart-visualisation").empty();

    var xvalues = [];
    var mainParentWidth = $('#chart-visualisation').width();
    //use this height and width for entire chart and adjust here with svg traslation
    var margin = { top: 10, right: 45, bottom: 80, left: 0 },
            width = $("#chart-visualisation").width() - margin.left - margin.right - 10,
            height = $("#chart-visualisation").height() - margin.top - margin.bottom - 10;


    var x = d3.scale.ordinal()
        .domain(dataIntermediate[0].map(function (d) {
            return d.x;
        }))
        .rangeRoundBands([0, width]);
    var maxYaxisH = d3.max(dataIntermediate, function (d) { return (d3.max(d, function (e) { return e.y })) });
    maxYaxisH = Math.ceil(maxYaxisH + 10) + (10 - Math.ceil(maxYaxisH % 10));
    if (maxYaxisH == undefined || maxYaxisH == null || maxYaxisH == NaN || maxYaxisH > 100) {
        maxYaxisH = 100;
    }
    var y = d3.scale.linear()
        .domain([0, maxYaxisH])//set the maximum of the value,responsible for setting y axis labels and measurement
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");//.outerTickSize(10);

    //setting the tick values
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");//.outerTickSize(10);

    var chart = d3.select("#chart-visualisation").append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .append("g")
       .attr("transform", "translate(40,30)");
    chart.append("g")
        .attr("class", "y axis trendaxis")
        .attr("transform", "translate(0,0)")
        .call(yAxis);
    chart.append("g")
        .attr("class", "x axis trendaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    d3.selectAll(".x.axis path,.x.axis line, .y.axis path, .y.axis line ")
        .style("fill", "none")
        .style("stroke", "#000")
        .style("shape-rendering", "geometricPrecision")
        .style("font-size", "10px")
        .style("font-family", "Arial");

    //break the text at x-axis
    d3.selectAll(".x .tick text").style("transform", "translateY(10px)")
    .call(horizontalWrap, x.rangeBand() - 10);

    //var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    //var legend_data = data.map(function (d) { return d.month });
    //legend_data = legend_data.filter(function (d,i) {
    //    return (legend_filter_list.indexOf("" + i + "") == -1);
    //});
    //legends
    createLegendsForTrend(xData, chart, t_colorColumnStop, t_colorColumnStop);

    //one hidden div for tooltip
    var div = d3.select("#chart-visualisation").append("div")
        .attr("class", "d3_tooltip")
        .style("opacity", 0);

    var line = d3.svg.line()
   .x(function (d) {
       var tmpVal = x(d.x) + x.rangeBand() / 2;
       return tmpVal;
   })
   .y(function (d) {
       return y(d.y);
   });
    var filterAllNulls = function (rowData) {
        var dAttr = ""; var switchFlag = 0;
        for (var indxOfRow = 0; indxOfRow < rowData.length; indxOfRow++) {
            var xTemp = x(rowData[indxOfRow].x) + x.rangeBand() / 2;
            var yTemp = y(rowData[indxOfRow].y);
            if (xTemp == undefined || xTemp == null) { xTemp = 0; }
            if (yTemp == undefined || yTemp == null) { yTemp = 0; }
            if (indxOfRow == 0) { dAttr = dAttr.concat("M" + xTemp + "," + yTemp); if (rowData[indxOfRow].lowSampleSize == "lowSampleSize" || rowData[indxOfRow].nullIdentifier == "DataIsNull") { switchFlag = 1; } } else {
                if (rowData[indxOfRow].lowSampleSize == "lowSampleSize" || rowData[indxOfRow].nullIdentifier == "DataIsNull") {
                    dAttr = dAttr.concat("M" + xTemp + "," + yTemp); switchFlag = 1;
                } else {
                    if (switchFlag == 0) { dAttr = dAttr.concat("L" + xTemp + "," + yTemp); } else { dAttr = dAttr.concat("M" + xTemp + "," + yTemp); } switchFlag = 0;
                }
            }
        }
        return dAttr;
        //var tempData = new Array();
        //for (var indxOfRow = 0; indxOfRow < rowData.length; indxOfRow++) {
        //    if (rowData[indxOfRow].lowSampleSize == "lowSampleSize" || rowData[indxOfRow].nullIdentifier == "DataIsNull") {
        //    } else {
        //        tempData.push(rowData[indxOfRow]);
        //    }
        //}
        //return tempData;
    }
    //arc for mouse over
    var arc = d3.svg.arc()
          .innerRadius(14)
          .outerRadius(6)
          .startAngle(0)
          .endAngle(2 * Math.PI);
    dataIntermediate = dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    //drawing line chart start
    for (var i = 0; i < dataIntermediate.length; i++) {
        chart.append("path")
          .attr("d", filterAllNulls(dataIntermediate[i]))
          //.attr("d", line(filterAllNulls(dataIntermediate[i])))
          .data(dataIntermediate[i])
          .attr('fill', 'none')
          .attr("class", function (d) { return "lineData" + i + " " + d.nullIdentifier; })//+ " " + d.lowSampleSize
          .attr("stroke", t_colorColumnStop[i])
          .style("stroke-dasharray", "3,3")
          .style("stroke-width", "2.5px");
        countID = 0;//resetting the count for id

        //Append Outer Circle
        chart.selectAll("dot")
               .data(dataIntermediate[i])
               .enter().append("circle")
               .attr("cx", function (d) {
                   return x(d.x) + x.rangeBand() / 2;
               })
               .attr("cy", function (d) {
                   return y(d.y);
               })
               .attr("id", function (d) {
                   var tmpCount = ++countID;
                   return "circle" + i + "_" + tmpCount;
               })
               .attr("class", function (d) { return "lineData" + i + " " + d.lowSampleSize + " " + d.nullIdentifier; })
               .attr("r", 8)
               .style("fill", "none")
               .attr("stroke", t_colorColumnStop[i])
               .attr("stroke-width", "1px");

        //Append Inner Circle
        chart.selectAll("dot")
                .data(dataIntermediate[i])
                .enter().append("circle")
                .attr("cx", function (d) { return x(d.x) + x.rangeBand() / 2; })
                .attr("cy", function (d) { return y(d.y); })
                .attr("id", function (d) {
                    /*Data Label*/
                    var context = d3.select(this.parentNode);
                    context.append("text")
                        .attr("class", d.lowSampleSize + " " + d.nullIdentifier)
                        .attr("x", x(d.x) + x.rangeBand() / 2 - 7)
                        .attr("y", y(d.y) - 10)
                        .text((d.y == undefined || d.y == null) ? "NA" : d.y.toFixed(1) + "%")
                        .style("fill", d.statColor);
                    /*Data Label*/
                    var tmpCount = ++countID;
                    return "circle" + i + "_" + tmpCount;
                })
                .attr("class", function (d) { return "lineData" + i + " " + d.lowSampleSize + " " + d.nullIdentifier; })
                .attr("r", 5)
                .attr("fill", t_colorColumnStop[i])
        //for tooltip we need above hidden div
        .on("mousemove", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            if (d.y != null) {
                div.html("<span>" + d.year + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.y.toFixed(1) + "%" + "</span><span class='toolimg1'></span>")
                    .style("left", (d3.event.pageX - $(".d3_tooltip").width() / 2 - 5) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            }
            else {
                div.html(d.year + "<br>NA<span class='toolimg1'></span>")
                    .style("left", (d3.event.pageX - $(".d3_tooltip").width() / 2 - 5) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            }

            //for arc
            var firstX = $($(this)[0]).attr('cx'),
            firstY = $($(this)[0]).attr('cy'),
            color = $($(this)[0]).attr('fill');
            chart.append("path")
           .attr("d", arc)
           .attr("class", "overArc")
           .style("fill", color)
           .style("opacity", .5)
           .attr("transform", "translate(" + firstX + "," + firstY + ")")
        })
        .on("mouseout", function (d, i) {
            div.transition()
                .duration(500)
                .style("opacity", 0);

            //hiding the arc
            $('.overArc').hide();

        });
    }
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
    $(".y.axis.trendaxis text").append("%");
}

function groupedColumnChart(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "groupedColumnChart";
    data = prepareDataForGroupedColumnChart(data);
    ///////////////////////////
    var each_grp_len = (Object.keys(data[0]).length - 3)/2;
    var NoOfElements = data.length * each_grp_len;
    $("#chart-visualisation").css("overflow", "hidden");
    //$("#chart-visualisation").css("overflow-x", "auto");
    //$("#chart-visualisation").css("overflow-y", "hidden");
    $(".tbl-emptyrow").css("display", "none");
    //if ((data.length + each_grp_len) <= 9) {
    //    NoOfElements = $("#chart-visualisation").width() / 70;
    //    $("#chart-visualisation").css("overflow","hidden");
    //}
    var margin = { top: 30, right: 10, bottom: 50, left: 10 },
    width = $("#chart-visualisation").width() - margin.left - margin.right, //NoOfElements*70
    height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    var x0;
    //NoOfElements = data.length * each_grp_len;
    //if (NoOfElements < 3) {
    //    x0 = d3.scale.ordinal().rangeRoundBands([0, width], .85);
    //} else {
    //    if (NoOfElements < 7) {
    //        x0 = d3.scale.ordinal().rangeRoundBands([0, width], .7);
    //    } else {
    //        if (NoOfElements <= 9) {

    //            x0 = d3.scale.ordinal().rangeRoundBands([0, width], .55);
    //        } else {
    //            if (NoOfElements <= 12) {
    //                x0 = d3.scale.ordinal().rangeRoundBands([0, width], .4);
    //            } else {
    //                x0 = d3.scale.ordinal().rangeRoundBands([0, width], .15);
    //            }
    //        }
    //    }
    //}
    x0 = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height,0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));
    var _maxValInd = 0, _maxVal = data[0].State.length;
    for (var i = 1; i < data.length; i++) {
        if (data[i].State.length > _maxVal) {
            _maxValInd = i;
            _maxVal = data[i].State.length;
        }
    }    
    ///////////////////////////////////////////////////////////
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) {
    return (legend_filter_list.indexOf("" +i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" +i + "") == -1); });
    var ageNames = d3.keys(data[0]).filter(function (key) { return (key !== "State") && !(key.includes("__labelClass")) && (key !== "__sampleSize") && !(key.includes("__nullIdentifier")) && !(key.includes("__change")) && (key != "__lowSampleSize"); });

    data.forEach(function (d) {
        d.ages = ageNames.map(function (name) {
            return {
        name: name, value: +d[name], labelClass: d[name + "__labelClass"]
    };
    });
    });
var cummul_width = 0, flag = 0;
ageNames.forEach(function (d, i) {
    cummul_width = cummul_width + ageNames[i].length * 8;
});
if (cummul_width > width) {
    flag = 1;
}
    x0.domain(data.map(function (d) { return d.State; }));
    var temp_ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" +i + "") == -1); });
    x1.domain(temp_ageNames).rangeRoundBands([0, x0.rangeBand()]);
    data.forEach(function (d) {
        d.ages = temp_ageNames.map(function (name) {
            return { name: name, value: +d[name], labelClass: d[name + "__labelClass"] };
        });
    });
    //Update the bottom, height and svg height    
    var btm = horizontalWrapCount(data[_maxValInd].State, x0.rangeBand() - 10);
    if (btm > 2) {
        margin.bottom = margin.bottom + (10 * (btm - 2));
        height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    }
    y = d3.scale.linear()
        .range([height, 0]);
    var temp_data = data.filter(function(d) { return d.sampleSize < 30 ? false: true; });
    if (data.length != 0) {
        y.domain([0, d3.max(temp_data, function (d) {
            return d3.max(d.ages, function (d) {
                return d.value;
            });
        })]);
    } else {
        y.domain([0, 0]);
    }
    
    ///////////////////////////////////////////////////////////
    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("class", "xtext")
        .style("text-anchor", "end")
        .attr("dx", "0em")
        .attr("dy", ".15em")
        .style("font-size", "10px")
        .style("text-anchor","middle");

    svg.append("g")
        .attr("class", "y axis")
        .style("fill", "transparent")
        .style("stroke", "black")
        .style("stroke-width", "0")
        .call(yAxis)
    //
    var gap = 10;
    var wdt = x1.rangeBand();
    //
    createLegends(ageNames, svg, t_colorColumnStart, t_colorColumnStop);
    ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == (-1)); });
    //Add attribute name to each individual metrics
    data = $(data).each(function (i, d) {
        $(d.ages).each(function (i, c) {
            c["groupName"] = d.State;
        });
    });
    var state = svg.selectAll(".state")
        .data(data)
      .enter().append("g")
        .attr("class", function (d) {
            return "state " + d.__lowSampleSize;
        })
        .attr("transform", function (d) { return "translate(" + x0(d.State) + ",0)"; });
    height = height - 10;
    cummul_width = 0;
    state.selectAll("rect")
        .data(function (d) { return d.ages; })
        .enter().append("rect")
        .attr("class", function (d) { return  })
        .attr("width", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("x", function (d) { return x1(d.name); })
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return (height - y(d.value)) < 0 ? 0 : (height - y(d.value)); })
        .style("stroke", function (d,i) { return t_colorColumnStop[i] })
        .style("stroke-width", "0")
        .style("fill", "none");
    /*BEGIN White stroke rectangle*/
    state.selectAll("rectF")
        .data(function (d) { return d.ages; })
      .enter().append("rect")
        .attr("width", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("x", function (d) { return x1(d.name); })
        .attr("y", function (d) { return y(d.value) -7; })
        .attr("height", function (d, i) {
            var context = d3.select(this.parentNode);
            ///*SemiRectangle*/
            /*Text above circle*/
            context.append("text").attr("class","upper-text"+i)
                .attr("x", x1(d.name) + (wdt-gap)/2 -12)//12 is the size of text
                .attr("y", y(d.value)-5-7)
                .text(function () {
                    return d.value.toFixed(1)+"%";
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("fill", d.labelClass)
                .on("mousemove", function () {
                    div.transition()
                    .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 35) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
                   .style("opacity", 0);
                });
            /*Text above circle*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("width", wdt + 6 - gap)
                        .attr("x", x1(d.name) - 3)
                        .attr("y", height + 5)
                        .attr("height", 2)
                        .style("fill", t_colorColumnStart[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Rectangular Plot at bottom*/
            /*Vertical Line*/
            context.append("rect")
                        .attr("width", 1)
                        .attr("x", x1(d.name) + (wdt -gap)/2)
                        .attr("y", y(d.value)-7)
                        .attr("height", (height - y(d.value)) < 0 ? 0 : (height - y(d.value)+7))
                        .style("opacity", 0.4)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Vertical Line*/
            /*Horizontal Line*/
            context.append("rect")
                        .attr("width", wdt - gap)
                        .attr("x", x1(d.name))
                        .attr("y", y(d.value)-10)
                        .attr("height", (height - y(d.value) + 10) == 0?0:3)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Horizontal Line*/
            return (height - y(d.value) + 10) < 0 ? 0 : (height - y(d.value)+10);
        })
        .style("fill", function (d, i) {
            var C = svg.append("defs")
            .append("linearGradient")
            .attr("id", "C" + i)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            C.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", t_colorColumnStart[i]);
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[i]);
            return "url(#C" + i + ")";
        })
        .on("mousemove", function (d, i) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });
    /*END White stroke rectangle*/    
    svg.selectAll(".x.axis .tick text").call(horizontalWrap, x0.rangeBand() - 10);
    $(".domain").css("fill", "transparent");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function groupedBarChart(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "groupedBarChart";
    data = prepareDataForGroupedColumnChart(data);
    ///////////////////////////
    var each_grp_len = (Object.keys(data[0]).length - 3)/2;
    var NoOfElements = data.length * each_grp_len;
    //$("#chart-visualisation").css("overflow-y", "auto");
    //$("#chart-visualisation").css("overflow-x", "hidden");
    $(".tbl-emptyrow").css("display", "none");
    if (NoOfElements <= 6) {
        NoOfElements = $("#chart-visualisation").height() / 70;
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
    }
    var margin = { top: 5, right: 100, bottom: 5, left: 230 },
    width = $("#chart-visualisation").width() - margin.left - margin.right,
    height = $("#chart-visualisation").height() - margin.top - margin.bottom; //NoOfElements * 70

    var y0 = d3.scale.ordinal()
        .rangeRoundBands([height, 0], 0.1);

    var y1 = d3.scale.ordinal();

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y0)  //shak
        .orient("left")
        .tickFormat(d3.format(".2s"));
    ///////////////////////////////////////////////////////////
    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
   
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var ageNames = d3.keys(data[0]).filter(function (key) { return (key !== "State") && !(key.includes("__labelClass")) && (key !== "__sampleSize") && !(key.includes("__nullIdentifier")) && !(key.includes("__change")) && (key != "__lowSampleSize"); });
    data.forEach(function (d) {
        d.ages = ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"] }; });
    });
    var cummul_width = 0, flag = 0;
    ageNames.forEach(function (d, i) {
        cummul_width = cummul_width + ageNames[i].length * 8;
    });
    if (cummul_width > width) { flag = 1; }
    y0.domain((data.map(function (d) { return d.State; })).reverse());
    var temp_ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    y1.domain(temp_ageNames).rangeRoundBands([0, y0.rangeBand()]);
    data.forEach(function (d) {
        d.ages = temp_ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"] }; });
    });
    var temp_data = data.filter(function (d) { return d.sampleSize < 30 ? false:true; });
    if (data.length != 0) {
        x.domain([0, d3.max(temp_data, function (d) { return d3.max(d.ages, function (d) { return d.value; }); })]);
    } else {
        x.domain([0, 0]);
    }
    //
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis)
        .selectAll("text").style("fill", "transparent");

    svg.append("g")
        .attr("class", "y axis textSmall")
        .style("fill", "black")
        .style("stroke", "black")
        .style("stroke-width", "0")
        .call(yAxis).selectAll("text").text(function (d) {
            return d;
        });
    //
    var gap = 6;
    var wdt = y1.rangeBand(), xShift = 10;
    //
    createLegends(ageNames, svg, t_colorColumnStart, t_colorColumnStop);
    ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == (-1)); });    
    data.forEach(function (d) {
        d.ages = ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"] }; });
    });
    //Add attribute name to each individual metrics
    data = $(data).each(function (i, d) {
        $(d.ages).each(function (i, c) {
            c["groupName"] = d.State;
        });
    });
    var state = svg.selectAll(".state")
        .data(data)
      .enter().append("g")
        .attr("class", function (d) { return "state " + d.__lowSampleSize; })
        .attr("transform", function (d) { return "translate(0," + y0(d.State) + ")"; });
    height = height - 10;
    var cummul_width = 0;
    state.selectAll("rect")
        .data(function (d) { return d.ages; })
      .enter().append("rect")
        .attr("height", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("y", function (d) { return y1(d.name); })
        .attr("x", function (d) { return xShift; })
        .attr("width", function (d) { return (x(d.value) + xShift) < 0 ? 0 : (x(d.value) + xShift); })
        .style("stroke", function (d, i) { return t_colorColumnStop[i] })
        .style("stroke-width", "0")
        .style("fill", "none");
    /*BEGIN White stroke rectangle*/
    state.selectAll("rectF")
        .data(function (d) { return d.ages; })
      .enter().append("rect")
        .attr("height", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("y", function (d) { return y1(d.name); })
        .attr("x", function (d) { return xShift; })
        .attr("width", function (d, i) {
            var context = d3.select(this.parentNode);
            /*Text above circle*/
            context.append("text")
                .attr("y", y1(d.name)+(wdt)/2)
                .attr("x", x(d.value)+xShift+15)
                .text(function () {
                    return (Math.round(d.value * 100) / 100).toFixed(1) + "%";
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("text-anchor", "start")
                .style("fill", d.labelClass)
                .on("mousemove", function () {
                    div.transition()
                    .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
                   .style("opacity", 0);
                });
            /*Text above circle*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("height", wdt + 4 - gap)
                        .attr("y", y1(d.name) - 2)
                        .attr("x", 5)
                        .attr("width", 2)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Rectangular Plot at bottom*/
            /*Horizontal Line*/
            context.append("rect")
                        .attr("height", 1)
                        .attr("y", y1(d.name) + (wdt-gap)/2)
                        .attr("x", xShift)
                        .attr("width", x(d.value) < 0 ? 0 : x(d.value))
                        .style("opacity", 0.4)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Horizontal Line*/
            /*Vertical Line*/
            context.append("rect")
                        .attr("height", wdt-gap)
                        .attr("y", y1(d.name))
                        .attr("x", x(d.value)+xShift)
                        .attr("width", 3)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Vertical Line*/

            return (x(d.value)) < 0 ? 0 : (x(d.value));
        })
        .style("fill", function (d, i) {
            var C = svg.append("defs")
            .append("linearGradient")
            .attr("id", "C" + i)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            C.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", t_colorColumnStart[i]);
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[i]);
            return "url(#C" + i + ")";
        })
        .on("mousemove", function (d, i) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width()/2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });
    /*END White stroke rectangle*/
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 210);
    //$(".y.axis .tick text").css("transform", "translateY(-5px)");
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    $(".domain").css("fill", "transparent");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function groupedBarChartWithChange(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "groupedBarChartWithChange";
    data = prepareDataForGroupedColumnChart(data);
    ///////////////////////////
    var each_grp_len = (Object.keys(data[0]).length - 3) / 2;
    var NoOfElements = data.length * each_grp_len;
    //$("#chart-visualisation").css("overflow-y", "auto");
    //$("#chart-visualisation").css("overflow-x", "hidden");
    $(".tbl-emptyrow").css("display", "none");
    if (NoOfElements <= 6) {
        NoOfElements = $("#chart-visualisation").height() / 70;
        $("#chart-visualisation").css("overflow-x", "hidden");
        $("#chart-visualisation").css("overflow-y", "hidden");
    }
    var margin = { top: 5, right: 110, bottom: 5, left: 230 },
    width = $("#chart-visualisation").width() - margin.left - margin.right,
    height = $("#chart-visualisation").height() - margin.top - margin.bottom; //NoOfElements * 70

    var y0 = d3.scale.ordinal()
        .rangeRoundBands([height, 0], 0.1);

    var y1 = d3.scale.ordinal();

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y0)  //shak
        .orient("left")
        .tickFormat(d3.format(".2s"));
    ///////////////////////////////////////////////////////////
    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);

    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var ageNames = d3.keys(data[0]).filter(function (key) { return (key !== "State") && !(key.includes("__labelClass")) && (key !== "__sampleSize") && !(key.includes("__nullIdentifier")) && !(key.includes("__change")) && (key != "__lowSampleSize"); });
    data.forEach(function (d) {
        d.ages = ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"], change: d[name + "__change"] }; });
    });
    var cummul_width = 0, flag = 0;
    ageNames.forEach(function (d, i) {
        cummul_width = cummul_width + ageNames[i].length * 8;
    });
    if (cummul_width > width) { flag = 1; }
    y0.domain((data.map(function (d) { return d.State; })).reverse());
    var temp_ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    y1.domain(temp_ageNames).rangeRoundBands([0, y0.rangeBand()]);
    data.forEach(function (d) {
        d.ages = temp_ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"] }; });
    });
    var temp_data = data.filter(function (d) { return d.sampleSize < 30 ? false : true; });
    if (data.length != 0) {
        x.domain([0, d3.max(temp_data, function (d) { return d3.max(d.ages, function (d) { return d.value; }); })]);
    } else {
        x.domain([0, 0]);
    }
    //
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis)
        .selectAll("text").style("fill", "transparent");

    svg.append("g")
        .attr("class", "y axis textSmall")
        .style("fill", "black")
        .style("stroke", "black")
        .style("stroke-width", "0")
        .call(yAxis).selectAll("text").text(function (d) {
            return d;
        });
    //
    var gap = 6;
    var wdt = y1.rangeBand(), xShift = 10;
    //
    createLegends(ageNames, svg, t_colorColumnStart, t_colorColumnStop);
    ageNames = ageNames.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == (-1)); });
    data.forEach(function (d) {
        d.ages = ageNames.map(function (name) { return { name: name, value: +d[name], labelClass: d[name + "__labelClass"], change: d[name + "__change"] }; });
    });
    //Add attribute name to each individual metrics
    data = $(data).each(function (i, d) {
        $(d.ages).each(function (i, c) {
            c["groupName"] = d.State;
            //c["change"] = " (1.1)";
        });
    });
    var state = svg.selectAll(".state")
        .data(data)
      .enter().append("g")
        .attr("class", function (d) { return "state " + d.__lowSampleSize; })
        .attr("transform", function (d) { return "translate(0," + y0(d.State) + ")"; });
    height = height - 10;
    var cummul_width = 0;
    state.selectAll("rect")
        .data(function (d) { return d.ages; })
      .enter().append("rect")
        .attr("height", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("y", function (d) { return y1(d.name); })
        .attr("x", function (d) { return xShift; })
        .attr("width", function (d) { return (x(d.value) + xShift) < 0 ? 0 : (x(d.value) + xShift); })
        .style("stroke", function (d, i) { return t_colorColumnStop[i] })
        .style("stroke-width", "0")
        .style("fill", "none");
    /*BEGIN White stroke rectangle*/
    state.selectAll("rectF")
        .data(function (d) { return d.ages; })
      .enter().append("rect")
        .attr("height", (wdt - gap) < 0 ? 0 : (wdt - gap))
        .attr("y", function (d) { return y1(d.name); })
        .attr("x", function (d) { return xShift; })
        .attr("width", function (d, i) {
            var context = d3.select(this.parentNode);
            /*Text above circle*/
            context.append("text")
                .attr("y", y1(d.name) + (wdt) / 2)
                .attr("x", x(d.value) + xShift + 15)
                .text(function () {
                    return (Math.round(d.value * 100) / 100).toFixed(1) + "%" + d.change;
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("text-anchor", "start")
                .style("fill", d.labelClass)
                .on("mousemove", function () {
                    div.transition()
                    .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + d.change + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
                   .style("opacity", 0);
                });
            /*Text above circle*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("height", wdt + 4 - gap)
                        .attr("y", y1(d.name) - 2)
                        .attr("x", 5)
                        .attr("width", 2)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + d.change + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Rectangular Plot at bottom*/
            /*Horizontal Line*/
            context.append("rect")
                        .attr("height", 1)
                        .attr("y", y1(d.name) + (wdt - gap) / 2)
                        .attr("x", xShift)
                        .attr("width", x(d.value) < 0 ? 0 : x(d.value))
                        .style("opacity", 0.4)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + d.change + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Horizontal Line*/
            /*Vertical Line*/
            context.append("rect")
                        .attr("height", wdt - gap)
                        .attr("y", y1(d.name))
                        .attr("x", x(d.value) + xShift)
                        .attr("width", 3)
                        .style("fill", t_colorColumnStop[i])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + d.change + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Vertical Line*/

            return (x(d.value)) < 0 ? 0 : (x(d.value));
        })
        .style("fill", function (d, i) {
            var C = svg.append("defs")
            .append("linearGradient")
            .attr("id", "C" + i)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            C.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", t_colorColumnStart[i]);
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[i]);
            return "url(#C" + i + ")";
        })
        .on("mousemove", function (d, i) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + ageNames[i] + "</span><br/><span>" + d.groupName + "</span><br/><span style='color:" + d.labelClass + "'>" + d.value.toFixed(1) + '%' + d.change + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });
    /*END White stroke rectangle*/
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 210);
    //$(".y.axis .tick text").css("transform", "translateY(-5px)");
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    $(".domain").css("fill", "transparent");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function barChart(data) {
    $("#chart-visualisation").html('');
    $(".tbl-emptyrow").css("display", "none");
    current_data_for_chart = data;
    current_function_for_chart = "barChart";
    var data = prepareDataForBarChart(data);
    var xData = [data[0].__legendName];
    var NoOfEle = data.length, leftFix = 0;
    var margin_top_val = 0;
    //if (NoOfEle > 5 && NoOfEle < 11) {
    //    NoOfEle = NoOfEle + 3;
    //}
    //if (NoOfEle < 6) {
    //    $("#chart-visualisation").css("overflow-y", "hidden");
    //    NoOfEle = $("#chart-visualisation").height() / 50;
    //} else {
    //    $("#chart-visualisation").css("overflow-y", "auto");
    //}
    $("#chart-visualisation").css("overflow", "hidden");
    var margin = { top: 5, right: 90, bottom: 5, left: 210 },
            width = $("#chart-visualisation").width() - margin.left - margin.right,
            height = $("#chart-visualisation").height() - margin.top - margin.bottom; //50 * NoOfEle
    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], NoOfEle == 1? 0.05:0.2);

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10, "%");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    /*Color*/
    var C = svg.append("defs")
    .append("linearGradient")
    .attr("id", "C")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    C.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorColumnStart[0]);
    C.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorColumnStart[0]);
    /*Color*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    x.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);
    y.domain(data.map(function (d) {
        return d.letter;
    }));
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 180);
    var width_bar = y.rangeBand()-10, cummul_width=0;
    var center_fix = y.rangeBand() / 2 - width_bar / 2;
    var intnl_margin = 8;
    var x_factor = 8;
    var x_shift = 100;
    var radius = 10, startAngle = (0 * (Math.PI / 180)),
    endAngle = (-180 * (Math.PI / 180));
    createLegends(xData,svg, t_colorColumnStart,t_colorColumnStart);
    if (legend_filter_list.length == 1) { data = []; }
    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function (d) { return "bar " + d.__lowSampleSize; })
        .on("mousemove", function (d) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });

    bars.attr("y", function (d) {
        return y(d.letter) + center_fix;
    })
        .attr("height", width_bar)
        .attr("x", 8)//function(d) {
            //return x(d.frequency);
        //})
        .attr("width", function (d) {
            return x(d.frequency)-8;
        })
        .attr("id", function (d, i) {
            var context = d3.select(this.parentNode);
            ///*Dashed Line*/
            //context.append("line")
            //    .attr("x1", x(d.frequency) + intnl_margin + x_factor)
            //    .attr("y1", y(d.letter) + y.rangeBand() / 2)
            //    .attr("x2", width + radius + intnl_margin + x_factor + x_shift)
            //    .attr("y2", y(d.letter) + y.rangeBand() / 2)
            //    .style("stroke-dasharray", ("3, 3"))
            //    .style("stroke-opacity", 0.5)
            //    .style("stroke", "black");
            ///*Dashed Line*/
            ///*Upper Circle*/
            //var cx = width + 2 * radius + intnl_margin + x_factor;
            //var cy = y(d.letter) + (y.rangeBand() / 2);
            //var arc = d3.svg.arc()
            //    .innerRadius(radius)
            //    .outerRadius(radius)
            //    .startAngle(startAngle)
            //    .endAngle(endAngle)

            //context.append("path")
            //    .attr("d", arc)
            //    .attr("transform", "translate(" + (cx + x_shift) + "," + cy + ")")
            //    .style("fill", "none")
            //    .style("stroke-dasharray", ("3, 3"))
            //    .style("stroke-opacity", 0.5)
            //    .style("stroke", "black");
            ///*Upper Circle*/
            /*Text above circle*/
            context.append("text")
                .attr("x", x(d.frequency) + 7)
                .attr("class", d.__lowSampleSize)
                .attr("y", y(d.letter) + (y.rangeBand() / 2) + 4)
                .attr("text-anchor", "start")
                .text(function () {
                    return ((d.frequency == null || d.frequency == undefined) ? "" : (d.frequency).toFixed(1) + '%');
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("fill", d.__labelClass)
                .on("mousemove", function () {
                    div.transition()
                        .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
               .style("opacity", 0);
                });
            /*Text above circle*/
            ///*Rectangular Points*/
            //context.append("rect")
            //            .attr("width", 5)
            //            .attr("x", intnl_margin)
            //            .attr("y", y(d.letter) - 5 + center_fix)
            //            .attr("height", 4)
            //            .style("fill", colorColumnStop[0]);
            //context.append("rect")
            //            .attr("width", 5)
            //            .attr("x", intnl_margin)
            //            .attr("y", y(d.letter) + width_bar + 1 + center_fix)
            //            .attr("height", 4)
            //            .style("fill", colorColumnStop[0]);
            ///*Rectangular Points*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("width", 2)
                        .attr("x", 4)
                        .attr("y", y(d.letter) - 7 + center_fix)
                        .attr("height", width_bar + 14)
                        .style("fill", colorColumnStart[0]);
            /*Rectangular Plot at bottom*/
            ///*Boundary Lines*/
            //context.append("line")
            //    .attr("x1", intnl_margin)
            //    .attr("y1", y(d.letter) - 4 + center_fix)
            //    .attr("x2", x(d.frequency) + intnl_margin + x_factor)
            //    .attr("y2", y(d.letter) - 4 + center_fix)
            //    .style("stroke", colorColumnStop[0])
            //    .on("mousemove", function () {
            //        div.transition()
            //        .duration(0)
            //        .style("opacity", 1);
            //        div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //        .style("left", (d3.event.pageX) + "px")
            //        .style("top", (d3.event.pageY - 28) + "px");
            //    }).on("mouseout", function () {
            //        div.transition()
            //       .duration(0)
            //       .style("opacity", 0);
            //    });
            //context.append("line")
            //    .attr("x1", intnl_margin)
            //    .attr("y1", y(d.letter) + (width_bar) + 4 + center_fix)
            //    .attr("x2", x(d.frequency) + intnl_margin + x_factor)
            //    .attr("y2", y(d.letter) + (width_bar) + 4 + center_fix)
            //    .style("stroke", colorColumnStop[0])
            //    .on("mousemove", function () {
            //        div.transition()
            //        .duration(0)
            //        .style("opacity", 1);
            //        div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //        .style("left", (d3.event.pageX) + "px")
            //        .style("top", (d3.event.pageY - 28) + "px");
            //    }).on("mouseout", function () {
            //        div.transition()
            //       .duration(0)
            //       .style("opacity", 0);
            //    });
            //context.append("line")
            //    .attr("x1", x(d.frequency) + intnl_margin + x_factor)
            //    .attr("y1", y(d.letter) - 4 + center_fix)
            //    .attr("x2", x(d.frequency) + intnl_margin + x_factor)
            //    .attr("y2", y(d.letter) + (width_bar) + 4 + center_fix)
            //    .style("stroke", colorColumnStop[0])
            //    .on("mousemove", function () {
            //        div.transition()
            //        .duration(0)
            //        .style("opacity", 1);
            //        div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //        .style("left", (d3.event.pageX) + "px")
            //        .style("top", (d3.event.pageY - 28) + "px");
            //    }).on("mouseout", function () {
            //        div.transition()
            //       .duration(0)
            //       .style("opacity", 0);
            //    });
            ///*Boundary Lines*/
            ///*Lines*/
            //var hgh = Math.floor(x(d.frequency)) / 6;
            //for (var i = 0; i < hgh; i++) {
            //    context.append("line")
            //        .attr("x1", intnl_margin + i * 6)
            //        .attr("y1", y(d.letter) + 4 + center_fix)
            //        .attr("x2", intnl_margin + i * 6)
            //        .attr("y2", y(d.letter) + (width_bar) - 4 + center_fix)
            //        .style("opacity", 0.5)
            //        .style("stroke", "black");
            //}
            ///*Lines*/
            ///*Gradient Rectangle*/
            //context.append("rect")
            //            .attr("width", x(d.frequency))
            //            .attr("x", intnl_margin)
            //            .attr("y", y(d.letter) + center_fix)
            //            .attr("height", width_bar / 2)
            //            .style("fill", "url(#gradient)")
            //            .on("mousemove", function () {
            //                div.transition()
            //                .duration(0)
            //                .style("opacity", 1);
            //                div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //                .style("left", (d3.event.pageX) + "px")
            //                .style("top", (d3.event.pageY - 28) + "px");
            //            }).on("mouseout", function () {
            //                div.transition()
            //               .duration(0)
            //               .style("opacity", 0);
            //            });
            ///*Gradient Rectangle*/
            /*Vertical Line*/
            context.append("rect")
                .attr("width", 3)
                .attr("class", d.__lowSampleSize)
                .attr("x", intnl_margin+x(d.frequency) -8)
                .attr("y", y(d.letter) + center_fix)
                .attr("height", width_bar)
                .style("fill", (d.frequency == undefined || d.frequency == null) ? "none" : colorColumnStop[0])
                .on("mousemove", function () {
                        div.transition()
                            .duration(0)
                        .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
                        .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                        .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                       .style("opacity", 0);
                        });
            /*Vertical Line*/
            /*Horizontal Line*/
            context.append("rect")
                .attr("class", d.__lowSampleSize)
                .attr("width", x(d.frequency)-8)
                .attr("x", intnl_margin )
                .attr("y", y(d.letter) + center_fix + width_bar / 2)
                .attr("height", 1)
                .style("fill", colorColumnStop[0])
                .style("opacity", 0.4)
                .on("mousemove", function () {
                    div.transition()
                        .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
               .style("opacity", 0);
                });
            /*Horizontal Line*/
            return i;
        })
        .style("fill", function (d, i) {
            return "url(#C)";
        });

    bars.append("title")
        .text(function (d) {
            return d.letter;
        });

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    $(".domain").css("fill", "transparent");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function barChartWithChange(data) {
    $("#chart-visualisation").html('');
    $(".tbl-emptyrow").css("display", "none");
    current_data_for_chart = data;
    current_function_for_chart = "barChartWithChange";
    var data = prepareDataForBarChartWithChange(data);
    var xData = [data[0].__legendName];
    var NoOfEle = data.length, leftFix = 0;
    var margin_top_val = 0;
    $("#chart-visualisation").css("overflow", "hidden");
    var margin = { top: 5, right: 100, bottom: 5, left: 210 },
            width = $("#chart-visualisation").width() - margin.left - margin.right,
            height = $("#chart-visualisation").height() - margin.top - margin.bottom; //50 * NoOfEle
    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], NoOfEle == 1 ? 0.05 : 0.2);

    var x = d3.scale.linear()
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(10, "%");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    /*Color*/
    var C = svg.append("defs")
    .append("linearGradient")
    .attr("id", "C")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    C.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorColumnStart[0]);
    C.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorColumnStart[0]);
    /*Color*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    x.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);
    y.domain(data.map(function (d) {
        return d.letter;
    }));
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 180);
    var width_bar = y.rangeBand() - 10, cummul_width = 0;
    var center_fix = y.rangeBand() / 2 - width_bar / 2;
    var intnl_margin = 8;
    var x_factor = 8;
    var x_shift = 100;
    var radius = 10, startAngle = (0 * (Math.PI / 180)),
    endAngle = (-180 * (Math.PI / 180));
    createLegends(xData, svg, t_colorColumnStart, t_colorColumnStart);
    if (legend_filter_list.length == 1) { data = []; }
    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function (d) { return "bar " + d.__lowSampleSize; })
        .on("mousemove", function (d) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + d.__change + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });

    bars.attr("y", function (d) {
        return y(d.letter) + center_fix;
    })
        .attr("height", width_bar)
        .attr("x", 8)
        .attr("width", function (d) {
            return x(d.frequency) - 8;
        })
        .attr("id", function (d, i) {
            var context = d3.select(this.parentNode);
            /*Text above circle*/
            context.append("text")
                .attr("x", x(d.frequency) + 7)
                .attr("class", d.__lowSampleSize)
                .attr("y", y(d.letter) + (y.rangeBand() / 2) + 4)
                .attr("text-anchor", "start")
                .text(function () {
                    return ((d.frequency == null || d.frequency == undefined) ? "" : (d.frequency).toFixed(1) + '%' +  d.__change);
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("fill", d.__labelClass)
                .on("mousemove", function () {
                    div.transition()
                        .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + d.__change + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
               .style("opacity", 0);
                });
            /*Text above circle*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("width", 2)
                        .attr("x", 4)
                        .attr("y", y(d.letter) - 7 + center_fix)
                        .attr("height", width_bar + 14)
                        .style("fill", colorColumnStart[0]);
            /*Rectangular Plot at bottom*/
            /*Vertical Line*/
            context.append("rect")
                .attr("width", 3)
                .attr("class", d.__lowSampleSize)
                .attr("x", intnl_margin + x(d.frequency) - 8)
                .attr("y", y(d.letter) + center_fix)
                .attr("height", width_bar)
                .style("fill", (d.frequency == undefined || d.frequency == null) ? "none" : colorColumnStop[0])
                .on("mousemove", function () {
                    div.transition()
                        .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + d.__change + "</span>")
                        .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                        .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
               .style("opacity", 0);
                });
            /*Vertical Line*/
            /*Horizontal Line*/
            context.append("rect")
                .attr("class", d.__lowSampleSize)
                .attr("width", x(d.frequency) - 8)
                .attr("x", intnl_margin)
                .attr("y", y(d.letter) + center_fix + width_bar / 2)
                .attr("height", 1)
                .style("fill", colorColumnStop[0])
                .style("opacity", 0.4)
                .on("mousemove", function () {
                    div.transition()
                        .duration(0)
                    .style("opacity", 1);
                    div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + d.__change + "</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 55) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
               .style("opacity", 0);
                });
            /*Horizontal Line*/
            return i;
        })
        .style("fill", function (d, i) {
            return "url(#C)";
        });

    bars.append("title")
        .text(function (d) {
            return d.letter;
        });

    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    $(".domain").css("fill", "transparent");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function columnChart(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "columnChart";
    var data = prepareDataForBarChart(data);
    var _maxValInd = 0, _maxVal = data[0].letter.length;
    for (var i = 1; i < data.length; i++) {
        if (data[i].letter.length > _maxVal) {
            _maxValInd = i;
            _maxVal = data[i].letter.length;
        }
    }
    var xData = [data[0].__legendName];
    var NoOfEle = data.length, leftFix = 0;
    var margin_top_val = 0;
    var NoOfEle = data.length;
    //if (NoOfEle < 10) {
    //    NoOfEle = (2 + NoOfEle);
    //}
    if (NoOfEle < 13) {
        NoOfEle = $("#chart-visualisation").width() / 110;
        $("#chart-visualisation").css("overflow-x", "hidden");
    } else {
        //$("#chart-visualisation").css("overflow-x", "auto");
    }
    $("#chart-visualisation").css("overflow-y", "hidden");
    $(".tbl-emptyrow").css("display", "none");
    var margin = { top: 40, right: 10, bottom: 50, left: 10 },
            width = $("#chart-visualisation").width() - margin.left - margin.right,//110 * NoOfEle
            height = $("#chart-visualisation").height() - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], NoOfEle == 1 ? 0 : 0.2);
    
    var y = d3.scale.linear()
        .range([0, height]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });    
    x.domain(data.map(function (d) {
        return d.letter;
    }));
    //Update the bottom, height and svg height    
    var btm = horizontalWrapCount(data[_maxValInd].letter, x.rangeBand());
    if (btm > 2) {
        margin.bottom = margin.bottom + (13 * (btm - 2));
        height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    }
    y = d3.scale.linear()
        .range([0, height]);
    y.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);
    var svg = d3.select("#chart-visualisation").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    /*Color*/
    var C = svg.append("defs")
    .append("linearGradient")
    .attr("id", "C")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    C.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorColumnStart[0]);
    C.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorColumnStart[0]);
    /*Color*/
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height) + ")")
        .call(xAxis);
    svg.selectAll(".x.axis .tick text").call(horizontalWrap, x.rangeBand());
    svg.selectAll(".x.axis .tick tspan").attr("y","16").attr("x","-10");
    var width_bar = x.rangeBand(), cummul_width=0;
    var center_fix = x.rangeBand() / 2 - width_bar / 2;
    var intnl_margin = 3;
    var x_factor = 8;
    var radius = 20, startAngle = (-90 * (Math.PI / 180)),
    endAngle = (-270 * (Math.PI / 180));
    createLegends(xData,svg, t_colorColumnStart, t_colorColumnStart);
    if(legend_filter_list.length==1){data = [];}
    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function (d) { return "bar " + d.__lowSampleSize; })
        .on("mousemove", function (d) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });
    bars.attr("x", function (d) {
        return x(d.letter) + center_fix;
    })
        .attr("width", width_bar)
        .attr("y", function (d) {
            return height - y(d.frequency) - intnl_margin;
        })
        .attr("height", function (d) {
            return y(d.frequency);
        })
        .attr("id", function (d, i) {
            var context = d3.select(this.parentNode);
            ///*Dashed Line*/
            //context.append("line")
            //    .attr("y1", height - (y(d.frequency) + intnl_margin + x_factor))
            //    .attr("x1", x(d.letter) + x.rangeBand() / 2)
            //    .attr("y2", -(2 * radius + x_factor + intnl_margin) - intnl_margin)
            //    .attr("x2", x(d.letter) + x.rangeBand() / 2)
            //    .style("stroke-dasharray", ("3, 3"))
            //    .style("stroke-opacity", 0.5)
            //    .style("stroke", "black");
            ///*Dashed Line*/
            ///*Upper Circle*/
            var cy = -(2 * radius + x_factor + intnl_margin);
            var cx = x(d.letter) + (x.rangeBand() / 2);
            //var arc = d3.svg.arc()
            //    .innerRadius(radius)
            //    .outerRadius(radius)
            //    .startAngle(startAngle)
            //    .endAngle(endAngle)

            //context.append("path")
            //    .attr("d", arc)
            //    .attr("transform", "translate(" + cx + "," + (cy - radius - intnl_margin) + ")")
            //    .style("fill", "none")
            //    .style("stroke-dasharray", ("3, 3"))
            //    .style("stroke-opacity", 0.5)
            //    .style("stroke", "black");
            ///*Upper Circle*/
            /*Text above circle*/
            context.append("text")
                //.attr("y", cy - radius + intnl_margin - 7)
                .attr("y", height - (y(d.frequency)) - intnl_margin - 5)
                .attr("x", x(d.letter) + (x.rangeBand() / 2))
                .attr("text-anchor", "middle")
                .attr("class", d.__lowSampleSize)
                .text(function () {
                    return ((d.frequency==null||d.frequency==undefined)?"": (d.frequency).toFixed(1)+'%');
                })
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("fill", d.__labelClass)
                .on("mousemove", function () {
                    div.transition()
                    .duration(0)
                    .style("opacity", 1);
                    div.html("<span>"+d.__legendName+"</span><br/><span>"+d.letter + "</span><br/><span style='color:"+d.__labelClass+"'>" + d.frequency.toFixed(1) + '%'+"</span>")
                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                    .style("top", (d3.event.pageY - 35) + "px");
                }).on("mouseout", function () {
                    div.transition()
                   .duration(0)
                   .style("opacity", 0);
                });
            /*Text above circle*/
            ///*Rectangular Points*/
            //context.append("rect")
            //            .attr("height", 5)
            //            .attr("y", height - intnl_margin)
            //            .attr("x", x(d.letter) - 5 + center_fix)
            //            .attr("width", 4)
            //            .style("fill", colorColumnStop[0]);
            //context.append("rect")
            //            .attr("height", 5)
            //            .attr("y", height - intnl_margin)
            //            .attr("x", x(d.letter) + width_bar + 1 + center_fix)
            //            .attr("width", 4)
            //            .style("fill", colorColumnStop[0]);
            ///*Rectangular Points*/
            /*Rectangular Plot at bottom*/
            context.append("rect")
                        .attr("height", 2)
                        .attr("y", height - 1)
                        .attr("x", x(d.letter) - 7 + center_fix)
                        .attr("width", width_bar + 14)
                        .style("fill", colorColumnStart[0]);
            /*Rectangular Plot at bottom*/
            ///*Boundary Lines*/
            //context.append("line")
            //    .attr("y1", height - intnl_margin)
            //    .attr("x1", x(d.letter) - 4 + center_fix)
            //    .attr("y2", height - (y(d.frequency) + intnl_margin + x_factor))
            //    .attr("x2", x(d.letter) - 4 + center_fix)
            //    .style("stroke", colorColumnStop[0]);
            //context.append("line")
            //    .attr("y1", height - intnl_margin)
            //    .attr("x1", x(d.letter) + (width_bar) + 4 + center_fix)
            //    .attr("y2", height - (y(d.frequency) + intnl_margin + x_factor))
            //    .attr("x2", x(d.letter) + (width_bar) + 4 + center_fix)
            //    .style("stroke", colorColumnStop[0]);
            //context.append("line")
            //    .attr("y1", height - (y(d.frequency) + intnl_margin + x_factor))
            //    .attr("x1", x(d.letter) - 4 + center_fix)
            //    .attr("y2", height - (y(d.frequency) + intnl_margin + x_factor))
            //    .attr("x2", x(d.letter) + (width_bar) + 4 + center_fix)
            //    .style("stroke", colorColumnStop[0]);
            ///*Boundary Lines*/
            ///*Lines*/
            //var hgh = Math.floor(y(d.frequency)) / 6;
            //for (var i = 0; i < hgh; i++) {
            //    context.append("line")
            //        .attr("y1", height - (intnl_margin + i * 6))
            //        .attr("x1", x(d.letter) + 4 + center_fix)
            //        .attr("y2", height - (intnl_margin + i * 6))
            //        .attr("x2", x(d.letter) + (width_bar) - 4 + center_fix)
            //        .style("opacity", 0.5)
            //        .style("stroke", "black")
            //        .on("mousemove", function () {
            //            div.transition()
            //            .duration(0)
            //            .style("opacity", 1);
            //            div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //            .style("left", (d3.event.pageX) + "px")
            //            .style("top", (d3.event.pageY - 28) + "px");
            //        }).on("mouseout", function () {
            //            div.transition()
            //           .duration(0)
            //           .style("opacity", 0);
            //        });
            //}
            ///*Lines*/
            ///*Gradient Rectangle*/
            //context.append("rect")
            //            .attr("height", y(d.frequency)+intnl_margin/2+1)
            //            .attr("y", height - (y(d.frequency)) - intnl_margin)
            //            .attr("x", x(d.letter) + center_fix)
            //            .attr("width", width_bar / 2)
            //            .style("fill", "url(#gradient)")
            //            .on("mousemove", function () {
            //                div.transition()
            //                .duration(0)
            //                .style("opacity", 1);
            //                div.html(d.letter + "<br/>" + d.frequency.toFixed(1) + '%')
            //                .style("left", (d3.event.pageX) + "px")
            //                .style("top", (d3.event.pageY - 28) + "px");
            //            }).on("mouseout", function () {
            //                div.transition()
            //               .duration(0)
            //               .style("opacity", 0);
            //            });
            ///*Gradient Rectangle*/
            /*Horizontal top Line*/
            context.append("rect")
                        .attr("height", 3)
                        .attr("class", d.__lowSampleSize)
                        .attr("y", height - (y(d.frequency)) - intnl_margin)
                        .attr("x", x(d.letter) + center_fix)
                        .attr("width", width_bar)
                        .style("fill", (d.frequency == undefined || d.frequency == null) ? "none" : colorColumnStop[0])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 35) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Horizontal top Line*/
            /*Vertical Line*/
            context.append("rect")
                        .attr("height", y(d.frequency))
                        .attr("class", d.__lowSampleSize)
                        .attr("y", height - (y(d.frequency)) - intnl_margin)
                        .attr("x", x(d.letter) + center_fix + width_bar/2)
                        .attr("width", 1)
                        .style("fill", colorColumnStop[0])
                        .style("opacity", 0.4)
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() /2  + "px")
                            .style("top", (d3.event.pageY - 35) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
            /*Vertical Line*/
            return i;
        })
        .style("fill", function (d, i) {
            return "url(#C)";
        })
        .on("mousemove", function (d) {
            div.transition()
            .duration(0)
            .style("opacity", 1);
            div.html("<span>" + d.__legendName + "</span><br/><span>" + d.letter + "</span><br/><span style='color:" + d.__labelClass + "'>" + d.frequency.toFixed(1) + '%' + "</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 55) + "px");
        }).on("mouseout", function () {
            div.transition()
           .duration(0)
           .style("opacity", 0);
        });

    bars.append("title")
        .text(function (d) {
            return d.letter;
        });
    function type(d) {
        d.frequency = +d.frequency;
        return d;
    }
    $(".domain").css("display", "none");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function fullcolumnChartStacked(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "fullcolumnChartStacked";
    data = preparefullcolumnChartStackedData(data);
    ///////////////////converting to 100% stack/////////////////////////
    var temp, i, j, k;
    var total = [], xData = [], perData = [];
    for (var i = 0; i < data.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < Object.keys(data[0]).length; i++) {
        temp = Object.keys(data[0])[i];
        if (temp != "month" && temp != "__sampleSize" && !temp.includes("__labelClass") && !temp.includes("__nullIdentifier") && temp != "__lowSampleSize") {
            xData.push(temp);
        }
    }

    var dataIntermediate = xData.map(function (c,i) {
        return data.map(function (d) {
            return { x: d.month + "\n(" + d.__sampleSize + ")", y: +d[c], original_val: +d[c], index: +i, nullIdentifier: d[c + "__nullIdentifier"], lowSampleSize: d.__lowSampleSize, statColor: d[c + "__labelClass"] };
        });
    });
    var _maxValInd = 0, _maxVal = dataIntermediate[0][0].x.length;
    for (var i = 1; i < dataIntermediate[0].length; i++) {
        if (dataIntermediate[0][i].x.length > _maxVal) {
            _maxValInd = i;
            _maxVal = dataIntermediate[0][i].x.length;
        }
    }
    var NoOfEle = data.length;
    if (NoOfEle < 10) {
        NoOfEle = (2 + NoOfEle);
    }
    $(".tbl-emptyrow").css("display", "none");
    if (NoOfEle < 15) {
        NoOfEle = $("#chart-visualisation").width() / 80;
        $("#chart-visualisation").css("overflow", "hidden");
    } else {
        $("#chart-visualisation").css("overflow-x", "auto");
        $("#chart-visualisation").css("overflow-y", "hidden");
    }
    var margin = { top: 20, right: 10, bottom: 80, left: 10 },
            width = $("#chart-visualisation").width() - margin.left - margin.right, //80 * NoOfEle
            height = $("#chart-visualisation").height() - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .15);
    var y = d3.scale.linear()
            .rangeRound([height, 0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var dataStackLayout = d3.layout.stack()(dataIntermediate);
    //dataStackLayout = d3.layout.stack()(dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); }));
    x.domain(dataStackLayout[0].map(function (d) {
        return d.x;
    }));
    dataIntermediate = dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    //ReCalculate the 100% stacked values
    for (var i = 0; i < dataIntermediate.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < dataIntermediate.length; i++) {
        for (j = 0; j < dataIntermediate[i].length; j++) {
            var temp = dataIntermediate[i][j].original_val;
            total[j] = total[j] + temp;
        }
    }
    for (i = 0; i < dataIntermediate.length; i++) {
        for (k = 0; k < dataIntermediate[i].length; k++) {
            temp = dataIntermediate[i][k].original_val;
            dataIntermediate[i][k].y = total[k] == 0 ? 0 : ((temp * 100) / total[k]);
        }
    }
    dataStackLayout = d3.layout.stack()(dataIntermediate);
    //Update the bottom, height and svg height   
    var btm = horizontalWrapCount(dataIntermediate[0][_maxValInd].x, x.rangeBand());
    if (btm > 2) {
        margin.bottom = margin.bottom + (13 * (btm - 2));
        height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    }
    y = d3.scale.linear()
            .rangeRound([height, 0]);
    if (dataStackLayout.length != 0) {
        y.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                function (d) { return d.y0 + d.y; })
        ]);
    } else {
        y.domain([0, 0]);
    }
    var svg = d3.select("#chart-visualisation").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    
    
    createLegends(xData, svg, t_colorColumnStart, t_colorColumnStart);
    var lineGap = 0, colorIndex = 0, intnl_margin = 4, wdt = x.rangeBand() - 5, posFix = x.rangeBand() / 2 - wdt / 2, cummul_width = 0;
    var label_h = 15, label_w = 35;
    var layer = svg.selectAll(".stack")
            .data(dataStackLayout)
            .enter().append("g")
            .attr("class", "stack")
            .style("fill", function (d, i) {
                var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C" + i)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
                C.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", t_colorColumnStart[i]);
                C.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", t_colorColumnStart[i]);
                return "url(#C" + i + ")";
            });
    /////
    layer.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", function (d) { return "inner_rect " + d.lowSampleSize; })
            .attr("x", function (d) {
                return x(d.x) + lineGap + posFix;
            })
            .attr("y", function (d) {
                return y(d.y + d.y0) + lineGap - 5;
            })
            .attr("height", function (d, i) {
                var context = d3.select(this.parentNode);
                /*Bottom Rect*/
                if (Math.floor(colorIndex / data.length) == 0) {
                    context.append("rect")
                            .attr("width", wdt + 16)
                            .attr("class", "outer_rect")
                            .attr("x", x(d.x) + posFix - 8)
                            .attr("y", height-2)
                            .attr("height", 3)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", "#676767")
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html(xData[d.index] + "<br/>" + (d.original_val).toFixed(1) + '%')
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
                }
                /*Bottom Rect*/
                /*Vertical Line*/
                context.append("rect")
                            .attr("width", 1)
                            .attr("class", "outer_rect " + d.lowSampleSize)
                            .attr("x", x(d.x) + posFix +wdt/2)
                            .attr("y", y(d.y + d.y0) - 5)
                            .attr("height", (y(d.y0) - y(d.y + d.y0) - 2 * lineGap))
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
                /*Vertical Line*/
                /*Horizontal rectangle*/
                context.append("rect")
                            .attr("width", wdt)
                            .attr("class", "outer_rect " + d.lowSampleSize)
                            .attr("x", x(d.x) + posFix)
                            .attr("y", y(d.y + d.y0) - 5)
                            .attr("height", 0)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", "#eee")
                        .on("mousemove", function () {
                            div.transition()
                            .duration(0)
                            .style("opacity", 1);
                            div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                            .style("top", (d3.event.pageY - 55) + "px");
                        }).on("mouseout", function () {
                            div.transition()
                           .duration(0)
                           .style("opacity", 0);
                        });
                colorIndex = colorIndex + 1;
                /*Horizontal rectangle*/
                /*Data Label*/
                context.append("rect")
                            .attr("class", d.nullIdentifier +" "+d.lowSampleSize)
                            .attr("width", label_w)
                            .attr("x", x(d.x) + posFix + wdt / 2 - label_w / 2)
                            .attr("y", y(d.y + d.y0) + (y(d.y0) - y(d.y + d.y0)) / 2 - label_h / 2 - 5)
                            .attr("height", label_h)
                            .style("fill", d.original_val == undefined || d.original_val == null ? "transparent" : "rgba(255, 255, 255, 0.7)")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() /2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                context.append("text")
                            .attr("class", d.nullIdentifier + " " + d.lowSampleSize)
                            .attr("x", x(d.x) + posFix + wdt / 2 - label_w / 2 + label_h + 2)
                            .attr("y", y(d.y + d.y0) + (y(d.y0) - y(d.y + d.y0)) / 2 - label_h / 2 + label_h - 9)
                            .text(d.original_val == undefined || d.original_val == null ? "" : d.original_val.toFixed(1) + "%")
                            .style("fill", d.statColor)
                            .style("text-anchor", "middle")
                            .style("font-size", "8px")
                            .style("font-weight", "bold")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Data Label*/
                return (y(d.y0) - y(d.y + d.y0) - 2 * lineGap) < 0 ? 0 : (y(d.y0) - y(d.y + d.y0) - 2 * lineGap);
            })
            .attr("width", (wdt - 2 * lineGap)<0?0:(wdt-2*lineGap))
            .on("mousemove", function (d) {
                div.transition()
                .duration(0)
                .style("opacity", 1);
                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                .style("top", (d3.event.pageY - 55) + "px");
            }).on("mouseout", function () {
                div.transition()
               .duration(0)
               .style("opacity", 0);
            });
    colorIndex = 0;
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    d3.selectAll(".x.axis path").style("fill", "none").style("stroke", "#000").style("stroke-width", 1).style("opacity", 0);
    svg.selectAll(".x.axis .tick text").call(horizontalWrap, x.rangeBand());
    svg.selectAll(".x.axis .tick tspan").attr("y", "16");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function Pyramid_Chart(data, isChange) {
    $("#legend_div").remove();
    var c_text = $(".table-stat.activestat").text().trim().toUpperCase() == "CUSTOM BASE" ? $(".stat-cust-estabmt.stat-cust-active").text().toUpperCase().trim() : "";
    var list = {
        "BrandList": [], "MetricList": [],
        "ValueData": [],
        "SignificanceData": [],
        "ChangeData": [],
        "SampleSize": []
    };
    data.forEach(function (d, i) {
        list.BrandList.push(d.name);
        list.SampleSize.push("" + (d.SeriesSampleSize == null || d.SeriesSampleSize == undefined ? "NA" : d.SeriesSampleSize) + "");
        d.data.forEach(function (e, j) {
            if (i == 0) {
                list.MetricList.push(e.x);
                list.ValueData.push([]);
                list.ChangeData.push([]);
                list.SignificanceData.push([]);
            }
            list.ValueData[j].push(e.y);
            list.SignificanceData[j].push(e.StatValue);
            if (isChange) {
                list.ChangeData[j].push("|" + (e.change == null || e.change == undefined ? "NA" : e.change.toFixed(1)));
            } else {
                list.ChangeData[j].push("");
            }
        });
    });
    //var list = {
    //    "BrandList": ["One", "Two", "Three", "Four", "Five"], "MetricList": ["Male", "Female"],
    //    "ValueData": [[10, 20, 30, 40, 50], [50, 60, 80, 90, 100]],
    //    "SignificanceData": [[-1, 1, 0, 0, 0], [0, -1, 1, 0, 0]],
    //    "ChangeData": [["NA", "NA", "NA", "NA", "NA"], ["NA", "NA", "NA", "NA", "NA"]],
    //    "SampleSize": ["200", "300", "400", "500", "600"]
    //};
    var id = "#chart-visualisation";
    $("#chart-visualisation").html('');
    $("#chart-visualisation").css('width', '100%');
    $("#chart-visualisation").css('height', '89%');
    current_data_for_chart = data;
    current_function_for_chart = "Pyramid_Chart";
    d3.select(id).select("svg").selectAll("*").remove();
    d3.select(id).select("svg").remove();
    $(id).empty();
    var ht2 = $("#chart-visualisation").height();
    var color = ["#E41E2B", "#31859C", "#FFC000", "#00B050", "#7030A0", "#7F7F7F", "#C00000", "#0070C0", "#FF9900", "#D2D9DF", "#000000", "#838C87", "#83E5BB"];
    var colorForTopRect = ["#AE192C", "#2E6878", "#936C0D", "#037C37", "#4D1F77", "#515151", "#820A0B", "#0A517C", "#C5790F", "#818284", "#000000", "#3b423e", "#4d886e"];
    var margin = { top: 30, right: 0, bottom: 40, left: ($(id).width()*0.1 + 10) };
    var MarginTop = 0;
    var height = $(id).height() - margin.top - margin.bottom;
    var width = '';
    if (list.BrandList.length <= 3) {
        width = $(id).width() - margin.right - margin.left;
    }
    else {
        width = $(id).width() + (0.29 * (list.BrandList.length - 3) * $(id).width()) - margin.right - margin.left;  //0.35 to increase width of per x axis section
    }
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.35);
    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], 0.18);
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(0)
        .tickPadding(10)
        .orient("bottom")
        .tickFormat(function (d) { return d; });
    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .tickPadding(10)
        .orient("left")
        .tickFormat(function (d) { return d; });
    var xAxisData = [];
    var yAxisData = [];
    for (var i = 0; i < list.BrandList.length; i++) {
        xAxisData.push(list.BrandList[i] + ' (' + ((list.SampleSize[i] == undefined || list.SampleSize[i] == null )? "NA" : addCommas(list.SampleSize[i])) + ')');
    }
    for (var i = 0; i < list.MetricList.length; i++) {
        yAxisData.push(list.MetricList[i]);
    }
    var barData = [];
    for (var i = 0; i < list.BrandList.length; i++) {
        for (var j = 0; j < list.MetricList.length; j++) {
            barData.push({
                "xAxis": list.BrandList[i] + ' (' + ((list.SampleSize[i] == undefined || list.SampleSize[i] == null) ? "NA" : addCommas(list.SampleSize[i])) + ')',
                "yAxis": list.MetricList[j],
                "customBase": list.BrandList[i],
                "data": parseFloat(list.ValueData[j][i]),
                "sampleSize": parseInt(((list.SampleSize[i] == undefined || list.SampleSize[i] == null) ? 0 : list.SampleSize[i])),
                "color": returnColorForSS(color[i], list.SampleSize[i]),
                "secColor": returnColorForSS(colorForTopRect[i], list.SampleSize[i]),
                "significance": parseFloat(list.SignificanceData[j][i]),
                "change": list.ChangeData[j][i]
            });
        }
    }
    x.domain(xAxisData.map(function (d) { return d; }));
    y.domain(yAxisData.map(function (d) { return d; }));
    //Append the div for tooltip
    var divTooltip = d3.select(id).append("div")
            .attr("class", "d3_tooltip")
            .style("opacity", 0);
    var chart = d3.select(id)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.right + margin.left) + " " + (height + margin.top + margin.bottom) + "")
        .classed("svg-content-responsivePyramid", true)
        .attr("width", (width + margin.right + margin.left) + "px")
        .attr("height", $(id).height() - 10)
        .style("position", "relative")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        //.style("font", "12px Century Gothic")
        .style("font-weight", "bold")
        .call(xAxis);
    chart.append("g")
        .attr("class", "y axis")
        //.style("font", "12px Century Gothic")
        .style("font-weight", "bold")
        .call(yAxis);
    chart.selectAll(".y.axis .tick text")
        //.style("font-family", "Century Gothic")
        .style("font-size", "12px")
        .style("fill", "none");
        //.call(verticalWrapPyr, 120);
    var bar = chart.selectAll(".mainBar")
        .data(barData)
        .enter().append("g")
        .attr("class", function (d) { return "mainBar" })
        .attr("transform", function (d) { return "translate(" + x(d.xAxis) + ", " + margin.top + ")"; });
    bar.append("line")
        .attr("class", "backDottedLine")
        .attr("x1", "-8")
        .attr("y1", function (d) { return y(d.yAxis) })
        .attr("x2", x.rangeBand() + 8)
        .attr("y2", function (d) { return y(d.yAxis) })
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "2px");
    bar.append("line")
        .attr("class", "leftSmallLine")
        .attr("x1", "-8")
        .attr("y1", function (d) { return y(d.yAxis) - 3 })
        .attr("x2", "-8")
        .attr("y2", function (d) { return y(d.yAxis) + 3 })
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px");
    bar.append("line")
        .attr("class", "rightSmallLine")
        .attr("x1", x.rangeBand() + 8)
        .attr("y1", function (d) { return y(d.yAxis) - 3 })
        .attr("x2", x.rangeBand() + 8)
        .attr("y2", function (d) { return y(d.yAxis) + 3 })
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "1px");
    bar.append("rect")
        .attr("class", "leftBar")
        .attr("x", function (d) { return x.rangeBand() / 2 - (x.rangeBand() * (d.data / 100) / 2) - 4; })
        .attr("y", function (d) { return y(d.yAxis) - y.rangeBand() / 2; })
        .attr("width", function (d) { if (d.data == -1 || d.sampleSize < 30) { return "0"; } else { return "4"; } })
        .attr("height", y.rangeBand())
        .attr("fill", function (d) { return d.secColor; })
        .on("mousemove", function (d) {
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", 1);
            var x = d3.event.pageX, y = d3.event.pageY;
            var elements = document.querySelectorAll(':hover');
            l = elements.length;
            l = l - 1;
            elementData = elements[l].__data__;
            var w = $(divTooltip[0]).width() / 2 - 3;
            var h = $(divTooltip[0]).height() + 15;
            divTooltip.style("left", d3.event.pageX - w + "px");
            divTooltip.style("top", d3.event.pageY - h + "px");
            var color = Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize);            
            divTooltip.html((d.yAxis) + "<br>" + d.xAxis + "<br><span style='color:" + color + "'>" + (d.data >= 0 ? (d.data.toFixed(1) + '%' + d.change) : "NA" + "</span>"));
        })
        .on("mouseout", function (d) {
            divTooltip.style("display", "none");
            divTooltip.style("opacity", 0);
        });
    bar.append("rect")
        .attr("class", "middleBar")
        .attr("x", function (d) { return x.rangeBand() / 2 - (x.rangeBand() * (d.data / 100) / 2); })
        .attr("y", function (d) { return y(d.yAxis) - y.rangeBand() / 2; })
        .attr("width", function (d) { if (d.data == -1 || d.sampleSize < 30) { return "0"; } else { return x.rangeBand() * (d.data / 100); } })
        .attr("height", y.rangeBand())
        .attr("fill", function (d) { return d.color; })
        .on("mousemove", function (d) {
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", 1);
            var x = d3.event.pageX, y = d3.event.pageY;
            var elements = document.querySelectorAll(':hover');
            l = elements.length;
            l = l - 1;
            elementData = elements[l].__data__;
            var w = $(divTooltip[0]).width() / 2 - 3;
            var h = $(divTooltip[0]).height() + 15;
            divTooltip.style("left", d3.event.pageX - w + "px");
            divTooltip.style("top", d3.event.pageY - h + "px");
            var color = Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize);
            divTooltip.html((d.yAxis) + "<br>" + d.xAxis + "<br><span style='color:" + color + "'>" + (d.data >= 0 ? (d.data.toFixed(1) + '%' + d.change) : "NA" + "</span>"));
        })
        .on("mouseout", function (d) {
            divTooltip.style("display", "none");
            divTooltip.style("opacity", 0);
        });
    bar.append("rect")
        .attr("class", "rightBar")
        .attr("x", function (d) { return x.rangeBand() / 2 + (x.rangeBand() * (d.data / 100) / 2); })
        .attr("y", function (d) { return y(d.yAxis) - y.rangeBand() / 2; })
        .attr("width", function (d) { if (d.data == -1 || d.sampleSize < 30) { return "0"; } else { return "4"; } })
        .attr("height", y.rangeBand())
        .attr("fill", function (d) { return d.secColor; })
        .on("mousemove", function (d) {
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", 1);
            var x = d3.event.pageX, y = d3.event.pageY;
            var elements = document.querySelectorAll(':hover');
            l = elements.length;
            l = l - 1;
            elementData = elements[l].__data__;
            var w = $(divTooltip[0]).width() / 2 - 3;
            var h = $(divTooltip[0]).height() + 15;
            divTooltip.style("left", d3.event.pageX - w + "px");
            divTooltip.style("top", d3.event.pageY - h + "px");
            var color = Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize);
            divTooltip.html((d.yAxis) + "<br>" + d.xAxis + "<br><span style='color:" + color + "'>" + (d.data >= 0 ? (d.data.toFixed(1) + '%' + d.change) : "NA" + "</span>"));
        })
        .on("mouseout", function (d) {
            divTooltip.style("display", "none");
            divTooltip.style("opacity", 0);
        });
    bar.append("line")
        .attr("class", "middleBarLine")
        .attr("x1", function (d) { return x.rangeBand() / 2 - (x.rangeBand() * (d.data / 100) / 2); })
        .attr("y1", function (d) { return y(d.yAxis) })
        .attr("x2", function (d) { if (d.data == -1 || d.sampleSize < 30) { return x.rangeBand() / 2 - (x.rangeBand() * (d.data / 100) / 2); } else { return x.rangeBand() / 2 + (x.rangeBand() * (d.data / 100) / 2); } })

        .attr("y2", function (d) { return y(d.yAxis) })
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke", function (d) { return d.secColor; })
        .style("shape-rendering", "crispEdges")
        .style("stroke-width", "1px")
        .on("mousemove", function (d) {
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", 1);
            var x = d3.event.pageX, y = d3.event.pageY;
            var elements = document.querySelectorAll(':hover');
            l = elements.length;
            l = l - 1;
            elementData = elements[l].__data__;
            var w = $(divTooltip[0]).width() / 2 - 3;
            var h = $(divTooltip[0]).height() + 15;
            divTooltip.style("left", d3.event.pageX - w + "px");
            divTooltip.style("top", d3.event.pageY - h + "px");
            var color = Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize);
            divTooltip.html((d.yAxis) + "<br>" + d.xAxis + "<br><span style='color:" + color + "'>" + (d.data >= 0 ? (d.data.toFixed(1) + '%' + d.change) : "NA" + "</span>"));
        })
        .on("mouseout", function (d) {
            divTooltip.style("display", "none");
            divTooltip.style("opacity", 0);
        });
    bar.append("text")
        .attr("class", "barData")
        .attr("x", -13)//+ (isChange?-35:0)
        .attr("y", function (d) { return y(d.yAxis) + 3; })
        .style("text-anchor", "end")
        .style("fill", function (d) { return Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize); })
        //.style("font", "12px Century Gothic")
        .style("font-weight", "bold")
        .text(function (d, i) {
            return ((d.data >= 0 && d.sampleSize > 30) ? (d.data.toFixed(1) + '%' + d.change) : (d.sampleSize < 30 ? "" : "NA"));
        })
        .on("mousemove", function (d) {
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", 1);
            var x = d3.event.pageX, y = d3.event.pageY
            var elements = document.querySelectorAll(':hover');
            l = elements.length
            l = l - 1
            elementData = elements[l].__data__;
            var w = $(divTooltip[0]).width() / 2 - 3;
            var h = $(divTooltip[0]).height() + 15;
            divTooltip.style("left", d3.event.pageX - w + "px");
            divTooltip.style("top", d3.event.pageY - h + "px");
            var color = Get_Significance_Color(d.significance, (d.customBase.toUpperCase() == c_text ? c_text : ""), d.sampleSize);
                divTooltip.html((d.yAxis) + "<br>" + d.xAxis + "<br><span style='color:" + color + "'>" + (d.data >= 0 ? (d.data.toFixed(1) + '%' + d.change) : "NA" + "</span>"));
        })
        .on("mouseout", function (d) {
            divTooltip.style("display", "none");
            divTooltip.style("opacity", 0);
        });
    var svgPos = $(id).find('.svg-content-responsivePyramid')[0].getBoundingClientRect();
    var chart = d3.select(id)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + 0.13 * $(id).width() + " " + (height + margin.top + margin.bottom) + "")
        .classed("svg-content-responsivePyramid", true)
        .attr("width", 0.13 * $(id).width() + "px")
        .attr("height", $(id).height() - 10)
        .style("position", "absolute")
        .style("opacity", 1)
        .style("z-index", 2)
        .style("left", svgPos.left + 'px')
        .style("top", svgPos.top + 'px')
        .style("background-color", "#FAFAFA")
        .append("g")
        .attr("transform", "translate(" + (margin.left + 10) + "," + margin.top + ")");

    var bar = chart.selectAll(".mainBar")
        .data(barData)
        .enter().append("g")
        .attr("class", function (d) { return "mainBar" })
        .attr("transform", function (d) { return "translate(0, " + margin.top + ")"; });
    bar.append("text")
        .attr("class", "barDataY")
        .attr("x", 0)
        .attr("y", function (d) { return y(d.yAxis) + 3; })
        .attr("dy", "0em")
        .style("text-anchor", "end")
        .style("fill", "black")
        //.style("font", "12px Century Gothic")
        .style("font-weight", "bold")
        .text(function (d, i) {
            return d.yAxis;
        })
        .call(horizontalWrap, 120);
        //.call(verticalWrap, 120);
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
    if (list.BrandList.length > 3) {
        SetScroll($("#chart-visualisation"), "rgba(0,0,0,.75)", -20, 0, 0, 14, 8)
    }
}

function columnChartStacked(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "columnChartStacked";
    data = preparefullcolumnChartStackedData(data);    
    ///////////////////converting to 100% stack/////////////////////////
    var temp, i, j, k;
    var total = [], xData = [], perData = [];
    for (var i = 0; i < data.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < Object.keys(data[0]).length; i++) {
        temp = Object.keys(data[0])[i];
        if (temp != "month" && !temp.includes("__labelClass") && temp != "__sampleSize" && !temp.includes("__nullIdentifier") && temp != "__lowSampleSize") {
            xData.push(temp);
        }
    }
    var dataIntermediate = xData.map(function (c,i) {
        return data.map(function (d) {
            return { x: d.month + "\n(" + d.__sampleSize + ")", y: +d[c], original_val: +d[c], index: +i, nullIdentifier: d[c + "__nullIdentifier"], lowSampleSize: d.__lowSampleSize, statColor: d[c + "__labelClass"] };
        });
    });
    var _maxValInd = 0, _maxVal = dataIntermediate[0][0].x.length;
    for (var i = 1; i < dataIntermediate[0].length; i++) {
        if (dataIntermediate[0][i].x.length > _maxVal) {
            _maxValInd = i;
            _maxVal = dataIntermediate[0][i].x.length;
        }
    }
    var NoOfEle = data.length;
    if (NoOfEle < 10) {
        NoOfEle = (2 + NoOfEle);
    }
    $(".tbl-emptyrow").css("display", "none");
    if (NoOfEle < 15) {
        NoOfEle = $("#chart-visualisation").width() / 80;
        $("#chart-visualisation").css("overflow", "hidden");
    } else {
        $("#chart-visualisation").css("overflow-x", "auto");
        $("#chart-visualisation").css("overflow-y", "hidden");
    }
    var margin = { top: 20, right: 10, bottom: 50, left: 10 },
            width = $("#chart-visualisation").width() - margin.left - margin.right, //80 * NoOfEle
            height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .15);
    var y = d3.scale.linear()
            .rangeRound([height, 0]);

    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    var dataStackLayout = d3.layout.stack()(dataIntermediate);
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    x.domain(dataStackLayout[0].map(function (d) {
        return d.x;
    }));
    dataStackLayout = d3.layout.stack()(dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); }));
    //Update the bottom, height and svg height   
    var btm = horizontalWrapCount(dataIntermediate[0][_maxValInd].x, x.rangeBand());
    if (btm > 2) {
        margin.bottom = margin.bottom + (13 * (btm - 2));
        height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    }
    y = d3.scale.linear()
            .rangeRound([height, 0]);
    if (dataStackLayout.length != 0) {
        y.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                function (d) { return d.y0 + d.y; })
        ]);
    } else {
        y.domain([0, 0]);
    }    
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);

    var svg = d3.select("#chart-visualisation").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    
    var lineGap = 0, colorIndex = 0, intnl_margin = 4, wdt = x.rangeBand() - 5, posFix = x.rangeBand() / 2 - wdt / 2, cummul_width = 0;
    var label_h = 15, label_w = 35;
    var layer = svg.selectAll(".stack")
            .data(dataStackLayout)
            .enter().append("g")
            .attr("class", "stack")
            .style("fill", function (d, i) {
                var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C"+i)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
                C.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", t_colorColumnStart[i]);
                C.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", t_colorColumnStart[i]);
                return "url(#C"+i+")";
            });
    createLegends(xData, svg, t_colorColumnStart, t_colorColumnStart);
    /*Legends END*/
    layer.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", function (d) { return d.lowSampleSize; })
            .attr("x", function (d) {
                return x(d.x) + lineGap + posFix;
            })
            .attr("y", function (d) {
                return y(d.y + d.y0) + lineGap - 5;
            })
            .attr("height", function (d, i) {
                var context = d3.select(this.parentNode);
                ///*Lines*/
                //var hgh = Math.floor(y(d.y0) - y(d.y + d.y0) - 2 * lineGap) / 6;
                //for (var i = 0; i < hgh; i++) {
                //    context.append("line")
                //        .attr("x1", x(d.x) + lineGap + intnl_margin + posFix)
                //        .attr("y1", y(d.y + d.y0) + lineGap + i * 6 + 1)
                //        .attr("x2", x(d.x) + wdt - lineGap - intnl_margin + posFix)
                //        .attr("y2", y(d.y + d.y0) + lineGap + i * 6 + 1)
                //        .style("opacity", 0.5)
                //        .style("stroke-width", "1")
                //        .style("stroke", "#000");
                //}
                ///*Lines*/
               
                ///*Gradient rectangle*/
                //       context.append("rect")
                //            .attr("width", (wdt / 2 - lineGap)<0?0:(wdt/2 - lineGap))
                //            .attr("x", x(d.x) + lineGap + posFix)
                //            .attr("y", y(d.y + d.y0) + lineGap)
                //            .attr("height", (y(d.y0) - y(d.y + d.y0) - 2 * lineGap) < 0 ? 0 : (y(d.y0) - y(d.y + d.y0) - 2 * lineGap))
                //            .style("fill", "url(#gradient)")
                //            .on("mousemove", function () {                               
                //                div.transition()
                //                .duration(0)
                //                .style("opacity", 1);
                //                div.html(xData[d.index]+"<br/>" + d.original_val.toFixed(1)+'%')
                //                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                //                .style("top", (d3.event.pageY - 35) + "px");
                //            }).on("mouseout", function () {
                //                div.transition()
                //               .duration(0)
                //               .style("opacity", 0);
                //            });
                ///*Gradient rectangle*/
                /*Bottom rectangle*/
                if (Math.floor(colorIndex / data.length) == 0) {
                    context.append("rect")
                                .attr("width", wdt + 16)
                                .attr("x", x(d.x) + posFix - 8)
                                .attr("y", height - 2)
                                .attr("height", 3)
                                .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                                .style("stroke-width", "0")
                                .style("fill", "#676767")
                                .on("mousemove", function () {
                                    div.transition()
                                    .duration(0)
                                    .style("opacity", 1);
                                    div.html(xData[d.index] + "<br/>" + d.original_val.toFixed(1) + '%')
                                    .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                    .style("top", (d3.event.pageY - 55) + "px");
                                }).on("mouseout", function () {
                                    div.transition()
                                   .duration(0)
                                   .style("opacity", 0);
                                });
                }
                /*Bottom rectangle*/
                /*Vertical rectangle*/
                context.append("rect")
                            .attr("width", 1)
                            .attr("class", d.lowSampleSize)
                            .attr("x", x(d.x) + posFix + wdt/2)
                            .attr("y", y(d.y + d.y0) - 5)
                            .attr("height", (y(d.y0) - y(d.y + d.y0) - 2 * lineGap))
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Vertical rectangle*/
                /*Horizontal rectangle*/
                context.append("rect")
                            .attr("width", wdt)
                            .attr("class", d.lowSampleSize)
                            .attr("x", x(d.x) + posFix)
                            .attr("y", y(d.y + d.y0) - 5)
                            .attr("height", 0)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                colorIndex = colorIndex + 1;
                /*Horizontal rectangle*/
                /*Data Label*/
                context.append("rect")
                            .attr("class",d.nullIdentifier + " " + d.lowSampleSize)
                            .attr("width", label_w)
                            .attr("x", x(d.x) + posFix + wdt / 2 - label_w / 2)
                            .attr("y", y(d.y + d.y0) + (y(d.y0) - y(d.y + d.y0)) / 2 - label_h / 2 - 5)
                            .attr("height", label_h)
                            .style("fill", "rgba(255, 255, 255, 0.7)")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                context.append("text")
                            .attr("class", d.nullIdentifier + " " + d.lowSampleSize)
                            .attr("x", x(d.x) + posFix + wdt / 2 - label_w / 2 + label_h + 2)
                            .attr("y", y(d.y + d.y0) + (y(d.y0) - y(d.y + d.y0)) / 2 - label_h / 2 + label_h - 9)
                            .text(d.original_val.toFixed(1)+"%")
                            .style("fill", d.statColor)
                            .style("text-anchor", "middle")
                            .style("font-size", "8px")
                            .style("font-weight", "bold")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Data Label*/
                return (y(d.y0) - y(d.y + d.y0) - 2 * lineGap) < 0 ? 0 : (y(d.y0) - y(d.y + d.y0) - 2 * lineGap);
            })
            .attr("width", (wdt - 2 * lineGap) < 0 ? 0 : (wdt - 2 * lineGap))
            .on("mousemove", function (d) {
                div.transition()
                .duration(0)
                .style("opacity", 1);
                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                .style("top", (d3.event.pageY - 55) + "px");
            }).on("mouseout", function () {
                div.transition()
               .duration(0)
               .style("opacity", 0);
            });
    colorIndex = 0;
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    d3.selectAll(".x.axis path").style("fill", "none").style("stroke", "#000").style("stroke-width", 1).style("opacity", 0);
    svg.selectAll(".x.axis .tick text").call(horizontalWrap, x.rangeBand());
    svg.selectAll(".x.axis .tick tspan").attr("y", "16");
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function fullbarChartStacked(data) {
    $("#chart-visualisation").html('');
    $(".tbl-emptyrow").css("display", "none");
    current_data_for_chart = data;
    current_function_for_chart = "fullbarChartStacked";
    data = preparefullcolumnChartStackedData(data);
    ///////////////////converting to 100% stack/////////////////////////
    var temp, i, j, k;
    var total = [], xData = [], perData = [];
    for (var i = 0; i < data.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < Object.keys(data[0]).length; i++) {
        temp = Object.keys(data[0])[i];
        if (temp != "month" && !temp.includes("__labelClass") && temp != "__sampleSize" && !temp.includes("__nullIdentifier") && temp != "__lowSampleSize") {
            xData.push(temp);
        }
    }

    var dataIntermediate = xData.map(function (c,i) {
        return data.map(function (d) {
            return { x: d.month + "\n(" + d.__sampleSize + ")", y: +d[c], original_val: +d[c], index: +i, nullIdentifier: d[c + "__nullIdentifier"], lowSampleSize: d.__lowSampleSize, statColor: d[c + "__labelClass"] };
        });
    });
    //for (i = 0; i < dataIntermediate.length; i++) {
    //    for (j = 0; j < dataIntermediate[i].length; j++) {
    //        var temp = dataIntermediate[i][j].original_val;
    //        total[j] = total[j] + temp;
    //    }
    //}
    //for (i = 0; i < dataIntermediate.length; i++) {
    //    for (k = 0; k < dataIntermediate[i].length; k++) {
    //        temp = dataIntermediate[i][k].original_val;
    //        //dataIntermediate[i][k].y = (temp * 100) / total[k];
    //        dataIntermediate[i][k].y = total[k] == 0 ? 0 : ((temp * 100) / total[k]);
    //    }
    //}

    var NoOfEle = data.length, leftFix = 0;
    var margin_top_val = 0;
    if (NoOfEle > 5 && NoOfEle < 11) {
        NoOfEle = NoOfEle + 3;
    }
    if (NoOfEle < 6) {
        $("#chart-visualisation").css("overflow-y", "hidden");
        NoOfEle = $("#chart-visualisation").height() / 70;
    } else {
        //$("#chart-visualisation").css("overflow-y", "auto");
    }
    
    var margin = { top: 5, right: 50, bottom: 5, left: 210 },
            width = $("#chart-visualisation").width() - margin.left - margin.right,
            height = $("#chart-visualisation").height() - margin.top - margin.bottom; //70 * NoOfEle

    var y = d3.scale.ordinal()
            .rangeRoundBands([0,height], 0.1);
    var x = d3.scale.linear()
            .rangeRound([0, width]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    var svg = d3.select("#chart-visualisation").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var dataStackLayout = d3.layout.stack()(dataIntermediate);

    y.domain(dataStackLayout[0].map(function (d) {
        return d.x;
    }));
    dataIntermediate = dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    //ReCalculate the 100% stacked values
    for (var i = 0; i < dataIntermediate.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < dataIntermediate.length; i++) {
        for (j = 0; j < dataIntermediate[i].length; j++) {
            var temp = dataIntermediate[i][j].original_val;
            total[j] = total[j] + temp;
        }
    }
    for (i = 0; i < dataIntermediate.length; i++) {
        for (k = 0; k < dataIntermediate[i].length; k++) {
            temp = dataIntermediate[i][k].original_val;
            dataIntermediate[i][k].y = total[k] == 0 ? 0 : ((temp * 100) / total[k]);
        }
    }
    dataStackLayout = d3.layout.stack()(dataIntermediate);
    if (dataStackLayout.length != 0) {
        x.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                function (d) { return d.y0 + d.y; })
        ]);
    } else {
        x.domain([0, 0]);
    }
    dataStackLayout = d3.layout.stack()(dataIntermediate);
    var lineGap = 0, colorIndex = 0, intnl_margin = 4, wdt = y.rangeBand() - 10, posFix = y.rangeBand() / 2 - wdt / 2, cummul_width = 0;
    var label_h = 15, label_w = 35;
    var layer = svg.selectAll(".stack")
            .data(dataStackLayout)
            .enter().append("g")
            .attr("class", "stack")
            .style("fill", function (d, i) {
                var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C" + i)
                .attr("x1", "100%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "0%")
                C.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", t_colorColumnStart[i]);
                C.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", t_colorColumnStart[i]);
                return "url(#C" + i + ")";
            });
    createLegends(xData, svg, t_colorColumnStart, t_colorColumnStart);

    layer.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", function(d){ return d.lowSampleSize;})
            .attr("y", function (d) {
                return y(d.x) + lineGap + posFix;
            })
            .attr("x", function (d) {
                return x(d.y0) + lineGap + 5;
            })
            .attr("width", function (d, i) {
                var context = d3.select(this.parentNode);

                ///*Gradient rectangle*/
                //context.append("rect")
                //            .attr("height", (wdt / 2 - lineGap) < 0 ? 0 : (wdt / 2 - lineGap))
                //            .attr("y", y(d.x) + lineGap + posFix)
                //            .attr("x", x(d.y0) + lineGap)
                //            .attr("width", (x(d.y + d.y0) - x(d.y0) - 2 * lineGap) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0) - 2 * lineGap))
                //            .style("fill", "url(#gradient)")
                //            .on("mousemove", function () {
                //                div.transition()
                //                .duration(0)
                //                .style("opacity", 1);
                //                div.html(xData[d.index] + "<br/>" + d.original_val.toFixed(1) + '%')
                //                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                //                .style("top", (d3.event.pageY - 35) + "px");
                //            }).on("mouseout", function () {
                //                div.transition()
                //               .duration(0)
                //               .style("opacity", 0);
                //            });
                ///*Gradient rectangle*/
                /*Bottom rectangle*/
                if (Math.floor(colorIndex / data.length) == 0) {
                    context.append("rect")
                            .attr("height", wdt + 16)
                            .attr("y", y(d.x) + posFix - 8)
                            .attr("x", x(d.y0) -2)
                            .attr("width", 3)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", "#676767")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                }
                /*Bottom rectangle*/
                /*Horizontal rectangle*/
                context.append("rect")
                            .attr("height", 1)
                            .attr("class", d.lowSampleSize)
                            .attr("y", y(d.x) + posFix + wdt/2)
                            .attr("x", x(d.y0) + 5)
                            .attr("width", (x(d.y + d.y0) - x(d.y0)) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0)))
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Horizontal rectangle*/
                /*Vertical rectangle*/
                context.append("rect")
                            .attr("height", wdt)
                            .attr("class", d.lowSampleSize)
                            .attr("y", y(d.x) + posFix)
                            .attr("x", x(d.y0) + x(d.y + d.y0) - x(d.y0) - 2 * lineGap + 3)
                            .attr("width", 0)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                colorIndex = colorIndex + 1;
                /*Vertical rectangle*/
                ///*Lines*/
                //var hgh = Math.floor(x(d.y + d.y0) - x(d.y0) - 2 * lineGap) / 6;
                //for (var i = 0; i < hgh; i++) {
                //    context.append("line")
                //        .attr("y1", y(d.x) + lineGap + intnl_margin + posFix)
                //        .attr("x1", x(d.y0) + lineGap + i * 6 + 1)
                //        .attr("y2", y(d.x) + wdt - lineGap - intnl_margin + posFix)
                //        .attr("x2", x(d.y0) + lineGap + i * 6 + 1)
                //        .style("opacity", 0.5)
                //        .style("stroke", "#000");
                //}
                ///*Lines*/
                /*Data Label*/
                context.append("rect")
                            .attr("class", d.nullIdentifier+" "+d.lowSampleSize)
                            .attr("width", label_w)
                            .attr("x", x(d.y0) + (x(d.y + d.y0) - x(d.y0))/2-label_w/2 + 5)
                            .attr("y", y(d.x) + posFix - label_h/2 + wdt/2)
                            .attr("height", label_h)
                            .style("fill", "rgba(255, 255, 255, 0.7)")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                context.append("text")
                            .attr("class", d.nullIdentifier + " " + d.lowSampleSize)
                            .attr("x", x(d.y0) + (x(d.y + d.y0) - x(d.y0)) / 2 - label_w / 2+label_h + 7)
                            .attr("y", y(d.x) + posFix + label_h / 2 - 4 + wdt / 2)
                            .text(d.original_val.toFixed(1) + "%")
                            .style("fill", d.statColor)
                            .style("text-anchor", "middle")
                            .style("font-size", "8px")
                            .style("font-weight", "bold")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Data Label*/
                return (x(d.y + d.y0) - x(d.y0) - 2 * lineGap) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0) - 2 * lineGap);
            })
            .attr("height", (wdt - 2 * lineGap) < 0 ? 0 : (wdt - 2 * lineGap))
            .on("mousemove", function (d) {
                div.transition()
                .duration(0)
                .style("opacity", 1);
                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                .style("top", (d3.event.pageY - 55) + "px");
            }).on("mouseout", function () {
                div.transition()
               .duration(0)
               .style("opacity", 0);
            });
    colorIndex = 0;
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(yAxis);
    d3.selectAll(".y.axis path").style("fill", "none").style("stroke", "#000").style("stroke-width", 1).style("opacity", 0);
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 180);
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}

function barChartStacked(data) {
    $("#chart-visualisation").html('');
    current_data_for_chart = data;
    current_function_for_chart = "barChartStacked";
    $(".tbl-emptyrow").css("display", "none");
    data = preparefullcolumnChartStackedData(data);
    ///////////////////converting to 100% stack/////////////////////////
    var temp, i, j, k;
    var total = [], xData = [], perData = [];
    for (var i = 0; i < data.length; i++) {
        total[i] = 0;
    }
    for (i = 0; i < Object.keys(data[0]).length; i++) {
        temp = Object.keys(data[0])[i];
        if (temp != "month" && !temp.includes("__labelClass") && temp != "__sampleSize" && !temp.includes("__nullIdentifier") && temp != "__lowSampleSize") {
            xData.push(temp);
        }
    }

    var dataIntermediate = xData.map(function (c,i) {
        return data.map(function (d) {
            var objTemp = { x: d.month + "\n(" + d.__sampleSize + ")", y: +d[c], original_val: +d[c], index: +i, nullIdentifier: d[c + "__nullIdentifier"], lowSampleSize: d.__lowSampleSize, statColor: d[c + "__labelClass"] };
        //    if (d.samplesize == null || d.samplesize == undefined) {
        //        objTemp = { x: d.month + "\n(" + d.sampleSize + ")", y: +d[c], original_val: +d[c], index: +i, labelClass: d.labelClass, nullIdentifier: d[c + "nullIdentifier"] };
        //    }
        //    else {
        //        if(){}
        //}
            
            return objTemp;
        });
    });
    
    var NoOfEle = data.length, leftFix = 0;
    var margin_top_val = 0;
    if (NoOfEle > 5 && NoOfEle < 11) {
        NoOfEle = NoOfEle + 3;
    }
    if (NoOfEle < 6) {
        $("#chart-visualisation").css("overflow-y", "hidden");
        NoOfEle = $("#chart-visualisation").height() / 70;
    } else {
        //$("#chart-visualisation").css("overflow-y", "auto");
    }

    var margin = { top: 10, right: 50, bottom: 5, left: 210 },
            width = $("#chart-visualisation").width() - margin.left - margin.right,
            height = $("#chart-visualisation").height() - margin.top - margin.bottom; //70 * NoOfEle

    var y = d3.scale.ordinal()
            .rangeRoundBands([0,height], 0.1);
    var x = d3.scale.linear()
            .rangeRound([0, width]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
    var div = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);
    var svg = d3.select("#chart-visualisation").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    /*Gradient*/
    var gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "transparent");
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0,0,0,0.3)");
    /*Gradient*/
    var t_colorColumnStart = colorColumnStart.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var t_colorColumnStop = colorColumnStop.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); });
    var dataStackLayout = d3.layout.stack()(dataIntermediate);

    y.domain(dataStackLayout[0].map(function (d) {
        return d.x;
    }));
    dataStackLayout = d3.layout.stack()(dataIntermediate.filter(function (d, i) { return (legend_filter_list.indexOf("" + i + "") == -1); }));
    if (1) {
        x.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                function (d) { return d.y0 + d.y; })
        ]);
    } else {
        x.domain([0,0]);
    }
    var lineGap = 0, colorIndex = 0, intnl_margin = 4, wdt = y.rangeBand() - 10, posFix = y.rangeBand() / 2 - wdt / 2, cummul_width =0 ;
    var label_h = 15, label_w = 35;
    var layer = svg.selectAll(".stack")
            .data(dataStackLayout)
            .enter().append("g")
            .attr("class", "stack")
            .style("fill", function (d, i) {
                var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C" + i)
                .attr("x1", "100%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "0%")
                C.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", t_colorColumnStart[i]);
                C.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", t_colorColumnStart[i]);
                return "url(#C" + i + ")";
            });
    createLegends(xData, svg, t_colorColumnStart, t_colorColumnStart);

    layer.selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", function (d) { return d.lowSampleSize; })
            .attr("y", function (d) {
                return y(d.x) + lineGap + posFix;
            })
            .attr("x", function (d) {
                return x(d.y0) + lineGap + 5;
            })
            .attr("width", function (d, i) {
                var context = d3.select(this.parentNode);

                ///*Gradient rectangle*/
                //context.append("rect")
                //            .attr("height", (wdt / 2 - lineGap) < 0 ? 0 : (wdt / 2 - lineGap))
                //            .attr("y", y(d.x) + lineGap + posFix)
                //            .attr("x", x(d.y0) + lineGap)
                //            .attr("width", (x(d.y + d.y0) - x(d.y0) - 2 * lineGap) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0) - 2 * lineGap))
                //            .style("fill", "url(#gradient)")
                //            .on("mousemove", function () {
                //                div.transition()
                //                .duration(0)
                //                .style("opacity", 1);
                //                div.html(xData[d.index] + "<br/>" + d.original_val.toFixed(1) + '%')
                //                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                //                .style("top", (d3.event.pageY - 35) + "px");
                //            }).on("mouseout", function () {
                //                div.transition()
                //               .duration(0)
                //               .style("opacity", 0);
                //            });
                ///*Gradient rectangle*/
                ///*Outer rectangle*/
                //context.append("rect")
                //            .attr("height", wdt)
                //            .attr("y", y(d.x) + posFix)
                //            .attr("x", x(d.y0))
                //            .attr("width", (x(d.y + d.y0) - x(d.y0)) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0)))
                //            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                //            .style("stroke-width", "1")
                //            .style("fill", "none")
                //            .on("mousemove", function () {
                //                div.transition()
                //                .duration(0)
                //                .style("opacity", 1);
                //                div.html(xData[d.index] + "<br/>" + d.original_val.toFixed(1) + '%')
                //                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                //                .style("top", (d3.event.pageY - 35) + "px");
                //            }).on("mouseout", function () {
                //                div.transition()
                //               .duration(0)
                //               .style("opacity", 0);
                //            });
                //colorIndex = colorIndex + 1;
                ///*Outer rectangle*/
                ///*Lines*/
                //var hgh = Math.floor(x(d.y + d.y0) - x(d.y0) - 2 * lineGap) / 6;
                //for (var i = 0; i < hgh; i++) {
                //    context.append("line")
                //        .attr("y1", y(d.x) + lineGap + intnl_margin + posFix)
                //        .attr("x1", x(d.y0) + lineGap + i * 6 + 1)
                //        .attr("y2", y(d.x) + wdt - lineGap - intnl_margin + posFix)
                //        .attr("x2", x(d.y0) + lineGap + i * 6 + 1)
                //        .style("opacity", 0.5)
                //        .style("stroke", "#000");
                //}
                ///*Lines*/
                /*Bottom rectangle*/
                if (Math.floor(colorIndex / data.length) == 0) {
                    context.append("rect")
                            .attr("height", wdt + 16)
                            .attr("y", y(d.x) + posFix - 8)
                            .attr("x", x(d.y0) - 2)
                            .attr("width", 3)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", "#676767")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                }
                /*Bottom rectangle*/
                /*Horizontal rectangle*/
                context.append("rect")
                            .attr("height", 1)
                            .attr("class", d.lowSampleSize)
                            .attr("y", y(d.x) + posFix + wdt / 2)
                            .attr("x", x(d.y0) + 5)
                            .attr("width", (x(d.y + d.y0) - x(d.y0)) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0)))
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Horizontal rectangle*/
                /*Vertical rectangle*/
                context.append("rect")
                            .attr("height", wdt)
                            .attr("class", d.lowSampleSize)
                            .attr("y", y(d.x) + posFix)
                            .attr("x", x(d.y0) + x(d.y + d.y0) - x(d.y0) - 2 * lineGap + 3)
                            .attr("width", 0)
                            .style("stroke", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .style("stroke-width", "0")
                            .style("fill", t_colorColumnStop[Math.floor(colorIndex / data.length)])
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                colorIndex = colorIndex + 1;
                /*Vertical rectangle*/
                /*Data Label*/
                context.append("rect")
                            .attr("class", d.nullIdentifier+" "+d.lowSampleSize)
                            .attr("width", label_w)
                            .attr("x", x(d.y0) + (x(d.y + d.y0) - x(d.y0)) / 2 - label_w / 2 + 5)
                            .attr("y", y(d.x) + posFix - label_h / 2 + wdt/2)
                            .attr("height", label_h)
                            .style("fill", "rgba(255, 255, 255, 0.7)")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                context.append("text")
                            .attr("class", d.nullIdentifier+" "+d.lowSampleSize)
                            .attr("x", x(d.y0) + (x(d.y + d.y0) - x(d.y0)) / 2 - label_w / 2 + label_h + 7)
                            .attr("y", y(d.x) + posFix - label_h / 2 + label_h - 4 + wdt/2)
                            .text(d.original_val.toFixed(1) + "%")
                            .style("fill", d.statColor)
                            .style("text-anchor", "middle")
                            .style("font-size", "8px")
                            .style("font-weight", "bold")
                            .on("mousemove", function () {
                                div.transition()
                                .duration(0)
                                .style("opacity", 1);
                                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                                .style("top", (d3.event.pageY - 55) + "px");
                            }).on("mouseout", function () {
                                div.transition()
                               .duration(0)
                               .style("opacity", 0);
                            });
                /*Data Label*/
                return (x(d.y + d.y0) - x(d.y0) - 2 * lineGap) < 0 ? 0 : (x(d.y + d.y0) - x(d.y0) - 2 * lineGap);
            })
            .attr("height", (wdt - 2 * lineGap) < 0 ? 0 : (wdt - 2 * lineGap))
            .on("mousemove", function (d) {
                div.transition()
                .duration(0)
                .style("opacity", 1);
                div.html("<span>" + xData[d.index] + "</span><br/><span>" + d.x + "</span><br/><span style='color:" + d.statColor + "'>" + d.original_val.toFixed(1) + '%' + "</span>")
                .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
                .style("top", (d3.event.pageY - 55) + "px");
            }).on("mouseout", function () {
                div.transition()
               .duration(0)
               .style("opacity", 0);
            });
    colorIndex = 0;
    svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(yAxis);
    d3.selectAll(".y.axis path").style("fill", "none").style("stroke", "#000").style("stroke-width", 1).style("opacity", 0);
    svg.selectAll(".y.axis .tick text").call(horizontalWrap, 180);
    $('.y').find('text').each(function () {
        var length = $(this).find('tspan').length;
        $(this).find('tspan').each(function () {
            var dy = parseFloat($(this).attr('dy').split('em')[0]);
            $(this).attr('dy', (dy - 0.32 * (length - 1)) + 'em');
        });
    });
    //remove niceScroll if it is there
    if ($("#chart-visualisation").getNiceScroll().length != 0) {
        $("#chart-visualisation").getNiceScroll().remove();
    }
}
function prepareDataForBarChart(data) {
    var chartData = [];
    series = {};
    //[ {  "State": "CA", "Under 5 Years": 30,   "5 to 13 Years": 44,    "14 to 17 Years": 215,    "18 to 24 Years": 385,   "25 to 44 Years": 106,  "45 to 64 Years": 88,    "65 Years and Over": 41}];    
    for (i = 0; i < data.length; i++) {       
        for (j = 0; j < data[i].data.length; j++) {
            series.letter = data[i].name + " (" + (data[i].SeriesSampleSize == null ? "NA" : data[i].SeriesSampleSize) + ")";
            series["__lowSampleSize"] = data[i].SeriesSampleSize == null || data[i].SeriesSampleSize < 30 ? "lowSampleSize" : "";
            series["__legendName"] = data[i].data[j].x;
            series.frequency = data[i].data[j].y;
            //Stat color
            if (isCustomBaseSelect == true)
                series["__labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[i].name);
            else {
                series["__labelClass"] = "black";
            }
            if (series["__labelClass"] != "blue") {
                if (data[i].SeriesSampleSize >= 30 && data[i].SeriesSampleSize < 100) { series["__labelClass"] = "gray"; }
                if (data[i].data[j].StatValue > 1.96) { series["__labelClass"] = "green"; }
                if (data[i].data[j].StatValue < -1.96) { series["__labelClass"] = "red"; }
            }
        }
        chartData.push(angular.copy(series));
    }
    return chartData;
}
function prepareDataForBarChartWithChange(data) {
    var chartData = [];
    series = {};
    for (i = 0; i < data.length; i++) {
        for (j = 0; j < data[i].data.length; j++) {
            series.letter = data[i].name + " (" + (data[i].SeriesSampleSize == null ? "NA" : data[i].SeriesSampleSize) + ")";
            series["__lowSampleSize"] = data[i].SeriesSampleSize == null || data[i].SeriesSampleSize < 30 ? "lowSampleSize" : "";
            series["__legendName"] = data[i].data[j].x;
            series.frequency = data[i].data[j].y;
            //Stat color
            if (isCustomBaseSelect == true)
                series["__labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[i].name);
            else {
                series["__labelClass"] = "black";
            }
            if (series["__labelClass"] != "blue") {
                if (data[i].SeriesSampleSize >= 30 && data[i].SeriesSampleSize < 100) { series["__labelClass"] = "gray"; }
                if (data[i].data[j].StatValue > 1.96) { series["__labelClass"] = "green"; }
                if (data[i].data[j].StatValue < -1.96) { series["__labelClass"] = "red"; }
            }
            if (data[i].data[j].change == undefined || data[i].data[j].change == null) {
                series["__change"] = " (NA)";
            } else {
                series["__change"] = " (" + data[i].data[j].change.toFixed(1) + ")";
            }
        }
        chartData.push(angular.copy(series));
    }
    return chartData;
}
function prepareDataForGroupedColumnChart(data) {
    var chartData = [];
    series = {};
   //[ {  "State": "CA", "Under 5 Years": 30,   "5 to 13 Years": 44,    "14 to 17 Years": 215,    "18 to 24 Years": 385,   "25 to 44 Years": 106,  "45 to 64 Years": 88,    "65 Years and Over": 41}];    
    var index = getMaxCount(data);
    for (j = 0; j < data.length; j++) {
        series.State = data[j].name + "(" + (data[j].SeriesSampleSize == null ? "NA" : data[j].SeriesSampleSize) + ")";
        series["__sampleSize"] = data[j].SeriesSampleSize == null ? "NA" : data[j].SeriesSampleSize;
        series["__lowSampleSize"] = data[j].SeriesSampleSize == null || data[j].SeriesSampleSize < 30 ? "lowSampleSize" : "";
        for (i = 0, k = 0; i < data[index].data.length; i++, k++) {
            //if (1) {
            if (data[j].data[k].change == null || data[j].data[k].change == undefined) { series[data[j].data[k].x + "__change"] = " (NA)"; } else { series[data[j].data[k].x + "__change"] = " (" + data[j].data[k].change.toFixed(1) + ")"; }
            //}
            //Stat color
            if (data[j].data[k] != undefined && data[j].data[k].StatValue != undefined && data[j].data[k].StatValue != null && data[index].data[k].x != null) {                              
                if (isCustomBaseSelect == true)
                    series[data[index].data[k].x + "__labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[j].name);
                else {
                    series[data[index].data[k].x + "__labelClass"] = "black";
                }
                if (series[data[index].data[k].x + "__labelClass"] != "blue") {
                    if (data[j].SeriesSampleSize >= 30 && data[j].SeriesSampleSize < 100) { series[data[index].data[k].x + "__labelClass"] = "gray"; }

                    if (data[j].data[k].StatValue > 1.96) { series[data[index].data[k].x + "__labelClass"] = "green"; }
                    if (data[j].data[k].StatValue < -1.96) { series[data[index].data[k].x + "__labelClass"] = "red"; }
                }
            }
            if (i > data[j].data.length - 1 && k < data[index].data.length) {
                var prop = data[index].data[k].x;
                series[prop] = '';
                series[prop + "__nullIdentifier"] = 'DataIsNull';
            }
            else if (k < data[index].data.length) {
                if (data[index].data[k].x == data[j].data[i].x) {
                    var prop = data[j].data[i].x;
                    series[prop] = data[j].data[i].y;
                    series[prop + "__nullIdentifier"] = data[j].data[i].y == null ? 'DataIsNull' : 'DataIsNotNull';
                }
                else {
                    var prop = data[index].data[k].x;
                    series[prop] = '';
                    series[prop + "__nullIdentifier"] = 'DataIsNull';
                    i--;
                }
            }
            else
                break;
        }
        chartData.push(angular.copy(series));
    }
 return chartData;
}
function preparefullcolumnChartStackedData(data) {    
    var chartData = [];
    series = {};
    //[ {  "State": "CA", "Under 5 Years": 30,   "5 to 13 Years": 44,    "14 to 17 Years": 215,    "18 to 24 Years": 385,   "25 to 44 Years": 106,  "45 to 64 Years": 88,    "65 Years and Over": 41}];    
    var index = getMaxCount(data);
    for (j = 0; j < data.length; j++) {
        series = {};
        series.month = data[j].name;
        series["__sampleSize"] = data[j].SeriesSampleSize == null ? "NA" : data[j].SeriesSampleSize;
        series["__lowSampleSize"] = data[j].SeriesSampleSize < 30 || data[j].SeriesSampleSize == null ? "lowSampleSize" : "";
        
          // if(data[index].data.length!=data[j].data.length){
        for (i = 0, k = 0; i < data[index].data.length; i++, k++) {
            //Stat color
            if (isCustomBaseSelect == true)
                series[data[index].data[k].x + "__labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[j].name);
            else {
                series[data[index].data[k].x + "__labelClass"] = "black";
            }
            if (series[data[index].data[k].x + "__labelClass"] != "blue") {
                if (data[j].SeriesSampleSize >= 30 && data[j].SeriesSampleSize < 100) { series[data[index].data[k].x + "__labelClass"] = "gray"; }
                if (data[j].data[k].StatValue > 1.96) { series[data[index].data[k].x + "__labelClass"] = "green"; }
                if (data[j].data[k].StatValue < -1.96) { series[data[index].data[k].x + "__labelClass"] = "red"; }
            }

                   if (i > data[j].data.length - 1 && k < data[index].data.length) {
                       var prop = data[index].data[k].x;
                       series[prop] = '';
                       series[prop + "__nullIdentifier"] = 'DataIsNull';
                   }
                   else if (k < data[index].data.length) {
                       if (data[index].data[k].x == data[j].data[i].x) {
                           var prop = data[j].data[i].x;
                           series[prop] = data[j].data[i].y;
                           series[prop + "__nullIdentifier"] = data[j].data[i].y == null ? 'DataIsNull' : 'DataIsNotNull';
                       }
                       else {
                           var prop = data[index].data[k].x;
                           series[prop] = '';
                           series[prop + "__nullIdentifier"] = 'DataIsNull';
                           i--;
                       }
                   }
                   else
                       break;
                }
           chartData.push(angular.copy(series));
         } 
    return chartData;
}
function preparetrendData(data) {
    var xData = [];
    var chartData = [];
    series = {};
    //[ {  "State": "CA", "Under 5 Years": 30,   "5 to 13 Years": 44,    "14 to 17 Years": 215,    "18 to 24 Years": 385,   "25 to 44 Years": 106,  "45 to 64 Years": 88,    "65 Years and Over": 41}];    
    var index = getMaxCount(data);
    for (var i = 0; i < data[index].data.length; i++) {
        xData.push(data[index].data[i].x);
    }
    for (j = 0; j < data.length; j++) {
        series = {};
        series.month = data[j].name;
        series["sampleSize"] = data[j].SeriesSampleSize == null ? "NA" : data[j].SeriesSampleSize;
        series["lowSampleSize"] = data[j].SeriesSampleSize < 30 || data[j].SeriesSampleSize == null ? "lowSampleSize" : "";

        // if(data[index].data.length!=data[j].data.length){
        for (k = 0; k < data[index].data.length; k++) {
            var prop = data[index].data[k].x;
            //i is for new data, k is for max data
            //if the current indexed value is there or not ?
            if (data[j].data[k] == undefined || data[j].data[k] == null) {
                series[prop + "lss"] = "lowSampleSize";
                series[prop + "labelClass"] = "transparent";
                series[prop] = 0;
                series[prop + "labelClass"] = "transparent";
                //Sample size and change missing
            } else {
                if (data[index].data[k].x == data[j].data[k].x) {
                    series[prop] = data[j].data[k].y;
                    if (isCustomBaseSelect == true)
                        series[prop + "labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[j].name);
                    else {
                        series[prop + "labelClass"] = "black";
                    }
                    if (series[data[index].data[k].x + "labelClass"] != "blue") {
                        if (data[j].data[k].SampleSize == undefined || data[j].data[k].SampleSize < 30) { series[prop + "lss"] = "lowSampleSize"; }
                        if (data[j].data[k].SampleSize >= 30 && data[j].data[k].SampleSize < 100) { series[prop + "labelClass"] = "gray"; }
                        if (data[j].data[k].StatValue > 1.96) { series[prop + "labelClass"] = "green"; }
                        if (data[j].data[k].StatValue < -1.96) { series[prop + "labelClass"] = "red"; }
                    }
                    if (data[j].data[k].SampleSize == undefined || data[j].data[k].SampleSize < 30) { series[prop + "lss"] = "lowSampleSize"; }

                } else {
                    series[data[j].data[k].x + "lss"] = "lowSampleSize";
                    series[data[j].data[k].x + "labelClass"] = "transparent";
                    series[prop] = 0;
                    series[prop + "labelClass"] = "transparent";
                    //Sample size and change missing
                }
            }            
        }
        chartData.push(angular.copy(series));
    }

    //for (j = 0; j < data.length; j++) {
    //    series = {};
    //    series.month = data[j].name;
    //    series["sampleSize"] = data[j].SeriesSampleSize == null ? "NA" : data[j].SeriesSampleSize;
    //    series["lowSampleSize"] = data[j].SeriesSampleSize < 30 || data[j].SeriesSampleSize == null ? "lowSampleSize" : "";

    //    // if(data[index].data.length!=data[j].data.length){
    //    for (i = 0, k = 0; i < data[index].data.length; i++, k++) {
    //        //Stat color
    //        if (isCustomBaseSelect == true)
    //            series[data[index].data[k].x + "labelClass"] = getClassForChartLabelsBasedOnSelectedCustomBase(data[j].name);
    //        else {
    //            series[data[index].data[k].x + "labelClass"] = "black";
    //        }
    //        if (series[data[index].data[k].x + "labelClass"] != "blue") {
    //            if (data[j].data[k].SampleSize == undefined || data[j].data[k].SampleSize < 30) { series[data[index].data[k].x + "lss"] = "lowSampleSize"; }
    //            if (data[j].data[k].SampleSize >= 30 && data[j].data[k].SampleSize < 100) { series[data[index].data[k].x + "labelClass"] = "gray"; }
    //            if (data[j].data[k].StatValue > 1.96) { series[data[index].data[k].x + "labelClass"] = "green"; }
    //            if (data[j].data[k].StatValue < -1.96) { series[data[index].data[k].x + "labelClass"] = "red"; }
    //        }
    //        if (data[j].data[k].SampleSize == undefined || data[j].data[k].SampleSize < 30) { series[data[j].data[k].x + "lss"] = "lowSampleSize"; }
    //        if (i > data[j].data.length - 1 && k < data[index].data.length) {
    //            var prop = data[index].data[k].x;
    //            series[prop] = '';
    //            series[prop + "nullIdentifier"] = 'DataIsNull';
    //        }
    //        else if (k < data[index].data.length) {
    //            if (data[index].data[k].x == data[j].data[i].x) {
    //                var prop = data[j].data[i].x;
    //                series[prop] = data[j].data[i].y;
    //                series[prop + "nullIdentifier"] = data[j].data[i].y == null ? 'DataIsNull' : 'DataIsNotNull';
    //            }
    //            else {
    //                var prop = data[index].data[k].x;
    //                series[prop] = '';
    //                series[prop + "nullIdentifier"] = 'DataIsNull';
    //                i--;
    //            }
    //        }
    //        else
    //            break;
    //    }
    //    chartData.push(angular.copy(series));
    //}
    return chartData;
}
var getClassForChartLabelsBasedOnSelectedCustomBase = function (name) {
    var customBaseSelctdText1 = $('.stat-cust-estabmt.stat-cust-active').text();
    if (name == customBaseSelctdText1)
        return "blue";
    else
        return "black";
}

var prepareTrendChartData = function (chartdata) {
    var trendData = [];
    data = [];
    series = {};
  var color= ["#005cc0", "#17375e", "#912d3e", "#d0740d", "#21754f", "#76787a"];
    for (i = 0; i < chartdata.length; i++) {
        for (j = 0; j < chartdata[i].data.length; j++) {
            var currentdata=chartdata[i].data[j];
            series.x = currentdata.x;
            series.y = currentdata.y;
            data.push(angular.copy(series));
        }
        var css =  { "strokeWidth": 2, "fill": color[i], "symbol": "circle" };
        trendData.push({ "name": chartdata[i].name, "data": data, "style": css});
    }
    return trendData;
}

var chartTable = function (data) {
    var chartTableData = [];
    //var chartTableTree = {};
    //chartTableTree = [{ "id": value.id, "name": value.name, "data": [{}] }];

    //var ele = { data: [{ name: 'TOTAL VISITS' }, { name: 'BURGER KING' }, { name: 'Comparision1' }, { name: 'Comparision2' }, { name: 'Comparision3' }] };
    //chartTableData = [{ name: "dfad", value: 10 }, {}, {}];
    for (i = 0; i < data.length; i++) {
        var obj = {};
        obj.name = data[i];
        obj.value = 10;
        chartTableData.push(obj);

        chartTableData.column = data[i].name;
        for (j = 0; j < data[i].length; j++) {
            chartTableData.data = data[j].data[j];
        }
    }

}

var treeXTable = function (data) {
    var checkFlag = 0;
    var txt = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").attr("parent-text");
    if (controllername.includes("deepdive") && $(".trend").hasClass("active")) {
        txt = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").attr("parent-text");
        //checkFlag = 1;
    }
    if (controllername == "chartestablishmentcompare" && $(".trend").hasClass("active")) {
        //checkFlag = 1;
        txt = "Establishments";//$(".master-lft-ctrl[data-val='Groups']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").attr("parent-text");
    }
    if (controllername == "chartbeveragecompare" && $(".trend").hasClass("active")) {
        //checkFlag = 1;
        txt = "Beverages";//$(".master-lft-ctrl[data-val='Groups']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").attr("parent-text");
    }
    var newtabledata = [];
    var row = [];
    //header column
    var selectedFrequency = $('.FREQUENCY_topdiv_element').find('.sel_text').text();
    row.push({ x: selectedFrequency, samplesize: "", significance: "", css: "grey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    if (checkFlag == 1) {
        for (var i = 0; i < data[0].data.length; i++) {
            row.push({ x: data[0].data[i].x, samplesize: "", significance: "", css: "darkgrey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    } else {
        for (var i = 0; i < data.length; i++) {
            row.push({ x: data[i].name, samplesize: "", significance: "", css: "darkgrey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    }
    newtabledata.push(row);

    //sample size
    row = [];
    row.push({ x: "Sample Size", samplesize: "", significance: "", css: "grey font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    if (checkFlag == 1) {
        for (var index = 0; index < data[0].data.length; index++) {
            var temp_sampleSize = 0;
            for (j = 0; j < data.length; j++) {
                if (data[j].data[index].SampleSize != null || data[j].data[index].SampleSize != undefined) {
                    temp_sampleSize = temp_sampleSize + data[j].data[index].SampleSize;
                }
            }
            data[0].data[index].SeriesSampleSize = temp_sampleSize;
            row.push({ x: temp_sampleSize == undefined || temp_sampleSize == null ? "NA" : sampleSizeStatus(temp_sampleSize), samplesize: "", significance: "", css: "grey font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    } else {
        for (var index = 0; index < data.length; index++) {
            row.push({ x: data[index].SeriesSampleSize == undefined || data[index].SeriesSampleSize == null ? "NA" : sampleSizeStatus(data[index].SeriesSampleSize), samplesize: "", significance: "", css: "grey font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    }
    newtabledata.push(row);
    // Selected Measure Row
    row = [];
    row.push({ x: txt, samplesize: "", significance: "", css: "tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    if (checkFlag == 1) {
        for (var index = 0; index < data[0].data.length; index++) {
            row.push({ x: "", samplesize: "", significance: "", css: "tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    } else {
        for (var index = 0; index < data.length; index++) {
            row.push({ x: "", samplesize: "", significance: "", css: "tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
        }
    }
    newtabledata.push(row);
    /* Data Started */

    //To get the selected Measures
    var measuresList = [];
    if (checkFlag == 0) {
    var selectedMeasures = $('.Measures_topdiv_element .filter-info-panel-lbl');
    $.each(selectedMeasures, function (mI,mV) {
        //measuresList.push($($(mV)[0]).text().replace(',',''));
        measuresList.push($($(mV)[0]).find(".sel_text").text());//.replace(',', ''));
    });
    }
    //

    //IF selected Measure Not present from the Original data we are pushing with Empty
    //if (!$(".trend").hasClass("active")) {
    //    $.each(data, function (i, v) {
    //        $.each(measuresList, function (mi, mV) {
    //            var measureFound = false;
    //            $.each(v.data, function (a, b) {
    //                if (b.x.trim().toLowerCase() == mV.trim().toLowerCase()) {
    //                    measureFound = true;
    //                    return false;
    //                }
    //            });
    //            if (measureFound == false) {
    //                var obj = {};
    //                obj.BenchMarkPercentage = null;
    //                obj.SampleSize = null;
    //                obj.SampleSize = 0;
    //                obj.StatValue = null;
    //                obj.x = mV;
    //                obj.y = "";
    //                obj.z = null;
    //                v.data.push(obj);
    //            }
    //        });
    //    });
    //}
    //
    if (checkFlag == 1) {
        for (var rowlength = 0; rowlength < data.length; rowlength++) {
            row = [];
            row.push({ x: data[rowlength].name, samplesize: "", significance: "" });
            for (var i = 0; i < data[rowlength].data.length; i++) {
                if (data[0].data[i].SeriesSampleSize == "" || data[0].data[i].SeriesSampleSize == null)
                   row.push({ x:  "NA", samplesize: "", significance: "", css: "grey", dataCss: getFontColorBasedOnStatValue(data[rowlength].data[i].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                else if (data[0].data[i].SeriesSampleSize > 99)
                    row.push({ x: data[rowlength].data[i].y == "" || data[rowlength].data[i].y == null ? "NA" : data[rowlength].data[i].y == undefined ? "NA" : data[rowlength].data[i].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[rowlength].data[i].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                else if (data[0].data[i].SeriesSampleSize >= 30 && data[0].data[i].SeriesSampleSize <= 99)
                    row.push({ x: data[rowlength].data[i].y == "" || data[rowlength].data[i].y == null ? "NA" : data[rowlength].data[i].y == undefined ? "NA" : data[rowlength].data[i].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[rowlength].data[i].StatValue), useDirectionallyCss: "yellowcolor", useDirectionallyForCirleCSS: "yellowcolorcircle", useDirectionallyFortdCSS: "yellowcolortd" });
               else if (data[0].data[i].SeriesSampleSize < 30)
                   row.push({ x:  "&nbsp;", samplesize: "", significance: "", css: "grey", dataCss: getFontColorBasedOnStatValue(data[rowlength].data[i].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
               else
                   row.push({ x: data[rowlength].data[i].y == "" || data[rowlength].data[i].y == null ? "NA" : data[rowlength].data[i].y == undefined ? "NA" : data[0].data[i].SeriesSampleSize < 30 ? "&nbsp;" : data[rowlength].data[i].y.toFixed(1) + '%', samplesize: "", significance: "", css: "grey", dataCss: getFontColorBasedOnStatValue(data[rowlength].data[i].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
            }
            newtabledata.push(row);
        }
    } else {
        for (var rowlength = 0; rowlength < data[0].data.length; rowlength++) {
            row = [];
            row.push({ x: data[0].data[rowlength].x, samplesize: "", significance: "" });
            for (var i = 0; i < data.length; i++) {
                if (data[i].SeriesSampleSize == "" || data[i].SeriesSampleSize == null)
                    row.push({ x: "NA", samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                else if (data[i].SeriesSampleSize > 99)
                    row.push({ x: data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "NA" : data[i].data[rowlength].y == undefined ? "NA" : data[i].data[rowlength].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
               else if (data[i].SeriesSampleSize >= 30 && data[i].SeriesSampleSize <= 99)
                    row.push({ x: data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "NA" : data[i].data[rowlength].y == undefined ? "NA" : data[i].data[rowlength].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "yellowcolor", useDirectionallyForCirleCSS: "yellowcolorcircle", useDirectionallyFortdCSS: "yellowcolortd" });
                else if (data[i].SeriesSampleSize < 30)
                    row.push({ x: "&nbsp;", samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                else
                    row.push({ x: data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "NA" : data[i].data[rowlength].y == undefined ? "NA" : "NA"  , samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
            }
            newtabledata.push(row);
        }
    }
    return newtabledata;
    /* Data  End*/
};

//Establishment Compare only for trend Table implementation done by Bramhanath(24-05-2017)
var treeXTableForCompareTrend = function (data,Esttext) {
    var newtabledata = [], headerrow = [], sampleSizerow = [], establishmentRow = [];
    //header column
    var selectedFrequency = $('.FREQUENCY_topdiv_element').find('.sel_text').text();
    headerrow.push({ x: selectedFrequency, samplesize: "", significance: "", css: "grey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });

    for (var i = 0; i < data.length; i++) {
        headerrow.push({ x: data[i].name, samplesize: "", significance: "", css: "darkgrey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    }
    newtabledata.push(headerrow);
    //Empty sample size row
    headerrow = [];
    headerrow.push({ x: "", samplesize: "", significance: "", css: "gray font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    for (var i = 0; i < data.length; i++) {
        headerrow.push({ x: "", samplesize: "", significance: "", css: "darkgrey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    }
    newtabledata.push(headerrow);
    //Sub header
    headerrow = [];
    headerrow.push({ x: Esttext, samplesize: "", significance: "", css: "tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    for (var i = 0; i < data.length; i++) {
        headerrow.push({ x: "", samplesize: "", significance: "", css: "tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
    }
    newtabledata.push(headerrow);
    //to get Samplesize and Establishment value 
    for (var i = 0; i < data[0].data.length; i++) {
        var index = 0;
        $.each(data, function (a, b) {
            var obj = {};
            b.name;
            var d = b.data[i];
            var sampleSizeColor = ((d.SampleSize < 30) ? "transparent" : (d.SampleSize <= 99 ? "grayNotImp" : "black"));
            if (index == 0) {
                sampleSizerow = [];
                sampleSizerow.push({ x: "Sample Size", samplesize: "", significance: "", css: "grayNotImp bold font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                sampleSizerow.push({ x: d.SampleSize == "" || d.SampleSize == null ? "NA" : d.y == undefined ? "NA" : sampleSizeStatus(d.SampleSize), samplesize: "", significance: "", css: "grayNotImp bold", dataCss: "", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });

                establishmentRow = [];
                establishmentRow.push({ x: d.x, samplesize: "", significance: "", css: "font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                establishmentRow.push({ x: d.y == "" || d.y == null ? "NA" : d.y == undefined ? "NA" : d.y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getUseDirectionalColor(sampleSizeColor,d.StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
            }
            else {
                //sampleSizerow.push({ x: d.samplesize == undefined || d.samplesize == null ? "NA" : sampleSizeStatus(d.samplesize), samplesize: "", significance: "", css: "grey font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                sampleSizerow.push({ x: d.SampleSize == undefined || d.SampleSize == null ? "NA" : sampleSizeStatus(d.SampleSize), samplesize: "", significance: "", css: "grayNotImp bold font11", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
                establishmentRow.push({ x: d.y == "" || d.y == null ? "NA" : d.y == undefined ? "NA" : d.y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getUseDirectionalColor(sampleSizeColor, d.StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", useDirectionallyFortdCSS: "" });
            }
            index++;
        });
        newtabledata.push(sampleSizerow);
        newtabledata.push(establishmentRow);
    }
//
    return newtabledata;
}
//
var addMeaureText = function () {
    var txt = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").attr("parent-text");
    $(".measure-text").text('');
    $(".measure-text").text(txt);
}

var AssigningChartBasedOnNumberOfGuestMeasuresSelected = function (data, clickedIcon, selectedMeasure, parentText) {
    var mLength = currentMeasures.length;
    var pText = "", pele;
    var selectedLevel = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").attr("first-level-selection");
    var guestList = ["Brand Health Metrics", "Beverage Guest"];
    if (guestList.indexOf(selectedLevel) > -1) {
        pText = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").first().attr("parent-text");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").first().parent();
    } else {
        pText = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").last().attr("parent-text");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").last().parent();
    }

    //var mLength = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").length;
    //var pText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
    //var pele = $(".master-lft-ctrl[data-val='Measures']").find(".sidearrw_active").parent().find(".lft-popup-ele-label[data-val='" + pText + "']").parent();
    var chartType = '';
    if (pele == undefined || pele == null || pele == "" || pele.length == 0) {
        var pID = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("data-parent");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-id='" + pID + "']").parent();
    }
    var childCount = $(pele).attr("child-count");
    //one selection
    if (mLength == 1) {
        currentOutputChartType = "column";
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "0px -408px");
            $(".chrt-typ").removeClass("active");
            $(".col-chart").addClass("active");
            chartType = 'columnChart'; 
            columnChart(data);
        }
        else {
            $(".bar-chart").css("background-position", "-96px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'barChart';
            barChart(data);
        }
    }

    //multiple but not all
    if (mLength > 1 && mLength < childCount && parentText == 'Demographics' && selectedMeasure != "Hispanic Acculturation" && selectedMeasure != "Top 2 Box Attitudinal Statements" && selectedMeasure != "Top 2 Box Health & Wellness Attributes" && selectedMeasure != "Social Media Usage" && selectedMeasure != "Smartphone/Tablet Ownership") {
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "-883px -408px");
            $(".chrt-typ").removeClass("active");
            $(".col-chart").addClass("active");
            chartType = 'columnChartStacked';
            columnChartStacked(data);
        }
        else {
            $(".bar-chart").css("background-position", "-973px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'barChartStacked';
            barChartStacked(data);
        }
        currentOutputChartType = "stacked";
    }
    
        //All condition
    else if (mLength == childCount && parentText == 'Demographics' && selectedMeasure != "Hispanic Acculturation" && selectedMeasure != "Top 2 Box Attitudinal Statements" && selectedMeasure != "Top 2 Box Health & Wellness Attributes" && selectedMeasure != "Social Media Usage" && selectedMeasure != "Smartphone/Tablet Ownership") {
        //specific case for guest measures ,demo -> all 
        if (selectedMeasure == "Detailed Age: Other Nets" || selectedMeasure == "Marital Status") {
            currentOutputChartType = "stacked";
            if (clickedIcon == "col") {
                $(".col-chart").css("background-position", "-883px -408px");
                $(".chrt-typ").removeClass("active");
                $(".col-chart").addClass("active");
                chartType = 'columnChartStacked';
                columnChartStacked(data);
            }
            else {
                $(".bar-chart").css("background-position", "-973px -408px");
                $(".chrt-typ").removeClass("active");
                $(".bar-chart").addClass("active");
                chartType = 'barChartStacked';
                barChartStacked(data);
            }
        }
        else {
            currentOutputChartType = "fullstacked";
            if (clickedIcon == "col") {
                $(".col-chart").css("background-position", "-883px -408px");
                $(".chrt-typ").removeClass("active");
                $(".col-chart").addClass("active");
                chartType = 'fullcolumnChartStacked';
                fullcolumnChartStacked(data);
            }
            else {
                $(".bar-chart").css("background-position", "-973px -408px");
                $(".chrt-typ").removeClass("active");
                $(".bar-chart").addClass("active");
                chartType = 'fullbarChartStacked';
                fullbarChartStacked(data);
            }
        }
    }
        //Multiple/All condition
    else if (mLength > 1 && mLength < childCount || mLength == childCount) {
        currentOutputChartType = "group";
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "0px -408px");
            $(".chrt-typ").removeClass("active");
            $(".col-chart").addClass("active");
            chartType = 'groupedColumnChart';
            groupedColumnChart(data);
        }

        else {
            $(".bar-chart").css("background-position", "-96px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'groupedBarChart';
            groupedBarChart(data);
        }
    }
    return chartType;
}

var AssigningChartBasedOnNumberOfVisitMeasuresSelected = function (data, clickedIcon, selectedMeasure, parentText) {
    var mLength = currentMeasures.length;
    var pText = "", pele;
    if ($(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").attr("first-level-selection") == "Guest Measures") {
        pText = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").first().attr("parent-text");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").first().parent();
    } else {
        pText = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele-label[data-val='" + currentMeasures[0] + "']").last().attr("parent-text");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").last().parent();
    }

    //var mLength = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").length;
    //var pText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
    //var pele = $(".master-lft-ctrl[data-val='Measures']").find(".sidearrw_active").parent().find(".lft-popup-ele-label[data-val='" + pText + "']").parent();
    var chartType = '';
    if (pele == undefined || pele == null || pele == "" || pele.length == 0) {
        var pID = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("data-parent");
        pele = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-id='" + pID + "']").parent();
    }
    var childCount = $(pele).attr("child-count");
    //one selection
    if (mLength == 1) {
        currentOutputChartType = "column";
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "0px -408px");
            $(".chrt-typ").removeClass("active");
            $(".trend-chart").addClass("active");
            chartType = 'columnChart';
            columnChart(data);
        }
        else {
            $(".bar-chart").css("background-position", "-96px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'barChart';
            barChart(data);
        }
    }
    //multiple but not all
    if (mLength > 1 && mLength < childCount) {
        currentOutputChartType = "stacked";
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "-883px -408px");
            $(".chrt-typ").removeClass("active");
            $(".col-chart").addClass("active");
            chartType = 'columnChartStacked';
            columnChartStacked(data);
        }
        else {
            $(".bar-chart").css("background-position", "-973px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'barChartStacked';
            barChartStacked(data);
        }
    }

        //All condition
    else if (mLength == childCount) {
        //specific case for guest measures ,demo -> all 
        if (selectedMeasure == "Detailed Age: Other Nets" || selectedMeasure == "Parental Identification") {
            currentOutputChartType = "stacked";
            if (clickedIcon == "col") {
                $(".col-chart").css("background-position", "-883px -408px");
                $(".chrt-typ").removeClass("active");
                $(".col-chart").addClass("active");
                chartType = 'columnChartStacked';
                columnChartStacked(data);
            }
            else {
                $(".bar-chart").css("background-position", "-973px -408px");
                $(".chrt-typ").removeClass("active");
                $(".bar-chart").addClass("active");
                chartType = 'barChartStacked';
                barChartStacked(data);
            }
        }
        else if (selectedMeasure == "Coca-Cola Freestyle Machine impacted decision to go to outlet") {
            currentOutputChartType = "group";
            if (clickedIcon == "col") {
                $(".col-chart").css("background-position", "0px -408px");
                $(".chrt-typ").removeClass("active");
                $(".col-chart").addClass("active");
                chartType = 'groupedColumnChart';
                groupedColumnChart(data);
            }
            else {
                $(".bar-chart").css("background-position", "-973px -408px");
                $(".chrt-typ").removeClass("active");
                $(".bar-chart").addClass("active");
                chartType = 'groupedBarChart';
                groupedBarChart(data);
            }
        }
        else {
            currentOutputChartType = "fullstacked";
            if (clickedIcon == "col") {
                $(".col-chart").css("background-position", "-883px -408px");
                $(".chrt-typ").removeClass("active");
                $(".col-chart").addClass("active");
                chartType = 'fullcolumnChartStacked';
                fullcolumnChartStacked(data);
            }
            else {
                $(".bar-chart").css("background-position", "-973px -408px");
                $(".chrt-typ").removeClass("active");
                $(".bar-chart").addClass("active");
                chartType = 'fullbarChartStacked';
                fullbarChartStacked(data);
            }
        }
    }
        //Multiple/All condition
    else if (mLength > 1 || mLength == childCount) {
        currentOutputChartType = "group";
        if (clickedIcon == "col") {
            $(".col-chart").css("background-position", "0px -408px");
            $(".chrt-typ").removeClass("active");
            $(".col-chart").addClass("active");
            chartType = 'groupedColumnChart';
            groupedColumnChart(data);
        }
        else {
            $(".bar-chart").css("background-position", "-96px -408px");
            $(".chrt-typ").removeClass("active");
            $(".bar-chart").addClass("active");
            chartType = 'groupedBarChart';
            groupedBarChart(data);
        }
    }
    return chartType;
}

function verticalWrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.0, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y - width).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

function horizontalWrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
                words = text.text().trim().replace(/\/ |\//g, '/``').split(/``| /g).reverse(), //split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.0, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = 0;//parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
            //else {
            //    if (word.includes("(") && word.includes(")")) {
            //        line.pop();
            //        tspan.text(line.join(" "));
            //        line = [word];
            //        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            //    }
            //}
        }
    });
}

function horizontalWrapCount(_text, width) {
    $("#chart-visualisation").append('<svg height="0" width="0" class="toBeRemoved"><text x="0" y="0" class="textCompute"></text></svg>');
    var text = d3.select(".textCompute").text(_text);
    var words = text.text().trim().replace(/\/ |\//g, '/``').split(/``| /g).reverse(), //split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.0, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = 0;//parseFloat(text.attr("dy")),
    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
    }
    var count = $(".toBeRemoved>text tspan").length;
    $(".toBeRemoved").remove();
    return count;
}

function preparegroupedBarChartData(data) {
    //var data = {
    //    labels: [
    //      'resilience', 'maintainability', 'accessibility',
    //      'uptime', 'functionality', 'impact'
    //    ],
    //    series: [
    //      {
    //          label: '2012',
    //          values: [4, 8, 15, 16, 23, 42]
    //      },
    //      {
    //          label: '2013',
    //          values: [12, 43, 22, 11, 73, 25]
    //      },
    //      {
    //          label: '2014',
    //          values: [31, 28, 14, 8, 15, 21]
    //      }, ]
    //};
    var chartData = {labels:[],series:[]};
    var chartsubseries = {};
    var temp = {values:[]};
    for (i = 0; i < data.length; i++) {
        chartData.labels.push(angular.copy(data[i].name));
        }
        for (j = 0; j < data[0].data.length; j++) {
            temp.label = data[0].data[j].x;
            for (k = 0; k < data.length; k++) {
                temp.values.push(angular.copy(data[k].data[j].y));
            }
            chartsubseries.label = temp.label;
            chartsubseries.values = temp.values;
            temp = { values: [] };
            chartData.series.push(angular.copy(chartsubseries));
            chartsubseries = {};
        }  
    return chartData;
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

function getMaxCount(chartData) {
    var maxcount = 0, y = 0, maxindex = 0;
    for (i = 0; i < chartData.length; i++) {      
        for (j = 0; j < chartData[i].data.length; j++) {
            if (j > maxcount) {
                maxcount = j;
                maxindex = i;
            }
        }
    }
    return maxindex;
}

function capture(procName,data) {
    var imgString = '';
    $(".loader").show();
    $('.lowSampleSize').css('display', 'none');

    html2canvas($(".chart-bottomlayer"), {
        onrendered: function (canvas) {
             imgString = canvas.toDataURL("image/png");
             data.filter.Image = imgString;
             $.ajax({
                 url: appRouteUrl + "StoryBoard/Story/" + procName,
                 data: JSON.stringify(data),
                 method: "POST",
                 contentType: "application/json",
                 success: function (response) {
                     if (procName == "CreateReport")
                         alert("Report is Created");
                     else if(procName=="EditReport"){
                         alert(response);
                     }
                     else
                         alert("Slide is added to report");
                     $(".saveAsPopup").hide();
                     $(".save-reportPopup").hide();
                     $(".loader,.transparentBG").hide();
                 },
                 error: ajaxError
             });
           
        }
    });
}

var reset_img_pos_chart = function (Type) {
    $(".table-chart").css("background-position", "-242px -408px");
    $(".trend-chart").css("background-position", "-339px -408px");
    $(".column-chart").css("background-position", "-48px -408px");
    $(".bar-chart").css("background-position", "-144px -408px");
    $(".stackedcolumn-chart").css("background-position", "-930px -408px");
    $(".stackedbar-chart").css("background-position", "-1018px -408px");
    $(".barwithchange-chart").css("background-position", "-1112px -408px");
    $(".pyramid-chart").css("background-position", "-441px -406px");
    $(".pyramidwithchange-chart").css("background-position", "-1316px -406px");
   // //column //stacked //fullstacked //group //trend //stackedbar-chart
   // if (Type == "stackedbar") {
   //     $(".stackedbar-chart").css("background-position", "-886px -408px")
   // }
   //else if (Type == "stackedcolumn") {
   //     $(".stackedbar-chart").css("background-position", "-886px -408px")
   // }
   // else if (Type == "column")
   //     $(".column-chart").css("background-position", "0px -408px");
   // else if (Type == "bar")
   //     $(".bar-chart").css("background-position", "-95px -408px");
   // else if (Type == "table")
   //     $(".table-chart").css("background-position", "-192px -408px");
}

var createLegends = function (xData, svg, t_colorColumnStart, t_colorColumnStop) {
    $("#legend_div").remove();
    $(".chart-bottomlayer").append('<div id="legend_div"><div class="legend_center"></div></div>');
    var j = 0;
    xData.forEach(function (d, i) {
        var color = legendDisabledColor;
        if (legend_filter_list.indexOf("" + i + "") == (-1)) {
            color = "url(#C" + j + ")";
            var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C" + j)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[j]);
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[j]);
            j++;
        }
        $(".legend_center").append('<div class="legend_container" data-val="' + i + '"></div>');
        $(".legend_container:eq(" + i + ")").append('<svg width="10" height="10" class="rect_leg"><rect x="0" y="0" height="10" width="10" style="fill:'+color+'"/></svg>');
        $(".legend_container:eq(" + i + ")").append('<div class="text_leg">' + d + '</div>');
    });
    $(".legend_center").niceScroll();
}

var createLegendsForTrend = function (xData, svg, t_colorColumnStart, t_colorColumnStop) {
    $("#legend_div").remove();
    $(".chart-bottomlayer").append('<div id="legend_div"></div>');
    var j = 0; var colorForStroke = { "Colors": [] };
    xData.forEach(function (d, i) {
        var color = legendDisabledColor;
        if (legend_filter_list.indexOf("" + i + "") == (-1)) {
            colorForStroke.Colors.push(t_colorColumnStop[j]);
            color = "url(#C" + j + ")";
            var C = svg.append("defs")
                .append("linearGradient")
                .attr("id", "C" + j)
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[j]);
            C.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", t_colorColumnStart[j]);
            j++;
        } else { colorForStroke.Colors.push(legendDisabledColor);}
        $("#legend_div").append('<div class="legend_container" data-val="' + i + '"></div>');
        $(".legend_container:eq(" + i + ")").append('<svg width="20" height="11" class="rect_leg"><path fill="none" d="M 0 6 L 16 6" stroke-dasharray="2.5,2.5" stroke="' + colorForStroke.Colors[i] + '" stroke-width="2.5"></path><circle cx="9" cy="6" r="4" fill="'+ color +'" stroke="transparent" stroke-width="2" style="stroke: #fff;"></circle></svg>');
        $(".legend_container:eq(" + i + ")").append('<div class="text_leg">' + d + '</div>');
    });
}

function getChartType(chart) {
    var chartType = "col";
    if (active_chart_type != "") { return active_chart_type; }
    switch (chart) {
        case "PercentsStackedColumn" :
        case "Column3D":
        case "StackedColumn":
        case "ClusteredColumn":
            chartType="col";
            break;
        case "PercentsStackedBar":
        case "barChart":
        case "StackedBar":
        case "ClusteredBar":
            chartType = "bar";
            break;
        case "LineWithMarkers":
            chartType = "trend";
            break;
        case "table":
            chartType = "table"
            break;
    }
    return chartType;
}

//Stat test
var getSelectedStatTestText = function (fil) {
    var selectedstatText = $('.table-statlayer').find('.activestat').text().trim();
    fil.push({
        Name: "StatTest", Data: null, SelectedText: selectedstatText.trim().toLocaleLowerCase() == "custom base" ? $('.stat-cust-estabmt.stat-cust-active').text() : selectedstatText
    });
    return fil;
}
//

var getUseDirectionalColor=function(sampleSizeColor,statValue)
{
    if(sampleSizeColor == "black"){
        return getFontColorBasedOnStatValue(statValue);
    }else{
        if(sampleSizeColor == "grayNotImp"){
            if(getFontColorBasedOnStatValue(statValue) == "black"){
                return sampleSizeColor;
            }else{ return getFontColorBasedOnStatValue(statValue);}
        }else{
            return sampleSizeColor;
        }
    }
}

var getCurrentMeasureText = function () {
    if ($(".adv-fltr-toggle-container").css("display") != "none") { return "demographics"; } // $(".adv-fltr-toggle-container").is(':visible')
    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") { return "guest"; }        
    return "visit";
}

/* Start For low sample size in Pyramid chart @pkr */
var returnColorForSS = function (color, ss) {
    if (ss == undefined || ss == null || isNaN(ss) || ss < 30) {
        return "transparent";
    }
    return color;
}
/* End For low sample size in Pyramid chart @pkr */