import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { createCryptoCharge } from "@/lib/coinbase";

export const dynamic = "force-dynamic";

// Product pricing configuration
const PRODUCTS: Record<string, { name: string; description: string; amount: number }> = {
  flipscore_subscription: { name: "FlipScore Pro (Crypto)", description: "Monthly subscription - Unlimited thrift item scans", amount: 19.99 },
  tradeace_subscription: { name: "TradeAce Pro (Crypto)", description: "Monthly subscription - Vocational exam prep", amount: 24.99 },
  dealdone_subscription: { name: "DealDone Pro (Crypto)", description: "Monthly subscription - Brand negotiation AI", amount: 39.00 },
  leafcheck_subscription: { name: "LeafCheck Pro (Crypto)", description: "Monthly subscription - Plant species ID", amount: 12.00 },
  pawpair_purchase: { name: "PawPair Lifetime (Crypto)", description: "One-time purchase - Pet compatibility quizzes", amount: 14.00 },
  visionlens_subscription: { name: "VisionLens Pro (Crypto)", description: "Monthly subscription - Object ID & valuation", amount: 10.00 },
  coachlogic_subscription: { name: "CoachLogic Pro (Crypto)", description: "Monthly subscription - Practice plan generator", amount: 15.00 },
  globeguide_subscription: { name: "GlobeGuide Pro (Crypto)", description: "Monthly subscription - AI travel itineraries", amount: 18.00 },
  skillscope_subscription: { name: "SkillScope Pro (Crypto)", description: "Monthly subscription - Resume analyzer", amount: 16.00 },
  datavault_subscription: { name: "DataVault Pro (Crypto)", description: "Monthly subscription - Finance analyzer", amount: 22.00 },
  guardianai_subscription: { name: "GuardianAI Pro (Crypto)", description: "Monthly subscription - Reputation monitor", amount: 25.00 },
  trendpulse_subscription: { name: "TrendPulse Pro (Crypto)", description: "Monthly subscription - Market trend predictor", amount: 29.00 },
  soundforge_subscription: { name: "SoundForge Pro (Crypto)", description: "Monthly subscription - AI music generator", amount: 20.00 },
  mememint_subscription: { name: "MemeMint Pro (Crypto)", description: "Monthly subscription - AI meme generator", amount: 8.00 },
  legalese_scan: { name: "Legalese Scan (Crypto)", description: "Single contract analysis", amount: 9.99 },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productType, returnPath } = body;

    const product = PRODUCTS[productType];
    if (!product) {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const redirectPath = returnPath || "/dashboard";

    const charge = await createCryptoCharge({
      name: product.name,
      description: product.description,
      amount: product.amount,
      currency: "USD",
      userId: user.id,
      productType,
      redirectUrl: `${origin}${redirectPath}?crypto_success=true`,
      cancelUrl: `${origin}${redirectPath}?crypto_canceled=true`,
    });

    if (!charge) {
      return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 500 });
    }

    // Store the pending crypto payment
    await prisma.cryptoPayment.create({
      data: {
        userId: user.id,
        chargeId: charge.id,
        productType,
        amount: product.amount,
        currency: "USD",
        status: "pending",
      },
    });

    return NextResponse.json({ url: charge.hosted_url, chargeId: charge.id });
  } catch (error) {
    console.error("Crypto checkout error:", error);
    return NextResponse.json({ error: "Failed to create crypto checkout" }, { status: 500 });
  }
}
