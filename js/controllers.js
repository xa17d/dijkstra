'use strict';

angular.module('dijkstraApp', ['ngMaterial', 'ngAnimate', 'ui.bootstrap'])

    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('amber');
    })

    .controller('MainController', ['$scope', '$mdDialog', '$mdSidenav', function ($scope, $mdDialog, $mdSidenav) {

        $scope.drawVertex = true;

        $scope.toggleNode = function() {
            $mdSidenav('node').toggle();
        }
        $scope.isOpenNode = function(){
            return $mdSidenav('node').isOpen();
        };

        $scope.toggleEdge = function() {
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

        var graph = new Graph();

        var a = new Vertex("A");
        var b = new Vertex("B");
        var c = new Vertex("C");
        var d = new Vertex("D");
        var e = new Vertex("E");

        graph.addVertices(a,b,c,d,e);
        graph.addEdge(a, b, 2);
        graph.addEdge(a, c, 2);
        graph.addEdge(b, d, 4);
        graph.addEdge(c, d, 1);
        graph.addEdge(d, e, 3);

        $scope.reset = function () {
            $scope.algorithmus = new DijkstraAlgorithmus(graph, a);
        }

        $scope.next = function () {
            $scope.algorithmus.nextStep();
        }

        // visualization stuff

        $scope.hlLine = function (line) {
            return { 'line-highlight': $scope.algorithmus.currentStep.lines.contains(line) };
        }

        // init
        $scope.reset();

    }])

    .controller('VertexSidenavCtrl', function ($scope, $timeout, $mdSidenav) {

        $scope.close = function () {
            $mdSidenav('node').close();
        };
    })

    .controller('EdgeSidenavCtrl', function ($scope, $timeout, $mdSidenav) {

        $scope.close = function () {
            $mdSidenav('edge').close();
        };
    });