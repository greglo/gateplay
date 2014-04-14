define([
    "underscore",
    "backbone",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/componentview",
    "canvas/views/componentsetview",
], function(_, Backbone, fabric, Circuit, ComponentView, ComponentSetView) {
    return Backbone.View.extend({

        _mouseData: {
            eventType: "",              // "move", "draw"
            startObject: null,
            innerOffsetX: null,
            innerOffsetY: null,
            startX: null,
            startY: null,
            isDown: false,
            isValidMove: false
        },

        _temporaryWire: null,

        //mouse: {
        //    startX: null,
        //    startY: null,
        //    isDown: false,
        //    hoverObject: null
        //},

        //lastMove: {
        //    isValid: false,
        //},

        getMouseData: function(identifier) {
            return this._mouseData[identifier];
        },

        setMouseData: function(identifier, value) {
            this._mouseData[identifier] = value;
        },

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

            // Bind component set change events to handlers
            this.options.components.on("add", this._addComponent, this);
            this.options.components.on("remove", this.render, this);

            // Create fabricjs canvas
            this.options.canvas = new fabric.Canvas('workbench', { 
                hasControls: false,
                selection: true
            });

            var view = this;

            this.options.canvas.findTarget = (function(originalFn) {
                return function() {
                    var target = originalFn.apply(this, arguments);
                    var e = arguments[0];
                    if (target) {
                        target.fire("mouseover", e);
                        this.fire("object:hover", {e: e, target: target});
                        if (this._hoveredTarget !== target) {
                            if (this._hoveredTarget) {
                                this.fire("object:out", this._hoveredTarget);
                                this._hoveredTarget.fire("mouseout", e);
                            }
                        }
                        this._hoveredTarget = target;
                    } else if (this._hoveredTarget) {
                        this.fire("object:out", this._hoveredTarget);
                        this._hoveredTarget.fire("mouseout", e);
                        this._hoveredTarget = null;
                    }
                    return target;
                };
            })(this.options.canvas.findTarget);

            this.options.canvas.on("mouse:down", function(e) {
                // If port flag set, then set dragging wire flag

                var pointer = view.options.canvas.getPointer(e.e);
                view.setMouseData("isDown", true);
                view.setMouseData("startX", pointer.x);
                view.setMouseData("startY", pointer.y);

                var startObject = view.getMouseData("startObject");
                if (startObject) {
                    view.setMouseData("innerOffsetX", pointer.x - startObject.getLeft());
                    view.setMouseData("innerOffsetY", pointer.y - startObject.getTop());
                }

                switch (view.getMouseData("eventType")) {
                    case "move":

                        break;

                    case "draw":
                        console.log("Started drawing wire");
                        break;
                }
            });

            this.options.canvas.on('mouse:up', function(upEvent) { 
                // If dragging wire, check destination location
                view.setMouseData("isDown", false);

                var eventType = view.getMouseData("eventType");
                var startObject = view.getMouseData("startObject");
                switch (eventType) {
                    case "move":
                        // If we made an invalid move, set the object back to its original position
                        if (startObject && view._isValidTarget(startObject) && !view.getMouseData("isValidMove")) {
                            startObject.set({
                                left: view.getMouseData("startX") - view.getMouseData("innerOffsetX"),
                                top: view.getMouseData("startY") - view.getMouseData("innerOffsetY")
                            });
                            view._updateLocation(startObject);
                        }
                        break;

                    case "draw":
                        var endObject = view.options.canvas.findTarget(upEvent.e, true);
                        console.log(endObject);
                        break;
                }
            });    

            this.options.canvas.on("mouse:move", function(moveEvent) {
                // If dragging wire, draw the wire?
                var eventType = view.getMouseData("eventType");
                var startObject = view.getMouseData("startObject");
                if (startObject && view.getMouseData("isDown")) {
                    switch (eventType) {
                        case "move":
                            if (view._isValidTarget(startObject)) {
                                var pointer = view.options.canvas.getPointer(moveEvent.e);
                                startObject.set({
                                    left: pointer.x - view.getMouseData("innerOffsetX"),
                                    top: pointer.y - view.getMouseData("innerOffsetY"),
                                });
                                console.log("move");
                                view._updateLocation(startObject);
                            }
                            break;

                        case "draw":
                            view.options.canvas.remove(view.getTemporaryWire());
                            var x1 = view.getMouseData("startX");
                            var y1 = view.getMouseData("startY");
                            var pointer = view.options.canvas.getPointer(moveEvent.e);
                            var wire = new fabric.Line([x1, y1, pointer.x, pointer.y], {
                                strokeWidth: view.options.GRID_SIZE,
                                stroke: "black",
                                originX: "center",
                                originY: "center",
                                selectable: false
                            });
                            view.setTemporaryWire(wire);
                            view.options.canvas.add(wire);
                            break;
                    }
                }
            });

            this.options.canvas.on("object:hover", function(hoverEvent) {
                var pointer = view.options.canvas.getPointer(hoverEvent.e);
                var target = hoverEvent.target;
                var GRID_SIZE = view.options.GRID_SIZE;

                // Look to see if we are hovering over a gate
                view.setMouseData("eventType", "move");
                if (target.class === "gate") {
                    var left = pointer.x - target.getLeft();
                    var top = pointer.y - target.getTop();
                    var model = view.options.components.get(target.id);
                    if (left < GRID_SIZE && Math.floor(top / GRID_SIZE) % 2 == 1) {
                        var inputIndex = Math.floor(top / (2 * GRID_SIZE));
                        model.setActiveInput(inputIndex);
                        view.setMouseData("eventType", "draw");
                    } else if (false) {

                        view.setMouseData("eventType", "draw");
                    } else {
                        model.clearActivePort();
                        view.setMouseData("eventType", "move");
                    }
                }
                view.setMouseData("startObject", target);
            });

            this.options.canvas.on("object:out", function(target) {
                // If we just left a gate, clear its active port                
                if (target.class === "gate") {
                    var model = view.options.components.get(target.id);
                    model.clearActivePort();
                }

                // Clear hover object, if we haven't already changed it
                if (view.getMouseData("startObject") === target)
                    view.setMouseData("startObject", null);
            });

            this.options.canvas.on('object:selected', function(selectedEvent) {
                selectedEvent.target.hasControls = false;

                // If we are selecting a single gate, bring it to the front
                if (selectedEvent.target.class === "gate") {
                    selectedEvent.target.bringToFront();
                }
            });     

            this.options.canvas.on('selection:created', function(e) {
                // If we are selecting multiple objects, bring each of them to the front in turn
                _.each(e.target.objects, function(object) {
                    object.bringToFront();
                });
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
            view.render(); 
        },

        _isValidTarget: function(target) {
            if (!target && typeof target != "undefined")
                return false;

            var validOrigin = target.originX === "center" || target.originX === "left";
            var isGatePlayObject = typeof target.id != "undefined" || typeof target.objects != "undefined";
            return validOrigin && isGatePlayObject;
        },

        _updateLocation: function(target) {
            if (target != null && this._isValidTarget(target)) {
                var GRID_SIZE = this.options.GRID_SIZE;
                var model = this.comp
                var targetWidth = target.getWidth();
                var targetHeight = target.getHeight();

                // Objects can be defined by their top left corner, their center, etc...
                // We do our calculations with their top left corner values
                var normalisedLeft;
                var normalisedTop;
                var shiftLeft;
                var shiftTop;

                // Normalise according by moving all positions into a top-left coordinate system
                if (target.originX === "center") {
                    normalisedLeft = Math.round((2 * target.left - targetWidth) / (2 * GRID_SIZE)) * GRID_SIZE;
                    normalisedTop = Math.round((2 * target.top - targetHeight) / (2 * GRID_SIZE)) * GRID_SIZE;
                    shiftLeft = targetWidth / 2;
                    shiftTop = targetHeight / 2;
                }
                else if (target.originX === "left") {
                    normalisedLeft = Math.round(target.left / GRID_SIZE) * GRID_SIZE;
                    normalisedTop = Math.round(target.top / GRID_SIZE) * GRID_SIZE;
                    shiftLeft = 0;
                    shiftTop = 0;
                }

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
                    var newX = Math.round(normalisedLeft / GRID_SIZE);
                    var newY = Math.round(normalisedTop / GRID_SIZE);
                    var isValid = this.options.circuit.moveComponentById(target.id, newX, newY);
                    this.setMouseData("isValidMove", isValid);
                    this.options.components.get(target.id).set("isValid", isValid);

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
                    this.setMouseData("isValidMove", isValid);

                    _.each(target.objects, function(c) {
                        this.options.components.get(c.id).set("isValid", isValid);
                    }, this);
                } else {
                    console.log("Unrecognised object type: aborting move");
                }
            }
        }   
    });
});
