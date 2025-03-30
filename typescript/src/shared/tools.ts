import {z} from 'zod';
import type {Context} from './configuration';

const referenceTypeEnum = z.enum(['publication', 'application', 'priority']);
const inputTypeEnum = z.enum(['docdb', 'epodoc']);
const imageFormatEnum = z.enum(['pdf', 'tiff', 'jpeg', 'png']);

export type Tool = {
  method: string;
  name: string;
  description: string;
  parameters: z.ZodObject<any, any, any, any>;
  actions: {
    [key: string]: {
      [action: string]: boolean;
    };
  };
};

export default function tools(context: Context = {}): Tool[] {
  return [
    {
      method: 'publishedDataSearch',
      name: 'Search Published Patent Documents',
      description:
        'Search for published patent documents using CQL (Common Query Language) syntax to find patents matching specific criteria',
      parameters: z.object({
        cql: z
          .string()
          .describe(
            'CQL query string (e.g., "pa=IBM" for patents by IBM, "ti=computer" for patents with computer in the title)'
          ),
        rangeBegin: z
          .number()
          .default(1)
          .optional()
          .describe('Starting index of results to return (default: 1)'),
        rangeEnd: z
          .number()
          .default(25)
          .optional()
          .describe(
            'Ending index of results to return (default: 25, max: 100)'
          ),
        constituents: z
          .array(z.string())
          .optional()
          .describe('Optional data sections to include in the response'),
      }),
      actions: {
        search: {
          read: true,
        },
      },
    },
    {
      method: 'publishedData',
      name: 'Retrieve Patent Document Data',
      description:
        'Retrieve bibliographic data, claims, description, or images for a specific patent document',
      parameters: z.object({
        referenceType: referenceTypeEnum
          .default('publication')
          .describe(
            'Type of reference (publication, application, or priority)'
          ),
        input: z
          .string()
          .describe(
            'Patent reference (e.g., "EP.1000000.A1" for docdb format, "EP1000000" for epodoc format)'
          ),
        inputType: inputTypeEnum
          .default('docdb')
          .describe('Format of the input reference (docdb or epodoc)'),
        endpoint: z
          .string()
          .default('biblio')
          .describe('Data to retrieve: biblio, claims, description, or images'),
        constituents: z
          .array(z.string())
          .optional()
          .describe('Optional data sections to include in the response'),
      }),
      actions: {
        publishedData: {
          read: true,
        },
      },
    },
    {
      method: 'family',
      name: 'Retrieve Patent Family Information',
      description:
        'Retrieve patent family information to find related patents for a specific patent document',
      parameters: z.object({
        referenceType: referenceTypeEnum
          .default('publication')
          .describe(
            'Type of reference (publication, application, or priority)'
          ),
        input: z
          .string()
          .describe(
            'Patent reference (e.g., "EP.1000000.A1" for docdb format, "EP1000000" for epodoc format)'
          ),
        inputType: inputTypeEnum
          .default('docdb')
          .describe('Format of the input reference (docdb or epodoc)'),
        endpoint: z
          .string()
          .optional()
          .describe('Optional endpoint specification'),
        constituents: z
          .array(z.string())
          .optional()
          .describe('Optional data sections to include in the response'),
      }),
      actions: {
        family: {
          read: true,
        },
      },
    },
    {
      method: 'downloadImage',
      name: 'Download Patent Document Image',
      description:
        'Download a patent document image (full image, first page, or thumbnail) in various formats',
      parameters: z.object({
        imagePath: z
          .string()
          .describe(
            'Image path (e.g., "EP/1000000/A1/fullimage" - use country code, number, kind code, and image type)'
          ),
        format: imageFormatEnum
          .default('pdf')
          .describe('Image format to download (pdf, tiff, jpeg, or png)'),
        outputPath: z
          .string()
          .describe(
            'Path where to save the downloaded image (including filename and extension)'
          ),
      }),
      actions: {
        image: {
          download: true,
        },
      },
    },
    {
      method: 'number',
      name: 'Convert Patent Number Format',
      description:
        'Convert between different patent number formats (docdb and epodoc)',
      parameters: z.object({
        referenceType: referenceTypeEnum
          .default('publication')
          .describe(
            'Type of reference (publication, application, or priority)'
          ),
        input: z
          .string()
          .describe(
            'Patent reference (e.g., "EP.1000000.A1" for docdb format, "EP1000000" for epodoc format)'
          ),
        inputType: inputTypeEnum
          .default('docdb')
          .describe('Format of the input reference (docdb or epodoc)'),
        outputFormat: z
          .enum(['docdb', 'epodoc'])
          .default('epodoc')
          .describe('Format to convert to (docdb or epodoc)'),
      }),
      actions: {
        number: {
          read: true,
        },
      },
    },
  ];
}
