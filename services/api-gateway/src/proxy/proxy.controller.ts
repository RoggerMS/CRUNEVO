import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  Param,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Auth routes (public)
  @Public()
  @All('auth/*')
  async forwardAuthRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const path = req.url.replace('/api/auth', '');
    return this.forwardToService('identity', `/api/v1/auth${path}`, req, res, body, query, headers);
  }

  // Users routes (protected)
  @All('users/*')
  async forwardUsersRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const path = req.url.replace('/api/users', '');
    return this.forwardToService('identity', `/api/v1/users${path}`, req, res, body, query, headers);
  }

  // Posts routes (protected)
  @All('posts/*')
  async forwardPostsRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const path = req.url.replace('/api/posts', '');
    return this.forwardToService('posts', `/api/v1/posts${path}`, req, res, body, query, headers);
  }

  // Messages routes (protected)
  @All('messages/*')
  async forwardMessagesRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const path = req.url.replace('/api/messages', '');
    return this.forwardToService('messages', `/api/messages${path}`, req, res, body, query, headers);
  }

  // Search routes (protected)
  @All('search/*')
  async forwardSearchRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    const path = req.url.replace('/api/search', '');
    return this.forwardToService('search', `/search${path}`, req, res, body, query, headers);
  }

  // Service health checks (public)
  @Public()
  @All('services/:service/health')
  async checkServiceHealth(
    @Param('service') service: string,
    @Res() res: Response,
  ) {
    try {
      const response = await this.proxyService.getServiceHealth(service);
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || 'Service health check failed',
        service,
      });
    }
  }

  private async forwardToService(
    service: string,
    path: string,
    req: Request,
    res: Response,
    body: any,
    query: any,
    headers: any,
  ) {
    try {
      const response = await this.proxyService.forwardRequest(
        service,
        path,
        req.method,
        body,
        headers,
        query,
      );
      
      return res.status(response.status).json(response.data);
    } catch (error) {
      return res.status(error.status || 500).json({
        error: error.message || 'Service request failed',
        service,
        path,
      });
    }
  }
}