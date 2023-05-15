/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />

var isInitialLoad = true, defaultGuestsSelect = true, isVisitsSelected = false, LastSelected = 0; var selectedPrevisTopFltrId = "", selectedPrevisTopFltrId = "", togetPrevisSelctedVis = "";
$(window).resize(function () {
    setWidthforTableColumns();
    setMaxHeightForHedrTble();
    SetTableResolution();
});
var app = angular.module("mainApp");
app.controller("tableController", ["$rootScope", "$scope", '$q', "$http", "$timeout", function ($rootScope, $scope, $q, $timeout) {
    $scope.subfilters = [];
    $scope.tableData = [];
    $scope.subfilterEstablishment = [];
    var isSatisDriTop2Box = false;
    var isSatisfactionDrivers = false;

    //path of  the page
    var pathname = window.location.pathname;
    var fileNameIndex = pathname.lastIndexOf("/") + 1;
    var filename = pathname.substr(fileNameIndex);
    //
    $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);
    function defaultCustomFreqncySelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                var selctedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
                if ($(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                    resolve('Successful');
                } else {
                    $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                        if (selectedFrequencyToCarryFrwd_flag == 1 || selectedFrequencyToCarryFrwd == "")
                            $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                        else
                            $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='" + selectedFrequencyToCarryFrwd + "']").click();
                    if (IsPIT_TREND) {
                        IsPIT_TREND = false;
                        return false;
                    }
                    if (isInitialLoad == false) {
                        if (isCustomBaseSelect)
                            $scope.prepareContentArea("custombase");
                        else
                            if (selctedTopFilterId != "5")
                                $scope.prepareContentArea("");
                    }
                    reject('Error');
                }
            }, 10);
        });
    }

    $scope.buildMenu = function () {
        //var menuData = clientDataStorage.get(controllername);
        //if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Table/GetFilter/" + controllername, async: false, success: function (response) {
                    //$scope.filters = inlineLevelsForMenu(response);
                    $scope.filters = response;
                    left_Menu_Data = response;
                    clientDataStorage.store(controllername, JSON.stringify(response));
                }, error: ajaxError
            });
        //}
        //else {
        //    var response = JSON.parse(menuData);
        //    $scope.filters = response;
        //    left_Menu_Data = response;
        //}
        //added by Nagaraju for individual filters
        //Date: 07-08-2017           
        $scope.limit = 1;
    }

    $scope.buildAdvancedMenu = function () {
        var bitData = 0;
        if (controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive")
            bitData = 1;
        var menuData = clientDataStorage.get(controllername + "_advance" + bitData);
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Table/GetAdvancedFilters?id=tableadvancedfilter&bitData=" + bitData, async: false, success: function (response) {
                    if (controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive") {
                        $scope.advanceFilter = response;
                        $scope.advanceFilter[2].CssName = response[2].CssName + " Guests";
                        clientDataStorage.store(controllername + bitData, JSON.stringify(response));
                    }
                    else {
                        $scope.advanceFilter = response;
                        clientDataStorage.store(controllername + "_advance" + bitData, JSON.stringify(response));
                    }
                }, error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
            if (controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive") {
                $scope.advanceFilter = response;
                $scope.advanceFilter[2].CssName = response[2].CssName + " Guests";
            }
            else
                $scope.advanceFilter = response;
        }
    }

    $scope.prepareContentArea = function (isSubmitOrApplyFilter) {
        $(".advance-filters").removeClass("hideFilters");
        if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
            $scope.showMoreLess();
        }
        $('.table-bottomlayer').html('');
        $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);

        if (prepareFilter() == false) {
            //Reset previsSelectedStatTest
            $(".table-stat").removeClass("activestat");
            $("#" + previsSelectedStatTest).addClass("activestat");
            $(".advance-filters, .transparentBG, .loader").hide();
            return false;
        }
        reset_img_pos();
        if (isSubmitOrApplyFilter == "submit" || isSubmitClicked == false) {
            //to make Guests as default measure 
            if (defaultGuestsSelect) {
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $scope.subfilters = $scope.advanceFilter[2].Filters;
                $scope.subfilterEstablishment = $scope.advanceFilter[2].Filters;
                //if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                //    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                //}
                //else {
                if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                    if (filename == "BeverageDeepDive" || filename == "BeverageCompare")
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                    else
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Quarterly+']").click();
                }
                //}
                defaultGuestsSelect = false;
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
            }
            isCustomBaseSelect = false;
        }
        var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
        var activeFrequency = $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele_active").find(".lft-popup-ele-label").text();
        //Selcted Frequency to carry Forward based on guests or visits 
        if (rtnSelctedFilterId == "9" && activeFrequency == "Total Visits") {
            if (filename == "BeverageDeepDive" || filename == "BeverageCompare")
                selectedFrequencyToCarryFrwd = "Monthly+";
            else
                selectedFrequencyToCarryFrwd = "Quarterly+";
        }
        else
            if (togetPrevisSelctedVis == "Guest" && (selectedPrevisTopFltrId == "5" || selectedPrevisTopFltrId == "8" || selectedPrevisTopFltrId == "9")) {
                if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Total Visits']").click();
                    selectedFrequencyToCarryFrwd_flag = 1;
                }
            }
            else {
                selectedFrequencyToCarryFrwd = $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele_active").find(".lft-popup-ele-label").text();
            }
        //
        if ($("#table-custombse").hasClass('activestat') == true || isSubmitOrApplyFilter == "custombase") {
            isCustomBaseSelect = true;
            customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
        }
        else if (isSubmitOrApplyFilter == "applyfilter") {
            if ($("#table-custombse").hasClass('activestat')) {
                isCustomBaseSelect = true;
                customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
            } else { isCustomBaseSelect = false; customBaseSelctdText = ""; }
        }
        else {
            isCustomBaseSelect = false; customBaseSelctdText = "";
        }
        if (isSubmitOrApplyFilter != "statTest" && isSubmitOrApplyFilter != "custombase" && isSubmitOrApplyFilter != "applyfilter") {
            if (isCustomBaseSelect) {
                $(".table-stat").removeClass("activestat");
                $('#table-custombse').addClass("activestat");
                selectedstatTestToCarryFrwd = "table-custombse";
                previsSelectedStatTest = "table-custombse";
            }
            else {
                ////to make default Previous period Stat test
                //if (selectedstatTestToCarryFrwd == "table-prevsperiod" || selectedstatTestToCarryFrwd == "") {
                //    $(".table-stat").removeClass("activestat");
                //    $("#table-prevsperiod").addClass("activestat");
                //    previsSelectedStatTest = "table-prevsperiod";
                //}
                //else {
                //    $(".table-stat").removeClass("activestat");
                //    $('#' + selectedstatTestToCarryFrwd).addClass("activestat");
                //    previsSelectedStatTest = selectedstatTestToCarryFrwd;
                //}
                //
            }

        }
        if (isSubmitClicked == false) { leftpanelchanged = false; }
        if (leftpanelchanged) {
            var curID = "table-ttldine";
            if (controllername == "tablebeveragedeepdive" || controllername == "tablebeveragecomparison") {
                curID = "table-prevsperiod";
            }
            //to make default Previous period Stat test
            $(".table-stat").removeClass("activestat");
            $("#" + curID).addClass("activestat");
            previsSelectedStatTest = curID;
            $('.stat-cust-estabmt.stat-cust-active').removeClass("stat-cust-active");
            //            
        }
        leftpanelchanged = false;
        //if (prepareFilter() == false)
        //{
        //    //Reset previsSelectedStatTest
        //    $(".table-stat").removeClass("activestat");
        //    $("#" + previsSelectedStatTest).addClass("activestat");
        //    return false;
        //}
        var filterPanelInfo = {
            filter: JSON.parse($("#master-btn").attr('data-val'))
        };
        var selectedMeasureType;
        //var visitsList = ["1", "2", "3"];


        if (rtnSelctedFilterId == "1") {
            if (rtnSelctedFilterId)
                if ($('#guest-visit-toggle').hasClass('activeToggle'))
                { selectedMeasureType = $(".adv-fltr-guest").text(); } else {
                    selectedMeasureType = $(".adv-fltr-visit").text();
                }
        }
        else {
            selectedMeasureType = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").parent().parent().attr("data-val");
        }

        //if ($($(".master-lft-ctrl[data-val=FREQUENCY]").find(".lft-ctrl3")[0]).find(".lft-popup-ele_active").length == 0) {
        //    alert("Frequency is required");
        //    return false;
        //}

        $(".advance-filters").css("display", "block");
        $(".table-statlayer").css("display", "block");
        $(".guestFrqncy").show();
        $("#scrollableTable").show();
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $('.fltr-txt-hldr').css("color", "#000");
        $("#flexi-table").html("");
        $("#flexi-table").attr("data-val", "");
        if ($(".loader").is(":visible") == false) {
            $(".loader,.transparentBG").show();
        }
        var timePeriodType = $(".pit").hasClass("active") == true ? "pit" : "trend";


        var filterdata = {
            filter: filterPanelInfo.filter, module: controllername, measureType: selectedMeasureType, customBaseText: customBaseSelctdText, timePeriodType: timePeriodType
        };
        $.ajax({
            url: appRouteUrl + "Table/GetTable",
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loader").hide();
                $(".transparentBG").hide();
                if (response.GetTableDataResopnse != undefined) {
                    if (response.GetTableDataResopnse.GetTableDataRespDt.length == 0)
                        $(".table-bottomlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                    else {
                        $scope.tableData = $scope.plotTableData(prepareTable(response.GetTableDataResopnse.GetTableDataRespDt), response.Columns,
                            getSampleSize(response.GetTableDataResopnse.GetTableDataRespDt));


                    }
                } else {
                    $(".table-bottomlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                }
            },
            error: ajaxError
        });
        isSubmitClicked = true;
        $(".advance-filters").removeClass("hideFilters");
        $(".table-bottomlayer").css("margin-top", "0px");

        //To append Guest/Visit Text in breadcrum Added by Bramhanath(15-11-2017)
        var selectedVisitsorGuests = $('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)" ? 'VISITS' : 'GUEST';
        if ($($(".filter-info-panel-elements")[0]).find(".Guest_Visit").length == 0)
            $(".filter-info-panel-elements").prepend("<div class='Guest_Visit topdiv_element'><div class='filter-info-panel-lbl'> <span class='left'> " + selectedVisitsorGuests + " </span></div><span class='pipe'>| </span></div>");
        else
            $(".Guest_Visit .filter-info-panel-lbl").html("<span class='left'> " + selectedVisitsorGuests + "</span>");
        //

        SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8, true);
    }


    $scope.removeBlankSpace = function (object) {
        var text = ""; var response = "";
        if (object != null && object != "") {
            object = object.trim();
            text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '').replace(/\!/g, '');
        }
        if (text == "")
            response = text;
        else
            response = text.toLowerCase();

        return response;
    }
    $scope.buildMenu();
    $scope.buildAdvancedMenu();
    syncFilterPanel();

    //tempdata(output)
    $scope.tempdata = [];

    function syncFilterPanel() {
        var leftPanel = {
            ctrl: [
                {
                    ctrlText: "",
                    data: [{ Text: "" }]
                }
            ]
        };
        return $q(function (resolve, reject) {
            setTimeout(function () {
                if (fillFilterPanel(leftPanel)) {
                    resolve('Successful');
                } else {
                    reject('Error');
                }
            }, 1000);
        });
    }

    //table tree view added by Bramhanath()
    $scope.greaterThan = function (prop, val) {
        return function (item) {
            return item[prop] > val;
        }
    }

    //
    $scope.toggleclick = function () {
        clearAdvanceFilters();//To clear Advance Filters  
        //To show frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
        $(".adv-fltr-sub-frequency").show();
        $("#addtnal-firstseptor").show();
        $("#addtnal-secndseptor").show();
        //End
        if ($(".loader").is(":visible") == false) {
            $(".loader,.transparentBG").show();
        }

        if ($('#guest-visit-toggle').hasClass('activeToggle')) {
            $('#guest-visit-toggle').removeClass('activeToggle');

            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.subfilters = $scope.advanceFilter[1].Filters;
                    $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                });
            }, 5);


            $(".adv-fltr-guest").css("color", "#000");
            $(".adv-fltr-visit").css("color", "#f00");
            isVisitsSelected = true;
            LastSelected = 1;
            $(".centerAlign").css("left", "34%");

        } else {
            $('#guest-visit-toggle').addClass('activeToggle');
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.subfilters = $scope.advanceFilter[2].Filters;
                    $scope.subfilterEstablishment = $scope.advanceFilter[2].Filters;
                });
            }, 5);

            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            isVisitsSelected = false;
            LastSelected = 0;
            $(".centerAlign").css("left", "42%");
        }
        if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
            if (isVisitsSelected == true) {
                //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                $(".adv-fltr-sub-frequency").hide();
                $("#addtnal-firstseptor").hide();
                $("#addtnal-secndseptor").hide();
                //End

                $('.adv-fltr-sub-establmt').show();
            }
            else {
                $('.adv-fltr-sub-establmt').hide();
            }
            if (isVisitsSelected == 1) {
                selectedFrequencyToCarryFrwd = "Total Visits";
            }
            else {
                selectedFrequencyToCarryFrwd = "Quarterly+";
            }
            defaultFreqncyForBeverageSelctn();
            $(".adv-fltr-selection").css("margin-left", "0%");
        }
        else {
            if (isVisitsSelected == false)
                selectedFrequencyToCarryFrwd = "Quarterly+";
            else
                selectedFrequencyToCarryFrwd = "Total Visits";
            $('.adv-fltr-sub-establmt').hide();
            defaultFreqncySelctn();
        }
        isFrqncyInBrandHlthMtricChanged = false;
    };
    //
    $scope.showSubOptions = function (optionText, event) {

        if (controllername == "tablebeveragedeepdive") {
            if (optionText == "In-Establishment Bev Details")
                return;
        }

        if ($(".advance-filters").is(":visible") == true && IsPIT_TREND == false) {
            $(".loader,.transparentBG").show();
        }
        selectedPrevisTopFltrId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");//to get selected top filterid of previous id
        togetPrevisSelctedVis = $('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)" ? 'Visits' : 'Guest';
        $(".adv-fltr-label").removeClass("adv-fltr-label-DemoGraphicProfiling");
        $(".adv-fltr-label").removeClass("Visits-box");
        $(".adv-fltr-label").removeClass("Guests-box");
        $(".adv-fltr-label").removeClass("DemoGraphicProfiling-box");
        $(".adv-fltr-label").removeClass("Visits-right-skew");
        $(".adv-fltr-label").removeClass("Guests-right-skew");
        $(".adv-fltr-label").removeClass("DemoGraphicProfiling-right-skew");
        $(".adv-fltr-label").removeClass("adv-fltr-label-Guests");
        //path of  the page
        var pathname = window.location.pathname;
        var fileNameIndex = pathname.lastIndexOf("/") + 1;
        var filename = pathname.substr(fileNameIndex);
        //

        var selctedTopFilterIdBefore = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");//to get selected top filterid
        var topFilterListVisits = ["2", "3", "4", "7"];
        if (topFilterListVisits.indexOf(selctedTopFilterIdBefore) > -1) {
            if (filename == "BeverageDeepDive" || filename == "BeverageCompare")
                selectedFrequencyToCarryFrwd = "Monthly+";
            else
                selectedFrequencyToCarryFrwd = "Quarterly+";
        }
        var ele = event.currentTarget;
        var pele = event.currentTarget.parentElement.parentElement;
        var data_val = $(pele).attr("data-val");
        $(ele).addClass(data_val + "-box");
        $(ele).addClass(data_val + "-right-skew");
        $(".adv-fltr-label").css("color", "#000000");
        $(ele).css("color", "#fff");

        ////to make default Previous period Stat test
        //if (!isCustomBaseSelect) {
        //    //to make default Previous Selected Stat test
        //    if (selectedstatTestToCarryFrwd == "table-prevsperiod" || selectedstatTestToCarryFrwd == "") {
        //        $(".table-stat").removeClass("activestat");
        //        $("#table-prevsperiod").addClass("activestat");
        //        previsSelectedStatTest = "table-prevsperiod";
        //    }
        //    else {
        //        //to make default Previous period Stat test
        //        $(".table-stat").removeClass("activestat");
        //        $('#' + selectedstatTestToCarryFrwd).addClass("activestat");
        //        previsSelectedStatTest = selectedstatTestToCarryFrwd;
        //        //
        //    }
        //    //
        //}
        ////

        var selctedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");//to get selected top filterid
        if (selctedTopFilterId != "5" && selctedTopFilterId != "9") {
            clearConsumedFrequecnyFilters();
        }
        selectedFrequencyToCarryFrwd_flag = 0;
        $(".centerAlign").css("left", "42%");

        //To show frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
        $(".adv-fltr-sub-frequency").show();
        $("#addtnal-firstseptor").show();
        $("#addtnal-secndseptor").show();
        //End
        switch (optionText) {
            case "DemoGraphicProfiling":
                if (selectedFrequencyToCarryFrwd == "Total Visits") {
                    if (filename == "BeverageDeepDive" || filename == "BeverageCompare")
                        selectedFrequencyToCarryFrwd = "Monthly+";
                    else
                        selectedFrequencyToCarryFrwd = "Quarterly+";

                }
                $(".adv-fltr-toggle-container").show();
                $(".centerAlign").css("left", "42%");
                $(".adv-fltr-guest").css("color", "#f00");
                $(".adv-fltr-visit").css("color", "#000");

                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[2].Filters;
                        $scope.subfilterEstablishment = $scope.advanceFilter[2].Filters;
                    });
                }, 5);
                isVisitsSelected = false;

                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    defaultFreqncyForBeverageSelctn();
                    //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                    $(".adv-fltr-sub-frequency").show();
                    $("#addtnal-firstseptor").show();
                    $("#addtnal-secndseptor").hide();
                    //End
                }
                else {
                    defaultFreqncySelctn();
                }
                if ($("#guest-visit-toggle").hasClass("activeToggle")) {
                    $("#guest-visit-toggle").prop("checked", true);
                }
                else {
                    if ($('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)") {
                        if ($("#guest-visit-toggle").hasClass("activeToggle")) {
                            $("#guest-visit-toggle").prop("checked", true);
                        }
                        else {
                            $("#guest-visit-toggle").addClass("activeToggle");
                            $("#guest-visit-toggle").prop("checked", false);
                        }
                    }
                    else {
                        clearAdvanceFilters();//To clear Advance Filters
                        $("#guest-visit-toggle").addClass("activeToggle");
                        $("#guest-visit-toggle").prop("checked", true);
                    }
                }
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                break;

            case "Visits":
                selectedFrequencyToCarryFrwd_flag = 1;
                $(".adv-fltr-toggle-container").hide();
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    $(".centerAlign").css("left", "36%");
                    $(".adv-fltr-selection").css("margin-left", "10%");
                }
                else {
                    $(".centerAlign").css("left", "37%");
                    $(".adv-fltr-selection").css("margin-left", "10%");
                }

                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[1].Filters;
                        $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                    });
                }, 5);

                $('#guest-visit-toggle').removeClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                isVisitsSelected = true;
                LastSelected = 1;
                //defaultFreqncySelctn();
                defaultFreqncyForBeverageSelctn();
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    //To hide frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
                    $(".adv-fltr-sub-frequency").hide();
                    $("#addtnal-firstseptor").hide();
                    $("#addtnal-secndseptor").hide();
                    //End
                }
                $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);
                break;
            case "Guests":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "47%");

                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[2].Filters;
                    });
                }, 5);

                $scope.subfilterEstablishment = [];
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    defaultFreqncyForBeverageSelctn();
                }
                if (selctedTopFilterId != "9") {
                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                    $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                }
                else {

                }
                $("#guest-visit-toggle").prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                isVisitsSelected = false;
                LastSelected = 0;
                break;

            case "Beverage Guest":
                $(".adv-fltr-toggle-container").hide();
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().show();
                $(".centerAlign").css("left", "47%");
                if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.subfilters = $scope.advanceFilter[2].Filters;
                        });
                    }, 10);
                    $(".adv-fltr-selection").css("margin-left", "3%");
                }
                else {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.subfilters = $scope.advanceFilter[3].Filters;
                        });
                    }, 10);
                    $(".adv-fltr-selection").css("margin-left", "3%");
                }
                $scope.subfilterEstablishment = [];
                $('#guest-visit-toggle').addClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", true);

                defaultCustomFreqncySelctn();
                //if (LastSelected != 0)
                defaultFreqncySelctn();
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                isVisitsSelected = false;
                break;

            case "Brand Health Metrics":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "50%");
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[2].Filters;
                    });
                }, 5);
                $scope.subfilterEstablishment = [];
                if (selectedPrevisTopFltrId != "5") {
                    if (selctedTopFilterId == "8" && selectedFrequencyToCarryFrwd != "Quarterly+") {
                    }
                    else 
                        selectedFrequencyToCarryFrwd = "";
                }
                $('#guest-visit-toggle').addClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $(".adv-fltr-selection").css("margin-left", "3%");
                //if (LastSelected != 0)
                defaultFreqncySelctn();
                isVisitsSelected = false;
                break;
            case "EstablishmentFrequency":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "50%");
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.subfilters = $scope.advanceFilter[2].Filters;
                        $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
                    });
                }, 5);
                $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().show();

                if (selctedTopFilterId != "9") {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                    }
                    else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                    }
                }
                else {
                    defaultCustomSeltnforBeverageTabs();
                }
                $("#guest-visit-toggle").prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                isVisitsSelected = false;
                if (isInitialLoad == false) {
                    if (isCustomBaseSelect)
                        $scope.prepareContentArea("custombase");
                    else
                        $scope.prepareContentArea("");
                }
        }

        if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
            if (topFilterListVisits.indexOf(selctedTopFilterId) > -1 || $('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)") {
                $('.adv-fltr-sub-establmt').show();
            }
            else {
                $('.adv-fltr-sub-establmt').hide();
            }
        }
        else
            $('.adv-fltr-sub-establmt').hide();

        //To clear Advance Filters
        if (isVisitsSelected && LastSelected == 0) {
            LastSelected = 1;
            clearAdvanceFilters();

        } else {
            //if (!isVisitsSelected && LastSelected == 1) {
            //    LastSelected = 0;
            //    clearAdvanceFilters();
            //} else {
            if ((topFilterListVisits.indexOf(selctedTopFilterId) > -1 || selectedPrevisTopFltrId == "1") && togetPrevisSelctedVis == "Visits") {
                if (selctedTopFilterId == "5" || selctedTopFilterId == "8" || selctedTopFilterId == "9")
                { clearAdvanceFilters(); }
            } else {
                if (togetPrevisSelctedVis == "Guest" && (selctedTopFilterId == "5" || selctedTopFilterId == "8" || selctedTopFilterId == "9")) {
                    if (selctedTopFilterId == "1" && togetPrevisSelctedVis == "Guest")
                    { }
                    else
                    {
                    }
                }
                else {
                    if (togetPrevisSelctedVis == "Visits" && selctedTopFilterId == "1") {

                    }
                    else {
                        if (togetPrevisSelctedVis == "Guest" && (selectedPrevisTopFltrId == "5" || selectedPrevisTopFltrId == "8" || selectedPrevisTopFltrId == "9")) {
                            if (selctedTopFilterId == 1)
                            { }
                            else
                                clearAdvanceFilters();

                        }
                        else {
                            clearAdvanceFilters();
                        }
                    }
                }
            }
            if (!isVisitsSelected && LastSelected == 0 && selctedTopFilterId == "9")
                if (selectedFrequencyToCarryFrwd_flag != 0) {
                    clearAdvanceFilters();
                }
            //Call preparecontentArea 
            if (isInitialLoad == false && selctedTopFilterId != "5") {
                if (isCustomBaseSelect)
                    $scope.prepareContentArea("custombase");
                else
                    if (selctedTopFilterId != "8")
                        if (isVisitsSelected)
                            $scope.prepareContentArea("");
                //}
            }
        }
    }
    //
    $scope.toggledata = function (event, id) {

        if ($(event.currentTarget.parentElement.querySelectorAll('[data-val="siblings_' + id + '"]')).hasClass('dataHide'))
            $(event.currentTarget.parentElement.querySelectorAll('[data-val="siblings_' + id + '"]')).removeClass('dataHide').addClass('dataShow')
        else
            $(event.currentTarget.parentElement.querySelectorAll('[data-val="siblings_' + id + '"]')).removeClass('dataShow').addClass('dataHide');
    };
    $scope.showMoreLess = function () {
        if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
            //Rebind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").addClass("classMouseHover");
            $(".adv-fltr-showhide-txt").text("SHOW MORE");
            $(".adv-fltr-showhide-img").css("background-position", "-193px -211px");
            $(".adv-fltr-selection").hide();
            $(".adv-fltr-showhide-sectn").css("height", "20.28125");
            $(".adv-fltr-showhide-sectn").css("margin-top", "4px");
            $(".adv-fltr-details").css("height", "30px");
            //$(".adv-fltr-top").css("height", "193.5px");
            $(".advance-filters").css("height", "76");
            $(".adv-fltr-headers").css("height", "30.0313px");
            $(".table-bottomlayer").css("height", "80.4%");
            $(".adv-fltr-applyfiltr").css("visibility", "hidden");

            //edited by Nagaraju 
            //Date: 04-09-2017
            //$(".scrollable-rows-frame").height($('.scrollable-rows-frame').height() + 60);
            //$('.scrollable-data-frame').height($('.scrollable-data-frame').height() + 60);
            //end

            //$('#scrollableTable').css("height", "410");
            //$(".adv-fltr-showhide").css({ "margin-top": "-1.9%" });
            $(".adv-fltr-showhide").css({ "top": "-152%" });
        }
        else {
            //Unbind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").removeClass("classMouseHover"); $("#MouseHoverSmallDiv").hide();
            $(".adv-fltr-showhide-txt").text("SHOW LESS");
            $(".adv-fltr-showhide-img").css("background-position", "-233px -211px");
            $(".adv-fltr-selection").show();
            //$(".adv-fltr-top").css("height", "129");
            $(".adv-fltr-showhide-sectn").css("height", "22.8125");
            $(".adv-fltr-showhide-sectn").css("margin-top", "-68px");
            $(".advance-filters").css("height", "122px");
            $(".adv-fltr-details").css("height", "75px");
            $(".table-bottomlayer").css("height", "69%");
            $(".adv-fltr-headers").css("height", "29.15625");
            $(".adv-fltr-selection").show();
            $(".adv-fltr-applyfiltr").css("visibility", "visible");

            //edited by Nagaraju 
            //Date: 04-09-2017
            //$(".scrollable-rows-frame").height($('.scrollable-rows-frame').height() - 60);
            //$('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 60);
            //end

            //$('#scrollableTable').css("height", "333");
            $(".adv-fltr-showhide").css({ "margin-top": "1px" });
            $(".adv-fltr-showhide").css({ "top": "1%" });

        }
        $(".table-bottomlayer").css("height", "calc(100% - " + ($(".advance-filters").height() + $(".filter-info-panel").height() + 22) + "px");
        //hide aditional filter images by chandu
        $(".adv-fltr-selection").find(".master-lft-ctrl[data-val!='Establishment']").find('.lft-popup-ele-label-img').hide();
    }
    //
    //event.currentTarget.parentElement.querySelectorAll('[data-val="siblings_3"]')
   
    $scope.plotTableData = function (tabledata, columns, sampleSizeList) {
        $("#flexi-table").show();
        $("#scrollableTable").show();
        $(".table-bottomlayer").html('');
        var tableFrequncydiv = "";
        tableFrequncydiv += '</div>';
        tableFrequncydiv += '</div>';
        tableFrequncydiv += '<div class="tbl-emptyrow"></div>';

        var tBody = "";
        var tableHtml = tableFrequncydiv + '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
        var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
        var metrcEmptyHding = '';
        var mainHeaderList = [];
        var theadHtml = "";
        var selectedFrequency = ""; var clsforEstFreqncy = "", clsforEstFreqncy_Borderbtm = '';
        //Header Part
        if ($('.FREQUENCY_topdiv_element').find('.sel_text').text() == "" || $('.FREQUENCY_topdiv_element').find('.sel_text').text() == null)
            selectedFrequency = "Monthly+";
        else
            selectedFrequency = $('.FREQUENCY_topdiv_element').find('.sel_text').text();

        theadHtml += tableHtml + '<thead><tr class="tbl-dta-rows">';
        $.each(columns, function (indexno, col) {
            if (indexno == 0) {
                theadHtml += '<th class="tbl-dta-metricsHding">';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + selectedFrequency + '</div><div class="tbl-data-brderbtmblk"></div></th><th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>';
                theadHtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(col) + '_hide " >';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + col + '</div></th><th class="emptydiv ' + removeBlankSpace(col) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            }
            else {
                theadHtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(col) + '_hide " >';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + col + '</div></th><th class="emptydiv  ' + removeBlankSpace(col) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            }
        });
        theadHtml += '</tr>';

        var columnsandSampleSizeList = [];
        var showFirstSampleSize = "";
        //Sample Size only When Demographics selected 
        //if ($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") =="5" ) {
        //    showFirstSampleSize = "hideSampleSize";
        //}
        $.each(tabledata, function (i, v) {
            theadHtml += '<tr class="tbl-dta-rows ' + showFirstSampleSize + '">';
            for (var j = 0; j < columns.length; j++) {
                if (j == 0) {
                    theadHtml += '<td><div class="tbl-algn">SAMPLE SIZE</div></td>';
                    theadHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                }

                var strSampleStatus = true;
                var samplesize = "NA";
                $.each(sampleSizeList, function (sampleIndex, sampleValue) {
                    var columnsampleLst = {
                };
                    if (columns[j].toString().toUpperCase().trim() == sampleValue.EstablishmentName.toString().toUpperCase().trim()) {
                        //theadHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-algn">' + sampleSizeStatus(sampleValue.MetricSampleSize) + '</div></td>';
                        //theadHtml += '<td class="emptydiv  ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

                        strSampleStatus = false;
                        if (sampleValue.MetricSampleSize != null && sampleValue.MetricSampleSize != "") {
                            columnsampleLst.EstablishmentName = columns[j].toString();
                            columnsampleLst.MetricSampleSize = sampleValue.MetricSampleSize;
                            columnsandSampleSizeList.push(columnsampleLst);
                            samplesize = sampleValue.MetricSampleSize;
                            return false;
                    }
                }
                });

                theadHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-algn">' + sampleSizeStatus(samplesize) + '</div></td>';
                theadHtml += '<td class="emptydiv  ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

                if (strSampleStatus) {
                    theadHtml += '<td class="tbl-dta-td  ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-algn">NA</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                    theadHtml += '<td class="emptydiv  ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                }
            }

            theadHtml += '</tr>';
            return false;
        });
        //Sample Sizeo

        theadHtml += '</thead>';

        //Body Part
        tbodyHtml = theadHtml + '<tbody>';
        var samplesizeListIndividual = [];
        $.each(tabledata, function (i, v) {
            //Demographic Filter and Samplesize of the Demographic filter
            clsforEstFreqncy = '';
            if (v[0].DemoFilterName == "Establishment Frequency (Base: Total US Population)") {
                clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
                clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
            }
            else {
                clsforEstFreqncy = ''; clsforEstFreqncy_Borderbtm = '';
            }

            if (mainHeaderList.indexOf(v[0].DemoFilterName) == -1) {
                mainHeaderList.push(v[0].DemoFilterName);
                //Satisfaction Drivers - Top 2 box
                samplesizeListIndividual = [];
                //DemoFilter Heading start
                tbodyHtml += "<tr class='tbl-dta-rows fontForMetrics' onclick='toggleData(this,\"" + removeBlankSpace(v[0].DemoFilterName.toLowerCase()) + "\")'>";
                for (var k = 0; k < columns.length; k++) {
                    if (k == 0) {
                        tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr ' + clsforEstFreqncy + '"">';
                        tbodyHtml += '<div class="tbl-data-expan-collapse"><div class="tbl-data-expan-collapse_show"></div></div>';
                        //bug id 4860
                        tbodyHtml += '<div class="tbl-data-brderbtm ' + clsforEstFreqncy_Borderbtm + '""></div><div class="tbl-dta-demoflter"><div class="middleAlignHeader leftAlignTableText">' + v[0].DemoFilterName + '</div></div></td><td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                        tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr ' + removeBlankSpace(columns[k]) + '_hide ' + clsforEstFreqncy + '""></td><td class="emptydiv ' + removeBlankSpace(columns[k]) + '_hide ""><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                    else {
                        tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr ' + removeBlankSpace(columns[k]) + '_hide ' + clsforEstFreqncy + '"">&nbsp;</td><td class="emptydiv ' + removeBlankSpace(columns[k]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                }
                tbodyHtml += '</tr>';
                //DemoFilter Heading End

                //Sample Size
                if (($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "5" && ($(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Favorite Brand In Category']").parent().hasClass("lft-popup-ele_active") || $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Favorite Brand Across NAB']").parent().hasClass("lft-popup-ele_active"))) || ($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "8") || $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "2" || ((filename == "BeverageCompare" || filename == "BeverageDeepDive") && $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "7") || (($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "4") && v[0].DemoFilterName == "Time spent at the outlet")) {
                    tbodyHtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(v[0].DemoFilterName.toLowerCase()) + '">';
                    for (var j = 0; j < columns.length; j++) {
                        if (j == 0) {
                            if ((($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "4") && v[0].DemoFilterName == "Time spent at the outlet")) {
                                tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn"style="margin-left:11%;justify-content: left">SAMPLE SIZE</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                                tbodyHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                            }else{
                                tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn">SAMPLE SIZE</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                            tbodyHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                            }
                        }
                        var strSampleStatus = true;
                        $.each(sampleSizeList, function (sampleIndex, sampleValue) {
                            var columnsampleLst = {
                            };
                            if (columns[j].toString().toUpperCase().trim() == sampleValue.EstablishmentName.toString().toUpperCase().trim() && sampleValue.DemoFilterName == v[0].DemoFilterName) {
                                tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-algn">' + sampleSizeStatus(sampleValue.MetricSampleSize) + '</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                                tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                                strSampleStatus = false;
                                samplesizeListIndividual.push(sampleValue);
                                return false;
                            }
                        });

                        if (strSampleStatus) {
                            tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-algn">NA</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                            tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columns[j]) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                        }
                    }
                    tbodyHtml += '</tr>';
                }
                //Sample Size 
            }
            if (v[0].DemoFilterName == "Satisfaction Drivers - Top 2 box") {
                var arrayLength =  v.length;
                tbodyHtml += '<tr class="tbl-dta-rows satisfaction_drivers___top_2_box dataShow"><td class="tbl-dta-td"><div class="tbl-algn fontForMetrics tbl-algn-left"><div class="middleAlign leftAlignTableText">SAMPLE SIZE</div></div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                for (var index = 0; index < arrayLength ; index++) {
                    tbodyHtml += '<td class="emptydiv"></td><td class="tbl-dta-td"><div class="tbl-algn fontForMetrics">' + sampleSizeStatus(v[index].MetricSampleSize) + '</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle "></div></td>';//<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td><td class="tbl-dta-td restaurants black" ><div class="tbl-algn fontForMetrics">' + digits(v[1].MetricSampleSize) + '</div><div class="tbl-data-btmbrd "></div><div class="tbl-btm-circle "></div></td><td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                }
                tbodyHtml += '<td class="emptydiv"></td></tr>';
            }          tbodyHtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(v[0].DemoFilterName.toLowerCase()) + '">';
            //Demographic Filter and Samplesize of the Demographic filter
            //lower table part(row header+data)
            var binddataDependingTopFilter;
            //for (var j = 0; j < columns.length; j++) {
            if ($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "8" || $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "2" || ((filename == "BeverageCompare" || filename == "BeverageDeepDive") && $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "7")) {

                binddataDependingTopFilter = samplesizeListIndividual;//Non Demographics
            }
            else
                if ($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "5") {
                    if ($(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Favorite Brand In Category']").parent().hasClass("lft-popup-ele_active") || $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Favorite Brand Across NAB']").parent().hasClass("lft-popup-ele_active"))
                        binddataDependingTopFilter = samplesizeListIndividual;
                    else
                        binddataDependingTopFilter = columnsandSampleSizeList;//Non Demographics
                }
                else
                    binddataDependingTopFilter = columnsandSampleSizeList;//For Demographics

            var allSamplesizeColsList = [];
            $.each(columns, function (colIndex, colValues) {
                var colStatus = false;
                $.each(binddataDependingTopFilter, function (a, b) {
                    if (b.EstablishmentName == colValues) {
                        colStatus = true;
                        return false;
                    }
                });
                if (colStatus == false) {
                    //binddataDependingTopFilter.push({ EstablishmentName: colValues, MetricSampleSize: 0 });
                    binddataDependingTopFilter.splice(colIndex, 0, { EstablishmentName: colValues, MetricSampleSize: 0 });
                }
            });


            $.each(binddataDependingTopFilter, function (columnIndx, columnValue) {
                var isexists = false, metricValue = "", cssForUseDirectinally = "", cssForUseDirectnlyyCircle = "", cssForUseDirectnlytd = "", statValueColor = "";
                $.each(v, function (vIndex, vValue) {
                    if (vValue.EstablishmentName == columnValue.EstablishmentName) {
                        //Satisfaction Drivers - Top 2 box
                        //For Satisfaction Drivers - Top 2 box Add Sample Size Row
                        isexists = true;
                        if (columnValue.MetricSampleSize == null || columnValue.MetricSampleSize == "") {
                            metricValue = "NA"; cssForUseDirectnlyyCircle = ""; cssForUseDirectnlytd = "";
                            cssForUseDirectinally = ""; statValueColor = "";
                        }
                        else {

                            //only for the Time spent at the outlet
                            if (($(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id") == "4") && v[0].DemoFilterName == "Time spent at the outlet")
                            {
                                if (vValue.MetricSampleSize >= 30 && vValue.MetricSampleSize <= 99) {
                                    metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + "%";
                                    cssForUseDirectinally = "yellowcolor";
                                    cssForUseDirectnlyyCircle = "yellowcolorcircle";
                                    cssForUseDirectnlytd = "yellowcolortd";
                                    statValueColor = getFontColorBasedOnStatValue(vValue.StatValue);
                                }
                                else if (vValue.MetricSampleSize > 30) {

                                    metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + "%";
                                    cssForUseDirectinally = ""; cssForUseDirectnlyyCircle = ""; cssForUseDirectnlytd = ""; statValueColor = getFontColorBasedOnStatValue(vValue.StatValue);
                                }
                                else {
                                    metricValue = "&nbsp;"; cssForUseDirectnlyyCircle = ""; cssForUseDirectnlytd = "";
                                    cssForUseDirectinally = ""; statValueColor = "";
                                }
                            }
                            else
                            {

                                if (columnValue.MetricSampleSize >= 30 && columnValue.MetricSampleSize <= 99) {
                                    if (vValue.name == "Visit Summary") {
                                        if (vValue.MetricName == "Approximate Average Amount Spent" || vValue.MetricName == "Average Amount Spent Per Diner")
                                            metricValue = vValue.MetricValue == null ? "NA" : "$" + parseFloat(vValue.MetricValue * 100).toFixed(1);
                                        else if (vValue.MetricName == "Approximate Average Distance Travelled")
                                            metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + " MILE(S)";
                                        else if (vValue.MetricName == "Approximate Average Time In Establishment")
                                            metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + " MINUTE(S)";

                                    }
                                    else
                                        metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + "%";

                                    cssForUseDirectinally = "yellowcolor";
                                    cssForUseDirectnlyyCircle = "yellowcolorcircle";
                                    cssForUseDirectnlytd = "yellowcolortd";
                                    statValueColor = getFontColorBasedOnStatValue(vValue.StatValue);
                                }
                                else if (columnValue.MetricSampleSize > 30) {
                                    if (vValue.name == "Visit Summary") {
                                        if (vValue.MetricName == "Approximate Average Amount Spent" || vValue.MetricName == "Average Amount Spent Per Diner")
                                            metricValue = vValue.MetricValue == null ? "NA" : "$" + parseFloat(vValue.MetricValue * 100).toFixed(1);
                                        else if (vValue.MetricName == "Approximate Average Distance Travelled")
                                            metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + " MILE(S)";
                                        else if (vValue.MetricName == "Approximate Average Time In Establishment")
                                            metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + " MINUTE(S)";

                                    }
                                    else
                                        metricValue = vValue.MetricValue == null ? "NA" : parseFloat(vValue.MetricValue * 100).toFixed(1) + "%";
                                    cssForUseDirectinally = ""; cssForUseDirectnlyyCircle = ""; cssForUseDirectnlytd = ""; statValueColor = getFontColorBasedOnStatValue(vValue.StatValue);
                                }
                                else {
                                    metricValue = "&nbsp;"; cssForUseDirectnlyyCircle = ""; cssForUseDirectnlytd = "";
                                    cssForUseDirectinally = ""; statValueColor = "";
                                }
                            }
                        }
                        if (vValue.DemoFilterName == "Satisfaction Drivers - Top 2 box") {
                            if (vValue.MetricSampleSize >= 30 && vValue.MetricSampleSize <= 99) {
                                cssForUseDirectnlytd = "yellowcolortd";
                                //statValueColor = getFontColorBasedOnStatValue(vValue.StatValue);
                            }
                            else if (vValue.MetricSampleSize < 30) {
                                cssForUseDirectnlytd = "hideForSatisfactnDrvers";
                            }
                            else if (vValue.MetricSampleSize > 99) {
                                if (statValueColor != "green" && statValueColor != "red") {
                                    cssForUseDirectnlytd = "black";
                                }
                            }

                            else if (vValue.SampleSize < 30)
                                metricValue = "";
                            else if (vValue.SampleSize == null)
                                metricValue = "NA";
                        }

                        return false;
                    }
                });
                

                if (columnIndx == 0) {
                    //bug id 4860
                    tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn fontForMetrics tbl-algn-left"><div class="middleAlign leftAlignTableText">' + v[0].MetricName + '</div></div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                    tbodyHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                    if (isexists) {
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columnValue.EstablishmentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">' + metricValue + '</div><div class="tbl-data-btmbrd ' + cssForUseDirectinally + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                    else {
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columnValue.EstablishmentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">NA</div><div class="tbl-data-btmbrd ' + cssForUseDirectinally + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                }
                else {
                    if (isexists) {
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columnValue.EstablishmentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">' + metricValue + '</div><div class="tbl-data-btmbrd  ' + cssForUseDirectinally + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                    else {
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(columnValue.EstablishmentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">NA</div><div class="tbl-data-btmbrd  ' + cssForUseDirectinally + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(columnValue.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                }
            });

            //}
            tbodyHtml += '</tr>';
        });
        //

        tbodyHtml += '</tbody></table><div id="scrollableTable"></div>';
        $('.table-bottomlayer').html(tbodyHtml);

        var heightBottomlayer;
        heightBottomlayer = $(".table-bottomlayer").height() - 48;
        var options = {
            width: $(".table-bottomlayer").width() - 25,
            height: heightBottomlayer,
            pinnedRows: 2,
            pinnedCols: 2,
            container: "#scrollableTable",
            removeOriginal: true
        };// tbl - data - expan - collapse
        $("#flexi-table").tablescroller(options);

        //For Height Alignment Issue
        //$(".scrollable-rows-frame tr").each(function (i) {
        //    $(".scrollable-data-frame tr").eq(i).height($(this).height());
        //    $(".scrollable-data-frame tr").eq(i).children("td").height($(this).height());

        //    $(this).height($(this).height());
        //    $(this).children("td").height($(this).height());
        //});

        setWidthforTableColumns();//set Dynamic width based on selections
        setMaxHeightForHedrTble();
        $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
        $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
        $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2)
        var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

        //added by Nagaraju D for table scroll dynamic height
        SetTableResolution();

        SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8, true);

        //custom base applying color
        if (!isCustomBaseSelect) {
            $('.tbl-dta-rows').removeClass('customBaseColor');
            if ($('#table-ttldine').hasClass("activestat")) {
                $('.tbl-dta-rows').find('.total_dine').addClass('customBaseColor');
            }
        }
        else {
            $('.tbl-dta-rows').removeClass('customBaseColor');
            //$('.tbl-dta-rows').find('.' + removeBlankSpace($('.stat-cust-estabmt.stat-cust-active').text())).addClass('customBaseColor');
            if (!$('#table-ttldine').hasClass("activestat")) {
                var actcusname = $('.stat-cust-estabmt.stat-cust-active').text();
                var cusindx = 0;
                $(".scrollable-columns-table tr th").each(function (i) {
                    if ($(this).children("div").text() == actcusname) {
                        cusindx = i;
                        return false;
                    }
                });
                $(".scrollable-data-frame table tr td:nth-child(" + (cusindx + 1) + ")").addClass("customBaseColor");
            }
        }
    };

    $scope.custombase = function (stattesttype, stattest, statselectedEstatblishmt) {
        $(".transparentBG").show();
        $scope.prepareContentArea("submit");
    }

    //custom base submit click
    $scope.custombaseSubmit = function () {
        $(".transparentBG").hide();
        $(".stat-popup").hide();
        if ($(".stat-cust-active").length == 0) {
            $("#table-custombse").removeClass('activestat');
            $("#" + previsSelectedStatTest).addClass('activestat');
            isCustomBaseSelect = false;
        } else {
            leftpanelchanged = false;
            previsSelectedStatTest = "table-custombse";
            isCustomBaseSelect = true;
            $scope.prepareContentArea("custombase");
        }
    }

    $scope.custombaseCancel = function () {
        $(".transparentBG").hide();
        $(".stat-popup").hide();
        $("#table-custombse").removeClass('activestat');
        $("#" + previsSelectedStatTest).addClass('activestat');

    }
    //$scope.initializeSearch = function ()
    //{
    //    $scope.subfilters = $scope.advanceFilter[3].Filters;
    //}


    function defaultFreqncySelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                var selctedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");//to get selected top filterid
                var topFilterListVisits = ["2", "3", "4", "7"];
                if ($('#guest-visit-toggle').hasClass('activeToggle')) {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Quarterly+']").parent().hasClass("lft-popup-ele_active") && isInitialLoad) {
                        resolve('Successful');
                    } else {
                        if (isInitialLoad == false) {
                            if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                                if (selectedFrequencyToCarryFrwd_flag == 1 || selectedFrequencyToCarryFrwd == "") {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Quarterly+']").click();
                                }
                                else if (selctedTopFilterId == "8" && (selectedFrequencyToCarryFrwd == "Quarterly+" || selectedFrequencyToCarryFrwd == "Total Visits")) {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Establishment In Trade Area']").click();
                                }
                                else if (selectedFrequencyToCarryFrwd_flag == 0 && selectedFrequencyToCarryFrwd == "Quarterly+") {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Quarterly+']").click();
                                }
                                else {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='" + selectedFrequencyToCarryFrwd + "']").click();
                                }
                            }
                            else if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 1) {
                                if (selectedFrequencyToCarryFrwd_flag == 0 && selectedFrequencyToCarryFrwd == "Total Visits") {
                                    if (selctedTopFilterId == "1" && togetPrevisSelctedVis == "Visits") {
                                        if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                                            $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Total Visits']").click();
                                    }
                                    else {
                                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Quarterly+']").click();
                                    }
                                }
                                else if (selctedTopFilterId == "8" && selectedFrequencyToCarryFrwd != "Quarterly+" && selectedFrequencyToCarryFrwd != "") {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='" + selectedFrequencyToCarryFrwd + "']").click();
                                }
                                else if (selectedFrequencyToCarryFrwd == "Establishment In Trade Area" && isFrqncyInBrandHlthMtricChanged == false)
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Quarterly+']").click();
                                else if (selctedTopFilterId == "8") {
                                    $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Establishment In Trade Area']").click();
                                }
                            }
                            if (IsPIT_TREND) {
                                IsPIT_TREND = false;
                                return false;
                            }

                            if (isCustomBaseSelect)
                                $scope.prepareContentArea("custombase");
                            else
                                $scope.prepareContentArea("");
                        }
                        isInitialLoad = false;
                        reject('Error');
                    }
                }
                else {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                        if (isInitialLoad == false) {
                            $scope.prepareContentArea("");
                        }
                        isInitialLoad = false;
                        reject('Error');
                    }
                }
                $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);
            }, 50);

        });
    }

    function defaultFreqncyForBeverageSelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                var selctedTopFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
                if (selctedTopFilterId == 9) {
                    $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().show();
                    if ($(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                    } else {
                        //$(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                        if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0) {
                            if (selectedFrequencyToCarryFrwd_flag == 0 && selectedFrequencyToCarryFrwd == "Total Visits") {
                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                            }
                            else if (selectedFrequencyToCarryFrwd_flag == 1 || selectedFrequencyToCarryFrwd == "") {
                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                            }
                            else {
                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='" + selectedFrequencyToCarryFrwd + "']").click();
                            }
                        }
                        else if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 1) {
                            if (selectedFrequencyToCarryFrwd_flag == 0 && selectedFrequencyToCarryFrwd == "Total Visits") {
                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                            }
                        }
                    }
                    if ($(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                    } else {
                        $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                    }
                    if (IsPIT_TREND) {
                        IsPIT_TREND = false;
                        return false;
                    }
                    if (isInitialLoad == false && selctedTopFilterId == 9) {
                        if (isCustomBaseSelect)
                            $scope.prepareContentArea("custombase");
                        else
                            $scope.prepareContentArea("");
                    }
                    isInitialLoad = false;
                }
                else {
                    $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();

                    if ($('#guest-visit-toggle').hasClass('activeToggle')) {
                        if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                            if (selctedTopFilterId == 1)
                                $scope.prepareContentArea("");
                            else
                                resolve('Successful');
                        } else {
                            if (isInitialLoad == false) {
                                //$(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
                                if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").length == 0)
                                    if (selectedFrequencyToCarryFrwd_flag == 1 || selectedFrequencyToCarryFrwd == "")
                                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                                    else
                                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='" + selectedFrequencyToCarryFrwd + "']").click();

                                if (IsPIT_TREND) {
                                    IsPIT_TREND = false;
                                    return false;
                                }
                                $scope.prepareContentArea("");
                            }
                            isInitialLoad = false;
                            reject('Error');
                        }
                    }
                    else {
                        if (selectedFrequencyToCarryFrwd_flag == 1) {
                            if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass("lft-popup-ele_active")) {
                                resolve('Successful');
                            } else {


                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                                if (IsPIT_TREND) {
                                    IsPIT_TREND = false;
                                    return false;
                                }
                                if (isInitialLoad == false && selctedTopFilterId != 9) {
                                    if (isCustomBaseSelect)
                                        $scope.prepareContentArea("custombase");
                                    else
                                        $scope.prepareContentArea("");
                                }
                                isInitialLoad = false;
                                reject('Error');
                            }
                        }
                        else {
                            if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass("lft-popup-ele_active")) {
                                resolve('Successful');
                            } else {


                                $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                                if (IsPIT_TREND) {
                                    IsPIT_TREND = false;
                                    return false;
                                }
                                if (isInitialLoad == false && selctedTopFilterId != 9) {
                                    if (isCustomBaseSelect)
                                        $scope.prepareContentArea("custombase");
                                    else
                                        $scope.prepareContentArea("");
                                }
                                isInitialLoad = false;
                                reject('Error');
                            }
                        }
                    }
                }
                $(".master-lft-ctrl[data-val=FREQUENCY]").eq(1).find(".lft-ctrl3").attr("data-required", false);
                $(".master-lft-ctrl[data-val='DAY OF WEEK']").parent().show();
            }, 50);
        });
    }

    $scope.statTest = function (event) {
        leftpanelchanged = false;
        previsSelectedStatTest = $('.table-statlayer').find('.activestat').attr("id");
        $(".table-stat").removeClass("activestat");
        $(event.currentTarget).addClass("activestat");
        selectedstatTestToCarryFrwd = $('.table-statlayer').find('.activestat').attr("id");
        $scope.prepareContentArea("statTest");
    }

    function updateTableOutput() {
        //$scope.plotTableData()
        alert("Hello");
    }

}]);


function prepareTable(xdata) {
    //var xdata = [{ "MetricName": "13 - 17", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.0900069543996701", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.175229292360155", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.252503994828216", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.0900069543996702", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.175229292360154", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.252503994828216", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.0900069543996702", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.175229292360155", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.252503994828217", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663204", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723819", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.088427362093834", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793365", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663202", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723818", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390147", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0884273620938338", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823137", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663203", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723818", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0884273620938339", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.0438836808197744", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.0317185306850531", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.0386267016732393", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.144120598117605", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.0438836808197744", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.0317185306850532", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.0386267016732393", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.144120598117605", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0438836808197744", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0317185306850532", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0386267016732393", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.144120598117605", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581423", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237203", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089051", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625634", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817255", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581423", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237204", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.078262271708905", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625634", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817255", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581423", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237204", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089051", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625635", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817256", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399489", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "A&W All American Food", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399487", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399488", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Gender", "MetricValue": "0.50504612576482", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Gender", "MetricValue": "0.494953874235179", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Gender", "MetricValue": "0.505046125764822", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Gender", "MetricValue": "0.494953874235179", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.505046125764821", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.494953874235181", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747724", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959494", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.52257513630338", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276202", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900737", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900737", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900737", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775425", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547714", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497172", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775426", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547714", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497172", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775426", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547715", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066955", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497173", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731207", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_Total", "MetricValue": "0.184389170551441", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731207", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731208", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.68282784983721", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "A&W All American Food", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512183", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.68282784983721", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512183", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.68282784983721", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512183", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481644", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029736", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413467", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "A&W All American Food", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802773", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481644", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029737", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413468", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802773", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481643", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029737", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413467", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802773", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "A&W All American Food", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Back Yard Burgers", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }];
    //var xdata = [{ "MetricName": "18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.175229292360154", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.252503994828216", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.0900069543996701", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.175229292360155", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.0900069543996701", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.252503994828216", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.175229292360154", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.252503994828216", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.0900069543996701", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.175229292360155", "SampleSize": "355", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.12114944875532", "SampleSize": "259", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.247537914701944", "SampleSize": "517", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "13 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age", "MetricValue": "0.0900069543996701", "SampleSize": "191", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.252503994828217", "SampleSize": "553", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age", "MetricValue": "0.113572394954696", "SampleSize": "247", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663204", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723819", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0884273620938339", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663204", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723819", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0884273620938339", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663205", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723819", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.060089353416305", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822757", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0610600953390148", "SampleSize": "132", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.088427362093834", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447774", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0868019302663203", "SampleSize": "183", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 65 - 75", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0605692619723818", "SampleSize": "128", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 16 - 17", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0182249014447775", "SampleSize": "40", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 16 - 17", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0211065861822756", "SampleSize": "50", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 25 - 34", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0884273620938339", "SampleSize": "172", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.124574271334474", "SampleSize": "263", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 13 - 15", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0247775052793366", "SampleSize": "49", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 18 - 24", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.0600893534163049", "SampleSize": "127", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 35 - 49", "EstablishmentName": "Burger King", "DemoFilterName": "Age_Gender", "MetricValue": "0.122963643367469", "SampleSize": "254", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 13 - 15", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0258979614932804", "SampleSize": "52", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.122495092776991", "SampleSize": "269", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male 65 - 75", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.0530031329823138", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female 50 - 64", "EstablishmentName": "Wendy's", "DemoFilterName": "Age_Gender", "MetricValue": "0.130008902051225", "SampleSize": "284", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0438836808197744", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0317185306850531", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0438836808197743", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0317185306850532", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.144120598117605", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.144120598117606", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0386267016732393", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0386267016732392", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Currently attending middle school or high school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0616999838418393", "SampleSize": "130", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0438836808197744", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed college (Associates or Bachelors degree)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.331052495959326", "SampleSize": "709", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed graduate school or higher", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.149248845790531", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0317185306850531", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended graduate school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0438836808197743", "SampleSize": "91", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than high school graduate (no longer attending)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.029034900813718", "SampleSize": "60", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0317185306850532", "SampleSize": "69", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.144120598117605", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Attended college (undergraduate)", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.170614262298913", "SampleSize": "359", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Graduated from high school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.144120598117606", "SampleSize": "311", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Burger King", "DemoFilterName": "Education", "MetricValue": "0.0386267016732393", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Completed vocational or technical school", "EstablishmentName": "Wendy's", "DemoFilterName": "Education", "MetricValue": "0.0386267016732392", "SampleSize": "82", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625633", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817254", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089049", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581423", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089051", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625635", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237203", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817256", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237204", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581421", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625633", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817254", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Retired", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.174829460528181", "SampleSize": "350", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089049", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581423", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Homemaker", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0782622717089051", "SampleSize": "145", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unable to Work", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0665968645625635", "SampleSize": "119", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237203", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unemployed/Laid Off", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.0695355263817256", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Part-Time", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.113196340237204", "SampleSize": "216", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Employed Full-Time", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusDetailed", "MetricValue": "0.497579536581421", "SampleSize": "903", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399488", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399486", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399489", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A blue-collar occupation", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.228961398992962", "SampleSize": "260", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "A white-collar occupation", "EstablishmentName": "Burger King", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.659425845399489", "SampleSize": "736", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Wendy's", "DemoFilterName": "EmploymentStatusNet", "MetricValue": "0.11161275560755", "SampleSize": "123", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Wendy's", "DemoFilterName": "Gender", "MetricValue": "0.50504612576482", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Wendy's", "DemoFilterName": "Gender", "MetricValue": "0.494953874235179", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.505046125764821", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.49495387423518", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Wendy's", "DemoFilterName": "Gender", "MetricValue": "0.50504612576482", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Wendy's", "DemoFilterName": "Gender", "MetricValue": "0.494953874235179", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Female", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.505046125764821", "SampleSize": "1074", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Male", "EstablishmentName": "Burger King", "DemoFilterName": "Gender", "MetricValue": "0.49495387423518", "SampleSize": "1048", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$50,000 - $74,999", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.178158087081159", "SampleSize": "376", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Less than $25,000", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.221452948979164", "SampleSize": "453", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$25,000 - $49,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.232871036747725", "SampleSize": "519", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$75,000 - $99,999", "EstablishmentName": "Burger King", "DemoFilterName": "HHIncome", "MetricValue": "0.126906275614388", "SampleSize": "272", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "$100,000 and over", "EstablishmentName": "Wendy's", "DemoFilterName": "HHIncome", "MetricValue": "0.240611651577566", "SampleSize": "502", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900737", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900738", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900737", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.522575136303381", "SampleSize": "1106", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.252238740792402", "SampleSize": "533", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0589656389276203", "SampleSize": "125", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.0263490923900738", "SampleSize": "58", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.000395146680959495", "SampleSize": "1", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_AdultsinHH", "MetricValue": "0.139476244905563", "SampleSize": "299", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775425", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547714", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497172", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547715", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497173", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775427", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775425", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547714", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497172", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.114618914197386", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.175029930547715", "SampleSize": "369", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0114598825678065", "SampleSize": "23", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.00500080220497173", "SampleSize": "10", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "0", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.654654962775427", "SampleSize": "1398", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_ChildreninHH", "MetricValue": "0.0392355077066954", "SampleSize": "88", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731208", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731207", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731208", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "1 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.209027135300146", "SampleSize": "443", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "3 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.18438917055144", "SampleSize": "391", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "2 person in household", "EstablishmentName": "Wendy's", "DemoFilterName": "HHSize_Total", "MetricValue": "0.337794324731208", "SampleSize": "720", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "4 person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.158527625197651", "SampleSize": "335", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "5 or more person in household", "EstablishmentName": "Burger King", "DemoFilterName": "HHSize_Total", "MetricValue": "0.110261744219556", "SampleSize": "233", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.682827849837209", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512182", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.68282784983721", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512183", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.682827849837209", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Burger King", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512182", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Acculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.68282784983721", "SampleSize": "234", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Biculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.254465279311572", "SampleSize": "94", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Unacculturated", "EstablishmentName": "Wendy's", "DemoFilterName": "HispanicAcculturation", "MetricValue": "0.0627068708512183", "SampleSize": "22", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413466", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481643", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802772", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029736", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029737", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481641", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413467", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802773", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.370086915709849", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413467", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481645", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802772", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029736", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184601", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Living with Partner", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0689956295029737", "SampleSize": "143", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.427596063184602", "SampleSize": "917", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Divorced", "EstablishmentName": "Wendy's", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0995349109481642", "SampleSize": "218", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Separated", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.00862220737413468", "SampleSize": "17", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Single/Never Married", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.37008691570985", "SampleSize": "770", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Widowed", "EstablishmentName": "Burger King", "DemoFilterName": "MaritalStatus", "MetricValue": "0.0251642732802773", "SampleSize": "57", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Black or African American", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "White", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.249999999999999", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Other", "EstablishmentName": "Wendy's", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }, { "MetricName": "Asian", "EstablishmentName": "Burger King", "DemoFilterName": "Race_Ethnicity", "MetricValue": "0.25", "SampleSize": "2122", "StatValue": "", "StatSamplesize": "" }];
    var demoEstbFilterList = [];
    $.each(xdata, function (ind, val) {
        row = [];
        var isExist = false;
        $.each(demoEstbFilterList, function (demoind, demoval) {
            if (demoval.MetricName == val.MetricName && demoval.DemoFilterName == val.DemoFilterName) {
                isExist = true;
                return false;
            }
        });
        if (isExist == false) {
            demoEstbFilterList.push({
                MetricName: val.MetricName, DemoFilterName: val.DemoFilterName
            });
        }
    });
    var mainList = [];
    var subList = [];
    $.each(demoEstbFilterList, function (demoind, demoval) {
        subList = [];
        $.each(xdata, function (i, v) {
            if (v.MetricName == demoval.MetricName && v.DemoFilterName == demoval.DemoFilterName) {
                v.name = demoval.DemoFilterName;
                subList.push(v);
            }
        });
        mainList.push(subList);
    });
    return mainList;

}


function getSampleSize(xdata) {
    var sampleSizeList = [], temp_list = []; var sampleSizeBevCategoriesList = [];
    var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");

    $.each(xdata, function (i, v) {
        var sampleObj = {};
        sampleObj.DemoFilterName = "";
        sampleObj.EstablishmentName = "";
        sampleObj.MetricSampleSize = "";

        //Only For Beverage Guest Tab to take Sample Size of (BEVERAGE CATEGORIES) because of (BEVERAGE CATEGORIES SUMMARY) sending null from backend
        var sampleBevCatObj = {}
        sampleBevCatObj.DemoFilterName = "";
        sampleBevCatObj.EstablishmentName = "";
        sampleBevCatObj.MetricSampleSize = "";
        //

        var mstStatus = true;
        $.each(sampleSizeList, function (c, d) {
            if (d.DemoFilterName == v.DemoFilterName && d.EstablishmentName == v.EstablishmentName) {
                if (v.MetricSampleSize == null) {
                    mstStatus = false;
                    return false;
                }
            }
        });
        if (mstStatus) {
            var sampleNullCheck = false;
            $.each(sampleSizeList, function (ai, av) {
                if (av.DemoFilterName == v.DemoFilterName && av.EstablishmentName == v.EstablishmentName) {
                    if (v.MetricSampleSize != null) {
                        av.MetricSampleSize = v.MetricSampleSize;
                        sampleNullCheck = true;
                    }
                }
            });
            if (sampleNullCheck == false) {
                sampleObj.DemoFilterName = v.DemoFilterName;
                sampleObj.EstablishmentName = v.EstablishmentName;
                sampleObj.MetricSampleSize = v.MetricSampleSize;
                sampleSizeList.push(sampleObj);
                if ((rtnSelctedFilterId == "5" || rtnSelctedFilterId == "7") && v.DemoFilterName.toUpperCase() == "SSD REGULAR BRANDS") {
                    sampleBevCatObj.DemoFilterName = v.DemoFilterName;
                    sampleBevCatObj.EstablishmentName = v.EstablishmentName;
                    sampleBevCatObj.MetricSampleSize = v.MetricSampleSize;
                    sampleSizeBevCategoriesList.push(sampleBevCatObj);
                }

                if ((rtnSelctedFilterId == "9") && v.DemoFilterName.toUpperCase() == "RESTAURANT FREQUENCY") {
                    sampleBevCatObj.DemoFilterName = v.DemoFilterName;
                    sampleBevCatObj.EstablishmentName = v.EstablishmentName;
                    sampleBevCatObj.MetricSampleSize = v.MetricSampleSize;
                    sampleSizeBevCategoriesList.push(sampleBevCatObj);
                }

                if ((rtnSelctedFilterId == "3") && v.DemoFilterName.toUpperCase() == "ESTABLISHMENT CHOICE ATTRIBUTES") {
                    sampleBevCatObj.DemoFilterName = v.DemoFilterName;
                    sampleBevCatObj.EstablishmentName = v.EstablishmentName;
                    sampleBevCatObj.MetricSampleSize = v.MetricSampleSize;
                    sampleSizeBevCategoriesList.push(sampleBevCatObj);
                }
                if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
                    if ((rtnSelctedFilterId == "4") && v.DemoFilterName.toUpperCase() == "TIME SPENT AT THE OUTLET") {
                        sampleBevCatObj.DemoFilterName = v.DemoFilterName;
                        sampleBevCatObj.EstablishmentName = v.EstablishmentName;
                        sampleBevCatObj.MetricSampleSize = v.MetricSampleSize;
                        sampleSizeBevCategoriesList.push(sampleBevCatObj);
                    }
                }
            }
        }

    });

    //Only For Beverage Guest Tab to take Sample Size of (BEVERAGE CATEGORIES) because of (BEVERAGE CATEGORIES SUMMARY) sending null from backend
    if (rtnSelctedFilterId == "5") {
        $.each(sampleSizeBevCategoriesList, function (IndsampBev, ValSampBevCat) {
            $.each(sampleSizeList, function (i, v) {
                if (v.EstablishmentName == ValSampBevCat.EstablishmentName && v.DemoFilterName.toLocaleUpperCase() == "BEVERAGE CATEGORIES SUMMARY")
                    v.MetricSampleSize = ValSampBevCat.MetricSampleSize;
            });
        });
    }

    if (rtnSelctedFilterId == "7") {
        $.each(sampleSizeBevCategoriesList, function (IndsampBev, ValSampBevCat) {
            $.each(sampleSizeList, function (i, v) {
                if (v.EstablishmentName == ValSampBevCat.EstablishmentName && v.DemoFilterName.toLocaleUpperCase() == "BEVERAGE PURCHASED SUMMARY")
                    v.MetricSampleSize = ValSampBevCat.MetricSampleSize;
            });
        });
    }

    if (rtnSelctedFilterId == "9") {
        $.each(sampleSizeBevCategoriesList, function (IndsampBev, ValSampBevCat) {
            $.each(sampleSizeList, function (i, v) {
                if (v.EstablishmentName == ValSampBevCat.EstablishmentName && v.DemoFilterName.toLocaleUpperCase() == "RESTAURANT CHANNELS")
                    v.MetricSampleSize = ValSampBevCat.MetricSampleSize;
            });
        });
    }
    if (rtnSelctedFilterId == "3") {
        $.each(sampleSizeBevCategoriesList, function (IndsampBev, ValSampBevCat) {
            $.each(sampleSizeList, function (i, v) {
                if (v.EstablishmentName == ValSampBevCat.EstablishmentName && v.DemoFilterName.toLocaleUpperCase() == "LOCATION OF OUTLET")
                    v.MetricSampleSize = ValSampBevCat.MetricSampleSize;
            });
        });
    }

    if (filename == "BeverageCompare" || filename == "BeverageDeepDive") {
        if (rtnSelctedFilterId == "4") {
            $.each(sampleSizeBevCategoriesList, function (IndsampBev, ValSampBevCat) {
                $.each(sampleSizeList, function (i, v) {
                    if (v.EstablishmentName == ValSampBevCat.EstablishmentName && v.DemoFilterName.toLocaleUpperCase() == "AVG. TIME SPENT AT THE OUTLET")
                        v.MetricSampleSize = ValSampBevCat.MetricSampleSize;
                });
            });
        }
    }

    //
    return sampleSizeList;
}

$(document).ready(function () {
    $(".filter-info-panel").addClass("showFilter");
    $(".master_link").removeClass("active");
    $(".master_link.tables").addClass("active");
    $(".submodules-band").show();

    //to disable In-Establishment Bev Details
    //if (controllername == "tablebeveragedeepdive") {
    //    //Tooltip for the enabled and disabled measures
    //    $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col1 .lft-popup-ele").hover(function () {
    //        // Hover over code      
    //        var title = $(this).attr('title');
    //        var GroupNamelist = [];
    //        var ShopperGrps = [];
    //        $(".master-lft-ctrl[data-val='Metric Comparisons'] .lft-popup-col1").find(".lft-popup-ele-label").each(function () {
    //            GroupNamelist.push($(this).html());
    //        });
    //        var measurename = $(this).find(".lft-popup-ele-label").text();
    //        switch (measurename) {
    //            case "In-Establishment Bev Details":
    //                title = "This module is under construction";
    //                break;
    //        }

    //        if (title != undefined && title != "" && title != null) {
    //            $(this).data('tipText', title).removeAttr('title');
    //            $('<p class="GeoToolTip"></p>')
    //            .text(title)
    //            .appendTo('body')
    //            .fadeIn('slow');

    //            var pos = $(this).position();
    //            // .outerWidth() takes into account border and padding.
    //            var width = $(this).outerWidth();
    //            //show the menu directly over the placeholder
    //            $(".GeoToolTip").css({
    //                position: "absolute",
    //                top: pos.top + "px",
    //                left: (pos.left + width) + "px",
    //            }).show();
    //        }

    //    }, function () {
    //        // Hover out code
    //        $(this).attr('title', $(this).data('tipText'));
    //        $('.GeoToolTip').remove();
    //    }).mousemove(function (e) {
    //        var mousex = e.pageX + 10; //Get X coordinates
    //        var mousey = e.pageY + 10; //Get Y coordinates
    //        $('.GeoToolTip')
    //            .css({ top: mousey, left: mousex })
    //    });

    //    //
    //}
    //

    var dim = $(".master_link_a:eq(2)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((18 * $(".master_link_a:eq(2)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
        $(".submodules-band").css("margin-left", "49.4%");
        $(".submodules-band").css("margin-top", "-0.55%");
    }
    if (isInitialLoad == true) {
        angular.element(".right-skew-DemoGraphicProfiling").triggerHandler('click');
    }
    //
    //Export Excel For table
    $('.exl-logo').click(function () {
        reset_img_pos();
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $('.fltr-txt-hldr').css("color", "#000");
        $(".transparentBG").show();
        $('.export-excel-popup').show();
        var getTopFiltrNames = $('.adv-fltr-top .adv-fltr-option').find('.adv-fltr-label');
        var popupHtml = "";
        $('.excel-tabslist').html('');
        $.each(getTopFiltrNames, function (i, v) {
            if (i == 0) {
                popupHtml += '<div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" class="checkbox-excel" id="' + $(v).attr('data-id') + '"/></div><div class="excel-tab-name">' + "Visits - " + $(v).attr("data-val") + '</div></div>';
                popupHtml += '<div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" class="checkbox-excel" id="0"/></div><div class="excel-tab-name">' + "Guests - " + $(v).attr("data-val") + '</div></div>';
            }
            else {
                popupHtml += '<div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" class="checkbox-excel" id="' + $(v).attr('data-id') + '"/></div><div class="excel-tab-name">' + $(v).attr("data-val") + '</div></div>';
            }
        });
        popupHtml += '<div class="top-line"><div><div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" class="checkbox-excel-selectall"/></div><div class="excel-tab-name">' + " Select All" + '</div></div>';
        popupHtml += '<span id="select-all-content-msg">Please Note, the more tabs you download, the longer the load time will be</span>';
        $('.excel-tabslist').append(popupHtml);
        $("#select-all-content-msg").hide();


        $(".checkbox-excel").unbind().click(function () {
            if ($(".checkbox-excel:checked").length == $(".checkbox-excel").length) {
                $(".checkbox-excel-selectall").prop("checked", true);
                $("#select-all-content-msg").show();
            }
            else {
                $(".checkbox-excel-selectall").prop("checked", false);
                $("#select-all-content-msg").hide();
            }
        });

        $(".checkbox-excel-selectall").unbind().click(function () {
            if (this.checked) {
                $(".checkbox-excel").prop("checked", true);
                $("#select-all-content-msg").show();
                SetScroll($('.excel-tabslist'), "#ffffff", 0, 15, 0, -8, 8, false);
            }
            else {
                $(".checkbox-excel").prop("checked", false);
                $("#select-all-content-msg").hide();
                $('.excel-tabslist').getNiceScroll().remove();
            }
        });
    });
    //
    $('.excel-cancelbtn').click(function () {
        $(".transparentBG").hide();
        $('.export-excel-popup-cross').hide();
        $('.export-excel-popup').hide();
    });
    $(".excel-okbtn").click(function () {

        //$(".export-excel-popup").hide();
        $(".loaderExportExcel").show();
        $(".transparentBGExportExcel").show();
        var selectedTopFilterChkBxIds = [];

        if (prepareFilter() == false) {
            $('.export-excel-popup').hide();
            $(".transparentBG").hide();
            $(".loaderExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            return false;
        }

        $(".checkbox-excel:checked").each(function () {
            selectedTopFilterChkBxIds.push(this.id);
        });
        if (selectedTopFilterChkBxIds.length > 0) {
        } else {
            showMaxAlert("Please Select Reports");
            $(".loaderExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            return false;
        }

        var filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var selectedMeasureType, customBaseSelctdText = "";
        //var visitsList = ["1", "2", "3"];
        var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");

        if (rtnSelctedFilterId == "1") {
            if (rtnSelctedFilterId)
                if ($('#guest-visit-toggle').hasClass('activeToggle'))
                { selectedMeasureType = $(".adv-fltr-guest").text(); } else { selectedMeasureType = $(".adv-fltr-visit").text(); }
        }
        else {
            selectedMeasureType = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").parent().parent().attr("data-val");
        }

        var filtrInfoPanelElements = $(".filter-info-panel-elements").html();
        var selctdTimePeriod = $(".Time_Period_topdiv_element").find(".filter-info-panel-lbl>span:eq(0)").text();
        var selctedFrequencyId = $(".FREQUENCY_topdiv_element").find('.filter-info-panel-lbl').attr('data-id');
        var selctedFrequency = $(".FREQUENCY_topdiv_element").find('.sel_text').text();
        var moduleType = "";
        if (controllername == "tablebeveragecomparison" || controllername == "tablebeveragedeepdive")
            moduleType = "Beverage(s)";
        else
            moduleType = "Establishment(s)";

        var advanceFiltersList = ["DEVICE USED", "DAYPART", "DAY PART", "DAY OF WEEK", "BEVERAGE ITEMS", "FOOD ITEMS", "Establishment", "Planning Type", "Service Mode", "Meal Type", "Visit Type", "Outlet Segments", "Beverage Consumed"];
        var selectedAdvanceFitlersList = [];
        $.each(advanceFiltersList, function (filtrI, filtrV) {
            var selectedAdnceFilters = [];
            if (moduleType == "Establishment(s)" && filtrV == "Establishment")
                selectedAdnceFilters = [];
            else
                selectedAdnceFilters = $(".topdiv_element[data-val='" + filtrV + "'] div").find(".sel_text");
            $.each(selectedAdnceFilters, function (seltFiltrI, seltFiltrV) {
                //if (seltFiltrI == 0)
                //    selectedAdvanceFitlersList += filtrV + ": ";
                selectedAdvanceFitlersList += $(seltFiltrV).text().toLocaleUpperCase().trim() + ",";
            });
        });
        if (selectedAdvanceFitlersList != "")
            selectedAdvanceFitlersList = selectedAdvanceFitlersList.substr(0, selectedAdvanceFitlersList.length - 1);
        // Selected Demo Filters
        var selectedDemofilters = "", selectedDemofiltersList = [];
        var selectedDemofilters = $(".Demographic_Filters_topdiv_element[data-val='Demographic Filters'] div").find(".sel_text");
        $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().toLocaleUpperCase().trim() + ",";
        });

        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
        //
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
            isVisits = 0;
        else
            isVisits = 1;

        var selectedStatTest = $('.table-statlayer').find('.activestat').text().trim();//selected stat test
        if (selectedStatTest.toLocaleLowerCase() == "custom base")
            customBaseSelctdText = $('.stat-cust-estabmt.stat-cust-active').text();
        else
            customBaseSelctdText = "";

        var selectedConsumedFrqyid = $('.CONSUMED_FREQUENCY_topdiv_element').find('.filter-info-panel-lbl').attr('data-id');
        var selectedConsumedFrqyTxt = $('.CONSUMED_FREQUENCY_topdiv_element').find('.sel_text').text();
        if (isSubmitClicked == false) {
            showMaxAlert("Please click Submit Button");
            $('.export-excel-popup').hide();
            $(".transparentBG").hide();
            $(".loaderExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            $(".transparentBGExportExcel").hide();
            return false;
        }
        var timePeriodType = $(".pit").hasClass("active") == true ? "pit" : "trend";
        var filterdata = {
            filter: filterPanelInfo.filter, module: controllername, measureType: selectedMeasureType, customBaseText: customBaseSelctdText,
            selectedcheckboxTopFilters: selectedTopFilterChkBxIds, selctdTimePeriod: selctdTimePeriod, selctedFrequency: selctedFrequency, selctedFrequencyId: selctedFrequencyId, selectedTopFilterId: rtnSelctedFilterId, moduleType: moduleType, selectedAdvanceFitlersList: selectedAdvanceFitlersList, selectedStatTest: selectedStatTest, isVisits: isVisits, selectedDemofiltersList: selectedDemofiltersList, selectedConsumedFrqyTxt: selectedConsumedFrqyTxt, selectedConsumedFrqyid: selectedConsumedFrqyid, timePeriodType: timePeriodType,isFrqncyInBrandHlthMtricChanged:isFrqncyInBrandHlthMtricChanged
        };

        $.ajax({
            url: appRouteUrl + "Table/PrepareExcel",
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loaderExportExcel").hide();
                $(".transparentBGExportExcel").hide(); $('.transparentBG').hide();
                $('.export-excel-popup').hide();
                window.location.href = appRouteUrl + "Table/DownloadExcel?path=" + response;

            },
            error: ajaxError
        });

    });

    setTimeout(function () {
        //$("#table-data").tableHeadFixer({ "left": 1, "head": true })
    }, 500);
    return false;
});

var replotContentArea = function () {
    $("#flexi-table").tableHeadFixer({ "left": 1, "head": true });
}

var toggleData = function (event, demoFilterName) {
    var selection = $(".data.scrollable-rows-table tbody tr")[$(event).index()]
    if ($("." + demoFilterName).hasClass("dataShow")) {
        $(selection).find(".tbl-data-expan-collapse").empty().append("<div class='tbl-data-expan-collapse_hide'></div>");
        $("." + demoFilterName).removeClass("dataShow").addClass("dataHide");
    }
    else {
        $(selection).find(".tbl-data-expan-collapse").empty().append("<div class='tbl-data-expan-collapse_show'></div>");
        $("." + demoFilterName).removeClass("dataHide").addClass("dataShow");
    }
};
var removeBlankSpace = function (object) {
    object = object.trim();
    //var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+/g, '').replace(/\$/g, '').replace(/\+~!@#$/g, '');
    var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+/g, '').replace(/\$/g, '').replace(/\+~!@#$/g, '').replace(/\!/g, '');;
    return text.toLowerCase();
}

var defaultCustomSeltnforBeverageTabs = function () {
    if ($(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
    } else {
        $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
    }

    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Weekly+']").parent().hasClass("lft-popup-ele_active")) {
    }
    else {
        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Weekly+']").click();
    }
}

//Stat test
var getSelectedStatTestText = function (fil) {
    var selectedstatText = $('.table-statlayer').find('.activestat').text().trim();
    fil.push({
        Name: "StatTest", Data: null, SelectedText: selectedstatText.trim().toLocaleLowerCase() == "custom base" ? $('.stat-cust-estabmt.stat-cust-active').text() : selectedstatText
    });
    return fil;
}

//

//to display table output with selected columns with empty rows

var emptyTableoutputWithSelectedColumns = function () {
    var pathname = window.location.pathname; var fileNameIndex = pathname.lastIndexOf("/") + 1; var filename = pathname.substr(fileNameIndex);
    var tableFrequncydiv = "";
    tableFrequncydiv += '</div>';
    tableFrequncydiv += '</div>';
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
    if (filename == "EstablishmentDeepDive" || filename == "BeverageDeepDive") {
        if ($(".trend").hasClass("active")) {
            $(".advance-filters").css("display", "none");
            establishmentsSelected = $('.Time_Period_topdiv_element').find('.filter-info-panel-lbl');
            establishmentsSelected = trendTpList;
        }
        else
            establishmentsSelected = $('.Metric_Comparisons_topdiv_element').find('.filter-info-panel-lbl');
    }
    else if (filename == "BeverageCompare") {
        establishmentsSelected = $('.Beverage_topdiv_element').find('.filter-info-panel-lbl');
    }
    else if (filename == "EstablishmentCompare") {
        establishmentsSelected = $('.Establishment_topdiv_element').find('.filter-info-panel-lbl');

    }
    if (establishmentsSelected.length == 0)
        return false;
    $.each(establishmentsSelected, function (i, v) {
        if ($(".trend").hasClass("active")) {
            columns.push(v.Text);
        }
        else {
            columns.push($(v).find('.sel_text').text());
        }
    });
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
                tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn fontForMetrics tbl-algn" style="margin-top: 0px;">Sample Size</div><div></div><div></div></td>';
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
    $('.table-bottomlayer').html(tbodyHtml);

    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: $(".table-bottomlayer").height() - 40,
        pinnedRows: 1,
        pinnedCols: 2,
        container: "#scrollableTable",
        removeOriginal: true
    };
    $("#flexi-table").tablescroller(options);
    setWidthforTableColumns();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(4)').height();


    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-table').height($('.scrollable-data-frame').height() + 2);
    $('.scrollable-rows-frame').height($('.scrollable-rows-frame').height());
    $('.scrollable-data-table').height($('.scrollable-data-frame').height() + 6);

    $('#scrollableTable').css("height", "calc(100% - 221px)!important");
    $('.scrollable-rows-frame').css("height", "calc(100% - 221px)!important");
    $('.scrollable-data-frame').css("height", "calc(100% - 221px)!important");

    $(".advance - filters").css("display", "none");

    SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8, true);
    $('#scrollableTable,.scrollable-rows-frame,.scrollable-data-frame').addClass("emptyrowclassheight");
    $(".advance-filters").addClass("hideFilters");
    //$(".corner-frame").css("height", "28px!important");
    //$(".scrollable-columns-frame").css("height", "28px!important");
    $('.scrollable-data-table').css("height", "30px");
    $(".table-bottomlayer").css("margin-top", "14px");
    $(".data .scrollable-rows-table").css("height", "30px;");

    $(".tbl-data-btmbrd").css("display", "none");
    $(".tbl-btm-circle ").css("display", "none");

    //added by Nagaraju D for creating dynamic table
    //Date: 04-09-2017
    SetTableResolution();
}


