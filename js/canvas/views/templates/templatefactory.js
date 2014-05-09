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
                    var rectWidth = width * 0.6;
                    var path = new fabric.Path(
                        "M " + rectWidth + "," + 0 + 
                        "L " + 0 + "," + 0 + 
                        "L " + 0 + "," + height + 
                        "L " + rectWidth + "," + height + 
                        "A " + (width * 0.4) + "," + (height / 2) + "," + 0 + "," + 0 + "," + 0 + "," + width + "," + (height / 2) +
                        "A " + (width * 0.4) + "," + (height / 2) + "," + 0 + "," + 0 + "," + 0 + "," + rectWidth + "," + 0
                        );
                    path.set({left:0, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill:"white"});
                    objects.push(path);
                    fillableObjects.push(path);
                    break;

                case "nand":
                    var oldWidth = width;
                    var width = width * 0.8;

                    var rectWidth = width * 0.6;
                    var path = new fabric.Path(
                        "M " + rectWidth + "," + 0 + 
                        "L " + 0 + "," + 0 + 
                        "L " + 0 + "," + height + 
                        "L " + rectWidth + "," + height + 
                        "A " + (width * 0.4) + "," + (height / 2) + "," + 0 + "," + 0 + "," + 0 + "," + width + "," + (height / 2) +
                        "A " + (width * 0.4) + "," + (height / 2) + "," + 0 + "," + 0 + "," + 0 + "," + rectWidth + "," + 0
                        );
                    path.set({left:0, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill:"white"});
                    objects.push(path);
                    fillableObjects.push(path);

                    var radius = oldWidth / 10;
                    var circle = new fabric.Circle({
                        left: width,
                        top: height / 2 - radius,
                        fill: "white",
                        radius: radius,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    objects.push(circle);

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

                case "nor":
                    var oldWidth = width;
                    var width = width * 0.8;

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

                    var radius = oldWidth / 10;
                    var circle = new fabric.Circle({
                        left: width,
                        top: height / 2 - radius,
                        fill: "white",
                        radius: radius,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    objects.push(circle);
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
                    var triangle = new fabric.Path(
                        "M 0,0" +
                        "L 0," + height + 
                        "L " + (width * 0.75) + "," + (height / 2) +
                        "L 0,0" +
                        "L 0," + height
                        ,{
                            left: 0,
                            top: 0,
                            fill: "white",
                            strokeWidth: this.STROKE_WIDTH,
                            stroke: this.GATE_COLOR,
                            originX: "left",
                            originY: "top"
                        }
                    );
                    triangle.set({left:0, top:0, strokeWidth: this.STROKE_WIDTH, stroke:this.GATE_COLOR, fill:"white"});
                    objects.push(triangle);
                    fillableObjects.push(triangle);
                    var radius = width / 6;
                    var circle = new fabric.Circle({
                        left: width * 0.75 - this.STROKE_WIDTH,
                        top: height / 2 - radius,
                        fill: "white",
                        radius: radius,
                        strokeWidth: this.STROKE_WIDTH,
                        stroke: this.GATE_COLOR
                    });
                    objects.push(circle);
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