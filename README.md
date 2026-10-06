# MG Execution Dashboard V2.2

Independent Arabic-first PWA for managing projects, tasks, schedules, weighted progress, deadlines, history, and JSON backups.

## Execution tracking

Tasks use one canonical model for `status`, `actualProgress`, `weight`, `plannedStart`, `plannedEnd`, `actualStart`, `actualEnd`, `priority`, and `notes`. Legacy task `progress` and `actualCompletion` fields are migrated and removed from canonical task records.

Dashboard totals, project progress, task cards, and diagnostics use the same centralized calculation functions. Project and overall progress are weighted averages over canonical tasks. Completed counts use canonical status. Completing a task sets its actual progress to 100%; elapsed time affects planned progress and schedule status only.

Automatic schedule metrics include planned and actual duration, days remaining, days early/late, planned and actual progress, schedule variance, and Ahead / On Track / Behind / Overdue / Completed status. The dashboard summarizes progress, variance, counts, active projects, deadlines, current priority, project progress, upcoming deadlines, and recently completed tasks.

## Data and migration

Data is stored in browser LocalStorage under `mg_exec_v2` with `schemaVersion: "2.2"`. V1, V2, and V2.1 data migrates on the first V2.2 load; successful V2.2 data loads unchanged on later refreshes. Migration preserves user data, copies legacy `progress` only when `actualProgress` is missing or invalid, normalizes Completed tasks to 100%, and never infers completion from progress alone. Conflicting saved dashboard summaries are ignored. Temporary Data Diagnostics show the schema version, task counts, and overall planned/actual progress. Runtime checks cover migration idempotence, conflicting legacy summaries, weighted progress, schedule states, and completed-task deadline filtering. JSON export/import supports V2.2 and migrates older backups.

The service worker cache is `mg-exec-v2.2` and removes older `mg-exec-*` caches.

## Deployment

GitHub Pages serves the repository root from `main`.
