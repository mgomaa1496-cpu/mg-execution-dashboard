const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('./life-model.js');

test('V3.3 V2.2 data migrates additively and idempotently without changing work records', () => {
  const projects = [
    { id: 'p1', name: 'Professional Identity', status: 'completed' },
    { id: 'p2', name: 'Proof of Work', status: 'in_progress' },
    { id: 'p3', name: 'Independent Product', status: 'in_progress' }
  ];
  const tasks = [
    { id: 't1', name: 'LinkedIn', status: 'completed', actualProgress: 100, actualEnd: '', plannedStart: '', plannedEnd: '', weight: 1 },
    { id: 't2', name: 'Professional CV', status: 'completed', actualProgress: 100, actualEnd: '', plannedStart: '', plannedEnd: '', weight: 1 },
    { id: 't3', name: 'Professional Portfolio', status: 'completed', actualProgress: 100, actualEnd: '2026-10-01', plannedStart: '', plannedEnd: '', weight: 1 },
    { id: 't4', name: 'Case Study 01 — EXCITECH EP380', status: 'completed', actualProgress: 100, actualEnd: '2026-09-30', plannedStart: '', plannedEnd: '', weight: 1 },
    { id: 't5', name: 'Case Study 02 — Factory Digital Transformation', status: 'completed', actualProgress: 100, actualEnd: '2026-10-04', plannedStart: '', plannedEnd: '', weight: 1 },
    { id: 't6', name: 'Manufacturing Data & Operational Intelligence', status: 'in_progress', actualProgress: 0, actualStart: '2026-10-06', plannedStart: '2026-10-06', plannedEnd: '2026-10-31', weight: 1 },
    { id: 't7', name: 'Case Study 03', status: 'not_started', actualProgress: 0, plannedStart: '2026-11-01', plannedEnd: '2026-11-15', weight: 1 },
    { id: 't8', name: 'Factory Platform MVP', status: 'in_progress', actualProgress: 10, actualStart: '2026-10-06', plannedStart: '2026-10-06', plannedEnd: '2027-03-31', weight: 1 }
  ];
  const legacy = { schemaVersion: '2.2', projects, tasks, events: [{ date: '2026-10-04', msg: 'Saved task' }], progressSnapshots: [], notificationsMarker: 'keep' };
  const original = JSON.parse(JSON.stringify(legacy));
  const v4 = model.migrateV4(legacy, 'ar');
  assert.equal(v4.schemaVersion, '2.2');
  assert.equal(v4.lifeSchemaVersion, '4.0');
  assert.equal(v4.tasks.length, 8);
  assert.equal(v4.projects.length, 3);
  assert.deepEqual(v4.projects, projects);
  assert.deepEqual(v4.tasks, tasks.map(task => ({ ...task, category: 'work' })));
  assert.deepEqual(v4.events, original.events);
  for (const key of ['courses', 'workouts', 'meals', 'waterLogs', 'habits']) assert.deepEqual(v4[key], []);
  assert.deepEqual(legacy, original);
  assert.equal(model.migrateV4(v4, 'en'), v4);
  const refreshed = JSON.parse(JSON.stringify(v4));
  assert.deepEqual(model.migrateV4(refreshed, 'ar'), refreshed);
  assert.deepEqual(refreshed.tasks, v4.tasks);
});

test('Today aggregation combines categories, keeps times, and excludes completed items', () => {
  const today = '2026-10-07';
  const data = {
    tasks: [
      { id: 't', name: 'Personal errand', category: 'personal', status: 'in_progress', plannedEnd: today, scheduledTime: '09:00' },
      { id: 'old', name: 'Finished', category: 'work', status: 'completed', plannedEnd: today }
    ],
    courses: [{ id: 'c', name: 'SQL lesson', status: 'in_progress', targetDate: today, targetTime: '10:30' }],
    workouts: [{ id: 'w', type: 'Walk', date: today, time: '18:00', completed: false }],
    meals: [{ id: 'm', name: 'Lunch', date: today, time: '13:00' }],
    habits: [{ id: 'h', name: 'Read', frequency: 'daily', completions: [] }]
  };
  assert.deepEqual(model.todayItems(data, today).map(x => [x.type, x.category, x.time]), [
    ['task', 'personal', '09:00'], ['course', 'learning', '10:30'], ['meal', 'nutrition', '13:00'], ['workout', 'health', '18:00'], ['habit', 'goals', '']
  ]);
});

test('work and learning progress stay independent and habit streak survives refresh', () => {
  const h = { name: 'Read', completions: ['2026-10-04', '2026-10-05', '2026-10-06'] };
  assert.equal(model.habitStreak(h, '2026-10-06'), 3);
  assert.equal(model.habitStreak(h, '2026-10-07'), 3);
  const stats = model.categoryStats({ tasks: [{ category: 'work', status: 'in_progress' }], courses: [{ progress: 50 }, { progress: 30 }], workouts: [], meals: [], waterLogs: [], habits: [] }, '2026-10-07', 64);
  assert.equal(stats.find(x => x.id === 'work').value, 64);
  assert.equal(stats.find(x => x.id === 'learning').value, 40);
  assert.equal(stats.find(x => x.id === 'health').value, null);
});
