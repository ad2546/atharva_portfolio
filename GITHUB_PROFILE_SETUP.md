# GitHub Profile README Setup Guide

## How to Set Up Your GitHub Profile README

### Step 1: Create a Special Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. **IMPORTANT:** Name the repository exactly as your GitHub username: `ad2546`
   - The repository name MUST match your username exactly
5. Make sure the repository is set to **Public**
6. Check the box **"Add a README file"**
7. Click **"Create repository"**

### Step 2: Add Your Profile README Content

1. Once the repository is created, you'll see a README.md file
2. Click the **pencil icon** (Edit) to edit the README.md file
3. Delete the default content
4. Copy the content from the `README.md` file I created for you
5. Paste it into the GitHub editor
6. Scroll down and click **"Commit changes"**
7. Add a commit message like "Add profile README"
8. Click **"Commit changes"** again

### Step 3: Verify Your Profile

1. Go to your GitHub profile: `https://github.com/ad2546`
2. You should now see your custom README displayed on your profile page!

## Quick Command Line Setup (Alternative)

If you prefer using the command line, follow these steps:

```bash
# Navigate to your desired directory
cd ~/Desktop

# Create a new directory with your GitHub username
mkdir ad2546
cd ad2546

# Initialize git repository
git init

# Copy the README.md file from your portfolio directory
cp /Users/atharvadeshmukh/Pot/atharva_portfolio/README.md .

# Add and commit the file
git add README.md
git commit -m "Add profile README"

# Create the repository on GitHub first (see Step 1 above), then:
# Add the remote origin (replace with your actual repository URL)
git remote add origin https://github.com/ad2546/ad2546.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Customization Tips

### Update GitHub Stats Username
Make sure the username in the stats badges matches your GitHub username:
- Replace `ad2546` with your actual username if different

### Add More Sections (Optional)
You can add more sections like:
- **Current Learning:** Technologies you're currently studying
- **Blog Posts:** Links to your latest articles
- **Contribution Graph:** Add GitHub contribution snake animation
- **Visitor Counter:** Add a profile view counter

### GitHub Stats Themes
Change the theme of your stats by replacing `theme=radical` with:
- `dark`, `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`

Example:
```markdown
![Atharva's GitHub stats](https://github-readme-stats.vercel.app/api?username=ad2546&show_icons=true&theme=tokyonight)
```

## Important Notes

1. **Repository Name:** The repository MUST be named exactly as your GitHub username
2. **Public Repository:** The repository must be public for the README to show on your profile
3. **README.md:** The file must be named `README.md` (case-sensitive)
4. **Updates:** Any changes you make to the README.md file will automatically update on your profile

## Troubleshooting

**Profile README not showing?**
- Verify the repository name matches your username exactly
- Ensure the repository is public
- Check that the file is named `README.md`
- Wait a few minutes for GitHub to refresh

**Stats not loading?**
- The GitHub stats are generated dynamically
- They may take a moment to load
- Ensure your GitHub username is correct in the URLs

---

Need help? Feel free to reach out at ad2546@rit.edu
