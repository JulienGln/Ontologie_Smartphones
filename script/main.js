/**************************/
/** VARIABLES GLOBALES  **/
/************************/

// variable globales
var edges, nodes, container, data, options, network;
// similaire à des classes Noeud et Lien
// classe Node : https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/Node.js
// classe Edge : https://github.com/visjs/vis-network/blob/master/lib/network/modules/components/Edge.js
var nbComposantesConnexes;

/**************************/
/** PROGRAMME PRINCIPAL **/
/************************/

var displayAll = false;
const DISPLAY_ALL_NODE_SPACING = 400;
const DISPLAY_DEFAULT_NODE_SPACING = 100;

// ce qui doit être fait une fois la page chargée
window.addEventListener("load", async function () {
  // masque l'écran de chargement
  document.getElementById("loading-screen").style.display = "none";

  // créer un réseau
  container = document.getElementById("mynetwork");
  data = toVisDataset(displayAll);
  console.log(data);

  // options pour les noeuds : https://visjs.github.io/vis-network/docs/network/nodes.html
  // options pour les arêtes : https://visjs.github.io/vis-network/docs/network/edges.html
  // options pour le layout : https://visjs.github.io/vis-network/docs/network/layout.html
  // options par défaut (noeuds, arêtes ...)
  options = {
    autoResize: true,
    height: "100%",
    width: "100%",
    layout: {
      improvedLayout: false,
      hierarchical: {
        direction: "UD", // 'UD' pour haut en bas, 'DU' pour bas en haut
        sortMethod: "directed", // 'directed' pour organiser en fonction de la direction des arêtes
        levelSeparation: 1000,
        nodeSpacing: DISPLAY_ALL_NODE_SPACING,
      },
    },
    physics: {
      enabled: false, // Désactiver la physique pour un agencement plus stable
    },
    // options tous les noeuds
    nodes: {
      shape: "circle",
      font: {
        size: 18,
        //background: "lightgrey",
        color: "black",
      },
      shadow: true,
      chosen: {
        node: animateNode,
      },
    },
    // options toutes les arêtes
    edges: {
      labelHighlightBold: true,
      // length: 200,
      smooth: true,
      dashes: true,
      scaling: {
        label: true,
      },
    },
  };

  document
    .getElementById("btnDisplayFullTree")
    .addEventListener("click", () => {
      displayAll = !displayAll;
      let btn = document.getElementById("btnDisplayFullTree");

      if (displayAll) {
        options.layout.hierarchical.nodeSpacing = DISPLAY_DEFAULT_NODE_SPACING;
        btn.textContent = "Réduire l'arbre";
      } else {
        options.layout.hierarchical.nodeSpacing = DISPLAY_ALL_NODE_SPACING;
        btn.textContent = "Afficher l'arbre complet";
      }

      data = toVisDataset(displayAll);
      network = new vis.Network(container, data, options);
    });

  // affichage de la page
  document.getElementById("main-page").style.display = "";
  network = new vis.Network(container, data, options);

  var selectedNodes = [];
  var selectedEdges = [];

  // réaction du bouton d'info
  document
    .getElementById("btnCommandsModal")
    .addEventListener("click", (event) => {
      infosGraphe();
    });

  // gestion du canvas
  // ajoute un nouveau noeud lorsqu'on clique dans le canvas
  // https://visjs.github.io/vis-network/docs/network/#methods
  // manipulation du DataSet nodes et edges : https://visjs.github.io/vis-data/data/dataset.html
  network.on("click", function (params) {
    // si on a cliqué sur un noeud
    var nodeId = null;
    if (params.nodes.length > 0) {
      nodeId = params.nodes;
      console.log("ID du noeud sélectionné : " + nodeId);
    }

    // si on a cliqué sur une arête (edge)
    else if (!params.nodes.length && params.edges.length > 0) {
      var edgeId = null;
      // Shift (maj) + clic sur une arête pour l'éditer
      if (window.event.shiftKey) {
        edgeId = params.edges;
        editEdge(edgeId);
        network.setData({ nodes, edges });
      }

      // ctrl + clic gauche sur les liens pour en sélectionner un ou plusieurs
      if (window.event.ctrlKey) {
        selectedEdges.push(...params.edges);
        network.selectEdges(selectedEdges);
      } else {
        selectedEdges = [...params.edges];
      }
    } else {
      selectedNodes = [];
      selectedEdges = [];
      network.unselectAll();
    }
  });

  // autres méthodes pour édition : https://visjs.github.io/vis-data/data/dataset.html
  // nodes.update({id: 4, label: "changed label"}); MODIFIER UN NOEUD EXISTANT
});
