# Nouriva — Feature 4 AI Setup

## Where to add your API key

The API configuration file is **`.env` in the main project folder**, beside `index.html`, `server.js`, and `run.bat`. It is included in this ZIP. Open it in Notepad and paste your Google Gemini key on this line:

```env
GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
```

Remove the example words and use your own key. Do not share the key or upload `.env` publicly. You do **not** need to rename `.env.example`; edit `.env` only.

## How to run

1. Install **Node.js 18 or newer** from https://nodejs.org/ if it is not already installed.
2. Open the main folder and edit `.env` with your Gemini API key.
3. Double-click **`run.bat`**. A terminal window starts the server and your browser opens `http://localhost:3000`.
4. Open Feature 4 and send a message in the Food Assistant.
5. To check backend status, visit `http://localhost:3000/api/health`. It shows `"aiConfigured": true` when the key is detected.

Keep the terminal window open while using the site. To stop the server, press **Ctrl+C** in that window. Do not double-click `index.html` directly for AI testing; the AI endpoint requires the local server.

## What is wired up

- The main Nouriva site is served from the same Node server.
- Feature 4's `POST /api/chat` endpoint calls Gemini on the server, so the API key is not sent to the browser.
- Feature 4 food data is read from `member4/data/foods.json`.
- If no key is configured, the chat shows its offline fallback.

---

# Nouriva Health & Nutrition AI Dashboard (নুরিভা এআই হেলথ ও নিউট্রিশন)

## 🌟 এই জিপ ফাইলে যা যা আছে (Features Included in this ZIP)
এই জিপ ফাইলের ভেতরে Nouriva AI প্রজেক্টের সবকিছু সম্পূর্ণভাবে অন্তর্ভুক্ত আছে:

1. 🔐 **লগইন ও সাইন আপ অপশন (Login & Create Account)**:
   - লগইন পেজ (Sign In / Login with email & password)
   - নতুন অ্যাকাউন্ট তৈরির পেজ (Create Account / Sign Up with name, calorie target, dietary preference)
   - ১-ক্লিক ডেমো লগইন ও গেস্ট একাউন্ট এক্সেস
   - টপহেডার ও সাইডবারে সরাসরি দৃশ্যমান **লগআউট বাটন (One-Click Logout)**

2. 🌐 **ভাষা পরিবর্তনের অপশন (Language Switcher)**:
   - বাংলা (Bangla - ডিফল্ট)
   - ইংরেজি (English)
   - হিন্দি (Hindi)
   - টপহেডারের "BN / EN" গ্লোব বাটনে ক্লিক করে সাথে সাথে ভাষা পরিবর্তন করা যায়।

3. 🎨 **ঝকঝকে ব্রাইট থিম (Fresh Bright Theme)**:
   - ডিফল্ট সবুজ-সাদা ফ্রেশ থিম
   - সান/মুন বাটনে ক্লিক করে ডার্ক থিমে পরিবর্তনের সুবিধা।

4. 📊 **শূন্য (০) থেকে শুরু প্রগ্রেস রিপোর্ট (Zero-Initialized Progress Report)**:
   - ব্যবহারকারীর চাহিদা অনুযায়ী দৈনিক ক্যালোরি, প্রোটিন, পানি এবং লক্ষ্যমাত্রা শুরুতে ০ (Zero) থাকে।
   - খাবার/পানি যোগ করলে রিয়েল-টাইমে চার্ট ও প্রগ্রেস স্বয়ংক্রিয়ভাবে আপডেট হয়।

5. 🚀 **৪টি পূর্ণাঙ্গ টিম ফিচার (4 Core Team Features)**:
   - **Member 1**: AI Food Scanner & Nutrition Analyzer (খাদ্য বিশ্লেষণ ও ক্যালোরি স্ক্যানার)
   - **Member 2**: Personalized AI Nutrition Coach (ব্যক্তিগত ডায়েট কোচিং ও পরামর্শ)
   - **Member 3**: Smart Budget Meal Planner (বাংলাদেশি টাকায় বাজেট মিল প্ল্যানার)
   - **Member 4**: Health & Hydration Tracker Assistant (দৈনিক পানি ও অ্যাক্টিভিটি ট্র্যাকার)

---

## 🚀 কীভাবে চালু করবেন (How to Run)

### পদ্ধতি ১: সবচেয়ে সহজ (কোনো ইন্সটলেশন ছাড়াই)
1. জিপটি আনজিপ করুন।
2. ফোল্ডারের ভেতরে থাকা **`index.html`** ফাইলে ডাবল-ক্লিক করুন।
3. ক্রোম, এজ বা ফায়ারফক্স ব্রাউজারে সম্পূর্ণ অ্যাপটি সাথে সাথে চালু হয়ে যাবে!
*(উইন্ডোজ ব্যবহারকারীরা `run.bat` এও ডাবল-ক্লিক করতে পারেন)*

### পদ্ধতি ২: পাইথন লোকাল সার্ভার দিয়ে
```bash
python start_server.py
```
ব্রাউজারে `http://localhost:3000` স্বয়ংক্রিয়ভাবে চালু হবে।

### পদ্ধতি ৩: ফুল রিঅ্যাক্ট সোর্স কোড (Developer Mode)
ফোল্ডারের ভেতরে `source_code/` রয়েছে:
```bash
cd source_code
npm install
npm run dev
```
