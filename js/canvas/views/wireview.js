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

            var sourceComponent = components.models[(model.get("sourceId"))];
            var x1 = (sourceComponent.get("x") + sourceComponent.get("width")) * GRID_SIZE;
            var y1 = (sourceComponent.get("y") + sourceComponent.getHeight() / 2) * GRID_SIZE;

            var targetComponent = components.models[(model.get("targetId"))];
            var x2 = targetComponent.get("x") * GRID_SIZE;
            var y2 = (targetComponent.get("y") + 2 * model.get("targetPort") + 1.5) * GRID_SIZE;
            
            var wire = new fabric.Line([x1, y1, x2, y2], {
                strokeWidth: GRID_SIZE,
                stroke: "black",
                originX: "center",
                originY: "center",
                selectable: false
            });

            this.options.canvas.add(wire);
        }
    });
});