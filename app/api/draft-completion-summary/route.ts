import { NextResponse } from 'next/server'
import OpenAI from 'openai'



export async function POST(req: Request) {
  try {
    const document = await req.json()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
    const prompt = `
You are writing a completion report for Rubber Roofs, a UK roofing contractor carrying out works for councils and housing associations.

Purpose:
The report supports completion of a job and helps the council understand what work was carried out.

Writing rules:
- Use UK English.
- Write in plain, professional contractor language.
- Be concise.
- Maximum 120 words.
- Write in past tense.
- Do not mention prices, costs, quotations, invoices, payment or values.
- Do not mention internal discussions.
- Do not speculate.
- Do not recommend further work unless it is clearly recorded in the selected information.
- Do not invent work, materials, defects or outcomes.
- Do not say "based on the information provided".
- Do not mention JobCore or system records.
- Do not write "no scaffold was noted", "no asbestos was noted", "no existing scaffold", or similar internal wording.
- If access/scaffold is included, mention access arrangements naturally as part of the works.
- If asbestos is included, mention asbestos checks or arrangements naturally only where relevant.
- The final wording should sound like a competent roofing contractor wrote it.

Document data:
${JSON.stringify(document, null, 2)}
`

    const response = await openai.responses.create({
      model: 'gpt-5.4-mini',
      input: prompt,
    })

    return NextResponse.json({
      summary: response.output_text,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to draft summary' },
      { status: 500 }
    )
  }
}