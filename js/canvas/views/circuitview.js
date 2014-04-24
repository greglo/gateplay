define([
    "underscore",
    "backbone",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/componentview",
    "canvas/views/componentsetview",
    "canvas/views/wireview",
    "canvas/views/wiresetview",
], function(_, Backbone, fabric, Circuit, ComponentView, ComponentSetView, WireView, WireSetView) {
    return Backbone.View.extend({

        getTemporaryWire: function() {
            return this._temporaryWire;
        },

        setTemporaryWire: function(c) {
            this._temporaryWire = c;
        },

        initialize: function(options) {
            // Store options and aliases
            this.options = options;
            this.options.components = options.circuit.get("components");
            this.options.wires = options.circuit.get("wires");

            // Bind component set change events to handlers
            this.options.components.on("add", this._addComponent, this);
            this.options.components.on("remove", this.render, this);

            this.options.wires.on("add", this._addWire, this);
            this.options.wires.on("remove", this.render, this);

            this.render();
        },

        render: function() {
            // Clear old canvas
            this.options.canvas.clear();

            // Convenient aliases
            var GRID_SIZE = this.options.GRID_SIZE;
            var width = this.options.circuit.get("width") * GRID_SIZE;
            var height = this.options.circuit.get("height") * GRID_SIZE;

            // Add grid lines to the canvas
            for (var x = 0; x < width; x += GRID_SIZE)
                this.options.canvas.add(new fabric.Line([x, 0, x, height], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: 0,
                    left: x - 0.5
                }));
            for (var y = 0; y < height; y += GRID_SIZE)
                this.options.canvas.add(new fabric.Line([0 , y, width, y], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: y - 0.5,
                    left: 0
                }));

            var setViewOptions = this.options;
            
            // Draw the components on the grid
            var componentSetView = new ComponentSetView(setViewOptions);
            componentSetView.render();

            // Draw the wires on the grid
            var wireSetView = new WireSetView(setViewOptions);
            wireSetView.render();
        },

        _addComponent: function(c) {
            var view = new ComponentView({
                options: this.options,
                model: c
            });
            view.render(); 
        },

        _addWire: function(wire) {
            var view = new WireView({
                options: this.options,
                model: wire
            });
            view.render(); 
        }
    });
});
