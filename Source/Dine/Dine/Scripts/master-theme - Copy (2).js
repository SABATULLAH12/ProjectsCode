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
var isVisitOrGuestMeasures = 0, isSampleSizeValidated = 0, pp_py_lock = 1, skipDefaultFreq = 0, commentsForCharts = " ", ctrlUp = false, intForContinuous;
var staticWidth = 290;
var defaultchartColors = ["#E41E2B", "#31859C", "#FFC000", "#00B050", "#7030A0", "#7F7F7F", "#C00000", "#0070C0", "#FF9900", "#D2D9DF", "#000000", "#838C87", "#83E5BB", "#cccccc", "#b42c14", "#643160", "#be6e14", "#406462", "#605f4f", "#a3978b", "#c08617", "#9d270e", "#170909", "#368130", "#378574"];
var currentColorPalletList = [];
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
var frequencycheckToPrepareFilter = ["total visits", "weekly+", "monthly+", "quarterly+", "annualy+", "establishment in trade area", 'yearly+', 'favorite brand in category', 'favorite brand across nab'];
var additionalfilterListGuest = ["Device Used"];
var additionalfilterListVisit = ["Daypart", "Day of Week", "Planning Type", "Service Mode", "Meal Type", "Visit Type", "Outlet Segments", "Food Items", "Beverage Consumed", "NARTD"];
var additionalselectedList = []; var dataforDemodashbord = []; var IDsDemo = ''; var frequencyselectedIDforDemographics = ""; var frequencyselectedIDforCustomBase = "";
var isVisitsSelected_Charts = 0, isVisitsSelected_analysis = 0;
var isAdditionalFilterLoaded = false;
var disabledMeasures = [];
var IsPIT_TREND = false;
var selectedFirstLevelinMetricCompsns = "";
var isCrossDinerSubmitClicked = false; var isRestOrRetailer = 1, isRestorRetalerClicked = false, isEstablishmentChanged = false, isReportInitialLoad = false;
var listofOthers = ['39', '56', '81', '120', '170', '229']
var customBaseChanged = false;
var delOnlyEstFilters = false;
var isAdvFiltersChanged = false;
var advFiltersCBList = [];
var isFrequencyForCBFilters = false;
var isFrqncyInBrandHlthMtricChanged = false;
var searchArray = [];
var searchArrayForCustombase = [];



var CustomRegionsToolTipListInMenu = ["Geography", "Albertson's/Safeway Trade Areas", "7-Eleven Trade Areas", "Trade Areas", "HEB Trade Areas", "Circle K Trade Areas"]
var CustomRegionsDisableToolTipListInMenu = ["Albertson's/Safeway Trade Areas", "7-Eleven Trade Areas", "Trade Areas", "HEB Trade Areas", "Circle K Trade Areas"]
var CustomRegionsToolTipParentList = ["CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU", "Walgreens Trade Areas"]
var CustomRegionsToolTipChildList = ["Albertson's/Safeway Houston", "HEB Northwest Div", "Circle K Las vegas", "7-Eleven Baltimore/Washington DC", "7-Eleven Boston/Connecticut", "7-Eleven Chicago", "7-Eleven Colorado Springs/Pueblo", "7-Eleven Dallas-Ft Worth", "7-Eleven Denver", "7-Eleven Detroit", "7-Eleven LA/San Diego", "7-Eleven Miami Dade", "7-Eleven New York City", "7-Eleven Orlando/Tampa", "7-Eleven Philadelphia", "7-Eleven Phoenix", "7-Eleven San Francisco", "7-Eleven Seattle/Portland"]
var CustomRegionsDisabledParentList = ["CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU", "Walgreens Trade Areas"]
var startedYearCustomRegions = {
    "7-Eleven Baltimore/Washington DC": 2021,
    "7-Eleven Boston/Connecticut": 2021,
    "7-Eleven Chicago": 2021,
    "7-Eleven Colorado Springs/Pueblo": 2021,
    "7-Eleven Dallas-Ft Worth": 2021,
    "7-Eleven Denver": 2021,
    "7-Eleven Detroit": 2021,
    "7-Eleven LA/San Diego": 2021,
    "7-Eleven Miami Dade": 2021,
    "7-Eleven New York City": 2021,
    "7-Eleven Orlando/Tampa": 2021,
    "7-Eleven Philadelphia": 2021,
    "7-Eleven Phoenix": 2021,
    "7-Eleven San Francisco": 2021,
    "7-Eleven Seattle/Portland": 2021,
    "Walgreens Trade Areas": 2021,
    "HEB Northwest Div": 2021,
    "Circle K Las vegas": 2021
}
var removedYearCustomRegions = {
    "Census Regions": 2021,
    "Census Divisions": 2021,
    "CCNA Regions": 2021,
    "FCL Ops OU": 2021,
    "Albertson's/Safeway Houston": 2021
}
var customRegionsFirstParentList = ["Density", "CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU", "Bottler Regions", "DMA Regions", "Trade Areas", "States"]
var disableCustomRegionListForAllTimeperiodtype = ["CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU", "Walgreens Trade Areas", "Albertson's/Safeway Houston", "HEB Northwest Div", "Circle K Las vegas", "7-Eleven Baltimore/Washington DC", "7-Eleven Boston/Connecticut", "7-Eleven Chicago", "7-Eleven Colorado Springs/Pueblo", "7-Eleven Dallas-Ft Worth", "7-Eleven Denver", "7-Eleven Detroit", "7-Eleven LA/San Diego", "7-Eleven Miami Dade", "7-Eleven New York City", "7-Eleven Orlando/Tampa", "7-Eleven Philadelphia", "7-Eleven Phoenix", "7-Eleven San Francisco", "7-Eleven Seattle/Portland"]
var customregionsTimeperiodTypeforTrend = ["YTD", "3MMT", "6MMT", "12MMT"];
//custom regions added by Sabat(10-05-2021) end

//CustomRegions Added by Bramhanath(04-jan-2018)
var CustomRegionsToolTipList = ["Geography", "Density", "CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "Census Regions", "Census Divisions", "DMA Regions", "Trade Areas", "Circle K Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States", "FCL Ops OU"];
var CustomRegionsParentList = ["Geography", "Albertson's/Safeway Trade Areas", "Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas"];
var CustomRegionsExceptnCasesList = ["Albertson's/Safeway Corporate Net Trade Area", "Circle K Trade Area", "HEB Trade Area", "Kroger Trade Area", "Publix Trade Area"]
var CustomRegionsparentDisableList = ["Albertson's/Safeway Trade Areas", "Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas"];//customregions to disable based on the timeperiods selections for Nets
var customregsionsNetsTradeAreasdiable = ["YEAR"];
var timePeriodType = "";
var customRegionList = [];
var onlyforYearnQurtrMntsForYTD = ["Mar", "Jun", "Sep"];
var onlyforBiannualMonth = ["Jun", "Dec"];

var controllerListForDemoFilterCustomReg = ["dashboardp2pdashboard", "dashboard_demographics", "reportp2preport", "reportdinerreport", "analysescrossDinerFrequencies", "situationassessmentreport"];
var disableForWhenTOTALTimeSelected = "", disableForWhenYEARTimeSelected = "", disableForWhenYTDTimeSelected = "", disableForWhenQUARTERTimeSelected = "", disableForWhen12MMTTimeSelected = "", disableForWhen6MMTTimeSelected = "", disableForWhen3MMTTimeSelected = "";
var customregionsEndingTimeperiodforTrend = ["YTD", "3 MMT", "6 MMT", "12 MMT"];
var customregionsqtrEndingmntsTrend = ["Mar", "Jun", "Sep", "Dec"];
var customRegionsParentLstQuarenterEdmnts = ["CCNA Regions", "Bottler Regions", "CCR Subregions", "DMA Regions", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"];
var isCustomregionQuarterEndingParentSelected = false;
var checkForHighestPrecedingOrderofCustmRegnsInTrend = [];
var time = []; var customregncurrentTimeperioddatavalForTrend = "", customregnkeycurrentValueTimeperiodForTrend = "", monthonlyYTD1 = "";
var startValue = 0, endValue = 0;
//
var isTotalUsPopulation = ""; var measureTexttoCompare = "";

//Only for the Report Situation Analysis 
var customBaseParentId1 = "", customBaseParentId2 = "", benchMarkId = "";
var isBenchMarkSelected = false, isBenchMarkSelectedNew = false;
var isEstdeleted = false, isCustomBaseDeletedCount = 0;
var establishmentSelectedCount = 0, defaultEstCustomBaseSelections = 0;
var isreportestablishmentChanged = false; var defaultCustomBaseToBeSelected = {};
var competitorsList = []; var isFromLeftPanelDelete = false; var isdefaultEstCustomBaseSelections = false;
var isComptitordeleted = false, isComptitorAdded = false, isComptitorDefaultSelect = false;
var customBaseList = []; var isCustomBaseAdded = false, isCustomBaseDeleted = false, isCompetitorLoop = false;
var defaultEstCustomBaseSelctns = [
{ name: 'Total Dine', id: 4, childs: [{ name: 'Restaurants', id: 609 }, { name: 'Retailers', id: 610 }] },
{ name: 'Restaurants', id: 5, childs: [{ name: 'Total Dine', id: 608 }, { name: 'Retailers', id: 610 }] },
{ name: 'Retailers', id: 6, childs: [{ name: 'Restaurants', id: 609 }, { name: 'Total Dine', id: 608 }] },
{ name: 'FSR', id: 12, childs: [{ name: 'QSR', id: 617 }, { name: 'Restaurants', id: 609 }] },
{ name: 'QSR', id: 13, childs: [{ name: 'FSR', id: 616 }, { name: 'Restaurants', id: 609 }] },
{ name: 'Convenience', id: 7, childs: [{ name: 'Retailers', id: 610 }, { name: 'Total Dine', id: 608 }] },
{ name: 'Dollar', id: 8, childs: [{ name: 'Retailers', id: 610 }, { name: 'Total Dine', id: 608 }] },
{ name: 'Grocery/Mass Merchandise/Supermarket', id: 9, childs: [{ name: 'Retailers', id: 610 }, { name: 'Total Dine', id: 608 }] },
{ name: 'Drug', id: 10, childs: [{ name: 'Retailers', id: 610 }, { name: 'Total Dine', id: 608 }] },
{ name: 'Club', id: 11, childs: [{ name: 'Retailers', id: 610 }, { name: 'Total Dine', id: 608 }] }];
var defaultEstCustomBaseSelctnsList = ['Total Dine', 'Restaurants', 'Retailers', 'FSR', 'QSR', 'Convenience', 'Dollar', 'Grocery/Mass Merchandise/Supercenter', 'Drug', 'Club'];
var lastedSelectedVisitsorGuests = 0, isSampleSizeValidatedForSitn = 0, previousSelectedMeasureId = 0;
var isFrequencyChangedForSitn = false, isdemogChangedForSitn = false, isEstCustomChangedForSitn = false; var selectedmeasureId = "";
var tableStructionModeForSAR = ["16", "17", "22", "23", "24", "25", "27"];
var visitfiltersList = [];
//
//
/*Start To show loader while page loading*/
document.onreadystatechange = function (e) {
    if (!e.bubbles) {
        $(".transparentBG").css("display", "block");
        $(".loader").css("display", "block");
    }
};
//$(window).load(function(){
//    //if (controllername != "dashboard_demographics")
//        $(".loader, .transparentBG").hide();
//    //Color Pallet
//    if ($(".jscolor")[0] != undefined || $(".jscolor")[0] != null) {
//        $(".jscolor")[0].jscolor.show();
//        //Clear the Input val
//        $(".jscolor").val('');
//        //Update the Color
//        recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
//    }
//});
$(window).on('load', function () {
    if (controllername != "dashboard_demographics")
        $(".loader, .transparentBG , .transparentBG-for-p2p").hide();
    //Color Pallet
    if ($(".jscolor")[0] != undefined || $(".jscolor")[0] != null) {
        $(".jscolor")[0].jscolor.show();
        //Clear the Input val
        $(".jscolor").val('');
        //Update the Color
        recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
    }
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
                //template += "<div style=\"display:none;\" class=\"lft-popup-ele\" channelflag=\"" + panelelement.IsChannelFlag + "\" imageriesflag=\"" + panelelement.IsImageriesFlag+ "\" child-count=\"" + panelelement.ChildCount + "\" parent-of-parent=\"" + panelelement.ParentOfParent + "\">" +
                //    "<span class=\"lft-popup-ele-label-img " + removeBlankSpace(panelelement.Text) + "_img " + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_availalbe') + "\"></span>" +
                //    "<span class=\"lft-popup-ele-label leftAlignTableText " + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_Width') + "\"" +
                //    "data-id=\"" + panelelement.ID + "\" data-val=\"" + panelelement.Text + "\" colorcode=\"" + panelelement.Colorcode + "\"  GuestOrVisitFilter=\"" + panelelement.GuestOrVisitFilter + "\" data-parent=\"" + panelelement.ParentID + "\" data-parent-search-name=\"" + panelelement.SearchName + "\" data-parent-level=\"" + (panelelement.IsSubHeading == null ? '' : panelelement.IsSubHeading) + "\" data-parent-id=\"" + (panelelement.IsSubHeadingID == null ? '' : panelelement.IsSubHeadingID) + "\"" +
                //    "parent-text=\"" + panelelement.ParentText + "\" data-isSelectable=\"" + (panelelement.IsSelectable == undefined ? true : panelelement.IsSelectable) + "\">" + panelelement.Text + "</span>" +
                //    "<span ng-class=\"{'lft-popup-ele-custom-tooltip-icon " + removeBlankSpace(panelelement.Text) + "_cRegion': ('" + removeBlankSpace(panelelement.ParentText) + "'  =='geography' || '" + removeBlankSpace(panelelement.Text) + "'  =='albertsonssafeway_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "'=='albertsonssafeway_corporate_net_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'circle_k_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "' == 'circle_k_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'heb_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "' == 'heb_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'kroger_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "' == 'kroger_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'publix_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "' == 'publix_trade_area' || '" + removeBlankSpace(panelelement.Text) + "' == 'total_us')}\"></span>" +

                //    "<span class=\"lft-popup-ele-next sidearrwdiv addLevel\" style=\"" + (panelelement.ChildCount == 0 ? "display:none;" : "display:block;") + "\" data-id=\"" + panelelement.ID + "\">" +
                //    "<span class=\"sidearrw\"></span>" +
                //    "</span>" +
                //    "</div>";
                template += "<div style=\"display:none;\" class=\"lft-popup-ele\" channelflag=\"" + panelelement.IsChannelFlag + "\" imageriesflag=\"" + panelelement.IsImageriesFlag + "\" child-count=\"" + panelelement.ChildCount + "\" parent-of-parent=\"" + panelelement.ParentOfParent + "\">" +
                    "<span class=\"lft-popup-ele-label-img " + removeBlankSpace(panelelement.Text) + "_img " + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_availalbe') + "\"></span>" +
                    "<span class=\"lft-popup-ele-label leftAlignTableText " + (panelelement.IsSubHeading == null ? '' : 'isSubHeading_Width') + "\"" +
                    "data-id=\"" + panelelement.ID + "\" data-val=\"" + panelelement.Text + "\" colorcode=\"" + panelelement.Colorcode + "\"  GuestOrVisitFilter=\"" + panelelement.GuestOrVisitFilter + "\" data-parent=\"" + panelelement.ParentID + "\" data-parent-search-name=\"" + panelelement.SearchName + "\" data-parent-level=\"" + (panelelement.IsSubHeading == null ? '' : panelelement.IsSubHeading) + "\" data-parent-id=\"" + (panelelement.IsSubHeadingID == null ? '' : panelelement.IsSubHeadingID) + "\"" +
                    "parent-text=\"" + panelelement.ParentText + "\" data-isSelectable=\"" + (panelelement.IsSelectable == undefined ? true : panelelement.IsSelectable) + "\">" + panelelement.Text + "</span>" +
                    "<span ng-class=\"{'lft-popup-ele-custom-tooltip-icon " + removeBlankSpace(panelelement.Text) + "_cRegion': ('" + removeBlankSpace(panelelement.Text) + "'  =='census_regions' || '" + removeBlankSpace(panelelement.Text) + "'  =='census_divisions' || '" + removeBlankSpace(panelelement.Text) + "'  =='ccna_regions' || '" + removeBlankSpace(panelelement.Text) + "'  =='fcl_ops_ou' || '" + removeBlankSpace(panelelement.Text) + "'  =='albertsonssafeway_houston' || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_baltimorewashington_dc'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_bostonconnecticut'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_chicago'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_colorado_springspueblo'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_dallas_ft_worth'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_denver'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_detroit'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_lasan_diego'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_miami_dade'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_new_york_city'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_orlandotampa'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_philadelphia'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_phoenix'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_san_francisco'  || '" + removeBlankSpace(panelelement.Text) + "'  =='__eleven_seattleportland'  || '" + removeBlankSpace(panelelement.Text) + "'  =='walgreens_trade_areas' || '" + removeBlankSpace(panelelement.Text) + "'  =='heb_northwest_div' || '" + removeBlankSpace(panelelement.Text) + "'  =='circle_k_las_vegas' )}\"></span>" +

                    "<span class=\"lft-popup-ele-next sidearrwdiv addLevel\" style=\"" + (panelelement.ChildCount == 0 ? "display:none;" : "display:block;") + "\" data-id=\"" + panelelement.ID + "\">" +
                    "<span class=\"sidearrw\"></span>" +
                    "</span>" +
                    "</div>";
                //@*bind individual element end*@    
            }
            content = $compile(template)(scope);
            angular.element(document.querySelector(".master-lft-ctrl[data-val='" + data_val + "'][data-index='" + data_index + "'] .lft-ctrl3-content .lft-popup-col" + level)).append(content);
            scope.$digest();
            $('.lft-popup-ele-custom-tooltip-icon').prevAll(".lft-popup-ele-label").addClass('lft-popup-ele-label-tooltip-sibling');
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
$(document).on('click', ".lft-ctrl-next", function (e) {
    //if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().length != 0) {
    //    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().remove();
    //}

    //if ($(this).parent().parent().attr('data-val') == "Competitors" && isreportestablishmentChanged)//added by bramhanath ..this is only for the SituationAssessment Module
    //{
    //    //isComptitorDefaultSelect = true;
    //    //getCompetitorsList();
    //    isreportestablishmentChanged = false;
    //    isComptitorDefaultSelect = false;
    //}
    if (($(this).parent().parent().attr("data-val") == "Competitors" || $(this).parent().parent().attr("data-val") == "Advance Filters") && controllername == "situationassessmentreport") {
        if ($(".Establishment_topdiv_element .sel_text").length == 0) {
            showMaxAlert("Please Select 1 Main Establishment/Channel and        2 Comparison Establishment/Channel"); return false;
        }
        else if ($('.Establishment_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=CustomBase]').length < 2) {
            showMaxAlert("Please Select 2 Comparison Establishment/Channel"); return false;
        }
        if ($('.Competitors_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=Competitors]').length < 5 && $(this).parent().parent().attr("data-val") == "Advance Filters") {
            showMaxAlert("Please Select minimum 5 Competitive Set");
            return;
        }

    }

    /*added by chandu find the selection is present or not, if not remove the selected arrow marks start by chandu*/
    if ($(this.parentElement.parentElement).find('.lft-popup-ele_active').length == 0) {
        $(this.parentElement.parentElement).find('.sidearrw_active').removeClass('sidearrw_active');
    }
    /*added by chandu find the selection is present or not, if not remove the selected arrow marks end by chandu*/

    resetPopupCss(this);
    reset_img_pos();
    $(".master-lft-ctrl").parent().css("background", "none");
    $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").addClass("backgroundClsnonenew")
    if (checkNumberOfEstablishmentSelected(this) == true) {
        reset_img_pos();
        var name = $(this).parent().find("span").text();
        var isestorcomp = $($(this).parent().parent()[0]).attr("data-val");
        $(this).parent().parent().children(".lft-ctrl3").find(".lft-ctrl3-header-name").html(name);
        if (controllername == "situationassessmentreport" && (isestorcomp == "Establishment" || isestorcomp == "Competitors")) {
            $(".lft-popup-col2").find(".lft-popup-col-search").css("visibility", "visible");
            $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "hidden");
            if (isestorcomp == "Establishment")
                $('.master-lft-ctrl.Establishment').find('.lft-popup-col1 .lft-popup-col-selected-text').html("");
            else if (isestorcomp == "Competitors")
                $('.master-lft-ctrl.Competitors').find('.lft-popup-col1 .lft-popup-col-selected-text').html("You can select Max 20 Competitor Set");

        }
        else {
            $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "visible");
            $(".lft-popup-col2").find(".lft-popup-col-search").css("visibility", "hidden");
        }


        var pele = $(this).parent().parent();
        if ($(this).parent().parent().attr("popup-type") == "advanceFilters") {
            $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").removeClass("backgroundClsnonenew").addClass("backgroundClsnonenew");
            $(this).parent().parent().parent().removeClass("backgroundClsnonenew").removeClass("backgroundClradd").addClass("backgroundClradd");
        }
        else {
            $(".master-lft-ctrl").parent().css("background", "none");
            $(this).parent().parent().parent().css("background", "#353135");
            $(".master-lft-ctrl").parent().removeClass("backgroundClradd").removeClass("backgroundClsnone");
            $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").addClass("backgroundClsnonenew")
        }
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();

        $(this).parent().parent().parent().find(".lft-ctrl3").show();
        $(".custombaseFilters_popup").hide();
        //$(this).parent().parent().parent().find(".lft-popup-col1").show();
        if ((controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") && $(this).text().trim() == "Custom Base") {
            if ((/*@cc_on!@*/false || !!document.documentMode) == true)
                $(this).parent().parent().parent().find(".lft-popup-col1").css("display", "inline-table");
            else
                $(this).parent().parent().parent().find(".lft-popup-col1").css("display", "inline-block");
        }
        else
            $(this).parent().parent().parent().find(".lft-popup-col1").css("display", "inline-block");
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
                if (controllername == "situationassessmentreport") {
                    if ($(fValue).text().trim().toLowerCase() == isTotalVisits) {
                        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                            $(fValue).removeClass("awarenesshide");
                            $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "true");
                        }
                        else {
                            $(fValue).addClass("awarenesshide");
                            $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
                        }
                    }
                    if (selectedmeasureId == "13" || selectedmeasureId == "14" || selectedmeasureId == "15") {
                        if ($(fValue).text().trim().toLowerCase() == "yearly+" || $(fValue).text().trim().toLowerCase() == "establishment in trade area" || $(fValue).text().trim().toLowerCase() == "total visits") {
                            $(fValue).addClass("awarenesshide");
                            $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
                        }
                    }
                }
                else {
                    if ($(fValue).text().trim().toLowerCase() == isTotalVisits) {
                        $(fValue).addClass("awarenesshide");
                        $(fValue).find(".lft-popup-ele-label").attr("data-isselectable", "false");
                    }
                }
            });
        }
        //

        //if ($(this).hasClass("timeperiod_img")) { $(".lft-popup-tp").first().click().click(); }
        $('.fltr-txt-hldr').css("color", "#000");
        if (controllername == "situationassessmentreport" && $(this).parent().parent().attr("data-val") == "FREQUENCY") {
            $(this).find('.fltr-txt-hldr').css("color", "#fff");
        }
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
                if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
                    $(this).css("display", "block");
                }
                else {
                    if ($(v).text() == "TOTAL") { //|| $(v).text() == "YEAR") {
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
        $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").getNiceScroll().remove();
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

    /*To add Bold and Underline for the Visit Type Additional filter */
    if ($(this).text().trim() == "Visit Type") {
        //To add underline and Bold for Prominent Headers added By Bramhanath(26-05-2017)
        var listpromHeaders = $("span.isSubHeading_Width");
        var lPush = [];
        var lParendId = [];

        //To get all the list of id and name
        $.each(listpromHeaders, function (i, v) {
            $(v).parent().find(".lft-popup-ele-label-img").css("width", "0px");
            $(v).parent().find(".lft-popup-ele-label-img").css("display", "block");
            $(v).parent().find(".lft-popup-ele-label-img").css("padding-left", "0px");
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
    }
    /*To add Bold and Underline for the Visit Type Additional filter */



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
    $(".competitors_img").css("background-position", "-3138px -147px");
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
    if ($(evt).hasClass("competitors_img")) {
        $(evt).css("background-position", "-3083px -147px")
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
    var alrdyselectedMeasuresParentName = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").parent().attr("first-level-selection");
    var alrdyselectedMeasuresParentNamecharts = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active [data-isselectable='true'").eq(0).attr("parent-text");
    var alrdyselCountCharts = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active [data-isselectable='true'").length;
    var currntselectedMeasuresParentName = $(this).parent().find(".lft-popup-ele-label").attr('data-val');
    var selctdMeasureList = [];
    $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active .lft-popup-ele-label").each(function (i, v) {
        selctdMeasureList.push($(v).attr("data-id"));
    });
    //if (currntselectedMeasuresParentName == alrdyselectedMeasuresParentNamecharts && currntselectedMeasuresParentName != undefined)
    //    return;
    if ($(pele).attr("data-val") == "Measures" && $(this).parent().parent().attr("data-level") == "1") {
        if (currntselectedMeasuresParentName != alrdyselectedMeasuresParentNamecharts && selctdMeasureList.length > 0)
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
                if ((controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") && mstrText.trim() == "Custom Base") {
                    if ((/*@cc_on!@*/false || !!document.documentMode) == true)
                        $(pele).find("." + "lft-popup-col1").css("display", "inline-table");
                    else
                        $(pele).find("." + "lft-popup-col1").css("display", "inline-block");
                }

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
        if ((controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") && mstrText.trim() == "Custom Base") {
            if ((/*@cc_on!@*/false || !!document.documentMode) == true)
                $(pele).find("." + "lft-popup-col1").css("display", "inline-table");
            else
                $(pele).find("." + "lft-popup-col1").css("display", "inline-block");
        }
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
    if ($(".master_link.active").text().toUpperCase() == "ADD'L CAPABILITIES")
        selCount = 100;

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

                if (currntselectedMeasuresParentName != alrdyselectedMeasuresParentNamecharts)
                    selctdMeasureList = [];
                if (selctdMeasureList.length > 0) {
                    if (selctdMeasureList.indexOf($(v).attr("data-id")) > -1)
                        $(v).click();
                }
                else
                    $(v).click();

            }
            else
                return false;
        });

    }

    //To hide Images Except for 1st Level
    if ((level != 1 && $(pele).attr("data-val") == "Measures") || (level != 1 && $(pele).attr("data-val") == "Advanced Filters") || (level != 1 && $(pele).attr("data-val") == "Advanced Filters Custom Base")) {
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
    if ($(pele).attr("data-val") == "Demographic Filters" || $(pele).attr("data-val") == "Metric Comparisons") {
        hideGeographyBaseonComparisonBanner();
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

    //white scroll bar for advanced filters custom base
    $(".dashboard-customBase-advanced-filters .lft-popup-col").getNiceScroll().remove();
    SetScroll($(".dashboard-customBase-advanced-filters .lft-popup-col"), "white", -10, -5, 0, 14, 8);

    //Establishment nice scroll
    if (mstrText == "Establishment" || mstrText == "Advance Filters" || mstrText == "Demographic Filters" || mstrText == "Metric Comparisons" || mstrText == "Advanced Filters Custom Base" || mstrText == "Competitors") {
        //$(".lft-ctrl3-content").css("height","98%");
        //if ($(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().length != 0) {
        //    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().remove();
        //}
        //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").getNiceScroll().resize();
        if (level == 4) {
            //$(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3-content").width($(".master-content-area").width() - 30);
            let lvl4scrollobj = $(".master-lft-ctrl[data-val='" + mstrText + "'] .lft-ctrl3-content").niceScroll({
                cursorcolor: "#fff",
                cursorwidth: "6px",
                autohidemode: false,
                horizrailenabled: true,
                scrollbarid: "addflt-level4-scroll",
                railpadding: {
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0
                }
            });
            lvl4scrollobj.rail.remove();
            $(".master-lft-ctrl[data-val='" + mstrText + "'] .lft-ctrl3-content").getNiceScroll().resize();
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

    // Added by Sabat (10-May-2021) start
    if (CustomRegionsToolTipListInMenu.indexOf($(this).parent().text().trim()) > -1)
        customRegions($(pele).attr("data-val"), this);//Custom Regions adding tooltips,enable and disable based on time periods
    // Added by Sabat (10-May-2021) end

    //if  (CustomRegionsParentList.indexOf($(this).parent().text().trim())> -1)
    //    customRegions($(pele).attr("data-val"),this);//Custom Regions adding tooltips,enable and disable based on time periods

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

    if (controllername == 'situationassessmentreport') {
        var isEstCompFirstLevel = $(pele).find('.lft-popup-col1').attr("first-level-selection");
        var prnt = (isEstCompFirstLevel == "Restaurants" || isEstCompFirstLevel == "Choose Main Establishment / Channel (Select 1)" || isEstCompFirstLevel == "Choose Comparison Establishment/ Channel/ Time Period (Select 2)" || $(pele).find('.lft-popup-col1').attr("first-level-selection") == "Competitors" ? "Restaurant" : "Retailer");
        if (isEstCompFirstLevel == "Competitors" && levelEst == "1") {
            $(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text("Competitors");
        }
        else if (isEstCompFirstLevel == "Competitors") {
        }
        else if (prnt == "Retailer") {
            if (levelEst == "1") {
                $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Subcategory");
            } else {
                $(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text(prnt);
            }
        } else {
            if (levelEst == "1" && prnt == "Restaurant" && isEstCompFirstLevel == "Choose Comparison Establishment/ Channel/ Time Period (Select 2)") {
                $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("");
            }
            else if (levelEst == "1" && prnt == "Restaurant") {
                $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Establishment");
            }
            //$(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text(prnt);
            //switch (levelEst) {
            //    case "1": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-1"); break;
            //    case "2": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-2"); break;
            //    case "3": if ($(this).parent().find(".lft-popup-ele-label").attr("data-val") == "Fine Dining") { $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text(prnt); } else { $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text("Subcategory-3"); } break;
            //    case "4": $(pele).find('.lft-popup-col' + (1 + +levelEst) + ' .lft-popup-col-selected-text').text(prnt); break;
            //}
        }
    }
    else if ($(pele).attr("data-val") == "Establishment" || $(pele).attr("data-val") == "Custom Base") {
        var prnt = ($(pele).find('.lft-popup-col1').attr("first-level-selection") == "Restaurants" || $(pele).find('.lft-popup-col1').attr("first-level-selection") == "Choose Main Establishment / Channel (Select 1)" ? "Restaurant" : "Retailer");
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
    else if ($(pele).attr("data-val") == "Beverage") {
        if (levelEst == "1") {
            //Is subCategory or Not
            var txt = $(this).parent().find(".lft-popup-ele-label").text().toLocaleLowerCase().trim();
            switch (txt) {
                case "category nets":
                case "detailed categories": {
                    if ($(this).parent().find(".lft-popup-ele-label ").eq(0).text().toLocaleLowerCase() == "category nets") {
                        $(pele).find('.lft-popup-col2 .lft-popup-col-selected-text').text("Subcategory-1");
                        $(pele).find('.lft-popup-col3 .lft-popup-col-selected-text').text("Subcategory-2");
                        $(pele).find('.lft-popup-col4 .lft-popup-col-selected-text').text("Subcategory-3");
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
    $(".master-lft-ctrl[data-val='Competitors'] .lft-ctrl3-content").scrollLeft(1000);
    //Special case for custom base
    if ($(pele).attr("data-val") == "Custom Base") {
        if (levelEst == "4") { $(".dashboard-custom-base .lft-ctrl3-content").css("overflow-x", "auto"); $(".dashboard-custom-base .lft-ctrl3-content").scrollLeft(1000); } else { $(".dashboard-custom-base .lft-ctrl3-content").css("overflow-x", "hidden"); }
    }
    //
    if ($(pele).attr("data-val") == "Demographic Filters" || $(pele).attr("data-val") == "Metric Comparisons" || $(pele).attr("data-val") == "Advance Filters" || $(pele).attr("data-val") == "Advanced Filters Custom Base") {
        if (levelEst == "4") { $(".master-lft-ctrl[data-val='" + mstrText + "'] .lft-ctrl3-content").css("overflow-x", "auto"); $(".master-lft-ctrl[data-val='" + mstrText + "'] .lft-ctrl3-content").scrollLeft(1000); } else { $(".master-lft-ctrl[data-val='" + mstrText + "'] .lft-ctrl3-content").css("overflow-x", "hidden"); }
    }
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

    //if ($(this).parent().text().trim() == "Demographics" || $(this).parent().text().trim() == "Demographic Filters") {
    //    $.each($(pele).find("." + "lft-popup-col2").find(".lft-popup-ele-label[data-isselectable=false]"), function (i, v) {
    //        if ($(v).text() == "Geography") {
    //            //$(v).find(".lft-popup-ele-next").addClass("disableMeasurescolor");
    //            //$(v).parent().addClass('disableMeasures');
    //        }
    //    });
    //}
    //
    ClearMeasures(mstrText, "", "", this);

    //To Hide/Show Additional Filters base on Guest/Visit toggle
    if (controllername == "dashboard_demographics" && $(this).parent().text().trim() == "Additional Filters" && level == "1") {
        var additionalFiltrs = $(pele).find(".lft-popup-col2").find(".lft-popup-ele-label[parent-text='Additional Filters']");
        $.each(additionalFiltrs, function (i, v) {
            if ($('.dashboardguest').hasClass('active')) {
                if ($(v).attr("guestorvisitfilter") == "false") {
                    $(v).parent().removeClass("awarenesshide");
                    $(v).parent().css("display", "flex");
                }
                else {
                    $(v).parent().addClass("awarenesshide");
                    $(v).parent().css("display", "none");
                }
            }
            else {
                if ($(v).attr("guestorvisitfilter") == "false") {
                    $(v).parent().addClass("awarenesshide");
                    $(v).parent().css("display", "none");
                }
                else {
                    $(v).parent().removeClass("awarenesshide");
                    $(v).parent().css("display", "flex");
                }
            }
        });
    }
    //
    if (controllername == "dashboard_demographics" && $(this).parent().text().trim() == "Frequency Filters") {
        var frequncyfiltr = $(pele).find(".lft-popup-col2").find(".lft-popup-ele-label[parent-text='Frequency Filters']");
        $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'false')
        $.each(frequncyfiltr, function (i, v) {
            if ($('.dashboardguest').hasClass('active')) {
                if ($(v).text() == "Total Visits") {
                    $(v).parent().addClass("awarenesshide");
                    $(v).parent().css("display", "none");
                    $(v).parent().attr("data-isselectable", "false");
                }

            }
            else {
                if ($(v).text() == "Total Visits") {
                    $(v).parent().addClass("awarenesshide");
                    $(v).parent().css("display", "none");
                    $(v).parent().attr("data-isselectable", "true");
                }
            }
        });
    }
    else if ($(this).parent().text().trim() == "Additional Filters" || $(this).parent().text().trim() == "Demographic Filters" && controllername == "dashboard_demographics") {
        $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'true')
    }

    customRegionsMouseHoverTitles()//Customreiongs Mouseover popup titles added by bramhanath(08-jan-2018)


    /*To add Bold and Underline for the Visit Type Additional filter */
    if ($(this).parent().text().trim() == "Visit Type") {
        //To add underline and Bold for Prominent Headers added By Bramhanath(26-05-2017)
        var listpromHeaders = $(".lft-popup-ele-label[parent-text='Visit Type']");
        var lPush = [];
        var lParendId = [];

        //To get all the list of id and name
        $.each(listpromHeaders, function (i, v) {
            $(v).parent().find(".lft-popup-ele-label-img").css("width", "0px");
            $(v).parent().find(".lft-popup-ele-label-img").css("display", "block");
            $(v).parent().find(".lft-popup-ele-label-img").css("padding-left", "0px");
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
    }
    /*To add Bold and Underline for the Visit Type Additional filter */

    if (controllername == "situationassessmentreport" && level == "1" && $(this).parent().attr('parent-of-parent') == "BenchMark")
        searchTextBoxAutoComplete("2", "establishment", searchArray, "Establishment");
    else if (controllername == "situationassessmentreport" && level == "1" && $(this).parent().attr('parent-of-parent') == "CustomBase")
        searchTextBoxAutoComplete("2", "establishment", searchArrayForCustombase, "Establishment");
});

$(document).on("click", ".lft-popup-ele-label", function (e) {

    var pele = $(this).parent().parent().parent().parent();
    if ($('.Establishment_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=BenchMark]').length == 0
                         && controllername == "situationassessmentreport" && $($(this).parent()[0]).attr('parent-of-parent') == 'CustomBase' && !isBenchMarkSelectedNew && !$(this).parent().hasClass('lft-popup-ele_active')) {
        showMaxAlert("Please select BenchMark");
        return;
    }
    // Situation Assessment  Report only--start
    if ($('.Competitors_topdiv_element .filter-info-panel-lbl').length >= 20 && $($(this).parent()[0]).attr('parent-of-parent') == 'Competitors' && !$(this).parent().hasClass('lft-popup-ele_active')) {
        showMaxAlert("You can select a min of 5 and max of 20 competitors");
        return;
    }
    if ($('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim() == "TOTAL" && ($(this).attr('data-val') == 'Previous Period' || $(this).attr('data-val') == 'Previous Year'))
        return;

    // Situation Assessment  Report --end

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

    //Only for the Report Situation Analysis
    if ($('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=CustomBase]').length == 2 && controllername == "situationassessmentreport" && !isEstdeleted) {
        if ($($(this).parent()[0]).attr('parent-of-parent') == "CustomBase" && !$(this).parent().hasClass('lft-popup-ele_active')) {
            showMaxAlert("You can make upto 2 CustomBase Selections");
            return;
        }
    }

    //

    if ($(".advance-filters").find(pele).length == 0) { leftpanelchanged = true; }
    //To make the Frequency of additionanl filter not to deselect the items in Guest Only
    var isFrequency = pele.parent().attr('data-val');
    if (controllername == 'situationassessmentreport' && isFrequency == "FREQUENCY") {
        if (isFrequency == "FREQUENCY") {
            var seleteditem = $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
            if (seleteditem == $(this).text().trim()) {
                return false;
            }
        }
    }
    else {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
            if (isFrequency == "FREQUENCY") {
                var seleteditem = $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
                if (seleteditem == $(this).text().trim()) {
                    return false;
                }
            }
            if (isFrequency == "CONSUMED FREQUENCY") {
                var seleteditem = $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
                if (seleteditem == $(this).text().trim()) {
                    return false;
                }
            }
        }
    }
    //select one level parent of selected establishment as custom base
    if (controllername == "dashboardp2pdashboard" && pele.parent().attr('data-val') == "Establishment") {
        var parentId = $(this).parent().find(".lft-popup-ele-label").attr("data-parent");
        if (parentId != "") {
            customBaseChanged = true;
            $(".dashboard-custom-base .lft-popup-ele-label[data-id=" + parentId + "]").click();
        }
        else {
            var parentText = "Total Dine";
            if (customBaseChanged) {
                $('.dashboard-custom-base .lft-popup-ele-label[data-val="' + parentText + '"]').click();
            }
        }
    }
    //select same advanced filter(establishment) as filters for custom base
    //if ($(".dashboard-customBase-advanced-filters .lft-ctrl3").css("display") == "block")
    //    pele.parent().attr('data-val',"Advanced Filters Custom Base");
    if (controllername == "dashboardp2pdashboard" && pele.parent().attr('data-val') == "Advance Filters") {
        var ElemId = $(this).parent().find(".lft-popup-ele-label").attr("data-id");
        var CustomBaseAdFilters = []; var AdvancedFilters = [];
        $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
            CustomBaseAdFilters.push($(d).attr("data-id"));
        });
        $.each($(".Advance_Filters_topdiv_element .filter-info-panel-lbl"), function (i, d) {
            AdvancedFilters.push($(d).attr("data-id"));
        });
        //if (CustomBaseAdFilters.length > AdvancedFilters.length) {
        if (delOnlyEstFilters) {
            delOnlyEstFilters = false;
        }
        else {
            CustomBaseAdFilters.forEach(function (a, b) {
                $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + a + "]").click();
            });
            AdvancedFilters.forEach(function (a, b) {
                $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + a + "]").click();
            });
            $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + ElemId + "]").click();
        }
    }

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

    //only for situation Assessment Module in Reports
    if (controllername == "situationassessmentreport") {
        if ($($(this).parent()[0]).attr('parent-of-parent') == "BenchMark")
            $($('.lft-ctrl3')[1]).attr('data-ismultiselect', false);
        else
            $($('.lft-ctrl3')[1]).attr('data-ismultiselect', true);
        if (isFrequency == "FREQUENCY")
            isFrequencyChangedForSitn = true;
        if (pele.parent().attr('data-val') == "Advance Filters")
            isdemogChangedForSitn = true;
        var isestCustCompSelected = pele.parent().attr('data-val');
        if ((isestCustCompSelected == "Establishment" || isestCustCompSelected == "Competitors" || isestCustCompSelected == "Advance Filters") && !isComptitorDefaultSelect) {
            isEstCustomChangedForSitn = true; clearOutputAreaOnlyWhenLeftPanelModified();
        }
    }
    //

    //To make the frequency  ismultiselect false for Demographics dashboard only Added by Bramhanth(4-12-2017)--Start
    if ($(this).attr("parent-text") == "Frequency Filters" && (controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard")) {
        $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'false');
    }
    else if (pele.parent().attr('data-val') == "Advance Filters" && controllername == "dashboard_demographics") {
        $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'true')
    }
        //To make the frequency  ismultiselect false for Demographics dashboard only Added by Bramhanth(4-12-2017)--End
        //to make data-multiselect true for filters other the  frequency filters---dual filters
    else if ($(this).attr("parent-text") != "Frequency Filters" && (pele.parent().attr('data-val') == "Advance Filters" || pele.parent().attr('data-val') == "Advanced Filters Custom Base") && (controllername == "dashboardp2pdashboard")) {
        $(this).parent().parent().parent().parent().attr('data-ismultiselect', 'true');
    }

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

    //To make Guests Frequency of Demographics Selection not to deselect
    var selectedVisitsorGuests = ""; var isSameFrequecncyId = false; var frequencylist = "", selctdFrequcny = "";
    if ($('.dashboardguest').hasClass('active')) {
        frequencylist = $(pele).find(".lft-popup-col2").find(".lft-popup-ele-label[parent-text='Frequency Filters']");
        selctdFrequcny = $(this).text().trim();
        var selectedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
        if (selectedTopFilterId == "8")//if frequency filter has changed from Establishment Trade area (in Brand Health Metrics Tab) to others then frequency should be carry forwared
        {
            if (selctdFrequcny != "Establishment In Trade Area" && isFrqncyInBrandHlthMtricChanged == false)
                isFrqncyInBrandHlthMtricChanged = true;
        }
        $.each(frequencylist, function (i, v) {
            if ($(v).parent().hasClass("lft-popup-ele_active")) {
                if (selctdFrequcny == $(v).text().trim())
                    isSameFrequecncyId = true;
            }
        });
        if (isSameFrequecncyId)
            return;
    }
    //if ($(this).parent().attr("parent-of-parent") == "BenchMark" && !isBenchMarkSelected)//Only  for the Situation Assessment Module 
    //    benchMarkBind(this);
    //
    if ($(this).parent().hasClass('lft-popup-ele_active')) {
        $(this).parent().removeClass("lft-popup-ele_active");
        removeSelectedPanelElement(true, this, ctrl2);
        var parentofParent = $($(this).parent()[0]).attr('parent-of-parent');
        if (parentofParent == "Competitors")
            isComptitordeleted = true;
        else if (parentofParent == "CustomBase")
            isCustomBaseDeleted = true;
        else if (parentofParent == "BenchMark")
            isEstdeleted = true;
        //}
        hideEstablishmentFromTable(removeBlankSpace($(this).text()));//dynamically adding selected Establishments or Groups or Beverages to Table

        //to push additional filters of Demographics dashboard 
        if (controllername == "dashboard_demographics" && pele.parent().attr('data-val') == "Advance Filters") {
            additionalselectedList.splice(additionalselectedList.indexOf($(this).attr("data-id")), 1);

        }
        if (controllername == "situationassessmentreport" && pele.parent().attr('data-val') == "Advance Filters" && $(this).attr("guestorvisitfilter") == "true")
            visitfiltersList.splice(visitfiltersList.indexOf($(this).attr("data-id")), 1);
        //$(this).parent().hasClass('lft-popup-ele_active')
    }
    else {
        if (controllername == "situationassessmentreport") {

            if (returnifBenchMarktCompetitorSame($(this))) return;
        }

        //get selected parent names 
        if (pele.parent().attr('data-val') == "Measures" || pele.parent().attr('data-val') == "Metric Comparisons") {
            if (validationToSelectDataWithinSameParent(this) === false)
                return;
        }
        //Custom Regions Selecting and deselecting in Demographic Filters Only
        if (pele.parent().attr('data-val') == "Demographic Filters" || pele.parent().attr('data-val') == "Advance Filters" || pele.parent().attr('data-val') == "Metric Comparisons") {
            if (validationToSelectNDeselectInSubLevels(this) === false)
                return;
        }
        //For dine reports Establishments
        if (window.location.pathname.toLocaleLowerCase().includes("report") && pele.parent().attr("data-val") == "establishment" && controllername != "situationassessmentreport") {
            if ($(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").length < 5) {
                $(this).parent().addClass("lft-popup-ele_active");
                addSelectedPanelElement(this, ctrl2);
            } else {
                showMaxAlert("Already maximum establishments selected !");
                //$(".lft-ctrl3").hide(); $(".lft-popup-col").hide();
                //reset_img_pos();$(".master-lft-ctrl").parent().css("background", "none");
            }
        } else {
            if (controllername == "situationassessmentreport" && $(this).parent().attr('parent-of-parent') == "BenchMark") {
                $('.master-lft-ctrl.Establishment').find('.lft-ctrl-txt').attr("data-ids", "");
            }
            if ($(pele).attr('data-ismultiselect') == "true") {
                //added by Nagaraju D for duplicate items
                //Date: 22-08-2017
                var selectedValue = "";
                var label = pele.parent().attr('data-val');
                var lbserachparent = "";
                if (pele.parent().attr('data-val') == "Beverage" && listofOthers.indexOf($(this).attr("data-id")) > -1) {
                    selectedValue = $(this).attr('data-parent-search-name');
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]');
                }
                else {
                    selectedValue = $(this).attr('data-val');
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]');
                }
                if (controllername == "situationassessmentreport" && pele.parent().attr('data-val') == "Advance Filters" && $(this).attr("guestorvisitfilter") == "true")
                    visitfiltersList.push($(this).attr("data-id"));

                var isItemExist = false;
                if (controllername == "situationassessmentreport" && $(this).parent().attr('parent-of-parent') == "BenchMark") {

                }
                else {
                    $(lbserachparent).each(function () {
                        if ($(this).parent().hasClass('lft-popup-ele_active')) {
                            isItemExist = true;
                            return false;
                        }
                    });
                }
                if (isItemExist) {
                    showMaxAlert("Already selected.");
                    return;
                }

                $(this).parent().addClass("lft-popup-ele_active");
            }
            else {

                if ($(pele).attr('data-ismultiselect') == "false" && $(this).attr("parent-text") == "Frequency Filters") {
                    var selClass = (isFrequency == "Advanced Filters Custom Base") ? (".dashboard-customBase-advanced-filters") : (".master-lft-ctrl.Advance.Filters");
                    var selectedFrequecny = $(selClass + " .lft-popup-col2").find(".lft-popup-ele-label[parent-text='Frequency Filters']");
                    $.each(selectedFrequecny, function (i, v) {
                        if ($(v).parent().hasClass("lft-popup-ele_active")) {
                            var element = $(v);
                            $(element).parent().removeClass("lft-popup-ele_active");
                            var ctrl2 = $(v).parent().parent().parent().parent().parent().find(".lft-ctrl2");
                            removeSelectedPanelElement(true, element, ctrl2);
                        }

                    });
                }
                else {
                    if ($(pele).find(".lft-popup-ele_active").length > 0) {
                        removeSelectedPanelElement(true, $(pele).find(".lft-popup-ele_active").children(".lft-popup-ele-label"), ctrl2);
                        $(pele).find(".lft-popup-ele").removeClass("lft-popup-ele_active");
                    }
                }

                $(this).parent().addClass("lft-popup-ele_active");
            }
            addSelectedPanelElement(this, ctrl2);

            //to push additional filters of Demographics dashboard 
            if (controllername == "dashboard_demographics" && pele.parent().attr('data-val') == "Advance Filters") {
                if (additionalfilterListVisit.indexOf($(this).attr("parent-text")) > -1 || $(this).attr("parent-text") == "Device Used")
                    additionalselectedList.push($(this).attr("data-id"));
            }
            //
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
                    if ($(".trend").hasClass("active")) {
                    }
                    else {
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
                    if ($(".trend").hasClass("active")) {
                    }
                    else {
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

        //
        if ($($(this).parent()[0]).attr('parent-of-parent') == 'Competitors' && !isComptitorDefaultSelect) {
            isComptitorAdded = true;
            isComptitordeleted = false;
        }
        else if ($($(this).parent()[0]).attr('parent-of-parent') == "CustomBase" && defaultEstCustomBaseSelections == 0 && $('.filter-info-panel-lbl[parent-of-parent=CustomBase]').length < 3) {
            isComptitordeleted = false;
            isComptitorAdded = false;
            isCustomBaseAdded = true;

        }
        else if ($($(this).parent()[0]).attr('parent-of-parent') == "BenchMark" && !isComptitorDefaultSelect) {
            isBenchMarkSelectedNew = true;
            isComptitorAdded = false;
            isCustomBaseAdded = false;

        }
    }

    //if (controllername == "dashboardp2pdashboard" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth") {
    //    $('.filter-info-panel-elements .Establishment_topdiv_element').html('');
    //    $('.filter-info-panel-elements .Demographic_Filters_topdiv_element').html('');
    //}
    if (controllername == "reportp2preport" || controllername == "reportdinerreport" || controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth" || controllername == "analysescrossDinerFrequencies" || controllername == "situationassessmentreport")
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
            $(".master-lft-ctrl[data-val='Measures']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + groups_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');

            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
            });
        }
        else if (pele.parent().attr('data-val') == "Measures") {
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + measures_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');

            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + $(element).attr('parent-text') + '"]').parent().addClass('dynamic_show_hide_charts');
            });
        }
        else if (pele.parent().attr('data-val') == "Demographic Filters") {
            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele.dynamic_show_hide_charts[child-count!='0']").css('display', 'flex');

            $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele[child-count!='0']").removeClass('dynamic_show_hide_charts');

            $(".master-lft-ctrl[data-val='Measures']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + groups_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');
            $.each($(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-ele_active .lft-popup-ele-label"), function (index, element) {
                $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele .lft-popup-ele-label[data-val='" + $(element).attr('parent-text') + "']").parent().addClass('dynamic_show_hide_charts');
                $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + $(element).attr('parent-text') + '"]').parent().addClass('dynamic_show_hide_charts');
            });

            $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + measures_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');
        }

        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + groups_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + measures_Selected_Parent + '"]').parent().addClass('dynamic_show_hide_charts');
    }
    /*groups, measures and advnce filter show and hide based on selections end by chandu*/
    ClearMeasures(isFrequency, $(this).attr("parent-text"), $(this).attr("data-parent"), this);

    //only for Dashboardp2p to check establishment got changed or not and if changed then only we need to show custom popup
    if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
        if (isFrequency == "Establishment") {
            isEstablishmentChanged = true;
            isReportInitialLoad = false;
        }
    }
    //if establishmaent is not changed and if advanced filters changed then show custom base filters popup
    if (controllername == "dashboardp2pdashboard") {
        if (isFrequency == "Advance Filters") {
            isAdvFiltersChanged = true;
        }
    }

    //
    if (controllername == "reportdinerreport" || controllername == "reportp2preport") {
        $(".report-maindiv").hide();
        $(".report-maindiv").html('');
        $(".selctall-view-downlddiv").hide();
        if (controllername == "reportdinerreport") {
            $("#p2pstatictext").hide();
            $("#p2pstatictext_diner").show();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
        }
        else {
            $("#p2pstatictext").show();
            $("#p2pstatictext_diner").hide();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
        }
        if ($("#selectallchkbx").prop("checked")) {
            $('#selectallchkbx').click();
            isReportInitialLoad = false;
        }
    }
    //

    //to updated frequency id
    if (controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") {
        var isfreqncyhasActiveCls = false;
        if ($('.dashboardvisit').hasClass('active')) {
            var frequencylist = $(pele).find(".lft-popup-col2").find(".lft-popup-ele-label[parent-text='Frequency Filters']");
            $.each(frequencylist, function (i, v) {
                if ($(v).parent().hasClass("lft-popup-ele_active")) {
                    isfreqncyhasActiveCls = true;
                }
            });
            if (isfreqncyhasActiveCls == false) {
                frequencyselectedIDforDemographics = "6";
                frequencyselectedIDforCustomBase = "6";
            }
        }


    }
    /*Start show cross button if visit @pkr*/
    if ((pele.parent().attr('data-val') == "FREQUENCY" || $(this).attr("parent-text") == "Frequency Filters") && (controllername != "reportdinerreport" && controllername != "reportp2preport")) {
        //Show/Hide
        if ($("#guest-visit-toggle.activeToggle").length == 0 || !$('.dashboardguest').hasClass('active')) {
            //for dashboard
            if (controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") {
                if ($(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .filter-info-panel-txt-del").length == 0 && ($(this).attr('data-val') != 'Total Visits')) {
                    $(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .sel_text").next().addClass("filter-info-panel-txt-del");
                }
                $(".Advance_Filters_topdiv_element .filter-info-panel-txt-del").addClass("display-inline");
            } else {
                $(".FREQUENCY_topdiv_element .filter-info-panel-txt-del").addClass("display-inline");
            }
        } else {
            //for dashboard
            if (controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") {
                $(".Advance_Filters_topdiv_element .filter-info-panel-txt-del").removeClass("display-inline");
            } else {
                $(".FREQUENCY_topdiv_element .filter-info-panel-txt-del").removeClass("display-inline");
            }
        }
    }
    /*End show cross button if visit @pkr*/

    /*to check whether quarter ending months of Parentlist is selected or not Only for Trends - start(added by bramhanath 28-03-3018)*/
    if (pele.parent().attr('data-val') == "Demographic Filters" || ($(".trend").hasClass("active") && pele.parent().attr('data-val') == "Metric Comparisons")) {
        //if (($(".trend").hasClass("active") && pele.parent().attr('data-val') == "Metric Comparisons"))
        //    isCustomregionQuarterEndingParentSelected = false;
        //else {
        checkCustomregionQuarterEndingParentSelected(pele.parent().attr('data-val'));
        timeperiodUpdate(isCustomregionQuarterEndingParentSelected);
        //}
    }

    //}
    //else {
    //    timeperiodUpdate(isCustomregionQuarterEndingParentSelected);
    //}

    /*to check whether quarter ending months of Parentlist is selected or not Only for Trends - end(added by bramhanath 28-03-3018)*/


    //to delete items for custom base filters 
    if (controllername == "dashboardp2pdashboard" && pele.parent().attr('data-val') == "Advanced Filters Custom Base") {
        var CustomBaseAdFilters = [];
        $(".CB_popup_filters_content").text('');
        $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
            CustomBaseAdFilters.push($(d).text().trim().toLowerCase());
        });
        CustomBaseAdFilters.forEach(function (filter) {
            $(".CB_popup_filters_content").append("<div class='CB_data_name'><div class='stat-cust-dot' style='width:24px;margin-top:-4px;'></div><div class='customBase_est_fil_ele'>" + filter + "</div></div");
        });
    }
    e.stopImmediatePropagation();

    //Only  for the Report Situation Assessment Module 
    if (pele.parent().attr('data-val') == "FREQUENCY") {

    }
    else {
        if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'Competitors' && isComptitordeleted) {
            bindCompetitorsListWhenDeleted($(this));
        }
        else if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'Competitors' && isComptitorAdded) {
            bindCompetitorsListWhenAdded($(this));
        }
        else if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'CustomBase' && isCustomBaseDeleted) {
            bindCustomBaseListWhenDeleted($(this));
        }
        else if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'CustomBase' && isCustomBaseAdded) {
            bindCustomBaseListWhenAdded($(this));
        }
        else if (controllername == 'situationassessmentreport' && establishmentSelectedCount < 3 && !isBenchMarkSelected && !isEstdeleted && !isCompetitorLoop && pele.parent().attr('data-val') != "Advance Filters" && pele.parent().attr('data-val') != "Demographic Filters") {
            benchMarkBind(this);
        }
        else if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'BenchMark' && isEstdeleted) {
            bindbenchMarkBindWhenDeleted(this);
        }
        else if (controllername == 'situationassessmentreport' && $($(this).parent()[0]).attr('parent-of-parent') == 'BenchMark' && isBenchMarkSelectedNew) {
            bindNewBenchMarkDeleteOldList(this);
        }
    }

    //
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
                    ID: $(key).attr('data-id'), Text: $(key).text(), ParentOfParent: $(key).parent().attr('parent-of-parent')
                })
            });
            $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

            $(ctrl2).find(".lft-ctrl-txt").html('');
            if ($(".filter-info-panel").is(":visible")) {
                var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                if (topdivele != "Custom_Base_topdiv_element") {
                    if ($(".filter-info-panel ." + topdivele).length != 0) {
                        $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + " : 
                    }
                }
            }
            var selctedIndexslist = 0;
            $(selectedeleids).each(function (i, d) {
                if (d != null && d != undefined && d != {} && d != []) {
                    var ele = $("<div class='lft-ctrl-txt-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%;'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>&nbsp;</span></div>");//<span class='lft-ctrl-txt-del' style='float:right;'>x</span>
                    if ($(".filter-info-panel").is(":visible")) {

                        if (controllername == "dashboard_demographics" && frequencycheckToPrepareFilter.indexOf(JSON.parse(d).Text.toLocaleLowerCase()) > -1) {
                            if (selctedIndexslist == 0) {
                                if (JSON.parse(d).Text == "Total Visits")
                                    $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;display:none;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                                else
                                    $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                            } else {
                                if (JSON.parse(d).ID != undefined)
                                    if (JSON.parse(d).Text == "Total Visits")
                                        $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;display:none;'>&nbsp</span><span style='float:left;display:none;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                                    else
                                        $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                            }
                        }
                        else {
                            if (selctedIndexslist == 0) {
                                if (topdivele == "CONSUMED_FREQUENCY_topdiv_element")
                                { $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>")); }
                                else
                                    $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                            } else {
                                if (JSON.parse(d).ID != undefined) {
                                    if (controllername == "situationassessmentreport" && JSON.parse(d).ParentOfParent == "CustomBase" && i == 1)
                                        $(".filter-info-panel ." + topdivele).append($("<span class=pipe> | </span> <div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));
                                    else
                                        $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                                }
                            }
                        }
                        selctedIndexslist++;
                    }

                    $(ctrl2).find(".lft-ctrl-txt").append(ele);
                }
            });
            $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
                $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
            });
            //to hide the frequency in breadcrum when total visits is selected
            if (controllername == 'situationassessmentreport') {
                $('.FREQUENCY_topdiv_element').show();
                if (topdivele == "Establishment_topdiv_element") {
                    $($('.Establishment_topdiv_element .pipe')[0]).text(" | Main Establishment : ");
                    $($('.Establishment_topdiv_element .pipe')[1]).text(" | Comparision Establishment : ");
                }
                if (topdivele == "Competitors_topdiv_element") { $('.Competitors_topdiv_element .pipe').text(" | Competitors : ") }
            }
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
        ID: $(key).attr('data-id'), Text: $(key).text(), ParentOfParent: $(key).parent().attr('parent-of-parent')
    }));
    if ($(key).parent().parent().parent().parent().parent().attr('data-val') == "Demographic Filters") {
        if (customRegionsParentLstQuarenterEdmnts.indexOf($(key).attr("parent-text")) > -1) {
            isCustomregionQuarterEndingParentSelected = true;
        }
        else
            isCustomregionQuarterEndingParentSelected = false;
    }
    else {
        //only for Group/Metric selections in trend of the year or Bianual or quarterly basis order added by bramhanath (13-04-2018)
        if ($(key).parent().parent().parent().parent().parent().attr('data-val') == "Metric Comparisons") {
            if (customRegionsParentLstQuarenterEdmnts.indexOf($(key).attr("parent-text")) > -1) {
                if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf($(key).attr("parent-text")) == -1)
                    checkForHighestPrecedingOrderofCustmRegnsInTrend.push($(key).attr("parent-text"));
            }
        }
        else {
            checkForHighestPrecedingOrderofCustmRegnsInTrend = [];
        }

        isCustomregionQuarterEndingParentSelected = false;
    }


    $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

    $(ctrl2).find(".lft-ctrl-txt").html('');
    //find topdiv panel is there are not, if not there create it
    if ($(".filter-info-panel").is(":visible")) {
        var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
        if ($(".filter-info-panel ." + topdivele).length == 0) {
            $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
        }
        //only for Demographics dashboard
        if (controllername == "dashboard_demographics") {
            $(selectedeleids).each(function (i, d) {
                if (d != null && d != undefined && d != {} && d != []) {
                    if (JSON.parse(d).Text != "Total Visits")
                        $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");
                }
                else
                    $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");
            });

        }
        else
            $(".filter-info-panel ." + topdivele).html("<span class='pipe'> |&nbsp </span>");//" + $(ctrl2).parent().attr('data-val') + "}
        //
    }

    var selctedIndexslist = 0;
    $(selectedeleids).each(function (i, d) {
        if (d != null && d != undefined && d != {} && d != []) {
            var ele = $("<div class='lft-ctrl-txt-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>&nbsp;</span></div>");//<span class='lft-ctrl-txt-del' style='float:right;'>x</span>

            //for showing data in additional place/panel
            if ($(".filter-info-panel").is(":visible")) {

                if (controllername == "dashboard_demographics" && frequencycheckToPrepareFilter.indexOf(JSON.parse(d).Text.toLocaleLowerCase()) > -1) {
                    if (selctedIndexslist == 0) {
                        if (JSON.parse(d).Text == "Total Visits")
                            $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;display:none;' class='sel_text'>" + JSON.parse(d).Text + "</span><span  style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                        else
                            $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span  style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                    } else {
                        if (JSON.parse(d).ID != undefined) {
                            if (JSON.parse(d).Text == "Total Visits")
                                $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;display:none;'>&nbsp</span><span style='float:left;display:none;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                            else
                                $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                        }
                    }
                }
                else {
                    if (selctedIndexslist == 0) {
                        if (topdivele == "CONSUMED_FREQUENCY_topdiv_element")
                        { $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;display:none;'>&nbsp;</span></div>")); }
                        else
                            $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));//<span class='filter-info-panel-txt-del' style='float:right;'>x</span>
                    } else {
                        if (JSON.parse(d).ID != undefined) {
                            if (controllername == "situationassessmentreport" && JSON.parse(d).ParentOfParent == "CustomBase" && i == 1)
                                $(".filter-info-panel ." + topdivele).append($("<span class=pipe> | </span> <div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));
                            else
                                $(".filter-info-panel ." + topdivele).append($("<div class='filter-info-panel-lbl' data-val='" + JSON.parse(d).Text + "' parent-of-parent='" + JSON.parse(d).ParentOfParent + "' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>&nbsp</span><span style='float:left;' class='sel_text'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>&nbsp;</span></div>"));
                        }
                    }
                }
                selctedIndexslist++;
            }
            $(ctrl2).find(".lft-ctrl-txt").append(ele.clone());
            if (isAdditionalFilterLoaded == true || controllername == "tableestablishmentdeepdive" || controllername == "tablebeveragedeepdive" || controllername == "analysesestablishmentdeepdive") {
                hideAndShowSelectedValuesFromDemoInDeepDiveView(key, ctrl2);
            }
            if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive") {
                hideAndShowSelectedValuesFromDemoInDeepDiveView(key, ctrl2);
            }
        }
    });

    //to hide the frequency in breadcrum when total visits is selected
    if (controllername == 'situationassessmentreport') {
        $('.FREQUENCY_topdiv_element').show();
        if (topdivele == "Establishment_topdiv_element") {
            $($('.Establishment_topdiv_element .pipe')[0]).text(" | Main Establishment : ");
            $($('.Establishment_topdiv_element .pipe')[1]).text(" | Comparision Establishment : ");
        }
        if (topdivele == "Competitors_topdiv_element") { $('.Competitors_topdiv_element .pipe').text(" | Competitors : ") }
    }
    else {
        if ($(".FREQUENCY_topdiv_element.topdiv_element").find(".filter-info-panel-lbl").attr("data-id") == "6" || isTotalUsPopulation == "Establishment Frequency (Base: Total US Population)")
            $('.FREQUENCY_topdiv_element').hide();
        else
            $('.FREQUENCY_topdiv_element').show();
    }

    //

    $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
        $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
    });
    if (topdivele == "Custom_Base_topdiv_element") { $(".Custom_Base_topdiv_element .pipe").text(" |  Custom Base : "); }
    if (topdivele == "CONSUMED_FREQUENCY_topdiv_element") { $(".CONSUMED_FREQUENCY_topdiv_element .pipe").text(" |  Consumed Frequency : "); }
    //$('.filter-info-selected-elmnts').append($('.filter-info-panel-elements').html());

    //arrange breadcrum div elements in p2p dashboard
    if (controllername == "dashboardp2pdashboard") {
        $(".Establishment_topdiv_element").insertAfter(".Time_Period_topdiv_element");
        $(".Advance_Filters_topdiv_element").insertAfter(".Establishment_topdiv_element");
        $(".Custom_Base_topdiv_element").insertAfter(".Advance_Filters_topdiv_element");
        $(".Advanced_Filters_Custom_Base_topdiv_element").insertAfter(".Custom_Base_topdiv_element");
    }
}

//report situation analysis delete click from left panel
$(document).on('click', '.filter-info-panel-txt-del-sitn', function (e) {
    var selectedId = $(this).parent().attr('data-id');
    isFromLeftPanelDelete = true;
    $('.topdiv_element .filter-info-panel-lbl[data-id=' + selectedId + ']').find('.filter-info-panel-txt-del').click();
    isFromLeftPanelDelete = false;
});
//
$(document).on('click', '.filter-info-panel .filter-info-panel-txt-del, .filter-info-panel-txt-del', function () {
    var flt = $(this).parent().parent().attr("data-val");
    if ($(".dashboard-custom-base .lft-ctrl3").css("display") == "block") {
        //var showCustomBase = true;
    }
    else if ($(".dashboard-customBase-advanced-filters .lft-ctrl3").css("display") == "block") {
        //var showCustomBaseAdFilters = true;
    }
    else {
        if (!isFromLeftPanelDelete) {
            $(".lft-popup-col").hide();
            $(".lft-ctrl3").hide();
            $(".transparentBG-for-p2p").hide();
        }

    }
    if (!isFromLeftPanelDelete) {
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");
    }

    $(".master-lft-ctrl").parent().removeClass("backgroundClradd").removeClass("backgroundClsnone");
    $(this).parent().parent().parent().removeClass("backgroundClsnone").removeClass("backgroundClradd");
    $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").addClass("backgroundClsnonenew")
    if (controllername == "reportdinerreport" || controllername == "reportp2preport") {
        $(".report-maindiv").hide();
        $(".report-maindiv").html('');
        $(".selctall-view-downlddiv").hide();
        if (controllername == "reportdinerreport") {
            $("#p2pstatictext").hide();
            $("#p2pstatictext_diner").show();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
        }
        else {
            $("#p2pstatictext").show();
            $("#p2pstatictext_diner").hide();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
        }
        if ($("#selectallchkbx").prop("checked")) {
            $('#selectallchkbx').click();
            isReportInitialLoad = false;
        }
    }

    if (flt == "CONSUMED FREQUENCY" || flt == "FREQUENCY" || (flt == "Advance Filters" && (controllername == "dashboardp2pdashboard")) || (flt == "Advanced Filters Custom Base" && (controllername == "dashboardp2pdashboard"))) {// || controllername == "dashboard_demographics"))
        if (flt == "FREQUENCY" || flt == "Advance Filters" || flt == "Advanced Filters Custom Base") {
            /*Start apply delete func for grequency in visit @pkr*/
            //If visit
            if ($("#guest-visit-toggle.activeToggle").length == 0 || !$('.dashboardguest').hasClass('active')) {
                //If not total visit && not reports
                if (controllername != "reportdinerreport" && controllername != "reportp2preport") {
                    var pele = $(this).parent().parent();
                    var peleVal = $(pele).attr('data-val');
                    var ptxt = $(this).parent().find(".sel_text").text();//.slice(0, -1);
                    if (ptxt != "Total Visits") {
                        var isdeleted = false;
                        $(".master-lft-ctrl").each(function (i, e) {
                            if ($(e).attr('data-val') == peleVal) {
                                $(e).find(".lft-ctrl2").find(".lft-ctrl-txt-lbl").each(function (i, ele) {
                                    if (ptxt == $(ele).text().slice(0, -1)) {
                                        delOnlyEstFilters = true;
                                        $(ele).find(".lft-ctrl-txt-del").click();
                                        isdeleted = true;
                                        return;
                                    }
                                });
                            }
                            if (isdeleted)
                                return;
                        });
                    }
                }
            }
            /*End apply delete func for grequency in visit @pkr*/
        }
    } else {
        var pele = $(this).parent().parent();
        var peleVal = $(pele).attr('data-val');
        var ptxt = $(this).parent().find(".sel_text").text();//.slice(0, -1);
        var isdeleted = false;
        $(".master-lft-ctrl").each(function (i, e) {
            if ($(e).attr('data-val') == peleVal) {
                $(e).find(".lft-ctrl2").find(".lft-ctrl-txt-lbl").each(function (i, ele) {
                    if (ptxt == $(ele).text().slice(0, -1)) {
                        if (controllername == "situationassessmentreport" && ($(ele).attr('parent-of-parent') == "CustomBase")) {
                            isCustomBaseDeleted = true;
                        }
                        else if (controllername == "situationassessmentreport" && ($(ele).attr('parent-of-parent') == "Competitors")) {
                            isComptitordeleted = true;
                        }
                        else if (controllername == "situationassessmentreport" && ($(ele).attr('parent-of-parent') == "Establishment")) {
                            isEstdeleted = true;
                            //establishmentSelectedCount--;
                        }
                        $(ele).find(".lft-ctrl-txt-del").click();

                        //only for the Report Situation Analysis module
                        if (controllername == "situationassessmentreport") {
                            isEstdeleted = false; isComptitordeleted = false, isCustomBaseDeleted = false;
                            if ($('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=BenchMark]').length == 0) {
                                deleteCustomBaseifBenchmMarkZero();
                                deleteCompetitorWholeList();
                            }
                            //
                        }

                        isdeleted = true;
                        return;
                    }
                });
            }
            if (isdeleted)
                return;
        });
    }
    /*Special Case for deletion of Aditional filters in Dashboard*/
    if ((controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") && flt == "Advance Filters") {
        //append class to frequency item if it is visit
        if ($(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .filter-info-panel-txt-del").length == 0 && ($(this).attr('data-val') != 'Total Visits')) {
            $(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .sel_text").next().addClass("filter-info-panel-txt-del");
            $(".Advance_Filters_topdiv_element .filter-info-panel-txt-del").addClass("display-inline");
        }
    }

});

$(document).ready(function () {

    $('.lft-popup-ele-custom-tooltip-icon').prevAll(".lft-popup-ele-label").addClass('lft-popup-ele-label-tooltip-sibling');

    if (controllername == "situationassessmentreport") {
        if ($($(this).parent().parent()[0]).attr("data-val") == "Establishment" || $($(this).parent().parent()[0]).attr("data-val") == "Competitors") {
            $(".lft-popup-col2").find(".lft-popup-col-search").css("visibility", "visible");
            $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "hidden");
        }
    }
    else {
        $(".lft-popup-col1").find(".lft-popup-col-search").css("visibility", "visible");
        $(".lft-popup-col2").find(".lft-popup-col-search").css("visibility", "hidden");
    }
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
        if (controllername != "dashboardp2pdashboard" && controllername != "dashboard_demographics") {
            clearAdvanceFilters();//To clear Advance Filter Selections
            clearOutputData();//To clear output data
        }
        if ($('.pit').hasClass('active')) {
            $(".pit").removeClass("active");
            $(".trend").addClass("active");
            if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics")
            { }
            else
                $(".trend").first().trigger('click');
            changeMeasuresIsMultiSelectProperty("trend");
            hideAndShowFilterOnPitTrend("trend");
            $(".table-statlayer").show();
        } else {
            $(".trend").removeClass("active");
            $(".pit").addClass("active");
            if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics")
            { }
            else
                $(".pit").first().trigger('click');
            changeMeasuresIsMultiSelectProperty("pit");
            hideAndShowFilterOnPitTrend("pit");
        }
        //To display stattest in dashboard
        if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics" || controllername == "dashboardvisits" || controllername == "dashboardbrandhealth") {
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

        //resetting startcolor and stopcolor to default
        colorColumnStop = ["#AE192C", "#2E6878", "#936C0D", "#037C37", "#4D1F77", "#515151", "#820A0B", "#0A517C", "#C5790F", "#818284", "#000000", "#ffffff", "#e55330", "#875288", "#f89e16", "#69898d", "#988878", "#d8cec2", "#faba3a", "#c94c26", "#352414", "#67ac53", "#5f78a4"];
        colorColumnStart = ["#E41E2B", "#31859C", "#FFC000", "#00B050", "#7030A0", "#7F7F7F", "#C00000", "#0070C0", "#FF9900", "#D2D9DF", "#000000", "#838C87", "#83E5BB", "#cccccc", "#b42c14", "#643160", "#be6e14", "#406462", "#605f4f", "#a3978b", "#c08617", "#9d270e", "#170909", "#368130", "#378574"];

    });

    //For Demographics Dashboard visit/Guest slider
    $(".guest-visit-slider").click(function () {
        //$(".loader, .transparentBG").show();

        if ($('.dashboardguest').hasClass('active')) {
            $(".dashboardguest").removeClass("active");
            $(".dashboardvisit").addClass("active");
        }
        else {
            $(".dashboardvisit").removeClass("active");
            $(".dashboardguest").addClass("active");
        }



        //To append Guest/Visit Text in breadcrum Added by Bramhanath(15-11-2017)
        var selectedVisitsorGuests = "";
        if ($('.dashboardguest').hasClass('active'))
            selectedVisitsorGuests = 'GUEST';
        else
            selectedVisitsorGuests = 'VISITS';

        if ($($(".filter-info-panel-elements")[0]).find(".Guest_Visit").length == 0)
            $(".filter-info-panel-elements").prepend("<div class='Guest_Visit topdiv_element' data-val = 'Guest_or_Visits'><div class='filter-info-panel-lbl'> <span class='left'> " + selectedVisitsorGuests + " </span></div><span class='pipe'>| </span></div>");
        else
            $(".Guest_Visit .filter-info-panel-lbl").html("<span class='left'> " + selectedVisitsorGuests + "</span>");

        //
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");

        //To clear additional filters based on Guest/Visit in Demographic Dashboard
        var selectedAdditionalFiltr = $(".master-lft-ctrl[data-val='Advance Filters'] .lft-popup-ele_active .lft-popup-ele-label");
        $.each(selectedAdditionalFiltr, function (i, v) {
            if (selectedVisitsorGuests == "VISITS") {
                if (additionalfilterListGuest.indexOf($(v).attr("parent-text")) > -1) {
                    var element = $(v);
                    $(element).parent().removeClass("lft-popup-ele_active");
                    var ctrl2 = $(v).parent().parent().parent().parent().parent().find(".lft-ctrl2");
                    removeSelectedPanelElement(true, element, ctrl2);
                }
            }
            else {
                if (additionalfilterListVisit.indexOf($(v).attr("parent-text")) > -1) {
                    var element = $(v);
                    $(element).parent().removeClass("lft-popup-ele_active");
                    var ctrl2 = $(v).parent().parent().parent().parent().parent().find(".lft-ctrl2");
                    removeSelectedPanelElement(true, element, ctrl2);
                }
            }

        });
        //

        //To clear frequency depending on visits/guests
        var selectedFrequecny = $(".lft-popup-col2").find(".lft-popup-ele-label[parent-text='Frequency Filters']")
        if (selectedVisitsorGuests == "VISITS") {
            $.each(selectedFrequecny, function (i, v) {
                if ($(v).parent().hasClass("lft-popup-ele_active")) {
                    var element = $(v);
                    $(element).parent().removeClass("lft-popup-ele_active");
                    var ctrl2 = $(v).parent().parent().parent().parent().parent().find(".lft-ctrl2");
                    removeSelectedPanelElement(true, element, ctrl2);
                }
                if ($(v).text() == "Total Visits") {
                    $(v).click();
                }

            });

        }
        else {
            $.each(selectedFrequecny, function (i, v) {
                if ($(v).parent().hasClass("lft-popup-ele_active")) {
                    var element = $(v);
                    $(element).parent().removeClass("lft-popup-ele_active");
                    var ctrl2 = $(v).parent().parent().parent().parent().parent().find(".lft-ctrl2");
                    removeSelectedPanelElement(true, element, ctrl2);
                }
                if ($(v).text() == "Monthly+") {
                    $(v).click();
                }
            });
        }
        callSubmitBtn();//to call Submit button in demographics dashboard from js
    });
    //

    $(".lft-ctrl3-header span").unbind().click(function () {
        $(".master-lft-ctrl").parent().css("background", "none");
        $(".master-lft-ctrl").parent().removeClass("backgroundClradd").removeClass("backgroundClsnone");
        $(this).parent().parent().parent().removeClass("backgroundClsnone").removeClass("backgroundClradd");
        $(this).parent().parent().hide();
        $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").addClass("backgroundClsnonenew")
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
        $(".master-lft-ctrl").parent().css("background", "none");
        $(this).parent().parent().parent().css("border", "none");
        $(".master-lft-ctrl").parent().removeClass("backgroundClradd").removeClass("backgroundClsnone");
        $(this).parent().parent().parent().removeClass("backgroundClsnone").removeClass("backgroundClradd");
        $(".master-lft-ctrl[popup-type='advanceFilters']").parent().removeClass("backgroundClradd").addClass("backgroundClsnonenew");
        if ($(".dashboard-custom-base .lft-ctrl3").css("display") == "block") {
            //var showCustomBase = true;
        }
        else if ($(".dashboard-customBase-advanced-filters .lft-ctrl3").css("display") == "block") {
            //var showCustomBaseAdFilters = true;
        }
        else {
            $(".lft-ctrl3").hide();
            $(".lft-popup-col").hide();
        }
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
        //$('.dashboard-custom-base').hide();
        // $('.transparentBG-for-p2p').hide();
    });

    $(".lft-popup-tp").click(function () {
        isSampleSizeValidated = 0; isCrossDinerSubmitClicked = false;
        customregncurrentTimeperioddatavalForTrend = JSON.parse($(this).attr('data-val'));
        customregnkeycurrentValueTimeperiodForTrend = $(this);
        time = JSON.parse($(this).attr('data-val'));
        var label = [];
        $.each(time, function (i, v) {
            label.push(v.Text);
        });
        var pele = $(this).parent().parent().parent().parent().find(".lft-ctrl-txt");
        var ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[time.length - 1].Text + "</span></div>");

        if ($(this).hasClass("lft-popup-tp-active"))
            ;//do nothing
        else {
            if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
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
        if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
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
                        clearSelectedCustomRegions();//to clear customregions selections
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

                        if (isCustomregionQuarterEndingParentSelected && false || false && checkForHighestPrecedingOrderofCustmRegnsInTrend.length > 0) {

                            if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("States") > -1 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("DMA Regions") > -1
                                                             || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Albertson's/Safeway Trade Areas") > -1
                                                             || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("HEB Trade Areas") > -1
                                                             || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Kroger Trade Areas") > -1
                                                             || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Publix Trade Areas") > -1) {
                                if (time[xi].Text.split(" ")[1] == "Dec") {
                                    tpd.push(JSON.stringify(time[xi]));
                                    trendTpList.push(time[xi]);
                                }
                            }
                            else if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Circle K Trade Areas") > -1) {
                                if (onlyforBiannualMonth.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                                    tpd.push(JSON.stringify(time[xi]));
                                    trendTpList.push(time[xi]);
                                }
                            }
                            else if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Trade Areas") > -1 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Bottler Regions") > -1) {

                                if (customregionsqtrEndingmntsTrend.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                                    tpd.push(JSON.stringify(time[xi]));
                                    trendTpList.push(time[xi]);
                                }
                            }
                            else if (isCustomregionQuarterEndingParentSelected) {
                                if (customregionsqtrEndingmntsTrend.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                                    tpd.push(JSON.stringify(time[xi]));
                                    trendTpList.push(time[xi]);
                                }
                                else if (timePeriodType == "QUARTER" || timePeriodType == "YEAR") {
                                    tpd.push(JSON.stringify(time[xi]));
                                    trendTpList.push(time[xi]);
                                }

                            }
                            else {
                                tpd.push(JSON.stringify(time[xi]));
                                trendTpList.push(time[xi]);
                            }
                        }
                        else {
                            tpd.push(JSON.stringify(time[xi]));
                            trendTpList.push(time[xi]);
                        }
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
                        isCustomregionQuarterEndingParentSelected = false;
                        if ($('.trend').hasClass('active')) {
                            startValue = ui.values[0];
                            endValue = ui.values[1];
                        }
                        prepareTp(ui.values[0], ui.values[1]);
                        emptyTableoutputWithSelectedColumns();
                        clearSelectedCustomRegions();
                    },
                    change: function (event, ui) {
                        //
                        if ($('.trend').hasClass('active')) {
                            startValue = ui.values[0];
                            endValue = ui.values[1];
                        }
                        isSampleSizeValidated = 0;
                        isCustomregionQuarterEndingParentSelected = false;
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

        //Only situation Assessment Report
        if (controllername == "situationassessmentreport") {
            removePreviousPeriodYear();//if Total Time period selected we should remove previous period and previous year from left panel selections
            clearOutputAreaOnlyWhenLeftPanelModified();
        }
        //

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

        if (IsPostCall == "false") {
            window.location.href = appRouteUrl + "Logon/Home"
        }
        else {
            //var page1 = "<%= System.Configuration.ConfigurationManager.AppSettings['KIMainlink'].ToString() %>";
            //var page = '@System.Configuration.ConfigurationManager.AppSettings["KIMainlink"].ToString()';
            GoToKIHomePage(kiLoginURL, SSOUrl, SSOLogOut);//http://localhost:52648/
        }

    });
    $(".settings-logo").click(function () {
        //$("#settings-container").show();
        localStorage.setItem("isAlreadyShown", "null");
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
            custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt popup1" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
            //custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt">' + v.Text.replace(/^,/, '') + '</div></div>';
        });
        $(".stat-content").append(custmHtml);
        SetScroll($(".stat-content"), "#ffffff", 0, 0, 5, 0, 8);
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
                custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt popup1" data-val="' + $(v).find(".sel_text").text().replace(/^,/, '') + '"  data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
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
        $(".transparentBG-for-p2p").hide();
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

    customRegionsMouseHoverTitles();//Custom Regions Mouse Hover title popup added by Bramhanath(05-01-2017) -- Start

    $('.lft-ctrl3-content').scroll(function () {
        //$(".lft-popup-col").getNiceScroll().resize();
        SetScroll($(".master-lft-ctrl .lft-popup-col"), "rgba(0,0,0,.75)", -10, -5, 0, 14, 8)
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
        if ($(this).attr('data-val') == 'Advanced Filters Custom Base')
            isFrequencyForCBFilters = true;
        else
            isFrequencyForCBFilters = false;
        if ($(this).css("display") != "none" || $(".Advanced_Filters_Custom_Base_topdiv_element").text() != "") {
            if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
                if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                    showMaxAlert($(this).find(".lft-ctrl-label span").text() + " is required. Please select."); reset_img_pos(); $(".transparentBG").hide(); $(".transparentBG-for-p2p").hide(); $(".loader").hide();
                    isvalid = false;
                    return isvalid;
                }
            }
            if (txt != null && txt != undefined && txt.length > 0) {
                var data = []; var IDs = '';
                $(String(txt).split('|')).each(function (x, d) {
                    if (controllername == "dashboard_demographics" || controllername == "dashboardp2pdashboard") {
                        if (frequencycheckToPrepareFilter.indexOf(JSON.parse(d).Text.toLocaleLowerCase()) > -1 && d != null && d != '' && !isFrequencyForCBFilters)
                            frequencyselectedIDforDemographics = JSON.parse(d).ID;
                        else if (isFrequencyForCBFilters && frequencycheckToPrepareFilter.indexOf(JSON.parse(d).Text.toLocaleLowerCase()) > -1) {
                            frequencyselectedIDforCustomBase = JSON.parse(d).ID;
                        }
                        else {
                            //if (additionalselectedList.indexOf(JSON.parse(d).ID) > -1 && d != null && d != '') {
                            //    if (d != null && d != '')
                            //        dataforDemodashbord.push(JSON.parse(d));
                            //    if (IDsDemo == null || IDsDemo == "")
                            //        IDsDemo = JSON.parse(d).ID;
                            //    else
                            //        IDsDemo += "|" + JSON.parse(d).ID;
                            //}
                            //else {

                            if (d != null && d != '')
                                data.push(JSON.parse(d));
                            if (IDs == null || IDs == "")
                                IDs = JSON.parse(d).ID;
                            else
                                IDs += "|" + JSON.parse(d).ID;
                            //}
                        }

                    }
                    else {
                        if (d != null && d != '')
                            data.push(JSON.parse(d));
                        if (IDs == null || IDs == "")
                            IDs = JSON.parse(d).ID;
                        else
                            IDs += "|" + JSON.parse(d).ID;
                    }
                });

                if ($(this).find(".lft-ctrl-label span").text() == "Time Period") {
                    var activeId = $(".lft-popup-tp-active").text();
                    var tempTp_data = ($(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text().trim()).split(" to ");
                    var tp_data = [];
                    tempTp_data.forEach(function (d, i) {
                        tp_data.push({ Text: d });
                    });
                    if (controllername != "dashboardp2pdashboard" && controllername != "dashboard_demographics") {
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
        }
    });
    $("#master-btn").attr('data-val', JSON.stringify(getTopAdvanceFilterId(fil)));
    $("#master-btn").attr('data-val', JSON.stringify(getCustomBaseFrequencyFilter(fil)));//for custombase frequencyfilter in p2p dashboard
    $("#master-btn").attr('data-val', JSON.stringify(getSelectedStatTestText(fil)));//To get selected Stattest 
    $("#master-btn").attr('data-val', JSON.stringify(getSelectedRestaruntorRetailers(fil)));//Only For Cross Diner Frequencies In Correspondence 
    $("#master-btn").attr('data-val', JSON.stringify(getSelectedFrequecnyFlter(fil)));//for Demographics Dashboard only 
    $("#master-btn").attr('data-val', JSON.stringify(getVisitsorGuests(fil)));//for Demographics Dashboard only 
    //$("#master-btn").attr('data-val', JSON.stringify(getSelectedadditionalfilterForDemogdash(fil)));//for Demographics Dashboard only  filterPanelInfo.filter.push({
    $("#master-btn").attr('data-val', JSON.stringify(getselectSkeworHigh(fil)));
    return isvalid;
}

var searchFunctionality = function (ele, level) {
    var label = $(ele).attr("data-val");
    var labelID = removeBlankSpace(label);
    var elementArray = "";
    if (controllername == "chartestablishmentdeepdive" || controllername == "chartbeveragedeepdive") {
    }
    if (controllername == 'situationassessmentreport' && label == 'FREQUENCY') {
        //$($(".lft-popup-ele [data-val='Total Visits']")[0]).attr('data-isselectable', true);
        elementArray = $(".master-lft-ctrl[data-val='" + label + "'] div[style*='display: block']").parent(".master-lft-ctrl[data-val='" + label + "']").find(".lft-popup-ele-label[data-isselectable=true]");
    }
    else
        elementArray = $(".master-lft-ctrl[data-val='" + label + "']").find(".lft-popup-ele-label[data-isselectable=true]");
    var searchlevel = parseInt(level) + 1;
    searchArray = [];
    searchArrayForCustombase = [];//this array is only for the Custombase in SituationAssessmentReport
    var hideArray = [];
    var advanceIndex = [];
    //added by Nagaraju for hiding disabled measures
    //Date:22-08-2017
    disabledMeasures = [];

    data_index = parseFloat($(ele).attr("data-index"));
    timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();
    var monthonly = $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text();
    var monthofYTD = "";
    if (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")
        monthofYTD = monthonly.split(" ")[1];
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
            var GroupselementArray = $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[parent-text="' + parentText + '"]')
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

                        //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                        //{
                        //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                        //    }
                        //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthofYTD != "Dec") {

                        //        //}
                        //    else {
                        //        if (validateForCustomRegionBasedonTimePeriod(obj, parentText) == false)
                        //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        //    }
                        //}
                        if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                        {

                            if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                        else {
                            if (hideArray.indexOf(obj.Text) == -1 && measureSelection.trim().toUpperCase() != obj.ParentText.trim().toUpperCase()
                                && groupSelection.trim().toUpperCase() != obj.ParentText.trim().toUpperCase() && advanceIndex.indexOf(obj.ParentText) == -1 && (obj.Text != "Total US" || (obj.Text == "Total US" && label == "Metric Comparisons")))
                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                    }
                }
            }

        } else {
            var parentText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").find(".lft-popup-ele-label").first().attr("parent-text");
            var GroupselementArray = $(".master-lft-ctrl[data-val='Measures']").find('.lft-popup-ele-label[parent-text="' + parentText + '"]')
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
                        //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                        //{
                        //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                        //    }
                        //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthonly != "Dec") {
                        //        //}
                        //    else {
                        //        if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                        //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        //    }
                        //}
                        if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                        {

                            if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                        }
                        else {
                            if (hideArray.indexOf(obj.Text) == -1 && (obj.Text != "Total US" || (obj.Text == "Total US" && label == "Metric Comparisons"))) {
                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            }
                        }

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
                            //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                            //{
                            //    if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                            //        searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            //}
                            if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                            {

                                if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                    searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            }
                            else
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
                            //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                            //{
                            //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                            //    }
                            //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthonly != "Dec") {
                            //        //}
                            //    else {
                            //        if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                            //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            //    }
                            //}
                            if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                            {

                                if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                    searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            }
                            else {
                                searchArray.push({ label: obj.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                            }
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
                            if (controllername == "dashboard_demographics") {
                                if (obj.ParentText == "Frequency Filters" && obj.Text == "Total Visits" && $('.dashboardguest').hasClass('active'))
                                { }
                                else
                                {

                                    if ($('.dashboardguest').hasClass('active')) {
                                        if (additionalfilterListVisit.indexOf(obj.ParentText) > -1)
                                        { }
                                        else
                                            //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                                            //{
                                            //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                                            //    }
                                            //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthonly != "Dec") {
                                            //        //}
                                            //    else {
                                            //        if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                                            //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            //    }
                                            //}
                                            if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                                            {

                                                if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                                    searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            }
                                            else {
                                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            }
                                    }
                                    else {
                                        if (additionalfilterListGuest.indexOf(obj.ParentText) > -1)
                                        { }
                                        else
                                            //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                                            //{
                                            //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                                            //    }
                                            //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthonly != "Dec") {
                                            //        //}
                                            //    else {
                                            //        if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                                            //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            //    }
                                            //}
                                            if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                                            {

                                                if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                                    searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            }
                                            else {
                                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            }
                                    }
                                }
                            }
                            else {
                                if ((controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive" || controllername == "chartbeveragecompare" || controllername == "chartbeveragedeepdive") && left_Menu_Data[data_index].Label == "Beverage") {
                                    if (obj.SearchName != null && obj.SearchName != '') {
                                        if (listofOthers.indexOf(obj.ID) > -1)
                                            searchArray.push({ label: obj.SearchName, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                        else
                                            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                    }
                                }
                                else
                                    //if (CustomRegionsToolTipList.indexOf(obj.ParentText) > -1)//CustomRegions added by Bramhanath(04-Jan-2017)
                                    //{
                                    //    if (obj.Text == "Total US" && label != "Metric Comparisons") {
                                    //    }
                                    //        //else if (CustomRegionsExceptnCasesList.indexOf(obj.Text.trim()) == -1 && customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && monthonly != "Dec") {
                                    //        //}
                                    //    else {
                                    //        if (validateForCustomRegionBasedonTimePeriod(obj, "") == false)
                                    //            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                    //    }
                                    //}
                                    if ((CustomRegionsToolTipParentList.indexOf(obj.ParentText) > -1) || (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) || (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1))//CustomRegions added by Sabat(10-May-2021)
                                    {

                                        if (validateForCustomRegionBasedonTimePeriod(obj, obj.ParentText) == false)
                                            searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                    }
                                    else {

                                        if (controllername == "situationassessmentreport" && labelID == "establishment") {
                                            if (obj.Text != "BenchMark" && obj.Text != "CustomBase") {
                                                if (obj.ParentOfParent == "CustomBase") {
                                                    if ($('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim() == "TOTAL" && (obj.Text == 'Previous Period' || obj.Text == 'Previous Year'))
                                                    { }
                                                    else
                                                        searchArrayForCustombase.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                                }
                                                else
                                                    searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                            }
                                        }
                                        else {
                                            if (obj.Text != "Competitors")
                                                searchArray.push({ label: obj.Text, value: [{ filterobj: ele, level: left_Menu_Data[data_index].PanelPopup[i].Level, parentid: obj.ParentID, id: obj.ID }] });
                                        }
                                    }
                            }
                        }
                    }
                }
            }
        }
    }

    if (controllername == "situationassessmentreport" && (labelID == "establishment" || labelID == "competitors"))
        searchlevel = 2;
    //else if (controllername == "situationassessmentreport" && level == "2"  ) {
    //    searchArray = searchArrayForCustombase;
    //}
    searchTextBoxAutoComplete(searchlevel, labelID, searchArray, label);
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
{
    Name: "GuestVistToggle Button", cls: "guestorvist-msehover", size: "medium", Text: "Select to view Guest or Visit based demographics"
},
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
{ Name: "Cross-Frequency Analysis", cls: "diner-crossdining-msehover", size: "medium", Text: "Navigate to create Cross-Frequency Analysis for key metrics" },
{ Name: "Cross-Dining Frequencies", cls: "cross-diner-analyses-msehover", size: "medium", Text: "Create a table that shows an establishment/channel's Diners' frequencies to all other establishment/channels" },
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
{ Name: "Custom Color Palette", cls: "color-pallette-msehover", size: "medium", Text: "Select to customize colors for establishments/beverages/measures/metric comparisions" },
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
{ Name: "Quick Download", cls: "downloadall-sitn-msehover", size: "medium", Text: "Select to download the entire report" },
{ Name: "Competitors", cls: "Competitors-msehover", size: "medium", Text: "Click to select competitor key metric filter options" },
{ Name: "Download Custom", cls: "custom_download-msehover", size: "medium", Text: "Select to download specific slides" },
{ Name: "Download Custom", cls: "custom-download-sitn-msehover", size: "medium", Text: "Select to download specific slides" },

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
        else if (obj.cls == "guestorvist-msehover") {
            if ((controllername.indexOf("dashboard") > -1)) {
                $("#MouseHoverSmallDiv").show();
                $("#MouseHoverSmallDiv .ContainerClass .HeadingTextsmall").html("Toggle Button");
                $("#MouseHoverSmallDiv .ContainerClass .TextContainersmall").text("Select to view Guest or Visit based demographics");

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

    if (mstr.attr("data-val") == "Metric Comparisons" && CustomRegionsToolTipList.indexOf(parentText) > -1 && CustomRegionsToolTipList.indexOf(pText) > -1) {
        return true;
    }
    else if (pText == parentText && pLevel == level && DataparentId == pDataparentId)
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
                if (CustomRegionsToolTipList.indexOf(parentText) > -1)
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
var hideGeographyBaseonComparisonBanner = function () {
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

var getSelectedFrequecnyFlter = function (fil) {
    return fil;
}
var getCustomBaseFrequencyFilter = function (fil) {
    return fil;
}
var getSelectedadditionalfilterForDemogdash = function (fil) {
    return fil;
}

var getselectSkeworHigh = function (fil) {
    return fil;
}
var getVisitsorGuests = function (fil) {
    return fil;
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
        status = sampleValue == null || sampleValue == "" ? "NA" : commaSeparateNumber(sampleValue) + " (LOW SAMPLE SIZE)";
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

var getFontColorBasedOnDevitationValue = function (devaitnVal) {
    if (devaitnVal == null || devaitnVal == undefined || devaitnVal == NaN)
        return "black";
    else if (devaitnVal > 7)
        return "green";
    else if (devaitnVal < -7)
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
    object = object.replace(/[0-9]+/g, "_");
    var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '').replace(/\!/g, '').replace(/[?=]/g, "");
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

    if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics")
        $(".lft-popup-tp:eq(4)").first().click().click();
    else {
        if ($(".pit").hasClass("active")) {
            $(".lft-popup-tp:eq(4)").first().click().click();
        } else {
            $(".lft-popup-tp:eq(4)").click().click();
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
            $('.scrollable-columns-table tr th.tbl-dta-metricsHding').width((claWidthForTwo) + "px");
            $('.scrollable-columns-table tr td.tbl-dta-td').width(claWidthForTwo + "px");
            $('.scrollable-data-frame tr td.tbl-dta-td').css("width", (claWidthForTwo) + "px");
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

        //Added by Sabat(10-May-2021) start

        if (CustomRegionsToolTipParentList.indexOf($(v).find('.lft-popup-ele-label').attr("parent-text")) > -1) {
            var pele = $($(v).find('.lft-popup-ele-label')).parent().parent().parent().parent();
            $(v).find('.lft-popup-ele-label').parent().removeClass("lft-popup-ele_active");
            //$(this).find('.sidearrw_active').removeClass('.sidearrw_active');
            removeSelectedPanelElement(true, $(v).find('.lft-popup-ele-label'), $(pele).siblings(".lft-ctrl2"));
            if (window.location.pathname.toLocaleLowerCase().includes("deepdive"))
                hideEstablishmentFromTable(removeBlankSpace($(v).find('.lft-popup-ele-label').text()));//To remove columns  from table output ares

        }
        else if (CustomRegionsToolTipParentList.indexOf($(v).find('.lft-popup-ele-label').attr("data-val")) > -1) {
            var pele = $($(v).find('.lft-popup-ele-label')).parent().parent().parent().parent();
            $(v).find('.lft-popup-ele-label').parent().removeClass("lft-popup-ele_active");
            //$(this).find('.sidearrw_active').removeClass('.sidearrw_active');
            removeSelectedPanelElement(true, $(v).find('.lft-popup-ele-label'), $(pele).siblings(".lft-ctrl2"));
            if (window.location.pathname.toLocaleLowerCase().includes("deepdive"))
                hideEstablishmentFromTable(removeBlankSpace($(v).find('.lft-popup-ele-label').text()));//To remove columns  from table output ares
        }
        else if (CustomRegionsToolTipChildList.indexOf($(v).find('.lft-popup-ele-label').attr("data-val")) > -1) {
            var pele = $($(v).find('.lft-popup-ele-label')).parent().parent().parent().parent();
            $(v).find('.lft-popup-ele-label').parent().removeClass("lft-popup-ele_active");
            //$(this).find('.sidearrw_active').removeClass('.sidearrw_active');
            removeSelectedPanelElement(true, $(v).find('.lft-popup-ele-label'), $(pele).siblings(".lft-ctrl2"));
            if (window.location.pathname.toLocaleLowerCase().includes("deepdive"))
                hideEstablishmentFromTable(removeBlankSpace($(v).find('.lft-popup-ele-label').text()));//To remove columns  from table output ares
        }
        //Added by Sabat(10-May-2021) end

        //if (CustomRegionsToolTipList.indexOf($(v).find('.lft-popup-ele-label').attr("parent-text")) > -1) {
        //    var pele = $($(v).find('.lft-popup-ele-label')).parent().parent().parent().parent();
        //    $(v).find('.lft-popup-ele-label').parent().removeClass("lft-popup-ele_active");
        //    //$(this).find('.sidearrw_active').removeClass('.sidearrw_active');
        //    removeSelectedPanelElement(true, $(v).find('.lft-popup-ele-label'), $(pele).siblings(".lft-ctrl2"));
        //    if (window.location.pathname.toLocaleLowerCase().includes("deepdive"))
        //        hideEstablishmentFromTable(removeBlankSpace($(v).find('.lft-popup-ele-label').text()));//To remove columns  from table output ares

        //}
    });
    //to show geography when time period selections changes
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().show();
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().removeClass("dynamic_show_hide_charts");
    $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele-label[data-val='Geography']").parent().css('display', 'flex');

    $.each(CustomRegionsToolTipList, function (i, v) {
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + v + '"]').parent().show();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + v + '"]').parent().removeClass('dynamic_show_hide_charts');
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + v + '"]').parent().css('display', 'flex');

    });
    //
}

//Custom Regions adding tooltips,enable and disable based on time periods
var customRegions = function (parentName, key) {
    // Added by Sabat(10-May-2021) started
    var levelid = parseInt($(key).parent().parent().attr('data-level')) + 1;

    $('.census_regions_cRegion').attr("title", "Available till Dec 2020");
    $('.census_divisions_cRegion').attr("title", "Available till Dec 2020");
    $('.ccna_regions_cRegion').attr("title", "Available till Dec 2020");
    $('.fcl_ops_ou_cRegion').attr("title", "Available till Dec 2020");
    $('.albertsonssafeway_houston_cRegion').attr("title", "Available till Dec 2020");
    $('.__eleven_baltimorewashington_dc_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_bostonconnecticut_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_chicago_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_colorado_springspueblo_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_dallas_ft_worth_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_denver_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_detroit_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_lasan_diego_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_miami_dade_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_new_york_city_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_orlandotampa_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_philadelphia_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_phoenix_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_san_francisco_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.__eleven_seattleportland_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.walgreens_trade_areas_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.heb_northwest_div_cRegion').attr("title", "Available from Jan 2021 onwards");
    $('.circle_k_las_vegas_cRegion').attr("title", "Available from Jan 2021 onwards");

    var customRegionListNets = [];
    if (CustomRegionsDisableToolTipListInMenu.indexOf($(key).parent().text().trim()) > -1) {
        customRegionListNets = $('.lft-popup-col' + levelid).find('.lft-popup-ele-label[parent-text="' + $(key).parent().text().trim() + '"]').parent();
    }
    if (parentName == "Metric Comparisons" || controllerListForDemoFilterCustomReg.indexOf(controllername) > -1)
        customRegionList = $('.lft-popup-col3').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    else
        customRegionList = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();
    var selectedTimePeriodText = $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text();
    var startSelectedYear = 0;
    var startSelectedYearForStarted = 0;
    var disableforTimeSelected = [];
    if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
        startSelectedYear = selectedTimePeriodText.split(" ")[2]
        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
        if (timePeriodType.replace(" ", "") == "YTD") {
            startSelectedYearForStarted = startSelectedYear;
        } else {
            startSelectedYearForStarted = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
        }
    }
    else if (timePeriodType.replace(" ", "") == "QUARTER") {
        startSelectedYear = selectedTimePeriodText.split(" ")[1];
    }
    else if (timePeriodType.replace(" ", "") == "YEAR") {
        startSelectedYear = selectedTimePeriodText.split(" ")[0];
    }
    if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
        var endSelectedYear = 0;
        if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
            endSelectedYear = selectedTimePeriodText.split(" ")[6]
        }
        else if (timePeriodType.replace(" ", "") == "QUARTER") {
            endSelectedYear = selectedTimePeriodText.split(" ")[4];
        }
        else if (timePeriodType.replace(" ", "") == "YEAR") {
            endSelectedYear = selectedTimePeriodText.split(" ")[2];
        }
        if (timePeriodType.replace(" ", "") == "TOTAL") {
            //disableforTimeSelected.push("CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU")
            $.each(removedYearCustomRegions, function (i, v) {
                if ((customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
            $.each(startedYearCustomRegions, function (i, v) {
                if ((customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
        }
            //else if (startSelectedYear >= 2021) {
            //    disableforTimeSelected.push("CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU")
            //}
        else {
            $.each(removedYearCustomRegions, function (i, v) {
                if ((endSelectedYear >= v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
            if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                $.each(startedYearCustomRegions, function (i, v) {
                    if ((startSelectedYearForStarted < v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                        disableforTimeSelected.push(i)
                    }
                })
            }
            else {
                $.each(startedYearCustomRegions, function (i, v) {
                    if ((startSelectedYear < v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                        disableforTimeSelected.push(i)
                    }
                })
            }

        }
    }
    else {
        if (timePeriodType.replace(" ", "") == "TOTAL") {
            //disableforTimeSelected.push("CCNA Regions", "Census Regions", "Census Divisions", "FCL Ops OU")
            $.each(removedYearCustomRegions, function (i, v) {
                if ((customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
            $.each(startedYearCustomRegions, function (i, v) {
                if ((customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
        }

        else {
            $.each(removedYearCustomRegions, function (i, v) {
                if ((startSelectedYear >= v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                    disableforTimeSelected.push(i)
                }
            })
            if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                $.each(startedYearCustomRegions, function (i, v) {
                    if ((startSelectedYearForStarted < v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                        disableforTimeSelected.push(i)
                    }
                })
            }
            else {
                $.each(startedYearCustomRegions, function (i, v) {
                    if ((startSelectedYear < v) && (customRegionsFirstParentList.indexOf(i) > -1)) {
                        disableforTimeSelected.push(i)
                    }
                })
            }
        }
    }

    $.each(customRegionListNets, function (i, v) {
        $(this).removeClass('disableCustomRegionofNets');
    });
    $.each(customRegionListNets, function (i, v) {
        let item = $(v).find('.lft-popup-ele-label').text().trim()
        if (timePeriodType.replace(" ", "") == "TOTAL") {
            //if ($(v).find('.lft-popup-ele-label').text().trim() == "Walgreens Trade Areas") {
            //    $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
            //    $(this).removeClass('disableCustomRegion');
            //    $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
            //    $(this).addClass('disableCustomRegion');
            //}
            if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1) && ((item in startedYearCustomRegions) || (item in removedYearCustomRegions))) {
                $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                $(this).removeClass('disableCustomRegion');
                $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                $(this).addClass('disableCustomRegion');
            }
            else if ((CustomRegionsToolTipChildList.indexOf(item) > -1) && ((item in startedYearCustomRegions) || (item in removedYearCustomRegions))) {
                $(this).addClass('disableCustomRegionofNets')
            }

        }
        else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
            if ($('.trend').hasClass('active')) {
                var endSelectedYear = 0;
                if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                    endSelectedYear = selectedTimePeriodText.split(" ")[6]
                }


                if (item in removedYearCustomRegions) {
                    if (endSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
                else if (item in startedYearCustomRegions) {
                    if (startSelectedYearForStarted < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }

            }
            else {
                if (item in removedYearCustomRegions) {
                    if (startSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }

                }

                else if (item in startedYearCustomRegions) {
                    if (startSelectedYearForStarted < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }

            }
        }
        else if (timePeriodType.replace(" ", "") == "QUARTER") {
            if ($('.trend').hasClass('active')) {
                var endSelectedYear = 0;
                if (timePeriodType.replace(" ", "") == "QUARTER") {
                    endSelectedYear = selectedTimePeriodText.split(" ")[4];
                }


                if (item in removedYearCustomRegions) {
                    if (endSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
                else if (item in startedYearCustomRegions) {
                    if (startSelectedYear < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }

            }
            else {
                if (item in removedYearCustomRegions) {
                    if (startSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }

                }
                else if (item in startedYearCustomRegions) {
                    if (startSelectedYear < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
            }
        }
        else if (timePeriodType.replace(" ", "") == "YEAR") {
            if ($('.trend').hasClass('active')) {
                var endSelectedYear = 0;
                if (timePeriodType.replace(" ", "") == "YEAR") {
                    endSelectedYear = selectedTimePeriodText.split(" ")[2];
                }
                if (item in removedYearCustomRegions) {
                    if (endSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
                else if (item in startedYearCustomRegions) {
                    if (startSelectedYear < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
            }
            else {
                if (item in removedYearCustomRegions) {
                    if (startSelectedYear >= removedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }

                }
                else if (item in startedYearCustomRegions) {
                    if (startSelectedYear < startedYearCustomRegions[item]) {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
                            $(this).addClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).addClass('disableCustomRegionofNets')
                        }
                    }
                    else {
                        if ((CustomRegionsToolTipParentList.indexOf(item) > -1) && (customRegionsFirstParentList.indexOf(item) == -1)) {
                            $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
                            $(this).removeClass('disableCustomRegion');
                        }
                        else if (CustomRegionsToolTipChildList.indexOf(item) > -1) {
                            $(this).removeClass('disableCustomRegionofNets')
                        }
                    }
                }
            }
        }

    });

    //disableforTimeSelected = disableforTimeSelected.replace
    $.each(customRegionList, function (i, v) {
        $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
        $(this).removeClass('disableCustomRegion');

        if (disableforTimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
            $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
            $(this).addClass('disableCustomRegion');
        }
    });

    // Added by Sabat(10-May-2021) end


    //    var levelid = parseInt($(key).parent().parent().attr('data-level')) + 1;
    //    var checklevelid = "";
    //    //Tool tip based on PIT & TREND
    //    if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
    //        $('.total_us_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.density_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ccna_regions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.bottler_regions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ccr_subregions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ao_non_ccr_sub_regions_cRegion').attr("title", "Available for Year Time Periods");
    //        $('.census_regions_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.census_divisions_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.fcl_ops_ou_cRegion').attr("title", "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.dma_regions_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.trade_areas_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.states_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");

    //        $('.albertsonssafeway_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.albertsonssafeway_corporate_net_trade_area_cRegion').attr("title", "Cannot be selected with other Albertson's/Safeway Sub Regions");
    //        $('.circle_k_trade_areas_cRegion').attr("title", "Available for Year, Bi-Annual Time Periods");
    //        $('.circle_k_trade_area_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods  (Cannot be selected with other Circle K Sub Regions)");
    //        $('.heb_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.heb_trade_area_cRegion').attr("title", "Cannot be selected with other HEB Sub Regions");
    //        $('.kroger_trade_areas_cRegion').attr("title", "Available for Year, Year ending months YTD, 12MMT Time Periods except Kroger Trade Area");
    //        $('.kroger_trade_area_cRegion').attr("title", "Cannot be selected with other Kroger Sub Regions");
    //        $('.publix_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.publix_trade_area_cRegion').attr("title", "Cannot be selected with other Kroger Sub Regions");

    //    }
    //    else {
    //        $('.total_us_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.density_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ccna_regions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.bottler_regions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ccr_subregions_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.ao_non_ccr_sub_regions_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.census_regions_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.census_divisions_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.fcl_ops_ou_cRegion').attr("title", "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.dma_regions_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.trade_areas_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods");
    //        $('.states_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");

    //        $('.albertsonssafeway_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.albertsonssafeway_corporate_net_trade_area_cRegion').attr("title", "Cannot be selected with other Albertson's/Safeway Sub Regions");
    //        $('.circle_k_trade_areas_cRegion').attr("title", "Available for Year, Bi-Annual Time Periods");
    //        $('.circle_k_trade_area_cRegion').attr("title", "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods  (Cannot be selected with other Circle K Sub Regions)");
    //        $('.heb_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.heb_trade_area_cRegion').attr("title", "Cannot be selected with other HEB Sub Regions");
    //        $('.kroger_trade_areas_cRegion').attr("title", "Available for Year, Year ending months YTD, 12MMT Time Periods except Kroger Trade Area");
    //        $('.kroger_trade_area_cRegion').attr("title", "Cannot be selected with other Kroger Sub Regions");
    //        $('.publix_trade_areas_cRegion').attr("title", "Available for Year, Year ending months for YTD, 12MMT Time Periods");
    //        $('.publix_trade_area_cRegion').attr("title", "Cannot be selected with other Kroger Sub Regions");
    //    }
    //    //

    //    if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
    //        //TREND - Start
    //        disableForWhenTOTALTimeSelected = ["Density", "CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "Census Regions", "Census Divisions", "DMA Regions", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //        disableForWhenYEARTimeSelected = [];
    //        disableForWhenYTDTimeSelected = ["AO Non CCR Sub Regions"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //        disableForWhenQUARTERTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //        disableForWhen12MMTTimeSelected = ["AO Non CCR Sub Regions"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //        disableForWhen6MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //        disableForWhen3MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]

    //        //TREND- End
    //    }
    //    else {
    //        //PIT- Start
    //        disableForWhenTOTALTimeSelected = ["CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "Trade Areas", "States"];
    //        disableForWhenYEARTimeSelected = [""];
    //        disableForWhenYTDTimeSelected = [""];
    //        disableForWhenQUARTERTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //        disableForWhen12MMTTimeSelected = [];
    //        disableForWhen6MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //        disableForWhen3MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //        //PIT- End
    //    }
    //    $('.survivors_cRegion').attr("title", "Through the challenges they face, they’ve learned who they are. Their focus on the day-to-day makes them grateful for what they have.");
    //    $('.aspirers_cRegion').attr("title", "They are young, passionate and curious. They’re just getting started, and they know that they can do big things");
    //    $('.givers_cRegion').attr("title", "They are young, passionate and curious. They’re just getting started, and they know that they can do big things");
    //    $('.providers_cRegion').attr("title", "Their lives are centered on their families – giving them the best lives possible and nurturing them to become good, kind and strong people.");
    //    $('.age_defiers_cRegion').attr("title", "They have the time to enjoy their family, friends, hobbies and volunteering. They focus now on quality of life and healthy aging.")
    //    $('.change_makers_cRegion').attr("title", "They strive to leave their mark and make a difference in the world, through the work they do and the impact they make on others.")
    //    $('.seekers_cRegion').attr("title", "Even though they are well-established, there is always more to learn. They have the security to live life on their terms and make a real difference.")

    //    var toremovedisableCustomRegion = "";
    //    var customRegionListDisableNets = []; var customRegionListNets = [];
    //    if (parentName == "Metric Comparisons" || parentName == "Advance Filters" || parentName == "Advanced Filters Custom Base")
    //        checklevelid = 4;
    //    else
    //        checklevelid = 3;

    //    //Enable and Disable Custom Regions based on Time Period
    //    if (CustomRegionsparentDisableList.indexOf($(key).parent().text().trim()) > -1 && levelid > checklevelid) {
    //        customRegionListNets = $('.lft-popup-col' + levelid).find('.lft-popup-ele-label[parent-text="' + $(key).parent().text().trim() + '"]').parent();
    //    }
    //    if (parentName == "Metric Comparisons" || controllerListForDemoFilterCustomReg.indexOf(controllername) > -1)
    //        customRegionList = $('.lft-popup-col3').find('.lft-popup-ele-label[parent-text="Geography"]').parent();
    //    else
    //        customRegionList = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();

    //    timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();
    //    var disableforTimeSelected = eval("disableForWhen" + timePeriodType.replace(" ", "") + "TimeSelected");
    //    var onlyforYTD = $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text();
    //    var monthonlyYTD = "";
    //    if (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT")
    //        monthonlyYTD = onlyforYTD.split(" ")[1];
    //    if ($(".trend").hasClass("active") && $('.trend').text() == "TREND" && customregionsEndingTimeperiodforTrend.indexOf(timePeriodType) > -1) {
    //        //monthonlyYTD = onlyforYTD.split(" ")[1];
    //        monthonlyYTD1 = onlyforYTD.split(" ")[5];
    //        if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD1) == -1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {
    //            if (monthonlyYTD1 != "Dec")
    //            {
    //                if (monthonlyYTD1 == "Jun")
    //                    disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //                else
    //                    disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            }
    //            else
    //                disableforTimeSelected.push();
    //        }
    //        else if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD1) == -1 && (timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD1 != "Dec") {
    //            if (monthonlyYTD1 == "Jun")
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            else
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //        }
    //        else if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT") && monthonlyYTD1 != "Dec") {
    //            if (monthonlyYTD1 == "Jun")
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //            else
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //        }
    //        else if (customregionsqtrEndingmntsTrend.indexOf(monthonlyYTD1) > -1) {
    //            disableforTimeSelected.push("AO Non CCR Sub Regions");
    //        }
    //        else {
    //            disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "Trade Areas", "States", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //        }
    //    }
    //    else if ($(".trend").hasClass("active") && $('.trend').text() == "TREND" && timePeriodType == "QUARTER") {
    //        disableforTimeSelected.push("AO Non CCR Sub Regions");
    //    }
    //    else if ($(".trend").hasClass("active") && $('.trend').text() == "TREND" && timePeriodType == "YEAR") {
    //        disableforTimeSelected.push("");
    //    }
    //    else {
    //        if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) == -1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {

    //            if (monthonlyYTD != "Dec")
    //            {
    //                if (monthonlyYTD == "Jun")
    //                    disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //                else
    //                    disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            }
    //            else
    //                disableforTimeSelected.push("");

    //        }
    //        else if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) == -1 && (timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD != "Dec") {
    //            if (monthonlyYTD == "Jun") {
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            }
    //            else
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //        }
    //        else if ((timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD == "Dec") {
    //            disableforTimeSelected.push("Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //        }
    //        else if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) > -1 && (timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT")) {
    //            if (monthonlyYTD == "Jun") {
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "States", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            }
    //            else {
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "States", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //            }

    //        }
    //        else if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT") && monthonlyYTD != "Dec") {
    //            if (monthonlyYTD == "Jun") {
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //            }
    //            else {
    //                disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //            }
    //        }
    //        else if (customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == -1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {
    //            disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //        }
    //    }

    //    if (customRegionListNets.length == 0 && levelid > checklevelid)
    //        customRegionListNets = $('.lft-popup-ele.disableCustomRegionofNets');
    //    $.each(customRegionListNets, function (i, v) {
    //        $(this).removeClass('disableCustomRegionofNets');
    //    });
    //    $.each(customRegionListNets, function (i, v) {
    //        if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType == "YEAR") && monthonlyYTD == "Dec" && $('.pit').hasClass('active')) {
    //        }
    //        else if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType == "YEAR") && monthonlyYTD1 == "Dec" && $('.trend').hasClass('active')) {
    //        }
    //        else if ($(v).find('.lft-popup-ele-label').attr("parent-text") == "Circle K Trade Areas" && (monthonlyYTD == "Dec" || monthonlyYTD == "Jun") && $('.pit').hasClass('active')) {
    //        }
    //        else if ($(v).find('.lft-popup-ele-label').attr("parent-text") == "Circle K Trade Areas" && (monthonlyYTD1 == "Jun" || monthonlyYTD1 == "Dec") && $('.trend').hasClass('active')) {
    //        }
    //        else if (CustomRegionsExceptnCasesList.indexOf($(v).find('.lft-popup-ele-label').text().trim()) == -1 && timePeriodType != "YEAR") {
    //            $(this).addClass('disableCustomRegionofNets');
    //        }
    //    });

    //    //disableforTimeSelected = disableforTimeSelected.replace
    //$.each(customRegionList, function (i, v) {
    //    if ($(this).text().trim() == "Total US" && parentName != "Metric Comparisons") {
    //        $(this).css("display", "none");
    //    }
    //    $(this).find(".lft-popup-ele-next").removeClass("disableCustomRegions")
    //    $(this).removeClass('disableCustomRegion');

    //    if (disableforTimeSelected.indexOf($(v).find('.lft-popup-ele-label').text().trim()) > -1) {
    //        $(this).find(".lft-popup-ele-next").addClass("disableCustomRegions")
    //        $(this).addClass('disableCustomRegion');
    //    }
    //});
    //    //


}

//Custom Regions TO check the selections and deselect based on stubs added by Bramhanath(05-01-2017)
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

    //Custom Regions Fourth Level
    var albertSonSelectedLevelText = $(key).parent().find(".lft-popup-ele-label").text();
    //  
    //CustomRegions Metic Comparisons to allow Mutiple selections Added by Bramahanth (08-01-2018)
    if ($(mstr).attr('data-val') == "Metric Comparisons" && CustomRegionsToolTipList.indexOf(parentText) > -1 && CustomRegionsToolTipList.indexOf(pText) > -1)
        return true;

    //
    if (pText == parentText && pLevel == level && ($(mstr).attr('data-val') == "Metric Comparisons" || $(mstr).attr('data-val') == "Advance Filters") && pLevel == "4") {
        if (pText == "Trade Areas") {
            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    deselectSelctdElmntsCustomRegions(ele, key);
                }
            });
        }
        else
            return true;
    }
    if (pText == parentText && pLevel == level && pLevel != "4" && pLevel != "5") {
        if (pText == "Trade Areas") {
            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    deselectSelctdElmntsCustomRegions(ele, key);
                }
            });
        }
        else
            return true;
    }
    else if (level == 3) {
        if (CustomRegionsToolTipList.indexOf(parentText) > -1) {
            var selectedEle = $(key).parent().parent().parent().parent().find(".lft-popup-ele_active");
            var secondLevelGeography = $('.lft-popup-col2').find('.lft-popup-ele-label[parent-text="Geography"]').parent();

            $.each(selectedEle, function (index, ele) {
                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    if ($($(ele).children()[1]).attr("parent-text") == parentText) {
                        if ($($(ele).children()[1]).attr("parent-text") == "Trade Areas") {
                            var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
                            $.each(selectedEle, function (index, ele) {
                                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
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
    if (CustomRegionsExceptnCasesList.indexOf(albertSonSelectedLevelText) > -1)//To deselect all and to make selections of Subregions like sub Albertson's/Safeway Corporate Net Trade Area,HEB Trade Area,Kroger Trade Area,Publix Trade Area
    {
        var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
        $.each(selectedEle, function (index, ele) {
            if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                //deselectSelctdElmntsCustomRegions(ele, key);
                var selectedElem = $(ele).find(".lft-popup-ele-label");
                $(selectedElem).click();
            }
        });
    }
    else if (CustomRegionsParentList.indexOf(parentText) > -1) {//To deselect all and allow mutliple selections for Subregions of "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas"];
        var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
        $.each(selectedEle, function (index, ele) {
            if ($($(ele).children()[1]).attr("parent-text") == parentText && $($(ele).children()[1]).text() != "Albertson's/Safeway Corporate Net Trade Area" && $($(ele).children()[1]).text() != "Circle K Trade Area" && $($(ele).children()[1]).text() != "HEB Trade Area" && $($(ele).children()[1]).text() != "Kroger Trade Area" && $($(ele).children()[1]).text() != "Publix Trade Area") {
                if ($($(ele).children()[1]).attr("parent-text") == "Trade Areas") {
                    var selectedElem = $(ele).find(".lft-popup-ele-label");
                    $(selectedElem).click();
                }
                else
                    return true;
            }
            else {
                //deselectSelctdElmntsCustomRegions(ele, key);
                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    var selectedElem = $(ele).find(".lft-popup-ele-label");
                    $(selectedElem).click();
                }
            }
        });
    }
    else if (CustomRegionsToolTipList.indexOf(parentText) > -1) {//To deselect all and allow mutliple selections for Subregions of "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas"];
        var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
        $.each(selectedEle, function (index, ele) {
            if ($($(ele).children()[1]).attr("parent-text") == parentText && $($(ele).children()[1]).text() != "Albertson's/Safeway Corporate Net Trade Area" && $($(ele).children()[1]).text() != "Circle K Trade Area" && $($(ele).children()[1]).text() != "HEB Trade Area" && $($(ele).children()[1]).text() != "Kroger Trade Area" && $($(ele).children()[1]).text() != "Publix Trade Area") {
                if ($($(ele).children()[1]).attr("parent-text") == "Trade Areas") {
                    var selectedElem = $(ele).find(".lft-popup-ele-label");
                    $(selectedElem).click();
                }
                else {
                    return true
                }
            }
            else {
                //deselectSelctdElmntsCustomRegions(ele, key);
                if (CustomRegionsToolTipList.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                    var selectedElem = $(ele).find(".lft-popup-ele-label");
                    $(selectedElem).click();
                }
            }
        });
    }
}
//
//CustomRegion Validation based on Timeperiod by Bramhanath(04-01-2017)
var validateForCustomRegionBasedonTimePeriod = function (obj, parenttext) {
    //Added by Sabat (10-May-2021) start
    var status = false;
    timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();
    var selectedTimePeriodText = $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text();
    if (CustomRegionsToolTipParentList.indexOf(parenttext) > -1) {
        if (startedYearCustomRegions[parenttext] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(parenttext) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(parenttext) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= startedYearCustomRegions[parenttext]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else if (removedYearCustomRegions[parenttext] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(parenttext) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (endSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (endSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (endSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(parenttext) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[2]
                        if (startSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= removedYearCustomRegions[parenttext]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else {
            status = false;
        }
    }
    else if (CustomRegionsToolTipParentList.indexOf(obj.Text) > -1) {
        var objText = obj.Text;
        if (startedYearCustomRegions[objText] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else if (removedYearCustomRegions[objText] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[2]
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else {
            status = false;
        }
    }
    else if (CustomRegionsToolTipChildList.indexOf(obj.Text) > -1) {
        var objText = obj.Text;
        if (startedYearCustomRegions[objText] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        //var startSelectedYear = selectedTimePeriodText.split(" ")[2];
                        let startMonth = getMonth(selectedTimePeriodText.split(" ")[1]);
                        let startYear = parseInt(selectedTimePeriodText.split(" ")[2]);
                        var startSelectedYear = getFirstMonthYearOfTimePeriod(startMonth, startYear, timePeriodType.replace(" ", ""));
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= startedYearCustomRegions[objText]) {
                            status = false;
                        }
                        else {
                            status = true;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else if (removedYearCustomRegions[objText] != undefined) {
            if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[6];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[4];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var endSelectedYear = selectedTimePeriodText.split(" ")[2];
                        if (endSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
            else {
                if (disableCustomRegionListForAllTimeperiodtype.indexOf(objText) > -1) {
                    if (timePeriodType.replace(" ", "") == "TOTAL") {
                        status = true;
                    }
                    else if (customregionsTimeperiodTypeforTrend.indexOf(timePeriodType.replace(" ", "")) > -1) {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[2]
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "QUARTER") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[1];
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else if (timePeriodType.replace(" ", "") == "YEAR") {
                        var startSelectedYear = selectedTimePeriodText.split(" ")[0];
                        if (startSelectedYear >= removedYearCustomRegions[objText]) {
                            status = true;
                        }
                        else {
                            status = false;
                        }
                    }
                    else {
                        status = false;
                    }
                }
            }
        }
        else {
            status = false;
        }
    }
    else {
        status = false;
    }
    return status;
    //Added by Sabat (10-May-2021) end

    //if ($(".trend").hasClass("active") && $('.trend').text() == "TREND") {
    //    //TREND - Start
    //    disableForWhenTOTALTimeSelected = ["Density", "CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "Census Regions", "Census Divisions", "DMA Regions", "Trade Areas", "Albertsons/Safeway Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //    disableForWhenYEARTimeSelected = [];
    //    disableForWhenYTDTimeSelected = ["AO Non CCR Sub Regions"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //    disableForWhenQUARTERTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //    disableForWhen12MMTTimeSelected = ["AO Non CCR Sub Regions"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //    disableForWhen6MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]
    //    disableForWhen3MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];// "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "States"]

    //    //TREND- End
    //}
    //else {
    //    //PIT- Start
    //    disableForWhenTOTALTimeSelected = ["CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "Trade Areas", "States"];
    //    disableForWhenYEARTimeSelected = [""];
    //    disableForWhenYTDTimeSelected = [""];
    //    disableForWhenQUARTERTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //    disableForWhen12MMTTimeSelected = [];
    //    disableForWhen6MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //    disableForWhen3MMTTimeSelected = ["AO Non CCR Sub Regions", "DMA Regions", "States"];
    //    //PIT- End
    //}
    //timePeriodType = $('.lft-ctrl3-content').find('.lft-popup-tp-active').text().trim();

    //var status = false;
    //var disableforTimeSelected = eval("disableForWhen" + timePeriodType.replace(" ", "") + "TimeSelected");
    //var onlyforYTD = $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text();
    //var monthonlyYTD = "";
    //if (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT")
    //    monthonlyYTD = onlyforYTD.split(" ")[1];
    ////if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) > -1 && timePeriodType == "YTD") {
    ////    disableforTimeSelected.push("Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "Trade Areas", "Albertson's/Safeway Trade Areas", "States");
    ////}
    //if ($(".trend").hasClass("active") && $('.trend').text() == "TREND" && customregionsEndingTimeperiodforTrend.indexOf(timePeriodType) > -1) {
    //    //monthonlyYTD = onlyforYTD.split(" ")[1];
    //    monthonlyYTD1 = onlyforYTD.split(" ")[5];
    //    //if (customregionsqtrEndingmntsTrend.indexOf(monthonlyYTD) > -1 || customregionsqtrEndingmntsTrend.indexOf(monthonlyYTD1) > -1) {
    //    //    disableforTimeSelected.push("AO Non CCR Sub Regions");
    //    //}
    //    if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD1) == -1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {
    //        if (monthonlyYTD1 != "Dec") {
    //            if (monthonlyYTD1 == "Jun")
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "AO Non CCR Sub Regions", "DMA Regions", "States");
    //            else
    //                disableforTimeSelected.push("CCNA Regions","Bottler Regions", "CCR Subregions", "Albertson's/Safeway Trade Areas", "Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "AO Non CCR Sub Regions", "DMA Regions", "States");
    //        }
    //        else
    //            disableforTimeSelected.push("");
    //    }
    //    else if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD1) == -1 && (timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD1 != "Dec") {
    //        if (monthonlyYTD1 == "Jun")
    //            disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //        else
    //            disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //    }
    //    else if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT") && monthonlyYTD1 != "Dec") {
    //        if (monthonlyYTD1 == "Jun")
    //            disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //        else
    //            disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //    }
    //    else if (customregionsqtrEndingmntsTrend.indexOf(monthonlyYTD1) > -1) {
    //        disableforTimeSelected.push("AO Non CCR Sub Regions");
    //    }
    //    else {
    //        disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "Trade Areas", "States", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");

    //    }
    //    if (disableforTimeSelected.indexOf(obj.ParentText.trim()) > -1) {
    //        if (CustomRegionsExceptnCasesList.indexOf(obj.Text) > -1) {
    //            if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType.replace(" ", "") == "3MMT" || timePeriodType.replace(" ", "") == "6MMT") && onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD1) == -1 && monthonlyYTD1 != "Dec") {
    //                if (monthonlyYTD1 == "Jun") {
    //                    status = false;
    //                }
    //                else
    //                    status = true;
    //            }
    //            else
    //                status = false;
    //        }
    //        else
    //            status = true;
    //    }
    //    else {
    //         if (timePeriodType == "QUARTER" && obj.ParentText.trim() == "Circle K Trade Areas" && obj.Text.trim() != "Circle K Trade Area")
    //                    status = true;
    //         else
    //                status = false;

    //}
    //}
    //else if($(".pit").hasClass("active") || $('.trend').text() == "Skew") {
    //    if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) == - 1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {
    //        if (monthonlyYTD != "Dec") {
    //            if (monthonlyYTD == "Jun")
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "AO Non CCR Sub Regions", "DMA Regions", "States");
    //            else
    //                disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas", "AO Non CCR Sub Regions", "DMA Regions", "States");
    //    }
    //    else
    //            disableforTimeSelected.push("");
    //    }
    //    else if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) == -1 && (timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD != "Dec") {
    //        if (monthonlyYTD == "Jun") {
    //            disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //    }
    //    else
    //            disableforTimeSelected.push("CCNA Regions", "Bottler Regions", "CCR Subregions", "AO Non CCR Sub Regions", "DMA Regions", "States", "Trade Areas", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //    }
    //    else if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT") && monthonlyYTD != "Dec") {
    //        if (monthonlyYTD == "Jun") {
    //            disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //    }
    //    else
    //            disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "Circle K Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");

    //    }
    //    else if (customregsionsNetsTradeAreasdiable.indexOf(timePeriodType.replace(" ", "")) == - 1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT")) {
    //        disableforTimeSelected.push("AO Non CCR Sub Regions", "DMA Regions", "Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas", "States");
    //    }
    //    else if (timePeriodType == "QUARTER") {
    //        disableforTimeSelected.push("Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Publix Trade Areas", "Kroger Trade Areas");
    //    }
    //    else if ((timePeriodType.replace(" ", "") == "6MMT" || timePeriodType.replace(" ", "") == "3MMT") && monthonlyYTD == "Dec") {
    //        disableforTimeSelected.push("Albertson's/Safeway Trade Areas", "HEB Trade Areas", "Kroger Trade Areas", "Publix Trade Areas");
    //    }
    //    if (CustomRegionsToolTipList.indexOf(parenttext) > -1) {

    //            status = true;
    //    }
    //    else {
    //        if (disableforTimeSelected.indexOf(obj.ParentText.trim()) > -1) {
    //            if (CustomRegionsExceptnCasesList.indexOf(obj.Text) > -1) {
    //                if ((timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType.replace(" ", "") == "3MMT" || timePeriodType.replace(" ", "") == "6MMT") && onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) == - 1 && monthonlyYTD != "Dec") {
    //                    if (monthonlyYTD == "Jun") {
    //                        status = false;
    //                    }
    //                    else
    //                        status = true;
    //                }
    //                else
    //                    status = false;
    //            }
    //            else
    //                status = true;
    //    }
    //    else
    //            if (CustomRegionsparentDisableList.indexOf(obj.ParentText) > - 1 && timePeriodType == "TOTAL")
    //                status = true;
    //            else {
    //                if (CustomRegionsparentDisableList.indexOf(obj.ParentText) > - 1 && (timePeriodType == "YTD" || timePeriodType.replace(" ", "") == "12MMT" || timePeriodType.replace(" ", "") == "3MMT" || timePeriodType.replace(" ", "") == "6MMT") && monthonlyYTD != "Dec")
    //                    if (CustomRegionsExceptnCasesList.indexOf(obj.Text) > -1)
    //                        status = false;
    //                    else
    //                        if (onlyforYearnQurtrMntsForYTD.indexOf(monthonlyYTD) > -1)
    //                            status = false;
    //                        else
    //                            status = true;
    //                else
    //                    if (timePeriodType == "QUARTER" && obj.ParentText.trim() == "Circle K Trade Areas" && obj.Text.trim() != "Circle K Trade Area")
    //                        status = true;
    //                    else
    //                        status = false;

    //}
    //}
    //}
    //else {
    //    if (CustomRegionsToolTipList.indexOf(parenttext) > -1) {
    //        status = true;
    //} else {
    //    if (disableforTimeSelected.indexOf(obj.ParentText.trim()) > -1) {
    //        status = true;
    //}
    //else {
    //            if (CustomRegionsExceptnCasesList.indexOf(obj.Text) == - 1 && (timePeriodType == "QUARTER" || timePeriodType == "") && obj.ParentText != "Trade Areas") {

    //                if (timePeriodType == "QUARTER" && disableforTimeSelected.indexOf(obj.ParentText.trim()) == -1) {
    //                    if(obj.ParentText.trim() == "Circle K Trade Areas" && obj.Text.trim() != "Circle K Trade Area")
    //                        status = true;
    //                    else
    //                        status = false;
    //                }
    //                else {
    //                    status = true;
    //            }

    //            } else
    //                if (timePeriodType == "QUARTER" && obj.ParentText.trim() == "Circle K Trade Areas" && obj.Text.trim() != "Circle K Trade Area")
    //                    status = true;
    //                else
    //                status = false;

    //}

    //    }
    //}
    //return status;
}

//Custom Regions Mouse Hover title popup added by Bramhanath(05-01-2017) -- Start
var customRegionsMouseHoverTitles = function () {

    $(".lft-popup-ele-custom-tooltip-icon,.lft-popup-ele-custom-tooltip-icon-new").hover(function () {
        // Hover over code      
        var title = $(this).attr('title');
        var measurename = $(this).find(".lft-popup-ele-label").text();
        if ($(".trend").hasClass("active")) {
            //Added by Sabat(10-May-2021) start
            switch (measurename) {
                case "Total US":
                case "Density":

                case "Census Regions":
                    title = "Available till Dec 2020";
                    break;
                case "Census Divisions":
                    title = "Available till Dec 2020";
                    break;
                case "CCNA Regions":
                    title = "Available till Dec 2020";
                    break;
                case "FCL Ops OU":
                    title = "Available till Dec 2020";
                    break;
                case "Albertson's/Safeway Houston":
                    title = "Available till Dec 2020";
                    break;
                case "7-Eleven Baltimore/Washington DC":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Boston/Connecticut":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Chicago":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Colorado Springs/Pueblo":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Dallas-Ft Worth":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Denver":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Detroit":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven LA/San Diego":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Miami Dade":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven New York City":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Orlando/Tampa":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Philadelphia":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Phoenix":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven San Francisco":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Seattle/Portland":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "Walgreens Trade Areas":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "HEB Northwest Div":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "Circle K Las vegas":
                    title = "Available from Jan 2021 onwards";
                    break;
            }
            //Added by Sabat(10-May-2021) end

            //switch (measurename) {
            //    case "Total US":
            //    case "Density":

            //    case "Census Regions":
            //    case "Census Divisions":
            //        title = "Available for Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods";
            //        break;
            //    case "Bottler Regions":
            //    case "CCNA Regions":
            //    case "CCR Subregions":
            //    case "Trade Areas":
            //        title = "Available for Year, Quarter Time Periods";
            //        break;
            //    case "AO Non CCR Sub Regions":
            //    case "DMA Regions":
            //    case "States":
            //        title = "Available for Year Time Periods";
            //        break;
            //    case "Albertson's/Safeway Trade Areas":
            //    case "HEB Trade Areas":
            //    case "Publix Trade Areas":
            //        title = "Available for Year, Year ending months for YTD, 12MMT Time Periods";
            //        break;
            //    case "Kroger Trade Areas":
            //        title = "Available for Year, Year ending months YTD, 12MMT Time Periods except Kroger Trade Area";
            //        break;
            //    case "HEB Trade Area":
            //        title = "Cannot be selected with other HEB Sub Regions";
            //        break;
            //    case "Publix Trade Area":
            //        title = "Cannot be selected with other Publix Sub Regions"
            //        break;
            //    case "Kroger Trade Area":
            //        title = "Cannot be selected with other Kroger Sub Regions";
            //        break;
            //    case "Albertson's/Safeway Corporate Net Trade Area":
            //        title = "Cannot be selected with other Albertson's/Safeway Sub Regions";
            //        break;
            //}
        }
        else {
            //Added by Sabat(10-May-2021) start

            switch (measurename) {
                case "Total US":
                case "Density":

                case "Census Regions":
                    title = "Available till Dec 2020";
                    break;
                case "Census Divisions":
                    title = "Available till Dec 2020";
                    break;
                case "CCNA Regions":
                    title = "Available till Dec 2020";
                    break;
                case "FCL Ops OU":
                    title = "Available till Dec 2020";
                    break;
                case "Albertson's/Safeway Houston":
                    title = "Available till Dec 2020";
                    break;
                case "7-Eleven Baltimore/Washington DC":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Boston/Connecticut":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Chicago":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Colorado Springs/Pueblo":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Dallas-Ft Worth":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Denver":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Detroit":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven LA/San Diego":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Miami Dade":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven New York City":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Orlando/Tampa":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Philadelphia":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Phoenix":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven San Francisco":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "7-Eleven Seattle/Portland":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "Walgreens Trade Areas":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "HEB Northwest Div":
                    title = "Available from Jan 2021 onwards";
                    break;
                case "Circle K Las vegas":
                    title = "Available from Jan 2021 onwards";
                    break;
            }
            //Added by Sabat(10-May-2021) end

            //switch (measurename) {
            //    case "Total US":
            //    case "Density":
            //    case "Census Regions":
            //    case "Census Divisions":
            //        title = "Available for Total Time, Year, YTD, Quarter, 12MMT, 6MMT, 3MMT Time Periods";
            //        break;
            //    case "CCNA Regions":
            //    case "Bottler Regions":
            //    case "CCR Subregions":
            //    case "Trade Areas":
            //        title = "Available for Year, Quarter, Quarter ending months for YTD, 12MMT, 6MMT, 3MMT Time Periods";
            //        break;
            //    case "AO Non CCR Sub Regions":
            //    case "DMA Regions":
            //    case "States":
            //        title = "Available for Year, Year ending months for YTD, 12MMT Time Periods";
            //        break;
            //    case "Albertson's/Safeway Trade Areas":
            //    case "HEB Trade Areas":
            //    case "Publix Trade Areas":
            //        title = "Available for Year, Year ending months for YTD, 12MMT Time Periods";
            //        break;
            //    case "Kroger Trade Areas":
            //        title = "Available for Year, Year ending months YTD, 12MMT Time Periods except Kroger Trade Area";
            //        break;
            //    case "HEB Trade Area":
            //        title = "Cannot be selected with other HEB Sub Regions";
            //        break;
            //    case "Publix Trade Area":
            //        title = "Cannot be selected with other Publix Sub Regions"
            //        break;
            //    case "Kroger Trade Area":
            //        title = "Cannot be selected with other Kroger Sub Regions";
            //        break;
            //    case "Albertson's/Safeway Corporate Net Trade Area":
            //        title = "Cannot be selected with other Albertson's/Safeway Sub Regions";
            //        break;
            //}

        }
        if (controllername == "situationassessmentreport") {

            switch (title) {
                case "Demographics":
                case "Planning Context":
                    title = "THIS SLIDE HAS CUSTOM METRIC SELECTION. SELECT 6 METRICS TO BE SHOWN IN THIS SLIDE.";
                    break;

            }
        }


        if (title != undefined && title != "" && title != null) {
            $(this).data('tipText', title).removeAttr('title');
            $('<p class="GeoToolTip"></p>')
            .text(title)
            .appendTo('body')
            .fadeIn('slow');

            var pos = $(this).position();
            // .outerWidth() takes into account border and padding.
            var width = $(this).outerWidth();
            //show the menu directly over the placeholder
            $(".GeoToolTip").css({
                position: "absolute",
                top: pos.top + "px",
                left: (pos.left + width) + "px",
            }).show();
        }

    }, function () {
        // Hover out code
        $(this).attr('title', $(this).data('tipText'));
        $('.GeoToolTip').remove();
    }).mousemove(function (e) {
        var mousex = e.pageX + 10; //Get X coordinates
        var mousey = e.pageY + 10; //Get Y coordinates
        //added by Nagaraju for last layer tool tip
        //Date: 25-05-2017
        if ((mousex + 100) > $(".master-content-area").width()) {
            $('.GeoToolTip').css({ top: mousey, left: mousex - 250 })
        }
        else {
            $('.GeoToolTip').css({ top: mousey, left: mousex })
        }
    });
}

var timeperiodUpdate = function (isCustomregionQuarterEndingParentSelected) {
    isSampleSizeValidated = 0; isCrossDinerSubmitClicked = false;
    key = customregnkeycurrentValueTimeperiodForTrend;
    time = customregncurrentTimeperioddatavalForTrend;
    var starttimepriod = $("#slider-range-text").text().split(" to ");
    var origin = starttimepriod[0];
    var endTimeperiod = starttimepriod[1];
    var label = [];
    var indexofFromTimeperiod = 0;
    var indexofToTimeperiod = 0;
    $.each(time, function (i, v) {
        if (origin == (v.Text))
            indexofFromTimeperiod = i;
        if (endTimeperiod == (v.Text))
            indexofToTimeperiod = i;
        label.push(v.Text);
    });
    var pele = $(key).parent().parent().parent().parent().find(".lft-ctrl-txt");

    if ($(key).hasClass("lft-popup-tp-active"))
        ;//do nothing
    else {
        if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
            $(".lft-popup-tp").removeClass("lft-popup-tp-active");
            $(key).addClass("lft-popup-tp-active");
        }
        else {
            $(".lft-popup-tp").removeClass("lft-popup-tp-active");
            $(key).addClass("lft-popup-tp-active");
            $("#slider-range").show();
        }
    }

    var pitortrendorskeworage;
    //Time period for 
    if (controllername == "dashboardp2pdashboard" || controllername == "dashboard_demographics") {
        pitortrendorskeworage = "skeworage";
    }
    else
        pitortrendorskeworage = $('.lft-popup-tp-smnu-active').attr('data-val');
    var prepareTp1 = function (rangea, rangeb) {
        var tpd = [];
        trendTpList = [];//Trend Selected Timeperiod List 
        for (var xi = rangea; xi <= rangeb; xi++) {

            if (isCustomregionQuarterEndingParentSelected && false || false && checkForHighestPrecedingOrderofCustmRegnsInTrend.length > 0) {

                if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("States") > -1 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("DMA Regions") > -1
                                                 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Albertson's/Safeway Trade Areas") > -1
                                                 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("HEB Trade Areas") > -1
                                                 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Kroger Trade Areas") > -1
                                                 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Publix Trade Areas") > -1) {
                    if (time[xi].Text.split(" ")[1] == "Dec") {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }
                }
                else if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Circle K Trade Areas") > -1) {
                    if (onlyforBiannualMonth.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }
                }
                else if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Trade Areas") > -1 || checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf("Bottler Regions") > -1) {

                    if (customregionsqtrEndingmntsTrend.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }
                }
                else if (isCustomregionQuarterEndingParentSelected) {
                    if (customregionsqtrEndingmntsTrend.indexOf(time[xi].Text.split(" ")[1]) > -1) {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }
                    else if (timePeriodType == "QUARTER" || timePeriodType == "YEAR") {
                        tpd.push(JSON.stringify(time[xi]));
                        trendTpList.push(time[xi]);
                    }

                }
                else {
                    tpd.push(JSON.stringify(time[xi]));
                    trendTpList.push(time[xi]);
                }
            }
            else {
                tpd.push(JSON.stringify(time[xi]));
                trendTpList.push(time[xi]);
            }
        }
    }

    prepareTp1(indexofFromTimeperiod, indexofToTimeperiod);
    emptyTableoutputWithSelectedColumns();

}

var checkCustomregionQuarterEndingParentSelected = function (filtertype) {
    var selectedEle = $('.lft-popup-ele.lft-popup-ele_active');
    $.each(selectedEle, function (index, ele) {
        if ($($(ele).children()[1]).attr("parent-text") != undefined) {

            if (customRegionsParentLstQuarenterEdmnts.indexOf($($(ele).children()[1]).attr("parent-text")) > -1) {
                isCustomregionQuarterEndingParentSelected = true;

                //only for Group/Metric selections in trend of the year or Bianual or quarterly basis order added by bramhanath (13-04-2018)
                if (filtertype == "Metric Comparisons") {
                    if (checkForHighestPrecedingOrderofCustmRegnsInTrend.indexOf($($(ele).children()[1]).attr("parent-text")) == -1)
                        checkForHighestPrecedingOrderofCustmRegnsInTrend.push($($(ele).children()[1]).attr("parent-text"));
                }
                //
            }
            else
                isCustomregionQuarterEndingParentSelected = false;

        }
    });

}
//Deselecting the selected elements in custom Region Section
var deselectSelctdElmntsCustomRegions = function (ele, key) {
    var ctrl2 = $(key).parent().parent().parent().parent().siblings(".lft-ctrl2");
    $(ele).removeClass("lft-popup-ele_active");
    ele = ele.children[1];
    removeSelectedPanelElement(true, ele, ctrl2);
    if (window.location.pathname.toLocaleLowerCase().includes("deepdive"))
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
    //Color Pallet
    if ($(".jscolor")[0] != undefined || $(".jscolor")[0] != null) {
        $(".jscolor")[0].jscolor.show();
        //Clear the Input val
        $(".jscolor").val('');
        //Update the Color
        recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
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
        if (controllername == "situationassessmentreport" && tableStructionModeForSAR.indexOf(selectedmeasureId.toString()) == -1) {
            $(".scrollable-columns-frame th.tbl-dta-metricsHding").each(function (i, d) {
                maxH = $(d).find(".tbl-algn-sar.tbl-text-upper")[0].offsetHeight > maxH ? $(d).find(".tbl-algn-sar.tbl-text-upper")[0].offsetHeight : maxH;
            });
        }
        else {
            $(".scrollable-columns-frame th.tbl-dta-metricsHding").each(function (i, d) {
                maxH = $(d).find(".tbl-algn.tbl-text-upper")[0].offsetHeight > maxH ? $(d).find(".tbl-algn.tbl-text-upper")[0].offsetHeight : maxH;
            });
        }
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
        if (modulename == "Table" || controllername == "situationassessmentreport") {
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
    var pos = $(this).offset();
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
    var topheaderhght = $('.report-sitn-output-header').height() + $('.report-sitn-output-header').height();
    if (controllername == "situationassessmentreport")
        $(".table-bottomlayer").css("height", "calc(100% - " + topheaderhght + ")");
    else
        $(".table-bottomlayer").css("height", "calc(100% - 119px)");

    $("#scrollableTable").css("height", "100%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");

    $("#scrollableTable .scrollable-rows-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    if (controllername != "situationassessmentreport") {
        $(".scrollable-columns-frame table tr th:not(.emptydiv),.scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTable .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", "150px").css("width", "100%");

    }

    //**---------- Patch code is added to fixe IE alinment issue in Chart Est. DeepDive (Table type) ------------**// (Added by Abhay Singh on 22-11-2017)
    if ($(".master_link.active").text().toUpperCase() == 'CHARTS') {
        if ((/*@cc_on!@*/false || !!document.documentMode) == true) {
            let minWidth = -9999;
            $(".scrollable-columns-frame table tr th:not(.emptydiv)").each(function (i, elem) {
                if ($(elem).outerWidth() > minWidth)
                    minWidth = $(elem).outerWidth();
            });
            $(".scrollable-columns-frame table tr td:not(.emptydiv), #scrollableTable .scrollable-data-frame table tr td:not(.emptydiv)").css("min-width", minWidth).css("width", "100%");
        }
    }
    //**--------------------------------------------------------------------------------------------------------**//


    $(".scrollable-columns-frame table tr th").css("height", "auto");

    $(".corner-frame table tr").eq(0).children("th").height($(".scrollable-columns-frame table tr").eq(0).children("th").height());
    $(".corner-frame table tr").eq(1).children("td").height($(".scrollable-columns-frame table tr").eq(1).children("td").height());

    $(".scrollable-columns-frame .emptydiv, #scrollableTable .scrollable-data-frame .emptydiv").css("min-width", "8px").css("width", "8px");
    //common code
    //Date: 27-12-2018
    var scrollheight = $(".scrollable-columns-frame").height() + 22;
    $("#scrollableTable .scrollable-rows-frame, #scrollableTable .scrollable-data-frame").css("height", "calc(100% - " + scrollheight + "px)");

    $("#scrollableTable .scrollable-data-frame table .tbl-data-btmbrd").css("width", "100%");
    if (controllername == "situationassessmentreport") {
        $(".corner-frame, .scrollable-rows-frame").css("width", "17%");
        $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "82.4%");
    }
    else {
        $(".corner-frame, .scrollable-rows-frame").css("width", "35%");
        $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "64.4%");
    }
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    //if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
    $(".scrollable-rows-table tr").each(function (i) {

        var height = $(this).height();

        if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART" && $(".pit-toggle").hasClass("active") == false && (i == 1 || i == 0)) {
            height = "25";
        }
        else {
            if (height < $(".scrollable-data-table tr").eq(i).height()) {
                height = $(".scrollable-data-table tr").eq(i).height();
            }
        }

        $(this).css("height", height + "px");
        $(this).children("td").css("height", height + "px");

        $(".scrollable-data-table tr").eq(i).css("height", height + "px");
        $(".scrollable-data-table tr").eq(i).children("td").css("height", height + "px");
    });
    //}
    //end
    if ($(".master_link.active").text().toUpperCase() == 'CHARTS') {
        $(".corner-frame").css("height", $(".scrollable-columns-frame").height() + "px");
        $(".corner-frame .tbl-dta-metricsHding").css("height", $(".scrollable-columns-frame").height() + "px");
    }
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
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "64.4%");
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
function ClearMeasures(groupname, parent_text, dataParent, key) {
    //added by Nagaraju  for clearing measures
    //Date: 11-09-2017
    var pText = "";
    if (groupname == "Metric Comparisons") {
        //
        var measure_pText = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
        var tocheck_pMeasureText = $($(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active").children(".lft-popup-ele-label")[0]).parent();
        var selectedIDs = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active");
        $.each(selectedIDs, function (index, ele) {
            $(ele).removeClass("lft-popup-ele_active");
            var element = $(ele).find(".lft-popup-ele-label");
            var ctrl2 = $(ele).parent().parent().parent().parent().find(".lft-ctrl2");
            removeSelectedPanelElement(true, element, ctrl2);
        });
        $(".master-lft-ctrl[data-val='Measures'] div").removeClass("lft-popup-ele_active");
        if ($($(tocheck_pMeasureText).parent().children()[1]).attr("parent-of-parent") == $($(key).parent().children()[1]).attr("data-val") || selectedIDs.length == 0) {
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[data-val="' + measure_pText + '"]').parent(".lft-popup-ele").show().removeClass("dynamic_show_hide_charts");
            $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + measure_pText + '"]').parent(".lft-popup-ele").show();
        }
    }
    //for Metric Comparisons
    pText = $(".master-lft-ctrl[data-val='Metric Comparisons']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
    if (pText != undefined) {
        $(".master-lft-ctrl[data-val='Measures']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
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
        $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
    }
    else {
        if (groupname != "Metric Comparisons")
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[data-id="' + dataParent + '"]').parent(".lft-popup-ele").show();
        if (groupname != "Demographic Filters")
            $(".master-lft-ctrl[data-val='Demographic Filters']").find('.lft-popup-ele-label[data-id="' + dataParent + '"]').parent(".lft-popup-ele").show();
    }

    //for Demographic Filters 
    pText = $(".master-lft-ctrl[data-val='Demographic Filters']").find(".lft-popup-ele_active").children(".lft-popup-ele-label").attr("parent-text");
    if (pText != undefined) {
        $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
        $(".master-lft-ctrl[data-val='Measures']").find('.lft-popup-ele-label[data-val="' + pText + '"]').parent(".lft-popup-ele").hide();
    }
    else {
        if (groupname != "Metric Comparisons")
            $(".master-lft-ctrl[data-val='Metric Comparisons']").find('.lft-popup-ele-label[data-id="' + dataParent + '"]').parent(".lft-popup-ele").show();
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
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 1 selection", "heading": "You can select only 1 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selection", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 25 Time Periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 time period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Establishments", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Establishments" }; break;
            }
            break;
        case "chartestablishmentdeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selection", "heading": "You can select 1 to 10 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 measure", "maxmessage": "You can select upto 25 time periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can make upto 1 selection", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 1, "max": 11, "minmessage": "Please select minimum 1 Metric Comparisons", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 1 to 11 Metric Comparisons" }; break;
            }
            break;
        case "chartbeveragecompare":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 11 selections", "heading": "You can select only 1 Measure" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Beverages", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Beverages" }; break;
            }
            break;
        case "chartbeveragedeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = istrend ? { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selection", "heading": "You can 1 to 10 Measures" } : { "min": 1, "max": 10, "minmessage": "Please select minimum 1 Measure", "maxmessage": "You can make upto 10 selections", "heading": "You can select 1 to 10 Measures" }; break;
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Beverage", "maxmessage": "You can make upto 1 selection", "heading": "You can select only one Beverage" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 1, "max": 11, "minmessage": "Please select minimum 1 Metric Comparisons", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 1 to 11 Metric Comparisons" }; break;
            }
            break;
        case "tableestablishmentcompare":
            switch (stubName) {
                case "Establishment": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Establishments", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Establishments" }; break;
            }
            break;
        case "tableestablishmentdeepdive":
            switch (stubName) {
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 25 Time Periods", "heading": "You can select from 2 to 25 Time Period" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can make upto 11 selections", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = istrend ? undefined : { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Metric Comparisons", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Metric Comparisons" }; break;
            }
            break;
        case "tablebeveragecomparison":
            switch (stubName) {
                case "Beverage": minmaxdata = { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Beverages", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Beverages" }; break;
            }
            break;
        case "tablebeveragedeepdive":
            switch (stubName) {
                case "Time Period": minmaxdata = istrend ? { "min": 1, "max": 25, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 25 Time Periods", "heading": "You can select from 2 to 25 Time Periods" } : { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Time Period", "maxmessage": "You can select upto 1 Time Period", "heading": "You can select only one Time Period" }; break;
                case "Beverage": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Beverage", "maxmessage": "You can make upto 1 selection", "heading": "You can select only one Beverage" }; break;
                case "Metric Comparisons": minmaxdata = istrend ? undefined : { "min": 2, "max": 11, "minmessage": "Please select minimum 2 Metric Comparisons", "maxmessage": "You can make upto 11 selections", "heading": "You can select from 2 to 11 Metric Comparisons" }; break;
            }
            break;
        case "analysesestablishmentcompare":
            switch (stubName) {
                case "Measures": minmaxdata = { "min": 3, "max": 110, "minmessage": "Please select minimum 3 Measures", "maxmessage": "You can make upto 11 selections", "heading": "You must select Minimum 3 measures" }; break;
                case "Establishment": minmaxdata = { "min": 3, "max": 1000, "minmessage": "Please select minimum 3 Establishments", "maxmessage": "You can make upto 11 selections", "heading": "You must select Minimum 3 Establishments" }; break;
            }
            break;
        case "analysesestablishmentdeepdive":
            switch (stubName) {
                case "Measures": minmaxdata = { "min": 3, "max": 110, "minmessage": "Please select minimum 3 Measures", "maxmessage": "You can make upto 11 selections", "heading": "You must select Minimum 3 measures" }; break;
                case "Establishment": minmaxdata = { "min": 1, "max": 1, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can make upto 1 selection", "heading": "You can select only one Establishment" }; break;
                case "Metric Comparisons": minmaxdata = { "min": 3, "max": 1000, "minmessage": "Please select minimum 3 Metric Comparisons", "maxmessage": "You can make upto 11 selections", "heading": "You must select Minimum 3 Metric Comparisons" }; break;
            }
            break;
        case "reportp2preport":
        case "reportdinerreport":
            switch (stubName) {
                case "Establishment": minmaxdata = { "min": 1, "max": 5, "minmessage": "Please select minimum 1 Establishment", "maxmessage": "You can make upto 5 selections", "heading": "You can select 1 to 5 Establishments" }; break;
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
    $(".loader").hide();
    $(".alert-message").text(message);
    $(".show-message-container, .transparentBGforAlert").show();
}
var showChannelAlert = function (message) {
    //alert(message);
    $(".loader").hide();
    //$(".temp-text").text(message);
    $(".channel-popuptext, .transparentBGforAlert").show();
}
$(document).on('click', '.alert-message-close', function (e) {
    $(".transparentBG").hide();
    $(".transparentBG-for-p2p").hide();
    $(".show-message-container, .transparentBGforAlert,.channel-popuptext").hide();
});
/*End show max message @pkr*/
/*Start Color picker @pkr*/
function update(picker) {
    $(".redVal>input").val(Math.round(picker.rgb[0]));
    $(".greenVal>input").val(Math.round(picker.rgb[1]));
    $(".blueVal>input").val(Math.round(picker.rgb[2]));
    //Clear the Input val
    $(".jscolor").val('');
}
var performUpFunc = function (tempclass) {
    console.log("a");
    var curInputEle = $("." + tempclass + ">input");
    var tempVal = $(curInputEle).val();
    if (tempVal == undefined || tempVal == null || isNaN(tempVal)) {
        $(curInputEle).val(0);
    } else {
        if (tempVal < 255) {
            $(curInputEle).val(++tempVal);
        }
        if (tempVal > 255) {
            $(curInputEle).val(255);
        }
        if (tempVal < 0) {
            $(curInputEle).val(0);
        }
    }
    //Update the Color
    recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
}
var performDownFunc = function (tempclass) {
    var curInputEle = $("." + tempclass + ">input");
    var tempVal = $(curInputEle).val();
    if (tempVal == undefined || tempVal == null || isNaN(tempVal)) {
        $(curInputEle).val(0);
    } else {
        if (tempVal > 0) {
            $(curInputEle).val(--tempVal);
        }
        if (tempVal < 0) {
            $(curInputEle).val(0);
        }
        if (tempVal > 255) {
            $(curInputEle).val(255);
        }
    }
    //Update the Color
    recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
}
$(document).on('click', '.updownDiv .up', function (e) {
    var tempclass = $(this).attr('data-val');
    performUpFunc(tempclass);
});
$(document).on('click', '.updownDiv .down', function (e) {
    var tempclass = $(this).attr('data-val');
    performDownFunc(tempclass);

});
//Continuos Click
$(document).on('mousedown', '.updownDiv .up', function () {
    var tempclass = $(this).attr('data-val');
    intForContinuous = setInterval(function (tempClass) {
        performUpFunc(tempclass);
    }, 100);
});
$(document).on('mouseup', '.updownDiv .up', function () {
    clearInterval(intForContinuous);
});
$(document).on('mousedown', '.updownDiv .down', function () {
    var tempclass = $(this).attr('data-val');
    intForContinuous = setInterval(function (tempClass) {
        performDownFunc(tempclass);
    }, 100);
});
$(document).on('mouseup', '.updownDiv .down', function () {
    clearInterval(intForContinuous);
});
var recalibrateColorfronInput = function (r, g, b) {
    if (!(r == undefined || g == undefined || b == undefined)) {
        var red = colorValCheck($(r).val());
        var green = colorValCheck($(g).val());
        var blue = colorValCheck($(b).val());
        //Set the colorCodeDisplay input BG color
        $(".jscolor").css('background-color', 'rgb(' + red + ',' + green + ',' + blue + ')');
    }
}
var colorValCheck = function (num) {
    if (num == null || num == undefined || isNaN(num) || num > 255 || num < 0) {
        return -1;
    }
    else {
        return +num;
    }
}
var setValueBackInRangeOnKeyChange = function (ele) {
    var num = $(ele).val();
    if (num == null || num == undefined || isNaN(num)) {
        $(ele).val(0);
    } else {
        if (num > 255) { $(ele).val(255); }
    }
    $(ele).val(+($(ele).val()));
}
/*Start Keyup event to Chane the color code*/
$(document).on('keydown', '.valDisplay>input', function (event) {
    var keys = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
    if (ctrlUp && event.which == 65) { } else {
        if ((event.which != 8) && (event.key != "Tab") && (event.which != "Control") && (keys.indexOf(event.key) != -1 || event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    }
    if (event.key == "Control") { ctrlUp = true; } else { ctrlUp = false; }
});
$(document).on('keyup', '.valDisplay>input', function () {
    setValueBackInRangeOnKeyChange($(this));
    //Update the Color
    recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
});
$(document).on('click', '#colorpalletmaincontainer .color_ok', function () {
    //Apply validation
    CallvalidateColorCode();
});
$(document).on('click', '#colorpalletmaincontainer .color_cancel', function () {
    $(".custom-estcolordiv").removeClass("active");
    $(".colorpalletwithTranslucentBG").hide();
});
$(document).on('click', '.custom-estcolordiv', function () {
    $(".custom-estcolordiv").removeClass("active");
    $(this).addClass('active');
    //Update the color in pallet
    var rgbarr = $(this).css('background-color').replace(/rgb| |\(|\)/g, '').split(',');
    $('.redVal>input').val(rgbarr[0]);
    $('.greenVal>input').val(rgbarr[1]);
    $('.blueVal>input').val(rgbarr[2]);
    recalibrateColorfronInput($('.redVal>input'), $('.greenVal>input'), $('.blueVal>input'));
    //Show color pallet
    $(".colorpalletwithTranslucentBG").show();
});
function rgbToHex(r) {
    return "#" + ((1 << 24) + (+r[0] << 16) + (+r[1] << 8) + +r[2]).toString(16).slice(1);
}
var assignfillcolorinpopup = function (dtval) {
    var tempInd = 0;
    $(".custom-estcolordiv").each(function (i, d) {
        var tempColorcode = $('.master-lft-ctrl[data-val="' + dtval + '"] .lft-popup-ele-label[data-id=' + $(d).attr("id") + ']').attr("colorcode");//Get from establishments
        if (tempColorcode != undefined && tempColorcode != null && tempColorcode != "null" && tempColorcode != "") {
            //Assign bg-color
            $(d).css('background-color', tempColorcode);
            $(d).attr('colorcode', tempColorcode);
            $(d).attr('originalcolor', tempColorcode);
        } else {
            //Assign color from defaultcolors
            $(d).css('background-color', defaultchartColors[tempInd]);
            $(d).attr('colorcode', defaultchartColors[tempInd]);
            $(d).attr('originalcolor', defaultchartColors[tempInd]);
            tempInd++;
        }

    });
}

var validateColorCode = function (dataval) {
    $(".colorpalletwithTranslucentBG").hide();

    //get current selected colorcode in Hex form
    var tempCode = (rgbToHex($(".jscolor").css('background-color').replace(/rgb| |\(|\)/g, '').split(','))).toLocaleLowerCase();

    //Return if hex code is same as previous - check 1
    if (tempCode == $(".custom-estcolordiv.active").attr('colorcode') || tempCode.toLocaleUpperCase() == $(".custom-estcolordiv.active").attr('colorcode')) {
        $(".custom-estcolordiv").removeClass('active');
        return;
    }

    //Check if the color is one of the default colors - check 2
    if (defaultchartColors.indexOf(tempCode) != -1 || defaultchartColors.indexOf(tempCode.toLocaleUpperCase()) != -1) {
        showMaxAlert("You can not select among default colors.");
        $(".custom-estcolordiv").removeClass('active');
        return;
    }

    //Check if it already selected in current list - check 3
    var isThere = false;
    $(".custom-estcolordiv:not(.active)").each(function (i, d) {
        if ($(d).attr('colorcode') == tempCode || $(d).attr('colorcode') == tempCode.toLocaleUpperCase()) {
            isThere = true;
            return false;
        };
    });
    if (isThere) {
        showMaxAlert("Selected color is already assigned.");
        $(".custom-estcolordiv").removeClass('active');
        return;
    }

    //Check if the same exist in Establishment or not - check 4
    //------------------ Color code validation from db side -------------------// added by abhay singh (14-11-2017)
    let changedColorCodeList = [];
    let selectionId = $(".custom-estcolordiv.active").attr('id');
    if (dataval == "Measures") {
        let colorCodeObj = {
            ColourCode: tempCode,
            Establishmentid: '',
            MeasureId: selectionId,
            GroupsId: '',
            IsTrend: IsPIT_TREND
        };
        changedColorCodeList.push(colorCodeObj);
    }
    else if (dataval == "Establishment") {
        let colorCodeObj = {
            ColourCode: tempCode,
            Establishmentid: selectionId,
            MeasureId: '',
            GroupsId: '',
            IsTrend: IsPIT_TREND
        };
        changedColorCodeList.push(colorCodeObj);
    }
    else if (dataval == "Metric Comparisons") {
        let colorCodeObj = {
            ColourCode: tempCode,
            Establishmentid: '',
            MeasureId: '',
            GroupsId: selectionId,
            IsTrend: IsPIT_TREND
        };
        changedColorCodeList.push(colorCodeObj);
    }
    else if (dataval == "Beverage") {
        let colorCodeObj = {
            ColourCode: tempCode,
            Establishmentid: selectionId,
            MeasureId: '',
            GroupsId: '',
            IsTrend: IsPIT_TREND
        };
        changedColorCodeList.push(colorCodeObj);
    }

    let IsBeverageModule = false;
    if (controllername == "chartestablishmentcompare" || controllername == "chartestablishmentdeepdive")
        IsBeverageModule = false;
    else if (controllername == "chartbeveragecompare" || controllername == "chartbeveragedeepdive")
        IsBeverageModule = true;

    $.ajax({
        url: appRouteUrl + "Chart/ValidatePalletteColor",
        data: JSON.stringify({ ChangedColorCodeList: changedColorCodeList, IsBeverageModule: IsBeverageModule }),
        method: "POST",
        async: false,
        contentType: "application/json",
        success: function (response) {
            if (response != "SUCCESS") {
                showMaxAlert("Selected color is already assigned.");
                $(".custom-estcolordiv").removeClass('active');
                return;
            }
        },
        error: ajaxError
    });
    //-------------------------------------------------------------------------//
    var est_with_color_Code = $('.master-lft-ctrl[data-val="' + dataval + '"] .lft-popup-ele-label[colorcode="' + tempCode + '"]');
    est_with_color_Code = (est_with_color_Code.length == 0 ? $('.master-lft-ctrl[data-val="' + dataval + '"] .lft-popup-ele-label[colorcode="' + tempCode.toLocaleUpperCase() + '"]') : est_with_color_Code);
    if (est_with_color_Code.length != 0) {
        //Check if that establishments color is updated in popup or not
        //Get id of est
        var t_id_ele = $(".custom-estcolordiv[id='" + $(est_with_color_Code).attr('data-id') + "']");
        t_id_ele = (t_id_ele.length == 0 ? $(".custom-estcolordiv[id='" + $(est_with_color_Code).attr('data-id') + "']") : t_id_ele);
        if (t_id_ele.length == 0) {
            showMaxAlert("Selected color is already assigned.");
            $(".custom-estcolordiv").removeClass('active');
            return;
        } else {
            //Compare tempCode with t_id_ele colorcode
            if ($(t_id_ele).attr('colorcode') == tempCode || $(t_id_ele).attr('colorcode') == tempCode.toLocaleUpperCase()) {
                showMaxAlert("Selected color is already assigned.");
                $(".custom-estcolordiv").removeClass('active');
                return;
            }
        }
    }

    //Code for unassigned colorcode
    //Change the active box color bg, also set color-id
    $(".custom-estcolordiv.active").css('background-color', tempCode);
    $(".custom-estcolordiv.active").attr('colorcode', tempCode);
    $(".custom-estcolordiv").removeClass('active');
}

var getChangesColorToStore = function () {
    var changColorList = [];
    //Get color code from each elements compare with their old values
    $(".custom-estcolordiv").each(function (i, d) {
        if ($(d).attr('colorcode').toLocaleLowerCase() != $(d).attr('originalcolor').toLocaleLowerCase()) {
            //Add to list
            changColorList.push({
                "id": $(d).attr('id'),
                "name": $(d).attr('id'),
                "colorcode": $(d).attr('colorcode')
            });
        }
    });
    return changColorList;
}
/*End Color picker @pkr*/
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

function ReWriteHost(_url) {
    return _url.toLowerCase().replace("{host}", window.location.hostname);
}

function GoToKIHomePage(page, SSOUrl, SSOLogOut) {
    jQuery.ajax({
        type: "POST",
        url: appRouteUrl + "Home/GetKIUserDetails",
        async: false,
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (content) {
            if (content == null || content == '') {
                if (SSOUrl == "true") {
                    window.location.href = page + "/Views/Home.aspx?signout=true";
                }
                else {
                    window.location.href = page + "Login.aspx?signout=true";
                }
                return false;

            }
            $("#KIHome").remove();
            var form = $(document.createElement('form'));
            $(form).attr("id", "KIHome");
            $(form).attr("action", ReWriteHost(page) + "Views/Home.aspx");
            $(form).attr("method", "POST");
            //$(form).attr("target", "target");

            var input_UserName = $("<input>")
               .attr("type", "hidden")
               .attr("name", content.UserName_Str)
               .val(content.UserName);
            $(form).append($(input_UserName));

            var input_B3 = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.B3_Str)
           .val(content.B3);
            $(form).append($(input_B3));

            var input_BGM = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.BGM_Str)
            .val(content.BGM);
            $(form).append($(input_BGM));

            var input_CBL = $("<input>")
             .attr("type", "hidden")
             .attr("name", content.CBL_Str)
             .val(content.CBL);
            $(form).append($(input_CBL));

            var input_Groups = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.Groups_Str)
            .val(content.Groups);
            $(form).append($(input_Groups));

            var input_Name = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.Name_Str)
            .val(content.Name);
            $(form).append($(input_Name));

            var input_Role = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.Role_Str)
           .val(content.Role);
            $(form).append($(input_Role));

            var input_UserID = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.UserID_Str)
           .val(content.UserID);
            $(form).append($(input_UserID));

            var input_iSHOP = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.iSHOP_Str)
           .val(content.iSHOP);
            $(form).append($(input_iSHOP));

            var input_Password = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.Password_Str)
            .val(content.Password);
            $(form).append($(input_Password));


            var input_Bev360Drinkers = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.Bev360Drinkers_Str)
           .val(content.Bev360Drinkers);
            $(form).append($(input_Bev360Drinkers));

            var input_Bev360Drinks = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.Bev360Drinks_Str)
            .val(content.Bev360Drinks);
            $(form).append($(input_Bev360Drinks));

            var input_CBLV2 = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.CBLV2_Str)
            .val(content.CBLV2);
            $(form).append($(input_CBLV2));

            var input_CREST = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.CREST_Str)
            .val(content.CREST);
            $(form).append($(input_CREST));

            var input_DINE = $("<input>")
            .attr("type", "hidden")
            .attr("name", content.DINE_Str)
            .val(content.DINE);
            $(form).append($(input_DINE));

            var input_EmailId = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.EmailId_Str)
           .val(content.EmailId);
            $(form).append($(input_EmailId));

            var input_Login_Flag = $("<input>")
           .attr("type", "hidden")
           .attr("name", content.Login_Flag_Str)
           .val(content.Login_Flag);
            $(form).append($(input_Login_Flag));

            form.appendTo(document.body);
            $(form).submit();
            $("#KIHome").remove();
        },
        error: function (error) {
            //alert(error);
            if (SSOUrl == "true") {
                window.location.href = page + "/Views/Home.aspx?signout=true";
            }
            else {
                window.location.href = page + "Login.aspx?signout=true";
            }
        }
    });
}

var searchTextBoxAutoComplete = function (searchlevel, labelID, searchArray, label) {
    $(".lft-popup-col" + searchlevel + " #search-list-" + labelID).autocomplete({ source: [] });
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
                if (label == "Beverage" && listofOthers.indexOf(ui.item.value[0].id) > -1)
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else if (label == "Metric Comparisons")
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else if (controllername == 'situationassessmentreport' && (label == "Competitors" || label == "Establishment"))
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + ui.item.value[0].id + '"]').first();
                else if (label == "Measures" && controllername == "analysesestablishmentcompare")
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + ui.item.value[0].id + '"]').first();
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
            var _lbserachparent = "";
            if (controllername == 'situationassessmentreport' && (label == "Competitors" || label == "Establishment"))
                _lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + ui.item.value[0].id + '"]');
            else
                _lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]');
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
        cache: false,
        clear: true,
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
var seartTextBoxAutoCompleteSitn = function (searchlevel, labelID, searchArray, label) {
    $(".lft-popup-col" + searchlevel + " #search-list-sitn-" + labelID).autocomplete({ source: [] });
    $(".lft-popup-col" + searchlevel + " #search-list-sitn-" + labelID).autocomplete({
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
                if (label == "Beverage" && listofOthers.indexOf(ui.item.value[0].id) > -1)
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else if (label == "Metric Comparisons")
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-parent-search-name="' + selectedValue + '"]').first();
                else if (controllername == 'situationassessmentreport' && (label == "Competitors" || label == "Establishment"))
                    lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + ui.item.value[0].id + '"]').first();
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
            var _lbserachparent = "";
            if (controllername == 'situationassessmentreport' && (label == "Competitors" || label == "Establishment"))
                _lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-id="' + ui.item.value[0].id + '"]');
            else
                _lbserachparent = $('.master-lft-ctrl[data-val="' + label + '"]').find('.lft-popup-ele-label[data-isselectable=true][data-val="' + selectedValue + '"]');
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

            $("#search-list-sitn-" + labelID).val($(lbserachparent).html());
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
        cache: false,
        clear: true,
        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                $('.lft-popup-col' + searchlevel + ' #search-list-sitn-' + label).val();
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

var removePreviousPeriodYear = function () {
    var csbseLit = $('.filter-info-panel-lbl[parent-of-parent=CustomBase]');
    $.each(csbseLit, function (i, v) {

    });

}

var getFirstMonthYearOfTimePeriod = function (month, year, TimeperiodType) {
    if (TimeperiodType.trim() == '3MMT') {
        year = (month - 2) <= 0 ? (year - 1) : year;
        month = (month - 2) <= 0 ? (month + 10) : (month - 2);
    }
    else if (TimeperiodType.trim() == '12MMT') {        
        year = (month - 11) <= 0 ? (year - 1) : year;
        month = (month - 11) <= 0 ? (month + 1) : (month - 11);
    }
    else if (TimeperiodType.trim() == '6MMT') {        
        year = (month - 5) <= 0 ? (year - 1) : year;
        month = (month - 5) <= 0 ? (month + 7) : (month - 5);
    }
    return year
}
var getMonth = function (month) {
    month = month.trim().toUpperCase();
    var returnedMonth = 1;
    switch (month) {
        case 'JAN': returnedMonth = 1; break;
        case 'FEB': returnedMonth = 2; break;
        case 'MAR': returnedMonth = 3; break;
        case 'APR': returnedMonth = 4; break;
        case 'MAY': returnedMonth = 5; break;
        case 'JUN': returnedMonth = 6; break;
        case 'JUL': returnedMonth = 7; break;
        case 'AUG': returnedMonth = 8; break;
        case 'SEP': returnedMonth = 9; break;
        case 'OCT': returnedMonth = 10; break;
        case 'NOV': returnedMonth = 11; break;
        case 'DEC': returnedMonth = 12; break;
    }
    return returnedMonth;
}

var globallocalstoragecache = "300.20";
