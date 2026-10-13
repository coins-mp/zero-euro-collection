"use strict";
const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const imagePattern = /^images\/[a-f0-9]{64}\.(jpg|png|webp)$/;
let notes = [], local = false, view = "cards", selectedId = "", heartbeatTimer;
const grades = ["G", "VG", "F", "VF", "XF", "AU", "UNC"];
function image(path, alt, className = "") {
  return imagePattern.test(path || "") ? `<img class="${className}" src="${esc(path)}" alt="${esc(alt)}" loading="lazy">` : `<span class="note-placeholder">0 €<small>${esc(alt)}</small></span>`;
}
function flag(code) { return /^[A-Z]{2}$/.test(code || "") ? [...code].map(c => String.fromCodePoint(127397+c.charCodeAt(0))).join("") : ""; }
function badge(note) { return `<span class="badge ${note.status.toLowerCase()}">${note.status === "Collection" ? "In collection" : esc(note.status)}</span>`; }
function values(id, options, label) {
  const current = $(id).value;
  $(id).replaceChildren(new Option(label,""), ...options.map(v => new Option(v,v)));
  if (options.includes(current)) $(id).value = current;
}
function populateFilters() {
  values("countryFilter", [...new Set(notes.map(n=>n.country))].sort(), "All countries");
  values("yearFilter", [...new Set(notes.map(n=>n.year).filter(Boolean))].sort((a,b)=>Number(b)-Number(a)), "All years");
}
function filtered() {
  const q=$("searchInput").value.trim().toLowerCase(), sort=$("sortFilter").value;
  return notes.filter(n => (!$("countryFilter").value || n.country===$("countryFilter").value) && (!$("yearFilter").value || n.year===$("yearFilter").value) && (!$("statusFilter").value || n.status===$("statusFilter").value) && (!q || [n.country,n.name,n.year,n.issueCode].join(" ").toLowerCase().includes(q))).sort((a,b)=> {
    if (sort==="newest" || sort==="oldest") {
      if (!a.year && b.year) return 1; if (!b.year && a.year) return -1;
      const d=sort==="newest"?Number(b.year)-Number(a.year):Number(a.year)-Number(b.year); if(d) return d;
    }
    return (sort==="name"?a.name.localeCompare(b.name):a.country.localeCompare(b.country)) || a.name.localeCompare(b.name);
  });
}
function handleImages(container) {
  container.querySelectorAll("img").forEach(img=>img.addEventListener("error",()=>{const span=document.createElement("span");span.className="note-placeholder";span.textContent="Image unavailable";img.replaceWith(span);},{once:true}));
}
function render() {
  const list=filtered();
  const total=notes.filter(n=>n.status!=="Found").length;
  $("totalCount").textContent=`${total} banknote${total===1?"":"s"}`;
  $("resultCount").textContent=`${list.length} banknote${list.length===1?"":"s"}`;
  $("message").hidden=!!list.length; $("message").textContent=notes.length?"No banknotes match these filters.":"No banknotes have been added yet.";
  $("noteGrid").hidden=view!=="cards"; $("tableWrap").hidden=view!=="table" || !list.length;
  $("noteGrid").innerHTML=list.map(n=>`<button class="note-card" data-id="${esc(n.id)}" type="button"><span class="card-image">${image(n.frontImage,n.name)}</span><span class="coin-info"><span class="coin-top"><span>${flag(n.countryCode)} ${esc(n.country)}</span><span>${esc(n.year)}</span></span><span class="coin-name">${esc(n.name)}</span><span class="card-status-row"><span class="coin-meta">0 €</span>${badge(n)}</span></span></button>`).join("");
  $("tableBody").innerHTML=list.map(n=>`<tr><td>${flag(n.countryCode)} ${esc(n.country)}</td><td><button class="coin-table-button" data-id="${esc(n.id)}">${esc(n.name)}</button></td><td>${esc(n.year)}</td><td>${esc(n.issueCode)}</td><td>${esc(n.status)}</td></tr>`).join("");
  document.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>openNote(b.dataset.id)));
  const back=notes.find(n=>imagePattern.test(n.backImage||""))?.backImage;
  $("bannerArt").innerHTML=back?image(back,"Zero Euro reverse"):"0 €";
  handleImages($("noteGrid")); handleImages($("bannerArt"));
}
function openNote(id) {
  const n=notes.find(n=>n.id===id); if(!n) return; selectedId=id;
  $("noteImages").innerHTML=[['frontImage','Front'],['backImage','Reverse']].map(([key,label])=>`<button class="note-side" type="button" data-image="${esc(n[key])}" data-label="${label}" ${!imagePattern.test(n[key]||"")?"disabled":""}>${image(n[key],`${n.name} — ${label}`)}<span>${label} · Click to enlarge</span></button>`).join("");
  $("noteImages").querySelectorAll("[data-image]").forEach(b=>b.addEventListener("click",()=>zoom(b.dataset.image,`${n.name} — ${b.dataset.label}`)));
  $("noteSummary").innerHTML=`<div class="summary-top"><span class="summary-country">${flag(n.countryCode)} ${esc(n.country)}</span><span class="zero-label">ZERO EURO</span></div><h2>${esc(n.name)}</h2><div class="summary-bottom"><span class="summary-year">${esc(n.year)}</span>${badge(n)}</div>`;
  const details=[['Country',n.country],['Year',n.year || '—']];
  $("noteDetails").innerHTML=details.map(([k,v])=>`<div class="detail-box"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
  $("noteDescription").innerHTML=(n.description||[]).map(b=>`<article class="description-block ${b.image?'with-image':''}">${b.image?`<figure><button class="description-image" data-image="${esc(b.image)}">${image(b.image,b.caption||b.title||n.name)}</button>${b.caption?`<figcaption>${esc(b.caption)}</figcaption>`:""}</figure>`:""}<div>${b.title?`<h4>${esc(b.title)}</h4>`:""}${b.text?`<p>${esc(b.text)}</p>`:""}${/^https?:\/\//.test(b.link||"")?`<a href="${esc(b.link)}" target="_blank" rel="noopener noreferrer">Read more</a>`:""}</div></article>`).join("") || '<p class="muted">No description yet.</p>';
  $("noteDescription").querySelectorAll("[data-image]").forEach(b=>b.addEventListener("click",()=>zoom(b.dataset.image,n.name)));
  $("noteNotes").innerHTML=n.notes?`<h3>My notes</h3><p>${esc(n.notes)}</p>`:"";
  const list=filtered(), position=list.findIndex(x=>x.id===id); $("previousNote").disabled=position<=0; $("nextNote").disabled=position<0||position>=list.length-1; $("notePosition").textContent=`${position+1} / ${list.length}`;
  const neighborLabel = note => note ? `${note.country}${note.year ? ` · ${note.year}` : ""}` : "—";
  $("previousLabel").textContent=neighborLabel(list[position-1]);
  $("nextLabel").textContent=neighborLabel(list[position+1]);
  $("descriptionScroll").scrollTop=0; handleImages($("noteDialog"));
  if(!$("noteDialog").open) $("noteDialog").showModal();
}
function zoom(path,alt) { if(!imagePattern.test(path)) return; $("zoomImage").src=path;$("zoomImage").alt=alt;$("zoomDialog").showModal(); }
function navigate(delta) { const list=filtered(), i=list.findIndex(n=>n.id===selectedId); if(list[i+delta]) openNote(list[i+delta].id); }
function theme(value) { document.documentElement.dataset.theme=value;$("themeToggle").textContent=value==="dark"?"☀️ Light":"🌙 Dark";try{localStorage.setItem("zeroEuroTheme",value);}catch{} }
function reset() { for(const id of ['countryFilter','yearFilter','statusFilter','searchInput']) $(id).value="";$("sortFilter").value="country";render(); }
function startHeartbeat() {
  const clientId=crypto.randomUUID(); let last=Date.now();
  for(const event of ['pointerdown','keydown','wheel','touchstart']) document.addEventListener(event,()=>last=Date.now(),{passive:true});
  const beat=()=>fetch('/api/heartbeat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId,idleSeconds:(Date.now()-last)/1000})}).catch(()=>{});
  beat(); heartbeatTimer=setInterval(beat,15000);
  window.addEventListener('pagehide',()=>{clearInterval(heartbeatTimer);navigator.sendBeacon('/api/leave',new Blob([JSON.stringify({clientId})],{type:'application/json'}));});
  window.addEventListener('pageshow',event=>{if(event.persisted){last=Date.now();beat();heartbeatTimer=setInterval(beat,15000);}});
}
async function load() {
  if(local){const r=await fetch('/api/catalog',{cache:'no-store'}), data=await r.json();if(!r.ok)throw Error(data.error);notes=data.notes;$("pendingCount").textContent=`Local mode · ${data.pending.length} pending change${data.pending.length===1?'':'s'}`;}
  else {const r=await fetch('data/notes.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('Catalog could not be loaded.');notes=await r.json();if(!Array.isArray(notes))throw Error('Invalid catalog.');notes=notes.filter(n=>n.status!=='Found');}
  populateFilters();render();
}
async function init() {
  let saved='light';try{saved=localStorage.getItem('zeroEuroTheme')==='dark'?'dark':'light';}catch{}theme(saved);
  $('themeToggle').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');$('viewToggle').onclick=()=>{view=view==='cards'?'table':'cards';$('viewToggle').textContent=view==='cards'?'▦ Table':'▦ Cards';render();};
  for(const id of ['countryFilter','yearFilter','statusFilter','sortFilter']) $(id).onchange=render;
  $('searchInput').oninput=render;$('resetFilters').onclick=reset;$('collectionBanner').onclick=()=>{reset();$('results').scrollIntoView({behavior:'smooth'});};
  $('closeNote').onclick=()=>$('noteDialog').close();$('closeZoom').onclick=()=>$('zoomDialog').close();$('previousNote').onclick=()=>navigate(-1);$('nextNote').onclick=()=>navigate(1);
  if(['localhost','127.0.0.1'].includes(location.hostname)) {try{const r=await fetch('/api/info');if(r.ok)local=(await r.json()).local===true;}catch{}}
  if(local){$('localStrip').hidden=false;$('statusFilter').add(new Option('Found','Found'));document.querySelectorAll('.euro-link').forEach(a=>a.href='http://127.0.0.1:8765/');startHeartbeat();}
  try{await load();}catch(e){$('message').hidden=false;$('message').textContent=e.message;}
  if(local) {window.addEventListener('focus',()=>load().catch(()=>{}));setInterval(()=>{if(document.visibilityState==='visible'&&!$('noteDialog').open)load().catch(()=>{});},10000);}
}
init();
