/**
 * Our own original templates. Positions and sizes are fractions of the canvas; text sizes are
 * fractions of the canvas width. Sample photos are Idoconverter's own sample images.
 */
import type { Template } from "./types";

export const TEMPLATES: Template[] = [
  {
    id: "weekend-sale", name: "Weekend sale", category: "sale", format: "post", sample: "/samples/gold-earrings.jpg",
    palette: { bg: "#111827", ink: "#FFFFFF", accent: "#F59E0B", soft: "#FFFFFF" },
    elements: [
      { type: "text", id: "kicker", label: "Small heading", text: "WEEKEND SALE", x: 0.08, y: 0.07, w: 0.84, size: 0.045, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "headline", label: "Headline", text: "Up to 50% off", x: 0.08, y: 0.13, w: 0.84, size: 0.11, weight: 700, color: "ink", align: "left", maxLines: 2 },
      { type: "rect", fill: "soft", x: 0.08, y: 0.42, w: 0.84, h: 0.42, radius: 0.02 },
      { type: "image", id: "photo", label: "Product photo", fit: "contain", x: 0.1, y: 0.44, w: 0.8, h: 0.38 },
      { type: "text", id: "detail", label: "Details", text: "Fri–Sun only · Free delivery over ₹499", x: 0.08, y: 0.89, w: 0.62, size: 0.032, weight: 400, color: "ink", align: "left", maxLines: 2 },
      { type: "logo", x: 0.76, y: 0.87, w: 0.16, h: 0.08 },
    ],
  },
  {
    id: "new-arrival", name: "New arrival", category: "launch", format: "portrait", sample: "/samples/teal-mug.jpg",
    palette: { bg: "#F4F1EC", ink: "#1C1917", accent: "#B45309", soft: "#FFFFFF" },
    elements: [
      { type: "rect", fill: "soft", x: 0.06, y: 0.05, w: 0.88, h: 0.57, radius: 0.02 },
      { type: "image", id: "photo", label: "Product photo", fit: "contain", x: 0.1, y: 0.08, w: 0.8, h: 0.51 },
      { type: "text", id: "kicker", label: "Small heading", text: "NEW ARRIVAL", x: 0.06, y: 0.66, w: 0.88, size: 0.04, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "name", label: "Product name", text: "Handmade teal mug", x: 0.06, y: 0.71, w: 0.88, size: 0.075, weight: 700, color: "ink", align: "left", maxLines: 2 },
      { type: "text", id: "price", label: "Price", text: "₹499", x: 0.06, y: 0.85, w: 0.6, size: 0.06, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.06, y: 0.93, w: 0.6, size: 0.03, weight: 400, color: "ink", align: "left", maxLines: 1 },
      { type: "logo", x: 0.76, y: 0.88, w: 0.18, h: 0.08 },
    ],
  },
  {
    id: "festive-offer", name: "Festive offer", category: "festival", format: "story", sample: "/samples/amber-bottle.jpg",
    palette: { bg: "#3B0A45", ink: "#FFF7E6", accent: "#FBBF24", soft: "#FFFFFF" },
    elements: [
      { type: "text", id: "kicker", label: "Small heading", text: "FESTIVE OFFER", x: 0.08, y: 0.07, w: 0.84, size: 0.045, weight: 700, color: "accent", align: "center", maxLines: 1 },
      { type: "text", id: "headline", label: "Headline", text: "Flat 20% off on everything", x: 0.08, y: 0.11, w: 0.84, size: 0.1, weight: 700, color: "ink", align: "center", maxLines: 3 },
      { type: "rect", fill: "soft", x: 0.08, y: 0.34, w: 0.84, h: 0.42, radius: 0.03 },
      { type: "image", id: "photo", label: "Product photo", fit: "contain", x: 0.12, y: 0.36, w: 0.76, h: 0.38 },
      { type: "text", id: "detail", label: "Details", text: "Use code FEST20 at checkout", x: 0.08, y: 0.8, w: 0.84, size: 0.045, weight: 600, color: "ink", align: "center", maxLines: 2 },
      { type: "logo", x: 0.4, y: 0.88, w: 0.2, h: 0.06 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.08, y: 0.955, w: 0.84, size: 0.03, weight: 400, color: "accent", align: "center", maxLines: 1 },
    ],
  },
  {
    id: "seller-tip", name: "Seller tip", category: "tips", format: "post",
    palette: { bg: "#FFFFFF", ink: "#14171A", accent: "#1F4FD1", soft: "#EEF2FF" },
    elements: [
      { type: "rect", fill: "soft", x: 0, y: 0, w: 1, h: 0.22 },
      { type: "text", id: "kicker", label: "Small heading", text: "SELLER TIP #1", x: 0.08, y: 0.085, w: 0.84, size: 0.04, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "headline", label: "Headline", text: "Shoot by a window, not under a tube light", x: 0.08, y: 0.28, w: 0.84, size: 0.075, weight: 700, color: "ink", align: "left", maxLines: 3 },
      { type: "text", id: "body", label: "Body text", text: "Soft daylight from the side gives true colours and gentle shadows. Turn the flash off.", x: 0.08, y: 0.58, w: 0.84, size: 0.04, weight: 400, color: "ink", align: "left", maxLines: 4 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.08, y: 0.89, w: 0.6, size: 0.032, weight: 600, color: "ink", align: "left", maxLines: 1 },
      { type: "logo", x: 0.76, y: 0.86, w: 0.16, h: 0.09 },
    ],
  },
  {
    id: "quote-card", name: "Quote card", category: "quote", format: "post",
    palette: { bg: "#14171A", ink: "#FFFFFF", accent: "#F97316", soft: "#26292E" },
    elements: [
      { type: "text", id: "mark", label: "Quote mark", text: "“", x: 0.08, y: 0.06, w: 0.3, size: 0.2, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "quote", label: "Quote", text: "Good photos don’t need a studio. They need light, patience and a clean background.", x: 0.08, y: 0.3, w: 0.84, size: 0.062, weight: 600, color: "ink", align: "left", maxLines: 5 },
      { type: "text", id: "author", label: "Who said it", text: "— Your name", x: 0.08, y: 0.74, w: 0.84, size: 0.036, weight: 400, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.08, y: 0.9, w: 0.6, size: 0.03, weight: 400, color: "ink", align: "left", maxLines: 1 },
      { type: "logo", x: 0.76, y: 0.86, w: 0.16, h: 0.09 },
    ],
  },
  {
    id: "video-thumbnail", name: "Video thumbnail", category: "video", format: "thumbnail", sample: "/samples/canvas-tote.jpg",
    palette: { bg: "#FDE047", ink: "#111111", accent: "#DC2626", soft: "#FFFFFF" },
    elements: [
      { type: "rect", fill: "soft", x: 0.55, y: 0.08, w: 0.4, h: 0.84, radius: 0.03 },
      { type: "image", id: "photo", label: "Photo", fit: "contain", x: 0.57, y: 0.11, w: 0.36, h: 0.78 },
      { type: "text", id: "kicker", label: "Small heading", text: "BEFORE vs AFTER", x: 0.05, y: 0.1, w: 0.47, size: 0.03, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "headline", label: "Headline", text: "Fix product photos in 2 minutes", x: 0.05, y: 0.19, w: 0.47, size: 0.072, weight: 700, color: "ink", align: "left", maxLines: 3 },
      { type: "text", id: "detail", label: "Details", text: "Free tool · no upload", x: 0.05, y: 0.73, w: 0.47, size: 0.03, weight: 600, color: "ink", align: "left", maxLines: 1 },
      { type: "logo", x: 0.05, y: 0.83, w: 0.14, h: 0.1 },
    ],
  },
  {
    id: "price-drop", name: "Price drop", category: "sale", format: "story", sample: "/samples/amber-bottle.jpg",
    palette: { bg: "#ECFDF5", ink: "#064E3B", accent: "#DC2626", soft: "#FFFFFF" },
    elements: [
      { type: "text", id: "kicker", label: "Small heading", text: "PRICE DROP", x: 0.08, y: 0.07, w: 0.84, size: 0.055, weight: 700, color: "accent", align: "center", maxLines: 1 },
      { type: "rect", fill: "soft", x: 0.1, y: 0.15, w: 0.8, h: 0.45, radius: 0.03 },
      { type: "image", id: "photo", label: "Product photo", fit: "contain", x: 0.14, y: 0.17, w: 0.72, h: 0.41 },
      { type: "text", id: "name", label: "Product name", text: "Amber glass bottle, 500 ml", x: 0.08, y: 0.63, w: 0.84, size: 0.065, weight: 700, color: "ink", align: "center", maxLines: 2 },
      { type: "text", id: "was", label: "Old price", text: "Was ₹699", x: 0.08, y: 0.735, w: 0.84, size: 0.045, weight: 400, color: "ink", align: "center", maxLines: 1 },
      { type: "text", id: "now", label: "New price", text: "Now ₹449", x: 0.08, y: 0.775, w: 0.84, size: 0.09, weight: 700, color: "accent", align: "center", maxLines: 1 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.08, y: 0.875, w: 0.84, size: 0.035, weight: 600, color: "ink", align: "center", maxLines: 1 },
      { type: "logo", x: 0.4, y: 0.91, w: 0.2, h: 0.055 },
    ],
  },
  {
    id: "back-in-stock", name: "Back in stock", category: "launch", format: "post", sample: "/samples/canvas-tote.jpg",
    palette: { bg: "#FFFFFF", ink: "#14171A", accent: "#16A34A", soft: "#F4F5F7" },
    elements: [
      { type: "rect", fill: "soft", x: 0, y: 0, w: 0.5, h: 1 },
      { type: "image", id: "photo", label: "Product photo", fit: "contain", x: 0.04, y: 0.1, w: 0.42, h: 0.8 },
      { type: "text", id: "kicker", label: "Small heading", text: "BACK IN STOCK", x: 0.54, y: 0.12, w: 0.42, size: 0.035, weight: 700, color: "accent", align: "left", maxLines: 1 },
      { type: "text", id: "name", label: "Product name", text: "Canvas tote bag", x: 0.54, y: 0.18, w: 0.42, size: 0.07, weight: 700, color: "ink", align: "left", maxLines: 3 },
      { type: "text", id: "body", label: "Body text", text: "Strong cotton, an inside pocket, and room for a laptop.", x: 0.54, y: 0.47, w: 0.42, size: 0.035, weight: 400, color: "ink", align: "left", maxLines: 5 },
      { type: "text", id: "price", label: "Price", text: "₹599", x: 0.54, y: 0.72, w: 0.42, size: 0.06, weight: 700, color: "ink", align: "left", maxLines: 1 },
      { type: "text", id: "shop", label: "Shop name", text: "Your shop name", shop: true, x: 0.54, y: 0.9, w: 0.26, size: 0.03, weight: 400, color: "ink", align: "left", maxLines: 1 },
      { type: "logo", x: 0.8, y: 0.87, w: 0.16, h: 0.09 },
    ],
  },
];

export const templateById = (id: string) => TEMPLATES.find(t => t.id === id);
