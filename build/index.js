(()=>{var e={579:e=>{e.exports={prepareData:function(e,t){const a=(new Date).getTime();let i={},s={};const r=[],o={},n=[],l=[],u={100:0,500:0,1e3:0,1001:0},c={100:0,500:0,1e3:0,1001:0},d=Array(168).fill(0);function m(e){function t(e){e.forEach((e=>{"object"==typeof e&&m(e)}))}"User"===e.type&&(i[e.id]=e,i[e.id].valueText=0,i[e.id].likes=0,t(e.friends),t(e.commits),t(e.comments)),"Sprint"===e.type&&(s[e.id]=e,s[e.id].value=0),"Summary"===e.type&&(o[e.id]=e,o[e.id].change=e.added+e.removed,t(e.comments)),"Comment"===e.type&&(t(e.likes),"object"==typeof e.author&&m(e.author),l.push(e)),"Commit"===e.type&&(t(e.summaries),"object"==typeof e.author&&m(e.author),n.push(e)),"Issue"===e.type&&(t(e.comments),"object"==typeof e.resolvedBy&&m(e.resolvedBy)),"Project"===e.type&&(t(e.issues),t(e.commits),t(e.dependencies))}e.forEach((e=>{m(e)})),l.forEach((e=>{s[t.sprintId].startAt<=e.createdAt&&e.createdAt<=s[t.sprintId].finishAt&&(i["object"==typeof e.author?e.author.id:e.author].likes+=e.likes.length)}));const p=s[t.sprintId-1],f=s[t.sprintId];function v(e){const t=e%10,a=e%100;return 4<e&&e<21||0===t||a>4&&a<21||t>4&&t<21?"ов":1===e||1===t?"":"а"}s=Object.values(s),s.sort(((e,t)=>(t=t.id,(e=e.id)-t))),n.forEach((e=>{const a=s[function(e,t){let a=0,i=e.length;for(;a<i;){const s=Math.floor((a+i)/2),r=e[s].startAt,o=e[s].finishAt;if(t<=o&&t>=r)return s;t<r?i=s:t>o&&(a=s+1)}return-1}(s,e.timestamp)];if(a.value++,a.id===t.sprintId-1){const t=e.summaries.reduce(((e,t)=>e+o["object"==typeof t?t.id:t].change),0);t<=100?c[100]++:t<=500?c[500]++:t<=1e3?c[1e3]++:c[1001]++}if(a.id===t.sprintId){i["object"==typeof e.author?e.author.id:e.author].valueText++;const t=e.summaries.reduce(((e,t)=>e+o["object"==typeof t?t.id:t].change),0);t<=100?u[100]++:t<=500?u[500]++:t<=1e3?u[1e3]++:u[1001]++;const s=24*(new Date(e.timestamp).getDay()-new Date(a.startAt).getDay())+new Date(e.timestamp).getHours();d[s]++}})),i=Object.values(i),i.sort(((e,t)=>(t=t.valueText)-e.valueText));const h=i.map((e=>({id:e.id,name:e.name,avatar:e.avatar,valueText:e.valueText})));i.sort(((e,t)=>(t=t.likes)-e.likes)),r.push({alias:"leaders",data:{title:"Больше всего коммитов",subtitle:`${f.name}`,emoji:"👑",users:h}}),r.push({alias:"vote",data:{title:"Самый 🔎 внимательный разработчик",subtitle:`${f.name}`,emoji:"🔎",users:i.map((e=>({id:e.id,name:e.name,avatar:e.avatar,valueText:`${e.likes} голос${v(e.likes)}`})))}}),r.push({alias:"chart",data:{title:"Коммиты",subtitle:`${f.name}`,values:s.map((e=>t.sprintId===e.id?{title:e.id,hint:e.name,value:e.value,active:!0}:{title:e.id,hint:e.name,value:e.value})),users:h}}),r.push({alias:"diagram",data:{title:"Размер коммитов",subtitle:`${f.name}`,totalText:`${f.value} коммит${v(f.value)}`,differenceText:f.value-p.value+" c прошлого спринта",categories:[{title:"> 1001 строки",valueText:`${u[1001]} коммит${v(u[1001])}`,differenceText:`${u[1001]-c[1001]} коммит${v(Math.abs(u[1001]-c[1001]))}`},{title:"501 — 1000 строк",valueText:`${u[1e3]} коммит${v(u[1e3])}`,differenceText:`${u[1e3]-c[1e3]} коммит${v(Math.abs(u[1e3]-c[1e3]))}`},{title:"101 — 500 строк",valueText:`${u[500]} коммит${v(u[500])}`,differenceText:`${u[500]-c[500]} коммит${v(Math.abs(u[500]-c[500]))}`},{title:"1 — 100 строк",valueText:`${u[100]} коммит${v(u[100])}`,differenceText:`${u[100]-c[100]} коммит${v(Math.abs(u[100]-c[100]))}`}]}}),r.push({alias:"activity",data:{title:"Коммиты",subtitle:`${f.name}`,data:{sun:d.slice(0,24),mon:d.slice(24,48),tue:d.slice(48,72),wed:d.slice(72,96),thu:d.slice(96,120),fri:d.slice(120,144),sat:d.slice(144,168)}}});const $=(new Date).getTime();return console.log(`Allscript: ${$-a}ms`),r}}}},t={};!function a(i){var s=t[i];if(void 0!==s)return s.exports;var r=t[i]={exports:{}};return e[i](r,r.exports,a),r.exports}(579)})();