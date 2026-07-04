document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('habitModalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');
  const nameInput = document.getElementById('habitName');

  // ---------- Modalni yopish ----------
  function closeModal() {
    overlay.classList.remove('active');
  }

  closeBtn && closeBtn.addEventListener('click', closeModal);
  overlay && overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
  });

  // ---------- Tab switch: Yangi qo'shish / Mavjudlarni sozlash ----------
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ---------- Tayyor shablonlar ----------
  const templateCards = document.querySelectorAll('.template-card');
  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      templateCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const templateName = card.dataset.template;
      if (nameInput) nameInput.value = templateName;

      // Shablonga mos emojini avtomatik belgilash
      const emojiMap = {
        'Suv ichish': '🌱',
        'Mutolaa': '💡',
        'Meditatsiya': '🧘'
      };
      const matchEmoji = emojiMap[templateName];
      if (matchEmoji) {
        const emojiOptions = document.querySelectorAll('.emoji-option');
        emojiOptions.forEach(opt => {
          opt.classList.toggle('selected', opt.dataset.emoji === matchEmoji);
        });
      }
    });
  });

  // ---------- Belgi (emoji) tanlash ----------
  const emojiOptions = document.querySelectorAll('.emoji-option');
  emojiOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      emojiOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // ---------- Kunlik maqsad slider ----------
  const goalSlider = document.getElementById('goalSlider');
  const goalValue = document.getElementById('goalValue');
  let currentUnit = 'vaqt';

  function updateGoalLabel() {
    if (!goalSlider || !goalValue) return;
    const val = goalSlider.value;
    goalValue.textContent = currentUnit === 'vaqt' ? `${val} daqiqa` : `${val} marta`;
  }

  goalSlider && goalSlider.addEventListener('input', updateGoalLabel);

  // ---------- Vaqt / Soni toggle ----------
  const unitBtns = document.querySelectorAll('.unit-btn');
  unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      unitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentUnit = btn.dataset.unit;
      updateGoalLabel();
    });
  });

  // ---------- Ko'nikmani yaratish ----------
  const createBtn = document.getElementById('createBtn');
  createBtn && createBtn.addEventListener('click', () => {
    if (!nameInput.value.trim()) {
      nameInput.focus();
      nameInput.style.borderColor = '#dc2626';
      setTimeout(() => { nameInput.style.borderColor = ''; }, 1500);
      return;
    }
    // Bu yerga Supabase'ga saqlash logikasi qo'shiladi
    console.log('Yaratilmoqda:', nameInput.value.trim());
  });
});