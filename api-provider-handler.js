// API Provider Handler
// Manages switching between Local Docker and Groq API

document.addEventListener('DOMContentLoaded', () => {
    const apiProvider = document.getElementById('apiProvider');
    const apiKeySection = document.getElementById('apiKeySection');
    const apiKeyInput = document.getElementById('apiKeyInput');

    // Handle API provider change
    if (apiProvider) {
        // FORCE Groq API as default
        apiProvider.value = 'groq';
        console.log('✅ Set API Provider to Groq API');

        apiProvider.addEventListener('change', () => {
            const provider = apiProvider.value;
            console.log('📝 API Provider changed to:', provider);

            if (provider === 'local') {
                // Hide API key input for local Docker
                apiKeySection.style.display = 'none';
            } else {
                // Show API key input for external APIs
                apiKeySection.style.display = 'block';
            }
        });

        // Trigger initial state
        apiProvider.dispatchEvent(new Event('change'));
    }

    // Save API key to localStorage
    if (apiKeyInput) {
        // Load saved API key
        const savedKey = localStorage.getItem('groqApiKey');
        if (savedKey) {
            apiKeyInput.value = savedKey;
            console.log('🔑 Loaded saved Groq API key:', savedKey.substring(0, 10) + '...');
        } else {
            console.log('ℹ️ No saved API key found - please paste yours!');
        }

        // Save on change
        apiKeyInput.addEventListener('change', () => {
            localStorage.setItem('groqApiKey', apiKeyInput.value);
            console.log('💾 Saved Groq API key');
        });

        // Also save on input (real-time)
        apiKeyInput.addEventListener('input', () => {
            localStorage.setItem('groqApiKey', apiKeyInput.value);
        });
    }
});

// Override the sync function to use the selected API
if (typeof window !== 'undefined') {
    window.getAPIConfig = function () {
        const apiProvider = document.getElementById('apiProvider');
        const apiKeyInput = document.getElementById('apiKeyInput');

        return {
            provider: apiProvider?.value || 'groq',
            apiKey: apiKeyInput?.value || ''
        };
    };
}

console.log('🔑 API Provider Handler loaded');
