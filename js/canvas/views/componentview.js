define([
    "underscore",
    "backbone",
    "fabric",
    "canvas/views/templates/templatefactory",
    "sim/truthvalue"
], function(_, Backbone, fabric, TemplateFactory, TruthValue) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.options = options.options;
            this.model = options.model;
            this._template = null;
            this._fillableObjects = null;
            this._inputs = [];
            this._outputs = [];
            this._activePort = null;

            this.model.on("change:isValid", this._setFillColor, this);
            this.model.on("change:activeInputIndex", this._activeInputChanged, this);
            this.model.on("change:activeOutputIndex", this._activeOutputChanged, this);
            this.model.on("change:truthValue", this._setFillColor, this);
        },

        render : function() {
            var GRID_SIZE = this.options.GRID_SIZE;
            var model = this.model;

            var objects = [];

            // Dummy objects so even components with no inputs/outputs are the correct width
            objects.push(new fabric.Rect({
                left: 0,
                top: 0,
                height: 0,
                width: 0
            }));
            objects.push(new fabric.Rect({
                left: model.get("width") * GRID_SIZE,
                top: 0,
                height: 0,
                width: 0
            }));

            var nextInputY = (model.getInputCoordinate(0) - model.get("y")) * GRID_SIZE;
            for (var i = 0; i < model.get("inputCount"); i++) {
                var input = TemplateFactory.getWire();
                input.set({
                    left: 0,
                    top: nextInputY,
                })
                input.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
                this._inputs.push(input);

                var dummyInput = TemplateFactory.getWire();
                dummyInput.set({
                    left: GRID_SIZE,
                    top: nextInputY,
                })
                dummyInput.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
                objects.push(dummyInput);


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

                var dummyOutput = TemplateFactory.getWire();
                dummyOutput.set({
                    left: (model.get("width") - 2) * GRID_SIZE,
                    top: nextOutputY,
                })
                dummyOutput.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
                objects.push(dummyOutput);

                nextOutputY += GRID_SIZE * 2;
            }
            objects = objects.concat(this._outputs);

            var factoryObject = TemplateFactory.getTemplate(model.get("templateId"), model.get("width") - 2, model.getHeight());
            var gate = factoryObject.template;
            gate.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
            gate.set({
                left:GRID_SIZE,
                top: 0,
                width: (model.get("width") - 2) * TemplateFactory.BOX_SIZE,
                height: (model.getHeight() + 0) * TemplateFactory.BOX_SIZE,
            });
            objects.push(gate);

            this._fillableObjects = factoryObject.fillableObjects;
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
            
            this._setFillColor();
        },

        _setFillColor: function() {
            var templateId = this.model.get("templateId");
            var validColor = "white";
            var invalidColor = "red";

            if (templateId === "on") {
                validColor = "green";
                invalidColor = "darkgreen";
            } else if (templateId === "off") {
                validColor = "red";
                invalidColor = "red";
            } else if (templateId === "toggle" || templateId === "led" || templateId === "blinker") {
                var truthValue = this.model.get("truthValue");
                if (truthValue === TruthValue.TRUE) {
                    validColor = "green";
                    invalidColor = "darkgreen";
                } else if (truthValue === TruthValue.FALSE) {
                    validColor = "red";
                    invalidColor = "red";
                } else if (truthValue === TruthValue.UNKNOWN) {
                    validColor = "gray";
                    invalidColor = "gray";
                }
            }

            var fillColor;

            if (this.model.get("isValid")) {
                fillColor = validColor;
            } else {
                fillColor = invalidColor;
            }

            _.each(this._fillableObjects, function(object) {
                object.setFill(fillColor);
            });

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
                this._activePort.setStroke(TemplateFactory.WIRE_COLOR);
            }

            if (index != -1) {
                var c = collection[index];
                c.setStroke("Red");
                this._activePort = c;
            } else {
                this._activePort = null;
            }
            this.options.canvas.renderAll();
        },
    });
});