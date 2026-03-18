"use strict";(()=>{var e={};e.id=5708,e.ids=[5708],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},52402:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>y,patchFetch:()=>b,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>x,staticGenerationAsyncStorage:()=>h});var i={};t.r(i),t.d(i,{POST:()=>c,dynamic:()=>p});var s=t(49303),a=t(88716),n=t(60670),o=t(87070),l=t(75571),u=t(10191),d=t(52663);let p="force-dynamic";async function c(e){try{let r;let t=await (0,l.getServerSession)(u.L);if(!t?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let i=await d._.user.findUnique({where:{email:t.user.email},select:{id:!0,globeGuideSubscribed:!0,globeGuideFreeUsed:!0}});if(!i)return o.NextResponse.json({error:"User not found"},{status:404});if(!i.globeGuideSubscribed&&i.globeGuideFreeUsed)return o.NextResponse.json({error:"Subscription required"},{status:402});let{destination:s,duration:a,budget:n,interests:p}=await e.json();if(!s||!a)return o.NextResponse.json({error:"Missing required fields"},{status:400});let c=`You are GlobeGuide, an expert AI travel planner. Create detailed, personalized travel itineraries with local insights and hidden gems.

Respond ONLY with valid JSON in this exact format:
{
  "destination": "City, Country",
  "duration": number,
  "overview": "Brief 2-3 sentence overview of the trip",
  "bestTimeToVisit": "Month range or season",
  "estimatedBudget": { "low": number, "high": number },
  "mustTryFood": ["dish 1", "dish 2", "dish 3"],
  "hiddenGems": ["hidden gem 1", "hidden gem 2", "hidden gem 3"],
  "dailyPlans": [
    {
      "day": 1,
      "title": "Day title/theme",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "location": "Specific location",
          "tips": "Insider tip",
          "cost": "$XX or Free"
        }
      ]
    }
  ],
  "packingTips": ["tip 1", "tip 2"],
  "localPhrases": [{ "phrase": "local phrase", "meaning": "English meaning" }]
}`,m=`Create a ${a}-day travel itinerary for ${s}.

Budget level: ${n}
Interests: ${p.length>0?p.join(", "):"General sightseeing"}

Include 4-5 activities per day with specific times, locations, costs, and insider tips. Focus on authentic local experiences and hidden gems that most tourists miss.`,g=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:c},{role:"user",content:m}],temperature:.7,max_tokens:4e3})});if(!g.ok)throw Error("LLM API error");let h=await g.json(),x=h.choices[0]?.message?.content||"";try{let e=x.match(/\{[\s\S]*\}/);r=JSON.parse(e?e[0]:x)}catch{throw Error("Failed to parse itinerary")}return await d._.globeGuideTrip.create({data:{userId:i.id,destination:s,duration:a,budget:n,interests:JSON.stringify(p),itinerary:JSON.stringify(r)}}),await d._.user.update({where:{email:t.user.email},data:{globeGuideItineraries:{increment:1},globeGuideFreeUsed:!0}}),o.NextResponse.json({itinerary:r})}catch(e){return console.error("GlobeGuide generate error:",e),o.NextResponse.json({error:"Failed to generate itinerary"},{status:500})}}let m=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/globeguide/generate/route",pathname:"/api/globeguide/generate",filename:"route",bundlePath:"app/api/globeguide/generate/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/globeguide/generate/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:h,serverHooks:x}=m,y="/api/globeguide/generate/route";function b(){return(0,n.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:h})}},10191:(e,r,t)=>{t.d(r,{L:()=>l});var i=t(53797),s=t(13539),a=t(42023),n=t.n(a),o=t(52663);let l={adapter:(0,s.N)(o._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,i.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let r=await o._.user.findUnique({where:{email:e.email}});return r&&await n().compare(e.password,r.password)?{id:r.id,email:r.email,name:`${r.firstName??""} ${r.lastName??""}`.trim(),role:r.role}:null}})],callbacks:{jwt:async({token:e,user:r})=>(r&&(e.id=r.id,e.role=r.role??"user"),e),session:async({session:e,token:r})=>(e.user&&(e.user.id=r.id,e.user.role=r.role),e)}}},52663:(e,r,t)=>{t.d(r,{_:()=>s});let i=require("@prisma/client"),s=globalThis.prisma??new i.PrismaClient}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[9276,5972,2023,9637],()=>t(52402));module.exports=i})();