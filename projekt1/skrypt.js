class Point {
    constructor(x,y){
    this.x = x;
    this.y = y;
    }
}

//12
//var c = document.getElementById("drawblock");
//var ctx = c.getContext("2d");
var MAX =100;
var countP = 0;
var tab = new Array();
var t = 0;
var Animacja;

var a=1;
var b =1;

function openBlock(){
    var canvas = document.getElementById("drawblock");
	page = document.getElementById("page");
	canvas.width= page.clientWidth*0.7;
	canvas.height= 600;
	cleanBlock();
	document.getElementById("openButton").innerHTML = "Dopasuj obszar rysowania do strony";
	deletePoints();
}

function addpoint(event){
    if(countP<12)
    {
        if(countP ==tab.length)
        {
            tab.push( new Point(event.offsetX/a, event.offsetY/b) );
        }
        else
        {
            tab[countP].x = event.offsetX/a;
            tab[countP].y = event.offsetY/b;
        }
        var cords = "X: "+ tab[countP].x +", Y: "+tab[countP].y;
        document.getElementById("cords").innerHTML = cords;

        var canvas = document.getElementById("drawblock");
       	var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(tab[countP].x, tab[countP].y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'blue';
        ctx.font = "12px Arial";
        ctx.fillText(countP+1, tab[countP].x+3, tab[countP].y);

        countP++;

        if(countP>1)
        {
            cleanBlock();
	    drawPoints();
            drawBezier(MAX);
        }
    }
    else
    {
        document.getElementById("cords").innerHTML = "Maksymalna ilosc punktów to 12!";
    }
}

function drawBezier(cmax)
{
    var c = document.getElementById("drawblock");
    var ctx = c.getContext("2d");

    var P1 = new Point(tab[0].x,tab[0].y);
    var P2 = new Point(tab[0].x,tab[0].y);
    for(var t = 1; t<=cmax; t++)
    {
        P2 = calcPointBezier(tab,countP,t/MAX);
        ctx.beginPath();
	ctx.strokeStyle = "green";
        ctx.moveTo(P1.x,P1.y);
        ctx.lineTo(P2.x,P2.y);
	ctx.closePath();
	ctx.lineWidth=3;
        ctx.stroke();
        P1.x = P2.x;
        P1.y = P2.y;
    }
}

function cleanBlock(){
    var c = document.getElementById("drawblock");
    var ctx = c.getContext("2d");
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.rect(-4,-4,c.width+4,c.height+4);
    ctx.closePath();
    ctx.fill();
}

function drawPoints(){
    var c = document.getElementById("drawblock");
    var ctx = c.getContext("2d");

    for(var i=0; i<countP;i++){
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(tab[i].x, tab[i].y, 4, 0, 2 * Math.PI);
        ctx.closePath();
	ctx.fill();
        ctx.fillStyle = 'blue';
        ctx.font = "12px Arial";
        ctx.fillText(i+1, tab[i].x+3, tab[i].y);
    }
}


function calcPointBezier(curTab,curCount,part){
    if(curCount >1){
        var newTab = Array();
        for(var i=0;i<curCount-1; i++)
        {
            newTab.push( new Point( curTab[i].x + (curTab[i+1].x - curTab[i].x)*part , curTab[i].y + (curTab[i+1].y - curTab[i].y)*part) );
        }
        return calcPointBezier(newTab,curCount-1,part);
    }
    else
    {
        return curTab[0];
    }
}

function stopAnimate(){
    t=0;
    if(countP>1){
        if(document.getElementById("animButton").innerText == "Stop Animacja"){
            clearInterval(Animacja);
            document.getElementById("animButton").innerHTML = "Start Animacja";
        }
        cleanBlock();
        drawPoints();
        drawBezier(MAX);
    }
}

function animateBezier(){
    if(countP>1){
        document.getElementById("cords").innerHTML = "animate Start!";
        if(document.getElementById("animButton").innerText == "Start Animacja"){
            Animacja = window.setInterval(oneFrame, 50);
            document.getElementById("animButton").innerHTML = "Stop Animacja";
        }
        else{
            clearInterval(Animacja);
            document.getElementById("animButton").innerHTML = "Start Animacja";
        }
        document.getElementById("cords").innerHTML = "animate End!";
        document.getElementById("cords").innerHTML = document.getElementById("animButton").innerText;//"animate End!";
    }
}

function deletePoints(){
    stopAnimate();
    countP = 0;
    cleanBlock();
}

function oneFrame(){
    var c = document.getElementById("drawblock");
    var ctx = c.getContext("2d");
    var k = countP;
    var part = 0;

    var curtab = Array();
    var newtab = Array();
    for(var j = 0; j<tab.length;j++)
    {
        curtab.push(new Point(tab[j].x,tab[j].y));
        newtab.push(new Point(tab[j].x,tab[j].y));
    }

    cleanBlock();

    part = t/MAX;
        while(k >1)
        {
            newtab[0].x =  curtab[0].x + (curtab[1].x - curtab[0].x)*part;
            newtab[0].y =  curtab[0].y + (curtab[1].y - curtab[0].y)*part;

            for(var i=1; i<k-1; i++)
            {
                newtab[i].x = curtab[i].x + (curtab[i+1].x - curtab[i].x)*part;
                newtab[i].y = curtab[i].y + (curtab[i+1].y - curtab[i].y)*part;
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(newtab[i-1].x, newtab[i-1].y, 4, 0, 2 * Math.PI);
                ctx.arc(newtab[i].x, newtab[i].y, 4, 0, 2 * Math.PI);
                ctx.closePath();
		ctx.fill();
                ctx.beginPath();
                ctx.strokeStyle = 'grey';
                ctx.moveTo(newtab[i-1].x,newtab[i-1].y);
                ctx.lineTo(newtab[i].x,newtab[i].y);
                ctx.closePath();
		ctx.lineWidth=2;
		ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(curtab[i-1].x,curtab[i-1].y);
                ctx.lineTo(curtab[i].x,curtab[i].y);
		ctx.closePath();
		ctx.lineWidth=1;
		ctx.stroke();
            }
            k--;
            curtab = newtab.slice();
        }

        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(newtab[0].x, newtab[0].y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tab[countP-2].x,tab[countP-2].y);
        ctx.lineTo(tab[countP-1].x,tab[countP-1].y);
	ctx.closePath();
	ctx.lineWidth=1;
        ctx.stroke();
        drawPoints();
        drawBezier(t);

	if(t == 100)
	    t= 0;
	else
	    t++;
	//window.requestAnimationFrame(oneFrame);
}
