define([
    "jquery",
    "fabric",
    "canvas/models/component",
    "canvas/views/componentview",
],
function($, fabric, Component, ComponentView) {
    return function(templateId, gridSize, domElement) {
        var rasterizer = new fabric.StaticCanvas("rasterizer");

        var validGate = new Component({
            templateId: templateId,
            canvas: rasterizer,
            x: 0,
            y: 0,
            isValid: true
        });
        var validView = new ComponentView({
            model: validGate,
            options: {
                GRID_SIZE: gridSize,
                canvas: rasterizer
            }
        });

        var invalidGate = new Component({
            templateId: templateId,
            canvas: rasterizer,
            x: validGate.get("width"),
            y: 0,
            isValid: false
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

        $(domElement).css("width", validGate.get("width") * gridSize);
        $(domElement).css("height", validGate.getHeight() * gridSize);
        $(domElement).css("background-image", "url(" + rasterizer.toDataURL() + ")");

        rasterizer.dispose();
    }
});