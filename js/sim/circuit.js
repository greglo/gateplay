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

    Circuit.prototype.addWire = function(id, sourceId, sourcePort, destId, destPort) {
        var sourceComponent = this.getComponent(sourceId);
        var destComponent = this.getComponent(destId);
        if (sourceComponent.isValidOutputPort(sourcePort)) {
            if (destComponent.isValidInputPort(destPort)) {
                var wire = new Wire(id, sourceId, sourcePort, destId, destPort);
                if (!(sourceId in this._wires)) {
                    this._wires[sourceId] = {};
                }
                if (!(sourcePort in this._wires[sourceId])) {
                    this._wires[sourceId][sourcePort] = [];
                }
                this._wires[sourceId][sourcePort].push(wire);
            }
        }
    };

    Circuit.prototype.getWiresFromPort = function(componentId, port) {
        if (this.containsComponent(componentId) && this.getComponent(componentId).isValidOutputPort(port)) {
            var componentWires = this._wires[componentId];
            if (typeof componentWires != "undefined" && typeof componentWires[port] != "undefined") {
                return componentWires[port];
            } else {
                return [];
            }
        }
        else
            return [];
    };

    Circuit.prototype.setWireValue = function(componentId, port, truthValue) {
        var wire = this.getWire(componentId, port);
        wire.truthValue = truthValue;
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

            _.each(eventWires, function(eventWire) {
                this._handleWireEvent(e, eventWire);
            }.bind(this));
        }
        this._clock++;
    };

    Circuit.prototype._handleWireEvent = function(e, eventWire) {
        // If the event is changing something in the circuit
        if (eventWire && eventWire.truthValue !== e.truthValue) {
           
            // If the event is not superceded by a previous event 
            if (e.truthValue === TruthValue.UNKNOWN || e.eventTime >= eventWire.unstableUntil) {
                eventWire.truthValue = e.truthValue;
                this._wireValueChanged(eventWire.id, e.truthValue);
                
                var c = this.getComponent(eventWire.destId);
                var outputs = c.evaluateOneInputChanged(eventWire.destPort, eventWire.truthValue);
                
                // Generate new events for each output
                for (var i = 0; i < outputs.length; i++) {
                    var unknownEvent = new CircuitEvent(e.eventTime + c.getDelay(), c._id, i, TruthValue.UNKNOWN);
                    this._addEvent(unknownEvent);
                    
                    // Only add the second event if it is not a duplicate of the first
                    if (outputs[i] !== TruthValue.UNKNOWN) {
                        var knownEvent = new CircuitEvent(e.eventTime + c.getDelay() + c.getDelayUncertainty(), c._id, i, outputs[i]);
                        this._addEvent(knownEvent);
                    }
                    
                    var outputWires = this.getWiresFromPort(eventWire.destId, i);
                    _.each(outputWires, function(outputWire) {
                        if (outputWire) {
                            outputWire.unstableUntil = (e.eventTime + c.getDelay() + c.getDelayUncertainty());
                        }
                    }.bind(this))
                }

            }

        }
    };

    Circuit.prototype._addEvent = function(circuitEvent) {
        this._events.queue(circuitEvent)
    };


    Circuit.prototype._wireValueChanged = function(id, truthValue) {
        console.log(id + " -> " + truthValue);
    };

    return Circuit;
});