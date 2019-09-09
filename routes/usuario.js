
//Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var mdAutenticacion=require('../middlewares/autenticacion');


//=======================================================
//Obtener todos los Usuario.
//========================================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando usuarios.",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
});


//=======================================================
//Actualizar Usuario.
//========================================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id   = req.params.id;
    var body = req.body;
    console.log( req.body )

    Usuario.findById(id,(err,usuario)=>{
       
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id. "+ id +" no existe',
                    errors: {message:'No existe u usuario con ese ID'}
            });   
        }
        
        usuario.nombre=body.nombre;
        usuario.email=body.email;
        usuario.password=body.password;
        usuario.role=body.role;
        
        usuario.save((err,usuarioGuardado)=>{

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizar usuario',
                    errors: err
                });
            }
            
            usuarioGuardado.password=":)";
            res.status(201).json({
                ok: true,
                usuarios: usuarioGuardado
            });
        });
    });
});


//=======================================================
//Crear un nuevo Usuario.
//========================================================
app.post('/',mdAutenticacion.verificaToken,(req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        img: body.img,
        role: body.role
    });
    console.log({ usuario })

    usuario.save((err, usuarioGuardado) => {
        console.log("RESULTADO DE LA OPERACION MONGO ==>", usuarioGuardado);

        if (err || !usuarioGuardado) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario.",
                errors: err
            });
        }


        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });

    });
});



//=======================================================
//Eliminar Usuario.
//========================================================
app.delete('/:id' ,mdAutenticacion.verificaToken, (req , res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id,(err,usuarioEliminado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminar usuario',
                errors: err
            });
        }

        if (!usuarioEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con ese id',
                errors: {message:'No existe el usuario con ese id'}
            });
        }
        
        res.status(200).json({
            ok: true,
            usuarios: usuarioEliminado
        });
    });
});

module.exports = app;