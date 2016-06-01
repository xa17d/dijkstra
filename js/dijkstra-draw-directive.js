'use strict';

angular.module('dijkstraApp')

.directive('dijkstraDraw', ['graph', 'algorithm', 'colors', function (graph, algorithm, colors) {
    return {
        restrict: "A",
        scope: true,
        link: function(scope, element) {
            var context = element[0].getContext('2d');

            // coordinates
            var coordinateX;
            var coordinateY;

            // all pixels containing a edge
            var edgePixels = [];

            // some variables
            var nodeRadius = 30;
            var nodeStrokeWidth = 2;
            var edgeStrength = 1;

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
                if(scope.$parent.drawVertex) {
                    // is it a existing vertex?
                    selectedVertex = null;

                    angular.forEach(graph.getVertices(), function (vertex) {
                        if (
                            coordinateX >= vertex.coordinateX - 2 * nodeRadius && coordinateX <= vertex.coordinateX + 2 * nodeRadius &&
                            coordinateY >= vertex.coordinateY - 2 * nodeRadius && coordinateY <= vertex.coordinateY + 2 * nodeRadius
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
                            coordinateX >= vertex.coordinateX - 2 * nodeRadius && coordinateX <= vertex.coordinateX + 2 * nodeRadius &&
                            coordinateY >= vertex.coordinateY - 2 * nodeRadius && coordinateY <= vertex.coordinateY + 2 * nodeRadius
                        ) {
                            currentVertex = vertex;
                            return;
                        }
                    });

                    // vertex was clicked
                    if (currentVertex !== null) {
                        if(selectedVertex === null) {
                            selectedVertex = currentVertex;
                        }
                        else {
                            var edge = {
                                vertex1: currentVertex,
                                vertex2: selectedVertex,
                                weight: Math.round(verticesDistance(currentVertex, selectedVertex))
                            };
                            graph.addEdge(edge);
                            addEdgePixels(edge)
                            selectedVertex = null;
                        }
                    }
                    // probably edge was clicked
                    else {
                        angular.forEach(edgePixels, function (edgePixel) {
                            if(coordinateX === edgePixel.coordinateX && coordinateY === edgePixel.coordinateY) {
                                selectedEdge = edgePixel.edge;
                                scope.$parent.toggleEdge(selectedEdge);
                                return;
                            }
                        });
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
                return Math.sqrt(dx*dx + dy*dy);
            }

            // see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
            function addEdgePixels(edge) {
                var x1 = edge.vertex1.coordinateX;
                var x0 = edge.vertex2.coordinateX;
                var y1 = edge.vertex1.coordinateY;
                var y0 = edge.vertex2.coordinateY;

                // TODO bugfix

                if(x0 > x1) {
                    var x1Old = x1;
                    x1 = x0;
                    x0 = x1Old;

                    var y1Old = y1;
                    y1 = y0;
                    y0 = y1Old;
                }

                var deltaX = x1 - x0;
                var deltaY = y1 - y0;

                var deltaError = (deltaX !== 0) ? Math.abs(deltaY / deltaX) : 50;

                var y = y0;
                for(var x = x0; x <= x1; x++) {

                    // morph pixel
                    for(var i = -2; i <= 2; i++) {
                        for(var j = -2; j <= 2; j++) {
                            edgePixels.push({
                                coordinateX: x+i,
                                coordinateY: y+j,
                                edge: edge
                            });
                        }
                    }

                    if(deltaError >= 0) {
                        y++;
                        deltaError = deltaError - deltaX;
                    }

                    deltaError = deltaError + deltaY;
                }
            };

            function redrawCanvas() {

                //clear canvas
                context.clearRect(0, 0, 800, 500);

                /*
                // SHOW EDGE PIXELS
                angular.forEach(edgePixels, function (ep) {
                    context.beginPath();
                    context.arc(ep.coordinateX, ep.coordinateY, 1, 0, 2 * Math.PI, false);
                    context.fillStyle = '#ff0000';
                    context.fill();
                });
                */

                if (algorithm.isRunning()) {
                    angular.forEach(graph.getEdges(), function (edge) {
                        edge.style = colors.visible;
                    });

                    angular.forEach(graph.getVertices(), function (vertex) {
                        vertex.style = colors.visible;
                    });
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
                angular.forEach(graph.getEdges(), function(edge) {
                    context.beginPath();

                    context.moveTo(edge.vertex1.coordinateX, edge.vertex1.coordinateY);
                    context.lineTo(edge.vertex2.coordinateX, edge.vertex2.coordinateY);
                    context.strokeStyle = edge.style.edge;

                    if(!isNaN(edge.weight)) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = (selectedEdge !== null && graph.equals(edge, selectedEdge)) ? '#FFD740' : "#4CAF50";
                        context.textAlign = "center";
                        context.fillText(edge.weight, edge.vertex1.coordinateX + ((edge.vertex2.coordinateX - edge.vertex1.coordinateX) / 2) + 30, edge.vertex1.coordinateY + ((edge.vertex2.coordinateY - edge.vertex1.coordinateY) / 2) - 16);
                    }

                    context.stroke();
                });

                // draw vertices
                angular.forEach(graph.getVertices(), function(vertex) {
                    context.beginPath();


                    if(selectedVertex !== null && vertex.coordinateX === selectedVertex.coordinateX && vertex.coordinateY === selectedVertex.coordinateY) {
                        context.arc(vertex.coordinateX, vertex.coordinateY, nodeRadius, 0, 2 * Math.PI, false);
                        context.fillStyle = '#FFD740';
                        context.fill();
                    }
                    else {
                        context.arc(vertex.coordinateX, vertex.coordinateY, nodeRadius, 0, 2 * Math.PI, false);
                        context.fillStyle = '#dddddd';
                        context.fill();
                    }

                    context.lineWidth = nodeStrokeWidth;
                    context.strokeStyle = '#000000';
                    context.stroke();

                    context.font = "14px Century Gothic";
                    context.fillStyle = "#333333";
                    context.textAlign = "center";
                    context.fillText(vertex.name, vertex.coordinateX, vertex.coordinateY - nodeRadius * 1.5);

                    if(vertex.isStart) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";
                        context.fillText('S', vertex.coordinateX, vertex.coordinateY + 6);
                    }

                    if(vertex.isEnd) {
                        context.font = "16px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";
                        context.fillText('E', vertex.coordinateX, vertex.coordinateY + 6);
                    }

                    context.stroke();
                });
            }
        }
    };
}]);