// Version corrigée

// const fs = require("fs");
//------------------------------------------------------------MODELISATION
// Pseudo ontologie : c'est plutôt un recueil de concepts vaguement rangés
const raw = ` production
		orm
		logiciel
		programme
		source
		framework
		langage
			java
			c++
			javascript
			php
			c#
			python
			cobol
	modélisation
		use-case
		agilité
		architecture
	environnement
		compilation
		ide
		bug
		debugger
		test
		os
		système d'exploitation
	paradigme
		fonctionnel
		déclaratif
		impératif
			séquence
			instruction
		objet
			classe
			instance
			interface
	interface
		embarqué
		mobile
		web
		client lourd`;

var concepts_id = 0;
//--------------------------------------------------------------CONCEPT CLASS
class Concept {
  constructor(name, superConcept, subConcepts, level) {
    this.id = concepts_id++;
    this.name = name;
    this.level = level;
    this.superConcept = superConcept;
    this.subConcepts = subConcepts;
  }
  toString() {
    let s = "";
    for (let i = 0; i < this.level; i++) s += "\t";
    s += this.name + "\n";
    this.subConcepts.forEach((sub) => (s += sub.toString()));
    return s;
  }
  asList() {
    let t = [];
    t.push(this);
    this.subConcepts.forEach((sub) => (t = t.concat(sub.asList())));
    return t;
  }
}

//------------------------------------------------------------PARSING
const ontology = new Concept("Smartphone", null, [], 0);

// Parsing pénible de la pseudo-ontologie (string)
const stack = [ontology];
const list = arbre.split("\n");
list.forEach((element) => {
  let last = stack.at(-1);
  let level = element.length - element.trim().length;
  if (last.level < level) {
    let concept = new Concept(element.trim(), last, [], level);
    last.subConcepts.push(concept);
    stack.push(concept);
  } else if (last.level == level) {
    stack.splice(stack.length - 1, 1);
    last = stack.at(-1);
    let concept = new Concept(element.trim(), last, [], level);
    last.subConcepts.push(concept);
    stack.push(concept);
  } else {
    // last.level > level
    for (let i = 0; i < last.level - level; i++)
      stack.splice(stack.length - 1, 1);
    last = stack.at(-1);
    let concept = new Concept(element.trim(), last, [], level);
    last.subConcepts.push(concept);
    stack.push(concept);
  }
});

//-----------------------------------------------INDEXATION (UN PEU) SEMANTIQUE
const concepts = ontology.asList();
console.log(concepts);

// const matrix = {};
// const files = fs.readdirSync("./rome_txt/txt");

// files.forEach((file) => {
//   let content = fs.readFileSync("./rome_txt/txt/" + file, "utf8").toLowerCase();
//   // Remplacement des caractères de séparation par des espaces
//   content = content.replace(/[\n\t,.!-]/g, " ");
//   let vector = {};
//   matrix[file] = vector;
//   concepts.forEach((concept) => {
//     // Recherche des occurrences exactes en expressions individuelles
//     // (encadrées par des espaces)
//     if (content.indexOf(" " + concept.name + " ") != -1)
//       vector[concept.name] = 1;
//     else vector[concept.name] = 0;
//   });
// });

// //------------------------------------------------------------RESULTAT
// // Nombre de concepts trouvés par document, sans gestion de hiérarchie
// Object.keys(matrix).forEach((file) => {
//   let vector = matrix[file];
//   let sum = 0;
//   Object.values(vector).forEach((v) => (sum += v));
//   console.log(file, sum);
// });

// //---------------------------------------------TEMPS DE RECHERCHE
// const before = Date.now();

// const docs = [];
// Object.keys(matrix).forEach((file) => {
//   if (matrix[file]["python"] == 1) docs.push(file);
// });

// const after = Date.now();
// console.log(after - before);
// console.log(docs.length);

const colors = [
  "#FF5733", // Rouge orangé
  "#33FF57", // Vert lime
  "#3357FF", // Bleu azur
  "#FF33A1", // Rose vif
  "#A1FF33", // Jaune citron
  "#33A1FF", // Bleu ciel
  "#FF8033", // Orange brûlé
  "#8033FF", // Violet intense
  "#33FF83", // Vert menthe
  "#FF3380", // Rose pâle
  "#8033A1", // Pourpre
  "#A1FF80", // Vert pastel
  "#8033FF", // Violet clair
  "#FF8033", // Orange clair
  "#A1A1FF", // Bleu clair
];

function toVisDatasetNodeElement(concept) {
  //   console.log(
  //     concept +
  //       " : " +
  //       Object.keys(concept.subConcepts).map((sub) => {
  //         sub.name;
  //       })
  //   );
  return {
    id: concept.id,
    label: concept.name,
    // shape: "circularImage",
    type: "CONCEPT",
    title: concept.name,
    color: colors[concept.level],
    // group: concept.group,
  };
}

function toVisDatasetEdgeElement(parent, child) {
  return {
    from: parent.id,
    to: child.id,
    arrows: "to",
  };
}

function toVisDataset() {
  nodes = [];
  edges = [];

  // génération des noeuds
  concepts.forEach((concept) => {
    nodes.push(toVisDatasetNodeElement(concept));
  });

  // génération des arêtes
  concepts.forEach((concept) => {
    concept.subConcepts.forEach((subConcept) => {
      edges.push(toVisDatasetEdgeElement(concept, subConcept));
    });
  });

  return {
    nodes: nodes,
    edges: edges,
  };
}
