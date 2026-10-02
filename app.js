const KEY="cash_loan_pwa_v1";
const OLDKEY="cash_loan_pwa_v2";
let state=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLDKEY)||'{"opening":500000,"tx":[]}');
const $=id=>document.getElementById(id);
const money=n=>"৳"+Math.round(n).toLocaleString("bn-BD");
$("date").value=new Date().toISOString().slice(0,10); $("opening").value=state.opening;
let deferred=null;
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function totals(){let lent=0,ret=0,cashIn=0,expense=0;for(const t of state.tx){if(t.type==="lent")lent+=t.amount;if(t.type==="returned")ret+=t.amount;if(t.type==="cash_in")cashIn+=t.amount;if(t.type==="expense")expense+=t.amount}return{lent,ret,cashIn,expense,cash:state.opening-lent+ret+cashIn-expense}}
function label(t){return{lent:"ধার দিলাম",returned:"ফেরত পেলাম",cash_in:"নগদ জমা",expense:"খরচ"}[t]||t}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function personBalance(name){return state.tx.filter(t=>t.name===name).reduce((s,t)=>s+(t.type==="lent"?t.amount:t.type==="returned"?-t.amount:0),0)}
function render(){
 const x=totals();$("cash").textContent=money(x.cash);$("lent").textContent=money(x.lent);$("returned").textContent=money(x.ret);$("due").textContent=money(Math.max(0,x.lent-x.ret));
 const q=($("search").value||"").toLowerCase(), people={};
 state.tx.forEach(t=>{if(t.name)people[t.name]=(people[t.name]||0)+(t.type==="lent"?t.amount:t.type==="returned"?-t.amount:0)});
 $("people").innerHTML=Object.entries(people).filter(([n,v])=>n.toLowerCase().includes(q)&&v>0).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="row"><div><button class="personBtn" onclick="showPerson('${esc(n).replace(/'/g,"&#39;")}')">${esc(n)}</button><div class="muted">বাকি টাকা</div></div><div class="actions"><b class="due">${money(v)}</b><button class="miniBtn" onclick="quickReturn('${esc(n).replace(/'/g,"&#39;")}')">ফেরত</button></div></div>`).join("")||'<div class="empty">কোনো বাকি নেই 🎉</div>';
 $("transactions").innerHTML=[...state.tx].reverse().slice(0,50).map(t=>`<div class="row"><div><b>${esc(t.name||"নগদ")}</b><div class="muted">${esc(t.date)} • ${label(t.type)}${t.note?" • "+esc(t.note):""}</div></div><div class="actions"><span class="money ${t.type==="returned"||t.type==="cash_in"?"good":"due"}">${t.type==="returned"||t.type==="cash_in"?"+":"-"}${money(t.amount)}</span><button class="miniBtn" onclick="editTx('${t.id}')">✎</button><button class="miniBtn" onclick="deleteTx('${t.id}')">×</button></div></div>`).join("")||'<div class="empty">এখনও কোনো লেনদেন নেই</div>';
}
$("txForm").onsubmit=e=>{e.preventDefault();let amount=Number($("amount").value);if(!amount||amount<1)return alert("সঠিক টাকার পরিমাণ দিন");let type=$("type").value,name=$("name").value.trim();if((type==="lent"||type==="expense")&&amount>totals().cash)return alert("হাতে থাকা নগদের চেয়ে বেশি টাকা দেওয়া/খরচ করা যাবে না");if(type==="returned"&&personBalance(name)<=0)return alert("এই ব্যক্তির নামে বাকি পাওয়া যাচ্ছে না");if(type==="returned"&&amount>personBalance(name))return alert("ফেরতের পরিমাণ বাকি টাকার চেয়ে বেশি");state.tx.push({id:crypto.randomUUID(),name,type,amount,date:$("date").value,note:$("note").value.trim()});e.target.reset();$("date").value=new Date().toISOString().slice(0,10);save()};
$("search").oninput=render;
$("saveOpening").onclick=()=>{let n=Number($("opening").value);if(n>=0){state.opening=n;save();alert("শুরুর ব্যালেন্স সংরক্ষণ হয়েছে")}};
$("backupBtn").onclick=()=>download("cash-loan-backup.json",JSON.stringify(state,null,2),"application/json");
$("exportBtn").onclick=()=>{let rows=[["তারিখ","নাম","ধরন","টাকা","নোট"],...state.tx.map(t=>[t.date,t.name,label(t.type),t.amount,t.note])];download("transactions.csv","\ufeff"+rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),"text/csv;charset=utf-8")};
function download(name,data,type){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click()}
$("restore").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(x&&Array.isArray(x.tx)){state=x;localStorage.setItem(KEY,JSON.stringify(state));render();alert("Backup restore হয়েছে")}}catch{alert("Backup ফাইলটি সঠিক নয়")}};r.readAsText(f)}
$("clearBtn").onclick=()=>{if(confirm("সব হিসাব মুছে ফেলবেন?")){state={opening:0,tx:[]};save()}}
window.deleteTx=id=>{if(confirm("এই লেনদেনটি মুছবেন?")){state.tx=state.tx.filter(t=>t.id!==id);save()}};
window.editTx=id=>{let t=state.tx.find(x=>x.id===id);if(!t)return;$("name").value=t.name||"";$("type").value=t.type;$("amount").value=t.amount;$("date").value=t.date;$("note").value=t.note||"";state.tx=state.tx.filter(x=>x.id!==id);save();window.scrollTo({top:0,behavior:"smooth"});alert("লেনদেনটি ফর্মে আনা হয়েছে—পরিবর্তন করে আবার সংরক্ষণ করুন")};
window.quickReturn=name=>{$("name").value=name;$("type").value="returned";$("amount").focus();window.scrollTo({top:0,behavior:"smooth"})};
window.showPerson=name=>{let tx=state.tx.filter(t=>t.name===name);let lent=tx.filter(t=>t.type==="lent").reduce((s,t)=>s+t.amount,0),ret=tx.filter(t=>t.type==="returned").reduce((s,t)=>s+t.amount,0);$("personTitle").textContent=name;$("personSummary").innerHTML=`<div class="summaryBox"><div><small>ধার</small><b>${money(lent)}</b></div><div><small>ফেরত</small><b>${money(ret)}</b></div><div><small>বাকি</small><b class="due">${money(Math.max(0,lent-ret))}</b></div></div>`;$("personTx").innerHTML=tx.slice().reverse().map(t=>`<div class="row"><span>${esc(t.date)} • ${label(t.type)}</span><b>${money(t.amount)}</b></div>`).join("");$("personPanel").hidden=false;$("personPanel").scrollIntoView({behavior:"smooth"})};
$("closePerson").onclick=()=>{$("personPanel").hidden=true};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").hidden=false;$("installBanner").hidden=false});
async function doInstall(){if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;$("installBtn").hidden=true;$("installBanner").hidden=true}else alert("Chrome menu-তে 'Add to Home screen' বা 'Install app' অপশনটি দেখুন।")}
$("installBtn").onclick=doInstall;$("bannerInstall").onclick=doInstall;$("bannerClose").onclick=()=>$("installBanner").hidden=true;
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;$("installBanner").hidden=true});
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
render();