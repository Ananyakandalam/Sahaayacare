# Sahaaya Care - Visual & Spoken Medicine Timetable
## VS Code & Online Compiler Setup Guide

This package provides two distinct ways to run Sahaaya Care:
1. **Option A (Full Project with Backend & Dev Server)**: Recommended for VS Code developers wanting full TypeScript, Vite HMR, and server APIs.
2. **Option B (Zero-Install Single File HTML)**: Recommended for instant offline use, USB drives, or running with the VS Code **Live Server** extension without Node.js.

---

### Option A: Running the Full Project in VS Code (Node.js + Vite + Express)

#### 1. Requirements
- Node.js (version 18 or higher): Download from [nodejs.org](https://nodejs.org/)
- VS Code: Download from [code.visualstudio.com](https://code.visualstudio.com/)

#### 2. Open Project in VS Code
1. Extract the downloaded `sahaya_care_full_project.zip`.
2. Open VS Code, click **File > Open Folder...**, and select the extracted folder.

#### 3. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + ~` on Windows/Linux or `Cmd + ~` on Mac) and run:
```bash
npm install
```

#### 4. Configure Environment (Optional for Gemini AI)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want server-side AI parsing and Gemini TTS:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

#### 5. Start Development Server
Run:
```bash
npm run dev
```
Open your browser at:
```
http://localhost:3000
```

---

### Option B: Running `sahaya.care.html` in VS Code (Zero Install / Live Server)

`sahaya.care.html` is a single, self-contained standalone application with all React, Tailwind CSS, SVG pill visual shapes, audio synthesis, and clinic modules embedded.

#### Method 1: Double-Click to Open
- Simply double-click `sahaya.care.html` in your file explorer. It will immediately open and run in Chrome, Edge, Safari, Brave, or Firefox.

#### Method 2: VS Code Live Server
1. In VS Code, install the extension **Live Server** (by Ritwick Dey).
2. Right-click on `sahaya.care.html` in the VS Code file explorer.
3. Select **"Open with Live Server"**.
4. Your browser will automatically open with live preview and audio support.

#### Method 3: Online Compilers (CodePen, JSFiddle, HTML Previewers)
- Open `sahaya.care.html`, copy all contents, and paste into any online HTML/JS runner (e.g., CodePen, JSFiddle, Replit, or HTML Online Editor).

---

### Key Features Included
- **Spoken Audio Voice Guide**: Works offline via the browser's Web Speech API in Telugu (`te-IN`), Hindi (`hi-IN`), and English (`en-US`) with speed controls (0.7x, 0.85x, 1.0x).
- **7-Day Visual Pill Schedule**: High-contrast pill visual identifiers (Round, Oval, Capsule, Liquid Drop) with "I Swallowed This Pill" checkmarks.
- **30-Day Medication Adherence Tracker**: Tracks compliance rates, streaks, and monthly medication history.
- **OPD Digital Queue & Token Hub**: Live clinic token status, patient queue counter, and virtual OPD slip.
- **Blood Donor Search**: Verified donor contacts filtered by blood group.
- **Rural Health PHC Directory**: Contacts for Primary Health Centers and village ASHA workers.
- **Emergency Help (SOS)**: 108 ambulance, 104 medical advice helpline, and family doctor contacts.
