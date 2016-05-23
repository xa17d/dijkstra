'use strict';

function Vertex(name) {
    // Vertex properties
    this.name = name;
    this.neighbors = [];

    // State in algorithmus
    this.previous = null;
    this.distance = Number.POSITIVE_INFINITY;
}

function Graph() {
    this.vertices = [];
    this.addVertices = function () {
        for (var i = 0; i < arguments.length; i++) {
            this.vertices.push(arguments[i]);
        }
    }

    this.addEdge = function (vertex1, vertex2, distance) {
        vertex1.neighbors.push(
            {
                vertex: vertex2,
                distance: distance
            }
        );

        vertex2.neighbors.push(
            {
                vertex: vertex1,
                distance: distance
            }
        );
    }
}

function DijkstraAlgorithmus(graph, start) {
    this.status = 'start';

    this.next = function () {
        // TODO: implement real stuff
        if (this.status == 'start') { this.status = 'init'; }
        else if (this.status == 'init') { this.status = 'while'; }
        else if (this.status == 'while') { this.status = 'getmin'; }
        else if (this.status == 'getmin') { this.status = 'remove'; }
        else if (this.status == 'remove') { this.status = 'forneighbor'; }
        else if (this.status == 'forneighbor') { this.status = 'calcalt'; }
        else if (this.status == 'calcalt') { this.status = 'comparedist'; }
        else if (this.status == 'comparedist') { this.status = 'assigndist'; }
        else if (this.status == 'assigndist') { this.status = 'return'; }
        else if (this.status == 'return') { this.status = 'start'; }
    }
}