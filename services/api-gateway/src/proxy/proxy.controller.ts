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
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Auth routes (public)
  @Public()
  @All('auth/*path')
  async forwardAuthRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('path') path: string,
  ) {
    console.log('🔥 Auth request - Original URL:', req.url);
    console.log('🔥 Auth - Method:', req.method);
    console.log('🔥 Auth - Path param:', path);
    const targetPath = `/api/v1/auth/${path}`;
    console.log('🔥 Auth - Target path:', targetPath);
    return this.forwardToService('identity', targetPath, req, res, body, query, headers);
  }

  // Users routes (protected)
  @UseGuards(JwtAuthGuard)
  @All('users/*path')
  async forwardUsersRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('path') path: string,
  ) {
    return this.forwardToService('identity', `/api/v1/users/${path}`, req, res, body, query, headers);
  }

  // Posts routes (protected)
  @UseGuards(JwtAuthGuard)
  @All('posts/*path')
  async forwardPostsRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('path') path: string,
  ) {
    return this.forwardToService('posts', `/api/v1/posts/${path}`, req, res, body, query, headers);
  }

  // Messages routes (protected)
  @UseGuards(JwtAuthGuard)
  @All('messages/*path')
  async forwardMessagesRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('path') path: string,
  ) {
    return this.forwardToService('messages', `/api/messages/${path}`, req, res, body, query, headers);
  }

  // Search routes (protected)
  @UseGuards(JwtAuthGuard)
  @All('search/*path')
  async forwardSearchRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('path') path: string,
  ) {
    return this.forwardToService('search', `/search/${path}`, req, res, body, query, headers);
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