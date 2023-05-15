/// <reference path="dashboard_visits.js" />
controllername = "dashboardvisits";
$(document).ready(function () {
   $(".submodules-options-link").find("a").removeClass("active");
   $(".dashboard-visits").find("a").addClass("active");
    $(".link_items").removeClass("active");
     $(".submodules-options").css("display", "block");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>VISITS | </span></div>");
    $('.Time_Period_topdiv_element').html('');
    //defaultTimePeriod();
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


