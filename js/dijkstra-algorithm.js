'use strict';

angular.module('dijkstraApp')

.provider('algorithm', function () {
    this.$get = function (graph) {

        // make this algorithm referencable in inner methods
        var algorithm = this;

        algorithm.hasFinished = false;

        this.reset = function () {
            this.source = graph.getStartVertex();

            // variables for algorithm
            this.Q = null;
            this.u = null;
            this.v = null;
            this.lengthUV = null;
            this.alt = null;

            // variables for algorithm but prepared to display to the user
            this.display = {
                Q: '--',
                u: '--',
                v: '--',
                lengthUV: '--',
                alt: '--',
                dist: '--',
                prev: '--',
                distQ: '--',
                uNeighbors: '--'
            };

            this.currentStep = this.steps.start;
            this.steps.forneighbor.reset();
        };

        graph.addListener(function () {
            algorithm.reset();
        });

        // listeners
        var listeners = [];
        function notifyListeners() {
            angular.forEach(listeners, function (listener) {
                listener();
            });
        }
        this.addListener = function (listener) {
            listeners.push(listener);
        }

        // update display variables
        var updateDisplay = function () {

            /*
             * algorithmic part
             */

            var getName = function (obj) { return obj == null ? "?" : obj.name; }

            // Q
            algorithm.display.Q = "[";
            algorithm.Q.forEach(function (v, i) {
                if (i != 0) { algorithm.display.Q += ", "; }
                algorithm.display.Q += getName(v);
            });
            algorithm.display.Q += "]";

            // u
            algorithm.display.u = getName(algorithm.u);

            // uNeighbors
            if (algorithm.u == null) {
                algorithm.display.uNeighbors = '?';
            } else {
                algorithm.display.uNeighbors = 'Neighbors of ' + algorithm.u.name;
                graph.getVertexNeighbors(algorithm.u).forEach(function (edge, i) {
                    algorithm.display.uNeighbors += "\n" + edge.vertex.name + "  dist: " + edge.dist;
                });
            }

            // v
            algorithm.display.v = getName(algorithm.v);

            // lengthUV
            algorithm.display.lengthUV = (algorithm.lengthUV == null ? "?" : algorithm.lengthUV);

            // alt
            algorithm.display.alt = (algorithm.alt == null ? "?" : algorithm.alt);

            // dist
            algorithm.display.dist = "";
            graph.getVertices().forEach(function (v, i) {
                if (i != 0) { algorithm.display.dist += "\n"; }
                algorithm.display.dist += "dist[" + v.name + "] = " + v.dist;
            });

            // distQ
            algorithm.display.distQ = "";
            algorithm.Q.forEach(function (v, i) {
                if (i != 0) { algorithm.display.distQ += "\n"; }
                algorithm.display.distQ += "dist[" + v.name + "] = " + v.dist;
            });

            // prev
            algorithm.display.prev = "";
            graph.getVertices().forEach(function (v, i) {
                if (i != 0) { algorithm.display.prev += "\n"; }
                algorithm.display.prev += "prev[" + v.name + "] = " + getName(v.prev);
            });


            /*
             * visualization part
             */

            algorithm.display.path = [];
            graph.getVertices().forEach(function (v) {
                algorithm.display.path.push({
                    name: v.name,
                    dist: v.dist,
                    prev: getName(v.prev)
                });
            });

            algorithm.display.result = null; // TODO
            var v = graph.getEndVertex();
            var list = [];
            while(typeof v !== 'undefined' && v !== null) {
                list.push(v);
                if(v.isStart) {
                    algorithm.display.result = list.reverse();
                }
                v = v.prev;
            }
        };

        // Here are the steps defined for the algorithm:
        this.steps = {
            start: {
                /// Start ///
                name: 'start',
                lines: [1],
                run: function () {
                    // nothing to do.
                },
                next: function () {
                    return algorithm.steps.init;
                }
            },
            init: {
                /// Init ///
                name: 'init',
                lines: [3, 4, 5, 6, 7, 8, 9, 10],
                run: function () {

                    algorithm.Q = [];                         //: create vertex set Q
                    graph.getVertices().forEach(function (v) {  //: for each vertex v in Graph
                        v.dist = Number.POSITIVE_INFINITY;      //:     dist[v] = INFINITY
                        v.prev = null;                          //:     dist[v] = UNDEFINED
                        algorithm.Q.push(v);                  //:     add v to Q 
                    });                                         //:
                    algorithm.source.dist = 0;                            //: dist[source] = 0
                },
                next: function () {
                    return algorithm.steps.whileloop;
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
                    if (algorithm.Q.length == 0)              //: while Q is not empty
                    { return algorithm.steps.finish; }
                    else
                    { return algorithm.steps.getmin; }
                }
            },
            getmin: {
                /// Get Vertex u with minimum dist[u] ///
                name: 'getmin',
                lines: [13],
                run: function () {
                    var u = algorithm.Q[0];                   //:  u = vertex in Q with min dist[u]
                    algorithm.Q.forEach(function (v) {
                        if (v.dist < u.dist) {
                            u = v;
                        }
                    });
                    algorithm.u = u;
                },
                next: function () {
                    return algorithm.steps.remove;
                }
            },
            remove: {
                /// Remove u from Q ///
                name: 'remove',
                lines: [14],
                run: function () {
                    algorithm.Q.remove(algorithm.u);        //:     remove u from Q 
                },
                next: function () {
                    return algorithm.steps.forneighbor;
                }
            },
            forneighbor: {
                /// for each neighbor v of u where v is still in Q. ///
                name: 'forneighbor',
                lines: [16],
                index: 0,
                reset: function () { this.index = 0; },
                run: function () {
                    var nextNeighborInfo = null;                           //:     for each neighbor v of u where v is still in Q

                    // start at index where stopped the last time 
                    var uNeighbors = graph.getVertexNeighbors(algorithm.u);
                    for (var i = this.index; i < uNeighbors.length; i++) {
                        var neighborInfo = uNeighbors[i];

                        if (algorithm.Q.contains(neighborInfo.vertex)) {
                            // this is our next neighbor
                            nextNeighborInfo = neighborInfo;
                            this.index = i + 1; // start with next item at next iteration
                            break; // exit loop
                        }
                    }

                    if (nextNeighborInfo == null) {
                        // no more neighbor found.
                        // reset index and exit loop (see next-function)

                        this.reset();
                        algorithm.v = null;
                        algorithm.lengthUV = null;
                    }
                    else {
                        algorithm.v = nextNeighborInfo.vertex;
                        algorithm.lengthUV = nextNeighborInfo.dist;
                    }
                },
                next: function () {
                    if (algorithm.v == null) {
                        // no neighbor found -> exit loop
                        return algorithm.steps.whileloop;
                    }
                    else {
                        // handle next neighbor
                        return algorithm.steps.calcalt;
                    }
                }
            },
            calcalt: {
                /// Calculate alternative distance ///
                name: 'calcalt',
                lines: [17],
                run: function () {
                    algorithm.alt = algorithm.u.dist + algorithm.lengthUV; //:         alt = dist[u] + length(u, v)
                },
                next: function () {
                    return algorithm.steps.comparedist;
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
                    if (algorithm.alt < algorithm.v.dist)         //:         if alt < dist[v]
                    { return algorithm.steps.assigndist; }
                    else
                    { return algorithm.steps.forneighbor; }
                }
            },
            assigndist: {
                /// assign distance and previous ///
                name: 'assigndist',
                lines: [19, 20],
                run: function () {
                    algorithm.v.dist = algorithm.alt;
                    algorithm.v.prev = algorithm.u;
                },
                next: function () {
                    return algorithm.steps.forneighbor;
                }
            },
            finish: {
                /// Return / algorithm terminates ///
                name: 'finish',
                lines: [22],
                run: function () {
                    // nothing to do
                },
                next: function () {
                    // there is no next, so just stay here
                    return algorithm.steps.finish;
                }
            }
        };

        this.nextStep = function () {
            var next = this.currentStep.next(); // get next step from current step
            this.currentStep = next; // set the next step as current
            this.currentStep.run(); // execute
            updateDisplay(); // update display variables
            notifyListeners();
        };

        this.isRunning = function () {
            return this.currentStep != this.steps.start;
        };

        this.reset();

        return this;
    }
});