NUTRIAI — COMBINED MEAL NUTRITION

IMPORTANT
- Keep your previous project folder as a backup. This project is a separate copy.
- Never put your Gemini API key inside index.html or script.js.
- Do not share your .env file or API key.

SETUP ON WINDOWS
1. Extract this ZIP into a new folder, for example Documents\nutriai_combined_project.
2. Open that folder in Cursor.
3. In the folder, copy .env.example and rename the copy to .env.
   Make sure the filename is exactly .env, not .env.txt.
4. Open .env and replace PASTE_YOUR_GEMINI_API_KEY_HERE with your own Gemini API key.
5. In Cursor Terminal, make sure the terminal path is this project folder.
6. Run:
   npm install
7. After it finishes, run:
   npm start
8. Open this address in your browser:
   http://localhost:3000

FEATURES
- Add multiple foods and remove extra rows.
- Enter a quantity and unit for each food.
- Optional meal image upload (JPG, PNG, WEBP; under 7 MB).
- One Gemini request estimates the listed foods together.
- The server adds the per-food values to calculate combined calories, protein, carbs and fat.
- Existing /api/analyze-food endpoint is retained for compatibility.

TROUBLESHOOTING
- If port 3000 is already in use, stop the old server terminal with Ctrl+C before starting this one.
- If the page does not update, check the browser address and make sure it says http://localhost:3000.
- If Gemini reports an unavailable model or high demand, it may be temporary. The model name is kept as gemini-3.8-flash to match the current project setup; change it only if that model is unavailable for your API account.
- Nutrition is an estimate, not medical advice.
