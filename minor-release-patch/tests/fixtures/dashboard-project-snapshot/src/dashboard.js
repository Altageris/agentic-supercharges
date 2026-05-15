// Dashboard entry point — orchestrates all data fetches sequentially.
// Perf track target: fetches run one-after-another; p99 ~3s as a result.

const { fetchUserData, fetchTeamMembers, loadOrgSettings, applyPermissionFilters } = require("./data/data-layer");
const { renderRosterCards } = require("./components/RosterCard");

async function loadDashboard(userId, teamId, orgId) {
  const user = await fetchUserData(userId);           // sequential — blocks next
  const members = await fetchTeamMembers(teamId);     // sequential
  const orgSettings = await loadOrgSettings(orgId);  // sequential
  const filtered = await applyPermissionFilters(userId, members); // sequential

  const cards = await renderRosterCards(filtered);

  return { user, orgSettings, cards };
}

module.exports = { loadDashboard };
