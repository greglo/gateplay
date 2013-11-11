var UIGatesView = Backbone.View.extend({
    initialize: function() {
        this.collection.on("all", this.render, this);
    },

    render: function() {
        stage.clear();
        this.collection.each(function(model) {
            var view = new UIGateView({model:model});
            view.render();            
        })
    }
});