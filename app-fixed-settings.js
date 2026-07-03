// AUTO-LOAD SAVED SETTINGS (language, resolution)
function loadSavedSettings() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) languageSelect.value = savedLanguage;

    const savedResolution = localStorage.getItem('resolution');
    if (savedResolution) {
        resolutionSelect.value = savedResolution;
        renderer.setResolution(savedResolution);
    }

    // FORCE GROQ API
    apiProvider.value = 'groq';
    apiKeySection.style.display = 'block';

    // Load saved API key
    const savedApiKey = localStorage.getItem('groqApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        console.log('✅ Loaded saved Groq API key');
    } else {
        apiKeyInput.value = '';
        localStorage.setItem('groqApiKey', apiKeyInput.value);
        console.log('⚠️ Please set your Groq API key in the UI');
    }
}

// AUTO-SAVE SETTINGS
function saveSettings() {
    localStorage.setItem('apiProvider', 'groq');
    localStorage.setItem('language', languageSelect.value);
    localStorage.setItem('resolution', resolutionSelect.value);
    if (apiKeyInput.value) {
        localStorage.setItem('groqApiKey', apiKeyInput.value);
    }
}

// Load settings on startup
loadSavedSettings();

// NO LONGER CHECK LOCAL AI - USE GROQ INSTEAD!
console.log('🚀 Using Groq API - No local server needed!');
