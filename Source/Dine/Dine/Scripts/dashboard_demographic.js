/// <reference path="dashboard_demographic.js" />
controllername = "dashboard_demographics";
var dashboarddata = [];
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".dashboard-demog").find("a").addClass("active");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>DEMOGRAPHIC | </span></div>");
    //$('.Time_Period_topdiv_element').html('');
    $(".dashboardguest").text("Guest");
    $(".dashboardvisit").text("Visit");
    $(".timperiodpittrendGuestVisit").show();
    defaultTimePeriod();
    $("#NoteSample").css('visibility','hidden');
    $('.time_of_day').hide();

    //hide sample size popup button in demographics dashboard
    $('.sampleSize').hide();
    $('.stattest-sign').css({ "right": "0px", "float": "right" });
    $('#NoteSample').css("margin-right","90px");


    //To append Guest/Visit Text in breadcrum Added by Bramhanath(15-11-2017)
    var selectedVisitsorGuests ="" ;
    if ($('.dashboardguest').hasClass('active'))
        selectedVisitsorGuests ='GUEST';
    else
       selectedVisitsorGuests = 'VISITS';
    
    if ($($(".filter-info-panel-elements")[0]).find(".Guest_Visit").length == 0)
        $(".filter-info-panel-elements").prepend("<div class='Guest_Visit topdiv_element' data-val = 'Guest_or_Visits'><div class='filter-info-panel-lbl'> <span class='left'> " + selectedVisitsorGuests + " </span></div><span class='pipe'>| </span></div>");
    else
        $(".Guest_Visit .filter-info-panel-lbl").html("<span class='left'> " + selectedVisitsorGuests + "</span>");
    //

});

//To get demographics dashboard data 
var getDashboardData = function (filterPanelInfo) {  
var selectedVisitsorGuests = "";
if ($('.dashboardguest').hasClass('active'))
        selectedVisitsorGuests = 'GUEST';
else
        selectedVisitsorGuests = 'VISITS';

    if($($(".filter-info-panel-elements")[0]).find(".Guest_Visit").length == 0)
        $(".filter-info-panel-elements").prepend("<div class='Guest_Visit topdiv_element' data-val = 'Guest_or_Visits'><div class='filter-info-panel-lbl'> <span class='left'> " + selectedVisitsorGuests + " </span></div><span class='pipe'>| </span></div>");
else
        $(".Guest_Visit .filter-info-panel-lbl").html("<span class='left'> " + selectedVisitsorGuests + "</span>");
    //
    var filterPanelInfo = {
};
    filterPanelInfo = {
        filter: JSON.parse($("#master-btn").attr('data-val'))
    };
      if ($(".table-stat.activestat").text().trim().toLocaleLowerCase() == "custom base") {
          filterPanelInfo.filter = filterPanelInfo.filter.map(function (d) {
              if (d.Name == "StatTest" && d.SelectedText == "CUSTOM BASE") {
                  customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
                  d.SelectedText = $(".Custom_Base_topdiv_element .sel_text").text().trim();
                  $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
              }
              return d;
          });   
    }
      $(".loader,.transparentBG").show();
$.ajax({
    url: appRouteUrl + "DashBoard/GetOutputDataForDemogpcs",
    data: JSON.stringify(filterPanelInfo),
    method: "POST",
    contentType: "application/json",
    success: function (data) {
       
        dashboarddata = data.GetDashboardDataresp.GetDashboardDataRespdt;
        setTimeout(function () {
            if (dashboarddata != null || dashboarddata != []) {
                $(".showandhidedemog").css("visibility", "visible");
                $(".dashboard-content").css("visibility", "visible");
                fillGenderData(dashboarddata.slice(0, 2));
                fillAgeData(dashboarddata.slice(2, 2 + 6));
                fillEthnicity(dashboarddata.slice(8, 8 + 5));
                fillOccupation(dashboarddata.slice(13, 13 + 6));
                fillDHS(dashboarddata.slice(19, 19 + 4));
                fillMaritalStatusData(dashboarddata.slice(23, 23 + 2));
                fillParentalStatusData(dashboarddata.slice(25, 26));
                fillHouseholdIncomeData(dashboarddata.slice(26, 26 + 3));
                fillSocioEconomicData(dashboarddata.slice(29, 33));
                fillDinnerAttitudeData(dashboarddata.slice(33, 43));
                fillAvgMonthlyChannelData(dashboarddata.slice(43, 49));
                //Update establishment image
                $('.est-logo-container .est-logo').css("background-image", 'url("../Images/P2PDashboardEsthmtImages/' + dashboarddata[0].EstablishmentName.replace(/\//g, "") + '.svg?v=34")');
                //Show/Update sample size
                if ($(".sampleSizeNote").length == 0) {
                    $(".table-statlayer>ul>li:eq(2)").last().after("<li class='sampleSizeNote'>Sample Size : " + addCommas(ss) + "</li>");
                } else {
                    $(".sampleSizeNote").text("Sample Size : " + addCommas(ss));
                }
            }
            $(".loader,.transparentBG").hide();
          
        }, 100);
    },
    error: ajaxError
});
}

$(document).on("click", ".ppt-logo", function () {
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
    leftpanelData = leftpanelData.slice(0, -2);
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim(); }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    var guestOrVisit = getGuestOrVisit();
    var isSize = $('.pit').hasClass('active') ? true : false;
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").text().trim();
    var selctedFiltersOnly ="";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    $.ajax({
        url: appRouteUrl + "DashBoard/ExportToDemogDashboardPPT",
        data: JSON.stringify({ "OutputData": dashboarddata, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "ppt", "ss": ss, "guestOrVisit": guestOrVisit, "isSize": isSize, "freq": freq, "SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod }),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDemogDashboardPPT/?path=" + response;
            else {
                //   alert("Some error occured !");
            }
            $(".loader,.transparentBG").hide();
        },
        error: ajaxError
    });
});
$(document).on("click", ".pdf-logo", function () {
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
    leftpanelData = leftpanelData.slice(0, -2);
    var statTest = "PREVIOUS PERIOD";
    if ($(".table-stat.activestat").text().trim() == "CUSTOM BASE") {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 1) { statTest = $(".Custom_Base_topdiv_element .sel_text").text().trim(); }
    } else {
        statTest = $(".table-stat.activestat").text().trim();
    }
    var guestOrVisit = getGuestOrVisit();
    var isSize = $('.pit').hasClass('active') ? true : false;
    var freq = $(".lft-popup-ele_active .lft-popup-ele-label[parent-text='Frequency Filters']").text().trim();
    var selctedFiltersOnly = "";
    $(".Advance_Filters_topdiv_element .sel_text").each(function (i, d) {
        if (frequencycheckToPrepareFilter.indexOf($(d).text().trim().toLocaleLowerCase()) == -1)
            selctedFiltersOnly = selctedFiltersOnly.concat($(d).text().trim() + ", ");
    });
    selctedFiltersOnly = selctedFiltersOnly.slice(0, -2);
    var selectedTimeperiod = $(".Time_Period_topdiv_element").text().trim();
    $.ajax({
        url: appRouteUrl + "DashBoard/ExportToDemogDashboardPPT",
        data: JSON.stringify({ "OutputData": dashboarddata, "LeftpanelData": leftpanelData, "statTest": statTest, "pptOrPdf": "pdf", "ss": ss, "guestOrVisit": guestOrVisit, "isSize": isSize, "freq": freq, "SelctedFiltersOnly": selctedFiltersOnly, "TimePeriod": selectedTimeperiod }),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response != "error")
                window.location.href = appRouteUrl + "DashBoard/DownloadFullDemogDashboardPDF/?path=" + response;
            else {
                //   alert("Some error occured !");
            }
            $(".loader,.transparentBG").hide();
        },
        error: ajaxError
    });
});

var getSelectedFrequecnyFlter = function (fil) {
    fil.push({ Name: "Frequency Filters", Data: "", SelectedID: frequencyselectedIDforDemographics, MetricType: null });
    return fil;
}
var getCustomBaseFrequencyFilter = function (fil) {
    return fil;
}

var getselectSkeworHigh = function (fil)
{
    fil.push({ Data: null, Name: "SKew_Or_Highestpercent", SelectedText: "", SelectedID: $('.pit').hasClass('active') ? 0 : 1 });
    return fil;
}

var getSelectedadditionalfilterForDemogdash = function (fil) {
    fil.push({ Name: "Additional FiltersDemog", Data: dataforDemodashbord, SelectedID: IDsDemo, MetricType: "" });
    return fil;
}

var getVisitsorGuests = function (fil)
{
    fil.push({ Name: "IsVisit", Data: "", SelectedID: $('.dashboardguest').hasClass('active') ? 0 : 1, MetricType: "" });
    return fil;
}

/* Start Functions to fill output area @PKR*/
var fillGenderData = function (data) {
    let i = 0;
    if (data == null || data.length != 2 || data == []) { return; }
    $(".gender-section").removeClass("active-widget");
    for (i = 0; i < 2; i++) {
        //Fill age Metric texts
        $(".gender-text .metric-text:eq(" + i + ") .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".gender-text .metric-values:eq(" + i + ") .mValDemog").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".gender-text .metric-values:eq(" + i + ") .cValDemog").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".gender-text .metric-values:eq(" + i + ") .cValDemog").removeClass("plus minus");
        $(".gender-text .metric-values:eq(" + i + ") .cValDemog").addClass(returnChangeClass(data[i].Significancevalue));
        //Set active-widget
        if (data[i].Flag == 1) { $(".gender-section:eq(" + i + ")").addClass("active-widget"); }
    }
    plotGenderChart(data);
}
var fillAgeData = function (data) {
    let i=0;
    if (data == null || data.length != 6 || data == []) { return; }
    $(".age-ind-section").removeClass("active-widget");
    for (i = 0; i < 6; i++) {
        //Fill age Metric texts
        $(".age-ind-section[pos=" + (i + 1) + "] .age-text .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".age-ind-section[pos=" + (i + 1) + "] .age-values .mValDemog").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".age-ind-section[pos=" + (i + 1) + "] .age-values .cValDemog").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".age-ind-section[pos=" + (i + 1) + "] .age-values .cValDemog").removeClass("plus minus");
        $(".age-ind-section[pos=" + (i + 1) + "] .age-values .cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".age-ind-section[pos=" + (i + 1) + "]").addClass("active-widget"); }
    }
    //Plot the Age Chart
    plotAgeChart(data);
}
var fillEthnicity = function (data) {
    let i = 0;
    if (data == null || data.length != 5 || data == []) { return; }
    $(".eth-sub-container").removeClass("active-widget");
    for (i = 0; i < 5; i++) {
        //Fill age Metric texts
        $(".eth-1:eq(" + i + ") .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".eth-2:eq(" + i + ").mValDemog .vertical-align").text(returnFormattedValues(data[i].MetricValue) + "%");
        //Fill age change
        $(".eth-3:eq(" + i + ").cValDemog .vertical-align").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".eth-3:eq(" + i + ").cValDemog").removeClass("plus minus");
        $(".eth-3:eq(" + i + ").cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".eth-sub-container:eq(" + i + ")").addClass("active-widget"); }
    }
}
var fillOccupation = function (data) {
    let i = 0;
    if (data == null || data.length != 6 || data == []) { return; }
    $(".occ-container").removeClass("active-widget");
    for (i = 0; i < 6; i++) {
        //Fill age Metric texts
        $(".occ-text:eq(" + i + ") .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".occ-values:eq(" + i + ") .mValDemog .vertical-align").text(returnFormattedValues(data[i].MetricValue) + "%");
        //Fill age change
        $(".occ-values:eq(" + i + ") .cValDemog .vertical-align").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".occ-values:eq(" + i + ") .cValDemog .vertical-align").removeClass("plus minus");
        $(".occ-values:eq(" + i + ") .cValDemog .vertical-align").addClass(returnChangeClass(data[i].Significancevalue));
        //Fill line chart
        if ($(".occ-container:eq(" + i + ") .bar-chart")[0].getSVGDocument() != null && $(".occ-container:eq(" + i + ") .bar-chart")[0].getSVGDocument().querySelector(".line-fill") != null) {
            fillLineChart($(".occ-container:eq(" + i + ") .bar-chart")[0].getSVGDocument().querySelector(".line-fill"), data[i].MetricValue);
        }
        //Set active-widget
        if (data[i].Flag == 1) { $(".occ-container:eq(" + i + ")").addClass("active-widget"); }
    }
}
var fillDHS = function (data) {
    let i = 0;
    if (data == null || data.length != 4 || data == []) { return; }
    $(".dhs-container").removeClass("active-widget");
    //For Avg HH
    $(".dhs-container:eq(0) .tval .vertical-align").text(data[0].MetricName);
    $(".dhs-container:eq(0) .mValDemog .vertical-align").text(returnFormattedValues(data[0].MetricValue, 1));
    $(".dhs-container:eq(0) .cValDemog .vertical-align").text(returnFormattedChangeValues(data[0].Change, 1));
    $(".dhs-container:eq(0) .cValDemog .vertical-align").removeClass("plus minus");
    $(".dhs-container:eq(0) .cValDemog .vertical-align").addClass(returnChangeClass(data[0].Significancevalue));
    for (i = 1; i < 4; i++) {
        //Fill age Metric texts
        $(".dhs-container:eq(" + i + ") .dhs-text .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".dhs-container:eq(" + i + ") .dhs-mVal").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".dhs-container:eq(" + i + ") .dhs-cVal").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".dhs-container:eq(" + i + ") .dhs-cVal").removeClass("plus minus");
        $(".dhs-container:eq(" + i + ") .dhs-cVal").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".dhs-container:eq(" + i + ")").addClass("active-widget"); }
        fillDHSsvg($(".dhs-container:eq(" + i + ") .dhs-image"), data[i]);
    }
}
var fillMaritalStatusData = function (data) {
    let i = 0;
    if (data == null || data.length != 2 || data == []) { return; }
    $(".ms-container").removeClass("active-widget");
    for (i = 0; i < 2; i++) {
        //Fill age Metric texts
        $(".ms-container:eq(" + i + ") .textDemog .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".ms-container:eq(" + i +") .mValDemog").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".ms-container:eq(" + i + ") .cValDemog").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".ms-container:eq(" + i + ") .cValDemog").removeClass("plus minus");
        $(".ms-container:eq(" + i + ") .cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".ms-container:eq(" + i + ")").addClass("active-widget"); }
        fillMSsvg($(".ms-container:eq(" + i + ") .dhs-image"), data[i], true);
    }
}
var fillParentalStatusData = function (data) {
    if (data == null || data.length != 1 || data == []) { return; }
        //Fill age Metric texts
        $(".ps-container .textDemog .vertical-align").text(data[0].MetricName);
        //Fill age metricValues
        $(".ps-container .mValDemog").text(returnFormattedValues(data[0].MetricValue) + "% |");
        //Fill age change
        $(".ps-container .cValDemog").text(returnFormattedValues(data[0].Change, 1));
        $(".ps-container .cValDemog").removeClass("plus minus");
        $(".ps-container .cValDemog").addClass(returnChangeClass(data[0].Significancevalue)); 
        fillMSsvg($(".ps-container .dhs-image"), data[0], false);
}
var fillHouseholdIncomeData = function (data) {
    let i = 0;
    if (data == null || data.length != 3 || data == []) { return; }
    $(".hi-container").removeClass("active-widget");
    //For Avg
    $(".hi-container:eq(0) .hi-tVal .vertical-align").text(data[i].MetricName);
    $(".hi-container:eq(0) .mValDemog .vertical-align").text("$" + addCommas(returnFormattedValues(data[i].MetricValue)) + "K");
    $(".hi-container:eq(0) .cValDemog .vertical-align").text(returnFormattedChangeValues(data[i].Change, 1) + "K");
    $(".hi-container:eq(0) .cValDemog").removeClass("plus minus");
    $(".hi-container:eq(0) .cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
    for (i = 1; i < 3; i++) {
        //Fill age Metric texts
        $(".hi-container:eq(" + i + ") .hi-text .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".hi-container:eq(" + i + ") .mValDemog").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".hi-container:eq(" + i + ") .cValDemog").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".hi-container:eq(" + i + ") .cValDemog").removeClass("plus minus");
        $(".hi-container:eq(" + i + ") .cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".hi-container:eq(" + i + ")").addClass("active-widget"); }
    }
}
var fillSocioEconomicData = function (data) {    
    let i = 0;
    if (data == null || data.length != 4 || data == []) { return; }
    $(".se-container").removeClass("active-widget");
    for (i = 0; i < 4; i++) {
        //Fill age Metric texts
        $(".se-container:eq(" + i + ") .se-text .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".se-container:eq(" + i + ") .mValDemog").text(returnFormattedValues(data[i].MetricValue) + "% |");
        //Fill age change
        $(".se-container:eq(" + i + ") .cValDemog").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".se-container:eq(" + i + ") .cValDemog").removeClass("plus minus");
        $(".se-container:eq(" + i + ") .cValDemog").addClass(returnChangeClass(data[i].Significancevalue)); 
        //Set active-widget
        if (data[i].Flag == 1) { $(".se-container:eq(" + i + ")").addClass("active-widget"); }
    }
}
var fillDinnerAttitudeData = function (data) {
    let i = 0;
    if (data == null || data.length != 10 || data == []) { return; }
    $(".da-container").removeClass("active-widget");
    for (i = 0; i < 10; i++) {
        //Fill age Metric texts
        $(".da-container:eq(" + i + ") .da-text .vertical-align").text(data[i].MetricName);
        //Fill age metricValues
        $(".da-container:eq(" + i + ") .mValDemog .vertical-align").text(returnFormattedValues(data[i].MetricValue) + "%");
        //Fill age change
        $(".da-container:eq(" + i + ") .cValDemog .vertical-align").text(returnFormattedChangeValues(data[i].Change, 1));
        $(".da-container:eq(" + i + ") .cValDemog .vertical-align").removeClass("plus minus");
        $(".da-container:eq(" + i + ") .cValDemog .vertical-align").addClass(returnChangeClass(data[i].Significancevalue));
        //Fill line chart
        if ($(".da-container:eq(" + i + ") .da-bar-chart")[0].getSVGDocument() != null && $(".da-container:eq(" + i + ") .da-bar-chart")[0].getSVGDocument().querySelector(".line-fill") != null) {
            fillLineChart($(".da-container:eq(" + i + ") .da-bar-chart")[0].getSVGDocument().querySelector(".line-fill"), data[i].MetricValue);
        }
        //Set active-widget
        if (data[i].Flag == 1) { $(".da-container:eq(" + i + ")").addClass("active-widget"); }
    }
}
var fillAvgMonthlyChannelData = function (data) {
    var kInd = 0;


    //Get Color JSON
    $.getJSON(appRouteUrl + "Templates/colorForChannel.json", function (jsonData) {
        let i = 0;
        if (data == null || data.length != 6 || data == []) { return; }
        $(".amc-values").removeClass("active-widget");
        for (i = 0; i < 6; i++) {
            //Fine the kInd
            $(data).each(function (j, d) { if (d.Flag == (i+1)) { kInd = j; } });
            //Fill age Metric texts
            $(".amc-block:eq(" + i + ") .amc-text .vertical-align").text(data[kInd].MetricName);
            //Fill age metricValues
            $(".amc-block:eq(" + i + ") .mValDemog .vertical-align").text(returnFormattedValues(data[kInd].MetricValue, 1));
            //Fill age change
            $(".amc-block:eq(" + i + ") .cValDemog .vertical-align").text(returnFormattedChangeValues(data[kInd].Change, 1));
            $(".amc-block:eq(" + i + ") .cValDemog").removeClass("plus minus");
            $(".amc-block:eq(" + i + ") .cValDemog").addClass(returnChangeClass(data[kInd].Significancevalue));
            //Set active-widget
            if (data[kInd].Flag == 1) { $(".amc-block:eq(" + i + ") .amc-values").addClass("active-widget"); }
            //Set the color of Block
            if (jsonData[data[i].MetricName.replace(/ /g, "_")] != undefined || jsonData[data[kInd].MetricName] != null) {
                $(".amc-block:eq(" + i + ") .amc-text").css("background-color", jsonData[data[kInd].MetricName.replace(/ /g, "_")]);
            }
        }
    });    
}
/* End Functions to fill output area @PKR*/
/*Start All Demog Chart Plots @PKR*/
var plotGenderChart = function (data) {
    if ($(".donutChartGender")[0].getSVGDocument() == null || $(".donutChartGender")[0].getSVGDocument().querySelector("#drawArcsHere") == null) { return; }
    var startangle = 0, midAngle = (2 * Math.PI) * data[1].MetricValue / 100, endAngle = 2 * Math.PI;
    //Clear chart
    $($(".donutChartGender")[0].getSVGDocument().querySelector("#drawArcsHere")).html('');
    var genderChart = $(".donutChartGender")[0].getSVGDocument().querySelector("#drawArcsHere");
    var arc1 = d3.svg.arc()
    .innerRadius(19.2)
    .outerRadius(35.2)
    .startAngle(startangle)
    .endAngle(midAngle);
    d3.select(genderChart).append("path")
        .attr("class", "femaleArc")
        .attr("d", arc1).style('fill', "#01A7D9").style("stroke", "#000000").style("stroke-width", "0.3px");
    var arc2 = d3.svg.arc()
    .innerRadius(19.2)
    .outerRadius(35.2)
    .startAngle(midAngle)
    .endAngle(endAngle);
    d3.select(genderChart).append("path")
        .attr("class", "maleArc")
        .attr("d", arc2).style('fill', "#BB2C2B").style("stroke", "#000000").style("stroke-width", "0.3px");
}
var plotAgeChart = function (data) {
    if (data.length != 6) { return; }
    if ($(".age-pie-chart")[0].getSVGDocument() == null || $(".age-pie-chart")[0].getSVGDocument().querySelector(".age-chart") == null) { return; }
    var i = 0, startangle = 2 * Math.PI, prevAngle = 2 * Math.PI, endAngle = 0;
    //Clear chart
    $($(".age-pie-chart")[0].getSVGDocument().querySelector(".age-chart")).html('');
    var genderChart = $(".age-pie-chart")[0].getSVGDocument().querySelector(".age-chart");
    var colors = ["#FBCF51", "#01A7D9", "#FF5212", "#A8A8A5", "#BB2C2B", "#658781"];
    for (i = 0; i < data.length; i++) {
        startangle = prevAngle;
        endAngle = prevAngle - ((2 * Math.PI) * data[i].MetricValue / 100);
        var arc = d3.svg.arc()
            .innerRadius(34.4)
            .outerRadius(55.26)
            .startAngle(startangle)
            .endAngle(endAngle);
        d3.select(genderChart).append("path")
            .attr("class", "Arc" + i)
            .attr("d", arc).style('fill', colors[i]).style("stroke", "#000000").style("stroke-width", "0.5px");
        prevAngle = endAngle;
    }
}
var fillLineChart = function (ele, val) {
    if (ele == undefined || ele == null) { return; }
    if ($(".occ-container .bar-chart:eq(0)")[0].getSVGDocument() == null || $(".occ-container .bar-chart:eq(0)")[0].getSVGDocument().querySelector(".line-fill") == null) { return; }
    var max_w = d3.select(ele).attr('max-width');
    d3.select(ele).attr('x2', max_w * (val / 100));
}
var fillDHSsvg = function (ele, data) {
    if ($(ele)[0].getSVGDocument() == null || $(ele)[0].getSVGDocument().querySelector(".fillPerson") == null) { return; }
    var DHSchart = $(ele)[0].getSVGDocument().querySelector(".fillPerson");
    var act_wdgt = $(ele)[0].getSVGDocument().querySelector(".cls-1");
    var max_height = d3.select(DHSchart).attr('max-height');
    var calc_h = max_height * data.MetricValue/100;
    var calc_y = max_height - calc_h;
    d3.select(DHSchart).attr('y', calc_y).attr('height', calc_h);
    //Active-widget
    var fill_color = data.Flag == 1 ? "#dddddd" : "#fafafa";
    d3.select(act_wdgt).style("fill", fill_color);
}
var fillMSsvg = function (ele, data, flag) {
    if ($(ele)[0].getSVGDocument() == null || $(ele)[0].getSVGDocument().querySelector(".fillPerson") == null) { return; }
    var MSchart = $(ele)[0].getSVGDocument().querySelector(".fillPerson");
    var act_wdgt = $(ele)[0].getSVGDocument().querySelector(".cls-1");
    var max_height = d3.select(MSchart).attr('max-height');
    var calc_h = max_height * data.MetricValue / 100;
    var calc_y = max_height - calc_h;
    d3.select(MSchart).attr('y', calc_y).attr('height', calc_h);
    if (flag) {
        //Active-widget
        var fill_color = data.Flag == 1 ? "#dddddd" : "#fafafa";
        d3.select(act_wdgt).style("fill", fill_color);
    }
}
/*End All Demog Chart Plots @PKR*/
/*Start Formatting for Demog Dashboard @PKR*/
var returnFormattedValues = function (val, fixedPlaces) {
    fixedPlaces = typeof fixedPlaces !== 'undefined' ? fixedPlaces : 0;
    if (val == null || val == undefined || isNaN(val)) { return 0; }
    return val.toFixed(fixedPlaces);
}
var returnFormattedChangeValues = function (val, fixedPlaces) {
    if (val == null || val == undefined || isNaN(val)) { return 0; }
    val = +val.toFixed(4);
    if (val > 0) {
        return "+"+ val.toFixed(fixedPlaces);
    }
    return val.toFixed(fixedPlaces);
}
var returnChangeClass = function (val) {
    if (val == null || val == undefined || isNaN(val) || val == 0) { return ""; }
    if (val > 1.96) { return "plus"; }
    if (val < -1.96) { return "minus"; }
    return "";
}
var getGuestOrVisit = function () {
    if (!$('.dashboardguest').hasClass('active')) {
        return "Visit";
    }
    return "Guest";
}
/*End Formatting for Demog Dashboard @PKR*/
