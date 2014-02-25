var nextId = 0;
define([
    "underscore",
    "sim/truthvalue"
], function(_, TruthValue) {
    function FunctionStore() {
        this._store = {};
    };
    FunctionStore.prototype.get = function(id) {
        if (id in this._store) {
            return this._store[id];
        } else {
            console.warn("A non-existant EvaluationFunction was requested");
            return null;
        }
    };
    FunctionStore.prototype.put = function(id, evalFunc) {
        if (!(id in this._store)) {
            this._store[id] = evalFunc;
        } else {
            console.warn("An function was tried to be added with an existing key");
        }
    };

    function EvaluationFunction(minInputCount, maxInputCount) {
        this._minInputCount = minInputCount;
        this._maxInputCount = maxInputCount;
    }
    EvaluationFunction.prototype.evaluate = function(argList) {
        if (typeof argList == "undefined" || !argList instanceof Array)
            throw "argList must be a list";

        if (argList.length < this._minInputCount || argList.length > this._maxInputCount)
            throw "Invalid number of arguments passed to EvaluationFunction";

        return this._doEvaluate(argList);
    };
    EvaluationFunction.prototype._doEvaluate = function(argList) {
        throw "_doEvaluate not implemented on EvaluationFunction, you must override it";
    }
    EvaluationFunction.prototype.getDelay = function() {
        return 10;
    }
    EvaluationFunction.prototype.getMaxUncertaintyDuration = function() {
        return 1;
    }

    function On() {
    }
    On.prototype = EvaluationFunction.prototype;
    On.prototype._doEvaluate = function(argList) {
        return [TruthValue.TRUE];
    };

    function And() {
    }
    And.prototype = EvaluationFunction.prototype;
    And.prototype._doEvaluate = function(argList) {
        var onlyTrue = true;

        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.FALSE) {
                return [TruthValue.FALSE];
            }
            onlyTrue = onlyTrue && v === TruthValue.TRUE;
        }

        if (onlyTrue) {
            return [TruthValue.TRUE];
        } else { 
            return [TruthValue.UNKNOWN];
        }
    };

    var fs = new FunctionStore();
    fs.put("on", new On());
    fs.put("and", new And());

    return fs;
});