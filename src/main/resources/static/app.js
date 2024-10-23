var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var topic = 0;
    var subscription = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawPolygon = function (points){
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length;i++){
            console.log("Point " + i + points[i].x, points[i].y + "\n" );
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();

        console.log("deberia funcionar el dibujo");
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
            subscription = stompClient.subscribe('/topic/newpoint.' + topic , function (eventbody) {
                var theObject=JSON.parse(eventbody.body);
                addPointToCanvas(theObject);
                //alert(eventbody.body);
            });

            subscription = stompClient.subscribe('/topic/newpolygon.' + topic , function (eventbody) {
                console.log("LÓGICA FUNCIONA")
                var theObject=JSON.parse(eventbody.body);
                drawPolygon(theObject);
                //alert(eventbody.body);*/
            });
            
        });
    };

    var publishPoint = function(px,py){
       var pt=new Point(px,py);
       console.info("publishing point at "+pt);
       return stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));
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



    return {

        init: function () {
            initCanvas();
        },

        publishPoint,

        connect: function(topicToSet) {
            if (subscription != null){
                subscription.unsubscribe();
            }
            topic = topicToSet;
            clearCanvas();
            connectAndSubscribe();
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();