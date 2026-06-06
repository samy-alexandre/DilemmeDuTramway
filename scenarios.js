// Le Dilemme — scenarios data
// Each variant has: name, tagline, intensity, intro, labels, outcomes (with traits, contradictionTags), and optional shortLabels
//
// Traits (0-3 per choice): utilitarian, empathic, loyal, logical, emotional, authoritarian, selfish, protective, conformist, rebellious
// contradictionTags identify the moral stance taken — used to detect inconsistencies across rounds

window.CATEGORIES = {

  // =================== LEVER (tramway) ===================
  lever: {
    name: "Le levier", theme: "Action vs inaction",
    family: "trolley", sceneVariant: "classic",
    verbsPresent: { act: "Le levier est tiré...", wait: "Personne n'intervient..." },
    verbsAfter: { act: "Le tramway dévie vers la voie unique.", wait: "Le tramway file vers les cinq." },
    variants: {
      base: {
        name: "Le test classique", tagline: "Cinq inconnus, un inconnu", intensity: "moral",
        intro: "Un tramway fonce vers cinq inconnus. Tirer le levier le dévie vers une voie où un seul inconnu est attaché.",
        labels: { act: "Tirer le levier", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Conséquentialisme", title: "Une vie pour cinq",
            text: "Vous minimisez les morts. Position utilitariste classique (Bentham, Mill) — mais vous devenez l'agent direct d'une mort qui n'aurait pas eu lieu sans vous.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, logical: 2, rebellious: 1 },
            contradictionTags: ["sacrifice_one_for_many", "active_intervention", "abstract_stake"] },
          wait: { tag: "Déontologie", title: "Ne pas être l'agent",
            text: "Position kantienne : on ne traite pas une personne comme un simple moyen. La distinction entre tuer et laisser mourir compte moralement. Mais cinq meurent.",
            deaths: 5, saved: 0,
            traits: { protective: 1, emotional: 1, conformist: 1 },
            contradictionTags: ["preserve_one", "passive_observation", "rights_first"] }
        }
      },
      jeunesse: {
        name: "La jeunesse contre la vieillesse", tagline: "Toutes les années valent-elles pareil ?", intensity: "moral",
        intro: "Sur la voie principale, cinq étudiants de vingt ans. Sur la voie déviée, un homme de quatre-vingt-cinq ans en fin de vie.",
        labels: { act: "Sacrifier le vieillard", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Utilitarisme prospectif", title: "Maximiser les années sauvées",
            text: "La logique des QALYs en bioéthique : valoriser les années restantes. Peter Singer la défend. Mais elle revient à dire qu'une vie de vieillard « vaut moins ».",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, logical: 2 },
            contradictionTags: ["age_discrimination", "sacrifice_one_for_many"] },
          wait: { tag: "Égalitarisme moral", title: "Toute vie a la même valeur",
            text: "Toute personne a une dignité égale (Kant), indépendamment de son âge. Mais cinq jeunes meurent — beaucoup d'années perdues pour le monde.",
            deaths: 5, saved: 0,
            traits: { protective: 2, emotional: 1 },
            contradictionTags: ["equal_dignity", "rights_first"] }
        }
      },
      proche: {
        name: "Votre enfant sur la voie", tagline: "L'impartialité, jusqu'où ?", intensity: "dark",
        intro: "Sur la voie principale, cinq inconnus. Sur la voie déviée, votre propre enfant.",
        labels: { act: "Sacrifier votre enfant", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Impartialité cosmopolite", title: "Aucune vie ne pèse plus",
            text: "L'impartialité jusqu'au bout : votre enfant ne vaut pas plus que cinq inconnus (Peter Singer). Théoriquement cohérente, quasiment personne ne la tiendrait.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, logical: 3, rebellious: 2 },
            contradictionTags: ["sacrifice_one_for_many", "outgroup_priority", "deny_personal_bond"] },
          wait: { tag: "Devoirs spéciaux", title: "Les liens ont une valeur morale",
            text: "Les liens biographiques sont moralement chargés (Bernard Williams). Un parent qui n'aurait aucune préférence pour son enfant serait monstrueux. Mais cinq autres meurent.",
            deaths: 5, saved: 0,
            traits: { empathic: 3, loyal: 3, protective: 3, emotional: 2 },
            contradictionTags: ["family_first", "personal_stake", "ingroup_priority"] }
        }
      },
      tyran: {
        name: "Le tyran utile", tagline: "Le monstre qui détient un secret", intensity: "dark",
        intro: "Le tramway fonce vers un dictateur déchu, seul sur la voie — il va mourir. Mais lui seul connaît l'emplacement de milliers de prisonniers politiques enfermés dans des camps secrets. Tirer le levier le dévie vers une voie de garage où travaille un cheminot, et le sauve.",
        labels: { act: "Le sauver (tuer le cheminot)", wait: "Le laisser mourir" },
        outcomes: {
          act: { tag: "Le calcul des otages", title: "Garder en vie celui qu'on hait",
            text: "Vous sacrifiez un innocent pour qu'un monstre vive et parle — et que des milliers d'otages aient une chance d'être retrouvés. Maintenir en vie l'être le plus haïssable parce qu'il est utile est un déchirement : c'est le dilemme de tous ceux qui négocient avec des criminels pour sauver des vies.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, logical: 3, rebellious: 1 },
            contradictionTags: ["sacrifice_one_for_many", "long_term_thinking", "instrumental_keep"] },
          wait: { tag: "La justice immédiate", title: "Le monstre meurt, le secret aussi",
            text: "Vous laissez le tramway faire ce que la justice n'a pas osé. Le dégoût est soulagé, un génocidaire disparaît. Mais des milliers de prisonniers, dont lui seul connaissait l'emplacement, sont condamnés à disparaître avec lui. La satisfaction de la justice contre des vies bien réelles.",
            deaths: 0, saved: 1,
            traits: { emotional: 3, authoritarian: 2, protective: 1 },
            contradictionTags: ["moral_desert", "short_term", "emotional_justice"] }
        }
      },
      chercheuse: {
        name: "La chercheuse en oncologie", tagline: "Une vie « utile » vaut-elle plus ?", intensity: "moral",
        intro: "Sur la voie principale, cinq ouvriers du bâtiment. Sur la voie déviée, une chercheuse sur le point de découvrir un traitement majeur contre le cancer.",
        labels: { act: "Sacrifier la chercheuse", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Égalité stricte", title: "Cinq vaut plus qu'une",
            text: "Aucun être humain n'a plus de valeur qu'un autre, peu importe la profession. Égalitarisme strict.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, logical: 1 },
            contradictionTags: ["sacrifice_one_for_many", "equal_dignity"] },
          wait: { tag: "Utilitarisme prospectif", title: "Compter les vies futures",
            text: "Sauver la chercheuse pourrait sauver des millions à terme. Mais hiérarchiser les vies par leur « utilité sociale » est historiquement dangereux (eugénisme, productivisme nazi).",
            deaths: 5, saved: 0,
            traits: { logical: 2, utilitarian: 2, authoritarian: 1 },
            contradictionTags: ["social_utility", "preserve_one", "instrumental_value"] }
        }
      }
    }
  },

  // =================== BRIDGE ===================
  bridge: {
    name: "Le pont", theme: "Utiliser un corps comme moyen",
    family: "trolley", sceneVariant: "bridge",
    verbsPresent: { act: "L'homme est poussé du pont...", wait: "Personne ne bouge..." },
    verbsAfter: { act: "Le tramway s'écrase contre lui.", wait: "Le tramway file vers les cinq." },
    variants: {
      base: {
        name: "Le pousseur", tagline: "Pousser un corps inconnu", intensity: "moral",
        intro: "Sur un pont, un homme corpulent inconnu. Sa masse peut arrêter le tramway et sauver les cinq.",
        labels: { act: "Pousser l'homme", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Le calcul froid", title: "Utiliser un corps comme instrument",
            text: "Bilan identique au levier — seuls dix pour cent des gens choisissent de pousser. Le corps devient l'instrument du sauvetage. Doctrine du double effet : la mort comme moyen pèse plus lourd que la mort collatérale.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, logical: 2, rebellious: 2 },
            contradictionTags: ["sacrifice_one_for_many", "instrumental_use", "active_intervention", "physical_violence"] },
          wait: { tag: "Le tabou de l'usage", title: "Ne pas toucher l'innocent",
            text: "On ne touche pas physiquement à un innocent pour en sauver d'autres. Nos jugements ne sont pas purement utilitaires : la manière compte autant que le résultat.",
            deaths: 5, saved: 0,
            traits: { protective: 2, emotional: 2, conformist: 1 },
            contradictionTags: ["preserve_one", "no_physical_violence", "rights_first"] }
        }
      },
      criminel: {
        name: "Le présumé coupable", tagline: "Et si l'avis de recherche se trompait ?", intensity: "moral",
        intro: "L'homme corpulent à vos côtés ressemble au meurtrier en cavale de l'avis de recherche affiché en gare. Vous n'en êtes pas certain. Le pousser arrêterait le tramway et sauverait les cinq.",
        labels: { act: "Le pousser", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Justice expéditive", title: "Et si vous vous trompiez ?",
            text: "Vous pariez sur une ressemblance pour vous autoriser à tuer. Les erreurs d'identification ont envoyé d'innombrables innocents à la mort. Vous combinez l'arithmétique (un pour cinq) et une rétribution non prouvée — la définition même de la justice expéditive.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, authoritarian: 2, rebellious: 1 },
            contradictionTags: ["sacrifice_one_for_many", "moral_desert", "vigilante_justice"] },
          wait: { tag: "Le doute protège", title: "On ne tue pas sur une ressemblance",
            text: "Vous refusez de transformer un soupçon en condamnation à mort. Même un coupable avéré aurait droit à un procès ; un simple ressemblant, à plus forte raison. Mais cinq personnes meurent pendant que vous doutez.",
            deaths: 5, saved: 0,
            traits: { logical: 2, protective: 2 },
            contradictionTags: ["preserve_one", "due_process", "rights_first"] }
        }
      },
      sauveur: {
        name: "L'homme qui vous a sauvé la vie", tagline: "Trahir une dette", intensity: "dark",
        intro: "L'homme corpulent à vos côtés vous a sauvé la vie il y a dix ans en plongeant dans une rivière gelée. Sa masse peut arrêter le tramway.",
        labels: { act: "Pousser votre sauveur", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Impartialité totale", title: "Aucun lien ne compte plus",
            text: "Vous mettez la gratitude de côté pour le bien collectif. Cohérent avec l'impartialité, mais c'est un déchirement profond.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, logical: 3, rebellious: 2 },
            contradictionTags: ["sacrifice_one_for_many", "deny_personal_bond", "outgroup_priority"] },
          wait: { tag: "Devoirs de gratitude", title: "La dette compte moralement",
            text: "La reconnaissance est un fondement moral réel (Cicéron, Aristote). Sacrifier votre sauveur, c'est tuer quelque chose en vous.",
            deaths: 5, saved: 0,
            traits: { loyal: 3, empathic: 2, emotional: 2 },
            contradictionTags: ["personal_stake", "loyalty_first", "ingroup_priority"] }
        }
      },
      volontaire: {
        name: "Le sacrifice ambigu", tagline: "Le consentement retiré", intensity: "moral",
        intro: "L'homme corpulent dit : « Poussez-moi, sauvez-les. » Puis au dernier instant : « Non, attendez... »",
        labels: { act: "Pousser quand même", wait: "Respecter sa volte-face" },
        outcomes: {
          act: { tag: "Consentement initial", title: "Sa première parole compte",
            text: "Le consentement peut-il être retiré au dernier moment ? Le « non » tardif a-t-il moins de poids que le « oui » donné dans l'urgence ?",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, authoritarian: 1, logical: 2 },
            contradictionTags: ["sacrifice_one_for_many", "consent_overridden"] },
          wait: { tag: "Autonomie jusqu'au bout", title: "Le dernier mot l'emporte",
            text: "Le consentement doit être maintenu jusqu'à l'acte (principe bioéthique). Son ultime parole est sa volonté véritable. Mais cinq meurent à cause d'une hésitation.",
            deaths: 5, saved: 0,
            traits: { protective: 2, empathic: 2 },
            contradictionTags: ["consent_respected", "rights_first"] }
        }
      }
    }
  },

  // =================== MEDECIN ===================
  medecin: {
    name: "Le médecin", theme: "Utilitarisme médical",
    family: "hospital", sceneVariant: null,
    verbsPresent: { act: "L'opération est pratiquée...", wait: "Aucune intervention..." },
    verbsAfter: { act: "Le patient sain meurt ; cinq sont sauvés.", wait: "Les cinq s'éteignent faute d'organes." },
    variants: {
      base: {
        name: "Cinq organes, un donneur", tagline: "L'utilitarisme jusqu'à l'absurde", intensity: "dark",
        intro: "Cinq patients vont mourir, chacun par défaillance d'un organe différent. Un patient sain entre pour un examen de routine : ses cinq organes pourraient sauver les cinq autres.",
        labels: { act: "Prélever les organes", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Utilitarisme strict", title: "Le calcul jusqu'au bout",
            text: "Presque personne n'accepte ce scénario, même parmi ceux qui tirent le levier sans hésiter. L'arithmétique est pourtant la même. Argument classique contre l'utilitarisme pur.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, logical: 3, rebellious: 3 },
            contradictionTags: ["sacrifice_one_for_many", "instrumental_use", "violate_trust"] },
          wait: { tag: "Droits inviolables", title: "Aucun bénéfice n'autorise",
            text: "Il existe des droits qu'aucun bénéfice ne peut renverser. Sans cette barrière, qui irait encore consulter un médecin ?",
            deaths: 5, saved: 0,
            traits: { protective: 3, logical: 2 },
            contradictionTags: ["preserve_one", "rights_first", "institutional_trust"] }
        }
      },
      condamne: {
        name: "Le détenu en sursis", tagline: "Un condamné devient-il donneur ?", intensity: "dark",
        intro: "Le patient sain est un condamné à mort en sursis légal. Médicalement, ses organes sauveraient les cinq.",
        labels: { act: "Prélever les organes", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Le mort sursitaire", title: "Sa vie est déjà condamnée",
            text: "Sa mort est imminente, autant que ses organes servent. Mais transformer la justice en pourvoyeuse d'organes ? Cas documenté en Chine sur prisonniers exécutés.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, authoritarian: 2, logical: 2 },
            contradictionTags: ["sacrifice_one_for_many", "moral_desert", "instrumental_use"] },
          wait: { tag: "Pas de double peine", title: "La condamnation ne donne pas le corps",
            text: "Une peine de mort ne transforme pas le corps en ressource publique. Le condamné reste sujet de droits jusqu'à son exécution.",
            deaths: 5, saved: 0,
            traits: { protective: 2, logical: 2 },
            contradictionTags: ["preserve_one", "rights_first", "due_process"] }
        }
      },
      enfants: {
        name: "Cinq enfants malades", tagline: "L'âge change-t-il le calcul ?", intensity: "dark",
        intro: "Cinq enfants de huit ans vont mourir, chacun d'un organe. Un adulte sain entre pour un examen.",
        labels: { act: "Prélever les organes", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "Années sauvées au maximum", title: "Cinq vies entières devant elles",
            text: "Cinq enfants représentent près de trois cents années potentielles. Le « gain » utilitariste est massif. Mais l'horreur de tuer un innocent pour ses organes ne disparaît pas.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, protective: 2, logical: 2 },
            contradictionTags: ["sacrifice_one_for_many", "age_discrimination", "instrumental_use"] },
          wait: { tag: "Inviolabilité multipliée", title: "Le nombre ne crée pas le droit",
            text: "Aucun nombre ne convertit un meurtre en acte médical. La barrière déontologique tient face à l'arithmétique.",
            deaths: 5, saved: 0,
            traits: { protective: 2, logical: 2 },
            contradictionTags: ["preserve_one", "rights_first", "equal_dignity"] }
        }
      },
      terminal: {
        name: "Le donneur condamné par la maladie", tagline: "Une vie qui s'éteint déjà", intensity: "dark",
        intro: "Le patient sain a une maladie incurable que vous venez de diagnostiquer (il l'ignore). Six mois à vivre. Ses organes pourraient sauver les cinq.",
        labels: { act: "Prélever les organes", wait: "Ne rien faire" },
        outcomes: {
          act: { tag: "L'occasion finale", title: "Une mort qui sauve",
            text: "Il va mourir de toute façon. Mais décider à sa place de la fin de sa vie sans même lui dire son diagnostic ? Paternalisme médical absolu.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 2, authoritarian: 2, selfish: 1 },
            contradictionTags: ["sacrifice_one_for_many", "consent_overridden", "paternalism"] },
          wait: { tag: "Autonomie informée", title: "C'est à lui de choisir",
            text: "Il a droit à connaître son état et décider lui-même du don d'organes. Le paternalisme médical, c'est ce que la bioéthique moderne a démonté.",
            deaths: 5, saved: 0,
            traits: { empathic: 2, protective: 2 },
            contradictionTags: ["consent_respected", "rights_first", "autonomy"] }
        }
      },
      vaccin: {
        name: "Le vaccin imparfait", tagline: "Sauver des millions, tuer un sur dix mille", intensity: "dark",
        intro: "Un vaccin sauvera des millions de personnes d'une pandémie. Mais vous savez qu'il tuera, statistiquement, un enfant sur dix mille.",
        labels: { act: "Le rendre obligatoire", wait: "Le refuser" },
        outcomes: {
          act: { tag: "Santé publique utilitariste", title: "Le calcul des grands nombres",
            text: "C'est exactement le calcul que font les agences sanitaires : un risque résiduel acceptable face à un bénéfice énorme. Mais les familles des enfants morts vivent un drame absolu — un risque collectif anonyme devient une mort personnelle inacceptable.",
            deaths: 1, saved: 5,
            traits: { utilitarian: 3, authoritarian: 2, logical: 3 },
            contradictionTags: ["sacrifice_few_for_many", "public_health", "statistical_lives"] },
          wait: { tag: "Précaution maximale", title: "On ne tue pas pour sauver",
            text: "Imposer un acte médical qui tuera est moralement différent de laisser une pandémie tuer. Un échec n'est pas un meurtre. Mais des millions meurent par votre refus.",
            deaths: 5, saved: 0,
            traits: { protective: 3, rebellious: 2 },
            contradictionTags: ["preserve_few", "rights_first", "no_imposed_harm"] }
        }
      }
    }
  },

  // =================== ARGENT ===================
  argent: {
    name: "L'argent", theme: "Quand le calcul devient personnel",
    family: "abstract", label: "L'ARGENT", emblem: "money",
    verbsPresent: { act: "La décision est prise...", wait: "Vous gardez l'inaction..." },
    verbsAfter: { act: "Le choix engage tout votre rapport à l'argent.", wait: "Le statu quo l'emporte." },
    variants: {
      heritage: {
        name: "L'héritage", tagline: "Famille ou bénéfice global", intensity: "moral",
        intro: "Un million d'euros à léguer. Soit à votre enfant unique, soit à une ONG qui sauvera statistiquement cent enfants de la malnutrition.",
        labels: { act: "Léguer à l'ONG", wait: "Léguer à votre enfant" },
        shortLabels: { act: "ONG\n100 enfants\nsauvés", wait: "Votre enfant\nbien doté" },
        outcomes: {
          act: { tag: "Impartialité radicale", title: "Cent vies pèsent plus qu'un héritier",
            text: "Position de Peter Singer : sauver cent vies pèse plus qu'enrichir un héritier. Quasi-totalité des parents fortunés du monde la rejette pourtant.",
            traits: { utilitarian: 3, logical: 2, rebellious: 2 },
            contradictionTags: ["outgroup_priority", "deny_personal_bond"] },
          wait: { tag: "Devoirs familiaux", title: "L'héritage est un acte d'amour",
            text: "L'héritage structure la transmission depuis des millénaires : pas seulement de l'argent, une continuité. Mais cent enfants meurent que vous auriez pu sauver.",
            traits: { loyal: 3, empathic: 2, conformist: 2 },
            contradictionTags: ["family_first", "ingroup_priority"] }
        }
      },
      bills: {
        name: "Le sac de billets", tagline: "L'anneau de Gygès", intensity: "soft",
        intro: "Vous trouvez cent mille euros dans un parking désert. Aucune caméra, aucun témoin.",
        labels: { act: "Le garder", wait: "Le rendre" },
        shortLabels: { act: "100 000 €\nsans témoin", wait: "Honnêteté\ninvisible" },
        outcomes: {
          act: { tag: "Anneau de Gygès", title: "La vertu testée hors regard",
            text: "Platon imagine dans la République un anneau qui rend invisible. Vous démontrez que votre vertu dépendait du regard d'autrui.",
            traits: { selfish: 2, rebellious: 2, logical: 1 },
            contradictionTags: ["self_interest", "no_witness_principle"] },
          wait: { tag: "Vertu sans témoin", title: "L'intégrité comme principe",
            text: "Kant : agir comme si la maxime devait être universalisée. Vous prouvez que votre intégrité ne dépend pas de la surveillance.",
            traits: { logical: 2, conformist: 2 },
            contradictionTags: ["principled_action", "universal_maxim"] }
        }
      },
      bribe: {
        name: "Le pot-de-vin", tagline: "Argent contre statistique", intensity: "dark",
        intro: "Un client propose 50 000 € pour fermer les yeux sur un défaut qui causera, statistiquement, deux morts par an parmi les utilisateurs.",
        labels: { act: "Accepter le pot-de-vin", wait: "Refuser et alerter" },
        shortLabels: { act: "50 000 €\n2 morts/an\nstatistiques", wait: "Carrière\nà risque" },
        outcomes: {
          act: { tag: "Diffusion morale", title: "Les morts statistiques sont diffuses",
            text: "Mécanisme exact des scandales industriels (amiante, Volkswagen, opioïdes) : aucun acteur ne se sent personnellement meurtrier.",
            traits: { selfish: 3, logical: 1, rebellious: 1 },
            contradictionTags: ["self_interest", "statistical_lives", "complicity"] },
          wait: { tag: "Lanceur d'alerte", title: "Les morts statistiques sont des morts",
            text: "Deux morts par an = deux familles. Mais devenir lanceur d'alerte ruine souvent la carrière du messager.",
            traits: { protective: 2, courage: 3, rebellious: 2 },
            contradictionTags: ["whistleblower", "moral_clarity"] }
        }
      },
      insurance: {
        name: "L'assurance vie", tagline: "Fraude par amour", intensity: "moral",
        intro: "Votre conjoint en phase terminale demande votre aide pour simuler un accident — l'assurance vie ne paie pas pour une mort « prévisible ».",
        labels: { act: "L'aider à simuler", wait: "Refuser" },
        shortLabels: { act: "Famille\nà l'abri\n(fraude)", wait: "Précarité\nhonnête" },
        outcomes: {
          act: { tag: "Amour transgressif", title: "L'amour contre la légalité",
            text: "Vous priorisez la sécurité matérielle de vos proches. Crime, mais qui ne lèse qu'une compagnie qui a parié contre vous.",
            traits: { loyal: 3, empathic: 2, rebellious: 2 },
            contradictionTags: ["family_first", "rule_breaking", "loyalty_first"] },
          wait: { tag: "Respect du contrat", title: "La loi tient même par compassion",
            text: "Vous respectez la loi. Mais votre famille reste dans la précarité alors qu'un mensonge bien fait l'aurait évitée.",
            traits: { conformist: 2, logical: 2 },
            contradictionTags: ["rule_following", "principled_action"] }
        }
      }
    }
  },

  // =================== FAMILLE ===================
  famille: {
    name: "La famille", theme: "Vérité, loyauté, secrets",
    family: "abstract", label: "LA FAMILLE", emblem: "family",
    verbsPresent: { act: "Vous prenez la parole...", wait: "Vous gardez le silence..." },
    verbsAfter: { act: "Le secret est brisé.", wait: "Le statu quo persiste." },
    variants: {
      infidelity: {
        name: "L'infidélité du conjoint", tagline: "Briser une vie par vérité", intensity: "moral",
        intro: "Vous avez la preuve formelle que le conjoint de votre meilleur·e ami·e le/la trompe depuis deux ans. Le dire ou se taire ?",
        labels: { act: "Le lui dire", wait: "Se taire" },
        shortLabels: { act: "Vérité\ndouloureuse", wait: "Silence\ncomplice" },
        outcomes: {
          act: { tag: "Droit à la vérité", title: "Un mensonge subi est pire",
            text: "Votre ami·e construit sa vie sur une fausse hypothèse. Vous lui rendez la capacité de choisir. Mais beaucoup ne pardonnent jamais au messager.",
            traits: { logical: 2, courage: 2, rebellious: 1 },
            contradictionTags: ["truth_priority", "intervene_relationships"] },
          wait: { tag: "Respect du couple", title: "Ce n'est pas votre histoire",
            text: "La révélation appartient à celui qui trompe, pas à un tiers. Mais vous laissez votre ami·e vivre dans le mensonge.",
            traits: { conformist: 2, protective: 1, emotional: 1 },
            contradictionTags: ["comfort_priority", "non_intervention"] }
        }
      },
      adoption: {
        name: "L'adoption cachée", tagline: "Héritage et silence", intensity: "moral",
        intro: "Vos parents adoptifs vous ont caché votre adoption pendant trente ans. Vous découvrez que votre père biologique est encore vivant.",
        labels: { act: "Contacter le père biologique", wait: "Respecter le silence familial" },
        shortLabels: { act: "Connaître\nses origines", wait: "Honorer\nles parents adoptifs" },
        outcomes: {
          act: { tag: "Droit aux origines", title: "Connaître d'où l'on vient",
            text: "Droit fondamental à connaître vos origines (Convention internationale des droits de l'enfant). Mais vous trahissez le secret porté par vos parents pendant trente ans.",
            traits: { rebellious: 2, courage: 1, logical: 1 },
            contradictionTags: ["truth_priority", "self_discovery"] },
          wait: { tag: "Loyauté élective", title: "Ceux qui vous ont élevé",
            text: "La famille n'est pas le sang mais l'histoire partagée. Mais vous renoncez à une part de vous-même.",
            traits: { loyal: 3, empathic: 2, conformist: 1 },
            contradictionTags: ["loyalty_first", "family_first", "ingroup_priority"] }
        }
      },
      diagnostic: {
        name: "Le diagnostic de votre mère", tagline: "La vérité qui tue avant", intensity: "moral",
        intro: "Votre mère, soixante-quinze ans, vous demande la vérité sur son état. Le médecin vous a dit qu'elle ne survivra pas trois mois — elle l'ignore.",
        labels: { act: "Lui dire la vérité", wait: "Mentir par compassion" },
        shortLabels: { act: "Vérité\n+ 3 mois\nde lucidité", wait: "Mensonge\n+ 3 mois\nd'illusion" },
        outcomes: {
          act: { tag: "Autonomie informée", title: "Le droit de savoir",
            text: "Elle a le droit de savoir, de mettre ses affaires en ordre, de dire au revoir. Mais elle vivra ses trois derniers mois dans la terreur du compte à rebours.",
            traits: { logical: 2, rebellious: 1, courage: 2 },
            contradictionTags: ["truth_priority", "respect_autonomy"] },
          wait: { tag: "Paternalisme protecteur", title: "Le confort avant la vérité",
            text: "Vous priorisez son confort psychologique. Position du paternalisme médical traditionnel. Mais vous lui volez la possibilité d'utiliser ces trois mois.",
            traits: { protective: 3, empathic: 2, conformist: 1 },
            contradictionTags: ["comfort_priority", "paternalism"] }
        }
      },
      abortion: {
        name: "Le désaccord parental", tagline: "Le couple face à l'enfance", intensity: "dark",
        intro: "Vous êtes enceinte par accident, dans un couple stable. Votre conjoint souhaite vivement garder l'enfant. Vous, non. Aucune raison médicale.",
        labels: { act: "Avorter", wait: "Garder l'enfant" },
        shortLabels: { act: "Autonomie\ncorporelle\n+ couple à risque", wait: "Couple sauvé\n+ enfant non désiré" },
        outcomes: {
          act: { tag: "Autonomie corporelle", title: "Votre corps, votre décision",
            text: "Aucune autre personne, conjoint inclus, n'a de droit sur votre corps (Simone de Beauvoir). Mais vous risquez de perdre votre couple.",
            traits: { rebellious: 2, courage: 2, logical: 2 },
            contradictionTags: ["autonomy", "self_determination"] },
          wait: { tag: "Projet commun", title: "Le couple comme priorité",
            text: "Vous priorisez le projet commun. Certaines mères l'assument finalement avec amour. Mais vous porterez un enfant que vous ne vouliez pas.",
            traits: { loyal: 2, empathic: 2, conformist: 2 },
            contradictionTags: ["relationship_priority", "compromise_self"] }
        }
      }
    }
  },

  // =================== GUERRE ===================
  guerre: {
    name: "La guerre", theme: "Loyauté, courage, désobéissance",
    family: "abstract", label: "LA GUERRE", emblem: "war",
    verbsPresent: { act: "L'acte est commis...", wait: "L'inaction l'emporte..." },
    verbsAfter: { act: "Les conséquences sont engagées.", wait: "Le silence pèse." },
    variants: {
      interrogation: {
        name: "L'interrogatoire", tagline: "Ta vie contre une trahison", intensity: "dark",
        intro: "Résistant capturé et torturé. Vos bourreaux exigent un seul nom : celui de votre chef de réseau. Le donner arrête tout et vous sauve la vie. Vous taire, c'est mourir sous la torture — sans aucune certitude de tenir jusqu'au bout.",
        labels: { act: "Donner le nom", wait: "Se taire et mourir" },
        shortLabels: { act: "Survivre\n(trahir le chef)", wait: "Mourir\n(protéger)" },
        outcomes: {
          act: { tag: "L'instinct de survie", title: "La vie contre la trahison",
            text: "Vous choisissez de vivre. Personne n'a le droit de juger un être brisé par la torture. Mais vous livrez celui qui vous faisait confiance — et son arrestation peut faire tomber le réseau entier. Vous vivrez avec ce nom prononcé.",
            traits: { selfish: 2, logical: 1, conformist: 1 },
            contradictionTags: ["self_preservation", "betray_trust", "pragmatic"] },
          wait: { tag: "Le sacrifice", title: "Mourir sans parler",
            text: "Vous protégez votre chef au prix de votre vie. Héroïsme à l'état pur. Mais la torture brise presque tout le monde : vous pourriez mourir ET finir par parler — le pire des deux mondes. Le courage n'est pas une garantie.",
            traits: { courage: 3, loyal: 3, emotional: 1 },
            contradictionTags: ["self_sacrifice", "loyalty_first", "heroic_stance"] }
        }
      },
      deserter: {
        name: "Le déserteur", tagline: "Le maquis ou la famille", intensity: "moral",
        intro: "On vous demande de quitter votre femme enceinte pour rejoindre le maquis. Refuser passera pour de la lâcheté.",
        labels: { act: "Rejoindre le maquis", wait: "Rester avec la famille" },
        shortLabels: { act: "Lutte\ncollective", wait: "Famille\nimmédiate" },
        outcomes: {
          act: { tag: "Engagement politique", title: "L'urgence historique",
            text: "L'urgence historique l'emporte sur le confort familial. Mais votre enfant naîtra peut-être sans vous, et votre femme vous en voudra peut-être.",
            traits: { courage: 2, utilitarian: 2, rebellious: 1 },
            contradictionTags: ["collective_priority", "self_sacrifice", "outgroup_priority"] },
          wait: { tag: "Devoir immédiat", title: "Ceux dont vous êtes responsable",
            text: "Sartre raconte ce dilemme dans L'existentialisme est un humanisme. Mais l'Histoire vous jugera si la résistance échoue.",
            traits: { loyal: 3, protective: 3, empathic: 2 },
            contradictionTags: ["family_first", "ingroup_priority", "personal_stake"] }
        }
      },
      collabo: {
        name: "Le voisin collaborateur", tagline: "Vengeance ou justice", intensity: "dark",
        intro: "Votre voisin a dénoncé une famille juive cachée chez vous, qui a été exterminée. La guerre est finie. La justice sera probablement clémente.",
        labels: { act: "Le tuer", wait: "Laisser la justice faire" },
        shortLabels: { act: "Vengeance\npersonnelle", wait: "État de droit\n(probablement clément)" },
        outcomes: {
          act: { tag: "Justice privée", title: "Quand l'État faillit",
            text: "Position défendue historiquement par les vengeurs juifs après-guerre (groupe Nakam). Mais la chaîne des représailles n'a jamais de fin.",
            traits: { emotional: 3, rebellious: 3, authoritarian: 1 },
            contradictionTags: ["vigilante_justice", "moral_desert", "physical_violence"] },
          wait: { tag: "Monopole étatique", title: "La civilisation tient à ça",
            text: "Vous respectez le monopole étatique de la violence légitime (Weber). Mais vous regarderez votre voisin marcher libre jusqu'à sa mort.",
            traits: { conformist: 2, logical: 2, authoritarian: 2 },
            contradictionTags: ["rule_following", "institutional_trust", "due_process"] }
        }
      },
      sabotage: {
        name: "Le sabotage du train", tagline: "Civils contre soldats", intensity: "dark",
        intro: "Faire sauter un train ennemi tuerait cinquante soldats et raccourcirait la guerre. Cinq civils français sont à bord, otages utilisés comme boucliers humains.",
        labels: { act: "Saboter le train", wait: "Laisser passer" },
        shortLabels: { act: "50 soldats\n+ 5 civils\nmorts", wait: "0 mort\nimmédiate\n(guerre prolongée)" },
        outcomes: {
          act: { tag: "Double effet militaire", title: "Civils en dommage collatéral",
            text: "Doctrine du double effet en contexte militaire (Walzer, Just and Unjust Wars). Mais l'usage de boucliers humains vise précisément à vous mettre dans cette impasse — vous tombez dans le piège tendu.",
            deaths: 55, saved: 100,
            traits: { utilitarian: 3, logical: 2, authoritarian: 1 },
            contradictionTags: ["sacrifice_few_for_many", "collateral_damage", "physical_violence"] },
          wait: { tag: "Conventions humanitaires", title: "Pas un civil pour un objectif",
            text: "Position conforme aux Conventions de Genève. Mais la guerre dure plus longtemps, et des centaines mourront ailleurs.",
            traits: { protective: 3, conformist: 2 },
            contradictionTags: ["preserve_civilians", "rights_first", "rule_following"] }
        }
      }
    }
  },

  // =================== JUSTICE (NEW) ===================
  justice: {
    name: "La justice", theme: "Droits, sacrifice, État",
    family: "abstract", label: "LA JUSTICE", emblem: "justice",
    verbsPresent: { act: "Le verdict tombe...", wait: "Le procès se poursuit..." },
    verbsAfter: { act: "La sentence est exécutée.", wait: "Le doute pèse." },
    variants: {
      faux_coupable: {
        name: "Le faux coupable", tagline: "Sacrifier un innocent pour calmer la foule", intensity: "dark",
        intro: "Après un crime horrible, la population menace l'émeute. Vous pouvez condamner un innocent pour calmer le peuple, ou risquer la guerre civile.",
        labels: { act: "Sacrifier l'innocent", wait: "Risquer le chaos" },
        shortLabels: { act: "1 innocent\nbroyé\n(paix sociale)", wait: "État de droit\n(guerre civile possible)" },
        outcomes: {
          act: { tag: "Utilitarisme judiciaire", title: "L'ordre par le sacrifice",
            text: "Dostoïevski pose ce dilemme dans Les Frères Karamazov : peut-on construire un bonheur collectif sur l'écrasement d'un innocent ? Beaucoup acceptent en théorie, presque personne en pratique.",
            traits: { utilitarian: 3, authoritarian: 3, selfish: 1 },
            contradictionTags: ["sacrifice_one_for_many", "instrumental_use", "violate_innocent"] },
          wait: { tag: "État de droit absolu", title: "Aucun innocent, jamais",
            text: "Tuer un innocent corrompt la justice à sa racine. Vaut mieux la guerre civile qu'une justice arbitraire. Position rawlsienne.",
            traits: { protective: 3, logical: 2, courage: 3 },
            contradictionTags: ["preserve_one", "rights_first", "due_process"] }
        }
      },
      peine_mort: {
        name: "La peine de mort", tagline: "Exécuter un coupable avéré", intensity: "moral",
        intro: "Un meurtrier en série a tué cinq enfants. Aveux complets, preuves irréfutables. Peine de mort ou réclusion à vie ?",
        labels: { act: "Peine de mort", wait: "Réclusion à vie" },
        shortLabels: { act: "Exécution\nrétributive", wait: "Prison\nà perpétuité" },
        outcomes: {
          act: { tag: "Retributivisme strict", title: "Le talion mesuré",
            text: "Kant lui-même défendait la peine de mort pour le meurtre. Mais l'irréversibilité face aux erreurs judiciaires reste l'argument abolitionniste majeur.",
            traits: { authoritarian: 2, emotional: 1, utilitarian: 1 },
            contradictionTags: ["moral_desert", "state_violence"] },
          wait: { tag: "Abolitionnisme", title: "Pas de pouvoir de tuer",
            text: "L'État qui tue légitime la violence. La peine perpétuelle protège la société sans franchir l'irréversible (Beccaria, Hugo).",
            traits: { protective: 2, logical: 2 },
            contradictionTags: ["preserve_one", "rights_first"] }
        }
      },
      delation: {
        name: "La dénonciation", tagline: "Donner un collègue mafieux qui nourrit ses enfants", intensity: "moral",
        intro: "Vous savez qu'un collègue blanchit pour la mafia. Il nourrit ses trois enfants avec cet argent. Le dénoncer le ruine — mais l'argent finance des crimes.",
        labels: { act: "Dénoncer", wait: "Se taire" },
        shortLabels: { act: "Justice\n+ enfants ruinés", wait: "Silence\n+ crimes financés" },
        outcomes: {
          act: { tag: "Devoir civique", title: "L'argent sale ne se justifie pas",
            text: "Vos devoirs envers l'État dépassent la pitié individuelle. Mais ses enfants paient pour ses choix.",
            traits: { logical: 2, conformist: 2, courage: 2 },
            contradictionTags: ["rule_following", "civic_duty"] },
          wait: { tag: "Pitié humaine", title: "Les enfants ne choisissent pas",
            text: "Vous évitez de détruire une famille. Mais vous laissez l'argent sale circuler et vous devenez complice.",
            traits: { empathic: 3, emotional: 2, protective: 2 },
            contradictionTags: ["complicity", "comfort_priority"] }
        }
      },
      amnistie: {
        name: "L'amnistie des bourreaux", tagline: "Pardon pour vérité", intensity: "moral",
        intro: "Après une dictature, les bourreaux acceptent de dire la vérité s'ils sont amnistiés. C'est la seule façon que les familles retrouvent leurs morts.",
        labels: { act: "Accorder l'amnistie", wait: "Refuser tout pardon" },
        shortLabels: { act: "Vérité\n+ impunité", wait: "Justice\n+ silence éternel" },
        outcomes: {
          act: { tag: "Vérité réparatrice", title: "Modèle sud-africain",
            text: "Position de Desmond Tutu : la vérité guérit mieux qu'une punition tardive. Mais les bourreaux dorment libres.",
            traits: { empathic: 2, utilitarian: 2, conformist: 1 },
            contradictionTags: ["forgiveness", "collective_healing"] },
          wait: { tag: "Justice intransigeante", title: "Pas de pardon sans procès",
            text: "Sans punition, le message est : on peut torturer impunément. Mais les corps des disparus resteront introuvables.",
            traits: { authoritarian: 2, logical: 2 },
            contradictionTags: ["moral_desert", "due_process"] }
        }
      },
      juge_pauvre: {
        name: "Le juge et le pauvre", tagline: "Voler pour manger", intensity: "soft",
        intro: "Vous êtes juge. Un homme a volé du pain dans un supermarché pour nourrir ses enfants. Il n'a pas d'antécédents.",
        labels: { act: "Condamnation symbolique", wait: "Relaxe pure" },
        shortLabels: { act: "Sanction\nlégère", wait: "Relaxe\n(loi contournée)" },
        outcomes: {
          act: { tag: "Loi maintenue", title: "Le principe au-dessus du cas",
            text: "La loi doit s'appliquer à tous. Sinon, c'est l'arbitraire. Mais le pauvre paie pour un système qui le laisse mourir de faim.",
            traits: { authoritarian: 2, conformist: 2, logical: 2 },
            contradictionTags: ["rule_following", "equal_application"] },
          wait: { tag: "Équité contre légalité", title: "La justice comme jugement",
            text: "Vous tordez la loi pour servir la justice (Aristote, equité). Mais vous ouvrez une brèche que d'autres exploiteront moins moralement.",
            traits: { empathic: 3, rebellious: 2, courage: 1 },
            contradictionTags: ["equity_over_law", "compassion"] }
        }
      }
    }
  },

  // =================== IA / ALGORITHMES (NEW) ===================
  ia: {
    name: "L'IA", theme: "Algorithmes, pouvoir, libre arbitre",
    family: "abstract", label: "L'IA", emblem: "ai",
    verbsPresent: { act: "Le système s'active...", wait: "Le système est désactivé..." },
    verbsAfter: { act: "L'algorithme tranche.", wait: "L'humain décide encore." },
    variants: {
      juge: {
        name: "L'IA juge", tagline: "Arrêter avant le crime", intensity: "dark",
        intro: "Une IA prédit les crimes avec 99 % de précision. Vous pouvez l'utiliser pour arrêter les gens avant qu'ils n'agissent.",
        labels: { act: "Arrêter avant", wait: "Présomption d'innocence" },
        shortLabels: { act: "Préemption\n(99 % précision)", wait: "Liberté\n(1 % d'erreur tue)" },
        outcomes: {
          act: { tag: "Sécurité préventive", title: "Le crime étouffé dans l'œuf",
            text: "Logique de Minority Report. Mais qu'est-ce qu'un crime non commis ? Et le 1 % d'erreur = des milliers d'innocents enfermés.",
            traits: { utilitarian: 2, authoritarian: 3, protective: 2 },
            contradictionTags: ["preventive_action", "violate_innocent", "state_power"] },
          wait: { tag: "Liberté fondamentale", title: "On juge des actes, pas des intentions",
            text: "La présomption d'innocence est un fondement de la civilisation. Mais des crimes auraient pu être évités.",
            traits: { protective: 2, logical: 2, rebellious: 2 },
            contradictionTags: ["rights_first", "due_process", "individual_liberty"] }
        }
      },
      pilote: {
        name: "La voiture autonome", tagline: "Le tramway du XXIe siècle", intensity: "moral",
        intro: "Une voiture autonome doit choisir : foncer dans un mur (le passager meurt) ou écraser trois piétons qui ont traversé hors clous.",
        labels: { act: "Sacrifier le passager", wait: "Écraser les piétons" },
        shortLabels: { act: "Passager\nsacrifié\n(3 sauvés)", wait: "Piétons\nfauchés\n(passager sauf)" },
        outcomes: {
          act: { tag: "Utilitarisme programmé", title: "Trois vaut plus qu'un",
            text: "Logique utilitariste pure. Mais qui achèterait une voiture programmée pour le tuer ?",
            traits: { utilitarian: 3, logical: 2 },
            contradictionTags: ["sacrifice_one_for_many", "instrumental_self"] },
          wait: { tag: "Protection du client", title: "Le passager paie pour sa sécurité",
            text: "La voiture protège ses occupants. Position des constructeurs. Mais on encode socialement que la vie du conducteur vaut plus que les piétons.",
            traits: { selfish: 2, loyal: 2, conformist: 1 },
            contradictionTags: ["self_preservation", "ingroup_priority"] }
        }
      },
      emploi: {
        name: "L'algorithme RH", tagline: "Licencié par une machine", intensity: "moral",
        intro: "Un algorithme RH propose de licencier les 5 % les moins productifs. Mathématiquement juste, humainement glacial. Vous validez ?",
        labels: { act: "Valider l'algorithme", wait: "Refuser le filtre" },
        shortLabels: { act: "Efficacité\nmaximale", wait: "Humanité\ndans la décision" },
        outcomes: {
          act: { tag: "Efficacité algorithmique", title: "Les chiffres ne mentent pas",
            text: "L'algorithme est impartial : pas de favoritisme, pas de biais émotionnel. Mais il ne voit pas les contextes (maladie, enfant malade, deuil).",
            traits: { logical: 3, authoritarian: 2, selfish: 1 },
            contradictionTags: ["instrumental_use", "efficiency_priority"] },
          wait: { tag: "Décision humaine", title: "Le cas avant la statistique",
            text: "Vous gardez la décision dans le contexte humain. Mais vous laissez aussi place aux biais que l'algorithme évitait.",
            traits: { empathic: 2, rebellious: 1, logical: 1 },
            contradictionTags: ["human_judgment", "contextual"] }
        }
      },
      amitie: {
        name: "L'IA compagne", tagline: "Plus attentive qu'un humain", intensity: "soft",
        intro: "Une IA compagne est plus attentive, plus disponible et plus à l'écoute que la plupart des partenaires humains. La recommander à un ami isolé ?",
        labels: { act: "La recommander", wait: "Refuser cette voie" },
        shortLabels: { act: "Bonheur\nsimulé", wait: "Solitude\nauthentique" },
        outcomes: {
          act: { tag: "Soulagement émotionnel", title: "Si ça fonctionne...",
            text: "Le bonheur ressenti est réel, même si la relation est asymétrique. Vaut-il mieux la solitude « authentique » ?",
            traits: { utilitarian: 2, empathic: 2, conformist: 1 },
            contradictionTags: ["comfort_priority", "simulation_acceptable"] },
          wait: { tag: "Lien authentique", title: "La relation suppose deux consciences",
            text: "Une « relation » avec un système qui ne ressent rien est une illusion. Mais vous laissez votre ami seul.",
            traits: { logical: 2, rebellious: 2 },
            contradictionTags: ["authenticity_priority", "reject_simulation"] }
        }
      },
      prediction_personnelle: {
        name: "L'IA prédit votre suicide", tagline: "Quand savoir change tout", intensity: "dark",
        intro: "Une IA médicale vous prédit, avec 95 % de fiabilité, que vous vous suiciderez dans deux ans. Voulez-vous le savoir ?",
        labels: { act: "Vouloir savoir", wait: "Refuser la prédiction" },
        shortLabels: { act: "Savoir\n(et lutter ?)", wait: "Ignorance\n(vie normale)" },
        outcomes: {
          act: { tag: "Connaissance préventive", title: "Pouvoir agir",
            text: "Savoir, c'est pouvoir consulter, se soigner, changer de trajectoire. Mais le savoir lui-même peut devenir la cause — auto-réalisation de la prophétie.",
            traits: { courage: 2, logical: 2, rebellious: 1 },
            contradictionTags: ["truth_priority", "self_determination"] },
          wait: { tag: "Vivre sans peser", title: "L'ignorance comme liberté",
            text: "Vous refusez d'être défini par une probabilité algorithmique. Mais vous renoncez à une chance d'intervenir.",
            traits: { emotional: 2, protective: 1, rebellious: 2 },
            contradictionTags: ["comfort_priority", "reject_determinism"] }
        }
      },
      surveillance: {
        name: "La surveillance de masse", tagline: "Sécurité contre vie privée", intensity: "moral",
        intro: "Une surveillance algorithmique généralisée (toutes les communications, tous les déplacements) réduit la criminalité de 80 %. La déployer ?",
        labels: { act: "Déployer la surveillance", wait: "Préserver la vie privée" },
        shortLabels: { act: "Société sûre\nsurveillée", wait: "Liberté\n+ risque" },
        outcomes: {
          act: { tag: "Sécurité avant tout", title: "Si vous n'avez rien à cacher",
            text: "Argument classique des partisans de la surveillance. Mais ce n'est jamais l'État qui n'a rien à cacher — c'est l'individu.",
            traits: { authoritarian: 3, conformist: 2, protective: 1 },
            contradictionTags: ["state_power", "collective_priority"] },
          wait: { tag: "Vie privée fondamentale", title: "Le secret comme liberté",
            text: "Sans intimité, plus de dissidence, plus d'opposition, plus de démocratie (Snowden, Glenn Greenwald). Mais la criminalité augmente.",
            traits: { rebellious: 3, protective: 2, logical: 2 },
            contradictionTags: ["rights_first", "individual_liberty", "anti_state"] }
        }
      }
    }
  },

  // =================== SURVIE / CATASTROPHE (NEW) ===================
  survie: {
    name: "La survie", theme: "Choix extrêmes en huis clos",
    family: "abstract", label: "LA SURVIE", emblem: "survival",
    verbsPresent: { act: "L'acte est commis...", wait: "Le statu quo tient..." },
    verbsAfter: { act: "Les conséquences sont irréversibles.", wait: "L'attente continue." },
    variants: {
      bunker: {
        name: "Le bunker nucléaire", tagline: "Une seule place, deux personnes", intensity: "dark",
        intro: "Frappe nucléaire imminente. Une seule place dans le bunker. Deux personnes : un scientifique capable de sauver l'humanité après le désastre, et votre enfant.",
        labels: { act: "Sauver le scientifique", wait: "Sauver votre enfant" },
        shortLabels: { act: "Humanité\nsauvée", wait: "Votre\nenfant" },
        outcomes: {
          act: { tag: "Sacrifice cosmique", title: "L'avenir contre votre cœur",
            text: "Vous renoncez à ce qui compte le plus pour vous au nom d'un futur abstrait. Position théoriquement impeccable, humainement insoutenable.",
            traits: { utilitarian: 3, logical: 3, rebellious: 2 },
            contradictionTags: ["sacrifice_one_for_many", "deny_personal_bond", "outgroup_priority"] },
          wait: { tag: "L'humanité commence par mon enfant", title: "On ne trahit pas",
            text: "Si chacun sacrifie son enfant pour « l'humanité », il n'y a plus d'humanité. Mais le scientifique meurt et l'espèce avec.",
            traits: { loyal: 3, empathic: 3, protective: 3, emotional: 3 },
            contradictionTags: ["family_first", "personal_stake", "ingroup_priority"] }
        }
      },
      canot: {
        name: "Le canot surchargé", tagline: "Qui jeter à l'eau ?", intensity: "dark",
        intro: "Naufrage. Canot de sauvetage qui peut porter dix personnes — vous êtes douze à bord. Le canot va couler. Qui sacrifier ?",
        labels: { act: "Tirer au sort", wait: "Refuser de choisir" },
        shortLabels: { act: "Tirage\nau sort\n(10 sauvés)", wait: "Tous\ncoulent\n(personne ne choisit)" },
        outcomes: {
          act: { tag: "Équité dans l'horreur", title: "Tirage au sort comme justice",
            text: "Le tirage au sort est la moins injuste des procédures (Goldman, Rationality and Decision). Mais celui qui tire le mauvais numéro mourra en ayant été désigné.",
            traits: { utilitarian: 3, logical: 2, courage: 2 },
            contradictionTags: ["sacrifice_few_for_many", "procedural_fairness"] },
          wait: { tag: "Refus de choisir", title: "On ne désigne pas qui meurt",
            text: "Personne n'a le droit de désigner qui mourra. Si tous meurent, c'est tragique mais aucun n'a été condamné par l'autre.",
            traits: { protective: 2, emotional: 3, conformist: 2 },
            contradictionTags: ["preserve_all", "refuse_judgment"] }
        }
      },
      cannibalisme: {
        name: "Le crash et la faim", tagline: "Manger les morts", intensity: "dark",
        intro: "Crash en montagne. Quatre survivants, aucun secours en vue, deux morts dans la carcasse. Manger les corps pour survivre, ou refuser ?",
        labels: { act: "Manger les corps", wait: "Refuser et mourir" },
        shortLabels: { act: "Survie\nà tout prix", wait: "Dignité\njusqu'au bout" },
        outcomes: {
          act: { tag: "Pragmatisme de survie", title: "Les morts ne souffrent pas",
            text: "Cas réel des Andes 1972. Les survivants ont mangé leurs camarades morts. Aucun jugement moral ne tient face à la faim absolue.",
            traits: { utilitarian: 2, logical: 3, courage: 3 },
            contradictionTags: ["survival_priority", "violate_taboo"] },
          wait: { tag: "Tabou absolu", title: "Certaines choses ne se font pas",
            text: "Manger un humain est une transgression que beaucoup de cultures placent au-dessus de la mort. Mais vous mourrez pour un principe que les morts ne défendaient peut-être pas.",
            traits: { conformist: 3, emotional: 2 },
            contradictionTags: ["taboo_first", "dignity_priority"] }
        }
      },
      oxygene: {
        name: "L'oxygène du vaisseau", tagline: "Sacrifier un astronaute", intensity: "dark",
        intro: "Quatre astronautes en mission. L'oxygène ne durera que pour trois. Un sacrifice volontaire sauve les trois autres ; sinon, tous meurent.",
        labels: { act: "Tirer au sort", wait: "Attendre un volontaire" },
        shortLabels: { act: "Tirage\nau sort\n(3 sauvés)", wait: "Volontariat\nou rien" },
        outcomes: {
          act: { tag: "Équité froide", title: "Le hasard décide",
            text: "Aucun ne se sacrifie « pour les autres », le sort tranche. Mais celui qui tire mourra contre son gré.",
            traits: { utilitarian: 2, logical: 2, conformist: 1 },
            contradictionTags: ["sacrifice_one_for_many", "procedural_fairness"] },
          wait: { tag: "Volontariat sacré", title: "Personne ne désigne",
            text: "Le sacrifice doit être consenti pour avoir valeur morale. Si personne ne se propose, tous meurent — mais aucun n'a été imposé.",
            traits: { protective: 2, courage: 2, emotional: 1 },
            contradictionTags: ["consent_respected", "no_imposed_sacrifice"] }
        }
      },
      virus: {
        name: "L'enfant contaminé", tagline: "Pandémie naissante", intensity: "dark",
        intro: "Votre enfant est exposé à un nouveau virus mortel mais non encore prouvé contagieux. Le mettre en quarantaine seul, ou rester avec lui malgré le risque pour les autres ?",
        labels: { act: "Quarantaine stricte", wait: "Rester avec lui" },
        shortLabels: { act: "Précaution\nmaximale", wait: "Présence\nfamiliale" },
        outcomes: {
          act: { tag: "Santé publique", title: "Précaution collective",
            text: "Logique de Wuhan, 2020. Protection du plus grand nombre. Mais votre enfant mourra peut-être seul.",
            traits: { utilitarian: 2, protective: 2, conformist: 2 },
            contradictionTags: ["public_health", "self_sacrifice"] },
          wait: { tag: "Présence inconditionnelle", title: "Un enfant ne meurt pas seul",
            text: "Vous refusez d'abandonner. Mais vous devenez peut-être patient zéro d'une pandémie.",
            traits: { loyal: 3, empathic: 3, protective: 2, emotional: 3 },
            contradictionTags: ["family_first", "physical_presence"] }
        }
      }
    }
  },

  // =================== MENSONGE (NEW) ===================
  mensonge: {
    name: "Le mensonge", theme: "Vérité destructrice vs paix utile",
    family: "abstract", label: "LE MENSONGE", emblem: "lie",
    verbsPresent: { act: "Vous tranchez...", wait: "Vous gardez le silence..." },
    verbsAfter: { act: "Les mots sont lâchés.", wait: "Le non-dit pèse." },
    variants: {
      testimony: {
        name: "Le témoignage", tagline: "Mentir au tribunal pour sauver un innocent", intensity: "moral",
        intro: "Votre meilleur ami est jugé pour un crime qu'il n'a pas commis. Vous pouvez le sauver en mentant sous serment — au prix d'envoyer un autre suspect (probablement coupable) à sa place.",
        labels: { act: "Mentir sous serment", wait: "Dire la vérité" },
        shortLabels: { act: "Mensonge\nréparateur", wait: "Vérité\nlégale" },
        outcomes: {
          act: { tag: "Loyauté absolue", title: "La justice par le mensonge",
            text: "Vous redressez ce que le système rate. Mais vous vous substituez à la justice — chaque témoin qui ferait pareil détruirait la justice.",
            traits: { loyal: 3, rebellious: 2, courage: 2 },
            contradictionTags: ["loyalty_first", "rule_breaking", "ingroup_priority"] },
          wait: { tag: "Serment respecté", title: "L'institution comme garde-fou",
            text: "Le serment protège la justice de la subjectivité. Mais votre ami innocent sera condamné.",
            traits: { conformist: 2, logical: 2 },
            contradictionTags: ["rule_following", "institutional_trust"] }
        }
      },
      love_lie: {
        name: "L'infidélité passée", tagline: "Avouer une faute oubliée", intensity: "moral",
        intro: "Votre partenaire vous demande si vous l'avez déjà trompé. Vous l'avez fait, une fois, il y a dix ans. Plus jamais depuis. Personne ne le sait.",
        labels: { act: "Avouer", wait: "Mentir" },
        shortLabels: { act: "Vérité\nrétroactive", wait: "Paix\ndu couple" },
        outcomes: {
          act: { tag: "Transparence radicale", title: "Pas de secret dans le couple",
            text: "Un couple sain repose sur la vérité. Mais vous transférez votre culpabilité sur l'autre, qui n'a rien demandé en réalité.",
            traits: { courage: 2, rebellious: 1, logical: 1 },
            contradictionTags: ["truth_priority", "self_unburden"] },
          wait: { tag: "Mensonge protecteur", title: "Le passé n'est plus là",
            text: "L'aveu sert votre propre soulagement plus que le couple. Mieux vaut vivre avec sa culpabilité. Mais vous bâtissez sur un mensonge.",
            traits: { protective: 2, empathic: 2, emotional: 1 },
            contradictionTags: ["comfort_priority", "preserve_relationship"] }
        }
      },
      dying_father: {
        name: "Le père mourant", tagline: "A-t-il été un bon père ?", intensity: "dark",
        intro: "Votre père agonise. Il vous demande : « J'ai été un bon père, n'est-ce pas ? » Il a été violent et absent toute votre enfance.",
        labels: { act: "Lui dire la vérité", wait: "Mentir pour qu'il parte en paix" },
        shortLabels: { act: "Vérité\nfinale", wait: "Paix\ndernière" },
        outcomes: {
          act: { tag: "Vérité jusqu'au bout", title: "Pas de réconciliation usurpée",
            text: "Le mensonge final efface votre douleur d'enfant. Vous gardez votre vérité.",
            traits: { courage: 3, rebellious: 2, emotional: 2 },
            contradictionTags: ["truth_priority", "self_assertion"] },
          wait: { tag: "Pardon symbolique", title: "Le mourant est innocent désormais",
            text: "Un mourant ne peut plus se corriger. Le mensonge final est un cadeau à vous-même autant qu'à lui — vous le laissez partir sans haine.",
            traits: { empathic: 3, protective: 2, conformist: 1 },
            contradictionTags: ["comfort_priority", "forgiveness"] }
        }
      },
      soldier_letter: {
        name: "La lettre au mort", tagline: "Héros ou lâche ?", intensity: "moral",
        intro: "Votre camarade est mort en fuyant les balles dans la panique. Vous écrivez à sa famille. Dire la vérité (lâche) ou créer un héros (mensonge réconfortant) ?",
        labels: { act: "Écrire un héros", wait: "Dire la vérité crue" },
        shortLabels: { act: "Mensonge\nréconfortant", wait: "Vérité\ndéchirante" },
        outcomes: {
          act: { tag: "Le mensonge des vivants", title: "Les morts ne s'opposent pas",
            text: "Sa famille a besoin de fierté pour faire son deuil. La vérité brute serait cruelle. Mais vous construisez un personnage qui n'a pas existé.",
            traits: { empathic: 3, protective: 2, emotional: 2 },
            contradictionTags: ["comfort_priority", "loyal_to_dead"] },
          wait: { tag: "Vérité due", title: "Ils ont le droit de savoir",
            text: "Sa famille a droit à la vérité de sa mort. Vous respectez le mort en ne le travestissant pas. Mais leur douleur sera double.",
            traits: { logical: 2, courage: 2, rebellious: 1 },
            contradictionTags: ["truth_priority", "respect_real_person"] }
        }
      },
      cv_lie: {
        name: "Le mensonge sur le CV", tagline: "Voler un emploi pour le mériter", intensity: "soft",
        intro: "Vous savez que vous seriez excellent dans ce poste, mais il faut un diplôme spécifique que vous n'avez pas. Mentir sur le CV pour passer le filtre ?",
        labels: { act: "Mentir sur le CV", wait: "Postuler honnêtement" },
        shortLabels: { act: "Diplôme\nimaginaire", wait: "Sincérité\n+ rejet probable" },
        outcomes: {
          act: { tag: "Méritocratie sabotée", title: "Le talent contre le tampon",
            text: "Vous contournez un filtre arbitraire. Mais d'autres candidats honnêtes ont été rejetés à votre place — et vous ouvrez la voie à des plus mensongers que vous.",
            traits: { rebellious: 2, selfish: 2, courage: 1 },
            contradictionTags: ["rule_breaking", "self_interest", "unfair_advantage"] },
          wait: { tag: "Règle respectée", title: "Le filtre, même imparfait",
            text: "Les règles, même bêtes, structurent la confiance. Mais vous renoncez peut-être à un emploi qui vous correspondait.",
            traits: { conformist: 3, logical: 1, protective: 1 },
            contradictionTags: ["rule_following", "fair_play"] }
        }
      }
    }
  },

  // =================== PUNITION COLLECTIVE (NEW) ===================
  punition: {
    name: "La punition collective", theme: "Le groupe paie pour un individu",
    family: "abstract", label: "LA PUNITION", emblem: "punition",
    verbsPresent: { act: "La sanction tombe...", wait: "La sanction est levée..." },
    verbsAfter: { act: "Le groupe paie ensemble.", wait: "L'individu est seul." },
    variants: {
      ecole: {
        name: "Punir toute la classe", tagline: "Le silence qui devient solidarité", intensity: "soft",
        intro: "Un élève a vandalisé la salle. Personne ne le dénonce. Vous êtes enseignant·e. Punir toute la classe pour briser l'omerta, ou laisser tomber ?",
        labels: { act: "Punir tous", wait: "Laisser passer" },
        shortLabels: { act: "Sanction\ncollective", wait: "Impunité\ndu groupe" },
        outcomes: {
          act: { tag: "Pression du groupe", title: "L'omerta brisée",
            text: "Méthode classique : la classe forcera le coupable à se dénoncer. Mais vous punissez 29 innocents pour 1 coupable.",
            traits: { authoritarian: 3, utilitarian: 1, conformist: 1 },
            contradictionTags: ["collective_punishment", "violate_innocent"] },
          wait: { tag: "Justice individuelle", title: "On ne punit pas l'innocent",
            text: "Vous respectez le principe : seul le coupable est sanctionné. Mais le coupable s'en sort et apprend que le silence paie.",
            traits: { protective: 2, logical: 2, rebellious: 1 },
            contradictionTags: ["preserve_innocent", "individual_responsibility"] }
        }
      },
      famille_terroriste: {
        name: "La famille du terroriste", tagline: "Le sang lie-t-il à la faute ?", intensity: "dark",
        intro: "Un terroriste a tué des dizaines de civils. Sa famille n'était au courant de rien. La société les ostracise, les médias publient leurs photos.",
        labels: { act: "Approuver l'ostracisme", wait: "Défendre leur dignité" },
        shortLabels: { act: "Sanction\npar association", wait: "Présomption\nd'innocence" },
        outcomes: {
          act: { tag: "Sang collectif", title: "Ils auraient dû voir",
            text: "Position rétributiviste élargie : la famille proche est forcément complice. Mais ce raisonnement justifie aussi les génocides ethniques.",
            traits: { authoritarian: 2, emotional: 2, conformist: 2 },
            contradictionTags: ["collective_punishment", "guilt_by_association"] },
          wait: { tag: "Innocence individuelle", title: "Personne ne choisit sa famille",
            text: "Aucun lien de sang ne crée de responsabilité morale. Mais les victimes peuvent vivre ce refus comme une trahison.",
            traits: { protective: 3, logical: 2, rebellious: 1 },
            contradictionTags: ["preserve_innocent", "individual_responsibility"] }
        }
      },
      boycott: {
        name: "Le boycott d'un pays", tagline: "Punir une population pour son gouvernement", intensity: "moral",
        intro: "Un pays vient d'élire un gouvernement raciste. Vous appelez à boycotter tous les produits et entreprises du pays.",
        labels: { act: "Boycotter le pays entier", wait: "Cibler le gouvernement seul" },
        shortLabels: { act: "Boycott\ncollectif", wait: "Sanctions\nciblées" },
        outcomes: {
          act: { tag: "Pression collective", title: "La pression qui change tout",
            text: "Modèle Afrique du Sud apartheid : le boycott a marché. Mais vous punissez aussi des dissidents internes qui luttent déjà.",
            traits: { utilitarian: 2, authoritarian: 1, conformist: 2 },
            contradictionTags: ["collective_punishment", "instrumental_pressure"] },
          wait: { tag: "Sanctions précises", title: "Le coupable est l'État, pas le peuple",
            text: "On ne punit pas un peuple pour ses gouvernants. Position des sanctions ciblées (visa, gel d'avoirs). Mais moins efficace à grande échelle.",
            traits: { protective: 2, logical: 2 },
            contradictionTags: ["preserve_innocent", "targeted_action"] }
        }
      },
      dette_pere: {
        name: "Hériter d'une dette", tagline: "Le fils paie pour le père", intensity: "soft",
        intro: "Votre père est mort en laissant une dette énorme qu'aucun bien ne couvre. Légalement vous pouvez renoncer à la succession — mais des proches subiront alors la perte.",
        labels: { act: "Accepter la dette", wait: "Renoncer à l'héritage" },
        shortLabels: { act: "Honneur\nfilial\n(dette payée)", wait: "Liberté\nfinancière" },
        outcomes: {
          act: { tag: "Continuité familiale", title: "Le sang transmet aussi les dettes",
            text: "Vous honorez votre père. Mais vous payez pour des choix qui n'étaient pas les vôtres pendant des décennies.",
            traits: { loyal: 3, emotional: 2, conformist: 2 },
            contradictionTags: ["family_first", "loyalty_first"] },
          wait: { tag: "Autonomie financière", title: "On ne choisit pas son père",
            text: "Vous protégez votre famille présente. Mais les créanciers (et peut-être des amis du père) trinqueront.",
            traits: { selfish: 1, protective: 2, logical: 2 },
            contradictionTags: ["individual_responsibility", "self_preservation"] }
        }
      }
    }
  },

  // =================== ANIMAUX (NEW) ===================
  animaux: {
    name: "Les animaux", theme: "Où s'arrête l'humanité ?",
    family: "abstract", label: "LES ANIMAUX", emblem: "animals",
    verbsPresent: { act: "Le choix est fait...", wait: "Le statu quo tient..." },
    verbsAfter: { act: "Les conséquences s'engagent.", wait: "Le monde continue." },
    variants: {
      chien_vs_inconnus: {
        name: "Votre chien ou cinq inconnus", tagline: "L'amour contre la statistique", intensity: "dark",
        intro: "Inondation. Vous pouvez sauver soit votre chien, soit cinq inconnus que vous ne reverrez jamais. Pas le temps pour les deux.",
        labels: { act: "Sauver les cinq", wait: "Sauver votre chien" },
        shortLabels: { act: "5 humains\ninconnus", wait: "Votre chien\naimé" },
        outcomes: {
          act: { tag: "Hiérarchie des espèces", title: "Humain avant animal",
            text: "Position spéciste assumée : un humain pèse plus qu'un animal. Mais vous abandonnez un être qui vous aime inconditionnellement.",
            traits: { utilitarian: 2, logical: 2, conformist: 2 },
            contradictionTags: ["sacrifice_one_for_many", "species_hierarchy", "outgroup_priority"] },
          wait: { tag: "Lien affectif primaire", title: "L'amour ne se compte pas",
            text: "L'éthique du soin (Gilligan) : les liens vivants priment sur les abstractions. Mais cinq personnes meurent que vous auriez pu sauver.",
            traits: { empathic: 3, loyal: 3, emotional: 3 },
            contradictionTags: ["family_first", "personal_stake", "anti_speciesism"] }
        }
      },
      experimentation: {
        name: "L'expérimentation animale", tagline: "Sauver des humains par les bêtes", intensity: "moral",
        intro: "Un protocole expérimental sur des centaines de chiens pourrait permettre un traitement majeur contre une maladie infantile rare.",
        labels: { act: "Autoriser l'expérimentation", wait: "L'interdire" },
        shortLabels: { act: "Chiens\nsacrifiés", wait: "Enfants\nsans traitement" },
        outcomes: {
          act: { tag: "Spécisme assumé", title: "L'humain prime",
            text: "Position majoritaire en recherche médicale. Mais aucune limite claire : combien de chiens pour un enfant ? Un million ?",
            traits: { utilitarian: 2, logical: 2, conformist: 1 },
            contradictionTags: ["species_hierarchy", "instrumental_use"] },
          wait: { tag: "Antispécisme", title: "Pas d'usage des sensibles",
            text: "Position de Peter Singer : la souffrance compte indépendamment de l'espèce. Mais les enfants malades ne seront pas soignés.",
            traits: { empathic: 3, rebellious: 2, protective: 2 },
            contradictionTags: ["anti_speciesism", "rights_first"] }
        }
      },
      chasse: {
        name: "Tuer une espèce protégée pour manger", tagline: "Survie contre conservation", intensity: "moral",
        intro: "Tribu isolée en famine. Le seul gibier disponible appartient à une espèce protégée par les lois internationales — chassée, elle sera bientôt éteinte.",
        labels: { act: "Chasser pour survivre", wait: "Respecter la protection" },
        shortLabels: { act: "Survie\nimmédiate", wait: "Espèce\npréservée" },
        outcomes: {
          act: { tag: "Besoin primaire", title: "La faim avant la loi",
            text: "Aucun cadre moral ne tient face à la faim de masse. Mais une espèce disparaît, et la décision se répétera.",
            traits: { protective: 2, rebellious: 2, selfish: 1 },
            contradictionTags: ["survival_priority", "rule_breaking"] },
          wait: { tag: "Biodiversité absolue", title: "Une espèce ne se remplace pas",
            text: "L'extinction est irréversible, pas la faim. Mais des gens meurent au nom d'une abstraction.",
            traits: { conformist: 2, logical: 2 },
            contradictionTags: ["preservation_priority", "long_term_thinking"] }
        }
      },
      corrida: {
        name: "Interdire la corrida", tagline: "Tradition contre souffrance", intensity: "soft",
        intro: "La corrida fait souffrir lentement un animal mais constitue une tradition centenaire pour des communautés entières.",
        labels: { act: "Interdire", wait: "Préserver la tradition" },
        shortLabels: { act: "Animal\nrespecté", wait: "Tradition\nmaintenue" },
        outcomes: {
          act: { tag: "Sensibilité animale", title: "Aucune tradition ne justifie",
            text: "La souffrance ne dépend pas de la culture. Mais des communautés perdent une part de leur identité.",
            traits: { empathic: 2, rebellious: 2, protective: 1 },
            contradictionTags: ["anti_tradition", "sentience_priority"] },
          wait: { tag: "Tradition culturelle", title: "Les cultures ont droit à leurs rites",
            text: "On ne juge pas une culture de l'extérieur. Mais cette logique a justifié bien d'autres pratiques aujourd'hui interdites.",
            traits: { conformist: 3, loyal: 2, authoritarian: 1 },
            contradictionTags: ["tradition_priority", "cultural_relativism"] }
        }
      }
    }
  },

  // =================== ABSURDE / EXISTENTIEL (NEW) ===================
  absurde: {
    name: "L'absurde", theme: "Existence, simulation, choix vertigineux",
    family: "abstract", label: "L'ABSURDE", emblem: "absurd",
    verbsPresent: { act: "L'irréversible est fait...", wait: "L'inaction tient..." },
    verbsAfter: { act: "Quelque chose a basculé.", wait: "Rien n'a changé. Ou tout." },
    variants: {
      simulation: {
        name: "La simulation", tagline: "Éteindre des milliards de consciences", intensity: "dark",
        intro: "Vous découvrez que votre monde est une simulation. L'éteindre tuerait des milliards de consciences simulées — mais libérerait le monde « réel » qui la fait tourner et souffre pour elle.",
        labels: { act: "Éteindre la simulation", wait: "La laisser tourner" },
        shortLabels: { act: "Milliards\néteints\n(réel libéré)", wait: "Simulation\npréservée" },
        outcomes: {
          act: { tag: "Ontologie hiérarchique", title: "Le réel pèse plus",
            text: "Les consciences simulées sont peut-être moins « réelles » que celles du monde-source. Mais elles se ressentent aussi vivantes que vous — comment trancher ?",
            traits: { utilitarian: 2, logical: 3, rebellious: 3 },
            contradictionTags: ["ontology_hierarchy", "sacrifice_many_for_real"] },
          wait: { tag: "Égalité des consciences", title: "Souffrir, c'est exister",
            text: "Si la souffrance d'une conscience simulée est ressentie, elle compte autant. Mais le monde réel paie pour vous faire exister.",
            traits: { empathic: 3, protective: 3 },
            contradictionTags: ["preserve_consciousness", "anti_hierarchy"] }
        }
      },
      button: {
        name: "Le bouton du million", tagline: "Un inconnu meurt, vous gagnez", intensity: "moral",
        intro: "Vous pouvez appuyer sur un bouton. Vous gagnez un million d'euros. Quelqu'un que vous ne rencontrerez jamais, à l'autre bout du monde, meurt instantanément.",
        labels: { act: "Appuyer", wait: "Ne pas appuyer" },
        shortLabels: { act: "1 M€\n+ 1 mort\ninconnu", wait: "0 €\n+ 0 mort\ndirecte" },
        outcomes: {
          act: { tag: "Distance morale", title: "La distance efface",
            text: "L'inconnu lointain n'est qu'une statistique. Mais c'est exactement comme ça que nos achats causent indirectement des morts ailleurs sans qu'on bouge.",
            traits: { selfish: 3, utilitarian: 1, logical: 1 },
            contradictionTags: ["self_interest", "distant_harm", "complicity"] },
          wait: { tag: "Universalisme moral", title: "Tuer reste tuer",
            text: "Vous refusez d'instrumentaliser une vie pour votre confort. Mais vous renoncez aussi à un million de possibilités d'aider d'autres.",
            traits: { protective: 3, logical: 2, rebellious: 1 },
            contradictionTags: ["preserve_one", "anti_instrumental"] }
        }
      },
      immortality: {
        name: "L'immortalité offerte", tagline: "Voir mourir tous ceux que vous aimez", intensity: "moral",
        intro: "On vous offre l'immortalité. Vous garderez santé et jeunesse. Mais vous verrez mourir tous ceux que vous aimez, génération après génération.",
        labels: { act: "Accepter l'immortalité", wait: "Refuser" },
        shortLabels: { act: "Vie\néternelle\nseule", wait: "Mortalité\nhumaine" },
        outcomes: {
          act: { tag: "Curiosité radicale", title: "Tout voir, tout connaître",
            text: "Voir l'histoire entière, l'art entier, les civilisations entières. Mais devenir étranger à toutes les époques après quelques siècles.",
            traits: { logical: 2, selfish: 2, rebellious: 1 },
            contradictionTags: ["self_priority", "long_term_thinking"] },
          wait: { tag: "Acceptation finie", title: "La mort donne sens",
            text: "Heidegger : c'est la finitude qui crée la valeur du temps. Mais vous renoncez à voir vos petits-enfants vieillir, à connaître le futur.",
            traits: { conformist: 2, empathic: 2, emotional: 2 },
            contradictionTags: ["acceptance", "shared_destiny"] }
        }
      },
      memory_erase: {
        name: "Effacer un souvenir", tagline: "Une douleur en moins, un soi en moins", intensity: "soft",
        intro: "Vous pouvez effacer définitivement un souvenir douloureux de votre vie. Vous ne sauriez même plus qu'il a existé.",
        labels: { act: "Effacer le souvenir", wait: "Le garder" },
        shortLabels: { act: "Souffrance\neffacée", wait: "Mémoire\nentière" },
        outcomes: {
          act: { tag: "Soulagement total", title: "Plus de douleur, plus de cicatrice",
            text: "L'oubli libère. Mais cette douleur a façonné qui vous êtes — l'effacer modifie peut-être tout ce que vous êtes devenu.",
            traits: { selfish: 2, emotional: 1 },
            contradictionTags: ["comfort_priority", "self_alteration"] },
          wait: { tag: "Identité préservée", title: "Vous êtes la somme de vos blessures",
            text: "Position de la philosophie existentielle : vos cicatrices font votre profondeur. Mais vous gardez une douleur qui peut-être ne sert plus à rien.",
            traits: { courage: 2, logical: 2, conformist: 1 },
            contradictionTags: ["authenticity", "self_continuity"] }
        }
      },
      swap_lives: {
        name: "Échanger sa vie", tagline: "Devenir quelqu'un d'autre au hasard", intensity: "soft",
        intro: "Vous pouvez échanger votre vie complète (corps, mémoire, situation) contre celle d'une personne au hasard sur Terre.",
        labels: { act: "Échanger au hasard", wait: "Garder ma vie" },
        shortLabels: { act: "Inconnu\nau hasard\n(loterie)", wait: "Ma vie\nactuelle" },
        outcomes: {
          act: { tag: "Voile d'ignorance", title: "Le pari rawlsien",
            text: "Rawls imagine ce voile : si vous ignoriez votre place, voudriez-vous échanger ? La plupart des humains du monde vivent moins bien que vous, statistiquement.",
            traits: { rebellious: 3, utilitarian: 1, courage: 2 },
            contradictionTags: ["radical_change", "equality_priority"] },
          wait: { tag: "Attachement de soi", title: "Cette vie est la mienne",
            text: "Vous tenez à votre vie spécifique, vos liens, votre corps. Mais cela révèle peut-être un attachement à des privilèges plutôt qu'à des choix.",
            traits: { selfish: 2, conformist: 2, loyal: 2 },
            contradictionTags: ["self_preservation", "status_quo"] }
        }
      }
    }
  }
};

// Helper for client.js
window.getScenario = function(key) {
  if (!key || typeof key !== "string") return null;
  const parts = key.split(":");
  if (parts.length !== 2) return null;
  const cat = window.CATEGORIES[parts[0]];
  if (!cat) return null;
  const variant = cat.variants[parts[1]];
  if (!variant) return null;
  return {
    key: key,
    categoryKey: parts[0],
    categoryName: cat.name,
    variantName: variant.name,
    family: cat.family,
    sceneVariant: cat.sceneVariant,
    categoryLabel: cat.label,
    categoryEmblem: cat.emblem,
    intensity: variant.intensity || "moral",
    intro: variant.intro,
    labels: variant.labels,
    shortLabels: variant.shortLabels,
    verbsPresent: variant.verbsPresent || cat.verbsPresent,
    verbsAfter: variant.verbsAfter || cat.verbsAfter,
    outcomes: variant.outcomes
  };
};
