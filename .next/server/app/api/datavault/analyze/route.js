"use strict";(()=>{var e={};e.id=4154,e.ids=[4154],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},22650:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>x,patchFetch:()=>f,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>y});var r={};a.r(r),a.d(r,{POST:()=>p,dynamic:()=>c});var n=a(49303),s=a(88716),i=a(60670),o=a(87070),l=a(75571),u=a(10191),d=a(52663);let c="force-dynamic";async function p(e){try{let t;let a=await (0,l.getServerSession)(u.L);if(!a?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let r=await d._.user.findUnique({where:{email:a.user.email},select:{id:!0,dataVaultSubscribed:!0,dataVaultFreeUsed:!0}});if(!r)return o.NextResponse.json({error:"User not found"},{status:404});if(!r.dataVaultSubscribed&&r.dataVaultFreeUsed)return o.NextResponse.json({error:"Subscription required"},{status:402});let{csvContent:n,fileName:s}=await e.json();if(!n)return o.NextResponse.json({error:"CSV content required"},{status:400});let i=`You are DataVault, an expert AI personal finance analyst. Analyze transaction data and provide actionable financial insights.

Respond ONLY with valid JSON in this exact format:
{
  "totalIncome": number,
  "totalExpenses": number,
  "netSavings": number,
  "savingsRate": number (percentage),
  "spendingByCategory": [
    { "category": "Category Name", "amount": number, "percentage": number }
  ],
  "topExpenseCategories": ["category 1", "category 2", "category 3"],
  "monthlyTrend": "Brief description of spending trend",
  "financialHealth": "Excellent/Good/Fair/Needs Improvement",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3",
    "Specific actionable recommendation 4"
  ],
  "budgetSuggestions": [
    { "category": "Category", "suggested": number, "current": number }
  ],
  "alerts": ["Financial alert or concern if any"]
}

Categories should be: Housing, Food, Transportation, Entertainment, Shopping, Utilities, Healthcare, Education, Other`,c=`Analyze this bank statement/transaction data and provide comprehensive financial insights:

${n.substring(0,15e3)}

Provide detailed analysis with specific dollar amounts and percentages. Identify spending patterns and give actionable advice.`,p=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:i},{role:"user",content:c}],temperature:.5,max_tokens:3e3})});if(!p.ok)throw Error("LLM API error");let m=await p.json(),g=m.choices[0]?.message?.content||"";try{let e=g.match(/\{[\s\S]*\}/);t=JSON.parse(e?e[0]:g)}catch{throw Error("Failed to parse analysis")}return await d._.dataVaultReport.create({data:{userId:r.id,fileName:s,totalIncome:t.totalIncome,totalExpenses:t.totalExpenses,savingsRate:t.savingsRate,spendingByCategory:JSON.stringify(t.spendingByCategory),recommendations:JSON.stringify(t.recommendations),analysisResult:JSON.stringify(t)}}),await d._.user.update({where:{email:a.user.email},data:{dataVaultReports:{increment:1},dataVaultFreeUsed:!0}}),o.NextResponse.json({analysis:t})}catch(e){return console.error("DataVault analyze error:",e),o.NextResponse.json({error:"Failed to analyze finances"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/datavault/analyze/route",pathname:"/api/datavault/analyze",filename:"route",bundlePath:"app/api/datavault/analyze/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/datavault/analyze/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:g,staticGenerationAsyncStorage:y,serverHooks:h}=m,x="/api/datavault/analyze/route";function f(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:y})}},10191:(e,t,a)=>{a.d(t,{L:()=>l});var r=a(53797),n=a(13539),s=a(42023),i=a.n(s),o=a(52663);let l={adapter:(0,n.N)(o._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,r.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let t=await o._.user.findUnique({where:{email:e.email}});return t&&await i().compare(e.password,t.password)?{id:t.id,email:t.email,name:`${t.firstName??""} ${t.lastName??""}`.trim(),role:t.role}:null}})],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.id=t.id,e.role=t.role??"user"),e),session:async({session:e,token:t})=>(e.user&&(e.user.id=t.id,e.user.role=t.role),e)}}},52663:(e,t,a)=>{a.d(t,{_:()=>n});let r=require("@prisma/client"),n=globalThis.prisma??new r.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[9276,5972,2023,9637],()=>a(22650));module.exports=r})();