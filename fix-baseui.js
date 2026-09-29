const fs = require('fs');

let header = fs.readFileSync('client/src/components/layout/header.tsx', 'utf8');
header = header.replace(/asChild/g, '');
fs.writeFileSync('client/src/components/layout/header.tsx', header);

let sidebar = fs.readFileSync('client/src/components/layout/sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/asChild/g, '').replace(/delayDuration=\{0\}/g, '');
fs.writeFileSync('client/src/components/layout/sidebar.tsx', sidebar);

let jobsNew = fs.readFileSync('client/src/app/(app)/jobs/new/page.tsx', 'utf8');
jobsNew = jobsNew.replace(/onValueChange=\{\(v\) => setForm\(\{ ...form, jobType: v \}\)\}/g, 'onValueChange={(v) => setForm({ ...form, jobType: v || "" })}')
                 .replace(/onValueChange=\{\(v\) => setForm\(\{ ...form, status: v \}\)\}/g, 'onValueChange={(v) => setForm({ ...form, status: v || "" })}');
fs.writeFileSync('client/src/app/(app)/jobs/new/page.tsx', jobsNew);
