define([
    "backbone",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/componentsetview"
], function(Backbone, fabric, Circuit, ComponentSetView) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options;
            this.options.components = options.circuit.get("components");
            this.width = Math.floor(this.$el.width() / this.options.gridSize);
            this.height = Math.floor(this.$el.height() / this.options.gridSize);
            

            this.options.components.on("add remove", this.render, this);

            var gridSize = this.options.gridSize;
            
            this.$el.attr("width", this.width * gridSize);
            this.$el.attr("height", this.height * gridSize);


            this.canvas = new fabric.Canvas('workbench', { 
                hasControls: false,
                selection: true
            });

            var selection = null;
            var mouseDown = false;
            var lastMoveValid = false;
            var selectionStartPosition = {};

            this.canvas.on('mouse:down', function(meta) { 
                mouseDown = true;
            });    

            var circuitView = this;
            this.canvas.on('mouse:up', function(meta) { 
                mouseDown = false;
                if (lastMoveValid) {
                    selectionStartPosition.x = selection.getLeft();
                    selectionStartPosition.y = selection.getTop();
                } else if (selection != null) {
                    selection.set({
                        left: selectionStartPosition.x,
                        top: selectionStartPosition.y,
                    });
                    // Call options.circuit.moveSelection
                    console.log("Setting selection back");
                }
            });    

            this.canvas.on('object:selected', function(meta) {
                selection = meta.target;
                selection.hasControls = false;
                selectionStartPosition.x = selection.getLeft();
                selectionStartPosition.y = selection.getTop();
            });     


            // Snap moving objects to grid
            // http://jsfiddle.net/fabricjs/S9sLu/
            this.canvas.on('object:moving', function(meta) {
                if (mouseDown == true && selection != null) {
                var target = selection;
                var targetWidth = target.getWidth();
                var targetHeight = target.getHeight();

                // Objects can be defined by their top left corner, their center, etc...
                // We do our calculations with their top left corner values
                var normalisedLeft;
                var normalisedTop;
                var shiftLeft;
                var shiftTop;

                // Normalise according by moving all positions into a top-left coordinate system
                if (target.originX == "center") {
                    normalisedLeft = Math.round((2 * target.left - targetWidth) / (2 * gridSize)) * gridSize;
                    normalisedTop = Math.round((2 * target.top - targetHeight) / (2 * gridSize)) * gridSize;
                    shiftLeft = targetWidth / 2;
                    shiftTop = targetHeight / 2;
                }
                else if (target.originX == "left") {
                    normalisedLeft = Math.round(target.left / gridSize) * gridSize;
                    normalisedTop = Math.round(target.top / gridSize) * gridSize;
                    shiftLeft = 0;
                    shiftTop = 0;
                }
                else
                    throw "Unrecognised object type"

                // Can't move things off the canvas
                normalisedLeft = Math.max(normalisedLeft, 0);
                normalisedLeft = Math.min(gridSize.getWidth(), normalisedLeft + targetWidth) - targetWidth;
                normalisedTop = Math.max(normalisedTop, 0);
                normalisedTop = Math.min(gridSize.getHeight(), normalisedTop + targetHeight) - targetHeight;

                // New UI coordinates in the objects coordinate system
                var newLeft = normalisedLeft + shiftLeft;
                var newTop = normalisedTop + shiftTop;

                // Let users move objects anywhere on the grid for now
                target.set({
                    left: newLeft,
                    top: newTop
                });


                if (typeof target.id != "undefined") {
                    // Individual component has been moved
                    var newX = normalisedLeft / gridSize;
                    var newY = normalisedTop / gridSize;
                    lastMoveValid = options.circuit.moveComponent(target.id, newX, newY);

                    if (lastMoveValid) {
                        target.set({
                            fill: "white"
                        });
                    } else {
                        target.set({
                            fill: "red"
                        });
                    }

                } else if (typeof target.objects != "undefined") {
                    // Component selection has been moved
                    var transformations = [];
                    _.each(target.objects, function(c) {
                        var newX = Math.round((normalisedLeft + shiftLeft + c.getLeft()) / gridSize);
                        var newY =  Math.round((normalisedTop + shiftTop + c.getTop()) / gridSize);

                        transformations.push({
                            id: c.id,
                            newX: newX,
                            newY: newY
                        });
                    });
                    lastMoveValid = options.circuit.moveSelection(transformations)

                    if (lastMoveValid) {
                        target.set({
                            fill: "white"
                        });
                    } else {
                        target.set({
                            fill: "red",
                        });
                    }
                }
                else
                    throw "Unrecognised object type"
            }
            });

            this.render();
        },

        render: function() {
            console.log("Redraw");
            // Clear old canvas
            this.canvas.clear();

            var gridSize = this.options.gridSize;

            // Add grid lines to the canvas
            for (var i = 0; i < this.width; i++)
                this.canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, this.height * gridSize], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: 0,
                    left: i * gridSize - 0.5
                }));
            for (var i = 0; i < this.height; i++)
                this.canvas.add(new fabric.Line([ 0, i * gridSize, this.width * gridSize, i * gridSize], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: i * gridSize - 0.5,
                    left: 0
                }));
            
            // Draw the components on the grid
            var componentSetView = new ComponentSetView(this.options);
            componentSetView.render();
        }
    });
});
