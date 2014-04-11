var nextId = 0;
define([
    "sim/truthvalue"
], function(TruthValue) {
    function Wire(sourceId, sourcePort, destId, destPort) {
        this.sourceId = sourceId;
        this.sourcePort = sourcePort;
        this.destId = destId;
        this.destPort = destPort;
        this.truthValue = TruthValue.UNKNOWN;
        this.unstableUntil = 0;
    }

    return Wire;
});