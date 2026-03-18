"use strict";(()=>{var e={};e.id=2274,e.ids=[2274],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},14325:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>y,patchFetch:()=>x,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>f,staticGenerationAsyncStorage:()=>h});var o={};r.r(o),r.d(o,{POST:()=>d,dynamic:()=>u});var i=r(49303),a=r(88716),n=r(60670),s=r(87070),c=r(75571),p=r(10191),l=r(52663);let u="force-dynamic";async function d(e){try{let t;let r=await (0,c.getServerSession)(p.L);if(!r?.user?.email)return s.NextResponse.json({error:"Unauthorized"},{status:401});let o=await l._.user.findUnique({where:{email:r.user.email},select:{id:!0,coachLogicSubscribed:!0,coachLogicFreePlanUsed:!0,coachLogicSubExpiresAt:!0}});if(!o)return s.NextResponse.json({error:"User not found"},{status:404});let i=o.coachLogicSubscribed&&(!o.coachLogicSubExpiresAt||new Date(o.coachLogicSubExpiresAt)>new Date),a=!o.coachLogicFreePlanUsed;if(!i&&!a)return s.NextResponse.json({error:"Subscription required"},{status:402});let{sport:n,opponentNotes:u,practiceGoals:d,duration:m}=await e.json();if(!n||!u)return s.NextResponse.json({error:"Sport and opponent notes are required"},{status:400});let g=`You are CoachLogic, an expert sports coach AI. Generate a detailed practice plan based on the opponent scouting report.

Create a structured ${m}-minute practice plan that addresses the opponent's weaknesses and strengthens the team against the opponent's strengths.

The plan should include:
1. Warm-up (appropriate for the sport)
2. 3-4 main drills targeting specific skills needed against this opponent
3. Scrimmage/game simulation
4. Cool down
5. Coach notes for emphasis during practice

Respond in this exact JSON format:
{
  "sport": "${n}",
  "duration": ${m},
  "focusAreas": ["area1", "area2", "area3"],
  "warmup": {
    "name": "Dynamic Warm-Up",
    "duration": 10,
    "description": "Description of warm-up routine",
    "keyPoints": ["point1", "point2"]
  },
  "mainDrills": [
    {
      "name": "Drill Name",
      "duration": 15,
      "description": "Detailed drill description",
      "keyPoints": ["coaching point 1", "coaching point 2"]
    }
  ],
  "scrimmage": {
    "name": "Controlled Scrimmage",
    "duration": 15,
    "description": "Description of scrimmage rules and focus",
    "keyPoints": ["point1", "point2"]
  },
  "cooldown": {
    "name": "Cool Down & Review",
    "duration": 5,
    "description": "Cool down routine",
    "keyPoints": ["point1", "point2"]
  },
  "coachNotes": ["note1", "note2", "note3"]
}`,h=`Sport: ${n}
Practice Duration: ${m} minutes

Opponent Scouting Report:
${u}

${d?`Practice Goals:
${d}`:""}

Generate a comprehensive practice plan to prepare my team against this opponent.`,f=await fetch("https://routellm.abacus.ai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.ABACUSAI_API_KEY}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:g},{role:"user",content:h}],temperature:.7,max_tokens:3e3})});if(!f.ok)throw Error("LLM API request failed");let y=await f.json(),x=y.choices?.[0]?.message?.content||"";try{let e=x.match(/\{[\s\S]*\}/);if(e)t=JSON.parse(e[0]);else throw Error("No JSON found")}catch(e){t={sport:n,duration:m,focusAreas:["Fundamentals","Defense","Teamwork"],warmup:{name:"Dynamic Warm-Up",duration:10,description:"Light jogging, dynamic stretches, and sport-specific movements to prepare the body.",keyPoints:["Gradually increase intensity","Focus on major muscle groups"]},mainDrills:[{name:"Skill Development Drill",duration:15,description:"Focus on fundamental skills needed for competition.",keyPoints:["Emphasize proper technique","Provide individual feedback"]},{name:"Team Coordination Drill",duration:15,description:"Work on team communication and coordination.",keyPoints:["Encourage verbal communication","Practice game-like scenarios"]}],scrimmage:{name:"Controlled Scrimmage",duration:15,description:"Full-speed practice game with specific focus areas.",keyPoints:["Apply skills from drills","Simulate game pressure"]},cooldown:{name:"Cool Down & Debrief",duration:5,description:"Static stretching and team discussion.",keyPoints:["Review key learnings","Set goals for next practice"]},coachNotes:["Focus on positive reinforcement","Monitor player energy levels","Adjust drills based on execution"]}}return await l._.coachLogicPlan.create({data:{userId:o.id,sport:n,opponentNotes:u,practiceGoals:d||null,planContent:JSON.stringify(t),duration:m}}),await l._.user.update({where:{id:o.id},data:{coachLogicPlans:{increment:1},coachLogicFreePlanUsed:!i||void 0}}),s.NextResponse.json(t)}catch(e){return console.error("Error generating practice plan:",e),s.NextResponse.json({error:"Generation failed"},{status:500})}}let m=new i.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/coachlogic/generate/route",pathname:"/api/coachlogic/generate",filename:"route",bundlePath:"app/api/coachlogic/generate/route"},resolvedPagePath:"/home/ubuntu/ai_empire/app/api/coachlogic/generate/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:g,staticGenerationAsyncStorage:h,serverHooks:f}=m,y="/api/coachlogic/generate/route";function x(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:h})}},10191:(e,t,r)=>{r.d(t,{L:()=>c});var o=r(53797),i=r(13539),a=r(42023),n=r.n(a),s=r(52663);let c={adapter:(0,i.N)(s._),session:{strategy:"jwt"},pages:{signIn:"/auth/login"},providers:[(0,o.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;let t=await s._.user.findUnique({where:{email:e.email}});return t&&await n().compare(e.password,t.password)?{id:t.id,email:t.email,name:`${t.firstName??""} ${t.lastName??""}`.trim(),role:t.role}:null}})],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.id=t.id,e.role=t.role??"user"),e),session:async({session:e,token:t})=>(e.user&&(e.user.id=t.id,e.user.role=t.role),e)}}},52663:(e,t,r)=>{r.d(t,{_:()=>i});let o=require("@prisma/client"),i=globalThis.prisma??new o.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[9276,5972,2023,9637],()=>r(14325));module.exports=o})();