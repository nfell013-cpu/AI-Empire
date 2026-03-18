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
      select: { id: true, coachLogicSubscribed: true, coachLogicFreePlanUsed: true, coachLogicSubExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSubscribed = user.coachLogicSubscribed && (!user.coachLogicSubExpiresAt || new Date(user.coachLogicSubExpiresAt) > new Date());
    const canUseFree = !user.coachLogicFreePlanUsed;

    if (!isSubscribed && !canUseFree) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }

    const { sport, opponentNotes, practiceGoals, duration } = await request.json();

    if (!sport || !opponentNotes) {
      return NextResponse.json({ error: 'Sport and opponent notes are required' }, { status: 400 });
    }

    const systemPrompt = `You are CoachLogic, an expert sports coach AI. Generate a detailed practice plan based on the opponent scouting report.

Create a structured ${duration}-minute practice plan that addresses the opponent's weaknesses and strengthens the team against the opponent's strengths.

The plan should include:
1. Warm-up (appropriate for the sport)
2. 3-4 main drills targeting specific skills needed against this opponent
3. Scrimmage/game simulation
4. Cool down
5. Coach notes for emphasis during practice

Respond in this exact JSON format:
{
  "sport": "${sport}",
  "duration": ${duration},
  "focusAreas": ["area1", "area2", "area3"],
  "warmup": {
    "name": "Dynamic Warm-Up",
    "duration": 10,
    "description": "Description of warm-up routine",
    "keyPoints": ["point1", "point2"]
  },
  "mainDrills": [
    {
      "name": "Drill Name",
      "duration": 15,
      "description": "Detailed drill description",
      "keyPoints": ["coaching point 1", "coaching point 2"]
    }
  ],
  "scrimmage": {
    "name": "Controlled Scrimmage",
    "duration": 15,
    "description": "Description of scrimmage rules and focus",
    "keyPoints": ["point1", "point2"]
  },
  "cooldown": {
    "name": "Cool Down & Review",
    "duration": 5,
    "description": "Cool down routine",
    "keyPoints": ["point1", "point2"]
  },
  "coachNotes": ["note1", "note2", "note3"]
}`;

    const userMessage = `Sport: ${sport}
Practice Duration: ${duration} minutes

Opponent Scouting Report:
${opponentNotes}

${practiceGoals ? `Practice Goals:\n${practiceGoals}` : ''}

Generate a comprehensive practice plan to prepare my team against this opponent.`;

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
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
        sport,
        duration,
        focusAreas: ['Fundamentals', 'Defense', 'Teamwork'],
        warmup: {
          name: 'Dynamic Warm-Up',
          duration: 10,
          description: 'Light jogging, dynamic stretches, and sport-specific movements to prepare the body.',
          keyPoints: ['Gradually increase intensity', 'Focus on major muscle groups'],
        },
        mainDrills: [
          {
            name: 'Skill Development Drill',
            duration: 15,
            description: 'Focus on fundamental skills needed for competition.',
            keyPoints: ['Emphasize proper technique', 'Provide individual feedback'],
          },
          {
            name: 'Team Coordination Drill',
            duration: 15,
            description: 'Work on team communication and coordination.',
            keyPoints: ['Encourage verbal communication', 'Practice game-like scenarios'],
          },
        ],
        scrimmage: {
          name: 'Controlled Scrimmage',
          duration: 15,
          description: 'Full-speed practice game with specific focus areas.',
          keyPoints: ['Apply skills from drills', 'Simulate game pressure'],
        },
        cooldown: {
          name: 'Cool Down & Debrief',
          duration: 5,
          description: 'Static stretching and team discussion.',
          keyPoints: ['Review key learnings', 'Set goals for next practice'],
        },
        coachNotes: ['Focus on positive reinforcement', 'Monitor player energy levels', 'Adjust drills based on execution'],
      };
    }

    await prisma.coachLogicPlan.create({
      data: {
        userId: user.id,
        sport,
        opponentNotes,
        practiceGoals: practiceGoals || null,
        planContent: JSON.stringify(result),
        duration,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        coachLogicPlans: { increment: 1 },
        coachLogicFreePlanUsed: !isSubscribed ? true : undefined,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating practice plan:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
