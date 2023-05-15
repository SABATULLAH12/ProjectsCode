controllername = "analysescrossDinerFrequencies";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".establishment-link-compare").find("a").addClass("active");
    $(".establishment-link-compare").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    //$(".submodules-options").css("display", "none");
    //$(".submodule-border-bottom").hide();
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>COMPARE ESTABLISHMENTS | </span></div>");
    defaultTimePeriod();
    $('.adv-fltr-top').show();
    $('.adv-fltr-option').css('justify-content', 'flex-start');
    $('.ppt-logo').hide();
    emptyTableoutputWithSelectedColumns();
});

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
            $(".centerAlign").css("left", "36%");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').addClass('activeToggle');
            $(".adv-fltr-visit").css("color", "#000");
            $("#guest-visit-toggle").prop("checked", true);

        }
    }
}

var clearOTherMeasureSelection = function (key) {
    var seleIDs = '';
    var mText = ''; var fText = '';
    var selectedMeasures = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    var measureText = $(key).parent().find(".lft-popup-ele-label").attr("data-val");
    if (measureText == "Visit Measures" && selectedMeasures != measureText && selectedMeasures != undefined) {
        mText = 'Guest Measures';
        fText = 'Establishment In Trade Area';
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

var checkNumberOfEstablishmentSelected = function (ele) {
    return true;
}

var establishmentAndMeasureValidation = function () {
    
    return true;
}

var getTopAdvanceFilterId = function (fil) {
}

//Start - to display table output with selected columns with empty rows
var emptyTableoutputWithSelectedColumns = function () {
    var pathname = window.location.pathname; var fileNameIndex = pathname.lastIndexOf("/") + 1; var filename = pathname.substr(fileNameIndex);
    var tableFrequncydiv = "";
    tableFrequncydiv += '<div class="tbl-emptyrow"></div>';

    var tBody = "";
    var tableHtml = tableFrequncydiv + '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
    var metrcEmptyHding = '';
    var mainHeaderList = [];
    var theadHtml = "";
    var columns = [];
    var establishmentsSelected = "";
    var max_height = 0;
    var i = 0;
    establishmentsSelected = 2;
    if (establishmentsSelected.length == 0)
        return false;
    columns.push("Weekly+");
    columns.push("Monthly+");
    columns.push("Quarterly+");

    //Header Part
    theadHtml += tableHtml + '<thead><tr class="tbl-dta-rows">';
    $.each(columns, function (indexno, col) {
        if (indexno == 0) {
            theadHtml += '<th class="tbl-dta-metricsHding">';
            //var div = document.getElementsByClassName('.tbl-dta-metricsHding')[col];

            theadHtml += '<div class="tbl-algn tbl-text-upper">Monthly+</div><div class="tbl-data-brderbtmblk"></div></th><th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>';
            theadHtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(col) + '_hide " >';
            theadHtml += '<div class="tbl-algn tbl-text-upper">' + col + '</div></th><th class="emptydiv ' + removeBlankSpace(col) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            theadHtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(col) + '_hide " >';
            theadHtml += '<div class="tbl-algn tbl-text-upper">' + col + '</div></th><th class="emptydiv ' + removeBlankSpace(col) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    theadHtml += '</tr>';
    theadHtml += '</thead>';

    //Body Part
    tbodyHtml = theadHtml + '<tbody>';
    for (i = 0; i < 1; i++) {
        tbodyHtml += '<tr>';
        $.each(columns, function (index, value) {
            if (index == 0) {
                tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn fontForMetrics tbl-algn" style="margin-top: 2px;">Sample Size</div><div></div><div></div></td>';
                tbodyHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(value) + '_hide"><div class="tbl-algn fontForMetrics tbl-algn">&nbsp;</div><div></div><div></div></td>';
                tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(value) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }
            else {
                tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(value) + '_hide"><div class="tbl-algn fontForMetrics tbl-algn">&nbsp;</div><div></div><div></div></td>';
                tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(value) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }
        });
        tbodyHtml += '</tr>';
    }
    
    tbodyHtml += '</tbody></table><div id="scrollableTable"></div>';
    var headerColumnsRows =  tbodyHtml +'<div class="dataCRCS">';
    headerColumnsRows += '<div class="WeeklyMonthlyQuarterly">Weekly +</div>';
    headerColumnsRows += '<div class="WeeklyMonthlyQuarterly">Monthly +</div>';
    headerColumnsRows += '<div class="WeeklyMonthlyQuarterly">Quarterly +</div>';
    headerColumnsRows += '</div>';
    $('.analyses-crossdinerFreqlayer').html(headerColumnsRows);
    var options = {
        width: $(".analyses-crossdinerFreqlayer").width() - 25,
        height: $(".analyses-crossdinerFreqlayer").height() - 40,
        pinnedRows: 1,
        pinnedCols: 2,
        container: "#scrollableTable",
        removeOriginal: true
    };
    $("#flexi-table").tablescroller(options);
    
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(4)').height();

    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 98);
    $('.scrollable-rows-table').height($('.scrollable-data-frame').height() + 2);
    $('.scrollable-rows-frame').height($('.scrollable-rows-frame').height() - 98);
    $('.scrollable-data-table').height($('.scrollable-data-frame').height() + 2);

    $(".advance-filters").css("display", "none");

    
    $('#scrollableTable,.scrollable-rows-frame,.scrollable-data-frame').addClass("emptyrowclassheight");
    $(".advance-filters").addClass("hideFilters");
    $(".analyses-crossdinerFreqlayer .scrollable-data-frame").width("855");
    
    $('.scrollable-data-table').css("height", "30px");
    $(".analyses-crossdinerFreqlayer").css("margin-top", "10px");
    $(".data .scrollable-rows-table").css("height", "30px;");

    $(".tbl-data-btmbrd").css("display", "none");
    $(".tbl-btm-circle ").css("display", "none");

    $(".analyses-crossdinerFreqlayer").css("height", "calc(100% - 98px)");
    $(".analyses-crossdinerFreqlayer").css("margin-top", "5.3%");
    $("#scrollableTable").css("height", "40px").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");

    $("#scrollableTable .scrollable-rows-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTable .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".scrollable-columns-frame .emptydiv, #scrollableTable .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");

    var scrollheight = $(".scrollable-columns-frame").height() + 18;
    
    $("#scrollableTable .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    $(".corner-frame, .scrollable-rows-frame").css("width", "35%");
    $("#scrollableTable tr td:first-child").css("width", "100%");
    $('#scrollableTable tr th.tbl-dta-metricsHding').width("100%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "64.9%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    $('.scrollable-rows-frame.emptyrowclassheight').css("height", "25px");
    //SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8, false);
  
    //added by Nagaraju D for creating dynamic table
    //Date: 04-09-2017
    //SetTableResolutionCrossDiner();
}
//End
var getSelectedRestaruntorRetailers = function (fil) {
    var isRestorRetailr = isRestOrRetailer;
    fil.push({
        Name: "IsRestaurantorRetailer", Data: null, SelectedID: isRestorRetailr
    });
    return fil;
}

