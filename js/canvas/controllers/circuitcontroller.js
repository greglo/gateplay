define([
    "canvas/controllers/editingeventhandler",
    "canvas/controllers/runningeventhandler",    
],
function(EditingEventHandler, RunningEventHandler) {
    function CircuitController(applicationState) {
        this._applicationState = applicationState;
        this._canvas = applicationState.getCanvas();

        this._modeChanged(this._applicationState.getMode());
        this._applicationState.addModeListener(this._modeChanged.bind(this));

        this._mouse = {
            eventType: "",              // "move", "draw"
            startObject: null,
            innerOffsetX: null,
            innerOffsetY: null,
            startX: null,
            startY: null,
            isDown: false,
            isValidMove: false
        }

        // Canvas now also fires object:hover, object:out, mouseover events
        this._canvas.findTarget = (function(originalFn) {
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
        })(this._canvas.findTarget);

        this._canvas.on("object:hover", this._objectHover.bind(this));
        this._canvas.on("object:out", this._objectOut.bind(this));
        this._canvas.on("object:selected", this._objectSelected.bind(this));
        this._canvas.on("selection:created", this._selectionCreated.bind(this));

        this._canvas.on("mouse:down", this._mouseDown.bind(this));
        this._canvas.on("mouse:up", this._mouseUp.bind(this));
        this._canvas.on("mouse:move", this._mouseMove.bind(this));
    }


    CircuitController.prototype.isValidTarget = function(target) {
        if (!target && typeof target != "undefined")
            return false;

        var validOrigin = target.originX === "center" || target.originX === "left";
        var isGatePlayObject = typeof target.id != "undefined" || typeof target.objects != "undefined";
        return validOrigin && isGatePlayObject;
    };

    CircuitController.prototype._modeChanged = function(mode) {
        if (mode === this._applicationState.MODE_EDIT) {
            this._mode = mode;
            this._eventHandler = new EditingEventHandler(this._applicationState, this);

        } else if (mode === this._applicationState.MODE_RUN) {
            this._mode = mode;
            this._eventHandler = new RunningEventHandler(this._applicationState, this);
        }
    };

    CircuitController.prototype._objectHover = function(hoverEvent) {
        var target = hoverEvent.target;
        var pointer = this._canvas.getPointer(hoverEvent.e);
        this._eventHandler.objectHover(target, pointer);
    }

    CircuitController.prototype._objectOut = function(target) {
        this._eventHandler.objectOut(target);
    }

    CircuitController.prototype._objectSelected = function(selectionEvent) {
        this._eventHandler.objectSelected(selectionEvent);
    }

    CircuitController.prototype._selectionCreated = function(selectionEvent) {
        this._eventHandler.selectionCreated(selectionEvent);
    }

    CircuitController.prototype._mouseDown = function(mouseEvent) {
        var pointer = this._canvas.getPointer(mouseEvent.e);
        this._eventHandler.mouseDown(pointer);
    };

    CircuitController.prototype._mouseUp = function(mouseEvent) { 
        this._eventHandler.mouseUp(mouseEvent);
    };    

    CircuitController.prototype._mouseMove = function(moveEvent) { 
        this._eventHandler.mouseMove(moveEvent);
    };    

    return CircuitController;
});