define([
    "underscore",
    "canvas/models/wire"
],
function(_, Wire) {
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
            objectMoved: false,
            existingSelection: null,
            lastClickPoint: null
        };

        this._drawData = {
            dummyWire: null,
            startPort: null,
            endObject: null,
            endPort: null,
            fixedPoints: [],
            isLastPointSet: true
        };

        this._selectedObjects = [];

        var canvas = applicationState.getCanvas();
        canvas.selection = true;
    }

    EditingEventHandler.prototype.keyPressed = function(keyCode) {
        if (keyCode === 46) {
            var canvasModel = this._applicationState.getCanvasModel();
            var deletionIds = _.pluck(this._selectedObjects, "id");
            _.each(deletionIds, function(id) {
                canvasModel.removeComponent(id);
            });
        }
    }

    EditingEventHandler.prototype.objectHover = function(target, pointer) {
        var GRID_SIZE = this._applicationState.GRID_SIZE;
        var canvasModel = this._applicationState.getCanvasModel();

        // Look to see if we are hovering over a gate
        if (target.class === "gate") {
            var left = pointer.x - target.getLeft();
            var model = canvasModel.get("components").get(target.id);

            var y = Math.floor(pointer.y / GRID_SIZE);
            var midY = model.get("y") + Math.floor(model.getHeight() / 2);
            var inputIndex = (y - midY + model.get("inputCount") - 1) / 2;
            var outputIndex = (y - midY + model.get("outputCount") - 1) / 2;

            if (left >= target.getWidth() - GRID_SIZE && outputIndex % 1 == 0 && outputIndex < model.get("outputCount")) {
                // We are hovering over an output wire
                model.setActiveOutput(outputIndex);
                this._drawData.startPort = outputIndex;
            } else if (left <= GRID_SIZE && inputIndex % 1 == 0 && inputIndex <= model.get("inputCount")) {
                model.setActiveInput(inputIndex);
                this._drawData.endObject = target;
                this._drawData.endPort = inputIndex;
            } else {
                model.clearActivePort();
                this._drawData.startPort = null;
                this._drawData.endObject = null;
            }
        } else {
            // If we are not hovering over a gate, we cannot be drawing wires
            this._drawData.startPort = null;
            this._drawData.endObject = null;
        }

        if (!this._mouse.isDown) {
            this._mouse.startObject = target;
        }
    };

    EditingEventHandler.prototype.objectOut = function(target) {
        // If we just left a gate, clear its active port        
        if (target.class === "gate") {
            var canvasModel = this._applicationState.getCanvasModel();
            var model = canvasModel.get("components").get(target.id);
            if (typeof model != "undefined" && model != null) {
                model.clearActivePort();
            }
            this._drawData.endObject = null;

            if (this._mouse.eventType !== "draw") {
                this._drawData.startPort = null;
            }
        }

        // Clear hover object, if we haven't already changed it
        if (this._mouse.startObject === target) {
            this._mouse.startObject = null;
        }
    };

    EditingEventHandler.prototype.objectSelected = function(selectionEvent) {
        var target = selectionEvent.target;

        target.hasControls = false;

        if (target.class === "gate") {
            // If we are selecting a single gate, bring it to the front
            target.bringToFront();
            this._selectedObjects = [selectionEvent.target];
        } else if (target.getObjects().length > 0) {
            this._selectedObjects = target.getObjects().slice(0);
        }
    };

    EditingEventHandler.prototype.selectionCreated = function(selectionEvent) {
    };

    EditingEventHandler.prototype.selectionCleared = function(selectionEvent) {
        this._selectedObjects = [];
    };

    EditingEventHandler.prototype.mouseDown = function(pointer) {
        this._mouse.isDown = true;
        this._mouse.startX = pointer.x;
        this._mouse.startY = pointer.y;
        var gridX = Math.min(pointer.x / this._applicationState.GRID_SIZE);
        var gridY = Math.min(pointer.y / this._applicationState.GRID_SIZE);


        if (this._mouse.eventType === "draw") {
            var lcp = this._mouse.lastClickPoint;
            if (this._drawData.endObject != null) {
                this._drawingCreated();
                this._mouse.eventType = "";
            } else if (lcp != null && lcp.x === gridX && lcp.y === gridY) {
                // Cancel drawing
                this._drawingCancelled();
                this._mouse.eventType = "";
            } else {
                this._drawingCheckpoint(gridX, gridY);
            }
        } else if (this._mouse.startObject) {
            this._mouse.innerOffsetX = pointer.x - this._mouse.startObject.getLeft();
            this._mouse.innerOffsetY = pointer.y - this._mouse.startObject.getTop();
            
            if (this._drawData.startPort != null) {
                this._mouse.eventType = "draw";
                this._drawingStarted(pointer);
            } else {
                this._mouse.eventType = "move";
                this._movingStarted(pointer);
            }
        }

        this._mouse.lastClickPoint = {
            x: gridX,
            y: gridY
        };
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
                this._mouse.eventType = "";
                break;
        }
    };

    EditingEventHandler.prototype.mouseMove = function(moveEvent) {
        if (this._mouse.eventType === "move" && this._mouse.isDown && this._mouse.startObject) {
            // Do not fire events if we have selected other objects, but start dragging from this one
            if (this._mouse.existingSelection === null || this._mouse.existingSelection === this._mouse.startObject) {
                this._moving(moveEvent);
            }
        } else if (this._mouse.eventType === "draw") {
            this._drawing(moveEvent);
        }
    };

    EditingEventHandler.prototype._movingStarted = function(pointer) {
        var startObject = this._mouse.startObject;
        this._mouse.objectStartX = startObject.left;
        this._mouse.objectStartY = startObject.top;
    }

    EditingEventHandler.prototype._moving = function(moveEvent) {
        if (this.isValidTarget(this._mouse.startObject)) {
            var pointer = this._applicationState.getCanvas().getPointer(moveEvent.e);

            this._mouse.startObject.set({
                left: pointer.x - this._mouse.innerOffsetX,
                top: pointer.y - this._mouse.innerOffsetY
            });

            this._updateLocation(this._mouse.startObject);
        }
    };

    EditingEventHandler.prototype._movingStopped = function() {
        if (this._mouse.startObject && this.isValidTarget(this._mouse.startObject)) {
            if (this._mouse.isValidMove) {
                if (this._mouse.objectMoved && this._selectedObjects) {
                    var canvasModel = this._applicationState.getCanvasModel();
                    _.each(this._selectedObjects, function(object) {
                        canvasModel.removeWiresFromComponent(object.id);
                    });
                }
            } else {
                // If we made an invalid move, set the object back to its original position
                this._mouse.startObject.set({
                    left: this._mouse.startX - this._mouse.innerOffsetX,
                    top: this._mouse.startY - this._mouse.innerOffsetY
                });
                this._updateLocation(this._mouse.startObject);
            }
        }
    };

    EditingEventHandler.prototype._drawingStarted = function(pointer) {
        var GRID_SIZE = this._applicationState.GRID_SIZE;
        var x = Math.floor(pointer.x / GRID_SIZE);
        var y = Math.floor(pointer.y / GRID_SIZE);
        this._drawData.fixedPoints = [];

        this._drawData.wireId = this._applicationState.getCanvasModel().addWire(
            this._mouse.startObject.id,
            this._drawData.startPort,
            -1,
            -1,
            this._drawData.fixedPoints
        );

    }

    EditingEventHandler.prototype._drawing = function(moveEvent) {
        var pointer = this._applicationState.getCanvas().getPointer(moveEvent.e);

        var GRID_SIZE = this._applicationState.GRID_SIZE;
        var x = Math.floor(pointer.x / GRID_SIZE);
        var y = Math.floor(pointer.y / GRID_SIZE);

        var newFixedPoints = this._drawData.fixedPoints.slice(0);

        if (!this._drawData.isLastPointSet) {
            newFixedPoints.pop();
            newFixedPoints.pop();
        }

        var oldX;
        var oldY;
        if (newFixedPoints.length === 0) {
            oldX = Math.floor(this._mouse.startX / this._applicationState.GRID_SIZE);
            oldY = Math.floor(this._mouse.startY / this._applicationState.GRID_SIZE);
        } else {
            var lastPoint = newFixedPoints[newFixedPoints.length - 1];
            oldX = lastPoint.x;
            oldY = lastPoint.y;
        }

        newFixedPoints.push({
            x: x, 
            y: oldY
        });
        newFixedPoints.push({
            x: x, 
            y: y
        });

        this._drawData.isLastPointSet = false;

        var canvasModel = this._applicationState.getCanvasModel();
        canvasModel.get("wires").get(this._drawData.wireId).set("fixedPoints", newFixedPoints);

        this._drawData.fixedPoints = newFixedPoints;
    };

    EditingEventHandler.prototype._drawingCreated = function() {
        var canvasModel = this._applicationState.getCanvasModel();
        var wireModel = canvasModel.get("wires").get(this._drawData.wireId);
        wireModel.set("targetId", this._drawData.endObject.id);
        wireModel.set("targetPort", this._drawData.endPort);
        this._drawData.wireId = null;
    };

    EditingEventHandler.prototype._drawingCancelled = function() {
        var canvasModel = this._applicationState.getCanvasModel();
        canvasModel.removeWire(this._drawData.wireId);
        this._drawData.wireId = null;
    };

    EditingEventHandler.prototype._drawingCheckpoint = function(gridX, gridY) {
        this._drawData.isLastPointSet = true;
    };

    EditingEventHandler.prototype._updateLocation = function(target) {
        if (target != null && this.isValidTarget(target)) {
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

            var objectMoved = false;
            objectMoved = objectMoved || this._mouse.objectStartX != target.left;
            objectMoved = objectMoved || this._mouse.objectStartY != target.top;
            this._mouse.objectMoved = objectMoved;


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

    EditingEventHandler.prototype.isValidTarget = function(target) {
        if (!target && typeof target != "undefined")
            return false;

        var validOrigin = target.originX === "center" || target.originX === "left";
        var isGatePlayObject = typeof target.id != "undefined" || typeof target.objects != "undefined";
        return validOrigin && isGatePlayObject;
    };

    return EditingEventHandler;
});