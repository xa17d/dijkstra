'use strict';

angular.module('dijkstraApp')

.directive('dijkstraDraw', ['graph', function (graph) {
    return {
        restrict: "A",
        scope: true,
        link: function(scope, element) {
            var context = element[0].getContext('2d');

            // coordinates
            var coordinateX;
            var coordinateY;

            // list of all node and edge coordinates
            var nodes = [];
            var edges = [];

            // some variables
            var nodeRadius = 30;
            var nodeStrokeWidth = 2;
            var edgeStrength = 5;

            var selectedVertex = null;

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
                    redrawCanvas();
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
                            redrawCanvas();
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
                    // is it a existing vertex?
                    var currentVertex = null;

                    angular.forEach(graph.getVertices(), function (vertex) {
                        if (
                            coordinateX >= vertex.coordinateX - 2 * nodeRadius && coordinateX <= vertex.coordinateX + 2 * nodeRadius &&
                            coordinateY >= vertex.coordinateY - 2 * nodeRadius && coordinateY <= vertex.coordinateY + 2 * nodeRadius
                        ) {
                            currentVertex = vertex;
                            return;
                        }
                    });

                    if (currentVertex !== null) {
                        if(selectedVertex === null) {
                            selectedVertex = currentVertex;
                            redrawCanvas();
                        }
                        else {
                            graph.addEdge({
                                vertex1: currentVertex,
                                vertex2: selectedVertex
                            });
                            selectedVertex = null;
                            redrawCanvas();
                        }
                    }
                }
            });
            
            graph.addListener(redrawCanvas);

            function redrawCanvas() {

                //clear canvas
                context.clearRect(0, 0, 900, 500);

                // draw edges
                angular.forEach(graph.getEdges(), function(edge) {
                    context.beginPath();

                    context.moveTo(edge.vertex1.coordinateX, edge.vertex1.coordinateY);
                    context.lineTo(edge.vertex2.coordinateX, edge.vertex2.coordinateY);
                    context.strokeStyle = "#4CAF50";        //hex for rgb(76,175,80)
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
                });
            }
        }
    };
}]);