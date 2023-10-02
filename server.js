import express, { query } from 'express';
import cors from "cors";
import mongoose, { version } from 'mongoose';


// connect to MongoDB
mongoose.connect('mongodb+srv://vijay123:vijay123@cluster0.kwbetfr.mongodb.net/book?retryWrites=true&w=majority', {useUnifiedTopology: true, useNewUrlParser: true})

const paperSchema = new mongoose.Schema({ imp: Object }, {versionKey: false})


let datasender = []


const PORT = 8000;
const app = express();

app.use(
    cors({
        origin: "*"
    })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let globalmodels = []

app.get('/userdata', (req, res) => {
    (async () => {

        const originalcollec = await mongoose.connection.db.listCollections().toArray()
        const collecnames = originalcollec.map((collecitem) => {
            return (
                { ['collectionitem']: collecitem.name }
            )
        })

        // console.log(collecnames)
        async function preparedata() {

            let cookdata = {}
            for (let i = 0; i < collecnames.length; i++){
                // console.log(cookdata.collecnames[i].collectionitem, "hex")

                const dbmodel = mongoose.model(collecnames[i].collectionitem, paperSchema)
                globalmodels.push(dbmodel)
                const eachcollecdata = await dbmodel.find({})
                // console.log("each collec data", eachcollecdata, "each collec data")
                
                cookdata[collecnames[i].collectionitem] = [ ...eachcollecdata ]
               
            }

            // console.log(cookdata, "cook")
            return cookdata
        }
        
        res.send(await preparedata())
        // console.log(await preparedata()) 
    })()      
})



app.post('/update', (req, res) => {
    // let bodydata = req.body
    if (req.body.category == "folder") {
        const updateCollection = async () => {
            const modelx = mongoose.model(req.body.collectionname, paperSchema)
            await modelx.collection.rename(req.body.renamevalue);
            res.send({[req.body.collectionname]: req.body.renamevalue})
        }
        updateCollection();
    } else {
        let collec = mongoose.modelNames()
        for (let i = 0; i < collec.length; i++){
            if (collec[i] == req.body.collectionname) {

                let updaterx = async () => {
                    var query_construct = "";
                    for (let i = 0; i < req.body.location.length; i++) {
                        if (i == 0) {
                            query_construct = query_construct + "imp"
                        }
                        else {
                            query_construct = query_construct + "." + req.body.location[i]
                        }
                    }
                    
                    let modelx = mongoose.model(collec[i], paperSchema)
                    await modelx.updateOne({ _id: [req.body.idholder] }, { $set: { [query_construct]: req.body.modified } })    
                    res.send("subfolder updated")
    
                    // res.send({[query_construct]:req.body.modified, "ids": req.body.idholder})
                    
                }   
                updaterx();
            }
            else {
    
            }       
        }       
    }  
})


app.post('/delete', (req, res) => {
    let collec = mongoose.modelNames()

    if (req.body.category == "folder") {
        const deleteCollection = async () => {
            const modelz = mongoose.model(req.body.collectionname, paperSchema);
            let db = mongoose.connection.db
            db.dropCollection(req.body.collectionname, (err, result) => {
                if (err) {
                    console.log("error", err)
                }
                else {
                    
                    console.log("modeldeleted x")
                    console.log(result, req.body.collectionname)
                    
                    mongoose.deleteModel(modelz.modelName) 
                    mongoose.connection.on('deleteModel', (name) => {
                        console.log(`Model  has been deleted. x`);
                    })
                }
            })

            
            res.send("folder deleted")
            
        }
        deleteCollection();
        
    } else if(req.body.category == "subfolder"){
        
        for (let i = 0; i < collec.length; i++){
            console.log("delete", collec[i])
            if (collec[i] == req.body.collectionname) {
                // console.log("")
                           
                if (req.body.location.length == 1) { 
                    const deletedocument = async () => {
                        const modelx = mongoose.model(req.body.collectionname, paperSchema)
                        await modelx.deleteOne({_id: [req.body.idholder]})
                        res.send({ "id is": req.body.idholder })
                    }
                    deletedocument();
                } else {
                    let deletex = async () => {
                    
                        var query_construct = "";
                        for (let i = 0; i < req.body.location.length; i++){
                            if (i == 0) {
                                query_construct = query_construct + "imp"
                            }
                            else {
                                query_construct = query_construct + "." + req.body.location[i]
                            }                   
                        }
                        
                        let modelx = mongoose.model(collec[i], paperSchema)
                        await modelx.updateOne({ _id: [req.body.idholder] }, { $set: { [query_construct]: req.body.modified } })               
    
                        res.send("delte sub")
                        
                    } 
                    deletex();
                    
                }
                
        
            }
            else {
                // xxxx

            }
            
        }
    }
   
})

app.post('/adddata', (req, res) => {
    console.log("add data called")
    if (req.body.category == "folder") {
        const collectionCreate = async () => {
            const modelx = mongoose.model(req.body.collectionname, paperSchema)
            globalmodels.push(modelx)
            // await modelx.create({})
        }
        collectionCreate();
    }
    else {
        let collec = mongoose.modelNames()

        for (let i = 0; i < mongoose.modelNames().length; i++){
            // console.log("before", globalmodels[i].modelName, collec)
            if (collec[i] == req.body.collectionname) {
  
                if (req.body.location.length == 1) {
                    console.log("location 1")
                    let adddocument = async () => {
                        const modelx = mongoose.model(req.body.collectionname, paperSchema)
                        await modelx.create({ "imp": req.body.modified })
                
                        res.send("vijay")
                    }
    
                    adddocument();
                } else {
                    let updaterx = async () => {
    
                        var query_construct = "";
                        for (let i = 0; i < req.body.location.length; i++){
                            if (i == 0) {
                                query_construct = query_construct + "imp"
                            }
                            else {
                                query_construct = query_construct + "." + req.body.location[i]
                            }                   
                        }
                        
                        let modelx = mongoose.model(collec[i], paperSchema)
                        await modelx.updateOne({ _id: [req.body.idholder] }, { $set: { [query_construct]: req.body.modified } })               
        
                        // res.send(req.body.modified)
                        
                    }
                    updaterx();
                    res.send("vijayupdate")
                }               
            }
        }
        
    }
    // let collec = mongoose.modelNames()


    
})

app.post('/addDocument', (req, res) => {
    const modelx = mongoose.model(req.body.collectionname, paperSchema);
    (async () => {
        await modelx.create({ "imp": { [req.body.renamevalue]: "" } })
        // res.send({[req.body.collectionname]: req.body.renamevalue})
    })()
})

app.get('/fetchData', (req, res) => {
    let demoSchema = new mongoose.Schema({ versionKey: false })
    let collections = mongoose.modelNames()
    let cook = {}

    let modelx = mongoose.model(collections[0], paperSchema)    
    let z = async () => {
        
        res.send(await modelx.collection.find({}).toArray())
    }
    z()
    
})

app.listen(PORT)