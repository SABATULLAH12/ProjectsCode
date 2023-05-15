﻿controllername = "chartbeveragedeepdive";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".beverage-link-deep-dive").find("a").addClass("active");
    $(".beverage-link-deep-dive").css("border-right", "3px solid #ea1f2a");
    $(".beverage-link-deep-dive").css("border-left", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(1)").addClass("active");
    $(".link_items:eq(1)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>BEVERAGE DEEPDIVE | </span></div>");
    //to make default Previous period Stat test
    $(".table-stat").removeClass("activestat");
    $("#table-prevsperiod").addClass("activestat");
    previsSelectedStatTest = "table-prevsperiod";
    defaultTimePeriod();
});

var hideAndShowSelectedValuesFromDemoInDeepDiveView = function (key, ctrl2) {
    if ($(ctrl2).parent().attr("data-val") == "Metric Comparisons") {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label").parent().show();
        var pText = $(key).attr("parent-text");
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent().hide();
    }
    //customRegions hide and show
    if (CustomRegionsToolTipList.indexOf(pText) > -1)
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().hide();
    //
    if ($(ctrl2).parent().attr("data-val") == "Measures") {
        var pText = $(key).attr("parent-text");
        if ($(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().css("display") != "none")
            $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
        var selParent = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + selParent + '"]').parent().hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent().hide();
    }
   
}

var hideMeasureBaseonComparisonBanner = function () {
    var selParent = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
    $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + selParent + "']").parent().hide();
}

var hideAndShowAdvanceFilterBasedOnMeasure = function (key, val) {
    var selectedFirstLevelinMetricCompsns = $($(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active")[0]).attr("parent-of-parent");
    if (val == "Measures") {
        var measureText = $(key).parent().parent().attr("first-level-selection");
        if (guestList.indexOf(measureText) > -1) {
            $(".adv-fltr-toggle-container").hide();
            if (isVisitsSelected_Charts == 0)
                clearAdvanceFilters();
                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');

            if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active'))
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
            }
            else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active'))
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
            }
            $('.adv-fltr-sub-establmt').hide();
            $(".centerAlign").css("left", "50%");
        }
        else if (visitList.indexOf(measureText) > -1) {
            $(".adv-fltr-toggle-container").hide();
            if (isVisitsSelected_Charts == 1)
                clearAdvanceFilters();
                angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');

            if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active'))
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
            }
            else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active'))
                    clearAdvanceFilters();
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
            }
            $('.adv-fltr-sub-establmt').show();
            $(".centerAlign").css("left", "47%");
        }
        else if (measureText == "Demographics") {

            
            if (visitList.indexOf(selectedFirstLevelinMetricCompsns) > -1) {
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "47%");
                if (isVisitsSelected_Charts == 0)
                    clearAdvanceFilters();
                angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');
                LastSelected = 1;
                if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                    if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                        if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active'))
                            $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                }
                else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                    if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active')) {
                        clearAdvanceFilters();
                        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                    }
                }
            }
            else if (guestList.indexOf(selectedFirstLevelinMetricCompsns) > -1) {
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "50%");
                if (isVisitsSelected_Charts == 1)
                    clearAdvanceFilters();
                LastSelected = 0;
                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');

                if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                    if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active'))
                        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
                else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                    if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active'))
                        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
            }
            else {
                if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                    clearAdvanceFilters();
                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');

                if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                    if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                    }
                }
                else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                    if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active')) {
                        clearAdvanceFilters();
                        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                    }
                }
                $(".centerAlign").css("left", "42%");
                $('.adv-fltr-sub-establmt').hide();
                if (selectedFirstLevelinMetricCompsns == "Demographics")
                    $(".adv-fltr-toggle-container").show();
                else
                    $(".adv-fltr-toggle-container").hide();
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').addClass('activeToggle');
                $(".adv-fltr-visit").css("color", "#000");
                $("#guest-visit-toggle").prop("checked", true);
            }
        }
    }
}

var clearAdvanceFilters = function () {
    var selectedIDs = $(".master-lft-ctrl[popup-type='advanceFilters']").find(".lft-popup-ele_active");
    $.each(selectedIDs, function (index, ele) {
        var isFrequency = $(ele).find(".lft-popup-ele-label").parent().parent().parent().parent().parent().attr("data-val");
        if (isFrequency != "FREQUENCY") {
            $(ele).removeClass("lft-popup-ele_active");
            var element = $(ele).find(".lft-popup-ele-label");
            var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
            removeSelectedPanelElement(true, element, ctrl2);
        }
    });
}


var changeMeasuresIsMultiSelectProperty = function (val) {
    if (val == "trend") {
       $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", false);
       $("#clearLeftPanel").click();
       $(".filter-info-panel").append('<div class="filter-info-panel-elements"></div>');
       $(".master-lft-ctrl[data-val='Beverage']").find(".lft-ctrl3").attr("data-ismultiselect", false);
    }
    else if (val == "pit") {
       $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", true);
       $("#clearLeftPanel").click();
       $(".filter-info-panel").append('<div class="filter-info-panel-elements"></div>');
    }
}

var clearOTherMeasureSelection = function (key) {
    var seleIDs = '';
    var mText = ''; var fText = '';
    var selectedMeasures = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    var measureText = $(key).parent().find(".lft-popup-ele-label").attr("data-val");
    if (measureText == "Visit Measures" && selectedMeasures != measureText && selectedMeasures != undefined) {
        mText = 'Guest Measures';
        fText = 'Monthly+';
    }
    else if (measureText == "Guest Measures" && selectedMeasures != measureText && selectedMeasures != undefined) {
        mText = 'Visit Measures';
        fText = 'Total Visits';
    }
    if (mText != '' && fText != '') {
        seleIDs = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + mText + "']").parent().parent().siblings().find(".lft-popup-ele_active");
        $.each(seleIDs, function (index, ele) {
            $(ele).removeClass("lft-popup-ele_active");
            var element = $(ele).find(".lft-popup-ele-label");
            var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
            removeSelectedPanelElement(true, element, ctrl2);
            if (index == 0)
                $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='" + fText + "']").click();
        });
    }
}

var clearOutputData = function () {
    reset_img_pos();
    $(".chrt-typ").removeClass("active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>BEVERAGE DEEP DIVE | </span></div>");
    $(".advance-filters").css("display", "none");
    $('.chart-toplayer').hide();
    $("#chart-visualisation").hide();
    $("#scrollableTable").hide();
    $(".chart-measure-text").hide();
    $("#guestFrqncy").hide();
    $("#legend_div").remove();
    //$(".table-statlayer").css("display", "none");
    $(".lft-ctrl3").hide();
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();

    var seleIDsEstblmt = $(".master-lft-ctrl[data-val='Beverage']").find(".lft-popup-ele_active");

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

    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele.dynamic_show_hide_charts").css('display', 'flex');
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele").removeClass('dynamic_show_hide_charts');

    $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
    $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');

    $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
    $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
    isCustomBaseSelect = false;
    $(".table-stat").removeClass("activestat");
    $("#table-prevsperiod").addClass("activestat");
    previsSelectedStatTest = "table-prevsperiod";
}

//For hide and show Consumed frequecny

var hideAndShowConsumedFreqForBeverage = function (key, measureText) {
    if (measureText == "Measures") {
        $(".master-lft-ctrl[data-val='ESTABLISHMENT FREQUENCY']").parent().hide();
        var text = $($($(key).parent().parent().parent().children(1)[1]).find(".sidearrw_active").parent()[0]).text().trim();
        if (text == "Establishment Frequency") {
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
            if (!$(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active"))
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
        }
        else
        {
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").click()
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
            //$(".master-lft-ctrl[data-val='DAY OF WEEK']").parent().show();
          
        }           
    }``
}

var getTopAdvanceFilterId = function (fil) {
    var isVisits = "";

    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
        isVisits = 0;
    else
        isVisits = 1;

    fil.push({
        Name: "IsVisit", Data: null, SelectedID: isVisits
    });
    return fil;

}