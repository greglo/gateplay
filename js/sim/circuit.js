var nextId = 0;
define([
    "underscore",
    "priorityqueue",
    "sim/component",
    "sim/wire",
    "sim/circuitevent",
], function(_, PriorityQueue, Component, Wire, CircuitEvent) {
    function Circuit() {
        this._components = {};
        this._wires = {};
        this._clock = 0;
        this._events = new PriorityQueue({comparator: function(e1, e2) {
            return e2.eventTime - e1.eventTime;
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

        if (sourceComponent.isValidInputPort(sourcePort)) {
            if (destComponent.isValidOutputPort(destPort)) {
                var wire = new Wire(sourceId, sourcePort, destId, destPort);
            }
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

        if (initialCount === 0) {
            console.warn("No initial components in the circuit");
        }
    };

    Circuit.prototype.tick = function() {
        
    };

    Circuit.prototype._addEvent = function(circuitEvent) {
        console.log(circuitEvent);
    };

    return Circuit;
});