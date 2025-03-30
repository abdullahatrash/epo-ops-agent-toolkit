import {
  Client,
  DocdbModel,
  EpodocModel,
  Throttler,
} from 'typescript-epo-ops-client';
import fs from 'fs/promises';
import path from 'path';

// Image types and formats from your example
type ImageFormat = 'pdf' | 'tiff' | 'jpeg' | 'png';
type ImageType = 'fullimage' | 'thumbnail' | 'firstpage';

export class EPOError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'EPOError';
  }
}

export default class EPOAPI {
  private client: Client;

  constructor(key: string, secret: string, context: Record<string, any> = {}) {
    // Create client with throttling as you do in your example
    this.client = new Client({
      key,
      secret,
      middlewares: context.middlewares || [new Throttler()],
      acceptType: context.acceptType,
    });
  }

  async run(method: string, args: any): Promise<any> {
    try {
      const processedArgs = this.processArgs(method, args);

      switch (method) {
        case 'publishedDataSearch':
          return await this.client.publishedDataSearch(
            processedArgs.cql,
            processedArgs.rangeBegin,
            processedArgs.rangeEnd,
            processedArgs.constituents
          );

        case 'publishedData':
          return await this.client.publishedData(
            processedArgs.referenceType,
            processedArgs.input,
            processedArgs.endpoint,
            processedArgs.constituents
          );

        case 'family':
          return await this.client.family(
            processedArgs.referenceType,
            processedArgs.input,
            processedArgs.endpoint,
            processedArgs.constituents
          );

        case 'image':
          return await this.client.image(
            processedArgs.path,
            processedArgs.range,
            processedArgs.extension
          );

        case 'downloadImage':
          return await this.downloadImage(processedArgs);

        case 'number':
          return await this.client.number(
            processedArgs.referenceType,
            processedArgs.input,
            processedArgs.outputFormat
          );

        default:
          throw new EPOError(`Unknown method: ${method}`);
      }
    } catch (error: any) {
      if (error.name === 'IndividualQuotaPerHourExceeded') {
        throw new EPOError('Individual quota per hour exceeded', 403);
      } else if (error.name === 'RegisteredQuotaPerWeekExceeded') {
        throw new EPOError('Registered quota per week exceeded', 403);
      }
      throw new EPOError(error.message, error.statusCode, error.responseData);
    }
  }

  private processArgs(method: string, args: any): any {
    const processedArgs = {...args};

    // Convert string patent references to DocdbModel or EpodocModel
    if (
      ['publishedData', 'family', 'number'].includes(method) &&
      typeof args.input === 'string'
    ) {
      if (args.inputType === 'docdb') {
        const [countryCode, documentNumber, kindCode] = args.input.split('.');
        processedArgs.input = new DocdbModel(
          countryCode,
          documentNumber,
          kindCode
        );
      } else {
        processedArgs.input = new EpodocModel(args.input);
      }
    }

    return processedArgs;
  }

  // Implement the downloadImage function similar to your example
  private async downloadImage(options: {
    imagePath: string;
    format: ImageFormat;
    outputPath: string;
  }): Promise<any> {
    const {imagePath, format, outputPath} = options;

    // Extract path components
    const pathParts = imagePath.split('/');
    if (pathParts.length < 4) {
      throw new EPOError('Invalid image path format');
    }

    const countryCode = pathParts[0];
    const docNumber = pathParts[1];
    const kindCode = pathParts[2];
    const imageType = pathParts[3] as ImageType;

    // Use the client's image method to download
    const response = await this.client.image(
      `${countryCode}/${docNumber}/${kindCode}/${imageType}`,
      1,
      format.toLowerCase() as string
    );

    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputPath), {recursive: true});

    // Save the file
    await fs.writeFile(outputPath, response.data);

    return {
      success: true,
      path: outputPath,
      throttlingStatus: response.headers['x-throttling-control'],
      quotaUsage: {
        individual: response.headers['x-individualquotaperhour-used'],
        registered: response.headers['x-registeredquotaperweek-used'],
      },
    };
  }
}
