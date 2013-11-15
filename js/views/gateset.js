var GateSetView = Backbone.View.extend({
    initialize: function() {
        this.collection.on("all", this.render, this);
    },

    render: function() {
        //canvas.clear();
        this.collection.each(function(model) {
            var view = new GateView({model:model});
            view.render();            
        })
    }
});