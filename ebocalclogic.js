var M,st;
var genderMap={"Kobieta":"K","Mezczyzna":"M"};
function pruKey(g){if(M.skladka&&M.skladka[g])return g;return g==="K"?"Kobieta":g==="M"?"Mężczyzna":g;}
function pruEntry(g,a){var v=(M.skladka[pruKey(g)]||{})[a];return v==null?null:v;}
function pruClamp(v,lo,hi){return v<lo?lo:v>hi?hi:v;}
function pruZl(n){return n.toLocaleString("pl-PL")+" zł";}
function pruFill(el,lo,hi,v){var p=hi>lo?(v-lo)/(hi-lo)*100:0;el.style.setProperty('--pct',p+'%');}
function pruSet(id,txt){var e=document.getElementById(id);if(e)e.textContent=txt;}
function pruDash(){pruSet("pru-v1","—");pruSet("pru-v2","—");pruSet("pru-v3","—");}
function pruRefresh(){
var hasG=!!st.g;
var r=hasG?M.ageRange[pruKey(st.g)]:[18,55];
var aEl=document.getElementById("pru-age");
aEl.min=r[0];aEl.max=r[1];
st.a=pruClamp(st.a,r[0],r[1]);
aEl.value=st.a;
aEl.setAttribute("aria-valuetext",st.a+" lat");
aEl.disabled=!hasG;
var aw=document.querySelector('#pru-calc .calc-age__slider-wrap');
if(aw){if(hasG)aw.classList.remove('is-disabled');else aw.classList.add('is-disabled');}
pruSet("pru-age-out",st.a+" lat");
pruFill(aEl,r[0],r[1],st.a);
if(!hasG){pruDash();return;}
var sk=pruEntry(st.g,st.a);
if(sk===null){pruDash();return;}
pruSet("pru-v1",pruZl(Math.round(sk)));
pruSet("pru-v2",pruZl(2000*M.multiplier));
pruSet("pru-v3",pruZl(Math.round((M.retirementAge[pruKey(st.g)]-st.a)*12*sk)));
}
function pruG(key,btn){st.g=genderMap[key];var cs=document.getElementById("pru-gender").querySelectorAll(".pru-calc__card");for(var i=0;i<cs.length;i++){cs[i].className="pru-calc__card"+(cs[i]===btn?" is-selected":"");cs[i].setAttribute("aria-checked",cs[i]===btn?"true":"false");}pruRefresh();}
function pruAge(v){st.a=parseInt(v,10);pruRefresh();}
function pruStep(s){var aEl=document.getElementById("pru-age");if(s==="age-")st.a=pruClamp(st.a-1,+aEl.min,+aEl.max);if(s==="age+")st.a=pruClamp(st.a+1,+aEl.min,+aEl.max);pruRefresh();}
var _pruHold=null;
function pruHoldStart(s){pruStep(s);_pruHold=setTimeout(function(){_pruHold=setInterval(function(){pruStep(s);},80);},400);}
function pruHoldEnd(){if(_pruHold){clearTimeout(_pruHold);clearInterval(_pruHold);_pruHold=null;}}
function pruDisclaimer(){
var d=document.getElementById('pru-disclaimer');
d.classList.toggle('is-open');
var open=d.classList.contains('is-open');
var btns=d.querySelectorAll('.calc-disclaimer__btn');
for(var i=0;i<btns.length;i++){btns[i].setAttribute('aria-expanded',open?'true':'false');}
}
function pruTip(e){
e.stopPropagation();
var box=e.currentTarget.querySelector('.pru-calc__tip-box');
if(!box)return;
var open=box.classList.contains('is-open');
var all=document.querySelectorAll('#pru-calc .pru-calc__tip-box.is-open');
for(var i=0;i<all.length;i++){all[i].classList.remove('is-open');all[i].classList.remove('is-flipped');}
if(!open){
box.classList.add('is-open');
var rect=box.getBoundingClientRect();
if(rect.top<8){box.classList.add('is-flipped');}
}
}
function pruInit(){
var dataEl=document.getElementById("pru-data");
if(!dataEl){console.error("[EBO] Brak #pru-data w DOM");return;}
try{M=JSON.parse(dataEl.textContent);}
catch(err){console.error("[EBO] Nie udało się sparsować pru-data JSON:",err,"\nSurowa treść:",dataEl.textContent.slice(0,200));return;}
st={g:null,a:35};
var tips=document.querySelectorAll('#pru-calc .pru-calc__tip');
for(var i=0;i<tips.length;i++){tips[i].addEventListener('click',pruTip);tips[i].addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===" "){e.preventDefault();pruTip(e);}if(e.key==='Escape'){var b=e.currentTarget.querySelector('.pru-calc__tip-box');if(b){b.classList.remove('is-open');b.classList.remove('is-flipped');}}});}
document.addEventListener('click',function(){
var all=document.querySelectorAll('#pru-calc .pru-calc__tip-box.is-open');
for(var i=0;i<all.length;i++)all[i].classList.remove('is-open');
});
pruRefresh();
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",pruInit);}else{pruInit();}
