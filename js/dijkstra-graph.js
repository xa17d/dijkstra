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
        if(vertices.length > 1) {
            this.setEnd(vertex);
        }
        //notifyListeners();        //no notifier necessary, because 'setEnd()' also notifies listeners after finishing
    };
    this.addEdge = function(edge) {
        // TODO check for duplicates

        edge.id = getNewId();
        edge.name = 'E' + edge.id;
        // edge.weight = NaN; // weight should be set in parameter object?
        edges.push(edge);
        notifyListeners();
    };

    this.getVertices = function() {
        return vertices;
    }
    this.getEdges = function() {
        return edges;
    }

    this.getVertexNeighbors = function (vertex) {
        var result = [];
        angular.forEach(edges, function (edge) {
            if (edge.vertex1.id == vertex.id) {
                result.push({
                    vertex: edge.vertex2,
                    dist: edge.weight * 1.0 // ensure it's a Number (sometimes the user input is stored as String in the variable)
                });
            }
            else if (edge.vertex2.id == vertex.id) {
                result.push({
                    vertex: edge.vertex1,
                    dist: edge.weight * 1.0 // ensure it's a Number (sometimes the user input is stored as String in the variable)
                });
            }
        });
        return result;
    };

    this.getVertex = function(id) {
        var result = {};
        angular.forEach(vertices, function(vertex) {
            if(vertex.id = id) {
                result = vertex;
                return;
            }
        });
        return result;
    };
    this.getEdge = function(id) {
        var result = {};
        angular.forEach(edges, function(edge) {
            if(edge.id = id) {
                result = edge;
                return;
            }
        });
        return result;
    };
    this.getStartVertex = function () {
        var result = {};
        angular.forEach(vertices, function (vertex) {
            if (vertex.isStart) {
                result = vertex;
                return;
            }
        });
        return result;
    };

    this.removeVertex = function(vertex) {
        vertices.splice(vertices.indexOf(this.getVertex(vertex.id)), 1);
        notifyListeners();
    };
    this.removeEdge = function(edge) {
        edges.splice(edges.indexOf(this.getEdge(edge.id)), 1);
        notifyListeners();
    };

    this.setStart = function (vertex) {
        angular.forEach(vertices, function (v) {
            v.isStart = this.equals(v, vertex);
        }, this);
        notifyListeners();
    };

    this.setEnd = function (vertex) {
        angular.forEach(vertices, function (v) {
            v.isEnd = this.equals(v, vertex);
        }, this);
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

    this.equals = function (o1, o2) {
        if(typeof o1.id !== 'undefined' && typeof o2.id !== 'undefined') {
            return o1.id === o2.id;
        }

        return false;
    }


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