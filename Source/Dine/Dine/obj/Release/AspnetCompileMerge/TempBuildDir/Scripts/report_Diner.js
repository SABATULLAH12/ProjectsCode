/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />
var estHeader = "Select the benchmark and upto 4 comparisions"; var selectedTilesArray = [], isDefaultSelected = 0, selectedCB = "";
var selectedPrvewImgLst = []; var currentPrevImgId = "";var IsCustomDownload=false;
angular.module("mainApp").controller("reportController", ["$scope", "$q", "$http", function ($scope, $q) {
    $scope.buildMenu = function () {
        $.ajax({
            url: appRouteUrl + "Report/GetFilter/" + controllername, async: false, success: function (response) {
                $scope.filters = response;
                //added by Nagaraju for individual filters
                //Date: 07-08-2017    
                left_Menu_Data = response;               
                $scope.limit = 1;               
            }, error: ajaxError
        });
    }
    $scope.report = {
        buildOutput: function () {
        }
    }
    $scope.buildMenu();
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
        var filterPanelInfo = { filter: filterPanelInfoData.filter, module: modulename, selectedDemofiltersList: selectedDemofiltersList };
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
        object = object.trim();
        var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '');
        return text.toLowerCase();
    }
    $scope.custombaseSubmit = function () {
        if ($(".stat-cust-active").length == 0) { alert("Establishment required !"); return; }
        report_benchMarkSelected = $(".stat-cust-active").text();
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
        if (controllername == "reportp2preport")
            $("#p2pstatictext").show();
        else
            $("#p2pstatictext_diner").show();
        $(".report-maindiv").hide();
        $(".null-error-popup").hide();
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
        var selectedTiles = []; var selectedListTiles = ""; selectedTilesArray = [];
        if ($(".activechkboximg").length == 0) {
            setPreviousStatTest();
            //To clear other popups
            $(".transparentBG").hide();
            alert("Please Select Tiles");
            return false;
        }

        selectedTiles = $('.report-maindiv').find(".actselectedTile");
        selectedTilesArray.push(1);
        $.each(selectedTiles, function (ITile, ValTile) {
            if (parseInt($(ValTile).attr("id")) != 0 && parseInt($(ValTile).attr("for"))) {
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
        var selectedDemofilters = "", selectedDemofiltersList = [];
        var selectedDemofilters = $(".Advanced_Filters_topdiv_element[data-val='Advanced Filters'] div").find(".sel_text");
        $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().trim() + ",";
        });
        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
        //
        var filterPanelInfoData = {
            filter: JSON.parse($("#master-btn").attr('data-val'))
        };
        var filterPanelInfo = {
            filter: filterPanelInfoData.filter, module: modulename, selectedDemofiltersList: selectedDemofiltersList
        };
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
        if ($(".Establishment_topdiv_element .sel_text").length == 0) { alert("Establishment is required !"); return false; }
        if ($(".Time_Period_topdiv_element").length == 0) {
            alert("Timeperiod is required !"); return false;
        }
        if (modulename == "Summary") { if ($(".FREQUENCY_topdiv_element .sel_text").length == 0) { alert("Frequency is required !"); return false; } }
        return true;
    }

    function removeNullDataFromFilterPanelInfo(filterPanelInfo) {
        var selfilter = [];
        for (i = 0; i < filterPanelInfo.length; i++) {
            var data = filterPanelInfo[i];
            //data.Name != "Time Period" &&
            if (data.Name != null && data.Data != null && data.Data != undefined && data.SelectedID != undefined) {
                if (i > 0 && data.Name != filterPanelInfo[i - 1].Name && data.SelectedID != filterPanelInfo[i - 1].SelectedID) {
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
        report_comparisionsSelected = [];
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
            if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
                if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                    alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
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
                    if ($(".trend.active").length != 0) { tp_data = trendTpList; }
                    if (activeId.toLocaleLowerCase() == "total") {
                        tp_data = data;
                    }
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: tp_data, SelectedID: activeId });
                }
                else
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: IDs, MetricType: $(this).find(".lft-popup-ele_active").parent().attr("first-level-selection") });
            }
            else if (txt != '' && txt != null)
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null });
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null });
        });
        ///////////////////////////////////////////////////////////////////////////////////////
        var rep_serial = 0; if (modulename == "Summary") { rep_serial = 1;}
        var tp = fil[1]; var frequencyFltr = fil[3];
        var est = { SelectedID: "", Name: "Establishment", Data: [] }; //fil[2];
        est.Data.push({ Text: report_benchMarkSelected, ID: getDataIDforEst(report_benchMarkSelected) });
        report_comparisionsSelected.forEach(function (d, i) {
            est.Data.push({ Text: d, ID: getDataIDforEst(d) });
        });
        est.Data.forEach(function (d, i) {
            if (i != 0) {
                est.SelectedID = est.SelectedID.concat("|" + d.ID);
            } else {
                est.SelectedID = est.SelectedID.concat(d.ID);
            }
        });
        fil[3+rep_serial].MetricType = "Advanced Filters";
        var demoflter = fil[3+rep_serial];
        fil = [];
        //Time period type
        fil.push({ Data: null, MetricType: null, Name: "Timeperiod Type", SelectedID: "", SelectedText: $(".lft-popup-tp-active").text().trim() });
        //Time period
        fil.push(tp);
        //Establishments
        fil.push(est);
        //Demographic Filters
        fil.push(demoflter);
        //Name of All slides
        var allSlideNames = [];
        if (selectedTilesArray.length == 0 || $("#selectallchkbx").prop("checked") || IsCustomDownload == false) {
            selectedTilesArray = [];
            if (modulename == "Summary") {
                allSlideNames = [{ ID: "1", Text: "1" }, { ID: "2", Text: "2" }, { ID: "3", Text: "3" }, { ID: "4", Text: "4" }, { ID: "5", Text: "5" }, { ID: "6", Text: "6" }, { ID: "7", Text: "7" }, { ID: "8", Text: "8" }, { ID: "9", Text: "9" },
            { ID: "10", Text: "10" }, { ID: "11", Text: "11" }, { ID: "12", Text: "12" }, { ID: "13", Text: "13" }, { ID: "14", Text: "14" }, { ID: "15", Text: "15" }, { ID: "16", Text: "16" },
            { ID: "17", Text: "17" }, { ID: "18", Text: "18" }, { ID: "19", Text: "19" }, { ID: "20", Text: "20" }, { ID: "21", Text: "21" }, { ID: "22", Text: "22" },
            { ID: "23", Text: "23" }, { ID: "24", Text: "24" }, { ID: "25", Text: "25" }, { ID: "26", Text: "26" }, { ID: "27", Text: "27" }, { ID: "28", Text: "28" }, { ID: "29", Text: "29" },
            { ID: "30", Text: "30" }, { ID: "31", Text: "31" }, { ID: "32", Text: "32" }, { ID: "33", Text: "33" }, { ID: "34", Text: "34" }, { ID: "35", Text: "35" }, { ID: "36", Text: "36" },
            { ID: "37", Text: "37" }, { ID: "38", Text: "38" }, { ID: "39", Text: "39" }, { ID: "40", Text: "40" }, { ID: "41", Text: "41" }, { ID: "42", Text: "42" }];
            } else {
                allSlideNames = [{ ID: "1", Text: "1" }, { ID: "2", Text: "2" }, { ID: "3", Text: "3" }, { ID: "4", Text: "4" }, { ID: "5", Text: "5" }, { ID: "6", Text: "6" }, { ID: "7", Text: "7" }, { ID: "8", Text: "8" }, { ID: "9", Text: "9" },
            { ID: "10", Text: "10" }, { ID: "11", Text: "11" }, { ID: "12", Text: "12" }, { ID: "13", Text: "13" }, { ID: "14", Text: "14" }, { ID: "15", Text: "15" }, { ID: "16", Text: "16" },
            { ID: "17", Text: "17" }, { ID: "18", Text: "18" }, { ID: "19", Text: "19" }, { ID: "20", Text: "20" }, { ID: "21", Text: "21" }, { ID: "22", Text: "22" },
            { ID: "23", Text: "23" }, { ID: "24", Text: "24" }, { ID: "25", Text: "25" }, { ID: "26", Text: "26" }, { ID: "27", Text: "27" }, { ID: "28", Text: "28" }, { ID: "29", Text: "29" },
            { ID: "30", Text: "30" }, { ID: "31", Text: "31" }, { ID: "32", Text: "32" }, { ID: "33", Text: "33" }, { ID: "34", Text: "34" }, { ID: "35", Text: "35" }, { ID: "36", Text: "36" },
            { ID: "37", Text: "37" }, { ID: "38", Text: "38" }, { ID: "39", Text: "39" }, { ID: "40", Text: "40" }, { ID: "41", Text: "41" }, { ID: "42", Text: "42" },
            { ID: "43", Text: "43" }, { ID: "44", Text: "44" }, { ID: "45", Text: "45" }, { ID: "46", Text: "46" }, { ID: "47", Text: "47" }, { ID: "48", Text: "48" }, { ID: "49", Text: "49" },
            { ID: "50", Text: "50" }, { ID: "51", Text: "51" }, { ID: "52", Text: "52" }, { ID: "53", Text: "53" }, { ID: "54", Text: "54" }, { ID: "55", Text: "55" },
            { ID: "56", Text: "56" }, { ID: "57", Text: "57" }, { ID: "58", Text: "58" }
                ];
            }
        }
        else {
            selectedTilesArray = selectedTilesArray.sort();
            $.each(selectedTilesArray, function (Isel, Vsel) {
                allSlideNames.push({ ID: Vsel, Text: Vsel });
            });
        }
        fil.push({ Data: allSlideNames, MetricType: null, Name: "Slide Names", SelectedID: "", SelectedText: "" });
        if (modulename == "Summary") {
            //Frequency
            fil.push({ Data: frequencyFltr.Data, MetricType: null, Name: "Frequency", SelectedID: frequencyFltr.SelectedID, SelectedText: "" });
        }
        //StatTest
        fil.push({ Data: null, MetricType: null, Name: "StatTest", SelectedID: "", SelectedText: ($('.table-stat.statTest.activestat').text().trim().toLocaleLowerCase() == "benchmark" || $('.table-stat.statTest.activestat').text().trim().toLocaleLowerCase() == "custom base" ? report_benchMarkSelected : $('.table-stat.statTest.activestat').text().trim()) });
        //Benchmark
        fil.push({ Data: [{ ID: report_benchMarkSelected, Text: report_benchMarkSelected }], MetricType: null, Name: "Benchmark", SelectedID: "", SelectedText: "" });
        //Comparisions
        var allCompareData = [];
        for (var ind_Cmp = 0; ind_Cmp < report_comparisionsSelected.length; ind_Cmp++) {
            allCompareData.push({ ID: report_comparisionsSelected[ind_Cmp], Text: report_comparisionsSelected[ind_Cmp] });
        }
        fil.push({ Data: allCompareData, MetricType: null, Name: "Comparisions", SelectedID: "", SelectedText: "" });
        fil.push({ Data: null, MetricType: null, Name: "IsCustomDownload", SelectedID: "", SelectedText: IsCustomDownload })
        $("#master-btn").attr('data-val', JSON.stringify(fil));
        return isvalid;
    }

  

    //To Select or deselect Tile function 
    $(document).on("click", ".chkboximg", function () {

        if ($(this).parent().hasClass("actselectedTile")) {
            if ($(this).parent().attr("id") == "12") {
                $(this).parent().removeClass("actselectedTile");
                $('#13').parent().removeClass("actselectedTile");
            }
            else
                $(this).parent().removeClass("actselectedTile");
        }
        else
            if ($(this).parent().attr("id") == "12") {
                $(this).parent().addClass("actselectedTile");
                $('#13').parent().addClass("actselectedTile");
            }
            else
                $(this).parent().addClass("actselectedTile");

        if ($(this).hasClass("activechkboximg")) {
            if ($(this).parent().attr("id") == "12") {
                $(this).removeClass("activechkboximg");
                $("#13").find(".chkboximg").removeClass("activechkboximg");
            }
            else
                $(this).removeClass("activechkboximg");
        }
        else
            if ($(this).parent().attr("id") == "12") {
                $(this).addClass("activechkboximg");
                $("#13").find(".chkboximg").addClass("activechkboximg");
            }
            else
                $(this).addClass("activechkboximg");

        if ($(this).parent().parent().hasClass("actslctedBrdrColor")) {
            if ($(this).parent().attr("id") == "12") {
                $(this).parent().parent().removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                $('#13').parent().parent().removeClass("actslctedBrdrColor");
            }
            else {
                $(this).parent().parent().removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
            }
        }
        else {
            if ($(this).parent().attr("id") == "12") {
                $(this).parent().parent().addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                $('#13').parent().parent().addClass("actslctedBrdrColor");
            }
            else {

                $(this).parent().parent().addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $(this).parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
            }
        }

        //to select header section
        var id = $(this).parent().attr("for");
        $("#" + id).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
        $("#" + id).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
        $("#" + id).addClass("actselectedTile");
        $("#" + id).parent().addClass("actslctedBrdrColor");
        // 

        //Only for 
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

        //to deselect section header if none of the sub section is selected

        var list = $(".actselectedTile");
        var distParentList = $(".report-tilebttm");
        var listparentListdistn = [];
        $.each(distParentList, function (dI, dV) {
            if (listparentListdistn.indexOf($(dV).attr("for")) == -1) {
                listparentListdistn.push($(dV).attr("for"));
                $("#" + $(dV).attr("for")).parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                $("#" + $(dV).attr("for")).parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                $("#" + $(dV).attr("for")).removeClass("actselectedTile");
                $("#" + $(dV).attr("for")).parent().removeClass("actslctedBrdrColor");
            }
        });
        $.each(list, function (i, v) {
            var parentId = $($(v)[0]).attr("for");
            if ($("#" + parentId).parent().hasClass("actslctedBrdrColor")) {
            }
            else {
                $("#" + parentId).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                $("#" + parentId).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                $("#" + parentId).addClass("actselectedTile");
                $("#" + parentId).parent().addClass("actslctedBrdrColor");
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
            SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0,0, 5, 0, 8);

        }
        //
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
        if (modulename == "Summary")
        {
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
        if (!(valideateLeftPanel())) { return; }
        $(".loader,.transparentBG").show();
        var requrl = "";
        if (controllername == "reportp2preport")
            requrl = appRouteUrl + "report/DineReports/" + controllername;
        else
            requrl = appRouteUrl + "report/DinerReports/" + controllername;

        $.ajax({
            type: 'GET',
            url: requrl,
            contentType: "application/json",
            success: function (data) {
                BindTileList(data);
                $(".loader,.transparentBG").hide();
            },
            error: function () {
                $(".loader").hide();
                $(".transparentBG").hide();
                ajaxError
            }
        });
    };
    //

    //Close Button
    $(document).on("click", ".view-clsbtn", function () {
        $(".view-report-ppup").hide();
        $(".transparentBGExportExcel").hide();
    });
    $(document).on("click", ".closeSavePopup", function () {
        if (controllername == "reportp2preport")
            $("#p2pstatictext").show();
        else
            $("#p2pstatictext_diner").show();
        $(".report-maindiv").hide();
        $(".null-error-popup").hide();
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
        if (!prepareSampleSizeFilter()) { return; }
        if (isSampleSizeValidated == 0) {
            $(".loader,.transparentBG").show();
            var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
            var filterPanelInfo = { filter: filterPanelInfoData.filter, module: modulename };
            $.ajax({
                url: appRouteUrl + "report/sampleSizeValidator",
                data: JSON.stringify(filterPanelInfo),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    $(".stat-popup").hide(); $(".transparentBG").hide();
                    $(".loader").hide();
                    //To do
                    if (response.estList.length == 0) {
                        isSampleSizeValidated = 1;
                        $(".diner-statlayer .table-stat").last().click();//Opening Custom base
                    } else {
                        $(".list-of-nulls").html("");
                        response.estList.forEach(function (d, i) {
                            $(".list-of-nulls").append("<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div class='stat-cust-estabmt'>" + d + "</div></div>");
                        });
                        if (response.estList.length == $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").length) {
                            $(".save-proceed-btn").css("visibility", "hidden");
                            $(".save-proceed-btn").css("margin-left", "-25px");
                            sAllLowSample = "1";
                        } else {
                            $(".save-proceed-btn").css("visibility", "visible");
                            $(".save-proceed-btn").css("margin-left", "25px");
                            sAllLowSample = "0";
                        }
                        $(".null-error-popup").show();
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
            if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
                if ((txt == null || txt == undefined || txt.length == 0) && $(this).attr("data-val").trim() != "FREQUENCY") {
                    alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
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
                    if ($(".trend.active").length != 0) { tp_data = trendTpList; }
                    if (activeId.toLocaleLowerCase() == "total") {
                        tp_data = data;
                    }
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: tp_data, SelectedID: activeId });
                }
                else
                    fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data, SelectedID: IDs, MetricType: $(this).find(".lft-popup-ele_active").parent().attr("first-level-selection") });
            }
            else if (txt != '' && txt != null)
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null });
            else
                fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null });
        });
        ///////////////////////////////////////////////////////////////////////////////////////
        var rep_serial = 0; if (modulename == "Summary") { rep_serial = 1;}
        var tp = fil[1]; var frequencyFltr = fil[3];
        var est = fil[2];
        fil[3+rep_serial].MetricType = "Advanced Filters";
        var demoflter = fil[3+rep_serial];
        fil = [];
        //Time period type
        fil.push({ Data: null, MetricType: null, Name: "Timeperiod Type", SelectedID: "", SelectedText: $(".lft-popup-tp-active").text().trim() });
        //Time period
        fil.push(tp);
        //Establishments
        fil.push(est);
        //Demographic Filters
        fil.push(demoflter);
        if (modulename == "Summary") {
            //Frequency
            fil.push({ Data: frequencyFltr.Data, MetricType: null, Name: "Frequency", SelectedID: frequencyFltr.SelectedID, SelectedText: "" });
        }
        $("#master-btn").attr('data-val', JSON.stringify(fil));
        return isvalid;
    }

    $(document).on("click", ".proceedClick", function () {
        $(".save-reportPopup .stat-cust-estabmt").each(function (i, d) {
            $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").each(function (j, dt) {
                if ($(d).text().toLocaleLowerCase() == $(dt).text().toLocaleLowerCase()) {
                    $(dt).parent().find(".filter-info-panel-txt-del").click();
                    return false;
                }
            });
        });
        $(".null-error-popup").hide(); $(".transparentBG").show();
        isSampleSizeValidated = 1;
        //Update the benchmark
        $(".diner-statlayer .table-stat").last().click();
    });

    $(document).on('click', ".table-stat.statTest", function () {
        previsSelectedStatTest = $(".statTest.activestat").text();
        var stat_text = $(this).attr("data-val");
        if (valideateLeftPanel() == false)
            return;
        if (isSampleSizeValidated == 1 || stat_text != 'cb') {
            switch (stat_text) {
                case 'pp': $(".stat-popup-pp").hide(); if (pp_py_lock == 1) { alert("Not clickable"); return; }
                    $(".diner-statlayer .statTest").removeClass("activestat");
                    $(".diner-statlayer .statTest[data-val='pp']").addClass("activestat");
                    $(".stat-popup-pp").show(); $(".transparentBG").show(); break;
                case 'py': $(".stat-popup-py").hide(); if (pp_py_lock == 1) { alert("Not clickable"); return; }
                    $(".diner-statlayer .statTest").removeClass("activestat");
                    $(".diner-statlayer .statTest[data-val='py']").addClass("activestat");
                    $(".stat-popup-py").show(); $(".transparentBG").show(); break;
                case 'cb':
                    //set the benchmark here
                    report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
                    $(".stat-content").html('');
                    var custmHtml = "";
                    var selectedEstbmtlist = $(".Establishment_topdiv_element > div");
                    $.each(selectedEstbmtlist, function (i, v) {
                        custmHtml = '<div class="stat-custdiv"> <div class="stat-cust-dot"></div><div class="stat-cust-estabmt" data-id="' + $(v).attr("data-id") + '">' + $(v).find(".sel_text").text().replace(/^,/, '') + '</div></div>';
                        $(".stat-popup .stat-content").append(custmHtml);
                        if (isDefaultSelected != 0 && selectedCB == $(v).find(".sel_text").text()) {
                            $(".stat-cust-estabmt:eq("+i+")").click();
                        }
                    });
                    //if (isDefaultSelected == 0) {
                        $(".stat-cust-estabmt:eq(0)").click();
                        //Store the default cb text
                        selectedCB = $(".stat-cust-estabmt:eq(0)").text();
                    //    isDefaultSelected = 1;
                    //}
                        $(".transparentBG").show(); $(".stat-popup").show();
                        $(".table-stat.statTest").removeClass("activestat");
                        $(".table-stat.statTest[data-val='" + stat_text + "']").addClass("activestat");
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
        if (report_benchMarkSelected == "")
            report_benchMarkSelected = $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text:eq(0)").text();
        $(".stat-popup").hide();
        $(".stat-popup-pp").hide();
        $(".stat-popup-py").hide();
        $(".transparentBG").hide();
    })
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

