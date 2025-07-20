export const dashboardData = {
  daysSmokeFree: 7,
  moneySaved: 210,
  healthMilestones: [
    {
      id: 1,
      title: "Heart Rate Normalized",
      description: "Your heart rate has returned to normal levels",
      achieved: true,
      day: 1,
    },
    {
      id: 2,
      title: "Improved Circulation",
      description: "Blood circulation is improving throughout your body",
      achieved: true,
      day: 3,
    },
    {
      id: 3,
      title: "Taste & Smell Enhanced",
      description: "Your sense of taste and smell are becoming sharper",
      achieved: true,
      day: 7,
    },
    {
      id: 4,
      title: "Lung Function Boost",
      description: "Your lung capacity is starting to increase",
      achieved: false,
      day: 14,
    },
  ],
  latestMilestone: "Taste & Smell Enhanced",
}

export const cravingResponse = {
  strategyId: "strat_001",
  title: "Deep Breathing Exercise",
  steps: [
    "Find a comfortable seated position",
    "Close your eyes and relax your shoulders",
    "Breathe in slowly through your nose for 4 counts",
    "Hold your breath for 4 counts",
    "Exhale slowly through your mouth for 6 counts",
    "Repeat this cycle 5-10 times",
  ],
  source: "Behavioral Science Journal, 2024",
  estimatedTime: "3-5 minutes",
  effectiveness: "85%",
}

export const todayMotivator = {
  motivatorId: "mot_007",
  message: "Each smoke-free day adds 2 hours to your life expectancy. You've already gained 14 hours!",
  imageUrl: "/placeholder.svg?height=200&width=300",
  category: "health",
  isFavorited: false,
}

export const favoriteMotivators = [
  {
    motivatorId: "mot_001",
    message: "Your sense of taste is already improving. Enjoy every flavor!",
    imageUrl: "/placeholder.svg?height=200&width=300",
    category: "health",
    isFavorited: true,
  },
  {
    motivatorId: "mot_003",
    message: "You've saved enough money for a nice dinner out. Celebrate your progress!",
    imageUrl: "/placeholder.svg?height=200&width=300",
    category: "financial",
    isFavorited: true,
  },
  {
    motivatorId: "mot_005",
    message: "Your family is proud of your commitment to better health.",
    imageUrl: "/placeholder.svg?height=200&width=300",
    category: "social",
    isFavorited: true,
  },
]

export const randomTip = {
  tipId: "tip_003",
  title: "Keep Your Hands Busy",
  text: "When a craving hits, try fidgeting with a stress ball, pen, or toothpick. Many people smoke out of habit - keeping your hands occupied helps break the physical routine.",
  source: "Nicotine Replacement Therapies Guide, 2023",
  category: "behavioral",
  difficulty: "easy",
  timeToImplement: "immediate",
}

export const chatHistory = [
  {
    id: 1,
    message: "Welcome Ahmed! I'm here to support you on your quit smoking journey. How are you feeling today?",
    sender: "assistant",
    timestamp: new Date(Date.now() - 3600000),
    urgency: "low",
  },
  {
    id: 2,
    message: "I'm feeling good but had a small craving after lunch. It passed though!",
    sender: "user",
    timestamp: new Date(Date.now() - 3500000),
    urgency: "low",
  },
  {
    id: 3,
    message:
      "That's excellent! Post-meal cravings are very common. The fact that it passed shows your mental strength is growing. Would you like me to suggest some strategies for future post-meal moments?",
    sender: "assistant",
    timestamp: new Date(Date.now() - 3400000),
    urgency: "low",
  },
]

export const quickReplies = [
  "I'm having a craving",
  "I feel great today",
  "I need motivation",
  "Tell me my progress",
  "I'm struggling",
]

export const strategies = [
  {
    id: "strat_001",
    title: "Deep Breathing Exercise",
    category: "relaxation",
    steps: [
      "Find a comfortable seated position",
      "Close your eyes and relax your shoulders",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Repeat this cycle 5-10 times",
    ],
    estimatedTime: "3-5 minutes",
    effectiveness: "85%",
  },
  {
    id: "strat_002",
    title: "The 5-4-3-2-1 Grounding Technique",
    category: "mindfulness",
    steps: [
      "Name 5 things you can see around you",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
    ],
    estimatedTime: "2-3 minutes",
    effectiveness: "78%",
  },
  {
    id: "strat_003",
    title: "Physical Activity Burst",
    category: "physical",
    steps: [
      "Do 10 jumping jacks",
      "Take a brisk 2-minute walk",
      "Do 5 push-ups against a wall",
      "Stretch your arms above your head",
      "Take deep breaths while moving",
    ],
    estimatedTime: "5 minutes",
    effectiveness: "82%",
  },
]

export const userProfile = {
  name: "Ahmed",
  quitDate: "2024-01-01",
  currentNicotineMg: 0,
  coachingStyle: "supportive",
  avatar: "/placeholder.svg?height=100&width=100",
  preferences: {
    language: "en",
    theme: "light",
    notifications: {
      daily: true,
      craving: true,
      milestone: true,
    },
  },
}
