import { Request, Response } from 'express';
import { CommunityService } from '../services/community.service';
import { DatabaseService } from '../services/database';
import logger from '../config/logger';
import { 
  UserData,
  ActivityData,
  ReportDateRange,
  UserReportData,
  CommunityReportData,
  ActivityReportData
} from '../types/report';

interface ReportQuery {
  type: 'users' | 'communities' | 'activities';
  format: 'json' | 'pdf' | 'csv';
  startDate?: string;
  endDate?: string;
}

interface DBUserData extends UserData {
  type: 'user';
  _id: string;
  createdAt: string;
}

interface DBActivityData extends ActivityData {
  type: 'activity';
  _id: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

class ReportController {
  async generateReport(req: Request<{}, {}, {}, ReportQuery>, res: Response): Promise<Response> {
    try {
      const { type, startDate, endDate } = req.query;
      const dateRange: ReportDateRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };

      let data;
      switch (type) {
        case 'users':
          data = await this.generateUsersReport(dateRange);
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

      return res.json({
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
      return res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  private async generateUsersReport(dateRange: ReportDateRange): Promise<UserReportData> {
    const query = {
      selector: {
        type: 'user' as const,
        createdAt: {
          $gte: dateRange.start.toISOString(),
          $lte: dateRange.end.toISOString()
        }
      },
      sort: [{ createdAt: 'desc' as const }]
    };

    const users = await DatabaseService.find<DBUserData>(query);
    
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

  private async generateCommunitiesReport(dateRange: ReportDateRange): Promise<CommunityReportData> {
    // Get all communities by using a large limit
    const communities = await CommunityService.list(1, 1000);
    
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

    const activities = await DatabaseService.find<DBActivityData>(query);

    // Group activities by type
    const activityTypes = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate unique users
    const uniqueUsers = new Set(activities.map(a => a.userId)).size;

    return {
      summary: {
        totalActivities: activities.length,
        activityTypes,
        uniqueUsers
      },
      details: activities.map(activity => ({
        id: activity._id,
        timestamp: activity.timestamp,
        userId: activity.userId,
        action: activity.action,
        details: this.formatActivityDetails(activity)
      }))
    };
  }

  private formatActivityDetails(activity: DBActivityData): string {
    let details = `${activity.action}`;
    if (activity.targetType && activity.targetId) {
      details += ` on ${activity.targetType} (${activity.targetId})`;
    }
    if (activity.metadata) {
      details += ` - ${JSON.stringify(activity.metadata)}`;
    }
    return details;
  }
}

export default new ReportController();