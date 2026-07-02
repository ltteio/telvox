import React, { useState } from 'react';
import { PlayerProfile, Meal, Session } from '../types';
import { Utensils, Sparkles, CheckSquare, Zap, Clock, ChevronRight, Activity, Trash2, Heart, PlusCircle, X } from 'lucide-react';
import { INITIAL_MEALS } from '../mockData';

interface NutritionEngineProps {
  player: PlayerProfile;
  meals: Meal[];
  setMeals?: React.Dispatch<React.SetStateAction<Meal[]>>;
  activeSession: Session | null;
  decisionState?: any;
}

export default function NutritionEngine({ player, meals, setMeals, activeSession, decisionState }: NutritionEngineProps) {
  // Available ingredients checklist
  const [ingredients, setIngredients] = useState([
    { name: "Blanc de poulet", selected: true },
    { name: "Riz basmati", selected: true },
    { name: "Œufs", selected: true },
    { name: "Banane", selected: false },
    { name: "Brocoli", selected: true },
    { name: "Patate douce", selected: false },
    { name: "Filet de saumon", selected: false },
    { name: "Avocat", selected: false },
    { name: "Pâtes complètes", selected: false }
  ]);

  // Generated recipe state
  const [recipe, setRecipe] = useState<{
    recipeName: string;
    time: string;
    description: string;
    ingredientsUsed: string[];
    instructions: string[];
    fuelScore: number;
    explanation: string;
  } | null>(null);

  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const toggleIngredient = (index: number) => {
    setIngredients(prev => prev.map((ing, i) => {
      if (i === index) return { ...ing, selected: !ing.selected };
      return ing;
    }));
  };

  // Form visibility & fields for adding custom meals
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTime, setCustomTime] = useState('08:00');
  const [customType, setCustomType] = useState('Petit-déjeuner');
  const [customCalories, setCustomCalories] = useState(400);
  const [customProteins, setCustomProteins] = useState(25);
  const [customCarbs, setCustomCarbs] = useState(45);
  const [customFats, setCustomFats] = useState(10);
  const [customDescription, setCustomDescription] = useState('');

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !setMeals) return;

    const newMeal: Meal = {
      id: 'meal_custom_' + Date.now(),
      name: customName,
      time: customTime,
      type: customType,
      calories: Number(customCalories),
      proteins: Number(customProteins),
      carbs: Number(customCarbs),
      fats: Number(customFats),
      isHealthy: true,
      description: customDescription || "Repas personnalisé enregistré par le joueur."
    };

    setMeals(prev => [...prev, newMeal].sort((a, b) => a.time.localeCompare(b.time)));
    setShowAddForm(false);
    setCustomName('');
    setCustomDescription('');
  };

  const handleLoadDefaultMeals = () => {
    if (setMeals) {
      setMeals(INITIAL_MEALS);
    }
  };

  const handleDeleteMeal = (id: string) => {
    if (setMeals) {
      setMeals(prev => prev.filter(m => m.id !== id));
    }
  };

  // Generate recipe via backend Gemini API
  const generateRecipe = async () => {
    const selectedIngredients = ingredients.filter(i => i.selected).map(i => i.name);
    if (selectedIngredients.length === 0) return;

    setLoadingRecipe(true);
    setRecipe(null);
    try {
      const response = await fetch('/api/coach/meal-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          playerProfile: player,
          nextSession: activeSession || { name: "Explosivité & Pied Gauche", intensity: "Élevée" }
        })
      });
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setRecipe({
        recipeName: "Poêlée protéinée Express de l'Athlète",
        time: "15 mins",
        description: "Un repas express optimisant tes apports en protéines pour soutenir ton prochain entraînement.",
        ingredientsUsed: selectedIngredients,
        instructions: [
          "Fais cuire tes sources de protéines sélectionnées dans une poêle antiadhésive.",
          "Ajoute tes féculents pour refaire tes réserves de glycogène.",
          "Incorpore les légumes pour les minéraux et antioxydants.",
          "Assaisonne légèrement et consomme 3h avant l'effort."
        ],
        fuelScore: 88,
        explanation: "Apporte un ratio idéal de protéines hautement assimilables pour préserver ta masse musculaire durant l'effort."
      });
    } finally {
      setLoadingRecipe(false);
    }
  };

  // Calculate daily totals
  const totalCalories = meals.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProteins = meals.reduce((acc, curr) => acc + curr.proteins, 0);
  const totalCarbs = meals.reduce((acc, curr) => acc + curr.carbs, 0);
  const totalFats = meals.reduce((acc, curr) => acc + curr.fats, 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      
      {/* 1. Header with Fuel Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><Utensils className="w-5 h-5" /></span>
            <h3 className="text-xl font-sans font-black text-white uppercase tracking-wide">Nutrition Engine</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manger pour mieux performer sur le terrain. Le moteur nutritionnel adapte automatiquement tes cibles en macronutriments en fonction de la charge physique calculée par le <span className="text-slate-200 font-bold">Progress Engine</span>.
          </p>

          {/* Daily macros totals */}
          <div className="grid grid-cols-4 gap-3 pt-4 text-center font-mono">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <span className="text-slate-500 block text-[9px] uppercase">CALORIES</span>
              <span className="text-xs sm:text-sm font-bold text-white block mt-0.5">{totalCalories} / {decisionState?.adjustments?.nutrition?.caloriesTarget ?? 2800} <span className="text-[9px] text-slate-500">kcal</span></span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <span className="text-slate-500 block text-[9px] uppercase">PROTÉINES</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 block mt-0.5">{totalProteins} / {decisionState?.adjustments?.nutrition?.macronutrientTargets?.proteins ?? 160}g</span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <span className="text-slate-500 block text-[9px] uppercase">GLUCIDES</span>
              <span className="text-xs sm:text-sm font-bold text-cyan-400 block mt-0.5">{totalCarbs} / {decisionState?.adjustments?.nutrition?.macronutrientTargets?.carbohydrates ?? 350}g</span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <span className="text-slate-500 block text-[9px] uppercase">LIPIDES</span>
              <span className="text-xs sm:text-sm font-bold text-yellow-400 block mt-0.5">{totalFats} / {decisionState?.adjustments?.nutrition?.macronutrientTargets?.fats ?? 80}g</span>
            </div>
          </div>
        </div>

        {/* Daily Fuel Score indicator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl text-center relative overflow-hidden">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">SCORE NUTRITIONNEL</span>
          
          <div className="my-4">
            <span className="text-6xl font-black font-mono text-emerald-400">85</span>
            <span className="text-xs font-mono text-slate-400 block mt-1">FUEL SCORE / 100</span>
          </div>

          <div className="text-[10px] font-mono text-slate-500">
            Cible : <span className="text-slate-300 font-bold">Performance du jour</span>
          </div>
        </div>

      </div>

      {decisionState?.adjustments?.nutrition && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl animate-pulse shrink-0">💧</span>
            <div>
              <span className="font-bold text-white font-sans text-sm">Adaptation Hydrique & Nutritionnelle Active</span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Le Cerveau Central conseille une hydratation cible de <span className="text-emerald-400 font-bold font-mono">{decisionState.adjustments.nutrition.hydrationLiters}L</span> aujourd'hui. Snack suggéré : <span className="text-cyan-400 font-medium">{decisionState.adjustments.nutrition.preWorkoutSnack}</span>
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 shrink-0 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">AI Prescribed</span>
        </div>
      )}

      {/* 2. Interactive "Performance Meal" Builder with server-side Gemini AI */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-500 uppercase">Le Générateur intelligent</span>
          <h3 className="text-xl font-sans font-black text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span>CRÉE TON REPAS DE PERFORMANCE</span>
          </h3>
          <p className="text-xs text-slate-400">
            Sélectionne les ingrédients disponibles dans ton frigo. L'IA Telvox va composer une recette sportive sur mesure, parfaitement synchronisée avec ta prochaine séance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pantry selection checklist */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Ingrédients disponibles</span>
            <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar text-xs font-mono">
              {ingredients.map((ing, idx) => (
                <div 
                  key={ing.name} 
                  onClick={() => toggleIngredient(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    ing.selected 
                      ? 'bg-slate-950/40 border-emerald-500/40 text-slate-200' 
                      : 'bg-slate-950/20 border-slate-850 text-slate-500'
                  }`}
                >
                  <span>{ing.name}</span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${ing.selected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-800'}`}>
                    {ing.selected && <div className="w-2 h-2 bg-slate-950 rounded-sm" />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateRecipe}
              disabled={loadingRecipe || ingredients.filter(i => i.selected).length === 0}
              className={`w-full py-3 text-xs font-sans font-black tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                loadingRecipe || ingredients.filter(i => i.selected).length === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
              }`}
            >
              {loadingRecipe ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>CONSTRUCTION DE LA RECETTE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>GÉNÉRER MA RECETTE SUR MESURE</span>
                </>
              )}
            </button>
          </div>

          {/* Gemini AI Recipe Output Display */}
          <div className="lg:col-span-8">
            {recipe ? (
              <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-4 animate-scale-up">
                
                <div className="flex justify-between items-start pb-3 border-b border-slate-850">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Recette athlétique validée</span>
                    <h4 className="text-lg font-bold text-white font-sans">{recipe.recipeName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">FUEL SCORE</span>
                    <span className="text-xl font-black font-mono text-yellow-400">{recipe.fuelScore} / 100</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center text-slate-300 font-medium">
                    <Clock className="w-4 h-4 text-slate-500 mr-2" />
                    <span>Temps de préparation : <span className="text-white font-bold">{recipe.time}</span></span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium italic">"{recipe.description}"</p>
                </div>

                {/* Ingredients used tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {recipe.ingredientsUsed.map((ing) => (
                    <span key={ing} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
                      {ing}
                    </span>
                  ))}
                </div>

                {/* Instructions timeline */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Instructions de préparation</span>
                  <div className="space-y-2 text-xs text-slate-300">
                    {recipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 leading-normal">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono flex items-center justify-center shrink-0 text-emerald-400 font-bold">{idx + 1}</span>
                        <p className="pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">Bénéfice : </span> {recipe.explanation}
                </div>

              </div>
            ) : (
              <div className="h-64 bg-slate-950/20 border border-slate-850/50 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Utensils className="w-12 h-12 text-slate-600 mb-3" />
                <span className="text-sm font-sans font-bold text-slate-300">Aucune recette active</span>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Sélectionne tes ingrédients sur la gauche et clique sur générer pour obtenir une recette sportive sur mesure par l'IA.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Pre-calculated Diet Schedule Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-sans font-black text-white tracking-wide uppercase">Planning Nutritionnel de la Journée</h3>
          {meals.length > 0 && setMeals && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Ajouter un repas</span>
              </button>
              <button
                onClick={() => setMeals([])}
                className="px-3 py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-900/30 font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tout vider</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal/Inline form for logging a custom meal */}
        {showAddForm && (
          <form onSubmit={handleAddCustomMeal} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 animate-scale-up text-xs text-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-sm font-sans font-black uppercase text-white flex items-center space-x-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Enregistrer un Repas</span>
              </h4>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono">Nom du repas</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Fromage blanc & Flocons"
                  className="w-full bg-slate-950 text-slate-200 py-2 px-3 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Heure</label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-3 border border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-3 border border-slate-800 rounded-xl focus:outline-none font-mono"
                  >
                    <option value="Petit-déjeuner">Petit-déjeuner</option>
                    <option value="Déjeuner">Déjeuner</option>
                    <option value="Collation">Collation</option>
                    <option value="Dîner">Dîner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase">Kcal</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-1 border border-slate-800 rounded-xl focus:outline-none text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase">Prot (g)</label>
                  <input
                    type="number"
                    value={customProteins}
                    onChange={(e) => setCustomProteins(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-1 border border-slate-800 rounded-xl focus:outline-none text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase">Gluc (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-1 border border-slate-800 rounded-xl focus:outline-none text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-mono text-[9px] uppercase">Lip (g)</label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 py-2 px-1 border border-slate-800 rounded-xl focus:outline-none text-center"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono">Description / Bénéfice sportif</label>
              <input
                type="text"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Ex: Favorise l'endurance lors de la séance."
                className="w-full bg-slate-950 text-slate-200 py-2 px-3 border border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold rounded-xl transition-colors cursor-pointer"
              >
                Ajouter le repas
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-xl">
              <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-sans font-black text-white">AUCUN REPAS ENREGISTRÉ</h3>
              <p className="text-xs text-slate-400">
                Ton planning nutritionnel est actuellement vide pour aujourd'hui. Tu peux ajouter des repas manuellement ou charger le programme recommandé par Telvox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                {setMeals && (
                  <button
                    onClick={handleLoadDefaultMeals}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Charger le planning recommandé</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  + Ajouter un repas
                </button>
              </div>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-slate-800/80 text-emerald-400 flex items-center justify-center shrink-0 font-sans font-black text-xs">
                    {meal.time}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{meal.type}</span>
                      {meal.isHealthy && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <h4 className="text-base font-bold text-slate-100 font-sans">{meal.name}</h4>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{meal.description}</p>
                  </div>
                </div>

                {/* macros & delete */}
                <div className="flex items-center space-x-3 self-stretch sm:self-auto justify-between sm:justify-end shrink-0">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-slate-400 min-w-48 bg-slate-950/20 p-2.5 rounded-xl border border-slate-850 shrink-0">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">KCAL</span>
                      <span className="font-bold text-white">{meal.calories}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">PROT</span>
                      <span className="font-bold text-emerald-400">{meal.proteins}g</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">GLUC</span>
                      <span className="font-bold text-cyan-400">{meal.carbs}g</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">LIP</span>
                      <span className="font-bold text-yellow-400">{meal.fats}g</span>
                    </div>
                  </div>

                  {setMeals && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 text-slate-500 hover:text-red-400 bg-slate-950/20 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 rounded-xl transition-all cursor-pointer"
                      title="Supprimer ce repas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
