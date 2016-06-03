'use strict';

angular.module('dijkstraApp')

.provider('graph', function() {

    var id = 0
    var listeners = [];
    var vertices = [];
    var edges = [];

    this.algorithm = null;
    
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
        var graph = this;
        angular.forEach(edges, function (edge) {
            if (graph.equals(edge.vertex1, vertex)) {
                result.push({
                    vertex: edge.vertex2,
                    edge: edge,
                    dist: edge.weight * 1.0 // ensure it's a Number (sometimes the user input is stored as String in the variable)
                });
            }
            else if (graph.equals(edge.vertex2, vertex)) {
                result.push({
                    vertex: edge.vertex1,
                    edge: edge,
                    dist: edge.weight * 1.0 // ensure it's a Number (sometimes the user input is stored as String in the variable)
                });
            }
        });
        return result;
    };
    this.getEdgeFromVertexToVertex = function (vertex1, vertex2) {
        var result = null;
        var graph = this;
        angular.forEach(edges, function (edge) {
            if (graph.equals(edge.vertex1, vertex1) && graph.equals(edge.vertex2, vertex2) ||
                graph.equals(edge.vertex1, vertex2) && graph.equals(edge.vertex2, vertex1)) {
                result = edge;
            }
        });
        return result;
    }

    this.getVertex = function(id) {
        var result = {};
        angular.forEach(vertices, function(vertex) {
            if(vertex.id == id) {
                result = vertex;
                return;
            }
        });
        return result;
    };
    this.getEdge = function(id) {
        var result = {};
        angular.forEach(edges, function(edge) {
            if(edge.id == id) {
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
    this.getEndVertex = function () {
        var result = {};
        angular.forEach(vertices, function (vertex) {
            if (vertex.isEnd) {
                result = vertex;
                return;
            }
        });
        return result;
    };

    this.removeVertex = function (vertex) {
        var v = this.getVertex(vertex.id);

        // at first, remove neighboring edges
        var graph = this;
        var neighbors = this.getVertexNeighbors(v);
        neighbors.forEach(function(n) {
            graph.removeEdge(n.edge);
        });

        // remove vertex
        vertices.splice(vertices.indexOf(v, 1), 1);

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
        notifyListeners();
    };

    this.export = function () {
        return
            "TODO";

        // TODO: remove style information before exporting
    };
    this.import = function (json) {
        var data = JSON.parse(json);
        var graph = this;

        vertices = [];
        data.vertices.forEach(function (v) {
            vertices.push(v);
            id = Math.max(v.id, id) + 1; // make sure that no duplicate ids are generated after import
        });


        edges = [];

        
        data.edges.forEach(function (e) {
            var newEdge = {
                weight: e.weight,
                vertex1: graph.getVertex(e.vertex1),
                vertex2: graph.getVertex(e.vertex2),
            };
            graph.addEdge(newEdge);
        });

        // TODO: data validation?

        notifyListeners();
    };

    this.equals = function (o1, o2) {
        if(o1 != null && o2 != null && typeof o1.id !== 'undefined' && typeof o2.id !== 'undefined') {
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