---
name: bundle
description: Use when the person asks to group two or more existing courses into a bundle in Stronux ("make a bundle with these two courses", "arma un bundle con estos cursos").
---

# Bundle

Follow the `setup-offers` skill first (plan, rules, including `whoami` and `space_id` on every call). Then:

1. `list_offers` to find the courses by name. A bundle needs two or more. If one is missing, build it first with the `course` skill or ask the person.
2. `create_bundle` with name, description and `course_ids`. If the name is used (`name_taken`) ask for another.
3. Texts with `update_offer`. Cover: To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux.
4. `set_price`.
5. Summary, in draft.

Courses can only be added to a bundle: `update_bundle_courses` with every course it already has plus the new ones. If a course would be removed (`course_removal_not_allowed`), say it is done in Stronux, because removing one takes access from people who bought the bundle.

**Publish** only with the person's yes naming the bundle and `publish_enabled` true: `publish_offer`.

Plan limit errors (`plan_limit_reached`, `overage_required`): explain; the extra is accepted in Stronux.
