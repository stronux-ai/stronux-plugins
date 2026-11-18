---
name: get-started
description: Use right after Stronux is connected, or when the person asks what Stronux can do here or which academy is connected ("what can you do with Stronux", "which academy are you connected to", "qué puedes hacer con Stronux").
---

# Get started with Stronux

Answer in the language the person writes in.

1. Call `whoami`. It returns the signed-in email, `spaces` (the academies this connection can work in, each with `name`, `handle` and `publish_enabled`) and the scopes granted.
2. If `spaces` is empty, say Stronux is connected but no academy was chosen: the person connects Stronux again and ticks the academy on the Stronux screen. Stop.
3. Say which academies are connected, by `name` (never show an id), and for each one whether Publish is on or off.
4. Say in two or three lines what you can do here:
   - Set up and edit courses, guides, services and bundles as drafts: names, descriptions, sections, text lessons, YouTube links and prices.
   - Show the offers and the structure of any course.
   - Say how the academy is doing: new, active and inactive members, course progress and who joined each day. No payment data and no member emails.
   - Read what is new in the course communities, and post or reply in the owner's name.
   - Invite members to courses and teammates as Instructor or Admin.
5. Say the limits once:
   - Nothing is ever deleted and nobody is removed.
   - Publishing, posting in the community and sending invitations happen only after the person says yes to that exact action, and only if Publish is on in Settings > AI assistants in Stronux.
   - your AI app may ask the person to confirm each change before it runs.
   - Videos, PDFs and images are uploaded in Stronux (or from a folder if `files-from-folder` is available); a lesson video can also be a YouTube link.
6. Offer three ways to start: "What offers do I have?", "How is my academy doing this month?" or "Turn this outline into a draft course".
