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
            return new this._store[id];
        } else {
            console.warn("A non-existant EvaluationFunction was requested");
            return null;
        }
    };
    FunctionStore.prototype.put = function(id, evalClass) {
        if (!(id in this._store)) {
            this._store[id] = evalClass;
        } else {
            console.warn("An function was tried to be added with an existing key");
        }
    };

    function EvaluationFunction(minInputCount, maxInputCount) {
        this._minInputCount = minInputCount;
        this._maxInputCount = maxInputCount;
    }
    EvaluationFunction.prototype.evaluate = function(argList, clock) {
        if (typeof argList == "undefined" || !argList instanceof Array)
            throw "argList must be a list";

        if (argList.length < this._minInputCount || argList.length > this._maxInputCount)
            throw "Invalid number of arguments passed to EvaluationFunction";

        return this._doEvaluate(argList, clock);
    };
    EvaluationFunction.prototype._doEvaluate = function(argList, clock) {
        throw "_doEvaluate not implemented on EvaluationFunction, you must override it";
    }
    EvaluationFunction.prototype.getDelay = function() {
        return 5;
    }
    EvaluationFunction.prototype.getMaxUncertaintyDuration = function() {
        return 1;
    }

    function On() {
        EvaluationFunction.apply(this, arguments);
    }
    On.prototype = new EvaluationFunction();
    On.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.TRUE];
    };

    function Off() {
        EvaluationFunction.apply(this, arguments);
    }
    Off.prototype = new EvaluationFunction();
    Off.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.FALSE];
    };

    function Not() {
        EvaluationFunction.apply(this, arguments);
    }
    Not.prototype = new EvaluationFunction();
    Not.prototype._doEvaluate = function(argList, clock) {
        var outputs = [];
        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.TRUE) {
                outputs.push(TruthValue.FALSE);
            } else if (v === TruthValue.FALSE) {
                outputs.push(TruthValue.TRUE);
            } else {
                outputs.push(TruthValue.UNKNOWN)
            }
        }
        return outputs;
    };

    function And() {
        EvaluationFunction.apply(this, arguments);
    }
    And.prototype = new EvaluationFunction();
    And.prototype._doEvaluate = function(argList, clock) {
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

    function Or() {
        EvaluationFunction.apply(this, arguments);
    }
    Or.prototype = new EvaluationFunction();
    Or.prototype._doEvaluate = function(argList, clock) {
        var anyUnknown = false;

        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.TRUE) {
                return [TruthValue.TRUE];
            }
            anyUnknown = anyUnknown || v === TruthValue.UNKNOWN;
        }

        if (anyUnknown) {
            return [TruthValue.UNKNOWN];
        } else { 
            return [TruthValue.FALSE];
        }
    };


    function Xor() {
        EvaluationFunction.apply(this, arguments);
    }
    Xor.prototype = new EvaluationFunction();
    Xor.prototype._doEvaluate = function(argList, clock) {
        var anyUnknown = false;
        var trueParity = 0;

        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.TRUE) {
                trueParity = 1 - trueParity;
            } else if (v === TruthValue.UNKNOWN) {
                return [TruthValue.UNKNOWN];
            }
        }

        if (trueParity === 0) { 
            return [TruthValue.FALSE];
        } else {
            return [TruthValue.TRUE];
        }
    };

    function Toggle() {
        EvaluationFunction.apply(this, arguments);
    }
    Toggle.prototype = new EvaluationFunction();
    Toggle.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.TRUE];
    };

    var fs = new FunctionStore();
    fs.put("on", On);
    fs.put("off", Off);
    fs.put("not", Not);
    fs.put("and", And);
    fs.put("or", Or);
    fs.put("xor", Xor);
    fs.put("toggle", Toggle);


    return fs;
});