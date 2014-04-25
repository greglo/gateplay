var nextId = 0;
define([
    "underscore",
    "backbone",
], function(_, Backbone) {
    return Backbone.Model.extend({
        defaults: function() {
            return {
                id: nextId++,
                x: 0,
                y: 0,
                inputCount: 2,
                outputCount: 1,
                width: 7,
                isValid: true,
                activeInputIndex: -1,
                activeOutputIndex: -1
            }
        },

        getHeight: function() {
            return Math.max(this.get("inputCount"), this.get("outputCount")) * 2 + 1;
        },

        getInputCoordinate: function(index) {
            if (0 <= index && index < this.get("inputCount")) {
                var midY = this.get("y") + Math.floor(this.getHeight() / 2);
                return midY + index * 2 - this.get("inputCount") + 1;
            }
        },

        getOutputCoordinate: function(index) {
            if (0 <= index && index < this.get("outputCount")) {
                var midY = this.get("y") + Math.floor(this.getHeight() / 2);
                return midY + index * 2 - this.get("outputCount") + 1;
            }
        },

        setActiveInput: function(index) {
            if (0 <= index && index < this.get("inputCount")) {
                this.set("activeInputIndex", index);
            } else {
                this.set("activeInputIndex", -1);
            }
            this.set("activeOutputIndex", -1);
        },

        setActiveOutput: function(index) {
            if (0 <= index && index < this.get("outputCount")) {
                this.set("activeOutputIndex", index);
            } else {
                this.set("activeOutputIndex", -1);
            }
            this.set("activeInputIndex", -1);
        },

        clearActivePort: function() {
            this.set("activeInputIndex", -1);
            this.set("activeOutputIndex", -1);
        }
    });
});