'use strict';

var app = angular.module('dijkstraApp', ['ngAnimate', 'ui.bootstrap']);

app.controller('MainController', ['$scope', function ($scope) {

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

    var algorithmus = new DijkstraAlgorithmus(graph, a);

    $scope.algorithmus = algorithmus;

    $scope.name = "World";
    $scope.line = 10;

}]);