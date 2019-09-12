
//Requires
var express = require('express');
var app = express();
var mdAutenticacion=require('../middlewares/autenticacion');



var Medico = require('../models/medico');


//=======================================================
//Obtener todos los medicos.
//========================================================
app.get('/', (req, res, next) => {

    var desde=req.query.desde || 0;
    desde=Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando los medicos.",
                        errors: err
                    });
                }

                Medico.count({}, (err , conteo)=>{
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
               
            });
});


//=======================================================
//Actualizar Medico.
//========================================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id   = req.params.id;
    var body = req.body;
    console.log( req.body )

    Medico.findById(id,(err,medico)=>{
       
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico.',
                errors: err
            });
        }

        if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id. '+ id +'no existe',
                    errors: {message:'No existe el meedico  con ese ID'}
            });   
        }
        
        medico.nombre=body.nombre;
        medico.usuario=req.usuario._id;
        medico.hospital =body.hospital;
 
        medico.save((err,medicoGuardado)=>{

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizar el medico.',
                    errors: err
                });
            }
            
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});


//=======================================================
//Crear un nuevo Medico.
//========================================================
app.post('/',mdAutenticacion.verificaToken,(req, res) => {
    var body = req.body;

   

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    console.log(medico)

   

    medico.save((err,medicoGuardado) => {
        console.log("RESULTADO DE LA OPERACION MONGO ==>", medicoGuardado);

        if (err || !medicoGuardado) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el medico.",
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});



//=======================================================
//Eliminar Medico por el Id.
//========================================================
app.delete('/:id' ,mdAutenticacion.verificaToken, (req , res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id,(err,medicoEliminado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminar medico',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con ese id',
                errors: {message:'No existe el medico con ese id'}
            });
        }
        
        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});

module.exports = app;