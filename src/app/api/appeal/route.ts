import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { claim, analysis } = await req.json();

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are an expert healthcare appeals writer with deep knowledge of payer-specific policies, CMS guidelines, and clinical documentation requirements. You draft formal medical necessity appeal letters that are structured, evidence-based, and optimized for overturn success.

Write a professional appeal letter that:
1. Opens with formal claim identification and appeal purpose
2. Directly addresses each element of the denial reason
3. Cites specific clinical findings from the patient record with dates
4. References applicable clinical guidelines (ACC/AHA, NCCN, CMS NCDs, etc.)
5. Maps clinical evidence to specific payer policy criteria
6. Identifies enclosed supporting documentation
7. Closes with a clear request for reconsideration

Use formal medical terminology. Be specific and factual. Do not use placeholder text. Address the payer's medical review team directly.`,
      messages: [
        {
          role: "user",
          content: `Draft an appeal letter for this denied claim:

Claim ID: ${claim.claimId}
Patient: ${claim.patient}, ${claim.patientAge}${claim.patientSex} | MRN: ${claim.mrn}
Provider: ${claim.provider}
Payer: ${claim.payer}
Procedure: ${claim.procedure} (CPT ${claim.cptCode})
Charge Amount: $${claim.chargeAmount.toLocaleString()}
Date of Service: ${claim.dateOfService}
Denial Code: ${claim.denialCode}
Denial Reason: ${claim.denialReason}

Clinical Notes:
${claim.clinicalNotes}

AI Analysis Summary:
${JSON.stringify(analysis, null, 2)}

Write the complete appeal letter now.`
        }
      ]
    });

    // Stream the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Appeal error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Appeal generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
