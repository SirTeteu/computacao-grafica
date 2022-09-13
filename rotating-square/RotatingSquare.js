/*
* @file
*
* Summary.
*
* Vertices are scaled by an amount that varies by
* frame, and this value is passed to the draw function.
*
* @author Paulo Roma
* @since 17/08/2022
* @see https://orion.lcg.ufrj.br/cs336/examples/example123/content/GL_example3a.html
*/

"use strict";

/*
* Raw data for some point positions -
* this will be a square, consisting of two triangles.
* <p>We provide two values per vertex for the x and y coordinates
* (z will be zero by default).</p>
* @type {Float32Array}
*/
var vertices = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/*
* Number of points (vertices).
* @type {Number}
*/
var numPoints = vertices.length / 2;

// A few global variables...

/*
* Canvas width.
* @type {Number}
*/
var w;

/*
* Canvas height.
* @type {Number}
*/
var h;

/*
* Eixo de rotação.
* @type {Number}
*/
var eixo = 0;

/*
* Coordenadas do eixo de rotação.
* @type {Number}
*/
var eixoCoordX, eixoCoordY;

/*
* Coordenadas do quadrado que está sofrendo a transformação linear
* @type {Array<Array<Number>>}
*/
var square = [];

/*
* Coordenadas da posição do quadrado para trocar o eixo de rotação apropriadamente
* @type {Number}
*/
var squareRotated = [];

/*
* Codigo hexa das cores padrões
* @type {String}
*/
var red = "#D23414";
var green = "#0E6B1B"; 
var blue = "#3A14D2";
var white = "#E5E5E5";

/*
* Cor do quadrado
* @type {String}
*/
var color = red;

/*
* Variável auxiliar para animação mudar o eixo de rotação quando for escutado um evento do teclado
* @type {Boolean}
*/
var listener = false;

/*
* Maps a point in world coordinates to viewport coordinates.<br>
* - [-n,n] x [-n,n] -> [-w,w] x [h,-h]
* <p>Note that the Y axix points downwards.</p>
* @param {Number} x point x coordinate.
* @param {Number} y point y coordinate.
* @param {Number} n window size.
* @returns {Array<Number>} transformed point.
*/
function mapToViewport(x, y, n = 5) {
    return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

/*
* Returns the coordinates of the vertex at index i.
* @param {Number} i vertex index.
* @returns {Array<Number>} vertex coordinates.
*/
function getVertex(i) {
    let j = (i % numPoints) * 2;
    return [vertices[j], vertices[j + 1]];
}

/*
* Returna a coordenada do vértice de índice i do array do quadrado.
* @param {Number} índice i.
* @returns {Array<Number>} coordenadas x, y do vértice.
*/
function getSquare(i) {
    return [square[i].x, square[i].y];
}

 
/*
* Renderiza o quadrado e aplica a transformação de rotação
* @param {CanvasRenderingContext2D} ctx canvas context.
* @param {Number} ângulo de rotação.
* @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
*/
function draw(ctx, rotation) {
// console.log(square);
ctx.fillStyle = "rgba(0, 204, 204, 1)";
ctx.rect(0, 0, w, h);
ctx.fill();

ctx.beginPath();

let matrix = new DOMMatrix();
var m = matrix.translate(
    eixoCoordX, 
    eixoCoordY, 
    0
).rotate(rotation)
.translate(
    -eixoCoordX, 
    -eixoCoordY, 
    0
);

for (let i = 0; i < numPoints; i++) {
    let [x, y] = getSquare(i);
    let point = new DOMPoint(x,y);

    let pointRotated = point.matrixTransform(m);
    if (i == 0) ctx.moveTo(pointRotated.x, pointRotated.y);
    else ctx.lineTo(pointRotated.x, pointRotated.y);

    squareRotated[i] = {x: pointRotated.x, y: pointRotated.y};
    }
    ctx.closePath();

    // the fill color
    ctx.fillStyle = color;
    ctx.fill();

}

 /*
  * Atualiza o quadrado que sofre a transformação e o eixo de rotação
  */
function switchSquare() {
    square = [...squareRotated];
    eixoCoordX = square[eixo].x;
    eixoCoordY = square[eixo].y;

    listener = false;

}

/*
* <p>Entry point when page is loaded.</p>
*
* Basically this function does setup that "should" only have to be done once,<br>
* while draw() does things that have to be repeated each time the canvas is
* redrawn.
*/
function mainEntrance() {
    // retrieve <canvas> element
    var canvasElement = document.querySelector("#theCanvas");
    var ctx = canvasElement.getContext("2d");

    w = canvasElement.width;
    h = canvasElement.height;

    for (let i = 0; i < numPoints; i++) {
    let [x, y] = mapToViewport(...getVertex(i));
    square.push({x: x, y: y});
    squareRotated.push({});

    }

    eixoCoordX = square[eixo].x;
    eixoCoordY = square[eixo].y;


    /*
    * A closure to set up an animation loop in which the
    * scale grows by "increment" each frame.
    * @global
    * @function
    */
    var runanimation = (() => {
        var rotation = 0;

        return () => {
            draw(ctx, rotation);

            rotation += 2;
            if (rotation > 360) {
                rotation = 0;
            }

            if(listener) {
                switchSquare();
            }
        
            
            // request that the browser calls runanimation() again "as soon as it can"
            requestAnimationFrame(runanimation);
        };
    })();

    setListeners();

    // draw!
    runanimation();
}

function setListeners() {
    window.addEventListener("keydown", function (e) {
        console.log(1);
        if(e.key == 'r' && eixo != 0) {
            listener = true;
            eixo = 0;
            color = red;
        } else if(e.key == 'g' && eixo != 1) {
            listener = true;
            eixo = 1;
            color = green;
        } else if(e.key == 'b' && eixo != 2) {
            listener = true;
            eixo = 2;
            color = blue;
        } else if(e.key == 'w' && eixo != 3) {
            listener = true;
            eixo = 3;
            color = white;
        }

    }, false);
}