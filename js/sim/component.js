var nextId = 0;
define([
    "underscore",
    "sim/functions"
], function(_, Functions) {
    function Component(id, funcId, inputCount, outputCount) {
        this._id = id;
        this._funcId = funcId;
        this._inputCount = inputCount;
        this._outputCount = outputCount;

        this._evalFunc = Functions.get(funcId);
    }

    Component.prototype.getInputCount = function() {
        return this._inputCount;
    };

    Component.prototype.getOutputCount = function() {
        return this._outputCount;
    };

    Component.prototype.getDelay = function() {
        return this._evalFunc.getDelay();
    };

    Component.prototype.getDelayUncertainty = function() {
        return this._evalFunc.getMaxUncertaintyDuration();
    };

    Component.prototype.isValidInputPort = function(portId) {
        return 0 <= portId && portId < this.getInputCount();
    };

    Component.prototype.isValidOutputPort = function(portId) {
        return 0 <= portId && portId < this.getOutputCount();
    };

    Component.prototype.evaluate = function(truthValues, clock) {
        if (typeof truthValues == "undefined" || !truthValues instanceof Array)
            throw "truthValues must be of type Array";

        if (truthValues.length != this._inputCount)
            throw "truthValues must be of the same size as _inputCount";

        var outputs = this._evalFunc.evaluate(truthValues, clock);
        if (outputs.length != this._outputCount) {
            throw "evalFunc returned an unexpected number of outputs";
        }

        return outputs;
    };

    return Component;
});