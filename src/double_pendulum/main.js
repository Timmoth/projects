import p5 from "p5";

let r1 = 125;
let r2 = 125;
let m1 = 10;
let m2 = 10;
let a1 = Math.PI / 2;      // 90 degrees
let a2 = Math.PI / 2 + 0.01; // tiny offset from a1
let a1_v = 0.0;
let a2_v = 0.02;           // give second bob a small kick
let g = 1;

let points = []
new p5((s) => {
  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight, s.WEBGL);
    s.background(0);
    s.noFill();
    s.strokeWeight(2);
    s.colorMode(s.HSB, 360, 100, 100, 255);
  };

  s.draw = () => {
    let num1 = -g * (2 * m1 + m2) * Math.sin(a1);
    let num2 = -m2 * g * Math.sin(a1 - 2 * a2);
    let num3 = -2 * Math.sin(a1 - a2) * m2;
    let num4 = a2_v * a2_v * r2 + a1_v * a1_v * r1 * Math.cos(a1 - a2);
    let den = r1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
    let a1_a = (num1 + num2 + num3 * num4) / den;

    num1 = 2 * Math.sin(a1 - a2);
    num2 = (a1_v * a1_v * r1 * (m1 + m2));
    num3 = g * (m1 + m2) * Math.cos(a1);
    num4 = a2_v * a2_v * r2 * m2 * Math.cos(a1 - a2);
    den = r2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
    let a2_a = (num1 * (num2 + num3 + num4)) / den;


    s.push();
    s.stroke(255);

    let x1 = r1 * Math.sin(a1);
    let y1 = r1 * Math.cos(a1);

    let x2 = x1 + r2 * Math.sin(a2);
    let y2 = y1 + r2 * Math.cos(a2);

    a1_v += a1_a;
    a2_v += a2_a;
    a1 += a1_v;
    a2 += a2_v;

    points.push([x2, y2]);

    if (points.length > 100) {
      points.shift();
    }

    s.background(0);
    for (let i = 1; i < points.length; i++) {
      let p = points[i];
      let prev = points[i - 1];
      let dx = p[0] - prev[0];
      let dy = p[1] - prev[1];
      let speed = Math.sqrt(dx * dx + dy * dy);

      let hue = s.map(speed, 0, 20, 200, 360, true);
      let t = i / points.length;

      s.stroke(hue, 100, 100);
      s.strokeWeight(1 + t * 18);
      s.point(p[0], p[1]);
    }


    s.pop();

  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
  };
});
