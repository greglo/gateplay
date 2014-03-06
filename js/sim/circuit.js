var nextId = 0;
define([
    "underscore",
    "priorityqueue",
    "sim/component",
    "sim/wire",
    "sim/circuitevent",
    "sim/truthvalue"
], function(_, PriorityQueue, Component, Wire, CircuitEvent, TruthValue) {
    function Circuit() {
        this._components = {};
        this._wires = {};
        this._clock = 0;
        this._events = new PriorityQueue({comparator: function(e1, e2) {
            return e1.eventTime - e2.eventTime;
        }});
    }

    Circuit.prototype.containsComponent = function(id) {
        return id in this._components;
    };

    Circuit.prototype.getComponent = function(id) {
        if (this.containsComponent(id)) {
            return this._components[id];
        } else {
            throw "Component with id " + id + " not found";
        }
    };

    Circuit.prototype.addComponent = function(id, functionId, inputCount, outputCount) {
        var component = new Component(id, functionId, inputCount, outputCount);
        this._addComponent(id, component);
    };

    Circuit.prototype._addComponent = function(id, component) {
        if (!this.containsComponent(id)) {
            if (component instanceof Component) {
                this._components[id] = component;
            } else {
                throw "You can only add components to _components"
            }
        } else {
            throw "A component with that id already exists";
        }
    };

    Circuit.prototype.addWire = function(sourceId, sourcePort, destId, destPort) {
        var sourceComponent = this.getComponent(sourceId);
        var destComponent = this.getComponent(destId);
        if (sourceComponent.isValidOutputPort(sourcePort)) {
            if (destComponent.isValidInputPort(destPort)) {
                var wire = new Wire(sourceId, sourcePort, destId, destPort);
                if (!(sourceId in this._wires)) {
                    this._wires[sourceId] = {};
                }
                this._wires[sourceId][sourcePort] = wire;
            }
        }
    };

    Circuit.prototype.getWire = function(componentId, port) {
        if (this.containsComponent(componentId) && this.getComponent(componentId).isValidOutputPort(port)) {
            var componentWires = this._wires[componentId];
            if (typeof componentWires != "undefined" && typeof componentWires[port] != "undefined") {
                return componentWires[port];
            } else {
                return null;
            }
        }
        else
            return null;
    };

    Circuit.prototype.setWireValue = function(componentId, port, truthValue) {
        var wire = this.getWire(componentId, port);
        wire.truthValue = truthValue;
        wire.stableSince = this._clock;
    };

    Circuit.prototype.initialize = function() {
        this._clock = 0;

        var initialCount = 0;
        _.forEach(this._components, function(component, id) {
            if (component.getInputCount() === 0) {
                initialCount++;
                var outputs = component.evaluate([]);
                for (var i = 0; i < outputs.length; i++) {
                    var circuitEvent = new CircuitEvent(0, id, i, outputs[i]);
                    this._addEvent(circuitEvent);
                }
            }
        }, this);

        // REMOVE THIS
        this._addEvent(new CircuitEvent(0, 0, 0, TruthValue.TRUE));

        if (initialCount === 0) {
            console.warn("No initial components in the circuit");
        }
    };

    Circuit.prototype.tick = function() {
        while(this._events.length > 0 && this._events.peek().eventTime <= this._clock) {
            var e = this._events.dequeue();
            var wire = this.getWire(e.sourceId, e.sourcePort);
            if (wire && e.truthValue !== wire.truthValue) {
                var c = this.getComponent(wire.destId);
                c.setFlagged(false);
                var requiredStableSince = Math.max(0, e.eventTime - c.getDelay());
                if (true) {
                    wire.truthValue = e.truthValue
                    var outputs = c.evaluateOneInputChanged(wire.destPort, wire.truthValue);
                    // check to see if outputs have changed
                    for (var i = 0; i < outputs.length; i++) {
                        var w = this.getWire(wire.destId, i);
                        this.getComponent(w.destId).setFlagged(true);
                        if (w && w.truthValue != outputs[i]) {
                            var unknownEvent = new CircuitEvent(e.eventTime + c.getDelay(), c._id, i, TruthValue.UNKNOWN);
                            this._addEvent(unknownEvent);
                            var delta = Math.floor(Math.random() * c.getDelayUncertainty() + 1);
                            delta = c.getDelayUncertainty();
                            var knownEvent = new CircuitEvent(e.eventTime + c.getDelay() + delta, c._id, i, outputs[i]);
                            this._addEvent(knownEvent);
                        }
                    }
                } else {
                    console.log("REJECTED");
                }
            }
        }
        this._clock++;
    };

    Circuit.prototype._addEvent = function(circuitEvent) {
        this._events.queue(circuitEvent)
        console.log(circuitEvent);
    };

    return Circuit;
});