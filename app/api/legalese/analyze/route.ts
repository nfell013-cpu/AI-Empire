export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const sendEvent = (controller: ReadableStreamDefaultController, data: object) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const runAnalysis = async () => {
    const ctrl = controller!;
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        sendEvent(ctrl, { status: "error", message: "Unauthorized" });
        ctrl.close();
        return;
      }

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email ?? "" },
      });

      if (!user) {
        sendEvent(ctrl, { status: "error", message: "User not found" });
        ctrl.close();
        return;
      }

      // Check paywall
      if (user.freeScanUsed) {
        sendEvent(ctrl, { status: "error", message: "Free scan already used. Please pay to continue." });
        ctrl.close();
        return;
      }

      const body = await request.json();
      const { cloud_storage_path, fileName, base64 } = body ?? {};

      if (!base64 || !fileName) {
        sendEvent(ctrl, { status: "error", message: "Missing required fields" });
        ctrl.close();
        return;
      }

      sendEvent(ctrl, { status: "processing", message: "Parsing contract clauses..." });

      // Create scan record
      const scan = await prisma.scan.create({
        data: {
          userId: user.id,
          fileName: fileName,
          cloudStoragePath: cloud_storage_path ?? null,
          status: "analyzing",
          isFree: !user.freeScanUsed,
        },
      });

      sendEvent(ctrl, { status: "processing", message: "AI is analyzing legal clauses..." });

      // Call LLM API
      const systemPrompt = `You are an expert contract attorney and legal analyst. Analyze the provided contract PDF and identify potential issues.

You MUST respond with valid JSON only (no markdown, no code blocks) in this exact format:
{
  "summary": "Brief 1-2 sentence overall assessment of the contract",
  "riskLevel": "high" | "medium" | "low",
  "issues": [
    {
      "type": "auto_renewal" | "hidden_fee" | "liability" | "termination" | "payment" | "other",
      "severity": "high" | "medium" | "low",
      "title": "Short issue title",
      "description": "Clear explanation of why this clause is concerning",
      "clause": "Relevant text excerpt from the contract (optional, max 100 chars)"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation"
  ]
}

Focus on:
1. Auto-renewal traps (automatic subscription renewals, notice periods)
2. Hidden fees (processing fees, late fees, penalties not clearly stated)
3. Liability limitations that heavily favor one party
4. Unfair termination clauses
5. Unusual payment terms
6. Intellectual property assignments
7. Non-compete or exclusivity clauses

Be thorough but practical. Include 3-8 issues if found. If contract looks clean, say so in summary with low risk.`;

      const llmResponse = await fetch("https://apps.abacus.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-2024-11-20",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: `Please analyze this contract: ${fileName}` },
                {
                  type: "file",
                  file: {
                    filename: fileName,
                    file_data: `data:application/pdf;base64,${base64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          stream: true,
          max_tokens: 4000,
        }),
      });

      if (!llmResponse.ok) {
        const errText = await llmResponse.text();
        console.error("LLM error:", errText);
        sendEvent(ctrl, { status: "error", message: `LLM API failed: ${llmResponse.status}` });
        ctrl.close();
        return;
      }

      const reader = llmResponse.body?.getReader();
      if (!reader) {
        sendEvent(ctrl, { status: "error", message: "Failed to read LLM response" });
        ctrl.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let partialRead = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split("\n");
        partialRead = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              buffer += delta;
              sendEvent(ctrl, { status: "processing", message: "Generating detailed report..." });
            } catch {
              // Skip
            }
          }
        }
      }

      // Parse the JSON result
      let analysisResult: object;
      try {
        analysisResult = JSON.parse(buffer);
      } catch {
        // Try to extract JSON from buffer
        const match = buffer.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            analysisResult = JSON.parse(match[0]);
          } catch {
            sendEvent(ctrl, { status: "error", message: "Failed to parse AI response" });
            ctrl.close();
            return;
          }
        } else {
          sendEvent(ctrl, { status: "error", message: "Invalid AI response format" });
          ctrl.close();
          return;
        }
      }

      // Update scan record and user
      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          analysisResult: JSON.stringify(analysisResult),
          status: "completed",
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          scanCount: { increment: 1 },
          freeScanUsed: true,
        },
      });

      sendEvent(ctrl, { status: "completed", result: analysisResult });
      ctrl.close();
    } catch (err) {
      console.error("Analyze error:", err);
      const msg = err instanceof Error ? err.message : "Analysis failed";
      if (controller) {
        sendEvent(controller, { status: "error", message: msg });
        controller.close();
      }
    }
  };

  runAnalysis();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
