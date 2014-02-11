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
            this.canvas = new fabric.Canvas('workbench', { 
                hasControls: false,
                selection: true
            });

            var view = this;

            // http://fabricjs.com/hovering/
            this.canvas.findTarget = (function(originalFn) {
                return function() {
                    var target = originalFn.apply(this, arguments);
                    if (target) {
                        if (this._hoveredTarget !== target) {
                            view.canvas.fire('object:over', target);
                            if (this._hoveredTarget) {
                                view.canvas.fire('object:out', this._hoveredTarget);
                            }
                            this._hoveredTarget = target;
                        }   
                    } else if (this._hoveredTarget) {
                        view.canvas.fire('object:out', this._hoveredTarget);
                        this._hoveredTarget = null;
                    }
                    return target;
                };
            })(this.canvas.findTarget);

            this.canvas.bringToFront = (function(originalFn) {
                return function() {
                    originalFn.apply(this, arguments);
                    var target = arguments[0];
                    console.log("New top: " + target);
                    if (typeof target.class != "undefined" && target.class == "gate") {
                        view.canvas.fire("gate:front", target);
                    }
                };
            })(this.canvas.bringToFront);

            this.canvas.on("object:over", function(target) {
                if (typeof target.class != "undefined") {
                    switch (target.class) {
                        case "input":
                            target.setStroke("red");
                            break;
                    }
                    target.render(view.canvas.getContext());
                }
            });

            this.canvas.on("object:out", function(target) {
                if (typeof target.class != "undefined") {
                    switch (target.class) {
                        case "input":
                            target.setStroke("black");
                            break;
                    }
                    target.render(view.canvas.getContext());
                }
            });

            this.canvas.on('mouse:up', function(e) { 
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
                }
            });    

            this.canvas.on('object:selected', function(e) {
                view.lastMove.object = e.target;
                view.lastMove.object.hasControls = false;

                // If we are selecting a single object, bring it to the front
                if (typeof e.target.componentId != "undefined") {
                    e.target.bringToFront();
                }
                view.lastMove.start.x = view.lastMove.object.getLeft();
                view.lastMove.start.y = view.lastMove.object.getTop();
            });     

            this.canvas.on('selection:created', function(e) {
                // If we are selecting multiple objects, bring each of them to the front in turn
                _.each(e.target.getObjects(), function(object) {
                    object.bringToFront();
                });
            });   

            // Snap moving objects to grid
            // http://jsfiddle.net/fabricjs/S9sLu/
            this.canvas.on('object:moving', function(e) {
                view._updateLocation(e.target)
            });

            this.render();
        },

        render: function() {
            this.canvas.clear();

            // Convenient aliases
            var GRID_SIZE = this.options.GRID_SIZE;
            var width = this.options.circuit.get("width") * GRID_SIZE;
            var height = this.options.circuit.get("height") * GRID_SIZE;

            // Add grid lines to the canvas
            for (var x = 0; x < width; x += GRID_SIZE)
                this.canvas.add(new fabric.Line([x, 0, x, height], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: 0,
                    left: x - 0.5
                }));
            for (var y = 0; y < height; y += GRID_SIZE)
                this.canvas.add(new fabric.Line([0 , y, width, y], {
                    stroke: '#ccc', 
                    selectable: false,
                    top: y - 0.5,
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
            view.render(); 
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


                if (typeof target.componentId != "undefined" && target.class == "gate") {
                    // Individual component has been moved
                    var newX = Math.round(normalisedLeft / GRID_SIZE);
                    var newY = Math.round(normalisedTop / GRID_SIZE);
                    this.canvas.fire("gate:moving", {id: target.componentId, left: normalisedLeft, top: normalisedTop});
                    this.lastMove.isValid = this.options.circuit.moveComponentById(target.componentId, newX, newY);
                    target.setValid(this.lastMove.isValid);

                } else if (typeof target.objects != "undefined") {
                    // Component selection has been moved
                    var transformations = [];
                    var canvas = this.canvas;
                    _.each(target.getObjects(), function(c) {
                        var newX = Math.round((normalisedLeft + shiftLeft + c.getLeft()) / GRID_SIZE);
                        var newY =  Math.round((normalisedTop + shiftTop + c.getTop()) / GRID_SIZE);

                        canvas.fire("gate:moving", {
                            id: c.componentId, 
                            left: normalisedLeft + shiftLeft + c.getLeft(), 
                            top: normalisedTop + shiftTop + c.getTop()}
                        );

                        transformations.push({
                            id: c.componentId,
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
