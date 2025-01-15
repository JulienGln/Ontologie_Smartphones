// Version corrigée

const fs = require("fs");

//------------------------------------------------------------MODELISATION
// Pseudo ontologie : c'est plutôt un recueil de concepts vaguement rangés
const raw = `	production
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
const ontology = new Concept("informatique", null, [], 0);

// Parsing pénible de la pseudo-ontologie (string)
const stack = [ontology];
const list = raw.split("\n");
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

const matrix = {};
const files = fs.readdirSync("./rome_txt/txt");

files.forEach((file) => {
  let content = fs.readFileSync("./rome_txt/txt/" + file, "utf8").toLowerCase();
  // Remplacement des caractères de séparation par des espaces
  content = content.replace(/[\n\t,.!-]/g, " ");
  let vector = {};
  matrix[file] = vector;
  concepts.forEach((concept) => {
    // Recherche des occurrences exactes en expressions individuelles
    // (encadrées par des espaces)
    if (content.indexOf(" " + concept.name + " ") != -1)
      vector[concept.name] = 1;
    else vector[concept.name] = 0;
  });
});

//------------------------------------------------------------RESULTAT
// Nombre de concepts trouvés par document, sans gestion de hiérarchie
Object.keys(matrix).forEach((file) => {
  let vector = matrix[file];
  let sum = 0;
  Object.values(vector).forEach((v) => (sum += v));
  console.log(file, sum);
});

//---------------------------------------------TEMPS DE RECHERCHE
const before = Date.now();

const docs = [];
Object.keys(matrix).forEach((file) => {
  if (matrix[file]["python"] == 1) docs.push(file);
});

const after = Date.now();
console.log(after - before);
console.log(docs.length);

function toVisDatasetNodeElement(concept) {
  return {
    id: concept.id,
    label: concept.name,
    shape: "circularImage",
    type: "CONCEPT",
    title: concept.name,
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
  concepts.forEach((concept) => {
    nodes.push(toVisDatasetNodeElement(concept));
  });

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
