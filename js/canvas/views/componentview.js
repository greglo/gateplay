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
            var objects = [];
            var gate = TemplateFactory.getTemplate(this.model.get("templateId"));
            gate.scale(this.options.GRID_SIZE / TemplateFactory.BOX_SIZE);
            gate.set({
                left:this.options.GRID_SIZE,
                top: 0,
                width: (this.model.get("width") - 2) * TemplateFactory.BOX_SIZE,
                height: 80 * TemplateFactory.BOX_SIZE / this.options.GRID_SIZE,
            });
            objects.push(gate);


            var top = this.options.GRID_SIZE;
            for (var i = 0; i < this.model.get("inputCount"); i++) {
                var input = TemplateFactory.getWire();
                input.set({
                    left: 0,
                    top: top,
                })
                input.scale(this.options.GRID_SIZE / TemplateFactory.BOX_SIZE);
                this._inputs.push(input);
                top += this.options.GRID_SIZE * 2;
            }

            objects = objects.concat(this._inputs);
            this._template = new fabric.Group(objects);

            // We associate the canvas element with its backbone model
            this._template.id = this.model.get("id");
            this._template.class = "gate";

            this._template.set({
                left: this.model.get("x") * this.options.GRID_SIZE,
                top: this.model.get("y") * this.options.GRID_SIZE
            });
            this._template.set({
                lockMovementX: true,
                lockMovementY   : true,
            });
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