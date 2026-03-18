import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, dealDoneSubscribed: true, dealDoneSubExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== "admin" && (!user.dealDoneSubscribed || (user.dealDoneSubExpiresAt && new Date(user.dealDoneSubExpiresAt) < new Date()))) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `You are DealDone, an expert brand deal negotiation AI. Analyze the brand's offer/DM and provide:

1. A fair rate range based on industry standards for influencer/creator partnerships
2. A professional counter-offer message the user can send back
3. Red flags in the offer (if any)
4. Strength points they can leverage
5. Negotiation tips

Consider factors like:
- Type of content (post, story, reel, video)
- Platform (Instagram, TikTok, YouTube)
- Usage rights requested
- Exclusivity clauses
- Timeline pressures

Respond in this exact JSON format:
{
  "brandName": "extracted or 'Unknown Brand'",
  "originalOffer": "summarized original offer",
  "counterOffer": "professional counter-offer message ready to send",
  "fairRateRange": { "min": number, "max": number },
  "negotiationTips": ["tip1", "tip2", "tip3"],
  "redFlags": ["flag1", "flag2"] or [],
  "strengthPoints": ["point1", "point2"] or []
}`;

    const response = await fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this brand DM/offer:\n\n${message}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('LLM API request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      result = {
        brandName: 'Unknown Brand',
        originalOffer: message.substring(0, 200),
        counterOffer: 'Thank you for reaching out! I\'m very interested in this partnership. Based on my engagement rates and content quality, I would typically charge [YOUR RATE] for this type of content. Would you be open to discussing this further?',
        fairRateRange: { min: 300, max: 800 },
        negotiationTips: [
          'Always ask about usage rights and exclusivity terms',
          'Request a timeline that works for your content calendar',
          'Ask if there\'s budget flexibility for higher-quality content'
        ],
        redFlags: [],
        strengthPoints: ['You have the content the brand wants'],
      };
    }

    await prisma.dealDoneChat.create({
      data: {
        userId: user.id,
        brandName: result.brandName,
        originalMessage: message,
        counterOffer: result.counterOffer,
        fairRateMin: result.fairRateRange.min,
        fairRateMax: result.fairRateRange.max,
        negotiationTips: JSON.stringify(result.negotiationTips),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { dealDoneNegotiations: { increment: 1 } },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing brand DM:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
