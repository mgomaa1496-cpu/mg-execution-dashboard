# MG Life & Execution Dashboard V4

## V4.0 life and execution workspace

V4 broadens the existing Arabic-first PWA into a local-first personal life and execution workspace for work, learning, health and fitness, nutrition, personal tasks, and goals/habits. The refreshed desktop shell has a collapsible navy sidebar, profile area, search, language switch, notification drawer, category overview, today list, work projects, learning, health, nutrition, habits, and upcoming schedule. Tablet and phone layouts collapse to simpler navigation and a single-column content flow.

The V4 profile and life records are stored in the existing `mg_exec_v2` document under `profile`, `courses`, `workouts`, `meals`, `waterLogs`, and `habits`. `lifeSchemaVersion: "4.0"` records the additive migration; the existing canonical `schemaVersion: "2.2"` remains unchanged. Missing categories are added as `work` once for legacy tasks. The migration preserves the existing project/task names, status, progress, dates, notes, weights, history, and the separate `mg_exec_notifications_v1` notification store. It is idempotent and does not reset or seed existing data. Work completion continues to calculate from Work-category tasks only; learning, health, nutrition, personal, and habits remain independent.

Courses, workouts, meals/macros, water entries, and habits can be created and edited locally. Nutrition values are user-entered; the app does not generate calorie goals or medical advice. Task categories and daily aggregation bring work and personal tasks into Today. Course deadlines, workout reminders, and habit reminders join the V3.3 notification center using its existing stable IDs and local notification engine. Browser notification permission is still user initiated. Background delivery while the app is closed requires future Cloud/Web Push work.

V4 deliberately does not add cloud sync, server login, backend services, real Web Push, store publishing, or factory inventory/pricing/customer features.

## V3.3 smart notifications

An Arabic-first, bilingual local-first Progressive Web App for execution management. The dashboard keeps the current MG identity (navy, off-white, muted olive, cyan) and adds an executive summary with weighted progress, schedule comparison, current focus, deadlines, project summaries, completion history, and responsive layouts.

## V3.3 smart notifications

The notification center stores alerts separately from task/project data in `mg_exec_notifications_v1`; alert preferences remain in the separate local preferences key. Deadline reminders are generated on their 7, 3, and 1 day marks, with separate due-today, overdue, behind-schedule, task completion, project milestone, and weekly-summary alerts. Stable alert IDs prevent duplicates on refresh. The weekly summary is produced once per ISO week when the app is opened and the setting is enabled. The dashboard shows up to three currently relevant alerts. Browser permission is requested only after the user enables Browser Notifications or presses the explicit permission button. Local browser notifications are only emitted while the app is open and visible with permission granted. Closed-app background delivery requires future Cloud/Web Push infrastructure.

Settings independently control browser display, reminders, overdue, behind-schedule, completion, project milestones, and weekly summaries. Arabic and English notification labels and messages are supported.

## V3.2 executive desktop layout polish

The dashboard uses a wide, capped desktop container; a paired completion/schedule overview; a single-row KPI strip; full-width focus and project sections; three equal project cards with completion and completed/total counts; paired deadline/completion panels; and a full-width trend section with its existing empty state. The header is compact. Tablet and mobile breakpoints progressively stack content, with a single-column layout at narrow phone widths. No calculations, storage keys, migration, task/project dates, or saved data are changed by this release.

## V3.1 UI and persistence verification

The dashboard separates Overall Completion from Schedule Performance and presents KPIs, current focus, project completion versus scheduled comparison, deadlines, recent completions, and a bilingual empty state for trend history unless at least two actual/planned snapshots exist. Completion history dates alone are not treated as schedule trend points. Task completion and deletion require confirmation. System-generated history entries are localized while project/task names remain as entered.

Built-in migration checks exercise V2.4-style planned and actual dates through canonical migration and JSON refresh serialization and verify schema 2.2 data is not replaced. The checks do not write the fixture into user storage. The app does not fill missing user dates automatically. The reported planned and actual dates belong to the user's device. The separate Work/browser session used for release preview has independent LocalStorage, so its records cannot establish whether the user's device retained those dates. This UI-only release does not inspect, migrate, seed, or write user data.

## V2.5 schedule calculations

Overall Actual Progress remains the weighted average across all tasks. Planned Progress uses only tasks with valid planned start and end dates. The scheduled-task Actual Progress shown beside Planned Progress is calculated over that exact same scheduled task set and weights. Schedule Variance is scheduled-task Actual minus Planned. Project Actual remains weighted across all project tasks; project schedule comparisons use that project's scheduled subset. Unscheduled work is excluded from ahead/on-track/behind comparison. Dates and existing task values are not rewritten by the V3 UI upgrade.

## Data safety and storage

The canonical V2.2 project/task data remains in LocalStorage at `mg_exec_v2`; old V1 data is migrated without replacing the original legacy record. V2.2 records continue to load as-is, preserving task names, project names, dates, notes, weights, and progress. A small `StorageAdapter` interface with `LocalStorageAdapter` isolates persistence so a future adapter can be added without coupling storage calls to UI rendering. No cloud service is connected and task data is not sent off-device. Language and notification preferences use a separate local key, `mg_exec_preferences_v3`.

JSON export/import keeps the existing project/task schema and all V2.2 fields. Refresh does not seed or reset saved projects/tasks. The optional baseline loader is shown only for an empty workspace.

## Language and notifications

Arabic is the default and uses RTL layout; English can be selected from the header or settings. The preference is stored locally. Notification settings expose browser permission and toggles for approaching deadlines, overdue work, behind-schedule work, weekly summaries, and completion milestones. Browser permission is requested only after a direct user click. These are preparation/settings only: the PWA does not claim background push or server-driven notifications. The app must be opened to evaluate conditions.

## PWA and offline use

The app is installable from a compatible browser and includes 192px and 512px icons, standalone display settings, and responsive mobile/tablet/desktop layouts. Service worker cache version: `mg-exec-v4.0.1`. It caches the app shell for offline opening; data remains in LocalStorage. The static architecture can later be wrapped for Android/iOS, but no store package, cloud sync, backend, or push service is included in this phase.

## Validation

At startup, built-in V2.5 checks verify that scheduled Actual and Planned calculations use the same weighted task set, variance subtracts the two comparable values, completed work resolves to 100%, overdue dates remain overdue, and unscheduled tasks are not scheduled. Automated fixed-date alert checks cover 7/3/1-day reminders, due today, overdue, behind schedule, completion and 50% milestone deduplication, and browser permission states. Refresh checks use stable IDs. Manual release checks should cover the notification center, settings toggles, browser refresh, offline shell loading, both language directions, and LocalStorage preservation.
