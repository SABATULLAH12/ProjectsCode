controllername = "tableestablishmentdeepdive";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".establishment-link-deep-dive").find("a").addClass("active");
    $(".establishment-link-deep-dive").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    $(".master-leftpanel").css("height", "calc(100% - 59px)");
    previsSelectedStatTest = "table-ttldine";
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>ESTABLISHMENT DEEPDIVE | </span></div>");
    defaultTimePeriod();
    $(".advance-filters").addClass("hideFilters");
});

var hideAndShowAdvanceFilterBasedOnMeasure = function (key, val) {
    if (val == "Demographic Filters") {
        //angular.element('.right-skew-DemoGraphicProfiling').triggerHandler('click');

        if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
            //$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Establishment In Trade Area']").click();
        }
        else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
            if ($('#guest-visit-toggle').hasClass('active')) {
                angular.element(".toggle-slider").triggerHandler('click');
            }
            //$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Establishment In Trade Area']").click();
        }
    }
}
var hideAndShowSelectedValuesFromDemoInDeepDiveView = function (key, ctrl2) {
    if ($(ctrl2).parent().attr("data-val") == "Metric Comparisons") {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();    
        var pText = $(key).attr("parent-text");
        
        //customRegions hide and show
        if (CustomRegionsToolTipList.indexOf(pText) > -1)
            $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().hide();
        //
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent().hide();

        //deselecting already selected items
        //var seleIDs = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + mText + "']").parent().parent().siblings().find(".lft-popup-ele_active");
        var seleIDs = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele_active");
        $.each(seleIDs, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
        });
        //
    }
}

var getTopAdvanceFilterId = function (fil) {
    var isVisits = "";
    var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
    fil.push({ Name: "Top Filter", Data: null, SelectedID: rtnSelctedFilterId });
    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
        isVisits = 0;
    else
        isVisits = 1;
    fil.push({ Name: "IsVisit", Data: null, SelectedID: isVisits });
    return fil;
}


var hideAndShowFilterOnPitTrend = function (pittrend) {
    if (pittrend == "pit") {
        $(".master-lft-ctrl[data-val='Metric Comparisons']").show();
        $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-ctrl3").attr("data-required", "true");
    }
    else {
        $(".master-lft-ctrl[data-val='Metric Comparisons']").hide();
        $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-ctrl3").attr("data-required", "false");
    }
}

var clearOutputData = function () {
    reset_img_pos();
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>ESTABLISHMENT DEEPDIVE | </span></div>");
    $(".table-bottomlayer").html('');
    //$(".table-statlayer").css("display", "none");
    $(".advance-filters").css("display", "none");
    $(".lft-ctrl3").hide();
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
    var seleIDsEstblmt = $(".master-lft-ctrl[data-val='Establishment']").find(".lft-popup-ele_active");
    $.each(seleIDsEstblmt, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });

    var seleIDsCompBnnr = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active");
    $.each(seleIDsCompBnnr, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });
    var seleIDsDemoFltr = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele_active");
    $.each(seleIDsDemoFltr, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });

    $(".lft-popup-ele-next.sidearrw.sidearrw_active").removeClass("sidearrw_active");
    $(".master-lft-ctrl").parent().css("background", "none");
    $('.lft-popup-ele').css("background", "none");
    defaultGuestsSelect = true;
}

var appendingEstablishmentToTable = function (selectedEstablishment) {
    var theadHtml = "", theadHtml1 = "";
    theadHtml += '<th id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-metricsHding ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide">';
    theadHtml += '<div class="tbl-algn tbl-text-upper">' + $(selectedEstablishment).text() + '</div></th><th class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></th>';
    if ($(".scrollable-rows-frame tr").length > 1)
        theadHtml1 += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics">&nbsp;</div><div ></div><div ></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
    $($(".data.scrollable-columns-table thead tr")[0]).append(theadHtml);
    $($(".data.scrollable-columns-table thead tr")[1]).append(theadHtml1);
    var tbodytdHtml = "", tbodytdBlueColorHtml = "";
    tbodytdHtml += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics">&nbsp;</div><div class="tbl-data-btmbrd  "></div><div class="tbl-btm-circle "></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
    tbodytdBlueColorHtml += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td  tbl-dta-rowscolr ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics"></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

    $(".scrollable-rows-frame tr").each(function (i) {
        if ($(this).find('.tbl-dta-td').hasClass("tbl-dta-rowscolr"))
            $(".scrollable-data-frame tbody tr").eq(i).append(tbodytdBlueColorHtml);
        else
            $(".scrollable-data-frame tbody tr").eq(i).append(tbodytdHtml);
    });
    setWidthforTableColumns();
    setMaxHeightForHedrTble();
    //added by Nagaraju D for creating dynamic table
    //Date: 04-09-2017    
    SetTableResolution();
}

var hideEstablishmentFromTable = function (deselectedEstablishment) {
    $(".scrollable-columns-frame").find('.' + deselectedEstablishment+ '_hide').css("display", "none");
    $(".scrollable-data-frame").find('.' + deselectedEstablishment+ '_hide').css("display", "none");
    setWidthforTableColumns();
    setMaxHeightForHedrTble();
}

var toShowDemofilter = function () {
    var selectedEstbmtlist = $(".Metric_Comparisons_topdiv_element > div").length;

    if (selectedEstbmtlist == 0)
    {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
    }
}