"use strict";(()=>{var e={};e.id=8611,e.ids=[8611],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},32216:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>f,patchFetch:()=>x,requestAsyncStorage:()=>h,routeModule:()=>p,serverHooks:()=>g,staticGenerationAsyncStorage:()=>y});var s={};t.r(s),t.d(s,{POST:()=>c,dynamic:()=>m});var a=t(49303),n=t(88716),i=t(60670),o=t(87070),l=t(75571),u=t(10191),d=t(52663);let m="force-dynamic";async function c(e){try{let r;let t=await (0,l.getServerSession)(u.L);if(!t?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let s=await d._.user.findUnique({where:{email:t.user.email},select:{id:!0,trendPulseSubscribed:!0,trendPulseFreeUsed:!0}});if(!s)return o.NextResponse.json({error:"User not found"},{status:404});if(!s.trendPulseSubscribed&&s.trendPulseFreeUsed)return o.NextResponse.json({error:"Subscription required"},{status:402});let{assetName:a,assetType:n,timeframe:i}=await e.json();if(!a||!n)return o.NextResponse.json({error:"Asset name and type required"},{status:400});let m=`You are TrendPulse, an expert AI market analyst. Provide comprehensive market trend analysis with price predictions.

Respond ONLY with valid JSON in this exact format:
{
  "assetName": "Full asset name",
  "assetType": "Stock/Crypto/Commodity",
  "currentPrice": "$XXX.XX",
  "sentiment": "Bullish/Bearish/Neutral",
  "confidenceScore": number (0-100),
  "priceTargets": {
    "shortTerm": { "low": number, "high": number, "timeframe": "1-4 weeks" },
    "mediumTerm": { "low": number, "high": number, "timeframe": "1-6 months" },
    "longTerm": { "low": number, "high": number, "timeframe": "6-12 months" }
  },
  "keyFactors": [
    { "factor": "Factor name", "impact": "Positive/Negative/Neutral", "description": "Brief description" }
  ],
  "riskLevel": "Low/Medium/High",
  "technicalIndicators": [
    { "name": "RSI", "signal": "Buy/Sell/Hold", "value": "XX" },
    { "name": "MACD", "signal": "Bullish/Bearish", "value": "XX" },
    { "name": "Moving Avg", "signal": "Above/Below", "value": "XX" },
    { "name": "Volume", "signal": "High/Normal/Low", "value": "XX" }
  ],
  "recommendation": "Clear actionable recommendation",
  "summary": "2-3 sentence market analysis summary"
}

Provide realistic analysis based on general market knowledge. Include 3-4 key factors.`,c=`Analyze the market trends for: ${a}

Asset type: ${n}
Preferred timeframe: ${i}

Provide comprehensive analysis including sentiment, price targets, key factors affecting the asset, technical indicators, risk assessment, and a clear recommendation.`,p=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:m},{role:"user",content:c}],temperature:.6,max_tokens:2500})});if(!p.ok)throw Error("LLM API error");let h=await p.json(),y=h.choices[0]?.message?.content||"";try{let e=y.match(/\{[\s\S]*\}/);r=JSON.parse(e?e[0]:y)}catch{throw Error("Failed to parse analysis")}return await d._.trendPulseReport.create({data:{userId:s.id,assetType:n,assetName:a,timeframe:i,sentiment:r.sentiment,confidenceScore:r.confidenceScore,priceTargets:JSON.stringify(r.priceTargets),keyFactors:JSON.stringify(r.keyFactors),riskLevel:r.riskLevel,analysisResult:JSON.stringify(r)}}),await d._.user.update({where:{email:t.user.email},data:{trendPulseAnalyses:{increment:1},trendPulseFreeUsed:!0}}),o.NextResponse.json({analysis:r})}catch(e){return console.error("TrendPulse analyze error:",e),o.NextResponse.json({error:"Failed to analyze trends"},{status:500})}}let p=new a.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/trendpulse/analyze/route",pathname:"/api/trendpulse/analyze",filename:"route",bundlePath:"app/api/trendpulse/analyze/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/trendpulse/analyze/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:h,staticGenerationAsyncStorage:y,serverHooks:g}=p,f="/api/trendpulse/analyze/route";function x(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:y})}},10191:(e,r,t)=>{t.d(r,{L:()=>l});var s=t(53797),a=t(13539),n=t(42023),i=t.n(n),o=t(52663);let l={adapter:(0,a.N)(o._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,s.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let r=await o._.user.findUnique({where:{email:e.email}});return r&&await i().compare(e.password,r.password)?{id:r.id,email:r.email,name:`${r.firstName??""} ${r.lastName??""}`.trim(),role:r.role}:null}})],callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id,e.role=r.role??"user"),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id,e.user.role=r.role),e)}}},52663:(e,r,t)=>{t.d(r,{_:()=>a});let s=require("@prisma/client"),a=globalThis.prisma??new s.PrismaClient}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[9276,2776,9637,5972],()=>t(32216));module.exports=s})();