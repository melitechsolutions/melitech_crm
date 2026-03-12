# Professional Document Template Guide

## Overview

This guide explains how to use the professional document template for all Melitech Solutions app documentation and reports. The template ensures consistent, professional formatting with print-persistent styling based on the Jito Glasswork invoice design.

## Files Included

- **`styles/document-professional-template.css`** - Master stylesheet with print media queries
- **`templates/document-template.html`** - HTML template for document structure
- **`DOCUMENT_TEMPLATE_GUIDE.md`** - This guide

## Design Principles

The template implements the following design elements from the professional invoice:

### Color Scheme
```css
Primary Color: #ff9f43 (Orange)
Dark Text: #2d3436 (Dark Gray)
Secondary Text: #636e72 (Medium Gray)
Light Background: #f8f9fa (Off-White)
Border Color: #dfe6e9 (Light Gray)
```

### Typography
- **Headlines**: Bold, uppercase, letter-spaced
- **Body Text**: Clean sans-serif, 14px base size
- **Metadata**: Uppercase labels with larger values
- **Tables**: Professional grid with orange accents

### Layout Structure
1. **Header Section**: Company branding with logo and contact info
2. **Document Title**: Large, bold heading
3. **Metadata Section**: Key document information (number, date, etc.)
4. **Content Sections**: Flexible layouts (single, two-column, three-column)
5. **Tables**: Professional item listings with summary rows
6. **Footer**: Contact information and notes

## CSS Classes Reference

### Container Classes

```html
<!-- Main document container -->
<div class="document-container">
  <!-- or -->
  <div class="professional-document">
```

### Header & Branding

```html
<div class="document-header">
  <div class="company-info">
    <h1 class="company-name">Company Name</h1>
    <p class="company-tagline">Tagline</p>
    <div class="company-contact">
      <div class="company-contact-item">Address</div>
      <div class="company-contact-item">Phone</div>
    </div>
  </div>
  <div class="company-logo">
    <img src="logo.png" alt="Logo">
  </div>
</div>
```

### Document Metadata

```html
<div class="document-meta">
  <div class="meta-item">
    <span class="meta-label">Invoice #</span>
    <span class="meta-value">00001</span>
  </div>
  <div class="meta-item">
    <span class="meta-label">Date</span>
    <span class="meta-value">29 Jan 2025</span>
  </div>
</div>
```

### Sections

```html
<div class="section">
  <h2 class="section-title">Section Title</h2>
  <div class="section-content">
    <!-- Content here -->
  </div>
</div>
```

### Layout Options

```html
<!-- Two Column Layout -->
<div class="two-column">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Three Column Layout -->
<div class="three-column">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Info Boxes

```html
<div class="info-box">
  <div class="info-label">Label</div>
  <div class="info-value">Value</div>
</div>
```

### Highlight Boxes

```html
<div class="highlight-box">
  <div class="highlight-label">Total Due</div>
  <div class="highlight-value">KES 14,250.00</div>
</div>
```

### Tables

```html
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
      <th>Column 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td>Data</td>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

### Footer

```html
<div class="document-footer">
  <div class="contact-info">
    <div class="contact-block">
      <span class="contact-label">Company</span>
      <span class="contact-detail">Address</span>
      <span class="contact-detail">Phone</span>
    </div>
  </div>
  <div class="footer-note">
    Additional contact information...
  </div>
</div>
```

### Badges & Tags

```html
<span class="badge">Default</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
```

## Print-Persistent Features

### Automatic Print Formatting

The stylesheet includes `@media print` rules that:

1. **Preserve Colors**: Uses `print-color-adjust: exact` to maintain branding colors
2. **Prevent Orphans/Widows**: Keeps text together for readability
3. **Page Breaks**: Generates appropriate page breaks for tables and sections
4. **Remove Shadows**: Eliminates visual effects that don't print well
5. **Hide UI Elements**: Removes buttons and non-document elements via `.no-print` class

### Hiding Elements in Print

```html
<!-- This element will be hidden when printing -->
<button class="no-print">Print Document</button>

<!-- This content will always print -->
<div class="page-break">
  <!-- Forces page break here -->
</div>

<!-- This keeps table together on one page -->
<table class="no-page-break">
  ...
</table>
```

## Responsive Design

The template is responsive with breakpoints:

- **Desktop** (> 768px): Full two/three column layouts
- **Tablet** (768px - 481px): Single column layouts
- **Mobile** (< 480px): Optimized font sizes and spacing

All layouts automatically adjust for print media.

## Implementation Examples

### Example 1: Invoice Document

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles/document-professional-template.css">
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <!-- See Header section above -->
    </div>
    
    <h1 class="document-title">INVOICE</h1>
    
    <div class="document-meta">
      <div class="meta-item">
        <span class="meta-label">Invoice #</span>
        <span class="meta-value">0001</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">29 Jan 2025</span>
      </div>
    </div>
    
    <!-- Table with items -->
    <table>
      <!-- See table example above -->
    </table>
    
    <!-- Highlight total -->
    <div class="highlight-box">
      <div class="highlight-label">Amount Due</div>
      <div class="highlight-value">KES 14,250.00</div>
    </div>
    
    <!-- Footer with contact info -->
    <div class="document-footer">
      <!-- See footer example above -->
    </div>
  </div>
</body>
</html>
```

### Example 2: Report Document

```html
<div class="document-container">
  <div class="document-header"><!-- Header --></div>
  
  <h1 class="document-title">QUARTERLY REPORT</h1>
  
  <div class="document-meta">
    <div class="meta-item">
      <span class="meta-label">Period</span>
      <span class="meta-value">Q1 2025</span>
    </div>
  </div>
  
  <div class="section">
    <h2 class="section-title">Executive Summary</h2>
    <p>Report content here...</p>
  </div>
  
  <div class="section">
    <h2 class="section-title">Key Metrics</h2>
    <table><!-- Metrics table --></table>
  </div>
</div>
```

## CSS Variables

Customize the template by overriding CSS variables:

```css
:root {
  --primary-color: #ff9f43;        /* Orange accent */
  --primary-dark: #2d3436;         /* Dark text */
  --secondary-color: #636e72;      /* Secondary text */
  --border-color: #dfe6e9;         /* Borders */
  --text-color: #2d3436;           /* Body text */
  --light-bg: #f8f9fa;             /* Light backgrounds */
  --accent-orange: #ff9f43;        /* Orange accent */
  --spacing-unit: 8px;             /* Base spacing */
}
```

## Print Testing Checklist

- [ ] Colors print correctly
- [ ] Tables stay on single page when possible
- [ ] Headers appear on each page
- [ ] Margins are appropriate
- [ ] No content cuts off
- [ ] Page breaks are clean
- [ ] Print preview shows same as screen

## Browser Support

The template works in:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Print rendering tested in all modern browsers

## Customization

### Change Primary Color

```css
:root {
  --primary-color: #your-color;
  --accent-orange: #your-color;
}
```

### Add Custom Logo

```html
<div class="company-logo">
  <img src="/path/to/your/logo.png" alt="Company Logo">
</div>
```

### Modify Spacing

```css
:root {
  --spacing-unit: 10px; /* Increase from 8px */
}
```

## Integration with App Documents

To apply this template to your app documentation:

1. **Copy CSS**: Include `document-professional-template.css` in your HTML head
2. **Wrap Content**: Wrap your document in `.document-container` class
3. **Use Classes**: Apply appropriate CSS classes to sections
4. **Test Print**: Verify print preview (Ctrl+P or Cmd+P)

## Troubleshooting

### Colors Don't Print

Make sure CSS has:
```css
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
```

### Tables Break Across Pages

Use:
```html
<table class="no-page-break">
  <!-- Table content -->
</table>
```

### Print Looks Different

- Check print preview vs. screen
- Verify CSS media queries are applied
- Ensure no JavaScript modifies styles
- Test in different browsers

## Support & Updates

For questions or updates to the template, refer to:
- `styles/document-professional-template.css` - Full stylesheet
- `templates/document-template.html` - HTML structure reference
- Print directly from browser for consistent results

---

**Version**: 1.0.0  
**Last Updated**: January 29, 2025  
**Maintained By**: Melitech Solutions Development Team
