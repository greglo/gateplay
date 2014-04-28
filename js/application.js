define([
    "underscore",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/circuitview",
    "canvas/controllers/circuitcontroller",
],
function(_, fabric, CanvasCircuit, CircuitView, CircuitController) {
    function ApplicationState(gridWidth, gridHeight, gridSize) {
        this.MODE_EDIT = "Editing";
        this.MODE_RUN = "Running";

        this.GRID_WIDTH = gridWidth;
        this.GRID_HEIGHT = gridHeight;
        this.GRID_SIZE = gridSize;

        this._mode = this.MODE_EDIT;
        this._modeListeners = [];

        this._canvasModel = new CanvasCircuit({
            width: gridWidth,
            height: gridHeight
        });

        this._canvas = new fabric.Canvas('workbench');

        this._canvasView = new CircuitView({
            canvas: this._canvas,
            GRID_SIZE: gridSize,
            circuit: this._canvasModel,
        });

        this._canvasController = new CircuitController(this);

        this.addComponent(5, 5, 5, 1, 1, "not");
        this.addComponent(20, 5, 5, 1, 1, "not");
        this.addComponent(13, 15, 5, 1, 1, "not");
        this._canvasModel.addWire(0, 0, 1, 0, []);
        this._canvasModel.addWire(1, 0, 2, 0, [{x: 30, y: 6}, {x: 30, y: 10}, {x: 10, y: 10}, {x: 10, y: 16}]);
        this._canvasModel.addWire(2, 0, 0, 0, [{x: 20, y: 16}, {x: 20, y: 20}, {x: 2, y: 20}, {x: 2, y: 6}]);
    }

    ApplicationState.prototype.getCanvas = function() {
        return this._canvas;
    };

    ApplicationState.prototype.getCanvasModel = function() {
        return this._canvasModel;
    };

    ApplicationState.prototype.getCanvasView = function() {
        return this._canvasView;
    };

    ApplicationState.prototype.getMode = function() {
        return this._mode;
    };

    ApplicationState.prototype.setMode = function(mode) {
        if (this._mode !== mode) {
            this._mode = mode;
            _.each(this._modeListeners, function(f) {
                f(mode);
            });
        }
    };

    ApplicationState.prototype.addModeListener = function(f) {
        this._modeListeners.push(f);
    };

    ApplicationState.prototype.addComponent = function(x, y, width, inputCount, outputCount, templateId) {
        if (this._mode === this.MODE_EDIT) {
            this._canvasModel.addComponent(x, y, width, inputCount, outputCount, templateId);
        }
    };

    ApplicationState.prototype.runButtonPressed = function() {
        if (this._mode === this.MODE_EDIT) {
            this.setMode(this.MODE_RUN);
        } else if (this._mode === this.MODE_RUN) {
            this.setMode(this.MODE_EDIT);
        }
    };

    return ApplicationState;
});