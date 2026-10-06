# MG Execution Dashboard V2.4

Independent Arabic-first PWA for managing projects, tasks, schedules, weighted progress, deadlines, history, and JSON backups.

## Execution tracking

Tasks use the V2.2 canonical model for `status`, `actualProgress`, `weight`, `plannedStart`, `plannedEnd`, `actualStart`, `actualEnd`, `priority`, and `notes`. Legacy task `progress` and `actualCompletion` fields are migrated and removed from canonical task records.

Dashboard totals, project progress, task cards, and diagnostics use the same centralized calculation functions. Project and overall progress are weighted averages over canonical tasks. Completing a task sets its actual progress to 100%; elapsed time affects planned progress and schedule status only.

Automatic schedule metrics include planned and actual duration, days remaining, days early/late, planned and actual progress, schedule variance, and Ahead / On Track / Behind / Overdue / Completed status. JSON export/import supports V2.2 and older backups.

## Baseline plan loader

The Data page offers **تحميل الخطة الأساسية** only when no projects or tasks exist. After confirmation, it creates the three baseline projects and eight tasks, records `Baseline plan loaded` in History, and relies on the V2.2 calculation functions to update Dashboard and Data Diagnostics. The loader uses weight 1, leaves unconfirmed dates blank, and uses only the three confirmed actual completion dates. It does not change `schemaVersion: "2.2"`.

The service worker cache is `mg-exec-v2.4` and removes older `mg-exec-*` caches.

## Deployment

GitHub Pages serves the repository root from `main`.

## Schedule logic (V2.4)

A task is scheduled only when it has valid Planned Start and Planned End dates. Unscheduled tasks are excluded from planned progress and schedule comparisons. Project planned progress uses scheduled tasks only; overall planned progress uses scheduled tasks only, and shows `—` when none are scheduled. Schedule variance also shows `—` without comparable schedule data, and overall schedule status shows `No Schedule / غير مجدول`. Overdue, Nearest Deadline, and Upcoming Deadlines require an incomplete task with a valid Planned End. Data Diagnostics includes Scheduled Tasks and Unscheduled Tasks. The Current Priority card provides `تحديد الجدول` for an unscheduled task and opens its edit form. V2.3 actual progress and LocalStorage data remain unchanged.
