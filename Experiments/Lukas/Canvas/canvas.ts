// import { drawTypes } from "./canvastypes";

import Line = DrawTypes.DrawLine;
import Vector2 = DrawTypes.Vector2;
import Path = DrawTypes.DrawPath;


window.addEventListener("load", init);

let crc: CanvasRenderingContext2D;
// let l1: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l2: Line = new Line(new Vector2(200, 200), new Vector2(300, 100), new Vector2(200, 200), new Vector2(300, 200));
// let l3: Line = new Line(new Vector2(300, 100), new Vector2(200, 0));
// let l4: Line = new Line(new Vector2(200, 0), new Vector2(100, 100));
// let exPath: Path = new Path([l1, l2, l3, l4], "yellow", "test");

// let l5: Line = new Line(new Vector2(0, 0), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let l6: Line = new Line(new Vector2(100, 100), new Vector2(200, 200), new Vector2(100, 100), new Vector2(100, 200));
// let exPath2: Path = new Path([l5,l6], "hotpink", "test");

let paths: Path[] = [];

function init() {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
    canvas.addEventListener("mousedown", mousedown)

    crc = canvas.getContext("2d");

    // crc.beginPath();
    // crc.moveTo(0, 0);
    // crc.lineTo(100, 100);
    // crc.stroke();

    // exPath.draw(crc);
    // exPath2.draw(crc);

    for (let i: number = 0; i < 3; i++) {
        let path: Path = new Path([], "red", "path" + i, i);
        let previousEnd: Vector2 = new Vector2(RandomRange(0, 500), RandomRange(0, 500));
        for (let k: number = 0; k < 2; k++) {
            let newEnd: Vector2 = new Vector2(RandomRange(0, 500), RandomRange(0, 500));
            path.addLine(new Line(previousEnd, newEnd));
            previousEnd = newEnd;
        }
        path.addLine(new Line(previousEnd, path.path[0].startPoint));
        paths.push(path);
    }

    paths.sort(Path.sort);

    for (let path of paths) {
        path.draw(crc);
    }

}

function mousedown(_event: MouseEvent) {
    let foundPath: Path;
    for (let path of paths) {
        if (crc.isPointInPath(path.getPath2D(), _event.clientX, _event.clientY)) {
            foundPath = path;
        }
    }

    console.log("clicked on " + foundPath.name);

}

function RandomRange(min: number, max: number): number {
    return (Math.random() * (max + min)) - min;
}