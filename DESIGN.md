---
name: PaperGraph Editorial
colors:
  canvas: "#FAF8F2"
  surface: "#FFFFFF"
  surfaceMuted: "#F2EEE6"
  ink: "#171614"
  muted: "#6F6A5F"
  faint: "#9A9285"
  line: "#DED7C9"
  accent: "#A45117"
  accentSoft: "#F5E4D6"
  evidence: "#263B5E"
  warning: "#B7822F"
typography:
  display:
    fontFamily: "Satoshi, Geist, Aptos, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.02
  body:
    fontFamily: "Satoshi, Geist, Aptos, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  mono:
    fontFamily: "Geist Mono, Cascadia Code, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  sm: "10px"
  md: "18px"
  lg: "32px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "18px"
  lg: "28px"
  xl: "44px"
---

## Overview

PaperGraph should feel like a bright research desk: paper, margin notes, citation slips, graph evidence, and ranking traces. The app/feed surface should be white and editorial, not green or dark SaaS. Dark graph canvases can remain as specialized visualization instruments, but app chrome and feed cards use the light system.

## Colors

Use `canvas` for app backgrounds and `surface` for working panels. Use `accent` sparingly for active tabs, primary actions, and important score accents. Use `evidence` for source-backed recommendation context. Do not use green as the primary app/feed theme.

## Typography

Use a high-end sans stack: Satoshi first, then Geist, then Aptos. Use mono only for metrics, signal IDs, scores, and timestamps. Avoid oversized marketing headlines inside the app; hierarchy should come from spacing, weight, and editorial layout.

## Layout

Feed layout should be asymmetric: a wide ranked paper stream with a narrower observability/trace rail where useful. On mobile, collapse to one column. Use generous white space and thin dividers instead of heavy dark cards.

## Components

Cards are white with subtle borders and diffusion shadows only when hierarchy needs elevation. Buttons are tactile with small translate/scale active states. Feedback controls should look like quiet research annotations, not loud social buttons.

## States

Feedback actions must visibly update local UI. Debug and observability surfaces should expose recent signals, impressions, rank factors, and provenance labels in plain language.
