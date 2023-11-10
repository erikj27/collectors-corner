import 'dotenv/config';
import fetch, { Headers, RequestInit } from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection, CollectionsParams, FormattedCollectionData } from './types';
import ExcelJS from 'exceljs';

const baseApiUrl = 'https://api.reservoir.tools';
const collectionsApi = '/collections/v7';
const { RESERVOIR_API_KEY_COLLECTORS_CORNER } = process.env; // Add yours to .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const verboseLog = false;

const headers: Record<string, string> = {
    accept: '*/*',
    'X-API-KEY': RESERVOIR_API_KEY_COLLECTORS_CORNER || '',
};

const options: RequestInit = {
    method: 'GET',
    headers: new Headers(headers),
};

function readCollectionIds(): string[] {
    try {
        const filePath = path.join(__dirname, '../collectionIds.txt');
        const data = fs.readFileSync(filePath, 'utf-8');
        const collectionIds = data
            .split('\n')
            .filter(Boolean)
            .map((line) => {
                const [id] = line.split(' #'); // Remove anything after comments #
                return id.trim();
            });
        return collectionIds;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

async function getCollection(params: CollectionsParams): Promise<Collection> {
    try {
        const url = new URL(baseApiUrl + collectionsApi);

        (params.id || params.slug) && url.searchParams.append('includeSalesCount', 'true');

        Object.entries(params).forEach(([key, value]) => {
            value && url.searchParams.append(key, value.toString());
        });

        const response = await fetch(url, options);
        const data = (await response.json()) as { collections: Collection[] };
        return data.collections[0];
    } catch (error) {
        console.error(`Error fetching data: ${(error as Error).message}`);
        throw new Error(`Unable to fetch data: ${(error as Error).message}`);
    }
}

async function getManyCollections(collectionIds: string[]): Promise<Collection[]> {
    const batchSize = 10; // Number of concurrent requests to make
    let data: Collection[] = [];
    const queue = collectionIds.slice();
    const activePromises: Promise<void>[] = [];

    // Rate limiting helpers
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const isRateLimitError = (error: any) => {
        return error.statusCode === 429;
    };
    const getRetryAfterTime = (error: any) => {
        return error.headers['Retry-After'] * 1000 || 3000; // Defaults to 3 seconds
    };

    const processCollection = async (collectionId: string) => {
        try {
            let result = await getCollection({ id: collectionId });
            data.push(result);
        } catch (error) {
            if (isRateLimitError(error)) {
                console.error(`Rate limit reached, retrying...`);
                await delay(getRetryAfterTime(error));
                queue.push(collectionId);
            } else {
                console.error(`Error processing collection ${collectionId}:`, error);
            }
        }
    };

    const processNextCollection = async () => {
        if (queue.length > 0) {
            const collectionId = queue.shift();
            if (collectionId) {
                await processCollection(collectionId);
                verboseLog &&
                    console.log(
                        `Processed ${collectionId}` +
                            (queue.length ? ` ${queue.length} remaining. Adding to queue...` : '')
                    );
            }
            await processNextCollection();
        }
    };

    try {
        for (let i = 0; i < batchSize; i++) {
            activePromises.push(processNextCollection());
        }

        await Promise.all(activePromises);
        verboseLog && console.log('All collections processed');
        return data;
    } catch (error) {
        console.error('Error processing collections:', error);
        return [];
    }
}

function formatCollectionsForExport(data: Collection[]): FormattedCollectionData[] {
    return data.map((obj) => {
        const listedCount = obj.onSaleCount !== undefined ? parseInt(obj.onSaleCount) : 0;
        const tokenCount = parseInt(obj.tokenCount ?? 0);
        const ownerCount = obj.ownerCount ?? 0;

        return {
            Name: obj.name,
            OpenSeaLink: `https://opensea.io/collection/${obj.slug}`,
            ContractAddress: obj.primaryContract,
            CollectionId: obj.id,
            ListedCount: listedCount,
            ListedPct: listedCount / tokenCount,
            OwnerCount: ownerCount,
            OwnerPct: tokenCount / tokenCount,
            FloorAsk: obj.floorAsk.price?.amount.native,
            FloorAskUsd: obj.floorAsk.price?.amount.usd,
            TopBid: obj.topBid.price?.amount.native,
            TopBidUsd: obj.topBid.price?.amount.usd,
            Sales_1D: obj.salesCount?.['1day'] !== undefined ? parseInt(obj.salesCount['1day']) : 0,
            Sales_7D: obj.salesCount?.['7day'] !== undefined ? parseInt(obj.salesCount['7day']) : 0,
            Sales_30D: obj.salesCount?.['30day'] !== undefined ? parseInt(obj.salesCount['30day']) : 0,
            Sales_AllTime: obj.salesCount?.allTime !== undefined ? parseInt(obj.salesCount.allTime) : 0,
            Volume_1D: obj.volume['1day'],
            Volume_7D: obj.volume['7day'],
            Volume_30D: obj.volume['30day'],
            Volume_AllTime: obj.volume.allTime,
        };
    });
}

async function writeToExcel(data: FormattedCollectionData[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');
    const headers = data.length > 0 ? (Object.keys(data[0]) as (keyof FormattedCollectionData)[]) : [];
    sheet.addRow(headers);

    data.forEach((entry) => {
        sheet.addRow(Object.values(entry));
    });

    const date = new Date();
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date
        .getDate()
        .toString()
        .padStart(2, '0')}`;

    const directory = path.join(__dirname, '../output');
    const fileName = path.join(directory, `metrics-${formattedDate}.xlsx`);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    await workbook.xlsx.writeFile(fileName);
    console.log(`File is written successfully to ${fileName}`);
}

const collectionIds = readCollectionIds();
const collections = await getManyCollections(collectionIds);
// console.log(collections);
const formattedCollections = formatCollectionsForExport(collections);
// console.log(formattedCollections);
writeToExcel(formattedCollections);
