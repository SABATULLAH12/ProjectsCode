/// <reference path="angular.js" />
/// <reference path="jquery-2.2.3.min.js" />
/// <reference path="master-theme.js" />

angular.module("mainApp").controller("reportController", ["$scope", "$http", function ($scope) {
    $scope.buildMenu = function () {
        $.get(appRouteUrl + "Report/GetMenu", null, function (response) {
        });
    }

    $scope.report = {
        
        buildOutput: function () {

        }
    }

    $scope.buildMenu();
}]);