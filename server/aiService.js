import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Anthropic client
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your-anthropic-api-key') {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

// Specialty mapping rules
const specialtyMappingRules = {
  // Cardiology
  'chest pain': 'Cardiologist',
  'heart palpitations': 'Cardiologist',
  'shortness of breath': 'Cardiologist',
  'irregular heartbeat': 'Cardiologist',
  'high blood pressure': 'Cardiologist',
  
  // Dermatology
  'skin rash': 'Dermatologist',
  'acne': 'Dermatologist',
  'skin lesion': 'Dermatologist',
  'itching': 'Dermatologist',
  'hair loss': 'Dermatologist',
  'eczema': 'Dermatologist',
  
  // Gastroenterology
  'stomach pain': 'Gastroenterologist',
  'abdominal pain': 'Gastroenterologist',
  'nausea': 'Gastroenterologist',
  'vomiting': 'Gastroenterologist',
  'diarrhea': 'Gastroenterologist',
  'constipation': 'Gastroenterologist',
  'acid reflux': 'Gastroenterologist',
  
  // Neurology
  'headache': 'Neurologist',
  'migraine': 'Neurologist',
  'dizziness': 'Neurologist',
  'seizure': 'Neurologist',
  'numbness': 'Neurologist',
  'tingling': 'Neurologist',
  'memory loss': 'Neurologist',
  
  // Orthopedics
  'joint pain': 'Orthopedic',
  'back pain': 'Orthopedic',
  'knee pain': 'Orthopedic',
  'fracture': 'Orthopedic',
  'sprain': 'Orthopedic',
  'arthritis': 'Orthopedic',
};

// Rule-based specialty detection
function detectSpecialtyByRules(symptoms) {
  const symptomsLower = symptoms.toLowerCase();
  
  for (const [keyword, specialty] of Object.entries(specialtyMappingRules)) {
    if (symptomsLower.includes(keyword)) {
      return specialty;
    }
  }
  
  return 'General Physician'; // Default
}

// Rule-based severity assessment
function assessSeverity(data) {
  const { severity, redFlags, symptoms } = data;
  
  // Emergency keywords
  const emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding',
    'stroke', 'heart attack', 'severe burn', 'poisoning', 'suicide',
    'severe head injury', 'can\'t breathe', 'choking'
  ];
  
  const symptomsLower = symptoms.toLowerCase();
  const hasEmergencyKeyword = emergencyKeywords.some(keyword => symptomsLower.includes(keyword));
  
  // Severity assessment logic
  if (severity >= 9 || (severity >= 8 && redFlags) || hasEmergencyKeyword) {
    return 'EMERGENCY';
  } else if (severity >= 7 || (severity >= 6 && redFlags)) {
    return 'HIGH';
  } else if (severity >= 4) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
}

// AI-powered analysis using Claude (if API key is available)
async function analyzeWithAI(requestData) {
  if (!anthropic) {
    // Fallback to rule-based analysis
    return analyzeWithRules(requestData);
  }

  try {
    const prompt = `You are a medical triage AI assistant. Analyze the following patient information and provide a structured assessment.

Patient Information:
- Symptoms: ${requestData.symptoms}
- Duration: ${requestData.duration}
- Severity (1-10): ${requestData.severity}
- Emergency Warning Signs: ${requestData.redFlags ? 'Yes' : 'No'}
- Current Medications/Allergies: ${requestData.medications || 'None'}

Please provide:
1. Severity Level: EMERGENCY, HIGH, MEDIUM, or LOW
2. Suggested Medical Specialty (e.g., Cardiologist, Dermatologist, Gastroenterologist, Neurologist, Orthopedic, General Physician)
3. Brief Analysis: A 2-3 sentence assessment (no diagnosis, just triage guidance)

IMPORTANT: 
- Do NOT provide any medical diagnosis
- Do NOT recommend specific treatments
- Only suggest severity and appropriate specialty for triage purposes
- If symptoms suggest emergency, always mark as EMERGENCY

Format your response as JSON:
{
  "severityLevel": "HIGH",
  "suggestedSpecialty": "Cardiologist",
  "analysis": "Patient presents with concerning cardiac symptoms..."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return analyzeWithRules(requestData);
  } catch (error) {
    console.error('AI Analysis failed, using rule-based fallback:', error.message);
    return analyzeWithRules(requestData);
  }
}

// Rule-based analysis (fallback when AI is not available)
function analyzeWithRules(requestData) {
  const severityLevel = assessSeverity(requestData);
  const suggestedSpecialty = detectSpecialtyByRules(requestData.symptoms);
  
  let analysis = `Patient reports ${requestData.symptoms} for ${requestData.duration}. `;
  
  if (severityLevel === 'EMERGENCY') {
    analysis += 'This case requires immediate medical attention. Emergency protocols should be activated.';
  } else if (severityLevel === 'HIGH') {
    analysis += 'This case shows concerning symptoms and should be prioritized for prompt medical evaluation.';
  } else if (severityLevel === 'MEDIUM') {
    analysis += 'Patient should be scheduled for medical consultation within a reasonable timeframe.';
  } else {
    analysis += 'Routine medical consultation is appropriate for this case.';
  }
  
  return {
    severityLevel,
    suggestedSpecialty,
    analysis,
  };
}

// Main analysis function
export async function analyzeSymptoms(requestData) {
  try {
    // Use AI if available, otherwise use rules
    const result = await analyzeWithAI(requestData);
    
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('Symptom analysis error:', error);
    
    // Ultimate fallback
    return {
      success: true,
      ...analyzeWithRules(requestData),
    };
  }
}

// Test function to check if AI is available
export function isAIAvailable() {
  return anthropic !== null;
}

export default {
  analyzeSymptoms,
  isAIAvailable,
};
