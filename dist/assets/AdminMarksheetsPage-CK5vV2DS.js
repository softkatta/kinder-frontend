import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{r as t,t as n}from"./react-N2z0p55G.js";import{l as r}from"./services-BWp-lKeW.js";import{r as i,t as a}from"./AdminDataTable-DEmmgmRT.js";import{t as o}from"./award-B2a1pg3Y.js";import{t as s}from"./file-text-BKXPN2HN.js";import{Jt as c}from"./index-CNoYPajB.js";import{i as l,l as u,n as d,t as f}from"./AdminUi-DzLVq0Q1.js";var p=e(t(),1);function m(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function h(){try{return new URL(`https://kinder-api.softkatta.in`).origin}catch{return window.location.origin}}function g(e){let t=h(),n=e?.logo_path?.trim()||``,r=e?.logo_url?.trim()||``,i=e=>e?/^https?:\/\//i.test(e)||e.startsWith(`data:`)?e:e.startsWith(`/storage/`)?`${t}${e}`:e.startsWith(`storage/`)?`${t}/${e}`:`${t}/storage/${e.replace(/^\/+/,``)}`:``,a=e=>e?/^https?:\/\//i.test(e)||e.startsWith(`data:`)?e:`${t}/${e.replace(/^\/+/,``)}`:``,o=i(n),s=a(r);return o&&s&&o!==s?{primary:o,fallback:s}:o?{primary:o,fallback:null}:s?{primary:s,fallback:null}:{primary:null,fallback:null}}function _(e){let t=m((e?.name?.trim()||`School`).slice(0,1).toUpperCase()),{primary:n,fallback:r}=g(e);return n?`<div class="logo-wrap"><img src="${m(n)}" data-fallback="${m(r??``)}" alt="School Logo" class="logo-img" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';return;}this.style.display='none';this.closest('.logo-wrap')?.classList.add('logo-missing');" /><div class="logo-fallback">${t}</div></div>`:`<div class="logo-wrap logo-missing"><div class="logo-fallback">${t}</div></div>`}function v(e){let t=e?.trim();if(!t)return null;if(/^https?:\/\//i.test(t)||t.startsWith(`data:`))return t;let n=h();return t.startsWith(`/storage/`)?`${n}${t}`:t.startsWith(`storage/`)?`${n}/${t}`:`${n}/storage/${t.replace(/^\/+/,``)}`}function y(e){let t=v(e.student_photo_url),n=m((e.student_name||`S`).trim().slice(0,1).toUpperCase());return t?`<div class="student-photo-wrap"><img src="${m(t)}" alt="Student Photo" class="student-photo-img" onerror="this.style.display='none';this.closest('.student-photo-wrap')?.classList.add('missing');" /><div class="student-photo-fallback">${n}</div></div>`:`<div class="student-photo-wrap missing"><div class="student-photo-fallback">${n}</div></div>`}function b(e){let t=typeof e.percentage==`number`?`${e.percentage.toFixed(1)}%`:`—`,n=typeof e.marks_obtained==`number`?e.marks_obtained.toFixed(1):`—`,r=typeof e.max_marks==`number`?e.max_marks:`—`,i=e.result_status===`pass`?`good`:e.result_status===`fail`?`bad`:`neutral`,a=m(e.school?.name||`School Name`),o=e.school?.address?.trim()||``,s=[e.school?.phone,e.school?.email].filter(Boolean).map(e=>m(String(e))).join(` • `),c=_(e.school),l=[[`Student Name`,e.student_name||`—`],[`Roll Number`,e.roll_number||`—`],[`Class`,e.class_name||`—`],[`Exam`,e.exam_name||`—`],[`Subject`,e.subject||`All Subjects`],[`Exam Date`,e.exam_date||`—`],[`Academic Year`,e.academic_year||`—`],[`Marks Obtained`,`${n} / ${r}`],[`Percentage`,t],[`Grade`,e.grade||`—`],[`Result`,(e.result_status||`—`).toUpperCase()]];return`
  <div class="doc marksheet">
    <div class="sheet-bg"></div>
    <div class="sheet-accent-strip"></div>
    <header class="sheet-header">
      <div class="sheet-brand">
        ${c}
        <div class="school-details">
          <p class="school">${a}</p>
          ${o?`<p class="school-meta">${m(o)}</p>`:``}
          ${s?`<p class="school-meta school-meta-sub">${s}</p>`:``}
        </div>
      </div>
      <div class="sheet-badges">
        <span class="pill">AY ${m(e.academic_year||`—`)}</span>
        <span class="pill tone-${i}">RESULT: ${m((e.result_status||`pending`).toUpperCase())}</span>
      </div>
    </header>

    <div class="title-wrap glass-card">
      <h1>Academic Marksheet</h1>
      <p>Official performance summary for ${m(e.exam_name||`examination`)}</p>
    </div>

    <table class="grid">
      ${l.map(([e,t])=>`<tr><th>${m(e)}</th><td>${m(String(t))}</td></tr>`).join(``)}
    </table>

    <section class="summary-cards">
      <article class="stat-card"><span>Total Marks</span><strong>${m(String(r))}</strong></article>
      <article class="stat-card"><span>Obtained</span><strong>${m(String(n))}</strong></article>
      <article class="stat-card"><span>Percentage</span><strong>${m(t)}</strong></article>
      <article class="stat-card"><span>Grade</span><strong>${m(e.grade||`—`)}</strong></article>
    </section>

    ${e.remarks?`<p class="remarks"><strong>Remarks:</strong> ${m(e.remarks)}</p>`:`<p class="remarks muted">Remarks: Not provided.</p>`}

    <footer class="footer">
      <div class="sign-block"><span>Class Teacher</span></div>
      <div class="sign-block"><span>Academic Coordinator</span></div>
      <div class="sign-block"><span>Principal</span></div>
    </footer>
    <p class="issued">Issued on ${m(e.issued_date||``)}</p>
  </div>`}function x(e){let t=m(e.school?.name||`School Name`),n=e.school?.address?.trim()||``,r=e.school?.phone?.trim()||``,i=_(e.school),a=m(e.certificate_title||`Certificate of Achievement`),o=m(e.student_name||`Student`),s=m(e.exam_name||`Annual Examination`),c=e.subject?` in ${m(e.subject)}`:``,l=m(e.grade||`—`),u=typeof e.percentage==`number`?`${e.percentage.toFixed(1)}%`:`—`,d=y(e);return`
  <div class="doc certificate">
    <div class="cert-frame">
      <div class="cert-layer">
        <div class="cert-ribbon">Academic Excellence Award</div>
        <header class="cert-header">
          ${i}
          <div class="school-details">
            <p class="school">${t}</p>
            ${n?`<p class="school-meta">${m(n)}</p>`:``}
            ${r?`<p class="school-meta school-meta-sub">${m(r)}</p>`:``}
          </div>
          <div class="medal">${m(e.result_status?.toUpperCase()||`PASS`)}</div>
        </header>

        <h1>${a}</h1>
        <p class="presented">This is proudly presented to</p>
        <div class="student-photo-slot">
          ${d}
        </div>
        <p class="name">${o}</p>

        <p class="body">
          for successfully completing <strong>${s}</strong>${c}
          during the academic year <strong>${m(e.academic_year||`—`)}</strong>,
          with grade <strong>${l}</strong> and score <strong>${m(u)}</strong>.
        </p>

        <div class="facts">
          <div><span>Roll Number</span><strong>${m(e.roll_number||`—`)}</strong></div>
          <div><span>Class</span><strong>${m(e.class_name||`—`)}</strong></div>
          <div><span>Issued Date</span><strong>${m(e.issued_date||`—`)}</strong></div>
        </div>

        <footer class="footer">
          <div class="sign-block"><span>Class Teacher</span></div>
          <div class="sign-block"><span>Principal</span></div>
        </footer>
      </div>
    </div>
  </div>`}var S=`
@page { size: A4 portrait; margin: 4mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --brand-navy: #103f91;
  --brand-royal: #1d4ed8;
  --brand-cyan: #0f9ca8;
  --brand-mint: #15b79e;
  --brand-gold: #c89b3c;
  --brand-gold-soft: #f7e7bf;
  --ink-strong: #0f172a;
  --ink-soft: #475569;
}
body {
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color: var(--ink-strong);
  background: #eff5ff;
  padding: 0;
}
.doc {
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.marksheet {
  width: calc(210mm - 8mm);
  min-height: calc(297mm - 8mm);
}
.sheet-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(16, 63, 145, 0.12), transparent 32%),
    radial-gradient(circle at 0% 100%, rgba(15, 156, 168, 0.1), transparent 34%),
    linear-gradient(160deg, rgba(16, 63, 145, 0.03), rgba(15, 156, 168, 0.04));
  pointer-events: none;
}
.sheet-accent-strip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 12px;
  background: linear-gradient(90deg, var(--brand-navy), var(--brand-royal) 35%, var(--brand-cyan) 70%, var(--brand-mint));
  box-shadow: 0 2px 10px rgba(16, 63, 145, 0.22);
}
.sheet-header, .cert-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 20px 0;
}
.sheet-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.logo-wrap {
  width: 82px;
  height: 82px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #fff;
  flex: 0 0 auto;
}
.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 0;
  background: #fff;
}
.marksheet .logo-wrap {
  width: 90px;
  height: 90px;
}
.marksheet .logo-img {
  padding: 1px;
}
.certificate .logo-wrap {
  width: 118px;
  height: 118px;
  border-width: 2px;
  border-color: rgba(200, 155, 60, 0.55);
  box-shadow: 0 6px 16px rgba(16, 63, 145, 0.14);
}
.logo-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--brand-cyan), var(--brand-royal));
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
  display: none;
}
.logo-wrap.logo-missing .logo-fallback {
  display: grid;
}
.school {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--brand-navy);
}
.school-meta {
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 3px;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.school-meta-sub {
  font-size: 11.5px;
  opacity: 0.92;
}
.school-details {
  min-width: 0;
}
.sheet-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.pill {
  border: 1px solid #cde0ff;
  border-radius: 999px;
  background: #f1f7ff;
  color: var(--brand-royal);
  font-weight: 600;
  font-size: 12px;
  padding: 7px 12px;
  white-space: nowrap;
}
.pill.tone-good { background: #e9fcf7; border-color: #b8f0e4; color: #0f766e; }
.pill.tone-bad { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.pill.tone-neutral { background: #f8fafc; border-color: #e2e8f0; color: #334155; }
.title-wrap {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 14px 20px 0;
}
.glass-card {
  margin: 8px 20px 0;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(191, 219, 254, 0.7);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(241, 247, 255, 0.82));
  box-shadow: 0 8px 24px rgba(16, 63, 145, 0.08);
}
.title-wrap h1 { font-size: 36px; letter-spacing: 0.4px; }
.title-wrap h1 { color: var(--brand-navy); }
.title-wrap p { margin-top: 6px; color: var(--ink-soft); font-size: 14px; }
.grid {
  position: relative;
  z-index: 1;
  margin: 14px 20px 0;
  width: calc(100% - 40px);
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #cfdff6;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(16, 63, 145, 0.06);
}
.grid th,
.grid td {
  border: 1px solid #d9e4f7;
  padding: 10px 12px;
  text-align: left;
}
.grid th {
  width: 36%;
  background: linear-gradient(90deg, #f2f7ff, #f8fbff);
  color: #1b345d;
  font-weight: 600;
}
.grid tr:nth-child(even) td {
  background: #fcfdff;
}
.summary-cards {
  position: relative;
  z-index: 1;
  margin: 14px 20px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.summary-cards article {
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  padding: 12px;
  background: linear-gradient(180deg, #ffffff, #eff6ff);
  box-shadow: 0 6px 14px rgba(16, 63, 145, 0.08);
}
.stat-card:nth-child(1) { border-color: rgba(29, 78, 216, 0.25); }
.stat-card:nth-child(2) { border-color: rgba(15, 156, 168, 0.25); }
.stat-card:nth-child(3) { border-color: rgba(20, 184, 166, 0.25); }
.stat-card:nth-child(4) { border-color: rgba(200, 155, 60, 0.35); }
.summary-cards span { display: block; color: #64748b; font-size: 11px; margin-bottom: 4px; }
.summary-cards strong { font-size: 19px; color: var(--brand-navy); }
.remarks {
  position: relative;
  z-index: 1;
  margin: 14px 20px 0;
  font-size: 13px;
  line-height: 1.6;
  padding: 11px 12px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f8fbff, #f8fafc);
  border: 1px solid #d8e4f8;
}
.remarks.muted { color: #64748b; }
.footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin: 42px 20px 0;
}
.sign-block {
  flex: 1;
  border-top: 2px solid #94a3b8;
  padding-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #1e3a63;
}
.issued {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 14px;
  font-size: 12px;
  color: #64748b;
}

.certificate {
  width: calc(297mm - 8mm);
  height: calc(210mm - 8mm);
  background: linear-gradient(155deg, #fffdf4 0%, #ffffff 45%, #edf5ff 100%);
  overflow: hidden;
}
.cert-frame {
  margin: 4px;
  height: calc(100% - 8px);
  border: 2px solid var(--brand-gold);
  border-radius: 16px;
  padding: 6px;
  background:
    radial-gradient(circle at 8% 10%, rgba(16, 63, 145, 0.06), transparent 28%),
    radial-gradient(circle at 92% 88%, rgba(15, 156, 168, 0.08), transparent 35%),
    repeating-linear-gradient(45deg, rgba(200, 155, 60, 0.05), rgba(200, 155, 60, 0.05) 8px, transparent 8px, transparent 16px);
}
.cert-layer {
  height: 100%;
  border: 1px solid rgba(200, 155, 60, 0.7);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cert-layer::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed rgba(29, 78, 216, 0.22);
  border-radius: 8px;
  pointer-events: none;
}
.cert-layer::after {
  content: '';
  position: absolute;
  inset: 16px;
  border-radius: 10px;
  pointer-events: none;
  background:
    radial-gradient(circle at 0 0, rgba(200, 155, 60, 0.2) 0, rgba(200, 155, 60, 0.2) 10px, transparent 11px),
    radial-gradient(circle at 100% 0, rgba(200, 155, 60, 0.2) 0, rgba(200, 155, 60, 0.2) 10px, transparent 11px),
    radial-gradient(circle at 0 100%, rgba(200, 155, 60, 0.2) 0, rgba(200, 155, 60, 0.2) 10px, transparent 11px),
    radial-gradient(circle at 100% 100%, rgba(200, 155, 60, 0.2) 0, rgba(200, 155, 60, 0.2) 10px, transparent 11px);
}
.cert-ribbon {
  align-self: center;
  background: linear-gradient(90deg, var(--brand-navy), var(--brand-cyan));
  color: #fff;
  border-radius: 999px;
  padding: 6px 18px;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
  box-shadow: 0 4px 10px rgba(16, 63, 145, 0.2);
}
.kicker {
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 12px;
  color: var(--ink-soft);
}
.certificate h1 {
  margin-top: 10px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 50px;
  color: #9a6f17;
}
.presented { margin-top: 10px; font-size: 16px; color: var(--ink-soft); }
.student-photo-slot {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
.student-photo-wrap {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 3px solid rgba(200, 155, 60, 0.75);
  padding: 4px;
  background: linear-gradient(180deg, #fff, #f8fbff);
  display: grid;
  place-items: center;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(16, 63, 145, 0.16);
}
.student-photo-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.student-photo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: none;
  place-items: center;
  font-size: 38px;
  font-weight: 700;
  color: #0b2f66;
  background: linear-gradient(135deg, #e5efff, #f4f9ff);
}
.student-photo-wrap.missing .student-photo-fallback {
  display: grid;
}
.name {
  margin-top: 10px;
  font-size: 56px;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #0b2f66;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}
.body {
  margin: 12px auto 0;
  max-width: 250mm;
  line-height: 1.6;
  font-size: 18px;
  color: #1e2f4c;
}
.facts {
  margin: 14px auto 0;
  width: 100%;
  max-width: 250mm;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.facts > div {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 249, 255, 0.85));
  padding: 9px;
}
.facts span {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 3px;
}
.facts strong { font-size: 16px; }
.certificate .footer {
  margin: 18px 24px 0;
}
.medal {
  min-width: 84px;
  border-radius: 999px;
  border: 1px solid var(--brand-gold);
  background: var(--brand-gold-soft);
  color: #7a5a0d;
  font-size: 12px;
  font-weight: 700;
  padding: 9px 12px;
}

@media print {
  .certificate { break-before: avoid; }
}
`;function C(e){return e===`certificate`?S.replace(`@page { size: A4 portrait; margin: 4mm; }`,`@page { size: A4 landscape; margin: 4mm; }`):S}function w(e){let t=document.createElement(`iframe`);t.style.cssText=`position:fixed;right:0;bottom:0;width:0;height:0;border:0`,document.body.appendChild(t);let n=t.contentWindow,r=t.contentDocument||n?.document;if(!r||!n)return;r.open(),r.write(e),r.close();let i=()=>{setTimeout(()=>t.remove(),500)},a=()=>{setTimeout(()=>{n.focus(),n.print(),setTimeout(i,6e4)},150)};n.onafterprint=i,t.onload=()=>{let e=Array.from(r.images);if(e.length===0){a();return}Promise.all(e.map(e=>e.complete?Promise.resolve():new Promise(t=>{e.onload=()=>t(),e.onerror=()=>t()}))).then(a)}}function T(e){let t=e.type===`certificate`?x(e):b(e),n=C(e.type);w(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${m(e.student_name)}</title><style>${n}</style></head><body>${t}</body></html>`)}var E=n();function D(){let[e,t]=(0,p.useState)([]),[n,m]=(0,p.useState)(!0),[h,g]=(0,p.useState)(null),_=(0,p.useCallback)(async()=>{m(!0);try{t((await r.allResults()).data.data??[])}catch{c.error(`Failed to load results`),t([])}finally{m(!1)}},[]);(0,p.useEffect)(()=>{_()},[_]);let v=async(t,n)=>{let i=e.find(e=>e.id===t);if(!i){c.error(`Result not found`);return}let a=window.prompt(`Print remark (optional):`,i.remarks??``);if(a===null)return;let o=a.trim();g(t);try{await r.updateResult(t,{student_name:i.student_name,roll_number:i.roll_number??null,class_name:i.class_name,marks_obtained:i.marks_obtained,grade:i.grade??null,result_status:i.result_status,remarks:o||null});let e=(n===`marksheet`?await r.marksheetView(t):await r.certificateView(t)).data.data;T({...e,type:n,remarks:o||null}),await r.markPrinted(t,n),c.success(n===`marksheet`?`Marksheet sent to printer`:`Certificate sent to printer`),_()}catch(e){let t=e?.response?.data?.message;c.error(t||`Print failed`)}finally{g(null)}};return(0,E.jsxs)(l,{children:[(0,E.jsx)(u,{title:`Marksheets & Certificates`,subtitle:`Print marksheets and certificates for exam results.`,breadcrumbs:[{label:`Admin`,to:`/admin`},{label:`Marksheets`}]}),n&&e.length===0&&(0,E.jsx)(`p`,{className:`text-sm text-slate-500 text-center py-8`,children:`Loading results...`}),(0,E.jsx)(a,{data:e,rowKey:e=>e.id,onRefresh:_,title:`Exam Results`,subtitle:`${e.length} student results`,searchPlaceholder:`Search student, roll, class...`,searchKeys:[`student_name`,`roll_number`,`class_name`],pageSize:10,filterSubtitle:`result status`,filters:[{key:`result`,label:`Result`,options:[{value:`all`,label:`All`},{value:`pass`,label:`Pass`},{value:`fail`,label:`Fail`},{value:`absent`,label:`Absent`}]}],filterConfigs:[{key:`result`,defaultValue:`all`,match:(e,t)=>t===`all`||e.result_status===t}],columns:[{key:`student_name`,header:`Student`,sortable:!0,cell:e=>(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`font-semibold text-ink`,children:e.student_name}),(0,E.jsxs)(`p`,{className:`text-xs text-slate-500`,children:[e.roll_number||`—`,` · `,e.class_name]})]})},{key:`exam`,header:`Exam`,cell:e=>(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`text-sm text-ink`,children:e.exam?.name??`—`}),(0,E.jsx)(`p`,{className:`text-xs text-slate-500`,children:e.exam?.academic_year?.name})]})},{key:`marks`,header:`Marks`,cell:e=>(0,E.jsxs)(`span`,{className:`font-mono text-sm`,children:[e.marks_obtained,`/`,e.exam?.max_marks??`—`,e.grade&&(0,E.jsx)(`span`,{className:`ml-2 text-violet-600 font-bold`,children:e.grade})]})},{key:`result_status`,header:`Result`,cell:e=>(0,E.jsx)(f,{tone:e.result_status===`pass`?`success`:e.result_status===`fail`?`danger`:`neutral`,children:e.result_status})},{key:`printed`,header:`Printed`,cell:e=>(0,E.jsxs)(`div`,{className:`text-xs text-slate-500 space-y-0.5`,children:[e.marksheet_printed_at&&(0,E.jsxs)(`p`,{children:[`MS: `,new Date(e.marksheet_printed_at).toLocaleDateString()]}),e.certificate_printed_at&&(0,E.jsxs)(`p`,{children:[`Cert: `,new Date(e.certificate_printed_at).toLocaleDateString()]}),!e.marksheet_printed_at&&!e.certificate_printed_at&&`—`]})},{key:`actions`,header:`Print`,className:`w-52`,cell:e=>(0,E.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,E.jsxs)(d,{variant:`secondary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`marksheet`),children:[(0,E.jsx)(s,{className:`h-3.5 w-3.5`}),` Marksheet`]}),(0,E.jsxs)(d,{variant:`primary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`certificate`),children:[(0,E.jsx)(o,{className:`h-3.5 w-3.5`}),` Certificate`]})]})}]}),(0,E.jsxs)(`div`,{className:`mt-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 flex items-start gap-3 text-sm text-slate-600`,children:[(0,E.jsx)(i,{className:`h-5 w-5 text-violet-500 shrink-0 mt-0.5`}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{children:`Print dialog उघडेल — PDF save नाही. Printer select करून direct print करा. Print झाल्यानंतर record automatically marked होते.`}),(0,E.jsxs)(`p`,{className:`mt-2 text-xs text-slate-500`,children:[`Certificate आणि Marksheet मध्ये system templates apply होतात (certificate: achivement-certificate, marksheet: default-marksheet). Verification: `,(0,E.jsx)(`code`,{className:`text-violet-600`,children:`/verify/CERT-YYYY-####`})]})]})]})]})}export{D as default};