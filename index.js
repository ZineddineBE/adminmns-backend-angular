const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwtUtil = require("jsonwebtoken");
const jwtParser = require("./jwt-parser");
const app = express();
const connection = require("./connection-db");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/inscription", (req, res) => {
  const utilisateur = req.body;

  bcrypt.hash(utilisateur.password, 10, (err, hash) => {
    connection.query(
      "INSERT INTO utilisateur (utilisateur_email, utilisateur_password) VALUES (?,?)",
      [utilisateur.email, hash],
      (err, hash) => {
        if (err) {
          console.debug(err);
          return res.sendStatus(500);
        }
        res.json({
          message: "utilisateur : '" + utilisateur.email + "' enregistré",
        });
      }
    );
  });
});

app.post("/connexion", (req, res) => {
  const utilisateur = req.body;

  connection.query(
    "SELECT * FROM utilisateur WHERE utilisateur_email = ?",
    [utilisateur.email],
    (err, resultat) => {
      if (err) {
        console.debug(err);
        return res.sendStatus(500);
      }

      if (resultat.length != 1) {
        return res.sendStatus(401);
      }

      bcrypt.compare(utilisateur.password, resultat[0].utilisateur_password,
        (err, compatible) => {
          if (err) {
            console.debug(err);
            return res.sendStatus(500);
          }

          if (compatible) {
            return res.send(
                jwtUtil.sign({email : utilisateur.email}, "azerty123")
            );
          }
          return res.sendStatus(401);
        })
    }
  );
});

app.get("/formations", jwtParser, (req, res) => {

  connection.query(
    "SELECT formation_id as id, formation_nom as nom, formation_description as description, formation_niveau as niveau, formation_nom_image as nom_image FROM formation",
    (err, formations) => {
      res.json(formations);
    }
  );
  
});

app.get("/retards", jwtParser, (req, res) => {
	connection.query(
		"SELECT retard_id as id,retard_date as date, retard_heure_arrivee as heure_arrivee, retard_motif as motif, retard_statut as statut, retard_date_declaration as date_declaration FROM retard",
		(err, retards) => {
			res.json(retards);
		}
	);
});

app.get("/formation/:id", jwtParser, (req, res) => {

  const id = parseInt(req.params.id);
  connection.query(
    "SELECT * FROM formation WHERE formation_id = ?",
    [id],
    (err, formations) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      if (formations.length === 0) {
        return res.status(404).json({ error: "Formation not found" });
      }

      res.json({
        id: formations[0].formation_id,
        nom: formations[0].formation_nom,
        description: formations[0].formation_description,
        niveau: formations[0].formation_niveau,
      }); // Retourne la formation trouvée avec les bons noms de colonne

    }
  );
});

app.get("/retard/:id", jwtParser, (req, res) => {
	const id = parseInt(req.params.id);
	connection.query(
		"SELECT * FROM retard WHERE retard_id = ?",
		[id],
		(err, retards) => {
			if (err) {
				console.error(err);
				return res.sendStatus(500);
			}

			if (retards.length === 0) {
				return res.status(404).json({ error: "Retard not found" });
			}

			res.json({
				id: retards[0].retard_id,
				date: retards[0].retard_date,
				heure_arrivee: retards[0].retard_heure_arrivee,
				motif: retards[0].retard_motif,
				statut: retards[0].retard_statut,
				date_declaration: retards[0].retard_date_declaration,
			}); // Retourne le retard trouvée avec les bons noms de colonne
		}
	);
});

app.post("/formation", jwtParser, (req, res) =>{
  const formation = req.body;

  if(formation.nom.length < 5 || formation.nom.length > 255 || formation.description.length < 30 || formation.description.length > 500 ) {
    res.sendStatus(400);
  }

  connection.query(
    "SELECT formation_id FROM formation WHERE formation_nom =?",
    [formation.nom],
    (err, lignes) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      //Un produit porte déjà le nom saisi
      if(lignes.length >= 1) {
        return res.sendStatus(409);
      }

      connection.query(
        "INSERT INTO formation (formation_nom, formation_description, formation_niveau, utilisateur_id) VALUES (?,?,?,?)",
        [formation.nom, formation.description, formation.niveau, req.user.utilisateur_id],

        (err, response) => {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          }
          res.json(formation);
        }
      );

    })  
});

app.post("/retard", jwtParser, (req, res) => {
	const retard = req.body;

	if (retard.motif.length < 5 || retard.motif.length > 255) {
		res.sendStatus(400);
	}

	connection.query(
		"INSERT INTO retard (retard_date, retard_heure_arrivee, retard_statut, retard_motif, retard_date_declaration, utilisateur_id) VALUES (?,?,?,?,?,?)",
		[
			retard.date,
			retard.heure_arrivee,
			retard.statut,
			retard.motif,
			new Date(),
			req.user.utilisateur_id,
		],

		(err, response) => {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}
			res.json(retard);
		}
	);
	}
	);
;

app.put("/formation/:id", jwtParser, (req, res) =>{
  const id = parseInt(req.params.id);
  const formation = req.body;
  
  formation.formation_id = id;

  if(formation.nom.length < 5 || formation.nom.length > 255 || formation.description.length < 30 || formation.description.length > 500 ) {
    res.sendStatus(400);
  }

  connection.query(
    "SELECT formation_id FROM formation WHERE formation_nom = ? AND formation_id != ?",
    [formation.nom, formation.id],
    (err, lignes) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      //Un produit porte déjà le nom saisi
      if(lignes.length >= 1) {
        return res.sendStatus(409);
      }

      connection.query(
        "UPDATE formation SET formation_nom = ?, formation_description = ?, formation_niveau = ? WHERE formation_id = ?",
        [formation.nom, formation.description, formation.niveau, formation.formation_id],
        (err, response) => {
          res.json(formation);
      });

    })  
});

app.put("/retard/:id", jwtParser, (req, res) => {
	const id = parseInt(req.params.id);
	const retard = req.body;

	if (!retard.motif || retard.motif.length < 5 || retard.motif.length > 255) {
		return res.sendStatus(400);
	}

	connection.query(
		"UPDATE retard SET retard_date = ?, retard_heure_arrivee = ?, retard_statut = ?, retard_motif = ?, retard_date_declaration = ? WHERE retard_id = ?;",
		[
			retard.date,
			retard.heure_arrivee,
			retard.statut,
			retard.motif,
			new Date(),
			id,
		],
		(err) => {
			if (err) {
				console.error("Erreur lors de la mise à jour du retard :", err);
				return res.sendStatus(500);
			}
			res.json({ message: "Retard modifié avec succès", retard });
		}
	);
});


app.delete("/formation/:id", jwtParser, (req, res) => {

  const id = parseInt(req.params.id);

  //on récupère la formation afin de vérifier si le possesseur est bien le responsable de formation connecté
  connection.query(
    "SELECT * FROM formation WHERE formation_id = ?",
    [id],
    (err, formations) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }

      //La formation n'existe pas
      if (formations.length == 0) {
        return res.sendStatus(404);
      }

      const idCreateur = formations[0].utilisateur_id;
      
      //gestion des droits (req.user.role_nom = colonne nom de la table role)
      //on effectue l'opération que si l'utilisateur est repsonsable de formation ET créateur de la formation
      if (
        req.user.role_nom == "responsable de formation" &&
        idCreateur == req.user.utilisateur_id
      ) {
        connection.query(
          "DELETE FROM formation WHERE formation_id = ?",
          [id],
          (err, response) => {
            if (err) {
              console.error(err);
              return res.sendStatus(500);
            }

            return res.sendStatus(204);
          }
        );
      } else {
        return res.sendStatus(401);
      }
    });

});

app.delete("/retard/:id", jwtParser, (req, res) => {
	const id = parseInt(req.params.id);

	//on récupère le retard afin de vérifier si le possesseur est bien le créateur du retard
	connection.query(
		"SELECT * FROM retard WHERE retard_id = ?",
		[id],
		(err, retards) => {
			if (err) {
				console.error(err);
				return res.sendStatus(500);
			}

			//Le retard n'existe pas
			if (retards.length == 0) {
				return res.sendStatus(404);
			}

			const idCreateur = retards[0].utilisateur_id;

			//gestion des droits (req.user.role_nom = colonne nom de la table role)
			//on effectue l'opération que si l'utilisateur est repsonsable de formation ET créateur de la formation
			if (
				req.user.role_nom == "responsable de formation" &&
				idCreateur == req.user.utilisateur_id
			) {
				connection.query(
					"DELETE FROM retard WHERE retard_id = ?",
					[id],
					(err, response) => {
						if (err) {
							console.error(err);
							return res.sendStatus(500);
						}

						return res.sendStatus(204);
					}
				);
			} else {
				return res.sendStatus(401);
			}
		}
	);
}); 

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
