const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\geeth\\OneDrive\\Desktop\\31\\Project_31';
const pagesDir = path.join(rootDir, 'pages');

const rootHeaderHTML = `<header class="site-header">
  <div class="container nav">
    <a href="index.html" class="brand">
      <img src="assets/images/icons/logo.svg" alt="Grand Palace crest" class="brand-mark">
      <span class="brand-name">Grand Palace</span>
    </a>
    <ul class="nav-links">
      <li class="nav-dropdown">
        <a href="index.html">Home ▾</a>
        <div class="dropdown-panel">
          <a href="index.html">Home — Classic</a>
          <a href="pages/home-2.html">Home — Premium</a>
        </div>
      </li>
      <li><a href="pages/about.html">About</a></li>
      <li><a href="pages/booking.html">Book Now</a></li>
      <li><a href="pages/services.html">Services</a></li>
      <li><a href="pages/gallery.html">Gallery</a></li>
      <li><a href="pages/contact.html">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" data-theme-toggle title="Toggle Dark/Light Mode">🌙</button>
      <button class="icon-btn" data-rtl-toggle title="Toggle RTL Mode">🌐</button>
      <a href="pages/dashboard.html" class="btn btn-primary btn-sm">Customer Portal</a>
    </div>
    <button class="hamburger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>`;

const pageHeaderHTML = `<header class="site-header">
  <div class="container nav">
    <a href="../index.html" class="brand">
      <img src="../assets/images/icons/logo.svg" alt="Grand Palace crest" class="brand-mark">
      <span class="brand-name">Grand Palace</span>
    </a>
    <ul class="nav-links">
      <li class="nav-dropdown">
        <a href="../index.html">Home ▾</a>
        <div class="dropdown-panel">
          <a href="../index.html">Home — Classic</a>
          <a href="home-2.html">Home — Premium</a>
        </div>
      </li>
      <li><a href="about.html">About</a></li>
      <li><a href="booking.html">Book Now</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="gallery.html">Gallery</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" data-theme-toggle title="Toggle Dark/Light Mode">🌙</button>
      <button class="icon-btn" data-rtl-toggle title="Toggle RTL Mode">🌐</button>
      <a href="dashboard.html" class="btn btn-primary btn-sm">Customer Portal</a>
    </div>
    <button class="hamburger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>`;

function updateHeader(filePath, isRoot = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  const headerRegex = /<header class="site-header">[\s\S]*?<\/header>/i;
  if (headerRegex.test(content)) {
    const newHeader = isRoot ? rootHeaderHTML : pageHeaderHTML;
    content = content.replace(headerRegex, newHeader);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated header in ${path.basename(filePath)}`);
  }
}

// 1. Root index.html
updateHeader(path.join(rootDir, 'index.html'), true);

// 2. All files in pages/
const files = fs.readdirSync(pagesDir);
files.forEach(file => {
  if (file.endsWith('.html') && file !== 'coming-soon.html' && file !== '404.html') {
    updateHeader(path.join(pagesDir, file), false);
  }
});

console.log('Header update with Home dropdown completed successfully!');
