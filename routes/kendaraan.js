const express = require('express')
const router = express.Router()

const connection = require('../config/db')
const {body, validationResult} = require('express-validator')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,'public/images')
    }, filename: (req,file,cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const fileFilter =  (req, file, cb) => {
    if(file.mimetype === 'image/png'){
        cb(null, true)
    } else {
        cb(new Error('jenis file tidak diizinkan'), false)
    }
}

const upload = multer({storage: storage, fileFilter: fileFilter})

router.get('/', function(req,res){
    connection.query(' SELECT no_pol, kendaraan.nama_kendaraan, transmisi.nama_transmisi, kendaraan.gambar_kendaraan '+' FROM kendaraan JOIN transmisi '+' ON kendaraan.id_transmisi=transmisi.id_transmisi order by kendaraan.no_pol desc', function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server failed',
                error: err
            })
        } else {
            return res.status(200).json({
                status: true,
                message:'Data mahasiswa',
                data: rows
            })
        }
    })
})

router.post('/store', upload.single("gambar_kendaraan"), [
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
], (req, res) => {
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        })
    }
    let Data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi:req.body.id_transmisi,
        gambar_kendaraan: req.file.filename
    }
    connection.query('insert into kendaraan set ? ', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server failed'
            })
        } else {
            return res.status(201).json({
                status: true,
                message:'Success',
                data: rows[0]
            })
        }
    })
})

router.get('/(:id)', function(req,res) {
    let id= req.params.id
    connection.query(`SELECT no_pol, kendaraan.nama_kendaraan, transmisi.nama_transmisi, kendaraan.gambar_kendaraan FROM kendaraan JOIN transmisi ON kendaraan.id_transmisi=transmisi.id_transmisi where no_pol='${id}'`, function(err,rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server error',
                error:err
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        } else {
            return res.status(200).json({
                status: true,
                message:'data mahasiswa',
                data: rows[0]
            })
        }
    })
})

router.patch('/update/:id',upload.single("gambar_kendaraan"),[
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
], (req,res) => {
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        })
    }
    let id = req.params.id

    let gambar = req.file ? req.file.filename : null;
    
    
    connection.query(`select * from kendaraan where no_pol ='${id}'`, function(err,rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server error',
                error: err
            })
        }
        if(rows.length === 0){
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        }
        const namaFileLama = rows[0].gambar
        
        if(namaFileLama && gambar){
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama)
            fs.unlinkSync(pathFileLama)
        }
        
        let data = {
            no_pol: req.body.no_pol,
            nama_kendaraan: req.body.nama_kendaraan,
            id_transmisi:req.body.id_transmisi,
            gambar_kendaraan: req.file.filename
        }

        connection.query(`update kendaraan set ? where no_pol='${id}'`, data, function(err,rows){
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'server error',
                    error: err
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'update'
                })
            }
        })
    })
})

router.delete('/delete/(:id)', function(req, res){
    let id = req.params.id
    connection.query(`select * from kendaraan where no_pol='${id}'`, function(err,rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'server error'
            })
        }
        if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        }
        const namaFileLama = rows[0].gambar
        
        if(namaFileLama){
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama)
            fs.unlinkSync(pathFileLama)
        }
        
        connection.query(`delete from kendaraan where no_pol ='${id}'`, function(err, rows){
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'server error'
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Data di hapus'
                })
            }
        })
    })
})

module.exports = router