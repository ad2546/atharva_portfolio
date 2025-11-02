const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Viewport configurations
const viewports = [
  { name: 'Mobile-iPhone-SE', width: 375, height: 667, description: 'iPhone SE' },
  { name: 'Mobile-iPhone-11-Pro', width: 414, height: 896, description: 'iPhone 11 Pro' },
  { name: 'Tablet-iPad', width: 768, height: 1024, description: 'iPad' },
  { name: 'Desktop', width: 1920, height: 1080, description: 'Desktop' }
];

// Elements to check
const elementsToCheck = [
  { name: 'Navigation Bar', selector: 'nav' },
  { name: 'Mobile Menu Button', selector: '#mobile-menu-btn' },
  { name: 'Hero Section', selector: 'section.gradient-hero' },
  { name: 'Hero Title', selector: '.hero-text' },
  { name: 'Hero Buttons', selector: 'section.gradient-hero a' },
  { name: 'About Section', selector: '#about' },
  { name: 'Skills Grid', selector: '#about .grid' },
  { name: 'Journey Section', selector: '#journey' },
  { name: 'Timeline Items', selector: '.timeline-item' },
  { name: 'Timeline Line', selector: '.timeline-line' },
  { name: 'Projects Section', selector: '#projects' },
  { name: 'Project Cards Grid', selector: '#projects .grid' },
  { name: 'Footer', selector: 'footer' }
];

async function testResponsiveness() {
  console.log('Starting responsiveness testing...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load the HTML file
  const htmlPath = `file://${path.resolve(__dirname, 'index.html')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const report = {
    timestamp: new Date().toISOString(),
    results: []
  };

  // Test each viewport
  for (const viewport of viewports) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    console.log('='.repeat(60));

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500); // Allow time for responsive adjustments

    const viewportReport = {
      viewport: viewport.name,
      dimensions: `${viewport.width}x${viewport.height}`,
      description: viewport.description,
      issues: [],
      elementChecks: []
    };

    // Take full page screenshot
    const screenshotPath = path.join(screenshotsDir, `${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    // Check each element
    for (const element of elementsToCheck) {
      try {
        const locator = page.locator(element.selector).first();
        const isVisible = await locator.isVisible({ timeout: 5000 });

        if (isVisible) {
          const box = await locator.boundingBox();
          const computedStyle = await locator.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              overflow: style.overflow,
              width: style.width,
              height: style.height
            };
          });

          const elementCheck = {
            name: element.name,
            visible: true,
            boundingBox: box,
            computedStyle
          };

          viewportReport.elementChecks.push(elementCheck);

          // Check for potential issues

          // 1. Check if element extends beyond viewport
          if (box && box.x + box.width > viewport.width) {
            const issue = `${element.name} extends beyond viewport width (${Math.round(box.x + box.width)}px > ${viewport.width}px)`;
            viewportReport.issues.push(issue);
            console.log(`⚠️  ${issue}`);
          }

          // 2. Check for very small clickable elements on mobile
          if (viewport.width < 768 && element.selector.includes('a, button')) {
            if (box && (box.width < 44 || box.height < 44)) {
              const issue = `${element.name} may be too small for touch (${Math.round(box.width)}x${Math.round(box.height)}px, recommended 44x44px)`;
              viewportReport.issues.push(issue);
              console.log(`⚠️  ${issue}`);
            }
          }

          console.log(`✓ ${element.name}: visible (${Math.round(box?.width || 0)}x${Math.round(box?.height || 0)}px)`);
        } else {
          viewportReport.elementChecks.push({
            name: element.name,
            visible: false
          });

          // Check if it's expected to be hidden on certain viewports
          if (element.name === 'Mobile Menu Button' && viewport.width >= 768) {
            console.log(`✓ ${element.name}: correctly hidden on desktop`);
          } else if (element.name === 'Timeline Line' && viewport.width < 768) {
            console.log(`✓ ${element.name}: correctly hidden on mobile`);
          } else {
            console.log(`⚠️  ${element.name}: not visible`);
          }
        }
      } catch (error) {
        viewportReport.elementChecks.push({
          name: element.name,
          error: error.message
        });
        console.log(`❌ ${element.name}: error - ${error.message}`);
      }
    }

    // Check for text overflow in key sections
    try {
      const textElements = await page.locator('.hero-text, .section-title, h3, h4, p').all();
      for (const el of textElements) {
        const isOverflowing = await el.evaluate(element => {
          return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
        });

        if (isOverflowing) {
          const tagName = await el.evaluate(el => el.tagName);
          const textContent = await el.textContent();
          const preview = textContent?.substring(0, 50) + '...';
          const issue = `Text overflow detected in ${tagName}: "${preview}"`;
          viewportReport.issues.push(issue);
          console.log(`⚠️  ${issue}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not check text overflow: ${error.message}`);
    }

    // Check navigation visibility and layout
    try {
      const nav = page.locator('nav').first();
      const navBox = await nav.boundingBox();
      const navLinks = page.locator('nav .nav-link');
      const navLinksCount = await navLinks.count();

      console.log(`\nNavigation Analysis:`);
      console.log(`  - Nav bar height: ${Math.round(navBox?.height || 0)}px`);
      console.log(`  - Desktop nav links visible: ${navLinksCount > 0 ? 'Yes' : 'No'}`);

      if (viewport.width < 768) {
        const mobileMenuBtn = page.locator('#mobile-menu-btn');
        const isMobileMenuBtnVisible = await mobileMenuBtn.isVisible();
        console.log(`  - Mobile menu button: ${isMobileMenuBtnVisible ? 'Visible' : 'Hidden'}`);

        if (!isMobileMenuBtnVisible) {
          viewportReport.issues.push('Mobile menu button not visible on mobile viewport');
        }
      }
    } catch (error) {
      console.log(`⚠️  Navigation analysis error: ${error.message}`);
    }

    // Check project cards grid layout
    try {
      const projectCards = await page.locator('#projects .grid > div').all();
      console.log(`\nProjects Grid:`);
      console.log(`  - Number of project cards: ${projectCards.length}`);

      if (projectCards.length > 0) {
        const firstCard = projectCards[0];
        const lastCard = projectCards[projectCards.length - 1];

        const firstBox = await firstCard.boundingBox();
        const lastBox = await lastCard.boundingBox();

        // Check if cards are laid out in columns
        if (firstBox && lastBox) {
          const sameRow = Math.abs(firstBox.y - lastBox.y) < 50;
          const expectedColumns = viewport.width >= 1024 ? 3 : viewport.width >= 768 ? 2 : 1;

          console.log(`  - Expected columns: ${expectedColumns}`);
          console.log(`  - Card width: ${Math.round(firstBox.width)}px`);

          // Check if cards fit within viewport
          if (firstBox.x + firstBox.width > viewport.width) {
            viewportReport.issues.push('Project cards extend beyond viewport width');
          }
        }
      }
    } catch (error) {
      console.log(`⚠️  Projects grid analysis error: ${error.message}`);
    }

    // Check timeline layout
    try {
      const timelineItems = await page.locator('.timeline-item').all();
      console.log(`\nTimeline:`);
      console.log(`  - Timeline items: ${timelineItems.length}`);

      if (timelineItems.length > 0 && viewport.width < 768) {
        const firstItem = timelineItems[0];
        const itemBox = await firstItem.boundingBox();

        if (itemBox && itemBox.x + itemBox.width > viewport.width) {
          viewportReport.issues.push('Timeline items extend beyond mobile viewport');
        }
      }
    } catch (error) {
      console.log(`⚠️  Timeline analysis error: ${error.message}`);
    }

    // Summary for this viewport
    console.log(`\n${viewport.name} Summary:`);
    if (viewportReport.issues.length === 0) {
      console.log('✅ No responsiveness issues detected');
    } else {
      console.log(`⚠️  Found ${viewportReport.issues.length} potential issues`);
    }

    report.results.push(viewportReport);
  }

  await browser.close();

  // Generate final report
  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESPONSIVENESS REPORT');
  console.log('='.repeat(60));

  for (const result of report.results) {
    console.log(`\n${result.viewport} (${result.dimensions}):`);
    if (result.issues.length === 0) {
      console.log('  ✅ All checks passed');
    } else {
      console.log(`  ⚠️  ${result.issues.length} issues found:`);
      result.issues.forEach((issue, i) => {
        console.log(`    ${i + 1}. ${issue}`);
      });
    }
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'responsiveness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  console.log(`📸 Screenshots saved to: ${screenshotsDir}/`);

  // Generate recommendations
  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));

  const allIssues = report.results.flatMap(r => r.issues);
  const uniqueIssues = [...new Set(allIssues)];

  if (uniqueIssues.length === 0) {
    console.log('✅ Your portfolio appears to be fully responsive across all tested viewports!');
  } else {
    console.log('\nBased on the issues found, here are recommendations:\n');

    uniqueIssues.forEach((issue, i) => {
      console.log(`${i + 1}. ${issue}`);

      if (issue.includes('extends beyond viewport')) {
        console.log('   → Add responsive max-width or use overflow-x: hidden');
        console.log('   → Consider using flexbox/grid with responsive breakpoints\n');
      } else if (issue.includes('too small for touch')) {
        console.log('   → Increase minimum tap target size to 44x44px');
        console.log('   → Add padding to increase clickable area\n');
      } else if (issue.includes('Text overflow')) {
        console.log('   → Add text-overflow: ellipsis and overflow: hidden');
        console.log('   → Use responsive font sizes with clamp()\n');
      } else if (issue.includes('Mobile menu button not visible')) {
        console.log('   → Check media query breakpoints for mobile menu');
        console.log('   → Ensure md:hidden class is working correctly\n');
      }
    });
  }

  console.log('\n✨ Testing complete!\n');
}

// Run the tests
testResponsiveness().catch(console.error);
