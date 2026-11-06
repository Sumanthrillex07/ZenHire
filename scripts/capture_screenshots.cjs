const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAll() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log('1. Capturing Landing Page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '01-landing-page.png'), fullPage: false });

  // 2. Auth Login Page
  console.log('2. Capturing Login Page with Candidate credentials...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.type('input[type="email"]', 'sumanthrillex07@gmail.com', { delay: 30 });
  await page.type('input[type="password"]', '1234567', { delay: 30 });
  await sleep(400);
  await page.screenshot({ path: path.join(OUT_DIR, '02-auth-login.png'), fullPage: false });

  // 3. Candidate Dashboard (Dark Mode)
  console.log('3. Logging in as Candidate & Capturing Candidate Dashboard (Dark)...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '03-candidate-dashboard.png'), fullPage: false });

  // 3b. Candidate Dashboard (Light Mode)
  console.log('3b. Capturing Candidate Dashboard (Light Mode)...');
  await page.evaluate(() => {
    localStorage.setItem('zenhire_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUT_DIR, '03-candidate-dashboard-light.png'), fullPage: false });

  // Switch back to dark mode
  await page.evaluate(() => {
    localStorage.setItem('zenhire_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await sleep(400);

  // 4. Candidate Resume Page - Header & Upload
  console.log('4. Capturing Resume Intelligence Page...');
  await page.goto(`${BASE_URL}/candidate/resume`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT_DIR, '04-resume-intelligence.png'), fullPage: false });

  // 4b. Candidate Resume Page - Scrolled to Verified Skills & Evidence Quotes
  console.log('4b. Capturing Scrolled Candidate Skill Profile & Evidence Quotes...');
  await page.evaluate(() => window.scrollBy(0, 520));
  await sleep(600);
  await page.screenshot({ path: path.join(OUT_DIR, '04b-verified-candidate-skills.png'), fullPage: false });

  // 5. Technical Assessments Catalog
  console.log('5. Capturing Assessments Catalog...');
  await page.goto(`${BASE_URL}/candidate/assessments`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '05-technical-assessments.png'), fullPage: false });

  // 6. Assessment Runner
  console.log('6. Capturing Assessment Runner...');
  await page.goto(`${BASE_URL}/candidate/assessments/55555555-5555-5555-5555-555555555503`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT_DIR, '06-assessment-runner.png'), fullPage: false });

  // 7. Job Discovery Catalog
  console.log('7. Capturing Job Discovery Catalog (Applied jobs sink)...');
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '07-job-discovery.png'), fullPage: false });

  // 8. Job Detail & 60/40 Hybrid AI Matching
  console.log('8. Capturing Job Detail & 60/40 Hybrid Match...');
  await page.goto(`${BASE_URL}/jobs/31b6c096-5f38-4140-a747-0480376b53a6`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '08-hybrid-ai-matching.png'), fullPage: false });

  // 9. Candidate Applications Pipeline
  console.log('9. Capturing Candidate Applications Pipeline...');
  await page.goto(`${BASE_URL}/candidate/applications`, { waitUntil: 'networkidle0' });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUT_DIR, '09-application-pipeline.png'), fullPage: false });

  // 10. AI Career Advisor Chat Widget
  console.log('10. Capturing AI Career Advisor Chat Widget...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bottomBtn = btns.find(b => b.className.includes('fixed') && b.className.includes('bottom'));
      if (bottomBtn) bottomBtn.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '10-ai-career-advisor.png'), fullPage: false });
  } catch (err) {
    console.error('Chat widget open error:', err);
  }

  // Clear session to log in as Recruiter
  console.log('Clearing session for Recruiter login...');
  await page.evaluate(() => localStorage.clear());

  // 11. Recruiter Login -> Recruiter Command Center
  console.log('11. Logging in as Recruiter (abc@gmail.com)...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.type('input[type="email"]', 'abc@gmail.com', { delay: 30 });
  await page.type('input[type="password"]', '1234567', { delay: 30 });
  await sleep(300);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  await sleep(1500);
  console.log('Capturing Recruiter Command Center...');
  await page.screenshot({ path: path.join(OUT_DIR, '11-recruiter-command-center.png'), fullPage: false });

  // 12. Recruiter Post Job
  console.log('12. Capturing Recruiter Post Job Form...');
  await page.goto(`${BASE_URL}/recruiter/jobs/new`, { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '12-recruiter-post-job.png'), fullPage: false });

  // 13. Recruiter Ranked Applicant Pipeline
  console.log('13. Capturing Recruiter Ranked Applicant Pipeline...');
  await page.goto(`${BASE_URL}/recruiter/jobs/31b6c096-5f38-4140-a747-0480376b53a6/applicants`, { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '13-recruiter-ranked-pipeline.png'), fullPage: false });

  // 13b. Interview Scheduling Modal
  console.log('13b. Capturing Interview Scheduling Modal...');
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.textContent && (btn.textContent.includes('Reschedule') || btn.textContent.includes('Interview')));
      if (b) b.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '13b-schedule-interview-modal.png'), fullPage: false });
  } catch (err) {
    console.error('Error opening interview modal:', err);
  }

  console.log('All 16 recruitment workflow screenshots captured successfully!');
  await browser.close();
}

captureAll().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
