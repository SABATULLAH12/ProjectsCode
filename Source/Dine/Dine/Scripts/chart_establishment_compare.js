controllername = "chartestablishmentcompare";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".establishment-link-compare").find("a").addClass("active");
    $(".establishment-link-compare").css("border-right", "3px solid #ea1f2a");
    $(".establishment-link-compare").css("border-left", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    previsSelectedStatTest = "table-ttldine";
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>COMPARE ESTABLISHMENTS | </span></div>");
    defaultTimePeriod();
});

var hideAndShowSelectedValuesFromDemoInDeepDiveView = function (key, ctrl2) {
    if ( $(ctrl2).parent().attr("data-val") == "Measures") {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
        var pText = $(key).attr("parent-text");
        isTotalUsPopulation = pText;
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent().hide();
    }
}

var hideAndShowAdvanceFilterBasedOnMeasure = function (key, val) {
    if (val == "Measures") {
        var ele = $(key);
        var measureText = $(key).parent().parent().attr("first-level-selection"); 
        var measureFrequecy = $(key).parent().attr("first-level-selection");
        var parentID = $(key).attr("data-parent");
        var datalevel = $(key).parent().parent().attr("data-level");
        var index = datalevel;
        var keyText;
        measureTexttoCompare = measureText;
        isTotalUsPopulation = "";
        while (index > 1) {
            index--;
            var parentID = $(key).attr("data-parent");
            key = $(key).parent().parent().parent().find(".lft-popup-col[data-level=" + index + "]").find(".lft-popup-ele-label[data-id=" + parentID + "]");
            keyText = $(key).text();
            if (keyText == "Establishment Frequency (Base: Total US Population)")
                isTotalUsPopulation = keyText;
            index = $(key).parent().parent().attr("data-level");
        }
        if (keyText != measureText) {
            measureText = keyText; 
            var nxtEle = $(key).parent().find(".lft-popup-ele-next");
            clearOTherMeasureSelection(nxtEle);
            $(ele).parent().parent().attr("first-level-selection", measureText);
            clearAdvanceFilters();
        }
        key = $(ele);
        if (guestList.indexOf(measureText) > -1 || (measureTexttoCompare == "Beverage Guest" && datalevel == "4")) {
            $(".adv-fltr-toggle-container").hide();
            //if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
            if (isVisitsSelected_Charts == 1)
                clearAdvanceFilters();
            //if (isAdditionalFilterLoaded)
                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');
            if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active')) {
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
            }
            else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active')) {
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
            }
            $(".centerAlign").css("left", "50%");
        }
        else if (visitList.indexOf(measureText) > -1) {
            $(".adv-fltr-toggle-container").hide();
            //if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
            if (isVisitsSelected_Charts == 0)
                clearAdvanceFilters();
            //if (isAdditionalFilterLoaded)
                angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');

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
            $(".centerAlign").css("left", "47%");
        }
        else if (measureText == "Demographics")
        {
           
            if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                clearAdvanceFilters();
            //if (isAdditionalFilterLoaded)
                angular.element(".right-skew-Guests:eq(0)").triggerHandler('click');

            if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
            }
            else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass('lft-popup-ele_active')) {
                    clearAdvanceFilters();
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                }
            }
            $(".adv-fltr-toggle-container").show();
            $(".centerAlign").css("left", "42%");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').addClass('activeToggle');
            $(".adv-fltr-visit").css("color", "#000");
            $("#guest-visit-toggle").prop("checked", true);
           
        }
        if (isTotalUsPopulation == "Establishment Frequency (Base: Total US Population)") {
            setTimeout(function () {
                $(".adv-fltr-sub-frequency").hide();
                $("#addtnal-firstseptor").hide();
                $("#addtnal-secndseptor").hide();
            }, 100);
          
        }
        else {
            setTimeout(function () {
            $(".adv-fltr-sub-frequency").show();
            $("#addtnal-firstseptor").show();
            $("#addtnal-secndseptor").show();
            }, 100);
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
    $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele")).removeClass("freqncyunselect");
}

var clearOTherMeasureSelection = function (key) {
    var seleIDs = '';
    var mText = ''; var fText = '';
    var selectedMeasures = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    var measureText = $(key).parent().find(".lft-popup-ele-label").attr("data-val");
    if (measureText == "Visit Measures" && selectedMeasures!=measureText &&selectedMeasures!=undefined) {
        mText = 'Guest Measures';
        fText = 'Establishment In Trade Area';
    }
    else if (measureText == "Guest Measures" && selectedMeasures != measureText && selectedMeasures !=undefined) {
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

var changeMeasuresIsMultiSelectProperty = function (val) {
    if (val == "trend") {
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", false);
        $("#clearLeftPanel").click();
        $(".filter-info-panel").append('<div class="filter-info-panel-elements"></div>');
    }
    else if (val == "pit") {
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", true);
        $("#clearLeftPanel").click();
        $(".filter-info-panel").append('<div class="filter-info-panel-elements"></div>');
      }
}


var clearOutputData = function () {
    reset_img_pos();
    $(".chrt-typ").removeClass("active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>COMPARE ESTABLISHMENTS | </span></div>");
    //$(".advance-filters").css("display", "none");
    $('.chart-toplayer').hide();
    $("#chart-visualisation").hide();
    $(".chart-measure-text").hide();
    $("#scrollableTable").hide();
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

    isCustomBaseSelect = false;
    $(".table-stat").removeClass("activestat");
    $("#table-prevsperiod").addClass("activestat");
    previsSelectedStatTest = "table-prevsperiod";
    
}

var hideAndShowConsumedFreqForBeverage = function (key, measureText) {
    if (measureText == "Measures") {
        var text = $($($(key).parent().parent().parent().children(1)[1]).find(".sidearrw_active").parent()[0]).text().trim();
        //var text = measureTexttoCompare;
        if (text == "Beverage Guest") {
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().show();
            if (!$(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active"))
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
        }
        else {
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").click();
            $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
            $(".master-lft-ctrl[data-val='DAY OF WEEK']").parent().show();
           
        }
    }

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