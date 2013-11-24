var ComponentView = Backbone.View.extend({
    initialize: function(options) {
        this.options = options.options;
        this.model = options.model;
    },

    render : function() {
        var template = TemplateFactory.getTemplate(this.model.get("templateId"));
        template.set({
            left: this.model.get("x"),
            top: this.model.get("y")
        });
        // Templates are build on a 120 pixel grid, but we now scale them to the appropriate size
        template.scale(this.options.gridSize / 120);
        canvas.add(template);
    }
});