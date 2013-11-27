var CircuitView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.options.components = options.circuit.get("components");
        this.width = Math.floor(this.$el.width() / this.options.gridSize);
        this.height = Math.floor(this.$el.height() / this.options.gridSize);
        

        this.options.components.on("add remove", this.render, this);

        var gridSize = this.options.gridSize;
        
        this.$el.attr("width", this.width * gridSize);
        this.$el.attr("height", this.height * gridSize);


        canvas = new fabric.Canvas('workbench', { 
            hasControls: false,
            selection: true
        });

        var lastValidSelectionPosition = {};

        // Disable selection controls
        canvas.on('selection:created', function(meta) { 
            meta.target.hasControls = false;
            lastValidSelectionPosition.x = meta.target.getLeft();
            lastValidSelectionPosition.y = meta.target.getTop();
        });     


        // Snap moving objects to grid
        // http://jsfiddle.net/fabricjs/S9sLu/
        var circuitView = this;
        canvas.on('object:moving', function(meta) {
            var target = meta.target;
            var width = target.getWidth();
            var height = target.getHeight();

            // Objects can be defined by their top left corner, their center, etc...
            // We do our calculations with their top left corner values
            var normalisedLeft;
            var normalisedTop;
            var shiftLeft;
            var shiftTop;

            // Normalise according by moving all positions into our coordinate system
            if (target.originX == "center") {
                normalisedLeft = Math.round((2 * target.left - width) / (2 * gridSize)) * gridSize;
                normalisedTop = Math.round((2 * target.top - height) / (2 * gridSize)) * gridSize;
                shiftLeft = width / 2;
                shiftTop = height / 2;
            }
            else {
                normalisedLeft = Math.round(target.left / gridSize) * gridSize;
                normalisedTop = Math.round(target.top / gridSize) * gridSize;
                shiftLeft = 0;
                shiftTop = 0;
            }

            // Can't move things off the canvas
            normalisedLeft = Math.max(normalisedLeft, 0);
            normalisedLeft = Math.min(canvas.getWidth(), normalisedLeft + width) - width;
            normalisedTop = Math.max(normalisedTop, 0);
            normalisedTop = Math.min(canvas.getHeight(), normalisedTop + height) - height;

            // New UI coordinates in the objects coordinate system
            var newTop = normalisedLeft + shiftLeft;
            var newLeft = normalisedTop + shiftTop;

            // New model coordinates
            var newX = Math.round(normalisedLeft / gridSize);
            var newY =  Math.round(normalisedTop / gridSize);

            var acceptMove;

            if (typeof target.id != "undefined") {
                // Individual component has been moved
                var newX = Math.round(normalisedLeft / gridSize);
                var newY =  Math.round(normalisedTop / gridSize);
                acceptMove = options.circuit.moveComponent(target.id, newX, newY);

                if (acceptMove) {
                    target.set({
                        left: normalisedLeft + shiftLeft,
                        top: normalisedTop + shiftTop
                    });
                } else {
                    var model = circuitView.options.circuit.get("components").get(target.id)
                    target.set({
                        left: model.get("x") * gridSize,
                        top: model.get("y") * gridSize
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
                acceptMove = options.circuit.moveSelection(transformations)

                if (acceptMove) {
                    lastValidSelectionPosition.x = normalisedLeft + shiftLeft;
                    lastValidSelectionPosition.y = normalisedTop + shiftTop;
                }

                target.set({
                    left: lastValidSelectionPosition.x,
                    top: lastValidSelectionPosition.y
                });
            }
            else
                throw "Unrecognised object type"
        });

        this.render();
    },

    render: function() {
        console.log("Redraw");
        // Clear old canvas
        canvas.clear();

        var gridSize = this.options.gridSize;

        // Add grid lines to the canvas
        for (var i = 0; i < this.width; i++)
            canvas.add(new fabric.Line([i * gridSize, 0, i * gridSize, this.height * gridSize], {
                stroke: '#ccc', 
                selectable: false,
                top: 0,
                left: i * gridSize - 0.5
            }));
        for (var i = 0; i < this.height; i++)
            canvas.add(new fabric.Line([ 0, i * gridSize, this.width * gridSize, i * gridSize], {
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
