var parentSectionName = [];
var subSectionName = [];
var count = 1;
var subId;
var dropdownlist = [];
var slideCount = 0;
var insertcheck = 1;
var id = 1;
var visit = 0;
var sec = [];
var overwritesection = [];
var upwidth = 226;
var uploadflag = 0;
var EstablishmentLogoData;
var logoNames = [];
var searchArrayforinsghtsHome = [];
var searchArrayforinsghtsModify = [];
let createParentClicked = false;
let createParentOverwriteArray = [];
let createParentNonOverwriteArray = [];

let sectionsSummary = [];

$(document).ready(function () {
    $("#report").parent().addClass("active");
    $("#report").parent().find(".reports-logo").css("background-position", "6px 2px");

    $("#btnUpload").unbind().bind('click', function (e) {
        e.preventDefault();
        uploadSubsection();
    });
    //    $(document).on('click', '.uploadBtn', function (e) {
    //        e.preventDefault();
    //        uploadSubsection();
    //})
    getSectionName();
    getSubsectionName();
    suboptions(1);
    getEstablishmentDataForLogo();
    $(".dropdown0").select2({
        placeholder: "Select parent section name",
        width: 'resolve',
        allowClear: true,
        tags: "true",
        maximumSelectionLength: 3,

    });
    $("#customerlogo").autocomplete({
        source: logoNames,
        minLength: 2,
        select: function (event, ui) {
            // AddEstablishment(EstablishmentReverseMapping[ui.item.value])
            $("#customerlogo").val(ui.item.value);
            let img = "<img src='../Images/P2PDashboardEsthmtImages/" + ui.item.value + ".svg' />";
            $(".preview-div .preview-image .preview-child-image").css({
                'background': 'unset',
            });
            $(".preview-div .crossbtn .crossbtnImage").css("display", "block");
            //$(".preview-image .preview-child-image span").css({
            //    'background-image': 'unset',
            //})
            //$(".preview-div .preview-image span").remove();
            //$(".preview-div .preview-image").append("<span></span>");
            let url = 'url(../Images/P2PDashboardEsthmtImages/' + encodeURIComponent(ui.item.value).replace(/'/g, "%27") + '.svg)';
            url.replace(/ /g, '%20')

            $(".preview-image .preview-child-image").css({
                //'background-image': 'url(../Images/P2PDashboardEsthmtImages/' + ui.item.value + '.svg)',
                'background-image': url,
                'background-repeat': 'no-repeat',
                'height': 'calc(100%-4px)',
                'background-position': 'center center'
            });
            $(".preview-div .crossbtn").css('left', '42%')
            console.log($(".preview-image .preview-child-image span").css('background-image'))
            //$(".preview-div .preview-image").append(img)
            return false;
        },

    });
    $(".preview-div .crossbtn .crossbtnImage").click(function () {
        $(".preview-div .crossbtn").css('left', '34%')
        $(".preview-div .preview-image .preview-child-image").css({
            'background': 'unset',
        });
        $(".preview-image .preview-child-image").css({
            'background': 'url(../Images/Dine_Sprite_Admin_Sprite.svg) no-repeat -581px -198px',
        });
        //$(".preview-div .crossbtn .crossbtnImage").css("display", "none");
        $("#customerlogo").val("");
        //$("#customername").val("");
    })

    if (UserOrAdmin == 'user') {
        $(".topmenu_2").css('visibility', 'hidden');
        $(".topmenu_3").css('visibility', 'hidden');
        $(".topmenu_4").css('visibility', 'hidden');
    }

    $(".SubSectionName").keypress(function (e) {
        var key = e.keyCode;
        return ((key >= 64 && key <= 90) || (key >= 97 && key <= 122) || (key >= 49 && key <= 57) || (key >= 35 && key <= 41) || key == 126 || key == 46 || key == 44 || key == 33 || key == 43 || key == 61 || key == 125 || key == 123 || key == 127 || key == 93 || key == 59 || key == 91 || key == 96 || key == 94 || key == 95 || key == 32);
    });

    $(".ParentSectionName").keypress(function (e) {
        var key = e.keyCode;
        return ((key >= 64 && key <= 90) || (key >= 97 && key <= 122) || (key >= 49 && key <= 57) || (key >= 35 && key <= 41) || key == 126 || key == 46 || key == 44 || key == 33 || key == 43 || key == 61 || key == 94 || key == 96 || key == 125 || key == 123 || key == 127 || key == 93 || key == 59 || key == 91 || key == 95 || key == 32);
    });

});
/*----------------------------------------------------------------   Create Section- Start--------------------------------------------------------*/
//To select Suboptions 
var suboptions = function (id) {
    $(".adv-fltr-label span").css("color", "#646464");
    $(".adv-fltr-label").removeClass("adv-fltr-label-DemoGraphicProfiling");
    $(".adv-fltr-label").removeClass("Visits-box");
    $(".adv-fltr-label").removeClass("Visits-right-skew");
    $(".adv-fltr-label").css("color", "#000000");
    $(".insights-meet-suboptn").css("display", "none");
    $(".topmenu_" + id).addClass("Visits-box");
    $(".topmenu_" + id).addClass("Visits-right-skew");
    $(".Visits-right-skew span").css("color", "#ffffff")
    $('.lft-popup-col-search-forinsights-home').css('display', 'none');
    $('.lft-popup-col-search-forinsights-modify').css('display', 'none');
    $('.order-summary-bdy').html('');
    $('.home-selct-deselct-check').prop('checked', false);
    $(".modify-chckbox-home-parent").prop("checked", false);
    $(".home-modify-chckbox").prop("checked", false);
    $('.selct-deselct-check').prop("checked", false);
    switch (id) {
        case 1:
            $(".browse").css("display", "none");
            $(".sub_1").css("display", "block");
            $(".footer-text").html("");
            getHomePageData();
            $(".order-summary-bdy").niceScroll({ autohidemode: false })
            $(".table-bdy").niceScroll({ autohidemode: false })
            break;
        case 2:
            getSectionName();
            getSubsectionName();
            $(".browse").css("display", "none");
            $(".sub_2").css("display", "block");
            $(".footer-text").html("");
            modifyOutPut();
            $(".mod-bdy").niceScroll({ autohidemode: false })
            break;
        case 3:
            getSectionName();
            $("#addSection").css("display", "block");
            $(".sub_3").css("display", "block");
            $(".browse").css("display", "none");
            $(".footer-text").html("");
            //$(".maincontainer").niceScroll()
            break;
        case 4:
            getSectionName();
            getSubsectionName();
            $(".sub_4").css("display", "block");
            $(".browse").css("display", "flex");
            $(".browse").css("align-item", "center");
            $(".footer-text").html("NOTE:Click 'Browse' at the top to add more files. A maximum of 10 files can be selected and uploaded in one iteration");
            $(".subsectionmaincontainer").niceScroll({ autohidemode: false })
            $("#ascrail2002-hr .nicescroll-cursors").css("display", "none")
            break;
    }
    $(".nicescroll-rails-hr .nicescroll-cursors").css("display", "none")
}
//To get section names to list the DropDown
var getSectionName = function () {

    dropdownlist = [];
    parentSectionName = [];
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GetSectionNameDropDwnList",
        method: "GET",
        contentType: "application/json",
        success: function (response) {

            $(".dropdown0 option").remove();
            $(".dropdown0").append("<option hidden></option>");
            for (let j = 0; j < response.length; j++) {
                dropdownlist.push({ val: response[j].SectionId, text: response[j].SectionName });
                parentSectionName.push(response[j].SectionName.toLowerCase());
                $(".dropdown0").append($("<option></option>").val(response[j].SectionId).html(response[j].SectionName));
                if (dropdownlist.length == 0) {
                    $(".show-message-container-nullpopup").css('display', 'block');
                    $(".alert-message").html("create atleast one parent section");
                    $(".transparentBG").show();
                    return false;

                }
            }

            visit = 1;
        }
        ,
        error: ajaxError
    });

}
var getSubsectionName = function () {
    subSectionName = [];
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GetSubSectionName",
        method: "GET",
        contentType: "application/json",
        success: function (response) {

            for (let j = 0; j < response.length; j++) {
                subSectionName[j] = response[j].SubSectionName.toLowerCase();
            }


        }
        ,
        error: ajaxError
    });
}
//To create a Multiple Parent Section when the user click + button
var px = parseInt($('.maincontainer').css('height'));
var height = 268;
var he = 25;
var btnhe = 123;
var createParentSection = function () {

    $('.maincontainer').css('height', height)
    var section = '<div class="createParentContainer">';
    section += '<input type="text"  class="ParentSectionName" id="sectionname' + count + '" placeholder="Name of Parent Section" autocomplete="off" />';
    section += ' <br />';
    section += '<textarea rows="2" cols="30"  name="Description" class="Description" id="desc' + count + '" placeholder="Description(Max 500 words)" maxlength="500"/>';
    section += '</div>';

    let h = parseInt($("#addSection").css('margin-top'));


    $('.maincontainer').append(section);
    count += 1;
    px += 209;
    if (px > 800) {
        $('.maincontainer').css('height', 378)
    }
    height = 378
    if (count == 4) {
        $('.maincontainer').css('overflow-y', 'scroll');
        $(".maincontainer").niceScroll({ autohidemode: false });
    }
    $(".ParentSectionName").keypress(function (e) {
        var key = e.keyCode;
        return ((key >= 64 && key <= 90) || (key >= 97 && key <= 122) || (key >= 49 && key <= 57) || (key >= 35 && key <= 41) || key == 126 || key == 46 || key == 44 || key == 33 || key == 43 || key == 61 || key == 94 || key == 96 || key == 125 || key == 123 || key == 127 || key == 93 || key == 59 || key == 91 || key == 95 || key == 32);
    });

}
//To insert a ParentSection as Whole Section
var createSection = function () {
    let flag;
    let pname = [];
    var selectionsObj = [];
    let overwriteSelection = [];

    for (let j = 0; j < count && createParentClicked == false; j++) {
        let name = $('#sectionname' + j).val().trim().toLowerCase();
        let originalName = $('#sectionname' + j).val().trim();
        let des = $('#desc' + j).val().trim();
        if (name == "") {
            $("#alert").css('display', 'block');
            $("#message").html("section name should not be empty");
            $(".transparentBG").show();
            return false;
        }
        if ($.inArray(name, pname) != -1) {
            $("#alert").css('display', 'block');
            $("#message").html("section name should be unique " + originalName + " is already present");
            $(".transparentBG").show();
            return false;

        }
        pname.push(originalName);

    }



    for (let j = 0; j < count && createParentClicked == false; j++) {

        let name = $('#sectionname' + j).val().trim().toLowerCase();
        let originalName = $('#sectionname' + j).val().trim();

        let des = $('#desc' + j).val().trim();

        if ($.inArray(name, parentSectionName) != -1) {
            overwriteSelection.push({ SectionName: originalName, SectionDesc: des });
        }
        else {
            selectionsObj.push({ SectionName: originalName, SectionDesc: des });
        }



    }

    if (createParentClicked == false) {
        createParentClicked = true;
        createParentOverwriteArray = overwriteSelection;
        createParentNonOverwriteArray = selectionsObj;
    }

    if (createParentOverwriteArray.length != 0) {

        for (let i = 0; i < createParentOverwriteArray.length; i++) {
            let parentData = [];
            parentData.push(createParentOverwriteArray[i]);
            createParentOverwriteArray.splice(i, 1);
            popupOverwriteSection(parentData);
            return false;
        }

    }
    //insert section to database by calling ajax
    if (createParentNonOverwriteArray.length != 0) {
        $(".loader,.transparentBG").show();
        $.ajax({
            cache: false,
            url: appRouteUrl + "Report/CreateSection",
            data: JSON.stringify(createParentNonOverwriteArray),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                $(".loader,.transparentBG").hide();
                if (response == "TRUE") {
                    $("#alert").css('display', 'block');
                    $("#message").html("section(s) are created successfully");
                    for (let j = 0; j < count; j++) {
                        $('#sectionname' + j).val("");
                        $('#desc' + j).val("");
                    }
                    getSectionName();
                    $(".createParentContainer:not(:eq(0))").remove();
                    $(".maincontainer").css("height", "144px");
                    count = 1;
                    px = parseInt($('.maincontainer').css('height'));
                    height = 268;
                    he = 25;
                    btnhe = 123;
                } else {
                    $("#alert").css('display', 'block');
                    $("#message").html("section(s) are not created successfully");
                }
                $(".transparentBG").show();

            }, error: ajaxError
        });
    }
    createParentClicked = false;
    createParentOverwriteArray = [];
    createParentNonOverwriteArray = [];
}

var sectionValidation = function (name, des) {
    let flag = 0;

    let checksection = "true";
    let checkdesc = "true";
    if (name == "") {
        $("#alert").css('display', 'block');
        $("#message").html("section name should not be empty");
        $(".transparentBG").show();
        return false;
    }
    else
        flag=1;
    //description validation
    if (des != "") {
        if (des.length >= 250) {
            $("#alert").css('display', 'block');
            $("#message").html("maximum word limit is 250 character" + j + "th section");
            $(".transparentBG").show();
            return false;
        }
    }
    else
        flag = 1;
    //if ((checksection == "false") && (checkdesc == "false")) {

    //    $("#alert").css('display', 'block');
    //    $("#message").html("section name and decription should not be empty");
    //    $(".transparentBG").show();
    //    return false;
    //}
    //else if(checksection == "false") {
     
    //}
    //else if (checkdesc == "false") {
    //    $("#alert").css('display', 'block');
    //    $("#message").html("description should not be empty");
    //    $(".transparentBG").show();
    //    return false;
    //}

    return flag;
}
//To insert Section for particular Section
var createSectionParticular = function (id) {
    let selectionsObj = [];
    let flag;
    let name = $('#sectionname' + id).val().trim().toLowerCase();
    let des = $('#desc' + id).val().trim().toLowerCase();
    selectionsObj.push({ SectionName: name, SectionDesc: des });
    flag = sectionValidation(name, des);
    if (flag == 2) {
        $.ajax({
            cache: false,
            url: appRouteUrl + "Report/CreateSection",
            data: JSON.stringify(selectionsObj),
            method: "POST",
            contentType: "application/json",
            success: function (response) {
                if (response == "TRUE") {
                    $("#alert").css('display', 'block');
                    $("#message").html("section(s) are created successfully.");
                    $('#sectionname' + id).val("");
                    $('#desc' + id).val("");
                } else {
                    $("#alert").css('display', 'block');
                    $("#message").html("section(s) are not created.");
                }
                $(".transparentBG").show();
            }, error: ajaxError
        });
    }
}
/*-----------------------------------------------------    UploadSection- Start--------------------------------------------------------*/

//To Check the PPT validation and Create the div container for multiple File Uploaded
var checkPPT = function (event) {


    $(".uploadBtn").css('display', 'flex');
    $(".uploadBtn").css('align-item', 'center');
    var filename = [];
    let checkcount = 0;
    var fileExtension = ['ppt', 'pptx'];
    var fileCount = event.target.files.length;
    // To check maximum Limit of the file is exceed or not.
    if (fileCount > 10) {
        $("#alert").css('display', 'block');
        $("#message").html("maximum limit of the file selection is 10.");
        $(".transparentBG").show();
        return false;
    }
    var uploadedFiles = $('#fileUpload')[0].files;
    var formData = new FormData();
    //check whether the uploaded file is ppt or not.
    if (uploadedFiles.length > 0) {

        var fileextension = ["ppt", "pptx"];
        for (var i = 0; i < uploadedFiles.length; i++) {
            if ($.inArray(uploadedFiles[0].name.split('.').pop().toLowerCase(), fileextension) == -1) {
                $("#alert").css('display', 'block');
                $("#message").html("only formats are allowed : " + fileextension.join(', '));
                $(".transparentBG").show();
                return false;
            }
            else
                formData.append(uploadedFiles[i].name, uploadedFiles[i]);
            checkcount += 1;
        }
    }
    //To insert the ppt in our floder(PPTbulider)
    if (checkcount == fileCount) {
        $.ajax({
            cache: false,
            url: appRouteUrl + "PPTBuilder/UploadHandler.ashx",
            data: formData,
            method: "POST",
            contentType: false,
            processData: false,
            success: function (response) {
            },
            error: ajaxError
        });
        uploadflag = uploadflag + 1;
        //To create a multiple div for uploaded file
        if (uploadflag == 1) {
            let limit = 207;

            $('.filename').html(uploadedFiles[0].name.split('.')[0]);
            $('.filename').attr('upload-fname', uploadedFiles[0].name);
            //sai
            $('.filename').attr({ "title": uploadedFiles[0].name.split('.')[0] })
            let px = parseInt($('.subsectionmaincontainer').css('height'));
            //if (checkcount == 1)
            //    $('#checkbox0').css('top', 17);
            //else
            //$('#checkbox0').css('top', 33);
            let fileid = $(".subSectionContainer").prev().find(".subsection-checkbox").attr("value");
            let k = 1;
            for (let j = 1; j <= checkcount - 1; j++, k++) {
                if (j == fileid) {
                    k++;
                }
                $('.subsectionmaincontainer').css('height', 394)
                $('.subsectionmaincontainer').append('<label class="checkbox-subsection commoncheckbox"><input type="checkbox" class="subsection-checkbox checkbox' + k + '" name="section" value="' + k + '" toggleCheckbox(this)><span  class="span-commoncheckbox " id="checkbox' + k + '" ></span> </label>');
                let subsec = '<div class="subSectionContainer subsection" id="subsec' + k + '">';
                $('.checkbox-subsection span').css('margin-top', 33)
                subsec += '<input type="text" class="SubSectionName" id="subName' + k + '"  placeholder="Name of Sub-Section" autocomplete="off" required />';
                subsec += '<br>';
                subsec += '<textarea rows="2" cols="30" name="Description" class="subDescription" id="description' + k + '" placeholder="Description(250 character)" maxlength="250" required></textarea>';
                subsec += '<div id="dropdowncontainer' + k + '"> <select class="commondropdown dropdown' + k + '" style="width:96.9%" ></select></div>';
                subsec += "<div  class='commonbtn filename filename" + k + "' onmouseover='showName(" + k + ")' upload-fname='" + uploadedFiles[j].name + "'title='" + uploadedFiles[j].name.split('.')[0] + "' >" + uploadedFiles[j].name.split('.')[0] + "</div>";
                //subsec += '<div class="commonbtn filename filename' + j + '" onmouseover="showName(' + j + ')" onmouseout="HideName(' + j + ')">' + uploadedFiles[j].name.split('.')[0] + '</div>';
                subsec += '<div class="commonbtn clear" onclick="clearSection(' + k + ')" ><p id="text"> Clear</p></div>';
                subsec += '</div>';
                subsec += '<br class="breakline" id="breakline' + k + '"/>';
                $('.subsectionmaincontainer').append(subsec);
                limit = limit - 40;
                $(".dropdown" + k).find("option").remove();
                $(".dropdown" + k).append("<option hidden></option>");
                $("#dropdown" + k).select2({

                    data: dropdownlist
                });
                for (let l = 0; l < dropdownlist.length; l++) {
                    $(".dropdown" + k).append($("<option></option>").val(dropdownlist[l].val).html(dropdownlist[l].text));
                    $(".dropdown" + k).select2(
                                 {
                                     placeholder: "Select parent section name",
                                     width: 'resolve',
                                     allowClear: true,
                                     tags: "true",
                                     maximumSelectionLength: 3,
                                 });

                }
                insertcheck = insertcheck + 1;
                px += 209;

                id++;
            }

        }

        else {
            let limit = 207;
            let lengthupload = insertcheck + fileCount;
            if (lengthupload > 10) {
                $("#alert").css('display', 'block');
                $("#message").html("maximum limit of the file selection is 10.");
                $(".transparentBG").show();
                return false;
            }
            let index = 0;
            let px = parseInt($('.subsectionmaincontainer').css('height'));
            let fileId = [];
            $(".subSectionContainer").prevAll().find(".subsection-checkbox").each(function (index, value) { fileId.push($(this).attr("value")) })
            let j = insertcheck + 1;
            let l = j;
            for (j; j <= lengthupload; j++, l++) {

                if ($.inArray(l.toString(), fileId) != -1) {
                    l = GetNextValue(l, fileId);
                }
                $('.subsectionmaincontainer').css('height', 394)
                //let k = j - 1;
                $('.subsectionmaincontainer').append('<label class="checkbox-subsection commoncheckbox"><input type="checkbox" class="subsection-checkbox  checkbox' + l + '" name="section" value="' + l + '" toggleCheckbox(this)><span  class="span-commoncheckbox" id="checkbox' + l + '" ></span> </label>');
                let subsec = '<div class="subSectionContainer subsection" id="subsec' + l + '">';
                $('.checkbox-subsection span').css('margin-top', 33)
                subsec += '<input type="text" class="SubSectionName" id="subName' + l + '"  placeholder="Name of Sub-Section" autocomplete="off" required />';
                subsec += '<br>';
                subsec += '<textarea rows="2" cols="30" name="Description" class="subDescription" id="description' + l + '" placeholder="Description(250 character)" maxlength="250" required></textarea>';
                subsec += '<div id="dropdowncontainer' + l + '"><select class="commondropdown dropdown' + l + '" style="width:96.9%"></select></div>';
                //subsec += '<div class="commonbtn filename filename' + j + '" onmouseover="showName(' + j + ')" onmouseout="HideName(' + j + ')">' + uploadedFiles[index].name.split('.')[0] + '</div>';
                subsec += "<div class='commonbtn filename filename" + l + "' onmouseover='showName(" + l + ")' upload-fname='" + uploadedFiles[index].name + "' title='\"" + uploadedFiles[index].name.split('.')[0] + "\"' >" + uploadedFiles[index].name.split('.')[0] + "</div>";
                subsec += '<div class="commonbtn clear" onclick="clearSection(' + l + ')"><p id="text"> Clear</p></div>';
                subsec += '</div>';
                subsec += '<br class="breakline" id="breakline' + l + '"/>';
                $('.subsectionmaincontainer').append(subsec);
                limit = limit - 40;
                $(".dropdown" + l).find("option").remove();
                $(".dropdown" + l).append("<option hidden></option>");
                for (let k = 0; k < dropdownlist.length; k++) {
                    $(".dropdown" + l).append($("<option></option>").val(dropdownlist[k].val).html(dropdownlist[k].text));
                    $(".dropdown" + l).select2(
                    {
                        placeholder: "Select parent section name",
                        width: 'resolve',
                        allowClear: true,
                        tags: "true",
                        maximumSelectionLength: 3,

                    });
                }
                insertcheck++;
                px += 209;
                //if (px > 880) {
                //    $('.subsectionmaincontainer').css('overflow-y', 'scroll');
                //}
                index++;
                $("#dropdowncontainer" + l).css({
                    'position': 'relative',
                    'left': '1%',
                    'top': '66%',
                })
            }

        }
        upwidth = 423;
    }

    $(".SubSectionName").keypress(function (e) {
        var key = e.keyCode;
        return ((key >= 64 && key <= 90) || (key >= 97 && key <= 122) || (key >= 49 && key <= 57) || (key >= 35 && key <= 41) || key == 126 || key == 46 || key == 44 || key == 33 || key == 43 || key == 61 || key == 94 || key == 96 || key == 125 || key == 123 || key == 127 || key == 93 || key == 59 || key == 91 || key == 95 || key == 32);
    });
}
//To insert uploaded file to database
var uploadSubsection = function () {

    let subsec = [];
    var favorite = [];
    let currentsubsec = [];
    let subnameLC = [];
    let subname = [];
    let ischeck = 0;
    //to get which checkbox is checked
    $.each($("input[name='section']:checked"), function () {
        favorite.push($(this).val());
        subnameLC.push($("#subName" + parseInt($(this).val().trim())).val().toLowerCase());
        subname.push($("#subName" + parseInt($(this).val().trim())).val());
    });
    subname.sort();
    subnameLC.sort();
    for (let k = 1; k < subnameLC.length; k++) {
        if (subnameLC[k] == subnameLC[k - 1]) {

            $("#alert").css('display', 'block');
            $("#message").html("Sub-Section Name should be unique");
            $(".transparentBG").show();
            return false;
        }
    }
    //If no checkbox is checked,it will give the alert popup to select atleast one checkbox.
    if (favorite.length == 0) {
        $("#alert").css('display', 'block');
        $("#message").html("Please select at least one sub-section");
        $(".transparentBG").show();
        return false;
    }

    let d, s, dl, f, selectedoption;

    for (let k = 0; k < favorite.length; k++) {
        dl = $(".dropdown" + parseInt(favorite[k])).val();
        selectedoption = $(".dropdown" + parseInt(favorite[k])).find('option:selected').text();
        s = $("#subName" + parseInt(favorite[k])).val().toLowerCase();

        d = $("#description" + parseInt(favorite[k])).val();
        f = $(".filename" + parseInt(favorite[k])).attr('upload-fname');

        if (s == "") {
            $("#alert").css('display', 'block');
            $("#message").html("subsection name should not be empty");
            $(".transparentBG").show();
            return false;
        }
        //if (d == "") {
        //    $("#alert").css('display', 'block');
        //    $("#message").html("description should not be empty");
        //    $(".transparentBG").show();
        //    return false;
        //}
        else if (dl == "" || dl == null) {
            $("#alert").css('display', 'block');
            $("#message").html(" Please Select any parentsection in dropdown");
            $(".transparentBG").show();
            return false;
        } else if (f == "Uploaded File Name.ppt" || f == " ") {
            $("#alert").css('display', 'block');
            $("#message").html("Browse file to upload");
            $(".transparentBG").show();
            return false;
        }

    }
    d = "", s = "", dl = "", f = "", selectedoption = "";

    //To get the value of each section based on the user selection
    for (let k = 0; k < favorite.length; k++) {
        dl = $(".dropdown" + parseInt(favorite[k])).val().trim();
        selectedoption = $(".dropdown" + parseInt(favorite[k])).find('option:selected').text();
        sn = $("#subName" + parseInt(favorite[k])).val().trim().toLowerCase();
        s = $("#subName" + parseInt(favorite[k])).val().trim();
        sn = $("#subName" + parseInt(favorite[k])).val().trim().toLowerCase();
        d = $("#description" + parseInt(favorite[k])).val().trim();
        f = $(".filename" + parseInt(favorite[k])).attr('upload-fname');

        if (sn != "") {
            if ($.inArray(sn, subSectionName) != -1) {
                $('.bdycontent').attr('data-point', parseInt(favorite[k]));
                popup(s);
                return false;
            }

        }
        else {
            $("#alert").css('display', 'block');
            $("#message").html("subsection name should not be empty");
            $(".transparentBG").show();
            return false;
        }
        //if (d == "") {
        //    $("#alert").css('display', 'block');
        //    $("#message").html("description should not be empty");
        //    $(".transparentBG").show();
        //    return false;
        //}
         if (dl == "" || dl == null) {
            $("#alert").css('display', 'block');
            $("#message").html("Select any parentsection in dropdown");
            $(".transparentBG").show();
            return false;
        } else if (f == "Uploaded File Name.ppt" || f == " ") {
            $("#alert").css('display', 'block');
            $("#message").html("Browse file to upload");
            $(".transparentBG").show();
            return false;
        }
        else
            subsec.push({ subsectionName: sn, SubSectionNamedesc: d, SectionId: dl, Filename: f, SectionName: selectedoption });
        ischeck += 1;
    }

    //To insert the section data to backend.
    if (ischeck == favorite.length) {
        $(".loader,.transparentBG").show();
        $.ajax({
            cache: false,
            url: appRouteUrl + "Report/UploadFile",
            data: JSON.stringify(subsec),
            method: "POST",
            async: false,
            contentType: "application/json",
            success: function (response) {
                $(".loader,.transparentBG").hide();
                if (response == "TRUE") {
                    $("#alert").css('display', 'block');
                    $("#message").html("Sub-section(s) are created successfully");
                    //$(".subsection").remove();
                    $('.breakline:not(:first)').remove();
                    //$('#checkbox' + id).remove();
                    $(".checkbox-subsection:not(:first)").remove();
                    //$('.commoncheckbox').remove();
                    $('.subSectionContainer:not(:first)').remove();
                    //$('.dropdown0').select2('val', ' ');
                    $(".commondropdown").select2('val', ' ');
                    $(".select2-selection__rendered").attr("title", "");
                    //$("#subName0").val("");
                    $(".SubSectionName").val("");
                    $(".subDescription").val("");
                    $('.filename').attr('upload-fname', ' ');
                    //$(".filename0").text("Uploaded FileName");
                    $(".filename").text("Uploaded FileName");
                    $('#fileUpload').val('');
                    //$(".checkbox0").prop("checked", false);
                    $(".subsection-checkbox").prop("checked", false);
                    $('.checkbox-subsection span').css('margin-top', 17);
                    uploadflag = 0;
                    insertcheck = 1;
                    $('.subsectionmaincontainer').css('height', 228);
                    getSubsectionName();

                } else {
                    $("#alert").css('display', 'block');
                    $("#message").html("Sub-section(s) are not created");
                }
                $(".transparentBG").show();

            }, error: ajaxError
        });
    }
}
//To show the overwrite popup
var popup = function (subsecname) {
    let k = 0
    $('.transparentBG').show();
    $(".overwrite-alert").css('z-index', '5000');
    $(".overwrite-alert").css('background-color', 'white');
    $(".headerdiv").html(subsecname + " ALREADY EXISTS");

    $(".overwrite-alert").css('display', 'block');
    $(".bdycontent").html("Are you sure you want to overwrite Existing-subsections");
    $('.submit_btn').unbind("click").click(function () {
        $(".overwrite-alert").css('display', 'none');
        overWriteSubmit();
    });


}
var popupOverwriteSection = function (sectionName) {
    $('.transparentBG').show();
    $(".overwrite-alert").css('z-index', '5000');
    $(".overwrite-alert").css('background-color', 'white');
    $(".headerdiv").html(sectionName[0].SectionName + " ALREADY EXISTS");

    $(".overwrite-alert").css('display', 'block');
    $(".bdycontent").html("Are you sure you want to overwrite Existing-Sections");
    $('.submit_btn').unbind("click").click(function () {
        $(".overwrite-alert").css('display', 'none');
        OverWriteSectionSubmit(sectionName);
    });

}
//To close the alert popup.
var closePopup = function () {

    $(".show-message-container-nullpopup").css('display', 'none');
}
//redirect to parent section when user click ok in alert popup.
var redirectToparent = function () {
    $(".topmenu_" + 3).addClass("Visits-box");
    $(".topmenu_" + 3).addClass("Visits-right-skew");
    $(".sub_3").css("display", "block");
    $(".topmenu_" + 4).removeClass("Visits-box");
    $(".topmenu_" + 4).removeClass("Visits-right-skew");
    $(".show-message-container-nullpopup").css('display', 'none');
}
var redirect = function () {
    $(".show-message-container-nullpopup").css('display', 'none');
    $(".transparentBG").css("display", "none");
}
var showName = function (id) {
    let x = $(".filename" + id).text();

}
var clearSection = function (id) {

    let len = $(".subSectionContainer").length;
    if (len == 1) {
        $(".SubSectionName").val("");
        $(".subDescription").val("");
        $('.commondropdown').select2('val', ' ')
        //$('.select2-selection__rendered').text("Select Parent Section Name");
        //$('.select2-selection__rendered').css({
        //    'font-family': 'Chivo-Regular',
        //    'font-size': '12px',
        //    'color': '#757575',
        //    'text-transform': 'capitalize'
        //})
        $(".select2-selection__rendered").attr("title", "");
        $(".uploadBtn").css("display", "none")
        $('.filename').attr('upload-fname', ' ');
        $(".filename").text("Uploaded File Name");
        $(".filename").prop("title", "");
        $("#fileUpload").val('');
        $('.checkbox-subsection span').css('margin-top', 17)
        $(".checkbox" + id).prop('checked', false);
        $(".subsectionmaincontainer").css('height', '206px')
        uploadflag = 0;

    }
    else {
        if (len == 2) {
            $(".subsectionmaincontainer").css('height', '206px')
        }
        $("#subsec" + id).remove();
        $('#breakline' + id).remove();
        $('.checkbox' + id).parent().remove();
        insertcheck--;
    }
    l = $(".subSectionContainer").length;
    if (l == 1) {
        $('.checkbox-subsection span').css('margin-top', 17)
    }





}

var overWriteCancel = function () {
    $('.transparentBG').hide();
    $(".overwrite-alert").css('display', 'none');
}
var overWriteSubmit = function () {
    overwritesection = [];
    let element = parseInt($('.bdycontent').attr('data-point'));

    let d, s, dl, f;
    dl = $(".dropdown" + element).val().trim();
    selectedoption = $(".dropdown" + element).find('option:selected').text();
    s = $("#subName" + element).val().trim().toLowerCase();
    d = $("#description" + element).val().toLowerCase();
    f = $(".filename" + element).attr('upload-fname');
    //if (d == "") {
    //    $("#alert").css('display', 'block');
    //    $("#message").html("description should not be empty");
    //    $(".transparentBG").show();
    //    return false;
    //}
     if (dl == "") {
        $("#alert").css('display', 'block');
        $("#message").html("Please Select any parentsection in dropdown");
        $(".transparentBG").show();
        return false;
    } else if (f == "Uploaded FileName.ppt") {
        $("#alert").css('display', 'block');
        $("#message").html("browse file to upload");
        $(".transparentBG").show();
        return false;
    }
    else
        overwritesection.push({ subsectionName: s, SubSectionNamedesc: d, SectionId: dl, Filename: f, SectionName: selectedoption });
    $(".loader,.transparentBG").show();
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/UploadOverwriteFile",
        data: JSON.stringify(overwritesection),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            $(".loader,.transparentBG").hide();
            if (response == "TRUE") {
                $(".checkbox" + element).prop('checked', false);
                $(".overwrite-alert").css('display', 'none');
                $("#subName" + element).val('');
                $("#description" + element).val('');
                $('.dropdown' + element).select2('val', ' ');
                $('.dropdown' + element).next().find('.select2-selection__rendered').attr('title', "");
                $('.filename' + element).attr('upload-fname', ' ');
                $(".filename" + element).text("Uploaded File Name");
                $(".filename" + element).prop("title", "");
                $("#fileUpload").val('');
                uploadflag = 0;
                let len = $("input[name='section']:checked").length;
                if (len == 0) {
                    $('.breakline:not(:first)').remove();
                    $(".checkbox-subsection:not(:first)").remove();
                    $('.subSectionContainer:not(:first)').remove();
                    $(".commondropdown").select2('val', ' ');
                    $(".select2-selection__rendered").attr("title", "");
                    $(".SubSectionName").val("");
                    $(".subDescription").val("");
                    $('.filename').attr('upload-fname', ' ');
                    $(".filename").text("Uploaded FileName");
                    $('#fileUpload').val('');
                    $(".subsection-checkbox").prop("checked", false);
                    $('.checkbox-subsection span').css('margin-top', 17);
                    uploadflag = 0;
                    insertcheck = 1;
                    $('.subsectionmaincontainer').css('height', 228);
                    $("#alert").css('display', 'block');
                    $("#message").html("sub-section(s) are uploaded  successfully");
                }
                //let len = $('.subSectionContainer ').length

                if (len > 0) {
                    uploadSubsection();
                }
            }
            else {
                $("#alert").css('display', 'block');
                $("#message").html("sub-section(s) not uploaded ");
            }

            $(".transparentBG").show();
        },
        error: ajaxError
    });
    return 1;
}

/*----------------------------------------------------------    Modify OutputStart--------------------------------------------------------*/
//To get the data for modify section module.
var modifyOutPut = function () {
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GetModifySectnsData",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            searchArrayforinsghtsHome = [];
            searchArrayforinsghtsModify = [];
            bindModifydata(response);
            pushintoSearchArrayModify();
        }
        ,
        error: ajaxError
    });

}
//To bind the data with table format
var bindModifydata = function (data) {
    let parentSectoinList = [];
    $.each(data, function (i, v) {
        if (parentSectoinList.indexOf(v.ParentSectName) == -1 && v.ParentSectName == "") {
            parentSectoinList.push({ 'secName': v.ParentorSubSectName, 'id': v.ParentorSubSectId });
        }
    });
    var modifyOutputHtml = "";
    let k = 0;
    var firstsection;
    $.each(parentSectoinList, function (Ip, Iv) {
        modifyOutputHtml += "<div class='bdy-parnt-sectnamediv'>";
        for (let i = 0; i < data.length; i++) {
            if (data[i].ParentorSubSectName == Iv.secName && data[i].ParentSectName == "") {
                modifyOutputHtml += "<div class='bdy-parnt-sectname' >";
                modifyOutputHtml += "<div class='parent-sectnamediv _row sectionname-div-" + data[i].ParentorSubSectId + " namesection" + i + "' id='sectname0' data-id='" + data[i].ParentorSubSectId + "'  sect-name='" + data[i].ParentorSubSectName + "' sect-desc='" + data[i].ParentorSubSectDesc + "'><div><label class='checkbox-modify'><input type='checkbox' class='modify-chckbox-parent parentcheckbox" + i + " parent-checkbox" + data[i].ParentorSubSectId + " modify-parent-checkbox" + data[i].ParentorSubSectId + "' name='ParentSection' value='" + i + "' onchange='toggleCheckbox(" + i + ");' /><span class='checkbox-span'></span></lable></div>";
                  
                if (data[i].ParentorSubSectDesc != " ") {
                    modifyOutputHtml += "<div class='parent-sectnexpandcoll datahidetext section-" + data[i].ParentorSubSectId + "' id='parent-sectnexpandcoll" + data[i].ParentorSubSectName + "' onclick='toggleSubSectn(this,\"" + data[i].ParentorSubSectId + "\")'><div id='expand-text'></div></div><div class=' parentsectioname-container parentsectnname" + i + "' data-id='" + data[i].ParentorSubSectId + "' ><div class='nameText' title='" + data[i].ParentorSubSectName + " (Description: " + data[i].ParentorSubSectDesc + ")" + "'><div class='sectname-pdesc' id='sectname-p '>" + data[i].ParentorSubSectName + " (Description: " + data[i].ParentorSubSectDesc + ")</div> </div></div></div>";
                    searchArrayforinsghtsModify.push({ label: data[i].ParentorSubSectName + ' (' + 'Description:' + ' ' + data[i].ParentorSubSectDesc + ' ' + ")", id: "subsec" + i, sectionid: data[i].ParentorSubSectId, subid: data[i].ParentorSubSectId, classname: "modify-chckbox-parent", element: i });
                }
                else
                {
                    modifyOutputHtml += "<div class='parent-sectnexpandcoll datahidetext section-" + data[i].ParentorSubSectId + "' id='parent-sectnexpandcoll" + data[i].ParentorSubSectName + "' onclick='toggleSubSectn(this,\"" + data[i].ParentorSubSectId + "\")'><div id='expand-text'></div></div><div class=' parentsectioname-container parentsectnname" + i + "' data-id='" + data[i].ParentorSubSectId + "' ><div class='nameText' title='" + data[i].ParentorSubSectName + "'><div class='sectname-pdesc' id='sectname-p '>" + data[i].ParentorSubSectName + "</div> </div></div></div>";
                      
                    searchArrayforinsghtsModify.push({ label: data[i].ParentorSubSectName  , id: "subsec" + i, sectionid: data[i].ParentorSubSectId, subid: data[i].ParentorSubSectId, classname: "modify-chckbox-parent", element: i });
                 }
                modifyOutputHtml += "<div class='uploadedon _row uploadon-div-" + data[i].ParentorSubSectId + " uploadsection" + i + "' id='upload0'><div class='updateDate'>" + data[i].UploadedDate + "</div></div>";
                modifyOutputHtml += "<div class='uploadedby _row uploadby-div-" + data[i].ParentorSubSectId + " uploadbysection" + i + "' id='uploadby0'><div class='updateby'>" + data[i].UploadedBy + "</div></div>";
                modifyOutputHtml += "<div class='slide-count _row slidecount-div-" + data[i].ParentorSubSectId + " slidecountsection" + i + "' id='count0'><div class='slideCount'>" + data[i].SlideCount + "</div></div>";
                modifyOutputHtml += "<div class='edit-sectn _row editsection-div-" + data[i].ParentorSubSectId + " editsection" + i + "' id='edit0'><div class='editSection'><div class='setLock' onclick='LockSection(" + data[i].ParentorSubSectId + ");setLock(" + data[i].ParentorSubSectId + ", " + data[i].ParentorSubSectId + "," + 0 + ")'></div></div></div>";
                modifyOutputHtml += "</div>";
                modifyOutputHtml += "<div class='subsectionmainContainer' id='subsec-" + data[i].ParentorSubSectId + "' >";
             
                var sectid = data[i].ParentorSubSectId;
                for (let j = 0; j < data.length; j++) {
                    if (Iv.secName == data[j].ParentSectName && data[j].ParentSectName != "") {

                        if (Ip == 0) {
                            modifyOutputHtml += "<div class='bdy-parnt-sectname left-algn modifytoggle" + data[i].ParentorSubSectId + " subsec-div" + data[j].ParentorSubSectId + " datashow' id='modify-subsection-div' sect-name='" + data[i].ParentorSubSectName + "' sub-name='" + data[j].ParentorSubSectName + "' sect-desc='" + data[j].ParentorSubSectDesc + "'>";
                            firstsection = data[i].ParentorSubSectId;
                        }
                        else
                            modifyOutputHtml += "<div class='bdy-parnt-sectname modifytoggle" + data[i].ParentorSubSectId + " subsec-div" + data[j].ParentorSubSectId + " datahide' id= 'modify-subsection-div' sect-name='" + data[i].ParentorSubSectName + "' sub-name='" + data[j].ParentorSubSectName + "' sect-desc='" + data[j].ParentorSubSectDesc + "'>";

                        modifyOutputHtml += "<div class='parentsub-sectnamediv _row_subSec ' id='sub-sectname'  sect-name='" + data[i].ParentorSubSectName + "' sect-desc='" + data[i].ParentorSubSectDesc + "'><div class='checkbox-seccontainer'><label class='subsection-area'><input type='checkbox' class='modify-chckbox checkbox" + i + "  parent-checkbox" + data[i].ParentorSubSectId + " home-check-box" + j + "'  name='Subsection' value='" + k + "'  section-id='" + sectid + "' sub-name='" + data[j].ParentorSubSectName + "' sect-name='" + data[i].ParentorSubSectName + "'  data-id='" + sectid + "' subsectid ='" + data[j].ParentorSubSectId + "'   onclick='toggleSubSectionModify(" + sectid + "," + data[j].ParentorSubSectId + ")'/><span class='inner-checkboxContainer' ></span></label></div>";
                        //modifyOutputHtml += "<div class='parentsubsecname ' id='subsec" + k + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + ">" + data[j].ParentorSubSectName + "  (Description: " + data[j].ParentorSubSectDesc + ")" + " </div></div>";
                        if (data[j].ParentorSubSectDesc != " ") {


                            modifyOutputHtml += "<div class='parentsubsecname Editsub-div-" + sectid + "' title='" + data[j].ParentorSubSectName + " (Description: " + data[j].ParentorSubSectDesc + ")" + "' id='subsec" + k + "'sect-name='" + data[i].ParentorSubSectName + "' sub-name='" + data[j].ParentorSubSectName + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + ">" + data[j].ParentorSubSectName + "  (Description: " + data[j].ParentorSubSectDesc + ")" + " </div></div>";
                            modifyOutputHtml += "<div class='uploadedon _row_subSec' id='subsection-upload'><div class='uploaded-text'>" + data[j].UploadedDate + "</div></div>";
                            modifyOutputHtml += "<div class='uploadedby _row_subSec' id='subsection-uploadby'><div class='uploadedby-text'>" + data[j].UploadedBy + "</div></div>";
                            modifyOutputHtml += "<div class='slide-count _row_subSec'  id='subsection-slidecount'><div class='slideCount-text'>" + data[j].SlideCount + "</div></div>";
                            modifyOutputHtml += "<div class='edit-sectn _row_subSec'  id='subsection-edit'><div class='Lock-text' onclick='lockSubSection(" + sectid + "," + data[j].ParentorSubSectId + ");setLock(" + sectid + "," + +data[j].ParentorSubSectId + "," + 1 + ")'></div></div>";
                            modifyOutputHtml += "</div>";

                            searchArrayforinsghtsModify.push({ label: data[j].ParentorSubSectName + ' (' + 'Description:' + ' ' + data[j].ParentorSubSectDesc + " )", id: "subsec" + k, sectionid: sectid, subid: data[j].ParentorSubSectId, classname: "modify-chckbox", element: i, togglecheckboxid: j });
                        } else
                        {
                            modifyOutputHtml += "<div class='parentsubsecname Editsub-div-" + sectid + "' title='" + data[j].ParentorSubSectName + "' id='subsec" + k + "'sect-name='" + data[i].ParentorSubSectName + "' sub-name='" + data[j].ParentorSubSectName + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + ">" + data[j].ParentorSubSectName + " </div></div>";
                            modifyOutputHtml += "<div class='uploadedon _row_subSec' id='subsection-upload'><div class='uploaded-text'>" + data[j].UploadedDate + "</div></div>";
                            modifyOutputHtml += "<div class='uploadedby _row_subSec' id='subsection-uploadby'><div class='uploadedby-text'>" + data[j].UploadedBy + "</div></div>";
                            modifyOutputHtml += "<div class='slide-count _row_subSec'  id='subsection-slidecount'><div class='slideCount-text'>" + data[j].SlideCount + "</div></div>";
                            modifyOutputHtml += "<div class='edit-sectn _row_subSec'  id='subsection-edit'><div class='Lock-text' onclick='lockSubSection(" + sectid + "," + data[j].ParentorSubSectId + ");setLock(" + sectid + "," + +data[j].ParentorSubSectId + "," + 1 + ")'></div></div>";
                            modifyOutputHtml += "</div>";

                            searchArrayforinsghtsModify.push({ label: data[j].ParentorSubSectName , id: "subsec" + k, sectionid: sectid, subid: data[j].ParentorSubSectId, classname: "modify-chckbox", element: i, togglecheckboxid: j });
                         }
                        k++;
                        if (j == data.length - 1)
                            $('.parentsub-sectnamediv').css('border-bottom', '1px dotted lightgrey');
                    }
                }
            }
        }

        modifyOutputHtml += "</div>";
        modifyOutputHtml += "</div>";
    });
    $(".mod-bdy").html(modifyOutputHtml);
    $(".parent-sectnexpandcoll").first().addClass('parent-sectnexpandcoll-after');
    $(".parent-sectnexpandcoll").first().removeClass('parent-sectnexpandcoll');
    //$("#parent-sectnexpandcoll" + firstsection).addClass('parent-sectnexpandcoll-after');
    //$("#parent-sectnexpandcoll" + firstsection).removeClass('parent-sectnexpandcoll');
    $('.parent-sectnamediv').eq(0).css('border-bottom', '#73abff 1px solid');
    $('.parent-sectnamediv').eq(0).css('background', ' rgba(115,171,255,.15)');
    $('#upload0').eq(0).css('border-bottom', '#73abff 1px solid');
    $('#upload0').eq(0).css('background', ' rgba(115,171,255,.15)');
    $('#uploadby0').eq(0).css('border-bottom', '#73abff 1px solid');
    $('#uploadby0').eq(0).css('background', ' rgba(115,171,255,.15)');
    $('#count0').eq(0).css('border-bottom', '#73abff 1px solid');
    $('#count0').eq(0).css('background', 'rgba(115,171,255,.15)');
    $('#edit0').eq(0).css('border-bottom', '#73abff 1px solid');
    $('#edit0').eq(0).css('background', ' rgba(115,171,255,.15)');
}

//To toggle the subsection 
var toggleSubSectn = function (key, sectionName) {

    if ($(".modifytoggle" + sectionName).hasClass("datahide")) {
        $('.section-' + sectionName).addClass('parent-sectnexpandcoll-after');
        $('.section-' + sectionName).removeClass('parent-sectnexpandcoll');
        $('.sectionname-div-' + sectionName).css('background-color', 'rgba(115,171,255,.15) !important');
        $('.sectionname-div-' + sectionName).css('border-bottom', '1px solid #73abff !important');
        $('.uploadon-div-' + sectionName).css('background-color', 'rgba(115,171,255,.15) !important');
        $('.uploadon-div-' + sectionName).css('border-bottom', '1px solid #73abff !important');
        $('.slidecount-div-' + sectionName).css('background-color', 'rgba(115,171,255,.15) !important');
        $('.slidecount-div-' + sectionName).css('border-bottom', '1px solid #73abff !important');
        $('.editsection-div-' + sectionName).css('background-color', 'rgba(115,171,255,.15) !important');
        $('.editsection-div-' + sectionName).css('border-bottom', '1px solid #73abff !important');
        $('.uploadby-div-' + sectionName).css('background-color', 'rgba(115,171,255,.15) !important');
        $('.uploadby-div-' + sectionName).css('border-bottom', '1px solid #73abff !important');

    }
    if ($(".modifytoggle" + sectionName).hasClass("datashow")) {
        $('.section-' + sectionName).removeClass('parent-sectnexpandcoll-after');
        $('.section-' + sectionName).addClass('parent-sectnexpandcoll');
        $('.sectionname-div-' + sectionName).css('background', '');
        $('.sectionname-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.uploadon-div-' + sectionName).css('background', '');
        $('.uploadon-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.slidecount-div-' + sectionName).css('background', '');
        $('.slidecount-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.editsection-div-' + sectionName).css('background', '');
        $('.editsection-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.uploadby-div-' + sectionName).css('background', '');
        $('.uploadby-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
    }
    $(".modifytoggle" + sectionName).toggleClass('datahide datashow');

    //$("." + sectionName).toggleClass('parent-sectnexpandcoll parent-sectnexpandcoll-after');
    //$(".subsectionmainContainer").hide();
    //$("#subsec-" + sectionName).show();

    //$("." + sectionName).toggleClass('datahide datashow');
    //$(each(sec, function (i, v) {
    //    $("." + v).toggleClass('datashow datahide');
    //    if ($("." + v).hasClass("datashow")) {
    //        $('#parent-sectnexpandcoll' + sectionName).text("+");
    //    }
    //    if ($("." + v).hasClass("datahide"))

    //        $('#parent-sectnexpandcoll' + sectionName).text("-");
    //})
    //);
    //sec.push(sectionName);

}
//set lock for section and subsection
var setLock = function (sectid, parentorsubid, parentorsub) {
    let lock = 0;
    var LockList = [{ 'IsSectionorSubsection': parentorsub, 'ParentorSubSectId': parentorsubid, 'IsLock': lock }];
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/LockSection",
        data: JSON.stringify(LockList),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response == "TRUE") {
                $('.sectionname-div-' + sectid).css('background', ' #EBE3E3');
                $('.sectionname-div-' + sectid).css('border-bottom', '1px Solid #DB4550');
                $('.uploadon-div-' + sectid).css('background', ' #EBE3E3');
                $('.uploadon-div-' + sectid).css('border-bottom', '1px Solid #DB4550');
                $('.uploadby-div-' + sectid).css('background', ' #EBE3E3');
                $('.uploadby-div-' + sectid).css('border-bottom', '1px Solid #DB4550');
                $('.slidecount-div-' + sectid).css('background', ' #EBE3E3');
                $('.slidecount-div-' + sectid).css('border-bottom', '1px Solid #DB4550');
                $('.editsection-div-' + sectid).css('background', ' #EBE3E3');
                $('.editsection-div-' + sectid).css('border-bottom', '1px Solid #DB4550');

            } else {

            }
        }, error: ajaxError
    });

}
//To toggle the innersubsection checkbox
var togglesubsection = function (element) {
    if ($('.checkbox' + element).prop('checked') == false) {
        $('.parentcheckbox' + element).prop('checked', false);
    }
    else {
        $('.parentcheckbox' + element).prop('checked', true);
    }
}
//To Lock the section for edit
var LockSection = function (secId) {

    var id = secId;
    let secname = $('.sectionname-div-' + id).attr('sect-name').trim();
    $(".editSectionName").attr('data-id', secId);
    $(".editSectionName").attr('sect-name', secname);
    $('.transparentBG').show();
    $(".EditSectionContainer").css('z-index', '5000');
    $(".EditSectionContainer").css('background-color', 'white');
    $(".EditSectionContainer").css('display', 'block');
}
//To Lock the Sub-section for edit
var lockSubSection = function (secId, subsecId) {
    let pid
    pid = secId;
    subId = subsecId;
    let sname = $('.Editsub-div-' + pid).attr('sect-name').trim();
    let subname = $('.Editsub-div-' + pid).attr('sub-name').trim();
    $('#editsubsecName').attr('pid', pid);
    $('#editsubsecName').attr('sid', subsecId);
    $('#editsubsecName').attr('sect-name', sname);
    $('#editsubsecName').attr('sub-name', subname);
    $('.transparentBG').show();
    $(".EditSubSectionContainer").css('z-index', '5000');
    $(".EditSubSectionContainer").css('background-color', 'white');
    $(".EditSubSectionContainer").css('display', 'block');
}
//To submit the section and update section to backend
var submitSection = function () {
    $('.transparentBG').hide();
    $('.EditSectionContainer').hide();
    let secName1 = $("#editName").val().trim();
    let secName = $("#editName").val().toLowerCase();
    if ($.inArray(secName, parentSectionName) != -1) {
        $("#alert").css('display', 'block');
        $("#alert").css('z-index', '7000');
        $("#message").html("sectionName should be unique");
        $(".transparentBG").show();
        return false;
    }
    let sid = $('#editName').attr('data-id');

    let secDesc = $("#desp").val();
    let d = $('.sectionname-div-' + sid).attr('sect-desc');
    let s = $('.sectionname-div-' + sid).attr('sect-name');

    if (secDesc == '') {
        secDesc = d;
    }
    if (secName == '') {
        secName1 = s;
    }
    if (secName == s && secDesc == d) {
        $("#alert").css('display', 'block');
        $("#alert").css('z-index', '7000');
        $("#message").html("section Name or Description should required");
        $(".transparentBG").show();
        return false;
    }
    //if((secDesc == "")||(sid == "")) {
    //    $("#alert").css('display', 'block');
    //    $("#message").html("section Name or Description ");
    //}
    var EditDetails = [];
    EditDetails.push({ SectionId: sid, SectionName: secName1, SubsectionId: null, SectionDesc: secDesc, ParentSectName: s });
    $(".loader,.transparentBG").show();
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/EditSection",
        data: JSON.stringify(EditDetails),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            $(".loader,.transparentBG").hide();
            if (response == "TRUE") {
                modifyOutPut();
                $(".EditSectionContainer").css('display', 'none');
                $(".EditSubSectionContainer").css('display', 'none');
                $("#alert").css('display', 'block');
                $("#editName").val('');
                $("#desp").val('');
                $('.sectionname-div-' + EditDetails[0].SectionId).attr('sect-name', EditDetails[0].SectionName);
                $('.sectionname-div-' + EditDetails[0].SectionId).attr('sect-desc', EditDetails[0].SectionDesc);
                unLock(EditDetails[0].SectionId, EditDetails[0].SectionId, 0);

                $("#message").html("section(s) are updated successfully");
                $(".transparentBG").show();
            } else {
                $("#alert").css('display', 'block');
                $("#message").html("section(s) are not updated");
                $(".transparentBG").show();
            }
        }, error: ajaxError
    });
}
//To submit the sub-section and update sub-section to backend
var submitSubsection = function () {
    $('.transparentBG').hide();
    $('.EditSubSectionContainer').hide();
    var SubsectionDetails = [];
    let secName = $("#editsubsecName").val().toLowerCase();
    let secN = $("#editsubsecName").val();
    let secDesc = $("#subsecdesp").val();
    let pid = $('#editsubsecName').attr('pid');
    let sid = $('#editsubsecName').attr('sid');
    let pname = $('.subsec-div' + sid).attr('sect-name');
    let d = $('.subsec-div' + sid).attr('sect-desc');
    let s = $('.subsec-div' + sid).attr('sub-name');
    if ($.inArray(secName, subSectionName) != -1) {
        $("#alert").css('display', 'block');
        $("#alert").css('z-index', '7000');
        $("#message").html("Sub-SectionName should be unique");
        $(".transparentBG").show();
        return false;
    }
    if (secDesc == '') {
        secDesc = d;
    }
    if (secName == '') {
        secN = s;
    }
    if (secName == s && secDesc == d) {
        $("#alert").css('display', 'block');
        $("#alert").css('z-index', '7000');
        $("#message").html("section Name or Description should required");
        $(".transparentBG").show();
        return false;
    }
    SubsectionDetails.push({ SectionId: pid, SubSectionName: secN, SubsectionId: sid, SubSectionNamedesc: secDesc, ParentSectName: pname, ParentorSubSectName: s });
    $(".loader,.transparentBG").show();
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/EditSubSection",
        data: JSON.stringify(SubsectionDetails),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            $(".loader,.transparentBG").hide();
            if (response == "TRUE") {
                modifyOutPut();
                $(".EditSectionContainer").css('display', 'none');
                $(".EditSubSectionContainer").css('display', 'none');
                $("#alert").css('display', 'block');
                $("#editsubsecName").val('');
                $("#subsecdesp").val('');
                $("#message").html("Sub-section is updated successfully");
            } else {
                $("#alert").css('display', 'block');
                $("#message").html("Sub-section is not updated .");
            }
            $(".transparentBG").show();
        }, error: ajaxError
    });
}
var unLock = function (sectid, parentorsubid, parentorsub) {
    let lock = 1;
    var LockList = [{ 'IsSectionorSubsection': parentorsub, 'ParentorSubSectId': parentorsubid, 'IsLock': lock }];
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/LockSection",
        data: JSON.stringify(LockList),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response == "TRUE") {
                $('.sectionname-div-' + sectid).css('background', 'rgba(115, 171, 255, 0.15) ');
                $('.sectionname-div-' + sectid).css('border-bottom', '1px solid rgb(115, 171, 255) ');
                $('.uploadon-div-' + sectid).css('background', 'rgba(115, 171, 255, 0.15) ');
                $('.uploadon-div-' + sectid).css('border-bottom', '1px solid rgb(115, 171, 255) ');
                $('.uploadby-div-' + sectid).css('background', 'rgba(115, 171, 255, 0.15) ');
                $('.uploadby-div-' + sectid).css('border-bottom', ' 1px solid rgb(115, 171, 255)');
                $('.slidecount-div-' + sectid).css('background', 'rgba(115, 171, 255, 0.15) ');
                $('.slidecount-div-' + sectid).css('border-bottom', ' 1px solid rgb(115, 171, 255)');
                $('.editsection-div-' + sectid).css('background', 'rgba(115, 171, 255, 0.15) ');
                $('.editsection-div-' + sectid).css('border-bottom', '1px solid rgb(115, 171, 255) ');

            } else {

            }
        }, error: ajaxError
    });
}
var editCancel = function (element) {

    let Issection;
    if (element == 0) {

        let secid = $(".editSectionName").attr('data-id');

        unLock(secid, secid, 0);
    }
    else {
        Issection = false;
        let pid = $('#editsubsecName').attr('pid');
        let sid = $('#editsubsecName').attr('suid');
        unLock(pid, sid, 1);
    }

    $('#editName').val('');
    $('#desp').val('');
    $('.transparentBG').hide();
    $(".EditSectionContainer").css('display', 'none');
    $(".EditSubSectionContainer").css('display', 'none');
}
//To change the orderof the sectionn or subsection.
var reorderItem = function () {
    $(".bdy-parnt-sectnamediv").css('cursor', 'move');

    $(".mod-bdy").sortable({
        connectWith: ".mod-bdy",


        disabled: false,
        cursor: 'pointer',
        start: function (event, ui) {
            $(ui.item).addClass("selectedbgcolor");//css({ 'background-color': '#F4F4F4' });
        },
        stop: function (event, ui) {
            $(ui.item).removeClass("selectedbgcolor");//css({ 'background-color': '#E4E5E5' });
        },
    }).disableSelection();

    $(".subsectionmainContainer").sortable({
        connectWith: ".subsectionmainContainer",
        disabled: false,
        cursor: 'pointer',
        start: function (event, ui) {
            $(ui.item).addClass("selectedbgcolor")//css({ 'background-color': '#F4F4F4' });
        },
        stop: function (event, ui) {
            $(ui.item).removeClass("selectedbgcolor");//css({ 'background-color': '#E4E5E5' });
        },
    }).disableSelection();
    $(".reorder-btnafter").css('display', 'flex');
    $(".reorder-btnafter").css('align-items', 'center');
    $(".reorder-btn").css('display', 'none');
}
//To save the current order of section or subsection
var saveCurrentOrder = function () {
    $(".bdy-parnt-sectnamediv").css('cursor', 'pointer');
    $(".subsectionmainContainer").sortable({
        disabled: true
    }).enableSelection();
    $(".mod-bdy").sortable({
        disabled: true
    }).enableSelection();
    let reorderDetail = [];
    $(".bdy-parnt-sectnamediv").css('cursor', 'auto');
    let len = $(".parentsub-sectnamediv").length;
    let len2 = $(".parent-sectnamediv").length;
    for (let i = 0; i < len2; i++) {
        let sid = $(".parent-sectnamediv").eq(i).attr("data-id");
        reorderDetail.push({ SectionId: sid, SubsectionId: 0 });
    }
    for (let j = 0; j < len; j++) {
        let subid = $(".parentsubsecname").eq(j).attr('subid');
        let secid = $(".parentsubsecname").eq(j).attr('sectionid');
        reorderDetail.push({ SectionId: secid, SubsectionId: subid });
    }

    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/SubmitSectionOrder",
        data: JSON.stringify(reorderDetail),
        method: "POST",
        contentType: "application/json",
        success: function (response) {
            if (response == "TRUE") {
                modifyOutPut();
                $(".reorder-btn").css('display', 'block');
                $(".reorder-btnafter").css('display', 'none');
                $("#alert").css('display', 'block');
                $("#message").html("Reorder successfully");

            } else {
                $("#alert").css('display', 'block');
                $("#message").html("Error");
            }
            $(".transparentBG").show();
        }, error: ajaxError
    });
}
var toggleSubCheckbox = function (el) {
    $('.modify-parent-checkbox' + el).prop('checked', true);
}
//To check or uncheck the checkbox
var toggleCheckbox = function (element) {

    if ($('.parentcheckbox' + element).is(':checked')) {
        $(".checkbox" + element).prop("checked", true);
    } else {
        $(".checkbox" + element).prop("checked", false);
        $('.selct-deselct-check').prop("checked", false);
    }

    //Added by Sabat Ullah 13-01-2020
    modifySelectUnselect();
}
//To select or unselect all checkbox 
var selectAllCheckbox = function () {
    if ($('.selct-deselct-check').is(':checked')) {
        $(".modify-chckbox-parent").prop("checked", true);
        $(".modify-chckbox").prop("checked", true);
    } else {
        $(".modify-chckbox-parent").prop("checked", false);
        $(".modify-chckbox").prop("checked", false);

    }

}
//To Delete Selected section or subsection
var deleteSelected = function () {
    let parentChecked = [];
    let subsectionChecked = [];
    let subsection = [];
    let sectionId = [];
    $.each($("input[name='Subsection']:checked"), function () {
        let isSubSectionSectedAll = false;
        let selectedSubidsTotal = $("input[name='Subsection'][section-id=" + $(this).attr('section-id') + "]:checked").length;
        let subidsTotal = $("input[name='Subsection'][section-id=" + $(this).attr('section-id') + "]").length;
        if (selectedSubidsTotal == subidsTotal)
            isSubSectionSectedAll = true;
        let fname = $(this).attr('sub-name');
        subsection.push({ SectionName: $(this).attr('sect-name'), Section: $(this).attr('section-id'), filename: fname, SubSectionId: $(this).attr('subsectid'), IsSubSectionSectedAll: isSubSectionSectedAll });
    });
    $.each(subsection, function (index, value) {
        let selectedSubidsTotal = $("input[name='Subsection'][section-id=" + value.Section + "]:checked").length;
        let subidsTotal = $("input[name='Subsection'][section-id=" + value.Section + "]").length;
        let sectionId = value.Section;
        let subSectionId = value.SubSectionId;
        let filename = value.filename;
        let sname = value.SectionName;
        //if (selectedSubidsTotal == subidsTotal)
        //    subSectionId = subSectionId;
        //let checkifPresentalready = subsectionChecked.findIndex(function (x) { return x.SectionId == value.Section });
        let checkifPresentalready = _.findIndex(subsectionChecked, function (o) { return o.SectionId == value.Section })
        if (checkifPresentalready != 0 && value.IsSubSectionSectedAll == true) {
            subSectionId = 0;
            subsectionChecked.push({ SectionId: sectionId, SubsectionId: subSectionId, Filename: filename, SectionName: sname });
        }
        else if (value.IsSubSectionSectedAll == true)
        { }
        else
            subsectionChecked.push({ SectionId: sectionId, SubsectionId: subSectionId, Filename: filename, SectionName: sname });

    });

    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/DeleteSectionOrSubsection",
        data: JSON.stringify(subsectionChecked),
        method: "POST",
        contentType: "application/json",
        success: function (response) {

            if (response == "TRUE") {
                modifyOutPut();
                $("#alert").css('display', 'block');
                $("#message").html("Section(s) or subs-section(s) are deleted successfully");
                $('.selct-deselct-check').prop('checked', false);
                //Added by Sabat Ullah 13-01-2020
                modifySelectUnselect();

            } else {
                $("#alert").css('display', 'block');
                $("#message").html("Error in deleting section(s) or subsection");
            }
            $(".transparentBG").show();
        }, error: ajaxError
    });

}

//To bind the data with table format in Home Page
var getHomePageData = function () {
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GetModifySectnsData",
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            bindHomedata(response);

            pushintoSearchArrayHome();
        }
        ,
        error: ajaxError
    });

}

//To bind the data with table format
var bindHomedata = function (data) {

    let parentSectoinList = [];
    $.each(data, function (i, v) {
        if (parentSectoinList.indexOf(v.ParentSectName) == -1 && v.ParentSectName == "") {
            parentSectoinList.push({ 'secName': v.ParentorSubSectName, 'id': v.ParentorSubSectId });
        }
    });
    var homeOutputHtml = "";
    let k = 0;
    var firstsection1; searchArrayforinsghtsHome = [];
    $.each(parentSectoinList, function (Ip, Iv) {
        homeOutputHtml += "<div class='bdy-parnt-sectnamedivhome'>";
        for (let i = 0; i < data.length; i++) {
            if (data[i].ParentorSubSectName == Iv.secName && data[i].ParentSectName == "") {
                homeOutputHtml += "<div class='bdy-parnt-home-sectname-home'>";
                homeOutputHtml += "<div class='parent-home-sectnamediv home-sectionname-div-" + data[i].ParentorSubSectId + " home-sec" + i + "' id='home-sectname0' ><label class='home-parent-checkbox'><input type='checkbox' class='modify-chckbox-home-parent home-parentcheckbox" + i + " home-section-checkbox" + data[i].ParentorSubSectId + "' name='HomeParentSectionName' value='" + i + "' onchange='homeToggleCheckbox(" + i + ");' /><span class='parent-checkbx'></span></label>";

                if (data[i].ParentorSubSectDesc != " ") {
                    homeOutputHtml += "<div class='expand-div'><div class='parent-home-sectnexpandcoll subsec-" + data[i].ParentorSubSectId + " datahidetext' id='parent-home-sectnexpandcoll" + data[i].ParentorSubSectName + "' onclick='hometoggleSubSectn(this,\"" + data[i].ParentorSubSectId + "\")'></div></div><div class='home-namecontainer" + data[i].ParentorSubSectId + " home-parentsectnname" + i + "' data-id=" + data[i].ParentorSubSectId + " sectionname" + data[i].ParentorSubSectId + "='" + data[i].ParentorSubSectName + "' ><div class='homesection-nameText' sectname='" + data[i].ParentorSubSectName + " ' title='" + data[i].ParentorSubSectName + '(' + 'Description:' + ' ' + data[i].ParentorSubSectDesc + ' ' + ")" + "'>" + data[i].ParentorSubSectName + '(' + 'Description:' + ' ' + data[i].ParentorSubSectDesc + ' ' + ")" + "</div></div></div></div>";
                    searchArrayforinsghtsHome.push({ label: data[i].ParentorSubSectName + '(' + 'Description:' + ' ' + data[i].ParentorSubSectDesc + ' ' + ")", id: "subsec" + i, sectionid: data[i].ParentorSubSectId, subid: data[i].ParentorSubSectId, classname: "modify-chckbox-home-parent", element: i });
                }
                else
                {
                    homeOutputHtml += "<div class='expand-div'><div class='parent-home-sectnexpandcoll subsec-" + data[i].ParentorSubSectId + " datahidetext' id='parent-home-sectnexpandcoll" + data[i].ParentorSubSectName + "' onclick='hometoggleSubSectn(this,\"" + data[i].ParentorSubSectId + "\")'></div></div><div class='home-namecontainer" + data[i].ParentorSubSectId + " home-parentsectnname" + i + "' data-id=" + data[i].ParentorSubSectId + " sectionname" + data[i].ParentorSubSectId + "='" + data[i].ParentorSubSectName + "' ><div class='homesection-nameText' sectname='" + data[i].ParentorSubSectName + " ' title='" + data[i].ParentorSubSectName + "'>" + data[i].ParentorSubSectName + "</div></div></div></div>";
                    searchArrayforinsghtsHome.push({ label: data[i].ParentorSubSectName , id: "subsec" + i, sectionid: data[i].ParentorSubSectId, subid: data[i].ParentorSubSectId, classname: "modify-chckbox-home-parent", element: i });
                }
                homeOutputHtml += "<div class='home-uploadedon home-uploadon-div-" + data[i].ParentorSubSectId + " homeupload" + i + "' id='home-upload0'><div class='home-updateDate'>" + data[i].UploadedDate + "</div></div>";
                homeOutputHtml += "<div class='home-slide-count home-slidecount-div-" + data[i].ParentorSubSectId + " homecount" + i + "' id='home-count0'><div class='home-slideCount'>" + data[i].SlideCount + "</div></div>";
                homeOutputHtml += "</div>";
                homeOutputHtml += "<div class='home-subsectionmainContainer' id='home-subsec-" + data[i].ParentorSubSectName + "'>";
               
                var sectid = data[i].ParentorSubSectId;
                for (let j = 0; j < data.length; j++) {
                    if (Iv.secName == data[j].ParentSectName && data[j].ParentSectName != "") {
                        if (Ip == 0) {
                            homeOutputHtml += "<div class='bdy-home-parnt-sectname-home left-algn " + "toggleclass" + data[i].ParentorSubSectId + " datashow'>";
                            firstsection1 = data[i].ParentorSubSectId;
                        }
                        else
                            homeOutputHtml += "<div class='bdy-home-parnt-sectname " + "toggleclass" + data[i].ParentorSubSectId + " datahide'>";//" + data[j].ParentorSubSectName + "
                        
                        homeOutputHtml += "<div class='home-parentsub-sectnamediv' id='home-sub-sectname'><label class='home-subsection-checkbox'><input type='checkbox'  class='home-modify-chckbox checkbox" + i + " check-box" + k + "   home-parent-checkbox" + j + "' id='subsection-checkbox" + j + "' data-id='" + sectid + "' subsectid='" + data[j].ParentorSubSectId + "'  name='home-Subsection' value='" + k + "' onclick='subsectionToggle(" + data[i].ParentorSubSectId + ")'/><span class='subsection-checkbox'></label>";
                        // homeOutputHtml += "<div class='home-parentsubsecname' id='home-subsec" + k + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + " section-name=" + data[j].ParentorSubSectName + " section-desc=" + data[j].ParentorSubSectDesc + ">" + data[j].ParentorSubSectName + "(" + data[j].ParentorSubSectDesc + ")" + " </div></div>";
                        if (data[j].ParentorSubSectDesc!=" ") {
                            homeOutputHtml += "<div class='home-parentsubsecname' id='home-subsec" + k + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + " section-name=" + data[j].ParentorSubSectName + " section-desc=" + data[j].ParentorSubSectDesc + " title='" + data[j].ParentorSubSectName + " (Description: " + data[j].ParentorSubSectDesc + ")" + "' >" + data[j].ParentorSubSectName + "  (Description: " + data[j].ParentorSubSectDesc + ")" + " </div></div>";
                            homeOutputHtml += "<div class='home-uploadedon' id='home-subsection-upload'><div class='home-uploaded-text'>" + data[j].UploadedDate + "</div></div>";


                            searchArrayforinsghtsHome.push({ label: data[j].ParentorSubSectName + "  (Description: " + data[j].ParentorSubSectDesc + ")", id: "subsec" + k, sectionid: sectid, subid: data[j].ParentorSubSectId, classname: "modify-chckbox", element: i, togglecheckboxid: j });
                            homeOutputHtml += "<div class='home-slide-count'  id='home-subsection-slidecount'><div class='home-slideCount-text' id='slide-count" + k + "'>" + data[j].SlideCount + "</div></div>";
                        } else {
                           
                            homeOutputHtml += "<div class='home-parentsubsecname' id='home-subsec" + k + "' sectionid=" + sectid + " subid=" + data[j].ParentorSubSectId + " section-name=" + data[j].ParentorSubSectName + " section-desc='" + data[j].ParentorSubSectDesc + "' title='" + data[j].ParentorSubSectName + "' >" + data[j].ParentorSubSectName + "  </div></div>";
                            homeOutputHtml += "<div class='home-uploadedon' id='home-subsection-upload'><div class='home-uploaded-text'>" + data[j].UploadedDate + "</div></div>";


                            searchArrayforinsghtsHome.push({ label: data[j].ParentorSubSectName , id: "subsec" + k, sectionid: sectid, subid: data[j].ParentorSubSectId, classname: "modify-chckbox", element: i, togglecheckboxid: j });
                            homeOutputHtml += "<div class='home-slide-count'  id='home-subsection-slidecount'><div class='home-slideCount-text' id='slide-count" + k + "'>" + data[j].SlideCount + "</div></div>";

                           }


                        homeOutputHtml += "</div>";
                        k++;
                    }
                }
            }
        }

        homeOutputHtml += "</div>";
        homeOutputHtml += "</div>";
    });
    $(".table-bdy").html(homeOutputHtml);
    $(".parent-home-sectnexpandcoll").first().addClass('parent-home-sectnexpandcoll2');
    $(".parent-home-sectnexpandcoll").first().removeClass('parent-home-sectnexpandcoll');
    //$("#parent-home-sectnexpandcoll" + firstsection1).addClass('parent-home-sectnexpandcoll2');
    //$("#parent-home-sectnexpandcoll" + firstsection1).removeClass('parent-home-sectnexpandcoll');
    $('#home-sectname0').css('background', 'rgba(115,171,255,.15)');
    $('#home-sectname0').css('border-bottom', ' #73abff 1px solid');
    $('#home-upload0').css('background', 'rgba(115,171,255,.15)');
    $('#home-upload0').css('border-bottom', ' #73abff 1px solid');
    $('#home-count0').css('background', 'rgba(115,171,255,.15)');
    $('#home-count0').css('border-bottom', ' #73abff 1px solid');
}
var homeToggleCheckbox = function (element) {

    if ($('.home-parentcheckbox' + element).is(':checked')) {
        $('.home-parentcheckbox' + element).parent().parent().addClass("selectedSec");
        $(".checkbox" + element).prop("checked", true);
    } else {
        $('.home-parentcheckbox' + element).parent().parent().removeClass("selectedSec");
        $(".checkbox" + element).prop("checked", false);
        $('.home-selct-deselct-check').prop("checked", false);

    }
    sectionsSummary = [];

    $.each($("input[name='home-Subsection']:checked"), function () {

        let id = $(this).val();
        let secid = parseInt($('#home-subsec' + id).attr('sectionid'));
        //let sec = $('.home-namecontainer' + secid + ' #sectname-p').text();
        let sec = $('.home-namecontainer' + secid + ' .homesection-nameText').attr('sectname');
        let slidecount = $("#slide-count" + id).text();
        let subsecName = $('#home-subsec' + id).text().split('(Description: ')[0].trim();
        // $('#home-subsec' + id).attr('section-name');
        let desc = $('#home-subsec' + id).attr('section-desc');
        let filename = subsecName.trim();
        let subid = $('#home-subsec' + id).attr('subid');

        sectionsSummary.push({ SectionName: sec, SubSectionName: subsecName, SlideCount: slidecount, Filename: filename, SubSectionNamedesc: desc, parentId: secid, subid: subid });
    })

    bindOutputSummary(sectionsSummary);

    //Added by Sabat Ullah 13-01-2020
    modifySelectUnselect();
}

var bindOutputSummary = function (sections) {

    var outputcontainer;
    $('.sectionName').remove();
    outputcontainer = '<div class="sectionlist">';
    for (let k = 0; k < sections.length; k++) {
        let y = k + 1;
        let title = sections[k].SectionName + " - " + sections[k].SubSectionName;
        //outputcontainer += '<div section-name="' + sections[k].SectionName + '" file-name="' + sections[k].Filename + '" desc="' + sections[k].SubSectionNamedesc + '"   finalslide-count="' + sections[k].SlideCount + '" data-name="' + sections[k].SubSectionName + '" class="sectionName section-name' + k + '" > ' + y + '.' + sections[k].Filename + '<div class="clearCrossbtn" id="clearcrossbtn' + k + '" onclick="clearPPTSection(' + k + ')"></div></div>';
        outputcontainer += "<div title='" + title + "'  section-name='" + sections[k].SectionName + "' file-name='" + sections[k].Filename + "' desc='" + sections[k].SubSectionNamedesc + "' parentid='" + sections[k].parentId + "' subid='" + sections[k].subid + "'   finalslide-count='" + sections[k].SlideCount + "' data-name='" + sections[k].SubSectionName + "' class='sectionName section-name" + k + "' > " + y + ". " + sections[k].SectionName + " - " + sections[k].SubSectionName + "<div class='clearCrossbtn' id='clearcrossbtn" + k + "' onclick='clearPPTSection(" + k + "," + sections[k].parentId + "," + sections[k].subid + ")'  ></div></div>";
    }
    outputcontainer += '</div>';
    $('.order-summary-bdy').append(outputcontainer);
    $(".sectionName").css('cursor', 'move');

    $(".sectionlist").sortable({
        connectWith: ".sectionlist",
        update: function (event, ui) {
            let sectionName = $(".sectionName");
            for (i = 0; i < sectionName.length; i++) {
                let id = sectionName[i].children[0].id;
                id = id.substring(13);
                let text = sectionName[i].innerText;
                text = text.substring(text.indexOf(".") + 1);
                text = (i + 1) + "." + text;
                let parentid = $(sectionName[i]).attr('parentid');
                let subid = $(sectionName[i]).attr('subid');
                $(".sectionName")[i].innerHTML = text + '<div class="clearCrossbtn" id="clearcrossbtn' + id + '" onclick="clearPPTSection(' + id + ',' + parentid + ',' + subid + ')"></div>';
            }
        }
    }).disableSelection();




}
var subsectionToggle = function (sectionid) {
    sectionsSummary = [];
    let checkboxSecltedCount = 0;
    $.each($("input[name='home-Subsection']:checked"), function () {
        let id = $(this).val();
        let secid = parseInt($('#home-subsec' + id).attr('sectionid'));
        //let sec = $('.home-namecontainer' + secid + ' #sectname-p').text();
        let sec = $('.home-namecontainer' + secid + ' .homesection-nameText').html().split('(Description: ')[0].trim();
        //$('.home-namecontainer' + secid + ' .homesection-nameText').attr('sectname');
        let slidecount = $("#slide-count" + id).text();
        let subsecName = $('#home-subsec' + id).html().split('(Description: ')[0].trim()
        //$('#home-subsec' + id).attr('section-name');
        let desc = $('#home-subsec' + id).attr('section-desc');
        let filename = subsecName.trim();
        let subid = $('#home-subsec' + id).attr('subid');
        sectionsSummary.push({ SectionName: sec, SubSectionName: subsecName, SlideCount: slidecount, Filename: filename, SubSectionNamedesc: desc, parentId: secid, subid: subid });
    });
    bindOutputSummary(sectionsSummary);
    //if ($('.checkbox' + element).prop('checked') == false) {
    //    $('.home-parentcheckbox' + element).prop('checked', false);

    //}
    //else {
    //    $('.home-parentcheckbox' + element).prop('checked', true);
    //}
    let todeselectParentCheckbx = $('.parent-home-sectnamediv.home-sectionname-div-' + sectionid).parent('.bdy-parnt-home-sectname-home').parent('.bdy-parnt-sectnamedivhome').parent('.table-bdy').find('.home-subsectionmainContainer .toggleclass' + sectionid);
    $.each(todeselectParentCheckbx, function (i, v) {
        let ischeckboxChecked = $(v).find('.home-modify-chckbox').prop("checked");
        if (ischeckboxChecked == true) {
            $(v).find('.home-modify-chckbox').parent().parent().addClass("selectedSubSec");
            checkboxSecltedCount++;
        }
        else {
            $(v).find('.home-modify-chckbox').parent().parent().removeClass("selectedSubSec");
        }

    });
    if (checkboxSecltedCount == 0) {
        $('.home-section-checkbox' + sectionid).parent().parent().removeClass("selectedSec");
        $('.home-section-checkbox' + sectionid).prop("checked", false);
    }
    else {
        $('.home-section-checkbox' + sectionid).parent().parent().addClass("selectedSec");
        $('.home-section-checkbox' + sectionid).prop("checked", true);
    }

    //Added by Sabat Ullah 13-01-2020
    modifySelectUnselect();
}
var clearPPTSection = function (id, parentId, sectId) {
    let secs = $('.section-name' + id).attr('data-name');
    let subSectId = $('.check-box' + id).attr('subsectid');
    $('.commoncheckbox').hide();
    //$('.check-box' + id).prop('checked', false);
    //$('.section-name' + id).remove();
    $('.sectionName[subid = ' + sectId + ']').remove();
    //$('#clearcrossbtn' + id).remove();
    $('.home-modify-chckbox[subsectid=' + sectId + ']').prop('checked', false);
    let sectionName = $(".sectionName");
    for (i = 0; i < sectionName.length; i++) {
        let id = sectionName[i].children[0].id;
        id = id.substring(13);
        let text = sectionName[i].innerText;
        text = text.substring(text.indexOf(".") + 1);
        text = (i + 1) + "." + text;
        let parentid = $(sectionName[i]).attr('parentid');
        let subid = $(sectionName[i]).attr('subid');
        $(".sectionName")[i].innerHTML = text + '<div class="clearCrossbtn" id="clearcrossbtn' + id + '" onclick="clearPPTSection(' + id + ',' + parentid + ',' + subid + ')"></div>';
    }
    //let parentId = $('.check-box' + id).attr('data-id');
    let checkboxSecltedCount = 0;
    let todeselectParentCheckbx = $('.parent-home-sectnamediv.home-sectionname-div-' + parentId).parent('.bdy-parnt-home-sectname-home').parent('.bdy-parnt-sectnamedivhome').parent('.table-bdy').find('.home-subsectionmainContainer .toggleclass' + parentId);
    $.each(todeselectParentCheckbx, function (i, v) {

        let ischeckboxChecked = $(v).find('.home-modify-chckbox').prop("checked");
        if (ischeckboxChecked == true)
            checkboxSecltedCount++;

    });
    if (checkboxSecltedCount == 0)
        $('.home-section-checkbox' + parentId).prop("checked", false);

    //Added by Sabat Ullah 13-01-2020
    modifySelectUnselect();

    _.remove(sectionsSummary, function (obj) {
        return parseInt(obj.parentId) == parseInt(parentId) && parseInt(obj.subid) == parseInt(sectId);
    });
}
var hometoggleSubSectn = function (key, sectionName) {
    if ($(".toggleclass" + sectionName).hasClass("datahide")) {
        $('.subsec-' + sectionName).addClass('parent-home-sectnexpandcoll2');
        $('.subsec-' + sectionName).removeClass('parent-home-sectnexpandcoll');
        $('.home-sectionname-div-' + sectionName).css('background', ' rgba(115,171,255,.15)');
        $('.home-sectionname-div-' + sectionName).css('border-bottom', '#73abff 1px solid');
        $('.home-uploadon-div-' + sectionName).css('background', ' rgba(115,171,255,.15) ');
        $('.home-uploadon-div-' + sectionName).css('border-bottom', ' #73abff 1px solid');
        $('.home-slidecount-div-' + sectionName).css('background', 'rgba(115,171,255,.15)');
        $('.home-slidecount-div-' + sectionName).css('border-bottom', '#73abff 1px solid');

    }
    if ($(".toggleclass" + sectionName).hasClass("datashow")) {
        $('.subsec-' + sectionName).removeClass('parent-home-sectnexpandcoll2');
        $('.subsec-' + sectionName).addClass('parent-home-sectnexpandcoll');
        $('.home-sectionname-div-' + sectionName).css('background', '');
        $('.home-sectionname-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.home-uploadon-div-' + sectionName).css('background', '');
        $('.home-uploadon-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');
        $('.home-slidecount-div-' + sectionName).css('background', '');
        $('.home-slidecount-div-' + sectionName).css('border-bottom', ' 1px dashed rgba(168, 168, 168, 0.5)');

    }
    $(".toggleclass" + sectionName).toggleClass('datahide datashow');
}
var selectAllHomeCheckbox = function () {
    if ($('.home-selct-deselct-check').is(':checked')) {
        $(".modify-chckbox-home-parent").prop("checked", true);
        $(".home-modify-chckbox").prop("checked", true);
    } else {
        $(".modify-chckbox-home-parent").prop("checked", false);
        $(".home-modify-chckbox").prop("checked", false);

    }
    sectionsSummary = [];
    $.each($("input[name='home-Subsection']:checked"), function () {
        let id = $(this).val().trim();
        let secid = parseInt($('#home-subsec' + id).attr('sectionid'));
        let sec = $('.home-namecontainer' + secid + ' .homesection-nameText').attr('sectname');
        let slidecount = $("#slide-count" + id).text();
        let subsecName = $('#home-subsec' + id).text().split('(Description: ')[0].trim();
        //$('#home-subsec' + id).attr('section-name');
        let desc = $('#home-subsec' + id).attr('section-desc');
        let filename = subsecName.trim();
        let subid = $('#home-subsec' + id).attr('subid');
        sectionsSummary.push({ SectionName: sec, SubSectionName: subsecName, SlideCount: slidecount, Filename: filename, SubSectionNamedesc: desc, parentId: secid, subid: subid });
    });
    bindOutputSummary(sectionsSummary);
}
var generateReport = function () {
    let l = sectionsSummary.length;
    if (l == 0) {
        $(".customerDetail").css("display", "none");
        $("#alert").css('display', 'block');
        $("#message").html("Please select any one of the section or subsection");
        $(".transparentBG").show();
        return;
    }
    $('.transparentBG').show();
    $(".customerDetail").css('z-index', '5000');
    $(".customerDetail").css('background-color', 'white');
    $(".customerDetail").css('display', 'block');

}
var generateReportSubmit = function () {
    let customerName = $("#customername").val().trim();
    let logoName = $("#customerlogo").val().trim();
    if (customerName == undefined) {
        customerName = "";
    }
    if (logoName == undefined) {
        logoName = "";
    }
    let pptList = [];
    let l = sectionsSummary.length;
    //if (l == 0) {
    //    $(".customerDetail").css("display", "none");
    //    $("#alert").css('display', 'block');
    //    $("#message").html("Please select any one of the section or subsection");
    //    $(".transparentBG").show();
    //    return;
    //}
    for (let i = 0; i < l; i++) {
        sectionsSummary[i]["customerName"] = customerName;
        sectionsSummary[i]["logoName"] = logoName;
        //let name = $('.sectionName').eq(i).attr('data-name');
        //let desc = $('.sectionName').eq(i).attr('desc');
        //let slideCnt = $('.sectionName').eq(i).attr('finalslide-count');
        //let fileNme = $('.sectionName').html().split('<div ')[0].substr($('.sectionName').html().split('<div ')[0].indexOf('.') + 1, $('.sectionName').html().split('<div ')[0].length - 1).trim()
        ////$('.sectionName').eq(i).attr('file-name');
        //let secs = $('.sectionName').eq(i).attr('section-name');
        ////let sec = $('.home-namecontainer' + secid + ' .homesection-nameText').html().split('(Description: ')[0].trim();

        //pptList.push({ logoName: logoName, customerName: customerName, SectionName: secs, SubSectionName: name, SlideCount: slideCnt, Filename: fileNme.trim() + ".pptx", SubSectionNamedesc: desc });
    }
    /*Added by Sabat Ullah 09-01-2019 --start*/
    $(".preview-div .crossbtn").css('left', '34%')
    $(".preview-div .preview-image .preview-child-image").css({
        'background': 'unset',
    });
    $(".preview-image .preview-child-image").css({
        'background': 'url(../Images/Dine_Sprite_Admin_Sprite.svg) no-repeat -581px -198px',
    });
    //$(".preview-div .crossbtn .crossbtnImage").css("display", "none");
    $("#customerlogo").val("");
    $(".preview-div .crossbtn").css('left', '34%')
    $(".preview-div .preview-image .preview-child-image").css({
        'background': 'unset',
    });
    $(".preview-image .preview-child-image").css({
        'background': 'url(../Images/Dine_Sprite_Admin_Sprite.svg) no-repeat -581px -198px',
    });
    //$(".preview-div .crossbtn .crossbtnImage").css("display", "none");
    $("#customerlogo").val("");
    $("#customername").val("");
    /*Added by Sabat Ullah 09-01-2019 --end*/
    $(".loader,.transparentBG").show();
    $(".customerDetail").hide();

    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GenerateReportNew",
        data: JSON.stringify(sectionsSummary),
        method: "POST",
        contentType: "application/json",
        success: function (d) {
            if (d)
                window.location.href = appRouteUrl + "Report/DownloadPPTNew?path=" + d + "&customerName=" + customerName;
            $(".loader,.transparentBG").hide();
            $('.transparentBG').hide();

            $('.sectionlist').remove()

            $(".customerDetail").css('display', 'none');
            $(".modify-chckbox-home-parent").prop("checked", false);
            $(".home-modify-chckbox").prop("checked", false);
            $(".home-selct-deselct-check").prop("checked", false);
            sectionsSummary = [];
        }, error: ajaxError
    });



}
var generateReportCancel = function () {
    /*Added by Sabat Ullah 09-01-2019 --start*/
    $(".preview-div .crossbtn").css('left', '34%')
    $(".preview-div .preview-image .preview-child-image").css({
        'background': 'unset',
    });
    $(".preview-image .preview-child-image").css({
        'background': 'url(../Images/Dine_Sprite_Admin_Sprite.svg) no-repeat -581px -198px',
    });
    //$(".preview-div .crossbtn .crossbtnImage").css("display", "none");
    $("#customerlogo").val("");
    $(".preview-div .crossbtn").css('left', '34%')
    $(".preview-div .preview-image .preview-child-image").css({
        'background': 'unset',
    });
    $(".preview-image .preview-child-image").css({
        'background': 'url(../Images/Dine_Sprite_Admin_Sprite.svg) no-repeat -581px -198px',
    });
    //$(".preview-div .crossbtn .crossbtnImage").css("display", "none");
    $("#customerlogo").val("");
    $("#customername").val("");
    /*Added by Sabat Ullah 09-01-2019 --end*/

    $('.transparentBG').hide();
    $(".customerDetail").css('display', 'none');

}
var getEstablishmentDataForLogo = function () {
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/GetEstablishmentData",
        method: "GET",
        contentType: "application/json",
        success: function (d) {
            EstablishmentLogoData = d;
            $.each(EstablishmentLogoData, function (i, v) {
                logoNames.push(v.LogoName);
            })

        }, error: ajaxError
    });
}



//search in Home section
var pushintoSearchArrayHome = function () {
    $('.lft-popup-col-search-forinsights-home').css("display", "block");
    $('.lft-popup-col-search-forinsights-modify').css("display", "none");

    $("#search-list-establishment-insights-home").autocomplete({
        source: jQuery.unique(searchArrayforinsghtsHome),
        select: function (event, ui) {
            var selectedValue = ui.item.value.trim();
            var item_Index = -1;
            if (ui.item.classname == "modify-chckbox-home-parent") {
                toggleCheckboxSearch(ui.item.sectionid);
            }
            else {
                //$('.home-parent-checkbox' + ui.item.element).prop('checked', true)

                let id = $('.home-parent-checkbox' + ui.item.element).attr('data-id');
                //$('.home-section-checkbox' + id).prop('checked', true);
                if ($('.home-modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked')) {
                    //$('.home-section-checkbox' + ui.item.sectionid).prop('checked', false);
                    $('.home-modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked', false);
                }
                else {
                    //$('.home-section-checkbox' + ui.item.sectionid).prop('checked', true);
                    $('.home-modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked', true);
                }
                subsectionToggle(ui.item.sectionid);
            }
            $('#search-list-establishment-insights-home').val('');
            return false;
            $(this).trigger("change");
            this.value = "";
            return false;
        },
        minLength: 2,
        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                //$('.lft-popup-col' + searchlevel + ' #search-list-' + label).val();
                //$('.master-lft-ctrl[data-val="' + label + '"]').find(".lft-popup-ele_active").children().eq(0).click();
            }
        }
    });

}
//search in modify section
var pushintoSearchArrayModify = function (response) {
    $('.lft-popup-col-search-forinsights-modify').css("display", "block");
    $('.lft-popup-col-search-forinsights-home').css("display", "none");
    //$.each(response, function (i, v) {
    //    let className = "";
    //    if (v.ParentSectName == "")
    //        className = "modify-chckbox-parent";
    //    else
    //        className = "modify-chckbox";
    $("#search-list-establishment-insights-modify").autocomplete({
        source: jQuery.unique(searchArrayforinsghtsModify),
        select: function (event, ui) {

            var selectedValue = ui.item.value.trim();
            var item_Index = -1;
            if (ui.item.classname == "modify-chckbox-parent") {
                toggleCheckboxFormodify(ui.item.sectionid);
            }
            else {
                //$('.home-check-box' + ui.item.element).prop('checked', true)
                //let id = $('.home-check-box' + ui.item.element).attr('section-id');
                //$('.modify-parent-checkbox' + id).prop('checked', true);

                if ($('.modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked')) {
                    $('.modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked', false);
                }
                else {
                    $('.modify-chckbox[subsectid=' + ui.item.subid + ']').prop('checked', true);
                }
                toggleSubSectionModify(ui.item.sectionid, ui.item.subid);
            }
            $('#search-list-establishment-insights-modify').val('');
            return false;
            $(this).trigger("change");
            this.value = "";
            return false;
        },
        minLength: 2,
        change: function (event, ui) {
            if (ui.item == null || ui.item == undefined) {
                //$('.lft-popup-col' + searchlevel + ' #search-list-' + label).val();
                //$('.master-lft-ctrl[data-val="' + label + '"]').find(".lft-popup-ele_active").children().eq(0).click();
            }
        }
    });
    //});
}
var toggleCheckboxSearch = function (id) {
    if ($('.home-section-checkbox' + id).prop('checked')) {
        $('.home-section-checkbox' + id).prop('checked', false)
        $('.home-modify-chckbox[data-id=' + id + ']').prop('checked', false);
    }
    else {
        $('.home-section-checkbox' + id).prop('checked', true)
        $('.home-modify-chckbox[data-id=' + id + ']').prop('checked', true);
    }
    subsectionToggle(id);

}
var toggleCheckboxFormodify = function (id) {
    if ($('.modify-parent-checkbox' + id).prop('checked')) {
        $('.modify-parent-checkbox' + id).prop('checked', false)
        $('.modify-chckbox[data-id=' + id + ']').prop('checked', false);
    }
    else {
        $('.modify-parent-checkbox' + id).prop('checked', true)
        $('.modify-chckbox[data-id=' + id + ']').prop('checked', true);
    }
    //$('.parentcheckbox' + id).prop('checked', true)
    //$('.checkbox' + id).prop('checked', true);
}

var toggleSubSectionModify = function (sectionid, subid) {
    let checkboxSecltedCount = 0;
    let todeselectParentCheckbx = $("input[name='Subsection'][data-id=" + sectionid + "]:checked").length;
    if (todeselectParentCheckbx == 0)
        $('.modify-parent-checkbox' + sectionid).prop('checked', false);
    else
        $('.modify-parent-checkbox' + sectionid).prop('checked', true);

    //Added by Sabat Ullah 13-01-2020
    modifySelectUnselect();
}

function modifySelectUnselect() {
    let totalHomeParentCheckboxCount = $(".modify-chckbox-home-parent").length;
    let totalHomeChildCheckboxCount = $(".home-modify-chckbox").length;
    let totalHomeCheckedParent = $(".modify-chckbox-home-parent").filter(':checked').length;
    let totalHomeCheckedChild = $(".home-modify-chckbox").filter(':checked').length;
    if (totalHomeParentCheckboxCount != 0 && totalHomeChildCheckboxCount != 0) {
        if (totalHomeParentCheckboxCount == totalHomeCheckedParent && totalHomeChildCheckboxCount == totalHomeCheckedChild) {
            $(".home-selct-deselct-check").prop("checked", true);
        }
        else {
            $(".home-selct-deselct-check").prop("checked", false);
        }
    }

    else {
        $(".home-selct-deselct-check").prop("checked", false);
    }


    let totalModifyParentCheckboxCount = $(".modify-chckbox-parent").length;
    let totalModifyChildCheckboxCount = $(".modify-chckbox").length;
    let totalModifyCheckedParent = $(".modify-chckbox-parent").filter(':checked').length;
    let totalModifyCheckedChild = $(".modify-chckbox").filter(':checked').length;
    if (totalModifyParentCheckboxCount != 0 && totalModifyChildCheckboxCount != 0) {
        if (totalModifyParentCheckboxCount == totalModifyCheckedParent && totalModifyChildCheckboxCount == totalModifyCheckedChild) {
            $(".selct-deselct-check").prop("checked", true);
        }
        else {
            $(".selct-deselct-check").prop("checked", false);
        }

    }
    else {
        $(".selct-deselct-check").prop("checked", false);
    }
}

var GetNextValue = function (element, array) {
    let k = element;
    while (true) {
        k++;
        if ($.inArray(k.toString(), array) == -1) {
            break;
        }
    }
    return k;
}

var OverWriteSectionSubmit = function (sectionDetails) {
    $.ajax({
        cache: false,
        url: appRouteUrl + "Report/OverwriteSection",
        data: JSON.stringify(sectionDetails),
        method: "POST",

        contentType: "application/json",
        success: function (response) {
            $(".loader,.transparentBG").hide();
            if (response == "TRUE") {
                if (createParentOverwriteArray.length == 0 && createParentNonOverwriteArray.length == 0) {
                    $("#alert").css('display', 'block');
                    $("#message").html("section(s) are created successfully");
                    for (let j = 0; j < count; j++) {
                        $('#sectionname' + j).val("");
                        $('#desc' + j).val("");
                    }
                    getSectionName();
                    $(".createParentContainer:not(:eq(0))").remove();
                    $(".maincontainer").css("height", "144px");
                    count = 1;
                    px = parseInt($('.maincontainer').css('height'));
                    height = 268;
                    he = 25;
                    btnhe = 123;
                    createParentClicked = false;
                    createParentOverwriteArray = [];
                    createParentNonOverwriteArray = [];
                }
                else {
                    createSection();
                }

            } else {
                $("#alert").css('display', 'block');
                $("#message").html("section(s) are not created successfully");
            }
            $(".transparentBG").show();

        }, error: ajaxError
    });
}
