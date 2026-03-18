"use strict";(()=>{var e={};e.id=2417,e.ids=[2417],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},48807:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>h,routeModule:()=>m,serverHooks:()=>w,staticGenerationAsyncStorage:()=>y});var a={};r.r(a),r.d(a,{POST:()=>d,dynamic:()=>u});var i=r(49303),s=r(88716),n=r(60670),o=r(87070),l=r(75571),c=r(10191),p=r(52663);let u="force-dynamic";async function d(e){try{let t;let r=await (0,l.getServerSession)(c.L);if(!r?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let a=await p._.user.findUnique({where:{email:r.user.email},select:{id:!0,pawPairPurchased:!0}});if(!a)return o.NextResponse.json({error:"User not found"},{status:404});if(!a.pawPairPurchased)return o.NextResponse.json({error:"Purchase required"},{status:402});let{answers:i}=await e.json();if(!i||"object"!=typeof i)return o.NextResponse.json({error:"Quiz answers are required"},{status:400});let s=`You are PawPair, an expert pet matching AI. Based on the user's lifestyle quiz answers, recommend the top 3 most compatible pets (specific breeds or types).

For each match, provide:
1. Pet name (breed/type)
2. Match percentage (based on lifestyle compatibility)
3. Key traits
4. Why they're a good match
5. Things to consider

Quiz answer keys:
- living: apartment, house_small, house_large, rural
- activity: sedentary, moderate, active, very_active
- time: minimal, some, moderate, lots
- budget: low, medium, high, unlimited
- household: single, couple, family_older, family_young
- allergies: none, mild, severe
- experience: none, some, experienced, expert
- preference: dog, cat, small, any

Respond in this exact JSON format:
{
  "matches": [
    {
      "name": "Golden Retriever",
      "matchPercent": 95,
      "traits": ["Friendly", "Active", "Great with families"],
      "whyMatch": "Explanation of why this pet matches the lifestyle",
      "considerations": ["consideration1", "consideration2"]
    }
  ]
}`,n=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:s},{role:"user",content:`Here are my quiz answers:
${JSON.stringify(i,null,2)}

Find my perfect pet matches!`}],temperature:.7,max_tokens:2e3})});if(!n.ok)throw Error("LLM API request failed");let u=await n.json(),d=u.choices?.[0]?.message?.content||"";try{let e=d.match(/\{[\s\S]*\}/);if(e)t=JSON.parse(e[0]);else throw Error("No JSON found")}catch(e){t={matches:[{name:"Golden Retriever",matchPercent:85,traits:["Friendly","Loyal","Great with families"],whyMatch:"Golden Retrievers are adaptable, loving, and make excellent companions for various lifestyles.",considerations:["Requires regular exercise","Moderate shedding"]},{name:"Domestic Shorthair Cat",matchPercent:80,traits:["Independent","Low-maintenance","Affectionate"],whyMatch:"Cats are perfect for those with moderate time availability and appreciate independence.",considerations:["Need regular vet checkups","Indoor cats live longer"]},{name:"Labrador Retriever",matchPercent:75,traits:["Energetic","Playful","Trainable"],whyMatch:"Labs are versatile dogs that adapt well to most living situations.",considerations:["Need lots of exercise","Can be food-motivated"]}]}}return await p._.pawPairResult.create({data:{userId:a.id,quizAnswers:JSON.stringify(i),recommendedPets:JSON.stringify(t.matches),topMatch:t.matches[0]?.name,matchPercent:t.matches[0]?.matchPercent,matchReport:JSON.stringify(t)}}),await p._.user.update({where:{id:a.id},data:{pawPairQuizzes:{increment:1}}}),o.NextResponse.json(t)}catch(e){return console.error("Error analyzing pet compatibility:",e),o.NextResponse.json({error:"Analysis failed"},{status:500})}}let m=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/pawpair/analyze/route",pathname:"/api/pawpair/analyze",filename:"route",bundlePath:"app/api/pawpair/analyze/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/pawpair/analyze/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:h,staticGenerationAsyncStorage:y,serverHooks:w}=m,f="/api/pawpair/analyze/route";function g(){return(0,n.patchFetch)({serverHooks:w,staticGenerationAsyncStorage:y})}},10191:(e,t,r)=>{r.d(t,{L:()=>l});var a=r(53797),i=r(13539),s=r(42023),n=r.n(s),o=r(52663);let l={adapter:(0,i.N)(o._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,a.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let t=await o._.user.findUnique({where:{email:e.email}});return t&&await n().compare(e.password,t.password)?{id:t.id,email:t.email,name:`${t.firstName??""} ${t.lastName??""}`.trim(),role:t.role}:null}})],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.id=t.id,e.role=t.role??"user"),e),session:async({session:e,token:t})=>(e.user&&(e.user.id=t.id,e.user.role=t.role),e)}}},52663:(e,t,r)=>{r.d(t,{_:()=>i});let a=require("@prisma/client"),i=globalThis.prisma??new a.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[9276,5972,2023,9637],()=>r(48807));module.exports=a})();