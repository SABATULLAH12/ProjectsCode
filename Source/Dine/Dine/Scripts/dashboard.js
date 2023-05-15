/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />
var isThresholdLmt = false, isSampleValidated = false, ss = 0; var filterMode = "";
var lowSS_List;
var advancedFiltersCustomBase = [];


angular.module("mainApp").controller("dashboardController", ["$scope", "$q", "$http", "$timeout", "$compile",function ($scope, $q, $http, $timeout,$compile) {
    var _dyanmicClickContent = $compile('<div class="master-btn lft-ctrl2" id="master-btn" ng-click="prepareContentArea(submit,$event);statTest($event)"></div>')($scope);
    angular.element(angular.element(".master-lft-ctrl.submt")[2]).empty().append(_dyanmicClickContent);

    $scope.buildMenu = function () {

        var menuData = clientDataStorage.get(controllername);
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "DashBoard/GetFilter/" + controllername, async: false, success: function (response) {
                    $scope.filters = response;
                    left_Menu_Data = response;
                    //added by Nagaraju for individual filters
                    //Date: 07-08-2017           
                    $scope.limit = 10;
                }, error: ajaxError
            });
            //This is to Load custom base popup
            $.ajax({
                url: appRouteUrl + "DashBoard/GetFilter/dashboardp2pdashboardCustomBase", async: false, success: function (response) {
                    $(".transparentBG").show();
                    $scope.subfilterCustomBase = response;
                }, error: ajaxError
            });
            //This is to Load custom base popup additional filters
            $.ajax({
                url: appRouteUrl + "DashBoard/GetFilter/dashboardp2pdashboardCustomBaseAdvancedFilters", async: false, success: function (response) {
                    $(".transparentBG").show();
                    $scope.subfilterCustomBaseAdvancedF = response;
                }, error: ajaxError
            });
        }
        reset_img_pos();
        //if (prepareFilter() == false)
        //    return false;
        $(".table-statlayer").css("display", "block");
        if (controllername == "dashboardp2pdashboard") {
            //$("#dashboard-img").attr('src', "../Images/P2PDashboard_BG.svg");
        }//.removeClass("visits").removeClass("brandhealth").addClass("demographic"); }
        else if (controllername == "dashboardbrandhealth") {
            $("#dashboard-img").attr('src', "../Images/BrandHealth_Dashboard.jpg");
        }
        else {
            $("#dashboard-img").attr('src', "../Images/Visits_Dashboard.jpg");
        }
    }
    $scope.buildMenu();
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

    //To load('in') or save('out') user Selections  added by bramhanath
    $scope.Save = function (filterMode) {
        reset_img_pos();
        if (window.location.pathname.indexOf("P2PDashboard") == -1 && window.location.pathname.indexOf("Demographics") == -1) { $(".loader,.transparentBG").hide(); return; }
        var filterPanelInfoData;
        if (filterMode.toLowerCase() == "in") {
            if (prepareFilter() == false)
                return false;

            filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
            filterPanelInfoData.filter.push({ Data: null, Name: "SkeworAge", SelectedText: $('.pit').hasClass('active') ? "Age" : "Skew", SelectedID: "" });
            filterPanelInfoData.filter.push({ Data: null, Name: "TimePeriodType", SelectedText: filterPanelInfoData.filter[1].SelectedID, SelectedID: "" });
        }
        else
            filterPanelInfoData = "";

        var filterPanelInfo = { filter: filterPanelInfoData.filter, filterMode: filterMode, dashboardType: controllername == "dashboard_demographics" ? 0 : 1 };
        $(".loader,.transparentBG").show();
        $("#MouseHoverSmallDiv").hide();
        $.ajax({
            url: appRouteUrl + "dashboard/SaveorGetUserFilters",
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                //$(".loader,.transparentBG").hide();
                if (filterMode.toLowerCase() == "out")
                    tomakeselectns(response);
                //$scope.sampleSizeValidate();//$scope.prepareContentArea('submit');
                if (response == "Success") {
                        $(".loader,.transparentBG").hide();
                        showMaxAlert('Saved Successfully');
                    //Add callSubmitOnClick class to alert-message-close
                        $(".alert-message-close").addClass("callSubmitOnClick");
                        $('.callSubmitOnClick').click(function () {
                            $(".alert-message-close").removeClass("callSubmitOnClick");
                            $scope.sampleSizeValidate();
                        });
                }
                else {
                    $scope.sampleSizeValidate();
                    isEstablishmentChanged = false;
                }
            },
            error: function () {
                $(".loader,.transparentBG").hide();
                ajaxError
            }
        });      
    }

    var isAlreadyShown = localStorage.getItem("isAlreadyShown");
    if (isChannelPopupEnabled == "true" && (isAlreadyShown == null || isAlreadyShown == "null") && controllername == "dashboardp2pdashboard") {
        localStorage.setItem("isAlreadyShown", "true");
        showChannelAlert(channelPopupText);
    }
    else
        $scope.Save("Out");//To load default user seletions

        //Submit Function
    $scope.prepareContentArea = function (isSubmitOrApplyFilter, event) {
        if (event != undefined || event != null) { return;}
        reset_img_pos();
        if (isSampleValidated == false) {
            $scope.sampleSizeValidate();
        } else {            
            if (prepareFilter() == false)
                return false;
            var filterPanelInfo = {};
            filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
            filterPanelInfo.filter.push({
                Data: null, Name: "SKew_Or_Highestpercent", SelectedText: "", SelectedID: $('.pit').hasClass('active') ? 1 : 0
            });
            //Add/Modify the stat test text if custom base is selected
            if ($(".table-stat.activestat").text().trim().toLocaleLowerCase() == "custom base") {
                filterPanelInfo.filter = filterPanelInfo.filter.map(function (d) {
                    if (d.Name == "StatTest" && d.SelectedText == "CUSTOM BASE") {
                        customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
                        d.SelectedText = $(".Custom_Base_topdiv_element .sel_text").text().trim();
                        $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
                    }
                    return d;
                });
            } else {
                customCurrentSelections = "";
                if ($(".dashboard-custom-base .lft-popup-ele_active .lft-popup-ele-label").length == 1) {
                    $(".dashboard-custom-base .lft-popup-ele_active .lft-popup-ele-label").click();
                }
            }
            //update previsSelectedStatTest
            previsSelectedStatTest = $(".table-stat.activestat").attr('id');
            $(".table-statlayer").css("display", "block");
            if (controllername == "dashboardp2pdashboard") {
                //Depending on Channels and resturants of(Fine Dinning  dynamically roads are changed to 3 and 4) Addesd by Bramhanath(19-06-2017)
                var isFineDingPrnt = $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-ele_active .lft-popup-ele-label").attr('parent-text');
                var isFineDinningText = $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-ele_active .lft-popup-ele-label").text();
                if (isFineDingPrnt == "Fine Dining" || isFineDinningText == "Fine Dining") {
                    isThresholdLmt = true;
                    if (isThresholdLmt) {
                        $('#p2p-dsbrd-BG').html('');
                        $('#p2p-dsbrd-BG').html('<object class="p2p-dsbrd-BG-4rds" style="background-color:#fff;"  data="../Images/P2PDashboardImages/Dine_BG2 V3.svg#svgView(preserveAspectRatio(none))" type="image/svg+xml"> </object>');
                    }
                }
                else {
                    isThresholdLmt = false;
                    $('#p2p-dsbrd-BG').html('');
                    $('#p2p-dsbrd-BG').html('<object class="p2p-dsbrd-BG-4rds" style="background-color:#fff;"  data="../Images/P2PDashboardImages/Dine_BG V3.svg#svgView(preserveAspectRatio(none))" type="image/svg+xml"> </object>');
                }
                //
                $(".dashboard-bottomlayer").removeClass("visits").removeClass("brandhealth").addClass("demographic");
                getDashboardData(filterPanelInfo);
                if (filterMode.toLowerCase() == "in") showMaxAlert('Saved Successfully');
            }
            else if (controllername == "dashboard_demographics") {
                //To Load svg charts
                //$(".male-female-chart").html('<object class="donutChartGender" data="../Images/Demog/P2P Dashboard elements_Gender_PiChart_Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".age-middle-chart").html('<object class="age-pie-chart" data="../Images/Demog/P2P Dashboard elements_Age_PiChart_Bg.svg?v=23" type="image/svg+xml"> </object>');
                //$(".occ-container[pos='1'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".occ-container[pos='2'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".occ-container[pos='3'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".occ-container[pos='4'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".occ-container[pos='5'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                //$(".occ-container[pos='6'] .occ-bar-chart").html('<object class="bar-chart" data="../Images/Demog/P2P Dashboard elements_Occupation BarChart Bg.svg?v=23" type="image/svg+xml"></object>');
                $(".dhs-container[pos='2'] .dhs-image-container").html('<object class="dhs-image one" data="../Images/Demog/P2P Dashboard elements_1Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                $(".dhs-container[pos='3'] .dhs-image-container").html('<object class="dhs-image one" data="../Images/Demog/P2P Dashboard elements_2Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                $(".dhs-container[pos='4'] .dhs-image-container").html('<object class="dhs-image one" data="../Images/Demog/P2P Dashboard elements_3Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                $(".ms-container[pos='1'] .dhs-image-container").html('<object class="dhs-image one heightforMartl" data="../Images/Demog/P2P Dashboard elements_1Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                $(".ms-container[pos='2'] .dhs-image-container").html('<object class="dhs-image one heightforMartl" data="../Images/Demog/P2P Dashboard elements_2Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                $(".ps-container .dhs-image-container").html('<object class="dhs-image one heightforMartl" data="../Images/Demog/P2P Dashboard elements_3Person HHS BarChart Bg_white.svg?v=23#svgView(preserveAspectRatio(xMidYMax meet))" type="image/svg+xml"> </object>');
                //$(".da-container[pos='1'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='2'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='3'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='4'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='5'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='6'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='7'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='8'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='9'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                //$(".da-container[pos='10'] .da-chart").html('<object class="da-bar-chart" data="../Images/Demog/P2P Dashboard elements_Diner Attitudes BarChart Bg.svg" type="image/svg+xml"> </object>');
                
                //
                getDashboardData(filterPanelInfo);
            }
            else if (controllername == "dashboardbrandhealth")
                $(".dashboard-bottomlayer").removeClass("visits").removeClass("demographic").addClass("brandhealth");
            else
                $(".dashboard-bottomlayer").removeClass("brandhealth").removeClass("demographic").addClass("visits");
            var timePeriodType = $(".pit").hasClass("active") == true ? "pit" : "trend";
            isSampleValidated = false;
        }            
    }
    $scope.sampleSizeValidate = function () {
         
        if (prepareFilter() == false) return;
        /*Start Sample size validation*/
        if ($(".loader").css("display") == "none") {
            $(".loader").show();
        }
        $(".transparentBG").show();
        var filterPanelInfoDataNew = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var statText = $(".table-stat.activestat").text().trim();
        if (statText == "CUSTOM BASE") {
            statText = $(".Custom_Base_topdiv_element .sel_text").text().trim();
        }
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "SkeworAge", SelectedText: $('.pit').hasClass('active') ? "Age" : "Skew", SelectedID: "" });
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "Timeperiod Type", SelectedText: $(".lft-popup-tp-active").text().trim(), SelectedID: "" });
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "stat", SelectedText: statText, SelectedID: "" });

        filterPanelInfoDataNew.filter.push({ Data: null, Name: "IsVisit", selectedstatText: "", SelectedID: $('.dashboardguest').hasClass('active') ? 0 : 1 });
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "Frequency Filters", selectedstatText: "", SelectedID: "" });
        
        var leftData = { filter: filterPanelInfoDataNew.filter, module: controllername };
        $.ajax({
            url: appRouteUrl + "dashboard/sampleSizeValidator",
            data: JSON.stringify(leftData),
            method: "POST",
            //async: false,
            contentType: "application/json",
            success: function (res) {
                 
                //In Case of Error : When for PP/PY Sample Size is UnAvailable
                if (res.length < 2) { res.push({ SS: 0 }); }
                //if (isEstablishmentChanged)
                isSampleValidated = true;
                isEstablishmentChanged = false;
                ss = res[0].SS;
                $(".loader,.transparentBG").hide();
                $(".transparentBG-for-p2p").hide();
                $(".list-of-low-SS").empty();
                $(".null-error-popup .save-reportPopup").removeClass("useDirectionally");
                $(".save-popup-btn").removeClass("useDirectionally");
                if (res[1].SS >= 30 && res[0].SS >= 30) {
                    if (res[0].SS > 99) {
                        //Direct Output
                        $(".dashboard-content").css("visibility", "visible");
                        $scope.prepareContentArea('submit');
                    } else {
                        //Use Directionally
                        $(".null-error-popup .save-reportPopup").addClass("useDirectionally");
                        $(".save-popup-btn").addClass("useDirectionally");
                        $(".stat-heading.heading_text").text("Sample Size is between 30 and 99. Use directionally.");
                        $(".null-error-popup .cancel-proceed-btn").hide();
                        $(".null-error-popup .save-proceed-btn").show();
                        $(".null-error-popup").show();
                    }
                } else {
                    //Store the list of Low Sample size
                    lowSS_List = [];
                    if (res[0].SS < 30) { lowSS_List.push({ "name": "ESTABLISHMENT", "value": "ESTABLISHMENT : " + $(".Establishment_topdiv_element .sel_text").text().trim() }); }
                    if (res[1].SS < 30) { lowSS_List.push({ "name": "STAT", "value": "STAT TESTING BASE : " + ($(".table-stat.activestat").text() == "CUSTOM BASE" ? $(".Custom_Base_topdiv_element .sel_text").text() : $(".table-stat.activestat").text()) }); }
                    $(".stat-heading.heading_text").text("Sample Size for the following selection is less than 30, Kindly change your selection.");
                    //Update the list of low sample size in popup
                    for (var i = 0; i < lowSS_List.length; i++) {
                        $(".list-of-low-SS").append("<div class='ind-item'>" + lowSS_List[i].value + "</div>");
                    }
                    $(".null-error-popup .save-proceed-btn").hide();
                    $(".null-error-popup .cancel-proceed-btn").show();
                    $(".null-error-popup").show();
                }
            }
        });
        /*End Sample size validation*/
        //show/hide custom base based on stattest
        if (statText == "PREVIOUS PERIOD" || statText == "PREVIOUS YEAR") {
            $(".Custom_Base_topdiv_element.topdiv_element").hide();
            $(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element").hide();
        }
        else{
            $(".Custom_Base_topdiv_element.topdiv_element").show();
            $(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element").show();
        }
    }
    $scope.proceedClick = function () {
        isSampleValidated = true;
        $(".null-error-popup").hide();
        $scope.prepareContentArea('submit');
    }
    //Stat test Click Function
    $scope.statTest = function (event) {
        //$(".custom-cancel-submit .custom-submit").css("background", "linear-gradient(0deg, rgba(152, 29, 32, 1) 0%, rgba(218, 32, 40, 1) 91.94%)");
        //$(".custom-cancel-submit .custom-customize").css("background", "transparent");

        previsSelectedStatTest = $(event.currentTarget).attr("id") == "table-prevsperiod" || $(event.currentTarget).attr("id") == "table-categry" || $(event.currentTarget).attr("id") == "table-prevsyear" ? $(event.currentTarget).attr("id") : $('.table-statlayer').find('.activestat').attr("id");
        $(".table-stat").removeClass("activestat");
        $("#" + previsSelectedStatTest).addClass("activestat");//$(event.currentTarget).addClass("activestat");
        selectedstatTestToCarryFrwd = $(event.currentTarget).attr("id") == "table-prevsperiod" || $(event.currentTarget).attr("id") == "table-categry" || $(event.currentTarget).attr("id") == "table-prevsyear" ? $(event.currentTarget).attr("id") : $('.table-statlayer').find('.activestat').attr("id");//$('.table-statlayer').find('.activestat').attr("id");
        if ($(event.currentTarget).text() == "CUSTOM BASE")
        {
            $(".loader, .transparentBG-for-p2p").show();
            $scope.CustomBaseClick();
            //$(".custom_OK").hide();
            $(".custom-submit").text("SUBMIT");
            $(".custom-cancel").removeClass("showCB_popup");
            $(".custom-submit").removeClass("showCB_popup");
            //$(".custom-submit").css("line-height","0px");
            $(".custom-customize").show();
        }
        else if ((isEstablishmentChanged == true || isAdvFiltersChanged==true) && $(event.currentTarget).text() == "") {
            $(".loader, .transparentBG-for-p2p").show();
            $scope.CustomBaseClick();
            $(".custom-submit").text("SUBMIT");
            $(".custom-cancel").removeClass("showCB_popup");
            $(".custom-submit").removeClass("showCB_popup");
            $(".custom-customize").show();
        }
        //else if (isAdvFiltersChanged == true && isEstablishmentChanged == false) {
        //    $(".transparentBG-for-p2p").show();
        //    $(".dashboard-customBase-advanced-filters").show();
        //    $(".dashboard-customBase-advanced-filters .lft-ctrl-next").trigger("click");
        //}
            //else if ($(".table-stat.activestat").text().trim().toLocaleLowerCase() == "custom base") {
            //    $(".loader, .transparentBG").show();
            //    if (isEstablishmentChanged == true) {
            //        $scope.CustomBaseClick();
            //    }
            //    else 
            //        $scope.sampleSizeValidate();
            //}
        else {
            $scope.sampleSizeValidate(); //$scope.prepareContentArea("submit");
        }
    }
    $scope.CustomBaseClick = function () {
        //if (isEstablishmentChanged ==false)
        //{
        //    $scope.sampleSizeValidate();
        //}
        //else {
            $timeout(function () {
                //isSampleValidated = true;
                $(".transparentBG-for-p2p").show();
                $(".loader").hide();
                $(".dashboard-custom-base").show();
                $(".mainCustomWrapper .lft-ctrl-next").click();
                placeCustomPopup();
            }, 0);
        //}
        //}); 
    }
    $scope.custom_cancel = function () {
        //If any custom base selections are there then revert
        $(".custom-cancel-submit .custom-customize").css("background", "transparent");
        $(".custombaseFilters_popup").hide();

        if ($(".Custom_Base_topdiv_element .sel_text").length != 0) {
            if ($(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text() != customCurrentSelections) {
                //Either remove the element or Replace the element
                if (customCurrentSelections == "") {
                    //Remove
                    $(".dashboard-custom-base .lft-popup-ele_active .lft-popup-ele-label").click();
                    //Set previous stat test
                    $(".table-stat").removeClass("activestat");
                    $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
                    //Also call prepareContentArea
                    $scope.prepareContentArea('submit');
                } else {
                    //Replace
                    var estName = $('.Establishment_topdiv_element.topdiv_element .filter-info-panel-lbl').text().trim();
                    var estId = $('.master-lft-ctrl.Establishment').find('.lft-popup-ele-label[data-val="' + estName + '"]').attr("data-parent");
                    if(estId!="")
                        $('.dashboard-custom-base .lft-popup-ele-label[data-id="' + estId + '"]').click();
                    else
                        $('.dashboard-custom-base .lft-popup-ele-label[data-val="' + customCurrentSelections + '"]').click();
                }
            }
            $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
        } else {

            if (previsSelectedStatTest == "table-categry") {
                //Replace
                $('.dashboard-custom-base .lft-popup-ele-label[data-val="' + customCurrentSelections + '"]').click();
                $(".table-stat").removeClass("activestat");
                $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
            } else {
                $(".table-stat").removeClass("activestat");
                $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
                //also call preparecontentArea
                $scope.prepareContentArea('submit');
            }
        }
        if ($('.Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl').length != 0) {
            //find which filters are sellected and cancel them
            var array = []
            $(".CB_popup_filters_content .CB_data_name .customBase_est_fil_ele").each(function (a, b) {
                array.push($(this).text())
            });
            $.each($(".Advance_Filters_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
                if (array.indexOf(d) > -1) {
                    $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + d + "]").click();
                }
            });
        }
        $(".dashboard-custom-base, .transparentBG").hide();
        //$(".transparentBG-for-p2p").hide();
        if ($(".custom-submit").hasClass("showCB_popup")) {
                $scope.custom_customize();
        }
        else
            $(".transparentBG-for-p2p").hide();

    }
    $scope.closeSavePopup = function () {

        isSampleValidated = false;
        reset_img_pos();
        $(".sampleSizeNote").remove();
        //hide the popup and also hide the output area
        $(".null-error-popup").hide();
        $(".dashboard-content").css("visibility", "hidden");
         $(".showandhidedemog").css("visibility", "hidden");
        //If any custom base selections are there then revert
        if ($(".Custom_Base_topdiv_element .sel_text").length != 0) {
            if ($(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text() != customCurrentSelections) {
                //Either remove the element or Replace the element
                if (customCurrentSelections == "") {
                    var isCustomLow = false;
                    for (var i = 0; i < lowSS_List.length; i++) {
                        if (lowSS_List[i].name == "STAT") { isCustomLow = true; }
                    }
                    if (lowSS_List.length == 2 || isCustomLow) {
                        //Remove
                        $(".dashboard-custom-base .lft-popup-ele_active .lft-popup-ele-label").click();
                        $(".table-stat").removeClass("activestat");
                        $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
                    } else {
                        customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
                        previsSelectedStatTest = "table-categry";
                    }
                } else {
                    //Replace
                    $('.dashboard-custom-base .lft-popup-ele-label[data-val="' + customCurrentSelections + '"]').click();
                }
            } else {
                previsSelectedStatTest = "table-categry";
                $(".table-stat").removeClass("activestat");
                $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
            }
            $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
        } else {
            if (previsSelectedStatTest == "table-categry") {
                //Replace
                $('.dashboard-custom-base .lft-popup-ele-label[data-val="' + customCurrentSelections + '"]').click();
                $(".table-stat").removeClass("activestat");
                $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
            } else {
                $(".table-stat").removeClass("activestat");
                $(".table-stat[id='" + previsSelectedStatTest + "']").addClass("activestat");
            }
        }
        $(".dashboard-custom-base, .transparentBG,.channel-popuptext").hide();
    }
    $scope.custom_submit = function () {
        //change button background color
        //$(".custom-cancel-submit .custom-submit").css("background", "linear-gradient(0deg, rgba(152, 29, 32, 1) 0%, rgba(218, 32, 40, 1) 91.94%)");
        //$(".custom-cancel-submit .custom-customize").css("background", "transparent");
        if ($(".Custom_Base_topdiv_element .sel_text").length == 0) { showMaxAlert("Please select custom base before submitting"); } else {
            //customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
            //$(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
            //$scope.sampleSizeValidate(); //$scope.prepareContentArea('submit');
            $(".dashboard-custom-base").hide();
            if (!$(".custom-submit").hasClass("showCB_popup")) {
                $scope.sampleSizeValidate();
            }
            else {
                $scope.custom_customize();
            }
            //$(".custombaseFilters_popup").hide();
        }
    }
    $scope.custom_customize = function () {
        //change the background to red for customize button and remove backgroud color for submit
        //$(".custom-cancel-submit .custom-customize").css("background", "linear-gradient(0deg, rgba(152, 29, 32, 1) 0%, rgba(218, 32, 40, 1) 91.94%)");
        //$(".custom-cancel-submit .custom-submit").css("background", "transparent");
        //hide custom base popup
        $(".dashboard-custom-base").hide();
        var filters = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var customBase = $('.Custom_Base_topdiv_element .filter-info-panel-lbl').text();
        //for (var i = 0; i < filters.filter[6].Data.length; i++) {
        //    customBase = filters.filter[6].Data[i].Text;
        //establishments
        $(".CB_popup_establishment_content").text('');
        $(".CB_popup_establishment_content").append("<div class='CB_data_name'><div class='stat-cust-dot' style='width:24px;margin-top:-4px;'></div><div class='customBase_est_fil_ele'>" + customBase + "</div></div");
        
        //custom base filters
        var CustomBaseAdFilters = [];
        $(".CB_popup_filters_content").text('');
        $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) { CustomBaseAdFilters.push($(d).text().trim().toLowerCase()); });
        CustomBaseAdFilters.forEach(function (filter) {
            $(".CB_popup_filters_content").append("<div class='CB_data_name'><div class='stat-cust-dot' style='width:24px;margin-top:-4px;'></div><div class='customBase_est_fil_ele'>" + filter + "</div></div");
        })
        $(".CB_popup_filters_content").getNiceScroll().remove();
        SetScroll($(".CB_popup_filters_content"), "white", -10, -5, 0, 14, 8);
        $(".custombaseFilters_popup").show();
    }
    $scope.CB_customize_submit = function () {
        $(".custombaseFilters_popup").hide();
        $scope.prepareContentArea('submit');
    }
    $scope.CB_customize_cancel = function () {
        $(".custombaseFilters_popup").hide();
        $(".transparentBG").hide();
        $(".transparentBG-for-p2p").hide();
    }
    $scope.CB_change_Est = function () {
        $(".custombaseFilters_popup").hide();
        $(".custom-customize").hide();
        $(".custom-submit").text("OK");
        $(".custom-cancel").addClass("showCB_popup");
        $(".custom-submit").addClass("showCB_popup");
        $scope.CustomBaseClick();
        //$(".custom-submit").css("line-height", "24px");
        //$(".custom_OK").show();
    }
    $(".custom-submit").click(function () {
        $scope.custom_customize();
    });
    $scope.advFilters_OK = function () {
        advFiltersCBList = [];
        $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
            advFiltersCBList.push($(d).attr("data-id"));
        });
        $scope.custom_customize();
        $(".dashboard-customBase-advanced-filters").hide();
    }
    $scope.advFilters_Cancel = function () {
        $(".dashboard-customBase-advanced-filters").hide();
        //var filtered = JSON.parse($("#master-btn").attr('data-val')).filter(function (item) {
        //    return item.Name == "Advanced Filters Custom Base";
        //});
        var CustomBaseAdFilters = [];
        $.each($(".Advanced_Filters_Custom_Base_topdiv_element.topdiv_element .filter-info-panel-lbl"), function (i, d) {
            CustomBaseAdFilters.push($(d).attr("data-id"));
        });
        //debugger
        if (advFiltersCBList.length>0) {//filtered[0].SelectedID
           // var selectedId = filtered[0].SelectedID.split('|');
            // if (CustomBaseAdFilters.length > selectedId.length) {
            var itemToRemove = $.grep(CustomBaseAdFilters, function (el) { return $.inArray(el, advFiltersCBList) == -1 });
            itemToRemove.forEach(function (a, b) {
                    $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + a + "]").click();
                });
           // }
        }
        //CustomBaseAdFilters.forEach(function (a, b) {
        //    $(".dashboard-customBase-advanced-filters .lft-popup-ele-label[data-id=" + a + "]").click();
        //});
        $scope.custom_customize();
    }
    $(document).on("click", ".channelOkClick", function () {
        $(".channel-popuptext,.transparentBGforAlert,.loader").hide();
        $scope.Save("Out");//To load default user seletions
    });
}]);
$(document).ready(function () {    
    $(".CB_popup_change_filters").click(function (e) {
        $(".custombaseFilters_popup").hide();
        $(".dashboard-customBase-advanced-filters").show();
       
        $(".dashboard-customBase-advanced-filters .lft-ctrl-next").trigger("click");
        e.stopImmediatePropagation();
    });
    $(".master_link").removeClass("active");
    $(".master_link.dashboard").addClass("active");
    $(".submodules-options").css("display", "block");
    $(".pit").text("Size");
    $(".trend").text("Skew");
    $(".dashboardguest").text("Guest");
    $(".dashboardvisit").text("Visit");
    $('.timperiodpittrend').show();
    $(".dashboard-custom-base .lft-popup-col1 .lft-popup-col-selected-text").text("Establishment");
    //
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(0)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((24 * $(".master_link_a:eq(0)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
        $(".submodules-band").css("margin-left", "23.5%");
        $(".submodules-band").css("margin-top", "-0.40%");
    }
    $(".master-lft-ctrl[data-val='Establishment'] .lft-ctrl3").attr("data-ismultiselect", "false");
    $("#table-custombse").unbind("click");
});

//To Get the Selected Stat Test added by Bramhanath(24-05-2017)
var getSelectedStatTestText = function (fil) {
    var selectedstatText = $('.table-statlayer').find('.activestat').text().trim();
    var selectedStatId= $('.table-statlayer').find('.activestat').attr("id");
    fil.push({
        Name: "StatTest", Data: null, SelectedText: selectedstatText, SelectedID: selectedStatId
    });
    return fil;
}
//

//Load and make selections which are already saved 
var tomakeselectns = function (filter)
{
    var savedFilters = JSON.parse(filter);
    $.each(savedFilters, function (i, v) {
        if (v.Name != null && v.Name != "Time Period" && v.Name != "IsVisit" && v.Name != "SKew_Or_Highestpercent") {
            var ele = $(".master-lft-ctrl[data-val='" + v.Name + "']");
            var selIds = v.SelectedID == undefined ? [] : v.SelectedID.split("|");
            $.each(selIds, function (selI, selV) {
                $(ele).find(".lft-popup-ele-label[data-id=" + selV + "]").first().click();
            });
            if (v.Name == "StatTest") {
                $(".table-stat").removeClass("activestat");
                $('#' + v.SelectedID).addClass("activestat");
            }
            if (controllername != "dashboard_demographics") {
                if (v.Name == "SkeworAge") {
                    var seltdText = v.SelectedText;
                    if (seltdText == "Skew" && $(".pit").hasClass("active")) {
                        $(".pit").removeClass("active");
                        $(".trend").addClass("active");
                        $("#pit-toggle").prop("checked", true);
                    }
                    else {
                        $(".trend").removeClass("active");
                        $(".pit").addClass("active");
                        $("#pit-toggle").prop("checked", false);
                    }

                }

            }
            if (v.Name == "Frequency Filters") {
                var ele = $(".master-lft-ctrl[data-val='Advance Filters']");
                var selIds = v.SelectedID == undefined ? [] : v.SelectedID.split("|");
                $.each(selIds, function (selI, selV) {
                    $(ele).find(".lft-popup-ele-label[data-id=" + selV + "]").first().click();
                });                
            }
        }
        else if (v.Name == "SKew_Or_Highestpercent") {
            var seltdId = v.SelectedID;
            if (seltdId == 1) {
                $(".pit").removeClass("active");
                $(".trend").addClass("active");
                $("#pit-toggle").prop("checked", true);
            }
            else {
                $(".trend").removeClass("active");
                $(".pit").addClass("active");
                $("#pit-toggle").prop("checked", false);
            }
        }
        else if (v.Name == "IsVisit") {
            var seltdId = v.SelectedID;
            if (seltdId == 1) {
                $(".dashboardguest").removeClass("active");
                $(".dashboardvisit").addClass("active");
                $("#pit-toggleGuest").prop("checked", true);                
            }
            else {
                $(".dashboardvisit").removeClass("active");
                $(".dashboardguest").addClass("active");
                $("#pit-toggleGuest").prop("checked", false);
            }
            //For Guest/Visit text in Breadcrumb
            var selectedVisitsorGuests = "";
            if ($('.dashboardguest').hasClass('active'))
                selectedVisitsorGuests = 'GUEST';
            else
                selectedVisitsorGuests = 'VISITS';

            if ($($(".filter-info-panel-elements")[0]).find(".Guest_Visit").length == 0)
                $(".filter-info-panel-elements").prepend("<div class='Guest_Visit topdiv_element' data-val = 'Guest_or_Visits'><div class='filter-info-panel-lbl'> <span class='left'> " + selectedVisitsorGuests + " </span></div><span class='pipe'>| </span></div>");
            else
                $(".Guest_Visit .filter-info-panel-lbl").html("<span class='left'> " + selectedVisitsorGuests + "</span>");
            //Show cross if visit
            var isTotalVisit = false;
            var temp_filter = JSON.parse(filter);
            $(temp_filter).each(function (i, d) {
                if (d.Name == "Frequency Filters" && d.SelectedID == 6) { isTotalVisit = true; }
            });
            if (v.SelectedID == 1) {
                if ($(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .filter-info-panel-txt-del").length == 0 && !isTotalVisit) {
                    $(".Advance_Filters_topdiv_element .filter-info-panel-lbl:eq(0) .sel_text").next().addClass("filter-info-panel-txt-del");
                }
                $(".Advance_Filters_topdiv_element .filter-info-panel-txt-del").addClass("display-inline");
            } else {
                $(".Advance_Filters_topdiv_element .filter-info-panel-txt-del").removeClass("display-inline");
            }
        }
        if (v.Name == "Time Period") {
            var allTP = $(".lft-popup-tp");
            for (var tpInd = 0; tpInd < allTP.length; tpInd++) {
                if ($(allTP[tpInd]).text().trim() == v.SelectedID) {
                    $(allTP[tpInd]).click();
                    //var slider_pos = 0;
                    //$(".ui-slider-label").each(function (ind, d) {
                    //    if ($(d).text().trim().toLocaleLowerCase() == v.Data[0].Text.toLocaleLowerCase()) { slider_pos = ind; }
                    //});
                    $("#slider-range").slider('value', $(".ui-slider-label").length);
                    //$(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text(v.Data[0].Text);
                }
            }
        }
    });    
    //If custom base is selected then Update the currentCustomSelection
    customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
    $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
    if ($(".Custom_Base_topdiv_element .sel_text").length != 0) {
        previsSelectedStatTest = $("#table-categry").attr("id");
    } else {
        previsSelectedStatTest = $("#table-prevsperiod").attr("id");
    }
}
//

var callSubmitBtn = function () {
    //sampleSizeValidate();
    angular.element($('.master-view-content')).scope().sampleSizeValidate();//prepareContentArea('submit');
}

$(document).on("click", ".master-lft-ctrl.submt.SbmtHide", function (e) {
    //if (prepareFilter() == false) return;
    //$("#table-categry").click();
})

$(document).on("click", ".mainCustomWrapper .lft-popup-col1 .lft-popup-ele", function (e) {
    if (e.target == this) {
        $(this).find(".lft-popup-ele-label").click();
    }    
})
$(document).on("click", ".mainCustomWrapper .lft-popup-col1 .lft-popup-ele-label-img", function (e) {
    if (e.target == this) {
        $(this).parent().find(".lft-popup-ele-label").click();
    }
})

$(window).resize(function () {
    placeCustomPopup();
});
var placeCustomPopup = function () {
    if ($(".dashboard-custom-base").is(":visible") == true) {
        var bottom = -(window.innerHeight - 18);
        $(".mainCustomWrapper .lft-ctrl3").css("bottom", bottom + "px");
    }
}
//var sampleSizeValidate = function () {
//    if(prepareFilter() == false) return;
//    /*Start Sample size validation*/
//    $(".loader,.transparentBG").show();
//    var filterPanelInfoDataNew = { filter: JSON.parse($("#master-btn").attr('data-val')) };
//    filterPanelInfoDataNew.filter.push({ Data: null, Name: "SkeworAge", SelectedText: $('.pit').hasClass('active') ? "Age" : "Skew", SelectedID: "" });
//    filterPanelInfoDataNew.filter.push({ Data: null, Name: "Timeperiod Type", SelectedText: $(".lft-popup-tp-active").text().trim(), SelectedID: "" });
//    var leftData = { filter: filterPanelInfoDataNew.filter, module: "" };
//    $.ajax({
//        url: appRouteUrl + "dashboard/sampleSizeValidator",
//        data: JSON.stringify(leftData),
//        method: "POST",
//        contentType: "application/json",
//        success: function (response) {
//            $(".transparentBG").hide();
//            if (response.SS > 99) {

//            } else {
//                //Update the text of popup

//                //Show the popup
//                $(".").show();
//            }
//        }
//    });
//    /*End Sample size alidation*/
//}
