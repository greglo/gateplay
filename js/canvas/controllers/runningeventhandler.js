define([
    "sim/truthvalue"
],
function(TruthValue) {
    function RunningEventHandler(applicationState, controller) {
        this._applicationState = applicationState;
        this._controller = controller;

        var canvas = applicationState.getCanvas();
        canvas.selection = false;

        this._hoverComponent = null;
    }

    
    RunningEventHandler.prototype.keyPressed = function(keyCode) {
    };

    RunningEventHandler.prototype.objectHover = function(target) {
        if (target.class === "gate") {
            this._hoverComponent = target;
        }
    };
    
    RunningEventHandler.prototype.objectOut = function() {
        this._hoverComponent = null;
    };

    RunningEventHandler.prototype.mouseUp = function() {

    };

    RunningEventHandler.prototype.mouseMove = function() {

    };

    RunningEventHandler.prototype.mouseDown = function() {
        if (this._hoverComponent !== null) {
            var simModel = this._applicationState.getSimModel();
            var canvasModel = this._applicationState.getCanvasModel();
            var componentModel = canvasModel.get("components").get(this._hoverComponent.id);

            if (componentModel.get("templateId") === "toggle") {
                var oldValue = componentModel.get("truthValue");
                var newValue;
                if (oldValue === TruthValue.TRUE) {
                    newValue = TruthValue.FALSE;
                } else {
                    newValue = TruthValue.TRUE;
                }

                simModel.setToggleValue(this._hoverComponent.id, newValue);
                componentModel.set("truthValue", newValue);
            }
        }
    };

    RunningEventHandler.prototype.selectionCreated = function() {

    };

    RunningEventHandler.prototype.objectSelected = function() {

    };

    RunningEventHandler.prototype.selectionCleared = function() {

    };



    return RunningEventHandler;
});