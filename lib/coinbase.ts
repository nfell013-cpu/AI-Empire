// Coinbase Commerce API integration for crypto payments
// Supports BTC, ETH, USDC, and other cryptocurrencies

const COINBASE_API_URL = "https://api.commerce.coinbase.com";
const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY || "";

export interface CryptoCharge {
  id: string;
  code: string;
  name: string;
  description: string;
  hosted_url: string;
  pricing: {
    local: { amount: string; currency: string };
    bitcoin?: { amount: string; currency: string };
    ethereum?: { amount: string; currency: string };
    usdc?: { amount: string; currency: string };
  };
  metadata: {
    userId: string;
    productType: string;
  };
  expires_at: string;
  timeline: { status: string; time: string }[];
}

export async function createCryptoCharge(params: {
  name: string;
  description: string;
  amount: number;
  currency: string;
  userId: string;
  productType: string;
  redirectUrl: string;
  cancelUrl: string;
}): Promise<CryptoCharge | null> {
  if (!COINBASE_API_KEY) {
    console.error("Coinbase Commerce API key not configured");
    return null;
  }

  try {
    const response = await fetch(`${COINBASE_API_URL}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CC-Api-Key": COINBASE_API_KEY,
        "X-CC-Version": "2018-03-22",
      },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        pricing_type: "fixed_price",
        local_price: {
          amount: params.amount.toFixed(2),
          currency: params.currency,
        },
        metadata: {
          userId: params.userId,
          productType: params.productType,
        },
        redirect_url: params.redirectUrl,
        cancel_url: params.cancelUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Coinbase charge creation failed:", error);
      return null;
    }

    const data = await response.json();
    return data.data as CryptoCharge;
  } catch (error) {
    console.error("Error creating Coinbase charge:", error);
    return null;
  }
}

export async function getCharge(chargeId: string): Promise<CryptoCharge | null> {
  if (!COINBASE_API_KEY) return null;

  try {
    const response = await fetch(`${COINBASE_API_URL}/charges/${chargeId}`, {
      headers: {
        "X-CC-Api-Key": COINBASE_API_KEY,
        "X-CC-Version": "2018-03-22",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data as CryptoCharge;
  } catch {
    return null;
  }
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require("crypto");
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return computedSignature === signature;
}
