import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import sequelize from './db.js';
import router from './routes/index.js';
import errorHandler from './middleware/ErrorHandlingMiddleware.js';

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, (err) => {
            if (err) {
                return console.log(err);
            }

            console.log(`Server ok, ${PORT} port`);
        });
    } catch (error) {
        console.log('Server or db error')
    }
}

start();

