controllername = "analysesestablishmentdeepdive";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".establishment-link-deep-dive").find("a").addClass("active");
    $(".establishment-link-deep-dive").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    //$(".submodules-options").css("display", "none");
    //$(".submodule-border-bottom").hide();
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>ESTABLISHMENT DEEP DIVE | </span></div>");
    defaultTimePeriod();
});


var hideAndShowSelectedValuesFromDemoInDeepDiveView = function (key, ctrl2) {
    if ($(ctrl2).parent().attr("data-val") == "Metric Comparisons") {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label").parent().show();
        var pText = $(key).attr("parent-text");
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent().hide();

    }
    //customRegions hide and show
    var CustomRegionsList = ["Density", "CCNA Regions", "Bottler Regions", "CCR SubRegions", "AO Non CCR Subregions", "Census Regions", "Census Divisions", "DMA", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "Albertson's/Safeway Corporate Net Trade Area", "HEB Trade Areas"];
    if (CustomRegionsList.indexOf(pText) > -1)
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().hide();
    //
    if ($(ctrl2).parent().attr("data-val") == "Measures") {
        var pText = $(key).attr("parent-text");
        if ($(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().css("display") != "none")
            $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();
        var selParent = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + selParent + "']").parent().hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent().hide();
    }
}

var hideMeasureBaseonComparisonBanner = function () {
    var selParent = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label").attr("parent-text");
    $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + selParent + "']").parent().hide();
}

var hideAndShowAdvanceFilterBasedOnMeasure = function (key, val) {
    if (val == "Measures") {
        var measureText = $(key).parent().parent().attr("first-level-selection");
        if (guestListForAnalysis.indexOf(measureText) > -1) {
            $(".adv-fltr-toggle-container").hide();
            if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
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
            $(".centerAlign").css("left", "50%");
        }
        else if (visitListForAnalysis.indexOf(measureText) > -1) {
            $(".adv-fltr-toggle-container").hide();
            if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                clearAdvanceFilters();
            angular.element(".right-skew-Visits:eq(0)").triggerHandler('click');

            if ($(key).parent().hasClass("lft-popup-ele_active") && $(key).parent().parent().find(".lft-popup-ele_active").length == 1) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active'))
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
            }
            else if ($(key).parent().hasClass("lft-popup-ele_active") == false && $(key).parent().parent().find(".lft-popup-ele_active").length == 0) {
                if (!$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass('lft-popup-ele_active'))
                    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
            }
            $(".centerAlign").css("left", "47%");
        }
        else if (measureText == "Diner Attitude Segments" || measureText == "Attitudinal Statements - Top 2 Box") {
            if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
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

            $(".adv-fltr-toggle-container").show();
            $(".centerAlign").css("left", "39%");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').addClass('activeToggle');
            $(".adv-fltr-visit").css("color", "#000");
            $("#guest-visit-toggle").prop("checked", true);

        }
    }
}


var clearAdvanceFilters = function () {
    var selectedIDs = $(".master-lft-ctrl[popup-type='advanceFilters']").find(".lft-popup-ele_active");
    $.each(selectedIDs, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });
}
var changeMeasuresIsMultiSelectProperty = function (val) {
    if (val == "trend") {
        //  $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", false);
        $("#clearLeftPanel").click();
        //$(".filter-info-panel-elements").append('<div class="topdiv_element"><span>ESTABLISHMENT DEEPDIVE | </span></div>');
    }
    else if (val == "pit") {
        //    $(".master-lft-ctrl[data-val='Measures']").find(".lft-ctrl3").attr("data-ismultiselect", true);
        $("#clearLeftPanel").click();
        //$(".filter-info-panel-elements").append('<div class="topdiv_element"><span>ESTABLISHMENT DEEPDIVE | </span></div>');
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

var establishmentAndMeasureValidation = function () {
    var selectedEle = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").length;
    if (selectedEle < 3) {
        alert("Please make minimum 3 selections for Metric Comparisons");
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");
        return false;
    }

    var selectedEle1 = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").length;
    if (selectedEle1 < 3) {
        alert("Please make minimum 3 selections for Measures");
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");
        return false;
    }
    return true;
}

var checkNumberOfEstablishmentSelected = function (ele) {
    //if ($(ele).parent().parent().attr("data-val") == "Measures") {
    //    var selectedEle = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").length;
    //    if (selectedEle < 3) {
    //        alert("Please make minimum 3 selections for Metric Comparisons");
    //        return false;
    //    }
    //    return true;
    //}
    //if ($(ele).parent().parent().attr("data-val") == "Demographic Filters") {
    //    var selectedEle = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").length;
    //    if (selectedEle < 3) {
    //        alert("Please make minimum 3 selections for Measures");
    //        return false;
    //    }
    //    return true;
    //}
    return true;
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