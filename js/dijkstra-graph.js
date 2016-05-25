'use strict';

angular.module('dijkstraApp')

.provider('graph', function() {

    var id = 0
    var listeners = [];
    var vertices = [];
    var edges = [];
    
    this.addVertex = function(vertex) {
        vertex.id = getNewId();
        vertices.push(vertex);
        notifyListeners();
    };
    this.addEdge = function(edge) {
        // TODO check for duplicates

        edge.id = getNewId();
        edges.push(edge);
        notifyListeners();
    };

    this.getVertices = function() {
        return vertices;
    }
    this.getEdges = function() {
        return edges;
    }

    this.getVertex = function(id) {
        var result = {};
        angular.forEach(vertices, function(vertex) {
            if(vertex.id = id) {
                result = vertex;
            }
        });
        return result;
    };
    this.getEdge = function(id) {
        var result = {};
        angular.forEach(edges, function(edge) {
            if(edge.id = id) {
                result = edge;
            }
        });
        return result;
    };

    this.addListener = function (listener){
        listeners.push(listener);
    }

    this.clear = function() {
        vertices = [];
        edges = [];
    };


    function getNewId() {
        id++;
        return id;
    }

    function notifyListeners() {
        angular.forEach(listeners, function (listener) {
            listener();
        });
    }

    this.$get = function() {
        return this;
    };
});