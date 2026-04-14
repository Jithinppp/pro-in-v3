# Asset Management System

This document outlines the strict UI design patterns for the Asset Management System. 
The core aesthetic is "Warm & Clean Geometric", focusing on a minimalist enterprise vibe with very dark blacks and off-white/warm-grey backgrounds.

## 📐 Typography
**Primary Font**: Google Sans / DM Sans (`font-sans`)
- **Main Headings (H1/H2)**: Jet black (`text-[#111]`), bold/semibold tracking tight.
- **Subheadings/Descriptions**: Medium grey (`text-[#666]`), leading relaxed.
- **Labels (Form)**: Extra small, uppercase, widely tracked (`text-[11px] font-semibold text-[#888] uppercase tracking-wider`).
- **Footer/Metadata**: Small grey text (`text-xs text-[#888]`).

## 🎨 Color Palette
**Backgrounds**
- **Brand Pane/Off-white**: `#f5f5f5` (Use this instead of aggressive solid dark themes where possible to keep it warm).
- **Cards/Forms**: `#ffffff` (Pure white).
- **Inputs**: `#f9fafb` (Very light, almost white grey).

**Text & Accents**
- **Primary Text**: `#111111` (Instead of default black).
- **Secondary Text (Paragraphs)**: `#666666`.
- **Tertiary Text (Placeholders/Icons)**: `#a1a1aa`.
- **Brand Primary (Buttons)**: `#0a0a0a` (Near-black).

## 📝 Form & Input Rules
Every form in the application (Project Creation, Asset Registration, etc.) MUST follow this exact styling:

### 1. The Inputs
- **Base Style**: `bg-[#f9fafb] border border-[#f3f4f6] rounded-lg text-sm text-[#111]`.
- **Focus State**: MUST use a thick, very soft grey ring rather than a harsh blue outline: `focus:border-[#d1d5db] focus:ring-4 focus:ring-[#f3f4f6]`.
- **Labels**: Always uppercase, small, spaced out directly above the input.
- **Placeholders**: `placeholder:text-[#a1a1aa]`.

### 2. Validation & Error Messages
- Errors must **never** be clunky background-colored boxes.
- Errors must float exactly `1.5` margin units below the input field.
- **Style**: Red text with medium weight and tight sizing: `text-[11px] font-medium text-[#f04438] mt-1.5`.

### 3. Primary Buttons
To keep the warm, premium feel, avoid bright "Bootstrap" blues.
- **Base Style**: `bg-[#0a0a0a] text-white rounded-lg font-medium text-sm`.
- **Interactions**: Needs a gentle background fade and click-shrink: `hover:bg-[#1f1f1f] active:scale-[0.98] transition-all duration-200`.

## 📦 General UI Patterns
- **Shadows**: Keep shadows minimal, soft, and rarely used (`shadow-sm` on standard cards). Rely on the off-white `#f5f5f5` backgrounds vs white wrappers to create depth instead of dropshadows.
- **Corners**: Consistent use of `rounded-lg` on all interactive bounding boxes.
