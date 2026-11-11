---
name: course
description: Use when the person asks to set up, build or edit a course in Stronux from an outline, text, a folder or files ("turn this outline into a course", "arma un curso con este temario", "set up a course with this folder", "add a lesson to my course", "put this YouTube video in lesson 2", "sube los videos del curso").
---

# Course

Follow the `setup-offers` skill first (plan, rules, including `whoami` and `space_id` on every call). Then:

1. `create_course` with the name and description, or `update_course` if `list_offers` shows it exists. If the name is taken (`slug_taken`) ask for another.
2. `add_section` for each part, in order (`reorder_sections` with every section id if the order is wrong).
3. `add_lesson` for each lesson, in order: `body_html` for text, `youtube_url` for a YouTube link, `after_lesson_id` to insert in the middle. Lessons are born hidden. Fix text with `update_lesson_text`; order with `reorder_lessons`.
4. `set_lesson_video_link` puts a YouTube link only on a lesson that has no video (`lesson_has_video` otherwise: the video is changed in Stronux).
5. Video files, PDFs and covers: To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux. List which lessons still need them in the summary. A cover, once uploaded, is framed with `set_cover_framing` as in `setup-offers`.
6. `set_price` (`one_time` in cents, so USD 49 is 4900, or `free`). Selling needs a plan that includes it (`plan_feature_locked`: explain it; the plan is changed in Stronux).
7. Summary, in draft.

**Publish** only with the person's yes naming the course and `publish_enabled` true: `show_lessons` with the lessons you built (unless they choose others), then `publish_offer`. One yes covers both. Lessons reported as demoted have no text or ready video: tell the person.

Plan limit errors (`plan_limit_reached`, `EXTRA_COURSE_REQUIRED`): explain; the person accepts extras in Stronux.
