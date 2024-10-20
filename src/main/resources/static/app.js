var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var topic;

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

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + topic , function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
                //alert(eventbody.body);
            });
        });

    };

    var publishPoint = function(px,py){
       var pt=new Point(px,py);
       console.info("publishing point at "+pt);
       stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt));
    };

    const initCanvas = () => {
        const c = document.getElementById("canvas");
        if(window.PointerEvent) {
            scratchPoint("pointerdown", canvas);
        }
        else {
            scratchPoint("mousedown", canvas);
        }
    };

    var setTopic = function(topicToChange){
        topic = topicToChange;
        connectAndSubscribe();
        clearCanvas();
    };

    var clearCanvas = function(){
        const c = document.getElementById("myCanvas");
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
    };

    return {

        init: function () {
            initCanvas();
        },

        publishPoint,
        setTopic,

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }

    };

})();