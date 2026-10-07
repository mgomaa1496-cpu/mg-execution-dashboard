(function(root){
  "use strict";
  var CATEGORIES=["work","learning","health","nutrition","personal","goals"];
  function migrateV4(source,language){
    var src=source&&typeof source==="object"?source:{};
    var ready=src.lifeSchemaVersion==="4.0"&&src.profile&&Array.isArray(src.tasks)&&src.tasks.every(function(x){return !!x.category;})&&Array.isArray(src.courses)&&Array.isArray(src.workouts)&&Array.isArray(src.meals)&&Array.isArray(src.waterLogs)&&Array.isArray(src.habits);
    if(ready)return src;
    var out=Object.assign({},src);
    out.lifeSchemaVersion="4.0";
    out.profile=Object.assign({displayName:"",title:"",avatar:"",language:language||"ar"},src.profile||{});
    if(!out.profile.language)out.profile.language=language||"ar";
    out.tasks=(Array.isArray(src.tasks)?src.tasks:[]).map(function(task){
      if(task.category)return task;
      return Object.assign({},task,{category:"work"});
    });
    out.courses=Array.isArray(src.courses)?src.courses:[];
    out.workouts=Array.isArray(src.workouts)?src.workouts:[];
    out.meals=Array.isArray(src.meals)?src.meals:[];
    out.waterLogs=Array.isArray(src.waterLogs)?src.waterLogs:[];
    out.habits=Array.isArray(src.habits)?src.habits:[];
    return out;
  }
  function todayItems(data,today){
    var out=[];
    (data.tasks||[]).forEach(function(x){if(x.status!=="completed"&&(x.plannedEnd===today||x.dueDate===today))out.push({id:"task:"+x.id,type:"task",recordId:x.id,name:x.name,category:x.category||"work",time:x.scheduledTime||"",priority:x.priority||2,status:x.status||"not_started",completed:false});});
    (data.courses||[]).forEach(function(x){if(x.status!=="completed"&&x.targetDate===today)out.push({id:"course:"+x.id,type:"course",recordId:x.id,name:x.name,category:"learning",time:x.targetTime||"",priority:x.priority||2,status:x.status||"in_progress",completed:false});});
    (data.meals||[]).forEach(function(x){if(x.date===today)out.push({id:"meal:"+x.id,type:"meal",recordId:x.id,name:x.name,category:"nutrition",time:x.time||"",priority:1,status:"not_started",completed:false});});
    (data.workouts||[]).forEach(function(x){if(x.date===today)out.push({id:"workout:"+x.id,type:"workout",recordId:x.id,name:x.type||x.name,category:"health",time:x.time||"",priority:x.priority||1,status:x.completed?"completed":"not_started",completed:!!x.completed});});
    (data.habits||[]).forEach(function(x){var done=(x.completions||[]).includes(today);if(x.frequency!=="weekly"||!x.weekdays||x.weekdays.includes(new Date(today+"T00:00:00").getDay()))out.push({id:"habit:"+x.id,type:"habit",recordId:x.id,name:x.name,category:"goals",time:x.time||"",priority:1,status:done?"completed":"not_started",completed:done});});
    return out.sort(function(a,b){if(!a.time&&b.time)return 1;if(a.time&&!b.time)return-1;return a.time.localeCompare(b.time)||a.name.localeCompare(b.name);});
  }
  function habitStreak(habit,today){
    var dates=Array.from(new Set(habit.completions||[])).sort();
    var cursor=new Date(today+"T00:00:00Z");
    if(!dates.includes(today))cursor.setUTCDate(cursor.getUTCDate()-1);
    var count=0;
    while(dates.includes(cursor.toISOString().slice(0,10))){count++;cursor.setUTCDate(cursor.getUTCDate()-1);}
    return count;
  }
  function categoryStats(data,today,workProgress){
    var tasks=data.tasks||[],courses=data.courses||[],workouts=data.workouts||[],habits=data.habits||[],meals=data.meals||[],water=data.waterLogs||[];
    var weekStart=new Date(today+"T00:00:00Z");weekStart.setUTCDate(weekStart.getUTCDate()-6);var from=weekStart.toISOString().slice(0,10);
    var weekWorkouts=workouts.filter(function(x){return x.completed&&x.date>=from&&x.date<=today;}).length;
    var waterToday=water.filter(function(x){return x.date===today;}).reduce(function(n,x){return n+(Number(x.amountMl)||0);},0);
    var mealToday=meals.filter(function(x){return x.date===today;}).length;
    var habitDone=habits.filter(function(x){return (x.completions||[]).includes(today);}).length;
    var learnProgress=courses.length?Math.round(courses.reduce(function(n,x){return n+(Number(x.progress)||0);},0)/courses.length):null;
    return [
      {id:"work",value:workProgress==null?null:workProgress,detail:tasks.filter(function(x){return(x.category||"work")==="work"&&x.status!=="completed";}).length},
      {id:"learning",value:learnProgress,detail:courses.length},
      {id:"health",value:null,detail:weekWorkouts},
      {id:"nutrition",value:null,detail:mealToday,secondary:waterToday},
      {id:"personal",value:null,detail:tasks.filter(function(x){return x.category==="personal"&&x.status!=="completed";}).length},
      {id:"goals",value:null,detail:habitDone,secondary:habits.length}
    ];
  }
  var api={VERSION:"4.0",CATEGORIES:CATEGORIES,migrateV4:migrateV4,todayItems:todayItems,habitStreak:habitStreak,categoryStats:categoryStats};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.MGLifeModel=api;
})(typeof globalThis!=="undefined"?globalThis:this);
