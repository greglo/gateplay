define([
    "underscore",
    "backbone",
], function(_, Backbone) {
    return Backbone.Model.extend({
        defaults: function() {
            return {
                sourceId: -1,
                sourcePort: -1,
                targetId: -1,
                targetPort: -1,
                fixedPoints: []
            }
        },
    });
});