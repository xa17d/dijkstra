'use strict';

function DijkstraAlgorithmus(graph) {

    var source = graph.getStartVertex();

    // variables for algorithmus
    this.Q = null;
    this.u = null;
    this.v = null;
    this.lengthUV = null;
    this.alt = null;

    // variables for algorithmus but prepared to display to the user
    this.display = {
        Q: '?',
        u: '?',
        v: '?',
        lengthUV: '?',
        alt: '?',
        dist: '?',
        prev: '?',
        distQ: '?',
        uNeighbors: '?'
    };

    // make this algorithmus referencable in inner methods
    var algorithmus = this;

    // update display variables
    var updateDisplay = function () {

        var getName = function (obj) { return obj == null ? "?" : obj.name; }

        // Q
        algorithmus.display.Q = "[";
        algorithmus.Q.forEach(function (v, i) {
            if (i != 0) { algorithmus.display.Q += ", "; }
            algorithmus.display.Q += getName(v);
        });
        algorithmus.display.Q += "]";

        // u
        algorithmus.display.u = getName(algorithmus.u);

        // uNeighbors
        if (algorithmus.u == null) {
            algorithmus.display.uNeighbors = '?';
        } else {
            algorithmus.display.uNeighbors = 'Neighbors of ' + algorithmus.u.name;
            graph.getVertexNeighbors(algorithmus.u).forEach(function (edge, i) {
                algorithmus.display.uNeighbors += "\n" + edge.vertex.name + "  dist: " + edge.dist;
            });
        }

        // v
        algorithmus.display.v = getName(algorithmus.v);

        // lengthUV
        algorithmus.display.lengthUV = (algorithmus.lengthUV == null ? "?" : algorithmus.lengthUV);

        // alt
        algorithmus.display.alt = (algorithmus.alt == null ? "?" : algorithmus.alt);

        // dist
        algorithmus.display.dist = "";
        graph.getVertices().forEach(function (v, i) {
            if (i != 0) { algorithmus.display.dist += "\n"; }
            algorithmus.display.dist += "dist[" + v.name + "] = " + v.dist;
        });

        // distQ
        algorithmus.display.distQ = "";
        algorithmus.Q.forEach(function (v, i) {
            if (i != 0) { algorithmus.display.distQ += "\n"; }
            algorithmus.display.distQ += "dist[" + v.name + "] = " + v.dist;
        });

        // prev
        algorithmus.display.prev = "";
        graph.getVertices().forEach(function (v, i) {
            if (i != 0) { algorithmus.display.prev += "\n"; }
            algorithmus.display.prev += "prev[" + v.name + "] = " + getName(v.prev);
        });
    };

    // Here are the steps defined for the algorithmus:
    this.steps = {
        start: {
            /// Start ///
            name: 'start',
            lines: [1],
            run: function () {
                // nothing to do.
            },
            next: function () {
                return algorithmus.steps.init;
            }
        },
        init: {
            /// Init ///
            name: 'init',
            lines: [3, 4, 5, 6, 7, 8, 9, 10],
            run: function () {

                algorithmus.Q = [];                         //: create vertex set Q
                graph.getVertices().forEach(function (v) {  //: for each vertex v in Graph
                    v.dist = Number.POSITIVE_INFINITY;      //:     dist[v] = INFINITY
                    v.prev = null;                          //:     dist[v] = UNDEFINED
                    algorithmus.Q.push(v);                  //:     add v to Q 
                });                                         //:
                source.dist = 0;                            //: dist[source] = 0
            },
            next: function () {
                return algorithmus.steps.whileloop;
            }
        },
        whileloop: {
            /// While Loop ///
            name: 'whileloop',
            lines: [12],
            run: function () {
                // nothing to do
            },
            next: function () {
                if (algorithmus.Q.length == 0)              //: while Q is not empty
                { return algorithmus.steps.finish; }
                else
                { return algorithmus.steps.getmin; }
            }
        },
        getmin: {
            /// Get Vertex u with minimum dist[u] ///
            name: 'getmin',
            lines: [13],
            run: function () {
                var u = algorithmus.Q[0];                   //:  u = vertex in Q with min dist[u]
                algorithmus.Q.forEach(function (v) {
                    if (v.dist < u.dist) {
                        u = v;
                    }
                });
                algorithmus.u = u;
            },
            next: function () {
                return algorithmus.steps.remove;
            }
        },
        remove: {
            /// Remove u from Q ///
            name: 'remove',
            lines: [14],
            run: function () {
                algorithmus.Q.remove(algorithmus.u);        //:     remove u from Q 
            },
            next: function () {
                return algorithmus.steps.forneighbor;
            }
        },
        forneighbor: {
            /// for each neighbor v of u where v is still in Q. ///
            name: 'forneighbor',
            lines: [16],
            index: 0,
            run: function () {
                var nextNeighborInfo = null;                           //:     for each neighbor v of u where v is still in Q

                // start at index where stopped the last time 
                var uNeighbors = graph.getVertexNeighbors(algorithmus.u);
                for (var i = this.index; i < uNeighbors.length; i++) {
                    var neighborInfo = uNeighbors[i];

                    if (algorithmus.Q.contains(neighborInfo.vertex)) {
                        // this is our next neighbor
                        nextNeighborInfo = neighborInfo;
                        this.index = i + 1; // start with next item at next iteration
                        break; // exit loop
                    }
                }

                if (nextNeighborInfo == null) {
                    // no more neighbor found.
                    // reset index and exit loop (see next-function)

                    this.index = 0;
                    algorithmus.v = null;
                    algorithmus.lengthUV = null;
                }
                else {
                    algorithmus.v = nextNeighborInfo.vertex;
                    algorithmus.lengthUV = nextNeighborInfo.dist;
                }
            },
            next: function () {
                if (algorithmus.v == null) {
                    // no neighbor found -> exit loop
                    return algorithmus.steps.whileloop;
                }
                else {
                    // handle next neighbor
                    return algorithmus.steps.calcalt;
                }
            }
        },
        calcalt: {
            /// Calculate alternative distance ///
            name: 'calcalt',
            lines: [17],
            run: function () {
                algorithmus.alt = algorithmus.u.dist + algorithmus.lengthUV; //:         alt = dist[u] + length(u, v)
            },
            next: function () {
                return algorithmus.steps.comparedist;
            }
        },
        comparedist: {
            /// Compare distance ///
            name: 'comparedist',
            lines: [18],
            run: function () {
                // nothing to do
                // everything decides in next-function
            },
            next: function () {
                if (algorithmus.alt < algorithmus.v.dist)         //:         if alt < dist[v]
                { return algorithmus.steps.assigndist; }
                else
                { return algorithmus.steps.forneighbor; }
            }
        },
        assigndist: {
            /// assign distance and previous ///
            name: 'assigndist',
            lines: [19, 20],
            run: function () {
                algorithmus.v.dist = algorithmus.alt;
                algorithmus.v.prev = algorithmus.u;
            },
            next: function () {
                return algorithmus.steps.forneighbor;
            }
        },
        finish: {
            /// Return / Algorithmus terminates ///
            name: 'finish',
            lines: [22],
            run: function () {
                // nothing to do
            },
            next: function () {
                // there is no next, so just stay here
                return algorithmus.steps.finish;
            }
        }
    };

    this.currentStep = this.steps.start;

    this.nextStep = function () {
        var next = this.currentStep.next(); // get next step from current step
        this.currentStep = next; // set the next step as current
        this.currentStep.run(); // execute
        updateDisplay(); // update display variables
    }
}