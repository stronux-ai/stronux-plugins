---
name: setup-offers
description: Use first whenever the person wants to set up, build or review offers in Stronux from an outline, notes or text they share in the chat, or from a folder or files ("turn this outline into a course", "convierte este temario en un curso", "set up my academy", "how would this look in Stronux", "read this folder and tell me how it would look in Stronux"). Common rules, plan and final summary for courses, guides, services, bundles and space links.
---

# Set up Stronux offers (common rules)

Reply in the language the person writes in. This skill is shared by `course`, `guide`, `service`, `bundle` and `space-link`: follow it first, then the skill for the offer. Stronux decides prices, limits and publishing rules; you only order the calls and ask what cannot be deduced.

## 1. Before anything

1. Call `whoami` first. It returns `spaces`: the academies this connection can work in, each with `id`, `handle`, `name` and `publish_enabled`. If `spaces` is empty, say Stronux is connected to no academy: the person connects Stronux again and ticks the academy on the Stronux screen. Settings > AI assistants in Stronux does not connect anything. Stop.
2. **Which academy.** If there is one, say its name and use it. If there is more than one and the person did not say which, ask in which academy to work, naming them by `name` or `handle` (never show the id), and wait. Never guess. If the person later talks about another academy, switch and tell them.
3. **Pass `space_id` (the `id` of that academy) in every tool call except `whoami`**, including reads like `list_offers`. Keep the `publish_enabled` of that academy; it can differ between academies.
4. If a tool answers `space_choice_required` (no `space_id`) or `invalid_space_id` (not an id from `whoami`), or `space_mismatch`, tell the person in plain words what happened, call `whoami` again and continue with an academy it lists. Do not retry with an id you made up. If it answers `space_not_connected`, **do not move to another academy on your own**: say which academy (by name) is not connected and how to add it (connect Stronux again and tick it), and continue with another academy only if the person asks.
5. If the Stronux tools are missing or ask for authentication, tell the person to connect Stronux again from your AI app. Do not look for another way in.
6. **Confirmations.** Every tool that writes (create, update, publish, invite, post) may make your AI app ask the person to confirm it before it runs. Say this once, near the start ("your AI app may ask you to confirm each change"), so it does not surprise them. That confirmation is not the yes to the plan or to publishing: those still come from the person in the chat.

## 2. Read what the person shared without creating anything

The material can come from the chat or, if you have the `files-from-folder` skill, from a folder on the computer: then follow that skill for reading the folder.

| In the chat | In Stronux |
|---|---|
| An outline with a course name and parts | A course |
| Each numbered part or heading | A section, in order |
| Each item with text under a section | A text lesson (convert to HTML for `body_html`) |
| A YouTube link for a lesson | A lesson with a video link (YouTube only) |
| A name, a description and a price | Offer texts and price |
| A downloadable document they describe | A guide (the file itself is uploaded in Stronux) |
| A session length and kind (1:1 or group) | A service |
| Two or more existing courses to sell together | A bundle |
| A free offer on another website | A space link; if it has a price, say Stronux has no such offer |

Then call `list_offers` to see what exists. Complete or edit an existing offer; never create a duplicate without asking. For an existing course also call `get_course_structure` and compare.

## 3. Propose the plan, then ask once

Show a short plan (offer, sections, lessons, price). Ask everything that cannot be deduced in a single round. Create nothing until the person says yes to the plan.

## 4. Rules (they repeat what the server enforces)

- Never delete, hide, take offline or remove anything. If asked, say Stronux does not let the AI assistant delete and the person can do it in Stronux. Do not look for a workaround.
- Everything is created as a draft. Publish only after the person says yes **in this conversation** to that offer by name, and only if `publish_enabled` is true for that academy; send `person_confirmed: true` only then. Changing the price of a published offer counts as publishing. If Publish is off, say it is turned on in Settings > AI assistants or the offer is published from Stronux.
- Files (lesson videos, PDFs, guide files, covers and other images): To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux. Without that skill, do not call the upload tools; say which files are missing and where they go in Stronux. Never paste file bytes or signed URLs in the chat.
- Never accept a paid plan limit or overage, and never send the person to a billing or checkout page. Explain the error in plain words: the plan is changed in Stronux.
- Nothing is bought or paid here. Members buy on the academy's own site; payments are connected in Stronux.
- You do not generate images, covers, videos or lesson text with AI on your own. Lesson text comes from what the person gave you; if something is missing, ask.
- When a tool returns an error, tell the person its `message` in plain words. Do not try another way to do the same thing.
- Videos: YouTube links only. No calendars, no payments: those are connected in Stronux.

## 5. Covers that already exist

If you have the `files-from-folder` skill, follow its cover framing rules instead. Otherwise you may reframe a cover that is already in Stronux: `set_cover_framing` with `target` (course, section or offer), the ids that go with it, `focal_x` and `focal_y` (0 to 100; 50,50 is the centre). Only do it if the person asks and tells you where the important part of the image is. If it answers `cover_not_found`, the offer has no cover yet: it is added in Stronux.

## 6. While working and at the end

Report progress ("3 of 6 lessons added"). At the end summarise what is in Stronux (offer, sections, lessons, price, draft state), what is still missing (for example files to upload in Stronux, when you cannot upload them) and what could not be done and why. To publish, ask for the yes naming the offer.
