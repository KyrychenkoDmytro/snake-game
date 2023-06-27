import ApiError from "../error/ApiError.js";
import Player from "../models/models.js";

class PlayerController {
    async authorization(req, res, next) {
        const { name, bestScore } = req.body;
        if (!name) {
            next(ApiError.badRequest({ message: 'Please enter your name' }))
        }

        try {
            const findPlayer = await Player.findOne({
                where: { name }
            });

            if (findPlayer) {
                const oldScore = findPlayer.bestScore;
                if (oldScore && oldScore > bestScore) {
                    return res.json(findPlayer);
                } else {
                    const updatedPlayer = await findPlayer.update({ bestScore });
                    return res.json(updatedPlayer);
                }
            } else {
                const newPlayer = await Player.create({ name, bestScore });
                return res.json(newPlayer);
            }
        } catch (error) {
            return next(error);
        }
    }

    async getTopPlayers(req, res) {
        try {
            let allPlayers = await Player.findAll({
                order: [['bestScore', 'DESC']],
                limit: 5
            });
            if (allPlayers.length) {
                return res.json({ status: "success", allPlayers })
            }
            return next(ApiError.badRequest({ message: 'Players not found' }))
        } catch (error) {
            return next(error);
        }

    }
}

const playerController = new PlayerController();
export default playerController;