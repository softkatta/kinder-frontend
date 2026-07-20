import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{i as t,n}from"./createLucideIcon-CC-tx1Qc.js";import{l as r}from"./services-Dx32NzW1.js";import{r as i,t as a}from"./AdminDataTable-DlPleIVI.js";import{t as o}from"./award-fTuzH-oL.js";import{t as s}from"./file-text-B8_0-X4A.js";import{zt as c}from"./index-DfUtIN_9.js";import{i as l,l as u,n as d,t as f}from"./AdminUi-C5ZZWTjI.js";var p=e(t(),1);function m(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function h(e){let t=[[`Student Name`,e.student_name],[`Roll Number`,e.roll_number||`—`],[`Class`,e.class_name||`—`],[`Exam`,e.exam_name||`—`],[`Subject`,e.subject||`—`],[`Exam Date`,e.exam_date||`—`],[`Academic Year`,e.academic_year||`—`],[`Marks Obtained`,`${e.marks_obtained??`—`} / ${e.max_marks??`—`}`],[`Percentage`,`${e.percentage??`—`}%`],[`Grade`,e.grade||`—`],[`Result`,(e.result_status||`—`).toUpperCase()]];return`
  <div class="doc marksheet">
    <div class="header">
      <div class="school">${m(e.school?.name||``)}</div>
      <div class="title">MARKSHEET</div>
      <div class="sub">${m(e.academic_year||``)}</div>
    </div>
    <table class="grid">
      ${t.map(([e,t])=>`<tr><th>${m(e)}</th><td>${m(String(t))}</td></tr>`).join(``)}
    </table>
    ${e.remarks?`<p class="remarks"><strong>Remarks:</strong> ${m(e.remarks)}</p>`:``}
    <div class="footer">
      <div class="sign">Class Teacher</div>
      <div class="sign">Principal</div>
    </div>
    <p class="issued">Issued on ${m(e.issued_date||``)}</p>
  </div>`}function g(e){return`
  <div class="doc certificate">
    <div class="border-outer">
      <div class="border-inner">
        <p class="school">${m(e.school?.name||``)}</p>
        <h1>${m(e.certificate_title||`Certificate of Achievement`)}</h1>
        <p class="presented">This is to certify that</p>
        <p class="name">${m(e.student_name)}</p>
        <p class="detail">Roll No. ${m(e.roll_number||`—`)} · Class ${m(e.class_name||`—`)}</p>
        <p class="body">has successfully completed <strong>${m(e.exam_name||``)}</strong>
        ${e.subject?` in <strong>${m(e.subject)}</strong>`:``}
        with <strong>${e.percentage??`—`}%</strong> marks (Grade <strong>${m(e.grade||`—`)}</strong>)
        for academic year <strong>${m(e.academic_year||``)}</strong>.</p>
        <div class="footer">
          <div class="sign">Date: ${m(e.issued_date||``)}</div>
          <div class="sign">Principal</div>
        </div>
      </div>
    </div>
  </div>`}var _=`
@page { size: A4 portrait; margin: 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Georgia, 'Times New Roman', serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #1e293b; }
.doc { max-width: 180mm; margin: 0 auto; }
.marksheet .header { text-align: center; border-bottom: 3px double #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
.marksheet .school { font-size: 22px; font-weight: bold; color: #312e81; }
.marksheet .title { font-size: 18px; letter-spacing: 4px; margin-top: 8px; color: #4f46e5; }
.marksheet .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
.marksheet table.grid { width: 100%; border-collapse: collapse; font-size: 13px; }
.marksheet table.grid th, .marksheet table.grid td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
.marksheet table.grid th { width: 38%; background: #f8fafc; font-weight: 600; }
.marksheet .remarks { margin-top: 16px; font-size: 12px; }
.marksheet .footer { display: flex; justify-content: space-between; margin-top: 48px; font-size: 12px; }
.marksheet .sign { border-top: 1px solid #94a3b8; padding-top: 6px; min-width: 140px; text-align: center; }
.marksheet .issued { text-align: center; margin-top: 24px; font-size: 11px; color: #64748b; }
.certificate { text-align: center; padding: 8mm; }
.certificate .border-outer { border: 4px solid #4f46e5; padding: 6px; }
.certificate .border-inner { border: 2px solid #a5b4fc; padding: 24px 20px; min-height: 240mm; display: flex; flex-direction: column; justify-content: center; }
.certificate .school { font-size: 20px; font-weight: bold; color: #312e81; }
.certificate h1 { font-size: 26px; color: #4f46e5; margin: 16px 0 24px; letter-spacing: 2px; }
.certificate .presented { font-size: 14px; color: #64748b; }
.certificate .name { font-size: 32px; font-weight: bold; margin: 12px 0; color: #0f172a; }
.certificate .detail { font-size: 13px; color: #475569; margin-bottom: 20px; }
.certificate .body { font-size: 15px; line-height: 1.7; max-width: 140mm; margin: 0 auto 40px; }
.certificate .footer { display: flex; justify-content: space-between; margin-top: auto; padding-top: 40px; font-size: 12px; }
.certificate .sign { min-width: 160px; }
`;function v(e){let t=e.paper_size?.includes(`landscape`),n=t?`297mm`:`210mm`,r=t?`210mm`:`297mm`;return`${t?`@page { size: A4 landscape; margin: 0; }`:`@page { size: A4 portrait; margin: 0; }`}
html, body { width: ${n}; height: ${r}; margin: 0; padding: 0; overflow: hidden; background: #fff; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.td-page { width: ${n} !important; height: ${r} !important; margin: 0 !important; overflow: hidden; position: relative; }
* { box-sizing: border-box; }
${e.css||``}`}function y(e){let t=document.createElement(`iframe`);t.style.cssText=`position:fixed;right:0;bottom:0;width:0;height:0;border:0`,document.body.appendChild(t);let n=t.contentWindow,r=t.contentDocument||n?.document;if(!r||!n)return;r.open(),r.write(e),r.close();let i=()=>{setTimeout(()=>t.remove(),500)},a=()=>{setTimeout(()=>{n.focus(),n.print(),setTimeout(i,6e4)},150)};n.onafterprint=i,t.onload=()=>{let e=Array.from(r.images);if(e.length===0){a();return}Promise.all(e.map(e=>e.complete?Promise.resolve():new Promise(t=>{e.onload=()=>t(),e.onerror=()=>t()}))).then(a)}}function b(e){if(e.render_mode===`template`&&e.html){let t=`https://kinder-api.softkatta.in`.replace(/\/$/,``)||window.location.origin,n=v(e);y(`<!DOCTYPE html><html><head><meta charset="utf-8"/><base href="${t}/"><title>${m(e.student_name)}</title><style>${n}</style></head><body>${e.html}</body></html>`);return}let t=e.type===`certificate`?g(e):h(e),n=_;y(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${m(e.student_name)}</title><style>${n}</style></head><body>${t}</body></html>`)}var x=n();function S(){let[e,t]=(0,p.useState)([]),[n,m]=(0,p.useState)(!0),[h,g]=(0,p.useState)(null),_=(0,p.useCallback)(async()=>{m(!0);try{t((await r.allResults()).data.data??[])}catch{c.error(`Failed to load results`),t([])}finally{m(!1)}},[]);(0,p.useEffect)(()=>{_()},[_]);let v=async(e,t)=>{g(e);try{let n=(t===`marksheet`?await r.marksheetView(e):await r.certificateView(e)).data.data;b({...n,type:t}),await r.markPrinted(e,t),c.success(t===`marksheet`?`Marksheet sent to printer`:`Certificate sent to printer`),_()}catch(e){let t=e?.response?.data?.message;c.error(t||`Print failed`)}finally{g(null)}};return(0,x.jsxs)(l,{children:[(0,x.jsx)(u,{title:`Marksheets & Certificates`,subtitle:`Print marksheets and certificates for exam results.`,breadcrumbs:[{label:`Admin`,to:`/admin`},{label:`Marksheets`}]}),n&&e.length===0&&(0,x.jsx)(`p`,{className:`text-sm text-slate-500 text-center py-8`,children:`Loading results...`}),(0,x.jsx)(a,{data:e,rowKey:e=>e.id,onRefresh:_,title:`Exam Results`,subtitle:`${e.length} student results`,searchPlaceholder:`Search student, roll, class...`,searchKeys:[`student_name`,`roll_number`,`class_name`],pageSize:10,filterSubtitle:`result status`,filters:[{key:`result`,label:`Result`,options:[{value:`all`,label:`All`},{value:`pass`,label:`Pass`},{value:`fail`,label:`Fail`},{value:`absent`,label:`Absent`}]}],filterConfigs:[{key:`result`,defaultValue:`all`,match:(e,t)=>t===`all`||e.result_status===t}],columns:[{key:`student_name`,header:`Student`,sortable:!0,cell:e=>(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`p`,{className:`font-semibold text-ink`,children:e.student_name}),(0,x.jsxs)(`p`,{className:`text-xs text-slate-500`,children:[e.roll_number||`—`,` · `,e.class_name]})]})},{key:`exam`,header:`Exam`,cell:e=>(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`p`,{className:`text-sm text-ink`,children:e.exam?.name??`—`}),(0,x.jsx)(`p`,{className:`text-xs text-slate-500`,children:e.exam?.academic_year?.name})]})},{key:`marks`,header:`Marks`,cell:e=>(0,x.jsxs)(`span`,{className:`font-mono text-sm`,children:[e.marks_obtained,`/`,e.exam?.max_marks??`—`,e.grade&&(0,x.jsx)(`span`,{className:`ml-2 text-violet-600 font-bold`,children:e.grade})]})},{key:`result_status`,header:`Result`,cell:e=>(0,x.jsx)(f,{tone:e.result_status===`pass`?`success`:e.result_status===`fail`?`danger`:`neutral`,children:e.result_status})},{key:`printed`,header:`Printed`,cell:e=>(0,x.jsxs)(`div`,{className:`text-xs text-slate-500 space-y-0.5`,children:[e.marksheet_printed_at&&(0,x.jsxs)(`p`,{children:[`MS: `,new Date(e.marksheet_printed_at).toLocaleDateString()]}),e.certificate_printed_at&&(0,x.jsxs)(`p`,{children:[`Cert: `,new Date(e.certificate_printed_at).toLocaleDateString()]}),!e.marksheet_printed_at&&!e.certificate_printed_at&&`—`]})},{key:`actions`,header:`Print`,className:`w-52`,cell:e=>(0,x.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,x.jsxs)(d,{variant:`secondary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`marksheet`),children:[(0,x.jsx)(s,{className:`h-3.5 w-3.5`}),` Marksheet`]}),(0,x.jsxs)(d,{variant:`primary`,className:`!px-2.5 !py-1.5 text-xs`,disabled:h===e.id,onClick:()=>v(e.id,`certificate`),children:[(0,x.jsx)(o,{className:`h-3.5 w-3.5`}),` Certificate`]})]})}]}),(0,x.jsxs)(`div`,{className:`mt-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 flex items-start gap-3 text-sm text-slate-600`,children:[(0,x.jsx)(i,{className:`h-5 w-5 text-violet-500 shrink-0 mt-0.5`}),(0,x.jsxs)(`div`,{children:[(0,x.jsx)(`p`,{children:`Print dialog उघडेल — PDF save नाही. Printer select करून direct print करा. Print झाल्यानंतर record automatically marked होते.`}),(0,x.jsxs)(`p`,{className:`mt-2 text-xs text-slate-500`,children:[`Certificate आणि Marksheet — `,(0,x.jsx)(`strong`,{children:`Template Designer`}),` templates वापरतात (certificate: achivement-certificate, marksheet: default-marksheet). Design बदलण्यासाठी Admin → Template Designer. Verification: `,(0,x.jsx)(`code`,{className:`text-violet-600`,children:`/verify/CERT-YYYY-####`})]})]})]})]})}export{S as default};