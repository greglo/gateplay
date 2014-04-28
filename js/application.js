define([
    "underscore",
    "fabric",
    "canvas/models/circuit",
    "canvas/views/circuitview",
    "canvas/controllers/circuitcontroller",
    "sim/circuit",
],
function(_, fabric, CanvasCircuit, CircuitView, CircuitController, SimCircuit) {
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

        var id1 = this.addComponent(5, 5, 5, 1, 1, "not");
        var id2 = this.addComponent(20, 5, 5, 1, 1, "not");
        var id3 = this.addComponent(35, 5, 5, 1, 1, "not");
        var id4 = this.addComponent(13, 15, 5, 1, 1, "not");
        this._canvasModel.addWire(id1, 0, id2, 0, []);
        this._canvasModel.addWire(id2, 0, id3, 0, []);
        this._canvasModel.addWire(id3, 0, id4, 0, [{x: 43, y: 6}, {x: 43, y: 10}, {x: 10, y: 10}, {x: 10, y: 16}]);
        this._canvasModel.addWire(id4, 0, id1, 0, [{x: 20, y: 16}, {x: 20, y: 20}, {x: 2, y: 20}, {x: 2, y: 6}]);
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

            if (mode === this.MODE_EDIT) {
                this._nowEditing();
            } else if (mode === this.MODE_RUN) {
                this._nowRunning();
            }
        }
    };

    ApplicationState.prototype.addModeListener = function(f) {
        this._modeListeners.push(f);
    };

    ApplicationState.prototype.addComponent = function(x, y, width, inputCount, outputCount, templateId) {
        if (this._mode === this.MODE_EDIT) {
            return this._canvasModel.addComponent(x, y, width, inputCount, outputCount, templateId);
        }
    };

    ApplicationState.prototype.runButtonPressed = function() {
        if (this._mode === this.MODE_EDIT) {
            this.setMode(this.MODE_RUN);
        } else if (this._mode === this.MODE_RUN) {
            this.setMode(this.MODE_EDIT);
        }
    };

    ApplicationState.prototype._nowRunning = function() {
        var simulation = new SimCircuit();
        this.simulation = simulation;

        // Add components
        var components = this._canvasModel.get("components");
        _.each(components.models, function(c) {
            simulation.addComponent(c.get("id"), c.get("templateId"), c.get("inputCount"), c.get("outputCount"));
        })

        // Add wires
        var wires = this._canvasModel.get("wires");
        _.each(wires.models, function(wire) {
            simulation.addWire(wire.get("id"), wire.get("sourceId"), wire.get("sourcePort"), wire.get("targetId"), wire.get("targetPort"));
        })

        simulation.initialize();
        simulation.addWireEventListener(function(id, truthValue) {
            var wire = wires.get(id);
            wire.set("truthValue", truthValue);
        })
        setInterval(this._tick.bind(this), 150);
    };

    ApplicationState.prototype._tick = function() {
        this.simulation.tick();
    }

    return ApplicationState;
});