

  # AI Weather Agent

  This project is a Node.js-based AI-powered CLI agent that answers weather-related queries in natural language (English/Hindi mix). It uses Google Gemini for language understanding and WeatherAPI for weather data.

  ## Features

  - Extracts city/place and date from user queries (supports Hindi/English, relative and absolute dates)
  - Fetches current or historical weather data for multiple locations
  - Summarizes weather in a conversational style, mixing English and Hindi
  - CLI interface for easy interaction

  ## Setup

  1. **Clone the repository** and navigate to the project directory.

  2. **Install dependencies:**
    ```
    npm install @google/genai readline-sync node-fetch
    ```

  3. **Set your API keys:**
    - Replace the Google Gemini API key in the code.
    - Replace the WeatherAPI key in the code.

  4. **Run the agent:**
    ```
    node ai_agent.js
    ```

  ## Usage

  - Enter queries like:
    - `aaj delhi ka weather batao`
    - `kal mumbai aur parso pune ka mausam kaisa hai?`
    - `30 April 2025 ko Bangalore ka weather`

  - The agent will respond with a natural language weather summary.

  ## Notes

  - Requires Node.js v18+ (for native fetch support).
  - For educational/demo purposes only. Do not expose API keys in production.

  