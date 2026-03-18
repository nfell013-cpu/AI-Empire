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
      select: { id: true, pawPairPurchased: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.pawPairPurchased) {
      return NextResponse.json({ error: 'Purchase required' }, { status: 402 });
    }

    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Quiz answers are required' }, { status: 400 });
    }

    const systemPrompt = `You are PawPair, an expert pet matching AI. Based on the user's lifestyle quiz answers, recommend the top 3 most compatible pets (specific breeds or types).

For each match, provide:
1. Pet name (breed/type)
2. Match percentage (based on lifestyle compatibility)
3. Key traits
4. Why they're a good match
5. Things to consider

Quiz answer keys:
- living: apartment, house_small, house_large, rural
- activity: sedentary, moderate, active, very_active
- time: minimal, some, moderate, lots
- budget: low, medium, high, unlimited
- household: single, couple, family_older, family_young
- allergies: none, mild, severe
- experience: none, some, experienced, expert
- preference: dog, cat, small, any

Respond in this exact JSON format:
{
  "matches": [
    {
      "name": "Golden Retriever",
      "matchPercent": 95,
      "traits": ["Friendly", "Active", "Great with families"],
      "whyMatch": "Explanation of why this pet matches the lifestyle",
      "considerations": ["consideration1", "consideration2"]
    }
  ]
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
          { role: 'user', content: `Here are my quiz answers:\n${JSON.stringify(answers, null, 2)}\n\nFind my perfect pet matches!` },
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
        matches: [
          {
            name: 'Golden Retriever',
            matchPercent: 85,
            traits: ['Friendly', 'Loyal', 'Great with families'],
            whyMatch: 'Golden Retrievers are adaptable, loving, and make excellent companions for various lifestyles.',
            considerations: ['Requires regular exercise', 'Moderate shedding'],
          },
          {
            name: 'Domestic Shorthair Cat',
            matchPercent: 80,
            traits: ['Independent', 'Low-maintenance', 'Affectionate'],
            whyMatch: 'Cats are perfect for those with moderate time availability and appreciate independence.',
            considerations: ['Need regular vet checkups', 'Indoor cats live longer'],
          },
          {
            name: 'Labrador Retriever',
            matchPercent: 75,
            traits: ['Energetic', 'Playful', 'Trainable'],
            whyMatch: 'Labs are versatile dogs that adapt well to most living situations.',
            considerations: ['Need lots of exercise', 'Can be food-motivated'],
          },
        ],
      };
    }

    await prisma.pawPairResult.create({
      data: {
        userId: user.id,
        quizAnswers: JSON.stringify(answers),
        recommendedPets: JSON.stringify(result.matches),
        topMatch: result.matches[0]?.name,
        matchPercent: result.matches[0]?.matchPercent,
        matchReport: JSON.stringify(result),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { pawPairQuizzes: { increment: 1 } },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing pet compatibility:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
