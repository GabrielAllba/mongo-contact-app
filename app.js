const express = require('express')
const app = express()
const port = 3000;

/* 
    1. install express 4.17.1
    2. install ejs 3.1.6
    3. install mongoose (object modelling for node.js)
    4. make db.js (connect to database)
    5. install method override for using app.delete
*/

require('./utils/db.js') //hanya menjalankan koneksi
const {Contact, mahasiswa }= require('./model/contact')

//  const contactsMethod = require('./utils/contact')

const {body, validationResult, check} = require('express-validator')
const methodOverride = require('method-override')

//setup method override
app.use(methodOverride('_method'))

// VIEW ENGINE CONFIGURATION
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))

//konfigurasi flash
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

app.use(cookieParser('secret'))
app.use(session({
  cookie: {maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(flash())

// HALAMAN HOME
app.get('', async (req,res) => {
    const mahasiswas = await mahasiswa.find()
    res.render('index', {
        title: 'Home',
        nama: 'Gabriel',
        mahasiswas: mahasiswas
    })
})

//HALAMAN ABOUT
app.get('/about', (req,res) => {
    res.render('about', {
        title: 'About'
    })
})

//POST CONTACT
app.post('/contact',[
    check('email', 'use valid email!').isEmail(),
    check('nohp','use valid Indonesia phone number').isMobilePhone('id-ID'),
    body('nama').custom(async (value) => {
        // const duplicate = contactsMethod.checkDuplicate(value)
        const duplicate = await Contact.findOne({nama: value})
        if(duplicate){
            throw new Error('name was used by someone else, use another name!')
        }
        return true
    })
], (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('add-contact', {
            title: 'Add New Contact',
            errors: errors.array()
        })
    }
    else{
        Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data contact berhasil ditambahkan')
            res.redirect('/contact')
        })
    }
})

//HALAMAN CONTACT
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find()
    res.render('contact', {
        title: 'Contact',
        contacts: contacts,
        msg: req.flash('msg')
    })
})
app.put('/contact',
[
    check('email', 'use valid email!').isEmail(),
    check('nohp', 'use valid Indonesia mobile phone').isMobilePhone('id-ID'),
    body('nama').custom( async (value, {req}) => {
        const duplicate = await Contact.findOne({nama: value})
        if(value != req.body.namaLama && duplicate){
            throw new Error('name was used by someone else, please use another name!')
        }
        return true
    })
],(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.render('edit-contact', {
            title: 'Edit Contact Page ',
            errors: errors.array(),
            contacts: req.body
        })
    }
    else{
        Contact.updateOne(
            {_id: req.body._id},
            {
                $set: {
                    nama: req.body.nama,
                    nohp: req.body.nohp,
                    email: req.body.email,
                }
            }
            ).then((result) => {
                req.flash('msg', 'contact updated')
                res.redirect('/contact')
            })
    }
})
app.get('/contact/edit/:nama', (req, res) => {
    const contacts = Contact.findOne({nama: req.params.nama})
    contacts.then((contact) => {
        res.render('edit-contact', {
            title: 'Edit Contact',
            contacts: contact
        })
    }
    )

    //or just use async await for simplyfing promise
    // app.get('/contact/edit/:nama', async (req,res) => {
        // const contacts = await Contact.findOne({nama: req.params.nama})
    // res.render('edit-contact', {
    //     title: 'Edit Contact',
    //     contacts: contact
    // }) FINDONE return a promise, and synchronouse syntax will executed first, so the contacts are not showing
    // so that we use async await for wait for promise to be resolved first after that do the next syntax
    //})
    
    
})
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama})
//     if(!contact){
//         res.status(404)
//     }
//     else{
//         Contact.deleteOne({ nama: req.params.nama }).then((result) => {
//             req.flash('msg', `data ${req.params.nama} berhasil dihapus`)
//             res.redirect('/contact')
//         })
//     }
// })

app.delete('/contact', (req,res) => { 
    Contact.deleteOne({nama: req.body.nama}).then((result) => {
        req.flash('msg', 'Contact deleted!')
        res.redirect('/contact')
    })
})
app.get('/contact/add-contact', (req,res) => {
    res.render('add-contact', {
      title: 'Add Contact Page',
    })
  })
app.get('/contact/:nama', async (req,res) => {
    // const contact = contactsMethod.findContact(req.params.nama)
    const contact = await Contact.findOne({nama: req.params.nama})
    if(!contact){
        res.status(404)
    }
    else{
        res.render('detailContact', {
            title: 'Halaman detail',
            contact: contact
          })
    }
  })
app.use('/', (req,res) => {
    res.status(404)
    res.send('404')
})
app.listen(port, () => {
    console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
})