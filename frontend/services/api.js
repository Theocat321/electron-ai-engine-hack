// API service for communicating with FastAPI backend
class APIService {
    constructor(baseURL = 'http://localhost:8000') {
        this.baseURL = baseURL;
    }

    /**
     * Initialize a new session with screenshot and user query
     * @param {string} userQuery - The user's request/goal
     * @param {string} screenshotBase64 - Base64 encoded screenshot
     * @returns {Promise<Object>} Response with task, coordinates, and description
     */
    async initialize(userQuery, screenshotBase64) {
        try {
            const response = await fetch(`${this.baseURL}/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_query: userQuery,
                    screenshot_base64: screenshotBase64
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error initializing session:', error);
            throw error;
        }
    }

    /**
     * Update screenshot and get next task
     * @param {string} screenshotBase64 - Base64 encoded screenshot
     * @returns {Promise<Object>} Response with next task, coordinates, and description
     */
    async updateScreenshot(screenshotBase64) {
        try {
            const response = await fetch(`${this.baseURL}/update_screenshot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    screenshot_base64: screenshotBase64
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating screenshot:', error);
            throw error;
        }
    }

    /**
     * Get current session status
     * @returns {Promise<Object>} Current session status
     */
    async getStatus() {
        try {
            const response = await fetch(`${this.baseURL}/status`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting status:', error);
            throw error;
        }
    }

    /**
     * Reset current session
     * @returns {Promise<Object>} Reset confirmation
     */
    async reset() {
        try {
            const response = await fetch(`${this.baseURL}/reset`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error resetting session:', error);
            throw error;
        }
    }

    /**
     * Health check
     * @returns {Promise<Object>} Health status
     */
    async health() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking health:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService;