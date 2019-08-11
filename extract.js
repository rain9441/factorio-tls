const zlib = require('zlib');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const blueprintDirectory = './blueprints/**/*.bp';
const options = {};

glob(blueprintDirectory, options, (err, fileNames) => {
	if (err) {
		console.error(`Unable to find folder: ${blueprintDirectory}`, err);
		return;
	}

	fileNames.forEach((fileName) => {
		try {
			console.log(`Extracting blueprint from file: ${fileName}`);
			extractBlueprintFileToJson(fileName);
		} catch (err) {
			console.error('Unable to extract blueprint', err);
		}
	});
});

function extractBlueprintFileToJson(fileName) {
	const data = fs.readFileSync(fileName);

	if (!data || !data.length) {
		throw new Error('Invalid file or empty file');
	}

	if (data[0] !== 0x30) {
		throw new Error(`Unexpected character in position 1 ('${data[0].toString(16)}', expected 0x30)`);
	}

	const base64Content = data.slice(1).toString();
	const compressedContent = Buffer.from(base64Content, 'base64');
	const decompressedContent = zlib.inflateSync(compressedContent);
	const parsedObject = JSON.parse(decompressedContent);
	const jsonText = JSON.stringify(parsedObject, null, '    ');

	const filePath = path.parse(fileName); 
	const outputFileName = path.resolve(filePath.dir, `${filePath.name}.json`);

	fs.writeFileSync(outputFileName, jsonText);
}
