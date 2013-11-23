var ComponentSetView = Backbone.View.extend({
    initialize: function(options) {
        this.components = options.components;
    },

    render: function() {
        this.components.each(function(model) {
            var view = new ComponentView({model:model});
            view.render(canvas);            
        });
    }
});