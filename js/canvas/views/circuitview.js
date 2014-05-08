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

            this.drawBackgroundGrid();
            this.render();
        },

        drawBackgroundGrid: function() {
            // Create a background tile to pattern across the back of the canvas
            var rasterizer = new fabric.StaticCanvas("rasterizer");
            rasterizer.setWidth(this.options.GRID_SIZE);
            rasterizer.setHeight(this.options.GRID_SIZE);

            rasterizer.add(new fabric.Line([0, 0, 0, this.options.GRID_SIZE], {
                stroke: '#ccc', 
                top: 0,
                left: -0.5
            }));
            rasterizer.add(new fabric.Line([0, 0, this.options.GRID_SIZE, 0], {
                stroke: '#ccc', 
                top: -0.5,
                left: 0
            }));

            var gridImage = rasterizer.toDataURL();
            this.options.canvas.setBackgroundColor({
                source: gridImage,
                repeat: "repeat"
            }, this.options.canvas.renderAll.bind(this.options.canvas));

            this.options.canvas
        },

        render: function() {
            // Clear old canvas
            this.options.canvas.clear();

            // Draw the components on the grid
            var componentSetView = new ComponentSetView(this.options);
            componentSetView.render();

            // Draw the wires on the grid
            var wireSetView = new WireSetView(this.options);
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
