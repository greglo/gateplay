define([
    "jquery",
    "fabric",
    "canvas/models/component",
    "canvas/views/componentview",
],
function($, fabric, Component, ComponentView) {
    return function(templateId, inputCount, outputCount, gridSize, domElement) {
        // Create the models
        var validGate = new Component({
            templateId: templateId,
            x: 0,
            y: 0,
            inputCount: inputCount,
            outputCount: outputCount,
            isValid: true
        });
        var invalidGate = new Component({
            templateId: templateId,
            x: validGate.get("width"),
            y: 0,
            inputCount: inputCount,
            outputCount: outputCount,
            isValid: false
        });

        // Canvas to render on
        var canvasWidth = validGate.get("width") * gridSize;
        var canvasHeight = validGate.getHeight() * gridSize;
        $("#rasterizer").attr("width", 2 * canvasWidth);
        $("#rasterizer").attr("height", canvasHeight);

        var rasterizer = new fabric.StaticCanvas("rasterizer");

        // Component views
        var validView = new ComponentView({
            model: validGate,
            options: {
                GRID_SIZE: gridSize,
                canvas: rasterizer
            }
        });

        var invalidView = new ComponentView({
            model: invalidGate,
            options: {
                GRID_SIZE: gridSize,
                canvas: rasterizer
            }
        });

        validView.render();
        invalidView.render();

        $(domElement).css("width", canvasWidth);
        $(domElement).css("height", canvasHeight);
        $(domElement).css("background-image", "url(" + rasterizer.toDataURL() + ")");

        rasterizer.dispose();
    }
});