/* 
 * Netlify CMS - Local Copy
 * This is a placeholder - we'll use a minimal working version
 * to get the CMS functional without external CDN dependencies
 */

// Minimal CMS initialization
window.CMS = {
  init: function() {
    console.log('Initializing local CMS...');
    
    // Create basic CMS structure
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>🚧 CMS Setup in Progress</h1>
        <p>The Content Management System is being configured...</p>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Alternative: Use GitHub Interface</h3>
          <p>While we set up the CMS, you can edit content directly on GitHub:</p>
          <ul>
            <li><strong>Site Settings:</strong> <a href="https://github.com/aletien/GenFree/edit/main/src/data/settings.json" target="_blank">settings.json</a></li>
            <li><strong>Hero Section:</strong> <a href="https://github.com/aletien/GenFree/edit/main/src/data/hero.json" target="_blank">hero.json</a></li>
            <li><strong>About Page:</strong> <a href="https://github.com/aletien/GenFree/edit/main/src/data/about.json" target="_blank">about.json</a></li>
          </ul>
          <p><em>Click "Commit changes" after editing to update your website.</em></p>
        </div>
        <button onclick="location.reload()" style="background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
          🔄 Try Again
        </button>
      </div>
    `;
  }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
  if (window.CMS) {
    window.CMS.init();
  }
});