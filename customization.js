// Customization Handler for Lyric Video Generator
// Handles all custom settings and live preview

class CustomizationManager {
    constructor() {
        this.settings = this.getDefaultSettings();
        this.initializeControls();
        this.loadSavedCustomization();
    }

    getDefaultSettings() {
        return {
            // Font
            fontFamily: 'Poppins',
            fontSize: 80,
            fontWeight: '700',

            // Colors
            textColor: '#ffffff',
            glowColor: '#FFD700',
            glowIntensity: 40,
            outlineColor: '#000000',
            outlineWidth: 4,

            // Animation
            animationIn: 'fadeIn',
            animationOut: 'fadeOut',
            animationSpeed: 0.6,

            // Position
            posX: 50,
            posY: 50,
            textAlign: 'center',

            // Effects
            enableShadow: true,
            shadowBlur: 30,
            enableBackground: false,
            bgOpacity: 0.5,
            letterSpacing: 2
        };
    }

    initializeControls() {
        // Font controls
        this.fontFamily = document.getElementById('fontFamily');
        this.fontSize = document.getElementById('fontSize');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.fontWeight = document.getElementById('fontWeight');

        // Color controls
        this.textColor = document.getElementById('textColor');
        this.glowColor = document.getElementById('glowColor');
        this.glowIntensity = document.getElementById('glowIntensity');
        this.glowIntensityValue = document.getElementById('glowIntensityValue');
        this.outlineColor = document.getElementById('outlineColor');
        this.outlineWidth = document.getElementById('outlineWidth');
        this.outlineWidthValue = document.getElementById('outlineWidthValue');

        // Animation controls
        this.animationIn = document.getElementById('animationIn');
        this.animationOut = document.getElementById('animationOut');
        this.animationSpeed = document.getElementById('animationSpeed');
        this.animationSpeedValue = document.getElementById('animationSpeedValue');

        // Position controls
        this.posX = document.getElementById('posX');
        this.posXValue = document.getElementById('posXValue');
        this.posY = document.getElementById('posY');
        this.posYValue = document.getElementById('posYValue');
        this.textAlign = document.getElementById('textAlign');

        // Effects controls
        this.enableShadow = document.getElementById('enableShadow');
        this.shadowBlur = document.getElementById('shadowBlur');
        this.shadowBlurValue = document.getElementById('shadowBlurValue');
        this.enableBackground = document.getElementById('enableBackground');
        this.bgOpacity = document.getElementById('bgOpacity');
        this.bgOpacityValue = document.getElementById('bgOpacityValue');
        this.letterSpacing = document.getElementById('letterSpacing');
        this.letterSpacingValue = document.getElementById('letterSpacingValue');

        // Preview
        this.previewText = document.getElementById('previewText');
        this.resetButton = document.getElementById('resetSettings');

        // Custom Font
        this.customFontUpload = document.getElementById('customFontUpload');
        this.customFontNameDisplay = document.getElementById('customFontName');

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Font
        this.fontFamily.addEventListener('change', () => this.updatePreview());
        this.fontSize.addEventListener('input', (e) => {
            this.fontSizeValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        this.fontWeight.addEventListener('change', () => this.updatePreview());

        // Colors
        this.textColor.addEventListener('input', () => this.updatePreview());
        this.glowColor.addEventListener('input', () => this.updatePreview());
        this.glowIntensity.addEventListener('input', (e) => {
            this.glowIntensityValue.textContent = e.target.value;
            this.updatePreview();
        });
        this.outlineColor.addEventListener('input', () => this.updatePreview());
        this.outlineWidth.addEventListener('input', (e) => {
            this.outlineWidthValue.textContent = e.target.value;
            this.updatePreview();
        });

        // Animation
        this.animationIn.addEventListener('change', () => this.updatePreview());
        this.animationOut.addEventListener('change', () => this.updatePreview());
        this.animationSpeed.addEventListener('input', (e) => {
            this.animationSpeedValue.textContent = e.target.value + 's';
            this.updatePreview();
        });

        // Position
        this.posX.addEventListener('input', (e) => {
            this.posXValue.textContent = e.target.value + '%';
            this.updatePreview();
        });
        this.posY.addEventListener('input', (e) => {
            this.posYValue.textContent = e.target.value + '%';
            this.updatePreview();
        });
        this.textAlign.addEventListener('change', () => this.updatePreview());

        // Effects
        this.enableShadow.addEventListener('change', () => this.updatePreview());
        this.shadowBlur.addEventListener('input', (e) => {
            this.shadowBlurValue.textContent = e.target.value;
            this.updatePreview();
        });
        this.enableBackground.addEventListener('change', () => this.updatePreview());
        this.bgOpacity.addEventListener('input', (e) => {
            this.bgOpacityValue.textContent = e.target.value;
            this.updatePreview();
        });
        this.letterSpacing.addEventListener('input', (e) => {
            this.letterSpacingValue.textContent = e.target.value;
            this.updatePreview();
        });

        // Reset button
        this.resetButton.addEventListener('click', () => this.resetToDefaults());

        // Custom Font Upload
        if (this.customFontUpload) {
            this.customFontUpload.addEventListener('change', (e) => this.handleCustomFontUpload(e));
        }
    }

    async handleCustomFontUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fontName = file.name.split('.')[0]; // remove extension
        const fontFormat = file.name.endsWith('.woff2') ? 'woff2' :
            file.name.endsWith('.woff') ? 'woff' : 'truetype';

        try {
            console.log(`Loading custom font: ${fontName}...`);
            const arrayBuffer = await file.arrayBuffer();
            const fontFace = new FontFace(fontName, arrayBuffer);

            await fontFace.load();
            document.fonts.add(fontFace);

            console.log('✅ Custom font loaded!');

            // Add to dropdown
            const option = document.createElement('option');
            option.value = fontName;
            option.textContent = `${fontName} (Custom) ✨`;
            this.fontFamily.add(option, this.fontFamily.options[0]); // Add to top

            // Select it
            this.fontFamily.value = fontName;

            // Update UI
            this.customFontNameDisplay.textContent = `Active: ${fontName}`;
            this.customFontNameDisplay.style.display = 'block';

            // Trigger update
            this.updatePreview();

        } catch (error) {
            console.error('Failed to load custom font:', error);
            alert('Error loading font: ' + error.message);
        }
    }

    updatePreview() {
        const settings = this.getCurrentSettings();

        // Apply font
        this.previewText.style.fontFamily = settings.fontFamily;
        this.previewText.style.fontSize = (settings.fontSize / 2) + 'px'; // Scale down for preview
        this.previewText.style.fontWeight = settings.fontWeight;

        // Apply colors
        this.previewText.style.color = settings.textColor;

        // Apply glow
        let shadows = [];
        if (settings.glowIntensity > 0) {
            const glowSize = settings.glowIntensity;
            shadows.push(`0 0 ${glowSize}px ${settings.glowColor}`);
            shadows.push(`0 0 ${glowSize * 2}px ${settings.glowColor}`);
        }

        // Apply shadow
        if (settings.enableShadow && settings.shadowBlur > 0) {
            shadows.push(`0 ${settings.shadowBlur / 10}px ${settings.shadowBlur}px rgba(0,0,0,0.8)`);
        }

        this.previewText.style.textShadow = shadows.join(', ');

        // Apply outline
        if (settings.outlineWidth > 0) {
            this.previewText.style.webkitTextStroke = `${settings.outlineWidth}px ${settings.outlineColor}`;
        } else {
            this.previewText.style.webkitTextStroke = 'none';
        }

        // Apply alignment
        this.previewText.style.textAlign = settings.textAlign;

        // Apply letter spacing
        this.previewText.style.letterSpacing = settings.letterSpacing + 'px';

        // Apply background
        if (settings.enableBackground) {
            this.previewText.style.backgroundColor = `rgba(0,0,0,${settings.bgOpacity})`;
            this.previewText.style.padding = '1rem 2rem';
            this.previewText.style.borderRadius = '8px';
        } else {
            this.previewText.style.backgroundColor = 'transparent';
            this.previewText.style.padding = '1rem';
        }

        // Save settings
        this.saveCustomization();
    }

    getCurrentSettings() {
        return {
            fontFamily: this.fontFamily.value,
            fontSize: parseInt(this.fontSize.value),
            fontWeight: this.fontWeight.value,
            textColor: this.textColor.value,
            glowColor: this.glowColor.value,
            glowIntensity: parseInt(this.glowIntensity.value),
            outlineColor: this.outlineColor.value,
            outlineWidth: parseInt(this.outlineWidth.value),
            animationIn: this.animationIn.value,
            animationOut: this.animationOut.value,
            animationSpeed: parseFloat(this.animationSpeed.value),
            posX: parseInt(this.posX.value),
            posY: parseInt(this.posY.value),
            textAlign: this.textAlign.value,
            enableShadow: this.enableShadow.checked,
            shadowBlur: parseInt(this.shadowBlur.value),
            enableBackground: this.enableBackground.checked,
            bgOpacity: parseFloat(this.bgOpacity.value),
            letterSpacing: parseInt(this.letterSpacing.value)
        };
    }

    resetToDefaults() {
        const defaults = this.getDefaultSettings();

        // Font
        this.fontFamily.value = defaults.fontFamily;
        this.fontSize.value = defaults.fontSize;
        this.fontSizeValue.textContent = defaults.fontSize + 'px';
        this.fontWeight.value = defaults.fontWeight;

        // Colors
        this.textColor.value = defaults.textColor;
        this.glowColor.value = defaults.glowColor;
        this.glowIntensity.value = defaults.glowIntensity;
        this.glowIntensityValue.textContent = defaults.glowIntensity;
        this.outlineColor.value = defaults.outlineColor;
        this.outlineWidth.value = defaults.outlineWidth;
        this.outlineWidthValue.textContent = defaults.outlineWidth;

        // Animation
        this.animationIn.value = defaults.animationIn;
        this.animationOut.value = defaults.animationOut;
        this.animationSpeed.value = defaults.animationSpeed;
        this.animationSpeedValue.textContent = defaults.animationSpeed + 's';

        // Position
        this.posX.value = defaults.posX;
        this.posXValue.textContent = defaults.posX + '%';
        this.posY.value = defaults.posY;
        this.posYValue.textContent = defaults.posY + '%';
        this.textAlign.value = defaults.textAlign;

        // Effects
        this.enableShadow.checked = defaults.enableShadow;
        this.shadowBlur.value = defaults.shadowBlur;
        this.shadowBlurValue.textContent = defaults.shadowBlur;
        this.enableBackground.checked = defaults.enableBackground;
        this.bgOpacity.value = defaults.bgOpacity;
        this.bgOpacityValue.textContent = defaults.bgOpacity;
        this.letterSpacing.value = defaults.letterSpacing;
        this.letterSpacingValue.textContent = defaults.letterSpacing;

        this.updatePreview();
    }

    saveCustomization() {
        const settings = this.getCurrentSettings();
        localStorage.setItem('customization', JSON.stringify(settings));
    }

    loadSavedCustomization() {
        const saved = localStorage.getItem('customization');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.applySettings(settings);
            } catch (e) {
                console.error('Failed to load saved customization:', e);
            }
        }
    }

    applySettings(settings) {
        // Font
        if (settings.fontFamily) this.fontFamily.value = settings.fontFamily;
        if (settings.fontSize) {
            this.fontSize.value = settings.fontSize;
            this.fontSizeValue.textContent = settings.fontSize + 'px';
        }
        if (settings.fontWeight) this.fontWeight.value = settings.fontWeight;

        // Colors
        if (settings.textColor) this.textColor.value = settings.textColor;
        if (settings.glowColor) this.glowColor.value = settings.glowColor;
        if (settings.glowIntensity !== undefined) {
            this.glowIntensity.value = settings.glowIntensity;
            this.glowIntensityValue.textContent = settings.glowIntensity;
        }
        if (settings.outlineColor) this.outlineColor.value = settings.outlineColor;
        if (settings.outlineWidth !== undefined) {
            this.outlineWidth.value = settings.outlineWidth;
            this.outlineWidthValue.textContent = settings.outlineWidth;
        }

        // Animation
        if (settings.animationIn) this.animationIn.value = settings.animationIn;
        if (settings.animationOut) this.animationOut.value = settings.animationOut;
        if (settings.animationSpeed) {
            this.animationSpeed.value = settings.animationSpeed;
            this.animationSpeedValue.textContent = settings.animationSpeed + 's';
        }

        // Position
        if (settings.posX !== undefined) {
            this.posX.value = settings.posX;
            this.posXValue.textContent = settings.posX + '%';
        }
        if (settings.posY !== undefined) {
            this.posY.value = settings.posY;
            this.posYValue.textContent = settings.posY + '%';
        }
        if (settings.textAlign) this.textAlign.value = settings.textAlign;

        // Effects
        if (settings.enableShadow !== undefined) this.enableShadow.checked = settings.enableShadow;
        if (settings.shadowBlur !== undefined) {
            this.shadowBlur.value = settings.shadowBlur;
            this.shadowBlurValue.textContent = settings.shadowBlur;
        }
        if (settings.enableBackground !== undefined) this.enableBackground.checked = settings.enableBackground;
        if (settings.bgOpacity !== undefined) {
            this.bgOpacity.value = settings.bgOpacity;
            this.bgOpacityValue.textContent = settings.bgOpacity;
        }
        if (settings.letterSpacing !== undefined) {
            this.letterSpacing.value = settings.letterSpacing;
            this.letterSpacingValue.textContent = settings.letterSpacing;
        }

        this.updatePreview();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.customizationManager = new CustomizationManager();
    });
} else {
    window.customizationManager = new CustomizationManager();
}
