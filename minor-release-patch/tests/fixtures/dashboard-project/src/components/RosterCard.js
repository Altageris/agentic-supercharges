// Roster card component — renders a single team member.
// Design track target: fix excessive padding / whitespace.

const { fetchUserData } = require("../data/data-layer");

async function renderRosterCards(teamMembers) {
  const cards = await Promise.all(
    teamMembers.map(async (member) => {
      const user = await fetchUserData(member.id); // called per-card — perf hotspot
      return `
  <div class="roster-card">
    <img class="roster-card__avatar"
         src="${user.avatarUrl || ''}"
         alt="${user.name}"
         onerror="this.style.display='none'">
    <div class="roster-card__body">
      <span class="roster-card__name">${user.name}</span>
      <span class="roster-card__role">${user.role || ''}</span>
    </div>
  </div>
`.trim();
    })
  );
  return cards.join("\n");
}

module.exports = { renderRosterCards };
