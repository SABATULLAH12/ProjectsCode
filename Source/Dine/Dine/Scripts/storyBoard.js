/// <reference path="jquery-3.0.0.min.js" />

mainApp.controller("storyboardController", ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    getReports();
    $scope.isEditMode = false;
    //getSharedReports();$.parseJSON(data.OutputData).ChartType
    var j_activeSlideID = [];
    var j_activeSlideIDList = [];
    var j_selectedSlideObj = [];
    var slidePosition = [];
    var checkNavigationClicked = "false";
    $scope.activeLeftPanelfunc = "myFiles()";
    $scope.activeTable = "table-myfiles";
    $scope.reports = [];
    $scope.slides = [];
    $scope.getTimeStamp = new Date().getTime();
    $scope.shareReportText = {};
    $scope.sharedByMeReports = [];
    $scope.sharedWithMeReports = [];
    $scope.activeReportID = '';
    $scope.activeSlideID = '';
    $scope.reportDetails = {};
    $scope.saveAsReportText = '';
    $scope.UpdateDetails = {};
    $scope.notesText = '';
    $scope.notesDetails = [];
    $scope.userAndGroup = [];
    $scope.selectedSlideObj = {};
    $scope.activeOption = '';
    $scope.flag = 1;
    $scope.IsNameExist = 0;
    $scope.customDownloadList = [];
    $scope.SaveCustomDownloadText = '';
    $scope.CustomDownloadSavedList = [];
    $scope.SelectedCustomDownload = {};
    $scope.reportName = '';
    $scope.activeFilter = 'myFiles';
    $scope.refreshMain = function () {
        $scope.$eval($scope.activeLeftPanelfunc);
    }
    $scope.refreshSubLevel = function () {
        //find the active report selected
        var active_row_ID = $(".table-content-row.active_row").attr("data-id");
        var editOrView = $(".edit-storyboard-menu-list").css("display") != "none";
        ////back to report
        //$scope.backtoreport();

        //click the active report td
        $timeout(function () {
            //angular.element('.table-content-row[data-id="' + active_row_ID + '"]').triggerHandler('click');
            //click edit/view
            if (editOrView) {
                $(".storyboard-menu-list.common").find(".menu.edit");
                angular.element('.storyboard-menu-list.common .menu.edit').triggerHandler('click');
            } else {
                angular.element('.storyboard-menu-list.common .menu.view').triggerHandler('click');
            }
        }, 0);
    }
    $scope.backtoreport = function ($event) {
        checkNavigationClicked = "true";
        $(".edit-storyboard-menu-list").hide();
        //find the active report selected
        var active_row_ID = $(".table-content-row.active_row").attr("data-id");
        showLeftPanel();
        $scope.$eval($scope.activeLeftPanelfunc);
        $timeout(function () {
            $scope.isEditMode = false;
            if (active_row_ID != undefined || active_row_ID != null) {
                angular.element('.' + $scope.activeTable + ' .table-content-row[data-id="' + active_row_ID + '"]').triggerHandler('click');
            }
            $event.stopPropagation();
            $(".menu.custom-download").removeClass('hoverIn');
            $(".menu.custom-download").removeClass('active');
        }, 100);
    }

    var SaveOrUpdate = true;
    $scope.saveAsFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to save");
        else {
            $scope.activeOption = 'saveas';
            $(".saveAsPopup,.transparentBG").show();
            $('.report-input').find('input').focus();
            SaveOrUpdate = true;
        }
    }

    $scope.hidesaveAsPopup = function () {
        $(".saveAsPopup,.transparentBG").hide();
    }

    $scope.selectSlide = function (Id, event, obj, indexOfSlide) {
        var indx = j_activeSlideID.indexOf(Id);
        var activeIndex = j_selectedSlideObj.indexOf(obj);
        var pos = slidePosition.indexOf(indexOfSlide);
        if (pos != -1) {
            slidePosition.splice(pos, 1);
            j_activeSlideID.splice(indx, 1);
            j_selectedSlideObj.splice(activeIndex, 1);
            var ele = event.currentTarget;
            $(ele).find(".slide-background").removeClass("active_slide");
            $(ele).find(".slide-number").removeClass("slide-number-active");
            $(ele).find(".comment-section").removeClass("comment_active");
            $(ele).find(".comment-section-container").removeClass("comment-section-container_active");

        }
        else {
            slidePosition.push(indexOfSlide);
            j_activeSlideID.push(Id);
            j_selectedSlideObj.push(obj);
            var ele = event.currentTarget;
            $(ele).find(".slide-background").addClass("active_slide");
            $(ele).find(".slide-number").addClass("slide-number-active");
            $(ele).find(".comment-section").addClass("comment_active");
            $(ele).find(".comment-section-container").addClass("comment-section-container_active");


        }
        $scope.selectedSlideObj = JSON.stringify(obj);
        $scope.activeSlideID = Id;
    }

    $scope.highlight_div = function () {
        var ele = event.currentTarget;
        $(ele).find(".slide-background").addClass("mouseover_active_slide");
        $(ele).find(".slide-number").addClass("mouseover_slide-number-active");
        $(ele).find(".comment-section").css("background", "#ea1f2a");
        $(ele).find(".comment-section-container").css("border-color", "#ea1f2a");

    }

    $scope.myFiles = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $(".myfiles-heading").show();
        $(".myfavourites-heading").hide();
        $scope.activeLeftPanelfunc = "myFiles()";
        $scope.activeTable = "table-myfiles";
        $(".search-input-top").show();
        reset_storyboard_img();
        $(".folder-img").css("background-position", "-884px -145px");
        $(".folder-img").css("background-color", "#353135");
        $scope.activeFilter = 'myFiles';
        $scope.activeReportID = '';
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
        $(".table-content-row").removeClass("active_row");
        $(".table-content-col").removeClass("active_row");
        $(".table-sharedfiles-content").hide();
        $(".common").show();
        $(".storyboard-search").show();
        $(".table_fav_header_div").hide();
        $(".my-fav-content").hide();

        $(".reportTable_holder").show();
        $(".master-view-content").css("background-image", "none");
        $(".table_header_div").show();
        $(".view-storyboard-menu-list").hide();
        $(".edit-storyboard-menu-list").hide();
        $(".view-content").hide();
        $(".remove-favorite").hide();
        $(".my-favorite").show();
        $(".table-content tr").mouseenter(function () {
            $(this).addClass("div_reportTable_mouseenter");
            hideLoader();
        });

        $(".table-content tr").mouseleave(function () {
            $(this).removeClass("div_reportTable_mouseenter");
            hideLoader();
        });

        getReports();
    }
    $scope.sharedFiles = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $(".myfiles-heading").hide();
        $(".myfavourites-heading").hide();
        $scope.activeReportID = '';
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
        $scope.activeLeftPanelfunc = "sharedFiles()";
        $scope.activeTable = "table-sharedfiles-content";
        $(".search-input-top").show();
        reset_storyboard_img();
        $(".share-img").css("background-position", "-999px -147px");
        $(".share-img").css("background-color", "#353135");
        $scope.activeFilter = 'sharedFiles';
        $scope.activeReportID = '';
        $(".table-content-row").removeClass("active_row");
        $(".table-content-col").removeClass("active_row");
        $(".reportTable_holder").hide();
        $(".table_header_div").hide();
        $(".table-sharedfiles-content").show();
        $(".master-view-content").css("background-image", "none");

        $(".table_fav_header_div").hide();
        $(".my-fav-content").hide();
        $(".common").show();
        $(".storyboard-search").show();
        $(".view-storyboard-menu-list").hide();
        $(".view-content").hide();
        $(".remove-favorite").hide();
        $(".my-favorite").show();
        $(".table-content tr").mouseenter(function () {
            $(this).addClass("div_reportTable_mouseenter");
            hideLoader();
        });

        $(".table-content tr").mouseleave(function () {
            $(this).removeClass("div_reportTable_mouseenter");
            hideLoader();
        });
        getSharedByMeReports();
        getSharedWithMeReports();
        SetScroll($(".storyboard-content .reportSharedTable_holder"), "#353135", 0, 0, 0, -8, 8, false);
        SetScroll($(".storyboard-content .reportSharedWithTable_holder"), "#353135", 0, 0, 0, -8, 8, false);
    }
    $scope.myFavouriteFiles = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $(".myfiles-heading").hide();
        $(".myfavourites-heading").show();
        $scope.activeReportID = '';
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
        $scope.activeLeftPanelfunc = "myFavouriteFiles()";
        $scope.activeTable = "table-favFiles";
        $(".search-input-top").show();
        $(".storyboard-search").show();
        $(".storyboard-menu-list").hide();
        $(".common").show();
        $(".view-content").hide();
        reset_storyboard_img();
        $(".myfavorite-img").css("background-position", "-1108px -148px");
        $(".myfavorite-img").css("background-color", "#353135");
        $scope.activeFilter = 'myFavouriteFiles';
        $(".remove-favorite").show();
        $(".my-favorite").hide();
        $(".reportTable_holder").hide();
        $(".table_header_div").hide();
        $(".table-sharedfiles-content").hide();
        $(".table_fav_header_div").show();
        $(".my-fav-content").show();

        $(".loader").show();

        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetFavoriteReports",
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.reports = response;
                $scope.$digest();
                $(".loader").hide();
            },
            error: ajaxError
        });
        SetScroll($(".storyboard-content .my-fav-content"), "#353135", 0, 0, 0, -8, 8, false);
    }

    $scope.showNotesPopup = function (Id) {//GetSlideNotes(int SlideID)
        $(".loader,.transparentBG").show();
        $scope.activeSlideID = Id;
        getSlideDetails($scope.activeSlideID);
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetSlideNotes?SlideID=" + $scope.activeSlideID,
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.notesDetails = response;
                $(".notesPopup").show();
                $scope.$digest();
                $(".loader").hide();
            },
            error: ajaxError
        });
    }

    function getSlideDetails(slideID) {
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetSlideDetails?SlideID=" + $scope.activeSlideID,
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.UpdateDetails = response;
                $scope.$digest();
            },
            error: ajaxError
        });
    }

    $scope.addComments = function (Id, data) {
        var data = { ReportID: $scope.activeReportID };
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/LockReport",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {

                var data = JSON.parse($scope.selectedSlideObj);
                $(".loader").hide();
                if (response == "Successful")
                    window.location.href = appRouteUrl + "Chart/" + data.Module.replace("chart", "") + "?editComments=" + Id + "_" + $scope.activeReportID + "&isEdited=" + $scope.isEditMode + "&activeTab=" + $scope.activeLeftPanelfunc;
                else
                    showMaxAlert(response);
            },
            error: ajaxError
        });
    }

    $scope.notesCancel = function () {
        $(".notesPopup,.transparentBG").hide();
    }

    $scope.no_notesCancel = function () {
        $(".validation-popup").hide();
        $(".transparentBG").css("z-index", 1001);
        $(".transparentBG").css("background-color", "lightslategray");
    }


    $scope.saveNotes = function () {
        var noteVar = $scope.notesText;

        if (noteVar.trim() == "") {
            $(".validation-popup").show();
            $(".validation-popup").find(".validation-content").find(".validation-custdiv").text("Please enter note(s).");
            $(".transparentBG").css("z-index", 1004);
            $(".transparentBG").css("background-color", "lightslategray");
        }
        else {
            $(".loader").show();
            var data = { SlideId: $scope.activeSlideID, Text: $scope.notesText }
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/AddNotes",
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    $scope.notesDetails.push({ Text: $scope.notesText });
                    $scope.notesText = "";
                    $scope.showNotesPopup($scope.activeSlideID);
                    $scope.$digest();
                    $(".loader").hide();
                    $(".validation-popup").show();
                    $(".validation-popup").find(".validation-content").find(".validation-custdiv").text("Successfully saved");
                    $(".transparentBG").css("z-index", 1004);
                    $(".transparentBG").css("background-color", "lightslategray");
                },
                error: ajaxError
            });
        }
        $(".notes-inputText").val('');
    }

    $scope.reportClicked = function (ID, event, x) {
        $(".table-content-row").removeClass("active_row");
        $(".table-content-col").removeClass("active_row");
        var ele = event.currentTarget;
        $(ele).addClass("active_row");
        $(ele).find(".table-content-col").addClass("active_row");
        $scope.reportName = x.Name;
        $scope.activeReportID = ID;
    }

    $scope.saveBtnFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to save");
        else if ($scope.saveAsReportText == "") {
            showMaxAlert("Please add name to report");
        }
        else {
            $(".loader,.transparentBG").show();
            $scope.flag = 1;
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            var procName = '';
            if ($scope.activeOption == 'update')
                procName = 'updateReport';
            else
                procName = 'SaveAsReport';
            if (procName == "SaveAsReport" || procName == "updateReport") {
                $scope.IsNameExist = 0;
                for (i = 0; i < $scope.reports.length; i++) {
                    var rptdata = $scope.reports[i];
                    if (angular.lowercase(rptdata.Name) == angular.lowercase($scope.saveAsReportText)) {
                        $scope.IsNameExist = 1;
                        $(".loader").hide();
                        $(".saveAsPopup,.transparentBG").hide();

                        if (procName == "SaveAsReport") {
                            //New custom confirm box called here
                            $scope.ConfirmBoxObject.Show("Report name already exist", $scope.saveAsFunction, false);
                        }
                        else if (procName == "updateReport") {
                            //New custom confirm box called here
                            $scope.ConfirmBoxObject.Show("Report name already exist", $scope.updateFunction, false);
                        }
                    }
                }
            }
            //clear the input box
            $(".report-text").val('');
            if ($scope.IsNameExist == 0) {
                var data = { ReportId: $scope.activeReportID, ReportName: $scope.saveAsReportText }
                $.ajax({
                    url: appRouteUrl + "StoryBoard/Story/" + procName,
                    data: JSON.stringify(data),
                    method: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        if (procName == "updateReport") {
                            showMaxAlert("Report is updated successfully");
                        }
                        else {
                            showMaxAlert("Report is saved successfully");
                        }
                        $scope.refreshMain();
                        //getReports();
                        $scope.$digest();
                        $(".loader").hide();
                        $(".saveAsPopup,.transparentBG").hide();
                    },
                    error: ajaxError
                });
            }
        }
    }

    $scope.updateFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to update");
        else {
            $scope.activeOption = 'update';
            $scope.flag = 1;
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            $(".saveAsPopup,.transparentBG").show();
            $('.report-input').find('input').focus();
            SaveOrUpdate = false;
        }
    }
    $scope.editFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $scope.clearCustomDownloadEntries();
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                $(".table_fav_header_div").hide();
                $(".my-fav-content").hide();
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                $(".table_fav_header_div").hide();
                $(".my-fav-content").hide();
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "") {
            showMaxAlert("Please select report to edit");
        }
        else {
            $(".table_fav_header_div").hide();
            $(".my-fav-content").hide();
            hideLeftPanel();
            $scope.active_row_ID = $(".table-content-row .active_row").attr("data-id");
            $scope.activeOption = 'edit';
            $(".storyboard-menu-list").hide();
            $scope.flag = 1;
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            $(".edit-storyboard-menu-list").show();
            $(".storyboard-search").hide();
            $(".reportTable_holder").hide();
            $(".table_header_div").hide();
            $(".table-sharedfiles-content").hide();
            $(".view-content").show();
            $(".view-header-text").html($scope.reportName);
            getAllSlidesOfReport();
            $scope.isEditMode = true;
        }
        $(".helpdoc-download").hide();
    }

    $scope.customDownloadHideShow = function (flag) {

        //$(".custom-download").find(".download-img").css("background-position", "-464px -607px");
        //$(".menu.custom-download").find(".menu-img").css("border", "solid 2px red");
        //$(".menu.custom-download").find(".menu-label:eq(0)").css("color", "red");

        if (flag == 1) {
            $scope.flag = 0;
            $(".menu.custom-download").addClass('active');
            $(".custom_download").css("display", "inline-block");
            $(".view-thumbnails").css("width", "77%");
            //Shrink the tiles
            $(".slide-thumbnail").removeClass("slide-thumbnail-cst");
            $(".comment-text").removeClass("comment-text-cst");
            $(".slide-info").removeClass("slide-info-cst");
            $(".helpdoc-download").show();
            $scope.getCustomDownloadList();
        } else {
            $scope.flag = 1;
            $(".menu.custom-download").removeClass('active');
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            //Widen the tiles
            $(".slide-thumbnail").addClass("slide-thumbnail-cst");
            $(".comment-text").addClass("comment-text-cst");
            $(".slide-info").addClass("slide-info-cst");
            $(".helpdoc-download").hide();
        }
    }

    $scope.HelpdocDownload = function () {
        var response = "~/Templates/Dine_Custom Download_Help Document.pdf";
        $(".loader,.transparentBG").show();
        $(".loader,.transparentBG").hide();
        window.location.href = appRouteUrl + "StoryBoard/Story/HelpDocDownload?path=" + response;

    }

    $scope.downloadSlides = function () {
        $(".helpdoc-download").hide();
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if (j_activeSlideID.length == 0) {
            showMaxAlert("Please select slide to Download");
        }
        else {
            $scope.flag = 1;
            $(".menu.standard-download").addClass('active');
            $(".menu.custom-download").removeClass('active');
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            //Widen the tiles
            $(".slide-thumbnail").addClass("slide-thumbnail-cst");
            $(".comment-text").addClass("comment-text-cst");
            $(".slide-info").addClass("slide-info-cst");
            $(".helpdoc-download").hide();
            $scope.activeOption = 'downloadSlides';
            window.location.href = appRouteUrl + "StoryBoard/Story/DownloadSlides?slides=" + j_activeSlideID;

            //$timeout(function () {
            //    $(".transparentBG").hide();
            //    $(".loader").hide();
            //}, 10);
        }

    }

    $scope.addSlidesToCustomDownload = function () {
        if (j_activeSlideID.length == 0) {
            showMaxAlert("Please select slide to add");
        }
        else {
            $(".custom-radio").prop("checked", false);
            //$(".custom-download-slide-row").css("color", "#000");
            $(".custom-download-slide-row").removeClass("active_row");
            if (j_selectedSlideObj.length == 3) {
                for (var i = 1; i < 3; i++) {
                    if (JSON.parse(j_selectedSlideObj[i].OutputData).ChartType == "table") {
                        var tempObj = j_selectedSlideObj[0];
                        j_selectedSlideObj[0] = j_selectedSlideObj[i];
                        j_selectedSlideObj[i] = tempObj;
                        var tempId = j_activeSlideID[0];
                        j_activeSlideID[0] = j_activeSlideID[i];
                        j_activeSlideID[i] = tempId;
                        var tempPos = slidePosition[0];
                        slidePosition[0] = slidePosition[i];
                        slidePosition[i] = tempPos;
                    }
                    if (JSON.parse(j_selectedSlideObj[i].Filter)[0].active_chart_type == "barchange" || JSON.parse(j_selectedSlideObj[i].Filter)[0].active_chart_type == "barwithchange") { //JSON.parse(j_selectedSlideObj[i].OutputData).ChartType
                        var tempObj = j_selectedSlideObj[0];
                        j_selectedSlideObj[0] = j_selectedSlideObj[i];
                        j_selectedSlideObj[i] = tempObj;
                        var tempId = j_activeSlideID[0];
                        j_activeSlideID[0] = j_activeSlideID[i];
                        j_activeSlideID[i] = tempId;
                        var tempPos = slidePosition[0];
                        slidePosition[0] = slidePosition[i];
                        slidePosition[i] = tempPos;
                    }
                }
            }
            if (validateSlides(j_selectedSlideObj)) {
                var IDs = '', SlideIDs = ''; SName = '';
                for (i = 0; i < slidePosition.length; i++) {
                    if (i == 0) {
                        IDs = "" + slidePosition[i];
                        SlideIDs = "" + j_activeSlideID[i];
                        SName = "" + JSON.parse(j_selectedSlideObj[i].OutputData).ChartType;
                    }
                    else {
                        IDs += "," + slidePosition[i];
                        SlideIDs += "," + j_activeSlideID[i];
                        SName += "," + JSON.parse(j_selectedSlideObj[i].OutputData).ChartType;
                    }
                }
                var name = "Slide " + ($scope.customDownloadList.length + 1);
                $scope.customDownloadList.push({ SlideName: name, SlideIndex: IDs, SlideIds: SlideIDs, ReportId: $scope.activeReportID, Name: SName });
                slidePosition = [];
                j_activeSlideID = [];
                j_selectedSlideObj = [];
                $scope.clearTileSelections();

            }
        }
        SetScroll($(".storyboard-content .custom-download_slides_content"), "#353135", 0, -10, 0, -8, 8);
    }

    var deleteActionMethod = function () {
        $(".loader").show();
        var data = { ReportId: $scope.activeReportID }
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/DeleteReport",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $scope.reportDetails = response;
                getReports();
                $(".loader").hide();
                $scope.refreshMain();
            },
            error: ajaxError
        });
    }

    $scope.deleteFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if (($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined)
                    &&
                    ($scope.sharedWithMeReports == null || $scope.sharedWithMeReports.length == 0 || $scope.sharedWithMeReports == undefined)) {
                    showMaxAlert("Please share report first");
                    return;
                }
                var findStatus = false;
                angular.forEach($scope.sharedWithMeReports, function (i, v) {
                    if (i.Id == $scope.activeReportID) {
                        findStatus = true;
                        return false;
                    }
                });
                if (findStatus) {
                    showMaxAlert("User is not authorized to delete the report.");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to delete");
        else {
            //New custom confirm box called here
            $scope.ConfirmBoxObject.Show("Are you sure you want to delete " + $scope.reportName + " ?", deleteActionMethod);
        }
        //$scope.myFiles();
    }

    var deleteSlideActionMethod = function () {
        $(".loader").show();
        var data = { slides: j_activeSlideID }
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/DeleteSlide",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                showMaxAlert(response);
                getAllSlidesOfReport();
                $(".loader").hide();
            },
            error: ajaxError
        });

        $scope.activeSlideID = "";
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
    }
    $scope.deleteSlideFunction = function () {
        if ($scope.activeSlideID == "") {
            showMaxAlert("Please select report to delete");
        }
        else {
            //New custom confirm box called here
            $scope.ConfirmBoxObject.Show("Are you sure you want to delete ?", deleteSlideActionMethod);
        }
    }
    $scope.downloadFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to download");
        else {
            $(".loader").show();
            $scope.activeOption = 'download';
            window.location.href = appRouteUrl + "StoryBoard/Story/DownloadReport?ReportId=" + $scope.activeReportID;
            $(".loader").hide();
        }
    }
    $scope.viewFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $scope.clearCustomDownloadEntries();
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to view");
        else {
            hideLeftPanel();
            $scope.activeOption = 'view';
            $scope.flag = 1;
            $(".custom_download").css("display", "none");
            $(".view-thumbnails").css("width", "100%");
            $(".storyboard-menu-list").hide();
            $(".storyboard-search").hide();
            $(".reportTable_holder").hide();
            $(".table_header_div").hide();
            $(".master-view-content").css("background-image", "none");
            $(".table-sharedfiles-content").hide();

            $(".view-content").show();
            $(".table_fav_header_div").hide();
            $(".my-fav-content").hide();
            $(".view-header-text").html($scope.reportName);
            getAllSlidesOfReport();

            if ($scope.isEditMode == true) {
                $(".edit-storyboard-menu-list").show();
            }
            else
                $(".view-storyboard-menu-list").show();
        }
    }
    $scope.myfavourite = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to add to favorite");
        else {
            $(".loader,.transparentBG").show();
            var data = { ReportId: $scope.activeReportID };
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/AddReportToFavorite",
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    $(".loader,.transparentBG").hide();
                    //rptdata = response;
                    if (response == true || response == "True") {
                        showMaxAlert("Report successfully added to my favorites");
                    } else {
                        showMaxAlert('Report is already added to Favorites');
                    }
                    // window.location.href = appRouteUrl + "Chart/EstablishmentCompare?id=3";
                },
                error: ajaxError
            });
        }
    }
    $scope.removefourites = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "")
            showMaxAlert("Please select report to unfavorite");
        else {
            $(".loader").show();
            var data = { ReportId: $scope.activeReportID }
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/RemoveMyFavorite",
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    $scope.myFavouriteFiles();
                    $scope.$digest();
                    $(".loader").hide();
                    showMaxAlert("Report successfully removed from my favorites.");
                },
                error: ajaxError
            });
        }
    }

    $scope.navigateToChartToEdit = function () {
        if ($scope.activeSlideID != '') {
            if (j_activeSlideID.length == 1) {
                var data = { ReportID: $scope.activeReportID };
                $(".loader").show();
                $.ajax({
                    url: appRouteUrl + "StoryBoard/Story/LockReport",
                    data: JSON.stringify(data),
                    method: "POST",
                    contentType: "application/json",
                    success: function (response) {
                        var data = JSON.parse($scope.selectedSlideObj);
                        $(".loader").hide();
                        if (response == "Successful")
                            window.location.href = appRouteUrl + "Chart/" + data.Module.replace("chart", "") + "?editslideID=" + data.Id + "_" + $scope.activeReportID + "&isEdited=" + $scope.isEditMode + "&activeTab=" + $scope.activeLeftPanelfunc;
                        else
                            showMaxAlert(response);
                    },
                    error: ajaxError
                });
            }
            else {
                showMaxAlert("Please select single slide to edit");
            }
        } else {
            showMaxAlert("Please select a chart tile to edit");
        }
    }

    $scope.navigateToChartToView = function () {
        if (j_activeSlideID.length == 1) {
            var data = JSON.parse($scope.selectedSlideObj);
            window.location.href = appRouteUrl + "Chart/" + data.Module.replace("chart", "") + "?viewslideID=" + data.Id + "_" + $scope.activeReportID + "&isEdited=" + $scope.isEditMode + "&activeTab=" + $scope.activeLeftPanelfunc;
        }
        else {
            showMaxAlert("Please select single slide to view");
        }
    }

    function getAllSlidesOfReport() {
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetReportSlides?reportId=" + $scope.activeReportID,
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.slides = response;
                $scope.$digest();
                $(".loader").hide();
            },
            error: ajaxError
        });
        SetScroll($(".storyboard-content .view-thumbnails"), "#e5212b", 0, 0, 0, -8, 8);
    }

    $scope.shareFunction = function () {
        if ($scope.activeFilter != "") {
            if ($scope.activeFilter == 'myFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please create report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'sharedFiles') {
                if ($scope.sharedByMeReports == null || $scope.sharedByMeReports.length == 0 || $scope.sharedByMeReports == undefined) {
                    showMaxAlert("Please share report first");
                    return;
                }
            }
            else if ($scope.activeFilter == 'myFavouriteFiles') {
                if ($scope.reports == null || $scope.reports.length == 0 || $scope.reports == undefined) {
                    showMaxAlert("Please add report to favorite first");
                    return;
                }
            }
        }
        if ($scope.activeReportID == "") {
            showMaxAlert("Please select report to share");
            return;
        }
        else {
            $scope.userOrGroup = 'User';
            getUserToShare();
        }
    }

    $scope.convertToDate = function (date) {
        if (date != null) {
            var regex = /-?\d+/;
            var jsonDate = regex.exec(date);
            var dateOriginal = new Date(parseInt(jsonDate[0]));
            //return dateOriginal;
            return new Date(dateOriginal.getTime() - (dateOriginal.getTimezoneOffset() * 60 * 1000));
        }
        //return Date.now();
        return new Date();
    }
    function getReports() {
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetReports",
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.reports = response;
                $scope.$digest();
                $(".loader").hide();
                checkNavigation();
            },
            error: ajaxError
        });
    }
    function getSharedByMeReports() {
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetSharedByMeReports",
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.sharedByMeReports = response;
                $scope.$digest();
                $(".loader").hide();
            },
            error: ajaxError
        });
    }
    function getSharedWithMeReports() {
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetSharedWithMeReports",
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $scope.sharedWithMeReports = response;
                $scope.$digest();
                $(".loader").hide();
            },
            error: ajaxError
        });
    }

    $scope.getUsers = getUserToShare;
    $scope.getGroups = getGroupsToShare;
    function getUserToShare() {
        $(".loader,.transparentBG").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetUsersToShare",
            method: "GET",
            cache: false,
            contentType: "application/json",
            success: function (response) {
                $(".loader").hide();
                $('.sharePopup').show();
                $scope.userList = response;
                $scope.shareReportText = $scope.userList[0];
                searchFunctionalityForShare(response);
                //Apply nicescroll
                if ($(".ui-autocomplete").getNiceScroll().length == 0) {
                    SetScroll($(".ui-autocomplete"), "#EB1F2A", 0, 0, 0, 0, 8, false);
                }
                $scope.$digest();

            },
            error: ajaxError
        });
    }


    function getGroupsToShare() {
        $(".loader").show();
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetGroupsToShare",
            method: "GET",
            contentType: "application/json",
            success: function (response) {
                $('.sharePopup').show();
                $scope.groupList = response;
                $scope.shareReportText = $scope.groupList[0];
                $scope.$digest();
                $(".loader").hide();
            },
            error: function () {
                $(".loader").hide();
                ajaxError;
            }
        });
    }


    $scope.share_report_toggle = function () {
        //$('.toggle').click(function () {
        //    $('.toggle').toggleClass('group_active user_active');
        //});
        //$(".toggle_class").toggle(function () {
        //    $('.toggle_class').removeClass("user_active").addClass("group_active"); 

        //}, function () {
        //    $('.toggle_class').removeClass("group_active").addClass("user_active"); 

        //});
        //$('.toggle_class').click(function () {
        if ($('.toggle_class').hasClass('user_active')) {
            $('.toggle_class').removeClass('user_active');
            $('.toggle_class').addClass('group_active');
            $('.toggle_class').attr('value', 'Group');
            getGroupsToShare();
        }
        else {
            $('.toggle_class').removeClass('group_active');
            $('.toggle_class').addClass('user_active');
            $('.toggle_class').attr('value', 'User');
            getUserToShare();
        }

        //});
    }

    $scope.hidesharePopup = function () {
        $(".sharePopup,.transparentBG").hide();
    };

    $scope.hoverInCustom = function () {

        var ele = event.currentTarget;
        $(ele).addClass("div_reportTable_mouseenter");
    };

    $scope.hoverOutCustom = function () {

        var ele = event.currentTarget;
        $(ele).removeClass("div_reportTable_mouseenter");
    };
    $scope.hoverIn = function () {
        var ele = event.currentTarget;
        $(ele).addClass("div_reportTable_mouseenter");
    };

    $scope.hoverOut = function () {
        var ele = event.currentTarget;
        $(ele).removeClass("div_reportTable_mouseenter");
    };

    $scope.hoverInStandardDownload = function () {
        $(".standard-download").find(".download-img").css("background-position", "-466px -607px");
        $(".menu.standard-download").find(".menu-img").css("border", "solid 2px red");
        $(".menu.standard-download").find(".menu-label:eq(0)").css("color", "red");
    }
    $scope.hoverOutStandardDownload = function () {
        $(".standard-download").find(".download-img").css("background-position", "-413px -607px");
        $(".menu.download").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.download").find(".menu-label:eq(0)").css("color", "#7e7e7e");
    }

    $scope.hoverInDownload = function () {
        $(".download-img").css("background-position", "-466px -607px");
        $(".menu.download").find(".menu-img").css("border", "solid 2px red");
        $(".menu.download").find(".menu-label:eq(0)").css("color", "red");
    }
    $scope.hoverOutDownload = function () {
        $(".download-img").css("background-position", "-413px -607px");
        $(".menu.download").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.download").find(".menu-label:eq(0)").css("color", "#7e7e7e");
    }
    $scope.hoverInCustomDownload = function () {
        $(".menu.custom-download").addClass('hoverIn');
        //$(".custom-download").find(".download-img").css("background-position", "-464px -607px");
        //$(".menu.custom-download").find(".menu-img").css("border", "solid 2px red");
        //$(".menu.custom-download").find(".menu-label:eq(0)").css("color", "red");
    }
    $scope.hoverOutCustomDownload = function () {
        $(".menu.custom-download").removeClass('hoverIn');
        //$(".custom-download").find(".download-img").css("background-position", "-411px -607px");
        //$(".menu.custom-download").find(".menu-img").css("border", "solid 2px #808080");
        //$(".menu.custom-download").find(".menu-label:eq(0)").css("color", "#7e7e7e");
    }

    $scope.hoverInHelpdocDownload = function () {
        $(".helpdoc-download").find(".helpdoc-img").css("background-position", "-943px -607px");
        $(".menu.helpdoc-download").find(".menu-img").css("border", "solid 2px red");
        $(".menu.helpdoc-download").find(".menu-label:eq(0)").css("color", "red");
        $(".menu.helpdoc-download").addClass('hoverIn');
    }

    $scope.hoverOutHelpdocDownload = function () {
        $(".menu.helpdoc-download").addClass('hoverOut');
        $(".helpdoc-download").find(".helpdoc-img").css("background-position", "-894px -607px");
        $(".menu.helpdoc-download").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.helpdoc-download").find(".menu-label:eq(0)").css("color", "#7e7e7e");
    }
    $scope.hoverOutView = function () {
        $(".view-img").css("background-position", "-94px -607px");
        $(".menu.view").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.view").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInView = function () {
        $(".view-img").css("background-position", "-147px -607px");
        $(".menu.view").find(".menu-img").css("border", "solid 2px red");
        $(".menu.view").find(".menu-label").css("color", "red");
    }
    $scope.hoverInRefresh = function () {
        $(".refresh-image").css("background-position", "-1046px -606px");
        $(".menu.refresh").find(".menu-img").css("border", "solid 2px red");
        $(".menu.refresh").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutRefresh = function () {
        $(".refresh-image").css("background-position", "-993px -606px");
        $(".menu.refresh").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.refresh").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInSave = function () {
        $(".save-as-img").css("background-position", "-42px -606px");
        $(".menu.save-as").find(".menu-img").css("border", "solid 2px red");
        $(".menu.save-as").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutSave = function () {
        $(".save-as-img").css("background-position", "10px -606px");
        $(".menu.save-as").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.save-as").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInEdit = function () {
        $(".edit-img").css("background-position", "-255px -606px");
        $(".menu.edit").find(".menu-img").css("border", "solid 2px red");
        $(".menu.edit").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutEdit = function () {
        $(".edit-img").css("background-position", "-200px -606px");
        $(".menu.edit").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.edit").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInUpdate = function () {
        $(".update-img").css("background-position", "-361px -606px");
        $(".menu.update").find(".menu-img").css("border", "solid 2px red");
        $(".menu.update").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutUpdate = function () {
        $(".update-img").css("background-position", "-309px -607px");
        $(".menu.update").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.update").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInShare = function () {
        $(".share-as-img").css("background-position", "-572px -607px");
        $(".menu.share").find(".menu-img").css("border", "solid 2px red");
        $(".menu.share").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutShare = function () {
        $(".share-as-img").css("background-position", "-519px -607px");
        $(".menu.share").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.share").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInDelete = function () {
        $(".delete-img").css("background-position", "-675px -607px");
        $(".menu.delete").find(".menu-img").css("border", "solid 2px red");
        $(".menu.delete").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutDelete = function () {
        $(".delete-img").css("background-position", "-625px -607px");
        $(".menu.delete").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.delete").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInFavorite = function () {
        $(".addto-myfavorite-img").css("background-position", "-783px -607px");
        $(".menu.my-favorite").find(".menu-img").css("border", "solid 2px red");
        $(".menu.my-favorite").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutFavorite = function () {
        $(".addto-myfavorite-img").css("background-position", "-726px -607px");
        $(".menu.my-favorite").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.my-favorite").find(".menu-label").css("color", "#7e7e7e");
    }
    $scope.hoverInRemoveFavorite = function () {
        $(".addto-myfavorite-img").css("background-position", "-783px -607px");
        $(".menu.remove-favorite").find(".menu-img").css("border", "solid 2px red");
        $(".menu.remove-favorite").find(".menu-label").css("color", "red");
    }
    $scope.hoverOutRemoveFavorite = function () {
        $(".addto-myfavorite-img").css("background-position", "-726px -607px");
        $(".menu.remove-favorite").find(".menu-img").css("border", "solid 2px #808080");
        $(".menu.remove-favorite").find(".menu-label").css("color", "#7e7e7e");
    }

    $scope.shareBtnFunction = function (user, activeReportID, userOrGroup) {
        $(".sharePopup").hide();
        var userExists = false;
        var inputText = $("#txtSelectedID").val();
        var user = undefined;
        //Check if user exists in $scope.userList
        angular.forEach($scope.userList, function (value, key) {
            if (value.isGroup == 1) {
                if (value.Name == inputText) {
                    userExists = true;
                    user = JSON.parse($("#txtSelectedID").attr("data-val"));
                }
            } else {
                if ((value.Name + " (" + value.UserName + ")") == inputText) {
                    userExists = true;
                    user = JSON.parse($("#txtSelectedID").attr("data-val"));
                }
            }
        });
        if (userExists == false || (user == undefined || user == null || user == "")) { showMaxAlert("Please select valid user/group"); return; }
        $(".loader").show();
        var procName = '';
        var timeStamp = new Date();
        if (userOrGroup == 'Group') {
            var data = { GroupName: user, REPORT_ID: activeReportID };
            procName = 'ShareReportToGroup';
        }
        else if (userOrGroup == 'User' || userOrGroup == 'Group') {
            var data = { Id: user.Id, REPORT_ID: activeReportID, SharedTo: user.UserName, SharedBy: null, SharedOn: null, SharedToMail: user.email, SharedByMail: null, isGroup: user.isGroup, timeStamp: (timeStamp.getTime() - (timeStamp.getTimezoneOffset() * 60 * 1000)) };
            procName = 'ShareReportToUser';
        }
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/" + procName,
            method: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (response) {
                $(".loader").hide();
                $('.sharePopup,.transparentBG').hide();
                $scope.sharedFiles();
                $scope.$digest();
                if (response == "Error") {
                    showMaxAlert("Some Error  Occured");
                } else {
                    showMaxAlert("Report Shared Successfully");
                }

            },
            error: ajaxError
        });
    }

    $scope.clearCustomDownloadEntries = function () {
        $(".custom-radio").prop("checked", false);
        //$(".custom-download-slide-row").css("color", "#000");
        $(".custom-download-slide-row .custom-radio-delete").removeClass("active");
        $(".custom-download-slide-row").removeClass("active_row");
        $scope.customDownloadList = [];
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
        slidePosition = [];
        $scope.clearTileSelections();
        $scope.activeSlideID = '';
        //  $scope.$digest();
    }
    $scope.clearTileSelections = function () {
        $(".slide-number").removeClass("slide-number-active");
        $(".slide-background").removeClass("active_slide");
        $(".comment-section-container").css("border-color", "#676767");
        $(".comment-section").css("background", "#676767");
        $(".comment-section-container").removeClass("comment-section-container_active");
        $(".comment-section").removeClass("comment_active");
    }
    $scope.deleteCustomDownloadRow = function (obj, event, index) {

        $(".custom-radio").prop("checked", false);
        //$(".custom-download-slide-row").css("color", "#000");
        $(".custom-download-slide-row").removeClass("active_row");
        var indx = $scope.customDownloadList.indexOf(obj);
        if (indx != -1) {
            $scope.customDownloadList.splice(indx, 1);
        }
        $scope.$digest();
    }

    $scope.customDownloadSave = function () {
        if ($scope.customDownloadList.length == 0) {
            showMaxAlert("Please add slides to save");
        }
        else {
            $(".saveCustomDownloadPopup,.transparentBG").show();
            $('[autofocus]:not(:focus)').eq(0).focus();
        }

    }

    $scope.getCustomDownloadList = function () {

        $(".loader,.transparentBG").show();
        var data = { ReportId: $scope.activeReportID };
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/GetCustomDownloadList",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $scope.CustomDownloadSavedList = response;
                $scope.$digest();
                $(".loader,.transparentBG").hide();
            },
            error: ajaxError
        });
        SetScroll($(".storyboard-content .custom-download_list_contains"), "#353135", 0, -10, 0, -8, 8);

    }

    $scope.setCustomDownloadList = function (index) {

        $(".custom-download-slide-row").removeClass("active_row");
        var ele = event.currentTarget;
        $(ele).addClass("active_row");
        //$scope.clearCustomDownloadEntries();
        $scope.customDownloadList = [];
        j_activeSlideID = [];
        j_activeSlideIDList = [];
        j_selectedSlideObj = [];
        slidePosition = [];
        $scope.clearTileSelections();
        $scope.activeSlideID = '';
        $scope.SelectedCustomDownload = $scope.CustomDownloadSavedList[index];
        $scope.customDownloadList = JSON.parse($scope.SelectedCustomDownload.Slides);
        $(".custom-download-slide-row:eq(" + index + ") .custom-radio").prop("checked", "true");
        //$(".custom-download-slide-row").css("color", "#000");
        $(".custom-download-slide-row:eq(" + index + ")").css("color", "#E8222C");
        $(".custom-download-slide-row .custom-radio-delete").removeClass("active");
        //$(".custom-download-slide-row:eq(" + index + ") .custom-radio-delete").addClass("active");
        //   $scope.SaveCustomDownloadText = $scope.SelectedCustomDownload.Name;
        //   $scope.$digest();
    }


    $scope.customSaveBtnFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        if ($scope.SaveCustomDownloadText == "") {
            showMaxAlert("Please give name to download");
        }

        else {
            for (i = 0; i < $scope.CustomDownloadSavedList.length; i++) {
                if (angular.lowercase($scope.CustomDownloadSavedList[i].Name) == angular.lowercase($scope.SaveCustomDownloadText)) {
                    $scope.SaveCustomDownloadText = '';
                    showMaxAlert("Custom Download with given name already exist");
                    return false;
                }
            }
            $(".loader").show();
            $scope.clearTileSelections();
            var data = { custom: $scope.customDownloadList, ReportId: $scope.activeReportID, Name: $scope.SaveCustomDownloadText };
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/SaveCustomDownload",
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json",
                success: function (response) {

                    $(".loader").hide();
                    $scope.clearCustomDownloadEntries();
                    showMaxAlert(response);
                    $(".saveCustomDownloadPopup,.transparentBG").hide();
                    //$(".custom-download-slide-row").css("color", "#000");
                    $(".custom-download-slide-row .custom-radio-delete").removeClass("active");
                    $scope.getCustomDownloadList();
                    $scope.$digest();

                    $scope.SaveCustomDownloadText = "";
                },
                error: ajaxError
            });
        }
    }

    $scope.customCancelBtnFunction = function () {
        //To Check User Session 
        if (checkValidationSessionObj() == false)
            return false;
        //
        $(".saveCustomDownloadPopup,.transparentBG").hide();
    }

    $scope.deleteSavedCustomDownload = function (event, x) {

        //New custom confirm box called here
        $scope.ConfirmBoxObject.Show("Are you sure you want to delete ?", function () {
            $(".loader").show();
            var data = { ReportId: $scope.activeReportID, Name: x.Name };
            $.ajax({
                url: appRouteUrl + "StoryBoard/Story/DeleteSavedCustomDownload",
                data: JSON.stringify(data),
                method: "POST",
                contentType: "application/json",
                success: function (response) {
                    $scope.getCustomDownloadList();
                    $scope.clearCustomDownloadEntries();
                    showMaxAlert(response);
                    $scope.SaveCustomDownloadText = "";
                    $(".loader").hide();
                },
                error: ajaxError
            });
        });
    }

    $scope.customDownloadSlides = function () {
        if ($scope.customDownloadList.length == 0 || $scope.customDownloadList == "") {
            showMaxAlert("Please add slides to download");
            return;
        }
        $(".loader,.transparentBG").show();
        var data = { custom: $scope.customDownloadList, ReportId: $scope.activeReportID, SlideIds: uniqueSlides($scope.customDownloadList) };
        $.ajax({
            url: appRouteUrl + "StoryBoard/Story/CustomDownloadSlides",
            data: JSON.stringify(data),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                //window.location.href = appRouteUrl + "StoryBoard/Story/DownloadPPT?fileName=" + response;
                window.location.href = appRouteUrl + "StoryBoard/Story/DownloadPPT?fileName=" + response;
                $scope.$digest();
                $(".loader,.transparentBG").hide();
            },
            error: ajaxError
        });
    }

    $scope.displayInfoPopup = function (event, x) {
        //$('.slide-info').hide();
        $('.slide-info-maindiv').hide();
        //$('.topleftimage').hide(); $('.leftbottomimage_tooltip').hide(); $('.toprightimage').hide();
        var ele = $('.slide-info-maindiv');
        $(ele).show();
        $('.slide-info').html('');
        var ele = $(".slide-info");
        if ($(ele).html() == "" || $(ele).html().length == 0) {
            var info_obj = getPopupInfoForTile(x);
            var filter = '';
            info_obj.forEach(function (d, ind) {
                filter += ("<div class='slide-filter-info'><div class='titletxt'>" + d.name + "</div><div class='valuetxt'> : " + d.value + "</div></div>");
            });
            //var obj = {};
            //obj.chartType = JSON.parse(x.OutputData).ChartType;
            //obj.filter = JSON.parse(x.Filter);
            //var filter = ("<div class='slide-filter-info'><div class='titletxt'>TimePeriod Type</div><div class='valuetxt'> : " + x.TimePeriodType + "</div></div>");
            //filter += ("<div class='slide-filter-info'><div class='titletxt'>From TimePeriod</div><div class='valuetxt'> : " + x.FromTimeperiod + "</div></div>");
            //filter += ("<div class='slide-filter-info'><div class='titletxt'>To TimePeriod</div><div class='valuetxt'> : " + x.ToTimeperiod + "</div></div>");

            //for (i = 0; i < obj.filter.length ; i++) {
            //    if (obj.filter[i].Data != undefined) {
            //        var subele;
            //        for (j = 0; j < obj.filter[i].Data.length; j++) {
            //            if (j == 0)
            //                subele = obj.filter[i].Data[j].Text;
            //            else
            //                subele += " | " + obj.filter[i].Data[j].Text;
            //        }
            //        filter += ("<div class='slide-filter-info'><div class='titletxt'>" + obj.filter[i].Name + "</div><div class='valuetxt'> : " + subele + "</div></div>");
            //    }
            //}
            $(ele).append(filter);
        }
        $(ele).show();
        //Added by bramhanath to show the info popup (20-06-2017)--start
        $('.topleftimage').show(); $('.leftbottomimage_tooltip').show(); $('.toprightimage').show();
        var ordObj = getCoords(event);
        var popupHeight = $(".slide-info-maindiv").find(".slide-info-centerdiv").outerHeight();
        var popupWidth = $(".slide-info-maindiv").find(".slide-info-centerdiv").outerWidth();
        var bodyHeight = $("body").outerHeight();
        var bodyWidth = $("body").outerWidth();
        var preciseHeight = 0;
        var preciseWidth = 0;
        var finalTop = -1000;
        var finalLeft = -1000;

        var Elem = event.target;
        var ht = $(Elem).outerHeight();
        var wd = $(Elem).outerWidth();

        finalTop = ordObj.top + ht / 1.3;
        finalLeft = ordObj.left + wd / 1.3;

        if ((finalTop + popupHeight) > bodyHeight)
            preciseHeight = (finalTop + popupHeight) - bodyHeight;

        if ((finalLeft + popupWidth) > bodyWidth)
            preciseWidth = (finalLeft + popupWidth) - bodyWidth + 10;

        $(".slide-info-maindiv").css("top", (finalTop - preciseHeight) - 20);
        $(".slide-info-maindiv").css("left", (finalLeft - preciseWidth) - 30);

        var top = $(".slide-info-centerdiv").height();
        $(".leftbottomimage_tooltip").css("top", top - 13);
        //Added by bramhanath to show the info popup (20-06-2017)--start
    }

    $scope.hideInfoPopup = function (event, x) {
        var ele = event.currentTarget;
        $(ele).find(".slide-background").removeClass("mouseover_active_slide");
        $(ele).find(".slide-number").removeClass("mouseover_slide-number-active");
        $(ele).find(".comment-section").css("background", "#676767");
        $(ele).find(".comment-section-container").css("border-color", "#676767");

        //$('.slide-info').hide();
        //$('.topleftimage').hide(); $('.leftbottomimage_tooltip').hide(); $('.toprightimage').hide();
        //if ($(event.target).is("img")) {
        //    return;
        //}
        if ($(event.toElement).attr("class") == "topleftimage" || $(event.toElement).attr("class") == "toprightimage" || $(event.toElement).attr("class") == "leftbottomimage_tooltip")
            return;

        //if ($(ele).parents(".slide-thumbnail").length != 0) { } else {
        //  $(event.currentTarget.parentElement).find(".slide-info").hide();
        //}
        $(".slide-info-maindiv").hide();
    }

    function checkNavigation() {
        if (checkNavigationClicked == "false") {
            var dataInfo = window.location.search;
            if (dataInfo != "" && dataInfo != null && $scope.activeSlideID == "") {
                //var viewSliderId = "", modeOfEditable = "";
                //dataInfo = dataInfo.replace("?", "");
                //dataInfo = dataInfo.split("&")
                //viewSliderId = dataInfo[0];

                //dataInfo = viewSliderId.split("=");
                //var dataIDS = dataInfo[1].split("_");
                //$scope.activeSlideID = dataIDS[0];
                //$scope.activeOption = dataInfo[0];
                //$scope.activeReportID = dataIDS[1];


                //if (dataInfo.length > 1) {
                //    modeOfEditable = dataInfo[1];
                //    dataInfo = modeOfEditable.split("=");
                //    if (dataInfo[0] == 'isEdited')
                //        $scope.isEditMode = dataInfo[1];
                //}

                var viewSliderId = "", modeOfEditable = "", activeTab = "";
                dataInfo = dataInfo.replace("?", "");
                var dataInfo_Count = dataInfo.split("&");
                viewSliderId = dataInfo_Count[0];

                dataInfo = viewSliderId.split("=");
                var dataIDS = dataInfo[1].split("_");
                $scope.activeSlideID = dataIDS[0];
                $scope.activeOption = dataInfo[0];
                $scope.activeReportID = dataIDS[1];

                if (dataInfo_Count.length > 1) {
                    modeOfEditable = dataInfo_Count[1];
                    dataInfo = modeOfEditable.split("=");
                    if (dataInfo[0] == 'isEdited') {
                        if (dataInfo[1] == 'false')
                            $scope.isEditMode = false;
                        else
                            $scope.isEditMode = true;
                    }
                    else
                        $scope.isEditMode = false;

                    activeTab = dataInfo_Count[2];
                    dataInfo = activeTab.split("=");
                    if (dataInfo[0] == 'activeTab') {
                        $scope.activeLeftPanelfunc = dataInfo[1];
                    }
                    else
                        $scope.activeLeftPanelfunc = "myFiles()"
                }
                $(".table-content-row[data-id=" + $scope.activeReportID + "]").click();
                if ($scope.activeOption == "viewslideID") {
                    $scope.viewFunction();
                }
                else if ($scope.activeOption == "editslideID") {
                    $scope.editFunction();
                }

            }
        }
    }
    function validateSlides(data) {
        if (data.length > 4) {
            showMaxAlert("Maxium 4 slides can be selected at a time")
            return false;
        }
        var noOfTables = 0, noOfPyramids = 0, noOfOtherCharts = 0, noOfBarChange = 0;
        var ctype = [];
        for (i = 0; i < data.length; i++) {
            var obj = { ChartType: JSON.parse(data[i].Filter)[0].active_chart_type };//JSON.parse(data[i].OutputData).ChartType
            ctype.push(obj);
            switch (obj.ChartType) {
                case "pyramid": noOfPyramids++; break;
                case "pyramidwithchange": noOfPyramids++; break;
                case "barchange": noOfBarChange++; break;
                case "barwithchange": noOfBarChange++; break;
                case "table": noOfTables++; break;
                default: noOfOtherCharts++;
            }
        }
        if (noOfPyramids != 0) {
            if (noOfPyramids == 1 && noOfPyramids == data.length) { return true; }//data.length 
        } else {
            switch (data.length) {
                case 1:
                case 2: return true;
                case 3: if (noOfTables == 0 || noOfTables == 1) {
                    if (noOfBarChange == 0 || noOfBarChange == 1) {
                        if (noOfBarChange == 1 && noOfTables == 1) { } else { return true; }
                    }
                } break;
                case 4: if (noOfTables == 0 && noOfBarChange == 0) { return true; } break;
            }
        }
        showMaxAlert("Invalid Chart Combination - reference download help doc for applicable Chart combinations"); return false;

        //var chartDetails = count(ctype, function (item) { return item.ChartType });
        //if (data.length <= 2) {
        //    return true;
        //}
        //else if (data.length == 3) {
        //    if (Object.keys(chartDetails).length == 3)
        //        return true;
        //    else if (Object.keys(chartDetails).length == 2) {
        //        if ((chartDetails.hasOwnProperty("table")==true) && (chartDetails.table == 2)) {
        //            showMaxAlert("Invalid combination");
        //            return false;
        //        }
        //        else
        //            return true;
        //    }
        //    else if (Object.keys(chartDetails).length == 1) {
        //        if (Object.keys(chartDetails)[0] != 'table')
        //            return true;
        //        else {
        //            showMaxAlert("Invalid combination");
        //            return false;
        //        }
        //    }
        //}
        //else if (data.length == 4) {
        //    if (Object.keys(chartDetails).length == 4 && chartDetails.hasOwnProperty("table") == false)
        //        return true;
        //    else {
        //        showMaxAlert("Invalid combination");
        //        return false;
        //    }
        //}
    }

    var count = function (ary, classifier) {
        return ary.reduce(function (counter, item) {
            var p = (classifier || String)(item);
            counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
            return counter;
        }, {})
    }

    function uniqueSlides(list) {
        var datalist = [];
        for (i = 0; i < list.length; i++) {
            var ids = list[i].SlideIds.split(",");
            for (j = 0; j < ids.length; j++) {
                if (datalist.indexOf(parseInt(ids[j])) == -1) {
                    datalist.push(angular.copy(parseInt(ids[j])));
                }
            }
        }
        return datalist;
    }


    //To get exact co-ordinate of current element popup Info Added by Bramhanath(20-06-2017)
    function getCoords(elem) { // crossbrowser version
        elem = elem.target;
        //elem = $(elem).parent('li')[0];
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docEl = document.documentElement;

        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;

        var top = box.top;// + scrollTop - clientTop; //commented to ignore window minimize
        var left = box.left;// + scrollLeft - clientLeft; //commented to ignore window minimize

        return { top: Math.round(top), left: Math.round(left) };
    }

    //New custom condfirm box added by Abhay Singh (05-10-2017)
    $scope.ConfirmBoxObject = {
        ActionMethod: undefined,
        Show: function (msg, CallBackFunction, defaultType) {
            if (defaultType == undefined || defaultType == true) {
                $('.confirm-box-container').find('.confirm-box-bottom-btn').css('margin-left', '18%');
                $('.confirm-box-container').find('.cancel-btn').show();
            }
            else if (defaultType != undefined && defaultType == false) {
                $('.confirm-box-container').find('.confirm-box-bottom-btn').css('margin-left', '31%');
                $('.confirm-box-container').find('.cancel-btn').hide();
            }
            $(".confirm-box-message").text(msg);
            $(".confirm-box-container, .confirmBoxBG").show();
            this.ActionMethod = CallBackFunction;
        },
        Close: function () {
            $(".confirm-box-container, .confirmBoxBG").hide();
            this.ActionMethod = undefined;
        },
        CallAsyncFunction: function () {
            this.ActionMethod();
            this.Close();
        }
    }

}]);

$(document).ready(function () {

    $(".link_items").removeClass("active");
    $(".master_link.reports").addClass("active");
    SetScroll($(".storyboard-content .reportTable_holder"), "#353135", 0, 0, 0, -8, 8, false);
    $(".master-view-content").css("background-image", "none");
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(1)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((22 * $(".master_link_a:eq(1)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
        $(".submodules-band").css("margin-left", "37.1%");
        $(".submodules-band").css("margin-top", "-0.44%");
    }
    //$(".table-content-row").hover(function () {
    //    $(this).css("background-color", "red");
    //}, function () {
    //    $(this).css("background-color", "#353135");
    //});
    $('.slide-info-centerdiv').on("mouseenter", function () {
        $(this).parent().show();
    }).on("mouseleave", function () {
        $(this).parent().hide();
    });

});

var reset_storyboard_img = function () {
    $(".folder-img").css("background-position", "-941px -145px");
    $(".share-img").css("background-position", "-1054px -147px");
    $(".myfavorite-img").css("background-position", "-1168px -148px");
    $(".storyboard-ctrl-next").css("background-color", "transparent");
}
var hideLeftPanel = function () {
    $(".master-content-area").css("width", "100%");
    $(".master-leftpanel").hide();
    $(".refresh-div").show();
    $(".refresh-main-btn").hide();
    $(".myfiles-heading").hide();
    $(".myfavourites-heading").hide();
}
var showLeftPanel = function () {
    $(".master-content-area").css("width", "calc(100% - 50px)");
    $(".master-leftpanel").show();
    $(".refresh-div").hide();
    $(".refresh-main-btn").show();
}

var ShowAlertBox = function (msg) {
    $(".validation-popup").show();
    $(".validation-popup").find(".validation-content").find(".validation-custdiv").text(msg);
}

var searchFunctionalityForShare = function (searchArray) {
    $("#txtSelectedID").autocomplete({
        source: jQuery.unique(searchArray.map(function (item) {
            if (item.isGroup == 1) {
                return { 'label': item.Name, 'value': item.Name, 'user': item };
            } else {
                return { 'label': item.Name + ' (' + item.UserName + ')', 'value': item.Name + ' (' + item.UserName + ')', 'user': item };
            }
        })),
        focus: function (event, ui) {
            event.preventDefault();
        },
        select: function (event, ui) {
            $("#txtSelectedID").attr("data-val", JSON.stringify(ui.item.user));
            //console.log(ui.item.value);
        },
        minLength: 0,
        change: function (event, ui) {
            //console.log(ui.item.value);
        }
    });
}

//$(window).on('resize', function () {
//    var search_pos = cumulativeOffset($("#txtSelectedID")[0]);
//    $(".ui-autocomplete").css('top', search_pos.top + 'px');
//    $(".ui-autocomplete").css('left', search_pos.left + 'px');
//});

var cumulativeOffset = function (element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
};

var getPopupInfoForTile = function (x) {
    var obj = []; var modulename = getmodulename(x.Module);
    var x_filter = JSON.parse(x.Filter);
    var tempCopy;
    //Module Name
    obj.push({ 'name': 'Module', 'value': modulename });
    tempCopy = filterTileInfo(x_filter, 'Time Period');
    //Time Period
    var tpVal = tempCopy != undefined ? (tempCopy.Data.length == 1 ? (tempCopy.Data[0].Text) : (tempCopy.Data[0].Text + ' to ' + tempCopy.Data[tempCopy.Data.length - 1].Text)) : '';
    obj.push({ 'name': 'Time Period', 'value': tpVal });
    tempCopy = filterTileInfodata(x_filter, 'Establishment');
    tempCopy = (tempCopy == undefined ? filterTileInfodata(x_filter, 'Beverage') : tempCopy);
    //Establishment/Beverage
    obj.push({ 'name': (modulename.toLocaleLowerCase().indexOf('establishment') == -1 ? 'Beverage(s)' : 'Establishment(s)'), 'value': tempCopy });
    if (modulename.toLocaleLowerCase().indexOf('deepdive') != -1) {
        tempCopy = filterTileInfodata(x_filter, 'Metric Comparisons');
        //Metric Comparisons
        obj.push({ 'name': 'Metric Comparison(s)', 'value': tempCopy });
    }
    tempCopy = filterTileInfodata(x_filter, 'Measures');
    //Measure
    obj.push({ 'name': 'Measure', 'value': tempCopy });
    //Other Filters
    obj.push({ 'name': 'Advanced Filters', 'value': getOtherFilters(x_filter, ['Time Period', 'Establishment', 'Beverage', 'Metric Comparisons', 'Measures', 'FREQUENCY', 'StatTest']) });
    //Frequency
    obj.push({ 'name': 'Frequency', 'value': filterTileInfodata(x_filter, 'FREQUENCY') });
    tempCopy = filterTileInfo(x_filter, 'StatTest');
    //Stat Test
    obj.push({ 'name': 'Stat Testing Vs', 'value': (tempCopy != undefined ? (tempCopy.SelectedText.toLocaleLowerCase() == 'custom base' ? tempCopy.customBase : tempCopy.SelectedText) : '') });
    return obj;
}

var filterTileInfo = function (data, filtername) {
    var returnObj = undefined;
    data.forEach(function (item, index) {
        if (item.Name == filtername) {
            returnObj = item;
        }
    });
    return returnObj;
}

var filterTileInfodata = function (data, filtername) {
    var returnObj = '';
    data.forEach(function (item, index) {
        if (item.Name == filtername) {

            item.Data.forEach(function (d, i) {
                returnObj = returnObj.concat(d.Text + ', ');
            });
            returnObj = returnObj.slice(0, -2);
        }
    });
    return returnObj;
}

var getOtherFilters = function (data, filtername) {
    var otherFilters = "";
    data.forEach(function (item, index) {
        if (filtername.indexOf(item.Name) == -1) {
            for (var i = 0; i < item.Data.length; i++) {
                otherFilters = otherFilters.concat(item.Data[i].Text + ", ");
            }
        }
    });
    otherFilters = otherFilters.slice(0, -2);
    return otherFilters;
}

var getmodulename = function (name) {
    switch (name) {
        case 'chartestablishmentcompare': return 'Chart Establishment Compare'; break;
        case 'chartestablishmentdeepdive': return 'Chart Establishment Deepdive'; break;
        case 'chartbeveragecompare': return 'Chart Beverage Compare'; break;
        case 'chartbeveragedeepdive': return 'Chart Beverage Deepdive'; break;
    }
    return 'Dine';
}
