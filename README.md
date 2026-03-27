<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it online via GitHub Actions.

View your app in AI Studio: https://ai.studio/apps/7bcb17a3-7db6-4366-a454-ba33db617220

## Run Locally

**Prerequisites:** Node.js (v18 or v20 recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Automatic Deployment (GitHub Pages)

This project has been configured with GitHub Actions to automatically deploy to **GitHub Pages** whenever you push to the `main` or `master` branch.

**To enable this:**
1. Push your code to your GitHub repository.
2. Go to your repository settings -> **Pages**.
3. Source: Select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` action will now automatically build and publish your site!
