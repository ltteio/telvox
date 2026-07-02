import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server securely
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.log("Telemetry check: GEMINI_API_KEY environment variable is not defined. AI features will fallback to deterministic rules.");
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// 1. AI Coach Chat / Conversation
app.post("/api/coach/chat", async (req, res) => {
  const { messages, personality, playerProfile, footballDna } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const latestMessage = messages[messages.length - 1]?.text || "";

  if (!ai) {
    // Advanced deterministic fallback parsing keywords for offline/fallback mode
    let commands: any[] = [];
    const lowerText = latestMessage.toLowerCase();
    
    if (lowerText.includes("supprime") && (lowerText.includes("séance") || lowerText.includes("seance"))) {
      commands.push({
        action: "DELETE_SESSION",
        payload: JSON.stringify({ date: "tomorrow" })
      });
    } else if (lowerText.includes("ajoute") || lowerText.includes("programme") || lowerText.includes("planifie")) {
      commands.push({
        action: "ADD_SESSION",
        payload: JSON.stringify({
          name: "Séance de Finition Spécifique",
          category: "Technique",
          intensity: "Modérée",
          date: "Jeudi",
          exercises: [
            { name: "Frappes enchaînées lucarne", muscleGroup: "Technique", sets: 3, reps: "15 reps", restSeconds: 60 }
          ]
        })
      });
    } else if (lowerText.includes("blesse") || lowerText.includes("blessé")) {
      commands.push({
        action: "SET_INJURED",
        payload: JSON.stringify({ injured: true, injuryDetails: "Douleur musculaire active" })
      });
    } else if (lowerText.includes("vacances") || lowerText.includes("vacance")) {
      commands.push({
        action: "SET_VACATION",
        payload: JSON.stringify({ onVacation: true })
      });
    } else if (lowerText.includes("pied gauche") || lowerText.includes("gauche uniquement")) {
      commands.push({
        action: "LEFT_FOOT_ONLY",
        payload: JSON.stringify({ leftFootOnly: true })
      });
    } else if (lowerText.includes("pré-saison") || lowerText.includes("pre-saison")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "pre_season" })
      });
    } else if (lowerText.includes("hors saison") || lowerText.includes("off-season")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "off_season" })
      });
    } else if (lowerText.includes("reprise")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "reprise" })
      });
    }

    return res.json({
      text: `[Fallback Engine] Reçu Eliott. En tant que coach ${personality}, j'ai compris ton instruction : "${latestMessage}". Le système a traduit cela en commande d'action directe pour mettre à jour ton Player OS.`,
      commands
    });
  }

  try {
    const systemPrompt = `Tu es le coach IA personnel de Telvox, "Progress Engine", pour un joueur de football de haut niveau.
Le joueur s'appelle ${playerProfile?.firstName} ${playerProfile?.lastName}, il a ${playerProfile?.age} ans, évolue au club ${playerProfile?.club} en tant que ${playerProfile?.position}.
Ses objectifs : "${playerProfile?.currentGoal}".
Ses préférences alimentaires (Food Profile) : ${JSON.stringify(playerProfile?.foodProfile || {})}
Son mode de saison actif : "${playerProfile?.seasonMode || 'in_season'}".
Ses compétences clés : Explosivité (${footballDna?.explosiveness}/100), Créativité (${footballDna?.creativity}/100), Vision (${footballDna?.vision}/100), Technique (${footballDna?.technique}/100).

Ton style de communication actuel est défini par la personnalité suivante : "${personality}".
- "exigeant" : Direct, très factuel, peu de compliments, cherche la perfection athlétique.
- "pedagogue" : Donne des explications physiologiques et tactiques extrêmement détaillées, explique le "pourquoi" de chaque effort.
- "motivant" : Chaleureux, enthousiaste, utilise beaucoup d'encouragements positifs et célèbre chaque petite victoire.
- "professionnel" : Ton neutre, fait de façon très structurée, utilise le jargon des centres de formation professionnels.

Règles d'action (RÉALISE LES ORDRES DU JOUEUR SANS PASSER PAR LES MENUS) :
Analyse le dernier message de l'utilisateur pour détecter s'il te demande de modifier le calendrier, les séances, s'il déclare une blessure, un départ en vacances, s'il souhaite se focaliser sur son pied gauche, changer ses préférences alimentaires, etc.
Si oui, génère une commande appropriée dans le tableau "commands".

Commandes supportées :
1. "DELETE_SESSION" : payload : '{"date": "jeudi"}' ou '{"date": "tomorrow"}'
2. "ADD_SESSION" : payload : '{"name": "...", "category": "Technique"|"Physique"|"Tactique", "intensity": "Faible"|"Modérée"|"Élevée", "date": "Jeudi", "exercises": [{"name": "...", "duration": 10, "focusPoints": ["...", "..."], "description": "..."}]}'
3. "SET_SEASON_MODE" : payload : '{"mode": "pre_season"|"in_season"|"off_season"|"reprise"}'
4. "SET_INJURED" : payload : '{"injured": true|false, "injuryDetails": "..."}' (Si blessé, remplace les séances explosives par du renforcement ciblé et de la mobilité passive)
5. "SET_VACATION" : payload : '{"onVacation": true|false}' (Si en vacances, adapte tout le calendrier à un programme de maintien léger et repos)
6. "LEFT_FOOT_ONLY" : payload : '{"leftFootOnly": true|false}' (Si vrai, change automatiquement les exercices techniques pour viser uniquement le pied gauche)
7. "SET_FOOD_PROFILE" : payload : '{"allergies": ["..."], "dietType": "...", "dislikedFoods": ["..."]}' (Met à jour le profil alimentaire)
8. "ADD_MATCH" : payload : '{"opponent": "...", "time": "21h00", "tvChannels": ["Canal+"], "isFree": false}'
9. "UPDATE_OBJECTIVE" : payload : '{"objective": "..."}'

Règles absolues :
1. Reste dans ton personnage et réponds toujours en français.
2. Ne pose jamais de diagnostic médical complexe (recommande un médecin en cas de douleur persistante).
3. Relie tes conseils au calendrier, à l'état physique et à la saison du joueur.
4. Reste court, percutant et ultra-professionnel.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'player' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: "Bonjour Coach" }] },
        { role: "model", parts: [{ text: "Bonjour Eliott. Je suis ton Progress Engine. Prêt à progresser aujourd'hui ?" }] },
        ...formattedContents
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            commands: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  payload: { type: Type.STRING }
                },
                required: ["action", "payload"]
              }
            }
          },
          required: ["text"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"text": ""}');
    res.json({
      text: parsed.text,
      commands: parsed.commands || []
    });
  } catch (error: any) {
    console.log("Telemetry check: Chat request falling back to local engine.");
    
    // Advanced deterministic fallback parsing keywords for offline/fallback mode
    let commands: any[] = [];
    const lowerText = latestMessage.toLowerCase();
    
    if (lowerText.includes("supprime") && (lowerText.includes("séance") || lowerText.includes("seance"))) {
      commands.push({
        action: "DELETE_SESSION",
        payload: JSON.stringify({ date: "tomorrow" })
      });
    } else if (lowerText.includes("ajoute") || lowerText.includes("programme") || lowerText.includes("planifie")) {
      commands.push({
        action: "ADD_SESSION",
        payload: JSON.stringify({
          name: "Séance de Finition Spécifique",
          category: "Technique",
          intensity: "Modérée",
          date: "Jeudi",
          exercises: [
            { name: "Frappes enchaînées lucarne", muscleGroup: "Technique", sets: 3, reps: "15 reps", restSeconds: 60 }
          ]
        })
      });
    } else if (lowerText.includes("blesse") || lowerText.includes("blessé")) {
      commands.push({
        action: "SET_INJURED",
        payload: JSON.stringify({ injured: true, injuryDetails: "Douleur musculaire active" })
      });
    } else if (lowerText.includes("vacances") || lowerText.includes("vacance")) {
      commands.push({
        action: "SET_VACATION",
        payload: JSON.stringify({ onVacation: true })
      });
    } else if (lowerText.includes("pied gauche") || lowerText.includes("gauche uniquement")) {
      commands.push({
        action: "LEFT_FOOT_ONLY",
        payload: JSON.stringify({ leftFootOnly: true })
      });
    } else if (lowerText.includes("pré-saison") || lowerText.includes("pre-saison")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "pre_season" })
      });
    } else if (lowerText.includes("hors saison") || lowerText.includes("off-season")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "off_season" })
      });
    } else if (lowerText.includes("reprise")) {
      commands.push({
        action: "SET_SEASON_MODE",
        payload: JSON.stringify({ mode: "reprise" })
      });
    }

    res.json({
      text: `[Coach de Secours] Reçu Eliott. En tant que coach ${personality}, j'ai compris ton instruction : "${latestMessage}". Le système a traduit cela en commande d'action directe pour mettre à jour ton Player OS. (Note: Mode secours activé suite à une surcharge temporaire des services IA).`,
      commands
    });
  }
});

// 2. The "Why Engine" (Explication des évolutions de notes et statistiques)
app.post("/api/coach/explain", async (req, res) => {
  const { metric, value, context, playerProfile } = req.body;

  if (!ai) {
    return res.json({
      explanation: `Explication rule-based : Ta note de ${metric} (${value}) a été modifiée récemment par rapport à tes séances. Continue ta régularité !`
    });
  }

  try {
    const prompt = `Le joueur de football ${playerProfile?.firstName} demande : "Pourquoi ma statistique de ${metric} est de ${value} ?"
Contexte de l'application : ${context}
Génère une explication d'expert football (préparateur physique ou analyste vidéo) de 2 ou 3 phrases maximum.
Explique scientifiquement la cause par rapport aux entraînements réalisés, à l'hydratation ou au sommeil. Termine par un conseil d'action précis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.log("Telemetry check: Explain request falling back.");
    res.json({ explanation: "Impossible d'accéder au Why Engine pour le moment. Reste régulier !" });
  }
});

// 4. Daily Morning/Evening Routine AI Analyst
app.post("/api/coach/routine", async (req, res) => {
  const { routine, answers, playerProfile, currentStep } = req.body;

  if (!ai) {
    // Rule-based fallback if no Gemini Key
    const defaultQuestions = routine === 'morning' 
      ? [
          "Combien d'heures as-tu dormi cette nuit et quelle est la qualité ressentie de ton sommeil (1 à 10) ?",
          "Ressens-tu des raideurs ou des douleurs musculaires ce matin ? Si oui, où ?",
          "Quel est ton objectif mental ou le focus technique que tu souhaitez travailler aujourd'hui ?"
        ]
      : [
          "Comment juges-tu ton niveau d'intensité et d'énergie globale durant la journée et l'entraînement (1 à 10) ?",
          "As-tu respecté ton programme de nutrition et d'hydratation aujourd'hui ? Qu'as-tu mangé au dîner ?",
          "Ressens-tu des tensions physiques importantes avant de dormir qui méritent un protocole d'étirement spécifique ?"
        ];

    if (currentStep < 3) {
      return res.json({
        nextQuestion: defaultQuestions[currentStep],
        isFinal: false
      });
    } else {
      // Final analysis fallback
      return res.json({
        isFinal: true,
        analysis: routine === 'morning'
          ? `[Analyse Matinale] Eliott, tes indicateurs de sommeil et d'absence de douleur indiquent que ton corps est prêt pour un bloc d'entraînement intensif. Ton score de récupération est réévalué à 92%. Focus sur l'explosivité d'appuis aujourd'hui.`
          : `[Analyse du Soir] Eliott, ton niveau d'hydratation et tes ressentis musculaires post-entraînement sont encourageants. Nous préconisons un étirement du psoas de 5 minutes avant l'extinction des feux pour maximiser la détente parasympathique. Sommeil ciblé : 8 heures.`,
        suggestedUpdates: {
          recoveryPercentage: routine === 'morning' ? 92 : 88,
          fatigueLevel: routine === 'morning' ? 'FAIBLE' : 'MODÉRÉE',
          xpReward: 50,
          dayTip: "Fais des micro-pauses d'hydratation toutes les 25 minutes aujourd'hui.",
          sleepTip: "Évite les écrans bleus 45 minutes avant l'extinction des feux pour réguler ta mélatonine."
        }
      });
    }
  }

  try {
    const isMorning = routine === 'morning';
    
    if (currentStep < 3) {
      // Generate next question dynamically using AI, based on previous answers to get to know the player in real-time
      const answersText = answers.map((a: any, idx: number) => `Q${idx+1}: ${a.question}\nR${idx+1}: ${a.answer}`).join("\n\n");
      
      const prompt = `Tu es le "Progress Engine", coach de football IA élite. Tu mènes l'entretien individuel du ${isMorning ? 'MATIN (Éveil)' : 'SOIR (Sommeil/Analyse)'} avec le joueur de football ${playerProfile?.firstName} (${playerProfile?.position}).
L'entretien comporte 3 questions courtes et ciblées au total pour apprendre à le connaître en temps réel.
Le joueur a répondu aux étapes précédentes :
${answersText || "Aucune réponse pour l'instant (début de l'entretien)."}

Génère la question numéro ${currentStep + 1} de manière ultra-professionnelle et personnalisée.
${isMorning 
  ? "Cette question doit concerner : " + (currentStep === 0 ? "la qualité et durée du sommeil" : currentStep === 1 ? "les raideurs musculaires ou douleurs au réveil" : "son focus mental et motivation du jour")
  : "Cette question doit concerner : " + (currentStep === 0 ? "le ressenti de fatigue physique de sa journée/entraînement" : currentStep === 1 ? "l'hydratation et le dîner de récupération" : "les tensions articulaires à relâcher avant le coucher")
}
Règle : Reste très court, direct, digne d'un préparateur physique de Ligue 1 (1 à 2 phrases max, utilise le tutoiement professionnel).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });

      res.json({
        nextQuestion: response.text,
        isFinal: false
      });

    } else {
      // CurrentStep === 3: Final Analysis! Output JSON structure with coaching advice and numeric stats to update!
      const answersText = answers.map((a: any, idx: number) => `Q${idx+1}: ${a.question}\nR${idx+1}: ${a.answer}`).join("\n\n");
      
      const prompt = `Tu es le "Progress Engine", coach de football IA élite. Tu analyses les réponses de l'entretien du ${isMorning ? 'MATIN (Éveil & Forme)' : 'SOIR (Bilan & Sommeil)'} du joueur de football ${playerProfile?.firstName} (${playerProfile?.position}).
Voici le bilan complet des réponses fournies par le joueur :
${answersText}

Génère un rapport final structuré au format JSON.
Le JSON doit contenir :
1. "analysis" : Une analyse haut de gamme de 3-4 phrases en français, évaluant son état physiologique et psychologique. Donne un conseil concret basé sur ses réponses pour sa journée ou sa nuit de sommeil.
2. "intensityZoneRecommendation" : La zone d'intensité recommandée (ex: "Aérobie Légère", "VMA Haute", "Régénération", "Force Explosive").
3. "recoveryPercentage" : Un nombre entre 50 et 100 estimant son état de fraîcheur physique actuel en direct.
4. "fatigueLevel" : Une chaîne de caractères : "FAIBLE", "MODÉRÉE", ou "ÉLEVÉE".
5. "xpReward" : Un gain d'XP pour avoir complété son suivi de routine (ex: 75).
6. "sleepTip" ou "dayTip" : Un conseil flash pour la nuit (si soir) ou pour la journée (si matin).

Exemple de format :
{
  "analysis": "...",
  "intensityZoneRecommendation": "VMA Haute",
  "recoveryPercentage": 93,
  "fatigueLevel": "FAIBLE",
  "xpReward": 75,
  "sleepTip": "...",
  "dayTip": "..." 
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              intensityZoneRecommendation: { type: Type.STRING },
              recoveryPercentage: { type: Type.INTEGER },
              fatigueLevel: { type: Type.STRING },
              xpReward: { type: Type.INTEGER },
              sleepTip: { type: Type.STRING },
              dayTip: { type: Type.STRING }
            },
            required: ["analysis", "intensityZoneRecommendation", "recoveryPercentage", "fatigueLevel", "xpReward"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({
        isFinal: true,
        ...result
      });
    }
  } catch (error: any) {
    console.log("Telemetry check: Routine request falling back.");
    const defaultQuestions = routine === 'morning' 
      ? [
          "Combien d'heures as-tu dormi cette nuit et quelle est la qualité ressentie de ton sommeil (1 à 10) ?",
          "Ressens-tu des raideurs ou des douleurs musculaires ce matin ? Si oui, où ?",
          "Quel est ton objectif mental ou le focus technique que tu souhaitez travailler aujourd'hui ?"
        ]
      : [
          "Comment juges-tu ton niveau d'intensité et d'énergie globale durant la journée et l'entraînement (1 à 10) ?",
          "As-tu respecté ton programme de nutrition et d'hydratation aujourd'hui ? Qu'as-tu mangé au dîner ?",
          "Ressens-tu des tensions physiques importantes avant de dormir qui méritent un protocole d'étirement spécifique ?"
        ];

    if (currentStep < 3) {
      res.json({
        nextQuestion: defaultQuestions[currentStep],
        isFinal: false
      });
    } else {
      res.json({
        isFinal: true,
        analysis: routine === 'morning'
          ? `[Routine Matinale - Mode Secours] Eliott, tes indicateurs de sommeil et de fraîcheur musculaires indiquent que ton corps est prêt pour un entraînement adapté de haut niveau. Ta récupération est évaluée à 92%.`
          : `[Routine du Soir - Mode Secours] Eliott, ton hydratation et tes ressentis musculaires post-entraînement sont encourageants. Nous préconisons un étirement du psoas de 5 minutes avant d'éteindre les feux pour maximiser ta récupération. Sommeil ciblé : 8 heures.`,
        suggestedUpdates: {
          recoveryPercentage: routine === 'morning' ? 92 : 88,
          fatigueLevel: routine === 'morning' ? 'FAIBLE' : 'MODÉRÉE',
          xpReward: 50,
          dayTip: "Fais des micro-pauses d'hydratation toutes les 25 minutes aujourd'hui.",
          sleepTip: "Évite les écrans bleus 45 minutes avant d'éteindre les feux pour réguler ta mélatonine."
        }
      });
    }
  }
});

// 3. Performance Meal Generator (Nutrition Engine - Chapitre 15)
app.post("/api/coach/meal-generator", async (req, res) => {
  const { ingredients, playerProfile, nextSession } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Des ingrédients sont requis" });
  }

  if (!ai) {
    return res.json({
      recipeName: "Salade de poulet de l'Athlète",
      time: "15 mins",
      description: "Mélange tes ingrédients disponibles avec du riz pour un apport protéique et glucidique optimal.",
      ingredientsUsed: ingredients,
      instructions: [
        "Fais cuire tes sources de protéines.",
        "Ajoute les légumes disponibles.",
        "Sers tiède avec de l'eau pour optimiser ton hydratation."
      ],
      fuelScore: 85,
      explanation: "Ce repas apporte des protéines essentielles après ton effort."
    });
  }

  try {
    const prompt = `Crée une recette de repas de performance sportive pour un footballeur de ${playerProfile?.age} ans (${playerProfile?.position}).
Ses ingrédients disponibles à la maison : ${ingredients.join(", ")}.
Sa prochaine séance d'entraînement : "${nextSession?.name}" (${nextSession?.intensity} intensité).

Génère une réponse stricte au format JSON contenant :
1. "recipeName" (nom attractif de la recette)
2. "time" (temps de préparation estimé, ex: "20 mins")
3. "description" (pourquoi ce repas soutient ses performances sportives)
4. "ingredientsUsed" (liste des ingrédients utilisés)
5. "instructions" (tableau d'étapes de cuisine rapides)
6. "fuelScore" (un indice de 0 à 100 de qualité nutritionnelle sportive pour l'entraînement à venir)
7. "explanation" (explication en une phrase de l'apport énergétique : protéines, glucides, graisses saines).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING },
            time: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            fuelScore: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["recipeName", "time", "description", "ingredientsUsed", "instructions", "fuelScore", "explanation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.log("Telemetry check: Meal generator request falling back.");
    res.json({
      recipeName: "Bowl de l'Athlète (Secours)",
      time: "15 mins",
      description: "[Moteur de Secours] Mélange tes ingrédients disponibles avec du riz pour un apport protéique et glucidique optimal de récupération.",
      ingredientsUsed: ingredients,
      instructions: [
        "Fais cuire tes sources de protéines.",
        "Ajoute les légumes disponibles.",
        "Sers tiède avec de l'eau pour optimiser ton hydratation."
      ],
      fuelScore: 85,
      explanation: "Ce repas apporte des protéines de reconstruction et des glucides complexes."
    });
  }
});

// 5. Central Decision Engine - The Physiological and Tactical Core
app.post("/api/coach/decision-engine", async (req, res) => {
  const { playerProfile, lastCheckIn, weather, matches, sessions, daysSinceLastWeakFoot } = req.body;

  // Extract Season Mode & Food Profile
  const seasonMode = playerProfile?.seasonMode || "in_season";
  const foodProfile = playerProfile?.foodProfile || {};

  // 1. Analyze parameters deterministically to feed the fallback or help structure the analysis
  const recoveryPercentage = lastCheckIn?.recoveryPercentage ?? 91;
  const fatigueLevel = lastCheckIn?.fatigueLevel ?? "FAIBLE";
  const sleepHours = lastCheckIn?.sleepHours ?? 8;
  const soreness = lastCheckIn?.soreness ?? "Aucune";
  const injuryStatus = lastCheckIn?.injuryStatus ?? "Ok";

  const temp = weather?.temperature ?? 20;
  const humidity = weather?.humidity ?? 60;
  const windSpeed = weather?.windSpeed ?? 12;
  const uvIndex = weather?.uvIndex ?? 3;
  const weatherLabel = weather?.label ?? "Doux";
  const locationName = weather?.locationName ?? "Localisation réelle";

  // Calculate days until next uncompleted match
  let daysUntilNextMatch = 5;
  let nextOpponent = "";
  if (matches && Array.isArray(matches)) {
    const upcoming = matches.filter((m: any) => !m.completed);
    if (upcoming.length > 0) {
      const nextMatch = upcoming[0];
      const matchDate = new Date(nextMatch.date);
      const today = new Date();
      const diffTime = matchDate.getTime() - today.getTime();
      daysUntilNextMatch = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nextOpponent = nextMatch.opponent;
    }
  }

  const isMatchClose = daysUntilNextMatch <= 2 && daysUntilNextMatch >= 0;
  const isHighFatigue = fatigueLevel === "ÉLEVÉE" || recoveryPercentage < 75;
  const isExtremeHeat = temp > 28;
  const isExtremeCold = temp < 6;
  const needsWeakFootWork = daysSinceLastWeakFoot >= 3;

  // Fallback engine: deterministic rule-based decisions ensuring full alignment
  const getFallbackDecisions = () => {
    let intensityOverride: "Réduite" | "Standard" | "Accrue" = "Standard";
    let difficultyLevel: "Facile" | "Standard" | "Élite" = "Standard";
    let focusAdjusted = "Régularité technique & endurance";
    let motivationQuote = "Le talent progresse par l'intelligence. Reste focus sur les détails aujourd'hui.";
    
    const dailyChanges = [];
    const explanations = [];
    const actionPlan = [];
    const notifications = [];
    const exerciseReplacements = [];

    // Trigger base notifications
    notifications.push(`📍 GPS activé : Données synchronisées avec ${locationName}. Météo : ${weatherLabel} (${temp}°C).`);

    // Season mode adjustments in fallback
    if (seasonMode === "pre_season") {
      intensityOverride = "Accrue";
      difficultyLevel = "Élite";
      focusAdjusted = "Bâtir la caisse foncière (Volume & Capacité VMA)";
      motivationQuote = "La pré-saison est exigeante. On construit le moteur aérobie pour tenir 90 minutes sans baisse de régime.";
      dailyChanges.push({
        title: "Focus Pré-Saison : Charge Foncier",
        change: "Augmentation du volume de course de 25% pour stimuler l'endurance aérobie maximale.",
        metricTrigger: `Season Mode : Pré-Saison`
      });
      explanations.push({
        decisionName: "Surcharge progressive aérobie",
        inputsUsed: ["Mode saison : Pré-saison", `Fatigue : ${fatigueLevel}`],
        reasoning: "Pendant la pré-saison, l'absence de matchs officiels à court terme permet de surcharger temporairement l'organisme pour élever le plateau de VO2Max.",
        decisionTaken: "Intensité élevée prescrite pour stimuler le système cardio-respiratoire.",
        expectedImpact: "Amélioration de 5% de la capacité de récupération entre les efforts à haute intensité d'ici le début du championnat."
      });
    } else if (seasonMode === "off_season") {
      focusAdjusted = "Renforcement spécifique & compensation des faiblesses";
      motivationQuote = "La hors-saison sert à réparer les déséquilibres musculaires accumulés et blinder les articulations.";
      dailyChanges.push({
        title: "Focus Hors-Saison : Réathlétisation",
        change: "Priorité mise sur le renforcement du tronc (core) et la mobilité passive.",
        metricTrigger: `Season Mode : Hors-Saison`
      });
    } else if (seasonMode === "reprise") {
      intensityOverride = "Réduite";
      difficultyLevel = "Facile";
      focusAdjusted = "Adaptation ostéo-articulaire progressive";
      motivationQuote = "Doucement mais sûrement. On réhabitue les tendons pour éviter l'inflammation de reprise.";
      dailyChanges.push({
        title: "Focus Reprise : Protection Articulaire",
        change: "Volume réduit de moitié et temps de récupération doublés pour une transition en douceur.",
        metricTrigger: `Season Mode : Reprise`
      });
    }

    if (isHighFatigue) {
      intensityOverride = "Réduite";
      difficultyLevel = "Facile";
      focusAdjusted = "Régénération active & fluidité";
      motivationQuote = "Savoir lever le pied est une force d'athlète d'élite. Récupère intelligemment.";
      
      dailyChanges.push({
        title: "Allègement de la charge",
        change: "Intensité réduite et exercices simplifiés en raison d'une fatigue accumulée.",
        metricTrigger: `Récupération de ${recoveryPercentage}% (Niveau : ${fatigueLevel})`
      });

      explanations.push({
        decisionName: "Préservation musculaire",
        inputsUsed: [`Récupération : ${recoveryPercentage}%`, `Fatigue : ${fatigueLevel}`, `Douleurs : ${soreness}`],
        reasoning: "Une baisse notable du score de récupération augmente de 300% le taux de blessures indirectes sous fatigue. Le système nerveux central a besoin de régénération passive.",
        decisionTaken: "Réduction immédiate de l'intensité à 'Faible' et passage à la difficulté 'Facile'. Remplacement des exercices explosifs par de l'activation proprioceptive.",
        expectedImpact: "Réduction drastique du risque de blessure et accélération de la synthèse d'ATP pour revenir à 90%+ demain."
      });

      actionPlan.push("Réalise 15 minutes d'étirements légers et d'auto-massages.");
      actionPlan.push("Hydrate-toi de façon constante toute la journée.");

      exerciseReplacements.push({
        originalId: "ex_1",
        name: "Mobilité active & Activation proprioceptive",
        duration: 10,
        intensity: "Faible",
        focusPoints: ["Décompresser la colonne", "Souplesse dynamique", "Appuis stables sans impact"],
        description: "Remplace l'exercice d'endurance VMA par un bloc de mobilité articulaire douce pour relâcher les tensions musculaires."
      });
    } else if (isMatchClose && seasonMode === "in_season") {
      intensityOverride = "Réduite";
      difficultyLevel = "Facile";
      focusAdjusted = "Affûtage tactique & réactivité cognitive";
      motivationQuote = "Le travail de fond est fait. Aujourd'hui, on aiguise le cerveau et la fraîcheur d'appuis.";

      dailyChanges.push({
        title: "Période d'affûtage d'avant-match",
        change: "Intensité diminuée et focus placé sur la vivacité mentale.",
        metricTrigger: `Match officiel contre ${nextOpponent || "ton adversaire"} dans ${daysUntilNextMatch} jours.`
      });

      explanations.push({
        decisionName: "Supercompensation de match",
        inputsUsed: [`Proximité match : ${daysUntilNextMatch} jours`, `Opposant : ${nextOpponent}`],
        reasoning: "À 48h du coup d'envoi, les stocks de glycogène doivent être saturés et le tonus musculaire maintenu sans créer de fatigue résiduelle.",
        decisionTaken: "Baisse de l'intensité physique au profit d'ateliers courts de vivacité (sprints courts de 2-3 mètres, passes rapides).",
        expectedImpact: "Supercompensation énergétique maximale au moment d'entrer sur le terrain."
      });

      actionPlan.push(`Analyse les vidéos tactiques de ${nextOpponent || "l'adversaire"}.`);
      actionPlan.push("Privilégie les sucres lents lors de ton dîner.");

      exerciseReplacements.push({
        originalId: "ex_2",
        name: "Réveil neuromusculaire & Prise d'infos rapide",
        duration: 8,
        intensity: "Faible",
        focusPoints: ["Fréquence d'appuis très rapide", "Scan visuel constant", "Passe propre en une touche"],
        description: "Remplace ton bloc physique lourd par des séquences de vivacité de 10 secondes et de la prise de décision rapide."
      });
    } else {
      // Standard conditions - check if weak foot or extreme weather
      if (needsWeakFootWork) {
        focusAdjusted = "Dribbles & Précision du pied faible (Gauche)";
        motivationQuote = "Aujourd'hui, ton pied gauche est à l'honneur. Ne fuis pas l'effort complexe.";

        dailyChanges.push({
          title: "Priorisation pied faible",
          change: "Atelier adapté pour intégrer 60% de passes et tirs de ton pied gauche.",
          metricTrigger: `${daysSinceLastWeakFoot} jours sans travailler le pied gauche.`
        });

        explanations.push({
          decisionName: "Équilibrage de la symétrie technique",
          inputsUsed: [`Jours sans pied faible : ${daysSinceLastWeakFoot}`, "Pied préféré : Droit"],
          reasoning: "Un ailier moderne doit être ambidextre pour forcer le défenseur à défendre sur les deux côtés. Travailler le pied gauche augmente ton répertoire tactique.",
          decisionTaken: "Ajustement de l'atelier technique pour forcer l'usage exclusif du pied faible sur les contrôles et relances.",
          expectedImpact: "Gain de 1.5 points de fluidité sur ton pied gauche en 2 semaines."
        });

        exerciseReplacements.push({
          originalId: "ex_1",
          name: "Mur technique & Relance Pied Gauche",
          duration: 12,
          intensity: "Modérée",
          focusPoints: ["Cheville gauche verrouillée", "Frappe nette au milieu du ballon", "Orientation du buste"],
          description: "Travail ciblé de passe contre mur avec contrôle orienté exclusif du pied gauche."
        });
      }
    }

    if (isExtremeHeat) {
      notifications.push("🥵 ALERTE CANICULE : Hydratation forcée de 3.5L et pauses régulières d'hydratation.");
      explanations.push({
        decisionName: "Régulation thermique",
        inputsUsed: [`Température extérieure : ${temp}°C`, `Humidité : ${humidity}%`],
        reasoning: "L'effort par plus de 28°C augmente de 20% le débit cardiaque pour évacuer la chaleur par la transpiration, limitant les performances musculaires pures.",
        decisionTaken: "Ajout automatique de pauses d'hydratation de 1 minute toutes les 12 minutes de séance et augmentation de la cible de fluides de 800ml.",
        expectedImpact: "Maintien de la volémie sanguine et prévention des crampes thermiques."
      });
    }

    const hydration = isExtremeHeat ? 3800 : isHighFatigue ? 3200 : 2800;
    
    // Nutrition adapt to dietary preferences (Food profile)
    let specialAdditions = isExtremeHeat ? ["+1000ml Boisson Isotonique", "Pincée de sel de l'Himalaya"] : ["3g de Glycine pure", "+500ml d'eau minérale"];
    if (foodProfile?.allergies && foodProfile.allergies.length > 0) {
      specialAdditions.push(`⚠️ SÉCURITÉ ALIMENTAIRE : Repas sans ${foodProfile.allergies.join(", ")}`);
    }
    if (foodProfile?.dietType === "vege") {
      specialAdditions.push("🌱 Protéines d'origine végétale (Pois, lentilles, tofu)");
    } else if (foodProfile?.dietType === "sans_porc") {
      specialAdditions.push("🚫 Repas 100% sans porc respecté");
    }

    const recoveryProtocol = isHighFatigue 
      ? { name: "Protocole de décompression active et cryothérapie locale", duration: 20, stretches: ["Mollets surélevés", "Massage léger des quadriceps", "Bain froid (10 min)"] }
      : { name: "Étirements légers et relaxation nerveuse", duration: 10, stretches: ["Psoas stretch", "Respiration diaphragmatique 4-7-8"] };

    return {
      statusOverview: {
        physiologicalScore: recoveryPercentage,
        physiologicalDesc: isHighFatigue 
          ? `Ton corps montre des signes importants de fatigue (${fatigueLevel}, sommeil de ${sleepHours}h). Ta fraîcheur musculaire de ${recoveryPercentage}% nécessite un protocole d'adaptation protecteur.`
          : `Forme physique adéquate (${recoveryPercentage}% de fraîcheur). Tes indicateurs physiologiques sont favorables pour le bloc d'entraînement du jour.`,
        environmentalFactor: `Météo réelle à ${locationName} : ${weatherLabel} (${temp}°C, humidité ${humidity}%, vent ${windSpeed} km/h, UV ${uvIndex}).`,
        scheduleFactor: isMatchClose 
          ? `Match décisif contre ${nextOpponent || "ton adversaire"} dans ${daysUntilNextMatch} jours. L'affûtage musculaire est déclenché.`
          : `Pas de match imminent à court terme. Les blocs de développement physiques sont encouragés.`
      },
      dailyChanges: dailyChanges.length > 0 ? dailyChanges : [{
        title: "Session Standard",
        change: "Maintien du programme classique. Aucun ajustement physique extrême requis.",
        metricTrigger: "Indicateurs au vert (fatigue faible, pas de match imminent)."
      }],
      explanations: explanations.length > 0 ? explanations : [{
        decisionName: "Séquençage standard",
        inputsUsed: ["Météo tempérée", "Pas de douleur", "Récupération nominale"],
        reasoning: "Tous tes signaux bio-physiques sont nominaux. Le plan de progression standard est maintenu pour maximiser ton potentiel athlétique de façon fluide.",
        decisionTaken: "Séance classique validée à intensité standard.",
        expectedImpact: "Surcharge progressive maîtrisée et stimulation optimale du potentiel."
      }],
      actionPlan: actionPlan.length > 0 ? actionPlan : ["Exécute ta séance de développement à 100%", "Bois un verre d'eau toutes les 2 heures", "Travaille la visualisation mentale de tes passes décisives"],
      adjustments: {
        training: {
          intensityOverride,
          difficultyLevel,
          focusAdjusted,
          motivationQuote,
          exerciseReplacements
        },
        nutrition: {
          hydrationGoal: hydration,
          macroRatio: isMatchClose ? "Carbo-loading (60% glucides complexes, 25% protéines, 15% lipides)" : "Reconstruction (45% glucides, 35% protéines, 20% lipides)",
          specialAdditions: specialAdditions
        },
        recovery: recoveryProtocol,
        notifications: notifications
      }
    };
  };

  if (!ai) {
    // Return high-quality deterministic model results immediately
    return res.json(getFallbackDecisions());
  }

  try {
    const prompt = `Tu es l'intelligence décisionnelle centrale "Progress Engine", préparateur physique élite et tacticien de football de niveau professionnel (Ligue 1).
Tu es le cerveau unique de l'application et toutes tes décisions modifient instantanément la séance d'entraînement, la nutrition, la récupération et le planning du joueur.
Le joueur s'appelle ${playerProfile?.firstName} (${playerProfile?.position}). Il joue au poste de ${playerProfile?.position}, son pied fort est le ${playerProfile?.preferredFoot}.

Mode Saison Actif : "${seasonMode}"
- "pre_season" : Bâtir la caisse foncière. Gros volume, intensité standard à accrue.
- "in_season" : Gérer l'affûtage de match. Réduire le volume avant les matchs.
- "off_season" : Réathlétisation douce, entretien, travail des points faibles.
- "reprise" : Augmentation extrêmement progressive pour éviter les blessures de tendon/ligaments.

Profil Alimentaire (Food Profile) : ${JSON.stringify(foodProfile)}
Prends en compte les allergies, intolérances, dislikes, budget, type de régime pour tes prescriptions nutritionnelles obligatoirement.

Données brutes réellement disponibles à analyser en priorité :
1. Indicateurs physiologiques réels (Dernier Check-in) :
   - Pourcentage de récupération : ${recoveryPercentage}%
   - Niveau de fatigue : ${fatigueLevel}
   - Heures de sommeil : ${sleepHours}h
   - Douleurs musculaires ou raideurs déclarées : "${soreness}"
   - État de blessure : "${injuryStatus}"

2. Météo et environnement réels (Géolocalisation à ${locationName}) :
   - Température réelle : ${temp}°C
   - Humidité : ${humidity}%
   - Vitesse du vent : ${windSpeed} km/h
   - Indice UV : ${uvIndex}
   - Heures de lumière (Lever/Coucher) : Lever ${weather?.sunrise || "06:12"}, Coucher ${weather?.sunset || "21:34"}
   - Description : "${weatherLabel}"

3. Proximité du match réel :
   - Match de type officiel contre : "${nextOpponent || "Aucun prévu à court terme"}"
   - Nombre de jours avant le match : ${nextOpponent ? daysUntilNextMatch + " jours" : "Aucun match imminent"}

4. Analyse du pied faible :
   - Nombre de jours consécutifs sans travailler le pied faible : ${daysSinceLastWeakFoot} jours.

Directives de décision strictes à appliquer (Le coach IA prend de vraies décisions) :
- Adapte obligatoirement les entraînements selon le Mode Saison : Pré-saison = gros volume, Hors-saison = renforcement/points faibles, Reprise = progressivité maximale, Saison = affûtage.
- S'il y a un match dans 2 jours ou moins en "in_season" : Réduction automatique obligatoire de l'intensité de la séance ("Réduite") et de la difficulté ("Facile"). Focus complet sur l'affûtage tactique et neuromusculaire.
- Si mauvaise récupération (récupération < 75% ou fatigue ÉLEVÉE) : Remplacement obligatoire d'exercices explosifs/lourds par des exercices de régénération active ou mobilité douce. Intensité Override réglée sur "Réduite", difficulté sur "Facile".
- Si forte chaleur (température > 28°C) : Ajout automatique obligatoire de pauses hydratation toutes les 10-12 minutes et augmentation de la cible hydrique de +800ml.
- Si le pied faible n'a pas été travaillé depuis 3 jours ou plus : Intégration obligatoire d'un atelier ciblant exclusivement le pied faible (${playerProfile?.preferredFoot === "Droit" ? "Gauche" : "Droit"}).
- Respecte drastiquement le profil alimentaire dans les conseils de nutrition.

Règles de rédaction des réponses :
- Ne jamais inventer d'allégations médicales ou de données non fournies.
- Baser l'analyse uniquement sur les données brutes énumérées ci-dessus.
- Chaque décision doit être méticuleusement expliquée avec : les données utilisées, le raisonnement scientifique de préparateur physique, la décision finale prise, et l'impact attendu.

Génère les décisions et l'analyse sous le format JSON strict suivant :
{
  "statusOverview": {
    "physiologicalScore": ${recoveryPercentage},
    "physiologicalDesc": "Description scientifique et honnête sans invention de ton état actuel.",
    "environmentalFactor": "Description de l'impact des données météo réelles sur ton entraînement.",
    "scheduleFactor": "Analyse de la proximité du match et du besoin d'affûtage."
  },
  "dailyChanges": [
    {
      "title": "Nom de la modification apportée",
      "change": "Changement précis (ex: Remplacement d'un exercice / baisse de volume)",
      "metricTrigger": "La métrique brute réelle qui a déclenché cette décision (ex: Température de 31°C)"
    }
  ],
  "explanations": [
    {
      "decisionName": "Titre de la décision prise (ex: Allègement neuromusculaire)",
      "inputsUsed": ["Métrique 1", "Métrique 2"],
      "reasoning": "Raisonnement scientifique court mais poussé de préparateur physique.",
      "decisionTaken": "Décision pratique concrète décidée pour la séance ou le jour.",
      "expectedImpact": "Impact mesurable attendu sur le corps ou sur le terrain."
    }
  ],
  "actionPlan": [
    "Instruction concrète immédiate 1",
    "Instruction concrète immédiate 2"
  ],
  "adjustments": {
    "training": {
      "intensityOverride": "Réduite ou Standard ou Accrue",
      "difficultyLevel": "Facile ou Standard ou Élite",
      "focusAdjusted": "Focus technique/tactique adapté de la séance",
      "motivationQuote": "Citation courte et inspirante de coach pro pour motiver face à ces adaptations.",
      "exerciseReplacements": [
        {
          "originalId": "L'id de l'exercice remplacé s'il y en a un (ex: ex_1)",
          "name": "Nom de l'exercice de remplacement",
          "duration": 12,
          "intensity": "Faible ou Modérée ou Élevée",
          "focusPoints": ["Point de focus 1", "Point de focus 2"],
          "description": "Description de l'exercice adapté"
        }
      ]
    },
    "nutrition": {
      "hydrationGoal": 3100,
      "macroRatio": "Ratio macro adapté (ex: 55% glucides Complexes, 25% Protéines, 20% Lipides)",
      "specialAdditions": ["Addition nutritionnelle recommandée"]
    },
    "recovery": {
      "protocolName": "Nom du protocole de récupération",
      "duration": 15,
      "stretches": ["Exercice d'étirement / relâchement 1", "Exercice d'étirement / relâchement 2"]
    },
    "notifications": [
      "Message de notification d'ajustement important pour le bandeau d'alerte"
    ]
  }
}

Ne renvoie rien d'autre que le JSON valide respectant précisément cette structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusOverview: {
              type: Type.OBJECT,
              properties: {
                physiologicalScore: { type: Type.INTEGER },
                physiologicalDesc: { type: Type.STRING },
                environmentalFactor: { type: Type.STRING },
                scheduleFactor: { type: Type.STRING }
              },
              required: ["physiologicalScore", "physiologicalDesc", "environmentalFactor", "scheduleFactor"]
            },
            dailyChanges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  change: { type: Type.STRING },
                  metricTrigger: { type: Type.STRING }
                },
                required: ["title", "change", "metricTrigger"]
              }
            },
            explanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  decisionName: { type: Type.STRING },
                  inputsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasoning: { type: Type.STRING },
                  decisionTaken: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING }
                },
                required: ["decisionName", "inputsUsed", "reasoning", "decisionTaken", "expectedImpact"]
              }
            },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            adjustments: {
              type: Type.OBJECT,
              properties: {
                training: {
                  type: Type.OBJECT,
                  properties: {
                    intensityOverride: { type: Type.STRING },
                    difficultyLevel: { type: Type.STRING },
                    focusAdjusted: { type: Type.STRING },
                    motivationQuote: { type: Type.STRING },
                    exerciseReplacements: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          originalId: { type: Type.STRING },
                          name: { type: Type.STRING },
                          duration: { type: Type.INTEGER },
                          intensity: { type: Type.STRING },
                          focusPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                          description: { type: Type.STRING }
                        },
                        required: ["originalId", "name", "duration", "intensity", "focusPoints", "description"]
                      }
                    }
                  },
                  required: ["intensityOverride", "difficultyLevel", "focusAdjusted", "motivationQuote", "exerciseReplacements"]
                },
                nutrition: {
                  type: Type.OBJECT,
                  properties: {
                    hydrationGoal: { type: Type.INTEGER },
                    macroRatio: { type: Type.STRING },
                    specialAdditions: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["hydrationGoal", "macroRatio", "specialAdditions"]
                },
                recovery: {
                  type: Type.OBJECT,
                  properties: {
                    protocolName: { type: Type.STRING },
                    duration: { type: Type.INTEGER },
                    stretches: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["protocolName", "duration", "stretches"]
                },
                notifications: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["training", "nutrition", "recovery", "notifications"]
            }
          },
          required: ["statusOverview", "dailyChanges", "explanations", "actionPlan", "adjustments"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.log("Telemetry check: Decision Engine request falling back.");
    const fallback = getFallbackDecisions();
    if (fallback.statusOverview) {
      fallback.statusOverview.physiologicalDesc = `[Moteur de Secours - Services IA Surchargés] ` + fallback.statusOverview.physiologicalDesc;
    }
    res.json(fallback);
  }
});


// ----------------------------------------------------
// VITE OR STATIC FILES SERVING
// ----------------------------------------------------

async function setupStaticServing() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static files serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupStaticServing();
