import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
console.log(DataTypes);

const Player = sequelize.define('player', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
    bestScore: { type: DataTypes.INTEGER }
})

export default Player;