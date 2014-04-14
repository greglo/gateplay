define([
    "backbone",
    "canvas/models/wire"
], function(Backbone, Wire) {
    return Backbone.Collection.extend({
        model: Wire
    });
});