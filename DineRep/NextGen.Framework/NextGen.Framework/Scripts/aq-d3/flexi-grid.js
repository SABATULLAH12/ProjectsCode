$.widget("aq.advanceGrid", {
    options: {
        isHeaderEnable: true,
        columns: null,
        data: null,
        fixedColumns: {
            leftColumns: 0,
            rightColumns: 0
        }
    },
    _CreateRow: function (rowindex, dataObj, columns) {
        var rowObj = $("<tr role=\"row\"></tr>");
        for (var i = 0 ; i < columns.length; i++) {
            var columnObj = columns[i];
            var columnCellObj = $("<td style=\"min-width: " + columnObj.width + "\">" + dataObj[columnObj.data] + "</td>");
            rowObj.append(columnCellObj);
            if (columnObj.createColumn !== undefined) { columnObj.createColumn(rowindex, columnCellObj, dataObj, columnObj); }
        }
        return rowObj;
    },
    _CopyColumns: function (sourceObj, targetObj, colNos) {
        sourceObj.find("tr").each(function () {
            var $tds = $(this).children(),
                $row = $("<tr></tr>");
            $row.height($(this).height());
            for (var i = 0; i < colNos.length; i++) { $row.append($tds.eq(colNos[i]).clone(true)); }
            $row.appendTo(targetObj);
        });
    },
    _AttachScrollBar: function () {
        var gridObj = this;
        this.gridContainerObj.find(".divGridScollContainer").addClass("scrollbar-outer").scrollbar({
            "onScroll": function (y, x) {
                gridObj.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").find("table").css({ "margin-left": (x.scroll * -1 + "px") });
                if (gridObj.leftFreezColumnContainer != undefined) { gridObj.leftFreezColumnContainer.find("table").css({ "margin-top": (y.scroll * -1 + "px") }); }
            }
        });
    },
    _ReArrangeContainer: function () {
        var horizontalOffset = 0;
        var verticalOffset = 0;
        this.gridContainerObj.css({ "height": "auto" });
        this._AttachScrollBar();

        // Set Width
        this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").removeClass("br1");
        if (this.gridContainerObj.find(".scroll-y").hasClass("scroll-scrolly_visible")) { horizontalOffset = this.gridContainerObj.find(".scroll-y").width() + 1; this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").addClass("br1"); }
        this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").width(this.gridContainerObj.width() - horizontalOffset);

        // Set Hight
        this.gridContainerObj.height(this.currentObj.height() - this.gridHeaderContainerObj.outerHeight());
        // Rearrange Fixed Columns Left Side
        if (this.gridContainerObj.find(".scroll-x").hasClass("scroll-scrollx_visible")) { verticalOffset = this.gridContainerObj.find(".scroll-x").height() + 1; }
        if (this.leftFreezColumnContainer != undefined && this.leftFreezColumnContainer.length > 0) { this.leftFreezColumnContainer.css({ "max-height": (this.gridContainerObj.height() - verticalOffset) + "px" }); }
    },
    _CreateLeftFreezColumnContainer: function () {
        var verticalOffset = 0;
        if (this.gridContainerObj.find(".scroll-x").hasClass("scroll-scrollx_visible")) { verticalOffset = this.gridContainerObj.find(".scroll-x").height() + 1; }
        if (this.leftFreezColumnContainer != undefined) this.leftFreezColumnContainer.remove();
        this.leftFreezColumnContainer = $("<div class='divGridScollContainerLeft'><table class=\"dataGrid\"><tbody></tbody></table></div>");
        this.leftFreezColumnHeaderContainer = $("<div class='divGridHeaderLefftScrollContainer'><table class=\"dataGrid\"><thead></thead></table></div>");
        this.gridHeaderContainerObj.prepend(this.leftFreezColumnHeaderContainer);
        this.gridContainerObj.prepend(this.leftFreezColumnContainer);
        this.leftFreezColumnContainer.css({ "max-height": (this.gridContainerObj.height() - verticalOffset) + "px" });
    },
    _MoveLeftFreezedColumn: function () {
        var getFreezedColumnsIndex = [];
        var getFreezedColumnWidth = 0;
        for (var i = 0; i < this.options.fixedColumns.leftColumns; i++) { getFreezedColumnsIndex.push(i); }
        if (getFreezedColumnsIndex.length <= 0) { return; }
        this._CreateLeftFreezColumnContainer();
        this._CopyColumns(this.gridContainerObj.find("table >tbody"), this.leftFreezColumnContainer.find("table >tbody"), getFreezedColumnsIndex);
        this._CopyColumns(this.gridHeaderContainerObj.find("table >thead"), this.leftFreezColumnHeaderContainer.find("table >thead"), getFreezedColumnsIndex);
        this.gridHeaderContainerObj.find("th").each(function (index) { if (getFreezedColumnsIndex.indexOf(index) > -1) { getFreezedColumnWidth += $(this).outerWidth(); } });
        this.leftFreezColumnContainer.width(getFreezedColumnWidth);
        this.leftFreezColumnHeaderContainer.width(getFreezedColumnWidth);
    },
    _CreateGridHeader: function () {
        if (!this.options.isHeaderEnable) { return; }
        this.gridHeaderContainerObj.find("thead").append("<tr role=\"row\"></tr>");
        var tableHeaderObj = this.gridHeaderContainerObj.find("table >thead >tr");
        var columns = this.options.columns;
        for (var i = 0 ; i < columns.length; i++) {
            var columnObj = columns[i];
            var columnHeaderObj = $("<th style=\"min-width: " + columnObj.width + "\">" + columnObj.label + "</th>")
            tableHeaderObj.append(columnHeaderObj);
            if (columnObj.createColumnHeader !== undefined) { columnObj.createColumnHeader(columnHeaderObj, columnObj); }
        }
    },
    _LoadGridData: function () {
        var gridDataContainerObj = this.gridContainerObj.find("tbody");
        var dataObjs = this.options.data;
        var columns = this.options.columns;
        for (var j = 0; j < dataObjs.length; j++) {
            var dataObj = dataObjs[j];
            var rowObj = this._CreateRow(j, dataObj, columns);
            gridDataContainerObj.append(rowObj);
        }
        var headerColumns = this.gridContainerObj.find("tr:first").find("td");
        this.gridHeaderContainerObj.find("table >thead").find("th").each(function (index) {
            $(this).outerWidth(headerColumns.eq(index).outerWidth());
            headerColumns.eq(index).outerWidth(headerColumns.eq(index).outerWidth());
        });
    },
    _LoadInitialData: function () {
        this._CreateGridHeader();
        this._LoadGridData();
        this._ReArrangeContainer();
    },
    _CreateHeaderContiner: function () {
        this.gridHeaderContainerObj = $("<div class=\"divGridHeaderScrollBody\"></div>");
        this.gridHeaderContainerObj.append("<div class=\"divGridHeaderScrollContainer\"><table class=\"dataGrid\"><thead></thead></table></div>");
        this.currentObj.append(this.gridHeaderContainerObj);
    },
    _CreateGridContiner: function () {
        this.gridContainerObj = $("<div class=\"divGridScrollBody\"></div>");
        this.gridContainerObj.append("<div class=\"divGridScollContainer\"><table class=\"dataGrid\"><tbody></tbody></table></div>");
        this.currentObj.append(this.gridContainerObj);
    },
    _Initiated: function (obj) {
        this.currentObj = obj;
        this._CreateHeaderContiner();
        this._CreateGridContiner();
        this._LoadInitialData();
        this._MoveLeftFreezedColumn();
        this._ReArrangeContainer();
    },
    _create: function () {
        if (this.options.data == undefined || this.options.data == null || this.options.columns == undefined || this.options.columns == null) { return; }
        this._Initiated(this.element);
    }
});
$.aq.advanceGrid.prototype._UpdateDataByNewRowObj = function (index, dataObj) {
    this.options.data.splice(index, 0, dataObj);
};
$.aq.advanceGrid.prototype.AddRowAfter = function (index, dataObj) {
    if (index < 0) { return };
    var rowObj = this._CreateRow(index + 1, dataObj, this.options.columns);
    var leftFreezedColumnRowObj = rowObj.clone(true);
    leftFreezedColumnRowObj.find("td").remove();
    var currentRowByPosition = this.gridContainerObj.find(".divGridScollContainer").find("tr:eq(" + index + ")");
    var currentLeftFreezedRowByPosition = this.gridContainerObj.find(".divGridScollContainerLeft").find("tr:eq(" + index + ")");
    rowObj.insertAfter(currentRowByPosition);
    leftFreezedColumnRowObj.insertAfter(currentLeftFreezedRowByPosition);
    for (var i = 0 ; i < this.options.fixedColumns.leftColumns; i++) { leftFreezedColumnRowObj.append(rowObj.find("td:eq(" + i + ")").clone(true)); }
    leftFreezedColumnRowObj.height(rowObj.height());
    currentLeftFreezedRowByPosition.height(currentRowByPosition.height());
    this._UpdateDataByNewRowObj(index + 1, dataObj);
    this._ReArrangeContainer();
};
$.aq.advanceGrid.prototype.AddRowBefore = function (index, dataObj) {
    if (index < 0) { return };
    var rowObj = this._CreateRow(index == 0 ? 0 : index - 1, dataObj, this.options.columns);
    var leftFreezedColumnRowObj = rowObj.clone(true);
    leftFreezedColumnRowObj.find("td").remove();
    var currentRowByPosition = this.gridContainerObj.find(".divGridScollContainer").find("tr:eq(" + index + ")");
    var currentLeftFreezedRowByPosition = this.gridContainerObj.find(".divGridScollContainerLeft").find("tr:eq(" + index + ")");
    rowObj.insertBefore(currentRowByPosition);
    leftFreezedColumnRowObj.insertBefore(currentLeftFreezedRowByPosition);
    for (var i = 0 ; i < this.options.fixedColumns.leftColumns; i++) { leftFreezedColumnRowObj.append(rowObj.find("td:eq(" + i + ")").clone(true)); }
    leftFreezedColumnRowObj.height(rowObj.height());
    currentLeftFreezedRowByPosition.height(currentRowByPosition.height());
    this._UpdateDataByNewRowObj(index == 0 ? 0 : index - 1, dataObj);
    this._ReArrangeContainer();
};
$.aq.advanceGrid.prototype.AddRowsAfter = function (index, dataObjs) {
    if (dataObjs == undefined || dataObjs == null || dataObjs.length <= 0) { return; }
    for (var i = 0; i < dataObjs.length  ; i++) {
        this.AddRowAfter(index + i, dataObjs[i]);
    }
};
$.aq.advanceGrid.prototype.AddRowsBefore = function (index, dataObjs) {
    if (dataObjs == undefined || dataObjs == null || dataObjs.length <= 0) { return; }
    for (var i = 0; i < dataObjs.length  ; i++) {
        this.AddRowBefore(index + i, dataObjs[i]);
    }
};
$.aq.advanceGrid.prototype.SetGridGroupHeaders = function (headerGroups) {
    var headerObj = this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").find("table > thead");
    var headerGroupRowObj = headerObj.find("tr:first").clone(true);
    headerGroupRowObj.find("th").empty().each(function (index) { $(this).attr("data-index", index); }); // Clear Cell of Header Group Row
    headerObj.prepend(headerGroupRowObj);
    // Make Header Row Height Equal
    for (var i = 0 ; i < headerGroups.length; i++) {
        var headerGroup = headerGroups[i];
        var startcolumn = headerGroup.startColumn == 0 ? 0 : headerGroup.startColumn;
        var numberofcolumns = headerGroup.numberOfColumns - 1;
        var colspan = headerGroup.numberOfColumns;
        if (this.options.fixedColumns.leftColumns > startcolumn) { continue; }
        var width = 0;
        width += headerGroupRowObj.find("th[data-index='" + startcolumn + "']").outerWidth();
        headerGroupRowObj.find("th[data-index='" + startcolumn + "']").attr("colspan", colspan);
        for (var j = startcolumn + 1 ; j <= startcolumn + numberofcolumns; j++) {
            var columnObj = headerGroupRowObj.find("th[data-index='" + j + "']");
            width += columnObj.outerWidth();
            columnObj.remove();
        }
        headerGroupRowObj.find("th[data-index='" + startcolumn + "']").outerWidth(width).empty().append(headerGroup.label);
    }
    this._ReArrangeContainer();
};
$.aq.advanceGrid.prototype.SetGridLeftFixedGroupHeader = function (headerGroups) {
    if (this.options.fixedColumns.leftColumns == 0) { return; }
    var freezedHeaderObj = this.gridHeaderContainerObj.find(".divGridHeaderLefftScrollContainer").find("table > thead");
    var freezeHeaderGroupRowObj = freezedHeaderObj.find("tr:first").clone(true);
    var headerGroupRowObj = this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").find("table > thead").find("tr:first");
    freezeHeaderGroupRowObj.find("th").empty().each(function (index) { $(this).attr("data-index", index); }); // Clear Cell of Header Group Row
    freezedHeaderObj.prepend(freezeHeaderGroupRowObj);
    for (var i = 0 ; i < headerGroups.length; i++) {
        var headerGroup = headerGroups[i];
        var startcolumn = headerGroup.startColumn == 0 ? 0 : headerGroup.startColumn;
        var numberofcolumns = headerGroup.numberOfColumns - 1;
        var colspan = headerGroup.numberOfColumns;
        var width = 0;
        width += freezeHeaderGroupRowObj.find("th[data-index='" + startcolumn + "']").outerWidth();
        freezeHeaderGroupRowObj.find("th[data-index='" + startcolumn + "']").attr("colspan", colspan);
        for (var j = startcolumn + 1 ; j <= startcolumn + numberofcolumns; j++) {
            var columnObj = freezeHeaderGroupRowObj.find("th[data-index='" + j + "']");
            width += columnObj.outerWidth();
            columnObj.remove();
        }
        freezeHeaderGroupRowObj.find("th[data-index='" + startcolumn + "']").outerWidth(width).empty().append(headerGroup.label);
    }
    // ReArrange Data
    this.gridHeaderContainerObj.find(".divGridHeaderScrollContainer").find("table > thead").find("tr").each(function (index) {
        var currentRowObj = $(this);
        if (currentRowObj.height() > freezedHeaderObj.find("tr:eq(" + index + ")").height()) { freezedHeaderObj.find("tr:eq(" + index + ")").height(currentRowObj.outerHeight()); }
        else { currentRowObj.height(freezedHeaderObj.find("tr:eq(" + index + ")").outerHeight()); }
    });
    this._ReArrangeContainer();
};
$.aq.advanceGrid.prototype.UpdateGroupHeadersConfig = function (headerGroups) {
    for (var i = 0; i < headerGroups.length; i++) {
        var headerGroup = headerGroups[i];
        if (headerGroup.startColumn == undefined && headerGroup.startColumnName != undefined && headerGroup.startColumnName != null && headerGroup.startColumnName != "") {
            var index = 0;
            for (var j = 0  ; j < this.options.columns.length; j++) {
                var column = this.options.columns[j];
                if (column.data.toUpperCase() == headerGroup.startColumnName.toUpperCase()) { index = j; }
            }
            headerGroup.startColumn = index;
        }
        headerGroups[i] = headerGroup;
    }
    return headerGroups;
};
$.aq.advanceGrid.prototype.SetGroupHeaders = function (headerGroups) {
    if (headerGroups == undefined || headerGroups == null || headerGroups.length <= 0) { return; }
    headerGroups = this.UpdateGroupHeadersConfig(headerGroups);
    this.options.headerGroups = $.extend(true, [], headerGroups);
    this.SetGridGroupHeaders(headerGroups);
    this.SetGridLeftFixedGroupHeader(headerGroups);
};
$.aq.advanceGrid.prototype.GetGridData = function () { return this.options.data; };
