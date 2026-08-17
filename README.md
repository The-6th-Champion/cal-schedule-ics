# Cal Schedule ICS

A Chrome extension that converts your UC Berkeley schedule into an ICS calendar file for easy import into Google Calendar, Apple Calendar, Outlook, or any other calendar app.

## Features

- 📅 **One-click export** – Extract your entire semester schedule from the Berkeley registration page
- 🔄 **Smart recurrence** – Automatically generates weekly recurring events for the entire semester
- ✅ **Review before commit** – Confirms each class with a popup before adding to calendar
- 🌍 **Timezone-aware** – Preserves Pacific Time (no UTC conversion issues)
- 📍 **Full details** – Includes course info, instructor, location, and meeting times

## Installation

### Option 1: Download from Releases (Easiest)

1. Go to the [Releases page](https://github.com/yourusername/cal-schedule-ics/releases)
2. Download the latest `cal-schedule-ics.zip` file
3. Extract the ZIP file to a folder on your computer
4. Continue to "Load into Chrome" below

### Option 2: Clone the Repository

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/cal-schedule-ics.git
   ```
2. Continue to "Load into Chrome" below

### Load into Chrome

1. **Open Chrome Extensions page**
   - Go to `chrome://extensions/` in your browser
   - Enable **Developer mode** (toggle in top right)

2. **Load the extension**
   - Click **Load unpacked**
   - Select the `cal-schedule-ics` folder (either from the ZIP or cloned repo)
   - The extension should appear in your toolbar

## How to Use

1. **Log into Berkeley**
   - Go to [Berkeley Schedule of Classes](https://schedule.berkeley.edu/) or your registration page
   - Make sure you're logged in and viewing your registered classes
   - ![Screenshot: Berkeley Schedule Page](screenshots/berkeley-schedule.png)

2. **Open the extension**
   - Click the **Cal Schedule ICS** extension icon in your Chrome toolbar
   - ![Screenshot: Extension Popup](screenshots/popup-dates.png)

3. **Enter semester dates**
   - **Semester Start:** First day of classes (e.g., August 25, 2026)
   - **Semester End:** Last day of classes (e.g., December 18, 2026)
   - Click **Export**

4. **Download and import**
   - A `schedule.ics` file downloads automatically
   - Open your calendar app (Google Calendar, Apple Calendar, Outlook, etc.)
   - Import or drag-and-drop the `.ics` file
   - All your classes appear as weekly recurring events for the semester
   - ![Screenshot: Calendar with imported events](screenshots/calendar-imported.png)

## Troubleshooting

**No classes detected**
- Make sure you're on the Berkeley schedule page (must contain registered courses)
- Check the browser console (F12 → Console) for error messages
- Verify the page has loaded completely before clicking the extension

**Classes missing from final calendar**
- Verify the semester dates were entered correctly (start should be earliest day, end should be latest)
- Check your calendar app supports ICS recurrence rules (RRULE)

**Duplicate classes**
- This can happen if the extension runs multiple times on the same page
- Simply re-download and import, or manually delete duplicates in your calendar

## Technical Details

- **Manifest Version:** 3 (Chrome's latest security standard)
- **Permissions:** `activeTab`, `scripting` (no broad host permissions)
- **Timezone:** Generates ICS with local Pacific Time (no Z suffix for UTC conversion)
- **Recurrence:** Uses RRULE with FREQ=WEEKLY, BYDAY, and UNTIL
- **Compatibility:** Chrome/Chromium-based browsers only

## Development

To modify the extension:

1. Edit `popup.html` – UI layout and date inputs
2. Edit `popup.js` – Business logic, parsing, and ICS generation
3. Edit `manifest.json` – Permissions and extension settings

Changes take effect after reloading the extension at `chrome://extensions/`

## License

This project is provided as-is for educational use. Feel free to modify and share with classmates.

## Disclaimer

This extension parses the visible HTML structure of Berkeley's schedule page. If Berkeley updates their page layout, the extension may need updates to the DOM selectors. If this happens, open an issue or contact the maintainer.

---

**Made for UC Berkeley students. Good luck with your classes! 🐻**
