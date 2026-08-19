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
var aw=document.querySelector('#pru-calc .calc-slider-box');
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
/* Stan zaznaczenia trzyma teraz CSS przez :has(input:checked) — JS tylko czyta wybór */
function pruG(key){st.g=genderMap[key];pruRefresh();}
function pruAge(v){st.a=parseInt(v,10);pruRefresh();}
function pruStep(s){var aEl=document.getElementById("pru-age");if(aEl.disabled)return;if(s==="age-")st.a=pruClamp(st.a-1,+aEl.min,+aEl.max);if(s==="age+")st.a=pruClamp(st.a+1,+aEl.min,+aEl.max);pruRefresh();}
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
var _pruTipEl=null;
function pruTipHide(){if(_pruTipEl){_pruTipEl.style.display='none';_pruTipEl.classList.remove('is-open');_pruTipEl.classList.remove('is-flipped');_pruTipEl._src=null;}}
function pruTip(e){
e.stopPropagation();
var txt=e.currentTarget.getAttribute('data-tip');
if(!txt)return;
if(!_pruTipEl){
_pruTipEl=document.createElement('div');
_pruTipEl.className='pru-calc__tip-box';
_pruTipEl.style.cssText='position:fixed;z-index:99999;display:none;';
document.body.appendChild(_pruTipEl);
}
var visible=_pruTipEl.style.display!=='none'&&_pruTipEl._src===e.currentTarget;
pruTipHide();
if(!visible){
_pruTipEl._src=e.currentTarget;
_pruTipEl.innerHTML='<p></p>';
_pruTipEl.querySelector('p').textContent=txt;
_pruTipEl.style.display='block';
_pruTipEl.classList.add('is-open');
var ico=e.currentTarget.querySelector('img')||e.currentTarget;
var r=ico.getBoundingClientRect();
var bw=_pruTipEl.offsetWidth||264;
var bh=_pruTipEl.offsetHeight||80;
var cx=r.left+r.width/2;
var top=r.top-bh-10;
if(top<8){top=r.bottom+10;_pruTipEl.classList.add('is-flipped');}else{_pruTipEl.classList.remove('is-flipped');}
var left=cx-bw/2;
var pad=8;
if(left<pad)left=pad;
if(left+bw>window.innerWidth-pad)left=window.innerWidth-pad-bw;
_pruTipEl.style.top=Math.round(top)+'px';
_pruTipEl.style.left=Math.round(left)+'px';
_pruTipEl.style.setProperty('--tip-arrow-offset',Math.round(cx-(left+bw/2))+'px');
}
}
function pruInit(){
var dataEl=document.getElementById("pru-data");
if(!dataEl){console.error("[EBO] Brak #pru-data w DOM");return;}
try{M=JSON.parse(dataEl.textContent);}
catch(err){console.error("[EBO] Nie udało się sparsować pru-data JSON:",err,"\nSurowa treść:",dataEl.textContent.slice(0,200));return;}
st={g:null,a:35};
var tips=document.querySelectorAll('#pru-calc .c-tooltip');
for(var i=0;i<tips.length;i++){tips[i].addEventListener('click',pruTip);tips[i].addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===" "){e.preventDefault();pruTip(e);}if(e.key==='Escape')pruTipHide();});}
document.addEventListener('click',pruTipHide);
window.addEventListener('scroll',pruTipHide,true);
window.addEventListener('resize',pruTipHide);
pruRefresh();
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",pruInit);}else{pruInit();}
