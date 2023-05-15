/// <reference path="angular.js" />
/// <reference path="jquery-3.0.0.min.js" />
/// <reference path="jquery.nicescroll.js" />
//-->

/*in ie & mozilla includes not defined so we are defined here by chandru start*/
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

/*in ie & mozilla includes not defined so we are defined here by chandru end*/

Array.prototype.getUnique = function () {
    var u = {}, a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}
var mainApp = angular.module("mainApp", []);
var appRouteUrl = "/";
var kihomeURL = "https://kiexplorer.aqinsights.com/Views";
//var kihomeURL = "https://kiexplorer.aqinsights.com/Views";
var isCustomBaseSelect = false;
var default_first_level_selection = "";
var filename = "";
var checkGeographyInitial = false;
var selectedFrequencyToCarryFrwd = "";
var customCurrentSelections = "";
var selectedFrequencyToCarryFrwd_flag = 0;
var final_SearchList_forMeasures = [];
var left_Menu_Data = [];
var analysisTableType = "";
var previsSelectedStatTest = "", preparefilterIsFalse = true; var trendTpList = [];
var isSubmitClicked = false;
var isVisitOrGuestMeasures = 0, isSampleSizeValidated = 0, pp_py_lock = 1, skipDefaultFreq = 0, commentsForCharts = " ";
var staticWidth = 290;
var isSubmitOrApplyFilter = "";
var selectedstatTestToCarryFrwd = "";
var report_current_selection_est = "benchmark";
var report_benchMarkSelected = "";
var report_comparisionsSelected = [];
var zoomLevel = Math.round(window.devicePixelRatio * 100);
var measureCurrentLevel = "";
var customBaseSelctdText = "";
var sAllLowSample = "0";
var data_index = ""; var leftpanelchanged = false;
//Added by Bramhanath For Measure (01-08-2017)
var visitList = ["Pre-Visit", "In-Establishment", "In-Establishment Bev Details", "Post-Visit"];
var guestList = ["Brand Health Metrics", "Beverage Guest", "Establishment Frequency"];
var visitListForAnalysis = ["Outlet Motivation Segments", "Outlet Motivation Attributes - Top 2 Box", "Occasion Motivation - Top 2 Box"];
var guestListForAnalysis = ["Beverage Guest", "Establishment Imageries"];

var isVisitsSelected_Charts = 0, isVisitsSelected_analysis = 0;
var isAdditionalFilterLoaded = false;
var disabledMeasures = [];
var IsPIT_TREND = false;
var selectedFirstLevelinMetricCompsns = "";
var isCrossDinerSubmitClicked = false; var isRestOrRetailer = 1, isRestorRetalerClicked = false;
//
/*Start To show loader while page loading*/
document.onreadystatechange = function (e) {
    if (!e.bubbles) {
        $(".transparentBG").css("display", "block");
        $(".loader").css("display", "block");
    }
};
$(window).on('load', function () {
    $(".loader, .transparentBG").hide();
});
/*End To show loader while page loading*/
//added by Nagaraju
//Date: 19-07-2017
var controllername = "";
var addfilter = function (data_val, data_index, level, id) {
    angular.element(document.querySelector(".master-layout")).injector().invoke(function ($rootScope, $compile) {
        var isfilterexist = false;
        var scope = angular.element(document.querySelector(".master-layout")).scope();
        var itemFilters = [];
        var content = "";

        if (angular.element(document.querySelector(".master-lft-ctrl[data-val='" + data_val + "'][data-index='" + data_index + "'] .lft-popup-col" + level)).length == 0) {

            //var fls = $(searchitem[0].filterobj).attr("first-level-selection");
            var first_level_selection = $(".master-lft-ctrl[data-val='" + data_val + "'][data-index='" + data_index + "'] .lft-popup-col1").attr("first-level-selection");
            var template = "<div class=\"lft-popup-col" + level + " lft-popup-col\" data-level=\"" + (level) + "\" first-level-selection=\"" + first_level_selection + "\">" +
                //heading
             "<div class=\"popup-header\">" +
            "<div class=\"lft-popup-col-search\" style=\"visibility:hidden;\">" +
            "<input type=\"text\" name=\"search\" placeholder=\"Search..\" class=\"ui-autocomplete-input search-list\" autocomplete=\"off\">" +
            "<div class=\"search-img\"></div>" +
            "</div>" +
            "<div class=\"lft-popup-col-selected-text\"></div>" +
            "</div></div>";
            content = $compile(template)(scope);
            angular.element(document.querySelector(".master-lft-ctrl[data-val='" + data_val + "'] .lft-ctrl3-content")).append(content);
            scope.$digest();
            //end heading
        }
        //@*bind individual element start*@        

        for (var i = 0; i < left_Menu_Data[data_index].PanelPopup[(level - 1)].Data.length; i++) {
            var obj = left_Menu_Data[data_index].PanelPopup[(level - 1)].Data[i];
            if (id == obj.ParentID) {
                if (angular.element(document.querySelectorAll(".master-lft-ctrl[data-val='" + data_val + "'][data-index='" + data_index + "'] .lft-ctrl3-content .lft-popup-col" + level + " span[data-id='" + obj.ID + "']")).length > 0) {
                    isfilterexist = true;
                    break;
                    return;
                }
                itemFilters.push(obj);
            }
        }
        template = "";
        //bug id 4860
        if (!isfilterexist) {
            for (var i = 0; i < itemFilters.length; i++) {
                //@*bind individual element start*@    
                var panelelement = itemFilters[i];
                template += "<div style=\"display:none;\" class=\"lft-popup-ele\" child-count=\"" + panelelement.ChildCount + "\" parent-of-parent=\"" + panelelement.ParentOfParent + "\">" +
                    "<span class=\"lft-popup-ele-label-img " + removeBlankSpace(panelelement.Text) + "_img " + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_availalbe') + "\"></span>" +
                    "<span class=\"lft-popup-ele-label leftAlignTableText" + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_Width') + "\"" +
                    "data-id=\"" + panelelement.ID + "\" data-val=\"" + panelelement.Text + "\" data-parent=\"" + panelelement.ParentID + "\" data-parent-search-name=\"" + panelelement.SearchName + "\" data-parent-level=\"" + (panelelement.IsSubHeading == null ? '' : panelelement.IsSubHeading) + "\" data-parent-id=\"" + (panelelement.IsSubHeadingID == null ? '' : panelelement.IsSubHeadingID) + "\"" +
                    "parent-text=\"" + panelelement.ParentText + "\" data-isSelectable=\"" + (panelelement.IsSelectable == undefined ? true : panelelement.IsSelectable) + "\">" + panelelement.Text + "</span>" +
                    "<span ng-class=\"{'lft-popup-ele-custom-tooltip-icon " + removeBlankSpace(panelelement.Text) + "_cRegion': ('" + panelelement.ParentText + "'  =='Geography' || '" + removeBlankSpace(panelelement.Text) + "'  =='albertsonssafeway_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "'=='albertsonssafeway_corporate_net_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'heb_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "' == 'heb_trade_area') && ('" + removeBlankSpace(panelelement.Text) + "' != 'total_us') }\"></span>" +

                    "<span class=\"lft-popup-ele-next sidearrwdiv addLevel\" style=\"" + (panelelement.ChildCount == 0 ? "display:none;" : "display:block;") + "\" data-id=\"" + panelelement.ID + "\">" +
                    "<span class=\"sidearrw\"></span>" +
                    "</span>" +
                    "</div>";
                //@*bind individual element end*@    
            }
            content = $compile(template)(scope);
            angular.element(document.querySelector(".master-lft-ctrl[data-val='" + data_val + "'][data-index='" + data_index + "'] .lft-ctrl3-content .lft-popup-col" + level)).append(content);
            scope.$digest();
        }
    });
}
var addSearchItem = function (searchitem) {
    angular.element(document.querySelector(".master-layout")).injector().invoke(function ($rootScope, $compile) {
        var isfilterexist = false;
        var scope = angular.element(document.querySelector(".master-layout")).scope();
        var itemFilters = [];
        var content = "";
        var data_val = $(searchitem[0].filterobj).attr("data-val");
        var data_index = $(searchitem[0].filterobj).attr("data-index");
        if (parseFloat($(searchitem[0].filterobj).attr("data-level")) == 1)
            return;

        var level = searchitem[0].level;
        var id = searchitem[0].parentid;

        var showall = $(searchitem[0].filterobj).attr('show-all');
        var pele = $(searchitem[0].filterobj).parent().parent().parent().parent().parent();
        if (showall == "True") {
            level = 1;
            for (var i = 1; i < ele.parent().parent().parent().parent().parent().children().children().children(".lft-popup-col").length; i++) {
                level += 1;
                if ($(pele).find("." + "lft-popup-col" + level).find(".lft-popup-ele-label[data-parent='" + id + "']").parent().length == 0) {
                    addfilter(data_val, data_index, level, id);
                }
            }
        }
        else {
            addfilter(data_val, data_index, level, id);
        }

    });
}
angular.module("mainApp").directive("addLevel", function ($compile) {
    return {
        restrict: 'C',
        scope: true,
        replace: false,
        link: function (scope, ele, attr) {
            ele.on("click", function () {

                var isfilterexist = false;
                var itemFilters = [];
                var content = "";
                var data_val = ele.parent().parent().parent().parent().parent().attr("data-val");
                var data_index = ele.parent().parent().parent().parent().parent().attr("data-index");
                //if (parseFloat(ele.parent().parent().attr("data-level")) == 1)
                //    return;

                var level = parseFloat(ele.parent().parent().attr("data-level")) + 1;
                var id = ele.attr("data-id");

                var showall = ele.attr('show-all');
                var pele = ele.parent().parent().parent().parent().parent();
                if (showall == "True") {
                    level = 1;
                    for (var i = 1; i < ele.parent().parent().parent().parent().parent().children().children().children(".lft-popup-col").length; i++) {
                        level += 1;
                        if ($(pele).find("." + "lft-popup-col" + level).find(".lft-popup-ele-label[data-parent='" + id + "']").parent().length == 0) {
                            addfilter(data_val, data_index, level, id);
                        }
                    }
                }
                else {
                    addfilter(data_val, data_index, level, id);
                }
            });
        }
    }
});
/*lft-ctrl-next-global-click-event*/
$(document).on("click", ".legend_container", function () {
    var i = $(this).attr("data-val");
    if (legend_filter_list.indexOf(i) == -1) {
        legend_filter_list.push(i);
    } else {
        legend_filter_list.splice(legend_filter_list.indexOf(i), 1);
    }
    window[current_function_for_chart](current_data_for_chart);
});
$(document).on('click', ".lft-ctrl-next", function () {
    //if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().length != 0) {
    //    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().remove();
    //}
    /*added by chandu find the selection is present or not, if not remove the selected arrow marks start by chandu*/
    if ($(this.parentElement.parentElement).find('.lft-popup-ele_active').length == 0) {
        $(this.parentElement.parentElement).find('.sidearrw_active').removeClass('sidearrw_active');
    }
    /*added by chandu find the selection is present or not, if not remove the selected arrow marks end by chandu*/

    resetPopupCss(this);
    if (checkNumberOfEstablishmentSelected(this) == true) {
        reset_img_pos();
        $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "visible");
        var name = $(this).parent().find("span").text();
        $(this).parent().parent().children(".lft-ctrl3").find(".lft-ctrl3-header-name").html(name);
        var pele = $(this).parent().parent();
        $(".master-lft-ctrl").parent().css("background", "none");
        $(this).parent().parent().parent().css("background", "#353135");
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $(this).parent().parent().parent().find(".lft-ctrl3").show();
        //$(this).parent().parent().parent().find(".lft-popup-col1").show();
        $(this).parent().parent().parent().find(".lft-popup-col1").css("display", "inline-block")
        //$(this).parent().parent().parent().find(".lft-popup-col-search").css("visibility", "visible");
        //$(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "visible");
        //lft-popup-col1
        var level = 0;
        //to make Frequency unselectable depending Visits and Guests Selection

        var selectedTopFiltrNme = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").parent().parent().attr("data-val");
        var selectableListVisits = ["weekly+", "monthly+", "quarterly+", "annualy+", "establishment in trade area", 'yearly+', 'favorite brand in category', 'favorite brand across nab'];
        var selectableListGuests = ["total visits"];
        var isTotalVisits = "total visits";
        var selctedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
        $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele")).removeClass("freqncyunselect");
        $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele").find(".lft-popup-ele-label").attr("data-isselectable", "true");
        $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele")).removeClass("awarenesshide").removeClass("establishmthide");

        //file path
        var pathname = window.location.pathname;
        var fileNameIndex = pathname.lastIndexOf("/") + 1;
        filename = pathname.substr(fileNameIndex);
        var modulename = (window.location.pathname).replace("Dine/", "").split("/")[1];
        //

        //to hide Total visits in frequency
        if ($(this).text().trim() == "FREQUENCY") {
            $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
                if ($(fValue).text().trim().toLowerCase() == isTotalVisits) {
                    $(fValue).addClass("awarenesshide");
                    $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
                }
            });
        }
        //

        //if (($(this).text().trim() == "FREQUENCY" && $("#guest-visit-toggle").prop("checked") == false) && (selectedTopFiltrNme == "Visits" || selectedTopFiltrNme == "DemoGraphicProfiling")) {

        //    $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //        //if (selectableListVisits.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //        //    $(fValue).addClass("freqncyunselect");
        //        //    $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //        //}
        //        if ($(fValue).text().trim() == isTotalVisits)
        //            $(fValue).addClass("awarenesshide");
        //    });
        //}
        //else if ($(this).text().trim() == "FREQUENCY" && $("#guest-visit-toggle").prop("checked") == true && selectedTopFiltrNme != "Visits") {

        //    $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //        if (selectableListGuests.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //            //$(fValue).addClass("freqncyunselect");
        //            $(fValue).addClass("awarenesshide");
        //        }
        //        if ((selctedTopFilterId == 9) && $(fValue).text().trim().toLowerCase() == "establishment in trade area" && (filename == "BeverageCompare" || filename == "BeverageDeepDive"))
        //        { $(fValue).addClass("establishmthide"); }
        //    });
        //}
        //else if ($(this).text().trim() == "FREQUENCY" && modulename == "Analyses") {
        //    if (isVisitsSelected_analysis == 1) {
        //        $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //            if (selectableListVisits.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //                $(fValue).addClass("freqncyunselect");
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //            }

        //            if ($(fValue).text().trim().toLowerCase() == "awareness") {
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //                $(fValue).addClass("awarenesshide");
        //            }
        //        });
        //    }
        //    else {
        //        $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //            if (selectableListGuests.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //                $(fValue).addClass("freqncyunselect");
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //            }

        //            if ($(fValue).text().trim().toLowerCase() == "awareness") {
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //                $(fValue).addClass("awarenesshide");
        //            }
        //        });
        //    }
        //}
        //else if ($(this).text().trim() == "FREQUENCY" && modulename == "Chart") {
        //    //if ($(".adv-fltr-guest").text() == "VISITS") {
        //    if (isVisitsSelected_Charts == 1) {
        //        $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //            if (selectableListVisits.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //                $(fValue).addClass("freqncyunselect");
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //            }

        //            if ($(fValue).text().trim().toLowerCase() == "awareness") {
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //                $(fValue).addClass("awarenesshide");
        //            }
        //        });
        //    }
        //    else {
        //        $.each($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele"), function (fIndex, fValue) {
        //            if (selectableListGuests.indexOf($(fValue).text().trim().toLowerCase()) > -1) {
        //                $(fValue).addClass("freqncyunselect");
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //            }

        //            if ($(fValue).text().trim().toLowerCase() == "awareness") {
        //                $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
        //                $(fValue).addClass("awarenesshide");
        //            }
        //        });

        //    }
        //}

        //if ($(this).hasClass("timeperiod_img")) { $(".lft-popup-tp").first().click().click(); }
        $('.fltr-txt-hldr').css("color", "#000");
        if ($(this).parents('.advance-filters').length == 0) { lft_panel_img_chng(this); }
        else { var child_ele = $(this).find('.fltr-img-hldr'); lft_panel_img_chng(child_ele); $(this).find('.fltr-txt-hldr').css("color", "#fff"); }
        var obj = $(this).parent().parent().parent().find(".lft-popup-col1");
        //SetScroll($(".lft-popup-col"), "rgba(0,0,0,.75)", -10, -5, 0, 14, 8);//scroll for left panel popups

        if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
            //set position of Establishment in Additional filter
            if ($(this).parent().parent().attr("data-val") == "Establishment" && $(this).parent().parent().attr("popup-type") == "advanceFilters") {
                removeEstAdditionalFilterClasses();
                if ($(".adv-fltr-toggle-container").is(":visible") == false) {
                    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level11");
                } else {
                    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level1");
                }

            }
        }
        else {
            if ($(this).parent().parent().attr("popup-type") == "advanceFilters") {
                $('.lft-ctrl3').css("margin", "0%");
            }
            else
                $('.lft-ctrl3').css("margin", "-7px 50px");
        }

        //hide Total in Trend
        var timePeriodList = $(".master-lft-ctrl[data-val='Time Period']").find(".lft-popup-tp");
        if ($(".trend").hasClass("active")) {
            $.each(timePeriodList, function (i, v) {
                if (controllername == "dashboardp2pdashboard") {
                    $(this).css("display", "block");
                }
                else {
                    if ($(v).text() == "TOTAL") {
                        $(this).css("display", "none");
                    }
                }
            });
        }
        else {
            $.each(timePeriodList, function (i, v) {
                $(this).css("display", "block");
            });

        }
        //
        $.each($(".lft-popup-col2").find(".lft-popup-ele-label-img"), function (i, v) {
            $(this).css("width", "0px");
            $(this).css("padding-left", "0px");
        });
    }
    //
    //if ($(this).text().trim().toUpperCase() == "ESTABLISHMENT") {
    //    if ($(".adv-fltr-toggle-container").is(":visible")) {
    //        if (level ==1) {
    //            $(".adv-fltr-sub-selection .lft-popup-col").width("265px");
    //        }
    //        else if (level == 2) {
    //            $(".adv-fltr-sub-selection .lft-popup-col").width("530px");
    //        }
    //        else if (level == 3) {
    //            $(".adv-fltr-sub-selection .lft-popup-col").width("870px");
    //        }
    //    }
    //    else {

    //    }
    //}

    //if (window.location.pathname.toLowerCase().includes("dinereport") && $(this).parentsUntil(".master-lft-ctrl").parent().attr("data-val").toLocaleLowerCase() == "establishment") {
    //        //$(".lft-popup-col2").show();
    //    //$(".lft-ctrl3-content").width("586px");
    //    //Showing search in 2nd level
    //    $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-col1 .lft-popup-col-search").hide();
    //    $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-col2 .lft-popup-col-search").show();
    //}
    //$(".lft-ctrl3-content").width((staticWidth * (level + 1)) + "px");
    SetScroll($(".lft-popup-col"), "rgba(0,0,0,.75)", -10, -5, 0, 14, 8);//scroll for left panel popups
    //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").getNiceScroll().remove();
    if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").getNiceScroll().length == 1) {
        $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-contentt").getNiceScroll().remove();
    }
    if ($(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").getNiceScroll().length == 1) {
        $(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").getNiceScroll().remove();
    }
    //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").niceScroll({
    //    cursorcolor: "#fff",
    //    cursorwidth: "6px",
    //    autohidemode: false,
    //    horizrailenabled: false,
    //    railpadding: {
    //        top: 0,
    //        right: 0,
    //        left: 0,
    //        bottom: 3
    //    }
    //});
    //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().resize();
    //var metricfirstlevelname = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    //var visitsList = ["Pre-Visit", "In-Establishment", "In-Establishment Bev Details", "Post-Visit", "Outlet Motivation Segments", "Outlet Motivation Attributes - Top 2 Box", "Occasion Motivation - Top 2 Box"];
    //var guestsList = ["Beverage Guest", "Establishment Frequency", "Brand Health Metrics", "Establishment Imageries"];
    //var measuresFirstLevelList = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").find(".lft-popup-ele-label");

    //$.each(measuresFirstLevelList, function (i, v) {
    //    $(v).find(".lft-popup-ele-next").removeClass("disableMeasurescolor");
    //    $(v).parent().removeClass('disableMeasures');
    //});
    //if (visitsList.indexOf(metricfirstlevelname) > -1) {
    //    $.each(guestsList, function (VI, VL) {
    //        $.each(measuresFirstLevelList, function (i, v) {
    //            if (VL == $(v).text()) {
    //                $(v).parent().addClass("disableMeasures");
    //                $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
    //            }
    //        });
    //    });
    //}
    //else if (guestsList.indexOf(metricfirstlevelname) > -1) {
    //    $.each(visitsList, function (VI, VL) {
    //        $.each(measuresFirstLevelList, function (i, v) {
    //            if (VL == $(v).text()) {
    //                $(v).parent().addClass("disableMeasures");
    //                $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
    //            }
    //        });
    //    });
    //}
    DisableOrEnableMeasures(name);
    //if ((controllername == "dashboardp2pdashboard") || ($(this).parent().parent().attr("popup-type") == "advanceFilters" && $(this).text().trim() == "Establishment")) {
    //    setTimeout(function () {
    //        searchFunctionalityForDashBoard(pele, level);
    //    }, 10);
    //} else {
    setTimeout(function () {
        searchFunctionality(pele, level);
    }, 10);
    //}
    //if ($(this).hasClass("demograhicFitr_img") && (controllername == "reportdinerreport" || controllername == "reportp2preport")) {
    //    $(this).parent().parent().parent().find(".lft-popup-col1 .popup-header .lft-popup-col-selected-text").eq(0).text("ADVANCED FILTERS")
    //}
    $(".lft-popup-col-selected-text").css("min-height", 20);

    $.each($(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-isselectable=false]"), function (i, v) {
        if ($(v).text() == "Geography") {
            $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
            $(v).parent().addClass('disableMeasures');
        }
    });

    //to show demo filters if any metric comparisions deleted from breadcrum
    toShowDemofilter();
    //

    /*Start update heading based on min max selections @pkr*/
    var minMaxInfo = getminmaxData($(pele).attr("data-val"));
    if (minMaxInfo != undefined) {
        var heading_ele = $(pele).find(".lft-popup-col1 .lft-popup-col-selected-text");
        var cur_text_of_heading_ele = $(pele).attr("data-val");//lft-popup-col-selected-text
        if (cur_text_of_heading_ele == "Time Period") {
            if ($(".pit.active").length == 0) {
                $(pele).find(".timeperiod-min-max-text").remove();
                $(pele).find(".lft-popup-col-selected-text").after("<div class='timeperiod-min-max-text'>" + minMaxInfo.heading + "</div>");
            } else {
                $(pele).find(".timeperiod-min-max-text").remove();
            }

        } else {
            $(heading_ele).html("<div style='font-size:9px;'>" + minMaxInfo.heading + "</div><div>" + cur_text_of_heading_ele + "</div>");
        }
    }
    /*End update heading based on min max selections @pkr*/
});
$(document).click(function (e) {
    var str = e.target.classList.toString();
    if (!(str.includes("lft-popup-ele-label") || str.includes("lft-ctrl-txt-del"))) {
        $(".arrow_popup").removeClass("active_arrow");
        $(".transparentBredCrumBG").hide();
        $(".filter-info-panel").css("z-index", "4");
        $(".filter-info-panel").css("height", "21px");
        $(".arrw").addClass("downarrw");
        $(".arrw").removeClass("uparrw");
    }
});
$(document).on("click", ".filter-info-panel", function (e) {
    e.stopPropagation();
});
$(document).on('click', ".arrow_popup", function (e) {
    var ht = $(".filter-info-panel-elements").height();
    if ($(".arrow_popup").hasClass("active_arrow") == true) {
        $(".arrow_popup").removeClass("active_arrow");
        $(".filter-info-panel").css("height", "21px");
        $(".arrw").addClass("downarrw");
        $(".arrw").removeClass("uparrw");
        $(".transparentBredCrumBG").hide();
        $(".filter-info-panel").css("z-index", "4");
    } else {
        $(".arrow_popup").addClass("active_arrow");
        $(".filter-info-panel").css("height", "auto");
        $(".arrw").addClass("uparrw");
        $(".arrw").removeClass("downarrw");
        $(".transparentBredCrumBG").show();
        $(".filter-info-panel").css("z-index", "1002");
    }
    e.stopPropagation();
});

var reset_img_pos = function () {
    //
    $(".demograhicFitr_img").css("background-position", "-291px -142px");
    $(".establishment_img").css("background-position", "-170px -145px");
    $(".comparission_img").css("background-position", "-409px -147px");
    $(".timeperiod_img").css("background-position", "-1281px -144px");
    $(".measure_img").css("background-position", "-600px -147px");
    $(".beverage_img").css("background-position", "-493px -137px");

    $(".day_part_img").css("background-position", "17px -276px");
    $(".dayofweek_img").css("background-position", "-113px -272px");
    $(".frequency_img").css("background-position", "-1030px -272px");
    $(".adv_establishmentfltr_img").css("background-position", "-1175px -275px");
    $(".beverageitems_img").css("background-position", "-1775px -274px");
    $(".fooditems_img").css("background-position", "-1650px -276px");
    $(".consumed_frequency_img").css("background-position", "-1293px -275px");
    $(".device_used_img").css("background-position", "-1877px -270px");
    $(".frequency_diner_img").css("background-position", "-45px -147px");

    $(".plan_type_img").css("background-position", "-2316px -275px");
    $(".service_mode_img").css("background-position", "-2449px -275px");
    $(".meal_type_img").css("background-position", "-2596px -275px");
    $(".occasion_seg_img").css("background-position", "-2818px -275px");
    $(".bevergage_con_img").css("background-position", "-1775px -274px");
    $(".visit_type_img").css("background-position", "-2714px -275px");
}

var lft_panel_img_chng = function (evt) {
    if ($(evt).hasClass("demograhicFitr_img")) {
        $(evt).css("background-position", "-232px -147px")
    }
    if ($(evt).hasClass("establishment_img")) {
        $(evt).css("background-position", "-103px -147px")
    }
    if ($(evt).hasClass("comparission_img")) {
        $(evt).css("background-position", "-354px -147px")
    }
    if ($(evt).hasClass("timeperiod_img")) {
        $(evt).css("background-position", "-1223px -146px")
    }
    if ($(evt).hasClass("measure_img")) {
        $(evt).css("background-position", "-544px -147px")
    }
    if ($(evt).hasClass("beverage_img")) {
        $(evt).css("background-position", "-454px -137px")
    }
    if ($(evt).hasClass("day_part_img")) {
        $(evt).css("background-position", "-52px -276px")
    }
    if ($(evt).hasClass("dayofweek_img")) {
        $(evt).css("background-position", "-166px -272px")
    }
    if ($(evt).hasClass("frequency_img")) {
        $(evt).css("background-position", "-1104px -275px")
    }
    if ($(evt).hasClass("frequency_diner_img")) {
        $(evt).css("background-position", "10px -147px")
    }
    if ($(evt).hasClass("adv_establishmentfltr_img")) {
        $(evt).css("background-position", "-1233px -275px")
    }
    if ($(evt).hasClass("beverageitems_img")) {
        $(evt).css("background-position", "-1827px -276px")
    }
    if ($(evt).hasClass("fooditems_img")) {
        $(evt).css("background-position", "-1716px -275px")
    }
    if ($(evt).hasClass("consumed_frequency_img")) {
        $(evt).css("background-position", "-1348px -275px")
    }
    if ($(evt).hasClass("device_used_img")) {
        $(evt).css("background-position", "-1930px -270px")
    }


    if ($(evt).hasClass("plan_type_img")) {
        $(evt).css("background-position", "-2377px -275px")
    }
    if ($(evt).hasClass("service_mode_img")) {
        $(evt).css("background-position", "-2525px -275px")
    }
    if ($(evt).hasClass("meal_type_img")) {
        $(evt).css("background-position", "-2661px -275px")
    }
    if ($(evt).hasClass("occasion_seg_img")) {
        $(evt).css("background-position", "-2875px -275px")
    }
    if ($(evt).hasClass("bevergage_con_img")) {
        $(evt).css("background-position", "-1828px -274px")
    }
    if ($(evt).hasClass("visit_type_img")) {
        $(evt).css("background-position", "-2764px -275px")
    }
};

$(document).on("click", ".lft-popup-ele-next", function () {
    var pathname = window.location.pathname;
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex);
    //searchBoxFil($(this).parent().find(".lft-popup-ele-label").text().length);
    if ($(this).parent().hasClass("disableMeasures")) {
        return false;
    }
    var pele = $(this).parent().parent().parent().parent().parent();
    var eleid, parenteleid, level;
    eleid = $(this).siblings(".lft-popup-ele-label").attr('data-id');
    parenteleid = $(this).siblings(".lft-popup-ele-label").attr('data-parent');
    level = $(this).parent().parent().attr('data-level');
    level = (parseInt(level) + 1);
    measureCurrentLevel = level;//set width depending on levels in 
    var mstrParent = $(this).parent().parent().parent().parent().parent();
    mstrText = $(mstrParent).attr("data-val");
    resetPopupLevelCss(this);
    if ($(pele).attr("data-val") == "Measures" && $(this).parent().parent().attr("data-level") == "1") {
        clearOTherMeasureSelection(this);
    }

    $(pele).find(".lft-popup-col").each(function () {
        if (parseInt($(this).attr('data-level')) > level)
            $(this).hide();
    });
    //added by Nagaraju D for showing all levels at a time
    //Date: 18-08-2017
    var showall = $(this).attr('show-all');
    var _level = 1;
    if (showall == "True") {
        for (var i = 1; i < $(this).parent().parent().parent().parent().parent().children().children().children(".lft-popup-col").length; i++) {
            _level += 1;
            if ($(pele).find("." + "lft-popup-col" + _level).find(".lft-popup-ele-label[data-parent='" + eleid + "']").parent().length > 0) {
                $(pele).find("." + "lft-popup-col" + _level).find(".lft-popup-ele-label").parent().hide();
                $(pele).find("." + "lft-popup-col" + _level).find(".lft-popup-ele-label[data-parent='" + eleid + "']").parent().show();
                //added by Nagaraju 
                //Date: 25-07-2017
                $(pele).find("." + "lft-popup-col" + _level).css("display", "inline-block");
                //$(pele).find("." + "lft-popup-col" + level).show();
            }
        }
    }
    else {
        $(pele).find("." + "lft-popup-col" + level).find(".lft-popup-ele-label").parent().hide();
        $(pele).find("." + "lft-popup-col" + level).find(".lft-popup-ele-label[data-parent='" + eleid + "']").parent().show();
        //added by Nagaraju 
        //Date: 25-07-2017
        $(pele).find("." + "lft-popup-col" + level).css("display", "inline-block");
        //$(pele).find("." + "lft-popup-col" + level).show();
    }

    var groupsSelectionsCount = 0, measuresSelectionsCount = 0, selCount = 1;
    var measuresSelections = $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl2 .lft-ctrl-txt").attr("data-ids");
    var groupsSelections = $(".master-lft-ctrl[data-val='Metric_Comparisons'] .lft-ctrl2 .lft-ctrl-txt").attr("data-ids");
    if (groupsSelections != "" && groupsSelections != undefined) groupsSelectionsCount = groupsSelections.split("|").length;
    if ((controllername.toUpperCase() == "CHARTBEVERAGEDEEPDIVE" || controllername.toUpperCase() == "CHARTESTABLISHMENTDEEPDIVE")
        && $(".lft-popup-tp-smnu-active").attr("data-val") == "trend")
        if (groupsSelectionsCount <= 1) selCount = 10; else selCount = 1;
    if ($(".master_link.active").text().toUpperCase() == "ADD'L CAPABILITIES" || $(".lft-popup-tp-smnu-active").attr("data-val") != "trend")
        selCount = 10;

    if ($(pele).attr("data-val") == "Measures" && ($(".master_link.active").text().toUpperCase() == 'CHARTS' || $(".master_link.active").text().toUpperCase() == "ADD'L CAPABILITIES")) {
        if (level == 2) {
            $(pele).find(".lft-popup-col").attr("first-level-selection", $(this.parentElement).text().trim());
            $.each($(pele).find(".lft-popup-col" + level).find(".lft-popup-ele-label-img"), function (i, v) {
                $(this).css("width", "0px");
                $(this).css("padding-left", "0px");
            });
        }
        if ($(pele).find(".lft-popup-col" + level).find(".lft-popup-ele .lft-popup-ele-label[data-parent='" + eleid + "'][data-isselectable='true']").length > 0) {
            $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl2 .lft-ctrl-txt").removeAttr("data-ids");
            $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl3 .lft-popup-ele.lft-popup-ele_active").removeClass('lft-popup-ele_active');
        }
        isAdditionalFilterLoaded = false;
        $.each($(pele).find(".lft-popup-col" + level).find(".lft-popup-ele .lft-popup-ele-label[data-parent='" + eleid + "'][data-isselectable='true']"), function (i, v) {
            if (i < selCount) {
                if (i == 0)
                    isAdditionalFilterLoaded = true;
                else
                    isAdditionalFilterLoaded = false;
                $(v).click();

            }
            else
                return false;
        });
    }

    //To hide Images Except for 1st Level
    if ((level != 1 && $(pele).attr("data-val") == "Measures") || (level != 1 && $(pele).attr("data-val") == "Advanced Filters")) {
        if (level == 2) {
            $.each($(pele).find(".lft-popup-col" + level).find(".lft-popup-ele-label-img"), function (i, v) {
                $(this).css("width", "0px");
                $(this).css("padding-left", "0px");
            });
        }
        var currentLevelList = $("." + "lft-popup-col" + level).find(".lft-popup-ele-label[data-parent='" + eleid + "']").parent();
        currentLevelList.each(function (i, v) {
            $(v).find(".lft-popup-ele-label-img").each(function (Iimg, Vimg) {
                $(Vimg).addClass("hide-img");
                $(Vimg).parent().find(".lft-popup-ele-label").addClass("per87");
            });
        });
    }
    //
    if ($(pele).attr("data-val") == "Measures") {
        hideMeasureBaseonComparisonBanner();
    }

    if (level - 1 == 1 || level == 1) {
        var currentText = $(this).parent().find(".lft-popup-ele-label").text();
        $(".master-lft-ctrl[data-val='" + mstrText + "']").find("." + "lft-popup-col" + level).attr("first-level-selection", currentText);
        $(".master-lft-ctrl[data-val='" + mstrText + "']").find("." + "lft-popup-col1").attr("first-level-selection", currentText);
    }
    else {
        var firstLevelSelection = $(this).parent().parent().parent().find(".lft-popup-col1").attr("first-level-selection");
        $(".master-lft-ctrl[data-val='" + mstrText + "']").find("." + "lft-popup-col" + level).attr("first-level-selection", firstLevelSelection);
    }
    var selectedText = $(this).parent().find(".lft-popup-ele-label").text();
    $("." + "lft-popup-col" + level).find(".lft-popup-col-selected-text").html('').append(selectedText);
    var pele = $(this).parent().parent().parent().parent().parent();
    var level = $(this).parent().parent().attr("data-level");

    //********* added by Nagaraju to remove active arrow for next levels ********
    for (var i = (parseInt(level)) ; i < $(this).parent().parent().parent().parent().parent().children().children().children(".lft-popup-col").length; i++) {
        $(".lft-popup-col" + i + " .lft-popup-ele").css("background-color", "#353135");
        $(".lft-popup-col" + i + " .lft-popup-ele-next span").removeClass('sidearrw_active');
    }
    //$(".lft-popup-col" + level + " .lft-popup-ele").css("background-color", "#353135");
    //$(".lft-popup-col" + level + " .lft-popup-ele-next span").removeClass('sidearrw_active');
    //*********** end **********************

    $(this).children().addClass('sidearrw_active');
    var obj = $(".master-lft-ctrl[data-val='" + mstrText + "']").find("." + "lft-popup-col" + level);
    SetScroll($(".lft-popup-col"), "rgba(0,0,0,.75)", -10, -5, 0, 14, 8);//scroll for left panel popups

    //Establishment nice scroll
    if (mstrText == "Establishment") {
        //$(".lft-ctrl3-content").css("height","98%");
        //if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().length != 0) {
        //    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().remove();
        //}
        //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().resize();
        if (level == 4) {
            //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").width($(".master-content-area").width() - 30);
            $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").niceScroll({
                cursorcolor: "#fff",
                cursorwidth: "6px",
                autohidemode: false,
                horizrailenabled: true,
                railpadding: {
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 8
                }
            });
            $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").getNiceScroll().resize();
        }
    }
    //Custom Base nice scroll
    if (mstrText == "Custom Base") {
        if ($(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").getNiceScroll().length == 1) {
            $(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").getNiceScroll().remove();
        }
        if (level == 4) {
            $(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").niceScroll({
                cursorcolor: "#fff",
                cursorwidth: "6px",
                autohidemode: false,
                horizrailenabled: true,
                railpadding: {
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0
                }
            });
            $(".dashboard-custom-base .master-lft-ctrl[data-val='Custom Base'] .lft-ctrl3-content").getNiceScroll().resize();
        }

    }
    if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
        var tempI = "";
        if ($(".adv-fltr-toggle-container").is(":visible") == false) { tempI = "1"; }
        //set position of Establishment in Additional filter
        if (mstrText == "Establishment" && $(mstrParent).attr("popup-type") == "advanceFilters") {
            if (level == 1) {
                removeEstAdditionalFilterClasses();
                $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level2" + tempI);
            }
            else {
                if (level == 2) {
                    removeEstAdditionalFilterClasses();
                    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level3" + tempI);
                } else {
                    if (level == 3) {
                        removeEstAdditionalFilterClasses();
                        $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level4" + tempI);
                    } else {
                        if (level == 4) {
                            removeEstAdditionalFilterClasses();
                            $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level5" + tempI);
                        } else {
                            removeEstAdditionalFilterClasses();
                        }
                    }
                }
            }
        }
        else {
            removeEstAdditionalFilterClasses();
            $(".adv-fltr-sub-establmt").find(".lft-ctrl3").addClass("pop-level1" + tempI);
        }
    }

    if ($(this).parent().text().trim() == "Geography")
        customRegions($(pele).attr("data-val"));//Custom Regions adding tooltips,enable and disable based on time periods

    //To add underline and Bold for Prominent Headers added By Bramhanath(26-05-2017)
    var listpromHeaders = $("span.isSubHeading_Width");
    var lPush = [];
    var lParendId = [];

    //To get all the list of id and name
    $.each(listpromHeaders, function (i, v) {
        if (lPush.indexOf($(v).attr("data-parent-id")) == -1) {
            lPush.push($(v).attr("data-parent-id"));
            lParendId.push({ name: $(v).attr("data-parent-level"), id: $(v).attr("data-parent-id") });
        }
    });

    //to make underline and Bold for Prominent Headers only if the name and id are equal
    $.each(lParendId, function (iheading, vheading) {
        var sublist = $(".lft-popup-ele-label[data-val='" + vheading.name + "']");
        $.each(sublist, function (i, v) {
            if ($(v).attr("data-id") == vheading.id) {
                $(v).addClass("applyParentStyles");
                //$(v).parent().addClass("removeborder");
                $(v).parent().css('pointer-events', 'none');

            }
        });

    });
    //
    /*Start Rename Header Texts based on Some conditions @PKR*/
    var levelEst = $(this).parent().parent().attr("data-level");
    if ($(pele).attr("data-val") == "Establishment" || $(pele).attr("data-val") == "Custom Base") {
        var prnt = ($(pele).find('.lft-popup-col1').attr("first-level-selection") == "Restaurants" ? "Restaurant" : "Retailer");
        if (prnt == "Retailer") {
            if (levelEst == "1") {
                $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Subcategory");
            } else {
                $(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text(prnt);
            }
        } else {
            switch (levelEst) {
                case "1": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-1"); break;
                case "2": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-2"); break;
                case "3": if ($(this).parent().find(".lft-popup-ele-label").attr("data-val") == "Fine Dining") { $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text(prnt); } else { $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-3"); } break;
                case "4": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text(prnt); break;
            }
        }
    }
    if ($(pele).attr("data-val") == "Beverage") {
        if (levelEst == "1") {
            //Is subCategory or Not
            var txt = $(this).parent().find(".lft-popup-ele-label").text().toLocaleLowerCase().trim();
            switch (txt) {
                case "category nets":
                case "detailed categories": {
                    if ($(this).parent().find(".lft-popup-ele-label ").eq(0).text().toLocaleLowerCase() == "category nets") {
                        $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Subcategory");
                        $(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text("Subcategory");
                        $(pele).find('.lft-popup-col4 .lft-popup-col-selected-text').text("Subcategory");
                    }
                    $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Subcategory"); break;
                }
                default: $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Brand");
            }
        }
    }
    /*End Rename Header Texts based on Some conditions @PKR*/
    //move the cursor to rightmost place
    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").scrollLeft(1000);
    //Special case for custom base
    if ($(pele).attr("data-val") == "Custom Base") {
        if (levelEst == "4") { $(".dashboard-custom-base .lft-ctrl3-content").css("overflow-x", "auto"); $(".dashboard-custom-base .lft-ctrl3-content").scrollLeft(1000); } else { $(".dashboard-custom-base .lft-ctrl3-content").css("overflow-x", "hidden"); }
    }
    //

    //Added for scroll issue - Revathy 1
    //edited by Nagaraju D for vertical scroll
    //Date: 01-09-2017
    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content, .dashboard-custom-base .lft-ctrl3-content").bind("scroll", function () {
        SetScroll($(".lft-popup-col"), "rgba(0,0,0,.75)", -10, -5, 0, 14, 8);
    });
    $(".lft-popup-col-selected-text").css("min-height", 20);
    var maxheadingheight = 20;
    $.each($(this).parent().parent().parent().find(".lft-popup-col-selected-text"), function (i, j) {
        if ($(j).height() > maxheadingheight && ($(j).is(":visible")))
            maxheadingheight = $(j).height();
    });
    $(".lft-popup-col-selected-text").css("min-height", maxheadingheight);

    //To disable the Geography temperorily

    if ($(this).parent().text().trim() == "Demographics" || $(this).parent().text().trim() == "Demographic Filters") {
        $.each($(pele).find("." + "lft-popup-col2").find(".lft-popup-ele-label[data-isselectable=false]"), function (i, v) {
            if ($(v).text() == "Geography") {
                $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
                $(v).parent().addClass('disableMeasures');
            }
        });
    }
    //
    ClearMeasures(mstrText);
});

$(document).on("click", ".lft-popup-ele-label", function () {
    var pele = $(this).parent().parent().parent().parent();
    isCrossDinerSubmitClicked = false;
    /*Start restrict if max selections has been done @pkr*/
    var minmaxinfo = getminmaxData($(pele).parent().attr('data-val'));
    if (minmaxinfo != undefined && minmaxinfo.max != 1) {
        var cur_ele = $(pele).find(".lft-popup-ele_active");
        //If already there then do nothing
        var isThere = false, cur_text = $(this).attr('data-val');
        $(cur_ele).each(function (index, data) {
            if ($(data).find(".lft-popup-ele-label").attr('data-val') == cur_text) {
                isThere = true;
            }
        });
        if (!isThere) {
            if ($(cur_ele).length >= minmaxinfo.max) {
                showMaxAlert(minmaxinfo.maxmessage);
                return;
            }
        }
    }
    /*End restrict if max selections has been done @pkr*/

    if ($(".advance-filters").find(pele).length == 0) { leftpanelchanged = true; }
    //To make the Frequency of additionanl filter not to deselect the items in Guest Only
    var isFrequency = pele.parent().attr('data-val');
    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
        if (isFrequency == "FREQUENCY") {
            var seleteditem = $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
            if (seleteditem == $(this).text().trim()) {
                return false;
            }
        }
    }
    //If in Dashboard selected same establishment in Custom base also
    //    if (controllername == "dashboardp2pdashboard" && pele.parent().attr('data-val') == "Custom Base") {
    //        if ($(".Establishment_topdiv_element .sel_text").css("text-transform", "none").text() == $(this).parent().find(".lft-popup-ele-label").attr("data-val")) {
    //        $(".Establishment_topdiv_element .sel_text").css("text-transform", "uppercase")
    //        alert("Already selected"); return;
    //    }
    //    $(".Establishment_topdiv_element .sel_text").css("text-transform", "uppercase");

    //        ////If custom Base is deSelected then Custom base should be moved to Previous period
    //        //if ($(".Custom_Base_topdiv_element .sel_text").text().toUpperCase() == $(this).text().toUpperCase()) {
    //        //    $(".table-stat").removeClass("activestat");
    //        //    $(".table-stat:eq(0)").addClass("activestat"); customCurrentSelections = "";
    //    //}
    //    }
    //if (controllername == "dashboardp2pdashboard" && pele.parent().attr('data-val') == "Establishment") {
    //    if ($(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text() == $(this).parent().find(".lft-popup-ele-label").attr("data-val")) {
    //        $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase")
    //        alert("Already selected"); return;
    //    }
    //    $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
    //}
    //in charts deepdive trend groups and measures alternative selections single and multiple start by chandu
    if ((controllername.toUpperCase() == "CHARTBEVERAGEDEEPDIVE" || controllername.toUpperCase() == "CHARTESTABLISHMENTDEEPDIVE") && $(".lft-popup-tp-smnu-active").attr("data-val") == "trend" && (pele.parent().attr('data-val').toLocaleLowerCase() == 'measures' || pele.parent().attr('data-val') == 'metric comparisons')) {
        var groupsSelectionsCount = 0, measuresSelectionsCount = 0;
        var measuresSelections = $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl2 .lft-ctrl-txt").attr("data-ids");
        var groupsSelections = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-ctrl2 .lft-ctrl-txt").attr("data-ids");

        if (groupsSelections != "" && groupsSelections != undefined) groupsSelectionsCount = groupsSelections.split("|").length;
        if (measuresSelections != "" && measuresSelections != undefined) measuresSelectionsCount = measuresSelections.split("|").length;
        if (groupsSelectionsCount > 1 && pele.parent().attr('data-val') == "Measures") {
            $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl2 .lft-ctrl-txt").removeAttr("data-ids");
            $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl3 .lft-popup-ele.lft-popup-ele_active").removeClass('lft-popup-ele_active');
            $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'false')
        }
        else
            $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'true')

        if (measuresSelectionsCount > 1 && pele.parent().attr('data-val') == "Metric Comparisons") {
            $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-ctrl2 .lft-ctrl-txt").removeAttr("data-ids");
            $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-ctrl3 .lft-popup-ele.lft-popup-ele_active").removeClass('lft-popup-ele_active');
            $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'false')
        }
        else {
            $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'true');
        }
        $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").attr("data-ismultiselect", "false");
    }
    //in charts deepdive trend groups and measures alternative selections single and multiple end by chandu


    if ($(this).attr('data-isselectable') === "false") {
        return;
    }
    var level = $(this).parent().parent().attr("data-level");

    //changing the advance filter based on measure selection
    //start
    if (pele.parent().attr('data-val') == "Measures" || pele.parent().attr('data-val') == "Demographic Filters") {
        if (isAdditionalFilterLoaded)
            hideAndShowAdvanceFilterBasedOnMeasure(this, pele.parent().attr('data-val'));
        hideAndShowConsumedFreqForBeverage(this, pele.parent().attr('data-val'));
    }

    var selectedeleids = [], ctrl2 = $(pele).siblings(".lft-ctrl2"), divtxtbox = '';
    //For reports
    if (window.location.pathname.toLocaleLowerCase().includes("report")) {
        isSampleSizeValidated = 0;
    }
    if ($(this).parent().hasClass('lft-popup-ele_active')) {
        $(this).parent().removeClass("lft-popup-ele_active");
        removeSelectedPanelElement(true, this, ctrl2);
        //}
        hideEstablishmentFromTable(removeBlankSpace($(this).text()));//dynamically adding selected Establishments or Groups or Beverages to Table

    }
    else {
        //get selected parent names 
        if (pele.parent().attr('data-val') == "Measures" || pele.parent().attr('data-val') == "Metric Comparisons") {
            if (validationToSelectDataWithinSameParent(this) === false)
                return;
        }
        //Custom Regions Selecting and deselecting in Demographic Filters Only
        if (pele.parent().attr('data-val') == "Demographic Filters") {
            if (validationToSelectNDeselectInSubLevels(this) === false)
                return;
        }
        //For dine reports Establishments
        if (window.location.pathname.toLocaleLowerCase().includes("report") && pele.parent().attr("data-val").toLocaleLowerCase() == "establishment") {
            if ($(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").length < 5) {
                $(this).parent().addClass("lft-popup-ele_active");
                addSelectedPanelElement(this, ctrl2);
            } else {
                alert("Already maximum establishments selected !");
                //$(".lft-ctrl3").hide(); $(".lft-popup-col").hide();
                //reset_img_pos();$(".master-lft-ctrl").parent().css("background", "none");
            }
        } else {
            if ($(pele).attr('data-ismultiselect') == "true") {
                //added by Nagaraju D for duplicate items
                //Date: 22-08-2017
                var selectedValue = $(this).attr('data-val');
                var label = pele.parent().attr('data-val');
                var lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]');
                var isItemExist = false;
                $(lbserachparent).each(function () {
                    if ($(this).parent().hasClass('lft-popup-ele_active')) {
                        isItemExist = true;
                        return false;
                    }
                });
                if (isItemExist) {
                    showMaxAlert("Already selected.");
                    return;
                }

                $(this).parent().addClass("lft-popup-ele_active");
            }
            else {
                if ($(pele).find(".lft-popup-ele_active").length > 0) {
                    removeSelectedPanelElement(true, $(pele).find(".lft-popup-ele_active").children(".lft-popup-ele-label"), ctrl2);
                    $(pele).find(".lft-popup-ele").removeClass("lft-popup-ele_active");
                }

                $(this).parent().addClass("lft-popup-ele_active");
            }
            addSelectedPanelElement(this, ctrl2);
        }
        //dynamically adding selected Establishments or Groups or Beverages to Table
        if ($('#flexi-table tr').length == 0 && $('.padd_top_left').text() == "") {
            emptyTableoutputWithSelectedColumns(filename);
            $(".table-statlayer").css("display", "block");
        }
        else {
            var pathname = window.location.pathname; var fileNameIndex = pathname.lastIndexOf("/") + 1; var filename = pathname.substr(fileNameIndex);

            if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
                if (pele.parent().attr('data-val') == "Metric Comparisons" || pele.parent().attr('data-val') == "Beverage") {
                    if ($(".trend").hasClass("active"))
                    { }
                    else
                    {
                        if (filename == "BeverageDeepDive" && pele.parent().attr('data-val') == "Beverage") {
                        }
                        else {
                            appendingEstablishmentToTable($(this));
                            if ($(".scrollable-data-frame").height() <= 30 && (controllername == "tableestablishmentcompare" || controllername == "tableestablishmentdeepdive" || controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive"
)) {
                                $(".tbl-data-btmbrd").css("display", "none");
                                $(".tbl-btm-circle ").css("display", "none");
                            }
                        }
                    }
                }
            }
            else {
                if (pele.parent().attr('data-val') == "Metric Comparisons" || pele.parent().attr('data-val') == "Establishment" || pele.parent().attr('data-val') == "Beverage") {
                    if ($(".trend").hasClass("active"))
                    { }
                    else
                    {
                        if (filename == "EstablishmentDeepDive" && pele.parent().attr('data-val') == "Establishment") {
                        }
                        else {
                            appendingEstablishmentToTable($(this));
                            if ($(".scrollable-data-frame").height() <= 30 && (controllername == "tableestablishmentcompare" || controllername == "tableestablishmentdeepdive" || controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive"
)) {
                                $(".tbl-data-btmbrd").css("display", "none");
                                $(".tbl-btm-circle ").css("display", "none");
                            }
                        }
                    }
                }
            }
        }
    }

    //if (controllername == "dashboardp2pdashboard" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth") {
    //    $('.filter-info-panel-elements .Establishment_topdiv_element').html('');
    //    $('.filter-info-panel-elements .Demographic_Filters_topdiv_element').html('');
    //}
    if (controllername == "reportp2preport" || controllername == "reportdinerreport" || controllername == "dashboardp2pdashboard" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth" || controllername == "analysescrossDinerFrequencies")
        $('.advance-filters').css("display", "none");
    else
        $('.advance-filters').css("display", "block");//To display Top Advance Filters

    //Selcted Frequency to carry Forward based on guests or visits
    if ($(".master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele_active").find(".lft-popup-ele-label").text() != "")
        selectedFrequencyToCarryFrwd = $(".master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele_active").find(".lft-popup-ele-label").text();
    //
    //removeExtraPipes();

    /*groups, measures and advnce filter show and hide based on selections start by chandu*/
    if (
        (controllername == 'chartestablishmentdeepdive' || controllername == 'chartbeveragedeepdive' || controllername == 'analysesestablishmentdeepdive') &&
        (pele.parent().attr('data-val') == "Metric Comparisons" || pele.parent().attr('data-val') == "Demographic Filters" || pele.parent().attr('data-val') == "Measures")
        ) {
        var groups_Selected_Parent = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active .lft-popup-ele-label").attr('parent-text');
        var measures_Selected_Parent = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active .lft-popup-ele-label").attr('parent-text');

        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele.dynamic_show_hide_charts").css('display', 'flex');
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele").removeClass('dynamic_show_hide_charts');

        if (pele.parent().attr('data-val') == "Metric Comparisons") {
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + groups_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');

            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
            });
        }
        else if (pele.parent().attr('data-val') == "Measures") {
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + measures_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');

            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
            });
        }
        else if (pele.parent().attr('data-val') == "Demographic Filters") {
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');

            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');

            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + groups_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');
            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
                $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
            });

            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + measures_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');
        }

        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + groups_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + measures_Selected_Parent + "']").parent().addClass('dynamic_show_hide_charts');
    }
    /*groups, measures and advnce filter show and hide based on selections end by chandu*/
    ClearMeasures(isFrequency, $(this).attr("parent-text"), $(this).attr("data-parent"));
});

var removeExtraPipes = function () {
    var allTopDivs = $(".filter-info-panel-elements .topdiv_element");
    for (var i = 0; i < allTopDivs.length; i++) {
        if ($(".filter-info-panel-elements .topdiv_element:eq(" + i + ")").find(".filter-info-panel-lbl").length == 0) {
            //remove the pipe if present
            $(".filter-info-panel-elements .topdiv_element:eq(" + i + ")").find(".pipe").remove();
        }
    }
}

var removeSelectedPanelElement = function (isremoved, key, ctrl2) {
    var selectedeleids = [];
    //remove selected items
    if (isremoved) {
        if ($(ctrl2).find(".lft-ctrl-txt").attr('data-ids') != undefined && $(ctrl2).find(".lft-ctrl-txt") != null) {
            selectedeleids = String($(ctrl2).find(".lft-ctrl-txt").attr('data-ids')).split('|');
            selectedeleids = $.grep(selectedeleids, function (value) {
                return value != JSON.stringify({
                    ID: $(key).attr('data-id'), Text: $(key).text()
                })
            });
            $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

            $(ctrl2).find(".lft-ctrl-txt").html('');
            if ($(".filter-info-panel").is(":visible")) {
                var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                if ($(".filter-info-panel ." + topdivele).length != 0) {
                    $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + " : 
                }
            }
            var selctedIndexslist = 0;
            $(selectedeleids).each(function (i, d) {
                if (d != null && d != undefined && d != {} && d != []) {
                    var ele = $("<div class='lft-ctrl-txt-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%;'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>&nbsp;</span></div>");//<span class='lft-ctrl-txt-del' style='float:right;'>x</span>
                    if ($(".filter-info-panel").is(":visible")) {
                        if (selctedIndexslist == 0) {
                            $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                        } else {
                            if (JSON.parse(d).ID != undefined)
                                $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                        }
                        selctedIndexslist++;
                    }

                    $(ctrl2).find(".lft-ctrl-txt").append(ele);
                }
            });
            $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
                $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
            });
        }
    }
    removeExtraPipes();
}

var addSelectedPanelElement = function (key, ctrl2) {
    var selectedeleids = [];
    //add into left panel view
    if ($(ctrl2).find(".lft-ctrl-txt").attr('data-ids') != undefined && $(ctrl2).find(".lft-ctrl-txt") != null) {
        if ($(ctrl2).find(".lft-ctrl-txt").attr('data-ids') != '')
            selectedeleids = String($(ctrl2).find(".lft-ctrl-txt").attr('data-ids')).split('|');
    }
    selectedeleids.push(JSON.stringify({
        ID: $(key).attr('data-id'), Text: $(key).text()
    }));
    $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

    $(ctrl2).find(".lft-ctrl-txt").html('');
    //find topdiv panel is there are not, if not there create it
    if ($(".filter-info-panel").is(":visible")) {
        var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
        if ($(".filter-info-panel ." + topdivele).length == 0) {
            $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
        }
        $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + "
    }

    var selctedIndexslist = 0;
    $(selectedeleids).each(function (i, d) {
        if (d != null && d != undefined && d != {} && d != []) {
            var ele = $("<div class='lft-ctrl-txt-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>&nbsp;</span></div>");//<span class='lft-ctrl-txt-del' style='float:right;'>x</span>

            //for showing data in additional place/panel
            if ($(".filter-info-panel").is(":visible")) {
                if (selctedIndexslist == 0) {
                    $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                } else {
                    if (JSON.parse(d).ID != undefined)
                        $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                }
                selctedIndexslist++;
            }
            $(ctrl2).find(".lft-ctrl-txt").append(ele.clone());
            if (isAdditionalFilterLoaded == true || controllername == "tableestablishmentdeepdive" || controllername == "tablebeveragedeepdive") {

                hideAndShowSelectedValuesFromDemoInDeepDiveView(key, ctrl2);
            }
        }
    });

    //to hide the frequency in breadcrum when total visits is selected

    if ($(".FREQUENCY_topdiv_element.topdiv_element").find(".filter-info-panel-lbl").attr("data-id") == "6")
        $('.FREQUENCY_topdiv_element').hide();
    else
        $('.FREQUENCY_topdiv_element').show();

    //

    $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
        $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
    });
    if (topdivele == "Custom_Base_topdiv_element") { $(".Custom_Base_topdiv_element .pipe").text(" |  Custom Base : "); }
    //$('.filter-info-selected-elmnts').append($('.filter-info-panel-elements').html());
}

$(document).on('click', '.filter-info-panel .filter-info-panel-txt-del, .filter-info-panel-txt-del', function () {
    var flt = $(this).parent().parent().attr("data-val");
    $(".lft-ctrl3").hide();
    $(".lft-popup-col").hide();
    reset_img_pos();
    $(".master-lft-ctrl").parent().css("background", "none");
    if (flt == "CONSUMED FREQUENCY" || flt == "FREQUENCY") { } else {
        var pele = $(this).parent().parent();
        var peleVal = $(pele).attr('data-val');
        var ptxt = $(this).parent().find(".sel_text").text();//.slice(0, -1);
        var isdeleted = false;
        $(".master-lft-ctrl").each(function (i, e) {
            if ($(e).attr('data-val') == peleVal) {
                $(e).find(".lft-ctrl2").find(".lft-ctrl-txt-lbl").each(function (i, ele) {
                    if (ptxt == $(ele).text().slice(0, -1)) {
                        $(ele).find(".lft-ctrl-txt-del").click();
                        isdeleted = true;
                        return;
                    }
                });
            }
            if (isdeleted)
                return;
        });
        //hideEstablishmentFromTable(removeBlankSpace(ptxt));//To hide the deleted establishment or Groups or Beverages from the table outputarea
    }
});

$(document).ready(function () {
    $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "visible");
    $(".master_link").hover(function () {
        var path = $(this).find(".master_link_a").attr("id");
        switch (path) {
            case "report": $(".reports-logo").css("background-position", "6px 2px"); break;
            case "table": $(".tables-logo").css("background-position", "-78px 2px"); break;
            case "chart": $(".charts-logo").css("background-position", "-155px 2px"); break;
            case "analyses": $(".analysis-logo").css("background-position", "-239px 2px"); break;
            case "dashboard": $(".dashboard-logo").css("background-position", "-440px 2px"); break;
        }
    });
    $(".master_link").mouseleave(function () {
        var path = $(this).find(".master_link_a").attr("id");
        var cur_path = $(".master_link.active").find(".master_link_a").attr("id");
        if (path != cur_path) {
            switch (path) {
                case "report": $(".reports-logo").css("background-position", "-35px 2px"); break;
                case "table": $(".tables-logo").css("background-position", "-119px 2px"); break;
                case "chart": $(".charts-logo").css("background-position", "-199px 2px"); break;
                case "analyses": $(".analysis-logo").css("background-position", "-283px 2px"); break;
                case "dashboard": $(".dashboard-logo").css("background-position", "-484px 2px"); break;
            }
        }
    });
    $(".master_link").click(function () {
        var path = $(this).find(".master_link_a").attr("id");
        $(".submodules-band").hide();
        if ($(".master-top-header").width() == 1920) {
            if ($(this).find(".master_link_a").text() == "DASHBOARD") {
                $(".submodules-band").css("margin-left", "23.5%");
                $(".submodules-band").css("margin-top", "-0.40%");
            }
            if ($(this).find(".master_link_a").text() == "REPORTS") {
                $(".submodules-band").css("margin-left", "37.1%");
                $(".submodules-band").css("margin-top", "-0.44%");
            }
            if ($(this).find(".master_link_a").text() == "TABLES") {
                $(".submodules-band").css("margin-left", "49.4%");
                $(".submodules-band").css("margin-top", "-0.55%");
            }
            else if ($(this).find(".master_link_a").text() == "CHARTS") {
                $(".submodules-band").css("margin-left", "60.9%");
                $(".submodules-band").css("margin-top", "-0.55%");
            }
            if ($(this).find(".master_link_a").text() == "ADD'L CAPABILITIES") {
                $(".submodules-band").css("margin-left", "74.4%");
                $(".submodules-band").css("margin-top", "-0.44%");
            }
        }
        window.location.href = appRouteUrl + "" + path;
    });
    $(".submodules-options-link").click(function () {
        $(this).find('a')[0].click();
    });
    $(".pit-trend-slider").click(function () {
        IsPIT_TREND = true;
        angular.element(".right-skew-DemoGraphicProfiling").triggerHandler('click');
        $(".lft-ctrl-toggle-text").css("color", "#000");
        $(".chrt-typ").removeClass("active");
        if (controllername != "dashboardp2pdashboard") {
            clearAdvanceFilters();//To clear Advance Filter Selections
            clearOutputData();//To clear output data
        }
        if ($('.pit').hasClass('active')) {
            $(".pit").removeClass("active");
            $(".trend").addClass("active");
            if (controllername == "dashboardp2pdashboard")
            { }
            else
                $(".trend").first().trigger('click');
            changeMeasuresIsMultiSelectProperty("trend");
            hideAndShowFilterOnPitTrend("trend");
            $(".table-statlayer").show();
        } else {
            $(".trend").removeClass("active");
            $(".pit").addClass("active");
            if (controllername == "dashboardp2pdashboard")
            { }
            else
                $(".pit").first().trigger('click');
            changeMeasuresIsMultiSelectProperty("pit");
            hideAndShowFilterOnPitTrend("pit");
        }
        //To display stattest in dashboard
        if (controllername == "dashboardp2pdashboard" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth") {
            $(".table-statlayer").show();
            callSubmitBtn();//to call Submit button in p2pdashboard from js
        }
        else
            defaultTimePeriod();
        emptyTableoutputWithSelectedColumns();
        isSubmitClicked = false;
        if (controllername == 'chartestablishmentdeepdive' || controllername == "chartestablishmentcompare" || controllername == "chartbeveragecompare" || controllername == 'chartbeveragedeepdive')
            $('.advance-filters').hide();
        //make default stat test
        if (controllername == 'chartestablishmentdeepdive' || controllername == 'chartestablishmentcompare' || controllername == "tableestablishmentcompare" || controllername == "tableestablishmentdeepdive") {
            leftpanelchanged = true; previsSelectedStatTest = "table-ttldine";
            $(".table-stat").removeClass("activestat");
            $("#table-ttldine").addClass("activestat");
        }
        if (controllername == "chartbeveragedeepdive" || controllername == "chartbeveragecompare" || controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive") {
            leftpanelchanged = true;
            previsSelectedStatTest = "table-prevsperiod";
            $(".table-stat").removeClass("activestat");
            $("#table-prevsperiod").addClass("activestat");
        }
    });

    $(".lft-ctrl3-header span").unbind().click(function () {
        $(".master-lft-ctrl").parent().css("background", "none")
        $(this).parent().parent().hide();
    });

    $(".master-content-area,#master-btn").click(function (evt) {
        var allClasses = $(evt.target).attr("class");
        allClasses = allClasses == undefined ? [] : allClasses;
        if (allClasses != undefined && allClasses.length > 0) {
            if (allClasses.includes("filter-info-panel-elements") || allClasses.includes("sel_text") || allClasses.includes("pipe") || allClasses.includes("filter-info-panel-txt-del")) { return; }
        }
        if ($(evt.target).parents('.master-lft-ctrl').length != 0) {
            return;
        }
        //if ($(evt.target).hasClass("lft-ctrl-next") || $(evt.target).hasClass("lft-popup-ele-next") || $(evt.target).hasClass("search-list") || $(evt.target).hasClass("lft-popup-ele-label") || $(evt.target).hasClass("lft-popup-col")) { return; }
        $(".master-lft-ctrl").parent().css("background", "none")
        $(this).parent().parent().parent().css("border", "none");
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        //Remove nicescroll if it is there
        if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().length != 0) {
            $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().remove();
        }
        //
        reset_img_pos();
        $('.fltr-txt-hldr').css("color", "#000");
        //
        //if ($(evt.target).parent().text() == "CUSTOM BASE")
        //    $('.transparentBG').show();
        //else
        //    $('.transparentBG').hide();

        $('.dashboard-custom-base').hide();
    });

    $(".lft-popup-tp").click(function () {
        isSampleSizeValidated = 0; isCrossDinerSubmitClicked = false;
        var time = JSON.parse($(this).attr('data-val'));
        var label = [];
        $.each(time, function (i, v) {
            label.push(v.Text);
        });
        var pele = $(this).parent().parent().parent().parent().find(".lft-ctrl-txt");
        var ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[time.length - 1].Text + "</span></div>");

        if ($(this).hasClass("lft-popup-tp-active"))
            ;//do nothing
        else {
            if (controllername == "dashboardp2pdashboard") {
                $(".lft-popup-tp").removeClass("lft-popup-tp-active");
                $(this).addClass("lft-popup-tp-active");
            }
            else {
                $(".lft-popup-tp").removeClass("lft-popup-tp-active");
                $(this).addClass("lft-popup-tp-active");
                $("#slider-range").show();
            }
        }

        var pitortrendorskeworage;
        //Time period for 
        if (controllername == "dashboardp2pdashboard") {
            pitortrendorskeworage = "skeworage";
        }
        else
            pitortrendorskeworage = $('.lft-popup-tp-smnu-active').attr('data-val');

        switch (pitortrendorskeworage) {
            case "pit":
            case "skeworage":
                $(pele).html(ele).attr('data-ids', JSON.stringify(time[time.length - 1]));
                $("#slider-range-text").html($(pele).html());

                $("#slider-range").slider({
                    value: time.length - 1,
                    values: null,
                    range: false,
                    min: 0,
                    max: time.length - 1,
                    step: 1,

                    slide: function (event, ui) {
                        isSampleSizeValidated = 0;
                        ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[ui.value].Text + "</span></div>");
                        $(pele).html(ele).attr('data-ids', JSON.stringify(time[ui.value]));
                        $("#slider-range-text").html($(pele).html());
                    },
                    change: function (event, ui) {
                        isSampleSizeValidated = 0;
                        ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[ui.value].Text + "</span></div>");
                        $(pele).html(ele).attr('data-ids', JSON.stringify(time[ui.value]));
                        $("#slider-range-text").html($(pele).html());
                        if ($(".filter-info-panel").is(":visible")) {
                            var ctrl2 = $(pele).parent();
                            var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                            if ($("." + topdivele).length == 0) {
                                $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
                            }
                            else {
                                $("." + topdivele).html("<span> &nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + " : 
                                $("." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + time[ui.value] + "'><span style='float:left;'> " + $("#slider-range-text").html() + " </span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                            }
                        }
                    }
                });

                // Then you can give it pips and labels!  
                $("#slider-range").slider('pips', {
                    first: label[0],
                    last: label[label.length - 1],
                    rest: 'pip',
                    labels: label,
                    prefix: "",
                    suffix: ""
                });

                // And finally can add floaty numbers (if desired)  
                $("#slider-range").slider('float', {
                    first: label[0],
                    last: label[label.length - 1],
                    handle: true,
                    pips: true,
                    labels: label,
                    prefix: "",
                    suffix: ""
                });

                //    .slider("pips", {
                //    rest: true,
                //    labels: label
                //}).slider('float', {
                //    labels: true
                //});   

                setTimeout(function () {
                    //$(pele).html(ele).attr('data-ids', JSON.stringify(time[time.length - 1]));
                    //$("#slider-range-text").html($(pele).html());
                    //modified by Nagaraju D for default timeperiod
                    //Date: 12-9-2017
                    $(pele).html("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + $(".ui-slider-tip").html() + "</span></div>").attr('data-ids', JSON.stringify(time[time.length - 1]));
                    $("#slider-range-text").html($(pele).html());
                    var ctrl2 = $(pele).parent();
                    var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                    $("." + topdivele).html("<span> &nbsp </span>");
                    $("." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + time[time.length - 1] + "'><span style='float:left;'> " + $(pele).html() + " </span></div>"));
                }, 5);
                break;

            case "trend":
            default:
                var prepareTp = function (rangea, rangeb) {
                    var tpd = [];
                    trendTpList = [];//Trend Selected Timeperiod List 
                    for (var xi = rangea; xi <= rangeb; xi++) {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }
                    ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[rangea].Text + " to " + time[rangeb].Text + "</span></div>");
                    $(pele).html(ele).attr('data-ids', tpd.join("|"));
                    $("#slider-range-text").html($(pele).html());
                }
                prepareTp(time.length - 4 > 0 ? time.length - 4 : 0, time.length - 1);
                emptyTableoutputWithSelectedColumns();
                $("#slider-range").slider({
                    values: [time.length - 4 > 0 ? time.length - 4 : 0, time.length - 1],
                    min: 0,
                    max: time.length - 1,
                    minRangeSize: 1,
                    range: true,
                    slide: function (event, ui) {
                        //$("#slider-range").slider("values").length == 2 && ($("#slider-range").slider("values")[1] - $("#slider-range").slider("values")[0]
                        //
                        //if (ui.values[1] - ui.values[0] == 0) { return; }

                        isSampleSizeValidated = 0;
                        prepareTp(ui.values[0], ui.values[1]);
                        emptyTableoutputWithSelectedColumns();
                    },
                    change: function (event, ui) {
                        //
                        isSampleSizeValidated = 0;
                        if ($(".lft-popup-tp-smnu[data-val='pit']").hasClass("lft-popup-tp-smnu-active")) {
                            ui.values = undefined;
                        }
                        if (ui.values != undefined || ui.values != null) {
                            //prepareTp(ui.values[0], ui.values[1]);
                            if ($(".filter-info-panel").is(":visible")) {
                                var ctrl2 = $(pele).parent();
                                var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                                if ($("." + topdivele).length == 0) {
                                    $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
                                }
                                else {
                                    $("." + topdivele).html("<span> &nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + " : 
                                    $("." + topdivele).append($("<div class='filter-info-panel-lbl'><span style='float:left;'>" + $("#slider-range-text").html() + "</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                                }
                            }
                        }
                    }
                });
                // Then you can give it pips and labels!
                $("#slider-range").slider('pips', {
                    first: 'label',
                    last: 'label',
                    rest: 'pip',
                    labels: label,
                    prefix: "",
                    suffix: ""
                });

                // And finally can add floaty numbers (if desired)  
                $("#slider-range").slider('float', {
                    handle: true,
                    pips: true,
                    labels: label,
                    prefix: "",
                    suffix: ""
                });

                break;
        }

        //To Hide Slider When Total Selected in Time Period
        if ($('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim() == "TOTAL") {
            $("#slider-range").hide();
            $("#slider-range-text").hide();
            $('.Time_Period_topdiv_element').find('.filter-info-panel-lbl').html("<span style='float:left;'>TOTAL</span>");
        }
        else {
            $("#slider-range").show();
            $("#slider-range-text").show();
        }
        //
        clearSelectedCustomRegions();
        /*Hide All Labels except 1st and Last start*/
        $(".ui-slider-label").css("visibility", "hidden");
        $(".ui-slider-label").first().css("visibility", "visible");
        $(".ui-slider-label").last().css("visibility", "visible");
        /*Hide All Labels except 1st and Last end*/
    });

    $('.lft-popup-tp-smnu').click(function () {
        if ($(this).hasClass('lft-popup-tp-smnu-active')) {
            //do nothing
        }
        else {
            $(".lft-popup-tp-smnu").removeClass('lft-popup-tp-smnu-active');
            $(this).addClass('lft-popup-tp-smnu-active');
            $(".lft-popup-tp").first().click();
        }
    });

    $("#clearLeftPanel").click(function () {
        $(".lft-ctrl-txt").attr('data-ids', '').html('');
        $(".lft-popup-ele_active").each(function (i, e) {
            $(e).removeClass('lft-popup-ele_active');
        });
        //$(".filter-info-panel").html('');//filter-info-panel-elements
        $(".filter-info-panel-elements").remove();//filter-info-panel-elements
        $(".lft-popup-tp").first().click();
    });
    $(".home-logo").click(function () {
        //modified by Nagaraju for redirecting KI Login page
        //Date: 19-07-2017
        //window.location.href = kihomeURL + "/Home.aspx";
        window.location.href = appRouteUrl + "Logon/Home"
    });
    $(".settings-logo").click(function () {
        //$("#settings-container").show();
        sessionStorage.clear();
        //modified by Nagaraju for redirecting KI Login page
        //Date: 19-07-2017
        //window.location.href = kiLoginURL;
        window.location.href = appRouteUrl + "Logon/Logout"
    });

    //Logout Click
    $('#logout-logo').click(function () {
        sessionStorage.clear();
        window.location.href = kiLoginURL;
    });
    settingEvents();

    //custom base click 
    $('#table-custombse').click(function () {
        $(".transparentBG").show();
        $('.stat-popup').show();
        previsSelectedStatTest = $('.table-statlayer').find('.activestat').attr("id");
        $(".table-stat").removeClass("activestat");
        $(this).addClass("activestat");
        var pathname = window.location.pathname.toLocaleLowerCase();
        var fileNameIndex = pathname.lastIndexOf("/") + 1;
        var filename = pathname.substr(fileNameIndex);
        $('.stat-cust-estabmt').removeClass('stat-cust-active');
        $(".stat-content").html('');
        var custmHtml = "";
        var selectedEstbmtlist = $(".Establishment_topdiv_element > div");
        $.each(selectedEstbmtlist, function (i, v) {
            custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
            //custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt">' + v.Text.replace(/^,/, '') + '</div></div>';
        });
        $(".stat-content").append(custmHtml);
        if (filename == "establishmentdeepdive" || filename == "beveragedeepdive") {
            if ($('.pit').hasClass('active')) {
                //if (!isCustomBaseSelect) {
                $('.stat-cust-estabmt').removeClass('stat-cust-active');
                $(".stat-content").html('');
                var custmHtml = "";
                var selectedEstbmtlist = $(".Metric_Comparisons_topdiv_element > div");
                $.each(selectedEstbmtlist, function (i, v) {
                    custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt popup1" data-val="' + $(v).find(".sel_text").text().replace(/^,/, '') + '"  data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                    $(".stat-content").append(custmHtml);
                });
                //}
                if (isCustomBaseSelect) {
                    $(".stat-cust-estabmt[data-val='" + customBaseSelctdText + "']").click();
                }
                //customBaseSelctdText
            }
            //else if ($('.trend').hasClass('active')) {
            //    if (!isCustomBaseSelect) {
            //        $('.stat-cust-estabmt').removeClass('stat-cust-active');
            //        $(".stat-content").html('');
            //        var custmHtml = "";
            //        var selectedEstbmtlist = trendTpList;//$(".Time_Period_topdiv_element > div");
            //        $.each(selectedEstbmtlist, function (i, v) {
            //            //custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
            //            custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt">' + v.Text.replace(/^,/, '') + '</div></div>';
            //        });
            //        $(".stat-content").append(custmHtml);
            //    }

            //}
        }
        else if (filename == "beveragecompare") {
            //if (!isCustomBaseSelect) {
            $('.stat-cust-estabmt').removeClass('stat-cust-active');
            $(".stat-content").html('');
            var custmHtml = "";
            var selectedEstbmtlist = $(".Beverage_topdiv_element > div");
            $.each(selectedEstbmtlist, function (i, v) {
                custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt" data-val="' + $(v).find(".sel_text").text().replace(/^,/, '') + '"  data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                $(".stat-content").append(custmHtml);
            });
            //}
        }
        else {
            //if (!isCustomBaseSelect) {
            $('.stat-cust-estabmt').removeClass('stat-cust-active');
            $(".stat-content").html('');
            var custmHtml = "";
            var selectedEstbmtlist = $(".filter-info-panel .Establishment_topdiv_element > div");
            $.each(selectedEstbmtlist, function (i, v) {
                custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt popup1" data-val="' + $(v).find(".sel_text").text().replace(/^,/, '') + '" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                $(".stat-content").append(custmHtml);
            });
            //}
        }
        if ($('.trend').hasClass('active')) {
            //if (!isCustomBaseSelect) {
            $('.stat-cust-estabmt').removeClass('stat-cust-active');
            $(".stat-content").html('');
            var custmHtml = "";
            var selectedEstbmtlist = trendTpList;//$(".Time_Period_topdiv_element > div");
            $.each(selectedEstbmtlist, function (i, v) {
                //custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt popup1"  data-val="' + v.Text.replace(/^,/, '') + '" >' + v.Text.replace(/^,/, '') + '</div></div>';
            });
            $(".stat-content").append(custmHtml);
            //}
        }
        $('.stat-cust-estabmt').removeClass('stat-cust-active');
        $('.stat-cust-estabmt[data-val="' + customBaseSelctdText + '"]').addClass('stat-cust-active');
        $(".transparentBG").show();
    });
    //

    //close btn for custom base popup
    $('.stat-clsebtn').click(function () {
        pp_py_lock = 0;
        $(".transparentBG").hide();
        $('.stat-popup').hide();
        $("#table-custombse").removeClass('activestat');
        $("#" + previsSelectedStatTest).addClass('activestat');
    });
    //

    //significance mouse Hover
    $(".table-stat-sigfncegrenimg,.table-stat-sigfncpstve,.table-stat-sigfnceredimg,.table-stat-sigfncnegve").mouseenter(function () {
        $(".ShowStatDetails").show();
    });
    $(".table-stat-sigfncegrenimg,.table-stat-sigfncpstve,.table-stat-sigfnceredimg,.table-stat-sigfncnegve").mouseleave(function () {
        $(".ShowStatDetails").hide();
    });
    //
    //Export to PPT for charts

    defaultTimePeriod();
    $("#guest-visit-toggle").prop('checked', false);
    $('.stat-clsebtnExel').click(function () {
        $(".transparentBG").hide();
        $(".export-excel-popup").hide();
        $(".export-excel-popup-cross").hide();

    });
});

//custom base establishment selection
$(document).on("click", '.stat-cust-estabmt', function () {
    $('.stat-cust-estabmt').removeClass('stat-cust-active');
    $(this).addClass('stat-cust-active');
});
//
var prepareFilter = function () {
    //To Validate User Session
    if (checkValidationSessionObj() == false) {
        return false;
    }
    //
    /*Start validate min selections over some stubs @pkr*/
    var tempMinInfo = {};
    //Establishment
    tempMinInfo = getminmaxData("Establishment");
    if (tempMinInfo != undefined && (tempMinInfo.min > $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-ele_active").length)) { showMaxAlert(tempMinInfo.minmessage); return false; }
    //Establishment
    tempMinInfo = getminmaxData("Beverage");
    if (tempMinInfo != undefined && (tempMinInfo.min > $(".master-lft-ctrl[data-val='Beverage'] .lft-popup-ele_active").length)) { showMaxAlert(tempMinInfo.minmessage); return false; }
    //Establishment
    tempMinInfo = getminmaxData("Measures");
    if (tempMinInfo != undefined && (tempMinInfo.min > $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active").length)) { showMaxAlert(tempMinInfo.minmessage); return false; }
    //Establishment
    tempMinInfo = getminmaxData("Metric Comparisons");
    if (tempMinInfo != undefined && (tempMinInfo.min > $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active").length)) { showMaxAlert(tempMinInfo.minmessage); return false; }
    //Time Period
    tempMinInfo = getminmaxData("Time Period");
    if ($("#slider-range").slider("values").length == 2 && ($("#slider-range").slider("values")[1] - $("#slider-range").slider("values")[0] >= 25)) { showMaxAlert(tempMinInfo.minmessage); return false; }
    /*End validate min selections over some stubs @pkr*/
    var fil = [], isvalid = true;
    $(".lft-ctrl3-header span").click();
    $(".master-lft-ctrl").each(function () {
        var txt = $(this).find(".lft-ctrl-txt").attr('data-ids');
        if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
            if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select."); reset_img_pos(); $(".transparentBG").hide(); $(".loader").hide();
                isvalid = false;
                return isvalid;
            }
        }
        if (txt != null && txt != undefined && txt.length > 0) {
            var data = []; var IDs = '';
            $(String(txt).split('|')).each(function (x, d) {
                if (d != null && d != '')
                    data.push(JSON.parse(d));
                if (IDs == null || IDs == "")
                    IDs = JSON.parse(d).ID;
                else
                    IDs += "|" + JSON.parse(d).ID;
            });

            if ($(this).find(".lft-ctrl-label span").text() == "Time Period") {
                var activeId = $(".lft-popup-tp-active").text();
                var tempTp_data = ($(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text().trim()).split(" to ");
                var tp_data = [];
                tempTp_data.forEach(function (d, i) {
                    tp_data.push({ Text: d });
                });
                if (controllername != "dashboardp2pdashboard") {
                    if ($(".trend.active").length != 0) { tp_data = trendTpList; }
                }
                if (activeId.toLocaleLowerCase() == "total") {
                    tp_data = data;
                }
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: tp_data, SelectedID: activeId });
            }
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: IDs, MetricType: $(this).find(".lft-popup-ele_active").parent().attr("first-level-selection") });
        }
        else if (txt != '' && txt != null)
            fil.push({ Name: $(this).find(".lft-ctrl-label span").text() == "Establishment" ? "" : $(this).find(".lft-ctrl-label span").text(), Data: null });
        else {
            if ($(this).find(".lft-ctrl-label span").text().toLowerCase() == "frequency") {
                var data_frequency = []; var data = []
                data_frequency.push({ ID: "6", Text: "Total Visits" });
                data = data_frequency;
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: "6", MetricType: null });
            }
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text() == "Establishment" ? "" : $(this).find(".lft-ctrl-label span").text(), Data: null });
        }
    });
    $("#master-btn").attr('data-val', JSON.stringify(getTopAdvanceFilterId(fil)));
    $("#master-btn").attr('data-val', JSON.stringify(getSelectedStatTestText(fil)));//To get selected Stattest 
    $("#master-btn").attr('data-val', JSON.stringify(getSelectedRestaruntorRetailers(fil)));//Only For Cross Diner Frequencies In Correspondence 
    return isvalid;
}

var searchFunctionality = function (ele, level) {
    var label = $(ele).attr("data-val");
    var labelID = removeBlankSpace(label);
    if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive") {
    }
    var elementArray = $(".master-lft-ctrl[data-val='" + label + "']").find(".lft-popup-ele-label[data-isselectable=true]");
    var searchlevel = parseInt(level) + 1;
    var searchArray = [];
    var hideArray = [];
    var advanceIndex = [];
    //added by Nagaraju for hiding disabled measures
    //Date:22-08-2017
    disabledMeasures = [];

    data_index = parseFloat($(ele).attr("data-index"));

    if (!isNaN(data_index) && left_Menu_Data[data_index].PanelPopup == null)
        left_Menu_Data[data_index].PanelPopup = [];
    var advanceIndex = [];
    if ($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label").length > 0) {
        $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
            advanceIndex.push($(element).attr('parent-text').trim().toUpperCase());
        });
    }

    if ((labelID == "demographic_filters")) {
        if (window.location.pathname.toLocaleLowerCase().includes("deepdive")) {
            var parentText = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").first().attr("parent-text");
            var GroupselementArray = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[parent-text='" + parentText + "']")
            $.each(GroupselementArray, function (index, obj) {
                hideArray.push($(obj).text());
            });

            var measureSelection = $($(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            var groupSelection = $($(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");

            measureSelection = measureSelection == undefined ? "" : measureSelection;
            groupSelection = groupSelection == undefined ? "" : groupSelection;
            //modified by Nagaraju D for search filters
            //Date: 08-08-2017    

            //$.each(elementArray, function (index, obj) {
            //    var parText = $(obj).attr('parent-text').trim().toUpperCase();
            //    if (hideArray.indexOf($(obj).text()) == -1) {
            //        if (measureSelection.trim().toUpperCase() != parText)
            //            if (groupSelection.trim().toUpperCase() != parText)
            //                searchArray.push(angular.copy($(obj).text()));
            //    }
            //});      
            for (var i = 0; i < left_Menu_Data[data_index].PanelPopup.length; i++) {
                for (var j = 0; j < left_Menu_Data[data_index].PanelPopup[i].Data.length; j++) {
                    var obj = left_Menu_Data[data_index].PanelPopup[i].Data[j];
                    if (obj.IsSelectable != undefined && obj.IsSelectable) {
                        if (hideArray.indexOf(obj.Text) == -1 && measureSelection.trim().toUpperCase() != obj.ParentText.trim().toUpperCase()
                            && groupSelection.trim().toUpperCase() != obj.ParentText.trim().toUpperCase() && advanceIndex.indexOf(obj.ParentText) == -1)
                            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                    }
                }
            }

        } else {
            var parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").first().attr("parent-text");
            var GroupselementArray = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[parent-text='" + parentText + "']")
            $.each(GroupselementArray, function (index, obj) {
                hideArray.push($(obj).text());
            });
            //$.each(elementArray, function (index, obj) {
            //    if (hideArray.indexOf($(obj).text()) == -1) {
            //        searchArray.push(angular.copy($(obj).text()));
            //    }
            //});
            for (var i = 0; i < left_Menu_Data[data_index].PanelPopup.length; i++) {
                for (var j = 0; j < left_Menu_Data[data_index].PanelPopup[i].Data.length; j++) {
                    var obj = left_Menu_Data[data_index].PanelPopup[i].Data[j];
                    if (obj.IsSelectable != undefined && obj.IsSelectable) {
                        if (hideArray.indexOf(obj.Text) == -1)
                            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                    }
                }
            }
        }
    }
    else {
        if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
            var groupSelection = $($(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            groupSelection = groupSelection == undefined ? "" : groupSelection;

            var leftMenu_Measures_Index = 2;
            if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive")
                leftMenu_Measures_Index = 3;

            //added by Nagaraju for hiding disabled measures
            //Date:22-08-2017
            if ($(".disableMeasures").length > 0) {
                $(".disableMeasures").each(function () {
                    disabledMeasures.push($(this).children(".lft-popup-ele-label").html());
                });
            }

            var obj = {};
            final_SearchList_forMeasures = [];
            //from level 4 selection
            if (left_Menu_Data[leftMenu_Measures_Index].PanelPopup.length > 3) {
                $.each(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[3].Data, function (l4, v4) {
                    if (v4.IsSelectable) {
                        obj = {}
                        obj.Id = v4.ID;
                        var level3 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data.map(function (e) { return e.ID; }).indexOf(v4.ParentID);
                        if (level3 > -1) {
                            //if (left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].Text.trim().toUpperCase() != groupSelection.trim().toUpperCase()) {
                            if (v4.ParentText.trim().toUpperCase() != groupSelection.trim().toUpperCase()) {
                                if ($.inArray(v4.ParentOfParent, disabledMeasures) == -1) {
                                    if (advanceIndex.indexOf(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].Text.trim().toUpperCase()) == -1) {
                                        var level2 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data.map(function (e) { return e.ID; }).indexOf(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].ParentID);
                                        if (level2 > -1) {
                                            obj.Text = v4.Text; //+ "(" + left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level2].ParentText.split(" ")[0] + "s" + ")";
                                            obj.ParentText = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level2].ParentText;
                                        }
                                        final_SearchList_forMeasures.push(obj);
                                        //modified by Nagaraju D for search filters
                                        //Date: 08-08-2017        
                                        //searchArray.push(obj.Text);
                                        if (v4.IsSelectable != undefined && v4.IsSelectable && v4.SearchName != null && v4.SearchName != '') {
                                            searchArray.push({ label: v4.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[leftMenu_Measures_Index].PanelPopup[3].Level, parentid: v4.ParentID, id: v4.ID }] });
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            //from level 3 selection
            $.each(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data, function (l3, v3) {
                if (v3.IsSelectable) {
                    obj = {}
                    obj.Id = v3.ID;
                    var level3 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data.map(function (e) { return e.ID; }).indexOf(v3.ParentID);
                    if (level3 > -1) {
                        if (v3.ParentText.trim().toUpperCase() != groupSelection.trim().toUpperCase()) {
                            if ($.inArray(v3.ParentOfParent, disabledMeasures) == -1) {
                                obj.Text = v3.Text;//+ "(" + left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level3].ParentText.split(" ")[0] + "s" + ")";
                                obj.ParentText = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level3].ParentText;

                                final_SearchList_forMeasures.push(obj);
                                //modified by Nagaraju D for search filters
                                //Date: 08-08-2017        
                                //searchArray.push(obj.Text);
                                if (v3.IsSelectable != undefined && v3.IsSelectable && v3.SearchName != null && v3.SearchName != '' && advanceIndex.indexOf(v3.ParentText.toUpperCase()) == -1) {
                                    searchArray.push({ label: v3.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Level, parentid: v3.ParentID, id: v3.ID }] });
                                }
                            }
                        }
                    }
                }
            });
        }
        else if (label == "Metric Comparisons" && ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART" || (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "ANALYSES")) {
            var measureSelection = $($(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            measureSelection = measureSelection == undefined ? "" : measureSelection;


            if ($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label").length > 1) {
                $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                    advanceIndex.push($(element).attr('parent-text').trim().toUpperCase());
                });
            }

            //modified by Nagaraju D for search filters
            //Date: 08-08-2017          
            if (label == "Metric Comparisons") {
                for (var i = 0; i < left_Menu_Data[data_index].PanelPopup.length; i++) {
                    for (var j = 0; j < left_Menu_Data[data_index].PanelPopup[i].Data.length; j++) {
                        var obj = left_Menu_Data[data_index].PanelPopup[i].Data[j];
                        if (obj.IsSelectable != undefined && obj.IsSelectable && obj.SearchName != null && obj.SearchName != ''
                            && advanceIndex.indexOf(obj.ParentText.toUpperCase()) == -1 && measureSelection != obj.ParentText) {
                            searchArray.push({ label: obj.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                    }
                }
            }
            else {
                $.each(elementArray, function (index, obj) {
                    var parText = $(obj).attr('parent-text').trim().toUpperCase();
                    if (measureSelection.trim().toUpperCase() != parText) {
                        if (advanceIndex.indexOf(parText) == -1)
                            searchArray.push(angular.copy($(obj).text()));
                    }
                });
            }
        }
        else {
            //modified by Nagaraju D for search filters
            //Date: 08-08-2017          
            if (label == "Metric Comparisons" || label == "Measures") {
                if ($(".disableMeasures").length > 0) {
                    $(".disableMeasures").each(function () {
                        disabledMeasures.push($(this).children(".lft-popup-ele-label").html());
                    });
                }
                for (var i = 0; i < left_Menu_Data[data_index].PanelPopup.length; i++) {
                    for (var j = 0; j < left_Menu_Data[data_index].PanelPopup[i].Data.length; j++) {
                        var obj = left_Menu_Data[data_index].PanelPopup[i].Data[j];
                        if (obj.IsSelectable != undefined && obj.IsSelectable && obj.SearchName != null && obj.SearchName != '' && advanceIndex.indexOf(obj.ParentText.toUpperCase()) == -1) {
                            searchArray.push({ label: obj.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                    }
                }
            }
            else if (isNaN(data_index)) {
                $.each(elementArray, function (index, obj) {
                    searchArray.push(angular.copy($(obj).text()));
                });
            }
            else {
                for (var i = 0; i < left_Menu_Data[data_index].PanelPopup.length; i++) {
                    for (var j = 0; j < left_Menu_Data[data_index].PanelPopup[i].Data.length; j++) {
                        var obj = left_Menu_Data[data_index].PanelPopup[i].Data[j];
                        if (obj.IsSelectable != undefined && obj.IsSelectable) {
                            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                    }
                }
            }
        }
        //$.each(elementArray, function (index, obj) {

        //    if(label == "Metric Comparisons")
        //        searchArray.push(angular.copy($(obj).attr('data-parent-search-name')));
        //    else
        //        searchArray.push(angular.copy($(obj).text()));
        //});
    }

    $(".lft-popup-col" + searchlevel + " #search-list-" + labelID).autocomplete({
        source: jQuery.unique(searchArray),
        focus: function (event, ui) {
            if (isNaN(data_index))
                this.value = ui.item.value.trim();
            else
                this.value = ui.item.label.trim();

            event.preventDefault();
        },
        select: function (event, ui) {
            //var selectedValue = ui.item.value.trim();
            //added by Nagaraju D for search filters
            //Date: 08-08-2017 

            var selectedValue = ui.item.label.trim();
            if (isNaN(data_index))
                selectedValue = ui.item.value.trim();
            else
                addSearchItem(ui.item.value);

            var item_Index = -1;
            if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
                item_Index = final_SearchList_forMeasures.map(function (e) {
                    return e.Id;
                }).indexOf(ui.item.value[0].id);
                if (item_Index > -1) {
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                }
            }
            else {
                if (label == "Metric Comparisons")
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').first();
            }
            //clearOTherMeasureSelection(this)  
            if ($(lbserachparent).parentsUntil(".master-lft-ctrl").parent().attr("data-val") == "Measures") {
                var cur_path = window.location.pathname.toLocaleLowerCase();
                var lbsearchparent_firstLevel;
                if (cur_path.includes("analyses")) {
                    lbsearchparent_firstLevel = $(".lft-popup-col2").find(".lft-popup-ele-label[data-val='" + $(lbserachparent).attr("parent-text") + "']").first().attr('parent-text');
                } else {
                    if (item_Index > -1) {
                        lbsearchparent_firstLevel = final_SearchList_forMeasures[item_Index].ParentText;
                    }
                    else
                        lbsearchparent_firstLevel = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col2").find(".lft-popup-ele-label[data-val='" + $(".lft-popup-col3").find(".lft-popup-ele-label[data-val='" + $(lbserachparent).attr("parent-text") + "']").first().attr('parent-text') + "']").first().attr('parent-text');
                }
                //  if(default_first_level_selection == ""){$(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col").attr("first-level-selection", lbsearchparent_firstLevel);}
                //  if (default_first_level_selection != lbsearchparent_firstLevel) {
                //      default_first_level_selection = lbsearchparent_firstLevel;
                if (lbsearchparent_firstLevel == "Guest Measures") {
                    var this_ele = $(".lft-popup-ele-label[data-val='Guest Measures']").parent().find(".lft-popup-ele-next");
                    clearOTherMeasureSelection(this_ele);
                }
                if (lbsearchparent_firstLevel == "Visit Measures") {
                    var this_ele = $(".lft-popup-ele-label[data-val='Visit Measures']").parent().find(".lft-popup-ele-next");
                    clearOTherMeasureSelection(this_ele);
                }
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col").attr("first-level-selection", lbsearchparent_firstLevel);
                // }
            }
            //
            isAdditionalFilterLoaded = true;

            //added by Nagaraju D for duplicate items
            //Date: 22-08-2017           
            var _lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]');
            $(_lbserachparent).each(function () {
                if ($(this).parent().hasClass('lft-popup-ele_active')) {
                    lbserachparent = $(this);
                    return false;
                }
            });
            var isFrequency = label;
            if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
                if (isFrequency == "FREQUENCY") {
                    var seleteditem = $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
                    if (seleteditem == $(lbserachparent).text().trim()) {
                        $(this).val('');
                        event.preventDefault();
                        return;
                    }
                }
            }
            $(lbserachparent).click();
            $("#search-list-" + labelID).val($(lbserachparent).html());
            if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
                var value = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + final_SearchList_forMeasures[item_Index].Id + '"]').parent().parent().parent().find(".lft-popup-col");
                var count = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + final_SearchList_forMeasures[item_Index].Id + '"]').parent().parent().attr('data-level');
                $.each(value, function (i) {
                    i = i + 1;
                    if (i <= count) {
                        $(value).parent().find(".lft-popup-col" + i)
                    }
                });
            }
            else {
                var value = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').parent().parent().parent().find(".lft-popup-col");
                var count = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').parent().parent().attr('data-level');
                $.each(value, function (i) {
                    i = i + 1;
                    if (i <= count) {
                        $(value).parent().find(".lft-popup-col" + i)
                    }
                });
            }
            ClearMeasures(label);
            DisableOrEnableMeasures();
            event.stopImmediatePropagation();
            $(this).trigger("change");
            this.value = "";
            return false;
        },
        minLength: 2,
        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                $('.lft-popup-col' + searchlevel + ' #search-list-' + label).val();
                $('.master-lft-ctrl[data-val="' + label + '"]').find(".lft-popup-ele_active").children().eq(0).click();
            }
        }//,
        //select: function (event,ui) {
        //    console.log(event);
        //    console.log(ui);
        //    alert("You selected");
        //}
    });
}

var searchFunctionalityForDashBoard = function (ele, level) {
    var label = $(ele).attr("data-val");
    var labelID = removeBlankSpace(label);
    if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive") {
    }
    var elementArray = $(".master-lft-ctrl[data-val='" + label + "']").find(".lft-popup-ele-label[data-isselectable=true]");
    var searchlevel = parseInt(level) + 1;
    var searchArray = [];
    var hideArray = [];
    var advanceIndex = [];

    if ((labelID == "demographic_filters")) {
        if (window.location.pathname.toLocaleLowerCase().includes("deepdive")) {
            var parentText = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").first().attr("parent-text");
            var GroupselementArray = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[parent-text='" + parentText + "']")
            $.each(GroupselementArray, function (index, obj) {
                hideArray.push($(obj).text());
            });

            var measureSelection = $($(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            var groupSelection = $($(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");

            measureSelection = measureSelection == undefined ? "" : measureSelection;
            groupSelection = groupSelection == undefined ? "" : groupSelection;

            $.each(elementArray, function (index, obj) {
                var parText = $(obj).attr('parent-text').trim().toUpperCase();
                if (hideArray.indexOf($(obj).text()) == -1) {
                    if (measureSelection.trim().toUpperCase() != parText)
                        if (groupSelection.trim().toUpperCase() != parText)
                            searchArray.push(angular.copy($(obj).text()));
                }
            });
        } else {
            var parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").first().attr("parent-text");
            var GroupselementArray = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[parent-text='" + parentText + "']")
            $.each(GroupselementArray, function (index, obj) {
                hideArray.push($(obj).text());
            });
            $.each(elementArray, function (index, obj) {
                if (hideArray.indexOf($(obj).text()) == -1) {
                    searchArray.push(angular.copy($(obj).text()));
                }
            });
        }
    }
    else {
        if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
            var groupSelection = $($(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            groupSelection = groupSelection == undefined ? "" : groupSelection;

            var advanceIndex = [];
            if ($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label").length > 1) {
                $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                    advanceIndex.push($(element).attr('parent-text').trim().toUpperCase());
                });
            }

            var leftMenu_Measures_Index = 2;
            if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive")
                leftMenu_Measures_Index = 3;

            var obj = {};
            final_SearchList_forMeasures = [];
            //from level 4 selection
            if (left_Menu_Data[leftMenu_Measures_Index].PanelPopup.length > 3) {
                $.each(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[3].Data, function (l4, v4) {
                    if (v4.IsSelectable) {
                        obj = {}
                        obj.Id = v4.ID;
                        var level3 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data.map(function (e) { return e.ID; }).indexOf(v4.ParentID);
                        if (level3 > -1) {
                            if (left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].Text.trim().toUpperCase() != groupSelection.trim().toUpperCase()) {
                                if (advanceIndex.indexOf(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].Text.trim().toUpperCase()) == -1) {
                                    var level2 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data.map(function (e) { return e.ID; }).indexOf(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data[level3].ParentID);
                                    if (level2 > -1) {
                                        obj.Text = v4.Text + "(" + left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level2].ParentText.split(" ")[0] + "s" + ")";
                                        obj.ParentText = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level2].ParentText;
                                    }
                                    final_SearchList_forMeasures.push(obj);
                                    searchArray.push(obj.Text);
                                }
                            }
                        }
                    }
                });
            }
            //from level 3 selection
            $.each(left_Menu_Data[leftMenu_Measures_Index].PanelPopup[2].Data, function (l3, v3) {
                if (v3.IsSelectable) {
                    obj = {}
                    obj.Id = v3.ID;
                    var level3 = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data.map(function (e) { return e.ID; }).indexOf(v3.ParentID);
                    if (level3 > -1) {
                        obj.Text = v3.Text + "(" + left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level3].ParentText.split(" ")[0] + "s" + ")";
                        obj.ParentText = left_Menu_Data[leftMenu_Measures_Index].PanelPopup[1].Data[level3].ParentText;
                    }
                    final_SearchList_forMeasures.push(obj);
                    searchArray.push(obj.Text);
                }
            });
        }
        else if (label == "Metric Comparisons" && ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART" || (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "ANALYSES")) {
            var measureSelection = $($(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label")[0]).attr("parent-text");
            measureSelection = measureSelection == undefined ? "" : measureSelection;


            if ($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label").length > 1) {
                $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                    advanceIndex.push($(element).attr('parent-text').trim().toUpperCase());
                });
            }

            $.each(elementArray, function (index, obj) {
                var parText = $(obj).attr('parent-text').trim().toUpperCase();
                if (measureSelection.trim().toUpperCase() != parText) {
                    if (advanceIndex.indexOf(parText) == -1)
                        if (label == "Metric Comparisons")
                            searchArray.push(angular.copy($(obj).attr('data-parent-search-name')));
                        else
                            searchArray.push(angular.copy($(obj).text()));
                }
            });
        }
        else
            $.each(elementArray, function (index, obj) {

                if (label == "Metric Comparisons")
                    searchArray.push(angular.copy($(obj).attr('data-parent-search-name')));
                else
                    searchArray.push(angular.copy($(obj).text()));
            });
    }
    $(".lft-popup-col" + searchlevel + " #search-list-" + labelID).autocomplete({
        source: jQuery.unique(searchArray),
        select: function (event, ui) {
            var selectedValue = ui.item.value.trim();
            var item_Index = -1;
            if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
                item_Index = final_SearchList_forMeasures.map(function (e) { return e.Text.toUpperCase(); }).indexOf(ui.item.value.toUpperCase());
                if (item_Index > -1) {
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                }
            }
            else {
                if (label == "Metric Comparisons" || label == "Measures")
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').first();
            }
            //clearOTherMeasureSelection(this)  
            if ($(lbserachparent).parentsUntil(".master-lft-ctrl").parent().attr("data-val") == "Measures") {
                var cur_path = window.location.pathname.toLocaleLowerCase();
                var lbsearchparent_firstLevel;
                if (cur_path.includes("analyses")) {
                    lbsearchparent_firstLevel = $(".lft-popup-col2").find(".lft-popup-ele-label[data-val='" + $(lbserachparent).attr("parent-text") + "']").first().attr('parent-text');
                } else {
                    if (item_Index > -1) {
                        lbsearchparent_firstLevel = final_SearchList_forMeasures[item_Index].ParentText;
                    }
                    else
                        lbsearchparent_firstLevel = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col2").find(".lft-popup-ele-label[data-val='" + $(".lft-popup-col3").find(".lft-popup-ele-label[data-val='" + $(lbserachparent).attr("parent-text") + "']").first().attr('parent-text') + "']").first().attr('parent-text');
                }
                //  if(default_first_level_selection == ""){$(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col").attr("first-level-selection", lbsearchparent_firstLevel);}
                //  if (default_first_level_selection != lbsearchparent_firstLevel) {
                //      default_first_level_selection = lbsearchparent_firstLevel;
                if (lbsearchparent_firstLevel == "Guest Measures") {
                    var this_ele = $(".lft-popup-ele-label[data-val='Guest Measures']").parent().find(".lft-popup-ele-next");
                    clearOTherMeasureSelection(this_ele);
                }
                if (lbsearchparent_firstLevel == "Visit Measures") {
                    var this_ele = $(".lft-popup-ele-label[data-val='Visit Measures']").parent().find(".lft-popup-ele-next");
                    clearOTherMeasureSelection(this_ele);
                }
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-col").attr("first-level-selection", lbsearchparent_firstLevel);
                // }
            }
            //
            isAdditionalFilterLoaded = true;
            $(lbserachparent).click();
            $("#search-list-" + labelID).val($(lbserachparent).html());
            if (label == "Measures" && (window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
                var value = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + final_SearchList_forMeasures[item_Index].Id + '"]').parent().parent().parent().find(".lft-popup-col");
                var count = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + final_SearchList_forMeasures[item_Index].Id + '"]').parent().parent().attr('data-level');
                $.each(value, function (i) {
                    i = i + 1;
                    if (i <= count) {
                        $(value).parent().find(".lft-popup-col" + i)
                    }
                });
            }
            else {
                var value = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').parent().parent().parent().find(".lft-popup-col");
                var count = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]').parent().parent().attr('data-level');
                $.each(value, function (i) {
                    i = i + 1;
                    if (i <= count) {
                        $(value).parent().find(".lft-popup-col" + i)
                    }
                });
            }
            $(this).trigger("change");
            this.value = "";
            return false;
        },
        minLength: 2,
        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                $('.lft-popup-col' + searchlevel + ' #search-list-' + label).val();
                $('.master-lft-ctrl[data-val="' + label + '"]').find(".lft-popup-ele_active").children().eq(0).click();
            }
        }//,
        //select: function (event,ui) {
        //    console.log(event);
        //    console.log(ui);
        //    alert("You selected");
        //}
    });
}
var replotContentArea = function () {
    //override the content area in each module to redesign on change of widgth
}

var ajaxError = function (xhr, responseText, rsp) {
    $(".loader").hide();
    $(".transparentBG").hide();
    $(".chart-toplayer").hide();
    $(".advance-filters").hide();
    $(".table-statlayer").hide();
    console.log(xhr);
    alert('Some error occured!');
}

var fillFilterPanel = function (data) {
    var Isselected = false;
    var rangea = null, rangeb = null;
    var tp = $(".lft-popup-tp");
    //for each left panel 
    $.each(data.ctrl, function (index, obj) {
        var pele = $('.master-lft-ctrl[data-val="' + obj.ctrlText + '"]').first();
        //timeperiod
        if (obj.type != null && obj.type != undefined) {
            $(".lft-popup-tp-smnu[data-val='" + obj.type + "']").click();
            //if data is null selecting default
            if (obj.data[0].Text == null || obj.data[0].Text == undefined) {
                $(".lft-popup-tp").first().click();
            }
            else {
                //if data is not null
                //for each 3mmt, 12mmt, quarterly etc..
                $.each(tp, function (x, object) {
                    var time = JSON.parse($(object).attr('data-val'));
                    var pele = $(object).parent().parent().parent().parent().find(".lft-ctrl-txt");
                    jQuery.map(JSON.parse($(object).attr("data-val")), function (item, i) {
                        //Point in time                         
                        if (item.Text === obj.data[0].Text && obj.type == 'pit' && Isselected == false) {
                            $(object).click();
                            $("#slider-range").slider('value', i);
                            Isselected = true;
                            return;
                        }

                        else if (obj.type == 'trend' && Isselected == false) {
                            $(object).click();
                            //trend
                            if (item.Text === obj.data[0].Text)
                                rangea = i;
                            else if (rangea != null && item.Text === obj.data[1].Text)
                                rangeb = i;
                            if (rangea && rangeb && Isselected == false) {
                                $("#slider-range").slider('values', 0, rangea);
                                $("#slider-range").slider('values', 1, rangeb);
                                Isselected = true;
                                return;
                            }
                        }

                        if (Isselected)
                            return;
                    });

                    if (Isselected)
                        return;
                });
            }
        }
            //others
        else {
            $.each(obj.data, function (i, item) {
                var ele = $(pele).find(".lft-ctrl3 .lft-popup-col").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + item.Text + '"]');
                $(ele).click();
            });
        }
    });
}

var showHideFilterPanel = function () {
    var leftpanelwidth = 20, contentarea = 79.5;

    if (parseInt(($(".master-leftpanel").width() / ($(".master-leftpanel").parent().width())) * 100) < (leftpanelwidth - 1)) {
        $(".master-leftpanel").width(leftpanelwidth + "%");
        $(".master-content-area").width(contentarea + "%");
        $(".lft-ctrl2").show();
        $(".lft-ctrl3").hide();
        $(this).parent().find(".lft-ctrl3").show();
        $(this).parent().find(".lft-popup-col1").show();
        if ($(".headcol") != null)
            $(".headcol").css({
                "left": "21%"
            });

        //    alert($(this).parent().attr('data-isdynamicfilter'));
    }
    else {
        $(".master-leftpanel").width("5%");
        $(".master-content-area").width("96.5%");
        $(".lft-ctrl2").hide();
        $(".lft-ctrl3").hide();
        if ($(".headcol") != null)
            $(".headcol").css({
                "left": "10%"
            });
    }
    replotContentArea();
}

function GetMouseHoverPopUpDetails() {
    var MousehoverDetails = [
{ Name: "PPT export button", cls: "ppt-logo-msehover", size: "smalllight", Text: "Export to PowerPoint" },
{ Name: "Excel export button", cls: "exl-logo-msehover", size: "smalllight", Text: "Export to Excel" },
{ Name: "Home button", cls: "home-logo-msehover", size: "smalllight", Text: "Navigate to other Explorer Tools" },
{ Name: "Logout button", cls: "settings-logo-msehover", size: "smalllight", Text: "Logout of Explorer" },
{ Name: "Help Button", cls: "help-logo-msehover", size: "smalllight", Text: "Contact support" },
{ Name: "PDF Export button", cls: "pdf-logo-msehover", size: "smalllight", Text: "Export to PDF" },
{ Name: "Dashboard", cls: "dashboard-msehover", size: "big", Text: "Navigate to a visual dashboard that provides an interactive overview of key metrics" },
{ Name: "Demographic", cls: "", size: "big", Text: "Navigate to a section of the visual dashboard that provides an interactive overview of demographic metrics" },
{ Name: "Brand Health", cls: "dashboard-brandhealth-msehover", size: "big", Text: "Navigate to a section of the visual dashboard that provides an interactive overview of Brand Health metrics" },
//bug id 5144
{ Name: "Path to Purchase", cls: "dashboard-demo-msehover", size: "big", Text: "Navigate to a section of the visual dashboard that provides an interactive overview of Path to Purchase metrics" },
{ Name: "Visits", cls: "dashboard-visits-msehover", size: "big", Text: "Navigate to a section of the visual dashboard that provides an interactive overview of Visits metrics" },
{ Name: "Save Selections", cls: "SaveHide-msehover", size: "medium", Text: "Select to save current selections as Default Dashboard" },
{ Name: "Toggle Button", cls: "timperiodpittrend-msehover", size: "medium", Text: "Select to view numbers based on Highest Percentage or Largest Skew" },
{ Name: "Reports", cls: "reports-msehover", size: "big", Text: "Navigate to pre-defined and saved reports" },
{ Name: "Saved Reports", cls: "storyboard_link-msehover", size: "medium", Text: "Navigate to your personal warehouse of saved reports" },
{ Name: "Standard Reports", cls: "standard_report_link-msehover", size: "medium", Text: "Generate pre-defined key metrics PowerPoint reports" },
{ Name: "Path To Purchase Report", cls: "report-link-dinereport-msehover", size: "medium", Text: "Generates a pre-defined report that provide Path to purchase information for selected establishments/channels" },
{ Name: "Diner Report", cls: "report-link-summaryreport-msehover", size: "medium", Text: "Generates a pre-defined report that provide frequency, demographics, brand health & beverage consumption details for the selected establishments/channels" },
{ Name: "Tables", cls: "tables-msehover", size: "big", Text: "Navigate to data tables of key metrics" },
{ Name: "Establishment", cls: "establishment_table-msehover", size: "big", Text: "Navigate to data tables for key metrics by establishment/channel" },
{ Name: "Beverage", cls: "beverage_table-msehover", size: "big", Text: "Navigate to data tables for key metrics by beverage" },
{ Name: "Compare Beverages", cls: "beverage-compare-table-msehover", size: "big", Text: "Create data tables that compare across brands/categories" },
{ Name: "Beverage Deep Dive", cls: "beverage-deep-dive-table-msehover", size: "big", Text: "Create data tables comparing demographics, key metrics or time periods within single brand/category" },
{ Name: "Compare Establishments", cls: "establishment-compare-table-msehover", size: "big", Text: "Create data tables that compare across establishments/channels" },
{ Name: "Establishment Deep Dive", cls: "establishment-deep-dive-table-msehover", size: "big", Text: "Create data tables comparing demographics, key metrics or time periods within single establishment/channel" },
{ Name: "Charts", cls: "charts-msehover", size: "big", Text: "Navigate to charts of key metrics" },
{ Name: "Beverage", cls: "beverage_chart-msehover", size: "big", Text: "Navigate to charts for key metrics by beverage" },
{ Name: "Establishment", cls: "establishment_chart-msehover", size: "big", Text: "Navigate to charts for key metrics by establishment/channel" },
{ Name: "Compare Beverages", cls: "beverage-compare-chart-msehover", size: "big", Text: "Create charts that compare across brands/categories" },
{ Name: "Beverage Deep Dive", cls: "beverage-deep-dive-chart-msehover", size: "big", Text: "Create charts comparing demographics, key metrics or time periods within single brand/category" },
{ Name: "Compare Establishments", cls: "establishment-compare-chart-msehover", size: "big", Text: "Create charts that compare across establishments/channels" },
{ Name: "Establishment Deep Dive", cls: "establishment-deep-dive-chart-msehover", size: "big", Text: "Create charts comparing demographics, key metrics or time periods within single establishment/channel" },
{ Name: "Add'l Capabilities", cls: "analyses-msehover", size: "big", Text: "Navigate to additional scorecards and analysis frameworks" },
{ Name: "Correspondence Maps", cls: "correspondence-msehover", size: "medium", Text: "Navigate to create Correspondence Maps for key metrics" },
{ Name: "Diner Cross Dinning Analysis", cls: "diner-crossdining-msehover", size: "medium", Text: "Navigate to create Diner Cross Dinning Analysis for key metrics" },
{ Name: "Cross Diner Frequencies", cls: "cross-diner-analyses-msehover", size: "medium", Text: "Create a table that shows an establishment/channel's Diners' frequencies to all other establishment/channels" },
{ Name: "Compare establishments", cls: "establishment-compare-analyses-msehover", size: "medium", Text: "Create a correspondence map comparing establishments/channels across key metrics" },
{ Name: "Establishment deep dive", cls: "establishment-deep-dive-analyses-msehover", size: "medium", Text: "Create a correspondence map of key metrics of single establishment/channel" },
{ Name: "PIT, Trend Toggle", cls: "timperiodpittrend-msehover", size: "medium", Text: "Select to view as point in time or trend " },
{ Name: "Metric Comparisons", cls: "Comparisons-msehover", size: "medium", Text: "Select the demographics or key metrics to compare" },
{ Name: "Time Period", cls: "Period-msehover", size: "medium", Text: "Select the time interval and end period " },
{ Name: "Advanced Filter", cls: "Filters-msehover", size: "medium", Text: "Select additional demographic or key metric filters" },
{ Name: "Establishments/Channels", cls: "Establishment-msehover", size: "medium", Text: "Select the establishments/channels to compare" },
{ Name: "Beverages - Deep Dive Module", cls: "Beverage-msehover", size: "medium", Text: "Select single establishment/channel for deep dive" },
{ Name: "Beverages - Compare Module", cls: "Beverage-msehover", size: "medium", Text: "Select the brands/categories to compare" },
{ Name: "Expand Button", cls: "arrow_popup-msehover", size: "smalldark", Text: "Click to see all selections made" },
{ Name: "Stat Testing", cls: "table-stat-text-msehover", size: "smalldark", Text: "Select different stat testing options" },
{ Name: "Previous Year", cls: "prev_year-msehover", size: "smalldark", Text: "Stat test all data against time period one year ago" },
{ Name: "Custom Base", cls: "custom_base-msehover", size: "smalldark", Text: "Stat test data against any of the selections made" },
{ Name: "Previous Period", cls: "prev_period-msehover", size: "smalldark", Text: "Stat test all data against preceding time period" },
{ Name: "DINE", cls: "tot-Dine-msehover", size: "smalldark", Text: "Stat test data against Total Dine" },
{ Name: "Category", cls: "category-msehover", size: "smalldark", Text: "Stat test data against corresponding Channel/Category" },
{ Name: "Overall Chart Type Selection Area", cls: "chart-types-msehover", size: "medium", Text: "Select to display data in different chart types" },
{ Name: "Comment Button", cls: "comment-btn-msehover", size: "medium", Text: "Select to add a comment to a chart.  The comment will appear as a headline when the chart is exported to PowerPoint." },
{ Name: "Add to Storyboard", cls: "add-to-storyboard-msehover", size: "medium", Text: "Select to add the chart to a saved report" },
{ Name: "My Reports Button", cls: "folder-img-msehover", size: "medium", Text: "Select to view your personal saved reports.  These reports are only available to you." },
{ Name: "Shared Reports Button", cls: "share-img-msehover", size: "medium", Text: "Select to view reports that you share with others.  These include both reports ‘shared by you' and those 'shared with you'." },
{ Name: "My Favorites Button", cls: "myfavorite-img-msehover", size: "medium", Text: "Select to view reports that you have classified as 'My Favorite'" },
{ Name: "View Button", cls: "view-msehover", size: "medium", Text: "Select to view the charts saved within the report.  This does not allow you to edit charts within the report." },
{ Name: "Edit Button", cls: "edit-msehover", size: "medium", Text: "Select to view and edit the charts saved within the report. " },
{ Name: "Update Button", cls: "update-msehover", size: "medium", Text: "Select to create a copy of the report with all charts updated to the most recent time period." },
{ Name: "Download button", cls: "download-msehover", size: "medium", Text: "Select to download the entire report to powerpoint" },
{ Name: "Share Button", cls: "share-msehover", size: "medium", Text: "Select to share this report with another Explorer user" },
{ Name: "Delete Button", cls: "delete-msehover", size: "medium", Text: "Select to delete this report" },
{ Name: "Refresh Button", cls: "refresh-msehover", size: "medium", Text: "Select to refresh your saved report section" },
{ Name: "Add to My Favorite button", cls: "my-favorite-msehover", size: "medium", Text: "Select to add a report to 'My Favorite' section" },
{ Name: "Save As button", cls: "save-as-msehover", size: "medium", Text: "Select to create a unique copy of a report" },
{ Name: "Remove from my favorite button", cls: "remove-favorite-msehover", size: "medium", Text: "Select to remove a report from 'My Favorite' section" },
{ Name: "Download button", cls: "custom-download-msehover", size: "medium", Text: "Select to download specific slides to powerPoint" },
{ Name: "HELP DOC BUTTON", cls: "helpdoc-download-msehover", size: "medium", Text: "Select to download custom help document" },
{ Name: "Back to report button", cls: "view-back-to-report-msehover", size: "smalldark", Text: "Select to navigate back to your saved report" },
{ Name: "Add to Slide", cls: "add_to_custom_download-msehover", size: "medium", Text: "Select to add chosen slides to the same PowerPoint chart when exported" },
{ Name: "Clear button", cls: "custom_clear-msehover", size: "medium", Text: "Select to clear all chart selections" },
{ Name: "Establishment Frequency", cls: "FREQUENCY-msehover", size: "medium", Text: "Select the establishment frequency for the chosen establishments/ channels" },
{ Name: "Download All", cls: "downloadall-msehover", size: "medium", Text: "Select to download the entire report" },
{ Name: "Download Custom", cls: "custom_download-msehover", size: "medium", Text: "Select to download specific slides" },
{ Name: "Save button", cls: "custom_save-msehover", size: "medium", Text: "Select to save all chart export formats for use in the future" },
{ Name: "Guest/visits Toggle", cls: "adv-fltr-toggle-container-msehover", size: "smalldark", Text: "Select to view Guest or Visit based demographics" },
//4315 & 4494
{ Name: "Additional Filter", cls: "advance-filters-msehover", size: "medium", Text: "Click to select additional key metric filter options" },
{ Name: "Select Comparisons", cls: "Establishment-msehover", size: "medium", Text: "Select to determine the demographics or key metrics to be compared" },
{ Name: "Select Variables", cls: "Measures-msehover", size: "medium", Text: "Select to determine the demographics or key metrics variables" },
{ Name: "Zoom Out Button", cls: "zoom-out-msehover", size: "smalldark", Text: "Zoom out" },
{ Name: "Zoom In Button", cls: "zoom-in-msehover", size: "smalldark", Text: "Zoom in" },
{ Name: "Perceptual Map Icon", cls: "scatterplot-chart-msehover", size: "medium", Text: "Select to view a Perceptual Map" },
{ Name: "Coordinate Table Icon", cls: "table-R-msehover", size: "medium", Text: "Select to view the coordinates of the Correspondence Map" },
{ Name: "Tabular Output Icon", cls: "table-analyses-msehover", size: "medium", Text: "Select to view the data in the Correspondence Map" },
{ Name: "Cross Diner Analysis", cls: "", size: "medium", Text: "Generate table that compares Cross dinning frequency  across the guests of selected establishment" },
{ Name: "Cross Diner Frequencies", cls: "", size: "medium", Text: "Generate a table that shows establishment/channel's guest frequencies to all establishments and channels " },
{ Name: "Cross Establishment Attributes Analysis", cls: "", size: "medium", Text: "Generate table that compares Establishment Attributes across the guests of selected establishment" },
{ Name: "Stat Setting", cls: "", size: "smalllight", Text: "Click to change the stat testing level across the tool" },
    ];
    return MousehoverDetails;
}

function MouseHoverPopupshowHide(obj) {
    $("#MouseHoverBigDiv").hide();
    $("#MouseHoverSmallDiv").hide();
    $("#MouseHoverSmallerDiv").hide();
    $("#MouseHoverExtraSmallDiv").hide();
    if (obj.size == "big") {
        $("#MouseHoverBigDiv").show();
        var sString = $("#MouseHoverSmallDiv .ContainerClass .HeadingText").html();
        $("#MouseHoverBigDiv .ContainerClass .HeadingText").html("");
        $("#MouseHoverBigDiv .ContainerClass .HeadingText").html(obj.Name);
        $("#MouseHoverBigDiv .ContainerClass .HeadingText").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
        $("#MouseHoverBigDiv .ContainerClass .TextContainer").text(obj.Text);
    }
    else if (obj.size == "medium") {
        if (obj.cls == "timperiodpittrend-msehover") {
            if ((controllername.indexOf("dashboard") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Toggle Button");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select to view numbers based on Highest Percentage or Largest Skew");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }
            else {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("PIT, Trend Toggle");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select to view as single point in time or trend");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");

            }
        }

        else if (obj.cls == "Establishment-msehover") {
            if ((controllername.indexOf("analysesestablishmentcompare") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Select Comparisons");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select to create a correspondence map by comparing establishments/channels across key metrics");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }

            else if ((controllername.indexOf("dashboard") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Establishment/Channel");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select single establishment/channel");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }

            else if ((controllername.indexOf("analysesestablishmentdeepdive") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Select Comparisons");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select single establishment/channel to create a correspondence map by comparing key metrics");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }
            else if ((controllername.indexOf("analysescrossDinerFrequencies") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Select Comparisons");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select single establishment/channel to create a correspondence map by comparing key metrics");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }

            else if ((controllername.indexOf("report") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Establishments/Channels");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select the establishments/channels to compare");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }

            else if ((controllername.indexOf("establishmentdeepdive") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Establishments/Channels");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select establishment/channel for deep dive");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }
            else if ((controllername.indexOf("establishmentcompare") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Establishments/Channels");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select the establishments/channels to compare");

                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            }

        }

            //else if (obj.cls == "Beverage-msehover") {
            //    if ((controllername.indexOf("beveragedeepdive") > -1)) {
            //        $("#MouseHoverSmallDiv").show();
            //        $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Beverages/Categories");
            //        $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select a beverage/category for deep dive");
            //    }
            //    else if ((controllername.indexOf("beveragecomparison") > -1)) {
            //        $("#MouseHoverSmallDiv").show();
            //        $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Beverages/Categories");
            //        $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select the brands/categories to compare");
            //    }
            //}

        else if (obj.cls == "Beverage-msehover") {
            if ((controllername.indexOf("compar") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Beverages/Categories");
                //$("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("");
                //$("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html(obj.Name.split(':')[0]);
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select the brands/categories to compare");
            }

            else if ((controllername.indexOf("deepdive") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Beverages/Categories")
                //$("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("");
                //$("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html(obj.Name.split(':')[2]);
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select beverage/category for deep dive");
            }
            else {
                $("#MouseHoverSmallDiv").show();
                var sString = $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html()
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("");
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html(obj.Name.split(':')[1]);
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text(obj.Text.split(':')[1]);
            }
        }
        else {
            $("#MouseHoverSmallDiv").show();
            var sString = $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html()
            $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("");
            $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html(obj.Name);
            $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").append("<div class=\"mouseOverImageTitleBottom\" style=\"margin-top:24px;\"></div>");
            $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text(obj.Text);
        }
    }
    else if (obj.size == "smalldark") {
        $("#MouseHoverSmallerDiv").show();
        var sString = $("#MouseHoverSmallerDiv .mousehoversmallpopuptext").html()
        $("#MouseHoverSmallerDiv .mousehoversmallpopuptext").text("");
        $("#MouseHoverSmallerDiv .mousehoversmallpopuptext").text(obj.Text);

        if ($(obj).eq(0).attr("cls") == "chart-Export") {
            $("#MouseHoverSmallerDiv").css("min-height", "95px");
            $("#MouseHoverSmallerDiv .centerdivdark").height("93%");
        }
        else {
            $("#MouseHoverSmallerDiv").css("min-height", "58px");
            $("#MouseHoverSmallerDiv .centerdivdark").height("84%");
        }





    }
    else if (obj.size == "smalllight") {
        $("#MouseHoverExtraSmallDiv").show();
        var sString = $("#MouseHoverExtraSmallDiv .mousehoversmallpopuptext").html()
        $("#MouseHoverExtraSmallDiv .mousehoversmallpopuptext").text("");
        $("#MouseHoverExtraSmallDiv .mousehoversmallpopuptext").text(obj.Text);
    }
}

var hideAndShowAdvanceFilterBasedOnMeasure = function (key, val) {
}

var hideAndShowSelectedValuesFromDemoInDeepDiveView = function (key, ctrl2) {
}

var settingEvents = function () {
    $("#settings-container").hover(function () {
        $("#settings-container").show();
    }, function () {
        $("#settings-container").hide();
    });

    //$(".settings-logo").hover(function () {
    //    $("#settings-container").show();
    //}, function () {
    //    $("#settings-container").hide();
    //});
}

var validationToSelectDataWithinSameParent = function (key) {
    var mstr = $(key).parent().parent().parent().parent().parent();
    var keyfirstLevelSelection = $(key).parent().parent().attr("first-level-selection");
    var parentText = $(key).parent().find(".lft-popup-ele-label").attr("parent-text");
    var level = $(key).parent().parent().attr("data-level");
    var DataparentId = $(key).attr('data-parent');
    var selectedele = $(mstr).find(".lft-popup-ele_active").first();
    var selfirstlevelselection = $(selectedele).parent().attr("first-level-selection");
    if (selectedele.length <= 0) {
        if (keyfirstLevelSelection == "Geography")
            checkGeographyInitial = true;
        else
            checkGeographyInitial = false;
        return true;
    }
    var pText = $(selectedele).find(".lft-popup-ele-label").attr("parent-text");
    var pLevel = $(selectedele).parent().attr("data-level");
    var pDataparentId = $(selectedele).find(".lft-popup-ele-label").attr("data-parent");
    if (pText == parentText && pLevel == level && DataparentId == pDataparentId)
        return true;
    else {

        if (selfirstlevelselection == "Geography") {
            //customRegions hide and show
            if (checkGeographyInitial == false) {
                var selectedEle = $(key).parent().parent().parent().parent().find(".lft-popup-ele_active");
                $.each(selectedEle, function (index, ele) {
                    var ctrl2 = $(key).parent().parent().parent().parent().siblings(".lft-ctrl2");
                    $(ele).removeClass("lft-popup-ele_active");
                    ele = ele.children[1];
                    removeSelectedPanelElement(true, ele, ctrl2);
                    hideEstablishmentFromTable(removeBlankSpace($(ele).text()));//To remove columns  from table output ares
                });
                checkGeographyInitial = true;
            }
            else {
                var CustomRegionsList = ["Density", "CCNA Regions", "Bottler Regions", "CCR SubRegions", "AO Non CCR Subregions", "Census Regions", "Census Divisions", "DMA", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "Albertson's/Safeway Corporate Net Trade Area", "HEB Trade Areas"];
                if (CustomRegionsList.indexOf(parentText) > -1)
                    return true;
                else
                    checkGeographyInitial = false;
            }
            //
        }

        var selectedEle = $(key).parent().parent().parent().parent().find(".lft-popup-ele_active");
        $.each(selectedEle, function (index, ele) {
            var ctrl2 = $(key).parent().parent().parent().parent().siblings(".lft-ctrl2");
            $(ele).removeClass("lft-popup-ele_active");
            ele = ele.children[1];
            removeSelectedPanelElement(true, ele, ctrl2);
            hideEstablishmentFromTable(removeBlankSpace($(ele).text()));//To remove columns  from table output ares 
        });
        return true;
    }
}

var SetScroll = function (Obj, cursor_color, top, right, left, bottom, cursorwidth, horizrailenabled) {
    if (horizrailenabled != undefined) {
        $(Obj).niceScroll({
            cursorcolor: cursor_color,
            cursorborder: cursor_color,
            cursorwidth: cursorwidth + "px",
            autohidemode: false,
            horizrailenabled: horizrailenabled,
            railpadding: {
                top: top,
                right: right,
                left: left,
                bottom: bottom
            }
        });
    }
    else {
        $(Obj).niceScroll({
            cursorcolor: cursor_color,
            cursorborder: cursor_color,
            cursorwidth: cursorwidth + "px",
            autohidemode: false,
            railpadding: {
                top: top,
                right: right,
                left: left,
                bottom: bottom
            }
        });
    }

    $(Obj).getNiceScroll().resize();
}

//var selectDeleselectAllOptionsWithinSameParent = function (key,val) {
//    var pText = $(key).attr("parent-text");
//    var pele = $(key).parent().parent();
//    var selIds = $(pele).find('.lft-popup-ele-label[parent-text="' + pText + '"]');
//    $.each(selIds, function (index, ele) {
//        var pElement = $(ele).parent();
//        if ($(pElement).hasClass("lft-popup-ele_active") == false && $(ele).attr("data-val") != val) {
//            $(ele).click();
//        }
//    });
//}

var clearOTherMeasureSelection = function (key) {
}

var resetPopupCss = function (key) {

}

var resetPopupLevelCss = function (key) {

}

var hideMeasureBaseonComparisonBanner = function () {

}

var changeMeasuresIsMultiSelectProperty = function (val) {

}

var getTopAdvanceFilterId = function (fil) {
    return fil;
}
var getSelectedStatTestText = function (fil) {
    return fil;
}

var getSelectedRestaruntorRetailers = function (fil) {
    return fil;
}

var hideAndShowFilterOnPitTrend = function (pittrend) {

}


//Comma Separate Number
var commaSeparateNumber = function (val) {
    if (val > 0) {
        var dec = val.toString().split('.');
        val = dec[0].toString().replace(',', '');
        var array = val.split('');
        var index = -3;
        while (array.length + index > 0) {
            array.splice(index, 0, ',');
            index -= 4;
        }
        if (dec.length > 1)
            return array.join('') + '.' + dec[1];
        else
            return array.join('')
    }
    else
        return val;
}
//

//To show Low Sample Size and Use directionally text depending on Sample size value
var sampleSizeStatus = function (sampleValue) {
    var status = "";
    var measureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
    //if ($("#guest-visit-toggle").prop("checked") == true || measureType == "Guest Measures") {
    if (sampleValue < 30)
        status = sampleValue == null ? "NA" : commaSeparateNumber(sampleValue) + " (LOW SAMPLE SIZE)";
    else if (sampleValue >= 30 && sampleValue <= 99)
        status = commaSeparateNumber(sampleValue) + " (USE DIRECTIONALLY)";
    else if (sampleValue == null || sampleValue == "")
        status = "NA";
    else
        status = commaSeparateNumber(sampleValue);
    //}
    return status;
}

var getFontColorBasedOnStatValue = function (statVal) {
    if (statVal == null || statVal == undefined || statVal == NaN)
        return "black";
    else if (statVal > 1.96)
        return "green";
    else if (statVal < -1.96)
        return "red";
    else
        return "black";
}
var checkNumberOfEstablishmentSelected = function (ele) {
    return true;
}

var clearOutputData = function () {

}

var removeBlankSpace = function (object) {
    if (object == "" || object == null || object == undefined)
        return "";
    object = object.trim();
    var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '').replace(/\!/g, '');
    return text.toLowerCase();
}

var clearAdvanceFilters = function () {
    var selectedIDs = $(".master-lft-ctrl[popup-type='advanceFilters']").find(".lft-popup-ele_active");
    $.each(selectedIDs, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });
    $($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele")).removeClass("freqncyunselect");

}

var clearConsumedFrequecnyFilters = function () {
    var selectedIDs = $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele_active");
    $.each(selectedIDs, function (index, ele) {
        $(ele).removeClass("lft-popup-ele_active");
        var element = $(ele).find(".lft-popup-ele-label");
        var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
        removeSelectedPanelElement(true, element, ctrl2);
    });

}

var defaultTimePeriod = function () {

    if (controllername == "dashboardp2pdashboard")
        $(".lft-popup-tp:eq(3)").first().click().click();
    else {
        if ($(".pit").hasClass("active")) {
            $(".lft-popup-tp:eq(3)").first().click().click();
        } else {
            $(".lft-popup-tp:eq(1)").click().click();
        }
    }
}

var hideAndShowConsumedFreqForBeverage = function (key, measureText)
{ }

function updateTableOutput() {

}
var appendingEstablishmentToTable = function (selectedEstablishment) {

}
var hideEstablishmentFromTable = function (deselectedEstablishment)
{ }
//
//set Dynamic width based on selections in Table 
var setWidthforTableColumns = function () {
    var pathname = window.location.pathname.toLocaleLowerCase();
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex);
    var claWidthForOne = 820;
    var claWidthForTwo = 400;
    var claWidthForThree = 265;
    var claWidthForFour = 197;
    var claWidthForFive = 155;
    var defaultWidth = 1289;
    var defaultWidthhd = 1870;
    var defaultWidtdFramWidth = 830;
    var calFrmWidth = 0;
    var hdrDefaultWidht = 441;
    var currentWidth = parseInt($(".table-bottomlayer").width());
    var defaultHeight = 470 + 25;
    if (currentWidth == defaultWidth) {
        claWidthForOne = 820;//17
        claWidthForTwo = 404;//8.38
        claWidthForThree = 265;//5.55
        claWidthForFour = 197;
        claWidthForFive = 155;
        calFrmWidth = defaultWidtdFramWidth;
        defaultHeight = 470 + 25;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".table-bottomlayer").css("height", defaultHeight - 31 + "px");
        else
            $(".table-bottomlayer").css("height", (defaultHeight + 25) + "px");
    }
    else if (currentWidth == defaultWidthhd) {
        defaultWidtdFramWidth = defaultWidtdFramWidth + 6;

        claWidthForOne = (currentWidth * claWidthForOne) / defaultWidth + 6;
        claWidthForTwo = ((currentWidth * claWidthForTwo) / defaultWidth) + 4.5 + 6;
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth + 1 + 5;
        claWidthForFour = (currentWidth * claWidthForFour) / defaultWidth + 4.5;
        claWidthForFive = (currentWidth * claWidthForFive) / defaultWidth + 0.5 + 4.5;
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".table-bottomlayer").css("height", $(".master-content-area").height() - 195 + "px");
        else
            $(".table-bottomlayer").css("height", $(".master-content-area").height() - 115 + "px");

    }
    else {
        claWidthForOne = (currentWidth * claWidthForOne) / defaultWidth
        claWidthForTwo = ((currentWidth * claWidthForTwo) / defaultWidth) + 4.5
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth + 1
        claWidthForFour = (currentWidth * claWidthForFour) / defaultWidth
        claWidthForFive = (currentWidth * claWidthForFive) / defaultWidth + 0.5;
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".table-bottomlayer").css("height", $(".master-content-area").height() - 195 + "px");
        else
            $(".table-bottomlayer").css("height", $(".master-content-area").height() - 115 + "px");

    }
    $('.scrollable-data-frame').css("width", (calFrmWidth + 1) + "px");
    $("#scrollableTable").css("width", (currentWidth) + "px");
    $('.scrollable-columns-frame').css("width", (calFrmWidth) + "px");

    $('.tbl-dta-metricsHding').css("width", (hdrDefaultWidht - 1) + "px");
    $(".scrollable-rows-table tr td:first-child").css("width", (hdrDefaultWidht) + "px");
    $(".corner-frame table.data td:first-child").css("width", (hdrDefaultWidht) + "px");

    if (filename == "beveragedeepdive" || filename == "establishmentdeepdive") {
        if ($(".trend").hasClass("active")) {
            if (trendTpList.length == 1) {
                $('.scrollable-columns-table tr th').width(claWidthForOne + "px");
                $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForOne - 1 + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
                $('.scrollable-columns-table').width((claWidthForOne + 20) + "px");
            }
            else if (trendTpList.length == 2) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForTwo + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForTwo + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
                $('.scrollable-columns-table').width(claWidthForOne + "px");
            }
            else if (trendTpList.length == 3) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForThree + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForThree + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");

                var seletdElmtsCount = trendTpList.length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForThree * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
            }
            else if (trendTpList.length == 4) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFour + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFour + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");

                var seletdElmtsCount = trendTpList.length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFour * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
            }
            else {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFive + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFive + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

                var seletdElmtsCount = trendTpList.length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
            }

        }
        else {
            if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 0)
                $(".table-bottomlayer").html("");
            if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 1) {
                $('.scrollable-columns-table tr th').width(claWidthForOne + "px");
                $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForOne + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
                $('.scrollable-columns-table').width((claWidthForOne + 20) + "px");
            }
            else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForTwo + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForTwo + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
                $('.scrollable-columns-table').width(claWidthForOne + "px");
            }
            else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 3) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForThree + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForThree + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
                var seletdElmtsCount = $('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForThree * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);

            }
            else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 4) {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFour + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFour + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
                var seletdElmtsCount = $('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFour * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
            }
            else {
                $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
                $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFive + "px");
                $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFive + "px");
                $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

                var seletdElmtsCount = $('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length;
                var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
                $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
            }
        }
    }
    else if (filename == "establishmentcompare") {
        if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 0)
            $(".table-bottomlayer").html("");
        if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 1) {

            $('.scrollable-columns-table tr th').width(claWidthForOne + "px");
            $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForOne + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
            $('.scrollable-columns-table').width((claWidthForOne + 20) + "px");

        }
        else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForTwo + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForTwo + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
            $('.scrollable-columns-table').width(claWidthForOne + "px");
        }
        else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 3) {
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForThree + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForThree + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");

            var seletdElmtsCount = 3;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForThree * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
        else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 4) {
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFour + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFour + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");

            var seletdElmtsCount = 4;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFour * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
        else {
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFive + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFive + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

            var seletdElmtsCount = $('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
    }
    else {
        if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 0)
            $(".table-bottomlayer").html("");

        if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 1) {
            $('.scrollable-columns-table tr th').width(claWidthForOne + "px");
            $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForOne + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
            $('.scrollable-columns-table').width((claWidthForOne + 20) + "px");
        }
        else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForTwo + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForTwo + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
            $('.scrollable-columns-table').width(claWidthForOne + "px");
        }
        else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 3) {

            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForThree + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForThree + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
            var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForThree * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
        else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 4) {

            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFour + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFour + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
            var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFour * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
        else {

            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForFive + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", claWidthForFive + "px");
            $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");
            var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
            var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
            $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        }
    }
}
//

//set Dynamic width based on selections in Chart Table 
var setWidthforChartTableColumns = function (analysisTableType) {
    var pathname = window.location.pathname;
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex).toLowerCase();
    var claWidthForOne = 810;
    var claWidthForTwo = 400;
    var claWidthForThree = 260;
    var claWidthForFour = 190;
    var claWidthForFive = 153;
    var defaultWidth = 1289;
    var defaultWidtdFramWidth = 650;
    var calFrmWidth = 0;
    var hdrDefaultWidht = 441;
    var currentWidth;
    var defaultHeight = 0;
    var default_Ht = 368;
    var calculated_Ht = 443;

    if (analysisTableType == "chart") {
        currentWidth = parseInt($(".chart-bottomlayer").width());
        defaultHeight = 451 + 20;
        calculated_Ht = 438;
    }
    else if (analysisTableType == "tableAnalyses" || analysisTableType == "tableR") {
        currentWidth = parseInt($(".analyses-bottomlayer").width());
        defaultHeight = 451 + 20;
    }

    if (currentWidth == defaultWidth) {
        claWidthForOne = 810;
        claWidthForTwo = 400;
        claWidthForThree = 260;
        claWidthForFour = 190;
        claWidthForFive = 153;
        calFrmWidth = defaultWidtdFramWidth;
        defaultHeight = 451 + 20;

        if (analysisTableType == "chart") {
            //$(".chart-bottomlayer").css("height", defaultHeight + "px");
            $(".scrollable-data-frame,.scrollable-rows-frame").height(default_Ht + 'px');
        }
        else if (analysisTableType == "tableR") {
            $(".analyses-bottomlayer").css("height", defaultHeight + "px");
            $(".scrollable-data-frame,.scrollable-rows-frame").height($(".analyses-bottomlayer").height() - 50 + 'px');
        }
        else {
            $(".analyses-bottomlayer").css("height", defaultHeight + "px");
            $(".scrollable-data-frame,.scrollable-rows-frame").height($(".analyses-bottomlayer").height() - 50 + 'px');
        }
    }
    else {
        claWidthForOne = (currentWidth * claWidthForOne) / defaultWidth
        claWidthForTwo = (currentWidth * claWidthForTwo) / defaultWidth
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth
        claWidthForFour = (currentWidth * claWidthForFour) / defaultWidth
        claWidthForFive = (currentWidth * claWidthForFive) / defaultWidth
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth

        if ($(".adv-fltr-selection").is(":visible")) {
            if (analysisTableType == "chart") {
                if ($('.table-chart').hasClass('active')) {
                    $(".chart-bottomlayer").css("height", "calc(93% - 180px)");
                }
                else
                    $(".chart-bottomlayer").css("height", "calc(93% - 174px)");
            }
            else if (analysisTableType == "tableR")
                $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 220 + "px");
            else
                $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 250 + "px");
        }
        else {
            if (analysisTableType == "chart") {
                if ($('.table-chart').hasClass('active')) {
                    $(".chart-bottomlayer").css("height", "calc(93% - 90px)");
                }
                else {
                    $(".chart-bottomlayer").css("height", "calc(93% - 190px)");
                }

            }
            else if (analysisTableType == "tableR")
                $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 120 + "px");
            else
                $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 140 + "px");

        }
        if (analysisTableType == "chart")
            $(".scrollable-data-frame,.scrollable-rows-frame").height((((parseInt($(".chart-bottomlayer").height()) * default_Ht) / calculated_Ht)) + 'px');
        else if (analysisTableType == "tableR")
            $(".scrollable-data-frame,.scrollable-rows-frame").height((parseInt($(".analyses-bottomlayer").height()) * default_Ht) / calculated_Ht + 'px');
        else
            $(".scrollable-data-frame,.scrollable-rows-frame").height((parseInt($(".analyses-bottomlayer").height()) * default_Ht) / calculated_Ht + 'px');
    }

    if (analysisTableType == "chart") {
        $("#scrollableTable").css("width", (currentWidth) + "px");
    }
    else if (analysisTableType == "tableAnalyses") {
        $("#scrollableTableAnalyses").css("width", (currentWidth) + "px");
    }
    else if (analysisTableType == "tableR") {
        $("#scrollableTableR").css("width", (currentWidth) + "px");
    }

    if (analysisTableType == "tableR") {
        $('.scrollable-data-frame').css("width", ((calFrmWidth + 26 + 142) - 191) + "px");
        $('.scrollable-columns-frame').css("width", ((calFrmWidth + 23 + 140) - 191) + "px");
    }
    else {
        $('.scrollable-data-frame').css("width", (calFrmWidth + 26 + 142) + "px");
        $('.scrollable-columns-frame').css("width", (calFrmWidth + 23 + 140) + "px");
    }

    if (analysisTableType == "tableR") {
        $('.tbl-dta-metricsHding').css("width", (hdrDefaultWidht + 200) + "px");
        $(".scrollable-rows-table tr td:first-child").css("width", (hdrDefaultWidht + 200) + "px");
        $(".plotTableData table.data td:first-child").css("width", (hdrDefaultWidht + 200) + "px");
    }
    else {
        $('.tbl-dta-metricsHding').css("width", (hdrDefaultWidht - 1) + "px");
        $(".scrollable-rows-table tr td:first-child").css("width", (hdrDefaultWidht) + "px");
        $(".plotTableData table.data td:first-child").css("width", (hdrDefaultWidht) + "px");
    }

    if (analysisTableType == "tableR") {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width((claWidthForTwo - 100 + 7) + "px");
        $('.scrollable-columns-table tr td').width((claWidthForTwo - 100 + 7) + "px");
        $('.scrollable-data-frame tr td').css("width", (claWidthForTwo - 100 + 7) + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", ((claWidthForTwo - 100 + 7) - 3) + "px");
        $('.scrollable-columns-table').css("width", ((claWidthForTwo - 100) - 10 + 7) + "px");
        $('.scrollable-data-table').width(((claWidthForTwo - 100) - 10 + 7) + "px");
    }
    else {
        if (filename == "beveragedeepdive" || filename == "establishmentdeepdive") {
            if ($(".trend").hasClass("active")) {
                setWidthForTrendSeletns(claWidthForOne, claWidthForTwo, claWidthForThree, claWidthForFour, claWidthForFive);
            }
            else {
                if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 1) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForOne + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForOne + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
                    $('.scrollable-columns-table').css("width", claWidthForOne + "px");
                    $('.scrollable-data-table').width(claWidthForOne + "px");
                }
                else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
                    $('.scrollable-columns-table').css("width", (claWidthForOne - 10) + "px");
                    $('.scrollable-data-table').width((claWidthForOne - 10) + "px");
                }
                else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 3) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForThree + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForThree + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 3; var seletdElmtsEstdivWidth = claWidthForThree * 3;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else if ($('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl').length == 4) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForFour + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFour + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 4; var seletdElmtsEstdivWidth = claWidthForFour * 4;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForFive + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFive + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

                    var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
                    var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
            }
        }
        else if (filename == "establishmentcompare") {
            if ($(".trend").hasClass("active")) {
                setWidthForTrendSeletns(claWidthForOne, claWidthForTwo, claWidthForThree, claWidthForFour, claWidthForFive);
            }
            else {
                if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 1) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForOne + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForOne + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
                    $('.scrollable-columns-table').css("width", claWidthForOne + "px");
                    $('.scrollable-data-table').width(claWidthForOne + "px");
                }
                else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
                    $('.scrollable-columns-table').css("width", (claWidthForOne - 10) + "px");
                    $('.scrollable-data-table').width((claWidthForOne - 10) + "px");
                }
                else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 3) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForThree + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForThree + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 3; var seletdElmtsEstdivWidth = claWidthForThree * 3;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else if ($('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl').length == 4) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
                    $(".scrollable-columns-table").width('811px');
                    $('.scrollable-columns-table tr td').width(claWidthForFour + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFour + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 4; var seletdElmtsEstdivWidth = claWidthForFour * 4;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForFive + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFive + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

                    var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
                    var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
            }
        }
        else {
            if ($(".trend").hasClass("active")) {
                setWidthForTrendSeletns(claWidthForOne, claWidthForTwo, claWidthForThree, claWidthForFour, claWidthForFive);
            }
            else {
                if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 1) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForOne + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForOne + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
                    $('.scrollable-columns-table').css("width", claWidthForOne + "px");
                    $('.scrollable-data-table').width(claWidthForOne + "px");

                }
                else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 2) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForTwo + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
                    $('.scrollable-columns-table').css("width", (claWidthForOne - 10) + "px");
                    $('.scrollable-data-table').width((claWidthForOne - 10) + "px");
                }
                else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 3) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForThree + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForThree + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 3; var seletdElmtsEstdivWidth = claWidthForThree * 3;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else if ($('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length == 4) {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForFour + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFour + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
                    var seletdElmtsEmptydivWidth = 10 * 4; var seletdElmtsEstdivWidth = claWidthForFour * 4;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
                else {
                    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
                    $('.scrollable-columns-table tr td').width(claWidthForFive + "px");
                    $('.scrollable-data-frame tr td').css("width", claWidthForFive + "px");
                    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

                    var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
                    var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
                    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                    $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
                }
            }
        }
    }
}
//

//set Dynamic width based on selections in Correspndence Analysis Table Only
var setWidthforAnalysisTableColumns = function (analysisTableType) {
    var pathname = window.location.pathname;
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex).toLowerCase();
    var claWidthForThree = 260;
    var claWidthForFour = 190;
    var claWidthForFive = 153;
    var defaultWidth = 1289;
    var defaultWidtdFramWidth = 650;
    var calFrmWidth = 0;
    var hdrDefaultWidht = 300;
    var currentWidth;
    var defaultHeight = 0;
    var default_Ht = 368;
    var calculated_Ht = 443;

    currentWidth = parseInt($(".analyses-bottomlayer").width());
    defaultHeight = 451 + 20;
    if (currentWidth == defaultWidth) {
        claWidthForThree = 260;
        calFrmWidth = defaultWidtdFramWidth;
        defaultHeight = 451 + 20;
        $(".analyses-bottomlayer").css("height", defaultHeight + "px");
        $(".scrollable-data-frame,.scrollable-rows-frame").height($(".analyses-bottomlayer").height() - 50 + 'px');

    }
    else {
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth;
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth

        if ($(".adv-fltr-selection").is(":visible"))
            $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 250 + "px");
        else
            $(".analyses-bottomlayer").css("height", $(".master-content-area").height() - 140 + "px");
        $(".scrollable-data-frame,.scrollable-rows-frame").height((parseInt($(".analyses-bottomlayer").height()) * default_Ht) / calculated_Ht + 'px');
    }

    if (analysisTableType == "tableAnalyses")
        $("#scrollableTableAnalyses").css("width", (currentWidth) + "px");

    $('.scrollable-data-frame').css("width", (calFrmWidth) + "px");
    $('.scrollable-columns-frame').css("width", (calFrmWidth) + "px");

    $('.tbl-dta-metricsHding').css("width", (hdrDefaultWidht) + "px");
    $(".scrollable-rows-table tr td").css("width", (hdrDefaultWidht) + "px");
    $(".scrollable-rows-table tr td.emptydiv").css("width", "10px");
    $(".plotTableData table.data td").css("width", (hdrDefaultWidht) + "px");

    if (filename == "establishmentdeepdive") {

        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(hdrDefaultWidht + "px");
        $('.scrollable-columns-table tr td').width(hdrDefaultWidht + "px");
        $('.scrollable-data-frame tr td').css("width", hdrDefaultWidht + "px");
        $('.scrollable-data-frame tr td.emptydiv').css("width", "10px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (hdrDefaultWidht - 3) + "px");
        var seletdElmtsEmptydivWidth = 10 * 3; var seletdElmtsEstdivWidth = hdrDefaultWidht * 3;
        $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        $('.scrollable-data-table').width(((seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth) - 7));
    }
    else if (filename == "establishmentcompare") {

        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(hdrDefaultWidht + "px");
        $('.scrollable-columns-table tr td').width(hdrDefaultWidht + "px");
        $('.scrollable-data-frame tr td').css("width", hdrDefaultWidht + "px");
        $('.scrollable-data-frame tr td.emptydiv').css("width", "10px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (hdrDefaultWidht - 3) + "px");
        var seletdElmtsEmptydivWidth = 10 * 3; var seletdElmtsEstdivWidth = hdrDefaultWidht * 3;
        $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        $('.scrollable-data-table').width(((seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth) - 7));
    }


}
//
var emptyTableoutputWithSelectedColumns = function () {
}

var searchBoxFil = function (len) {
    if (len > 34) {
        $(".lft-popup-col-selected-text").addClass("multi-line-header");
        $(".lft-popup-col").addClass("lft-pop-col-fit");
    } else {
        $(".lft-popup-col-selected-text").removeClass("multi-line-header");
        $(".lft-popup-col").removeClass("lft-pop-col-fit");
    }
}
var clearSelectedCustomRegions = function () {
    var selectedGeogrpahylst = $('.lft-popup-ele.lft-popup-ele_active');
    $.each(selectedGeogrpahylst, function (i, v) {
        if ($(v).parent().attr("first-level-selection") == "Geography") {
            var pele = $($(this).find('.lft-popup-ele-label')).parent().parent().parent().parent();
            $(this).find('.lft-popup-ele-label').parent().removeClass("lft-popup-ele_active");
            //$(this).find('.sidearrw_active').removeClass('.sidearrw_active');
            removeSelectedPanelElement(true, $(this).find('.lft-popup-ele-label'), $(pele).siblings(".lft-ctrl2"));
        }
    });
}

//Custom Regions adding tooltips,enable and disable based on time periods
var customRegions = function (parentName) {

    //Tool Tool tip based on PIT & TREND
    if ($(".trend").hasClass("active")) {
        $('.density_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.ccna_regions_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.bottler_regions_cRegion').attr("title", "Available for Year, Quarter Time Periods");
        $('.ccr_subregions_cRegion').attr("title", "Available for Year, Quarter Time Periods");
        $('.ao_non_ccr_subregions_cRegion').attr("title", "Available for Year Time Periods");
        $('.census_regions_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.census_divisions_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.dma_cRegion').attr("title", "Available for Year, Quarter Time Periods");
        $('.trade_areas_cRegion').attr("title", "Available for Year, Quarter Time Periods");
        $('.albertsonssafeway_trade_areas_cRegion').attr("title", "Has Sub Levels");
        $('.albertsonssafeway_corporate_net_trade_area_cRegion').attr("title", "Can not be selected with other Albertson's/Safeway Sub Regions");
        $('.heb_trade_areas_cRegion').attr("title", "Has Sub Levels");
        $('.heb_trade_area_cRegion').attr("title", "Can not be selected with other HEB Sub Regions");
    }
    else {
        $('.density_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.ccna_regions_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.bottler_regions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for Total Time, YTD, 12MMT, 6MMT, 3MMT Time Periods");
        $('.ccr_subregions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for Total Time, YTD, 12MMT, 6MMT, 3MMT Time Periods");
        $('.ao_non_ccr_subregions_cRegion').attr("title", "Available for Year, Year ending month for Total Time, YTD, 12MMT Time Periods");
        $('.census_regions_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.census_divisions_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
        $('.dma_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for Total Time, YTD, 12MMT, 6MMT, 3MMT Time Periods");
        $('.trade_areas_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for Total Time, YTD, 12MMT, 6MMT, 3MMT Time Periods");
        $('.albertsonssafeway_trade_areas_cRegion').attr("title", "Has Sub Levels");
        $('.albertsonssafeway_corporate_net_trade_area_cRegion').attr("title", "Can not be selected with other Albertson's/Safeway Sub Regions");
        $('.heb_trade_areas_cRegion').attr("title", "Has Sub Levels");
        $('.heb_trade_area_cRegion').attr("title", "Can not be selected with other HEB Sub Regions");
    }
    //

    //Enable and Disable Custom Regions based on Time Period

    var timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();

    var customRegionList = [];
    if (parentName == "Metric Comparisons")
        customRegionList = $('.lft-popup-col3').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    else
        customRegionList = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();

    var disableForWhenTOTALTimeSelected = "", disableForWhenYEARTimeSelected = "", disableForWhenYTDTimeSelected = "", disableForWhenQUARTERTimeSelected = "", disableForWhen12MMTTimeSelected = "", disableForWhen6MMTTimeSelected = "", disableForWhen3MMTTimeSelected = "";

    if ($(".trend").hasClass("active")) {
        //TREND - Start
        disableForWhenTOTALTimeSelected = ["Bottler Regions", "CCR SubRegions", "AO Non CCR Subregions", "DMA", "Trade Areas"];
        disableForWhenYEARTimeSelected = [];
        disableForWhenYTDTimeSelected = [];
        disableForWhenQUARTERTimeSelected = ["AO Non CCR Subregions"];
        disableForWhen12MMTTimeSelected = ["Bottler Regions", "CCR Subregions", "AO Non CCR Subregions", "DMA Regions", "Trade Areas"];
        disableForWhen6MMTTimeSelected = ["Bottler Regions", "CCR Subregions", "AO Non CCR Subregions", "DMA Regions", "Trade Areas"];
        disableForWhen3MMTTimeSelected = ["Bottler Regions", "CCR Subregions", "AO Non CCR Subregions", "DMA Regions", "Trade Areas"];


        //TREND- End
    }
    else {
        //PIT- Start
        disableForWhenTOTALTimeSelected = ["Bottler Regions", "CCR SubRegions", "AO Non CCR Subregions", "DMA", "Trade Areas"];
        disableForWhenYEARTimeSelected = [""];
        disableForWhenYTDTimeSelected = [""];
        disableForWhenQUARTERTimeSelected = ["AO Non CCR Subregions"];
        disableForWhen12MMTTimeSelected = [];
        disableForWhen6MMTTimeSelected = ["AO Non CCR Subregions"];
        disableForWhen3MMTTimeSelected = ["AO Non CCR Subregions"];
        //PIT- End
    }
    var toremovedisableCustomRegion = "";
    if (parentName == "Metric Comparisons")
        toremovedisableCustomRegion = $('.lft-popup-col3').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    else
        toremovedisableCustomRegion = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    $.each(toremovedisableCustomRegion, function (i, v) {
        $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
        $(this).removeClass('disableCustomRegion');
    });

    //if (timePeriodType == "QUARTER") {
    //    $.each(customRegionList, function (i, v) {
    //        if (disableForWhen + timePeriodType + TimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
    //            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
    //            $(this).addClass('disableCustomRegion');
    //        }
    //    });
    //}
    //if ($(".trend").hasClass("active")) {
    //    if (timePeriodType.replace(" ","") == "3MMT") {
    //        $.each(customRegionList, function (i, v) {
    //            if (disableForWhen + timePeriodType + TimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
    //                $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
    //                $(this).addClass('disableCustomRegion');
    //            }
    //        });
    //    }
    //}
    //else {
    //    if (timePeriodType == "TOTAL") {

    //        $.each(customRegionList, function (i, v) {
    //            if (disableForWhenTotalTimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
    //                $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
    //                $(this).addClass('disableCustomRegion');
    //            }
    //        });
    //    }
    //    if (timePeriodType.replace(" ", "") == "3MMT") {
    //        $.each(customRegionList, function (i, v) {
    //            if (disableForWhen3MMTTimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
    //                $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
    //                $(this).addClass('disableCustomRegion');
    //            }
    //        });
    //    }
    //}
    var disableforTimeSelected = eval("disableForWhen" + timePeriodType.replace(" ", "") + "TimeSelected");
    //disableforTimeSelected = disableforTimeSelected.replace
    //if (timePeriodType.replace(" ", "") == "3MMT") {
    $.each(customRegionList, function (i, v) {
        if (disableforTimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
            $(this).addClass('disableCustomRegion');
        }
    });
    //}
    //

}

//Custom Regions TO check 
var validationToSelectNDeselectInSubLevels = function (key) {
    var mstr = $(key).parent().parent().parent().parent().parent();
    var keyfirstLevelSelection = $(key).parent().parent().attr("first-level-selection");
    var parentText = $(key).parent().find(".lft-popup-ele-label").attr("parent-text");
    var level = $(key).parent().parent().attr("data-level");
    var selectedele = $(mstr).find(".lft-popup-ele_active").first();
    var selfirstlevelselection = $(selectedele).parent().attr("first-level-selection");
    if (selectedele.length <= 0) {
        return true;
    }
    var pText = $(selectedele).find(".lft-popup-ele-label").attr("parent-text");
    var pLevel = $(selectedele).parent().attr("data-level");
    var CustomRegionsList = ["Density", "CCNA Regions", "Bottler Regions", "CCR SubRegions", "AO Non CCR Subregions", "Census Regions", "Census Divisions", "DMA", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "Albertson's/Safeway Corporate Net Trade Area", "HEB Trade Areas"];
    //Custom Regions Fourth Level
    var albertSonSelectedLevelText = $(key).parent().find(".lft-popup-ele-label").text();
    //  
    if (pText == parentText && pLevel == level && pLevel != "4") {
        if (pText == "Trade Areas") {
            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    deselectSelctdElmntsCustomRegions(ele, key);
                }
            });
        }
        else
            return true;
    }
    else if (level == 3) {
        if (selfirstlevelselection == "Geography") {
            var selectedEle = $(key).parent().parent().parent().parent().find(".lft-popup-ele_active");
            var secondLevelGeography = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();

            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    if ($($(ele).children()[1]).attr("parent-text") == parentText) {
                        if ($($(ele).children()[1]).attr("parent-text") == "Trade Areas") {
                            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
                            $.each(selectedEle, function (index, ele) {
                                if (CustomRegionsList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                                    deselectSelctdElmntsCustomRegions(ele, key);
                                }
                            });
                        }
                        else
                            return true;
                    }
                    else {
                        deselectSelctdElmntsCustomRegions(ele, key);
                    }
                }
            });
        }
        return true;
    }

    if (albertSonSelectedLevelText == "Albertson's/Safeway Corporate NET Trade Area" || albertSonSelectedLevelText == "HEB Trade Area") {
        //var selectedEle = $('.lft-popup-col4').find(".lft-popup-ele_active");
        var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
        $.each(selectedEle, function (index, ele) {
            if (CustomRegionsList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                if (albertSonSelectedLevelText == "Albertson's/Safeway Corporate NET Trade Area" || albertSonSelectedLevelText == "HEB Trade Area") {
                    deselectSelctdElmntsCustomRegions(ele, key);
                }
            }
        });
    }
    else {
        if (level == "4") {
            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    if ($($(ele).children()[1]).attr("parent-text") == parentText && $($(ele).children()[1]).text() != "Albertson's/Safeway Corporate NET Trade Area" && $($(ele).children()[1]).text() != "HEB Trade Area") {
                        return true
                    }
                    else {
                        deselectSelctdElmntsCustomRegions(ele, key);
                    }
                }

            });
        }
    }
}
//

//Deselecting the selected elements in custom Region Section
var deselectSelctdElmntsCustomRegions = function (ele, key) {
    var ctrl2 = $(key).parent().parent().parent().parent().siblings(".lft-ctrl2");
    $(ele).removeClass("lft-popup-ele_active");
    ele = ele.children[1];
    removeSelectedPanelElement(true, ele, ctrl2);
    hideEstablishmentFromTable(removeBlankSpace($(ele).text()));//To remove columns  from table output ares
}
//

//To Check User Session 
var checkValidationSessionObj = function () {
    var isvalid = true;
    $.ajax({
        url: appRouteUrl + "Logon/ValidateSessionObj",
        data: "",
        method: "POST",
        contenttype: "application/json",
        async: false,
        success: function (data) {
            if (data != null && data != "") {
                sessionStorage.clear();
                window.location.href = kiLoginURL;
                isvalid = false;
                return isvalid;
            }
        }
    });
    return isvalid;
}
//

function inlineLevelsForMenu(response) {
    var finalData = [];
    $.each(response, function (i, v) {
        var obj = {};
        if (v.Label == "Time Period") {
            finalData.push(v);
        }
        else {
            var commonFilterData = [];
            $.each(v.PanelPopup, function (i, v) {
                var distinctInLineLevels = [];
                $.each(v.Data, function (a, b) {
                    if (distinctInLineLevels.indexOf(b.InlineLevel) == -1)
                        distinctInLineLevels.push(b.InlineLevel);
                });
                $.each(distinctInLineLevels, function (dI, dV) {
                    var obj = {}, list = [];
                    obj.Level = v.Level;
                    $.each(v.Data, function (a, b) {
                        if (dV == b.InlineLevel) {
                            list.push(b);
                        }
                    });
                    obj.Data = list;
                    commonFilterData.push(obj);
                    //if (i == 2)
                    //    commonFilterData.push(obj);
                });
            });
            v.PanelPopup = commonFilterData;
            finalData.push(v);
        }
    });
    return finalData;
}

//local storage
var clientDataStorage = {
    store: function (keyname, keyvalue) {
        this.clear();
        localStorage.setItem(keyname, keyvalue);
    },

    get: function (keyname) {
        this.clear();
        return localStorage.getItem(keyname);
    },

    clear: function () {
        var version = localStorage.getItem("globallocalstoragecache");
        if (version === undefined || version === null || version === '')
            localStorage.setItem("globallocalstoragecache", globallocalstoragecache);
        else if (version !== globallocalstoragecache) {
            localStorage.clear();
            localStorage.setItem("globallocalstoragecache", globallocalstoragecache);
        }
    }
}
$(window).resize(function () {
    zoomLevel = Math.round(window.devicePixelRatio * 100);
    setWidthforLeftPnlMesursDependonZoom(zoomLevel, measureCurrentLevel);

    if ($(".view-menu .active .master_link_a").eq(0).text() == "DASHBOARD") {
        $(".submodules-band").show();
        var dim = $(".master_link_a:eq(0)")[0].getBoundingClientRect();
        $(".submodules-band").css("margin-left", dim.left + ((24 * $(".master_link_a:eq(0)")[0].getBoundingClientRect().width) / 100) + "px");
    }
    if ($(".view-menu .active .master_link_a").eq(0).text() == "REPORTS") {
        $(".submodules-band").show();
        var dim = $(".master_link_a:eq(1)")[0].getBoundingClientRect();
        $(".submodules-band").css("margin-left", dim.left + ((22 * $(".master_link_a:eq(1)")[0].getBoundingClientRect().width) / 100) + "px");
    }
    if ($(".view-menu .active .master_link_a").eq(0).text() == "TABLES") {
        $(".submodules-band").show();
        var dim = $(".master_link_a:eq(2)")[0].getBoundingClientRect();
        $(".submodules-band").css("margin-left", dim.left + ((18 * $(".master_link_a:eq(2)")[0].getBoundingClientRect().width) / 100) + "px");
    }
    else if ($(".view-menu .active .master_link_a").eq(0).text() == "CHARTS") {
        $(".submodules-band").show();
        var dim = $(".master_link_a:eq(3)")[0].getBoundingClientRect();
        $(".submodules-band").css("margin-left", dim.left + ((19 * $(".master_link_a:eq(3)")[0].getBoundingClientRect().width) / 100) + "px");
    }
    if ($(".view-menu .active .master_link_a").eq(0).text() == "ADD'L CAPABILITIES") {
        $(".submodules-band").show();
        var dim = $(".master_link_a:eq(4)")[0].getBoundingClientRect();
        $(".submodules-band").css("margin-left", dim.left + ((21.7 * $(".master_link_a:eq(4)")[0].getBoundingClientRect().width) / 100) + "px");
    }

});

//Set Width Measures Left Panel Popup after 3 levels on zoom level
function setWidthforLeftPnlMesursDependonZoom(zoomLevel, measureCurrentLevel) {

    //if (measureCurrentLevel > 4)
    //        $(".lft-ctrl3-content").width("" + getWidthOnZoomLevelBev(zoomLevel) + "%");
    //else
    //    $(".lft-ctrl3-content").width((staticWidth * (measureCurrentLevel)) + "px");

    var leftScrollVal = $(".master-lft-ctrl[data-val='Measures'] .lft-ctrl3").scrollLeft();
    $("#ascrail2006 .nicescroll-cursors").css("right", -leftScrollVal + "px");
    $("#ascrail2007 .nicescroll-cursors").css("right", -leftScrollVal + "px");
    $("#ascrail2010 .nicescroll-cursors").css("right", -leftScrollVal + "px");
    $("#ascrail2011 .nicescroll-cursors").css("right", -leftScrollVal + "px");
}

function getWidthOnZoomLevelBev(zoomLevel) {
    var width = "";
    if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
        switch (zoomLevel) {
            case 110:
            case 125:
            case 150:
            case 300:
            case 400:
            case 500:
                width = "122";
                break;
            case 100:
                width = "110";
                break;
            case 90:
            case 80:
            case 75:
            case 67:
            case 50:
            case 33:
            case 25:
                width = "100";
                break;
        }
    }
    else {
        switch (zoomLevel) {
            case 110:
            case 125:
            case 150:
            case 300:
            case 400:
            case 500:
                width = "127";
                break;
            case 100:
                width = "115";
                break;
            case 90:
            case 80:
            case 75:
            case 67:
            case 50:
            case 33:
            case 25:
                width = "102";
                break;
        }
    }
    return width;
}

var setMaxHeightForHedrTble = function () { //Find max height
    var maxH = 25;
    var modulename = (window.location.pathname).replace("Dine/", "").split("/")[1];
    if (modulename == "Chart") {
        $(".scrollable-columns-frame th.tbl-dta-metricsHding").each(function (i, d) {
            maxH = $(d).find(".tbl-algn.tbl-text-upper .text_middle")[0].offsetHeight > maxH ? $(d).find(".tbl-algn.tbl-text-upper .text_middle")[0].offsetHeight : maxH;
        });
    } else {
        $(".scrollable-columns-frame th.tbl-dta-metricsHding").each(function (i, d) {
            maxH = $(d).find(".tbl-algn.tbl-text-upper")[0].offsetHeight > maxH ? $(d).find(".tbl-algn.tbl-text-upper")[0].offsetHeight : maxH;
        });
    }
    //
    //Set the height of Header to max
    if (maxH > 25) {
        $(".tbl-dta-metricsHding").height(maxH + 4);
        //Set Header part's 
        if (modulename == "Chart") {
            $(".corner-frame, .scrollable-columns-frame").css("height", (maxH + 7) + "px");
        }
        else {
            $(".corner-frame, .scrollable-columns-frame").css("height", (maxH + 25) + "px");
        }
    } else {
        $(".tbl-dta-metricsHding").height(maxH);
        $(".corner-frame, .scrollable-columns-frame").css("height", (maxH + 25) + "px");
        if (modulename == "Table") {
            if ($(".corner-frame .tbl-dta-rows").length == 1) { $(".corner-frame, .scrollable-columns-frame").css("height", "37px"); }
        } else {
            if (modulename == "Chart") { $(".corner-frame, .scrollable-columns-frame").css("height", maxH + 4 + "px"); }
        }
    }
}
var callSubmitBtn = function ()
{ }
//

//For Trend Chart Common Functionality to set width depending on Selections
function setWidthForTrendSeletns(claWidthForOne, claWidthForTwo, claWidthForThree, claWidthForFour, claWidthForFive) {
    if (trendTpList.length == 1) {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForOne + "px");
        $('.scrollable-columns-table tr td').width(claWidthForOne + "px");
        $('.scrollable-data-frame tr td').css("width", claWidthForOne + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForOne - 3) + "px");
        $('.scrollable-columns-table').css("width", claWidthForOne + "px");
        $('.scrollable-data-table').width(claWidthForOne + "px");
    }
    else if (trendTpList.length == 2) {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForTwo + "px");
        $('.scrollable-columns-table tr td').width(claWidthForTwo + "px");
        $('.scrollable-data-frame tr td').css("width", claWidthForTwo + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForTwo - 3) + "px");
        $('.scrollable-columns-table').css("width", claWidthForOne + "px");
        $('.scrollable-data-table').width(claWidthForOne + "px");
    }
    else if (trendTpList.length == 3) {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForThree + "px");
        $('.scrollable-columns-table tr td').width(claWidthForThree + "px");
        $('.scrollable-data-frame tr td').css("width", claWidthForThree + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");
        $('.scrollable-columns-table').css("width", claWidthForTwo + "px");
        $('.scrollable-data-table').width(claWidthForTwo + "px");

    }
    else if (trendTpList.length == 4) {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFour + "px");
        $('.scrollable-columns-table tr td').width(claWidthForFour + "px");
        $('.scrollable-data-frame tr td').css("width", claWidthForFour + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFour - 3) + "px");
        $('.scrollable-columns-table').css("width", claWidthForThree + "px");
        $('.scrollable-data-table').width(claWidthForThree + "px");

    }
    else {
        $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width(claWidthForFive + "px");
        $('.scrollable-columns-table tr td').width(claWidthForFive + "px");
        $('.scrollable-data-frame tr td').css("width", claWidthForFive + "px");
        $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForFive - 3) + "px");

        var seletdElmtsCount = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl').length;
        var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForFive * seletdElmtsCount;
        $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
        $('.scrollable-data-table').width(seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);
    }

}
//
/*Mouse Hovers start*/
$(document).on("mouseover", ".classMouseHover", function (e) {
    //if ($("#LeftPanel").is(":visible") == false)
    //    $("#MouseHoverBigDiv").css("background-size", "100% 100%");
    //else
    //    $("#MouseHoverBigDiv").css("background-size", "contain");

    jQuery(this).find('.play').show();
    var objs = GetMouseHoverPopUpDetails();
    //var sClassName = $(this).attr('class').split(' ')[1];
    var className = $(this).attr('class').split(' ');
    var sClassName;
    $(className).each(function (i, d) {
        if (className[i].indexOf("msehover") != -1) {
            sClassName = d;
        }
    });
    var sPopupDetails = _.filter(objs, function (i) {
        return i.cls == sClassName
    }).length > 0 ? _.filter(objs, function (i) { return i.cls == sClassName; })[0] : "";
    if (sPopupDetails != undefined && sPopupDetails != "" && sPopupDetails != null)
        MouseHoverPopupshowHide(sPopupDetails);
    //$("#MouseHoverBigDiv").show();
    e.stopPropagation();
});
$(document).on("mouseleave", ".classMouseHover", function () {
    //if ($("#LeftPanel").is(":visible") == false)
    //    $("#MouseHoverBigDiv").css("background-size", "100% 100%");
    //else
    //    $("#MouseHoverBigDiv").css("background-size", "contain");
    jQuery(this).find('.play').hide();
    var objs = GetMouseHoverPopUpDetails();

    $("#MouseHoverBigDiv").hide();
    $("#MouseHoverSmallDiv").hide();
    $("#MouseHoverSmallerDiv").hide();
    $("#MouseHoverExtraSmallDiv").hide();
});

$(document).on("mouseover", ".dynpos", function () {
    var pos = $(this).position();
    var width = $(this).outerWidth();
    var height = $(this).outerHeight();
    var widthdiv = $("#MouseHoverExtraSmallDiv").outerWidth();
    //show the menu directly over the placeholder
    $("#MouseHoverExtraSmallDiv").css({
        position: "absolute",
        top: (pos.top + height) + "px",
        left: (pos.left - widthdiv + 22) + "px",
    }).show();
});

$(document).on("mouseleave", ".classMouseHover", function () {
    $('#MouseHoverExtraSmallDiv').hide();
});

$(document).on("mouseover", ".dynpos1", function () {
    var pos = $(this).offset();
    var width = $(this).outerWidth();
    var height = $(this).outerHeight();
    var widthdiv = $("#MouseHoverSmallerDiv").outerWidth();

    var pageWidth = $(window).width();
    var pageHeight = $(window).width();
    var elementWidth = $("#MouseHoverSmallerDiv").outerWidth();
    var elementLeft = $(this).offset().left;
    var elementHeight = $("#MouseHoverSmallerDiv").outerHeight();
    var elementTop = $(this).offset().top;
    //bug id 5316
    if ($(this).hasClass("adv-fltr-toggle-container-msehover"))
        pos.left = pos.left + 200;
    if ($(this).hasClass("up")) {
        $("#MouseHoverSmallerDiv").css({
            position: "absolute",
            top: (pos.top - height - 50) + "px",
            left: (pos.left + 5) + "px",
        }).show();
    } else {

        if ($(this).hasClass("arrow_popup")) {
            $("#MouseHoverSmallerDiv").css({
                position: "absolute",
                top: (pos.top + height - 6) + "px",
                left: (pos.left - widthdiv + 10) + "px",
            }).show();
        }

        else if ($(this).hasClass("view-back-to-report")) {
            $("#MouseHoverSmallerDiv").css({
                position: "absolute",
                top: (pos.top + height + 12) + "px",
                left: (pos.left - widthdiv + 32) + "px",
            }).show();
        }

        else if ($(this).hasClass("adv-fltr-toggle-container")) {
            $("#MouseHoverSmallerDiv").css({
                position: "absolute",
                top: (pos.top + height - 20) + "px",
                left: (pos.left - widthdiv + 77) + "px",
            }).show();
        }

        else {
            $("#MouseHoverSmallerDiv").css({
                position: "absolute",
                top: (pos.top + height + 6) + "px",
                left: (pos.left - widthdiv + 22) + "px",
            }).show();
        }
    }
    //show the menu directly over the placeholder


});
$(document).on("mouseleave", ".classMouseHover", function () {
    // Hover out code
    $('#MouseHoverSmallerDiv').hide();
});
/*Mouse Hovers end*/
/*Add , to numbers start*/
function addCommas(str) {
    var parts = (str.toString() + "").split("."),
        main = parts[0],
        len = main.length,
        output = "",
        first = main.charAt(0),
        i;

    if (first === '-') {
        main = main.slice(1);
        len = main.length;
    } else {
        first = "";
    }
    i = len - 1;
    while (i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "," + output;
        }
        --i;
    }
    // put sign back
    output = first + output;
    // put decimal part back
    if (parts.length > 1) {
        output += "." + parts[1];
    }
    return output;
}
/*Add , to numbers end*/
/*Start Round function for javaScript*/
var customRound = function (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
/*Start Round function for javaScript*/
/* Get_Significance_Color start */
var Get_Significance_Color = function (sig, cb, ss) {
    if (cb == "") {
        if (ss == null || ss == undefined || ss < 30 || isNaN(ss)) {
            return "transparent";
        }
        if (ss <= 99) {
            if (sig > 1.96) return "green";
            if (sig < -1.96) return "red";
            return "gray";
        }
        if (ss > 99) {
            if (sig > 1.96) return "green";
            if (sig < -1.96) return "red";
            if (sig == null || sig == undefined || (sig >= -1.96 && sig <= 1.96)) {
                return "black";
            }
        }
    } else {
        return "blue";
    }
}
/* Get_Significance_Color end */
/*Remove all other classes*/
function removeEstAdditionalFilterClasses() {
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level1");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level2");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level3");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level4");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level5");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level41");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level51");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level11");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level21");
    $(".adv-fltr-sub-establmt").find(".lft-ctrl3").removeClass("pop-level31");
}
/*Remove all other classes*/
//
//added by Nagaraju D for creating dynamic table
//Date: 04-09-2017

function SetTableResolution() {
    //added by Nagaraju D for table scroll dynamic height
    //Date: 04-09-2017         
    $(".table-bottomlayer").css("height", "calc(100% - 119px)");
    $("#scrollableTable").css("height", "100%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");

    $("#scrollableTable .scrollable-rows-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTable .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".scrollable-columns-frame .emptydiv, #scrollableTable .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");

    var scrollheight = $(".scrollable-columns-frame").height() + 18;
    $("#scrollableTable .scrollable-rows-frame, #scrollableTable .scrollable-data-frame").css("height", "calc(100% - " + scrollheight + "px)");

    $("#scrollableTable .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    $(".corner-frame, .scrollable-rows-frame").css("width", "35%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "64.3%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    //if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
    $(".scrollable-rows-table tr").each(function (i) {
        var height = $(this).height();
        if (height < $(".scrollable-data-table tr").eq(i).height()) {
            height = $(".scrollable-data-table tr").eq(i).height();
        }

        $(this).css("height", height + "px");
        $(this).children("td").css("height", height + "px");

        $(".scrollable-data-table tr").eq(i).css("height", height + "px");
        $(".scrollable-data-table tr").eq(i).children("td").css("height", height + "px");
    });
    //}
    //end

}
function SetRTableResolution() {
    //added by Nagaraju D for table scroll dynamic height
    //Date: 04-09-2017         
    if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS")
        $(".analyses-bottomlayer").css("height", "calc(100% - 200px)");
    else
        $(".analyses-bottomlayer").css("height", "calc(100% - 100px)");

    $("#scrollableTableR").css("height", "100%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");

    $("#scrollableTableR .scrollable-rows-frame table, #scrollableTableR .scrollable-data-frame table, #scrollableTableR .corner-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTableR .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTableR .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".corner-frame table tr th:not(.emptydiv), .scrollable-rows-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%")

    $(".scrollable-columns-frame .emptydiv, #scrollableTableR .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");

    var scrollheight = $(".scrollable-columns-frame").height() + 18;
    $("#scrollableTableR .scrollable-rows-frame, #scrollableTableR .scrollable-data-frame").css("height", "calc(100% - " + scrollheight + "px)");

    $("#scrollableTableR .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    $(".corner-frame, .scrollable-rows-frame").css("width", "50%");
    $(".scrollable-columns-frame, #scrollableTableR .scrollable-data-frame").css("width", "49.3%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    //if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
    $(".scrollable-rows-table tr").each(function (i) {
        var height = $(this).height();
        if (height < $(".scrollable-data-table tr").eq(i).height()) {
            height = $(".scrollable-data-table tr").eq(i).height();
        }

        $(this).css("height", height + "px");
        $(this).children("td").css("height", height + "px");

        $(".scrollable-data-table tr").eq(i).css("height", height + "px");
        $(".scrollable-data-table tr").eq(i).children("td").css("height", height + "px");
    });
    //}
    //end

}
function SetAnalysisTableResolution() {
    //added by Nagaraju D for table scroll dynamic height
    //Date: 15-09-2017         
    if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS")
        $(".analyses-bottomlayer").css("height", "calc(100% - 200px)");
    else
        $(".analyses-bottomlayer").css("height", "calc(100% - 100px)");

    $("#scrollableTableAnalyses").css("height", "95%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");

    $("#scrollableTableAnalyses .scrollable-rows-frame table, #scrollableTableAnalyses .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTableAnalyses .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTableAnalyses .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".scrollable-columns-frame .emptydiv, #scrollableTableAnalyses .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");

    var scrollheight = $(".scrollable-columns-frame").height() + 28;
    $("#scrollableTableAnalyses .scrollable-rows-frame, #scrollableTableAnalyses .scrollable-data-frame").css("height", "calc(100% - " + scrollheight + "px)");

    $("#scrollableTableAnalyses .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    $(".corner-frame, .scrollable-rows-frame").css("width", "48%");
    $(".scrollable-columns-frame, #scrollableTableAnalyses .scrollable-data-frame").css("width", "51.3%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    //if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
    $(".scrollable-rows-table tr").each(function (i) {
        var height = $(this).height();
        if (height < $(".scrollable-data-table tr").eq(i).height()) {
            height = $(".scrollable-data-table tr").eq(i).height();
        }

        $(this).css("height", height + "px");
        $(this).children("td").css("height", height + "px");

        $(".scrollable-data-table tr").eq(i).css("height", height + "px");
        $(".scrollable-data-table tr").eq(i).children("td").css("height", height + "px");
    });
    //}
    //end

}
function SetTableResolutionCrossDiner() {
    //added by Nagaraju D for table scroll dynamic height
    //Date: 04-09-2017         
    $(".analyses-crossdinerFreqlayer").css("height", "calc(100% - 103px)");
    $(".analyses-crossdinerFreqlayer").css("margin-top", "75px");
    $("#scrollableTable").css("height", "100%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "53px");

    $("#scrollableTable .scrollable-rows-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTable .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".scrollable-columns-frame .emptydiv, #scrollableTable .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");

    var scrollheight = $(".scrollable-columns-frame").height() - 6;
    $("#scrollableTable .scrollable-rows-frame, #scrollableTable .scrollable-data-frame").css("height", "calc(100% - " + scrollheight + "px)");

    $("#scrollableTable .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    $(".corner-frame, .scrollable-rows-frame").css("width", "35%");
    $("#scrollableTable tr td:first-child").css("width", "100%");
    $('#scrollableTable tr th.tbl-dta-metricsHding').width("100%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "64.3%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");

    var righttblrows = $(".scrollable-data-table tr");
    var lefttblrows = $(".scrollable-rows-table tr");
    $(righttblrows).each(function (i) {
        var height = $(lefttblrows).eq(i).height();
        $(righttblrows).css("height", height + "px");
    });
    //}
    //end

}

//added by Nagaraju D for disabling measures on Group selection
//Date: 11-09-2017
function DisableOrEnableMeasures(name) {
    //var metricfirstlevelname = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    var metricfirstlevelname = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-ele_active").attr("parent-of-parent");
    var visitsList = ["Pre-Visit", "In-Establishment", "In-Establishment Bev Details", "Post-Visit", "Outlet Motivation Segments", "Outlet Motivation Attributes - Top 2 Box", "Occasion Motivation - Top 2 Box"];
    var guestsList = ["Beverage Guest", "Establishment Frequency", "Brand Health Metrics", "Establishment Imageries"];
    var measuresFirstLevelList;
    if (name == "Metric Comparisons" || name == "Measures")
        measuresFirstLevelList = $(".master-lft-ctrl[data-val='" + name + "'] .lft-popup-col1").find(".lft-popup-ele-label");


    $.each(measuresFirstLevelList, function (i, v) {
        $(v).find(".lft-popup-ele-next").removeClass("disableMeasurescolor");
        $(v).parent().removeClass('disableMeasures');
    });
    if (visitsList.indexOf(metricfirstlevelname) > -1) {
        $.each(guestsList, function (VI, VL) {
            $.each(measuresFirstLevelList, function (i, v) {
                if (VL == $(v).text()) {
                    $(v).parent().addClass("disableMeasures");
                    $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
                }
            });
        });
    }
    else if (guestsList.indexOf(metricfirstlevelname) > -1) {
        $.each(visitsList, function (VI, VL) {
            $.each(measuresFirstLevelList, function (i, v) {
                if (VL == $(v).text()) {
                    $(v).parent().addClass("disableMeasures");
                    $(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
                }
            });
        });
    }

    //To disable only Beverage Guest in Measures and Groups
    //$.each(measuresFirstLevelList, function (i, v) {
    //    if ( $(v).text() =="Beverage Guest") {
    //        $(v).parent().addClass("disableBeverageGuestOnly");
    //        $(v).find(".lft-popup-ele-next").addClass("disableBeverageGuestOnlycolor");
    //    }
    //});
    //

    //if (controllername == "tablebeveragedeepdive" || controllername == "chartbeveragedeepdive") {
    //    //To disable only In-Establishment Bev Details
    //    var groupsList;
    //    groupsList = $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col1").find(".lft-popup-ele-label");
    //    $.each(groupsList, function (i, v) {
    //        if ($(v).text() == "In-Establishment Bev Details") {
    //            $(v).parent().addClass("disableInEstaBevOnly");
    //            $(v).find(".lft-popup-ele-next").addClass("disableInEstaBevOnlycolor");
    //        }
    //    });
    //    //
    //}
}
function ClearMeasures(groupname, parent_text, dataParent) {
    //added by Nagaraju  for clearing measures
    //Date: 11-09-2017
    var pText = "";
    if (groupname == "Metric Comparisons") {
        //
        var measure_pText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
        $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[data-val='" + measure_pText + "']").parent(".lft-popup-ele").show().removeClass("dynamic_show_hide_charts");
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + measure_pText + "']").parent(".lft-popup-ele").show();

        var selectedIDs = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active");
        $.each(selectedIDs, function (index, ele) {
            $(ele).removeClass("lft-popup-ele_active");
            var element = $(ele).find(".lft-popup-ele-label");
            var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
            removeSelectedPanelElement(true, element, ctrl2);
        });
        $(".master-lft-ctrl[data-val='Measures'] div").removeClass("lft-popup-ele_active");

    }
    //for Metric Comparisons
    pText = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
    if (pText != undefined) {
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
    }
    else {
        if (groupname != "Measures")
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
        if (groupname != "Demographic Filters")
            $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
    }

    //for Measures 
    pText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
    if (pText != undefined) {
        $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
    }
    else {
        if (groupname != "Metric Comparisons")
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
        if (groupname != "Demographic Filters")
            $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
    }

    //for Demographic Filters 
    pText = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
    if (pText != undefined) {
        $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-val='" + pText + "']").parent(".lft-popup-ele").hide();
    }
    else {
        if (groupname != "Metric Comparisons")
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
        if (groupname != "Measures")
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele-label[data-id='" + dataParent + "']").parent(".lft-popup-ele").show();
    }
}
/*Start to get the min and max selections @pkr*/
/*Only for estabishment, beverages, groups and mesaues*/
var getminmaxData = function (stubName) {
    var minmaxdata = undefined;//{ "min": 1, "max": 1, "message": "", "heading": "" };
    var istrend = $(".pit.active").length == 0 ? true : false;
    switch (controllername) {
        case "chartestablishmentcompare":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 1 selection", "heading": "You can select only 1 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selection", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 25 Time Periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 time period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Establishments", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Establishments" }; break;
            }
            break;
        case "chartestablishmentdeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selection", "heading": "You can select 1 to 10 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 measure", "maxmessage": "You can't select more than 25 time periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can't make more than 1 selection", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 1, "max": 11, "minmessage": "Please select minimum 1 Metric Comparisons", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 1 to 11 Metric Comparisons" }; break;
            }
            break;
        case "chartbeveragecompare":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 11 selections", "heading": "You can select only 1 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Beverages", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Beverages" }; break;
            }
            break;
        case "chartbeveragedeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selection", "heading": "You can 1 to 10 Measures" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can't make more than 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Beverage", "maxmessage": "You can't make more than 1 selection", "heading": "You can select only one Beverage" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 1, "max": 11, "minmessage": "Please select minimum 1 Metric Comparisons", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 1 to 11 Metric Comparisons" }; break;
            }
            break;
        case "tableestablishmentcompare":
            switch (stubName) {
                case "Establishment": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Establishments", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Establishments" }; break;
            }
            break;
        case "tableestablishmentdeepdive":
            switch (stubName) {
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 25 Time Periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can't make more than 11 selections", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = istrend ? undefined : { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Metric Comparisons", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Metric Comparisons" }; break;
            }
            break;
        case "tablebeveragecomparison":
            switch (stubName) {
                case "Beverage": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Beverages", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Beverages" }; break;
            }
            break;
        case "tablebeveragedeepdive":
            switch (stubName) {
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can't select more than 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Beverage", "maxmessage": "You can't make more than 1 selection", "heading": "You can select only one Beverage" }; break;
                case "Metric Comparisons": minmaxdata = istrend ? undefined : { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Metric Comparisons", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 2 to 11 Metric Comparisons" }; break;
            }
            break;
        case "analysesestablishmentcompare":
            switch (stubName) {
                case "Measures": minmaxdata = { "min": 3, "max": 11, "minmessage": "Please select minimum 3 Measures", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 3 to 11 Measures" }; break;
                case "Establishment": minmaxdata = { "min": 3, "max": 11, "minmessage": "Please select minimum 3 Establishments", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 3 to 11 Establishments" }; break;
            }
            break;
        case "analysesestablishmentdeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = { "min": 3, "max": 11, "minmessage": "Please select minimum 3 Measures", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 3 to 11 Measures" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can't make more than 1 selection", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 3, "max": 11, "minmessage": "Please select minimum 3 Metric Comparisons", "maxmessage": "You can't make more than 11 selections", "heading": "You can select from 3 to 11 Metric Comparisons" }; break;
            }
            break;
        case "reportp2preport":
        case "reportdinerreport":
            switch (stubName) {
                case "Establishment": minmaxdata = { "min": 1, "max": 5, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can't make more than 5 selections", "heading": "You can select 1 to 5 Establishments" }; break;
            }
            break;
    }
    return minmaxdata;
}
//Returns module, submodule, pit/trend respectively
var getcurrentpathinfo = function () {
    var info = { "module": "", "submodule": "", "pittrend": "" };
    info["pittrend"] = ($(".pit.active").length == 0 ? "trend" : "pit");
    return info;
}
/*End to get the min and max selections @pkr*/
/*Start show max message @pkr*/
var showMaxAlert = function (message) {
    //alert(message);
    $(".alert-message").text(message);
    $(".show-message-container, .transparentBGforAlert").show();
}
$(document).on('click', '.alert-message-close', function (e) {
    $(".show-message-container, .transparentBGforAlert").hide();
});
/*End show max message @pkr*/

function ClearMetricComparisions(groupname) {
    //added by Nagaraju  for clearing measures
    //Date: 11-09-2017
    if (groupname == "Metric Comparisons") {
        //
        var selectedIDs = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active");
        $.each(selectedIDs, function (index, ele) {
            $(ele).removeClass("lft-popup-ele_active");
            var element = $(ele).find(".lft-popup-ele-label");
            var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
            removeSelectedPanelElement(true, element, ctrl2);
        });
        $(".master-lft-ctrl[data-val='Measures'] div").removeClass("lft-popup-ele_active");
    }
}

var toShowDemofilter = function () {
}

var getFirstLevelSelection = function (dataVal, ele) {
    var p_ele = $(".master-lft-ctrl[data-val='" + dataVal + "']");
    var p_text = $(p_ele).find(".lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text");
    if (p_text == undefined || p_text == null || p_text == "") { return ""; }
    var popLevel = +($(p_ele).find(".lft-popup-ele_active:eq(0)").parent().attr("data-level"));
    if (popLevel == 2) {
        return p_text;
    }
    popLevel--;
    while (popLevel != 1) {
        p_text = $(p_ele).find(".lft-popup-ele-label[data-val='" + p_text + "']").attr("parent-text");
        popLevel--;
    }
    return p_text;
}
var setWidthforCrossDinerAnalysisTableColumns = function () {
    var pathname = window.location.pathname.toLocaleLowerCase();
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex);
    var claWidthForOne = 820;
    var claWidthForTwo = 400;
    var claWidthForThree = 265;
    var claWidthForFour = 197;
    var claWidthForFive = 155;
    var defaultWidth = 1289;
    var defaultWidthhd = 1870;
    var defaultWidtdFramWidth = 830;
    var calFrmWidth = 0;
    var hdrDefaultWidht = 441;
    var currentWidth = parseInt($(".analyses-crossdinerFreqlayer").width());
    var defaultHeight = 470 + 25;
    if (currentWidth == defaultWidth) {
        claWidthForOne = 820;//17
        claWidthForTwo = 404;//8.38
        claWidthForThree = 265;//5.55
        claWidthForFour = 197;
        claWidthForFive = 155;
        calFrmWidth = defaultWidtdFramWidth;
        defaultHeight = 470 + 25;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".analyses-crossdinerFreqlayer").css("height", defaultHeight - 31 + "px");
        else
            $(".analyses-crossdinerFreqlayer").css("height", (defaultHeight + 25) + "px");
    }
    else if (currentWidth == defaultWidthhd) {
        defaultWidtdFramWidth = defaultWidtdFramWidth + 6;

        claWidthForOne = (currentWidth * claWidthForOne) / defaultWidth + 6;
        claWidthForTwo = ((currentWidth * claWidthForTwo) / defaultWidth) + 4.5 + 6;
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth + 1 + 5;
        claWidthForFour = (currentWidth * claWidthForFour) / defaultWidth + 4.5;
        claWidthForFive = (currentWidth * claWidthForFive) / defaultWidth + 0.5 + 4.5;
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".analyses-crossdinerFreqlayer").css("height", $(".master-content-area").height() - 195 + "px");
        else
            $(".analyses-crossdinerFreqlayer").css("height", $(".master-content-area").height() - 115 + "px");

    }
    else {
        claWidthForOne = (currentWidth * claWidthForOne) / defaultWidth
        claWidthForTwo = ((currentWidth * claWidthForTwo) / defaultWidth) + 4.5
        claWidthForThree = (currentWidth * claWidthForThree) / defaultWidth + 1
        claWidthForFour = (currentWidth * claWidthForFour) / defaultWidth
        claWidthForFive = (currentWidth * claWidthForFive) / defaultWidth + 0.5;
        calFrmWidth = (currentWidth * defaultWidtdFramWidth) / defaultWidth;
        hdrDefaultWidht = (currentWidth * hdrDefaultWidht) / defaultWidth;
        if ($(".adv-fltr-selection").is(":visible"))
            $(".analyses-crossdinerFreqlayer").css("height", $(".master-content-area").height() - 195 + "px");
        else
            $(".analyses-crossdinerFreqlayer").css("height", $(".master-content-area").height() - 115 + "px");

    }
    $('.scrollable-data-frame').css("width", (calFrmWidth + 1) + "px");
    $("#scrollableTable").css("width", (currentWidth) + "px");
    $('.scrollable-columns-frame').css("width", (calFrmWidth) + "px");

    $('.tbl-dta-metricsHding').css("width", "96%");
    $(".scrollable-rows-table tr td:first-child").css("width", "96%");
    $(".corner-frame table.data td:first-child").css("width", (hdrDefaultWidht) + "px");

    $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width("96%");
    $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForThree + "px");
    $('.scrollable-data-frame tr td.tbl-dta-td').css("width", "96%");
    $('.scrollable-data-frame tr td div.tbl-data-btmbrd').css("width", (claWidthForThree - 3) + "px");

    var seletdElmtsCount = 3;
    var seletdElmtsEmptydivWidth = 10 * seletdElmtsCount; var seletdElmtsEstdivWidth = claWidthForThree * seletdElmtsCount;
    $('.scrollable-columns-table').css("width", seletdElmtsEmptydivWidth + seletdElmtsEstdivWidth);

}
var globallocalstoragecache = "56.9";
