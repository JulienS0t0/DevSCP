# Guide d'installation et de configuration du projet Unity avec MRTK

## 1. Configuration du projet Unity avec MRTK

Suivez le tutoriel officiel de Microsoft pour configurer un projet Unity avec les bibliothèques MRTK :  
[Tutoriel Microsoft MRTK](https://learn.microsoft.com/en-us/training/modules/learn-mrtk-tutorials/)

## 2. Connexion de l'Hololens

- Activez un point d'accès Wi-Fi sur votre ordinateur.
- Connectez l'Hololens à ce réseau.
- Accédez au **Windows Device Portal** en entrant l'IP de l'Hololens dans un navigateur web.

## 3. Mapping de la salle

- Accédez à la section **3D View** dans le Windows Device Portal.
- Effectuez un scan complet de la salle avec l'Hololens.
- Cliquez sur **Update** pour visualiser le mapping en temps réel.
- Sauvegardez le mapping afin de l'importer ensuite dans Unity.

## 4. Importation du mapping dans Unity

- Téléchargez le projet **Ubiquarium** :  
  [Lien du projet](https://drive.google.com/file/d/1euuoynGs11SU1ok58pshJyNLqv9PJZLj/view?usp=sharing)
- Importez le mapping dans Unity.
- Positionnez la caméra MRTK correctement dans la scène Unity, en tenant compte de l'objet **Offset**.
- Ajoutez les objets 3D aux emplacements souhaités dans la salle.
- Cachez le mapping pour éviter qu'il ne soit visible lors de l'exécution du projet.

## 5. Déploiement du projet sur l'Hololens

- Sauvegardez et compilez le projet Unity.
- Déployez l'application sur l'Hololens.

## 6. Fonctionnalités supplémentaires

Des fonctionnalités comme la reconnaissance vocale sont disponibles, il suffit de dire un des mots présent dans nos script : "câble", "eau", "gaz" ou "annule" pour faire apparaître et disparaître des mappings.

## 7. Annexe

[Documentation MRTK](https://learn.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/?view=mrtkunity-2022-05)
