/* Atelier script vidéo : logique du site (connexion, parcours, sauvegarde, export). */
const ALL = [...MODULES, BILAN];
const ROOT = document.getElementById("app");
const LS = "atelier-sv1:";
const ONLINE = typeof API_URL === "string" && API_URL.length > 0;

let S = null;            // état du participant connecté
let syncState = "idle";  // idle | busy | ok | off
let saveTimer = null;

/* ---------- utilitaires ---------- */
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const qid = (m,i) => m.id + "q" + i;
const A = k => String(S.app[k] || "").trim();
function lsGet(k){ try { return localStorage.getItem(LS + k); } catch(e){ return null; } }
function lsSet(k,v){ try { localStorage.setItem(LS + k, v); } catch(e){} }
function lsDel(k){ try { localStorage.removeItem(LS + k); } catch(e){} }

function score(m){
  let ok = 0, done = 0;
  m.questions.forEach((q,i)=>{ const a = S.answers[qid(m,i)]; if (a !== undefined){ done++; if (a === q.c) ok++; } });
  return {ok, done, total:m.questions.length};
}
function weakModules(){ return MODULES.filter(m => { const s = score(m); return s.done < s.total || s.ok / s.total < .7; }); }

function newId(prenom){
  const clean = prenom.trim().replace(/\s+/g," ").replace(/[^\p{L}' -]/gu,"").slice(0,30);
  const name = clean.charAt(0).toUpperCase() + clean.slice(1);
  const set = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = crypto.getRandomValues(new Uint32Array(4));
  return name + "-" + Array.from(rnd, n => set[n % set.length]).join("");
}
function personalLink(){ const u = new URL(location.href); u.search = "?id=" + encodeURIComponent(S.id); u.hash = ""; return u.toString(); }

/* ---------- relais ---------- */
async function api(method, path, body){
  const res = await fetch(API_URL + path, { method, headers: body ? {"Content-Type":"application/json"} : {}, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || ("Erreur " + res.status)); e.status = res.status; throw e; }
  return data;
}
function payload(){
  const scores = {}; let total = 0;
  MODULES.forEach(m => { const s = score(m); scores[m.id] = s.ok; total += s.ok; });
  return { id:S.id, prenom:S.prenom, titre:A("titre"), bigidea:A("bigidea"), scores, total,
    concepts: weakModules().map(m => m.title).join(", "), done: !!S.done,
    state: { answers:S.answers, app:S.app, fb:S.fb, current:S.current, done:!!S.done } };
}
function retourItems(mods){
  return mods.map(m => {
    const s = score(m);
    const ratees = m.questions.map((q,j) => { const a = S.answers[qid(m,j)]; return (a !== undefined && a !== q.c) ? `${q.p}${q.s ? " " + q.s : ""} | donnée : ${q.o[a]} | attendue : ${q.o[q.c]}` : null; }).filter(Boolean).join("\n");
    return { module:m.id, score:s.ok, sur:s.total, ratees, texte:(S.fb[m.id] || "").trim() };
  }).filter(it => it.texte || it.ratees || it.score > 0);
}
function persistLocal(){ lsSet("s:" + S.id, JSON.stringify(S)); lsSet("last", S.id); }
function setStatus(st){ syncState = st; const el = document.getElementById("status"); if (el) { el.className = "status " + st; el.textContent = statusText(); } }
function statusText(){ return !ONLINE ? "Mode local" : ({idle:"Prêt", busy:"Enregistrement…", ok:"Enregistré", off:"Hors ligne, gardé sur cet appareil"})[syncState]; }

function save(){ persistLocal(); if (!ONLINE) return; clearTimeout(saveTimer); saveTimer = setTimeout(pushSession, 2500); }
async function pushSession(){
  if (!ONLINE) return;
  clearTimeout(saveTimer); setStatus("busy");
  try { await api("PUT", "/session", payload()); setStatus("ok"); } catch(e){ setStatus("off"); }
}
async function pushRetours(mods){
  if (!ONLINE) return;
  const items = retourItems(mods);
  if (!items.length) return;
  try { await api("PUT", "/retours", { id:S.id, items }); } catch(e){ setStatus("off"); }
}

/* ---------- analyse de phrases et contrôles ---------- */
function sentences(t){ return String(t||"").replace(/\s+/g," ").trim().split(/(?<=[.!?…])\s+/).filter(Boolean); }
function wc(s){ return s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length; }
function analyzerHTML(t){
  const ss = sentences(t); if (!ss.length) return "";
  const rows = ss.map(s => { const n = wc(s); return `<div class="s ${n>20?"long":""}"><span class="n">${n} m.</span><span>${esc(s)}</span></div>`; }).join("");
  const longs = ss.filter(s => wc(s) > 20).length, avg = Math.round(ss.reduce((a,s)=>a+wc(s),0)/ss.length);
  return `<div class="analyzer">${rows}<div class="sum">${ss.length} phrase(s), ${avg} mots en moyenne, ${longs} au-delà de 20 mots</div></div>`;
}
function checksHTML(kind, v){
  v = String(v||"").trim(); if (!v) return "";
  const c = [];
  if (kind === "bigidea"){
    const n = wc(v), ss = sentences(v).length;
    c.push([ss <= 1, ss <= 1 ? "Une seule phrase" : `${ss} phrases, vise une seule`]);
    c.push([n <= 30, `${n} mots${n>30 ? ", c'est long pour être retenu" : ""}`]);
    c.push([!!A("enjeu"), A("enjeu") ? "Enjeu renseigné" : "Enjeu pas encore renseigné"]);
  }
  if (kind === "cible"){
    const vague = /tout le monde|tous publics|n'importe qui|tout public/i.test(v);
    c.push([!vague, vague ? "Cible trop large" : "Cible ciblée"]);
    c.push([wc(v) >= 6, wc(v) >= 6 ? "Assez précise" : "Ajoute une situation ou un besoin"]);
  }
  return `<div class="checks">${c.map(([ok,l])=>`<span class="chip ${ok?"pass":"fail"}">${esc(l)}</span>`).join("")}</div>`;
}

/* ---------- écran de connexion ---------- */
function renderLogin(mode, prefill, error){
  mode = mode || "new";
  ROOT.innerHTML = `<div class="login">
    <div class="brand"><span class="rec" aria-hidden="true"></span><span class="eyebrow">Environ 50 min · 5 modules</span></div>
    <h1>Atelier script vidéo</h1>
    <p class="sub">Un concept sourcé, des questions pour vérifier, puis tu l'appliques à ton idée de vidéo. Tu repars avec ta fiche d'idée et une page des concepts à creuser.</p>
    ${ONLINE ? "" : `<p class="banner">Mode local : le relais n'est pas configuré, tes réponses restent sur cet appareil.</p>`}
    <section class="block">
      <div class="tabs" role="group" aria-label="Type de connexion">
        <button class="btn" type="button" data-mode="new" aria-pressed="${mode==="new"}">Première visite</button>
        <button class="btn" type="button" data-mode="back" aria-pressed="${mode==="back"}">J'ai un identifiant</button>
      </div>
      <form id="loginForm" novalidate>
      ${mode === "new" ? `
        <div class="field"><label for="prenom">Ton prénom</label><input type="text" id="prenom" autocomplete="given-name" maxlength="30" required></div>
        <label class="consent"><input type="checkbox" id="consent" required><span>J'accepte que mon prénom, mes réponses et mes retours soient enregistrés pour me renvoyer mon bilan et améliorer l'atelier. Je peux tout supprimer à tout moment avec le bouton « Supprimer mes données ».</span></label>
        <button class="btn primary" type="submit">Commencer</button>`
      : `
        <div class="field"><label for="ident">Ton identifiant</label><span class="help">Il a la forme Prénom-ABCD. Il figure aussi dans ton lien personnel.</span><input type="text" id="ident" value="${esc(prefill||"")}" autocomplete="off" required></div>
        <button class="btn primary" type="submit">Reprendre</button>`}
      <p class="err" id="loginErr" role="alert">${esc(error||"")}</p>
      </form>
    </section></div>`;
  ROOT.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => renderLogin(b.dataset.mode));
  document.getElementById("loginForm").onsubmit = e => { e.preventDefault(); mode === "new" ? startNew() : resume(document.getElementById("ident").value); };
}
function startNew(){
  const p = document.getElementById("prenom").value.trim(), err = document.getElementById("loginErr");
  if (!/\p{L}/u.test(p)) { err.textContent = "Indique ton prénom pour commencer."; return; }
  if (!document.getElementById("consent").checked) { err.textContent = "Coche la case d'accord pour que tes réponses puissent être enregistrées."; return; }
  S = { id:newId(p), prenom:p, answers:{}, app:{}, fb:{}, current:"m1", done:false, fresh:true };
  persistLocal(); pushSession(); renderApp();
}
async function resume(raw){
  const id = String(raw||"").trim();
  const err = () => document.getElementById("loginErr");
  if (!/^[\p{L}][\p{L}' -]{0,29}-[A-Z0-9]{4}$/u.test(id)) { renderLogin("back", id, "Format attendu : Prénom-ABCD, avec le tiret et les 4 caractères en majuscules."); return; }
  const local = lsGet("s:" + id);
  if (ONLINE) {
    if (err()) err().textContent = "Chargement…";
    try {
      const r = await api("GET", "/session?id=" + encodeURIComponent(id));
      const st = r.state || {};
      S = { id, prenom:id.replace(/-[A-Z0-9]{4}$/,""), answers:st.answers||{}, app:st.app||{}, fb:st.fb||{}, current:st.current||"m1", done:!!st.done };
      persistLocal(); renderApp(); setStatus("ok"); return;
    } catch(e) {
      if (e.status === 404 && !local) { renderLogin("back", id, "Identifiant introuvable. Vérifie les majuscules et le tiret."); return; }
      if (!local) { renderLogin("back", id, "Le serveur ne répond pas. Réessaie dans un instant."); return; }
    }
  } else if (!local) { renderLogin("back", id, "Aucune session avec cet identifiant sur cet appareil."); return; }
  S = JSON.parse(local); renderApp(); if (ONLINE) setStatus("off");
}

/* ---------- parcours ---------- */
function renderApp(){
  ROOT.innerHTML = `<div class="wrap">
    <header class="top">
      <div><div class="brand"><span class="rec" aria-hidden="true"></span><span class="eyebrow">Atelier script vidéo</span></div>
        <div class="who" style="margin-top:6px">Connecté : <b>${esc(S.id)}</b><span id="status" class="status ${syncState}">${statusText()}</span></div></div>
      <div class="actions" id="acct"><button class="btn" type="button" data-act="logout">Changer de participant</button><button class="btn" type="button" data-act="del">Supprimer mes données</button></div>
    </header>
    ${S.fresh ? `<div class="banner" id="welcome" style="background:var(--surface);color:var(--fg);border:1px solid var(--line)">
      <p style="margin:0 0 6px">Ton identifiant, à noter pour revenir plus tard :</p><span class="idcard">${esc(S.id)}</span>
      <div class="linkbox" style="margin-top:8px"><input type="text" id="plink" readonly value="${esc(personalLink())}"><button class="btn" type="button" data-copyval="plink">Copier mon lien</button><button class="btn" type="button" data-act="hidewelcome">C'est noté</button></div></div>` : ""}
    <nav class="toc" id="toc" aria-label="Modules"></nav>
    <main id="main"></main></div>`;
  history.replaceState(null, "", "?id=" + encodeURIComponent(S.id));
  renderMain();
}
function renderTOC(){
  document.getElementById("toc").innerHTML = ALL.map(m => {
    const prog = m.questions ? `${score(m).done}/${m.questions.length} questions` : "";
    return `<button type="button" data-go="${m.id}" aria-current="${S.current===m.id}"><span class="tc">${m.tc}</span><span class="lbl">${esc(m.short)}</span>${prog?`<span class="prog">${prog}</span>`:""}</button>`;
  }).join("");
}
function renderMain(){
  renderTOC();
  const m = ALL.find(x => x.id === S.current) || ALL[0];
  document.getElementById("main").innerHTML = m.id === "bilan" ? bilanHTML() : moduleHTML(m);
}

function questionHTML(m,q,i){
  const id = qid(m,i), a = S.answers[id], answered = a !== undefined;
  const opts = q.o.map((o,j) => {
    let cls = "opt"; if (answered){ if (j === q.c) cls += " right"; else if (j === a) cls += " wrong"; }
    return `<button type="button" class="${cls}" data-q="${id}" data-o="${j}" ${answered?"disabled":""}>${esc(o)}</button>`;
  }).join("");
  const fb = answered ? `<div class="fb ${a===q.c?"ok":"ko"}"><b>${a===q.c ? "Juste." : "Pas tout à fait. Réponse : " + esc(q.o[q.c])}</b>${esc(q.e)}</div>` : "";
  return `<div class="q"><p class="prompt">${esc(q.p)}</p>${q.s?`<div class="script">${esc(q.s)}</div>`:""}<div class="opts ${q.row?"row":""}">${opts}</div>${fb}</div>`;
}
function pickHTML(f){
  const v = S.app[f.id] || "";
  const opts = f.from.map(k => A(k) ? `<label class="radio"><input type="radio" name="f-${f.id}" data-f="${f.id}" value="${k}" ${v===k?"checked":""}><span>${esc(A(k))}</span></label>` : "").join("");
  return `<div id="pick-${f.id}" class="opts">${opts || `<span class="help">Écris au moins une version pour pouvoir choisir.</span>`}</div>`;
}
function fieldHTML(f){
  const v = S.app[f.id] ?? "";
  if (f.type === "structure"){
    const choice = S.app.structure || "";
    const sel = `<div class="field"><label for="f-structure">${esc(f.label)}</label><select id="f-structure" data-f="structure">${["", ...Object.keys(STRUCTS)].map(k => `<option ${k===choice?"selected":""} value="${esc(k)}">${k ? esc(k) : "Choisir…"}</option>`).join("")}</select></div>`;
    const steps = choice ? STRUCTS[choice].map((st,i) => `<div class="field"><label for="f-st_${i}">${esc(st)}</label><textarea id="f-st_${i}" data-f="st_${i}" rows="2">${esc(S.app["st_"+i]||"")}</textarea></div>`).join("") : `<p class="help" style="color:var(--muted)">Choisis une structure pour faire apparaître ses étapes.</p>`;
    return sel + steps;
  }
  if (f.type === "pick") return `<div class="field"><label>${esc(f.label)}</label>${pickHTML(f)}</div>`;
  let input;
  if (f.type === "select") input = `<select id="f-${f.id}" data-f="${f.id}">${f.options.map(o => `<option ${o===v?"selected":""} value="${esc(o)}">${o ? esc(o) : "Choisir…"}</option>`).join("")}</select>`;
  else if (f.type === "textarea") input = `<textarea id="f-${f.id}" data-f="${f.id}" class="${f.cls||""}" placeholder="${esc(f.ph||"")}">${esc(v)}</textarea>`;
  else input = `<input type="text" id="f-${f.id}" data-f="${f.id}" value="${esc(v)}" placeholder="${esc(f.ph||"")}">`;
  return `<div class="field"><label for="f-${f.id}">${esc(f.label)}</label>${f.help?`<span class="help">${esc(f.help)}</span>`:""}${input}<div id="x-${f.id}">${f.analyze?analyzerHTML(v):""}${f.checks?checksHTML(f.checks,v):""}</div></div>`;
}
function moduleHTML(m){
  const idx = MODULES.indexOf(m), s = score(m);
  const ex = m.exercise ? `<div class="q"><p class="prompt">${esc(m.exercise.label)}</p><div class="script">${esc(m.exercise.s)}</div>
    <div class="field"><textarea class="script-in" id="f-${m.exercise.id}" data-f="${m.exercise.id}" placeholder="Ta version…">${esc(S.app[m.exercise.id]||"")}</textarea><div id="x-${m.exercise.id}">${analyzerHTML(S.app[m.exercise.id])}</div></div></div>` : "";
  return `<div class="eyebrow">Module ${idx+1} · environ ${m.min} min · TC ${m.tc}</div>
  <h2>${esc(m.title)}</h2>
  <section class="block"><h3><span class="step">1</span>Le concept</h3><div class="prose">${m.concept}</div>
    <div class="sources">Sources<ul>${m.sources.map(k => `<li><a href="${SRC[k][1]}" target="_blank" rel="noopener">${esc(SRC[k][0])}</a></li>`).join("")}</ul></div></section>
  <section class="block"><h3><span class="step">2</span>Vérifier <span style="margin-left:auto;font:600 .9rem var(--body);color:var(--muted)" id="sc-${m.id}">${s.ok}/${s.total}</span></h3>
    ${m.questions.map((q,i) => questionHTML(m,q,i)).join("")}${ex}</section>
  <section class="block"><h3><span class="step">3</span>Appliquer à ton idée</h3>${m.app.map(fieldHTML).join("")}</section>
  <section class="block feedback-block"><h3><span class="step">4</span>Ton retour sur ce module</h3>
    <div class="field"><label for="fb-${m.id}">Qu'est-ce qui était flou, en trop, ou manquant ?</label><span class="help">Envoyé automatiquement quand tu passes au module suivant. Il sert à améliorer l'atelier.</span>
    <textarea id="fb-${m.id}" data-fb="${m.id}">${esc(S.fb[m.id]||"")}</textarea></div></section>
  <div class="pager">${idx>0 ? `<button class="btn" type="button" data-go="${ALL[idx-1].id}">Module précédent</button>` : "<span></span>"}<button class="btn primary" type="button" data-go="${ALL[idx+1].id}">${idx+1 < MODULES.length ? "Module suivant" : "Voir mon bilan"}</button></div>`;
}

/* ---------- livrables ---------- */
const or = (v, d="à compléter") => v || `_${d}_`;
function livrableMD(){
  const st = A("structure"), hk = A("hchoix");
  const steps = st ? STRUCTS[st].map((l,i) => `${i+1}. **${l.split(" : ")[0]}** : ${or(A("st_"+i))}`).join("\n") : "_Structure non choisie_";
  const others = ["h1","h2","h3"].filter(k => k !== hk && A(k)).map(k => `- ${A(k)}`).join("\n");
  return `# Fiche idée : ${A("titre") || "Sans titre"}

## Cadrage
- **Sujet de départ** : ${or(A("sujet"))}
- **Point de vue** : ${or(A("pdv"))}
- **Enjeu** : ${or(A("enjeu"))}
- **Big Idea (message central)** : ${or(A("bigidea"))}
- **Cible** : ${or(A("cible"))}
- **Ce qu'elle sait déjà** : ${or(A("sait"))}
- **Objectif** : ${or(A("objectif"))}
- **Action unique attendue** : ${or(A("action"))}
- **Format et durée** : ${or(A("format"))}

## Structure : ${st || "à choisir"}
${steps}

## Accroche
- **Titre (promesse)** : ${or(A("promesse"))}
- **Accroche retenue** : ${or(hk ? A(hk) : "")}
${others ? "\nAutres versions :\n" + others : ""}

## Début de script
- **Partie 1, texte** : ${or(A("p1texte"))}
- **Partie 1, à l'écran** : ${or(A("p1visuel"))}
- **Appel à l'action** : ${or(A("cta"))}
`;
}

function personalHTML(){
  const date = new Date().toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
  const weak = weakModules(), strong = MODULES.filter(m => !weak.includes(m));
  const row = (k,v) => `<tr><th>${k}</th><td>${v ? esc(v).replace(/\n/g,"<br>") : '<span class="todo">à compléter</span>'}</td></tr>`;
  const st = A("structure"), hk = A("hchoix");
  const concept = m => {
    const s = score(m);
    const ratees = m.questions.map((q,j) => { const a = S.answers[qid(m,j)]; if (a === q.c) return ""; return `<li><b>${esc(q.p)}${q.s ? " « " + esc(q.s) + " »" : ""}</b><br>${a === undefined ? "Sans réponse." : "Ta réponse : " + esc(q.o[a]) + "."} Bonne réponse : ${esc(q.o[q.c])}.<br><span class="ex">${esc(q.e)}</span></li>`; }).join("");
    return `<section class="c"><h3>${esc(m.title)} <span class="sc">${s.ok}/${s.total}</span></h3>${m.concept}
      ${ratees ? `<h4>À revoir</h4><ul class="r">${ratees}</ul>` : ""}
      <h4>Pour creuser</h4><ul>${m.sources.map(k => `<li><a href="${SRC[k][1]}">${esc(SRC[k][0])}</a></li>`).join("")}</ul></section>`;
  };
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bilan atelier script vidéo, ${esc(S.prenom)}</title>
<style>
body{font:16px/1.6 "Source Sans 3",system-ui,sans-serif;color:#161922;background:#fff;max-width:760px;margin:0 auto;padding:32px 20px 64px}
h1{font:700 1.9rem/1.15 "Bricolage Grotesque",system-ui,sans-serif;margin:4px 0 6px}
h2{font:700 1.3rem "Bricolage Grotesque",system-ui,sans-serif;margin:36px 0 12px;padding-bottom:6px;border-bottom:2px solid #c62f27}
h3{font:700 1.08rem "Bricolage Grotesque",system-ui,sans-serif;margin:0 0 8px;display:flex;justify-content:space-between;gap:12px}
h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:#596071;margin:14px 0 4px}
.eb{font:400 .82rem "Courier New",monospace;color:#c62f27;text-transform:uppercase;letter-spacing:.04em}
.meta{color:#596071}
table{width:100%;border-collapse:collapse;margin:0 0 8px}
th{text-align:left;vertical-align:top;width:34%;padding:8px 12px 8px 0;color:#596071;font-weight:600;border-top:1px solid #dcdfe6}
td{padding:8px 0;border-top:1px solid #dcdfe6}
.todo{color:#8a5a00;font-style:italic}
.c{border:1px solid #dcdfe6;border-radius:10px;padding:16px 18px;margin:0 0 14px}
.sc{font:700 .9rem "Courier New",monospace;color:#c62f27}
.r li{margin-bottom:8px}.ex{color:#596071}
.tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;background:#fdf1d8;color:#8a5a00;padding:1px 6px;border-radius:4px}
a{color:#161922}
.script{font-family:"Courier New",monospace;background:#fdfcf6;border:1px solid #dcdfe6;border-radius:6px;padding:10px 12px;white-space:pre-wrap}
@media print{a{color:#161922;text-decoration:none}.c{break-inside:avoid}}
</style></head><body>
<div class="eb">Atelier script vidéo · Bilan personnel</div>
<h1>${esc(A("titre") || "Ta fiche idée")}</h1>
<p class="meta">${esc(S.prenom)} · ${esc(S.id)} · ${date}</p>

<h2>Ta fiche idée</h2>
<table>${row("Sujet de départ", A("sujet"))}${row("Point de vue", A("pdv"))}${row("Enjeu", A("enjeu"))}${row("Big Idea", A("bigidea"))}${row("Cible", A("cible"))}${row("Ce qu'elle sait déjà", A("sait"))}${row("Objectif", A("objectif"))}${row("Action unique", A("action"))}${row("Format et durée", A("format"))}</table>

<h2>Structure : ${esc(st || "à choisir")}</h2>
${st ? `<table>${STRUCTS[st].map((l,i) => row(esc(l.split(" : ")[0]), A("st_"+i))).join("")}</table>` : '<p class="todo">Structure non choisie.</p>'}

<h2>Accroche et début de script</h2>
<table>${row("Titre (promesse)", A("promesse"))}</table>
<h4>Accroche retenue</h4><div class="script">${esc(hk ? A(hk) : "") || "à compléter"}</div>
<h4>Partie 1, texte</h4><div class="script">${esc(A("p1texte")) || "à compléter"}</div>
<h4>Partie 1, à l'écran</h4><p>${esc(A("p1visuel")) || '<span class="todo">à compléter</span>'}</p>
<h4>Appel à l'action</h4><div class="script">${esc(A("cta")) || "à compléter"}</div>

<h2>Concepts à creuser</h2>
${weak.length ? weak.map(concept).join("") : "<p>Tu as répondu juste à au moins 70 % des questions de chaque module.</p>"}
${strong.length ? `<h2>Concepts maîtrisés</h2><ul>${strong.map(m => `<li>${esc(m.title)} : ${score(m).ok}/${m.questions.length}</li>`).join("")}</ul>` : ""}

<h2>Toutes les sources</h2>
<ul>${Object.values(SRC).map(([l,u]) => `<li><a href="${u}">${esc(l)}</a></li>`).join("")}</ul>
<p class="meta" style="margin-top:28px">Pour revenir à l'atelier : <a href="${esc(personalLink())}">${esc(personalLink())}</a></p>
</body></html>`;
}
function download(){
  const blob = new Blob([personalHTML()], {type:"text/html;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "bilan-atelier-script-video-" + S.id + ".html";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function bilanHTML(){
  const rows = MODULES.map((m,i) => { const s = score(m), pct = Math.round(100*s.ok/s.total);
    return `<div class="score-row"><span>${i+1}. ${esc(m.title)}</span><div class="bar" aria-hidden="true"><i style="width:${pct}%"></i></div><span class="num">${s.ok}/${s.total}</span></div>`; }).join("");
  const weak = weakModules();
  return `<div class="eyebrow">Bilan · TC 45:00</div><h2>Ton bilan</h2>
  <section class="block"><h3>Compréhension par concept</h3>${rows}
    <p class="help" style="color:var(--muted);margin:12px 0 0">${weak.length ? "Concepts à creuser : " + weak.map(m => esc(m.short)).join(", ") + ". Ils sont détaillés dans ta page de bilan, avec les questions à revoir et les sources." : "Au moins 70 % de bonnes réponses dans chaque module."}</p></section>
  <section class="block"><h3>Ta page de bilan</h3>
    <p class="prose" style="margin:0 0 12px">Une page à garder : ta fiche idée, ton début de script et les concepts à creuser, avec leurs sources. Elle s'ouvre dans n'importe quel navigateur, et tu peux l'enregistrer en PDF avec la fonction Imprimer.</p>
    <div class="actions"><button class="btn primary" type="button" data-act="download">Télécharger ma page de bilan</button></div></section>
  <section class="block"><h3>Ta fiche idée en texte</h3>
    <p class="prose" style="margin:0 0 10px">À coller dans Notion ou dans tes notes.</p>
    <pre class="out" id="outLiv">${esc(livrableMD())}</pre>
    <div class="actions"><button class="btn" type="button" data-copy="outLiv">Copier la fiche</button><span class="toast" id="t-outLiv" aria-live="polite"></span></div></section>
  <section class="block"><h3>Ton lien personnel</h3>
    <p class="prose" style="margin:0 0 10px">Pour revenir modifier tes réponses plus tard, depuis n'importe quel appareil.</p>
    <div class="linkbox"><input type="text" id="plink2" readonly value="${esc(personalLink())}"><button class="btn" type="button" data-copyval="plink2">Copier</button></div></section>
  <div class="pager"><button class="btn" type="button" data-go="m5">Module précédent</button><span></span></div>`;
}

/* ---------- événements ---------- */
function copyText(text, toastEl, selectEl){
  const fallback = () => { if (selectEl){ selectEl.select ? selectEl.select() : (() => { const r = document.createRange(); r.selectNodeContents(selectEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); })(); } if (toastEl) toastEl.textContent = "Sélectionné, copie avec Ctrl+C ou Cmd+C."; };
  try { navigator.clipboard.writeText(text).then(() => { if (toastEl) toastEl.textContent = "Copié."; }, fallback); } catch(e){ fallback(); }
}

document.addEventListener("click", e => {
  if (!S) return;
  const go = e.target.closest("[data-go]");
  if (go){
    const from = MODULES.find(m => m.id === S.current);
    S.current = go.dataset.go;
    if (S.current === "bilan") S.done = true;
    save(); pushSession();
    if (from) pushRetours([from]);
    if (S.current === "bilan") pushRetours(MODULES);
    renderMain(); window.scrollTo({top:0, behavior:"smooth"}); return;
  }
  const opt = e.target.closest(".opt[data-q]");
  if (opt && !opt.disabled){
    S.answers[opt.dataset.q] = +opt.dataset.o; save();
    const m = MODULES.find(x => opt.dataset.q.startsWith(x.id + "q")), i = +opt.dataset.q.slice(m.id.length + 1);
    opt.closest(".q").outerHTML = questionHTML(m, m.questions[i], i);
    const s = score(m); document.getElementById("sc-" + m.id).textContent = `${s.ok}/${s.total}`;
    renderTOC(); return;
  }
  const cp = e.target.closest("[data-copy]");
  if (cp){ const el = document.getElementById(cp.dataset.copy); copyText(el.textContent, document.getElementById("t-" + cp.dataset.copy), el); return; }
  const cv = e.target.closest("[data-copyval]");
  if (cv){ const el = document.getElementById(cv.dataset.copyval); copyText(el.value, null, el); cv.textContent = "Copié"; return; }
  const act = e.target.closest("[data-act]")?.dataset.act;
  const acct = document.getElementById("acct");
  if (act === "download") download();
  if (act === "hidewelcome"){ S.fresh = false; persistLocal(); document.getElementById("welcome")?.remove(); }
  if (act === "logout"){ pushSession(); lsDel("last"); S = null; history.replaceState(null, "", location.pathname); renderLogin("new"); }
  if (act === "del") acct.innerHTML = `<span class="confirm">Supprimer définitivement ta session et tes retours ? <button class="btn" type="button" data-act="delyes">Oui, supprimer</button><button class="btn" type="button" data-act="delno">Annuler</button></span>`;
  if (act === "delno") acct.innerHTML = `<button class="btn" type="button" data-act="logout">Changer de participant</button><button class="btn" type="button" data-act="del">Supprimer mes données</button>`;
  if (act === "delyes"){
    const id = S.id;
    const finish = msg => { lsDel("s:" + id); lsDel("last"); S = null; history.replaceState(null, "", location.pathname); renderLogin("new", "", msg); };
    if (!ONLINE) finish("Tes données ont été supprimées de cet appareil.");
    else api("DELETE", "/session?id=" + encodeURIComponent(id)).then(() => finish("Tes données ont été supprimées."), () => finish("La suppression côté serveur a échoué. Écris à l'organisateur avec ton identifiant : " + id));
  }
});
document.addEventListener("input", e => {
  if (!S) return;
  const el = e.target;
  if (el.dataset.fb){ S.fb[el.dataset.fb] = el.value; save(); return; }
  const f = el.dataset.f; if (!f) return;
  S.app[f] = el.value; save();
  if (f === "structure"){ renderMain(); return; }
  const def = MODULES.flatMap(m => m.app).find(x => x.id === f) || (f === "rewrite" ? {analyze:true} : null);
  const box = document.getElementById("x-" + f);
  if (def && box) box.innerHTML = (def.analyze ? analyzerHTML(el.value) : "") + (def.checks ? checksHTML(def.checks, el.value) : "");
  if (f === "enjeu"){ const b = document.getElementById("x-bigidea"); if (b) b.innerHTML = checksHTML("bigidea", S.app.bigidea); }
});
document.addEventListener("change", e => {
  if (!S) return;
  const el = e.target;
  if (el.type === "radio" && el.dataset.f){ S.app[el.dataset.f] = el.value; save(); }
  if (el.tagName === "SELECT" && el.dataset.f){ S.app[el.dataset.f] = el.value; save(); if (el.dataset.f === "structure") renderMain(); }
});
document.addEventListener("focusout", e => {
  if (!S || !["h1","h2","h3"].includes(e.target.dataset?.f)) return;
  const p = document.getElementById("pick-hchoix");
  if (p){ const d = document.createElement("div"); d.innerHTML = pickHTML(MODULES[3].app.find(x => x.id === "hchoix")); p.replaceWith(d.firstElementChild); }
});
window.addEventListener("pagehide", () => {
  if (!S || !ONLINE || !saveTimer) return;
  clearTimeout(saveTimer);
  try { fetch(API_URL + "/session", {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload()), keepalive:true}); } catch(e){}
});

/* ---------- démarrage ---------- */
(function boot(){
  const fromUrl = new URLSearchParams(location.search).get("id");
  if (fromUrl) { renderLogin("back", fromUrl); resume(fromUrl); return; }
  const last = lsGet("last");
  if (last && lsGet("s:" + last)) { S = JSON.parse(lsGet("s:" + last)); renderApp(); return; }
  renderLogin("new");
})();
