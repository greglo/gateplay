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
                width: 7,
                height: 5
            }
        }
    });
});