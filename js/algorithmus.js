'use strict';

function Vertex(name) {
    // Vertex properties
    this.name = name;
    this.neighbors = [];

    // State in algorithmus
    this.prev = null;
    this.dist = Number.POSITIVE_INFINITY;
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
                dist: distance
            }
        );

        vertex2.neighbors.push(
            {
                vertex: vertex1,
                dist: distance
            }
        );
    }
}

function DijkstraAlgorithmus(graph, start) {
    this.status = 'start';

    // variables for display
    this.Q = "?";
    this.u = "?";
    this.uNeighbors = "?";
    this.v = "?";
    this.dist = "?";
    this.distQ = "?";
    this.prev = "?";
    this.lengthUV = "?";
    this.alt = "?";

    // actual variables to work with
    var vars = {
        Q: [],
        u: null,
        v: null,
        forNeighborIndex: 0
    };

    var me = this;

    function getName(obj) {
        return (obj == null ? "null" : obj.name);
    }

    // update varaiables for display
    var update = function () {
        // update Q
        me.Q = "[";
        vars.Q.forEach(function (v, i) {
            if (i != 0) { me.Q += ", "; }
            me.Q += v.name;
        });
        me.Q += "]";

        // update dist
        me.dist = "";
        graph.vertices.forEach(function (v, i) {
            if (i != 0) { me.dist += "\n"; }
            me.dist += "dist[" + v.name + "] = " + v.dist;
        });

        // update distQ
        me.distQ = "";
        vars.Q.forEach(function (v, i) {
            if (i != 0) { me.distQ += "\n"; }
            me.distQ += "dist[" + v.name + "] = " + v.dist;
        });

        // update prev
        me.prev = "";
        graph.vertices.forEach(function (v, i) {
            if (i != 0) { me.prev += "\n"; }
            me.prev += "prev[" + v.name + "] = " + getName(v.prev);
        });

        // update u
        me.u = getName(vars.u);

        // update v
        me.v = getName(vars.v);

        // update uNeighbors
        me.uNeighbors = "neighbors of "+getName(vars.u)+": ";
        vars.u.neighbors.forEach(function (edge, i) {
            me.uNeighbors += "\n" + getName(edge.vertex) + " dist: " + edge.dist;
        });
    }

    this.next = function () {
        // TODO: implement real stuff
        if (this.status == 'start') {
            // move to next status
            this.status = 'init';

            // do init stuff:
            graph.vertices.forEach(function (v) { vars.Q.push(v); })
            start.dist = 0;

        }
        else if (this.status == 'init') {
            // move to next status
            this.status = 'while';

            // nothing to do here
        }
        else if (this.status == 'while') {
            // check to which status to move next
            if (vars.Q.length == 0) {
                this.status = 'return';
            }
            else {
                this.status = 'getmin';

                // find vertex u in Q with minimum dist[u]
                vars.u = vars.Q[0];
                vars.Q.forEach(function (v) {
                    if (vars.u.dist > v.dist) {
                        vars.u = v;
                    }
                });
            }
        }
        else if (this.status == 'getmin') {
            // move to next status
            this.status = 'remove';

            // remove u from Q
            vars.Q.remove(vars.u);
        }
        else if (this.status == 'remove') {
            // move to next status
            this.status = 'forneighbor';

            // start with first neighbor
            vars.forNeighborIndex = 0;
            
            if (u.neighbors.length == 0) {
                vars.v = null;
            }
            else {
                vars.v = u.neighbors[vars.forNeighborIndex];
            }
        }
        else if (this.status == 'forneighbor') { this.status = 'calcalt'; }
        else if (this.status == 'calcalt') { this.status = 'comparedist'; }
        else if (this.status == 'comparedist') { this.status = 'assigndist'; }
        else if (this.status == 'assigndist') { this.status = 'return'; }
        else if (this.status == 'return') { this.status = 'start'; }

        update(); // update variables for display
    }
}