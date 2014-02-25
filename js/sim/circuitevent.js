var nextId = 0;
define([
    "sim/truthvalue"
], function(TruthValue) {
    function CircuitEvent(eventTime, sourceId, sourcePort, truthValue) {
        this.eventTime = eventTime;
        this.sourceId = sourceId;
        this.sourcePort = sourcePort;
        this.truthValue = truthValue;
    }

    return CircuitEvent;
});