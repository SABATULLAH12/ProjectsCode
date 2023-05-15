/// <reference path="draw-chart.js" />
/// <reference path="angular.js" />
/// <reference path="master-theme.js" />
/// <reference path="jquery-2.2.3.js" />

$(window).resize(function () {
    if (analysisTableType == "tableAnalyses") {
        setWidthforAnalysisTableColumns(analysisTableType);
        setMaxHeightForHedrTble();
    }
    else if (controllername == "analysescrossDinerFrequencies")
    {
        if ($('.dataCRCS').html() == "")
            SetTableResolutionCrossDiner();
    }
    else
        setWidthforChartTableColumns(analysisTableType);
    if ($(".chart-type.activeChart").length != 0) {
        $(".chart-type.activeChart").click();
    }
});
var textForHeading = "", active_Chart = 1; var isToggleClcked = false;
angular.module("mainApp").controller("analysesController", ["$scope", '$q', "$http", function ($scope, $q) {
    $scope.ComparisonPoint = "Establisments";
    $scope.tableData = [];
    $scope.tableDataR = [];
    $scope.ScatterChartData = [];
    $scope.proceedData = {};
    $scope.fileName = '';
    $scope.ZoomValue = 1;
    $scope.NoOfEstablishment = 0;
    $scope.buildMenu = function () {
        var menuData = clientDataStorage.get(controllername);
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Analyses/GetFilter/" + controllername, async: false, success: function (response) {
                    $scope.filters = response;
                    left_Menu_Data = response;  
                    clientDataStorage.store(controllername, JSON.stringify(response));
                }, error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
            $scope.filters = response;
            left_Menu_Data = response;
        }
        //added by Nagaraju for individual filters
        //Date: 07-08-2017            
        $scope.limit = 1;      
    }
    $scope.toggleclick = function () {
        clearAdvanceFilters();//To clear Advance Filters    
        //To show frequency in Beverage Visits Additional filters -start by Bramha(24-08-2017)
        $(".adv-fltr-sub-frequency").show();
        $("#addtnal-firstseptor").show();
        $("#addtnal-secndseptor").show();
        //End
        if ($('#guest-visit-toggle').hasClass('activeToggle')) {
            $('#guest-visit-toggle').removeClass('activeToggle');
            $scope.subfilters = $scope.advanceFilter[1].Filters;
            $scope.subfilterEstablishment = $scope.advanceFilter[1].Filters;
            $(".adv-fltr-visit").css("color", "#f00");
            $(".adv-fltr-guest").css("color", "#000");
           
            isVisitsSelected_Charts = 1;
            $(".centerAlign").css("left", "41%");

        } else {
            $('#guest-visit-toggle').addClass('activeToggle');
            $scope.subfilters = $scope.advanceFilter[2].Filters;
            $scope.subfilterEstablishment = $scope.advanceFilter[2].Filters;
            $(".adv-fltr-visit").css("color", "#000");
            $(".adv-fltr-guest").css("color", "#f00");
            isVisitsSelected_Charts = 0;
            $(".centerAlign").css("left", "36%");
        }
        isToggleClcked = true;
        if (filename == "BeverageDeepDive" || filename == "BeverageCompare") {
            defaultFreqncyForBeverageSelctn();
            if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
                $('.adv-fltr-sub-establmt').hide();
            else
                $('.adv-fltr-sub-establmt').show();
        }
        else {
            defaultFreqncySelctn();
            $('.adv-fltr-sub-establmt').hide();
        }
    }
    $scope.showSubOptions = function (optionText, event) {
        $(".adv-fltr-label").removeClass("adv-fltr-label-DemoGraphicProfiling Visits-box Guests-box DemoGraphicProfiling-box Visits-right-skew Guests-right-skew DemoGraphicProfiling-right-skew adv-fltr-label-Guests");
        var ele = event.currentTarget;
        var pele = event.currentTarget.parentElement.parentElement;
        var data_val = $(pele).attr("data-val");
        $(ele).addClass(data_val + "-box");
        $(ele).addClass(data_val + "-right-skew");
        $(".adv-fltr-label").css("color", "#646464");
        $(ele).css("color", "#fff");

       
        isToggleClcked = false;
        $(".centerAlign").css("left", "34%");
        switch (optionText) {
            case "DemoGraphicProfiling":
                $(".adv-fltr-toggle-container").show();
                $(".centerAlign").css("left", "34%");
                $scope.subfilters = $scope.advanceFilter[0].Filters;
                isVisitsSelected_analysis = 0;
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
                        $("#guest-visit-toggle").addClass("activeToggle");
                        $("#guest-visit-toggle").prop("checked", true);
                    }
                }
                break;
            case "Visits":
                $(".adv-fltr-toggle-container").hide();
                $scope.subfilters = $scope.advanceFilter[1].Filters;
                $(".centerAlign").css("left", "43%");
                $('#guest-visit-toggle').removeClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", false);
                $(".adv-fltr-visit").css("color", "#f00");
                $(".adv-fltr-guest").css("color", "#000");
                break;
            case "Guests":
            case "Beverage Guest":
                $(".adv-fltr-toggle-container").hide();
                $(".centerAlign").css("left", "47%");
                $scope.subfilters = $scope.advanceFilter[2].Filters;
                isVisitsSelected_Charts = 0;
                $('#guest-visit-toggle').addClass('activeToggle');
                $("#guest-visit-toggle").prop("checked", true);
                 $(".adv-fltr-visit").css("color", "#000");
                $(".adv-fltr-guest").css("color", "#f00");
                //
                break;
        }
    }
    $scope.showMoreLess = function () {
        if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
            //Rebind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").addClass("classMouseHover");
            $(".adv-fltr-showhide-txt").text("SHOW MORE");
            $(".adv-fltr-showhide-img").css("background-position", "-193px -211px");
            $(".adv-fltr-selection").hide();
            $(".adv-fltr-showhide-sectn").css("height", "20.28125");
            //$(".adv-fltr-showhide-sectn").css("margin-top", "-1.8%");
            $(".adv-fltr-showhide-sectn").css("margin-top", "-24px");
            $(".adv-fltr-top").css("height", "193.5px");
            $(".advance-filters").css("height", "30px");
            $(".adv-fltr-headers").css("height", "27.03125");
            $(".table-bottomlayer").css("height", "69.6%");
            //$(".analyses-bottomlayer").css("height", "456px");
            //$(".analyses-bottomlayer").css("height", "81.6%");
            $(".analyses-bottomlayer").css("height", "calc(100% - 100px)");
            $(".adv-fltr-applyfiltr").css("visibility", "hidden");
            switch (active_Chart) {
                case 3:
                    $scope.plotTableAnalyses($scope.tableData);
                    break;
                case 2:
                    $scope.plotTableR($scope.tableDataR);
                    break;
                case 1:
                    $scope.plotScatterChart($scope.ScatterChartData, 1);
                    break;
            }
            $(".adv-fltr-details").css("height", "auto");
            $(".adv-fltr-showhide").css({ "top": "-5%" });           
        }
        else {
            //Unbind the mouse over
            $(".adv-fltr-details.advance-filters-msehover").removeClass("classMouseHover"); $("#MouseHoverSmallDiv").hide();
            $(".adv-fltr-showhide-txt").text("SHOW LESS");
            $(".adv-fltr-showhide-img").css("background-position", "-233px -211px");
            $(".adv-fltr-top").css("height", "129");
            $(".adv-fltr-showhide-sectn").css("height", "22.8125");
            //$(".adv-fltr-showhide-sectn").css("margin-top", "-7.45%");
            $(".adv-fltr-showhide-sectn").css("margin-top", "-89px");
            $(".advance-filters").css("height", "128px");
            $(".adv-fltr-details").css("height", "100px");
            $(".table-bottomlayer").css("height", "59.6%");
            //$(".analyses-bottomlayer").css("height", "364px");
            $(".analyses-bottomlayer").css("height", "calc(100% - 200px)");
            $(".adv-fltr-headers").css("height", "29.15625");
            $(".adv-fltr-selection").show();
            $(".adv-fltr-applyfiltr").css("visibility", "visible");
            switch (active_Chart) {
                case 3:
                    $scope.plotTableAnalyses($scope.tableData);
                    break;
                case 2:
                    $scope.plotTableR($scope.tableDataR);
                    break;
                case 1:
                    $scope.plotScatterChart($scope.ScatterChartData, 1);
                    break;
            }           
        }
        //hide aditional filter images by chandu
        $(".adv-fltr-selection").find(".master-lft-ctrl[data-val!='Establishment']").find('.lft-popup-ele-label-img').hide();
        $(".adv-fltr-showhide").css({ "top": "-5%" });
    }
    $scope.buildAdvancedMenu = function () {
        var menuData = clientDataStorage.get(controllername+"_advance");
        if (menuData == null) {
            $.ajax({
                url: appRouteUrl + "Analyses/GetAdvancedFilters/analysesadvancedfilter", async: false, success: function (response) {
                    $scope.advanceFilter = response;
                    $scope.subfilters = $scope.advanceFilter[2].Filters;
                    clientDataStorage.store(controllername + "_advance", JSON.stringify(response));
                }, error: ajaxError
            });
        }
        else {
            var response = JSON.parse(menuData);
            $scope.advanceFilter = response;
            $scope.subfilters = $scope.advanceFilter[2].Filters;
        }
    }
    $scope.removeBlankSpace = function (object) {
         object = object.trim();
         var text = object.replace(/\ /g, "_").replace(/\//g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/\&/g, "_").replace(/\%/g, "").replace(/\./g, "").replace(/\-/g, "_").replace(/\,/g, "_").replace(/\|/g, "").replace(/\:/g, "_").replace(/\,/g, "_").replace(/[0-9]+/, "_").replace(/\'/g, '').replace(/\"/g, '').replace(/\+/g, '');
        return text.toLowerCase();
    }
    $scope.prepareContentArea = function () {

        isRestOrRetailer = $("#cross-Retailers").hasClass("Visits-right-skew") ? 0 : 1;
        //if (establishmentAndMeasureValidation() == false) return false;
        if (prepareFilter() == false)
            return false;
        reset_img_pos();
        $(".master-view-content").css("background-image", "none");
        //if ($($(".master-lft-ctrl[data-val=FREQUENCY]").find(".lft-ctrl3")[0]).find(".lft-popup-ele_active").length == 0) {
        //    alert("Frequency is required");
        //    return false;
        //}
        var loadWidgetByWidget = true;//case true for build widgets one by one, false for build all widgets together
        $(".snapshot-widgets").html('');
        $(".loader").show();
        $(".transparentBG").show();
        $("#chart-visualisation").html('');
        $("#flexi-tableR").hide();
        $("#flexi-tableAnalyses").hide();
        $("#scrollableTableR").hide();
        $("#scrollableTableAnalyses").hide();
        $("#chart-visualisation").show();
        var selectedMeasureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterdata = { filter: filterPanelInfo.filter, module: controllername, measureType: selectedMeasureType };
        if (controllername == "analysescrossDinerFrequencies") {
            isCrossDinerSubmitClicked = true;
            isRestorRetalerClicked = false;
            $scope.bindDataForCrossDiner(filterdata);//Cross Diner Frequencies Added by Bramhanath
        }
        else {
            $.ajax({
                url: appRouteUrl + "Analyses/GetAnalysesData",
                data: JSON.stringify(filterdata),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    textForHeading = $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label ").attr("parent-text").trim();
                    //reset the output view
                    $scope.tableData = [];
                    $scope.tableDataR = [];
                    $scope.ScatterChartData = [];
                    $(".analyses-toplayer").hide();
                    $(".analyses-bottomlayer").hide();
                    /*Stat Layer Data*/
                    $(".analyses-statlayer").html("");
                    $scope.NoOfEstablishment = 0;
                    $(".loader").hide();
                    $(".transparentBG").hide();
                    data = response.Series;
                    $scope.tableDataR = response.rData;
                    $scope.tableData = data;
                    $scope.NoOfEstablishment = response.NoOfEstablishment;
                    if (response.Series == undefined || response.Series == null || response.Series.length == 0) {
                        $(".analyses-bottomlayer").show();
                        $("#chart-visualisation").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                    }
                    else {
                        if (response.establishmentWithNulls.length != 0) {
                            //update the comparison point
                            if (window.location.pathname.toLocaleLowerCase().includes("deepdive")) { $scope.ComparisonPoint = "Metric Comparisons"; } else { $scope.ComparisonPoint = "Establishments"; }
                            $scope.$digest();
                            $(".null-error-popup").show();
                            //show popup
                            $(".list-of-nulls").html("");
                            response.establishmentWithNulls.forEach(function (d, i) {
                                $(".list-of-nulls").append("<div class='stat-custdiv'><div class='stat-cust-dot'></div><div class='stat-cust-estabmt popup1'>" + d + "</div></div>");
                            });
                            if (response.rData == null || response.rData == undefined) {
                                //Hide proceed btn proceed-text save-proceed-btn
                                $(".save-proceed-btn").hide();
                                $(".save-popup-btn").css("margin-left", "11%");
                                $(".proceed-text").text("To proceed select new " + $scope.ComparisonPoint);
                                sAllLowSample = "1";
                            }
                            else {
                                $(".save-popup-btn").css("margin-left", "0%");
                                $(".save-proceed-btn").show();
                                $(".proceed-text").text("Do you want to proceed with existing " + $scope.ComparisonPoint);
                                sAllLowSample = "0";
                                //save the data if proceed button is pressed
                                $scope.proceedData = response;
                            }
                        }
                        else {
                            $(".advance-filters").css("display", "block");
                            $(".analyses-statlayer").css("display", "block");
                            $(".analyses-toplayer").show();
                            $(".analyses-bottomlayer").show();
                            /*Stat Layer Data*/
                            $(".analyses-statlayer").html("");
                            $(".analyses-statlayer").append('<div class="est_sampleSize" style="font-weight:bold;margin-left:25px;">SAMPLE SIZE : </div>');
                            var statData = response.Series.map(function (d, i) {
                                return { name: d.name, sampleSize: d.SeriesSampleSize };
                            });
                            statData.forEach(function (d, i) {
                                if (i == (statData.length - 1)) {
                                    $(".analyses-statlayer").append("<div class='est_sampleSize'>" + d.name + " (" + d.sampleSize + ")</div>");
                                } else {
                                    $(".analyses-statlayer").append("<div class='est_sampleSize'>" + d.name + " (" + d.sampleSize + "),</div>");
                                }
                            });
                            /*Stat Layer Data*/
                            $(".zoom").css("display", "inline-block");
                            $scope.ScatterChartData = prepareDataForScatter(response.rData, $scope.NoOfEstablishment, 1);
                            $scope.SetTableRdata(response.rData, $scope.NoOfEstablishment);
                            if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
                                $scope.showMoreLess();
                            }
                            switch (active_Chart) {
                                case 3:
                                    $scope.plotTableAnalyses($scope.tableData);
                                    break;
                                case 2:
                                    $scope.plotTableR($scope.tableDataR);
                                    break;
                                case 1:
                                    $scope.plotScatterChart($scope.ScatterChartData, 1);
                                    break;
                            }
                        }
                    }
                },
                error: function () {
                    //hide other things
                    ajaxError
                }
            });
        }
    }

    widget = {

        getWidgets: function () {

            var toolWidgets = [{ WidgetName: "DEALING % OCC | DEALING PT CHG – BY SEGMENT/CAT/CHAIN", WidgetType: widgetTypes.Table, WidgetId: "1" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY WOWE", WidgetType: widgetTypes.BarChart, WidgetId: "2" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY BEVERAGE", WidgetType: widgetTypes.Table, WidgetId: "4" },
                { WidgetName: "INCIDENCE | INCIDENCE PT CHG – BY GEOGRAPHY", WidgetType: widgetTypes.Table, WidgetId: "5" },
                { WidgetName: "SALES DIST. | SALES % CHG – BY SEGMENT/CAT/CHAIN", WidgetType: widgetTypes.Table, WidgetId: "7" },
                { WidgetName: "INCIDENCE | TRAFFIC DIST. – BY GEOGRAPHY", WidgetType: widgetTypes.ColumnChart, WidgetId: "8" }
            ];

            for (var d = 0; d < toolWidgets.length; d++) {
                widget.buildWidget(toolWidgets[d]);
            }
        },

        //build single widget
        buildWidget: function (widget) {
            var filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')), widget: widget };

            $.ajax({
                url: appRouteUrl + "Analyses/GetWidgetInfo",
                data: JSON.stringify(filterPanelInfo),
                contentType: "application/json",
                method: "POST",
                async: true,
                success: function (response) {
                    var htmlWidgetStr = prepareWidget(response, widget);
                    if (htmlWidgetStr.length > 0) {
                        $(".snapshot-widgets").append("<div class='snapshot-widget'  id='widget" + widget.WidgetId + "' data-id='widget" + widget.WidgetId + "' data-name='" + widget.WidgetName + "'>" + htmlWidgetStr + "</div>");
                    }
                }
            });
        },

        //build all widgets together
        buildAllWidgets: function () {
            $.ajax({
                url: appRouteUrl + "Analyses/GetWidgetsInfo",
                data: [],
                type: "POST",
                success: function (response) {
                }
            });
        }
    }
    $scope.proceedClick = function () {
        $(".null-error-popup").hide();
        var response = $scope.proceedData;
        $(".advance-filters").css("display", "block");
        $(".analyses-statlayer").css("display", "block");
        $(".analyses-toplayer").show();
        $(".analyses-bottomlayer").show();
        /*Stat Layer Data*/
        $(".analyses-statlayer").html("");
        $(".analyses-statlayer").append('<div class="est_sampleSize" style="font-weight:bold;margin-left:25px;">SAMPLE SIZE : </div>');
        var statData = response.Series.map(function (d, i) {
            return { name: d.name, sampleSize: d.SeriesSampleSize };
        });
        statData.forEach(function (d, i) {
            if (response.establishmentWithNulls.indexOf(d.name) == -1) {
                if (i == (statData.length - 1 - response.establishmentWithNulls.length)) {
                    $(".analyses-statlayer").append("<div class='est_sampleSize'>" + d.name + " (" + d.sampleSize + ")</div>");
                } else {
                    $(".analyses-statlayer").append("<div class='est_sampleSize'>" + d.name + " (" + d.sampleSize + "),</div>");
                }
            }
        });
        /*Stat Layer Data*/
        
        $scope.tableData = removethenullEstabmts(data, response.establishmentWithNulls);//Filter the establishments
        $scope.SetTableRdata($scope.tableDataR, $scope.NoOfEstablishment);
        $(".zoom").css("display", "inline-block");
        $scope.ScatterChartData = prepareDataForScatter(response.rData, $scope.NoOfEstablishment, 1);
        //$scope.plotScatterChart($scope.ScatterChartData, 1);
        if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") {
            $scope.showMoreLess();
        }
        switch (active_Chart) {
            case 3:
                $scope.plotTableAnalyses($scope.tableData);
                break;
            case 2:
                $scope.plotTableR($scope.tableDataR);
                break;
            case 1:
                $scope.plotScatterChart($scope.ScatterChartData, 1);
                break;
        }
    }
    $scope.buildMenu();
    $scope.buildAdvancedMenu();

    $scope.plotTableR = function (tableDataR) {
        $(".chart-type").removeClass("activeChart");
        $(".table-R").addClass("activeChart");
        active_Chart = 2;
        $(".analyses-statlayer").css("display", "none");
        resetAnalysesImages();
        $(".table-R").css("background-position", "-593px -408px");
        var hgh = 25, wdt = 0;
        //$("#flexi-tableR").show();
        $("#scrollableTableR").show();
        $("#chart-visualisation").hide();
        $(".zoom").css("display", "none");
        //$scope.tableDataR = treeXTable($scope.tableDataR);
        var tree = tableDataR;
        $(".analyses-bottomlayer").html('');
        var tBody = "";
        var thead = '<div id="chart-visualisation" style="display:none;"></div><table id="flexi-tableAnalyses" class="data" cellpadding="0" cellspacing="0" style="display:block;"></table><table id="flexi-tableR" class="data" cellpadding="0" cellspacing="0" style="margin-top:5px;"><thead>';
        var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
        var metrcEmptyHding = '';
        var flag = 0;
        for (i = 0; i < 1; i++) {
            thead += '<tr class="tbl-dta-rows">';
            for (j = 0; j < tree[i].length; j++) {
                if (j == 0)
                    thead += '<th class="tbl-dta-metricsHding">';
                else
                    thead += '<th class="tbl-dta-metricsHding" style="width:320px"> ';
                if (j == 0) {
                    thead += metrcHding;
                }
                thead += '<div class="tbl-algn tbl_align_middle">' + tree[i][j].x + '</div>' +
            '</th>';
                if ((j + 1) != tree[i].length) { thead += ' <th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>'; }
            }
            thead += '</tr>';
        }

        thead += '</thead>';
        tBody += thead;

        tBody += '<tbody>';
        for (i = 1; i < tree.length; i++) {

            if ((tree[i][0].x == "MEASURES" || tree[i][0].x == "ESTABLISHMENTS" || tree[i][0].x == "METRIC COMPARISONS") && i == 1) {
                tBody += '<tr class="tbl-dta-rows expanse_collapse first">';
                flag = 1;
            }
            else if (tree[i][0].x == "MEASURES" || tree[i][0].x == "ESTABLISHMENTS" || tree[i][0].x == "METRIC COMPARISONS") {
                tBody += '<tr class="tbl-dta-rows expanse_collapse second">';
                flag = 2;
            }
            else if (flag == 1) {
                tBody += '<tr class="tbl-dta-rows dataShow first">';
            }
            else {
                tBody += '<tr class="tbl-dta-rows dataShow second">';
            }

            for (j = 0; j < tree[i].length; j++) {
                if (tree[i][j].x == "MEASURES" || tree[i][j].x == "ESTABLISHMENTS" || tree[i][j].x == "METRIC COMPARISONS") {
                    
                    tBody += '<td class="tbl-dta-rowscolr rowscolr">' +
                        '<div class="tbl-data-expan-collapse"><div class="tbl-data-expan-collapse_show"></div></div>' +
                         '<div class="tbl-dta-demoflter tbl_align_middle">' + tree[i][j].x + '</div><div class="tbl-data-brderbtm border"></div>' +
                    '</td>';
                    
                    if ((j + 1) != tree[i].length) {
                        tBody += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                }
                else {
                    
                    
                    if (tree[i][j].x == "&nbsp;") {
                        //var cls = j == 0 ? " fontForMetrics tbl-algn-left" : "style=width:310px";
                        var cls = " fontForMetrics tbl-algn-left" ;
                        if (j == 0)
                            tBody += '<td class="tbl-dta-rowscolr ' + cls + '">';
                        else
                            tBody += '<td class="tbl-dta-rowscolr" style="width:320px">';
                           '<div class="tbl-algn"><div class="text_middle">' + tree[i][j].x + '</div></div' +
                    '</td>';
                        if ((j + 1) != tree[i].length) {
                            tBody += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                        }
                    }
                    else {
                        if (j==0) {
                            tBody += '<td>' +
                                   '<div class="tbl-algn fontForMetrics tbl-algn-left">' + tree[i][j].x + '</div>' +
                                    '<div class="tbl-data-btmbrd1"></div><div class="tbl-btm-circle btmcir"></div>' +
                            '</td>';
                        } else {
                            tBody += '<td style="width:320px;">' +
                                   '<div class="tbl-algn"><div class="text_middle">' + tree[i][j].x.toFixed(1) + '</div></div>' +
                                    '<div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle btmcir"></div>' +
                            '</td>';
                        }
                        if ((j + 1) != tree[i].length) {
                            tBody += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                        }
                    }
                }
            }
            tBody += '</tr>';
        }
        tBody += '</tbody></table><div id="scrollableTableR"></div>';
        $('.analyses-bottomlayer').html(tBody);

        var options = {
            width: $(".analyses-bottomlayer").width() - wdt,
            height: $(".analyses-bottomlayer").height() - hgh,
            pinnedRows: 1,
            pinnedCols: 2,
            container: "#scrollableTableR",
            removeOriginal: true
        };
        $("#flexi-tableR").tablescroller(options);
        analysisTableType = "tableR";
        setWidthforChartTableColumns(analysisTableType);//set Dynamic width based on selections
        $('.scrollable-data-frame').height($('.scrollable-data-frame').height() + 15+22);
        $('.scrollable-data-frame').width($('.scrollable-data-frame').width()-3+10);
        $('.scrollable-rows-frame').height($('.scrollable-data-frame').height());
        //$('.scrollable-columns-frame').width("652px;");
        $('.scrollable-columns-frame').width($('.scrollable-data-frame').width());
        $('.analyses-bottomlayer').css("background", "none");
        $('.analyses-bottomlayer').css("border", "none");
        SetRTableResolution();
        SetScroll($("#scrollableTableR .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);
        
        $(".expanse_collapse").unbind().click(function () {
            var x = $(this).attr("class").split(" ");
            var class_click = x[x.length - 1];
            if ($("." + class_click).parent().find(".dataShow." + class_click).length != 0) {
                $(".dataShow." + class_click).removeClass('dataShow ' + class_click).addClass(class_click + ' dataHide');
                $("." + class_click).find(".tbl-data-expan-collapse_show").css('background-position', '-1510px -217px');
            }
            else if ($("." + class_click).parent().find('.dataHide.' + class_click).length != 0) {
                $(".dataHide." + class_click).removeClass('dataHide ' + class_click).addClass(class_click + ' dataShow');
                $("." + class_click).find(".tbl-data-expan-collapse_show").css('background-position', '-1554px -217px');
            }

        });
            
        
    }
    $scope.SetTableRdata = function (rData, NoOfEst) {
        var temp_data = [], est_data = [], meas_data = [];
        var getContext = window.location.pathname;
        var contextName = "ESTABLISHMENTS";
        if (getContext.includes("EstablishmentDeepDive")) { contextName = "METRIC COMPARISONS"; }
        est_data.push({ species: contextName, xVal: "&nbsp;", yVal: "&nbsp;", radialWidth: 5, colorDot: "#f00" });
        meas_data.push({ species: "MEASURES", xVal: "&nbsp;", yVal: "&nbsp;", radialWidth: 5, colorDot: "#f00" });
        var hd = rData.map(function (d,i) {
            var g = { species: d.name, xVal: +d.x, yVal: +d.y, radialWidth: 5, colorDot: "#f00" };
            if (i >= rData.length - NoOfEst) {
                est_data.push(g);
            }
            else {
                meas_data.push(g);
            }
        });
        temp_data = est_data.concat(meas_data);
        var tableRData = [];
        //tableRData[0] = [{ "x": "" }, { "x": "X" }, { "x": "Y" }];
        tableRData[0] = [{ "x": "BI-VARIATE CORRESPONDENCE ANALYSIS" }, { "x": "DIMENSION 1" }, { "x": "DIMENSION 2" }];
        temp_data.forEach(function (d, i) {
            tableRData[i + 1] = [{ "x": d.species }, { "x": d.xVal }, { "x": d.yVal }];
        });

        $scope.tableDataR = tableRData;
    }
    $scope.plotTableAnalyses = function (data) {
        active_Chart = 3;
        $(".chart-type").removeClass("activeChart");
        $(".table-analyses").addClass("activeChart");
        $(".analyses-statlayer").css("display", "none");
        resetAnalysesImages();
        $(".analyses-bottomlayer").css("background", "none");
        $(".analyses-bottomlayer").css("border", "none");
        $(".table-analyses").css("background-position", "-693px -408px");
        var hgh = 100, wdt = 0;
        //if ($(".advance-filters").css("display") != "none") {
        //    hgh = 165;
        //};
        //if ($(".adv-fltr-showhide-txt").text() == "SHOW LESS") { hgh = 170; }
        //$("#flexi-tableR").show();
        $("#scrollableTableR").show();
        $("#chart-visualisation").hide();
        $(".zoom").css("display", "none");
        $scope.tree = treeXTable(data);
        var tree = $scope.tree;
        $(".analyses-bottomlayer").html('');

        var tableFrequncydiv = "";
        //    '<div id="guestFrqncy" class="tbl-dta-rows">';
        //tableFrequncydiv += '<div class="tbl-dta-freq">';
        //tableFrequncydiv += '<div class="tbl-data-freqbdr"></div>';
        //var measureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        //if (measureType == "Guest Measures")
        //    tableFrequncydiv += '<div class="tbl-data-freqtxt">' + "GUESTS" + ' FREQUENCY</div>';
        //else
        //    tableFrequncydiv += '<div class="tbl-data-freqtxt">' + "VISITS" + ' FREQUENCY</div>';

        //tableFrequncydiv += '</div>';
        //tableFrequncydiv += '</div>';
        tableFrequncydiv += '<div class="tbl-emptyrow"></div>';

        var tBody = "";
        var thead = tableFrequncydiv + '<div id="chart-visualisation" style="display:none;"></div><table id="scrollableTableAnalyses" class="data" cellpadding="0" cellspacing="0" style="display:block;"></table><table id="flexi-tableAnalyses" class="data" cellpadding="0" cellspacing="0"><thead>';
        var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
        var metrcEmptyHding = '';
        for (i = 0; i < 1; i++) {
            thead += '<tr class="tbl-dta-rows">';
            for (j = 0; j < tree[i].length; j++) {
                thead += '<th class="tbl-dta-metricsHding">';
                if (j == 0) {
                    thead += metrcHding;
                }
                thead += '<div class="tbl-algn tbl_align_middle">' + tree[i][j].x + '</div>' +
            '</th>';

                if ((j + 1) != tree[i].length) { thead += ' <th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>'; }
            }
            thead += '</tr>';
        }

        thead += '</thead>';
        tBody += thead;
        tBody += '<tbody>';
        for (i = 1; i < tree.length; i++) {
            if (i == 1) {
                tBody += '<tr class="tbl-dta-rows expanse_collapse">';
            }
            //else if (i == 2) {
            //    tBody += '<tr class="tbl-dta-rows dataShow">';
            //}
            else {
                tBody += '<tr class="tbl-dta-rows dataShow">';
            }
            for (j = 0; j < tree[i].length; j++) {
                tBody += '<td class="' + tree[i][j].css + ' ' + tree[i][j].cssForUseDirectnlytd + '">';
                if (i == 1 || i==2) {
                    if (j == 0 && i == 1) {
                        tBody += '<div class="tbl-data-expan-collapse"><div class="tbl-data-expan-collapse_show"></div></div>';
                        tBody += '<div class="tbl-algn tbl-algn-left ' + tree[i][j].dataCss + ' ' + tree[i][j].cssForUseDirectnlytd + '"><div class="text_middle_header">' + tree[i][j].x + '</div></div>';
                        tBody += '<div class="tbl-data-brderbtm borderbtm"></div>';
                    }
                    else {
                        if (i == 2 && j == 0) {
                            tBody += '<div class="tbl-algn-left tbl-algn ' + tree[i][j].dataCss + ' ' + tree[i][j].cssForUseDirectnlytd + '"><div class="text_middle">' + tree[i][j].x + '</div></div>';
                        } else {
                            tBody += '<div class="tbl-algn ' + tree[i][j].dataCss + ' ' + tree[i][j].cssForUseDirectnlytd + '"><div class="text_middle">' + tree[i][j].x + '</div></div>';
                        }
                    }
                }
                else {
                    var cls = j == 0 ? " fontForMetrics tbl-algn-left" : "";                   
                    tBody += '<div class="tbl-algn ' + cls + ' ' + tree[i][j].dataCss + ' ' + tree[i][j].cssForUseDirectnlytd + '"><div class="text_middle">' + tree[i][j].x + '</div></div>';
                    tBody += '<div class="tbl-data-btmbrd ' + tree[i][j].dataCss + '  ' + tree[i][j].useDirectionallyCss + '"></div>' +
                          '<div class="tbl-btm-circle ' + tree[i][j].useDirectionallyForCirleCSS + '"></div>';
                }
                tBody += '</td>';
                if ((j + 1) != tree[i].length) {
                    tBody += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                }
            }
            tBody += '</tr>';
        }
        tBody += '</tbody></table><div id="scrollableTableAnalyses"></div><div class="analysis-foot-note"> <span class="asterik">*</span> Total number of respondents who have responded to atleast one of the selected measure</div>';
        $('.analyses-bottomlayer').html(tBody);

        var options = {
            width: $(".analyses-bottomlayer").width() - wdt,
            height: $(".analyses-bottomlayer").height() - hgh,
            pinnedRows: 1,
            pinnedCols: 4,
            container: "#scrollableTableAnalyses",
            removeOriginal: true
        };
        $("#flexi-tableAnalyses").tablescroller(options);
        analysisTableType = "tableAnalyses";
        setWidthforAnalysisTableColumns(analysisTableType);//set Dynamic width based on selections
        setMaxHeightForHedrTble();
        $('.scrollable-data-frame').height($('.scrollable-data-frame').height() + 30);
        $('.scrollable-data-frame').width($('.scrollable-data-frame').width() - 1 + 10);
        $(".scrollable-rows-frame").height($('.scrollable-data-frame').height());
        $('.scrollable-columns-frame').width($('.scrollable-data-frame').width());
        SetAnalysisTableResolution();
        SetScroll($("#scrollableTableAnalyses .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);

        $(".expanse_collapse").unbind().click(function () {

            if ($(".expanse_collapse").siblings().hasClass('dataShow')) {
                $(".dataShow").removeClass('dataShow').addClass('dataHide');
                $(".tbl-data-expan-collapse_show").css('background-position', '-1510px -217px');
            }
            else if ($(".expanse_collapse").siblings().hasClass('dataHide')) {
                $(".dataHide").removeClass('dataHide').addClass('dataShow');
                $(".tbl-data-expan-collapse_show").css('background-position', '-1554px -217px');
            }

        });
        if (controllername == 'analysesestablishmentdeepdive')
            $(".scrollable-data-frame .scrollable-data-table").css("margin-left", "0.58%");
    }
    $scope.plotScatterChart = function (rData, val) {
        $(".analyses-statlayer").css("display", "none");
        resetAnalysesImages();
        $(".scatterplot-chart").css("background-position", "-493px -408px");
        $('.analyses-bottomlayer').css("background", "rgba(255,255,255,.3)");
        $('.analyses-bottomlayer').css("border", "1px solid #BBBDBF");
        $("#flexi-tableR").hide();
        $("#flexi-tableAnalyses").hide();
        $("#scrollableTableR").hide();
        $("#guestFrqncy").hide();
        $("#scrollableTableAnalyses").hide();
        $("#chart-visualisation").html("");
        $("#chart-visualisation").css("display", "block");
        $(".zoom").css("display", "inline-block");
        //$scope.ScatterChartData = prepareDataForScatter();
        scatterPlotChart($scope.ScatterChartData,val);
        $(".loader").hide();
        $(".transparentBG").hide();
    }
    $scope.greaterThan = function (prop, val) {
        return function (item) {
            return item[prop] > val;
        }
    }
    $scope.zoomListener = function (evt) {
        if ((evt.currentTarget.classList).contains("zoom-out")) {
            if ($scope.ZoomValue > 1) {
                $scope.ZoomValue -= 1;
            }
        }
        else {
            if ((evt.currentTarget.classList).contains("zoom-in")) {
                if ($scope.ZoomValue < 10) {
                    $scope.ZoomValue += 1;
                }
            }
        }
        $scope.plotScatterChart($scope.ScatterChartData, $scope.ZoomValue);
    }
    $scope.prepareReportParameters = function (reportName) {
        var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterPanelInfo = { filter: removeNullDataFromFilterPanelInfo(filterPanelInfoData.filter) };
        var fromTimePeriod, timePeriodType;
        timePeriodType = filterPanelInfoData.filter[1].SelectedID;
        if ($(".pit").hasClass("active")) {
            var periodType = "pit";
            fromTimePeriod = filterPanelInfoData.filter[1].Data[0].Text;
        }
        else {
            var periodType = "trend";
            filterPanelInfoData.filter[1].Data[1].Text;
        }

        if (reportName == undefined || reportName == null || reportName == "")
            var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, ReportName: $scope.reportSelected.Name, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: filterPanelInfoData.filter[1].Data[0].Text, ToTimePeriod: fromTimePeriod, Comment: "" };
        else if (reportName == "editedReport") {
            var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, SlideID: $scope.activeSlideID, ReportID: $scope.activeReportID, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: filterPanelInfoData.filter[1].Data[0].Text, ToTimePeriod: fromTimePeriod, Comment: $scope.commentText };
        }
        else
            var filterdata = { Filter: filterPanelInfo.filter, ChartType: $scope.activeChartType, Module: controllername, ReportName: $scope.reportName, TimePeriodText: periodType, TimePeriodType: timePeriodType, FromTimePeriod: filterPanelInfoData.filter[1].Data[0].Text, ToTimePeriod: fromTimePeriod, Comment: "" };
            var isVisits = 1;
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
            isVisits = 0;
        else
            isVisits = 1;
        filterdata.Filter[0]["IsVisit"] = isVisits;
        filterdata.Filter.push({ Name: "IsVisit", SelectedID: isVisits });
        return filterdata;
    }
    $scope.closeSavePopup = function () {
        $(".null-error-popup").hide();
        //if (sAllLowSample == "1")
        if (controllername == "analysesestablishmentdeepdive" || controllername == "analysesestablishmentcompare")
            $(".master-view-content").css("background-image", "url('../Images/Dine Logo_Colour-01.svg')");
    }
    syncFilterPanel();
    function removeNullDataFromFilterPanelInfo(filterPanelInfo) {
        var selfilter = [];
        for (i = 0; i < filterPanelInfo.length; i++) {
            var data = filterPanelInfo[i];
            if (data.Name != "Time Period" && data.Name != null && data.Data != null && data.Data != undefined && data.SelectedID != undefined) {
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
    function validateDownload() {
        if ($scope.ScatterChartData != null && $scope.ScatterChartData.length!=0) {
            return true;
        }
        return false;
    }
    $(document).on("click", '.ppt-logo', function () {
        if (validateFilter() == false) { return; }
        if (validateDownload()) {
            $(".loader").show();
            $(".transparentBG").show();
            var xAxis = "Establishment", yAxis = "Measures";
            var allEst = $(".Establishment_topdiv_element .filter-info-panel-lbl");
            var tbTitle = "";
            $(allEst).each(function (i, d) {
                tbTitle = tbTitle.concat(i == 0 ? $(d).text().trim() : ", " + $(d).text().trim());
            });
            var pthName = window.location.pathname;
            if (pthName.toLocaleLowerCase().includes("establishmentdeepdive")) {
                xAxis = "Metric Comparisons";
                allEst = $(".Metric_Comparisons_topdiv_element .filter-info-panel-lbl");
                tbTitle = "";
                $(allEst).each(function (i, d) {
                    tbTitle = tbTitle.concat(i == 0 ? $(d).text().trim() : ", " + $(d).text().trim());
                });
            }
            var pthName = window.location.pathname;
            if (pthName.includes("BeverageCompare")) {
                xAxis = "Beverage";
            }
            if (pthName.includes("BeverageCompare") || pthName.includes("EstablishmentDeepDive")) {
                xAxis = "Metric Comparisons";
            }
            var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
            var filterPanelInfo = { filter: removeNullDataFromFilterPanelInfo(filterPanelInfoData.filter) };
            var fromTimePeriod, timePeriodType;
            timePeriodType = filterPanelInfoData.filter[1].SelectedID;
            if ($(".pit").hasClass("active")) {
                var periodType = "pit";
                fromTimePeriod = filterPanelInfoData.filter[1].Data[0].Text;
            }
            else {
                var periodType = "trend";
                filterPanelInfoData.filter[1].Data[1].Text;
            }
            var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
            for (l = 0; l < cmt.length; l++) {
                if ($(cmt[l]).attr("data-val").toLocaleLowerCase() == "time period" || $(cmt[l]).attr("data-val").toLocaleLowerCase() == "frequency" || $(cmt[l]).attr("data-val").toLocaleLowerCase() == xAxis.toLocaleLowerCase() || $(cmt[l]).attr("data-val").toLocaleLowerCase() == yAxis.toLocaleLowerCase()) {
                } else {
                    var labels = $(cmt[l]).find(".sel_text");
                    fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                    for (var j = 0; j < labels.length; j++) {
                        if (j == 0) {
                            fil = fil.concat($(labels[j]).text());
                        } else {
                            fil = fil.concat(", " + $(labels[j]).text());
                        }
                    }
                    if (l != cmt.length - 1) {
                        fil = fil.concat(", ");
                    }
                }
            }
            if (fil.slice(-2) == ", ") { fil = fil.slice(0, fil.length - 2); }
            var mstyp = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
            var freq = $(".FREQUENCY_topdiv_element").find(".sel_text").text();
            var data = { filter: $scope.prepareReportParameters("reportName"), measureType: mstyp, frequency: freq, tableTitle: tbTitle, samplesizeLine: $(".analyses-statlayer").text().trim(), measure_parent_text: $(".master-lft-ctrl[data-val='Measures'] .lft-popup-ele_active:eq(0) .lft-popup-ele-label").attr("parent-text").trim() };
            data.filter.Comment = fil;
            data.filter.ChartType = "scatter";
            var tp = $(".Time_Period_topdiv_element").find(".filter-info-panel-lbl").text().trim();
            data.filter.Filter.push({ Name: "Time Period", Data: [{ Text: tp }], SelectedID: $(".lft-popup-tp-active").text().trim() });

            var procName = "ExportToPPTOther";

            var fileName="";
            switch(controllername)
            {
                case "analysesestablishmentdeepdive":
                    fileName="Establishment Deep Dive";
                    break;
                case "analysesestablishmentcompare":
                    fileName="Establishment Compare";
                    break;
            }

            $.ajax({
                async : true,
                url: appRouteUrl + "Analyses/" + procName,
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    $(".loader").hide();
                    $(".transparentBG").hide();
                    //window.location.href = appRouteUrl + "Analyses/DownloadExportToPPTOther?fileName=" + response;
                    window.location.href = appRouteUrl + "Analyses/DownloadFilePPT?fileName=" + fileName;
                },
                error: ajaxError
            });
        }
    });
    $(document).on("click", '.exl-logo', function () {
        
        if (controllername ==   "analysescrossDinerFrequencies") {
            if (prepareFilter() == false)
                return false;
            preparePopupForCrossDinerExcel();
        }
        else {
            if (validateFilter() == false) { return; }
            if (validateDownload()) {
                $(".loader").show();
                $(".transparentBG").show();
                var xAxis = "Establishment", yAxis = "Measures";
                var tbTitle = "Establishment(s)";
                var pthName = window.location.pathname;
                if (pthName.includes("EstablishmentDeepDive")) {
                    xAxis = "Metric Comparisons";
                    tbTitle = "Metric Comparison(s)";
                }
                var filterPanelInfoData = { filter: JSON.parse($("#master-btn").attr('data-val')) };
                var filterPanelInfo = { filter: removeNullDataFromFilterPanelInfo(filterPanelInfoData.filter) };
                var fromTimePeriod, timePeriodType;
                timePeriodType = filterPanelInfoData.filter[1].SelectedID;
                if ($(".pit").hasClass("active")) {
                    var periodType = "pit";
                    fromTimePeriod = filterPanelInfoData.filter[1].Data[0].Text;
                }
                else {
                    var periodType = "trend";
                    filterPanelInfoData.filter[1].Data[1].Text;
                }
                var fil = "", l, cmt = $(".filter-info-panel-lbl").parent();
                for (l = 0; l < cmt.length; l++) {
                    if ($(cmt[l]).attr("data-val") == "Time Period" || $(cmt[l]).attr("data-val") == xAxis || $(cmt[l]).attr("data-val") == yAxis || $(cmt[l]).attr("data-val") == "FREQUENCY") {
                    } else {
                        var labels = $(cmt[l]).find(".sel_text");
                        fil = fil.concat(" " + $(cmt[l]).attr("data-val") + " : ");
                        for (var j = 0; j < labels.length; j++) {
                            if (j == 0) {
                                fil = fil.concat($(labels[j]).text());
                            } else {
                                fil = fil.concat(", " + $(labels[j]).text());
                            }
                        }
                        if (l != cmt.length - 1) {
                            fil = fil.concat(", ");
                        }
                    }
                }
                if (fil.slice(-2) == ", ") { fil = fil.slice(0, fil.length - 2); }
                var mstyp = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
                var freq = $(".FREQUENCY_topdiv_element").find(".sel_text").text();
                var data = { filter: $scope.prepareReportParameters("reportName"), measureType: mstyp, frequency: freq, tableTitle: tbTitle };
                data.filter.Comment = fil;
                data.filter.ChartType = "scatter";
                var tp = $(".Time_Period_topdiv_element").find(".filter-info-panel-lbl").text().trim();
                data.filter.Filter.push({ Name: "Time Period", Data: [{ Text: tp }], SelectedID: $(".lft-popup-tp-active").text().trim() });

                var procName = "ExportToExcelOtherTable";
                var fileName = "";
                switch (controllername) {
                    case "analysesestablishmentdeepdive":
                        fileName = "Establishment Deep Dive";
                        break;
                    case "analysesestablishmentcompare":
                        fileName = "Establishment Compare";
                        break;
                }
                $.ajax({
                    async: true,
                    url: appRouteUrl + "Analyses/" + procName,
                    data: JSON.stringify(data),
                    method: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (response) {
                        $(".loader").hide();
                        $(".transparentBG").hide();
                        //window.location.href = appRouteUrl + "Analyses/DownloadExportToExcelOtherTable?fileName=" + response;
                        window.location.href = appRouteUrl + "Analyses/DownloadFile?fileName=" + fileName;
                    },
                    error: ajaxError
                });
            }
        }
    });

    function defaultFreqncySelctn() {
        return $q(function (resolve, reject) {
            setTimeout(function () {
                if (isVisitsSelected_Charts == 0) {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").first().find(".lft-popup-ele-label[data-val='Monthly+']").click();
                        $(".master-lft-ctrl[data-val='CONSUMED FREQUENCY']").parent().hide();
                        if (isToggleClcked)
                            $scope.prepareContentArea();
                    }
                }
                else {
                    if ($(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").parent().hasClass("lft-popup-ele_active")) {
                        resolve('Successful');
                    } else {
                        $(".adv-fltr-sub-frequency .master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Total Visits']").click();
                        if (isToggleClcked)
                            $scope.prepareContentArea("");
                        //}
                        //isInitialLoad = false;
                        reject('Error');
                    }
                }
            }, 500);
        });
    }

    //To get Data For Cross Diner Frequencies
    $scope.bindDataForCrossDiner = function (filterdata) {
        isRestOrRetailer = 1;
        isRestorRetalerClicked = false;
        $.ajax({
            url: appRouteUrl + "Analyses/GetCrossDinerFrequenciesData",
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loader").hide();
                $(".transparentBG").hide();
                if (response.GetTableDataResopnse != undefined) {
                    if (response.GetTableDataResopnse.GetTableDataRespDt.length == 0)
                        $(".analyses-crossdinerFreqlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                    else {
                        $scope.plotAnalysiCrssDinerTableData(response.GetTableDataResopnse.GetTableDataRespDt);
                    }
                } else {
                    $(".analyses-crossdinerFreqlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                }
            },
            error: function () {
                //hide other things
                ajaxError
            }
        });
    }
    
    $scope.plotRestrntsorRetailers = function (IsRestaurantorRetailer)
    {
        isRestOrRetailer = IsRestaurantorRetailer;
        isRestorRetalerClicked = true;
        if (prepareFilter() == false)
            return false;
        reset_img_pos();
        $(".master-view-content").css("background-image", "none");
        $(".loader").show();
        $(".transparentBG").show();
        $(".analyses-crossdinerFreqlayer").html('');
        $('.cross-diner-statlayer').show();
        var selectedMeasureType = $(".master-lft-ctrl[data-val='Measures']").find(".lft-popup-ele_active .lft-popup-ele-label").parent().parent().attr("first-level-selection");
        filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var filterdata = { filter: filterPanelInfo.filter, module: controllername, measureType: selectedMeasureType };
        if (IsRestaurantorRetailer == 1) {
            
            $("#cross-Retailers").removeClass("Visits-box");
            $("#cross-Retailers").removeClass("Visits-right-skew");
            $("#cross-Restaurants").addClass("Visits-box");
            $("#cross-Restaurants").addClass("Visits-right-skew");
        }
        else {
            $("#cross-Restaurants").removeClass("Visits-box");
            $("#cross-Restaurants").removeClass("Visits-right-skew");
            $("#cross-Retailers").addClass("Visits-box");
            $("#cross-Retailers").addClass("Visits-right-skew");
            
        }
        if (isCrossDinerSubmitClicked == false) {
            $scope.bindDataForCrossDiner(filterdata);
            isCrossDinerSubmitClicked = true;
            return;
        }
        var filterdata = { IsRestaurantorRetailer: IsRestaurantorRetailer }
        $.ajax({
            url: appRouteUrl + "Analyses/GetRestaurantOrRetailers",
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                if (response.GetTableDataResopnse != undefined) {
                    if (response.GetTableDataResopnse.GetTableDataRespDt.length == 0)
                        $(".analyses-crossdinerFreqlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                    else {
                        $scope.plotAnalysiCrssDinerTableData(response.GetTableDataResopnse.GetTableDataRespDt);
                    }
                } else {
                    $(".analyses-crossdinerFreqlayer").html('<div class="padd_top_left">No data available for the selection you made.</div>');
                }
                $(".loader").hide();
                $(".transparentBG").hide();
            },
            error: function ()
            { }
        });
    }
    //

    $scope.plotAnalysiCrssDinerTableData = function (mainData) {

        $('.cross-diner-statlayer').show();
        var tBody = "";
        var tableHtml = '<table id="flexi-table" class="data" cellpadding="0" cellspacing="0">';
        var metrcHding = '<div class="tbl-data-brderbtmblk"></div>';
        var metrcEmptyHding = '';
        var mainHeaderList = [];
        var theadHtml = "", metricValue = "", addBoldCls = "", addleftalgnCls = "";
        var selectedEstablishment = "";
        var columns = [];
        var sampleSizeList = getSampleSizeforCrossDiner(mainData);//to get the Individual Sample Size
        //var rowListtoPlotBody = prepareRowListForBody(mainData,sampleSizeList);//prepare body part 
        var columns = sampleSizeList;
        //Header Part - Start
        selectedEstablishment = "DINER OF " + $('.Establishment_topdiv_element').find('.filter-info-panel-lbl').text();
        theadHtml += tableHtml + '<thead><tr class="tbl-dta-rows">';
        $.each(sampleSizeList, function (indexno, col) {
            if (indexno == 0) {
                IsRestaurantorRetailer = col.IsRestRetailer;
                theadHtml += '<th class="tbl-dta-metricsHding">';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + selectedEstablishment + '</div><div class="tbl-data-brderbtmblk"></div></th><th class="emptydiv"><div class="tbl-shadow">&nbsp;</div></th>';
                theadHtml += '<th class="tbl-dta-metricsHding  ' + removeBlankSpace(col.CompareName) + '_hide " >';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + col.CompareName + '</div></th><th class="emptydiv ' + removeBlankSpace(col.CompareName) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            }
            else {
                theadHtml += '<th class="tbl-dta-metricsHding ' + removeBlankSpace(col.CompareName) + '_hide " >';
                theadHtml += '<div class="tbl-algn tbl-text-upper">' + col.CompareName + '</div></th><th class="emptydiv  ' + removeBlankSpace(col.CompareName) + '_hide "><div class="tbl-shadow">&nbsp;</div></th>';
            }
        });
        theadHtml += '</tr>';
        //Header Part - End

        //Sample Size Row - Start
        theadHtml += '<tr class="tbl-dta-rows">';
        $.each(sampleSizeList, function (SI, SV) {
            if (SI == 0) {
                theadHtml += '<td><div class="tbl-algn">SAMPLE SIZE</div></td>';
                theadHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                theadHtml += '<td class="tbl-dta-td ' + removeBlankSpace(SV.CompareName) + '_hide"><div class="tbl-algn">' + sampleSizeStatus(SV.SampleSize) + '</div></td>';
                theadHtml += '<td class="emptydiv  ' + removeBlankSpace(SV.CompareName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }
            else {
                theadHtml += '<td class="tbl-dta-td ' + removeBlankSpace(SV.CompareName) + '_hide"><div class="tbl-algn">' + sampleSizeStatus(SV.SampleSize) + '</div></td>';
                theadHtml += '<td class="emptydiv  ' + removeBlankSpace(SV.CompareName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
            }
        });
        //Sample Size Row - End

        //Body Part
        tbodyHtml = theadHtml + '<tbody>';

        var columnsCount = 0;
        $.each(columns, function (ColI, ColV) {
            //DemoFilter Heading start
            tbodyHtml += "<tr class='tbl-dta-rows fontForMetrics' onclick='toggleData(this,\"" + removeBlankSpace(ColV.CompareName) + "\")'>";
            for (var k = 0; k < columns.length; k++) {
                if (k == 0) {
                    tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr">';
                    tbodyHtml += '<div class="tbl-data-expan-collapse"><div class="tbl-data-expan-collapse_show"></div></div>';
                    //bug id 4860
                    tbodyHtml += '<div class="tbl-data-brderbtm"></div><div class="tbl-dta-demoflter"><div class="middleAlignHeader leftAlignTableText">' + ColV.CompareName + '</div></div></td><td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                    tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr ' + removeBlankSpace(ColV.CompareName) + '_hide"></td><td class="emptydiv ' + removeBlankSpace(ColV.CompareName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                }
                else {
                    tbodyHtml += '<td class="tbl-dta-td tbl-dta-rowscolr ' + removeBlankSpace(ColV.CompareName) + '_hide">&nbsp;</td><td class="emptydiv ' + removeBlankSpace(ColV.CompareName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                }
            }
            tbodyHtml += '</tr>';
            //DemoFilter Heading End

            //Body Part - Start
            $.each(mainData, function (dataI, dataV) {
                metricValue = "";
                if (ColV.CompareName == dataV.MetricParentName) {
                    if (dataV.MetricValue == null || dataV.SampleSize == null)
                        metricValue = "NA";
                    if (dataV.SampleSize < 30) {
                        metricValue = "&nbsp;"
                    }
                    else
                        metricValue = parseFloat(dataV.MetricValue * 100).toFixed(1) + "%";

                    if (dataV.ChannelFlag == "1") {
                        addBoldCls = "ischannel";
                        addleftalgnCls = "ischannel-left";
                    }
                    else {
                        addBoldCls = "issubchannel";
                        addleftalgnCls = "ischannel-left";
                    }

                    
                    if (columnsCount == 0) {
                        tbodyHtml += '<tr class="tbl-dta-rows dataShow ' + removeBlankSpace(ColV.CompareName) + '">';
                        tbodyHtml += '<td class="tbl-dta-td"><div class="tbl-algn fontForMetrics tbl-algn-left ' + addleftalgnCls + ' "><div class="middleAlign leftAlignTableText ' + addBoldCls + '">' + dataV.MetricName + '</div><div class="metricParentName">' + ColV.CompareName + '</div></div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                        tbodyHtml += '<td class="emptydiv"><div class="tbl-shadow">&nbsp;</div></td>';
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(dataV.MetricName) + ' ' + removeBlankSpace(dataV.MetricName) + '_hide"><div class="tbl-algn fontForMetrics ' + Get_Significance_Color(dataV.SampleSize) + '">' + metricValue + '</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(dataV.MetricName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                    else {
                        tbodyHtml += '<td class="tbl-dta-td ' + removeBlankSpace(dataV.MetricName) + ' ' + removeBlankSpace(dataV.MetricName) + '_hide"><div class="tbl-algn fontForMetrics ' + Get_Significance_Color(dataV.SampleSize) + '">' + metricValue + '</div><div class="tbl-data-btmbrd"></div><div class="tbl-btm-circle"></div></td>';
                        tbodyHtml += '<td class="emptydiv ' + removeBlankSpace(dataV.MetricName) + '_hide"><div class="tbl-shadow">&nbsp;</div></td>';
                    }
                    columnsCount++;
                    if (columnsCount == 3) {
                        columnsCount = 0;
                        tbodyHtml += '</tr>';
                    }
                }

            });
            //Body Part - End
        });

        tbodyHtml += '</tbody></table><div id="scrollableTable"></div>';
        $('.analyses-crossdinerFreqlayer').html(tbodyHtml);

        var heightBottomlayer;
        heightBottomlayer = $(".analyses-crossdinerFreqlayer").height();
        var options = {
            width: $(".analyses-crossdinerFreqlayer").width() - 25,
            height: heightBottomlayer,
            pinnedRows: 2,
            pinnedCols: 2,
            container: "#scrollableTable",
            removeOriginal: true
        };// tbl - data - expan - collapse
        $("#flexi-table").tablescroller(options);

        //setWidthforCrossDinerAnalysisTableColumns();//set Dynamic width based on selections
        //setMaxHeightForHedrTble();
        $('.scrollable-data-frame').width($('.scrollable-data-frame').width());
        $('.scrollable-data-frame').height($('.scrollable-data-frame').height() - 1);
        $('.scrollable-rows-frame').height($('.scrollable-data-frame').height() + 2);
        var height = $("#scrollableTable").find('.tbl-dta-rows').find('.tbl-dta-metricsHding:eq(0)').height();
        //$('.scrollable-columns-frame')
        //added by Nagaraju D for table scroll dynamic height
        SetTableResolutionCrossDiner();

        SetScroll($("#scrollableTable .scrollable-data-frame"), "#393939", 0, -8, 0, -8, 8);

        if (isRestorRetalerClicked == false) {
            if (IsRestaurantorRetailer == 1) {

                $("#cross-Retailers").removeClass("Visits-box");
                $("#cross-Retailers").removeClass("Visits-right-skew");
                $("#cross-Restaurants").addClass("Visits-box");
                $("#cross-Restaurants").addClass("Visits-right-skew");
            }
            else {
                $("#cross-Restaurants").removeClass("Visits-box");
                $("#cross-Restaurants").removeClass("Visits-right-skew");
                $("#cross-Retailers").addClass("Visits-box");
                $("#cross-Retailers").addClass("Visits-right-skew");

            }
        }
    }

    $('.excel-cancelbtn').click(function () {
        $(".transparentBG").hide();
        $('.export-excel-popup-cross').hide();
    });
    $(".excel-okbtn").click(function () {

        if ($(".checkbox-excel:checked").length == 0) {
            alert("Please Select Reports");
            return false;
        }
        filterPanelInfo = { filter: JSON.parse($("#master-btn").attr('data-val')) };
        var selectedDemofiltersList = [];
        var selectedDemofilters = $(".Demographic_Filters_topdiv_element[data-val='Demographic Filters'] div").find(".sel_text");
        $.each(selectedDemofilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().toLocaleUpperCase().trim() + ",";
        });
        var selectedAdvancefilters = $(".Advance_Filters_topdiv_element[data-val='Advance Filters'] div").find(".sel_text");
        $.each(selectedAdvancefilters, function (seltDemFiltrI, seltDemFiltrV) {
            selectedDemofiltersList += $(seltDemFiltrV).text().toLocaleUpperCase().trim() + ",";
        });
        if (selectedDemofiltersList != "")
            selectedDemofiltersList = selectedDemofiltersList.substr(0, selectedDemofiltersList.length - 1);
        var selectedChkBxIds = [];
        $(".checkbox-excel:checked").each(function () {
            selectedChkBxIds.push({ Id: this.id, Name: this.name });
        });
        var filterdata = { filter: filterPanelInfo.filter, module: controllername, selectedDemofiltersList: selectedDemofiltersList, selectedChkBxIds: selectedChkBxIds };
        downloadCrossDinerFreqncyExel(filterdata);
    });
    var downloadCrossDinerFreqncyExel = function (filterdata) {
        $(".loaderExportExcel").show();
        $(".transparentBGExportExcel").show();

        var procName = "CrossDinerFrequncyExlDwnld";
        $.ajax({
            async: true,
            url: appRouteUrl + "Analyses/" + procName,
            data: JSON.stringify(filterdata),
            method: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                $(".loaderExportExcel").hide();
                $(".transparentBGExportExcel").hide();
                //window.location.href = appRouteUrl + "Analyses/DownloadExportToExcelOtherTable?fileName=" + response;
                window.location.href = appRouteUrl + "Analyses/DownloadCrossDinerFile?fileName=" + response;
                $(".transparentBG").hide();
                $('.export-excel-popup-cross').hide();
            },
            error: ajaxError
        });
    }

    var preparePopupForCrossDinerExcel = function ()
    {
        reset_img_pos();
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $('.fltr-txt-hldr').css("color", "#000");
        $(".transparentBG").show();
        $('.export-excel-popup-cross').show();
        var getTopFiltrNames =[];
        getTopFiltrNames.push({Id:1,Name:'Restaurants'});
        getTopFiltrNames.push({Id:0,Name:'Retailers'});
        var popupHtml = "";
        $('.excel-tabslist-cross').html('');
        $.each(getTopFiltrNames, function (i, v) {
            popupHtml += '<div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" name="' + v.Name + '" class="checkbox-excel" id="' + v.Id + '"/></div><div class="excel-tab-name">' + v.Name + '</div></div>';
        });
        popupHtml += '<div class="top-line"><div><div class="excel-tabs"><div class="excel-chkbox"><input type="checkbox" class="checkbox-excel-selectall"/></div><div class="excel-tab-name">' + " Select All" + '</div></div>';
        $('.excel-tabslist-cross').append(popupHtml);
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
            }
            else {
                $(".checkbox-excel").prop("checked", false);
                $("#select-all-content-msg").hide();
            }
        });
    }

}]);

$(document).ready(function () {
    //
    $(".master_link").removeClass("active");
    $(".master_link.analyses").addClass("active");
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(4)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((21.7 * $(".master_link_a:eq(4)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
            $(".submodules-band").css("margin-left", "74.4%");
            $(".submodules-band").css("margin-top", "-0.44%");
    }
    //$(".lft-ctrl-toggle").parent().hide();
    //
    $("#exp_data").click(function () {
        var filterPanelInfo = { filter: null };
        html2canvas($('.snapshot-bottomlayer'), {

            onrendered: function (data, output) {
                base64 = data.toDataURL();
                base64 = base64.replace('data:image/png;base64,', '');
                var exportDetails = { details: { Base64: base64 } };
                $.ajax({
                    url: "/Analyses/PreparePowerPoint",
                    data: JSON.stringify(exportDetails),
                    method: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        window.location.href = "/Handlers/DownloadFile.ashx?file=" + response + "&module=snapshot";
                    }
                });
            }
        });
    });

    if (controllername == "analysesestablishmentdeepdive") {
        //Tooltip for the enabled and disabled measures
        $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1 .lft-popup-ele").hover(function () {
            // Hover over code      
            var title = $(this).attr('title');
            var GroupNamelist = [];
            var ShopperGrps = [];
            $(".master-lft-ctrl[data-val='Measures'] .lft-popup-col1").find(".lft-popup-ele-label").each(function () {
                GroupNamelist.push($(this).html());
            });
            var measurename = $(this).find(".lft-popup-ele-label").text();
            switch (measurename) {
                case "Diner Attitude Segments":
                case "Attitudinal Statements - Top 2 Box":
                    title = "This measure is valid for only Demographics, Pre-Visit, In-Establishment, In-Establishment Bev Details, Post-Visit, Beverage Guest, Establishment Frequency Groups";
                    break;
                case "Outlet Motivation Segments":
                case "Outlet Motivation Attributes - Top 2 Box":
                case "Occasion Motivation - Top 2 Box":
                    title = "This measure is valid for only Demographics, Pre-Visit, In-Establishment, In-Establishment Bev Details, Post-Visit Groups";
                    break;
                case "Beverage Guest":
                case "Establishment Imageries":
                    title = "This measure is valid for only Demographics, Beverage Guest, Establishment Frequency Groups";
                    break;
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
            $('.GeoToolTip')
                .css({ top: mousey, left: mousex })
        });

        //
    }
});

var prepareWidget = function (response, widget) {
    var htmlWidgetStr = '';
    if (response == null || response == "" || response.length == 0)
        return htmlWidgetStr;
    switch (widget.WidgetType) {

        case widgetTypes.LineChart:
        case widgetTypes.BarChart:
        case widgetTypes.ColumnChart:

            var charttype = '';
            switch (widget.WidgetType) {
                case widgetTypes.LineChart:
                    charttype = 'line';
                    break;
                case widgetTypes.BarChart:
                    charttype = 'bar';
                    break;
                case widgetTypes.ColumnChart:
                    charttype = 'column';
                    break;
                default:
                    charttype = 'bar';
                    break;
            }
            $(".snapshot-widgets").append("<div class='snapshot-widget' data-id='" + widget.WidgetId + "' id='widget" + widget.WidgetId + "' data-name='" + widget.WidgetName + "'>" + htmlWidgetStr + "</div>");
            drawD3Chart("widget" + widget.WidgetId, response.Data.Series, null, charttype);//for drawing chart
            break;

        case widgetTypes.Table:
        default:
            $(response.Data.Table.Rows).each(function (i, id) {
                var row = '<tr>', cells = '';
                $(id.Cells).each(function (y, yd) {
                    cells += '<td>' + yd.Text + '</td>';
                });
                row += cells + '</tr>';
                htmlWidgetStr += row;
            });
            htmlWidgetStr = "<table class='widget-tbl'>" + htmlWidgetStr + "</table>";
            break;
    }

    return htmlWidgetStr;
}

var replotContentArea = function () {

}

var treeXTable = function (data) {
    var avgSS = commaSeparateNumber(data[0].data[0].StatSampleSize);
    //data.forEach(function (d) {
    //    if(d.SeriesSampleSize == undefined || d.SeriesSampleSize == null){}else{
    //    avgSS = avgSS + d.SeriesSampleSize;}
    //});
    //avgSS = avgSS / data.length;
    //data=  [{ "name": 2016, "data": [{ "x": "Jan", "y": 68 }, { "x": "Feb", "y": 66.8 }, { "x": "Mar", "y": 74.6 }, { "x": "Apr", "y": 75.2 }, { "x": "May", "y": 73.7 }, { "x": "Jun", "y": 78.6 }, { "x": "Jul", "y": 78.9 }], "style": { "strokeWidth": 2, "fill": "white", "symbol": "circle" } },
    //  { "name": 2017, "data": [{ "x": "Jan", "y": 68 }, { "x": "Feb", "y": 66.8 }, { "x": "Mar", "y": 74.6 }, { "x": "Apr", "y": 75.2 }, { "x": "May", "y": 73.7 }, { "x": "Jun", "y": 78.6 }, { "x": "Jul", "y": 78.9 }], "style": { "strokeWidth": 2, "fill": "white", "symbol": "circle" } },
    //  { "name": 2018, "data": [{ "x": "Jan", "y": 68 }, { "x": "Feb", "y": 66.8 }, { "x": "Mar", "y": 74.6 }, { "x": "Apr", "y": 75.2 }, { "x": "May", "y": 73.7 }, { "x": "Jun", "y": 78.6 }, { "x": "Jul", "y": 78.9 }], "style": { "strokeWidth": 2, "fill": "white", "symbol": "circle" } }];

    var newtabledata = [];

    var row = [];
    //header column
    var selectedFrequency = $('.FREQUENCY_topdiv_element').find('.sel_text').text();
    row.push({ x: selectedFrequency, samplesize: "", significance: "", css: "grey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "",cssForUseDirectnlytd: "" });
    row.push({ x: "AVERAGE", samplesize: "", significance: "", css: "grey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    for (var i = 0; i < data.length; i++) {
        row.push({ x: data[i].name, samplesize: "", significance: "", css: "darkgrey", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "",cssForUseDirectnlytd: "" });
    }
    newtabledata.push(row);

    //measure name
    row = [];
    row.push({ x: textForHeading, samplesize: "", significance: "", css: "tbl-data-btmbrd tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    row.push({ x: " ", samplesize: "", significance: "", css: "tbl-data-btmbrd tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    for (var index = 0; index < data.length; index++) {
        row.push({ x: " ", samplesize: "", significance: "", css: "tbl-data-btmbrd tbl-dta-rowscolr", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    }
    newtabledata.push(row);

    //sample size //tbl-dta-rowscolr
    row = [];
    row.push({ x: "Sample Size <span class='asterik1'>*</span> ", samplesize: "", significance: "", css: "tbl-data-btmbrd font11 ", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    row.push({ x: avgSS == "" || avgSS == null ? "" : avgSS, samplesize: "", significance: "", css: "tbl-data-btmbrd", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    for (var index = 0; index < data.length; index++) {
        row.push({ x: data[index].SeriesSampleSize == undefined || data[index].SeriesSampleSize == "" || data[index].SeriesSampleSize == null ? "NA" : sampleSizeStatus(data[index].SeriesSampleSize), samplesize: "", significance: "", css: "tbl-data-btmbrd", dataCss: "black", useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
    }
    newtabledata.push(row);

    //data
    for (var rowlength = 0; rowlength < data[0].data.length; rowlength++) {
        row = [];
        row.push({ x: data[0].data[rowlength].x, samplesize: "", significance: "" });
        row.push({ x: data[0].data[rowlength].AVG == null || data[0].data[rowlength].AVG == undefined ? "&nbsp;" : (data[0].data[rowlength].AVG.toFixed(1) + "%"), samplesize: "", significance: "" });
        for (var i = 0; i < data.length; i++) {
            if (data[i].SeriesSampleSize > 99)
                row.push({ x: data[i].data[rowlength].y == undefined || data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "NA" : data[i].data[rowlength].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
            else if (data[i].SeriesSampleSize >= 30 && data[i].SeriesSampleSize <= 99)
                row.push({ x: data[i].data[rowlength].y == undefined || data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "NA" : data[i].data[rowlength].y.toFixed(1) + '%', samplesize: "", significance: "", css: "", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "yellowcolor", useDirectionallyForCirleCSS: "yellowcolorcircle", cssForUseDirectnlytd: "yellowcolortd" });
            else
                row.push({ x: data[i].data[rowlength].y == undefined || data[i].data[rowlength].y == "" || data[i].data[rowlength].y == null ? "&nbsp;" : data[i].SeriesSampleSize < 30 ? "&nbsp;" : data[i].data[rowlength].y.toFixed(1) + '%', samplesize: "", significance: "", css: "grey", dataCss: getFontColorBasedOnStatValue(data[i].data[rowlength].StatValue), useDirectionallyCss: "", useDirectionallyForCirleCSS: "", cssForUseDirectnlytd: "" });
            }
        newtabledata.push(row);
    }
    return newtabledata
};

var widgetTypes = { Table: 0, LineChart: 1, BarChart: 2, ColumnChart: 3 };

var scatterPlotChart = function (data, val) {
    active_Chart = 1;
    $(".chart-type").removeClass("activeChart");
    $(".scatterplot-chart").addClass("activeChart");
    //data = [{ "yVal": -0.2, "xVal": 0.10, "species": "setosa", "radialWidth": 5 },
    //            { "yVal": 0.30, "xVal": 0.10, "species": "setosa", "radialWidth": 6 },
    //            { "yVal": 0.25, "xVal": 0.25, "species": "versicolor", "radialWidth": 5 },
    //            { "yVal": 0.5, "xVal": 0.3, "species": "versicolor", "radialWidth": 3 },
    //            { "yVal": 0.7, "xVal": 0.2, "species": "setosa", "radialWidth": 4 },
    //            { "yVal": 0.15, "xVal": -0.2, "species": "setosa", "radialWidth": 12 },
    //            { "yVal": 0.5, "xVal": 0.16, "species": "PKR", "radialWidth": 5 },
    //            { "yVal": 0.5, "xVal": 0.4, "species": "MIG", "radialWidth": 2 }
    //];
    data.forEach(function (d) {
        d.yVal = +d.yVal;
        d.xVal = +d.xVal;
        d.radialWidth = +d.radialWidth;
        d.species = d.species;
        d.colorDot = d.colorDot;
        
    });
    var max_rad = d3.max(data, function (d) { return d.radialWidth });
    var margin = { top: 20, right: 100, bottom: 35, left: 100 },
    width = $("#chart-visualisation").width() - margin.left - margin.right,
    height = $("#chart-visualisation").height() - margin.top - margin.bottom;
    if (val != 1) {
        width *= Math.pow(1.1,val);
        height *= Math.pow(1.1, val);;
        $("#chart-visualisation").css("overflow", "auto");
    }
    else {
        $("#chart-visualisation").css("overflow", "hidden");
        $(".line").find("img").attr("src", "~/../../Images/line.png");
        $(".line:eq(0)").find("img").attr("src", "~/../../Images/zoomlevel.png");
    }
    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis().orient("bottom")
        .scale(x).outerTickSize(0).ticks(0);

    var yAxis = d3.svg.axis().orient("left")
        .scale(y).outerTickSize(0).ticks(0);
    var svg = d3.select("#chart-visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom).append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function (d) { return d.xVal; })).nice();
    y.domain(d3.extent(data, function (d) { return d.yVal; })).nice();
    /////////////////////////////////////////////
    var X_max = 0, X_min = 0, Y_max = 0, Y_min = 0;
    X_max = d3.max(x.domain());
    X_min = d3.min(x.domain());
    Y_max = d3.max(y.domain());
    Y_min = d3.min(y.domain());
    if (Y_max > (-Y_min)) { Y_min = -Y_max; } else { Y_max = -Y_min; }
    if (X_max > (-X_min)) { X_min = -X_max; } else { X_max = -X_min; }
    x.domain([X_min, X_max]);
    y.domain([Y_min, Y_max]);
    /*checking for origin trnlst*/
    var xTranFact = width / 2, yTranFact = height / 2;
    //var xTranFact = 0, yTranFact = height;
    //if ((X_max > 0 && X_min < 0)) { xTranFact = (-X_min / (X_max - X_min)) * width; }
    //if ((Y_max > 0 && Y_min < 0)) { yTranFact = (Y_max / (Y_max - Y_min)) * height; }
    /*checking for origin trnlst*/
    /////////////////////////////////////////////
    var tool_tip = d3.select("#chart-visualisation").append("span")
    .attr("class", "d3_tooltip")
    .style("opacity", 0);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + yTranFact + ")")
        .style("fill","transparent")
        .style("stroke", "#BBBDBF")
        .style("stroke-width","1")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Sepal Width (cm)");

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + xTranFact + ",0)")
        .style("fill", "transparent")
        .style("stroke", "#BBBDBF")
        .style("stroke-width", "1")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Sepal Length (cm)")

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function (d) { return d.radialWidth+1; })
        .attr("cx", function (d) { return x(d.xVal); })
        .attr("cy", function (d) {
            /*Text*/
            var context = d3.select(this.parentNode);
            context.append("text")
                .attr("class","dot_text")
            .attr("x", x(d.xVal))
            .attr("y", y(d.yVal) - 2*d.radialWidth)
            .text(d.species)
            .style("fill", "#000").style("text-anchor","middle");
            /*Text*/
            return y(d.yVal);
        })
        .style("fill", function (d) { return d.colorDot; })
        .style("stroke", function (d) { if (d.colorDot == "#f00") { return "#DB7783"; } return "#93B3CE"; })
        .style("stroke-width", function (d) { return 4; })
        .on("mouseover", function (d) {
            tool_tip.transition()
            .duration(200)
            .style("opacity", 1);
            tool_tip.html("<span class='tooltip_header'></span><span>"+"1." + (d.nearEle[0] === undefined ? "" : d.nearEle[0].Text) + "<br/>2." + (d.nearEle[1] === undefined ? "" : d.nearEle[1].Text) + "<br/>3." + (d.nearEle[2]===undefined?"": d.nearEle[2].Text)+"</span>")
            .style("left", (d3.event.pageX) - $(".d3_tooltip").width() / 2 + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
            .on("mouseout", function (d) {
                tool_tip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    svg.append("rect")
        .attr("x", xTranFact-15)
        .attr("y", yTranFact-1)
        .attr("width", 30)
        .attr("height", 2)
        .style("fill", "#F39D1F")
    svg.append("rect")
        .attr("x", xTranFact - 1)
        .attr("y", yTranFact - 15)
        .attr("width", 2)
        .attr("height", 30)
        .style("fill", "#F39D1F");
    svg.selectAll(".dot_text").call(horizontalWrap, 250);
}

var prepareDataForScatter = function (rData, NoOfEst) {
    var temp_data = [];
            var hd = rData.map(function (d) {
                var g = { species: d.name.replace(/\"/g, ""), xVal: +d.x, yVal: +d.y, radialWidth: 5, colorDot: "#f00", nearEle : []};
                temp_data.push(g);
            });
            temp_data.forEach(function (d, i) {
                if (i >= temp_data.length - NoOfEst) {
                    d.colorDot = "#00f";
                }
            });
            /**/
            var j = 0;
            temp_data.forEach(function (d, i) {
                var Temp_n3 = [];
                if (d.colorDot == "#00f") {
                    for (j = 0; j < temp_data.length-NoOfEst; j++) {
                        var obj_d = { Text: temp_data[j].species, dis: 0 };
                        //if (d.x.val === undefined) { d.x.val = 0; }
                        //if (d.y.val === undefined) { d.y.val = 0; }
                        //if (temp_data[j].xVal === undefined) { temp_data[j].xVal = 0; }
                        //if (temp_data[j].yVal === undefined) { temp_data[j].yVal = 0; }
                        obj_d.dis = Math.sqrt((d.xVal - temp_data[j].xVal) * (d.xVal - temp_data[j].xVal) + (d.yVal - temp_data[j].yVal) * (d.yVal - temp_data[j].yVal));
                        Temp_n3.push(obj_d);
                    }
                }
                if (d.colorDot == "#f00") {
                    for (j = temp_data.length - NoOfEst; j < temp_data.length; j++) {
                        var obj_d = { Text: temp_data[j].species, dis: 0 };
                        //if (d.x.val === undefined) { d.x.val = 0; }
                        //if (d.y.val === undefined) { d.y.val = 0; }
                        //if (temp_data[j].xVal === undefined) { temp_data[j].xVal = 0; }
                        //if (temp_data[j].yVal === undefined) { temp_data[j].yVal = 0; }
                        obj_d.dis = Math.sqrt((d.xVal - temp_data[j].xVal) * (d.xVal - temp_data[j].xVal) + (d.yVal - temp_data[j].yVal) * (d.yVal - temp_data[j].yVal));
                        Temp_n3.push(obj_d);
                    }
                }
                //sort top 3
                Temp_n3.sort(function compare(a, b) {
                    if (a.dis < b.dis)
                        return -1;
                    if (a.dis > b.dis)
                        return 1;
                    return 0;
                });
                //Store top 3;
                d.nearEle.push(Temp_n3[0],Temp_n3[1],Temp_n3[2]);
            });
            /**/
            return temp_data;

}

var resetAnalysesImages = function () {
    $(".scatterplot-chart").css("background-position", "-543px -408px");
    $(".table-R").css("background-position", "-643px -408px");
    $(".table-analyses").css("background-position", "-743px -408px");
}

var horizontalWrap = function(text, width) {
    text.each(function () {

        var text = d3.select(this),

                words = text.text().trim().split(/\s+/).reverse(),

                word,

                line = [],

                lineNumber = 0,

                lineHeight = 1.0, // ems

                y = text.attr("y"),

                x = text.attr("x"),

                dy = 0;//parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);

            }
            else {
                if (word.includes("(") && word.includes(")")) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }

        }

    });

}

var validateFilter = function () {
    if (controllername == "analysescrossDinerFrequencies") {
        if ($(".Establishment_topdiv_element .sel_text").length == 0)
            alert("Establishment is required. Please select");
        return false;
    }
    else if (controllername.toLocaleLowerCase().includes("compare")) {
        if ($(".Establishment_topdiv_element .sel_text").length < 3 || $(".Measures_topdiv_element .sel_text").length < 3) {
            return false;
        }
    } else {
        if ($(".Metric_Comparisons_topdiv_element .sel_text").length < 3 || $(".Measures_topdiv_element .sel_text").length < 3) {
            return false;
        }
    }
    return true;

}

var setMaxHeightForHedrTble = function () { //Find max height
    var maxH = 25;
    var modulename = (window.location.pathname).replace("Dine/", "").split("/")[1];
    $(".scrollable-columns-frame th.tbl-dta-metricsHding").each(function (i, d) {
        maxH = $(d).find(".tbl_align_middle")[0].offsetHeight > maxH ? $(d).find(".tbl_align_middle")[0].offsetHeight : maxH;
    });
    //Set the height of Header to max
    if (maxH > 25) { $(".tbl-dta-metricsHding").height(maxH); } else {
        $(".tbl-dta-metricsHding").height(maxH);
    }
    //Set Header part's 
        //$(".corner-frame, .scrollable-columns-frame").css("height", (maxH + 25) + "px");
}
var removethenullEstabmts = function (data, response) {
    $.each(response, function (i, v) {
        $.each(data, function (di, dv) {
            if (dv.name == v) {
                data.splice(di, 1);
                return false;
            }
        });
    });
    return data;
}

//Functions -  Related to Cross Diner Frequencies Module
var getSampleSizeforCrossDiner = function(tableData)
{
    var sampleSizeList=[];
    var sampleObj={};
    sampleObj.CompareName="";
    sampleObj.MetricName="";
    //sampleObj.MetricParentName="";
    sampleObj.SampleSize = "";
    sampleObj.IsRestRetailer = "";

    $.each(tableData, function (I, V) {
        var sampleObj = {}
        sampleObj.CompareName = "";
        sampleObj.MetricName = "";
        //sampleObj.MetricParentName = "";
        sampleObj.SampleSize = "";
        //
        //if (IS.MetricName == V.MetricName && VS.CompareName == V.CompareName) {
        if (I == 0) {
            sampleObj.CompareName = V.CompareName;
            sampleObj.MetricName = V.MetricName;
            //sampleObj.MetricParentName = V.MetricParentName;
            sampleObj.SampleSize = V.SampleSize;
            sampleObj.IsRestRetailer = V.IsRestRetailer;
            sampleSizeList.push(sampleObj);
        }
        else {
            $.each(sampleSizeList, function (SI, SV) {
                
                if (!Isduplicate(sampleSizeList,V.CompareName)) {

                    sampleObj.CompareName = V.CompareName;
                    sampleObj.MetricName = V.MetricName;
                    //sampleObj.MetricParentName = V.MetricParentName;
                    sampleObj.SampleSize = V.SampleSize;
                    sampleObj.IsRestRetailer = V.IsRestRetailer;
                    sampleSizeList.push(sampleObj);

                }
            });

        }
    });
    return sampleSizeList;
}
var Isduplicate = function (arrobj, val) {
    var isDuplicate = false;
    $.each(arrobj, function (SI, SV) {
        if (SV.CompareName == val) {
            isDuplicate = true;
        }
    });
    return isDuplicate;

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

var prepareRowListForBody = function (tabledata, tablecolumns) {
    var rowList = [];
    //row
    $.each(tablecolumns, function (ColI, ColV) {
        $.each(tabledata, function (DatI, DatV) {
            var rowObj = {};
            rowObj.MetricName = "";
            rowObj.MetricParentName = "";
            rowObj.MetricValue = "";
            rowObj.SampleSize = "";
            rowObj.IsRestaurant = "";
            rowObj.ChannelFlag = "";
            rowObj.CompareName = "";

            if (ColV.CompareName == DatV.MetricParentName) {
                rowObj.MetricName = DatV.MetricName;
                rowObj.MetricParentName = DatV.MetricParentName;
                rowObj.MetricValue = DatV.MetricValue;
                rowObj.SampleSize = DatV.SampleSize;
                rowObj.IsRestaurant = DatV.IsRestaurant;
                rowObj.ChannelFlag = DatV.ChannelFlag;
                rowObj.CompareName = DatV.CompareName;
                rowList.push(rowObj);
            }
        });
    });

}

var Get_Significance_Color = function (value)
{
    var color = "black";
    if (value == "" || value == null)
    {
        color = "black";
    }
    else if (value > 30 && value < 99) {
        color = "gray";
    }

    return color;
}


//Functions -  Related to Cross Diner Frequencies Module