import {
  Controller,
  All,
  Post,
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

  // Auth routes (public) - Using specific HTTP methods
  @Public()
  @Post('auth/register')
  async forwardAuthRegister(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    console.log('🔥 Auth register request - Original URL:', req.url);
    console.log('🔥 Auth register - Method:', req.method);
    console.log('🔥 Auth register - Body:', body);
    return this.forwardToService('identity', '/api/v1/auth/register', req, res, body, query, headers);
  }

  @Public()
  @Post('auth/login')
  async forwardAuthLogin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
  ) {
    console.log('🔥 Auth login request - Original URL:', req.url);
    console.log('🔥 Auth login - Method:', req.method);
    console.log('🔥 Auth login - Body:', body);
    return this.forwardToService('identity', '/api/v1/auth/login', req, res, body, query, headers);
  }

  // Temporarily commented out wildcard route to test specific routes
  // @Public()
  // @All('auth/*path')
  // async forwardAuthRequest(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Body() body: any,
  //   @Query() query: any,
  //   @Headers() headers: any,
  //   @Param('0') path: string,
  // ) {
  //   console.log('🔥 Auth wildcard request - Original URL:', req.url);
  //   console.log('🔥 Auth wildcard - Path param:', path);
  //   const targetPath = `/api/v1/auth/${path}`;
  //   console.log('🔥 Auth wildcard - Target path:', targetPath);
  //   return this.forwardToService('identity', targetPath, req, res, body, query, headers);
  // }

  // Users routes (protected)
  @UseGuards(JwtAuthGuard)
  @All('users/*path')
  async forwardUsersRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any,
    @Query() query: any,
    @Headers() headers: any,
    @Param('0') path: string,
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
    @Param('0') path: string,
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
    @Param('0') path: string,
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
    @Param('0') path: string,
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