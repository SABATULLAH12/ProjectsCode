/// <reference path="aq.global.js" />
/// <reference path="../jquery-2.1.4.min.js" />
/// <reference path="../leftpanel.js" />
/* Reason   create menu with dynamic data
*  Developer    Date        Comments
*  Astak        2015-07-21  Created.
*  Smita                    Added logic
*/

function addOrRemoveBaseElements(key, isselected, hiddenfield, allowMultipleSelect, value, isSearch, divid) {
    var parentId = $(key).parent().parent().parent().parent().attr('id');
    if (parentId == null || parentId == undefined)
        parentId = divid;
    var pid = parentId;
    var filter_data = { "query": [] };
    var text = $(key).text();
   
    isOccasionShowPopup(parentId, text);

    var objlbm = AqCrest.Crest.LeftBaseMenu;
    hiddenfield = objlbm.getHiddenField(parentId);
    var elements = '';
    if (!allowMultipleSelect)
        $("#" + hiddenfield).val('');
    if ($("#" + hiddenfield).val() != '') {
        filter_data = JSON.parse($("#" + hiddenfield).val());
    }
    var flag = true;
    var  exists=true;
    if (isselected) //add to array
    {
        flag = true;
        if (isSearch) {
            exists = objlbm.getExistingElement(filter_data.query, key);
            if(!exists)
                return false;
        }
        filter_data.query.push(objlbm.getSelectedItems(key, flag, value, isSearch));
    }
    else {
        flag = false;
        //remove from the json array
        var indexpos = 0, isfound = false;
        var selecteditem = '';
        selecteditem = objlbm.getSelectedItems(key, flag, value, isSearch);

        $.each(filter_data.query, function (index, value) {
            if (selecteditem.id == value.id &&
                selecteditem.text == value.text &&
                selecteditem.parent == value.parent
               ) {
                indexpos = index;
                isfound = true;
            }
        });

        if (isfound)
            filter_data.query.splice(indexpos, 1);
    }

    $("#" + hiddenfield).val(JSON.stringify(filter_data));

    //if (parentId != "customize_inner_popup") {
    if (parentId.indexOf('customize') == -1) {
        $.each(filter_data.query, function (key, value) {
            elements += "<div style='display: inline-block;'>"
                    + "<div class='filters'>" + value.text + "</div>"
                   + '<div data-id="' + value.id + '" data-parent = "' + value.parent + '" data-text="' + value.text + '" data-search="' + value.flag + '" class="deletefilters closeButtonstyles">' + (!allowMultipleSelect ? '' : 'X') + '</div></div>';
        });
    }
    else {
        $.each(filter_data.query, function (key, value) {
            elements += "<div class='cust_filter_main'>"
                    + "<div class='cust_filter'>" + value.text + "</div>"
                   + '<div data-id="' + value.id + '" data-parent = "' + value.parent + '" data-text="' + value.text + '" data-search="' + value.flag + '" class="cust_delete">' + (!allowMultipleSelect ? '' : '') + '</div></div>';
        });
    }

    parentId = parentId.replace("_popup", "_txt");
    if (parentId.indexOf('customize') == -1)
        $("#" + parentId + ".div_textbox").html(elements);
    else
        $("#" + parentId + ".customise_div_textbox").html(elements);

    //if (parentId != "customize_inner_txt") {
    if (parentId.indexOf('customize') == -1) {
        $(".deletefilters").unbind('click').click(function () {
            objlbm.removeItem($(this).parent().parent().attr('id'), $(this).attr('data-parent'), $(this).attr('data-id'), $(this).siblings().html(), isSearch, allowMultipleSelect, hiddenfield,$(this).attr('data-search'));
            $(".lb_close").click();
        });
        // bindDelete(pid, hiddenfield, filter_data, allowMultipleSelect);
    }
    else {
        $(".cust_delete").unbind('click').click(function () {
            objlbm.removeItem($(this).parent().parent().attr('id'), $(this).attr('data-parent'), $(this).attr('data-id'), $(this).siblings().html(), isSearch, allowMultipleSelect, hiddenfield, $(this).attr('data-search'));
            // $(".lb_close").click();
        });
    }

    leftBasePerformAdditionalAction($(key).parent().parent().parent().parent().attr('id'));
}

function leftBasePerformAdditionalAction(parentId) {
}

function isOccasionShowPopup(parentId, text) {
}

function StringToXML(oString) {
    //code for IE
    if (window.ActiveXObject) {
        var oXML = new ActiveXObject("Microsoft.XMLDOM"); oXML.loadXML(oString);
        return oXML;
    } else {
        return (new DOMParser()).parseFromString(oString, "text/xml");
    }
}

function isSelectBaseElement(key) {
    return true;
}

AqCrest.Crest.LeftBaseMenu = {
    // <div class="lb_search_title">Search</div>
    _scriptbody: '<div><div class="lb_close"></div> ' +
                '<div class="lb_search"><div class="lb_search_img"></div><input type="text" name="search" id="lb_search_text" placeholder="Search" /></div>' +
                '</div>' +
                      '<div class="lb_panel">{{each Menu}}' +
                      '<div class="lb_col_elements lb_col{{= Level}}" data-level="{{= Level}}">{{each List}}' +
                      '<div class="lb_element" data-id="{{= Value}}" data-parent="{{= PValue}}" data-isselect="{{= Selectable}}" data-parenttext="{{= PText}}" data-isindex ="{{= Index}}" data-column="{{= Column}}">' +
                      '<div class="lb_element_title" data-text="{{= Text}}">{{= Text}}</div><div class="lb_element_arrow lb_element_arrow_gray img_basic_theme"></div>' +
                '</div>{{/each}}</div>{{/each}}</div>',

    _scriptbodyDb: '{{each}}' +
                      '<div class="lb_element" data-id="{{= iValue}}" data-parent="{{= PValue}}" data-isselect="{{= Selectable}}" data-parenttext="{{= PText}}" data-text="{{= Text}} ">' +
                      '<div class="lb_element_title" data-text="{{= Text}}">{{= Text}}</div><div data-loaded="false" class="lb_element_arrow lb_element_arrow_gray img_basic_theme"></div>' +
                    '</div>{{/each}}',

    _loading: '<div id = "Loader_Block"><div id = "fountainTextG">'+
        '<div id = "fountainTextG_1" class = "fountainTextG">F</div><div id = "fountainTextG_2" class = "fountainTextG">O</div>'+
        '<div id = "fountainTextG_3" class = "fountainTextG">O</div><div id = "fountainTextG_4" class = "fountainTextG">D</div>'+
        '<div id = "fountainTextG_5" class = "fountainTextG"></div><div id = "fountainTextG_6" class = "fountainTextG">S</div>'+
        '<div id = "fountainTextG_7" class = "fountainTextG">E</div><div id = "fountainTextG_8" class = "fountainTextG">R</div>'+
        '<div id = "fountainTextG_9" class = "fountainTextG">V</div><div id = "fountainTextG_10" class = "fountainTextG">I</div>'+
        '<div id = "fountainTextG_11" class = "fountainTextG">C</div><div id = "fountainTextG_12" class = "fountainTextG">E</div>'+
        '<div id = "fountainTextG_13" class = "fountainTextG"></div><div id = "fountainTextG_14" class = "fountainTextG">L</div>'+
        '<div id = "fountainTextG_15" class = "fountainTextG">o</div><div id = "fountainTextG_16" class = "fountainTextG">a</div>'+
        '<div id = "fountainTextG_17" class = "fountainTextG">d</div><div id = "fountainTextG_18" class = "fountainTextG">i</div>'+
        '<div id = "fountainTextG_19" class = "fountainTextG">n</div><div id = "fountainTextG_20" class = "fountainTextG">g</div>'+
        '<div id = "fountainTextG_21" class = "fountainTextG">.</div><div id = "fountainTextG_22" class = "fountainTextG">.</div>'+
        '<div id = "fountainTextG_23" class = "fountainTextG">.</div></div></div>',

    _tmplId: 'tmpl_',
    _tmplIdDb: 'tmpldb_',
    _tmplIdLoad: 'tmplload',

    bindTemplate: function (templatedId) {
        this._tmplId += templatedId;
        this._tmplIdDb += templatedId;
        //   this._tmplIdLoad = templatedId;
        $(document.body).append("<script type='text/template' id='" + this._tmplId + "'>" + this._scriptbody + "</script>");
        $(document.body).append("<script type='text/template' id='" + this._tmplIdDb + "'>" + this._scriptbodyDb + "</script>");
        $(document.body).append("<script type='text/template' id='tmpl_loading'>" + this._loading + "</script>");
    },

    loadMenu: function (data, divId) {
        $("#" + this._tmplId).tmpl(data).appendTo("#" + divId);
        this.bindEvent();
        this.bindHiddenField(divId);
    },

    loadMenuDb: function (data, divId) {
        $("#" + this._tmplId).tmpl(data).appendTo("#" + divId);
        this.bindEvent();
        this.bindHiddenField(divId);
        $("#" + this.getHiddenField(divId)).attr("data-isdynamic", "true");
    },

    loadMenuDbLevel: function (data, divClass, parentId) {
        //$("#" + this._tmplIdDb).tmpl(data).appendTo("." + divClass);
        if (data != null) {
            for (var i = 0; i < data.length; i++) {
                $(divClass).append($('<div class="lb_element" data-id="' + data[i].Value + '" data-parent="' + parentId + '" data-isselect="' + data[i].Selectable + '" data-parenttext="' + data[i].PText + '" data-text="' + data[i].Text + '">' +
                                  '<div class="lb_element_title" data-text="' + data[i].Text + '">' + data[i].Text + '</div><div data-loaded="false" class="lb_element_arrow lb_element_arrow_gray img_basic_theme"></div>'));
            }
            this.bindEvent();
        }
    },

    loadMenuDbRootLevel: function (data, divClass, parentId) {
        //if divClass is not existing add to popup
        if ($("#" + parentId).find("." + divClass).length == 0)
            $("#" + parentId).find(".lb_panel").append("<div class='lb_col_elements " + divClass + "' data-level='" + divClass.replace("lb_col", "") + "'></div>");

        var ele = $("#" + parentId).find("." + divClass).first();
        this.loadMenuDbLevel(data, ele, parentId);
    },

    bindHiddenField: function (divId) {
        var hiddenFieldId = this.getHiddenField(divId);
        if ($(document.body).find("#" + hiddenFieldId).length == 0)
            $(document.body).append("<input type='hidden' id='" + hiddenFieldId + "' value=''/>");
    },

    getHiddenField: function (divId) {
        var hiddenFieldId = "hdn" + (divId).replace('_popup', '');
        return hiddenFieldId;
    },

    bindEvent: function () {
        var obj = this;
        var availableTags = [];
        //click on element
        $(".lb_element_title").unbind('click').click(function () {
            $(".lp_defaultSave_Cancel").click();
            if ($(this).parent().attr('data-isselect') == "true") {
                var parentElement = $(this).parent().parent();
                var hdnfield = obj.getHiddenField($(parentElement).parent().parent().attr('id'));
                var popupid = $(parentElement).parent().parent().attr('id');
                checkFoodMetricIsSelectable(popupid);
                var allowMultiSelection = false;
                var nextLevel = parseInt($(parentElement).attr('data-level')) + 1;
                var currentLevel = parseInt($(parentElement).attr('data-level'));
                var boolenValue = $(parentElement).parent().parent().attr('data-multiselection');
                allowMultiSelection = boolenValue == "false" ? false : true;
                $("#" + hdnfield).attr('ismodified', true);//keep status as modified

                if (isSelectBaseElement(this)) {
                    if (!$(this).parent().hasClass("lb_element_selected")) {
                        if (!allowMultiSelection) {
                            $(this).parent().parent().parent().find(".lb_element_selected").removeClass("lb_element_selected");
                        }
                        if (checkIsselectable(this, hdnfield, allowMultiSelection)) {
                            if (checkSelectedViewCount(popupid)) {
                                $(this).parent().parent().find(".lb_element_showchild").removeClass("lb_element_showchild");
                                $(this).parent().addClass("lb_element_selected");
                                for (var x = currentLevel; x < $(this).parent().parent().parent().find(".lb_col_elements").length; x++) {
                                    var i = x + 1;
                                    $(this).parent().parent().parent().find(".lb_col_elements[data-level='" + i + "']").hide();
                                }
                                addOrRemoveBaseElements(this, true, hdnfield, allowMultiSelection, this, false, popupid);
                            }
                        }
                    }
                    else {
                        // $(this).parent().parent().find(".lb_element_showchild").removeClass("lb_element_showchild");
                        $(this).parent().removeClass("lb_element_selected");
                        addOrRemoveBaseElements(this, false, hdnfield, allowMultiSelection, this, false, popupid);
                    }
                }
                else {

                    $(this).parent().parent().find(".lb_element_showchild").removeClass("lb_element_showchild");
                    $(this).parent().removeClass("lb_element_selected");
                    addOrRemoveBaseElements(this, false, hdnfield, allowMultiSelection, this, false, popupid);

                }
                $(".lb_col_elements").each(function (index) {
                    index = nextLevel + 1;
                    $(this).parent().find("[data-level='" + index + "']").hide();
                });
            }
            showHideHispanic();
            HilightDehilightRowColumnPopup();
        });

        //click on arrow button to show the child
        $(".lb_element_arrow").unbind('click').click(function () {
            $(".lp_defaultSave_Cancel").click();
            checkFoodMetricIsSelectable();           
            var parentElement = $(this).parent().parent();
            var hdnfield = obj.getHiddenField($(parentElement).parent().parent().attr('id'));
            var boolenValue = $(parentElement).parent().parent().attr('data-multiselection');
            allowMultiSelection = boolenValue == "false" ? false : true;

            var nextLevel = parseInt($(this).parent().parent().attr('data-level')) + 1;//current element level, add 1 to move to next level
            var parent = $(this).parent().attr('data-id');
            var parentText = $(this).parent().text();
            var isdynamicdata = $("#" + obj.getHiddenField($(this).parent().parent().parent().parent().attr('id'))).attr('data-isdynamic');//whether the next time to be bind from db
            var nextElement = $(this).parent().parent().parent().find('.lb_col' + nextLevel).show();
            var parentid = $(parentElement).parent().parent().attr('id');
            var searchValue = $(parentElement).parent().parent().attr('data-search');
            if (searchValue == "true") {
                //  $("#" + parentid + " .lb_search_text").show();
            }
            else {
                // $("#" + parentid + " .lb_search").show();
                obj.getSearchForPopup(parentid, this, allowMultiSelection);
            }


            for (var x = nextLevel + 1; x <= $(this).parent().parent().parent().find(".lb_col_elements").length; x++) {
                $(this).parent().parent().parent().find(".lb_col_elements[data-level='" + x + "']").hide();
            }

            $(nextElement).find('.lb_element').hide();
            //load the data from db, only if it is not loaded
            if ($(this).attr('data-loaded') == "false" || $(this).attr('data-loaded') == undefined && isdynamicdata) {
                //load the data from db
                obj.loadMenuDbLevel(getNewPopupData(this), nextElement, parent);
                
                $(this).attr('data-loaded', "true");
                if (parentid == "customize_inner_popup" || parentid == "ca_customize_inner_2Level_popup" || parentid == "ca_customize_inner_3Level_popup")
                    $("#" + parentid).parent().parent().find(".lb_search").show();
                else {
                    $("#" + parentid + " .lb_search").show();
                    $("#ca_customize_inner_2Level_popup .lb_search").hide();
                    $("#ca_customize_inner_3Level_popup .lb_search").hide();
                }
                obj.bindEvent();
                bindafterLoadPopup();
            }

            var count = $(nextElement).find('[data-parenttext="' + parentText + '"]').length;
            //show the next level elements
            if (count > 0) {
                // $(nextElement).find("[data-parent='" + parent + "']").attr('style', 'display:inline-block');
                $(nextElement).find('[data-parenttext="' + parentText + '"]').attr('style', 'display:inline-block');
            }
            else {
                $(this).parent().parent().parent().find('.lb_col' + nextLevel).hide();
                var prevlevel = nextLevel - 1;
                //$(this).parent().parent().parent().find('.lb_col' + prevlevel).find(".lb_element_showchild").children().eq(1).hide();
            }

            var parentElement = $(this).parent().parent();
            var parentid = $(this).parent().parent().parent().parent().attr('id');
            //select only clicked element
            if (nextLevel - 1 == 1) {
                if (parentid == "food_service_occasion_popup" || parentid == "food_service_channel_popup" || parentid == "total_hispanic_popup") {
                    if (!$(this).hasClass("lb_element_arrow_white")) {
                        $(parentElement).parent().find(".lb_element_arrow").addClass("lb_element_arrow_gray");
                        $(parentElement).parent().find('.lb_element_showchild').removeClass('lb_element_showchild');
                        $(parentElement).parent().find(".lb_element_arrow_white").removeClass("lb_element_arrow_white");
                        $(this).parent().find(".lb_element_arrow_gray").removeClass("lb_element_arrow_gray").addClass("lb_element_arrow_white");
                    }
                    else {
                        //$(this).parent().parent().parent().find(".lb_element_arrow").addClass("lb_element_arrow_gray");
                        //$(this).removeClass("lb_element_arrow_white");
                    }
                }
            }
            else {
                if (!$(this).hasClass("lb_element_arrow_red")) {
                    $(this).removeClass("lb_element_arrow_gray");
                    $(parentElement).find('.lb_element_showchild').removeClass('lb_element_showchild');
                    $(parentElement).find(".lb_element_arrow_red").removeClass("lb_element_arrow_red").addClass("lb_element_arrow_gray");
                    $(this).addClass("lb_element_arrow_red");
                }
                else {
                    // $(this).removeClass("lb_element_arrow_red");
                    //  $(this).addClass("lb_element_arrow_gray");
                }
            }

            //$(parentElement).find('.lb_element_selected').removeClass('lb_element_selected');
            //addOrRemoveBaseElements(this, false, hdnfield, allowMultiSelection)
            if (!$(this).parent().hasClass("lb_element_showchild")) {
                $(parentElement).find('.lb_element_showchild').removeClass('lb_element_showchild');
                $(this).parent().addClass("lb_element_showchild");
            }
            else {
                // $(this).parent().removeClass("lb_element_showchild");
            }
            if (count > 0) {
                // $(nextElement).find("[data-parent='" + parent + "']").attr('style', 'display:inline-block');
                $(nextElement).find("[data-parenttext='" + parentText + "']").attr('style', 'display:inline-block');
            }
            else {
                // $(this).parent().parent().find('.lb_element_arrow').css('display', 'block');
                $(this).parent().parent().parent().find('.lb_col' + nextLevel).hide();
                var prevlevel = nextLevel - 1;
                $(this).parent().parent().parent().find('.lb_col' + prevlevel).find(".lb_element_showchild").children().eq(1).hide();
                //  $(this).parent().parent().parent().find('.lb_col' + prevlevel).find(".lb_element_showchild").removeClass("lb_element_showchild");
            }
            HideFSO();
            HilightDehilightRowColumnPopup();
        });

        //click event for close popup
        $(".lb_close").unbind('click').click(function () {
            $(".lp_defaultSave_Cancel").click();
            $(this).parent().parent().hide('fast');
            $("#TranslucentDiv").css('display', 'none');
        });

    },

    getSelectedItems: function (item, flag, value, isSearch) {
        var jsond = { parent: '', id: '', text: '', root: '', column: '',flag:'' };
        if (isSearch != true) {
            jsond.parent = $(item).parent().attr('data-parent');
            jsond.id = $(item).parent().attr('data-id');
            jsond.text = $(item).text();
            jsond.flag = false;
            //find the root element
            if (flag != false)
                jsond.root = getPanelRootElement(item);
            jsond.column = $(item).parent().attr('data-column');
        } else {
            jsond.parent = '';
            jsond.id = item.item.value;
            jsond.text = item.item.label;
            jsond.flag = true;
            //find the root element
            if (flag != false)
                if(value !="")
                  jsond.root = getPanelRootElement($(value).siblings().eq(0));
        }
        return jsond;
    },

    getExistingElement:function(jsonobj,key)
    {
        var flag = true;
        $(jsonobj).each(function (i,value) {
            if(value.id == key.item.value && value.text == key.item.label){
                alert("Aleardy Exists");
                flag=false;
            }
        });
        return flag;
    },

    getSelectedElementsCount: function (parentDivId) {
        return $("#" + parentDivId + " .lb_element_selected").length;
    },

    removeItem: function (parentDivId, parentId, itemId, itemtext, isSearch, allowMultipleSelect, hiddenfield,issearchExists) {
        parentDivId = parentDivId.replace("_txt", "_popup");
        var ui = { "item": [{ "label": '', "value": '' }] };
        issearchExists = issearchExists == "true" ? true : false;
        if (issearchExists != true) {
            $("#" + parentDivId).find(".lb_element_selected").each(function () {
                if ($(this).attr('data-parent') == parentId && $(this).children().text() == itemtext && $(this).attr('data-id') == itemId)
                    $(this).find(".lb_element_title").click();
            });
        }
        else {
            ui.item.label = itemtext;
            ui.item.value = itemId;
            var isselected = false;
            addOrRemoveBaseElements(ui, isselected, hiddenfield, allowMultipleSelect, '', issearchExists, parentDivId)
        }
    },

    clearAllSelectedMetric: function (parentDivId) {
        //remove all the _selected elements
        $("#" + parentDivId + " .lb_element_selected").each(function () {
            if ($(this).hasClass("lb_element_selected")) {
                $(this).find(".lb_element_title").click();
            }
        });
        $("#" + parentDivId + " .lb_element_arrow_select").each(function () {
            if ($(this).hasClass("lb_element_arrow_select")) {
                $(this).click();
            }
        });

        $("#" + parentDivId + " .lb_element_showchild").each(function () {
            $(this).removeClass("lb_element_showchild");
        });
        
        $("#" + parentDivId + " .lb_element_arrow_red").each(function () {
            $(this).removeClass("lb_element_arrow_red");
            $(this).addClass("lb_element_arrow_gray");
        });
        $("#" + this.getHiddenField(parentDivId)).val('');
        $("#" + (parentDivId).replace("_popup", "_txt")).html('');
    },

    clearAllSelectedImages: function () {
        $(".lp_main_menu_img").each(function () {
            $(this).parent().parent().find(".lp_main_menu_img_select").removeClass("lp_main_menu_img_select");
        });
    },

    getSingleRowId: function (popupid) {
        var id = null;
        if ($("#" + this.getHiddenField(popupid)).val() == undefined)
            return id;
        if ($("#" + this.getHiddenField(popupid)).val() != '' && JSON.parse($("#" + this.getHiddenField(popupid)).val()).query.length > 0)
            id = JSON.parse($("#" + this.getHiddenField(popupid)).val()).query[0].id;
        return id;
    },

    getSingleRowText: function (popupid) {
        var text = null;
        if ($("#" + this.getHiddenField(popupid)).val() != '')
            text = JSON.parse($("#" + this.getHiddenField(popupid)).val()).query[0].text;
        return text;
    },

    getSelectedRowIds: function (popupid) {
        var data = { root: '', selected: [] };
        if ($("#" + this.getHiddenField(popupid)).val() != undefined) {
            if ($("#" + this.getHiddenField(popupid)).val() != '') {
                JSON.parse($("#" + this.getHiddenField(popupid)).val()).query.forEach(function (key, d) {
                    data.selected.push(key.id);
                    data.root = key.root;
                });
            }
        }
        return data;
    },

    getSelectedRowText: function (popupid) {
        var data = { root: '', selected: [] };
        if ($("#" + this.getHiddenField(popupid)).val() != undefined) {
            if ($("#" + this.getHiddenField(popupid)).val() != '') {
                JSON.parse($("#" + this.getHiddenField(popupid)).val()).query.forEach(function (key, d) {
                    data.selected.push(key.text);
                    data.root = key.root;
                });
            }
        }
        return data;
    },

    getSelectedRowIdsFromHiddenField: function (hdnFieldId) {
        var data = { root: '', selected: [] };
        if ($("#" + hdnFieldId).val() != '') {
            JSON.parse($("#" + hdnFieldId).val()).query.forEach(function (key, d) {
                data.selected.push(key.id);
                data.root = key.root;
            });
        }
        return data;
    },

    findAndSelect: function (selectMetadata) {
    
        if (selectMetadata != null && selectMetadata != '' && selectMetadata != undefined) {
            //reference - "<popup id='food_service_occasion_popup'><elepath><level level='1' d='Meal &amp; Snack' v='' s='0'><level2 level='2' d='Meal &amp; Snack' v='' s='1'></level2></level></elepath></popup>"
            var xmlDoc = StringToXML(selectMetadata)
            if (xmlDoc != undefined && xmlDoc != null) {
                $(xmlDoc).find("popup").each(function (index, xNode) {
                    var popupid = $(xNode).attr('id'), ignorefirstlevel = $(xNode).attr("ignorefirstlevel");
                    if (popupid == "total_hispanic_popup") {
                        $("#radio_hispanic").click();
                       }
                  
                    $("#" + popupid).parent().find(".lp_main_menu_img").first().click();                 
                    isRequiredValidator(popupid);
                    $(xNode).find("elepath").each(function (index2, xNode2) {
                        //checking whether row and column is selected 
                        if (xNode2.childElementCount > 0 /*&& popupid != ''*/)
                            FindAndSelectionRecursive(xNode, popupid, '');
                            //selecting default for charts view chart for and comparison popup
                        else if (xNode2.childElementCount <= 0 && (popupid == 'comparison_popup' || popupid == 'viewchartfor_popup')) {
                            $("#" + popupid).find(".lb_col1").find(".lb_element_arrow").first().click();
                            var title = $("#" + popupid).find(".lb_col2").first().find(".lb_element_title").first().text();
                            if (title != "Total Combo Order")    
                               $("#" + popupid).find(".lb_col2").first().find(".lb_element_title").first().click();
                            else {
                                $("#" + popupid).find(".lb_col2").find(".lb_element_arrow").first().click();
                                $("#" + popupid).find(".lb_col3").first().find(".lb_element_title").first().click();
                            }
                        }
                    });
                });
                if ($('.lp_submit').length > 0)
                    if (document.title.indexOf('Charts') > 0)
                        $(".lp_main_menu_img :first").click();
                $('.lp_submit').click();
            }
        }
    },

    //prepare xml basedon popup, popupid - div id of popup, rootText - if manually setting the 1st level(if is missing)
    findAndGetXml: function (popupid, newpopupid, rootText) {
        var xDoc = '';
        if (newpopupid != undefined && newpopupid != '')
            xDoc = StringToXML("<popup id='" + newpopupid + "' oldpopup='" + popupid + "' ignorefirstlevel='" + ((rootText != undefined && rootText != '') ? 'true' : 'false') + "'></popup>");
        else
            xDoc = StringToXML("<popup id='" + popupid + "' oldpopup='" + popupid + "'></popup>");
        if (popupid == "filter_popup" ||popupid=="filter_popup2") {
            if ($("#hdnNavFilterData").val()) {
                var data = JSON.parse($("#hdnNavFilterData").val());
                xDoc = StringToXML("<popup id='" + popupid + "' oldid='" + popupid + "' selid='" + data.selectedIDS + "' selroot='" + data.selectedRoots + "'></popup>");
            }
        }
        var elepath = xDoc.createElement("elepath");
        var level = $(this.getLevelXml(xDoc, popupid, '', 1, '', newpopupid, rootText, elepath));
        if (level != null && level.length > 0 && popupid != "measure_popup")
            elepath.appendChild(level[0]);
        xDoc.documentElement.appendChild(elepath);
        return xDoc;
    },

    getLevelXml: function (xDoc, popupid, rootlevel, levelno, parentText, newpopupid, rootText, elepath) {
        //rootText is not empty means add this to level(1) node
        var levels = [], level = '', thisobj = this, interval = '', year = '', yearTo = '', v = '', v2 = '';

        $("#" + popupid).find(".lb_col_elements").each(function (i, e) {
            levels.push($(e).attr('data-level'));
        });

        var getParentEle = function (parentlevelnode, levelnode, currentele, levelno, rootText) {
           
            if (levelno == 0)
                return;
            var newlevelno = levelno;
            if (rootText != undefined && rootText != '')
                newlevelno += 1;//for custom

            var parentele = thisobj.getElementBasedOnTextLevel(popupid, $(currentele).attr('data-parenttext'), levelno);
            var plevel = '';

            if ($(parentlevelnode).find("level" + (levelno == 1 ? '' : levelno) + '[d="' + $(parentele).find(".lb_element_title").attr("data-text") + '"]').length == 1)
                plevel = $(parentlevelnode).find("level" + (levelno == 1 ? '' : levelno) + "[d='" + $(parentele).find(".lb_element_title").attr("data-text") + "']")[0];
            else if (parentlevelnode != '' && parentlevelnode.getElementsByTagName("level" + (levelno == 1 ? '' : levelno)).length >= 1)
                plevel = xDoc.createElement("level" + (newlevelno == 1 ? '' : newlevelno));
            else if (parentlevelnode != '' && parentlevelnode.getElementsByTagName("level" + (levelno == 1 ? '' : levelno)).length == 0)
                plevel = xDoc.createElement("level" + (newlevelno == 1 ? '' : newlevelno));
            else
                plevel = parentlevelnode;

            if ($(parentlevelnode).find("level" + (levelno == 1 ? '' : levelno) + '[d="' + $(parentele).find(".lb_element_title").attr("data-text") + '"]').length == 0) {
                plevel.setAttributeNode(getXmlAttr(xDoc, 'd', $(parentele).find('.lb_element_title').attr("data-text").replace('&', '&#38;').replace("'", "&apos;")));
                plevel.setAttributeNode(getXmlAttr(xDoc, 'v', $(parentele).attr('data-id')));
                plevel.setAttributeNode(getXmlAttr(xDoc, 'level', newlevelno));
                plevel.setAttributeNode(getXmlAttr(xDoc, 's', $(parentele).hasClass("lb_element_selected") ? 1 : 0));
                plevel.appendChild(levelnode);

                //find the plevel and parentlevelnode are same level, if yes ignore else find the plevel in parentlevelnode if existing add
                //to it. else get the parent of it and follow the above steps in comments
                if (levelno > 1) {
                    if ($(parentlevelnode).attr('d') != $(plevel).attr('d') && $(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']").length == 0) {
                        if (rootText != undefined && rootText != '')
                            newlevelno -= 1;//for custom
                        var newplevel = getParentEle(parentlevelnode, plevel, parentele, newlevelno - 1, rootText);
                        if ($(parentlevelnode).find("level" + $(newplevel).attr('level') + "[d='" + $(newplevel).attr('d') + "']").length > 0) {
                            $(parentlevelnode).find("level" + $(newplevel).attr('level') + "[d='" + $(newplevel).attr('d') + "']")[0].appendChild(plevel);
                            newplevel = '';
                            return parentlevelnode;
                        }
                        else
                            return newplevel;
                    }
                    else {
                        if ($(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']").length > 0)
                            $(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']")[0].appendChild(levelnode);
                        else
                            parentlevelnode.appendChild(levelnode);
                        return parentlevelnode;
                    }
                }

                if (levelno > 1) {
                    if (rootText != undefined && rootText != '')
                        newlevelno -= 1;//for custom
                    return getParentEle(plevel, plevel, parentele, newlevelno - 1, rootText);
                }
                else {
                    if ($(parentlevelnode).attr('d') == $(plevel).attr('d')
                        && (rootText != undefined && rootText != '')
                        && $(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']").length == 0) {//only for custom
                        parentlevelnode.appendChild(levelnode);
                        plevel = parentlevelnode;
                    }
                    else {
                        if ($(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']").length > 0) {
                            $(parentlevelnode).find("level" + $(plevel).attr('level') + "[d='" + $(plevel).attr('d') + "']")[0].appendChild(levelnode);
                            return parentlevelnode;
                        }
                    }

                    if (rootText != undefined && rootText != '') {
                        var rlevel = xDoc.createElement("level");
                        rlevel.setAttributeNode(getXmlAttr(xDoc, 'd', rootText));
                        rlevel.setAttributeNode(getXmlAttr(xDoc, 'v', ''));
                        rlevel.setAttributeNode(getXmlAttr(xDoc, 's', '0'));
                        rlevel.setAttributeNode(getXmlAttr(xDoc, 'level', '1'));
                        rlevel.appendChild(plevel);
                        return rlevel;
                    }
                }
            }
            else {
                //take parent element from xml and add child node to it
                $(parentlevelnode.getElementsByTagName("level" + (levelno == 1 ? '' : levelno))).each(function (i, x) {
                    if ($(x).attr("d") == $(parentele).find(".lb_element_title").attr("data-text"))
                        x.appendChild(levelnode);
                    plevel = parentlevelnode;
                });
            }
            return plevel;
        }

        levels.sort(function(a,b) {
            if (isNaN(a) || isNaN(b)) {
                return a > b ? 1 : -1;
            }
            return a - b;
        });
        var measurexml="";
        var plevel = '';
        var x = 1;
        for (var z = levels[levels.length - 1]; z >= levels[0]; z--) {
            x = z;
            var sele = $("#" + popupid).find(".lb_col_elements[data-level='" + x + "']").find(".lb_element_selected");
            if (sele.length > 0) {
                for (var y = 0; y < sele.length; y++) {
                    if (rootText != '' && rootText != undefined) {//for custom addition at root level
                        x = parseInt(z) + 1;
                        if ($(plevel).find("level" + (x == 1 ? '' : x) + '[d="' + $(sele[y]).find(".lb_element_title").attr("data-text") + '"]').length == 0) {
                            level = xDoc.createElement("level" + (x == 1 ? '' : x));
                            level.setAttributeNode(getXmlAttr(xDoc, 'd', $(sele[y]).find(".lb_element_title").attr("data-text").replace('&', '&#38;').replace("'", "&apos;")));
                            level.setAttributeNode(getXmlAttr(xDoc, 'v', $(sele[y]).attr('data-id')));
                            //level.setAttributeNode(getXmlAttr(xDoc, 's', '1'));
                            //for table module checking the selected text
                            level.setAttributeNode(getXmlAttr(xDoc,'s',IsMetricSelectable(sele,popupid,y)));
                            level.setAttributeNode(getXmlAttr(xDoc, 'level', x));

                            if (z > 1) {
                                plevel = getParentEle(plevel == '' ? level : plevel, level, sele[y], (z - 1), rootText);
                            }
                            else {
                                if (plevel == '') {
                                    if (rootText != '') {
                                        plevel = xDoc.createElement("level");
                                        plevel.setAttributeNode(getXmlAttr(xDoc, 'd', rootText));
                                        plevel.setAttributeNode(getXmlAttr(xDoc, 'v', ''));
                                        plevel.setAttributeNode(getXmlAttr(xDoc, 's', '0'));
                                        plevel.setAttributeNode(getXmlAttr(xDoc, 'level', '1'));
                                        plevel.appendChild(level);
                                    }
                                    else
                                        plevel = level;
                                }
                            }
                        }
                    }
                    else {
                        if ($(plevel).find("level" + (x == 1 ? '' : x) + '[d="' + $(sele[y]).find(".lb_element_title").attr('data-text') + '"]').length == 0) {
                            level = xDoc.createElement("level" + (x == 1 ? '' : x));
                            level.setAttributeNode(getXmlAttr(xDoc, 'd', $(sele[y]).find(".lb_element_title").attr('data-text').replace('&', '&#38;').replace("'", "&apos;")));
                            level.setAttributeNode(getXmlAttr(xDoc, 'v', $(sele[y]).attr('data-id')));
                            level.setAttributeNode(getXmlAttr(xDoc, 's', IsMetricSelectable(sele, popupid,y)));
                            level.setAttributeNode(getXmlAttr(xDoc, 'level', x));
                            var ismeasureselected = IsMetricSelectable(sele, popupid, y);

                            if (x > 1) {
                                plevel = getParentEle(plevel == '' ? level : plevel, level, sele[y], (x - 1));
                            }
                            else {
                                if (plevel == '' || popupid == "measure_popup") {
                                    if (popupid == "measure_popup"){
                                        if (ismeasureselected == '1')
                                            elepath.appendChild(level);
                                    }
                                    else
                                    plevel = level;
                                }
                            }
                        }
                    }
                }
            }
        }
        return plevel == '' ? null : plevel;
    },
    
    getElementBasedOnTextLevel: function (popupid, currentParentEleText, levelNo) {
        return $("#" + popupid).find(".lb_col_elements[data-level='" + levelNo + "']").find('.lb_element_title[data-text="' + currentParentEleText + '"]').first().parent();
    },

    getSearchForPopup: function (parentid, key, allowMultiSelection) {
        if (isStaticSearch(parentid, key, allowMultiSelection)) {
            var availableTags = [];
            var lbserachparent = '';
            if (parentid == "customize_inner_popup") {
                var parid = $("#" + parentid).parent().parent().attr('id');
                $.each($("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find(".lb_element_title"), function () {
                    availableTags.push($(this).html().replace("&amp;", "&"));
                });
                
                $("#" + parid + " .lb_search_text").autocomplete({
                    source: availableTags,
                    select: function (event, ui) {
                        lbserachparent = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]');
                        $(lbserachparent).click();
                        $("#lb_search_text").val($(lbserachparent).html());
                        var value = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]').parent().parent().parent().find(".lb_col_elements");
                        var count = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]').parent().parent().attr('data-level');
                        $.each(value, function (i) {
                            i = i + 1;
                            if (i <= count) {
                                $(value).parent().find(".lb_col" + i)
                            }
                        });                      
                        $(this).trigger("change");
                        this.value = "";
                        return false;
                    },
                    minLength: 0,
                    change: function (event, ui) {
                        if (ui.item == null || ui.item == undefined) {
                            $("#" + parentid + " #lb_search_text").val();
                            $("#" + parentid).find(".lb_element_selected").children().eq(0).click();
                        }
                    }
                });
                $("#" + parentid + " #lb_search_text").on("autocompletechange", function (event, ui) {

                });
            }
            else {
                $.each($("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find(".lb_element_title"), function () {
                    availableTags.push($(this).html().replace("&amp;", "&"));
                });
               
                $("#" + parentid + " #lb_search_text").autocomplete({
                    source: availableTags,
                    select: function (event, ui) {
                        lbserachparent = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]');
                        $(lbserachparent).click();
                        $("#lb_search_text").val($(lbserachparent).html());
                        var value = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]').parent().parent().parent().find(".lb_col_elements");
                        var count = $("#" + parentid + " #lb_search_text").parent().parent().parent().find(".lb_element[data-isselect=true]").find('.lb_element_title[data-text="' + ui.item.value + '"]').parent().parent().attr('data-level');
                        $.each(value, function (i) {
                            i = i + 1;
                            if (i <= count) {
                                $(value).parent().find(".lb_col" + i)
                            }
                        });
                        $(this).trigger("change");
                        this.value = "";
                        return false;
                    },
                    minLength: 0,
                    change: function (event, ui) {
                        if (ui.item == null || ui.item == undefined) {
                            $("#" + parentid + " #lb_search_text").val();
                            $("#" + parentid).find(".lb_element_selected").children().eq(0).click();
                        }
                    }
                });
                $("#" + parentid + " #lb_search_text").on("autocompletechange", function (event, ui) {

                });
            }
        }
    }
}

var getXmlAttr = function (xmlDoc, attrName, attrValue) {
    var attr = xmlDoc.createAttribute(attrName);
    attr.nodeValue = attrValue;
    return attr;
}

var getLeftPanelXml = function (popups, xDoc) {

    var strpopup = '';
    if (popups != '' && popups != undefined) {
        $(popups).each(function (index, d) {
            //strpopup = $.parseXML(AqCrest.Crest.LeftBaseMenu.findAndGetXml(d));
            //$(xDoc).find("root").append(strpopup);
        });
    }
    //xDoc = $(xDoc) + "</root>";
}

function FindAndSelectionRecursive(xNode2, popupid, level) {
    //find the elements
    $(xNode2).find("level" + level).each(function (index3, xNode3) {
        if (level == '')
            level = 1;
        level++;
        if ($(xNode3).attr('s') == 0) {
            $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;","'") + '"]').parent().find(".lb_element_arrow").click();
            if (popupid == "viewchartfor_popup" || popupid == "comparison_popup" || popupid == "filter_popup" || popupid == "table_module_column_popup" || popupid == "table_module_row_popup") {
                findCustomizedataFromSearch(popupid, $(xNode3).find("searchpath"), $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]').parent().find(".lb_element_arrow"));
            }
            else if (popupid == "restaurants_popup" || popupid == "viewgeography_popup") {
                findCustomizedataFromSearch(popupid, $(xNode3).find("searchpath"), $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element[data-parenttext="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]').find(".lb_element_arrow"));
            }
            FindAndSelectionRecursive(xNode3, popupid, level);
            if ($(xNode3).find("level" + level).length > 0) {
                $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]').parent().find(".lb_element_arrow").click();
                level--;
                FindAndSelectionRecursive(xNode3, popupid, level);
            }
        }
        else {
            //for table module, remove _tablemodule  string from popupid
            if (document.title.indexOf('Tables') > 0)
                popupid = popupid.replace('_tablemodule', '');

            if (popupid != "time_period_popup") {
              //  if ($(xNode3).attr('level') != undefined) {
                var ele = $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]')
                    if ($(ele).parent().hasClass("lb_element_selected")) {/*if element is already selected then do nothing else select element*/ }
                    else
                        $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]').first().click();
                    if ($(xNode3).find("level" + level).length > 0) {
                        $("#" + popupid).find(".lb_col_elements[data-level=" + $(xNode3).attr('level') + "]").find('.lb_element_title[data-text="' + $(xNode3).attr('d').replace('&#38;', '&').replace("&apos;", "'") + '"]').parent().find(".lb_element_arrow").click();
                        FindAndSelectionRecursive(xNode3, popupid, level);
                    }
               // }
            }
            else {
                //for timeperiod
                //if ($(xNode3).attr('b') != "point_in_time")
                //    $("." + $(xNode3).attr('b')).click();
                if ($(xNode3).attr('t') != undefined && $(xNode3).attr('t') != '')
                    $("." + $(xNode3).attr('t')).click();
                if ($(xNode3).attr('v') != '') {
                    var hdn = AqCrest.Crest.Timeperiod.getHiddenField(popupid);
                    if (document.title.indexOf('Snapshot') > 0 || document.title.indexOf('Contribution Analysis') > 0 || (document.title.indexOf('Table') > 0 && $(xNode3).attr("b") == undefined && $(xNode3).attr("t") == "point_in_time"))
                    $(xNode3).attr('y', $(xNode3).attr('y2'))
                    $("#" + hdn).attr('nav-type', $(xNode3).attr('d')).attr('nav-id', $(xNode3).attr('v')).attr('nav-id2', $(xNode3).attr('v2')).attr('nav-year', $(xNode3).attr('y')).attr('nav-id1', $(xNode3).attr('y2'));
                }
                $("#" + popupid).find(".lb_timeperiod_element[data-interval='" + $(xNode3).attr('d') + "']").first().click();
            }
        }
    });
}

function getPanelRootElement(ele) {

    var currentLevel = $(ele).parent().parent().attr('data-level');

    if (currentLevel == 2)
        return $(ele).parent().parent().parent().find(".lb_element_showchild[data-id=" + $(ele).parent().attr('data-parent') + "]").first().children().text();
    else if (currentLevel == 1)
        return $(ele).parent().children().text();

    var childele = $(ele).parent().parent().parent().find(".lb_element_showchild[data-id=" + $(ele).parent().attr('data-parent') + "]").first().find(".lb_element_title");
    if (childele.length > 0)
        return getPanelRootElement(childele);
    else
        return true;
}

function checkFoodMetricIsSelectable(popupid) {
    return;
}

function checkIsselectable(key, hiddenfield, allowMultipleSelect) {
    return true;
}

function checkSelectedViewCount(popupid) {
    return true;
}

function findCustomizedataFromSearch(parentid,elements,key) {
    return true;
}

function getDefaultWidgets() { return; }

function showHideHispanic() { return false; }

function isSearchIsEmpty(key) {
    return true;
}

function IsMetricSelectable(sele,popupid,index) {
    return '1';
}

var isStaticSearch = function (parentid, key) {
    return true;
}

function HilightDehilightRowColumnPopup() {
    //just declaration
}

function bindafterLoadPopup() {
    //override if required
}