// The 45 tools of the Stronux MCP in stronux_repo main (apps/academy/src/backend/claude-connection/mcp-*.js).
// Update by hand when the MCP changes: that is the signal to review the skills and the ChatGPT test cases.
export const TOOLS = new Set([
  'whoami', 'list_offers', 'get_course_structure',
  'create_course', 'update_course', 'add_section', 'update_section', 'reorder_sections',
  'add_lesson', 'update_lesson_text', 'set_lesson_video_link', 'reorder_lessons',
  'create_lesson_video_upload', 'get_lesson_video_status',
  'prepare_material_upload', 'attach_material', 'set_course_cover', 'set_price',
  'create_guide', 'prepare_guide_upload', 'create_service', 'set_service_booking',
  'create_bundle', 'update_bundle_courses', 'update_offer', 'set_offer_cover',
  'publish_offer', 'show_lessons', 'create_space_link',
  'prepare_image_upload', 'set_section_cover',
  'get_academy_stats', 'list_member_changes', 'list_member_joins',
  'get_cover', 'set_cover_framing',
  'preview_member_invites', 'invite_members',
  'describe_staff_roles', 'invite_staff',
  'list_community_activity', 'mark_community_seen', 'get_community_post', 'create_community_post', 'reply_in_community',
]);
