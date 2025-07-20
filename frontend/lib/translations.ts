export const translations = {
  en: {
    // App branding
    appName: "AI Quitting Coach",
    tagline: "Your AI-powered companion to quit smoking",

    // Navigation
    dashboard: "Dashboard",
    chat: "Chat",
    progress: "Progress",
    settings: "Settings",

    // Onboarding
    welcomeTitle: "Ready to Quit Smoking?",
    welcomeSubtitle: "Join thousands who've successfully quit with AI-powered support",
    getStarted: "Get Started",
    profileSetup: "Profile Setup",
    tellUsAboutYou: "Tell us about you",
    name: "Name",
    namePlaceholder: "Enter your name",
    quitDate: "Quit Date",
    quitDatePlaceholder: "When did you quit?",
    currentNicotine: "Current Nicotine Level",
    coachingStyle: "Coaching Style",
    supportive: "Supportive & Encouraging",
    direct: "Direct & Straightforward",
    motivational: "Motivational & Energetic",
    next: "Next",
    goalConfirmation: "Goal Confirmation",
    confirmAndStart: "Confirm & Start",

    // Dashboard
    daysSmokeFree: "Days Smoke-Free",
    moneySaved: "Money Saved",
    latestMilestone: "Latest Milestone",
    quickActions: "Quick Actions",
    logCraving: "Log Craving",
    getTip: "Get Tip",
    myPlan: "My Plan",
    recentChat: "Recent Chat",
    continueChat: "Continue Chat",

    // Chat
    typeMessage: "Type your message...",
    send: "Send",
    helpNow: "Help Now",
    urgencyDetected: "High urgency detected",

    // Craving Logger
    cravingIntensity: "Craving Intensity",
    howStrongCraving: "How strong is your craving?",
    additionalNotes: "Additional Notes",
    notesPlaceholder: "What triggered this craving?",
    submit: "Submit",
    cancel: "Cancel",
    strategyRecommended: "Strategy Recommended",
    markAsDone: "Mark as Done",

    // Motivators & Tips
    dailyMotivator: "Daily Motivator",
    favoriteMotivators: "Favorite Motivators",
    randomTip: "Random Tip",
    tryNow: "Try Now",
    addToFavorites: "Add to Favorites",

    // Settings
    profileSettings: "Profile Settings",
    preferences: "Preferences",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    legal: "Legal & Disclaimer",

    // Footer
    aboutAIQuittingCoach: "About AI Quitting Coach",
    privacyDisclaimer: "Privacy & Disclaimer",
    contact: "Contact",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    save: "Save",
    edit: "Edit",
    delete: "Delete",

    // Language toggle
    arabic: "العربية",
    english: "English",
  },
  ar: {
    // App branding
    appName: "مدرب  الذكي للإقلاع عن التدخين",
    tagline: "رفيقك المدعوم بالذكاء الاصطناعي للإقلاع عن التدخين",

    // Navigation
    dashboard: "لوحة التحكم",
    chat: "المحادثة",
    progress: "التقدم",
    settings: "الإعدادات",

    // Onboarding
    welcomeTitle: "مستعد للإقلاع عن التدخين؟",
    welcomeSubtitle: "انضم إلى الآلاف الذين أقلعوا بنجاح بدعم الذكاء الاصطناعي",
    getStarted: "ابدأ الآن",
    profileSetup: "إعداد الملف الشخصي",
    tellUsAboutYou: "أخبرنا عن نفسك",
    name: "الاسم",
    namePlaceholder: "أدخل اسمك",
    quitDate: "تاريخ الإقلاع",
    quitDatePlaceholder: "متى أقلعت؟",
    currentNicotine: "مستوى النيكوتين الحالي",
    coachingStyle: "أسلوب التدريب",
    supportive: "داعم ومشجع",
    direct: "مباشر وواضح",
    motivational: "محفز ونشيط",
    next: "التالي",
    goalConfirmation: "تأكيد الهدف",
    confirmAndStart: "تأكيد والبدء",

    // Dashboard
    daysSmokeFree: "أيام بدون تدخين",
    moneySaved: "المال المدخر",
    latestMilestone: "آخر إنجاز",
    quickActions: "إجراءات سريعة",
    logCraving: "تسجيل الرغبة",
    getTip: "احصل على نصيحة",
    myPlan: "خطتي",
    recentChat: "المحادثة الأخيرة",
    continueChat: "متابعة المحادثة",

    // Chat
    typeMessage: "اكتب رسالتك...",
    send: "إرسال",
    helpNow: "مساعدة فورية",
    urgencyDetected: "تم اكتشاف حالة طارئة",

    // Craving Logger
    cravingIntensity: "شدة الرغبة",
    howStrongCraving: "ما مدى قوة رغبتك؟",
    additionalNotes: "ملاحظات إضافية",
    notesPlaceholder: "ما الذي أثار هذه الرغبة؟",
    submit: "إرسال",
    cancel: "إلغاء",
    strategyRecommended: "استراتيجية موصى بها",
    markAsDone: "تحديد كمكتمل",

    // Motivators & Tips
    dailyMotivator: "المحفز اليومي",
    favoriteMotivators: "المحفزات المفضلة",
    randomTip: "نصيحة عشوائية",
    tryNow: "جرب الآن",
    addToFavorites: "إضافة للمفضلة",

    // Settings
    profileSettings: "إعدادات الملف الشخصي",
    preferences: "التفضيلات",
    language: "اللغة",
    theme: "المظهر",
    notifications: "الإشعارات",
    legal: "القانونية والإخلاء",

    // Footer
    aboutAIQuittingCoach: "عن AI Quitting Coach",
    privacyDisclaimer: "الخصوصية والإخلاء",
    contact: "اتصل بنا",

    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    success: "نجح",
    close: "إغلاق",
    save: "حفظ",
    edit: "تعديل",
    delete: "حذف",

    // Language toggle
    arabic: "العربية",
    english: "English",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language][key] || translations.en[key]
}
