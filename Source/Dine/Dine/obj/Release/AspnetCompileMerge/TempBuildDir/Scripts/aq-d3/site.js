// JQuery For PadLoad Setting 
var page = {};
page.BindGridDrillButtonEvents = function (obj) {
    obj.bind("click", function (event) {
        var currentObj = $(this);
        var parentObj = currentObj.closest("tr");
        var index = parentObj.index();

        // Add Single Rows

        //$(".divGridDemo2").advanceGrid("AddRowBefore", index, {
        //    "title": "1",
        //    "name": "SDFSDNFJDSFNSDNFN",
        //    "position": "System Architect sdfsdfsdfs sfsdf sdfdsfsdf sdfsdf",
        //    "salary": "$3,120",
        //    "start_date": "2011/04/25",
        //    "office": "Edinburgh",
        //    "extn": "5421"
        //});


        // Add Multiple Rows
        $(".divGridDemo2").advanceGrid("AddRowsAfter", index, [{
            "title": "R1",
            "name": "SDFSDNFJDSFNSDNFN",
            "position": "System Architect sdfsdfsdfs sfsdf sdfdsfsdf sdfsdf",
            "salary": "$3,120",
            "start_date": "2011/04/25",
            "office": "Edinburgh",
            "extn": "5421"
        }, {
            "title": "R2",
            "name": "SDFSDNFJDSFNSDNFN",
            "position": "System Architect sdfsdfsdfs sfsdf sdfdsfsdf sdfsdf",
            "salary": "$3,120",
            "start_date": "2011/04/25",
            "office": "Edinburgh",
            "extn": "5421"
        }]);


    });
};
page.customColumnHeaderFormatter = function (element, dataObje) { element.addClass("redClass"); };
page.customColumnFormatter = function (rowIndex, element, dataObj, columnObj) {
    var newElementObj = $("<span class='glyphicon glyphicon-plus'></span>");
    element.empty().append(newElementObj).append(dataObj[columnObj.data]);
    element.data("data-row-index", rowIndex);
    page.BindGridDrillButtonEvents(newElementObj);
};

page.Example1 = function () {
    var config = {
        data: [
            {
                "title": "1",
                "name": "Tiger",
                "position": "System Architect sdfsdfsdfs sfsdf sdfdsfsdf sdfsdf",
                "salary": "$3,120",
                "start_date": "2011/04/25",
                "office": "Edinburgh",
                "extn": "5421"
            },
            {
                "title": "2",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "3",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "4",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "6",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "7",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "8",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "9",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "10",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "11",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "12",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "13",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "14",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            }
        ],
        columns: [
            { data: "title", label: "#", width: "80px" },
            { data: 'name', label: "Name", width: "100px", createColumnHeader: page.customColumnHeaderFormatter },
            { data: 'position', label: "Position", width: "100px" },
            { data: 'salary', label: "Salary", width: "100px", createColumnHeader: page.customColumnHeaderFormatter },
            { data: 'office', label: "Office sdfjasdhfjhsaf adsfas", width: "200px" }
        ],
        fixedColumns: {
            leftColumns: 2,
            rightColumns: 0
        }
    };
    var gridContainer = $(".divGridDemo1");
    gridContainer.advanceGrid(config);
}

page.Example2 = function () {
    var config = {
        data: [
            {
                "title": "1",
                "name": "Tiger",
                "position": "System Architect sdfsdfsdfs sfsdf sdfdsfsdf sdfsdf",
                "salary": "$3,120",
                "start_date": "2011/04/25",
                "office": "Edinburgh",
                "extn": "5421"
            },
            {
                "title": "2",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "3",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "4",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "6",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "7",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "8",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "9",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "10",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "11",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "12",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "13",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            },
            {
                "title": "14",
                "name": "Garrett",
                "position": "Director",
                "salary": "$5,300",
                "start_date": "2011/07/25",
                "office": "Edinburgh",
                "extn": "8422"
            }
        ],
        columns: [
            { data: "title", label: "#", width: "80px", createColumn: page.customColumnFormatter },
            { data: 'name', label: "Name", width: "100px", createColumnHeader: page.customColumnHeaderFormatter },
            { data: 'position', label: "Position", width: "100px" },
            { data: 'salary', label: "Salary", width: "100px", createColumnHeader: page.customColumnHeaderFormatter },
            { data: 'office', label: "Office sdfjasdhfjhsaf adsfas", width: "200px" }
        ],
        fixedColumns: {
            leftColumns: 2,
            rightColumns: 0
        }
    };
    var gridContainer = $(".divGridDemo2");
    gridContainer.advanceGrid(config);

    // 
    gridContainer.advanceGrid("SetGroupHeaders", [
        { startColumn: 0, numberOfColumns: 2, label: "Fixed Header" },
        { startColumn: 2, numberOfColumns: 2, label: "header 1" }
    ]);

};

page.DoPageSetting = function () {
    this.Example1();
    this.Example2();
};