define([
    "jquery",
    "jquery-ui",
    "foundation",
    "fabric",
    "canvas/models/circuit",
    "canvas/models/component",
    "canvas/views/circuitview",
    "canvas/views/componentview",
    "sim/circuit",
    "circuitadapter"
], 
function($, ui, Foundation, fabric, Circuit, Component, CircuitView, ComponentView, SimCircuit, CircuitAdapter) {
    var GRID_SIZE = 16;

    $(function() {
        $(document).foundation();

        // Calculate full width and full height canvas size
        var gridWidth = $("#workbench").parent().innerWidth();
        var gridHeight = $(window).height() - $(".top-bar").height();
        gridWidth = Math.floor(gridWidth / GRID_SIZE);
        gridHeight = Math.floor(gridHeight / GRID_SIZE);
        var pixelWidth = gridWidth * GRID_SIZE;
        var pixelHeight = gridHeight * GRID_SIZE;

        // Size <canvas>
        $("#workbench").attr("width", pixelWidth);
        $("#workbench").attr("height", pixelHeight);

        // Create the canvas model
        var circuit = new Circuit({
            width: gridWidth,
            height: gridHeight
        });

        circuit.addComponent(0, 0, 7, 3, 1, "and");

        // Create canvas view
        var v = new CircuitView({
            GRID_SIZE: GRID_SIZE,
            circuit: circuit,
        });

        var bridge = new CircuitAdapter();
        bridge.createModelFromView(circuit);

        var simcircuit = new SimCircuit();
        simcircuit.addComponent(0, "not", 1, 1);
        simcircuit.addComponent(1, "not", 1, 1);
        simcircuit.addComponent(2, "not", 1, 1);
        simcircuit.addWire(0, 0, 1, 0);
        simcircuit.addWire(1, 0, 2, 0);
        simcircuit.addWire(2, 0, 0, 0);


        simcircuit.initialize();
        for (var i = 0; i < 500; i++)
            simcircuit.tick();

        // Create image files for each gate
        $("#rasterizer").attr("width", 2 * 7 * GRID_SIZE);
        $("#rasterizer").attr("height", 5 * GRID_SIZE);
        
        var rasterizer = new fabric.StaticCanvas("rasterizer");
        $(".gate").each(function() {
            rasterizer.clear();
            
            var templateId = $(this).data("templateid");
            var validGate = new Component({
                templateId: templateId,
                canvas: rasterizer,
                x: 0,
                y: 0,
                isValid: true
            });
            var validView = new ComponentView({
                model: validGate,
                options: {
                    GRID_SIZE: GRID_SIZE,
                    canvas: rasterizer
                }
            });
            validView.render();

            var templateId = $(this).data("templateid");
            var validGate = new Component({
                templateId: templateId,
                canvas: rasterizer,
                x: validGate.get("width"),
                y: 0,
                isValid: false
            });
            var validView = new ComponentView({
                model: validGate,
                options: {
                    GRID_SIZE: GRID_SIZE,
                    canvas: rasterizer
                }
            });
            validView.render();


            $(this).css("width", 7 * GRID_SIZE);
            $(this).css("height", 5 * GRID_SIZE);
            $(this).css("background-image", "url(" + rasterizer.toDataURL() + ")");
        });

        $("#download-image").click(function() {
            var image = v.canvas.toDataURL();
            var a = document.getElementById('download-image');
            a.href=image;
            a.download = "circuit.png";
        });


        // Accordion
        var lastMoved;
        $(".slider").click(function() {
            var pane = $("#" + $(this).data("pane"));
            var speed = 100;

            if (typeof(lastMoved) === "undefined" || !lastMoved) {
                pane.slideDown(speed, function() {});
                lastMoved = pane;
            } else if (lastMoved.is(pane)) {
                lastMoved.slideUp(speed, function(){});
                lastMoved = null;
            } else {
                lastMoved.slideUp(speed, function(){});
                pane.slideDown(speed, function() {});
                lastMoved = pane;
            }
        });

        // Drag & drop gates
        $(".gate").draggable({
            revert: true,
            revertDuration: 0,
            scroll: false,
            cursor: "pointer",
            helper: 'clone',
            zIndex: 1000,
            start: function(event, ui) { 
                $(ui.helper).addClass("invalid");
            },
            drag: function(event, ui) { 
                var x = Math.round((event.pageX - $("#workbench").offset().left) / GRID_SIZE - 3.5);
                var y = Math.round((event.pageY - $("#workbench").offset().top) / GRID_SIZE - 2.5);
                if (circuit.isEmptyRect(x, y, 7, 5)) {
                    $(ui.helper).removeClass("invalid");
                    // HACK: Force webkit browsers to display the class change
                    $(ui.helper).css("display", "none");
                    $(ui.helper).offset();
                    $(ui.helper).css("display", "block");
                } else {
                    $(ui.helper).addClass("invalid");
                    $(ui.helper).css("display", "none");
                    $(ui.helper).offset();
                    $(ui.helper).css("display", "block");
                }
            },
        });
        $(".gate").draggable("option", "cursorAt", {
            left: Math.round($(".gate").width() / 2),
            top: Math.round($(".gate").height() / 2)
        }); 

        $("#workbench").droppable({ 
            accept: ".gate", 
            drop: function(event, ui) {
                circuit.addComponent(
                    Math.round((event.pageX - $("#workbench").offset().left) / GRID_SIZE - 3.5), 
                    Math.round((event.pageY - $("#workbench").offset().top) / GRID_SIZE - 2.5),
                    7,
                    $(ui.helper).data("inputCount"),
                    $(ui.helper).data("outputCount"),
                    $(ui.helper).data("templateid")
                );
            }, 
        });

        $("#specialButton").click(function() {
            alert("Well obviously I couldn't not... Have a lovely evening <3 :)")
        });
      
        $("#loading-panel").fadeOut(300, function() {
            $("#loading-screen").fadeOut(300);
        });
    });
});