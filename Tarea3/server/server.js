"use strict"
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");


const app = express();
dotenv.config();


app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 3000;
var host = process.env.PORT || '0.0.0.0';

var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;

const client = new cassandra.Client({
    contactPoints: ['cassandra-node-1', 'cassandra-node-2', 'cassandra-node-3'],
    localDataCenter: 'datacenter1',
    keyspace: 'bd1',
    authProvider: new PlainTextAuthProvider('cassandra', 'cassandra'),
})

const client_2 = new cassandra.Client({
    contactPoints: ['cassandra-node-1', 'cassandra-node-2', 'cassandra-node-3'],
    localDataCenter: 'datacenter1',
    keyspace: 'bd2',
    authProvider: new PlainTextAuthProvider('cassandra', 'cassandra'),
});

app.get("/", (req, res) => {

    res.send("Bienvenido a la api")
})

app.get('/getRecetas', async(req, res) => {
    const query = 'SELECT * FROM recetas';
    const result = await client_2.execute(query);
    res.json(result.rows);
});

app.post('/editRecetas',async (req,res)=>{
    const query = 'select * from recetas where id = ? ALLOW FILTERING';
    const { id, comentario, farmacos, doctor } = req.body;
    client_2.execute(query, [id], { prepare: true }).then(result => {
        if (result.rows[0] != undefined) {
            console.log(result.rows);
            const query2 = `update recetas 
                        set 
                            comentario = ?, 
                            farmacos = ?,
                            doctor = ? 
                      where 
                            id=?;`;
            client_2.execute(query2,[req.body.comentario,req.body.farmacos,req.body.doctor,req.body.id]).then(result2 => {
                console.log(result2)
                res.json("Receta modificada");
            }).catch(err => { console.log(err); });
        } else {
            res.json("No existe la receta o no se encuentra ");
        }
    }).catch(err => {
        console.log(err);
    })();
})

app.post('/deleteRecetas',async (req,res)=>{
    const query2 = 'select * from recetas where id = ? ALLOW FILTERING';
    client_2.execute(query2, [req.body.id], { prepare: true }).then(result => {
        if (result.rows[0] != undefined) {
            const query = `delete from recetas where id=?;`;
            console.log(result.rows);
            client_2.execute(query, [req.body.id]).then(result2 => {
                console.log(result2)
                res.json("La receta " + req.body.id + " se elimino con exito");
            }).catch(err => { console.log(err); });
        } else {
            res.json("No existe la receta o no se encuentra ");
        }
    }).catch(err => {
        console.log(err);
    }
    )();
})

app.post('/createClient', (req, res) => {(async () => {

      const query = 'SELECT * FROM pacientes WHERE rut=? ALLOW FILTERING';
      const query2 = `INSERT INTO 
                                 pacientes (id, 
                                            nombre,
                                            apellido,
                                            rut,
                                            email,
                                            fecha_nacimiento) 
                                            VALUES(?,?,?,?,?,?);`;
      const query3 = `INSERT INTO 
                                 recetas (id, 
                                          id_paciente,
                                          comentario,
                                          farmacos,
                                          doctor) 
                                          VALUES(?,?,?,?,?);`;
      const receta = req.body;
      var gen_id_1 = uuidv4();
      var gen_id_2 = uuidv4();
      console.log("Receta: ",receta)
      console.log("ID para Paciente: ",gen_id_1)
      console.log("ID para Receta: ",gen_id_2)
  
      await client.execute(query,[receta.rut]).then(result => {
        console.log('Result ' + result.rows[0]);
  
        if(result.rows[0] != undefined){
          console.log("existe paciente")
          client_2.execute(query3,[gen_id_2,result.rows[0].id,receta.comentario,receta.farmacos,receta.doctor]).then(result2 => {
            console.log('Result' + result2);
            res.json({'ID_Receta': gen_id_2})
          }).catch((err) => {console.log('ERROR:', err);});
  
        }else{
          console.log("No existe paciente")
          client.execute(query2,[gen_id_1,receta.nombre,receta.apellido,receta.rut,receta.email,receta.fecha_nacimiento]).then(result => {
            console.log('Result ' + result);
            client_2.execute(query3,[gen_id_2,gen_id_1,receta.comentario,receta.farmacos,receta.doctor]).then(result2 => {
              console.log('Result ' + result2);
              res.json({'ID_Receta': gen_id_2})
            }).catch((err) => {console.log('ERROR:', err);});
          }).catch((err) => {console.log('ERROR:', err);});
        }
      }).catch((err) => {console.log('ERROR:', err);});
    })();
    
  });


app.listen(port, host, () => {
    console.log(`API run on port 3000`);
})
