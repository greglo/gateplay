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
            
            var outerLeft = 0;
            var innerLeft = boxSize;
            var outerTop = 0;
            var innerTop = outerTop;
            var outerWidth = gridWidth * boxSize;
            var innerWidth = outerWidth - (2 * boxSize);
            var outerHeight = gridHeight * boxSize;
            var innerHeight = outerHeight - strokeWidth;
            var objects = [];

            // HACK: We don't want the template to shink to fit whatever we draw inside, so we put invisible
            // objects in each corner
            objects.push(new fabric.Rect({left:outerLeft, top: outerTop, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:outerLeft + outerWidth, top: outerTop, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:outerLeft, top: outerTop + outerHeight, width: 0, height: 0}));
            objects.push(new fabric.Rect({left:outerLeft + outerWidth, top: outerTop + outerHeight, width: 0, height: 0}));

            switch(templateId) {
                case "or":
                    var wire = this.getWire();
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize - 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft + boxSize, top: boxSize - 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize * 3- 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft + boxSize, top: boxSize * 3- 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerWidth - boxSize, top: boxSize * 2- 0.5}));
                    // We do slightly more than a full path around the shape, to get pretty edges in the top left
                    var path = new fabric.Path(
                        "M " + (2 * boxSize) + "," + 0 + 
                        "L " + 0 + "," + 0 + 
                        "C " + (1.25 * boxSize) + "," + (2 * boxSize) + "," + (1.25 * boxSize) + "," + (innerHeight - 2 * boxSize) + "," + 0 + "," + innerHeight + 
                        "L " + (boxSize * 2) + "," + innerHeight +
                        "C " + (4 * boxSize) + "," + (innerHeight) + "," + (6 * boxSize) + "," + (innerHeight - 2 * boxSize) + "," + innerWidth + "," + (innerHeight / 2) + 
                        "C " + (6 * boxSize) + "," + (2 * boxSize) + "," + (4 * boxSize) + ",0," + (2 * boxSize) + ",0" + 
                        "L " + 0 + "," + 0
                        );
                    objects.push(path.set({left:innerLeft, top:outerTop, strokeWidth: strokeWidth, stroke:gateColor, fill:"white"}));
                    break;

                    case "and":
                    objects.push(new fabric.Ellipse({
                        left: innerLeft + innerWidth * 0.2,
                        top: innerTop,
                        fill: "white",
                        rx: innerWidth * 0.4,
                        ry: innerHeight * 0.5,
                        strokeWidth: strokeWidth,
                        stroke: gateColor
                    }));
                    var points = [];
                    points.push({x:innerWidth * 0.6, y:0});
                    points.push({x:0, y:0});
                    points.push({x:0, y:innerHeight});
                    points.push({x:innerWidth * 0.6, y:innerHeight});
                    var poly = new fabric.Polyline(points, {
                        left: innerLeft,
                        top: innerTop,
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