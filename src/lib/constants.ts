export const MUSCLE_GROUPS: Record<string, string[]> = {
  "Chest": [
    "Pectoralis Major",
    "Pectoralis Minor",
    "Serratus Anterior"
  ],
  "Back": [
    "Latissimus Dorsi",
    "Trapezius",
    "Rhomboids",
    "Teres Major",
    "Erector Spinae",
    "Infraspinatus"
  ],
  "Legs": [
    "Quadriceps",
    "Hamstrings",
    "Gluteus Maximus",
    "Gluteus Medius",
    "Calves (Gastrocnemius)",
    "Soleus",
    "Adductors",
    "Abductors"
  ],
  "Shoulders": [
    "Anterior Deltoid",
    "Lateral Deltoid",
    "Posterior Deltoid",
    "Rotator Cuff"
  ],
  "Arms": [
    "Biceps Brachii",
    "Triceps Brachii",
    "Brachialis",
    "Forearms"
  ],
  "Core": [
    "Rectus Abdominis",
    "Obliques",
    "Transverse Abdominis"
  ],
  "Cardio": [
    "Heart"
  ],
  "Full Body": [
    "Full Body"
  ]
};

export const ALL_MUSCLES = Object.values(MUSCLE_GROUPS).flat();
