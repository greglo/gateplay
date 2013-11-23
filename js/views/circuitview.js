var CircuitView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
        this.components = options.circuit.get("components")
        this.components.on("all", this.render, this);
    },

    render: function() {
        // Clear old canvas
        canvas.clear();

        // Add grid lines to the canvas
        for (var i = 0; i < (this.options.width / this.options.gridSize); i++)
            canvas.add(new fabric.Line([i * this.options.gridSize, 0, i * this.options.gridSize, this.options.height], {
                stroke: '#ccc', 
                selectable: false,
                top: 0,
                left: i * this.options.gridSize - 0.5
            }));
        for (var i = 0; i < (this.options.height / this.options.gridSize); i++)
            canvas.add(new fabric.Line([ 0, i * this.options.gridSize, this.options.width, i * this.options.gridSize], {
                stroke: '#ccc', 
                selectable: false,
                top: i * this.options.gridSize - 0.5,
                left: 0
            }));
        
        // Draw the components on the grid
        var componentSetView = new ComponentSetView({components: this.components});
        componentSetView.render();
    }
});
