/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />
var isThresholdLmt = false, isSampleValidated = false, ss = 0;
var lowSS_List;
angular.module("mainApp").controller("dashboardController", ["$scope", "$q", "$http", "$timeout", function ($scope, $q, $http, $timeout) {
    $scope.buildMenu = function () {
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
        object = object.trim();
        var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+/g, '');
        return text.toLowerCase();
    }

    //To load('in') or save('out') user Selections  added by bramhanath
    $scope.Save = function (filterMode) {
        reset_img_pos();
        if (window.location.pathname.indexOf("P2PDashboard") == -1) { $(".loader,.transparentBG").hide(); return; }
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

        var filterPanelInfo = { filter: filterPanelInfoData.filter, filterMode: filterMode };
        $(".loader,.transparentBG").show();
        $.ajax({
            url: appRouteUrl + "dashboard/SaveorGetUserFilters",
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loader,.transparentBG").hide();
                if (filterMode.toLowerCase() == "out")
                    tomakeselectns(response);
                $scope.sampleSizeValidate();//$scope.prepareContentArea('submit');
                if (response == "Success") {
                    $(".loader,.transparentBG").hide();
                    alert('Saved Successfully');
                }
                else {

                }
            },
            error: function () {
                $(".loader,.transparentBG").hide();
                ajaxError
            }
        });

       
    }

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
                //Depending on Channels and resturants of(Fine Dinning  dynamically roads are changed to 3 and 4) Added by Bramhanath(19-06-2017)
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
        $(".loader,.transparentBG").show();
        var filterPanelInfoDataNew = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var statText = $(".table-stat.activestat").text().trim();
        if (statText == "CUSTOM BASE") {
            statText = $(".Custom_Base_topdiv_element .sel_text").text().trim();
        }
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "SkeworAge", SelectedText: $('.pit').hasClass('active') ? "Age" : "Skew", SelectedID: "" });
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "Timeperiod Type", SelectedText: $(".lft-popup-tp-active").text().trim(), SelectedID: "" });
        filterPanelInfoDataNew.filter.push({ Data: null, Name: "stat", SelectedText: statText, SelectedID: "" });
        var leftData = { filter: filterPanelInfoDataNew.filter, module: "" };
        $.ajax({
            url: appRouteUrl + "dashboard/sampleSizeValidator",
            data: JSON.stringify(leftData),
            method: "POST",
            contentType: "application/json",
            success: function (res) {
                if (res.length < 2) { res.push({SS:0});}
                isSampleValidated = true;
                ss = res[0].SS;
                $(".loader,.transparentBG").hide();
                $(".list-of-low-SS").empty();
                $(".null-error-popup .save-reportPopup").removeClass("useDirectionally");
                $(".save-popup-btn").removeClass("useDirectionally");
                if (res[1].SS > 30 && res[0].SS > 30) {
                    if (res[0].SS > 99) {
                        //Direct Output
                        $(".dashboard-content").show();
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
                ////Update CustomCurrentSelections if not low sample size
                //if (res[0].SS >= 30) {
                //    customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
                //    $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
                //}
                ////Establishment and stat both have low sample
                //if (res[0].SS < 30 && res[1].SS < 30) {
                //    $(".stat-heading.heading_text").text("Sample Size for the following selection is less than 30, Kindly change your selection.");
                //    $(".null-error-popup .save-proceed-btn").hide();
                //    $(".null-error-popup .cancel-proceed-btn").show();
                //} else {
                //    //Only Establishment have low sample
                //    if (res[0].SS < 30 && res[1].SS >= 30) {
                //        $(".stat-heading.heading_text").text("Sample Size for the following selection is less than 30, Kindly change your selection.");
                //        $(".null-error-popup .save-proceed-btn").hide();
                //        $(".null-error-popup .cancel-proceed-btn").show();
                //    } else {
                //        //Onlystat have low sample
                //        if (res[0].SS >= 30 && res[1].SS < 30) {
                //            $(".stat-heading.heading_text").text("Sample Size for the following selection is less than 30, Kindly change your selection.");
                //            $(".null-error-popup .save-proceed-btn").hide();
                //            $(".null-error-popup .cancel-proceed-btn").show();
                //        } else {
                //            //All are not low sample
                //            if (response.SS > 99) {
                //                $(".dashboard-content").show();
                //                $scope.prepareContentArea('submit');
                //            } else {
                //                $(".dashboard-content").hide();
                //                //Update the text of popup and //Show the popup
                //                if (response.SS >= 30) {
                //                    $(".stat-heading.heading_text").text("Sample Size is between 30 and 99. Use directionally.");
                //                    $(".null-error-popup .cancel-proceed-btn").hide();
                //                    $(".null-error-popup .save-proceed-btn").show();
                //                } else {
                //                    $(".stat-heading.heading_text").text("Sample Size for the following selection is less than 30, Kindly change your selection.");
                //                    $(".null-error-popup .save-proceed-btn").hide();
                //                    $(".null-error-popup .cancel-proceed-btn").show();
                //                }
                //                $(".null-error-popup").show();
                //            }
                //        }
                //    }
                //}
            }
        });
        /*End Sample size validation*/
    }
    $scope.proceedClick = function () {
        isSampleValidated = true;
        $(".null-error-popup").hide();
        $scope.prepareContentArea('submit');
    }
    //Stat test Click Function
    $scope.statTest = function (event) {
        previsSelectedStatTest = $('.table-statlayer').find('.activestat').attr("id");
        $(".table-stat").removeClass("activestat");
        $(event.currentTarget).addClass("activestat");
        selectedstatTestToCarryFrwd = $('.table-statlayer').find('.activestat').attr("id");
        if ($(".table-stat.activestat").text().trim().toLocaleLowerCase() == "custom base") {
            $(".loader, .transparentBG").show();
            $scope.CustomBaseClick();
        } else {
            $scope.sampleSizeValidate(); //$scope.prepareContentArea("submit");
        }
    }
    $scope.CustomBaseClick = function () {
        $timeout(function () {
            //isSampleValidated = true;
            $(".transparentBG").show();
            $(".loader").hide();
            $(".dashboard-custom-base").show();
            $(".mainCustomWrapper .lft-ctrl-next").click();
            placeCustomPopup();
        }, 0);
        //}); 
    }
    $scope.custom_cancel = function () {
        //If any custom base selections are there then revert
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
        $(".dashboard-custom-base, .transparentBG").hide();
    }
    $scope.closeSavePopup = function () {
        isSampleValidated = false;
        $(".sampleSizeNote").remove();
        //hide the popup and also hide the output area
        $(".null-error-popup,.dashboard-content").hide();
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
        $(".dashboard-custom-base, .transparentBG").hide();
    }
    $scope.custom_submit = function () {
        if ($(".Custom_Base_topdiv_element .sel_text").length == 0) { alert("Please select custom base before submitting"); } else {
            //customCurrentSelections = $(".Custom_Base_topdiv_element .sel_text").css("text-transform", "none").text();
            //$(".Custom_Base_topdiv_element .sel_text").css("text-transform", "uppercase");
            $scope.sampleSizeValidate(); //$scope.prepareContentArea('submit');
            $(".dashboard-custom-base").hide();
        }
    }
}]);

$(document).ready(function () {
    //
    $(".master_link").removeClass("active");
    $(".master_link.dashboard").addClass("active");
    $(".submodules-options").css("display", "block");
    //$(".pit").text("%age");
    $(".pit").text("Size");
    $(".trend").text("Skew");
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
        if (v.Name != null && v.Name != "Time Period" && v.Name != "IsVisit") {
            var ele = $(".master-lft-ctrl[data-val='" + v.Name + "']");
            var selIds = v.SelectedID == undefined ? [] : v.SelectedID.split("|");
            $.each(selIds, function (selI, selV) {
                $(ele).find(".lft-popup-ele-label[data-id=" + selV + "]").first().click();
            });
            if (v.Name == "StatTest") {
                $(".table-stat").removeClass("activestat");
                $('#' + v.SelectedID).addClass("activestat");
            }
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
        if (v.Name == "Time Period") {
            var allTP = $(".lft-popup-tp");
            for (var tpInd = 0; tpInd < allTP.length; tpInd++) {

                if ($(allTP[tpInd]).text().trim() == v.SelectedID) {
                    $(allTP[tpInd]).click();
                    var slider_pos = 0;
                    $(".ui-slider-label").each(function (ind, d) {
                        if ($(d).text().trim().toLocaleLowerCase() == v.Data[0].Text.toLocaleLowerCase()) { slider_pos = ind; }
                    });
                    $("#slider-range").slider('value', slider_pos);
                    $(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text(v.Data[0].Text);
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
    $("#table-categry").click();
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
//    /*End Sample size validation*/
//}