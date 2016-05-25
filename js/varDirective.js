'use strict';

angular.module('dijkstraApp')

.directive('v', function () {
    var directive = {};

    directive.restrict = 'E'; /* restrict this directive to elements */
    directive.templateUrl = 'var.html';
    directive.scope = {
        info: "=info",
    };

    directive.controller = ['$scope', function ($scope) {

    }];
    return directive;
});