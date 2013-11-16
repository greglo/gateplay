var TemplateFactory = {
    getTemplate: function(templateId) {
        var boxSize = 20; // TODO

        var wireColor = "rgb(70, 70, 70)";
        var gateColor = "rgb(70, 70, 70)";
        var strokeWidth = 5;
        
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
                objects.push(new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: wireColor,
                    width: boxSize,
                    height: boxSize
                }));
                break;

            case "and":
                var wire = this.getTemplate("wire");
                objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize}));
                objects.push(fabric.util.object.clone(wire).set({left:outerLeft, top: boxSize * 3}));
                objects.push(fabric.util.object.clone(wire).set({left:outerWidth - boxSize, top: boxSize * 2}));
                objects.push(new fabric.Ellipse({
                    left: innerLeft + innerWidth * 0.2,
                    top: innerTop,
                    fill: "white",
                    rx: innerWidth * 0.4,
                    ry: innerHeight * 0.5,
                    strokeWidth: 5,
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