define([
    "fabric"
], function(fabric) {
    return {
        getTemplate: function(templateId) {
            var boxSize = 120; 

            var wireColor = "rgb(70, 70, 70)";
            var gateColor = "rgb(70, 70, 70)";
            var strokeWidth = boxSize / 4;
            
            var outerLeft = 0;
            var innerLeft = boxSize / 2;
            var outerTop = 0;
            var innerTop = outerTop;
            var outerWidth = 7 * boxSize;
            var innerWidth = 6 * boxSize;
            var outerHeight = 5 * boxSize;
            var innerHeight = outerHeight - strokeWidth;
            var objects = [];


            switch(templateId) {
                case "wire":
                    // We "fill" a rectangle by making it entirely border
                    // That way changing the fill of a componsite including wires will not change the wire color
                    objects.push(new fabric.Rect({
                        left: 0,
                        top: 0,
                        strokeWidth: boxSize/2,
                        stroke: wireColor,
                        width: boxSize/2,
                        height: boxSize/2
                    }));
                    break;

                case "or":
                    var wire = this.getTemplate("wire");
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
                    var wire = this.getTemplate("wire");
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize - 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize * 3- 0.5}));
                    objects.push(fabric.util.object.clone(wire).set({left:outerWidth - boxSize, top: boxSize * 2- 0.5}));
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
            return group;
        }
    };
});