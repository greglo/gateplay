define([
    "underscore"
],
function(_) {
    function EditingEventHandler(applicationState, controller) {
        this._applicationState = applicationState;
        this._controller = controller;

        this._mouse = {
            eventType: "",              // "move", "draw"
            startObject: null,
            innerOffsetX: null,
            innerOffsetY: null,
            startX: null,
            startY: null,
            isDown: false,
            isValidMove: false,
            existingSelection: null
        }

        var canvas = applicationState.getCanvas();
        canvas.selection = true;
    }

    EditingEventHandler.prototype.objectHover = function(target, pointer) {
        var GRID_SIZE = this._applicationState.GRID_SIZE;
        var canvasModel = this._applicationState.getCanvasModel();

        // Look to see if we are hovering over a gate
        if (target.class === "gate") {
            var left = pointer.x - target.getLeft();
            var top = pointer.y - target.getTop();
            var model = canvasModel.get("components").get(target.id);

            if (left < GRID_SIZE && Math.floor(top / GRID_SIZE) % 2 == 1) {
                var inputIndex = Math.floor(top / (2 * GRID_SIZE));
                model.setActiveInput(inputIndex);
                this._mouse.eventType = "draw";
            } else if (false) {
                // output
                this._mouse.eventType = "draw";
            } else {
                model.clearActivePort();
                this._mouse.eventType = "move";
            }
        } else {
            // If we are not hovering over a gate, we cannot be drawing wires
            this._mouse.eventType = "move";
        }

        // We only record the potential start to a draw if the mouse isn't already down
        if (!this._mouse.isDown) {
            this._mouse.startObject = target;
        }
    };

    EditingEventHandler.prototype.objectOut = function(target) {
        // If we just left a gate, clear its active port                
        if (target.class === "gate") {
            var canvasModel = this._applicationState.getCanvasModel();
            var model = canvasModel.get("components").get(target.id);
            model.clearActivePort();
        }

        // Clear hover object, if we haven't already changed it
        if (this._mouse.startObject === target) {
            this._mouse.startObject = null;
        }
    };

    EditingEventHandler.prototype.objectSelected = function(selectionEvent) {
        selectionEvent.target.hasControls = false;

        // If we are selecting a single gate, bring it to the front
        if (selectionEvent.target.class === "gate") {
            selectionEvent.target.bringToFront();
        }
    };

    EditingEventHandler.prototype.selectionCreated = function(selectionEvent) {
        // If we are selecting multiple objects, bring each of them to the front in turn
        _.each(selectionEvent.target.objects, function(object) {
            object.bringToFront();
        });
    };

    EditingEventHandler.prototype.mouseDown = function(pointer) {
        this._mouse.isDown = true;
        this._mouse.startX = pointer.x;
        this._mouse.startY = pointer.y;

        if (this._mouse.startObject) {
            this._mouse.innerOffsetX = pointer.x - this._mouse.startObject.getLeft();
            this._mouse.innerOffsetY = pointer.y - this._mouse.startObject.getTop();
            
            switch (this._mouse.eventType) {
                case "move":
                    this._movingStarted();
                    break;

                case "draw":
                    this._drawingStarted();
                    break;
            }
        }

    };

    EditingEventHandler.prototype.mouseUp = function(mouseEvent) {
        this._mouse.isDown = false;

        var canvas = this._applicationState.getCanvas();
        if (canvas.getActiveGroup() !== null) {
            this._mouse.existingSelection = canvas.getActiveGroup();
        } else {
            this._mouse.existingSelection = null;
        }

        switch (this._mouse.eventType) {
            case "move":
                this._movingStopped();
                break;

            case "draw":
                this._drawingStopped(mouseEvent);
                break;
        }
    };

    EditingEventHandler.prototype.mouseMove = function(moveEvent) {
        if (this._mouse.startObject && this._mouse.isDown) {
            // Do not fire events if we have selected other objects, but start dragging from this one
            if (this._mouse.existingSelection === null || this._mouse.existingSelection === this._mouse.startObject) {
                console.log(this._mouse.eventType);
                switch (this._mouse.eventType) {
                    case "move":
                        this._moving(moveEvent);
                        break;

                    case "draw":
                        this._drawing(moveEvent);
                        break;
                }
            }
        }
    };

    EditingEventHandler.prototype._movingStarted = function() {
    }

    EditingEventHandler.prototype._moving = function(moveEvent) {
        if (this._controller.isValidTarget(this._mouse.startObject)) {
            var pointer = this._applicationState.getCanvas().getPointer(moveEvent.e);

            this._mouse.startObject.set({
                left: pointer.x - this._mouse.innerOffsetX,
                top: pointer.y - this._mouse.innerOffsetY
            });

            this._updateLocation(this._mouse.startObject);
        }
    };

    EditingEventHandler.prototype._movingStopped = function() {
        // If we made an invalid move, set the object back to its original position
        
        if (this._mouse.startObject && this._controller.isValidTarget(this._mouse.startObject) && !this._mouse.isValidMove) {
            this._mouse.startObject.set({
                left: this._mouse.startX - this._mouse.innerOffsetX,
                top: this._mouse.startY - this._mouse.innerOffsetY
            });
            this._updateLocation(this._mouse.startObject);
        }
    };

    EditingEventHandler.prototype._drawingStarted = function() {
    }

    EditingEventHandler.prototype._drawing = function() {
        /*
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
        */
    };

    EditingEventHandler.prototype._drawingStopped = function() {

    };

    EditingEventHandler.prototype._updateLocation = function(target) {
        if (target != null && this._controller.isValidTarget(target)) {
            var GRID_SIZE = this._applicationState.GRID_SIZE;
            var canvas = this._applicationState.getCanvas();
            var circuit = this._applicationState.getCanvasModel();
            var components = circuit.get("components");


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
            normalisedLeft = Math.min(canvas.getWidth(), normalisedLeft + targetWidth) - targetWidth;
            normalisedTop = Math.max(normalisedTop, 0);
            normalisedTop = Math.min(canvas.getHeight(), normalisedTop + targetHeight) - targetHeight;

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
                var isValid = circuit.moveComponentById(target.id, newX, newY);
                this._mouse.isValidMove = isValid;
                components.get(target.id).set("isValid", isValid);

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
                var isValid = circuit.moveGroupByIds(transformations);
                this._mouse.isValidMove = isValid;

                _.each(target.objects, function(c) {
                    components.get(c.id).set("isValid", isValid);
                });
            } else {
                console.warn("Unrecognised object type: aborting move");
            }
        }
    };

    return EditingEventHandler;
});