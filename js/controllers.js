'use strict';

angular.module('dijkstraApp')

    .controller('MainController', ['$scope', '$mdDialog', '$mdSidenav', '$interval', 'graph', 'algorithm', function ($scope, $mdDialog, $mdSidenav, $interval, graph, algorithm) {

        $scope.drawVertex = true;
        $scope.runInterval = 1;     // in seconds

        $scope.toggleMenu = function() {
            $mdSidenav('menu').toggle();
        }
        $scope.isOpenMenu = function(){
            return $mdSidenav('menu').isOpen();
        };

        $scope.activeVertex = null;
        $scope.toggleVertex = function(vertex) {
            $scope.activeVertex = (typeof vertex !== 'undefined') ? vertex : null;
            $mdSidenav('vertex').toggle();
        }
        $scope.isOpenVertex = function(){
            return $mdSidenav('vertex').isOpen();
        };

        $scope.activeEdge = null;
        $scope.toggleEdge = function(edge) {
            $scope.activeEdge = (typeof edge !== 'undefined') ? edge : null;
            $mdSidenav('edge').toggle();
        }
        $scope.isOpenEdge = function(){
            return $mdSidenav('edge').isOpen();
        };

        var originatorEv;
        $scope.openMore = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.showSources = function() {
            $mdDialog.show(
                $mdDialog.alert()
                    .targetEvent(originatorEv)
                    .clickOutsideToClose(true)
                    .parent('body')
                    .title('Sources')
                    .textContent('https://en.wikipedia.org/wiki/Dijkstra\'s_algorithm')
                    .ok('OK')
            );
            originatorEv = null;
        };

        $scope.showAuthors = function() {
            $mdDialog.show(
                $mdDialog.alert()
                    .targetEvent(originatorEv)
                    .clickOutsideToClose(true)
                    .parent('body')
                    .title('Authors')
                    .textContent('Daniel Gehrer && Lucas Dobler')
                    .ok('OK')
            );
            originatorEv = null;
        };

        $scope.graph = graph;

        $scope.$watch('activeVertex.name', function () {
            graph.refresh();
        });

        $scope.$watch('activeEdge.weight', function () {
            graph.refresh();
        });


        $scope.algorithm = algorithm;

        // -------------------------------

        $scope.reset = function () {
            algorithm.reset();
        }

        $scope.next = function () {
            algorithm.nextStep();
        }

        $scope.runnable = null;
        $scope.run = function () {
            $scope.runnable = $interval(function () {
                $scope.next();
            }, $scope.runInterval * 1000);
        }

        $scope.stopRun = function() {
            $interval.cancel($scope.runnable);
            $scope.runnable = null;
        }

        // visualization stuff

        $scope.hlLine = function (line) {
            return { 'line-highlight': algorithm.currentStep.lines.contains(line) };
        }

        // init
        $scope.reset();

    }])

    .controller('MenuSidenavCtrl', ['$scope', 'graph', function ($scope, graph) {

        $scope.import = function () {

            //TODO
        };

        $scope.export = function () {

            // TODO
        }
    }])

    .controller('VertexSidenavCtrl', function ($scope, $mdSidenav) {

        $scope.close = function () {
            $mdSidenav('node').close();
        };
    })

    .controller('EdgeSidenavCtrl', function ($scope, $mdSidenav) {

        $scope.close = function () {
            $mdSidenav('edge').close();
        };
    });