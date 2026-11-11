---
name: files-from-folder
description: Use when the person wants Stronux offers built from a folder or files on their computer, or wants videos, PDFs, guide files or images uploaded from disk ("read this folder and tell me how it would look in Stronux", "lee la carpeta y dime cómo quedaría", "sube mi contenido a Stronux", "sube los videos del curso", "put this image as the cover"). Claude only. Reads local folders, uploads files with curl and frames covers.
---

# Files from a folder (Claude only)

This skill adds to `setup-offers` and to the skill of each offer (`course`, `guide`, `service`, `bundle`, `space-link`): follow `setup-offers` first (`whoami`, `space_id` on every call, plan, rules), then use this skill wherever those skills say files come from a folder or are uploaded. Reply in the language the person writes in.

## 1. Claude-specific notes

- If `spaces` from `whoami` is empty, say Claude is not connected to any academy. Settings > AI assistants in Stronux does not connect anything: the person connects Stronux again from Claude (in Claude Code, `/mcp`) and ticks the academy. Stop.
- If the Stronux tools are missing or ask for authentication, tell the person to open `/mcp` and authenticate `stronux`. Do not look for another way in.
- If `space_not_connected` is answered, the way to add the academy is to connect Stronux again from Claude and tick it.
- **Permission prompts.** Every tool that writes (create, update, upload, publish, invite, post) may make the app ask the person to allow it before it runs. Say this once, near the start ("the app may ask you to allow each change"), so it does not surprise them. That prompt is not the yes of the plan or of publishing: those still come from the person in the chat.
- Stronux does not let Claude delete anything. If asked, say the person can do it in Stronux. If Publish is off for the academy, it is turned on in Settings > AI assistants or the offer is published from Stronux.
- You do not generate images, covers, videos or lesson text with AI. If something is missing, ask for the file. You may make a simple image with code (for example a plain-colour cover with the title) only if the person asks for it.
- A community post goes out with no mention of Claude or AI, and the "last time" mark of the community belongs to Claude: the `community` skill covers both.

## 2. Read the folder without creating anything

| In the folder | In Stronux |
|---|---|
| Folder with `curso.md`/`course.md` or lesson subfolders | A course |
| Numbered subfolder | A section, in number order |
| Numbered `.md`/`.txt` | A text lesson (convert to HTML for `body_html`) |
| `.mp4`, `.mov`, `.m4v` | A lesson with an uploaded video |
| `.url.txt`, or `.md` with only a YouTube link | A lesson with a video link (YouTube only) |
| `.pdf` inside a section | Material of the lesson with the same number, or the previous one; if unclear, ask |
| `.pdf` at the course root | Course material |
| Image named `portada`/`cover` | The cover; if there are several, ask which |
| `.md` with name, description, price | Offer texts and price |
| Folder with a `.pdf` and a guide `.md` | A guide |
| `.md` for a service (length, type) | A service |
| `.md` for a bundle naming courses | A bundle |
| `.md` with an external link | A space link if free; if it has a price, say Stronux has no such offer |

Then call `list_offers` to see what exists. Complete or edit an existing offer; never create a duplicate without asking. For an existing course also call `get_course_structure` and compare.

When you show the plan (`setup-offers`, section 3), include what gets uploaded. Create nothing until the person says yes to the plan.

## 3. Upload rules

- Upload files with `curl -X PUT` to the `upload_url` the tool returns, one at a time. Never paste file bytes or signed URLs in the chat.
- Put a video only in lessons that have none; add a guide file only to a guide that has none. If the tool says it already has one, tell the person it is changed in Stronux.
- Report progress ("uploading 3 videos, 1 ready"). At the end summarise what is in Stronux (offer, sections, lessons, files, price, draft state) and what could not be done and why.

## 4. Course files

These come after the text lessons exist (after step 3 of the `course` skill):

1. For each video file: `create_lesson_video_upload`, then `curl -X PUT --upload-file "<file>" "<upload_url>"`, then `get_lesson_video_status` until `ready` or `errored`. One at a time. Never replace a video (`lesson_has_video`). `set_lesson_video_link` puts a YouTube link only on a lesson that has no video.
2. For each PDF: `prepare_material_upload` (title, filename, content_type, byte_size), `curl -X PUT -H "Content-Type: <content_type>" --upload-file "<file>" "<upload_url>"`, then `attach_material` with the `resource_id` (with `lesson_id` for a lesson, without for the course; PDF only for lessons).
3. Cover: `set_course_cover` (see images below). A section cover, if the person gives one, uses `set_section_cover` with the `section_id` from `get_course_structure`. After each cover, frame it with `set_cover_framing` (target course or section) as below, and say so in the summary.

## 5. Guide file and covers of other offers

- **Guide file:** `prepare_guide_upload` with filename, content_type (for example `application/pdf`) and byte_size (up to 50 MB), then `curl -X PUT -H "Content-Type: <content_type>" --upload-file "<file>" "<upload_url>"`. A guide that already has a file answers `guide_has_file`: never replace it, tell the person it is changed in Stronux. If the upload fails, do not retry: the guide already counts as having a file; tell the person to upload it from Stronux.
- **Guide cover** with `set_offer_cover` (see images below). A guide cover is not cropped until it is framed, so frame it with `set_cover_framing` (target offer) only when the image is a photo or a design with text, not the cover page of the guide file; say so in the summary.
- **Service and bundle covers** with `set_offer_cover` (see images below), then frame it with `set_cover_framing` (target offer) and say so in the summary.
- **Space link image** (optional): a card has a title, an https URL and an optional image. Show title, URL and image and ask for the yes first, then call `create_space_link` with `person_confirmed: true` and the image `upload_id` (see images below).

## 6. Images

Every image (covers, link cards) goes by signed URL, never as text inside a tool argument:

1. `prepare_image_upload` with `content_type` (image/jpeg, image/png or image/webp) and `byte_size` (up to 1.5 MB; resize first if larger). It returns `upload_id`, `upload_url` (valid 15 minutes) and `content_type`.
2. `curl -X PUT -H "Content-Type: <content_type>" --upload-file "<file>" "<upload_url>"`. One image at a time.
3. Call the tool that sets the image (`set_course_cover`, `set_section_cover`, `set_offer_cover` or `create_space_link`) with the `upload_id`.

If the `upload_id` is unknown or expired (`upload_not_found`), prepare a new upload. If the person has no image you may make a simple one with code (for example a PNG with the title); never generate images with AI.

### Cover framing

A cover is cropped differently on each screen, so after every `set_course_cover`, `set_section_cover` or `set_offer_cover` you set its focal point:

1. Look at the image (the file you uploaded, or the one you download with `curl -o` to a temporary folder when you use `get_cover`). Do not show its URL in the chat.
2. Pick the focal point yourself, on the important part: the centre of the text, or of the subject (a face, the main object). The two numbers go from 0 to 100; 0,0 is the top-left corner and 50,50 the centre. Do not ask first.
3. Call `set_cover_framing` with `target` (course, section or offer), the ids that go with it, `focal_x` and `focal_y`. A course cover is always target course, never offer. If it answers `cover_not_found`, the cover has no image yet: upload it first.
4. In the final summary say what you chose and how to change it: "I framed the cover at X/Y; you can move it with Frame cover in Stronux."

You may also reframe a cover that already exists, even one you did not upload: read it with `get_cover`, look at it and call `set_cover_framing`. This only changes the framing; it never replaces or removes the image.

Frames by screen, so you know what gets cropped: the module card is 16:10; the course cover is 16:7 on desktop and 4:3 on mobile; Explore and the public home are 16:9; My spaces is 4:3.

**Safe zone when you make an image with code:** make it 1200x675 and keep everything that matters (text, icon) inside the central rectangle of 900x525. The edges may hold only background, because the narrowest frames crop them. Then set the focal point at the centre of the text.
