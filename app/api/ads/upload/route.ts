import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { calculateAdPrice } from '@/lib/ad-pricing';
import { calculateTokensPerView } from '@/lib/ad-rewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, phone, title, description, adType, adUrl, duration, targetApps } = body;

    if (!email || !companyName || !title || !description || !adType || !duration || !targetApps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate price
    const pricing = calculateAdPrice({ duration, targetApps, adType });
    const tokensPerView = calculateTokensPerView(duration);

    // Auto-generate advertiser account
    let advertiser = await prisma.advertiser.findUnique({ where: { email } });
    if (!advertiser) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: companyName,
        phone: phone || undefined,
      });

      advertiser = await prisma.advertiser.create({
        data: {
          email,
          companyName,
          phone: phone || null,
          stripeCustomerId: customer.id,
        },
      });
    }

    // Create ad record in PENDING status
    const ad = await prisma.ad.create({
      data: {
        advertiserId: advertiser.id,
        title,
        description,
        adType,
        adUrl: adUrl || null,
        duration,
        targetApps,
        cost: pricing.totalCents,
        tokensPerView,
        status: 'PENDING',
      },
    });

    // Create Stripe checkout session for ad payment
    const session = await stripe.checkout.sessions.create({
      customer: advertiser.stripeCustomerId || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ad: ${title}`,
              description: `${adType} ad, ${duration}s, targeting ${targetApps.includes('all') ? 'all apps' : targetApps.length + ' apps'}`,
            },
            unit_amount: pricing.totalCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/advertise?success=true&adId=${ad.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/advertise?canceled=true`,
      metadata: {
        type: 'ad_purchase',
        adId: ad.id,
        advertiserId: advertiser.id,
      },
    });

    // Create AdPayment record
    await prisma.adPayment.create({
      data: {
        advertiserId: advertiser.id,
        adId: ad.id,
        amount: pricing.totalCents,
        stripeSessionId: session.id,
        status: 'pending',
      },
    });

    return NextResponse.json({
      adId: ad.id,
      checkoutUrl: session.url,
      pricing,
      tokensPerView,
    });
  } catch (error) {
    console.error('Ad upload error:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}
