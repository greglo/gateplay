var UIGateView = Backbone.View.extend({
    render : function(ctx) {
        var model=this.model;

        ctx.fillStyle = "#FF9000";
        ctx.globalAlpha = 1;
        ctx.fillRect(model.get("x"), model.get("y"), 10, 10);
    }
});