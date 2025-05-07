// src/utils/colorExtractor.js
import ColorThief from "colorthief";

/**
 * تبدیل مقادیر RGB به فرمت هگز
 * @param {number} r - مقدار قرمز (0-255)
 * @param {number} g - مقدار سبز (0-255)
 * @param {number} b - مقدار آبی (0-255)
 * @returns {string} کد رنگ هگز
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * استخراج رنگ غالب از تصویر با روش‌های پیشرفته‌تر
 * @param {string} imageUrl - آدرس تصویر
 * @returns {Promise<string>} کد رنگ هگز استخراج شده
 */
export function extractDominantColor(imageUrl) {
  return new Promise((resolve, reject) => {
    try {
      console.log("شروع استخراج رنگ از:", imageUrl);

      // ایجاد تصویر جدید
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = function () {
        try {
          console.log(
            "تصویر با موفقیت لود شد. ابعاد:",
            img.width,
            "x",
            img.height
          );

          // ایجاد کنوس موقت برای پردازش تصویر
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // تنظیم اندازه کنوس
          canvas.width = img.width;
          canvas.height = img.height;

          // کشیدن تصویر روی کنوس
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // گرفتن داده‌های تصویر
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          console.log(
            "داده‌های تصویر دریافت شد. تعداد پیکسل‌ها:",
            data.length / 4
          );

          // بافرهای رنگ (برای جمع‌آوری رنگ‌ها)
          const rgbColors = [];

          // آستانه برای رنگ‌های سفید و سیاه - افزایش آستانه برای بهبود تشخیص
          const whiteThreshold = 220; // افزایش یافته از 30 به 220
          const blackThreshold = 50; // افزایش یافته از 30 به 50

          // نمونه‌برداری از رنگ‌های موجود در تصویر
          const step = Math.max(1, Math.floor(data.length / 4 / 1000));
          console.log("گام نمونه‌برداری:", step);

          for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // نادیده گرفتن پیکسل‌های شفاف
            if (a < 128) continue;

            // نادیده گرفتن رنگ‌های خیلی روشن (تقریباً سفید)
            if (
              r > whiteThreshold &&
              g > whiteThreshold &&
              b > whiteThreshold
            ) {
              continue;
            }

            // نادیده گرفتن رنگ‌های خیلی تیره (تقریباً سیاه)
            if (
              r < blackThreshold &&
              g < blackThreshold &&
              b < blackThreshold
            ) {
              continue;
            }

            // محاسبه اشباع رنگ
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;

            // نادیده گرفتن رنگ‌های کم اشباع (خاکستری‌ها)
            if (saturation < 0.15) continue;

            // اضافه کردن رنگ به بافر با وزن بیشتر برای رنگ‌های اشباع‌تر
            const weight = Math.floor(saturation * 10) + 1;
            for (let w = 0; w < weight; w++) {
              rgbColors.push([r, g, b]);
            }
          }

          console.log("تعداد رنگ‌های استخراج شده:", rgbColors.length);

          // اگر هیچ رنگی پیدا نشد
          if (rgbColors.length === 0) {
            console.log(
              "هیچ رنگی از الگوریتم اصلی پیدا نشد، استفاده از ColorThief"
            );
            // استفاده از ColorThief به عنوان پشتیبان
            try {
              const colorThief = new ColorThief();
              const dominantColor = colorThief.getColor(img);
              console.log("ColorThief رنگ غالب را پیدا کرد:", dominantColor);
              const hexColor = rgbToHex(
                dominantColor[0],
                dominantColor[1],
                dominantColor[2]
              );
              console.log("رنگ نهایی از ColorThief:", hexColor);
              resolve(hexColor);
              return;
            } catch (e) {
              console.error("ColorThief هم با خطا مواجه شد:", e);
              // اگر ColorThief هم نتوانست رنگی پیدا کند، یک رنگ پیش‌فرض برگردان
              resolve("#808080"); // رنگ خاکستری
              return;
            }
          }

          // جهت تست و بررسی - تمام رنگ‌های استخراج شده را لاگ کنیم
          if (rgbColors.length < 20) {
            console.log(
              "نمونه رنگ‌های استخراج شده:",
              rgbColors.map((color) => rgbToHex(color[0], color[1], color[2]))
            );
          }

          // دسته‌بندی رنگ‌ها به خوشه‌ها (ساده‌سازی k-means)
          const colorBuckets = {};

          rgbColors.forEach((color) => {
            // تبدیل به مقادیر با دقت کمتر (گرد کردن به نزدیک‌ترین 10)
            const bucketR = Math.round(color[0] / 10) * 10;
            const bucketG = Math.round(color[1] / 10) * 10;
            const bucketB = Math.round(color[2] / 10) * 10;

            const bucket = `${bucketR},${bucketG},${bucketB}`;

            if (!colorBuckets[bucket]) {
              colorBuckets[bucket] = { count: 0, r: 0, g: 0, b: 0 };
            }

            colorBuckets[bucket].count++;
            colorBuckets[bucket].r += color[0];
            colorBuckets[bucket].g += color[1];
            colorBuckets[bucket].b += color[2];
          });

          // پیدا کردن خوشه با بیشترین تعداد (رنگ غالب)
          let maxCount = 0;
          let dominantColor = null;

          for (const bucket in colorBuckets) {
            const bucketData = colorBuckets[bucket];

            if (bucketData.count > maxCount) {
              maxCount = bucketData.count;
              dominantColor = {
                r: Math.round(bucketData.r / bucketData.count),
                g: Math.round(bucketData.g / bucketData.count),
                b: Math.round(bucketData.b / bucketData.count),
              };
            }
          }

          // چک کنیم آیا رنگ غالب پیدا شد
          if (dominantColor) {
            const hexColor = rgbToHex(
              dominantColor.r,
              dominantColor.g,
              dominantColor.b
            );
            console.log("رنگ غالب یافت شده:", hexColor, "RGB:", dominantColor);
            resolve(hexColor);
          } else {
            // روش میانگین را اجرا کنیم
            console.log("رنگ غالب پیدا نشد، استفاده از میانگین");

            // محاسبه رنگ میانگین
            let totalR = 0,
              totalG = 0,
              totalB = 0;

            rgbColors.forEach((color) => {
              totalR += color[0];
              totalG += color[1];
              totalB += color[2];
            });

            const avgR = Math.round(totalR / rgbColors.length);
            const avgG = Math.round(totalG / rgbColors.length);
            const avgB = Math.round(totalB / rgbColors.length);

            // تبدیل به هگز و برگرداندن
            const hexColor = rgbToHex(avgR, avgG, avgB);
            console.log("رنگ میانگین محاسبه شده:", hexColor, "RGB:", [
              avgR,
              avgG,
              avgB,
            ]);
            resolve(hexColor);
          }
        } catch (err) {
          console.error("خطا در پردازش تصویر:", err);
          // در صورت خطا، یک رنگ پیش‌فرض برگردانید
          resolve("#808080"); // رنگ خاکستری
        }
      };

      img.onerror = function (err) {
        console.error("خطا در بارگذاری تصویر:", err);
        // در صورت خطا، یک رنگ پیش‌فرض برگردانید
        resolve("#808080"); // رنگ خاکستری
      };

      // شروع بارگذاری تصویر
      img.src = imageUrl;
    } catch (error) {
      console.error("خطای غیرمنتظره:", error);
      // در صورت خطا، یک رنگ پیش‌فرض برگردانید
      resolve("#808080"); // رنگ خاکستری
    }
  });
}

/**
 * پردازش آرایه رنگ‌ها و استخراج رنگ‌ها از URL‌های تصاویر
 * @param {Array} colorsArray - آرایه‌ای از آبجکت‌های رنگ
 * @returns {Promise<Array>} آرایه پردازش شده رنگ‌ها
 */
export async function processColorsArray(colorsArray) {
  if (!Array.isArray(colorsArray)) {
    return [];
  }

  console.log("شروع پردازش آرایه رنگ‌ها:", colorsArray);
  const processedColors = [];

  // پردازش هر آیتم در آرایه
  for (let i = 0; i < colorsArray.length; i++) {
    const colorItem = { ...colorsArray[i] };
    console.log(`پردازش آیتم ${i + 1}/${colorsArray.length}:`, colorItem);

    // اگر url وجود دارد اما color وجود ندارد
    if (colorItem.url && (!colorItem.color || colorItem.color === "")) {
      console.log(
        `آیتم ${colorItem.code} دارای url بدون رنگ است، استخراج رنگ...`
      );
      try {
        // استخراج رنگ از تصویر
        colorItem.color = await extractDominantColor(colorItem.url);
        console.log(
          `رنگ استخراج شده برای ${colorItem.code}: ${colorItem.color}`
        );
      } catch (error) {
        console.error(`خطا در استخراج رنگ برای ${colorItem.code}:`, error);
        colorItem.color = "#808080"; // رنگ پیش‌فرض خاکستری
      }
    } else {
      console.log(`آیتم ${colorItem.code} نیازی به استخراج رنگ ندارد.`);
    }

    processedColors.push(colorItem);
  }

  console.log("تمام آیتم‌ها پردازش شدند:", processedColors);
  return processedColors;
}
