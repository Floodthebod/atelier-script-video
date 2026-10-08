// Contenu pédagogique de l'atelier. Pour une V2, modifier ce fichier uniquement.
const SRC = {
  duarte: ["Nancy Duarte, How to develop the best Big Idea", "https://www.duarte.com/blog/how-to-develop-the-best-big-idea-for-your-presentation/"],
  duarte6: ["Nancy Duarte, processus en 6 étapes (résumé)", "https://www.alphachimp.com/blog/nancy-duarte-six-step-process"],
  stick: ["Made to Stick, modèle SUCCESs (FourWeekMBA)", "https://fourweekmba.com/success-model/"],
  stick2: ["Made to Stick, thèmes (SuperSummary)", "https://www.supersummary.com/made-to-stick/themes/"],
  field: ["Syd Field, Screenplay (Wikipédia)", "https://en.wikipedia.org/wiki/Screenplay_(book)"],
  harmon: ["Dan Harmon Story Circle (Kindlepreneur)", "https://kindlepreneur.com/dan-harmon-story-circle/"],
  harmon2: ["Dan Harmon, les 8 étapes (SwipeFile)", "https://swipefile.com/dan-harmons-8-step-story-circle"],
  pas: ["Problem-Agitate-Solve (Copyblogger)", "https://copyblogger.com/problem-agitate-solve/"],
  pas2: ["P.A.S. copywriting formula (VeryGoodCopy)", "https://www.verygoodcopy.com/verygoodcopy-blogs-10/copywriting-formula"],
  yt: ["Aide YouTube, moments clés de la rétention", "https://support.google.com/youtube/answer/9314415"],
  ufl: ["Université de Floride, News Writing for Television and Radio", "https://edis.ifas.ufl.edu/publication/wc193"],
  cdc: ["CDC, Audio Script Writing Guide (PDF)", "https://tools.cdc.gov/medialibrary/docs/AudioScriptWritingGuide.pdf"]
};

const STRUCTS = {
  "Trois actes (Syd Field)": [
    "Acte 1, exposition : la situation de départ",
    "Point de bascule 1 : l'événement qui lance le vrai sujet",
    "Acte 2, confrontation : obstacles, essais, complications",
    "Point de bascule 2 : ce qui précipite la fin",
    "Acte 3, résolution : comment ça se termine"],
  "Cercle de Harmon": [
    "YOU : qui, dans quelle zone de confort",
    "NEED : ce qu'il ou elle veut",
    "GO : l'entrée en terrain inconnu",
    "SEARCH : l'adaptation, les essais",
    "FIND : ce qui est obtenu",
    "TAKE : le prix payé",
    "RETURN : le retour au point de départ",
    "CHANGE : ce qui a changé"],
  "PAS (problème, agitation, solution)": [
    "Problème : la difficulté du spectateur, nommée clairement",
    "Agitation : un exemple concret qui fait ressentir les conséquences",
    "Solution : ta réponse, et à quoi ressemble la situation une fois appliquée"]
};

const MODULES = [
{ id:"m1", tc:"00:00", min:8, short:"Idée ou sujet", title:"Idée ou sujet ?",
  concept:`<p>Un <b>sujet</b> est un thème : « la capoeira », « les réunions ». Une <b>idée</b> est une prise de position qu'on peut défendre.</p>
  <p>Nancy Duarte appelle ça la <b>Big Idea</b> : ton <b>point de vue</b> sur le sujet, plus <b>l'enjeu</b> pour le public s'il l'adopte ou non, le tout écrit en <b>une phrase complète</b>.</p>
  <p>Le test le plus simple vient aussi de Duarte : si personne ne peut être en désaccord avec ta phrase, c'est un fait ou un sujet, pas un point de vue.</p>
  <p><i>Made to Stick</i> va dans le même sens avec son premier principe, <b>Simple</b> : trouver le noyau de l'idée et retirer ce qui ne le sert pas.</p>`,
  sources:["duarte","stick"],
  questions:[
    {p:"« La capoeira »", o:["Sujet","Idée"], c:0, e:"C'est un thème. On ne peut pas être d'accord ou pas d'accord avec un thème.", row:true},
    {p:"« La capoeira développe mieux la confiance en soi qu'un sport de combat, parce qu'on y joue avec l'adversaire au lieu de le battre »", o:["Sujet","Idée"], c:1, e:"Il y a un point de vue (mieux qu'un sport de combat) et une raison. Quelqu'un peut ne pas être d'accord, c'est bon signe.", row:true},
    {p:"« Les réunions du lundi »", o:["Sujet","Idée"], c:0, e:"Un thème, sans position.", row:true},
    {p:"« Supprimer la réunion du lundi ferait gagner une demi-journée par mois à l'équipe »", o:["Sujet","Idée"], c:1, e:"Position + enjeu (le temps gagné). C'est discutable, donc c'est une idée.", row:true},
    {p:"« Comment bien dormir »", o:["Sujet","Idée"], c:0, e:"Formulé en question, c'est encore un sujet. Une idée dirait ce que tu penses de la réponse.", row:true},
    {p:"Selon Nancy Duarte, la Big Idea combine :", o:["Un sujet et une cible","Un point de vue et un enjeu","Une accroche et un appel à l'action","Un problème et une solution"], c:1, e:"Point de vue + ce qui est en jeu pour le public, écrits en une phrase complète."}
  ],
  app:[
    {id:"titre", label:"Nom de travail de la vidéo", type:"text", ph:"Ex. : Pourquoi j'ai arrêté les to-do lists"},
    {id:"sujet", label:"Le sujet de départ", type:"text", help:"Le thème, en quelques mots. C'est normal que ce ne soit pas encore une idée.", ph:"Ex. : l'organisation personnelle"},
    {id:"pdv", label:"Ton point de vue sur ce sujet", type:"textarea", help:"Qu'est-ce que tu penses, que d'autres ne pensent pas forcément ?"},
    {id:"enjeu", label:"L'enjeu pour le spectateur", type:"textarea", help:"Que gagne-t-il s'il adopte ton point de vue, que perd-il s'il l'ignore ?"},
    {id:"bigidea", label:"Ta Big Idea en une phrase", type:"textarea", help:"Point de vue + enjeu, en une phrase complète avec un verbe.", checks:"bigidea"},
    {id:"desaccord", label:"Test de Duarte : quelqu'un pourrait-il ne pas être d'accord avec cette phrase ?", type:"select", options:["","Oui","Non, c'est plutôt un constat","Je ne sais pas"]}
  ]},
{ id:"m2", tc:"08:00", min:10, short:"Cadrer", title:"Cadrer : cible, objectif, action",
  concept:`<p>Une fois l'idée posée, il faut savoir <b>pour qui</b> et <b>pour quoi</b>.</p>
  <ul><li><b>Une cible précise</b> : qui regarde, et ce qu'il sait déjà. C'est ce qui permet de choisir quoi expliquer et quoi sauter.</li>
  <li><b>Une seule action</b> : Duarte recommande de déterminer la seule chose que le public doit faire après, et de ne demander que celle-là.</li>
  <li><b>Le noyau d'abord</b> : <i>Made to Stick</i> range parmi les idées qui marquent celles qui sont simples, inattendues, concrètes, crédibles, émotionnelles et racontées comme des histoires. Le premier filtre reste la simplicité.</li></ul>
  <p>Duarte conseille aussi d'utiliser la Big Idea comme <b>filtre</b> : tout élément qui ne la sert pas est à couper.</p>
  <p><span class="tag">Synthèse</span> Le champ « cible » et le champ « ce qu'elle sait déjà » sont une mise en pratique de ces principes, pas une règle tirée mot pour mot des sources.</p>`,
  sources:["duarte6","stick","stick2"],
  questions:[
    {p:"Message proposé :", s:"Je vais parler de la capoeira, de son histoire et de comment débuter.", o:["Il est trop court","C'est une liste de trois sujets, pas un message","Il manque une accroche","Il manque un appel à l'action"], c:1, e:"Trois thèmes empilés, aucun point de vue. Il faut choisir un noyau, comme le demande le principe Simple."},
    {p:"Cible proposée :", s:"Tout le monde, des débutants aux experts.", o:["C'est bien, ça maximise l'audience","Impossible de savoir quoi expliquer ou quoi sauter","C'est bien si la vidéo est longue","Il faut juste ajouter un âge"], c:1, e:"Un débutant et un expert n'ont pas besoin des mêmes explications. Sans cible, on ne peut pas calibrer."},
    {p:"Dans Made to Stick, que veut dire « Simple » ?", o:["Utiliser des mots courts","Faire une vidéo courte","Trouver le noyau de l'idée et retirer le superflu","Éviter les chiffres"], c:2, e:"Simple ne veut pas dire simpliste : c'est isoler l'essentiel."},
    {p:"Combien d'actions Duarte recommande-t-il de demander au public ?", o:["Une seule","Trois, pour laisser le choix","Autant que de parties","Aucune, c'est trop commercial"], c:0, e:"Une seule action, avec un enjeu clair."},
    {p:"Ta Big Idea sert de filtre. Concrètement, ça veut dire :", o:["Elle doit apparaître dans le titre","Tout ce qui ne la sert pas peut être coupé","Il faut la répéter à chaque partie","Elle remplace l'accroche"], c:1, e:"Duarte : chaque élément doit soutenir la Big Idea, le reste est à couper."}
  ],
  app:[
    {id:"cible", label:"Ta cible", type:"textarea", help:"Une personne type : situation, besoin, contexte de visionnage.", checks:"cible"},
    {id:"sait", label:"Ce que ta cible sait déjà", type:"textarea", help:"Ce que tu n'as pas besoin d'expliquer."},
    {id:"objectif", label:"Objectif principal", type:"select", options:["","Informer","Convaincre","Faire agir","Divertir"]},
    {id:"action", label:"La seule action que tu attends après la vidéo", type:"text", ph:"Ex. : tester la méthode cette semaine"},
    {id:"format", label:"Format et durée visée", type:"text", ph:"Ex. : YouTube, 6 à 8 minutes"}
  ]},
{ id:"m3", tc:"18:00", min:10, short:"Structure", title:"Choisir une structure",
  concept:`<p>Trois cadres, chacun adapté à un type de vidéo :</p>
  <ul><li><b>Trois actes (Syd Field, <i>Screenplay</i>, 1979)</b> : exposition, confrontation, résolution. Entre chaque acte, un <b>plot point</b>, un événement qui relance l'intrigue dans une nouvelle direction. Le livre est considéré comme le premier à formaliser ce modèle pour le scénario.</li>
  <li><b>Cercle de Dan Harmon</b> : 8 étapes (YOU, NEED, GO, SEARCH, FIND, TAKE, RETURN, CHANGE). Le personnage revient à son point de départ, mais changé. Harmon l'a simplifié à partir du voyage du héros de Joseph Campbell.</li>
  <li><b>PAS : problème, agitation, solution</b>. C'est une formule de <b>copywriting</b> (rédaction publicitaire) : nommer le problème, le rendre concret et ressenti, puis apporter la solution.</li></ul>
  <p><span class="tag">Adaptation</span> PAS vient de la publicité écrite, pas de la vidéo. L'appliquer à une vidéo pédagogique est un usage courant mais c'est une transposition.</p>`,
  sources:["field","harmon","harmon2","pas","pas2"],
  questions:[
    {p:"Quelle structure pour ce pitch ?", s:"Je raconte comment j'ai quitté mon CDI pour une reconversion, ce que ça m'a coûté, et ce que j'en ai retiré.", o:["Trois actes","Cercle de Harmon","PAS"], c:1, e:"Un personnage sort de sa zone de confort, paie un prix et revient changé : c'est le cercle.", row:true},
    {p:"Et pour celui-ci ?", s:"Tu perds deux heures par semaine dans tes mails. Et chaque relance oubliée te coûte un client. Voici une méthode en trois règles.", o:["Trois actes","Cercle de Harmon","PAS"], c:2, e:"Problème, agitation (le client perdu), solution.", row:true},
    {p:"Et celui-là ?", s:"Court-métrage de fiction : un livreur trouve un colis qui n'est pour personne. Tout bascule quand il l'ouvre.", o:["Trois actes","Cercle de Harmon","PAS"], c:0, e:"Fiction avec un événement déclencheur qui fait passer à l'acte 2 : modèle de Field. Le cercle marcherait aussi si le livreur change à la fin.", row:true},
    {p:"Dans PAS, à quoi sert l'agitation ?", o:["À présenter le produit","À rendre le problème concret et ressenti avant la solution","À faire rire","À résumer la vidéo"], c:1, e:"Sans agitation, la solution arrive avant que le spectateur ait senti qu'il en avait besoin."},
    {p:"Dans le cercle de Harmon, que se passe-t-il juste après FIND ?", o:["Le retour (RETURN)","Le prix à payer (TAKE)","Le changement (CHANGE)","Le départ (GO)"], c:1, e:"Il obtient ce qu'il voulait, puis il en paie le prix. C'est ce qui rend l'histoire crédible."},
    {p:"Chez Syd Field, qu'est-ce qui fait passer d'un acte au suivant ?", o:["Un changement de décor","Un plot point qui relance l'intrigue","Une pause musicale","La fin d'un chapitre"], c:1, e:"Le plot point est un événement qui oriente l'histoire dans une nouvelle direction."}
  ],
  app:[
    {id:"structure", label:"Structure choisie", type:"structure"},
    {id:"pourquoi", label:"Pourquoi cette structure pour ton idée ?", type:"textarea", help:"Une ou deux phrases. Si tu hésites entre deux, écris-le."}
  ]},
{ id:"m4", tc:"28:00", min:8, short:"Accroche", title:"L'accroche",
  concept:`<p>YouTube mesure dans ses statistiques un indicateur appelé <b>Intro</b> : le pourcentage du public encore présent <b>après les 30 premières secondes</b>.</p>
  <p>Selon l'aide YouTube, un bon score peut signifier que ce début correspondait à <b>ce que promettaient le titre et la miniature</b>, et qu'il a gardé le public intéressé. YouTube conseille de retravailler ces 30 secondes et de tester plusieurs styles.</p>
  <p><span class="tag">Synthèse</span> Pour écrire ces 30 secondes, on combine deux éléments vus plus haut : <b>tenir la promesse</b> du titre (YouTube) et <b>ouvrir une tension</b> que la suite va résoudre (le problème de PAS, le besoin du cercle de Harmon).</p>
  <p>Ce qui coûte du temps sans rien promettre : les salutations, la présentation de la chaîne, les rappels d'abonnement en ouverture.</p>`,
  sources:["yt","pas","harmon"],
  questions:[
    {p:"Que mesure l'indicateur Intro de YouTube ?", o:["Le nombre de clics sur la miniature","Le pourcentage du public encore là après 30 secondes","La durée moyenne de visionnage","Le nombre de likes dans la première minute"], c:1, e:"C'est le pourcentage de spectateurs encore présents après les 30 premières secondes."},
    {p:"Selon l'aide YouTube, un score d'intro élevé peut signifier :", o:["Que la vidéo est courte","Que le début correspondait à ce que promettaient le titre et la miniature","Que la musique est bonne","Que la vidéo est bien référencée"], c:1, e:"L'enjeu des 30 secondes, c'est de confirmer au spectateur qu'il a cliqué sur la bonne vidéo."},
    {p:"Titre : « Pourquoi j'ai arrêté les to-do lists ». Quelle accroche est la plus forte ?", o:["Salut à tous, bienvenue sur la chaîne, pensez à vous abonner !","Aujourd'hui, on va parler d'organisation.","Pendant trois ans, ma to-do list a grossi chaque jour. Un matin, je l'ai supprimée. Voilà ce que j'ai mis à la place.","L'organisation est un sujet important pour beaucoup de gens."], c:2, e:"Elle tient la promesse du titre, pose une tension (pourquoi supprimer ?) et annonce une réponse."},
    {p:"Qu'est-ce qui affaiblit le plus une accroche ?", o:["Commencer par une question","Commencer par une anecdote","Commencer par des salutations et des rappels d'abonnement","Commencer par un chiffre"], c:2, e:"Ces secondes ne disent rien de ce que la vidéo promet."}
  ],
  app:[
    {id:"promesse", label:"Ton titre (la promesse)", type:"text", help:"Ce que le spectateur s'attend à trouver en cliquant."},
    {id:"h1", label:"Accroche, version 1", type:"textarea", cls:"script-in", analyze:true},
    {id:"h2", label:"Accroche, version 2", type:"textarea", cls:"script-in", analyze:true},
    {id:"h3", label:"Accroche, version 3", type:"textarea", cls:"script-in", analyze:true},
    {id:"hchoix", label:"Celle que tu gardes", type:"pick", from:["h1","h2","h3"]}
  ]},
{ id:"m5", tc:"36:00", min:9, short:"Écrire pour l'oral", title:"Écrire pour l'oral",
  concept:`<p>Les guides d'écriture radio et télé disent tous la même chose : on écrit <b>pour l'oreille</b>, pas pour l'œil. Le spectateur ne peut pas relire.</p>
  <ul><li><b>Une idée par phrase</b>, des phrases courtes. Le guide de l'Université de Floride conseille 20 mots maximum ; celui des CDC 25 maximum, et pas plus d'une respiration par phrase.</li>
  <li><b>Sujet, verbe, complément</b>, dans cet ordre, à la voix active.</li>
  <li><b>Lire à voix haute</b> : c'est, selon le guide de l'Université de Floride, le test le plus important. Là où tu bloques, la phrase est trop longue ou pas claire.</li>
  <li><b>Penser en images</b> : les guides de reportage télé demandent d'écrire en pensant à ce qu'on voit à l'écran en même temps.</li></ul>
  <p>Dans les exercices ci-dessous, chaque phrase de plus de 20 mots est signalée en rouge.</p>`,
  sources:["ufl","cdc"],
  questions:[
    {p:"Quelle version est la mieux écrite pour l'oral ?", o:["Notre formation, lancée l'an dernier après une phase de test auprès de trois équipes pilotes, a nettement augmenté la satisfaction des participants.","Notre formation a été lancée l'an dernier. Trois équipes l'ont testée. Résultat : la satisfaction a nettement augmenté."], c:1, e:"Trois phrases, une idée chacune. On peut la lire sans reprendre son souffle au milieu."},
    {p:"Selon le guide de l'Université de Floride, le test le plus important d'un texte écrit pour l'oreille est :", o:["Le compter","Le lire à voix haute","Le faire relire par écrit","Le passer dans un correcteur"], c:1, e:"La lecture à voix haute révèle immédiatement les phrases trop longues ou confuses."},
    {p:"Quelle longueur maximale de phrase recommande ce même guide ?", o:["8 mots","20 mots","40 mots","Peu importe si c'est clair"], c:1, e:"20 mots ou moins. Le guide des CDC donne 25, avec la règle d'une respiration par phrase."}
  ],
  exercise:{id:"rewrite", label:"Exercice : réécris cette phrase pour l'oral", s:"Notre programme d'accompagnement, qui a été conçu l'année dernière par une équipe pluridisciplinaire après plusieurs mois d'entretiens avec des utilisateurs aux profils variés, permet désormais à chacun de progresser à son rythme tout en bénéficiant d'un suivi personnalisé."},
  app:[
    {id:"p1texte", label:"Partie 1 : texte à dire", type:"textarea", cls:"script-in", analyze:true, help:"Ce qui vient juste après l'accroche, en suivant la première étape de ta structure."},
    {id:"p1visuel", label:"Partie 1 : ce que le spectateur voit", type:"textarea", help:"Plan, illustration, texte à l'écran."},
    {id:"cta", label:"Appel à l'action final", type:"textarea", cls:"script-in", analyze:true, help:"Reprends l'action unique du module 2."}
  ]}
];
const BILAN = {id:"bilan", tc:"45:00", short:"Bilan", title:"Bilan et export"};
