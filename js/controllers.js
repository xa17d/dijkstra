'use strict';

angular.module('dijkstraApp', ['ngMaterial', 'ngAnimate', 'ui.bootstrap'])

    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('amber');
    })

    .controller('MainController', ['$scope', '$mdDialog', '$mdSidenav', '$interval', 'graph', function ($scope, $mdDialog, $mdSidenav, $interval, graph) {

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

        // -------------------------------

        /* Create Example Graph

                 2
            A ------- B
            |         |
            | 2       | 4
            |         |
            C ------- D-------E
                1         3
        */

        var graphOld = new Graph();

        var a = new Vertex("A");
        var b = new Vertex("B");
        var c = new Vertex("C");
        var d = new Vertex("D");
        var e = new Vertex("E");

        graphOld.addVertices(a,b,c,d,e);
        graphOld.addEdge(a, b, 2);
        graphOld.addEdge(a, c, 2);
        graphOld.addEdge(b, d, 4);
        graphOld.addEdge(c, d, 1);
        graphOld.addEdge(d, e, 3);

        $scope.reset = function () {
            $scope.algorithmus = new DijkstraAlgorithmus(graphOld, a);
        }

        $scope.next = function () {
            $scope.algorithmus.nextStep();
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
            return { 'line-highlight': $scope.algorithmus.currentStep.lines.contains(line) };
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