const express = require('express');
const router = express.Router();

const PRIVACY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — IAS: Intelligent Aspirant's Suite</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc; color: #334155; line-height: 1.7;
    }
    .banner {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      color: #fff; padding: 3rem 1.5rem; text-align: center;
    }
    .banner h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
    .banner p { font-size: 0.95rem; opacity: 0.85; }
    .container { max-width: 780px; margin: -2rem auto 3rem; padding: 2.5rem 2rem; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    h2 { font-size: 1.2rem; font-weight: 600; color: #1e3a5f; margin: 2rem 0 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid #e2e8f0; }
    h2:first-child { margin-top: 0; }
    p, li { font-size: 0.938rem; margin-bottom: 0.5rem; }
    ul { padding-left: 1.25rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.35rem; }
    strong { color: #1e293b; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .effective { text-align: center; color: #94a3b8; font-size: 0.85rem; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
    @media (max-width: 600px) {
      .container { margin: -1rem 0.75rem 2rem; padding: 1.5rem 1.25rem; border-radius: 12px; }
      .banner { padding: 2rem 1rem; }
      .banner h1 { font-size: 1.35rem; }
    }
  </style>
</head>
<body>
  <div class="banner">
    <h1>Privacy Policy</h1>
    <p>IAS — Intelligent Aspirant's Suite</p>
  </div>
  <div class="container">

    <h2>1. Introduction</h2>
    <p><strong>IAS — Intelligent Aspirant's Suite</strong> is a UPSC Civil Services Examination preparation platform available on the web, Android, and iOS. This policy describes how we collect, use, and protect your personal information when you use our application.</p>
    <p>By creating an account or using IAS, you agree to the practices described in this policy.</p>

    <h2>2. Information We Collect</h2>
    <p>We collect only the data necessary to provide and improve the service:</p>
    <ul>
      <li><strong>Account Information</strong> — Name, email address, mobile number, and a securely hashed password.</li>
      <li><strong>Profile Preferences</strong> — Target UPSC attempt year, optional subject, exam stage, daily study-hour target, preferred revision pattern, preferred study session time, theme preference.</li>
      <li><strong>Study Data</strong> — Syllabus progress, quiz attempts and scores, answer-writing submissions, flashcards, bookmarks, daily planner entries, focus session records, revision schedules, and essay practice.</li>
      <li><strong>Subscription Information</strong> — Selected subscription tier, payment UTR number, and payment screenshot (for manual verification).</li>
      <li><strong>Usage Statistics</strong> — Aggregate feature-usage counts (AI quizzes generated, answer evaluations, custom notes created, etc.) used to enforce tier-based limits.</li>
      <li><strong>Push Notification Token</strong> — A device-generated token used to deliver notifications, if you grant notification permission.</li>
    </ul>
    <p>We do <strong>not</strong> collect location data, contacts, camera/microphone access, Aadhaar or government ID numbers, financial/banking information beyond the UTR reference, or any biometric data.</p>

    <h2>3. How We Use Your Information</h2>
    <ul>
      <li>Create, authenticate, and manage your account.</li>
      <li>Deliver study features — syllabus tracking, quizzes, answer evaluation, spaced repetition, planner, current affairs, mind maps, and flashcards.</li>
      <li>Process and verify subscription payments via manual admin review.</li>
      <li>Send in-app and push notifications (current-affairs updates, revision reminders, achievements).</li>
      <li>Enforce usage limits based on your subscription tier.</li>
      <li>Maintain platform security and prevent abuse.</li>
      <li>Improve the application based on aggregate usage patterns.</li>
    </ul>

    <h2>4. Information Sharing</h2>
    <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</p>
    <p>We may share information only in the following limited circumstances:</p>
    <ul>
      <li><strong>Service Providers</strong> — We use third-party infrastructure to operate the application: <em>Render</em> (hosting), <em>MongoDB Atlas</em> (database), <em>Expo / EAS</em> (app builds and over-the-air updates), and <em>Google Gemini API</em> (AI-powered quiz generation and answer evaluation). These providers process data solely to deliver the service and are bound by their own privacy obligations.</li>
      <li><strong>Legal Obligations</strong> — We may disclose information if required by applicable law, regulation, or legal process.</li>
    </ul>

    <h2>5. Data Security</h2>
    <p>We employ reasonable technical and organizational safeguards to protect your data:</p>
    <ul>
      <li>Passwords are hashed using <strong>bcrypt</strong> and are never stored in plain text.</li>
      <li>Authentication uses <strong>JSON Web Tokens (JWT)</strong> with short-lived access tokens and rotating refresh tokens.</li>
      <li>API rate limiting is enforced to prevent abuse.</li>
      <li>All data in transit is encrypted via <strong>HTTPS/TLS</strong>.</li>
    </ul>

    <h2>6. Data Retention</h2>
    <p>Your account and associated study data are retained for as long as your account is active. In-app notifications are automatically deleted after <strong>30 days</strong>. Expired subscriptions are automatically marked as expired but your study data is preserved.</p>

    <h2>7. Account & Data Deletion</h2>
    <p>You may request deletion of your account and all associated personal data by contacting us at the email address below. Upon receiving your request, we will permanently delete your account, study progress, quiz history, planner data, and all other personal information within <strong>30 days</strong>.</p>

    <h2>8. Children's Privacy</h2>
    <p>IAS is designed for UPSC Civil Services aspirants and is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will promptly delete that information.</p>

    <h2>9. Cookies & Technical Data</h2>
    <p>The web version of IAS uses browser <strong>localStorage</strong> to store your authentication token and theme preference. The mobile app uses <strong>AsyncStorage</strong> for the same purpose. We do not use third-party tracking cookies or analytics SDKs.</p>

    <h2>10. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify users through the application. The "Last Updated" date at the bottom of this page reflects the most recent revision.</p>

    <h2>11. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, wish to request data deletion, or have any concerns, please contact us:</p>
    <ul>
      <li><strong>Email</strong>: <a href="mailto:iasuite.support@gmail.com">iasuite.support@gmail.com</a></li>
      <li><strong>Application</strong>: IAS — Intelligent Aspirant's Suite</li>
    </ul>

    <p class="effective">Last Updated: 1 October 2026</p>
  </div>
</body>
</html>`;

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(PRIVACY_HTML);
});

module.exports = router;
