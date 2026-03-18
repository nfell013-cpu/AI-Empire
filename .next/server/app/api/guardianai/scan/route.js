"use strict";(()=>{var e={};e.id=3468,e.ids=[3468],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},79430:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>y});var a={};t.r(a),t.d(a,{POST:()=>c,dynamic:()=>d});var n=t(49303),i=t(88716),s=t(60670),o=t(87070),u=t(75571),p=t(10191),l=t(52663);let d="force-dynamic";async function c(e){try{let r;let t=await (0,u.getServerSession)(p.L);if(!t?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let a=await l._.user.findUnique({where:{email:t.user.email},select:{id:!0,guardianAISubscribed:!0,guardianAIFreeUsed:!0}});if(!a)return o.NextResponse.json({error:"User not found"},{status:404});if(!a.guardianAISubscribed&&a.guardianAIFreeUsed)return o.NextResponse.json({error:"Subscription required"},{status:402});let{searchQuery:n,scanType:i}=await e.json();if(!n)return o.NextResponse.json({error:"Search query required"},{status:400});let s=`You are GuardianAI, an expert AI reputation analyst. Analyze online reputation and provide comprehensive insights.

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": number (0-100, reputation score),
  "sentimentBreakdown": {
    "positive": number (percentage),
    "neutral": number (percentage),
    "negative": number (percentage)
  },
  "reputationStatus": "Excellent/Good/Fair/At Risk/Critical",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "mentions": [
    {
      "source": "Source name (e.g., Twitter, LinkedIn, News)",
      "sentiment": "Positive/Neutral/Negative",
      "summary": "Brief summary of mention",
      "date": "Recent/Last Week/Last Month",
      "impact": "High/Medium/Low"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "riskAreas": ["risk area 1", "risk area 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}

Provide realistic, actionable analysis. Include 4-6 mentions from various sources.`,d=`Analyze the online reputation for: "${n}"

Scan type: ${i} (${"personal"===i?"individual person":"brand"===i?"brand/company":"business"})

Provide a comprehensive reputation analysis including sentiment breakdown, key findings, recent mentions, risks, opportunities, and actionable recommendations to improve or maintain reputation.`,c=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:s},{role:"user",content:d}],temperature:.7,max_tokens:2500})});if(!c.ok)throw Error("LLM API error");let m=await c.json(),g=m.choices[0]?.message?.content||"";try{let e=g.match(/\{[\s\S]*\}/);r=JSON.parse(e?e[0]:g)}catch{throw Error("Failed to parse analysis")}return await l._.guardianAIScan.create({data:{userId:a.id,searchQuery:n,scanType:i,overallScore:r.overallScore,positiveCount:r.sentimentBreakdown.positive,negativeCount:r.sentimentBreakdown.negative,neutralCount:r.sentimentBreakdown.neutral,mentions:JSON.stringify(r.mentions),recommendations:JSON.stringify(r.recommendations),analysisResult:JSON.stringify(r)}}),await l._.user.update({where:{email:t.user.email},data:{guardianAIScans:{increment:1},guardianAIFreeUsed:!0}}),o.NextResponse.json({analysis:r})}catch(e){return console.error("GuardianAI scan error:",e),o.NextResponse.json({error:"Failed to scan reputation"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/guardianai/scan/route",pathname:"/api/guardianai/scan",filename:"route",bundlePath:"app/api/guardianai/scan/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/guardianai/scan/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:g,staticGenerationAsyncStorage:y,serverHooks:h}=m,x="/api/guardianai/scan/route";function f(){return(0,s.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:y})}},10191:(e,r,t)=>{t.d(r,{L:()=>u});var a=t(53797),n=t(13539),i=t(42023),s=t.n(i),o=t(52663);let u={adapter:(0,n.N)(o._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,a.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let r=await o._.user.findUnique({where:{email:e.email}});return r&&await s().compare(e.password,r.password)?{id:r.id,email:r.email,name:`${r.firstName??""} ${r.lastName??""}`.trim(),role:r.role}:null}})],callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id,e.role=r.role??"user"),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id,e.user.role=r.role),e)}}},52663:(e,r,t)=>{t.d(r,{_:()=>n});let a=require("@prisma/client"),n=globalThis.prisma??new a.PrismaClient}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9276,2776,9637,5972],()=>t(79430));module.exports=a})();