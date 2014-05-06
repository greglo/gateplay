define([
    "fabric"
], function(fabric) {
    return {
        BOX_SIZE: 120,
        STROKE_WIDTH: 120 / 4,
        WIRE_COLOR: "rgb(70, 70, 70)",
        GATE_COLOR: "rgb(70, 70, 70)",

        getWire: function() {
            var wire = new fabric.Rect({
                left: 0,
                top: 0,
                strokeWidth: this.BOX_SIZE / 2,
                stroke: this.WIRE_COLOR,
                width: this.BOX_SIZE / 2,
                height: this.BOX_SIZE / 2
            });
            wire.selectable = false;
            return wire;
        },

        getTemplate: function(templateId, width, height) {
            var boxSize = this.BOX_SIZE;

            var width = width * boxSize;
            var height = height * boxSize - this.STROKE_WIDTH;
            var objects = [];


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
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    }));
                    var points = [];
                    points.push({x:width * 0.6, y:0});
                    points.push({x:0, y:0});
                    points.push({x:0, y:height});
                    points.push({x:width * 0.6, y:height});
                    var poly = new fabric.Polyline(points, {
                        left: 0,
                        top: 0,
                        stroke: this.GATE_COLOR,
                        strokeWidth: this.STROKE_WIDTH,
                        fill: "white"
                    });
                    objects.push(poly);
                    break;

                case "not":
                    var triangle = new fabric.Triangle({
                        left: 0,
                        top: 0,
                        fill: "white",
                        width: height,
                        height: width * 0.75,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    triangle.set("angle", 90);
                    objects.push(triangle);
                    var radius = height / 6;
                    var circle = new fabric.Circle({
                        left: width * 0.75 - radius,
                        top: height / 2 - radius,
                        fill: "white",
                        radius: radius,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    //objects.push(circle);
                    break;

                case "on":
                    var rect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        fill: "green",
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR,
                    });
                    objects.push(rect);
                    break;

                case "off":
                    var rect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        fill: "red",
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR,
                    });
                    objects.push(rect);
                    break;

                case "toggle":
                    var radius = height / 2;
                    var circle = new fabric.Circle({
                        left: 0,
                        top: 0,
                        fill: "green",
                        radius: radius,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    objects.push(circle);
                    break;

                default:
                    var rect = new fabric.Rect({
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        fill: "gray",
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR,
                    });
                    objects.push(rect);

                    var text = new fabric.Text(templateId, {
                        stroke: "black",
                        strokeWidth: 8,
                        originX: "center",
                        originY: "center",
                        left: (width + this.STROKE_WIDTH) / 2,
                        top: (height - 50) / 2,
                        fontSize: 200,
                    })
                    objects.push(text);
            }

            return new fabric.Group(objects);
        }
    };
});