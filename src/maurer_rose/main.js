import p5 from "p5";

const nValues = [3, 4, 5, 6, 7, 8];
const dValues = [29, 71, 137, 59, 47];
const transitionFrames = 180; // number of frames for fade

new p5((s) => {
  let currentDIndex = Math.floor(Math.random() * dValues.length);
  let currentNIndex = Math.floor(Math.random() * nValues.length);

  let nextDIndex = Math.floor(Math.random() * dValues.length);
  let nextNIndex = Math.floor(Math.random() * nValues.length);

  let t = 0; // transition progress (0 → transitionFrames)

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.angleMode(s.RADIANS);
    s.noFill();
    s.strokeWeight(2);
    s.colorMode(s.HSB, 360, 100, 100, 255);
  };

  s.draw = () => {
    s.background(0);
    s.translate(s.windowWidth / 2, s.windowHeight / 2);

    const progress = t / transitionFrames;
    const rFactor = Math.min(s.windowWidth, s.windowHeight) / 3;

    // Smoothstep easing
    const ease = p => p * p * (3 - 2 * p);
    const alphaOut = 255 * (1 - ease(progress));
    const alphaIn = 255 * ease(progress);

    // Draw current shape fading out
    s.beginShape();
    const dCurr = dValues[currentDIndex];
    const nCurr = nValues[currentNIndex];
    for (let i = 0; i < 360; i++) {
      const k = i * dCurr * Math.PI / 180;
      const r = rFactor * Math.sin(nCurr * k);
      const x = r * Math.cos(k);
      const y = r * Math.sin(k);
      const hue = (i + s.frameCount * 0.5) % 360;
      s.stroke(hue, 80, 100, alphaOut);
      s.vertex(x, y);
    }
    s.endShape();

    // Draw next shape fading in
    s.beginShape();
    const dNext = dValues[nextDIndex];
    const nNext = nValues[nextNIndex];
    for (let i = 0; i < 360; i++) {
      const k = i * dNext * Math.PI / 180;
      const r = rFactor * Math.sin(nNext * k);
      const x = r * Math.cos(k);
      const y = r * Math.sin(k);
      const hue = (i + s.frameCount * 0.5) % 360;
      s.stroke(hue, 80, 100, alphaIn);
      s.vertex(x, y);
    }
    s.endShape();

    // Advance transition
    t += 1;
    if (t > transitionFrames) {
      t = 0;
      currentDIndex = nextDIndex;
      currentNIndex = nextNIndex;

      // Pick new random next indices (avoid immediate repetition)
      do {
        nextDIndex = Math.floor(Math.random() * dValues.length);
      } while (nextDIndex === currentDIndex);

      do {
        nextNIndex = Math.floor(Math.random() * nValues.length);
      } while (nextNIndex === currentNIndex);
    }
  };

  s.windowResized = () => s.resizeCanvas(s.windowWidth, s.windowHeight);
});
