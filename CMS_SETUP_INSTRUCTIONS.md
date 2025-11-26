# GenFree Network - Content Management System Setup

## 🎯 What This Enables

Your website now has a **Content Management System (CMS)** that allows non-technical administrators to:

- ✅ Upload and manage images/videos
- ✅ Edit website content (text, titles, descriptions)
- ✅ Add/edit/delete events
- ✅ Manage gallery images
- ✅ Update testimonials
- ✅ Modify about page content
- ✅ Change hero section content

## 🚀 Quick Start for Admins

### 1. Access the Admin Panel
- Visit your website: `https://aletien.github.io/GenFree/`
- Look for a **purple settings icon** in the bottom-left corner
- Click it to open the admin panel
- Click "Content Editor" to access the CMS

### 2. First-Time Setup (For Developers)
The CMS needs to be connected to your GitHub repository. Here's how:

#### Option A: Using Netlify (Recommended)
1. **Deploy to Netlify** (free)
   - Sign up at [netlify.com](https://netlify.com)
   - Import your GitHub repository
   - Enable Netlify Identity in site settings
   - Enable Git Gateway in Identity settings

2. **Enable CMS Access**
   - Go to Site Settings → Identity → Registration → Invite only
   - Invite admin users via email
   - They'll receive setup instructions

#### Option B: GitHub Pages + External Auth
1. **Use Decap CMS with GitHub OAuth**
   - Create a GitHub OAuth App
   - Configure authentication in the CMS
   - Requires additional setup steps

## 📁 Content Structure

### What Admins Can Edit:

#### 🏠 **Site Settings** (`/admin/`)
- Site title and description
- Contact information
- Phone numbers and addresses

#### 🎨 **Hero Section** 
- Main title and subtitle
- Background image
- Call-to-action button text

#### 🖼️ **Gallery**
- Upload new images
- Organize by categories (Worship, Community, Youth, etc.)
- Add titles and descriptions

#### 📅 **Events**
- Create new events
- Set date, time, location
- Add descriptions and registration links
- Upload event images

#### 💬 **Testimonials**
- Add new testimonials
- Upload photos of people
- Set ratings and roles

#### 📄 **Pages**
- Edit About page content
- Modify mission and vision statements
- Update team member information

## 🛠️ Technical Details

### File Structure Created:
```
public/admin/
├── index.html          # CMS interface
└── config.yml         # CMS configuration

src/data/
├── settings.json       # Site settings
├── hero.json          # Hero content
├── about.json         # About page content
├── gallery/           # Gallery images
├── events/            # Event files
└── testimonials/      # Testimonial data

src/utils/
└── cmsData.js         # Data loading utilities

src/components/
└── AdminAccess.jsx    # Admin panel access
```

### How It Works:
1. **Admins edit content** through the user-friendly CMS interface
2. **Changes are saved** as commits to your GitHub repository
3. **GitHub Pages automatically rebuilds** and deploys the site
4. **Website updates** with new content automatically

## 🔒 Security

### Admin Access Control:
- **Development**: Admin panel visible during local development
- **Production**: Only visible to authorized users
- **Authentication**: Handled by Netlify Identity or GitHub OAuth

### Enable Production Admin Access:
```javascript
// In browser console, run:
localStorage.setItem('genFreeAdmin', 'true');
// Then refresh the page to see admin panel
```

## 📋 Admin User Guide

### Adding a New Event:
1. Click "Content Editor" in admin panel
2. Go to "Events" section
3. Click "New Event"
4. Fill in event details:
   - Title, date, location
   - Upload an image
   - Write description in Markdown
   - Set category (Worship, Conference, etc.)
5. Click "Save" → "Publish"

### Updating Gallery:
1. Go to "Gallery" section
2. Click "New Gallery" item
3. Upload image and set:
   - Title and description
   - Category (Worship, Community, etc.)
   - Date
4. Save and publish

### Editing Site Content:
1. Go to "Site Settings" or "Pages"
2. Edit the content in text fields
3. Use Markdown for rich formatting
4. Preview changes before publishing

## 🎓 Training Recommendations

### For Church Admins:
1. **Basic Markdown**: Learn simple formatting (bold, italics, links)
2. **Image Guidelines**: Use high-quality, properly sized images
3. **SEO Best Practices**: Write descriptive titles and content
4. **Content Planning**: Plan updates and maintain consistency

### Quick Markdown Guide:
```markdown
**Bold text**
*Italic text*
[Link text](https://example.com)
# Large heading
## Medium heading
- Bullet point
```

## 🆘 Support

### Common Issues:
- **Can't see admin panel**: Check if you're authorized
- **Changes not showing**: Wait for GitHub Pages to rebuild (1-2 minutes)
- **Image upload fails**: Check file size (keep under 5MB)

### Getting Help:
1. Check this guide first
2. Contact your web developer
3. Refer to [Decap CMS documentation](https://decapcms.org/docs/)

## 🚀 Next Steps

1. **Test the setup**: Try adding a sample event or gallery image
2. **Train admins**: Share this guide with content managers
3. **Regular backups**: GitHub automatically backs up all content
4. **Monitor updates**: Check website regularly after content changes

---

**Your website is now admin-friendly! 🎉**

Non-technical team members can now manage content independently, keeping your website fresh and up-to-date without developer assistance.