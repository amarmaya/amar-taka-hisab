const KEY="cash_loan_pwa_v1"; let state=JSON.parse(localStorage.getItem(KEY)||'{"opening":500000,"tx":[]}')
const $=id=>document.getElementById(id); const money=n=>"৳"+Math.round(n).toLocaleString("bn-BD");
$("date").value=new Date().toISOString().slice(0,10); $("opening").value=state.opening;
function save(){localStorage.setItem(KEY,JSON.stringify(state)); render()}
function totals(){let lent=0,ret=0,cashIn=0,expense=0; for(const t of state.tx){if(t.type==="lent")lent+=t.amount;if(t.type==="returned")ret+=t.amount;if(t.type==="cash_in")cashIn+=t.amount;if(t.type==="expense")expense+=t.amount} return {lent,ret,cashIn,expense,cash:state.opening-lent+ret+cashIn-expense}}
function render(){
 const x=totals(); $("cash").textContent=money(x.cash);$("lent").textContent=money(x.lent);$("returned").textContent=money(x.ret);$("due").textContent=money(Math.max(0,x.lent-x.ret));
 const q=($("search").value||"").toLowerCase(), people={};
 state.tx.forEach(t=>{if(!t.name)return; people[t.name]=(people[t.name]||0)+(t.type==="lent"?t.amount:t.type==="returned"?-t.amount:0)});
 $("people").innerHTML=Object.entries(people).filter(([n,v])=>n.toLowerCase().includes(q)&&v>0).sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class="row"><div><b>${esc(n)}</b><div class="muted">বাকি টাকা</div></div><div class="money due">${money(v)}</div></div>`).join("")||'<div class="empty">কোনো বাকি নেই 🎉</div>';
 $("transactions").innerHTML=[...state.tx].reverse().slice(0,30).map(t=>`<div class="row"><div><b>${esc(t.name||"নগদ")}</b><div class="muted">${t.date} • ${label(t.type)}${t.note?" • "+esc(t.note):""}</div></div><div class="money ${t.type==="returned"||t.type==="cash_in"?"good":"due"}">${t.type==="returned"||t.type==="cash_in"?"+":"-"}${money(t.amount)}</div></div>`).join("")||'<div class="empty">এখনও কোনো লেনদেন নেই</div>';
}
function label(t){return {lent:"ধার",returned:"ফেরত",cash_in:"নগদ জমা",expense:"খরচ"}[t]||t}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("txForm").onsubmit=e=>{e.preventDefault();let amount=Number($("amount").value);if(!amount)return;state.tx.push({id:crypto.randomUUID(),name:$("name").value.trim(),type:$("type").value,amount,date:$("date").value,note:$("note").value.trim()});e.target.reset();$("date").value=new Date().toISOString().slice(0,10);save()}
$("search").oninput=render;
$("saveOpening").onclick=()=>{let n=Number($("opening").value);if(n>=0){state.opening=n;save();alert("শুরুর ব্যালেন্স সংরক্ষণ হয়েছে")}}
$("backupBtn").onclick=()=>download("cash-loan-backup.json",JSON.stringify(state,null,2),"application/json");
$("exportBtn").onclick=()=>{let rows=[["তারিখ","নাম","ধরন","টাকা","নোট"],...state.tx.map(t=>[t.date,t.name,label(t.type),t.amount,t.note])];download("transactions.csv",rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),"text/csv;charset=utf-8")}
function download(name,data,type){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click()}
$("restore").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(x&&Array.isArray(x.tx)){state=x;save();alert("Backup restore হয়েছে")}}catch{alert("Backup ফাইলটি সঠিক নয়")}};r.readAsText(f)}
$("clearBtn").onclick=()=>{if(confirm("সব হিসাব মুছে ফেলবেন?")){state={opening:0,tx:[]};save()}}
let deferred; window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").hidden=false});$("installBtn").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}}
if("serviceWorker"in navigator) navigator.serviceWorker.register("sw.js"); render();