var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var connected = false;
    var topic = 0;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var scratchPoint = function (pointerType, canvas){
        canvas.addEventListener(pointerType, function(event){
            var points = getMousePosition(event, canvas);
            publishPoint(points.x, points.y);
        })
    };
    
    var getMousePosition = function (evt, canvas) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function (topic) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + topic , function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
                connected = true;
                //alert(eventbody.body);
            });
        });

    };


    var publishPoint = function(px,py){
       var pt=new Point(px,py);
       console.info("publishing point at "+pt);
       return stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt));
    };

    const initCanvas = () => {
        const c = document.getElementById("canvas");
        if (window.PointerEvent) {
            scratchPoint("pointerdown", c);
        } else {
            scratchPoint("mousedown", c);
        }
    };

    var clearCanvas = function(){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    };

    var disconnect = function () {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        connected = false;
        console.log("Disconnected");
    };

    return {

        init: function () {
            initCanvas();
        },

        publishPoint,

        connect: function(topicToSet) {
            disconnect();
            topic = topicToSet;
            clearCanvas();
            connectAndSubscribe(topic);  
        },

        disconnect

    };

})();