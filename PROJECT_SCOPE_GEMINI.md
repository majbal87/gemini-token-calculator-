# Gemini Multimodal Token Calculator Project Scope

## Problem Statement
Build a specialized, browser-based tool dedicated to estimating token usage and costs for the Google Gemini 2.5 and 3.0 model families. Unlike generic text-based calculators, this application must handle the "Universal Token" architecture, accurately calculating costs for multimodal inputs (text, images, audio, video, PDFs) and accounting for hidden protocol overheads as detailed in the technical brief.

## Core Objectives
1.  **Multimodal Ingestion**: Accept varied file types (TXT, code files, PDF, JPEG/PNG, MP3/WAV, MP4) and raw text input.
2.  **Model-Specific Logic**: Distinguish between Gemini 2.5 (fixed-tile vision, fixed-rate video) and Gemini 3.0 (resolution tiers, frame-based video).
3.  **Hidden Cost Visibility**: Reveal system overheads like "thinking" tokens, JSON formatting taxes, and protocol headers.
4.  **Phased Implementation**: Start with a robust framework for file handling and text, then expand to complex modalities.

## Token Calculation Methodologies (Per Technical Brief)

### 1. Text & Code (SentencePiece/Unigram)
- **Natural Language (English)**: `Math.ceil(chars / 4)`
- **Source Code**: `Math.ceil(chars / 3.25)` (Accounts for punctuation density)
- **CJK Languages**: `chars * 0.7` (High density)
- **JSON Overhead**: Apply `1.4x` multiplier to raw character count unless "TOON" optimization is selected.

### 2. Images (Visual Encoder)
- **Gemini 2.5**: 
    - Fixed tiling strategy.
    - `Tokens = ceil(Width / 768) * ceil(Height / 768) * 258`
- **Gemini 3.0**:
    - User-selectable Resolution Tiers.
    - **Low**: 280 tokens.
    - **Medium**: 560 tokens (Default).
    - **High**: 1120 tokens.
    - *Constraint*: Images are downscaled to max 3072x3072 before processing.

### 3. Documents (PDFs)
- **Strategy**: Treated as images (Vision-First).
- **Cost**: `Page Count * 258` (Gemini 2.5) or `Page Count * 560` (Gemini 3.0 Default).
- **Latency Estimation**: `Visual Tokens + Estimated Text Tokens` (Dual-process theory).

### 4. Temporal Media (Video & Audio)
- **Audio**: Fixed at **32 tokens/sec** (all versions).
- **Video (Gemini 2.5)**: Fixed ~263 tokens/sec (Video) + 32 tokens/sec (Audio) ≈ **295 tokens/sec**.
- **Video (Gemini 3.0)**: 
    - `Total Frames * 70 tokens/frame` + Audio track.
    - Default sampling: 1 FPS.

## Architecture & Technology Stack

- **Frontend Framework**: React + TypeScript (Vite)
- **UI Component Library**: Custom or Material UI (to match Google aesthetic).
- **State Management**: React Context or Zustand for holding file lists and configuration.
- **File Handling**:
    - `pdf.js`: For rendering PDF pages to count them and/or extract text if needed.
    - `ffmpeg.wasm` (Optional, later): For precise video frame counting/duration extraction client-side.
    - HTML5 File API: For basic text/image properties.

## Application Features & Roadmap

### Phase 1: Foundation & Text/Code
- **UI Layout**:
    - Configuration sidebar (Model selection: Gemini 2.5 vs 3.0, Output pricing).
    - File Upload Zone (Drag & Drop).
    - Results Dashboard (Total Input, Estimated Output, Cost).
- **Text Engine**:
    - Paste text area.
    - File upload for `.txt`, `.md`, `.json`, `.js/ts/py` etc.
    - Implementation of text heuristics (Language/Code detection).
- **Reporting**:
    - Breakdown of "Prompt Tokens" vs "System/Tool Overhead".

### Phase 2: Static Media (Images & PDFs)
- **Image Handler**:
    - Extract dimensions (Width/Height) from uploads.
    - Implement Tiling Logic (2.5) and Tier Logic (3.0).
- **PDF Handler**:
    - Count pages.
    - Toggle for "Treat as Text" (extract text) vs "Treat as Image" (Gemini Native).

### Phase 3: Temporal Media & Advanced Features
- **Video/Audio Handler**:
    - Extract duration and format.
    - Configurable FPS slider for Gemini 3.0 estimation.
- **Thinking Tokens**:
    - Input field for estimated "Thinking Budget" (Gemini 3.0 specific) to project output costs.
- **Batch Processing**:
    - detailed table view of all uploaded files with individual token counts.

## File Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   ├── ConfigurationPanel.tsx
│   │   ├── TokenBreakdown.tsx
│   │   └── MediaTypeRenderers/   # Specific logic for Image/Video/PDF cards
│   ├── hooks/
│   │   └── useTokenCalculator.ts # Central logic hook
│   ├── utils/
│   │   ├── geminiRules.ts        # The math from the technical brief
│   │   ├── formatters.ts
│   │   └── mediaHelpers.ts       # Extract metadata (w/h, duration)
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```
