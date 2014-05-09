define([
    "fabric"
], function(fabric) {
    return {
        BOX_SIZE: 120,
        STROKE_WIDTH: 120 / 4,
        WIRE_COLOR: "rgb(70, 70, 70)",
        GATE_COLOR: "rgb(50, 50, 50)",

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
            var fillableObjects = [];


            switch(templateId) {
                case "and":
                    var ellipse = new fabric.Ellipse({
                        left: width * 0.2,
                        top: 0,
                        fill: "white",
                        rx: width * 0.4,
                        ry: height * 0.5,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    objects.push(ellipse);
                    fillableObjects.push(ellipse);
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
                    fillableObjects.push(poly);
                    break;

                case "or":
                    // We do slightly more than a full path around the shape, to get pretty edges in the top left
                    var widthOverFour = (width / 4);
                    var widthOverThree = (width / 3);
                    var twoWidthOverThree = widthOverThree * 2;
                    var heightOverThree = height / 3;
                    var twoHeightOverThree = heightOverThree * 2;
                    var path = new fabric.Path(
                        "M " + widthOverThree + "," + 0 + 
                        "L " + 0 + "," + 0 + 
                        "C " + widthOverFour + "," + heightOverThree + "," + widthOverFour + "," + twoHeightOverThree + "," + 0 + "," + height + 
                        "L " + widthOverThree + "," + height +
                        "C " + twoWidthOverThree + "," + height + "," + width + "," + twoHeightOverThree + "," + width + "," + (height / 2) + 
                        "C " + width + "," + heightOverThree + "," + twoWidthOverThree + ",0," + widthOverThree + ",0" + 
                        "L " + 0 + "," + 0
                        );
                    path.set({left:0, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill:"white"});
                    objects.push(path);
                    fillableObjects.push(path);
                    break;

                case "xor":
                    // We do slightly more than a full path around the shape, to get pretty edges in the top left
                    var left = width / 10;
                    var oldWidth = width;
                    var width = width * 0.9;

                    var widthOverFour = (width / 4);
                    var widthOverThree = (width / 3);
                    var twoWidthOverThree = widthOverThree * 2;
                    var heightOverThree = height / 3;
                    var twoHeightOverThree = heightOverThree * 2;
                    var line = new fabric.Path(
                        "M " + 0 + "," + 0 + 
                        "C " + (oldWidth / 4) + "," + heightOverThree + "," + (oldWidth / 4) + "," + twoHeightOverThree + "," + 0 + "," + height 
                        );
                    var gate = new fabric.Path(
                        "M " + widthOverThree + "," + 0 + 
                        "L " + 0 + "," + 0 + 
                        "C " + widthOverFour + "," + heightOverThree + "," + widthOverFour + "," + twoHeightOverThree + "," + 0 + "," + height + 
                        "L " + widthOverThree + "," + height +
                        "C " + twoWidthOverThree + "," + height + "," + width + "," + twoHeightOverThree + "," + width + "," + (height / 2) + 
                        "C " + width + "," + heightOverThree + "," + twoWidthOverThree + ",0," + widthOverThree + ",0" + 
                        "L " + 0 + "," + 0
                        );
                    var whiteLine = fabric.util.object.clone(line);
                    line.set({left:0, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill: "transparent"});
                    gate.set({left:left, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill:"white"});
                    whiteLine.set({left:left / 2, top:0, strokeWidth: left - this.STROKE_WIDTH, stroke:"white", fill:"transparent"});
                    objects.push(whiteLine);
                    objects.push(line);
                    objects.push(gate);
                    fillableObjects.push(gate);
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
                    fillableObjects.push(triangle);
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
                    fillableObjects.push(rect);
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
                    fillableObjects.push(rect);
                    break;

                case "toggle":
                case "led":
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
                    fillableObjects.push(circle);
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
                    fillableObjects.push(rect);
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

            return {
                template: new fabric.Group(objects),
                fillableObjects: fillableObjects,
            }
        }
    };
});