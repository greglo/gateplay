var GateView = Backbone.View.extend({
    render : function() {
        var model = this.model;
        var template = TemplateFactory.getTemplate(model.get("templateId"));
        canvas.add(template);
    }
});