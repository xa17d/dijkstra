'use strict';

angular.module('dijkstraApp')

.provider('graph', function() {

    var id = 0
    var listeners = [];
    var vertices = [];
    var edges = [];
    
    this.addVertex = function(vertex) {
        vertex.id = getNewId();
        vertex.name = 'V' + vertex.id;
        vertex.isStart = (vertices.length === 0);
        vertices.push(vertex);
        setEnd(vertex);
        //notifyListeners();        //no notifier necessary, because 'setEnd()' also notifies listeners after finishing
    };
    this.addEdge = function(edge) {
        // TODO check for duplicates

        edge.id = getNewId();
        edge.name = 'E' + edge.id;
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

    this.removeVertex = function(vertex) {
        angular.forEach(vertices, function (v) {
            if(v.id === vertex.id) {
                vertices.splice(vertices.indexOf(v), 1);
                notifyListeners();
                return;
            }
        })
    };
    this.removeEdge = function(edge) {
        angular.forEach(edges, function (e) {
            if(e.id === edge.id) {
                edges.splice(edges.indexOf(e), 1);
                notifyListeners();
                return;
            }
        })
    };

    this.setStart = function (vertex) {
        angular.forEach(vertices, function (v) {
            v.isStart = (v.id === vertex.id);
        });
        notifyListeners();
    };

    this.setEnd = function (vertex) {
        angular.forEach(vertices, function (v) {
            v.isEnd = (v.id === vertex.id);
        });
        notifyListeners();
    };

    this.addListener = function (listener){
        listeners.push(listener);
    }

    this.refresh = function() {
        notifyListeners();
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