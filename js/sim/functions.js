var nextId = 0;
define([
    "underscore",
    "sim/truthvalue"
], function(_, TruthValue) {
    function FunctionStore() {
        this._store = {};
    };
    FunctionStore.prototype.get = function(id, cArg) {
        if (id in this._store) {
            return new this._store[id](cArg);
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
    }
    On.prototype = new EvaluationFunction(0, 0);
    On.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.TRUE];
    };

    function Off() {
    }
    Off.prototype = new EvaluationFunction(0, 0);
    Off.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.FALSE];
    };

    function Not() {
    }
    Not.prototype = new EvaluationFunction(1, 1);
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
    }
    And.prototype = new EvaluationFunction(2);
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

    function Nand() {
    }
    Nand.prototype = new EvaluationFunction(2);
    Nand.prototype._doEvaluate = function(argList, clock) {
        var onlyTrue = true;

        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.FALSE) {
                return [TruthValue.TRUE];
            }
            onlyTrue = onlyTrue && v === TruthValue.TRUE;
        }

        if (onlyTrue) {
            return [TruthValue.FALSE];
        } else { 
            return [TruthValue.UNKNOWN];
        }
    };

    function Or() {
    }
    Or.prototype = new EvaluationFunction(2);
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

    function Nor() {
    }
    Nor.prototype = new EvaluationFunction(2);
    Nor.prototype._doEvaluate = function(argList, clock) {
        var anyUnknown = false;

        for (var i = 0; i < argList.length; i++) {
            var v = argList[i];
            if (v === TruthValue.TRUE) {
                return [TruthValue.FALSE];
            }
            anyUnknown = anyUnknown || v === TruthValue.UNKNOWN;
        }

        if (anyUnknown) {
            return [TruthValue.UNKNOWN];
        } else { 
            return [TruthValue.TRUE];
        }
    };

    function Xor() {
    }
    Xor.prototype = new EvaluationFunction(2);
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
    }
    Toggle.prototype = new EvaluationFunction(0, 0);
    Toggle.prototype._doEvaluate = function(argList, clock) {
        return [TruthValue.TRUE];
    };

    function Blinker(period) {
        this._period = period;
    }
    Blinker.prototype = new EvaluationFunction(0, 0);
    Blinker.prototype._doEvaluate = function(argList, clock) {
        var period = Math.floor(clock / this._period);
        var parity = period % 2;
        if (parity === 0) {
            return [TruthValue.TRUE];
        } else {
            return [TruthValue.FALSE];
        }
    };

    function HalfAdder() {
    }
    HalfAdder.prototype = new EvaluationFunction(2, 2);
    HalfAdder.prototype._doEvaluate = function(argList, clock) {
        var xor = new Xor();
        var s = xor.evaluate(argList)[0]

        var and = new And();
        var c = and.evaluate(argList)[0];

        return [s, c];
    };

    function FullAdder() {
    }
    FullAdder.prototype = new EvaluationFunction(3, 3);
    FullAdder.prototype._doEvaluate = function(argList, clock) {
        var a = argList[0];
        var b = argList[1];
        var cin = argList[2];

        var xor = new Xor();
        var s = xor.evaluate(argList)[0]

        var and = new And();
        var or = new Or();
        var aANDb = and.evaluate([a, b])[0];
        var aXORb = xor.evaluate([a, b])[0];
        var d = and.evaluate([cin, aXORb])[0];
        var cout = or.evaluate([aANDb, d])[0];

        return [s, cout];
    };

    function DFlipFlop() {
        this._pastInputs = [TruthValue.UNKNOWN, TruthValue.UNKNOWN];
        this._pastOutputs = [TruthValue.UNKNOWN, TruthValue.UNKNOWN];
    }
    DFlipFlop.prototype = new EvaluationFunction(2, 2);
    DFlipFlop.prototype._doEvaluate = function(argList) {
        var data = argList[0];
        var clock = argList[1];
        var lastClock = this._pastInputs[1];

        this._pastInputs = argList;

        // Only update data on rising edge
        if (lastClock === TruthValue.FALSE && clock === TruthValue.TRUE) {
            var not = new Not();
            var outputs = [];
            outputs.push(data);
            outputs.push(not.evaluate([data])[0]);
            this._pastOutputs = outputs;
        }

        return this._pastOutputs.slice(0);
    };

    function SRLatch() {
        this._pastInputs = [TruthValue.UNKNOWN, TruthValue.UNKNOWN];
        this._pastOutputs = [TruthValue.UNKNOWN, TruthValue.UNKNOWN];
    }
    SRLatch.prototype = new EvaluationFunction(2, 2);
    SRLatch.prototype._doEvaluate = function(argList) {
        var reset = argList[0];
        var set = argList[1];
        var lastClock = this._pastInputs[1];

        var outputs;

        if (set === TruthValue.TRUE && reset === TruthValue.TRUE) {
            outputs = [TruthValue.FALSE, TruthValue.FALSE];
        } 
        else if (set === TruthValue.TRUE && reset === TruthValue.FALSE) {
            outputs = [TruthValue.TRUE, TruthValue.FALSE];
        } 
        else if (set === TruthValue.FALSE && reset === TruthValue.TRUE) {
                outputs = [TruthValue.FALSE, TruthValue.TRUE];
        } 
        else if (set === TruthValue.FALSE && reset === TruthValue.FALSE) {
            var pastQ = this._pastOutputs[0];
            if (pastQ === TruthValue.UNKNOWN) {
                outputs = [TruthValue.UNKNOWN, TruthValue.UNKNOWN];
            } else {
                outputs = this._pastOutputs;
            }
        }

        this._pastInputs = argList;
        this._pastOutputs = outputs;

        return outputs.slice(0);
    };

    var fs = new FunctionStore();
    fs.put("on", On);
    fs.put("off", Off);
    fs.put("not", Not);
    fs.put("and", And);
    fs.put("or", Or);
    fs.put("nand", Nand);
    fs.put("nor", Nor);
    fs.put("xor", Xor);
    fs.put("toggle", Toggle);
    fs.put("blinker", Blinker);

    fs.put("ha", HalfAdder);
    fs.put("fa", FullAdder);
    fs.put("sr", SRLatch);
    fs.put("dff", DFlipFlop);


    return fs;
});