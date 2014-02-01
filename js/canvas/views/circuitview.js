define([
    "underscore",
    "backbone",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/componentview",
    "canvas/views/componentsetview",
], function(_, Backbone, fabric, Circuit, ComponentView, ComponentSetView) {
    return Backbone.View.extend({

        lastMove: {
            object: null,
            isValid: false,
            start: {}
        },

        initialize: function(options) {
            this.options = options;
            this.options.components = options.circuit.get("components");
            this.width = Math.floor(this.$el.width() / this.options.gridSize);
            this.height = Math.floor(this.$el.height() / this.options.gridSize);

            this.options.components.on("add", this._addComponent, this);
            this.options.components.on("remove", this.render, this);

            var gridSize = this.options.gridSize;
            
            this.$el.attr("width", this.width * gridSize);
            this.$el.attr("height", this.height * gridSize);


            this.canvas = new fabric.Canvas('workbench', { 
                hasControls: false,
                selection: true
            });

            var view = this;

            this.canvas.on('mouse:up', function(meta) { 
                if (view.lastMove.isValid) {
                    view.lastMove.start.x = view.lastMove.object.getLeft();
                    view.lastMove.start.y = view.lastMove.object.getTop();
                } else if (view.lastMove.object != null) {
                    view.lastMove.object.set({
                        left: view.lastMove.start.x,
                        top: view.lastMove.start.y,
                    });
                    view._updateLocation(view.lastMove.object);
                    view.canvas.renderAll();
                    console.log("Setting selection back");
                }
            });    

            this.canvas.on('object:selected', function(meta) {
                view.lastMove.object = meta.target;
                view.lastMove.object.hasControls = false;
                view.lastMove.start.x = view.lastMove.object.getLeft();
                view.lastMove.start.y = view.lastMove.object.getTop();
            });     


            // Snap moving objects to grid
            // http://jsfiddle.net/fabricjs/S9sLu/
            this.canvas.on('object:moving', function(meta) {
                view._updateLocation(meta.target)
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

            var setViewOptions = this.options;
            setViewOptions.canvas = this.canvas;
            
            // Draw the components on the grid
            var componentSetView = new ComponentSetView(setViewOptions);
            componentSetView.render();
        },

        _addComponent: function(c) {
            var view = new ComponentView({
                options: this.options,
                model: c
            });
            view.render(this.options.canvas); 
        },

        _updateLocation: function(target) {
            if (target != null) {
                var gridSize = this.options.gridSize;
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
                normalisedLeft = Math.min(this.canvas.getWidth(), normalisedLeft + targetWidth) - targetWidth;
                normalisedTop = Math.max(normalisedTop, 0);
                normalisedTop = Math.min(this.canvas.getHeight(), normalisedTop + targetHeight) - targetHeight;

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
                    this.lastMove.isValid = this.options.circuit.moveComponent(target.id, newX, newY);
                    target.setValid(this.lastMove.isValid)

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
                    var isValid = this.options.circuit.moveSelection(transformations);
                    this.lastMove.isValid = isValid;
                    
                    _.each(target.objects, function(c) {
                        c.setValid(isValid);
                    });
                }
                else
                    throw "Unrecognised object type"
            }
        }   
    });
});
