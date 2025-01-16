// Version corrigée

// const fs = require("fs");
//------------------------------------------------------------MODELISATION
// Pseudo ontologie : c'est plutôt un recueil de concepts vaguement rangés
const raw = `
ontology
  production
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

FINAL_LEVEL = 13;
var concepts_id = 0;
//--------------------------------------------------------------CONCEPT CLASS
class Concept {
  constructor(name, superConcept, subConcepts, level) {
    this.id = concepts_id++;
    this.name = name;
    this.level = level;
    this.superConcept = superConcept;
    this.subConcepts = subConcepts;
    this.display = false;
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

  addSuperConcept(superConcept) {
    this.superConcept = superConcept;
    superConcept.subConcepts.push(this);
  }

  addSubConcept(subConcept) {
    this.subConcepts.push(subConcept);
    subConcept.superConcept = this;
  }

  makeDisplayable() {
    this.display = true;
    this.superConcept?.makeDisplayable();
  }
}

function countLeadingTabs(line) {
  let count = 0;
  let i = 0;

  while (i < line.length) {
    if (line[i] === "\t") {
      count++;
      i++;
    } else if (line[i] === " " && line[i + 1] === " ") {
      count++;
      i += 2;
    } else {
      break;
    }
  }

  return count;
}

function findSubBranch(rawLines, start, end) {
  let level = countLeadingTabs(rawLines[start]);
  for (let i = start + 1; i < end; i++) {
    if (countLeadingTabs(rawLines[i]) == level) return i;
  }
  return end;
}

function parseTxtBranch(rawLines, start, end) {
  root = rawLines[start];
  baseLevel = countLeadingTabs(root);
  root = root.trim();
  const rootConcept = new Concept(root, null, [], baseLevel);

  if (end - start == 1) return rootConcept;
  else {
    let i = start + 1;
    while (i < end) {
      let j = findSubBranch(rawLines, i, end);
      let subBranch = parseTxtBranch(rawLines, i, j);
      rootConcept.addSubConcept(subBranch);
      i = j;
    }
    return rootConcept;
  }
}

function parseTxtTree(rawTree) {
  const rawLines = rawTree.split("\n").filter((line) => line.trim() !== "");
  return parseTxtBranch(rawLines, 0, rawLines.length);
}

function dropShallowBranches(tree, minDepth) {}

//-----------------------------------------------INDEXATION (UN PEU) SEMANTIQUE
const concepts = parseTxtTree(arbre).asList();
console.log(concepts);

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
  "#A1A1FF", // Bleu clair
  "#8033FF", // Violet clair
  "#FF8033", // Orange clair
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
    level: concept.level,
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

  concepts.forEach((concept) => {
    if (concept.level == FINAL_LEVEL) {
      concept.makeDisplayable();
    }
  });

  // génération des noeuds
  concepts.forEach((concept) => {
    if (concept.display) nodes.push(toVisDatasetNodeElement(concept));
  });

  // génération des arêtes
  concepts.forEach((concept) => {
    concept.subConcepts.forEach((subConcept) => {
      if (subConcept.display)
        edges.push(toVisDatasetEdgeElement(concept, subConcept));
    });
  });

  return {
    nodes: nodes,
    edges: edges,
  };
}
