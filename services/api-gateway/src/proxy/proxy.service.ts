import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly serviceUrls: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrls = {
      identity: this.configService.get<string>('IDENTITY_SERVICE_URL') || 'http://localhost:3001',
      posts: this.configService.get<string>('POSTS_SERVICE_URL') || 'http://localhost:3002',
      messages: this.configService.get<string>('MESSAGES_SERVICE_URL') || 'http://localhost:3003',
      search: this.configService.get<string>('SEARCH_SERVICE_URL') || 'http://localhost:3004',
      realtime: this.configService.get<string>('REALTIME_SERVICE_URL') || 'http://localhost:3005',
    };
  }

  async forwardRequest(
    service: string,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
    query?: Record<string, any>,
  ): Promise<AxiosResponse> {
    const serviceUrl = this.serviceUrls[service];
    
    if (!serviceUrl) {
      throw new HttpException(
        `Service '${service}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const url = `${serviceUrl}${path}`;
    
    try {
      const config = {
        method: method.toLowerCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        ...(body && { data: body }),
        ...(query && { params: query }),
      };

      const response = await firstValueFrom(
        this.httpService.request(config)
      );
      
      return response;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data || 'Service error',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException(
        `Failed to connect to ${service} service`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  getServiceHealth(service: string): Promise<AxiosResponse> {
    return this.forwardRequest(service, '/health', 'GET');
  }
}