/// <reference path="table_establishment_deepdive.js" />
controllername = "tableestablishmentcompare";
$(document).ready(function () {
    $(".submodules-options-link").find("a").removeClass("active");
    $(".establishment-link-compare").find("a").addClass("active");
    $(".establishment-link-compare").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    $(".lft-ctrl-toggle").parent().hide();
    $(".master-leftpanel").css("padding-top", "25px");
    previsSelectedStatTest = "table-ttldine";
    //$(".master-leftpanel").css("height", "91%");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>COMPARE ESTABLISHMENTS | </span></div>");
    defaultTimePeriod();
    $(".advance-filters").addClass("hideFilters");
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

    fil.push({ Name: "IsVisit", Data: null, SelectedID: isVisits
});
    return fil;
}


var appendingEstablishmentToTable = function (selectedEstablishment)
{
    var theadHtml = "", theadHtml1 = "";
    theadHtml += '<th id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-metricsHding ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide">';
    theadHtml += '<div class="tbl-algn tbl-text-upper">' + $(selectedEstablishment).text() + '</div></th><th class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></th>';
    if ($(".scrollable-rows-frame tr").length > 1)
        theadHtml1 += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics">&nbsp;</div><div ></div><div ></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
    $($(".data.scrollable-columns-table thead tr")[0]).append(theadHtml);
    $($(".data.scrollable-columns-table thead tr")[1]).append(theadHtml1);
    var tbodytdHtml = "",tbodytdBlueColorHtml="";
    tbodytdHtml += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics">&nbsp;</div><div class="tbl-data-btmbrd  "></div><div class="tbl-btm-circle "></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
    tbodytdBlueColorHtml += '<td id="' + $(selectedEstablishment).attr("data-id") + '" class="tbl-dta-td  tbl-dta-rowscolr ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-algn fontForMetrics"></div></td><td class="emptydiv ' + removeBlankSpace($(selectedEstablishment).text()) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

    $(".scrollable-rows-frame tr").each(function (i) {
        if($(this).find('.tbl-dta-td').hasClass("tbl-dta-rowscolr"))
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

var hideEstablishmentFromTable = function (deselectedEstablishment)
{   
    $(".scrollable-columns-frame").find("." +deselectedEstablishment + "_hide").css("display", "none");
    $(".scrollable-data-frame").find("." + deselectedEstablishment + "_hide").css("display", "none");
    
    setWidthforTableColumns();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);
}