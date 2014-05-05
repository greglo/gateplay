define([
    "underscore",
    "backbone",
    "fabric",
    "sim/truthvalue",
], function(_, Backbone, fabric, TruthValue) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
            this.polyLine = null;

            this.model.on("change:fixedPoints", this.render, this);
            this.model.on("change:truthValue", this._setWireColor, this);
        },

        render : function() {
            if (this.polyLine != null) {
                this.options.canvas.remove(this.polyLine);
            }

            var GRID_SIZE = this.options.GRID_SIZE;
            var model = this.model;
            var components = this.options.components;

            var fixedPoints = model.get("fixedPoints");
            var canvasFixedPoints = _.map(fixedPoints, function(point) {
                return {
                    x: point.x * GRID_SIZE,
                    y: point.y * GRID_SIZE
                }
            });

            var sourceComponent = components.get(model.get("sourceId"));
            var firstX = sourceComponent.get("x") + sourceComponent.get("width");
            var firstY = sourceComponent.getOutputCoordinate(model.get("sourcePort"));
            canvasFixedPoints.unshift({
                x: (firstX - 0.5) * GRID_SIZE,
                y: firstY * GRID_SIZE 
            });
            

            var targetComponent = components.get(model.get("targetId"));
            if (targetComponent) {
                var lastX = targetComponent.get("x");
                var lastY = targetComponent.getInputCoordinate(model.get("targetPort"));
                canvasFixedPoints.push({
                    x: (lastX - 0.5) * GRID_SIZE,
                    y: lastY * GRID_SIZE 
                });
            }


            var xs = _.pluck(canvasFixedPoints, "x");
            var smallestX = _.reduce(xs, function(x, min) {
                return Math.min(x, min);
            });

            var ys = _.pluck(canvasFixedPoints, "y");
            var smallestY = _.reduce(ys, function(y, min) {
                return Math.min(y, min);
            });

            this.polyLine = new fabric.Polyline(canvasFixedPoints, {
              strokeWidth: GRID_SIZE,
              fill: false,
              left: smallestX,
              top: smallestY,
              selectable: false,
              rx: GRID_SIZE,
              ry: GRID_SIZE,
              evented: false,
              opacity: 0.8
            });
            this._setWireColor();

            this.options.canvas.add(this.polyLine);
        },

        _setWireColor: function() {
            var truthValue = this.model.get("truthValue");
            if (truthValue === TruthValue.TRUE) {
                this.polyLine.setStroke("Green");;
            } else if (truthValue === TruthValue.FALSE) {
                this.polyLine.setStroke("Red");
            } else if (truthValue === TruthValue.UNKNOWN) {
                this.polyLine.setStroke("Gray");
            }
            this.options.canvas.renderAll();
        }
    });
});