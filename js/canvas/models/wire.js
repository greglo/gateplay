var nextWireId = 0;
define([
    "underscore",
    "backbone",
    "sim/truthvalue"
], function(_, Backbone, TruthValue) {
    return Backbone.Model.extend({
        defaults: function() {
            return {
                id: nextWireId++,
                sourceId: -1,
                sourcePort: -1,
                targetId: -1,
                targetPort: -1,
                fixedPoints: [],
                truthValue: TruthValue.UNKNOWN
            }
        },
    });
});