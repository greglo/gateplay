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
        this._cachedInputs = [];
        for (var i = 0; i < this._inputCount; i++)
            this._cachedInputs.push("Unknown");
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

    Component.prototype.evaluate = function(truthValues) {
        if (typeof truthValues == "undefined" || !truthValues instanceof Array)
            throw "truthValues must be of type Array";

        if (truthValues.length != this._inputCount)
            throw "truthValues must be of the same size as _inputCount";

        this._cachedInputs = truthValues;

        var outputs = this._evalFunc.evaluate(truthValues);
        if (outputs.length != this._outputCount) {
            throw "evalFunc returned an unexpected number of outputs";
        }

        return outputs;
    };

    Component.prototype.evaluateOneInputChanged = function(portId, truthValue) {
        if (this.isValidInputPort(portId)) {
            this._cachedInputs[portId] = truthValue;
            return this.evaluate(this._cachedInputs);
        }
    };

    return Component;
});