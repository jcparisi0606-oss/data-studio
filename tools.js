/* =====================================================================
   TOOLS — herramientas reales y funcionales (sin dependencias).
   Cada una expone { name, icon, blurb, render(root) }.
   ===================================================================== */

/* ---------- utilidades compartidas ---------- */
const U = window.U = {
  $: (s, r = document) => r.querySelector(s),
  $$: (s, r = document) => [...r.querySelectorAll(s)],
  money(n, cur = (window.STUDIO_CONFIG?.currency || 'USD')) {
    const v = Math.round((+n || 0) * 100) / 100;
    return (cur === 'USD' ? '$' : '') + v.toLocaleString('es-AR') + (cur !== 'USD' ? ' ' + cur : '');
  },
  parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else {
        if (c === '"') q = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\t') { row.push(cell); cell = ''; }
        else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
        else if (c === '\r') { /* skip */ }
        else cell += c;
      }
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.length);
  },
  toCSV(rows) {
    return rows.map(r => r.map(c => {
      c = c == null ? '' : String(c);
      return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
    }).join(',')).join('\n');
  },
  download(name, content, type = 'text/plain') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: type + ';charset=utf-8' }));
    a.download = name; a.click();
  },
  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  },
  store(key, val) {
    if (val === undefined) { try { return JSON.parse(localStorage.getItem('studio-' + key)); } catch { return null; } }
    localStorage.setItem('studio-' + key, JSON.stringify(val));
  },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
};

window.TOOLS = {};

/* =====================================================================
   1) DASHBOARD FINANCIERO
   ===================================================================== */
TOOLS.dashboard = {
  name: 'Dashboard financiero', icon: '📊',
  blurb: 'Cargá ingresos y gastos y mirá KPIs, evolución y categorías al instante.',
  render(root) {
    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    let data = U.store('dash') || [];
    const save = () => U.store('dash', data);

    root.innerHTML = `
      <h2>📊 Dashboard financiero</h2>
      <p class="sub">Cargá tus movimientos y obtené el panorama del negocio. Todo se guarda en tu navegador.</p>
      <div class="toolbar">
        <select id="yr" style="width:auto"></select>
        <button class="btn ghost sm" id="demo">Cargar ejemplo</button>
        <button class="btn ghost sm" id="csv">Exportar CSV</button>
        <button class="btn ghost sm" id="clr">Borrar todo</button>
      </div>
      <div class="kpis" style="margin-bottom:18px">
        <div class="kpi"><div class="t">Ingresos</div><div class="v green" id="kI">$0</div></div>
        <div class="kpi"><div class="t">Egresos</div><div class="v red" id="kE">$0</div></div>
        <div class="kpi"><div class="t">Resultado neto</div><div class="v" id="kN">$0</div></div>
        <div class="kpi"><div class="t">Margen</div><div class="v" id="kM">—</div></div>
      </div>
      <div class="grid c2">
        <div class="panel"><h3>Resultado neto por mes</h3><div class="bars" id="chart"></div></div>
        <div class="panel"><h3>Gastos por categoría</h3><div id="cats"><div class="empty">Sin gastos aún</div></div></div>
      </div>
      <div class="panel">
        <h3>Nuevo movimiento</h3>
        <div class="row">
          <div class="field"><label>Fecha</label><input type="date" id="d"></div>
          <div class="field"><label>Tipo</label><select id="t"><option>Ingreso</option><option>Egreso</option></select></div>
          <div class="field"><label>Categoría</label><input id="c" placeholder="Ventas, Alquiler..."></div>
          <div class="field" style="flex:2"><label>Descripción</label><input id="ds" placeholder="Detalle"></div>
          <div class="field"><label>Monto</label><input type="number" id="a" placeholder="0"></div>
          <div class="field" style="display:flex;align-items:flex-end"><button class="btn primary" id="add" style="width:100%">Agregar</button></div>
        </div>
      </div>
      <div class="panel">
        <h3>Movimientos <span class="faint" id="cnt"></span></h3>
        <div class="scroll"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th class="r">Monto</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
        <div class="empty" id="emp">Agregá un movimiento o cargá el ejemplo.</div>
      </div>`;

    const $ = s => U.$(s, root);
    $('#d').valueAsDate = new Date();

    const years = () => { const s = new Set(data.map(m => m.date.slice(0, 4))); s.add(String(new Date().getFullYear())); return [...s].sort(); };
    const renderYears = keep => { const cur = keep || $('#yr').value || String(new Date().getFullYear()); $('#yr').innerHTML = years().map(y => `<option ${y === cur ? 'selected' : ''}>${y}</option>`).join(''); };

    function render() {
      const y = $('#yr').value;
      const rows = data.filter(m => m.date.slice(0, 4) === y).sort((a, b) => b.date.localeCompare(a.date));
      const ing = rows.filter(m => m.type === 'Ingreso').reduce((s, m) => s + m.amt, 0);
      const egr = rows.filter(m => m.type === 'Egreso').reduce((s, m) => s + m.amt, 0);
      const net = ing - egr;
      $('#kI').textContent = U.money(ing); $('#kE').textContent = U.money(egr);
      $('#kN').textContent = U.money(net); $('#kN').className = 'v ' + (net >= 0 ? 'green' : 'red');
      $('#kM').textContent = ing > 0 ? (net / ing * 100).toFixed(1) + '%' : '—';
      const bm = Array(12).fill(0);
      rows.forEach(m => bm[+m.date.slice(5, 7) - 1] += m.type === 'Ingreso' ? m.amt : -m.amt);
      const max = Math.max(...bm.map(Math.abs), 1);
      $('#chart').innerHTML = bm.map((v, i) => `<div class="col"><div class="bar" style="height:${Math.abs(v) / max * 100}%;background:${v >= 0 ? 'var(--green)' : 'var(--red)'}" title="${MESES[i]}: ${U.money(v)}"></div><div class="lbl">${MESES[i]}</div></div>`).join('');
      const ct = {}; rows.filter(m => m.type === 'Egreso').forEach(m => ct[m.cat] = (ct[m.cat] || 0) + m.amt);
      const ents = Object.entries(ct).sort((a, b) => b[1] - a[1]); const cmax = ents[0]?.[1] || 1;
      $('#cats').innerHTML = ents.length ? ents.map(([c, v]) => `<div class="catrow"><div class="name">${U.esc(c)}</div><div class="track"><div class="fill" style="width:${v / cmax * 100}%"></div></div><div class="amt">${U.money(v)}</div></div>`).join('') : '<div class="empty">Sin gastos aún</div>';
      $('#rows').innerHTML = rows.map(m => `<tr><td>${m.date.split('-').reverse().join('/')}</td><td class="${m.type === 'Ingreso' ? 'green' : 'red'}">${m.type}</td><td>${U.esc(m.cat)}</td><td>${U.esc(m.desc)}</td><td class="r ${m.type === 'Ingreso' ? 'green' : 'red'}">${U.money(m.amt)}</td><td><button class="del" data-id="${m.id}">✕</button></td></tr>`).join('');
      $('#emp').style.display = rows.length ? 'none' : 'block';
      $('#cnt').textContent = rows.length ? `(${rows.length})` : '';
    }

    $('#add').onclick = () => {
      const amt = parseFloat($('#a').value);
      if (!$('#d').value || !amt) return U.toast('Completá fecha y monto');
      data.push({ id: Date.now() + Math.random(), date: $('#d').value, type: $('#t').value, cat: $('#c').value || 'Sin categoría', desc: $('#ds').value, amt });
      save(); $('#c').value = $('#ds').value = $('#a').value = ''; renderYears($('#d').value.slice(0, 4)); render();
    };
    $('#demo').onclick = () => {
      const y = new Date().getFullYear();
      [['01-05', 'Ingreso', 'Ventas', 'Venta producto A', 150000], ['01-20', 'Egreso', 'Alquiler', 'Alquiler', 90000], ['02-03', 'Ingreso', 'Servicios', 'Consultoría', 220000], ['02-15', 'Egreso', 'Marketing', 'Campaña', 30000], ['03-02', 'Ingreso', 'Ventas', 'Venta B', 185000], ['03-10', 'Egreso', 'Impuestos', 'Monotributo', 45000], ['04-08', 'Ingreso', 'Ventas', 'Mayorista', 310000], ['04-22', 'Egreso', 'Sueldos', 'Ayudante', 120000]]
        .forEach(([d, t, c, ds, a]) => data.push({ id: Date.now() + Math.random(), date: y + '-' + d, type: t, cat: c, desc: ds, amt: a }));
      save(); renderYears(String(y)); render(); U.toast('Datos de ejemplo cargados');
    };
    $('#csv').onclick = () => { U.download('movimientos.csv', U.toCSV([['Fecha', 'Tipo', 'Categoria', 'Descripcion', 'Monto'], ...data.map(m => [m.date, m.type, m.cat, m.desc, m.amt])])); };
    $('#clr').onclick = () => { if (confirm('¿Borrar todos los movimientos?')) { data = []; save(); renderYears(); render(); } };
    $('#yr').onchange = render;
    $('#rows').onclick = e => { const b = e.target.closest('.del'); if (b) { data = data.filter(m => m.id != b.dataset.id); save(); renderYears(); render(); } };

    renderYears(); render();
  }
};

/* =====================================================================
   2) LIMPIADOR DE DATOS  (la herramienta de producción)
   ===================================================================== */
TOOLS.cleaner = {
  name: 'Limpiador de datos', icon: '🧹',
  blurb: 'Pegá o subí un CSV y limpialo: duplicados, espacios, filas/columnas vacías, formato.',
  render(root) {
    let raw = null;   // [[...]]
    root.innerHTML = `
      <h2>🧹 Limpiador de datos</h2>
      <p class="sub">Pegá un CSV (o subí un archivo), elegí las operaciones y descargá el resultado limpio. Ideal para exports de ERP/contables.</p>
      <div class="panel">
        <h3>1 · Entrada</h3>
        <div class="field"><textarea id="in" rows="6" placeholder="Pegá tu CSV acá (con encabezados en la primera fila)..."></textarea></div>
        <div class="toolbar">
          <label class="btn ghost sm" style="position:relative;overflow:hidden">Subir archivo .csv<input type="file" id="file" accept=".csv,.txt,.tsv" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
          <button class="btn ghost sm" id="load">Cargar ejemplo desprolijo</button>
          <button class="btn primary sm" id="parse">Analizar →</button>
        </div>
      </div>
      <div id="work" style="display:none">
        <div class="panel">
          <h3>2 · Operaciones</h3>
          <div class="pills" id="ops">
            <span class="pill on" data-op="trim">Recortar espacios</span>
            <span class="pill on" data-op="collapse">Espacios dobles</span>
            <span class="pill on" data-op="emptyRows">Quitar filas vacías</span>
            <span class="pill on" data-op="dupes">Quitar duplicados</span>
            <span class="pill" data-op="emptyCols">Quitar columnas vacías</span>
            <span class="pill" data-op="title">Capitalizar texto</span>
            <span class="pill" data-op="header">Tratar 1ª fila como encabezado</span>
          </div>
          <div class="toolbar" style="margin-top:14px">
            <button class="btn primary sm" id="run">Limpiar</button>
            <button class="btn ghost sm" id="dl" disabled>Descargar CSV limpio</button>
          </div>
        </div>
        <div class="kpis" id="stats" style="margin-bottom:18px"></div>
        <div class="panel"><h3>Vista previa (primeras 20 filas)</h3><div class="scroll" id="prev"></div></div>
      </div>`;

    const $ = s => U.$(s, root);
    const dirty = `Nombre , Email,Ciudad ,Monto
 Juan  Perez , JUAN@MAIL.COM ,  buenos  aires ,1000
maria gomez,maria@mail.com,Cordoba,2000
maria gomez,maria@mail.com,Cordoba,2000
 , , ,
Juan  Perez ,juan@mail.com, buenos aires ,1000
PEDRO LOPEZ ,pedro@mail.com ,Rosario ,1500`;

    $('#load').onclick = () => { $('#in').value = dirty; U.toast('Ejemplo cargado'); };
    $('#file').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { $('#in').value = r.result; U.toast('Archivo cargado'); }; r.readAsText(f); };

    $('#ops').onclick = e => { const p = e.target.closest('.pill'); if (p) p.classList.toggle('on'); };

    $('#parse').onclick = () => {
      const txt = $('#in').value.trim();
      if (!txt) return U.toast('Pegá o subí datos primero');
      raw = U.parseCSV(txt);
      if (!raw.length) return U.toast('No se detectaron filas');
      $('#work').style.display = 'block';
      U.toast(`${raw.length} filas detectadas`);
      $('#run').onclick();
    };

    $('#run').onclick = () => {
      if (!raw) return;
      const ops = {}; U.$$('.pill', $('#ops')).forEach(p => ops[p.dataset.op] = p.classList.contains('on'));
      let rows = raw.map(r => r.slice());
      const orig = rows.length;
      let trimmed = 0;
      const header = ops.header ? rows.shift() : null;

      const clean = c => {
        let v = c == null ? '' : String(c), b = v;
        if (ops.trim) v = v.trim();
        if (ops.collapse) v = v.replace(/\s+/g, ' ').trim();
        if (ops.title) v = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(v) && !/@/.test(v) ? v.toLowerCase().replace(/\b\w/g, m => m.toUpperCase()) : v;
        if (v !== b) trimmed++;
        return v;
      };
      rows = rows.map(r => r.map(clean));

      if (ops.emptyRows) rows = rows.filter(r => r.some(c => c !== ''));
      let dupes = 0;
      if (ops.dupes) { const seen = new Set(); rows = rows.filter(r => { const k = r.join(''); if (seen.has(k)) { dupes++; return false; } seen.add(k); return true; }); }
      let dropped = 0;
      if (ops.emptyCols && rows.length) {
        const ncol = Math.max(...rows.map(r => r.length));
        const keep = [];
        for (let c = 0; c < ncol; c++) { const has = rows.some(r => (r[c] || '') !== '') || (header && (header[c] || '') !== ''); if (has) keep.push(c); else dropped++; }
        rows = rows.map(r => keep.map(c => r[c] || ''));
        if (header) this._hdr = keep.map(c => header[c] || '');
      } else if (header) this._hdr = header;
      else this._hdr = null;

      const out = header ? [this._hdr, ...rows] : rows;
      this._clean = out;

      $('#stats').innerHTML = [
        ['Filas originales', orig], ['Filas finales', rows.length + (header ? 1 : 0)],
        ['Duplicados quitados', dupes], ['Celdas corregidas', trimmed], ['Columnas quitadas', dropped]
      ].map(([t, v]) => `<div class="kpi"><div class="t">${t}</div><div class="v">${v}</div></div>`).join('');

      const prev = out.slice(0, 21);
      $('#prev').innerHTML = '<table>' + prev.map((r, i) =>
        '<tr>' + r.map(c => i === 0 ? `<th>${U.esc(c)}</th>` : `<td>${U.esc(c)}</td>`).join('') + '</tr>'
      ).join('') + '</table>';
      $('#dl').disabled = false;
    };

    $('#dl').onclick = () => { if (this._clean) U.download('datos-limpios.csv', U.toCSV(this._clean), 'text/csv'); };
  }
};

/* =====================================================================
   3) GENERADOR DE FACTURAS
   ===================================================================== */
TOOLS.invoice = {
  name: 'Generador de facturas', icon: '🧾',
  blurb: 'Completá los datos y obtené una factura profesional lista para imprimir o PDF.',
  render(root) {
    const cfg = window.STUDIO_CONFIG;
    let inv = U.store('inv') || {
      from: cfg.brand + '\n' + cfg.owner, to: '', num: '0001',
      date: new Date().toISOString().slice(0, 10), tax: 21, cur: cfg.currency,
      notes: 'Gracias por tu confianza.', items: [{ d: 'Servicio profesional', q: 1, p: 100 }]
    };
    const save = () => U.store('inv', inv);

    root.innerHTML = `
      <h2>🧾 Generador de facturas</h2>
      <p class="sub">Editá a la izquierda, mirá la factura a la derecha. Imprimí o guardá como PDF.</p>
      <div class="grid c2">
        <div class="panel">
          <h3>Datos</h3>
          <div class="row"><div class="field"><label>De</label><textarea id="from" rows="2"></textarea></div>
          <div class="field"><label>Para</label><textarea id="to" rows="2" placeholder="Cliente"></textarea></div></div>
          <div class="row"><div class="field"><label>N°</label><input id="num"></div>
          <div class="field"><label>Fecha</label><input type="date" id="date"></div>
          <div class="field"><label>Impuesto %</label><input type="number" id="tax"></div>
          <div class="field"><label>Moneda</label><input id="cur"></div></div>
          <h3 style="margin-top:16px">Items</h3>
          <div id="items"></div>
          <button class="btn ghost sm" id="addItem" style="margin-top:8px">+ Agregar item</button>
          <div class="field" style="margin-top:14px"><label>Notas</label><textarea id="notes" rows="2"></textarea></div>
          <button class="btn primary" id="print" style="margin-top:8px">🖨️ Imprimir / PDF</button>
        </div>
        <div>
          <div id="printArea"><div class="invoice" id="inv"></div></div>
        </div>
      </div>`;

    const $ = s => U.$(s, root);
    const bind = (id, key) => { $(id).value = inv[key]; $(id).oninput = () => { inv[key] = $(id).value; save(); paint(); }; };
    bind('#from', 'from'); bind('#to', 'to'); bind('#num', 'num'); bind('#date', 'date'); bind('#tax', 'tax'); bind('#cur', 'cur'); bind('#notes', 'notes');

    function renderItems() {
      $('#items').innerHTML = inv.items.map((it, i) => `
        <div class="row" style="margin-bottom:6px">
          <div class="field" style="flex:3;margin:0"><input data-i="${i}" data-k="d" value="${U.esc(it.d)}" placeholder="Descripción"></div>
          <div class="field" style="margin:0"><input data-i="${i}" data-k="q" type="number" value="${it.q}" placeholder="Cant"></div>
          <div class="field" style="margin:0"><input data-i="${i}" data-k="p" type="number" value="${it.p}" placeholder="Precio"></div>
          <button class="del" data-del="${i}" style="flex:none">✕</button>
        </div>`).join('');
      U.$$('#items input').forEach(inp => inp.oninput = () => { const it = inv.items[inp.dataset.i]; it[inp.dataset.k] = inp.dataset.k === 'd' ? inp.value : parseFloat(inp.value) || 0; save(); paint(); });
      U.$$('#items [data-del]').forEach(b => b.onclick = () => { inv.items.splice(b.dataset.del, 1); save(); renderItems(); paint(); });
    }
    $('#addItem').onclick = () => { inv.items.push({ d: '', q: 1, p: 0 }); save(); renderItems(); paint(); };

    function paint() {
      const sub = inv.items.reduce((s, it) => s + it.q * it.p, 0);
      const tax = sub * (parseFloat(inv.tax) || 0) / 100;
      const cur = inv.cur || 'USD';
      $('#inv').innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
          <div><h2 style="margin:0">Factura</h2><div class="muted">N° ${U.esc(inv.num)} · ${inv.date.split('-').reverse().join('/')}</div></div>
          <div style="text-align:right;white-space:pre-line;font-weight:600">${U.esc(inv.from)}</div>
        </div>
        <div class="muted" style="margin-bottom:6px">Facturar a:</div>
        <div style="white-space:pre-line;font-weight:600;margin-bottom:20px">${U.esc(inv.to) || '—'}</div>
        <table><thead><tr><th>Descripción</th><th class="r">Cant</th><th class="r">Precio</th><th class="r">Total</th></tr></thead>
        <tbody>${inv.items.map(it => `<tr><td>${U.esc(it.d)}</td><td class="r">${it.q}</td><td class="r">${U.money(it.p, cur)}</td><td class="r">${U.money(it.q * it.p, cur)}</td></tr>`).join('')}</tbody></table>
        <div style="margin-top:18px;margin-left:auto;width:240px">
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Subtotal</span><span>${U.money(sub, cur)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span class="muted">Impuesto (${inv.tax || 0}%)</span><span>${U.money(tax, cur)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #16203a;margin-top:6px"><span class="tot">Total</span><span class="tot">${U.money(sub + tax, cur)}</span></div>
        </div>
        ${inv.notes ? `<div class="muted" style="margin-top:22px;border-top:1px solid #eef2f7;padding-top:12px">${U.esc(inv.notes)}</div>` : ''}`;
    }
    $('#print').onclick = () => window.print();
    renderItems(); paint();
  }
};

/* =====================================================================
   4) CONSTRUCTOR DE GRÁFICOS  (SVG, exportable)
   ===================================================================== */
TOOLS.chart = {
  name: 'Constructor de gráficos', icon: '📈',
  blurb: 'Pegá datos (etiqueta y valor) y generá un gráfico exportable como imagen.',
  render(root) {
    root.innerHTML = `
      <h2>📈 Constructor de gráficos</h2>
      <p class="sub">Pegá dos columnas (etiqueta y valor), elegí el tipo y exportá el gráfico.</p>
      <div class="panel">
        <div class="row">
          <div class="field" style="flex:2"><label>Datos (una fila por dato: etiqueta, valor)</label><textarea id="in" rows="6" placeholder="Enero, 1200\nFebrero, 1800\nMarzo, 1500"></textarea></div>
          <div style="flex:1">
            <div class="field"><label>Título</label><input id="title" placeholder="Mi gráfico"></div>
            <div class="field"><label>Tipo</label><select id="type"><option value="bar">Barras</option><option value="line">Línea</option></select></div>
            <button class="btn ghost sm" id="demo" style="margin-bottom:8px;width:100%">Cargar ejemplo</button>
            <button class="btn primary sm" id="go" style="width:100%">Generar</button>
          </div>
        </div>
      </div>
      <div class="panel"><div id="out"><div class="empty">Generá un gráfico para verlo acá.</div></div>
        <button class="btn ghost sm" id="dl" disabled style="margin-top:12px">Descargar imagen (SVG)</button>
      </div>`;
    const $ = s => U.$(s, root);
    $('#demo').onclick = () => { $('#in').value = 'Enero, 1200\nFebrero, 1800\nMarzo, 1500\nAbril, 2400\nMayo, 2100\nJunio, 2800'; $('#title').value = 'Ventas por mes'; };

    $('#go').onclick = () => {
      const pts = $('#in').value.trim().split('\n').map(l => { const i = l.lastIndexOf(','); const m = i < 0 ? l.split(/\t/) : [l.slice(0, i), l.slice(i + 1)]; return { l: (m[0] || '').trim(), v: parseFloat((m[1] || '').replace(/[^\d.-]/g, '')) || 0 }; }).filter(p => p.l);
      if (!pts.length) return U.toast('Pegá datos válidos');
      const W = 720, H = 380, pad = 50, max = Math.max(...pts.map(p => p.v), 1), min = Math.min(0, ...pts.map(p => p.v));
      const span = max - min || 1, iw = W - pad * 2, ih = H - pad * 2;
      const x = i => pad + (pts.length === 1 ? iw / 2 : i * iw / (pts.length - 1));
      const xb = i => pad + i * iw / pts.length;
      const y = v => pad + ih - (v - min) / span * ih;
      let body = '';
      const grid = [0, .25, .5, .75, 1].map(t => { const yy = pad + ih - t * ih; const val = (min + t * span); return `<line x1="${pad}" y1="${yy}" x2="${W - pad}" y2="${yy}" stroke="#243150"/><text x="${pad - 8}" y="${yy + 4}" fill="#8b9ab5" font-size="11" text-anchor="end">${Math.round(val).toLocaleString('es-AR')}</text>`; }).join('');
      if ($('#type').value === 'bar') {
        const bw = iw / pts.length * .6;
        body = pts.map((p, i) => { const bx = xb(i) + (iw / pts.length - bw) / 2; const by = y(Math.max(p.v, 0)); const h = Math.abs(y(p.v) - y(0)); return `<rect x="${bx}" y="${by}" width="${bw}" height="${h}" rx="4" fill="url(#g)"/><text x="${bx + bw / 2}" y="${H - pad + 18}" fill="#8b9ab5" font-size="11" text-anchor="middle">${U.esc(p.l)}</text>`; }).join('');
      } else {
        const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.v)}`).join(' ');
        body = `<path d="${path}" fill="none" stroke="url(#g)" stroke-width="3"/>` + pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="#7c5cff"/><text x="${x(i)}" y="${H - pad + 18}" fill="#8b9ab5" font-size="11" text-anchor="middle">${U.esc(p.l)}</text>`).join('');
      }
      const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI,Arial"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8cff"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs><rect width="${W}" height="${H}" fill="#0f1626" rx="12"/><text x="${W / 2}" y="28" fill="#e8edf6" font-size="16" font-weight="700" text-anchor="middle">${U.esc($('#title').value || 'Gráfico')}</text>${grid}${body}</svg>`;
      $('#out').innerHTML = svg;
      this._svg = svg; $('#dl').disabled = false;
    };
    $('#dl').onclick = () => { if (this._svg) U.download('grafico.svg', this._svg, 'image/svg+xml'); };
  }
};
