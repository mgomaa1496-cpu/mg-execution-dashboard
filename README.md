# MG Execution Dashboard V3

An Arabic-first, bilingual local-first Progressive Web App for execution management. The dashboard keeps the current MG identity (navy, off-white, muted olive, cyan) and adds an executive summary with weighted progress, schedule comparison, current focus, deadlines, project summaries, completion history, and responsive layouts.

## V2.5 schedule calculations

Overall Actual Progress remains the weighted average across all tasks. Planned Progress uses only tasks with valid planned start and end dates. The scheduled-task Actual Progress shown beside Planned Progress is calculated over that exact same scheduled task set and weights. Schedule Variance is scheduled-task Actual minus Planned. Project Actual remains weighted across all project tasks; project schedule comparisons use that project's scheduled subset. Unscheduled work is excluded from ahead/on-track/behind comparison. Dates and existing task values are not rewritten by the V3 UI upgrade.

## Data safety and storage

The canonical V2.2 project/task data remains in LocalStorage at `mg_exec_v2`; old V1 data is migrated without replacing the original legacy record. V2.2 records continue to load as-is, preserving task names, project names, dates, notes, weights, and progress. A small `StorageAdapter` interface with `LocalStorageAdapter` isolates persistence so a future adapter can be added without coupling storage calls to UI rendering. No cloud service is connected and task data is not sent off-device. Language and notification preferences use a separate local key, `mg_exec_preferences_v3`.

JSON export/import keeps the existing project/task schema and all V2.2 fields. Refresh does not seed or reset saved projects/tasks. The optional baseline loader is shown only for an empty workspace.

## Language and notifications

Arabic is the default and uses RTL layout; English can be selected from the header or settings. The preference is stored locally. Notification settings expose browser permission and toggles for approaching deadlines, overdue work, behind-schedule work, weekly summaries, and completion milestones. Browser permission is requested only after a direct user click. These are preparation/settings only: the PWA does not claim background push or server-driven notifications. The app must be opened to evaluate conditions.

## PWA and offline use

The app is installable from a compatible browser and includes 192px and 512px icons, standalone display settings, and responsive mobile/tablet/desktop layouts. Service worker cache version: `mg-exec-v3`. It caches the app shell for offline opening; data remains in LocalStorage. The static architecture can later be wrapped for Android/iOS, but no store package, cloud sync, backend, or push service is included in this phase.

## Validation

At startup, built-in V2.5 checks verify that scheduled Actual and Planned calculations use the same weighted task set, variance subtracts the two comparable values, completed work resolves to 100%, overdue dates remain overdue, and unscheduled tasks are not scheduled. Manual release checks should cover browser refresh, offline shell loading, both language directions, mobile viewport behavior, and LocalStorage preservation.
