var nextId = 0;
define([
    "underscore",
    "backbone",
], function(_, Backbone) {
    return Backbone.Model.extend({
        defaults: function() {
            return {
                id: nextId++,
                templateId: "",
                x: 0,
                y: 0,
                inputCount: 2,
                outputCount: 1,
                width: 7,
                height: 5
            }
        }
    });
});