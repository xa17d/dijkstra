'use strict';

angular.module('dijkstraApp')

    .controller('MainController', ['$scope', '$mdDialog', '$mdSidenav', '$interval', 'graph', 'algorithm', function ($scope, $mdDialog, $mdSidenav, $interval, graph, algorithm) {

        $scope.drawVertex = true;
        $scope.runInterval = 1;     // in seconds

        $scope.toggleMenu = function () {
            $mdSidenav('menu').toggle();
        }
        $scope.isOpenMenu = function () {
            return $mdSidenav('menu').isOpen();
        };

        $scope.activeVertex = null;
        $scope.toggleVertex = function (vertex) {
            $scope.activeVertex = (typeof vertex !== 'undefined') ? vertex : null;
            $mdSidenav('vertex').toggle();
        }
        $scope.isOpenVertex = function () {
            return $mdSidenav('vertex').isOpen();
        };

        $scope.activeEdge = null;
        $scope.toggleEdge = function (edge) {
            $scope.activeEdge = (typeof edge !== 'undefined') ? edge : null;
            $mdSidenav('edge').toggle();
        }
        $scope.isOpenEdge = function () {
            return $mdSidenav('edge').isOpen();
        };

        var originatorEv;
        $scope.openMore = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.showSources = function () {
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

        $scope.showAuthors = function () {
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

        // init graph
        graph.import(
            JSON.stringify(
                {
                    vertices: [
                        { "coordinateX": 100, "coordinateY": 350, "id": 1, "name": "A", "isStart": true, "isEnd": false },
                        { "coordinateX": 300, "coordinateY": 350, "id": 2, "name": "B", "isStart": false, "isEnd": false },
                        { "coordinateX": 300, "coordinateY": 150, "id": 3, "name": "C", "isStart": false, "isEnd": false },
                        { "coordinateX": 500, "coordinateY": 150, "id": 4, "name": "D", "isStart": false, "isEnd": false },
                        { "coordinateX": 500, "coordinateY": 350, "id": 5, "name": "E", "isStart": false, "isEnd": false },
                        { "coordinateX": 700, "coordinateY": 150, "id": 6, "name": "F", "isStart": false, "isEnd": true }
                    ],
                    edges: [
                        { vertex1: 1, vertex2: 2, weight: 5 },
                        { vertex1: 2, vertex2: 3, weight: 5 },
                        { vertex1: 2, vertex2: 5, weight: 5 },
                        { vertex1: 2, vertex2: 4, weight: 7 },
                        { vertex1: 3, vertex2: 4, weight: 5 },
                        { vertex1: 4, vertex2: 5, weight: 5 },
                        { vertex1: 4, vertex2: 6, weight: 5 }
                    ]
                }
            )
            );

        $scope.resetGraph = function () {
            graph.clear();
        };

        $scope.resetAlgorithm = function () {
            algorithm.reset();
        };

        $scope.next = function () {
            algorithm.nextStep();
        };

        $scope.runnable = null;
        $scope.run = function () {
            $scope.runnable = $interval(function () {
                $scope.next();
            }, $scope.runInterval * 1000);
        };

        $scope.stopRun = function () {
            $interval.cancel($scope.runnable);
            $scope.runnable = null;
        };

        // visualization stuff

        $scope.hlLine = function (line) {
            return { 'line-highlight': algorithm.currentStep.lines.contains(line) };
        };

    }])

    .controller('MenuSidenavCtrl', ['$scope', 'graph', function ($scope, graph) {

        $scope.import = function () {

            //TODO
        };

        $scope.export = function () {

            alert(graph.export());
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