import { Achievement } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: "first_delivery",
    name: "First Steps",
    description: "Complete your first delivery",
    icon: "baby",
    category: "milestone",
    requirement: {
      type: "count",
      value: 1,
    },
  },
  {
    id: "ten_deliveries",
    name: "Rising Star",
    description: "Assist with 10 deliveries",
    icon: "star",
    category: "milestone",
    requirement: {
      type: "count",
      value: 10,
    },
  },
  {
    id: "fifty_deliveries",
    name: "Experienced Professional",
    description: "Assist with 50 deliveries",
    icon: "school",
    category: "milestone",
    requirement: {
      type: "count",
      value: 50,
    },
  },
  {
    id: "hundred_deliveries",
    name: "Century Club",
    description: "Assist with 100 deliveries",
    icon: "trophy",
    category: "milestone",
    requirement: {
      type: "count",
      value: 100,
    },
  },
  {
    id: "five_hundred_deliveries",
    name: "Master of Miracles",
    description: "Assist with 500 deliveries",
    icon: "medal",
    category: "milestone",
    requirement: {
      type: "count",
      value: 500,
    },
  },
  {
    id: "ten_boys",
    name: "Blue Brigade",
    description: "Welcome 10 baby boys",
    icon: "human-male",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 10,
      condition: "boys",
    },
  },
  {
    id: "ten_girls",
    name: "Pink Parade",
    description: "Welcome 10 baby girls",
    icon: "human-female",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 10,
      condition: "girls",
    },
  },
  {
    id: "fifty_boys",
    name: "Boy Champion",
    description: "Welcome 50 baby boys",
    icon: "face-man",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 50,
      condition: "boys",
    },
  },
  {
    id: "fifty_girls",
    name: "Girl Champion",
    description: "Welcome 50 baby girls",
    icon: "face-woman",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 50,
      condition: "girls",
    },
  },
  {
    id: "hundred_boys",
    name: "Century of Sons",
    description: "Welcome 100 baby boys",
    icon: "trophy-outline",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 100,
      condition: "boys",
    },
  },
  {
    id: "hundred_girls",
    name: "Century of Daughters",
    description: "Welcome 100 baby girls",
    icon: "trophy-variant",
    category: "milestone",
    requirement: {
      type: "specific",
      value: 100,
      condition: "girls",
    },
  },

  // Skills Achievements
  // {
  //   id: "water_birth_expert",
  //   name: "Water Birth Expert",
  //   description: "Assist with 10 water births",
  //   icon: "water",
  //   category: "skill",
  //   requirement: {
  //     type: "specific",
  //     value: 10,
  //     condition: "water_birth",
  //   },
  // },
  // {
  //   id: "breech_specialist",
  //   name: "Breech Specialist",
  //   description: "Assist with 5 breech deliveries",
  //   icon: "rotate-3d-variant",
  //   category: "skill",
  //   requirement: {
  //     type: "specific",
  //     value: 5,
  //     condition: "breech",
  //   },
  // },
  // {
  //   id: "vbac_advocate",
  //   name: "VBAC Advocate",
  //   description: "Support 10 successful VBACs",
  //   icon: "heart-pulse",
  //   category: "skill",
  //   requirement: {
  //     type: "specific",
  //     value: 10,
  //     condition: "vbac",
  //   },
  // },

  // Special Achievements
  {
    id: "first_twins",
    name: "Double Blessing",
    description: "Assist with your first twin delivery",
    icon: "account-multiple",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "twins",
    },
  },
  {
    id: "first_triplets",
    name: "Triple Joy",
    description: "Assist with a triplet delivery",
    icon: "account-group",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "triplets",
    },
  },
  {
    id: "double_duty",
    name: "Double Duty",
    description: "Assist with 2 deliveries in one shift",
    icon: "numeric-2-circle",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "double_shift",
    },
  },
  {
    id: "triple_blessing",
    name: "Triple Blessing",
    description: "Assist with 3 deliveries in one shift",
    icon: "numeric-3-circle",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "triple_shift",
    },
  },
  {
    id: "marathon_shift",
    name: "Marathon Shift",
    description: "Assist with 4 or more deliveries in one shift",
    icon: "run-fast",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "marathon_shift",
    },
  },
  {
    id: "holiday_hero",
    name: "Holiday Hero",
    description: "Work on a major holiday",
    icon: "calendar-star",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "holiday",
    },
  },
  {
    id: "weekend_warrior",
    name: "Weekend Warrior",
    description: "Complete 25 weekend deliveries",
    icon: "calendar-weekend",
    category: "special",
    requirement: {
      type: "specific",
      value: 25,
      condition: "weekend",
    },
  },

  // Skill Achievements
  {
    id: "vaginal_expert",
    name: "Natural Birth Expert",
    description: "Assist with 25 vaginal deliveries",
    icon: "heart",
    category: "skill",
    requirement: {
      type: "specific",
      value: 25,
      condition: "vaginal",
    },
  },
  {
    id: "csection_specialist",
    name: "Surgical Specialist",
    description: "Assist with 25 C-sections",
    icon: "medical-bag",
    category: "skill",
    requirement: {
      type: "specific",
      value: 25,
      condition: "c-section",
    },
  },
  {
    id: "angel_guardian",
    name: "Guardian Angel",
    description: "Support families through difficult times",
    icon: "hand-heart",
    category: "special",
    requirement: {
      type: "specific",
      value: 1,
      condition: "angel",
    },
  },
  // {
  //   id: "preterm_specialist",
  //   name: "Preterm Specialist",
  //   description: "Assist with 10 preterm deliveries",
  //   icon: "clock-alert",
  //   category: "skill",
  //   requirement: {
  //     type: "specific",
  //     value: 10,
  //     condition: "preterm",
  //   },
  // },
  {
    id: "multiples_expert",
    name: "Multiples Expert",
    description: "Assist with 5 multiple births",
    icon: "account-multiple-plus",
    category: "skill",
    requirement: {
      type: "specific",
      value: 5,
      condition: "multiples",
    },
  },
  // {
  //   id: "birth_educator",
  //   name: "Birth Educator",
  //   description: "Support 20 first-time parents",
  //   icon: "school-outline",
  //   category: "skill",
  //   requirement: {
  //     type: "specific",
  //     value: 20,
  //     condition: "first_time_parents",
  //   },
  // },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
};

export const getAchievementsByCategory = (
  category: Achievement["category"],
): Achievement[] => {
  return ACHIEVEMENTS.filter(
    (achievement) => achievement.category === category,
  );
};
