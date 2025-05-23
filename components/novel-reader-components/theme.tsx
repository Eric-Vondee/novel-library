import type { Rendition } from "epubjs";
import type { Theme } from "../theme-provider";

// Add this new type
export type FontSize =
  | "80%"
  | "90%"
  | "100%"
  | "110%"
  | "120%"
  | "130%"
  | "140%"
  | "150%"
  | "200%";

export function updateTheme(
  rendition: Rendition,
  theme: Theme,
  fontSize: FontSize
) {
  const themes = rendition.themes;

  // Set color and background based on theme
  themes.override("color", theme === "dark" ? "#fff" : "#000");
  themes.override("background", theme === "dark" ? "#121212" : "#fff");

  // Apply font family
  themes.override("font-family", '"Montserrat", system-ui, sans-serif');
  themes.override("font-size", fontSize);

  // Define responsive font sizes
  const responsiveFontSizes = {
    default: "18px",
    tablet: "22px",
    laptop: "24px",
  };

  // Apply responsive font sizes to text elements
  const textElements = ["p", "span", "div"];
  for (const element of textElements) {
    // @ts-expect-error epub types are not correct
    themes.override(element, {
      "font-size": responsiveFontSizes.default,
      "@media screen and (min-width: 768px)": {
        "font-size": responsiveFontSizes.tablet,
      },
      "@media screen and (min-width: 1024px)": {
        "font-size": responsiveFontSizes.laptop,
      },
    });
  }

  // Adjust the selected font size
  const adjustFontSize = (baseSize: string) => {
    const size = Number.parseInt(baseSize, 10);
    const adjustedSize = (size * Number.parseFloat(fontSize)) / 100;
    return `${adjustedSize}px`;
  };

  // Apply adjusted font sizes
  // @ts-expect-error epub types are not correct
  themes.override("p", {
    "font-size": adjustFontSize(responsiveFontSizes.default),
  });
  // @ts-expect-error epub types are not correct
  themes.override("@media screen and (min-width: 768px)", {
    p: { "font-size": adjustFontSize(responsiveFontSizes.tablet) },
  });
  // @ts-expect-error epub types are not correct
  themes.override("@media screen and (min-width: 1024px)", {
    p: { "font-size": adjustFontSize(responsiveFontSizes.laptop) },
  });
}
