import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { claim } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are a healthcare denial management AI analyst. You analyze insurance claim denials and produce structured assessments to help revenue cycle teams prioritize and appeal denials effectively.

You must respond with ONLY valid JSON in this exact format — no markdown, no code fences, no extra text:
{
  "denialCategory": { "value": "string", "confidence": number 0-100 },
  "rootCause": { "value": "string", "confidence": number 0-100 },
  "payerPolicyMatch": { "value": "string — include specific policy ID if identifiable", "confidence": number 0-100 },
  "historicalOverturnRate": { "value": "string — percentage and context", "confidence": number 0-100 },
  "priorityScore": { "value": "HIGH/MEDIUM/LOW — with brief justification including dollar amount at risk and deadline", "confidence": null },
  "keyFindings": ["string — 2-3 critical observations about this denial"],
  "recommendedActions": ["string — 2-3 specific next steps for the appeals team"],
  "missingDocumentation": ["string — any documentation gaps that should be addressed before appeal"]
}

Be specific to the payer, procedure, and clinical context. Reference real clinical guidelines (ACC/AHA, NCCN, etc.) and CMS policies where relevant. Confidence scores should reflect how strong the evidence is for each assessment.`,
      messages: [
        {
          role: "user",
          content: `Analyze this denied claim:

Claim ID: ${claim.claimId}
Patient: ${claim.patient}, ${claim.patientAge}${claim.patientSex}
Provider: ${claim.provider}
Payer: ${claim.payer}
Procedure: ${claim.procedure} (CPT ${claim.cptCode})
Charge Amount: $${claim.chargeAmount.toLocaleString()}
Date of Service: ${claim.dateOfService}
Denial Code: ${claim.denialCode}
Denial Reason: ${claim.denialReason}
Timely Filing Deadline: ${claim.timelyFilingDeadline} (${claim.daysRemaining} days remaining)

Clinical Notes:
${claim.clinicalNotes}`
        }
      ]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse the JSON response, handling potential markdown code fences
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const analysis = JSON.parse(cleaned);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
