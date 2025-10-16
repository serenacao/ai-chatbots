/**
 * Calculate the "temperature" of a text response based on various linguistic features
 * Higher temperature = more energetic, chaotic, emotional
 * Lower temperature = more calm, measured, formal
 */

export function calculateTemperature(text) {
  if (!text || typeof text !== 'string') return 0.5;
  
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
  const chars = text.split('');
  
  if (words.length === 0) return 0.5;
  
  let temperature = 0.5; // Base temperature
  
  // Length factor: longer responses tend to be more "heated"
  const lengthFactor = Math.min(words.length / 50, 1); // Normalize to 0-1
  temperature += lengthFactor * 0.2;
  
  // Exclamation marks: more = higher temperature
  const exclamationCount = (text.match(/!/g) || []).length;
  const exclamationFactor = Math.min(exclamationCount / words.length * 10, 1);
  temperature += exclamationFactor * 0.3;
  
  // Question marks: can indicate excitement or confusion
  const questionCount = (text.match(/\?/g) || []).length;
  const questionFactor = Math.min(questionCount / words.length * 10, 1);
  temperature += questionFactor * 0.15;
  
  // Caps lock: ALL CAPS = high temperature
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  temperature += capsRatio * 0.4;
  
  // Repeated characters: "sooo", "yesss" = high temperature
  const repeatedChars = (text.match(/(.)\1{2,}/g) || []).length;
  const repeatedFactor = Math.min(repeatedChars / words.length * 5, 1);
  temperature += repeatedFactor * 0.25;
  
  // Ellipsis: "..." can indicate uncertainty or trailing off
  const ellipsisCount = (text.match(/\.{3,}/g) || []).length;
  const ellipsisFactor = Math.min(ellipsisCount / words.length * 10, 1);
  temperature -= ellipsisFactor * 0.1; // Slightly cooling
  
  // Emotional words (simple heuristic)
  const emotionalWords = [
    'amazing', 'incredible', 'awesome', 'fantastic', 'terrible', 'awful', 'horrible',
    'love', 'hate', 'excited', 'angry', 'frustrated', 'happy', 'sad', 'worried',
    'omg', 'wow', 'yay', 'ugh', 'meh', 'lol', 'haha', 'hehe'
  ];
  const emotionalCount = words.filter(word => 
    emotionalWords.some(emotional => word.includes(emotional))
  ).length;
  const emotionalFactor = Math.min(emotionalCount / words.length * 5, 1);
  temperature += emotionalFactor * 0.2;
  
  // Internet slang and casual language
  const casualWords = [
    'yeah', 'yep', 'nope', 'nah', 'sure', 'ok', 'okay', 'cool', 'nice',
    'dude', 'bro', 'sis', 'yo', 'hey', 'hi', 'sup', 'whats', 'gonna',
    'wanna', 'gotta', 'kinda', 'sorta', 'pretty', 'really', 'totally'
  ];
  const casualCount = words.filter(word => 
    casualWords.some(casual => word.includes(casual))
  ).length;
  const casualFactor = Math.min(casualCount / words.length * 3, 1);
  temperature += casualFactor * 0.15;
  
  // Punctuation density: more punctuation = more energetic
  const punctuationCount = (text.match(/[!?.,;:]/g) || []).length;
  const punctuationFactor = Math.min(punctuationCount / words.length * 5, 1);
  temperature += punctuationFactor * 0.1;
  
  // Ensure temperature is between 0 and 1
  return Math.max(0, Math.min(1, temperature));
}

/**
 * Get temperature category and color for UI
 */
export function getTemperatureInfo(temperature) {
  if (temperature < 0.3) {
    return {
      category: 'cool',
      color: '#3b82f6', // Blue
      bgColor: '#dbeafe', // Light blue
      description: 'Calm and measured'
    };
  } else if (temperature < 0.5) {
    return {
      category: 'neutral',
      color: '#6b7280', // Gray
      bgColor: '#f3f4f6', // Light gray
      description: 'Balanced'
    };
  } else if (temperature < 0.7) {
    return {
      category: 'warm',
      color: '#f59e0b', // Amber
      bgColor: '#fef3c7', // Light amber
      description: 'Energetic'
    };
  } else {
    return {
      category: 'hot',
      color: '#ef4444', // Red
      bgColor: '#fee2e2', // Light red
      description: 'Intense'
    };
  }
}
