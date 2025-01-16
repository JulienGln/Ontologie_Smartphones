# Ontologie_Smartphones
Théo MATROD - Gor GRIGORYAN - Julien GALERNE

Projet d'INFO 907 - Ingénierie des connaissances

Ce projet affiche une représentation graphique (sous forme d'arbre) de l'ontologie d'un ensemble de smartphones. L'objectif est de pouvoir choisir un smartphone en fonction des caractéristiques, tel un arbre de décision.

Il reprend la base d'un projet antérieur, réalisé en L3 dans le cadre du module d'INFO 601 - Théorie des graphes

## Lancement du projet
1. Ouvrir le fichier [graphes.html](./graphes.html) dans un navigateur
2. Il est possible de voir ensuite la visualisation complète de l'ontologie ou juste une partie de l'arbre via le bouton situé en haut de la page

## Contenu du dépôt
- [ontologie.txt](./ontologie.txt) : le détail de l'ontologie des smartphones
- [graphes.html](./graphes.html) : le fichier html affichant l'ontologie
- Dossier des [scripts](./script/) : les différents fichers JS utilisés
    - [arbre.js](./script/arbre.js) : contient l'arbre dans une variable
    - [indexation.js](./script/indexation.js) : transforme l'arbre en objet utilisable pour la librairie
    - [main.js](./script/main.js) : fichier principal, récupère l'arbre et l'affiche