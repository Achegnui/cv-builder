import React from "react";
import type { CVData } from "@/lib/schema";

export type PaperSize = "a4" | "letter";
export type ColorMode = "accent" | "black";
export type FontFamily = "sans" | "serif" | "mono";
export type Spacing = "normal" | "compact";

export interface StyleConfig {
  paperSize: PaperSize;
  colorMode: ColorMode;
  accentColor: string; // e.g. "#1e3a8a" (navy), "#0f766e" (teal), etc.
  fontFamily: FontFamily;
  spacing: Spacing;
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  paperSize: "a4",
  colorMode: "accent",
  accentColor: "#1e3a8a", // Classic deep navy
  fontFamily: "sans",
  spacing: "normal",
};

export interface TemplateProps {
  data: CVData;
  style: StyleConfig;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<TemplateProps>;
}
