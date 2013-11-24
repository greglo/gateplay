var Circuit = Backbone.Model.extend({
    defaults: function() {
        return {
            components: new ComponentSet(),
            width: 20,
            height: 20
        }
    },

    addComponent: function(c) {
        this.get("components").add(c);
        return true;
    }
});