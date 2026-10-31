/* Standalone reconstruction of BORED.com's Judgemental Eye.
   Behavior reconstructed from the repository's recorded source capture. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const eye = $("#eye"), iris = $("#iris"), lid = $("#lid"), bubble = $("#bubble");
  const root = $("#eye-root");
  const feedback = $("#feedback");
  const backTop = $("#back-top");
  let pupil = {x:0,y:0}, lidHeight=45, idleTimer, bubbleTimer, dizzyTimer;
  let lastPointer={x:0,y:0}, movement=0, movementTimes=[], lastScroll=0, scrollDirection=null, scrollTimes=[];
  let dizzy=false, poked=false, bookmarkShown=false, feedbackCurrent=null, downvoteMode=false;
  const choose = a => a[Math.floor(Math.random()*a.length)];
  const idleLines=["Fell asleep?","Hello?","Still there?","...","Bored of being bored?","I'm still here","Waiting...","Take your time I guess","Zzz"];
  const clickLines=["More procrastination?","Productivity -1","Why did you click that?","Interesting choice...","You should be working","That's not gonna help","I'm watching you","Another click, another regret","Bold move","Really?","Questionable decision","Sure, go ahead","I saw that","Click click click...","Mhm"];
  const scrollLines=["Slow down, speed racer","Looking for something?","You scroll, I judge","Whoa there","In a hurry?","That's a lot of scrolling","Still scrolling huh"];
  const pokeLines=["OUCH! You'll regret that!","OW! That's it, you're gone!","HEY! Fine, GO AWAY!","ARGH! You asked for it!","OOF! Now you've done it!","ACK! Bye bye!"];
  const dizzyLines=["Stop it! I'm getting dizzy!","Okay okay, you win! Stop spinning me!","I'm gonna throw up...","STOP! Everything is spinning!","Ugh... dizzy... please stop...","You're making me sick!","Why are you doing this to me?!","Too... much... movement..."];
  const say = (text, duration=3000) => {
    if (feedbackCurrent || poked) return;
    bubble.textContent=text; bubble.classList.add("show");
    clearTimeout(bubbleTimer); bubbleTimer=setTimeout(()=>bubble.classList.remove("show"),duration);
  };
  function look(x,y) {
    const r=eye.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    const angle=Math.atan2(y-cy,x-cx), dist=Math.min(10,Math.hypot(x-cx,y-cy)/10);
    pupil={x:Math.cos(angle)*dist,y:Math.sin(angle)*dist};
    iris.style.transform=`translate(calc(-50% + ${pupil.x}px),calc(-50% + ${pupil.y}px))`;
    lidHeight=Math.max(10,Math.min(50,30+2*pupil.y));
    lid.style.height=`${lidHeight}%`;
  }
  function setDizzy(lines=dizzyLines, ms=4000) {
    if(dizzy||poked||feedbackCurrent)return;
    dizzy=true; eye.classList.add("dizzy"); say(choose(lines),ms);
    clearTimeout(dizzyTimer); dizzyTimer=setTimeout(()=>{dizzy=false;eye.classList.remove("dizzy")},ms);
  }
  function blink(ms=130) { eye.classList.add("blink");setTimeout(()=>eye.classList.remove("blink"),ms); }
  window.addEventListener("mousemove", e=>{
    look(e.clientX,e.clientY);
    const now=Date.now(), dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;
    movement+=Math.hypot(dx,dy);
    if(movement>1000){movement=0;movementTimes.push(now);movementTimes=movementTimes.filter(t=>now-t<1500);
      if(movementTimes.length>=2){movementTimes=[];setDizzy(dizzyLines,4000)}}
    lastPointer={x:e.clientX,y:e.clientY};
    clearTimeout(idleTimer); idleTimer=setTimeout(()=>say(choose(idleLines)),15000);
  },{passive:true});
  window.addEventListener("scroll",()=>{
    const y=window.scrollY, delta=y-lastScroll, abs=Math.abs(delta), dir=delta>0?"down":"up",now=Date.now();
    if(abs>50&&!dizzy&&!poked){
      if(scrollDirection&&dir!==scrollDirection){scrollTimes.push(now);scrollTimes=scrollTimes.filter(t=>now-t<2000);
        if(scrollTimes.length>=5){scrollTimes=[];setDizzy(["Stop scrolling like that! I'm dizzy!","My head is spinning from all that scrolling!","Up, down, up, down... STOP!","You're making me seasick!","Ugh... too much scrolling..."],7000)}}
      scrollDirection=dir;
    }
    if(abs>100&&!dizzy&&!poked)say(choose(scrollLines),3000);
    lastScroll=y; backTop.hidden=y<=600;
  },{passive:true});
  document.addEventListener("click",e=>{
    if(!eye.contains(e.target)&&e.target.closest("a,button,[role=button]")&&Math.random()>.75)say(choose(clickLines));
  });
  eye.addEventListener("click",()=>{
    if(poked)return;
    window.gtag?.("event","eye_poked",{event_category:"easter_egg",event_label:"judgemental_eye"});
    poked=true;eye.classList.add("poked");blink(200);
    setTimeout(()=>{eye.classList.remove("poked");poked=false;say(choose(pokeLines));},1700);
  });
  // Occasional natural blink and touch-device idle drift.
  const scheduleBlink=()=>setTimeout(()=>{if(!feedbackCurrent&&!poked)blink();scheduleBlink()},2400+Math.random()*4200);
  setTimeout(scheduleBlink,1600);
  if(matchMedia("(hover: none) and (pointer: coarse)").matches)setInterval(()=>{
    if(!dizzy&&!poked&&!feedbackCurrent){const a=Math.random()*Math.PI*2,r=Math.random()*8;iris.style.transform=`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px))`;}
  },2500);
  // Bookmark prompt shown once per browser, matching the source behavior.
  if(!localStorage.getItem("eye-bookmark-dismissed"))setTimeout(()=>{
    if(!feedbackCurrent&&!bubble.classList.contains("show"))showBookmark();
  },5000);
  function showBookmark(){
    if(bookmarkShown)return;bookmarkShown=true;
    $("#bookmark").hidden=false;
  }
  $("#bookmark-yes").addEventListener("click",async()=>{
    $("#bookmark").hidden=true;localStorage.setItem("eye-bookmark-dismissed","true");
    window.gtag?.("event","eye_bookmark_accepted",{event_category:"engagement",event_label:"judgemental_eye_bookmark"});
    const ua=navigator.userAgent;
    if(/iPhone|iPad|iPod/i.test(ua))say('Tap Share 📤 then "Add to Home Screen" 🏠',8000);
    else if(/Android/i.test(ua))say(navigator.share?"Thanks! Come back soon 😊":"Tap ⋮ menu → Bookmark or Add to Home screen",8000);
    else say(`Press ${navigator.platform.toUpperCase().includes("MAC")?"⌘ Cmd+D":"Ctrl+D"} right now!`,8000);
  });
  $("#bookmark-no").addEventListener("click",()=>{
    $("#bookmark").hidden=true;localStorage.setItem("eye-bookmark-dismissed","true");
    window.gtag?.("event","eye_bookmark_rejected",{event_category:"engagement",event_label:"judgemental_eye_bookmark"});
    say(choose(["Fine. Stay bored then.","Your loss.","Suit yourself.","I'll remember this.","Rude."]));
  });
  backTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
  // Same custom-event contract as the captured site: dispatch bored:link-feedback-pending
  // with detail {kind:"link"|"game", targetId, title}.
  const pendingKey="bored_link_feedback_pending", resolvedKey="bored_link_feedback_resolved",
    dismissedKey="bored_link_feedback_dismissed", optOutKey="bored_link_feedback_opt_out";
  const reasons=[{id:"broken",label:"It didn't work"},{id:"misleading",label:"Not what I expected"},{id:"inappropriate",label:"Not appropriate"},{id:"boring",label:"It was boring"},{id:"other",label:"Something else"}];
  function readPending(){try{return JSON.parse(localStorage.getItem(pendingKey)||"null")}catch{return null}}
  function openFeedback(item){
    if(!item||localStorage.getItem(optOutKey))return;
    const skip=JSON.parse(localStorage.getItem(dismissedKey)||"[]");
    if(skip.includes(`${item.kind}:${item.targetId}`))return;
    feedbackCurrent=item;downvoteMode=false;renderFeedback();
    feedback.hidden=false; bubble.classList.remove("show");
  }
  function renderFeedback(){
    const title=feedbackCurrent.title||"this";
    feedback.innerHTML=`<button class="close" aria-label="Dismiss feedback">×</button>${downvoteMode?
      '<p>Fair enough, what killed it?</p><div class="reason-list"></div>':
      `<p>Was “${escapeHTML(title)}” worth ${feedbackCurrent.kind==="game"?"playing":"visiting"}?</p><small>Your vote helps us keep Bored useful.</small><div class="vote-row"><button data-vote="up">✓ Yes</button><button data-vote="down">✕ No</button></div>`}
      <div class="feedback-status" role="status"></div><footer><button data-optout>Don't ask again</button></footer>`;
    feedback.querySelector(".close").onclick=dismissFeedback;
    feedback.querySelector("[data-optout]").onclick=()=>{localStorage.setItem(optOutKey,"true");dismissFeedback();say("Okay, I will stop asking.")};
    if(downvoteMode){const list=feedback.querySelector(".reason-list");[...reasons].sort(()=>Math.random()-.5).forEach(reason=>{const b=document.createElement("button");b.textContent=reason.label;b.onclick=()=>submitReason(reason.id);list.append(b)})}
    else feedback.querySelectorAll("[data-vote]").forEach(b=>b.onclick=()=>vote(b.dataset.vote));
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function vote(v){
    const item=feedbackCurrent;localStorage.setItem(resolvedKey,JSON.stringify([...(JSON.parse(localStorage.getItem(resolvedKey)||"[]")),`${item.kind}:${item.targetId}:${v}`]));
    window.gtag?.("event","link_feedback_vote",{kind:item.kind,target_id:item.targetId,vote:v});
    if(v==="down"){downvoteMode=true;renderFeedback()}else{dismissFeedback();say("Thanks for the feedback.")}
  }
  function submitReason(id){window.gtag?.("event","link_feedback_reason",{kind:feedbackCurrent.kind,target_id:feedbackCurrent.targetId,reason:id});dismissFeedback();say("Noted. I will judge it accordingly.")}
  function dismissFeedback(){if(feedbackCurrent){const key=`${feedbackCurrent.kind}:${feedbackCurrent.targetId}`;localStorage.setItem(dismissedKey,JSON.stringify([...(JSON.parse(localStorage.getItem(dismissedKey)||"[]")),key]))}
    feedback.hidden=true;feedbackCurrent=null;downvoteMode=false}
  window.addEventListener("bored:link-feedback-pending",e=>openFeedback(e.detail));
  function checkPending(){if(document.visibilityState!=="visible"||!document.hasFocus())return;const item=readPending();if(item){localStorage.removeItem(pendingKey);openFeedback(item)}}
  document.addEventListener("visibilitychange",checkPending);window.addEventListener("focus",checkPending);window.addEventListener("pageshow",checkPending);
  setTimeout(checkPending,200);
  // Snake score integration mirrors the source's snake-game-over event.
  window.addEventListener("snake-game-over",e=>{
    const {score=0,isNewHighScore=false}=e.detail||{};
    const lines=isNewHighScore&&score>50?["Wow, new record! I'm almost impressed.","New high score! Lucky run?","Record! Okay, not bad...","New best! Even a broken clock..."]:
      score===0?["Pff... Loser!","Zero?! Really?!","That was pathetic.","Did you even try?","Instant death. Impressive.","My grandma plays better."]:
      score<30?["That's it? Weak.","Not your best work.","Try using your eyes next time.","Meh. I've seen worse... barely.","Practice makes perfect, I guess."]:
      score<80?["Okay, not terrible.","Average. Just like everything else.","You can do better. Probably.","Decent. Nothing special."]:
      ["Actually not bad!","Okay, okay, respect.","Fine, you're good at snake. Happy?","Impressive. Don't let it go to your head."];
    say(choose(lines));
  });
})();
