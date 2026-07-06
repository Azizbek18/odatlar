// =============================================
//  Streak.uz — Sozlamalar sahifasi — sozlamalar.js
//  Kengaytirilgan versiya: qo'shimcha funksiyalar bilan
// =============================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── Supabase Configuration ────────────────────────────────────────
  const SUPABASE_URL = 'https://pcdugrawrtezxmzagaqh.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oJnISbwOks8wEIh6gCAkqw_Npr5Q6qB';
  const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const LANG_KEY     = 'streak_lang';
  const NOTIF_KEY    = 'streak_notifications';
  const THEME_KEY    = 'streak_theme';
  const FONT_KEY     = 'streak_font_size';
  const PREFS_KEY    = 'streak_prefs';
  const ANIM_KEY     = 'streak_animations';
  const SOUND_KEY    = 'streak_sound';
  const APP_VERSION  = '1.0.0';

  let userProfile = null;

  // ─── 0. TARJIMALAR LUG'ATI ────────────────────────────────────────
  const translations = {
    uz: {
      nav_dashboard: "Boshqaruv", nav_rating: "Reyting", nav_profile: "Profil", nav_settings: "Sozlamalar",
      btn_add_habit: "Yangi odat", greeting: "Salom, {name}!", streak_suffix: "{n} kunlik streak",
      settings_title: "Sozlamalar", settings_subtitle: "Hisobingizni va ilovangizni sozlang",
      streak_label: "streak", level_label: "daraja", habits_label: "odatlar", btn_edit: "Tahrirlash",
      search_placeholder: "Sozlamalarni qidiring...",
      cat_account: "Akkaunt", cat_account_desc: "Shaxsiy ma'lumotlar va xavfsizlik",
      cat_appearance: "Til va mavzu", cat_appearance_desc: "Interfeys tilini va ko'rinishini sozlang",
      cat_preferences: "Bildirishnomalar va odatlar", cat_preferences_desc: "Eslatmalar va odat sozlamalari",
      cat_data: "Ma'lumotlar", cat_data_desc: "Eksport, import va keshni boshqarish",
      cat_support: "Yordam va qo'llab-quvvatlash", cat_support_desc: "Savollar, fikr-mulohaza va ma'lumot",
      cat_danger: "Xavf zonasi", cat_danger_desc: "Ehtiyot bo'ling — bu amallarni qaytarib bo'lmaydi",
      settings_personal: "Shaxsiy ma'lumotlar", settings_personal_desc: "Ism, bio va profil rasmi",
      settings_security: "Xavfsizlik", settings_security_desc: "Parol va ikki bosqichli tasdiqlash",
      settings_privacy: "Maxfiylik", settings_privacy_desc: "Profil ko'rinishi va ma'lumotlar",
      settings_language: "Til", settings_theme: "Mavzu", settings_font: "Shrift o'lchami",
      settings_notifications: "Bildirishnomalar", settings_notifications_desc: "Push, email va streak eslatmalari",
      settings_habits: "Odatlar sozlamalari", settings_habits_desc: "Eslatma vaqti va hafta boshi",
      settings_sound: "Ovozli bildirishnoma", settings_sound_desc: "Bildirishnomalar uchun ovoz",
      settings_animations: "Animatsiyalar", settings_animations_desc: "Silliq o'tishlar va effektlar",
      settings_export: "Ma'lumotlarni eksport qilish", settings_export_desc: "Barcha ma'lumotlarni yuklab olish",
      settings_import: "Ma'lumotlarni import qilish", settings_import_desc: "Zaxira nusxadan tiklash",
      settings_cache: "Keshni tozalash", settings_cache_desc: "Vaqtinchalik fayllarni o'chirish",
      settings_faq: "Tez-tez so'raladigan savollar", settings_faq_desc: "Eng ko'p beriladigan savollar",
      settings_feedback: "Fikr-mulohaza yuborish", settings_feedback_desc: "Taklif va shikoyatlaringiz",
      settings_contact: "Biz bilan bog'lanish", settings_contact_desc: "Qo'llab-quvvatlash xizmati",
      settings_about: "Ilova haqida", settings_about_desc: "Versiya, litsenziya va huquqlar",
      settings_logout: "Tizimdan chiqish", settings_logout_desc: "Hisobingizdan chiqing",
      settings_delete: "Akkauntni o'chirish", settings_delete_desc: "Barcha ma'lumotlar o'chiriladi",
      made_with: "Yaratildi", in_uzbekistan: "O'zbekistonda",
      // Modallar
      personal_modal_title: "Shaxsiy ma'lumotlar", personal_name_label: "Ism va familiya",
      personal_bio_label: "Bio", personal_avatar_label: "Profil rasmi",
      btn_cancel: "Bekor qilish", btn_save: "Saqlash", btn_update: "Yangilash", btn_close: "Yopish",
      notif_modal_title: "Bildirishnomalar", notif_push: "Push-bildirishnomalar",
      notif_email: "Email orqali xabarlar", notif_streak_reminder: "Kunlik streak eslatmasi",
      notif_sound: "Ovozli signal", notif_vibration: "Tebranish",
      security_modal_title: "Xavfsizlik", security_current_pw: "Joriy parol", security_new_pw: "Yangi parol",
      security_confirm_pw: "Yangi parolni tasdiqlang", security_2fa: "Ikki bosqichli autentifikatsiya",
      security_sessions: "Faol seanslar", security_logout_all: "Barcha seanslardan chiqish",
      privacy_modal_title: "Maxfiylik", privacy_profile_public: "Profilni ommaviy qilish",
      privacy_show_streak: "Streak'ni reytingda ko'rsatish", privacy_show_stats: "Statistikani ko'rsatish",
      privacy_allow_friends: "Do'stlar so'rovlari",
      lang_modal_title: "Tilni tanlang", lang_uz: "O'zbekcha", lang_ru: "Ruscha", lang_en: "Inglizcha",
      theme_modal_title: "Mavzuni tanlang", theme_light: "Ochiq", theme_dark: "Qorong'i", theme_auto: "Tizim",
      font_modal_title: "Shrift o'lchami", font_small: "Kichik", font_medium: "O'rtacha",
      font_large: "Katta", font_xlarge: "Juda katta",
      habits_modal_title: "Odatlar sozlamalari", habits_reminder_time: "Eslatma vaqti",
      habits_week_start: "Hafta boshi", habits_week_monday: "Dushanba", habits_week_sunday: "Yakshanba",
      habits_default_duration: "Standart davomiylik (kun)",
      export_modal_title: "Ma'lumotlarni eksport qilish", export_modal_desc: "Barcha ma'lumotlaringizni JSON formatida yuklab oling.",
      export_btn: "Yuklab olish", export_success: "Ma'lumotlar yuklab olindi!",
      import_modal_title: "Ma'lumotlarni import qilish", import_modal_desc: "Avval eksport qilingan JSON faylni tanlang.",
      import_btn: "Fayl tanlash", import_success: "Ma'lumotlar muvaffaqiyatli import qilindi!",
      import_error: "Faylni o'qib bo'lmadi. JSON formatida ekanligini tekshiring.",
      cache_modal_title: "Keshni tozalash", cache_modal_desc: "Vaqtinchalik fayllar o'chiriladi. Bu amal hisobingizga ta'sir qilmaydi.",
      cache_btn: "Tozalash", cache_success: "Kesh tozalandi!",
      faq_modal_title: "Tez-tez so'raladigan savollar",
      feedback_modal_title: "Fikr-mulohaza yuborish", feedback_label: "Xabaringiz", feedback_type: "Turi",
      feedback_bug: "Xato", feedback_suggestion: "Taklif", feedback_question: "Savol", feedback_praise: "Minnatdorlik",
      feedback_send: "Yuborish", feedback_success: "Fikr-mulohazangiz uchun rahmat!",
      contact_modal_title: "Biz bilan bog'lanish", contact_email: "Email", contact_phone: "Telefon",
      contact_telegram: "Telegram", contact_address: "Manzil",
      about_modal_title: "Ilova haqida", about_version: "Versiya", about_developer: "Dasturchi",
      about_license: "Litsenziya", about_terms: "Foydalanish shartlari", about_privacy_policy: "Maxfiylik siyosati",
      logout_modal_title: "Tizimdan chiqmoqchimisiz?",
      logout_modal_text: "Qayta kirish uchun login va parolingiz kerak bo'ladi.",
      btn_logout_cancel: "Bekor qilish", btn_logout_confirm: "Chiqish",
      delete_modal_title: "Akkauntni o'chirish",
      delete_modal_text: "Bu amal barcha ma'lumotlaringizni butunlay o'chiradi va uni qaytarib bo'lmaydi!",
      delete_modal_confirm: "O'chirishni tasdiqlang",
      delete_modal_type: "'O'CHIRISH' so'zini kiriting",
      btn_delete_cancel: "Bekor qilish", btn_delete_confirm: "Akkauntni o'chirish",
      // Toast xabarlar
      toast_profile_updated: "✅ Profil ma'lumotlari yangilandi!",
      toast_notif_saved: "🔔 Bildirishnoma sozlamalari saqlandi!",
      toast_password_updated: "🔒 Parol muvaffaqiyatli yangilandi!",
      toast_password_mismatch: "⚠️ Parollar mos kelmadi!",
      toast_password_short: "⚠️ Parol kamida 6 ta belgidan iborat bo'lishi kerak!",
      toast_password_required: "⚠️ Barcha maydonlarni to'ldiring!",
      toast_password_incorrect: "⚠️ Joriy parol noto'g'ri!",
      toast_name_required: "⚠️ Ismingizni kiriting!",
      toast_lang_changed: "🌍 Til o'zgartirildi!",
      toast_theme_changed: "🎨 Mavzu o'zgartirildi!",
      toast_font_changed: "🔤 Shrift o'lchami o'zgartirildi!",
      toast_privacy_saved: "🔒 Maxfiylik sozlamalari saqlandi!",
      toast_habits_saved: "⏰ Odat sozlamalari saqlandi!",
      toast_sound_on: "🔊 Ovoz yoqildi!", toast_sound_off: "🔇 Ovoz o'chirildi!",
      toast_animations_on: "✨ Animatsiyalar yoqildi!", toast_animations_off: " Animatsiyalar o'chirildi!",
      toast_logout_success: "👋 Tizimdan muvaffaqiyatli chiqdingiz!",
      toast_add_habit_redirect: "➕ Odat qo'shish uchun boshqaruv paneliga o'tasiz...",
      toast_delete_cancelled: "✅ O'chirish bekor qilindi.",
      toast_delete_text_mismatch: "⚠️ Tasdiqlash so'zi noto'g'ri kiritildi!",
      toast_export_done: "📦 Ma'lumotlar eksport qilindi!",
      toast_cache_cleared: "🧹 Kesh tozalandi!",
      toast_feedback_sent: "💬 Fikr-mulohaza yuborildi!",
      toast_data_saved: "✅ Sozlamalar saqlandi!",
      no_results_title: "Hech narsa topilmadi",
      no_results_text: "Boshqa kalit so'z bilan urinib ko'ring",
    },
    ru: {
      nav_dashboard: "Панель", nav_rating: "Рейтинг", nav_profile: "Профиль", nav_settings: "Настройки",
      btn_add_habit: "Новая привычка", greeting: "Привет, {name}!", streak_suffix: "Стрик: {n} дней",
      settings_title: "Настройки", settings_subtitle: "Настройте свой аккаунт и приложение",
      streak_label: "стрик", level_label: "уровень", habits_label: "привычки", btn_edit: "Изменить",
      search_placeholder: "Поиск настроек...",
      cat_account: "Аккаунт", cat_account_desc: "Личные данные и безопасность",
      cat_appearance: "Язык и тема", cat_appearance_desc: "Настройте язык и внешний вид",
      cat_preferences: "Уведомления и привычки", cat_preferences_desc: "Напоминания и настройки привычек",
      cat_data: "Данные", cat_data_desc: "Экспорт, импорт и кэш",
      cat_support: "Помощь и поддержка", cat_support_desc: "Вопросы, отзывы и информация",
      cat_danger: "Опасная зона", cat_danger_desc: "Осторожно — эти действия необратимы",
      settings_personal: "Личные данные", settings_personal_desc: "Имя, био и фото",
      settings_security: "Безопасность", settings_security_desc: "Пароль и 2FA",
      settings_privacy: "Конфиденциальность", settings_privacy_desc: "Видимость профиля",
      settings_language: "Язык", settings_theme: "Тема", settings_font: "Размер шрифта",
      settings_notifications: "Уведомления", settings_notifications_desc: "Push, email и напоминания",
      settings_habits: "Настройки привычек", settings_habits_desc: "Время напоминаний",
      settings_sound: "Звуковые уведомления", settings_sound_desc: "Звук для уведомлений",
      settings_animations: "Анимации", settings_animations_desc: "Плавные переходы",
      settings_export: "Экспорт данных", settings_export_desc: "Скачать все данные",
      settings_import: "Импорт данных", settings_import_desc: "Восстановить из резервной копии",
      settings_cache: "Очистить кэш", settings_cache_desc: "Удалить временные файлы",
      settings_faq: "Частые вопросы", settings_faq_desc: "Популярные вопросы",
      settings_feedback: "Отправить отзыв", settings_feedback_desc: "Предложения и жалобы",
      settings_contact: "Связаться с нами", settings_contact_desc: "Служба поддержки",
      settings_about: "О приложении", settings_about_desc: "Версия, лицензия",
      settings_logout: "Выйти", settings_logout_desc: "Выйти из аккаунта",
      settings_delete: "Удалить аккаунт", settings_delete_desc: "Все данные будут удалены",
      made_with: "Создано", in_uzbekistan: "в Узбекистане",
      personal_modal_title: "Личные данные", personal_name_label: "Имя и фамилия",
      personal_bio_label: "Био", personal_avatar_label: "Фото профиля",
      btn_cancel: "Отмена", btn_save: "Сохранить", btn_update: "Обновить", btn_close: "Закрыть",
      notif_modal_title: "Уведомления", notif_push: "Push-уведомления",
      notif_email: "Email-уведомления", notif_streak_reminder: "Напоминание о стрике",
      notif_sound: "Звуковой сигнал", notif_vibration: "Вибрация",
      security_modal_title: "Безопасность", security_current_pw: "Текущий пароль", security_new_pw: "Новый пароль",
      security_confirm_pw: "Подтвердите новый пароль", security_2fa: "Двухфакторная аутентификация",
      security_sessions: "Активные сеансы", security_logout_all: "Выйти из всех сеансов",
      privacy_modal_title: "Конфиденциальность", privacy_profile_public: "Публичный профиль",
      privacy_show_streak: "Показывать стрик в рейтинге", privacy_show_stats: "Показывать статистику",
      privacy_allow_friends: "Запросы друзей",
      lang_modal_title: "Выберите язык", lang_uz: "Узбекский", lang_ru: "Русский", lang_en: "Английский",
      theme_modal_title: "Выберите тему", theme_light: "Светлая", theme_dark: "Тёмная", theme_auto: "Системная",
      font_modal_title: "Размер шрифта", font_small: "Малый", font_medium: "Средний",
      font_large: "Большой", font_xlarge: "Очень большой",
      habits_modal_title: "Настройки привычек", habits_reminder_time: "Время напоминания",
      habits_week_start: "Начало недели", habits_week_monday: "Понедельник", habits_week_sunday: "Воскресенье",
      habits_default_duration: "Стандартная длительность (дней)",
      export_modal_title: "Экспорт данных", export_modal_desc: "Скачайте все данные в формате JSON.",
      export_btn: "Скачать", export_success: "Данные скачаны!",
      import_modal_title: "Импорт данных", import_modal_desc: "Выберите JSON файл из резервной копии.",
      import_btn: "Выбрать файл", import_success: "Данные успешно импортированы!",
      import_error: "Не удалось прочитать файл. Проверьте формат JSON.",
      cache_modal_title: "Очистить кэш", cache_modal_desc: "Временные файлы будут удалены. Это не повлияет на ваш аккаунт.",
      cache_btn: "Очистить", cache_success: "Кэш очищен!",
      faq_modal_title: "Частые вопросы",
      feedback_modal_title: "Отправить отзыв", feedback_label: "Ваше сообщение", feedback_type: "Тип",
      feedback_bug: "Ошибка", feedback_suggestion: "Предложение", feedback_question: "Вопрос", feedback_praise: "Благодарность",
      feedback_send: "Отправить", feedback_success: "Спасибо за ваш отзыв!",
      contact_modal_title: "Связаться с нами", contact_email: "Email", contact_phone: "Телефон",
      contact_telegram: "Telegram", contact_address: "Адрес",
      about_modal_title: "О приложении", about_version: "Версия", about_developer: "Разработчик",
      about_license: "Лицензия", about_terms: "Условия использования", about_privacy_policy: "Политика конфиденциальности",
      logout_modal_title: "Хотите выйти из системы?",
      logout_modal_text: "Для повторного входа понадобятся логин и пароль.",
      btn_logout_cancel: "Отмена", btn_logout_confirm: "Выйти",
      delete_modal_title: "Удаление аккаунта",
      delete_modal_text: "Это действие полностью удалит все ваши данные и не может быть отменено!",
      delete_modal_confirm: "Подтвердите удаление",
      delete_modal_type: "Введите слово 'УДАЛИТЬ'",
      btn_delete_cancel: "Отмена", btn_delete_confirm: "Удалить аккаунт",
      toast_profile_updated: "✅ Данные профиля обновлены!",
      toast_notif_saved: "🔔 Настройки уведомлений сохранены!",
      toast_password_updated: "🔒 Пароль успешно обновлён!",
      toast_password_mismatch: "⚠️ Пароли не совпадают!",
      toast_password_short: "⚠️ Пароль должен содержать минимум 6 символов!",
      toast_password_required: "⚠️ Заполните все поля!",
      toast_password_incorrect: "⚠️ Текущий пароль неверный!",
      toast_name_required: "⚠️ Введите имя!",
      toast_lang_changed: "🌍 Язык изменён!",
      toast_theme_changed: "🎨 Тема изменена!",
      toast_font_changed: "🔤 Размер шрифта изменён!",
      toast_privacy_saved: "🔒 Настройки конфиденциальности сохранены!",
      toast_habits_saved: "⏰ Настройки привычек сохранены!",
      toast_sound_on: "🔊 Звук включён!", toast_sound_off: "🔇 Звук выключен!",
      toast_animations_on: "✨ Анимации включены!", toast_animations_off: "Анимации выключены!",
      toast_logout_success: "👋 Вы успешно вышли из системы!",
      toast_add_habit_redirect: "➕ Переход на панель для добавления привычки...",
      toast_delete_cancelled: "✅ Удаление отменено.",
      toast_delete_text_mismatch: "⚠️ Подтверждающее слово введено неверно!",
      toast_export_done: "📦 Данные экспортированы!",
      toast_cache_cleared: "🧹 Кэш очищен!",
      toast_feedback_sent: "💬 Отзыв отправлен!",
      toast_data_saved: "✅ Настройки сохранены!",
      no_results_title: "Ничего не найдено",
      no_results_text: "Попробуйте другой запрос",
    },
    en: {
      nav_dashboard: "Dashboard", nav_rating: "Leaderboard", nav_profile: "Profile", nav_settings: "Settings",
      btn_add_habit: "New habit", greeting: "Hi, {name}!", streak_suffix: "{n}-day streak",
      settings_title: "Settings", settings_subtitle: "Manage your account and app preferences",
      streak_label: "streak", level_label: "level", habits_label: "habits", btn_edit: "Edit",
      search_placeholder: "Search settings...",
      cat_account: "Account", cat_account_desc: "Personal info and security",
      cat_appearance: "Language & theme", cat_appearance_desc: "Set language and appearance",
      cat_preferences: "Notifications & habits", cat_preferences_desc: "Reminders and habit preferences",
      cat_data: "Data", cat_data_desc: "Export, import and cache",
      cat_support: "Help & support", cat_support_desc: "Questions, feedback and info",
      cat_danger: "Danger zone", cat_danger_desc: "Careful — these actions are irreversible",
      settings_personal: "Personal info", settings_personal_desc: "Name, bio and avatar",
      settings_security: "Security", settings_security_desc: "Password and 2FA",
      settings_privacy: "Privacy", settings_privacy_desc: "Profile visibility",
      settings_language: "Language", settings_theme: "Theme", settings_font: "Font size",
      settings_notifications: "Notifications", settings_notifications_desc: "Push, email and reminders",
      settings_habits: "Habit preferences", settings_habits_desc: "Reminder time",
      settings_sound: "Sound notifications", settings_sound_desc: "Sound for notifications",
      settings_animations: "Animations", settings_animations_desc: "Smooth transitions",
      settings_export: "Export data", settings_export_desc: "Download all your data",
      settings_import: "Import data", settings_import_desc: "Restore from backup",
      settings_cache: "Clear cache", settings_cache_desc: "Remove temporary files",
      settings_faq: "FAQ", settings_faq_desc: "Frequently asked questions",
      settings_feedback: "Send feedback", settings_feedback_desc: "Suggestions and issues",
      settings_contact: "Contact us", settings_contact_desc: "Support service",
      settings_about: "About", settings_about_desc: "Version, license",
      settings_logout: "Log out", settings_logout_desc: "Sign out of your account",
      settings_delete: "Delete account", settings_delete_desc: "All data will be removed",
      made_with: "Made", in_uzbekistan: "in Uzbekistan",
      personal_modal_title: "Personal info", personal_name_label: "Full name",
      personal_bio_label: "Bio", personal_avatar_label: "Profile picture",
      btn_cancel: "Cancel", btn_save: "Save", btn_update: "Update", btn_close: "Close",
      notif_modal_title: "Notifications", notif_push: "Push notifications",
      notif_email: "Email notifications", notif_streak_reminder: "Daily streak reminder",
      notif_sound: "Sound alert", notif_vibration: "Vibration",
      security_modal_title: "Security", security_current_pw: "Current password", security_new_pw: "New password",
      security_confirm_pw: "Confirm new password", security_2fa: "Two-factor authentication",
      security_sessions: "Active sessions", security_logout_all: "Log out all sessions",
      privacy_modal_title: "Privacy", privacy_profile_public: "Public profile",
      privacy_show_streak: "Show streak in leaderboard", privacy_show_stats: "Show statistics",
      privacy_allow_friends: "Friend requests",
      lang_modal_title: "Choose language", lang_uz: "Uzbek", lang_ru: "Russian", lang_en: "English",
      theme_modal_title: "Choose theme", theme_light: "Light", theme_dark: "Dark", theme_auto: "System",
      font_modal_title: "Font size", font_small: "Small", font_medium: "Medium",
      font_large: "Large", font_xlarge: "Extra large",
      habits_modal_title: "Habit preferences", habits_reminder_time: "Reminder time",
      habits_week_start: "Week starts on", habits_week_monday: "Monday", habits_week_sunday: "Sunday",
      habits_default_duration: "Default duration (days)",
      export_modal_title: "Export data", export_modal_desc: "Download all your data as a JSON file.",
      export_btn: "Download", export_success: "Data downloaded!",
      import_modal_title: "Import data", import_modal_desc: "Select a previously exported JSON file.",
      import_btn: "Choose file", import_success: "Data imported successfully!",
      import_error: "Could not read file. Make sure it's valid JSON.",
      cache_modal_title: "Clear cache", cache_modal_desc: "Temporary files will be removed. This won't affect your account.",
      cache_btn: "Clear", cache_success: "Cache cleared!",
      faq_modal_title: "Frequently Asked Questions",
      feedback_modal_title: "Send feedback", feedback_label: "Your message", feedback_type: "Type",
      feedback_bug: "Bug", feedback_suggestion: "Suggestion", feedback_question: "Question", feedback_praise: "Praise",
      feedback_send: "Send", feedback_success: "Thanks for your feedback!",
      contact_modal_title: "Contact us", contact_email: "Email", contact_phone: "Phone",
      contact_telegram: "Telegram", contact_address: "Address",
      about_modal_title: "About", about_version: "Version", about_developer: "Developer",
      about_license: "License", about_terms: "Terms of service", about_privacy_policy: "Privacy policy",
      logout_modal_title: "Log out of your account?",
      logout_modal_text: "You'll need your login and password to sign back in.",
      btn_logout_cancel: "Cancel", btn_logout_confirm: "Log out",
      delete_modal_title: "Delete account",
      delete_modal_text: "This action will permanently delete all your data and cannot be undone!",
      delete_modal_confirm: "Confirm deletion",
      delete_modal_type: "Type 'DELETE' to confirm",
      btn_delete_cancel: "Cancel", btn_delete_confirm: "Delete account",
      toast_profile_updated: "✅ Profile updated successfully!",
      toast_notif_saved: "🔔 Notification settings saved!",
      toast_password_updated: "🔒 Password updated successfully!",
      toast_password_mismatch: "⚠️ Passwords do not match!",
      toast_password_short: "⚠️ Password must be at least 6 characters!",
      toast_password_required: "⚠️ Please fill in all fields!",
      toast_password_incorrect: "⚠️ Current password is incorrect!",
      toast_name_required: "⚠️ Please enter a name!",
      toast_lang_changed: "🌍 Language changed!",
      toast_theme_changed: "🎨 Theme changed!",
      toast_font_changed: "🔤 Font size changed!",
      toast_privacy_saved: "🔒 Privacy settings saved!",
      toast_habits_saved: "⏰ Habit settings saved!",
      toast_sound_on: "🔊 Sound enabled!", toast_sound_off: "🔇 Sound disabled!",
      toast_animations_on: "✨ Animations enabled!", toast_animations_off: "Animations disabled!",
      toast_logout_success: "👋 You've been logged out successfully!",
      toast_add_habit_redirect: "➕ Redirecting to dashboard to add a habit...",
      toast_delete_cancelled: "✅ Deletion cancelled.",
      toast_delete_text_mismatch: "⚠️ Confirmation word is incorrect!",
      toast_export_done: "📦 Data exported!",
      toast_cache_cleared: "🧹 Cache cleared!",
      toast_feedback_sent: "💬 Feedback sent!",
      toast_data_saved: "✅ Settings saved!",
      no_results_title: "No results found",
      no_results_text: "Try a different search term",
    },
  };

  let currentLang = localStorage.getItem(LANG_KEY) || 'uz';

  function t(key, vars = {}) {
    let str = (translations[currentLang] && translations[currentLang][key]) || translations.uz[key] || key;
    Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  }

  function isUsableAvatar(src) {
    const value = String(src || '').trim();
    if (!value) return false;
    return ![
      'Foydalanuvchi rasmi',
      'pravatar.cc',
      'avatar',
      'default',
      'placeholder'
    ].some(token => value.toLowerCase().includes(token.toLowerCase()));
  }

  function setSettingsAvatar(src) {
    const settingsAvatar = document.getElementById('settings-avatar');
    const settingsAvatarIcon = document.getElementById('settings-avatar-icon');
    if (!settingsAvatar) return;

    function showIcon() {
      settingsAvatar.hidden = true;
      settingsAvatar.removeAttribute('src');
      if (settingsAvatarIcon) settingsAvatarIcon.hidden = false;
    }

    if (!isUsableAvatar(src)) {
      showIcon();
      return;
    }

    settingsAvatar.onload = () => {
      settingsAvatar.hidden = false;
      if (settingsAvatarIcon) settingsAvatarIcon.hidden = true;
    };
    settingsAvatar.onerror = showIcon;
    settingsAvatar.src = src;
  }

  // ─── 1. TILNI QO'LLASH ────────────────────────────────────────────
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.custom === 'true') return;
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    const greetEl = document.getElementById('welcome-greeting');
    if (greetEl) greetEl.textContent = t('greeting', { name: greetEl.dataset.name });

    const streakEl = document.getElementById('sidebar-streak-text');
    if (streakEl) streakEl.textContent = t('streak_suffix', { n: streakEl.dataset.days });

    const langLabel = document.getElementById('settings-language-label');
    if (langLabel) {
      const names = { uz: t('lang_uz'), ru: t('lang_ru'), en: t('lang_en') };
      langLabel.textContent = names[lang];
    }

    document.title = `${t('settings_title')} | Streak.uz`;

    if (window.syncSidebarLanguage) window.syncSidebarLanguage(lang);
  }

  // ─── 1.5 MAVZU BOSHQARUVI ─────────────────────────────────────────
  function applyTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', actualTheme);
    const themeLabel = document.getElementById('settings-theme-label');
    if (themeLabel) {
      const labels = { light: t('theme_light'), dark: t('theme_dark'), auto: t('theme_auto') };
      themeLabel.textContent = labels[theme];
    }
    const quickBtn = document.getElementById('quick-theme-btn');
    if (quickBtn) {
      const icon = actualTheme === 'dark' ? 'fa-sun' : 'fa-moon';
      quickBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    }
  }

  function cycleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'auto';
    const next = { auto: 'light', light: 'dark', dark: 'auto' }[current];
    applyTheme(next);
    showToast(t('toast_theme_changed'), 'success');
  }

  // ─── 1.6 SHRIFT O'LCHAMI ──────────────────────────────────────────
  function applyFontSize(size) {
    localStorage.setItem(FONT_KEY, size);
    const sizes = { small: '14px', medium: '16px', large: '18px', xlarge: '20px' };
    document.documentElement.style.fontSize = sizes[size] || sizes.medium;
    const label = document.getElementById('settings-font-label');
    if (label) {
      const labels = { small: t('font_small'), medium: t('font_medium'), large: t('font_large'), xlarge: t('font_xlarge') };
      label.textContent = labels[size];
    }
  }

  // ─── 1.7 ANIMATSIYALAR ────────────────────────────────────────────
  function applyAnimations(enabled) {
    localStorage.setItem(ANIM_KEY, enabled ? 'on' : 'off');
    document.documentElement.setAttribute('data-animations', enabled ? 'on' : 'off');
  }

  // ─── 1.8 DYNAMIC USER PROFILE LOADING ─────────────────────────────
  async function loadUserProfile() {
    try {
      const { data: profile, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        userProfile = profile;
        const welcomeGreeting = document.getElementById('welcome-greeting');
        const sidebarStreakText = document.getElementById('sidebar-streak-text');
        const sidebarAvatar = document.querySelector('.user-welcome img');

        const firstName = (profile.full_name || '').split(' ')[0] || 'Foydalanuvchi';
        if (welcomeGreeting) {
          welcomeGreeting.textContent = t('greeting', { name: firstName });
          welcomeGreeting.dataset.name = firstName;
        }

        const streak = profile.streak !== undefined ? profile.streak : 0;
        if (sidebarStreakText) {
          sidebarStreakText.textContent = t('streak_suffix', { n: streak });
          sidebarStreakText.dataset.days = streak;
        }

        if (sidebarAvatar && profile.avatar_url) {
          sidebarAvatar.src = profile.avatar_url;
        }

        const settingsUserName = document.getElementById('settings-user-name');
        const settingsUserEmail = document.getElementById('settings-user-email');
        const settingsStreak = document.getElementById('settings-streak');
        const settingsLevel = document.getElementById('settings-level');
        const settingsHabits = document.getElementById('settings-habits');
        const settingsAvatar = document.getElementById('settings-avatar');

        if (settingsUserName) settingsUserName.textContent = profile.full_name || 'Foydalanuvchi';
        if (settingsUserEmail) settingsUserEmail.textContent = profile.email || '—';
        if (settingsStreak) settingsStreak.textContent = profile.streak || 0;
        if (settingsLevel) settingsLevel.textContent = profile.level || 1;
        if (settingsHabits) settingsHabits.textContent = profile.habits_count || 0;
        setSettingsAvatar(profile.avatar_url);
      }
    } catch (err) {
      console.error("Profile load failed:", err);
      const settingsUserName = document.getElementById('settings-user-name');
      const settingsUserEmail = document.getElementById('settings-user-email');
      const settingsStreak = document.getElementById('settings-streak');
      if (settingsUserName) settingsUserName.textContent = currentUser.full_name || 'Foydalanuvchi';
      if (settingsUserEmail) settingsUserEmail.textContent = currentUser.email || '—';
      if (settingsStreak) settingsStreak.textContent = currentUser.streak || 0;
    }
  }

  // ─── 2. SIDEBAR TOGGLE (mobil) ───────────────────────────────────
  const sidebar      = document.querySelector('.sidebar');
  const backdrop      = document.querySelector('.sidebar-backdrop');
  const menuToggle     = document.querySelector('.menu-toggle');
  const sidebarClose   = document.querySelector('.sidebar-close');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    backdrop?.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    backdrop?.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (menuToggle)   menuToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (backdrop)     backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) closeSidebar();
  });

  // ─── 3. MENYU — FAOL LINK ─────────────────────────────────────────
  const menuItems = document.querySelectorAll('.menu-list .menu-item a');
  menuItems.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') e.preventDefault();
      menuItems.forEach(l => l.closest('.menu-item').classList.remove('active'));
      this.closest('.menu-item').classList.add('active');
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  // ─── 4. "YANGI ODAT" TUGMASI ──────────────────────────────────────
  const addHabitBtn = document.querySelector('.btn-add-habit');
  if (addHabitBtn) {
    addHabitBtn.addEventListener('click', () => {
      showToast(t('toast_add_habit_redirect'), 'info');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
    });
  }

  // ─── 5. QIDIRUV FUNSIYASI ─────────────────────────────────────────
  const searchInput = document.getElementById('settings-search');
  const searchClear = document.getElementById('search-clear');
  const noResults = document.createElement('div');
  noResults.className = 'no-results creative-card';
  noResults.innerHTML = `
    <i class="fa-solid fa-magnifying-glass"></i>
    <h3>${t('no_results_title')}</h3>
    <p>${t('no_results_text')}</p>
  `;

  function handleSearch(query) {
    query = query.trim().toLowerCase();
    const categories = document.querySelectorAll('.settings-category');
    let anyVisible = false;

    if (!query) {
      categories.forEach(cat => {
        cat.style.display = '';
        cat.querySelectorAll('.settings-item').forEach(item => {
          item.style.display = '';
        });
      });
      noResults.classList.remove('visible');
      if (noResults.parentNode) noResults.remove();
      searchClear?.classList.remove('visible');
      return;
    }

    searchClear?.classList.add('visible');

    categories.forEach(cat => {
      let categoryHasVisible = false;
      cat.querySelectorAll('.settings-item').forEach(item => {
        const text = (item.textContent || '').toLowerCase();
        const keywords = (item.dataset.keywords || '').toLowerCase();
        const match = text.includes(query) || keywords.includes(query);
        item.style.display = match ? '' : 'none';
        if (match) categoryHasVisible = true;
      });
      cat.style.display = categoryHasVisible ? '' : 'none';
      if (categoryHasVisible) anyVisible = true;
    });

    if (!anyVisible) {
      const container = document.querySelector('.content-section');
      if (container && !noResults.parentNode) {
        container.appendChild(noResults);
      }
      noResults.classList.add('visible');
    } else {
      noResults.classList.remove('visible');
      if (noResults.parentNode) noResults.remove();
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      handleSearch('');
      searchInput.focus();
    });
  }

  // ─── 6. GENERIK MODAL YARATISH ────────────────────────────────────
  function buildModal(id, innerHtml, options = {}) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'app-modal-overlay';
    modal.innerHTML = `<div class="app-modal-box">${innerHtml}</div>`;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => modal.classList.add('open'));

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });

    return modal;
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 250);
  }

  // ─── 7. SHAXSIY MA'LUMOTLAR MODALI ───────────────────────────────
  function openPersonalModal() {
    const currentName = userProfile?.full_name || currentUser?.full_name || '';
    const currentBio  = userProfile?.bio || '';
    const currentAvatar = userProfile?.avatar_url || '';
    const hasCurrentAvatar = isUsableAvatar(currentAvatar);

    const modal = buildModal('personal-modal', `
      <div class="app-modal-header">
        <h3>${t('personal_modal_title')}</h3>
        <button class="app-modal-close" aria-label="close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="avatar-upload-wrap">
          <div id="avatar-preview-fallback" class="avatar-preview-fallback" ${hasCurrentAvatar ? 'hidden' : ''}>
            <i class="fa-solid fa-user"></i>
          </div>
          <img src="${hasCurrentAvatar ? currentAvatar : ''}" alt="avatar" id="avatar-preview" class="avatar-preview" ${hasCurrentAvatar ? '' : 'hidden'}>
          <label for="avatar-input" class="avatar-upload-btn">
            <i class="fa-solid fa-camera"></i>
          </label>
          <input type="file" id="avatar-input" accept="image/*" hidden>
        </div>
        <div class="form-group">
          <label>${t('personal_name_label')}</label>
          <input type="text" id="personal-name-input" value="${escapeHtml(currentName)}" maxlength="40">
        </div>
        <div class="form-group">
          <label>${t('personal_bio_label')}</label>
          <textarea id="personal-bio-input" rows="3" maxlength="160" placeholder="Bio...">${escapeHtml(currentBio)}</textarea>
          <div class="char-counter"><span id="bio-count">${currentBio.length}</span>/160</div>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save">${t('btn_save')}</button>
      </div>
    `);

    const bioInput = modal.querySelector('#personal-bio-input');
    const bioCount = modal.querySelector('#bio-count');
    bioInput.addEventListener('input', () => { bioCount.textContent = bioInput.value.length; });

    const avatarInput = modal.querySelector('#avatar-input');
    const avatarPreview = modal.querySelector('#avatar-preview');
    let newAvatarDataUrl = null;
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const fallback = modal.querySelector('#avatar-preview-fallback');
        if (fallback) fallback.hidden = true;
        avatarPreview.hidden = false;
        avatarPreview.src = ev.target.result;
        newAvatarDataUrl = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', async () => {
      const newName = document.getElementById('personal-name-input').value.trim();
      const newBio  = document.getElementById('personal-bio-input').value.trim();

      if (!newName) {
        showToast(t('toast_name_required'), 'warning');
        return;
      }

      try {
        const updateData = { full_name: newName, bio: newBio };
        if (newAvatarDataUrl) updateData.avatar_url = newAvatarDataUrl;

        const { error } = await sb
          .from('profiles')
          .update(updateData)
          .eq('id', currentUser.id);

        if (error) {
          await sb
            .from('profiles')
            .update({ full_name: newName })
            .eq('id', currentUser.id);
        }
      } catch (err) {
        console.error("Failed to update profile in Supabase:", err);
      }

      if (userProfile) {
        userProfile.full_name = newName;
        userProfile.bio = newBio;
        if (newAvatarDataUrl) userProfile.avatar_url = newAvatarDataUrl;
      }
      currentUser.full_name = newName;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      const greetEl = document.getElementById('welcome-greeting');
      if (greetEl) {
        const firstName = newName.split(' ')[0] || newName;
        greetEl.dataset.name = firstName;
        greetEl.textContent = t('greeting', { name: firstName });
      }

      const settingsUserName = document.getElementById('settings-user-name');
      if (settingsUserName) settingsUserName.textContent = newName;
      if (newAvatarDataUrl) setSettingsAvatar(newAvatarDataUrl);

      closeModal(modal);
      showToast(t('toast_profile_updated'), 'success');
    });
  }

  // ─── 8. BILDIRISHNOMALAR MODALI ──────────────────────────────────
  function openNotificationsModal() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'); } catch (e) { saved = {}; }
    const prefs = { push: true, email: false, streakReminder: true, sound: true, vibration: false, ...saved };

    const modal = buildModal('notif-modal', `
      <div class="app-modal-header">
        <h3>${t('notif_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-mobile-screen toggle-row-icon"></i>
            <span>${t('notif_push')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="notif-push" ${prefs.push ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-envelope toggle-row-icon"></i>
            <span>${t('notif_email')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="notif-email" ${prefs.email ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-fire toggle-row-icon"></i>
            <span>${t('notif_streak_reminder')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="notif-streak" ${prefs.streakReminder ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-volume-high toggle-row-icon"></i>
            <span>${t('notif_sound')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="notif-sound" ${prefs.sound ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-mobile-vibrate toggle-row-icon"></i>
            <span>${t('notif_vibration')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="notif-vibration" ${prefs.vibration ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save">${t('btn_save')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => {
      const newPrefs = {
        push: document.getElementById('notif-push').checked,
        email: document.getElementById('notif-email').checked,
        streakReminder: document.getElementById('notif-streak').checked,
        sound: document.getElementById('notif-sound').checked,
        vibration: document.getElementById('notif-vibration').checked,
      };
      localStorage.setItem(NOTIF_KEY, JSON.stringify(newPrefs));
      closeModal(modal);
      showToast(t('toast_notif_saved'), 'success');
    });
  }

  // ─── 9. XAVFSIZLIK MODALI ────────────────────────────────────────
  function openSecurityModal() {
    const modal = buildModal('security-modal', `
      <div class="app-modal-header">
        <h3>${t('security_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="form-group">
          <label><i class="fa-solid fa-lock"></i> ${t('security_current_pw')}</label>
          <input type="password" id="security-current-pw">
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-key"></i> ${t('security_new_pw')}</label>
          <input type="password" id="security-new-pw">
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-check-double"></i> ${t('security_confirm_pw')}</label>
          <input type="password" id="security-confirm-pw">
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-shield-halved toggle-row-icon"></i>
            <span>${t('security_2fa')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="security-2fa"><span class="slider"></span></label>
        </div>
        <div class="form-divider"></div>
        <div class="sessions-info">
          <i class="fa-solid fa-laptop"></i>
          <span>${t('security_sessions')}: 2</span>
          <button class="btn-text" id="logout-all-sessions">${t('security_logout_all')}</button>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save">${t('btn_update')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('#logout-all-sessions').addEventListener('click', () => {
      closeModal(modal);
      showToast('✅ ' + t('security_logout_all'), 'success');
    });
    modal.querySelector('.btn-modal-save').addEventListener('click', async () => {
      const current = document.getElementById('security-current-pw').value;
      const next    = document.getElementById('security-new-pw').value;
      const confirm = document.getElementById('security-confirm-pw').value;

      if (!current || !next || !confirm) { showToast(t('toast_password_required'), 'warning'); return; }
      if (next.length < 6) { showToast(t('toast_password_short'), 'warning'); return; }
      if (next !== confirm) { showToast(t('toast_password_mismatch'), 'warning'); return; }

      try {
        // Fetch current password from profiles
        const { data: profile, error: fetchError } = await sb
          .from('profiles')
          .select('password')
          .eq('id', currentUser.id)
          .single();

        if (fetchError) throw fetchError;
        if (profile.password !== current) {
          showToast(t('toast_password_incorrect'), 'warning');
          return;
        }

        // Update the password in profiles
        const { error: updateError } = await sb
          .from('profiles')
          .update({ password: next })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        closeModal(modal);
        showToast(t('toast_password_updated'), 'success');
      } catch (err) {
        console.error('Password update failed:', err);
        showToast('Parolni yangilashda xatolik yuz berdi', 'error');
      }
    });
  }

  // ─── 10. MAXFIYLIK MODALI ────────────────────────────────────────
  function openPrivacyModal() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (e) { saved = {}; }
    const prefs = { publicProfile: true, showStreak: true, showStats: true, allowFriends: true, ...saved };

    const modal = buildModal('privacy-modal', `
      <div class="app-modal-header">
        <h3>${t('privacy_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-globe toggle-row-icon"></i>
            <span>${t('privacy_profile_public')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="privacy-public" ${prefs.publicProfile ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-fire toggle-row-icon"></i>
            <span>${t('privacy_show_streak')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="privacy-streak" ${prefs.showStreak ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-chart-line toggle-row-icon"></i>
            <span>${t('privacy_show_stats')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="privacy-stats" ${prefs.showStats ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="toggle-row">
          <div class="toggle-text">
            <i class="fa-solid fa-user-plus toggle-row-icon"></i>
            <span>${t('privacy_allow_friends')}</span>
          </div>
          <label class="switch"><input type="checkbox" id="privacy-friends" ${prefs.allowFriends ? 'checked' : ''}><span class="slider"></span></label>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save">${t('btn_save')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => {
      const newPrefs = {
        publicProfile: document.getElementById('privacy-public').checked,
        showStreak: document.getElementById('privacy-streak').checked,
        showStats: document.getElementById('privacy-stats').checked,
        allowFriends: document.getElementById('privacy-friends').checked,
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
      closeModal(modal);
      showToast(t('toast_privacy_saved'), 'success');
    });
  }

  // ─── 11. TIL TANLASH MODALI ──────────────────────────────────────
  function openLanguageModal() {
    const modal = buildModal('lang-modal', `
      <div class="app-modal-header">
        <h3>${t('lang_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="lang-option-list">
          <button class="lang-option-btn" data-lang="uz">
            <span class="lang-flag">🇺🇿</span>
            <span>${t('lang_uz')}</span>
            ${currentLang === 'uz' ? '<i class="fa-solid fa-check lang-check"></i>' : ''}
          </button>
          <button class="lang-option-btn" data-lang="ru">
            <span class="lang-flag">🇷🇺</span>
            <span>${t('lang_ru')}</span>
            ${currentLang === 'ru' ? '<i class="fa-solid fa-check lang-check"></i>' : ''}
          </button>
          <button class="lang-option-btn" data-lang="en">
            <span class="lang-flag">🇬🇧</span>
            <span>${t('lang_en')}</span>
            ${currentLang === 'en' ? '<i class="fa-solid fa-check lang-check"></i>' : ''}
          </button>
        </div>
      </div>
    `);

    modal.querySelectorAll('.lang-option-btn').forEach(btn => {
      if (btn.dataset.lang === currentLang) btn.classList.add('active');
      btn.addEventListener('click', () => {
        applyLanguage(btn.dataset.lang);
        closeModal(modal);
        showToast(t('toast_lang_changed'), 'success');
      });
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
  }

  // ─── 12. MAVZU TANLASH MODALI ────────────────────────────────────
  function openThemeModal() {
    const currentTheme = localStorage.getItem(THEME_KEY) || 'auto';
    const modal = buildModal('theme-modal', `
      <div class="app-modal-header">
        <h3>${t('theme_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="theme-option-list">
          <button class="theme-option-btn" data-theme="light">
            <div class="theme-preview theme-preview-light">
              <div class="tp-bar"></div><div class="tp-bar"></div><div class="tp-bar"></div>
            </div>
            <span>${t('theme_light')}</span>
            <i class="fa-solid fa-check theme-check ${currentTheme === 'light' ? 'visible' : ''}"></i>
          </button>
          <button class="theme-option-btn" data-theme="dark">
            <div class="theme-preview theme-preview-dark">
              <div class="tp-bar"></div><div class="tp-bar"></div><div class="tp-bar"></div>
            </div>
            <span>${t('theme_dark')}</span>
            <i class="fa-solid fa-check theme-check ${currentTheme === 'dark' ? 'visible' : ''}"></i>
          </button>
          <button class="theme-option-btn" data-theme="auto">
            <div class="theme-preview theme-preview-auto">
              <div class="tp-half tp-half-light"></div>
              <div class="tp-half tp-half-dark"></div>
            </div>
            <span>${t('theme_auto')}</span>
            <i class="fa-solid fa-check theme-check ${currentTheme === 'auto' ? 'visible' : ''}"></i>
          </button>
        </div>
      </div>
    `);

    modal.querySelectorAll('.theme-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        closeModal(modal);
        showToast(t('toast_theme_changed'), 'success');
      });
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
  }

  // ─── 13. SHRIFT O'LCHAMI MODALI ──────────────────────────────────
  function openFontModal() {
    const currentSize = localStorage.getItem(FONT_KEY) || 'medium';
    const modal = buildModal('font-modal', `
      <div class="app-modal-header">
        <h3>${t('font_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="font-option-list">
          <button class="font-option-btn" data-size="small">
            <span style="font-size:12px">A</span>
            <span>${t('font_small')}</span>
            <i class="fa-solid fa-check font-check ${currentSize === 'small' ? 'visible' : ''}"></i>
          </button>
          <button class="font-option-btn" data-size="medium">
            <span style="font-size:16px">A</span>
            <span>${t('font_medium')}</span>
            <i class="fa-solid fa-check font-check ${currentSize === 'medium' ? 'visible' : ''}"></i>
          </button>
          <button class="font-option-btn" data-size="large">
            <span style="font-size:20px">A</span>
            <span>${t('font_large')}</span>
            <i class="fa-solid fa-check font-check ${currentSize === 'large' ? 'visible' : ''}"></i>
          </button>
          <button class="font-option-btn" data-size="xlarge">
            <span style="font-size:24px">A</span>
            <span>${t('font_xlarge')}</span>
            <i class="fa-solid fa-check font-check ${currentSize === 'xlarge' ? 'visible' : ''}"></i>
          </button>
        </div>
      </div>
    `);

    modal.querySelectorAll('.font-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyFontSize(btn.dataset.size);
        closeModal(modal);
        showToast(t('toast_font_changed'), 'success');
      });
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
  }

  // ─── 14. ODATLAR MODALI ──────────────────────────────────────────
  function openHabitsModal() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('streak_habits') || '{}'); } catch (e) { saved = {}; }
    const prefs = { reminderTime: '09:00', weekStart: 'monday', duration: 30, ...saved };

    const modal = buildModal('habits-modal', `
      <div class="app-modal-header">
        <h3>${t('habits_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="form-group">
          <label><i class="fa-solid fa-clock"></i> ${t('habits_reminder_time')}</label>
          <input type="time" id="habits-reminder-time" value="${prefs.reminderTime}">
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-calendar-day"></i> ${t('habits_week_start')}</label>
          <select id="habits-week-start" class="select-input">
            <option value="monday" ${prefs.weekStart === 'monday' ? 'selected' : ''}>${t('habits_week_monday')}</option>
            <option value="sunday" ${prefs.weekStart === 'sunday' ? 'selected' : ''}>${t('habits_week_sunday')}</option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-hourglass-half"></i> ${t('habits_default_duration')}</label>
          <input type="number" id="habits-duration" min="1" max="365" value="${prefs.duration}">
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save">${t('btn_save')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => {
      const newPrefs = {
        reminderTime: document.getElementById('habits-reminder-time').value,
        weekStart: document.getElementById('habits-week-start').value,
        duration: parseInt(document.getElementById('habits-duration').value, 10) || 30,
      };
      localStorage.setItem('streak_habits', JSON.stringify(newPrefs));
      closeModal(modal);
      showToast(t('toast_habits_saved'), 'success');
    });
  }

  // ─── 15. EKSPORT MODALI ──────────────────────────────────────────
  function openExportModal() {
    const modal = buildModal('export-modal', `
      <div class="app-modal-header">
        <h3>${t('export_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="info-banner">
          <i class="fa-solid fa-circle-info"></i>
          <p>${t('export_modal_desc')}</p>
        </div>
        <div class="export-info-list">
          <div class="export-info-item"><i class="fa-solid fa-user"></i> ${t('settings_personal')}</div>
          <div class="export-info-item"><i class="fa-solid fa-bell"></i> ${t('settings_notifications')}</div>
          <div class="export-info-item"><i class="fa-solid fa-fire"></i> ${t('streak_label')} & ${t('habits_label')}</div>
          <div class="export-info-item"><i class="fa-solid fa-shield-halved"></i> ${t('settings_security')}</div>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save"><i class="fa-solid fa-download"></i> ${t('export_btn')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => {
      const exportData = {
        user: currentUser,
        profile: userProfile,
        notifications: JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'),
        preferences: JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'),
        habits: JSON.parse(localStorage.getItem('streak_habits') || '{}'),
        language: localStorage.getItem(LANG_KEY),
        theme: localStorage.getItem(THEME_KEY),
        exportedAt: new Date().toISOString(),
        version: APP_VERSION,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `streak-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      closeModal(modal);
      showToast(t('toast_export_done'), 'success');
    });
  }

  // ─── 16. IMPORT MODALI ───────────────────────────────────────────
  function openImportModal() {
    const modal = buildModal('import-modal', `
      <div class="app-modal-header">
        <h3>${t('import_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="info-banner">
          <i class="fa-solid fa-circle-info"></i>
          <p>${t('import_modal_desc')}</p>
        </div>
        <label for="import-file-input" class="file-drop-zone">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <span>${t('import_btn')}</span>
          <small>JSON</small>
        </label>
        <input type="file" id="import-file-input" accept=".json,application/json" hidden>
        <div id="import-file-name" class="import-file-name"></div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save" id="import-confirm" disabled>${t('btn_save')}</button>
      </div>
    `);

    let importedData = null;
    const fileInput = modal.querySelector('#import-file-input');
    const fileName = modal.querySelector('#import-file-name');
    const confirmBtn = modal.querySelector('#import-confirm');

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      fileName.textContent = `📄 ${file.name}`;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          importedData = JSON.parse(ev.target.result);
          confirmBtn.disabled = false;
        } catch (err) {
          showToast(t('import_error'), 'error');
          confirmBtn.disabled = true;
        }
      };
      reader.readAsText(file);
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    confirmBtn.addEventListener('click', () => {
      if (!importedData) return;
      try {
        if (importedData.notifications) localStorage.setItem(NOTIF_KEY, JSON.stringify(importedData.notifications));
        if (importedData.preferences) localStorage.setItem(PREFS_KEY, JSON.stringify(importedData.preferences));
        if (importedData.habits) localStorage.setItem('streak_habits', JSON.stringify(importedData.habits));
        if (importedData.language) localStorage.setItem(LANG_KEY, importedData.language);
        if (importedData.theme) localStorage.setItem(THEME_KEY, importedData.theme);
        closeModal(modal);
        showToast(t('import_success'), 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast(t('import_error'), 'error');
      }
    });
  }

  // ─── 17. KESH TOZALASH MODALI ────────────────────────────────────
  function openCacheModal() {
    const modal = buildModal('cache-modal', `
      <div class="app-modal-header">
        <h3>${t('cache_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="info-banner info-banner-warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>${t('cache_modal_desc')}</p>
        </div>
        <div class="cache-info">
          <span>${t('settings_cache')}</span>
          <span id="cache-size-modal">${getCacheSize()}</span>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-danger"><i class="fa-solid fa-broom"></i> ${t('cache_btn')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-danger').addEventListener('click', () => {
      const keysToKeep = ['currentUser', LANG_KEY, NOTIF_KEY, THEME_KEY, FONT_KEY, PREFS_KEY, ANIM_KEY, SOUND_KEY, 'streak_habits'];
      Object.keys(localStorage).forEach(k => {
        if (!keysToKeep.includes(k)) localStorage.removeItem(k);
      });
      updateCacheSizeDisplay();
      closeModal(modal);
      showToast(t('toast_cache_cleared'), 'success');
    });
  }

  function getCacheSize() {
    let total = 0;
    const keysToKeep = ['currentUser', LANG_KEY, NOTIF_KEY, THEME_KEY, FONT_KEY, PREFS_KEY, ANIM_KEY, SOUND_KEY, 'streak_habits'];
    Object.keys(localStorage).forEach(k => {
      if (!keysToKeep.includes(k)) {
        total += (localStorage.getItem(k) || '').length;
      }
    });
    if (total < 1024) return total + ' B';
    if (total < 1024 * 1024) return (total / 1024).toFixed(1) + ' KB';
    return (total / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function updateCacheSizeDisplay() {
    const cacheSizeEl = document.getElementById('cache-size');
    if (cacheSizeEl) cacheSizeEl.textContent = getCacheSize();
  }

  // ─── 18. FAQ MODALI ──────────────────────────────────────────────
  function openFaqModal() {
    const faqItems = [
      { q: "Streak nima va qanday ishlaydi?", a: "Streak — bu sizning ketma-ket odatlaringizni bajarish kunlaringiz soni. Har kuni odatni bajarsangiz, streak oshadi. Bir kun o'tkazib yuborsangiz, streak qaytadan 0 dan boshlanadi." },
      { q: "Profilimni qanday tahrirlayman?", a: "Profil rasmi va ismingizni o'zgartirish uchun «Shaxsiy ma'lumotlar» bo'limiga o'ting. Avatar sifatida istalgan rasm yuklashingiz mumkin." },
      { q: "Reytingda qanday ko'tarilaman?", a: "Reytingda yuqoriga ko'tarilish uchun kunlik streak'laringizni oshiring va ko'proq odatlarni muvaffaqiyatli bajaring." },
      { q: "Akkauntimni o'chirganda nima bo'ladi?", a: "Akkauntni o'chirish barcha ma'lumotlaringizni butunlay o'chiradi: odatlar, streak, yutuqlar va profil ma'lumotlari. Bu amalni qaytarib bo'lmaydi." },
      { q: "Tilni qanday o'zgartirsam bo'ladi?", a: "Ilova 3 tilda ishlaydi: O'zbek, Rus va Ingliz. Tilni o'zgartirish uchun «Til» bo'limiga o'ting." },
      { q: "Mavzu (qorong'i/ochiq) qanday o'zgartiriladi?", a: "«Mavzu» bo'limiga kirib, Ochiq, Qorong'i yoki Tizim mavzusini tanlang. Tizim mavzusi telefoningiz sozlamasiga moslashadi." },
    ];

    const faqHtml = faqItems.map((item, i) => `
      <div class="faq-item">
        <button class="faq-question" data-idx="${i}">
          <span>${item.q}</span>
          <i class="fa-solid fa-chevron-down faq-chevron"></i>
        </button>
        <div class="faq-answer" data-idx="${i}">
          <p>${item.a}</p>
        </div>
      </div>
    `).join('');

    const modal = buildModal('faq-modal', `
      <div class="app-modal-header">
        <h3>${t('faq_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="faq-list">${faqHtml}</div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-save" style="flex:1;">${t('btn_close')}</button>
      </div>
    `);

    modal.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.idx;
        const answer = modal.querySelector(`.faq-answer[data-idx="${idx}"]`);
        const chevron = btn.querySelector('.faq-chevron');
        const isOpen = answer.classList.contains('open');
        modal.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
        modal.querySelectorAll('.faq-chevron').forEach(c => c.classList.remove('rotate'));
        if (!isOpen) {
          answer.classList.add('open');
          chevron.classList.add('rotate');
        }
      });
    });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => closeModal(modal));
  }

  // ─── 19. FEEDBACK MODALI ─────────────────────────────────────────
  function openFeedbackModal() {
    const modal = buildModal('feedback-modal', `
      <div class="app-modal-header">
        <h3>${t('feedback_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="form-group">
          <label><i class="fa-solid fa-tag"></i> ${t('feedback_type')}</label>
          <select id="feedback-type" class="select-input">
            <option value="bug">${t('feedback_bug')}</option>
            <option value="suggestion">${t('feedback_suggestion')}</option>
            <option value="question">${t('feedback_question')}</option>
            <option value="praise">${t('feedback_praise')}</option>
          </select>
        </div>
        <div class="form-group">
          <label><i class="fa-solid fa-comment"></i> ${t('feedback_label')}</label>
          <textarea id="feedback-message" rows="5" maxlength="500" placeholder="..."></textarea>
          <div class="char-counter"><span id="feedback-count">0</span>/500</div>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-cancel">${t('btn_cancel')}</button>
        <button class="btn-modal-save"><i class="fa-solid fa-paper-plane"></i> ${t('feedback_send')}</button>
      </div>
    `);

    const msgInput = modal.querySelector('#feedback-message');
    const counter = modal.querySelector('#feedback-count');
    msgInput.addEventListener('input', () => { counter.textContent = msgInput.value.length; });

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => {
      const msg = msgInput.value.trim();
      if (!msg) { showToast(t('toast_password_required'), 'warning'); return; }
      closeModal(modal);
      showToast(t('toast_feedback_sent'), 'success');
    });
  }

  // ─── 20. CONTACT MODALI ──────────────────────────────────────────
  function openContactModal() {
    const modal = buildModal('contact-modal', `
      <div class="app-modal-header">
        <h3>${t('contact_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="contact-list">
          <a href="mailto:support@streak.uz" class="contact-item">
            <div class="contact-icon si-blue"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <strong>${t('contact_email')}</strong>
              <span>support@streak.uz</span>
            </div>
            <i class="fa-solid fa-chevron-right chevron"></i>
          </a>
          <a href="tel:+998901234567" class="contact-item">
            <div class="contact-icon si-green"><i class="fa-solid fa-phone"></i></div>
            <div>
              <strong>${t('contact_phone')}</strong>
              <span>+998 90 123 45 67</span>
            </div>
            <i class="fa-solid fa-chevron-right chevron"></i>
          </a>
          <a href="https://t.me/streakuz" target="_blank" class="contact-item">
            <div class="contact-icon si-cyan"><i class="fa-brands fa-telegram"></i></div>
            <div>
              <strong>${t('contact_telegram')}</strong>
              <span>@streakuz</span>
            </div>
            <i class="fa-solid fa-chevron-right chevron"></i>
          </a>
          <div class="contact-item contact-item-static">
            <div class="contact-icon si-orange"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <strong>${t('contact_address')}</strong>
              <span>Toshkent, O'zbekiston</span>
            </div>
          </div>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-save" style="flex:1;">${t('btn_close')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => closeModal(modal));
  }

  // ─── 21. ABOUT MODALI ────────────────────────────────────────────
  function openAboutModal() {
    const modal = buildModal('about-modal', `
      <div class="app-modal-header">
        <h3>${t('about_modal_title')}</h3>
        <button class="app-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="app-modal-body">
        <div class="about-logo">
          <div class="about-logo-icon"><i class="fa-solid fa-bolt"></i></div>
          <h2>Streak.uz</h2>
          <p class="about-version">Version ${APP_VERSION}</p>
        </div>
        <p class="about-tagline">Odatlaringizni kuzating, o'zingizni rivojlantiring!</p>
        <div class="about-info-list">
          <div class="about-info-item">
            <span>${t('about_version')}</span>
            <strong>${APP_VERSION}</strong>
          </div>
          <div class="about-info-item">
            <span>${t('about_developer')}</span>
            <strong>Streak Team</strong>
          </div>
          <div class="about-info-item">
            <span>${t('about_license')}</span>
            <strong>MIT</strong>
          </div>
        </div>
        <div class="about-links">
          <a href="#" class="about-link"><i class="fa-solid fa-file-lines"></i> ${t('about_terms')}</a>
          <a href="#" class="about-link"><i class="fa-solid fa-shield-halved"></i> ${t('about_privacy_policy')}</a>
        </div>
      </div>
      <div class="app-modal-footer">
        <button class="btn-modal-save" style="flex:1;">${t('btn_close')}</button>
      </div>
    `);

    modal.querySelector('.app-modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-save').addEventListener('click', () => closeModal(modal));
  }

  // ─── 22. TIZIMDAN CHIQISH MODALI ─────────────────────────────────
  function showLogoutConfirm() {
    const modal = buildModal('logout-modal', `
      <div class="logout-modal-icon"><i class="fa-solid fa-right-from-bracket"></i></div>
      <h3 style="text-align:center;">${t('logout_modal_title')}</h3>
      <p style="text-align:center;">${t('logout_modal_text')}</p>
      <div class="app-modal-footer" style="margin-top:22px;">
        <button class="btn-modal-cancel">${t('btn_logout_cancel')}</button>
        <button class="btn-modal-danger">${t('btn_logout_confirm')}</button>
      </div>
    `);

    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.btn-modal-danger').addEventListener('click', () => {
      closeModal(modal);
      localStorage.removeItem('currentUser');
      showToast(t('toast_logout_success'), 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 900);
    });
  }

  // ─── 23. AKKAUNTNI O'CHIRISH MODALI ──────────────────────────────
  function showDeleteConfirm() {
    const modal = buildModal('delete-modal', `
      <div class="logout-modal-icon" style="background: rgba(239,68,68,0.15); color: #ef4444;">
        <i class="fa-solid fa-user-xmark"></i>
      </div>
      <h3 style="text-align:center; color:#ef4444;">${t('delete_modal_title')}</h3>
      <p style="text-align:center;">${t('delete_modal_text')}</p>
      <div class="form-group" style="margin-top:18px;">
        <label style="text-align:center; display:block;">${t('delete_modal_type')}</label>
        <input type="text" id="delete-confirm-input" placeholder="O'CHIRISH" style="text-align:center; font-weight:600; letter-spacing:2px;">
      </div>
      <div class="app-modal-footer" style="margin-top:18px;">
        <button class="btn-modal-cancel">${t('btn_delete_cancel')}</button>
        <button class="btn-modal-danger" id="delete-confirm-btn" disabled>${t('btn_delete_confirm')}</button>
      </div>
    `);

    const input = modal.querySelector('#delete-confirm-input');
    const confirmBtn = modal.querySelector('#delete-confirm-btn');
    const confirmWord = currentLang === 'uz' ? "O'CHIRISH" : currentLang === 'ru' ? "УДАЛИТЬ" : "DELETE";

    input.addEventListener('input', () => {
      confirmBtn.disabled = input.value !== confirmWord;
    });

    modal.querySelector('.btn-modal-cancel').addEventListener('click', () => {
      closeModal(modal);
      showToast(t('toast_delete_cancelled'), 'info');
    });
    confirmBtn.addEventListener('click', async () => {
      try {
        await sb.from('profiles').delete().eq('id', currentUser.id);
      } catch (err) {
        console.warn('Supabase delete:', err);
      }
      localStorage.clear();
      closeModal(modal);
      showToast('⚠️ Akkaunt o\'chirildi', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    });
  }

  // ─── 24. SOZLAMALAR RO'YXATI — TUGMALARGA ULASH ──────────────────
  document.querySelectorAll('.settings-item').forEach(item => {
    if (item.classList.contains('settings-item-inline')) return;
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switch (item.dataset.setting) {
        case 'personal':       openPersonalModal(); break;
        case 'notifications':  openNotificationsModal(); break;
        case 'security':       openSecurityModal(); break;
        case 'privacy':        openPrivacyModal(); break;
        case 'language':       openLanguageModal(); break;
        case 'theme':          openThemeModal(); break;
        case 'font':           openFontModal(); break;
        case 'habits':         openHabitsModal(); break;
        case 'export':         openExportModal(); break;
        case 'import':         openImportModal(); break;
        case 'cache':          openCacheModal(); break;
        case 'faq':            openFaqModal(); break;
        case 'feedback':       openFeedbackModal(); break;
        case 'contact':        openContactModal(); break;
        case 'about':          openAboutModal(); break;
        case 'logout':         showLogoutConfirm(); break;
        case 'delete':         showDeleteConfirm(); break;
      }
    });
  });

  // Profile card tahrirlash tugmasi
  document.getElementById('btn-edit-profile')?.addEventListener('click', openPersonalModal);

  // Tezkor mavzu o'zgartirish tugmasi
  document.getElementById('quick-theme-btn')?.addEventListener('click', cycleTheme);

  // Inline toggles
  const soundToggle = document.getElementById('toggle-sound');
  if (soundToggle) {
    soundToggle.checked = localStorage.getItem(SOUND_KEY) === 'on';
    soundToggle.addEventListener('change', () => {
      localStorage.setItem(SOUND_KEY, soundToggle.checked ? 'on' : 'off');
      showToast(soundToggle.checked ? t('toast_sound_on') : t('toast_sound_off'), 'info');
    });
  }

  const animToggle = document.getElementById('toggle-animations');
  if (animToggle) {
    const animState = localStorage.getItem(ANIM_KEY) || 'on';
    animToggle.checked = animState === 'on';
    animToggle.addEventListener('change', () => {
      applyAnimations(animToggle.checked);
      showToast(animToggle.checked ? t('toast_animations_on') : t('toast_animations_off'), 'info');
    });
  }

  // ─── 25. TOAST BILDIRISHNOMA ─────────────────────────────────────
  function showToast(message, type = 'info', duration = 3000) {
    if (typeof Toastify !== 'undefined') {
      const bgMap = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        error:   'linear-gradient(135deg, #ef4444, #dc2626)',
        info:    'linear-gradient(135deg, #6366f1, #4f46e5)',
      };
      Toastify({
        text: message,
        duration,
        gravity: 'top',
        position: 'right',
        style: { background: bgMap[type] || bgMap.info, borderRadius: '12px', fontFamily: '"Poppins", "Comic Sans MS", cursive', color: '#fff', fontWeight: '500' },
        stopOnFocus: true,
      }).showToast();
    } else {
      showCustomToast(message, type, duration);
    }
  }

  function showCustomToast(message, type, duration) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; top: 24px; right: 24px;
        display: flex; flex-direction: column; gap: 10px;
        z-index: 9999; pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const colorMap = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#6366f1' };

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colorMap[type] || colorMap.info};
      color: #fff; padding: 12px 20px;
      border-radius: 12px; font-family: "Poppins", "Comic Sans MS", cursive;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      max-width: 320px; pointer-events: all;
      transform: translateX(120%); transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  // ─── 26. YORDAMCHI: HTML ESCAPE ──────────────────────────────────
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── 27. UMUMIY MODAL/TOGGLE STILLARI ────────────────────────────
  function injectAppStyles() {
    if (document.getElementById('app-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'app-modal-styles';
    style.textContent = `
      .sidebar { height: 100vh !important; min-height: 100vh; }

      .app-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1100;
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
        opacity: 0; transition: opacity 0.25s ease;
      }
      .app-modal-overlay.open { opacity: 1; }

      .app-modal-box {
        background: var(--card-bg, #ffffff);
        border-radius: 24px;
        width: 100%; max-width: 460px;
        padding: 28px;
        transform: scale(0.92) translateY(20px);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 25px 70px rgba(0,0,0,0.35);
        max-height: 90vh; overflow-y: auto;
        color: var(--text-main);
        border: 1px solid var(--card-border);
      }
      .app-modal-overlay.open .app-modal-box { transform: scale(1) translateY(0); }

      .app-modal-box::-webkit-scrollbar { width: 6px; }
      .app-modal-box::-webkit-scrollbar-thumb { background: var(--text-muted); border-radius: 10px; }

      .app-modal-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 22px;
      }
      .app-modal-header h3 {
        font-size: 18px; font-weight: 700;
        color: var(--text-main);
      }
      .app-modal-close {
        background: var(--hover-bg); border: none; cursor: pointer;
        color: var(--text-muted);
        font-size: 14px; width: 34px; height: 34px;
        border-radius: 10px; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      .app-modal-close:hover {
        background: var(--primary-color); color: white; transform: rotate(90deg);
      }

      .app-modal-body .form-group { margin-bottom: 18px; }
      .app-modal-body label {
        display: block; font-size: 12px; font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;
      }
      .app-modal-body label i { color: var(--primary-color); margin-right: 4px; }

      .app-modal-body input[type="text"],
      .app-modal-body input[type="password"],
      .app-modal-body input[type="time"],
      .app-modal-body input[type="number"],
      .app-modal-body textarea,
      .app-modal-body .select-input {
        width: 100%; padding: 12px 16px;
        background: var(--hover-bg);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        color: var(--text-main);
        font-family: inherit;
        font-size: 14px;
        outline: none; transition: all 0.2s;
        box-sizing: border-box; resize: vertical;
      }
      .app-modal-body input:focus, .app-modal-body textarea:focus, .app-modal-body .select-input:focus {
        border-color: var(--primary-color);
        background: var(--card-bg);
        box-shadow: 0 0 0 4px rgba(112, 0, 255, 0.1);
      }
      .app-modal-body .select-input { cursor: pointer; }

      .char-counter {
        text-align: right; font-size: 11px;
        color: var(--text-muted); margin-top: 4px;
      }

      .toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 0;
        color: var(--text-main);
        font-size: 14px; font-weight: 500;
      }
      .toggle-text { display: flex; align-items: center; gap: 10px; }
      .toggle-row-icon {
        width: 32px; height: 32px; border-radius: 10px;
        background: var(--hover-bg);
        display: flex; align-items: center; justify-content: center;
        color: var(--primary-color); font-size: 13px;
      }

      .switch { position: relative; display: inline-block; width: 46px; height: 26px; flex-shrink: 0; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .switch .slider {
        position: absolute; cursor: pointer; inset: 0;
        background-color: #d1d5e0;
        border-radius: 26px; transition: 0.25s;
      }
      .switch .slider:before {
        position: absolute; content: ""; height: 20px; width: 20px;
        left: 3px; bottom: 3px; background-color: #fff;
        border-radius: 50%; transition: 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
      .switch input:checked + .slider { background: linear-gradient(135deg, var(--primary-color), #9d6bff); }
      .switch input:checked + .slider:before { transform: translateX(20px); }

      /* Avatar upload */
      .avatar-upload-wrap {
        position: relative; width: 90px; height: 90px; margin: 0 auto 18px;
      }
      .avatar-preview {
        width: 90px; height: 90px; border-radius: 50%; object-fit: cover;
        border: 3px solid var(--card-bg);
        box-shadow: 0 6px 16px rgba(112,0,255,0.25);
      }
      .avatar-preview-fallback {
        width: 90px; height: 90px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, #7000ff, #9d6bff);
        color: white; font-size: 38px;
        border: 3px solid var(--card-bg);
        box-shadow: 0 6px 16px rgba(112,0,255,0.25);
      }
      .avatar-preview[hidden],
      .avatar-preview-fallback[hidden] { display: none !important; }
      .avatar-upload-btn {
        position: absolute; bottom: 0; right: 0;
        width: 30px; height: 30px; border-radius: 50%;
        background: var(--primary-color); color: white;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 12px;
        border: 3px solid var(--card-bg);
        transition: transform 0.2s;
      }
      .avatar-upload-btn:hover { transform: scale(1.1); }

      /* Language options */
      .lang-option-list, .theme-option-list, .font-option-list { display: flex; flex-direction: column; gap: 10px; }
      .lang-option-btn, .theme-option-btn, .font-option-btn {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 18px; border-radius: 14px;
        background: var(--hover-bg);
        border: 1px solid var(--card-border);
        color: var(--text-main);
        font-family: inherit; font-size: 14px; font-weight: 500;
        cursor: pointer; text-align: left; transition: all 0.2s;
      }
      .lang-option-btn:hover, .theme-option-btn:hover, .font-option-btn:hover {
        background: var(--primary-light); border-color: var(--primary-color);
        transform: translateX(3px);
      }
      .lang-flag { font-size: 22px; }
      .lang-check, .theme-check, .font-check {
        margin-left: auto; color: var(--primary-color);
        opacity: 0; transition: opacity 0.2s;
      }
      .lang-check { opacity: 1; }
      .theme-check.visible, .font-check.visible { opacity: 1; }

      /* Theme preview */
      .theme-preview {
        width: 40px; height: 28px; border-radius: 8px;
        display: flex; flex-direction: column; gap: 2px; padding: 4px;
        border: 1px solid var(--card-border);
      }
      .theme-preview-light { background: #f8f9fa; }
      .theme-preview-light .tp-bar { background: #7000ff; height: 4px; border-radius: 2px; }
      .theme-preview-dark { background: #1a1a2e; }
      .theme-preview-dark .tp-bar { background: #9d6bff; height: 4px; border-radius: 2px; }
      .theme-preview-auto { background: linear-gradient(90deg, #f8f9fa 50%, #1a1a2e 50%); }
      .tp-half { width: 100%; height: 100%; }

      /* Font size option */
      .font-option-btn span:first-child {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        background: var(--card-bg); border-radius: 8px;
        border: 1px solid var(--card-border);
        font-weight: 700; color: var(--primary-color);
      }

      /* Form divider */
      .form-divider { height: 1px; background: var(--divider-color); margin: 16px 0; }

      /* Sessions info */
      .sessions-info {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; background: var(--hover-bg); border-radius: 12px;
        font-size: 13px; color: var(--text-main);
      }
      .sessions-info i { color: var(--primary-color); }
      .btn-text {
        margin-left: auto; background: none; border: none;
        color: var(--primary-color); cursor: pointer; font-weight: 600;
        font-family: inherit; font-size: 13px;
      }
      .btn-text:hover { text-decoration: underline; }

      /* Info banner */
      .info-banner {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 14px 16px; background: rgba(112,0,255,0.06);
        border-radius: 12px; margin-bottom: 18px;
        font-size: 13px; color: var(--text-main);
      }
      .info-banner i { color: var(--primary-color); font-size: 16px; margin-top: 2px; }
      .info-banner-warning { background: rgba(245, 158, 11, 0.1); }
      .info-banner-warning i { color: #f59e0b; }
      .info-banner p { margin: 0; line-height: 1.5; }

      /* Export info list */
      .export-info-list { display: flex; flex-direction: column; gap: 8px; }
      .export-info-item {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; background: var(--hover-bg);
        border-radius: 10px; font-size: 13px; color: var(--text-main);
      }
      .export-info-item i { color: var(--primary-color); }

      /* File drop zone */
      .file-drop-zone {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        padding: 30px 20px; border: 2px dashed var(--card-border);
        border-radius: 16px; background: var(--hover-bg);
        cursor: pointer; transition: all 0.2s; text-align: center;
      }
      .file-drop-zone:hover {
        border-color: var(--primary-color);
        background: var(--primary-light);
      }
      .file-drop-zone i { font-size: 28px; color: var(--primary-color); }
      .file-drop-zone span { font-weight: 600; color: var(--text-main); font-size: 14px; }
      .file-drop-zone small { color: var(--text-muted); font-size: 12px; }
      .import-file-name {
        margin-top: 12px; text-align: center;
        font-size: 13px; color: var(--text-muted);
      }

      /* Cache info */
      .cache-info {
        display: flex; justify-content: space-between;
        padding: 14px 16px; background: var(--hover-bg);
        border-radius: 12px; font-size: 14px; font-weight: 600;
      }

      /* FAQ */
      .faq-list { display: flex; flex-direction: column; gap: 8px; }
      .faq-item {
        border: 1px solid var(--card-border);
        border-radius: 12px; overflow: hidden;
        background: var(--hover-bg);
      }
      .faq-question {
        width: 100%; padding: 14px 16px;
        display: flex; justify-content: space-between; align-items: center;
        background: none; border: none; cursor: pointer;
        font-family: inherit; font-size: 14px; font-weight: 600;
        color: var(--text-main); text-align: left;
      }
      .faq-chevron {
        transition: transform 0.3s ease; color: var(--primary-color);
      }
      .faq-chevron.rotate { transform: rotate(180deg); }
      .faq-answer {
        max-height: 0; overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
        padding: 0 16px;
      }
      .faq-answer.open {
        max-height: 200px; padding: 0 16px 14px;
      }
      .faq-answer p {
        font-size: 13px; color: var(--text-muted);
        line-height: 1.6; margin: 0;
      }

      /* Contact */
      .contact-list { display: flex; flex-direction: column; gap: 8px; }
      .contact-item {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 16px; background: var(--hover-bg);
        border-radius: 14px; text-decoration: none;
        color: var(--text-main); transition: all 0.2s;
      }
      .contact-item:hover { transform: translateX(3px); background: var(--primary-light); }
      .contact-item-static { cursor: default; }
      .contact-item-static:hover { transform: none; background: var(--hover-bg); }
      .contact-item div:nth-child(2) { flex: 1; }
      .contact-item strong { display: block; font-size: 13px; margin-bottom: 2px; }
      .contact-item span { font-size: 12px; color: var(--text-muted); }
      .contact-icon {
        width: 40px; height: 40px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; flex-shrink: 0;
      }

      /* About */
      .about-logo {
        display: flex; flex-direction: column; align-items: center;
        margin-bottom: 14px;
      }
      .about-logo-icon {
        width: 70px; height: 70px; border-radius: 20px;
        background: linear-gradient(135deg, var(--primary-color), #ff5fa2);
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 30px;
        box-shadow: 0 10px 24px rgba(112,0,255,0.35);
        margin-bottom: 12px;
      }
      .about-logo h2 { font-size: 24px; color: var(--text-main); margin-bottom: 4px; }
      .about-version { color: var(--text-muted); font-size: 13px; }
      .about-tagline {
        text-align: center; color: var(--text-muted);
        font-size: 13px; margin-bottom: 18px;
      }
      .about-info-list {
        display: flex; flex-direction: column; gap: 6px;
        margin-bottom: 16px;
      }
      .about-info-item {
        display: flex; justify-content: space-between;
        padding: 12px 14px; background: var(--hover-bg);
        border-radius: 10px; font-size: 13px;
      }
      .about-info-item span { color: var(--text-muted); }
      .about-info-item strong { color: var(--text-main); }
      .about-links {
        display: flex; gap: 8px;
      }
      .about-link {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
        padding: 12px; background: var(--hover-bg);
        border-radius: 10px; text-decoration: none;
        color: var(--text-main); font-size: 12px; font-weight: 500;
        transition: all 0.2s;
      }
      .about-link:hover { background: var(--primary-light); color: var(--primary-color); }

      .app-modal-footer {
        display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;
      }
      .btn-modal-cancel, .btn-modal-save, .btn-modal-danger {
        padding: 12px 24px; border-radius: 12px; border: none;
        font-family: inherit; font-size: 14px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
      }
      .btn-modal-cancel {
        background: var(--hover-bg); color: var(--text-muted); flex: 1;
      }
      .btn-modal-cancel:hover { background: var(--card-border); }
      .btn-modal-save {
        background: linear-gradient(135deg, var(--primary-color), #9d6bff);
        color: #fff; flex: 1;
        box-shadow: 0 6px 16px rgba(112,0,255,0.3);
      }
      .btn-modal-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(112,0,255,0.4); }
      .btn-modal-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .btn-modal-save:active { transform: scale(0.97); }
      .btn-modal-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; flex: 1;
        box-shadow: 0 6px 16px rgba(239,68,68,0.3);
      }
      .btn-modal-danger:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,0.4); }
      .btn-modal-danger:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .btn-modal-danger:active { transform: scale(0.97); }

      .logout-modal-icon {
        width: 64px; height: 64px; border-radius: 50%;
        background: rgba(239,68,68,0.15); color: #ef4444;
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; margin: 0 auto 16px;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── 28. KARTOCHKALAR — KIRISH ANIMATSIYASI ──────────────────────
  document.querySelectorAll('.creative-card').forEach((card, idx) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 80 * idx);
  });

  // ─── ISHGA TUSHIRISH ──────────────────────────────────────────────
  injectAppStyles();

  // Mavzu va font o'lchamini tiklash
  const savedTheme = localStorage.getItem(THEME_KEY) || 'auto';
  applyTheme(savedTheme);
  const savedFont = localStorage.getItem(FONT_KEY) || 'medium';
  applyFontSize(savedFont);
  const savedAnim = localStorage.getItem(ANIM_KEY) || 'on';
  applyAnimations(savedAnim === 'on');

  // Versiya raqamlarini yangilash
  document.getElementById('app-version').textContent = `v${APP_VERSION}`;
  const footerVersion = document.getElementById('footer-version');
  if (footerVersion) footerVersion.textContent = `v${APP_VERSION}`;

  // Kesh o'lchamini yangilash
  updateCacheSizeDisplay();

  applyLanguage(currentLang);
  loadUserProfile();

  // Tizim mavzu o'zgarishini kuzatish
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const theme = localStorage.getItem(THEME_KEY) || 'auto';
    if (theme === 'auto') applyTheme('auto');
  });

  console.log('✅ Streak.uz Sozlamalar sahifasi (kengaytirilgan) yuklandi.');
});
