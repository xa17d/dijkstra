'use strict';

angular.module('dijkstraApp')

    .controller('MainController', ['$scope', '$mdDialog', '$mdSidenav', '$interval', 'graph', 'algorithm', function ($scope, $mdDialog, $mdSidenav, $interval, graph, algorithm) {

        $scope.drawVertex = true;
        $scope.runInterval = 100;     // this is 1 second

        $scope.algorithm = algorithm;
        $scope.graph = graph;

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

        $scope.$watch('activeVertex.name', function () {
            graph.refresh();
        });

        $scope.$watch('activeEdge.weight', function () {
            graph.refresh();
        });

        graph.addListener(function() {
            $scope.vertices = graph.getVertices();
        });

        // -------------------------------

        // init graph
        graph.import(defaultGraph);

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
            }, 1000 * 100 / $scope.runInterval);        // interval from 10s to 1/10s per step
        };

        $scope.stopRun = function () {
            $interval.cancel($scope.runnable);
            $scope.runnable = null;
        };

        $scope.hlLine = function (line) {
            return { 'line-highlight': algorithm.currentStep.lines.contains(line) };
        };

        $scope.showInfo = function () {
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.close = function () {
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'dialog/info.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                fullscreen: true
            });
        };

        // show information on page loading
        $scope.showInfo();
    }])

    .controller('MenuSidenavCtrl', ['$scope', '$mdDialog', '$mdSidenav', 'graph', function ($scope, $mdDialog, $mdSidenav, graph) {

        $scope.import = function (ev) {
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.load = function () {
                        graph.import($scope.data);
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'dialog/import.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: false
            });
        };

        $scope.export = function (ev) {
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.data = graph.export();
                    $scope.close = function () {
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'dialog/export.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: false
            });
        };

        $scope.close = function () {
            $mdSidenav('menu').close();
        }

        $scope.random = function () {
            graph.clear();

            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 11; j++) {
                    graph.addVertex({
                        coordinateX: 30 + j * 70,
                        coordinateY: 30 + i * 70
                    });
                }
            }

            for (var i = 0; i < 100; i++) {
                var v1 = graph.getVertices()[Math.floor(Math.random() * graph.getVertices().length)];
                var v2 = graph.getVertices()[Math.floor(Math.random() * graph.getVertices().length)];
                graph.addEdge({
                    vertex1: v1,
                    vertex2: v2,
                    weight: Math.floor(Math.random() * 20)
                });
            }
        };
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

var defaultGraph = JSON.stringify(
    {
        vertices: [
            {
                "id": 15,
                "coordinateX": 99,
                "coordinateY": 74,
                "name": "V15",
                "isStart": true,
                "isEnd": false
            },
            {
                "id": 16,
                "coordinateX": 267,
                "coordinateY": 44,
                "name": "V16",
                "isStart": false,
                "isEnd": false
            },
            {
                "id": 17,
                "coordinateX": 95,
                "coordinateY": 212,
                "name": "V17",
                "isStart": false,
                "isEnd": false
            },
            {
                "id": 18,
                "coordinateX": 274,
                "coordinateY": 278,
                "name": "V18",
                "isStart": false,
                "isEnd": false
            },
            {
                "id": 19,
                "coordinateX": 439,
                "coordinateY": 209,
                "name": "V19",
                "isStart": false,
                "isEnd": false
            },
            {
                "id": 20,
                "coordinateX": 436,
                "coordinateY": 67,
                "name": "V20",
                "isStart": false,
                "isEnd": false
            },
            {
                "id": 21,
                "coordinateX": 535,
                "coordinateY": 167,
                "name": "V21",
                "isStart": false,
                "isEnd": true
            }
        ],
        edges: [
            {
                "vertex1": 17,
                "vertex2": 15,
                "weight": 138
            },
            {
                "vertex1": 18,
                "vertex2": 17,
                "weight": 191
            },
            {
                "vertex1": 19,
                "vertex2": 18,
                "weight": 179
            },
            {
                "vertex1": 21,
                "vertex2": 19,
                "weight": 105
            },
            {
                "vertex1": 20,
                "vertex2": 21,
                "weight": 141
            },
            {
                "vertex1": 19,
                "vertex2": 20,
                "weight": 142
            },
            {
                "vertex1": 16,
                "vertex2": 20,
                "weight": 171
            },
            {
                "vertex1": 15,
                "vertex2": 16,
                "weight": 171
            },
            {
                "vertex1": 18,
                "vertex2": 15,
                "weight": 269
            },
            {
                "vertex1": 18,
                "vertex2": 16,
                "weight": 234
            },
            {
                "vertex1": 20,
                "vertex2": 18,
                "weight": 266
            }
        ]
    }
);