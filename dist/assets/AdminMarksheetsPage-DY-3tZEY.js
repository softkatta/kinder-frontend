import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{n as t,r as n}from"./createLucideIcon-DHbN9kl6.js";import{r,t as i}from"./AdminDataTable-DRTtgD3A.js";import{t as a}from"./award-BnZ-4mEY.js";import{t as o}from"./file-text-JiSDCsBb.js";import{Xt as s,vn as c}from"./index-BTCmIMRi.js";import{i as l,l as u,n as d,t as f}from"./AdminUi-D4v5U4fj.js";var p=e(n(),1);function m(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function h(e){let t=typeof e.percentage==`number`?`${e.percentage.toFixed(1)}%`:`—`,n=typeof e.marks_obtained==`number`?e.marks_obtained.toFixed(1):`—`,r=typeof e.max_marks==`number`?e.max_marks:`—`,i=e.result_status===`pass`?`good`:e.result_status===`fail`?`bad`:`neutral`,a=m(e.school?.name||`School Name`),o=[e.school?.address,e.school?.phone,e.school?.email].filter(Boolean).map(e=>m(String(e))).join(` • `),s=e.school?.logo_url?`<img src="${m(e.school.logo_url)}" alt="School Logo" class="logo-img" />`:`<div class="logo-fallback">${a.slice(0,1)}</div>`,c=[[`Student Name`,e.student_name||`—`],[`Roll Number`,e.roll_number||`—`],[`Class`,e.class_name||`—`],[`Exam`,e.exam_name||`—`],[`Subject`,e.subject||`All Subjects`],[`Exam Date`,e.exam_date||`—`],[`Academic Year`,e.academic_year||`—`],[`Marks Obtained`,`${n} / ${r}`],[`Percentage`,t],[`Grade`,e.grade||`—`],[`Result`,(e.result_status||`—`).toUpperCase()]];return`
  <div class="doc marksheet">
    <div class="sheet-bg"></div>
    <header class="sheet-header">
      <div class="sheet-brand">
        ${s}
        <div>
          <p class="school">${a}</p>
          ${o?`<p class="school-meta">${o}</p>`:``}
        </div>
      </div>
      <div class="sheet-badges">
        <span class="pill">${m(e.academic_year||`Academic Year`)}</span>
        <span class="pill tone-${i}">${m((e.result_status||`pending`).toUpperCase())}</span>
      </div>
    </header>

    <div class="title-wrap">
      <h1>Academic Marksheet</h1>
      <p>Official performance summary for ${m(e.exam_name||`examination`)}</p>
    </div>

    <table class="grid">
      ${c.map(([e,t])=>`<tr><th>${m(e)}</th><td>${m(String(t))}</td></tr>`).join(``)}
    </table>

    <section class="summary-cards">
      <article><span>Total Marks</span><strong>${m(String(r))}</strong></article>
      <article><span>Obtained</span><strong>${m(String(n))}</strong></article>
      <article><span>Percentage</span><strong>${m(t)}</strong></article>
      <article><span>Grade</span><strong>${m(e.grade||`—`)}</strong></article>
    </section>

    ${e.remarks?`<p class="remarks"><strong>Remarks:</strong> ${m(e.remarks)}</p>`:`<p class="remarks muted">Remarks: Not provided.</p>`}

    <footer class="footer">
      <div class="sign-block"><span>Class Teacher</span></div>
      <div class="sign-block"><span>Academic Coordinator</span></div>
      <div class="sign-block"><span>Principal</span></div>
    </footer>
    <p class="issued">Issued on ${m(e.issued_date||``)}</p>
  </div>`}function g(e){let t=m(e.school?.name||`School Name`),n=[e.school?.address,e.school?.phone].filter(Boolean).map(e=>m(String(e))).join(` • `),r=e.school?.logo_url?`<img src="${m(e.school.logo_url)}" alt="School Logo" class="logo-img" />`:`<div class="logo-fallback">${t.slice(0,1)}</div>`,i=m(e.certificate_title||`Certificate of Achievement`),a=m(e.student_name||`Student`),o=m(e.exam_name||`Annual Examination`),s=e.subject?` in ${m(e.subject)}`:``,c=m(e.grade||`—`),l=typeof e.percentage==`number`?`${e.percentage.toFixed(1)}%`:`—`;return`
  <div class="doc certificate">
    <div class="cert-frame">
      <div class="cert-layer">
        <header class="cert-header">
          ${r}
          <div>
            <p class="school">${t}</p>
            ${n?`<p class="school-meta">${n}</p>`:``}
          </div>
          <div class="medal">${m(e.result_status?.toUpperCase()||`PASS`)}</div>
        </header>

        <p class="kicker">Certificate</p>
        <h1>${i}</h1>
        <p class="presented">This is proudly presented to</p>
        <p class="name">${a}</p>

        <p class="body">
          for successfully completing <strong>${o}</strong>${s}
          during the academic year <strong>${m(e.academic_year||`—`)}</strong>,
          with grade <strong>${c}</strong> and score <strong>${m(l)}</strong>.
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
  </div>`}var _=`
@page { size: A4 portrait; margin: 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color: #0f172a;
  background: #f8fafc;
}
.doc {
  width: 190mm;
  min-height: 270mm;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.sheet-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 100% 0%, rgba(30, 64, 175, 0.08), transparent 30%),
    radial-gradient(circle at 0% 100%, rgba(22, 163, 74, 0.07), transparent 32%);
  pointer-events: none;
}
.sheet-header, .cert-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 0;
}
.sheet-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}
.logo-fallback {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f766e, #1d4ed8);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
}
.school {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.school-meta {
  font-size: 11px;
  color: #475569;
  margin-top: 3px;
}
.sheet-badges {
  display: flex;
  gap: 8px;
}
.pill {
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  font-size: 11px;
  padding: 5px 10px;
}
.pill.tone-good { background: #ecfdf3; border-color: #bbf7d0; color: #166534; }
.pill.tone-bad { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.pill.tone-neutral { background: #f8fafc; border-color: #e2e8f0; color: #334155; }
.title-wrap {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 10px 18px 0;
}
.title-wrap h1 { font-size: 28px; letter-spacing: 0.4px; }
.title-wrap p { margin-top: 4px; color: #475569; font-size: 12px; }
.grid {
  position: relative;
  z-index: 1;
  margin: 14px 18px 0;
  width: calc(100% - 36px);
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #dbe3ef;
  background: #fff;
}
.grid th,
.grid td {
  border: 1px solid #dbe3ef;
  padding: 8px 10px;
  text-align: left;
}
.grid th {
  width: 36%;
  background: #f8fbff;
  color: #1e293b;
  font-weight: 600;
}
.summary-cards {
  position: relative;
  z-index: 1;
  margin: 12px 18px 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.summary-cards article {
  border: 1px solid #dbe7f3;
  border-radius: 10px;
  padding: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}
.summary-cards span { display: block; color: #64748b; font-size: 10px; margin-bottom: 4px; }
.summary-cards strong { font-size: 15px; }
.remarks {
  position: relative;
  z-index: 1;
  margin: 12px 18px 0;
  font-size: 11.5px;
  line-height: 1.6;
  padding: 9px 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.remarks.muted { color: #64748b; }
.footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 28px 18px 0;
}
.sign-block {
  flex: 1;
  border-top: 1px solid #94a3b8;
  padding-top: 6px;
  text-align: center;
  font-size: 11px;
  color: #334155;
}
.issued {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 12px;
  font-size: 10.5px;
  color: #64748b;
}

.certificate {
  background: linear-gradient(155deg, #fffef7 0%, #ffffff 50%, #f8fbff 100%);
}
.cert-frame {
  margin: 8px;
  min-height: calc(270mm - 16px);
  border: 2px solid #c8a54b;
  border-radius: 14px;
  padding: 5px;
  background:
    linear-gradient(135deg, rgba(239, 246, 255, 0.6), rgba(255, 255, 255, 0.8)),
    repeating-linear-gradient(45deg, rgba(200, 165, 75, 0.06), rgba(200, 165, 75, 0.06) 8px, transparent 8px, transparent 16px);
}
.cert-layer {
  min-height: calc(270mm - 30px);
  border: 1px solid rgba(200, 165, 75, 0.7);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  text-align: center;
}
.kicker {
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 11px;
  color: #475569;
}
.certificate h1 {
  margin-top: 6px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 34px;
  color: #9a6c07;
}
.presented { margin-top: 12px; font-size: 13px; color: #475569; }
.name {
  margin-top: 8px;
  font-size: 38px;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #0f172a;
}
.body {
  margin: 16px auto 0;
  max-width: 150mm;
  line-height: 1.75;
  font-size: 14px;
  color: #1e293b;
}
.facts {
  margin: 18px auto 0;
  width: 100%;
  max-width: 160mm;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.facts > div {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.85);
  padding: 9px;
}
.facts span {
  display: block;
  font-size: 10px;
  color: #64748b;
  margin-bottom: 3px;
}
.facts strong { font-size: 13px; }
.medal {
  min-width: 68px;
  border-radius: 999px;
  border: 1px solid #d9b55d;
  background: #fff8dd;
  color: #7a5a0d;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 10px;
}
`;function v(e){let t=document.createElement(`iframe`);t.style.cssText=`position:fixed;right:0;bottom:0;width:0;height:0;border:0`,document.body.appendChild(t);let n=t.contentWindow,r=t.contentDocument||n?.document;if(!r||!n)return;r.open(),r.write(e),r.close();let i=()=>{setTimeout(()=>t.remove(),500)},a=()=>{setTimeout(()=>{n.focus(),n.print(),setTimeout(i,6e4)},150)};n.onafterprint=i,t.onload=()=>{let e=Array.from(r.images);if(e.length===0){a();return}Promise.all(e.map(e=>e.complete?Promise.resolve():new Promise(t=>{e.onload=()=>t(),e.onerror=()=>t()}))).then(a)}}function y(e){let t=e.type===`certificate`?g(e):h(e),n=_;v(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${m(e.student_name)}</title><style>${n}</style></head><body>${t}</body></html>`)}var b=t();function x(){let[e,t]=(0,p.useState)([]),[n,m]=(0,p.useState)(!0),[h,g]=(0,p.useState)(null),_=(0,p.useCallback)(async()=>{m(!0);try{t((await s.allResults()).data.data??[])}catch{c.error(`Failed to load results`),t([])}finally{m(!1)}},[]);(0,p.useEffect)(()=>{_()},[_]);let v=async(e,t)=>{g(e);try{let n=(t===`marksheet`?await s.marksheetView(e):await s.certificateView(e)).data.data;y({...n,type:t}),await s.markPrinted(e,t),c.success(t===`marksheet`?`Marksheet sent to printer`:`Certificate sent to printer`),_()}catch(e){let t=e?.response?.data?.message;c.error(t||`Print failed`)}finally{g(null)}};return(0,b.jsxs)(l,{children:[(0,b.jsx)(u,{title:`Marksheets & Certificates`,subtitle:`Print marksheets and certificates for exam results.`,breadcrumbs:[{label:`Admin`,to:`/admin`},{label:`Marksheets`}]}),n&&e.length===0&&(0,b.jsx)(`p`,{className:`text-sm text-slate-500 text-center py-8`,children:`Loading results...`}),(0,b.jsx)(i,{data:e,rowKey:e=>e.id,onRefresh:_,title:`Exam Results`,subtitle:`${e.length} student results`,searchPlaceholder:`Search student, roll, class...`,searchKeys:[`student_name`,`roll_number`,`class_name`],pageSize:10,filterSubtitle:`result status`,filters:[{key:`result`,label:`Result`,options:[{value:`all`,label:`All`},{value:`pass`,label:`Pass`},{value:`fail`,label:`Fail`},{value:`absent`,label:`Absent`}]}],filterConfigs:[{key:`result`,defaultValue:`all`,match:(e,t)=>t===`all`||e.result_status===t}],columns:[{key:`student_name`,header:`Student`,sortable:!0,cell:e=>(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`p`,{className:`font-semibold text-ink`,children:e.student_name}),(0,b.jsxs)(`p`,{className:`text-xs text-slate-500`,children:[e.roll_number||`—`,` · `,e.class_name]})]})},{key:`exam`,header:`Exam`,cell:e=>(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`p`,{className:`text-sm text-ink`,children:e.exam?.name??`—`}),(0,b.jsx)(`p`,{className:`text-xs text-slate-500`,children:e.exam?.academic_year?.name})]})},{key:`marks`,header:`Marks`,cell:e=>(0,b.jsxs)(`span`,{className:`font-mono text-sm`,children:[e.marks_obtained,`/`,e.exam?.max_marks??`—`,e.grade&&(0,b.jsx)(`span`,{className:`ml-2 text-violet-600 font-bold`,children:e.grade})]})},{key:`result_status`,header:`Result`,cell:e=>(0,b.jsx)(f,{tone:e.result_status===`pass`?`success`:e.result_status===`fail`?`danger`:`neutral`,children:e.result_status})},{key:`printed`,header:`Printed`,cell:e=>(0,b.jsxs)(`div`,{className:`text-xs text-slate-500 space-y-0.5`,children:[e.marksheet_printed_at&&(0,b.jsxs)(`p`,{children:[`MS: `,new Date(e.marksheet_printed_at).toLocaleDateString()]}),e.certificate_printed_at&&(0,b.jsxs)(`p`,{children:[`Cert: `,new Date(e.certificate_printed_at).toLocaleDateString()]}),!e.marksheet_printed_at&&!e.certificate_printed_at&&`—`]})},{key:`actions`,header:`Print`,className:`w-52`,cell:e=>(0,b.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,b.jsxs)(d,{variant:`secondary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`marksheet`),children:[(0,b.jsx)(o,{className:`h-3.5 w-3.5`}),` Marksheet`]}),(0,b.jsxs)(d,{variant:`primary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`certificate`),children:[(0,b.jsx)(a,{className:`h-3.5 w-3.5`}),` Certificate`]})]})}]}),(0,b.jsxs)(`div`,{className:`mt-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 flex items-start gap-3 text-sm text-slate-600`,children:[(0,b.jsx)(r,{className:`h-5 w-5 text-violet-500 shrink-0 mt-0.5`}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`p`,{children:`Print dialog उघडेल — PDF save नाही. Printer select करून direct print करा. Print झाल्यानंतर record automatically marked होते.`}),(0,b.jsxs)(`p`,{className:`mt-2 text-xs text-slate-500`,children:[`Certificate आणि Marksheet मध्ये system templates apply होतात (certificate: achivement-certificate, marksheet: default-marksheet). Verification: `,(0,b.jsx)(`code`,{className:`text-violet-600`,children:`/verify/CERT-YYYY-####`})]})]})]})]})}export{x as default};