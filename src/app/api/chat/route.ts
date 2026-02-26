import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { claim, analysis, appealLetter, messages } = await req.json();

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an AI copilot specializing in healthcare claim denials and appeals. You are assisting a revenue cycle team member who is working on appealing a denied claim.

You have full context on the claim, the AI analysis, and any appeal letter that has been generated. Help the user by:
- Answering questions about the denial, payer policies, or clinical guidelines
- Suggesting additional evidence or documentation that could strengthen the appeal
- Explaining denial codes and payer-specific requirements
- Recommending strategies to improve overturn probability
- Providing context on CMS policies, clinical guidelines (ACC/AHA, NCCN, etc.)
- Helping identify risks or weaknesses in the current appeal

Be concise, specific, and actionable. Reference the specific claim data when relevant. If you don't know something, say so rather than guessing.

Current Claim Context:
Claim ID: ${claim.claimId}
Patient: ${claim.patient}, ${claim.patientAge}${claim.patientSex}
Payer: ${claim.payer}
Procedure: ${claim.procedure} (CPT ${claim.cptCode})
Charge: $${claim.chargeAmount.toLocaleString()}
Denial Code: ${claim.denialCode}
Denial Reason: ${claim.denialReason}

Clinical Notes:
${claim.clinicalNotes}

${analysis ? `AI Analysis: ${JSON.stringify(analysis)}` : ''}
${appealLetter ? `Appeal Letter Draft: ${appealLetter}` : ''}`,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

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
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
