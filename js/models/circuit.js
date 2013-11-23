var Circuit = Backbone.Model.extend({
    defaults: function() {
        return {
            components: new ComponentSet(),
        }
    },

    addComponent: function(c) {
        this.get("components").add(c);
    }
});