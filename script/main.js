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

// ce qui doit être fait une fois la page chargée
window.addEventListener("load", async function () {
  // masque l'écran de chargement
  document.getElementById("loading-screen").style.display = "none";

  // créer un réseau
  container = document.getElementById("mynetwork");
  data = toVisDataset();
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
    console.log(params);
    console.log("Noeuds : " + JSON.stringify(nodes));
    console.log("CONCEPT : " + JSON.stringify(getAllConcept(nodes)));
    console.log("INSTANCE : " + JSON.stringify(getAllInstance(nodes)));
    debug(
      "getSomething",
      "nodes color purple",
      JSON.stringify(getSomething(nodes, "color", "purple"))
    );
    console.log("IDs des noeuds : " + nodes.getIds());
    console.log("IDs des arêtes : " + edges.getIds());
    resetMarquage(nodes); // mise à jour des composantes connexes à chaque clic
    parcoursEnProfondeur(nodes, edges); // mise à jour des composantes connexes à chaque clic
    console.log("Nombre de composantes connexes : " + nbComposantesConnexes);
    /*nodes.forEach((node) => {
      console.log("node " + node.id + " : " + JSON.stringify(node));
    });*/

    // si on a cliqué sur un noeud
    var nodeId = null;
    if (params.nodes.length > 0) {
      nodeId = params.nodes;
      console.log("ID du noeud sélectionné : " + nodeId);
      console.log(
        "Attributs du noeud " +
          nodes.get(nodeId)[0].label +
          " : " +
          JSON.stringify(getPropertiesFromNode(nodes.get(nodeId)[0].id))
      );
      //alert("Succ : " + JSON.stringify(succ));
      console.log(
        "Noeud (" + nodeId + ") : " + JSON.stringify(nodes.get(nodeId)[0])
      );

      // ctrl + clic gauche sur un noeud pour en sélectionner un ou plusieurs
      if (window.event.ctrlKey) {
        // évite de faire un sac de noeuds en sélectionnant plusieurs fois les mêmes noeuds
        if (!inArray(selectedNodes, params.nodes)) {
          selectedNodes.push(...params.nodes);
          network.selectNodes(selectedNodes);
        }
      } else {
        selectedNodes = [...params.nodes];
      }

      // Shift (maj) + clic sur un noeud pour l'éditer
      if (window.event.shiftKey) {
        editOneNode(nodeId); // editNode doit déjà être pris par l'API
        network.setData({ nodes, edges });
      }
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

    // activation ou non du bouton pour lier les noeuds
    if (selectedNodes.length > 1) {
      document.getElementById("btnLinkNodes").disabled = false;
    } else {
      document.getElementById("btnLinkNodes").disabled = true;
    }

    // activation ou non du bouton pour rechercher un chemin
    document.getElementById("btnSearchWay").disabled =
      selectedNodes.length !== 2;

    // si on appuie sur "shift" (Majuscule)
    if (window.event.shiftKey) {
      // si on a cliqué dans le vide (pas de noeuds, ni d'arête)
      if (params.nodes.length == 0 && params.edges.length == 0) {
        var nodeName = window.prompt("Nom du noeud : ");
        var nodeType = window
          .prompt(
            "Type du noeud (PROPERTY, INSTANCE, CONCEPT, CONCEPT TYPE) : ",
            "INSTANCE"
          )
          .toUpperCase();
        if (nodeType == "PROPERTY") {
          var nodeShape = "box";
          var nodeColor = "yellow";
        } else if (nodeType == "INSTANCE") {
          var nodeShape = "circle";
          var nodeColor = "#97c2fc";
        } else if (nodeType == "CONCEPT") {
          var nodeShape = "hexagon";
          var nodeColor = "purple";
        } else if (nodeType == "CONCEPT TYPE") {
          var nodeShape = "ellipse";
          var nodeColor = "red";
        } else {
          var nodeShape = "circle";
          var nodeColor = "lime";
        }
        var updatedIds = nodes.add([
          {
            id: nodes["length"],
            label: nodeName,
            title: nodeName + " (ID: " + nodes.length + ")",
            type: nodeType,
            shape: nodeShape,
            color: nodeColor,
            x: params.pointer.canvas.x,
            y: params.pointer.canvas.y,
          },
        ]);
      }
    }
  });

  // autres méthodes pour édition : https://visjs.github.io/vis-data/data/dataset.html
  // nodes.update({id: 4, label: "changed label"}); MODIFIER UN NOEUD EXISTANT
});
