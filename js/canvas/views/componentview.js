define([
    "backbone",
    "canvas/views/templates/templatefactory"
], function(Backbone, TemplateFactory) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
            this.model = options.model;
        },

        render : function(forceValidity) {
            this.model.set("inputCount", 2);
            this.model.set("height", 5)
            
            var template = TemplateFactory.getTemplate(this.model.get("templateId"), this.model.get("width"), this.model.get("height"));
            
            template.set({
                left: this.model.get("x") * this.options.GRID_SIZE,
                top: this.model.get("y") * this.options.GRID_SIZE,
            });

            // The template build on a different grid size, so we now scale it to the canvas
            //template.setScaleX(this.model.get("width") * this.options.GRID_SIZE /  (7 * TemplateFactory.BOX_SIZE));
            //template.setScaleY(this.model.get("height") * this.options.GRID_SIZE / (5 * TemplateFactory.BOX_SIZE));
            template.scale(this.options.GRID_SIZE / TemplateFactory.BOX_SIZE);


            if (typeof forceValidity != "undefined")
                template.setValid(forceValidity);

            // We associate the canvas element with its backbone model
            template.componentId = this.model.get("id");
            template.class = "gate";
            
            this.options.canvas.add(template);
            this._addInputs(template);
        },

        _addInputs: function(template) {
            var i = 0;
            var yOffset = this.options.GRID_SIZE;
            while (i < this.model.get("inputCount")) {
                this._addInput(template, yOffset, i);
                i++;
                yOffset += 2 * this.options.GRID_SIZE;
            }
        },

        _addInput: function(template, yOffset, id) {
            var wire = TemplateFactory.getWire();
            wire.scale(this.options.GRID_SIZE / TemplateFactory.BOX_SIZE);
            wire.set({
                left: template.getLeft(),
                top: template.getTop() + yOffset
            });

            wire.class = "input";
            wire.componentId = this.model.get("id");
            wire.inputId = id;

            var v = this;
            this.options.canvas.on("gate:moving", function(e) {
                if (e.id == wire.componentId) {
                    wire.set({
                        left: e.left,
                        top: e.top + yOffset
                    });
                }
            })
            this.options.canvas.on("gate:front", function(target) {
                if (target.componentId == wire.componentId) {
                    wire.bringToFront();
                }
            })

            this.options.canvas.add(wire);
        },
    });
});