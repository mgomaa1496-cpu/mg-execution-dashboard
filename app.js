(function(){
"use strict";
var KEY="mg_exec_v2",LEGACY_KEY="mg_exec_v1";
var PRIORITY={3:"High",2:"Medium",1:"Low"};
var SEED={schemaVersion:2,projects:[
{id:"p1",name:"Professional Identity",stage:"Identity",plannedStart:"2026-09-01",plannedEnd:"2026-10-01",actualStart:"",actualCompletion:"",status:"completed",priority:3,notes:"LinkedIn, CV, Portfolio"},
{id:"p2",name:"Proof of Work",stage:"Proof",plannedStart:"2026-09-20",plannedEnd:"2026-11-30",actualStart:"",actualCompletion:"",status:"in_progress",priority:3,notes:"Case studies and manufacturing intelligence"},
{id:"p3",name:"Independent Product",stage:"Product",plannedStart:"2026-09-15",plannedEnd:"2027-03-31",actualStart:"",actualCompletion:"",status:"in_progress",priority:2,notes:"Connected factory platform"}
],tasks:[
["LinkedIn","p1",100,"completed","2026-09-20"],["Professional CV","p1",100,"completed","2026-09-25"],["Professional Portfolio","p1",100,"completed","2026-10-01"],
["Case Study 01 — EP380","p2",100,"completed","2026-09-30"],["Case Study 02 — Factory Digital Transformation","p2",100,"completed","2026-10-04"],
["Manufacturing Data & Operational Intelligence","p2",0,"in_progress","2026-10-31"],["Case Study 03","p2",0,"not_started","2026-11-15"],["Factory Platform MVP","p3",10,"in_progress","2027-03-31"]
].map(function(x,i){return{id:"t"+i,name:x[0],project:x[1],plannedStart:"",plannedEnd:x[4],actualStart:"",actualCompletion:x[3]==="completed"?x[4]:"",actualProgress:x[2],status:x[3],priority:i<7?3:2,weight:1,notes:""};}),events:[]};
var E=function(id){return document.getElementById(id);};
var clamp=function(v,a,b){v=Number(v);return Number.isFinite(v)?Math.min(b,Math.max(a,v)):a;};
var today=function(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
var date=function(s){if(!s)return null;var a=String(s).split("-").map(Number);if(a.length!==3)return null;var d=new Date(a[0],a[1]-1,a[2]);return Number.isNaN(d.getTime())?null:d;};
var days=function(a,b){var x=date(a),y=date(b);return x&&y?Math.round((y-x)/86400000):null;};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var statusOf=function(s){s=String(s||"").toLowerCase().replace(/[\s-]+/g,"_");if(["done","complete","completed"].indexOf(s)>=0)return"completed";if(["doing","inprogress","in_progress"].indexOf(s)>=0)return"in_progress";if(["onhold","on_hold","hold"].indexOf(s)>=0)return"on_hold";return"not_started";};
var migrate=function(source){
var src=source&&typeof source==="object"?source:{},oldProjects=Array.isArray(src.projects)?src.projects:[],oldTasks=Array.isArray(src.tasks)?src.tasks:[];
var tasks=oldTasks.map(function(x,i){x=x&&typeof x==="object"?x:{};var st=statusOf(x.status),progress=clamp(x.actualProgress!==undefined?x.actualProgress:(x.progress||0),0,100);
if(st==="completed")progress=100;
var t={id:String(x.id||("t"+Date.now()+"-"+i)),name:String(x.name||"Untitled task"),project:String(x.project||x.projectId||""),plannedStart:x.plannedStart||x.start||"",plannedEnd:x.plannedEnd||x.end||"",actualStart:x.actualStart||"",actualCompletion:x.actualCompletion||x.actualEnd||"",actualProgress:progress,status:st,priority:clamp(x.priority===undefined?2:x.priority,1,3),weight:Number(x.weight)>0?Number(x.weight):1,notes:String(x.notes||"")};
if(t.actualCompletion&&t.status!=="completed"&&t.actualProgress>=100)t.status="completed";return t;});
var projects=oldProjects.map(function(x,i){x=x&&typeof x==="object"?x:{};var id=String(x.id||("p"+Date.now()+"-"+i)),children=tasks.filter(function(t){return t.project===id;});
var st=x.status?statusOf(x.status):(children.length&&children.every(function(t){return t.status==="completed";})?"completed":children.some(function(t){return t.status==="in_progress";})?"in_progress":children.length&&children.every(function(t){return t.status==="on_hold";})?"on_hold":"not_started");
return{id:id,name:String(x.name||"Untitled project"),stage:String(x.stage||"Proof"),plannedStart:x.plannedStart||x.start||"",plannedEnd:x.plannedEnd||x.end||"",actualStart:x.actualStart||"",actualCompletion:x.actualCompletion||x.actualEnd||"",status:st,priority:clamp(x.priority===undefined?2:x.priority,1,3),notes:String(x.notes||""),description:String(x.description||x.desc||"")};});
tasks.forEach(function(t){if(!projects.some(function(p){return p.id===t.project;}))t.project=projects[0]?projects[0].id:"";});
return{schemaVersion:2,projects:projects,tasks:tasks,events:Array.isArray(src.events)?src.events:[],createdAt:src.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
};
var load=function(){try{var raw=localStorage.getItem(KEY);if(raw){var v2=JSON.parse(raw);if(v2&&Array.isArray(v2.projects)&&Array.isArray(v2.tasks))return migrate(v2);}
raw=localStorage.getItem(LEGACY_KEY);if(raw){var v1=JSON.parse(raw);if(v1&&Array.isArray(v1.projects)&&Array.isArray(v1.tasks)){var upgraded=migrate(v1);localStorage.setItem(KEY,JSON.stringify(upgraded));return upgraded;}}}catch(e){console.error("Dashboard data load failed",e);}
return JSON.parse(JSON.stringify(SEED));};
var db=load();
var save=function(){db.schemaVersion=2;db.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){console.error("Dashboard save failed",e);}};
var project=function(id){return db.projects.find(function(p){return p.id===id;});};
var taskProgress=function(t){return t.status==="completed"?100:clamp(t.actualProgress,0,100);};
var plannedProgress=function(t){var span=days(t.plannedStart,t.plannedEnd),elapsed=days(t.plannedStart,today());if(span===null||span<0||elapsed===null)return 0;if(today()>=t.plannedEnd)return 100;if(today()<=t.plannedStart)return 0;return clamp(Math.round(elapsed/span*100),0,100);};
var weighted=function(list,fn){var sum=0,w=0;list.forEach(function(x){var weight=Number(x.weight)>0?Number(x.weight):1;sum+=fn(x)*weight;w+=weight;});return w?Math.round(sum/w):0;};
var children=function(id){return db.tasks.filter(function(t){return t.project===id;});};
var pActual=function(p){return weighted(children(p.id),taskProgress);};
var pPlanned=function(p){return weighted(children(p.id),plannedProgress);};
var overallActual=function(){return weighted(db.tasks,taskProgress);};
var overallPlanned=function(){return weighted(db.tasks,plannedProgress);};
var variance=function(a,b){return Math.round(a-b);};
var schedule=function(t){if(t.status==="completed")return"Completed";if(t.plannedEnd&&t.plannedEnd<today())return"Overdue";var v=variance(t.actualProgress||0,plannedProgress(t));return v>5?"Ahead":v< -5?"Behind":"On Track";};
var projectSchedule=function(p,actual,planned){if(p.status==="completed")return"Completed";if(p.plannedEnd&&p.plannedEnd<today())return"Overdue";var v=variance(actual,planned);return v>5?"Ahead":v< -5?"Behind":"On Track";};
var plannedDuration=function(start,end){if(!start||!end)return null;var d=days(start,end);return d===null?null:Math.max(1,d+1);};
var actualDuration=function(start,end){if(!start)return null;var d=days(start,end||today());return d===null?null:Math.max(1,d+1);};
var remaining=function(end){return end?days(today(),end):null;};
var earlyLate=function(t){if(t.actualCompletion&&t.plannedEnd)return days(t.actualCompletion,t.plannedEnd);if(t.status!=="completed"&&t.plannedEnd&&t.plannedEnd<today())return days(today(),t.plannedEnd);return null;};
var dayText=function(n){return n===null?"—":Math.abs(n)+" days";};
var earlyLateText=function(n){return n===null?"—":n>0?dayText(n)+" early":n<0?dayText(n)+" late":"On time";};
var statName=function(s){return({not_started:"Not Started",in_progress:"In Progress",completed:"Completed",on_hold:"On Hold"})[s]||s;};
var priorityName=function(p){return PRIORITY[Number(p)]||"Medium";};
var badge=function(label){return'<span class="badge '+String(label).toLowerCase().replace(/\s+/g,"-")+'">'+esc(label)+'</span>';};
var sBadge=function(s){return badge(statName(s));};
var scheduleFor=function(t){return badge(schedule(t));};
var bar=function(n,type){return'<div class="bar '+(type||"")+'"><i style="width:'+clamp(n,0,100)+'%"></i></div>';};
var metric=function(name,value){return'<div class="metric">'+esc(name)+'<b>'+esc(value)+'</b></div>';};
var priorityTasks=function(){return db.tasks.filter(function(t){return t.status!=="completed";}).sort(function(a,b){return Number(b.priority)-Number(a.priority)||(a.plannedEnd||"9999").localeCompare(b.plannedEnd||"9999");});};
var event=function(s){db.events.unshift({date:new Date().toISOString(),msg:s});};
var projectCard=function(p){var a=pActual(p),pl=pPlanned(p),v=variance(a,pl);
return'<article class="card"><div class="row mobile-stack"><div><span class="pill">'+esc(p.stage)+'</span><h3>'+esc(p.name)+'</h3><div class="actions">'+sBadge(p.status)+' '+badge(projectSchedule(p,a,pl))+' '+badge("Priority: "+priorityName(p.priority))+'</div></div><b>'+a+'% actual</b></div><div class="dual-bars"><small>Actual '+a+'%</small>'+bar(a)+'<small>Planned '+pl+'%</small>'+bar(pl,"planned")+'</div><div class="small-grid">'+metric("Tasks",children(p.id).length)+metric("Schedule variance",(v>0?"+":"")+v+"%")+metric("Planned duration",dayText(plannedDuration(p.plannedStart,p.plannedEnd)))+metric("Actual duration",dayText(actualDuration(p.actualStart,p.actualCompletion)))+metric("Days remaining",dayText(remaining(p.plannedEnd)))+metric("Days early / late",earlyLateText(earlyLate(p)))+'</div><p class="muted">'+esc(p.notes||p.description)+'</p><p class="muted">Planned: '+esc(p.plannedStart||"—")+' → '+esc(p.plannedEnd||"—")+' · Actual: '+esc(p.actualStart||"—")+' → '+esc(p.actualCompletion||"—")+'</p><div class="actions"><button class="ghost" data-action="edit-project" data-id="'+esc(p.id)+'">تعديل</button><button class="ghost" data-action="delete-project" data-id="'+esc(p.id)+'">حذف</button></div></article>';};
var taskCard=function(t,compact){var a=taskProgress(t),pl=plannedProgress(t),p=project(t.project);
return'<article class="card task '+(t.status==="completed"?"completed":"")+'"><div class="row mobile-stack"><div><span class="pill">'+esc(p?p.name:"No project")+'</span><h3>'+esc(t.name)+'</h3><div class="actions">'+sBadge(t.status)+' '+scheduleFor(t)+' '+badge("Priority: "+priorityName(t.priority))+' '+badge("Weight: "+t.weight)+'</div></div><b>'+a+'% actual</b></div><div class="dual-bars"><small>Actual '+a+'%</small>'+bar(a)+'<small>Planned '+pl+'%</small>'+bar(pl,"planned")+'</div>'+(compact?"":'<div class="small-grid">'+metric("Planned duration",dayText(plannedDuration(t.plannedStart,t.plannedEnd)))+metric("Actual duration",dayText(actualDuration(t.actualStart,t.actualCompletion)))+metric("Days remaining",dayText(remaining(t.plannedEnd)))+metric("Days early / late",earlyLateText(earlyLate(t)))+'</div>')+'<p class="muted">'+esc(t.notes)+'</p><p class="muted">Planned: '+esc(t.plannedStart||"—")+' → '+esc(t.plannedEnd||"—")+' · Actual: '+esc(t.actualStart||"—")+' → '+esc(t.actualCompletion||"—")+'</p><div class="actions"><button class="ghost" data-action="edit-task" data-id="'+esc(t.id)+'">تعديل</button>'+(t.status==="completed"?"":'<button class="btn" data-action="complete-task" data-id="'+esc(t.id)+'">إكمال</button>')+'<button class="ghost" data-action="delete-task" data-id="'+esc(t.id)+'">حذف</button></div></article>';};
var render=function(){
save();var oa=overallActual(),op=overallPlanned(),v=variance(oa,op),completed=db.tasks.filter(function(t){return t.status==="completed";}),inProgress=db.tasks.filter(function(t){return t.status==="in_progress";}),overdue=db.tasks.filter(function(t){return schedule(t)==="Overdue";});
E("overallActual").textContent=oa+"%";E("overallActualBar").style.width=oa+"%";E("overallPlanned").textContent=op+"%";E("overallVariance").textContent=(v>0?"+":"")+v+"%";E("overallVariance").className=v>0?"variance-positive":v<0?"variance-negative":"";
E("overallHealth").textContent=overdue.length?"Overdue":v>5?"Ahead":v< -5?"Behind":"On Track";E("completedCount").textContent=completed.length;E("totalTasks").textContent="of "+db.tasks.length+" tasks";E("inProgressCount").textContent=inProgress.length;E("overdueCount").textContent=overdue.length;E("activeProjects").textContent=db.projects.filter(function(p){return p.status==="in_progress";}).length;
var upcoming=db.tasks.filter(function(t){return t.status!=="completed"&&t.plannedEnd&&t.plannedEnd>=today();}).sort(function(a,b){return a.plannedEnd.localeCompare(b.plannedEnd);}),nearest=upcoming[0];
E("nearestDeadline").textContent=nearest?nearest.plannedEnd:"—";E("nearestDeadlineName").textContent=nearest?nearest.name:"";
E("projectProgress").innerHTML=db.projects.length?db.projects.map(function(p){var a=pActual(p),pl=pPlanned(p);return'<div class="task-row"><div class="row"><b>'+esc(p.name)+'</b><span>'+a+'% actual · '+pl+'% planned</span></div>'+bar(a)+bar(pl,"planned")+'</div>';}).join(""):'<div class="empty">لا توجد مشاريع</div>';
var focus=priorityTasks()[0];E("currentPriority").innerHTML=focus?taskCard(focus,true):'<div class="empty">لا توجد مهام مفتوحة</div>';
E("upcomingDeadlines").innerHTML=upcoming.length?upcoming.slice(0,6).map(function(t){var p=project(t.project);return'<div class="deadline-row"><div class="row mobile-stack"><div><b>'+esc(t.name)+'</b><div class="muted">'+esc(p?p.name:"")+' · '+priorityName(t.priority)+'</div></div><div class="nowrap"><b>'+esc(t.plannedEnd)+'</b><div>'+scheduleFor(t)+'</div></div></div></div>';}).join(""):'<div class="empty">لا توجد مواعيد قادمة</div>';
E("recentlyCompleted").innerHTML=completed.length?completed.slice().sort(function(a,b){return(b.actualCompletion||"").localeCompare(a.actualCompletion||"");}).slice(0,5).map(function(t){var p=project(t.project);return'<div class="task-row"><div class="row mobile-stack"><div><b>'+esc(t.name)+'</b><div class="muted">'+esc(p?p.name:"")+'</div></div>'+badge(t.actualCompletion||"Completed")+'</div></div>';}).join(""):'<div class="empty">لا توجد مهام مكتملة بعد</div>';
E("projectList").innerHTML=db.projects.length?db.projects.map(projectCard).join(""):'<div class="card empty">لا توجد مشاريع</div>';E("taskList").innerHTML=db.tasks.length?db.tasks.map(function(t){return taskCard(t,false);}).join(""):'<div class="card empty">لا توجد مهام</div>';
E("historyList").innerHTML=db.events.length?db.events.map(function(x){return'<p><b>'+esc(x.msg)+'</b><br><small>'+esc(new Date(x.date).toLocaleString("ar-SA"))+'</small></p>';}).join(""):'<div class="empty">لا يوجد سجل بعد</div>';
E("taskProject").innerHTML=db.projects.map(function(p){return'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("");
};
var set=function(id,val){E(id).value=val||"";};
var openProject=function(id){var p=id?project(id):null;set("projectId",p?p.id:"");set("projectName",p?p.name:"");set("projectStage",p?p.stage:"Proof");set("projectPlannedStart",p?p.plannedStart:today());set("projectPlannedEnd",p?p.plannedEnd:"");set("projectActualStart",p?p.actualStart:"");set("projectActualCompletion",p?p.actualCompletion:"");set("projectPriority",p?p.priority:2);set("projectStatus",p?p.status:"not_started");set("projectNotes",p?p.notes||p.description:"");E("projectDialog").showModal();};
var openTask=function(id){if(!db.projects.length){alert("أضف مشروعًا أولًا");return;}var t=id?db.tasks.find(function(x){return x.id===id;}):null;set("taskId",t?t.id:"");set("taskName",t?t.name:"");set("taskProject",t?t.project:db.projects[0].id);set("taskPlannedStart",t?t.plannedStart:today());set("taskPlannedEnd",t?t.plannedEnd:"");set("taskActualStart",t?t.actualStart:"");set("taskActualCompletion",t?t.actualCompletion:"");set("taskProgress",t?taskProgress(t):0);set("taskWeight",t?t.weight:1);set("taskPriority",t?t.priority:2);set("taskStatus",t?t.status:"not_started");set("taskNotes",t?t.notes:"");E("taskDialog").showModal();};
var newId=function(prefix){return prefix+Date.now()+"-"+Math.random().toString(36).slice(2,7);};
E("projectForm").addEventListener("submit",function(e){e.preventDefault();var id=E("projectId").value||newId("p"),old=project(id),st=statusOf(E("projectStatus").value),p={id:id,name:E("projectName").value.trim(),stage:E("projectStage").value,plannedStart:E("projectPlannedStart").value,plannedEnd:E("projectPlannedEnd").value,actualStart:E("projectActualStart").value,actualCompletion:E("projectActualCompletion").value,status:st,priority:Number(E("projectPriority").value),notes:E("projectNotes").value.trim(),description:""};
if(st==="in_progress"&&!p.actualStart)p.actualStart=old&&old.actualStart?old.actualStart:today();if(st==="completed"){if(!p.actualCompletion)p.actualCompletion=old&&old.actualCompletion?old.actualCompletion:today();if(!p.actualStart)p.actualStart=old&&old.actualStart?old.actualStart:p.actualCompletion;}
if(old)Object.assign(old,p);else db.projects.push(p);event("Saved project: "+p.name);E("projectDialog").close();render();});
E("taskForm").addEventListener("submit",function(e){e.preventDefault();var id=E("taskId").value||newId("t"),old=db.tasks.find(function(x){return x.id===id;}),st=statusOf(E("taskStatus").value),t={id:id,name:E("taskName").value.trim(),project:E("taskProject").value,plannedStart:E("taskPlannedStart").value,plannedEnd:E("taskPlannedEnd").value,actualStart:E("taskActualStart").value,actualCompletion:E("taskActualCompletion").value,actualProgress:clamp(E("taskProgress").value,0,100),weight:Math.max(.01,Number(E("taskWeight").value)||1),priority:Number(E("taskPriority").value),status:st,notes:E("taskNotes").value.trim()};
if(old&&old.status==="completed"&&st!=="completed"&&t.actualCompletion===old.actualCompletion)t.actualCompletion="";
if(t.actualCompletion)st="completed";if(st==="in_progress"&&!t.actualStart)t.actualStart=old&&old.actualStart?old.actualStart:today();if(st==="completed"){t.actualProgress=100;if(!t.actualCompletion)t.actualCompletion=old&&old.actualCompletion?old.actualCompletion:today();if(!t.actualStart)t.actualStart=old&&old.actualStart?old.actualStart:t.actualCompletion;}t.status=st;
if(old)Object.assign(old,t);else db.tasks.push(t);event((st==="completed"?"Completed task: ":"Saved task: ")+t.name);E("taskDialog").close();render();});
document.querySelectorAll(".tab").forEach(function(b){b.addEventListener("click",function(){document.querySelectorAll(".tab,.view").forEach(function(x){x.classList.remove("on");});b.classList.add("on");E(b.dataset.view).classList.add("on");});});
document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b)return;var a=b.dataset.action,id=b.dataset.id;
if(a==="new-project")openProject();if(a==="new-task")openTask();if(a==="edit-project")openProject(id);if(a==="edit-task")openTask(id);if(a==="close-project")E("projectDialog").close();if(a==="close-task")E("taskDialog").close();
if(a==="delete-task"&&confirm("حذف المهمة؟")){db.tasks=db.tasks.filter(function(t){return t.id!==id;});render();}
if(a==="delete-project"&&confirm("حذف المشروع وكل مهامه؟")){db.projects=db.projects.filter(function(p){return p.id!==id;});db.tasks=db.tasks.filter(function(t){return t.project!==id;});render();}
if(a==="complete-task"){var t=db.tasks.find(function(x){return x.id===id;});if(t){t.status="completed";t.actualProgress=100;if(!t.actualCompletion)t.actualCompletion=today();if(!t.actualStart)t.actualStart=t.actualCompletion;event("Completed task: "+t.name);render();}}
if(a==="export"){var blob=new Blob([JSON.stringify(Object.assign({},db,{schemaVersion:2,exportedAt:new Date().toISOString()}),null,2)],{type:"application/json"}),link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="MG_Execution_Dashboard_V2_"+today()+".json";link.click();URL.revokeObjectURL(link.href);}
if(a==="reset"&&confirm("بدء جديد؟ سيُحذف مخزن V2 الحالي من هذا الجهاز.")){db={schemaVersion:2,projects:[],tasks:[],events:[],createdAt:new Date().toISOString()};render();}
});
E("importFile").addEventListener("change",function(e){var file=e.target.files&&e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var data=JSON.parse(reader.result);if(!data||!Array.isArray(data.projects)||!Array.isArray(data.tasks))throw new Error("Invalid backup");db=migrate(data);event("Imported V2 backup");render();}catch(err){alert("ملف غير صالح");}e.target.value="";};reader.readAsText(file);});
render();if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(function(e){console.error("Service worker registration failed",e);});
})();
