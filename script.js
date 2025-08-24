document.addEventListener('DOMContentLoaded', async () => {
    // --- CONFIGURATION ---
    const NETLIFY_FUNCTION_PATH = '/.netlify/functions/call-groq2';

    // --- DATA LAYER (Initialisés vides) ---
    let CIQUAL_DATA = []; 
    let fuse;
    let processedMenuData = null;
    let weightChart = null;
    let maintenanceCalories = 0;

    const UNIT_CONVERSIONS = {
    "huile d'olive": { "cuillère à soupe": 14, "cuillère à café": 4.5, "ml": 0.92 },
    "farine": { "tasse": 120, "cuillère à soupe": 7.5 },
    "sucre": { "tasse": 200, "cuillère à soupe": 12.5 },
    "lait": { "tasse": 244, "ml": 1.03 },
    "eau": { "tasse": 237, "ml": 1 },
    "riz": { "tasse": 185 },
    "pâtes": { "tasse": 140 },
    "lentilles": { "tasse": 180 },
    "oignon": { "pièce": 150, "moyen": 150, "petit": 70, "grand": 225 },
    "ail": { "gousse": 5 },
    "pomme": { "pièce": 180 },
    "banane": { "pièce": 120 },
    "oeuf": { "pièce": 50, "moyen": 50 },
    "carotte": { "pièce": 60 },
    "tomate": { "pièce": 120 },
    "pomme de terre": { "pièce": 170 },
    "yaourt": { "pièce": 125, "pot": 125, "unité": 125 },
    "pain": { "tranche": 30 }
    };

    // ---------- i18n (multilingue) ----------
    const SUPPORTED_LANGS = ['fr', 'en', 'de'];

    const TRANSLATIONS = {
      fr: {
        "app.title": "🥗 Equilibre",
        "app.subtitle": "Votre planificateur de repas intelligent pour un poids équilibré",
        "config.title": "Personnalisez votre plan",
        "form.gender": "Sexe",
        "form.age": "Âge",
        "form.weight": "Poids (kg)",
        "form.height": "Taille (cm)",
        "form.activity": "Niveau d'activité physique",
        "option.sedentary": "Sédentaire",
        "option.light": "Légèrement actif",
        "option.moderate": "Modérément actif",
        "option.very": "Très actif",
        "option.extreme": "Extrêmement actif",
        "btn.calculate": "Calculer mes besoins",
        "results.title": "Votre Menu de la Semaine",
        "loader.text": "Votre chef personnel IA prépare votre menu...",
        "loader.subtitle": "Cette opération peut prendre jusqu'à 30 secondes.",
        "print.button": "🖨️ Imprimer le menu et la liste de courses",
        "ingredients.placeholder": "ex: Poulet, brocoli, riz...",
        "suggest.ingredients": "Suggérer une liste",
        "plan.3": "3 repas / jour",
        "plan.with_snack": "Avec collation",
        "alerts.fillForm": "Veuillez remplir tous les champs du calculateur.",
        "alerts.listIngredients": "Veuillez lister des ingrédients.",
        "alerts.calcFirst": "Veuillez d'abord calculer vos besoins et choisir un objectif.",
        "generate.button": "Générer mon menu personnalisé",
        "meal.breakfast": "Petit-déjeuner",
        "meal.lunch": "Déjeuner",
        "meal.dinner": "Dîner",
        "meal.snack": "Collation",
        "imc.under": "Maigreur",
        "imc.normal": "Poids normal",
        "imc.over": "Surpoids",
        "imc.obese": "Obésité"
      },
      en: {
        "app.title": "🥗 Equilibre",
        "app.subtitle": "Your intelligent meal planner for balanced weight",
        "config.title": "Customize your plan",
        "form.gender": "Gender",
        "form.age": "Age",
        "form.weight": "Weight (kg)",
        "form.height": "Height (cm)",
        "form.activity": "Activity level",
        "option.sedentary": "Sedentary",
        "option.light": "Lightly active",
        "option.moderate": "Moderately active",
        "option.very": "Very active",
        "option.extreme": "Extremely active",
        "btn.calculate": "Calculate my needs",
        "results.title": "Your Weekly Menu",
        "loader.text": "Your AI chef is preparing your menu...",
        "loader.subtitle": "This may take up to 30 seconds.",
        "print.button": "🖨️ Print menu & shopping list",
        "ingredients.placeholder": "eg: Chicken, broccoli, rice...",
        "suggest.ingredients": "Suggest a list",
        "plan.3": "3 meals / day",
        "plan.with_snack": "With snack",
        "alerts.fillForm": "Please fill all calculator fields.",
        "alerts.listIngredients": "Please list ingredients.",
        "alerts.calcFirst": "Please calculate your needs and choose a goal first.",
        "generate.button": "Generate my personalized menu",
        "meal.breakfast": "Breakfast",
        "meal.lunch": "Lunch",
        "meal.dinner": "Dinner",
        "meal.snack": "Snack",
        "imc.under": "Underweight",
        "imc.normal": "Normal weight",
        "imc.over": "Overweight",
        "imc.obese": "Obesity"
      },
      de: {
        "app.title": "🥗 Equilibre",
        "app.subtitle": "Ihr intelligenter Essensplaner für ausgewogenes Gewicht",
        "config.title": "Passen Sie Ihren Plan an",
        "form.gender": "Geschlecht",
        "form.age": "Alter",
        "form.weight": "Gewicht (kg)",
        "form.height": "Größe (cm)",
        "form.activity": "Aktivitätsniveau",
        "option.sedentary": "Sesshaft",
        "option.light": "Leicht aktiv",
        "option.moderate": "Mäßig aktiv",
        "option.very": "Sehr aktiv",
        "option.extreme": "Äußerst aktiv",
        "btn.calculate": "Bedarf berechnen",
        "results.title": "Ihr Wochenmenü",
        "loader.text": "Ihr KI-Koch erstellt Ihr Menü...",
        "loader.subtitle": "Dieser Vorgang kann bis zu 30 Sekunden dauern.",
        "print.button": "🖨️ Menü und Einkaufsliste drucken",
        "ingredients.placeholder": "z.B.: Hähnchen, Brokkoli, Reis...",
        "suggest.ingredients": "Liste vorschlagen",
        "plan.3": "3 Mahlzeiten / Tag",
        "plan.with_snack": "Mit Snack",
        "alerts.fillForm": "Bitte füllen Sie alle Felder des Rechners aus.",
        "alerts.listIngredients": "Bitte listen Sie Zutaten auf.",
        "alerts.calcFirst": "Bitte berechnen Sie zuerst Ihre Bedürfnisse und wählen Sie ein Ziel.",
        "generate.button": "Mein persönliches Menü generieren",
        "meal.breakfast": "Frühstück",
        "meal.lunch": "Mittagessen",
        "meal.dinner": "Abendessen",
        "meal.snack": "Snack",
        "imc.under": "Untergewicht",
        "imc.normal": "Normales Gewicht",
        "imc.over": "Übergewicht",
        "imc.obese": "Adipositas"
      }
    };

    // helper : obtenez la traduction courante
    let currentLang = localStorage.getItem('eq_lang') || 'fr';
    if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = 'fr';

    function t(key) {
      return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || key;
    }

    function translatePage() {
      // document title
      document.title = t('app.title') + ' - ' + (t('config.title') || '');

      // html lang attribute
      document.documentElement.lang = currentLang;

      // éléments data-i18n (textContent)
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        el.textContent = t(k);
      });

      // placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const k = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(k));
      });

      // options spécifiques ex: select language UI
      const langSelect = document.getElementById('language-select');
      if (langSelect) langSelect.value = currentLang;

      // mettre à jour certains éléments côté JS (labels, boutons)
      const calcBtn = document.querySelector('button[type="submit"]');
      if (calcBtn) calcBtn.textContent = t('btn.calculate');

      const generateBtn = document.getElementById('generate-menu-btn');
      if (generateBtn) generateBtn.textContent = t('generate.button');

      const printBtn = document.getElementById('print-btn');
      if (printBtn) printBtn.textContent = t('print.button');

      // Mettre à jour loader text si présent
      const loaderP = document.querySelector('#loader p');
      if (loaderP) loaderP.innerHTML = t('loader.text') + '<br><span class="text-sm opacity-70">' + t('loader.subtitle') + '</span>';
    }

    // initialisation UI du sélecteur
    const langSelectElement = document.getElementById('language-select');
    if (langSelectElement) {
      langSelectElement.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('eq_lang', currentLang);
        translatePage();
      });
    }

    // lancer la traduction initiale
    translatePage();

    const tdeeForm = document.getElementById('tdee-form');
    const tdeeResultDiv = document.getElementById('tdee-result');
    const tdeeValueSpan = document.getElementById('tdee-value');
    const healthyTdeeValueSpan = document.getElementById('healthy-tdee-value');
    const imcValueSpan = document.getElementById('imc-value');
    const imcInterpretationSpan = document.getElementById('imc-interpretation');
    const ingredientsInput = document.getElementById('ingredients');
    const suggestIngredientsBtn = document.getElementById('suggest-ingredients-btn');
    const calorieTargetInput = document.getElementById('calorie-target');
    const calorieRestrictionSelect = document.getElementById('calorie-restriction');
    const strongDeficitWarning = document.getElementById('strong-deficit-warning');
    const healthyDeficitWarning = document.getElementById('healthy-deficit-warning');
    const weightGoalSection = document.getElementById('weight-goal-section');
    const generateMenuBtn = document.getElementById('generate-menu-btn');
    const resultsContainer = document.getElementById('results-container');
    const mealPlanDisplay = document.getElementById('meal-plan-display');
    const errorMessage = document.getElementById('error-message');
    const modal = document.getElementById('meal-detail-modal');
    const modalContent = document.getElementById('modal-content');
    const printBtn = document.getElementById('print-btn');
    const printContentDiv = document.getElementById('print-content');
    
    function parseCiqualValue(value) {
    if (typeof value !== 'string') {
    return !isNaN(value) ? Number(value) : 0;
    }
    const cleanString = value.replace(',', '.').replace(/[^\d.-]/g, '');
    const number = parseFloat(cleanString);
    return isNaN(number) ? 0 : number;
    }

    async function initializeApp() {
    try {
    const response = await fetch('ciqual-complet.json');
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawData = await response.json();

    CIQUAL_DATA = rawData.compo
    .map(item => ({
    name_fr: item.alim_nom_fr,
    kcal: parseCiqualValue(item['Energie, N x facteur Jones, avec fibres  (kcal/100 g)']),
    proteins: parseCiqualValue(item['Protéines, N x 6.25 (g/100 g)']),
    carbs: parseCiqualValue(item['Glucides (g/100 g)']),
    fats: parseCiqualValue(item['Lipides (g/100 g)'])
    }))
    .filter(item => item.kcal > 0);

    console.log("Application initialisée avec", CIQUAL_DATA.length, "aliments (après filtrage).");

    const fuseOptions = {
    includeScore: true,
    keys: ['name_fr'],
    threshold: 0.4
    };
    fuse = new Fuse(CIQUAL_DATA, fuseOptions);

    } catch (error) {
    console.error("Erreur critique lors du chargement des données:", error);
    document.body.innerHTML = "<h1>Erreur</h1><p>Impossible de charger la base de données nutritionnelle (ciqual-complet.json). Vérifiez que le fichier est présent et que le serveur est bien lancé.</p>";
    }
    }

    await initializeApp();

    tdeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateNeeds();
    });

    suggestIngredientsBtn.addEventListener('click', () => {
    const suggestions = {
      fr: "Poulet, Saumon, Lentilles corail, Pâtes complètes, Riz basmati, Lait, Pain complet, Flocons d'avoine, Brocoli, Carottes, Tomates, Oignon, Ail, Huile d'olive, Yaourts nature, Pommes, Noix.",
      en: "Chicken, Salmon, Red lentils, Whole-grain pasta, Basmati rice, Milk, Whole-wheat bread, Oats, Broccoli, Carrots, Tomatoes, Onion, Garlic, Olive oil, Plain yogurt, Apples, Nuts.",
      de: "Hähnchen, Lachs, Rote Linsen, Vollkornnudeln, Basmatireis, Milch, Vollkornbrot, Haferflocken, Brokkoli, Karotten, Tomaten, Zwiebel, Knoblauch, Olivenöl, Naturjoghurt, Äpfel, Nüsse."
    };
    ingredientsInput.value = suggestions[currentLang] || suggestions.fr;
    });

    calorieRestrictionSelect.addEventListener('change', updateCalorieTargetAndChart);
    generateMenuBtn.addEventListener('click', handleMenuGeneration);
    printBtn.addEventListener('click', handlePrint);

    function calculateNeeds() {
    const formData = new FormData(tdeeForm);
    const gender = formData.get('gender');
    const age = parseInt(formData.get('age'));
    const weight = parseFloat(formData.get('weight'));
    const height = parseFloat(formData.get('height'));
    const activityLevel = parseFloat(formData.get('activity-level'));

    if (!gender || !age || !weight || !height || !activityLevel) {
    alert(t('alerts.fillForm'));
    return;
    }

    const calculateBMR = (currentWeight, currentHeight, currentAge, currentGender) => {
    if (currentGender === 'male') {
    return 10 * currentWeight + 6.25 * currentHeight - 5 * currentAge + 5;
    } else {
    return 10 * currentWeight + 6.25 * currentHeight - 5 * currentAge - 161;
    }
    };

    const currentBMR = calculateBMR(weight, height, age, gender);
    maintenanceCalories = Math.round(currentBMR * activityLevel);
    tdeeValueSpan.textContent = maintenanceCalories;

    const heightInMeters = height / 100;
    const imc = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    imcValueSpan.textContent = imc;
    imcInterpretationSpan.textContent = getImcInterpretation(imc);
    
    const healthyWeight = (24.9 * (heightInMeters * heightInMeters)).toFixed(1);
    const healthyBMR = calculateBMR(healthyWeight, height, age, gender);
    const healthyTDEE = Math.round(healthyBMR * activityLevel);
    healthyTdeeValueSpan.textContent = healthyTDEE;

    tdeeResultDiv.classList.remove('hidden');
    weightGoalSection.classList.remove('hidden');
    
    updateCalorieTargetAndChart();
    }

    function getImcInterpretation(imc) {
    if (imc < 18.5) return t('imc.under');
    if (imc < 25) return t('imc.normal');
    if (imc < 30) return t('imc.over');
    return t('imc.obese');
    }

    function updateCalorieTargetAndChart() {
    if (maintenanceCalories <= 0) return;
    
    const restriction = parseInt(calorieRestrictionSelect.value);
    calorieTargetInput.value = maintenanceCalories + restriction;
    strongDeficitWarning.classList.toggle('hidden', restriction > -750);
    updateWeightProjectionChart();
    }
    
    function updateWeightProjectionChart() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    if (!weight || !height) return;
    
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    const targetWeight = parseFloat((24.9 * (heightInMeters * heightInMeters)).toFixed(1));
    const restriction = parseInt(calorieRestrictionSelect.value);
    
    const labels = Array.from({ length: 13 }, (_, i) => `Mois ${i}`);
    const data = [weight];
    let currentWeight = weight;
    let isUnadvisedLoss = (restriction < 0 && imc < 25);
    
    if (restriction < 0) {
    const weeklyLossKg = (Math.abs(restriction) * 7) / 7700;
    const monthlyLossKg = weeklyLossKg * 4.345;
    for (let i = 1; i <= 12; i++) {
    currentWeight -= monthlyLossKg;
    data.push(parseFloat(currentWeight.toFixed(1)));
    }
    } else {
    for (let i = 1; i <= 12; i++) { data.push(weight); }
    }
    
    healthyDeficitWarning.classList.toggle('hidden', !isUnadvisedLoss);
    
    const chartData = {
    labels: labels,
    datasets: [{
    label: 'Poids projeté (kg)',
    data: data,
    segment: {
    borderColor: ctx => {
    if (ctx.p0 && ctx.p1) {
    const p0y = ctx.p0.parsed.y;
    const p1y = ctx.p1.parsed.y;
    if ((p0y + p1y) / 2 <= targetWeight) {
    return '#ef4444';
    }
    }
    return isUnadvisedLoss ? '#ef4444' : '#65a30d'; // Utilise la couleur primaire
    }
    },
    backgroundColor: ctx => {
    if (ctx.type === 'segment' && ctx.p0 && ctx.p1) {
    const p0y = ctx.p0.parsed.y;
    const p1y = ctx.p1.parsed.y;
    if ((p0y + p1y) / 2 <= targetWeight) {
    return 'rgba(239, 68, 68, 0.1)';
    }
    }
    return isUnadvisedLoss ? 'rgba(239, 68, 68, 0.1)' : 'rgba(101, 163, 13, 0.1)'; // Couleur primaire transparente
    },
    fill: true,
    tension: 0.1
    }, {
    label: 'Poids santé cible (kg)',
    data: Array(13).fill(targetWeight),
    borderColor: '#fb923c', // Utilise la couleur accent
    borderDash: [5, 5],
    fill: false,
    pointRadius: 0
    }]
    };
    
    const ctx = document.getElementById('weight-chart').getContext('2d');
    if (weightChart) {
    weightChart.data = chartData;
    weightChart.update();
    } else {
    weightChart = new Chart(ctx, { 
    type: 'line', 
    data: chartData, 
    options: { 
    responsive: true, 
    maintainAspectRatio: false, 
    scales: { y: { title: { display: true, text: 'Poids (kg)' } } }, 
    plugins: { legend: { display: true, position: 'bottom' } } 
    } 
    });
    }
    }

    function renderMenu(weeklyPlan) {
    mealPlanDisplay.innerHTML = '';
    const legendHtml = `
    <div class="col-span-1 sm:col-span-2 lg:col-span-4 mb-4 p-2 bg-base-200 rounded-lg flex items-center justify-center space-x-4 flex-wrap">
    <div class="flex items-center space-x-2"><div class="w-3 h-3 rounded-sm bg-primary"></div><span class="text-xs font-semibold">Protéines</span></div>
    <div class="flex items-center space-x-2"><div class="w-3 h-3 rounded-sm bg-secondary"></div><span class="text-xs font-semibold">Glucides</span></div>
    <div class="flex items-center space-x-2"><div class="w-3 h-3 rounded-sm bg-accent"></div><span class="text-xs font-semibold">Lipides</span></div>
    </div>`;
    mealPlanDisplay.insertAdjacentHTML('beforeend', legendHtml);    
    const planType = document.querySelector('input[name="plan-type"]:checked').value;
    const mealTypeLabels = {
      breakfast: t('meal.breakfast'),
      lunch: t('meal.lunch'),
      dinner: t('meal.dinner'),
      snack: t('meal.snack')
    };
    
    weeklyPlan.forEach((dayData, dayIndex) => {
    const dayCard = document.createElement('div');
    // On s'assure que la carte est bien un conteneur flex vertical
    dayCard.className = 'card bg-base-100 shadow-xl flex flex-col';
    
    const cardBody = document.createElement('div');
    // On ajoute flex et flex-col ici aussi pour contrôler le contenu
    cardBody.className = 'card-body p-4 flex flex-col';
    
    cardBody.innerHTML = `
    <div>
    <h3 class="card-title text-center block">${dayData.day}</h3>
    <p class="text-center text-sm font-semibold mb-2">${dayData.daily_calories_total || 0} kcal</p>
    </div>
    `;
    
    const macros = dayData.daily_macros_total;
    const totalCalories = dayData.daily_calories_total;
    
    if (macros && totalCalories > 0) {
    const proteinPercent = Math.round((macros.proteins * 4 / totalCalories) * 100);
    const carbPercent = Math.round((macros.carbs * 4 / totalCalories) * 100);
    const fatPercent = 100 - proteinPercent - carbPercent;
    
    // CORRECTION MACROS: On utilise un conteneur flex avec un gap
    cardBody.innerHTML += `
    <div class="flex flex-col gap-1 mt-2">
    <progress class="progress progress-primary w-full" value="${proteinPercent}" max="100" title="Protéines: ${proteinPercent}%"></progress>
    <progress class="progress progress-secondary w-full" value="${carbPercent}" max="100" title="Glucides: ${carbPercent}%"></progress>
    <progress class="progress progress-accent w-full" value="${fatPercent}" max="100" title="Lipides: ${fatPercent}%"></progress>
    </div>
    `;
    }
    
    const mealsContainer = document.createElement('div');
    // CORRECTION REMPLISSAGE: flex-grow pousse ce conteneur à prendre toute la place disponible
    mealsContainer.className = 'space-y-2 mt-4 flex-grow'; 
    cardBody.appendChild(mealsContainer);
    dayCard.appendChild(cardBody);
    
    const mealsOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
    mealsOrder.forEach(mealType => {
    if (mealType === 'snack' && planType !== '3 repas et 1 collation') return;
    const meal = dayData.meals[mealType];
    if (meal && meal.name) {
    const mealCard = document.createElement('div');
    mealCard.className = 'card card-compact bg-base-200/50';
    const iconSvg = `<svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`;
    
    mealCard.innerHTML = `
    <div class="card-body flex-row items-center p-2">
    <div class="flex-grow">
    <p class="font-bold text-xs text-primary uppercase tracking-wider">${mealTypeLabels[mealType] || mealType}</p>
    <p class="text-sm leading-tight">${meal.name}</p>
    <p class="text-xs opacity-60">${meal.calories || 'N/A'} kcal</p>
    </div>
    <div class="card-actions">
    <button class="btn btn-ghost btn-square btn-sm">${iconSvg}</button>
    </div>
    </div>
    `;
    mealCard.querySelector('button').addEventListener('click', () => showMealDetails(dayIndex, mealType));
    mealsContainer.appendChild(mealCard);
    }
    });
    mealPlanDisplay.appendChild(dayCard);
    });
    }

    async function handleMenuGeneration() {
    const calorieTarget = parseInt(calorieTargetInput.value);
    const ingredients = ingredientsInput.value.trim();
    const planType = document.querySelector('input[name="plan-type"]:checked').value;

    if (!calorieTarget || calorieTarget <= 0) {
    alert(t('alerts.calcFirst'));
    return;
    }
    if (!ingredients) {
    alert(t('alerts.listIngredients'));
    return;
    }

    resultsContainer.classList.remove('hidden');
    resultsContainer.classList.add('loading');
    mealPlanDisplay.innerHTML = '';
    errorMessage.classList.add('hidden');
    
    const prompt = buildCreativeMenuPrompt(ingredients, planType);
    
    try {
    const responseText = await callGroqAPI(prompt, generateMenuBtn, true);
    const creativeMenu = JSON.parse(responseText);

    if (creativeMenu.status === 'error' || !creativeMenu.weeklyPlan) {
    throw new Error(creativeMenu.message || "L'IA n'a pas pu générer de menu.");
    }
    
    processedMenuData = await processAndScaleMenu(creativeMenu, calorieTarget, planType);
    renderMenu(processedMenuData.weeklyPlan);

    } catch (error) {
    handleError(error);
    } finally {
    resultsContainer.classList.remove('loading');
    }
    }

    function buildCreativeMenuPrompt(ingredientsList, menuStructure) {
    const jsonSchema = `{
    "status": "success" | "error", "message": "string",
    "weeklyPlan": [ { "day": "Lundi", "meals": {
    "breakfast": { "name": "string", "base_ingredients": [{"name": "string", "quantity": "number", "unit": "string"}], "preparation": "string" },
    "lunch": { "name": "string", "base_ingredients": [{"name": "string", "quantity": "number", "unit": "string"}], "preparation": "string" },
    "dinner": { "name": "string", "base_ingredients": [{"name": "string", "quantity": "number", "unit": "string"}], "preparation": "string" },
    "snack": { "name": "string", "base_ingredients": [{"name": "string", "quantity": "number", "unit": "string"}], "preparation": "string" }
    } } ],
    "added_staples": ["string"]
    }`;
    
    const languageTag = { fr: 'fr-FR', en: 'en-US', de: 'de-DE' }[currentLang] || 'fr-FR';

    return `**ROLE**: Expert nutritionist and creative chef. Generate a complete 7-day meal plan.
**CONTEXT**:
- Menu Structure: "${menuStructure}".
- Available Ingredients: [${ingredientsList}].
- Nutritional Goal: "Generate a menu that is balanced, with a good source of protein for lunch and dinner."

**RULES**:
- **CRITICAL**: Your entire response MUST be a single, valid JSON object matching the schema below. Do not include any comments.
- **LANGUAGE**: You MUST generate the entire response (meal names, ingredients, preparation steps) in ${languageTag}.
- **DO NOT calculate calories or macronutrients.** This is very important.
- For each meal, provide a name, a list of base ingredients with common culinary units (g, ml, pièce, tasse, cuillère à soupe, etc.), and preparation steps.
- The quantities should be for a standard single serving.
- You MUST prioritize using the available ingredients.
- You may add a MINIMAL number of common staples (salt, pepper, oil) if necessary. List them in 'added_staples'.
${jsonSchema}`;
    }

    function findCiqualEntry(ingredientName) {
    if (!fuse) return null;
    const results = fuse.search(ingredientName);
    return results.length > 0 ? results[0].item : null;
    }

    function convertToGrams(ingredientName, quantity, unit) {
    unit = unit.toLowerCase().replace(/s$/, '');
    if (unit === 'g' || unit === 'gramme') return quantity;
    if (unit === 'kg' || unit ==='kilogramme') return quantity * 1000;
    
    const lowerCaseIngredientName = ingredientName.toLowerCase();
    for (const key in UNIT_CONVERSIONS) {
    if (lowerCaseIngredientName.includes(key)) {
    const conversion = UNIT_CONVERSIONS[key];
    if (conversion[unit]) {
    return quantity * conversion[unit];
    }
    }
    }
    
    if (unit === 'ml' || unit === 'millilitre') return quantity;
    console.warn(`No conversion rule for: ${ingredientName} with unit ${unit}`);
    return null;
    }

    async function processAndScaleMenu(creativeMenu, dailyCalorieTarget, planType) {
    // 1. DÉFINITION DES RATIOS DE RÉPARTITION CALORIQUE
    const MEAL_RATIOS = {
    breakfast: 0.25, // 25% des calories
    lunch: 0.40,    // 40% des calories
    dinner: 0.35    // 35% des calories
    };
    const MEAL_RATIOS_WITH_SNACK = {
    breakfast: 0.20, // 20%
    lunch: 0.35,    // 35%
    dinner: 0.30,    // 30%
    snack: 0.15    // 15%
    };
    
    // On choisit le bon set de ratios en fonction du plan de l'utilisateur
    const activeRatios = planType === '3 repas et 1 collation' ? MEAL_RATIOS_WITH_SNACK : MEAL_RATIOS;
    
    let processedPlan = JSON.parse(JSON.stringify(creativeMenu));
    
    for (const day of processedPlan.weeklyPlan) {
    let dailyCaloriesTotal = 0;
    
    // 2. ON TRAITE CHAQUE REPAS INDIVIDUELLEMENT
    for (const mealType in activeRatios) {
    const meal = day.meals[mealType];
    if (!meal || !meal.base_ingredients) continue;
    
    // Calcul des calories de base POUR CE REPAS SEULEMENT
    let mealBaseCalories = 0;
    for (const ing of meal.base_ingredients) {
    const ciqualEntry = findCiqualEntry(ing.name);
    if (!ciqualEntry) continue;
    const baseGrams = convertToGrams(ing.name, ing.quantity, ing.unit);
    if (baseGrams !== null) {
    mealBaseCalories += (baseGrams / 100) * ciqualEntry.kcal;
    }
    }
    
    // Calcul de la cible calorique POUR CE REPAS SEULEMENT
    const mealTargetCalories = dailyCalorieTarget * activeRatios[mealType];
    
    // Calcul du facteur de scaling SPÉCIFIQUE À CE REPAS
    const scalingFactor = mealBaseCalories > 0 ? mealTargetCalories / mealBaseCalories : 0;
    
    // Mise à l'échelle des ingrédients de ce repas avec son facteur unique
    let finalMealCalories = 0, finalMealProteins = 0, finalMealCarbs = 0, finalMealFats = 0;
    let finalIngredients = [];
    
    for (const ing of meal.base_ingredients) {
    const ciqualEntry = findCiqualEntry(ing.name);
    if (!ciqualEntry) continue;
    const baseGrams = convertToGrams(ing.name, ing.quantity, ing.unit);
    if (baseGrams === null) continue;
    
    const finalGrams = baseGrams * scalingFactor;
    
    finalMealCalories += (finalGrams / 100) * ciqualEntry.kcal;
    finalMealProteins += (finalGrams / 100) * ciqualEntry.proteins;
    finalMealCarbs += (finalGrams / 100) * ciqualEntry.carbs;
    finalMealFats += (finalGrams / 100) * ciqualEntry.fats;
    finalIngredients.push({ item: ing.name, quantity: `${Math.round(finalGrams)} g` });
    }
    
    meal.ingredients = finalIngredients;
    delete meal.base_ingredients;
    meal.calories = Math.round(finalMealCalories);
    meal.proteins = Math.round(finalMealProteins);
    meal.carbs = Math.round(finalMealCarbs);
    meal.fats = Math.round(finalMealFats);
    dailyCaloriesTotal += meal.calories;
    }
    
    day.daily_calories_total = dailyCaloriesTotal;
    
    // La suite pour le calcul des macros totales reste la même logique
    let dailyProteinsTotal = 0, dailyCarbsTotal = 0, dailyFatsTotal = 0;
    Object.values(day.meals).forEach(meal => {
    if (meal && meal.calories) {
    if (!activeRatios[Object.keys(day.meals).find(key => day.meals[key] === meal)]) {
    // Ne rien faire si le repas n'est pas dans nos ratios actifs (ex: collation non désirée)
    } else {
    dailyProteinsTotal += meal.proteins || 0;
    dailyCarbsTotal += meal.carbs || 0;
    dailyFatsTotal += meal.fats || 0;
    }
    }
    });
    day.daily_macros_total = { proteins: dailyProteinsTotal, carbs: dailyCarbsTotal, fats: dailyFatsTotal };
    }
    return processedPlan;
    }
    
    function showMealDetails(dayIndex, mealType) {
    const recipe = processedMenuData.weeklyPlan[dayIndex].meals[mealType];
    if (!recipe) return;
    
    let ingredientsHtml = recipe.ingredients ? recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.item}</li>`).join('') : '';
    modalContent.innerHTML = `
    <form method="dialog">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <h3 class="font-bold text-lg text-primary">${recipe.name}</h3>
    <div class="py-4 space-y-4">
    <div class="text-center">
    <p class="font-semibold text-base-content/80 mb-1">${recipe.calories} kcal (calculé)</p>
    <div class="flex justify-center space-x-4 text-sm text-base-content/70 mb-4">
    <span><strong>P:</strong> ${recipe.proteins}g</span>
    <span><strong>G:</strong> ${recipe.carbs}g</span>
    <span><strong>L:</strong> ${recipe.fats}g</span>
    </div>
    </div>
    <div>
    <h4 class="font-bold">Ingrédients</h4>
    <ul class="list-disc list-inside mb-4">${ingredientsHtml}</ul>
    <h4 class="font-bold">Préparation</h4>
    <p class="text-sm">${recipe.preparation.replace(/\n/g, '<br>')}</p>
    </div>
    </div>
    `;
    modal.showModal();
    }
    
    async function callGroqAPI(prompt, buttonToDisable, isJsonMode = false) {
    if (buttonToDisable) {
    buttonToDisable.disabled = true;
    buttonToDisable.dataset.originalText = buttonToDisable.innerHTML;
    buttonToDisable.innerHTML = 'Génération...';
    }
    try {
    const response = await fetch(NETLIFY_FUNCTION_PATH, {
    method: 'POST', body: JSON.stringify({ prompt, isJsonMode }), headers: { 'Content-Type': 'application/json' }
    });
    const responseText = await response.text();
    if (!response.ok) {
    let errorMsg = `Erreur du serveur: ${response.status}`;
    try { errorMsg = JSON.parse(responseText).error || errorMsg; } catch (e) { if(responseText) errorMsg += ` - ${responseText}`; }
    throw new Error(errorMsg);
    }
    return responseText || null;
    } catch (error) {
    console.error("API Call failed:", error);
    throw error;
    } finally {
    if (buttonToDisable) {
    buttonToDisable.disabled = false;
    buttonToDisable.innerHTML = buttonToDisable.dataset.originalText;
    }
    }
    }

    function handleError(error) {
    console.error("Error:", error);
    let displayError = error.message;
    if (error instanceof SyntaxError) {
    displayError = "Erreur d'analyse : La réponse du serveur n'est pas un JSON valide. L'IA a peut-être eu un problème. Veuillez réessayer.";
    }
    errorMessage.textContent = displayError;
    errorMessage.classList.remove('hidden');
    }

    function handlePrint() {
    if (!processedMenuData || !processedMenuData.weeklyPlan) {
    alert(t('alerts.calcFirst'));
    return;
    }
    const shoppingList = {};
    processedMenuData.weeklyPlan.forEach(day => {
    Object.values(day.meals).forEach(meal => {
    if(meal && meal.ingredients) {
    meal.ingredients.forEach(ing => {
    const itemKey = ing.item.toLowerCase().trim();
    shoppingList[itemKey] = (shoppingList[itemKey] || 0) + 1; 
    });
    }
    });
    });
    
    let shoppingListHtml = '<h3>Votre Liste de Courses (ingrédients principaux)</h3><ul>';
    for(const item in shoppingList){ shoppingListHtml += `<li>${item.charAt(0).toUpperCase() + item.slice(1)}</li>`; }
    shoppingListHtml += '</ul>';
    
    if(processedMenuData.added_staples && processedMenuData.added_staples.length > 0){
    shoppingListHtml += '<h4>Ingrédients de base à prévoir</h4><ul>';
    processedMenuData.added_staples.forEach(item => { shoppingListHtml += `<li>${item}</li>`; });
    shoppingListHtml += '</ul>';
    }

    let planTableHtml = '<h2>Plan de la Semaine</h2><table><thead><tr><th>Jour</th><th>Petit-déjeuner</th><th>Déjeuner</th><th>Dîner</th><th>Collation</th></tr></thead><tbody>';
    processedMenuData.weeklyPlan.forEach(day => {
    planTableHtml += `<tr><td><strong>${day.day}</strong></td><td>${day.meals.breakfast?.name || ''}</td><td>${day.meals.lunch?.name || ''}</td><td>${day.meals.dinner?.name || ''}</td><td>${day.meals.snack?.name || ''}</td></tr>`;
    });
    planTableHtml += '</tbody></table>';

    let recipesHtml = '<h2>Recettes Détaillées</h2>';
    processedMenuData.weeklyPlan.forEach(day => {
    recipesHtml += `<div class="recipe-block"><h3>${day.day}</h3>`;
    Object.entries(day.meals).forEach(([mealType, meal]) => {
    if (meal && meal.name) {
    recipesHtml += `<h4>${meal.name} (${mealType}) - ${meal.calories} kcal</h4>`;
    if(meal.ingredients && meal.ingredients.length > 0) {
    recipesHtml += '<ul>' + meal.ingredients.map(ing => `<li>${ing.quantity} ${ing.item}</li>`).join('') + '</ul>';
    }
    if(meal.preparation) {
    recipesHtml += `<p>${meal.preparation.replace(/\n/g, '<br>')}</p>`;
    }
    }
    });
    recipesHtml += `</div>`;
    });

    printContentDiv.innerHTML = `<h1>Votre Menu Équilibre</h1>${planTableHtml}${shoppingListHtml}${recipesHtml}`;
    window.print();
    }
});
