import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// jwt secret key
const JWT_Secret = process.env.JWT_KEY;

if(!JWT_Secret){
    throw new Error('JWT key not found in .env file!');
}

// Authorize Caller
export const authorize_caller = (req: Request, res: any, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_Secret) as { userId: string, role: string }; 

        if (decoded.role !== 'caller') {
            return res.status(401).json({ message: 'Invalid user token' });
        }

        (req as any).user = decoded.userId;
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Authorize Partnership
export const authorize_partnership = (req: Request, res: any, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_Secret) as { userId: string, role: string }; 

        if (decoded.role !== 'partnership') {
            return res.status(401).json({ message: 'Invalid user token' });
        }

        (req as any).user = decoded.userId;
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Authorize Super Admin
export const authorize_super_admin = (req: Request, res: any, next: NextFunction) => {
    const token = req.headers.authorization;

    console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_Secret) as { userId: string, role: string };

        if (decoded.role !== 'super-admin') {
            return res.status(401).json({ message: 'Invalid admin token' });
        }

        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};