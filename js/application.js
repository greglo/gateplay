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
        this._clockListeners = [];

        this._clock = 0;
        this._autoTick = false;
        this._tickMillis = 200;

        this._canvasModel = new CanvasCircuit({
            width: gridWidth,
            height: gridHeight
        });

        this._canvas = new fabric.Canvas('workbench', {
            CURSOR: "pointer"
        });

        this._canvasView = new CircuitView({
            canvas: this._canvas,
            GRID_SIZE: gridSize,
            circuit: this._canvasModel,
        });

        this._canvasController = new CircuitController(this);
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

            if (mode === this.MODE_RUN) {
                this._nowRunning();
            } else if (mode === this.MODE_EDIT) {
                this._nowEditing();
            }
        }
    };

    ApplicationState.prototype.addModeListener = function(f) {
        this._modeListeners.push(f);
    };

    ApplicationState.prototype.addClockListener = function(f) {
        this._clockListeners.push(f);
    };

    ApplicationState.prototype.addComponent = function(x, y, inputCount, outputCount, templateId) {
        if (this._mode === this.MODE_EDIT) {
            return this._canvasModel.addComponent(x, y, inputCount, outputCount, templateId);
        }
    };

    ApplicationState.prototype.changeSimulationSpeed = function(tickMillis) {
        this._tickMillis = tickMillis;
    };

    ApplicationState.prototype.resetButtonPressed = function() {
        if (this._mode === this.MODE_RUN) {
            this._autoTick = false;
            this._nowRunning();
        }
    };

    ApplicationState.prototype.runButtonPressed = function() {
        if (this._mode === this.MODE_RUN && this._autoTick === false) {
            this._autoTick = true;
            this._tick();
        }
    };

    ApplicationState.prototype.pauseButtonPressed = function() {
        this._autoTick = false;
    };

    ApplicationState.prototype.tickButtonPressed = function() {
        this._tick();
    };

    ApplicationState.prototype._nowRunning = function() {
        this._setClock(0);

        // Create new simulator
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

            wire.set("truthValue", "Unknown");
        })

        simulation.initialize();
        simulation.addWireEventListener(function(id, truthValue) {
            var wire = wires.get(id);
            wire.set("truthValue", truthValue);
        })
    };

    ApplicationState.prototype._tick = function() {
        this.simulation.tick();
        this._setClock(this._clock + 1);

        if (this._mode === this.MODE_RUN && this._autoTick) {
            setTimeout(this._tick.bind(this), this._tickMillis);
        }
    }

    ApplicationState.prototype._setClock = function(clock) {
        this._clock = clock;
        _.each(this._clockListeners, function(f) {
            f(this._clock);
        }.bind(this));
    }

    ApplicationState.prototype._nowEditing = function() {
        var wires = this._canvasModel.get("wires");
        _.each(wires.models, function(wire) {
            wire.set("truthValue", "Unknown");
        })
    };

    return ApplicationState;
});