export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import productsConfig from '@/config/products.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

const tokenPackages = productsConfig.tokenPackages as Array<{
  id: string;
  name: string;
  tokens: number;
  priceInCents: number;
  popular?: boolean;
}>;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { packageId } = body;

    const pkg = tokenPackages.find(p => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create Stripe checkout session for one-time payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AI Empire — ${pkg.name} Token Pack`,
              description: `${pkg.tokens.toLocaleString()} AI Empire tokens`,
              metadata: {
                type: 'token_purchase',
                packageId: pkg.id,
                tokenAmount: pkg.tokens.toString(),
              },
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'token_purchase',
        userId: user.id,
        packageId: pkg.id,
        tokenAmount: pkg.tokens.toString(),
      },
      success_url: `${process.env.NEXTAUTH_URL || request.headers.get('origin') || 'http://localhost:3000'}/dashboard?token_purchase=success&tokens=${pkg.tokens}`,
      cancel_url: `${process.env.NEXTAUTH_URL || request.headers.get('origin') || 'http://localhost:3000'}/pricing?tab=tokens&token_purchase=cancelled`,
    });

    // Record the purchase attempt
    await prisma.tokenPurchase.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        tokenAmount: pkg.tokens,
        priceInCents: pkg.priceInCents,
        stripeSessionId: checkoutSession.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Token purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

// GET: list available packages
export async function GET() {
  return NextResponse.json({
    packages: tokenPackages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tokens: pkg.tokens,
      priceInCents: pkg.priceInCents,
      priceFormatted: `$${(pkg.priceInCents / 100).toFixed(2)}`,
      perTokenCost: `$${(pkg.priceInCents / 100 / pkg.tokens).toFixed(3)}`,
      popular: pkg.popular || false,
    })),
  });
}
