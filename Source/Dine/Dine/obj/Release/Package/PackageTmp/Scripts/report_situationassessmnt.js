controllername = "situationassessmentreport";
modulename = "Dine";
var situationMetricList = [];

var measureListToShowToggle = [7, 8, 9, 10, 11, 12];
var isParentIdWithInSameSection = false;
var tableStructure2 = [16, 17, 22, 23, 24, 25, 27];
var isSampleSizeValidatedForSitn = 0;
//let demogfixedlist = [], demogfixedactivelist = [], tripsFixedList = [], tripsFixedActiveList = [];
var totalVisitsLSS = [];
var isTotalVisitsMainHdrAdded = false;
var listmytripsforMSS = [18, 19, 20, 21];
var listcore_guestforMSS = [7, 8, 9, 10, 11, 12];
//sabat
//var isFirstTimeExecuted = true;

$(document).ready(function () {
    $('.report-maindiv').hide();
    $('.report-situation-maindiv').show();
    $(".adv-fltr-guest").css("color", "#000");
    $(".adv-fltr-visit").css("color", "#f00");
    loadSituationReportMetrics();
    $('.downloadall_situation').click(function () {
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");
        if (valideateLeftPanelForSitn() == false) return;
        $(".loader").show(); $(".transparentBG").show();
        isFromQuickDownloadSitn = true;
        clearOutputAreaOnlyWhenLeftPanelModified();
        checkSampleSizeForSituation();
    });
    $('.custom_download_situation').click(function () {
        isFromLSSPppSAR = false;
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        reset_img_pos();
        $(".master-lft-ctrl").parent().css("background", "none");
        //sabat
        if (isFromMSS) {
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle');

            }
        }
        else {
            if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                $('#guest-visit-toggle').addClass('activeToggle');
                $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
                $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
            }

        }
        //if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
        //    $('#guest-visit-toggle').prop("checked", false);
        //    $(".adv-fltr-visit").css("color", "#f00");
        //    $(".adv-fltr-guest").css("color", "#000");
        //    $('#guest-visit-toggle').addClass('activeToggle');
        //    $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        //    $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
        //}
        $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
        if (valideateLeftPanelForSitn() == false) return;
        if (visitfiltersList.length > 0)
            $(".null-error-popup-sitn-visitppup").show();
        else {
            $(".loader").show(); $(".transparentBG").show();
            checkSampleSizeForSituation();
        }
        //$(".loader").hide();
        //$(".transparentBG").hide();
        totalVisitsLSS = [];
        isTotalVisitsMainHdrAdded = false;
    });

    $(document).on('click', '.checkBoxChange', function () {
        var activeChbkBxCount = 0;
        $('#scrollableTable .checkBoxChange').each(function () {
            if ($(this).is(":checked"))
                activeChbkBxCount++;
        });
        if (activeChbkBxCount > 6) {
            $(this).prop("checked", false);
            showMaxAlert('You can make maximum 6 selections');
            return;
        }
        if ($(this).hasClass('chkBx_active'))
            $(this).removeClass('chkBx_active');
        else
            $(this).addClass('chkBx_active');

    });
    defaultVisitsSelect = true;
    isVisitsSelected = true;
    $(document).on('click', '#reportSitnPreview', function () {
        showPreviewPpup();
    });

    $(document).on('click', '#reportSitnDownload', function () {
        showColorPallatePpup();
    });
    //$(document).on('click', '.transparentBG', function ()
    //{ $('.preview-ppup').hide(); $('.preview-ppup-static').hide(); $('.transparentBG').hide(); });
    $(document).on('click', '.preview-ppup-clsbtn', function ()
    { $('.preview-ppup').hide(); $('.preview-ppup-static').hide(); $('.transparentBG').hide(); });

});

var loadSituationReportMetrics = function () {
    situationMetricList = [];
    $.ajax({
        url: appRouteUrl + "Report/GetSituationLeftPanelMetrics",
        data: "",
        method: "POST",
        contenttype: "application/json",
        async: false,
        success: function (response) {
            situationMetricList = response;
        },
        error: function () {
            $(".loader").hide();
            $(".transparentBG").hide();
            ajaxError
        }
    });

}

var bindSituationReport = function (situationMetricList) {
    var metricParentList = situationMetricList.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
    var metricParentList = situationMetricList.filter(function (d) { return d.MeasureParentName != "" }).map(function (d) { return d.MeasureParentName });
    var uniqueParentList = [];
    var html = "";
    var measuresList = [];
    var isSelectedBenchMarkChannel = $('.lft-popup-ele_active[parent-Of-parent=BenchMark]').attr('channelFlag');
    $(".master-view-content").css("background-image", "none");
    $.each(metricParentList, function (i, v) {
        if (uniqueParentList.indexOf(v) == -1)
            uniqueParentList.push(v);
    });
    $(".report-sitn-metricsBindDta").html('');
    $.each(uniqueParentList, function (uI, uV) {
        $.each(situationMetricList, function (sI, sV) {
            if (uV == sV.MeasureParentName && measuresList.indexOf(sV.MeasureParentName) == -1) {
                if (isSelectedBenchMarkChannel == "True" && (sV.ParentId == "3" || sV.ParentId == "4"))
                    html += "<div class='parentHeader disableParentHeader'> <div  class='parentHeadrdiv'>" + sV.MeasureParentName + " </div><div class='togglearrowdiv'> <div id='parenthdr_" + sV.ParentId + "' class='togglearrow togglearrow_deactive'></div></div></div>";
                else
                    html += "<div class='parentHeader' onclick='toggleData(this," + sV.ParentId + ")'> <div  class='parentHeadrdiv'>" + sV.MeasureParentName + " </div><div class='togglearrowdiv'> <div id='parenthdr_" + sV.ParentId + "' class='togglearrow togglearrow_deactive'></div></div><div class='border-btm-blk'></div>    </div>";
                measuresList.push(sV.MeasureParentName);
            }
            if (uV == sV.MeasureParentName && sV.MeasureParentName != "")
                if (sV.MeasureId == 7 || sV.MeasureId == 18) {
                    html += "<div measure-id=" + sV.MeasureId + " class='subList subList_" + sV.ParentId + "'><div parent-id=" + sV.ParentId + " id=" + sV.MeasureId + " onclick='selectMeasure(" + sV.MeasureId + ")' class='subMeasureName'> <div class='subdotred'></div><div class='submeasureNamediv'>" + sV.MeasureName + "<div title='THIS SLIDE HAS CUSTOM METRIC SELECTION. SELECT 6 METRICS TO BE SHOWN IN THIS SLIDE.' class='lft-popup-ele-custom-tooltip-icon-new' onmouseover='customRegionsMouseHoverTitles(this)'></div></div></div><div class='subdash'></div><div class='subdot'></div> </div>";
                }
                
                    else if (sV.MeasureId == 17 && (isTotalVisitsMainHdrAdded || isFromMSS==true))
                    html += "<div measure-id=" + sV.MeasureId + " class='disableParentHeadervisitss subList subList_" + sV.ParentId + "'><div parent-id=" + sV.ParentId + " id=" + sV.MeasureId + " onclick='selectMeasure(" + sV.MeasureId + ")' class='subMeasureName'> <div class='subdotred'></div><div class='submeasureNamediv'>" + sV.MeasureName + "</div></div></div>";
                else
                    html += "<div measure-id=" + sV.MeasureId + " class='subList subList_" + sV.ParentId + "'><div parent-id=" + sV.ParentId + " id=" + sV.MeasureId + " onclick='selectMeasure(" + sV.MeasureId + ")' class='subMeasureName'> <div class='subdotred'></div><div class='submeasureNamediv'>" + sV.MeasureName + "</div></div><div class='subdash'></div><div class='subdot'></div> </div>";
        });
    });
    $(".report-sitn-metricsBindDta").append(html);
    $('.subList').hide()
    $('.subList_1').show();
    $($('.togglearrow')[0]).removeClass('togglearrow_deactive').addClass('togglearrow_active');
    selectMeasure(7);
}

var toggleData = function (event, id) {
    $('.subList').hide();
    $('.subList_' + id).show();
    $('.togglearrow').removeClass('togglearrow_active').addClass('togglearrow_deactive');
    $('#parenthdr_' + id).removeClass('togglearrow_deactive').addClass('togglearrow_active');
}
var selectMeasure = function (measureId) {
    $(".loader").show(); $(".transparentBG").show();
    $(".subMeasureName").removeClass('subMeasureName_active');
    $("#" + measureId).addClass('subMeasureName_active');
    $('.report-sitn-outputdiv').show();
    changeFrequencyDependingOnMeasureClick(measureId);
    getTableOutput(measureId);//to get the

}
var getTableOutput = function (measureId) {
    if (checkValidationSessionObj() == false) {
        return false;
    }
    if (prepareReportFilter() == false)
        return;

    //disable guest & trips based on TotalVisitsSampel < 30
        if (isTotalVisitsMainHdrAdded || isFromMSS) {
        $('.subList_1[measure-id=17]').addClass("disableParentHeadervisitss");
        $('.subList_1[measure-id=17] .subdash').removeClass('subdash');
    }
    else {
        $('.subList_1[measure-id=17]').removeClass("disableParentHeadervisitss");
        if ($('.subList_1[measure-id=17] .subdash').length == 0)
            $('.subList_1[measure-id=17] div.subdot').before("<div class='subdash'></div>");
    }



    if (measureId == 7 || measureId == 18)
        $(".filter-sitn-demog-seltnote").show();
    else
        $(".filter-sitn-demog-seltnote").css("display", "none");
    selectedmeasureId = measureId;
    var filterPanelInfo = {
        filter: JSON.parse($("#master-btn").attr('data-val'))
    };
    var spDynamicname = "";
    switch (measureId) {
        case 7:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_Demographics";
            break;
        case 8:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_HEC";
            break;
        case 9:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_Digitalpage";
            break;
        case 10:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_DinerSegments";
            break;
        case 11:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_AttitudinalStatements";
            break;
        case 12:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_Geography";
            break;
        case 13:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_CrossDining_Channels";
            break;
        case 14:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_CrossDining_AcrossEstablishments";
            break;
        case 15:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_CrossDining_Competitors";
            break;
        case 16:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_FrequencyFunnel";
            break;
        case 17:
            spDynamicname = "USP_SituationAssesmentReport_CoreGuest_ShareofGuestTrips";
            break;
        case 18:
            spDynamicname = "USP_SituationAssesmentReport_Trips_PlanningContext";
            break;
        case 19:
            spDynamicname = "USP_SituationAssesmentReport_Trips_OccasionContext";
            break;
        case 20:
            spDynamicname = "USP_SituationAssesmentReport_Trips_Motivations";
            break;
        case 21:
            spDynamicname = "USP_SituationAssesmentReport_Trips_SatisfactionDrivers";
            break;
        case 22:
            spDynamicname = "USP_SituationAssesmentReport_LoyaltyPyramid";
            break;
        case 23:
            spDynamicname = "USP_SituationAssesmentReport_FairShair_EstablishmentImegeries";
            break;
        case 24:
            spDynamicname = "USP_SituationAssesmentReport_FairShair_StrengthOppurtunites";
            break;
        case 25:
            spDynamicname = "USP_SituationAssesmentReport_FairShair_Perceptions";
            break;
        case 27:
            spDynamicname = "USP_SituationAssesmentReport_FairShair_BestInClass";
            break;
    }

    
    var filterdata = {
        filter: filterPanelInfo.filter, spname: spDynamicname
    };
    $(".loader").show(); $(".transparentBG").show();
    $.ajax({
        url: appRouteUrl + "Report/GetTableOutput",
        data: filterdata,
        method: "POST",
        contenttype: "application/json",
        async: true,
        success: function (response) {
            $('.report-situation-maindiv, .seperator').show();
            if (response.length == 0) {
                $(".table-bottomlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
            }
            else {
                bindSituationData(response);
            }
            isdemogChangedForSitn = false;
            isFrequencyChangedForSitn = false;
            isToggleClicked = false;
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

var prepareReportFilter = function () {
    var fil = [], isvalid = true;
    $(".master-lft-ctrl").each(function () {
        var txt = $(this).find(".lft-ctrl-txt").attr('data-ids');
        if (txt != undefined) {
            if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
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
        }
    });
    //$("#master-btn").attr('data-val', JSON.stringify(fil));
    $("#master-btn").attr('data-val', JSON.stringify(getIsVisitsOrGuestsId(fil)));
    $("#master-btn").attr('data-val', JSON.stringify(getAdvanceFiltersVisitsId(fil)));
    return isvalid;

}
var getIsVisitsOrGuestsId = function (fil) {
    var isVisits = $('.adv-fltr-visit').css("color") == "rgb(255, 0, 0)" ? '1' : '0';
    fil.push({
        Name: "IsVisit", Data: null, SelectedID: isVisits
    });
    return fil;
}
var getAdvanceFiltersVisitsId = function (fil) {
    fil.push({
        Name: "Advance Visit Filters", Data: null, SelectedID: visitfiltersList
    });
    return fil;
}

var bindSituationData = function (bindSituationData) {
    
    //$("#flexi-table").show();
    $("#scrollableTable").show();
    $('.table-bottomlayer').html('');
    if (tableStructure2.indexOf(selectedmeasureId) == -1)
    {
        //showing empty values for metric percentage when visit sample size is low
        //Added by Sabat Ullah 06-01-2020
        if (isFromMSS && isVisitsSelected && listcore_guestforMSS.indexOf(selectedmeasureId) > -1) {
            for (let i = 0; i < bindSituationData.length; i++) {
                for (let j = 0; j < bindSituationData[i].situationAnalysisData.length; j++) {
                    let samplesize = bindSituationData[i].situationAnalysisData[j].MetricSampleSize;
                    if (samplesize < 30) {
                        bindSituationData[i].situationAnalysisData[j].MetricPercentage = "-2020";
                        bindSituationData[i].situationAnalysisData[j].CustomBaseIndex1 = "-2020";
                        bindSituationData[i].situationAnalysisData[j].CustomBaseIndex2 = "-2020";
                    }
                }
            }

        }
        else if (isFromMSS && listmytripsforMSS.indexOf(selectedmeasureId) > -1)
        {
            for (let i = 0; i < bindSituationData.length; i++) {
                for (let j = 0; j < bindSituationData[i].situationAnalysisData.length; j++) {
                    let samplesize = bindSituationData[i].situationAnalysisData[j].MetricSampleSize;
                    if (samplesize < 30) {
                        bindSituationData[i].situationAnalysisData[j].MetricPercentage = "-2020";
                        bindSituationData[i].situationAnalysisData[j].CustomBaseIndex1 = "-2020";
                        bindSituationData[i].situationAnalysisData[j].CustomBaseIndex2 = "-2020";
                    }
                }
            }
        }
        //end sabat
        getMyCoreGuestAndTripsTableStruct(bindSituationData);
    }
        
    else if (selectedmeasureId == "16" || selectedmeasureId == "17" || selectedmeasureId == "22")
        getSharFreqLoyltyTableStruct(bindSituationData);
    else if (selectedmeasureId == "23" || selectedmeasureId == "24")
        getFairSharAnalysiTableStruct(bindSituationData)
    else if (selectedmeasureId == "25")
        getPreceptionTableStruct(bindSituationData);
    else if (selectedmeasureId == "27")
        getBestInClassFairShareTableStruct(bindSituationData);
    customRegionsMouseHoverTitles();
}

var getMyCoreGuestAndTripsTableStruct = function (bindSituationData) {

    let clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
    let clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
    let cssForUseDirectinally = "";
    let cssForUseDirectnlyyCircle = "";
    let cssForUseDirectnlytd = "";
    let statValueColor = ""; var chkboxDefaultSelectedList = [];
    let situtnHeadhtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    //Header Part -- Start
    var benchMarkNameforSit = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    situtnHeadhtml += '<thead><tr class="tbl-dta-rows">';
    let columns = ['Metrics', 'Sub-metrics', benchMarkNameforSit, 'Index Vs ' + customBaseList[0].customBaseParentText, 'Index Vs ' + customBaseList[1].customBaseParentText, customBaseList[0].customBaseParentText, customBaseList[1].customBaseParentText];
    $.each(columns, function (colI, colV) {
        if (colI == 0) {
            //situtnHeadhtml += '<th class="tbl-dta-metricsHding">';
            //situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">fasdfasdfs</div><div class="tbl-data-brderbtmblk"></div></th><th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>';
            situtnHeadhtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn-sar tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn-sar tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    situtnHeadhtml += '</tr>';
    situtnHeadhtml += '</thead>';
    //Header Part --  End

    //Body Part -- Start   
    situtnBodyhtml = situtnHeadhtml + '<tbody>';
    $.each(bindSituationData, function (parentI, parentV) {
        var i = 0;
        var defaultMetricLenght = parentV.situationAnalysisData.length > 1 ? parentV.situationAnalysisData.length / 2 : parentV.situationAnalysisData.length;
        $.each(parentV.situationAnalysisData, function (subListI, subListV) {
            var metricPercentage = ""; var CB1Percentage = "", CB2Percentage = "", addBoldFontClsForChannels = "";

            addBoldFontClsForChannels = (subListV.IsChannelFlag == true ? "addboldfontclsChannels" : "");
            if (subListV.MetricName == "HouseHold Size" || subListV.MetricName == "Children in HH") {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : parseFloat(subListV.MetricPercentage).toFixed(2);
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : parseFloat(subListV.CB1Percentage).toFixed(2);
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : parseFloat(subListV.CB2Percentage).toFixed(2);
            }
            else if (subListV.MetricName == "Average HH Income") {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : "$" + parseFloat(subListV.MetricPercentage).toFixed(2) + "K";
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : "$" + parseFloat(subListV.CB1Percentage).toFixed(2) + "K";
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : "$" + parseFloat(subListV.CB2Percentage).toFixed(2) + "K";
            }
            else if (subListV.MetricName == "Average check size per diner") {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : "$" + parseFloat(subListV.MetricPercentage).toFixed(2);
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : "$" + parseFloat(subListV.CB1Percentage).toFixed(2);
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : "$" + parseFloat(subListV.CB2Percentage).toFixed(2);

            }
            else if (parentV.MetricParentName == "Decision Made with time left before arrival") {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : parseFloat(subListV.MetricPercentage).toFixed(2) + " HOUR(S)";
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : parseFloat(subListV.CB1Percentage).toFixed(2) + " HOUR(S)";
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : parseFloat(subListV.CB2Percentage).toFixed(2) + " HOUR(S)";
            }
            else if (parentV.MetricParentName == "Distance Travelled") {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : parseFloat(subListV.MetricPercentage).toFixed(2) + " MILE(S)";
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : parseFloat(subListV.CB1Percentage).toFixed(2) + " MILE(S)";
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : parseFloat(subListV.CB2Percentage).toFixed(2) + " MILE(S)";
            }
            else {
                metricPercentage = subListV.MetricPercentage == null ? "NA" : parseFloat(subListV.MetricPercentage * 100).toFixed(1) + "%";
                CB1Percentage = subListV.CB1Percentage == null ? "NA" : parseFloat(subListV.CB1Percentage * 100).toFixed(1) + "%";
                CB2Percentage = subListV.CB2Percentage == null ? "NA" : parseFloat(subListV.CB2Percentage * 100).toFixed(1) + "%";
            }

            

            var metricSign = subListV.Significance1 == null ? "NA" : parseFloat(subListV.Significance1).toFixed(1) + "%";
            var metricSign1 = subListV.Significance2 == null ? "NA" : parseFloat(subListV.Significance2).toFixed(1) + "%";
            var metricCB1 = subListV.CustomBaseIndex1 == null ? "NA" : subListV.CustomBaseIndex1;
            var metricCB2 = subListV.CustomBaseIndex2 == null ? "NA" : subListV.CustomBaseIndex2;

            //showing empty values for metric percentage when visit is having low sample size
            //Added by Sabat Ullah  06-01-2020
            if (subListV.MetricPercentage == "-2020") {
                metricPercentage = "";
                metricCB1 = "";
                metricCB2 = "";
            }

            var metricSignClr = getFontColorBasedOnStatValue(parseFloat(subListV.Significance1).toFixed(1));
            var metricSignClr1 = getFontColorBasedOnStatValue(parseFloat(subListV.Significance2).toFixed(1));

            situtnBodyhtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(parentV.MetricParentName.toLowerCase()) + '">';

            var isChecked = subListV.DefaultMetric == true ? 'checked' : 'unchecked';
            var addClassForactiveChkBx = isChecked == 'checked' ? 'chkBx_active' : 'chkBx_deactive';
            var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';
            if (subListI == 0) chkboxDefaultSelectedList.push(isChecked);
            if (subListI == (Math.round(defaultMetricLenght) - 1)) {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">';
                if (selectedmeasureId == "7" || selectedmeasureId == "18") {
                    situtnBodyhtml += '<div class = "tbl-checkboxParentName"><input image-text="' + removeBlankSpace(parentV.MetricParentName) + '" class="checkBoxChange ' + addClassForactiveChkBx + '" id="id_' + removeBlankSpace(parentV.MetricParentName) + '"  ' + isChecked + '  type="checkbox" name=' + subListV.MetricParentName + '/></div>  ';
                }
                else {
                }
                situtnBodyhtml += '<div class="tbl-algn fontForMetrics tbl-algncheckbx">' + subListV.MetricParentName + '</div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            }
            else {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">  <div class="tbl-algn fontForMetrics"></div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn tbl-algn-left ' + addBoldFontClsForChannels + ' fontForMetrics">' + subListV.MetricName + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn  fontblue ' + addBoldFontClsForChannels + ' fontForMetrics">' + metricPercentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn  ' + addBoldFontClsForChannels + ' fontForMetrics">' + metricCB1 + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn ' + addBoldFontClsForChannels + ' fontForMetrics">' + metricCB2 + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + metricSignClr + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn ' + addBoldFontClsForChannels + ' fontForMetrics">' + CB1Percentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + metricSignClr1 + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn  ' + addBoldFontClsForChannels + ' fontForMetrics">' + CB2Percentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';


            situtnBodyhtml += '</tr>';
        });
    });
    situtnBodyhtml += '</tbody></table><div id="scrollableTable"></div>';
    $('.table-bottomlayer').html(situtnBodyhtml);
    //Body Part -- End

    var heightBottomlayer;
    heightBottomlayer = $(".table-bottomlayer").height() - ($('.report-sitn-output-header').height() + $('.report-sitn-output-header').height());
    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: heightBottomlayer,
        pinnedRows: 1,
        pinnedCols: 2,
        container: "#scrollableTable",
        removeOriginal: true
    };// tbl - data - expan - collapse
    $("#flexi-table").tablescroller(options);

    setWidthforTableColumns1();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2)
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

    //added by Nagaraju D for table scroll dynamic height
    setTableResolutionForSitn();
    $(".scrollable-columns-table .tbl-dta-metricsHding, .scrollable-data-table .tbl-dta-td,.corner-table .tbl-dta-metricsHding, .scrollable-rows-table .tbl-dta-td").css("width", "100%");
    $(".corner-table, .corner-frame").height($(".scrollable-columns-table tr").height());
    var headerHeight = $(".scrollable-columns-table tr").height();
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr,.corner-table tr th, .corner-frame tr th,.scrollable-columns-table tr th").css("height", headerHeight);
    var appendHtml = "";
    var parentRowSpanHeightList = [];
    $.each(bindSituationData, function (pI, pV) {
        var outerheight = 0;
        var sublist = $('.scrollable-data-frame .tbl-dta-rows.dataShow.' + removeBlankSpace(pV.MetricParentName));
        $.each(sublist, function (sI, sV) {
            outerheight += $(sV).outerHeight();
        });
        parentRowSpanHeightList.push(outerheight);
    });

    $('.scrollable-rows-frame').html('');
    appendHtml += '<table class="data scrollable-rows-table" cellpadding="0" cellspacing="0" style="width: 100%; height: auto;"><tbody>';
    $.each(bindSituationData, function (parentI, parentV) {
        var countSubList = parentV.situationAnalysisData.length;
        //var totalHeight = countSubList * 25;
        var isChecked = chkboxDefaultSelectedList[parentI];
        var addClassForactiveChkBx = isChecked == 'checked' ? 'chkBx_active' : 'chkBx_deactive';
        appendHtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(parentV.MetricParentName) + '" style="height:' + parentRowSpanHeightList[parentI] + 'px">';
        appendHtml += '<td rowspan=' + countSubList + ' class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + '  ' + removeBlankSpace(parentV.MetricParentName) + '_hide">';
        if (selectedmeasureId == "7" || selectedmeasureId == "18") {
            appendHtml += '<div class="tbl-checkboxParentName"><input image-text="' + removeBlankSpace(parentV.MetricParentName) + '" class="checkBoxChange ' + addClassForactiveChkBx + '" id="id_' + removeBlankSpace(parentV.MetricParentName) + '" ' + isChecked + ' type="checkbox" name="' + parentV.MetricParentName + '/"></div> ';
        }
        else { }
        appendHtml += '<div class="tbl-algn fontForMetrics tbl-algncheckbx">' + parentV.MetricParentName + '</div><div class="tbl-data-btmbrd tbl-dta-btmblueclr"></div></td>';
        appendHtml += '<td rowspan=' + countSubList + '   class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide" style="height: ' + parentRowSpanHeightList[parentI] + 'px"><div class="tbl-shadow">&nbsp;</div></td></tr>';
    });
    appendHtml += "</tbody></table>";
    $('.scrollable-rows-frame').append(appendHtml);
    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    SetScrollForSARModule($("#scrollableTable .scrollable-data-frame"), "#393939", 0, 1, 2, -8, 8, true);
    setTableHeightForSAR();

}
var getSharFreqLoyltyTableStruct = function (bindSituationData) {
    let clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
    let clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
    let cssForUseDirectinally = "";
    let cssForUseDirectnlyyCircle = "";
    let cssForUseDirectnlytd = "";
    let statValueColor = "";
    let situtnHeadhtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    //Header Part -- Start
    situtnHeadhtml += '<thead><tr class="tbl-dta-rows">';
    var benchMarkNameforSit = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    let columns = ['Metrics', 'Sub-metrics', benchMarkNameforSit, 'Competitors'];
    $.each(columns, function (colI, colV) {
        if (colI == 0) {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(colV) + '_hide " >';
            if (selectedmeasureId.toString() == "23" || selectedmeasureId.toString() == "22" || selectedmeasureId.toString() == "16" || selectedmeasureId.toString() == "17")
                situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            else
                situtnHeadhtml += '<div class="tbl-algn-sar tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(colV) + '_hide " >';
            if (selectedmeasureId.toString() == "23" || selectedmeasureId.toString() == "22" || selectedmeasureId.toString() == "16" || selectedmeasureId.toString() == "17")
                situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            else
                situtnHeadhtml += '<div class="tbl-algn-sar tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    situtnHeadhtml += '</tr>';
    situtnHeadhtml += '</thead>';
    //Header Part --  End

    //Body Part -- Start   
    situtnBodyhtml = situtnHeadhtml + '<tbody>';
    $.each(bindSituationData, function (parentI, parentV) {
        var i = 0;
        var defaultMetricLenght = parentV.situationAnalysisData.length > 1 ? parentV.situationAnalysisData.length / 2 : parentV.situationAnalysisData.length;
        $.each(parentV.situationAnalysisData, function (subListI, subListV) {
            var metricPercentage = "", CompPercentage = "", metricSign = "";
            metricPercentage = subListV.MetricPercentage == null ? "NA" : parseFloat(subListV.MetricPercentage * 100).toFixed(1) + "%";
            CompPercentage = subListV.CompPercentage == null ? "NA" : parseFloat(subListV.CompPercentage * 100).toFixed(1) + "%";
            metricSign = subListV.CompSig == null ? "NA" : parseFloat(subListV.CompSig).toFixed(1) + "%";
            var metricSignClr = getFontColorBasedOnStatValue(parseFloat(subListV.CompSig).toFixed(1));

            situtnBodyhtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(parentV.MetricParentName.toLowerCase()) + '">';
            var isChecked = subListV.DefaultMetric == true ? 'checked' : 'unchecked';
            var addClassForactiveChkBx = isChecked == 'checked' ? 'chkBx_active' : 'chkBx_deactive';
            var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';
            if (subListI == (Math.round(defaultMetricLenght) - 1)) {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">';
                situtnBodyhtml += '<div class="tbl-algn fontForMetrics tbl-algncheckbx">' + subListV.MetricParentName + '</div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            }
            else {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">  <div class="tbl-algn fontForMetrics"></div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn tbl-algn-left fontForMetrics">' + subListV.MetricName + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn fontblue fontForMetrics">' + metricPercentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricParentName) + ' ' + metricSignClr + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-algn fontForMetrics">' + CompPercentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '</tr>';
        });
    });
    situtnBodyhtml += '</tbody></table><div id="scrollableTable"></div>';
    $('.table-bottomlayer').html(situtnBodyhtml);
    //Body Part -- End

    var heightBottomlayer;
    heightBottomlayer = $(".table-bottomlayer").height() - 48;
    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: heightBottomlayer,
        pinnedRows: 1,
        pinnedCols: 2,
        container: "#scrollableTable",
        removeOriginal: true
    };// tbl - data - expan - collapse
    $("#flexi-table").tablescroller(options);

    setWidthforTableColumns1();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2)
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

    //added by Nagaraju D for table scroll dynamic height
    SetTableResolution();
    var topheaderhght = $('.report-sitn-output-header').height() + $('.report-sitn-output-header').height();
    $(".table-bottomlayer").css("height", "calc(100% - " + topheaderhght + ")");
    $(".scrollable-columns-table .tbl-dta-metricsHding, .scrollable-data-table .tbl-dta-td,.corner-table .tbl-dta-metricsHding, .scrollable-rows-table .tbl-dta-td").css("width", "100%");
    $(".corner-table, .corner-frame").height($(".scrollable-columns-table tr").height());
    var headerHeight = $(".scrollable-columns-table tr").height();
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr").css("height", headerHeight);

    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    SetScrollForSARModule($("#scrollableTable .scrollable-data-frame"), "#393939", 2, 1, 0, -8, 8, true);
    if (selectedmeasureId.toString() != "22" && selectedmeasureId.toString() != "23" && selectedmeasureId.toString() != "16" && selectedmeasureId.toString() != "17")
        setTableHeightForSAR();
    if (selectedmeasureId.toString() != "23") {
        $(".corner-frame .tbl-dta-metricsHding").css("height", headerHeight);
        $(".corner-frame .emptydiv").css("height", headerHeight);
    }
}

var getFairSharAnalysiTableStruct = function (bindSituationData) {
    let clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
    let clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
    let cssForUseDirectinally = "";
    let cssForUseDirectnlyyCircle = "";
    let cssForUseDirectnlytd = "";
    let statValueColor = "";
    let situtnHeadhtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    //Header Part -- Start
    situtnHeadhtml += '<thead><tr class="tbl-dta-rows">';
    var benchMarkNameforSit = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    let columns = ["Metrics", "Sub Metrics", benchMarkNameforSit];


    $.each(competitorsList, function (i, v) {
        columns.push(v.MeasureName);
    });
    $.each(columns, function (colI, colV) {
        if (colI == 0) {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    situtnHeadhtml += '</tr>';
    situtnHeadhtml += '</thead>';
    //Header Part --  End
    //var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';
    //Body Part -- Start   
    situtnBodyhtml = situtnHeadhtml + '<tbody>';
    var defaultMetricLenght = bindSituationData.length > 1 ? bindSituationData.length / 2 : bindSituationData.length;
    $.each(bindSituationData, function (parentI, parentV) {
        var i = 0;
        var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == parentI ? 'tbl-dta-btmblueclr' : '';
        situtnBodyhtml += '<tr class="tbl-dta-rows dataShow">';
        if (parentI == (Math.round(defaultMetricLenght) - 1)) {
            situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">';
            situtnBodyhtml += '<div class="tbl-algn fontForMetrics tbl-algncheckbx">' + "Establishment Imageries" + '</div><div class="' + isBottomBlueclr + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        }
        else {
            situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">  <div class="tbl-algn fontForMetrics"></div><div></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        }

        situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricName) + '_hide">';
        situtnBodyhtml += '<div class="tbl-algn tbl-algn-left  fontForMetrics tbl-algncheckbx">' + parentV.MetricName + '</div><div><div class="tbl-data-btmbrd "></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></div></td>';
        situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        $.each(parentV.situationAnalysisData, function (subListI, subListV) {
            var metricPercentage = "", CompPercentage = "";

            if (subListV.DeviationValue == 999)
                metricPercentage = "NA";
            else
                metricPercentage = subListV.DeviationValue == null ? "NA" : parseFloat(subListV.DeviationValue).toFixed(1) + "%";

            var metricSignClr = 0;
            if (selectedmeasureId == "24") {
                if (subListV.DeviationValue == 999)
                    metricSignClr = "";
                else
                    metricSignClr = getFontColorBasedOnDevitationValue(parseFloat(subListV.DeviationValue).toFixed(1));
            }
            else if (selectedmeasureId == "23")
                metricSignClr = getSignColor(subListV.SignificanceColorFlag);
            else
                metricSignClr = "";
            var isChecked = subListV.DefaultMetric == true ? 'checked' : 'unchecked';
            var addClassForactiveChkBx = isChecked == 'checked' ? 'chkBx_active' : 'chkBx_deactive';
            var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';



            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.EstablishmentName) + ' ' + metricSignClr + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">' + metricPercentage + '</div><div class="tbl-data-btmbrd "></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        });
        situtnBodyhtml += '</tr>';
    });
    situtnBodyhtml += '</tbody></table><div id="scrollableTable"></div>';
    $('.table-bottomlayer').html(situtnBodyhtml);
    //Body Part -- End

    var heightBottomlayer;
    heightBottomlayer = $(".table-bottomlayer").height() - 48;
    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: heightBottomlayer,
        pinnedRows: 1,
        pinnedCols: 4,
        container: "#scrollableTable",
        removeOriginal: true
    };// tbl - data - expan - collapse
    $("#flexi-table").tablescroller(options);

    setWidthforTableColumns1();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2)
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

    //added by Nagaraju D for table scroll dynamic height
    SetTableResolution();
    $(".scrollable-columns-table .tbl-dta-metricsHding, .scrollable-data-table .tbl-dta-td,.corner-table .tbl-dta-metricsHding, .scrollable-rows-table .tbl-dta-td").css("width", "100%");
    $(".corner-table, .corner-frame").height($(".scrollable-columns-table tr").height());
    var headerHeight = $(".scrollable-columns-table tr").height();
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr").css("height", headerHeight);

    $(".corner-frame, .scrollable-rows-frame").css("width", "52%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "45.4%");
    $(".scrollable-columns-frame .tbl-dta-metricsHding, .scrollable-data-frame .tbl-dta-td").css("min-width", "150px");
    //$(".scrollable-columns-frame .tbl-dta-metricsHding:nth-child(1), .scrollable-data-frame .tbl-dta-td:nth-child(1)").css("min-width", "0px");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(1),.scrollable-rows-frame .tbl-dta-td:nth-child(1)").css("width", "35%");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(1),.scrollable-rows-frame .tbl-dta-td:nth-child(1)").css("min-width", "90px");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(3),.scrollable-rows-frame .tbl-dta-td:nth-child(3)").css("min-width", "200px");
    $(".corner-frame .tbl-dta-metricsHding").css("height", headerHeight);
    $(".corner-frame .emptydiv").css("height", headerHeight);

    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    SetScrollForSARModule($("#scrollableTable .scrollable-data-frame"), "#393939", 0, 1, 2, -8, 8, true);
}

var getPreceptionTableStruct = function (bindSituationData) {
    let clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
    let clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
    let cssForUseDirectinally = "";
    let cssForUseDirectnlyyCircle = "";
    let cssForUseDirectnlytd = "";
    let statValueColor = "";
    let situtnHeadhtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    //Header Part -- Start
    situtnHeadhtml += '<thead><tr class="tbl-dta-rows">';
    var benchMarkNameforSit = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    let columns = ["Metrics", "Sub Metrics", "Lift"];

    $.each(columns, function (colI, colV) {
        if (colI == 0) {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    situtnHeadhtml += '</tr>';
    situtnHeadhtml += '</thead>';
    //Header Part --  End
    //var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';
    //Body Part -- Start   
    situtnBodyhtml = situtnHeadhtml + '<tbody>';
    var defaultMetricLenght = bindSituationData.length > 1 ? bindSituationData.length / 2 : bindSituationData.length;
    $.each(bindSituationData, function (parentI, parentV) {
        var i = 0;
        situtnBodyhtml += '<tr class="tbl-dta-rows dataShow">';

        var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == parentI ? 'tbl-dta-btmblueclr' : '';
        if (parentI == (Math.round(defaultMetricLenght) - 1)) {
            situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class = "tbl-checkboxParentName">';
            situtnBodyhtml += '</div>  <div class="tbl-algn fontForMetrics tbl-algncheckbx">' + "Establishment Imageries" + '</div><div></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        }
        else {
            situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">  <div class="tbl-algn fontForMetrics"></div><div></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        }

        situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(parentV.MetricName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricName) + '_hide">';
        situtnBodyhtml += '<div class="tbl-algn tbl-algn-left fontForMetrics tbl-algncheckbx">' + parentV.MetricName + '</div><div><div class="tbl-data-btmbrd "></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></div></td>';
        situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        $.each(parentV.situationAnalysisData, function (subListI, subListV) {
            var metricPercentage = "", CompPercentage = "";
            metricPercentage = subListV.DeviationValue == null ? "NA" : parseFloat(subListV.DeviationValue).toFixed(1) + "%";

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.EstablishmentName) + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.EstablishmentName) + '_hide"><div class="tbl-algn fontForMetrics">' + subListV.DeviationValue + '</div><div class="tbl-data-btmbrd "></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.EstablishmentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
        });
        situtnBodyhtml += '</tr>';
    });
    situtnBodyhtml += '</tbody></table><div id="scrollableTable"></div>';
    $('.table-bottomlayer').html(situtnBodyhtml);
    //Body Part -- End

    var heightBottomlayer;
    heightBottomlayer = $(".table-bottomlayer").height() - 48;
    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: heightBottomlayer,
        pinnedRows: 1,
        pinnedCols: 2,
        container: "#scrollableTable",
        removeOriginal: true
    };// tbl - data - expan - collapse
    $("#flexi-table").tablescroller(options);

    setWidthforTableColumns1();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2)
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

    //added by Nagaraju D for table scroll dynamic height
    SetTableResolution();
    $(".scrollable-columns-table .tbl-dta-metricsHding, .scrollable-data-table .tbl-dta-td,.corner-table .tbl-dta-metricsHding, .scrollable-rows-table .tbl-dta-td").css("width", "100%");
    $(".corner-table, .corner-frame").height($(".scrollable-columns-table tr").height());
    var headerHeight = $(".scrollable-columns-table tr").height();
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr").css("height", headerHeight);

    $(".corner-frame, .scrollable-rows-frame").css("width", "17%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "82.4%");
    $(".scrollable-columns-frame .tbl-dta-metricsHding, .scrollable-data-frame .tbl-dta-td").css("min-width", "150px");
    $(".scrollable-columns-frame .tbl-dta-metricsHding:nth-child(1), .scrollable-data-frame .tbl-dta-td:nth-child(1)").css("min-width", "300px");

    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    SetScrollForSARModule($("#scrollableTable .scrollable-data-frame"), "#393939", 0, 1, 0, -8, 8, true);
}

var getBestInClassFairShareTableStruct = function (bindSituationData) {
    let clsforEstFreqncy = 'clsforEstFreqncy_rowscolr';
    let clsforEstFreqncy_Borderbtm = 'clsforEstFreqncy_Borderbtm';
    let cssForUseDirectinally = "";
    let cssForUseDirectnlyyCircle = "";
    let cssForUseDirectnlytd = "";
    let statValueColor = "";
    let situtnHeadhtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
    //Header Part -- Start
    situtnHeadhtml += '<thead><tr class="tbl-dta-rows">';
    var benchMarkNameforSit = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    let columns = ['Metrics', 'Sub Metrics', benchMarkNameforSit, 'Gap vs BIC', 'BIC Establishment', 'BIC Rating'];
    $.each(columns, function (colI, colV) {
        if (colI == 0) {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
        else {
            situtnHeadhtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(colV) + '_hide " >';
            situtnHeadhtml += '<div class="tbl-algn tbl-text-upper">' + colV + '</div></th><th class="emptydiv  ' + removeBlankSpace(colV) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
        }
    });
    situtnHeadhtml += '</tr>';
    situtnHeadhtml += '</thead>';
    //Header Part --  End

    //Body Part -- Start   
    situtnBodyhtml = situtnHeadhtml + '<tbody>';
    $.each(bindSituationData, function (parentI, parentV) {

        var defaultMetricLenght = parentV.situationAnalysisData.length > 1 ? parentV.situationAnalysisData.length / 2 : parentV.situationAnalysisData.length;
        $.each(parentV.situationAnalysisData, function (subListI, subListV) {
            situtnBodyhtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(subListV.MetricParentName.toLowerCase()) + '">';
            var metricPercentage = "", bicCGap = "", bicRating = "", bicSignColor = "", bicSignColorRating = "";
            //, bicSignColorRating="";
            metricPercentage = parseFloat(subListV.MetricPercentage).toFixed(1) + "%";

            

            bicCGap = parseFloat(subListV.BICGap).toFixed(1) + "%";
            bicRating = parseFloat(subListV.BICRating).toFixed(1) + "%";
            bicSignColor = subListV.SignificanceColorFlag;
            if (bicSignColor == "1")
                bicSignColorRating = "green";
            else if (bicSignColor == "2")
                bicSignColorRating = "blue";
            else if (bicSignColor == "3")
                bicSignColorRating = "black";

            var isChecked = subListV.DefaultMetric == true ? 'checked' : 'unchecked';
            var addClassForactiveChkBx = isChecked == 'checked' ? 'chkBx_active' : 'chkBx_deactive';
            var isBottomBlueclr = (parentV.situationAnalysisData.length - 1) == subListI ? 'tbl-dta-btmblueclr' : '';
            if (defaultMetricLenght == 1.5)
                defaultMetricLenght = 1;
            if (subListI == (Math.round(defaultMetricLenght) - 1)) {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class = "tbl-checkboxParentName">';
                situtnBodyhtml += '</div>  <div class="tbl-algn fontForMetrics tbl-algncheckbx">' + subListV.GroupName + '</div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            }
            else {
                situtnBodyhtml += '<td class="tbl-dta-td tble-bluecolor ' + removeBlankSpace(parentV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(parentV.MetricParentName) + '_hide">  <div class="tbl-algn fontForMetrics"></div><div class="' + isBottomBlueclr + '"></div></td>';
                situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(parentV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-algn tbl-algn-left fontForMetrics">' + subListV.MetricName + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-algn fontForMetrics">' + metricPercentage + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.MetricParentName) + ' ' + statValueColor + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-algn fontForMetrics">' + bicCGap + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.MetricParentName) + ' ' + + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-algn fontForMetrics">' + subListV.BICEstablishmentName + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';

            situtnBodyhtml += '<td class="tbl-dta-td ' + removeBlankSpace(subListV.MetricParentName) + ' ' + + ' ' + cssForUseDirectnlytd + ' ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-algn ' + bicSignColorRating + ' fontForMetrics">' + bicRating + '</div><div class="tbl-data-btmbrd ' + isBottomBlueclr + '"></div><div class="tbl-btm-circle ' + cssForUseDirectnlyyCircle + '"></div></td>';
            situtnBodyhtml += '<td class="emptydiv ' + removeBlankSpace(subListV.MetricParentName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            situtnBodyhtml += '</tr>';
        });

    });
    situtnBodyhtml += '</tbody></table><div id="scrollableTable"></div>';
    $('.table-bottomlayer').html(situtnBodyhtml);
    //Body Part -- End

    var heightBottomlayer;
    heightBottomlayer = $(".table-bottomlayer").height() - 48;
    var options = {
        width: $(".table-bottomlayer").width() - 25,
        height: heightBottomlayer,
        pinnedRows: 1,
        pinnedCols: 4,
        container: "#scrollableTable",
        removeOriginal: true
    };// tbl - data - expan - collapse
    $("#flexi-table").tablescroller(options);

    setWidthforTableColumns1();//set Dynamic width based on selections
    setMaxHeightForHedrTble();
    $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
    $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
    $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2);
    var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();

    //added by Nagaraju D for table scroll dynamic height
    SetTableResolution();
    $(".scrollable-columns-table .tbl-dta-metricsHding, .scrollable-data-table .tbl-dta-td,.corner-table .tbl-dta-metricsHding, .scrollable-rows-table .tbl-dta-td").css("width", "100%");

    var headerHeight = $(".scrollable-columns-table tr").height();
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr").css("height", headerHeight);

    $(".corner-frame, .scrollable-rows-frame").css("width", "52%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "45.4%");

    $(".scrollable-columns-frame .tbl-dta-metricsHding, .scrollable-data-frame .tbl-dta-td").css("min-width", "150px");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(1),.scrollable-rows-frame .tbl-dta-td:nth-child(1)").css("width", "35%");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(1),.scrollable-rows-frame .tbl-dta-td:nth-child(1)").css("min-width", "90px");
    $(".corner-frame .tbl-dta-metricsHding:nth-child(3),.scrollable-rows-frame .tbl-dta-td:nth-child(3)").css("min-width", "200px");
    $(".corner-frame .tbl-dta-metricsHding").css("height", headerHeight);
    $(".corner-frame .emptydiv").css("height", headerHeight);
    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    SetScrollForSARModule($("#scrollableTable .scrollable-data-frame"), "#393939", 0, 1, 2, -8, 8, true);

}


var valideateLeftPanelForSitn = function () {
    if ($(".Establishment_topdiv_element .sel_text").length == 0) {
        deleteCompetitorWholeList();
        clearOutputAreaWhenEstCustmBsChanges();
        showMaxAlert("Please Select 1 Main Establishment/Channel and        2 Comparison Establishment/Channel"); return false;
    }
    else if ($('.Establishment_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=CustomBase]').length == 0) {
        deleteCompetitorWholeList();
        clearOutputAreaWhenEstCustmBsChanges();
        showMaxAlert("Please Select 2 Comparison Establishment/Channel"); return false;
    }
    else if ($('.Establishment_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=CustomBase]').length < 2) {
        //deleteCompetitorWholeList();
        clearOutputAreaWhenEstCustmBsChanges();
        showMaxAlert("Please Select 2 Comparison Establishment/Channel"); return false;

    }
        //else if ($(".Competitors_topdiv_element .sel_text").length < 4) {
        //    clearOutputAreaWhenEstCustmBsChanges();
        //    showMaxAlert("Please Select min of 5 competitive set"); return false;
        //}
    else if (competitorsList.length > 20 && controllername == "situationassessmentreport") {
        showMaxAlert("You can select a min of 5 and max of 20 competitors");
        return false;
    }
    else if (competitorsList.length < 5 && controllername == "situationassessmentreport") {
        showMaxAlert("You can select a min of 5 and max of 20 competitors");
        return false;
    }
    //
    return true;
}

//set Dynamic width based on selections in Table 
var setWidthforTableColumns1 = function () {
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
}

var checkSampleSizeForSituation = function () {

    if (isDefaultLoadSitnReport) {
        if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele_active").find(".lft-popup-ele-label").text() == "") {
            defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits"
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
            isDefaultLoadSitnReport = false;

        }
    }
    else if (!isDefaultLoadSitnReport && !isFrequencyChangedForSitn && !isdemogChangedForSitn && !isVisitsSelected) {
        defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        var selectedParentId = $('.subMeasureName.subMeasureName_active').attr("parent-id");
        if (selectedParentId == 1) {
            isFrequencyChangedFor_CoreGuest = true;
            stickySelectedFreqcyFor_CoreGuest = defaultFrequencyNameForSitn;
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)")
                isstickySelectionVisit = true;
            else
                isstickySelectionVisit = false;
        }
    }
    else if (!isDefaultLoadSitnReport && !isFrequencyChangedForSitn && !isdemogChangedForSitn && isVisitsSelected) {
        if (isPreviousParentId == "4" || isPreviousParentId == "3") {
            defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
        }
        else {
            defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
        }
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);

    }
    if (prepareReportFilter() == false)
        return;
    isDefaultLoadSitnReport = false;

    callSampleSizeMethod();
}

var callSampleSizeMethod = function () {

    $(".loader,.transparentBG").show();
    let modulename = 'situationassessmentreport';
    var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
    var filterPanelInfo = { filter: filterPanelInfoData.filter, module: modulename };
    isFromMSS = false;
    $.ajax({
        url: appRouteUrl + "report/sampleSizeValidator",
        data: JSON.stringify(filterPanelInfo),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            $(".stat-popup").hide(); $(".transparentBG").hide();
            $(".loader").hide();
            //sabat
            response.forEach(function (i, v) {
                if (i.IsUseDirectional == "MSS") {
                    isFromMSS = true;
                }
            });
            response.filter(x => x.IsUseDirectional === 'MSS').forEach(x => response.splice(response.indexOf(x), 1));
            /*if (isFromMSS) {
                frequencyUpdateInStickyVaribales();
                if (selectedmeasureId == "")
                    bindSituationReport(situationMetricList);
                else
                    selectMeasure(selectedmeasureId);
                return;
            }
            isFromMSS = false;*/
            //sabat
            totalVisitsLSS = [];
            response.forEach(function (i, v) {
                if (i.IsUseDirectional == "TotalVisitsLSS") {
                    totalVisitsLSS.push({ "EstablishmentId": i.EstablishmentId, "EstName": i.EstName })
                    //response.remove(v);
                }
            });

            response.filter(x => x.IsUseDirectional === 'TotalVisitsLSS').forEach(x => response.splice(response.indexOf(x), 1));
            //To do
            if (response.length == 0 && totalVisitsLSS.length == 0) {
                if (isFromQuickDownloadSitn) {
                    showColorPallatePpup();
                }
                else {
                    frequencyUpdateInStickyVaribales();
                    //isSampleSizeValidated = 1;
                    if (selectedmeasureId == "")
                        bindSituationReport(situationMetricList);
                    else {
                        if (valideateLeftPanelForSitn() == false) return;
                        selectMeasure(selectedmeasureId);

                    }
                }
            } else
                showPopupOfUseDirectionandLSS(response);

        },
        error: function () {
            $(".loader").hide();
            $(".transparentBG").hide();
            ajaxError
        }
    });

}
var callSampleSizeMethodPromise = function (resolve, reject) {
    $(".loader,.transparentBG").show();
    let modulename = 'situationassessmentreport';
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
            //to check Visit Sample size and push to separate array and show in popup
            totalVisitsLSS = [];
            response.forEach(function (i, v) {
                if (i.IsUseDirectional == "TotalVisitsLSS") {
                    totalVisitsLSS.push({ "EstablishmentId": i.EstablishmentId, "EstName": i.EstName })
                    //response.remove(v);
                }
            });

            response.filter(x => x.IsUseDirectional === 'TotalVisitsLSS').forEach(x => response.splice(response.indexOf(x), 1));
            //

            //To do
            if (response.length == 0) {
                if (isFromQuickDownloadSitn) {
                    showColorPallatePpup();
                }
                else {
                    frequencyUpdateInStickyVaribales();
                    //isSampleSizeValidated = 1;
                    if (selectedmeasureId == "")
                        bindSituationReport(situationMetricList);
                    else {
                        if (valideateLeftPanelForSitn() == false) return;
                        selectMeasure(selectedmeasureId);

                    }
                }
            } else
                showPopupOfUseDirectionandLSS(response);
            resolve();

        },
        error: function () {
            $(".loader").hide();
            $(".transparentBG").hide();
            ajaxError
        }
    });

}


var showPopupOfUseDirectionandLSS = function (response) {
    var useDirectnPpupBindHtml = ""; var isEstMainHdrAdded = false, isCompttrMainHdrAdded = false; var appendPrevsPrd = "";
    $(".list-of-nulls-sitn").html("");
    response.forEach(function (d, i) {
        if (d.IsUseDirectional == "LSS") {
            if ((d.SelectionType == "BenchMark" || d.SelectionType == "CustomBase") && !isEstMainHdrAdded) {
                useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Main Establishment/Channel</div>";
                isEstMainHdrAdded = true;
            }
            else if (d.SelectionType == "Competitors" && !isCompttrMainHdrAdded) {
                useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Competitors</div>";
                isCompttrMainHdrAdded = true;
            }
            if (d.TimePeriodType != "Current TimePeriod")
                appendPrevsPrd = " - " + d.TimePeriodType;
            else
                appendPrevsPrd = "";
            useDirectnPpupBindHtml += "<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div data-id=" + d.EstablishmentId + " parent-text=" + d.SelectionType + " class='stat-cust-estabmt popup1'>" + d.EstName + appendPrevsPrd + "</div></div>";
        }
        //if (d.IsUseDirectional == "TotalVisitsLSS" && !isTotalVisitsLSSMainHdrAdded) {
        //    useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Total Visits</div>";
        //    isTotalVisitsLSSMainHdrAdded = true;
        //}
        //else if (isTotalVisitsLSSMainHdrAdded) {
        //    useDirectnPpupBindHtml += "<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div data-id=" + d.EstablishmentId + " parent-text=" + d.SelectionType + " class='stat-cust-estabmt popup1'>" + d.EstName + appendPrevsPrd + "</div></div>";
        //}

    });
    $(".list-of-nulls-sitn").append(useDirectnPpupBindHtml);

    //Use Directional Popup Added by Bramhanath(25-10-2017)
    $(".list-of-nulls-userdirctnl-sitn").html("");
    useDirectnPpupBindHtml = ""; isEstMainHdrAdded = false, isCompttrMainHdrAdded = false, isTotalVisitsMainHdrAdded = false;
    response.forEach(function (d, i) {
        if (d.IsUseDirectional == "Directional") {
            if ((d.SelectionType == "BenchMark" || d.SelectionType == "CustomBase") && !isEstMainHdrAdded) {
                useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Main Establishment/Channel</div>";
                isEstMainHdrAdded = true;
            }
            else if (d.SelectionType == "Competitors" && !isCompttrMainHdrAdded) {
                useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Competitors</div>";
                isCompttrMainHdrAdded = true;
            }
            if (d.TimePeriodType != "Current TimePeriod")
                appendPrevsPrd = " - " + d.TimePeriodType;
            else
                appendPrevsPrd = "";
            useDirectnPpupBindHtml += "<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div data-id=" + d.EstablishmentId + " parent-text=" + d.SelectionType + " class='stat-cust-estabmt popup1'>" + d.EstName + appendPrevsPrd + "</div></div>";
        }
    });
    $(".list-of-nulls-userdirctnl-sitn").append(useDirectnPpupBindHtml);
    //

    if (response.length == 0) {
        isTotalVisitsMainHdrAdded = false;
        $(".list-of-nulls-vistsampless-sitn").html("");
        totalVisitsLSS.forEach(function (i, v) {
            if (!isTotalVisitsMainHdrAdded) {
                useDirectnPpupBindHtml += "<div class='estmtchannelmainheader'>Competitors</div>";
                isTotalVisitsMainHdrAdded = true;
            }
            useDirectnPpupBindHtml += "<div class='stat-custdiv' style='pointer-events:none'><div class='stat-cust-dot'></div><div data-id=" + i.EstablishmentId + " class='stat-cust-estabmt popup1'>" + i.EstName + "</div></div>";

        });
        $(".list-of-nulls-vistsampless-sitn").append(useDirectnPpupBindHtml);
    }
    if ($(".list-of-nulls-sitn").find(".stat-custdiv").length > 0 && $(".list-of-nulls-userdirctnl-sitn").find(".stat-custdiv").length == 0) {
        if ($(".list-of-nulls-sitn").find(".stat-custdiv").length < $(".filter-info-panel-elements .Establishment_topdiv_element .sel_text").length) {
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

    $(".save-proceed-btn-visitss").hide();
    if ($(".list-of-nulls-sitn").find(".stat-custdiv").length > 0 && !isFromLSSPppSAR) {
        $(".null-error-popup-sitn").show();
        $(".null-error-popup-userdirctnl-sitn").hide();
        $(".null-error-popup-vistsampless-sitn").hide();
    }
    else if ($(".list-of-nulls-userdirctnl-sitn").find(".stat-custdiv").length > 0) {
        $(".null-error-popup-sitn").hide();
        $(".save-proceed-btn").css("visibility", "visible");
        $(".save-proceed-btn").css("margin-left", "25px");
        $(".null-error-popup-userdirctnl-sitn").show();
        $(".null-error-popup-vistsampless-sitn").hide();
    }
    else if ($(".null-error-popup-vistsampless-sitn").find(".stat-custdiv").length > 0) {
        $(".null-error-popup-vistsampless-sitn").show();
        $(".save-proceed-btn-visitss").show();
        $(".save-proceed-btn-visitss").css("visibility", "visible");
        $(".null-error-popup-userdirctnl-sitn").hide();
    }
    $(".proceed-text").html('');
    //
    return;

}
var benchMarkBind = function (ele) {
    benchMarkId = '', customBaseselctHtml = "";;
    if (defaultEstCustomBaseSelctnsList.indexOf($(ele).attr('data-val')) > -1 && $(ele).parent().attr("parent-of-parent") == "BenchMark")
        isdefaultEstCustomBaseSelections = true;
    if (isdefaultEstCustomBaseSelections)
        bindDefaultEstandCompSelection(ele);
    else {

        if (establishmentSelectedCount == 0) {
            $(".competitrselctedList").html(''); competitorsList = []; $('.master-lft-ctrl.Competitors .lft-ctrl-txt-lbl').remove();
            $('.master-lft-ctrl.Competitors').find('.lft-ctrl-txt').attr("data-ids", "");
            $('.Competitors_topdiv_element').remove();
            $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=Competitors]').removeClass('lft-popup-ele_active');
            var benchMarkName = $(ele).attr("data-val");
            benchMarkId = $(ele).attr("data-id");
            var benchMarkParentText = $(ele).attr("parent-text");
            var benchMarkParentId = $(ele).attr("data-parent");
            //custombase selections
            var ele = $(".master-lft-ctrl[data-val='Establishment']");
            isBenchMarkSelected = false; isCustomBaseAdded = false
            customBaseParentId1 = $('.lft-popup-ele-label[data-val="' + benchMarkParentText + '"]').parent('div[parent-of-parent=CustomBase]').children("span[data-isselectable='true']").attr('data-id');
            var customBaseParentText1 = benchMarkParentText;
            //$('.lft-popup-ele-label[data-val="' + benchMarkParentText + '"]').parent('div[parent-of-parent=CustomBase]').children("span[data-isselectable='true']").attr('parent-text');
            customBaseParentId2 = $('.lft-popup-ele-label[data-id="' + customBaseParentId1 + '"]').parent('div[parent-of-parent=CustomBase]').children("span[data-isselectable='true']").attr('data-parent');
            var customBaseParentText2 = $('.lft-popup-ele-label[data-id="' + customBaseParentId2 + '"]').parent('div[parent-of-parent=CustomBase]').children("span[data-isselectable='true']").attr("data-val");
            $('.benchMarkselcted').html(''), $('.customBaseselcted').html(''); customBaseList = [];
            var benchMarkselctHtml = "", customBaseselctHtml = "";
            benchMarkselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
            benchMarkselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
            benchMarkselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + benchMarkId + "'> " + benchMarkName + " </span>";
            benchMarkselctHtml += "<span class='lft-popup-ele-next'  data-id='" + benchMarkId + "'>";
            benchMarkselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
            $(".benchMarkselcted").append(benchMarkselctHtml);
            $(".benchMarkselcted").show();
            $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[1]).after($(".benchMarkselcted"));

            customBaseList.push({ "customBaseParentId": customBaseParentId1, "customBaseParentText": customBaseParentText1 });
            customBaseList.push({ "customBaseParentId": customBaseParentId2, "customBaseParentText": customBaseParentText2 });
            //Custombase binding
            for (var i = 1; i < 3 ; i++) {
                customBaseselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
                customBaseselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
                customBaseselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + eval("customBaseParentId" + i) + "'> " + eval("customBaseParentText" + i) + " </span>";
                customBaseselctHtml += "<span class='lft-popup-ele-next-sitn'  data-id='" + eval("customBaseParentId" + i) + "'>";
                customBaseselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
            }
            $(".customBaseselcted").append(customBaseselctHtml);
            $(".customBaseselcted").show();
            $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[3]).after($(".customBaseselcted"));
            //
            establishmentSelectedCount++;
            isreportestablishmentChanged = true;
        }
        var ele = $(".master-lft-ctrl[data-val='Establishment']");
        if (establishmentSelectedCount == 1) {//custombase selections
            establishmentSelectedCount++;
            isComptitorDefaultSelect = true;
            $(ele).find(".lft-popup-ele-label[data-id=" + customBaseParentId1 + "]").parent('div[parent-of-parent=CustomBase]').children('.lft-popup-ele-label').first().click();
        }
        if (establishmentSelectedCount == 2) {
            var ele = $(".master-lft-ctrl[data-val='Establishment']");
            establishmentSelectedCount++; isComptitorDefaultSelect = true;
            getCompetitorsList();
            $(ele).find(".lft-popup-ele-label[data-id=" + customBaseParentId2 + "]").parent('div[parent-of-parent=CustomBase]').children('.lft-popup-ele-label').first().click();
        }
        //

    }

    clearOutputAreaWhenEstCustmBsChanges();
}
var deleteCustomBaseifBenchmMarkZero = function () {

    //custombase selections
    if (isCustomBaseDeletedCount == 0) {
        isCustomBaseDeletedCount++;
        $('.topdiv_element .filter-info-panel-lbl[data-id=' + customBaseParentId1 + ']').find('.filter-info-panel-txt-del').click();
    }
    if (isCustomBaseDeletedCount == 1) {
        isCustomBaseDeletedCount++;
        $('.topdiv_element .filter-info-panel-lbl[data-id=' + customBaseParentId2 + ']').find('.filter-info-panel-txt-del').click();
    }
    customBaseParentId1 = "", customBaseParentId2 = "";
    establishmentSelectedCount = 0;
    defaultEstCustomBaseSelections = 0;
    $('.benchMarkselcted').html(''), $('.customBaseselcted').html('');

}

var getCompetitorsList = function () {
    let selectedBenchMarkList = $(".master-lft-ctrl[data-val='Establishment'] .lft-popup-ele_active");
    let selectedBenchMarkId = "";
    isBenchMarkSelectedNew = false; isCompetitorLoop = true;
    $.each(selectedBenchMarkList, function (i, v) {
        if ($($(v)[0]).attr("parent-of-parent") == "BenchMark")
            selectedBenchMarkId = $($(v)[0]).find(".lft-popup-ele-label").attr('data-id');
    });
    var selctedCompetitorsList = "";
    $('.competitrselctedList').html('');

    $.ajax({
        url: appRouteUrl + "Report/GetCompetitorsList",
        data: { selectedBenchMarkId: selectedBenchMarkId },
        method: "POST",
        contenttype: "application/json",
        async: false,
        success: function (data) {
            competitorsList = data;
            var eleComptitors = $(".master-lft-ctrl[data-val='Competitors']");
            addCompetitorsNameIdByDefaultSelections(competitorsList);
            isComptitorDefaultSelect = false;
        },
        error: function ()
        { }
    });
    isCompetitorLoop = false;
    $(".competitrselctedList").show();
    $('.master-lft-ctrl.Competitors').find('.lft-popup-col1').append($(".competitrselctedList"));


}
var bindCompetitorsListWhenDeleted = function (key) {
    var index = 0;
    $(competitorsList).each(function (id, value) {
        if (value.MeasureId == eval($(key).attr('data-id'))) {
            index = id;
            return true;
        }
    });
    competitorsList.splice(index, 1);
    $(".competitrselctedList").html('');
    var selctedCompetitorsList = "";
    $.each(competitorsList, function (selI, selV) {
        selctedCompetitorsList += "<div class='lft-popup-ele-sitn margintp'>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-img-sitn'></span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-sitn' data-id='" + selV.MeasureId + "'> " + selV.MeasureName + " </span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-next-sitn'  data-id='" + selV.MeasureId + "'>";
        selctedCompetitorsList += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
    });
    $(".competitrselctedList").append(selctedCompetitorsList);
    $(".competitrselctedList").show();
    $('.master-lft-ctrl.Competitors').find('.lft-popup-col1').append($(".competitrselctedList"));

}
var bindCompetitorsListWhenAdded = function (key) {
    $(".competitrselctedList").html('');
    var obj = { "MeasureId": eval((key).attr('data-id')), "MeasureName": (key).attr('data-val'), "MeasureParentName": null, "ParentId": null, ToolOrderby: 0 };
    competitorsList.push(obj);
    var selctedCompetitorsList = "";
    $.each(competitorsList, function (selI, selV) {
        selctedCompetitorsList += "<div class='lft-popup-ele-sitn margintp'>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-img-sitn'></span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-sitn' data-id='" + selV.MeasureId + "'> " + selV.MeasureName + " </span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-next-sitn'  data-id='" + selV.MeasureId + "'>";
        selctedCompetitorsList += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
    });
    $(".competitrselctedList").append(selctedCompetitorsList);
    $(".competitrselctedList").show();
    $('.master-lft-ctrl.Competitors').find('.lft-popup-col1').append($(".competitrselctedList"));
}

var bindCustomBaseListWhenAdded = function (key) {
    $('.customBaseselcted').html('');
    var customBaseselctHtml = "";
    var obj = { "customBaseParentId": eval((key).attr('data-id')), "customBaseParentText": (key).attr('data-val') };
    if (customBaseList.length < 2)
        customBaseList.push(obj);

    //Custombase binding
    $.each(customBaseList, function (selI, selV) {
        customBaseselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
        customBaseselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
        customBaseselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + selV.customBaseParentId + "'> " + selV.customBaseParentText + " </span>";
        customBaseselctHtml += "<span class='lft-popup-ele-next-sitn'  data-id='" + selV.customBaseParentId + "'>";
        customBaseselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
    });
    $(".customBaseselcted").append(customBaseselctHtml);
    $(".customBaseselcted").show();
    $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[3]).after($(".customBaseselcted"));
    //
    //deleteCompetitorWholeList();
    isreportestablishmentChanged = true;
}
var bindCustomBaseListWhenDeleted = function (key) {
    $('.customBaseselcted').html('');
    var customBaseselctHtml = "";
    var index = 0;
    $(customBaseList).each(function (id, value) {
        if (value.customBaseParentId == eval($(key).attr('data-id'))) {
            index = id;
            return true;
        }
    });
    customBaseList.splice(index, 1);

    //Custombase binding
    $.each(customBaseList, function (selI, selV) {
        customBaseselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
        customBaseselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
        customBaseselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + selV.customBaseParentId + "'> " + selV.customBaseParentText + " </span>";
        customBaseselctHtml += "<span class='lft-popup-ele-next-sitn'  data-id='" + selV.customBaseParentId + "'>";
        customBaseselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
    });
    $(".customBaseselcted").append(customBaseselctHtml);
    $(".customBaseselcted").show();
    $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[3]).after($(".customBaseselcted"));
    //
    clearOutputAreaWhenEstCustmBsChanges();
    isCustomBaseDeleted = false;
}

var bindbenchMarkBindWhenDeleted = function (key) {
    $('.benchMarkselcted').html(''); $('.customBaseselcted').html(''); $(".competitrselctedList").html('');
    customBaseList = []; competitorsList = []; benchMarkId = '';
    $('.master-lft-ctrl.Establishment').find('.lft-ctrl-txt').attr("data-ids", "");
    $('.master-lft-ctrl.Competitors .lft-ctrl-txt-lbl').remove();
    $('.master-lft-ctrl.Competitors').find('.lft-ctrl-txt').attr("data-ids", "");
    $('.Establishment_topdiv_element').remove(); $('.Competitors_topdiv_element').remove();
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=BenchMark]').removeClass('lft-popup-ele_active');
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=CustomBase]').removeClass('lft-popup-ele_active');
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=Competitors]').removeClass('lft-popup-ele_active');
    establishmentSelectedCount = 0, defaultEstCustomBaseSelections = 0; isEstdeleted = false;
    isComptitorDefaultSelect = true;
    clearOutputAreaWhenEstCustmBsChanges();
}

var deleteCompetitorWholeList = function () {
    //$('.competitrselctedList .lft-popup-ele-next-sitn').each(function (i, v) {
    //    var selectedId = $(v).attr('data-id');
    //    $('.topdiv_element .filter-info-panel-lbl[data-id=' + selectedId + ']').find('.filter-info-panel-txt-del').click();
    //});
    $(".competitrselctedList").html(''); competitorsList = [];
    $('.master-lft-ctrl.Competitors .lft-ctrl-txt-lbl').remove();
    $('.master-lft-ctrl.Competitors').find('.lft-ctrl-txt').attr("data-ids", "");
    $('.Competitors_topdiv_element').remove();
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=Competitors]').removeClass('lft-popup-ele_active');
    if ($('.competitrselctedList .lft-popup-ele-next-sitn').length == 0)
        isCustomBaseDeletedCount = 0;
    isComptitorDefaultSelect = false;
}

var bindNewBenchMarkDeleteOldList = function (key) {
    $('.benchMarkselcted').html(''); $('.customBaseselcted').html(''); $(".competitrselctedList").html('');
    customBaseList = []; competitorsList = []; benchMarkId = '';
    //$('.master-lft-ctrl.Establishment').find('.lft-ctrl-txt').attr("data-ids", "");
    $('.master-lft-ctrl.Competitors .lft-ctrl-txt-lbl').remove();
    $('.master-lft-ctrl.Competitors').find('.lft-ctrl-txt').attr("data-ids", "");
    $('.Establishment_topdiv_element').remove(); $('.Competitors_topdiv_element').remove();
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=CustomBase]').removeClass('lft-popup-ele_active');
    $('.lft-popup-ele.lft-popup-ele_active[parent-of-parent=Competitors]').removeClass('lft-popup-ele_active');
    establishmentSelectedCount = 0, defaultEstCustomBaseSelections = 0;
    benchMarkBind(key);
}

var bindDefaultEstandCompSelection = function (key) {
    var selectedId = $(key).attr('data-id');

    var index = 0;
    if (defaultEstCustomBaseSelections == 0) {
        $(defaultEstCustomBaseSelctns).each(function (id, value) {
            if (value.id == eval($(key).attr('data-id'))) {
                index = id;
                return true;
            }
        });
        defaultCustomBaseToBeSelected = defaultEstCustomBaseSelctns[index];
    }
    $(defaultCustomBaseToBeSelected).each(function (id, childValue) {
        $(childValue).each(function (cI, cV) {
            var ele = $(".master-lft-ctrl[data-val='Establishment']");
            isreportestablishmentChanged = true;
            isComptitorDefaultSelect = true;
            isdefaultEstCustomBaseSelections = true;
            isBenchMarkSelected = false;
            isCustomBaseAdded = false;

            if (defaultEstCustomBaseSelections == 0) {
                benchMarkId = $(key).attr('data-id');
                benchMarkName = $(key).attr('data-val');
                defaultEstCustomBaseSelections++;
                $('.benchMarkselcted').html(''), $('.customBaseselcted').html('');
                var benchMarkselctHtml = "", customBaseselctHtml = ""; customBaseList = [];
                benchMarkselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
                benchMarkselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
                benchMarkselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + benchMarkId + "'> " + benchMarkName + " </span>";
                benchMarkselctHtml += "<span class='lft-popup-ele-next'  data-id='" + benchMarkId + "'>";
                benchMarkselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
                $(".benchMarkselcted").append(benchMarkselctHtml);
                $(".benchMarkselcted").show();
                $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[1]).after($(".benchMarkselcted"));
                $(ele).find(".lft-popup-ele-label[data-id=" + cV.childs[0].id + "]").parent('div[parent-of-parent=CustomBase]').children('.lft-popup-ele-label').first().click();
            }
            else if (defaultEstCustomBaseSelections == 1) {
                defaultEstCustomBaseSelections++;
                isBenchMarkSelected = false;
                customBaseParentId1 = cV.childs[0].id;
                var customBaseParentText1 = cV.childs[0].name;
                //$('.lft-popup-ele-label[data-val="' + benchMarkParentText + '"]').parent('div[parent-of-parent=CustomBase]').children("span[data-isselectable='true']").attr('parent-text');
                customBaseParentId2 = cV.childs[1].id;
                var customBaseParentText2 = cV.childs[1].name;
                var customBaseselctHtml = "";

                customBaseList.push({ "customBaseParentId": customBaseParentId1, "customBaseParentText": customBaseParentText1 });
                customBaseList.push({ "customBaseParentId": customBaseParentId2, "customBaseParentText": customBaseParentText2 });
                //Custombase binding
                for (var i = 1; i < 3 ; i++) {
                    customBaseselctHtml += "<div class='lft-popup-ele-sitn margintp'>";
                    customBaseselctHtml += "<span class='lft-popup-ele-label-img-sitn'></span>";
                    customBaseselctHtml += "<span class='lft-popup-ele-label-sitn' data-id='" + eval("customBaseParentId" + i) + "'> " + eval("customBaseParentText" + i) + " </span>";
                    customBaseselctHtml += "<span class='lft-popup-ele-next-sitn'  data-id='" + eval("customBaseParentId" + i) + "'>";
                    customBaseselctHtml += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
                }
                $(".customBaseselcted").append(customBaseselctHtml);
                $(".customBaseselcted").show();
                $($($('.master-lft-ctrl.Establishment').find('.lft-popup-col1')[0]).children()[3]).after($(".customBaseselcted"));
                getCompetitorsList();
                $(ele).find(".lft-popup-ele-label[data-id=" + cV.childs[1].id + "]").parent('div[parent-of-parent=CustomBase]').children('.lft-popup-ele-label').first().click();
            }

            isComptitorDefaultSelect = false;
            isreportestablishmentChanged = true;
            isdefaultEstCustomBaseSelections = false;
            defaultEstCustomBaseSelections = 0;
        });
    });
}
var returnifBenchMarktCompetitorSame = function (key) {
    let compitrId = $(key).parent().find(".lft-popup-ele-label").attr("data-id");
    let benchMarkId = $('.Establishment_topdiv_element').find('.filter-info-panel-lbl[parent-of-parent=BenchMark]').attr('data-id');
    if (compitrId == benchMarkId) {
        showMaxAlert("You cannot make BenchMark and Competitor selection Same");
        return true;;
    }
    return false;
}

var addFrequencyNameIdByDefaultSelections = function (defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn) {
    $(".master-lft-ctrl[data-val='FREQUENCY'").find('.lft-ctrl-txt').attr("data-ids", '{"ID":"' + defaultFreqeuncyIdForSitn + '","Text":"' + defaultFrequencyNameForSitn + '"}');
    $(".master-lft-ctrl[data-val='FREQUENCY'").find('.lft-ctrl-txt').html('');
    $(".master-lft-ctrl[data-val='FREQUENCY'").find('.lft-ctrl-txt').html('<div class="lft-ctrl-txt-lbl" data-val="' + defaultFrequencyNameForSitn + '" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;width:90%">' + defaultFrequencyNameForSitn + '</span><span class="lft-ctrl-txt-del" style="float:right;">&nbsp;</span></div>')
    $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele-label").parent().removeClass('lft-popup-ele_active')
    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='" + defaultFrequencyNameForSitn + "']").parent().removeClass('lft-popup-ele_active').addClass('lft-popup-ele_active');
    if ($(".filter-info-panel-elements [data-val='FREQUENCY']")[0] == undefined)
        $('.filter-info-panel-elements').append('<div class="FREQUENCY_topdiv_element topdiv_element" data-val="FREQUENCY"><span class="pipe"> |&nbsp; </span><div class="filter-info-panel-lbl" data-val="' + defaultFrequencyNameForSitn + '" parent-of-parent="undefined" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;" class="sel_text">' + defaultFrequencyNameForSitn + '</span><span class="filter-info-panel-txt-del" style="float:right;">&nbsp;</span></div></div>');
    else {
        $('.FREQUENCY_topdiv_element.topdiv_element').html('');
        $('.FREQUENCY_topdiv_element.topdiv_element').append('<span class="pipe"> |&nbsp; </span><div class="filter-info-panel-lbl" data-val="' + defaultFrequencyNameForSitn + '" parent-of-parent="undefined" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;" class="sel_text">' + defaultFrequencyNameForSitn + '</span><span class="filter-info-panel-txt-del" style="float:right;">&nbsp;</span></div>');
    }
}

var addCompetitorsNameIdByDefaultSelections = function (competitorList) {

    var selctedCompetitorsList = "", top_element_competitrdiv = "";
    $('.competitrselctedList').html('');
    //$(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').html('');
    //$(".master-lft-ctrl[data-val='Competitors'] .lft-popup-ele-label").parent().removeClass('lft-popup-ele_active');
    top_element_competitrdiv += '<div class="Competitors_topdiv_element topdiv_element" data-val="Competitors"><span class="pipe"> |&nbsp;Competitors :</span>';
    //$('.filter-info-panel-elements').append('<div class="Competitors_topdiv_element topdiv_element" data-val="Competitors"><span class="pipe"> |&nbsp; </span>');
    var selectedeleids = [];
    $.each(competitorList, function (selI, selV) {
        //$(eleComptitors).find(".lft-popup-ele-label[data-id=" + selV.MeasureId + "]").first().click();
        selctedCompetitorsList += "<div class='lft-popup-ele-sitn margintp'>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-img-sitn'></span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-label-sitn' data-id='" + selV.MeasureId + "'> " + selV.MeasureName + " </span>";
        selctedCompetitorsList += "<span class='lft-popup-ele-next-sitn'  data-id='" + selV.MeasureId + "'>";
        selctedCompetitorsList += "<span class='filter-info-panel-txt-del-sitn'></span></span></div>";
        //$(".master-lft-ctrl[data-val='Competitors']").find(".lft-popup-ele-label[data-val='" + selV.MeasureName + "']").parent().removeClass('lft-popup-ele_active').addClass('lft-popup-ele_active');
        $('.master-lft-ctrl[data-val="Competitors"]').find('.lft-popup-ele-label[data-val="' + selV.MeasureName + '"]').parent().removeClass('lft-popup-ele_active').addClass('lft-popup-ele_active')
        top_element_competitrdiv += '<div class="filter-info-panel-lbl" data-val="' + selV.MeasureName + '" parent-of-parent="Competitors" data-id="' + selV.MeasureId + '"><span style="float:left;" class="sel_text">' + selV.MeasureName + '</span><span class="filter-info-panel-txt-del" style="float:right;">&nbsp;</span></div>';
        selectedeleids.push(JSON.stringify({ ID: selV.MeasureId.toString(), Text: selV.MeasureName, ParentOfParent: "Competitors" }));
        var lftctrltxtlbl = '<div class="lft-ctrl-txt-lbl" data-val="' + selV.MeasureName + '" data-id="' + selV.MeasureId.toString() + '"><span style="float:left;width:90%">' + selV.MeasureName + '</span><span class="lft-ctrl-txt-del" style="float:right;">&nbsp;</span></div>';
        $(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').append(lftctrltxtlbl);
    });

    $(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').attr("data-ids", selectedeleids.join("|"));
    $(".competitrselctedList").append(selctedCompetitorsList);
    $('.filter-info-panel-elements').append(top_element_competitrdiv + "</div>");

    //$(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').attr("data-ids", '{"ID":"' + defaultFreqeuncyIdForSitn + '","Text":"' + defaultFrequencyNameForSitn + '"}');
    //$(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').html('');
    //$(".master-lft-ctrl[data-val='Competitors'").find('.lft-ctrl-txt').html('<div class="lft-ctrl-txt-lbl" data-val="' + defaultFrequencyNameForSitn + '" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;width:90%">' + defaultFrequencyNameForSitn + '</span><span class="lft-ctrl-txt-del" style="float:right;">&nbsp;</span></div>')
    //$(".master-lft-ctrl[data-val='Competitors'] .lft-popup-ele-label").parent().removeClass('lft-popup-ele_active')
    //$(".master-lft-ctrl[data-val='Competitors']").find(".lft-popup-ele-label[data-val='" + defaultFrequencyNameForSitn + "']").parent().removeClass('lft-popup-ele_active').addClass('lft-popup-ele_active');
    //if ($(".filter-info-panel-elements [data-val='Competitors']")[0] == undefined)
    //    $('.filter-info-panel-elements').append('<div class="Competitors_topdiv_element topdiv_element" data-val="FREQUENCY"><span class="pipe"> |&nbsp; </span><div class="filter-info-panel-lbl" data-val="' + defaultFrequencyNameForSitn + '" parent-of-parent="undefined" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;" class="sel_text">' + defaultFrequencyNameForSitn + '</span><span class="filter-info-panel-txt-del" style="float:right;">&nbsp;</span></div></div>');
    //else {
    //    $('.Competitors_topdiv_element.topdiv_element').html('');
    //    $('.Competitors_topdiv_element.topdiv_element').append('<span class="pipe"> |&nbsp; </span><div class="filter-info-panel-lbl" data-val="' + defaultFrequencyNameForSitn + '" parent-of-parent="undefined" data-id="' + defaultFreqeuncyIdForSitn + '"><span style="float:left;" class="sel_text">' + defaultFrequencyNameForSitn + '</span><span class="filter-info-panel-txt-del" style="float:right;">&nbsp;</span></div>');
    //}
}
var commonFunctionToRemoveEstmtOrCustomBsOrCompetitr = function (key, customBaseorCompetitor) {
    $('.lft-ctrl-txt-lbl[parent-of-parent="' + customBaseorCompetitor + '"][data-id="' + $(key).attr("data-id") + '"]').remove();
    $(".master-lft-ctrl[data-val='" + customBaseorCompetitor + "'] .lft-popup-ele-label[data-id='" + $(key).attr("data-id") + "']").parent().removeClass('lft-popup-ele_active')
    $(".filter-info-panel-lbl[parent-of-parent='" + customBaseorCompetitor + "'][data-id='" + $(key).attr("data-id") + "']").remove();
    var removeFromLeftPanelDataid = "";
    if (customBaseorCompetitor == "CustomBase")
        removeFromLeftPanelDataid = String($(".master-lft-ctrl[data-val='Establishment']").find('.lft-ctrl-txt').attr("data-ids")).split('|');
    else
        removeFromLeftPanelDataid = String($(".master-lft-ctrl[data-val='Competitors']").find('.lft-ctrl-txt').attr("data-ids")).split('|');
    var pushFinalDataidList = "";
    $.each(removeFromLeftPanelDataid, function (rI, rV) {
        if ($(key).attr("data-id") != JSON.parse(rV).ID) {
            if (rI == 0)
                pushFinalDataidList += rV;
            else {
                if (pushFinalDataidList.length == 0)
                    pushFinalDataidList += rV;
                else
                    pushFinalDataidList += "|" + rV;
            }
        }
    });
    if (customBaseorCompetitor == "CustomBase")
        $(".master-lft-ctrl[data-val='Establishment']").find('.lft-ctrl-txt').attr("data-ids", pushFinalDataidList);
    else
        $(".master-lft-ctrl[data-val='" + customBaseorCompetitor + "']").find('.lft-ctrl-txt').attr("data-ids", pushFinalDataidList);
}

var clearOutputAreaWhenEstCustmBsChanges = function () {
    isDefaultLoadSitnReport = true;
    //if (!isCustomBaseDeleted)
    //    deleteCompetitorWholeList();
    isCustomBaseDeleted = false;
    selectedmeasureId = "";
    $('.report-situation-maindiv').hide();
    $('.table-bottomlayer').html('');
    $('.FREQUENCY_topdiv_element.topdiv_element').remove();
    $(".master-lft-ctrl[data-val='FREQUENCY'").find('.lft-ctrl-txt').html('')
    $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele-label").parent('.lft-popup-ele_active').removeClass('lft-popup-ele_active');
    $('.report-sitn-togglediv').show();
    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
        $('#guest-visit-toggle').prop("checked", false);
        $(".adv-fltr-visit").css("color", "#f00");
        $(".adv-fltr-guest").css("color", "#000");
        $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
    }
    stickySelectedFreqcyFor_CoreGuest = "", stickySelectedFreqcyFor_MyTrips = "", stickySelectedFreqcyFor_LoyltyPyrmd = "", stickySelectedFreqcyFor_FairShareAnalysis = "";
    //Edited By SABAT ULLAH
    isFromMSS = false;
    previousSelectedMeasureId = "";
    //sabat
    isFrequencyChangedFor_CoreGuest = false, isFrequencyChangedFor_MyTrips = false, isFrequencyChangedFor_LoyltyPyrmd = false, isFrequencyChangedFor_FairShareAnalysis = false;
    isstickySelectionVisit = false, isToggleClicked = false;
    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    // demogfixedlist = [], demogfixedactivelist = [], tripsFixedList = [], tripsFixedActiveList = [];
}
var clearOutputAreaOnlyWhenLeftPanelModified = function () {
    isDefaultLoadSitnReport = true; selectedmeasureId = "";
    $('.report-situation-maindiv').hide();
    $('.table-bottomlayer').html('');
    $('.FREQUENCY_topdiv_element.topdiv_element').remove();
    $(".master-lft-ctrl[data-val='FREQUENCY'").find('.lft-ctrl-txt').html('')
    $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele-label").parent('.lft-popup-ele_active').removeClass('lft-popup-ele_active');
    $('.report-sitn-togglediv').show();
    if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
        $('#guest-visit-toggle').prop("checked", false);
        $(".adv-fltr-visit").css("color", "#f00");
        $(".adv-fltr-guest").css("color", "#000");
        $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
    }
    stickySelectedFreqcyFor_CoreGuest = "", stickySelectedFreqcyFor_MyTrips = "", stickySelectedFreqcyFor_LoyltyPyrmd = "", stickySelectedFreqcyFor_FairShareAnalysis = "";
    //Edited By SABAT ULLAH
    isFromMSS = false;
    previousSelectedMeasureId = "";
    //sabat
    isFrequencyChangedFor_CoreGuest = false, isFrequencyChangedFor_MyTrips = false, isFrequencyChangedFor_LoyltyPyrmd = false, isFrequencyChangedFor_FairShareAnalysis = false;
    isstickySelectionVisit = false, isToggleClicked = false;
    $(".nicescroll-rails[data-sub-id=SARModule]").remove();
    $('.subMeasureName.subMeasureName_active').removeClass('subMeasureName_active');
    // demogfixedlist = [], demogfixedactivelist = [], tripsFixedList = [], tripsFixedActiveList = [];
}

var changeFrequencyDependingOnMeasureClick = function (measureId) {

    var crossdiningIdList = [13, 14, 15]; var myTripsIdList = [18, 19, 20, 21]; var fairSharyAnlyIdList = [23, 24, 25, 26, 27];
    var measureParentId = $("#" + measureId).attr("parent-id");
    var selectedFrequnecy = $(".master-lft-ctrl[data-val='FREQUENCY'] .lft-popup-ele.lft-popup-ele_active").text().trim();
    var isCarryForward = false;
    $(".master-lft-ctrl[data-val='FREQUENCY']").removeClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').removeClass("disable-applyFilter");//enable the frequency and apply filter selection
    $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#000000');

    //if (!isFrequencyChangedForSitn) {
    if (measureParentId == "1" && measureListToShowToggle.indexOf(measureId) > -1) {
        $('.report-sitn-togglediv').show();
        isParentIdWithInSameSection = true;
    }
    else {
        $('.report-sitn-togglediv').hide();
        isParentIdWithInSameSection = false;
    }
    if (measureParentId == "1" && isFrequencyChangedFor_CoreGuest && !isToggleClicked) {
        if (measureParentId == "1" && measureId == "16") {
            defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle')
            }
            $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
            $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else if (measureParentId == "1" && measureId == "17") {
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle')
            }
            defaultFreqeuncyIdForSitn = "4", defaultFrequencyNameForSitn = "Yearly+";
            $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
            $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else if (measureParentId == "1" && measureListToShowToggle.indexOf(measureId) == -1 && crossdiningIdList.indexOf(previousSelectedMeasureId) == -1
            && measureId != "16" && measureId != "17" && checkFrequencyListCrossChannel.indexOf(stickySelectedFreqcyFor_CoreGuest) > -1) {
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle');
            }
            $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "false");
            $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide').addClass('awarenesshide');
            defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else if (measureParentId == "1" && measureListToShowToggle.indexOf(measureId) == -1 && crossdiningIdList.indexOf(previousSelectedMeasureId) > -1
                    && measureId != "16" && measureId != "17" && checkFrequencyListCrossChannel.indexOf(stickySelectedFreqcyFor_CoreGuest) > -1) {
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle');
            }
            $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "false");
            $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide').addClass('awarenesshide');
            defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else {
            if (isstickySelectionVisit) {
                if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
                    $('#guest-visit-toggle').prop("checked", false);
                    $(".adv-fltr-visit").css("color", "#f00");
                    $(".adv-fltr-guest").css("color", "#000");
                    $('#guest-visit-toggle').addClass('activeToggle');
                }
            }
            else {
                if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                    $('#guest-visit-toggle').prop("checked", true);
                    $(".adv-fltr-visit").css("color", "#000");
                    $(".adv-fltr-guest").css("color", "#f00");
                    $('#guest-visit-toggle').removeClass('activeToggle')
                }

            }
            defaultFrequencyNameForSitn = stickySelectedFreqcyFor_CoreGuest;
            defaultFreqeuncyIdForSitn = getFrequencyId(stickySelectedFreqcyFor_CoreGuest);
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
    }
    else if (measureParentId == "2" && isFrequencyChangedFor_MyTrips) {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", false);
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
            $('#guest-visit-toggle').addClass('activeToggle');
        }
        defaultFrequencyNameForSitn = stickySelectedFreqcyFor_MyTrips;
        defaultFreqeuncyIdForSitn = getFrequencyId(stickySelectedFreqcyFor_MyTrips);
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "3" && isFrequencyChangedFor_LoyltyPyrmd) {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
        $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
        defaultFrequencyNameForSitn = stickySelectedFreqcyFor_LoyltyPyrmd;
        defaultFreqeuncyIdForSitn = getFrequencyId(stickySelectedFreqcyFor_LoyltyPyrmd);
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "4" && isFrequencyChangedFor_FairShareAnalysis) {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        else {

        }
        if (measureParentId == "4" && measureId == "25") {
            defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
            $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
            $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else {
            defaultFrequencyNameForSitn = stickySelectedFreqcyFor_FairShareAnalysis;
            defaultFreqeuncyIdForSitn = getFrequencyId(stickySelectedFreqcyFor_FairShareAnalysis);
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
    }
    else if (measureParentId == "1" && measureListToShowToggle.indexOf(measureId) > -1 && measureListToShowToggle.indexOf(previousSelectedMeasureId) == -1 && measureId != "16" && measureId != "17") {
        //sabat
        if (isFromMSS == true) {
            defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", true);
                $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                $('#guest-visit-toggle').removeClass('activeToggle');
            }
            isFrequencyChangedFor_CoreGuest = true;
            isVisitsSelected = false;
            stickySelectedFreqcyFor_CoreGuest = defaultFrequencyNameForSitn;
            if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)")
                isstickySelectionVisit = true;
            else
                isstickySelectionVisit = false;
            isFirstTimeExecuted = false;
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else {
            defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
            if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
                $('#guest-visit-toggle').prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                $('#guest-visit-toggle').addClass('activeToggle');
            }
            $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
            $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        //sabat
        //defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
        //if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
        //    $('#guest-visit-toggle').prop("checked", false);
        //    $(".adv-fltr-visit").css("color", "#f00");
        //    $(".adv-fltr-guest").css("color", "#000");
        //    $('#guest-visit-toggle').addClass('activeToggle');
        //}
        //$('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        //$('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
        //addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);

    }
    else if (measureParentId == "1" && measureId == "16" && !isFrequencyChangedForSitn) {
        defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
        $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "1" && measureId == "17" && !isFrequencyChangedForSitn) {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        defaultFreqeuncyIdForSitn = "4", defaultFrequencyNameForSitn = "Yearly+";
        $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
        $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "1" && measureListToShowToggle.indexOf(measureId) == -1 && crossdiningIdList.indexOf(previousSelectedMeasureId) == -1 && measureId != "16" && measureId != "17") {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }

        defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);

    }
    else if (measureParentId == "2" && myTripsIdList.indexOf(measureId) > -1 && myTripsIdList.indexOf(previousSelectedMeasureId) == -1) {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", false);
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
            $('#guest-visit-toggle').addClass('activeToggle');
        }

        defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
        $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "3" && measureId == "22" && isPreviousParentId != measureParentId) {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
        $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
        $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "2" && isPreviousParentId != measureParentId) {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)") {

        }
        else {
            $('#guest-visit-toggle').prop("checked", false);
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
            $('#guest-visit-toggle').addClass('activeToggle');
        }
        defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
        $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
        $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    else if (measureParentId == "4" && fairSharyAnlyIdList.indexOf(measureId) > -1 && fairSharyAnlyIdList.indexOf(previousSelectedMeasureId) == -1) {
        if ($('.adv-fltr-guest').css("color") != "rgb(255, 0, 0)") {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
        }
        else {

        }
        defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        if (measureParentId == "4" && measureId == "25") {
            defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
            $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
            $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);

        }
    }
    else if (measureParentId == "4" && measureId == "25") {
        defaultFreqeuncyIdForSitn = "5", defaultFrequencyNameForSitn = "Establishment In Trade Area";
        $(".master-lft-ctrl[data-val='FREQUENCY']").addClass("disableFrequencyHeader"); $('.adv-fltr-applyfiltr').addClass("disable-applyFilter");//disable the frequency and apply filter selection
        $('.master-lft-ctrl[data-val="FREQUENCY"]').find('.fltr-txt-hldr').css('color', '#ffffff');
        addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
    }
    //}
    isPreviousParentId = measureParentId;
    previousSelectedMeasureId = measureId;


}
var setTableResolutionForSitn = function () {
    var topheaderhght = $('.report-sitn-output-header').height() + $('.report-sitn-output-header').height();
    $(".table-bottomlayer").css("height", "calc(100% - " + topheaderhght + ")");
    $("#scrollableTable").css("height", "100%").css("width", "100%");
    $(".corner-frame ,.scrollable-columns-frame").css("height", "auto");
    $("#scrollableTable .scrollable-rows-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
    $(".scrollable-columns-frame table, #scrollableTable .scrollable-data-frame table").css("width", "100%");
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
    $(".corner-frame, .scrollable-rows-frame").css("width", "17%");
    $(".scrollable-columns-frame, #scrollableTable .scrollable-data-frame").css("width", "82.4%");
    $(".scrollable-rows-table, .scrollable-data-table").css("height", "auto");
    //if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART") {
    //$(".scrollable-rows-table tr").each(function (i) {
    //    var height = $(this).height();
    //    if ((window.location.pathname).replace("Dine/", "").split("/")[1].toUpperCase() == "CHART" && $(".pit-toggle").hasClass("active") == false && (i == 1 || i == 0))
    //        height = "25";
    //    else {
    //        if (height < $(".scrollable-data-table tr").eq(i).height()) {
    //            height = $(".scrollable-data-table tr").eq(i).height();
    //        }
    //    }

    //    $(this).css("height", height + "px");
    //    $(this).children("td").css("height", height + "px");

    //    $(".scrollable-data-table tr").eq(i).css("height", height + "px");
    //    $(".scrollable-data-table tr").eq(i).children("td").css("height", height + "px");
    //});
    //}

}

var getFrequencyId = function (frequencyName) {
    let frequencyId = 0;
    switch (frequencyName) {
        case "Weekly+":
            frequencyId = "1";
            break;
        case "Monthly+":
            frequencyId = "2";
            break;
        case "Quarterly+":
            frequencyId = "3";
            break;
        case "Yearly+":
            frequencyId = "4";
            break;
        case "Establishment In Trade Area":
            frequencyId = "5";
            break;
        case "Total Visits":
            frequencyId = "6";
            break;
    }
    return frequencyId;
}

var hidePopupInSitnReport = function () {
    $(".null-error-popup-sitn").hide();
    $(".null-error-popup-userdirctnl-sitn").hide();
    $(".null-error-popup-sitn-update").hide();
    $(".null-error-popup-sitn-visitppup").hide();
    $(".null-error-popup-vistsampless-sitn").hide();
    $(".null-error-popup-sitn-downld").hide()
    $('.transparentBG').hide();
    isFrequencyChangedForSitn = true;
    isFromQuickDownloadSitn = false;
    if (isToggleClicked) {
        if (isVisitsSelected) {
            $('#guest-visit-toggle').prop("checked", false);
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
            $('#guest-visit-toggle').addClass('activeToggle');
            $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
            $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');

            if (stickySelectedFreqcyFor_CoreGuest == "") {
                defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits"; stickySelectedFreqcyFor_CoreGuest = "";
            }
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else {
            $('#guest-visit-toggle').prop("checked", true);
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            $('#guest-visit-toggle').removeClass('activeToggle')
            if (stickySelectedFreqcyFor_CoreGuest == "") {
                stickySelectedFreqcyFor_CoreGuest = "";
                defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
            }
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);

        }
    }
    else {
        if (stickySelectedFreqcyFor_CoreGuest == "" && isVisitsSelected) {
            defaultFreqeuncyIdForSitn = "6", defaultFrequencyNameForSitn = "Total Visits";
            $('.lft-popup-ele.awarenesshide').attr("data-isselectable", "true");
            $('.lft-popup-ele.awarenesshide').removeClass('awarenesshide');
            stickySelectedFreqcyFor_CoreGuest = "";
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else if (stickySelectedFreqcyFor_CoreGuest == "" && !isVisitsSelected) {
            stickySelectedFreqcyFor_CoreGuest = ""; defaultFreqeuncyIdForSitn = "2", defaultFrequencyNameForSitn = "Monthly+";
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
        else {
            defaultFreqeuncyIdForSitn = getFrequencyId(stickySelectedFreqcyFor_CoreGuest), defaultFrequencyNameForSitn = stickySelectedFreqcyFor_CoreGuest;
            addFrequencyNameIdByDefaultSelections(defaultFreqeuncyIdForSitn, defaultFrequencyNameForSitn);
        }
    }
    isToggleClicked = false;
    isFromLSSPppSAR = false;
}

var frequencyUpdateInStickyVaribales = function () {
    var selectedParentId = $('.subMeasureName.subMeasureName_active').attr("parent-id");
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

var getParentHeaderText = function (Id) {
    let headerText = "";
    switch (Id) {
        case "1":
            headerText = "Who is my Core guest?";
            break;
        case "2":
            headerText = "What differentiates my Trips? ";
            break;
        case "3":
            headerText = "Loyalty Pyramid";
            break;
        case "4":
            headerText = "Fair share Analysis";
            break;
    }
    return headerText;
}

//Quick Download
var qucikDownloadSitnReport = function () {

    isFromQuickDownloadSitn = false;
    $(".loader").hide();
    $(".transparentBG").hide();
}

//Download Report
var downloadSitnReport = function () {
    if (checkValidationSessionObj() == false) {
        return false;
    }
    if (prepareReportFilter() == false)
        return;
    var filterPanelInfo = {
        filter: JSON.parse($("#master-btn").attr('data-val'))
    };
    let spNameList = ['USP_SituationAssesmentReport_CoreGuest_Demographics', 'USP_SituationAssesmentReport_CoreGuest_HEC', 'USP_SituationAssesmentReport_CoreGuest_Digitalpage',
       'USP_SituationAssesmentReport_CoreGuest_DinerSegments', 'USP_SituationAssesmentReport_CoreGuest_AttitudinalStatements', 'USP_SituationAssesmentReport_CoreGuest_Geography',
       'USP_SituationAssesmentReport_CoreGuest_CrossDining_Channels', 'USP_SituationAssesmentReport_CoreGuest_CrossDining_AcrossEstablishments', 'USP_SituationAssesmentReport_CoreGuest_CrossDining_Competitors',
       'USP_SituationAssesmentReport_CoreGuest_FrequencyFunnel', 'USP_SituationAssesmentReport_CoreGuest_ShareofGuestTrips', '',
       'USP_SituationAssesmentReport_Trips_PlanningContext',
       'USP_SituationAssesmentReport_Trips_OccasionContext', 'USP_SituationAssesmentReport_Trips_Motivations', 'USP_SituationAssesmentReport_Trips_SatisfactionDrivers',
       '', 'USP_SituationAssesmentReport_LoyaltyPyramid', '', 'USP_SituationAssesmentReport_FairShair_EstablishmentImegeries',
       'USP_SituationAssesmentReport_FairShair_StrengthOppurtunites', 'USP_SituationAssesmentReport_FairShair_Perceptions', 'USP_SituationAssesmentReport_FairShair_BestInClass'];
    //let spNameList = [ 'USP_SituationAssesmentReport_FairShair_EstablishmentImegeries','USP_SituationAssesmentReport_FairShair_StrengthOppurtunites', 'USP_SituationAssesmentReport_FairShair_Perceptions', 'USP_SituationAssesmentReport_FairShair_BestInClass'];
    //];
    //let spNameList = ['USP_SituationAssesmentReport_FairShair_EstablishmentImegeries', 'USP_SituationAssesmentReport_FairShair_StrengthOppurtunites'];

    //let spNameList = ['USP_SituationAssesmentReport_CoreGuest_Demographics'];
    let selectionList = [], demogfixedlist = [], demogfixedactivelist = [], tripsFixedList = [], tripsFixedActiveList = [], subMeasureList = [], defualtIsVisitGuestList = [], defaultFrequencyList = [], defaultFrequencyNameList = [];
    let selectedEstablishName = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    let compareList = '';
    $.each(customBaseList, function (i, v) {
        if (i == 0)
            compareList += v.customBaseParentText + ",";
        else
            compareList += v.customBaseParentText;
    });
    let competitorList = '';
    $.each(competitorsList, function (i, v) {
        if (i == 0)
            competitorList += v.MeasureName;
        else
            competitorList += ", " + v.MeasureName;
    });
    let selectedFilters = $('.Advance_Filters_topdiv_element.topdiv_element .filter-info-panel-lbl');
    let selectedFiltersList = '';
    $.each(selectedFilters, function (i, v) {
        if (i == 0)
            selectedFiltersList += $(v).attr("data-val");
        else
            selectedFiltersList += "," + $(v).attr("data-val");
    });
    if (selectedmeasureId == "7") {
        $('#scrollableTable .checkBoxChange').each(function (i, v) {
            demogfixedlist.push($(v).attr("image-text"));
        });

        $('#scrollableTable .checkBoxChange.chkBx_active').each(function (i, v) {
            demogfixedactivelist.push($(v).attr("image-text"));
        });
    }
    else {
        demogfixedlist = ['gender', 'age', 'ethnicity', 'hh_size', 'children_in_hh', 'parental_identification', 'marital_status', 'hh_income', 'employement_status', 'education', 'socio_economic'];
        demogfixedactivelist = ['gender', 'age', 'ethnicity', 'parental_identification', 'employement_status', 'socio_economic'];
    }

    if (selectedmeasureId == "18") {
        $('#scrollableTable .checkBoxChange').each(function (i, v) {
            tripsFixedList.push($(v).attr("image-text"));
        });

        $('#scrollableTable .checkBoxChange.chkBx_active').each(function (i, v) {
            tripsFixedActiveList.push($(v).attr("image-text"));
        });
    }
    else {
        tripsFixedList = ['day_of_week', 'location_prior', 'trip_purpose', 'considered_another_establishment', 'other_places_considered', 'planning_type',
                         'decision_location', 'decision_made_with_time_left_before_arrival', 'main_decision_maker', 'decision_makers', 'distance_travelled',
                         'mode_of_transportation', 'mode_of_reservation', 'mode_of_doing_online_booking', 'use_of_online_review_or_social_media_sites',
                          'online_review_or_social_media_sites', 'trip_activities'];
        tripsFixedActiveList = ['day_of_week', 'location_prior', 'trip_purpose', 'planning_type', 'main_decision_maker', 'trip_activities'];
    }

    let defaultColors = [$('.custom-estcolordiv').attr('colorcode'), '#7F7F7F', '#A6A6A6', '#D9D9D9'];
    let parentId = $('.subMeasureName#' + selectedmeasureId).attr('parent-id');
    let correctMeasureArray = [];
    for (let i = 0; i < $('.subList').length; i++)
    {
        correctMeasureArray.push(parseInt($($('.subList')[i]).attr('measure-id')))
    }
    correctMeasureArray = correctMeasureArray.sort((i, v) =>i - v);
    $.each(correctMeasureArray, (i, v) => {
        subMeasureList.push(v.toString());
        defualtIsVisitGuestList.push(getVisitGuestListForPPTDnld(v.toString()));
        defaultFrequencyList.push(getFrequencyIdSARPPT(v.toString()));
    })
    

    $.each(defaultFrequencyList, function (i, v) {
        defaultFrequencyNameList.push(getfrequencyName(v));
    });

    let selectionsObj = {
        IsVisits: isVisitsSelected,
        EstablishmentName: selectedEstablishName,
        CompareEstablishment: compareList,
        Competitors: competitorList,
        Filters: selectedFiltersList,
        SelectedColorCode: $('.custom-estcolordiv').attr('colorcode'),
        SelectedmeasureId: selectedmeasureId,
        IsFrequencyChangedFor_CoreGuest: isFrequencyChangedFor_CoreGuest,
        IsFrequencyChangedFor_MyTrips: isFrequencyChangedFor_MyTrips,
        IsFrequencyChangedFor_LoyltyPyrmd: isFrequencyChangedFor_LoyltyPyrmd,
        IsFrequencyChangedFor_FairShareAnalysis: isFrequencyChangedFor_FairShareAnalysis,
        StickySelectedFreqcyFor_CoreGuest: stickySelectedFreqcyFor_CoreGuest,
        StickySelectedFreqcyFor_MyTrips: stickySelectedFreqcyFor_MyTrips,
        StickySelectedFreqcyFor_LoyltyPyrmd: stickySelectedFreqcyFor_LoyltyPyrmd,
        StickySelectedFreqcyFor_FairShareAnalysis: stickySelectedFreqcyFor_FairShareAnalysis,
        DemogFixedList: demogfixedlist,
        DemogActiveList: demogfixedactivelist,
        TripsFixedList: tripsFixedList,
        TripsActiveList: tripsFixedActiveList,
        DefaultColorsList: defaultColors,
        SubMeasureList: subMeasureList,
        DefualtIsVisitGuestList: defualtIsVisitGuestList,
        DefaultFrequencyList: defaultFrequencyList,
        DefaultFrequencyNameList: defaultFrequencyNameList,
        IsChannelSelected: $('.lft-popup-ele_active[parent-Of-parent=BenchMark]').attr('channelFlag'),
        DeleteTripsandGuestsSlide: isTotalVisitsMainHdrAdded,
        //sabat
        IsFromMSS: isFromMSS,
        IsImageries: $('.lft-popup-ele_active[parent-Of-parent=BenchMark]').attr('imageriesFlag'),

    };
    selectionList.push(selectionsObj);

    var filterdata = {
        filter: filterPanelInfo.filter, spNames: spNameList, selectionList: selectionList
    };
    $.ajax({
        url: appRouteUrl + "Report/DownloadSARReport",
        data: filterdata,
        method: "POST",
        contenttype: "application/json",
        async: true,
        success: function (response) {
            window.location.href = appRouteUrl + "Report/DownloadSARReport?path=" + response;
            $(".loader,.transparentBG").hide();
            $(".transparentbg").hide();
            isFromShareGuestsTripsPopup = false;

            $(".transparentBG").hide();
        },
        error: function () {
            $(".loader").hide();
            $(".transparentBG").hide();
            ajaxError
        }
    });
}

var showColorPallatePpup = function () {
    let selectnCount = $('.scrollable-rows-table .chkBx_active').length;

    if (selectnCount < 6 && (selectedmeasureId == "7" || selectedmeasureId == "18") && isFromQuickDownloadSitn == false) {
        showMaxAlert('Please make minimum 6 selections');
        return;
    }

    $(".loader,.transparentBG").hide();
    $('.customcolor-content').html("");
    var selctdBenchMarkId = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').attr("data-id");
    var selctdBenchMarkText = $('.filter-info-panel-lbl[parent-of-parent="BenchMark"]').text().trim();
    var customcolorhtml = "";
    customcolorhtml += "<div class='customcolor-div'><div class='customcolor-est-labeldiv'>";
    customcolorhtml += "<div class='customcolor-est-label'>" + selctdBenchMarkText + "</div></div>";
    customcolorhtml += "<div class='customcolor-est-color'>";
    customcolorhtml += '<div class="custom-estcolordiv" id="' + selctdBenchMarkId + '"  text="' + selctdBenchMarkText + '" ></div>';
    customcolorhtml += "</div>";
    customcolorhtml += "</div>";
    $(".customcolor-content").append(customcolorhtml);
    assignfillcolorinpopup("Establishment");
    $(".custom-color-palte").show();
    $(".transparentBG").show();
}

var showPreviewPpup = function () {
    let selectnCount = $('.scrollable-rows-table .chkBx_active').length;
    if (selectnCount < 6 && (selectedmeasureId == "7" || selectedmeasureId == "18")) {
        showMaxAlert('Please make minimum 6 selections');
        return;
    }
    $(".transparentBG").show();
    $('#planning-hdr').hide();
    $('#demo-hdr').hide();
    if (selectedmeasureId == "7" || selectedmeasureId == "18") {
        $('.preview-ppup').show();
        if (selectedmeasureId == "7") {
            $('#planning-hdr').hide();
            $('#demo-hdr').show();
        }
        else {
            $('#planning-hdr').show();
            $('#demo-hdr').hide();
        }
        $('.preview-ppup-static').hide();
        $('.preview-widzetsdiv').html('');
        let previewHtml = "";
        let totalSecltedCount = $('.scrollable-rows-table .chkBx_active').length;
        let j = 0;
        $('.scrollable-rows-table .chkBx_active').each(function (i, v) {
            if (i % 3 == 0)
                previewHtml += "<div class='preview-binddiv'>";

            //previewHtml += "<div class='preview-widzetImage'><object class='preview-widzetimg'  data='../Images/SituationAssessmentReport/PreviewImages/" + $(v).attr('image-text') + ".svg#svgView(preserveAspectRatio(none)) type='image/svg+xml'> </object></div>";
            previewHtml += "<div class='preview-widzetImage'><img class='preview-widzetimg'  src='../Images/SituationAssessmentReport/PreviewImages/" + $(v).attr('image-text') + ".svg' /></div>";
            previewHtml += "<div class='preview-emptydiv'></div>";
            j++;
            if (j % 3 == 0)
                previewHtml += "</div>";
        });
        if (totalSecltedCount == j && j % 3 != 0)
            previewHtml += "</div>";
        $('.preview-widzetsdiv').append(previewHtml);
    }
    else {
        $('.preview-ppup-static').show();
        $('.preview-ppup').hide();
        $('.preview-ppup-static').html('');
        let previewhtml = "";
        previewhtml += "<div class='preview-ppup-clsbtn' style='right: -1%;'></div>";
        previewhtml += "<img class='preview-ppup-static-image'  src='../Images/SituationAssessmentReport/PreviewImages/" + removeBlankSpace($(".subMeasureName_active").text().trim()) + ".svg' />";
        previewhtml += "<div class='preview-ppup-footer-text'>";

        previewhtml += "<div class='preview-src'>Source: CCNA Dine<sub>360</sub></div>";
        previewhtml += "<div class='preview-timeperd'>Time Period: 12MMT Sep 2018 | Freq. – Establishment in Trade Area</div>";
        previewhtml += "<div class='preview-clssfied'>Classified - Confidential</div>";
        previewhtml += "<div class='preview-note'> Note: <div class='preview-sig-greendiv'></div> <div class='preview-note-text'>Significantly high / </div><div class='preview-sig-reddiv'></div><div class='preview-note-text'>Significantly low</div></div>";

        //previewhtml += "<div class='preview-src'> Source : Dine</div>";
        //previewhtml += "<div class='preview-timeperd'>Time Period: Aug 2016 to June 2018</div>";
        //previewhtml += "<div class='preview-clssfied'>Classified - Confidential</div>";
        $('.preview-ppup-static').append(previewhtml);
    }

}

var getVisitGuestListForPPTDnld = function (measureId) {
    let listtrips = ['8', '9', '10', '11', '12'];
    let listgsts = ['13', '14', '15', '16', '17', '22', '23', '24', '25', '27'];
    let listmytrips = ['18', '19', '20', '21'];
    let isVisitGuest = 1;
    if (measureId == "7" & isVisitsSelected)
        isVisitGuest = 1;
    else if (measureId == "7" & !isVisitsSelected)
        isVisitGuest = 0;
    else if (listtrips.indexOf(measureId) > -1 && isVisitsSelected)
        isVisitGuest = 1;
    else if (listtrips.indexOf(measureId) > -1 && !isVisitsSelected)
        isVisitGuest = 0;
    else if (listgsts.indexOf(measureId) > -1)
        isVisitGuest = 0;
    else if (listmytrips.indexOf(measureId) > -1)
        isVisitGuest = 1;
    return isVisitGuest;
}

var getFrequencyIdSARPPT = function (measureId) {
    let listtrips = ['7', '8', '9', '10', '11', '12'];//Ids
    let listgsts = ['13', '14', '15'];
    let listmytrips = ['18', '19', '20', '21'];
    let listfairshareanalysis = ['16', '22', '23', '24', '25', '27'];
    let frequnecyId = 6;
    let frequencyNotAvail = ['Total Visits', 'Yearly+', 'Establishment In Trade Area'];
    if (isFrequencyChangedFor_CoreGuest && (listtrips.indexOf(measureId) > -1 || listgsts.indexOf(measureId) > -1)) {
        if (listgsts.indexOf(measureId) > -1 && frequencyNotAvail.indexOf(stickySelectedFreqcyFor_CoreGuest) > -1)
            frequnecyId = "2";//default monthly+
        else if (measureId == "17")
            frequnecyId = "4";//default yearly+
        else if (measureId == "16" || measureId == "22" || measureId == "25")
            frequnecyId = "5";//default establishment trade in area
        else
            frequnecyId = getFrequencyId(stickySelectedFreqcyFor_CoreGuest);
    }
    else if (measureId == "25")
        frequnecyId = "5";//default establishment trade in area
    else if (isFrequencyChangedFor_MyTrips && listmytrips.indexOf(measureId) > -1) {
        if (listmytrips.indexOf(measureId) > -1 && !isFrequencyChangedFor_MyTrips)
            frequnecyId = "6";//default Total Trips
        else
            frequnecyId = getFrequencyId(stickySelectedFreqcyFor_MyTrips);
    }
    else if (isFrequencyChangedFor_FairShareAnalysis && listfairshareanalysis.indexOf(measureId) > -1) {
        if (listfairshareanalysis.indexOf(measureId) > -1 && !isFrequencyChangedFor_FairShareAnalysis)
            frequnecyId = "5";//default establishment trade in area
        else
            frequnecyId = getFrequencyId(stickySelectedFreqcyFor_FairShareAnalysis);
    }
    else {
        if (measureId == "7" && isVisitsSelected)
            frequnecyId = "6";
        if (measureId == "7" && !isVisitsSelected)
            frequnecyId = "2";
        else if (listgsts.indexOf(measureId) > -1)
            frequnecyId = "2";
        else if (measureId == '17')
            frequnecyId = "4";
        else if (listfairshareanalysis.indexOf(measureId) > -1)
            frequnecyId = "5";
        else if (listmytrips.indexOf(measureId) > -1)
            frequnecyId = "6";
    }
    return frequnecyId;
}


var getfrequencyName = function (frequnecyId) {
    let frequencyName = "Total Visits";
    switch (frequnecyId) {
        case "1":
            frequencyName = "Weekly+";
            break;
        case "2":
            frequencyName = "Monthly+";
            break;
        case "3":
            frequencyName = "Quarterly+";
            break;
        case "4":
            frequencyName = "Yearly+";
            break;
        case "5":
            frequencyName = "Establishment In Trade Area";
            break;
        case "6":
            frequencyName = "Total Visits";
            break;
    }
    return frequencyName;
}

var SetScrollForSARModule = function (Obj, cursor_color, top, right, left, bottom, cursorwidth, horizrailenabled) {

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
    $($(Obj).getNiceScroll()[0].rail).attr("data-sub-id", "SARModule");
}

var setTableHeightForSAR = function () {
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr,.corner-table tr th, .corner-frame tr th,.scrollable-columns-table tr th").css("display", "flex");
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr,.corner-table tr th, .corner-frame tr th,.scrollable-columns-table tr th").css("align-items", "center");
    $(".corner-table, .corner-frame,.corner-table tr, .corner-frame tr,.scrollable-columns-table tr,.corner-table tr th, .corner-frame tr th,.scrollable-columns-table tr th").css("justify-content", "center");
    $(".tbl-algn-sar").css("display", "inline-block");
    $(".tbl-algn-sar").css("width", "100%");
    $(".tbl-algn-sar").css("word-wrap", "break-word;");
    $($(".corner-frame thead")[0]).css("width", "100%");

}

var getSignColor = function (signVal) {

    if (signVal == null || signVal == undefined || signVal == NaN)
        return "black";
    else if (signVal == 1)
        return "green";
    else if (signVal == 2)
        return "red";
    else if (signVal == 3)
        return "blue";
    else
        return "black";
}