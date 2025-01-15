/**
 * utils.js
 * Ce fichier contient des fonctions utilitaires pour faciliter le développement.
 */

/**
 * Vérifie si une valeur est présente dans un tableau.
 * @param {Array} T - Le tableau dans lequel rechercher la valeur.
 * @param {number} p - La valeur à rechercher dans le tableau.
 * @returns {boolean} - Retourne true si la valeur est trouvée dans le tableau, sinon false.
 */
function inArray(T, p) {
  for (let i = 0; i < T.length; i++) {
    if (T[i] == p) {
      return true;
    }
  }
  return false;
}

/**
 * Attend un nombre spécifié de millisecondes
 * @param {number} ms - Le nombre de millisecondes à attendre.
 * @returns {Promise} Une promesse qui se résout après le délai spécifié.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Affiche un message de débogage dans la console en spécifiant la fonction qui envoie ce message.
 * @param {string} fonction - Le nom de la fonction qui envoie le message.
 * @param {string} [variable=null] - Une variable optionnelle à afficher avec le message.
 * @param {string} message - Le message à afficher.
 */
function debug(fonction, variable = null, message) {
  console.log(
    "@" + fonction + " " + (variable == null ? "" : variable) + " : " + message
  );
}

function printFormulaire() {
  // génère le modal et récupère les infos pour l'instanciation d'un nouveau noeud
  var modal = document.getElementById("newNodeModal");
  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Met à jour les informations du graphe dans le modal d'information
 */
function infosGraphe() {
  var divInfo = document.getElementById("commandsModalDiv");
  var titre = "<h2 class='modal-title fs-5'>Graphe</h2>";
  // mise à jour des composantes connexes
  resetMarquage(nodes);
  parcoursEnProfondeur(nodes, edges);

  var composantesConnexes =
    "<li>Il y a <span class='fw-bold'>" +
    nbComposantesConnexes +
    "</span> composante" +
    (nbComposantesConnexes > 1 ? "s" : "") +
    " connexe" +
    (nbComposantesConnexes > 1 ? "s." : ".") +
    "</li>";

  // récupère tous les concepts
  var tabConcept = getAllConcept(nodes);
  var allConcept = "<li><span class='fw-bold'>CONCEPTS</span> : ";
  tabConcept.forEach((concept, index) => {
    allConcept +=
      concept.label + (index !== tabConcept.length - 1 ? " - " : "");
  });
  allConcept += "</li>";

  // récupère toutes les instances
  var tabInstance = getAllInstance(nodes);
  var allInstance = "<li><span class='fw-bold'>INSTANCES</span> : ";
  tabInstance.forEach((instance, index) => {
    allInstance +=
      instance.label + (index !== tabInstance.length - 1 ? " - " : "");
  });
  allInstance += "</li>";

  divInfo.innerHTML =
    titre + "<ul>" + composantesConnexes + allConcept + allInstance + "</ul>";
}

function animateNode(values, id, selected, hovering) {
  values.color = "#ff0000";
  var tempSize = values.size;
  if (selected) {
    values.size = tempSize * 1.25;
  } else {
    values.size = tempSize;
  }
}

/**
 * Fonction qui renvoie tous les ids des successeurs d'un noeud.
 * @param {string} id - L'ID du noeud pour lequel chercher les successeurs.
 * @param {Array} aretes - Le tableau des arêtes à parcourir.
 * @return {Array} - Le tableau des IDs des successeurs du noeud.
 */
function searchSuccessors(id, aretes) {
  debug("searcSuccessors", "ID", id);
  debug("searcSuccessors", "edges", JSON.stringify(aretes));
  let res = [];
  for (let i = 0; i < edges.length; i++) {
    if (edges.get(aretes[i])["id"] == id) {
      debug("searcSuccessors", "Edge " + i, edges.get(aretes[i])["id"]);
      res.push(edges.get(aretes[i])["to"]);
    }
  }
  debug("searchSuccessors", "res", JSON.stringify(res));
  return res;
}

/**
 * Fonction pour éditer le nom d'un lien.
 * @param {string} edgeId - L'ID de l'arête à éditer.
 */
function editEdge(edgeId) {
  var newLabel = "";
  debug("editEdge", "edgeId", edgeId);
  debug("editEdge", "edge", JSON.stringify(edges.get(edgeId)[0]));
  debug("editEdge", "edges array", JSON.stringify(edges));
  newLabel = window.prompt(
    "Entrez un nom pour l'arête qui va de " +
      nodes.get(edges.get(edgeId)[0].from).label +
      " (" +
      edges.get(edgeId)[0].from +
      ") à " +
      nodes.get(edges.get(edgeId)[0].to).label +
      " (" +
      edges.get(edgeId)[0].to +
      ")",
    edges.get(edgeId)[0]["label"]
  );

  if (newLabel != null && newLabel != "") {
    edges.get(edgeId)[0]["label"] = newLabel;
    edges.get(edgeId)[0].title = newLabel;
    /*edges.get(edgeId)[0].length =
      newLabel.length < 10 ? newLabel.length * 100 : newLabel.length * 30;*/
  }

  if (window.confirm("Inverser l'ordre de la flèche ?")) {
    var temp = edges.get(edgeId)[0].to;
    edges.get(edgeId)[0].to = edges.get(edgeId)[0].from;
    edges.get(edgeId)[0].from = temp;
  }
  //edges.update(edgeId, { id: edgeId, label: newLabel });
}

/**
 * Fonction pour éditer le nom d'un boeud.
 * @param {string} edgeId - L'ID du noeud à éditer.
 */
function editOneNode(nodeId) {
  var newLabel = "";
  debug("editOneNode", "nodeId", nodeId);
  debug("editOneNode", "node", JSON.stringify(nodes.get(nodeId)[0]));
  debug("editOneNode", "nodes array", JSON.stringify(nodes));
  newLabel = window.prompt(
    "Entrez un nom pour ce noeud",
    nodes.get(nodeId)[0].label
  );

  if (newLabel != null && newLabel != "") {
    nodes.get(nodeId)[0].label = newLabel;
    //nodes.get(nodeId)[0].title = newLabel + " (ID: " + nodes.length + ")";
    //nodes.update({ id: nodeId, label: newLabel, title: newLabel });
  }
}

/**
 * Récupère tous les noeuds qui sont des concepts
 * @param {Array} nodes - Le tableau de noeuds initial.
 * @returns {Array} Un tableau de noeuds correspondant au type CONCEPT
 */
function getAllConcept(nodes) {
  var res = [];
  nodes.forEach((node) => {
    // node est de type : {"id":7,"label":"Organisation","shape":"hexagon","type":"CONCEPT","color":"purple","title":"Concept: Organisation"}
    if (node.type === "CONCEPT") {
      res.push(node);
    }
  });
  return res;
}

/**
 * Récupère tous les noeuds qui sont des instances
 * @param {Array} nodes - Le tableau de noeuds initial.
 * @returns {Array} Un tableau de noeuds correspondant au type INSTANCE
 */
function getAllInstance(nodes) {
  var res = [];
  nodes.forEach((node) => {
    // node est de type : {"id":7,"label":"Organisation","shape":"hexagon","type":"CONCEPT","color":"purple","title":"Concept: Organisation"}
    if (node.type === "INSTANCE") {
      res.push(node);
    }
  });
  return res;
}

/**
 * Récupère tous les noeuds qui correspondent à l'attribut et la valeur
 * @param {Array} nodes - Le tableau de noeuds initial.
 * @param {string} attribut - L'attribut que l'on recherche
 * @param {string} valeur - La valeur de l'attribut qu'on recherche
 * @returns {Array} Un tableau de noeuds correspondant au type INSTANCE
 */
function getSomething(nodes, attribut, valeur) {
  var res = [];
  nodes.forEach((node) => {
    // node est de type : {"id":7,"label":"Organisation","shape":"hexagon","type":"CONCEPT","color":"purple","title":"Concept: Organisation"}
    if (node[attribut] === valeur) {
      res.push(node);
    }
  });
  return res;
}

/**
 * Renvoie le nom du type d'un noeud
 * @param {object} node - Le noeud initial.
 * @param {string} attribut - L'attribut que l'on recherche
 * @returns {string} La chaine de caractere du type
 */
function getValueAttributFromNode(node, attribut) {
  var res = nodes.get(node)[attribut];
  //alert("Noeud : " + node + " attribut : " + attribut + " et res : " + res);
  return res;
}

/**
 * Réinitialise tous les marquages de noeuds
 * @param {Array} nodes - le tableau de noeuds
 */
function resetMarquage(nodes) {
  nodes.forEach((node) => {
    node.marque = false;
  });
}

/**
 * Fonction qui récupère tous les IDs des voisins d'un noeud
 * @param {string|int} nodeID - L'ID du noeud
 * @returns {Array} Un tableau des IDs des noeuds voisins
 */
function findSommetsVoisins(nodeID) {
  var res = [];
  edges.forEach((edge) => {
    //debug("findSommetsVoisins", "edge", JSON.stringify(edge));
    if (edge.from === nodeID) {
      res.push(edge.to);
    } else if (edge.to === nodeID) {
      res.push(edge.from);
    }
  });
  return res;
}

/**
 * Fonction d'exploartion du graphe
 * @param {DataSet} nodes - Les noeuds, intitulé "nodes" dans le main.js
 * @param {DataSet} edges - Les arêtes, intitulé "edges" dans le main.js
 * @param {object} node - Le sommet qui n'est pas marqué (un noeud donc)
 */
function explorer(nodes, edges, node) {
  node.marque = true;
  /*debug(
    "explorer",
    "noeud " + node.id,
    node.marque ? "est marqué..." : "n'est pas marqué"
  );*/
  var voisins = findSommetsVoisins(node.id);
  //debug("explorer", "voisins", voisins);
  voisins.forEach((voisin) => {
    var noeudCourant = nodes.get(voisin);
    if (!noeudCourant.marque) {
      explorer(nodes, edges, noeudCourant);
    }
  });
}

/**
 * Parcours en profondeur du graphe (DFS) : https://fr.wikipedia.org/wiki/Algorithme_de_parcours_en_profondeur
 * @param {DataSet} nodes - Les noeuds, intitulé "nodes" dans le main.js
 * @param {DataSet} edges - Les arêtes, intitulé "edges" dans le main.js
 */
function parcoursEnProfondeur(nodes, edges) {
  //debug("parcoursEnProfondeur", "noeuds", JSON.stringify(nodes));
  //debug("parcoursEnProfondeur", "arêtes", JSON.stringify(edges));
  nbComposantesConnexes = 0;

  nodes.forEach((node) => {
    if (!node.marque) {
      explorer(nodes, edges, node);
      nbComposantesConnexes++;
    }
  });
}

/**
 * Trouver les chemins entre deux noeuds
 * @param {string | int} noeud1 - L'ID du noeud 1
 * @param {string | int} noeud2 - L'ID du noeud 2
 * @returns {Array} Chaque case du tableau retourné est un chemin
 */
function findChemin(noeud1, noeud2, chemin) {
  chemin.push(nodes.get(noeud1));
  var voisins = findSommetsVoisins(noeud1);
  voisins.forEach((voisin) => {
    if (voisin == noeud2) {
      chemin.push(nodes.get(voisin));
      return chemin;
    }
  });

  // si on n'a pas trouvé le noeud2 parmi les voisins, on avance dans le graphe
  voisins.forEach((voisin) => {
    findChemin(voisin, noeud2, chemin);
  });
}

/**
 * Trouver les chemins entre deux noeuds (largeur)
 * @param {string | int} noeud1 - L'ID du noeud 1
 * @param {string | int} noeud2 - L'ID du noeud 2
 * @returns {Array} Chaque case du tableau retourné est un chemin
 */
function findCheminBFS(noeud1, noeud2) {
  let chemin = [];
  // Initialisation de la file avec le premier noeud
  let queue = [[noeud1]];
  // Initialisation de l'ensemble des noeuds visités
  let visited = new Set();

  while (queue.length > 0) {
    // On récupère le premier chemin de la file
    let currentPath = queue.shift();
    // On récupère le dernier noeud du chemin courant
    let currentNode = currentPath[currentPath.length - 1];

    if (currentNode === noeud2) {
      chemin = currentPath;
      break;
    }

    if (!visited.has(currentNode)) {
      // On récupère les voisins du noeud courant
      let voisins = findSommetsVoisins(currentNode);
      // Pour chaque voisin
      for (let voisin of voisins) {
        // On crée un nouveau chemin en ajoutant le voisin au chemin courant
        let newPath = [...currentPath, voisin];
        // On ajoute le nouveau chemin à la file
        queue.push(newPath);
      }
      // On ajoute le noeud courant à l'ensemble des noeuds visités
      visited.add(currentNode);
    }
  }

  // On retourne le chemin en remplaçant les identifiants des noeuds par les noeuds eux-mêmes
  return chemin.map((node) => nodes.get(node));
}

/**
 * Récupère tous les attributs d'un noeud donné
 * @param {number} nodeId - l'identifiant du noeud
 * @returns {Array} les noeuds correspondant aux attributs du noeud
 */
function getPropertiesFromNode(nodeId) {
  var res = [];
  var voisins = findSommetsVoisins(nodeId);
  // debug("getPropertiesFromNode", "voisins", JSON.stringify(voisins));
  // on récupère les voisins du noeud et on cherche les attributs

  voisins.forEach((voisin) => {
    var noeudVoisin = nodes.get(voisin);
    if (noeudVoisin.type === "PROPERTY") {
      // récupération du type de relation
      edges.forEach((edge) => {
        if (edge.from === voisin || edge.to === voisin) {
          noeudVoisin["relation"] = edge.label;
        }
      });
      res.push(noeudVoisin);
    }
  });

  return res;
}

// -------------- CHARGEMENT DES NOEUDS ET ARETES

function loadNodes() {
  return new vis.DataSet([
    {
      id: 0,
      label: "Super U",
      shape: "circularImage",
      type: "INSTANCE",
      title: "Super U (ID: 0)",
      image: "https://www.magasins-u.com/csd/sites/portailu/img/u.png",
    },
    {
      id: 1,
      label: "Enseigne",
      shape: "hexagon",
      type: "CONCEPT",
      title: "Concept : Enseigne",
      color: "purple",
    },
    {
      id: 2,
      label: "Intermarché",
      shape: "circularImage",
      type: "INSTANCE",
      title: "Intermarché (ID: 2)",
      image:
        "https://images.ctfassets.net/26cqtpvnd0cd/NyecMADUMS8OQSo2Seuwi/bf0b2e0a8192e9db881f389a2817e29a/logo_ITM.png",
    },
    {
      id: 3,
      label: "Client",
      shape: "hexagon",
      type: "CONCEPT",
      title: "Concept : Client",
      color: "purple",
    },
    {
      id: 4,
      label: "Bernard",
      type: "INSTANCE",
      title: "Bernard (ID: 4)",
    },
    {
      id: 5,
      label: "Fruits & Légumes",
      shape: "hexagon",
      type: "CONCEPT",
      title: "Concept : Fruits & Légumes",
      color: "purple",
    },
    {
      id: 6,
      label: "Abricot",
      type: "INSTANCE",
      title: "Abricot (ID: 6)",
    },
    {
      id: 7,
      label: "Viande",
      shape: "hexagon",
      type: "CONCEPT",
      title: "Concept : Viande",
      color: "purple",
    },
    {
      id: 8,
      label: "Rumsteak",
      type: "INSTANCE",
      title: "Rumsteak (ID: 8)",
    },
    {
      id: 9,
      label: "Gigot",
      type: "INSTANCE",
      title: "Gigot (ID: 9)",
    },
    {
      id: 10,
      label: "Boeuf",
      type: "PROPERTY",
      shape: "box",
      color: "yellow",
    },
    {
      id: 11,
      label: "skos:Concept",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
    {
      id: 12,
      label: "skos:Concept",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
    {
      id: 13,
      label: "skos:Concept",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
    {
      id: 14,
      label: "skos:Concept",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
    {
      id: 15,
      label: "Agneau",
      type: "PROPERTY",
      shape: "box",
      color: "yellow",
    },
    {
      id: 16,
      label: "Nourriture",
      shape: "hexagon",
      type: "CONCEPT",
      title: "Concept : Nourriture",
      color: "purple",
    },
    {
      id: 17,
      label: "skos:Concept",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
    {
      id: 18,
      label: '"Bernard"',
      type: "PROPERTY",
      shape: "box",
      color: "yellow",
    },
    {
      id: 19,
      label: "Super U",
      type: "PROPERTY",
      shape: "box",
      color: "yellow",
    },
    {
      id: 20,
      shape: "circularImage",
      type: "PROPERTY",
      color: "yellow",
      image: "https://i.imgflip.com/1lbeyi.jpg",
    },
    {
      id: 21,
      label: "Fruit à noyau",
      type: "PROPERTY",
      shape: "box",
      color: "yellow",
    },
    {
      id: 22,
      label: "foaf:Client",
      type: "CONCEPT TYPE",
      shape: "ellipse",
      color: "red",
    },
  ]);
}

function loadEdges() {
  return new vis.DataSet([
    { from: 0, to: 1, label: "rdf:type", arrows: "to" },
    { from: 2, to: 1, label: "rdf:type", arrows: "to" },
    { from: 4, to: 3, label: "rdf:type", arrows: "to" },
    { from: 8, to: 10, label: "marche:nature", arrows: "to" },
    { from: 9, to: 15, label: "marche:nature", arrows: "to" },
    { from: 6, to: 21, label: "marche:nature", arrows: "to" },
    { from: 8, to: 7, label: "rdf:type", arrows: "to" },
    { from: 9, to: 7, label: "rdf:type", arrows: "to" },
    { from: 6, to: 5, label: "rdf:type", arrows: "to" },
    { from: 4, to: 22, label: "rdf:type", arrows: "to" },
    { from: 7, to: 16, label: "skos:broader", arrows: "to" }, // rdfs:subClassOf
    { from: 5, to: 16, label: "skos:broader", arrows: "to" }, // rdfs:subClassOf
    { from: 4, to: 18, label: "foaf:name", arrows: "to" },
    { from: 4, to: 20, label: "foaf:depiction", arrows: "to" },
    { from: 4, to: 19, label: "marche:prefMarche", arrows: "to" },
    {
      from: 1,
      to: 11,
      label: "rdf:type",
      arrows: "to",
      color: "red",
    },
    {
      from: 3,
      to: 12,
      label: "rdf:type",
      arrows: "to",
      color: "red",
    },
    {
      from: 7,
      to: 13,
      label: "rdf:type",
      arrows: "to",
      color: "red",
    },
    {
      from: 5,
      to: 14,
      label: "rdf:type",
      arrows: "to",
      color: "red",
    },
    {
      from: 16,
      to: 17,
      label: "rdf:type",
      arrows: "to",
      color: "red",
    },
  ]);
}
