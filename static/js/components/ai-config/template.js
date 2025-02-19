export function getTemplate() {
    return `
        <div id="configModal" class="modal">
            <div class="modal-content">
                <h2>Configure AI Provider</h2>
                <form id="configForm">
                    <div class="form-group">
                        <label for="provider">Provider:</label>
                        <select id="provider" name="provider" required>
                            <option value="">Select a provider</option>
                            <option value="gemini">Google Gemini Flash 2.0</option>
                        </select>
                    </div>

                    <div class="api-key-section" id="apiKeySection">
                        <div class="api-key-instructions" id="apiKeyInstructions">
                            <!-- Instructions will be updated based on provider -->
                        </div>
                        <div class="form-group">
                            <label for="apiKey">API Key:</label>
                            <input type="password" id="apiKey" name="api_key" autocomplete="new-password" required>
                        </div>
                    </div>

                    <div class="form-buttons">
                        <button type="button" id="closeModal">Cancel</button>
                        <button type="submit">Validate and Save</button>
                    </div>
                    <div class="error-container" id="errorContainer"></div>
                    <div class="validating-message" id="validatingMessage">
                        <div class="spinner"></div>
                        <span>Validating API key...</span>
                    </div>
                </form>
            </div>
        </div>
    `;
}
