// Le Dilemme — profile detection & contradiction analysis
// Traits accumulated from votes: utilitarian, empathic, loyal, logical, emotional,
// authoritarian, selfish, protective, conformist, rebellious, courage

window.PROFILES = [
  {
    key: "monstre_logique",
    name: "Monstre logique",
    short: "Maximise les vies sauvées au prix de toute proximité humaine.",
    long: "Vous avez choisi le calcul froid à chaque fois. Pour vous, cinq vaut toujours plus qu'un, peu importe qui sont les un et les cinq. Cohérence implacable, humanité optionnelle.",
    detector: (s) => s.utilitarian >= 8 && s.logical >= 6 && s.empathic <= 4
  },
  {
    key: "protecteur_emotionnel",
    name: "Protecteur émotionnel",
    short: "Protège vos proches, même quand le coût collectif est énorme.",
    long: "Pour vous, les liens biographiques sont sacrés. Vous préférez sacrifier l'humanité abstraite plutôt que ceux que vous aimez. La morale commence par chez vous.",
    detector: (s) => s.empathic >= 7 && s.protective >= 6 && s.loyal >= 5
  },
  {
    key: "loyaliste",
    name: "Loyaliste",
    short: "La loyauté à votre groupe pèse plus que les règles abstraites.",
    long: "Vous tenez vos camarades, votre famille, votre clan. Pas par conviction philosophique mais par fidélité élémentaire. Si on est avec vous, on l'est jusqu'au bout.",
    detector: (s) => s.loyal >= 7 && s.conformist >= 4
  },
  {
    key: "rebelle_moral",
    name: "Rebelle moral",
    short: "Refuse les règles établies quand votre conscience l'exige.",
    long: "Vous brisez les conventions quand elles vous semblent injustes. Tirer le levier, mentir au tribunal, dénoncer le voisin — vous agissez là où d'autres se réfugient dans la procédure.",
    detector: (s) => s.rebellious >= 6 && s.courage >= 4
  },
  {
    key: "humaniste_instable",
    name: "Humaniste instable",
    short: "Empathique mais incohérent — votre cœur varie selon le cas.",
    long: "Vous voulez bien faire, mais vos principes s'effondrent dès que les choses deviennent personnelles. Vous pleurez pour les uns et oubliez les autres.",
    detector: (s) => s.empathic >= 6 && s._coherence !== undefined && s._coherence < 0.6
  },
  {
    key: "calculateur_froid",
    name: "Calculateur froid",
    short: "Vous décidez par la raison, sans laisser l'émotion peser.",
    long: "Les chiffres parlent plus fort que les visages. Vous tenez l'utilitarisme jusqu'au bout — y compris quand il faut serrer les dents. Beaucoup vous admirent, peu vous suivent.",
    detector: (s) => s.logical >= 7 && s.emotional <= 3 && s.utilitarian >= 5
  },
  {
    key: "chaotique_empathique",
    name: "Chaotique empathique",
    short: "Vous sentez fort, vous agissez fort, mais sans ligne claire.",
    long: "Votre cœur tranche avant votre tête. Vous changez d'avis selon qui est à l'écran. C'est très humain. C'est aussi imprévisible.",
    detector: (s) => s.emotional >= 6 && s.logical <= 4
  },
  {
    key: "soumis_majorite",
    name: "Soumis à la majorité",
    short: "Vous suivez le groupe plus que vous ne le devancez.",
    long: "Vos choix s'alignent souvent sur ce que tout le monde ferait. Pas par lâcheté — par instinct de conformité. C'est le ciment social. Mais ça ne dérange personne, jamais.",
    detector: (s) => s.conformist >= 6 && s.rebellious <= 3
  }
];

window.DEFAULT_PROFILE = {
  key: "indecis",
  name: "Profil indécis",
  short: "Vos choix ne dessinent pas encore de pattern clair.",
  long: "Vous avez voté sur peu de dilemmes, ou de manière trop équilibrée pour qu'un profil dominant émerge. Continuez à jouer."
};

// =============== CONTRADICTION RULES ===============
// Each rule receives an array of {scenarioKey, choice, tagsAct, tagsWait} entries
// and returns a string if a contradiction is detected, else null.

window.CONTRADICTION_RULES = [
  {
    name: "sacrifice_anonyme_mais_pas_proche",
    check: (votes) => {
      // Sacrificed strangers (lever:base act) but refused for family (lever:proche wait)
      const base = votes["lever:base"];
      const proche = votes["lever:proche"];
      if (base === "act" && proche === "wait") {
        return "Vous avez sacrifié un inconnu pour en sauver cinq. Mais votre enfant ? Soudain, le calcul ne tient plus. Votre éthique semble dépendre de la proximité affective.";
      }
      return null;
    }
  },
  {
    name: "levier_oui_pont_non",
    check: (votes) => {
      const lever = votes["lever:base"];
      const bridge = votes["bridge:base"];
      if (lever === "act" && bridge === "wait") {
        return "Vous tirez un levier sans hésiter, mais vous refusez de pousser. Pourtant : un mort, cinq sauvés, dans les deux cas. C'est la doctrine du double effet — et c'est exactement le piège que Thomson visait.";
      }
      return null;
    }
  },
  {
    name: "innocent_sacrifie_selectif",
    check: (votes) => {
      // Sacrifice innocent in faux_coupable but refuse elsewhere
      const fauxCoupable = votes["justice:faux_coupable"];
      const medecin = votes["medecin:base"];
      if (fauxCoupable === "act" && medecin === "wait") {
        return "Vous acceptez d'écraser un innocent pour calmer une émeute, mais pas pour sauver cinq malades. Qu'est-ce qui change vraiment ? Le décor ?";
      }
      if (fauxCoupable === "wait" && medecin === "act") {
        return "Vous protégez l'innocent au tribunal mais pas à l'hôpital. La justice serait-elle moins légitime que la médecine pour décider qui meurt ?";
      }
      return null;
    }
  },
  {
    name: "liberte_individuelle_inverse",
    check: (votes) => {
      // Refused IA prediction but accepted preventive measures
      const iaJuge = votes["ia:juge"];
      const surveillance = votes["ia:surveillance"];
      if (iaJuge === "wait" && surveillance === "act") {
        return "Vous refusez d'arrêter les gens avant le crime, mais vous acceptez de tous les surveiller. La présomption d'innocence ne tient que tant qu'elle n'est pas confortable.";
      }
      return null;
    }
  },
  {
    name: "famille_oui_chien_non",
    check: (votes) => {
      const proche = votes["lever:proche"];
      const chien = votes["animaux:chien_vs_inconnus"];
      if (proche === "wait" && chien === "act") {
        return "Pour votre enfant, vous laisseriez cinq inconnus mourir. Mais votre chien, lui, vous l'abandonnez. La hiérarchie des amours est mathématiquement instable.";
      }
      return null;
    }
  },
  {
    name: "verite_selective",
    check: (votes) => {
      const diagnostic = votes["famille:diagnostic"];
      const dyingFather = votes["mensonge:dying_father"];
      if (diagnostic === "act" && dyingFather === "wait") {
        return "Vous dites la vérité à votre mère mourante, mais vous mentez à votre père mourant. La vérité dépend-elle de qui vous a aimé ?";
      }
      if (diagnostic === "wait" && dyingFather === "act") {
        return "Vous mentez à votre mère pour la protéger, mais vous tenez à dire la vérité à votre père. Le mensonge serait acceptable selon nos sentiments ?";
      }
      return null;
    }
  },
  {
    name: "punition_collective_double_standard",
    check: (votes) => {
      const ecole = votes["punition:ecole"];
      const famille = votes["punition:famille_terroriste"];
      if (ecole === "wait" && famille === "act") {
        return "Vous refusez de punir une classe pour un coupable inconnu, mais vous acceptez d'ostraciser une famille pour un terroriste qu'ils ne contrôlaient pas. Étrange asymétrie.";
      }
      return null;
    }
  },
  {
    name: "tyran_oui_peine_mort_non",
    check: (votes) => {
      const tyran = votes["lever:tyran"];
      const peineMort = votes["justice:peine_mort"];
      if (tyran === "act" && peineMort === "wait") {
        return "Vous tirez le levier pour tuer un dictateur, mais vous refusez la peine de mort pour un meurtrier d'enfants. La justice serait-elle moins légitime que votre conscience ?";
      }
      return null;
    }
  },
  {
    name: "argent_morale_glissante",
    check: (votes) => {
      const bills = votes["argent:bills"];
      const bribe = votes["argent:bribe"];
      if (bills === "act" && bribe === "wait") {
        return "Vous gardez 100 000 € trouvés sans témoin, mais vous refusez 50 000 € pour fermer les yeux sur deux morts statistiques. La frontière morale dépend du regard, pas du résultat.";
      }
      return null;
    }
  },
  {
    name: "consentement_variable",
    check: (votes) => {
      const volontaire = votes["bridge:volontaire"];
      const terminal = votes["medecin:terminal"];
      if (volontaire === "wait" && terminal === "act") {
        return "Vous respectez le « non, attendez » de l'homme sur le pont. Mais vous prélevez les organes d'un patient sans même lui dire son diagnostic. Le consentement compte selon votre arrangement ?";
      }
      return null;
    }
  },
  {
    name: "loyaute_ingroup_pure",
    check: (votes, traits) => {
      if (traits.loyal >= 8 && traits.utilitarian <= 3) {
        return "Vous protégez systématiquement vos proches au détriment des inconnus. Cohérent — mais aucun étranger ne compte vraiment pour vous.";
      }
      return null;
    }
  },
  {
    name: "tradition_selective",
    check: (votes) => {
      const corrida = votes["animaux:corrida"];
      const ecole = votes["punition:ecole"];
      if (corrida === "wait" && ecole === "act") {
        return "Vous défendez la corrida au nom de la tradition, mais vous brisez la procédure scolaire individuelle au nom de l'efficacité. La tradition est-elle juste ce que vous avez décidé de respecter ?";
      }
      return null;
    }
  }
];

// =============== SARCASTIC PHRASES AFTER REVEAL ===============
window.SARCASTIC_PHRASES = {
  act: [
    "Décision propre. Conséquences sales.",
    "Le levier vous remercie. Les victimes moins.",
    "Vous avez agi. L'histoire jugera. Probablement mal.",
    "Vous avez fait ce qu'il fallait. Vous dormirez quand même mal.",
    "Vous appelez ça de la morale ? Intéressant.",
    "Action engagée. Conscience à débourser.",
    "Le groupe vous regarde différemment, maintenant.",
    "C'est ça, l'utilitarisme. Vraiment ça."
  ],
  wait: [
    "L'inaction n'est pas l'innocence.",
    "Vous n'avez rien fait. Quelqu'un est mort quand même.",
    "Bien tenu. Vos principes saignent toutefois.",
    "La passivité est un choix actif.",
    "Vous appelez ça de la prudence ? Les morts appellent ça autrement.",
    "Pas vos mains, mais quand même vos minutes.",
    "Vous gardez votre âme. Le monde, lui, vous échappe.",
    "Belle abstention. Lourde aussi."
  ]
};

window.PHASE_PHRASES = {
  unanimous_act: [
    "Unanimité pour agir. Le groupe a tranché — la conscience pèse à plusieurs.",
    "Personne n'a flanché. Une morale collective ou une fuite collective ?",
    "Tous d'accord. C'est rare. C'est inquiétant."
  ],
  unanimous_wait: [
    "Personne n'a bougé. La passivité collective est aussi une décision.",
    "Le groupe préserve. À l'unanimité. C'est rassurant ou paralysant ?",
    "Tous immobiles. Vous formez peut-être une morale, peut-être un mur."
  ],
  split: [
    "Vous êtes divisés. Le dilemme a fait son travail.",
    "Le groupe se fracture. Bienvenue dans la vraie morale — celle où on n'est pas d'accord.",
    "Pas de consensus. Tant mieux : la pensée commence là."
  ],
  lone_wolf: [
    (name) => `${name}, vous êtes seul contre le groupe. C'est une position. Ou une solitude.`,
    (name) => `${name} a voté à contre-courant. À méditer — pour vous, ou pour les autres.`
  ]
};

// =============== PROFILE DETECTION ===============
window.detectProfile = function(traits, coherence) {
  const tagged = Object.assign({}, traits, { _coherence: coherence });
  for (const p of window.PROFILES) {
    if (p.detector(tagged)) return p;
  }
  return window.DEFAULT_PROFILE;
};

// =============== CONTRADICTION DETECTION ===============
window.detectContradictions = function(playerVotes, traits) {
  const results = [];
  for (const rule of window.CONTRADICTION_RULES) {
    const msg = rule.check(playerVotes, traits);
    if (msg) results.push({ rule: rule.name, message: msg });
  }
  return results;
};

// =============== COHERENCE SCORE ===============
// Returns 0-1 indicating how consistent the player's choices are based on traits
window.calculateCoherence = function(traits) {
  // High coherence = strong dominance in some traits, weak in others
  // Low coherence = traits scattered evenly (no strong stance)
  const values = Object.values(traits).filter(v => typeof v === "number");
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) return 0;
  // Concentration: max / sum. Higher = more focused profile
  const concentration = max / sum;
  // Scale to 0-1 where 0.2 (very dispersed) → 0, 0.5+ (focused) → 1
  return Math.min(1, Math.max(0, (concentration - 0.15) / 0.35));
};
