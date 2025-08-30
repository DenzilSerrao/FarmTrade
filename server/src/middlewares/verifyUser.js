import jwt from 'jsonwebtoken'
import User from '../routes/v1/user/models/User';

const verifyUser = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET || 'your_jwt_secret',
            async (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({ error: 'Token is expired or some error' });
                }
                req.email = decoded.email; // Attach the decoded user info to the request object

                const foundUser = await User.findOne({
                    email: req.email
                });
                if (!foundUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                req.userId = foundUser._id; // Attach the user ID to the request object
                next();
            }

        )
    } catch (error) {
        console.error('Error in verifyUser middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default verifyUser;