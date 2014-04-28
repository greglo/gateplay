var nextId = 0;
define([
    "sim/truthvalue"
], function(TruthValue) {
    function Wire(id, sourceId, sourcePort, destId, destPort) {
        this.id = id;
        this.sourceId = sourceId;
        this.sourcePort = sourcePort;
        this.destId = destId;
        this.destPort = destPort;
        this.truthValue = TruthValue.UNKNOWN;
        this.unstableUntil = 0;
    }

    return Wire;
});