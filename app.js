(function(){
"use strict";
var KEY="mg_exec_v2",LEGACY_KEY="mg_exec_v1";
var SCHEMA_VERSION="2.2",storageWritable=true;
var PRIORITY={3:"High",2:"Medium",1:"Low"};
var SEED={schemaVersion:SCHEMA_VERSION,projects:[
{id:"p1",name:"Professional Identity",stage:"Identity",plannedStart:"2026-09-01",plannedEnd:"2026-10-01",actualStart:"",actualCompletion:"",status:"completed",priority:3,notes:"LinkedIn, CV, Portfolio"},
{id:"p2",name:"Proof of Work",stage:"Proof",plannedStart:"2026-09-20",plannedEnd:"2026-11-30",actualStart:"",actualCompletion:"",status:"in_progress",priority:3,notes:"Case studies and manufacturing intelligence"},
{id:"p3",name:"Independent Product",stage:"Product",plannedStart:"2026-09-15",plannedEnd:"2027-03-31",actualStart:"",actualCompletion:"",status:"in_progress",priority:2,notes:"Connected factory platform"}
],tasks:[
["LinkedIn","p1",100,"completed","2026-09-20"],["Professional CV","p1",100,"completed","2026-09-25"],["Professional Portfolio","p1",100,"completed","2026-10-01"],
["Case Study 01 — EP380","p2",100,"completed","2026-09-30"],["Case Study 02 — Factory Digital Transformation","p2",100,"completed","2026-10-04"],
["Manufacturing Data & Operational Intelligence","p2",0,"in_progress","2026-10-31"],["Case Study 03","p2",0,"not_started","2026-11-15"],["Factory Platform MVP","p3",10,"in_progress","2027-03-31"]
].map(function(x,i){return{id:"t"+i,name:x[0],project:x[1],plannedStart:"",plannedEnd:x[4],actualStart:"",actualEnd:x[3]==="completed"?x[4]:"",actualProgress:x[2],status:x[3],priority:i<7?3:2,weight:1,notes:""};}),events:[]};
var E=function(id){return document.getElementById(id);};
var clamp=function(v,a,b){v=Number(v);return Number.isFinite(v)?Math.min(b,Math.max(a,v)):a;};
var today=function(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
var date=function(s){if(!s)return null;var a=String(s).split("-").map(Number);if(a.length!==3)return null;var d=new Date(a[0],a[1]-1,a[2]);return Number.isNaN(d.getTime())?null:d;};
var days=function(a,b){var x=date(a),y=date(b);return x&&y?Math.round((y-x)/86400000):null;};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var statusOf=function(s){s=String(s||"").toLowerCase().replace(/[\s-]+/g,"_");if(["done","complete","completed"].indexOf(s)>=0)return"completed";if(["doing","inprogress","in_progress"].indexOf(s)>=0)return"in_progress";if(["onhold","on_hold","hold"].indexOf(s)>=0)return"on_hold";return"not_started";};
var validProgress=function(v){return v!==null&&v!==""&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=100;};
var canonicalTask=function(x,i,projectIds,projectNames){
x=x&&typeof x==="object"?x:{};
var status=statusOf(x.status),actualValue=validProgress(x.actualProgress)?Number(x.actualProgress):(validProgress(x.progress)?Number(x.progress):0);
var actualEnd=x.actualEnd||x.actualCompletion||"";
if(status!=="completed"&&actualEnd)status="completed";
if(status==="completed")actualValue=100;
var project=String(x.project||x.projectId||"");
if(projectNames[project])project=projectNames[project];
if(!projectIds[project]&&x.projectId&&projectIds[String(x.projectId)])project=String(x.projectId);
var t=Object.assign({},x,{id:String(x.id||("t"+Date.now()+"-"+i)),name:String(x.name||"Untitled task"),project:project,status:status,actualProgress:actualValue,weight:Number(x.weight)>0?Number(x.weight):1,plannedStart:x.plannedStart||x.start||"",plannedEnd:x.plannedEnd||x.end||"",actualStart:x.actualStart||"",actualEnd:actualEnd,priority:clamp(x.priority===undefined?2:x.priority,1,3),notes:String(x.notes||"")});
delete t.progress;delete t.projectId;delete t.start;delete t.end;delete t.actualCompletion;
return t;
};
var migrate=function(source){
var src=source&&typeof source==="object"?source:{};
if(src.schemaVersion===SCHEMA_VERSION&&Array.isArray(src.projects)&&Array.isArray(src.tasks))return src;
var oldProjects=Array.isArray(src.projects)?src.projects:[],oldTasks=Array.isArray(src.tasks)?src.tasks:[];
var projects=oldProjects.map(function(x,i){x=x&&typeof x==="object"?x:{};var id=String(x.id||("p"+Date.now()+"-"+i));return Object.assign({},x,{id:id,name:String(x.name||"Untitled project"),stage:String(x.stage||"Proof"),plannedStart:x.plannedStart||x.start||"",plannedEnd:x.plannedEnd||x.end||"",actualStart:x.actualStart||"",actualCompletion:x.actualCompletion||x.actualEnd||"",status:x.status?statusOf(x.status):"",priority:clamp(x.priority===undefined?2:x.priority,1,3),notes:String(x.notes||""),description:String(x.description||x.desc||"")});});
var projectIds={},projectNames={};projects.forEach(function(p){projectIds[p.id]=true;projectNames[p.name]=p.id;});
var tasks=oldTasks.map(function(x,i){return canonicalTask(x,i,projectIds,projectNames);});
projects.forEach(function(p){if(!p.status){var childTasks=tasks.filter(function(task){return task.project===p.id;});p.status=childTasks.length&&childTasks.every(function(task){return task.status==="completed";})?"completed":childTasks.some(function(task){return task.status==="in_progress";})?"in_progress":childTasks.length&&childTasks.every(function(task){return task.status==="on_hold";})?"on_hold":"not_started";}});
var migrated=Object.assign({},src,{schemaVersion:SCHEMA_VERSION,projects:projects,tasks:tasks,events:Array.isArray(src.events)?src.events:[],createdAt:src.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
return migrated;
};
var load=function(){var raw=localStorage.getItem(KEY),data=null,key=KEY;
if(!raw){raw=localStorage.getItem(LEGACY_KEY);key=LEGACY_KEY;}
if(!raw)return JSON.parse(JSON.stringify(SEED));
try{data=JSON.parse(raw);if(!data||!Array.isArray(data.projects)||!Array.isArray(data.tasks))throw new Error("Stored dashboard data has an unsupported shape");
if(data.schemaVersion===SCHEMA_VERSION&&key===KEY)return data;
var upgraded=migrate(data);localStorage.setItem(KEY,JSON.stringify(upgraded));return upgraded;
}catch(e){storageWritable=false;console.error("Dashboard data migration failed; original LocalStorage was preserved",e);alert("تعذرت قراءة بياناتك القديمة. لم يتم استبدالها أو حذفها.");return JSON.parse(JSON.stringify(SEED));}
};
var db=load();
var save=function(){if(!storageWritable)return;db.schemaVersion=SCHEMA_VERSION;try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){console.error("Dashboard save failed",e);}};
var project=function(id){return db.projects.find(function(p){return p.id===id;});};
var weighted=function(list,fn){var sum=0,w=0;list.forEach(function(x){var weight=Number(x.weight)>0?Number(x.weight):1;sum+=fn(x)*weight;w+=weight;});return w?Math.round(sum/w):0;};
var getTaskActualProgress=function(task){return task.status==="completed"?100:clamp(task.actualProgress,0,100);};
var getTaskPlannedProgress=function(task,asOf){asOf=asOf||today();var span=days(task.plannedStart,task.plannedEnd),elapsed=days(task.plannedStart,asOf);if(span===null||span<0||elapsed===null)return 0;if(asOf>=task.plannedEnd)return 100;if(asOf<=task.plannedStart)return 0;return clamp(Math.round(elapsed/span*100),0,100);};
var children=function(id){return db.tasks.filter(function(task){return task.project===String(id);});};
var getProjectActualProgress=function(projectId){return weighted(children(projectId),getTaskActualProgress);};
var getProjectPlannedProgress=function(projectId){return weighted(children(projectId),function(task){return getTaskPlannedProgress(task,today());});};
var getOverallActualProgress=function(){return weighted(db.tasks,getTaskActualProgress);};
var getOverallPlannedProgress=function(){return weighted(db.tasks,function(task){return getTaskPlannedProgress(task,today());});};
var getScheduleVariance=function(){return getOverallActualProgress()-getOverallPlannedProgress();};
var getProgressScheduleStatus=function(status,actual,planned,endDate,asOf){asOf=asOf||today();if(statusOf(status)==="completed")return"Completed";if(endDate&&endDate<asOf)return"Overdue";var v=actual-planned;return v>5?"Ahead":v< -5?"Behind":"On Track";};
var getTaskScheduleStatus=function(task){return getProgressScheduleStatus(task.status,getTaskActualProgress(task),getTaskPlannedProgress(task,today()),task.plannedEnd,today());};
var getProjectScheduleStatus=function(project){return getProgressScheduleStatus(project.status,getProjectActualProgress(project.id),getProjectPlannedProgress(project.id),project.plannedEnd,today());};
var plannedDuration=function(start,end){if(!start||!end)return null;var d=days(start,end);return d===null?null:Math.max(1,d+1);};
var actualDuration=function(start,end){if(!start)return null;var d=days(start,end||today());return d===null?null:Math.max(1,d+1);};
var remaining=function(end){return end?days(today(),end):null;};
var earlyLate=function(t){if(t.actualEnd&&t.plannedEnd)return days(t.actualEnd,t.plannedEnd);if(t.status!=="completed"&&t.plannedEnd&&t.plannedEnd<today())return days(today(),t.plannedEnd);return null;};
var dayText=function(n){return n===null?"—":Math.abs(n)+" days";};
var earlyLateText=function(n){return n===null?"—":n>0?dayText(n)+" early":n<0?dayText(n)+" late":"On time";};
var statName=function(s){return({not_started:"Not Started",in_progress:"In Progress",completed:"Completed",on_hold:"On Hold"})[s]||s;};
var priorityName=function(p){return PRIORITY[Number(p)]||"Medium";};
var badge=function(label){return'<span class="badge '+String(label).toLowerCase().replace(/\s+/g,"-")+'">'+esc(label)+'</span>';};
var sBadge=function(s){return badge(statName(s));};
var scheduleFor=function(t){return badge(getTaskScheduleStatus(t));};
var bar=function(n,type){return'<div class="bar '+(type||"")+'"><i style="width:'+clamp(n,0,100)+'%"></i></div>';};
var metric=function(name,value){return'<div class="metric">'+esc(name)+'<b>'+esc(value)+'</b></div>';};
var priorityTasks=function(){return db.tasks.filter(function(t){return t.status!=="completed";}).sort(function(a,b){return Number(b.priority)-Number(a.priority)||(a.plannedEnd||"9999").localeCompare(b.plannedEnd||"9999");});};
var upcomingTasks=function(tasks,asOf){asOf=asOf||today();return tasks.filter(function(t){return t.status!=="completed"&&t.plannedEnd&&t.plannedEnd>=asOf;}).sort(function(a,b){return a.plannedEnd.localeCompare(b.plannedEnd);});};
var nearestIncompleteDeadline=function(tasks){return tasks.filter(function(t){return t.status!=="completed"&&t.plannedEnd;}).sort(function(a,b){return a.plannedEnd.localeCompare(b.plannedEnd);})[0]||null;};
var runCalculationChecks=function(){
var d=function(status,actual,start,end){return{status:status,actualProgress:actual,plannedStart:start,plannedEnd:end,weight:1};};
var completed=d("completed",12,"2026-01-01","2026-01-11");
var behind=d("in_progress",50,"2026-01-01","2026-01-11");
var ahead=d("in_progress",80,"2026-01-01","2026-01-11");
var overdue=d("in_progress",20,"2026-01-01","2026-01-11");
var conflictData={schemaVersion:"2.1",overallActual:100,completedCount:8,projects:[{id:"p1",name:"Project One"},{id:"p2",name:"Project Two"}],tasks:[
{id:"c1",name:"Complete 1",project:"p1",status:"done",actualProgress:15,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"a1",name:"Active legacy progress",project:"p1",status:"in_progress",progress:25,actualProgress:"bad",weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"n1",name:"Not started 1",project:"p1",status:"not_started",progress:100,actualProgress:0,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"n2",name:"Not started 2",project:"p1",status:"not_started",progress:0,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"c2",name:"Complete 2",project:"p2",status:"completed",actualProgress:15,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"a2",name:"Active 2",project:"p2",status:"in_progress",actualProgress:50,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"a3",name:"Active 3",project:"p2",status:"in_progress",actualProgress:50,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"},
{id:"n3",name:"Not started 3",project:"p2",status:"not_started",actualProgress:0,weight:1,plannedStart:"2026-01-01",plannedEnd:"2026-01-10"}
]};
var migrated=migrate(conflictData),again=migrate(migrated),prior=db;db=migrated;
var checks=[getTaskActualProgress(completed)===100,getTaskPlannedProgress(behind,"2026-01-08")===70&&getProgressScheduleStatus(behind.status,getTaskActualProgress(behind),getTaskPlannedProgress(behind,"2026-01-08"),behind.plannedEnd,"2026-01-08")==="Behind",getTaskPlannedProgress(ahead,"2026-01-07")===60&&getProgressScheduleStatus(ahead.status,getTaskActualProgress(ahead),getTaskPlannedProgress(ahead,"2026-01-07"),ahead.plannedEnd,"2026-01-07")==="Ahead",getProgressScheduleStatus(overdue.status,getTaskActualProgress(overdue),getTaskPlannedProgress(overdue,"2026-01-12"),overdue.plannedEnd,"2026-01-12")==="Overdue",upcomingTasks([completed],"2026-01-05").length===0,weighted([{weight:2,actualProgress:50,status:"in_progress"},{weight:1,actualProgress:100,status:"in_progress"}],getTaskActualProgress)===67,migrated.schemaVersion==="2.2"&&JSON.stringify(migrated)===JSON.stringify(again),migrated.tasks[1].actualProgress===25&&migrated.tasks[1].status==="in_progress"&&!Object.prototype.hasOwnProperty.call(migrated.tasks[1],"progress"),migrated.tasks[2].actualProgress===0&&migrated.tasks[2].status==="not_started",db.tasks.filter(function(task){return task.status==="completed";}).length===2&&getOverallActualProgress()===41&&getProjectActualProgress("p1")===31&&getProjectActualProgress("p2")===50&&getOverallActualProgress()===weighted(db.tasks,getTaskActualProgress)];
db=prior;
if(checks.some(function(ok){return !ok;}))throw new Error("V2.2 calculation self-check failed: "+checks.map(function(ok,i){return ok?"":String(i+1);}).filter(Boolean).join(","));
console.info("V2.2 calculation and migration self-checks passed: "+checks.length);
};
var event=function(s){db.events.unshift({date:new Date().toISOString(),msg:s});};
var projectCard=function(p){var a=getProjectActualProgress(p.id),pl=getProjectPlannedProgress(p.id),v=a-pl;
return'<article class="card"><div class="row mobile-stack"><div><span class="pill">'+esc(p.stage)+'</span><h3>'+esc(p.name)+'</h3><div class="actions">'+sBadge(p.status)+' '+badge(getProjectScheduleStatus(p))+' '+badge("Priority: "+priorityName(p.priority))+'</div></div><b>'+a+'% actual</b></div><div class="dual-bars"><small>Actual '+a+'%</small>'+bar(a)+'<small>Planned '+pl+'%</small>'+bar(pl,"planned")+'</div><div class="small-grid">'+metric("Tasks",children(p.id).length)+metric("Schedule variance",(v>0?"+":"")+v+"%")+metric("Planned duration",dayText(plannedDuration(p.plannedStart,p.plannedEnd)))+metric("Actual duration",dayText(actualDuration(p.actualStart,p.actualCompletion)))+metric("Days remaining",dayText(remaining(p.plannedEnd)))+metric("Days early / late",earlyLateText(earlyLate(p)))+'</div><p class="muted">'+esc(p.notes||p.description)+'</p><p class="muted">Planned: '+esc(p.plannedStart||"—")+' → '+esc(p.plannedEnd||"—")+' · Actual: '+esc(p.actualStart||"—")+' → '+esc(p.actualCompletion||"—")+'</p><div class="actions"><button class="ghost" data-action="edit-project" data-id="'+esc(p.id)+'">تعديل</button><button class="ghost" data-action="delete-project" data-id="'+esc(p.id)+'">حذف</button></div></article>';};
var taskCard=function(t,compact){var a=getTaskActualProgress(t),pl=getTaskPlannedProgress(t,today()),p=project(t.project);
return'<article class="card task '+(t.status==="completed"?"completed":"")+'"><div class="row mobile-stack"><div><span class="pill">'+esc(p?p.name:"No project")+'</span><h3>'+esc(t.name)+'</h3><div class="actions">'+sBadge(t.status)+' '+scheduleFor(t)+' '+badge("Priority: "+priorityName(t.priority))+' '+badge("Weight: "+t.weight)+'</div></div><b>'+a+'% actual</b></div><div class="dual-bars"><small>Actual '+a+'%</small>'+bar(a)+'<small>Planned '+pl+'%</small>'+bar(pl,"planned")+'</div>'+(compact?"":'<div class="small-grid">'+metric("Planned duration",dayText(plannedDuration(t.plannedStart,t.plannedEnd)))+metric("Actual duration",dayText(actualDuration(t.actualStart,t.actualEnd)))+metric("Days remaining",dayText(remaining(t.plannedEnd)))+metric("Days early / late",earlyLateText(earlyLate(t)))+'</div>')+'<p class="muted">'+esc(t.notes)+'</p><p class="muted">Planned: '+esc(t.plannedStart||"—")+' → '+esc(t.plannedEnd||"—")+' · Actual: '+esc(t.actualStart||"—")+' → '+esc(t.actualEnd||"—")+'</p><div class="actions"><button class="ghost" data-action="edit-task" data-id="'+esc(t.id)+'">تعديل</button>'+(t.status==="completed"?"":'<button class="btn" data-action="complete-task" data-id="'+esc(t.id)+'">إكمال</button>')+'<button class="ghost" data-action="delete-task" data-id="'+esc(t.id)+'">حذف</button></div></article>';};
var render=function(){
save();var oa=getOverallActualProgress(),op=getOverallPlannedProgress(),v=getScheduleVariance(),completed=db.tasks.filter(function(t){return t.status==="completed";}),inProgress=db.tasks.filter(function(t){return t.status==="in_progress";}),overdue=db.tasks.filter(function(t){return getTaskScheduleStatus(t)==="Overdue";});
E("overallActual").textContent=oa+"%";E("overallActualBar").style.width=oa+"%";E("overallPlanned").textContent=op+"%";E("overallVariance").textContent=(v>0?"+":"")+v+"%";E("overallVariance").className=v>0?"variance-positive":v<0?"variance-negative":"";
E("overallHealth").textContent=overdue.length?"Overdue":v>5?"Ahead":v< -5?"Behind":"On Track";E("completedCount").textContent=completed.length;E("totalTasks").textContent="of "+db.tasks.length+" tasks";E("inProgressCount").textContent=inProgress.length;E("overdueCount").textContent=overdue.length;E("activeProjects").textContent=db.projects.filter(function(p){return p.status==="in_progress";}).length;
var upcoming=upcomingTasks(db.tasks),nearest=nearestIncompleteDeadline(db.tasks);
E("nearestDeadline").textContent=nearest?nearest.plannedEnd:"—";E("nearestDeadlineName").textContent=nearest?nearest.name:"";
E("projectProgress").innerHTML=db.projects.length?db.projects.map(function(p){var a=getProjectActualProgress(p.id),pl=getProjectPlannedProgress(p.id);return'<div class="task-row"><div class="row"><b>'+esc(p.name)+'</b><span>'+a+'% actual · '+pl+'% planned</span></div>'+bar(a)+bar(pl,"planned")+'</div>';}).join(""):'<div class="empty">لا توجد مشاريع</div>';
var focus=priorityTasks()[0];E("currentPriority").innerHTML=focus?taskCard(focus,true):'<div class="empty">لا توجد مهام مفتوحة</div>';
E("upcomingDeadlines").innerHTML=upcoming.length?upcoming.slice(0,6).map(function(t){var p=project(t.project);return'<div class="deadline-row"><div class="row mobile-stack"><div><b>'+esc(t.name)+'</b><div class="muted">'+esc(p?p.name:"")+' · '+priorityName(t.priority)+'</div></div><div class="nowrap"><b>'+esc(t.plannedEnd)+'</b><div>'+scheduleFor(t)+'</div></div></div></div>';}).join(""):'<div class="empty">لا توجد مواعيد قادمة</div>';
E("recentlyCompleted").innerHTML=completed.length?completed.slice().sort(function(a,b){return(b.actualEnd||"").localeCompare(a.actualEnd||"");}).slice(0,5).map(function(t){var p=project(t.project);return'<div class="task-row"><div class="row mobile-stack"><div><b>'+esc(t.name)+'</b><div class="muted">'+esc(p?p.name:"")+'</div></div>'+badge(t.actualEnd||"Completed")+'</div></div>';}).join(""):'<div class="empty">لا توجد مهام مكتملة بعد</div>';
E("projectList").innerHTML=db.projects.length?db.projects.map(projectCard).join(""):'<div class="card empty">لا توجد مشاريع</div>';E("taskList").innerHTML=db.tasks.length?db.tasks.map(function(t){return taskCard(t,false);}).join(""):'<div class="card empty">لا توجد مهام</div>';
E("historyList").innerHTML=db.events.length?db.events.map(function(x){return'<p><b>'+esc(x.msg)+'</b><br><small>'+esc(new Date(x.date).toLocaleString("ar-SA"))+'</small></p>';}).join(""):'<div class="empty">لا يوجد سجل بعد</div>';
E("taskProject").innerHTML=db.projects.map(function(p){return'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("");
var completedCount=db.tasks.filter(function(t){return t.status==="completed";}).length,inProgressCount=db.tasks.filter(function(t){return t.status==="in_progress";}).length;
E("diagnosticVersion").textContent=db.schemaVersion;E("diagnosticTotal").textContent=db.tasks.length;E("diagnosticCompleted").textContent=completedCount;E("diagnosticInProgress").textContent=inProgressCount;E("diagnosticActual").textContent=getOverallActualProgress()+"%";E("diagnosticPlanned").textContent=getOverallPlannedProgress()+"%";
};
var set=function(id,val){E(id).value=val||"";};
var openProject=function(id){var p=id?project(id):null;set("projectId",p?p.id:"");set("projectName",p?p.name:"");set("projectStage",p?p.stage:"Proof");set("projectPlannedStart",p?p.plannedStart:today());set("projectPlannedEnd",p?p.plannedEnd:"");set("projectActualStart",p?p.actualStart:"");set("projectActualCompletion",p?p.actualCompletion:"");set("projectPriority",p?p.priority:2);set("projectStatus",p?p.status:"not_started");set("projectNotes",p?p.notes||p.description:"");E("projectDialog").showModal();};
var openTask=function(id){if(!db.projects.length){alert("أضف مشروعًا أولًا");return;}var t=id?db.tasks.find(function(x){return x.id===id;}):null;set("taskId",t?t.id:"");set("taskName",t?t.name:"");set("taskProject",t?t.project:db.projects[0].id);set("taskPlannedStart",t?t.plannedStart:today());set("taskPlannedEnd",t?t.plannedEnd:"");set("taskActualStart",t?t.actualStart:"");set("taskActualCompletion",t?t.actualEnd:"");set("taskProgress",t?getTaskActualProgress(t):0);set("taskWeight",t?t.weight:1);set("taskPriority",t?t.priority:2);set("taskStatus",t?t.status:"not_started");set("taskNotes",t?t.notes:"");E("taskDialog").showModal();};
var newId=function(prefix){return prefix+Date.now()+"-"+Math.random().toString(36).slice(2,7);};
E("projectForm").addEventListener("submit",function(e){e.preventDefault();var id=E("projectId").value||newId("p"),old=project(id),st=statusOf(E("projectStatus").value),p={id:id,name:E("projectName").value.trim(),stage:E("projectStage").value,plannedStart:E("projectPlannedStart").value,plannedEnd:E("projectPlannedEnd").value,actualStart:E("projectActualStart").value,actualCompletion:E("projectActualCompletion").value,status:st,priority:Number(E("projectPriority").value),notes:E("projectNotes").value.trim(),description:""};
if(st==="in_progress"&&!p.actualStart)p.actualStart=old&&old.actualStart?old.actualStart:today();if(st==="completed"){if(!p.actualCompletion)p.actualCompletion=old&&old.actualCompletion?old.actualCompletion:today();if(!p.actualStart)p.actualStart=old&&old.actualStart?old.actualStart:p.actualCompletion;}
if(old)Object.assign(old,p);else db.projects.push(p);event("Saved project: "+p.name);E("projectDialog").close();render();});
E("taskForm").addEventListener("submit",function(e){e.preventDefault();var id=E("taskId").value||newId("t"),old=db.tasks.find(function(x){return x.id===id;}),st=statusOf(E("taskStatus").value),t={id:id,name:E("taskName").value.trim(),project:E("taskProject").value,plannedStart:E("taskPlannedStart").value,plannedEnd:E("taskPlannedEnd").value,actualStart:E("taskActualStart").value,actualEnd:E("taskActualCompletion").value,actualProgress:clamp(E("taskProgress").value,0,100),weight:Math.max(.01,Number(E("taskWeight").value)||1),priority:Number(E("taskPriority").value),status:st,notes:E("taskNotes").value.trim()};
if(old&&old.status==="completed"&&st!=="completed"&&t.actualEnd===old.actualEnd)t.actualEnd="";
if(t.actualEnd)st="completed";if(st==="in_progress"&&!t.actualStart)t.actualStart=old&&old.actualStart?old.actualStart:today();if(st==="completed"){t.actualProgress=100;if(!t.actualEnd)t.actualEnd=old&&old.actualEnd?old.actualEnd:today();if(!t.actualStart)t.actualStart=old&&old.actualStart?old.actualStart:t.actualEnd;}t.status=st;
if(old)Object.assign(old,t);else db.tasks.push(t);event((st==="completed"?"Completed task: ":"Saved task: ")+t.name);E("taskDialog").close();render();});
document.querySelectorAll(".tab").forEach(function(b){b.addEventListener("click",function(){document.querySelectorAll(".tab,.view").forEach(function(x){x.classList.remove("on");});b.classList.add("on");E(b.dataset.view).classList.add("on");});});
document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b)return;var a=b.dataset.action,id=b.dataset.id;
if(a==="new-project")openProject();if(a==="new-task")openTask();if(a==="edit-project")openProject(id);if(a==="edit-task")openTask(id);if(a==="close-project")E("projectDialog").close();if(a==="close-task")E("taskDialog").close();
if(a==="delete-task"&&confirm("حذف المهمة؟")){db.tasks=db.tasks.filter(function(t){return t.id!==id;});render();}
if(a==="delete-project"&&confirm("حذف المشروع وكل مهامه؟")){db.projects=db.projects.filter(function(p){return p.id!==id;});db.tasks=db.tasks.filter(function(t){return t.project!==id;});render();}
if(a==="complete-task"){var t=db.tasks.find(function(x){return x.id===id;});if(t){t.status="completed";t.actualProgress=100;if(!t.actualEnd)t.actualEnd=today();if(!t.actualStart)t.actualStart=t.actualEnd;event("Completed task: "+t.name);render();}}
if(a==="export"){var blob=new Blob([JSON.stringify(Object.assign({},db,{schemaVersion:SCHEMA_VERSION,exportedAt:new Date().toISOString()}),null,2)],{type:"application/json"}),link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="MG_Execution_Dashboard_V2_2_"+today()+".json";link.click();URL.revokeObjectURL(link.href);}
if(a==="reset"&&confirm("بدء جديد؟ سيُحذف مخزن V2 الحالي من هذا الجهاز.")){db={schemaVersion:SCHEMA_VERSION,projects:[],tasks:[],events:[],createdAt:new Date().toISOString()};render();}
});
E("importFile").addEventListener("change",function(e){var file=e.target.files&&e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){try{var data=JSON.parse(reader.result);if(!data||!Array.isArray(data.projects)||!Array.isArray(data.tasks))throw new Error("Invalid backup");db=migrate(data);event("Imported V2.2 backup");render();}catch(err){alert("ملف غير صالح");}e.target.value="";};reader.readAsText(file);});
runCalculationChecks();render();if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(function(e){console.error("Service worker registration failed",e);});
})();
