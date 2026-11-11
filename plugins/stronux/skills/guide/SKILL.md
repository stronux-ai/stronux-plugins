---
name: guide
description: Use when the person asks to create or edit a guide (a downloadable PDF offer) in Stronux ("make a guide called Weekly Planning Template", "hazme una guía", "set the price of my ebook").
---

# Guide

Follow the `setup-offers` skill first (plan, rules, including `whoami` and `space_id` on every call). Then:

1. `create_guide` with the name and description. Edit texts later with `update_offer`.
2. The guide file (for example the PDF): To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux. Say in the summary whether it has a file: a guide without a file cannot be published. A guide that already has a file is never replaced (`guide_has_file`): it is changed in Stronux.
3. A cover, if the person has one, goes by `files-from-folder`; otherwise it is added in Stronux. `set_price`.
4. Summary, in draft.

**Publish** only with the person's yes naming the guide and `publish_enabled` true: `publish_offer`. Never publish a guide that has no file; if `publish_offer` answers that content is missing, tell the person to upload the file in Stronux.

Plan limit errors (`plan_limit_reached`, `overage_required`): explain; the extra is accepted in Stronux.
