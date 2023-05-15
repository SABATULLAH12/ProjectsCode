/// <reference path="jquery-ui-1.11.4.min.js" />
/// <reference path="jquery-3.0.0.min.js" />
/// <reference path="angular.min.js" />

var mainApp = angular.module("mainApp", []);
var appRouteUrl = "/";

angular.module("mainApp").controller("toolController", ['$scope', '$http', function ($scope, $http) {
    $scope.modules = ["Chart", "Table", "Snapshot"];

    $scope.chart = {
        Filter: "Filter Selection",
        Content: "Content Area",
        Widgets: "Widget"
    };

    $scope.widgets = {
        widgetType: ["chart", "table", "customized"]
    }

    $scope.chartOptions = {
        Procedure: "",
        ProcedureName: [],
        Tables: [],//[{ name: '', cols: [] }],
        TableCols: [],
        FilterLabels: [],
    };

    $scope.addNewFilter = function () {
        var o = $scope.toolModule.filterInfo;
        //o.OrderNumber = (isNaN(parseInt(o.OrderNumber)) || parseInt(o.OrderNumber) == 0 ? 1 : parseInt(o.OrderNumber));
        o.OrderNumber = getMaxValue($scope.toolModule.Filters) + 1;
        if ($scope.toolModule.Filters == null)
            $scope.toolModule.Filters = [];
        $scope.toolModule.Filters.push({
            OrderNumber: o.OrderNumber,
            Label: o.Label,
            IsMultiSelect: o.IsMultiSelect,
            IsRequired: o.IsRequired,
            Image: o.Image,
            IsTimePeriod: o.IsTimePeriod,
            IsFilterBasedOnOtherFilter: o.IsFilterBasedOnOtherFilter,
            HideTrend: o.HideTrend,
            Database: {
                Table: o.Database.Table,
                PrimaryKey: o.Database.PrimaryKey,
                DisplayTextColumnName: o.Database.DisplayTextColumnName,
                ParentPrimaryKey: o.Database.ParentPrimaryKey,
                ParentText: o.Database.ParentText,
                WhereCondition: o.Database.WhereCondition,
                SelectableColumnName: o.Database.SelectableColumnName
            }
        });

        o.OrderNumber = 1 + (isNaN(parseInt(o.OrderNumber)) ? 0 : parseInt(o.OrderNumber));
        o.OrderNumber = getMaxValue($scope.toolModule.Filters) + 1;

        o.Label = '';
        o.IsMultiSelect = true;
        o.IsRequired = true;
        o.Image = '';
        o.IsTimePeriod = false;
        o.IsFilterBasedOnOtherFilter = false;
        o.HideTrend = false;
        o.Database.Table = '';
        o.Database.PrimaryKey = '';
        o.Database.DisplayTextColumnName = '';
        o.Database.ParentPrimaryKey = '';
        o.Database.ParentText = '';
        o.Database.WhereCondition = '';
        o.Database.SelectableColumnName = '';
    }

    $scope.addNewParameter = function () {
        var o = $scope.toolModule.parameterInfo;
        if ($scope.toolModule.Procedure.Parameters == null)
            $scope.toolModule.Procedure.Parameters = [];
        $scope.toolModule.Procedure.Parameters.push({
            FilterLabel: o.FilterLabel,
            Format: o.Format,
            DefaultValue: o.DefaultValue,
            Prefix: o.Prefix,
            Postfix: o.Postfix,
            CustomPropertyLabel: o.CustomPropertyLabel
        });
        o.FilterLabel = '', o.Format = '', o.DefaultValue = '', o.Prefix = '',
        o.Postfix = '', o.CustomPropertyLabel = '';
    }

    $scope.addNewWidget = function () {
        var o = angular.copy($scope.toolModule.Procedure);
        o.WidgetName = $scope.toolModule.widgetName;
        o.Type = $scope.toolModule.widgetType;
        $scope.toolWidgets.push(angular.copy(o));
        $scope.toolModule.Procedure.Name = "";
        $scope.toolModule.widgetName = "";
        $scope.toolModule.Procedure.Parameters = [],
                $scope.toolModule.Procedure.SeriesColumn = "",
                $scope.toolModule.Procedure.XAxisColumn = "",
                $scope.toolModule.Procedure.YAxisColumn = "",
                $scope.toolModule.Procedure.ZAxisColumn = "",
                $scope.toolModule.Procedure.IgnoreColumns = [];
    }

    $scope.addColumnToIgnore = function () {
        var pr = $scope.toolModule.Procedure;
        if (pr.IgnoreColumns.indexOf($scope.toolModule.IgnoreColumn.IgnoreColumnText) == -1) {
            pr.IgnoreColumns.push($scope.toolModule.IgnoreColumn.IgnoreColumnText);
            $scope.toolModule.IgnoreColumn.IgnoreColumnText = '';
        }
        else
            alert("Item already exists!");
    }

    $scope.removeColumn = function (index) {
        $scope.toolModule.Procedure.IgnoreColumns.splice(index, 1);
    }

    $scope.submitConfig = function () {
        var cnfrm = confirm("Do you wish to submit the configuration!");
        if (cnfrm) {
            if ($scope.toolModule.module == "Snapshot" && $scope.toolModule.configFor == "Widget") {

                $http.post("/Tool/UpdateWidgets", JSON.stringify({ widgets: $scope.toolWidgets })).then(function (d) {
                    alert(d.data);
                });
            }
            else if ($scope.toolModule.configFor == "Filter Selection") {
                $http.post("/Tool/UpdateLeftPanel", JSON.stringify({ module: $scope.toolModule.module, info: $scope.toolModule })).then(function (d) {
                    alert(d.data);
                    $scope.ToolWidgets = [];
                });
            }
            else if ($scope.toolModule.configFor == "Content Area") {
                // alert(JSON.stringify($scope.toolModule));
                $http.post("/Tool/UpdateContent", JSON.stringify({ module: $scope.toolModule.module, info: $scope.toolModule.Procedure })).then(function (d) {
                    alert(d.data);
                });
            }
        }
    }

    $scope.deleteFilter = function (key) {
        var cnfrm = confirm("Do you wish to delete this record!");
        if (cnfrm) {
            if ($scope.toolModule.Filters.indexOf(key.x) > -1) {
                $scope.toolModule.Filters.splice($scope.toolModule.Filters.indexOf(key.x), 1);
            }
            alert('Deleted')
        }
    }

    $scope.getTemplate = function (key, index) {
        if ($scope.toolModule != null && $scope.toolModule.filterInfo != null && key.OrderNumber === $scope.toolModule.filterInfo.OrderNumber)
            return 'editFilterTemplate';
        else
            return 'selFilterTemplate';
    };

    $scope.editFilter = function (key) {
        $scope.toolModule.filterInfo = angular.copy(key.x);
    };

    $scope.updateFilter = function (idx) {
        $scope.toolModule.Filters[idx] = angular.copy($scope.toolModule.filterInfo);
        $scope.cancelUpdate();
    };

    $scope.cancelUpdate = function () {
        $scope.toolModule.filterInfo = {};
        $scope.toolModule.filterInfo.OrderNumber = getMaxValue($scope.toolModule.Filters) + 1;
    };

    $scope.moveTopFilter = function (key) {
        var idx = $scope.toolModule.Filters.indexOf(key.x);
        if (idx > -1) {
            $scope.toolModule.Filters.move(idx, idx - 1);
        }
    }

    $scope.moveDownFilter = function (key) {
        var idx = $scope.toolModule.Filters.indexOf(key.x);
        if (idx > -1) {
            $scope.toolModule.Filters.move(idx, idx + 1);
        }
    }

    $scope.getParamTemplate = function (key) {
        if (key.$$hashKey === $scope.toolModule.parameterInfo.hashKey)
            return "editParamTemplate";
        else
            return "selParamTemplate";
    };

    $scope.deleteContentParameter = function (key) {
        var cnfrm = confirm("Do you wish to delete this record!");
        if (cnfrm) {
            if ($scope.toolModule.Procedure.Parameters.indexOf(key.x) > -1) {
                $scope.toolModule.Procedure.Parameters.splice($scope.toolModule.Procedure.Parameters.indexOf(key.x), 1);
            }
            alert('Deleted')
        }
    }

    $scope.updateContentParameter = function (index) {
        $scope.toolModule.Procedure.Parameters[index] = angular.copy($scope.toolModule.parameterInfo);
        $scope.cancelUpdateContentParameter();
    }

    $scope.editContentParameter = function (key) {
        $scope.toolModule.parameterInfo = angular.copy(key.x);
        $scope.toolModule.parameterInfo.hashKey = angular.copy(key.x.$$hashKey);
    }

    $scope.cancelUpdateContentParameter = function () {
        $scope.toolModule.parameterInfo = {};
    }

    $scope.moveTopContentParameter = function (key) {
        var idx = $scope.toolModule.Procedure.Parameters.indexOf(key.x);
        if (idx > -1) {
            $scope.toolModule.Procedure.Parameters.move(idx, idx - 1);
        }
    }

    $scope.moveDownContentParameter = function (key) {
        var idx = $scope.toolModule.Procedure.Parameters.indexOf(key.x);
        if (idx > -1) {
            $scope.toolModule.Procedure.Parameters.move(idx, idx + 1);
        }
    }

    $scope.getWidgetTemplate = function (key, template) {
        if (key.$$hashKey === $scope.toolModule.hashKey)
            return "editWidgetTemplate";
        else
            return "selWidgetTemplate";
    }

    $scope.editWidgetContent = function (key) {
        $scope.toolModule = angular.copy(key.x);
        $scope.toolModule.hashKey = angular.copy(key.x.$$hashKey);
    }

    $scope.UpdateWidgetContent = function (index) {
        $scope.toolWidgets[index] = angular.copy($scope.toolModule);
    }

    //$scope.cancelWidgetUpdate = function () {      
    //    $scope.toolModule.widgetType= "",
    //    $scope.toolModule.widgetName= "",
    //    $scope.toolModule.IsProcedure= false,
    //    $scope.toolModule.ProcedureName= '',
    //    $scope.toolModule.Filters= [],
    //    $scope.toolModule.IsFilterProcedure= false,
    //    $scope.toolModule.Procedure={},        
    //    $scope.toolModule.IgnoreColumn={},
    //    $scope.toolModule.filterInfo= {},
    //    $scope.toolModule.parameterInfo = {}
    //}

    $scope.deleteWidget = function (key) {
        var cnfrm = confirm("Do you wish to delete this record!");
        if (cnfrm) {
            if ($scope.toolWidgets.indexOf(key.x) > -1) {
                $scope.toolWidgets.splice($scope.toolWidgets.indexOf(key.x), 1);
            }
            alert('Deleted')
        }
    }

    $scope.toolWidgets = [];

    $scope.toolModule = {
        hashKey: "",
        module: '',
        configFor: '',
        widgetType: "",
        widgetName: "",
        IsProcedure: false,
        ProcedureName: '',
        Filters: [],
        IsFilterProcedure: false,
        Procedure: {
            Name: "",
            Parameters: [],
            SeriesColumn: "",
            XAxisColumn: "",
            YAxisColumn: "",
            ZAxisColumn: "",
            IgnoreColumns: []
        },

        IgnoreColumn: {
            IgnoreColumnText: "",
        },

        filterInfo: {
            OrderNumber: 1,
            Label: '',
            IsMultiSelect: true,
            IsRequired: true,
            Image: '',
            IsTimePeriod: false,
            IsFilterBasedOnOtherFilter: false,
            HideTrend: false,
            Database: {
                Table: '',
                PrimaryKey: '',
                DisplayTextColumnName: '',
                ParentPrimaryKey: '',
                ParentText: '',
                WhereCondition: '',
                SelectableColumnName: ''
            }
        },

        parameterInfo: {
            hashKey: "",
            FilterLabel: "",
            Format: "",
            DefaultValue: "",
            Prefix: "",
            Postfix: "",
            CustomPropertyLabel: ""
        }
    }

    $scope.toolModule.filterInfo.OrderNumber = getMaxValue($scope.toolModule.Filters) + 1;

    build = function () {
        $http.get('/Tool/GetProc').then(function (data) {
            $scope.chartOptions.ProcedureName = data.data;
        });

        $http.get('/Tool/GetTable').then(function (data) {
            if (data.data != null) {
                $(data.data).each(function (a, ad) {
                    $scope.chartOptions.Tables.push({ Name: ad, cols: [] });

                });
            }
            else
                $scope.chartOptions.Tables = data.data;
        });
    }

    $scope.chartOptionsTableChange = function () {
        var tempdataexists = false;
        $scope.chartOptions.TableCols = [];

        if ($scope.toolModule.filterInfo.Database.Table == null ||
                $scope.toolModule.filterInfo.Database.Table == '' ||
                    $scope.toolModule.filterInfo.Database.Table == undefined)
            return;

        if ($scope.chartOptions.Tables != null) {
            $($scope.chartOptions.Tables).each(function (a, ad) {
                if ($scope.toolModule.filterInfo.Database.Table == ad.Name && ad.cols.length > 0) {
                    $scope.chartOptions.TableCols = ad.cols;
                    tempdataexists = true;
                }
            });
        }

        if (!tempdataexists)
            $http.get('/Tool/GetCol/?tableName=' + $scope.toolModule.filterInfo.Database.Table).then(function (data) {
                if ($scope.chartOptions.Tables != null) {
                    $($scope.chartOptions.Tables).each(function (a, ad) {
                        if ($scope.toolModule.filterInfo.Database.Table == ad.Name) {
                            ad.cols = data.data;
                            $scope.chartOptions.TableCols = ad.cols;
                        }
                    });
                }
            });

    }

    $scope.getFilterLabels = function () {
        $http.get('/Tool/GetFilterLabels/?module=' + $scope.toolModule.module).then(function (data) {
            $scope.chartOptions.FilterLabels = data.data;
        });
    }

    $scope.getFilterInfo = function (key) {
        $http.get('/Tool/GetFilterInfo/?module=' + $scope.toolModule.module).then(function (data) {
            var tm = $scope.toolModule;
            //filter area
            tm.IsProcedure = null; tm.ProcedureName = null; tm.Filters = []; tm.IsFilterProcedure = null;
            //content area
            tm.Procedure.Name = null; tm.Procedure.Parameters = []; tm.Procedure.SeriesColumn = null;
            tm.Procedure.XAxisColumn = null; tm.Procedure.YAxisColumn = null; tm.Procedure.ZAxisColumn = null;
            if (data != null && data.data != null) {
                //filter area
                tm.IsProcedure = data.data.IsProcedure;
                tm.ProcedureName = data.data.ProcedureName;
                if (data.data.Filter != null) {
                    tm.Filters = data.data.Filter.Filters;
                    tm.IsFilterProcedure = data.data.Filter.IsProcedure;
                }

                //content area for other module
                if (data.data.Procedure != null) {
                    tm.Procedure.Name = data.data.Procedure.Name;
                    tm.Procedure.Parameters = data.data.Procedure.Parameters;
                    tm.Procedure.SeriesColumn = data.data.Procedure.SeriesColumn;
                    tm.Procedure.XAxisColumn = data.data.Procedure.XAxisColumn;
                    tm.Procedure.YAxisColumn = data.data.Procedure.YAxisColumn;
                    tm.Procedure.ZAxisColumn = data.data.Procedure.ZAxisColumn;
                    tm.Procedure.IgnoreColumns = data.data.Procedure.IgnoreColumns;
                }
                //content area for snapshot module
                if ($scope.toolModule.module.toLowerCase() == 'snapshot') {
                    if (data.data.Widgets != null) {
                        $.each(data.data.Widgets, function (index, obj) {
                            $scope.toolWidgets.push(angular.copy(obj));
                        });
                    }
                }
                $scope.toolModule.filterInfo.OrderNumber = data.data.Filter == undefined ? 1 : getMaxValue(data.data.Filter.Filters) + 1;
                reset(key);
            }
        });
    }
    build();
}]);

var reset = function (key) {
    var scope = angular.element('[ng-controller=toolController]').scope();
    scope.toolModule.configFor = '';
    scope.toolModule.widgetType = '';
    scope.toolModule.widgetName = '';
}

var getMaxValue = function (jsonarray) {
    var max = 0;
    if (jsonarray == null || jsonarray.length == 0)
        max = 0;
    else
        $(jsonarray).each(function (p, pd) {
            if (max < pd.OrderNumber)
                max = pd.OrderNumber;
        });
    return max;
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};