var ComponentSetView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options;
    },

    render: function() {
        var model = this.model;
        var options = this.options;
        this.options.components.each(function(model) {
            var view = new ComponentView({
                options: options,
                model: model
            });
            view.render(canvas);            
        });
    }
});