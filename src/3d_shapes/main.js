import p5 from "p5";

let angleX = 0;
let angleY = 0;
let angleZ = 0;

new p5((s) => {
  let shapes, edges;
  let shapeIndex = 0;

  function drawGlowingTorus(R, r, detailU, detailV) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      for (let u = 0; u < detailU; u++) {
        let theta1 = (u / detailU) * s.TWO_PI;
        let theta2 = ((u + 1) / detailU) * s.TWO_PI;
        for (let v = 0; v < detailV; v++) {
          let phi1 = (v / detailV) * s.TWO_PI;
          let phi2 = ((v + 1) / detailV) * s.TWO_PI;

          let p1 = torusPoint(R, r, theta1, phi1);
          let p2 = torusPoint(R, r, theta2, phi1);
          let p3 = torusPoint(R, r, theta1, phi2);

          s.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
          s.line(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z);
        }
      }
    }
  }

  function torusPoint(R, r, theta, phi) {
    let x = (R + r * Math.cos(phi)) * Math.cos(theta);
    let y = (R + r * Math.cos(phi)) * Math.sin(theta);
    let z = r * Math.sin(phi);
    return s.createVector(x, y, z);
  }

  function drawGlowingSphere(R, detailU = 24, detailV = 16) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      for (let u = 0; u < detailU; u++) {
        let theta1 = (u / detailU) * s.TWO_PI;
        let theta2 = ((u + 1) / detailU) * s.TWO_PI;
        for (let v = 0; v < detailV; v++) {
          let phi1 = (v / detailV) * s.PI;
          let phi2 = ((v + 1) / detailV) * s.PI;

          let p1 = spherePoint(R, theta1, phi1);
          let p2 = spherePoint(R, theta2, phi1);
          let p3 = spherePoint(R, theta1, phi2);

          s.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
          s.line(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z);
        }
      }
    }
  }

  function spherePoint(R, theta, phi) {
    let x = R * Math.sin(phi) * Math.cos(theta);
    let y = R * Math.sin(phi) * Math.sin(theta);
    let z = R * Math.cos(phi);
    return s.createVector(x, y, z);
  }

  function drawGlowingTorusKnot(R = 75, r = 40, p = 2, q = 3, segments = 200) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      for (let t = 0; t < segments; t++) {
        let u1 = (t / segments) * s.TWO_PI;
        let u2 = ((t + 1) / segments) * s.TWO_PI;

        let p1 = torusKnotPoint(R, r, p, q, u1);
        let p2 = torusKnotPoint(R, r, p, q, u2);
        s.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
  }

  function torusKnotPoint(R, r, p, q, t) {
    let x = (R + r * Math.cos(q * t)) * Math.cos(p * t);
    let y = (R + r * Math.cos(q * t)) * Math.sin(p * t);
    let z = r * Math.sin(q * t);
    return s.createVector(x, y, z);
  }

  function drawGlowingLissajous(a = 3, b = 4, c = 5, delta = s.PI / 2, segments = 200, scale = 75) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      for (let t = 0; t < segments; t++) {
        let u1 = (t / segments) * s.TWO_PI;
        let u2 = ((t + 1) / segments) * s.TWO_PI;

        let p1 = s.createVector(
          scale * Math.sin(a * u1 + delta),
          scale * Math.sin(b * u1),
          scale * Math.sin(c * u1)
        );

        let p2 = s.createVector(
          scale * Math.sin(a * u2 + delta),
          scale * Math.sin(b * u2),
          scale * Math.sin(c * u2)
        );

        s.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
  }

  function drawGlowingSpiral(radius = 75, turns = 5, height = 75, segments = 200) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      for (let t = 0; t < segments; t++) {
        let u1 = (t / segments) * turns * s.TWO_PI;
        let u2 = ((t + 1) / segments) * turns * s.TWO_PI;

        let p1 = s.createVector(
          radius * Math.cos(u1),
          radius * Math.sin(u1),
          height * (t / segments)
        );
        let p2 = s.createVector(
          radius * Math.cos(u2),
          radius * Math.sin(u2),
          height * ((t + 1) / segments)
        );

        s.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }
  }

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight, s.WEBGL);
    s.angleMode(s.RADIANS);
    s.noFill();
    s.strokeWeight(2);
    s.colorMode(s.HSB, 360, 100, 100, 255);
    s.ortho(-s.width / 2, s.width / 2, -s.height / 2, s.height / 2, 0, 1000);

    // Polyhedra vertices/edges
    let cube = [s.createVector(-1, -1, -1), s.createVector(1, -1, -1), s.createVector(1, 1, -1), s.createVector(-1, 1, -1), s.createVector(-1, -1, 1), s.createVector(1, -1, 1), s.createVector(1, 1, 1), s.createVector(-1, 1, 1)];
    let cubeEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

    let octa = [s.createVector(1, 0, 0), s.createVector(-1, 0, 0), s.createVector(0, 1, 0), s.createVector(0, -1, 0), s.createVector(0, 0, 1), s.createVector(0, 0, -1)];
    let octaEdges = [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]];

    let pyramid = [s.createVector(-1, -1, -1), s.createVector(1, -1, -1), s.createVector(0, 1, 0), s.createVector(-1, -1, 1), s.createVector(1, -1, 1)];
    let pyramidEdges = [[0, 1], [1, 4], [4, 3], [3, 0], [0, 2], [1, 2], [3, 2], [4, 2]];

    let tetra = [s.createVector(1, 1, 1), s.createVector(-1, -1, 1), s.createVector(-1, 1, -1), s.createVector(1, -1, -1)];
    let tetraEdges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

    let phi = (1 + Math.sqrt(5)) / 2;
    let ico = [s.createVector(-1, phi, 0), s.createVector(1, phi, 0), s.createVector(-1, -phi, 0), s.createVector(1, -phi, 0),
    s.createVector(0, -1, phi), s.createVector(0, 1, phi), s.createVector(0, -1, -phi), s.createVector(0, 1, -phi),
    s.createVector(phi, 0, -1), s.createVector(phi, 0, 1), s.createVector(-phi, 0, -1), s.createVector(-phi, 0, 1)];
    let icoEdges = [[0, 1], [0, 5], [0, 7], [0, 10], [0, 11], [1, 5], [1, 7], [1, 8], [1, 9], [2, 3], [2, 4], [2, 6], [2, 10], [2, 11], [3, 4], [3, 6], [3, 8], [3, 9], [4, 5], [4, 9], [4, 11], [5, 9], [5, 11], [6, 7], [6, 8], [6, 10], [7, 8], [7, 10], [8, 9], [10, 11]];

    shapes = [cube, octa, pyramid, tetra, ico, "torus", "sphere", "knot", "lissajous", "spiral"];
    edges = [cubeEdges, octaEdges, pyramidEdges, tetraEdges, icoEdges, null, null, null, null, null];
  };


  s.draw = () => {
    s.background(0);

    s.rotateX(angleX);
    s.rotateY(angleY);
    s.rotateZ(angleZ);

    angleX += 0.01;
    angleY += 0.013;
    angleZ += 0.017;

    // Switch shape every 120 frames
    if (s.frameCount % 120 === 0) {
      shapeIndex = (shapeIndex + 1) % shapes.length;
    }

    if (shapes[shapeIndex] === "torus") {
      drawGlowingTorus(100, 50, 24, 16);
    } else if (shapes[shapeIndex] === "sphere") {
      drawGlowingSphere(100, 24, 16);
    } else if (shapes[shapeIndex] === "knot") {
      drawGlowingTorusKnot();
    } else if (shapes[shapeIndex] === "lissajous") {
      drawGlowingLissajous();
    } else if (shapes[shapeIndex] === "spiral") {
      drawGlowingSpiral();
    } else {
      drawGlowingWireframeShape(shapes[shapeIndex], edges[shapeIndex], 150);
    }
  };

  function drawGlowingWireframeShape(vertices, edges, scale) {
    let layers = 4;
    s.drawingContext.disable(s.drawingContext.DEPTH_TEST);
    s.scale(0.4);

    for (let i = layers; i > 0; i--) {
      let alpha = s.map(i, layers, 0, 0, 255);
      s.stroke(200, 100, 100, alpha);
      s.strokeWeight(i * 0.5);

      edges.forEach(([a, b]) => {
        let v1 = vertices[a].copy().mult(scale);
        let v2 = vertices[b].copy().mult(scale);
        s.line(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      });
    }
  }

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    s.ortho(-s.width / 2, s.width / 2, -s.height / 2, s.height / 2, 0, 1000);
  };
});
