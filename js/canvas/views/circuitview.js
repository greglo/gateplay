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
            // Store options and aliases
            this.options = options;
            this.options.components = options.circuit.get("components");

            // Bind component set change events to handlers
            this.options.components.on("add", this._addComponent, this);
            this.options.components.on("remove", this.render, this);

            // Create fabricjs canvas
            this.options.canvas = new fabric.Canvas('workbench', { 
                hasControls: false,
                selection: true
            });

            var view = this;

            this.options.canvas.on('mouse:up', function(meta) { 
                if (view.lastMove.isValid) {
                    view.lastMove.start.x = view.lastMove.object.getLeft();
                    view.lastMove.start.y = view.lastMove.object.getTop();
                } else if (view.lastMove.object != null) {
                    view.lastMove.object.set({
                        left: view.lastMove.start.x,
                        top: view.lastMove.start.y,
                    });
                    view._updateLocation(view.lastMove.object);
                    // Rendering the object alone is not enough as it leaves a "ghost" image
                    // So we renderAll()
                    view.options.canvas.renderAll();
                }
            });    

            this.options.canvas.on('object:selected', function(meta) {
                view.lastMove.object = meta.target;
                view.lastMove.object.hasControls = false;

                // If we are selecting a single object, bring it to the front
                if (typeof meta.target.id != "undefined") {
                    meta.target.bringToFront();
                }
                view.lastMove.start.x = view.lastMove.object.getLeft();
                view.lastMove.start.y = view.lastMove.object.getTop();
            });     

            this.options.canvas.on('selection:created', function(meta) {
                // If we are selecting multiple objects, bring each of them to the front in turn
                _.each(meta.target.objects, function(object) {
                    object.bringToFront();
                });
            });   


            // Snap moving objects to grid
            // http://jsfiddle.net/fabricjs/S9sLu/
            this.options.canvas.on('object:moving', function(meta) {
                view._updateLocation(meta.target)
            });

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
            setViewOptions.canvas = this.options.canvas;
            
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
                var GRID_SIZE = this.options.GRID_SIZE;
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
                    normalisedLeft = Math.round((2 * target.left - targetWidth) / (2 * GRID_SIZE)) * GRID_SIZE;
                    normalisedTop = Math.round((2 * target.top - targetHeight) / (2 * GRID_SIZE)) * GRID_SIZE;
                    shiftLeft = targetWidth / 2;
                    shiftTop = targetHeight / 2;
                }
                else if (target.originX == "left") {
                    normalisedLeft = Math.round(target.left / GRID_SIZE) * GRID_SIZE;
                    normalisedTop = Math.round(target.top / GRID_SIZE) * GRID_SIZE;
                    shiftLeft = 0;
                    shiftTop = 0;
                }
                else
                    throw "Unrecognised object type"

                // Can't move things off the canvas
                normalisedLeft = Math.max(normalisedLeft, 0);
                normalisedLeft = Math.min(this.options.canvas.getWidth(), normalisedLeft + targetWidth) - targetWidth;
                normalisedTop = Math.max(normalisedTop, 0);
                normalisedTop = Math.min(this.options.canvas.getHeight(), normalisedTop + targetHeight) - targetHeight;

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
                    var newX = normalisedLeft / GRID_SIZE;
                    var newY = normalisedTop / GRID_SIZE;
                    this.lastMove.isValid = this.options.circuit.moveComponentById(target.id, newX, newY);
                    target.setValid(this.lastMove.isValid)

                } else if (typeof target.objects != "undefined") {
                    // Component selection has been moved
                    var transformations = [];
                    _.each(target.objects, function(c) {
                        var newX = Math.round((normalisedLeft + shiftLeft + c.getLeft()) / GRID_SIZE);
                        var newY =  Math.round((normalisedTop + shiftTop + c.getTop()) / GRID_SIZE);

                        transformations.push({
                            id: c.id,
                            newX: newX,
                            newY: newY
                        });
                    });
                    var isValid = this.options.circuit.moveGroupByIds(transformations);
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
