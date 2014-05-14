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
        this._blinkers = [];
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

    Circuit.prototype.addComponent = function(id, functionId, inputCount, outputCount, cArg) {
        var component = new Component(id, functionId, inputCount, outputCount, cArg);
        this._addComponent(id, component);
        if (functionId === "blinker") {
            this._blinkers.push(component);
        }
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

    Circuit.prototype._getComponentOutputs = function(componentId) {
        var component = this.getComponent(componentId);
        var outputs = [];

        for (var i = 0; i < component.getOutputCount(); i++) {
            var value = TruthValue.UNKNOWN;
            var wires = this.getWiresFromPort(componentId, i);
            if (wires.length > 0) {
                value = wires[0].truthValue;
            }

            outputs.push(value);
        }

        return outputs;
    };

    Circuit.prototype.setToggleValue = function(componentId, truthValue) {
        var component = this.getComponent(componentId);

        if (component.getFuncId() === "toggle") {
            this._addEvent(new CircuitEvent(this._clock, componentId, 0, truthValue))
        } else {
            throw "Component #" + componentId + " is not a toggle";
        }
    };

    Circuit.prototype.initialize = function() {
        this._clock = 0;

        var initialCount = 0;
        _.forEach(this._components, function(component, id) {
            if (component.getInputCount() === 0) {
                initialCount++;
                var outputs = component.evaluate([], this._clock);
                for (var i = 0; i < outputs.length; i++) {
                    var circuitEvent = new CircuitEvent(0, id, i, outputs[i]);
                    this._addEvent(circuitEvent);
                }
            }
        }, this);

        if (initialCount === 0) {
            console.warn("No initial components in the circuit");
        }
    };

    Circuit.prototype.tick = function() {
        // A particularly inefficient solution
        _.forEach(this._blinkers, function(blinker) {
            var outputs = blinker.evaluate([], this._clock);
            for (var i = 0; i < outputs.length; i++) {
                var circuitEvent = new CircuitEvent(this._clock, blinker._id, i, outputs[i]);
                this._addEvent(circuitEvent);
            }
        }, this);

        if (this._events.length > 0) {
            var lowestEventTime = this._events.peek().eventTime;

                while (lowestEventTime <= this._clock) {
                    var affectedComponentIds = {};

                    // Pop all events of lowestEventTime
                    while (this._events.length > 0 && this._events.peek().eventTime === lowestEventTime) {
                        var e = this._events.dequeue();
                        var eventWires = this.getWiresFromPort(e.sourceId, e.sourcePort);

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
                    }

                    for (var cid in affectedComponentIds) {
                        this._componentInputsChanged(cid, lowestEventTime)
                    }

                    lowestEventTime++;
                }
        }

        this._clock++;
    };

    Circuit.prototype._componentInputsChanged = function(cid, eventTime) {
        var c = this.getComponent(cid);
        var previousOutputs = this._getComponentOutputs(cid);
        var inputs = this._getComponentInputs(cid);
        var outputs = c.evaluate(inputs, this._clock);
        
        // Generate new events for each output which changes
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i] === TruthValue.UNKNOWN || outputs[i] !== previousOutputs[i]) {
                var unknownTime = eventTime + c.getDelay();
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
        }
    };

    Circuit.prototype._addEvent = function(circuitEvent) {
        this._events.queue(circuitEvent);
        console.log("Event added: " + circuitEvent.truthValue);
    };


    Circuit.prototype._changeWireValue = function(wire, truthValue) {
        wire.truthValue = truthValue;
        _.each(this._wireEventListeners, function(f) {
            f(wire.id, truthValue);
        })
    };

    return Circuit;
});