var CircuitView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.options.components = options.circuit.get("components");
        this.width = Math.floor(this.$el.width() / this.options.gridSize);
        this.height = Math.floor(this.$el.height() / this.options.gridSize);
        

        this.options.components.on("all", this.render, this);

        var gridSize = this.options.gridSize;
        
        this.$el.attr("width", this.width * gridSize);
        this.$el.attr("height", this.height * gridSize);
        console.log(this.height);
        console.log(this.$el.height());


        canvas = new fabric.Canvas('workbench', { 
            hasControls: false,
            selection: true
        });

        // Disable selection controls
        canvas.on('selection:created', function(meta) { 
            meta.target.hasControls = false;
        });     


        // Snap moving objects to grid
        // http://jsfiddle.net/fabricjs/S9sLu/
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

            // Apply a shift back into the objects coordinate system
            target.set({
                left: normalisedLeft + shiftLeft,
                top: normalisedTop + shiftTop
            });
        });

        this.render();
    },

    render: function() {
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
