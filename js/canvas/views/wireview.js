define([
    "backbone",
    "fabric",
], function(Backbone, fabric) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
        },

        render : function() {
            var GRID_SIZE = this.options.GRID_SIZE;
            var model = this.model;
            var components = this.options.components;

            var fixedPoints = model.get("fixedPoints");
                
            var sourceComponent = components.models[(model.get("sourceId"))];
            var firstX = sourceComponent.get("x") + sourceComponent.get("width");
            var firstY = sourceComponent.getOutputCoordinate(model.get("sourcePort"));
            
            var lastPoint = {x: firstX, y: firstY};

            for (var i = 0; i < fixedPoints.length; i++) {
                var thisPoint = fixedPoints[i];
                this._renderSegment(lastPoint.x, lastPoint.y, thisPoint.x, thisPoint.y)
                lastPoint = thisPoint;
            }

            var targetComponent = components.models[(model.get("targetId"))];
            var lastX = targetComponent.get("x");
            var lastY = targetComponent.getInputCoordinate(model.get("targetPort"));

            this._renderSegment(lastPoint.x, lastPoint.y, lastX, lastY);
        },

        _renderSegment: function(x1, y1, x2, y2) {
            // A segment must be either horizontal or vertical
            if (x1 === x2 || y1 === y2) {
                
                var GRID_SIZE = this.options.GRID_SIZE;

                if (x1 !== x2) {
                    var y = y1;

                    var xOffset = 0;
                    if (x1 > x2) {
                        var temp = x2;
                        x2 = x1;
                        x1 = temp;
                        xOffset = GRID_SIZE;
                    }

                    var a = x1 * GRID_SIZE + xOffset;
                    var b = x2 * GRID_SIZE + xOffset;
                    var c = y * GRID_SIZE;

                    var segment = new fabric.Line([a, c, b, c], {
                        strokeWidth: GRID_SIZE,
                        stroke: "black",
                        originX: "center",
                        originY: "top",
                        selectable: false
                    });
                    this.options.canvas.add(segment);
                } else if (y1 !== y2) {
                    var x = x1;

                    var yOffset = 0;
                    if (y1 > y2) {
                        var temp = y2;
                        y2 = y1;
                        y1 = temp;
                        yOffset = GRID_SIZE;
                    }

                    var a = y1 * GRID_SIZE + yOffset;
                    var b = y2 * GRID_SIZE + yOffset;
                    var c = x * GRID_SIZE;

                    var segment = new fabric.Line([c, a, c, b], {
                        strokeWidth: GRID_SIZE,
                        stroke: "black",
                        originX: "left",
                        originY: "center",
                        selectable: false
                    });
                    this.options.canvas.add(segment);
                }

            } else {
                console.log(x1);
                console.log(y1);
                console.log(x2);
                console.log(y2);
                console.warn("Tried to draw a non-axis-aligned wire segment")
            }
        },
    });
});