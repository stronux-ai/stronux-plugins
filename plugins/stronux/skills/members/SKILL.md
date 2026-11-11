---
name: members
description: Use when the person asks to invite or enroll people in a course ("enroll these 3 people in Portrait", "invita a estas personas a mi curso", "dale acceso a ana@example.com", "add these members to Photography Basics"), or to invite someone to the team as an instructor or admin ("invita a Ana como instructora", "add Luis as an admin", "what can an instructor do").
---

# Invite members and staff

This sends real emails and uses plan seats, so it only happens after the person says yes to the exact list. Answer in the language the person writes in.

**Academy:** call `whoami` first and pass `space_id` in every other tool. With more than one academy ask which one (by name or handle, never the id); the preview, the list and the yes belong to that academy. If a tool answers `space_choice_required`, `space_not_connected` or `space_mismatch`, explain what happened and call `whoami` again. The rules are in `setup-offers` section 1.

`invite_members` and `invite_staff` may make your AI app ask the person to confirm them before they run: say it once. That confirmation does not replace the yes to the list.

## Tools

- `preview_member_invites`: shows what would happen for each person. Writes nothing and sends nothing.
- `invite_members`: invites the approved list. Needs Publish on in Settings > AI assistants (if the answer says Publish is turned off, tell the person to invite from Stronux, Members, or to turn Publish on; do not try again).

## The flow, always in this order

1. **Get the list.** Emails (and names if they have them) and the courses. Take the course ids from `list_offers`; if a course name is ambiguous, ask which one. Never guess an email or a course.
2. **Preview first.** Call `preview_member_invites` with the people and `course_ids`. Never call `invite_members` without a preview of that same list.
3. **Show the whole table**, one row per person: email, course, what happens and which email they get.
   - `will_get_access` + `set_password`: new person, gets an email to create their password.
   - `will_get_access` + `access_added`: already has an account, gets an email saying they have access to a new course.
   - `will_get_access` + `unknown`: Stronux could not tell which email; they can still be invited.
   - `already_has_access`: they already have it. Nothing happens and they get no email.
   - `cannot_invite` with a `reason`: `invalid_email` (ask for the right one), `staff_user` (they already work in this academy as staff: they are not invited as a member; to invite someone to the team use `invite_staff`, see the Staff section), `duplicate` (the same email twice).
   - `missing_course_ids`: they have some of the courses; only the missing ones are added.
   - `plan`: if there is a limit, say it ("500 seats, 132 used, 134 after this"). If `after` is above `limit`, the list does not fit: say so ("your plan allows 500 and this would make 503") and offer "I can invite the first N" (N = the seats left, counting only people who would get access, in the order of the list), or say the plan is changed in Stronux. Never accept an overage with a cost; if they pick the first N, preview that shorter list and ask for the yes again.
   - Always say: "Access is free and does not expire." and "Emails cannot be taken back once they are sent."
4. **Ask for the yes** to that list ("Should I invite the N people?"). Only after they say yes to it, call `invite_members` with the same people and courses and `person_confirmed: true`. If the list changes in any way, preview again and ask again.
5. **Report what happened**, from the answer and not from the preview: `invited`, `already_has_access`, `failed` (with `error`) and `not_attempted`.

## Rules

- **20 people at a time.** For more, preview, confirm and invite 20 at a time, and say so ("I will do it in 2 rounds of 20").
- **Someone who already has access gets nothing.** Say it in the table; never invite them again to "resend".
- **One person failing does not stop the list.** Report each failure in its own words: `staff_user`, `email_linked_to_other_account`, `invalid_email`, `invite_failed`.
- **A full plan** (`plan_limit_reached`, with `limit`) stops the list there. The next people come back as `not_attempted`: say who was not invited and that the plan is changed in Stronux. Never show `upgrade_url` or any billing or checkout link.
- **Never remove access, set an end date, import a file or resend an invitation.** Those are done in Stronux, Members. If the person asks, say so.
- **Only emails the person gave you.** Never add a name, an id or anything else about a person that you were not given.

## Staff: invite someone to the team

Members are learners. Staff work in the academy as **Instructor** or **Admin**. This also sends a real email and uses a seat of the plan, so it also needs a yes.

- `describe_staff_roles`: what each role can and cannot do. Writes nothing. Use it whenever the person asks what a role is, and always before the yes.
- `invite_staff`: invites one person to the team with `email`, `role` (`instructor` or `admin`), optional `course_ids` (from `list_offers`) and `person_confirmed`. Needs Publish on, like `invite_members`.

### The flow, always in this order

1. **Get the person and the role.** Email, and instructor or admin. If the person says "so she can edit courses", that is **Admin**, not Instructor: say so. Never guess an email or a role.
2. **Call `describe_staff_roles` and show it.** Before asking for the yes, show the email, the role, the courses (or, if none were given, "all the courses that exist today", not the ones created later) and, in plain words, what that role can and cannot do.
3. **Ask for the yes** to that person and that role. Only then call `invite_staff` with `person_confirmed: true`. One person per yes: for a second person, show and ask again.
4. **Report from the answer.** `invited: true` means a new person got the team email; `invited: false` means they already had an account and now have the role. Tell them they will appear in Members, Team.

### Rules

- **Never the owner.** If the person asks for it ("make her the owner"), do not call anything: ownership is transferred from Stronux and asks for the security code. The tool answers `role_not_allowed` if it is tried.
- **Never remove or change a role.** There is no tool to take someone off the team, change their role, take courses away or transfer the ownership: those are done in Stronux, Members, Team. If the answer is `already_on_team`, say which role they have today and that changing it is done from Stronux.
- **A full plan** (`plan_limit_reached`, with `limit`): say that the plan has no more seats for that role and that the plan is changed in Stronux. Never show `upgrade_url` or any billing or checkout link.
- **No permission** (`forbidden`): only people who manage the team can invite staff; the person can ask an owner or do it from Stronux.
- **Publish off** (the answer says Publish is turned off): tell the person to invite from Stronux, Members, Team, or to turn Publish on; do not try again.
- **Only what the person gave you.** Never invent an email, a role or a course.
