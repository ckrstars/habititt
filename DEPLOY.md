# Deploying HABITIT to Netlify

This guide explains how to deploy the HABITIT application to Netlify.

## Prerequisites

- A GitHub account (or GitLab/Bitbucket)
- A Netlify account (free tier is sufficient)

## Deployment Steps

### Option 1: Manual Deployment

1. Build your application:

```bash
npm run build
```

2. Go to [Netlify](https://app.netlify.com/) and log in.

3. Drag and drop the `dist` folder to the Netlify dashboard.

### Option 2: Continuous Deployment (Recommended)

1. Push your project to a Git repository (GitHub, GitLab, or Bitbucket).

2. Go to [Netlify](https://app.netlify.com/) and log in.

3. Click on "New site from Git".

4. Choose your Git provider and select your repository.

5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Click "Deploy site".

## Configuration

The project already includes the following configuration files for Netlify:

- `netlify.toml`: Contains build settings and redirect rules.
- `public/_redirects`: Ensures client-side routing works correctly.

## Environment Variables

If your app requires environment variables, add them in the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add the variables you need.

## Custom Domain

To set up a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain settings.

## Troubleshooting

- **Client-side routing issues**: Make sure the redirects are working correctly.
- **Build failures**: Check the Netlify deploy logs for errors.
- **CSS/JS not loading**: Verify asset paths are correctly set.

## Updating Your Site

With continuous deployment set up, simply push changes to your Git repository, and Netlify will automatically rebuild and deploy your site.

## Additional Tips

1. **Personal Access Token**: If you're using HTTPS authentication, you may need to create a personal access token on GitHub to use as your password.

2. **SSH Authentication**: For easier authentication, you can set up SSH keys:
   ```bash
   # Generate SSH key
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add key to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Then add the public key to GitHub in your account settings
   ```

3. **GitHub Desktop**: If you prefer a GUI, you can use [GitHub Desktop](https://desktop.github.com/) to make this process easier.

4. **Git Extensions for VS Code**: If you're using VS Code, its built-in Git extensions can simplify Git operations.

After your code is on GitHub, you can easily connect your repository to Netlify for continuous deployment using the instructions in the NETLIFY_DEPLOYMENT.md guide I created earlier.

## Complete Example Commands

Here's the complete sequence of commands you'll need:

```bash
# Navigate to your project directory
cd D:\HABITIT

# Initialize Git repository
git init

# Add all files to staging area
git add .

# Commit your files
git commit -m "Initial commit of HABITIT app"

# Add the GitHub remote (replace with your actual GitHub username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main 