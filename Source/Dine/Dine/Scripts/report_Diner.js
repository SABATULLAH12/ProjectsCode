/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />
var estHeader = "Select the benchmark and upto 4 comparisions"; var selectedTilesArray = [], isDefaultSelected = 0, selectedCB = "";
var selectedPrvewImgLst = []; var currentPrevImgId = ""; var IsCustomDownload = false; var previousCustombaseSeltns = ""; var selectedEstablsmntColorLsit = []; var selectedColorStr = "";
var defaultVisitsSelect = false, isVisitsSelected = false, isDefaultLoadSitnReport = true, isFromQuickDownloadSitn = false;
var defaultFreqeuncyIdForSitn = "", defaultFrequencyNameForSitn = "", isPreviousParentId = "", previousSelectedMeasureId = 0;

/*StickyFrequency for the  SAR report -- Start*/

var stickySelectedFreqcyFor_CoreGuest = "";
var stickySelectedFreqcyFor_MyTrips = "";
var stickySelectedFreqcyFor_LoyltyPyrmd = "";
var stickySelectedFreqcyFor_FairShareAnalysis = "";
var isFrequencyChangedFor_CoreGuest = false, isFrequencyChangedFor_MyTrips = false, isFrequencyChangedFor_LoyltyPyrmd = false, isFrequencyChangedFor_FairShareAnalysis = false;
var isstickySelectionVisit = false, isToggleClicked = false;
var isFromLSSPppSAR = false;
var checkFrequencyListCrossChannel = ['Yearly+', 'Establishment In Trade Area', 'Total Visits'];
var isFromShareGuestsTripsPopup = false;
//sabat
var isFromMSS = false;
/*StickyFrequency for the  SAR report -- End*/

angular.module("mainApp").controller("reportController", ["$scope", "$q", "$http", function ($scope, $q) {
    $scope.buildMenu = function () {
        $.ajax({
            url: appRouteUrl + "Report/GetFilter/" + controllername, async: false, success: function (response) {
                $scope.filters = response;
                //added by Nagaraju for individual filters
                //Date: 07-08-2017    
                left_Menu_Data = response;
                $scope.limit = 10;
            }, error: ajaxError
        });
    }
    $scope.report = {
        buildOutput: function () {
        }
    }
    $scope.subfilters = [];
    $scope.buildMenu();

    $scope.buildAdvancedMenu = function () {
        var bitData = 0;
        var menuData = null;//clientDataStorage.get(controllername + "_reportsituation" + bitData);
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Report/GetAdvancedFilters?id=reportsituationassessment_frequency",
                async: false,
                success: function (response) {
                    $scope.subfilters = response[0].Filters;
                    //clientDataStorage.store(controllername + "_reportsituation" + bitData, JSON.stringify(response));
                }, error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
                //$scope.advanceFilter = response;
        }
    }
    $scope.buildAdvancedMenu();
    $scope.prepareContentArea = function (isSubmitOrApplyFilter) {
        reset_img_pos();
        if (prepareReportFilter() == false)
            return;
        var reportname = "";
        var dineorSummaryMethod = "";
        if (controllername == "reportp2preport") {
            reportname = "DineSummaryReport";
            dineorSummaryMethod = "DownloadDineReport";
        }
        else {
            reportname = "DineSummaryReport";
            dineorSummaryMethod = "DownloadSummaryReport";
        }
        $.ajax({
            url: appRouteUrl + "report/" + reportname + "/" + controllername,
            data: "",
            method: "GET",
            contentType: "application/json",
            success: function (response) {
                window.location.href = appRouteUrl + "Report/" + dineorSummaryMethod + "?path=" + response;
            },
            error: ajaxError
        });
    }
    $scope.DownloadAll = function () {
    }
    var downloadAllSlides = function () {
        $(".master-lft-ctrl").parent().css("background", "none")
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $(".stat-popup").hide(); $(".transparentBG").hide();
        reset_img_pos();
        if (checkValidationSessionObj == false) return;
        var reportname = "";
        var dineorSummaryMethod = "";
        if (controllername == "reportp2preport") {
            reportname = "DineSummaryReport";
            dineorSummaryMethod = "DownloadDineReport";
        }
        else {
            reportname = "DineSummaryReport";
            dineorSummaryMethod = "DownloadSummaryReport";
        }
        //IsCustomDownload = false;
        if (valideateLeftPanel() == false)
            return;
        if (prepareReportFilter() == false)
            return;
        // Selected Demo Filters
        var selectedDemofilters = "", selectedDemofiltersList = [];
        var selectedDemofilters = $(".Demographic_Filters_topdiv_element[data-val='Demographic Filters'] div").find(".sel_text");
        $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().trim() + ",";
        });
        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
        $(".loader,.transparentBG").show();
        var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterPanelInfo = { filter: filterPanelInfoData.filter, module: modulename, selectedDemofiltersList: selectedDemofiltersList, selectedEstablsmntColorLsit: selectedEstablsmntColorLsit, selectedColorStr: selectedColorStr };
        $.ajax({
            url: appRouteUrl + "report/" + reportname + "/" + controllername,
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                pp_py_lock = 0;
                window.location.href = appRouteUrl + "Report/" + dineorSummaryMethod + "?path=" + response;
                $(".loader").hide();
                $(".transparentBG").hide();
            },
            error: function () {
                $(".loader").hide();
                $(".transparentBG").hide();
                ajaxError
            }
        });
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

    $scope.custombaseSubmit = function () {
        if ($(".stat-cust-active").length == 0) { showMaxAlert("Establishment required !"); return; }

        //if (report_benchMarkSelected == "")
        //    report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();//report_benchMarkSelected = $(".stat-content-estmntdiv").find(".stat-cust-active").text(); //$(".stat-cust-active").text();

        if (report_benchMarkSelected == "")
            report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text(); //$(".stat-cust-active").text();
        else {
            if ($(".stat-content-estmntdiv").find(".stat-cust-active").text() == "")
                report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
            else
                report_benchMarkSelected = $(".stattest-est-timeprd").find(".stat-cust-active").text();
        }

        selectedCB = report_benchMarkSelected;
        report_comparisionsSelected = [];
        var tempEstList = $(".Establishment_topdiv_element .sel_text");
        $.each(tempEstList, function (i, d) {
            if ($(d).text() != report_benchMarkSelected) {
                report_comparisionsSelected.push($(d).text());
            }
        });
        $(".stat-popup").hide(); $(".transparentBG").hide();
        if (!(valideateLeftPanel())) { return; }

        //Color Palete Poppup
        $(".custom-color-palte .heading_text").text("SELECT COLOR FOR ESTABLISHMENT");
        $('.customcolor-content').html("");
        var estblselectedLst = $('.filter-info-panel-elements .Establishment_topdiv_element').find('.filter-info-panel-lbl');
        var customcolorhtml = "";
        $.each(estblselectedLst, function (i, d) {
            customcolorhtml += "<div class='customcolor-div'><div class='customcolor-est-labeldiv'>";
            customcolorhtml += "<div class='customcolor-est-label'>" + $(d).find(".sel_text").text() + "</div></div>";
            customcolorhtml += "<div class='customcolor-est-color'>";
            customcolorhtml += '<div class="custom-estcolordiv" id="' + $(d).attr("data-id") + '"  text="' + $(d).find(".sel_text").text() + '" ></div>';
            customcolorhtml += "</div>";
            customcolorhtml += "</div>";
        });
        $(".customcolor-content").append(customcolorhtml);
        //Assign colors to All list
        assignfillcolorinpopup("Establishment");
        $(".stat-popup").hide();
        $(".custom-color-palte").show();
        //

    }

    $scope.customcolrSubmit = function () {
        if (checkValidationSessionObj() == false) {
            return false;
        }
        $(".custom-color-palte").hide();
        var colorCodeObjs = [];
        var changedColorCodeList = [];
        var palatteType = "Establishment";
        var colorStr = "";
        var colorCodebasedOnStatTestSelection = [];

        var final_colorCodebasedOnStatTestSelection = [];
        $(".custom-estcolordiv").each(function (i, d) {
            colorCodeObjs.push({ id: $(d).attr('id'), color: $(d).attr('colorcode'), originalcolor: $(d).attr('originalcolor') });
            colorCodebasedOnStatTestSelection.push({ name: $(d).attr("text"), color: $(d).attr('colorcode') })
        });

        $(colorCodebasedOnStatTestSelection).each(function (i, v) {
            if (report_benchMarkSelected == v.name) {
                final_colorCodebasedOnStatTestSelection.unshift(v.color);
            }
            else {
                final_colorCodebasedOnStatTestSelection.push(v.color);
            }
        });
        colorStr = final_colorCodebasedOnStatTestSelection.toString().split(",").join("|");

        for (var i = 0; i < colorCodeObjs.length; i++) {
            if (colorCodeObjs[i].color != colorCodeObjs[i].originalcolor) {
                $('.master-lft-ctrl[data-val="' + palatteType + '"] span.lft-popup-ele-label[data-id="' + colorCodeObjs[i].id + '"]').attr("colorcode", colorCodeObjs[i].color);
                var colorCodeObj = {
                    ColourCode: colorCodeObjs[i].color,
                    Establishmentid: colorCodeObjs[i].id,
                    MeasureId: '',
                    GroupsId: '',
                    IsTrend: 0
                };
                changedColorCodeList.push(colorCodeObj);
            }
            //else {
            //    var colorCodeObj = {
            //        ColourCode: colorCodeObjs[i].color,
            //        Establishmentid: colorCodeObjs[i].id,
            //        MeasureId: '',
            //        GroupsId: '',
            //        IsTrend: 0
            //    };
            //    changedColorCodeList.push(colorCodeObj);
            //}
        }
        selectedEstablsmntColorLsit = [];
        selectedColorStr = "";
        selectedEstablsmntColorLsit = changedColorCodeList.slice(0, changedColorCodeList.length);
        selectedColorStr = colorStr;//colorStr.slice(0, -1);
       
        if (controllername == 'situationassessmentreport') {
            if (isFromQuickDownloadSitn)
                qucikDownloadSitnReport();
            else {
                //*********************** Saving custom color codes *******************//
                $(".loader").show();
                $(".transparentbg").show();
                $.ajax({
                    url: appRouteUrl + "Report/SaveChangedColorCodeForSAR",
                    data: { ChangedColorCodeList: changedColorCodeList },
                    method: "POST",
                    async: true,
                    contenttype: "application/json",
                    success: function (response) {
                        if (!isFromShareGuestsTripsPopup && isFromMSS) {
                                $(".loader").hide();
                                $(".null-error-popup-sitn-downld").find("#downlaodtext").text("The \"Share of Guests & Trips\" slide will not be downloaded as selection has low trip Sample Size");
                                $(".null-error-popup-sitn-downld").show();
                            }
                            else if (!isFromShareGuestsTripsPopup && !isFromMSS && isTotalVisitsMainHdrAdded)
                            {
                                $(".loader").hide();
                                $(".null-error-popup-sitn-downld").find("#downlaodtext").text("The \"Share of Guests & Trips\" slide will not be downloaded as selection has low trip Sample Size");
                                $(".null-error-popup-sitn-downld").show();
                            }
                         
                        else {
                            $(".null-error-popup-sitn-downld").hide();
                            downloadSitnReport();
                        }
                        $(".custom-color-palte,.transparentbg").hide();
                    },
                    error: function () {
                        $(".loader").hide();
                        $(".transparentBG").hide();
                        ajaxError
                    }
                });
               

        }

        }
        else {
            if (IsCustomDownload) {
                downloadCustom();
        } else {
                $(".table-stat.statTest").removeClass("activestat");
                $(".table-stat.statTest[data-val='cb']").addClass("activestat");
                downloadAllSlides();
            }
        }
    }

    $scope.customcolrCancel = function () {
        $(".custom-color-palte,.transparentBG").hide();
        isFromQuickDownloadSitn = false;
    }

    $scope.closeColorPopup = function () {
        $(".custom-color-palte,.transparentBG").hide();
        isFromQuickDownloadSitn = false;
    }

    $scope.downloadall = function () {
        if (IsCustomDownload) {
            //if ($(".report-maindiv").html().trim() == "") { downloadCustom(); } else { $(".downloadbtn").click(); }
            downloadCustom();
        } else {
            $(".table-stat.statTest").removeClass("activestat");
            $(".table-stat.statTest[data-val='cb']").addClass("activestat");
            downloadAllSlides();
        }
    }
    $scope.custombaseCancel = function () {
        pp_py_lock = 0; setPreviousStatTest();
        $(".stat-popup").hide(); $(".transparentBG").hide();
        //if ($(".stat-cust-estabmt.stat-cust-active").length == 0) {
        report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        //} else { report_benchMarkSelected = $(".stat-cust-estabmt.stat-cust-active").text(); }
        selectedCB = report_benchMarkSelected;
        if ($(".report-maindiv").text().trim() == "") {
            if (controllername == "reportp2preport")
                $("#p2pstatictext").show();
            else
                $("#p2pstatictext_diner").show();
            $(".report-maindiv").hide();
        }
    }
    $scope.pySubmit = function () {
        $(".stat-popup-py").hide();
        var stat_text = 'py';
        //make stat test pp active
        $(".table-stat.statTest").removeClass("activestat");
        $(".table-stat.statTest[data-val='" + stat_text + "']").addClass("activestat");
        if (!(valideateLeftPanel())) { return; }
        if (IsCustomDownload) {
            if ($(".report-maindiv").html().trim() == "") {
                //Open the tile view
                downloadCustom();
            } else { $(".transparentBG").hide(); }
        } else {
            downloadAllSlides();
        }
    }
    $scope.ppSubmit = function () {
        $(".stat-popup-pp").hide();
        var stat_text = 'pp';
        //make stat test pp active
        $(".table-stat.statTest").removeClass("activestat");
        $(".table-stat.statTest[data-val='" + stat_text + "']").addClass("activestat");
        if (!(valideateLeftPanel())) { return; }
        if (IsCustomDownload) {
            if ($(".report-maindiv").html().trim() == "") {
                //Open the tile view
                downloadCustom();
            } else { $(".transparentBG").hide(); }
        } else {
            downloadAllSlides();
        }
    }
    $scope.pyCancel = function () {
        $(".stat-popup-py").hide(); $(".transparentBG").hide();
        pp_py_lock = 0; setPreviousStatTest();
    }
    $scope.ppCancel = function () {
        $(".stat-popup-pp").hide(); $(".transparentBG").hide();
        pp_py_lock = 0; setPreviousStatTest();
    }
    //$scope.statTest = function (event, stat_text) {
    //    statTextClick(event,stat_text);
    //}
    $scope.closeSavePopup = function () {
        if (controllername != 'situationassessmentreport') {
            if (controllername == "reportp2preport")
                $("#p2pstatictext").show();
            else
                $("#p2pstatictext_diner").show();
            $(".report-maindiv").hide();
            $(".null-error-popup").hide();
            $(".null-error-popup-userdirctnl").hide();
           
        }
        else {
            hidePopupInSitnReport();//only for the situationassement report
        }
    }

    // Custom Color Click function of

    $scope.Customdownload = function () { 
        if ($(".stat-cust-active").length == 0) { showMaxAlert("Establishment required !"); return; }
                report_benchMarkSelected = $(".stat-cust-active").text();
                selectedCB = report_benchMarkSelected;
            report_comparisionsSelected =[];
            var tempEstList = $(".Establishment_topdiv_element .sel_text");
            $.each(tempEstList, function (i, d) {
                if ($(d).text() != report_benchMarkSelected) {
                report_comparisionsSelected.push($(d).text());
        }
        });
        $(".stat-popup").hide(); $(".transparentBG").hide();
        if (!(valideateLeftPanel())) {
            return;
            }
            if (IsCustomDownload) {
                //if ($(".report-maindiv").html().trim() == "") { downloadCustom(); } else { $(".downloadbtn").click(); }
                downloadCustom();
            } else {
                $(".table-stat.statTest").removeClass("activestat");
                $(".table-stat.statTest[data-val='cb']").addClass("activestat");
                downloadAllSlides();
    }
    }

        //To Download Selected Tiles 
    $(document).on("click", ".downloadbtn", function () { 
        if (isSampleSizeValidated == 0) { $(".custom_download").click(); return; }
                $(".master-lft-ctrl").parent().css("background", "none")
                $(".lft-ctrl3").hide();
                $(".lft-popup-col").hide();
                if ($("#selectallchkbx").prop("checked")) {
                    //$scope.DownloadAll(); 
                    downloadAllSlides();
                return;
        }
        var selectedTiles = []; var selectedListTiles = ""; selectedTilesArray =[];
        if ($(".activechkboximg").length == 0) {
            setPreviousStatTest();
            //To clear other popups
            $(".transparentBG,.loader").show();
            showMaxAlert("Please Select Tiles");
            $(".transparentBG,.loader").hide();
            return false;
        }

        selectedTiles = $('.report-maindiv').find(".actselectedTile");
            selectedTilesArray.push(1);
            $.each(selectedTiles, function (ITile, ValTile) {
                if(parseInt($(ValTile).attr("id")) != 0 && parseInt($(ValTile).attr("for"))) {
                selectedListTiles += $(ValTile).attr("id") + "|";
                if (selectedTilesArray.indexOf(parseInt($(ValTile).attr("id"))) == -1)
                    selectedTilesArray.push(parseInt($(ValTile).attr("id")));
                if (selectedTilesArray.indexOf(parseInt($(ValTile).attr("for"))) == -1)
                    selectedTilesArray.push(parseInt($(ValTile).attr("for")));
        }
        });

        selectedTilesArray = selectedTilesArray.sort();

            IsCustomDownload = true;
            if (prepareReportFilter() == false)
                return;
            $(".loader,.transparentBG").show();
            var reportname = "";
            var dineorSummaryMethod = "";
            if (controllername == "reportp2preport") {
                reportname = "DineSummaryReport";
                dineorSummaryMethod = "DownloadDineReport";
            }
            else {
                reportname = "DineSummaryReport";
                dineorSummaryMethod = "DownloadSummaryReport";
        }
            // Selected Demo Filters
            var selectedDemofilters = "", selectedDemofiltersList =[];
            var selectedDemofilters = $(".Advanced_Filters_topdiv_element[data-val='Advanced Filters'] div").find(".sel_text");
            $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
                selectedDemofiltersList += $(seltDemFiltrV).text().trim() + ",";
        });
        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length -1);
        //
        var filterPanelInfoData = {
                filter: JSON.parse($("#master-btn").attr('data-val'))
        };
        var filterPanelInfo = {
                filter: filterPanelInfoData.filter, module: modulename, selectedDemofiltersList: selectedDemofiltersList, selectedEstablsmntColorLsit: selectedEstablsmntColorLsit, selectedColorStr: selectedColorStr
        };
        $.ajax({
                url : appRouteUrl + "report/" + reportname + "/" +controllername,
                data: JSON.stringify(filterPanelInfo),
            method: "POST",
                contentType: "application/json",
                success: function (response) {
                    pp_py_lock = 0;
                window.location.href = appRouteUrl + "Report/" + dineorSummaryMethod + "?path=" +response;
                $(".loader").hide();
                $(".transparentBG").hide();
        },
            error: ajaxError
    });
    });
    //
    $(document).on("click", ".report_first_level_ele", function () {
        if ($(".lft-popup-col2").css("display") == "none") {
            $(".lft-popup-col2").show();
            $(".lft-ctrl3-content").width("586px");
        }
        if ($(this).hasClass("benchmark")) {
            report_current_selection_est = "benchmark";
        } else {
            report_current_selection_est = "comparision";
        }
        $(".benchmark_img, .comparision_img").removeClass("bg_active");
        $(".center_fix").css("color", "black");
        $(this).find(".lft-popup-ele-label-img").addClass("bg_active");
        $(this).find(".center_fix").css("color", "white");
        //$(".report_first_level_ele").removeClass("active");
        //$(this).addClass("active");
    });
    var setPreviousStatTest = function () {
        //Set the previous selected stat test
        $(".statTest").each(function (i, d) {
            if ($(d).text() == previsSelectedStatTest) {
                $(".statTest").removeClass("activestat");
                $(d).addClass("activestat");
    }
    });
    }
    var valideateLeftPanel = function () { 
        if ($(".Establishment_topdiv_element .sel_text").length == 0) { showMaxAlert("Establishment is required !"); return false;
}
        if ($(".Time_Period_topdiv_element").length == 0) {
            showMaxAlert("Timeperiod is required !"); return false;
        }
        if (modulename == "Summary") { if ($(".FREQUENCY_topdiv_element .sel_text").length == 0) { showMaxAlert("Frequency is required !"); return false;
        } }
    return true;
    }

    function removeNullDataFromFilterPanelInfo(filterPanelInfo) {
        var selfilter =[];
        for (i = 0; i < filterPanelInfo.length; i++) {
            var data = filterPanelInfo[i];
            //data.Name != "Time Period" &&
            if (data.Name != null && data.Data != null && data.Data != undefined && data.SelectedID != undefined) {
                if (i > 0 && data.Name != filterPanelInfo[i -1].Name && data.SelectedID != filterPanelInfo[i -1].SelectedID) {
                    if (filterPanelInfo[i].Name == "Measures") {
                        if (filterPanelInfo[i].MetricType == undefined || filterPanelInfo[i].MetricType == null || filterPanelInfo[i].MetricType == "")
                            filterPanelInfo[i].MetricType = $scope.MetricType;
                }
                    selfilter.push(angular.copy(filterPanelInfo[i]));
            }
    }
        }
        return selfilter;
    }

    var prepareReportFilter = function () {
        //If benchmark and comparision is not set then set it here
        report_comparisionsSelected =[];

        if (report_benchMarkSelected == "")
            report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        else {
            if ($(".stat-content-estmntdiv").find(".stat-cust-active").text() == "")
                report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        else
                report_benchMarkSelected = $(".stattest-est-timeprd").find(".stat-cust-active").text();
    }
        //report_benchMarkSelected = $(".stattest-est-timeprd").find(".stat-cust-active").text();

        var tempEstList = $(".Establishment_topdiv_element .sel_text");
        $.each(tempEstList, function (i, d) {
            if ($(d).text() != report_benchMarkSelected) {
                report_comparisionsSelected.push($(d).text());
    }
    });
        //
        //To Validate User Session
        if (checkValidationSessionObj() == false) {
            return false;
    }
        //
        var fil = [], isvalid = true;
        $(".lft-ctrl3-header span").click();
        $(".master-lft-ctrl").each(function () {
            var txt = $(this).find(".lft-ctrl-txt").attr('data-ids');
            if($(this).find(".lft-ctrl3").attr('data-required') == "true") {
                if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                    //alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
                    showMaxAlert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
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
                        IDs += "|" +JSON.parse(d).ID;
        });

                if($(this).find(".lft-ctrl-label span").text() == "Time Period") {
                    var activeId = $(".lft-popup-tp-active").text();
                    var tempTp_data = ($(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text().trim()).split(" to ");
                    var tp_data =[];
                    tempTp_data.forEach(function (d, i) {
                        tp_data.push({
                        Text: d
                    });
                });
                    if ($(".trend.active").length != 0) { tp_data = trendTpList;
                }
                    if (activeId.toLocaleLowerCase() == "total") {
                        tp_data = data;
                }
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: tp_data, SelectedID: activeId
                });
                }
                else
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: IDs, MetricType: $(this).find(".lft-popup-ele_active").parent().attr("first-level-selection")
        });
        }
            else if (txt != '' && txt != null)
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null
            });
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null
        });
    });
        ///Remove empty entries from fil
        var tempFil =[];
        fil.forEach(function (d) {
            if (d.Name != "" && d.Name != null && d.Name != undefined) {
                tempFil.push(d);
    }
    });
        ///////////////////////////////////////////////////////////////////////////////////////
        var rep_serial = 0; if (modulename == "Summary") {
rep_serial = 1; }
        var tp = tempFil[0]; var frequencyFltr = tempFil[2];
        var est = { SelectedID: "", Name: "Establishment", Data: []
    }; //fil[2];
    est.Data.push({ Text: report_benchMarkSelected, ID: getDataIDforEst(report_benchMarkSelected)
    });
    report_comparisionsSelected.forEach(function (d, i) {
        est.Data.push({ Text: d, ID: getDataIDforEst(d)
    });
        });
        est.Data.forEach(function (d, i) {
            if (i != 0) {
                est.SelectedID = est.SelectedID.concat("|" +d.ID);
        } else {
                est.SelectedID = est.SelectedID.concat(d.ID);
    }
        });
        tempFil[2 + rep_serial].MetricType = "Advanced Filters";
        var demoflter = tempFil[2 +rep_serial];
        fil =[];
        //Time period type
        fil.push({ Data: null, MetricType: null, Name: "Timeperiod Type", SelectedID: "", SelectedText: $(".lft-popup-tp-active").text().trim()
    });
        //Time period
        fil.push(tp);
        //Establishments
        fil.push(est);
        //Demographic Filters
        fil.push(demoflter);
        //Name of All slides
        var allSlideNames =[];
        if (selectedTilesArray.length == 0 || $("#selectallchkbx").prop("checked") || IsCustomDownload == false) {
            selectedTilesArray =[];
            if (modulename == "Summary") {
                allSlideNames =[{ ID: "1", Text: "1" }, { ID: "2", Text: "2" }, { ID: "3", Text: "3" }, { ID: "4", Text: "4" }, { ID: "5", Text: "5" }, { ID: "6", Text: "6" }, { ID: "7", Text: "7" }, { ID: "8", Text: "8" }, { ID: "9", Text: "9"
                },
                    { ID: "10", Text: "10" }, { ID: "11", Text: "11" }, { ID: "12", Text: "12" }, { ID: "13", Text: "13" }, { ID: "14", Text: "14" }, { ID: "15", Text: "15" }, { ID: "16", Text: "16"
                },
                    { ID: "17", Text: "17" }, { ID: "18", Text: "18" }, { ID: "19", Text: "19" }, { ID: "20", Text: "20" }, { ID: "21", Text: "21" }, { ID: "22", Text: "22"
                },
                    { ID: "23", Text: "23" }, { ID: "24", Text: "24" }, { ID: "25", Text: "25" }, { ID: "26", Text: "26" }, { ID: "27", Text: "27" }, { ID: "28", Text: "28" }, { ID: "29", Text: "29"
                },
                    { ID: "30", Text: "30" }, { ID: "31", Text: "31" }, { ID: "32", Text: "32" }, { ID: "33", Text: "33" }, { ID: "34", Text: "34" }, { ID: "35", Text: "35" }, { ID: "36", Text: "36"
                },
                    { ID: "37", Text: "37" }, { ID: "38", Text: "38" }, { ID: "39", Text: "39" }, { ID: "40", Text: "40" }, { ID: "41", Text: "41" }, { ID: "42", Text: "42"
            }];
            } else {
                allSlideNames =[{ ID: "1", Text: "1" }, { ID: "2", Text: "2" }, { ID: "3", Text: "3" }, { ID: "4", Text: "4" }, { ID: "5", Text: "5" }, { ID: "6", Text: "6" }, { ID: "7", Text: "7" }, { ID: "8", Text: "8" }, { ID: "9", Text: "9"
                },
                    { ID: "10", Text: "10" }, { ID: "11", Text: "11" }, { ID: "12", Text: "12" }, { ID: "13", Text: "13" }, { ID: "14", Text: "14" }, { ID: "15", Text: "15" }, { ID: "16", Text: "16"
                },
                    { ID: "17", Text: "17" }, { ID: "18", Text: "18" }, { ID: "19", Text: "19" }, { ID: "20", Text: "20" }, { ID: "21", Text: "21" }, { ID: "22", Text: "22"
                },
                    { ID: "23", Text: "23" }, { ID: "24", Text: "24" }, { ID: "25", Text: "25" }, { ID: "26", Text: "26" }, { ID: "27", Text: "27" }, { ID: "28", Text: "28" }, { ID: "29", Text: "29"
                },
                    { ID: "30", Text: "30" }, { ID: "31", Text: "31" }, { ID: "32", Text: "32" }, { ID: "33", Text: "33" }, { ID: "34", Text: "34" }, { ID: "35", Text: "35" }, { ID: "36", Text: "36"
                },
                    { ID: "37", Text: "37" }, { ID: "38", Text: "38" }, { ID: "39", Text: "39" }, { ID: "40", Text: "40" }, { ID: "41", Text: "41" }, { ID: "42", Text: "42"
                },
                    { ID: "43", Text: "43" }, { ID: "44", Text: "44" }, { ID: "45", Text: "45" }, { ID: "46", Text: "46" }, { ID: "47", Text: "47" }, { ID: "48", Text: "48" }, { ID: "49", Text: "49"
                },
                    { ID: "50", Text: "50" }, { ID: "51", Text: "51" }, { ID: "52", Text: "52" }, { ID: "53", Text: "53" }, { ID: "54", Text: "54" }, { ID: "55", Text: "55"
                },
                    { ID: "56", Text: "56" }, { ID: "57", Text: "57" }, { ID: "58", Text: "58" }, { ID: "59", Text: "59" }, { ID: "60", Text: "60" }, { ID: "61", Text: "61" }
            ];
        }
        }
        else {
            selectedTilesArray = selectedTilesArray.sort();
            $.each(selectedTilesArray, function (Isel, Vsel) {
                allSlideNames.push({ ID: Vsel, Text: Vsel
            });
        });
        }
        fil.push({ Data: allSlideNames, MetricType: null, Name: "Slide Names", SelectedID: "", SelectedText: ""
        });
        if (modulename == "Summary") {
            //Frequency
            fil.push({ Data: frequencyFltr.Data, MetricType: null, Name: "Frequency", SelectedID: frequencyFltr.SelectedID, SelectedText: ""
        });
    }
        //StatTest
        fil.push({ Data: null, MetricType: null, Name: "StatTest", SelectedID: "", SelectedText: ($(".stat-content-timprddiv").find(".stat-cust-active").text().toLocaleLowerCase() == "previous year" || $(".stat-content-timprddiv").find(".stat-cust-active").text().toLocaleLowerCase() == "previous period" ? $(".stat-content-timprddiv").find(".stat-cust-active").text(): $(".stat-content-estmntdiv").find(".stat-cust-active").text())
    });
        //Benchmark
        fil.push({ Data: [{ ID: report_benchMarkSelected, Text: report_benchMarkSelected }], MetricType: null, Name: "Benchmark", SelectedID: "", SelectedText: ""
    });
        //Comparisions
        var allCompareData =[];
        for (var ind_Cmp = 0; ind_Cmp < report_comparisionsSelected.length; ind_Cmp++) {
            allCompareData.push({ ID: report_comparisionsSelected[ind_Cmp], Text: report_comparisionsSelected[ind_Cmp]
        });
        }
        fil.push({ Data: allCompareData, MetricType: null, Name: "Comparisions", SelectedID: "", SelectedText: ""
        });
        fil.push({ Data: null, MetricType: null, Name: "IsCustomDownload", SelectedID: "", SelectedText: IsCustomDownload
        })
        $("#master-btn").attr('data-val', JSON.stringify(fil));
        return isvalid;
    }



        //To Select or deselect Tile function 
        $(document).on("click", ".chkboximg", function () {

            if ($(this).parent().hasClass("actselectedTile")) {
                if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).parent().removeClass("actselectedTile");
                $('#13').parent().removeClass("actselectedTile");
            }
            else
                $(this).parent().removeClass("actselectedTile");
        }
        else
            if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).parent().addClass("actselectedTile");
                $('#13').parent().addClass("actselectedTile");
        }
        else
                $(this).parent().addClass("actselectedTile");

        if ($(this).hasClass("activechkboximg")) {
            if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).removeClass("activechkboximg");
                $("#13").find(".chkboximg").removeClass("activechkboximg");
        }
        else
                $(this).removeClass("activechkboximg");
                }
                else
                    if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).addClass("activechkboximg");
                $("#13").find(".chkboximg").addClass("activechkboximg");
                }
                else
                $(this).addClass("activechkboximg");

        if ($(this).parent().parent().hasClass("actslctedBrdrColor")) {
            if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).parent().parent().removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                $('#13').parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $('#13').parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
        }
        else {
                $(this).parent().parent().removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                }
                }
                else {
                    if ($(this).parent().attr("id") == "12" && controllername == "reportdinerreport") {
                $(this).parent().parent().addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                $('#13').parent().parent().addClass("actslctedBrdrColor");
                $('#13').parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor")
                $('#13').parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");

                }
                else {

                $(this).parent().parent().addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
        }
        }

            //to select header section
            var id = $(this).parent().attr("for");
            $("#" +id).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
            $("#" +id).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
            $("#" +id).addClass("actselectedTile");
            $("#" +id).parent().addClass("actslctedBrdrColor");
            // 

            //Only for 
            if (controllername == "reportdinerreport") {
                if ($(this).parent().attr("id") == "12" && $("#12").find(".chkboximg").hasClass('activechkboximg')) {
                $("#13").parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                $("#13").parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $("#13").addClass("actselectedTile");
                $("#13").parent().addClass("actslctedBrdrColor");
            }
            else {
                $("#13").parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                $("#13").parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $("#13").removeClass("actselectedTile");
                $("#13").parent().removeClass("actslctedBrdrColor");
        }
        }

            //to deselect section header if none of the sub section is selected

            var list = $(".actselectedTile");
            var distParentList = $(".report-tilebttm");
            var listparentListdistn =[];
            $.each(distParentList, function (dI, dV) {
                if (listparentListdistn.indexOf($(dV).attr("for")) == -1) {
                listparentListdistn.push($(dV).attr("for"));
                $("#" +$(dV).attr("for")).parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                $("#" +$(dV).attr("for")).parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $("#" +$(dV).attr("for")).removeClass("actselectedTile");
                $("#" +$(dV).attr("for")).parent().removeClass("actslctedBrdrColor");
        }
        });
        $.each(list, function (i, v) {
            var parentId = $($(v)[0]).attr("for");
            if ($("#" +parentId).parent().hasClass("actslctedBrdrColor")) {
            }
            else {
                $("#" +parentId).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                $("#" +parentId).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $("#" +parentId).addClass("actselectedTile");
                $("#" +parentId).parent().addClass("actslctedBrdrColor");
        }
        });
            //

            if ($(".chkboximg").length == $(".activechkboximg").length)
                $("#selectallchkbx").prop("checked", true);
            else
                $("#selectallchkbx").prop("checked", false);

    });
    //


    $(document).on("click", ".submt.downloadall #master-btn", function () {
        $(".master-lft-ctrl").parent().css("background", "none")
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        IsCustomDownload = false;
        reset_img_pos();
        if (checkValidationSessionObj == false) return;
        //Check sample Size
        checkSampleSize();
        //to show default view
        $(".report-maindiv").hide();
        $(".selctall-view-downlddiv").hide();
        if (modulename == "Summary") {
            $("#p2pstatictext").hide();
            $("#p2pstatictext_diner").show();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
        }
        else {
            $("#p2pstatictext").show();
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);

    }
        //
        isReportInitialLoad = false;
    });
        //Custom Download Click Function
        $(document).on("click", ".custom_download", function () {
            $(".master-lft-ctrl").parent().css("background", "none")
            $(".lft-ctrl3").hide();
            $(".lft-popup-col").hide();
            $("#selectallchkbx").prop("checked", false);
            IsCustomDownload = true;
            reset_img_pos();

            if (checkValidationSessionObj == false) return;
            checkSampleSize();
            //to show default view
            if (modulename == "Summary") {
                $("#p2pstatictext").hide();
                $(".report-maindiv").show();
                $("#p2pstatictext_diner").hide();
            }
            else {
                $("#p2pstatictext").hide();
                $(".report-maindiv").html('');
                $(".report-maindiv").show();
                $(".selctall-view-downlddiv").hide();
        }
        //
    });

    var downloadCustom = function () {
        $(".master-lft-ctrl").parent().css("background", "none")
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $("#selectallchkbx").prop("checked", false);
        IsCustomDownload = true;
        reset_img_pos();
        if (checkValidationSessionObj == false) return;
        if (!(valideateLeftPanel())) {
return; }
        $(".loader,.transparentBG").show();
        if ($(".report-maindiv").find(".report-tilediv").length == 0) {
            isReportInitialLoad = false;
        }
        if (isReportInitialLoad) {
            //if ($(".activechkboximg").length == 0) {
            //    setPreviousStatTest();
            //    //To clear other popups
            //    $(".transparentBG").hide();
            //    alert("Please Select Tiles");
            //    return false;
            //}
            $(".downloadbtn").click();
        }
        else {
            var requrl = "";
            if (controllername == "reportp2preport")
                requrl = appRouteUrl + "report/DineReports/" +controllername;
            else
                requrl = appRouteUrl + "report/DinerReports/" +controllername;

            $.ajax({
                type: 'GET',
                url: requrl,
                    contentType: "application/json",
                    success: function (data) {
                    $("#p2pstatictext").hide();
                    $("#p2pstatictext_diner").hide();
                    $(".report-maindiv").show();
                        BindTileList(data);
                        isReportInitialLoad = true;
                    $(".loader,.transparentBG").hide();

            },
                    error: function () {
                    $(".loader").hide();
                    $(".transparentBG").hide();
                        ajaxError
            }
        });
        }

        previousCustombaseSeltns = $(".stat-popup").find(".stat-cust-active").attr("data-id");
    };
        //

        //Close Button
    $(document).on("click", ".view-clsbtn", function () {
            $(".view-report-ppup").hide();
            $(".transparentBGExportExcel").hide();
    });
    $(document).on("click", ".closeSavePopup", function () {
        if (controllername != 'situationassessmentreport') {
            if (controllername == "reportp2preport")
                $("#p2pstatictext").show();
            else
                $("#p2pstatictext_diner").show();
            $(".report-maindiv").hide();
            $(".null-error-popup").hide();
        }
        else {
            hidePopupInSitnReport();//only for the situationassement report
        }
    });
        //

        //getDataIDforEst
    var getDataIDforEst = function (estText) {
            var dataID = 0;
            $(".filter-info-panel .Establishment_topdiv_element .sel_text").each(function (i, d) {
                if ($(d).text().trim().toLocaleLowerCase() == estText.trim().toLocaleLowerCase()) {
                dataID = $(d).parent().attr("data-id");
                    return false;
        }
        });
            return dataID;
    }

    var checkSampleSize = function () { 
        if (!prepareSampleSizeFilter()) {
return;
    }
            if (isSampleSizeValidated == 0) {
                $(".loader,.transparentBG").show();
                var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val'))
    };
    var filterPanelInfo = { filter: filterPanelInfoData.filter, module: modulename
    };
    $.ajax({
            url : appRouteUrl + "report/sampleSizeValidator",
            data: JSON.stringify(filterPanelInfo),
        method: "POST",
            contentType: "application/json",
                    success: function (response) {
                    $(".stat-popup").hide(); $(".transparentBG").hide();
                    $(".loader").hide();
                        //To do
                    if (response.length == 0) {
                        isSampleSizeValidated = 1;
                        $(".diner-statlayer .table-stat").last().click();//Opening Custom base
                    } else {
                        $(".list-of-nulls").html("");
                        response.forEach(function (d, i) {
                            if (d.IsUseDirectional == "LSS")
                                $(".list-of-nulls").append("<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div class='stat-cust-estabmt popup1'>" + d.EstName + "</div></div>");
                    });

                        //Use Directional Popup Added by Bramhanath(25-10-2017)
                        $(".list-of-nulls-userdirctnl").html("");
                        response.forEach(function (d, i) {
                            if (d.IsUseDirectional == "Directional")
                                $(".list-of-nulls-userdirctnl").append("<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div class='stat-cust-estabmt popup1'>" + d.EstName + "</div></div>");
                    });
                        //

                        if ($(".list-of-nulls").find(".stat-custdiv").length > 0 && $(".list-of-nulls-userdirctnl").find(".stat-custdiv").length == 0) {
                            if ($(".list-of-nulls").find(".stat-custdiv").length < $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").length) {
                                $(".save-proceed-btn").css("visibility", "visible");
                                $(".save-proceed-btn").css("margin-left", "25px");
                            }
                            else {
                                $(".save-proceed-btn").css("visibility", "hidden");
                                $(".save-proceed-btn").css("margin-left", "-25px");
                        }
                        } else {
                            $(".save-proceed-btn").css("visibility", "visible");
                            $(".save-proceed-btn").css("margin-left", "25px");
                    }


                        if ($(".list-of-nulls").find(".stat-custdiv").length > 0) {
                            $(".null-error-popup").show();
                            $(".null-error-popup-userdirctnl").hide();
                        }
                        else if ($(".list-of-nulls-userdirctnl").find(".stat-custdiv").length > 0) {
                            $(".null-error-popup").hide();
                            $(".save-proceed-btn").css("visibility", "visible");
                            $(".save-proceed-btn").css("margin-left", "25px");
                            $(".null-error-popup-userdirctnl").show();
                    }

                        //


                }
    },
                    error: function () {
                    $(".loader").hide();
                    $(".transparentBG").hide();
                        ajaxError
    }
    });
    } else {
        $(".diner-statlayer .table-stat").last().click();//Opening Custom base
    }
    }

    var prepareSampleSizeFilter = function () {
        //To Validate User Session
        if (checkValidationSessionObj() == false) {
            return false;
    }
        //
        var fil = [], isvalid = true;
        $(".lft-ctrl3-header span").click();
        $(".master-lft-ctrl").each(function () {
            var txt = $(this).find(".lft-ctrl-txt").attr('data-ids');
            if($(this).find(".lft-ctrl3").attr('data-required') == "true") {
                if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                    //alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
                    showMaxAlert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
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
                        IDs += "|" +JSON.parse(d).ID;
        });

                if($(this).find(".lft-ctrl-label span").text() == "Time Period") {
                    var activeId = $(".lft-popup-tp-active").text();
                    var tempTp_data = ($(".Time_Period_topdiv_element .lft-ctrl-txt-lbl span").text().trim()).split(" to ");
                    var tp_data =[];
                    tempTp_data.forEach(function (d, i) {
                        tp_data.push({
                        Text: d
                    });
                });
                    if ($(".trend.active").length != 0) { tp_data = trendTpList;
                }
                    if (activeId.toLocaleLowerCase() == "total") {
                        tp_data = data;
                }
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: tp_data, SelectedID: activeId
                });
                }
                else
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: IDs, MetricType: $(this).find(".lft-popup-ele_active").parent().attr("first-level-selection")
        });
        }
            else if (txt != '' && txt != null)
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null
            });
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null
        });
    });
        /////
        //Remove null entries from fil
        var tempFil =[];
        fil.forEach(function (d) {
            if (d.Name != "" && d.Name != undefined && d.Name != null) {
                tempFil.push(d);
        }
    });
        ///////////////////////////////////////////////////////////////////////////////////////
        var rep_serial = 0; if (modulename == "Summary") {
rep_serial = 1; }
        var tp = tempFil[0]; var frequencyFltr = tempFil[2];
        var est = tempFil[1];
        tempFil[2 + rep_serial].MetricType = "Advanced Filters";
        var demoflter = tempFil[2 +rep_serial];
        fil =[];
        //Time period type
        fil.push({ Data: null, MetricType: null, Name: "Timeperiod Type", SelectedID: "", SelectedText: $(".lft-popup-tp-active").text().trim()
    });
        //Time period
        fil.push(tp);
        //Establishments
        fil.push(est);
        //Demographic Filters
        fil.push(demoflter);
        if (modulename == "Summary") {
            //Frequency
            fil.push({ Data: frequencyFltr.Data, MetricType: null, Name: "Frequency", SelectedID: frequencyFltr.SelectedID, SelectedText: ""
        });
        }
        $("#master-btn").attr('data-val', JSON.stringify(fil));
        return isvalid;
    }

    $(document).on("click", ".proceedClick", function () {
        if (controllername != 'situationassessmentreport') {
            $(".save-reportPopup .stat-cust-estabmt").each(function (i, d) {
                $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").each(function (j, dt) {
                    if ($(d).text().toLocaleLowerCase() == $(dt).text().toLocaleLowerCase()) {
                        $(dt).parent().find(".filter-info-panel-txt-del").click();
                        return false;
                    }
                });
            });
            $(".null-error-popup").hide(); $(".transparentBG").show();
            if ($(".list-of-nulls-userdirctnl").find(".stat-custdiv").length > 0)
                $(".null-error-popup-userdirctnl").show();
            else
                $(".diner-statlayer .table-stat").last().click();
        }
        else {
            $(".null-error-popup-sitn").hide(); $(".loader").hide(); $(".transparentBG").show(); $(".proceed-text").html('');
            bindSituationReport(situationMetricList);
        }
        //Update the benchmark
        //$(".diner-statlayer .table-stat").last().click();
    });

        //use direction Popup 
    $(document).on("click", ".proceedClickUsedirectn", function () {
            isSampleSizeValidated = 1;
            $(".null-error-popup-userdirctnl").hide(); $(".loader").hide(); $(".transparentBG").show();
            $(".diner-statlayer .table-stat").last().click();
        
    });

    //

    $(document).on('click', ".table-stat.statTest", function () {
        previsSelectedStatTest = $(".statTest.activestat").text();
        var stat_text = $(this).attr("data-val");
        if (valideateLeftPanel() == false)
            return;
        if (isSampleSizeValidated == 1 || stat_text != 'cb') {
            switch (stat_text) {
                case 'pp': $(".stat-popup-pp").hide(); if (pp_py_lock == 1) { showMaxAlert("Not clickable"); return;
                }
                    $(".diner-statlayer .statTest").removeClass("activestat");
                    $(".diner-statlayer .statTest[data-val='pp']").addClass("activestat");
                    $(".stat-popup-pp").show(); $(".transparentBG").show(); break;
                case 'py': $(".stat-popup-py").hide(); if (pp_py_lock == 1) { showMaxAlert("Not clickable"); return;
                }
                    $(".diner-statlayer .statTest").removeClass("activestat");
                    $(".diner-statlayer .statTest[data-val='py']").addClass("activestat");
                    $(".stat-popup-py").show(); $(".transparentBG").show(); break;
                case 'cb':
                    //set the benchmark here
                    report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
                    $(".stat-content").html('');
                    $(".stat-content").append("<div class='stat-content-estmntdiv'></div><div class='stat-content-timprddiv'></div>");
                    var custmHtml = "";
                    var selectedEstbmtlist = $(".Establishment_topdiv_element > div");
                    var timeperiodlist =[];
                    var addtimerperiod =[];
                    addtimerperiod.push({ id: "table-prevsperiod", name: "PREVIOUS YEAR"
                });
                    timeperiodlist.push(addtimerperiod);
                    addtimerperiod =[];
                    addtimerperiod.push({ id: "table-prevsyear", name: "PREVIOUS PERIOD"
                });
                    timeperiodlist.push(addtimerperiod);
                    $(".stat-content-estmntdiv").html('');
                    $.each(selectedEstbmtlist, function (i, v) {
                        custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot" style="width:25px;"></div><div class="stat-cust-estabmt popup1" style="width:85%;" data-id="' +$(v).attr("data-id") + '">' +$(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                        //$(".stat-popup .stat-content").append(custmHtml);
                        //if (isDefaultSelected != 0 && selectedCB == $(v).find(".sel_text").text()) {
                        //    $(".stat-cust-estabmt:eq(" + i + ")").click();
                        //}
                });
                    //angular.element($(".stat-content-estmntdiv")[0].parentElement).find(".stat-content-estmntdiv")[0].innerHTML = custmHtml;
                    SetScroll($(".stat-content-estmntdiv"), "#ffffff", 0, 0, 5, 0, 8);
                    $(".stat-content-estmntdiv").append(custmHtml);
                    //Previous Period for Custom base Commented as per instructions by Bramhanath
                    custmHtml = "";
                    $(".stat-content-timprddiv").html('');
                    $.each(timeperiodlist, function (i, v) {
                        custmHtml += '<div class="stat-custdiv"> <div class="stat-cust-dot" style="width:25px;"></div><div class="stat-cust-estabmt stat-timprd popup1" style="width:85%;" data-id="' + v[0].id + '">' +v[0].name + '</div></div>';
                });
                    angular.element($(".stat-content-timprddiv")[0].parentElement).find(".stat-content-timprddiv")[0].innerHTML = custmHtml;
                    //Previous Period for Custom base Commented as per instructions by Bramhanath
                    //$(".stat-content-timprddiv").append(custmHtml);
                    //if (isDefaultSelected == 0) {
                    if (previousCustombaseSeltns == "") {
                        $(".stat-cust-estabmt:eq(0)").click();
                        //Store the default cb text
                        selectedCB = $(".stat-cust-estabmt:eq(0)").text();
                    }
                    else {
                        $(".stattest-est-timeprd").find(".popup1").removeClass("stat-cust-active");

                        $(".popup1[data-id='" +previousCustombaseSeltns + "']").addClass("stat-cust-active");
                        selectedCB = $(".popup1[data-id='" +previousCustombaseSeltns + "']").text();//selectedCB = $(".stat-cust-estabmt:eq(0)").text();

                }
                    //    isDefaultSelected = 1;
                    //}
                    $(".transparentBG").show(); $(".stat-popup").show();
                    $(".table-stat.statTest").removeClass("activestat");
                    $(".table-stat.statTest[data-val='" +stat_text + "']").addClass("activestat");
                    break;
            }
            } else {
                if (IsCustomDownload == false) {
                $(".submt.downloadall #master-btn").click();
                } else {
                $(".custom_download").click();
}
    }
    });
    $(document).on("click", ".stat-clsebtn", function () {
        //if ($(this).parent().parent().hasClass("stat-popup")) { pp_py_lock = 0; setPreviousStatTest(); }
        pp_py_lock = 0; setPreviousStatTest();
        //if (report_benchMarkSelected == "")
        //    report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        if (report_benchMarkSelected == "")
            report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        else {
            if ($(".stat-content-estmntdiv").find(".stat-cust-active").text() == "")
                report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        else
                report_benchMarkSelected = $(".stattest-est-timeprd").find(".stat-cust-active").text();
        }
        $(".stat-popup").hide();
        $(".stat-popup-pp").hide();
        $(".stat-popup-py").hide();
        $(".custom-color-palte").hide();
        $(".transparentBG").hide();

    })

    //Situation Assessment Report ---  Start
    $scope.toggleclick = function () {
        //sabat
        //isFirstTimeExecuted = false;
        isToggleClicked = true;
        var parentText = getParentHeaderText($('.subMeasureName_active').attr('parent-id'));
        $('#updatepopuptext').html("Data will be updated for the entire " + parentText + " Section. “Any custom metric selection will also be reset.”");
        $(".null-error-popup-sitn-update").show();
        isFrequencyChangedForSitn = false;
        //checkSampleSizeForSituation();
    }
    $scope.applyFilterSitn = function () {
        var parentText = getParentHeaderText($('.subMeasureName_active').attr('parent-id'));
        var parentId = $('.subMeasureName_active').attr("parent-id");
        if (parentId == "1" || parentId == "2")
            $('#updatepopuptext').html("Data will be updated for the entire " + parentText + " Section. “Any custom metric selection will also be reset.”");
        else
            $('#updatepopuptext').html("Data will be updated for the entire " + parentText + " Section.");
        $(".null-error-popup-sitn-update").show();
    }

    $(document).on("click", ".proceedVisitClickSitn", function () {
        $(".null-error-popup-sitn-visitppup").hide();
        $(".loader").show(); $(".transparentBG").show();
        checkSampleSizeForSituation();
    });
    $(document).on("click", ".proceedClickSitn", function () {
        $(".null-error-popup-sitn").hide(); $(".loader").show(); $(".transparentBG").show(); $(".proceed-text").html('');
        $(".list-of-nulls-sitn .stat-cust-estabmt").each(function (i, v) {
            if ($($(v)[0]).attr("parent-text") == "BenchMark") {
                bindbenchMarkBindWhenDeleted($($(v)[0]));
                $(".master-lft-ctrl[data-val='Establishment'").find('.lft-ctrl-txt').html('');
                return false;
            }
            else if ($($(v)[0]).attr("parent-text") == "CustomBase") {
                bindCustomBaseListWhenDeleted($($(v)[0]));
                commonFunctionToRemoveEstmtOrCustomBsOrCompetitr($(v)[0], "CustomBase");
            }
            else if ($($(v)[0]).attr("parent-text") == "Competitors") {
                bindCompetitorsListWhenDeleted($($(v)[0]));
                commonFunctionToRemoveEstmtOrCustomBsOrCompetitr($(v)[0],"Competitors");
            }
        });
        if (valideateLeftPanelForSitn() == false) return;
        isFromLSSPppSAR = true;
       
        var promise = new Promise(function (resolve, reject) {
            callSampleSizeMethodPromise(resolve, reject);
        });
        promise.then(function () {
            if ($('.null-error-popup-userdirctnl-sitn').css("display") == "block")
                return;
            if (isFromQuickDownloadSitn) {
                showColorPallatePpup();
            }
            else {
                frequencyUpdateInStickyVaribales();
                if (selectedmeasureId == "")
                    bindSituationReport(situationMetricList);
                else
                    selectMeasure(selectedmeasureId);
            }
        });
    });


    $(document).on("click", ".proceedClickUsedirectnSitn", function () {
        var useDirectnPpupBindHtml = "";
        $(".list-of-nulls-vistsampless-sitn").html("");
        if (totalVisitsLSS.length > 0) {
            isTotalVisitsMainHdrAdded = false;
            totalVisitsLSS.forEach(function (i, v) {
                if (!isTotalVisitsMainHdrAdded) {
                    useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Competitors</div>";
                    isTotalVisitsMainHdrAdded = true;
                }
                useDirectnPpupBindHtml += "<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div data-id=" + i.EstablishmentId + " class='stat-cust-estabmt popup1'>" + i.EstName + "</div></div>";

            });
            $(".list-of-nulls-vistsampless-sitn").append(useDirectnPpupBindHtml);
        }
        if ($(".null-error-popup-vistsampless-sitn").find(".stat-custdiv").length > 0) {
            $(".null-error-popup-vistsampless-sitn").show();
            $(".save-proceed-btn-visitss").show();
            $(".save-proceed-btn-visitss").css("visibility", "visible");
            $(".save-proceed-btn-visitss").css("margin-left", "25px");
            $(".null-error-popup-userdirctnl-sitn").hide();
        }
        else {
            frequencyUpdateInStickyVaribales();
            $(".null-error-popup-userdirctnl-sitn").hide(); $(".loader").show(); $(".transparentBG").show(); $(".proceed-text").html('');
            $(".null-error-popup-vistsampless-sitn").hide();
            if (isFromQuickDownloadSitn) {
                showColorPallatePpup();
            }
            else {
                if (selectedmeasureId == "")
                    bindSituationReport(situationMetricList);
                else
                    selectMeasure(selectedmeasureId);//bindSituationReport(situationMetricList);
            }

        }

    });

    //visit sample size popup proceed click function
    $(document).on("click", ".proceedClickVistsamplessSitn", function () {
        frequencyUpdateInStickyVaribales();
        $(".null-error-popup-userdirctnl-sitn").hide(); $(".loader").show(); $(".transparentBG").show(); $(".proceed-text").html('');
        $(".null-error-popup-vistsampless-sitn").hide();
        if (isFromQuickDownloadSitn) {
            showColorPallatePpup();
        }
        else {
            if (selectedmeasureId == "")
                bindSituationReport(situationMetricList);
            else
                selectMeasure(selectedmeasureId);//bindSituationReport(situationMetricList);
        }
    });
    //

    $(document).on("click", ".proceedOkClickSitn", function () {
        var selectedParentId = $('.subMeasureName.subMeasureName_active').attr("parent-id");
        $(".null-error-popup-sitn-update").hide(); $(".loader").show(); $(".transparentBG").show();

        if (isToggleClicked) {
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle');
                isVisitsSelected = false;
            }
            else {
                $('#guest-visit-toggle').prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                $('#guest-visit-toggle').addClass('activeToggle');
                isVisitsSelected = true;
            }
        }
        else {
            if (selectedParentId == 1) {
                isFrequencyChangedFor_CoreGuest = true;
                stickySelectedFreqcyFor_CoreGuest = $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").text().trim();
                if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)")
                    isstickySelectionVisit = true;
                else
                    isstickySelectionVisit = false;
            }
            else if (selectedParentId == 2) {
                isFrequencyChangedFor_MyTrips = true;
                stickySelectedFreqcyFor_MyTrips = $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").text().trim();
            }
            else if (selectedParentId == 3) {
                isFrequencyChangedFor_LoyltyPyrmd = true;
                stickySelectedFreqcyFor_LoyltyPyrmd = $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").text().trim();
            }
            else if (selectedParentId == 4) {
                isFrequencyChangedFor_FairShareAnalysis = true;
                stickySelectedFreqcyFor_FairShareAnalysis = $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele_active").text().trim();
            }
        }
        checkSampleSizeForSituation();//getTableOutput(selectedmeasureId);
        isFrequencyChangedForSitn = false;
    });

    $(document).on("click", ".proceedDowload", function () {
        isFromShareGuestsTripsPopup = true;
        $scope.customcolrSubmit();
    });

    //Situation Assessment Report ---  End

}]);

$(document).ready(function () {
    //
    $(".master_link").removeClass("active");
    $(".master_link.reports").addClass("active");
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(1)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((22 * $(".master_link_a:eq(1)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
        $(".submodules-band").css("margin-left", "37.1%");
        $(".submodules-band").css("margin-top", "-0.44%");
    }
    $('.selctall-view-downlddiv').hide();
    $(".table-statlayer").hide();
    $(".table-statlayer-diner").show();
    $(".master-lft-ctrl[data-val='Advanced Filters'] .lft-popup-col1 .lft-popup-ele-label").attr("data-isselectable", "false");
    $(".master-lft-ctrl[data-val='Demographic Filters'] .lft-popup-col1 .lft-popup-ele-label").attr("data-isselectable", "false");
    //
});
/*Start color code related funcs*/
var CallvalidateColorCode = function () {
    validateColorCode("Establishment");
}
//var validateColorCode = function () {
//    $(".colorpalletwithTranslucentBG").hide();
//    //get current selected colorcode in Hex form
//    var tempCode = (rgbToHex($(".jscolor").css('background-color').replace(/rgb| |\(|\)/g, '').split(','))).toLocaleLowerCase();
//    //Return if hex code is same as previous
//    if (tempCode == $(".custom-estcolordiv.active").attr('colorcode') || tempCode.toLocaleUpperCase() == $(".custom-estcolordiv.active").attr('colorcode')) {
//        $(".custom-estcolordiv").removeClass('active');
//        return;
//    }
//    //Check if the color is one of the default colors
//    if (defaultchartColors.indexOf(tempCode) != -1 || defaultchartColors.indexOf(tempCode.toLocaleUpperCase()) != -1) {
//        showMaxAlert("You can not select among default colors.");
//        $(".custom-estcolordiv").removeClass('active');
//        return;
//    }
//    //Check if the same exist in Establishment or not
//    var est_with_color_Code = $('.master-lft-ctrl[data-val="Establishment"] .lft-popup-ele-label[colorcode="' + tempCode + '"]');
//    est_with_color_Code = (est_with_color_Code.length == 0 ? $('.master-lft-ctrl[data-val="Establishment"] .lft-popup-ele-label[colorcode="' + tempCode.toLocaleUpperCase() + '"]') : est_with_color_Code);
//    if (est_with_color_Code.length != 0) {
//        //Check if that establishments color is updated in popup or not
//        //Get id of est
//        var t_id_ele = $(".custom-estcolordiv[id='" + $(est_with_color_Code).attr('data-id') + "']");
//        t_id_ele = (t_id_ele.length == 0 ? $(".custom-estcolordiv[id='" + $(est_with_color_Code).attr('data-id') + "']") : t_id_ele);
//        if (t_id_ele.length == 0) {
//            showMaxAlert("Selected color is already assigned.");
//            $(".custom-estcolordiv").removeClass('active');
//            return;
//        } else {
//            //Compare tempCode with t_id_ele colorcode
//            if ($(t_id_ele).attr('colorcode') == tempCode || $(t_id_ele).attr('colorcode') == tempCode.toLocaleUpperCase()) {
//                showMaxAlert("Selected color is already assigned.");
//                $(".custom-estcolordiv").removeClass('active');
//                return;
//            }
//        }
//    }
//    //Check if it already selected in current list    
//    var isThere = false;
//    $(".custom-estcolordiv:not(.active)").each(function (i, d) {
//        if ($(d).attr('colorcode') == tempCode || $(d).attr('colorcode') == tempCode.toLocaleUpperCase()) {
//            isThere = true;
//            return false;
//        };
//    });
//    if (isThere) {
//        showMaxAlert("Selected color is already assigned.");
//        $(".custom-estcolordiv").removeClass('active');
//        return;
//    }
//    //Code for unassigned colorcode
//    //Change the active box color bg, also set color-id
//    $(".custom-estcolordiv.active").css('background-color', tempCode);
//    $(".custom-estcolordiv.active").attr('colorcode', tempCode);
//    $(".custom-estcolordiv").removeClass('active');
//}
/*End color code related funcs*/

