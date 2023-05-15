controllername = "tablebeveragecomparison";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".beverage-link-compare").find("a").addClass("active");
    $(".beverage-link-compare").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(1)").addClass("active");
    $(".link_items:eq(1)").find(".downarrw").addClass("downarrw_active");
    $(".lft-ctrl-toggle").parent().hide();
    $(".master-leftpanel").css("padding-top", "25px");
    //$(".master-leftpanel").css("height", "91%");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>COMPARE BEVERAGES | </span></div>");
    //to make default Previous period Stat test
    $(".table-stat").removeClass("activestat");
    $("#table-prevsperiod").addClass("activestat");
    previsSelectedStatTest = "table-prevsperiod";
    defaultTimePeriod();
    $(".advance-filters").addClass("hideFilters");
});

var getTopAdvanceFilterId = function (fil) {
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
    $(".filter-info-panel-elements").html();
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span>COMPARE BEVERAGES | </span></div>");
    $(".table-bottomlayer").html('');
    $(".table-statlayer").css("display", "none");
    $(".advance-filters").css("display", "none");
    $(".lft-ctrl3").hide();
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label").parent().show();

    var seleIDsEstblmt = $(".master-lft-ctrl[data-val='Beverage']").find(".lft-popup-ele_active");

    $.each(seleIDsEstblmt, function (index, ele) {
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
}

var appendingEstablishmentToTable = function (selectedEstablishment) {

    var theadHtml = "", theadHtml1 = "";
    theadHtml += '<th id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-metricsHding ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide">';
    theadHtml += '<div class="tbl-algn tbl-text-upper">' + $(selectedEstablishment).text() + '</div></th><th class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></th>';
    if ($(".scrollable-rows-frame tr").length > 1)
        theadHtml1 += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics">&nbsp;</div><div ></div><div ></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
    $($(".data.scrollable-columns-table thead tr")[0]).append(theadHtml);
    $($(".data.scrollable-columns-table thead tr")[1]).append(theadHtml);
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
    $(".scrollable-columns-frame").find('.' + deselectedEstablishment + '_hide').css("display", "none");
    $(".scrollable-data-frame").find('.' + deselectedEstablishment + '_hide').css("display", "none");
    setWidthforTableColumns();
    setMaxHeightForHedrTble();
}
