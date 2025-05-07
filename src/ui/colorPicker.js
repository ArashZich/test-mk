// src/ui/colorPicker.js

export function initColorPicker(
  changeMakeupColor,
  colorData,
  containerId,
  featureManager
) {
  const colorPicker = document.getElementById(containerId);
  if (!colorPicker) return;

  colorPicker.innerHTML = "";

  if (colorData && colorData.length > 0) {
    const enabledFeatures = featureManager.getEnabledFeatures();
    const filteredColors = colorData.filter((item) =>
      item.feature ? enabledFeatures.includes(item.feature) : true
    );

    if (filteredColors.length > 0) {
      colorPicker.classList.add(
        filteredColors.length <= 5 ? "few-colors" : "many-colors"
      );

      const colorWrapper = document.createElement("div");
      colorWrapper.style.display = "inline-flex";
      colorWrapper.style.justifyContent = "center";
      colorWrapper.style.margin = "0 auto";
      colorPicker.appendChild(colorWrapper);

      filteredColors.forEach((item) => {
        const colorButton = createColorButton(
          item.color,
          item.code,
          item.url,
          changeMakeupColor
        );
        colorWrapper.appendChild(colorButton);
      });

      // اضافه کردن observer برای تضمین center alignment
      const resizeObserver = new ResizeObserver(() => {
        const wrapperWidth = colorWrapper.offsetWidth;
        const containerWidth = colorPicker.offsetWidth;
        if (wrapperWidth < containerWidth) {
          colorWrapper.style.width = "100%";
        } else {
          colorWrapper.style.width = "auto";
        }
      });

      resizeObserver.observe(colorPicker);
    } else {
      const message = document.createElement("p");
      message.textContent = "هیچ رنگی برای ویژگی‌های فعال موجود نیست";
      colorPicker.appendChild(message);
    }
  } else {
    const message = document.createElement("p");
    message.textContent =
      "هیچ رنگی انتخاب نشده است. لطفاً رنگ‌ها را به URL اضافه کنید";
    colorPicker.appendChild(message);
  }
}

// Remove active class from all buttons
function removeActiveClass() {
  const buttons = document.querySelectorAll(".armo-sdk-color");
  buttons.forEach((button) => button.classList.remove("active"));
}

function createColorButton(color, code, url, changeMakeupColor) {
  const colorButton = document.createElement("button");
  colorButton.classList.add("armo-sdk-color");
  colorButton.title = `Color ${code}`;
  colorButton.type = "button";

  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Color ${code}`;
    colorButton.appendChild(img);
  } else {
    colorButton.style.backgroundColor = color;
    const codeSpan = document.createElement("span");
    codeSpan.textContent = code;
    codeSpan.classList.add("armo-sdk-color-code");
    colorButton.appendChild(codeSpan);
  }

  colorButton.addEventListener("click", () => {
    removeActiveClass();
    colorButton.classList.add("active");
    changeMakeupColor(color);
  });

  return colorButton;
}
