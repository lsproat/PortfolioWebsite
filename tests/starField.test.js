import assert from "node:assert/strict";
import test from "node:test";
import { STAR_SETTINGS as GLOBAL_SETTINGS, advanceStarField, createStarField, resizeStarField } from "../src/components/starField.js";

test("layers have unique pooled identities and independent motion", () => {
  const fields = GLOBAL_SETTINGS.layers.map((settings) => createStarField(() => 0.5, settings));
  const ids = fields.flatMap((field) => field.stars.map((star) => star.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 300);
  for (const field of fields) resizeStarField(field, 1440, 900);
  const [distant, nearby] = fields;
  advanceStarField(distant, 1 / 60, 1);
  assert.equal(nearby.speed, nearby.settings.restSpeed);
  advanceStarField(nearby, 1 / 60, 1);
  assert.ok(nearby.speed > distant.speed);
  assert.ok(nearby.settings.opacity > distant.settings.opacity);
});

for (const layerSettings of GLOBAL_SETTINGS.layers) {
  const STAR_SETTINGS = { ...GLOBAL_SETTINGS, ...layerSettings };
  const makeField = () => {
    let seed = 42;
    const field = createStarField(() => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    }, layerSettings);
    resizeStarField(field, 1440, 900);
    return field;
  };
  const active = (field) => field.stars.filter((star) => star.active);
  const coastToRest = (field) => {
    const frames = Math.ceil(Math.max(3, STAR_SETTINGS.speedSmoothing * 16) * 60);
    for (let frame = 0; frame < frames; frame++) advanceStarField(field, 1 / 60, 0);
  };
  const expectedCount = (width, height) => Math.min(STAR_SETTINGS.poolSize, Math.round(
    width * height * STAR_SETTINGS.countAtReferenceSize /
    (STAR_SETTINGS.referenceWidth * STAR_SETTINGS.referenceHeight),
  ));

  test(`${layerSettings.id}: initial stars fill the viewport, with configurable sizes and immediate motion`, () => {
    const field = makeField();
    assert.equal(active(field).length, expectedCount(1440, 900));
    for (const star of field.stars) {
      assert.ok(star.size >= STAR_SETTINGS.minSize && star.size <= STAR_SETTINGS.maxSize);
    }
    for (const [left, top] of [[false, false], [false, true], [true, false], [true, true]]) {
      assert.ok(active(field).some((star) => (star.x < 720) === left && (star.y < 450) === top));
    }
    const star = active(field).find((candidate) => candidate.y > 10);
    const y = star.y;
    advanceStarField(field, 1 / 60, 0);
    assert.ok(Math.abs(star.y - (y - STAR_SETTINGS.restSpeed / 60)) < 1e-9);
    const otherField = createStarField(() => 0.5, layerSettings);
    resizeStarField(otherField, 1440, 900);
    assert.notEqual(star.x, active(otherField)[0].x);
  });

  test(`${layerSettings.id}: resize preserves retained positions and reuses the fixed pool across viewport sizes`, () => {
    const field = makeField();
    const pool = [...field.stars];
    for (const [width, height] of [[390, 844], [844, 390], [1440, 900], [8000, 4000], [0, 0], [1440, 900]]) {
      const positions = new Map(active(field).map((star) => [star.id, [star.x, star.y]]));
      resizeStarField(field, width, height);
      assert.equal(active(field).length, expectedCount(width, height));
      assert.deepEqual(field.activeStars, active(field));
      assert.equal(field.stars.length, pool.length);
      for (const star of field.stars) assert.equal(star, pool.find((candidate) => candidate.id === star.id));
      for (const star of active(field)) {
        assert.ok(star.x >= 0 && star.x < width && star.y < height);
        const before = positions.get(star.id);
        if (before && before[0] < width && before[1] < height) {
          assert.deepEqual([star.x, star.y], before);
        }
      }
    }
  });

  test(`${layerSettings.id}: growth fills newly exposed space without moving existing stars`, () => {
    const field = makeField();
    const existing = new Set(active(field));
    resizeStarField(field, 1920, 1080);
    assert.equal(active(field).length, expectedCount(1920, 1080));
    for (const star of active(field)) {
      if (!existing.has(star)) assert.ok(star.x >= 1440 || star.y >= 900);
    }
  });

  test(`${layerSettings.id}: stars wrap only after leaving the top, preserving horizontal position and overshoot`, () => {
    const field = makeField();
    const star = active(field)[0];
    const x = star.x;
    const remaining = STAR_SETTINGS.restSpeed * 0.05 / 2;
    star.y = -star.size + remaining;
    advanceStarField(field, 0.05, 0);
    assert.ok(Math.abs(star.y - (field.height + remaining - STAR_SETTINGS.restSpeed * 0.05)) < 1e-9);
    assert.equal(star.x, x);
    const parked = field.stars.find((candidate) => !candidate.active);
    const parkedY = parked.y;
    advanceStarField(field, 0.05, 0);
    assert.equal(parked.y, parkedY);
  });

  test(`${layerSettings.id}: downward scrolling respects the speed cap and configured smoothing`, () => {
    const field = makeField();
    advanceStarField(field, 1 / 60, 0);
    assert.equal(field.speed, STAR_SETTINGS.restSpeed);
    advanceStarField(field, 1 / 60, 100);
    assert.ok(field.speed > STAR_SETTINGS.restSpeed && field.speed <= STAR_SETTINGS.maxScrollSpeed);
    assert.equal(field.speed, STAR_SETTINGS.maxScrollSpeed);
    for (let frame = 0; frame < 180; frame++) advanceStarField(field, 1 / 60, 100);
    assert.ok(field.speed <= STAR_SETTINGS.maxScrollSpeed);
    assert.ok(field.speed > STAR_SETTINGS.maxScrollSpeed - 0.01);
    const fast = field.speed;
    advanceStarField(field, 1 / 60, 0);
    assert.ok(field.speed < fast && field.speed >= STAR_SETTINGS.restSpeed);
    if (STAR_SETTINGS.speedSmoothing > 0) assert.ok(field.speed > STAR_SETTINGS.restSpeed);
    else assert.equal(field.speed, STAR_SETTINGS.restSpeed);
    coastToRest(field);
    assert.ok(Math.abs(field.speed - STAR_SETTINGS.restSpeed) < 0.01);
  });

  test(`${layerSettings.id}: upward scrolling reverses motion, caps downward speed, and returns to upward drift`, () => {
    const field = makeField();
    const star = active(field)[0];
    advanceStarField(field, 1 / 60, -100);
    assert.equal(field.speed, -STAR_SETTINGS.maxScrollSpeed);
    assert.ok(field.speed >= -STAR_SETTINGS.maxScrollSpeed);
    assert.ok(field.speed < -STAR_SETTINGS.maxScrollSpeed + 0.01);
    star.y = 100;
    advanceStarField(field, 1 / 60, -100);
    assert.ok(star.y > 100);
    const fast = field.speed;
    advanceStarField(field, 1 / 60, 0);
    assert.ok(field.speed > fast);
    if (STAR_SETTINGS.speedSmoothing > 0) assert.ok(field.speed < STAR_SETTINGS.restSpeed);
    coastToRest(field);
    assert.ok(Math.abs(field.speed - STAR_SETTINGS.restSpeed) < 0.01);
    star.y = 100;
    advanceStarField(field, 1 / 60, 0);
    assert.ok(star.y < 100);
  });

  test(`${layerSettings.id}: downward-moving stars wrap at the bottom with their identity and overshoot preserved`, () => {
    const field = makeField();
    const star = active(field)[0];
    const x = star.x;
    field.speed = -STAR_SETTINGS.maxScrollSpeed;
    star.y = field.height - 0.25;
    advanceStarField(field, 0.05, -100);
    const expectedY = -star.size + STAR_SETTINGS.maxScrollSpeed * 0.05 - 0.25;
    assert.ok(Math.abs(star.y - expectedY) < 1e-9);
    assert.equal(star.x, x);
    assert.equal(field.activeStars[0], star);
    assert.equal(field.stars.find((candidate) => candidate.id === star.id), star);
  });

  test(`${layerSettings.id}: weaker opposite input reverses immediately while weaker same-direction input coasts`, () => {
    for (const direction of [-1, 1]) {
      const field = makeField();
      advanceStarField(field, 1 / 60, direction * 100);
      const fast = field.speed;
      const weakDelta = direction * STAR_SETTINGS.maxScrollSpeed * 0.25 / STAR_SETTINGS.scrollInfluence / 60;
      const weakTarget = STAR_SETTINGS.restSpeed + direction * STAR_SETTINGS.maxScrollSpeed * 0.25;
      advanceStarField(field, 1 / 60, weakDelta);
      if (STAR_SETTINGS.speedSmoothing > 0) {
        assert.ok(Math.abs(field.speed - weakTarget) > 0);
        assert.ok(Math.abs(field.speed - weakTarget) < Math.abs(fast - weakTarget));
      } else assert.equal(field.speed, weakTarget);
      advanceStarField(field, 1 / 60, -weakDelta);
      const reverseTarget = STAR_SETTINGS.restSpeed - direction * STAR_SETTINGS.maxScrollSpeed * 0.25;
      assert.ok(Math.abs(field.speed - reverseTarget) < 1e-9);
    }
  });

  test(`${layerSettings.id}: slowdown speed is independent of refresh rate`, () => {
    const slow = makeField();
    const fast = makeField();
    advanceStarField(slow, 1 / 60, 100);
    advanceStarField(fast, 1 / 60, 100);
    for (let frame = 0; frame < 30; frame++) advanceStarField(slow, 1 / 30, 0);
    for (let frame = 0; frame < 144; frame++) advanceStarField(fast, 1 / 144, 0);
    assert.ok(Math.abs(slow.speed - fast.speed) < 1e-8);
  });

  test(`${layerSettings.id}: placement respects spacing on load and after growth`, () => {
    const field = makeField();
    for (const [width, height] of [[1440, 900], [1920, 1080]]) {
      resizeStarField(field, width, height);
      const stars = active(field);
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x + stars[i].size / 2 - stars[j].x - stars[j].size / 2;
          const dy = stars[i].y + stars[i].size / 2 - stars[j].y - stars[j].size / 2;
          assert.ok(Math.hypot(dx, dy) >= layerSettings.minDistance);
        }
      }
    }
  });

  test(`${layerSettings.id}: impossible spacing parks stars with bounded placement work`, () => {
    let calls = 0;
    const settings = { ...layerSettings, minDistance: 10000 };
    const field = createStarField(() => { calls++; return 0.5; }, settings);
    resizeStarField(field, 1440, 900);
    assert.equal(active(field).length, 1);
    assert.equal(field.stars.length, settings.poolSize);
    assert.ok(calls <= settings.poolSize * (1 + GLOBAL_SETTINGS.placementAttempts * 3));
  });

  test(`${layerSettings.id}: resting movement is independent of refresh rate`, () => {
    const slow = makeField();
    const fast = makeField();
    for (let frame = 0; frame < 30; frame++) advanceStarField(slow, 1 / 30, 0);
    for (let frame = 0; frame < 144; frame++) advanceStarField(fast, 1 / 144, 0);
    for (const star of active(slow)) {
      assert.ok(Math.abs(star.y - fast.stars.find((candidate) => candidate.id === star.id).y) < 1e-8);
    }
  });
}
