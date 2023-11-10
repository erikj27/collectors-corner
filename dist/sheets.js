export async function readFromNamedRangeWithHeader(sheets, spreadsheetId, range) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return (response.data.values || []).slice(1); // Exclude the header row
}
export async function writeToNamedRange(sheets, spreadsheetId, range, values) {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
            values,
        },
    });
}
/*
* This is skeleton for connecting to Google Sheets Api and writing directly to Sheets
* Would need a little work to get back up and running
*
    import { google, sheets_v4 } from 'googleapis';
    import { readFromNamedRangeWithHeader, writeToNamedRange } from './sheets';
    const serviceAccount: any = JSON.parse(process.env.GOOGLE_API_COLLECTORS_CORNER || '');
    const SHEETS_API_VERSION = 'v4';
    const SPREADSHEET_ID = '<add yours here>';
    const jwtClient = new google.auth.JWT(serviceAccount.client_email, undefined, serviceAccount.private_key, [
        'https://www.googleapis.com/auth/spreadsheets',
    ]);
    const sheets: sheets_v4.Sheets = google.sheets({ version: SHEETS_API_VERSION, auth: jwtClient });

    async function updateSheetsWithCollections(source: string, target: string, type: string) {
        try {
            const dataFromSheet = await readFromNamedRangeWithHeader(sheets, SPREADSHEET_ID, source);
            const parsedData: Collection[] = [];
            for (const row of dataFromSheet) {
                if (type === 'id') {
                    let result = await getCollectionsById(row[0]);
                    parsedData.push(result[0]);
                } else if (type === 'name') {
                    let result = await getCollectionsByName(row[0]);
                    parsedData.push(result[0]);
                }
            }
            const formattedData: any[][] = formatCollectionsForSheets(parsedData);
            await writeToNamedRange(sheets, SPREADSHEET_ID, target, formattedData);
            console.log('Data processed and written successfully!');
        } catch (error) {
            console.error('Error:', error);
        }
    }

    updateSheetsWithCollections('Main!collectionId', 'Main!E2', 'id');
    updateSheetsWithCollections('Main!name', 'Main!E2', 'name');
*
*/
