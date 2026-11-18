---
name: service
description: Use when the person asks to set up a service in Stronux, such as 1:1 mentoring, consulting or a group service ("set up a mentoring service", "arma el servicio de mentoría", "crea una sesión 1 a 1").
---

# Service

Follow the `setup-offers` skill first (plan, rules, including `whoami` and `space_id` on every call). Then:

1. Ask the kind, `one_on_one` or `group`, if the person did not say. It cannot be changed later.
2. `create_service` with name, description and kind.
3. For `one_on_one`, **ask** for the availability: session length in minutes, days and hours, time zone (IANA name, for example `America/New_York`) and the start date. Then `set_service_booking` (`weekly_hours` use weekday 0-6 and start/end minutes from midnight).
4. Texts with `update_offer`. Cover: To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux.
5. `set_price`: a service cannot be free, so the amount must be above 0.
6. Summary, in draft.

**Publish** only with the person's yes naming the service and `publish_enabled` true: `publish_offer`. If it answers `setup_incomplete`, tell the person what is missing: calendar, busy access and payments are connected in Stronux, never from here.

Plan limit errors (`plan_limit_reached`, `overage_required`, `feature_not_in_plan`): explain; the plan is changed in Stronux.
