// ============================================================
//  Streak.uz — Friends page · friends.js
//  Supabase database dynamic integration
// ============================================================

const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';

// ─── Check Login ─────────────────────────────────────────────
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
  window.location.href = 'login.html';
}

const currentUserId = currentUser ? currentUser.id : null;

// ─── Supabase fetch helper ───────────────────────────────────
async function supaFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// ─── Helper: Initials ────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const AVATARS = Array.from({ length: 70 }, (_, i) => `https://i.pravatar.cc/150?img=${i + 1}`);

// ─── Card renderers ─────────────────────────────────────────
function renderActive(p) {
  const tagsHTML = p.tags.map(t =>
    `<span class="ftag ${t.cls}">${t.label}</span>`
  ).join('');

  return `
    <div class="friend-card" data-id="${p.id}">
      <div class="friend-head">
        <div class="avatar-wrap">
          <img src="${p.avatar}" alt="${p.full_name}" class="friend-avatar" />
          <span class="status-dot online"></span>
        </div>
        <div class="friend-name-wrap">
          <div class="friend-name">${p.full_name}</div>
          <div class="friend-streak">🔥 ${p.streak} Kun</div>
        </div>
        <span class="badge badge-active">ACTIVE</span>
      </div>
      <div class="friend-progress">
        <div class="progress-label-row">
          <span>${p.habit}</span>
          <span class="progress-pct">${p.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill purple" style="width:${p.progress}%"></div>
        </div>
      </div>
      ${tagsHTML ? `<div class="friend-tags">${tagsHTML}</div>` : ''}
    </div>`;
}

function renderRisk(p) {
  return `
    <div class="friend-card" data-id="${p.id}">
      <div class="friend-head">
        <div class="avatar-wrap">
          <img src="${p.avatar}" alt="${p.full_name}" class="friend-avatar" />
          <span class="status-dot warning"></span>
        </div>
        <div class="friend-name-wrap">
          <div class="friend-name">${p.full_name}</div>
          <div class="friend-streak warning-text">🔥 ${p.streak} Kun</div>
        </div>
        <span class="badge badge-risk">AT-RISK</span>
      </div>
      <div class="friend-progress">
        <div class="progress-label-row">
          <span>${p.habit}</span>
          <span class="progress-pct">${p.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill orange" style="width:${p.progress}%"></div>
        </div>
      </div>
      <button class="nudge-btn" data-id="${p.id}">Nudge Friend</button>
    </div>`;
}

function renderBroken(p) {
  const firstName = p.full_name.split(' ')[0];
  return `
    <div class="friend-card friend-card-broken" data-id="${p.id}">
      <div class="friend-head">
        <div class="avatar-wrap">
          <img src="${p.avatar}" alt="${p.full_name}" class="friend-avatar grayscale" />
          <span class="status-dot offline"></span>
        </div>
        <div class="friend-name-wrap">
          <div class="friend-name">${p.full_name}</div>
          <div class="friend-streak muted-text">💤 0 Kun</div>
        </div>
        <span class="badge badge-broken">BROKEN</span>
      </div>
      <div class="motivate-box">
        ${firstName} bilan streak uzildi. Uni motivatsiya qiling!
      </div>
    </div>`;
}

// ─── Skeleton loading cards ──────────────────────────────────
function renderSkeletons(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="friend-card skeleton-card" style="min-height:140px;background:linear-gradient(90deg,#f0ebff 25%,#e8e0fa 50%,#f0ebff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;">
    </div>`).join('');
}

// ─── Load & render friends ───────────────────────────────────
async function loadFriends() {
  const grid = document.querySelector('.friends-grid');
  if (!grid) return;

  grid.innerHTML = renderSkeletons(6);

  try {
    // 1. Fetch friendships
    let friendships = await supaFetch(`friendships?select=id,friend_id,status&user_id=eq.${currentUserId}`);

    // If no friendships exist, let's seed friends by linking other profiles
    if (!friendships.length) {
      const otherProfiles = await supaFetch(`profiles?select=id,full_name&id=neq.${currentUserId}&limit=5`);
      if (otherProfiles.length) {
        const seedFriendships = otherProfiles.map(p => ({
          user_id: currentUserId,
          friend_id: p.id,
          status: 'active'
        }));
        friendships = await supaFetch('friendships', {
          method: 'POST',
          body: JSON.stringify(seedFriendships)
        });
      }
    }

    if (!friendships.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--muted);">
          <div style="font-size:32px;margin-bottom:12px;">👥</div>
          <div style="font-weight:700;font-size:15px;">Do'stlar topilmadi</div>
          <div style="font-size:13px;margin-top:6px;">Birinchi bo'lib do'st qo'shing! (Email orqali)</div>
        </div>`;
      updateStats(0, 0, 0);
      return;
    }

    const friendIds = friendships.map(f => f.friend_id);

    // 2. Fetch profiles of friends
    const profiles = await supaFetch(`profiles?select=id,full_name,streak,avatar_url,tags,created_at&id=in.(${friendIds.join(',')})`);

    // 3. Fetch habits of friends to calculate progress and status
    const friendHabits = await supaFetch(`habits?select=id,user_id,title,description&user_id=in.(${friendIds.join(',')})`);

    // 4. Enrich profiles with dynamic database values
    const enriched = profiles.map((p, idx) => {
      const userHabits = friendHabits.filter(h => h.user_id === p.id);
      
      let habitTitle = 'Odatlar belgilanmagan';
      let progress = 0;
      let completedCount = 0;
      
      if (userHabits.length > 0) {
        habitTitle = userHabits[0].title;
        userHabits.forEach(h => {
          try {
            const meta = JSON.parse(h.description);
            if (meta.is_done) completedCount++;
          } catch(e) {}
        });
        progress = Math.round((completedCount / userHabits.length) * 100);
      }
      
      // Determine status based on progress
      let status = 'active';
      if (progress === 0) {
        status = 'broken';
      } else if (progress < 50) {
        status = 'risk';
      }
      
      // Map tags from array of strings (e.g. ["Coding", "Sport"]) to CSS ftag objects
      const rawTags = Array.isArray(p.tags) ? p.tags : [];
      const tags = rawTags.map(tag => {
        if (tag === 'Kitob') return { label: '📚 Kitob', cls: 'ftag-kitob' };
        if (tag === 'Sport') return { label: '🏃 Sport', cls: 'ftag-sport' };
        if (tag === 'Coding') return { label: '💻 Coding', cls: 'ftag-sport' };
        return { label: `⭐ ${tag}`, cls: 'ftag-sport' };
      });
      
      const avatar = p.avatar_url || AVATARS[idx % AVATARS.length];
      const streak = p.streak !== undefined ? p.streak : 0;
      
      return {
        ...p,
        status,
        streak,
        progress,
        habit: habitTitle,
        tags,
        avatar
      };
    });

    // Filter elements in case mapping returns empty
    const activeCards = enriched.map(p => {
      if (p.status === 'active') return renderActive(p);
      if (p.status === 'risk')   return renderRisk(p);
      return renderBroken(p);
    });

    grid.innerHTML = activeCards.join('');

    // Update hero stats
    const activeCount = enriched.filter(p => p.status === 'active').length;
    const topStreak   = Math.max(...enriched.map(p => p.streak), 0);
    const riskCount   = enriched.filter(p => p.status === 'risk').length;
    updateStats(activeCount, topStreak, riskCount);

    // Nudge button events
    grid.querySelectorAll('.nudge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.textContent = '✅ Nudged!';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      });
    });

  } catch (err) {
    console.error('Friends yuklanmadi:', err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--muted);">
        <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
        <div style="font-weight:700;">Xatolik yuz berdi</div>
        <div style="font-size:13px;margin-top:6px;">${err.message}</div>
        <button onclick="loadFriends()" style="margin-top:16px;padding:9px 22px;border-radius:10px;border:none;background:var(--primary);color:#fff;font-weight:700;cursor:pointer;">Qayta urinish</button>
      </div>`;
  }
}

// ─── Load & render groups ────────────────────────────────────
async function loadGroups() {
  const grid = document.querySelector('.friends-grid');
  if (!grid) return;

  grid.innerHTML = renderSkeletons(3);

  try {
    // 1. Fetch user groups memberships
    let memberships = await supaFetch(`group_members?select=group_id,role&user_id=eq.${currentUserId}`);

    // If no groups exist, let's seed a default group
    if (!memberships.length) {
      // Create a default group
      const newGroups = await supaFetch('groups', {
        method: 'POST',
        body: JSON.stringify([{
          name: 'Fokus Chempionlari',
          description: 'Odatlarimizni har kuni birgalikda kuzatib boramiz va rivojlanamiz.'
        }])
      });

      if (newGroups.length) {
        const defaultGroup = newGroups[0];
        // Add current user as admin member
        memberships = await supaFetch('group_members', {
          method: 'POST',
          body: JSON.stringify([{
            group_id: defaultGroup.id,
            user_id: currentUserId,
            role: 'admin'
          }])
        });
      }
    }

    if (!memberships.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--muted);">
          <div style="font-size:32px;margin-bottom:12px;">👥</div>
          <div style="font-weight:700;font-size:15px;">Guruhlar topilmadi</div>
        </div>`;
      return;
    }

    const groupIds = memberships.map(m => m.group_id);

    // 2. Fetch groups
    const groups = await supaFetch(`groups?select=id,name,description&id=in.(${groupIds.join(',')})`);

    // 3. For each group, fetch members and their profiles
    const groupsHTML = [];
    for (const group of groups) {
      const members = await supaFetch(`group_members?select=role,profiles(id,full_name)&group_id=eq.${group.id}`);
      
      const membersHTML = members.map(m => {
        const name = m.profiles ? m.profiles.full_name : 'Foydalanuvchi';
        return `
          <div class="group-member-item">
            <span class="member-avatar-mini">${getInitials(name)}</span>
            <div class="member-info-mini">
              <span class="member-name">${name}</span>
              <span class="member-role">${m.role === 'admin' ? '👑 Admin' : 'A\'zo'}</span>
            </div>
          </div>`;
      }).join('');

      const cardHTML = `
        <div class="friend-card group-card" data-id="${group.id}">
          <div class="friend-head">
            <div class="avatar-wrap">
              <div class="group-avatar-icon">👥</div>
            </div>
            <div class="friend-name-wrap">
              <div class="friend-name">${group.name}</div>
              <div class="friend-streak">${members.length} a'zo</div>
            </div>
            <span class="badge badge-active" style="background:#4f46e5;">JAMOA</span>
          </div>
          <div class="group-desc">${group.description || 'Guruh tavsifi yo\'q.'}</div>
          <div class="group-members-list">
            <h4 class="members-title">A'zolar</h4>
            <div class="members-sub-grid">
              ${membersHTML}
            </div>
          </div>
        </div>`;
      
      groupsHTML.push(cardHTML);
    }

    grid.innerHTML = groupsHTML.join('');

  } catch (err) {
    console.error('Guruhlar yuklanmadi:', err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--muted);">
        <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
        <div style="font-weight:700;">Guruhlarni yuklashda xatolik</div>
        <div style="font-size:13px;margin-top:6px;">${err.message}</div>
      </div>`;
  }
}

// ─── Load & render invites ───────────────────────────────────
async function loadInvites() {
  const grid = document.querySelector('.friends-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--muted);">
      <div style="font-size:32px;margin-bottom:12px;">✉️</div>
      <div style="font-weight:700;font-size:15px;">Taklifnomalar topilmadi</div>
      <div style="font-size:13px;margin-top:6px;">Sizda HTML/CSS orqali yuborilgan yangi taklifnomalar mavjud emas.</div>
    </div>`;
}

function updateStats(active = 0, topStreak = 0, invites = 0) {
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums[0]) statNums[0].textContent = active;
  if (statNums[1]) statNums[1].textContent = topStreak || '—';
  if (statNums[2]) statNums[2].textContent = invites;
}

// ─── Shimmer animation ───────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  
  /* Guruh dizaynlari */
  .group-card {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
  }
  .group-avatar-icon {
    width: 48px;
    height: 48px;
    background: #e0e7ff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  .group-desc {
    font-size: 13px;
    color: #4b5563;
    line-height: 1.5;
    background: #f9fafb;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #f3f4f6;
  }
  .group-members-list {
    margin-top: 5px;
  }
  .members-title {
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 10px;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .members-sub-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .group-member-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .group-member-item:last-child {
    border-bottom: none;
  }
  .member-avatar-mini {
    width: 30px;
    height: 30px;
    background: #7000ff;
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .member-info-mini {
    display: flex;
    flex-direction: column;
  }
  .member-name {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
  }
  .member-role {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }
`;
document.head.appendChild(style);

// ─── Tabs ────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tab = btn.dataset.tab;
    if (tab === 'friends') loadFriends();
    else if (tab === 'groups') loadGroups();
    else if (tab === 'invites') loadInvites();
  });
});

// ─── FAB — do'st qo'shish (Supabase orqali) ────────────────────
document.querySelector('.fab')?.addEventListener('click', async () => {
  const email = prompt("Do'stingiz email manzilinni kiriting:");
  if (!email || !email.trim()) return;

  try {
    // 1. Find profile by email
    const cleanEmail = email.trim().toLowerCase();
    const profiles = await supaFetch(`profiles?select=id,full_name&email=eq.${cleanEmail}`);

    if (!profiles.length) {
      alert("Bunday email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi!");
      return;
    }

    const friendProfile = profiles[0];

    if (friendProfile.id === currentUserId) {
      alert("O'zingizni do'st qilib qo'sha olmaysiz!");
      return;
    }

    // 2. Check if friendship already exists
    const existing = await supaFetch(`friendships?select=id&user_id=eq.${currentUserId}&friend_id=eq.${friendProfile.id}`);
    if (existing.length) {
      alert("Bu foydalanuvchi bilan allaqachon do'st bo'lgansiz!");
      return;
    }

    // 3. Insert friendship
    await supaFetch('friendships', {
      method: 'POST',
      body: JSON.stringify([{
        user_id: currentUserId,
        friend_id: friendProfile.id,
        status: 'active'
      }])
    });

    alert(`${friendProfile.full_name} do'stlar ro'yxatiga muvaffaqiyatli qo'shildi! 🎉`);
    
    // Refresh list if current tab is friends
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === 'friends') {
      loadFriends();
    }

  } catch(err) {
    console.error("Do'st qo'shishda xatolik:", err);
    alert("Xatolik yuz berdi: " + err.message);
  }
});

// ─── Mobile sidebar ──────────────────────────────────────────
const menuToggle    = document.getElementById('menuToggle');
const sidebar       = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar()  { sidebar?.classList.add('active'); sidebarOverlay?.classList.add('active'); menuToggle?.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar?.classList.remove('active'); sidebarOverlay?.classList.remove('active'); menuToggle?.classList.remove('active'); document.body.style.overflow = ''; }

menuToggle?.addEventListener('click', () => sidebar?.classList.contains('active') ? closeSidebar() : openSidebar());
sidebarOverlay?.addEventListener('click', closeSidebar);

// ─── Init ────────────────────────────────────────────────────
loadFriends();