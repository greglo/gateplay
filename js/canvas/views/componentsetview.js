define([
    "backbone",
    "canvas/views/componentview"
], function(Backbone, ComponentView) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options;
        },

        render: function() {
            var model = this.model;
            var options = this.options;
            var i = 1;
            this.options.components.each(function(model) {
                var view = new ComponentView({
                    options: options,
                    model: model
                });
                view.render();        
            });
        }
    });
});