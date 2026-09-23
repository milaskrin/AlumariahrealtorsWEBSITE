# ALUMARIAH REALTORS — Premium Real Estate Website

A responsive HTML/CSS/JavaScript real-estate website for **ALUMARIAH REALTORS**.

## Included

- `index.html` — complete website structure
- `style.css` — premium responsive styling
- `script.js` — navigation, property gallery, WhatsApp enquiries and browser-based property upload
- `assets/` — the six fresh property photos supplied for the 2-bedroom Jacaranda/Thika Road listing

## Current Featured Property

**2 Bedroom Apartment — Distress Sale**
- Price: **KSh 8,000,000**
- Location: **Jacaranda, Thika Road**
- Gallery: six supplied photos

The old/poorly visible sample apartment images have been removed from the property listing. The featured listing uses the fresh photos supplied for this project.

## WhatsApp

All enquiry buttons use:

**+254 756 112 632**

The site opens a WhatsApp chat with a pre-filled enquiry message.

## How to run in VS Code

1. Open the `alumariah_realtors_premium_final` folder in VS Code.
2. Open `index.html`.
3. For the easiest development experience, install/use the **Live Server** extension in VS Code.
4. Right-click `index.html` → **Open with Live Server**.
5. Open the generated local address on your computer.
6. To test on Android while both devices are on the same Wi-Fi, use your computer's local network address if your Live Server/network firewall allows it.

The site is mobile-first/responsive and includes the viewport configuration and flexible layouts needed for phone, tablet and desktop screens.

## Adding More Properties

The site has an **Add Available Property** card.

It lets you:
- enter a title
- enter a location
- select sale/rent/lease
- enter a price
- add beds/units
- write a description
- upload multiple property photos
- publish the listing in the current browser

### Important limitation

This is a **front-end website**, so uploaded properties are stored in the visitor's browser using `localStorage`. They are not automatically uploaded to a shared online database.

For a production admin system where the realtor can log in from any phone/computer and manage listings globally, connect the front end to a backend/CMS such as Supabase, Firebase, WordPress, or another property-management backend.

## Internet Images

The "Modern Living Inspiration" section uses remote Unsplash image URLs. These are inspiration images and are **not presented as ALUMARIAH REALTORS listings**.

For a fully self-contained production website, download/licence approved images and place them in `assets/`, then replace those URLs in `index.html`.

## Branding / Contact Information

The current site uses the details already supplied for the project, including:
- ALUMARIAH REALTORS
- Your Property. Your Future. Our Expertise.
- Kenya service areas
- `alumariah22@gmail.com`
- `0721 557 592`
- WhatsApp: `+254 756 112 632`

Review every business detail before publishing publicly.

## Deployment

You can upload the folder to:
- GitHub Pages
- Netlify
- Vercel
- cPanel/shared hosting
- any standard static website host

For a production launch, also add:
- a real domain
- SSL/HTTPS
- favicon/logo files
- SEO/social metadata
- analytics
- a backend/CMS for property management
- optimized/compressed property images
