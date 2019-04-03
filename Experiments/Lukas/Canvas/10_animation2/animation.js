let time = Date.now();
let canvas = document.getElementsByTagName("canvas")[0];
let crc = canvas.getContext("2d");
let y = 100;
let startPoint = { x: 0, y: 0 };
let tangentPoint1 = { x: 0, y: 0 };
let tangentPoint2 = { x: 100, y: 100 };
let endPoint = { x: 100, y: 100 };
let a, b, c, d;
function calculateFunction() {
    let m0 = 0;
    let m1 = 0;
    d = startPoint.y;
    c = m0;
    a = (2 / Math.pow(endPoint.x, 2)) * ((m0 - m1) / 2 + (startPoint.y - endPoint.y) / endPoint.x);
    b = (m0 - m1) / (endPoint.x * -2) - (3 * a * endPoint.x) / 2;
}
calculateFunction();
draw();
function draw() {
    crc.clearRect(0, 0, canvas.width, canvas.height);
    let bezierPath = new Path2D();
    bezierPath.arc(startPoint.x, startPoint.y, 5, 0, 2 * Math.PI);
    bezierPath.moveTo(startPoint.x, startPoint.y);
    bezierPath.bezierCurveTo(tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
    bezierPath.arc(endPoint.x, endPoint.y, 5, 0, 2 * Math.PI);
    crc.stroke(bezierPath);
    let duration = 2000;
    let timeModulo = (Date.now() - time) % duration;
    let currentXPosition = (endPoint.x - startPoint.x) * timeModulo / duration;
    // let currentPosition: Vector2 = getBezierXY(timeModulo / duration, startPoint.x, startPoint.y, tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
    let currentYPosition = getBezierY(currentXPosition);
    let halfwayPosition = getBezierXY(0.5, startPoint.x, startPoint.y, tangentPoint1.x, tangentPoint1.y, tangentPoint2.x, tangentPoint2.y, endPoint.x, endPoint.y);
    let currentPointPath = new Path2D();
    currentPointPath.rect(currentXPosition - 5, currentYPosition - 5, 10, 10);
    crc.stroke(currentPointPath);
    drawRect(currentYPosition);
    crc.moveTo(halfwayPosition.x, halfwayPosition.y);
    crc.arc(halfwayPosition.x, halfwayPosition.y, 3, 0, Math.PI * 2);
    crc.stroke();
    let fps = 30;
    setTimeout(draw, 1000 / fps);
}
function drawRect(_y) {
    let offsetY = 100;
    let rectPath = new Path2D();
    rectPath.rect(200, _y + offsetY, 50, 50);
    crc.fill(rectPath);
}
function getBezierY(_x) {
    return a * Math.pow(_x, 3) + b * Math.pow(_x, 2) + c * _x + d;
}
function getBezierXY(t, sx, sy, cp1x, cp1y, cp2x, cp2y, ex, ey) {
    return {
        x: Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x
            + 3 * t * t * (1 - t) * cp2x + t * t * t * ex,
        y: Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y
            + 3 * t * t * (1 - t) * cp2y + t * t * t * ey
    };
}
//# sourceMappingURL=animation.js.map