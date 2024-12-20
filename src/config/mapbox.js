// Importar los módulos de Mapbox
import mbxClient from '@mapbox/mapbox-sdk/index.js';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions.js';
import mbxStyles from '@mapbox/mapbox-sdk/services/styles.js';
import mbxTilesets from '@mapbox/mapbox-sdk/services/tilesets.js';

// Importar las variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Inicializar el cliente base de Mapbox con la API key
const baseClient = mbxClient({ accessToken: process.env.MAPBOX_API_KEY });

// Inicializar los servicios de Mapbox
const directionsService = mbxDirections(baseClient);
const stylesService = mbxStyles(baseClient);
const tilesetsService = mbxTilesets(baseClient);

export {
    directionsService,
    stylesService,
    tilesetsService
};