var UIGatesView = Backbone.View.extend({
    initialize: function() {
        this.collection.on("all", this.render, this);
    },

    render: function() {
        var canvas = this.el;

        this.collection.each(function(model) {
            var view = new UIGateView({model:model});
            view.render();            
        })
    }
});