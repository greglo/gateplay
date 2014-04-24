define([
    "backbone",
    "canvas/views/wireview"
], function(Backbone, WireView) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options;
        },

        render: function() {
            var model = this.model;
            var options = this.options;
            this.options.wires.each(function(model) {
                var view = new WireView({
                    options: options,
                    model: model
                });
                view.render();        
            });
        }
    });
});