var nextId = 0;
var Component = Backbone.Model.extend({
    defaults: function() {
        return {
            id: nextId++,
            x: 0,
            y: 0,
            width: 7,
            height: 5
        }
    }
});