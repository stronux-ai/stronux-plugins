---
name: community
description: Use when the person asks what is new in the community of their academy, which questions are waiting for an answer, wants to read a post and its comments, or wants to post in a community or answer a member there ("what is new in the community", "qué hay de nuevo en la comunidad", "any questions without an answer", "hay preguntas sin responder", "show me that thread", "léeme ese hilo", "post this in the community", "publica esto en la comunidad", "answer Elena", "responde a las preguntas").
---

# Community: what is new, post and reply

Reading (`list_community_activity`, `get_community_post`) never asks for the yes and changes nothing, not even the "last time" mark. Three tools write, and your AI app may ask the person to confirm them before they run (say it once): `mark_community_seen` (see "What is new"), and `create_community_post` and `reply_in_community`, which publish in the name of the owner and also need the person's yes in the chat: see "Posting and replying" at the end. Answer in the language the person writes in.

**Academy:** call `whoami` first and pass `space_id` in every other tool. With more than one academy ask which one (by name or handle, never the id); the community, the mark and the drafts belong to that academy. If a tool answers `space_choice_required`, `space_not_connected` or `space_mismatch`, explain what happened and call `whoami` again. The rules are in `setup-offers` section 1.

This skill never edits, hides, pins, closes or deletes anything.

## Tools

- `list_community_activity`: the new posts and comments of the communities of the academy, 20 per call, oldest first.
- `create_community_post`: a post or a question in the community of one course (needs the yes and Publish on).
- `reply_in_community`: a comment on a post or a reply to a comment (needs the yes and Publish on).
- `get_community_post`: one post with its whole thread, to understand the context.
- `mark_community_seen`: saves that you showed everything new, so the next read starts after it (your AI app may ask to confirm it).

## What is new

By default the list starts at **the last time** the AI assistant marked the community as seen (the first time, 7 days back). That mark belongs to the AI assistant: opening the community in the Stronux app does not move it, and **reading never moves it**. It only moves when you call `mark_community_seen`:

- Read with the default (`last_time`) and for the whole academy (no `course_id`), page by page as the person agrees (see "More than 20"). Show everything new.
- On the last page (`next_cursor` is null) the answer brings a `mark_token`. When you have **finished reviewing everything new**, call `mark_community_seen` with that `mark_token`. It is a write, so your AI app may ask the person to confirm it: tell them ("I will mark this as seen so next time starts here; your AI app may ask you to confirm it"). If they say no, do not insist; the same things will come up next time.
- There is no `mark_token` when the person asked for a date (`since`), for a single course (`course_id`), or when you stopped before the last page. Then mark nothing and do not promise that the next time starts from here; just say what you showed. Never invent or reuse a `mark_token`: it is only good for the academy and the read that gave it.
- If `mark_community_seen` fails, say it was not saved and nothing changed, and do not pretend it was:
  - `scope_missing`: this connection has no permission to write. It is not the Publish setting. The person connects Stronux again from your AI app.
  - `mark_failed`: Stronux could not save it right now. Nothing changed; try once more later.
  - `invalid_mark_token`, `mark_token_other_academy` or `mark_token_too_old`: offer to read again with the default and mark at the end.
- The person can ask "since last Monday": pass the date in `since` (not older than 90 days).
- Things the person wrote themselves do not come in the list.

## How to show it

Group what you got **by course, then by post**, and say who wrote what and when, in plain words. Use the names exactly as they come; never guess or invent a name, a role or a detail that did not come.

- Mark every item with `unanswered: true` as **a question without an answer**, and put those first in each course.
- A comment has `post_excerpt`: say which post it belongs to ("Tomás Rey commented on your post 'Live class this Thursday'"). A comment with `parent_comment_id` is a reply to another comment.
- `lesson_name` tells that the post is about a lesson: mention it.
- `photo_count` is only how many photos the post has: you cannot see them. Say "shared 4 photos", never describe them.
- `truncated: true` means the text was cut: say it is longer.
- If `author_is_staff` is true, say it is someone from the team.
- A deleted author comes as "Deleted member": say it as it is.

## More than 20

`total` says how many there are. When `next_cursor` is not null, show the 20 you have and say it plainly: "I am showing the first 20 of 34. Shall I continue with the rest?". Call again with `next_cursor` only if the person says yes (the date and the course travel inside it). When the person asked for one thing in particular (the questions without an answer, for example), you can read the pages yourself and keep only that, but say how many you read. The mark comes only after the last page.

## Nothing new

If `total` is 0, say "Nothing new since <date>" with the date of `since`, in the person's own words. Do not repeat the old things or invent activity.

## Posts that wait for approval

`pending_approval` is only a number per course. Say it ("2 posts are waiting for your approval in Portrait with Natural Light") and that **they are approved in Stronux, Moderation**. You cannot read them, approve them or say who wrote them.

## What you never see

You only see what the members can see in the community. Do not say, guess or hint anything about posts or comments that are hidden, deleted or declined, nor about reports or sanctions of members. If the person asks ("who reported that?", "show me the hidden posts", "delete Raul's comment", "hide that post"), answer: "I do not see reports or hidden posts, and I do not delete, hide or moderate anything. That is done in Stronux, Moderation."

## One thread

Use `get_community_post` with the `post_id` of an item to read the whole thread before talking about it: the post and its comments in order, up to 200 (`comments_truncated: true` says there are more). `is_answer: true` is a comment the team marked as the answer. `locked: true` means the members cannot reply anymore; the owner still can. Reading a thread does not mark anything as seen.

## Posting and replying

`create_community_post` and `reply_in_community` publish for real, **in the name of the owner**, and the members see them like anything the owner wrote. So they follow the same rule as inviting people: Publish has to be on and the person says yes to the exact text.

1. **Draft first, numbered.** For replies, read the thread with `get_community_post` and write one draft per thing to answer. Show each one as: the number, **who and what it answers** (the author name and a short excerpt of the post or comment, or the course for a new post), and the final text exactly as it will be published. Never publish anything that was not shown.
2. **Wait for the yes.** Call the tool with `person_confirmed: true` only for the drafts the person approved in this conversation. "Yes to 1 and 3" is those two. "Yes to all" or "yes" is the numbered drafts of your last message, not one more. If the person changes a text, show the new text again and ask again. One call is one post or one reply.
3. **The text goes out as it was approved.** No signature, no "from the AI assistant", no prefix, no emoji you added, no mention of AI. Do not use @-mentions to notify members (writing someone's name in the text is fine: "Congratulations, Nora!" notifies nobody), and do not turn a post into an announcement email to the members: that is done from Stronux. No photos either.
4. **After publishing**, say what went out and where (the `url`). The people who were answered get the usual bell and email according to their own preferences; a new post does not notify anyone. If the answer says `duplicate: true`, the same text was already published a few minutes ago: say so and do not insist.

A new post takes the course (`course_id` from `list_offers`), the text, `kind` ("post" by default or "question") and, optionally, a lesson of that course (`lesson_id`). A reply takes the `post_id` and, to answer a comment, its `comment_id`. The community has two levels: if the comment is already a reply, the answer goes under its parent comment (`replied_to: "parent_comment"`); tell the person if that happens.

### When it does not work

- "publish_disabled" or "scope_missing": Publish is off for this academy. Say nothing was published, give the draft as a suggestion, and tell the person to publish it in Stronux or turn on Publish in Settings > AI assistants.
- `community_disabled`: the community of that course is turned off. Say so; turning it on is done in Stronux, you cannot.
- `thread_locked` does not happen to the owner; a post or comment that is not found (`post_not_found`, `comment_not_found`) may have been hidden or removed: say you cannot find it and do not guess why.
- `posting_restricted` or a topic required by the community: publish it from Stronux.

### What you never do here

You do not edit, delete, hide, pin, close, approve, decline, report or mark anything as the answer, and you do not sanction anyone. If the person says "delete that comment" or "hide that post", answer: "I do not delete, hide or moderate anything. That is done in Stronux, Moderation." Do not try another tool to get around it.
