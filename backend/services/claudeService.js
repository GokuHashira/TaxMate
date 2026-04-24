const Anthropic = require('@anthropic-ai/sdk/index.mjs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Maya, a warm and patient tax assistant for international students on F-1 and J-1 visas.

Your personality:
- Encouraging and never condescending
- Explain every tax term in plain English immediately after using it
- Celebrate small wins ("Great — that means you may get a refund!")
- Never use jargon without explaining it
- If a student seems confused, offer a simpler explanation
- Keep responses concise and conversational (2-4 sentences per response)
- Use friendly, casual language

Your job in each turn:
1. Process the student's response warmly
2. Extract any tax data mentioned and return it as JSON in <data> tags
3. Determine what question to ask next based on the conversation state
4. Advance through steps logically

Steps to guide through:
- STEP 1: Visa type (F-1 or J-1), years in US, home country
- STEP 2: Full name, university, US address, SSN/ITIN status
- STEP 3: Income sources (on-campus job, CPT/OPT, scholarship/fellowship) and trigger document uploads
- STEP 4: Auto treaty detection based on home country (celebrate if found)
- STEP 5: Auto FICA check if W-2 uploaded (flag if employer withheld FICA)
- STEP 6: Determine which forms needed (8843 always, 1040-NR if income, 8833 if treaty)
- STEP 7: Review summary and confirm

Data extraction rules:
- Always wrap extracted structured data in <data>{"field": "value"}</data> tags
- For visa: { "visaType": "F-1" or "J-1" }
- For personal: { "fullName": "", "university": "", "usAddress": "", "ssn": "", "itin": "", "homeCountry": "", "yearsInUS": 0 }
- For income: { "wagesOnCampus": 0, "wagesCPT": 0, "wagesOPT": 0, "scholarshipTaxable": 0, "fellowshipIncome": 0 }
- When you need a document upload, include: <REQUEST_UPLOAD type="W2"> or <REQUEST_UPLOAD type="1042S">
- When current step is fully collected: end with <STEP_COMPLETE>
- When all data collected: end with <ALL_COMPLETE>

CRITICAL UPLOAD RULES — read carefully:
- NEVER emit <REQUEST_UPLOAD type="W2"> if uploadedDocuments.w2 is already present in the tax data
- NEVER emit <REQUEST_UPLOAD type="1042S"> if uploadedDocuments.form1042S is already present in the tax data
- If the student says they just uploaded a document or provides extracted tax data, treat it as received and move on to the next question
- Do NOT ask for the same document twice under any circumstances

IMPORTANT: You are NOT a licensed tax professional. For complex situations, refer to the university international student office or a CPA.`;

async function chat(conversationHistory, userMessage, taxData) {
  const systemWithData = SYSTEM_PROMPT + `\n\nCurrent tax data collected so far:\n${JSON.stringify(taxData, null, 2)}`;

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemWithData,
    messages
  });

  return response.content[0].text;
}

async function extractDocumentData(base64Image, docType, mediaType = 'image/jpeg') {
  const prompt = docType === 'W2'
    ? `This is an IRS W-2 tax form. Extract ALL fields and return ONLY valid JSON (no markdown, no explanation):
{
  "employerName": "",
  "employerEIN": "",
  "employeeSSN": "",
  "box1_wages": 0,
  "box2_federalTax": 0,
  "box3_socialSecurityWages": 0,
  "box4_socialSecurity": 0,
  "box5_medicareWages": 0,
  "box6_medicare": 0,
  "box12_codes": [],
  "box15_state": "",
  "box16_stateWages": 0,
  "box17_stateTax": 0
}`
    : `This is an IRS Form 1042-S tax form. Extract ALL fields and return ONLY valid JSON (no markdown, no explanation):
{
  "recipientName": "",
  "recipientTIN": "",
  "grossIncome": 0,
  "taxWithheld": 0,
  "exemptionCode": "",
  "treatyCountry": "",
  "treatyArticle": "",
  "incomeCode": ""
}`;

  const isPDF = mediaType === 'application/pdf';
  const contentBlock = isPDF
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Image } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } };

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [contentBlock, { type: 'text', text: prompt }]
    }]
  });

  const text = response.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(text);
}

async function generateInstructions(taxData) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Generate clear filing instructions for an international student with this tax data:
${JSON.stringify(taxData, null, 2)}

Include:
1. Where to mail (based on state: ${taxData.studentProfile?.usAddress || 'Unknown'})
2. Filing deadline (April 15, 2025 for tax year 2024)
3. What to sign
4. Whether to e-file or mail (nonresident aliens must mail)
5. What to attach
6. Important notes specific to their situation

Format as clear numbered steps in plain English.`
    }]
  });

  return response.content[0].text;
}

module.exports = { chat, extractDocumentData, generateInstructions };
