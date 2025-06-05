const { GoogleGenAI } = require('@google/genai');
const readlineSync = require('readline-sync');

const ai = new GoogleGenAI({ apiKey: "   YOUR API KEY " });

const prompt = `
You are an AI agent that strictly responds in JSON format only.

Your task is to handle weather-related user queries.

When the user asks about weather:

1. Extract each city/place name mentioned.
2. Extract the corresponding date:
   - If the user says "aaj", "today", or similar → set date as "today"
   - If the user says "kal", "tomorrow" → set date as tomorrow (in YYYY-MM-DD)
   - If the user says "parso", "day after tomorrow" → set date as day after tomorrow (in YYYY-MM-DD)
   - If the user gives a specific date (e.g., 30 April, 2025) → convert to YYYY-MM-DD
   - If no date is given → assume "today"

Respond in one of two formats:

{
  "weather_details_needed": true,
  "location": [
    { "city": "city_1", "date": "today or YYYY-MM-DD" },
    { "city": "city_2", "date": "today or YYYY-MM-DD" }
  ]
}

OR

{
  "weather_details_needed": false,
  "weather_report": "Summarize the weather in natural language, mixing English and Hindi if appropriate."
}

Example 1:
User input: "bhai aaj delhi aur kal mumbai ka weather batao"
Response:
{
  "weather_details_needed": true,
  "location": [
    { "city": "delhi", "date": "today" },
    { "city": "mumbai", "date": "2025-06-06" }
  ]
}

Example 2:
Weather info has already been provided:
Response:
{
  "weather_details_needed": false,
  "weather_report": "Delhi mein aaj garmi hai aur Mumbai mein kal baarish hogi."
}
`;

const location = [];

async function main(userInput) {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [
      { role: "user", text: `${prompt}\nUser input: "${userInput}"` }
    ]
  });

  const input = response.candidates[0].content.parts;

  const rawText = input[0].text;
  const jsonString = rawText.replace(/```json|```/g, '').trim();

  const parsed = JSON.parse(jsonString);

  if (parsed.weather_details_needed && parsed.location) {
    parsed.location.forEach((loc) => {
      location.push(loc);
    });
  }

  return parsed; // You can return the whole parsed object if needed
}

const userName = readlineSync.question('Ask me the question about the weather: ');


// seting up the weather api 

const getweatherInfo = async (location) => {
  const weatherInfo = await Promise.all(location.map(async (val) => {
    if (val.date == 'today') {
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=67175f44341344d4a9593334250506&q=${val.city}&aqi=no`);
      const data = await response.json();
      return data;
    } else {
      // If the date is not 'today', assume it's a forecast request
      const response = await fetch(`http://api.weatherapi.com/v1/history.json?key=67175f44341344d4a9593334250506&q=${val.city}&dt=${val.date}&aqi=yes`);
      const data = await response.json();
      return data;
    }
  }));
  return weatherInfo;
}



main(userName)
  .then(async (parsed) => {
    if (parsed.weather_details_needed && location.length > 0) {
      const weatherReports = await getweatherInfo(location);

      // Simple summary logic: print weather for each city/date
      // Instead of printing, send the weatherReports and locations to the LLM for summary
      const summaryPrompt = `
    You are an AI agent that strictly responds in JSON format only.

    Given the following weather data for each city and date, generate a weather_report in natural language,  English  and include some precautions if needed. Respond ONLY with the JSON format as described earlier.

    Locations:
    ${JSON.stringify(location, null, 2)}

    Weather Data:
    ${JSON.stringify(weatherReports, null, 2)}
    `;

      const summaryResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          { role: "user", text: summaryPrompt }
        ]
      });

      const summaryInput = summaryResponse.candidates[0].content.parts;
      const summaryRawText = summaryInput[0].text;
      const summaryJsonString = summaryRawText.replace(/```json|```/g, '').trim();

      const summaryParsed = JSON.parse(summaryJsonString);

      if (summaryParsed.weather_report) {
        console.log('\n================ Weather Report ================\n');
        // Print the weather report as plain text, not as an object
        console.log(summaryParsed.weather_report);
        console.log('\n===============================================\n');
      } else {
        console.log('\n[!] Could not generate weather summary.\n');
      }
    } else if (!parsed.weather_details_needed && parsed.weather_report) {
      console.log(parsed.weather_report);
    } else {
      console.log('No weather details needed or locations found.');
    }
  })
  .catch(console.error);





