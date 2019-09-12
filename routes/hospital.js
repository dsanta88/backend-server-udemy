
//Requires
var express = require('express');
var app = express();
var mdAutenticacion=require('../middlewares/autenticacion');



var Hospital = require('../models/hospital');


//=======================================================
//Obtener todos los hospitales.
//========================================================
app.get('/', (req, res, next) => {

    var desde=req.query.desde || 0;
    desde=Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario','nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando hospitales.",
                        errors: err
                    });
                }

                Hospital.count({}, (err , conteo)=>{
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });           
            });
});


//=======================================================
//Actualizar Hospital.
//========================================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id   = req.params.id;
    var body = req.body;
    console.log( req.body )

    Hospital.findById(id,(err,hospital)=>{
       
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital.',
                errors: err
            });
        }

        if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id. '+ id +'no existe',
                    errors: {message:'No existe en hospital  con ese ID'}
            });   
        }
        
        hospital.nombre=body.nombre;
        hospital.usuario=req.usuario._id;
 
        hospital.save((err,hospitalGuardado)=>{

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizar el hospital.',
                    errors: err
                });
            }
            
            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


//=======================================================
//Crear un nuevo Hospital.
//========================================================
app.post('/',mdAutenticacion.verificaToken,(req, res) => {
    var body = req.body;

    console.log(body)

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
        medico: req.medico._id,
    });

    console.log({hospital})
   

    hospital.save((err, hospitalGuardado) => {
        console.log("RESULTADO DE LA OPERACION MONGO ==>", hospitalGuardado);

        if (err || !hospitalGuardado) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el hospital.",
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});



//=======================================================
//Eliminar Hospital por el Id.
//========================================================
app.delete('/:id' ,mdAutenticacion.verificaToken, (req , res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id,(err,hospitalEliminado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminar hospital',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con ese id',
                errors: {message:'No existe el hospital con ese id'}
            });
        }
        
        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});

module.exports = app;