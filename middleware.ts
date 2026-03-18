export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/legalese/:path*",
    "/flipscore/:path*",
    "/tradeace/:path*",
    "/dealdone/:path*",
    "/leafcheck/:path*",
    "/pawpair/:path*",
    "/visionlens/:path*",
    "/coachlogic/:path*",
    "/globeguide/:path*",
    "/skillscope/:path*",
    "/datavault/:path*",
    "/guardianai/:path*",
    "/trendpulse/:path*",
    "/soundforge/:path*",
    "/mememint/:path*",
    "/profile/:path*"
  ],
};
