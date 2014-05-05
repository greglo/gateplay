define([
    "backbone",
    "fabric",
    "canvas/views/templates/templatefactory"
], function(Backbone, fabric, TemplateFactory) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
            this.model = options.model;
            this._template = null;
            this._inputs = [];
            this._outputs = [];
            this._activePort = null;

            this.model.on("change:isValid", this._isValidChanged, this);
            this.model.on("change:activeInputIndex", this._activeInputChanged, this);
            this.model.on("change:activeOutputIndex", this._activeOutputChanged, this);
        },

        render : function() {
            var GRID_SIZE = this.options.GRID_SIZE;
            var model = this.model;

            var objects = [];
            var gate = TemplateFactory.getTemplate(model.get("templateId"), model.get("width") - 2, model.getHeight());
            gate.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
            gate.set({
                left:GRID_SIZE,
                top: 0,
                width: (model.get("width") - 2) * TemplateFactory.BOX_SIZE,
                height: (model.getHeight() + 0) * TemplateFactory.BOX_SIZE,
            });
            objects.push(gate);

            var nextInputY = (model.getInputCoordinate(0) - model.get("y")) * GRID_SIZE;
            for (var i = 0; i < model.get("inputCount"); i++) {
                var input = TemplateFactory.getWire();
                input.set({
                    left: 0,
                    top: nextInputY,
                })
                input.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
                this._inputs.push(input);
                nextInputY += GRID_SIZE * 2;
            }
            objects = objects.concat(this._inputs);

            var nextOutputY = (model.getOutputCoordinate(0) - model.get("y")) * GRID_SIZE;
            for (var i = 0; i < model.get("outputCount"); i++) {
                var output = TemplateFactory.getWire();
                output.set({
                    left: (model.get("width") - 1) * GRID_SIZE,
                    top: nextOutputY,
                })
                output.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
                this._outputs.push(output);
                nextOutputY += GRID_SIZE * 2;
            }
            objects = objects.concat(this._outputs);

            this._template = new fabric.Group(objects);

            // We associate the canvas element with its backbone model
            this._template.id = model.get("id");
            this._template.class = "gate";

            this._template.set({
                left: model.get("x") * GRID_SIZE,
                top: model.get("y") * GRID_SIZE,
                lockMovementX: true,
                lockMovementY   : true,
            });
            this._template.hasControls = false;
            this.options.canvas.add(this._template);
            
            this._isValidChanged();
        },

        _isValidChanged: function() {
            if (this.model.get("isValid"))
                this._template.setFill("white");
            else
                this._template.setFill("red");
            this.options.canvas.renderAll();
        },

        _activeInputChanged: function() {
            this._activePortChanged(this._inputs, this.model.get("activeInputIndex"));
        },

        _activeOutputChanged: function() {
            this._activePortChanged(this._outputs, this.model.get("activeOutputIndex"));
        },

        _activePortChanged: function(collection, index) {
            if (this._activePort != null) {
                this._activePort.setStroke("black");
            }

            if (index != -1) {
                var c = collection[index];
                c.setStroke("Red");
                this._activePort = c;
            } else {
                this._activePort = null;
            }
            this.options.canvas.renderAll();
        }
    });
});