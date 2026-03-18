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
      select: { id: true, leafCheckSubscribed: true, leafCheckFreeUsed: true, leafCheckSubExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSubscribed = user.leafCheckSubscribed && (!user.leafCheckSubExpiresAt || new Date(user.leafCheckSubExpiresAt) > new Date());
    const canUseFree = !user.leafCheckFreeUsed;

    if (!isSubscribed && !canUseFree && user.role !== "admin") {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }

    const { imageBase64, fileName, contentType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const systemPrompt = `You are LeafCheck, an expert botanist AI. Analyze the plant image and provide:

1. Plant identification with scientific name and confidence level
2. Detailed care guide including watering, sunlight, temperature, humidity, soil, and fertilizing
3. Common issues to watch for
4. Pro tips for keeping the plant healthy
5. Fun facts about the plant

Respond in this exact JSON format:
{
  "plantName": "Common Name",
  "scientificName": "Scientific Name",
  "confidence": 85,
  "careGuide": {
    "watering": "How often and how much",
    "sunlight": "Light requirements",
    "temperature": "Ideal temperature range",
    "humidity": "Humidity preferences",
    "soil": "Soil type",
    "fertilizing": "Fertilizer needs",
    "commonIssues": ["issue1", "issue2"],
    "tips": ["tip1", "tip2", "tip3"]
  },
  "funFacts": ["fact1", "fact2"]
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
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this plant and provide a detailed care guide.' },
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
        plantName: 'Unknown Plant',
        scientificName: 'Species unknown',
        confidence: 50,
        careGuide: {
          watering: 'Water when top inch of soil is dry',
          sunlight: 'Bright indirect light',
          temperature: '65-75°F (18-24°C)',
          humidity: 'Average household humidity',
          soil: 'Well-draining potting mix',
          fertilizing: 'Monthly during growing season',
          commonIssues: ['Overwatering', 'Insufficient light'],
          tips: ['Check soil moisture before watering', 'Rotate plant for even growth'],
        },
        funFacts: ['Plants improve indoor air quality'],
      };
    }

    await prisma.leafCheckScan.create({
      data: {
        userId: user.id,
        fileName: fileName || 'plant.jpg',
        plantName: result.plantName,
        scientificName: result.scientificName,
        confidence: result.confidence,
        careGuide: JSON.stringify(result.careGuide),
        analysisResult: JSON.stringify(result),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        leafCheckScans: { increment: 1 },
        leafCheckFreeUsed: !isSubscribed ? true : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing plant:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
