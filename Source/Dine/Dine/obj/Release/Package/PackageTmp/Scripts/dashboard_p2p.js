/// <reference path="dashboard_demographic.js" />
controllername = "dashboardp2pdashboard";
var PieChartValuesLst = [];
var dashboarddata = [],AllPieChartData = [],allEstImageList=[];
var time_pie_chart_flag = 0, timePieData = 0;
var dynamicChanges = [{ "name": "Location Prior", "value": "none" }, { "name": "Planning Type", "value": "none" },
    { "name": "Companion Detail", "value": "none" }, { "name": "Primary Occasion Motvation", "value": "none" },
    { "name": "Primary Outlet Motivation", "value": "none" }, { "name": "Primary Mood", "value": "none" },
    { "name": "Destination after Visit", "value": "none" }, { "name": "Mode of Transport", "value": "none" },
    { "name": "Time Spent In Outlet", "value": "none" }, { "name": "Beverage Item", "value": "none" }, { "name": "Food Item", "value": "none" }];
$(document).ready(function () {

    $(".submodules-options-link").find("a").removeClass("active");
    $(".dashboard-demo").find("a").addClass("active");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>DEMOGRAPHIC | </span></div>");
    //$('.Time_Period_topdiv_element').html('');
    defaultTimePeriod();
    $("#NoteSample").css('visibility', 'visible');
    $('.time_of_day').hide();
});

var getTopAdvanceFilterId = function (fil) {
    var isVisits = "";
    var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
    fil.push({ Name: "Top Filter", Data: null, SelectedID: rtnSelctedFilterId });

    if (rtnSelctedFilterId == 2 || rtnSelctedFilterId == 3 || rtnSelctedFilterId == 4 || rtnSelctedFilterId == 6 || rtnSelctedFilterId == 7) {
        isVisits = 1;
    }
    else if (rtnSelctedFilterId == 8 || rtnSelctedFilterId == 5) {
        isVisits = 0;
    }
    else {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
            isVisits = 0;
        else
            isVisits = 1;
    }

    fil.push({
        Name: "IsVisit", Data: null, SelectedID: isVisits
    });
    return fil;
}

var clearOutputData = function () {
    reset_img_pos();
    $(".table-statlayer").css("display", "none");
    $(".advance-filters").css("display", "none");
    $(".lft-ctrl3").hide();
    //$(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
    //var seleIDsEstblmt = $(".master-lft-ctrl[data-val='Establishment']").find(".lft-popup-ele_active");
    //$.each(seleIDsEstblmt, function (index, ele) {
    //    $(ele).removeClass("lft-popup-ele_active");
    //    var element = $(ele).find(".lft-popup-ele-label");
    //    var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
    //    removeSelectedPanelElement(true, element, ctrl2);
    //});

    //var seleIDsDemoFltr = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele_active");
    //$.each(seleIDsDemoFltr, function (index, ele) {
    //    $(ele).removeClass("lft-popup-ele_active");
    //    var element = $(ele).find(".lft-popup-ele-label");
    //    var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
    //    removeSelectedPanelElement(true, element, ctrl2);
    //});

    $(".lft-popup-ele-next.sidearrw.sidearrw_active").removeClass("sidearrw_active");
    $(".master-lft-ctrl").parent().css("background", "none");
    $('.lft-popup-ele').css("background", "none");
    defaultGuestsSelect = true;
}

//To get p2p dashboard data 
var getDashboardData = function (filterPanelInfo) {
    $(".loader,.transparentBG").show();
    $.ajax({
        url: appRouteUrl + "DashBoard/GetDashboardData",
        data: JSON.stringify(filterPanelInfo),
        method: "POST",
        contentType: "application/json",
        success: function (data) {
            $('#p2p-dsbrd-BG').show();
            $('.p2p-dsbrd-BG-4rds').show();
            $(".pie_charts .main._idballon1").remove(); $(".dashboard-content").css("visibility","visible");
            dashboarddata = data.GetDashboardDataresp.GetDashboardDataRespdt;
            active_metric_name = "";
            dynamicChanges = [{ "name": "Location Prior", "value": "none" }, { "name": "Planning Type", "value": "none" },
    { "name": "Companion Detail", "value": "none" }, { "name": "Primary Occasion Motvation", "value": "none" },
    { "name": "Primary Outlet Motivation", "value": "none" }, { "name": "Primary Mood", "value": "none" },
    { "name": "Destination after Visit", "value": "none" }, { "name": "Mode of Transport", "value": "none" },
    { "name": "Time Spent In Outlet", "value": "none" }, { "name": "Beverage Item", "value": "none" }, { "name": "Food Item", "value": "none" }];
            PieChartValuesLst = retrnMetricList("Occasion Type", dashboarddata);
            BindDatatoBallonChart(PieChartValuesLst);//Append Balloon Pie Chart with data
            BindAvgDollarSpent(retrnMetricList("Average Per Diner", dashboarddata),true);//Average Dollars Spent
            BindDataForDayPart(retrnMetricList("Daypart", dashboarddata));//Append Balloon Pie Chart with data
            BindMealData(retrnMetricList("Meal Type", dashboarddata));//Append Meal with data
            BindDataForFB_Consumed(retrnMetricList("Visit Type - Detailed Nets", dashboarddata));//Append Food & Beverage Consumed
            Bind_time_spent_in_outlet(retrnMetricList("Time Spent In Outlet", dashboarddata), true);//Time Spent In Outlet
            Bind_avg_distance_travelled(retrnMetricList("Average Distance Travelled", dashboarddata));//Average Distance Travelled
            Bind_mode_of_transport(retrnMetricList("Mode of Transport", dashboarddata),true);//Mode of Transport
            Bind_location_prior(retrnMetricList("Location Prior", dashboarddata),true);//Location Prior
            Bind_planning_type(retrnMetricList("Planning Type", dashboarddata),true);//Planning Type
            Bind_companion_detail(retrnMetricList("Companion Detail", dashboarddata),true);//Companion Detail
            BindSatisfactionDrvers(retrnMetricList("Satisfaction", dashboarddata));//Satisfaction Drivers
            Bind_overall_satisfaction_top___box(retrnMetricList("Overall Satisfaction (Top 2 Box)", dashboarddata));//Overall Satisfaction (Top 2 Box)
            Bind_trip_activities(retrnMetricList("Trip Activity", dashboarddata));//Trip Activity
            Bind_distance_travelled(retrnMetricList("Distance Travelled", dashboarddata));//Distance Travelled
            FillAllStaticTexts();//To fill all static texts
            callAllPieCharts(AllPieChartData);//pie Chart
            var new_list = retrnMetricList("Destination after Visit", dashboarddata);
            Bind_destination_after_visit(new_list, true);
            Bind_beverage_item(retrnMetricList("Beverage Item", dashboarddata), true);//To Bind top Beverage Item
            Bind_food_item(retrnMetricList("Food Item", dashboarddata), true);//To Bind top Food Item
            Bind_primary_occasion_motvation(retrnMetricList("Primary Occasion Motvation", dashboarddata), true);//To Bind Occasion Motivation
            Bind_primary_outlet_motivation(retrnMetricList("Primary Outlet Motivation", dashboarddata), true);//To Bind Primary Outlet Motivation
            Bind_primary_mood(retrnMetricList("Primary Mood", dashboarddata), true);//To Bind Primary Outlet Motivation
            //to bind establishment image
            var seltdestablismt = $('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').text().trim();
            $('.establishmt_img').css("background-image", 'url("../Images/P2PDashboardEsthmtImages/' + seltdestablismt.replace(/\//g, "") + '.svg?v=2344")');//replace("/","")
            
            //
            $('.test').show();
            $('.POST_VISIT').show();
            $('.POST_VISIT_UPPER_TEXT').show();
            $('.POST_VISIT_LOWER_TEXT').show();
            $('.time_of_day').show();
            $(".dashboard-content").css("visibility","visible");
            $(".loader,.transparentBG").hide();
            $('.establishmt_img_div').show();
            $('.occsn-oulet-Ovrll').show();
            //Show/Update sample size
            //if ($(".sampleSizeNote").length == 0) {
            //    $(".table-statlayer>ul>li:eq(2)").last().after("<li class='sampleSizeNote'>Sample Size : " + addCommas(ss) + "</li>");
            //} else {
            //    $(".sampleSizeNote").text("Sample Size : "+ addCommas(ss));
            //}
            
        },
        error: ajaxError
    });
}
//function for adding commas

$.fn.digits = function () {
    return this.each(function () {
        $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    })
}
//
$(document).on("click", ".pdf-logo, .popup-hdrpdf_sample_size", function () {
    var value = $(this).attr("value");
    if ($(".dashboard-content").is(":visible") == false) {
        return;
    }
        //var filterPanelInfo = {};
        //filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        //filterPanelInfo.filter.push({
        //    Data: null, Name: "SKew_Or_Highestpercent", SelectedText: "", SelectedID: $('.pit').hasClass('active') ? 1 : 0
        //});
    $(".loader,.transparentBG").show();
    var leftpanelData = $(".Time_Period_topdiv_element").text().trim() + ", ";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        leftpanelData = leftpanelData.concat($(d).text().trim() + ", ");
    });
    var CustomBaseAdFilters = "|";
    $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
        CustomBaseAdFilters = CustomBaseAdFilters.concat($(d).text().trim() + ", ");
    });
    CustomBaseAdFilters = CustomBaseAdFilters.slice(0, -2);
    leftpanelData = leftpanelData.slice(0, -2);
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim();
    }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    var isSize = $('.pit').hasClass('active') ? true : false;
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").length > 0 ? $($(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']")[0]).text().trim() : "";

    var selctedFiltersOnly = "";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    var advnceFltrCustomBase = "";
    $(".Advanced_Filters_Custom_Base_topdiv_element .sel_text").each(function (i, d) {
            advnceFltrCustomBase = advnceFltrCustomBase.concat($(d).text().trim() + ", ");
    });
    advnceFltrCustomBase = advnceFltrCustomBase.slice(0, -2);
    $.ajax({
            url: appRouteUrl + "DashBoard/ExportToFullDashboardPPT",
            data: JSON.stringify({ "OutputData": dashboarddata, "NoOfRoads": (($("#p2p-dsbrd-BG object").attr("data")).indexOf("BG2") == -1 ? "4" : "3"), "changedData": dynamicChanges, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "pdf", "ss": ss, "isSize": isSize, "freq": freq, "isSampleSize": value, "CustomBaseData": CustomBaseAdFilters, "SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod, "AdvnceFltrCustomBase": advnceFltrCustomBase }),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDashboardPDF";//?path=" + response;
            else {
                //alert("Some error occured !");
            }
            $(".loader,.transparentBG").hide();
    },
            error: ajaxError
    });
});
$(document).on("click", ".ppt-logo, .popup-ppt_sample_size", function () {
    var value = $(this).attr("value");
    if ($(".dashboard-content").is(":visible") == false) {
        return;
    }
    var filterPanelInfo = {};
    filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
    filterPanelInfo.filter.push({
        Data: null, Name: "SKew_Or_Highestpercent", SelectedText: "", SelectedID: $('.pit').hasClass('active') ? 1 : 0
    });
    $(".loader,.transparentBG").show();
    var leftpanelData = $(".Time_Period_topdiv_element").text().trim() + ", ";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        leftpanelData = leftpanelData.concat($(d).text().trim() + ", ");
    });
    var CustomBaseAdFilters = "|";
    $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
        CustomBaseAdFilters = CustomBaseAdFilters.concat($(d).text().trim() + ", ");
    });
    CustomBaseAdFilters = CustomBaseAdFilters.slice(0, -2);
    leftpanelData = leftpanelData.slice(0, -2);
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim(); }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    var isSize = $('.pit').hasClass('active') ? true : false;
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").length > 0 ? $($(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']")[0]).text().trim() : "";

    var selctedFiltersOnly = "";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    var advnceFltrCustomBase = "";
    $(".Advanced_Filters_Custom_Base_topdiv_element .sel_text").each(function (i, d) {
            advnceFltrCustomBase = advnceFltrCustomBase.concat($(d).text().trim() + ", ");
    });
    advnceFltrCustomBase = advnceFltrCustomBase.slice(0, -2);

    $.ajax({
        url: appRouteUrl + "DashBoard/ExportToFullDashboardPPT",
        data: JSON.stringify({ "OutputData": dashboarddata, "NoOfRoads": (($("#p2p-dsbrd-BG object").attr("data")).indexOf("BG2") == -1 ? "4" : "3"), "changedData": dynamicChanges, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "ppt", "ss": ss, "isSize": isSize, "freq": freq, "isSampleSize": value, "CustomBaseData": CustomBaseAdFilters, "SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod, "AdvnceFltrCustomBase": advnceFltrCustomBase }),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDashboardPPT";///?path=" + response;
            else {
             //   alert("Some error occured !");
            }
            $(".loader,.transparentBG").hide();
        },
        error: ajaxError
    });
});
$(document).on("click", ".popup-ppt", function () {
    $(".loader,.transparentBGHigh").show();
    var leftpanelData = $(".Time_Period_topdiv_element").text().trim() + ", ";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        leftpanelData = leftpanelData.concat($(d).text().trim() + ", ");
    });
    leftpanelData = leftpanelData.slice(0, -2);
    var CustomBaseAdFilters = "|";
    $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
        CustomBaseAdFilters = CustomBaseAdFilters.concat($(d).text().trim() + ", ");
    });
    CustomBaseAdFilters = CustomBaseAdFilters.slice(0, -2);
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim(); }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").length > 0 ? $($(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']")[0]).text().trim() : "";

    var OutputData = (retrnMetricList(($(".inner_submit").attr("data-val")), dashboarddata));
    var isSize = $('.pit').hasClass('active') ? true : false;
    var selctedFiltersOnly = "";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    var advnceFltrCustomBase = "";
    $(".Advanced_Filters_Custom_Base_topdiv_element .sel_text").each(function (i, d) {
            advnceFltrCustomBase = advnceFltrCustomBase.concat($(d).text().trim() + ", ");
    });
    advnceFltrCustomBase = advnceFltrCustomBase.slice(0, -2);

    $.ajax({
        url: appRouteUrl + "DashBoard/PopupExportDashboard",
        async: true,
        data: JSON.stringify({ "DemofilterName": ($(".inner_submit").attr("data-val")), "OutputData": OutputData, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "ppt", "DemoTitle": $(".popup-hdrtxt").html().toUpperCase().trim(), "ss": ss, "isSize": isSize, "freq": freq, "CustomBaseData": CustomBaseAdFilters, "SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod, "AdvnceFltrCustomBase": advnceFltrCustomBase }),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDashboardPPT";///?path=" + response;
            else {
                //alert("Some error occured !");
            }
            $(".loader,.transparentBGHigh").hide();
        },
        error: function(){
            $(".transparentBGHigh").hide(); ajaxError
        }        
    });
});
$(document).on("click", ".popup-hdrpdf", function () {
    $(".loader,.transparentBGHigh").show();
    var leftpanelData = $(".Time_Period_topdiv_element").text().trim() + ", ";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        leftpanelData = leftpanelData.concat($(d).text().trim() + ", ");
    });
    leftpanelData = leftpanelData.slice(0, -2);
    var CustomBaseAdFilters = "|";
    $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
        CustomBaseAdFilters = CustomBaseAdFilters.concat($(d).text().trim() + ", ");
    });
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim(); }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").length > 0 ? $($(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']")[0]).text().trim() : "";
    var OutputData = (retrnMetricList(($(".inner_submit").attr("data-val")), dashboarddata));
    var isSize = $('.pit').hasClass('active') ? true : false;
    var selctedFiltersOnly = "";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    var advnceFltrCustomBase = "";
    $(".Advanced_Filters_Custom_Base_topdiv_element .sel_text").each(function (i, d) {
            advnceFltrCustomBase = advnceFltrCustomBase.concat($(d).text().trim() + ", ");
    });
    advnceFltrCustomBase = advnceFltrCustomBase.slice(0, -2);

    $.ajax({
        url: appRouteUrl + "DashBoard/PopupExportDashboard",
        async: true,
        data: JSON.stringify({ "DemofilterName": ($(".inner_submit").attr("data-val")), "OutputData": OutputData, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "pdf", "DemoTitle": $(".popup-hdrtxt").html().toUpperCase().trim(), "ss": ss, "isSize": isSize, "freq": freq, "CustomBaseData": CustomBaseAdFilters,"SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod, "AdvnceFltrCustomBase": advnceFltrCustomBase }),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDashboardPDF";///?path=" + response;
            else {
                //alert("Some error occured !");
            }
            $(".loader,.transparentBGHigh").hide();
        },
        error: function () {
            $(".loader,.transparentBGHigh").hide(); ajaxError
        }
    });
});

var preparePopupJSON = function () {
    var tempJSON = {"DemofilterName" : "", "Data" : "", };
}
/*@PKR*/
var drawBalloonPieChart = function (id, per, color1, color2) {
    var padding = 0;
    var height = $(id).height();
    var width = $(id).width();
    var arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 - padding)
      .startAngle(0)
      .endAngle(2 * Math.PI);
    var svg = d3.select(id).select("g");
    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color2);
    arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 - padding)
      .startAngle(0)
      .endAngle((2 * Math.PI) * (per / 100));
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color1);
}
var createBalloonPieChart = function (parent_id, classForElement, per, width_fact, color1, color2) {
    var cssClass = parent_id + " .main." + "_id" + classForElement;
    $(parent_id).append('<div class="main _id' + classForElement + '"><div class="submain"><p class="p_submain"></p><svg class="ballonPieChart ' + classForElement + '"><g></g></svg></div></div>');
    //need to change the css for height and width
    $(cssClass).css("height", width_fact + "px");
    $(cssClass).css("width", (width_fact / 1.181102362204724) + "px");
    drawBalloonPieChart(cssClass, per, color1, color2);
}
var createPieChart = function (parent_id, classForElement, per, width_fact, color1, color2) {
    var cssClass = parent_id + " .main." + "_id" + classForElement;
    var paddFact = 0;
    $(parent_id).append('<div class="main _id' + classForElement + '"><div class="submain pieClass"><svg class="PieChart ' + classForElement + '"><g></g></svg></div></div>');
    //Set height for PieChart
    $(cssClass).css("height", width_fact + "px");
    $(cssClass).css("width", width_fact + "px");
    var height = $(cssClass).height();
    var width = $(cssClass).width();
    var arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 - paddFact)
      .startAngle(0)
      .endAngle((2 * Math.PI));
    var svg = d3.select(cssClass).select("g");
    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color2);
    arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 - paddFact)
      .startAngle(0)
      .endAngle((2 * Math.PI) * (per / 100));
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color1);
}
$(window).resize(function () {
    $(".pie_charts .main._idballon1").remove();
    $(".OVERALL_SATISFACTION_CHRT .main._idballon1").remove();
    $(".OTHER_ACTIVITIES_CHRT .main._idballon1").remove();
    $(".TRAVELLED-OUT-OF-THE-WAY .main._idballon1").remove();
    if (time_pie_chart_flag == 1) {
        $(".Planning_Type .p_pieChart").html('');
        $(".Planning_Type").show(); $(".Planning_Type .p_img").hide();
        createTimePieChart(".Planning_Type .p_pieChart", "Pie4", timePieData, "#8dc63f", "transparent");
    }
    $.each(PieChartValuesLst, function (i, v)
    { callAllBalloonPieCharts(i,v.MetricValue); 
        //BindDatatoBallonChart(PieChartValuesLst);//Append Balloon Pie Chart with data
    });
    //Bind_planning_type(retrnMetricList("Planning Type", dashboarddata));//Planning Type   
    callAllPieCharts(AllPieChartData);
});
//Radio Click
var active_metric_name;
$(document).on("click", "#radio-click", function () {
    $('.bar-content-main-divleft #radio-click').removeClass("barcntntradioactiveimg");
    $('.bar-content-main-div #radio-click').removeClass("barcntntradioactiveimg");
    if ($(this).hasClass("barcntntradioactiveimg")) {
        $(this).removeClass("barcntntradioactiveimg");
    }
    else {
        active_metric_name=$(this).attr("data-val");
        $(this).addClass("barcntntradioactiveimg");
    }
    
});

$(document).on("click", "#plus_popup .popup-content .submit_popup .inner_submit", function () {
    $("#plus_popup, .transparentBG").hide(); $(".popup-vertcl-brdrdiv").hide();
    var data_val_active = $(this).attr("data-val")
    var DataArr = retrnMetricList(data_val_active, dashboarddata);
    $.each(DataArr, function (i, v) {
        if (active_metric_name == DataArr[i].MetricName) {
            //set the changes name in DynamicChange variable
            $.each(dynamicChanges, function (j, dd) {
                if (dd.name == data_val_active) {
                    dynamicChanges[j].value = active_metric_name; return false;
                }
            });
            var func_name = "Bind_" + removeBlankSpace(data_val_active);
            window[func_name]([DataArr[i]]);
            return false; cli
        }
    });
    //alert("Submitted");
});

//Popup OnClick
$(document).on("click", ".plus_icon_click", function () {
    
    //Give data val to Submit button
    $(".inner_submit").attr("data-val", $(this).attr("data-val"));
    var dataval = $(this).attr("data-val");
    if (dataval != "Food Item" && dataval != "Beverage Item")
        $(".popup-hdrtxt").html($(this).parent().find(".all_sub_head").text());
    else
    {
        if (dataval == "Beverage Item") { $(".popup-hdrtxt").html(dataval + "s"); } else { $(".popup-hdrtxt").html(dataval + "s"); }      // (NARTD)  
    }

    //Get Data for the Popup
    var DataArr = retrnMetricList($(this).attr("data-val"), dashboarddata);
    if ($(this).attr("data-val") == "Overall Satisfaction (Top 2 Box)") { DataArr = DataArr.slice(1); }
    $(".bar-content-header").html('');
    var subtext = "";
    if ($(this).attr("data-val") == "Primary Occasion Motvation" || $(this).attr("data-val") == "Primary Outlet Motivation" || $(this).attr("data-val") == "Primary Mood" || $(this).attr("data-val") == "Beverage Item" || $(this).attr("data-val") == "Food Item")
        subtext = $(this).parent().parent().find(".all_sub_text").text();
    else if( $(this).attr("data-val") == "Destination after Visit")
        subtext = $(".post-visit-txt-dyn-txt").text();
    else if ($(this).attr("data-val") == "Time Spent In Outlet")
    {
        if ($(".Time_Spent").find(".text").text() == '5 Min Or Less' || $(".Time_Spent").find(".text").text() == '91 Min Or More')
            subtext = $(".Time_Spent").find(".text").text();
        else
            subtext = $(".timespent_val").attr("data-val");
    }
    else if ($(this).attr("data-val") == "Dollars Spent")
        subtext = $(".Time_Spent").find(".text").text();
    else
        subtext = $(this).parent().find(".all_sub_text").text();
    
    var dashbordTopFoodItem = "";
    var j = 0;
    $(".popup-vertcl-brdrdiv").css("display", "none");
    //Create elements & Populate the Popup
    var kInd = Math.ceil((DataArr.length - 1) / 2), tempDataArr = DataArr;
    DataArr.forEach(function (d, i) {
        var reSize = d.MetricValue.toFixed(0);//10 + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) * 0.85;
        var signcolor = getFontColorBasedOnStatValue(d.Significancevalue) == "black" ? "#58595B" : getFontColorBasedOnStatValue(d.Significancevalue);
        if (dataval != "Food Item") {

            if (dataval == "Dollars Spent")
            {
                //Only for the Food Item Popup List Added by Bramhanath(11-07-2017)
                //if (i < 6) {
                if (i < kInd) {
                    dashbordTopFoodItem += '<div class="bar-content-main-divleft">';
                    dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-metric-name top-fditem-lnehght leftcntentmrgn">' + d.MetricName + '</div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div>';
                    if (tempDataArr.length > i + kInd) {
                        var curEle = tempDataArr[i + kInd];
                        signcolor = getFontColorBasedOnStatValue(curEle.Significancevalue) == "black" ? "#58595B" : getFontColorBasedOnStatValue(curEle.Significancevalue);
                        dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-metric-name top-fditem-lnehght rightcntentmrgn">' + curEle.MetricName + '</div><div class="bar-cntnt-metric-val">' + (curEle.MetricValue == undefined ? 0 : curEle.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(curEle.Change) + '</div></div></div></div></div></div>';
                    }
                }
            }

            else if (dataval == "Overall Satisfaction (Top 2 Box)" || dataval == "Trip Activities" || dataval == "Distance Travelled") {
                //For Pie Charts Popup only
                if (i % 2 == 0)
                    dashbordTopFoodItem += '<div class="bar-content-main-div"><div class="bar-cntnt-metric-brdr  onlyfor-without-rdobtns"></div><div class="bar-cntnt-metric-name onlyforpie-metricname">' + d.MetricName + '</div><div class="bar-cntnt-metric-div onlyforPie backgn-clr"><div class="bar-cntnt-innerdiv"><div class="bar-cntnt-outer"><div class="bar-cntnt-inner"><div class="bar-cnt-inner-dashdiv"> </div><div class="bar-cnt-inner-metrc-percnt" style="width:' + reSize + '%"></div></div></div></div><div class="bar-cnt-left-metrc-val-brdr"></div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div></div></div></div>';
                else
                    dashbordTopFoodItem += '<div class="bar-content-main-div"><div class="bar-cntnt-metric-brdr  onlyfor-without-rdobtns"></div><div class="bar-cntnt-metric-name onlyforpie-metricname">' + d.MetricName + '</div><div class="bar-cntnt-metric-div onlyforPie"><div class="bar-cntnt-innerdiv"><div class="bar-cntnt-outer"><div class="bar-cntnt-inner"><div class="bar-cnt-inner-dashdiv"> </div><div class="bar-cnt-inner-metrc-percnt" style="width:' + reSize + '%"></div></div></div></div><div class="bar-cnt-left-metrc-val-brdr"></div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div></div></div></div>';
                //
            }
            else {
                if (i % 2 == 0)
                    dashbordTopFoodItem += '<div class="bar-content-main-div"><div class="bar-cntnt-radiodiv"><div id="radio-click" class="bar-cntnt-radioimg" data-val="' + d.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr"></div><div class="bar-cntnt-metric-name">' + d.MetricName + '</div><div class="bar-cntnt-metric-div backgn-clr"><div class="bar-cntnt-innerdiv"><div class="bar-cntnt-outer"><div class="bar-cntnt-inner"><div class="bar-cnt-inner-dashdiv"> </div><div class="bar-cnt-inner-metrc-percnt" style="width:' + reSize + '%"></div></div></div></div><div class="bar-cnt-left-metrc-val-brdr"></div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div></div></div></div>';
                else
                    dashbordTopFoodItem += '<div class="bar-content-main-div"><div class="bar-cntnt-radiodiv"><div id="radio-click" class="bar-cntnt-radioimg" data-val="' + d.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr"></div><div class="bar-cntnt-metric-name">' + d.MetricName + '</div><div class="bar-cntnt-metric-div"><div class="bar-cntnt-innerdiv"><div class="bar-cntnt-outer"><div class="bar-cntnt-inner"><div class="bar-cnt-inner-dashdiv"> </div><div class="bar-cnt-inner-metrc-percnt" style="width:' + reSize + '%"></div></div></div></div><div class="bar-cnt-left-metrc-val-brdr"></div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div></div></div></div>';
                //if (d.MetricName == subtext) {
                //    $.each($('.bar-content-main-div #radio-click'), function (_a, _b) {
                //        $(_b).removeClass("barcntntradioactiveimg");
                //        if ($(_b).attr("data-val") == subtext) {
                //            $(_b).addClass("barcntntradioactiveimg");
                //            return false;
                //        }
                //    });
                //}

            }
                //$(".bar-content-header").append('<div class="bar-containers"><div class="half one"><div class="top one"><div class="shift_down">' + d.MetricName + '</div></div><div class="top two"><div class="inner"><div class="metric_val"><div>' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div></div></div><div class="outer">' + (d.Change == undefined ? 0 : (d.Change < 0 ? d.Change.toFixed(1) : "+" + d.Change.toFixed(1))) + '%</div></div></div><div class="half two"><div class="top one_right"></div><div class="top two"><div class="radio-click" data-val="' + d.MetricName + '"></div></div></div>');
                //ReSize the length based on Percentage of ".bar-content-header .top.two .inner div"
                //var reSize = d.MetricValue.toFixed(0);//10 + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) * 0.85;
                //Size is between 0 to 100 (10% to 95% : 85%)
                //$(".bar-content-header .bar-cnt-inner-metrc-percnt:eq(" + i + ")").css("width", reSize + "%");
                //reSize = 11 + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) * 0.77;
                //Move change value next to Metric Bar
                //$(".bar-content-header .top.two .outer:eq(" + i + ")").css("left", reSize + "%");
        }
        else {
            //Only for the Food Item Popup List Added by Bramhanath(11-07-2017)
            //if (i < 6) {
            if (i < kInd) {
                dashbordTopFoodItem += '<div class="bar-content-main-divleft">';
                dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-radiodivleft"><div id="radio-click" class="bar-cntnt-radioimg marginforradiotop" data-val="' + d.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr topfdbrdr"></div><div class="bar-cntnt-metric-name top-fditem-lnehght">' + d.MetricName + '</div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div>';
                if (tempDataArr.length > i + kInd) {
                    var curEle = tempDataArr[i + kInd];
                    signcolor = getFontColorBasedOnStatValue(curEle.Significancevalue) == "black" ? "#58595B" : getFontColorBasedOnStatValue(curEle.Significancevalue);
                    dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-radiodivleft"><div id="radio-click" class="bar-cntnt-radioimg marginforradiotop" data-val="' + curEle.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr topfdbrdr"></div><div class="bar-cntnt-metric-name top-fditem-lnehght">' + curEle.MetricName + '</div><div class="bar-cntnt-metric-val">' + (curEle.MetricValue == undefined ? 0 : curEle.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(curEle.Change) + '</div></div></div></div></div></div>';
                }
            }
                //if (j == 0) {
                //    dashbordTopFoodItem += '<div class="bar-content-main-divleft">';
                //    dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-radiodivleft"><div id="radio-click" class="bar-cntnt-radioimg marginforradiotop" data-val="' + d.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr topfdbrdr"></div><div class="bar-cntnt-metric-name top-fditem-lnehght">' + d.MetricName + '</div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div>';
                    
                //    j++;
                //}
                //else {
                //    dashbordTopFoodItem += '<div class="bar-content-left"><div class="bar-cntnt-radiodivleft"><div id="radio-click" class="bar-cntnt-radioimg marginforradiotop" data-val="' + d.MetricName + '"></div></div><div class="bar-cntnt-metric-brdr topfdbrdr"></div><div class="bar-cntnt-metric-name top-fditem-lnehght">' + d.MetricName + '</div><div class="bar-cntnt-metric-val">' + (d.MetricValue == undefined ? 0 : d.MetricValue.toFixed(0)) + '%</div><div class="bar-cntnt-brder"> </div><div class="bar-cntnt-change-val topfditemchange" style="color:' + signcolor + '">' + getChangeVal(d.Change) + '</div></div></div></div></div></div>';
                //    j = 0; 
                //}
                if (d.MetricName == subtext) {
                    
                }
            //}
            //Only for the Food Item Popup List Added by Bramhanath(11-07-2017)

        }

       
    });
    if (dataval == "Food Item" || dataval == "Dollars Spent") {
        $(".bar-content-header").append(dashbordTopFoodItem);
        $.each($('.bar-content-main-divleft #radio-click'), function (_a, _b) {
            $(_b).removeClass("barcntntradioactiveimg");
            if ($(_b).attr("data-val") == subtext) {
                $(_b).addClass("barcntntradioactiveimg");
                return false;
            }
        });
        var heightdynmic = $('.bar-content-main-divleft').length > 12 ? 437 : 39 * $('.bar-content-main-divleft').length;
        $(".popup-body").css("height", heightdynmic + "px");
        if (dataval == "Dollars Spent") {
            $("#plus_popup").css("height", "380.5px");
            $('.popup-hdr-stat-textdiv').hide();
            $(".submit_popup").css("display", "none");
            $('.popup-vertcl-brdrdiv').css("top", "41px");
            $('.popup-vertcl-brdrdiv').css("height", "341px");
        }
        else {
            $("#plus_popup").css("height", "557px");
            $('.popup-hdr-stat-textdiv').show();
            $(".submit_popup").css("display", "block");
        }
        SetScroll($(".bar-content-header"), "#F15F2E", 0, -8, 0, -8, 5);
        $(".submit_popup_div").css("margin-top", "10px");
     
        $(".popup-vertcl-brdrdiv").css("display", "block");
       
    }
    else if (dataval == "Overall Satisfaction (Top 2 Box)" || dataval == "Trip Activities" || dataval == "Distance Travelled") {
        $(".bar-content-header").append(dashbordTopFoodItem);
        $.each($('.bar-content-main-div #radio-click'), function (_a, _b) {
            $(_b).removeClass("barcntntradioactiveimg");
            if ($(_b).attr("data-val") == subtext) {
                $(_b).addClass("barcntntradioactiveimg");
                return false;
            }
        });
        var heightdynmic = $('.bar-content-main-divleft').length > 12 ? 437 : (39 * $('.bar-content-main-div').length);
        $(".popup-body").css("height", heightdynmic +"px");
        $("#plus_popup").css("height", ((heightdynmic) +  66) + "px");
        SetScroll($(".bar-content-header"), "#F15F2E", 0, -8, 0, -8, 5);
        $(".submit_popup_div").css("margin-top", "18px");
        $(".submit_popup").css("display", "none");
        $('.popup-hdr-stat-textdiv').hide();
    }
    else {
        $(".bar-content-header").append(dashbordTopFoodItem);
        $.each($('.bar-content-main-div #radio-click'), function (_a, _b) {
            $(_b).removeClass("barcntntradioactiveimg");
            if ($(_b).attr("data-val") == subtext) {
                $(_b).addClass("barcntntradioactiveimg");
                return false;
            }
        });
        var heightdynmic = $('.bar-content-main-div').length > 12 ? 437 : 39 * $('.bar-content-main-div').length;
        $(".popup-body").css("height", heightdynmic);
        SetScroll($(".bar-content-header"), "#F15F2E", 0, -8, 0, -8, 5);
        $("#plus_popup").css("height", (heightdynmic + 130) + "px");
        $(".submit_popup_div").css("margin-top", "18px");
        $(".submit_popup").css("display", "block");
        $('.popup-hdr-stat-textdiv').show();
    }

    //if (DataArr.length > 10) {
    //    $(".bar-containers").css("height", "20%");
    //} else {
    //    $(".bar-containers").css("height", (100 / DataArr.length) + "%");
    //}
    //$(".bar-containers").css("height", (100 / 3) + "%");
    //Show popup
    $("#plus_popup, .transparentBG").show();
    if ($(this).attr("staticValue") == "yes") {
        $(".submit_popup").css("display", "none");
        $(".popup1").find(".radio-click").hide();
    }
    else {
        if (dataval == "Dollars Spent")
            $(".submit_popup").css("display", "none");
        else
            $(".submit_popup").css("display", "block");
        $(".popup1").find(".radio-click").show();
    }
});

//Popup Close OnClick
$(document).on("click","#plus_popup .popup-content .close .popup-imageclse", function () {
    $("#plus_popup, .transparentBG").hide();
});
//sample size popup
$(document).on("click", ".SampleSizeBlock", function () {
    $('.popup-hdrtxt').text('SAMPLE SIZES');
    var timePeriod = dashboarddata[0].Month_Year;
    var adF = [];
    // adF.push($(".Guest_Visit.topdiv_element .filter-info-panel-lbl").text().trim().toLowerCase());
    adF.push("respondents");
    $.each($(".Advance_Filters_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) { adF.push($(d).text().trim().toLowerCase()); });
    $('.SampleFilters p').text(adF.join(', '));
    var DataArr = [];
    var totalSS = retrnMetricList("Overall Satisfaction (Top 2 Box)", dashboarddata)[0];
    totalSS.demofiltername = "Total";
    var DataArrTimeSpent = retrnMetricList("Time Spent In Outlet", dashboarddata)[0];
    DataArrTimeSpent.demofiltername = "Time Spent";
    var DataArrFood = retrnMetricList("Satisfaction: Food", dashboarddata)[0];
    var DataArrBev = retrnMetricList("Satisfaction: Beverages", dashboarddata)[0];
    var DataArrCleanliness = retrnMetricList("Satisfaction: Cleanliness", dashboarddata)[0];
    var DataArrAtmosphere = retrnMetricList("Satisfaction: Atmosphere", dashboarddata)[0];
    DataArr.push(totalSS, DataArrTimeSpent, DataArrFood, DataArrBev, DataArrCleanliness, DataArrAtmosphere)[0];
    $(".SampleTimePeriod").text(timePeriod);
    $(".EstName").text('Establishment - ' + dashboarddata[0].EstablishmentName);
    var customBase = $(".table-stat.activestat").text().trim().toLowerCase();
    (customBase == 'custom base') ? $(".CustomBase").text('Custom Base - ' + customCurrentSelections) : $(".CustomBase").text(customBase);
     
    var dashbordTopFoodItem = "";
    $('.SampleDataBlock').children().remove();
    DataArr.forEach(function (d, i) {
        if (i % 2 == 0) {
            $('.SampleDataBlock').append('<div class="SampleItemBlock" style="background:#E8E8E8;"><div class="SampleDemoFilter">' + d.demofiltername + '</div><div class="EstSample">' + d.TotalSamplesize + '</div><div class="CustomSample">' + d.StatSampleSize + '</div></div>');
            //$(".CustomSample").digits();
            //$('.SampleEst').addClass("even");
        }
        else {
            $('.SampleDataBlock').append('<div class="SampleItemBlock" style="background:#F0F0F0;"><div class="SampleDemoFilter">' + d.demofiltername + '</div><div class="EstSample">' + d.TotalSamplesize + '</div><div class="CustomSample">' + d.StatSampleSize + '</div></div>');
            //$('.SampleEst').addClass("odd");
        }
    });
    $(".EstSample,.CustomSample").digits();
    $(".PopUpSampleSizeBlock, .transparentBG").show();//, .transparentBG
});

$(document).on("click", ".popup-imageclse", function () {
    $("#plus_popup, .transparentBG").hide();
    $(".popup-vertcl-brdrdiv").hide();
    $(".PopUpSampleSizeBlock, .transparentBG").hide();

});

var callAllPieCharts = function (data) {
    $(".OVERALL_SATISFACTION_CHRT").html("");
    $(".OTHER_ACTIVITIES_CHRT").html("");
    $(".TRAVELLED-OUT-OF-THE-WAY").html("");
    createPieChart(".OVERALL_SATISFACTION_CHRT", "ballon1", data[0] == undefined?0:data[0], $(".OVERALL_SATISFACTION_CHRT").height(), "#f15f2e", "#dfdfdf");
    createPieChart(".OTHER_ACTIVITIES_CHRT", "ballon1", data[1] == undefined ? 0 : data[1], $(".OTHER_ACTIVITIES_CHRT").height(), "#f15f2e", "#dfdfdf");
    createPieChart(".TRAVELLED-OUT-OF-THE-WAY", "ballon1", data[2] == undefined ? 0 : data[2], $(".TRAVELLED-OUT-OF-THE-WAY").height(), "#f15f2e", "#dfdfdf");
}

var Bind_destination_after_visit = function (new_list1, flag) {
    //Get Highest valued data
    var new_list = flag == true ? [getHighestData(new_list1)] : [new_list1[0]];
    //Update the dynamicChanges
    dynamicChanges[6].value = new_list[0].MetricName;
    //var changeval = new_list[0].Change == undefined ? ("0.0%") : ((new_list[0].Change < 0 ? (new_list[0].Change.toFixed(1) + "%"): ("+" + new_list[0].Change.toFixed(1)) + "%"));
    $('.post_visit_value').html('');
    $('.post_visit_text2 .all_meric_per').html(new_list[0].MetricValue == undefined ? "0%" : new_list[0].MetricValue.toFixed(0) + "%");
    $('.post_visit_text2 .all_sig_text').html(getChangeVal(new_list[0].Change))
    $('.post_visit_text2 .all_sig_text').css('color', getFontColorBasedOnStatValue(new_list[0].Significancevalue));
    $('.post-visit-txt-dyn-txt').html(new_list[0].MetricName);
    
    //$(".POST_VISIT_LOWER_TEXT").find(".post_visit_text2").find(".post_visit_name").html(new_list[0].MetricName);
    //$(".POST_VISIT_LOWER_TEXT").find(".post_visit_text2").find(".post_visit_percent").html(new_list[0].MetricValue == undefined? "0%": new_list[0].MetricValue.toFixed(0) + "%");
    //change = '<div class="post_visit_change ' + getFontColorBasedOnStatValue(new_list[0].Significancevalue) + '"></div>';
    //$('.post_visit_value').append(change);
    //$(".post_visit_value").find(".post_visit_change").html((new_list[0].Change == undefined?"0.0": (new_list[0].Change < 0? new_list[0].Change.toFixed(1) : "+"+new_list[0].Change.toFixed(1))) + "%");
    ////Remove all other classes
    removeAllPostVisitClasses();
    if (new_list[0].MetricName == "Home")
        $(".POST_VISIT").find(".post_visit_icon").addClass("home_icon");
    else if(new_list[0].MetricName == "Work or job site")
        $(".POST_VISIT").find(".post_visit_icon").addClass("work_icon");
    else if(new_list[0].MetricName == "Store")
        $(".POST_VISIT").find(".post_visit_icon").addClass("store_icon");
    else if(new_list[0].MetricName == "School")
        $(".POST_VISIT").find(".post_visit_icon").addClass("school_icon");
    else if(new_list[0].MetricName == "An entertainment venue")
        $(".POST_VISIT").find(".post_visit_icon").addClass("entertainment_icon");
    else if(new_list[0].MetricName == "Restaurant")
        $(".POST_VISIT").find(".post_visit_icon").addClass("restaurant_icon");
    else if(new_list[0].MetricName == "A church or place of worship")
        $(".POST_VISIT").find(".post_visit_icon").addClass("church_icon");
    else if(new_list[0].MetricName == "The gym or fitness center")
        $(".POST_VISIT").find(".post_visit_icon").addClass("gym_icon");
    else if (new_list[0].MetricName == "Someone else’s home" || new_list[0].MetricName == "Someone else's home")
        $(".POST_VISIT").find(".post_visit_icon").addClass("someone_elses_home");
    else if (new_list[0].MetricName == "Somewhere else")
        $(".POST_VISIT").find(".post_visit_icon").addClass("somewhere_else");
}
var removeAllPostVisitClasses = function () {
    $(".POST_VISIT .post_visit_icon").removeClass("home_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("gym_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("church_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("restaurant_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("entertainment_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("school_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("store_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("work_icon");
    $(".POST_VISIT .post_visit_icon").removeClass("someone_elses_home");
    $(".POST_VISIT .post_visit_icon").removeClass("somewhere_else");
}
var callAllBalloonPieCharts = function (i, v) {
    var pieChrtroadCls = '';
    if (isThresholdLmt)
        pieChrtroadCls = ".pie_roads_3_" + i;
    else
        pieChrtroadCls = ".pie_roads_4_" + i;
    //createBalloonPieChart(".pie_charts" + i + " " + pieChrtroadCls, "ballon1", v, $(".pie_charts" + i).height(), "#F15F2E", "#DFDFDF");
    createBalloonPieChart(pieChrtroadCls, "ballon1", v, $(pieChrtroadCls).height(), "#F15F2E", "#DFDFDF");

}
var createTimePieChart = function (parent_id, classForElement, per, color1, color2) {
    var cssClass = parent_id + " .time_main." + "_id" + classForElement;
    var x_fact = 0.7, x_trans_Fact = 1.41, y_trans_Fact = 1.6;
    $(parent_id).append('<div class="time_main _id' + classForElement + '"><div class="submain"><p class="time_submain"></p><svg class="timePieChart ' + classForElement + '"><g></g></svg></div></div>');
    //Change the height and width of time_main based on image ratio
    $(cssClass).css("height",($(parent_id).height())*(150/237));
    $(cssClass).css("width",$(parent_id).width());
    var height = $(cssClass).height() * x_fact;
    var width = $(cssClass).width();
    var arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 * 1.17)
      .startAngle(0)
      .endAngle((2 * Math.PI));
    var svg = d3.select(cssClass).select("g");
    svg.attr("transform", "translate(" + (width / 2 * x_trans_Fact) + "," + (height / 2 * y_trans_Fact) + ")");
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color2);
    arc = d3.svg.arc()
      .innerRadius(0)
      .outerRadius(height / 2 * 1.17)
      .startAngle(0)
      .endAngle((2 * Math.PI) * (per / 100));
    svg.append("path")
    .attr("class", "arcMain")
    .attr("d", arc).style("fill", color1);
}
//Food & Beverage Consumed
var BindDataForFB_Consumed = function (data) {
    $(".FB_Consumed").show();
    $.each(data, function (i, v) {
        $(".FB_Consumed" + (i + 1) + " .per_text").html(v.MetricValue.toFixed(0) + "%");
        $(".FB_Consumed" + (i + 1) + " .text").html(v.MetricName);
        //var changeOrSkew = "";
        //changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $(".FB_Consumed" + (i + 1) + " .sig_text").html(getChangeVal(v.Change));
        //Assigning color based on sig value
        $(".FB_Consumed" + (i + 1) + " .sig_text").css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        //if (v.Significancevalue > 1.96) { $(".fb_consumed" + (i + 1) + " .sig_text").css("color", "green"); }
        //if (v.Significancevalue < -1.96) { $(".FB_Consumed" + (i + 1) + " .sig_text").css("color", "red"); }
    });
}
//DayPart data bind
var BindDataForDayPart = function (data) {
    $(".time_of_day").show();
    $.each(data, function (i, v) {
        $(".time_of_day" + (i + 1) + " .per_text .vertical-align").html(v.MetricValue.toFixed(0) + "%");
        $(".time_of_day" + (i + 1) + " .text").html(v.MetricName);
        //var changeOrSkew = "";
        //changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $(".time_of_day" + (i + 1) + " .sig_text").html(getChangeVal(v.Change));
        //Assigning color based on sig value
        $(".time_of_day" + (i + 1) + " .sig_text").css("color", getFontColorBasedOnStatValue(v.Significancevalue));
    });
}
//Time Spent In Outlet
var Bind_time_spent_in_outlet = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    //Update the dynamicChanges
    dynamicChanges[8].value = data[0].MetricName;
    $(".Time_Spent").show();
    $(".Time_Spent .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    if (data[0].MetricName == '5 Min Or Less' || data[0].MetricName == '91 Min Or More') {
        $(".Time_Spent .text").html(data[0].MetricName);
    }
    else {
        var min = data[0].MetricName.split('Min');
        var addminclass = "<div data-val='"+data[0].MetricName+ "' class='timespent_val'>" + min[0] + "</div><div class='timespent_min'>Min</div>";
        $(".Time_Spent .text").html(addminclass);
    }

    
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Time_Spent .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Time_Spent .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Location Prior
var Bind_location_prior = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    //Update the dynamicChanges
    dynamicChanges[0].value = data[0].MetricName;
    $(".Location_Prior").show();
    $(".Location_Prior_Images .t_img").show();
    $(".Location_Prior .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    $(".Location_Prior .text").html(data[0].MetricName);
    //Remove other classes
    removeOtherLocImageClasses();
    //Add current classes
    $(".Location_Prior_Images .t_img").addClass((data[0].MetricName).replace(/'/g, "_").replace(/ /g, '_'));
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Location_Prior .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Location_Prior .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Planning Type
var Bind_planning_type = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    //Update the dynamicChanges
    dynamicChanges[1].value = data[0].MetricName;
    //clear the div
    $(".Planning_Type .p_pieChart").html('');
    $(".Planning_Type").show(); $(".Planning_Type .p_img").hide();
    $(".Planning_Type .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    $(".Planning_Type .text").html(data[0].MetricName);
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Planning_Type .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Planning_Type .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
    if ("SPUR OF THE MOMENT" == data[0].MetricName.toUpperCase()) {
        //Call the TimePieChart 
        time_pie_chart_flag = 1; timePieData = data[0].MetricValue.toFixed(1);
        createTimePieChart(".Planning_Type .p_pieChart", "Pie4", data[0].MetricValue.toFixed(1), "#8dc63f", "transparent");
    }
    else if ("WELL AHEAD OF TIME" == data[0].MetricName.toUpperCase())
    {
        time_pie_chart_flag = 0; 
        //create planning image
        $(".Planning_Type .p_img").show();
        $(".Planning_Type .p_img").css("background-image", "url('../Images/P2PDashboardImages/P2P_Planning_Well.svg')");
    }
    else {
        time_pie_chart_flag = 0;
        //create planning image
        $(".Planning_Type .p_img").show();
        $(".Planning_Type .p_img").css("background-image", "url('../Images/P2PDashboardImages/P2P_Planning_Somewhat.svg')");
    }
    
}
//Companion Detail
var Bind_companion_detail = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    //Update the dynamicChanges
    dynamicChanges[2].value = data[0].MetricName;
    $(".Companion_Detail").show();
    $(".Companion_Detail .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    $(".Companion_Detail .text").html(data[0].MetricName);
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Companion_Detail .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Companion_Detail .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Average Distance Travelled
var Bind_avg_distance_travelled = function (data) {
    if (data.length > 0) {
        $(".Average_Distance_Travelled").show();
        if (data[0].MetricValue == 0)
        { $(".Average_Distance_Travelled .text .vertical-align").html(data[0].MetricValue); $(".Average_Distance_Travelled .miles_text .vertical-align").text("Mile"); }
        else
        {
            $(".Average_Distance_Travelled .text .vertical-align").html(data[0].MetricValue == null || data[0].MetricValue == "" ? "" : data[0].MetricValue.toFixed(0));
            if (data[0].MetricValue.toFixed(0) == 1 || data[0].MetricValue.toFixed(0) == 0) {
                $(".Average_Distance_Travelled .miles_text").text("Mile");
            } else {
                $(".Average_Distance_Travelled .miles_text").text("Miles");
            }
        }
    }
}
//Distance Travelled
var Bind_distance_travelled = function (data) {
    $(".Distance_Travelled").show();
    var dataNew = retrnMetricList("Distance Travelled Out Of Way", dashboarddata);
    $(".Distance_Travelled .t_per").html(dataNew[0].MetricValue.toFixed(0) + "%");
    AllPieChartData.push(dataNew[0].MetricValue == null || dataNew[0].MetricValue == "" ? "" : dataNew[0].MetricValue.toFixed(0));
    //var changeOrSkew = dataNew[0].Change == undefined || dataNew[0].Change == null ? "0.0%" : dataNew[0].Change > 0 ? "+" + dataNew[0].Change.toFixed(1) + "%" : dataNew[0].Change.toFixed(1) + "%";
    $(".Distance_Travelled .t_sig_text").html(getChangeVal(dataNew[0].Change));
    $(".Distance_Travelled .t_sig_text").css("color", getFontColorBasedOnStatValue(dataNew[0].Significancevalue));
    //var sum_of_metric_exceptzeormiles = 0;
    //$.each(data, function (i, v) {
    //    if (i != 0)
    //        sum_of_metric_exceptzeormiles = sum_of_metric_exceptzeormiles + v.MetricValue;
    //});

    ////
    //if (sum_of_metric_exceptzeormiles == 0)
    //{ $(".Distance_Travelled .t_per").html(sum_of_metric_exceptzeormiles + "%"); } else
    //    $(".Distance_Travelled .t_per").html(sum_of_metric_exceptzeormiles == null || sum_of_metric_exceptzeormiles == "" ? 0 : sum_of_metric_exceptzeormiles.toFixed(0) + "%");
    //$(".Distance_Travelled .text").html(data[0].MetricName);
    ////AllPieChartData.push(data[0].MetricValue == null || data[0].MetricValue == "" ? "" : data[0].MetricValue.toFixed(0));
    //AllPieChartData.push(sum_of_metric_exceptzeormiles == null || sum_of_metric_exceptzeormiles == "" ? 0 : sum_of_metric_exceptzeormiles.toFixed(0));
    //var changeOrSkew = "";
    ////changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    //$(".Distance_Travelled .t_sig_text").html(changeOrSkew);
    ////Assigning color based on sig value
    ////$(".Distance_Travelled .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Mode of Transport
var Bind_mode_of_transport = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    //Update the dynamicChanges
    dynamicChanges[7].value = data[0].MetricName;
    $(".Mode_of_Transport").show();
    $(".Mode_of_Transport .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    $(".Mode_of_Transport .text").html(data[0].MetricName);
    //Change the Image based on Mode of Transport
    //Remove previous classes
    removeAllModes();
    //Add current class
    $(".Mode_of_Transport .p_vehicle_icon").addClass(data[0].MetricName.replace(/ /g,'_').replace(/\\/g,'_').replace('/','_'));
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Mode_of_Transport .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Mode_of_Transport .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Overall Satisfaction (Top 2 Box)
var Bind_overall_satisfaction_top___box = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    $(".Overall_Satisfaction").show();
    $(".Overall_Satisfaction .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    //Plot Pie Chart
    AllPieChartData = [];
    AllPieChartData.push(data[0].MetricValue.toFixed(0));
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Overall_Satisfaction .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Overall_Satisfaction .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Trip Activity
var Bind_trip_activities = function (data) {
    $(".Trip_Activity").show();
    $(".Trip_Activity .all_sub_text").html(data[0].MetricName);
    $(".Trip_Activity .t_per").html(data[0].MetricValue.toFixed(0) + "%");
    //Plot Pie Chart
    AllPieChartData.push(data[0].MetricValue.toFixed(0));
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".Trip_Activity .t_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".Trip_Activity .t_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//Average dollar spent
var BindAvgDollarSpent = function (data1, flag) {
    //Get Highest valued data
    var data = flag == true ? [getHighestData(data1)] : [data1[0]];
    $(".avg_dollar_spent").show();
    $(".avg_dollar_spent .avg_per .vertical-align").html(data[0].MetricValue == null || data[0].MetricValue == undefined ? "$0" : ("$" + data[0].MetricValue.toFixed(0)));
    //Change the font size of value if greater than 99
    if (data[0].MetricValue != undefined && data[0].MetricValue.toFixed(0) > 99) { $(".avg_dollar_spent .avg_per").css("font-size", "0.8em"); } else { $(".avg_dollar_spent .avg_per").css("font-size", "0.9em"); }
    //var changeOrSkew = "";
    //changeOrSkew = data[0].Change == undefined || data[0].Change == null ? "0.0%" : data[0].Change > 0 ? "+" + data[0].Change.toFixed(1) + "%" : data[0].Change.toFixed(1) + "%";
    $(".avg_dollar_spent .avg_sig_text").html(getChangeVal(data[0].Change));
    //Assigning color based on sig value
    $(".avg_dollar_spent .avg_sig_text").css("color", getFontColorBasedOnStatValue(data[0].Significancevalue));
}
//To fill all the static texts
var FillAllStaticTexts = function () {
    var estType = dashboarddata[0].EstType;
    if (estType.toUpperCase() != "TOTAL") {
        estType = (estType.toUpperCase() == "RESTAURANTS" ? "RESTAURANT VISIT" : "RETAILER VISIT");
    } else {
        estType = "TOTAL VISIT";
        $(".static_texts .visit_text").addClass("total_visit");
    }
    $(".static_texts .visit_text .vertical-align").html(estType);
    $(".static_texts .tod_container div").show();
}
//To resize the images height and width
var resizeLocationImagesWidth = function () {
    var wdt = 0;
    removeOtherLocImageClasses();
    switch (cur_location_flag) {
        case "Home":  $(".Location_Prior_Images .t_img").addClass("Home"); break;
        case "The_gym_or_fitness_center": $(".Location_Prior_Images .t_img").addClass("The_gym_or_fitness_center"); break;
        case "Restaurant": $(".Location_Prior_Images .t_img").addClass("Restaurant"); break;
        case "School": $(".Location_Prior_Images .t_img").addClass("School"); break;
        case "Work_or_job_site": $(".Location_Prior_Images .t_img").addClass("Work_or_job_site"); break;
        case "Store": $(".Location_Prior_Images .t_img").addClass("Store"); break;
        case "Somewhere_else": $(".Location_Prior_Images .t_img").addClass("Somewhere_else"); break;
        case "Someone_else_s_home": $(".Location_Prior_Images .t_img").addClass("Someone_else_s_home"); break;
        case "An_entertainment_venue": $(".Location_Prior_Images .t_img").addClass("An_entertainment_venue"); break;
        case "A_church_or_place_of_worship": $(".Location_Prior_Images .t_img").addClass("A_church_or_place_of_worship"); break;
    }
}
//removeAllModes
var removeAllModes = function () {
    $(".Mode_of_Transport .p_vehicle_icon").removeClass("Walked");
    $(".Mode_of_Transport .p_vehicle_icon").removeClass("Cab__Car_Service");
    $(".Mode_of_Transport .p_vehicle_icon").removeClass("Public_Transportation");
    $(".Mode_of_Transport .p_vehicle_icon").removeClass("Other");
    $(".Mode_of_Transport .p_vehicle_icon").removeClass("Personal_Vehicle");
}
//removeOtherLocImageClasses
var removeOtherLocImageClasses = function () {
    $(".Location_Prior_Images .t_img").removeClass("Home");
    $(".Location_Prior_Images .t_img").removeClass("The_gym_or_fitness_center");
    $(".Location_Prior_Images .t_img").removeClass("Restaurant");
    $(".Location_Prior_Images .t_img").removeClass("School");
    $(".Location_Prior_Images .t_img").removeClass("Work_or_job_site");
    $(".Location_Prior_Images .t_img").removeClass("Store");
    $(".Location_Prior_Images .t_img").removeClass("Somewhere_else");
    $(".Location_Prior_Images .t_img").removeClass("Someone_else_s_home");
    $(".Location_Prior_Images .t_img").removeClass("An_entertainment_venue");
    $(".Location_Prior_Images .t_img").removeClass("A_church_or_place_of_worship");
}
/*@PKR*/

//Append Balloon Pie with data
var BindDatatoBallonChart = function (PieChartValuesLst) {
    $(".pie_charts").show();
    $('.ballon-chart-main').html('');
    var changeorSkew = "", metricvalue = "";
    var ballonPieChartData = "";
    var addIsthreshldClss = "";
    $.each(PieChartValuesLst, function (i, v) {
        callAllBalloonPieCharts(i, v.MetricValue);
        if (isThresholdLmt) {
            addIsthreshldClss = 'road_3_' + i;
            if (i == 3)
                return false;
        }
        else
            addIsthreshldClss = 'road_4_' + i;
        //changeorSkew = v.Change == null ? '0.0%' : parseFloat(v.Change).toFixed(1) + "%";
        //changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        metricvalue = v.MetricValue == null ? '0.0%' : parseFloat(v.MetricValue).toFixed(0) + "%";
        ballonPieChartData += '<div class="ballon-chart-main-div ' + v.MetricName + ' ' + addIsthreshldClss + '" >';
        ballonPieChartData += '<div class="bln-pie_chart-section"></div>';
        ballonPieChartData += '<div class="bln-data-icon-sectn">';
        ballonPieChartData += '<div class="data-icondiv">';
        ballonPieChartData += '<div class="data-icon ' + v.MetricName + '_img"></div>';
        ballonPieChartData += '<div class="data-text all_sub_head">' + v.MetricName + '</div>';
        ballonPieChartData += '</div>';
        ballonPieChartData += '<div class="dataval-sgnidiv">';
        ballonPieChartData += '<div class="data-val all_meric_per">' + metricvalue + '</div>';
        ballonPieChartData += '<div class="data-sgnif all_sig_text ' + getFontColorBasedOnStatValue(v.Significancevalue) + '">' + getChangeVal(v.Change) + '</div>';
        ballonPieChartData += '</div>';
        ballonPieChartData += '</div>';
        ballonPieChartData += '</div>';

    });
    $('.ballon-chart-main').append(ballonPieChartData);

}
//

//To return the MetricList
var retrnMetricList = function (demofiltername, dashboarddata) {

    var outputlist = [];
    if (demofiltername == "Satisfaction") {
        $.each(dashboarddata, function (i, v) {
            if (v.DemofilterName == "Satisfaction: Food" || v.DemofilterName == "Satisfaction: Beverages" || v.DemofilterName == "Satisfaction: Value (Top 2 Box)" || v.DemofilterName == "Satisfaction: Cleanliness" || v.DemofilterName == "Satisfaction: Atmosphere" || v.DemofilterName == "Satisfaction: Service (Top 2 Box)")
                outputlist.push({ MetricValue: v.MetricValue, MetricName: v.MetricName, Significancevalue: v.Significancevalue, Change: v.Change, Skew: v.Skew, isHighest: v.isHighest, demofiltername: v.DemofilterName, TotalSamplesize: v.TotalSamplesize, StatSampleSize: v.StatSampleSize });
        });
    }
    else {
        $.each(dashboarddata, function (i, v) {
            if (v.DemofilterName == demofiltername)
                outputlist.push({ MetricValue: v.MetricValue, MetricName: v.MetricName, Significancevalue: v.Significancevalue, Change: v.Change, Skew: v.Skew, EstablishmentName: v.EstablishmentName, isHighest: v.isHighest, demofiltername: v.DemofilterName, TotalSamplesize: v.TotalSamplesize, StatSampleSize: v.StatSampleSize });
        });

    }
    return outputlist;

}
//

//To Bind Meal Data 
var BindMealData = function (data) {
    $.each(data, function (i, v) {
        //var changeOrSkew = "";
        $('.meal-type' + i + ' .meal-type-val .vertical-align').html(v.MetricValue.toFixed(0) + "%");
        $('.meal-type' + i + ' .meal-type-txt').html(v.MetricName);
        //changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.meal-type' + i + ' .meal-type-chge').html(getChangeVal(v.Change));
        //Assigning color based on sig value
        $('.meal-type' + i + ' .meal-type-chge').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
    });
}
//

//To Bind Satisfaction Drivers
var BindSatisfactionDrvers = function (data) {
    $('.satifctn-drvrs').show();
    $('.satifctn-drvrs-hding').html('SATISFACTION DRIVERS');
    $.each(data, function (i, v) {
        //var changeOrSkew = "";
        $('.content' + i + ' .satifctn-drvrs-text').html(v.MetricName);
        $('.content' + i + ' .satifctn-drvrs-val').html(v.MetricValue.toFixed(0) + "%");
        //changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.content' + i + ' .satifctn-drvrs-change').html(getChangeVal(v.Change));
        //Assigning color based on sig value
        $('.content' + i + ' .satifctn-drvrs-change').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
    });
}
//

//To Bind Beverage
var Bind_beverage_item = function (data) {
    $('.food-n-bevge-main').show();
    $.each(data, function (i, v) {
        $('.bevg-metricval').html(v.MetricValue.toFixed(0) + "%");
        $('.bevg-name').html(v.MetricName);
        //var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.bevg-change-sign .vertical-align').html(getChangeVal(v.Change));
        $('.bevg-change-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        $('#bevg-imgdiv').css("background-image", 'url("../Images/P2PDashboardImages/Beverage_Items/' + v.MetricName.trim().replace(/\//g, "").replace("%","").replace("+","") + '.svg")')
        //Devide the CSS class
        $(".bevge-content, .food-content").removeClass("food-bev-align-center");
        var num = Math.round(+$(".bevg-name.all_sub_text").css("line-Height").slice(0, -2));
        if (!isNaN(num)) {
            if (Math.round(($(".bevg-name.all_sub_text")[0].offsetHeight) / num) < 3) {
                $(".bevge-content, .food-content").addClass("food-bev-align-center");
            }
        }
        if (i == 0)
            return false;
    });
}
//To Bind FoodItem 
var Bind_food_item = function (data) {
    $('.food-n-bevge-main').show();
    $.each(data, function (i, v) {
        $('.food-metricval').html(v.MetricValue.toFixed(0) + "%");
        $('.food-name').html(v.MetricName);
        //var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.food-change-sign .vertical-align').html(getChangeVal(v.Change));
        $('.food-change-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        $('#food-imgdiv').css("background-image", 'url("../Images/P2PDashboardImages/Food_Items/' + v.MetricName.trim().replace(/\//g, "") + '.svg")');        
        if (i == 0)
            return false;
    });
}

//To Bind Occasn Motivation
var Bind_primary_occasion_motvation = function (data) {
    
    $('.food-n-bevge-main').show();
    $.each(data, function (i, v) {
        $('.occsn-metrival').html(v.MetricValue.toFixed(0) + "%");
        //var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        //$('.occsn-metricnme').html(v.MetricName);
        $('.occsn-sign').html(getChangeVal(v.Change));
        $('.occsn-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        $('.occsn-metricnme').html(v.MetricName);
        $('#occsn-imgdiv').removeClass();
        $('#occsn-imgdiv').addClass(removeBlankSpace(v.MetricName) + "_img");
        if (i == 0)
            return false;
    });
}

//To Bind Outlet Motivation
var Bind_primary_outlet_motivation = function (data) {
    $('.food-n-bevge-main').show();
    $.each(data, function (i, v) {
        $('.outlt-metrival').html(v.MetricValue.toFixed(0) + "%");
        //var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.outlt-sign').html(getChangeVal(v.Change));
        $('.outlt-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        $('.outlt-metricnme').html(v.MetricName);
        $('#outlt-imgdiv').removeClass();
        $('#outlt-imgdiv').addClass(removeBlankSpace(v.MetricName) + "_img");
        if (i == 0)
            return false;
    });
}

//To Bind Overall Mood
var Bind_primary_mood = function (data) {
    $('.food-n-bevge-main').show();
    $.each(data, function (i, v) {
        $('.ovrl-metrival').html(v.MetricValue.toFixed(0) + "%");
        //var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
        $('.ovrl-sign').html(getChangeVal(v.Change));
        $('.ovrl-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
        $('.ovrl-metricnme').html(v.MetricName);
        $('#ovrl-imgdiv').removeClass();
        $('#ovrl-imgdiv').addClass(removeBlankSpace(v.MetricName) + "_img");
        if (i == 0)
            return false;
    });

}

//var Bind_destination_after_visit = function (data) {
//    $('.food-n-bevge-main').show();
//    $.each(data, function (i, v) {
//        $('.ovrl-metrival').html(v.MetricValue.toFixed(0) + "%");
//        var changeOrSkew = v.Change == undefined || v.Change == null ? "0.0%" : v.Change > 0 ? "+" + v.Change.toFixed(1) + "%" : v.Change.toFixed(1) + "%";
//        $('.ovrl-sign').html(changeOrSkew);
//        $('.ovrl-sign').css("color", getFontColorBasedOnStatValue(v.Significancevalue));
//        $('.ovrl-metricnme').html(v.MetricName);
//        $('#ovrl-imgdiv').removeClass();
//        $('#ovrl-imgdiv').addClass(removeBlankSpace(v.MetricName) + "_img");
//        if (i == 0)
//            return false;
//    });
//}

var removeAllEstablishemntClasses =function()
{
    allEstImageList.forEach(function (d, i) {
        $('.establishmt_img').removeClass(d);
    });
}

var getChangeVal = function (ch) {
    if (ch == undefined || ch == null) { return 0.0; }
    if (ch < 0) { return (+customRound(ch.toFixed(5),1)).toFixed(1); }
    if (ch > 0) {
        var res = (+customRound(ch.toFixed(5), 1)).toFixed(1);
        if (+res > 0) return '+' + res;
        return res;
    }
    return "0.0";
}

//For  frequency filters
var getSelectedFrequecnyFlter = function (fil) {
    fil.push({ Name: "Frequency Filters", Data: "", SelectedID: frequencyselectedIDforDemographics, MetricType: null });
    return fil;
}
var getCustomBaseFrequencyFilter = function (fil) {
    fil.push({ Name: "Frequency Filters Custom Base", Data: "", SelectedID: frequencyselectedIDforCustomBase, MetricType: null });
    return fil;
}
//Returns the highest flagged data item
var getHighestData = function (data) {
    var returnData = {};
    if (data != null || data.length == 0) {
        data.forEach(function (d, i) {
            if (d.isHighest == 1) {
                returnData = d;
                return d;
            }
        });
    }
    return returnData;
}