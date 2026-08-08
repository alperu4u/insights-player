"use client";

import { useMemo, useState, type CSSProperties } from "react";

type Dimension = "Coachability" | "Confidence" | "Communication" | "Leadership" | "Competitiveness" | "Emotional Control" | "Resilience" | "Focus" | "Learning Style" | "Growth Mindset" | "Decision Making" | "Adaptability" | "Teamwork" | "Self-Awareness" | "Motivation" | "Discipline" | "Accountability" | "Pressure Response" | "Curiosity" | "Independence";
type Answers = Record<number, number>;
type Choice = { text: string; evidence: Partial<Record<Dimension, number>> };
type Question = { text: string; context: string; choices: Choice[] };
type PlayerGender = "boy" | "girl";
type ArchetypeMatch = { name:string; keys:Dimension[]; avatar:number; description:string; match:number };
type ArchetypeVoice = { role:string; leadership:string; pressure:string; mistakes:string; focus:string; parent:string[] };

const dimensions: Dimension[] = ["Coachability","Confidence","Communication","Leadership","Competitiveness","Emotional Control","Resilience","Focus","Learning Style","Growth Mindset","Decision Making","Adaptability","Teamwork","Self-Awareness","Motivation","Discipline","Accountability","Pressure Response","Curiosity","Independence"];
const reportDimensions: Dimension[] = ["Coachability","Confidence","Leadership","Communication","Resilience","Growth Mindset","Competitiveness","Focus","Decision Making","Teamwork"];
const questions: Question[] = [
  {text:"A coach stops an activity and gives you a correction you did not expect. What are you most likely to do?",context:"During training",choices:[
    {text:"Try the correction immediately and judge it after a few repetitions.",evidence:{Coachability:88,Adaptability:78,Curiosity:62}},
    {text:"Ask one question so I understand exactly what the coach wants first.",evidence:{Curiosity:92,Communication:78,Coachability:75}},
    {text:"Listen, but keep using what has normally worked for me until I see the difference.",evidence:{Independence:82,Confidence:72,Adaptability:38}},
    {text:"Think about the correction quietly and work on it later when I have more space.",evidence:{"Self-Awareness":75,Independence:72,Communication:42}}
  ]},
  {text:"You receive the ball in a crowded area and have very little time. What usually happens?",context:"Fast decision",choices:[
    {text:"I play the first safe option I notice.",evidence:{"Decision Making":70,Teamwork:72,Confidence:58}},
    {text:"I protect the ball for a moment and look for more information.",evidence:{Focus:80,"Decision Making":76,"Pressure Response":68}},
    {text:"I attempt the aggressive option if it could break a line.",evidence:{Confidence:84,Competitiveness:76,"Decision Making":63}},
    {text:"I often decide only after the pressure has already arrived.",evidence:{"Pressure Response":38,"Decision Making":34,Focus:45}}
  ]},
  {text:"A teammate makes the same mistake twice and it affects your side of the field. What do you do?",context:"Team communication",choices:[
    {text:"Give a short, specific instruction during the next stoppage.",evidence:{Communication:88,Leadership:82,Teamwork:76}},
    {text:"Adjust my own position to cover the problem without saying much.",evidence:{Adaptability:84,Teamwork:72,Communication:45}},
    {text:"Encourage the teammate first so the message does not lower confidence.",evidence:{Teamwork:90,Leadership:72,"Emotional Control":75}},
    {text:"Wait for the coach to address it because that is the coach’s role.",evidence:{Discipline:66,Independence:38,Leadership:35}}
  ]},
  {text:"Your team concedes after a mistake you were involved in. What is your next response?",context:"Mistake recovery",choices:[
    {text:"Quickly identify my part, then focus on the restart.",evidence:{Accountability:90,Resilience:88,"Emotional Control":84}},
    {text:"Try to make up for it immediately with a big play.",evidence:{Competitiveness:90,Resilience:68,"Decision Making":48}},
    {text:"Replay the mistake in my mind so I do not repeat it.",evidence:{"Self-Awareness":78,Focus:52,Resilience:40}},
    {text:"Look first at what the team shape or another player could have done differently.",evidence:{"Decision Making":64,Accountability:32,Teamwork:46}}
  ]},
  {text:"The session includes a repetitive technical exercise you already know. How do you approach it?",context:"Training habits",choices:[
    {text:"Set a personal accuracy or speed target to keep it demanding.",evidence:{Motivation:90,Discipline:86,Competitiveness:78}},
    {text:"Focus closely on one small technical detail each repetition.",evidence:{Focus:92,Discipline:82,"Growth Mindset":78}},
    {text:"Complete it correctly, but save most of my energy for game-like work.",evidence:{"Decision Making":70,Independence:72,Motivation:55}},
    {text:"My attention usually drops unless the coach adds competition.",evidence:{Competitiveness:78,Focus:35,Discipline:42}}
  ]},
  {text:"You are moved to an unfamiliar position just before kickoff. What feels most natural?",context:"Role change",choices:[
    {text:"Ask for the two most important responsibilities, then play.",evidence:{Adaptability:90,Communication:82,Coachability:82}},
    {text:"Use what I know about soccer and work the role out as the game develops.",evidence:{Independence:90,Confidence:80,Adaptability:72}},
    {text:"Play cautiously until I understand what is happening around me.",evidence:{Focus:75,"Decision Making":64,Confidence:44}},
    {text:"It takes me a while to stop thinking about my usual position.",evidence:{Adaptability:35,Resilience:48,"Emotional Control":52}}
  ]},
  {text:"Your team is losing late, but you have been playing well personally. What drives your decisions?",context:"Competitive moment",choices:[
    {text:"Increase the risk in my play because the team needs a change.",evidence:{Competitiveness:92,Confidence:82,"Decision Making":62}},
    {text:"Keep doing my role and trust the team structure.",evidence:{Discipline:88,Teamwork:82,"Emotional Control":80}},
    {text:"Try to get the ball more often and take responsibility.",evidence:{Leadership:84,Confidence:84,Independence:75}},
    {text:"Focus on finishing strongly so my own level does not drop.",evidence:{Motivation:78,Discipline:72,Teamwork:48}}
  ]},
  {text:"A coach explains a new tactical pattern. Which first step helps you most?",context:"Learning preference",choices:[
    {text:"Watch the coach or teammates demonstrate the movement.",evidence:{"Learning Style":90,Focus:72,Coachability:70}},
    {text:"Hear the reason behind the pattern and the problem it solves.",evidence:{Curiosity:90,"Decision Making":78,"Learning Style":72}},
    {text:"Walk through my own part slowly before adding pressure.",evidence:{"Learning Style":84,Discipline:72,Independence:68}},
    {text:"Start playing and learn from what goes wrong in live action.",evidence:{Adaptability:84,Confidence:74,"Growth Mindset":76}}
  ]},
  {text:"You disagree with a referee’s important decision. What are you most likely to do?",context:"Emotional control",choices:[
    {text:"Say something briefly, then move into position for the next play.",evidence:{Communication:68,"Emotional Control":78,Resilience:80}},
    {text:"Say nothing and use the frustration as extra energy.",evidence:{Competitiveness:84,"Emotional Control":76,Communication:45}},
    {text:"Ask the referee calmly what was seen when there is a chance.",evidence:{Communication:86,"Emotional Control":84,Curiosity:68}},
    {text:"The decision stays with me and affects how I play for a while.",evidence:{"Emotional Control":32,Resilience:35,Focus:38}}
  ]},
  {text:"You notice a teammate is quiet and struggling during a difficult game. What do you do?",context:"Team awareness",choices:[
    {text:"Check in with the teammate and offer one useful cue.",evidence:{Leadership:90,Communication:88,Teamwork:88}},
    {text:"Give visible encouragement but keep my own focus on the game.",evidence:{Teamwork:78,Focus:82,Leadership:64}},
    {text:"Take on more responsibility so the teammate has less pressure.",evidence:{Leadership:82,Competitiveness:72,Teamwork:68}},
    {text:"Leave space; some players recover better without attention.",evidence:{"Self-Awareness":64,Independence:68,Communication:42}}
  ]},
  {text:"After a match, the coach asks what you thought of your performance. What comes first?",context:"Reflection",choices:[
    {text:"One thing I helped the team with and one thing I need to improve.",evidence:{"Self-Awareness":92,Accountability:86,"Growth Mindset":82}},
    {text:"The moments that changed the result of the game.",evidence:{"Decision Making":82,Competitiveness:75,"Self-Awareness":70}},
    {text:"I ask what the coach noticed before giving my own view.",evidence:{Coachability:86,Curiosity:78,"Self-Awareness":62}},
    {text:"I need time or video before I can give a useful answer.",evidence:{Focus:76,"Self-Awareness":70,Communication:48}}
  ]},
  {text:"You are practicing alone and no one will know how hard you worked. What keeps the session going?",context:"Internal motivation",choices:[
    {text:"A clear plan or number of repetitions I decided beforehand.",evidence:{Discipline:92,Independence:88,Motivation:80}},
    {text:"The feeling that I am getting sharper as I work.",evidence:{Motivation:90,"Growth Mindset":84,Curiosity:62}},
    {text:"Imagining a future game or opponent where the work will matter.",evidence:{Competitiveness:88,Motivation:84,Focus:70}},
    {text:"I usually train better when someone else provides structure or energy.",evidence:{Teamwork:68,Independence:32,Motivation:48}}
  ]},
  {text:"Your first plan with the ball is no longer available. What do you tend to do?",context:"Adaptability",choices:[
    {text:"Move the ball to a teammate and immediately reposition.",evidence:{Teamwork:86,Adaptability:84,"Decision Making":80}},
    {text:"Protect it and wait for a new option to appear.",evidence:{Confidence:78,Focus:82,"Decision Making":75}},
    {text:"Use skill or speed to create a new option myself.",evidence:{Independence:88,Confidence:84,Competitiveness:72}},
    {text:"Return to the safest available option, even if it goes backward.",evidence:{Discipline:76,"Decision Making":78,"Pressure Response":72}}
  ]},
  {text:"A teammate gives you feedback that conflicts with what you thought happened. What do you do?",context:"Receiving feedback",choices:[
    {text:"Ask what the teammate saw and compare it with my view.",evidence:{Coachability:88,Communication:88,Curiosity:84}},
    {text:"Acknowledge it, then decide privately whether it fits.",evidence:{Independence:82,"Self-Awareness":74,"Emotional Control":72}},
    {text:"Explain what I saw so we can agree on the next action.",evidence:{Communication:86,Confidence:78,Teamwork:76}},
    {text:"Prefer to wait for the coach’s opinion before changing anything.",evidence:{Coachability:66,Independence:40,Discipline:68}}
  ]},
  {text:"You are chosen to lead a warm-up for the first time. How do you handle it?",context:"Leadership",choices:[
    {text:"Give clear directions and keep the group moving.",evidence:{Leadership:90,Communication:88,Confidence:84}},
    {text:"Use the normal team routine so everyone already knows what to do.",evidence:{Discipline:86,Teamwork:82,Leadership:68}},
    {text:"Ask another player to help demonstrate while I organize.",evidence:{Teamwork:90,Leadership:78,Communication:80}},
    {text:"Keep it simple because being watched makes me less comfortable.",evidence:{Accountability:72,Confidence:38,"Pressure Response":42}}
  ]},
  {text:"The coach gives the team a difficult goal that may take weeks to reach. What is your first reaction?",context:"Growth mindset",choices:[
    {text:"Break it into smaller targets I can measure each week.",evidence:{"Growth Mindset":90,Discipline:88,Focus:84}},
    {text:"Want to understand why this goal matters for our team.",evidence:{Curiosity:90,Teamwork:76,Motivation:76}},
    {text:"Feel motivated by proving we can do something difficult.",evidence:{Competitiveness:90,Confidence:78,Motivation:84}},
    {text:"Wait to see whether the plan works before fully buying into it.",evidence:{"Decision Making":68,Independence:70,Coachability:42}}
  ]},
  {text:"A high-pressure penalty shootout is approaching. Which response sounds most like you?",context:"Pressure",choices:[
    {text:"I want to take one and decide my routine early.",evidence:{"Pressure Response":92,Confidence:90,Discipline:76}},
    {text:"I will take one if selected, but I do not need to volunteer.",evidence:{Accountability:82,"Emotional Control":78,Teamwork:70}},
    {text:"I focus on supporting teammates and staying ready for what follows.",evidence:{Teamwork:88,Focus:82,"Pressure Response":68}},
    {text:"I can perform, but my thoughts and body feel noticeably different.",evidence:{"Self-Awareness":84,"Pressure Response":48,"Emotional Control":50}}
  ]},
  {text:"You see a teammate trying a creative play that has already failed twice. What is your instinct?",context:"Risk and creativity",choices:[
    {text:"Encourage the idea but suggest a better moment to try it.",evidence:{Communication:88,"Decision Making":86,Teamwork:84}},
    {text:"Keep making supporting runs because the play may work next time.",evidence:{Teamwork:88,Resilience:80,"Growth Mindset":76}},
    {text:"Ask for a simpler option until the team regains control.",evidence:{Leadership:78,Discipline:84,"Decision Making":80}},
    {text:"Let the teammate decide; I prefer to focus on my own role.",evidence:{Independence:78,Focus:74,Communication:38}}
  ]},
  {text:"You arrive at training feeling tired and unfocused. What are you most likely to do?",context:"Self-management",choices:[
    {text:"Tell the coach briefly, then set one realistic target for the session.",evidence:{"Self-Awareness":90,Communication:84,Accountability:86}},
    {text:"Follow my normal preparation routine and expect my energy to improve.",evidence:{Discipline:90,Resilience:78,Motivation:70}},
    {text:"Use the competitive activities to pull more energy out of myself.",evidence:{Competitiveness:88,Adaptability:74,Motivation:76}},
    {text:"Work quietly and avoid drawing attention to having an off day.",evidence:{Independence:76,Communication:38,"Self-Awareness":68}}
  ]},
  {text:"The coach gives the team freedom to solve a tactical problem with no immediate instruction. What role do you take?",context:"Independent problem-solving",choices:[
    {text:"Offer an idea and ask teammates what they are seeing.",evidence:{Leadership:88,Communication:90,Curiosity:84}},
    {text:"Experiment through play and adjust from the result.",evidence:{Adaptability:90,"Growth Mindset":82,Independence:82}},
    {text:"Observe a few repetitions before suggesting a pattern.",evidence:{Focus:90,"Decision Making":86,"Self-Awareness":70}},
    {text:"Work hard within my role and let more vocal players organize it.",evidence:{Discipline:82,Teamwork:72,Leadership:38}}
  ]}
];

function scoreAll(answers:Answers){
  const result = {} as Record<Dimension,number>; const totals={} as Record<Dimension,number>; const counts={} as Record<Dimension,number>;
  dimensions.forEach(d=>{totals[d]=0;counts[d]=0});
  questions.forEach((q,i)=>{const pick=answers[i+1]; if(!pick)return; const evidence=q.choices[pick-1]?.evidence||{}; Object.entries(evidence).forEach(([d,v])=>{totals[d as Dimension]+=v as number;counts[d as Dimension]++})});
  dimensions.forEach(d=>{result[d]=counts[d]?Math.round(totals[d]/counts[d]):50});
  return result;
}
function band(n:number){ return n>=75?"clear strength":n>=58?"emerging strength":n>=43?"situational":n>=28?"development area":"current challenge"; }
const behaviors: Record<Dimension,string> = {
  Coachability:"listen to feedback and test a coach’s correction",
  Confidence:"trust your ability and act without needing constant reassurance",
  Communication:"share useful information and ask for clarity when you need it",
  Leadership:"help organize, guide, or steady the players around you",
  Competitiveness:"raise your effort and look for ways to influence the result",
  "Emotional Control":"regain control of your reactions after frustration or disappointment",
  Resilience:"move forward after a mistake or difficult moment",
  Focus:"keep your attention on the next useful action",
  "Learning Style":"take in a new idea and turn it into action on the field",
  "Growth Mindset":"treat difficult skills as things that can improve with practice",
  "Decision Making":"notice your options and choose an action in time",
  Adaptability:"adjust when your role, position, or first plan changes",
  Teamwork:"make choices that help teammates and the team function together",
  "Self-Awareness":"notice what you are feeling, doing well, and needing to improve",
  Motivation:"find a reason to keep working even when the activity is difficult or repetitive",
  Discipline:"follow through on useful habits even when nobody is watching",
  Accountability:"recognize your part in an outcome and respond constructively",
  "Pressure Response":"stay usable and make purposeful choices when the moment feels important",
  Curiosity:"ask questions and look for the reason behind an instruction or situation",
  Independence:"solve problems and keep working without constant direction"
};
function sentence(label:Dimension,n:number){
  const action=behaviors[label];
  if(n>=75) return `Across the situations in this assessment, you often chose responses that show you can ${action}.`;
  if(n>=58) return `Several answers suggest you can ${action}, although this may be easier in some situations than others.`;
  if(n>=43) return `Your answers were mixed here: sometimes you appear ready to ${action}, while in other situations you prefer a different approach.`;
  if(n>=28) return `Right now, you may not consistently ${action}. This is a specific behavior that can be practiced.`;
  return `Your answers suggest it is currently difficult to ${action}, especially in demanding moments. That describes this response pattern—not a permanent limitation.`;
}
const archetypeVoices: Record<string,ArchetypeVoice> = {
  "The Field Captain":{role:"Steps into visible responsibility and helps give the group direction.",leadership:"Leads through clear instructions, teammate check-ins, and ownership of the group’s response.",pressure:"Often handles tension by becoming more active and giving the team something clear to follow.",mistakes:"Recovers best by owning the moment briefly, communicating the adjustment, and leading the next play.",focus:"Attention is strongest when there is a team problem to organize or a responsibility to carry.",parent:["Ask what responsibility the player took—not whether everyone followed.","Praise leadership that helps teammates think, rather than volume or control."]},
  "The Midfield Organizer":{role:"Connects players by noticing where the next pass, movement, or piece of information is needed.",leadership:"Leads tactically through positioning, passing options, and well-timed information.",pressure:"Often manages pressure by finding a workable option and keeping the team structure moving.",mistakes:"Recovers by identifying the missed option, then scanning earlier on the next play.",focus:"Attention centers on teammates, space, and how one action affects the next phase.",parent:["Ask what options the player noticed, including those not chosen.","Discuss what problem a safe or simple choice was solving."]},
  "The Team Connector":{role:"Supports teammates and adjusts to help the group function together.",leadership:"Leads relationally by encouraging, including, and filling gaps without demanding attention.",pressure:"Looks for a teammate or team action that can restore stability.",mistakes:"Recovers by reconnecting quickly with teammates instead of carrying the moment alone.",focus:"Sees the wider team picture, although personal details can be missed while helping others.",parent:["Ask how the player helped others and what the player needed too.","Recognize cooperation while encouraging personal ideas and needs."]},
  "The Goal Getter":{role:"Looks for a direct way to change the game and is energized by a visible challenge.",leadership:"Leads through initiative, demanding involvement, and raising the competitive level.",pressure:"May become more eager to act; urgency can make the boldest option feel better than the best one.",mistakes:"May try to make up for an error immediately; growth means keeping the ambition without forcing the next play.",focus:"Focus is strongest when there is a clear target, opponent, score, or outcome to chase.",parent:["Discuss decision quality, not only whether the ambitious play worked.","Set process targets alongside goals and statistics."]},
  "The Quiet Competitor":{role:"Contributes through personal standards, dependable work, and competition that needs little attention.",leadership:"Leads mostly by example through preparation, repetition, and reliability.",pressure:"Prefers to handle pressure internally and keep working rather than talk about it.",mistakes:"May recover quietly, so it helps to check whether the player reset or is still replaying the error.",focus:"Attention is helped by a personal task or standard the player can own.",parent:["Notice persistence without requiring the player to become louder.","Use calm, specific questions; silence does not always mean the moment is resolved."]},
  "The Calm Leader":{role:"Steadies the group and helps teammates see the next useful action.",leadership:"Leads selectively through calm information, emotional control, and dependable presence.",pressure:"Slows the moment mentally and gives the group stability rather than adding noise.",mistakes:"Resets calmly, while still needing to name and own the adjustment instead of only looking unaffected.",focus:"Returns attention to structure, the next task, and what the team can control.",parent:["Praise calm problem-solving, then ask what the player felt inside.","Do not assume a composed player needs no support."]},
  "The Tactical Thinker":{role:"Reads patterns and contributes through considered positioning and decisions.",leadership:"Leads with well-timed tactical observations rather than constant talking.",pressure:"Benefits from simple preplanned cues so limited time does not turn analysis into hesitation.",mistakes:"Learns through review, then needs one clear adjustment and permission to release the play.",focus:"Naturally tracks patterns, positioning, and cause-and-effect across the game.",parent:["Ask what pattern the player noticed and what one adjustment follows.","Put a time limit on postgame analysis so reflection does not become rumination."]},
  "The Relentless Learner":{role:"Seeks information, tests feedback, and helps make improvement normal within the group.",leadership:"Leads through curiosity, useful questions, and a willingness to accept correction.",pressure:"Benefits more from one familiar cue than from extra new information in a demanding moment.",mistakes:"Treats errors as learning material; progress means choosing one lesson rather than correcting everything at once.",focus:"Focus is strongest when the player understands the purpose and has one detail to test.",parent:["Ask what the player learned before asking how well they played.","Offer one observation at a time and leave room for the player’s conclusion."]},
  "The Creative Playmaker":{role:"Creates possibilities and attempts original solutions when the obvious option is closed.",leadership:"Leads through ideas and initiative rather than organizing the whole group.",pressure:"Pressure can unlock invention or rush it; the key is whether the creative choice fits the moment.",mistakes:"Separates the idea, timing, and execution before deciding whether to try the solution again.",focus:"Notices openings and possibilities, while routine team details may need a deliberate cue.",parent:["Ask what the player saw before judging an unsuccessful idea.","Balance freedom with one simple team responsibility to keep checking."]},
  "The Resilient Battler":{role:"Stays engaged through setbacks and gives the team competitive energy.",leadership:"Leads through effort, courage, and refusing to disappear after a difficult moment.",pressure:"Intensity rises under pressure; the goal is keeping that energy controlled enough for good choices.",mistakes:"Keeps fighting, but recovers best with a brief reset instead of chasing immediate redemption.",focus:"Can lock onto the contest or opponent; a tactical cue turns intensity into useful action.",parent:["Recognize the response after setbacks, not only toughness.","Help choose one reset action—breath, scan, or simple next pass."]},
  "The Composed Controller":{role:"Keeps decisions clear and helps the game feel manageable rather than chaotic.",leadership:"Leads through reliable choices and calm information that keeps teammates connected.",pressure:"Protects clarity, sees options, and avoids emotional rush when the moment becomes tense.",mistakes:"Recovers through a clean acknowledgment followed by the next simple action.",focus:"Stays with controllable information: ball, space, teammates, and the immediate decision.",parent:["Ask which choice helped the player regain control.","Discuss when control and risk were each appropriate."]},
  "The Adaptable Utility Player":{role:"Changes roles or methods without losing connection to the team.",leadership:"Leads through useful flexibility and by making transitions easier for others.",pressure:"Handles unexpected change best with one or two clear priorities for the new situation.",mistakes:"Recovers by adjusting to what the situation now requires rather than insisting on the original plan.",focus:"Responds to many cues, but a changing role needs a few anchor responsibilities.",parent:["Ask what changed and how the player adjusted.","Praise flexibility while helping identify the player’s strongest role."]},
  "The Independent Problem-Solver":{role:"Experiments and finds solutions without waiting for constant direction.",leadership:"Leads through initiative and useful solutions, even without being highly vocal.",pressure:"Self-trust helps action, but teammate information still matters before solving everything alone.",mistakes:"Uses the result as feedback and tests an adjustment instead of defending the first idea.",focus:"Concentrates best when given ownership of a real problem to solve.",parent:["Ask what the player tried, what happened, and what comes next.","Offer help before giving the solution so ownership remains with the player."]},
  "The Disciplined Builder":{role:"Contributes through repeatable habits, ownership, and patient improvement.",leadership:"Leads through reliability and standards rather than spotlight or emotion.",pressure:"Uses familiar routines to protect performance when the moment becomes unpredictable.",mistakes:"Returns to the process while naming the specific adjustment revealed by the error.",focus:"Works best with structure, measurable details, and a clear picture of a good repetition.",parent:["Recognize consistency, not only visible breakthroughs.","Leave room for experimentation so discipline does not become fear of change."]},
  "The Pressure Performer":{role:"Stays willing to act when the game reaches a demanding or visible moment.",leadership:"Leads through readiness, volunteering, and accepting responsibility.",pressure:"Important moments often increase involvement, especially when a clear routine is available.",mistakes:"Separates courage from outcome and reviews a failed high-pressure action without shame or revenge.",focus:"Importance sharpens attention; ordinary training may need a self-created challenge.",parent:["Praise willingness and preparation separately from the outcome.","Ask what routine the player wants to repeat next time."]}
};
function evidenceLead(score:number,strong:string,mixed:string,developing:string){return score>=68?strong:score>=48?mixed:developing;}
function voiceFor(type:ArchetypeMatch|null,scores:Record<Dimension,number>){
  const v=type?archetypeVoices[type.name]:null;
  return {role:v?.role??"The answers do not support one fixed team role; contribution may change by situation.",leadership:evidenceLead(scores.Leadership,v?.leadership??"Often organizes or supports others.",`Leadership appears situational. ${v?.leadership??"Some answers favor initiative and others favor contributing without directing."}`,`Leadership is not yet consistent. ${v?.leadership??"Small, clear responsibilities can build it."}`),pressure:evidenceLead(scores["Pressure Response"],v?.pressure??"Often stays purposeful under pressure.",`Pressure response was mixed. ${v?.pressure??"The reaction may depend on the moment."}`,`Pressure may currently change timing or choices. ${v?.pressure??"A short routine can be trained."}`),mistakes:evidenceLead(scores.Resilience,v?.mistakes??"Often returns to the next action.",`Mistake recovery appears situational. ${v?.mistakes??""}`,`Mistakes may stay with the player longer than useful. ${v?.mistakes??"Practice acknowledge, reset, refocus."}`),focus:evidenceLead(scores.Focus,v?.focus??"Often stays connected to the next action.",`Focus changes across situations. ${v?.focus??""}`,`Sustained focus is a development need. ${v?.focus??"Use one observable cue per activity."}`),parent:v?.parent??["Ask what the player noticed before evaluating.","Use the report as questions, not permanent labels."]};
}
function archetypes(scores:Record<Dimension,number>):ArchetypeMatch[]{
  const candidates = [
    {name:"The Field Captain", keys:["Leadership","Communication","Accountability"] as Dimension[],description:"Steps forward, gives useful direction, and accepts responsibility for the group."},
    {name:"The Midfield Organizer", keys:["Decision Making","Communication","Teamwork"] as Dimension[],description:"Connects teammates and looks for the choice that keeps the team functioning."},
    {name:"The Team Connector", keys:["Teamwork","Communication","Adaptability"] as Dimension[],description:"Helps different players work together and adjusts to what the team needs."},
    {name:"The Goal Getter", keys:["Competitiveness","Confidence","Motivation"] as Dimension[],description:"Is energized by challenges and looks for direct ways to influence the result."},
    {name:"The Quiet Competitor", keys:["Competitiveness","Independence","Discipline"] as Dimension[],description:"Competes through steady work and self-direction, even without much attention."},
    {name:"The Calm Leader", keys:["Leadership","Emotional Control","Pressure Response"] as Dimension[],description:"Can steady the moment and guide others without needing to be the loudest player."},
    {name:"The Tactical Thinker", keys:["Decision Making","Focus","Self-Awareness"] as Dimension[],description:"Studies what is happening, notices patterns, and thinks carefully about the next action."},
    {name:"The Relentless Learner", keys:["Coachability","Growth Mindset","Curiosity"] as Dimension[],description:"Looks for feedback, asks why, and treats difficult skills as learnable."},
    {name:"The Creative Playmaker", keys:["Confidence","Curiosity","Independence"] as Dimension[],description:"Explores possibilities and is willing to create a solution instead of waiting for one."},
    {name:"The Resilient Battler", keys:["Resilience","Competitiveness","Emotional Control"] as Dimension[],description:"Keeps competing through setbacks and works to regain control after difficult moments."},
    {name:"The Composed Controller", keys:["Emotional Control","Focus","Decision Making"] as Dimension[],description:"Tries to stay clear-headed, read the options, and keep the next action useful."},
    {name:"The Adaptable Utility Player", keys:["Adaptability","Coachability","Teamwork"] as Dimension[],description:"Can take instruction, change roles, and contribute where the team needs help."},
    {name:"The Independent Problem-Solver", keys:["Independence","Decision Making","Curiosity"] as Dimension[],description:"Likes to read the problem, test ideas, and find a solution without constant direction."},
    {name:"The Disciplined Builder", keys:["Discipline","Accountability","Growth Mindset"] as Dimension[],description:"Improves through dependable habits, ownership, and patient work over time."},
    {name:"The Pressure Performer", keys:["Pressure Response","Confidence","Focus"] as Dimension[],description:"Appears ready to stay involved and act purposefully when the moment feels important."},
  ];
  const profileAverage=dimensions.reduce((sum,key)=>sum+scores[key],0)/dimensions.length;
  return candidates.map((c,avatar)=>{
    const evidenceAverage=c.keys.reduce((sum,key)=>sum+scores[key],0)/c.keys.length;
    const distinctiveness=evidenceAverage-profileAverage;
    const match=Math.max(0,Math.min(100,Math.round(evidenceAverage+distinctiveness*.35)));
    return {...c,avatar,match};
  }).sort((a,b)=>b.match-a.match);
}

function Radar({scores}:{scores:Record<Dimension,number>}){
  const keys = reportDimensions.slice(0,6), center=110, radius=76;
  const point=(i:number,r:number)=>{const a=-Math.PI/2+i*Math.PI*2/keys.length;return `${center+Math.cos(a)*r},${center+Math.sin(a)*r}`};
  return <svg className="radar" viewBox="0 0 220 220" role="img" aria-label="Player score radar chart">
    {[.25,.5,.75,1].map(r=><polygon key={r} points={keys.map((_,i)=>point(i,radius*r)).join(" ")} className="radar-grid" />)}
    {keys.map((_,i)=><line key={i} x1={center} y1={center} x2={point(i,radius).split(",")[0]} y2={point(i,radius).split(",")[1]} className="radar-line" />)}
    <polygon points={keys.map((k,i)=>point(i,radius*scores[k]/100)).join(" ")} className="radar-shape" />
    {keys.map((k,i)=>{const [x,y]=point(i,98).split(",");return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{k==='Growth Mindset'?'Growth':k}</text>})}
  </svg>
}

export default function Home(){
  const [step,setStep]=useState<"intro"|"form"|"report">("intro"); const [answers,setAnswers]=useState<Answers>({});
  const [info,setInfo]=useState<{name:string;email:string;age:string;position:string;notes:string;gender:PlayerGender|"";consent:boolean}>({name:"",email:"",age:"",position:"",notes:"",gender:"",consent:false}); const [current,setCurrent]=useState(0); const [sending,setSending]=useState(false); const [sent,setSent]=useState("");
  const scores=useMemo(()=>scoreAll(answers),[answers]); const matches=useMemo(()=>archetypes(scores),[scores]); const type=matches[0]?.match>=58?matches[0]:null; const closeMatches=type?matches.slice(0,4):matches.slice(0,3);
  const voice=useMemo(()=>voiceFor(type,scores),[type,scores]);
  const strengths=[...dimensions].sort((a,b)=>scores[b]-scores[a]).slice(0,3); const priorities=[...dimensions].sort((a,b)=>scores[a]-scores[b]).slice(0,5);
  const answered=Object.keys(answers).length; const date=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
  async function submit(){ if(!info.name||!info.email||answered<20)return; setSending(true); setStep("report"); window.scrollTo({top:0,behavior:"smooth"});
    try{const res=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({player:info,answers,questions:questions.map(q=>q.text),scores,archetype:type?.name??null,archetypeMatches:matches.slice(0,4).map(m=>({name:m.name,match:m.match})),completedAt:new Date().toISOString()})}); const data=await res.json(); setSent(data.emailSent?"Your report was emailed successfully, and Coach Al was notified.":"Your report is ready. Email delivery activates when the private Sheet is connected.");}catch{setSent("Your report is ready to download.");}finally{setSending(false)} }
  async function downloadPdf(){
    const {jsPDF}=await import('jspdf'); const doc=new jsPDF({unit:'pt',format:'letter'}); const blue=[17,91,168] as [number,number,number];
    doc.setFillColor(10,35,66);doc.rect(0,0,612,792,'F');doc.setFillColor(...blue);doc.circle(505,120,110,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text('CASTRO PLAYER DEVELOPMENT',54,82);doc.setFontSize(36);doc.text('PLAYER',54,245);doc.text('DEVELOPMENT',54,286);doc.text('PROFILE',54,327);doc.setFont('helvetica','normal');doc.setFontSize(18);doc.text(info.name,54,410);doc.setFontSize(11);doc.setTextColor(190,210,232);doc.text(`Assessment completed ${date}`,54,434);doc.text('Evidence-based. Development-focused. Never a label.',54,700);
    doc.addPage();doc.setTextColor(24);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text(type?.name??'Developing Profile',48,58);doc.setFontSize(10);doc.setTextColor(...blue);doc.text('LEADING PLAYER ARCHETYPE',48,78);doc.setTextColor(24);doc.setFont('helvetica','normal');doc.setFontSize(11);const summary=`${info.name}'s responses most strongly support ${strengths.map(s=>s.toLowerCase()).join(', ')}. ${strengths.map(s=>sentence(s,scores[s])).join(' ')} ${type?`${type.name} is used as a descriptive theme because the related response pattern is comparatively consistent.`:'No archetype was assigned because the response pattern did not provide strong enough evidence for one.'}`;doc.text(doc.splitTextToSize(summary,516),48,108,{lineHeightFactor:1.5});
    let y=225;doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('Archetype mix',48,y);y+=24;closeMatches.forEach((match,index)=>{doc.setFontSize(10);doc.setTextColor(35);doc.text(`${index===0?'Leading':'Nearby'} · ${match.name}`,48,y);doc.text(`${match.match}%`,540,y,{align:'right'});doc.setFillColor(225,232,240);doc.roundedRect(190,y-8,315,7,3,3,'F');doc.setFillColor(...blue);doc.roundedRect(190,y-8,315*match.match/100,7,3,3,'F');y+=17;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90);doc.text(doc.splitTextToSize(match.description,480),48,y);doc.setFont('helvetica','bold');y+=30;});
    y+=6;doc.setFont('helvetica','bold');doc.setFontSize(18);doc.setTextColor(24);doc.text('Core scores',48,y);y+=28;reportDimensions.forEach(k=>{doc.setFontSize(10);doc.setTextColor(40);doc.text(k,48,y);doc.text(String(scores[k]),540,y,{align:'right'});doc.setFillColor(225,232,240);doc.roundedRect(170,y-8,340,7,3,3,'F');doc.setFillColor(...blue);doc.roundedRect(170,y-8,340*scores[k]/100,7,3,3,'F');y+=24;});
    doc.addPage();doc.setTextColor(24);doc.setFontSize(22);doc.text('Development priorities',48,58);y=92;priorities.forEach((k,i)=>{doc.setFontSize(13);doc.text(`${i+1}. ${k} — ${scores[k]}/100`,48,y);doc.setFont('helvetica','normal');doc.setFontSize(10);const t=`Why it matters: Stronger ${k.toLowerCase()} can make learning and match responses more consistent. Practice: choose one small, observable behavior before each session and review it afterward. Progress: fewer reminders, quicker recovery, or more frequent use of the behavior in game-like moments.`;doc.text(doc.splitTextToSize(t,510),48,y+18,{lineHeightFactor:1.35});doc.setFont('helvetica','bold');y+=84;});doc.save(`${info.name.replace(/[^a-z0-9]/gi,'-').toLowerCase()}-player-profile.pdf`);
  }

  return <main>
    <header className="topbar"><a className="brand" href="#" onClick={()=>setStep('intro')}><span className="mark">CPD</span><span>CASTRO <b>PLAYER DEVELOPMENT</b></span></a><span className="method">EVIDENCE-BASED PLAYER INSIGHT</span></header>
    {step==='intro'&&<section className="hero"><div className="pitch-lines"/><div className="hero-copy"><p className="eyebrow">PLAYER DEVELOPMENT PROFILE · 20 SCENARIOS</p><h1>Understand the player.<br/><em>Develop the person.</em></h1><p className="lede">Choose what you would most likely do in realistic soccer situations. Every option reflects a different approach—there are no perfect answers.</p><button className="primary" onClick={()=>setStep('form')}>Begin assessment <span>→</span></button><p className="quiet">About 8 minutes · Private · Development-focused</p></div><aside className="profile-card"><div className="card-top"><span>WHAT YOU’LL DISCOVER</span><b>01 / 04</b></div><div className="mini-field"><div className="field-circle"/><span className="player-dot p1"/><span className="player-dot p2"/><span className="player-dot p3"/></div><h2>A clearer coaching picture</h2><p>Communication, learning, pressure response, teamwork and the next priorities to train.</p><div className="chips"><span>PDF REPORT</span><span>COACH ACTIONS</span><span>PARENT GUIDE</span></div></aside></section>}
    {step==='form'&&<section className="assessment"><div className="form-head"><div><p className="eyebrow">PLAYER ASSESSMENT</p><h1>{current===0?'First, tell us about the player.':`Question ${current} of 20`}</h1></div><div className="progress-meta"><span>{Math.round((current/20)*100)}%</span><div><i style={{width:`${current/20*100}%`}}/></div></div></div>
      {current===0?<div className="info-grid"><label>Player name<input value={info.name} onChange={e=>setInfo({...info,name:e.target.value})} placeholder="Full name"/></label><label>Parent / player email<input type="email" value={info.email} onChange={e=>setInfo({...info,email:e.target.value})} placeholder="name@email.com"/></label><label>Age <input value={info.age} onChange={e=>setInfo({...info,age:e.target.value})} placeholder="e.g. 12"/></label><label>Primary position<input value={info.position} onChange={e=>setInfo({...info,position:e.target.value})} placeholder="e.g. Center midfielder"/></label><fieldset className="character-choice wide"><legend>Gender</legend><p>This only selects the matching superhero artwork. It never changes the player’s scores or archetype.</p><div><button type="button" className={info.gender==='boy'?'selected':''} onClick={()=>setInfo({...info,gender:'boy'})}>Boy</button><button type="button" className={info.gender==='girl'?'selected':''} onClick={()=>setInfo({...info,gender:'girl'})}>Girl</button></div></fieldset><label className="wide">Coach notes <span>(optional)</span><textarea value={info.notes} onChange={e=>setInfo({...info,notes:e.target.value})} placeholder="Context for this assessment or future reassessment"/></label><label className="wide consent"><input type="checkbox" checked={info.consent} onChange={e=>setInfo({...info,consent:e.target.checked})}/><span>I am the player or the player’s parent/guardian, and I consent to these responses being stored privately and emailed for development purposes.</span></label></div>:<div className="question-card scenario-card"><p className="dimension">{questions[current-1].context.toUpperCase()} · CHOOSE THE CLOSEST MATCH</p><h2>{questions[current-1].text}</h2><div className="scale scenario-options">{questions[current-1].choices.map((choice,i)=><button key={choice.text} className={answers[current]===i+1?'selected':''} onClick={()=>setAnswers({...answers,[current]:i+1})}><b>{String.fromCharCode(65+i)}</b><span>{choice.text}</span></button>)}</div><p className="hint">Choose what you would most likely do—not what sounds most impressive. Each option has useful qualities and tradeoffs.</p></div>}
      <div className="form-actions"><button className="back" disabled={current===0} onClick={()=>setCurrent(Math.max(0,current-1))}>← Back</button>{current<20?<button className="primary" disabled={(current===0&&(!info.name||!info.email||!info.gender||!info.consent))||(current>0&&!answers[current])} onClick={()=>setCurrent(current+1)}>Continue →</button>:<button className="primary" disabled={!answers[20]||sending} onClick={submit}>{sending?'Building profile…':'Generate my profile →'}</button>}</div>
    </section>}
    {step==='report'&&<section className="report"><div className="report-hero"><div><p className="eyebrow">CASTRO PLAYER DEVELOPMENT · CONFIDENTIAL</p><h1>{info.name}</h1><p>Player Development Profile</p><div className="report-meta"><span>{date}</span><span>{info.position||'Player'}</span><span>Assessment 01</span></div></div><div className="archetype-feature">{type&&<div className={`archetype-avatar ${info.gender==='girl'?'girl':''}`} role="img" aria-label={`${type.name} ${info.gender} superhero avatar`} style={{"--avatar-col":type.avatar%5,"--avatar-row":Math.floor(type.avatar/5)} as CSSProperties}/>}<div className="score-seal archetype-seal"><span>LEADING ARCHETYPE</span><b>{type?.name??'Developing Profile'}</b>{type&&<strong>{type.match}% match</strong>}</div></div></div>
      <div className="report-toolbar"><p>{sent||'Building your delivery confirmation…'}</p><button onClick={downloadPdf}>Download PDF ↓</button></div>
      <div className="report-grid"><article className="paper summary"><p className="section-no">01 · EXECUTIVE SUMMARY</p><h2>A player still in motion—not a fixed type.</h2><p>{info.name}’s responses most strongly support <b>{strengths.map(s=>s.toLowerCase()).join(', ')}</b>. {strengths.map(s=>sentence(s,scores[s])).join(' ')}</p><p>{type?`The descriptive theme “${type.name}” fits because the related answers form one of the clearest patterns in this assessment. It is a conversation starter, not an identity.`:'No archetype was assigned. The answers do not show a pattern strong and consistent enough to justify one—and the report will not force a label.'}</p><div className="evidence-note">Interpretation rule: scores describe this set of answers on this date. They are not diagnoses, predictions, or permanent traits.</div></article><article className="paper radar-wrap"><p className="section-no">02 · PROFILE SHAPE</p><Radar scores={scores}/><p>Higher points indicate stronger support in the response pattern—not greater worth or potential.</p></article></div>
      <article className="paper archetype-spectrum"><p className="section-no">03 · ARCHETYPE MIX</p><h2>One leading pattern, with other sides nearby.</h2><p className="spectrum-intro">These percentages are relative matches to this assessment—not probabilities or permanent personality scores. Players can show several patterns depending on the situation.</p><div className="match-list">{closeMatches.map((match,index)=><div className="match-row" key={match.name}><div className={`archetype-avatar small ${info.gender==='girl'?'girl':''}`} role="img" aria-label={`${match.name} ${info.gender} superhero avatar`} style={{"--avatar-col":match.avatar%5,"--avatar-row":Math.floor(match.avatar/5)} as CSSProperties}/><div className="match-copy"><div><h3>{index===0&&type?'Leading match':index===0?'Closest pattern':'Also present'} · {match.name}</h3><b>{match.match}%</b></div><i><em style={{width:`${match.match}%`}}/></i><p>{match.description}</p></div></div>)}</div></article>
      <article className="paper scores"><div><p className="section-no">04 · CORE INDICATORS</p><h2>What the answers support</h2></div><div className="bars">{reportDimensions.map(k=><div className="bar" key={k}><div><span>{k}</span><small>{band(scores[k])}</small><b>{scores[k]}</b></div><i><em style={{width:`${scores[k]}%`}}/></i></div>)}</div></article>
      <div className="report-grid"><article className="paper"><p className="section-no">04 · LEARNING & COMMUNICATION</p><h2>How this player may learn best</h2><p>{sentence('Learning Style',scores['Learning Style'])} {scores['Learning Style']>=58?'The answers indicate that seeing the movement and then trying it shortly afterward may help. A coach can demonstrate one skill, give one clear instruction—such as “open your hips before receiving”—and let the player repeat it immediately.':'The answers do not point clearly to only one way of learning. A coach should combine a short explanation, a visual demonstration, and a chance to try the skill, then ask the player which part made the idea click.'}</p><h3>Communication style</h3><p>{sentence('Communication',scores.Communication)} In practice, give the player space to ask a question or repeat the instruction in their own words; this confirms understanding more clearly than silence does.</p></article><article className="paper"><p className="section-no">05 · MENTAL GAME</p><h2>Pressure, mistakes & focus</h2><h3>Under pressure</h3><p>{voice.pressure}</p><h3>After a mistake</h3><p>{voice.mistakes}</p><h3>Staying focused</h3><p>{voice.focus}</p><h3>Competitive mindset</h3><p>{sentence('Competitiveness',scores.Competitiveness)} Competitive energy may look like extra effort, taking responsibility, or wanting a difficult challenge; it does not have to look loud or emotional.</p></article></div>
      <div className="report-grid"><article className="paper"><p className="section-no">06 · TEAM DYNAMICS</p><h2>Role, leadership & collaboration</h2><h3>Likely role in the group</h3><p>{voice.role}</p><h3>How leadership may appear</h3><p>{voice.leadership}</p><h3>Working with teammates</h3><p>{sentence('Teamwork',scores.Teamwork)} {sentence('Adaptability',scores.Adaptability)}</p><h3>For the coach</h3><ul><li>Give one observable behavior to try, then ask what the player noticed.</li><li>Use short feedback loops: cue, repetition, player reflection.</li><li>Match responsibility to current evidence and reassess after real game situations.</li></ul></article><article className="paper"><p className="section-no">07 · SUPPORT AT HOME</p><h2>For the parent of {type?.name.replace('The ','a ')??'this player'}</h2><ul>{voice.parent.map(item=><li key={item}>{item}</li>)}<li>Use the archetype as a conversation starter, not a permanent description.</li></ul><p className="parent-note">Helpful prompt: “When did this part of your profile show up today—and when did you respond differently?”</p></article></div>
      <article className="paper priorities"><p className="section-no">08 · DEVELOPMENT PRIORITIES</p><h2>Five opportunities to train next</h2><div className="priority-grid">{priorities.map((k,i)=><div key={k}><span>0{i+1}</span><h3>{k}</h3><p><b>Why it matters</b>More consistency here can improve learning and match responses.</p><p><b>Try this</b>Choose one small, visible behavior before each session; review it with one example afterward.</p><p><b>Progress may look like</b>Fewer reminders, quicker recovery, or more frequent use in game-like moments.</p></div>)}</div></article>
      <article className="closing"><span className="mark">CPD</span><div><p className="section-no">CLOSING NOTE</p><h2>Use the profile. Keep watching the player.</h2><p>This assessment gives {info.name}, family and coaches a shared starting point. The most useful next step is not to protect the scores—it is to test the ideas in training, notice what changes, and reassess with fresh evidence over time.</p></div></article>
    </section>}
    <footer><span>CASTRO PLAYER DEVELOPMENT</span><span>Better insight. Better coaching. Better growth.</span></footer>
  </main>
}
