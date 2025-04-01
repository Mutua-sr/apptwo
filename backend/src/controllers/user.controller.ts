import { Request, Response } from 'express';
import DatabaseService from '../services/database';
import { UserProfile } from '../types/profile';

export const getBatchUsers = async (req: Request, res: Response) => {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          message: 'userIds must be an array'
        });
      }

      // Find users using Mango query
      const users = await DatabaseService.find<UserProfile>({
        selector: {
          type: 'profile',
          userId: { $in: userIds }
        }
      });

      // Map to the expected response format
      const formattedUsers = users.map(user => ({
        id: user.userId,
        username: user.username,
        avatar: user.avatar,
        name: user.name,
        email: user.email
      }));

      return res.json({
        success: true,
        data: formattedUsers
      });
    } catch (error) {
      console.error('Error in getBatchUsers:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
};
