define([
    "backbone",
    "canvas/models/component"
], function(Backbone, Component) {
    return Backbone.Collection.extend({
        model: Component
    });
});