// src/makeup/lips.js

import { convertHexToRgba } from "../utils";

let lipstickColor = "#FF0000";
let transparency = 0.85;
let pattern = "normal";

const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84,
  181, 91, 146, 61,
];

const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87,
  178, 88, 95, 78,
];

const UPPER_LIP_POINTS = [61, 185, 40, 39, 37, 0, 267, 269, 270];

const LOWER_LIP_POINTS = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146];

// اول ثابت‌های جدید رو اضافه می‌کنیم
const UPPER_LIP_SHIMMER = [
  74, 42, 73, 41, 72, 38, 11, 12, 302, 268, 303, 271, 304, 272,
];
const LOWER_LIP_SHIMMER = [
  319, 320, 403, 404, 316, 315, 15, 16, 86, 85, 179, 180, 89, 90,
];

// اضافه کردن نقاط هایلایت جدید در بالای فایل
const UPPER_LIP_HIGHLIGHTS = [73, 11, 303];
const LOWER_LIP_HIGHLIGHTS = [180, 16, 404];

const ENHANCEMENT_SETTINGS = {
  shadowOpacity: 0.15, // کاهش بیشتر
  highlightOpacity: 0.05, // کاهش شدید
  innerGlowOpacity: 0.05, // کاهش شدید
  contourStrength: 0.15, // کاهش
  matteIntensity: 0.4, // کاهش زیاد از 0.7
  matteShadowIntensity: 0.25, // افزایش کمی
};

function changeLipstickColor(color) {
  lipstickColor = color;
}

function setLipstickPattern(newPattern) {
  pattern = newPattern;
}

function setLipstickTransparency(newTransparency) {
  transparency = newTransparency;
}
function applyLipstick(landmarks, canvasCtx) {
  try {
    if (!landmarks || !canvasCtx || !lipstickColor) {
      return;
    }

    const requiredPoints = [
      ...LIPS_OUTER,
      ...LIPS_INNER,
      ...UPPER_LIP_POINTS,
      ...LOWER_LIP_POINTS,
      ...UPPER_LIP_HIGHLIGHTS,
      ...LOWER_LIP_HIGHLIGHTS,
    ];

    if (!validateLandmarks(landmarks, requiredPoints)) return;

    canvasCtx.save();

    if (pattern === "normal") {
      try {
        canvasCtx.fillStyle = `${convertHexToRgba(
          lipstickColor,
          transparency
        )}`;
        canvasCtx.globalAlpha = transparency;
        fillLipRegion(landmarks, canvasCtx, { opacity: transparency });

        canvasCtx.fillStyle = `${convertHexToRgba(
          lipstickColor,
          transparency * 0.7
        )}`;
        canvasCtx.globalCompositeOperation = "multiply";
        canvasCtx.globalAlpha = transparency * 0.4;
        fillLipRegion(landmarks, canvasCtx, { opacity: transparency * 0.7 });

        applyLipHighlight(landmarks, canvasCtx);
      } catch (error) {
        console.debug("خطا در افکت معمولی:", error);
      }
    } else if (pattern === "matte") {
      try {
        // لایه پایه مات
        canvasCtx.globalCompositeOperation = "source-over";
        canvasCtx.fillStyle = `${convertHexToRgba(lipstickColor, 0.4)}`;
        canvasCtx.globalAlpha = 0.6;
        fillLipRegion(landmarks, canvasCtx);

        // لایه مات‌کننده اول
        canvasCtx.globalCompositeOperation = "multiply";
        canvasCtx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        canvasCtx.globalAlpha = 0.3;
        fillLipRegion(landmarks, canvasCtx);

        try {
          // لایه پودری
          applyPowderEffect(landmarks, canvasCtx, {
            dense: true,
            opacity: 0.5,
            size: 0.2,
            count: 200,
          });
        } catch (powderError) {
          console.debug("خطا در افکت پودری:", powderError);
        }

        // لایه تیره‌کننده
        canvasCtx.globalCompositeOperation = "color-burn";
        canvasCtx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        canvasCtx.globalAlpha = 0.2;
        fillLipRegion(landmarks, canvasCtx);

        // لایه نهایی برای کدر کردن
        canvasCtx.globalCompositeOperation = "soft-light";
        canvasCtx.fillStyle = `rgba(128, 128, 128, 0.2)`;
        canvasCtx.globalAlpha = 0.3;
        fillLipRegion(landmarks, canvasCtx);
      } catch (error) {
        console.debug("خطا در افکت مات:", error);
      }
    } else if (pattern === "glossy") {
      try {
        canvasCtx.fillStyle = `${convertHexToRgba(lipstickColor, 0.35)}`;
        fillLipRegion(landmarks, canvasCtx, { opacity: 0.35 });

        canvasCtx.globalCompositeOperation = "soft-light";
        canvasCtx.globalAlpha = 0.6;
        applyLiquidEffect(landmarks, canvasCtx);

        canvasCtx.globalCompositeOperation = "overlay";
        canvasCtx.globalAlpha = 0.7;
        applyEnhancedGlossEffect(landmarks, canvasCtx);

        canvasCtx.globalCompositeOperation = "lighter";
        canvasCtx.globalAlpha = 0.4;
        applyPreciseSpecularHighlights(landmarks, canvasCtx);
      } catch (error) {
        console.debug("خطا در افکت براق:", error);
      }
    } else if (pattern === "glitter") {
      try {
        canvasCtx.fillStyle = `${convertHexToRgba(
          lipstickColor,
          transparency
        )}`;
        canvasCtx.globalAlpha = transparency;
        fillLipRegion(landmarks, canvasCtx, { opacity: transparency });

        canvasCtx.fillStyle = `${convertHexToRgba(
          lipstickColor,
          transparency * 0.7
        )}`;
        canvasCtx.globalCompositeOperation = "multiply";
        canvasCtx.globalAlpha = transparency * 0.4;
        fillLipRegion(landmarks, canvasCtx, { opacity: transparency * 0.7 });

        canvasCtx.globalCompositeOperation = "screen";
        applyGlitterEffect(landmarks, canvasCtx);

        applyLipHighlight(landmarks, canvasCtx);
      } catch (error) {
        console.debug("خطا در افکت اکلیلی:", error);
      }
    }

    canvasCtx.restore();
  } catch (error) {
    console.error(`خطا در اعمال رژ لب: ${error.message}`);
  }
}
// و تابع applyPowderEffect رو هم آپدیت می‌کنیم
function applyPowderEffect(landmarks, canvasCtx, options = {}) {
  const { dense = false, opacity = 0.3, size = 0.5, count = 100 } = options;

  const bounds = getRegionBounds(landmarks, canvasCtx);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  canvasCtx.globalCompositeOperation = "soft-light";
  canvasCtx.globalAlpha = opacity;

  // افزایش تراکم نقاط برای حالت مات
  const dotCount = Math.floor((width * height) / count);
  const dotSize = size;

  for (let i = 0; i < dotCount; i++) {
    const x = bounds.minX + Math.random() * width;
    const y = bounds.minY + Math.random() * height;

    canvasCtx.beginPath();
    canvasCtx.arc(x, y, dotSize, 0, Math.PI * 2);
    canvasCtx.fillStyle = `rgba(128, 128, 128, ${dense ? 0.2 : 0.1})`;
    canvasCtx.fill();
  }
}

function fillLipRegion(landmarks, canvasCtx, options = {}) {
  canvasCtx.save();
  canvasCtx.beginPath();
  drawLipPath(landmarks, canvasCtx);
  canvasCtx.fillStyle = `${convertHexToRgba(
    lipstickColor,
    options.opacity || transparency
  )}`;
  canvasCtx.fill("evenodd");
  canvasCtx.restore();
}

function applyLiquidEffect(landmarks, canvasCtx) {
  const upperLipCenter = getLipCenter(landmarks, true, canvasCtx);
  const lowerLipCenter = getLipCenter(landmarks, false, canvasCtx);

  // گرادیان مایع برای لب بالا
  const upperGradient = canvasCtx.createLinearGradient(
    upperLipCenter.x,
    upperLipCenter.y - 10,
    upperLipCenter.x,
    upperLipCenter.y + 5
  );

  upperGradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
  upperGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.4)`);
  upperGradient.addColorStop(1, `rgba(255, 255, 255, 0.1)`);

  // گرادیان مایع برای لب پایین
  const lowerGradient = canvasCtx.createLinearGradient(
    lowerLipCenter.x,
    lowerLipCenter.y - 5,
    lowerLipCenter.x,
    lowerLipCenter.y + 10
  );

  lowerGradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
  lowerGradient.addColorStop(0.5, `rgba(255, 255, 255, 0.4)`);
  lowerGradient.addColorStop(1, `rgba(255, 255, 255, 0.2)`);

  // اعمال گرادیان‌ها
  drawPartialLipPath(landmarks, canvasCtx, UPPER_LIP_POINTS, upperGradient);
  drawPartialLipPath(landmarks, canvasCtx, LOWER_LIP_POINTS, lowerGradient);
}

function drawPartialLipPath(landmarks, canvasCtx, points, gradient) {
  if (!validateLandmarks(landmarks, points) || !gradient) return;

  try {
    canvasCtx.beginPath();
    moveTo(canvasCtx, landmarks[points[0]]);
    points.forEach((index) => {
      lineTo(canvasCtx, landmarks[index]);
    });
    canvasCtx.fillStyle = gradient;
    canvasCtx.fill();
  } catch (error) {
    console.debug("خطا در ترسیم بخشی از مسیر لب:", error);
  }
}

function applyEnhancedGlossEffect(landmarks, canvasCtx) {
  const upperLipCenter = getLipCenter(landmarks, true, canvasCtx);
  const lowerLipCenter = getLipCenter(landmarks, false, canvasCtx);

  // براقیت لب بالا
  const upperGlossGradient = createGlossGradient(
    canvasCtx,
    upperLipCenter,
    true
  );
  drawPartialLipPath(
    landmarks,
    canvasCtx,
    UPPER_LIP_POINTS,
    upperGlossGradient
  );

  // براقیت لب پایین
  const lowerGlossGradient = createGlossGradient(
    canvasCtx,
    lowerLipCenter,
    false
  );
  drawPartialLipPath(
    landmarks,
    canvasCtx,
    LOWER_LIP_POINTS,
    lowerGlossGradient
  );
}

function createGlossGradient(canvasCtx, center, isUpper) {
  const gradient = canvasCtx.createRadialGradient(
    center.x,
    center.y,
    0,
    center.x,
    center.y,
    30
  );

  if (isUpper) {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  }

  return gradient;
}

function applyPreciseSpecularHighlights(landmarks, canvasCtx) {
  if (!landmarks || !canvasCtx) return;
  try {
    const upperPoints = [...UPPER_LIP_HIGHLIGHTS];
    const lowerPoints = [...LOWER_LIP_HIGHLIGHTS];

    if (validateLandmarks(landmarks, upperPoints)) {
      const upperHighlights = calculateHighlightPositions(
        landmarks,
        canvasCtx,
        true
      );
      if (upperHighlights.length) {
        addHighlightsToSection(canvasCtx, upperHighlights);
      }
    }

    if (validateLandmarks(landmarks, lowerPoints)) {
      const lowerHighlights = calculateHighlightPositions(
        landmarks,
        canvasCtx,
        false
      );
      if (lowerHighlights.length) {
        addHighlightsToSection(canvasCtx, lowerHighlights);
      }
    }
  } catch (error) {
    console.debug("خطا در اعمال هایلایت‌های دقیق:", error);
  }
}

function addHighlightsToSection(canvasCtx, points, isUpper) {
  const highlightPositions = calculateHighlightPositions(points, isUpper);

  highlightPositions.forEach((pos) => {
    const gradient = canvasCtx.createRadialGradient(
      pos.x,
      pos.y,
      0,
      pos.x,
      pos.y,
      pos.radius
    );

    gradient.addColorStop(0, `rgba(255, 255, 255, ${pos.intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${pos.intensity * 0.5})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    canvasCtx.fillStyle = gradient;
    canvasCtx.beginPath();
    canvasCtx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
    canvasCtx.fill();
  });
}

function calculateHighlightPositions(landmarks, canvasCtx, isUpper) {
  try {
    if (!landmarks || !canvasCtx) return [];

    const points = isUpper ? UPPER_LIP_HIGHLIGHTS : LOWER_LIP_HIGHLIGHTS;
    if (!validateLandmarks(landmarks, points)) return [];

    return points.map((point, index) => ({
      x: landmarks[point].x * canvasCtx.canvas.width,
      y: landmarks[point].y * canvasCtx.canvas.height,
      radius: index === 0 ? 2.5 : 2,
      intensity: index === 0 ? 0.6 : 0.5,
    }));
  } catch (error) {
    return [];
  }
}

function getRegionBounds(landmarks, canvasCtx) {
  const points = LIPS_OUTER.map((i) => ({
    x: landmarks[i].x * canvasCtx.canvas.width,
    y: landmarks[i].y * canvasCtx.canvas.height,
  }));

  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

function drawLipPath(landmarks, canvasCtx) {
  // مسیر خارجی
  moveTo(canvasCtx, landmarks[LIPS_OUTER[0]]);
  for (const index of LIPS_OUTER) {
    lineTo(canvasCtx, landmarks[index]);
  }
  canvasCtx.closePath();

  // مسیر داخلی
  moveTo(canvasCtx, landmarks[LIPS_INNER[0]]);
  for (const index of LIPS_INNER) {
    lineTo(canvasCtx, landmarks[index]);
  }
  canvasCtx.closePath();
}

function moveTo(ctx, landmark) {
  if (!landmark) return;
  ctx.moveTo(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height);
}

function lineTo(ctx, landmark) {
  if (!landmark) return;
  ctx.lineTo(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height);
}

function getLipCenter(landmarks, isUpper, canvasCtx) {
  try {
    if (!landmarks || !canvasCtx) return null;

    const points = isUpper ? LIPS_OUTER.slice(0, 10) : LIPS_OUTER.slice(10);
    if (!validateLandmarks(landmarks, points)) return null;

    const centerPoint = points.reduce(
      (acc, index) => {
        acc.x += landmarks[index].x * canvasCtx.canvas.width;
        acc.y += landmarks[index].y * canvasCtx.canvas.height;
        return acc;
      },
      { x: 0, y: 0 }
    );

    return {
      x: centerPoint.x / points.length,
      y: centerPoint.y / points.length,
    };
  } catch (error) {
    return null;
  }
}

// همچنین هر کدوم از توابع کمکی رو هم چک میکنیم
function applyLipHighlight(landmarks, canvasCtx) {
  if (!landmarks || !canvasCtx) return;

  try {
    canvasCtx.globalCompositeOperation = "soft-light";
    canvasCtx.globalAlpha = ENHANCEMENT_SETTINGS.highlightOpacity;

    const upperLipCenter = getLipCenter(landmarks, true, canvasCtx);
    if (!upperLipCenter) return;

    const gradient = canvasCtx.createRadialGradient(
      upperLipCenter.x,
      upperLipCenter.y - 5,
      0,
      upperLipCenter.x,
      upperLipCenter.y,
      20
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    canvasCtx.fillStyle = gradient;
    fillLipRegion(landmarks, canvasCtx);
  } catch (error) {
    console.debug("خطا در هایلایت لب:", error);
  }
}

function applyGlitterEffect(landmarks, canvasCtx) {
  if (!landmarks || !canvasCtx) return;

  canvasCtx.globalAlpha = 0.85;
  canvasCtx.globalCompositeOperation = "screen";

  const goldColors = {
    core: "#FFD700",
    mid: "#DAA520",
    outer: "#FFE5B4",
  };

  const now = Date.now();
  const glitterPoints = [...UPPER_LIP_SHIMMER, ...LOWER_LIP_SHIMMER];

  glitterPoints.forEach((point, index) => {
    if (landmarks[point]) {
      const x = landmarks[point].x * canvasCtx.canvas.width;
      const y = landmarks[point].y * canvasCtx.canvas.height;

      const timeOffset = index * 237;
      const sizeVariation = 0.6 + (index % 3) * 0.4;
      const blinkSpeed = 0.7 + (index % 5) * 0.3;

      const intensity =
        Math.sin((now + timeOffset) * blinkSpeed * 0.001) * 0.5 + 0.5;

      if (intensity > 0.3) {
        drawGlitterPoint(x, y, goldColors, intensity, sizeVariation, canvasCtx);
      }
    }
  });
}

function drawGlitterPoint(x, y, colors, intensity, size, canvasCtx) {
  const baseSize = 0.8 * size;

  // هسته طلایی
  const coreGradient = canvasCtx.createRadialGradient(x, y, 0, x, y, baseSize);
  coreGradient.addColorStop(0, `rgba(255, 215, 0, ${intensity})`);
  coreGradient.addColorStop(0.5, `rgba(218, 165, 32, ${intensity * 0.7})`);
  coreGradient.addColorStop(1, "rgba(255, 215, 0, 0)");

  canvasCtx.fillStyle = coreGradient;
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, baseSize, 0, Math.PI * 2);
  canvasCtx.fill();

  // درخشش مرکزی
  const glowSize = baseSize * 0.6;
  const glowGradient = canvasCtx.createRadialGradient(x, y, 0, x, y, glowSize);
  glowGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.9})`);
  glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  canvasCtx.fillStyle = glowGradient;
  canvasCtx.beginPath();
  canvasCtx.arc(x, y, glowSize, 0, Math.PI * 2);
  canvasCtx.fill();

  // پرتوهای کوتاه
  const rayCount = 4;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount;
    const rayLength = baseSize * 1.2;

    const rayGradient = canvasCtx.createLinearGradient(
      x,
      y,
      x + Math.cos(angle) * rayLength,
      y + Math.sin(angle) * rayLength
    );
    rayGradient.addColorStop(0, `rgba(255, 215, 0, ${intensity * 0.8})`);
    rayGradient.addColorStop(1, "rgba(255, 215, 0, 0)");

    canvasCtx.strokeStyle = rayGradient;
    canvasCtx.lineWidth = baseSize * 0.2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
    canvasCtx.lineTo(
      x + Math.cos(angle) * rayLength,
      y + Math.sin(angle) * rayLength
    );
    canvasCtx.stroke();
  }
}

function validateLandmarks(landmarks, points) {
  if (!landmarks || !points || !Array.isArray(points)) return false;

  return points.every(
    (point) =>
      landmarks[point] &&
      typeof landmarks[point].x === "number" &&
      typeof landmarks[point].y === "number" &&
      !isNaN(landmarks[point].x) &&
      !isNaN(landmarks[point].y)
  );
}

export {
  changeLipstickColor,
  setLipstickPattern,
  setLipstickTransparency,
  applyLipstick,
};
