/* =====================================================================
   APP — shell, router, landing, motor de presupuesto y generador de briefs
   ===================================================================== */
(function () {
  const C = window.STUDIO_CONFIG;
  const { $, money, esc, toast } = window.U;
  const app = document.getElementById('app');

  // ---------- branding ----------
  document.title = `${C.brand} — Dashboards, automatización y datos`;
  $('#brandName').textContent = C.brand;
  $('#navLinks').innerHTML = [
    ['#/', 'Inicio'], ['#/herramientas', 'Herramientas'],
    ['#/presupuesto', 'Presupuesto'], ['#/brief', 'Brief'], ['#/contacto', 'Contacto']
  ].map(([h, t]) => `<a href="${h}">${t}</a>`).join('');

  // menú mobile
  const navLinks = $('#navLinks'), navToggle = $('#navToggle');
  navToggle.onclick = () => navLinks.classList.toggle('open');
  navLinks.onclick = e => { if (e.target.tagName === 'A') navLinks.classList.remove('open'); };

  // analítica (config-driven, opcional)
  if (C.integrations?.analytics) {
    const tmp = document.createElement('div'); tmp.innerHTML = C.integrations.analytics;
    tmp.querySelectorAll('script').forEach(s => { const ns = document.createElement('script'); [...s.attributes].forEach(a => ns.setAttribute(a.name, a.value)); ns.textContent = s.textContent; document.head.appendChild(ns); });
  }
  // og:url dinámico
  const ogUrl = C.seo?.url || location.href.split('#')[0];
  const ogTag = document.createElement('meta'); ogTag.setAttribute('property', 'og:url'); ogTag.setAttribute('content', ogUrl); document.head.appendChild(ogTag);

  const svc = id => C.services.find(s => s.id === id);
  const tierOpts = s => s.tierNames.map((n, i) => `<option value="${i}">${n} · ${money(s.tiers[i])} — ${s.tierDesc[i]}</option>`).join('');

  // =================== VIEWS ===================
  const Views = {
    home() {
      return `
      <section class="hero view">
        <span class="badge">${esc(C.tagline)}</span>
        <h1>${esc(C.headline)}</h1>
        <p>${esc(C.subhead)}</p>
        <div class="cta-row">
          <a href="#/herramientas" class="btn primary">Probar las herramientas</a>
          <a href="#/presupuesto" class="btn ghost">Calcular presupuesto</a>
        </div>
      </section>

      <section class="section">
        <h2>Servicios</h2>
        <div class="sub">Soluciones concretas. Probá la herramienta de cada uno antes de contratar.</div>
        <div class="grid c2">
          ${C.services.map(s => `
            <div class="card hover">
              <div class="ic">${s.icon}</div>
              <h3>${esc(s.name)}</h3>
              <div class="muted">${esc(s.desc)}</div>
              <div class="price">Desde <b>${money(s.tiers[0])}</b></div>
              <div style="margin-top:14px;display:flex;gap:8px">
                ${s.tool ? `<a href="#/herramienta/${s.tool}" class="btn ghost sm">Probar herramienta</a>` : ''}
                <a href="#/presupuesto?s=${s.id}" class="btn primary sm">Presupuesto</a>
              </div>
            </div>`).join('')}
        </div>
      </section>

      <section class="section">
        <h2>Por qué trabajar conmigo</h2>
        <div class="grid c3" style="margin-top:20px">
          ${C.valueProps.map(v => `<div class="card prop"><div class="ic">${v.icon}</div><div><h3>${esc(v.title)}</h3><div class="muted">${esc(v.text)}</div></div></div>`).join('')}
        </div>
      </section>

      <section class="section">
        <h2>Cómo funciona</h2>
        <div class="steps" style="margin-top:20px;max-width:640px">
          <div class="step"><span class="n"></span><div><b>Probás la herramienta</b><div class="muted">Mirás en vivo lo que puedo construir.</div></div></div>
          <div class="step"><span class="n"></span><div><b>Calculás tu presupuesto</b><div class="muted">Precio claro al instante, sin esperar.</div></div></div>
          <div class="step"><span class="n"></span><div><b>Completás el brief</b><div class="muted">Me pasás los detalles en 2 minutos.</div></div></div>
          <div class="step"><span class="n"></span><div><b>Recibís tu solución</b><div class="muted">Te entrego algo que se mantiene solo.</div></div></div>
        </div>
      </section>

      ${C.testimonials.length ? `<section class="section">
        <h2>Lo que dicen</h2>
        <div class="grid c2" style="margin-top:20px">
          ${C.testimonials.map(t => `<div class="card">“${esc(t.text)}”<div class="muted" style="margin-top:10px">— ${esc(t.author)}</div></div>`).join('')}
        </div></section>` : ''}

      <section class="section center" style="background:var(--panel);border:1px solid var(--border);border-radius:18px;padding:42px">
        <h2>¿Tenés un proyecto con datos?</h2>
        <div class="sub" style="margin-bottom:22px">Calculá tu presupuesto en 30 segundos. Sin compromiso.</div>
        <a href="#/presupuesto" class="btn primary">Empezar ahora</a>
      </section>`;
    },

    herramientas() {
      return `<section class="view"><h2>Herramientas</h2>
        <div class="sub">Reales y funcionales. Usalas gratis — y mirá lo que puedo construir a medida.</div>
        <div class="grid c2">
          ${C.tools.map(id => { const t = window.TOOLS[id]; return `<div class="card hover"><div class="ic">${t.icon}</div><h3>${esc(t.name)}</h3><div class="muted">${esc(t.blurb)}</div><div style="margin-top:14px"><a href="#/herramienta/${id}" class="btn primary sm">Abrir →</a></div></div>`; }).join('')}
        </div></section>`;
    },

    presupuesto(params) {
      const pre = params.s || C.services[0].id;
      return `<section class="view" style="max-width:760px;margin:0 auto">
        <h2>💰 Presupuesto instantáneo</h2>
        <div class="sub">Elegí servicio y opciones. El precio se calcula solo. ${esc(C.fxNote)}</div>
        <div class="panel">
          <div class="field"><label>Servicio</label><select id="qSvc">${C.services.map(s => `<option value="${s.id}" ${s.id === pre ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}</select></div>
          <div class="field"><label>Alcance</label><select id="qTier"></select></div>
          <div id="qVol"></div>
          <div class="field"><label>Revisiones extra</label><input type="number" id="qRev" value="0" min="0"></div>
          <label class="pill" id="qRush" style="margin-top:6px"><input type="checkbox" id="qRushChk" style="width:auto;margin:0"> Entrega urgente (48h) +${Math.round((C.pricing.rushMultiplier - 1) * 100)}%</label>
        </div>
        <div class="panel center">
          <div class="muted">Estimado</div>
          <div class="quote-big" id="qTotal">—</div>
          <div class="muted" id="qBreak" style="margin-top:8px;font-size:13px"></div>
          <a href="#" class="btn primary" id="qNext" style="margin-top:18px">Continuar con el brief →</a>
        </div></section>`;
    },

    brief(params) {
      const pre = params.s || C.services[0].id;
      return `<section class="view" style="max-width:760px;margin:0 auto">
        <h2>📝 Brief del proyecto</h2>
        <div class="sub">Respondé esto y genero un resumen prolijo que podés enviarme por mail o Fiverr.</div>
        <div class="panel">
          <div class="field"><label>Servicio</label><select id="bSvc">${C.services.map(s => `<option value="${s.id}" ${s.id === pre ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}</select></div>
          <div class="field"><label>Tu nombre / empresa</label><input id="bName" placeholder="Nombre"></div>
          <div class="field"><label>Email de contacto</label><input id="bEmail" type="email" placeholder="vos@mail.com"></div>
          <div id="bDyn"></div>
          <div class="field"><label>Plazo deseado</label><input id="bDeadline" placeholder="Ej: 1 semana"></div>
          <div class="field"><label>Algo más que deba saber</label><textarea id="bExtra" rows="3" placeholder="Contexto, links, detalles..."></textarea></div>
          <button class="btn primary" id="bGen">Generar brief</button>
        </div>
        <div class="panel" id="bOut" style="display:none">
          <h3>Tu brief</h3>
          <textarea id="bText" rows="14" style="font-family:Consolas,monospace;font-size:12px"></textarea>
          <div class="toolbar" style="margin-top:12px">
            ${C.integrations?.formEndpoint ? `<button class="btn primary sm" id="bSend">📨 Enviarme el brief</button>` : ''}
            <button class="btn ${C.integrations?.formEndpoint ? 'ghost' : 'primary'} sm" id="bCopy">Copiar</button>
            <button class="btn ghost sm" id="bDl">Descargar .txt</button>
            ${C.links.fiverr ? `<a class="btn ghost sm" href="${C.links.fiverr}" target="_blank">Enviar por Fiverr</a>` : ''}
            <a class="btn ghost sm" id="bMail" href="#">Enviar por email</a>
          </div>
        </div></section>`;
    },

    contacto() {
      const L = C.links;
      const link = (h, t) => h ? `<a class="btn ghost sm" href="${h}" target="_blank">${t}</a>` : '';
      return `<section class="view" style="max-width:640px;margin:0 auto">
        <h2>📬 Contacto</h2>
        <div class="sub">Hablemos de tu proyecto.</div>
        <div class="panel">
          <div class="row" style="flex-wrap:wrap">
            <a class="btn primary sm" href="mailto:${C.email}">✉️ ${esc(C.email)}</a>
            ${C.whatsapp ? `<a class="btn ghost sm" href="https://wa.me/${C.whatsapp}" target="_blank">💬 WhatsApp</a>` : ''}
            ${link(L.fiverr, 'Fiverr')}${link(L.linkedin, 'LinkedIn')}${link(L.github, 'GitHub')}${link(L.gumroad, 'Mis plantillas')}
          </div>
          <p class="notice" style="margin-top:14px">Tip: usá la calculadora de <a href="#/presupuesto">presupuesto</a> y el <a href="#/brief">brief</a> antes de escribir — así avanzamos más rápido.</p>
        </div></section>`;
    },
  };

  // =================== TOOL HOST ===================
  function renderTool(id) {
    const t = window.TOOLS[id];
    app.innerHTML = `<section class="view"><a href="#/herramientas" class="muted" style="font-size:13px">← Herramientas</a><div id="toolRoot" style="margin-top:12px"></div></section>`;
    if (t) t.render($('#toolRoot')); else app.innerHTML = '<p>Herramienta no encontrada.</p>';
  }

  // =================== WIRING ===================
  function wireQuote(params) {
    const sel = $('#qSvc'), tier = $('#qTier');
    function fillTier() { const s = svc(sel.value); tier.innerHTML = tierOpts(s);
      $('#qVol').innerHTML = s.unit ? `<div class="field"><label>Volumen (${s.unit})</label><input type="number" id="qVolN" value="1000" min="1"></div>` : '';
      if ($('#qVolN')) $('#qVolN').oninput = calc; calc(); }
    function calc() {
      const s = svc(sel.value); let base = s.tiers[+tier.value];
      const P = C.pricing; let mult = 1, parts = [`Base ${money(base)}`];
      if (s.unit && $('#qVolN')) { const v = +$('#qVolN').value || 0; const br = P.volumeBreaks.find(b => v <= b.upTo); if (br && br.mult !== 1) { mult *= br.mult; parts.push(`volumen ×${br.mult}`); } }
      const rev = +$('#qRev').value || 0; let total = base * mult + rev * P.revisionUnit;
      if (rev) parts.push(`${rev} rev (${money(rev * P.revisionUnit)})`);
      if ($('#qRushChk').checked) { total *= P.rushMultiplier; parts.push(`urgente ×${P.rushMultiplier}`); }
      $('#qTotal').textContent = money(Math.round(total));
      $('#qBreak').textContent = parts.join('  ·  ');
      $('#qNext').onclick = e => { e.preventDefault(); location.hash = `#/brief?s=${s.id}`; };
    }
    sel.onchange = fillTier; tier.onchange = calc; $('#qRev').oninput = calc; $('#qRushChk').onchange = calc;
    $('#qRush').onclick = e => { if (e.target.tagName !== 'INPUT') { $('#qRushChk').checked = !$('#qRushChk').checked; calc(); } };
    fillTier();
  }

  const briefQs = {
    dashboard: [['¿Qué querés ver en el dashboard?', 'Ej: ventas, gastos, stock, clientes...'], ['¿De dónde salen los datos hoy?', 'Excel, sistema contable, ERP, manual...'], ['¿Cada cuánto lo actualizarías?', 'Diario, semanal, mensual']],
    cleaning: [['¿Qué tan grande es el archivo?', 'Cantidad aproximada de filas'], ['¿Cuál es el problema principal?', 'Duplicados, formato, columnas mezcladas...'], ['¿En qué formato lo tenés?', 'Excel, CSV, export de ERP...']],
    automation: [['¿Qué tarea repetís hoy a mano?', 'Describila'], ['¿Cada cuánto la hacés?', 'Diario, semanal, mensual'], ['¿Qué resultado final necesitás?', 'Reporte, planilla, archivo...']],
    invoice: [['¿Qué necesitás generar?', 'Facturas, recibos, reportes...'], ['¿Volumen mensual aproximado?', 'Cantidad'], ['¿Necesitás numeración o cálculo de impuestos?', 'Sí / No, detalles']],
  };

  function wireBrief() {
    const sel = $('#bSvc');
    function fillDyn() { const qs = briefQs[sel.value] || []; $('#bDyn').innerHTML = qs.map((q, i) => `<div class="field"><label>${esc(q[0])}</label><input class="bq" data-q="${esc(q[0])}" placeholder="${esc(q[1])}"></div>`).join(''); }
    sel.onchange = fillDyn; fillDyn();
    $('#bGen').onclick = () => {
      const s = svc(sel.value);
      const lines = [`=== BRIEF DE PROYECTO ===`, ``, `Servicio: ${s.name}`, `Cliente: ${$('#bName').value || '(sin nombre)'}`, `Email: ${$('#bEmail').value || '(sin email)'}`, ``];
      window.U.$$('.bq').forEach(i => lines.push(`• ${i.dataset.q}`, `  → ${i.value || '(sin responder)'}`, ``));
      lines.push(`Plazo deseado: ${$('#bDeadline').value || '(a definir)'}`, ``, `Notas: ${$('#bExtra').value || '—'}`, ``, `--- Generado en ${C.brand} ---`);
      const txt = lines.join('\n');
      $('#bText').value = txt; $('#bOut').style.display = 'block'; $('#bOut').scrollIntoView({ behavior: 'smooth' });
      $('#bMail').href = `mailto:${C.email}?subject=${encodeURIComponent('Brief: ' + s.name)}&body=${encodeURIComponent(txt)}`;
    };
    $('#bOut').addEventListener('click', async e => {
      if (e.target.id === 'bCopy') { navigator.clipboard?.writeText($('#bText').value); toast('Brief copiado'); }
      if (e.target.id === 'bDl') window.U.download('brief.txt', $('#bText').value);
      if (e.target.id === 'bSend') {
        const btn = e.target; btn.disabled = true; btn.textContent = 'Enviando...';
        try {
          const res = await fetch(C.integrations.formEndpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ nombre: $('#bName').value, email: $('#bEmail').value, servicio: svc($('#bSvc').value).name, brief: $('#bText').value })
          });
          if (res.ok) { btn.textContent = '✓ Enviado'; toast('¡Brief enviado! Te respondo a la brevedad.'); }
          else throw new Error('fail');
        } catch { btn.disabled = false; btn.textContent = '📨 Enviarme el brief'; toast('No se pudo enviar. Probá "Enviar por email".'); }
      }
    });
  }

  // =================== ROUTER ===================
  function parse() {
    const raw = (location.hash || '#/').slice(1);
    const [path, qs] = raw.split('?');
    const params = {}; (qs || '').split('&').forEach(kv => { const [k, v] = kv.split('='); if (k) params[k] = decodeURIComponent(v || ''); });
    return { parts: path.split('/').filter(Boolean), params };
  }

  function route() {
    const { parts, params } = parse();
    window.scrollTo(0, 0);
    document.getElementById('navLinks').classList.remove('open');
    document.querySelectorAll('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + (parts[0] || '')));

    if (parts[0] === 'herramienta' && parts[1]) return renderTool(parts[1]);
    const name = parts[0] || 'home';
    const view = Views[name];
    if (!view) { app.innerHTML = Views.home(); return; }
    app.innerHTML = view(params);
    if (name === 'presupuesto') wireQuote(params);
    if (name === 'brief') wireBrief();
  }

  // =================== FOOTER ===================
  function footer() {
    const L = C.links;
    const link = (h, t) => h ? `<a href="${h}" target="_blank">${t}</a>` : '';
    const sep = [link(L.fiverr, 'Fiverr'), link(L.gumroad, 'Plantillas'), link(L.linkedin, 'LinkedIn'), link(L.github, 'GitHub')].filter(Boolean).join(' · ');
    document.getElementById('footer').innerHTML = `<b>${esc(C.brand)}</b> · ${esc(C.owner)} · <a href="mailto:${C.email}">${esc(C.email)}</a>${sep ? '<br>' + sep : ''}<br><span class="faint" style="font-size:11px">Hecho con tecnología propia · sin dependencias</span>`;
  }

  window.addEventListener('hashchange', route);
  footer(); route();
})();
