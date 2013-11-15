var TemplateFactory = {
    getTemplate: function(templateId) {
        var boxSize = 20; // TODO
        var width = 6 * boxSize;
        var height = 5 * boxSize;
        var objects = [];

        switch(templateId) {
            case "and":
                objects.push(new fabric.Rect({
                    left: 0,
                    top: 0,
                    fill: 'red',
                    width: width * 0.6,
                    height: height
                }));
                objects.push(new fabric.Ellipse({
                    left: width * 0.2,
                    top: 0,
                    fill: 'red',
                    rx: width * 0.4,
                    ry: height * 0.5
                }));
                break;

            default:
                throw "Unknown templateId";
        }

        var group = new fabric.Group(objects);
        group.hasControls = false;
        return group;
    }
};