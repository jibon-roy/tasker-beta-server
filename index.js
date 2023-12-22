const express = require('express')
const cors = require('cors')

const app = express();
const port = process.env.PORT | 5000


app.use(
    cors({
        origin: ['https://tasker-beta.web.app/', 'http://localhost:5173', 'http://localhost:5174',],
    }),
)
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://taskerbeta:FuGTXEjkalqDoUjI@cluster0.ziw2dg7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const TaskerDB = client.db('TaskerBeta')
        const usersCollection = TaskerDB.collection('users')
        const tasksCollection = TaskerDB.collection('tasks')

        app.post('/createUser', async (req, res) => {
            // console.log(req.body)
            const userData = req.body
            const query = { email: userData.email }
            const findExistUser = await usersCollection.findOne(query)
            const existEmail = findExistUser?.email
            if (userData.email === existEmail) {
                return
            } else {
                const result = await usersCollection.insertOne(userData);
                res.status(200).send(result);
            }

        })

        app.post('/postTask', async (req, res) => {
            const task = req.body
            const result = await tasksCollection.insertOne(task)
            res.status(200).send(result);
        })

        app.get('/tasks/:user', async (req, res) => {
            const user = req.params.user
            const query = { user: user }
            const result = await tasksCollection.find(query).toArray()
            res.status(200).send(result);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running.')
})

app.listen(port, () => {
    console.log(`Server running port: ${port}`)
})