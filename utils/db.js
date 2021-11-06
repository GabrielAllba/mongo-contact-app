// call mongoose 
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true // make automatic index for every document
});

// const mahasiswa = mongoose.model('mahasiswa', {
//     nama: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//     }
// })

//menambah 1 data
//instansiasi
//  const contact1 = new mahasiswa({
//      nama: 'jamblang',
//      nohp: '897898979',
//      email: 'doddy@gmail.com'
//  })
//  // simpan ke collection
//  //sampe save udah jalan sebenernya
// contact1.save()