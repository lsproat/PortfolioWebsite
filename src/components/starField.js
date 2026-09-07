// All distances use CSS pixels; speeds use pixels per second.
export const STAR_SETTINGS = {
  referenceWidth: 1440,
  referenceHeight: 900,
  placementAttempts: 40, // Bounded work when the requested spacing cannot fit.
  layers: [
    {
      id: "distant",
      countAtReferenceSize: 35,
      poolSize: 100,
      minSize: 8,
      maxSize: 9,
      opacity: 0.2,
      minDistance: 45, // Center-to-center spacing during activation, within this layer.
      restSpeed: 2,
      maxScrollSpeed: 80,
      scrollInfluence: 2,
      speedSmoothing: 0.2,
    },
    {
      id: "nearby",
      countAtReferenceSize: 15,
      poolSize: 50,
      minSize: 14,
      maxSize: 15,
      opacity: 0.3,
      minDistance: 90,
      restSpeed: 5,
      maxScrollSpeed: 200,
      scrollInfluence: 2,
      speedSmoothing: 0.2, // Slowdown only; acceleration and reversals are immediate.
    },
  ],
};

export const createStarField = (
  random = Math.random,
  settings = STAR_SETTINGS.layers[1],
) => ({
  settings,
  width: 0,
  height: 0,
  speed: settings.restSpeed,
  random,
  activeStars: [],
  stars: Array.from({ length: settings.poolSize }, (_, id) => ({
    id: `${settings.id}:${id}`,
    size: settings.minSize + random() * (settings.maxSize - settings.minSize),
    x: 0,
    y: 0,
    placed: false,
    active: false,
  })),
});

export const resizeStarField = (field, width, height) => {
  if (field.width === width && field.height === height) return;
  const { settings } = field;

  const oldWidth = field.width;
  const oldHeight = field.height;
  field.width = width;
  field.height = height;
  const target = Math.min(
    field.stars.length,
    Math.round(
      (width * height * settings.countAtReferenceSize) /
        (STAR_SETTINGS.referenceWidth * STAR_SETTINGS.referenceHeight),
    ),
  );

  const fits = (star) => star.x < width && star.y < height;
  let activeCount = 0;
  for (const star of field.stars) {
    // Keep coordinates even when parked, so growing can restore these stars.
    star.active = star.active && fits(star) && activeCount < target;
    if (star.active) activeCount++;
  }

  const placed = field.stars.filter((star) => star.active);
  const minimumDistanceSquared = settings.minDistance ** 2;
  const hasSpace = (star) =>
    placed.every((other) => {
      const dx = star.x + star.size / 2 - other.x - other.size / 2;
      const dy = star.y + star.size / 2 - other.y - other.size / 2;
      return dx * dx + dy * dy >= minimumDistanceSquared;
    });

  const rightArea = Math.max(0, width - oldWidth) * Math.min(oldHeight, height);
  const bottomArea = Math.max(0, height - oldHeight) * width;
  const addedArea = rightArea + bottomArea;
  const newlyExposed = (star) => star.x >= oldWidth || star.y >= oldHeight;

  // Prefer parked stars already in the newly revealed part of the viewport.
  for (const star of field.stars) {
    if (activeCount >= target) break;
    if (
      !star.active &&
      star.placed &&
      fits(star) &&
      (!addedArea || newlyExposed(star)) &&
      hasSpace(star)
    ) {
      star.active = true;
      placed.push(star);
      activeCount++;
    }
  }

  for (const star of field.stars) {
    if (activeCount >= target) break;
    if (star.active) continue;

    // Try bounded random placements. Leave the star parked if spacing cannot
    // fit; density is a target, while retained stars never move during resize.
    const previousX = star.x;
    const previousY = star.y;
    for (
      let attempt = 0;
      attempt < STAR_SETTINGS.placementAttempts;
      attempt++
    ) {
      // On growth, distribute candidates across exposed strips by area.
      if (addedArea && field.random() * addedArea < rightArea) {
        star.x = oldWidth + field.random() * (width - oldWidth);
        star.y = field.random() * Math.min(oldHeight, height);
      } else if (addedArea) {
        star.x = field.random() * width;
        star.y = oldHeight + field.random() * (height - oldHeight);
      } else {
        star.x = field.random() * width;
        star.y = field.random() * height;
      }
      if (!hasSpace(star)) continue;
      star.placed = true;
      star.active = true;
      placed.push(star);
      activeCount++;
      break;
    }
    if (!star.active) {
      star.x = previousX;
      star.y = previousY;
    }
  }
  // Rebuild only on resize; animation reuses these references every frame.
  field.activeStars = field.stars.filter((star) => star.active);
};

export const advanceStarField = (field, seconds, scrollDelta) => {
  if (seconds <= 0 || field.height <= 0) return;
  const { settings } = field;
  // Positive speed moves upward; negative speed moves downward.
  const targetSpeed = Math.max(
    -settings.maxScrollSpeed,
    Math.min(
      settings.maxScrollSpeed,
      settings.restSpeed + (scrollDelta / seconds) * settings.scrollInfluence,
    ),
  );
  // Compare scroll momentum relative to the resting upward drift. Returning
  // to rest must coast even when it eventually changes the movement direction.
  const currentBoost = field.speed - settings.restSpeed;
  const targetBoost = targetSpeed - settings.restSpeed;
  const reversingInput =
    targetBoost !== 0 && Math.sign(targetBoost) !== Math.sign(currentBoost);
  if (
    settings.speedSmoothing <= 0 ||
    reversingInput ||
    Math.abs(targetBoost) >= Math.abs(currentBoost)
  ) {
    field.speed = targetSpeed;
  } else {
    field.speed +=
      (targetSpeed - field.speed) *
      (1 - Math.exp(-seconds / settings.speedSmoothing));
  }

  for (const star of field.activeStars) {
    star.y -= field.speed * seconds;
    // Wait until the entire star exits, then preserve overshoot when wrapping.
    if (star.y < -star.size || star.y >= field.height) {
      const travel = field.height + star.size;
      star.y =
        ((((star.y + star.size) % travel) + travel) % travel) - star.size;
    }
  }
};
