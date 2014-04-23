define([
],
function() {
    function RunningEventHandler(applicationState, controller) {
        this._applicationState = applicationState;
        this._controller = controller;

        var canvas = applicationState.getCanvas();
        canvas.selection = false;
    }

    RunningEventHandler.prototype.mouseUp = function() {

    };

    RunningEventHandler.prototype.mouseMove = function() {

    };

    RunningEventHandler.prototype.mouseDown = function() {

    };

    RunningEventHandler.prototype.selectionCreated = function() {

    };

    RunningEventHandler.prototype.objectSelected = function() {

    };

    RunningEventHandler.prototype.objectHover = function() {

    };

    RunningEventHandler.prototype.objectOut = function() {

    };

    return RunningEventHandler;
});