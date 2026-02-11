import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadResponse {
  id: string;
  url: string;
  variants: string[];
}

export interface SignedUploadResponse {
  uploadURL: string;
  id: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly deliveryUrl: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID') || '';
    this.apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN') || '';
    this.deliveryUrl = this.configService.get<string>('CLOUDFLARE_IMAGES_URL') 
      || 'https://imagedelivery.net';
  }

  /**
   * Get a signed upload URL for direct browser upload
   */
  async getSignedUploadUrl(metadata?: Record<string, string>): Promise<SignedUploadResponse> {
    if (!this.accountId || !this.apiToken) {
      // Development mode - return mock URL
      const mockId = `dev-${Date.now()}`;
      this.logger.warn('Cloudflare credentials not configured - using mock upload');
      return {
        uploadURL: `http://localhost:3001/media/mock-upload`,
        id: mockId,
      };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requireSignedURLs: false,
          metadata: metadata || {},
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      this.logger.error('Failed to get signed upload URL:', data.errors);
      throw new Error(data.errors?.[0]?.message || 'Failed to get upload URL');
    }

    return {
      uploadURL: data.result.uploadURL,
      id: data.result.id,
    };
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<void> {
    if (!this.accountId || !this.apiToken) {
      this.logger.warn('Cloudflare credentials not configured - skipping delete');
      return;
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      this.logger.error('Failed to delete image:', data.errors);
      throw new Error(data.errors?.[0]?.message || 'Failed to delete image');
    }

    this.logger.log(`Deleted image: ${imageId}`);
  }

  /**
   * Get the delivery URL for an image
   */
  getImageUrl(imageId: string, variant: string = 'public'): string {
    if (!this.accountId) {
      // Development mode - return placeholder
      return `https://placehold.co/400x400?text=${imageId}`;
    }
    
    return `${this.deliveryUrl}/${this.accountId}/${imageId}/${variant}`;
  }

  /**
   * List all images (for admin)
   */
  async listImages(page: number = 1, perPage: number = 20): Promise<any> {
    if (!this.accountId || !this.apiToken) {
      return { images: [], total: 0 };
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      this.logger.error('Failed to list images:', data.errors);
      throw new Error(data.errors?.[0]?.message || 'Failed to list images');
    }

    return {
      images: data.result.images,
      total: data.result_info?.total_count || 0,
    };
  }
}
