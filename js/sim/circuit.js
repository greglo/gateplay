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
        this._wiresFromOutput = {};
        this._wiresToComponent = {};
        this._clock = 0;
        this._events = new PriorityQueue({comparator: function(e1, e2) {
            return e1.eventTime - e2.eventTime;
        }});

        this._wireEventListeners = [];
    }

    Circuit.prototype.addWireEventListener = function(f) {
        this._wireEventListeners.push(f);
    };

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

    Circuit.prototype.addWire = function(id, sourceId, sourcePort, destId, destPort) {
        var sourceComponent = this.getComponent(sourceId);
        var destComponent = this.getComponent(destId);

        if (sourceComponent.isValidOutputPort(sourcePort)) {
            if (destComponent.isValidInputPort(destPort)) {
                var wire = new Wire(id, sourceId, sourcePort, destId, destPort);

                if (!(sourceId in this._wiresFromOutput)) {
                    this._wiresFromOutput[sourceId] = {};
                }
                if (!(sourcePort in this._wiresFromOutput[sourceId])) {
                    this._wiresFromOutput[sourceId][sourcePort] = [];
                }
                this._wiresFromOutput[sourceId][sourcePort].push(wire);

                if (!(destId in this._wiresToComponent)) {
                    var component = this.getComponent(destId);
                    var wires = [];
                    for (var i = 0; i < component.getInputCount(); i++) {
                        wires.push(null);
                    }
                    this._wiresToComponent[destId] = wires;
                }
                if (this._wiresToComponent[destId][destPort] === null) {
                    this._wiresToComponent[destId][destPort] = wire;
                } else {
                    throw "You cannot have more than one wire on an input"
                }
            }
        }
    };

    Circuit.prototype.getWiresFromPort = function(componentId, port) {
        if (this.containsComponent(componentId) && this.getComponent(componentId).isValidOutputPort(port)) {
            var componentWires = this._wiresFromOutput[componentId];
            if (typeof componentWires != "undefined" && typeof componentWires[port] != "undefined") {
                return componentWires[port];
            } else {
                return [];
            }
        }
        else
            return [];
    };

    Circuit.prototype._getComponentInputs = function(componentId) {
        if (this.containsComponent(componentId)) {
            var wires = this._wiresToComponent[componentId];
            try {
                return _.pluck(wires, "truthValue");
            } catch (e) {
                throw "Component #" + componentId + " has at least one undefined input";
            }
        } else {
            throw "Component #" + componentId + " does not exist";
        }
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
        this._addEvent(new CircuitEvent(0, 6, 0, TruthValue.TRUE));

        if (initialCount === 0) {
            console.warn("No initial components in the circuit");
        }
    };

    Circuit.prototype.tick = function() {
        // Pop all events which need to be processed
        while (this._events.length > 0 && this._events.peek().eventTime <= this._clock) {
            var e = this._events.dequeue();

            var eventWires = this.getWiresFromPort(e.sourceId, e.sourcePort);
            var affectedComponentIds = {};

            _.each(eventWires, function(eventWire) {
                // If the event is changing something in the circuit
                if (eventWire && eventWire.truthValue !== e.truthValue) {
                    // If the event is not superceded by a previous event 
                    if (e.truthValue === TruthValue.UNKNOWN || e.eventTime >= eventWire.unstableUntil) {
                        this._changeWireValue(eventWire, e.truthValue);
                        affectedComponentIds[eventWire.destId] = true;
                    }
                }
            }.bind(this));

            for (var cid in affectedComponentIds) {
                this._componentInputsChanged(cid, e)
            }
        }
        this._clock++;
    };

    Circuit.prototype._componentInputsChanged = function(cid, e) {
        var c = this.getComponent(cid);
        var inputs = this._getComponentInputs(cid);
        var outputs = c.evaluate(inputs, this._clock);
        
        // Generate new events for each output
        for (var i = 0; i < outputs.length; i++) {
            var unknownTime = e.eventTime + c.getDelay();
            var knownTime = unknownTime + c.getDelayUncertainty();

            var unknownEvent = new CircuitEvent(unknownTime, cid, i, TruthValue.UNKNOWN);
            this._addEvent(unknownEvent);
            
            // Only add the second event if it is not a duplicate of the first
            if (outputs[i] !== TruthValue.UNKNOWN) {
                var knownEvent = new CircuitEvent(knownTime, cid, i, outputs[i]);
                this._addEvent(knownEvent);
            }
            
            var outputWires = this.getWiresFromPort(cid, i);
            _.each(outputWires, function(outputWire) {
                if (outputWire) {
                    outputWire.unstableUntil = knownTime;
                }
            }.bind(this))
        }
    };

    Circuit.prototype._addEvent = function(circuitEvent) {
        this._events.queue(circuitEvent)
    };


    Circuit.prototype._changeWireValue = function(wire, truthValue) {
        wire.truthValue = truthValue;
        _.each(this._wireEventListeners, function(f) {
            f(wire.id, truthValue);
        })
    };

    return Circuit;
});