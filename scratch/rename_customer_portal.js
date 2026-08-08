const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\geeth\\OneDrive\\Desktop\\31\\Project_31';
const pagesDir = path.join(rootDir, 'pages');

function replaceCustomerPortal(filePath, isRoot = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Customer Portal text and links in headers and mobile panels
  const targetLink = isRoot ? 'pages/login.html' : 'login.html';
  
  // Replace header button
  content = content.replace(
    /<a href="[^"]*(?:dashboard|login)\.html" class="btn btn-primary btn-sm">Customer Portal<\/a>/gi,
    `<a href="${targetLink}" class="btn btn-primary btn-sm">Login</a>`
  );
  
  // Replace any other text instances of Customer Portal in navbar
  content = content.replace(
    />Customer Portal</g,
    `>Login<`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated Login button in ${path.basename(filePath)}`);
}

// 1. Root index.html
replaceCustomerPortal(path.join(rootDir, 'index.html'), true);

// 2. All files in pages/
const files = fs.readdirSync(pagesDir);
files.forEach(file => {
  if (file.endsWith('.html')) {
    replaceCustomerPortal(path.join(pagesDir, file), false);
  }
});

console.log('Renamed Customer Portal to Login across all pages successfully!');
