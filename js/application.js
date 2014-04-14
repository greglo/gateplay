define([
    "canvas/models/circuit",
    "canvas/views/circuitview",
],
function(CanvasCircuit, CircuitView) {
    function ApplicationState(gridWidth, gridHeight, gridSize) {
        this.MODE_EDIT = "Editing";
        this.MODE_RUN = "Running";

        this.GRID_WIDTH = gridWidth;
        this.GRID_HEIGHT = gridHeight;
        this.GRID_SIZE = gridSize;

        this._mode = this.MODE_EDIT;

        this._canvasModel = new CanvasCircuit({
            width: gridWidth,
            height: gridHeight
        });

        this._canvasView = new CircuitView({
            GRID_SIZE: gridSize,
            circuit: this._canvasModel,
        });
    }

    ApplicationState.prototype.getCanvasModel = function() {
        return this._canvasModel;
    };

    ApplicationState.prototype.getCanvasView = function() {
        return this._canvasView;
    };

    ApplicationState.prototype.addComponent = function(x, y, width, inputCount, outputCount, templateId) {
        if (this._mode === this.MODE_EDIT) {
            this._canvasModel.addComponent(x, y, width, inputCount, outputCount, templateId);
        }
    };

    return ApplicationState;
});