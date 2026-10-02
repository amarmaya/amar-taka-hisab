const KEY="amar_taka_prof_v3",OLD="cash_loan_pwa_v1";
let state=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(OLD)||'{"opening":500000,"tx":[]}');
const $=id=>document.getElementById(id), money=n=>"৳"+Math.round(n||0).toLocaleString("bn-BD");
let deferred=null,editing=null;
$("opening").value=state.opening;$("txDate").value=new Date().toISOString().slice(0,10);

function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function totals(){let o={lent:0,returned:0,cash_in:0,expense:0};state.tx.forEach(t=>o[t.type]=(o[t.type]||0)+t.amount);return{...o,cash:state.opening-o.lent+o.returned+o.cash_in-o.expense,due:Math.max(0,o.lent-o.returned)}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function label(t){return{lent:"ধার দিলাম",returned:"ফেরত পেলাম",cash_in:"নগদ জমা",expense:"খরচ"}[t]}
function icon(t){return{lent:"🤝",returned:"✅",cash_in:"💵",expense:"🧾"}[t]}
function balance(name){return state.tx.filter(t=>t.name===name).reduce((s,t)=>s+(t.type==="lent"?t.amount:t.type==="returned"?-t.amount:0),0)}
function people(){let m={};state.tx.forEach(t=>{if(t.name)m[t.name]=(m[t.name]||0)+(t.type==="lent"?t.amount:t.type==="returned"?-t.amount:0)});return Object.entries(m).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1])}
function render(){
 let x=totals();["cash","rCash"].forEach(id=>$(id).textContent=money(x.cash));$("lent").textContent=money(x.lent);$("returned").textContent=money(x.returned);$("due").textContent=money(x.due);$("expense").textContent=money(x.expense);$("rLent").textContent=money(x.lent);$("rReturned").textContent=money(x.returned);$("rDue").textContent=money(x.due);
 let ps=people(), phtml=ps.slice(0,6).map(([n,v])=>rowPerson(n,v)).join("")||empty("কোনো পাওনা নেই 🎉");$("topPeople").innerHTML=phtml;
 let q=($("personSearch").value||"").toLowerCase();$("peopleList").innerHTML=ps.filter(([n])=>n.toLowerCase().includes(q)).map(([n,v])=>rowPerson(n,v)).join("")||empty("এই নামে কোনো বাকি নেই");
 let tq=($("txSearch").value||"").toLowerCase();let tx=[...state.tx].reverse().filter(t=>(t.name+" "+(t.note||"")).toLowerCase().includes(tq));$("recent").innerHTML=tx.slice(0,5).map(rowTx).join("")||empty("এখনও কোনো লেনদেন নেই");$("txList").innerHTML=tx.map(rowTx).join("")||empty("কোনো লেনদেন পাওয়া যায়নি");
 $("typeReport").innerHTML=[["lent","ধার দিলাম"],["returned","ফেরত পেলাম"],["cash_in","নগদ জমা"],["expense","খরচ"]].map(([k,n])=>`<div class="row"><span>${icon(k)} ${n}</span><b>${money(x[k])}</b></div>`).join("");
}
function empty(s){return `<div class="muted" style="padding:18px;text-align:center">${s}</div>`}
function rowPerson(n,v){return `<div class="row"><button class="textBtn" onclick="showPerson('${esc(n).replaceAll("'","&#39;")}')"><b>${esc(n)}</b><small class="muted" style="display:block;text-align:left">বাকি আছে</small></button><div class="money due">${money(v)}</div></div>`}
function rowTx(t){return `<div class="row"><div><b>${icon(t.type)} ${esc(t.name||"নগদ")}</b><div class="muted">${esc(t.date)} • ${label(t.type)}${t.note?" • "+esc(t.note):""}</div></div><div class="${t.type==="returned"||t.type==="cash_in"?"good":"due"} money">${t.type==="returned"||t.type==="cash_in"?"+":"-"}${money(t.amount)}</div></div>`}
function openTx(type="lent",name=""){editing=null;$("modalTitle").textContent="নতুন লেনদেন";$("txName").value=name;$("txType").value=type;$("txAmount").value="";$("txNote").value="";$("txDate").value=new Date().toISOString().slice(0,10);$("txModal").hidden=false}
function closeTx(){$("txModal").hidden=true}
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
function showPage(p){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===p));document.querySelectorAll(".bottomNav button").forEach(x=>x.classList.toggle("active",x.dataset.page===p));scrollTo(0,0)}
document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>openTx(b.dataset.action));
$("quickAdd").onclick=()=>openTx();$("addPerson").onclick=()=>openTx("lent");$("closeModal").onclick=closeTx;
$("txForm").onsubmit=e=>{e.preventDefault();let name=$("txName").value.trim(),type=$("txType").value,amount=Number($("txAmount").value),date=$("txDate").value,note=$("txNote").value.trim(),x=totals();if(amount<=0)return alert("সঠিক টাকার পরিমাণ দিন");if((type==="lent"||type==="expense")&&amount>x.cash)return alert("বর্তমান হাতে থাকা টাকার চেয়ে বেশি দেওয়া/খরচ করা যাবে না");if(type==="returned"&&(!name||balance(name)<=0))return alert("এই ব্যক্তির কোনো বাকি পাওয়া যাচ্ছে না");if(type==="returned"&&amount>balance(name))return alert("ফেরতের পরিমাণ বাকি টাকার চেয়ে বেশি");let obj={id:crypto.randomUUID(),name,type,amount,date,note};if(editing){obj.id=editing;state.tx=state.tx.filter(t=>t.id!==editing)}state.tx.push(obj);save();closeTx();toast("লেনদেন সংরক্ষণ হয়েছে")}
$("personSearch").oninput=render;$("txSearch").oninput=render;
window.showPerson=name=>{let ts=state.tx.filter(t=>t.name===name),l=ts.filter(t=>t.type==="lent").reduce((s,t)=>s+t.amount,0),r=ts.filter(t=>t.type==="returned").reduce((s,t)=>s+t.amount,0);$("personName").textContent=name;$("personBody").innerHTML=`<div class="reportGrid"><div class="reportCard"><span>ধার</span><b>${money(l)}</b></div><div class="reportCard"><span>ফেরত</span><b>${money(r)}</b></div><div class="reportCard"><span>বাকি</span><b class="due">${money(Math.max(0,l-r))}</b></div></div><div class="panel">${ts.slice().reverse().map(rowTx).join("")}</div><button class="primary wide" onclick="openTx('returned','${esc(name).replaceAll("'","&#39;")}');$('personModal').hidden=true">＋ ফেরত যোগ করুন</button>`;$("personModal").hidden=false}
$("closePerson").onclick=()=>$("personModal").hidden=true;
$("saveOpening").onclick=()=>{let n=Number($("opening").value);if(n>=0){state.opening=n;save();toast("শুরুর ব্যালেন্স আপডেট হয়েছে")}};
$("backup").onclick=()=>download("amar-taka-backup.json",JSON.stringify(state,null,2),"application/json");
$("restore").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!Array.isArray(d.tx))throw 0;state=d;save();toast("Backup restore হয়েছে")}catch{alert("Backup ফাইলটি সঠিক নয়")}};r.readAsText(f)};
$("exportCsv").onclick=()=>{let rows=[["তারিখ","নাম","ধরন","টাকা","নোট"],...state.tx.map(t=>[t.date,t.name,label(t.type),t.amount,t.note])];download("amar-taka-transactions.csv","\ufeff"+rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n"),"text/csv;charset=utf-8")};
$("clearAll").onclick=()=>{if(confirm("সব হিসাব স্থায়ীভাবে মুছে ফেলবেন?")){state={opening:0,tx:[]};save();toast("সব ডাটা মুছে গেছে")}};
function download(n,d,t){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([d],{type:t}));a.download=n;a.click()}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function doInstall(){if(deferred){deferred.prompt();deferred.userChoice.finally(()=>deferred=null)}else alert("Chrome-এর মেনুতে 'Install app' বা 'Add to Home screen' নির্বাচন করুন।")}
$("installTop").onclick=doInstall;$("installSettings").onclick=doInstall;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installTop").hidden=false;$("installSettings").textContent="📱 অ্যাপ Install করুন"});
window.addEventListener("appinstalled",()=>{$("installTop").hidden=true;toast("অ্যাপ Install হয়েছে 🎉")});
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js");
render();
