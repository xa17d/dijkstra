'use strict';

angular.module('dijkstraApp')

.directive('dijkstraDraw', ['graph', 'algorithm', 'colors', function (graph, algorithm, colors) {
    return {
        restrict: "A",
        scope: true,
        link: function (scope, element) {
            var context = element[0].getContext('2d');

            context.canvas.width  = window.innerWidth * 0.42;
            context.canvas.height = window.innerHeight * 0.45;

            // coordinates
            var coordinateX;
            var coordinateY;

            // some variables
            var nodeRadius = 20;
            var nodeStrokeWidth = 2;

            var selectedVertex = null;
            var selectedEdge = null;

            element.bind('mouseup', function (event) {

                // get coordinates
                if (typeof event.offsetX !== 'undefined') {
                    coordinateX = event.offsetX;
                    coordinateY = event.offsetY;
                } else {
                    coordinateX = event.layerX - event.currentTarget.offsetLeft;
                    coordinateY = event.layerY - event.currentTarget.offsetTop;
                }

                scope.$watch('$parent.drawVertex', function () {
                    selectedVertex = null;
                    selectedEdge = null;
                });


                // vertex draw mode?
                if (scope.$parent.drawVertex) {
                    // is it a existing vertex?
                    selectedVertex = null;

                    angular.forEach(graph.getVertices(), function (vertex) {
                        if (
                            coordinateX >= vertex.coordinateX - 2.1 * nodeRadius && coordinateX <= vertex.coordinateX + 2.1 * nodeRadius &&
                            coordinateY >= vertex.coordinateY - 2.1 * nodeRadius && coordinateY <= vertex.coordinateY + 2.1 * nodeRadius
                        ) {
                            scope.$parent.toggleVertex(vertex);
                            selectedVertex = vertex;
                            return;
                        }
                    });

                    if (selectedVertex === null) {
                        graph.addVertex({
                            coordinateX: coordinateX,
                            coordinateY: coordinateY
                        });
                    }
                }
                    // edge draw mode
                else {
                    var currentVertex = null;
                    selectedEdge = null;

                    angular.forEach(graph.getVertices(), function (vertex) {
                        if (
                            coordinateX >= vertex.coordinateX - nodeRadius && coordinateX <= vertex.coordinateX + nodeRadius &&
                            coordinateY >= vertex.coordinateY - nodeRadius && coordinateY <= vertex.coordinateY + nodeRadius
                        ) {
                            currentVertex = vertex;
                            return;
                        }
                    });

                    // vertex was clicked
                    if (currentVertex !== null) {
                        if (selectedVertex === null) {
                            selectedVertex = currentVertex;
                        }
                        else {
                            var edge = {
                                vertex1: currentVertex,
                                vertex2: selectedVertex,
                                weight: Math.round(verticesDistance(currentVertex, selectedVertex))
                            };
                            graph.addEdge(edge);
                            selectedVertex = null;
                        }
                    }
                    // if no vertex is clicked, select nearest edge
                    else {
                        selectedVertex = null;

                        var minDistance = Number.POSITIVE_INFINITY;
                        angular.forEach(graph.getEdges(), function (edge) {
                            var dtl = distanceToLine(coordinateX, coordinateY, edge);
                            if(dtl.distance < minDistance) {
                                minDistance = dtl.distance;
                                selectedEdge = edge;
                            }
                        });

                        scope.$parent.toggleEdge(selectedEdge);
                    }
                }

                redrawCanvas();
            });

            graph.addListener(redrawCanvas);
            algorithm.addListener(redrawCanvas);

            // Distance between two vertices using Pythagoras
            function verticesDistance(vertex1, vertex2) {
                var dx = vertex1.coordinateX - vertex2.coordinateX;
                var dy = vertex1.coordinateY - vertex2.coordinateY;
                return Math.sqrt(dx * dx + dy * dy);
            }

            // see: http://stackoverflow.com/questions/3120357/get-closest-point-to-a-line
            function distanceToLine(pX, pY, edge) {
                var apX = pX - edge.vertex1.coordinateX;
                var apY = pY - edge.vertex1.coordinateY;

                var abX = edge.vertex2.coordinateX - edge.vertex1.coordinateX;
                var abY = edge.vertex2.coordinateY - edge.vertex1.coordinateY;

                var magnitudeAB = abX * abX + abY * abY;
                var productABAP = abX * apX + abY * apY;

                var nDistance = 0;
                if(magnitudeAB !== 0) {
                    nDistance = productABAP / magnitudeAB;
                }

                var nearestPointX;
                var nearestPointY;
                if(nDistance < 0) {
                    nearestPointX = edge.vertex1.coordinateX;
                    nearestPointY = edge.vertex1.coordinateY;
                }
                else if(nDistance > 1) {
                    nearestPointX = edge.vertex2.coordinateX;
                    nearestPointY = edge.vertex2.coordinateY;
                }
                else {
                    nearestPointX = edge.vertex1.coordinateX + abX * nDistance;
                    nearestPointY = edge.vertex1.coordinateY + abY * nDistance;
                }

                return {
                    distance: verticesDistance({coordinateX: nearestPointX, coordinateY: nearestPointY}, {coordinateX: pX, coordinateY: pY}),
                    point: {coordinateX: nearestPointX, coordinateY: nearestPointY}
                };
            }

            function setStyleForAll(style) {
                angular.forEach(graph.getEdges(), function (edge) {
                    edge.style = style;
                });

                angular.forEach(graph.getVertices(), function (vertex) {
                    vertex.style = style;
                });
            }

            function applyAlgorithmStyle() {

                var step = algorithm.currentStep.name;

                // reset info text of all vertices
                angular.forEach(graph.getVertices(), function (vertex) {
                    vertex.info = null;
                });

                if (step == "init") {
                    /// Init ///
                    setStyleForAll(colors.visible);

                    angular.forEach(graph.getVertices(), function (vertex) {
                        vertex.info = [
                                "dist[" + vertex.name + "] = " + vertex.dist,
                                "prev[" + vertex.name + "] = " + (vertex.prev == null ? "?" : vertex.prev.name)
                        ];
                    });
                }
                else if (step == "whileloop") {
                    /// while loop ///
                    // * set only vertices in Q visible

                    // set all faded
                    setStyleForAll(colors.faded);

                    // set all vertices in Q visible
                    angular.forEach(algorithm.Q, function (vertex) {
                        vertex.style = colors.visible;
                    });

                }
                else if (step == "getmin" || step == "remove") {
                    /// while loop, remove ///
                    // * set only vertices in Q visible
                    // * emphasize item u with min dist[u]

                    // set all faded
                    setStyleForAll(colors.faded);

                    // set all vertices in Q visible
                    angular.forEach(algorithm.Q, function (vertex) {
                        vertex.style = colors.visible;
                    });

                    // emphasize u (which is min dist[u])
                    algorithm.u.style = colors.emphasized;
                }
                else if (step == "forneighbor" || step == "calcalt" || step == "comparedist" || step == "assigndist") {
                    /// forneighbor ///
                    // * set only vertices in Q visible
                    // * emphasize item u with min dist[u]

                    // set all faded
                    setStyleForAll(colors.faded);

                    // set u emphasized
                    algorithm.u.style = colors.emphasized;

                    // set neighbors visible
                    var neighbors = graph.getVertexNeighbors(algorithm.u);
                    angular.forEach(neighbors, function (n) {
                        // only neighbors still in Q are important
                        if (algorithm.Q.contains(n.vertex)) {
                            n.vertex.style = colors.visible;
                            n.edge.style = colors.visible;
                        }
                    });

                    // set v emphasized
                    if (algorithm.v != null) { // can be null if there is no other neighbor
                        algorithm.v.style = colors.highlighted;
                    }

                    if (step == "calcalt" || step == "comparedist" || step == "assigndist") {
                        // highlight path

                        var edge = graph.getEdgeFromVertexToVertex(algorithm.v, algorithm.u);
                        edge.style = colors.highlighted;

                        var v = algorithm.u;
                        while (v != null) {
                            if (v.prev != null) {
                                var edge = graph.getEdgeFromVertexToVertex(v.prev, v);
                                edge.style = colors.highlighted;
                            }

                            v = v.prev;
                        }
                    
                        // info on u
                        algorithm.u.info = ["dist[" + algorithm.u.name + "] = " + algorithm.u.dist];

                        // info on v
                        algorithm.v.info = [
                            "alt = " + algorithm.u.dist + " + " + algorithm.lengthUV + " = " + algorithm.alt,
                            "dist[" + algorithm.v.name + "] = " + algorithm.v.dist
                        ];
                    }
                }
                else if (step == "finish") {
                    /// finished ///
                    // * emphasize shortest path

                    // set all faded
                    setStyleForAll(colors.faded);

                    var v = graph.getEndVertex();

                    // TODO: what if there is no path?

                    while (v != null) {

                        if (v.isStart || v.isEnd) {
                            v.style = colors.highlighted;
                        }
                        else {
                            v.style = colors.emphasized;
                        }

                        if (v.prev != null) {
                            var edge = graph.getEdgeFromVertexToVertex(v.prev, v);
                            edge.style = colors.emphasized;
                        }

                        v = v.prev;
                    }
                }
                else {
                    console.log("unknown step '" + step + "' for applyAlgorithmStyle()");

                    setStyleForAll(colors.faded);
                }
            }

            function redrawCanvas() {

                //clear canvas
                context.clearRect(0, 0, 800, 500);

                if (algorithm.isRunning()) {
                    applyAlgorithmStyle();
                }
                else {

                    angular.forEach(graph.getEdges(), function (edge) {
                        edge.style = (selectedEdge !== null && graph.equals(edge, selectedEdge)) ? colors.selected : colors.visible;
                    });

                    angular.forEach(graph.getVertices(), function (vertex) {
                        vertex.style = (selectedVertex !== null && graph.equals(vertex, selectedVertex)) ? colors.selected : colors.visible;
                    });
                }

                // draw edges
                angular.forEach(graph.getEdges(), function (edge) {
                    context.beginPath();

                    context.moveTo(edge.vertex1.coordinateX, edge.vertex1.coordinateY);
                    context.lineTo(edge.vertex2.coordinateX, edge.vertex2.coordinateY);
                    context.strokeStyle = edge.style.edge;

                    if (!isNaN(edge.weight)) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = edge.style.edge;
                        context.textAlign = "center";
                        context.fillText(edge.weight, edge.vertex1.coordinateX + ((edge.vertex2.coordinateX - edge.vertex1.coordinateX) / 2) + 30, edge.vertex1.coordinateY + ((edge.vertex2.coordinateY - edge.vertex1.coordinateY) / 2) - 16);
                    }

                    context.stroke();
                });

                // draw vertices
                angular.forEach(graph.getVertices(), function (vertex) {
                    context.beginPath();

                    context.arc(vertex.coordinateX, vertex.coordinateY, nodeRadius, 0, 2 * Math.PI, false);
                    context.fillStyle = vertex.style.background;
                    context.fill();

                    context.lineWidth = nodeStrokeWidth;
                    context.strokeStyle = vertex.style.stroke;
                    context.stroke();

                    context.font = "14px Century Gothic";
                    context.fillStyle = "#333333";
                    context.textAlign = "center";
                    context.fillText(vertex.name, vertex.coordinateX, vertex.coordinateY - nodeRadius * 1.5);

                    if (vertex.isStart) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";
                        context.fillText('S', vertex.coordinateX, vertex.coordinateY + 6);
                    }

                    if (vertex.isEnd) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";
                        context.fillText('E', vertex.coordinateX, vertex.coordinateY + 6);
                    }

                    if (vertex.info != null) {
                        context.font = "12px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";

                        // for multiline text
                        for (var i = 0; i < vertex.info.length; i++) {
                            context.fillText(vertex.info[i], vertex.coordinateX, vertex.coordinateY + nodeRadius + 14 + 14 * i);
                        }
                    }

                    context.stroke();
                });
            }
        }
    };
}]);