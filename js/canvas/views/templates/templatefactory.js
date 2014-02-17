define([
    "fabric"
], function(fabric) {
    return {
        BOX_SIZE: 120,
        wireColor: "rgb(70, 70, 70)",
        gateColor: "rgb(70, 70, 70)",
        strokeWidth: 120 / 4,

        getWire: function() {
            // We "fill" a rectangle by making it entirely border
            // That way changing the fill of a componsite including wires will not change the wire color
            var wire = new fabric.Rect({
                left: 0,
                top: 0,
                strokeWidth: this.BOX_SIZE / 2,
                stroke: this.wireColor,
                width: this.BOX_SIZE / 2,
                height: this.BOX_SIZE / 2
            });
            wire.selectable = false;
            return wire;
        },

        getTemplate: function(templateId, gridWidth, gridHeight) {
            var boxSize = this.BOX_SIZE;

            var wireColor = this.wireColor;
            var gateColor = this.gateColor;
            var strokeWidth = this.strokeWidth
            
            var width = gridWidth * boxSize - strokeWidth;
            var height = gridHeight * boxSize - strokeWidth;
            var objects = [];

            // HACK: We don't want the template to shink to fit whatever we draw inside, so we put invisible
            // objects in each corner
            objects.push(new fabric.Rect({left:0, top: 0, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:width, top: 0, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:0, top: height, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:width, top: height, width: 0, height: 0}));

            switch(templateId) {
                    case "or":
                    break;

                    case "and":
                    objects.push(new fabric.Ellipse({
                        left: width * 0.2,
                        top: 0,
                        fill: "white",
                        rx: width * 0.4,
                        ry: height * 0.5,
                        strokeWidth: strokeWidth,
                        stroke: gateColor
                    }));
                    var points = [];
                    points.push({x:width * 0.6, y:0});
                    points.push({x:0, y:0});
                    points.push({x:0, y:height});
                    points.push({x:width * 0.6, y:height});
                    var poly = new fabric.Polyline(points, {
                        left: 0,
                        top: 0,
                        stroke: gateColor,
                        strokeWidth: strokeWidth,
                        fill: "white"
                    });
                    objects.push(poly);
                    break;

                default:
                    throw "Unknown templateId";
            }

            var group = new fabric.Group(objects);
            group.hasControls = false;

            group.setValid = function(isValid) {
                if (isValid)
                    this.setFill("white");
                else
                    this.setFill("red");
            };

            return group;
        }
    };
});