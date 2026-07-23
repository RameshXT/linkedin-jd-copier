# LinkedIn Job Description Copier

A lightweight Chrome Extension that adds a one-click button to copy job descriptions from LinkedIn job postings.

![How it looks](img/image.png)

## Features
- **Inline Placement**: Positioned directly next to the "About the job" heading inside the job details card.
- **Double-Format Copying**: Copies both a clean, structured plain-text layout and a style-stripped rich-text HTML format (preserving lists, headings, and links) for perfect pasting into Notion, Word, Google Docs, or ChatGPT.
- **No-Flicker Transition**: Locks button dimensions during the copy action to prevent any layout shifting.
- **SPA Resiliency**: Uses a background polling loop to stay active and responsive even when LinkedIn dynamically re-renders page layouts.
- **Noisy UI Stripping**: Automatically removes all scripts, ads, buttons, and interactive widgets from the copied clipboard content.

## Installation
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `linkedin` folder containing this extension.
