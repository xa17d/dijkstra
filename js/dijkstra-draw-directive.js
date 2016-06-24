'use strict';

angular.module('dijkstraApp')

.directive('dijkstraDraw', ['graph', 'algorithm', 'colors', function (graph, algorithm, colors) {
    return {
        restrict: "A",
        scope: true,
        link: function (scope, element) {
            var context = element[0].getContext('2d');

            context.canvas.width = window.innerWidth * 0.42;
            context.canvas.height = window.innerHeight * 0.45;

            // coordinates
            var coordinateX;
            var coordinateY;

            // some variables
            var nodeRadius = 20;
            var nodeStrokeWidth = 2;

            var selectedVertexDown = null;
            var selectedVertexUp = null;
            var selectedEdge = null;

            var mode = null;

            element.bind('mousedown', function (event) {

                scope.$parent.setInDrawMode(true);

                mode = null;
                selectedVertexDown = null;
                selectedVertexUp = null;
                selectedEdge = null;

                // get coordinates
                if (typeof event.offsetX !== 'undefined') {
                    coordinateX = event.offsetX;
                    coordinateY = event.offsetY;
                } else {
                    coordinateX = event.layerX - event.currentTarget.offsetLeft;
                    coordinateY = event.layerY - event.currentTarget.offsetTop;
                }

                // is a vertex clicked?
                angular.forEach(graph.getVertices(), function (vertex) {
                    if (
                        coordinateX >= vertex.coordinateX - 2.1 * nodeRadius && coordinateX <= vertex.coordinateX + 2.1 * nodeRadius &&
                        coordinateY >= vertex.coordinateY - 2.1 * nodeRadius && coordinateY <= vertex.coordinateY + 2.1 * nodeRadius
                    ) {
                        selectedVertexDown = vertex;
                        return;
                    }
                });

                if (selectedVertexDown !== null) {
                    // vertex is clicked
                    mode = 'vertex';
                }
                else {
                    // no vertex is selected, is a edge selected?
                    var minDistance = Number.POSITIVE_INFINITY;
                    angular.forEach(graph.getEdges(), function (edge) {
                        var dtl = distanceToLine(coordinateX, coordinateY, edge);
                        if (dtl.distance < minDistance) {
                            minDistance = dtl.distance;
                            selectedEdge = edge;
                        }
                    });

                    if(minDistance < 12) {
                        // existing vertex is clicked --> edit this vertex
                        scope.$parent.toggleEdge(selectedEdge);
                    }
                    else {
                        selectedEdge = null;

                        // no vertex and no edge is clicked --> create new vertex
                        graph.addVertex({
                            coordinateX: coordinateX,
                            coordinateY: coordinateY
                        });
                    }
                }

            });

            element.bind('mouseup', function (event) {

                // get coordinates
                if (typeof event.offsetX !== 'undefined') {
                    coordinateX = event.offsetX;
                    coordinateY = event.offsetY;
                } else {
                    coordinateX = event.layerX - event.currentTarget.offsetLeft;
                    coordinateY = event.layerY - event.currentTarget.offsetTop;
                }

                // are we in vertex mode?
                if (mode === 'vertex') {

                    // is it still the same vertex?
                    angular.forEach(graph.getVertices(), function (vertex) {
                        if (
                            coordinateX >= vertex.coordinateX - 2.1 * nodeRadius && coordinateX <= vertex.coordinateX + 2.1 * nodeRadius &&
                            coordinateY >= vertex.coordinateY - 2.1 * nodeRadius && coordinateY <= vertex.coordinateY + 2.1 * nodeRadius
                        ) {
                            selectedVertexUp = vertex;
                            return;
                        }
                    });

                    if (selectedVertexUp !== null) {
                        // cursor was on vertex while mouseup

                        if (graph.equals(selectedVertexDown, selectedVertexUp)) {
                            // mouseup and mousedown on same vertex --> edit this vertex
                            mode = 'editVertex';
                            scope.$parent.toggleVertex(selectedVertexUp);
                        }
                        else {
                            // mouseup and mousedown on different vertices --> add new edge
                            var edge = {
                                vertex1: selectedVertexDown,
                                vertex2: selectedVertexUp,
                                weight: Math.round(verticesDistance(selectedVertexDown, selectedVertexUp))
                            };
                            graph.addEdge(edge);
                        }
                    }

                }

                scope.$parent.setInDrawMode(false);

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
                if (magnitudeAB !== 0) {
                    nDistance = productABAP / magnitudeAB;
                }

                var nearestPointX;
                var nearestPointY;
                if (nDistance < 0) {
                    nearestPointX = edge.vertex1.coordinateX;
                    nearestPointY = edge.vertex1.coordinateY;
                }
                else if (nDistance > 1) {
                    nearestPointX = edge.vertex2.coordinateX;
                    nearestPointY = edge.vertex2.coordinateY;
                }
                else {
                    nearestPointX = edge.vertex1.coordinateX + abX * nDistance;
                    nearestPointY = edge.vertex1.coordinateY + abY * nDistance;
                }

                return {
                    distance: verticesDistance({ coordinateX: nearestPointX, coordinateY: nearestPointY }, { coordinateX: pX, coordinateY: pY }),
                    point: { coordinateX: nearestPointX, coordinateY: nearestPointY }
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

            /**
             * Source: http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
             * Draws a rounded rectangle using the current state of the canvas.
             * If you omit the last three params, it will draw a rectangle
             * outline with a 5 pixel border radius
             * @param {CanvasRenderingContext2D} ctx
             * @param {Number} x The top left x coordinate
             * @param {Number} y The top left y coordinate
             * @param {Number} width The width of the rectangle
             * @param {Number} height The height of the rectangle
             * @param {Number} [radius = 5] The corner radius; It can also be an object 
             *                 to specify different radii for corners
             * @param {Number} [radius.tl = 0] Top left
             * @param {Number} [radius.tr = 0] Top right
             * @param {Number} [radius.br = 0] Bottom right
             * @param {Number} [radius.bl = 0] Bottom left
             * @param {Boolean} [fill = false] Whether to fill the rectangle.
             * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
             */
            function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
                if (typeof stroke == 'undefined') {
                    stroke = true;
                }
                if (typeof radius === 'undefined') {
                    radius = 5;
                }
                if (typeof radius === 'number') {
                    radius = { tl: radius, tr: radius, br: radius, bl: radius };
                } else {
                    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
                    for (var side in defaultRadius) {
                        radius[side] = radius[side] || defaultRadius[side];
                    }
                }
                ctx.beginPath();
                ctx.moveTo(x + radius.tl, y);
                ctx.lineTo(x + width - radius.tr, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
                ctx.lineTo(x + width, y + height - radius.br);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
                ctx.lineTo(x + radius.bl, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
                ctx.lineTo(x, y + radius.tl);
                ctx.quadraticCurveTo(x, y, x + radius.tl, y);
                ctx.closePath();
                if (fill) {
                    ctx.fill();
                }
                if (stroke) {
                    ctx.stroke();
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
                        vertex.style = (mode === 'editVertex' && graph.equals(vertex, selectedVertexUp)) ? colors.selected : colors.visible;
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


                        var lineHeight = 14;


                        var xCenter = vertex.coordinateX;
                        var yTop = vertex.coordinateY + nodeRadius + 10;
                        var padding = 3;
                        var maxLineLength = 0;

                        // measure text
                        for (var i = 0; i < vertex.info.length; i++) {
                            var text = vertex.info[i];
                            maxLineLength = Math.max(maxLineLength, text.length);
                        }

                        context.lineWidth = 1;
                        context.fillStyle = "rgba(245,245,245,0.8)"; //colors.faded.background;
                        context.strokeStyle = colors.faded.stroke;
                        var width = 5.88 * maxLineLength;
                        var height = vertex.info.length * lineHeight + 10;

                        roundRect(context, xCenter - width / 2 - padding, yTop - padding, width + 2 * padding, height + padding, 4, true, true);
                        context.fillRect(xCenter - width / 2, yTop, width, height);

                        context.font = "12px Century Gothic";
                        context.fillStyle = "#4CAF50";
                        context.textAlign = "center";

                        // draw multiline text
                        for (var i = 0; i < vertex.info.length; i++) {
                            var text = vertex.info[i];
                            maxLineLength = Math.max(maxLineLength, text.length);
                            context.fillText(text, xCenter, yTop + lineHeight + lineHeight * i);
                        }
                    }

                    context.stroke();
                });
            }
        }
    };
}]);