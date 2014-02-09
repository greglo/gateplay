define([
    "backbone",
    "canvas/views/templates/templatefactory"
], function(Backbone, TemplateFactory) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
            this.model = options.model;
        },

        render : function() {
            var template = TemplateFactory.getTemplate(this.model.get("templateId"));
            template.set({
                left: this.model.get("x") * this.options.GRID_SIZE,
                top: this.model.get("y") * this.options.GRID_SIZE
            });

            // Templates are build on a 120 pixel grid, but we now scale them to the appropriate size
            template.scale(this.options.GRID_SIZE / TemplateFactory.BOX_SIZE);

            // We associate the canvas element with its backbone model
            template.id = this.model.get("id");

            this.options.canvas.add(template);
        }
    });
});