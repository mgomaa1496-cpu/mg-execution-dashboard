# MG Execution Dashboard V2.1

Independent Arabic-first PWA for managing projects, tasks, schedules, weighted progress, deadlines, history, and JSON backups.

## Execution tracking

Projects and tasks include planned start/end dates, actual start/completion dates, priority, status, and notes. Tasks also include actual progress and a weight (default `1`). Project progress is calculated from its tasks. Actual progress changes only when entered or when a task is marked Completed; the passage of time affects Planned Progress only.

Automatic schedule metrics include planned and actual duration, days remaining, days early/late, planned and actual progress, schedule variance, and Ahead / On Track / Behind / Overdue / Completed status. Overall and project progress are weighted averages using task weights.

The dashboard summarizes overall actual and planned progress, schedule variance, task counts, active projects, nearest deadline, current priority, project progress, upcoming deadlines, and recently completed tasks.

## Data and migration

Data is stored locally in browser LocalStorage. Existing `mg_exec_v1` records are migrated to `mg_exec_v2` on first load. V1 `progress` values are migrated into the V2 `actualProgress` field, completed tasks normalize to 100%, and the legacy record is retained. Calculation self-checks cover weighted progress, schedule states, and exclusion of completed tasks from upcoming deadlines. The service worker cache is `mg-exec-v2.1`. JSON export/import includes V2 fields and imports older backups through the same migration.

## Deployment

GitHub Pages serves the repository root from `main`. The service worker cache is `mg-exec-v2.1` and only removes older `mg-exec-*` caches.
