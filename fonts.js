// Google Fonts Integration
// Premium fonts for lyric videos

const GOOGLE_FONTS = {
    // Modern & Clean
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap',
    'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',

    // Stylish & Bold
    'Bebas Neue': 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&display=swap',
    'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&display=swap',
    'Anton': 'https://fonts.googleapis.com/css2?family=Anton&display=swap',

    // Elegant & Serif
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
    'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap',
    'Lora': 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap',

    // Handwriting & Script
    'Pacifico': 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    'Dancing Script': 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap',
    'Satisfy': 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',

    // Display & Decorative
    'Righteous': 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
    'Fredoka One': 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap',
    'Permanent Marker': 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap'
};

/**
 * Load a Google Font dynamically
 */
function loadGoogleFont(fontName) {
    if (!GOOGLE_FONTS[fontName]) {
        console.warn(`Font "${fontName}" not found in library`);
        return;
    }

    // Check if already loaded
    const existingLink = document.querySelector(`link[href="${GOOGLE_FONTS[fontName]}"]`);
    if (existingLink) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = GOOGLE_FONTS[fontName];
        link.onload = () => {
            console.log(`Loaded font: ${fontName}`);
            resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

/**
 * Load all fonts
 */
async function loadAllFonts() {
    const promises = Object.keys(GOOGLE_FONTS).map(font => loadGoogleFont(font));
    await Promise.all(promises);
    console.log('All fonts loaded!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GOOGLE_FONTS, loadGoogleFont, loadAllFonts };
}
