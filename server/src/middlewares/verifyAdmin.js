import jwt from 'jsonwebtoken';
import Admin from '../routes/v1/admin/models/Admin';

const verifyAdmin = (req: any, res: any, next: any) => {
    try {
        const token = req.cookies?.authToken;
 
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET || 'your_jwt_secret',
            async (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({ error: 'Forbidden' });
                }

                // Check if the admin is valid
                if (!decoded || !decoded.email) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
                
                // Check if the admin exists in the database
                const existingAdmin = await Admin.findOne({
                    email: decoded.email
                });
                if (!existingAdmin) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
                
                // Attach user information to the request object
                req.email = decoded.email;
                next();
            }
        );
    } catch (error) {
        console.error('Error in verifyAdmin middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default verifyAdmin;