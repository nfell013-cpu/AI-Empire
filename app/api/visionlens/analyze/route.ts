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
      select: { id: true, role: true, visionLensSubscribed: true, visionLensFreeUsed: true, visionLensSubExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSubscribed = user.visionLensSubscribed && (!user.visionLensSubExpiresAt || new Date(user.visionLensSubExpiresAt) > new Date());
    const canUseFree = !user.visionLensFreeUsed;

    if (!isSubscribed && !canUseFree && user.role !== "admin") {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }

    const { imageBase64, fileName, contentType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const systemPrompt = `You are VisionLens, an expert appraiser and historian AI. Analyze the object in the image and provide:

1. Object identification (what it is)
2. Category (antique, art, collectible, furniture, jewelry, etc.)
3. Era/period (when it was made)
4. Origin/region
5. Estimated value range (low, mid, high in USD)
6. Historical background and significance
7. Materials used
8. Condition assessment
9. Rarity level
10. Fun facts about the object
11. Tips for the owner (care, authentication, selling)

Respond in this exact JSON format:
{
  "objectName": "Victorian Era Pocket Watch",
  "category": "Antique Timepiece",
  "era": "1880-1900",
  "origin": "England",
  "estimatedValue": { "low": 500, "mid": 1200, "high": 2500 },
  "history": "Detailed historical background...",
  "materials": ["Gold", "Glass", "Steel"],
  "condition": "Good - minor wear consistent with age",
  "rarity": "Uncommon",
  "funFacts": ["fact1", "fact2"],
  "tips": ["tip1", "tip2"]
}

Rarity levels: Common, Uncommon, Rare, Very Rare, Extremely Rare`;

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
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this object and provide its history and estimated value.' },
              {
                type: 'image_url',
                image_url: { url: `data:${contentType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.5,
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
        objectName: 'Unknown Object',
        category: 'Miscellaneous',
        era: 'Unknown',
        origin: 'Unknown',
        estimatedValue: { low: 50, mid: 150, high: 300 },
        history: 'Unable to determine detailed history. Consider consulting a professional appraiser for accurate information.',
        materials: ['Unknown'],
        condition: 'Cannot assess from image',
        rarity: 'Unknown',
        funFacts: ['Every object has a story waiting to be discovered'],
        tips: ['Consider having the item professionally appraised', 'Keep items in a climate-controlled environment'],
      };
    }

    await prisma.visionLensScan.create({
      data: {
        userId: user.id,
        fileName: fileName || 'object.jpg',
        objectName: result.objectName,
        category: result.category,
        era: result.era,
        history: result.history,
        estimatedValue: result.estimatedValue.mid,
        analysisResult: JSON.stringify(result),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        visionLensScans: { increment: 1 },
        visionLensFreeUsed: !isSubscribed ? true : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing object:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
