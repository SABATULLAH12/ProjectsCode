/// <reference path="angular.js" />
/// <reference path="jquery-3.0.0.min.js" />

var mainApp = angular.module("mainApp", []);
var appRouteUrl = "/";
var showelementsfromtheclickeditems = false;

$(document).ready(function () {
    $(".lft-ctrl").click(function () {
        showHideFilterPanel();
    });

    $(".lft-ctrl-next").click(function () {
        $(".lft-ctrl3").hide();
        $(".lft-popup-col").hide();
        $(this).parent().parent().parent().find(".lft-ctrl3").show();
        $(this).parent().parent().parent().find(".lft-popup-col1").show();

        //this is for showing from the current position of clicked element (for 1st level)
        var num = $(this).parent().offset().top - 140;
        $(this).parent().parent().next().css({ "margin-top": num });
    });

    $(".lft-ctrl3-header span").click(function () {
        $(this).parent().parent().hide();
    });

    $(".lft-popup-ele-label").click(function () {
        if ($(this).attr('data-isselectable') === "false") {
            return;
        }

        var pele = $(this).parent().parent().parent().parent();
        var selectedeleids = [], ctrl2 = $(pele).siblings(".lft-ctrl2"), divtxtbox = '';

        if ($(this).parent().hasClass('lft-popup-ele_active')) {
            if ($(pele).attr('data-required') != "true") {
                $(this).parent().removeClass("lft-popup-ele_active");
                removeSelectedPanelElement(true, this, ctrl2);
            }
            if ($(pele).attr('data-required') == "true" && ($(pele).find(".lft-popup-ele_active").length > 1)) {
                $(this).parent().removeClass("lft-popup-ele_active");
                removeSelectedPanelElement(true, this, ctrl2);
            }
        }
        else {
            if ($(pele).attr('data-ismultiselect') == "true")
                $(this).parent().addClass("lft-popup-ele_active");
            else {
                if ($(pele).find(".lft-popup-ele_active").length > 0) {
                    removeSelectedPanelElement(true, $(pele).find(".lft-popup-ele_active").children(".lft-popup-ele-label"), ctrl2);
                    $(pele).find(".lft-popup-ele").removeClass("lft-popup-ele_active");
                }

                $(this).parent().addClass("lft-popup-ele_active");
            }
            addSelectedPanelElement(this, ctrl2);
        }

    });

    var removeSelectedPanelElement = function (isremoved, key, ctrl2) {
        var selectedeleids = [];
        //remove selected items
        if (isremoved) {

            if ($(ctrl2).find(".lft-ctrl-txt").attr('data-ids') != undefined && $(ctrl2).find(".lft-ctrl-txt") != null) {
                selectedeleids = String($(ctrl2).find(".lft-ctrl-txt").attr('data-ids')).split('|');
                selectedeleids = $.grep(selectedeleids, function (value) {
                    return value != JSON.stringify({ ID: $(key).attr('data-id'), Text: $(key).text() })
                });
                $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

                $(ctrl2).find(".lft-ctrl-txt").html('');
                if ($(".filter-info-panel").is(":visible")) {
                    var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                    if ($("." + topdivele).length != 0) {
                        $("." + topdivele).html("<span>" + $(ctrl2).parent().attr('data-val') + ": </span>");
                    }
                }
                $(selectedeleids).each(function (i, d) {
                    if (d != null && d != undefined && d != {} && d != []) {
                        var ele = $("<div class='lft-ctrl-txt-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%;'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>x</span></div>");
                        if ($(".filter-info-panel").is(":visible")) {
                            $("." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>x</span></div>"));
                        }
                        $(ctrl2).find(".lft-ctrl-txt").append(ele);
                    }
                });
                $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
                    $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
                });
            }
        }
    }

    var addSelectedPanelElement = function (key, ctrl2) {
        var selectedeleids = [];

        //add into left panel view
        if ($(ctrl2).find(".lft-ctrl-txt").attr('data-ids') != undefined && $(ctrl2).find(".lft-ctrl-txt") != null) {
            selectedeleids = String($(ctrl2).find(".lft-ctrl-txt").attr('data-ids')).split('|');
        }
        selectedeleids.push(JSON.stringify({ ID: $(key).attr('data-id'), Text: $(key).text() }));
        $(ctrl2).find(".lft-ctrl-txt").attr('data-ids', selectedeleids.join('|'));

        $(ctrl2).find(".lft-ctrl-txt").html('');

        //find topdiv panel is there are not, if not there create it
        if ($(".filter-info-panel").is(":visible")) {
            var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
            if ($("." + topdivele).length == 0) {
                $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
            }
            $("." + topdivele).html("<span>" + $(ctrl2).parent().attr('data-val') + ": </span>");
        }

        $(selectedeleids).each(function (i, d) {
            if (d != null && d != undefined && d != {} && d != []) {
                var ele = $("<div class='lft-ctrl-txt-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;width:90%'>" + JSON.parse(d).Text + "</span><span class='lft-ctrl-txt-del' style='float:right;'>x</span></div>");

                //for showing data in additional place/panel
                if ($(".filter-info-panel").is(":visible")) {
                    $("." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + JSON.parse(d).ID + "'><span style='float:left;'>" + JSON.parse(d).Text + "</span><span class='filter-info-panel-txt-del' style='float:right;'>x</span></div>"));
                }

                $(ctrl2).find(".lft-ctrl-txt").append(ele.clone());
            }
        });

        $(".lft-ctrl-txt-del").unbind('click').on('click', function () {
            $(this).parent().parent().parent().parent().find(".lft-popup-ele-label[data-id='" + $(this).parent().attr('data-id') + "']").click();
        });
    }

    $(".lft-popup-ele-next").click(function () {
        var eleid, parenteleid, level;
        eleid = $(this).siblings(".lft-popup-ele-label").attr('data-id');
        parenteleid = $(this).siblings(".lft-popup-ele-label").attr('data-parent');
        level = $(this).parent().parent().attr('data-level');
        level = (parseInt(level) + 1);
        $(".lft-popup-col").each(function () {
            if (parseInt($(this).attr('data-level')) > level)
                $(this).hide();
        });

        if(showelementsfromtheclickeditems){
            //this is for showing from the current position of clicked/mouseover elemenent(for all the levels expect 1st level)
            var num =$(this).parent().offset().top - $(this).parent().parent().parent().offset().top;
            $(this).parent().parent().next().css({ "margin-top": num });
        }

        $("." + "lft-popup-col" + level).find(".lft-popup-ele-label").parent().hide();
        $("." + "lft-popup-col" + level).find(".lft-popup-ele-label[data-parent='" + eleid + "']").parent().show();
        $("." + "lft-popup-col" + level).show();

        //The next popup(elements) going down the screen will be moved to top(so the user can see the elments in the visible screen)
        var curChildTop = parseInt($(this).parent().parent().next().css("margin-top"));
        var curChildHeight = $(this).parent().parent().next().height();

        if (curChildTop - curChildHeight + 20 > 0)//parent up not needed
        {
            $(this).parent().parent().next().css({ "margin-top": curChildTop - curChildHeight + 20 })
        }

        var num2 = $(this).parent().parent().parent().offset().top + $(this).parent().parent().parent().height();
        var num3 = $(".master-leftpanel").offset().top + $(".master-leftpanel").height();
        var num6 = $(this).parent().parent().parent().parent().offset().top + $(this).parent().parent().parent().parent().height();
        //num2 if not num6
        if (num6 > num3) {
            var newParentTop = parseInt($(this).parent().parent().parent().parent().css("margin-top")) - num2 + num3;
            $(this).parent().parent().parent().parent().css({ "margin-top": newParentTop });
        }

    });

    $(".lft-popup-tp").click(function () {
        var time = JSON.parse($(this).attr('data-val'));
        var pele = $(this).parent().parent().parent().parent().find(".lft-ctrl-txt");
        var ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[time.length - 1].Text + "</span></div>");

        if ($(this).hasClass("lft-popup-tp-active"))
            ;//do nothing
        else {
            $(".lft-popup-tp").removeClass("lft-popup-tp-active");
            $(this).addClass("lft-popup-tp-active");
            $("#slider-range").show();
        }


        switch ($('.lft-popup-tp-smnu-active').attr('data-val')) {
            case "pit":
                $(pele).html(ele).attr('data-ids', JSON.stringify(time[time.length - 1]));
                $("#slider-range-text").html($(pele).html());

                $("#slider-range").slider({
                    value: time.length - 1,
                    values: null,
                    range: false,
                    min: 0,
                    max: time.length - 1,
                    step: 1,
                    slide: function (event, ui) {
                        ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[ui.value].Text + "</span></div>");
                        $(pele).html(ele).attr('data-ids', JSON.stringify(time[ui.value]));
                        $("#slider-range-text").html($(pele).html());
                    },
                    change: function (event, ui) {
                        ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[ui.value].Text + "</span></div>");
                        $(pele).html(ele).attr('data-ids', JSON.stringify(time[ui.value]));
                        $("#slider-range-text").html($(pele).html());
                        if ($(".filter-info-panel").is(":visible")) {
                            var ctrl2 = $(pele).parent();
                            var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                            if ($("." + topdivele).length == 0) {
                                $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
                            }
                            $("." + topdivele).html("<span>" + $(ctrl2).parent().attr('data-val') + ": </span>");
                            $("." + topdivele).append($("<div class='filter-info-panel-lbl' data-id='" + time[ui.value] + "'><span style='float:left;'>" + time[ui.value].Text + "</span></div>"));
                        }
                    }

                });
                break;

            case "trend":
            default:
                var prepareTp = function (rangea, rangeb) {
                    var tpd = [];
                    for (var xi = rangea; xi <= rangeb; xi++) {
                        tpd.push(JSON.stringify(time[xi]));
                    }
                    ele = $("<div class='lft-ctrl-txt-lbl'><span style='float:left;width:90%'>" + time[rangea].Text + " to " + time[rangeb].Text + "</span></div>");
                    $(pele).html(ele).attr('data-ids', tpd.join("|"));
                    $("#slider-range-text").html($(pele).html());
                }

                prepareTp(time.length - 4 > 0 ? time.length - 4 : 0, time.length - 1);

                $("#slider-range").slider({
                    values: [time.length - 4 > 0 ? time.length - 4 : 0, time.length - 1],
                    min: 0,
                    max: time.length - 1,
                    range: true,
                    slide: function (event, ui) {
                        prepareTp(ui.values[0], ui.values[1]);
                    },
                    change: function (event, ui) {
                        if ($(".lft-popup-tp-smnu[data-val='pit']").hasClass("lft-popup-tp-smnu-active")) {
                            ui.values = undefined;
                        }
                        if (ui.values != undefined || ui.values != null) {
                            prepareTp(ui.values[0], ui.values[1]);
                            if ($(".filter-info-panel").is(":visible")) {
                                var ctrl2 = $(pele).parent();
                                var topdivele = $(ctrl2).parent().attr('data-val').replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_") + "_topdiv_element";
                                if ($("." + topdivele).length == 0) {
                                    $(".filter-info-panel").find(".filter-info-panel-elements").append("<div class='" + topdivele + " topdiv_element' data-val='" + $(ctrl2).parent().attr('data-val') + "'></div>");
                                }
                                $("." + topdivele).html("<span>" + $(ctrl2).parent().attr('data-val') + ": </span>");
                                $("." + topdivele).append($("<div class='filter-info-panel-lbl'><span style='float:left;'>" + time[ui.values[0]].Text + " to " + time[ui.values[1]].Text + "</span></div>"));
                            }
                        }
                    }

                });

                break;
        }
    });

    $('.lft-popup-tp-smnu').click(function () {
        if ($(this).hasClass('lft-popup-tp-smnu-active')) {
            //do nothing
        }
        else {
            $(".lft-popup-tp-smnu").removeClass('lft-popup-tp-smnu-active');
            $(this).addClass('lft-popup-tp-smnu-active');
            $(".lft-popup-tp").first().click();
        }
    });

    $("#clearLeftPanel").click(function () {
        $(".lft-ctrl-txt").attr('data-ids', '').html('');
        $(".lft-popup-ele_active").each(function (i, e) {
            $(e).removeClass('lft-popup-ele_active');
        });
        //$(".lft-popup-tp").first().click();
        $(".filter-info-panel").html('');
    });

    $(document).on('click', '.filter-info-panel .filter-info-panel-txt-del', function () {
        var pele = $(this).parent().parent();
        var peleVal = $(pele).attr('data-val');
        var ptxt = $(this).parent().text().slice(0, -1);
        var isdeleted = false;
        $(".master-lft-ctrl").each(function (i, e) {
            if ($(e).attr('data-val') == peleVal) {
                $(e).find(".lft-ctrl2").find(".lft-ctrl-txt-lbl").each(function (i, ele) {
                    if (ptxt == $(ele).text().slice(0, -1)) {
                        $(ele).find(".lft-ctrl-txt-del").click();
                        isdeleted = true;
                        return;
                    }
                });
            }
            if (isdeleted)
                return;
        });
    });
});

var prepareFilter = function () {
    var fil = [], isvalid = true;
    $(".lft-ctrl3-header span").click();

    $(".master-lft-ctrl").each(function () {
        var txt = $(this).find(".lft-ctrl-txt").attr('data-ids');
        if ($(this).find(".lft-ctrl3").attr('data-required') == "true") {
            if (txt == null || txt == undefined || txt.length == 0) {
                alert($(this).find(".lft-ctrl-label span").text() + " is required. Please select.");
                isvalid = false;
                return isvalid;
            }
        }
        if (txt != null && txt != undefined && txt.length > 0) {
            var data = [];
            $(String(txt).split('|')).each(function (x, d) {
                if (d != null && d != '')
                    data.push(JSON.parse(d));
            });
            fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: data });
        }
        else if (txt != '' && txt != null)
            fil.push({ Name: $(this).find(".lft-ctrl-label span").text(), Data: null });
    });

    $("#master-btn").attr('data-val', JSON.stringify(fil));
    return isvalid;
}

var replotContentArea = function () {
    //override the content area in each module to redesign on change of widgth
}

var ajaxError = function (xhr, responseText, rsp) {
    console.log(xhr);
    alert('Some error occured!');
}

var fillFilterPanel = function (data) {
    var Isselected = false;
    var rangea = null, rangeb = null;
    var tp = $(".lft-popup-tp");
    //for each left panel 
    $.each(data.ctrl, function (index, obj) {
        var pele = $('.master-lft-ctrl[data-val="' + obj.ctrlText + '"]').first();
        //timeperiod
        if (obj.type != null && obj.type != undefined) {
            $(".lft-popup-tp-smnu[data-val='" + obj.type + "']").click();
            //if data is null selecting default
            if (obj.data[0].Text == null || obj.data[0].Text == undefined) {
                $(".lft-popup-tp").first().click();
            }
            else {
                //if data is not null
                //for each 3mmt, 12mmt, quarterly etc..
                $.each(tp, function (x, object) {
                    var time = JSON.parse($(object).attr('data-val'));
                    var pele = $(object).parent().parent().parent().parent().find(".lft-ctrl-txt");
                    jQuery.map(JSON.parse($(object).attr("data-val")), function (item, i) {
                        //Point in time                         
                        if (item.Text === obj.data[0].Text && obj.type == 'pit' && Isselected == false) {
                            $(object).click();
                            $("#slider-range").slider('value', i);
                            Isselected = true;
                            return;
                        }

                        else if (obj.type == 'trend' && Isselected == false) {
                            $(object).click();
                            //trend
                            if (item.Text === obj.data[0].Text)
                                rangea = i;
                            else if (rangea != null && item.Text === obj.data[1].Text)
                                rangeb = i;
                            if (rangea && rangeb && Isselected == false) {
                                $("#slider-range").slider('values', 0, rangea);
                                $("#slider-range").slider('values', 1, rangeb);
                                Isselected = true;
                                return;
                            }
                        }

                        if (Isselected)
                            return;
                    });

                    if (Isselected)
                        return;
                });
            }
        }
            //others
        else {
            $.each(obj.data, function (i, item) {
                var ele = $(pele).find(".lft-ctrl3 .lft-popup-col").find('.lft-popup-ele .lft-popup-ele-label[data-val="' + item.Text + '"]');
                $(ele).click();
            });
        }
    });
}

var showHideFilterPanel = function () {
    var leftpanelwidth = 20, contentarea = 79.5;

    if (parseInt(($(".master-leftpanel").width() / ($(".master-leftpanel").parent().width())) * 100) < (leftpanelwidth - 1)) {
        $(".master-leftpanel").width(leftpanelwidth + "%");
        $(".master-content-area").width(contentarea + "%");
        $(".lft-ctrl2").show();
        $(".lft-ctrl3").hide();
        $(this).parent().find(".lft-ctrl3").show();
        $(this).parent().find(".lft-popup-col1").show();
        if ($(".headcol") != null)
            $(".headcol").css({ "left": "21%" });

        //alert($(this).parent().attr('data-isdynamicfilter'));
    }
    else {
        $(".master-leftpanel").width("3%");
        $(".master-content-area").width("96.5%");
        $(".lft-ctrl2").hide();
        $(".lft-ctrl3").hide();
        if ($(".headcol") != null)
            $(".headcol").css({ "left": "10%" });
    }
    replotContentArea();
}