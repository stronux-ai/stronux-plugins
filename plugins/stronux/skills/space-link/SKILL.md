---
name: space-link
description: Use when the person wants a free offer that lives on another website to appear as a card on their Stronux academy page ("add this link to my academy", "agrega este link a mi espacio").
---

# Space link

Follow the `setup-offers` skill first (plan, rules, including `whoami` and `space_id` on every call). Then:

- Only for a **free** offer on another website. An external link with a price does not exist in Stronux: say so and create nothing.
- A card has a title and an https URL. It has no description or date: tell the person those do not fit. An image for the card: To upload files from a folder on the computer, follow `files-from-folder` if you have it; otherwise the person uploads them in Stronux.
- A link is visible the moment it is created (no draft). Show the title and URL and ask for the yes first, then call `create_space_link` with `person_confirmed: true`.
- The AI assistant only creates links. Editing or removing them (at most 24) is done in Stronux.
