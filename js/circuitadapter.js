define([
    "sim/circuit"
], 
function(SimCircuit) {
    function CircuitAdapter() {
    }

    CircuitAdapter.prototype.createModelFromView = function(viewcircuit) {
        var simcircuit = new SimCircuit();

        if (typeof viewcircuit != "undefined" && viewcircuit) {
            var componentSet = viewcircuit.get("components");
            componentSet.each(function(c) {
                simcircuit.addComponent(c.get("id"), c.get("templateId"), c.get("inputCount"), c.get("outputCount"));
            });

            var wireSet = viewcircuit.get("wires");
            wireSet.each(function(w) {
                simcircuit.addWire(w.get("sourceId"), w.get("sourcePort"), w.get("targetId"), w.get("targetPort"));
            });
        }

        return simcircuit;
    };

    return CircuitAdapter;
})