/// <reference path="table_establishment_deepdive.js" />
controllername = "reportdinerreport";
modulename = "Summary";
$(document).ready(function () {
    $(".master-view-content").css("background-image", "none");
    $(".submodules-options-link").find("a").removeClass("active");
    $(".report-link-summaryreport").find("a").addClass("active");
    $(".submodules-band").show();
    var dim = $(".master_link_a:eq(1)")[0].getBoundingClientRect();
    $(".submodules-band").css("margin-left", dim.left + ((22 * $(".master_link_a:eq(1)")[0].getBoundingClientRect().width) / 100) + "px");
    if ($(".master-top-header").width() == 1920) {
        $(".submodules-band").css("left", "0%");
        $(".submodules-band").css("margin-left", "37.1%");
        $(".submodules-band").css("margin-top", "-0.44%");
    }
    $(".report-link-summaryreport").css("border-right", "3px solid #ea1f2a");
    $(".link_items").removeClass("active");
    $(".downarrw").removeClass("downarrw_active");
    $(".link_items:eq(0)").addClass("active");
    $(".link_items:eq(0)").find(".downarrw").addClass("downarrw_active");
    $(".lft-ctrl-toggle").parent().hide();
    $(".master-leftpanel").css("padding-top", "25px");
    //$(".master-leftpanel").css("height", "91%");
    //$(".filter-info-panel-elements").html("<div class='topdiv_element'><span class='left'>REPORT -> SUMMARY REPORTS </span></div>");
    defaultTimePeriod();
    //default Frequency Selection Added By Bramhanath
    $(".master-lft-ctrl[data-val='FREQUENCY']").find(".lft-popup-ele-label[data-val='Monthly+']").click();
    //
    $('#selectallchkbx').click(function () {
        var distParentList = $(".report-tilebttm");
        var listparentListdistn = [];
        if (this.checked) {
            $(".chkboximg").removeClass("activechkboximg").addClass("activechkboximg");
            $(".chkboximg").parent().removeClass("actselectedTile").addClass("actselectedTile");
            $(".chkboximg").parent().parent().removeClass("actslctedBrdrColor").addClass("actslctedBrdrColor");
            $(".chkboximg").parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor").addClass("actslctedBrdrColor");
            $(".chkboximg").parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr").addClass("actslctedImgeClr");

            $.each(distParentList, function (dI, dV) {
                if (listparentListdistn.indexOf($(dV).attr("for")) == -1) {
                    listparentListdistn.push($(dV).attr("for"));
                    $("#" + $(dV).attr("for")).parent().parent().find(".tile-outerdiv").addClass("actslctedImgeClr");
                    $("#" + $(dV).attr("for")).parent().parent().find(".tileimage").addClass("actslctedBrdrColor");
                    $("#" + $(dV).attr("for")).addClass("actselectedTile");
                    $("#" + $(dV).attr("for")).parent().addClass("actslctedBrdrColor");
                }
            });
        }
        else {
            $(".chkboximg").removeClass("activechkboximg");
            $(".chkboximg").parent().removeClass("actselectedTile");
            $(".chkboximg").parent().parent().removeClass("actslctedBrdrColor");
            $(".chkboximg").parent().parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
            $(".chkboximg").parent().parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
            $.each(distParentList, function (dI, dV) {
                if (listparentListdistn.indexOf($(dV).attr("for")) == -1) {
                    listparentListdistn.push($(dV).attr("for"));
                    $("#" + $(dV).attr("for")).parent().parent().find(".tile-outerdiv").removeClass("actslctedImgeClr");
                    $("#" + $(dV).attr("for")).parent().parent().find(".tileimage").removeClass("actslctedBrdrColor");
                    $("#" + $(dV).attr("for")).removeClass("actselectedTile");
                    $("#" + $(dV).attr("for")).parent().removeClass("actslctedBrdrColor");
                }
            });
        }
    });
    //
    $("#p2pstatictext").hide(); 
    $("#p2pstatictext_diner").show();
    $(".report-maindiv").hide();
    SetScroll($(".ShowChartArea2"), "rgba(0,0,0,.75)", 0, 0, 5, 0, 8);
    $("#ascrail2000").css("left", "1354");
});

var getTopAdvanceFilterId = function (fil) {
    var isVisits = "";
    var rtnSelctedFilterId = $(".box.adv-fltr-label[style='color: rgb(255, 255, 255);']").attr("data-id");
    fil.push({ Name: "Top Filter", Data: null, SelectedID: rtnSelctedFilterId });

    if (rtnSelctedFilterId == 2 || rtnSelctedFilterId == 3 || rtnSelctedFilterId == 4 || rtnSelctedFilterId == 6 || rtnSelctedFilterId == 7) {
        isVisits = 1;
    }
    else if (rtnSelctedFilterId == 8 || rtnSelctedFilterId == 5) {
        isVisits = 0;
    }
    else {
        if ($('.adv-fltr-guest').css("color") == "rgb(255, 0, 0)")
            isVisits = 0;
        else
            isVisits = 1;
}

    fil.push({ Name: "IsVisit", Data: null, SelectedID: isVisits
});
    return fil;
}


var BindTileList = function (TileList) {
    //$(".report-maindiv").show();
    $('.selctall-view-downlddiv').show();
    $("#p2pstatictext_diner").hide();
    var Irow = 0;
    $(".report-maindiv").html("");
    $(".report-maindiv").show();
    var bindTileHTML = "";
    $(TileList).length;
    $.each(TileList, function (Tid, Tval) {
        var defaultouterSelected = "", defaultTileImgSelected = "";
        if (Irow == 0)
            bindTileHTML += "<div class='report-tilerow'>";
        if (Tval.SlideNo != "2") {
            if (Tval.SlideNo == 13) {
                bindTileHTML += "<div class='report-tilediv' style='display:none;'>";
            }
            else
                bindTileHTML += "<div class='report-tilediv'>";
            if (Tval.SlideNo == "1") {
                defaultTileSted = "defaultslctedImgeClr"; defaultTileImgSted = "defautlSeldBrdrClr"; defaultTilebtmSted = "defautlSeldTile";
            }
            else {
                defaultTileSted = ""; defaultTileImgSted = ""; defaultTilebtmSted = "";
            }
            //bindTileHTML += "<img src='../Images/ReportsStaticImages/" + Tval.SlideNo + ".png' width='100%' height='100%' /> <div class='report-tileimage'></div>";
            bindTileHTML += "<div class='report-tileimage'><div class='tile-outerdiv  " + defaultTileSted + "'><div class='tileimage " + defaultTileImgSted + "' style='background:url(../Images/DinerReportsStaticImages/" + Tval.SlideNo + ".png)'></div></div></div>";
            if (Tval.IsFixed == true && (Tval.SlideNo == 15))
                bindTileHTML += "<div style ='border:1px solid lightgray;opacity:.3' class='tilebtm-outerdiv " + defaultTileImgSted + "'><div style ='opacity:.3' class='report-tilebttm  " + defaultTilebtmSted + "' for='" + Tval.HeaderCategory + "'  id='" + Tval.SlideNo + "'><div class='slidename'>" + Tval.SlideName + "</div>";
            else
                bindTileHTML += "<div style ='border:1px solid #676767;opacity:1' class='tilebtm-outerdiv " + defaultTileImgSted + "'><div style ='opacity:1' class='report-tilebttm  " + defaultTilebtmSted + "' for='" + Tval.HeaderCategory + "'  id='" + Tval.SlideNo + "'><div class='slidename'>" + Tval.SlideName + "</div>";
            if (Tval.IsFixed == false)
                bindTileHTML += "<div class='chkboximg'></div></div></div>";
            else                
                bindTileHTML += "</div></div>";
            bindTileHTML += "</div>";
            if (Tval.SlideNo != 13) {
                bindTileHTML += "<div class='report-tileemptydiv'></div>";

                Irow++;
            }
        }

        if (Irow == 3) {
            bindTileHTML += "</div>";
            Irow = 0;
        }
    });
    $(".report-maindiv").append(bindTileHTML);

    SetScroll($(".report-maindiv"), "rgba(0, 0, 0, 0.74902)", 20, 30, 0, -8, 8);
    //To remove any padding
    $("#" + $(".report-maindiv").getNiceScroll()[0].id).css("padding", "0px");
    var k = $('.nicescroll-rails').filter(function () {
        return (($(this).css('display') != 'none') && (($(this).find(".nicescroll-cursors")).css("background-color") == "rgb(255, 255, 255)"));
    });
    if (k.length > 0) {
        k.eq(0).css("padding-right", "0px");
        k.eq(0).css("padding-top", "0px");
        k.eq(0).css("margin-top", "20px");
    }
}

//View Report
$(document).on("click", ".view-reportbtn", function () {
    if ($(".activechkboximg").length == 0) {
        showMaxAlert("Please Select Tiles");
        return false;
    }
    $(".view-report-ppup").show();
    $(".transparentBGExportExcel").show();

    var selectedTileslst = $(".report-tilebttm.actselectedTile");
    selectedPrvewImgLst = [];
    selectedPrvewImgLst.push(1);
    $.each(selectedTileslst, function (ITiles, VTiles) {
        if (parseInt($($(VTiles)[0]).attr("id")) != 13) {
            if (parseInt($($(VTiles)[0]).attr("id")) != 0 && parseInt($($(VTiles)[0]).attr("for")) != 0) {
                if (selectedPrvewImgLst.indexOf(parseInt($($(VTiles)[0]).attr("id"))) == -1)
                    selectedPrvewImgLst.push(parseInt($($(VTiles)[0]).attr("id")));

                if (selectedPrvewImgLst.indexOf(parseInt($($(VTiles)[0]).attr("for"))) == -1)
                    selectedPrvewImgLst.push(parseInt($($(VTiles)[0]).attr("for")));
            }
        }
    });
    selectedPrvewImgLst = selectedPrvewImgLst.sort(SortByName);
    currentPrevImgId = 0;
    $(".view-preview-img").html("");
    $(".view-preview-img").html("<div class='currntprevimg' style='background-image:url(../Images/DinerReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png?v=2)'></div>");
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
    $(".view-preview-img").html("").html("<div class='currntprevimg' style='background-image:url(../Images/DinerReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png)'></div>");
});

//Next Button
$(document).on("click", ".view-next-btn", function () {
    if (currentPrevImgId == (selectedPrvewImgLst.length - 1))
        return false;
    currentPrevImgId++;
    $(".view-preview-img").html("").html("<div class='currntprevimg' style='background-image:url(../Images/DinerReportsStaticImages/" + selectedPrvewImgLst[currentPrevImgId] + ".png)'></div>");
});