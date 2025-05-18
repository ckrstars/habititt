# HABITIT Netlify Deployment Guide

This guide provides detailed instructions for deploying the HABITIT application to Netlify.

## Prerequisites

- Node.js and npm installed locally
- A Netlify account (sign up at [netlify.com](https://www.netlify.com/))
- Your HABITIT code on your local machine

## Deployment Steps

### Step 1: Prepare Your Project

1. Make sure all your changes are saved and committed.

2. Verify that the project has the following Netlify configuration files:
   - `netlify.toml` (in project root)
   - `public/_redirects` (for SPA routing)

### Step 2: Build Your Project

Open a terminal/command prompt in your project directory and run:

```bash
# Install dependencies if you haven't already
npm install

# Build the project
npm run build
```

This will create a `dist` directory containing your built application.

### Step 3: Deploy to Netlify

#### Option A: Drag-and-Drop Deployment

1. Go to [Netlify](https://app.netlify.com/) and log in to your account.

2. From your Netlify dashboard, drag and drop the entire `dist` folder onto the designated area.

3. Wait for the upload to complete. Netlify will automatically deploy your site and provide you with a unique URL.

#### Option B: Netlify CLI Deployment

1. Install the Netlify CLI globally:

```bash
npm install netlify-cli -g
```

2. Log in to your Netlify account through the CLI:

```bash
netlify login
```

3. Deploy your site:

```bash
netlify deploy
```

4. Follow the prompts:
   - Select "Create & configure a new site"
   - Choose your team
   - Set a site name (optional)
   - Specify `dist` as the publish directory

5. Review the draft URL, then deploy to production:

```bash
netlify deploy --prod
```

### Step 4: Configure Your Site

After deployment, you can configure additional settings in your Netlify dashboard:

1. **Custom Domain**: 
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Follow the instructions to set up your domain

2. **Environment Variables** (if needed):
   - Go to Site settings > Build & deploy > Environment
   - Add any environment variables your application needs

3. **Form Handling** (if your app uses forms):
   - No additional setup needed; Netlify automatically detects forms in your HTML with a `netlify` attribute

### Step 5: Continuous Deployment (Optional)

For automatic deployments when you update your code:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. In your Netlify dashboard, go to Site settings > Build & deploy > Continuous deployment
3. Click "Link site to Git"
4. Select your repository and follow the setup instructions
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Troubleshooting

### Common Issues

- **Routing Issues**: If client-side routing doesn't work, verify that the `_redirects` file is properly configured in your `public` directory.

- **Build Failures**: Check the Netlify build logs for specific errors. Common issues include:
  - Missing dependencies
  - TypeScript errors
  - Incorrect build configurations

- **CSS or Images Not Loading**: Ensure that asset paths are correctly set. In Vite projects, use relative paths or import assets directly in your code.

- **Environment Variables**: If your app uses environment variables, make sure they're correctly set in the Netlify dashboard.

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Troubleshooting Netlify Deployments](https://docs.netlify.com/configure-builds/troubleshooting-tips/)

## Support

If you encounter issues not covered in this guide, check the Netlify forums or contact their support team for assistance. 