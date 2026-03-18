import { prisma } from "./db";

export async function dispatchWebhook(
  userId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const webhooks = await prisma.userWebhook.findMany({
    where: { userId, active: true },
  });

  const matching = webhooks.filter((w) => {
    const events = w.events as string[];
    return events.includes(event) || events.includes("*");
  });

  const results = await Promise.allSettled(
    matching.map(async (wh) => {
      try {
        const res = await fetch(wh.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Webhook-Event": event },
          body: JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload }),
          signal: AbortSignal.timeout(10000),
        });
        return { webhookId: wh.id, status: res.status };
      } catch (err) {
        return { webhookId: wh.id, error: String(err) };
      }
    })
  );

  return results;
}
