/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />
var estHeader = "Select the benchmark and upto 4 comparisions"; var selectedTilesArray = [];
var selectedPrvewImgLst = []; var currentPrevImgId = "";var IsCustomDownload=false;
angular.module("mainApp").controller("reportController", ["$scope", "$q", "$http", function ($scope, $q) {
    $scope.buildMenu = function () {
        $.ajax({
            url: appRouteUrl + "Report/GetFilter/" + controllername, async: false, success: function (response) {
                //$scope.filters = response;
                var est_with_benchmark = [];
                var benchData = [];
                benchData.push({
                    ChildCount: 0,
                    ID: -1,
                    IsSelectable: false,
                    Text: "Benchmark",
                    _ID:-1
                });
                benchData.push({
                    ChildCount: 0,
                    ID: -1,
                    IsSelectable: false,
                    Text: "Comparision",
                    _ID: -1
                });
                est_with_benchmark.push({
                    "Data": benchData, "Level": 1
                });
                est_with_benchmark.push(response[1].PanelPopup[0]);
                est_with_benchmark.push(response[1].PanelPopup[1]);
                est_with_benchmark.push(response[1].PanelPopup[2]);
                est_with_benchmark[1].Level = 2;
                est_with_benchmark[2].Level = 3;
                est_with_benchmark[3].Level = 4;
                response[1].PanelPopup = est_with_benchmark;
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
            url: appRouteUrl + "report/"+reportname +"/" + controllername,
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
        $(".master-lft-ctrl").parent().css("background", "none")
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        if (checkValidationSessionObj == false) return;
        if (!(valideateLeftPanel())) { return; }

        //if ($('.Establishment_topdiv_element').length == 2)
        //{ alert("Please select Comparision"); return false }
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
        IsCustomDownload=false;
        if (prepareReportFilter() == false)
            return;
        // Selected Demo Filters
        var selectedDemofilters = "", selectedDemofiltersList = [];
        var selectedDemofilters = $(".Advanced_Filters_topdiv_element[data-val='Advanced Filters'] div").find(".sel_text");
        $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().trim() + ",";
        });

        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
        //
        $(".loader,.transparentBG").show();
        var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterPanelInfo = { filter: filterPanelInfoData.filter, module: "Dine", selectedDemofiltersList: selectedDemofiltersList };
        $.ajax({
            url: appRouteUrl + "report/" + reportname + "/" + controllername,
            data: JSON.stringify(filterPanelInfo),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                window.location.href = appRouteUrl + "Report/" + dineorSummaryMethod + "?path=" + response;
                $(".loader").hide();
                $(".transparentBG").hide();
                //window.location.href = appRouteUrl + "Chart/DownloadExportToPPTCharts?fileName=" + response;
            },
            error: function () {
                $(".loader").hide();
                $(".transparentBG").hide();
                ajaxError
            }
        });
    }
    //$scope.CustomDownload = function () {
        
    //}
    $scope.removeBlankSpace = function (object) {
        object = object.trim();
        var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+~!@#$/g, '').replace(/\+/g, '');
        return text.toLowerCase();
    }
    $scope.statTest = function (event) {
        previsSelectedStatTest = $('.table-statlayer').find('.activestat').attr("id");
        $(".table-stat").removeClass("activestat");
        $(event.currentTarget).addClass("activestat");
        selectedstatTestToCarryFrwd = $('.table-statlayer').find('.activestat').attr("id");
        selectedTilesArray.length = 0;
        $scope.DownloadAll();
    }
//To Download Selected Tiles 
$(document).on("click", ".downloadbtn", function () {
    $(".master-lft-ctrl").parent().css("background", "none")
    $(".lft-ctrl3").hide();
    $(".lft-popup-col").hide();

    if ($("#selectallchkbx").prop("checked"))
{
    $scope.DownloadAll(); return;
}

    var selectedTiles =[]; var selectedListTiles = ""; selectedTilesArray =[];

//if ($('.Establishment_topdiv_element').length == 2)
//{ alert("Please select Comparision"); return false }

    if ($(".activechkboximg").length == 0) {
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
        if (selectedTilesArray.indexOf(parseInt($(ValTile).attr("for"))) == - 1)
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
    var filterPanelInfoData = { filter : JSON.parse($("#master-btn").attr('data-val'))
    };
    var filterPanelInfo = { filter: filterPanelInfoData.filter, module: "Dine", selectedDemofiltersList: selectedDemofiltersList
    };
    $.ajax({
            url: appRouteUrl + "report/" +reportname + "/" +controllername,
                    data : JSON.stringify(filterPanelInfo),
                method: "POST",
                    contentType: "application/json",
                    success : function (response) {
                        window.location.href = appRouteUrl + "Report/" +dineorSummaryMethod + "?path=" +response;
                        $(".loader").hide();
                        $(".transparentBG").hide();
                        //window.location.href = appRouteUrl + "Chart/DownloadExportToPPTCharts?fileName=" + response;
                },
                    error: ajaxError
                    });
                    });
                        //
}]);

$(document).ready(function () {
    //
    $(".master_link").removeClass("active");
    $(".master_link.reports").addClass("active");
    if ($(".master-top-header").width() == 1920) {
            $(".submodules-band").css("margin-left", "37.1%");
            $(".submodules-band").css("margin-top", "-0.44%");
    }
    $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-col1 .lft-popup-col-selected-text").text(estHeader);
    $(".benchmark_img").html("<div class='center_fix'>1</div>");
    $(".comparision_img").html("<div class='center_fix'>2</div>");

    $('.selctall-view-downlddiv').hide();

    //
});

$(document).on("click", ".report_first_level_ele", function () {
    if ($(".lft-popup-col2").css("display") == "none") {
        $(".lft-popup-col2").show();
        $(".lft-popup-col2").find(".lft-popup-ele").find(".lft-popup-ele-label-img").css("width","0!important");
        $(".lft-popup-col2").find(".lft-popup-ele").find(".sidearrwdiv").css("margin-left", "34px");
        $(".lft-ctrl3-content").width("586px");
    }
    if ($(this).hasClass("benchmark")) {
        report_current_selection_est = "benchmark";
    } else {
        report_current_selection_est = "comparision";
    }
    $(".benchmark_img, .comparision_img").removeClass("bg_active");
    $(".center_fix").css("color","black");
    $(this).find(".lft-popup-ele-label-img").addClass("bg_active");
    $(this).find(".center_fix").css("color","white");
    //$(".report_first_level_ele").removeClass("active");
    //$(this).addClass("active");
});

var valideateLeftPanel = function () {
    if (report_benchMarkSelected == "") { alert("Benchmark is required !"); return false; }
    if ($(".Time_Period_topdiv_element").length == 0) {
        alert("Timeperiod is required !"); return false;
    }
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
    var tp = fil[1];
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
    fil[3].MetricType = "Advanced Filters";
    var demoflter = fil[3];
    fil = [];
    //Time period type
    fil.push({Data:null,MetricType:null,Name:"Timeperiod Type", SelectedID:"", SelectedText:$(".lft-popup-tp-active").text().trim()}); 
    //Time period
    fil.push(tp);
    //Establishments
    fil.push(est);
    //Demographic Filters
    fil.push(demoflter);
    //fil.push({ Data: null, MetricType: null, Name: "Demographic Filters", SelectedID: "", SelectedText: "" });
    //Additional Filters
    //fil.push({ Data: null, MetricType: null, Name: "Additional Filters", SelectedID: "", SelectedText: "" });
    //Name of All slides
    var allSlideNames = [];
    
    if (selectedTilesArray.length == 0 || IsCustomDownload == false) {
        allSlideNames = [{ ID: "2", Text: "2" }, { ID: "4", Text: "4" }, { ID: "5", Text: "5" }, { ID: "6", Text: "6" }, { ID: "8", Text: "8" }, { ID: "9", Text: "9" },
            { ID: "10", Text: "10" }, { ID: "11", Text: "11" }, { ID: "13", Text: "13" }, { ID: "14", Text: "14" }, { ID: "15", Text: "15" }, { ID: "16", Text: "16" },
            { ID: "17", Text: "17" }, { ID: "18", Text: "18" }, { ID: "19", Text: "19" }, { ID: "20", Text: "20" }, { ID: "21", Text: "21" }, { ID: "22", Text: "22" },
            { ID: "23", Text: "23" }, { ID: "25", Text: "25" }, { ID: "26", Text: "26" }, { ID: "27", Text: "27" }, { ID: "28", Text: "28" },
            { ID: "30", Text: "30" }, { ID: "31", Text: "31" }, { ID: "32", Text: "32" }, { ID: "33", Text: "33" }, { ID: "34", Text: "34" }, { ID: "36", Text: "36" },
            { ID: "37", Text: "37" }, { ID: "38", Text: "38" }, { ID: "39", Text: "39" }, { ID: "40", Text: "40" }, { ID: "41", Text: "41" }, { ID: "42", Text: "42" },
            { ID: "43", Text: "43" }, { ID: "45", Text: "45" }, { ID: "46", Text: "46" }, { ID: "47", Text: "47" }, { ID: "48", Text: "48" }, { ID: "49", Text: "49" },
            { ID: "50", Text: "50" }, { ID: "51", Text: "51" }, { ID: "52", Text: "52" }, { ID: "53", Text: "53" }, { ID: "54", Text: "54" }, { ID: "55", Text: "55" },
            { ID: "56", Text: "56" }, { ID: "57", Text: "57" }, { ID: "58", Text: "58" }
        ];

    }
    else {
        selectedTilesArray = selectedTilesArray.sort();
        $.each(selectedTilesArray, function (Isel, Vsel) {
            allSlideNames.push({ ID: Vsel, Text: Vsel });
        });
    }
    fil.push({ Data: allSlideNames, MetricType: null, Name: "Slide Names", SelectedID: "", SelectedText: "" });
    //StatTest
    fil.push({ Data: null, MetricType: null, Name: "StatTest", SelectedID: "", SelectedText: ($('.table-statlayer').find('.activestat').text().trim().toLocaleLowerCase() == "benchmark" ? report_benchMarkSelected : $('.table-statlayer').find('.activestat').text().trim()) });
    //Benchmark
    fil.push({ Data: [{ ID: report_benchMarkSelected, Text: report_benchMarkSelected }], MetricType: null, Name: "Benchmark", SelectedID: "", SelectedText: "" });
    //Comparisions
    var allCompareData = [];
    for (var ind_Cmp = 0; ind_Cmp < report_comparisionsSelected.length; ind_Cmp++) {
        allCompareData.push({ ID: report_comparisionsSelected[ind_Cmp], Text: report_comparisionsSelected[ind_Cmp] });
    }
    fil.push({ Data: allCompareData, MetricType: null, Name: "Comparisions", SelectedID: "", SelectedText: "" });
    fil.push({Data: null,MetricType: null, Name: "IsCustomDownload",SelectedID: "", SelectedText: IsCustomDownload  } )
    $("#master-btn").attr('data-val', JSON.stringify(fil));
    return isvalid;
}

var BindTileList = function (TileList) {
    $('.selctall-view-downlddiv').show();
    var Irow = 0;
    $(".report-maindiv").html("");
    var bindTileHTML = "";
    $(TileList).length;
    $.each(TileList, function (Tid, Tval) {
        var defaultouterSelected = "", defaultTileImgSelected="";
        if (Irow == 0)
            bindTileHTML += "<div class='report-tilerow'>";
        if (Tval.SlideNo != "2") {
            bindTileHTML += "<div class='report-tilediv'>";
            if (Tval.SlideNo == "1") {
                defaultTileSted = "defaultslctedImgeClr";defaultTileImgSted = "defautlSeldBrdrClr";defaultTilebtmSted = "defautlSeldTile";
            }
            else {
                defaultTileSted = "";defaultTileImgSted = "";defaultTilebtmSted = "";
            }
            //bindTileHTML += "<img src='../Images/ReportsStaticImages/" + Tval.SlideNo + ".png' width='100%' height='100%' /> <div class='report-tileimage'></div>";
            bindTileHTML += "<div class='report-tileimage'><div class='tile-outerdiv  " + defaultTileSted + "'><div class='tileimage " + defaultTileImgSted + "' style='background:url(../Images/ReportsStaticImages/" + Tval.SlideNo + ".png)'></div></div></div>";
            bindTileHTML += "<div class='tilebtm-outerdiv " + defaultTileImgSted + "'><div class='report-tilebttm  " + defaultTilebtmSted + "' for='" + Tval.HeaderCategory + "'  id='" + Tval.SlideNo + "'><div class='slidename'>" + Tval.SlideName + "</div>";
            if (Tval.IsFixed == false)
                bindTileHTML += "<div class='chkboximg'></div></div></div>";
            else
                bindTileHTML += "</div></div>";

            bindTileHTML += "</div>";
            bindTileHTML += "<div class='report-tileemptydiv'></div>";
            Irow++;
        }
      
        if (Irow == 3) {
            bindTileHTML += "</div>";
            Irow = 0;
        }
    });
    $(".report-maindiv").append(bindTileHTML);

    SetScroll($(".report-maindiv"), "rgba(0, 0, 0, 0.74902)", 20, 30, 0, -8, 8);
    $("#ascrail2007").css("padding-top", "0px");
    $("#ascrail2007").css("margin-top", "20px");
    $("#ascrail2007").css("padding-right", "0px");
    $("#ascrail2007").css("margin-right", "30px");
}

//To Select or deselect Tile function 
$(document).on("click", ".chkboximg", function () {
   
    if ($(this).parent().hasClass("actselectedTile"))
        $(this).parent().removeClass("actselectedTile");
    else
        $(this).parent().addClass("actselectedTile");

    if ($(this).hasClass("activechkboximg"))
        $(this).removeClass("activechkboximg");
    else
        $(this).addClass("activechkboximg");

    if ($(this).parent().parent().hasClass("actslctedBrdrColor")) {
        $(this).parent().parent().removeClass("actslctedBrdrColor");
        $(this).parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
        $(this).parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
    }
    else {
        $(this).parent().parent().addClass("actslctedBrdrColor");
        $(this).parent().parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
        $(this).parent().parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
    }

    //to select header section
    var id = $(this).parent().attr("for");
    $("#" + id).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
    $("#" + id).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
    $("#" + id).addClass("actselectedTile");
    $("#" + id).parent().addClass("actslctedBrdrColor");
    //
    
    //to deselect section header if none of the sub section is selected

    var list = $(".actselectedTile");
    var distParentList = $(".report-tilebttm");
    var listparentListdistn=[];
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

    if($(".chkboximg").length == $(".activechkboximg").length)
        $("#selectallchkbx").prop("checked", true);
    else
        $("#selectallchkbx").prop("checked", false);

});
//



//Custom Download Click Function
$(document).on("click", ".custom_download", function ()
{
    $(".master-lft-ctrl").parent().css("background", "none")
    $(".lft-ctrl3").hide();
    $(".lft-popup-col").hide();
    $("#selectallchkbx").prop("checked", false);
    IsCustomDownload=true;
    reset_img_pos();
    if (checkValidationSessionObj == false) return;
    if (!(valideateLeftPanel()) && !(prepareReportFilter())) { return; }
    //if ($('.Establishment_topdiv_element').length == 2)
    //{ alert("Please select Comparision"); return false }
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
    
});
//

//View Report
$(document).on("click", ".view-reportbtn", function ()
{
    if ($(".activechkboximg").length == 0) {
        alert("Please Select Tiles");
        return false;
    }
    $(".view-report-ppup").show();
    $(".transparentBGExportExcel").show();

    var selectedTileslst = $(".report-tilebttm.actselectedTile");
    selectedPrvewImgLst = [];
    selectedPrvewImgLst.push(1);
    $.each(selectedTileslst, function (ITiles, VTiles) {
        if (parseInt($($(VTiles)[0]).attr("id")) != 0 && parseInt($($(VTiles)[0]).attr("for")) !=0) {
            if (selectedPrvewImgLst.indexOf(parseInt($($(VTiles)[0]).attr("id"))) == -1)
                selectedPrvewImgLst.push(parseInt($($(VTiles)[0]).attr("id")));

            if (selectedPrvewImgLst.indexOf(parseInt($($(VTiles)[0]).attr("for"))) == -1)
                selectedPrvewImgLst.push(parseInt($($(VTiles)[0]).attr("for")));
        }
    });
    selectedPrvewImgLst = selectedPrvewImgLst.sort(SortByName);
    currentPrevImgId = 0;
    $(".view-preview-img").html("");
    $(".view-preview-img").html("<div class='currntprevimg' style='background-image:url(../Images/ReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png)'></div>");
});
//
//This will sort your array
function SortByName(a, b) {
    var aName = a;
    var bName = b;
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}


//Previous Button
$(document).on("click", ".view-pre-btn", function () {
    if (currentPrevImgId == 0)
        return false;
    currentPrevImgId--;
    $(".view-preview-img").html("").html("<div class='currntprevimg' style='background-image:url(../Images/ReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png)'></div>");
});

//Next Button
$(document).on("click", ".view-next-btn", function ()
{
    if (currentPrevImgId == (selectedPrvewImgLst.length -1))
        return false;
    currentPrevImgId++;
    $(".view-preview-img").html("").html("<div class='currntprevimg' style='background-image:url(../Images/ReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png)'></div>");
});

//Close Button
$(document).on("click", ".view-clsbtn", function () {
    $(".view-report-ppup").hide();
    $(".transparentBGExportExcel").hide();
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