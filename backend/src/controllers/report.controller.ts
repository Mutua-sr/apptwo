import { Request, Response } from 'express';
import { ClassroomService } from '../services/classroom.service';
import { CommunityService } from '../services/community.service';
import { DatabaseService } from '../services/database';
import logger from '../config/logger';
import { 
  User, 
  Activity, 
  ReportDateRange,
  UserReportData,
  ClassroomReportData,
  CommunityReportData,
  ActivityReportData
} from '../types/report';

class ReportController {
  async generateReport(req: Request, res: Response) {
    try {
      const { type, format, startDate, endDate } = req.query;
      const dateRange: ReportDateRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      let data;
      switch (type) {
        case 'users':
          data = await this.generateUsersReport(dateRange);
          break;
        case 'classrooms':
          data = await this.generateClassroomsReport(dateRange);
          break;
        case 'communities':
          data = await this.generateCommunitiesReport(dateRange);
          break;
        case 'activities':
          data = await this.generateActivitiesReport(dateRange);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      res.json({
        success: true,
        data,
        metadata: {
          type,
          dateRange,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Report generation error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  private async generateUsersReport(dateRange: ReportDateRange): Promise<UserReportData> {
    const query = {
      selector: {
        type: 'user',
        createdAt: {
          $gte: dateRange.start.toISOString(),
          $lte: dateRange.end.toISOString()
        }
      },
      sort: [{ createdAt: 'desc' as const }]
    };

    const users = await DatabaseService.find<User>(query);
    
    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => 
      new Date(user.lastActive) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalUsers,
        activeUsers,
        roleDistribution
      },
      details: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }))
    };
  }

  private async generateClassroomsReport(dateRange: ReportDateRange): Promise<ClassroomReportData> {
    const classrooms = await ClassroomService.list();
    
    // Filter by date range
    const filteredClassrooms = classrooms.filter(classroom => 
      new Date(classroom.createdAt) >= dateRange.start &&
      new Date(classroom.createdAt) <= dateRange.end
    );

    // Calculate statistics
    const totalClassrooms = filteredClassrooms.length;
    const totalStudents = filteredClassrooms.reduce((sum, classroom) => 
      sum + classroom.students.length, 0
    );
    const averageStudentsPerClass = totalClassrooms > 0 
      ? totalStudents / totalClassrooms 
      : 0;

    return {
      summary: {
        totalClassrooms,
        totalStudents,
        averageStudentsPerClass
      },
      details: filteredClassrooms.map(classroom => ({
        id: classroom._id,
        name: classroom.name,
        teacher: classroom.teacher,
        studentsCount: classroom.students.length,
        createdAt: classroom.createdAt,
        settings: classroom.settings
      }))
    };
  }

  private async generateCommunitiesReport(dateRange: ReportDateRange): Promise<CommunityReportData> {
    const communities = await CommunityService.list();
    
    // Filter by date range
    const filteredCommunities = communities.filter(community => 
      new Date(community.createdAt) >= dateRange.start &&
      new Date(community.createdAt) <= dateRange.end
    );

    // Calculate statistics
    const totalCommunities = filteredCommunities.length;
    const totalMembers = filteredCommunities.reduce((sum, community) => 
      sum + community.members.length, 0
    );
    const averageMembersPerCommunity = totalCommunities > 0 
      ? totalMembers / totalCommunities 
      : 0;

    return {
      summary: {
        totalCommunities,
        totalMembers,
        averageMembersPerCommunity
      },
      details: filteredCommunities.map(community => ({
        id: community._id,
        name: community.name,
        creator: community.creator,
        membersCount: community.members.length,
        createdAt: community.createdAt,
        settings: community.settings
      }))
    };
  }

  private async generateActivitiesReport(dateRange: ReportDateRange): Promise<ActivityReportData> {
    const query = {
      selector: {
        type: 'activity',
        timestamp: {
          $gte: dateRange.start.toISOString(),
          $lte: dateRange.end.toISOString()
        }
      },
      sort: [{ timestamp: 'desc' as const }]
    };

    const activities = await DatabaseService.find<Activity>(query);

    // Calculate statistics
    const activityTypes = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userActivities = activities.reduce((acc, activity) => {
      acc[activity.userId] = (acc[activity.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalActivities: activities.length,
        activityTypes,
        uniqueUsers: Object.keys(userActivities).length
      },
      details: activities.map(activity => ({
        id: activity._id,
        timestamp: activity.timestamp,
        userId: activity.userId,
        action: activity.action,
        details: activity.details
      }))
    };
  }
}

export default new ReportController();