/** Run manually once in the existing KSIS registration Apps Script project. */
function updateForum37Details() {
  const result = ksisRegistration({
    action: 'sync',
    eventId: '2026-forum-37',
    date: '2026-11-07',
    title: '김형환 교수 "1인기업 시대로의 변화, 역발상적 경영리더십 분석"',
    category: 'forum',
    enabled: true
  });
  if (result.eventId !== '2026-forum-37' || result.labelVersion !== 2) {
    throw new Error('UPDATE_NOT_CONFIRMED');
  }
  console.log(JSON.stringify({
    updated: true,
    eventId: result.eventId,
    title: result.title,
    category: result.category,
    registrationForm: result.registrationForm
  }, null, 2));
}
